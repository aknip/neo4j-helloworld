# Ontologie: [Domänenname]

Stand: [Datum] | Version: [n] | Status: [Erstdurchlauf / Vertiefung #n]

---

## 1. Domäne

### Beschreibung
[Kurze Beschreibung der Domäne und des Geschäftskontexts]

### Geschäftsprozesse
- [Prozess 1]
- [Prozess 2]
- ...

### Analytics Use Cases
| # | Frage | Beschreibung | Status |
|---|-------|-------------|--------|
| 1 | [Frage] | [Details] | [Modelliert / Offen] |

---

## 2. Node Labels

### Übersicht

| Label | Beschreibung | Kern-Properties | Constraints |
|-------|-------------|----------------|-------------|
| [Label] | [Beschreibung] | [prop1, prop2, ...] | [Unique: id] |

### Detail: [NodeLabel]

**Beschreibung:** [Was repräsentiert dieser Node?]

| Property | Neo4j-Typ | Pflicht | Index | Beschreibung |
|----------|-----------|---------|-------|-------------|
| id | String | Ja | Unique | Eindeutige ID |
| name | String | Ja | Range | Anzeigename |
| [prop] | [Typ] | [Ja/Nein] | [Typ/Nein] | [Beschreibung] |

**Constraints:**
```cypher
CREATE CONSTRAINT IF NOT EXISTS FOR (n:[NodeLabel]) REQUIRE n.id IS UNIQUE;
```

**Beispiel:**
```cypher
MERGE (n:[NodeLabel] {id: '[label]-001'})
SET n.name = '[Beispielname]',
    n.createdAt = datetime();
```

[Für jeden weiteren Node-Typ wiederholen]

---

## 3. Relationship Types

### Übersicht

| Type | Von | Nach | Kardinalität | Properties | Beschreibung |
|------|-----|------|--------------|------------|-------------|
| [TYPE] | [NodeA] | [NodeB] | [1:n] | [prop1, ...] | [Beschreibung] |

### Detail: [RELATIONSHIP_TYPE]

**Semantik:** [Was bedeutet diese Beziehung?]

**Richtung:** `(:[NodeA])-[:TYPE]->(:[NodeB])`

**Kardinalität:** [1:1 / 1:n / n:m]

| Property | Neo4j-Typ | Pflicht | Beschreibung |
|----------|-----------|---------|-------------|
| [prop] | [Typ] | [Ja/Nein] | [Beschreibung] |

**Beispiel:**
```cypher
MATCH (a:[NodeA] {id: 'a-001'})
MATCH (b:[NodeB] {id: 'b-001'})
MERGE (a)-[r:[TYPE]]->(b)
SET r.[prop] = [value];
```

[Für jeden weiteren Relationship-Typ wiederholen]

---

## 4. Diagramm

Siehe: `diagrams/ontology-overview.mermaid`

```mermaid
graph LR
    [Inline-Darstellung des Diagramms]
```

---

## 5. Beispiel-Szenario

### Szenario-Beschreibung
[Konkretes, nachvollziehbares Szenario beschreiben]

### Datenübersicht
| Node-Typ | Anzahl | Beispiele |
|----------|--------|-----------|
| [Label] | [n] | [Beispiel-IDs] |

### Beispiel-Queries

#### Use Case 1: [Frage]
```cypher
[Query]
```
**Erwartetes Ergebnis:** [Beschreibung]

[Für jeden Use Case wiederholen]

---

## 6. Entscheidungsprotokoll

| # | Entscheidung | Begründung | Alternativen |
|---|-------------|-------------|-------------|
| 1 | [Entscheidung] | [Warum?] | [Was wurde verworfen?] |

---

## 7. Offene Punkte

- [ ] [Offener Punkt 1]
- [ ] [Offener Punkt 2]
