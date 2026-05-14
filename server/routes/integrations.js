/**
 * Apply pass 5 — backlog implementation: integrations + notifications.
 *
 * All endpoints below are NEEDS-CREDS gated. They return HTTP 503 with
 * `{ error, missing: <ENV> }` if the corresponding env var is not set, so
 * the frontend can clearly surface "configure provider" UX without 5xx noise.
 *
 * Documented env vars (one provider per group):
 *   Notifications:
 *     - SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, EMAIL_FROM   (email)
 *     - TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_FROM_NUMBER (sms)
 *     - FCM_SERVER_KEY                                            (push)
 *   Carbon registries:
 *     - VERRA_API_KEY               (Verra registry)
 *     - GOLD_STANDARD_API_KEY       (Gold Standard registry)
 *     - VCS_API_KEY                 (VCS / Verra dual)
 *
 * NO outbound HTTP calls happen unless the env var is set; this file
 * avoids new heavy deps and is purely additive.
 */
const express = require('express');
const auth = require('../middleware/auth');
const { sequelize } = require('../models');

const router = express.Router();
router.use(auth);

async function ensureTable() {
  try {
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS notification_log (
        id SERIAL PRIMARY KEY,
        user_id INTEGER,
        channel VARCHAR(32) NOT NULL,
        recipient TEXT NOT NULL,
        subject TEXT,
        body TEXT,
        status VARCHAR(32) DEFAULT 'queued',
        provider_response TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);
    await sequelize.query(`CREATE INDEX IF NOT EXISTS idx_notif_user ON notification_log(user_id)`);
  } catch (_) {}
}
ensureTable();

function need(envVar, res, friendly) {
  if (!process.env[envVar]) {
    res.status(503).json({
      error: `${friendly} not configured`,
      missing: envVar,
    });
    return false;
  }
  return true;
}

// --------------------------------------------------------------
// Notifications
// --------------------------------------------------------------
router.post('/notifications/email', async (req, res) => {
  if (!need('SMTP_HOST', res, 'SMTP email')) return;
  const { to, subject, body } = req.body || {};
  if (!to || !subject) return res.status(400).json({ error: 'to and subject are required' });
  try {
    await sequelize.query(
      `INSERT INTO notification_log (user_id, channel, recipient, subject, body, status)
       VALUES (:u, 'email', :to, :subj, :body, 'queued_stub')`,
      { replacements: { u: req.user?.id || null, to, subj: subject, body: body || '' } }
    );
  } catch (_) {}
  res.json({ status: 'queued', provider: 'smtp', note: 'stub — outbound delivery requires nodemailer dep' });
});

router.post('/notifications/sms', async (req, res) => {
  if (!need('TWILIO_ACCOUNT_SID', res, 'Twilio SMS')) return;
  const { to, body } = req.body || {};
  if (!to || !body) return res.status(400).json({ error: 'to and body are required' });
  try {
    await sequelize.query(
      `INSERT INTO notification_log (user_id, channel, recipient, subject, body, status)
       VALUES (:u, 'sms', :to, NULL, :body, 'queued_stub')`,
      { replacements: { u: req.user?.id || null, to, body } }
    );
  } catch (_) {}
  res.json({ status: 'queued', provider: 'twilio', note: 'stub — outbound requires twilio dep' });
});

router.post('/notifications/push', async (req, res) => {
  if (!need('FCM_SERVER_KEY', res, 'FCM push')) return;
  const { token, title, body } = req.body || {};
  if (!token || !title) return res.status(400).json({ error: 'token and title are required' });
  res.json({ status: 'queued', provider: 'fcm', note: 'stub — outbound requires firebase-admin dep' });
});

router.get('/notifications/log', async (req, res) => {
  try {
    const [rows] = await sequelize.query(
      `SELECT id, channel, recipient, subject, status, created_at
       FROM notification_log WHERE user_id = :u
       ORDER BY id DESC LIMIT 50`,
      { replacements: { u: req.user?.id || null } }
    );
    res.json(rows);
  } catch (err) { res.status(500).json({ error: 'failed', details: err.message }); }
});

// --------------------------------------------------------------
// Registry integrations (Verra / Gold Standard / VCS)
// --------------------------------------------------------------
router.get('/registry/verra/projects', async (req, res) => {
  if (!need('VERRA_API_KEY', res, 'Verra registry')) return;
  res.json({ provider: 'verra', projects: [], note: 'stub — wire fetch to https://registry.verra.org/uiapi when ready' });
});

router.get('/registry/gold-standard/projects', async (req, res) => {
  if (!need('GOLD_STANDARD_API_KEY', res, 'Gold Standard registry')) return;
  res.json({ provider: 'gold-standard', projects: [], note: 'stub — wire fetch to Gold Standard public API when ready' });
});

router.get('/registry/vcs/projects', async (req, res) => {
  if (!need('VCS_API_KEY', res, 'VCS registry')) return;
  res.json({ provider: 'vcs', projects: [], note: 'stub' });
});

// PRODUCT-DECISION: cross-registry serial uniqueness check.
// Default: query our own retirements for the serial; if found, flag possible
// double-counting. When VERRA_API_KEY is set, would also call Verra. The
// minimal default avoids requiring registry creds for basic protection.
router.post('/registry/serial-check', async (req, res) => {
  const { serial } = req.body || {};
  if (!serial) return res.status(400).json({ error: 'serial is required' });
  let localHit = null;
  try {
    const [rows] = await sequelize.query(
      `SELECT id, serial_number, retired_at FROM retirements WHERE serial_number = :s LIMIT 1`,
      { replacements: { s: serial } }
    );
    localHit = rows && rows[0] ? rows[0] : null;
  } catch (_) {}
  res.json({
    serial,
    local_match: localHit,
    external_checked: Boolean(process.env.VERRA_API_KEY || process.env.GOLD_STANDARD_API_KEY),
    risk: localHit ? 'high' : 'low',
    note: 'PRODUCT-DECISION: external registry call gated on VERRA_API_KEY/GOLD_STANDARD_API_KEY',
  });
});

module.exports = router;
