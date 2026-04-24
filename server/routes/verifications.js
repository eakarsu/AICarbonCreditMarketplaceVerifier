const express = require('express');
const { Verification, CarbonCredit, Project } = require('../models');
const auth = require('../middleware/auth');
const { callOpenRouter } = require('../services/openrouter');
const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const items = await Verification.findAll({
      include: [{ model: CarbonCredit, attributes: ['name', 'projectType'] }, { model: Project, attributes: ['name', 'type'] }],
      order: [['createdAt', 'DESC']]
    });
    res.json(items);
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

    const prompt = `Perform an AI verification assessment for this carbon credit verification request:
    - Methodology: ${item.methodology}
    - Current Status: ${item.status}
    - Credit: ${item.CarbonCredit?.name || 'N/A'} (${item.CarbonCredit?.projectType || 'N/A'})
    - Project: ${item.Project?.name || 'N/A'} (${item.Project?.type || 'N/A'})
    - Findings: ${item.findings || 'None yet'}

    Provide:
    1. Verification Score (0-100)
    2. Risk Level (Low/Medium/High/Critical)
    3. Methodology Compliance Check
    4. Data Integrity Assessment
    5. Additionality Verification
    6. Permanence Assessment
    7. Leakage Risk Analysis
    8. Recommendation (Approve/Reject/Needs More Info)
    9. Detailed Findings`;

    const analysis = await callOpenRouter(prompt);
    const scoreMatch = analysis.match(/(\d+)\/100|Score[:\s]*(\d+)/i);
    const aiScore = scoreMatch ? parseInt(scoreMatch[1] || scoreMatch[2]) : 75;

    await item.update({ aiScore, aiAnalysis: analysis });
    res.json({ verification: item, aiVerification: analysis, aiScore });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
