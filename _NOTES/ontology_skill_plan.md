# Implementierungsplan: Neo4j Ontology & Knowledge Graph Skill

Stand: 2026-04-09 | Status: ENTWURF

---

## 1. Zielsetzung

Ein generischer Claude Code Skill (`/ontology-guide`), der den Nutzer in einem **geführten, iterativen Prozess** durch die Entwicklung einer Ontologie und eines Knowledge Graphen für Neo4j begleitet. Der Skill:

- Ist **domänenunabhängig** - funktioniert für beliebige Fachdomänen
- Arbeitet **iterativ**: erst ein schneller Gesamtdurchlauf, dann beliebig oft vertiefen
- Führt auf **Deutsch**, technische Labels (Nodes/Relationships) auf Englisch
- Dokumentiert kontinuierlich in einer lebenden Spezifikation
- Erzeugt ausführbare **Cypher-Skripte** und ein **formales Ontologie-Dokument**
- Enthält ein konkretes **Beispiel-Szenario** mit Testdaten

---

## 2. Kernkonzept: Iterative Vertiefung

Der Prozess folgt dem Prinzip **"Breit vor Tief"**:

```
Durchlauf 1 (Leichtgewichtig):
  Domäne verstehen → Alle Entitäten grob erfassen → Beziehungen skizzieren
  → Erste Spezifikation + Cypher generieren
  ⏱ ~10-15 Fragen, schnelles Ergebnis

Durchlauf 2..n (Vertiefung - beliebig oft wiederholbar):
  Nutzer wählt Fokus:
  ├── "Entität X vertiefen" → Properties, Constraints, Alternativen diskutieren
  ├── "Beziehung Y überprüfen" → Kardinalität, Richtung, Properties
  ├── "Neuen Bereich hinzufügen" → Weitere Entitäten/Beziehungen
  ├── "Abfragen validieren" → Prüfen ob Analytics-Fragen beantwortbar
  ├── "Gesamtreview" → Checkliste, Anti-Patterns, Optimierung
  └── "Beispiel erweitern" → Mehr Testdaten, weitere Szenarien
  ⏱ Fokussiert auf gewählten Bereich
```

---

## 3. Architektur des Skills

### 3.1 Dateistruktur

```
.claude/skills/ontology-guide/
├── SKILL.md                          # Skill-Definition (Hauptdatei)
├── reference/
│   ├── neo4j-modeling-patterns.md    # Graph-Modellierungs-Patterns & Anti-Patterns
│   ├── cypher-templates.md           # Cypher-Vorlagen (Constraints, Indexes, MERGE etc.)
│   └── review-checklist.md           # Checkliste für Ontologie-Review
└── templates/
    └── ontology-spec-template.md     # Vorlage für die generierte Spezifikation
```

### 3.2 Generierte Ausgabe (pro Nutzer-Session)

Der Skill erzeugt und aktualisiert im Arbeitsverzeichnis:

```
_NOTES/ontology/
├── ontology-spec.md                  # Lebende Ontologie-Spezifikation (Hauptdokument)
├── cypher/
│   ├── 01-constraints-indexes.cypher # Constraints & Indexes
│   ├── 02-example-data.cypher        # Konkretes Beispiel mit Testdaten
│   └── 03-example-queries.cypher     # Beispiel-Abfragen
└── diagrams/
    └── ontology-overview.mermaid     # Mermaid-Diagramm der Ontologie
```

---

## 4. Phasen im Detail

### Phase 1: Schneller Gesamtdurchlauf (Erstdurchlauf)

#### 1a. Domain Discovery (~3-5 Fragen)

**Fragen:**
1. Welche Domäne soll modelliert werden? (Freitext-Beschreibung)
2. Gibt es ein bestehendes Dokument/Modell als Grundlage? (Dateipfad oder "nein")
3. Was sind die 3-5 wichtigsten Entitäten (Dinge/Konzepte)?
4. Welche Hauptfragen soll der Graph beantworten können? (Analytics Use Cases)

**Aktionen:**
- Falls Dokument vorhanden: einlesen und Entitäten/Beziehungen extrahieren
- `ontology-spec.md` anlegen mit Domänen-Beschreibung
- Vorschlag für vollständige Entitätenliste erstellen

#### 1b. Entitäten-Schnellerfassung (~3-5 Fragen)

**Fragen:**
1. Vorgeschlagene Entitätenliste bestätigen/anpassen
2. Pro Entität: 2-3 wichtigste Attribute benennen (Rest wird abgeleitet)
3. Welche Entitäten haben hierarchische Strukturen? (Self-Referenz)

**Aktionen:**
- Node Labels mit Kern-Properties ableiten
- Standard-Properties ergänzen (id, name, status, createdAt, updatedAt)
- Unique Constraints für IDs generieren

#### 1c. Beziehungen-Schnellerfassung (~3-5 Fragen)

**Fragen:**
1. Vorgeschlagene Beziehungsliste bestätigen/anpassen
2. Welche Beziehungen haben eigene Daten? (Properties auf Relationships)
3. Gibt es n:m-Beziehungen die besondere Beachtung brauchen?

**Aktionen:**
- Relationship Types mit Source/Target definieren
- Kardinalitäten ableiten
- Mermaid-Diagramm generieren

#### 1d. Erste Generierung

**Aktionen (automatisch, keine Fragen):**
- `ontology-spec.md` vollständig schreiben
- `01-constraints-indexes.cypher` generieren
- `02-example-data.cypher` mit 3-5 Datensätzen pro Entität generieren
- `03-example-queries.cypher` mit Beispiel-Abfragen generieren
- `ontology-overview.mermaid` generieren
- Zusammenfassung anzeigen: "Erstdurchlauf abgeschlossen. Was möchtest du vertiefen?"

---

### Phase 2: Vertiefungsschleifen (beliebig oft wiederholbar)

Nach dem Erstdurchlauf bietet der Skill ein **Vertiefungsmenü**:

```
Was möchtest du als nächstes tun?

1. 📋 Entität vertiefen     - Eine Entität im Detail durchgehen
2. 🔗 Beziehung überprüfen  - Beziehungstyp analysieren und optimieren
3. ➕ Bereich hinzufügen     - Neue Entitäten oder Beziehungen ergänzen
4. 🔍 Abfragen validieren   - Prüfen ob Analytics-Fragen beantwortbar
5. ✅ Gesamtreview           - Vollständige Checkliste durchgehen
6. 📊 Beispiel erweitern    - Mehr Testdaten oder neue Szenarien
7. 🏁 Abschließen           - Finale Spezifikation generieren
```

#### Option 1: Entität vertiefen

**Fragen pro Entität:**
1. Alle Properties durchgehen: Name, Typ, Pflicht, Default, Beschreibung
2. Welche Properties werden häufig in Queries genutzt? → Index-Kandidaten
3. Gibt es Enum-Werte / feste Wertelisten? → Validierung
4. Gibt es berechnete Properties? (z.B. Alter aus Geburtsdatum)
5. Gibt es alternative Modellierungen? → Varianten vorstellen und diskutieren

**Aktionen:**
- Property-Definitionen verfeinern
- Constraints und Indexes aktualisieren
- Alternativen diskutieren (z.B. Property vs. eigener Node)
- Spezifikation und Cypher aktualisieren

#### Option 2: Beziehung überprüfen

**Fragen:**
1. Ist die Richtung korrekt? (A)-[:REL]->(B) vs. umgekehrt
2. Kardinalität bestätigen (1:1, 1:n, n:m)
3. Properties auf der Beziehung: vollständig? Typen korrekt?
4. Braucht es einen Intermediate Node statt Properties?
5. Traversal-Richtung für typische Queries?

#### Option 3: Bereich hinzufügen

- Neue Entitäten mit gleichem Schnellerfassungs-Prozess
- Beziehungen zu bestehenden Entitäten definieren
- Diagramm und Spezifikation aktualisieren

#### Option 4: Abfragen validieren

**Fragen:**
1. Welche konkreten Fragen soll der Graph beantworten?
2. Pro Frage: Cypher-Query formulieren und prüfen ob das Modell sie unterstützt
3. Falls nicht: Was fehlt im Modell?

#### Option 5: Gesamtreview

**Checkliste durchgehen:**
- Vollständigkeit (alle Entitäten, Beziehungen, Properties)
- Naming-Konsistenz (PascalCase Labels, UPPER_SNAKE_CASE Rels, camelCase Props)
- Anti-Pattern-Check (Super Nodes, Dense Nodes, unnötige Properties)
- Index-Strategie (häufige Abfragemuster abgedeckt?)
- Redundanz-Check (doppelte Modellierungen?)
- Graph-native Patterns (nicht blindes 1:1 von relationalem Modell)

#### Option 6: Beispiel erweitern

- Mehr Testdaten generieren (konfigurierbare Anzahl)
- Neue Szenarien hinzufügen
- Realistische Daten für spezifische Branchen

#### Option 7: Abschließen

- Finales Review aller generierten Dateien
- Zusammenfassung der Ontologie
- Optional: Python-Setup-Script generieren (analog zu bestehendem `setup_uwwb.py`)

---

## 5. Template: Ontologie-Spezifikation

Die generierte `ontology-spec.md` folgt dieser Struktur:

```markdown
# Ontologie: [Domänenname]
Stand: [Datum] | Version: [n] | Durchlauf: [Erst/Vertiefung #n]

## 1. Domäne
- Beschreibung
- Geschäftsprozesse
- Analytics Use Cases

## 2. Node Labels
### Übersicht
| Label | Beschreibung | Properties | Constraints |
### Detail pro Label
- Properties-Tabelle (Name | Neo4j-Typ | Pflicht | Index | Beschreibung)
- Constraints
- Beispiel-Node (Cypher)

## 3. Relationship Types
### Übersicht
| Type | Von → Nach | Kardinalität | Properties |
### Detail pro Type
- Semantik
- Properties
- Beispiel (Cypher)

## 4. Diagramm
- Mermaid-Graph (Verweis auf .mermaid-Datei)

## 5. Beispiel-Szenario
- Szenario-Beschreibung
- Datenübersicht
- Beispiel-Queries mit Erklärung

## 6. Entscheidungsprotokoll
- Getroffene Design-Entscheidungen mit Begründung
- Verworfene Alternativen

## 7. Offene Punkte
- Noch zu klärende Fragen
```

---

## 6. Referenzmaterial im Skill

### 6.1 Neo4j Modeling Patterns (`neo4j-modeling-patterns.md`)

Enthält:
- **Wann Node vs. Property?** (Faustregel: Wenn es eigene Beziehungen braucht → Node)
- **Wann Relationship-Property vs. Intermediate Node?** (Faustregel: >3 Props oder eigene Beziehungen → Node)
- **Self-Referenz-Patterns** (Hierarchien, Baumstrukturen)
- **Zeitliche Modellierung** (Versionierung, Historisierung)
- **Anti-Patterns:** Super Nodes, God Nodes, unnötige Hub-Nodes
- **Index-Strategie:** Wann welcher Index-Typ

### 6.2 Cypher Templates (`cypher-templates.md`)

Wiederverwendbare Cypher-Fragmente:
- Constraint-Erstellung
- Index-Erstellung (Single, Composite, Fulltext)
- Node-Erstellung (CREATE/MERGE)
- Relationship-Erstellung
- Typische Query-Patterns (Traversal, Aggregation, Path-Finding)

### 6.3 Review-Checkliste (`review-checklist.md`)

Strukturierte Checkliste für Phase 2, Option 5 (Gesamtreview).

---

## 7. Skill-Konfiguration

### SKILL.md Frontmatter

```yaml
name: ontology-guide
description: >
  Geführter, iterativer Prozess zur Entwicklung einer Neo4j-Ontologie
  und Knowledge Graph. Erst schneller Gesamtdurchlauf, dann beliebig
  oft vertiefen. Erzeugt Spezifikation + Cypher-Skripte.
user-invocable: true
argument-hint: "[Domänenname oder Dateipfad]"
allowed-tools: Read Write Edit Grep Glob Bash Agent
effort: high
```

### Argument-Handling

```
/ontology-guide                    → Startet mit Frage nach Domäne
/ontology-guide "E-Commerce"       → Startet mit Domäne "E-Commerce"
/ontology-guide path/to/model.md   → Liest Modell ein und leitet Domäne ab
```

---

## 8. Implementierungsschritte

| # | Schritt | Dateien | Beschreibung |
|---|---------|---------|-------------|
| 1 | **SKILL.md erstellen** | 1 | Hauptdefinition mit komplettem Prozess-Prompt |
| 2 | **Referenzmaterial** | 3 | Patterns, Cypher-Templates, Review-Checkliste |
| 3 | **Spezifikations-Template** | 1 | Vorlage für die generierte Ontologie-Doku |
| 4 | **Test mit Beispiel-Domäne** | - | Skill durchspielen, Cypher gegen Neo4j testen |
| 5 | **Feinschliff** | - | Prompt-Tuning basierend auf Testergebnissen |
| **Gesamt** | | **~5 Dateien** | |

### Reihenfolge

```
Schritt 1 → Schritt 2 + 3 (parallel) → Schritt 4 → Schritt 5
```

---

## 9. Nächste Schritte

→ **Plan bestätigen, dann Implementierung starten mit Schritt 1 (SKILL.md)**
