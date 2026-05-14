const express = require('express');
const { CarbonCredit, User } = require('../models');
const auth = require('../middleware/auth');
const aiRateLimiter = require('../middleware/rateLimiter');
const { callOpenRouter, parseJsonResponse } = require('../services/openrouter');
const router = express.Router();

const SYSTEM_PROMPT = 'You are an expert carbon credit analyst with deep knowledge of voluntary carbon markets, UNFCCC methodologies, Gold Standard, and VCS certification frameworks.';

// GET /api/buyer/browse — Browse available credits with AI match scoring against buyer ESG goals
router.get('/browse', auth, async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 20));
    const offset = (page - 1) * limit;

    // Parse buyer ESG goals from query params if provided
    const { project_type, registry, country, min_price, max_price, vintage_from, vintage_to } = req.query;

    const where = { status: 'available', verificationStatus: 'verified' };
    const filterClauses = [];

    if (project_type) filterClauses.push({ projectType: project_type });
    if (registry) filterClauses.push({ registry });
    if (country) filterClauses.push({ country });

    const { Op } = require('sequelize');
    if (min_price) where.pricePerTon = { ...(where.pricePerTon || {}), [Op.gte]: parseFloat(min_price) };
    if (max_price) where.pricePerTon = { ...(where.pricePerTon || {}), [Op.lte]: parseFloat(max_price) };
    if (vintage_from) where.vintage = { ...(where.vintage || {}), [Op.gte]: parseInt(vintage_from) };
    if (vintage_to) where.vintage = { ...(where.vintage || {}), [Op.lte]: parseInt(vintage_to) };

    const { count, rows: credits } = await CarbonCredit.findAndCountAll({
      where,
      include: [{ model: User, as: 'seller', attributes: ['name', 'company'] }],
      order: [['createdAt', 'DESC']],
      limit,
      offset,
    });

    // Compute basic match score for each credit against buyer profile
    const esgGoals = req.query.esg_goals ? req.query.esg_goals.split(',').map((g) => g.trim().toLowerCase()) : [];

    const scoredCredits = credits.map((credit) => {
      let matchScore = 50; // baseline
      const creditJson = credit.toJSON();

      if (esgGoals.length > 0) {
        const descriptionText = [
          creditJson.projectType,
          creditJson.description,
          creditJson.methodology,
          creditJson.country,
        ].filter(Boolean).join(' ').toLowerCase();

        esgGoals.forEach((goal) => {
          if (descriptionText.includes(goal)) matchScore += 10;
        });
        matchScore = Math.min(100, matchScore);
      }

      // Vintage recency bonus
      const currentYear = new Date().getFullYear();
      if (creditJson.vintage && currentYear - creditJson.vintage <= 2) matchScore += 10;
      if (creditJson.vintage && currentYear - creditJson.vintage > 5) matchScore -= 10;

      return { ...creditJson, matchScore: Math.min(100, Math.max(0, matchScore)) };
    });

    // Sort by match score descending
    scoredCredits.sort((a, b) => b.matchScore - a.matchScore);

    res.json({
      data: scoredCredits,
      pagination: { page, limit, total: count, totalPages: Math.ceil(count / limit) },
    });
  } catch (err) {
    console.error('Error in buyer browse:', err);
    res.status(500).json({ error: err.message });
  }
});

// POST /api/buyer/recommend — AI-powered portfolio diversification recommendation
// Body: { esg_goals, budget }
router.post('/recommend', auth, aiRateLimiter, async (req, res) => {
  try {
    const { esg_goals, budget } = req.body;
    if (!esg_goals || !budget) {
      return res.status(400).json({ error: 'esg_goals and budget are required.' });
    }
    if (typeof budget !== 'number' || budget <= 0) {
      return res.status(400).json({ error: 'budget must be a positive number.' });
    }

    // Fetch a sample of available verified credits for context
    const availableCredits = await CarbonCredit.findAll({
      where: { status: 'available', verificationStatus: 'verified' },
      attributes: ['id', 'name', 'projectType', 'vintage', 'quantity', 'pricePerTon', 'registry', 'country', 'methodology'],
      limit: 50,
      order: [['createdAt', 'DESC']],
    });

    const prompt = `Recommend an optimal carbon credit portfolio based on the buyer's ESG goals and budget. Respond in valid JSON.

Buyer ESG Goals: ${Array.isArray(esg_goals) ? esg_goals.join(', ') : esg_goals}
Total Budget: $${budget} USD
Available Credits (sample): ${JSON.stringify(availableCredits.map((c) => c.toJSON()))}
Analysis Date: ${new Date().toISOString().split('T')[0]}

Return JSON with this structure:
{
  "portfolio_overview": {
    "total_budget_usd": 0,
    "recommended_spend_usd": 0,
    "estimated_tco2e_offset": 0,
    "diversification_score": 0
  },
  "recommended_allocations": [
    {
      "credit_id": "",
      "credit_name": "",
      "project_type": "",
      "registry": "",
      "country": "",
      "vintage": 0,
      "quantity_to_buy": 0,
      "price_per_ton": 0,
      "total_cost_usd": 0,
      "allocation_percentage": 0,
      "esg_alignment_score": 0,
      "rationale": ""
    }
  ],
  "esg_impact_summary": {
    "sdg_goals_addressed": [],
    "environmental_impact": "",
    "social_impact": "",
    "governance_quality": ""
  },
  "diversification_breakdown": {
    "by_project_type": [],
    "by_geography": [],
    "by_registry": [],
    "by_vintage": []
  },
  "risk_assessment": {
    "portfolio_risk": "Low|Medium|High",
    "concentration_risk": "",
    "vintage_risk": "",
    "regulatory_risk": ""
  },
  "alternative_strategies": [],
  "summary": ""
}`;

    const raw = await callOpenRouter(prompt, SYSTEM_PROMPT, 2500);
    res.json({ recommendation: parseJsonResponse(raw), budget, esg_goals });
  } catch (err) {
    console.error('Error in buyer recommend:', err);
    res.status(500).json({ error: 'Failed to generate portfolio recommendation.' });
  }
});

module.exports = router;
