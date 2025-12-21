
# MIDDLEWARE API

FastAPI application written in Python that integrates with Redis for session/cache management and Qdrant for vector retrieval, and uses LangChain + `langchain_openai` to orchestrate a RAG pipeline over Earth Observation content. The service manages chat sessions, rephrases follow-up questions into standalone queries, retrieves relevant context, and returns answers grounded in indexed sources.

## Project layout

```
middleware/
├── app/
│   ├── main.py            # Uvicorn entrypoint (imports the FastAPI app from routes.py)
│   ├── routes.py          # FastAPI app + CORS, SlowAPI rate limit, Langfuse handler, /search endpoints
│   ├── chains.py          # rephrase_chain | answer_chain LangChain pipeline (ChatOpenAI gpt-4-turbo)
│   ├── vector_store.py    # Qdrant client + embeddings (text-embedding-3-large, 3072 dims)
│   ├── redis_utils.py     # Redis client used for session history and LLM cache
│   ├── security.py        # sanitize_input + redact_sensitive_info applied before the chain runs
│   ├── models.py          # Pydantic request/response models
│   └── config.py          # Env-driven configuration (collection name, hosts, model IDs)
├── prompts/
│   ├── rephrase-prompt.json
│   └── answer-prompt.json
├── ingestion/             # Standalone one-shot loader (ingestion.py) + source markdown documents
├── Dockerfile             # Runs `uvicorn app.routes:app` on :8000
└── requirements.txt
```

## API surface

Three endpoints, all defined in `app/routes.py`:

| Method | Path | Purpose |
| ------ | ---- | ------- |
| `POST` | `/search` | Creates a new session, returns `{search_id}`. Rate-limited to 1000/hour per IP. |
| `POST` | `/search/{search_id}` | Body `{question}` — runs the RAG chain, persists the turn, returns the full chat history with retrieved `datasource` metadata on assistant messages. |
| `DELETE` | `/search/{search_id}` | Removes the session key from Redis. |

Message shape: `{role: "human" | "assistant", content: str, datasource?: string[]}`. The server returns the **entire** chat history each turn (not a delta).

## Local development

From `middleware/`:

```bash
pip install -r requirements.txt
uvicorn app.routes:app --reload --host 0.0.0.0 --port 8000
```

Requires Redis and Qdrant reachable on the hosts/ports declared in `app/config.py`, and a populated `.env` (at least `OPENAI_API_KEY` plus Langfuse keys — `langfuse_handler.auth_check()` runs at startup).

The recommended path is to run the whole stack via Docker Compose from the repo root (`docker compose up -d`) and rebuild this service with `docker compose up -d --build middleware` after code changes.

## Swagger API Docs

LOCAL ENV: 
http://localhost:8000/docs
