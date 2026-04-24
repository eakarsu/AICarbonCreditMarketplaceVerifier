const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const { sequelize } = require('./models');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/credits', require('./routes/credits'));
app.use('/api/transactions', require('./routes/transactions'));
app.use('/api/projects', require('./routes/projects'));
app.use('/api/verifications', require('./routes/verifications'));
app.use('/api/emissions', require('./routes/emissions'));
app.use('/api/market-data', require('./routes/marketdata'));
app.use('/api/retirements', require('./routes/retirements'));
app.use('/api/compliance', require('./routes/compliance'));
app.use('/api/audit', require('./routes/audit'));
app.use('/api/recommendations', require('./routes/recommendations'));
app.use('/api/sustainability', require('./routes/sustainability'));
app.use('/api/dashboard', require('./routes/dashboard'));

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'ok', timestamp: new Date() }));

// Start server
async function start() {
  try {
    await sequelize.authenticate();
    console.log('Database connected successfully');
    await sequelize.sync({ alter: true });
    console.log('Database synced');
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
}

start();
