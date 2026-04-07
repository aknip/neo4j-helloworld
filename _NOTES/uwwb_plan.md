# Plan: UWWB Neo4j Demo-Datenbank

## Context
Aufbau einer Neo4j-Graphdatenbank basierend auf dem UWWB-Domänenmodell (`_NOTES/uwwb-domain-model.md`) mit realistischen Testdaten eines Industrieversicherers (D&O, Cyber, Marine/Transport) und mittelständischen Kunden.

## Ansatz
Ein einzelnes Python-Script `setup_uwwb.py` (analog zu `demo_crm.py`), das alle Entitäten und Beziehungen erstellt.

## Datenbank
- Neo4j Community Edition unterstützt keine benutzerdefinierten Datenbanken (nur `neo4j`). Das Script nutzt die Standard-DB `neo4j` und löscht zunächst alle bestehenden Daten.

## Neo4j Node Labels & Relationships

### Nodes (Entitäten aus Domänenmodell)
| Label | Anzahl | Beschreibung |
|-------|--------|-------------|
| `Partner` | ~5 | Versicherer (1), Makler (2), Rückversicherer (2) |
| `Sparte` | 3 | D&O, Cyber, Marine (Transport) |
| `Produkt` | 3-6 | 1-2 Produkte pro Sparte |
| `Deckungsdefinition` | ~12-18 | 2-3 pro Produkt |
| `Klausel` | ~15-20 | Spartenspezifische Klauseln |
| `Unternehmen` | 5 | Mittelständische Industriekunden |
| `Objekt` | 3-6 pro Unternehmen | Maschinen, IT-Systeme, Schiffe, Geschäftsführer etc. |
| `Risiko` | 1-3 pro Objekt | Gefahren je Objekttyp |
| `Ausschreibung` | 1-3 pro Unternehmen | Über 3-10 Jahre verteilt |
| `Deckungswunsch` | 1-3 pro Ausschreibung | Je angefragtes Risiko |
| `Angebot` | 1-2 pro Ausschreibung | Versicherer-Antworten |
| `Deckungsangebot` | 1 pro Deckungswunsch/Angebot | Konkrete Angebote |
| `Vertrag` | 1 pro angenommenem Angebot | Policen |
| `Vertragsdeckung` | 1 pro Deckungsangebot→Vertrag | Finale Deckungen |
| `Nachtrag` | 0-2 pro Vertrag | Endorsements |
| `Schaden` | 0-3 pro Unternehmen | Schadenfälle |
| `Schadenregulierung` | 1-3 pro Schaden | Teilregulierungen |

### Relationships
```
(:Unternehmen)-[:HAT_TOCHTER]->(:Unternehmen)         — Konzernstruktur (self-ref)
(:Unternehmen)-[:BESITZT]->(:Objekt)                   — Unternehmen besitzt Objekte
(:Objekt)-[:HAT_RISIKO]->(:Risiko)                     — Objekt hat Risiken

(:Ausschreibung)-[:FUER_UNTERNEHMEN]->(:Unternehmen)   — Ausschreibung für VN
(:Ausschreibung)-[:ERSTELLT_VON]->(:Partner)            — Makler erstellt Ausschreibung
(:Ausschreibung)-[:AN_VERSICHERER]->(:Partner)          — Ausschreibung an Versicherer (n:m)

(:Deckungswunsch)-[:GEHOERT_ZU]->(:Ausschreibung)      — Teil einer Ausschreibung
(:Deckungswunsch)-[:FUER_RISIKO]->(:Risiko)             — Wunsch bezieht sich auf Risiko
(:Deckungswunsch)-[:HAT_KLAUSEL]->(:Klausel)            — Gewünschte Klauseln

(:Angebot)-[:AUF_AUSSCHREIBUNG]->(:Ausschreibung)      — Antwort auf Ausschreibung
(:Angebot)-[:VON_VERSICHERER]->(:Partner)               — Versicherer gibt Angebot ab
(:Angebot)-[:MIT_PRODUKT]->(:Produkt)                   — Basiert auf Produkt

(:Deckungsangebot)-[:GEHOERT_ZU]->(:Angebot)            — Teil eines Angebots
(:Deckungsangebot)-[:BEANTWORTET]->(:Deckungswunsch)     — Antwort auf Deckungswunsch
(:Deckungsangebot)-[:BASIERT_AUF]->(:Deckungsdefinition) — Produktdeckung als Basis
(:Deckungsangebot)-[:HAT_KLAUSEL]->(:Klausel)           — Angebotene Klauseln

(:Vertrag)-[:AUS_ANGEBOT]->(:Angebot)                  — Entsteht aus Angebot
(:Vertrag)-[:FUER_UNTERNEHMEN]->(:Unternehmen)          — VN
(:Vertrag)-[:MIT_VERSICHERER]->(:Partner)               — Versicherer
(:Vertrag)-[:UEBER_MAKLER]->(:Partner)                  — Vermittelnder Makler
(:Vertrag)-[:MIT_PRODUKT]->(:Produkt)                   — Versicherungsprodukt

(:Vertragsdeckung)-[:GEHOERT_ZU]->(:Vertrag)            — Teil eines Vertrags
(:Vertragsdeckung)-[:DECKT_RISIKO]->(:Risiko)           — Gedecktes Risiko
(:Vertragsdeckung)-[:AUS_DECKUNGSANGEBOT]->(:Deckungsangebot) — Ursprung
(:Vertragsdeckung)-[:HAT_KLAUSEL]->(:Klausel)           — Vertragsklauseln

(:Nachtrag)-[:ZU_VERTRAG]->(:Vertrag)                  — Ändert Vertrag
(:Nachtrag)-[:AENDERT_DECKUNG]->(:Vertragsdeckung)      — Betroffene Deckung

(:Schaden)-[:AN_OBJEKT]->(:Objekt)                     — Betroffenes Objekt
(:Schadenregulierung)-[:ZU_SCHADEN]->(:Schaden)          — Gehört zu Schaden
(:Schadenregulierung)-[:GEGEN_DECKUNG]->(:Vertragsdeckung) — Reguliert gegen Deckung

(:Produkt)-[:IN_SPARTE]->(:Sparte)                     — Sparte des Produkts
(:Produkt)-[:VON_VERSICHERER]->(:Partner)               — Anbieter
(:Deckungsdefinition)-[:GEHOERT_ZU]->(:Produkt)         — Teil eines Produkts
(:Deckungsdefinition)-[:HAT_KLAUSEL]->(:Klausel)        — Standard-Klauseln
(:Klausel)-[:FUER_SPARTE]->(:Sparte)                   — Spartenspezifisch
```

## Testdaten-Szenario

### Zeitraum
2018–2026 (8 Jahre Geschäftshistorie)

### Versicherer (Partner)
| Name | Typ | Standort |
|------|-----|----------|
| Hanseatische Industrieversicherung AG | Versicherer | Hamburg |
| Aon Risk Solutions Deutschland | Makler | Frankfurt |
| Marsh GmbH | Makler | München |
| Swiss Re Europe | Rückversicherer | Zürich |
| Munich Re | Rückversicherer | München |

### Sparten & Produkte
| Sparte | Produkt | Beschreibung |
|--------|---------|-------------|
| D&O (Directors & Officers) | D&O Executive Shield | Premium D&O für Vorstände und GF |
| D&O | D&O Company Protect | Unternehmens-D&O inkl. Organe |
| Cyber | Cyber Complete | Vollumfängliche Cyberversicherung |
| Cyber | Cyber Basic | Basis-Cyberschutz für KMU |
| Marine (Transport) | Marine Cargo All Risk | Warentransportversicherung |
| Marine | Marine Hull | Kaskoversicherung Schiffe |

### Deckungsdefinitionen (pro Produkt 2-3)
**D&O Executive Shield:**
- Persönliche Haftung Geschäftsführer (max VS 10 Mio, SB 25.000)
- Abwehrkostendeckung (max VS 5 Mio, SB 10.000)
- Strafrechtsschutz (max VS 2 Mio, SB 5.000)

**D&O Company Protect:**
- Organhaftung Gesamtunternehmen (max VS 15 Mio, SB 50.000)
- Vertrauensschaden (max VS 5 Mio, SB 25.000)

**Cyber Complete:**
- Eigenschaden Betriebsunterbrechung (max VS 5 Mio, SB 10.000)
- Drittschaden Datenschutzverletzung (max VS 10 Mio, SB 25.000)
- Krisenmanagement & Forensik (max VS 2 Mio, SB 5.000)

**Cyber Basic:**
- Basis-Cyber-Eigenschaden (max VS 2 Mio, SB 25.000)
- Basis-Drittschaden (max VS 3 Mio, SB 15.000)

**Marine Cargo All Risk:**
- Ladungsschaden Transport (max VS 20 Mio, SB 50.000)
- Verzögerungsschaden (max VS 5 Mio, SB 25.000)
- Lagerrisiko (max VS 10 Mio, SB 25.000)

**Marine Hull:**
- Kaskoschaden Seeschiff (max VS 50 Mio, SB 100.000)
- Maschinenbruch Schiff (max VS 10 Mio, SB 50.000)

### Klauseln (~18 Stück)
| Klausel | Typ | Sparte |
|---------|-----|--------|
| Terrorismusausschluss (AVB-G-001) | Ausschluss | Alle |
| Krieg- und Sanktionsausschluss (AVB-G-002) | Ausschluss | Alle |
| Vorsatzausschluss (AVB-DO-001) | Ausschluss | D&O |
| Vorwärtsdeckung (AVB-DO-002) | Einschluss | D&O |
| Nachmeldefrist 36 Monate (AVB-DO-003) | Einschluss | D&O |
| Sublimit Strafrecht 500.000 EUR (AVB-DO-004) | Sublimit | D&O |
| Ransomware-Einschluss (AVB-CY-001) | Einschluss | Cyber |
| Social-Engineering-Deckung (AVB-CY-002) | Einschluss | Cyber |
| Betriebsunterbrechungs-Wartezeit 12h (AVB-CY-003) | Wartezeit | Cyber |
| Altdaten-Ausschluss (AVB-CY-004) | Ausschluss | Cyber |
| Selbstbeteiligung staffelbar (AVB-CY-005) | Selbstbeteiligung | Cyber |
| Institute Cargo Clauses (A) (ICC-A) | Einschluss | Marine |
| Institute Cargo Clauses (C) (ICC-C) | Einschluss | Marine |
| Kühlgut-Klausel (AVB-MA-001) | Einschluss | Marine |
| Schwergut-Zuschlag (AVB-MA-002) | Einschluss | Marine |
| Piraterie-Ausschluss (AVB-MA-003) | Ausschluss | Marine |
| Klassifikationsklausel (AVB-MA-004) | Einschluss | Marine |
| Maschinenbruch-Sublimit (AVB-MA-005) | Sublimit | Marine |

### 5 Kunden (mittelständisch)
| # | Unternehmen | Branche | Standort | MA | Umsatz (Mio EUR) | Sparten |
|---|-------------|---------|----------|-----|-------------------|---------|
| 1 | Müller Maschinenbau GmbH | Maschinenbau (C28) | Augsburg | 450 | 85 | D&O, Cyber |
| 2 | NordLog Shipping GmbH | Logistik/Schifffahrt (H50) | Hamburg | 280 | 120 | D&O, Marine |
| 3 | CyberShield IT Services AG | IT-Dienstleistung (J62) | München | 180 | 35 | D&O, Cyber |
| 4 | Rhein-Pharma GmbH | Pharma (C21) | Köln | 620 | 210 | D&O, Cyber, Marine |
| 5 | BauWert Projektentwicklung AG | Bau/Immobilien (F41) | Frankfurt | 340 | 95 | D&O, Cyber |

### Objekte pro Unternehmen

**Müller Maschinenbau GmbH:**
- Geschäftsführung (Objekttyp: Organ) → Risiken: Pflichtverletzung, Vermögensschaden Dritter
- CNC-Fertigungszentrum Werk 1 (Maschine) → Risiken: Maschinenbruch, Betriebsunterbrechung
- ERP-System SAP S/4HANA (IT-System) → Risiken: Cyberangriff, Datenverlust
- Firmennetzwerk & Cloud (IT-System) → Risiken: Ransomware, Betriebsunterbrechung IT

**NordLog Shipping GmbH:**
- Geschäftsführung (Organ) → Risiken: Pflichtverletzung, Vermögensschaden Dritter
- MS NordStar (Containerschiff) → Risiken: Kaskoschaden, Maschinenbruch
- MS HansaExpress (Stückgutfrachter) → Risiken: Kaskoschaden, Kollision
- Warentransport Asien-Europa (Transport) → Risiken: Ladungsschaden, Verzögerung
- Warentransport Nordsee/Ostsee (Transport) → Risiken: Ladungsschaden, Wetterschaden

**CyberShield IT Services AG:**
- Geschäftsführung (Organ) → Risiken: Pflichtverletzung, Vermögensschaden Dritter
- Rechenzentrum München (IT-System) → Risiken: Cyberangriff, Datenverlust, Betriebsunterbrechung
- Kundendaten-Plattform (IT-System) → Risiken: Datenschutzverletzung, Ransomware
- Cloud-Infrastruktur AWS (IT-System) → Risiken: Systemausfall, Datenverlust

**Rhein-Pharma GmbH:**
- Vorstand & Aufsichtsrat (Organ) → Risiken: Pflichtverletzung, Compliance-Verstoß, Produkthaftung
- Pharma-ERP-System (IT-System) → Risiken: Cyberangriff, Datenverlust
- Forschungsdaten-Server (IT-System) → Risiken: Datendiebstahl, Ransomware
- Rohstofftransport Übersee (Transport) → Risiken: Ladungsschaden, Verzögerung
- Medikamententransport Europa (Transport) → Risiken: Kühlkettenbruch, Ladungsschaden

**BauWert Projektentwicklung AG:**
- Geschäftsführung (Organ) → Risiken: Pflichtverletzung, Vermögensschaden Dritter
- Projektmanagement-IT (IT-System) → Risiken: Cyberangriff, Datenverlust
- Baustellendokumentation Cloud (IT-System) → Risiken: Datenverlust, Systemausfall

### Geschäftsprozess-Zeitlinie (pro Kunde)

Jeder Kunde durchläuft 2-3 Zyklen über die Jahre:

**Beispiel Müller Maschinenbau:**
- 2019: Ausschreibung D&O + Cyber (Makler: Aon) → Angebot → Vertrag POL-2019-MM-001 (D&O), POL-2019-MM-002 (Cyber)
- 2021: Nachtrag auf Cyber (Erweiterung Ransomware-Deckung nach Branchenwarnungen)
- 2022: Verlängerungs-Ausschreibung → neue Verträge POL-2022-MM-003, POL-2022-MM-004
- 2023: Schaden (Ransomware-Angriff auf ERP) → Regulierung in 3 Schritten

**Beispiel NordLog Shipping:**
- 2018: Ausschreibung Marine + D&O (Makler: Marsh) → Verträge
- 2020: Schaden (Ladungsschaden Containerumschlag Asien) → Regulierung
- 2021: Ausschreibung Marine Renewal → neue Verträge
- 2023: Schaden (Kollision MS HansaExpress in Ostsee) → Teilregulierungen
- 2024: Nachtrag Marine Hull (Prämienanpassung wegen Schadenverlauf)

*Ähnliche Zyklen für die anderen 3 Kunden, verteilt über 2018-2026.*

### Schäden & Regulierungen (Detail)

| # | Unternehmen | Schaden | Datum | Geschätzte Höhe | Deckung | Regulierung |
|---|-------------|---------|-------|-----------------|---------|-------------|
| 1 | Müller Maschinenbau | Ransomware-Angriff auf ERP-System | 2023-03-15 | 850.000 EUR | Cyber Complete | 3 Schritte: Sofortmaßnahmen 150k, Forensik 280k, Schluss 320k |
| 2 | NordLog Shipping | Ladungsschaden Container Asien | 2020-07-22 | 1.200.000 EUR | Marine Cargo | 2 Schritte: Teilzahlung 500k, Schluss 620k |
| 3 | NordLog Shipping | Kollision MS HansaExpress Ostsee | 2023-11-08 | 3.500.000 EUR | Marine Hull | 3 Schritte: Sofort 800k, Reparatur 1.5M, Schluss 950k |
| 4 | CyberShield IT | Datenschutzverletzung Kundenplattform | 2022-09-03 | 450.000 EUR | Cyber Complete | 2 Schritte: Krisenmanagement 120k, Schluss 280k |
| 5 | Rhein-Pharma | Compliance-Verstoß Vorstand | 2024-01-20 | 2.000.000 EUR | D&O Executive Shield | 2 Schritte: Abwehrkosten 600k, Schluss 1.1M |
| 6 | Rhein-Pharma | Kühlkettenbruch Medikamententransport | 2023-06-10 | 780.000 EUR | Marine Cargo | 1 Schritt: Schlussregulierung 680k |
| 7 | BauWert | D&O-Claim Pflichtverletzung GF | 2025-03-01 | 1.500.000 EUR | D&O Company Protect | Status: In Prüfung (noch offen) |
| 8 | Müller Maschinenbau | Datenpanne Kundendaten | 2024-08-12 | 320.000 EUR | Cyber Complete | 1 Schritt: Schlussregulierung 290k |

## Script-Struktur (`setup_uwwb.py`)

```python
# Aufbau:
# 1. Verbindung & DB-Bereinigung (MATCH (n) DETACH DELETE n)
# 2. Constraints erstellen (Uniqueness auf id-Properties pro Label)
# 3. create_stammdaten(): Partner, Sparten, Produkte, Deckungsdefinitionen, Klauseln
#    - Alle mit UUID-artiger id (z.B. "PART-001", "SP-001" etc.)
#    - Klauseln mit Sparten verknüpfen
#    - Deckungsdefinitionen mit Klauseln verknüpfen
# 4. create_unternehmen(): 5 Unternehmen mit Objekten und Risiken
#    - Konzernstruktur: Rhein-Pharma hat Tochter "Rhein-Pharma Logistics GmbH"
# 5. create_geschaeftsprozesse(): Pro Kunde mehrere Zyklen
#    - Ausschreibung → Deckungswünsche → Angebot → Deckungsangebote
#    - Bei Status "Angenommen" → Vertrag → Vertragsdeckungen
# 6. create_nachtraege(): Ausgewählte Vertragsänderungen
# 7. create_schaeden(): 8 Schadenfälle mit Regulierungsschritten
# 8. print_summary(): Knoten/Kanten-Statistik
```

## Dateien
- **Neu:** `setup_uwwb.py` — Hauptscript
- **Unverändert:** `demo_crm.py`

## Verifikation
1. `python setup_uwwb.py` ausführen — muss fehlerfrei durchlaufen
2. Script gibt Summary mit Knotenanzahl pro Label und Beziehungsanzahl pro Typ aus
3. In Neo4j Browser manuell prüfen:
   - `MATCH (n) RETURN labels(n)[0] AS label, count(n) ORDER BY label`
   - `MATCH ()-[r]->() RETURN type(r) AS rel, count(r) ORDER BY rel`
   - `MATCH path=(u:Unternehmen)-[:BESITZT]->(o:Objekt)-[:HAT_RISIKO]->(r:Risiko)<-[:DECKT_RISIKO]-(vd:Vertragsdeckung)-[:GEHOERT_ZU]->(v:Vertrag) RETURN path LIMIT 10` — End-to-End-Pfad
