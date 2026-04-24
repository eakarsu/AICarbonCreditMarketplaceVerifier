const express = require('express');
const { Emission } = require('../models');
const auth = require('../middleware/auth');
const { callOpenRouter } = require('../services/openrouter');
const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const items = await Emission.findAll({ order: [['createdAt', 'DESC']] });
    res.json(items);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/:id', async (req, res) => {
  try {
    const item = await Emission.findByPk(req.params.id);
    if (!item) return res.status(404).json({ error: 'Emission not found' });
    res.json(item);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/', auth, async (req, res) => {
  try {
    const item = await Emission.create({ ...req.body, userId: req.user.id });
    res.status(201).json(item);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.put('/:id', auth, async (req, res) => {
  try {
    const item = await Emission.findByPk(req.params.id);
    if (!item) return res.status(404).json({ error: 'Emission not found' });
    await item.update(req.body);
    res.json(item);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    const item = await Emission.findByPk(req.params.id);
    if (!item) return res.status(404).json({ error: 'Emission not found' });
    await item.destroy();
    res.json({ message: 'Emission deleted' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// AI: Calculate carbon footprint
router.post('/ai-calculate', auth, async (req, res) => {
  try {
    const { activities } = req.body;
    const prompt = `Calculate the carbon footprint for these activities and provide reduction recommendations:
    Activities: ${JSON.stringify(activities || req.body)}

    Provide:
    1. Total Carbon Footprint (tCO2e)
    2. Breakdown by Category
    3. Comparison to Industry Average
    4. Top 5 Reduction Opportunities
    5. Recommended Offset Amount
    6. Cost Estimate for Offsetting
    7. Sustainability Score (A-F)`;

    const analysis = await callOpenRouter(prompt);
    res.json({ aiCalculation: analysis });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// AI: Emission reduction plan
router.post('/ai-reduction-plan', auth, async (req, res) => {
  try {
    const emissions = await Emission.findAll({ where: { userId: req.user.id } });
    const total = emissions.reduce((sum, e) => sum + e.amount, 0);

    const prompt = `Create a comprehensive emission reduction plan based on these emissions:
    Total Emissions: ${total} tCO2e
    Emission Sources: ${JSON.stringify(emissions.map(e => ({ category: e.category, source: e.source, amount: e.amount, scope: e.scope })))}

    Provide:
    1. Current Emission Profile Summary
    2. Short-term Reduction Goals (6 months)
    3. Medium-term Reduction Goals (1-2 years)
    4. Long-term Reduction Goals (3-5 years)
    5. Specific Action Items per Category
    6. Expected Cost Savings
    7. Carbon Credit Offset Recommendations
    8. Progress Tracking Metrics`;

    const plan = await callOpenRouter(prompt);
    res.json({ totalEmissions: total, emissionCount: emissions.length, aiReductionPlan: plan });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
