const express = require('express');
const { CarbonCredit, Transaction, Project, Emission, MarketData, Verification } = require('../models');
const { sequelize } = require('../models');
const auth = require('../middleware/auth');
const { callOpenRouter } = require('../services/openrouter');
const router = express.Router();

router.get('/stats', async (req, res) => {
  try {
    const totalCredits = await CarbonCredit.count();
    const availableCredits = await CarbonCredit.count({ where: { status: 'available' } });
    const totalTransactions = await Transaction.count();
    const totalProjects = await Project.count();
    const totalEmissions = await Emission.sum('amount') || 0;
    const totalVerifications = await Verification.count();
    const verifiedCredits = await Verification.count({ where: { status: 'approved' } });

    const recentMarket = await MarketData.findAll({ order: [['date', 'DESC']], limit: 5 });
    const avgPrice = recentMarket.length > 0 ? recentMarket.reduce((s, m) => s + m.price, 0) / recentMarket.length : 0;

    const txnVolume = await Transaction.sum('totalPrice') || 0;

    res.json({
      totalCredits, availableCredits, totalTransactions, totalProjects,
      totalEmissions: Math.round(totalEmissions * 100) / 100,
      totalVerifications, verifiedCredits, avgMarketPrice: Math.round(avgPrice * 100) / 100,
      transactionVolume: Math.round(txnVolume * 100) / 100
    });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// AI: Dashboard insights
router.get('/ai-insights', auth, async (req, res) => {
  try {
    const stats = {
      credits: await CarbonCredit.count(),
      transactions: await Transaction.count(),
      projects: await Project.count(),
      emissions: await Emission.sum('amount') || 0,
      volume: await Transaction.sum('totalPrice') || 0
    };

    const prompt = `As a carbon market AI analyst, provide dashboard insights based on this marketplace data:
    - Total Credits Listed: ${stats.credits}
    - Total Transactions: ${stats.transactions}
    - Active Projects: ${stats.projects}
    - Total Emissions Tracked: ${stats.emissions} tCO2e
    - Transaction Volume: $${stats.volume}

    Provide:
    1. Market Health Assessment
    2. Key Trends
    3. Actionable Recommendations
    4. Risk Alerts
    5. Opportunity Highlights`;

    const insights = await callOpenRouter(prompt);
    res.json({ stats, aiInsights: insights });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
