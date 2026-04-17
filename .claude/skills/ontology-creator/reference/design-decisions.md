# Die 6 bewährten Kernfragen

Diese Fragen tauchen bei fast jeder domänen-realen Ontologie auf. Stelle sie **nur, wenn anwendbar** – nicht mechanisch durchlaufen. Jede Frage via `AskUserQuestion` mit Preview-Mini-Cypher in den Optionen.

---

## §1 Scope: Wie breit soll die Ontologie werden?

**Wann:** Die Quelle hat neben der fachlichen Kerndomäne auch eine Workflow- oder KI-/Provenance-Schicht.

**Frage:**
```
A) Nur Kerndomäne                      – klar, fokussiert
B) Kern + Angebots-/Verkaufs-Prozess  – inkl. Vertriebs-Workflow
C) Komplett inkl. Workflow/KI         – maximal umfassend
```

**Hinweis:** Wenn der User "komplett" wählt, darauf hinweisen, dass die KI-Schicht oft mit Provenance-Beziehungen besser funktioniert als mit JSON-Bags.

---

## §2 Rollen-Splitting: separate Labels oder Multi-Label?

**Wann:** Eine Tabelle mit einer `role`/`type`/`kind`-Spalte wird in sehr unterschiedlichen Kontexten genutzt (z.B. `partner` = Makler / Kunde / Versicherer).

**Frage:**
```
A) Separate Labels (Empfohlen)
   - 3+ Labels, je eigene Properties
   - typisiert, graph-native
B) Multi-Label (:Partner :Broker etc.)
   - erlaubt Mehrfachrollen
   - gemeinsame + spezifische Properties
C) Ein Label mit partnerType-Property
   - minimale Migration, aber flach
```

**Indiz für A:** Die Rollen haben wenig gemeinsame Properties, verschiedene Beziehungen, ganz unterschiedliche Fachsprache.

---

## §3 Hierarchien: Selbstreferenz oder Group-Node?

**Wann:** Fachtext beschreibt Parent-Child (Konzern-Tochter, Kategorie-Unterkategorie, Abteilung-Team).

**Frage:**
```
A) Selbstreferenz PARENT_OF (Empfohlen)
   (Company)-[:PARENT_OF]->(Company)
   → rekursive Queries mit *
B) Group-Node
   (CompanyGroup)-[:HAS_MEMBER]->(Company)
   → sinnvoll, wenn der Konzern eigene Properties hat
C) PARENT_OF mit Share-Property
   → Teilhaberschaften mit sharePercent
D) Nicht modellieren
```

---

## §4 Lifecycle: Status-Property oder separate Labels?

**Wann:** Eine Entität durchläuft definierte Phasen (Request → Offer → Bound; Draft → Review → Published; Open → Processing → Closed).

**Frage:**
```
A) Ein Node mit lifecycleStatus-Property (Empfohlen)
   + Phase-Beziehungen (REQUESTED_IN, OFFERED_IN, BOUND_IN)
   → ein Identitätsträger, einfache Diffs zwischen Phasen
B) Separate Labels pro Phase
   (Requested)-[:DERIVED_INTO]->(Offered)-[:DERIVED_INTO]->(Bound)
   → sehr explizit, aber 3x Nodes
C) Template + Instance
   (Template)-[:INSTANCE_OF]<-(Instance)
   → wenn generische Definition + konkrete Ausprägung getrennt werden müssen
```

**Indiz für A:** Fachlich "derselbe Deal", nur in verschiedenen Zuständen. Für Diff-Queries (gewünscht vs. angeboten vs. vertraglich) reichen DERIVED_FROM-Kanten.

---

## §5 Flex-Attribute: JSON, dynamische Properties oder Attribute-Nodes?

**Wann:** Quelle hat JSON-Felder (`fields`, `attributes`, `meta`) und/oder Schema-Tabellen (`*_schema`, `*_catalog`).

**Frage:**
```
A) Dynamische Node-Properties + Template-Node (Empfohlen)
   (:Object {titel, datum, ort, besucher, ...})-[:OF_TYPE]->(:ObjectType {requiredFields:[...]})
   → schema-frei, direkt querybar
B) JSON-Property beibehalten
   (:Object {fields: '{"titel":..., "datum":...}'})
   → minimal, aber nicht querybar
C) Attribute-Nodes
   (:Object)-[:HAS_ATTRIBUTE]->(:Attribute {key, value, dataType})
   → maximal flexibel, viele kleine Nodes
```

**Indiz für A:** Neo4j ist schema-frei. Dynamische Properties + Template-Node liefern Typ-Sicherheit der Kategorie PLUS freie Attribute pro Node.

---

## §6 n:m mit Anteil: Relationship-Property oder Slip-Node?

**Wann:** Mehrere Entitäten teilen sich einen Anteil (Co-Insurance mit Share, Projekt mit FTE-Anteilen, Produkt mit Eigentum-Splits).

**Frage:**
```
A) Relationship-Property sharePercent (Empfohlen)
   (Policy)-[:UNDERWRITTEN_BY {sharePercent:60, leadInsurer:true}]->(Insurer)
   → aggregierbar, leichtgewichtig
B) Slip-/Share-Zwischenknoten
   (Policy)-[:HAS_SLIP]->(Slip {share,role})-[:BY]->(Insurer)
   → wenn Slip eigenen Lifecycle hat
C) Nur 1:1
   → wenn Shares fachlich aktuell nicht genutzt werden
```

---

## §7 KI-/Provenance-Layer: Beziehungen oder JSON?

**Wann:** Quelle hat Extraktions-/Audit-/History-Tabellen (`extracted_field`, `audit_log`).

**Empfehlung:**
- **Explizite Beziehungen** statt JSON-Bag
- Provenance-Modell:
  ```
  (ExtractedField)-[:FROM_DOCUMENT]->(Document)
  (ExtractedField)-[:EXTRACTED_IN]->(ExtractionRun)
  (ExtractedField)-[:POPULATES]->(Object|Risk|Coverage)
  (AuditEvent)-[:AFFECTS_FIELD]->(ExtractedField)
  ```
- So sind Queries möglich wie "alle Felder mit Confidence < 0.7 aus Lauf X" oder "welche Dokumente liefern das Feld Y?".

---

## Zusammenfassung

Die Fragen stellen sich meist in dieser Reihenfolge:

1. Scope (§1) – immer
2. Rollen-Splitting (§2) – wenn `role`-Spalte vorhanden
3. Hierarchien (§3) – wenn Fachtext Eltern/Kind beschreibt
4. Lifecycle (§4) – wenn Phasen erkennbar
5. Flex-Attribute (§5) – wenn JSON-Felder vorhanden
6. n:m mit Share (§6) – wenn Anteile fachlich relevant
7. Provenance (§7) – wenn KI-/Audit-Schicht vorhanden
