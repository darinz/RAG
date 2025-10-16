/**
 * This "graph" simply exposes an endpoint for a user to upload docs to be indexed.
 */

import { RunnableConfig } from '@langchain/core/runnables';
import { StateGraph, END, START } from '@langchain/langgraph';
import fs from 'fs/promises';

import { IndexStateAnnotation } from './state.js';
import { makeRetriever } from '../shared/retrieval.js';
import {
  ensureIndexConfiguration,
  IndexConfigurationAnnotation,
} from './configuration.js';
import { reduceDocs } from '../shared/state.js';
import { createLogger } from '../shared/logger.js';
import { IngestionError } from '../shared/errors.js';

async function ingestDocs(
  state: typeof IndexStateAnnotation.State,
  config?: RunnableConfig,
): Promise<typeof IndexStateAnnotation.Update> {
  const logger = createLogger('ingestion-graph');
  const startTime = Date.now();
  
  try {
    if (!config) {
      throw new IngestionError('Configuration required to run index_docs.');
    }

    logger.info('Starting document ingestion', { 
      existingDocs: state.docs?.length || 0 
    });

    const configuration = ensureIndexConfiguration(config);
    let docs = state.docs;

    if (!docs || docs.length === 0) {
      if (configuration.useSampleDocs) {
        logger.info('Loading sample documents', { file: configuration.docsFile });
        const fileContent = await fs.readFile(configuration.docsFile, 'utf-8');
        const serializedDocs = JSON.parse(fileContent);
        docs = reduceDocs([], serializedDocs);
        logger.info('Sample documents loaded', { count: docs.length });
      } else {
        throw new IngestionError('No sample documents to index.');
      }
    } else {
      docs = reduceDocs([], docs);
      logger.info('Processing provided documents', { count: docs.length });
    }

    logger.info('Adding documents to retriever', { count: docs.length });
    const retriever = await makeRetriever(config);
    await retriever.addDocuments(docs);
    
    const duration = Date.now() - startTime;
    logger.logIngestion(docs.length, duration);
    logger.logGraphExecution('ingestion-graph', 'ingestDocs', duration);

    return { docs: 'delete' };
  } catch (error) {
    logger.logError('ingestDocs', error as Error, { 
      docCount: state.docs?.length || 0 
    });
    throw error;
  }
}

// Define the graph
const builder = new StateGraph(
  IndexStateAnnotation,
  IndexConfigurationAnnotation,
)
  .addNode('ingestDocs', ingestDocs)
  .addEdge(START, 'ingestDocs')
  .addEdge('ingestDocs', END);

// Compile into a graph object that you can invoke and deploy.
export const graph = builder
  .compile()
  .withConfig({ runName: 'IngestionGraph' });
