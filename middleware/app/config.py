import os
from dotenv import load_dotenv, find_dotenv

# Load .env variables
load_dotenv(find_dotenv())

REDIS_HOST = os.getenv("REDIS_HOST", "localhost")
REDIS_PORT = int(os.getenv("REDIS_PORT", 6379))
REDIS_DB = int(os.getenv("REDIS_DB", 0))
REDIS_PASSWORD = os.getenv("REDIS_PASSWORD", None)

VECTOR_COLLECTION_NAME = "terrasearch_ai_collection"
VECTOR_STORE_URL = "http://qdrant:6333"