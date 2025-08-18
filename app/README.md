# RAG Applications

This directory contains production-ready Retrieval-Augmented Generation (RAG) applications built with modern AI/ML technologies. Each application demonstrates different approaches to document processing, vector storage, and conversational AI.

## Available Applications

### [AI PDF Chatbot](./ai-pdf-chatbot/)

A comprehensive RAG system that ingests PDF documents and provides intelligent question-answering capabilities.

**Key Features:**
- **Document Ingestion**: Upload and process PDF documents with automatic text extraction and chunking
- **Vector Storage**: Store embeddings in Supabase vector database for efficient similarity search
- **LangGraph Orchestration**: Built with LangGraph for visual workflow debugging and state management
- **Real-time Streaming**: Stream responses to users for better UX
- **Source Attribution**: Provide references to source documents for transparency
- **Modern UI**: Next.js frontend with Tailwind CSS and responsive design

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
- Node.js v18+ (recommended: v20)
- Yarn package manager
- Supabase account and project
- OpenAI API key
- LangSmith account (optional, for debugging)

### Quick Start
```bash
# Clone the repository
git clone <repository-url>
cd app

# Install dependencies
yarn install

# Set up environment variables
cp ai-pdf-chatbot/backend/.env.example ai-pdf-chatbot/backend/.env
cp ai-pdf-chatbot/frontend/.env.example ai-pdf-chatbot/frontend/.env

# Start development servers
cd ai-pdf-chatbot
yarn langgraph:dev  # Backend on port 2024
yarn dev            # Frontend on port 3000
```

## Configuration

### Environment Variables
Each application requires specific environment variables:

**Required:**
- `OPENAI_API_KEY`: Your OpenAI API key
- `SUPABASE_URL`: Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY`: Supabase service role key

**Optional:**
- `LANGCHAIN_API_KEY`: LangSmith API key for debugging
- `LANGCHAIN_TRACING_V2`: Enable tracing (true/false)
- `LANGCHAIN_PROJECT`: LangSmith project name

### Vector Store Setup
The applications use Supabase as the vector store. Required setup:

1. **Database Table**: `documents` table with vector columns
2. **Similarity Function**: `match_documents` function for vector search
3. **Indexes**: Proper indexing for efficient similarity search

## Performance Considerations

### Optimization Strategies
- **Chunking**: Optimal text chunk sizes (typically 500-1000 tokens)
- **Embedding Models**: Efficient embedding generation with caching
- **Retrieval**: Configurable k-value for document retrieval
- **Caching**: Response caching for frequently asked questions
- **Rate Limiting**: API rate limiting to manage costs

### Scalability
- **Horizontal Scaling**: Stateless backend design
- **Database Optimization**: Proper indexing and query optimization
- **CDN Integration**: Static asset delivery optimization
- **Load Balancing**: Multiple backend instances

## Monitoring & Debugging

### LangSmith Integration
- **Tracing**: Step-by-step execution tracking
- **Debugging**: Visual workflow debugging through LangGraph Studio
- **Performance**: Response time and token usage monitoring
- **Error Tracking**: Detailed error logs and stack traces

### Logging
- **Structured Logging**: JSON-formatted logs for easy parsing
- **Error Handling**: Comprehensive error handling and reporting
- **Metrics**: Performance metrics and usage statistics

## Deployment

### Backend Deployment
- **LangGraph Cloud**: Managed deployment with automatic scaling
- **Self-hosted**: Docker containers with load balancing
- **Serverless**: AWS Lambda or similar serverless platforms

### Frontend Deployment
- **Vercel**: Optimized for Next.js applications
- **Netlify**: Static site generation and hosting
- **AWS S3 + CloudFront**: Static hosting with CDN

## Future Enhancements

### Planned Features
- **Multi-modal Support**: Image and video document processing
- **Advanced Chunking**: Semantic chunking with overlap strategies
- **Hybrid Search**: Combining semantic and keyword search
- **Conversation Memory**: Long-term conversation context
- **Custom Embeddings**: Domain-specific embedding models

### Integration Opportunities
- **Authentication**: User management and access control
- **Analytics**: Usage tracking and performance metrics
- **API Gateway**: Rate limiting and request management
- **Caching Layer**: Redis for response caching
- **Monitoring**: Prometheus and Grafana integration

## Resources

### Documentation
- [LangGraph Documentation](https://langchain-ai.github.io/langgraph/)
- [LangChain Documentation](https://js.langchain.com/)
- [Supabase Vector Store](https://supabase.com/docs/guides/ai/vector-embeddings)
- [OpenAI API Reference](https://platform.openai.com/docs)

### Community
- [LangChain Discord](https://discord.gg/langchain)
- [Supabase Community](https://github.com/supabase/supabase/discussions)
- [Next.js Community](https://nextjs.org/community)

## Contributing

We welcome contributions to improve these RAG applications:

1. **Fork** the repository
2. **Create** a feature branch
3. **Implement** your changes
4. **Test** thoroughly
5. **Submit** a pull request

### Development Guidelines
- Follow TypeScript best practices
- Add comprehensive tests
- Update documentation
- Ensure proper error handling
- Optimize for performance

---

**Note**: These applications are designed for educational and production use. Always review and customize the code according to your specific requirements and security needs.
