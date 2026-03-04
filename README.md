# TerraSearch AI

AI-powered conversational search platform for Earth Observation data discovery. Combines vector similarity search (RAG) with LLM reasoning to deliver intuitive, context-aware answers with source attribution.

**Version:** 3.0.0

## Key features

- Natural-language chat over Earth Observation datasets (TERRA, WorldCereal, AgroSTAC, AGAME, DAB)
- RAG pipeline: Qdrant vector retrieval + GPT-4-turbo reasoning
- Session-based chat history with context carryover
- Source attribution per answer (`datasource` metadata returned with each response)
- Input sanitization, sensitive-data redaction, and per-IP rate limiting
- Langfuse tracing and optional LangSmith monitoring
- Redis-backed LLM response cache (1 h TTL)

## Architecture

```
┌─────────────┐      ┌──────────────┐      ┌─────────────────┐
│   Frontend  │─────▶│    Proxy     │─────▶│   Middleware    │
│ React + Vite│      │    Nginx     │      │     FastAPI     │
└─────────────┘      └──────────────┘      └────────┬────────┘
                                                    │
                          ┌─────────────────────────┼─────────────────┐
                          │                         │                 │
                   ┌──────▼──────┐          ┌──────▼──────┐  ┌──────▼──────┐
                   │    Redis    │          │   Qdrant    │  │  Langfuse   │
                   │  (Sessions  │          │  (Vectors)  │  │  (Tracing)  │
                   │   + Cache)  │          └─────────────┘  └─────────────┘
                   └─────────────┘
```

### Technology stack

| Layer            | Tech                                                          |
|------------------|---------------------------------------------------------------|
| Frontend         | React 18, TypeScript 5, Vite 5, Tailwind CSS 3                |
| Backend          | Python 3.12, FastAPI, LangChain, SlowAPI                      |
| LLM              | OpenAI GPT-4-turbo (`gpt-4-turbo-2024-04-09`)                 |
| Embeddings       | OpenAI `text-embedding-3-large` (3072 dimensions)             |
| Vector store     | Qdrant (collection `terrasearch_ai_collection`)               |
| Session / cache  | Redis 6                                                       |
| Tracing          | Langfuse (PostgreSQL-backed) + optional LangSmith             |
| Reverse proxy    | Nginx (bundles built frontend + proxies `/search`, `/docs`)   |
| Local LLM (opt.) | Ollama                                                        |

## Requirements

- Docker 20.10+ and Docker Compose 2.0+
- OpenAI API key (required for embeddings + chat completions)

Optional for local development without Docker:
- Node.js 18+ (frontend)
- Python 3.12+ (middleware)

## Setup

### 1. Environment variables

Copy `.env.example` to `.env` and fill in the required keys:

```bash
cp .env.example .env
```

Required:
- `OPENAI_API_KEY` — anything that touches the LLM or embeddings will fail without it
- `LANGFUSE_SECRET_KEY`, `LANGFUSE_PUBLIC_KEY` — the Langfuse callback handler runs `auth_check()` at startup

Optional:
- `LANGCHAIN_TRACING_V2`, `LANGCHAIN_API_KEY`, `LANGCHAIN_PROJECT` — enables LangSmith tracing

### 2. Start the stack

```bash
docker compose up -d
```

Brings up: `proxy`, `middleware`, `redis`, `qdrant`, `postgres`, `langfuse`, `ollama`.

### 3. Open the app

| Service        | URL                          |
|----------------|------------------------------|
| Frontend       | http://localhost:8080        |
| API docs       | http://localhost:8000/docs   |
| Langfuse       | http://localhost:3000        |
| Qdrant         | http://localhost:6333        |

### 4. Ingest documents

The vector store starts empty. Populate it by running the ingestion script from the host while the stack is up:

```bash
cd middleware
python ingestion/ingestion.py
```

The script is currently hard-coded to load `ingestion/terra.md` and tag chunks with `datasource = 'terra'`. To ingest additional sources, edit both the `TextLoader(...)` path **and** the `doc.metadata['datasource']` value, then re-run.

## API

Session lifecycle (also available via Swagger at `/docs`):

| Method | Path                   | Body                | Description                                           |
|--------|------------------------|---------------------|-------------------------------------------------------|
| POST   | `/search`              | —                   | Creates a session, returns `{search_id}`. Rate-limited 1000/h per IP. |
| POST   | `/search/{search_id}`  | `{"question": str}` | Runs the chain, returns `{response: [...full history...]}`. |
| DELETE | `/search/{search_id}`  | —                   | Deletes the Redis-backed session.                     |

## Modules

| Path           | Purpose                                                                  |
|----------------|--------------------------------------------------------------------------|
| `frontend/`    | React/TS single-page app (`<Chat/>`); built into the proxy image         |
| `middleware/`  | FastAPI app + LangChain pipeline + ingestion script + prompt templates   |
| `proxy/`       | Nginx + multi-stage Node build of the frontend                           |
| `redis/`       | Redis image wrapper (session storage + LLM response cache)               |
| `qdrant/`      | Qdrant image wrapper (vector store)                                      |
| `postgres/`    | Postgres image wrapper (Langfuse backing DB)                             |
| `langfuse/`    | Langfuse server image wrapper                                            |
| `ollama/`      | Ollama image wrapper (optional local LLM — not currently in the chain)   |

See `middleware/README.md` and `frontend/README.md` for module-level detail.

## Local development

### Frontend

```bash
cd frontend
npm install
npm run dev      # Vite dev server on :3000
npm run build    # tsc && vite build
npm run lint     # strict: --max-warnings 0
```

`npm run dev` alone will not reach the backend — `VITE_API_URL` defaults to the relative path `/search`, which only resolves through the Nginx proxy. For end-to-end work, use `docker compose up -d`.

> Editing frontend code does **not** affect the running stack on `:8080` unless you rebuild the proxy image:
> ```bash
> docker compose up -d --build proxy
> ```

### Middleware

```bash
cd middleware
pip install -r requirements.txt
uvicorn app.routes:app --reload --host 0.0.0.0 --port 8000
```

Requires Redis and Qdrant to be reachable. Easiest: leave the rest of the stack running in Docker (`docker compose up -d redis qdrant`) and run uvicorn against it. Override `REDIS_HOST=localhost` in your shell, and update `VECTOR_STORE_URL` in `middleware/app/config.py` to `http://localhost:6333` if running outside the Docker network.

## Configuration knobs

| Setting             | Location                                | Default                              |
|---------------------|-----------------------------------------|--------------------------------------|
| Vector collection   | `middleware/app/config.py`              | `terrasearch_ai_collection`          |
| Qdrant URL          | `middleware/app/config.py`              | `http://qdrant:6333`                 |
| Retrieval `k`       | `middleware/app/vector_store.py`        | `2`                                  |
| Similarity threshold| `middleware/app/vector_store.py`        | `0.7`                                |
| LLM model           | `middleware/app/chains.py`              | `gpt-4-turbo-2024-04-09` (temp `0`)  |
| LLM cache TTL       | `middleware/app/routes.py`              | `3600` s                             |
| Rate limit          | `middleware/app/routes.py`              | `1000/hour` on `POST /search`        |
| CORS origins        | `middleware/app/routes.py`              | `["*"]` — tighten for production     |
| Input blocklist     | `middleware/app/security.py`            | `;  --  SELECT  DROP  INSERT  DELETE`|
| Sensitive redaction | `middleware/app/security.py`            | `password`, `credit card`            |

## Monitoring

- **Langfuse** (http://localhost:3000): conversation traces, token usage, cost, latency, errors. Credentials set on first access.
- **LangSmith** (https://smith.langchain.com): only if `LANGCHAIN_TRACING_V2=true` in `.env`.
- **Logs:** `docker compose logs -f middleware` (or `-f` with no service for everything).

## Troubleshooting

| Symptom                           | Likely cause / fix                                                                 |
|-----------------------------------|------------------------------------------------------------------------------------|
| `404 Search not found`            | Redis restarted or session ID is stale — frontend should `POST /search` again.     |
| Empty / generic LLM responses     | Vector store not populated — run `python ingestion/ingestion.py`.                  |
| `OpenAI API error`                | Missing/invalid `OPENAI_API_KEY`, exceeded quota, or rate-limited upstream.        |
| `429 Rate limit exceeded`         | Hit the 1000/h cap on `POST /search`; raise the limit in `app/routes.py`.          |
| Frontend changes don't appear     | Rebuild the proxy: `docker compose up -d --build proxy`.                           |
| Langfuse `auth_check` failure     | Missing `LANGFUSE_SECRET_KEY` / `LANGFUSE_PUBLIC_KEY` in `.env`.                    |

### Reset state

```bash
docker compose restart redis                          # clears all sessions
docker compose down qdrant && \
  docker volume rm terrasearch-ai_qdrant_data && \
  docker compose up -d qdrant                         # wipes the vector store
```

## Security notes

- `sanitize_input` is a string-level blocklist (`;`, `--`, `SELECT`, `DROP`, `INSERT`, `DELETE`) — it is **not** real SQL-injection defense and will mangle legitimate user text containing those substrings. Treat it as a tripwire.
- `CORS` is open (`allow_origins=["*"]`). Restrict before production exposure.
- No authentication layer — anyone who can reach the API can create sessions.
- API keys live in `.env`; for production, use a secrets manager (Azure Key Vault, AWS Secrets Manager).

## Changelog

### v3.0.0 (current)
- Migrated to Qdrant vector store (collection `terrasearch_ai_collection`, `text-embedding-3-large`)
- Input sanitization, sensitive-data redaction, rate limiting (SlowAPI)
- Langfuse tracing integrated; optional LangSmith
- Redis-backed LLM response caching (1 h TTL)

### v2.0.0
- Advanced search capabilities, enhanced models
- Improved chat history management
- Additional data source integrations

### v1.0.0
- Initial release: basic chat, Redis session management, OpenAI GPT-4 integration, React frontend
