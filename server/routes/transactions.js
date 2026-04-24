const express = require('express');
const { Transaction, CarbonCredit, User } = require('../models');
const auth = require('../middleware/auth');
const { callOpenRouter } = require('../services/openrouter');
const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const txns = await Transaction.findAll({
      include: [
        { model: CarbonCredit, attributes: ['name', 'projectType'] },
        { model: User, as: 'buyer', attributes: ['name', 'company'] },
        { model: User, as: 'sellerUser', attributes: ['name', 'company'] }
      ],
      order: [['createdAt', 'DESC']]
    });
    res.json(txns);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/:id', async (req, res) => {
  try {
    const txn = await Transaction.findByPk(req.params.id, {
      include: [
        { model: CarbonCredit },
        { model: User, as: 'buyer', attributes: ['name', 'company'] },
        { model: User, as: 'sellerUser', attributes: ['name', 'company'] }
      ]
    });
    if (!txn) return res.status(404).json({ error: 'Transaction not found' });
    res.json(txn);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/', auth, async (req, res) => {
  try {
    const hash = 'TX-' + Date.now().toString(36).toUpperCase() + '-' + Math.random().toString(36).substring(2, 8).toUpperCase();
    const txn = await Transaction.create({ ...req.body, buyerId: req.user.id, transactionHash: hash, fee: req.body.totalPrice * 0.025 });
    if (req.body.transactionType === 'buy') {
      await CarbonCredit.update({ status: 'sold' }, { where: { id: req.body.creditId } });
    }
    res.status(201).json(txn);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.put('/:id', auth, async (req, res) => {
  try {
    const txn = await Transaction.findByPk(req.params.id);
    if (!txn) return res.status(404).json({ error: 'Transaction not found' });
    await txn.update(req.body);
    res.json(txn);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    const txn = await Transaction.findByPk(req.params.id);
    if (!txn) return res.status(404).json({ error: 'Transaction not found' });
    await txn.destroy();
    res.json({ message: 'Transaction deleted' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// AI: Transaction risk analysis
router.post('/:id/ai-risk', auth, async (req, res) => {
  try {
    const txn = await Transaction.findByPk(req.params.id, { include: [{ model: CarbonCredit }] });
    if (!txn) return res.status(404).json({ error: 'Transaction not found' });

    const prompt = `Analyze the risk of this carbon credit transaction:
    - Type: ${txn.transactionType}
    - Quantity: ${txn.quantity} tons
    - Total Price: $${txn.totalPrice}
    - Credit: ${txn.CarbonCredit?.name || 'N/A'}
    - Project Type: ${txn.CarbonCredit?.projectType || 'N/A'}
    - Status: ${txn.status}

    Provide:
    1. Risk Score (1-10)
    2. Fraud Probability Assessment
    3. Compliance Check
    4. Price Fairness Analysis
    5. Counterparty Risk
    6. Recommendations`;

    const analysis = await callOpenRouter(prompt);
    res.json({ transaction: txn, aiRiskAnalysis: analysis });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
