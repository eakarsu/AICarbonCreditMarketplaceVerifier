const express = require('express');
const { MarketData } = require('../models');
const auth = require('../middleware/auth');
const { callOpenRouter } = require('../services/openrouter');
const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const items = await MarketData.findAll({ order: [['date', 'DESC']] });
    res.json(items);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/:id', async (req, res) => {
  try {
    const item = await MarketData.findByPk(req.params.id);
    if (!item) return res.status(404).json({ error: 'Market data not found' });
    res.json(item);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/', auth, async (req, res) => {
  try {
    const item = await MarketData.create(req.body);
    res.status(201).json(item);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.put('/:id', auth, async (req, res) => {
  try {
    const item = await MarketData.findByPk(req.params.id);
    if (!item) return res.status(404).json({ error: 'Market data not found' });
    await item.update(req.body);
    res.json(item);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    const item = await MarketData.findByPk(req.params.id);
    if (!item) return res.status(404).json({ error: 'Market data not found' });
    await item.destroy();
    res.json({ message: 'Market data deleted' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// AI: Market prediction
router.post('/ai-predict', auth, async (req, res) => {
  try {
    const recentData = await MarketData.findAll({ order: [['date', 'DESC']], limit: 20 });
    const prompt = `Analyze carbon credit market data and predict future trends:
    Recent Market Data: ${JSON.stringify(recentData.map(d => ({ type: d.creditType, price: d.price, volume: d.volume, date: d.date, change: d.changePercent })))}

    Provide:
    1. Current Market Overview
    2. Price Trend Analysis
    3. Volume Analysis
    4. 30-Day Price Prediction
    5. 90-Day Price Prediction
    6. Key Market Drivers
    7. Risk Factors
    8. Investment Opportunities
    9. Market Sentiment (Bullish/Bearish/Neutral)`;

    const prediction = await callOpenRouter(prompt);
    res.json({ aiPrediction: prediction });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
