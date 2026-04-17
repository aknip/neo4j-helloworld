// =============================================================================
// UWWB Ontology - Constraints & Indexes
// Stand: 2026-04-17 | Version: 1.0
// =============================================================================
// Alle Nodes mit eindeutiger id erhalten einen Unique-Constraint.
// Zusätzliche Range-/Text-Indexes auf häufig abgefragten Properties.
// =============================================================================

// === Kern-Domäne ===========================================================
CREATE CONSTRAINT line_id_unique IF NOT EXISTS FOR (n:Line) REQUIRE n.id IS UNIQUE;
CREATE CONSTRAINT company_id_unique IF NOT EXISTS FOR (n:Company) REQUIRE n.id IS UNIQUE;
CREATE CONSTRAINT broker_id_unique IF NOT EXISTS FOR (n:Broker) REQUIRE n.id IS UNIQUE;
CREATE CONSTRAINT insurer_id_unique IF NOT EXISTS FOR (n:Insurer) REQUIRE n.id IS UNIQUE;
CREATE CONSTRAINT product_id_unique IF NOT EXISTS FOR (n:Product) REQUIRE n.id IS UNIQUE;
CREATE CONSTRAINT object_id_unique IF NOT EXISTS FOR (n:Object) REQUIRE n.id IS UNIQUE;
CREATE CONSTRAINT risk_id_unique IF NOT EXISTS FOR (n:Risk) REQUIRE n.id IS UNIQUE;
CREATE CONSTRAINT coverage_id_unique IF NOT EXISTS FOR (n:Coverage) REQUIRE n.id IS UNIQUE;
CREATE CONSTRAINT policy_id_unique IF NOT EXISTS FOR (n:Policy) REQUIRE n.id IS UNIQUE;
CREATE CONSTRAINT endorsement_id_unique IF NOT EXISTS FOR (n:Endorsement) REQUIRE n.id IS UNIQUE;
CREATE CONSTRAINT claim_id_unique IF NOT EXISTS FOR (n:Claim) REQUIRE n.id IS UNIQUE;

// === Workflow ==============================================================
CREATE CONSTRAINT tender_id_unique IF NOT EXISTS FOR (n:Tender) REQUIRE n.id IS UNIQUE;
CREATE CONSTRAINT submission_id_unique IF NOT EXISTS FOR (n:Submission) REQUIRE n.id IS UNIQUE;
CREATE CONSTRAINT quote_id_unique IF NOT EXISTS FOR (n:Quote) REQUIRE n.id IS UNIQUE;

// === KI-Schicht ============================================================
CREATE CONSTRAINT document_id_unique IF NOT EXISTS FOR (n:Document) REQUIRE n.id IS UNIQUE;
CREATE CONSTRAINT extractionrun_id_unique IF NOT EXISTS FOR (n:ExtractionRun) REQUIRE n.id IS UNIQUE;
CREATE CONSTRAINT extractedfield_id_unique IF NOT EXISTS FOR (n:ExtractedField) REQUIRE n.id IS UNIQUE;
CREATE CONSTRAINT assessment_id_unique IF NOT EXISTS FOR (n:Assessment) REQUIRE n.id IS UNIQUE;
CREATE CONSTRAINT uwguideline_id_unique IF NOT EXISTS FOR (n:UnderwritingGuideline) REQUIRE n.id IS UNIQUE;

// === Nutzer & Audit ========================================================
CREATE CONSTRAINT user_id_unique IF NOT EXISTS FOR (n:User) REQUIRE n.id IS UNIQUE;
CREATE CONSTRAINT auditevent_id_unique IF NOT EXISTS FOR (n:AuditEvent) REQUIRE n.id IS UNIQUE;

// === Template-Nodes ========================================================
CREATE CONSTRAINT objecttype_code_unique IF NOT EXISTS FOR (n:ObjectType) REQUIRE n.code IS UNIQUE;
CREATE CONSTRAINT periltype_code_unique IF NOT EXISTS FOR (n:PerilType) REQUIRE n.code IS UNIQUE;

// === Zusätzliche Business-Keys =============================================
CREATE CONSTRAINT policy_policynumber_unique IF NOT EXISTS FOR (n:Policy) REQUIRE n.policyNumber IS UNIQUE;
CREATE CONSTRAINT claim_claimnumber_unique IF NOT EXISTS FOR (n:Claim) REQUIRE n.claimNumber IS UNIQUE;

// === Range-Indexes für häufige Filter ======================================
CREATE INDEX coverage_status IF NOT EXISTS FOR (n:Coverage) ON (n.lifecycleStatus);
CREATE INDEX submission_status IF NOT EXISTS FOR (n:Submission) ON (n.status);
CREATE INDEX policy_status IF NOT EXISTS FOR (n:Policy) ON (n.status);
CREATE INDEX object_type IF NOT EXISTS FOR (n:Object) ON (n.objectType);
CREATE INDEX risk_peril IF NOT EXISTS FOR (n:Risk) ON (n.peril);
CREATE INDEX company_city IF NOT EXISTS FOR (n:Company) ON (n.city);
CREATE INDEX company_industry IF NOT EXISTS FOR (n:Company) ON (n.industry);
CREATE INDEX claim_incidentdate IF NOT EXISTS FOR (n:Claim) ON (n.incidentDate);
