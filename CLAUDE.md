# CLAUDE.md

## Rules

- Test new features with agent-browser (skip only if user says "no tests")
- UI language is German (labels, errors, dates: DD.MM.YYYY, currency: EUR)
- If agent-browser can't find browser: `node_modules/agent-browser/bin/agent-browser install`

## Quick Start

```bash
cd 01-neo4j-Explorer-Vite
npm run dev:full          # Startet alles: Neo4j (Docker) + Backend + Frontend
```

App: http://localhost:5173/main/neo4j-explorer
Beim ersten Start: Im Import-Tab "Datenbank zurücksetzen & importieren" klicken.

## Commands

```bash
npm run dev:full         # Neo4j + Backend + Frontend (empfohlen)
npm run dev              # Backend + Frontend (Neo4j muss bereits laufen)
npm run db:start         # Nur Neo4j-Container starten
npm run db:stop          # Neo4j-Container stoppen
npm run db:reset         # Neo4j zurücksetzen (Daten löschen)
```

## Tech Stack

React 19 + TypeScript, Vite 7, TanStack Router, Zustand, Tailwind CSS 4, shadcn/ui, React Hook Form + Zod

## Project Structure

```
01-neo4j-Explorer-Vite/
├── src/apps/main/features/neo4j-explorer/  # Neo4j Explorer Feature
│   ├── components/       # Graph, Explorer, Search, Schema, Import Tabs
│   ├── hooks/            # useExplorerState (Zustand)
│   ├── lib/              # api.ts, types.ts, utils.ts
│   └── data/             # palette.ts
├── server/               # Express Backend-Proxy (Port 3001)
│   └── src/routes/       # nodes, schema, relationships, search, import, stats
├── docker-compose.yml    # Neo4j 5 Community
└── src/routes/main/_authenticated/neo4j-explorer.tsx  # Route

Ontology_UWWB/
├── ontology-spec.md      # Ontologie-Spezifikation
└── cypher/               # Constraints, Beispieldaten, Queries
```

## Neo4j

- Docker Compose, Credentials: `neo4j/neo4jneo4j`
- Bolt: `neo4j://127.0.0.1:7687`, Browser: http://localhost:7474
- Env-Variablen: `NEO4J_URI`, `NEO4J_USER`, `NEO4J_PASSWORD`, `NEO4J_DB`

## Conventions

- Routes: file-based in `src/routes/`, `_authenticated/` = protected
- Components: `@/apps/main/components/ui/` (shadcn/ui), `cn()` from `@/lib/utils`
- State: Zustand stores, feature-local in `hooks/`
- `@/` maps to `src/`
