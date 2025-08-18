// Import the Annotation system from LangGraph — used to define structured configuration/state
import { Annotation } from '@langchain/langgraph';

// Type definition for the configuration object passed into LangChain runnables
import { RunnableConfig } from '@langchain/core/runnables';

// Import shared base configuration annotation and helper to apply defaults
import {
  BaseConfigurationAnnotation,   // Provides common configuration fields (e.g. projectId, apiKey)
  ensureBaseConfiguration,       // Helper to normalize a base config from input
} from '../shared/configuration.js';

/**
 * Defines the configuration schema for the agent in the graph.
 * 
 * This includes:
 * - Inherited shared/base config fields
 * - A required `queryModel` string to specify the LLM used for query handling
 */
export const AgentConfigurationAnnotation = Annotation.Root({
  // Spread the base configuration fields first (e.g. project ID, API key)
  ...BaseConfigurationAnnotation.spec,

  /**
   * queryModel:
   * The language model to be used by the agent for query understanding.
   * Format: "provider/model-name", e.g., "openai/gpt-4o" or "anthropic/claude-3".
   */
  queryModel: Annotation<string>, // Defines a required string field in the configuration
});

/**
 * This function ensures that a given `RunnableConfig` object is normalized
 * and returns a fully populated agent configuration state object.
 *
 * @param config - The incoming configuration object (could be partial/incomplete).
 * @returns A strongly typed and validated configuration object.
 */
export function ensureAgentConfiguration(
  config: RunnableConfig,
): typeof AgentConfigurationAnnotation.State {
  // Extract the user-provided configuration values (could be empty or partial)
  const configurable = (config?.configurable || {}) as Partial<
    typeof AgentConfigurationAnnotation.State
  >;

  // Apply default values for base fields like project ID, tracing, etc.
  const baseConfig = ensureBaseConfiguration(config);

  // Return the complete agent config, with a default query model if none is provided
  return {
    ...baseConfig,
    queryModel: configurable.queryModel || 'openai/gpt-4o', // Fallback to GPT-4o
  };
}