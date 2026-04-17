# Quellen-Inspektion

## SQLite-Datei

```bash
# Tabellen-Liste
sqlite3 <pfad> ".tables"

# Komplettes Schema (Create-Statements)
sqlite3 <pfad> ".schema"

# Zeilen-Zähler je Tabelle (via UNION zusammenfassbar)
sqlite3 <pfad> "SELECT 't1',COUNT(*) FROM t1 UNION ALL SELECT 't2',COUNT(*) FROM t2 ..."

# Sample-Rows der Kern-Tabellen
sqlite3 <pfad> "SELECT * FROM t1 LIMIT 3; SELECT '---'; SELECT * FROM t2 LIMIT 3"
```

Wichtig für die Ontologie:

| Feld-Muster | Erkennung | Vorschlag |
|-------------|-----------|-----------|
| `*_id INTEGER REFERENCES *(id)` | Foreign Key | Relationship |
| n:m-Tabelle (`xyz_partner`, `xyz_link`) mit nur FKs+Meta | Link-Tabelle | Relationship (oder Zwischenknoten bei vielen Properties) |
| `role TEXT` in Link-Tabelle | Rolle im Kontext | Splitting der verknüpften Entität in Teil-Labels prüfen |
| `type TEXT`, `status TEXT` | Kategorie / Lifecycle | Enum-Property oder Template-Node |
| `*_schema TEXT`, `*_catalog TEXT` | JSON-Schema | Template-Node |
| `fields TEXT` (JSON-String) | dynamische Attribute | dynamische Node-Properties |
| Selbst-FK (`parent_id INTEGER REFERENCES same_table(id)`) | Hierarchie | Selbstreferenz-Relationship |
| Property `sum_*`, `share_*`, `percent_*` | Anteil/Share | Relationship-Property |
| Tabellen `audit_log`, `extraction_*`, `history_*` | Workflow/Provenance | Eigener Cluster, Provenance-Beziehungen |

## Postgres / SQL-Dump

```bash
# Create-Statements extrahieren
grep -iE "^CREATE TABLE|^CREATE INDEX|FOREIGN KEY|REFERENCES" <dump.sql>
```

Gleiche Muster wie oben.

## Fachtext / Markdown-Dokumente

Schritt-für-Schritt:

1. **Substantive sammeln** → Kandidaten für Node-Labels
2. **Verben / Beziehungswörter** ("besitzt", "gehört zu", "verursacht") → Relationship-Kandidaten
3. **Explizite Kardinalitäten** ("kann mehrere X haben", "genau ein Y") dokumentieren
4. **Analyse-Fragen** im Text ("welche X haben Y?", "wo konzentrieren sich Z?") → Analytics Use Cases
5. **Implizite Konzepte** (z.B. "Mitzeichner" → Co-Insurance) benennen

## Divergenz-Check

Immer: Was steht im Fachtext, aber NICHT in der DB? Diese Lücken in die **Offenen Punkte** der Spec aufnehmen und in den Struktur-Fragen explizit adressieren.

Beispiele:
- Fachtext: "Konzernstruktur mit Töchtern" → DB: flache Company-Tabelle → Designfrage "Hierarchie-Modellierung"
- Fachtext: "Mitzeichner mit Anteil" → DB: keine Share-Spalte → Designfrage "Co-Insurance mit sharePercent"
- Fachtext: "Deckungslücken" → DB: keine Request-/Offer-Unterscheidung → Designfrage "Coverage-Lifecycle"
