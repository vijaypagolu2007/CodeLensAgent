import os

# pyrefly: ignore [missing-import]
from crewai import Agent, Task, Crew, LLM

from repo_reader import load_repository
from vector_store import store_chunks, search_code


# =========================
# Detect repositories
# =========================

REPOS_DIR = "./repos"

repos = [
    repo for repo in os.listdir(REPOS_DIR)
    if os.path.isdir(os.path.join(REPOS_DIR, repo))
]

if not repos:
    print("No repositories found inside /repos")
    exit()


print("\nAvailable Repositories:\n")

for idx, repo in enumerate(repos, start=1):
    print(f"{idx}. {repo}")

choice = int(input("\nSelect repository number: "))

selected_repo = repos[choice - 1]

repo_path = os.path.join(REPOS_DIR, selected_repo)

print(f"\nSelected Repo: {selected_repo}")


# =========================
# Load Local LLM
# =========================

llm = LLM(
    model="ollama/qwen2.5-coder:3b",
    base_url="http://localhost:11434"
)


# =========================
# Create AI Agent
# =========================

code_agent = Agent(
    role="Senior Code Architect",
    goal="""
    Analyze repositories and explain
    architecture, logic, and code clearly.
    """,
    backstory="""
    You are an elite software architect,
    code reviewer, debugger, and AI engineer.
    """,
    verbose=True,
    llm=llm
)


# =========================
# Load Repository Files
# =========================

print("\nScanning repository...\n")

chunks = load_repository(repo_path)

print(f"Loaded {len(chunks)} code files")


if len(chunks) == 0:
    print("No supported code files found.")
    exit()


# =========================
# Store Embeddings
# =========================

print("\nCreating vector embeddings...\n")

store_chunks(chunks)

print("Repository indexed successfully.\n")


# =========================
# User Query
# =========================

query = input("Ask about the repository:\n> ")


# =========================
# Semantic Search
# =========================

results = search_code(query)

context = "\n\n".join(
    results["documents"][0]
)


# =========================
# AI Analysis Task
# =========================

task = Task(
    description=f"""
    Analyze the following repository context:

    {context}

    Answer this question:

    {query}
    """,
    expected_output="""
    Detailed technical explanation with
    architecture insights and reasoning.
    """,
    agent=code_agent
)


# =========================
# Run CrewAI
# =========================

crew = Crew(
    agents=[code_agent],
    tasks=[task],
    verbose=True
)

print("\nRunning AI analysis...\n")

result = crew.kickoff()


# =========================
# Final Output
# =========================

print("\n========================")
print("FINAL ANSWER")
print("========================\n")

print(result)