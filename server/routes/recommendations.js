const express = require('express');
const { OffsetRecommendation, Emission } = require('../models');
const auth = require('../middleware/auth');
const { callOpenRouter } = require('../services/openrouter');
const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const items = await OffsetRecommendation.findAll({ order: [['createdAt', 'DESC']] });
    res.json(items);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/:id', async (req, res) => {
  try {
    const item = await OffsetRecommendation.findByPk(req.params.id);
    if (!item) return res.status(404).json({ error: 'Recommendation not found' });
    res.json(item);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/', auth, async (req, res) => {
  try {
    const item = await OffsetRecommendation.create({ ...req.body, userId: req.user.id });
    res.status(201).json(item);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.put('/:id', auth, async (req, res) => {
  try {
    const item = await OffsetRecommendation.findByPk(req.params.id);
    if (!item) return res.status(404).json({ error: 'Recommendation not found' });
    await item.update(req.body);
    res.json(item);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    const item = await OffsetRecommendation.findByPk(req.params.id);
    if (!item) return res.status(404).json({ error: 'Recommendation not found' });
    await item.destroy();
    res.json({ message: 'Recommendation deleted' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// AI: Generate offset recommendations
router.post('/ai-generate', auth, async (req, res) => {
  try {
    const emissions = await Emission.findAll({ where: { userId: req.user.id } });
    const totalEmissions = emissions.reduce((sum, e) => sum + e.amount, 0);

    const prompt = `Based on these emissions, recommend the best carbon offset credits to purchase:
    Total Emissions: ${totalEmissions} tCO2e
    Emission Breakdown: ${JSON.stringify(emissions.map(e => ({ category: e.category, source: e.source, amount: e.amount })))}
    Budget Preference: ${req.body.budget || 'moderate'}
    Priority: ${req.body.priority || 'balanced between cost and quality'}

    Provide:
    1. Top 5 Recommended Credit Types
    2. Cost-Benefit Analysis for Each
    3. Total Estimated Cost
    4. Environmental Impact Score
    5. Portfolio Diversification Strategy
    6. Risk Assessment
    7. Timeline for Offset Achievement
    8. Co-benefit Analysis`;

    const recommendation = await callOpenRouter(prompt);
    const saved = await OffsetRecommendation.create({
      userId: req.user.id,
      emissionAmount: totalEmissions,
      aiAnalysis: recommendation,
      estimatedCost: totalEmissions * 15,
      priority: req.body.priority || 'medium'
    });

    res.json({ recommendation: saved, aiRecommendation: recommendation });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
