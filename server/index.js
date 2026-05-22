const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');
require('dotenv').config();

const { sequelize } = require('./models');

const app = express();
const PORT = process.env.PORT || 3001;

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

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'ok', timestamp: new Date() }));

// Start server
async function start() {
  try {
    await sequelize.authenticate();
    console.log('Database connected successfully');
    // Use { alter: false } in production; run SQL migrations in /server/migrations/ instead
    await sequelize.sync({ alter: process.env.NODE_ENV === 'development' });
    console.log('Database synced');
    
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


// === Batch 01 Gaps & Frontend Mounts ===
app.use('/api/gap-ainew-js-scaffold-but-0-mounted-chat-style-ai-endp', require('./routes/gap_ainew_js_scaffold_but_0_mounted_chat_style_ai_endp'));
app.use('/api/gap-no-ai-verification-of-project-additionality-perman', require('./routes/gap_no_ai_verification_of_project_additionality_perman'));
app.use('/api/gap-no-satellite-imagery-validation-of-land-based-cred', require('./routes/gap_no_satellite_imagery_validation_of_land_based_cred'));
app.use('/api/gap-no-ai-price-prediction-for-credit-classes', require('./routes/gap_no_ai_price_prediction_for_credit_classes'));
app.use('/api/gap-no-notification-system-delivery-channel', require('./routes/gap_no_notification_system_delivery_channel'));
app.use('/api/gap-no-direct-verra-gold-standard-acr-api-clients-only', require('./routes/gap_no_direct_verra_gold_standard_acr_api_clients_only'));
app.use('/api/gap-no-on-chain-credit-tokenization-layer', require('./routes/gap_no_on_chain_credit_tokenization_layer'));
app.use('/api/gap-no-kyc-aml-buyer-onboarding-flow', require('./routes/gap_no_kyc_aml_buyer_onboarding_flow'));
app.use('/api/gap-only-6-frontend-pages-vs-18-backend-routes-ui-gap', require('./routes/gap_only_6_frontend_pages_vs_18_backend_routes_ui_gap'));
