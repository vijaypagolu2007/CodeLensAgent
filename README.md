# 🌌 CodeLens AI | Premium Repository Intelligence Platform

CodeLens AI is a state-of-the-art, local-first repository intelligence platform that translates codebases into semantic vector embeddings and orchestrates multi-agent workflows to conduct deep structural, safety, documentation, and logic audits.

> **"Elite repository understanding, processed entirely offline."**

---

## 🎨 Core Architectural Concept

```text
       ┌──────────────────────────────────────────────────┐
       │               CodeLens AI React UI               │
       └───────────┬──────────────────────────▲───────────┘
     1. Post Repo  │                          │ 6. Render
     4. Ask Query  ▼                          │    Response
       ┌──────────────────────────────────────────────────┐
       │             FastAPI Web Orchestrator             │
       │                 (server.py API)                  │
       └──────┬─────────────▲──────────────▲─────────────┬──────┘
              │             │              │             │
   2. Embed & │  3. Staged  │ 5. Technical │ 4. Run      │
      Index   │     Context │    Answer    │  CrewAI     │
              ▼             │              │             ▼
              ┌─────────────┐              ┌─────────────┐
              │    Local    │              │   Ollama    │
              │  ChromaDB   │              │  Local LLM  │
              └─────────────┘              └─────────────┘
```

### 🔁 Step-by-Step Data Flow

#### Phase A: Repository Indexing (Steps 1 & 2)
1. **Post Repo**: The user enters a repository URL into the **React UI**, which transmits a `POST /load_repo` payload.
2. **Embed & Index**: The **FastAPI Web Orchestrator** clones the repository locally, tokenizes the code files into chunks, calculates embedding vectors using `all-MiniLM-L6-v2`, and writes them directly into the **Local ChromaDB Vector Database**.

#### Phase B: Semantic Query Resolution (Steps 3, 4, 5, & 6)
3. **Ask Query**: The user asks a technical question about the repository in the **React UI** chat box, sending a `POST /ask` payload.
4. **Staged Context**: The **FastAPI Web Orchestrator** reads the user query, performs a semantic similarity search against the **Local ChromaDB Vector Database**, and retrieves the most relevant code chunks (*staged context*).
5. **Run CrewAI Task**: The orchestrator initializes a **CrewAI Agent & Task** using the retrieved code context + user question as a combined prompt, sending the task details to the **Ollama Local LLMs**.
6. **Technical Answer**: The **Ollama Local LLM** processes the task and returns the completed text response back to the orchestrator.
7. **Render Response**: The orchestrator returns the technical answer in a clean JSON response, which the **React UI** streams and renders with syntax highlighting.

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
