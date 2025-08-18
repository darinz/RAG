// Import necessary classes and functions for working with vector stores and embeddings
import { VectorStoreRetriever } from '@langchain/core/vectorstores';
import { OpenAIEmbeddings } from '@langchain/openai';
import { SupabaseVectorStore } from '@langchain/community/vectorstores/supabase';
import { createClient } from '@supabase/supabase-js';
import { RunnableConfig } from '@langchain/core/runnables';

// Import configuration helpers
import {
  BaseConfigurationAnnotation,
  ensureBaseConfiguration,
} from './configuration.js';

/**
 * Create a Supabase-based retriever using OpenAI embeddings.
 *
 * @param configuration - Validated base configuration (retriever provider, filter, and k)
 * @returns A LangChain-compatible retriever that wraps a Supabase vector store
 */
export async function makeSupabaseRetriever(
  configuration: typeof BaseConfigurationAnnotation.State,
): Promise<VectorStoreRetriever> {
  // Ensure required environment variables are defined
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error(
      'SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables are not defined',
    );
  }

  // Create an OpenAI embedding model instance
  const embeddings = new OpenAIEmbeddings({
    model: 'text-embedding-3-small', // Smaller and faster embedding model
  });

  // Initialize the Supabase client using environment variables
  const supabaseClient = createClient(
    process.env.SUPABASE_URL ?? '',                  // Supabase project URL
    process.env.SUPABASE_SERVICE_ROLE_KEY ?? '',     // Secret service role key (for vector ops)
  );

  // Create a Supabase vector store instance using the embeddings and client
  const vectorStore = new SupabaseVectorStore(embeddings, {
    client: supabaseClient,              // The Supabase client to use
    tableName: 'documents',              // Table where documents are stored
    queryName: 'match_documents',        // Name of the function that performs vector similarity search
  });

  // Return a retriever configured with `k` results and optional filters
  return vectorStore.asRetriever({
    k: configuration.k,                         // Number of top results to retrieve
    filter: configuration.filterKwargs,         // Filter metadata if provided
  });
}

/**
 * Factory function to create a retriever based on the configuration's provider type.
 *
 * @param config - A LangChain RunnableConfig that may include custom config params
 * @returns A retriever instance based on the specified provider
 */
export async function makeRetriever(
  config: RunnableConfig,
): Promise<VectorStoreRetriever> {
  // Extract and validate retriever configuration from the runnable config
  const configuration = ensureBaseConfiguration(config);

  // Dynamically dispatch based on the specified retriever provider
  switch (configuration.retrieverProvider) {
    case 'supabase':
      return makeSupabaseRetriever(configuration);
    default:
      throw new Error(
        `Unsupported retriever provider: ${configuration.retrieverProvider}`,
      );
  }
}