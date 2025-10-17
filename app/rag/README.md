# AI Document Chat Assistant

An intelligent AI document chat assistant that processes PDF documents, stores embeddings in Supabase, and provides contextual answers using OpenAI and LangGraph. The system features an AI agent smart routing that automatically determines whether to provide direct AI responses or RAG-enhanced responses based on query content and context. Built with TypeScript and Next.js, featuring comprehensive input validation, XSS protection, and rate limiting for secure user interactions.

## Application Preview

### Landing Page
*The main interface showcases a modern, clean design with a prominent document upload area. Users can easily drag and drop PDF files or click to browse, with real-time upload progress indicators. The interface includes a chat input field ready for questions, theme toggle for dark/light mode, and example prompts to get users started quickly.*
![Landing Page](./images/landing-page.png)

### RAG QA
*This demonstrates the RAG (Retrieval-Augmented Generation) workflow in action. When users ask questions about uploaded documents, the system intelligently searches through document embeddings, retrieves relevant content, and provides accurate answers with proper source attribution. The interface shows the question, AI response, and clickable source references that link back to specific document sections.*
![RAG QA Example](./images/rag-qa.png)

### Direct Answer
*For general questions not requiring document context, the AI agent smart routing system provides direct responses using AI's knowledge. This example shows how the system handles broad queries efficiently without unnecessary document retrieval, maintaining fast response times while still providing helpful, contextual answers.*
![Direct Answer Example](./images/direct-answer.png)

## Table of Contents

1. [Features](#features)
2. [Quick Start](#quick-start)
3. [Environment Variables](#environment-variables)
4. [Usage](#usage)
5. [Development](#development)
6. [Deployment](#deployment)
7. [Troubleshooting](#troubleshooting)

---

## Features

- **AI Agent Smart Routing**: Intelligently determines whether to provide direct AI responses or RAG-enhanced responses based on query content and context
- **Input Validation & Security**: Comprehensive sanitization, XSS protection, and rate limiting for secure user interactions
- **PDF Document Processing**: Upload and parse PDFs with automatic text extraction and chunking
- **Vector Search**: Store embeddings in Supabase with semantic similarity search
- **AI Chat Interface**: Real-time streaming responses with source attribution
- **LangGraph Workflows**: Visual debugging and step-by-step execution tracking
- **Modern UI**: Next.js frontend with dark/light themes and comprehensive components
- **Testing**: Jest with 80% coverage requirements and TypeScript support
- **Monorepo**: Turborepo-managed backend and frontend with shared tooling

## Prerequisites

### 1. Node.js v18+ (recommended: v20)

**Installation on Mac:**
```bash
brew install node@20
```

If you get "command not found" for node:
```bash
brew link node
```

To ensure node@20 is first in your PATH:
```bash
echo 'export PATH="/opt/homebrew/opt/node@20/bin:$PATH"' >> ~/.zshrc
```

For compilers to find node@20:
```bash
export LDFLAGS="-L/opt/homebrew/opt/node@20/lib"
export CPPFLAGS="-I/opt/homebrew/opt/node@20/include"
```

### 2. Yarn Package Manager

**Enable Corepack (recommended):**
```bash
corepack enable
yarn init -2
```

**Update Yarn:**
```bash
yarn set version stable
yarn install
```

### 3. Supabase Setup

**Running Supabase locally**
- The Supabase CLI uses Docker containers to manage the local development stack. Follow the official guide to install and configure [Docker Desktop](https://docs.docker.com/desktop):
  - Download: https://docs.docker.com/desktop/release-notes/
  - Mac Install Instructions: https://docs.docker.com/desktop/setup/install/mac-install/
  - Use recommended settings (Requires password). This lets Docker Desktop automatically set the necessary configuration settings.
  - Learn: https://docs.docker.com/get-started/introduction/
- Start `docker` per instructions from above
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

- **Access your project's services**
  - Once all of the Supabase services are running, you'll see output containing your local Supabase credentials. It should look like this, with urls and keys that you'll use in your local project:
```
        API URL: http://127.0.0.1:54321
    GraphQL URL: http://127.0.0.1:54321/graphql/v1
 S3 Storage URL: http://127.0.0.1:54321/storage/v1/s3
         DB URL: postgresql://postgres:postgres@127.0.0.1:54322/postgres
     Studio URL: http://127.0.0.1:54323
   Inbucket URL: http://127.0.0.1:54324
     JWT secret: super-secret-jwt-token-with-at-least-32-characters-long
       anon key: super-secret-eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9
service_role key: super-secret-eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9
```
  - **Studio**: Default URL: http://localhost:54323
      - The local development environment includes Supabase Studio, a graphical interface for working with your database.
  - **Stopping local services**
    - When you are finished working on your Supabase project, you can stop the stack (without resetting your local database):
    - ```supabase stop```

  - You will need:
    - `SUPABASE_URL` (API URL): http://127.0.0.1:54321
    - `SUPABASE_SERVICE_ROLE_KEY` (from the CLI output)
    - A table named `documents` and a function named `match_documents` for vector similarity search. 
    - See [LangChain documentation for guidance on setting up the tables](https://js.langchain.com/docs/integrations/vectorstores/supabase/)
    - Required packages:
      ```bash
      yarn add @langchain/community @langchain/core @supabase/supabase-js @langchain/openai
      ```

  **Setting up the Supabase Database for Vector Search**

  To use Supabase as a vector store for document embeddings, you need to set up the database with the required table and function. Follow these steps:

  **Install Required Packages**
  
  First, ensure you have the necessary packages installed:
  ```bash
  yarn add @langchain/community @langchain/core @supabase/supabase-js @langchain/openai
  ```

  **Using Supabase Studio for Database Setup (GUI Method)**
  
  If you prefer a graphical interface, you can use Supabase Studio to set up your database:

  **Step 1: Access Supabase Studio**
  
  1. Open your browser and navigate to http://localhost:54323 (or the Studio URL from your `supabase start` output)
  2. You should see the Supabase Studio dashboard

  **Step 2: Enable the pgvector Extension**
  
  1. In the left sidebar, click on **"SQL Editor"**
  2. Click **"New Query"** to create a new SQL query
  3. Copy and paste this SQL command:
  ```sql
  -- Enable the pgvector extension
  CREATE EXTENSION IF NOT EXISTS vector;
  ```
  4. Click **"Run"** to execute the query
  5. You should see a success message confirming the extension was created

  **Step 3: Create the Documents Table**
  
  1. In the SQL Editor, create a new query
  2. Copy and paste this SQL command:
  ```sql
  -- Create the documents table
  CREATE TABLE IF NOT EXISTS documents (
    id BIGSERIAL PRIMARY KEY,
    content TEXT NOT NULL,
    metadata JSONB,
    embedding VECTOR(1536) -- OpenAI embeddings are 1536 dimensions
  );
  ```
  3. Click **"Run"** to execute the query
  4. You should see a success message confirming the table was created

  **Step 4: Create the Vector Similarity Search Function**
  
  1. In the SQL Editor, create a new query
  2. Copy and paste this SQL command:
  ```sql
  -- Create the match_documents function for vector similarity search
  CREATE OR REPLACE FUNCTION match_documents (
    query_embedding VECTOR(1536),
    match_count INT DEFAULT 5,
    filter JSONB DEFAULT '{}'
  )
  RETURNS TABLE (
    id BIGINT,
    content TEXT,
    metadata JSONB,
    similarity FLOAT
  )
  LANGUAGE plpgsql
  AS $$
  BEGIN
    RETURN QUERY
    SELECT
      documents.id,
      documents.content,
      documents.metadata,
      1 - (documents.embedding <=> query_embedding) AS similarity
    FROM documents
    WHERE (filter = '{}' OR documents.metadata @> filter)
    ORDER BY documents.embedding <=> query_embedding
    LIMIT match_count;
  END;
  $$;
  ```
  3. Click **"Run"** to execute the query
  4. You should see a success message confirming the function was created

  **Step 5: Create Performance Index**
  
  1. In the SQL Editor, create a new query
  2. Copy and paste this SQL command:
  ```sql
  -- Create an index on the embedding column for faster similarity search
  CREATE INDEX IF NOT EXISTS documents_embedding_idx ON documents 
  USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);
  ```
  3. Click **"Run"** to execute the query
  4. You should see a success message confirming the index was created

  **Step 6: Verify Your Setup Using Studio**
  
  1. **Check the Table**: 
     - In the left sidebar, click on **"Table Editor"**
     - You should see the `documents` table listed
     - Click on it to view the table structure and confirm it has the correct columns

  2. **Check the Function**:
     - In the left sidebar, click on **"Database"** → **"Functions"**
     - You should see the `match_documents` function listed
     - Click on it to view the function definition

  3. **Check the Extension**:
     - In the left sidebar, click on **"Database"** → **"Extensions"**
     - You should see the `vector` extension listed and enabled

  4. **Test the Setup** (Optional):
     - Go back to **"SQL Editor"**
     - Run this test query to verify everything works:
     ```sql
     -- Test query to verify setup
     SELECT 
       'Extension' as component, 
       CASE WHEN EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'vector') 
            THEN 'Enabled' ELSE 'Not Found' END as status
     UNION ALL
     SELECT 
       'Table' as component,
       CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'documents') 
            THEN 'Created' ELSE 'Not Found' END as status
     UNION ALL
     SELECT 
       'Function' as component,
       CASE WHEN EXISTS (SELECT 1 FROM information_schema.routines WHERE routine_name = 'match_documents') 
            THEN 'Created' ELSE 'Not Found' END as status;
     ```

  **Step 7: View Your Database Schema**
  
  You can also view your database schema visually:
  1. In the left sidebar, click on **"Database"** → **"Schema"**
  2. You should see your `documents` table with all its columns
  3. The `embedding` column should show as `vector(1536)`

  **Troubleshooting in Studio**
  
  - If you get permission errors, make sure you're using the service role key in your environment variables
  - If the vector extension doesn't appear, try running the extension creation command again
  - If queries fail, check the **"Logs"** section in Studio for detailed error messages
  - You can also check the **"Database"** → **"Logs"** section for any database-related errors

### 4. OpenAI API Key

- Sign up at [OpenAI Platform](https://platform.openai.com)
- Create an API key in your account settings
- Ensure you have sufficient credits for your usage

### 5. LangSmith API Key (Optional but recommended)

- Sign up at [LangSmith](https://smith.langchain.com)
- Create an API key in your account settings
- Learn more [here](https://docs.smith.langchain.com/administration/how_to_guides/organization_management/create_account_api_key)

## Quick Start

### Installation

1. **Clone and install:**
   ```bash
   git clone https://github.com/darinz/RAG.git
   cd RAG/app/rag
   yarn install
   ```

2. **Set up and start Docker for Supabase:**
   ```bash
   # Install Docker Desktop (if not already installed)
   # Download from: https://docs.docker.com/desktop/
   
   # Start Docker Desktop
   # Make sure Docker is running before proceeding
   
   # Install Supabase CLI
   brew install supabase/tap/supabase
   
   # Initialize and start Supabase (requires Docker)
   supabase init
   supabase start
   ```

3. **Configure environment variables** (see Environment Variables section below)

4. **Set up database:**
   - Access Supabase Studio at http://localhost:54323
   - Run the SQL commands in the Supabase setup section to create the `documents` table and `match_documents` function

5. **Start development servers:**
   ```bash
   # Terminal 1: Backend
   cd backend
   yarn langgraph:dev
   
   # Terminal 2: Frontend  
   cd frontend
   yarn dev
   ```

6. **Access the application:**
   - Frontend: http://localhost:3000
   - LangGraph Studio: http://localhost:2024

## Environment Variables

### Backend (.env)
```bash
# Required
OPENAI_API_KEY=your-openai-api-key-here
SUPABASE_URL=http://127.0.0.1:54321
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Optional
LANGCHAIN_API_KEY=your-langsmith-api-key-here
LANGCHAIN_TRACING_V2=true
LANGCHAIN_PROJECT="pdf-chatbot"
```

### Frontend (.env)
```bash
# Required
NEXT_PUBLIC_LANGGRAPH_API_URL=http://localhost:2024
LANGGRAPH_INGESTION_ASSISTANT_ID=ingestion_graph
LANGGRAPH_RETRIEVAL_ASSISTANT_ID=retrieval_graph

# Optional
LANGCHAIN_API_KEY=your-langsmith-api-key-here
LANGCHAIN_TRACING_V2=true
LANGCHAIN_PROJECT="pdf-chatbot"
```

### Supabase Database Setup

Run these SQL commands in Supabase Studio (http://localhost:54323):

```sql
-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Create documents table
CREATE TABLE IF NOT EXISTS documents (
  id BIGSERIAL PRIMARY KEY,
  content TEXT NOT NULL,
  metadata JSONB,
  embedding VECTOR(1536)
);

-- Create similarity search function
CREATE OR REPLACE FUNCTION match_documents (
  query_embedding VECTOR(1536),
  match_count INT DEFAULT 5,
  filter JSONB DEFAULT '{}'
)
RETURNS TABLE (
  id BIGINT,
  content TEXT,
  metadata JSONB,
  similarity FLOAT
)
LANGUAGE plpgsql AS $$
BEGIN
  RETURN QUERY
  SELECT
    documents.id,
    documents.content,
    documents.metadata,
    1 - (documents.embedding <=> query_embedding) AS similarity
  FROM documents
  WHERE (filter = '{}' OR documents.metadata @> filter)
  ORDER BY documents.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- Create performance index
CREATE INDEX IF NOT EXISTS documents_embedding_idx ON documents 
USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);
```

## Usage

1. **Upload PDFs**: Click the paperclip icon to upload documents (max 5 files, 10MB each)
2. **Ask Questions**: Type questions in the chat interface
3. **View Sources**: Click "View Sources" to see document references
4. **Theme Toggle**: Use the theme switcher for dark/light mode

## Development

### Running Tests
```bash
# Backend tests
cd backend && yarn test

# Frontend tests  
cd frontend && yarn test

# All tests
yarn test
```

### Code Quality
```bash
# Lint and format
yarn lint
yarn format

# Type checking
yarn build
```

### Development Scripts
```bash
# Backend
cd backend
yarn langgraph:dev    # Start LangGraph server
yarn health          # Health check

# Frontend
cd frontend  
yarn dev             # Start Next.js dev server
```

## Deployment

### Backend Deployment
- **LangGraph Cloud**: Follow the [LangGraph Cloud guide](https://langchain-ai.github.io/langgraph/cloud/quick_start/?h=studio#deploy-to-langgraph-cloud)
- **Self-hosted**: Deploy with Docker or PM2
- **Environment**: Set production environment variables

### Frontend Deployment
- **Vercel** (Recommended): Connect GitHub repo, set environment variables
- **Netlify**: Configure build settings and environment variables
- **Docker**: Use provided Dockerfile for containerized deployment

### Production Checklist
- [ ] All tests passing
- [ ] Environment variables configured
- [ ] Build successful
- [ ] Health checks working
- [ ] Security review completed

## Troubleshooting

### Common Issues

1. **Environment Variables**: Run `yarn validate-env` to check configuration
2. **Port Conflicts**: Kill processes using ports 2024 or 3000
3. **Supabase Issues**: Check `supabase status` and restart if needed
4. **Build Errors**: Run `yarn build` to check TypeScript compilation
5. **Test Failures**: Run `yarn test` with verbose output for details

### Debugging
```bash
# Backend debugging
cd backend
yarn health          # Health check
yarn demo           # Run demo script

# Frontend debugging  
cd frontend
yarn dev            # Development server
yarn build          # Production build check
```

### Getting Help
- Check GitHub issues
- Review LangChain documentation
- Consult Supabase documentation
- Check OpenAI API status