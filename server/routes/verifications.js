const express = require('express');
const { Verification, CarbonCredit, Project } = require('../models');
const auth = require('../middleware/auth');
const { callOpenRouter } = require('../services/openrouter');
const router = express.Router();

function orgScopeWhere(req) {
  if (req.user?.role === 'admin') return {};
  return { verifierId: req.user.id };
}

router.get('/', async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 20));
    const offset = (page - 1) * limit;

    const { count, rows } = await Verification.findAndCountAll({
      include: [{ model: CarbonCredit, attributes: ['name', 'projectType'] }, { model: Project, attributes: ['name', 'type'] }],
      order: [['createdAt', 'DESC']],
      limit,
      offset,
    });
    res.json({ data: rows, pagination: { page, limit, total: count, totalPages: Math.ceil(count / limit) } });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/:id', async (req, res) => {
  try {
    const item = await Verification.findByPk(req.params.id, {
      include: [{ model: CarbonCredit }, { model: Project }]
    });
    if (!item) return res.status(404).json({ error: 'Verification not found' });
    res.json(item);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/', auth, async (req, res) => {
  try {
    const { creditId, methodology } = req.body;
    if (!creditId || !methodology) {
      return res.status(400).json({ error: 'Missing required fields: creditId, methodology.' });
    }
    const item = await Verification.create({ ...req.body, verifierId: req.user.id });
    res.status(201).json(item);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.put('/:id', auth, async (req, res) => {
  try {
    const item = await Verification.findByPk(req.params.id);
    if (!item) return res.status(404).json({ error: 'Verification not found' });
    await item.update(req.body);
    res.json(item);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    const item = await Verification.findByPk(req.params.id);
    if (!item) return res.status(404).json({ error: 'Verification not found' });
    await item.destroy();
    res.json({ message: 'Verification deleted' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// AI: Auto-verify credit
router.post('/:id/ai-verify', auth, async (req, res) => {
  try {
    const item = await Verification.findByPk(req.params.id, {
      include: [{ model: CarbonCredit }, { model: Project }]
    });
    if (!item) return res.status(404).json({ error: 'Verification not found' });

    const prompt = `Perform an AI verification assessment for this carbon credit verification request. Respond in valid JSON.

Verification Details:
- Methodology: ${item.methodology}
- Current Status: ${item.status}
- Credit: ${item.CarbonCredit?.name || 'N/A'} (${item.CarbonCredit?.projectType || 'N/A'})
- Project: ${item.Project?.name || 'N/A'} (${item.Project?.type || 'N/A'})
- Existing Findings: ${item.findings || 'None yet'}

Return JSON with this structure:
{
  "verification_score": 0,
  "risk_level": "Low|Medium|High|Critical",
  "methodology_compliance": {"status": "Compliant|Non-Compliant|Partially Compliant", "notes": ""},
  "data_integrity": {"score": 0, "issues": [], "notes": ""},
  "additionality_verification": {"status": "Verified|Questionable|Failed", "reasoning": ""},
  "permanence_assessment": {"risk": "Low|Medium|High", "notes": ""},
  "leakage_risk": {"level": "Low|Medium|High", "sources": [], "mitigation": ""},
  "recommendation": "Approve|Reject|Needs More Info",
  "detailed_findings": "",
  "corrective_actions": [],
  "summary": ""
}`;

    const rawAnalysis = await callOpenRouter(prompt, 'You are an expert carbon credit analyst with deep knowledge of voluntary carbon markets, UNFCCC methodologies, Gold Standard, and VCS certification frameworks.');

    let parsedAnalysis;
    let aiScore = 75;
    try {
      const jsonMatch = rawAnalysis.match(/\{[\s\S]*\}/);
      parsedAnalysis = jsonMatch ? JSON.parse(jsonMatch[0]) : { summary: rawAnalysis };
      if (parsedAnalysis.verification_score !== undefined) {
        aiScore = Math.min(100, Math.max(0, Number(parsedAnalysis.verification_score)));
      }
    } catch {
      parsedAnalysis = { summary: rawAnalysis };
    }

    const analysisText = typeof parsedAnalysis === 'object' ? JSON.stringify(parsedAnalysis) : rawAnalysis;
    await item.update({ aiScore, aiAnalysis: analysisText });
    res.json({ verification: item, aiVerification: parsedAnalysis, aiScore });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
