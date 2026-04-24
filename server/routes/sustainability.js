const express = require('express');
const { SustainabilityReport } = require('../models');
const auth = require('../middleware/auth');
const { callOpenRouter } = require('../services/openrouter');
const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const items = await SustainabilityReport.findAll({ order: [['createdAt', 'DESC']] });
    res.json(items);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/:id', async (req, res) => {
  try {
    const item = await SustainabilityReport.findByPk(req.params.id);
    if (!item) return res.status(404).json({ error: 'Report not found' });
    res.json(item);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/', auth, async (req, res) => {
  try {
    const item = await SustainabilityReport.create({ ...req.body, userId: req.user.id });
    res.status(201).json(item);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.put('/:id', auth, async (req, res) => {
  try {
    const item = await SustainabilityReport.findByPk(req.params.id);
    if (!item) return res.status(404).json({ error: 'Report not found' });
    await item.update(req.body);
    res.json(item);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    const item = await SustainabilityReport.findByPk(req.params.id);
    if (!item) return res.status(404).json({ error: 'Report not found' });
    await item.destroy();
    res.json({ message: 'Report deleted' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// AI: Generate sustainability insights
router.post('/:id/ai-insights', auth, async (req, res) => {
  try {
    const report = await SustainabilityReport.findByPk(req.params.id);
    if (!report) return res.status(404).json({ error: 'Report not found' });

    const prompt = `Generate comprehensive sustainability insights for this report:
    - Title: ${report.title}
    - Period: ${report.period}
    - Total Emissions: ${report.totalEmissions} tCO2e
    - Reduction Target: ${report.reductionTarget}%
    - Actual Reduction: ${report.actualReduction}%
    - Frameworks: ${report.frameworks}

    Provide:
    1. Executive Summary
    2. Performance Against Targets
    3. Industry Benchmarking
    4. Key Achievements
    5. Areas for Improvement
    6. Stakeholder Impact Assessment
    7. ESG Score Estimate
    8. Future Roadmap Recommendations
    9. Regulatory Compliance Status
    10. Communication Strategy for Stakeholders`;

    const insights = await callOpenRouter(prompt);
    await report.update({ aiInsights: insights });
    res.json({ report, aiInsights: insights });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
