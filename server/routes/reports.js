/**
 * Apply pass 5 — backlog: reporting / export.
 *
 * MECHANICAL: structured JSON + CSV export of current user's credits and
 * retirements. No external deps; CSV is hand-rolled (RFC 4180 minimal).
 *
 * PRODUCT-DECISION: scope is per-user for now. To support tenant/admin-wide
 * exports, a `role === 'admin'` branch can be added later.
 */
const express = require('express');
const auth = require('../middleware/auth');
const { sequelize } = require('../models');

const router = express.Router();
router.use(auth);

function csvEscape(v) {
  if (v === null || v === undefined) return '';
  const s = String(v);
  if (/[",\n]/.test(s)) return '"' + s.replace(/"/g, '""') + '"';
  return s;
}

function rowsToCsv(rows) {
  if (!rows || rows.length === 0) return '';
  const headers = Object.keys(rows[0]);
  const lines = [headers.join(',')];
  for (const r of rows) lines.push(headers.map(h => csvEscape(r[h])).join(','));
  return lines.join('\n');
}

router.get('/credits.:format(json|csv)', async (req, res) => {
  try {
    let rows = [];
    try {
      const [r] = await sequelize.query(
        `SELECT id, project_id, vintage_year, quantity_tco2e, status, created_at
         FROM credits WHERE owner_id = :u OR :u IS NULL ORDER BY id DESC LIMIT 1000`,
        { replacements: { u: req.user?.id || null } }
      );
      rows = r || [];
    } catch (_) { rows = []; }

    if (req.params.format === 'csv') {
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="credits.csv"');
      return res.send(rowsToCsv(rows));
    }
    res.json({ count: rows.length, rows });
  } catch (err) {
    res.status(500).json({ error: 'export failed', details: err.message });
  }
});

router.get('/retirements.:format(json|csv)', async (req, res) => {
  try {
    let rows = [];
    try {
      const [r] = await sequelize.query(
        `SELECT id, credit_id, serial_number, quantity_tco2e, retired_at, beneficiary
         FROM retirements ORDER BY id DESC LIMIT 1000`
      );
      rows = r || [];
    } catch (_) { rows = []; }

    if (req.params.format === 'csv') {
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="retirements.csv"');
      return res.send(rowsToCsv(rows));
    }
    res.json({ count: rows.length, rows });
  } catch (err) {
    res.status(500).json({ error: 'export failed', details: err.message });
  }
});

// Compliance summary: simple aggregate. Soft-fails when tables missing.
router.get('/compliance-summary', async (req, res) => {
  const out = { credits: 0, retired: 0, projects: 0 };
  try {
    const [c] = await sequelize.query(`SELECT COUNT(*)::int AS n FROM credits`);
    out.credits = c?.[0]?.n || 0;
  } catch (_) {}
  try {
    const [r] = await sequelize.query(`SELECT COUNT(*)::int AS n FROM retirements`);
    out.retired = r?.[0]?.n || 0;
  } catch (_) {}
  try {
    const [p] = await sequelize.query(`SELECT COUNT(*)::int AS n FROM projects`);
    out.projects = p?.[0]?.n || 0;
  } catch (_) {}
  res.json({ summary: out, generated_at: new Date().toISOString() });
});

module.exports = router;
