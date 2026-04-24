const express = require('express');
const { ComplianceReport } = require('../models');
const auth = require('../middleware/auth');
const { callOpenRouter } = require('../services/openrouter');
const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const items = await ComplianceReport.findAll({ order: [['createdAt', 'DESC']] });
    res.json(items);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/:id', async (req, res) => {
  try {
    const item = await ComplianceReport.findByPk(req.params.id);
    if (!item) return res.status(404).json({ error: 'Report not found' });
    res.json(item);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/', auth, async (req, res) => {
  try {
    const item = await ComplianceReport.create({ ...req.body, userId: req.user.id });
    res.status(201).json(item);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.put('/:id', auth, async (req, res) => {
  try {
    const item = await ComplianceReport.findByPk(req.params.id);
    if (!item) return res.status(404).json({ error: 'Report not found' });
    await item.update(req.body);
    res.json(item);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    const item = await ComplianceReport.findByPk(req.params.id);
    if (!item) return res.status(404).json({ error: 'Report not found' });
    await item.destroy();
    res.json({ message: 'Report deleted' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// AI: Generate compliance report
router.post('/:id/ai-analyze', auth, async (req, res) => {
  try {
    const report = await ComplianceReport.findByPk(req.params.id);
    if (!report) return res.status(404).json({ error: 'Report not found' });

    const prompt = `Analyze this carbon compliance report and provide recommendations:
    - Report Type: ${report.reportType}
    - Period: ${report.period}
    - Total Emissions: ${report.totalEmissions} tCO2e
    - Total Offsets: ${report.totalOffsets} tCO2e
    - Net Emissions: ${report.netEmissions} tCO2e
    - Regulatory Framework: ${report.regulatoryFramework}
    - Current Status: ${report.complianceStatus}

    Provide:
    1. Compliance Assessment
    2. Gap Analysis
    3. Regulatory Risk Level
    4. Required Actions for Compliance
    5. Cost of Compliance
    6. Timeline to Achieve Compliance
    7. Best Practice Recommendations
    8. Peer Comparison`;

    const analysis = await callOpenRouter(prompt);
    await report.update({ aiRecommendations: analysis });
    res.json({ report, aiAnalysis: analysis });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
