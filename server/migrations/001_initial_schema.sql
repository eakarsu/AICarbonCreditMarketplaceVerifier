-- Migration 001: Initial Schema
-- AI Carbon Credit Marketplace Verifier
-- Run once against a fresh database. Sequelize models sync on top of these tables.

BEGIN;

CREATE TABLE IF NOT EXISTS schema_migrations (
  version    VARCHAR(50) PRIMARY KEY,
  applied_at TIMESTAMP DEFAULT NOW()
);

-- ─────────────────────────────────────────────
-- Users
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "Users" (
  id         SERIAL PRIMARY KEY,
  name       VARCHAR(255)  NOT NULL,
  email      VARCHAR(255)  NOT NULL UNIQUE,
  password   VARCHAR(255)  NOT NULL,
  role       VARCHAR(50)   NOT NULL DEFAULT 'trader',
  company    VARCHAR(255),
  avatar     VARCHAR(500),
  "createdAt" TIMESTAMP    NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMP    NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_email ON "Users"(email);
CREATE INDEX IF NOT EXISTS idx_users_role  ON "Users"(role);

-- ─────────────────────────────────────────────
-- Projects
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "Projects" (
  id                   SERIAL PRIMARY KEY,
  name                 VARCHAR(255)  NOT NULL,
  type                 VARCHAR(255)  NOT NULL,
  location             VARCHAR(255),
  country              VARCHAR(100),
  "startDate"          DATE,
  "endDate"            DATE,
  "estimatedReduction" NUMERIC(14,4),
  "actualReduction"    NUMERIC(14,4),
  status               VARCHAR(50)   NOT NULL DEFAULT 'proposed',
  description          TEXT,
  "ownerId"            INTEGER REFERENCES "Users"(id) ON DELETE SET NULL,
  methodology          VARCHAR(255),
  "sdgGoals"           VARCHAR(500),
  "imageUrl"           VARCHAR(500),
  "createdAt"          TIMESTAMP     NOT NULL DEFAULT NOW(),
  "updatedAt"          TIMESTAMP     NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_projects_owner  ON "Projects"("ownerId");
CREATE INDEX IF NOT EXISTS idx_projects_status ON "Projects"(status);
CREATE INDEX IF NOT EXISTS idx_projects_type   ON "Projects"(type);

-- ─────────────────────────────────────────────
-- Carbon Credits
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "CarbonCredits" (
  id                   SERIAL PRIMARY KEY,
  name                 VARCHAR(255)  NOT NULL,
  "projectType"        VARCHAR(255)  NOT NULL,
  vintage              INTEGER,
  quantity             NUMERIC(14,4) NOT NULL,
  "pricePerTon"        NUMERIC(10,2) NOT NULL,
  status               VARCHAR(50)   NOT NULL DEFAULT 'available',
  registry             VARCHAR(255),
  country              VARCHAR(100),
  methodology          VARCHAR(255),
  description          TEXT,
  "co2OffsetTons"      NUMERIC(14,4),
  "verificationStatus" VARCHAR(50)   NOT NULL DEFAULT 'pending',
  "sellerId"           INTEGER REFERENCES "Users"(id) ON DELETE SET NULL,
  "createdAt"          TIMESTAMP     NOT NULL DEFAULT NOW(),
  "updatedAt"          TIMESTAMP     NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_credits_seller ON "CarbonCredits"("sellerId");
CREATE INDEX IF NOT EXISTS idx_credits_status ON "CarbonCredits"(status);
CREATE INDEX IF NOT EXISTS idx_credits_type   ON "CarbonCredits"("projectType");
CREATE INDEX IF NOT EXISTS idx_credits_registry ON "CarbonCredits"(registry);
CREATE INDEX IF NOT EXISTS idx_credits_vintage ON "CarbonCredits"(vintage);

-- ─────────────────────────────────────────────
-- Verifications
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "Verifications" (
  id           SERIAL PRIMARY KEY,
  "creditId"   INTEGER REFERENCES "CarbonCredits"(id) ON DELETE SET NULL,
  "projectId"  INTEGER REFERENCES "Projects"(id) ON DELETE SET NULL,
  "verifierId" INTEGER REFERENCES "Users"(id) ON DELETE SET NULL,
  status       VARCHAR(50)   NOT NULL DEFAULT 'pending',
  methodology  VARCHAR(255),
  findings     TEXT,
  "aiScore"    NUMERIC(5,2),
  "aiAnalysis" TEXT,
  "riskLevel"  VARCHAR(50)   NOT NULL DEFAULT 'medium',
  "documentUrl" VARCHAR(500),
  "createdAt"  TIMESTAMP     NOT NULL DEFAULT NOW(),
  "updatedAt"  TIMESTAMP     NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_verifications_credit   ON "Verifications"("creditId");
CREATE INDEX IF NOT EXISTS idx_verifications_project  ON "Verifications"("projectId");
CREATE INDEX IF NOT EXISTS idx_verifications_verifier ON "Verifications"("verifierId");
CREATE INDEX IF NOT EXISTS idx_verifications_status   ON "Verifications"(status);

-- ─────────────────────────────────────────────
-- Transactions
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "Transactions" (
  id                  SERIAL PRIMARY KEY,
  "creditId"          INTEGER       NOT NULL REFERENCES "CarbonCredits"(id) ON DELETE RESTRICT,
  "buyerId"           INTEGER REFERENCES "Users"(id) ON DELETE SET NULL,
  "sellerId"          INTEGER REFERENCES "Users"(id) ON DELETE SET NULL,
  quantity            NUMERIC(14,4) NOT NULL,
  "totalPrice"        NUMERIC(14,2) NOT NULL,
  "transactionType"   VARCHAR(50)   NOT NULL,
  status              VARCHAR(50)   NOT NULL DEFAULT 'pending',
  "transactionHash"   VARCHAR(255),
  fee                 NUMERIC(10,2) NOT NULL DEFAULT 0,
  "createdAt"         TIMESTAMP     NOT NULL DEFAULT NOW(),
  "updatedAt"         TIMESTAMP     NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_transactions_credit ON "Transactions"("creditId");
CREATE INDEX IF NOT EXISTS idx_transactions_buyer  ON "Transactions"("buyerId");
CREATE INDEX IF NOT EXISTS idx_transactions_status ON "Transactions"(status);

-- ─────────────────────────────────────────────
-- Retirements
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "Retirements" (
  id               SERIAL PRIMARY KEY,
  "creditId"       INTEGER REFERENCES "CarbonCredits"(id) ON DELETE SET NULL,
  "userId"         INTEGER REFERENCES "Users"(id) ON DELETE SET NULL,
  quantity         NUMERIC(14,4) NOT NULL,
  reason           TEXT,
  beneficiary      VARCHAR(255),
  "retirementDate" TIMESTAMP,
  "certificateUrl" VARCHAR(500),
  status           VARCHAR(50)   NOT NULL DEFAULT 'pending',
  "createdAt"      TIMESTAMP     NOT NULL DEFAULT NOW(),
  "updatedAt"      TIMESTAMP     NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_retirements_credit ON "Retirements"("creditId");
CREATE INDEX IF NOT EXISTS idx_retirements_user   ON "Retirements"("userId");
CREATE INDEX IF NOT EXISTS idx_retirements_status ON "Retirements"(status);

-- ─────────────────────────────────────────────
-- Emissions
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "Emissions" (
  id          SERIAL PRIMARY KEY,
  "userId"    INTEGER REFERENCES "Users"(id) ON DELETE SET NULL,
  category    VARCHAR(255)  NOT NULL,
  source      VARCHAR(255),
  amount      NUMERIC(14,4) NOT NULL,
  unit        VARCHAR(50)   NOT NULL DEFAULT 'tCO2e',
  date        DATE,
  scope       VARCHAR(50)   NOT NULL DEFAULT 'scope1',
  description TEXT,
  "createdAt" TIMESTAMP     NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMP     NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_emissions_user   ON "Emissions"("userId");
CREATE INDEX IF NOT EXISTS idx_emissions_scope  ON "Emissions"(scope);

-- ─────────────────────────────────────────────
-- MarketData
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "MarketData" (
  id              SERIAL PRIMARY KEY,
  "creditType"    VARCHAR(255)  NOT NULL,
  price           NUMERIC(10,2) NOT NULL,
  volume          NUMERIC(14,4),
  date            DATE,
  exchange        VARCHAR(100),
  change          NUMERIC(10,4),
  "changePercent" NUMERIC(8,4),
  "createdAt"     TIMESTAMP     NOT NULL DEFAULT NOW(),
  "updatedAt"     TIMESTAMP     NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_market_data_type ON "MarketData"("creditType");
CREATE INDEX IF NOT EXISTS idx_market_data_date ON "MarketData"(date);

-- ─────────────────────────────────────────────
-- ComplianceReports
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "ComplianceReports" (
  id                   SERIAL PRIMARY KEY,
  "userId"             INTEGER REFERENCES "Users"(id) ON DELETE SET NULL,
  "reportType"         VARCHAR(255)  NOT NULL,
  period               VARCHAR(100),
  "totalEmissions"     NUMERIC(14,4),
  "totalOffsets"       NUMERIC(14,4),
  "netEmissions"       NUMERIC(14,4),
  "complianceStatus"   VARCHAR(50)   NOT NULL DEFAULT 'pending_review',
  "aiRecommendations"  TEXT,
  "regulatoryFramework" VARCHAR(255),
  "dueDate"            DATE,
  "createdAt"          TIMESTAMP     NOT NULL DEFAULT NOW(),
  "updatedAt"          TIMESTAMP     NOT NULL DEFAULT NOW()
);

-- ─────────────────────────────────────────────
-- AuditLogs
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "AuditLogs" (
  id           SERIAL PRIMARY KEY,
  "userId"     INTEGER REFERENCES "Users"(id) ON DELETE SET NULL,
  action       VARCHAR(255)  NOT NULL,
  "entityType" VARCHAR(100),
  "entityId"   INTEGER,
  details      TEXT,
  "ipAddress"  VARCHAR(45),
  timestamp    TIMESTAMP     NOT NULL DEFAULT NOW(),
  "createdAt"  TIMESTAMP     NOT NULL DEFAULT NOW(),
  "updatedAt"  TIMESTAMP     NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_user      ON "AuditLogs"("userId");
CREATE INDEX IF NOT EXISTS idx_audit_logs_action    ON "AuditLogs"(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_timestamp ON "AuditLogs"(timestamp);

-- ─────────────────────────────────────────────
-- OffsetRecommendations
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "OffsetRecommendations" (
  id                  SERIAL PRIMARY KEY,
  "userId"            INTEGER REFERENCES "Users"(id) ON DELETE SET NULL,
  "emissionAmount"    NUMERIC(14,4),
  "recommendedCredits" TEXT,
  "aiAnalysis"        TEXT,
  "estimatedCost"     NUMERIC(12,2),
  priority            VARCHAR(50)   NOT NULL DEFAULT 'medium',
  status              VARCHAR(50)   NOT NULL DEFAULT 'pending',
  "createdAt"         TIMESTAMP     NOT NULL DEFAULT NOW(),
  "updatedAt"         TIMESTAMP     NOT NULL DEFAULT NOW()
);

-- ─────────────────────────────────────────────
-- SustainabilityReports
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "SustainabilityReports" (
  id                SERIAL PRIMARY KEY,
  "userId"          INTEGER REFERENCES "Users"(id) ON DELETE SET NULL,
  title             VARCHAR(255)  NOT NULL,
  period            VARCHAR(100),
  "totalEmissions"  NUMERIC(14,4),
  "reductionTarget" NUMERIC(14,4),
  "actualReduction" NUMERIC(14,4),
  "aiInsights"      TEXT,
  status            VARCHAR(50)   NOT NULL DEFAULT 'draft',
  frameworks        VARCHAR(500),
  "createdAt"       TIMESTAMP     NOT NULL DEFAULT NOW(),
  "updatedAt"       TIMESTAMP     NOT NULL DEFAULT NOW()
);

-- Record migration
INSERT INTO schema_migrations(version) VALUES ('001')
  ON CONFLICT (version) DO NOTHING;

COMMIT;
