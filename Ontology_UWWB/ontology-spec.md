# Ontologie: UWWB – Underwriting Workbench (Gewerbliche Industrieversicherung)

Stand: 2026-04-17 | Version: 1.0 | Status: Erstdurchlauf abgeschlossen

Quelle: `_NOTES/data/app.db` (SQLite, 19 Tabellen)

---

## 1. Domäne

### Beschreibung

Das Datenmodell bildet das Zusammenspiel zweier Ebenen der gewerblichen Industrieversicherung ab:

- **Nachfrage-Seite (Unternehmen):** Unternehmen (mit Konzern-Hierarchie) besitzen zu versichernde **Objekte** (Maschinen, Fahrzeuge, Gebäude, Veranstaltungen …). Jedes Objekt trägt ein oder mehrere **Risiken** (Feuer, Diebstahl, Ausfall …). Pro Risiko werden **Deckungen** gewünscht (Versicherungssumme, Klauseln).
- **Angebots-Seite (Versicherer):** **Versicherer** bündeln Deckungen in **Produkte** (organisiert in **Sparten**). Vertrieb läuft über **Makler**: Ausschreibung → Submission → Angebot (**Quote**) → **Police**. Bei Großrisiken teilen mehrere Versicherer den Risiko-Anteil (**Co-Insurance**, `sharePercent`).
- **Operative Ebene (Schäden):** **Schäden** sind einem **Objekt** + **Risiko** zugeordnet und betreffen konkrete **Deckungen**. Regulierung in mehreren Teilzahlungen (via `Endorsement`).
- **Workflow- / KI-Schicht:** Dokumente werden in `ExtractionRun`s via KI strukturiert, jedes `ExtractedField` trägt Confidence + Quellenverweis. `Assessment` bewertet gegen `UnderwritingGuideline` (Composite-Score → Routing). `AuditEvent` trackt Änderungen.

### Scope-Entscheidung

**Komplett** (Kerndomäne + Workflow + KI-Schicht). KI-Schicht wird besonders auf graph-native Optimierung geprüft (`ExtractedField` mit Provenance-Relationships statt JSON-Bag).

### Geschäftsprozesse

1. **Akquise:** Broker erstellt Tender für Company → Submission an einen oder mehrere Insurer
2. **KI-Datenextraktion:** Dokumente → ExtractionRun → ExtractedField (Confidence + Source)
3. **Bewertung:** Assessment gegen UnderwritingGuideline → Composite-Score → Routing
4. **Angebot / Vertrag:** Quote (mit Co-Insurance) → Policy → Endorsements, Claims
5. **Portfolio-Analyse:** Risiko-Konzentration, Schadenquote, Deckungslücken

### Analytics Use Cases

| # | Frage | Status |
|---|-------|--------|
| 1 | Welche Objekte hat ein Unternehmen (inkl. Töchter)? | Modelliert |
| 2 | Welche Risiken hat ein Objekt? | Modelliert |
| 3 | Welche Deckungen / Verträge sind den Risiken zugeordnet? | Modelliert |
| 4 | Wie viele Versicherer sind an Risiko-Deckungen beteiligt (Share)? | Modelliert |
| 5 | Wo konzentrieren sich Risiken (regional / Branche / max Schaden)? | Modelliert |
| 6 | Welcher Makler bringt am meisten Geschäft? | Modelliert |
| 7 | Wo gibt es Deckungslücken (Risk ohne aktive Coverage)? | Modelliert |
| 8 | Wo gibt es Mehrfachdeckungen (>1 aktive Coverage pro Risk)? | Modelliert |
| 9 | Schadenquote pro Ebene (Deckung / Objekt / Unternehmen / Sparte)? | Modelliert |
| 10 | KI-Extraktions-Qualität (Confidence, manuelle Korrekturen)? | Modelliert |

---

## 2. Node Labels

### Übersicht (23 Labels, 5 Cluster)

**Fachliche Kern-Domäne**

| # | Label | Quelle | Kern-Properties |
|---|-------|--------|-----------------|
| 1 | `Line` | `line` | id, name, description, active |
| 2 | `Company` | `partner`(Rolle=VN) | id, name, registrationNumber, street, postalCode, city, country, industry★, annualRevenue★, employeeCount★ |
| 3 | `Broker` | `partner`(Rolle=Makler) | id, name, registrationNumber, city, sanctionStatus, hitRatio, accreditationStatus, verificationStatus |
| 4 | `Insurer` | `partner`(Rolle=Versicherer) | id, name, registrationNumber, city, sanctionStatus, accreditationStatus |
| 5 | `Product` | `product` | id, name, status, description, validFrom, validTo |
| 6 | `Object` | `object` | id, name, objectType, context + dynamische Felder |
| 7 | `Risk` | `risk` | id, peril + dynamische Felder |
| 8 | `Coverage` | `coverage` | id, lifecycleStatus, coverageType, sumInsured, deductible, premium, specialConditions |
| 9 | `Policy` | `policy` | id, policyNumber, status, startDate, endDate, annualPremium |
| 10 | `Endorsement` | `endorsement` | id, endorsementNumber, type, effectiveDate, status, description |
| 11 | `Claim` | `claim` | id, claimNumber, status, incidentDate, claimAmount, reserveAmount, description |

**Angebots-/Workflow-Prozess**

| # | Label | Quelle | Kern-Properties |
|---|-------|--------|-----------------|
| 12 | `Tender` | `tender` | id, name, status, description |
| 13 | `Submission` | `submission` | id, status, transactionType, receivedAt, emailText, compositeScore, routingDecision, rank, approvalDecision, approvedAt, rejectionReason |
| 14 | `Quote` | `quote` | id, status, premium, validUntil |

**KI-/Extraktions-Schicht**

| # | Label | Quelle | Kern-Properties |
|---|-------|--------|-----------------|
| 15 | `Document` | `document` | id, filename, fileFormat, fileSize, uploadedAt, documentType |
| 16 | `ExtractionRun` | `extraction_run` | id, runNumber, executedAt, accepted, overallQuality, errorMessage |
| 17 | `ExtractedField` | `extracted_field` | id, targetEntityType, targetFieldName, aiConfidence, sourcePosition |
| 18 | `Assessment` | `assessment` | id, uwGuidelineScore, uwGuidelineKo, hitRatioScore, riskAppetiteScore, dataQualityScore, urgencyScore, compositeScore, routingDecision, assessedAt, assessmentReason |
| 19 | `UnderwritingGuideline` | `underwriting_guideline` | id, version, content, validFrom, isActive |

**Interne Nutzer & Audit**

| # | Label | Quelle | Kern-Properties |
|---|-------|--------|-----------------|
| 20 | `User` | `user` | id, authId, name, signingLimit, active |
| 21 | `AuditEvent` | `audit_log` | id, eventType, occurredAt, oldValue, newValue, reason |

**Template-Nodes (flexible Zusatz-Attribute)**

| # | Label | Quelle | Kern-Properties |
|---|-------|--------|-----------------|
| 22 | `ObjectType` | `product.object_type_schema` | code, name, description, requiredFields, optionalFields |
| 23 | `PerilType` | `product.peril_catalog` | code, name, description, fieldsSchema |

★ = gegenüber SQLite-DB neu ergänzt

> **Standard-Properties** (falls nicht anders vermerkt): `id` (String, Unique), `createdAt` (DateTime), `updatedAt` (DateTime).

---

## 3. Relationship Types

### Übersicht (34 Types)

**Struktur & Stammdaten**

| Type | Von | Nach | Kard. | Props | Beschreibung |
|------|-----|------|-------|-------|--------------|
| `PARENT_OF` | Company | Company | 1:n | – | Konzern-Hierarchie (Mutter → Tochter) |
| `OWNS` | Company | Object | 1:n | – | Unternehmen besitzt Objekt |
| `OF_TYPE` | Object | ObjectType | n:1 | – | Objekt-Kategorie (Template) |
| `HAS_RISK` | Object | Risk | 1:n | – | Risiko am Objekt |
| `PERIL_TYPE` | Risk | PerilType | n:1 | – | Risiko-Kategorie (Template) |
| `COVERED_BY` | Risk | Coverage | 1:n | – | Deckung zum Risiko |
| `BASED_ON` | Coverage | Product | n:1 | – | Produkt als Deckungs-Basis |
| `IN_LINE` | Product | Line | n:1 | – | Produkt gehört zur Sparte |
| `GOVERNED_BY` | Line | UnderwritingGuideline | 1:n | – | UW-Richtlinien einer Sparte |
| `AUTHORED` | User | UnderwritingGuideline | 1:n | – | Autor der Guideline |
| `MEMBER_OF` | User | Line | n:1 | – | Fachliche Zuordnung des UW-Mitarbeiters |

**Coverage-Lifecycle** (ein Coverage-Node kann mehreren Phasen angehören)

| Type | Von | Nach | Kard. | Props | Beschreibung |
|------|-----|------|-------|-------|--------------|
| `REQUESTED_IN` | Coverage | Submission | n:1 | – | gewünschte Deckung (status=requested) |
| `OFFERED_IN` | Coverage | Quote | n:1 | – | angebotene Deckung (status=offered) |
| `BOUND_IN` | Coverage | Policy | n:1 | – | vertragliche Deckung (status=bound/active) |
| `DERIVED_FROM` | Coverage | Coverage | n:1 | changeReason | Abweichung von requested→offered→bound |

**Workflow & Vertrieb**

| Type | Von | Nach | Kard. | Props | Beschreibung |
|------|-----|------|-------|-------|--------------|
| `ISSUED_BY` | Tender | Broker | n:1 | – | Ausschreibung stammt vom Makler |
| `FOR_COMPANY` | Tender | Company | n:1 | – | Ausschreibung für Unternehmen |
| `IN_TENDER` | Submission | Tender | n:1 | – | Submission zu einer Ausschreibung |
| `SUBMITTED_BY` | Submission | Broker | n:1 | – | einreichender Makler (kann = Tender-Broker sein) |
| `COVERS_COMPANY` | Submission | Company | n:1 | – | Submission betrifft dieses Unternehmen |
| `ADDRESSED_TO` | Submission | Insurer | n:m | – | Submission an Versicherer (mehrere bei Mitzeichnung) |
| `APPROVED_BY` | Submission | User | n:1 | – | Freigabe durch UW-Mitarbeiter |
| `HAS_OBJECT` | Submission | Object | 1:n | – | Objekte in der Submission |
| `PRODUCED` | Submission | Quote | 1:n | – | aus Submission hervorgegangene Angebote |
| `FOR_PRODUCT` | Quote | Product | n:1 | – | angebotenes Produkt |
| `UNDERWRITTEN_BY` | Quote | Insurer | n:m | sharePercent, leadInsurer | Co-Insurance auf Quote-Ebene |
| `REALIZED_AS` | Quote | Policy | 1:1 | – | Annahme des Angebots |
| `ON_PRODUCT` | Policy | Product | n:1 | – | Vertrags-Produkt |
| `UNDERWRITTEN_BY` | Policy | Insurer | n:m | sharePercent, leadInsurer, premiumShare | Co-Insurance auf Policy-Ebene |
| `AMENDED_BY` | Policy | Endorsement | 1:n | – | Vertrags-Nachtrag |
| `HAS_CLAIM` | Policy | Claim | 1:n | – | Schaden auf der Police |
| `ON_OBJECT` | Claim | Object | n:1 | – | Schaden betrifft Objekt |
| `FOR_RISK` | Claim | Risk | n:1 | – | Schaden betrifft Risiko |
| `AFFECTS_COVERAGE` | Claim | Coverage | n:m | paidAmount | konkrete Coverage(s) mit Entschädigungsanteil |

**KI-/Extraktions-Schicht**

| Type | Von | Nach | Kard. | Props | Beschreibung |
|------|-----|------|-------|-------|--------------|
| `HAS_DOCUMENT` | Submission | Document | 1:n | – | Dokument zur Submission |
| `PROCESSED_IN` | Submission | ExtractionRun | 1:n | – | Extraktionslauf |
| `USED_DOCUMENT` | ExtractionRun | Document | n:m | – | Eingangsdokumente des Laufs |
| `EXTRACTED_IN` | ExtractedField | ExtractionRun | n:1 | – | extrahiert in welchem Lauf |
| `FROM_DOCUMENT` | ExtractedField | Document | n:1 | – | Quelldokument des Feldes |
| `POPULATES` | ExtractedField | (Object\|Risk\|Coverage) | n:1 | – | populiertes Ziel-Entity (via Label + Relationship) |

**Assessment & Audit**

| Type | Von | Nach | Kard. | Props | Beschreibung |
|------|-----|------|-------|-------|--------------|
| `ASSESSES` | Assessment | Submission | n:1 | – | Assessment zu Submission |
| `APPLIES_GUIDELINE` | Assessment | UnderwritingGuideline | n:1 | – | angewendete Richtlinie |
| `ON_SUBMISSION` | AuditEvent | Submission | n:1 | – | Audit-Event an Submission |
| `BY_USER` | AuditEvent | User | n:1 | – | auslösender Nutzer |
| `AFFECTS_FIELD` | AuditEvent | ExtractedField | n:1 | – | Korrektur eines extrahierten Feldes |

### Richtungs-Konvention

Beziehungen verlaufen **von der spezifischeren zur allgemeineren Entität** bzw. **vom Child zum Parent**, wenn fachlich sinnvoll. Ausnahmen:
- Traversal-Frequenz: `(Company)-[:OWNS]->(Object)` statt `Object-OWNED_BY-Company`, weil man meist von Company aus sucht.
- Lifecycle-Beziehungen gehen vom Coverage-Node aus (`Coverage-[:REQUESTED_IN]->Submission`), weil Coverage-Node der "Identitätsträger" über die Lifecycle-Phasen ist.

---

## 4. Diagramm

Siehe: `diagrams/ontology-overview.mermaid`

```mermaid
graph LR
  subgraph "Demand-Seite"
    Company-->|PARENT_OF|Company
    Company-->|OWNS|Object
    Object-->|HAS_RISK|Risk
    Risk-->|COVERED_BY|Coverage
    Object-->|OF_TYPE|ObjectType
    Risk-->|PERIL_TYPE|PerilType
  end
  subgraph "Workflow"
    Broker-->|ISSUED_BY|Tender
    Tender-->|FOR_COMPANY|Company
    Submission-->|IN_TENDER|Tender
    Submission-->|SUBMITTED_BY|Broker
    Submission-->|COVERS_COMPANY|Company
    Submission-->|HAS_OBJECT|Object
    Submission-->|ADDRESSED_TO|Insurer
    Submission-->|PRODUCED|Quote
  end
  subgraph "Angebots-Seite"
    Quote-->|FOR_PRODUCT|Product
    Quote-->|UNDERWRITTEN_BY|Insurer
    Quote-->|REALIZED_AS|Policy
    Policy-->|UNDERWRITTEN_BY|Insurer
    Policy-->|AMENDED_BY|Endorsement
    Policy-->|HAS_CLAIM|Claim
    Product-->|IN_LINE|Line
  end
  subgraph "Schaden"
    Claim-->|ON_OBJECT|Object
    Claim-->|FOR_RISK|Risk
    Claim-->|AFFECTS_COVERAGE|Coverage
  end
  subgraph "Coverage-Lifecycle"
    Coverage-->|REQUESTED_IN|Submission
    Coverage-->|OFFERED_IN|Quote
    Coverage-->|BOUND_IN|Policy
    Coverage-->|BASED_ON|Product
  end
  subgraph "KI-Schicht"
    Submission-->|HAS_DOCUMENT|Document
    Submission-->|PROCESSED_IN|ExtractionRun
    ExtractionRun-->|USED_DOCUMENT|Document
    ExtractedField-->|EXTRACTED_IN|ExtractionRun
    ExtractedField-->|FROM_DOCUMENT|Document
    ExtractedField-->|POPULATES|Object
  end
  subgraph "Assessment"
    Assessment-->|ASSESSES|Submission
    Assessment-->|APPLIES_GUIDELINE|UnderwritingGuideline
    Line-->|GOVERNED_BY|UnderwritingGuideline
  end
```

---

## 5. Beispiel-Szenario

### Szenario-Beschreibung

**Festival-Saison 2026 der EventMedia Holding AG**

Die fiktive Konzernmutter `EventMedia Holding AG` (Düsseldorf) besteht aus zwei Töchtern:
- `Rock Night Events GmbH` (Hamburg)
- `Festival Organizers AG` (Berlin)

Für die Saison 2026 sollen drei Objekte versichert werden:
- Veranstaltung "Rock Night 2026" (Hamburg, 12 000 Besucher)
- Veranstaltung "Jazz Summer 2026" (Hamburg, 4 500 Besucher)
- Produktionshalle "Halle A" (Berlin, 8 500 m²)

Der Makler `Broker Mueller & Partner GmbH` startet eine Ausschreibung an zwei Versicherer:
- `Allianz Global Corporate` (Lead, 60 % Share)
- `HDI Global SE` (Follow, 40 % Share)

Drei Sparten: Veranstaltung, Sach, Haftpflicht. Pro Risiko werden Coverages über den Lifecycle `requested → offered → bound` geführt. Ein Sturmschaden bei der Rock Night 2026 (Teilregulierung) demonstriert den Claim-Weg.

Das Beispiel enthält bewusst:
- eine **Deckungslücke** (Jazz Summer / Cyber → nur requested, nie offered)
- eine **Mehrfachdeckung** (Rock Night / Haftpflicht → 2 aktive Coverages)
- einen **Teilschaden** mit Endorsement
- eine **KI-Extraktion** mit niedriger Confidence auf einem Feld (Kandidat für manuelle Korrektur)

### Datenübersicht

| Node-Typ | Anzahl |
|----------|--------|
| Line | 3 |
| Company | 3 (inkl. 1 Konzern-Mutter) |
| Broker | 1 |
| Insurer | 2 |
| User | 2 |
| UnderwritingGuideline | 2 |
| Product | 3 |
| ObjectType | 3 |
| PerilType | 4 |
| Object | 3 |
| Risk | 6 |
| Coverage | 9 (3×requested, 3×offered, 3×bound + 2 extra für Mehrfach) |
| Tender | 1 |
| Submission | 1 |
| Quote | 1 |
| Policy | 2 |
| Endorsement | 1 |
| Claim | 1 |
| Document | 3 |
| ExtractionRun | 1 |
| ExtractedField | 6 |
| Assessment | 1 |
| AuditEvent | 1 |

### Beispiel-Queries

Siehe `cypher/03-example-queries.cypher` (10 Queries, eine pro Analytics Use Case).

---

## 6. Entscheidungsprotokoll

| # | Entscheidung | Begründung | Alternativen |
|---|--------------|------------|--------------|
| 1 | Scope = Komplett inkl. KI-Schicht | User-Vorgabe | Nur Kerndomäne / Kern + Angebotsprozess |
| 2 | Workdir `Ontology_UWWB/` | bereits vorhanden | neu anlegen |
| 3 | `partner` → 3 Labels (Company/Broker/Insurer) | Rollen mit unterschiedlicher Semantik | Multi-Label, Partner+Property |
| 4 | Konzern via `(Company)-[:PARENT_OF]->(Company)` | graph-nativ, rekursive Queries | CompanyGroup+HAS_MEMBER / nicht modellieren |
| 5 | Coverage-Lifecycle als Status-Property + Phase-Beziehungen | ein Identitätsträger, einfache Diffs | 3 Labels, CoverageTemplate |
| 6 | Flex-Attribute als Node-Properties + Template-Nodes | schemafreies Neo4j nutzen | JSON-Property / Attribute-Nodes |
| 7 | Co-Insurance als Relationship-Property `sharePercent` | aggregierbar, leichtgewichtig | LineSlip-Zwischenknoten / nur 1:1 |

---

## 7. Offene Punkte (für Vertiefungs-Runden)

- [ ] `CoverageTemplate` (generische Deckungs-Definition je Produkt) – derzeit nur implizit über `coverageType`-Property. Sollte das expliziert werden?
- [ ] `ExtractedField.POPULATES` ist polymorph (Ziel: Object / Risk / Coverage / Policy …). Eine einzige Beziehung oder typisierte `POPULATES_OBJECT` / `POPULATES_RISK` usw.?
- [ ] `AuditEvent` granular pro Feld oder gröber pro Transition (Status-Wechsel der Submission)?
- [ ] `Clause` (Klausel) – aktuell nur als Text in `Coverage.specialConditions`. Eigenes Label + Wiederverwendung über Produkte?
- [ ] `Line` hat bisher keine Properties wie Schaden-Cluster / Kapazitätslimit – relevant für Portfolio-Analyse?
- [ ] Geocoding / Region-Hierarchie (Land → Bundesland → Stadt) für "Konzentration regional"?
