# Neo4j Graph-Modellierungs-Patterns & Anti-Patterns

Referenzmaterial für Modellierungsentscheidungen im Ontologie-Guide.

---

## 1. Wann Node vs. Property?

### Als Property modellieren wenn:
- Der Wert ein einfacher Datentyp ist (String, Number, Boolean, DateTime)
- Der Wert keine eigenen Beziehungen braucht
- Der Wert nicht als Einstiegspunkt für Abfragen dient
- Es nur einen Wert pro Entität gibt (nicht mehrere)

### Als eigenen Node modellieren wenn:
- Der Wert eigene Beziehungen zu anderen Nodes hat
- Der Wert als Einstiegspunkt für Abfragen dient ("Finde alle X mit Y")
- Der Wert eine feste Werteliste ist, die sich ändern kann (Enum -> Node)
- Mehrere Entitäten den gleichen Wert teilen und das eine semantische Bedeutung hat
- Der Wert eigene Attribute hat

### Beispiele

```
SCHLECHT (als Property):
(:Person {city: "Berlin"})
-> Wenn man häufig "Alle Personen in Berlin" abfragt und Berlin eigene Daten hat

GUT (als Node):
(:Person)-[:LIVES_IN]->(:City {name: "Berlin", population: 3700000})

SCHLECHT (als Node):
(:Person)-[:HAS_AGE]->(:Age {value: 42})
-> Alter hat keine eigenen Beziehungen, ist ein einfacher Wert

GUT (als Property):
(:Person {age: 42})
```

---

## 2. Wann Relationship-Property vs. Intermediate Node?

### Relationship-Property wenn:
- Maximal 2-3 einfache Properties auf der Beziehung
- Die Properties beschreiben die Beziehung selbst (z.B. since, role, weight)
- Keine weiteren Beziehungen von der Beziehung ausgehen

### Intermediate Node wenn:
- Mehr als 3 Properties auf der Beziehung
- Die Beziehung selbst Beziehungen zu anderen Nodes braucht
- Die Beziehung eine eigene Identität hat (z.B. eine Bestellung, ein Vertrag)
- Mehrere Beziehungen gleichen Typs zwischen denselben Nodes existieren und unterscheidbar sein müssen

### Beispiele

```
GUT (Relationship-Property):
(:Person)-[:WORKS_AT {since: date('2020-01-01'), role: 'Engineer'}]->(:Company)

GUT (Intermediate Node):
(:Person)-[:SIGNED]->(:Contract {startDate: ..., endDate: ..., salary: ..., type: ...})-[:WITH]->(:Company)
-> Contract hat viele Properties und könnte eigene Beziehungen haben (z.B. zu Dokumenten)
```

---

## 3. Self-Referenz-Patterns (Hierarchien)

### Einfache Hierarchie
```cypher
(:Department)-[:HAS_SUBDEPARTMENT]->(:Department)
// oder
(:Category)-[:HAS_SUBCATEGORY]->(:Category)
```

### Hierarchie mit Tiefenbegrenzung abfragen
```cypher
// Alle Unterkategorien bis Tiefe 5
MATCH (root:Category {name: 'Electronics'})-[:HAS_SUBCATEGORY*1..5]->(sub)
RETURN sub
```

### Mehrfach-Hierarchie (Node gehört zu mehreren Eltern)
```cypher
(:Employee)-[:REPORTS_TO]->(:Employee)
(:Employee)-[:MEMBER_OF]->(:Team)
// -> Verschiedene Relationship Types für verschiedene Hierarchien
```

---

## 4. Zeitliche Modellierung

### Einfach: Timestamps als Properties
```cypher
(:Event {startDate: datetime('2024-01-15T10:00:00'), endDate: datetime('2024-01-15T12:00:00')})
```

### Versionierung mit Relationship-Properties
```cypher
(:Person)-[:HAS_ADDRESS {validFrom: date('2020-01-01'), validTo: date('2024-06-30')}]->(:Address)
```

### Auditierung mit separaten Nodes
```cypher
(:Entity)-[:HAS_VERSION]->(:EntityVersion {version: 3, changedAt: datetime(), changedBy: 'user1'})
```

---

## 5. Anti-Patterns

### Super Node (God Node)
**Problem**: Ein Node hat extrem viele Beziehungen (>100k), was Traversals verlangsamt.
**Beispiel**: Ein einzelner `:Country`-Node "Germany" mit Millionen `:LIVES_IN` Beziehungen.
**Lösung**: Fan-out mit Zwischen-Nodes (z.B. `:Region`, `:City`) oder Dense-Node-Strategie.

### Dense Node
**Problem**: Wenige Nodes sind extrem stark vernetzt.
**Lösung**: Beziehungen qualifizieren (z.B. nach Zeitraum partitionieren) oder Subgraph-Modell verwenden.

### Relationales Denken
**Problem**: 1:1-Übersetzung von SQL-Tabellen in Nodes, Join-Tabellen als Nodes.
**Lösung**: Graph-nativ denken - Beziehungen direkt modellieren, keine künstlichen Hub-Nodes.

```
SCHLECHT (relational):
(:Person)-[:PERSON_ADDRESS]->(:PersonAddress {personId: 1, addressId: 2})-[:ADDRESS_REF]->(:Address)

GUT (graph-nativ):
(:Person)-[:LIVES_AT {since: date('2020-01-01')}]->(:Address)
```

### Property-Graph als Dokument-Store
**Problem**: Alles in einem Node als JSON-artige verschachtelte Properties.
**Lösung**: Verschachtelungen als eigene Nodes mit Beziehungen modellieren.

### Bidirektionale Beziehungen
**Problem**: Zwei Beziehungen in beide Richtungen wo eine reicht.
**Lösung**: Eine Beziehung mit klarer Semantik. Neo4j kann in beide Richtungen traversieren.

```
SCHLECHT:
(:Person)-[:FRIEND_OF]->(:Person)
(:Person)<-[:FRIEND_OF]-(:Person)

GUT:
(:Person)-[:FRIEND_OF]-(:Person)  // Richtungslos abfragen
```

---

## 6. Index-Strategie

### Wann welcher Index?

| Index-Typ | Verwendung | Beispiel |
|-----------|-----------|---------|
| **Unique Constraint** | IDs, natürliche Schlüssel | `REQUIRE p.id IS UNIQUE` |
| **Range Index** | Häufige Lookups, Bereichsabfragen | Einzelne Properties in WHERE-Klauseln |
| **Composite Index** | Kombinierte Abfragen | `CREATE INDEX FOR (p:Person) ON (p.lastName, p.firstName)` |
| **Text Index** | Textsuche, CONTAINS, STARTS WITH | `CREATE TEXT INDEX FOR (p:Product) ON (p.description)` |
| **Fulltext Index** | Volltextsuche mit Scoring | `CREATE FULLTEXT INDEX FOR (p:Product) ON EACH [p.name, p.description]` |

### Faustregel
- Jeder Node braucht mindestens einen Unique Constraint (ID)
- Properties die in WHERE/ORDER BY vorkommen: Range Index
- Properties für Textsuche: Text oder Fulltext Index
- Nicht überindizieren - jeder Index kostet Schreibperformance
