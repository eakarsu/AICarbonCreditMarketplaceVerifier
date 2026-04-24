const express = require('express');
const { CarbonCredit, User } = require('../models');
const auth = require('../middleware/auth');
const { callOpenRouter } = require('../services/openrouter');
const router = express.Router();

// Get all credits
router.get('/', async (req, res) => {
  try {
    const credits = await CarbonCredit.findAll({ include: [{ model: User, as: 'seller', attributes: ['name', 'company'] }], order: [['createdAt', 'DESC']] });
    res.json(credits);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Get single credit
router.get('/:id', async (req, res) => {
  try {
    const credit = await CarbonCredit.findByPk(req.params.id, { include: [{ model: User, as: 'seller', attributes: ['name', 'company'] }] });
    if (!credit) return res.status(404).json({ error: 'Credit not found' });
    res.json(credit);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Create credit
router.post('/', auth, async (req, res) => {
  try {
    const credit = await CarbonCredit.create({ ...req.body, sellerId: req.user.id });
    res.status(201).json(credit);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Update credit
router.put('/:id', auth, async (req, res) => {
  try {
    const credit = await CarbonCredit.findByPk(req.params.id);
    if (!credit) return res.status(404).json({ error: 'Credit not found' });
    await credit.update(req.body);
    res.json(credit);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Delete credit
router.delete('/:id', auth, async (req, res) => {
  try {
    const credit = await CarbonCredit.findByPk(req.params.id);
    if (!credit) return res.status(404).json({ error: 'Credit not found' });
    await credit.destroy();
    res.json({ message: 'Credit deleted' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// AI: Analyze credit quality
router.post('/:id/ai-analyze', auth, async (req, res) => {
  try {
    const credit = await CarbonCredit.findByPk(req.params.id);
    if (!credit) return res.status(404).json({ error: 'Credit not found' });

    const prompt = `Analyze this carbon credit for quality and investment potential:
    - Name: ${credit.name}
    - Project Type: ${credit.projectType}
    - Vintage: ${credit.vintage}
    - Quantity: ${credit.quantity} tons
    - Price: $${credit.pricePerTon}/ton
    - Registry: ${credit.registry}
    - Country: ${credit.country}
    - Methodology: ${credit.methodology}
    - Description: ${credit.description}

    Provide a detailed analysis including:
    1. Quality Assessment (score out of 100)
    2. Investment Rating (Strong Buy / Buy / Hold / Sell)
    3. Risk Factors
    4. Market Comparison
    5. Environmental Impact Assessment
    6. Recommendations`;

    const analysis = await callOpenRouter(prompt);
    res.json({ credit, aiAnalysis: analysis });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// AI: Price suggestion
router.post('/ai-price-suggestion', auth, async (req, res) => {
  try {
    const { projectType, vintage, quantity, country, methodology } = req.body;
    const prompt = `Suggest a fair market price for this carbon credit:
    - Project Type: ${projectType}
    - Vintage: ${vintage}
    - Quantity: ${quantity} tons
    - Country: ${country}
    - Methodology: ${methodology}

    Provide:
    1. Suggested Price Range ($/ton)
    2. Market Benchmark Comparison
    3. Price Factors Analysis
    4. Pricing Confidence Level
    5. Market Trend Prediction`;

    const suggestion = await callOpenRouter(prompt);
    res.json({ aiSuggestion: suggestion });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
