// Import Annotation system from LangGraph, used to define structured state types.
// MessagesAnnotation provides built-in support for storing and updating chat messages.
import { Annotation, MessagesAnnotation } from '@langchain/langgraph';

// Import reducer function that standardizes or merges document arrays.
import { reduceDocs } from '../shared/state.js';

// Import the Document type used to represent text documents (with metadata, etc.)
import { Document } from '@langchain/core/documents';

/**
 * Represents the full state of the retrieval graph agent.
 *
 * This state object is passed between nodes in the LangGraph.
 * It holds the current query, any messages, the chosen route, and retrieved documents.
 */
export const AgentStateAnnotation = Annotation.Root({
  /**
   * The user’s input query.
   * This will be the main input that drives how the graph responds.
   */
  query: Annotation<string>(),

  /**
   * The routing decision result — tells the graph whether to
   * retrieve documents or answer directly.
   * This is set by the router node and read by the graph router.
   */
  route: Annotation<string>(),

  /**
   * Messages history support using LangGraph’s built-in MessagesAnnotation.
   * Includes fields like `messages`, which store conversation turns
   * and can be automatically updated with a reducer.
   */
  ...MessagesAnnotation.spec,

  /**
   * The documents retrieved (if any) that the agent can reference when answering.
   *
   * These are added by the retriever node and consumed by the response generation node.
   * The annotation allows for several possible input formats:
   *  - An array of LangChain `Document` objects
   *  - Arrays of plain objects or strings (as input)
   *  - A string (serialized docs), or a special command `'delete'` to clear docs
   */
  documents: Annotation<
    Document[],
    Document[] | { [key: string]: any }[] | string[] | string | 'delete'
  >({
    default: () => [],         // Start with no documents
    reducer: reduceDocs,       // Apply reducer when new docs are added (merges or processes them)
  }),

  /**
   * More fields can be added to the agent state as needed.
   * This extensible structure lets you pass and track anything through the graph.
   */
});