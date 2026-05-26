import chromadb

from sentence_transformers import SentenceTransformer


client = chromadb.PersistentClient(
    path="./memory"
)

embedding_model = SentenceTransformer(
    "all-MiniLM-L6-v2"
)


# =========================
# CREATE COLLECTION
# =========================

def get_collection(repo_name):

    collection = client.get_or_create_collection(
        name=repo_name
    )

    return collection


# =========================
# STORE CHUNKS
# =========================

def store_chunks(repo_name, chunks):

    collection = get_collection(repo_name)

    existing = collection.count()

    if existing > 0:
        return

    for idx, chunk in enumerate(chunks):

        embedding = embedding_model.encode(
            chunk["content"]
        ).tolist()

        collection.add(
            ids=[str(idx)],
            documents=[chunk["content"]],
            metadatas=[{
                "file": chunk["file"]
            }],
            embeddings=[embedding]
        )


# =========================
# SEARCH CODE
# =========================

def search_code(
    repo_name,
    query,
    n_results=1
):

    collection = get_collection(repo_name)

    query_embedding = embedding_model.encode(
        query
    ).tolist()

    results = collection.query(
        query_embeddings=[query_embedding],
        n_results=n_results
    )

    return results