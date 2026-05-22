const express = require('express');
const router = express.Router();

router.post('/score', (req, res) => {
  const credits = Array.isArray(req.body?.credits) ? req.body.credits : [];
  const total = credits.reduce((sum, c) => sum + Number(c.quantity || 0), 0);
  const flagged = credits.filter((c) => c.status === 'retired' || c.double_claimed || Number(c.vintage || 0) < 2018);
  const registrySpread = new Set(credits.map((c) => c.registry).filter(Boolean)).size;
  const score = Math.max(0, Math.min(100, 94 - flagged.length * 14 + Math.min(8, registrySpread * 2)));
  res.json({
    portfolio_score: Math.round(score),
    integrity_band: score >= 80 ? 'strong' : score >= 55 ? 'review' : 'high risk',
    total_tonnes: total,
    flagged_credits: flagged.map((c) => c.name || c.id || 'credit'),
    actions: flagged.length ? ['Review flagged vintages and retirement status.', 'Request registry evidence for each flagged line.'] : ['Portfolio passes deterministic integrity checks.'],
    generated_at: new Date().toISOString(),
  });
});

module.exports = router;
