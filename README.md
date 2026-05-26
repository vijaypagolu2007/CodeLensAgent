# 🌌 CodeLens AI | Premium Repository Intelligence Platform

CodeLens AI is a state-of-the-art, local-first repository intelligence platform that translates codebases into semantic vector embeddings and orchestrates multi-agent workflows to conduct deep structural, safety, documentation, and logic audits.

> **"Elite repository understanding, processed entirely offline."**

---

## 🎨 Core Architectural Concept

```
  ┌──────────────────────────────────────────────────────────┐
  │                   CodeLens AI React UI                   │
  └─────────────┬──────────────────────────────▲─────────────┘
   POST /load_repo                             │ POST /ask
                ▼                              │
  ┌──────────────────────────┐    ┌────────────┴─────────────┐
  │    FastAPI Orchestrator  │    │     CrewAI Playground    │
  └─────────────┬────────────┘    └────────────▲─────────────┘
                │                              │
                ▼                              │ Context retrieval
  ┌──────────────────────────┐    ┌────────────┴─────────────┐
  │   Local ChromaDB Collection │◄───┤  Ollama Local LLM Cores  │
  └──────────────────────────┘    └──────────────────────────┘
```

---

## 🚀 Key Features

* **Multi-Agent Playground**: Consult specialized CrewAI agents with custom personas, styles, and prompt parameters:
  * 📐 **Architect Agent**: Breaks down design patterns, directory mapping, and modular systems.
  - 🐞 **Bug Hunter**: Pinpoints async loop race conditions, type crashes, and boundary limits.
  - 🛡️ **Security Auditor**: Scans for credential leaks, input injection vulnerabilities, and OWASP issues.
  - ⚡ **Performance Optimizer**: Pinpoints CPU bottlenecks, heavy database requests, and memory limits.
  - 📝 **Technical Writer**: Drafts comprehensive modular API guides and clear codebase summaries.
* **Hacker Indexing Console**: Watch raw repository loading threads stream into local ChromaDB memory Collections in real-time.
* **Intelligent Insights Panel**: Explore tech allocation ratios, file count charts, and offline storage metrics.
* **100% Offline Assurance**: Processes code entirely offline under a sandboxed environment; no code blocks are transmitted outside your local machine.

---

## 🛠️ Tech Stack

* **Frontend**: React (Vite, CSS Variables, Lucide Icons, ReactMarkdown, smooth cubic-bezier transitions)
* **Backend**: FastAPI, Pydantic, GitPython
* **AI & Database Engine**: CrewAI (Agent Orchestration), ChromaDB (Persistent Vector Store), Ollama (`qwen2.5-coder:3b` local model), SentenceTransformers (`all-MiniLM-L6-v2`)

---

## 📦 Installation & Quickstart

Follow these steps to set up and run CodeLens AI locally:

### 1. Prerequisites
Ensure you have **Ollama** installed and running on your system, and pull the Qwen coding model:
```bash
# Pull the target local coder model
ollama pull qwen2.5-coder:3b
```

### 2. Configure Backend Server
Navigate to the root directory and create a clean stable Python 3.12 virtual environment using **`uv`**:
```bash
# Navigate to project root
cd CodeLensAgent

# Bootstrap stable Python 3.12 venv
uv venv venv --python 3.12

# Install backend dependencies via uv pip to fetch pre-compiled wheels
uv pip install --python venv/Scripts/python.exe fastapi uvicorn crewai chromadb sentence-transformers GitPython pydantic

# Start the FastAPI backend server
venv/Scripts/python -m uvicorn server:app --reload
```

The FastAPI backend will now be live on `http://127.0.0.1:8000`.

### 3. Configure React Frontend
Open a new terminal window, install npm dependencies, and start the development server:
```bash
# Navigate to frontend directory
cd CodeLensAgent/frontend

# Install Vite dependencies
npm install

# Launch frontend dev environment
npm run dev
```

Open the local link in your browser: `http://localhost:5173/`

---

## 🛡️ Directory Layout & Git Filtration

We maintain strict clean directory standards. The following temporary directories are automatically filtered and excluded from version control under our root `.gitignore`:
* `venv/`: Standardized Python virtual environment dependencies.
* `memory/`: Offline ChromaDB SQLite coordinate collections.
* `repos/`: Cloned target workspace codebases.
* `reports/`: Extracted code audit summaries.
* `node_modules/`: Local frontend build artifacts.

---

*Developed with precision for high-performance codebase auditing.*
*© 2026 CodeLens AI Platform Group*
