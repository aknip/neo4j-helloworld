# Implementierungsplan: Neo4j Explorer → Vite/React

## Quell-App (Python/Streamlit)

**Datei:** `00-neo4j-Explorer-Python/explorer_app.py` (843 Zeilen)

### Features der Python-App

| Tab | Name | Funktionalität |
|-----|------|----------------|
| 1 | **Graph** | Interaktive Netzwerk-Visualisierung (Pyvis), Label-Filter, Node-Limit-Slider, Farb-Legende |
| 2 | **Explorer** | CRUD für Nodes: Browse-Liste, Detail-Ansicht (Properties editieren), Beziehungen anzeigen/navigieren/erstellen/löschen, neue Nodes erstellen |
| 3 | **Suche** | Volltextsuche über alle String-Properties, Navigation zum Explorer |
| 4 | **Schema** | Labels mit Properties/Typen/Counts, Relationship-Types, Mermaid-Ontologie-Diagramm |
| Sidebar | **Import** | Cypher-Verzeichnis wählen, Dateien auflisten, DB reset + Import, Kurzstatistik (Nodes/Rels) |

### Neo4j-Verbindung

- Bolt-Protokoll `neo4j://127.0.0.1:7687`, Auth: `neo4j/neo4jneo4j`
- Read-Queries und Write-Queries getrennt
- Schema-Discovery via `db.schema.nodeTypeProperties()` / `db.schema.relTypeProperties()`

---

## Ziel-App (Vite/React)

**Verzeichnis:** `01-neo4j-Explorer-Vite/`, Main App unter `/main/*`

### Architektur-Entscheidung: Neo4j-Anbindung

**Problem:** Der Neo4j JavaScript-Treiber (`neo4j-driver`) nutzt Bolt/TCP und funktioniert **nicht direkt im Browser**. 

**Lösung: Leichtgewichtiger Express-Backend-Proxy**

- Kleiner Express-Server (`src/server/` oder `server/`) der Neo4j-Queries entgegennimmt
- REST-API-Endpoints für alle Operationen
- Frontend kommuniziert via `fetch`/`axios` mit dem Proxy
- Vorteil: Credentials bleiben im Backend, kein Driver im Browser nötig

**Alternative (einfacher, aber eingeschränkt):** Neo4j HTTP API direkt nutzen (Port 7474) — erfordert aber Transactional HTTP Endpoint und ist weniger komfortabel.

→ **Empfehlung: Express-Proxy** als eigenständiger `server/`-Ordner mit eigenem `package.json`.

---

## Implementierungsschritte

### Phase 1: Backend-Proxy (Neo4j API)

**Neue Dateien:**

```
01-neo4j-Explorer-Vite/
└── server/
    ├── package.json          # express, neo4j-driver, cors
    ├── tsconfig.json
    └── src/
        ├── index.ts          # Express-Server (Port 3001)
        ├── neo4j.ts          # Driver-Singleton, runQuery, runWrite
        └── routes/
            ├── schema.ts     # GET /api/schema/labels, /api/schema/rels
            ├── nodes.ts      # GET /api/nodes/:label, GET /api/nodes/detail/:eid
            │                 # POST /api/nodes, PUT /api/nodes/:eid, DELETE /api/nodes/:eid
            ├── relationships.ts  # POST /api/relationships, DELETE /api/relationships/:eid
            ├── search.ts     # GET /api/search?q=...
            ├── import.ts     # POST /api/import (Cypher-Dateien importieren)
            └── stats.ts      # GET /api/stats (Node/Rel Counts)
```

**API-Endpoints:**

| Method | Endpoint | Python-Äquivalent |
|--------|----------|-------------------|
| GET | `/api/schema/labels` | `get_labels_with_counts()` + `get_schema_overview()` |
| GET | `/api/schema/rels` | `get_rel_types_with_counts()` + `get_rel_schema_overview()` |
| GET | `/api/nodes?label=X&limit=200` | `get_nodes_by_label(label, limit)` |
| GET | `/api/nodes/:eid` | `get_node_detail(eid)` |
| POST | `/api/nodes` | `create_node(label, properties)` |
| PUT | `/api/nodes/:eid` | `update_node(eid, properties)` |
| DELETE | `/api/nodes/:eid` | `delete_node(eid)` |
| GET | `/api/nodes/:eid/properties` | `get_node_properties_for_label(label)` |
| POST | `/api/relationships` | `create_relationship(from, to, type)` |
| DELETE | `/api/relationships/:eid` | `delete_relationship(rel_eid)` |
| GET | `/api/search?q=text` | `search_nodes(search_text)` |
| GET | `/api/stats` | Node/Rel-Counts |
| POST | `/api/import/reset-and-import` | `reset_database()` + `import_cypher_files()` |
| GET | `/api/import/files?dir=...` | Cypher-Dateien auflisten |

### Phase 2: Frontend — Grundstruktur & Routing

**Neue Route-Dateien:**

```
src/routes/main/_authenticated/
└── neo4j-explorer/
    ├── route.tsx             # Layout mit Tabs
    ├── index.tsx             # Redirect → graph
    ├── graph.tsx             # Tab: Graph-Visualisierung
    ├── explorer/
    │   ├── route.tsx         # Explorer mit Sub-Routing
    │   └── index.tsx         # Browse/Detail/Create
    ├── search.tsx            # Tab: Suche
    └── schema.tsx            # Tab: Schema-Info
```

**Alternativ (einfacher):** Alle Tabs als Client-Side-State in einer einzigen Route:

```
src/routes/main/_authenticated/
└── neo4j-explorer.tsx        # Single route, Tabs via shadcn Tabs-Komponente
```

→ **Empfehlung: Single Route + Tabs** (näher am Python-Original, weniger Routing-Overhead)

**Sidebar-Eintrag** in `src/apps/main/components/layout/sidebar-data.ts`:

```typescript
import { Database } from 'lucide-react'

// In navGroups[0].items (General):
{
  title: 'Neo4j Explorer',
  url: '/main/neo4j-explorer',
  icon: Database,
}
```

### Phase 3: Feature-Modul — Komponenten

**Neue Dateien:**

```
src/apps/main/features/neo4j-explorer/
├── index.tsx                 # Haupt-Komponente mit Tabs
├── components/
│   ├── graph-tab.tsx         # Graph-Visualisierung
│   ├── explorer-tab.tsx      # Node-Browser + CRUD
│   ├── search-tab.tsx        # Volltextsuche
│   ├── schema-tab.tsx        # Schema-Übersicht
│   ├── node-list.tsx         # Node-Liste (Browse-Modus)
│   ├── node-detail.tsx       # Node-Detail mit Property-Editor
│   ├── node-create-form.tsx  # Formular: Node erstellen
│   ├── relationship-list.tsx # Beziehungs-Liste (ein/ausgehend)
│   ├── relationship-create.tsx # Formular: Beziehung erstellen
│   ├── graph-canvas.tsx      # Graph-Rendering (Cytoscape/react-force-graph)
│   ├── import-panel.tsx      # Import-Panel (in Sidebar oder Header)
│   └── stats-badge.tsx       # Node/Rel-Statistik
├── hooks/
│   ├── use-neo4j-query.ts    # TanStack Query Wrapper für API-Calls
│   └── use-explorer-state.ts # Zustand Store für Explorer-State
├── lib/
│   ├── api.ts                # Axios-Client für Backend-Proxy
│   ├── types.ts              # TypeScript-Typen (Node, Relationship, Schema)
│   └── utils.ts              # display_name(), label_color(), primary_label()
└── data/
    └── palette.ts            # Farbpalette (15 Farben)
```

### Phase 4: Detaillierte Komponenten-Umsetzung

#### 4.1 TypeScript-Typen (`lib/types.ts`)

```typescript
interface Neo4jNode {
  eid: string
  labels: string[]
  props: Record<string, unknown>
}

interface Neo4jRelationship {
  relId: string
  type: string
  relProps: Record<string, unknown>
  sourceId?: string
  sourceLabels?: string[]
  sourceProps?: Record<string, unknown>
  targetId?: string
  targetLabels?: string[]
  targetProps?: Record<string, unknown>
}

interface NodeDetail {
  node: { props: Record<string, unknown>; labels: string[] }
  outRels: Neo4jRelationship[]
  inRels: Neo4jRelationship[]
}

interface LabelSchema {
  label: string
  count: number
  properties: { name: string; types: string[]; mandatory: boolean }[]
}

interface RelTypeSchema {
  type: string
  count: number
  properties: { name: string; types: string[] }[]
}
```

#### 4.2 Graph-Visualisierung (`graph-tab.tsx`)

**Library:** `cytoscape` (direkt via `useRef`/`useEffect`, ohne react-cytoscapejs)

- Cytoscape-Container als `<div ref={cyRef}>` mit `useEffect`-Mount
- Label-Multiselect-Filter (shadcn Combobox/Popover mit Checkboxen)
- Max-Nodes-Slider (shadcn Slider)
- Farbige Nodes nach Label (cytoscape Style: `background-color` mapped auf Palette)
- Edges mit Relationship-Type als Label (cytoscape Style: `label: data(type)`)
- Directed Arrows (cytoscape Style: `target-arrow-shape: triangle`)
- Legende mit Farben und Counts (eigene React-Komponente neben dem Graph)
- Tooltip bei Hover via `cytoscape-popper` Extension + Tippy.js
- Layout: `cose` (Force-Directed) als Default, `breadthfirst` als Alternative
- `cy.fit()` nach Layout für optimalen Viewport

#### 4.3 Explorer-Tab (`explorer-tab.tsx`)

**State** (Zustand Store):
```typescript
interface ExplorerState {
  selectedLabel: string
  selectedEid: string | null
  mode: 'browse' | 'create' | 'detail'
  setLabel: (label: string) => void
  setEid: (eid: string | null) => void
  setMode: (mode: 'browse' | 'create' | 'detail') => void
}
```

**Browse-Modus:**
- Label-Select (shadcn Select)
- Button "Neuen Node erstellen"
- Node-Liste als klickbare Cards/Rows
- Klick → Detail-Modus

**Detail-Modus:**
- Header: Display-Name + Labels
- Buttons: Löschen, Schließen
- Property-Editor: React Hook Form mit dynamischen Feldern
- Ausgehende Beziehungen: Liste mit Öffnen/Löschen-Buttons
- Eingehende Beziehungen: Liste mit Öffnen/Löschen-Buttons  
- Beziehung erstellen: Select für Typ + Ziel-Label + Ziel-Node

**Create-Modus:**
- Dynamisches Formular basierend auf bekannten Properties des Labels
- Auto-generierte ID
- Erstellen/Abbrechen-Buttons

#### 4.4 Suche-Tab (`search-tab.tsx`)

- Text-Input mit Debounce (300ms)
- Min. 2 Zeichen
- Ergebnis-Liste: Name, Label, gefundene Properties
- Klick → Explorer-Tab Detail-Modus (via Zustand Store)

#### 4.5 Schema-Tab (`schema-tab.tsx`)

- DataTable (TanStack Table) für Labels: Label, Count, Properties mit Typen
- DataTable für Relationships: Type, Count, Properties
- Optional: Mermaid-Diagramm (via `mermaid` npm-Paket)

#### 4.6 Import-Panel (`import-panel.tsx`)

**Platzierung:** Als Sheet/Drawer erreichbar über Button in der Header-Leiste

- Input: Cypher-Verzeichnis-Pfad (wird ans Backend geschickt)
- Datei-Liste (vom Backend geladen)
- Button: "Datenbank zurücksetzen & importieren"
- Progress-Anzeige
- Ergebnis-Liste (OK/Warnung/Fehler pro Datei)
- Statistik: Node/Rel-Counts

### Phase 5: Hilfs-Funktionen portieren

| Python-Funktion | TypeScript-Äquivalent | Ort |
|----------------|----------------------|-----|
| `display_name(props)` | `displayName(props: Record<string, unknown>): string` | `lib/utils.ts` |
| `label_color(label, all)` | `labelColor(label: string, allLabels: string[]): string` | `lib/utils.ts` |
| `primary_label(labels)` | `primaryLabel(labels: string[]): string` | `lib/utils.ts` |
| Farbpalette `PALETTE` | `PALETTE: string[]` | `data/palette.ts` |

### Phase 6: NPM-Pakete installieren

**Frontend (01-neo4j-Explorer-Vite/):**
```bash
npm install cytoscape cytoscape-popper @popperjs/core tippy.js
npm install -D @types/cytoscape
```

**Backend (01-neo4j-Explorer-Vite/server/):**
```bash
npm install express cors neo4j-driver
npm install -D typescript @types/express @types/cors tsx
```

**Vite Dev-Proxy** in `vite.config.ts`:
```typescript
server: {
  proxy: {
    '/api': 'http://localhost:3001'
  }
}
```

---

## Zusammenfassung der Arbeitspakete

| # | Arbeitspaket | Aufwand | Abhängigkeiten |
|---|-------------|---------|----------------|
| 1 | Backend-Proxy: Express + Neo4j-Driver + alle API-Routes | Mittel | — |
| 2 | TypeScript-Typen + API-Client + Zustand Store | Klein | — |
| 3 | Sidebar-Eintrag + Route + Feature-Grundgerüst mit Tabs | Klein | — |
| 4 | Graph-Tab: react-force-graph + Label-Filter + Legende | Mittel | 1, 2 |
| 5 | Explorer-Tab: Browse + Detail + CRUD + Relationships | Groß | 1, 2 |
| 6 | Suche-Tab: Volltextsuche + Navigation zum Explorer | Klein | 1, 2, 5 |
| 7 | Schema-Tab: DataTables + optionales Mermaid | Klein | 1, 2 |
| 8 | Import-Panel: Drawer/Sheet + Import-Logik | Mittel | 1 |
| 9 | Vite-Proxy-Config + npm scripts (dev: frontend+backend) | Klein | 1 |
| 10 | Testing mit agent-browser | Mittel | Alles |

---

## Reihenfolge der Implementierung

1. **Backend-Proxy** aufsetzen (Phase 1) — Basis für alles
2. **Typen + API-Client + Store** (Phase 2+5 Grundlagen)
3. **Route + Sidebar + Tabs-Grundgerüst** (Phase 2+3)
4. **Schema-Tab** (einfachster Tab, guter Smoke-Test für API)
5. **Explorer-Tab** (Kern-Feature, Browse → Detail → CRUD)
6. **Suche-Tab** (nutzt Explorer-State)
7. **Graph-Tab** (eigenständig, braucht Graph-Library)
8. **Import-Panel** (Sonder-Feature)
9. **Testing**

---

## Graph-Library-Vergleich

### Übersicht

| Kriterium | react-force-graph-2d | cytoscape (+react-cytoscapejs) | @react-sigma/core (Sigma.js) |
|-----------|---------------------|-------------------------------|------------------------------|
| **npm Downloads/Woche** | ~242K | ~5M (core) / ~61K (React-Wrapper) | ~48K (@react-sigma) / ~87K (sigma) |
| **Bundle (min+gzip)** | ~53 kB | ~133 kB (core) + ~2 kB (Wrapper) | ~46 kB (sigma) + ~3 kB (React) |
| **Rendering** | Canvas 2D | Canvas 2D | **WebGL** + Canvas (hybrid) |
| **React-Integration** | Wrapper (react-kapsule) | Wrapper (props→cy) | **Native Hooks** (useSigma, useRegisterEvents) |
| **TypeScript** | Built-in Generics | Built-in (core), @types (Wrapper) | Built-in Generics |
| **Letzte Veröffentlichung** | Feb 2026 | Apr 2026 (core) / **Sep 2022 (Wrapper!)** | Dez 2025 (React) / Apr 2026 (sigma v4 alpha) |
| **Max. Nodes (flüssig)** | ~1.000–3.000 | ~2.000–5.000 | **10.000–50.000+** |
| **Layout-Algorithmen** | d3-force (1 Algo + DAG) | 6 built-in + ~10 Extensions | ForceAtlas2 (Web Worker!) + 5 weitere |
| **Edge Labels (inline)** | Nur via Custom Canvas | **Built-in** | **Built-in** |
| **Tooltips** | Built-in (HTML) | Extension (cytoscape-popper) | Manuell (Events + DOM) |
| **Directed Arrows** | Built-in | Built-in | Built-in |
| **Custom Node Shapes** | Canvas-Callback | Built-in (10+ Shapes) | WebGL Shader (komplex) |
| **Cluster/Compound Nodes** | Nein | **Built-in** | Nein (manuell via graphology) |
| **Extension-Ökosystem** | Keines | **Sehr groß** (20+ Extensions) | Mittel (graphology-Algorithmen) |
| **Maintainer** | 1 Person (vasturiano) | Team (Cytoscape Consortium) | 2 Personen (sim51, jacomyal) |
| **Lizenz** | MIT | MIT | MIT |

### Vorteile & Nachteile im Detail

#### react-force-graph-2d

**Vorteile:**
- Einfachster Einstieg — wenig Boilerplate, schnell lauffähig
- Schöne animierte Force-Simulation (Nodes "schweben" beim Laden)
- Gute Tooltips out-of-the-box (HTML-fähig)
- Geringster Bundle-Overhead (~53 kB)
- DAG-Modus für hierarchische Graphen

**Nachteile:**
- Kein nativer React-Ansatz (Kapsule-Wrapper, imperative Canvas-Callbacks)
- Nur 1 Layout-Algorithmus (d3-force)
- Permanente Edge-Labels nur via Custom Canvas Code
- Performance-Grenze bei ~3.000 Nodes
- 1 Maintainer (Bus-Factor)
- 219 offene Issues, selektive Antworten

#### cytoscape (+react-cytoscapejs)

**Vorteile:**
- **Mächtigstes Feature-Set**: Compound Nodes, 10+ Node-Shapes, Animationen, vollständiges Event-System
- **Größtes Extension-Ökosystem**: Tooltips, Context-Menus, Edge-Handles, Minimap, Undo/Redo, ...
- Exzellente Dokumentation (js.cytoscape.org)
- Edge Labels, Directed Arrows, Styling — alles built-in ohne Custom Code
- 10.900+ GitHub Stars, aktiv gepflegt seit 2011
- Viele Layout-Algorithmen (6 built-in + 10 Extensions)

**Nachteile:**
- **Bundle-Größe: ~135 kB gzip** — größte der drei Optionen
- **React-Wrapper (react-cytoscapejs) seit Sep 2022 nicht mehr aktualisiert** — besser direkt `useRef`/`useEffect` nutzen
- Canvas-only: kein HTML in Nodes (ohne Extension), keine CSS-Styles auf Nodes
- Kein WebGL → Performance-Limit bei ~5.000 Nodes
- Layout-Berechnung blockiert Main Thread (kein Web Worker)

#### @react-sigma/core (Sigma.js)

**Vorteile:**
- **Beste Performance**: WebGL-Rendering, 10.000–50.000+ Nodes flüssig
- **Modernste React-Integration**: Hooks-basiert, Provider-Pattern, TypeScript-Generics
- ForceAtlas2-Layout läuft im **Web Worker** (UI bleibt responsiv)
- graphology als Datenmodell = Graph-Algorithmen (Shortest Path, Community Detection, PageRank, ...) inklusive
- Sigma v4 in aktiver Entwicklung

**Nachteile:**
- **graphology als Hard-Dependency** — extra Abstraktionsschicht, Daten müssen in graphology-Format geladen werden
- Custom Node Shapes erfordern WebGL Shader (hohe Lernkurve)
- Kein built-in Tooltip-System (manuell bauen)
- Label-Overlapping muss manuell gehandhabt werden
- Weniger Extensions als cytoscape
- Kleinere Community (~12K Stars sigma, aber nur ~230 Stars react-sigma)

### Empfehlung

Für dieses Projekt (Neo4j Explorer, ~100–500 Nodes, CRUD-fokussiert):

| Prio | Library | Begründung |
|------|---------|------------|
| **1** | **cytoscape** (direkt via useRef) | Bestes Feature/Aufwand-Verhältnis: Edge Labels, Arrows, Shapes, Tooltips, viele Layouts — alles built-in. Für unsere Graph-Größe (~100–500 Nodes) reicht Canvas locker. React-Wrapper überspringen, direkt mit `useRef`/`useEffect` einbinden. |
| 2 | react-force-graph-2d | Einfachster Einstieg, schöne Force-Animation. Aber fehlende Edge Labels und limitiertes Layout sind Nachteile. |
| 3 | @react-sigma/core | Over-engineered für unsere Datenmenge. WebGL-Performance bringt bei ~500 Nodes keinen Vorteil, dafür höhere Komplexität (graphology, Shader). |

**→ Entscheidung: cytoscape (direkt, ohne react-cytoscapejs)**

Begründung: Die Python-App zeigt Relationship-Types als Edge Labels, Directed Arrows, und verschiedene Node-Farben — das ist bei cytoscape alles deklarativ via Style-Objekt lösbar. Kein Custom Canvas/WebGL Code nötig. Die Graph-Größe bleibt im komfortablen Bereich.

---

## Offene Fragen / Entscheidungen

1. ~~**Graph-Library?**~~ → **cytoscape** (direkt, ohne Wrapper)
2. ~~**Import-Feature: Server-Dateisystemzugriff?**~~ → **Ja**, Server liest Cypher-Dateien direkt vom Dateisystem
3. ~~**Neo4j-Credentials?**~~ → **Hardcoded** (wie Python-App: `neo4j://127.0.0.1:7687`, `neo4j/neo4jneo4j`)
4. ~~**Mermaid-Diagramm?**~~ → **Dynamisch aus Schema generieren** (kein statisches File, Backend liefert Schema → Frontend erzeugt Mermaid-Syntax)
5. ~~**Concurrency?**~~ → **concurrently** (klarere Ausgabe, direkter bei 2 Prozessen)
