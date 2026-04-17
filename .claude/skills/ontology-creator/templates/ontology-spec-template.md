# Ontologie: [Domänenname]

Stand: [Datum] | Version: [n] | Status: [Erstdurchlauf / Vertiefung #n]

Quelle: `[Pfad zur Quelle(n)]`

---

## 1. Domäne

### Beschreibung

[Kurze Beschreibung der Domäne und des Geschäftskontexts, destilliert aus Fachtext + DB-Inspektion]

### Scope-Entscheidung

**[Nur Kern / Kern+Angebot / Komplett]** – [Begründung]

### Geschäftsprozesse

1. [Prozess 1]
2. [Prozess 2]

### Analytics Use Cases

| # | Frage | Status |
|---|-------|--------|
| 1 | [Frage] | [Modelliert / Offen] |

---

## 2. Node Labels

### Übersicht ([Anzahl] Labels, [n] Cluster)

**[Cluster 1 – z.B. Kern-Domäne]**

| # | Label | Quelle | Kern-Properties |
|---|-------|--------|-----------------|
| 1 | `Label` | `source_table` / abgeleitet | id, name, ... |

[Weitere Cluster als eigene Untertabellen]

### Standard-Properties

Alle Labels (falls nicht anders vermerkt): `id` (String, Unique), `createdAt` (DateTime), `updatedAt` (DateTime).

---

## 3. Relationship Types

### Übersicht ([Anzahl] Types)

**[Cluster 1]**

| Type | Von | Nach | Kard. | Props | Beschreibung |
|------|-----|------|-------|-------|--------------|
| `REL_TYPE` | NodeA | NodeB | 1:n | – | [Beschreibung] |

### Richtungs-Konvention

[Beschreibung, nach welchem Prinzip Richtungen gewählt wurden]

---

## 4. Diagramm

Siehe: `diagrams/ontology-overview.mermaid`

[Mermaid-Inline-Kopie für schnelle Referenz]

---

## 5. Beispiel-Szenario

### Szenario-Beschreibung

[Konkretes, nachvollziehbares Szenario – ein Satz, der es einordnet]

Bewusste Spezialfälle:
- [Lücke / Mehrfach / Teilzustand etc.]

### Datenübersicht

| Node-Typ | Anzahl |
|----------|--------|
| [Label] | [n] |

### Beispiel-Queries

Siehe `cypher/03-example-queries.cypher` ([Anzahl] Queries, eine pro Analytics Use Case).

---

## 6. Entscheidungsprotokoll

| # | Entscheidung | Begründung | Verworfene Alternativen |
|---|--------------|------------|--------------------------|
| 1 | [z.B. `partner` → 3 Labels] | [Rollen mit unterschiedlicher Semantik] | [Multi-Label / Partner+Property] |

---

## 7. Offene Punkte

- [ ] [Offener Punkt 1 – ggf. aus DB/Fachtext-Divergenz]
- [ ] [Offener Punkt 2]
