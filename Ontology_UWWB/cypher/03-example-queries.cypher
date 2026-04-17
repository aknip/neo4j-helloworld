// =============================================================================
// UWWB Ontology - Beispiel-Queries zu den 10 Analytics Use Cases
// Stand: 2026-04-17 | Version: 1.0
// =============================================================================
// Jeder Abschnitt einzeln ausführbar. Referenzszenario: "Festival-Saison 2026".
// =============================================================================


// === UC 1: Welche Objekte hat ein Unternehmen (inkl. Konzern-Töchter)? =====
// Frage: Alle Objekte der EventMedia-Konzerngruppe
MATCH (parent:Company {name: 'EventMedia Holding AG'})-[:PARENT_OF*0..]->(c:Company)-[:OWNS]->(o:Object)
RETURN parent.name AS konzern, c.name AS unternehmen, o.name AS objekt, o.objectType AS typ
ORDER BY unternehmen, objekt;


// === UC 2: Welche Risiken hat ein Objekt? ==================================
// Frage: Risiken pro Objekt, inkl. Risiko-Kategorie
MATCH (o:Object)-[:HAS_RISK]->(r:Risk)
OPTIONAL MATCH (r)-[:PERIL_TYPE]->(pt:PerilType)
RETURN o.name AS objekt, r.peril AS risiko, pt.name AS risikoKategorie, r.schadenerwartungTsd AS schadenerwartungTsd
ORDER BY objekt, risiko;


// === UC 3: Welche Deckungen / Verträge sind den Risiken zugeordnet? ========
// Frage: Für jedes Risiko alle aktiven (bound) Coverages inkl. Police
MATCH (o:Object)-[:HAS_RISK]->(r:Risk)-[:COVERED_BY]->(cov:Coverage {lifecycleStatus: 'active'})
OPTIONAL MATCH (cov)-[:BOUND_IN]->(pol:Policy)
RETURN o.name AS objekt, r.peril AS risiko, cov.coverageType AS deckungsart, cov.sumInsured AS versSumme, pol.policyNumber AS police
ORDER BY objekt, risiko;


// === UC 4: Wie viele Versicherer sind an Risiko-Deckungen beteiligt? =======
// Frage: Alle beteiligten Versicherer pro Objekt (Co-Insurance)
MATCH (o:Object)-[:HAS_RISK]->(r:Risk)-[:COVERED_BY]->(cov:Coverage {lifecycleStatus: 'active'})-[:BOUND_IN]->(pol:Policy)-[u:UNDERWRITTEN_BY]->(ins:Insurer)
RETURN o.name AS objekt, collect(DISTINCT ins.name + ' (' + toString(u.sharePercent) + '%)') AS mitzeichner, count(DISTINCT ins) AS anzahlVersicherer
ORDER BY objekt;


// === UC 5: Risiko-Konzentration (regional / nach Branche / nach SumInsured) ==
// Frage: Exposure pro Versicherer und Region (Sum of Insured × Share)
MATCH (pol:Policy)-[u:UNDERWRITTEN_BY]->(ins:Insurer),
      (cov:Coverage {lifecycleStatus: 'active'})-[:BOUND_IN]->(pol),
      (cov)<-[:COVERED_BY]-(:Risk)<-[:HAS_RISK]-(o:Object)<-[:OWNS]-(c:Company)
RETURN ins.name AS versicherer, c.city AS region, c.industry AS branche,
       sum(cov.sumInsured * u.sharePercent / 100.0) AS exposureEur
ORDER BY exposureEur DESC;


// === UC 6: Makler-Ranking (welcher Broker bringt am meisten Geschäft?) =====
// Frage: Prämien-Volumen pro Makler
MATCH (b:Broker)<-[:SUBMITTED_BY]-(s:Submission)-[:PRODUCED]->(q:Quote)-[:REALIZED_AS]->(pol:Policy)
RETURN b.name AS makler,
       count(DISTINCT pol) AS anzahlPolicen,
       sum(pol.annualPremium) AS jahrespraemieGesamt,
       avg(pol.annualPremium) AS jahrespraemieDurchschnitt
ORDER BY jahrespraemieGesamt DESC;


// === UC 7: Deckungslücken (Risk mit requested, aber keiner active Coverage) ==
// Frage: Welche gewünschten Deckungen wurden nicht vertraglich gebunden?
MATCH (o:Object)-[:HAS_RISK]->(r:Risk)-[:COVERED_BY]->(req:Coverage {lifecycleStatus: 'requested'})
WHERE NOT EXISTS {
  MATCH (r)-[:COVERED_BY]->(:Coverage {lifecycleStatus: 'active'})
}
RETURN o.name AS objekt, r.peril AS risiko, req.coverageType AS gewuenscht, req.sumInsured AS gewuenschteSumme;


// === UC 8: Mehrfachdeckungen (>1 aktive Coverage pro Risk) =================
// Frage: An welchen Risiken existieren mehrere aktive Coverages?
MATCH (o:Object)-[:HAS_RISK]->(r:Risk)-[:COVERED_BY]->(cov:Coverage {lifecycleStatus: 'active'})
WITH o, r, collect(cov) AS covs
WHERE size(covs) > 1
RETURN o.name AS objekt, r.peril AS risiko, size(covs) AS anzahlDeckungen,
       [cov IN covs | cov.coverageType + ' (VS: ' + toString(cov.sumInsured) + ')'] AS deckungen;


// === UC 9: Schadenquote (Ebenen: Deckung / Objekt / Unternehmen / Sparte) ==

// 9a) pro Deckung (bound)
MATCH (cov:Coverage {lifecycleStatus: 'active'})
OPTIONAL MATCH (cl:Claim)-[a:AFFECTS_COVERAGE]->(cov)
WITH cov, sum(coalesce(a.paidAmount, 0)) AS schaden, cov.premium AS praemie
WHERE praemie > 0
RETURN cov.id AS coverage, cov.coverageType AS deckung, praemie, schaden,
       round(schaden * 100.0 / praemie, 1) AS schadenquotePct
ORDER BY schadenquotePct DESC;

// 9b) pro Unternehmen (Konzern-aggregiert)
MATCH (mother:Company)-[:PARENT_OF*0..]->(c:Company)-[:OWNS]->(o:Object)-[:HAS_RISK]->(r:Risk)-[:COVERED_BY]->(cov:Coverage {lifecycleStatus: 'active'})
OPTIONAL MATCH (cl:Claim)-[a:AFFECTS_COVERAGE]->(cov)
WITH mother, sum(cov.premium) AS praemie, sum(coalesce(a.paidAmount, 0)) AS schaden
RETURN mother.name AS konzernMutter, praemie, schaden,
       CASE WHEN praemie = 0 THEN null ELSE round(schaden * 100.0 / praemie, 1) END AS schadenquotePct;

// 9c) pro Sparte
MATCH (l:Line)<-[:IN_LINE]-(p:Product)<-[:BASED_ON]-(cov:Coverage {lifecycleStatus: 'active'})
OPTIONAL MATCH (cl:Claim)-[a:AFFECTS_COVERAGE]->(cov)
WITH l, sum(cov.premium) AS praemie, sum(coalesce(a.paidAmount, 0)) AS schaden
RETURN l.name AS sparte, praemie, schaden,
       CASE WHEN praemie = 0 THEN null ELSE round(schaden * 100.0 / praemie, 1) END AS schadenquotePct
ORDER BY schadenquotePct DESC;


// === UC 10: KI-Extraktions-Qualität ========================================
// Frage: Extrahierte Felder mit niedriger Confidence, inkl. manueller Korrektur
MATCH (f:ExtractedField)
OPTIONAL MATCH (ae:AuditEvent {eventType: 'ManualFieldCorrection'})-[:AFFECTS_FIELD]->(f)
OPTIONAL MATCH (f)-[:FROM_DOCUMENT]->(d:Document)
OPTIONAL MATCH (f)-[:POPULATES]->(target)
RETURN d.filename AS dokument,
       f.targetEntityType AS zielTyp,
       f.targetFieldName AS feldName,
       f.aiConfidence AS confidence,
       coalesce(target.name, target.id) AS zielNode,
       CASE WHEN ae IS NULL THEN 'nein' ELSE 'ja' END AS manuellKorrigiert
ORDER BY confidence ASC;
