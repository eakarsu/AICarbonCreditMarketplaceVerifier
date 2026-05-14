const express = require('express');
const fetch = require('node-fetch');
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

// POST /api/retirements/:id/notify-webhook — send retirement notification to configured webhook URL
router.post('/:id/notify-webhook', auth, async (req, res) => {
  try {
    const { webhook_url } = req.body;
    if (!webhook_url) {
      return res.status(400).json({ error: 'webhook_url is required.' });
    }

    let url;
    try {
      url = new URL(webhook_url);
      if (!['http:', 'https:'].includes(url.protocol)) {
        return res.status(400).json({ error: 'webhook_url must use http or https.' });
      }
    } catch {
      return res.status(400).json({ error: 'webhook_url is not a valid URL.' });
    }

    const item = await Retirement.findByPk(req.params.id, {
      include: [
        { model: CarbonCredit, attributes: ['name', 'projectType', 'registry', 'country', 'methodology'] },
        { model: User, attributes: ['name', 'company'] }
      ]
    });
    if (!item) return res.status(404).json({ error: 'Retirement not found' });

    const payload = {
      event: 'carbon_credit_retired',
      timestamp: new Date().toISOString(),
      retirement: {
        id: item.id,
        quantity_tco2e: item.quantity,
        reason: item.reason,
        beneficiary: item.beneficiary,
        retirement_date: item.retirementDate,
        status: item.status,
        certificate_url: item.certificateUrl,
      },
      credit: item.CarbonCredit ? {
        name: item.CarbonCredit.name,
        project_type: item.CarbonCredit.projectType,
        registry: item.CarbonCredit.registry,
        country: item.CarbonCredit.country,
        methodology: item.CarbonCredit.methodology,
      } : null,
      retired_by: item.User ? { name: item.User.name, company: item.User.company } : null,
    };

    const webhookResponse = await fetch(webhook_url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Event-Type': 'carbon_credit_retired' },
      body: JSON.stringify(payload),
      timeout: 10000,
    });

    if (!webhookResponse.ok) {
      return res.status(502).json({
        error: 'Webhook delivery failed.',
        webhook_status: webhookResponse.status,
        webhook_status_text: webhookResponse.statusText,
      });
    }

    res.json({
      message: 'Webhook notification sent successfully.',
      webhook_url,
      webhook_status: webhookResponse.status,
      payload_sent: payload,
    });
  } catch (err) {
    console.error('Error sending webhook notification:', err);
    res.status(500).json({ error: 'Failed to send webhook notification.' });
  }
});

module.exports = router;
