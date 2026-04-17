# Testdaten-Patterns (bewusste Spezialfälle)

Das Ziel ist ein **zusammenhängendes, fachlich nachvollziehbares Szenario**, das den User beim Anschauen im Explorer sofort die wichtigsten Analytics-Fragen sichtbar machen lässt. Kein generisches CRUD-Beispiel.

## Struktur

- **EIN Szenario**: z.B. "Festival-Saison 2026", "Kundenakquise Q2/2026", "Produkteinführung X". Alle Datensätze passen in diesen Kontext.
- **15–50 Datensätze** insgesamt – genug zum Erkennen von Mustern, wenig genug zum manuellen Nachvollziehen.
- **Konkrete Namen** (nicht `Company A`, `Company B`), damit man im Explorer Wiedererkennungswert hat.

## Pflicht-Spezialfälle (je nach Domäne)

### 1. Hierarchie mit Tiefe ≥ 2

Wenn Hierarchien modelliert sind: mindestens eine **Mutter mit 2 Töchtern**, idealerweise eine **Enkel-Ebene**.

### 2. Lücke (etwas Gewünschtes fehlt im Ergebnis)

Wenn Lifecycle modelliert:
- Eine Coverage mit `status=requested`, aber keine zugehörige `active`-Coverage → Deckungslücke
- Ein Risiko ohne aktive Absicherung
- Eine Anfrage ohne Angebot

### 3. Mehrfach (ein Ziel, mehrere Items)

- Ein Risiko mit mehreren aktiven Coverages
- Eine Person mit mehreren Rollen
- Ein Objekt mit mehreren Zuordnungen

### 4. Teil-Zustand (nicht alles erledigt)

- Ein Schaden mit `status=Teilreguliert` und Endorsement für Teilzahlung
- Ein Projekt mit einigen abgeschlossenen, einigen offenen Tasks

### 5. Share-Verteilung

Wenn Co-Insurance / Shares modelliert:
- Mindestens eine Police mit 60/40-Aufteilung
- Eine Police mit 3 Insurern (z.B. 50/30/20)
- Mindestens ein Lead-Insurer-Flag

### 6. Low-Confidence (KI-Layer)

Wenn KI-Extraktion modelliert:
- Eine Mehrheit an Feldern mit `aiConfidence > 85`
- **Mindestens ein Feld mit `aiConfidence < 60`** → Kandidat für manuelle Korrektur
- **Mindestens ein AuditEvent** mit Type `ManualFieldCorrection`, der genau dieses Feld adressiert

## Namenskonventionen für IDs

- Stabile Präfixe: `company-001`, `risk-001`, `cov-001-req`, `cov-001-off`, `cov-001-bnd`
- Lifecycle-Ableitung im ID-Suffix: `-req` (requested), `-off` (offered), `-bnd` (bound/active)
- Mehrfach-Instanzen: `-a`, `-b` (z.B. `cov-002-bnd-a`, `cov-002-bnd-b`)

## Checkliste vor dem Commit

```
[ ] Jedes Label hat mindestens 1 Datensatz
[ ] Jede Relationship kommt mindestens 1× vor
[ ] Hierarchie-Spezialfall (falls anwendbar)
[ ] Lücke-Spezialfall (falls Lifecycle)
[ ] Mehrfach-Spezialfall (falls Lifecycle oder n:m)
[ ] Teilzustand-Spezialfall (falls Workflow)
[ ] Share-Verteilung (falls anwendbar)
[ ] Low-Confidence + Korrektur (falls KI-Layer)
[ ] Skript idempotent (2× fehlerfrei laufbar)
[ ] Keine `;` in String-Literalen
```
