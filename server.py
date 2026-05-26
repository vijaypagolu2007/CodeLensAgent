import os

from git import Repo

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from crewai import Agent, Task, Crew, LLM

from repo_reader import load_repository
from vector_store import store_chunks, search_code


# =========================
# FASTAPI APP
# =========================

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# =========================
# GLOBAL STATE
# =========================

CURRENT_REPO = None


# =========================
# LOCAL LLM
# =========================

llm = LLM(
    model="ollama/qwen2.5-coder:3b",
    base_url="http://localhost:11434"
)


# =========================
# CREWAI AGENT
# =========================

code_agent = Agent(
    role="Senior Software Architect",
    goal="""
    Analyze repositories intelligently
    and explain architecture clearly.
    """,
    backstory="""
    Expert AI engineer,
    software architect,
    and debugger.
    """,
    verbose=False,
    llm=llm
)


# =========================
# REQUEST MODELS
# =========================

class RepoRequest(BaseModel):
    github_url: str


class QuestionRequest(BaseModel):
    question: str


# =========================
# LOAD REPOSITORY
# =========================

@app.post("/load_repo")
def load_repo(data: RepoRequest):

    global CURRENT_REPO

    try:

        repo_name = (
            data.github_url
            .split("/")[-1]
            .replace(".git", "")
        )

        repo_path = f"./repos/{repo_name}"

        # Clone repo only once
        if not os.path.exists(repo_path):

            Repo.clone_from(
                data.github_url,
                repo_path
            )

        print(f"\nLoading Repo: {repo_name}")

        # Read repository files
        chunks = load_repository(repo_path)

        if len(chunks) == 0:

            return {
                "error": "No supported code files found"
            }

        print(f"Loaded {len(chunks)} files")

        # Store embeddings per repository
        store_chunks(
            repo_name,
            chunks
        )

        CURRENT_REPO = repo_name

        return {
            "message": "Repository indexed successfully",
            "repository": repo_name,
            "files_indexed": len(chunks)
        }

    except Exception as e:

        return {
            "error": str(e)
        }


# =========================
# ASK QUESTIONS
# =========================

@app.post("/ask")
def ask_question(data: QuestionRequest):

    global CURRENT_REPO

    try:

        if CURRENT_REPO is None:

            return {
                "error": "No repository loaded"
            }

        print(f"\nSearching Repo: {CURRENT_REPO}")

        # Semantic search ONLY inside current repo
        results = search_code(
            CURRENT_REPO,
            data.question,
            n_results=1
        )

        context = "\n\n".join(
            results["documents"][0][:1]
        )

        # CrewAI Task
        task = Task(
            description=f"""
            Analyze this repository context:

            {context}

            Question:
            {data.question}
            """,
            expected_output="""
            Detailed technical explanation.
            """,
            agent=code_agent
        )

        # Run AI
        crew = Crew(
            agents=[code_agent],
            tasks=[task],
            verbose=False
        )

        result = crew.kickoff()

        return {
            "repository": CURRENT_REPO,
            "answer": str(result)
        }

    except Exception as e:

        return {
            "error": str(e)
        }


# =========================
# ROOT ROUTE
# =========================

@app.get("/")
def root():

    return {
        "status": "CodeLens AI Running"
    }