# Main-App-Integration: Neo4j Explorer

Der Neo4j Explorer liegt unter `01-neo4j-Explorer-Vite/` und läuft lokal via Docker + Node.

## Start-Commands

```bash
cd 01-neo4j-Explorer-Vite
npm run dev:full          # Startet alles: Neo4j (Docker) + Backend + Frontend
# Alternativ:
npm run db:start          # Nur Neo4j-Container
npm run dev               # Nur Backend + Frontend (Neo4j muss laufen)
```

App-URL: `http://localhost:5173/main/neo4j-explorer`

## Import-Tab

Der Import-Tab ist voreingestellt auf `Ontology_UWWB/cypher`. User kann das Verzeichnis ändern. Button **"Datenbank zurücksetzen & importieren"**:

1. dropt alle Constraints/Indexes
2. löscht alle Nodes (`MATCH (n) DETACH DELETE n`)
3. führt alle `.cypher`-Dateien alphabetisch aus
4. pro Datei: Split auf `;`, jedes Statement einzeln, Fehler werden gezählt (nicht abgebrochen)
5. Ergebnis-Anzeige: `N Statements` oder `X Fehler` pro Datei + Node-/Rel-Zähler

⚠️ Die Fehler-Anzeige ist nur eine Zahl, keine Details. Für Debugging **immer den Headless-Test** nutzen.

## Headless-Test (Pre-Import-Gate)

**Pflicht vor jeder User-Übergabe:** die generierten Scripts gegen die lokale Neo4j laufen lassen und Fehler-Liste prüfen.

Minimal-Skript:

```javascript
// in 01-neo4j-Explorer-Vite/server/, wegen neo4j-driver node_modules
import neo4j from 'neo4j-driver'
import fs from 'fs'

const driver = neo4j.driver('neo4j://127.0.0.1:7687', neo4j.auth.basic('neo4j', 'neo4jneo4j'))
const session = driver.session()

await session.run('MATCH (n) DETACH DELETE n')
for (const r of (await session.run('SHOW CONSTRAINTS YIELD name RETURN name')).records) {
  await session.run(`DROP CONSTRAINT \`${r.get('name')}\` IF EXISTS`)
}
for (const r of (await session.run("SHOW INDEXES YIELD name, type WHERE type <> 'LOOKUP' RETURN name")).records) {
  await session.run(`DROP INDEX \`${r.get('name')}\` IF EXISTS`)
}

for (const fn of ['01-constraints-indexes.cypher', '02-example-data.cypher', '03-example-queries.cypher']) {
  const content = fs.readFileSync(`../../Ontology_<NAME>/cypher/${fn}`, 'utf-8')
  const lines = content.split('\n').filter(l => !l.trim().startsWith('//'))
  const stmts = lines.join('\n').split(';').map(s => s.trim()).filter(Boolean)
  let fails = 0
  for (let i = 0; i < stmts.length; i++) {
    try { await session.run(stmts[i]) }
    catch (e) { fails++; console.log(`FAIL ${fn} #${i+1}: ${e.message.split('\n')[0]}`) }
  }
  console.log(`${fn}: ${stmts.length} stmts, ${fails} errors`)
}

const nodes = (await session.run('MATCH (n) RETURN count(n) AS c')).records[0].get('c')
const rels = (await session.run('MATCH ()-[r]->() RETURN count(r) AS c')).records[0].get('c')
console.log(`Total: Nodes ${nodes}, Rels ${rels}`)
await session.close(); await driver.close()
```

Alternative: `docker exec` auf den Neo4j-Container mit `cypher-shell`:

```bash
docker exec -i neo4j-explorer-db cypher-shell \
  -u neo4j -p neo4jneo4j --format plain --file /dev/stdin \
  < Ontology_<NAME>/cypher/02-example-data.cypher
```

`cypher-shell` splittet **anders** als der Explorer-Parser (es versteht Quotes korrekt) – d.h. der Shell-Test fängt nicht alle Parser-Fallen ab, die im Explorer auftauchen. Daher **immer** den Driver-basierten Headless-Test mit dem gleichen `split(';')` wie `parseCypherFile`.

## Docker-Check

```bash
docker ps --filter "name=neo4j" --format "{{.Names}} {{.Status}}"
```

Erwartete Ausgabe: `neo4j-explorer-db Up ...`

Wenn leer: User auf `npm run db:start` oder `npm run dev:full` hinweisen.

## Zwischen-Imports (für Phase 1)

Um den User mitzunehmen, darfst du nach gravierenden Designentscheidungen **eine kleine Teilmenge** der Testdaten bereits in die DB laden – damit der User live im Explorer sieht, was gerade entschieden wurde.

### Wann

- Nach **Rollen-Splitting** (§2): zeige 2-3 `Company` + 1 `Broker` + 2 `Insurer` im Graph
- Nach **Hierarchie** (§3): zeige Konzernmutter + Töchter
- Nach **Lifecycle** (§4): zeige 1 Objekt mit 1 Risiko, das über die Phasen gebunden wird

### Wie

1. Separate Datei `cypher/partial-<step>.cypher` anlegen (z.B. `partial-01-partners.cypher`)
2. Nur **MERGE-Statements** der relevanten Teil-Entitäten, keine Constraints (die kommen erst in `01-`)
3. Headless-Test durchführen (gleicher Mechanismus wie beim Voll-Import)
4. User-Ansage:
   ```
   Mini-Import läuft. Gehe im Explorer in den Graph-Tab und schau dir das Partner-Splitting an.
   Wenn passt, sag Bescheid – wir machen weiter. Wenn nicht, beschreibe, was fehlt.
   ```
5. Nach OK: die `partial-*.cypher` behalten (als History) und mit Phase 1 Schritt 5 weitermachen

### Aufräum-Verhalten

Beim finalen `02-example-data.cypher` wird die DB vor dem Import eh durch den Explorer geleert (`MATCH (n) DETACH DELETE n`). Zwischenstände sind also nicht "klebrig".

Optional am Ende: `partial-*.cypher`-Dateien archivieren (z.B. nach `cypher/_partials/`) oder belassen.

## Was der User im Explorer tun kann

Nach dem Import-Klick:

| Tab | Funktion |
|-----|----------|
| **Graph** | interaktive Visualisierung, Node-Filter, Label-Farben |
| **Explorer** | Navigation über Nodes & Relationships, LLM-Summary |
| **Schema** | Übersicht aller Labels / Types / Constraints |
| **Search** | Cypher-Query direkt ausführen |
| **Settings** | Label-Sichtbarkeit, Display-Namen |

Für die Vertiefung im Skill bietet sich an: User wählt ein Label im Schema-Tab, springt in den Graph, sieht konkrete Instanzen und kommt dann mit gezielten Fragen zurück.
