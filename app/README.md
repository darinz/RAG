# RAG Applications

This directory contains production-ready Retrieval-Augmented Generation (RAG) applications built with modern AI/ML technologies. Each application demonstrates different approaches to document processing, vector storage, and conversational AI.

## Available Applications

### [Open-Source RAG Example](./open-source/)

A simple, self-contained RAG pipeline using open-source technologies for local development and experimentation.

**Key Features:**
- **Local LLM**: Uses `llama-cpp-python` with `.gguf` model files for offline inference
- **Open-Source Embeddings**: BAAI/bge-small-en-v1.5 via `langchain-huggingface`
- **FAISS Vector Store**: Fast similarity search with local vector storage
- **PDF Processing**: Automatic PDF parsing and text extraction
- **CLI Interface**: Command-line tool for batch document processing
- **Environment Configuration**: Flexible setup with `.env` file support

**Tech Stack:**
- **LLM**: Llama.cpp with GGUF models (e.g., Phi-3 Mini)
- **Embeddings**: Hugging Face BGE models
- **Vector Store**: FAISS
- **PDF Processing**: PyPDFLoader
- **Language**: Python 3.9-3.12

**Use Cases:**
- Local development and experimentation
- Offline RAG systems
- Privacy-focused document processing
- Educational RAG implementations

### [AI Document Chat Assistant](./rag/)

A comprehensive RAG system that ingests PDF documents and provides intelligent question-answering capabilities with AI agent smart routing.

**Key Features:**
- **AI Agent Smart Routing**: Intelligently determines whether to provide direct AI responses or RAG-enhanced responses
- **Document Ingestion**: Upload and process PDF documents with automatic text extraction and chunking
- **Vector Storage**: Store embeddings in Supabase vector database for efficient similarity search
- **LangGraph Orchestration**: Built with LangGraph for visual workflow debugging and state management
- **Real-time Streaming**: Stream responses to users for better UX
- **Source Attribution**: Provide references to source documents for transparency
- **Modern UI**: Next.js frontend with Tailwind CSS and responsive design
- **Security**: Comprehensive input validation, XSS protection, and rate limiting

**Tech Stack:**
- **Backend**: Node.js/TypeScript, LangGraph, LangChain, OpenAI
- **Frontend**: Next.js, React, Tailwind CSS
- **Vector Store**: Supabase
- **LLM Provider**: OpenAI (configurable)

**Architecture:**
- **Ingestion Graph**: Handles document processing and embedding storage
- **Retrieval Graph**: Manages question-answering and document retrieval
- **Monorepo Structure**: Organized with Turborepo for efficient development

## RAG Implementation Patterns

### Document Processing Pipeline
1. **Upload & Validation**: File type checking and size limits
2. **Text Extraction**: PDF parsing and content extraction
3. **Chunking**: Intelligent text segmentation for optimal retrieval
4. **Embedding Generation**: Vector representation using OpenAI embeddings
5. **Storage**: Persistent vector storage in Supabase

### Retrieval & Generation Workflow
1. **Query Processing**: User question analysis and intent detection
2. **Semantic Search**: Vector similarity search across document chunks
3. **Context Assembly**: Relevant document retrieval and context building
4. **Response Generation**: LLM-powered answer generation with source references
5. **Streaming Delivery**: Real-time response streaming to frontend

## Development Setup

### Prerequisites

**For Open-Source RAG Example:**
- Python 3.9-3.12
- A local `.gguf` model file (e.g., Phi-3 Mini)
- Virtual environment support

**For AI Document Chat Assistant:**
- Node.js v18+ (recommended: v20)
- Yarn package manager
- Docker Desktop (for Supabase)
- Supabase CLI
- OpenAI API key
- LangSmith account (optional, for debugging)

### Quick Start

#### Open-Source RAG Example
```bash
# Clone the repository
git clone https://github.com/darinz/RAG.git
cd app/open-source

# Set up Python environment
python3 -m venv .venv
source .venv/bin/activate
pip install -U pip
pip install -r requirements.txt

# Download a GGUF model (e.g., Phi-3 Mini)
# Place your PDFs in the pdf/ directory

# Run with environment file
cp env.example .env
# Edit .env with your model path and settings
python main.py --question "What are the key takeaways?"

# Or run directly with arguments
python main.py \
  --question "What are the key takeaways?" \
  --model-path "/path/to/your/model.gguf" \
  --pdf-dir "./pdf"
```

#### AI Document Chat Assistant
```bash
# Clone the repository
git clone https://github.com/darinz/RAG.git
cd app/rag

# Install dependencies
yarn install

# Set up Docker and Supabase
# Install Docker Desktop from https://docs.docker.com/desktop/
brew install supabase/tap/supabase
supabase init
supabase start

# Set up environment variables
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
# Edit the .env files with your API keys

# Set up database (run SQL commands in Supabase Studio)
# Access http://localhost:54323 and run the database setup commands

# Start development servers
# Terminal 1: Backend
cd backend
yarn langgraph:dev  # Backend on port 2024

# Terminal 2: Frontend  
cd frontend
yarn dev            # Frontend on port 3000
```

## Configuration

### Environment Variables

#### Open-Source RAG Example (.env)
```bash
# Required
MODEL_PATH=/absolute/path/to/your/model.gguf
PDF_DIR=./pdf

# Optional
EMBEDDING_MODEL=BAAI/bge-small-en-v1.5
N_CTX=4096
```

#### AI Document Chat Assistant

**Backend (.env):**
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

**Frontend (.env):**
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

### Vector Store Setup

#### Open-Source RAG Example
Uses FAISS for local vector storage - no external setup required.

#### AI Document Chat Assistant
Uses Supabase as the vector store. Required setup:

1. **Database Table**: `documents` table with vector columns
2. **Similarity Function**: `match_documents` function for vector search
3. **Indexes**: Proper indexing for efficient similarity search

**Database Setup Commands:**
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

## Performance Considerations

### Open-Source RAG Example
- **Model Selection**: Choose appropriate GGUF model size for your hardware
- **Context Window**: Optimize `n_ctx` parameter for your use case
- **Chunking**: Adjust chunk sizes based on model context limits
- **FAISS Index**: Use appropriate FAISS index type for your data size
- **Memory Management**: Monitor RAM usage with large models

### AI Document Chat Assistant
- **Chunking**: Optimal text chunk sizes (typically 500-1000 tokens)
- **Embedding Models**: Efficient embedding generation with caching
- **Retrieval**: Configurable k-value for document retrieval
- **Caching**: Response caching for frequently asked questions
- **Rate Limiting**: API rate limiting to manage costs

### Scalability
- **Open-Source**: Single-machine processing with local storage
- **AI Chat Assistant**: 
  - **Horizontal Scaling**: Stateless backend design
  - **Database Optimization**: Proper indexing and query optimization
  - **CDN Integration**: Static asset delivery optimization
  - **Load Balancing**: Multiple backend instances

## Monitoring & Debugging

### Open-Source RAG Example
- **Verbose Logging**: Use `--verbose` flag for detailed LangChain logs
- **Model Performance**: Monitor inference speed and memory usage
- **Error Handling**: Graceful handling of PDF parsing failures
- **Local Debugging**: Use Python debugger for development

### AI Document Chat Assistant
- **LangSmith Integration**:
  - **Tracing**: Step-by-step execution tracking
  - **Debugging**: Visual workflow debugging through LangGraph Studio
  - **Performance**: Response time and token usage monitoring
  - **Error Tracking**: Detailed error logs and stack traces
- **Logging**:
  - **Structured Logging**: JSON-formatted logs for easy parsing
  - **Error Handling**: Comprehensive error handling and reporting
  - **Metrics**: Performance metrics and usage statistics

## Deployment

### Open-Source RAG Example
- **Local Deployment**: Run directly on your machine
- **Docker**: Containerize for consistent environments
- **Cloud VMs**: Deploy on cloud instances with sufficient RAM
- **Edge Computing**: Run on edge devices with local models

### AI Document Chat Assistant

#### Backend Deployment
- **LangGraph Cloud**: Managed deployment with automatic scaling
- **Self-hosted**: Docker containers with load balancing
- **Serverless**: AWS Lambda or similar serverless platforms

#### Frontend Deployment
- **Vercel**: Optimized for Next.js applications
- **Netlify**: Static site generation and hosting
- **AWS S3 + CloudFront**: Static hosting with CDN

## Future Enhancements

### Open-Source RAG Example
- **Model Optimization**: Support for more GGUF model formats
- **Advanced Chunking**: Semantic chunking with overlap strategies
- **Multi-modal Support**: Image and video document processing
- **Batch Processing**: Parallel document processing
- **Custom Embeddings**: Domain-specific embedding models
- **Web Interface**: Simple web UI for easier interaction

### AI Document Chat Assistant
- **Multi-modal Support**: Image and video document processing
- **Advanced Chunking**: Semantic chunking with overlap strategies
- **Hybrid Search**: Combining semantic and keyword search
- **Conversation Memory**: Long-term conversation context
- **Custom Embeddings**: Domain-specific embedding models
- **Authentication**: User management and access control
- **Analytics**: Usage tracking and performance metrics
- **API Gateway**: Rate limiting and request management
- **Caching Layer**: Redis for response caching
- **Monitoring**: Prometheus and Grafana integration

## Resources

### Documentation

#### Open-Source RAG Example
- [LangChain Documentation](https://python.langchain.com/)
- [Llama.cpp Documentation](https://github.com/ggerganov/llama.cpp)
- [FAISS Documentation](https://faiss.ai/)
- [Hugging Face BGE Models](https://huggingface.co/BAAI/bge-small-en-v1.5)

#### AI Document Chat Assistant
- [LangGraph Documentation](https://langchain-ai.github.io/langgraph/)
- [LangChain Documentation](https://js.langchain.com/)
- [Supabase Vector Store](https://supabase.com/docs/guides/ai/vector-embeddings)
- [OpenAI API Reference](https://platform.openai.com/docs)
- [Next.js Documentation](https://nextjs.org/docs)

### Community
- [LangChain Discord](https://discord.gg/langchain)
- [Supabase Community](https://github.com/supabase/supabase/discussions)
- [Next.js Community](https://nextjs.org/community)
- [Llama.cpp Community](https://github.com/ggerganov/llama.cpp/discussions)

## Contributing

We welcome contributions to improve these RAG applications:

1. **Fork** the repository
2. **Create** a feature branch
3. **Implement** your changes
4. **Test** thoroughly
5. **Submit** a pull request

### Development Guidelines

#### Open-Source RAG Example
- Follow Python best practices (PEP 8)
- Add comprehensive tests with pytest
- Update documentation and examples
- Ensure proper error handling
- Optimize for performance and memory usage

#### AI Document Chat Assistant
- Follow TypeScript best practices
- Add comprehensive tests with Jest
- Update documentation
- Ensure proper error handling
- Optimize for performance
- Maintain 80% test coverage

---

**Note**: These applications are designed for educational and production use. Always review and customize the code according to your specific requirements and security needs.
