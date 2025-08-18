/**
 * Define the configurable parameters for the agent.
 */

import { Annotation } from '@langchain/langgraph'; // Import LangGraph's annotation utility
import { RunnableConfig } from '@langchain/core/runnables'; // Import config type for LangChain runnables

/**
 * typeof BaseConfigurationAnnotation.State class for indexing and retrieval operations.
 *
 * This annotation defines the configurable parameters required for the agent to retrieve documents,
 * including retriever backend, filtering options, and how many documents to fetch.
 */
export const BaseConfigurationAnnotation = Annotation.Root({
  /**
   * The vector store provider to use for retrieval.
   * Currently supports 'supabase', but additional providers can be added and handled in custom retriever logic.
   */
  retrieverProvider: Annotation<'supabase'>,

  /**
   * Optional filtering parameters passed to the retriever’s search method.
   * This allows fine-tuned searches using metadata filters or other criteria.
   * Example: { author: "Einstein", year: 1915 }
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  filterKwargs: Annotation<Record<string, any>>,

  /**
   * The number of top documents to retrieve during search.
   * Default is 5 if not explicitly provided.
   */
  k: Annotation<number>,
});

/**
 * Ensures that a complete and valid configuration object is created,
 * using either provided values or sensible defaults.
 *
 * @param config - The LangChain runnable configuration input.
 * @returns A fully initialized BaseConfigurationAnnotation.State object.
 */
export function ensureBaseConfiguration(
  config: RunnableConfig,
): typeof BaseConfigurationAnnotation.State {
  // Extract the `configurable` sub-object from config, or default to an empty object
  const configurable = (config?.configurable || {}) as Partial<
    typeof BaseConfigurationAnnotation.State
  >;

  // Return a configuration object, filling in defaults where necessary
  return {
    retrieverProvider: configurable.retrieverProvider || 'supabase', // default provider
    filterKwargs: configurable.filterKwargs || {},                  // default: no filters
    k: configurable.k || 5,                                         // default: retrieve top 5 documents
  };
}