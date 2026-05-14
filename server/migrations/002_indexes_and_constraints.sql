-- Migration 002: Additional Indexes and Constraints
-- Performance improvements and data integrity constraints

BEGIN;

-- Guard
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM schema_migrations WHERE version = '002') THEN
    RAISE NOTICE 'Migration 002 already applied, skipping.';
  END IF;
END $$;

-- Composite index for credit marketplace browsing
CREATE INDEX IF NOT EXISTS idx_credits_browse
  ON "CarbonCredits"(status, "verificationStatus", "projectType", vintage);

-- Composite index for transaction history queries
CREATE INDEX IF NOT EXISTS idx_transactions_history
  ON "Transactions"("buyerId", status, "createdAt" DESC);

-- Composite index for verification queue
CREATE INDEX IF NOT EXISTS idx_verifications_queue
  ON "Verifications"(status, "verifierId", "createdAt" DESC);

-- Composite index for retirement lookups
CREATE INDEX IF NOT EXISTS idx_retirements_lookup
  ON "Retirements"("userId", status, "retirementDate" DESC);

-- Full-text search index on project descriptions
CREATE INDEX IF NOT EXISTS idx_projects_description_fts
  ON "Projects" USING gin(to_tsvector('english', COALESCE(description, '')));

-- Partial index for available verified credits (hot path)
CREATE INDEX IF NOT EXISTS idx_credits_available_verified
  ON "CarbonCredits"(status, "verificationStatus")
  WHERE status = 'available' AND "verificationStatus" = 'verified';

-- Record migration
INSERT INTO schema_migrations(version) VALUES ('002')
  ON CONFLICT (version) DO NOTHING;

COMMIT;
