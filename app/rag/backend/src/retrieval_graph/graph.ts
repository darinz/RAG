import { StateGraph, START, END } from '@langchain/langgraph';
import { AgentStateAnnotation } from './state.js';
import { makeRetriever } from '../shared/retrieval.js';
import { formatDocs } from './utils.js';
import { HumanMessage } from '@langchain/core/messages';
import { RESPONSE_SYSTEM_PROMPT, ROUTER_SYSTEM_PROMPT } from './prompts.js';
import { RunnableConfig } from '@langchain/core/runnables';
import {
  AgentConfigurationAnnotation,
  ensureAgentConfiguration,
} from './configuration.js';
import { loadChatModel } from '../shared/utils.js';
import { createLogger } from '../shared/logger.js';
import { Sanitizer, RateLimiter } from '../shared/validation.js';
import { ValidationError } from '../shared/errors.js';
import { DocumentCache } from '../shared/cache.js';

async function checkQueryType(
  state: typeof AgentStateAnnotation.State,
  config: RunnableConfig,
): Promise<typeof AgentStateAnnotation.Update> {
  const logger = createLogger('retrieval-graph');
  const startTime = Date.now();
  
  try {
    // Validate and sanitize the query
    const sanitizedQuery = Sanitizer.validateAndSanitizeQuery(state.query);
    
    // Check rate limiting
    const clientId = config?.configurable?.clientId || 'anonymous';
    if (!RateLimiter.checkLimit(clientId)) {
      throw new ValidationError('Rate limit exceeded', 'query');
    }
    
    logger.info('Starting query type check', { query: sanitizedQuery.substring(0, 100) });
    
    const configuration = ensureAgentConfiguration(config);
    logger.logModelLoad(configuration.queryModel);
    const model = await loadChatModel(configuration.queryModel);

    const routingPrompt = ROUTER_SYSTEM_PROMPT;

    const formattedPrompt = await routingPrompt.invoke({
      query: sanitizedQuery,
    });

    // Use simple text output instead of structured output to avoid message coercion issues
    const response = await model.invoke(formattedPrompt.toString());
    const responseText = response.content as string;
    
    // Parse the response to determine route - be conservative and favor retrieval
    let route: 'retrieve' | 'direct' = 'retrieve'; // default to retrieve (preferred for RAG)
    const lowerResponse = responseText.toLowerCase().trim();
    const agentConfig = ensureAgentConfiguration(config);
    const retrievalBias = agentConfig.retrievalBias || 0.8;
    
    // Apply retrieval bias - higher bias means more likely to retrieve
    const shouldRetrieve = lowerResponse === 'retrieve' || 
                          (lowerResponse.includes('retrieve') && !lowerResponse.includes('direct')) ||
                          (retrievalBias > 0.5 && !lowerResponse.includes('direct'));
    
    // Only route to 'direct' if the response is clearly 'direct' AND retrieval bias is low
    if (lowerResponse === 'direct' && retrievalBias < 0.7) {
      route = 'direct';
    } else if (shouldRetrieve) {
      route = 'retrieve';
    }
    
    // Log the decision reasoning
    logger.debug('Route decision', { 
      responseText: responseText.substring(0, 50), 
      lowerResponse, 
      route,
      retrievalBias,
      reasoning: route === 'direct' ? 
        'Simple response detected with low retrieval bias' : 
        'Using retrieval for document context (bias: ' + retrievalBias + ')'
    });
    
    const duration = Date.now() - startTime;
    
    logger.logGraphExecution('retrieval-graph', 'checkQueryType', duration);
    logger.info('Query type determined', { 
      route, 
      duration, 
      responseText: responseText.substring(0, 100),
      retrievalBias,
      finalDecision: `Routing to ${route} based on response: "${responseText.substring(0, 50)}"`
    });

    // Only return the route, not the full response object
    const result = { route };
    logger.debug('Returning from checkQueryType', { result });
    return result;
  } catch (error) {
    logger.logError('checkQueryType', error as Error, { query: state.query });
    throw error;
  }
}

async function answerQueryDirectly(
  state: typeof AgentStateAnnotation.State,
  config: RunnableConfig,
): Promise<typeof AgentStateAnnotation.Update> {
  const logger = createLogger('retrieval-graph');
  const startTime = Date.now();
  
  try {
    logger.info('Answering query directly', { query: state.query.substring(0, 100) });
    
    const configuration = ensureAgentConfiguration(config);
    logger.logModelLoad(configuration.queryModel);
    const model = await loadChatModel(configuration.queryModel);
    const userHumanMessage = new HumanMessage(state.query);

    const response = await model.invoke([userHumanMessage]);
    
    const duration = Date.now() - startTime;
    logger.logGraphExecution('retrieval-graph', 'answerQueryDirectly', duration);
    logger.info('Direct answer generated', { duration });
    
    return { messages: [userHumanMessage, response] };
  } catch (error) {
    logger.logError('answerQueryDirectly', error as Error, { query: state.query });
    throw error;
  }
}

async function routeQuery(
  state: typeof AgentStateAnnotation.State,
): Promise<'retrieveDocuments' | 'directAnswer'> {
  const route = state.route;
  if (!route) {
    throw new Error('Route is not set');
  }

  if (route === 'retrieve') {
    return 'retrieveDocuments';
  } else if (route === 'direct') {
    return 'directAnswer';
  } else {
    throw new Error('Invalid route');
  }
}

async function retrieveDocuments(
  state: typeof AgentStateAnnotation.State,
  config: RunnableConfig,
): Promise<typeof AgentStateAnnotation.Update> {
  const logger = createLogger('retrieval-graph');
  const startTime = Date.now();
  
  try {
    logger.info('Starting document retrieval', { query: state.query.substring(0, 100) });
    
    // Check cache first
    const cachedDocs = DocumentCache.getCachedDocuments(state.query);
    if (cachedDocs) {
      logger.info('Using cached documents', { count: cachedDocs.length });
      return { documents: cachedDocs };
    }
    
    logger.info('No cached documents found, retrieving from vector store', { query: state.query.substring(0, 100) });
    
    let response;
    try {
      const retriever = await makeRetriever(config);
      logger.info('Retriever created successfully', { query: state.query.substring(0, 100) });
      
      response = await retriever.invoke(state.query);
      
      // Log document details for debugging
      logger.info('Documents retrieved from vector store', { 
        count: response.length,
        query: state.query,
        documentSnippets: response.map(doc => ({
          content: doc.pageContent.substring(0, 100) + '...',
          metadata: doc.metadata
        }))
      });
      
      if (response.length === 0) {
        logger.warn('No documents found in vector store for query', { 
          query: state.query,
          suggestion: 'Check if documents are properly indexed in Supabase'
        });
        
        // Try a more general query to see if there are any documents at all
        logger.info('Attempting fallback retrieval with more general terms');
        try {
          const fallbackQuery = state.query.split(' ').slice(0, 2).join(' '); // Use first 2 words
          const fallbackResponse = await retriever.invoke(fallbackQuery);
          if (fallbackResponse.length > 0) {
            logger.info('Fallback retrieval found documents', { count: fallbackResponse.length });
            response = fallbackResponse;
          }
        } catch (fallbackError) {
          logger.error('Fallback retrieval also failed', fallbackError as Error);
        }
      }
      
    } catch (retrievalError) {
      logger.error('Retrieval failed', retrievalError as Error, { query: state.query });
      throw retrievalError;
    }
    
    // Cache the results
    DocumentCache.setCachedDocuments(state.query, response);
    
    const duration = Date.now() - startTime;
    logger.logRetrieval(state.query, response.length, duration);
    logger.logGraphExecution('retrieval-graph', 'retrieveDocuments', duration);

    return { documents: response };
  } catch (error) {
    logger.logError('retrieveDocuments', error as Error, { query: state.query });
    throw error;
  }
}

async function generateResponse(
  state: typeof AgentStateAnnotation.State,
  config: RunnableConfig,
): Promise<typeof AgentStateAnnotation.Update> {
  const logger = createLogger('retrieval-graph');
  const startTime = Date.now();
  
  try {
    logger.info('Starting response generation', { 
      query: state.query.substring(0, 100),
      documentCount: state.documents?.length || 0 
    });
    
    // Log document details for debugging
    if (state.documents && state.documents.length > 0) {
      logger.info('Using retrieved documents for response generation', {
        documentCount: state.documents.length,
        documentSources: state.documents.map(doc => doc.metadata?.source || 'unknown'),
        totalContentLength: state.documents.reduce((sum, doc) => sum + doc.pageContent.length, 0)
      });
    } else {
      logger.warn('No documents available for response generation', { 
        query: state.query,
        suggestion: 'This may indicate that no documents are indexed in the vector store'
      });
    }
    
    const configuration = ensureAgentConfiguration(config);
    const context = formatDocs(state.documents);
    logger.logModelLoad(configuration.queryModel);
    const model = await loadChatModel(configuration.queryModel);
    const promptTemplate = RESPONSE_SYSTEM_PROMPT;

    const formattedPrompt = await promptTemplate.invoke({
      question: state.query,
      context: context,
    });

    const userHumanMessage = new HumanMessage(state.query);

    // Create a human message with the formatted prompt that includes context
    const formattedPromptMessage = new HumanMessage(formattedPrompt.toString());

    const messageHistory = [...state.messages, formattedPromptMessage];

    // Let MessagesAnnotation handle the message history
    const response = await model.invoke(messageHistory);
    
    const duration = Date.now() - startTime;
    logger.logGraphExecution('retrieval-graph', 'generateResponse', duration);
    logger.info('Response generated successfully', { duration });

    // Return both the current query and the AI response to be handled by MessagesAnnotation's reducer
    return { messages: [userHumanMessage, response] };
  } catch (error) {
    logger.logError('generateResponse', error as Error, { query: state.query });
    throw error;
  }
}

const builder = new StateGraph(
  AgentStateAnnotation,
  AgentConfigurationAnnotation,
)
  .addNode('retrieveDocuments', retrieveDocuments)
  .addNode('generateResponse', generateResponse)
  .addNode('checkQueryType', checkQueryType)
  .addNode('directAnswer', answerQueryDirectly)
  .addEdge(START, 'checkQueryType')
  .addConditionalEdges('checkQueryType', routeQuery, [
    'retrieveDocuments',
    'directAnswer',
  ])
  .addEdge('retrieveDocuments', 'generateResponse')
  .addEdge('generateResponse', END)
  .addEdge('directAnswer', END);

export const graph = builder.compile().withConfig({
  runName: 'RetrievalGraph',
});
