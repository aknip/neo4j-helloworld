# Szenario-Checkliste für Testdaten

Vor dem Fertigstellen von `02-example-data.cypher`:

## Struktur

- [ ] Ein zusammenhängendes fachliches Szenario mit konkretem Namen (z.B. "Festival-Saison 2026")
- [ ] 15–50 Datensätze insgesamt
- [ ] Jedes Label hat mindestens 1 Datensatz
- [ ] Jeder Relationship-Type kommt mindestens 1× vor

## Pflicht-Spezialfälle (je nach Modell-Option)

- [ ] **Hierarchie-Tiefe ≥ 2** (wenn Hierarchie modelliert)
- [ ] **Lücke**: etwas Gewünschtes fehlt im Ergebnis (wenn Lifecycle modelliert)
- [ ] **Mehrfach**: ein Ziel, mehrere Items (wenn n:m oder Mehrfach-Lifecycle)
- [ ] **Teilzustand**: Workflow nicht komplett (wenn Lifecycle/Workflow modelliert)
- [ ] **Share-Verteilung**: mindestens eine n:m-Beziehung mit Shares (wenn Co-Insurance / Shares)
- [ ] **Low-Confidence + Korrektur**: KI-Feld < 60% + AuditEvent (wenn KI-Layer)

## Technik

- [ ] Idempotent (2× hintereinander fehlerfrei laufbar)
- [ ] Keine `;` in String-Literalen
- [ ] Alle Datum-Werte als `date(...)` / `datetime(...)` (kein ISO-String)
- [ ] Alle IDs als String mit stabilem Präfix
- [ ] Stimmige Mengenverhältnisse (z.B. policy.annualPremium = Summe der Coverage.premium)

## Explorer-Lesbarkeit

- [ ] Sprechende Namen (nicht `Company A`, sondern `EventMedia Holding AG`)
- [ ] Fachlich passende Werte (realistische Beträge, plausible Daten)
- [ ] Wiedererkennbarkeit zwischen Nodes (z.B. "Rock Night 2026" taucht in Object + Claim + ExtractedField auf)
