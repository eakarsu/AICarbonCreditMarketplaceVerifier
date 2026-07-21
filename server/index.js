const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');
require('dotenv').config();

const { sequelize } = require('./models');

const app = express();
const PORT = process.env.PORT || 3001;
const auth = require('./middleware/auth');
const { validateRuntime } = require('./config/runtime');

// Middleware
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
const allowedOrigins = (process.env.ALLOWED_ORIGINS || 'http://localhost:3000,http://localhost:5173')
  .split(',').map((o) => o.trim()).filter(Boolean);
app.use(cors({
  origin: (origin, cb) => {
    if (!origin) return cb(null, true);
    if (allowedOrigins.includes('*') || allowedOrigins.includes(origin)) return cb(null, true);
    return cb(new Error(`Origin ${origin} not allowed by CORS`));
  },
  credentials: true,
}));
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
app.use('/api/ai', require('./routes/aiNew'));
app.use('/api/buyer', require('./routes/buyerPortal'));
app.use('/api/webhooks', require('./routes/webhooks'));
// Apply pass 5 — backlog (notifications, registry, reporting)
app.use('/api/integrations', require('./routes/integrations'));
app.use('/api/reports', require('./routes/reports'));
app.use('/api/portfolio-integrity', require('./routes/portfolioIntegrity'));
app.use('/api/credit-lifecycle', auth, require('./routes/creditLifecycle'));

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'ok', timestamp: new Date() }));

// Start server
async function start() {
  try {
    validateRuntime();
    await sequelize.authenticate();
    console.log('Database connected successfully');
    console.log('Database schema must be applied with scripts/migrate.sh');
    
app.use('/api/agentic-verifier', require('./routes/agenticVerifier')); // apply pass 6 — audit custom suggestion

app.use('/api/methodology-rag', require('./routes/methodologyRag')); // apply pass 6 — audit custom suggestion

app.use('/api/market-anomaly', require('./routes/marketAnomalyStream')); // apply pass 6 — audit custom suggestion

app.use('/api/consortium-white-label', require('./routes/consortiumWhiteLabel')); // apply pass 6 — audit custom suggestion
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
}

start();

