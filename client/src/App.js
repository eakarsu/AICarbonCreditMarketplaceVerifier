import React, { useState, useEffect } from 'react';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import CrudPage from './pages/CrudPage';
import AIHub from './pages/AIHub';
import AIStudio from './pages/AIStudio';
import Webhooks from './pages/Webhooks';
import api from './services/api';

const FEATURES = [
  { key: 'dashboard', label: 'Dashboard', icon: '📊', resource: null, section: 'Overview' },
  { key: 'ai-hub', label: 'AI Command Center', icon: '🧠', resource: null, section: 'Overview' },
  { key: 'ai-studio', label: 'AI Studio (8 New)', icon: '🧪', resource: null, section: 'Overview' },
  { key: 'webhooks', label: 'Webhooks', icon: '🔔', resource: null, section: 'Overview' },
  { key: 'credits', label: 'Carbon Credits', icon: '🌿', resource: 'credits', section: 'Marketplace',
    description: 'Browse, list, and trade verified carbon credits',
    fields: [
      { name: 'name', label: 'Credit Name', type: 'text', required: true },
      { name: 'projectType', label: 'Project Type', type: 'select', options: ['Reforestation','Renewable Energy','Energy Efficiency','Blue Carbon','REDD+','Avoided Deforestation','Methane Capture','Soil Carbon','Agroforestry','Agriculture','Carbon Removal','Fire Management','Water Purification','Waste Management'], required: true },
      { name: 'vintage', label: 'Vintage Year', type: 'number' },
      { name: 'quantity', label: 'Quantity (tons)', type: 'number', required: true },
      { name: 'pricePerTon', label: 'Price per Ton ($)', type: 'number', required: true },
      { name: 'status', label: 'Status', type: 'select', options: ['available','reserved','sold','retired'] },
      { name: 'registry', label: 'Registry', type: 'select', options: ['Verra VCS','Gold Standard','CDM','Puro.earth','Plan Vivo','ERF','Peatland Code'] },
      { name: 'country', label: 'Country', type: 'text' },
      { name: 'methodology', label: 'Methodology', type: 'text' },
      { name: 'description', label: 'Description', type: 'textarea' },
      { name: 'co2OffsetTons', label: 'CO2 Offset (tons)', type: 'number' },
      { name: 'verificationStatus', label: 'Verification', type: 'select', options: ['pending','verified','rejected','under_review'] },
    ],
    tableColumns: ['name','projectType','vintage','quantity','pricePerTon','status','registry','country','verificationStatus'],
    aiActions: [{ key: 'analyze', label: 'AI Quality Analysis', action: 'aiAnalyzeCredit', icon: '🤖' }],
    aiGlobalActions: [{ key: 'price', label: 'AI Price Suggestion', action: 'aiPriceSuggestion', icon: '💰' }],
  },
  { key: 'transactions', label: 'Transactions', icon: '💱', resource: 'transactions', section: 'Marketplace',
    description: 'Track buy, sell, and retirement transactions',
    fields: [
      { name: 'creditId', label: 'Credit ID', type: 'number', required: true },
      { name: 'sellerId', label: 'Seller ID', type: 'number' },
      { name: 'quantity', label: 'Quantity (tons)', type: 'number', required: true },
      { name: 'totalPrice', label: 'Total Price ($)', type: 'number', required: true },
      { name: 'transactionType', label: 'Type', type: 'select', options: ['buy','sell','retire','transfer'], required: true },
      { name: 'status', label: 'Status', type: 'select', options: ['pending','completed','cancelled','failed'] },
    ],
    tableColumns: ['id','transactionType','quantity','totalPrice','status','transactionHash','fee','createdAt'],
    aiActions: [{ key: 'risk', label: 'AI Risk Analysis', action: 'aiTransactionRisk', icon: '🛡️' }],
  },
  { key: 'projects', label: 'Offset Projects', icon: '🏗️', resource: 'projects', section: 'Projects',
    description: 'Manage carbon offset projects worldwide',
    fields: [
      { name: 'name', label: 'Project Name', type: 'text', required: true },
      { name: 'type', label: 'Project Type', type: 'text', required: true },
      { name: 'location', label: 'Location', type: 'text' },
      { name: 'country', label: 'Country', type: 'text' },
      { name: 'startDate', label: 'Start Date', type: 'date' },
      { name: 'endDate', label: 'End Date', type: 'date' },
      { name: 'estimatedReduction', label: 'Est. Reduction (tCO2e)', type: 'number' },
      { name: 'actualReduction', label: 'Actual Reduction (tCO2e)', type: 'number' },
      { name: 'status', label: 'Status', type: 'select', options: ['proposed','active','completed','suspended'] },
      { name: 'methodology', label: 'Methodology', type: 'text' },
      { name: 'sdgGoals', label: 'SDG Goals', type: 'text' },
      { name: 'description', label: 'Description', type: 'textarea' },
    ],
    tableColumns: ['name','type','country','estimatedReduction','actualReduction','status','methodology'],
    aiActions: [{ key: 'evaluate', label: 'AI Impact Evaluation', action: 'aiProjectEvaluate', icon: '🌍' }],
  },
  { key: 'verifications', label: 'Verifications', icon: '✅', resource: 'verifications', section: 'Projects',
    description: 'AI-powered credit and project verification',
    fields: [
      { name: 'creditId', label: 'Credit ID', type: 'number' },
      { name: 'projectId', label: 'Project ID', type: 'number' },
      { name: 'status', label: 'Status', type: 'select', options: ['pending','in_progress','approved','rejected'] },
      { name: 'methodology', label: 'Methodology', type: 'text' },
      { name: 'findings', label: 'Findings', type: 'textarea' },
      { name: 'riskLevel', label: 'Risk Level', type: 'select', options: ['low','medium','high','critical'] },
      { name: 'documentUrl', label: 'Document URL', type: 'text' },
    ],
    tableColumns: ['id','methodology','status','aiScore','riskLevel','createdAt'],
    aiActions: [{ key: 'verify', label: 'AI Auto-Verify', action: 'aiVerify', icon: '🔍' }],
  },
  { key: 'emissions', label: 'Emissions Tracker', icon: '🏭', resource: 'emissions', section: 'Analytics',
    description: 'Track and manage greenhouse gas emissions',
    fields: [
      { name: 'category', label: 'Category', type: 'select', options: ['Transportation','Electricity','Natural Gas','Air Travel','Supply Chain','Manufacturing','Waste','Commuting','Refrigerants','Purchased Goods','Water','Logistics','Construction','Data Centers','Paper','Diesel'], required: true },
      { name: 'source', label: 'Source', type: 'text' },
      { name: 'amount', label: 'Amount (tCO2e)', type: 'number', required: true },
      { name: 'unit', label: 'Unit', type: 'text' },
      { name: 'date', label: 'Date', type: 'date' },
      { name: 'scope', label: 'Scope', type: 'select', options: ['scope1','scope2','scope3'] },
      { name: 'description', label: 'Description', type: 'textarea' },
    ],
    tableColumns: ['category','source','amount','unit','scope','date'],
    aiActions: [],
    aiGlobalActions: [
      { key: 'calculate', label: 'AI Carbon Calculator', action: 'aiCalculateEmissions', icon: '🧮' },
      { key: 'plan', label: 'AI Reduction Plan', action: 'aiReductionPlan', icon: '📉' },
    ],
  },
  { key: 'market-data', label: 'Market Analytics', icon: '📈', resource: 'market-data', section: 'Analytics',
    description: 'Real-time carbon credit market data and AI predictions',
    fields: [
      { name: 'creditType', label: 'Credit Type', type: 'text', required: true },
      { name: 'price', label: 'Price ($)', type: 'number', required: true },
      { name: 'volume', label: 'Volume', type: 'number' },
      { name: 'date', label: 'Date', type: 'date' },
      { name: 'exchange', label: 'Exchange', type: 'text' },
      { name: 'change', label: 'Change ($)', type: 'number' },
      { name: 'changePercent', label: 'Change (%)', type: 'number' },
    ],
    tableColumns: ['creditType','price','volume','exchange','change','changePercent','date'],
    aiGlobalActions: [{ key: 'predict', label: 'AI Market Prediction', action: 'aiMarketPredict', icon: '🔮' }],
  },
  { key: 'retirements', label: 'Credit Retirements', icon: '🏛️', resource: 'retirements', section: 'Operations',
    description: 'Track retired carbon credits and certificates',
    fields: [
      { name: 'creditId', label: 'Credit ID', type: 'number' },
      { name: 'quantity', label: 'Quantity (tons)', type: 'number', required: true },
      { name: 'reason', label: 'Reason', type: 'textarea' },
      { name: 'beneficiary', label: 'Beneficiary', type: 'text' },
      { name: 'status', label: 'Status', type: 'select', options: ['pending','completed','cancelled'] },
    ],
    tableColumns: ['id','quantity','beneficiary','status','retirementDate','createdAt'],
    aiActions: [{ key: 'analyze', label: 'AI Impact Analysis', action: 'aiRetirementAnalyze', icon: '🌳' }],
    aiGlobalActions: [{ key: 'certificate', label: 'AI Certificate Summary', action: 'aiCertificateSummary', icon: '📜' }],
  },
  { key: 'compliance', label: 'Compliance Reports', icon: '📋', resource: 'compliance', section: 'Operations',
    description: 'Regulatory compliance tracking and AI analysis',
    fields: [
      { name: 'reportType', label: 'Report Type', type: 'text', required: true },
      { name: 'period', label: 'Period', type: 'text' },
      { name: 'totalEmissions', label: 'Total Emissions (tCO2e)', type: 'number' },
      { name: 'totalOffsets', label: 'Total Offsets (tCO2e)', type: 'number' },
      { name: 'netEmissions', label: 'Net Emissions (tCO2e)', type: 'number' },
      { name: 'complianceStatus', label: 'Status', type: 'select', options: ['compliant','non_compliant','pending_review'] },
      { name: 'regulatoryFramework', label: 'Framework', type: 'text' },
      { name: 'dueDate', label: 'Due Date', type: 'date' },
    ],
    tableColumns: ['reportType','period','totalEmissions','totalOffsets','netEmissions','complianceStatus','regulatoryFramework'],
    aiActions: [{ key: 'analyze', label: 'AI Compliance Analysis', action: 'aiComplianceAnalyze', icon: '⚖️' }],
  },
  { key: 'audit', label: 'Audit Trail', icon: '📝', resource: 'audit', section: 'Operations',
    description: 'Complete audit log with AI security analysis',
    fields: [
      { name: 'action', label: 'Action', type: 'text', required: true },
      { name: 'entityType', label: 'Entity Type', type: 'text' },
      { name: 'entityId', label: 'Entity ID', type: 'number' },
      { name: 'details', label: 'Details', type: 'textarea' },
    ],
    tableColumns: ['action','entityType','entityId','details','ipAddress','timestamp'],
    aiActions: [{ key: 'analyze', label: 'AI Security Analysis', action: 'aiAuditAnalyze', icon: '🔐' }],
    aiGlobalActions: [{ key: 'patterns', label: 'AI Pattern Detection', action: 'aiAuditPatterns', icon: '🕵️' }],
  },
  { key: 'recommendations', label: 'Offset Recommendations', icon: '💡', resource: 'recommendations', section: 'AI Features',
    description: 'AI-powered carbon offset purchase recommendations',
    fields: [
      { name: 'emissionAmount', label: 'Emission Amount (tCO2e)', type: 'number' },
      { name: 'estimatedCost', label: 'Est. Cost ($)', type: 'number' },
      { name: 'priority', label: 'Priority', type: 'select', options: ['low','medium','high'] },
      { name: 'status', label: 'Status', type: 'select', options: ['pending','accepted','rejected'] },
      { name: 'aiAnalysis', label: 'AI Analysis', type: 'textarea' },
    ],
    tableColumns: ['id','emissionAmount','estimatedCost','priority','status','createdAt'],
    aiGlobalActions: [{ key: 'generate', label: 'Generate AI Recommendations', action: 'aiGenerateRecommendation', icon: '🤖' }],
  },
  { key: 'sustainability', label: 'Sustainability Reports', icon: '🌱', resource: 'sustainability', section: 'AI Features',
    description: 'AI-generated sustainability insights and ESG reporting',
    fields: [
      { name: 'title', label: 'Report Title', type: 'text', required: true },
      { name: 'period', label: 'Period', type: 'text' },
      { name: 'totalEmissions', label: 'Total Emissions (tCO2e)', type: 'number' },
      { name: 'reductionTarget', label: 'Reduction Target (%)', type: 'number' },
      { name: 'actualReduction', label: 'Actual Reduction (%)', type: 'number' },
      { name: 'status', label: 'Status', type: 'select', options: ['draft','published','archived'] },
      { name: 'frameworks', label: 'Frameworks', type: 'text' },
    ],
    tableColumns: ['title','period','totalEmissions','reductionTarget','actualReduction','status','frameworks'],
    aiActions: [{ key: 'insights', label: 'AI Sustainability Insights', action: 'aiSustainabilityInsights', icon: '🧠' }],
  },
];

// All AI features collected for the AI Hub
const AI_FEATURES = [
  { id: 'dashboard-insights', name: 'Dashboard AI Insights', icon: '📊', description: 'Get AI-powered overview and health assessment of your entire marketplace', category: 'Overview', action: 'aiDashboardInsights', navigateTo: null },
  { id: 'credit-quality', name: 'Credit Quality Analysis', icon: '🌿', description: 'AI analyzes credit quality, investment rating, and risk factors', category: 'Marketplace', action: 'aiAnalyzeCredit', navigateTo: 'credits', needsItem: true },
  { id: 'price-suggestion', name: 'AI Price Suggestion', icon: '💰', description: 'Get AI-suggested fair market price for carbon credits', category: 'Marketplace', action: 'aiPriceSuggestion', navigateTo: 'credits' },
  { id: 'transaction-risk', name: 'Transaction Risk Analysis', icon: '🛡️', description: 'AI fraud detection, compliance check, and counterparty risk assessment', category: 'Marketplace', action: 'aiTransactionRisk', navigateTo: 'transactions', needsItem: true },
  { id: 'project-impact', name: 'Project Impact Evaluation', icon: '🌍', description: 'AI evaluates environmental impact, additionality, and SDG alignment', category: 'Projects', action: 'aiProjectEvaluate', navigateTo: 'projects', needsItem: true },
  { id: 'auto-verify', name: 'AI Auto-Verification', icon: '🔍', description: 'Automated AI verification scoring with methodology compliance check', category: 'Projects', action: 'aiVerify', navigateTo: 'verifications', needsItem: true },
  { id: 'carbon-calculator', name: 'AI Carbon Calculator', icon: '🧮', description: 'Calculate carbon footprint with AI breakdown and recommendations', category: 'Analytics', action: 'aiCalculateEmissions', navigateTo: 'emissions' },
  { id: 'reduction-plan', name: 'AI Reduction Plan', icon: '📉', description: 'Generate comprehensive emission reduction roadmap with goals and timelines', category: 'Analytics', action: 'aiReductionPlan', navigateTo: 'emissions' },
  { id: 'market-prediction', name: 'AI Market Prediction', icon: '🔮', description: 'Predict carbon credit price trends, volume analysis, and market sentiment', category: 'Analytics', action: 'aiMarketPredict', navigateTo: 'market-data' },
  { id: 'retirement-impact', name: 'Retirement Impact Analysis', icon: '🌳', description: 'AI analyzes environmental impact, double-counting risk, and ESG value', category: 'Operations', action: 'aiRetirementAnalyze', navigateTo: 'retirements', needsItem: true },
  { id: 'certificate-summary', name: 'AI Certificate Summary', icon: '📜', description: 'Generate professional carbon retirement certificate with impact metrics', category: 'Operations', action: 'aiCertificateSummary', navigateTo: 'retirements' },
  { id: 'compliance-analysis', name: 'AI Compliance Analysis', icon: '⚖️', description: 'Regulatory gap analysis, risk assessment, and compliance roadmap', category: 'Operations', action: 'aiComplianceAnalyze', navigateTo: 'compliance', needsItem: true },
  { id: 'audit-security', name: 'AI Security Analysis', icon: '🔐', description: 'Analyze individual audit entries for security implications', category: 'Operations', action: 'aiAuditAnalyze', navigateTo: 'audit', needsItem: true },
  { id: 'audit-patterns', name: 'AI Pattern Detection', icon: '🕵️', description: 'Detect anomalies, suspicious patterns, and fraud risk across audit logs', category: 'Operations', action: 'aiAuditPatterns', navigateTo: 'audit' },
  { id: 'offset-recommendations', name: 'AI Offset Recommendations', icon: '💡', description: 'AI recommends optimal carbon offset portfolio based on your emissions', category: 'AI Intelligence', action: 'aiGenerateRecommendation', navigateTo: 'recommendations' },
  { id: 'sustainability-insights', name: 'AI Sustainability Insights', icon: '🧠', description: 'Generate ESG insights, benchmarking, and stakeholder communication strategy', category: 'AI Intelligence', action: 'aiSustainabilityInsights', navigateTo: 'sustainability', needsItem: true },
];

function App() {
  const [user, setUser] = useState(null);
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [toast, setToast] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const saved = localStorage.getItem('user');
    if (token && saved) {
      setUser(JSON.parse(saved));
    }
  }, []);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleLogin = (userData, token) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setCurrentPage('dashboard');
  };

  if (!user) return <Login onLogin={handleLogin} />;

  const feature = FEATURES.find(f => f.key === currentPage);
  const sections = [...new Set(FEATURES.map(f => f.section))];

  return (
    <div className="app-layout">
      <aside className="sidebar">
        <div className="sidebar-header">
          <h2><span className="logo-icon">🌍</span> CarbonCredit AI</h2>
        </div>
        <nav className="sidebar-nav">
          {sections.map(section => (
            <div key={section} className="nav-section">
              <div className="nav-section-title">{section}</div>
              {FEATURES.filter(f => f.section === section).map(f => (
                <div key={f.key} className={`nav-item ${currentPage === f.key ? 'active' : ''}`}
                  onClick={() => setCurrentPage(f.key)}>
                  <span className="nav-icon">{f.icon}</span>
                  <span>{f.label}</span>
                </div>
              ))}
            </div>
          ))}
        </nav>
        <div className="sidebar-footer">
          <div className="user-info">
            <div className="user-avatar">{user.name?.charAt(0)}</div>
            <div>
              <div className="name">{user.name}</div>
              <div className="role">{user.role}</div>
            </div>
          </div>
          <button className="logout-btn" onClick={handleLogout}>Sign Out</button>
        </div>
      </aside>

      <main className="main-content">
        {currentPage === 'dashboard' ? (
          <Dashboard features={FEATURES} onNavigate={setCurrentPage} showToast={showToast} />
        ) : currentPage === 'ai-hub' ? (
          <AIHub aiFeatures={AI_FEATURES} onNavigate={setCurrentPage} showToast={showToast} />
        ) : currentPage === 'ai-studio' ? (
          <AIStudio showToast={showToast} />
        ) : currentPage === 'webhooks' ? (
          <Webhooks showToast={showToast} />
        ) : feature ? (
          <CrudPage feature={feature} showToast={showToast} />
        ) : null}
      </main>

      {toast && <div className={`toast toast-${toast.type}`}>{toast.message}</div>}
    </div>
  );
}

export default App;
