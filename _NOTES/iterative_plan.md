# Iterativer Entwicklungsplan: UWWB Ontologie & Knowledge Graph

## Motivation

Die UWWB-Ontologie hat 25 Node Labels und 33 Relationship Types. Alles auf einmal zu durchdringen ist schwierig. Dieser Plan zerlegt die Entwicklung in 8 verdaubare Phasen, die aufeinander aufbauen — von den Akteuren (wer?) über die Objekte (was?) bis zu den Geschäftsprozessen (wie?).

**Jede Phase folgt demselben Zyklus:**
1. Cypher-Spezifikationen erweitern (Constraints, Daten, Queries)
2. Im Explorer importieren und visuell erkunden
3. Mit CRUD-Operationen experimentieren und Verständnis vertiefen
4. Ontologie-Spec aktualisieren (Entscheidungen dokumentieren)

## Werkzeug: Generischer Neo4j Explorer

Der Explorer ist eine Streamlit-App, die sich **vollautomatisch aus Neo4j konfiguriert**. Keine Code-Änderungen nötig — nur die Cypher-Dateien in `Ontology_UWWB/cypher/` anpassen und im Explorer neu importieren.

**Starten:**
```bash
python Ontology_UWWB/explorer/start_explorer.py
```

**Funktionen:**
- **Sidebar: Cypher-Import** — Datenbank zurücksetzen und Cypher-Dateien importieren
- **Tab "Graph"** — Interaktive Visualisierung aller Nodes und Beziehungen (filterbar nach Label)
- **Tab "Explorer"** — Nodes durchsuchen, Details anzeigen, Erstellen/Bearbeiten/Löschen
- **Tab "Suche"** — Volltextsuche über alle String-Properties
- **Tab "Schema"** — Übersicht aller Labels, Relationship Types, Properties mit Typen

---

## Phase 0: Fundament

**Ziel:** Explorer einrichten, Neo4j-Datenbank vorbereiten, leerer Graph.

**Schritte:**
1. Explorer starten: `python Ontology_UWWB/explorer/start_explorer.py`
2. Im Browser öffnen (http://localhost:8501)
3. In der Sidebar "Datenbank zurücksetzen & importieren" klicken
4. Prüfen: Schema-Tab zeigt "Keine Daten" (nur Constraints/Indexes)

**Was du danach siehst:**
- Leerer Graph, aber die Constraint-Struktur ist in Neo4j angelegt
- Schema-Tab zeigt die Index-Definitionen

---

## Phase 1: Partner-Kern — Wer sind die Akteure?

**Ziel:** Die Geschäftspartner und ihre Beziehungen untereinander verstehen.

### Neue Entitäten

| Label | Beschreibung | Beispiele |
|-------|-------------|-----------|
| Partner | Basis-Label für alle Geschäftspartner | — |
| Customer | Versicherungsnehmer (Unternehmen) | Müller Automotive GmbH |
| Insurer | Versicherungsgesellschaft | Allianz Versicherung AG |
| Broker | Versicherungsmakler | Marsh Deutschland GmbH |
| Contact | Ansprechpartner (natürliche Person) | Hans Weber, Lisa Schmidt |

### Neue Beziehungen

```
(Customer)-[:HAS_SUBSIDIARY]->(Customer)    Konzernstruktur
(Contact)-[:WORKS_FOR {role, since}]->(Partner)    Ansprechpartner-Zuordnung
(Broker)-[:MANAGES_ACCOUNT {since}]->(Customer)    Makler betreut Kunden
```

### Cypher-Scope

In `02-example-data.cypher` nur die Partner-bezogenen Abschnitte erstellen:
- 2 Customer (Müller Automotive + Müller Components)
- 2 Insurer (Allianz, Munich Re)
- 1 Broker (Marsh)
- 3 Contacts (Weber, Schmidt, Klein)
- Alle Partner-Beziehungen

### Was du danach im Explorer tun kannst

- **Graph:** 8 Knoten, 7 Beziehungen. Konzernstruktur visuell erkennbar (Mutter→Tochter).
- **Explorer:** Jeden Partner anklicken und seine Beziehungen sehen. Wer arbeitet wo? Wer betreut wen?
- **Ausprobieren:** Neuen Contact anlegen und über "Link" einer Firma zuweisen. Einen weiteren Customer als Tochtergesellschaft anlegen.

### Vertiefungsfragen für diese Phase

- Braucht ein Partner mehrere Adressen? → Eigener Address-Node?
- Sollen Historien von Makler-Wechseln abgebildet werden?
- Welche zusätzlichen Properties brauchen Contacts (Abteilung, Position)?

---

## Phase 2: Objekte & Risiken — Was wird versichert?

**Ziel:** Verstehen, was ein Unternehmen besitzt und welche Risiken daraus entstehen.

### Neue Entitäten

| Label | Beschreibung | Beispiele |
|-------|-------------|-----------|
| InsurableObject | Basis-Label für versicherbare Objekte | — |
| Building | Gebäude | Produktionshalle Stuttgart |
| Machine | Maschine / Anlage | CNC-Fräszentrum DMG MORI |
| Vehicle | Fahrzeug | BMW 530d, Mercedes Actros |
| Risk | Einem Objekt zugeordnetes Risiko | Feuer, Maschinenbruch |

### Neue Beziehungen

```
(Customer)-[:OWNS {since}]->(InsurableObject)    Kunde besitzt Objekt
(InsurableObject)-[:HAS_RISK]->(Risk)             Objekt hat Risiko
```

### Was du danach im Explorer tun kannst

- **Graph:** Die Partner-Knoten sind jetzt mit Objekten und Risiken verbunden. Sternförmige Struktur um jeden Customer.
- **Explorer:** Objekte durchblättern, pro Objekt die Risiken sehen. Von einem Risk zurück zum Objekt und zum Besitzer navigieren.
- **Ausprobieren:** Ein neues Gebäude anlegen, dem Kunden zuweisen, Risiken hinzufügen.

### Vertiefungsfragen für diese Phase

- Welche objekttyp-spezifischen Properties sind wirklich nötig? (Building: Fläche, Baujahr — Machine: Hersteller, Typ)
- Brauchen Risiken eine Risikokategorie als eigenen Node (statt String-Property)?
- Soll der Standort als eigener Node modelliert werden (für Geo-Queries)?

---

## Phase 3: Versicherungsprodukte — Was bietet der Markt?

**Ziel:** Die Angebotsseite verstehen: Sparten, Produkte, Deckungsdefinitionen, Klauseln.

### Neue Entitäten

| Label | Beschreibung | Beispiele |
|-------|-------------|-----------|
| InsuranceLine | Versicherungssparte | Sachversicherung, Kfz |
| InsuranceProduct | Produkt eines Versicherers | Allianz Property All Risk |
| CoverageDefinition | Deckungsdefinition im Produkt | Feuerdeckung, Maschinenbruch |
| Clause | Klausel / Bedingung | AFB, AMB, AKB |

### Neue Beziehungen

```
(Insurer)-[:OFFERS]->(InsuranceProduct)                     Versicherer bietet Produkt an
(InsuranceProduct)-[:BELONGS_TO_LINE]->(InsuranceLine)       Produkt gehört zu Sparte
(InsuranceLine)-[:HAS_SUBLINE]->(InsuranceLine)              Spartenhierarchie
(InsuranceProduct)-[:HAS_COVERAGE_DEF]->(CoverageDefinition) Produkt hat Deckungsdefinitionen
(CoverageDefinition)-[:HAS_CLAUSE]->(Clause)                 Deckung hat Klauseln
```

### Was du danach im Explorer tun kannst

- **Graph:** Zwei deutlich getrennte Cluster: links die Kunden mit Objekten, rechts die Versicherer mit Produkten. Noch nicht verbunden!
- **Explorer:** Produktkatalog durchblättern. Von einem Versicherer zu seinen Produkten navigieren. Spartenhierarchie erkunden (Sachversicherung → Feuer, Maschine).
- **Ausprobieren:** Ein neues Produkt anlegen, einer Sparte zuordnen, Deckungsdefinitionen hinzufügen.

### Vertiefungsfragen für diese Phase

- Wie tief soll die Spartenhierarchie gehen?
- Sollen Klauseln versioniert werden (gültig ab/bis)?
- Brauchen CoverageDefinitions Tariflogik (Formeln, Risikoklassen)?

---

## Phase 4: Ausschreibung & Angebot — Die Brücke zwischen Angebot und Nachfrage

**Ziel:** Den Geschäftsprozess verstehen, der Kundenbedarf und Versicherungsprodukte verbindet.

### Neue Entitäten

| Label | Beschreibung | Beispiele |
|-------|-------------|-----------|
| CoverageRequest | Deckungswunsch pro Risiko | 30 Mio EUR Feuerdeckung |
| Submission | Ausschreibung | Ausschreibung Müller 2024 |
| Offer | Angebot eines Versicherers | Allianz Property-Angebot |
| CoverageOffer | Deckungsangebot innerhalb eines Angebots | Feuer 30 Mio @ 200k Prämie |

### Neue Beziehungen

```
(Risk)-[:HAS_COVERAGE_REQUEST]->(CoverageRequest)       Risiko hat Deckungswunsch
(Broker)-[:SUBMITS]->(Submission)                         Makler erstellt Ausschreibung
(Submission)-[:FOR_CUSTOMER]->(Customer)                  Ausschreibung für Kunden
(Submission)-[:INCLUDES_REQUEST]->(CoverageRequest)       Ausschreibung enthält Wünsche
(Insurer)-[:RESPONDS_WITH]->(Offer)                       Versicherer gibt Angebot ab
(Offer)-[:FOR_SUBMISSION]->(Submission)                   Angebot auf Ausschreibung
(Offer)-[:CONTAINS]->(CoverageOffer)                      Angebot enthält Deckungsangebote
(CoverageOffer)-[:RESPONDS_TO]->(CoverageRequest)         Angebot beantwortet Wunsch
(CoverageOffer)-[:BASED_ON]->(CoverageDefinition)         Basiert auf Produktdeckung
```

### Was du danach im Explorer tun kannst

- **Graph:** Die zwei Cluster (Kunden/Objekte und Versicherer/Produkte) sind jetzt über die Ausschreibung verbunden. Der Fluss wird sichtbar: Risiko → Deckungswunsch → Ausschreibung → Angebot → Deckungsangebot → Produktdeckung.
- **Explorer:** Von einem Risiko über den Deckungswunsch zur Ausschreibung navigieren. Angebote verschiedener Versicherer vergleichen.
- **Ausprobieren:** Eine neue Ausschreibung erstellen, Deckungswünsche verknüpfen.

### Vertiefungsfragen für diese Phase

- Sollen Verhandlungsrunden (Iterations-Historie) abgebildet werden?
- Brauchen CoverageOffers einen Status (angenommen/abgelehnt/verhandelt)?
- Wie werden Mitversicherungs-Anteile bereits im Angebotsprozess modelliert?

---

## Phase 5: Vertrag (Police) — Bindung und laufende Verwaltung

**Ziel:** Den Vertrag als zentrales Geschäftsobjekt verstehen — mit Deckungen, Nachträgen, Beteiligungen.

### Neue Entitäten

| Label | Beschreibung | Beispiele |
|-------|-------------|-----------|
| Policy | Versicherungsvertrag | POL-2024-001 |
| PolicyCoverage | Finale Deckung im Vertrag | Feuer 30 Mio, Maschinenbruch 5 Mio |
| Endorsement | Nachtrag / Vertragsanpassung | END-2024-001 |

### Neue Beziehungen

```
(Policy)-[:BOUND_FROM]->(Offer)                            Aus Angebot entstanden
(Policy)-[:INSURES]->(Customer)                             Versichert Kunden
(Policy)-[:BROKERED_BY]->(Broker)                           Von Makler verwaltet
(Policy)-[:UNDERWRITTEN_BY {share}]->(Insurer)              Versicherer mit Anteil
(Policy)-[:HAS_COVERAGE]->(PolicyCoverage)                  Hat Deckungsbausteine
(PolicyCoverage)-[:COVERS_RISK]->(Risk)                     Deckt spezifisches Risiko
(PolicyCoverage)-[:BASED_ON_DEF]->(CoverageDefinition)      Basiert auf Definition
(Policy)-[:HAS_ENDORSEMENT]->(Endorsement)                  Hat Nachträge
```

### Was du danach im Explorer tun kannst

- **Graph:** Die Police ist der zentrale Hub — verbunden mit Kunden, Makler, Versicherern, Deckungen und zurück zu Risiken/Objekten. Der vollständige Kreislauf ist sichtbar.
- **Explorer:** Von einer Police aus alle Beteiligten sehen. Die Deckungsstruktur erkunden. Nachträge chronologisch ansehen.
- **Ausprobieren:** Einen Nachtrag erstellen, eine Deckungssumme anpassen.

### Vertiefungsfragen für diese Phase

- Wie wird die Mitversicherung (mehrere Insurer mit share) dargestellt?
- Brauchen PolicyCoverages eigene Status (aktiv, gekündigt, angepasst)?
- Sollen Nachträge auf einzelne PolicyCoverages verweisen (statt nur auf die Police)?

---

## Phase 6: Schadenmanagement — Wenn der Ernstfall eintritt

**Ziel:** Schäden, ihre Zuordnung und die schrittweise Regulierung verstehen.

### Neue Entitäten

| Label | Beschreibung | Beispiele |
|-------|-------------|-----------|
| Claim | Schadenfall | CLM-2024-001 (Maschinenbruch) |
| ClaimSettlement | Regulierungsschritt | Teilregulierung 400k, Schluss 350k |

### Neue Beziehungen

```
(Claim)-[:AGAINST_POLICY]->(Policy)                         Schaden gegen Police
(Claim)-[:AFFECTS_OBJECT]->(InsurableObject)                Betrifft Objekt
(Claim)-[:AFFECTS_COVERAGE {claimedAmount}]->(PolicyCoverage)  Betrifft Deckung
(Claim)-[:HAS_SETTLEMENT]->(ClaimSettlement)                Regulierungsschritte
```

### Was du danach im Explorer tun kannst

- **Graph:** Die Ontologie ist vollständig. Der Schadenfall verknüpft Objekte, Deckungen und Policen. Der gesamte Lebenszyklus ist nachvollziehbar.
- **Explorer:** Vom Schaden zum betroffenen Objekt, zur Deckung, zur Police und zum Versicherer navigieren. Den Regulierungsverlauf (Teilschritte) chronologisch sehen.
- **Ausprobieren:** Einen neuen Schaden erfassen, einem Objekt und einer Deckung zuordnen, Regulierungsschritte anlegen.

### Vertiefungsfragen für diese Phase

- Brauchen Claims einen Bearbeiter (Sachbearbeiter, Gutachter)?
- Sollen Schadenursachen als eigene Nodes modelliert werden?
- Wie werden Reserven (reserveAmount) zeitlich nachverfolgt?

---

## Phase 7: Analytics — Antworten auf die Geschäftsfragen

**Ziel:** Prüfen, ob die Ontologie alle 8 Analytics Use Cases beantwortet.

### Keine neuen Entitäten oder Beziehungen

Stattdessen werden die vorhandenen Cypher-Queries (`03-example-queries.cypher`) gegen den vollständigen Graphen getestet.

### Die 8 Use Cases

| # | Frage | Traversal-Tiefe |
|---|-------|----------------|
| 1 | Objektbestand eines Unternehmens | Customer → InsurableObject → Risk (2 Hops) |
| 2 | Deckungszuordnung | InsurableObject → Risk → PolicyCoverage → Policy (3 Hops) |
| 3 | Beteiligte Versicherer | Policy → Insurer via UNDERWRITTEN_BY (1 Hop) |
| 4 | Risikokonzentration | Aggregation über InsurableObject.location und Customer.industry |
| 5 | Makler-Performance | Broker → Policy (aggregiert nach Prämienvolumen) |
| 6 | Deckungslücken | Risk ohne aktive PolicyCoverage |
| 7 | Mehrfachdeckungen | Risk mit >1 PolicyCoverage |
| 8 | Schadenquoten | Claim/Settlement vs. Prämie (mehrere Aggregationsebenen) |

### Was du in dieser Phase tun kannst

- Jede Query aus `03-example-queries.cypher` in der Neo4j Browser Console ausführen
- Ergebnisse prüfen: Stimmen die Zahlen? Fehlen Verbindungen?
- Falls eine Query nicht die erwarteten Ergebnisse liefert → Modell-Lücke identifizieren → ggf. zurück in frühere Phase

---

## Zusammenfassung: Phasen-Übersicht

| Phase | Fokus | Entitäten | Beziehungen | Kumulativ |
|-------|-------|-----------|-------------|-----------|
| 0 | Fundament | 0 | 0 | Leerer Graph + Constraints |
| 1 | Partner-Kern | 5 Labels | 3 Typen | 8 Nodes, 7 Rels |
| 2 | Objekte & Risiken | +5 Labels | +2 Typen | 20 Nodes, 21 Rels |
| 3 | Produkte | +4 Labels | +5 Typen | 35 Nodes, 35 Rels |
| 4 | Ausschreibung | +4 Labels | +8 Typen | 47 Nodes, 58 Rels |
| 5 | Vertrag | +3 Labels | +8 Typen | 55 Nodes, 75 Rels |
| 6 | Schaden | +2 Labels | +4 Typen | 58 Nodes, 80 Rels |
| 7 | Analytics | — | — | 8 Use-Case-Queries validiert |

## Praktischer Workflow pro Phase

```
1. Cypher-Dateien aktualisieren
   └── Ontology_UWWB/cypher/01-constraints-indexes.cypher
   └── Ontology_UWWB/cypher/02-example-data.cypher
   └── Ontology_UWWB/cypher/03-example-queries.cypher

2. Explorer öffnen → Sidebar → "Datenbank zurücksetzen & importieren"

3. Graph-Tab → Neue Nodes und Beziehungen visualisieren
   └── Label-Filter nutzen, um Fokus auf die aktuelle Phase zu legen

4. Explorer-Tab → Neue Entitäten durchklicken, Beziehungen navigieren

5. Experimentieren → Eigene Nodes/Beziehungen erstellen, Verständnis testen

6. Ontology-Spec aktualisieren → Erkenntnisse in ontology-spec.md festhalten
```
