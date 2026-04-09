// =============================================================================
// 03-example-queries.cypher
// Ontologie: UWWB (Underwriting Workbench)
// Generiert: 2026-04-09
// Version: 1.0
//
// Beispiel-Queries fuer die 8 Analytics Use Cases
// =============================================================================

// === Use Case 1: Objektbestand eines Unternehmens ============================
// Welche Objekte hat ein Unternehmen? Welche Risiken haben diese Objekte?

// 1a: Alle Objekte eines Kunden mit Typ-Information
MATCH (c:Customer {id: 'partner-001'})-[:OWNS]->(o:InsurableObject)
RETURN o.objectName AS Objekt,
       labels(o) AS Typen,
       o.location AS Standort,
       o.insuredValue AS Versicherungswert,
       o.status AS Status
ORDER BY o.insuredValue DESC;

// 1b: Objekte inkl. Tochtergesellschaften (Konzernbestand)
MATCH (c:Customer {id: 'partner-001'})-[:HAS_SUBSIDIARY*0..5]->(sub:Customer)-[:OWNS]->(o:InsurableObject)
RETURN sub.legalName AS Unternehmen,
       o.objectName AS Objekt,
       labels(o) AS Typen,
       o.insuredValue AS Versicherungswert
ORDER BY sub.legalName, o.insuredValue DESC;

// 1c: Objekte mit ihren Risiken
MATCH (c:Customer {id: 'partner-001'})-[:OWNS]->(o:InsurableObject)-[:HAS_RISK]->(r:Risk)
RETURN o.objectName AS Objekt,
       r.riskType AS Risikoart,
       r.maxExposure AS MaxSchaden,
       r.probability AS Wahrscheinlichkeit
ORDER BY r.maxExposure DESC;

// === Use Case 2: Deckungszuordnung ===========================================
// Welche Deckungen/Vertraege sind den Risiken/Objekten zugeordnet?

// 2a: Vollstaendige Kette: Objekt -> Risiko -> Deckung -> Vertrag
MATCH (c:Customer {id: 'partner-001'})-[:OWNS]->(o:InsurableObject)-[:HAS_RISK]->(r:Risk)
      <-[:COVERS_RISK]-(pc:PolicyCoverage)<-[:HAS_COVERAGE]-(pol:Policy)
RETURN o.objectName AS Objekt,
       r.riskType AS Risiko,
       pc.coveredSum AS GedeckteSumme,
       pc.deductible AS Selbstbeteiligung,
       pol.policyNumber AS Police,
       pol.status AS PoliceStatus
ORDER BY o.objectName;

// 2b: Deckungswunsch vs. tatsaechliche Deckung
MATCH (r:Risk)-[:HAS_COVERAGE_REQUEST]->(cr:CoverageRequest)
OPTIONAL MATCH (pc:PolicyCoverage)-[:COVERS_RISK]->(r)
RETURN r.riskType AS Risiko,
       r.description AS Beschreibung,
       cr.requestedSum AS Gewuenscht,
       pc.coveredSum AS Gedeckt,
       CASE WHEN pc.coveredSum IS NULL THEN 'UNGEDECKT'
            WHEN pc.coveredSum < cr.requestedSum THEN 'UNTERDECKT'
            ELSE 'OK' END AS Status;

// === Use Case 3: Beteiligte Versicherer ======================================
// Wie viele Produkte/Versicherer sind an der Risikodeckung beteiligt?

// 3a: Versicherer pro Police mit Anteilen
MATCH (pol:Policy)-[uw:UNDERWRITTEN_BY]->(ins:Insurer)
RETURN pol.policyNumber AS Police,
       pol.totalPremium AS Gesamtpraemie,
       ins.legalName AS Versicherer,
       uw.share AS AnteilProzent,
       pol.totalPremium * uw.share / 100 AS PraemienanteilEUR
ORDER BY pol.policyNumber, uw.share DESC;

// 3b: Alle Versicherer die Risiken eines Kunden decken
MATCH (c:Customer {id: 'partner-001'})<-[:INSURES]-(pol:Policy)-[uw:UNDERWRITTEN_BY]->(ins:Insurer)
RETURN ins.legalName AS Versicherer,
       ins.rating AS Rating,
       count(pol) AS AnzahlPolicen,
       sum(pol.totalPremium * uw.share / 100) AS GesamtPraemienanteil
ORDER BY GesamtPraemienanteil DESC;

// === Use Case 4: Risikokonzentration =========================================
// Regional, nach Branche, nach max. Schadenshoehe ueber mehrere Vertraege

// 4a: Risikokonzentration nach Standort
MATCH (o:InsurableObject)-[:HAS_RISK]->(r:Risk)
RETURN o.location AS Standort,
       count(r) AS AnzahlRisiken,
       sum(r.maxExposure) AS GesamtExposure,
       collect(DISTINCT r.riskType) AS Risikoarten
ORDER BY GesamtExposure DESC;

// 4b: Risikokonzentration nach Branche
MATCH (c:Customer)-[:OWNS]->(o:InsurableObject)-[:HAS_RISK]->(r:Risk)
RETURN c.industry AS Branche,
       count(DISTINCT c) AS AnzahlKunden,
       count(r) AS AnzahlRisiken,
       sum(r.maxExposure) AS GesamtExposure
ORDER BY GesamtExposure DESC;

// 4c: Maximale Schadenshoehe pro Kunde (ueber alle Vertraege)
MATCH (c:Customer)<-[:INSURES]-(pol:Policy)-[:HAS_COVERAGE]->(pc:PolicyCoverage)
RETURN c.legalName AS Kunde,
       sum(pc.coveredSum) AS GesamtDeckungssumme,
       count(pc) AS AnzahlDeckungen,
       sum(pc.premiumShare) AS GesamtPraemie
ORDER BY GesamtDeckungssumme DESC;

// === Use Case 5: Makler-Performance ==========================================
// Wer bringt am meisten Geschaeft?

// 5a: Praemienvolumen pro Makler
MATCH (b:Broker)<-[:BROKERED_BY]-(pol:Policy)
RETURN b.legalName AS Makler,
       count(pol) AS AnzahlPolicen,
       sum(pol.totalPremium) AS Praemienvolumen,
       avg(pol.totalPremium) AS DurchschnittsPraemie
ORDER BY Praemienvolumen DESC;

// 5b: Makler mit Kundendetails
MATCH (b:Broker)-[ma:MANAGES_ACCOUNT]->(c:Customer)<-[:INSURES]-(pol:Policy)
WHERE pol.status = 'active'
RETURN b.legalName AS Makler,
       c.legalName AS Kunde,
       c.industry AS Branche,
       count(pol) AS AktivePolicen,
       sum(pol.totalPremium) AS Praemienvolumen,
       ma.since AS BetreungSeit
ORDER BY Praemienvolumen DESC;

// === Use Case 6: Deckungsluecken =============================================
// Wo ist ein Unternehmen unterversichert?

// 6a: Risiken ohne Deckung
MATCH (c:Customer {id: 'partner-001'})-[:OWNS]->(o:InsurableObject)-[:HAS_RISK]->(r:Risk)
WHERE NOT EXISTS {
  MATCH (pc:PolicyCoverage)-[:COVERS_RISK]->(r)
  MATCH (pol:Policy)-[:HAS_COVERAGE]->(pc)
  WHERE pol.status = 'active'
}
RETURN o.objectName AS Objekt,
       r.riskType AS Risiko,
       r.maxExposure AS MaxSchaden,
       'UNGEDECKT' AS Status;

// 6b: Unterdeckung (Deckungssumme < Versicherungswert)
MATCH (c:Customer {id: 'partner-001'})-[:OWNS]->(o:InsurableObject)-[:HAS_RISK]->(r:Risk)
      <-[:COVERS_RISK]-(pc:PolicyCoverage)<-[:HAS_COVERAGE]-(pol:Policy)
WHERE pol.status = 'active' AND pc.coveredSum < o.insuredValue
RETURN o.objectName AS Objekt,
       r.riskType AS Risiko,
       o.insuredValue AS Versicherungswert,
       pc.coveredSum AS GedeckteSumme,
       o.insuredValue - pc.coveredSum AS Luecke;

// === Use Case 7: Mehrfachdeckungen ===========================================
// Wo bestehen Ueberschneidungen ueber mehrere Vertraege?

// 7a: Risiken die von mehreren PolicyCoverages gedeckt werden
MATCH (r:Risk)<-[:COVERS_RISK]-(pc:PolicyCoverage)<-[:HAS_COVERAGE]-(pol:Policy)
WHERE pol.status = 'active'
WITH r, collect({
  police: pol.policyNumber,
  deckung: pc.coveredSum,
  praemie: pc.premiumShare
}) AS deckungen
WHERE size(deckungen) > 1
RETURN r.riskType AS Risiko,
       r.description AS Beschreibung,
       size(deckungen) AS AnzahlDeckungen,
       deckungen AS Details;

// 7b: Objekte mit mehrfacher Deckung desselben Risikotyps
MATCH (o:InsurableObject)-[:HAS_RISK]->(r:Risk)<-[:COVERS_RISK]-(pc:PolicyCoverage)
      <-[:HAS_COVERAGE]-(pol:Policy)
WHERE pol.status = 'active'
WITH o, r.riskType AS riskType, collect(DISTINCT pol.policyNumber) AS policen
WHERE size(policen) > 1
RETURN o.objectName AS Objekt, riskType AS Risikotyp, policen AS Policen;

// === Use Case 8: Schadenquoten ===============================================
// Auf Ebene Deckung, Objekt, Unternehmen, Sparte, Versicherer

// 8a: Schadenquote pro Deckung (Schaden / Praemie)
MATCH (pol:Policy)-[:HAS_COVERAGE]->(pc:PolicyCoverage)
OPTIONAL MATCH (cl:Claim)-[:AFFECTS_COVERAGE]->(pc)
OPTIONAL MATCH (cl)-[:HAS_SETTLEMENT]->(cs:ClaimSettlement)
WITH pol, pc, sum(cs.amount) AS reguliert
RETURN pol.policyNumber AS Police,
       pc.coveredSum AS Deckungssumme,
       pc.premiumShare AS Praemie,
       coalesce(reguliert, 0) AS Reguliert,
       CASE WHEN pc.premiumShare > 0
            THEN round(coalesce(reguliert, 0) / pc.premiumShare * 100, 1)
            ELSE 0 END AS SchadenquoteProzent
ORDER BY SchadenquoteProzent DESC;

// 8b: Schadenquote pro Kunde
MATCH (c:Customer)<-[:INSURES]-(pol:Policy)
WITH c, sum(pol.totalPremium) AS gesamtPraemie
OPTIONAL MATCH (c)<-[:INSURES]-(pol2:Policy)-[:HAS_COVERAGE]->(pc:PolicyCoverage)
                <-[:AFFECTS_COVERAGE]-(cl:Claim)-[:HAS_SETTLEMENT]->(cs:ClaimSettlement)
WITH c, gesamtPraemie, sum(cs.amount) AS gesamtSchaden
RETURN c.legalName AS Kunde,
       gesamtPraemie AS Praemie,
       coalesce(gesamtSchaden, 0) AS Schaden,
       CASE WHEN gesamtPraemie > 0
            THEN round(coalesce(gesamtSchaden, 0) / gesamtPraemie * 100, 1)
            ELSE 0 END AS SchadenquoteProzent;

// 8c: Schadenquote pro Versicherer
MATCH (ins:Insurer)<-[uw:UNDERWRITTEN_BY]-(pol:Policy)
WITH ins, sum(pol.totalPremium * uw.share / 100) AS praemienanteil
OPTIONAL MATCH (ins)<-[uw2:UNDERWRITTEN_BY]-(pol2:Policy)-[:HAS_COVERAGE]->(pc:PolicyCoverage)
                <-[:AFFECTS_COVERAGE]-(cl:Claim)-[:HAS_SETTLEMENT]->(cs:ClaimSettlement)
WITH ins, praemienanteil, sum(cs.amount * uw2.share / 100) AS schadenanteil
RETURN ins.legalName AS Versicherer,
       ins.rating AS Rating,
       praemienanteil AS Praemienanteil,
       coalesce(schadenanteil, 0) AS Schadenanteil,
       CASE WHEN praemienanteil > 0
            THEN round(coalesce(schadenanteil, 0) / praemienanteil * 100, 1)
            ELSE 0 END AS SchadenquoteProzent;

// 8d: Schadenquote pro Sparte
MATCH (pol:Policy)-[:HAS_COVERAGE]->(pc:PolicyCoverage)-[:BASED_ON_DEF]->(cd:CoverageDefinition)
      <-[:HAS_COVERAGE_DEF]-(prod:InsuranceProduct)-[:BELONGS_TO_LINE]->(line:InsuranceLine)
WITH line, sum(pc.premiumShare) AS praemie
OPTIONAL MATCH (line)<-[:BELONGS_TO_LINE]-(prod2:InsuranceProduct)-[:HAS_COVERAGE_DEF]->(cd2:CoverageDefinition)
                <-[:BASED_ON_DEF]-(pc2:PolicyCoverage)<-[:AFFECTS_COVERAGE]-(cl:Claim)-[:HAS_SETTLEMENT]->(cs:ClaimSettlement)
WITH line, praemie, sum(cs.amount) AS schaden
RETURN line.lineName AS Sparte,
       line.lineCode AS Code,
       praemie AS Praemie,
       coalesce(schaden, 0) AS Schaden,
       CASE WHEN praemie > 0
            THEN round(coalesce(schaden, 0) / praemie * 100, 1)
            ELSE 0 END AS SchadenquoteProzent;
