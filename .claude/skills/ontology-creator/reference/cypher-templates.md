# Cypher Templates

Wiederverwendbare Cypher-Fragmente für die Ontologie-Generierung.

---

## 1. Constraints

### Unique Node Property Constraint
```cypher
CREATE CONSTRAINT IF NOT EXISTS FOR (n:NodeLabel) REQUIRE n.propertyName IS UNIQUE;
```

### Node Property Existence Constraint
```cypher
CREATE CONSTRAINT IF NOT EXISTS FOR (n:NodeLabel) REQUIRE n.propertyName IS NOT NULL;
```

### Relationship Property Existence Constraint
```cypher
CREATE CONSTRAINT IF NOT EXISTS FOR ()-[r:REL_TYPE]-() REQUIRE r.propertyName IS NOT NULL;
```

### Node Key Constraint (Composite Unique)
```cypher
CREATE CONSTRAINT IF NOT EXISTS FOR (n:NodeLabel) REQUIRE (n.prop1, n.prop2) IS NODE KEY;
```

---

## 2. Indexes

### Range Index (Single Property)
```cypher
CREATE INDEX IF NOT EXISTS FOR (n:NodeLabel) ON (n.propertyName);
```

### Composite Index
```cypher
CREATE INDEX IF NOT EXISTS FOR (n:NodeLabel) ON (n.prop1, n.prop2);
```

### Text Index
```cypher
CREATE TEXT INDEX IF NOT EXISTS FOR (n:NodeLabel) ON (n.propertyName);
```

### Fulltext Index
```cypher
CREATE FULLTEXT INDEX indexName IF NOT EXISTS
FOR (n:NodeLabel) ON EACH [n.prop1, n.prop2];
```

### Relationship Index
```cypher
CREATE INDEX IF NOT EXISTS FOR ()-[r:REL_TYPE]-() ON (r.propertyName);
```

---

## 3. Node-Erstellung (MERGE)

### Einfacher Node
```cypher
MERGE (n:NodeLabel {id: 'unique-id-001'})
SET n.name = 'Example Name',
    n.status = 'active',
    n.createdAt = datetime(),
    n.updatedAt = datetime();
```

### Node mit mehreren Labels
```cypher
MERGE (n:PrimaryLabel:SecondaryLabel {id: 'unique-id-001'})
SET n.name = 'Example',
    n.createdAt = datetime();
```

### Bulk-Erstellung mit UNWIND
```cypher
UNWIND [
  {id: 'item-001', name: 'Item 1', status: 'active'},
  {id: 'item-002', name: 'Item 2', status: 'inactive'},
  {id: 'item-003', name: 'Item 3', status: 'active'}
] AS item
MERGE (n:NodeLabel {id: item.id})
SET n.name = item.name,
    n.status = item.status,
    n.createdAt = datetime();
```

---

## 4. Relationship-Erstellung

### Einfache Beziehung
```cypher
MATCH (a:LabelA {id: 'id-a'})
MATCH (b:LabelB {id: 'id-b'})
MERGE (a)-[:RELATIONSHIP_TYPE]->(b);
```

### Beziehung mit Properties
```cypher
MATCH (a:LabelA {id: 'id-a'})
MATCH (b:LabelB {id: 'id-b'})
MERGE (a)-[r:RELATIONSHIP_TYPE]->(b)
SET r.since = date('2024-01-01'),
    r.role = 'Manager';
```

### Bulk-Beziehungen mit UNWIND
```cypher
UNWIND [
  {from: 'id-a1', to: 'id-b1', role: 'Owner'},
  {from: 'id-a2', to: 'id-b2', role: 'Member'}
] AS rel
MATCH (a:LabelA {id: rel.from})
MATCH (b:LabelB {id: rel.to})
MERGE (a)-[r:RELATIONSHIP_TYPE]->(b)
SET r.role = rel.role;
```

---

## 5. Typische Query-Patterns

### Einfacher Traversal
```cypher
// Alle Kunden eines Unternehmens
MATCH (c:Company {name: 'Acme'})<-[:WORKS_AT]-(e:Employee)
RETURN e.name, e.role
ORDER BY e.name;
```

### Multi-Hop Traversal
```cypher
// Kunde -> Bestellungen -> Produkte
MATCH (c:Customer {id: 'cust-001'})-[:PLACED]->(o:Order)-[:CONTAINS]->(p:Product)
RETURN o.orderDate, p.name, p.price;
```

### Aggregation
```cypher
// Anzahl Mitarbeiter pro Abteilung
MATCH (d:Department)<-[:BELONGS_TO]-(e:Employee)
RETURN d.name, count(e) AS employeeCount
ORDER BY employeeCount DESC;
```

### Path-Finding
```cypher
// Kürzester Pfad zwischen zwei Personen
MATCH path = shortestPath(
  (a:Person {name: 'Alice'})-[*]-(b:Person {name: 'Bob'})
)
RETURN path;
```

### Variable-Length Relationships
```cypher
// Alle Vorgesetzten in der Hierarchie (bis 5 Ebenen)
MATCH (e:Employee {id: 'emp-001'})-[:REPORTS_TO*1..5]->(mgr:Employee)
RETURN mgr.name, length(
  shortestPath((e)-[:REPORTS_TO*]->(mgr))
) AS level;
```

### Optional Match
```cypher
// Alle Kunden mit optionalen Bestellungen
MATCH (c:Customer)
OPTIONAL MATCH (c)-[:PLACED]->(o:Order)
RETURN c.name, count(o) AS orderCount;
```

### WITH für Zwischenergebnisse
```cypher
// Top-10 Kunden nach Umsatz mit ihren letzten Bestellungen
MATCH (c:Customer)-[:PLACED]->(o:Order)
WITH c, sum(o.total) AS totalSpent
ORDER BY totalSpent DESC
LIMIT 10
MATCH (c)-[:PLACED]->(recent:Order)
WHERE recent.orderDate > date() - duration('P90D')
RETURN c.name, totalSpent, collect(recent.orderDate) AS recentOrders;
```

### CASE und bedingte Logik
```cypher
MATCH (p:Product)
RETURN p.name,
  CASE
    WHEN p.stock = 0 THEN 'Out of Stock'
    WHEN p.stock < 10 THEN 'Low Stock'
    ELSE 'In Stock'
  END AS availability;
```

---

## 6. Datenbank-Verwaltung

### Datenbank leeren
```cypher
// ACHTUNG: Löscht alle Daten!
MATCH (n) DETACH DELETE n;
```

### Schema anzeigen
```cypher
CALL db.schema.visualization();
```

### Constraints anzeigen
```cypher
SHOW CONSTRAINTS;
```

### Indexes anzeigen
```cypher
SHOW INDEXES;
```

### Statistiken
```cypher
// Node-Counts pro Label
CALL db.labels() YIELD label
CALL {
  WITH label
  CALL db.stats.retrieve('GRAPH COUNTS') YIELD data
  RETURN data
}
RETURN label, data;

// Einfacher: Alle Node-Counts
MATCH (n)
RETURN labels(n) AS label, count(*) AS count
ORDER BY count DESC;
```

---

## 7. Datei-Header-Template

Verwende diesen Header für generierte Cypher-Dateien:

```cypher
// =============================================================================
// [Dateiname]
// Ontologie: [Domänenname]
// Generiert: [Datum]
// Version: [n]
// =============================================================================
```

### Abschnitts-Trenner
```cypher
// === [Abschnittsname] ========================================================
```
