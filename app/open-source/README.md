### Open-Source RAG Example (LangChain + Llama.cpp + FAISS)

This example builds a simple Retrieval-Augmented Generation (RAG) pipeline using:

- LLM: `llama-cpp-python` (local `.gguf` model)
- Embeddings: `BAAI/bge-small-en-v1.5` via `langchain-huggingface`
- Vector store: FAISS
- PDF ingestion: `PyPDFLoader` from `langchain-community`

You provide a directory of PDFs, we index each file, and answer a prompt per file.

---

### 1) Prerequisites

- Python 3.9–3.12 recommended
- macOS, Linux, or Windows
- A local `.gguf` model file (for example, "Phi-3-mini-4k-instruct-q4.gguf"). You can obtain GGUF models from Hugging Face (e.g., the Phi-3 Mini instruct GGUF page).

---

### 2) Setup

```bash
cd app/open-source
python3 -m venv .venv
source .venv/bin/activate
pip install -U pip
pip install -r requirements.txt
```

Place your PDFs under `app/open-source/pdf/` (a placeholder file is included so the folder exists).

Download a GGUF model (e.g., Phi-3 Mini 4K Instruct q4) and note its absolute path, e.g. `/models/Phi-3-mini-4k-instruct-q4.gguf`.

---

### 3) Run

Option A — provide arguments explicitly:

```bash
python main.py \
  --question "What are the key takeaways?" \
  --model-path "/absolute/path/to/Phi-3-mini-4k-instruct-q4.gguf" \
  --pdf-dir "./pdf" \
  --n-ctx 4096
```

Option B — use a `.env` file:

1. Copy `.env.example` to `.env` and edit values.
2. Run:

```bash
python main.py --question "What are the key takeaways?"
```

You can also use the helper script which creates a venv, installs deps, and forwards any args you pass:

```bash
./run.sh --question "Summarize each document" --model-path "/absolute/path/to/Phi-3-mini-4k-instruct-q4.gguf"
```

---

### 4) CLI Options

- `--model-path` (string, required if not set in `.env`): Absolute path to your `.gguf` model.
- `--pdf-dir` (string, default: `./pdf`): Directory containing PDFs.
- `--embedding-model` (string, default: `BAAI/bge-small-en-v1.5`): Hugging Face embedding model.
- `--n-ctx` (int, default: `4096`): Context window for `llama-cpp-python`.
- `--question` (string, required): The question to ask of each PDF.
- `--verbose` (flag): Enable verbose LangChain logging.

Environment variables (via `.env`) supported: `MODEL_PATH`, `PDF_DIR`, `EMBEDDING_MODEL`, `N_CTX`.

---

### 5) Notes & Tips

- If you see an error like "model not found" ensure `--model-path` points to an existing `.gguf` file.
- If PDF parsing fails for a file, we skip it and continue.
- This example builds a separate FAISS index per PDF (mirroring the original example). If you want a single combined index across all PDFs, we can add that later.
- On Apple Silicon, the default wheels for `llama-cpp-python` typically work out of the box. If you need GPU acceleration or special build flags, consult that project's README.


