# Retrieval-Augmented Generation (RAG)

Welcome to the **RAG Repository**, a comprehensive resource designed to facilitate learning and practical experience with **Retrieval-Augmented Generation (RAG)** techniques. This repository is structured to provide both theoretical foundations and hands-on implementation experience.

## What is RAG?

Retrieval-Augmented Generation (RAG) combines information retrieval techniques with generative language models to create AI systems that can provide accurate, factual, and contextually relevant responses. RAG systems retrieve relevant documents or information and use them to generate more informed and reliable answers.

## Repository Structure

### `/app` - Production RAG Applications
**Two complete RAG implementations for different use cases:**

#### `/app/open-source` - Local RAG Example
- **Local LLM**: Uses `llama-cpp-python` with `.gguf` model files for offline inference
- **Open-Source Stack**: Python, LangChain, FAISS, Hugging Face BGE embeddings
- **Use Case**: Privacy-focused, offline RAG systems for local development
- **Tech Stack**: Python/LangChain/FAISS/Llama.cpp

#### `/app/rag` - AI Document Chat Assistant
- **Production RAG**: Full-stack system with LangGraph backend and Next.js frontend
- **AI Agent Smart Routing**: Intelligently determines direct AI vs RAG-enhanced responses
- **Modern UI**: Real-time chat, file upload, responsive design with security features
- **Tech Stack**: Node.js/LangGraph/OpenAI/Supabase + Next.js/Tailwind

### `/reference` - Learning Resources
Comprehensive guides and tutorials for RAG development:
- **Learning paths** for beginner to advanced levels
- **Implementation guides** for frameworks (LangChain, LlamaIndex, Haystack)
- **Best practices** and architectural patterns

### `/research` - Academic Foundation
Curated collection of RAG research and papers:
- **Core papers**: Foundational RAG, advanced architectures, evaluation frameworks
- **Component research**: Retrieval methods, generation techniques, evaluation metrics
- **Local documents**: Original RAG paper and transformer handbook (PDFs)

## Getting Started

### Choose Your RAG Implementation

#### Option 1: Open-Source Local RAG (Privacy-Focused)
Perfect for offline development, privacy-focused applications, and learning RAG fundamentals.

```bash
# Clone and set up
git clone https://github.com/darinz/RAG.git
cd RAG/app/open-source

# Set up Python environment
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt

# Download a GGUF model (e.g., Phi-3 Mini)
# Place your PDFs in the pdf/ directory

# Run with your model
python main.py \
  --question "What are the key takeaways?" \
  --model-path "/path/to/your/model.gguf" \
  --pdf-dir "./pdf"
```

#### Option 2: Production AI Chat Assistant (Cloud-Based)
Full-stack RAG system with modern UI, AI agent smart routing, and production features.

```bash
# Clone and set up
git clone https://github.com/darinz/RAG.git
cd RAG/app/rag

# Install dependencies
yarn install

# Set up Docker and Supabase
brew install supabase/tap/supabase
supabase init
supabase start

# Configure environment variables
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
# Add your OpenAI API key and Supabase credentials

# Start development servers
# Terminal 1: Backend
cd backend && yarn langgraph:dev

# Terminal 2: Frontend
cd frontend && yarn dev
```

### Quick Start Guide
1. **For Learning**: Start with the open-source example to understand RAG fundamentals
2. **For Production**: Use the AI Document Chat Assistant for full-featured applications
3. **For Experimentation**: Try both implementations to compare approaches

### Learning Path

1. **Start with Theory** (`/reference`)
   - Read the learning guides and tutorials
   - Understand RAG fundamentals and architecture

2. **Explore Research** (`/research`)
   - Review the foundational papers
   - Understand current research trends

3. **Build and Experiment** (`/app`)
   - Run the chatbot implementation
   - Modify and extend the system
   - Experiment with different configurations

## Key Features

### Two Complete RAG Implementations

#### Open-Source Local RAG
- **Privacy-First**: Complete offline operation with local models
- **Open-Source Stack**: Python, LangChain, FAISS, Hugging Face BGE
- **Educational**: Perfect for learning RAG fundamentals
- **Flexible**: Support for various GGUF model formats
- **CLI Interface**: Command-line tool for batch processing

#### Production AI Chat Assistant
- **AI Agent Smart Routing**: Intelligently determines response type
- **Graph-based workflows** using LangGraph for complex orchestration
- **Modern UI**: Real-time chat, file upload, responsive design
- **Security**: Input validation, XSS protection, rate limiting
- **Production-ready** with comprehensive error handling and logging

### Comprehensive Learning Resources
- **Structured learning paths** for all skill levels
- **Practical implementation guides** for both approaches
- **Research paper collection** with verified links
- **Community resources** and best practices

### Dual Technology Stacks
- **Local Stack**: Python/LangChain/FAISS/Llama.cpp for offline RAG
- **Production Stack**: Node.js/LangGraph/OpenAI/Supabase + Next.js/Tailwind
- **Architecture**: Modular, scalable, and educational

## Contributing

We welcome contributions to improve this RAG learning repository:

- **Add new research papers** to `/research`
- **Improve learning materials** in `/reference`
- **Enhance RAG implementations** in `/app` (both open-source and production)
- **Report bugs** or suggest new features
- **Share your RAG implementations** and experiences
- **Add new GGUF model support** for the open-source example
- **Improve AI agent routing** for the production chat assistant

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

### Research Papers
- [Original RAG Paper](https://arxiv.org/abs/2005.11401) (Lewis et al., 2020)
- [RAGAS Evaluation Framework](https://arxiv.org/abs/2209.14135)
- [Self-RAG Paper](https://arxiv.org/abs/2310.11511)

### Community
- [LangChain Discord](https://discord.gg/langchain)
- [Supabase Community](https://github.com/supabase/supabase/discussions)
- [Next.js Community](https://nextjs.org/community)
- [Llama.cpp Community](https://github.com/ggerganov/llama.cpp/discussions)
- [RAG-focused conferences](https://aclweb.org/) (ACL, EMNLP, SIGIR)