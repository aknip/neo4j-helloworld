# Ontologie: UWWB (Underwriting Workbench)

Stand: 2026-04-09 | Version: 0.5 | Status: Erstdurchlauf — Schritt 1c Beziehungen

---

## 1. Domäne

### Beschreibung
Underwriting Workbench (UWWB) für Industrieversicherer, Industrieversicherungsmakler oder Assekuradeure. Die Software bildet alle versicherungsfachlichen Prozesse ab: Verwaltung von Kunden-, Angebots-, Vertrags-, Schaden- und Abrechnungsdaten sowie Risikodaten der Kunden (Unternehmensstruktur, Gebäude, Maschinen, Mitarbeiter, Projekte, Finanzkennzahlen). Primäre Nutzer sind Underwriter, die sowohl operative Arbeitsvorgänge bearbeiten als auch Risikodaten analysieren und beurteilen.

### Zwei Ebenen der Versicherungswirtschaft

**Ebene A — Unternehmen und Risiken (Nachfrageseite):**
- Unternehmen (Versicherungsnehmer) mit Konzernstruktur (Tochterunternehmen)
- Versicherbare Objekte: Maschinen, Fahrzeuge, Gebäude, Mitarbeiter, Veranstaltungen, Projekte, Dienstleistungen
- Risiken je Objekt: Diebstahl, Feuer, Beschädigung, Entwertung, Produktionsausfall etc.
- Deckungswünsche je Risiko: gewünschte Versicherungssumme, Klauseln, Zeitraum

**Ebene B — Versicherer und Versicherungsprodukte (Angebotsseite):**
- Versicherer bieten Versicherungsprodukte in Sparten an
- Produkte bündeln Deckungsdefinitionen inkl. Klauseln und Prämienberechnung
- Deckungsdefinitionen: max. Versicherungssumme, Selbstbeteiligung, Ausschlüsse, Bedingungswerk

### Geschäftsprozesse
- Ausschreibungsprozess: Makler nimmt Risikodaten auf → Ausschreibung an Versicherer → Angebote mit Deckungsangeboten → Verhandlung → Vertragsbindung (Police)
- Laufende Vertragsanpassungen: Nachträge (Endorsements) bei Änderungen an Objekten, Struktur oder Schadenverlauf
- Schadenmanagement: Schadenerfassung → Zuordnung zu Objekten/Deckungen → Regulierungsschritte (Teilregulierungen, Teilzahlungen, Nachreservierungen)

### Analytics Use Cases
| # | Frage | Beschreibung | Status |
|---|-------|-------------|--------|
| 1 | Objektbestand eines Unternehmens | Welche Objekte hat ein Unternehmen? Welche Risiken haben diese Objekte? | Offen |
| 2 | Deckungszuordnung | Welche Deckungen/Verträge sind den Risiken/Objekten zugeordnet? | Offen |
| 3 | Beteiligte Versicherer | Wie viele Produkte/Versicherer sind an der Risikodeckung beteiligt? | Offen |
| 4 | Risikokonzentration | Regional, nach Branche, nach max. Schadenshöhe über mehrere Verträge | Offen |
| 5 | Makler-Performance | Wer bringt am meisten Geschäft? | Offen |
| 6 | Deckungslücken | Wo ist ein Unternehmen unterversichert? | Offen |
| 7 | Mehrfachdeckungen | Wo bestehen Überschneidungen über mehrere Verträge? | Offen |
| 8 | Schadenquoten | Auf Ebene Deckung, Objekt, Unternehmen, Sparte, Versicherer | Offen |

---

## 2. Node Labels

### Partner-Modell

Geschäftspartner (Unternehmen, Versicherer, Makler, Ansprechpartner) werden einheitlich als **Partner** modelliert. Die Rolle wird über **Multi-Labels** abgebildet: `:Partner:Customer`, `:Partner:Insurer`, `:Partner:Broker`, `:Partner:Contact`. Ein Partner kann mehrere Rollen gleichzeitig haben.

### Übersicht

**Partner & Rollen (1 Basis-Label + 4 Rollen-Labels):**
| Label | Beschreibung | Kern-Properties |
|-------|-------------|----------------|
| Partner | Basis-Label für alle Geschäftspartner | legalName, partnerType, country |
| Customer | Rollen-Label: Versicherungsnehmer / Kunde | industry, revenue |
| Insurer | Rollen-Label: Versicherungsgesellschaft | rating |
| Broker | Rollen-Label: Versicherungsmakler | licenseNumber |
| Contact | Rollen-Label: Ansprechpartner / natürliche Person | firstName, lastName, email, phone |

**Versicherbare Objekte (1 Basis-Label + 5 Typ-Labels):**
| Label | Beschreibung | Kern-Properties |
|-------|-------------|----------------|
| InsurableObject | Basis-Label für versicherbare Objekte | objectName, location, insuredValue |
| Building | Typ-Label: Gebäude | constructionYear, area, fireProtectionClass |
| Machine | Typ-Label: Maschine / Anlage | manufacturer, acquisitionValue, commissioningDate |
| Vehicle | Typ-Label: Fahrzeug | licensePlate, vehicleType, acquisitionValue |
| Person | Typ-Label: Versicherbare Schlüsselperson | firstName, lastName, role |
| Project | Typ-Label: Projekt / Vorhaben | projectName, startDate, endDate |

**Risiko & Deckungswunsch:**
| Label | Beschreibung | Kern-Properties |
|-------|-------------|----------------|
| Risk | Einem Objekt zugeordnetes Risiko | riskType, maxExposure, probability |
| CoverageRequest | Deckungswunsch pro Risiko | requestedSum, deductible, periodStart, periodEnd |

**Versicherungsprodukte:**
| Label | Beschreibung | Kern-Properties |
|-------|-------------|----------------|
| InsuranceProduct | Produkt eines Versicherers | productName, validFrom, validTo |
| InsuranceLine | Sparte (Hierarchie über Selbstreferenz) | lineName, lineCode |
| CoverageDefinition | Deckungsdefinition innerhalb eines Produkts | maxSum, deductible, exclusions |
| Clause | Klausel / Bedingung | clauseCode, title, text |

**Geschäftsprozesse:**
| Label | Beschreibung | Kern-Properties |
|-------|-------------|----------------|
| Submission | Ausschreibung | submissionDate, deadline, status |
| Offer | Angebot auf Ausschreibung | premiumAmount, validUntil, status |
| CoverageOffer | Deckungsangebot innerhalb eines Angebots | offeredSum, offeredDeductible, premiumShare |
| Policy | Versicherungsvertrag / Police | policyNumber, effectiveDate, expirationDate, totalPremium |
| PolicyCoverage | Finale Deckung im Vertrag | coveredSum, deductible, premiumShare |
| Endorsement | Nachtrag / Vertragsanpassung | endorsementNumber, effectiveDate, changeDescription |

**Schadenmanagement:**
| Label | Beschreibung | Kern-Properties |
|-------|-------------|----------------|
| Claim | Schadenfall | claimDate, claimAmount, status |
| ClaimSettlement | Regulierungsschritt | settlementDate, amount, settlementType |

**Flexible Attribute:**
| Label | Beschreibung | Kern-Properties |
|-------|-------------|----------------|
| AttributeTemplate | Vorlage für Zusatzattribute | templateName, dataType, unit |
| CustomAttribute | Konkreter Attributwert | value |

### Detail-Properties pro Label

Standardmässig erhalten alle Nodes: `id` (String, Unique), `createdAt` (DateTime), `updatedAt` (DateTime). Zusätzlich `status` wo sinnvoll.

#### Partner (Basis-Label)
| Property | Neo4j-Typ | Pflicht | Index | Beschreibung |
|----------|-----------|---------|-------|-------------|
| id | String | Ja | Unique | Eindeutige ID |
| legalName | String | Ja | Range | Offizieller Name (Firma oder vollständiger Name) |
| partnerType | String | Ja | Range | organization / person |
| country | String | Nein | Range | Sitzland |
| status | String | Ja | Range | active / inactive |
| createdAt | DateTime | Ja | Nein | Erstellungszeitpunkt |
| updatedAt | DateTime | Ja | Nein | Letzter Änderungszeitpunkt |

#### Customer (Rollen-Label, Multi-Label mit Partner)
| Property | Neo4j-Typ | Pflicht | Index | Beschreibung |
|----------|-----------|---------|-------|-------------|
| industry | String | Nein | Range | Branche (z.B. Automotive, Pharma) |
| revenue | Float | Nein | Nein | Jahresumsatz in EUR |

#### Insurer (Rollen-Label, Multi-Label mit Partner)
| Property | Neo4j-Typ | Pflicht | Index | Beschreibung |
|----------|-----------|---------|-------|-------------|
| rating | String | Nein | Range | Finanzstärke-Rating (z.B. A+, AA-) |

#### Broker (Rollen-Label, Multi-Label mit Partner)
| Property | Neo4j-Typ | Pflicht | Index | Beschreibung |
|----------|-----------|---------|-------|-------------|
| licenseNumber | String | Nein | Range | Zulassungsnummer |

#### Contact (Rollen-Label, Multi-Label mit Partner)
| Property | Neo4j-Typ | Pflicht | Index | Beschreibung |
|----------|-----------|---------|-------|-------------|
| firstName | String | Ja | Nein | Vorname |
| lastName | String | Ja | Range | Nachname |
| email | String | Nein | Range | E-Mail-Adresse |
| phone | String | Nein | Nein | Telefonnummer |

#### InsurableObject (Basis-Label)
| Property | Neo4j-Typ | Pflicht | Index | Beschreibung |
|----------|-----------|---------|-------|-------------|
| id | String | Ja | Unique | Eindeutige ID |
| objectName | String | Ja | Range | Bezeichnung des Objekts |
| location | String | Nein | Range | Standort / Adresse |
| insuredValue | Float | Nein | Nein | Versicherungswert in EUR |
| status | String | Ja | Range | active / decommissioned |
| createdAt | DateTime | Ja | Nein | Erstellungszeitpunkt |
| updatedAt | DateTime | Ja | Nein | Letzter Änderungszeitpunkt |

#### Building (Multi-Label mit InsurableObject)
| Property | Neo4j-Typ | Pflicht | Index | Beschreibung |
|----------|-----------|---------|-------|-------------|
| constructionYear | Integer | Nein | Nein | Baujahr |
| area | Float | Nein | Nein | Fläche in m² |
| fireProtectionClass | String | Nein | Range | Brandschutzklasse |
| floors | Integer | Nein | Nein | Anzahl Stockwerke |

#### Machine (Multi-Label mit InsurableObject)
| Property | Neo4j-Typ | Pflicht | Index | Beschreibung |
|----------|-----------|---------|-------|-------------|
| manufacturer | String | Nein | Range | Hersteller |
| acquisitionValue | Float | Nein | Nein | Anschaffungswert in EUR |
| commissioningDate | Date | Nein | Nein | Inbetriebnahmedatum |
| machineType | String | Nein | Range | Maschinentyp |

#### Vehicle (Multi-Label mit InsurableObject)
| Property | Neo4j-Typ | Pflicht | Index | Beschreibung |
|----------|-----------|---------|-------|-------------|
| licensePlate | String | Nein | Range | Kennzeichen |
| vehicleType | String | Nein | Range | PKW, LKW, Spezialfahrzeug etc. |
| acquisitionValue | Float | Nein | Nein | Anschaffungswert in EUR |

#### Person (Multi-Label mit InsurableObject)
| Property | Neo4j-Typ | Pflicht | Index | Beschreibung |
|----------|-----------|---------|-------|-------------|
| firstName | String | Ja | Nein | Vorname |
| lastName | String | Ja | Range | Nachname |
| role | String | Nein | Range | Funktion im Unternehmen |

#### Project (Multi-Label mit InsurableObject)
| Property | Neo4j-Typ | Pflicht | Index | Beschreibung |
|----------|-----------|---------|-------|-------------|
| projectName | String | Ja | Range | Projektbezeichnung |
| startDate | Date | Nein | Nein | Projektstart |
| endDate | Date | Nein | Nein | Projektende |

#### Risk
| Property | Neo4j-Typ | Pflicht | Index | Beschreibung |
|----------|-----------|---------|-------|-------------|
| id | String | Ja | Unique | Eindeutige ID |
| riskType | String | Ja | Range | Feuer, Diebstahl, Produktionsausfall etc. |
| maxExposure | Float | Nein | Nein | Maximales Schadenspotenzial in EUR |
| probability | String | Nein | Nein | Eintrittswahrscheinlichkeit (low/medium/high) |
| description | String | Nein | Nein | Risikobeschreibung |
| createdAt | DateTime | Ja | Nein | Erstellungszeitpunkt |
| updatedAt | DateTime | Ja | Nein | Letzter Änderungszeitpunkt |

#### CoverageRequest
| Property | Neo4j-Typ | Pflicht | Index | Beschreibung |
|----------|-----------|---------|-------|-------------|
| id | String | Ja | Unique | Eindeutige ID |
| requestedSum | Float | Ja | Nein | Gewünschte Versicherungssumme in EUR |
| deductible | Float | Nein | Nein | Gewünschte Selbstbeteiligung in EUR |
| periodStart | Date | Ja | Nein | Gewünschter Deckungsbeginn |
| periodEnd | Date | Ja | Nein | Gewünschtes Deckungsende |
| status | String | Ja | Range | open / matched / expired |
| createdAt | DateTime | Ja | Nein | Erstellungszeitpunkt |
| updatedAt | DateTime | Ja | Nein | Letzter Änderungszeitpunkt |

#### InsuranceProduct
| Property | Neo4j-Typ | Pflicht | Index | Beschreibung |
|----------|-----------|---------|-------|-------------|
| id | String | Ja | Unique | Eindeutige ID |
| productName | String | Ja | Range | Produktbezeichnung |
| validFrom | Date | Nein | Nein | Gültig ab |
| validTo | Date | Nein | Nein | Gültig bis |
| status | String | Ja | Range | active / discontinued |
| createdAt | DateTime | Ja | Nein | Erstellungszeitpunkt |
| updatedAt | DateTime | Ja | Nein | Letzter Änderungszeitpunkt |

#### InsuranceLine
| Property | Neo4j-Typ | Pflicht | Index | Beschreibung |
|----------|-----------|---------|-------|-------------|
| id | String | Ja | Unique | Eindeutige ID |
| lineName | String | Ja | Range | Spartenname (Haftpflicht, Property, Cyber etc.) |
| lineCode | String | Ja | Range | Spartenkürzel |
| createdAt | DateTime | Ja | Nein | Erstellungszeitpunkt |
| updatedAt | DateTime | Ja | Nein | Letzter Änderungszeitpunkt |

#### CoverageDefinition
| Property | Neo4j-Typ | Pflicht | Index | Beschreibung |
|----------|-----------|---------|-------|-------------|
| id | String | Ja | Unique | Eindeutige ID |
| name | String | Ja | Range | Deckungsbezeichnung |
| maxSum | Float | Nein | Nein | Maximale Versicherungssumme in EUR |
| deductible | Float | Nein | Nein | Standard-Selbstbeteiligung in EUR |
| exclusions | String | Nein | Nein | Ausschlussbeschreibung |
| createdAt | DateTime | Ja | Nein | Erstellungszeitpunkt |
| updatedAt | DateTime | Ja | Nein | Letzter Änderungszeitpunkt |

#### Clause
| Property | Neo4j-Typ | Pflicht | Index | Beschreibung |
|----------|-----------|---------|-------|-------------|
| id | String | Ja | Unique | Eindeutige ID |
| clauseCode | String | Ja | Range | Klauselkürzel |
| title | String | Ja | Range | Klauseltitel |
| text | String | Nein | Nein | Volltext der Klausel |
| createdAt | DateTime | Ja | Nein | Erstellungszeitpunkt |
| updatedAt | DateTime | Ja | Nein | Letzter Änderungszeitpunkt |

#### Submission
| Property | Neo4j-Typ | Pflicht | Index | Beschreibung |
|----------|-----------|---------|-------|-------------|
| id | String | Ja | Unique | Eindeutige ID |
| submissionDate | Date | Ja | Range | Ausschreibungsdatum |
| deadline | Date | Nein | Range | Angebotsfrist |
| status | String | Ja | Range | draft / open / closed / bound |
| description | String | Nein | Nein | Beschreibung der Ausschreibung |
| createdAt | DateTime | Ja | Nein | Erstellungszeitpunkt |
| updatedAt | DateTime | Ja | Nein | Letzter Änderungszeitpunkt |

#### Offer
| Property | Neo4j-Typ | Pflicht | Index | Beschreibung |
|----------|-----------|---------|-------|-------------|
| id | String | Ja | Unique | Eindeutige ID |
| premiumAmount | Float | Ja | Nein | Gesamtprämie in EUR |
| validUntil | Date | Nein | Nein | Angebot gültig bis |
| status | String | Ja | Range | pending / accepted / rejected / expired |
| createdAt | DateTime | Ja | Nein | Erstellungszeitpunkt |
| updatedAt | DateTime | Ja | Nein | Letzter Änderungszeitpunkt |

#### CoverageOffer
| Property | Neo4j-Typ | Pflicht | Index | Beschreibung |
|----------|-----------|---------|-------|-------------|
| id | String | Ja | Unique | Eindeutige ID |
| offeredSum | Float | Ja | Nein | Angebotene Versicherungssumme in EUR |
| offeredDeductible | Float | Nein | Nein | Angebotene Selbstbeteiligung in EUR |
| premiumShare | Float | Nein | Nein | Prämienanteil für diese Deckung in EUR |
| createdAt | DateTime | Ja | Nein | Erstellungszeitpunkt |
| updatedAt | DateTime | Ja | Nein | Letzter Änderungszeitpunkt |

#### Policy
| Property | Neo4j-Typ | Pflicht | Index | Beschreibung |
|----------|-----------|---------|-------|-------------|
| id | String | Ja | Unique | Eindeutige ID |
| policyNumber | String | Ja | Unique | Policennummer |
| effectiveDate | Date | Ja | Range | Vertragsbeginn |
| expirationDate | Date | Ja | Range | Vertragsende |
| totalPremium | Float | Ja | Nein | Gesamtprämie in EUR |
| status | String | Ja | Range | active / expired / cancelled |
| createdAt | DateTime | Ja | Nein | Erstellungszeitpunkt |
| updatedAt | DateTime | Ja | Nein | Letzter Änderungszeitpunkt |

#### PolicyCoverage
| Property | Neo4j-Typ | Pflicht | Index | Beschreibung |
|----------|-----------|---------|-------|-------------|
| id | String | Ja | Unique | Eindeutige ID |
| coveredSum | Float | Ja | Nein | Gedeckte Versicherungssumme in EUR |
| deductible | Float | Nein | Nein | Selbstbeteiligung in EUR |
| premiumShare | Float | Nein | Nein | Prämienanteil in EUR |
| createdAt | DateTime | Ja | Nein | Erstellungszeitpunkt |
| updatedAt | DateTime | Ja | Nein | Letzter Änderungszeitpunkt |

#### Endorsement
| Property | Neo4j-Typ | Pflicht | Index | Beschreibung |
|----------|-----------|---------|-------|-------------|
| id | String | Ja | Unique | Eindeutige ID |
| endorsementNumber | String | Ja | Range | Nachtragsnummer |
| effectiveDate | Date | Ja | Range | Gültig ab |
| changeDescription | String | Ja | Nein | Beschreibung der Änderung |
| premiumAdjustment | Float | Nein | Nein | Prämienanpassung in EUR |
| createdAt | DateTime | Ja | Nein | Erstellungszeitpunkt |
| updatedAt | DateTime | Ja | Nein | Letzter Änderungszeitpunkt |

#### Claim
| Property | Neo4j-Typ | Pflicht | Index | Beschreibung |
|----------|-----------|---------|-------|-------------|
| id | String | Ja | Unique | Eindeutige ID |
| claimNumber | String | Ja | Unique | Schadennummer |
| claimDate | Date | Ja | Range | Schadendatum |
| claimAmount | Float | Nein | Nein | Geschätzter Schadenbetrag in EUR |
| reserveAmount | Float | Nein | Nein | Reservierter Betrag in EUR |
| status | String | Ja | Range | reported / open / settled / closed |
| description | String | Nein | Nein | Schadenbeschreibung |
| createdAt | DateTime | Ja | Nein | Erstellungszeitpunkt |
| updatedAt | DateTime | Ja | Nein | Letzter Änderungszeitpunkt |

#### ClaimSettlement
| Property | Neo4j-Typ | Pflicht | Index | Beschreibung |
|----------|-----------|---------|-------|-------------|
| id | String | Ja | Unique | Eindeutige ID |
| settlementDate | Date | Ja | Range | Regulierungsdatum |
| amount | Float | Ja | Nein | Regulierungsbetrag in EUR |
| settlementType | String | Ja | Range | partial / final / reserve_adjustment |
| description | String | Nein | Nein | Beschreibung |
| createdAt | DateTime | Ja | Nein | Erstellungszeitpunkt |
| updatedAt | DateTime | Ja | Nein | Letzter Änderungszeitpunkt |

#### AttributeTemplate
| Property | Neo4j-Typ | Pflicht | Index | Beschreibung |
|----------|-----------|---------|-------|-------------|
| id | String | Ja | Unique | Eindeutige ID |
| templateName | String | Ja | Range | Attributname (z.B. "Tragfähigkeit") |
| dataType | String | Ja | Nein | String / Float / Integer / Boolean / Date |
| unit | String | Nein | Nein | Einheit (z.B. kg, m², kW) |
| createdAt | DateTime | Ja | Nein | Erstellungszeitpunkt |
| updatedAt | DateTime | Ja | Nein | Letzter Änderungszeitpunkt |

#### CustomAttribute
| Property | Neo4j-Typ | Pflicht | Index | Beschreibung |
|----------|-----------|---------|-------|-------------|
| id | String | Ja | Unique | Eindeutige ID |
| value | String | Ja | Nein | Attributwert (als String gespeichert, Typ via Template) |
| createdAt | DateTime | Ja | Nein | Erstellungszeitpunkt |
| updatedAt | DateTime | Ja | Nein | Letzter Änderungszeitpunkt |

---

## 3. Relationship Types

*[Wird in Schritt 1c ergänzt]*

---

## 4. Diagramm

*[Wird in Schritt 1d ergänzt]*

---

## 5. Beispiel-Szenario

*[Wird in Schritt 1d ergänzt]*

---

## 6. Entscheidungsprotokoll

| # | Entscheidung | Begründung | Alternativen |
|---|-------------|-------------|-------------|
| 1 | Flexible Attribute über Template/CustomAttribute-Pattern | Verschiedene Objekttypen (Gebäude, Maschine, Fahrzeug) brauchen unterschiedliche Attribute. Templates standardisieren, Ad-hoc-Attribute ermöglichen Flexibilität. | Alles als Properties (nicht flexibel), JSON-Properties (nicht abfragbar) |
| 2 | Multi-Label für InsurableObject-Typen | Übergreifende Risiko-Analysen über :InsurableObject, typ-spezifische Abfragen über :Building/:Machine etc. Eigene Constraints pro Typ möglich. Neue Typen einfach hinzufügbar. | Einheitliches Label + type-Property (langsamer, kein Schema), Getrennte Labels ohne Basis-Label (übergreifende Queries umständlich) |
| 3 | Partner-Modell mit Multi-Labels für Rollen | Company, Insurer, Broker, Contact werden zu Partner mit Rollen-Labels (:Partner:Customer, :Partner:Insurer etc.). Ermöglicht Mehrfachrollen (z.B. ein Unternehmen ist gleichzeitig Customer und Insurer). Einheitliche Partner-Verwaltung, weniger Redundanz. | Getrennte Entitäten (Redundanz bei gemeinsamen Properties, keine Mehrfachrollen), Rollen-Property (weniger performant bei Abfragen), Rollen-Node (aufwendiger) |
| 4 | Person (InsurableObject) bleibt eigenständig | Versicherbare Schlüsselpersonen sind keine Geschäftspartner, sondern versicherbare Objekte. Getrennte Modellierung verhindert semantische Verwirrung. | Auch Person in Partner integrieren (vermischt zwei verschiedene Konzepte) |

---

## 7. Offene Punkte

- [ ] Beziehungen definieren (Schritt 1c)
- [ ] Detaillierung der Objekttyp-spezifischen Attribute
- [ ] Prämienberechnung: Modellierung von Tarifen und Berechnungslogik
- [ ] Dokumentenmanagement (Policen-Dokumente, Schadenberichte etc.)
- [ ] Benutzer/Rollen-Modell (Underwriter, Sachbearbeiter etc.)
- [ ] Historisierung/Versionierung von Vertrags- und Deckungsänderungen
- [ ] Konzernstruktur: HAS_SUBSIDIARY Selbstreferenz auf Partner:Customer
- [ ] Spartenhierarchie: HAS_SUBLINE Selbstreferenz auf InsuranceLine
