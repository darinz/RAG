/**
 * This "graph" defines a minimal pipeline that exposes an endpoint
 * for users to upload or ingest documents into a retriever index.
 */

import { RunnableConfig } from '@langchain/core/runnables'; // Type for configuring graph runs
import { StateGraph, END, START } from '@langchain/langgraph'; // LangGraph state graph system and special nodes
import fs from 'fs/promises'; // Promisified file system module for async file I/O

// Custom state schema used by the graph to define inputs/outputs
import { IndexStateAnnotation } from './state.js';

// Utility to create a retriever instance for document indexing
import { makeRetriever } from '../shared/retrieval.js';

// Configuration schema and validator for indexing-related settings
import {
  ensureIndexConfiguration,        // Helper to normalize and apply config defaults
  IndexConfigurationAnnotation,    // Schema for expected configuration fields
} from './configuration.js';

// Helper function to reduce and transform raw document inputs
import { reduceDocs } from '../shared/state.js';

/**
 * This function represents the core "node" in the graph: it ingests documents.
 * It prepares documents (from state or file), creates a retriever, and indexes them.
 *
 * @param state - The current state of the graph (includes `docs` array).
 * @param config - Optional configuration for controlling ingestion behavior.
 * @returns A state update. In this case, it signals that docs are no longer needed in state.
 */
async function ingestDocs(
  state: typeof IndexStateAnnotation.State, // Strongly typed input state
  config?: RunnableConfig,
): Promise<typeof IndexStateAnnotation.Update> {
  // Fail early if configuration is not provided
  if (!config) {
    throw new Error('Configuration required to run index_docs.');
  }

  // Parse and ensure a valid configuration object, with defaults filled in
  const configuration = ensureIndexConfiguration(config);

  // Start with the current state's docs, if any
  let docs = state.docs;

  // If no docs provided in state, fall back to loading from sample file (if allowed)
  if (!docs || docs.length === 0) {
    if (configuration.useSampleDocs) {
      // Read the default/sample JSON file of documents
      const fileContent = await fs.readFile(configuration.docsFile, 'utf-8');

      // Parse JSON and transform the raw docs to a retriever-compatible format
      const serializedDocs = JSON.parse(fileContent);
      docs = reduceDocs([], serializedDocs);
    } else {
      // No docs available and no sample usage allowed — fail with clear error
      throw new Error('No sample documents to index.');
    }
  } else {
    // Reduce the raw `docs` into a normalized structure for indexing
    docs = reduceDocs([], docs);
  }

  // Create or fetch a retriever object (e.g., a vector store interface)
  const retriever = await makeRetriever(config);

  // Add the prepared documents to the retriever index
  await retriever.addDocuments(docs);

  // Return a state update: remove docs from state since they've been ingested
  return { docs: 'delete' };
}

// === Graph Definition ===

// Create a new state graph that uses the defined state and configuration schemas
const builder = new StateGraph(
  IndexStateAnnotation,           // Defines what data the graph will track
  IndexConfigurationAnnotation,   // Defines config parameters available at runtime
)
  // Add a node to the graph, named 'ingestDocs', running the function defined above
  .addNode('ingestDocs', ingestDocs)

  // Define graph edges: START → ingestDocs → END
  .addEdge(START, 'ingestDocs')
  .addEdge('ingestDocs', END);

// Compile the graph into an executable object and attach a config (like a run name)
export const graph = builder
  .compile() // Turns the builder into a runnable LangGraph
  .withConfig({ runName: 'IngestionGraph' }); // Optional label for observability/logging