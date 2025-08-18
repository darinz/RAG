// Import the Annotation system from LangGraph, used to define structured graph state
import { Annotation } from '@langchain/langgraph';

// Import the `Document` type used by LangChain to represent text chunks with metadata
import { Document } from '@langchain/core/documents';

// Import a reducer function used to normalize and merge document inputs
import { reduceDocs } from '../shared/state.js';

/**
 * Defines the shared state for document indexing and retrieval.
 * This state is used in a LangGraph pipeline where agents can add documents,
 * index them into a retriever, or retrieve documents from an index.
 */
export const IndexStateAnnotation = Annotation.Root({
  /**
   * `docs`: A list of documents available for indexing or retrieval.
   * 
   * - **Type**: Array of LangChain `Document` objects.
   * - **Accepted Inputs**:
   *   - `Document[]`: Properly structured LangChain documents.
   *   - `Record<string, any>[]`: Raw JSON objects that will be converted to documents.
   *   - `string[]` or `string`: Raw strings that will be wrapped in `Document` format.
   *   - `'delete'`: Special flag to remove the field from state after processing.
   *
   * - **default**: An empty array. This means no documents unless explicitly added.
   * - **reducer**: `reduceDocs` is a function that merges new documents into the existing state
   *   in a normalized way (e.g., deduplicating or formatting raw input).
   */
  docs: Annotation<
    Document[],                                         // The internal (typed) format used in state
    Document[] | { [key: string]: any }[]              // Accepts various external formats
    | string[] | string | 'delete'                     // Including strings and a delete flag
  >({
    default: () => [],                                 // By default, docs is an empty array
    reducer: reduceDocs,                               // Defines how new values are merged
  }),
});

/**
 * A TypeScript type alias for the state object generated from the annotation.
 * This helps with type safety when accessing or modifying state in graph nodes.
 */
export type IndexStateType = typeof IndexStateAnnotation.State;