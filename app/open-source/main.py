#!/usr/bin/env python3
"""
Open-Source RAG example: ingest PDFs, embed with HuggingFace, index with FAISS,
and answer a user question using a local GGUF model via llama-cpp-python.

Mirrors the original logic on a per-PDF basis for simplicity.
"""

import argparse
import os
import sys
from typing import List

from dotenv import load_dotenv

from langchain_community.document_loaders import PyPDFLoader
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_community.llms import LlamaCpp
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_community.vectorstores import FAISS
from langchain_core.prompts import PromptTemplate
from langchain.chains import RetrievalQA


def parse_args() -> argparse.Namespace:
    load_dotenv()

    parser = argparse.ArgumentParser(description="Run a simple RAG pipeline over PDFs")
    parser.add_argument(
        "--model-path",
        type=str,
        default=os.getenv("MODEL_PATH"),
        help="Absolute path to your GGUF model file.",
    )
    parser.add_argument(
        "--pdf-dir",
        type=str,
        default=os.getenv("PDF_DIR", "./pdf"),
        help="Directory containing input PDFs.",
    )
    parser.add_argument(
        "--embedding-model",
        type=str,
        default=os.getenv("EMBEDDING_MODEL", "BAAI/bge-small-en-v1.5"),
        help="Embedding model identifier on Hugging Face.",
    )
    parser.add_argument(
        "--n-ctx",
        type=int,
        default=int(os.getenv("N_CTX", "4096")),
        help="Context window for llama-cpp-python.",
    )
    parser.add_argument(
        "--question",
        type=str,
        required=False,
        default=os.getenv("QUESTION"),
        help="Question to ask of each PDF.",
    )
    parser.add_argument(
        "--verbose",
        action="store_true",
        help="Enable verbose LangChain logging.",
    )
    return parser.parse_args()


def validate_inputs(model_path: str, pdf_dir: str, question: str) -> None:
    if not model_path:
        print("ERROR: --model-path is required (or set MODEL_PATH in .env)")
        sys.exit(2)
    if not os.path.isabs(model_path):
        print("ERROR: --model-path must be an absolute path to the GGUF file")
        sys.exit(2)
    if not os.path.exists(model_path):
        print(f"ERROR: model file not found: {model_path}")
        sys.exit(2)
    if not os.path.isdir(pdf_dir):
        print(f"ERROR: pdf directory not found: {pdf_dir}")
        sys.exit(2)
    if not question:
        print("ERROR: --question is required (or set QUESTION in .env)")
        sys.exit(2)


def build_llm(model_path: str, n_ctx: int, verbose: bool) -> LlamaCpp:
    return LlamaCpp(
        model_path=model_path,
        n_ctx=n_ctx,
        verbose=verbose,
    )


def build_prompt() -> PromptTemplate:
    template = (
        """<|user|>\n"""
        "Relevant information:\n{context}\n\n"
        "Provide a concise answer the following question using the relevant information provided above:\n"
        "{question}<|end|>\n<|assistant|>"
    )
    return PromptTemplate(template=template, input_variables=["context", "question"])


def extract_text_chunks_from_pdf(pdf_path: str) -> List[str]:
    loader = PyPDFLoader(pdf_path)
    pages = loader.load_and_split()
    text_splitter = RecursiveCharacterTextSplitter(chunk_size=500, chunk_overlap=200)
    texts = text_splitter.split_documents(pages)
    return [d.page_content for d in texts]


def run_rag_over_pdf(
    pdf_path: str,
    question: str,
    llm: LlamaCpp,
    embedding_model_name: str,
    prompt: PromptTemplate,
    verbose: bool,
) -> None:
    print(f"\nProcessing File: {pdf_path}")
    try:
        text_chunks = extract_text_chunks_from_pdf(pdf_path)
        if not text_chunks:
            print("No text extracted; skipping.")
            return
        embeddings = HuggingFaceEmbeddings(model_name=embedding_model_name)
        db = FAISS.from_texts(text_chunks, embeddings)

        rag = RetrievalQA.from_chain_type(
            llm=llm,
            chain_type="stuff",
            retriever=db.as_retriever(),
            chain_type_kwargs={"prompt": prompt},
            verbose=verbose,
        )

        output = rag.invoke(question)
        if isinstance(output, dict) and "result" in output:
            print(output["result"])  # concise answer
        else:
            print(output)  # fallback
    except Exception as exc:
        print(f"Failed to process {pdf_path}: {exc}")


def main() -> None:
    args = parse_args()
    validate_inputs(args.model_path, args.pdf_dir, args.question)

    llm = build_llm(args.model_path, args.n_ctx, args.verbose)
    prompt = build_prompt()

    # Process all PDFs in the directory
    pdf_paths = []
    for dirpath, _, filenames in os.walk(args.pdf_dir):
        for name in filenames:
            if name.lower().endswith(".pdf"):
                pdf_paths.append(os.path.join(dirpath, name))
    pdf_paths.sort()

    if not pdf_paths:
        print(f"No PDFs found in {args.pdf_dir}")
        sys.exit(0)

    for path in pdf_paths:
        run_rag_over_pdf(
            pdf_path=path,
            question=args.question,
            llm=llm,
            embedding_model_name=args.embedding_model,
            prompt=prompt,
            verbose=args.verbose,
        )


if __name__ == "__main__":
    main()


