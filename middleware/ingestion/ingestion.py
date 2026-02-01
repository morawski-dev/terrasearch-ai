from dotenv import find_dotenv, load_dotenv
from langchain_community.document_loaders.text import TextLoader
from langchain_openai.embeddings.base import OpenAIEmbeddings
from langchain.text_splitter import MarkdownHeaderTextSplitter
from langchain_community.vectorstores import Qdrant
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Load environment variables from a .env file
load_dotenv(find_dotenv())

# Document loader
loader = TextLoader("ingestion/terra.md")
docs = loader.load()
txt = " ".join([d.page_content for d in docs])

# Markdown splitter
headers_to_split_on = [
    ("#", "Header 1"),
    ("##", "Header 2"),
    ("###", "Header 3")
]
markdown_splitter = MarkdownHeaderTextSplitter(headers_to_split_on=headers_to_split_on, strip_headers=False)
documents = markdown_splitter.split_text(txt)

for doc in documents:
    doc.metadata['datasource'] = 'terra'

# Embeddings
embeddings = OpenAIEmbeddings(model="text-embedding-3-large", dimensions=3072)

# Qdrant
url = "http://localhost:6333"
qdrant = Qdrant.from_documents(
    documents,
    embeddings,
    url=url,
    prefer_grpc=True,
    collection_name="terrasearch_ai_collection"
)
