# Naming Policy – Übernahme aus der Quelle

## Grundregel

**Namen aus der Quelle möglichst 1:1 übernehmen**, nur bei fachlicher Irreführung umbenennen.

Der Nutzer erkennt seine Daten wieder, wenn Tabellen-/Spaltennamen im Graph nachklingen. Jede unnötige Umbenennung erhöht die kognitive Last.

## Konvertierungsregeln

| Quelle (SQL) | Ziel (Cypher) | Beispiel |
|--------------|---------------|----------|
| `snake_case` Tabelle | `PascalCase` Label | `underwriting_guideline` → `UnderwritingGuideline` |
| `snake_case` Spalte | `camelCase` Property | `annual_premium` → `annualPremium`, `is_active` → `isActive` |
| Link-Tabelle `a_b` | `UPPER_SNAKE_CASE` Relationship | `submission_partner` → `ADDRESSED_TO` / `SUBMITTED_BY` (**semantisch**, nicht mechanisch) |
| `*_id` Foreign Key | Relationship-Name leitet sich aus Semantik ab | `policy.quote_id` → `(Quote)-[:REALIZED_AS]->(Policy)` |

## Wann umbenennen ist erlaubt (und nötig)

1. **Mehrdeutigkeit / Rollen-Splitting**: `partner` mit Rollen-Spalte → `Company` / `Broker` / `Insurer`
2. **Fach-jargon überlagert Technik**: `txn_type` → `transactionType` (camelCase), aber `line` → bleibt `Line` (ist der Fachbegriff für "Sparte")
3. **Englische Fachbegriffe sind klarer**: z.B. `peril_catalog` statt wörtlich "Gefahren-Katalog". Englisch als Konvention beibehalten.
4. **Irreführende Abkürzungen**: `uw_score` → `uwGuidelineScore` (ausschreiben wenn mehrdeutig)
5. **Status-Werte**: Enum-Strings aus der DB werden übernommen (`'Eingereicht'`, `'Freigegeben'` bleiben deutsch, wenn sie in der Quelle deutsch sind)

## Wann umbenennen vermeiden

- **Fach-exakter Ausdruck aus der Domäne**, auch wenn er für Tech-Leute ungewohnt klingt (z.B. `Mitzeichner` → nicht "Co-Signer", sondern als Klartext in Beschreibung beibehalten und `Insurer` als Label mit Rolle-Property `leadInsurer: false`)
- **Nur wegen Kosmetik** – nicht jeder Begriff muss "schön" sein
- **Abkürzung auflösen, wenn die Abkürzung der **fachliche** Standardbegriff ist** (z.B. `UW` für Underwriter bleibt in der Domäne, also `UnderwritingGuideline`, nicht `UnderwriterGuideline`)

## Umbenennungs-Tabelle in der Spec

Jede bewusste Umbenennung ins **Entscheidungsprotokoll** und zusätzlich ins **Namens-Mapping** der Spec:

```markdown
## 2.1 Namens-Mapping (Quelle → Graph)

| Quelle | Graph | Warum |
|--------|-------|-------|
| `partner` (ein Label, 3 Rollen) | `Company`, `Broker`, `Insurer` | Rollen mit unterschiedlicher Semantik |
| `coverage.sum_insured` | `Coverage.sumInsured` | snake_case → camelCase |
| `submission_partner.role` | entfällt | Rolle wird durch Label ausgedrückt |
| `object.fields` (JSON) | dynamische Properties (titel, datum, ...) | graph-native Flex-Attribute |
```

So kann der Nutzer jederzeit zurückverfolgen, warum ein Feld heißt, wie es heißt.
