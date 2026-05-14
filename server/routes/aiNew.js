const express = require('express');
const auth = require('../middleware/auth');
const aiRateLimiter = require('../middleware/rateLimiter');
const { callOpenRouter, parseJsonResponse } = require('../services/openrouter');
const { AIResult } = require('../models');
const router = express.Router();

const SYSTEM_PROMPT = 'You are an expert carbon credit analyst with deep knowledge of voluntary carbon markets, UNFCCC methodologies, Gold Standard, and VCS certification frameworks.';
const MODEL = 'anthropic/claude-3-5-sonnet-20241022';

async function persistResult(req, feature, input, output) {
  try {
    await AIResult.create({
      userId: req.user?.id || null,
      feature,
      input,
      output,
      model: MODEL,
    });
  } catch (e) {
    console.warn('[ai_results] persist failed:', e.message);
  }
}

function validateBody(fields, body, res) {
  const missing = fields.filter((f) => body[f] === undefined || body[f] === null || body[f] === '');
  if (missing.length > 0) {
    res.status(400).json({ error: `Missing required fields: ${missing.join(', ')}` });
    return false;
  }
  return true;
}

// POST /api/ai/additionality-validator
// Body: { project_data, baseline_scenario }
router.post('/additionality-validator', auth, aiRateLimiter, async (req, res) => {
  try {
    if (!validateBody(['project_data', 'baseline_scenario'], req.body, res)) return;
    const { project_data, baseline_scenario } = req.body;

    const prompt = `Validate the additionality claims for a carbon credit project and identify any questionable aspects. Respond in valid JSON.

Project Data: ${JSON.stringify(project_data)}
Baseline Scenario: ${JSON.stringify(baseline_scenario)}

Return JSON with this structure:
{
  "additionality_score": 0,
  "additionality_status": "Strong|Moderate|Weak|Questionable|Fail",
  "regulatory_surplus_test": {"result": "Pass|Fail", "notes": ""},
  "common_practice_test": {"result": "Pass|Fail|Uncertain", "notes": ""},
  "financial_additionality_test": {"result": "Pass|Fail|Not Applicable", "notes": ""},
  "investment_barrier_test": {"result": "Pass|Fail|Not Applicable", "notes": ""},
  "baseline_credibility": {"score": 0, "methodology_appropriate": true, "concerns": []},
  "questionable_elements": [{"element": "", "concern": "", "severity": "Low|Medium|High", "recommendation": ""}],
  "red_flags": [],
  "supporting_evidence_required": [],
  "methodology_alignment": "",
  "verdict": "Approve|Approve with Conditions|Reject|Requires Further Documentation",
  "summary": ""
}`;

    const raw = await callOpenRouter(prompt, SYSTEM_PROMPT, 2000);
    const analysis = parseJsonResponse(raw);
    await persistResult(req, 'additionality-validator', { project_data, baseline_scenario }, analysis);
    res.json({ analysis });
  } catch (err) {
    console.error('Error in additionality validator:', err);
    res.status(500).json({ error: 'Failed to validate additionality claims.' });
  }
});

// POST /api/ai/vintage-analyzer
// Body: { credits[], vintage_dates[] }
router.post('/vintage-analyzer', auth, aiRateLimiter, async (req, res) => {
  try {
    if (!validateBody(['credits', 'vintage_dates'], req.body, res)) return;
    const { credits, vintage_dates } = req.body;

    if (!Array.isArray(credits) || credits.length === 0) {
      return res.status(400).json({ error: 'credits must be a non-empty array.' });
    }
    if (!Array.isArray(vintage_dates) || vintage_dates.length === 0) {
      return res.status(400).json({ error: 'vintage_dates must be a non-empty array.' });
    }

    const prompt = `Analyze vintage carbon credits for maturity curves, retirement windows, and near-expiry alerts. Respond in valid JSON.

Credits Portfolio: ${JSON.stringify(credits)}
Vintage Dates: ${JSON.stringify(vintage_dates)}
Analysis Date: ${new Date().toISOString().split('T')[0]}

Return JSON with this structure:
{
  "portfolio_summary": {
    "total_credits": 0,
    "total_quantity_tco2e": 0,
    "oldest_vintage": "",
    "newest_vintage": "",
    "average_vintage_age_years": 0
  },
  "maturity_analysis": [
    {
      "vintage_year": 0,
      "quantity": 0,
      "age_years": 0,
      "maturity_stage": "New|Maturing|Mature|Aging|Near-Expiry",
      "price_premium_discount": "",
      "demand_outlook": ""
    }
  ],
  "near_expiry_alerts": [
    {
      "credit_id": "",
      "vintage_year": 0,
      "quantity": 0,
      "urgency": "Immediate|Within 6 months|Within 1 year",
      "recommended_action": ""
    }
  ],
  "optimal_retirement_windows": [
    {
      "vintage_year": 0,
      "recommended_window": "",
      "rationale": ""
    }
  ],
  "portfolio_vintage_risk": "Low|Medium|High",
  "diversification_recommendations": [],
  "market_timing_advice": "",
  "summary": ""
}`;

    const raw = await callOpenRouter(prompt, SYSTEM_PROMPT, 2000);
    const analysis = parseJsonResponse(raw);
    await persistResult(req, 'vintage-analyzer', { credits, vintage_dates }, analysis);
    res.json({ analysis });
  } catch (err) {
    console.error('Error in vintage analyzer:', err);
    res.status(500).json({ error: 'Failed to analyze vintage portfolio.' });
  }
});

// POST /api/ai/market-predictor
// Body: { historical_prices[], credit_type }
router.post('/market-predictor', auth, aiRateLimiter, async (req, res) => {
  try {
    if (!validateBody(['historical_prices', 'credit_type'], req.body, res)) return;
    const { historical_prices, credit_type } = req.body;

    if (!Array.isArray(historical_prices) || historical_prices.length === 0) {
      return res.status(400).json({ error: 'historical_prices must be a non-empty array.' });
    }

    const prompt = `Analyze historical carbon credit price data and predict market trends. Respond in valid JSON.

Credit Type: ${credit_type}
Historical Prices: ${JSON.stringify(historical_prices)}
Analysis Date: ${new Date().toISOString().split('T')[0]}

Return JSON with this structure:
{
  "current_price_assessment": {"price_usd_per_ton": 0, "trend": "Rising|Falling|Stable|Volatile", "momentum": "Bullish|Bearish|Neutral"},
  "price_forecast": {
    "30_day": {"low": 0, "base": 0, "high": 0, "confidence": "Low|Medium|High"},
    "90_day": {"low": 0, "base": 0, "high": 0, "confidence": "Low|Medium|High"},
    "12_month": {"low": 0, "base": 0, "high": 0, "confidence": "Low|Medium|High"}
  },
  "optimal_buy_windows": [{"timeframe": "", "rationale": "", "target_price": 0}],
  "optimal_sell_windows": [{"timeframe": "", "rationale": "", "target_price": 0}],
  "key_price_drivers": [{"driver": "", "impact": "Positive|Negative|Mixed", "weight": "Low|Medium|High"}],
  "regulatory_risk_factors": [],
  "market_liquidity_assessment": "",
  "comparable_credit_types": [],
  "investment_recommendation": "Strong Buy|Buy|Hold|Sell|Strong Sell",
  "risk_rating": "Low|Medium|High|Very High",
  "summary": ""
}`;

    const raw = await callOpenRouter(prompt, SYSTEM_PROMPT, 2000);
    const analysis = parseJsonResponse(raw);
    await persistResult(req, 'market-predictor', { historical_prices, credit_type }, analysis);
    res.json({ analysis, credit_type });
  } catch (err) {
    console.error('Error in market predictor:', err);
    res.status(500).json({ error: 'Failed to generate market prediction.' });
  }
});

// POST /api/ai/compliance-reporter
// Body: { portfolio_data, reporting_period }
router.post('/compliance-reporter', auth, aiRateLimiter, async (req, res) => {
  try {
    if (!validateBody(['portfolio_data', 'reporting_period'], req.body, res)) return;
    const { portfolio_data, reporting_period } = req.body;

    const prompt = `Auto-generate a comprehensive ESG compliance report with emissions reduction tracking. Respond in valid JSON.

Portfolio Data: ${JSON.stringify(portfolio_data)}
Reporting Period: ${reporting_period}
Report Generated: ${new Date().toISOString().split('T')[0]}

Return JSON with this structure:
{
  "report_metadata": {
    "period": "",
    "generated_date": "",
    "reporting_frameworks": [],
    "verification_status": ""
  },
  "executive_summary": "",
  "emissions_baseline": {"total_tco2e": 0, "by_scope": {"scope1": 0, "scope2": 0, "scope3": 0}},
  "offsets_retired": {"total_tco2e": 0, "by_project_type": [], "by_registry": []},
  "net_emissions": {"total_tco2e": 0, "reduction_percentage": 0, "vs_prior_period": ""},
  "reduction_targets": {"stated_target": "", "progress_percentage": 0, "on_track": true},
  "esg_scorecard": {
    "environmental_score": 0,
    "social_score": 0,
    "governance_score": 0,
    "overall_esg_rating": ""
  },
  "sdg_contributions": [{"sdg_number": 0, "sdg_name": "", "contribution": ""}],
  "portfolio_quality_assessment": {"average_credit_quality": "", "registry_diversification": "", "methodology_mix": []},
  "recommendations": [],
  "disclosure_statements": [],
  "compliance_gaps": [],
  "summary": ""
}`;

    const raw = await callOpenRouter(prompt, SYSTEM_PROMPT, 2500);
    const report = parseJsonResponse(raw);
    await persistResult(req, 'compliance-reporter', { portfolio_data, reporting_period }, report);
    res.json({ report, reporting_period });
  } catch (err) {
    console.error('Error in compliance reporter:', err);
    res.status(500).json({ error: 'Failed to generate compliance report.' });
  }
});

// POST /api/ai/certification-tracker
// Body: { certifications[] }
router.post('/certification-tracker', auth, aiRateLimiter, async (req, res) => {
  try {
    if (!validateBody(['certifications'], req.body, res)) return;
    const { certifications } = req.body;

    if (!Array.isArray(certifications) || certifications.length === 0) {
      return res.status(400).json({ error: 'certifications must be a non-empty array.' });
    }

    const prompt = `Monitor carbon credit certifications (Gold Standard, VCS, CDM, Puro.earth, Plan Vivo) and produce an alert + recertification roadmap. Respond in valid JSON.

Certifications: ${JSON.stringify(certifications)}
Today: ${new Date().toISOString().split('T')[0]}

Return JSON with this structure:
{
  "summary_counts": {"valid": 0, "near_expiry": 0, "expired": 0, "in_renewal": 0},
  "expiry_alerts": [
    {"certification_id": "", "registry": "", "name": "", "expiry_date": "", "days_until_expiry": 0, "urgency": "Immediate|30 Days|90 Days|6 Months", "action_required": ""}
  ],
  "recertification_progress": [
    {"certification_id": "", "registry": "", "stage": "", "completion_pct": 0, "next_step": "", "estimated_completion": ""}
  ],
  "registry_breakdown": [{"registry": "", "active": 0, "expiring_within_year": 0, "expired": 0}],
  "recommended_priorities": [],
  "documentation_gaps": [],
  "estimated_renewal_costs_usd": 0,
  "summary": ""
}`;

    const raw = await callOpenRouter(prompt, SYSTEM_PROMPT, 2000);
    const analysis = parseJsonResponse(raw);
    await persistResult(req, 'certification-tracker', { certifications }, analysis);
    res.json({ analysis });
  } catch (err) {
    console.error('Error in certification tracker:', err);
    res.status(500).json({ error: 'Failed to analyze certifications.' });
  }
});

// POST /api/ai/impact-verifier
// Body: { project_data, promised_outcomes, actual_metrics }
router.post('/impact-verifier', auth, aiRateLimiter, async (req, res) => {
  try {
    if (!validateBody(['project_data', 'promised_outcomes', 'actual_metrics'], req.body, res)) return;
    const { project_data, promised_outcomes, actual_metrics } = req.body;

    const prompt = `Verify real-world environmental impact of a carbon project against promised outcomes. Flag underperformance and surface evidence gaps. Respond in valid JSON.

Project: ${JSON.stringify(project_data)}
Promised Outcomes: ${JSON.stringify(promised_outcomes)}
Actual Metrics: ${JSON.stringify(actual_metrics)}

Return JSON with this structure:
{
  "verification_score": 0,
  "performance_status": "Exceeding|On Track|Underperforming|Failing",
  "promised_vs_actual": [
    {"metric": "", "promised": 0, "actual": 0, "delta_pct": 0, "status": "Exceeds|Meets|Below"}
  ],
  "underperformance_flags": [
    {"metric": "", "shortfall": "", "severity": "Low|Medium|High|Critical", "likely_cause": "", "remediation": ""}
  ],
  "evidence_quality": {"score": 0, "missing_evidence": [], "data_integrity_concerns": []},
  "co_benefits_realized": [{"benefit": "", "evidence": "", "quantification": ""}],
  "stakeholder_impact_summary": "",
  "recommended_disclosures": [],
  "follow_up_monitoring": [{"action": "", "frequency": "", "responsible_party": ""}],
  "summary": ""
}`;

    const raw = await callOpenRouter(prompt, SYSTEM_PROMPT, 2200);
    const analysis = parseJsonResponse(raw);
    await persistResult(req, 'impact-verifier', { project_data, promised_outcomes, actual_metrics }, analysis);
    res.json({ analysis });
  } catch (err) {
    console.error('Error in impact verifier:', err);
    res.status(500).json({ error: 'Failed to verify project impact.' });
  }
});

// POST /api/ai/supply-chain-tracer
// Body: { credit_id?, transactions[], project_data? }
router.post('/supply-chain-tracer', auth, aiRateLimiter, async (req, res) => {
  try {
    if (!validateBody(['transactions'], req.body, res)) return;
    const { credit_id, transactions, project_data } = req.body;

    if (!Array.isArray(transactions) || transactions.length === 0) {
      return res.status(400).json({ error: 'transactions must be a non-empty array.' });
    }

    const prompt = `Trace a carbon credit's chain-of-custody. Detect double-counting, verify serialization, and produce a complete provenance audit trail. Respond in valid JSON.

Credit ID: ${credit_id || 'Unknown'}
Project: ${project_data ? JSON.stringify(project_data) : 'Not provided'}
Transactions / Custody Events: ${JSON.stringify(transactions)}

Return JSON with this structure:
{
  "chain_integrity": "Verified|Partial|Compromised",
  "trace_completeness_pct": 0,
  "provenance": [
    {"step": 0, "event_type": "Issuance|Transfer|Custody|Retirement", "date": "", "from": "", "to": "", "quantity_tco2e": 0, "registry_serial": "", "verified": true}
  ],
  "double_counting_risk": {"score": 0, "rationale": "", "evidence": []},
  "serialization_check": {"unique_serials_found": 0, "duplicates_detected": [], "issues": []},
  "registry_verification": [{"registry": "", "verified": true, "discrepancies": []}],
  "missing_links": [],
  "regulatory_red_flags": [],
  "audit_recommendations": [],
  "summary": ""
}`;

    const raw = await callOpenRouter(prompt, SYSTEM_PROMPT, 2200);
    const analysis = parseJsonResponse(raw);
    await persistResult(req, 'supply-chain-tracer', { credit_id, transactions, project_data }, analysis);
    res.json({ analysis, credit_id });
  } catch (err) {
    console.error('Error in supply chain tracer:', err);
    res.status(500).json({ error: 'Failed to trace supply chain.' });
  }
});

// GET /api/ai/results — paginated list of stored AI results
router.get('/results', auth, async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 20));
    const offset = (page - 1) * limit;

    const where = {};
    if (req.query.feature) where.feature = String(req.query.feature);

    const { count, rows } = await AIResult.findAndCountAll({
      where,
      order: [['createdAt', 'DESC']],
      limit,
      offset,
    });

    res.json({
      data: rows,
      pagination: { page, limit, total: count, totalPages: Math.ceil(count / limit) },
    });
  } catch (err) {
    console.error('Error listing ai_results:', err);
    res.status(500).json({ error: 'Failed to list AI results.' });
  }
});

module.exports = router;
