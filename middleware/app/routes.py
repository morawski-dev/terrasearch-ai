from fastapi import HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi import FastAPI
from google.api_core.exceptions import TemporaryRedirect
from langchain_core.globals import set_llm_cache
from langchain_community.cache import RedisCache
from slowapi import Limiter
from slowapi.errors import RateLimitExceeded
from slowapi.middleware import SlowAPIMiddleware
from slowapi.util import get_remote_address
from fastapi import Request
from app.redis_utils import redis_client
from app.chains import final_chain
from app.models import Question
from langchain_core.messages import AIMessage, HumanMessage
from langfuse.callback import CallbackHandler
import json
import uuid
import logging

from app.security import sanitize_input, redact_sensitive_info
from app.vector_store import vector_store

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI()

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize the SlowAPI Limiter
limiter = Limiter(key_func=get_remote_address)
app.state.limiter = limiter
app.add_middleware(SlowAPIMiddleware)

# Error handler for rate limiting
@app.exception_handler(TemporaryRedirect)
async def rate_limit_exceeded_handler(request: Request, exc: TemporaryRedirect):
    return HTTPException(
        status_code=429,
        detail="Rate limit exceeded. Try again later."
    )

# Callback Handler
langfuse_handler = CallbackHandler()
langfuse_handler.auth_check()

# Initialize LLM cache
set_llm_cache(RedisCache(redis_client, ttl=3600))

@app.post("/search/{search_id}")
async def search(search_id: str, question: Question):
    chat_history_json = redis_client.get(search_id)
    if chat_history_json is None:
        raise HTTPException(status_code=404, detail="Search not found")

    chat_history = json.loads(chat_history_json.decode("utf-8"))

    chat_history_formatted = [
        HumanMessage(content=msg["content"]) if msg["role"] == "human" else AIMessage(content=msg["content"])
        for msg in chat_history
    ]

    sanitized_input = sanitize_input(question.question)
    sanitized_input = redact_sensitive_info(sanitized_input)

    chain_input = {
        "question": sanitized_input,
        "chat_history": chat_history_formatted,
    }
    response = await final_chain.ainvoke(chain_input, config={"callbacks": [langfuse_handler]})
    logger.info(response)

    results = vector_store.similarity_search_with_relevance_scores(
        sanitized_input, k=2, score_threshold=0.7
    )

    for result in results:
        logger.info(f"Processing result: {result}")

    datasource = [result.metadata["datasource"] for result, _ in results ]
    logger.info(f"Datasource: {datasource}")

    chat_history.append({"role": "human", "content": sanitized_input})
    chat_history.append({"role": "assistant", "content": response, "datasource": list(set(datasource))})

    redis_client.set(search_id, json.dumps(chat_history))
    return {"response": chat_history}

@app.post("/search")
@limiter.limit("1000/hour")
async def start_search(request: Request):
    search_id = str(uuid.uuid4())
    redis_client.set(search_id, json.dumps([]))
    return {"search_id": search_id}

@app.delete("/search/{search_id}")
async def end_search(search_id: str):
    if not redis_client.exists(search_id):
        raise HTTPException(status_code=404, detail="Search not found")
    redis_client.delete(search_id)
    return {"message": "Search deleted"}
