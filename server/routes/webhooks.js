const express = require('express');
const auth = require('../middleware/auth');
const { sequelize } = require('../models');

const router = express.Router();

const ALLOWED_EVENTS = [
  'credit.created', 'credit.verified', 'credit.retired',
  'transaction.completed', 'project.added', 'verification.passed', 'verification.rejected',
  'compliance.report_generated', 'market_data.updated'
];

async function ensureTable() {
  await sequelize.query(`
    CREATE TABLE IF NOT EXISTS webhooks (
      id SERIAL PRIMARY KEY,
      user_id INTEGER,
      url TEXT NOT NULL,
      events TEXT[] NOT NULL DEFAULT ARRAY['credit.verified']::text[],
      secret VARCHAR(255),
      active BOOLEAN DEFAULT true,
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    )
  `).catch(() => {});
  await sequelize.query(`CREATE INDEX IF NOT EXISTS idx_webhooks_user ON webhooks(user_id)`).catch(() => {});
}
ensureTable();

router.use(auth);

router.get('/', async (req, res) => {
  try {
    const [rows] = await sequelize.query(
      'SELECT id, url, events, active, created_at, updated_at FROM webhooks WHERE user_id = :uid ORDER BY created_at DESC',
      { replacements: { uid: req.user?.id || null } }
    );
    res.json(rows);
  } catch (err) { res.status(500).json({ error: 'Failed to list webhooks', details: err.message }); }
});

router.post('/', async (req, res) => {
  try {
    const { url, events, secret } = req.body || {};
    if (!url || typeof url !== 'string') return res.status(400).json({ error: 'url is required' });
    try { new URL(url); } catch (_) { return res.status(400).json({ error: 'url must be a valid URL' }); }

    const incoming = Array.isArray(events) && events.length > 0 ? events : ['credit.verified'];
    const filtered = incoming.filter(e => ALLOWED_EVENTS.includes(e));
    if (filtered.length === 0) return res.status(400).json({ error: 'no valid events provided', allowed: ALLOWED_EVENTS });

    const [rows] = await sequelize.query(
      `INSERT INTO webhooks (user_id, url, events, secret) VALUES (:uid, :url, ARRAY[:events]::text[], :secret)
       RETURNING id, url, events, active, created_at`,
      { replacements: { uid: req.user?.id || null, url, events: filtered, secret: secret || null } }
    );
    res.status(201).json(rows[0]);
  } catch (err) { res.status(500).json({ error: 'Failed to create webhook', details: err.message }); }
});

router.delete('/:id', async (req, res) => {
  try {
    const [rows] = await sequelize.query(
      'DELETE FROM webhooks WHERE id = :id AND user_id = :uid RETURNING id',
      { replacements: { id: req.params.id, uid: req.user?.id || null } }
    );
    if (!rows || rows.length === 0) return res.status(404).json({ error: 'Webhook not found' });
    res.json({ success: true, deleted: rows[0].id });
  } catch (err) { res.status(500).json({ error: 'Failed to delete webhook', details: err.message }); }
});

router.post('/:id/test', async (req, res) => {
  try {
    const [rows] = await sequelize.query(
      'SELECT id, url, events FROM webhooks WHERE id = :id AND user_id = :uid',
      { replacements: { id: req.params.id, uid: req.user?.id || null } }
    );
    if (!rows || rows.length === 0) return res.status(404).json({ error: 'Webhook not found' });
    const wh = rows[0];
    const payload = {
      event: 'webhook.test',
      delivery_id: `test_${Date.now()}`,
      timestamp: new Date().toISOString(),
      data: { message: 'Test webhook from AICarbonCreditMarketplaceVerifier' }
    };
    res.json({ success: true, target: wh.url, events: wh.events, payload, note: 'Stub: payload generated, no outgoing HTTP call performed.' });
  } catch (err) { res.status(500).json({ error: 'Failed to test webhook', details: err.message }); }
});

router.get('/_/events', (req, res) => res.json({ events: ALLOWED_EVENTS }));

module.exports = router;
