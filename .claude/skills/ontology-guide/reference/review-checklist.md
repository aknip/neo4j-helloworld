# Ontologie-Review-Checkliste

Strukturierte Checkliste für das Gesamtreview (Phase 2, Option 5).
Gehe jeden Punkt durch und bewerte mit: OK / Warnung / Fehler.

---

## 1. Vollständigkeit

- [ ] Alle im Domänen-Kontext relevanten Entitäten sind als Nodes modelliert
- [ ] Alle wesentlichen Beziehungen zwischen Entitäten sind definiert
- [ ] Alle Nodes haben mindestens eine ID-Property mit Unique Constraint
- [ ] Alle Nodes haben eine sinnvolle Beschreibung in der Spezifikation
- [ ] Alle Relationship Types haben Source, Target und Kardinalität definiert
- [ ] Die Analytics Use Cases sind durch das Modell abbildbar
- [ ] Beispiel-Queries für alle Use Cases existieren

---

## 2. Naming-Konsistenz

- [ ] Node Labels in `PascalCase` (z.B. `InsurancePolicy`, nicht `insurance_policy`)
- [ ] Relationship Types in `UPPER_SNAKE_CASE` (z.B. `HAS_COVERAGE`, nicht `hasCoverage`)
- [ ] Properties in `camelCase` (z.B. `firstName`, nicht `first_name` oder `FirstName`)
- [ ] Keine Abkürzungen in Labels (z.B. `Customer` statt `Cust`)
- [ ] Relationship Types sind Verben oder Verb-Phrasen (z.B. `WORKS_AT`, `BELONGS_TO`)
- [ ] Konsistente Präfix-/Suffix-Konventionen (z.B. alle IDs als `id`, nicht mal `id` mal `customerId`)
- [ ] Englische Labels und Property-Namen durchgängig

---

## 3. Anti-Pattern-Check

- [ ] **Keine Super Nodes**: Kein Node-Typ wird voraussichtlich >100k Beziehungen haben
  - Falls doch: Fan-out-Strategie dokumentiert?
- [ ] **Kein relationales Denken**: Keine künstlichen Join-Nodes die nur zwei Nodes verbinden
- [ ] **Keine bidirektionalen Redundanz-Beziehungen**: Nur eine Richtung pro semantischer Beziehung
- [ ] **Keine Property-Überladung**: Nodes sind nicht als Dokument-Store missbraucht (verschachtelte Daten)
- [ ] **Keine generischen Beziehungstypen**: Kein `RELATED_TO` oder `HAS` ohne spezifische Semantik
- [ ] **Keine verwaisten Nodes**: Jeder Node-Typ hat mindestens eine Beziehung zu einem anderen Typ

---

## 4. Modellierungs-Entscheidungen

- [ ] **Node vs. Property**: Werte die eigene Beziehungen brauchen, sind als Nodes modelliert
- [ ] **Relationship-Property vs. Intermediate Node**: Beziehungen mit >3 Properties oder eigenen Beziehungen sind als Intermediate Nodes modelliert
- [ ] **Hierarchien**: Self-Referenzen sind korrekt modelliert (klare Beziehungsnamen)
- [ ] **Zeitliche Daten**: Zeitliche Aspekte sind konsistent modelliert (Timestamps, Versionierung)
- [ ] **Kardinalitäten**: 1:1, 1:n, n:m sind korrekt und dokumentiert
- [ ] **Beziehungsrichtungen**: Semantisch sinnvoll und konsistent

---

## 5. Index-Strategie

- [ ] Jeder Node-Typ hat einen Unique Constraint auf der ID-Property
- [ ] Häufig abgefragte Properties haben Range Indexes
- [ ] Text-Suchfelder haben Text oder Fulltext Indexes
- [ ] Composite Indexes für häufige kombinierte Abfragen
- [ ] Keine Überindizierung (jeder Index ist durch einen Use Case begründet)
- [ ] Relationship-Properties die in Abfragen gefiltert werden, haben Indexes

---

## 6. Redundanz-Check

- [ ] Keine doppelten Modellierungen (gleiche Information an mehreren Stellen)
- [ ] Keine abgeleiteten Properties die besser als Query berechnet werden
- [ ] Keine redundanten Beziehungen die durch Traversal abbildbar sind
  - Ausnahme: Bewusste Denormalisierung für Performance (dann dokumentieren)

---

## 7. Graph-Nativeness

- [ ] Das Modell nutzt die Stärken von Graph-Datenbanken (Beziehungen als First-Class-Citizens)
- [ ] Traversals über mehrere Hops sind möglich und sinnvoll
- [ ] Das Modell ist nicht einfach eine 1:1-Übersetzung eines relationalen Schemas
- [ ] Pfad-basierte Abfragen sind unterstützt wo sinnvoll

---

## 8. Beispieldaten-Qualität

- [ ] Beispieldaten sind realistisch und nachvollziehbar
- [ ] Alle Node-Typen haben mindestens 3 Beispiel-Datensätze
- [ ] Alle Beziehungstypen sind in den Beispieldaten vertreten
- [ ] MERGE statt CREATE für idempotente Skripte
- [ ] IDs folgen einem konsistenten Schema (z.B. `customer-001`, `order-001`)
- [ ] Beispiel-Queries sind ausführbar und liefern sinnvolle Ergebnisse

---

## 9. Dokumentation

- [ ] Domänen-Beschreibung ist vollständig und verständlich
- [ ] Jede Modellierungsentscheidung ist begründet
- [ ] Offene Punkte sind dokumentiert
- [ ] Mermaid-Diagramm ist aktuell und vollständig
- [ ] Entscheidungsprotokoll enthält alle wesentlichen Entscheidungen

---

## Review-Zusammenfassung

Nach Durchgang aller Punkte, erstelle eine Zusammenfassung:

```
Review-Ergebnis: [Datum]

Geprüft: X Punkte
  - OK:       Y
  - Warnung:  Z
  - Fehler:   W

Kritische Punkte:
  1. [Falls vorhanden]

Empfehlungen:
  1. [Priorisierte Liste]
```
