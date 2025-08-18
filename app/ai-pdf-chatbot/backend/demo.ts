// Import the LangGraph client SDK
import { Client } from '@langchain/langgraph-sdk';

// Import the LangGraph definition
import { graph } from './src/retrieval_graph/graph.js';

// Import dotenv to load environment variables from a .env file
import dotenv from 'dotenv';

// Load environment variables (like LANGGRAPH_API_URL) from .env into process.env
dotenv.config();

// Expected environment variable:
// LANGGRAPH_API_URL - URL of your LangGraph server
// Example:
// - Local: http://localhost:2024
// - Cloud: https://api.smith.langchain.com

// Define the ID of the assistant (graph) you want to run
const assistant_id = 'retrieval_graph';

// Main async function to run the demo
async function runDemo() {
  // Initialize LangGraph client using the API URL from the environment variable
  const client = new Client({
    apiUrl: process.env.LANGGRAPH_API_URL || 'http://localhost:2024',
  });

  // Create a new thread (conversation context) for the demo
  console.log('Creating new thread...');
  const thread = await client.threads.create({
    metadata: {
      demo: 'retrieval-graph', // Optional metadata to help identify this thread
    },
  });
  console.log('Thread created with ID:', thread.thread_id);

  // Define the question to ask the assistant
  const question = 'What is this document about?';

  console.log('\n=== Streaming Example ===');
  console.log('Question:', question);

  // Attempt to run the graph with streaming enabled
  try {
    console.log('\nStarting stream...');

    // Start a streaming run with multiple stream modes enabled
    const stream = await client.runs.stream(thread.thread_id, assistant_id, {
      input: { query: question }, // Provide the question as input
      streamMode: ['values', 'messages', 'updates'], // Listen to all event types
    });

    // Handle each streaming event as it comes in
    console.log('\nWaiting for stream chunks...');
    for await (const chunk of stream) {
      console.log('\nReceived chunk:');
      
      // Handle different event types (can be uncommented for debugging)
      if (chunk.event === 'values') {
        // console.log('Values data:', JSON.stringify(chunk.data, null, 2));
      } else if (chunk.event === 'messages/partial') {
        // console.log('Messages data:', JSON.stringify(chunk, null, 2));
      } else if (chunk.event === 'updates') {
        // Print updates from the graph
        console.log('Update data:', JSON.stringify(chunk.data, null, 2));
      }
    }

    console.log('\nStream completed.');

    // Run another stream that only listens to "updates" events
    const messagesStream = await client.runs.stream(
      thread.thread_id,
      assistant_id,
      {
        input: { query: question },
        streamMode: 'updates', // Only listen to update events
      },
    );

    // Process the chunks from the updates-only stream
    for await (const chunk of messagesStream) {
      console.log('\nReceived chunk:');
      console.log('Event type:', chunk.event);
      console.log('updates data:', JSON.stringify(chunk.data, null, 2));
    }
  } catch (error) {
    // Catch any errors that occur during streaming
    console.error('Error in streaming run:', error);

    // Log error details for debugging
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }
  }
}

// Start the demo function, and handle any top-level errors
runDemo().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1); // Exit the process with a failure code
});
