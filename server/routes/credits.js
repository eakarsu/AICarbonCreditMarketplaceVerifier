const express = require('express');
const { CarbonCredit, User } = require('../models');
const auth = require('../middleware/auth');
const { callOpenRouter } = require('../services/openrouter');
const router = express.Router();

// Helper: build org-scoped where clause for admin vs regular user
function orgScopeWhere(req) {
  if (req.user?.role === 'admin') return {};
  return { sellerId: req.user.id };
}

// Get all credits
router.get('/', async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 20));
    const offset = (page - 1) * limit;

    const { count, rows } = await CarbonCredit.findAndCountAll({
      include: [{ model: User, as: 'seller', attributes: ['name', 'company'] }],
      order: [['createdAt', 'DESC']],
      limit,
      offset,
    });
    res.json({ data: rows, pagination: { page, limit, total: count, totalPages: Math.ceil(count / limit) } });
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
    const { name, projectType, quantity, pricePerTon } = req.body;
    if (!name || !projectType || quantity === undefined || pricePerTon === undefined) {
      return res.status(400).json({ error: 'Missing required fields: name, projectType, quantity, pricePerTon.' });
    }
    if (isNaN(Number(quantity)) || Number(quantity) <= 0) {
      return res.status(400).json({ error: 'quantity must be a positive number.' });
    }
    if (isNaN(Number(pricePerTon)) || Number(pricePerTon) <= 0) {
      return res.status(400).json({ error: 'pricePerTon must be a positive number.' });
    }
    const credit = await CarbonCredit.create({ ...req.body, sellerId: req.user.id });
    res.status(201).json(credit);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// GET /api/credits/my — org-scoped credits for authenticated user
router.get('/my', auth, async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 20));
    const offset = (page - 1) * limit;

    const { count, rows } = await CarbonCredit.findAndCountAll({
      where: orgScopeWhere(req),
      include: [{ model: User, as: 'seller', attributes: ['name', 'company'] }],
      order: [['createdAt', 'DESC']],
      limit,
      offset,
    });
    res.json({ data: rows, pagination: { page, limit, total: count, totalPages: Math.ceil(count / limit) } });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Update credit
router.put('/:id', auth, async (req, res) => {
  try {
    const credit = await CarbonCredit.findByPk(req.params.id);
    if (!credit) return res.status(404).json({ error: 'Credit not found' });
    if (req.user.role !== 'admin' && credit.sellerId !== req.user.id) {
      return res.status(403).json({ error: 'Access denied. You do not own this credit.' });
    }
    await credit.update(req.body);
    res.json(credit);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Delete credit
router.delete('/:id', auth, async (req, res) => {
  try {
    const credit = await CarbonCredit.findByPk(req.params.id);
    if (!credit) return res.status(404).json({ error: 'Credit not found' });
    if (req.user.role !== 'admin' && credit.sellerId !== req.user.id) {
      return res.status(403).json({ error: 'Access denied. You do not own this credit.' });
    }
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
