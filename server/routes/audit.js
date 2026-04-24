const express = require('express');
const { AuditLog } = require('../models');
const auth = require('../middleware/auth');
const { callOpenRouter } = require('../services/openrouter');
const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const items = await AuditLog.findAll({ order: [['timestamp', 'DESC']] });
    res.json(items);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/:id', async (req, res) => {
  try {
    const item = await AuditLog.findByPk(req.params.id);
    if (!item) return res.status(404).json({ error: 'Audit log not found' });
    res.json(item);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/', auth, async (req, res) => {
  try {
    const item = await AuditLog.create({ ...req.body, userId: req.user.id, ipAddress: req.ip });
    res.status(201).json(item);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    const item = await AuditLog.findByPk(req.params.id);
    if (!item) return res.status(404).json({ error: 'Audit log not found' });
    await item.destroy();
    res.json({ message: 'Audit log deleted' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// AI: Audit pattern analysis
router.post('/ai-analyze-patterns', auth, async (req, res) => {
  try {
    const logs = await AuditLog.findAll({ order: [['timestamp', 'DESC']], limit: 50 });

    const prompt = `Analyze these audit trail logs for security patterns and anomalies:
    Recent Audit Logs: ${JSON.stringify(logs.map(l => ({
      action: l.action, entityType: l.entityType, entityId: l.entityId,
      details: l.details, ip: l.ipAddress, time: l.timestamp, userId: l.userId
    })))}

    Provide:
    1. Security Risk Score (1-100)
    2. Anomaly Detection Results
    3. Suspicious Activity Patterns
    4. User Behavior Analysis
    5. IP Address Analysis
    6. Access Pattern Summary
    7. Compliance Audit Status
    8. Recommended Security Actions
    9. Fraud Risk Assessment`;

    const analysis = await callOpenRouter(prompt);
    res.json({ logCount: logs.length, aiPatternAnalysis: analysis });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// AI: Single audit log analysis
router.post('/:id/ai-analyze', auth, async (req, res) => {
  try {
    const item = await AuditLog.findByPk(req.params.id);
    if (!item) return res.status(404).json({ error: 'Audit log not found' });

    const prompt = `Analyze this specific audit log entry for security implications:
    - Action: ${item.action}
    - Entity: ${item.entityType} #${item.entityId}
    - Details: ${item.details}
    - IP Address: ${item.ipAddress}
    - Timestamp: ${item.timestamp}
    - User ID: ${item.userId}

    Provide:
    1. Risk Level Assessment
    2. Action Legitimacy Check
    3. Contextual Analysis
    4. Related Action Recommendations
    5. Compliance Implications`;

    const analysis = await callOpenRouter(prompt);
    res.json({ auditLog: item, aiAnalysis: analysis });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
