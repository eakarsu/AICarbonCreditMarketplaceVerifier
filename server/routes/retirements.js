const express = require('express');
const { Retirement, CarbonCredit, User } = require('../models');
const auth = require('../middleware/auth');
const { callOpenRouter } = require('../services/openrouter');
const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const items = await Retirement.findAll({
      include: [{ model: CarbonCredit, attributes: ['name', 'projectType'] }, { model: User, attributes: ['name', 'company'] }],
      order: [['createdAt', 'DESC']]
    });
    res.json(items);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/:id', async (req, res) => {
  try {
    const item = await Retirement.findByPk(req.params.id, {
      include: [{ model: CarbonCredit }, { model: User, attributes: ['name', 'company'] }]
    });
    if (!item) return res.status(404).json({ error: 'Retirement not found' });
    res.json(item);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/', auth, async (req, res) => {
  try {
    const item = await Retirement.create({ ...req.body, userId: req.user.id, retirementDate: new Date() });
    if (req.body.creditId) {
      await CarbonCredit.update({ status: 'retired' }, { where: { id: req.body.creditId } });
    }
    res.status(201).json(item);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.put('/:id', auth, async (req, res) => {
  try {
    const item = await Retirement.findByPk(req.params.id);
    if (!item) return res.status(404).json({ error: 'Retirement not found' });
    await item.update(req.body);
    res.json(item);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    const item = await Retirement.findByPk(req.params.id);
    if (!item) return res.status(404).json({ error: 'Retirement not found' });
    await item.destroy();
    res.json({ message: 'Retirement deleted' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// AI: Retirement impact analysis
router.post('/:id/ai-analyze', auth, async (req, res) => {
  try {
    const item = await Retirement.findByPk(req.params.id, {
      include: [{ model: CarbonCredit }, { model: User, attributes: ['name', 'company'] }]
    });
    if (!item) return res.status(404).json({ error: 'Retirement not found' });

    const prompt = `Analyze this carbon credit retirement for environmental and business impact:
    - Quantity Retired: ${item.quantity} tons CO2e
    - Reason: ${item.reason}
    - Beneficiary: ${item.beneficiary}
    - Status: ${item.status}
    - Credit: ${item.CarbonCredit?.name || 'N/A'} (${item.CarbonCredit?.projectType || 'N/A'})
    - Retirement Date: ${item.retirementDate}

    Provide:
    1. Environmental Impact Score (1-100)
    2. Equivalent Impact (e.g., cars off road, trees planted)
    3. Retirement Validity Assessment
    4. Double-Counting Risk Check
    5. Certificate Authenticity Assessment
    6. Tax Benefit Eligibility
    7. ESG Reporting Impact
    8. Recommendations for Future Retirements`;

    const analysis = await callOpenRouter(prompt);
    res.json({ retirement: item, aiAnalysis: analysis });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// AI: Retirement certificate generator
router.post('/ai-certificate-summary', auth, async (req, res) => {
  try {
    const retirements = await Retirement.findAll({
      include: [{ model: CarbonCredit, attributes: ['name', 'projectType', 'country'] }],
      where: { status: 'completed' }
    });
    const totalRetired = retirements.reduce((sum, r) => sum + r.quantity, 0);

    const prompt = `Generate a professional carbon retirement certificate summary:
    Total Credits Retired: ${totalRetired} tCO2e
    Number of Retirements: ${retirements.length}
    Retirement Details: ${JSON.stringify(retirements.map(r => ({
      quantity: r.quantity, reason: r.reason, beneficiary: r.beneficiary,
      credit: r.CarbonCredit?.name, type: r.CarbonCredit?.projectType, country: r.CarbonCredit?.country
    })))}

    Provide:
    1. Certificate Summary Statement
    2. Total Environmental Impact
    3. Equivalent Impact Metrics
    4. SDG Contribution Summary
    5. Verification Statement
    6. Portfolio Quality Assessment`;

    const analysis = await callOpenRouter(prompt);
    res.json({ totalRetired, retirementCount: retirements.length, aiCertificate: analysis });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
