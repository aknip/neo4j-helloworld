// =============================================================================
// 01-constraints-indexes.cypher
// Ontologie: UWWB (Underwriting Workbench)
// Generiert: 2026-04-09
// Version: 1.0
// =============================================================================

// === Unique Constraints ======================================================

// Partner & Rollen
CREATE CONSTRAINT IF NOT EXISTS FOR (n:Partner) REQUIRE n.id IS UNIQUE;

// Versicherbare Objekte
CREATE CONSTRAINT IF NOT EXISTS FOR (n:InsurableObject) REQUIRE n.id IS UNIQUE;

// Risiko & Deckungswunsch
CREATE CONSTRAINT IF NOT EXISTS FOR (n:Risk) REQUIRE n.id IS UNIQUE;
CREATE CONSTRAINT IF NOT EXISTS FOR (n:CoverageRequest) REQUIRE n.id IS UNIQUE;

// Versicherungsprodukte
CREATE CONSTRAINT IF NOT EXISTS FOR (n:InsuranceProduct) REQUIRE n.id IS UNIQUE;
CREATE CONSTRAINT IF NOT EXISTS FOR (n:InsuranceLine) REQUIRE n.id IS UNIQUE;
CREATE CONSTRAINT IF NOT EXISTS FOR (n:CoverageDefinition) REQUIRE n.id IS UNIQUE;
CREATE CONSTRAINT IF NOT EXISTS FOR (n:Clause) REQUIRE n.id IS UNIQUE;

// Geschaeftsprozesse
CREATE CONSTRAINT IF NOT EXISTS FOR (n:Submission) REQUIRE n.id IS UNIQUE;
CREATE CONSTRAINT IF NOT EXISTS FOR (n:Offer) REQUIRE n.id IS UNIQUE;
CREATE CONSTRAINT IF NOT EXISTS FOR (n:CoverageOffer) REQUIRE n.id IS UNIQUE;
CREATE CONSTRAINT IF NOT EXISTS FOR (n:Policy) REQUIRE n.id IS UNIQUE;
CREATE CONSTRAINT IF NOT EXISTS FOR (n:Policy) REQUIRE n.policyNumber IS UNIQUE;
CREATE CONSTRAINT IF NOT EXISTS FOR (n:PolicyCoverage) REQUIRE n.id IS UNIQUE;
CREATE CONSTRAINT IF NOT EXISTS FOR (n:Endorsement) REQUIRE n.id IS UNIQUE;

// Schadenmanagement
CREATE CONSTRAINT IF NOT EXISTS FOR (n:Claim) REQUIRE n.id IS UNIQUE;
CREATE CONSTRAINT IF NOT EXISTS FOR (n:Claim) REQUIRE n.claimNumber IS UNIQUE;
CREATE CONSTRAINT IF NOT EXISTS FOR (n:ClaimSettlement) REQUIRE n.id IS UNIQUE;

// Flexible Attribute
CREATE CONSTRAINT IF NOT EXISTS FOR (n:AttributeTemplate) REQUIRE n.id IS UNIQUE;
CREATE CONSTRAINT IF NOT EXISTS FOR (n:CustomAttribute) REQUIRE n.id IS UNIQUE;

// === Range Indexes ===========================================================

// Partner & Rollen
CREATE INDEX IF NOT EXISTS FOR (n:Partner) ON (n.legalName);
CREATE INDEX IF NOT EXISTS FOR (n:Partner) ON (n.partnerType);
CREATE INDEX IF NOT EXISTS FOR (n:Partner) ON (n.country);
CREATE INDEX IF NOT EXISTS FOR (n:Partner) ON (n.status);
CREATE INDEX IF NOT EXISTS FOR (n:Customer) ON (n.industry);
CREATE INDEX IF NOT EXISTS FOR (n:Insurer) ON (n.rating);
CREATE INDEX IF NOT EXISTS FOR (n:Broker) ON (n.licenseNumber);
CREATE INDEX IF NOT EXISTS FOR (n:Contact) ON (n.lastName);
CREATE INDEX IF NOT EXISTS FOR (n:Contact) ON (n.email);

// Versicherbare Objekte
CREATE INDEX IF NOT EXISTS FOR (n:InsurableObject) ON (n.objectName);
CREATE INDEX IF NOT EXISTS FOR (n:InsurableObject) ON (n.location);
CREATE INDEX IF NOT EXISTS FOR (n:InsurableObject) ON (n.status);
CREATE INDEX IF NOT EXISTS FOR (n:Building) ON (n.fireProtectionClass);
CREATE INDEX IF NOT EXISTS FOR (n:Machine) ON (n.manufacturer);
CREATE INDEX IF NOT EXISTS FOR (n:Machine) ON (n.machineType);
CREATE INDEX IF NOT EXISTS FOR (n:Vehicle) ON (n.licensePlate);
CREATE INDEX IF NOT EXISTS FOR (n:Vehicle) ON (n.vehicleType);
CREATE INDEX IF NOT EXISTS FOR (n:Person) ON (n.lastName);
CREATE INDEX IF NOT EXISTS FOR (n:Person) ON (n.role);
CREATE INDEX IF NOT EXISTS FOR (n:Project) ON (n.projectName);

// Risiko & Deckungswunsch
CREATE INDEX IF NOT EXISTS FOR (n:Risk) ON (n.riskType);
CREATE INDEX IF NOT EXISTS FOR (n:CoverageRequest) ON (n.status);

// Versicherungsprodukte
CREATE INDEX IF NOT EXISTS FOR (n:InsuranceProduct) ON (n.productName);
CREATE INDEX IF NOT EXISTS FOR (n:InsuranceProduct) ON (n.status);
CREATE INDEX IF NOT EXISTS FOR (n:InsuranceLine) ON (n.lineName);
CREATE INDEX IF NOT EXISTS FOR (n:InsuranceLine) ON (n.lineCode);
CREATE INDEX IF NOT EXISTS FOR (n:CoverageDefinition) ON (n.name);
CREATE INDEX IF NOT EXISTS FOR (n:Clause) ON (n.clauseCode);
CREATE INDEX IF NOT EXISTS FOR (n:Clause) ON (n.title);

// Geschaeftsprozesse
CREATE INDEX IF NOT EXISTS FOR (n:Submission) ON (n.submissionDate);
CREATE INDEX IF NOT EXISTS FOR (n:Submission) ON (n.deadline);
CREATE INDEX IF NOT EXISTS FOR (n:Submission) ON (n.status);
CREATE INDEX IF NOT EXISTS FOR (n:Offer) ON (n.status);
CREATE INDEX IF NOT EXISTS FOR (n:Policy) ON (n.effectiveDate);
CREATE INDEX IF NOT EXISTS FOR (n:Policy) ON (n.expirationDate);
CREATE INDEX IF NOT EXISTS FOR (n:Policy) ON (n.status);
CREATE INDEX IF NOT EXISTS FOR (n:Endorsement) ON (n.endorsementNumber);
CREATE INDEX IF NOT EXISTS FOR (n:Endorsement) ON (n.effectiveDate);

// Schadenmanagement
CREATE INDEX IF NOT EXISTS FOR (n:Claim) ON (n.claimDate);
CREATE INDEX IF NOT EXISTS FOR (n:Claim) ON (n.status);
CREATE INDEX IF NOT EXISTS FOR (n:ClaimSettlement) ON (n.settlementDate);
CREATE INDEX IF NOT EXISTS FOR (n:ClaimSettlement) ON (n.settlementType);

// Flexible Attribute
CREATE INDEX IF NOT EXISTS FOR (n:AttributeTemplate) ON (n.templateName);
