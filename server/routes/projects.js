const express = require('express');
const { Project, User } = require('../models');
const auth = require('../middleware/auth');
const { callOpenRouter } = require('../services/openrouter');
const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 20));
    const offset = (page - 1) * limit;

    const { count, rows } = await Project.findAndCountAll({
      include: [{ model: User, as: 'owner', attributes: ['name', 'company'] }],
      order: [['createdAt', 'DESC']],
      limit,
      offset,
    });
    res.json({ data: rows, pagination: { page, limit, total: count, totalPages: Math.ceil(count / limit) } });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/:id', async (req, res) => {
  try {
    const project = await Project.findByPk(req.params.id, { include: [{ model: User, as: 'owner', attributes: ['name', 'company'] }] });
    if (!project) return res.status(404).json({ error: 'Project not found' });
    res.json(project);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/', auth, async (req, res) => {
  try {
    const project = await Project.create({ ...req.body, ownerId: req.user.id });
    res.status(201).json(project);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.put('/:id', auth, async (req, res) => {
  try {
    const project = await Project.findByPk(req.params.id);
    if (!project) return res.status(404).json({ error: 'Project not found' });
    await project.update(req.body);
    res.json(project);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    const project = await Project.findByPk(req.params.id);
    if (!project) return res.status(404).json({ error: 'Project not found' });
    await project.destroy();
    res.json({ message: 'Project deleted' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// AI: Evaluate project impact
router.post('/:id/ai-evaluate', auth, async (req, res) => {
  try {
    const project = await Project.findByPk(req.params.id);
    if (!project) return res.status(404).json({ error: 'Project not found' });

    const prompt = `Evaluate this carbon offset project's environmental impact and viability:
    - Name: ${project.name}
    - Type: ${project.type}
    - Location: ${project.location}, ${project.country}
    - Estimated CO2 Reduction: ${project.estimatedReduction} tons
    - Actual Reduction: ${project.actualReduction || 'Not yet measured'} tons
    - Status: ${project.status}
    - Methodology: ${project.methodology}
    - SDG Goals: ${project.sdgGoals}
    - Description: ${project.description}

    Provide:
    1. Impact Score (1-100)
    2. Additionality Assessment
    3. Permanence Risk
    4. Co-benefits Analysis
    5. SDG Alignment Score
    6. Improvement Recommendations
    7. Market Viability Assessment`;

    const evaluation = await callOpenRouter(prompt);
    res.json({ project, aiEvaluation: evaluation });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
