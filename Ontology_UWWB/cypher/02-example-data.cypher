// =============================================================================
// 02-example-data.cypher
// Ontologie: UWWB (Underwriting Workbench)
// Generiert: 2026-04-09
// Version: 1.0
//
// Szenario: Mueller Automotive GmbH — Industrieversicherung 2024
// Ein mittelstaendischer Automobilzulieferer in Stuttgart mit Tochtergesellschaft
// in Muenchen. Versichert ueber Marsh als Makler bei Allianz und Munich Re.
// =============================================================================

// === Partner: Kunden =========================================================

MERGE (p:Partner:Customer {id: 'partner-001'})
SET p.legalName = 'Müller Automotive GmbH',
    p.partnerType = 'organization',
    p.country = 'DE',
    p.status = 'active',
    p.industry = 'Automotive',
    p.revenue = 500000000.0,
    p.createdAt = datetime('2024-01-15T10:00:00'),
    p.updatedAt = datetime('2024-01-15T10:00:00');

MERGE (p:Partner:Customer {id: 'partner-002'})
SET p.legalName = 'Müller Components GmbH',
    p.partnerType = 'organization',
    p.country = 'DE',
    p.status = 'active',
    p.industry = 'Automotive',
    p.revenue = 80000000.0,
    p.createdAt = datetime('2024-01-15T10:00:00'),
    p.updatedAt = datetime('2024-01-15T10:00:00');

// === Partner: Makler =========================================================

MERGE (p:Partner:Broker {id: 'partner-003'})
SET p.legalName = 'Marsh Deutschland GmbH',
    p.partnerType = 'organization',
    p.country = 'DE',
    p.status = 'active',
    p.licenseNumber = 'IHK-FFM-2019-4711',
    p.createdAt = datetime('2024-01-10T09:00:00'),
    p.updatedAt = datetime('2024-01-10T09:00:00');

// === Partner: Versicherer ====================================================

MERGE (p:Partner:Insurer {id: 'partner-004'})
SET p.legalName = 'Allianz Versicherung AG',
    p.partnerType = 'organization',
    p.country = 'DE',
    p.status = 'active',
    p.rating = 'A+',
    p.createdAt = datetime('2024-01-10T09:00:00'),
    p.updatedAt = datetime('2024-01-10T09:00:00');

MERGE (p:Partner:Insurer {id: 'partner-005'})
SET p.legalName = 'Munich Re AG',
    p.partnerType = 'organization',
    p.country = 'DE',
    p.status = 'active',
    p.rating = 'AA-',
    p.createdAt = datetime('2024-01-10T09:00:00'),
    p.updatedAt = datetime('2024-01-10T09:00:00');

// === Partner: Ansprechpartner ================================================

MERGE (p:Partner:Contact {id: 'contact-001'})
SET p.legalName = 'Hans Weber',
    p.partnerType = 'person',
    p.country = 'DE',
    p.status = 'active',
    p.firstName = 'Hans',
    p.lastName = 'Weber',
    p.email = 'h.weber@mueller-automotive.de',
    p.phone = '+49 711 123456',
    p.createdAt = datetime('2024-01-15T10:00:00'),
    p.updatedAt = datetime('2024-01-15T10:00:00');

MERGE (p:Partner:Contact {id: 'contact-002'})
SET p.legalName = 'Lisa Schmidt',
    p.partnerType = 'person',
    p.country = 'DE',
    p.status = 'active',
    p.firstName = 'Lisa',
    p.lastName = 'Schmidt',
    p.email = 'lisa.schmidt@marsh.com',
    p.phone = '+49 69 987654',
    p.createdAt = datetime('2024-01-10T09:00:00'),
    p.updatedAt = datetime('2024-01-10T09:00:00');

MERGE (p:Partner:Contact {id: 'contact-003'})
SET p.legalName = 'Thomas Klein',
    p.partnerType = 'person',
    p.country = 'DE',
    p.status = 'active',
    p.firstName = 'Thomas',
    p.lastName = 'Klein',
    p.email = 't.klein@allianz.de',
    p.phone = '+49 89 456789',
    p.createdAt = datetime('2024-01-10T09:00:00'),
    p.updatedAt = datetime('2024-01-10T09:00:00');

// === Partner-Beziehungen =====================================================

// Konzernstruktur: Mueller Automotive -> Mueller Components
MATCH (parent:Customer {id: 'partner-001'})
MATCH (child:Customer {id: 'partner-002'})
MERGE (parent)-[:HAS_SUBSIDIARY]->(child);

// Ansprechpartner-Zuordnung
MATCH (c:Contact {id: 'contact-001'})
MATCH (p:Customer {id: 'partner-001'})
MERGE (c)-[r:WORKS_FOR]->(p)
SET r.role = 'Risk Manager', r.since = date('2018-03-01');

MATCH (c:Contact {id: 'contact-002'})
MATCH (p:Broker {id: 'partner-003'})
MERGE (c)-[r:WORKS_FOR]->(p)
SET r.role = 'Account Manager', r.since = date('2020-06-15');

MATCH (c:Contact {id: 'contact-003'})
MATCH (p:Insurer {id: 'partner-004'})
MERGE (c)-[r:WORKS_FOR]->(p)
SET r.role = 'Senior Underwriter', r.since = date('2015-09-01');

// Makler betreut Kunden
MATCH (b:Broker {id: 'partner-003'})
MATCH (c:Customer {id: 'partner-001'})
MERGE (b)-[r:MANAGES_ACCOUNT]->(c)
SET r.since = date('2019-01-01');

MATCH (b:Broker {id: 'partner-003'})
MATCH (c:Customer {id: 'partner-002'})
MERGE (b)-[r:MANAGES_ACCOUNT]->(c)
SET r.since = date('2019-01-01');

// === Versicherbare Objekte ===================================================

MERGE (o:InsurableObject:Building {id: 'obj-001'})
SET o.objectName = 'Produktionshalle Stuttgart',
    o.location = 'Industriestr. 42, 70565 Stuttgart',
    o.insuredValue = 25000000.0,
    o.status = 'active',
    o.constructionYear = 2005,
    o.area = 12000.0,
    o.fireProtectionClass = 'SK3',
    o.floors = 2,
    o.createdAt = datetime('2024-01-20T08:00:00'),
    o.updatedAt = datetime('2024-01-20T08:00:00');

MERGE (o:InsurableObject:Machine {id: 'obj-002'})
SET o.objectName = 'CNC-Fräszentrum DMG MORI DMU 80',
    o.location = 'Industriestr. 42, 70565 Stuttgart',
    o.insuredValue = 850000.0,
    o.status = 'active',
    o.manufacturer = 'DMG MORI',
    o.acquisitionValue = 920000.0,
    o.commissioningDate = date('2021-06-15'),
    o.machineType = 'CNC-Fräszentrum',
    o.createdAt = datetime('2024-01-20T08:00:00'),
    o.updatedAt = datetime('2024-01-20T08:00:00');

MERGE (o:InsurableObject:Machine {id: 'obj-003'})
SET o.objectName = 'Spritzgussanlage Arburg 570 A',
    o.location = 'Industriestr. 42, 70565 Stuttgart',
    o.insuredValue = 420000.0,
    o.status = 'active',
    o.manufacturer = 'Arburg',
    o.acquisitionValue = 480000.0,
    o.commissioningDate = date('2022-03-01'),
    o.machineType = 'Spritzgussanlage',
    o.createdAt = datetime('2024-01-20T08:00:00'),
    o.updatedAt = datetime('2024-01-20T08:00:00');

MERGE (o:InsurableObject:Vehicle {id: 'obj-004'})
SET o.objectName = 'Firmenwagen BMW 530d xDrive',
    o.location = 'Stuttgart',
    o.insuredValue = 62000.0,
    o.status = 'active',
    o.licensePlate = 'S-MA 4711',
    o.vehicleType = 'PKW',
    o.acquisitionValue = 68000.0,
    o.createdAt = datetime('2024-01-20T08:00:00'),
    o.updatedAt = datetime('2024-01-20T08:00:00');

MERGE (o:InsurableObject:Vehicle {id: 'obj-005'})
SET o.objectName = 'LKW Mercedes Actros 1845',
    o.location = 'Stuttgart',
    o.insuredValue = 95000.0,
    o.status = 'active',
    o.licensePlate = 'S-MA 8815',
    o.vehicleType = 'LKW',
    o.acquisitionValue = 110000.0,
    o.createdAt = datetime('2024-01-20T08:00:00'),
    o.updatedAt = datetime('2024-01-20T08:00:00');

MERGE (o:InsurableObject:Building {id: 'obj-006'})
SET o.objectName = 'Lagerhalle München',
    o.location = 'Gewerbepark 7, 85748 Garching',
    o.insuredValue = 8000000.0,
    o.status = 'active',
    o.constructionYear = 2012,
    o.area = 4500.0,
    o.fireProtectionClass = 'SK2',
    o.floors = 1,
    o.createdAt = datetime('2024-01-20T08:00:00'),
    o.updatedAt = datetime('2024-01-20T08:00:00');

// Objekt-Zuordnung zu Kunden
MATCH (c:Customer {id: 'partner-001'})
MATCH (o:InsurableObject {id: 'obj-001'})
MERGE (c)-[r:OWNS]->(o) SET r.since = date('2005-08-01');

MATCH (c:Customer {id: 'partner-001'})
MATCH (o:InsurableObject {id: 'obj-002'})
MERGE (c)-[r:OWNS]->(o) SET r.since = date('2021-06-15');

MATCH (c:Customer {id: 'partner-001'})
MATCH (o:InsurableObject {id: 'obj-003'})
MERGE (c)-[r:OWNS]->(o) SET r.since = date('2022-03-01');

MATCH (c:Customer {id: 'partner-001'})
MATCH (o:InsurableObject {id: 'obj-004'})
MERGE (c)-[r:OWNS]->(o) SET r.since = date('2023-09-01');

MATCH (c:Customer {id: 'partner-001'})
MATCH (o:InsurableObject {id: 'obj-005'})
MERGE (c)-[r:OWNS]->(o) SET r.since = date('2022-11-15');

MATCH (c:Customer {id: 'partner-002'})
MATCH (o:InsurableObject {id: 'obj-006'})
MERGE (c)-[r:OWNS]->(o) SET r.since = date('2012-04-01');

// === Risiken =================================================================

MERGE (r:Risk {id: 'risk-001'})
SET r.riskType = 'Feuer',
    r.maxExposure = 25000000.0,
    r.probability = 'low',
    r.description = 'Brandrisiko Produktionshalle inkl. Inhalt',
    r.createdAt = datetime('2024-02-01T10:00:00'),
    r.updatedAt = datetime('2024-02-01T10:00:00');

MERGE (r:Risk {id: 'risk-002'})
SET r.riskType = 'Maschinenbruch',
    r.maxExposure = 920000.0,
    r.probability = 'medium',
    r.description = 'Maschinenbruch CNC-Fräszentrum inkl. Betriebsunterbrechung',
    r.createdAt = datetime('2024-02-01T10:00:00'),
    r.updatedAt = datetime('2024-02-01T10:00:00');

MERGE (r:Risk {id: 'risk-003'})
SET r.riskType = 'Maschinenbruch',
    r.maxExposure = 480000.0,
    r.probability = 'medium',
    r.description = 'Maschinenbruch Spritzgussanlage',
    r.createdAt = datetime('2024-02-01T10:00:00'),
    r.updatedAt = datetime('2024-02-01T10:00:00');

MERGE (r:Risk {id: 'risk-004'})
SET r.riskType = 'Fahrzeugschaden',
    r.maxExposure = 68000.0,
    r.probability = 'medium',
    r.description = 'Vollkasko Firmenwagen',
    r.createdAt = datetime('2024-02-01T10:00:00'),
    r.updatedAt = datetime('2024-02-01T10:00:00');

MERGE (r:Risk {id: 'risk-005'})
SET r.riskType = 'Fahrzeugschaden',
    r.maxExposure = 110000.0,
    r.probability = 'medium',
    r.description = 'Vollkasko LKW',
    r.createdAt = datetime('2024-02-01T10:00:00'),
    r.updatedAt = datetime('2024-02-01T10:00:00');

MERGE (r:Risk {id: 'risk-006'})
SET r.riskType = 'Feuer',
    r.maxExposure = 8000000.0,
    r.probability = 'low',
    r.description = 'Brandrisiko Lagerhalle München',
    r.createdAt = datetime('2024-02-01T10:00:00'),
    r.updatedAt = datetime('2024-02-01T10:00:00');

// Risiko-Zuordnung zu Objekten
MATCH (o:InsurableObject {id: 'obj-001'}) MATCH (r:Risk {id: 'risk-001'}) MERGE (o)-[:HAS_RISK]->(r);
MATCH (o:InsurableObject {id: 'obj-002'}) MATCH (r:Risk {id: 'risk-002'}) MERGE (o)-[:HAS_RISK]->(r);
MATCH (o:InsurableObject {id: 'obj-003'}) MATCH (r:Risk {id: 'risk-003'}) MERGE (o)-[:HAS_RISK]->(r);
MATCH (o:InsurableObject {id: 'obj-004'}) MATCH (r:Risk {id: 'risk-004'}) MERGE (o)-[:HAS_RISK]->(r);
MATCH (o:InsurableObject {id: 'obj-005'}) MATCH (r:Risk {id: 'risk-005'}) MERGE (o)-[:HAS_RISK]->(r);
MATCH (o:InsurableObject {id: 'obj-006'}) MATCH (r:Risk {id: 'risk-006'}) MERGE (o)-[:HAS_RISK]->(r);

// === Deckungswuensche ========================================================

MERGE (cr:CoverageRequest {id: 'creq-001'})
SET cr.requestedSum = 30000000.0,
    cr.deductible = 50000.0,
    cr.periodStart = date('2024-07-01'),
    cr.periodEnd = date('2025-06-30'),
    cr.status = 'matched',
    cr.createdAt = datetime('2024-02-15T10:00:00'),
    cr.updatedAt = datetime('2024-06-01T14:00:00');

MERGE (cr:CoverageRequest {id: 'creq-002'})
SET cr.requestedSum = 5000000.0,
    cr.deductible = 25000.0,
    cr.periodStart = date('2024-07-01'),
    cr.periodEnd = date('2025-06-30'),
    cr.status = 'matched',
    cr.createdAt = datetime('2024-02-15T10:00:00'),
    cr.updatedAt = datetime('2024-06-01T14:00:00');

MERGE (cr:CoverageRequest {id: 'creq-003'})
SET cr.requestedSum = 3000000.0,
    cr.deductible = 25000.0,
    cr.periodStart = date('2024-07-01'),
    cr.periodEnd = date('2025-06-30'),
    cr.status = 'matched',
    cr.createdAt = datetime('2024-02-15T10:00:00'),
    cr.updatedAt = datetime('2024-06-01T14:00:00');

MERGE (cr:CoverageRequest {id: 'creq-004'})
SET cr.requestedSum = 200000.0,
    cr.deductible = 5000.0,
    cr.periodStart = date('2024-07-01'),
    cr.periodEnd = date('2025-06-30'),
    cr.status = 'matched',
    cr.createdAt = datetime('2024-02-15T10:00:00'),
    cr.updatedAt = datetime('2024-06-01T14:00:00');

MERGE (cr:CoverageRequest {id: 'creq-005'})
SET cr.requestedSum = 500000.0,
    cr.deductible = 5000.0,
    cr.periodStart = date('2024-07-01'),
    cr.periodEnd = date('2025-06-30'),
    cr.status = 'matched',
    cr.createdAt = datetime('2024-02-15T10:00:00'),
    cr.updatedAt = datetime('2024-06-01T14:00:00');

// Deckungswunsch -> Risiko
MATCH (r:Risk {id: 'risk-001'}) MATCH (cr:CoverageRequest {id: 'creq-001'}) MERGE (r)-[:HAS_COVERAGE_REQUEST]->(cr);
MATCH (r:Risk {id: 'risk-002'}) MATCH (cr:CoverageRequest {id: 'creq-002'}) MERGE (r)-[:HAS_COVERAGE_REQUEST]->(cr);
MATCH (r:Risk {id: 'risk-003'}) MATCH (cr:CoverageRequest {id: 'creq-003'}) MERGE (r)-[:HAS_COVERAGE_REQUEST]->(cr);
MATCH (r:Risk {id: 'risk-004'}) MATCH (cr:CoverageRequest {id: 'creq-004'}) MERGE (r)-[:HAS_COVERAGE_REQUEST]->(cr);
MATCH (r:Risk {id: 'risk-005'}) MATCH (cr:CoverageRequest {id: 'creq-005'}) MERGE (r)-[:HAS_COVERAGE_REQUEST]->(cr);

// === Sparten (InsuranceLine) =================================================

MERGE (l:InsuranceLine {id: 'line-001'})
SET l.lineName = 'Sachversicherung',
    l.lineCode = 'PROP',
    l.createdAt = datetime('2024-01-01T00:00:00'),
    l.updatedAt = datetime('2024-01-01T00:00:00');

MERGE (l:InsuranceLine {id: 'line-002'})
SET l.lineName = 'Feuerversicherung',
    l.lineCode = 'FIRE',
    l.createdAt = datetime('2024-01-01T00:00:00'),
    l.updatedAt = datetime('2024-01-01T00:00:00');

MERGE (l:InsuranceLine {id: 'line-003'})
SET l.lineName = 'Maschinenversicherung',
    l.lineCode = 'MACH',
    l.createdAt = datetime('2024-01-01T00:00:00'),
    l.updatedAt = datetime('2024-01-01T00:00:00');

MERGE (l:InsuranceLine {id: 'line-004'})
SET l.lineName = 'Kfz-Versicherung',
    l.lineCode = 'MOT',
    l.createdAt = datetime('2024-01-01T00:00:00'),
    l.updatedAt = datetime('2024-01-01T00:00:00');

MERGE (l:InsuranceLine {id: 'line-005'})
SET l.lineName = 'Flottenversicherung',
    l.lineCode = 'FLEET',
    l.createdAt = datetime('2024-01-01T00:00:00'),
    l.updatedAt = datetime('2024-01-01T00:00:00');

// Spartenhierarchie
MATCH (parent:InsuranceLine {id: 'line-001'}) MATCH (child:InsuranceLine {id: 'line-002'}) MERGE (parent)-[:HAS_SUBLINE]->(child);
MATCH (parent:InsuranceLine {id: 'line-001'}) MATCH (child:InsuranceLine {id: 'line-003'}) MERGE (parent)-[:HAS_SUBLINE]->(child);
MATCH (parent:InsuranceLine {id: 'line-004'}) MATCH (child:InsuranceLine {id: 'line-005'}) MERGE (parent)-[:HAS_SUBLINE]->(child);

// === Versicherungsprodukte ===================================================

MERGE (p:InsuranceProduct {id: 'prod-001'})
SET p.productName = 'Allianz Property All Risk',
    p.validFrom = date('2024-01-01'),
    p.validTo = date('2025-12-31'),
    p.status = 'active',
    p.createdAt = datetime('2024-01-01T00:00:00'),
    p.updatedAt = datetime('2024-01-01T00:00:00');

MERGE (p:InsuranceProduct {id: 'prod-002'})
SET p.productName = 'Allianz Flottenversicherung',
    p.validFrom = date('2024-01-01'),
    p.validTo = date('2025-12-31'),
    p.status = 'active',
    p.createdAt = datetime('2024-01-01T00:00:00'),
    p.updatedAt = datetime('2024-01-01T00:00:00');

MERGE (p:InsuranceProduct {id: 'prod-003'})
SET p.productName = 'Munich Re Industrial Property',
    p.validFrom = date('2024-01-01'),
    p.validTo = date('2025-12-31'),
    p.status = 'active',
    p.createdAt = datetime('2024-01-01T00:00:00'),
    p.updatedAt = datetime('2024-01-01T00:00:00');

// Produkt -> Versicherer
MATCH (ins:Insurer {id: 'partner-004'}) MATCH (p:InsuranceProduct {id: 'prod-001'}) MERGE (ins)-[:OFFERS]->(p);
MATCH (ins:Insurer {id: 'partner-004'}) MATCH (p:InsuranceProduct {id: 'prod-002'}) MERGE (ins)-[:OFFERS]->(p);
MATCH (ins:Insurer {id: 'partner-005'}) MATCH (p:InsuranceProduct {id: 'prod-003'}) MERGE (ins)-[:OFFERS]->(p);

// Produkt -> Sparte
MATCH (p:InsuranceProduct {id: 'prod-001'}) MATCH (l:InsuranceLine {id: 'line-001'}) MERGE (p)-[:BELONGS_TO_LINE]->(l);
MATCH (p:InsuranceProduct {id: 'prod-002'}) MATCH (l:InsuranceLine {id: 'line-004'}) MERGE (p)-[:BELONGS_TO_LINE]->(l);
MATCH (p:InsuranceProduct {id: 'prod-003'}) MATCH (l:InsuranceLine {id: 'line-001'}) MERGE (p)-[:BELONGS_TO_LINE]->(l);

// === Deckungsdefinitionen ====================================================

MERGE (cd:CoverageDefinition {id: 'cdef-001'})
SET cd.name = 'Feuerdeckung Standard',
    cd.maxSum = 50000000.0,
    cd.deductible = 50000.0,
    cd.exclusions = 'Krieg, Kernenergie, Vorsatz',
    cd.createdAt = datetime('2024-01-01T00:00:00'),
    cd.updatedAt = datetime('2024-01-01T00:00:00');

MERGE (cd:CoverageDefinition {id: 'cdef-002'})
SET cd.name = 'Maschinenbruchdeckung',
    cd.maxSum = 10000000.0,
    cd.deductible = 25000.0,
    cd.exclusions = 'Verschleiss, mangelnde Wartung',
    cd.createdAt = datetime('2024-01-01T00:00:00'),
    cd.updatedAt = datetime('2024-01-01T00:00:00');

MERGE (cd:CoverageDefinition {id: 'cdef-003'})
SET cd.name = 'Kfz-Vollkasko',
    cd.maxSum = 500000.0,
    cd.deductible = 5000.0,
    cd.exclusions = 'Rennen, Vorsatz, nicht zugelassene Fahrer',
    cd.createdAt = datetime('2024-01-01T00:00:00'),
    cd.updatedAt = datetime('2024-01-01T00:00:00');

MERGE (cd:CoverageDefinition {id: 'cdef-004'})
SET cd.name = 'Feuerdeckung XL (Exzedentendeckung)',
    cd.maxSum = 100000000.0,
    cd.deductible = 100000.0,
    cd.exclusions = 'Krieg, Kernenergie, Vorsatz, Erdbeben',
    cd.createdAt = datetime('2024-01-01T00:00:00'),
    cd.updatedAt = datetime('2024-01-01T00:00:00');

// Deckungsdefinition -> Produkt
MATCH (p:InsuranceProduct {id: 'prod-001'}) MATCH (cd:CoverageDefinition {id: 'cdef-001'}) MERGE (p)-[:HAS_COVERAGE_DEF]->(cd);
MATCH (p:InsuranceProduct {id: 'prod-001'}) MATCH (cd:CoverageDefinition {id: 'cdef-002'}) MERGE (p)-[:HAS_COVERAGE_DEF]->(cd);
MATCH (p:InsuranceProduct {id: 'prod-002'}) MATCH (cd:CoverageDefinition {id: 'cdef-003'}) MERGE (p)-[:HAS_COVERAGE_DEF]->(cd);
MATCH (p:InsuranceProduct {id: 'prod-003'}) MATCH (cd:CoverageDefinition {id: 'cdef-004'}) MERGE (p)-[:HAS_COVERAGE_DEF]->(cd);

// === Klauseln ================================================================

MERGE (cl:Clause {id: 'clause-001'})
SET cl.clauseCode = 'GDV-0100',
    cl.title = 'Allgemeine Feuerversicherungsbedingungen (AFB)',
    cl.text = 'Versichert sind Schäden durch Brand, Blitzschlag, Explosion, Anprall oder Absturz eines Luftfahrzeugs.',
    cl.createdAt = datetime('2024-01-01T00:00:00'),
    cl.updatedAt = datetime('2024-01-01T00:00:00');

MERGE (cl:Clause {id: 'clause-002'})
SET cl.clauseCode = 'AVB-MACH',
    cl.title = 'Allgemeine Maschinenversicherungsbedingungen (AMB)',
    cl.text = 'Versichert sind unvorhergesehene Sachschäden an versicherten Maschinen und maschinellen Einrichtungen.',
    cl.createdAt = datetime('2024-01-01T00:00:00'),
    cl.updatedAt = datetime('2024-01-01T00:00:00');

MERGE (cl:Clause {id: 'clause-003'})
SET cl.clauseCode = 'AKB-2024',
    cl.title = 'Allgemeine Bedingungen für die Kfz-Versicherung (AKB)',
    cl.text = 'Versichert sind Schäden am versicherten Fahrzeug durch Unfall, Brand, Diebstahl und Elementarereignisse.',
    cl.createdAt = datetime('2024-01-01T00:00:00'),
    cl.updatedAt = datetime('2024-01-01T00:00:00');

// Klausel -> Deckungsdefinition
MATCH (cd:CoverageDefinition {id: 'cdef-001'}) MATCH (cl:Clause {id: 'clause-001'}) MERGE (cd)-[:HAS_CLAUSE]->(cl);
MATCH (cd:CoverageDefinition {id: 'cdef-002'}) MATCH (cl:Clause {id: 'clause-002'}) MERGE (cd)-[:HAS_CLAUSE]->(cl);
MATCH (cd:CoverageDefinition {id: 'cdef-003'}) MATCH (cl:Clause {id: 'clause-003'}) MERGE (cd)-[:HAS_CLAUSE]->(cl);
MATCH (cd:CoverageDefinition {id: 'cdef-004'}) MATCH (cl:Clause {id: 'clause-001'}) MERGE (cd)-[:HAS_CLAUSE]->(cl);

// === Ausschreibung ===========================================================

MERGE (s:Submission {id: 'sub-001'})
SET s.submissionDate = date('2024-03-01'),
    s.deadline = date('2024-04-15'),
    s.status = 'bound',
    s.description = 'Gesamtpaket Sachversicherung und Flotte für Müller Automotive GmbH inkl. Tochtergesellschaft',
    s.createdAt = datetime('2024-03-01T09:00:00'),
    s.updatedAt = datetime('2024-06-01T14:00:00');

// Ausschreibung -> Makler, Kunde
MATCH (b:Broker {id: 'partner-003'}) MATCH (s:Submission {id: 'sub-001'}) MERGE (b)-[:SUBMITS]->(s);
MATCH (s:Submission {id: 'sub-001'}) MATCH (c:Customer {id: 'partner-001'}) MERGE (s)-[:FOR_CUSTOMER]->(c);

// Ausschreibung -> Deckungswuensche
MATCH (s:Submission {id: 'sub-001'}) MATCH (cr:CoverageRequest {id: 'creq-001'}) MERGE (s)-[:INCLUDES_REQUEST]->(cr);
MATCH (s:Submission {id: 'sub-001'}) MATCH (cr:CoverageRequest {id: 'creq-002'}) MERGE (s)-[:INCLUDES_REQUEST]->(cr);
MATCH (s:Submission {id: 'sub-001'}) MATCH (cr:CoverageRequest {id: 'creq-003'}) MERGE (s)-[:INCLUDES_REQUEST]->(cr);
MATCH (s:Submission {id: 'sub-001'}) MATCH (cr:CoverageRequest {id: 'creq-004'}) MERGE (s)-[:INCLUDES_REQUEST]->(cr);
MATCH (s:Submission {id: 'sub-001'}) MATCH (cr:CoverageRequest {id: 'creq-005'}) MERGE (s)-[:INCLUDES_REQUEST]->(cr);

// === Angebote ================================================================

MERGE (o:Offer {id: 'offer-001'})
SET o.premiumAmount = 450000.0,
    o.validUntil = date('2024-05-15'),
    o.status = 'accepted',
    o.createdAt = datetime('2024-04-01T10:00:00'),
    o.updatedAt = datetime('2024-06-01T14:00:00');

MERGE (o:Offer {id: 'offer-002'})
SET o.premiumAmount = 180000.0,
    o.validUntil = date('2024-05-15'),
    o.status = 'accepted',
    o.createdAt = datetime('2024-04-05T11:00:00'),
    o.updatedAt = datetime('2024-06-01T14:00:00');

MERGE (o:Offer {id: 'offer-003'})
SET o.premiumAmount = 35000.0,
    o.validUntil = date('2024-05-15'),
    o.status = 'accepted',
    o.createdAt = datetime('2024-04-03T09:00:00'),
    o.updatedAt = datetime('2024-06-01T14:00:00');

// Angebot -> Versicherer
MATCH (ins:Insurer {id: 'partner-004'}) MATCH (o:Offer {id: 'offer-001'}) MERGE (ins)-[:RESPONDS_WITH]->(o);
MATCH (ins:Insurer {id: 'partner-005'}) MATCH (o:Offer {id: 'offer-002'}) MERGE (ins)-[:RESPONDS_WITH]->(o);
MATCH (ins:Insurer {id: 'partner-004'}) MATCH (o:Offer {id: 'offer-003'}) MERGE (ins)-[:RESPONDS_WITH]->(o);

// Angebot -> Ausschreibung
MATCH (o:Offer {id: 'offer-001'}) MATCH (s:Submission {id: 'sub-001'}) MERGE (o)-[:FOR_SUBMISSION]->(s);
MATCH (o:Offer {id: 'offer-002'}) MATCH (s:Submission {id: 'sub-001'}) MERGE (o)-[:FOR_SUBMISSION]->(s);
MATCH (o:Offer {id: 'offer-003'}) MATCH (s:Submission {id: 'sub-001'}) MERGE (o)-[:FOR_SUBMISSION]->(s);

// === Deckungsangebote ========================================================

MERGE (co:CoverageOffer {id: 'coffer-001'})
SET co.offeredSum = 30000000.0,
    co.offeredDeductible = 50000.0,
    co.premiumShare = 200000.0,
    co.createdAt = datetime('2024-04-01T10:00:00'),
    co.updatedAt = datetime('2024-04-01T10:00:00');

MERGE (co:CoverageOffer {id: 'coffer-002'})
SET co.offeredSum = 5000000.0,
    co.offeredDeductible = 25000.0,
    co.premiumShare = 150000.0,
    co.createdAt = datetime('2024-04-01T10:00:00'),
    co.updatedAt = datetime('2024-04-01T10:00:00');

MERGE (co:CoverageOffer {id: 'coffer-003'})
SET co.offeredSum = 3000000.0,
    co.offeredDeductible = 25000.0,
    co.premiumShare = 100000.0,
    co.createdAt = datetime('2024-04-01T10:00:00'),
    co.updatedAt = datetime('2024-04-01T10:00:00');

MERGE (co:CoverageOffer {id: 'coffer-004'})
SET co.offeredSum = 30000000.0,
    co.offeredDeductible = 100000.0,
    co.premiumShare = 180000.0,
    co.createdAt = datetime('2024-04-05T11:00:00'),
    co.updatedAt = datetime('2024-04-05T11:00:00');

MERGE (co:CoverageOffer {id: 'coffer-005'})
SET co.offeredSum = 200000.0,
    co.offeredDeductible = 5000.0,
    co.premiumShare = 15000.0,
    co.createdAt = datetime('2024-04-03T09:00:00'),
    co.updatedAt = datetime('2024-04-03T09:00:00');

MERGE (co:CoverageOffer {id: 'coffer-006'})
SET co.offeredSum = 500000.0,
    co.offeredDeductible = 5000.0,
    co.premiumShare = 20000.0,
    co.createdAt = datetime('2024-04-03T09:00:00'),
    co.updatedAt = datetime('2024-04-03T09:00:00');

// CoverageOffer -> Offer
MATCH (o:Offer {id: 'offer-001'}) MATCH (co:CoverageOffer {id: 'coffer-001'}) MERGE (o)-[:CONTAINS]->(co);
MATCH (o:Offer {id: 'offer-001'}) MATCH (co:CoverageOffer {id: 'coffer-002'}) MERGE (o)-[:CONTAINS]->(co);
MATCH (o:Offer {id: 'offer-001'}) MATCH (co:CoverageOffer {id: 'coffer-003'}) MERGE (o)-[:CONTAINS]->(co);
MATCH (o:Offer {id: 'offer-002'}) MATCH (co:CoverageOffer {id: 'coffer-004'}) MERGE (o)-[:CONTAINS]->(co);
MATCH (o:Offer {id: 'offer-003'}) MATCH (co:CoverageOffer {id: 'coffer-005'}) MERGE (o)-[:CONTAINS]->(co);
MATCH (o:Offer {id: 'offer-003'}) MATCH (co:CoverageOffer {id: 'coffer-006'}) MERGE (o)-[:CONTAINS]->(co);

// CoverageOffer -> CoverageRequest
MATCH (co:CoverageOffer {id: 'coffer-001'}) MATCH (cr:CoverageRequest {id: 'creq-001'}) MERGE (co)-[:RESPONDS_TO]->(cr);
MATCH (co:CoverageOffer {id: 'coffer-002'}) MATCH (cr:CoverageRequest {id: 'creq-002'}) MERGE (co)-[:RESPONDS_TO]->(cr);
MATCH (co:CoverageOffer {id: 'coffer-003'}) MATCH (cr:CoverageRequest {id: 'creq-003'}) MERGE (co)-[:RESPONDS_TO]->(cr);
MATCH (co:CoverageOffer {id: 'coffer-004'}) MATCH (cr:CoverageRequest {id: 'creq-001'}) MERGE (co)-[:RESPONDS_TO]->(cr);
MATCH (co:CoverageOffer {id: 'coffer-005'}) MATCH (cr:CoverageRequest {id: 'creq-004'}) MERGE (co)-[:RESPONDS_TO]->(cr);
MATCH (co:CoverageOffer {id: 'coffer-006'}) MATCH (cr:CoverageRequest {id: 'creq-005'}) MERGE (co)-[:RESPONDS_TO]->(cr);

// CoverageOffer -> CoverageDefinition
MATCH (co:CoverageOffer {id: 'coffer-001'}) MATCH (cd:CoverageDefinition {id: 'cdef-001'}) MERGE (co)-[:BASED_ON]->(cd);
MATCH (co:CoverageOffer {id: 'coffer-002'}) MATCH (cd:CoverageDefinition {id: 'cdef-002'}) MERGE (co)-[:BASED_ON]->(cd);
MATCH (co:CoverageOffer {id: 'coffer-003'}) MATCH (cd:CoverageDefinition {id: 'cdef-002'}) MERGE (co)-[:BASED_ON]->(cd);
MATCH (co:CoverageOffer {id: 'coffer-004'}) MATCH (cd:CoverageDefinition {id: 'cdef-004'}) MERGE (co)-[:BASED_ON]->(cd);
MATCH (co:CoverageOffer {id: 'coffer-005'}) MATCH (cd:CoverageDefinition {id: 'cdef-003'}) MERGE (co)-[:BASED_ON]->(cd);
MATCH (co:CoverageOffer {id: 'coffer-006'}) MATCH (cd:CoverageDefinition {id: 'cdef-003'}) MERGE (co)-[:BASED_ON]->(cd);

// === Policen =================================================================

MERGE (pol:Policy {id: 'pol-001'})
SET pol.policyNumber = 'POL-2024-001',
    pol.effectiveDate = date('2024-07-01'),
    pol.expirationDate = date('2025-06-30'),
    pol.totalPremium = 630000.0,
    pol.status = 'active',
    pol.createdAt = datetime('2024-06-01T14:00:00'),
    pol.updatedAt = datetime('2024-06-01T14:00:00');

MERGE (pol:Policy {id: 'pol-002'})
SET pol.policyNumber = 'POL-2024-002',
    pol.effectiveDate = date('2024-07-01'),
    pol.expirationDate = date('2025-06-30'),
    pol.totalPremium = 35000.0,
    pol.status = 'active',
    pol.createdAt = datetime('2024-06-01T14:00:00'),
    pol.updatedAt = datetime('2024-06-01T14:00:00');

// Policy -> Offer
MATCH (pol:Policy {id: 'pol-001'}) MATCH (o:Offer {id: 'offer-001'}) MERGE (pol)-[:BOUND_FROM]->(o);
MATCH (pol:Policy {id: 'pol-002'}) MATCH (o:Offer {id: 'offer-003'}) MERGE (pol)-[:BOUND_FROM]->(o);

// Policy -> Customer
MATCH (pol:Policy {id: 'pol-001'}) MATCH (c:Customer {id: 'partner-001'}) MERGE (pol)-[:INSURES]->(c);
MATCH (pol:Policy {id: 'pol-002'}) MATCH (c:Customer {id: 'partner-001'}) MERGE (pol)-[:INSURES]->(c);

// Policy -> Broker
MATCH (pol:Policy {id: 'pol-001'}) MATCH (b:Broker {id: 'partner-003'}) MERGE (pol)-[:BROKERED_BY]->(b);
MATCH (pol:Policy {id: 'pol-002'}) MATCH (b:Broker {id: 'partner-003'}) MERGE (pol)-[:BROKERED_BY]->(b);

// Policy -> Insurer (mit Anteil)
MATCH (pol:Policy {id: 'pol-001'}) MATCH (ins:Insurer {id: 'partner-004'}) MERGE (pol)-[r:UNDERWRITTEN_BY]->(ins) SET r.share = 70.0;
MATCH (pol:Policy {id: 'pol-001'}) MATCH (ins:Insurer {id: 'partner-005'}) MERGE (pol)-[r:UNDERWRITTEN_BY]->(ins) SET r.share = 30.0;
MATCH (pol:Policy {id: 'pol-002'}) MATCH (ins:Insurer {id: 'partner-004'}) MERGE (pol)-[r:UNDERWRITTEN_BY]->(ins) SET r.share = 100.0;

// === PolicyCoverages =========================================================

MERGE (pc:PolicyCoverage {id: 'pcov-001'})
SET pc.coveredSum = 30000000.0,
    pc.deductible = 50000.0,
    pc.premiumShare = 200000.0,
    pc.createdAt = datetime('2024-06-01T14:00:00'),
    pc.updatedAt = datetime('2024-06-01T14:00:00');

MERGE (pc:PolicyCoverage {id: 'pcov-002'})
SET pc.coveredSum = 5000000.0,
    pc.deductible = 25000.0,
    pc.premiumShare = 150000.0,
    pc.createdAt = datetime('2024-06-01T14:00:00'),
    pc.updatedAt = datetime('2024-06-01T14:00:00');

MERGE (pc:PolicyCoverage {id: 'pcov-003'})
SET pc.coveredSum = 3000000.0,
    pc.deductible = 25000.0,
    pc.premiumShare = 100000.0,
    pc.createdAt = datetime('2024-06-01T14:00:00'),
    pc.updatedAt = datetime('2024-06-01T14:00:00');

MERGE (pc:PolicyCoverage {id: 'pcov-004'})
SET pc.coveredSum = 200000.0,
    pc.deductible = 5000.0,
    pc.premiumShare = 15000.0,
    pc.createdAt = datetime('2024-06-01T14:00:00'),
    pc.updatedAt = datetime('2024-06-01T14:00:00');

MERGE (pc:PolicyCoverage {id: 'pcov-005'})
SET pc.coveredSum = 500000.0,
    pc.deductible = 5000.0,
    pc.premiumShare = 20000.0,
    pc.createdAt = datetime('2024-06-01T14:00:00'),
    pc.updatedAt = datetime('2024-06-01T14:00:00');

// PolicyCoverage -> Policy
MATCH (pol:Policy {id: 'pol-001'}) MATCH (pc:PolicyCoverage {id: 'pcov-001'}) MERGE (pol)-[:HAS_COVERAGE]->(pc);
MATCH (pol:Policy {id: 'pol-001'}) MATCH (pc:PolicyCoverage {id: 'pcov-002'}) MERGE (pol)-[:HAS_COVERAGE]->(pc);
MATCH (pol:Policy {id: 'pol-001'}) MATCH (pc:PolicyCoverage {id: 'pcov-003'}) MERGE (pol)-[:HAS_COVERAGE]->(pc);
MATCH (pol:Policy {id: 'pol-002'}) MATCH (pc:PolicyCoverage {id: 'pcov-004'}) MERGE (pol)-[:HAS_COVERAGE]->(pc);
MATCH (pol:Policy {id: 'pol-002'}) MATCH (pc:PolicyCoverage {id: 'pcov-005'}) MERGE (pol)-[:HAS_COVERAGE]->(pc);

// PolicyCoverage -> Risk
MATCH (pc:PolicyCoverage {id: 'pcov-001'}) MATCH (r:Risk {id: 'risk-001'}) MERGE (pc)-[:COVERS_RISK]->(r);
MATCH (pc:PolicyCoverage {id: 'pcov-002'}) MATCH (r:Risk {id: 'risk-002'}) MERGE (pc)-[:COVERS_RISK]->(r);
MATCH (pc:PolicyCoverage {id: 'pcov-003'}) MATCH (r:Risk {id: 'risk-003'}) MERGE (pc)-[:COVERS_RISK]->(r);
MATCH (pc:PolicyCoverage {id: 'pcov-004'}) MATCH (r:Risk {id: 'risk-004'}) MERGE (pc)-[:COVERS_RISK]->(r);
MATCH (pc:PolicyCoverage {id: 'pcov-005'}) MATCH (r:Risk {id: 'risk-005'}) MERGE (pc)-[:COVERS_RISK]->(r);

// PolicyCoverage -> CoverageDefinition
MATCH (pc:PolicyCoverage {id: 'pcov-001'}) MATCH (cd:CoverageDefinition {id: 'cdef-001'}) MERGE (pc)-[:BASED_ON_DEF]->(cd);
MATCH (pc:PolicyCoverage {id: 'pcov-002'}) MATCH (cd:CoverageDefinition {id: 'cdef-002'}) MERGE (pc)-[:BASED_ON_DEF]->(cd);
MATCH (pc:PolicyCoverage {id: 'pcov-003'}) MATCH (cd:CoverageDefinition {id: 'cdef-002'}) MERGE (pc)-[:BASED_ON_DEF]->(cd);
MATCH (pc:PolicyCoverage {id: 'pcov-004'}) MATCH (cd:CoverageDefinition {id: 'cdef-003'}) MERGE (pc)-[:BASED_ON_DEF]->(cd);
MATCH (pc:PolicyCoverage {id: 'pcov-005'}) MATCH (cd:CoverageDefinition {id: 'cdef-003'}) MERGE (pc)-[:BASED_ON_DEF]->(cd);

// === Nachtrag (Endorsement) ==================================================

MERGE (e:Endorsement {id: 'end-001'})
SET e.endorsementNumber = 'END-2024-001',
    e.effectiveDate = date('2024-10-01'),
    e.changeDescription = 'Nachversicherung: Erweiterung Spritzgussanlage um zweiten Werkzeugwechsler. Erhöhung Versicherungssumme Maschinenbruch von 3 Mio auf 4 Mio EUR.',
    e.premiumAdjustment = 25000.0,
    e.createdAt = datetime('2024-09-15T11:00:00'),
    e.updatedAt = datetime('2024-09-15T11:00:00');

MATCH (pol:Policy {id: 'pol-001'}) MATCH (e:Endorsement {id: 'end-001'}) MERGE (pol)-[:HAS_ENDORSEMENT]->(e);

// === Schadenfall =============================================================

MERGE (cl:Claim {id: 'claim-001'})
SET cl.claimNumber = 'CLM-2024-001',
    cl.claimDate = date('2024-11-15'),
    cl.claimAmount = 780000.0,
    cl.reserveAmount = 800000.0,
    cl.status = 'settled',
    cl.description = 'Maschinenbruch CNC-Fräszentrum DMG MORI: Spindelschaden durch Werkzeugbruch. Totalschaden Spindeleinheit, Nebenkosten Demontage/Montage.',
    cl.createdAt = datetime('2024-11-16T08:00:00'),
    cl.updatedAt = datetime('2025-02-28T16:00:00');

// Claim -> Policy, Object, Coverage
MATCH (cl:Claim {id: 'claim-001'}) MATCH (pol:Policy {id: 'pol-001'}) MERGE (cl)-[:AGAINST_POLICY]->(pol);
MATCH (cl:Claim {id: 'claim-001'}) MATCH (o:InsurableObject {id: 'obj-002'}) MERGE (cl)-[:AFFECTS_OBJECT]->(o);
MATCH (cl:Claim {id: 'claim-001'}) MATCH (pc:PolicyCoverage {id: 'pcov-002'}) MERGE (cl)-[:AFFECTS_COVERAGE]->(pc);

// === Regulierungsschritte ====================================================

MERGE (cs:ClaimSettlement {id: 'settle-001'})
SET cs.settlementDate = date('2025-01-10'),
    cs.amount = 400000.0,
    cs.settlementType = 'partial',
    cs.description = 'Teilregulierung: Sofortmassnahmen, Demontage alte Spindel, Bestellung neue Spindeleinheit',
    cs.createdAt = datetime('2025-01-10T14:00:00'),
    cs.updatedAt = datetime('2025-01-10T14:00:00');

MERGE (cs:ClaimSettlement {id: 'settle-002'})
SET cs.settlementDate = date('2025-02-28'),
    cs.amount = 350000.0,
    cs.settlementType = 'final',
    cs.description = 'Schlussregulierung: Montage neue Spindeleinheit, Inbetriebnahme, Gutachterkosten. Gesamtschaden 750.000 EUR (abzgl. SB 25.000 EUR)',
    cs.createdAt = datetime('2025-02-28T16:00:00'),
    cs.updatedAt = datetime('2025-02-28T16:00:00');

MATCH (cl:Claim {id: 'claim-001'}) MATCH (cs:ClaimSettlement {id: 'settle-001'}) MERGE (cl)-[:HAS_SETTLEMENT]->(cs);
MATCH (cl:Claim {id: 'claim-001'}) MATCH (cs:ClaimSettlement {id: 'settle-002'}) MERGE (cl)-[:HAS_SETTLEMENT]->(cs);

// === Flexible Attribute ======================================================

MERGE (at:AttributeTemplate {id: 'tmpl-001'})
SET at.templateName = 'Tragfähigkeit Boden',
    at.dataType = 'Float',
    at.unit = 't/m²',
    at.createdAt = datetime('2024-01-20T08:00:00'),
    at.updatedAt = datetime('2024-01-20T08:00:00');

MERGE (at:AttributeTemplate {id: 'tmpl-002'})
SET at.templateName = 'Spindelgeschwindigkeit',
    at.dataType = 'Integer',
    at.unit = 'U/min',
    at.createdAt = datetime('2024-01-20T08:00:00'),
    at.updatedAt = datetime('2024-01-20T08:00:00');

MERGE (ca:CustomAttribute {id: 'attr-001'})
SET ca.value = '5.0',
    ca.createdAt = datetime('2024-01-20T08:00:00'),
    ca.updatedAt = datetime('2024-01-20T08:00:00');

MERGE (ca:CustomAttribute {id: 'attr-002'})
SET ca.value = '12000',
    ca.createdAt = datetime('2024-01-20T08:00:00'),
    ca.updatedAt = datetime('2024-01-20T08:00:00');

// CustomAttribute -> InsurableObject
MATCH (o:InsurableObject {id: 'obj-001'}) MATCH (ca:CustomAttribute {id: 'attr-001'}) MERGE (o)-[:HAS_ATTRIBUTE]->(ca);
MATCH (o:InsurableObject {id: 'obj-002'}) MATCH (ca:CustomAttribute {id: 'attr-002'}) MERGE (o)-[:HAS_ATTRIBUTE]->(ca);

// CustomAttribute -> AttributeTemplate
MATCH (ca:CustomAttribute {id: 'attr-001'}) MATCH (at:AttributeTemplate {id: 'tmpl-001'}) MERGE (ca)-[:DEFINED_BY]->(at);
MATCH (ca:CustomAttribute {id: 'attr-002'}) MATCH (at:AttributeTemplate {id: 'tmpl-002'}) MERGE (ca)-[:DEFINED_BY]->(at);
