# Fachliches Domänenmodell UWWB für Cosmo Underwriting Workbench (UWWB)

Stand: 2026-03-18 | Version: 6
von: UWWB-WEG

## 1. Fachlicher Hintergrund, Geschäftsprozesse und Anforderungen

### 1.1 Die zwei Ebenen der Versicherungswirtschaft

Das Datenmodell der UWWB muss zwei fundamentale Perspektiven abbilden und miteinander in Bezug setzen:

**Ebene A — Unternehmen und Risiken (Nachfrageseite):**
- Ein **Unternehmen** (Versicherungsnehmer) kann aus mehreren **Tochterunternehmen** bestehen (Konzernstruktur).
- Ein Unternehmen besitzt **Objekte**, die es zu versichern gilt: Maschinen, Fahrzeuge, Gebäude, Mitarbeiter, Veranstaltungen, Dienstleistungen etc.
- Jedem Objekt können ein oder mehrere **Risiken** zugeordnet werden: Diebstahl, Feuer, Beschädigung, Entwertung, Produktionsausfall etc.
- Zu jedem Risiko formuliert das Unternehmen **Deckungswünsche**: gewünschte Versicherungssumme, gewünschte Klauseln/Bedingungen, gewünschter Versicherungszeitraum.

**Ebene B — Versicherer und Versicherungsprodukte (Angebotsseite):**
- **Versicherer** bieten **Versicherungsprodukte** am Markt an.
- Produkte sind in **Sparten** organisiert (Haftpflicht, Cyber, Property, Contingency etc.).
- Ein Produkt bündelt mehrere **Deckungsdefinitionen** inkl. Klauseln, die den möglichen Versicherungsschutz definieren.
- Deckungsdefinitionen legen fest: maximale Versicherungssumme, Selbstbeteiligung, Ausschlüsse, Bedingungswerk (Klauseln).

**Verbindung der Ebenen — Der Ausschreibungs- und Angebotsprozess:**
- Ein **Makler** nimmt die Daten zum Unternehmen, seinen Objekten, Risiken und Deckungswünschen entgegen.
- Der Makler startet eine **Ausschreibung** an einen oder mehrere Versicherer.
- Jeder Versicherer erstellt ein **Angebot** mit konkreten **Deckungsangeboten** je angefragter Deckung.
- Das Deckungsangebot kann vom Deckungswunsch abweichen (niedrigere Summe, zusätzliche Ausschlussklauseln, andere Selbstbeteiligung).
- Bei Annahme entsteht ein **Versicherungsvertrag** (Police) mit den finalen **Vertragsdeckungen**.

### 1.2 Kerngeschäftsprozesse

```
Unternehmen definiert Objekte & Risiken
  → Makler erstellt Ausschreibung mit Deckungswünschen
    → Versicherer erstellt Angebot mit Deckungsangeboten
      → Verhandlung (ggf. Iteration über Deckungsangebote)
        → Vertragsbindung (Police) mit finalen Vertragsdeckungen
          → Laufende Vertragsanpassungen (Nachträge)
          → Schadenregulierung (Teilregulierungen, Teilzahlungen)
```

### 1.3 Schadenmanagement

- Ein **Schaden** ist immer einem **Objekt** zugeordnet.
- Ein Schaden kann mehrere **Deckungen/Verträge** betreffen (wenn das Objekt über mehrere Verträge versichert ist).
- Pro betroffener Deckung wird individuell entschieden, ob und wieviel des Schadens erstattet wird — abhängig von Schadenhöhe, Umständen und Klauseln.
- Die Schadensregulierung erfolgt oft in mehreren **Regulierungsschritten** (Teilregulierungen, Teilzahlungen, Nachreservierungen), besonders bei Großschäden.

### 1.4 Laufende Vertragsanpassungen

Versicherungsverträge müssen regelmäßig angepasst werden:
- Zukauf/Verkauf von Tochterunternehmen
- Neue oder abgehende Maschinen, Gebäude, Fahrzeuge
- Änderungen an der Mitarbeiterstruktur
- Veränderter Schadenverlauf (Schadenquote)

Dies geschieht über **Nachträge** (Endorsements), die Deckungen erweitern, einschränken oder anpassen.

### 1.5 Zentrale Fragestellungen (Analytics)

Das Datenmodell muss folgende Auswertungen ermöglichen:
- Welche Objekte hat ein Unternehmen? Welche Risiken haben diese Objekte?
- Welche Deckungen/Verträge sind den Risiken/Objekten zugeordnet?
- Wie viele Versicherungsprodukte/Versicherer sind an der Risikodeckung beteiligt?
- Risikokonzentration: regional, nach Branche, nach maximaler Schadenshöhe
- Makler-Performance: Wer bringt am meisten Geschäft?
- Deckungslücken: Wo ist ein Unternehmen unterversichert?
- Mehrfachdeckungen: Wo bestehen Überschneidungen über mehrere Verträge?
- Schadenquoten auf verschiedenen Ebenen: Deckung, Objekt, Unternehmen, Sparte, Versicherer

### 1.6 Basis- vs. Zusatzattribute

Das Modell unterscheidet zwei Attributkategorien:

**Basisattribute (fest, immer vorhanden):**
- Eindeutige ID, Bezeichnung, Status, Typ, Zeitstempel
- Strukturelle Referenzen (FK-Beziehungen)

**Flexible Zusatzattribute (kontextabhängig):**
- Objektspezifisch: Ein Fahrzeug hat andere Eigenschaften als eine Produktionshalle
- Deckungsspezifisch: Eine Haftpflichtdeckung braucht andere Felder als eine Cyberdeckung
- Vorgangsspezifisch: Individuelle Zusatzattribute für einzelne Geschäftsvorfälle

Die flexiblen Attribute werden über **Vorlagen (Templates)** standardisiert, die je Objekttyp, Deckungstyp oder Produkttyp definiert werden. Zusätzlich sind individuelle Ad-hoc-Attribute pro Vorgang möglich.

---

## 2. Datenmodell: Klassische Relationale Architektur

### 2.1 Designprinzipien

- Jede fachliche Entität = eigene Tabelle mit festen Basisattributen
- Flexible Zusatzattribute über EAV-Pattern (Entity-Attribute-Value) mit Template-Steuerung
- Referenzielle Integrität über Foreign Keys
- Historisierung über explizite Versionstabellen (SCD Type 2)
- Alle Geldbeträge in EUR mit Dezimalgenauigkeit

### 2.2 Entitätsübersicht

```
                        ┌─────────────────┐
                        │   Unternehmen   │ ◄── Konzernstruktur (self-ref)
                        │   (Company)     │
                        └────────┬────────┘
                                 │ 1:n
                        ┌────────▼────────┐
                        │     Objekt      │ ◄── Objekttyp-Templates
                        │    (Object)     │
                        └────────┬────────┘
                                 │ 1:n
                        ┌────────▼────────┐
                        │     Risiko      │
                        │     (Risk)      │
                        └────────┬────────┘
                                 │ 1:n
              ┌──────────────────┼──────────────────┐
              ▼                  ▼                   ▼
     ┌────────────────┐ ┌───────────────┐  ┌────────────────┐
     │ Deckungswunsch │ │ Deckungsange- │  │ Vertrags-      │
     │ (CoverageReq)  │ │ bot (CovOffer)│  │ deckung        │
     └────────────────┘ └───────────────┘  │ (PolicyCov)    │
              │                  │          └────────────────┘
              │                  │                   │
              ▼                  ▼                   ▼
     ┌────────────────┐ ┌───────────────┐  ┌────────────────┐
     │ Ausschreibung  │ │   Angebot     │  │   Vertrag      │
     │  (Tender)      │ │   (Quote)     │  │   (Policy)     │
     └────────────────┘ └───────────────┘  └────────────────┘

     ┌────────────────┐         ┌───────────────────┐
     │    Schaden     │────────►│ Schadenregulierung │
     │   (Claim)      │  1:n   │ (ClaimSettlement)  │
     └────────────────┘         └───────────────────┘

     ┌────────────────┐  ┌──────────────┐  ┌────────────────┐
     │    Partner     │  │    Sparte    │  │ Versicherungs- │
     │   (Partner)    │  │   (LoB)      │  │ produkt        │
     └────────────────┘  └──────────────┘  │ (Product)      │
                                           └────────────────┘
```

### 2.3 Entitäten im Detail

---

#### 2.3.1 Unternehmen (Company)

Repräsentiert ein versichertes Unternehmen. Unterstützt Konzernstrukturen über Self-Referenz.

**Basisattribute:**
| Attribut | Typ | Beschreibung | Pflicht |
|----------|-----|-------------|---------|
| id | UUID | Primärschlüssel | Ja |
| name | Text | Firmenname | Ja |
| parent_company_id | UUID (FK) | Übergeordnetes Unternehmen (Konzern) | Nein |
| branche | Text | Branche/Industrie (NACE-Code) | Nein |
| land | Text | Sitzland (ISO 3166-1) | Ja |
| region | Text | Region/Bundesland | Nein |
| handelsregister_nr | Text | Handelsregisternummer | Nein |
| gruendungsdatum | Datum | Gründungsdatum | Nein |
| mitarbeiteranzahl | Ganzzahl | Anzahl Mitarbeiter | Nein |
| jahresumsatz | Dezimal (EUR) | Jahresumsatz | Nein |
| status | Enum | Aktiv, Inaktiv, Archiviert | Ja |
| erstellt_am | Zeitstempel | Erstellungszeitpunkt | Ja |
| geaendert_am | Zeitstempel | Letzte Änderung | Ja |

**Beziehungen:**
- Hat viele Tochterunternehmen (self 1:n)
- Hat viele Objekte (1:n)
- Ist Partner in vielen Geschäftsvorgängen (über Partner-Entität)

---

#### 2.3.2 Objekt (Object)

Versicherter Gegenstand eines Unternehmens. Der Objekttyp bestimmt die verfügbaren Zusatzattribute über Templates.

**Basisattribute:**
| Attribut | Typ | Beschreibung | Pflicht |
|----------|-----|-------------|---------|
| id | UUID | Primärschlüssel | Ja |
| unternehmen_id | UUID (FK) | Eigentümer-Unternehmen | Ja |
| bezeichnung | Text | Kurztitel (z.B. "Produktionshalle Werk 3") | Ja |
| objekttyp | Enum/Text | Maschine, Fahrzeug, Gebäude, Mitarbeiter, Veranstaltung etc. | Ja |
| standort_adresse | Text | Physischer Standort | Nein |
| standort_geo | Geokoordinate | Für regionale Risikokonzentrations-Analyse | Nein |
| anschaffungswert | Dezimal (EUR) | Wert bei Anschaffung | Nein |
| aktueller_wert | Dezimal (EUR) | Aktueller Zeitwert | Nein |
| status | Enum | Aktiv, Stillgelegt, Verkauft | Ja |
| erstellt_am | Zeitstempel | Erstellungszeitpunkt | Ja |
| geaendert_am | Zeitstempel | Letzte Änderung | Ja |

**Beziehungen:**
- Gehört zu genau einem Unternehmen (n:1)
- Hat viele Risiken (1:n)
- Hat viele Zusatzattribute (1:n, über ObjektAttribut)
- Wird von Schäden referenziert (1:n)

---

#### 2.3.3 Risiko (Risk)

Kombination aus einem konkreten Gefahrenereignis und dem betroffenen Objekt.

**Basisattribute:**
| Attribut | Typ | Beschreibung | Pflicht |
|----------|-----|-------------|---------|
| id | UUID | Primärschlüssel | Ja |
| objekt_id | UUID (FK) | Betroffenes Objekt | Ja |
| gefahr | Text | Bezeichnung der Gefahr (Feuer, Diebstahl, Ausfall etc.) | Ja |
| gefahr_kategorie | Enum | Sachschaden, Haftpflicht, Betriebsunterbrechung, Cyber etc. | Ja |
| risiko_bewertung | Enum | Niedrig, Mittel, Hoch, Sehr hoch | Nein |
| max_schadenspotential | Dezimal (EUR) | Geschätztes maximales Schadenpotential | Nein |
| beschreibung | Text | Freitextbeschreibung des Risikos | Nein |
| status | Enum | Identifiziert, Bewertet, Gedeckt, Ungedeckt | Ja |
| erstellt_am | Zeitstempel | Erstellungszeitpunkt | Ja |

**Beziehungen:**
- Gehört zu genau einem Objekt (n:1)
- Hat viele Deckungswünsche (1:n)
- Hat viele Deckungsangebote (1:n, über Angebot)
- Hat viele Vertragsdeckungen (1:n, über Vertrag)

---

#### 2.3.4 Klausel (Clause)

Wiederverwendbare Versicherungsbedingung, die in Deckungsdefinitionen, Deckungswünschen und Deckungsangeboten referenziert wird.

**Basisattribute:**
| Attribut | Typ | Beschreibung | Pflicht |
|----------|-----|-------------|---------|
| id | UUID | Primärschlüssel | Ja |
| bezeichnung | Text | Name der Klausel (z.B. "Terrorismusausschluss") | Ja |
| klausel_nr | Text | Offizielle Klauselnummer (z.B. "AVB-P-001") | Nein |
| typ | Enum | Einschluss, Ausschluss, Sublimit, Selbstbeteiligung, Wartezeit | Ja |
| beschreibung | Text | Volltext der Klausel | Ja |
| sparte_id | UUID (FK) | Zugehörige Sparte (falls spartenspezifisch) | Nein |
| gueltig_ab | Datum | Gültigkeit | Nein |
| gueltig_bis | Datum | Gültigkeit | Nein |
| status | Enum | Aktiv, Auslaufend, Inaktiv | Ja |

**Beziehungen:**
- Wird referenziert von Deckungsdefinitionen, Deckungswünschen, Deckungsangeboten, Vertragsdeckungen (jeweils n:m)

---

#### 2.3.5 Sparte (Line of Business)

Versicherungssparte auf höchster Ebene.

**Basisattribute:**
| Attribut | Typ | Beschreibung | Pflicht |
|----------|-----|-------------|---------|
| id | UUID | Primärschlüssel | Ja |
| bezeichnung | Text | Name (Contingency, Property, Liability, Cyber etc.) | Ja |
| beschreibung | Text | Kurzbeschreibung | Nein |
| max_vs_alleinzeichnung | Dezimal (EUR) | Vollmacht: Alleinzeichnung | Nein |
| max_vs_teamleiter | Dezimal (EUR) | Vollmacht: Teamleiter | Nein |
| max_vs_spartenleiter | Dezimal (EUR) | Vollmacht: Spartenleiter | Nein |
| status | Enum | Aktiv, Inaktiv | Ja |

**Beziehungen:**
- Hat viele Versicherungsprodukte (1:n, bei Mehrsparten n:m über Zuordnungstabelle)
- Definiert Zeichnungsregeln und Vollmachten

---

#### 2.3.6 Versicherungsprodukt (Insurance Product)

Konkretes Produkt eines Versicherers innerhalb einer Sparte.

**Basisattribute:**
| Attribut | Typ | Beschreibung | Pflicht |
|----------|-----|-------------|---------|
| id | UUID | Primärschlüssel | Ja |
| versicherer_id | UUID (FK) | Anbietender Versicherer (Partner) | Ja |
| bezeichnung | Text | Produktname | Ja |
| sparte_id | UUID (FK) | Primäre Sparte | Ja |
| erlaubte_objekttypen | JSON/Liste | Welche Objekttypen versicherbar sind | Ja |
| gefahr_katalog | JSON/Liste | Produktspezifisch versicherbare Gefahren | Ja |
| status | Enum | Aktiv, Auslaufend, Inaktiv | Ja |
| gueltig_ab | Datum | Produktverfügbarkeit | Nein |
| gueltig_bis | Datum | Auslaufdatum | Nein |

**Beziehungen:**
- Gehört zu einer/mehreren Sparte(n) (n:1 oder n:m)
- Gehört zu einem Versicherer (n:1)
- Hat viele Deckungsdefinitionen (1:n)
- Wird referenziert von Verträgen (1:n)

---

#### 2.3.7 Deckungsdefinition (Coverage Definition)

Vom Versicherer im Produkt definierter möglicher Versicherungsschutz. Dient als Vorlage für konkrete Deckungsangebote.

**Basisattribute:**
| Attribut | Typ | Beschreibung | Pflicht |
|----------|-----|-------------|---------|
| id | UUID | Primärschlüssel | Ja |
| produkt_id | UUID (FK) | Zugehöriges Versicherungsprodukt | Ja |
| bezeichnung | Text | Name der Deckung (z.B. "Feuer-Volldeckung") | Ja |
| gedeckte_gefahr | Text | Welche Gefahr gedeckt wird | Ja |
| max_versicherungssumme | Dezimal (EUR) | Maximale Versicherungssumme | Nein |
| standard_selbstbeteiligung | Dezimal (EUR) | Standard-SB | Nein |
| beschreibung | Text | Detailbeschreibung | Nein |

**Beziehungen:**
- Gehört zu genau einem Versicherungsprodukt (n:1)
- Hat viele Standard-Klauseln (n:m über DeckungsdefinitionKlausel)
- Dient als Vorlage für Deckungsangebote

---

#### 2.3.8 Deckungswunsch (Coverage Request)

Vom Unternehmen/Makler formulierter gewünschter Versicherungsschutz für ein konkretes Risiko.

**Basisattribute:**
| Attribut | Typ | Beschreibung | Pflicht |
|----------|-----|-------------|---------|
| id | UUID | Primärschlüssel | Ja |
| ausschreibung_id | UUID (FK) | Zugehörige Ausschreibung | Ja |
| risiko_id | UUID (FK) | Betroffenes Risiko | Ja |
| gewuenschte_vs | Dezimal (EUR) | Gewünschte Versicherungssumme | Nein |
| gewuenschte_sb | Dezimal (EUR) | Gewünschte Selbstbeteiligung | Nein |
| zeitraum_beginn | Datum | Gewünschter Deckungsbeginn | Ja |
| zeitraum_ende | Datum | Gewünschtes Deckungsende | Ja |
| bemerkungen | Text | Zusätzliche Wünsche/Anforderungen | Nein |

**Beziehungen:**
- Gehört zu genau einer Ausschreibung (n:1)
- Bezieht sich auf genau ein Risiko (n:1)
- Hat viele gewünschte Klauseln (n:m über DeckungswunschKlausel)
- Wird beantwortet durch Deckungsangebote (1:n)

---

#### 2.3.9 Ausschreibung (Tender)

Makler-Anfrage an Versicherer zur Deckung der Risiken eines Unternehmens.

**Basisattribute:**
| Attribut | Typ | Beschreibung | Pflicht |
|----------|-----|-------------|---------|
| id | UUID | Primärschlüssel | Ja |
| unternehmen_id | UUID (FK) | Versicherungsnehmer | Ja |
| makler_id | UUID (FK) | Vermittelnder Makler (Partner) | Ja |
| bezeichnung | Text | Titel der Ausschreibung | Ja |
| geschaeftsvorfall_typ | Enum | Neugeschäft, Verlängerung, Nachtrag | Ja |
| abgabefrist | Datum | Deadline für Angebote | Nein |
| status | Enum | Entwurf, Versendet, Angebote eingegangen, Vergeben, Abgebrochen | Ja |
| erstellt_am | Zeitstempel | | Ja |

**Beziehungen:**
- Bezieht sich auf ein Unternehmen (n:1)
- Wird von einem Makler erstellt (n:1)
- Enthält viele Deckungswünsche (1:n)
- Wird an viele Versicherer gesendet (n:m über AusschreibungVersicherer)
- Hat viele Angebote als Antwort (1:n)

---

#### 2.3.10 Angebot (Quote)

Antwort eines Versicherers auf eine Ausschreibung.

**Basisattribute:**
| Attribut | Typ | Beschreibung | Pflicht |
|----------|-----|-------------|---------|
| id | UUID | Primärschlüssel | Ja |
| ausschreibung_id | UUID (FK) | Bezug zur Ausschreibung | Ja |
| versicherer_id | UUID (FK) | Anbietender Versicherer (Partner) | Ja |
| produkt_id | UUID (FK) | Angebotsgrundlage (Versicherungsprodukt) | Ja |
| gesamtpraemie | Dezimal (EUR) | Angebotene Gesamtprämie | Nein |
| gueltig_bis | Datum | Angebotsgültigkeit | Nein |
| status | Enum | Entwurf, Versendet, Angenommen, Abgelehnt, Verfallen | Ja |
| erstellt_am | Zeitstempel | | Ja |

**Beziehungen:**
- Bezieht sich auf genau eine Ausschreibung (n:1)
- Stammt von genau einem Versicherer (n:1)
- Referenziert ein Versicherungsprodukt (n:1)
- Enthält viele Deckungsangebote (1:n)
- Kann zu einem Vertrag führen (1:0..1)

---

#### 2.3.11 Deckungsangebot (Coverage Offer)

Konkretes Deckungsangebot eines Versicherers als Antwort auf einen Deckungswunsch. Kann vom Wunsch abweichen.

**Basisattribute:**
| Attribut | Typ | Beschreibung | Pflicht |
|----------|-----|-------------|---------|
| id | UUID | Primärschlüssel | Ja |
| angebot_id | UUID (FK) | Zugehöriges Angebot | Ja |
| deckungswunsch_id | UUID (FK) | Beantworteter Deckungswunsch | Ja |
| deckungsdefinition_id | UUID (FK) | Basis-Deckungsdefinition aus Produkt | Nein |
| angebotene_vs | Dezimal (EUR) | Angebotene Versicherungssumme | Ja |
| angebotene_sb | Dezimal (EUR) | Angebotene Selbstbeteiligung | Nein |
| praemie | Dezimal (EUR) | Prämie für diese Deckungsposition | Ja |
| zeitraum_beginn | Datum | Angebotener Deckungsbeginn | Ja |
| zeitraum_ende | Datum | Angebotenes Deckungsende | Ja |
| abweichung_bemerkung | Text | Erläuterung bei Abweichung vom Wunsch | Nein |
| status | Enum | Angeboten, Nachverhandlung, Akzeptiert, Abgelehnt | Ja |

**Beziehungen:**
- Gehört zu genau einem Angebot (n:1)
- Bezieht sich auf genau einen Deckungswunsch (n:1)
- Referenziert optional eine Deckungsdefinition (n:1)
- Hat viele angebotene Klauseln (n:m über DeckungsangebotKlausel)
- Wird bei Vertragsbindung in eine Vertragsdeckung überführt

---

#### 2.3.12 Vertrag (Policy)

Gebundene Versicherungspolice nach Angebotsannahme.

**Basisattribute:**
| Attribut | Typ | Beschreibung | Pflicht |
|----------|-----|-------------|---------|
| id | UUID | Primärschlüssel | Ja |
| policennummer | Text | Offizielle Policennummer | Ja |
| angebot_id | UUID (FK) | Zugrundeliegendes Angebot | Ja |
| unternehmen_id | UUID (FK) | Versicherungsnehmer | Ja |
| versicherer_id | UUID (FK) | Versicherer | Ja |
| makler_id | UUID (FK) | Vermittelnder Makler | Nein |
| produkt_id | UUID (FK) | Versicherungsprodukt | Ja |
| jahrespreaemie | Dezimal (EUR) | Jahresprämie | Ja |
| vertragsbeginn | Datum | | Ja |
| vertragsende | Datum | | Ja |
| kuendigungsfrist | Text | Kündigungsfrist | Nein |
| status | Enum | Aktiv, Ruhend, Gekündigt, Abgelaufen | Ja |
| version | Ganzzahl | Aktuelle Vertragsversion (erhöht durch Nachträge) | Ja |
| erstellt_am | Zeitstempel | | Ja |

**Beziehungen:**
- Entsteht aus genau einem Angebot (1:1)
- Bezieht sich auf ein Unternehmen, einen Versicherer, einen Makler
- Referenziert ein Versicherungsprodukt (n:1)
- Hat viele Vertragsdeckungen (1:n)
- Hat viele Nachträge (1:n)
- Hat viele Schäden (1:n)

---

#### 2.3.13 Vertragsdeckung (Policy Coverage)

Finale, vertraglich gebundene Deckungsposition.

**Basisattribute:**
| Attribut | Typ | Beschreibung | Pflicht |
|----------|-----|-------------|---------|
| id | UUID | Primärschlüssel | Ja |
| vertrag_id | UUID (FK) | Zugehöriger Vertrag | Ja |
| risiko_id | UUID (FK) | Gedecktes Risiko | Ja |
| deckungsangebot_id | UUID (FK) | Ursprüngliches Deckungsangebot | Nein |
| versicherungssumme | Dezimal (EUR) | Vertraglich vereinbarte VS | Ja |
| selbstbeteiligung | Dezimal (EUR) | Vereinbarte SB | Nein |
| praemie | Dezimal (EUR) | Prämie für diese Deckungsposition | Ja |
| zeitraum_beginn | Datum | Deckungsbeginn | Ja |
| zeitraum_ende | Datum | Deckungsende | Ja |
| status | Enum | Aktiv, Angepasst (durch Nachtrag), Beendet | Ja |
| version | Ganzzahl | Version (erhöht durch Nachträge) | Ja |

**Beziehungen:**
- Gehört zu genau einem Vertrag (n:1)
- Bezieht sich auf genau ein Risiko (n:1)
- Hat viele Klauseln (n:m über VertragsdeckungKlausel)
- Kann durch Nachträge versioniert werden
- Wird von Schadenregulierungen referenziert (1:n)

---

#### 2.3.14 Nachtrag (Endorsement)

Änderung an einem bestehenden Vertrag.

**Basisattribute:**
| Attribut | Typ | Beschreibung | Pflicht |
|----------|-----|-------------|---------|
| id | UUID | Primärschlüssel | Ja |
| vertrag_id | UUID (FK) | Betroffener Vertrag | Ja |
| nachtragsnummer | Ganzzahl | Laufende Nummer | Ja |
| typ | Enum | Deckungserweiterung, Deckungseinschränkung, Prämienanpassung, Objektänderung, Sonstige | Ja |
| wirksamkeitsdatum | Datum | Ab wann gültig | Ja |
| praemienanpassung | Dezimal (EUR) | Prämienänderung (+/-) | Nein |
| begruendung | Text | Anlass der Änderung | Nein |
| status | Enum | Entwurf, Genehmigt, Aktiv, Storniert | Ja |
| erstellt_am | Zeitstempel | | Ja |

**Beziehungen:**
- Gehört zu genau einem Vertrag (n:1)
- Ändert eine oder mehrere Vertragsdeckungen (1:n über NachtragDeckung)
- Kann durch eine Submission ausgelöst werden (n:0..1)

---

#### 2.3.15 Schaden (Claim)

Schadenfall an einem versicherten Objekt.

**Basisattribute:**
| Attribut | Typ | Beschreibung | Pflicht |
|----------|-----|-------------|---------|
| id | UUID | Primärschlüssel | Ja |
| schadennummer | Text | Offizielle Schadennummer | Ja |
| objekt_id | UUID (FK) | Betroffenes Objekt | Ja |
| schadendatum | Datum | Datum des Schadenereignisses | Ja |
| meldedatum | Datum | Datum der Schadenmeldung | Ja |
| schadenursache | Text | Beschreibung der Ursache | Ja |
| geschaetzte_schadenhoehe | Dezimal (EUR) | Erste Schätzung | Nein |
| endgueltige_schadenhoehe | Dezimal (EUR) | Finale Schadenhöhe | Nein |
| reserve | Dezimal (EUR) | Aktuelle Reservehöhe | Nein |
| status | Enum | Gemeldet, In Prüfung, Teilreguliert, Reguliert, Abgelehnt, Geschlossen | Ja |
| beschreibung | Text | Freitextbeschreibung | Nein |
| erstellt_am | Zeitstempel | | Ja |
| geaendert_am | Zeitstempel | | Ja |

**Beziehungen:**
- Bezieht sich auf genau ein Objekt (n:1)
- Betrifft eine oder mehrere Vertragsdeckungen (1:n, über Schadenregulierung)

---

#### 2.3.16 Schadenregulierung (Claim Settlement)

Regulierung eines Schadens gegen eine konkrete Vertragsdeckung. Ermöglicht Teilregulierungen und Teilzahlungen.

**Basisattribute:**
| Attribut | Typ | Beschreibung | Pflicht |
|----------|-----|-------------|---------|
| id | UUID | Primärschlüssel | Ja |
| schaden_id | UUID (FK) | Zugehöriger Schaden | Ja |
| vertragsdeckung_id | UUID (FK) | Betroffene Vertragsdeckung | Ja |
| regulierungsschritt | Ganzzahl | Laufende Nummer (1, 2, 3...) | Ja |
| regulierungsbetrag | Dezimal (EUR) | Betrag dieser Regulierung | Ja |
| regulierungstyp | Enum | Teilzahlung, Schlussregulierung, Nachregulierung, Ablehnung | Ja |
| begruendung | Text | Begründung (insb. bei Ablehnung/Kürzung) | Nein |
| klausel_bezug | Text | Welche Klausel greift (bei Einschränkung/Ablehnung) | Nein |
| regulierungsdatum | Datum | | Ja |
| status | Enum | Berechnet, Genehmigt, Ausgezahlt, Storniert | Ja |

**Beziehungen:**
- Gehört zu genau einem Schaden (n:1)
- Bezieht sich auf genau eine Vertragsdeckung (n:1)

---

#### 2.3.17 Partner

Universelle Entität für alle beteiligten Parteien (Unternehmen, Makler, Versicherer, Geschädigte, Regulierer etc.). Die Rolle wird kontextabhängig auf der Verknüpfung gespeichert.

**Basisattribute:**
| Attribut | Typ | Beschreibung | Pflicht |
|----------|-----|-------------|---------|
| id | UUID | Primärschlüssel | Ja |
| name | Text | Firmen- oder Personenname | Ja |
| partner_typ | Enum | Unternehmen, Person, Organisation | Ja |
| adresse | Strukturiert | Straße, PLZ, Ort, Land | Nein |
| handelsregister_nr | Text | Offizielle Registrierung | Nein |
| lei_code | Text | Legal Entity Identifier | Nein |
| verifizierungsstatus | Enum | Verifiziert, Nicht verifiziert | Ja |
| akkreditierungsstatus | Enum | Akkreditiert, Nicht akkreditiert, N/A | Nein |
| hit_ratio | Dezimal | Historische Abschlussquote (nur Makler) | Nein |
| status | Enum | Aktiv, Inaktiv | Ja |

**Beziehungen:**
- Wird in Geschäftsvorgängen über kontextspezifische Verknüpfungstabellen referenziert (n:m)
- Partner-Rollen: Versicherungsnehmer, Makler, Versicherer, Mitversicherer, Geschädigter, Regulierer

---

#### 2.3.18 Flexible Zusatzattribute (EAV-Pattern)

Für die spartenübergreifende Flexibilität:

**AttributTemplate:**
| Attribut | Typ | Beschreibung |
|----------|-----|-------------|
| id | UUID | Primärschlüssel |
| entitaetstyp | Enum | Objekt, Risiko, Deckung, Vertrag |
| kontexttyp | Text | z.B. "Fahrzeug", "Gebäude", "Cyber-Deckung" |
| attribut_name | Text | Technischer Name |
| attribut_label | Text | Anzeigebezeichnung |
| datentyp | Enum | Text, Zahl, Datum, Waehrung, Boolean, Auswahl |
| pflicht | Boolean | Pflichtfeld |
| auswahl_optionen | JSON | Bei Typ "Auswahl": mögliche Werte |
| reihenfolge | Ganzzahl | Anzeigereihenfolge |

**AttributWert:**
| Attribut | Typ | Beschreibung |
|----------|-----|-------------|
| id | UUID | Primärschlüssel |
| template_id | UUID (FK) | Referenz auf Template |
| entitaet_id | UUID | ID der zugehörigen Entität (Objekt, Risiko etc.) |
| wert_text | Text | Wert (als Text gespeichert) |
| wert_zahl | Dezimal | Wert (als Zahl) |
| wert_datum | Datum | Wert (als Datum) |
| ki_generiert | Boolean | Ob KI-extrahiert |
| ki_konfidenz | Ganzzahl (1-6) | Qualitätsnote |
| quell_dokument_id | UUID (FK) | Herkunftsdokument |

---

### 2.4 Intake-Prozess-Entitäten (aus bestehendem Modell v1)

Die bereits modellierten Intake-Entitäten bleiben erhalten und werden in das erweiterte Modell integriert:

- **Submission**: Wird zur initialen Erfassung der Risikoinformationen genutzt und ist der Startpunkt des Ausschreibungs-/Angebotsprozesses.
- **Dokument**: Hochgeladene Dateien zur Submission.
- **Extraktionsrunde**: Job-Record der KI-Extraktion.
- **Bewertungsergebnis**: 5-dimensionaler Score.
- **Manuelle Priorisierung**: Override durch UW Manager.
- **Freigabe**: Formale Entscheidung am Ende des Review.
- **Protokolleintrag**: Audit Trail (unveränderlich).

**Verbindung zum erweiterten Modell:**
- Submission → erzeugt/aktualisiert Objekte und Risiken im Unternehmensmodell
- Submission → gehört zu einer Ausschreibung (n:1)
- Submission → kann zu einem Angebot führen (1:0..1)
- Aus validierter Submission entsteht die Datengrundlage für Deckungswünsche

### 2.5 ER-Diagramm (vereinfacht)

```
Unternehmen ──1:n──► Objekt ──1:n──► Risiko
     │                   │                │
     │ (Konzern:         │ (Schaden)      ├──1:n──► Deckungswunsch ──n:1──► Ausschreibung
     │  self-ref)        │                │                                      │
     │                   ▼                ├──1:n──► Deckungsangebot ──n:1──► Angebot
     │               Schaden              │                                      │
     │                   │                └──1:n──► Vertragsdeckung ──n:1──► Vertrag
     │                   │                                │                      │
     │                   └─────► Schadenregulierung ◄─────┘                      │
     │                                                                    1:n    │
     │                                                                  Nachtrag─┘
     │
     └──Partner (Makler, VN, Versicherer) über Rollen-Verknüpfungen

Sparte ──1:n──► Versicherungsprodukt ──1:n──► Deckungsdefinition ──n:m──► Klausel
```
