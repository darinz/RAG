import { VectorStoreRetriever } from '@langchain/core/vectorstores';
import { OpenAIEmbeddings } from '@langchain/openai';
import { SupabaseVectorStore } from '@langchain/community/vectorstores/supabase';
import { createClient } from '@supabase/supabase-js';
import { RunnableConfig } from '@langchain/core/runnables';
import {
  BaseConfigurationAnnotation,
  ensureBaseConfiguration,
} from './configuration.js';
import { ConfigurationError, RetrievalError } from './errors.js';
import { ConnectionPool } from './cache.js';

export async function makeSupabaseRetriever(
  configuration: typeof BaseConfigurationAnnotation.State,
): Promise<VectorStoreRetriever> {
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new ConfigurationError(
      'SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables are not defined',
      'supabase'
    );
  }

  try {
    // Use connection pooling for embeddings
    const embeddings = ConnectionPool.getConnection(
      'openai-embeddings',
      () => new OpenAIEmbeddings({
        model: 'text-embedding-3-small',
      })
    );
    
    // Use connection pooling for Supabase client
    const supabaseClient = ConnectionPool.getConnection(
      'supabase-client',
      () => createClient(
        process.env.SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
      )
    );
    
    const vectorStore = new SupabaseVectorStore(embeddings, {
      client: supabaseClient,
      tableName: 'documents',
      queryName: 'match_documents',
    });
    
    return vectorStore.asRetriever({
      k: configuration.k,
      filter: configuration.filterKwargs,
    });
  } catch (error) {
    throw new RetrievalError(
      `Failed to create Supabase retriever: ${error instanceof Error ? error.message : 'Unknown error'}`,
      'supabase'
    );
  }
}

export async function makeRetriever(
  config: RunnableConfig,
): Promise<VectorStoreRetriever> {
  try {
    const configuration = ensureBaseConfiguration(config);
    switch (configuration.retrieverProvider) {
      case 'supabase':
        return await makeSupabaseRetriever(configuration);
      default:
        throw new ConfigurationError(
          `Unsupported retriever provider: ${configuration.retrieverProvider}`,
          'retrieverProvider'
        );
    }
  } catch (error) {
    if (error instanceof ConfigurationError || error instanceof RetrievalError) {
      throw error;
    }
    throw new RetrievalError(
      `Failed to create retriever: ${error instanceof Error ? error.message : 'Unknown error'}`,
      'retriever'
    );
  }
}
