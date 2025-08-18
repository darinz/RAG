# Retrieval-Augmented Generation (RAG)

Welcome to the **RAG Repository**, a comprehensive resource designed to facilitate learning and practical experience with **Retrieval-Augmented Generation (RAG)** techniques. This repository is structured to provide both theoretical foundations and hands-on implementation experience.

## What is RAG?

Retrieval-Augmented Generation (RAG) combines information retrieval techniques with generative language models to create AI systems that can provide accurate, factual, and contextually relevant responses. RAG systems retrieve relevant documents or information and use them to generate more informed and reliable answers.

## Repository Structure

### `/app` - Production RAG Implementation
**`/ai-pdf-chatbot`**: Full-stack RAG system with LangGraph backend and Next.js frontend
- **Backend**: LangGraph workflows, dual graph system (ingestion + retrieval), multi-format support
- **Frontend**: TypeScript, real-time chat, file upload, responsive UI with shadcn/ui
- **Tech Stack**: Python/LangGraph/OpenAI/ChromaDB + Next.js/Tailwind

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

### Quick Start with the Chatbot

1. **Clone the Repository**
   ```bash
   git clone https://github.com/darinz/RAG.git
   cd RAG
   ```

2. **Set up the Backend**
   ```bash
   cd app/ai-pdf-chatbot/backend
   npm install
   # Set up environment variables
   cp .env.example .env
   # Add your OpenAI API key
   ```

3. **Set up the Frontend**
   ```bash
   cd ../frontend
   npm install
   ```

4. **Run the Application**
   ```bash
   # Terminal 1: Start backend
   cd backend && npm run dev
   
   # Terminal 2: Start frontend
   cd frontend && npm run dev
   ```

5. **Upload a PDF and Start Chatting**
   - Navigate to `http://localhost:3000`
   - Upload a PDF document
   - Ask questions about the document content

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

### Advanced RAG Implementation
- **Graph-based workflows** using LangGraph
- **Modular architecture** for easy customization
- **Multiple retrieval strategies** (dense, sparse, hybrid)
- **State management** for complex conversations
- **Production-ready** with error handling and logging

### Comprehensive Learning Resources
- **Structured learning paths** for all skill levels
- **Practical implementation guides**
- **Research paper collection** with verified links
- **Community resources** and best practices

### Modern Technology Stack
- **Backend**: Python, LangGraph, LangChain, OpenAI
- **Frontend**: Next.js, TypeScript, Tailwind CSS
- **Database**: ChromaDB for vector storage
- **Architecture**: Graph-based, modular, scalable

## Contributing

We welcome contributions to improve this RAG learning repository:

- **Add new research papers** to `/research`
- **Improve learning materials** in `/reference`
- **Enhance the chatbot implementation** in `/app`
- **Report bugs** or suggest new features
- **Share your RAG implementations** and experiences

## Resources

### Official Documentation
- [LangGraph Documentation](https://langchain-ai.github.io/langgraph/)
- [LangChain Documentation](https://docs.langchain.com/)
- [Next.js Documentation](https://nextjs.org/docs)

### Research Papers
- [Original RAG Paper](https://arxiv.org/abs/2005.11401) (Lewis et al., 2020)
- [RAGAS Evaluation Framework](https://arxiv.org/abs/2209.14135)
- [Self-RAG Paper](https://arxiv.org/abs/2310.11511)

### Community
- [LangChain Community](https://discord.gg/langchain)
- [RAG-focused conferences](https://aclweb.org/) (ACL, EMNLP, SIGIR)