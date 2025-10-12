// Import the Annotation system from LangGraph for defining typed configuration schemas
import { Annotation } from '@langchain/langgraph';

// Import the type definition for RunnableConfig, used to configure runnable LangGraph nodes
import { RunnableConfig } from '@langchain/core/runnables';

// Import base configuration schema and helper to enforce that schema
import {
  BaseConfigurationAnnotation,     // Base fields shared across multiple configuration types
  ensureBaseConfiguration,         // Helper function to validate and return base configuration
} from '../shared/configuration.js';

// Default path to a sample documents file used for indexing
// These are typically JSON files containing LangChain/LangGraph docs for testing
const DEFAULT_DOCS_FILE = './src/sample_docs.json';

/**
 * The configuration schema for the indexing process.
 * This extends the BaseConfigurationAnnotation with additional indexing-specific options.
 */
export const IndexConfigurationAnnotation = Annotation.Root({
  // Spread base configuration schema into this config
  ...BaseConfigurationAnnotation.spec,

  /**
   * `docsFile`: Path to a JSON file containing default documents to index.
   * This allows the user to provide a custom file instead of using the default.
   */
  docsFile: Annotation<string>,

  /**
   * `useSampleDocs`: Whether or not to use the default/sample docs.
   * If true, the app uses predefined documentation (e.g., LangChain docs).
   */
  useSampleDocs: Annotation<boolean>,
});

/**
 * Creates a configuration state that conforms to the `IndexConfigurationAnnotation`.
 *
 * @param config - A `RunnableConfig` object, which may include custom parameters for configuration.
 * @returns A typed configuration object compatible with the LangGraph runtime.
 */
export function ensureIndexConfiguration(
  config: RunnableConfig,
): typeof IndexConfigurationAnnotation.State {
  // Extract the configurable part of the incoming config (if it exists)
  // Cast it to a partial IndexConfigurationAnnotation state type to allow optional access
  const configurable = (config?.configurable || {}) as Partial<
    typeof IndexConfigurationAnnotation.State
  >;

  // Get validated base configuration (e.g., shared fields like `project`, `verbose`, etc.)
  const baseConfig = ensureBaseConfiguration(config);

  // Return the final, validated configuration object
  return {
    ...baseConfig,
    docsFile: configurable.docsFile ?? DEFAULT_DOCS_FILE,
    useSampleDocs: configurable.useSampleDocs ?? false,
  };
}