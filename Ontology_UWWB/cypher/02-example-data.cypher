// =============================================================================
// UWWB Ontology - Beispiel-Szenario "Festival-Saison 2026"
// Stand: 2026-04-17 | Version: 1.0
// =============================================================================
// Szenario: EventMedia Holding AG (Konzern, 3 Töchter) lässt drei Objekte
//   (2 Veranstaltungen + 1 Produktionshalle) über den Makler Mueller & Partner
//   bei Allianz (Lead 60%) + HDI (Follow 40%) versichern.
//
//   Bewusst enthaltene Spezialfälle:
//     - Deckungslücke: Jazz Summer 2026 / Cyber → nur requested, nie offered
//     - Mehrfachdeckung: Rock Night / Haftpflicht → 2 aktive Coverages
//     - Teilschaden: Sturmschaden mit Endorsement (Teilzahlung)
//     - KI-Extraktion mit niedriger Confidence auf einem Feld
//
// Idempotent (MERGE) – kann mehrfach ausgeführt werden.
// =============================================================================

// === 0. Sparten (Line) =====================================================
MERGE (l1:Line {id: 'line-001'}) SET l1.name = 'Veranstaltung', l1.description = 'Event-/Veranstaltungs-Versicherung', l1.active = true, l1.createdAt = datetime(), l1.updatedAt = datetime();
MERGE (l2:Line {id: 'line-002'}) SET l2.name = 'Sach', l2.description = 'Sach-/Gebäude-Versicherung', l2.active = true, l2.createdAt = datetime(), l2.updatedAt = datetime();
MERGE (l3:Line {id: 'line-003'}) SET l3.name = 'Haftpflicht', l3.description = 'Betriebs-Haftpflicht', l3.active = true, l3.createdAt = datetime(), l3.updatedAt = datetime();

// === 1. Template-Nodes =====================================================
MERGE (ot1:ObjectType {code: 'EVENT'}) SET ot1.name = 'Veranstaltung', ot1.requiredFields = ['titel','datum','ort','besucher'], ot1.optionalFields = ['dauerTage','outdoor'];
MERGE (ot2:ObjectType {code: 'BUILDING'}) SET ot2.name = 'Produktionshalle/Gebäude', ot2.requiredFields = ['adresse','flaecheQm','bauJahr'], ot2.optionalFields = ['brandmeldeanlage','sprinkleranlage'];
MERGE (ot3:ObjectType {code: 'VEHICLE'}) SET ot3.name = 'Fahrzeug', ot3.requiredFields = ['kennzeichen','fahrzeugtyp','baujahr'], ot3.optionalFields = ['leistungKW'];

MERGE (pt1:PerilType {code: 'FIRE'}) SET pt1.name = 'Feuer', pt1.description = 'Brand, Blitz, Explosion';
MERGE (pt2:PerilType {code: 'STORM'}) SET pt2.name = 'Unwetter', pt2.description = 'Sturm, Hagel, Starkregen';
MERGE (pt3:PerilType {code: 'LIABILITY'}) SET pt3.name = 'Haftpflicht', pt3.description = 'Personen- und Sachschäden Dritter';
MERGE (pt4:PerilType {code: 'EVENT_CANCELLATION'}) SET pt4.name = 'Veranstaltungsausfall', pt4.description = 'Absage wegen Wetter, Krankheit, höhere Gewalt';
MERGE (pt5:PerilType {code: 'CYBER'}) SET pt5.name = 'Cyber', pt5.description = 'Cyberangriff, Datenverlust, Betriebsunterbrechung';

// === 2. Interne Nutzer & UW-Guidelines =====================================
MERGE (u1:User {id: 'user-001'}) SET u1.authId = 'anna.schmidt@insurer.de', u1.name = 'Anna Schmidt', u1.signingLimit = 5000000.0, u1.active = true, u1.createdAt = datetime(), u1.updatedAt = datetime();
MERGE (u2:User {id: 'user-002'}) SET u2.authId = 'tom.becker@insurer.de', u2.name = 'Tom Becker', u2.signingLimit = 10000000.0, u2.active = true, u2.createdAt = datetime(), u2.updatedAt = datetime();

MATCH (u1:User {id: 'user-001'}), (l1:Line {id: 'line-001'}) MERGE (u1)-[:MEMBER_OF]->(l1);
MATCH (u2:User {id: 'user-002'}), (l2:Line {id: 'line-002'}) MERGE (u2)-[:MEMBER_OF]->(l2);

MERGE (g1:UnderwritingGuideline {id: 'guide-001'}) SET g1.version = '2026-Q1', g1.content = 'Event-UW: max. 15 Mio. Sumversicherung, Outdoor-Events mit Wetter-Klausel', g1.validFrom = date('2026-01-01'), g1.isActive = true, g1.createdAt = datetime(), g1.updatedAt = datetime();
MERGE (g2:UnderwritingGuideline {id: 'guide-002'}) SET g2.version = '2026-Q1', g2.content = 'Sach-UW: Brandmelde- oder Sprinkleranlage Pflicht ab 5.000 qm', g2.validFrom = date('2026-01-01'), g2.isActive = true, g2.createdAt = datetime(), g2.updatedAt = datetime();

MATCH (l1:Line {id: 'line-001'}), (g1:UnderwritingGuideline {id: 'guide-001'}) MERGE (l1)-[:GOVERNED_BY]->(g1);
MATCH (l2:Line {id: 'line-002'}), (g2:UnderwritingGuideline {id: 'guide-002'}) MERGE (l2)-[:GOVERNED_BY]->(g2);
MATCH (u1:User {id: 'user-001'}), (g1:UnderwritingGuideline {id: 'guide-001'}) MERGE (u1)-[:AUTHORED]->(g1);
MATCH (u2:User {id: 'user-002'}), (g2:UnderwritingGuideline {id: 'guide-002'}) MERGE (u2)-[:AUTHORED]->(g2);

// === 3. Broker, Insurer, Produkte ==========================================
MERGE (b:Broker {id: 'broker-001'}) SET b.name = 'Broker Mueller & Partner GmbH', b.registrationNumber = 'HRB 45678', b.street = 'Koenigsallee 12', b.postalCode = '40212', b.city = 'Duesseldorf', b.country = 'DE', b.sanctionStatus = 'Geprueft - unauffaellig', b.accreditationStatus = 'Akkreditiert', b.verificationStatus = 'Verifiziert', b.hitRatio = 32.0, b.createdAt = datetime(), b.updatedAt = datetime();

MERGE (i1:Insurer {id: 'insurer-001'}) SET i1.name = 'Allianz Global Corporate', i1.registrationNumber = 'HRB 10001', i1.city = 'Muenchen', i1.country = 'DE', i1.sanctionStatus = 'Geprueft - unauffaellig', i1.accreditationStatus = 'Akkreditiert', i1.createdAt = datetime(), i1.updatedAt = datetime();
MERGE (i2:Insurer {id: 'insurer-002'}) SET i2.name = 'HDI Global SE', i2.registrationNumber = 'HRB 20002', i2.city = 'Hannover', i2.country = 'DE', i2.sanctionStatus = 'Geprueft - unauffaellig', i2.accreditationStatus = 'Akkreditiert', i2.createdAt = datetime(), i2.updatedAt = datetime();

MERGE (p1:Product {id: 'product-001'}) SET p1.name = 'EventCover Pro', p1.status = 'Aktiv', p1.description = 'Rundum-Deckung für Großveranstaltungen', p1.validFrom = date('2026-01-01'), p1.createdAt = datetime(), p1.updatedAt = datetime();
MERGE (p2:Product {id: 'product-002'}) SET p2.name = 'PropertyShield Industrial', p2.status = 'Aktiv', p2.description = 'Sachversicherung für Produktionsanlagen', p2.validFrom = date('2026-01-01'), p2.createdAt = datetime(), p2.updatedAt = datetime();
MERGE (p3:Product {id: 'product-003'}) SET p3.name = 'GenLiability Plus', p3.status = 'Aktiv', p3.description = 'Betriebs-Haftpflicht mit Erweiterungen', p3.validFrom = date('2026-01-01'), p3.createdAt = datetime(), p3.updatedAt = datetime();

MATCH (p1:Product {id: 'product-001'}), (l:Line {id: 'line-001'}) MERGE (p1)-[:IN_LINE]->(l);
MATCH (p2:Product {id: 'product-002'}), (l:Line {id: 'line-002'}) MERGE (p2)-[:IN_LINE]->(l);
MATCH (p3:Product {id: 'product-003'}), (l:Line {id: 'line-003'}) MERGE (p3)-[:IN_LINE]->(l);

// === 4. Konzernstruktur: EventMedia Holding ================================
MERGE (c0:Company {id: 'company-000'}) SET c0.name = 'EventMedia Holding AG', c0.registrationNumber = 'HRB 99001', c0.street = 'Corporate Plaza 1', c0.postalCode = '40213', c0.city = 'Duesseldorf', c0.country = 'DE', c0.industry = 'Media & Entertainment (Konzern)', c0.annualRevenue = 180000000.0, c0.employeeCount = 450, c0.createdAt = datetime(), c0.updatedAt = datetime();
MERGE (c1:Company {id: 'company-001'}) SET c1.name = 'Rock Night Events GmbH', c1.registrationNumber = 'HRB 12345', c1.street = 'Hafenstrasse 3', c1.postalCode = '20457', c1.city = 'Hamburg', c1.country = 'DE', c1.industry = 'Event Management', c1.annualRevenue = 42000000.0, c1.employeeCount = 85, c1.createdAt = datetime(), c1.updatedAt = datetime();
MERGE (c2:Company {id: 'company-002'}) SET c2.name = 'Festival Organizers AG', c2.registrationNumber = 'HRB 87654', c2.street = 'Alexanderplatz 5', c2.postalCode = '10178', c2.city = 'Berlin', c2.country = 'DE', c2.industry = 'Event Management', c2.annualRevenue = 58000000.0, c2.employeeCount = 140, c2.createdAt = datetime(), c2.updatedAt = datetime();

MATCH (c0:Company {id: 'company-000'}), (c1:Company {id: 'company-001'}) MERGE (c0)-[:PARENT_OF]->(c1);
MATCH (c0:Company {id: 'company-000'}), (c2:Company {id: 'company-002'}) MERGE (c0)-[:PARENT_OF]->(c2);

// === 5. Objekte + Risiken ==================================================
MERGE (o1:Object {id: 'object-001'}) SET o1.name = 'Rock Night 2026', o1.objectType = 'EVENT', o1.context = 'Direkteinreichung', o1.titel = 'Rock Night 2026', o1.datum = date('2026-08-15'), o1.ort = 'Hamburg', o1.besucher = 12000, o1.outdoor = true, o1.createdAt = datetime(), o1.updatedAt = datetime();
MERGE (o2:Object {id: 'object-002'}) SET o2.name = 'Jazz Summer 2026', o2.objectType = 'EVENT', o2.context = 'Direkteinreichung', o2.titel = 'Jazz Summer 2026', o2.datum = date('2026-07-20'), o2.ort = 'Hamburg', o2.besucher = 4500, o2.outdoor = true, o2.createdAt = datetime(), o2.updatedAt = datetime();
MERGE (o3:Object {id: 'object-003'}) SET o3.name = 'Halle A Berlin', o3.objectType = 'BUILDING', o3.context = 'Direkteinreichung', o3.adresse = 'Alexanderplatz 5, 10178 Berlin', o3.flaecheQm = 8500, o3.bauJahr = 2015, o3.brandmeldeanlage = true, o3.sprinkleranlage = true, o3.createdAt = datetime(), o3.updatedAt = datetime();

MATCH (c1:Company {id: 'company-001'}), (o1:Object {id: 'object-001'}) MERGE (c1)-[:OWNS]->(o1);
MATCH (c1:Company {id: 'company-001'}), (o2:Object {id: 'object-002'}) MERGE (c1)-[:OWNS]->(o2);
MATCH (c2:Company {id: 'company-002'}), (o3:Object {id: 'object-003'}) MERGE (c2)-[:OWNS]->(o3);

MATCH (o1:Object {id: 'object-001'}), (ot:ObjectType {code: 'EVENT'}) MERGE (o1)-[:OF_TYPE]->(ot);
MATCH (o2:Object {id: 'object-002'}), (ot:ObjectType {code: 'EVENT'}) MERGE (o2)-[:OF_TYPE]->(ot);
MATCH (o3:Object {id: 'object-003'}), (ot:ObjectType {code: 'BUILDING'}) MERGE (o3)-[:OF_TYPE]->(ot);

// Risiken
MERGE (r1:Risk {id: 'risk-001'}) SET r1.peril = 'EVENT_CANCELLATION', r1.schadenerwartungTsd = 850.0, r1.createdAt = datetime(), r1.updatedAt = datetime();
MERGE (r2:Risk {id: 'risk-002'}) SET r2.peril = 'LIABILITY', r2.schadenerwartungTsd = 500.0, r2.createdAt = datetime(), r2.updatedAt = datetime();
MERGE (r3:Risk {id: 'risk-003'}) SET r3.peril = 'EVENT_CANCELLATION', r3.schadenerwartungTsd = 300.0, r3.createdAt = datetime(), r3.updatedAt = datetime();
MERGE (r4:Risk {id: 'risk-004'}) SET r4.peril = 'CYBER', r4.schadenerwartungTsd = 200.0, r4.createdAt = datetime(), r4.updatedAt = datetime();
MERGE (r5:Risk {id: 'risk-005'}) SET r5.peril = 'FIRE', r5.schadenerwartungTsd = 2500.0, r5.createdAt = datetime(), r5.updatedAt = datetime();
MERGE (r6:Risk {id: 'risk-006'}) SET r6.peril = 'STORM', r6.schadenerwartungTsd = 400.0, r6.createdAt = datetime(), r6.updatedAt = datetime();

MATCH (o1:Object {id: 'object-001'}), (r1:Risk {id: 'risk-001'}) MERGE (o1)-[:HAS_RISK]->(r1);
MATCH (o1:Object {id: 'object-001'}), (r2:Risk {id: 'risk-002'}) MERGE (o1)-[:HAS_RISK]->(r2);
MATCH (o2:Object {id: 'object-002'}), (r3:Risk {id: 'risk-003'}) MERGE (o2)-[:HAS_RISK]->(r3);
MATCH (o2:Object {id: 'object-002'}), (r4:Risk {id: 'risk-004'}) MERGE (o2)-[:HAS_RISK]->(r4);
MATCH (o3:Object {id: 'object-003'}), (r5:Risk {id: 'risk-005'}) MERGE (o3)-[:HAS_RISK]->(r5);
MATCH (o3:Object {id: 'object-003'}), (r6:Risk {id: 'risk-006'}) MERGE (o3)-[:HAS_RISK]->(r6);

MATCH (r:Risk {id: 'risk-001'}), (pt:PerilType {code: 'EVENT_CANCELLATION'}) MERGE (r)-[:PERIL_TYPE]->(pt);
MATCH (r:Risk {id: 'risk-002'}), (pt:PerilType {code: 'LIABILITY'}) MERGE (r)-[:PERIL_TYPE]->(pt);
MATCH (r:Risk {id: 'risk-003'}), (pt:PerilType {code: 'EVENT_CANCELLATION'}) MERGE (r)-[:PERIL_TYPE]->(pt);
MATCH (r:Risk {id: 'risk-004'}), (pt:PerilType {code: 'CYBER'}) MERGE (r)-[:PERIL_TYPE]->(pt);
MATCH (r:Risk {id: 'risk-005'}), (pt:PerilType {code: 'FIRE'}) MERGE (r)-[:PERIL_TYPE]->(pt);
MATCH (r:Risk {id: 'risk-006'}), (pt:PerilType {code: 'STORM'}) MERGE (r)-[:PERIL_TYPE]->(pt);

// === 6. Tender + Submission ================================================
MERGE (t:Tender {id: 'tender-001'}) SET t.name = 'Festival-Saison 2026 EventMedia', t.status = 'Aktiv', t.description = '3 Objekte, 3 Sparten, Slip-Ausschreibung', t.createdAt = datetime(), t.updatedAt = datetime();
MATCH (t:Tender {id: 'tender-001'}), (b:Broker {id: 'broker-001'}) MERGE (t)-[:ISSUED_BY]->(b);
MATCH (t:Tender {id: 'tender-001'}), (c0:Company {id: 'company-000'}) MERGE (t)-[:FOR_COMPANY]->(c0);

MERGE (s:Submission {id: 'submission-001'}) SET s.status = 'Bewertet', s.transactionType = 'Neugeschaeft', s.receivedAt = datetime('2026-04-10T08:15:00Z'), s.emailText = 'Slip-Unterlagen Festival-Saison 2026 (3 Events, 1 Halle)', s.compositeScore = 0.82, s.routingDecision = 'Automatische Annahme', s.rank = 1, s.approvalDecision = 'Freigegeben', s.approvedAt = datetime('2026-04-11T10:00:00Z'), s.createdAt = datetime(), s.updatedAt = datetime();
MATCH (s:Submission {id: 'submission-001'}), (t:Tender {id: 'tender-001'}) MERGE (s)-[:IN_TENDER]->(t);
MATCH (s:Submission {id: 'submission-001'}), (b:Broker {id: 'broker-001'}) MERGE (s)-[:SUBMITTED_BY]->(b);
MATCH (s:Submission {id: 'submission-001'}), (c0:Company {id: 'company-000'}) MERGE (s)-[:COVERS_COMPANY]->(c0);
MATCH (s:Submission {id: 'submission-001'}), (i1:Insurer {id: 'insurer-001'}) MERGE (s)-[:ADDRESSED_TO]->(i1);
MATCH (s:Submission {id: 'submission-001'}), (i2:Insurer {id: 'insurer-002'}) MERGE (s)-[:ADDRESSED_TO]->(i2);
MATCH (s:Submission {id: 'submission-001'}), (u:User {id: 'user-001'}) MERGE (s)-[:APPROVED_BY]->(u);
MATCH (s:Submission {id: 'submission-001'}), (o1:Object {id: 'object-001'}) MERGE (s)-[:HAS_OBJECT]->(o1);
MATCH (s:Submission {id: 'submission-001'}), (o2:Object {id: 'object-002'}) MERGE (s)-[:HAS_OBJECT]->(o2);
MATCH (s:Submission {id: 'submission-001'}), (o3:Object {id: 'object-003'}) MERGE (s)-[:HAS_OBJECT]->(o3);

// === 7. Quote ==============================================================
MERGE (q:Quote {id: 'quote-001'}) SET q.status = 'Angenommen', q.premium = 380000.0, q.validUntil = date('2026-06-30'), q.createdAt = datetime(), q.updatedAt = datetime();
MATCH (s:Submission {id: 'submission-001'}), (q:Quote {id: 'quote-001'}) MERGE (s)-[:PRODUCED]->(q);
MATCH (q:Quote {id: 'quote-001'}), (p:Product {id: 'product-001'}) MERGE (q)-[:FOR_PRODUCT]->(p);
MATCH (q:Quote {id: 'quote-001'}), (i1:Insurer {id: 'insurer-001'}) MERGE (q)-[r:UNDERWRITTEN_BY]->(i1) SET r.sharePercent = 60.0, r.leadInsurer = true;
MATCH (q:Quote {id: 'quote-001'}), (i2:Insurer {id: 'insurer-002'}) MERGE (q)-[r:UNDERWRITTEN_BY]->(i2) SET r.sharePercent = 40.0, r.leadInsurer = false;

// === 8. Policies (2 – Event-Police und Sach-Police) ========================
MERGE (pol1:Policy {id: 'policy-001'}) SET pol1.policyNumber = 'POL-2026-EVT-001', pol1.status = 'Aktiv', pol1.startDate = date('2026-06-01'), pol1.endDate = date('2026-12-31'), pol1.annualPremium = 220000.0, pol1.createdAt = datetime(), pol1.updatedAt = datetime();
MERGE (pol2:Policy {id: 'policy-002'}) SET pol2.policyNumber = 'POL-2026-PROP-001', pol2.status = 'Aktiv', pol2.startDate = date('2026-06-01'), pol2.endDate = date('2027-05-31'), pol2.annualPremium = 160000.0, pol2.createdAt = datetime(), pol2.updatedAt = datetime();

MATCH (q:Quote {id: 'quote-001'}), (pol:Policy {id: 'policy-001'}) MERGE (q)-[:REALIZED_AS]->(pol);
MATCH (pol:Policy {id: 'policy-001'}), (p:Product {id: 'product-001'}) MERGE (pol)-[:ON_PRODUCT]->(p);
MATCH (pol:Policy {id: 'policy-002'}), (p:Product {id: 'product-002'}) MERGE (pol)-[:ON_PRODUCT]->(p);

// Co-Insurance beide Policen
MATCH (pol:Policy {id: 'policy-001'}), (i1:Insurer {id: 'insurer-001'}) MERGE (pol)-[r:UNDERWRITTEN_BY]->(i1) SET r.sharePercent = 60.0, r.leadInsurer = true, r.premiumShare = 132000.0;
MATCH (pol:Policy {id: 'policy-001'}), (i2:Insurer {id: 'insurer-002'}) MERGE (pol)-[r:UNDERWRITTEN_BY]->(i2) SET r.sharePercent = 40.0, r.leadInsurer = false, r.premiumShare = 88000.0;
MATCH (pol:Policy {id: 'policy-002'}), (i1:Insurer {id: 'insurer-001'}) MERGE (pol)-[r:UNDERWRITTEN_BY]->(i1) SET r.sharePercent = 50.0, r.leadInsurer = true, r.premiumShare = 80000.0;
MATCH (pol:Policy {id: 'policy-002'}), (i2:Insurer {id: 'insurer-002'}) MERGE (pol)-[r:UNDERWRITTEN_BY]->(i2) SET r.sharePercent = 50.0, r.leadInsurer = false, r.premiumShare = 80000.0;

// === 9. Coverages (Lifecycle: requested → offered → bound) =================
// -- Risk 1 (Rock Night / EVENT_CANCELLATION): kompletter Lifecycle
MERGE (cov1r:Coverage {id: 'cov-001-req'}) SET cov1r.lifecycleStatus = 'requested', cov1r.coverageType = 'Veranstaltungsausfall-Basis', cov1r.sumInsured = 1500000.0, cov1r.createdAt = datetime(), cov1r.updatedAt = datetime();
MERGE (cov1o:Coverage {id: 'cov-001-off'}) SET cov1o.lifecycleStatus = 'offered', cov1o.coverageType = 'Veranstaltungsausfall-Basis', cov1o.sumInsured = 1200000.0, cov1o.deductible = 10000.0, cov1o.premium = 45000.0, cov1o.specialConditions = 'Wetterklausel, Selbstbehalt 10k', cov1o.createdAt = datetime(), cov1o.updatedAt = datetime();
MERGE (cov1b:Coverage {id: 'cov-001-bnd'}) SET cov1b.lifecycleStatus = 'active', cov1b.coverageType = 'Veranstaltungsausfall-Basis', cov1b.sumInsured = 1200000.0, cov1b.deductible = 10000.0, cov1b.premium = 45000.0, cov1b.specialConditions = 'Wetterklausel, Selbstbehalt 10k', cov1b.createdAt = datetime(), cov1b.updatedAt = datetime();
MATCH (r1:Risk {id: 'risk-001'}), (cov:Coverage {id: 'cov-001-req'}) MERGE (r1)-[:COVERED_BY]->(cov);
MATCH (r1:Risk {id: 'risk-001'}), (cov:Coverage {id: 'cov-001-off'}) MERGE (r1)-[:COVERED_BY]->(cov);
MATCH (r1:Risk {id: 'risk-001'}), (cov:Coverage {id: 'cov-001-bnd'}) MERGE (r1)-[:COVERED_BY]->(cov);
MATCH (cov:Coverage {id: 'cov-001-req'}), (s:Submission {id: 'submission-001'}) MERGE (cov)-[:REQUESTED_IN]->(s);
MATCH (cov:Coverage {id: 'cov-001-off'}), (q:Quote {id: 'quote-001'}) MERGE (cov)-[:OFFERED_IN]->(q);
MATCH (cov:Coverage {id: 'cov-001-bnd'}), (pol:Policy {id: 'policy-001'}) MERGE (cov)-[:BOUND_IN]->(pol);
MATCH (cov:Coverage {id: 'cov-001-off'}), (req:Coverage {id: 'cov-001-req'}) MERGE (cov)-[:DERIVED_FROM {changeReason: 'Reduzierung Versicherungssumme + SB'}]->(req);
MATCH (cov:Coverage {id: 'cov-001-bnd'}), (off:Coverage {id: 'cov-001-off'}) MERGE (cov)-[:DERIVED_FROM {changeReason: 'Vertragsabschluss 1:1'}]->(off);
MATCH (cov:Coverage {id: 'cov-001-req'}), (p:Product {id: 'product-001'}) MERGE (cov)-[:BASED_ON]->(p);
MATCH (cov:Coverage {id: 'cov-001-off'}), (p:Product {id: 'product-001'}) MERGE (cov)-[:BASED_ON]->(p);
MATCH (cov:Coverage {id: 'cov-001-bnd'}), (p:Product {id: 'product-001'}) MERGE (cov)-[:BASED_ON]->(p);

// -- Risk 2 (Rock Night / LIABILITY): Mehrfachdeckung (2 aktive Coverages!)
MERGE (cov2b1:Coverage {id: 'cov-002-bnd-a'}) SET cov2b1.lifecycleStatus = 'active', cov2b1.coverageType = 'Event-Haftpflicht-Basis', cov2b1.sumInsured = 5000000.0, cov2b1.deductible = 2500.0, cov2b1.premium = 18000.0, cov2b1.createdAt = datetime(), cov2b1.updatedAt = datetime();
MERGE (cov2b2:Coverage {id: 'cov-002-bnd-b'}) SET cov2b2.lifecycleStatus = 'active', cov2b2.coverageType = 'Event-Haftpflicht-Excess', cov2b2.sumInsured = 10000000.0, cov2b2.deductible = 5000000.0, cov2b2.premium = 9000.0, cov2b2.specialConditions = 'Excess-Layer ueber Basis', cov2b2.createdAt = datetime(), cov2b2.updatedAt = datetime();
MATCH (r2:Risk {id: 'risk-002'}), (cov:Coverage {id: 'cov-002-bnd-a'}) MERGE (r2)-[:COVERED_BY]->(cov);
MATCH (r2:Risk {id: 'risk-002'}), (cov:Coverage {id: 'cov-002-bnd-b'}) MERGE (r2)-[:COVERED_BY]->(cov);
MATCH (cov:Coverage {id: 'cov-002-bnd-a'}), (pol:Policy {id: 'policy-001'}) MERGE (cov)-[:BOUND_IN]->(pol);
MATCH (cov:Coverage {id: 'cov-002-bnd-b'}), (pol:Policy {id: 'policy-001'}) MERGE (cov)-[:BOUND_IN]->(pol);
MATCH (cov:Coverage {id: 'cov-002-bnd-a'}), (p:Product {id: 'product-003'}) MERGE (cov)-[:BASED_ON]->(p);
MATCH (cov:Coverage {id: 'cov-002-bnd-b'}), (p:Product {id: 'product-003'}) MERGE (cov)-[:BASED_ON]->(p);

// -- Risk 3 (Jazz Summer / EVENT_CANCELLATION): nur bound
MERGE (cov3b:Coverage {id: 'cov-003-bnd'}) SET cov3b.lifecycleStatus = 'active', cov3b.coverageType = 'Veranstaltungsausfall-Basis', cov3b.sumInsured = 400000.0, cov3b.deductible = 5000.0, cov3b.premium = 12000.0, cov3b.createdAt = datetime(), cov3b.updatedAt = datetime();
MATCH (r3:Risk {id: 'risk-003'}), (cov:Coverage {id: 'cov-003-bnd'}) MERGE (r3)-[:COVERED_BY]->(cov);
MATCH (cov:Coverage {id: 'cov-003-bnd'}), (pol:Policy {id: 'policy-001'}) MERGE (cov)-[:BOUND_IN]->(pol);
MATCH (cov:Coverage {id: 'cov-003-bnd'}), (p:Product {id: 'product-001'}) MERGE (cov)-[:BASED_ON]->(p);

// -- Risk 4 (Jazz Summer / CYBER): Deckungslücke! Nur requested, kein offered
MERGE (cov4r:Coverage {id: 'cov-004-req'}) SET cov4r.lifecycleStatus = 'requested', cov4r.coverageType = 'Cyber-Event-Basis', cov4r.sumInsured = 500000.0, cov4r.createdAt = datetime(), cov4r.updatedAt = datetime();
MATCH (r4:Risk {id: 'risk-004'}), (cov:Coverage {id: 'cov-004-req'}) MERGE (r4)-[:COVERED_BY]->(cov);
MATCH (cov:Coverage {id: 'cov-004-req'}), (s:Submission {id: 'submission-001'}) MERGE (cov)-[:REQUESTED_IN]->(s);

// -- Risk 5 (Halle A / FIRE): bound
MERGE (cov5b:Coverage {id: 'cov-005-bnd'}) SET cov5b.lifecycleStatus = 'active', cov5b.coverageType = 'Feuer-Industrie-Allgefahren', cov5b.sumInsured = 12000000.0, cov5b.deductible = 25000.0, cov5b.premium = 85000.0, cov5b.createdAt = datetime(), cov5b.updatedAt = datetime();
MATCH (r5:Risk {id: 'risk-005'}), (cov:Coverage {id: 'cov-005-bnd'}) MERGE (r5)-[:COVERED_BY]->(cov);
MATCH (cov:Coverage {id: 'cov-005-bnd'}), (pol:Policy {id: 'policy-002'}) MERGE (cov)-[:BOUND_IN]->(pol);
MATCH (cov:Coverage {id: 'cov-005-bnd'}), (p:Product {id: 'product-002'}) MERGE (cov)-[:BASED_ON]->(p);

// -- Risk 6 (Halle A / STORM): bound
MERGE (cov6b:Coverage {id: 'cov-006-bnd'}) SET cov6b.lifecycleStatus = 'active', cov6b.coverageType = 'Sturm-Hagel', cov6b.sumInsured = 4000000.0, cov6b.deductible = 10000.0, cov6b.premium = 22000.0, cov6b.createdAt = datetime(), cov6b.updatedAt = datetime();
MATCH (r6:Risk {id: 'risk-006'}), (cov:Coverage {id: 'cov-006-bnd'}) MERGE (r6)-[:COVERED_BY]->(cov);
MATCH (cov:Coverage {id: 'cov-006-bnd'}), (pol:Policy {id: 'policy-002'}) MERGE (cov)-[:BOUND_IN]->(pol);
MATCH (cov:Coverage {id: 'cov-006-bnd'}), (p:Product {id: 'product-002'}) MERGE (cov)-[:BASED_ON]->(p);

// === 10. Claim (Sturmschaden Rock Night 2026) ==============================
// Hinweis: claim ist hier beispielhaft an die EVENT-Police (policy-001) gehaengt,
// trifft aber das Risk EVENT_CANCELLATION nach Unwetter-Veranstaltungsabsage.
MERGE (cl:Claim {id: 'claim-001'}) SET cl.claimNumber = 'CLM-2026-0001', cl.status = 'Teilreguliert', cl.incidentDate = date('2026-08-15'), cl.claimAmount = 680000.0, cl.reserveAmount = 200000.0, cl.description = 'Unwetter am Veranstaltungstag, Teilabsage der Rock Night 2026', cl.createdAt = datetime(), cl.updatedAt = datetime();
MATCH (pol:Policy {id: 'policy-001'}), (cl:Claim {id: 'claim-001'}) MERGE (pol)-[:HAS_CLAIM]->(cl);
MATCH (cl:Claim {id: 'claim-001'}), (o:Object {id: 'object-001'}) MERGE (cl)-[:ON_OBJECT]->(o);
MATCH (cl:Claim {id: 'claim-001'}), (r:Risk {id: 'risk-001'}) MERGE (cl)-[:FOR_RISK]->(r);
MATCH (cl:Claim {id: 'claim-001'}), (cov:Coverage {id: 'cov-001-bnd'}) MERGE (cl)-[r:AFFECTS_COVERAGE]->(cov) SET r.paidAmount = 480000.0;

// === 11. Endorsement (Teilzahlung) =========================================
MERGE (e:Endorsement {id: 'endorse-001'}) SET e.endorsementNumber = 1, e.type = 'Teilzahlung Schaden', e.effectiveDate = date('2026-09-10'), e.status = 'Bestätigt', e.description = 'Erste Teilzahlung 480k auf CLM-2026-0001', e.createdAt = datetime(), e.updatedAt = datetime();
MATCH (pol:Policy {id: 'policy-001'}), (e:Endorsement {id: 'endorse-001'}) MERGE (pol)-[:AMENDED_BY]->(e);

// === 12. KI-Schicht ========================================================
MERGE (d1:Document {id: 'doc-001'}) SET d1.filename = 'slip-festivalsaison-2026.pdf', d1.fileFormat = 'pdf', d1.fileSize = 2457600, d1.uploadedAt = datetime('2026-04-10T08:16:00Z'), d1.documentType = 'Slip', d1.createdAt = datetime(), d1.updatedAt = datetime();
MERGE (d2:Document {id: 'doc-002'}) SET d2.filename = 'halle-a-technischer-bericht.pdf', d2.fileFormat = 'pdf', d2.fileSize = 890000, d2.uploadedAt = datetime('2026-04-10T08:17:00Z'), d2.documentType = 'TechnischerBericht', d2.createdAt = datetime(), d2.updatedAt = datetime();
MERGE (d3:Document {id: 'doc-003'}) SET d3.filename = 'anlage-cyber-fragebogen.pdf', d3.fileFormat = 'pdf', d3.fileSize = 320000, d3.uploadedAt = datetime('2026-04-10T08:18:00Z'), d3.documentType = 'CyberQuestionnaire', d3.createdAt = datetime(), d3.updatedAt = datetime();
MATCH (s:Submission {id: 'submission-001'}), (d:Document {id: 'doc-001'}) MERGE (s)-[:HAS_DOCUMENT]->(d);
MATCH (s:Submission {id: 'submission-001'}), (d:Document {id: 'doc-002'}) MERGE (s)-[:HAS_DOCUMENT]->(d);
MATCH (s:Submission {id: 'submission-001'}), (d:Document {id: 'doc-003'}) MERGE (s)-[:HAS_DOCUMENT]->(d);

MERGE (er:ExtractionRun {id: 'run-001'}) SET er.runNumber = 1, er.executedAt = datetime('2026-04-10T08:30:00Z'), er.accepted = true, er.overallQuality = 88, er.createdAt = datetime(), er.updatedAt = datetime();
MATCH (s:Submission {id: 'submission-001'}), (er:ExtractionRun {id: 'run-001'}) MERGE (s)-[:PROCESSED_IN]->(er);
MATCH (er:ExtractionRun {id: 'run-001'}), (d:Document {id: 'doc-001'}) MERGE (er)-[:USED_DOCUMENT]->(d);
MATCH (er:ExtractionRun {id: 'run-001'}), (d:Document {id: 'doc-002'}) MERGE (er)-[:USED_DOCUMENT]->(d);
MATCH (er:ExtractionRun {id: 'run-001'}), (d:Document {id: 'doc-003'}) MERGE (er)-[:USED_DOCUMENT]->(d);

// Extracted fields – realistische Confidences, ein Feld mit niedriger Confidence
MERGE (f1:ExtractedField {id: 'field-001'}) SET f1.targetEntityType = 'Object', f1.targetFieldName = 'titel', f1.aiConfidence = 98, f1.sourcePosition = 'doc-001#p1#l12', f1.createdAt = datetime();
MERGE (f2:ExtractedField {id: 'field-002'}) SET f2.targetEntityType = 'Object', f2.targetFieldName = 'besucher', f2.aiConfidence = 91, f2.sourcePosition = 'doc-001#p1#l18', f2.createdAt = datetime();
MERGE (f3:ExtractedField {id: 'field-003'}) SET f3.targetEntityType = 'Object', f3.targetFieldName = 'flaecheQm', f3.aiConfidence = 95, f3.sourcePosition = 'doc-002#p2#l3', f3.createdAt = datetime();
MERGE (f4:ExtractedField {id: 'field-004'}) SET f4.targetEntityType = 'Risk', f4.targetFieldName = 'peril', f4.aiConfidence = 54, f4.sourcePosition = 'doc-003#p1#l7', f4.createdAt = datetime();
MERGE (f5:ExtractedField {id: 'field-005'}) SET f5.targetEntityType = 'Coverage', f5.targetFieldName = 'sumInsured', f5.aiConfidence = 87, f5.sourcePosition = 'doc-001#p4#l22', f5.createdAt = datetime();
MERGE (f6:ExtractedField {id: 'field-006'}) SET f6.targetEntityType = 'Object', f6.targetFieldName = 'bauJahr', f6.aiConfidence = 78, f6.sourcePosition = 'doc-002#p1#l5', f6.createdAt = datetime();

MATCH (f:ExtractedField {id: 'field-001'}), (er:ExtractionRun {id: 'run-001'}) MERGE (f)-[:EXTRACTED_IN]->(er);
MATCH (f:ExtractedField {id: 'field-002'}), (er:ExtractionRun {id: 'run-001'}) MERGE (f)-[:EXTRACTED_IN]->(er);
MATCH (f:ExtractedField {id: 'field-003'}), (er:ExtractionRun {id: 'run-001'}) MERGE (f)-[:EXTRACTED_IN]->(er);
MATCH (f:ExtractedField {id: 'field-004'}), (er:ExtractionRun {id: 'run-001'}) MERGE (f)-[:EXTRACTED_IN]->(er);
MATCH (f:ExtractedField {id: 'field-005'}), (er:ExtractionRun {id: 'run-001'}) MERGE (f)-[:EXTRACTED_IN]->(er);
MATCH (f:ExtractedField {id: 'field-006'}), (er:ExtractionRun {id: 'run-001'}) MERGE (f)-[:EXTRACTED_IN]->(er);
MATCH (f:ExtractedField {id: 'field-001'}), (d:Document {id: 'doc-001'}) MERGE (f)-[:FROM_DOCUMENT]->(d);
MATCH (f:ExtractedField {id: 'field-002'}), (d:Document {id: 'doc-001'}) MERGE (f)-[:FROM_DOCUMENT]->(d);
MATCH (f:ExtractedField {id: 'field-003'}), (d:Document {id: 'doc-002'}) MERGE (f)-[:FROM_DOCUMENT]->(d);
MATCH (f:ExtractedField {id: 'field-004'}), (d:Document {id: 'doc-003'}) MERGE (f)-[:FROM_DOCUMENT]->(d);
MATCH (f:ExtractedField {id: 'field-005'}), (d:Document {id: 'doc-001'}) MERGE (f)-[:FROM_DOCUMENT]->(d);
MATCH (f:ExtractedField {id: 'field-006'}), (d:Document {id: 'doc-002'}) MERGE (f)-[:FROM_DOCUMENT]->(d);

MATCH (f:ExtractedField {id: 'field-001'}), (o:Object {id: 'object-001'}) MERGE (f)-[:POPULATES]->(o);
MATCH (f:ExtractedField {id: 'field-002'}), (o:Object {id: 'object-001'}) MERGE (f)-[:POPULATES]->(o);
MATCH (f:ExtractedField {id: 'field-003'}), (o:Object {id: 'object-003'}) MERGE (f)-[:POPULATES]->(o);
MATCH (f:ExtractedField {id: 'field-004'}), (r:Risk {id: 'risk-004'}) MERGE (f)-[:POPULATES]->(r);
MATCH (f:ExtractedField {id: 'field-005'}), (cov:Coverage {id: 'cov-001-req'}) MERGE (f)-[:POPULATES]->(cov);
MATCH (f:ExtractedField {id: 'field-006'}), (o:Object {id: 'object-003'}) MERGE (f)-[:POPULATES]->(o);

// === 13. Assessment ========================================================
MERGE (a:Assessment {id: 'assess-001'}) SET a.uwGuidelineScore = 'konform', a.uwGuidelineKo = false, a.hitRatioScore = 0.76, a.riskAppetiteScore = 0.82, a.dataQualityScore = 88, a.urgencyScore = 0.60, a.compositeScore = 0.82, a.routingDecision = 'Automatische Annahme', a.assessedAt = datetime('2026-04-10T09:00:00Z'), a.assessmentReason = 'Alle KO-Kriterien ok, SumIns < Kapazitaetslimit', a.createdAt = datetime();
MATCH (a:Assessment {id: 'assess-001'}), (s:Submission {id: 'submission-001'}) MERGE (a)-[:ASSESSES]->(s);
MATCH (a:Assessment {id: 'assess-001'}), (g:UnderwritingGuideline {id: 'guide-001'}) MERGE (a)-[:APPLIES_GUIDELINE]->(g);

// === 14. AuditEvent (manuelle Korrektur eines unsicheren Feldes) ===========
MERGE (ae:AuditEvent {id: 'audit-001'}) SET ae.eventType = 'ManualFieldCorrection', ae.occurredAt = datetime('2026-04-11T09:30:00Z'), ae.oldValue = 'CYBER?', ae.newValue = 'CYBER', ae.reason = 'AI-Confidence 54%, von UW bestaetigt', ae.createdAt = datetime();
MATCH (ae:AuditEvent {id: 'audit-001'}), (s:Submission {id: 'submission-001'}) MERGE (ae)-[:ON_SUBMISSION]->(s);
MATCH (ae:AuditEvent {id: 'audit-001'}), (u:User {id: 'user-001'}) MERGE (ae)-[:BY_USER]->(u);
MATCH (ae:AuditEvent {id: 'audit-001'}), (f:ExtractedField {id: 'field-004'}) MERGE (ae)-[:AFFECTS_FIELD]->(f);

// === FERTIG ================================================================
RETURN 'UWWB Beispiel-Szenario "Festival-Saison 2026" geladen.' AS status;
