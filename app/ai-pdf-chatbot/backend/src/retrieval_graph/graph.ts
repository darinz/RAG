// Import core graph functionality from LangGraph
import { StateGraph, START, END } from '@langchain/langgraph';

// Import the annotation that defines the structure of the agent’s state
import { AgentStateAnnotation } from './state.js';

// Function to initialize a retriever (e.g., vector store retriever)
import { makeRetriever } from '../shared/retrieval.js';

// Utility to format retrieved documents for prompt injection
import { formatDocs } from './utils.js';

// HumanMessage represents user input in LangChain’s message system
import { HumanMessage } from '@langchain/core/messages';

// Zod is used for schema validation of structured output
import { z } from 'zod';

// System prompt templates used for routing and response generation
import { RESPONSE_SYSTEM_PROMPT, ROUTER_SYSTEM_PROMPT } from './prompts.js';

// LangChain's configuration type for defining runtime parameters
import { RunnableConfig } from '@langchain/core/runnables';

// Annotation and config helper for agent-specific settings (e.g., model)
import {
  AgentConfigurationAnnotation,
  ensureAgentConfiguration,
} from './configuration.js';

// Utility to load an LLM from a config (e.g., OpenAI, Anthropic, etc.)
import { loadChatModel } from '../shared/utils.js';

/**
 * Node: Determines whether a question should be answered directly
 * or requires document retrieval.
 */
async function checkQueryType(
  state: typeof AgentStateAnnotation.State,
  config: RunnableConfig,
): Promise<{
  route: 'retrieve' | 'direct';
}> {
  // Schema that defines valid output structure for routing
  const schema = z.object({
    route: z.enum(['retrieve', 'direct']), // routing decision
    directAnswer: z.string().optional(),   // optional short answer (not used here)
  });

  // Normalize agent config (e.g., model settings)
  const configuration = ensureAgentConfiguration(config);

  // Load the chat model based on config (e.g., GPT-4o)
  const model = await loadChatModel(configuration.queryModel);

  // Prepare the routing system prompt
  const routingPrompt = ROUTER_SYSTEM_PROMPT;

  // Generate the prompt string using current query
  const formattedPrompt = await routingPrompt.invoke({
    query: state.query,
  });

  // Invoke the model with a structured output parser
  const response = await model
    .withStructuredOutput(schema)
    .invoke(formattedPrompt.toString());

  // Extract the chosen route
  const route = response.route;

  return { route };
}

/**
 * Node: Directly answers the user’s query using the model (no retrieval).
 */
async function answerQueryDirectly(
  state: typeof AgentStateAnnotation.State,
  config: RunnableConfig,
): Promise<typeof AgentStateAnnotation.Update> {
  const configuration = ensureAgentConfiguration(config);
  const model = await loadChatModel(configuration.queryModel);
  const userHumanMessage = new HumanMessage(state.query);

  const response = await model.invoke([userHumanMessage]);

  // Return the user message and response to be added to the state
  return { messages: [userHumanMessage, response] };
}

/**
 * Router: Determines the next node based on `route` in state.
 */
async function routeQuery(
  state: typeof AgentStateAnnotation.State,
): Promise<'retrieveDocuments' | 'directAnswer'> {
  const route = state.route;

  if (!route) {
    throw new Error('Route is not set');
  }

  // Determine next node based on route
  if (route === 'retrieve') {
    return 'retrieveDocuments';
  } else if (route === 'direct') {
    return 'directAnswer';
  } else {
    throw new Error('Invalid route');
  }
}

/**
 * Node: Retrieves documents relevant to the query using a retriever.
 */
async function retrieveDocuments(
  state: typeof AgentStateAnnotation.State,
  config: RunnableConfig,
): Promise<typeof AgentStateAnnotation.Update> {
  const retriever = await makeRetriever(config);
  const response = await retriever.invoke(state.query);

  // Add retrieved docs to the state
  return { documents: response };
}

/**
 * Node: Generates a final answer using context and user query.
 */
async function generateResponse(
  state: typeof AgentStateAnnotation.State,
  config: RunnableConfig,
): Promise<typeof AgentStateAnnotation.Update> {
  const configuration = ensureAgentConfiguration(config);
  const context = formatDocs(state.documents); // Combine docs into prompt format
  const model = await loadChatModel(configuration.queryModel);
  const promptTemplate = RESPONSE_SYSTEM_PROMPT;

  // Fill in the response prompt with context and question
  const formattedPrompt = await promptTemplate.invoke({
    question: state.query,
    context: context,
  });

  const userHumanMessage = new HumanMessage(state.query);
  const formattedPromptMessage = new HumanMessage(formattedPrompt.toString());

  // Create message history (including system prompt with docs)
  const messageHistory = [...state.messages, formattedPromptMessage];

  // Invoke the model with history
  const response = await model.invoke(messageHistory);

  // Return new message pair to be tracked in state
  return { messages: [userHumanMessage, response] };
}

// Build the LangGraph using a fluent API
const builder = new StateGraph(
  AgentStateAnnotation,            // Define state shape
  AgentConfigurationAnnotation     // Define config shape
)
  // Add all processing nodes
  .addNode('retrieveDocuments', retrieveDocuments)
  .addNode('generateResponse', generateResponse)
  .addNode('checkQueryType', checkQueryType)
  .addNode('directAnswer', answerQueryDirectly)

  // Define start of the graph
  .addEdge(START, 'checkQueryType')

  // Branch to either retrieval or direct answer based on routing logic
  .addConditionalEdges('checkQueryType', routeQuery, [
    'retrieveDocuments',
    'directAnswer',
  ])

  // Retrieval path: first fetch docs, then generate response
  .addEdge('retrieveDocuments', 'generateResponse')

  // Both paths end the graph after response is generated
  .addEdge('generateResponse', END)
  .addEdge('directAnswer', END);

// Compile the graph so it can be executed or deployed
export const graph = builder.compile().withConfig({
  runName: 'RetrievalGraph', // Name used for tracing/debugging
});