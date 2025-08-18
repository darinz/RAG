// Import ChatPromptTemplate from LangChain core prompts.
// This is used to construct structured message sequences for chat models.
import { ChatPromptTemplate } from '@langchain/core/prompts';

/**
 * ROUTER_SYSTEM_PROMPT
 *
 * This prompt instructs the LLM to act as a router. Its job is to decide
 * whether a user's query requires retrieving external documents (via a retriever)
 * or if it can be answered directly using the model’s built-in knowledge.
 *
 * The system message defines how the assistant should behave.
 * The human message is dynamically filled in with the user's actual query.
 */
const ROUTER_SYSTEM_PROMPT = ChatPromptTemplate.fromMessages([
  [
    // System role: defines the assistant's behavior
    'system',
    `You are a routing assistant. Your job is to determine if a question needs document retrieval or can be answered directly.

Respond with either:
'retrieve' - if the question requires retrieving documents
'direct' - if the question can be answered directly AND your direct answer`,
  ],
  [
    // Human role: user's input, injected dynamically
    'human',
    '{query}', // Placeholder for the user's actual query
  ],
]);

/**
 * RESPONSE_SYSTEM_PROMPT
 *
 * This prompt is used after documents are retrieved. It instructs the LLM
 * to use those documents as context to answer the user's question.
 *
 * The system message embeds two placeholders:
 * - {question}: the original query
 * - {context}: the documents retrieved earlier, formatted as context
 *
 * The prompt emphasizes:
 * - Not making up answers
 * - Being concise (3 sentences max)
 */
const RESPONSE_SYSTEM_PROMPT = ChatPromptTemplate.fromMessages([
  [
    // System message to control how the assistant answers based on retrieved docs
    'system',
    `You are an assistant for question-answering tasks. Use the following pieces of retrieved context to answer the question. 
If you don't know the answer, just say that you don't know. Use three sentences maximum and keep the answer concise.

question:
{question}

context:
{context}
`,
  ],
]);

// Export both prompts so they can be used in the LangGraph nodes
export { ROUTER_SYSTEM_PROMPT, RESPONSE_SYSTEM_PROMPT };