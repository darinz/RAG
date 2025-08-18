// Import the base interface for chat models from LangChain core
import { BaseChatModel } from '@langchain/core/language_models/chat_models';

// Import the universal chat model initializer which supports multiple providers
import { initChatModel } from 'langchain/chat_models/universal';

// Define a list of supported model providers.
// `as const` ensures these are treated as literal string types.
const SUPPORTED_PROVIDERS = [
  'openai',
  'anthropic',
  'azure_openai',
  'cohere',
  'google-vertexai',
  'google-vertexai-web',
  'google-genai',
  'ollama',
  'together',
  'fireworks',
  'mistralai',
  'groq',
  'bedrock',
  'cerebras',
  'deepseek',
  'xai',
] as const;

/**
 * Dynamically loads and initializes a chat model based on a provider/model string.
 * 
 * @param fullySpecifiedName - A string in one of the following formats:
 *   - 'provider/model' (e.g. 'openai/gpt-4')
 *   - 'provider' (e.g. just 'openai') if default model or configuration is inferred
 * @param temperature - (Optional) The sampling temperature for the model's responses; default is 0.2
 * @returns A Promise that resolves to an instance of `BaseChatModel`
 */
export async function loadChatModel(
  fullySpecifiedName: string,
  temperature: number = 0.2, // default to deterministic responses
): Promise<BaseChatModel> {
  // Look for the first slash to separate provider from model name
  const index = fullySpecifiedName.indexOf('/');

  if (index === -1) {
    // If no slash is found, assume the entire string is just a provider name

    // Validate the provider is supported
    if (
      !SUPPORTED_PROVIDERS.includes(
        fullySpecifiedName as (typeof SUPPORTED_PROVIDERS)[number],
      )
    ) {
      throw new Error(`Unsupported model: ${fullySpecifiedName}`);
    }

    // Initialize and return the chat model using default settings for this provider
    return await initChatModel(fullySpecifiedName, {
      temperature: temperature,
    });
  } else {
    // Split the string into provider and model name
    const provider = fullySpecifiedName.slice(0, index);
    const model = fullySpecifiedName.slice(index + 1);

    // Validate the extracted provider
    if (
      !SUPPORTED_PROVIDERS.includes(
        provider as (typeof SUPPORTED_PROVIDERS)[number],
      )
    ) {
      throw new Error(`Unsupported provider: ${provider}`);
    }

    // Initialize the chat model with both provider and model name
    return await initChatModel(model, {
      modelProvider: provider,
      temperature: temperature,
    });
  }
}