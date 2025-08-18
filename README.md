[![License](https://img.shields.io/github/license/darinz/learn-rag)](https://github.com/darinz/learn-rag/blob/main/LICENSE)
[![Build Status](https://img.shields.io/github/actions/workflow/status/darinz/learn-rag/ci.yml?branch=main)](https://github.com/darinz/learn-rag/actions)
[![Last Commit](https://img.shields.io/github/last-commit/darinz/learn-rag)](https://github.com/darinz/learn-rag/commits/main)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](https://github.com/darinz/learn-rag/pulls)
[![Language](https://img.shields.io/github/languages/top/darinz/learn-rag)](https://github.com/darinz/learn-rag/search?l=typescript)
[![Issues](https://img.shields.io/github/issues/darinz/learn-rag)](https://github.com/darinz/learn-rag/issues)
[![Stars](https://img.shields.io/github/stars/darinz/learn-rag?style=social)](https://github.com/darinz/learn-rag/stargazers)

# Retrieval-Augmented Generation (RAG) Learning Repository

Welcome to the **RAG Learning Repository**, a comprehensive resource designed to facilitate learning and practical experience with **Retrieval-Augmented Generation (RAG)** techniques. This repository is structured to emphasize both real-world use cases and theoretical understanding.

## What is RAG?
Retrieval-Augmented Generation (RAG) integrates traditional information retrieval methods with generative AI models to deliver accurate, context-aware answers by retrieving relevant documents and leveraging them in response generation.

## Repository Structure

```
.
├── paper
│   ├── README.md
│   └── <collection_of_papers_and_notes>
├── books
│   ├── README.md
│   └── <collection_of_books_and_summaries>
└── ai-pdf-chatbot
    ├── README.md
    ├── backend
    └── frontend
```

### 1. `/paper`
A curated collection of academic papers, blog posts, and technical documentation related to RAG. This directory is intended for:
- Exploring the theory behind RAG
- Tracking breakthroughs and implementations
- Summarizing and annotating key insights

### 2. `/books`
A growing library of books and book summaries providing deeper context on topics such as retrieval systems, natural language processing, transformers, and AI alignment. Use this directory to:
- Explore foundational and advanced concepts
- Read detailed analyses and conceptual frameworks
- Connect theoretical learning with practical applications

### 3. `/ai-pdf-chatbot`
A functional implementation of a **PDF-powered RAG chatbot**. This chatbot:
- Ingests PDF documents
- Generates embeddings and indexes them
- Answers user queries by retrieving relevant document chunks and generating responses using a language model

#### Features
- PDF parsing with `PyMuPDF` or `pdfminer.six`
- Embedding generation with `OpenAI`, `HuggingFace`, or `LangChain`
- Vector store support (e.g., FAISS or ChromaDB)
- JavaScript/TypeScript, Streamlit, or CLI-based interactive interface

## Getting Started

1. **Clone the Repository**
   ```bash
   git clone https://github.com/darinz/learn-rag.git
   cd learn-rag
   ```

## Recommended Learning Path
1. Review the materials in the `paper` directory
2. Explore foundational concepts in the `books` directory
3. Run the chatbot and experiment with different PDFs
4. Test various retrievers and LLMs
5. Develop your own RAG pipeline

## Useful Resources
- [Facebook AI RAG Paper (2020)](https://arxiv.org/abs/2005.11401)
- [LangChain Documentation](https://docs.langchain.com/)
- [Haystack by deepset](https://haystack.deepset.ai/)

## Contributing
Contributions are welcome. Please open issues, submit pull requests, or share relevant papers and implementations.

---

Thank you for your interest in advancing Retrieval-Augmented Generation.
