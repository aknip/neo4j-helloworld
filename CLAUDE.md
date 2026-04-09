# CLAUDE.md

## General Rules

- Test new features with agent-browser (skip only if user says "no tests")
- UI language is German (labels, errors, dates: DD.MM.YYYY, currency: EUR)
- If agent-browser throws errors that browser can not be found, install Chromium browser: `node_modules/agent-browser/bin/agent-browser install`

## Tech Stack

React 19 + TypeScript, Vite 7, TanStack Router, Zustand, Tailwind CSS 4, shadcn/ui, React Hook Form + Zod

## Project Structure

```
src/
├── apps/                 # Generated themed demo apps (shadcn-create, nova-orange, mira-green)
├── components/ui/        # Shared shadcn/ui components
├── components/layout/    # Shared layout components
├── context/              # React context providers
│   └── flexible-theme-provider.tsx  # Runtime theme switching
├── features/portal1/     # Portal1 features (dashboard, tasks, users, oldtimer-versicherung)
├── lib/
│   ├── utils.ts          # cn() utility
│   └── theme-registry.ts # Theme metadata
├── routes/               # TanStack Router file-based routes
├── stores/               # Zustand stores
└── styles/               # CSS files

public/themes/            # Runtime theme CSS and config.json
scripts/create-app/       # CLI for generating themed apps
```

## Commands

```bash
npm run dev              # Start frontend + backend (Neo4j must be running)
npm run dev:full         # Start Neo4j (Docker) + frontend + backend
npm run db:start         # Start Neo4j container only
npm run db:stop          # Stop Neo4j container
npm run db:reset         # Reset Neo4j (delete all data, restart)
npm run build            # Build for production

# Generate new themed app
cd scripts/create-app && npm start -- --name my-app --preset "https://ui.shadcn.com/init?..."
```

## Neo4j Database

Neo4j runs via Docker Compose (`docker-compose.yml`). Credentials: `neo4j/neo4jneo4j`.

- Browser UI: http://localhost:7474
- Bolt: `neo4j://127.0.0.1:7687`
- Cypher-Dateien: `Ontology_UWWB/cypher/` (gemountet als `/import` im Container)
- Backend-Konfiguration via Env-Variablen: `NEO4J_URI`, `NEO4J_USER`, `NEO4J_PASSWORD`, `NEO4J_DB`

## Key Conventions

### Routing
- File-based in `src/routes/`
- `_authenticated/` = protected routes
- `(groupName)/` = route groups without URL segment

### Components
- Use `@/components/ui/` for shadcn/ui components
- Use `cn()` from `@/lib/utils` for conditional classes
- Feature components in `src/features/<app>/<feature>/components/`

### State
- Zustand stores in `src/stores/`
- Forms: React Hook Form + Zod schemas in `data/schema.ts`

### Themes
- Runtime switching via `useFlexibleTheme()` hook
- Theme CSS in `public/themes/[theme-name]/theme.css`
- Config in `public/themes/[theme-name]/config.json`
- Register new themes in `src/lib/theme-registry.ts`

## Path Aliases

`@/` maps to `src/`

## Apps Overview

| Route | Type | Description |
|-------|------|-------------|
| `/portal-1/*` | Platform | HOWDEN prototype (primary development) |
| `/reference-app/*` | Platform | Reference implementation (phasing out) |
| `/shadcn-create/*` | Demo | Default shadcn/ui theme |
| `/nova-orange/*` | Demo | Nova style + orange |
| `/mira-green/*` | Demo | Mira style + emerald |

## Adding New Demo Apps

```bash
cd scripts/create-app
npm start -- --name my-app --preset "https://ui.shadcn.com/init?style=nova&theme=blue&..."
```

Creates: `src/apps/`, `src/routes/`, `public/themes/`, updates `theme-registry.ts`

### Extending CLI Support
- New font: Add to `FONT_MAP` in `scripts/create-app/src/constants.ts`
- New style: Add to `VALID_STYLES` in `scripts/create-app/src/constants.ts`
- New color: Add to `scripts/create-app/data/theme-colors.json`
