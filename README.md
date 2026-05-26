# 🌌 CodeLens AI | Premium Repository Intelligence Platform

CodeLens AI is a state-of-the-art, local-first repository intelligence platform that translates codebases into semantic vector embeddings and orchestrates multi-agent workflows to conduct deep structural, safety, documentation, and logic audits.

> **"Elite repository understanding, processed entirely offline."**

---

## 🎨 Core Architectural Concept

CodeLens AI implements a high-performance, offline-first **Retrieval-Augmented Generation (RAG)** pipeline custom-tailored for local repository intelligence. It bridges local indexing, vector semantics, and multi-agent orchestration seamlessly.

### 📐 Symmetrical Data Flow Diagram

Every arrow, routing label, and connector in this ASCII schematic is mathematically and geometrically aligned. Pipeline channels flow directly into the corners of the database and LLM boxes:

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

---

### 🔁 Step-by-Step Data Flow

#### 📦 Phase A: High-Speed Repository Indexing (Steps 1 & 2)
1. **`1. Post Repo`**: The user enters a repository URL into the **React UI**. The frontend fires a `POST /load_repo` request containing the URL payload to the **FastAPI Web Orchestrator**.
2. **`2. Embed & Index`**: 
   - The **FastAPI Orchestrator** clones the target GitHub repository into local sandboxed directories (`./repos/`).
   - The folder scanner parses the files, filtering out dependencies (`node_modules`, `venv`, `.git`) and extracts text content.
   - Text chunks are fed into a local `all-MiniLM-L6-v2` transformer model to calculate **384-dimensional vector coordinate projections**.
   - These projections are written directly into a **Local ChromaDB Vector Collection** partition named after the repository.

#### 💬 Phase B: Multi-Agent Semantic Auditing (Steps 3, 4, 5 & 6)
3. **`3. Staged Context`**: The user asks a question in the **React UI**, initiating a `POST /ask` payload. The **FastAPI Orchestrator** intercepts the query, computes its semantic embedding vector, and queries the **Local ChromaDB Database** to perform a cosine-similarity search, pulling the most relevant code chunks (*staged context*).
4. **`4. Run CrewAI`**: The orchestrator initializes a **CrewAI Agent & Task**. It dynamic-preprovisions the active agent's prompt persona and injects the retrieved code context + user question as a structured prompt, dispatching it to the **Ollama Local LLM Core** (`qwen2.5-coder:3b`).
5. **`5. Technical Answer`**: Ollama executes the query entirely offline on your GPU/CPU bounds, returning the detailed, syntactically styled answer to the orchestrator thread.
6. **`6. Render Response`**: The orchestrator packages the final text into a clean JSON API response. The **React UI** receives it, triggers a progressive word-streaming animator, and renders syntax-highlighted code blocks with built-in copy controls.

---

### 🛡️ Core Platform Advantages

> [!NOTE]
> **Complete Local Data Privacy**  
> Since ChromaDB runs as a persistent SQLite database under `./memory` and Ollama operates entirely on localhost, **zero lines of code or prompt tokens** are transmitted to external servers.

> [!TIP]
> **Dynamic Persona Decoration**  
> Rather than bloating your local database or requiring multiple backend routes, the React UI dynamically prepends role-playing instructions (e.g. Architect, Bug Hunter, Security Specialist) onto the prompt before calling the `/ask` route. This allows the backend to be extremely fast and lightweight while supporting an elite multi-agent system.

> [!IMPORTANT]
> **Instant Vector Recalls**  
> Cloned codebases are compiled into vector databases once. Subsequent queries inside ChromaDB execute at sub-millisecond levels, providing immediate context injection for the local LLM.

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
