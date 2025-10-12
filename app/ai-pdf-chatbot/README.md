# AI PDF Chatbot

This is an implementation of an AI chatbot that "ingests" PDF documents, stores embeddings in a vector database (Supabase), and then answers user queries using OpenAI (or another LLM provider) utilising LangChain and LangGraph as orchestration frameworks.

## Table of Contents

1. [Features](#features)
2. [Architecture Overview](#architecture-overview)
3. [Prerequisites](#prerequisites)
4. [Installation](#installation)
5. [Environment Variables](#environment-variables)
   - [Frontend Variables](#frontend-variables)
   - [Backend Variables](#backend-variables)
6. [Local Development](#local-development)
   - [Running the Backend](#running-the-backend)
   - [Running the Frontend](#running-the-frontend)
7. [Usage](#usage)
   - [Uploading/Ingesting PDFs](#uploadingingesting-pdfs)
   - [Asking Questions](#asking-questions)
   - [Viewing Chat History](#viewing-chat-history)
8. [Production Build & Deployment](#production-build--deployment)
9. [Customizing](#customizing-the-agent)
10. [Troubleshooting](#troubleshooting)
11. [Next Steps](#next-steps)

---

## Features

- **Document Ingestion Graph**: Upload and parse PDFs into `Document` objects, then store vector embeddings into a vector database (we use Supabase in this example).
  - Supports multiple PDF files (up to 5 files, each under 10MB)
  - Automatic text extraction and chunking
  - Vector embedding generation using OpenAI's embedding model
  - Persistent storage in Supabase vector database

- **Retrieval Graph**: Handle user questions, decide whether to retrieve documents or give a direct answer, then generate concise responses with references to the retrieved documents.
  - Smart document retrieval based on semantic similarity
  - Context-aware response generation
  - Source attribution for answers
  - Real-time streaming of responses

- **Streaming Responses**: Real-time streaming of partial responses from the server to the client UI.
  - Immediate feedback to users
  - Progressive loading of long responses
  - Better user experience with faster initial response times

- **LangGraph Integration**: Built using LangGraph's state machine approach to orchestrate ingestion and retrieval, visualise your agentic workflow, and debug each step of the graph.
  - Visual workflow debugging through LangGraph Studio
  - Step-by-step execution tracking
  - Easy workflow modification and extension

- **Next.js Frontend**: Allows file uploads, real-time chat, and easy extension with React components and Tailwind.
  - Modern, responsive UI
  - Real-time chat interface
  - File upload with progress tracking
  - Source document viewing

---

## Architecture Overview

```ascii
┌─────────────────────┐    1. Upload PDFs    ┌───────────────────────────┐
│Frontend (Next.js)   │ ────────────────────>│Backend (LangGraph)        │
│ - React UI w/ chat  │                      │ - Ingestion Graph         │
│ - Upload .pdf files │ <────────────────────┤   + Vector embedding via  │
└─────────────────────┘    2. Confirmation   │     SupabaseVectorStore   │
                                             | (storing embeddings in DB)|                    
                                             └───────────────────────────┘
┌─────────────────────┐    3. Ask questions  ┌───────────────────────────┐
│Frontend (Next.js)   │ ────────────────────>│Backend (LangGraph)        │
│ - Chat + SSE stream │                      │ - Retrieval Graph         │
│ - Display sources   │ <────────────────────┤   + Chat model (OpenAI)   │
└─────────────────────┘ 4. Streamed answers  └───────────────────────────┘
```

### Key Components

- **Supabase**: Vector store for document embeddings
  - Efficient similarity search
  - Persistent storage
  - Easy integration with LangChain

- **OpenAI**: Language model provider
  - High-quality text generation
  - Embedding generation
  - Configurable model parameters

- **LangGraph**: Workflow orchestration
  - State machine-based execution
  - Visual debugging
  - Extensible architecture

- **Next.js**: Frontend framework
  - Server-side rendering
  - API routes
  - Modern React features

The system consists of:

- **Backend**: A Node.js/TypeScript service that contains LangGraph agent "graphs" for:
  - **Ingestion** (`src/ingestion_graph/`) - handles indexing/ingesting documents
    - `graph.ts`: Main ingestion workflow
    - `configuration.ts`: Ingestion-specific settings
    - `state.ts`: State management for ingestion
  - **Retrieval** (`src/retrieval_graph/`) - question-answering over the ingested documents
    - `graph.ts`: Main retrieval workflow
    - `configuration.ts`: Retrieval-specific settings
    - `prompts.ts`: System and user prompts
    - `state.ts`: State management for retrieval
    - `utils.ts`: Helper functions
  - **Configuration** (`src/shared/configuration.ts`) - handles configuration for the backend api including model providers and vector stores

- **Frontend**: A Next.js/React app that provides a web UI for users to upload PDFs and chat with the AI.
  - Modern chat interface
  - File upload component
  - Real-time streaming
  - Source document viewing

---

## Prerequisites

1. **Node.js v18+** (we recommend Node v20).
   - Installation on Mac:
     ```bash
     brew install node@20
     ```
   - If you get "command not found" for node, run:
     ```bash
     brew link node
     ```
   - To ensure node@20 is first in your PATH, run:
     ```bash
     echo 'export PATH="/opt/homebrew/opt/node@20/bin:$PATH"' >> ~/.zshrc
     ```
   - For compilers to find node@20, you may need to set:
     ```bash
     export LDFLAGS="-L/opt/homebrew/opt/node@20/lib"
     export CPPFLAGS="-I/opt/homebrew/opt/node@20/include"
     ```

2. **Yarn** (or npm, but this monorepo is pre-configured with Yarn).
   - The preferred way to manage Yarn is by-project through Corepack:
     ```bash
     corepack enable
     yarn init -2
     ```
   - To update Yarn:
     ```bash
     yarn set version stable
     yarn install
     ```

3. **Supabase project** (if you plan to store embeddings in Supabase).
   - Install Supabase CLI:
     ```bash
     brew install supabase/tap/supabase
     ```
   - Initialize a new project:
     ```bash
     supabase init
     ```
   - Start Supabase services:
     ```bash
     supabase start
     ```
   - You will need:
     - `SUPABASE_URL` (API URL): http://127.0.0.1:54321
     - `SUPABASE_SERVICE_ROLE_KEY` (from the CLI output)
     - A table named `documents` and a function named `match_documents` for vector similarity search
     - Required packages:
       ```bash
       yarn add @langchain/community @langchain/core @supabase/supabase-js @langchain/openai
       ```

4. **OpenAI API Key** (or another LLM provider's key, supported by LangChain).
   - Sign up at [OpenAI Platform](https://platform.openai.com)
   - Create an API key in your account settings
   - Ensure you have sufficient credits for your usage

5. **LangChain API Key** (free and optional, but highly recommended for debugging and tracing your LangChain and LangGraph applications).
   - Sign up at [LangSmith](https://smith.langchain.com)
   - Create an API key in your account settings
   - Learn more [here](https://docs.smith.langchain.com/administration/how_to_guides/organization_management/create_account_api_key)

---

## Installation

1. **Clone** the repository:
   ```bash
   git clone https://github.com/darinz/rag-pdf-chatbot.git
   cd rag-pdf-chatbot
   ```

2. **Install dependencies** (from the repo root):
   ```bash
   yarn install
   ```

3. **Configure environment variables** in both backend and frontend. See `.env.example` files for details.

## Environment Variables

The project relies on environment variables to configure keys and endpoints. Each sub-project (backend and frontend) has its own `.env.example`. Copy these to `.env` and fill in your details.

### Frontend Variables

Create a `.env` file in frontend:
```bash
cp frontend/.env.example frontend/.env
```

Required variables:
```
NEXT_PUBLIC_LANGGRAPH_API_URL=http://localhost:2024
LANGCHAIN_API_KEY=your-langsmith-api-key-here # Optional: LangSmith API key
LANGGRAPH_INGESTION_ASSISTANT_ID=ingestion_graph
LANGGRAPH_RETRIEVAL_ASSISTANT_ID=retrieval_graph
LANGCHAIN_TRACING_V2=true # Optional: Enable LangSmith tracing
LANGCHAIN_PROJECT="pdf-chatbot" # Optional: LangSmith project name
```

### Backend Variables

Create a `.env` file in backend:
```bash
cp backend/.env.example backend/.env
```

Required variables:
```
OPENAI_API_KEY=your-openai-api-key-here
SUPABASE_URL=your-supabase-url-here
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key-here
LANGCHAIN_TRACING_V2=true # Optional: Enable LangSmith tracing
LANGCHAIN_PROJECT="pdf-chatbot" # Optional: LangSmith project name
```

**Explanation of Environment Variables:**

- `NEXT_PUBLIC_LANGGRAPH_API_URL`: The URL where your LangGraph backend server is running. Defaults to `http://localhost:2024` for local development.
- `LANGCHAIN_API_KEY`: Your LangSmith API key. This is optional, but highly recommended for debugging and tracing your LangChain and LangGraph applications.
- `LANGGRAPH_INGESTION_ASSISTANT_ID`: The ID of the LangGraph assistant for document ingestion. Default is `ingestion_graph`.
- `LANGGRAPH_RETRIEVAL_ASSISTANT_ID`: The ID of the LangGraph assistant for question answering. Default is `retrieval_graph`.
- `LANGCHAIN_TRACING_V2`: Enable tracing to debug your application on the LangSmith platform. Set to `true` to enable.
- `LANGCHAIN_PROJECT`: The name of your LangSmith project.
- `OPENAI_API_KEY`: Your OpenAI API key.
- `SUPABASE_URL`: Your Supabase URL.
- `SUPABASE_SERVICE_ROLE_KEY`: Your Supabase service role key.

## Local Development

This repo uses Turborepo to manage both backend and frontend projects. You can run them separately for development.

### Running the Backend

1. Navigate to backend:
   ```bash
   cd backend
   ```

2. Install dependencies (already done if you ran yarn install at the root).

3. Start LangGraph in dev mode:
   ```bash
   yarn langgraph:dev
   ```

This will launch a local LangGraph server on port 2024 by default. It should redirect you to a UI for interacting with the LangGraph server. [Langgraph studio guide](https://langchain-ai.github.io/langgraph/concepts/langgraph_studio/)

### Running the Frontend

1. Navigate to frontend:
   ```bash
   cd frontend
   ```

2. Start the Next.js development server:
   ```bash
   yarn dev
   ```

This will start a local Next.js development server (by default on port 3000).

Access the UI in your browser at http://localhost:3000.

## Usage

Once both services are running:

1. Use langgraph studio UI to interact with the LangGraph server and ensure the workflow is working as expected.

2. Navigate to http://localhost:3000 to use the chatbot UI.

3. Upload a small PDF document via the file upload button at the bottom of the page. This will trigger the ingestion graph to extract the text and store the embeddings in Supabase via the frontend `app/api/ingest` route.
	
4. After the ingestion is complete, ask questions in the chat input.

5. The chatbot will trigger the retrieval graph via the `app/api/chat` route to retrieve the most relevant documents from the vector database and use the relevant PDF context (if needed) to answer.

### Uploading/Ingesting PDFs

1. Click on the paperclip icon in the chat input area.
2. Select one or more PDF files to upload ensuring a total of max 5, each under 10MB (you can change these threshold values in the `app/api/ingest` route).
3. The backend processes the PDFs, extracts text, and stores embeddings in Supabase (or your chosen vector store).
4. You'll see a confirmation message when the ingestion is complete.

### Asking Questions

1. Type your question in the chat input field.
2. Responses stream in real time. If the system retrieved documents, you'll see a link to "View Sources" for each chunk of text used in the answer.
3. The system will automatically decide whether to use the document context or provide a direct answer.

### Viewing Chat History

- The system creates a unique thread per user session (frontend). All messages are kept in the state for the session.
- For demonstration purposes, the current example UI does not store the entire conversation beyond the local thread state and is not persistent across sessions. You can extend it to persist threads in a database. However, the "ingested documents" are persistent across sessions as they are stored in a vector database.

## Production Build & Deployment

### Deploying the Backend

To deploy your LangGraph agent to a cloud service, you can either:
1. Use LangGraph's cloud as per this [guide](https://langchain-ai.github.io/langgraph/cloud/quick_start/?h=studio#deploy-to-langgraph-cloud)
2. Self-host it as per this [guide](https://langchain-ai.github.io/langgraph/how-tos/deploy-self-hosted/)

### Deploying the Frontend

The frontend can be deployed to any hosting that supports Next.js (Vercel, Netlify, etc.).

Make sure to set relevant environment variables in your deployment environment. In particular, ensure `NEXT_PUBLIC_LANGGRAPH_API_URL` is pointing to your deployed backend URL.

## Customizing

You can customize the backend and frontend.

### Backend

- In the configuration file `src/shared/configuration.ts`, you can change the default configs i.e. the vector store, k-value, and filter kwargs, shared between the ingestion and retrieval graphs. On the backend, configs can be used in each node of the graph workflow or from frontend, you can pass a config object into the graph's client.
- You can adjust the prompts in the `src/retrieval_graph/prompts.ts` file.
- If you'd like to change the retrieval model, you can do so in the `src/shared/retrieval.ts` file by adding another retriever function that encapsulates the desired client for the vector store and then updating the `makeRetriever` function to return the new retriever.

### Frontend

- You can modify the file upload restrictions in the `app/api/ingest` route.
- In `constants/graphConfigs.ts`, you can change the default config objects sent to the ingestion and retrieval graphs. These include the model provider, k value (no of source documents to retrieve), and retriever provider (i.e. vector store).

## Troubleshooting

1. **Tailwind CSS Issues**
   If you encounter issues with Tailwind CSS, try the following:
   ```bash
   # Uninstall existing packages
   npm uninstall autoprefixer postcss tailwindcss

   # Install specific versions
   npm install tailwindcss@^3.4.17 postcss@^8.5.0 autoprefixer@^10.4.20
   ```

2. **.env Not Loaded**
   - Make sure you copied .env.example to .env in both backend and frontend.
   - Check your environment variables are correct and restart the dev server.

3. **Supabase Vector Store**
   - Ensure you have configured your Supabase instance with the documents table and match_documents function. Check the official LangChain docs on Supabase integration.
   - Verify your Supabase connection by checking the logs in the LangGraph server.

4. **OpenAI Errors**
   - Double-check your OPENAI_API_KEY. Make sure you have enough credits/quota.
   - Check the OpenAI API status page for any ongoing issues.
   - Verify your API key permissions and rate limits.

5. **LangGraph Not Running**
   - If yarn langgraph:dev fails, confirm your Node version is >= 18 and that you have all dependencies installed.
   - Check the LangGraph server logs for any specific error messages.
   - Ensure all required environment variables are set correctly.

6. **Network Errors**
   - Frontend must point to the correct NEXT_PUBLIC_LANGGRAPH_API_URL. By default, it is http://localhost:2024.
   - Check if your firewall or security settings are blocking the connections.
   - Verify that both frontend and backend servers are running on the expected ports.

## Next Steps

1. **Add Authentication**
   - Implement user authentication to secure the application
   - Add user-specific document storage and retrieval

2. **Enhance Document Processing**
   - Support more document formats (DOCX, TXT, etc.)
   - Implement better text chunking strategies
   - Add document metadata extraction

3. **Improve Chat Experience**
   - Add conversation history persistence
   - Implement chat thread management
   - Add support for file attachments in chat

4. **Performance Optimization**
   - Implement caching for frequently accessed documents
   - Optimize vector search performance
   - Add rate limiting and request queuing

5. **Monitoring and Analytics**
   - Add usage tracking and analytics
   - Implement error tracking and monitoring
   - Add performance metrics collection