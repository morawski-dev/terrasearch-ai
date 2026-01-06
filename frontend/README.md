# TerraSearch AI — Frontend

React + TypeScript + Vite single-page chat UI for the TerraSearch AI RAG stack. Talks to the FastAPI middleware through an nginx reverse proxy.

## Stack

- React 18 + TypeScript, bundled with Vite
- Tailwind CSS + custom ESA brand `@font-face` declarations in `src/index.css`
- No router, no state library — all UI state lives in `src/components/Chat/Chat.tsx` via `useState`
- No test runner (only `dev`, `build`, `lint`, `preview` scripts)

## Running

```bash
npm install
npm run dev      # Vite dev server on http://localhost:3000
npm run build    # tsc && vite build
npm run lint     # eslint --max-warnings 0 --report-unused-disable-directives
npm run preview  # serve the production build
```

`npm run dev` binds port 3000 and will **not** reach the middleware on its own — `VITE_API_URL` is set to the relative path `/search` and assumes a reverse proxy. For an end-to-end stack run `docker compose up -d --build proxy` from the repo root and open `http://localhost:8080`. The proxy image multi-stage-builds the frontend, so editing frontend code without rebuilding `proxy` will not be reflected in the Dockerized stack.

To hit the middleware directly from `npm run dev`, point `VITE_API_URL` at `http://localhost:8000/search` (or configure a Vite proxy).

## Backend contract

Three calls in `Chat.tsx`, all relative to `VITE_API_URL`:

| Request | Purpose |
|---------|---------|
| `POST ${VITE_API_URL}` | Create session → returns `{ search_id }` |
| `POST ${VITE_API_URL}/${searchId}` with `{ question }` | Returns the **full** updated chat history in `data.response` |
| `DELETE ${VITE_API_URL}/${searchId}` | End session |

The server returns the entire chat history each turn (not a delta); `setChatHistory(data.response)` replaces local state wholesale. Message shape: `{ role: "human" | "assistant", content: string, datasource?: string[] }`.

A Redis restart on the middleware side clears all sessions — the frontend will see a 404 ("Search not found") and must `POST` for a new `search_id`.

## Component layout

```
src/
├── App.tsx                    renders <Chat/>
├── index.css                  Tailwind + ESA @font-face
└── components/
    ├── Chat/
    │   ├── Chat.tsx           all state, lifecycle, fetch calls
    │   ├── Typewriter.tsx     character-by-character assistant reply
    │   └── DataSource.tsx     icon lookup by datasource name
    └── ...
```

### Adding a new datasource

`DataSource.tsx` hardcodes a lowercased-string lookup (`worldcereal`, `agrostac`, `agame`, `terra`). When the backend exposes a new source:

1. Add a branch in `DataSource.tsx` matching `text.toLowerCase()`.
2. Drop the icon image under `public/assets/`.

## Styling conventions

Tailwind utility classes with brand colors inlined as arbitrary values:

| Color     | Usage                         |
|-----------|-------------------------------|
| `#01decd` | cyan accent                   |
| `#0763aa` / `#0664a4` | blue gradient endpoint |
| `#3c719c` | input border                  |
| `#047274` | user message bubble           |

Fonts: `font-esa`, `font-esabold`, etc. (declared in `tailwind.config.js`, files in `public/`). Reuse these rather than introducing new shades or font families. No Prettier — match surrounding style.

## Linting

`npm run lint` is strict: `--max-warnings 0` and `--report-unused-disable-directives`. CI / pre-commit will fail on any warning.

## Verifying changes

There is no test suite. To verify a change:

1. `npm run build` — type-checks via `tsc &&` before bundling.
2. `docker compose up -d --build proxy middleware` from the repo root and exercise the UI at `http://localhost:8080` against a running middleware + Qdrant + Redis stack.
