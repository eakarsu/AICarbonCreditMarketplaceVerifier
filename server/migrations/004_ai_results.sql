CREATE TABLE IF NOT EXISTS "AIResults" (
  id SERIAL PRIMARY KEY,
  "userId" INTEGER REFERENCES "Users"(id) ON DELETE SET NULL,
  feature VARCHAR(120) NOT NULL,
  input JSONB,
  output JSONB,
  model VARCHAR(255),
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ai_results_user ON "AIResults"("userId");
CREATE INDEX IF NOT EXISTS idx_ai_results_feature ON "AIResults"(feature);
