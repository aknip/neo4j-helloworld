
# DB Setup für erste Demo

Eine Neo4J Datenbank "myfirstdb" läuft lokal auf meinem Mac: 
neo4j://127.0.0.1:7687
User: neo4j
Password: neo4jneo4j

Erstelle ein Python Script, das sich mit der Datenbank verbindet und ein Demo-CRM aufbaut:
- Personen
- Firmen
Personen können Mitarbeiter von Firmen sein, Personen können Kunden von Firmen sein, Firmen können Kunden von Firmen sein
Erstelle 10 Testdatensätze.


## GUI

Basierend auf dem Demo-CRM (demo_crm.py), erstelle eine GUI mit Streamlit, die die Datenbank abfragt und anzeigt:
- Liste aller Personen
- Liste aller Firmen
- Liste aller Mitarbeiter einer Firma
- Liste aller Kunden einer Firma
- Liste aller Kunden einer Person
- Alle Listen bieten Optionen zum Hinzufügen, Löschen und Bearbeiten von Einträgen



==========================================================================================




# UWWB DB

Eine Neo4J Datenbank läuft lokal auf meinem Mac: 
neo4j://127.0.0.1:7687
User: neo4j
Password: neo4jneo4j

Erstelle ein Python Script, das sich mit der Datenbank verbindet und auf Basis des Domänenmodells "_NOTES/domain-model.md" eine Datenbank "UWWB" aufbaut.
Erstelle Testdatensätze für einen Industrieversicherer, der in D&O, Cyber und Marine (Transport) versichert und mittelständische Unternehmen als Kunden hat. Von jeder Entität sollen 3-10 Testdatensätze pro Entität erstellt werden, also z. B. für jeden Kunden 3-10 Angebot, für jeden Vertrag 3-10 Schadenfälle (pro Kunde) etc. So soll ein realisitische Demo-Szenario entstehen, dass der Industrieversicherer über den Zeitraum von 3-10 Jahren mit 3-10 Kunden aufgebaut hat.










# Ontologie für eine Underwriting Workbenchench (UWWB)

Einsatz: Software für einen Industrieversicherer, Industrieversicherungsmakler oder Assekuradeur. Primäre für Underwriter.
In der Software sollen alle versicherungsfachlichen Prozesse (Verwaltung von Kundendaten, Angebotsdaten, Vertragsdaten, Schadendaten, Abrechnungsdaten etc.) und Risikodaten der Kunden (Daten zu Unternehmen und Unternehmensstruktur, Gebäuden, Maschinen, Mitarbeitern, Projekten, Finanzkennzahlen etc.) verwaltet werden.
Der Underwriter soll sowohl seine Arbeitsvorgänge (operative Arbeit) damit bearbeiten können als auch die Risikodaten analysieren und beurteilen können.


## 1. Fachlicher Hintergrund, Geschäftsprozesse und Anforderungen

### 1.1 Die zwei Ebenen der Versicherungswirtschaft

Es müssen zwei fundamentale Perspektiven abgebildet und miteinander in Bezug gesetzt werden:

**Ebene A — Unternehmen und Risiken (Nachfrageseite):**
- Ein **Unternehmen** (Versicherungsnehmer) kann aus mehreren **Tochterunternehmen** bestehen (Konzernstruktur).
- Ein Unternehmen besitzt **Objekte**, die es zu versichern gilt: Maschinen, Fahrzeuge, Gebäude, Mitarbeiter, Veranstaltungen, Projekte, Dienstleistungen etc.
- Jedem Objekt können ein oder mehrere **Risiken** zugeordnet werden: Diebstahl, Feuer, Beschädigung, Entwertung, Produktionsausfall, Höhe des maximalen finanziellen Schadens für das Risiko etc.
- Zu jedem Risiko formuliert das Unternehmen **Deckungswünsche**: gewünschte Versicherungssumme, gewünschte Klauseln/Bedingungen, gewünschter Versicherungszeitraum.

**Ebene B — Versicherer und Versicherungsprodukte (Angebotsseite):**
- **Versicherer** bieten **Versicherungsprodukte** am Markt an.
- Produkte sind in **Sparten** organisiert (Haftpflicht, Financial Lines, Property etc.).
- Ein Produkt bündelt mehrere **Deckungsdefinitionen** inkl. Klauseln, die den möglichen Versicherungsschutz definieren und den Preis (Prämie) für den Versicherungsschutz
- Deckungsdefinitionen legen fest: maximale Versicherungssumme, Selbstbeteiligung, Ausschlüsse, Bedingungswerk (Klauseln), Prämienhöhe

**Verbindung der Ebenen — Der Ausschreibungs- und Angebotsprozess:**
- Ein **Makler** nimmt die Daten zum Unternehmen, seinen Objekten, Risiken und Deckungswünschen entgegen.
- Der Makler startet eine **Ausschreibung** an einen oder mehrere Versicherer.
- Jeder Versicherer erstellt ein **Angebot** mit konkreten **Deckungsangeboten** je angefragter Deckung.
- Das Deckungsangebot kann vom Deckungswunsch abweichen (niedrigere Summe, zusätzliche Ausschlussklauseln, andere Selbstbeteiligung).
- Bei Annahme entsteht ein **Versicherungsvertrag** (Police) mit den finalen **Vertragsdeckungen**.

### 1.2 Kerngeschäftsprozesse

```
Unternehmen mit Objekte & Risiken
  → Makler erstellt Ausschreibung mit Deckungswünschen
    → Versicherer erstellt Angebot mit Deckungsangeboten
      → Verhandlung (ggf. Iteration über Deckungsangebote)
        → Vertragsbindung (Police) mit finalen Vertragsdeckungen
          → Laufende Vertragsanpassungen (Nachträge)
          → Schadenregulierung (Teilregulierungen, Teilzahlungen)
```

### 1.3 Schadenmanagement

- Ein **Schaden** ist immer einem oder mehreren **Objekt** zugeordnet.
- Ein Schaden kann mehrere **Deckungen/Verträge** betreffen (wenn das Objekt über mehrere Verträge versichert ist).
- Pro betroffener Deckung wird individuell entschieden, ob und wieviel des Schadens erstattet wird — abhängig von Schadenhöhe, Umständen und Klauseln.
- Die Schadensregulierung erfolgt oft in mehreren **Regulierungsschritten** (Teilregulierungen, Teilzahlungen, Nachreservierungen), besonders bei Großschäden.

### 1.4 Laufende Vertragsanpassungen

Versicherungsverträge müssen regelmäßig angepasst werden:
- Zukauf/Verkauf von Tochterunternehmen
- Neue oder abgehende Maschinen, Gebäude, Fahrzeuge
- Änderungen an der Mitarbeiterstruktur
- Veränderter Schadenverlauf (Schadenquote)

Dies geschieht über **Nachträge** (Endorsements), die Deckungen erweitern, einschränken oder anpassen und auch die Prämie entsprechend anpassen.

### 1.5 Zentrale Fragestellungen (Analytics)

Das Datenmodell muss folgende Auswertungen ermöglichen:
- Welche Objekte hat ein Unternehmen? Welche Risiken haben diese Objekte?
- Welche Deckungen/Verträge sind den Risiken/Objekten zugeordnet?
- Wie viele Versicherungsprodukte/Versicherer sind an der Risikodeckung beteiligt?
- Risikokonzentration über mehrere Verträge (Portfolio): regional, nach Branche, nach maximaler Schadenshöhe
- Makler-Performance: Wer bringt am meisten Geschäft?
- Deckungslücken: Wo ist ein Unternehmen unterversichert?
- Mehrfachdeckungen: Wo bestehen Überschneidungen über mehrere Verträge?
- Schadenquoten auf verschiedenen Ebenen: Deckung, Objekt, Unternehmen, Sparte, Versicherer

### 1.6 Basis- vs. Zusatzattribute

Das Modell unterscheidet zwei Attributkategorien:

**Basisattribute (fest, immer vorhanden):**
- Eindeutige ID, Bezeichnung, Status, Typ, Zeitstempel

**Flexible Zusatzattribute (kontextabhängig):**
- Objektspezifisch: Ein Fahrzeug hat andere Eigenschaften als eine Produktionshalle
- Deckungsspezifisch: Eine Haftpflichtdeckung braucht andere Felder als eine Cyberdeckung
- Vorgangsspezifisch: Individuelle Zusatzattribute für einzelne Geschäftsvorfälle

Die flexiblen Attribute werden über **Vorlagen (Templates)** standardisiert, die je Objekttyp, Deckungstyp oder Produkttyp definiert werden. Zusätzlich sind individuelle Ad-hoc-Attribute pro Vorgang möglich.






==========================================================================================



.claude/skills/ontology-guide => erweitere skill


==========================================================================================

Versionierung / Historisierung ?


==========================================================================================


Ich möchte die entwicklung der Ontologie und des Graphen so konkret und nachvollziehbar wie möglich für mich machen. Die abstrakte Beschreibung der Entitäten und Beziehungen reicht mir da nicht aus, ich verliere den Überblick.
Bitte schlage mir ein Vorgehen vor, wie ich iterativ vorgehen kann, in dem du eine konkrete Reihenfolge der Vereinerung vorschlägst und in Phasen aufteilst (zuerst Entität A, dann Beziehungen zwischen C und D usw.)
Ergänzen zur Dokumentation soll in jeder Phase auch einen interaktiven Prototyp (Python) weitentwickelt werden, der den aktuellen Stand der Ontologie und des Graphen erfahbar macht: Visualisierung der Daten und ihrer Beziehungen, Search- und CRUD-Operationen um eingeständig mit den Daten arbeiten zu können.
Der Protoyp soll generisch sein, sich aus Neo4J selbst konfigurieren (es soll keine Codeänderungen nach jeder Iteration der Spezifiakaton nötig sein):
Schritt 1: Einlesen der Cypher-Spezifikationen aus dem Projektverzeichnis, um den aktuellen Stand der Spezifikation in Neo4J zu importieren bzw. abzubilden
Schritt 2: Vollautomatische Visualisierung der Daten und ihrer Beziehungen und generische Oberfläche / Tools zum Einsehen von Details, Bearbeiten, Neuanlegen und Löschen von Daten (CRUD)
Erstelle hierzu einen Plan "_NOTES/iterative_plan.md"

==========================================================================================

Ziel App: 01-neo4j-Explorer-Vite, dort die App "Main App"
Analysiere die Python app "00-neo4j-Explorer-Python" und baue sie in Vite um: Lege dort in der Sidebar einen neuen Punkt "Neo4j Explorer" an und baue dort die App ein. 
Erstelle einen Implementierungsplan "_NOTES/01-neo4j-Explorer-Vite_plan.md"
