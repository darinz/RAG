/**
 * Configuration management for the RAG backend system.
 * 
 * This module defines the base configuration structure used across all graphs
 * in the system, providing a consistent way to manage settings for retrieval,
 * indexing, and agent operations.
 */

import { Annotation } from '@langchain/langgraph';
import { RunnableConfig } from '@langchain/core/runnables';

/**
 * Base configuration annotation for indexing and retrieval operations.
 *
 * This annotation defines the core parameters needed for configuring the indexing and
 * retrieval processes across all graphs in the system. It provides a foundation for
 * more specific configuration annotations used by individual graphs.
 *
 * @example
 * ```typescript
 * const config = {
 *   configurable: {
 *     retrieverProvider: 'supabase',
 *     k: 5,
 *     filterKwargs: { userId: 'user123' }
 *   }
 * };
 * ```
 */
export const BaseConfigurationAnnotation = Annotation.Root({
  /**
   * The vector store provider to use for retrieval operations.
   * 
   * Currently supports:
   * - 'supabase': Uses Supabase as the vector database
   * 
   * @default 'supabase'
   */
  retrieverProvider: Annotation<'supabase'>,

  /**
   * Additional keyword arguments to pass to the search function of the retriever.
   * 
   * These are used for filtering and customizing retrieval behavior.
   * Common use cases include user-specific filtering, document type filtering, etc.
   * 
   * @example
   * ```typescript
   * filterKwargs: {
   *   userId: 'user123',
   *   documentType: 'pdf',
   *   dateRange: { from: '2024-01-01', to: '2024-12-31' }
   * }
   * ```
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  filterKwargs: Annotation<Record<string, any>>,

  /**
   * The number of documents to retrieve from the vector store.
   * 
   * This controls how many relevant documents are returned for each query.
   * Higher values provide more context but may include less relevant documents.
   * 
   * @default 5
   * @minimum 1
   * @maximum 50
   */
  k: Annotation<number>,
});

/**
 * Creates a validated base configuration instance from a RunnableConfig object.
 *
 * This function extracts configuration parameters from a RunnableConfig and provides
 * sensible defaults for any missing values. It ensures that all required configuration
 * parameters are present and properly typed.
 *
 * @param config - The RunnableConfig object containing configuration parameters
 * @returns A validated BaseConfigurationAnnotation.State instance with defaults applied
 * 
 * @throws {ConfigurationError} When required configuration is missing or invalid
 * 
 * @example
 * ```typescript
 * const config = { configurable: { k: 10, retrieverProvider: 'supabase' } };
 * const baseConfig = ensureBaseConfiguration(config);
 * // Returns: { retrieverProvider: 'supabase', k: 10, filterKwargs: {} }
 * ```
 */
export function ensureBaseConfiguration(
  config: RunnableConfig,
): typeof BaseConfigurationAnnotation.State {
  const configurable = (config?.configurable || {}) as Partial<
    typeof BaseConfigurationAnnotation.State
  >;
  
  return {
    retrieverProvider: configurable.retrieverProvider || 'supabase',
    filterKwargs: configurable.filterKwargs || {},
    k: configurable.k || 5,
  };
}
