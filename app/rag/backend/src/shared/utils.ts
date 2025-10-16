import { BaseChatModel } from '@langchain/core/language_models/chat_models';
import { initChatModel } from 'langchain/chat_models/universal';
import { ModelError, ValidationError } from './errors.js';
import { ModelCache } from './cache.js';

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
 * Load a chat model from a fully specified name.
 * @param fullySpecifiedName - String in the format 'provider/model' or 'provider/account/provider/model'.
 * @returns A Promise that resolves to a BaseChatModel instance.
 */
export async function loadChatModel(
  fullySpecifiedName: string,
  temperature: number = 0.2,
): Promise<BaseChatModel> {
  // Input validation
  if (!fullySpecifiedName || typeof fullySpecifiedName !== 'string') {
    throw new ValidationError('Model name must be a non-empty string', 'fullySpecifiedName');
  }
  
  if (temperature < 0 || temperature > 2) {
    throw new ValidationError('Temperature must be between 0 and 2', 'temperature');
  }

  // Create cache key
  const cacheKey = `${fullySpecifiedName}_${temperature}`;

  // Try to get from cache first
  return await ModelCache.getOrLoad(cacheKey, async () => {
    try {
      const index = fullySpecifiedName.indexOf('/');
      if (index === -1) {
        // If there's no "/", assume it's just the model
        if (
          !SUPPORTED_PROVIDERS.includes(
            fullySpecifiedName as (typeof SUPPORTED_PROVIDERS)[number],
          )
        ) {
          throw new ModelError(`Unsupported model: ${fullySpecifiedName}`, fullySpecifiedName);
        }
        return await initChatModel(fullySpecifiedName, {
          temperature: temperature,
        });
      } else {
        const provider = fullySpecifiedName.slice(0, index);
        const model = fullySpecifiedName.slice(index + 1);
        if (
          !SUPPORTED_PROVIDERS.includes(
            provider as (typeof SUPPORTED_PROVIDERS)[number],
          )
        ) {
          throw new ModelError(`Unsupported provider: ${provider}`, provider);
        }
        return await initChatModel(model, {
          modelProvider: provider,
          temperature: temperature,
        });
      }
    } catch (error) {
      if (error instanceof ModelError || error instanceof ValidationError) {
        throw error;
      }
      throw new ModelError(`Failed to load model: ${error instanceof Error ? error.message : 'Unknown error'}`, fullySpecifiedName);
    }
  });
}
