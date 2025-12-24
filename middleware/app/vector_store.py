from langchain_qdrant import QdrantVectorStore
from langchain_openai import OpenAIEmbeddings
from app.config import VECTOR_COLLECTION_NAME, VECTOR_STORE_URL

embeddings = OpenAIEmbeddings(model="text-embedding-3-large", dimensions=3072)

vector_store = QdrantVectorStore.from_existing_collection(
    embedding=embeddings,
    collection_name=VECTOR_COLLECTION_NAME,
    url=VECTOR_STORE_URL,
)

retriever = vector_store.as_retriever(
    search_type="similarity_score_threshold",
    search_kwargs={"k": 2, "score_threshold": 0.7},
)
