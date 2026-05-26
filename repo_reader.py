import os


# =========================
# SUPPORTED FILE TYPES
# =========================

SUPPORTED_EXTENSIONS = (
    ".py",
    ".js",
    ".ts",
    ".jsx",
    ".tsx",
    ".java",
    ".cpp",
    ".c",
    ".html",
    ".css",
    ".json",
    ".md"
)


# =========================
# IGNORE FOLDERS
# =========================

IGNORE_FOLDERS = (
    "node_modules",
    ".git",
    "__pycache__",
    "dist",
    "build",
    ".next",
    "venv",
    ".venv"
)


# =========================
# LOAD REPOSITORY
# =========================

def load_repository(repo_path):

    chunks = []

    for root, dirs, files in os.walk(repo_path):

        # Ignore unnecessary folders
        dirs[:] = [
            d for d in dirs
            if d not in IGNORE_FOLDERS
        ]

        for file in files:

            if file.endswith(
                SUPPORTED_EXTENSIONS
            ):

                file_path = os.path.join(
                    root,
                    file
                )

                try:

                    with open(
                        file_path,
                        "r",
                        encoding="utf-8"
                    ) as f:

                        content = f.read()

                        # Skip empty files
                        if len(content.strip()) == 0:
                            continue

                        chunks.append({
                            "file": file_path,
                            "content": content[:8000]
                        })

                except Exception:

                    continue

    return chunks