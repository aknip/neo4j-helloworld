# Cypher-Fallen und Best Practices (für dieses Repo)

## Parser-Falle: `;` in String-Literalen

**Problem:** Die Import-Route im Neo4j Explorer (`server/src/routes/import.ts` → `parseCypherFile`) splittet jede `.cypher`-Datei auf `;`. String-Inhalte werden nicht berücksichtigt. Ein `;` innerhalb eines String-Literals zerbricht das Statement.

**Beispiel (KAPUTT):**
```cypher
SET cov.specialConditions = 'Wetterklausel; Selbstbehalt 10k'
```

**Fehler:** `Failed to parse string literal. The query must contain an even number of non-escaped quotes.`

**Fix:**
```cypher
SET cov.specialConditions = 'Wetterklausel, Selbstbehalt 10k'
```

**Regel:** In ALLEN String-Werten (description, reason, conditions, emailText, ...) `;` durch `,`, `.`, `-` oder ähnliches ersetzen. Gilt auch für Postcodes, Zeitformate, Code-Snippets.

## MERGE vs. CREATE

Immer **`MERGE`** verwenden für Nodes und Relationships, damit Scripts idempotent sind (mehrfach ausführbar ohne Duplikate).

```cypher
-- Empfohlen
MERGE (c:Company {id: 'company-001'})
SET c.name = 'EventMedia Holding AG',
    c.updatedAt = datetime();

-- Vermeiden
CREATE (c:Company {id: 'company-001', name: '...'});  -- wirft beim 2. Lauf
```

Für Relationships mit Properties:

```cypher
MATCH (q:Quote {id: 'quote-001'}), (i:Insurer {id: 'insurer-001'})
MERGE (q)-[r:UNDERWRITTEN_BY]->(i)
SET r.sharePercent = 60.0, r.leadInsurer = true;
```

Nicht:
```cypher
MERGE (q)-[r:UNDERWRITTEN_BY {sharePercent: 60.0}]->(i)
```
– Das sucht eine Kante mit genau dieser Property und erzeugt sonst eine neue.

## Constraints & Indexes

```cypher
CREATE CONSTRAINT <name> IF NOT EXISTS FOR (n:Label) REQUIRE n.id IS UNIQUE;
CREATE INDEX <name> IF NOT EXISTS FOR (n:Label) ON (n.propertyName);
```

**Was indexieren:**
- Unique-Constraint auf `id` jeder Entität (automatisch Index)
- Range-Index auf häufig gefilterten Properties: Status, Typ, Datum, Stadt, Kategorie
- Business-Key zusätzlich (z.B. `policyNumber`) als zweiter Unique-Constraint

## Datentypen

Neo4j unterscheidet sauber:

```cypher
date('2026-08-15')       -- Date
datetime()               -- DateTime aktuell
datetime('2026-04-10T08:15:00Z')  -- explizite DateTime
point({latitude: 53.5, longitude: 9.99})  -- räumliche Koordinate
```

Lists und Maps:
```cypher
SET ot.requiredFields = ['titel','datum','ort','besucher'];
SET ot.bounds = {min: 0, max: 100};
```

## Polymorphe Zielknoten

Wenn ein Node auf verschiedene Ziel-Labels zeigen kann (z.B. ExtractedField → Object | Risk | Coverage):

Entweder **eine Relationship** (Preview-Matching im Query nötig):
```cypher
(f:ExtractedField)-[:POPULATES]->(target)  -- target ist polymorph
```

Oder **typisierte Relationships**:
```cypher
(f)-[:POPULATES_OBJECT]->(:Object)
(f)-[:POPULATES_RISK]->(:Risk)
```

Typisiert ist klarer für Queries, einzelne Relationship-Type ist flexibler für neue Ziel-Typen.

## Idempotenz-Test

Jedes generierte `02-example-data.cypher` muss mindestens **2× hintereinander** fehlerfrei durchlaufen. Wenn die Node-Zahl beim zweiten Lauf wächst, ist das Script nicht idempotent (fehlendes MERGE irgendwo).
