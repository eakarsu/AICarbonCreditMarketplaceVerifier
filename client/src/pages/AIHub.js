import React, { useState, useEffect } from 'react';
import api from '../services/api';

// Sample data presets for each AI feature
const SAMPLE_PRESETS = {
  'dashboard-insights': [
    { label: 'Full Marketplace Overview', data: {} },
    { label: 'Risk-Focused Analysis', data: { focus: 'risk' } },
    { label: 'Growth Opportunity Scan', data: { focus: 'growth' } },
  ],
  'credit-quality': [
    { label: 'Amazon Reforestation (Brazil)', itemFilter: item => item.name?.includes('Amazon') },
    { label: 'Norway DAC (High-Tech)', itemFilter: item => item.name?.includes('Norway') },
    { label: 'Kenya Cookstove (Community)', itemFilter: item => item.name?.includes('Kenya') },
  ],
  'price-suggestion': [
    { label: 'Reforestation in Brazil', data: { projectType: 'Reforestation', vintage: 2024, quantity: 5000, country: 'Brazil', methodology: 'VM0047' } },
    { label: 'Solar Energy in India', data: { projectType: 'Renewable Energy', vintage: 2023, quantity: 10000, country: 'India', methodology: 'GS-RE' } },
    { label: 'Blue Carbon in Indonesia', data: { projectType: 'Blue Carbon', vintage: 2024, quantity: 2000, country: 'Indonesia', methodology: 'VM0033' } },
    { label: 'Direct Air Capture (Premium)', data: { projectType: 'Carbon Removal', vintage: 2024, quantity: 500, country: 'Norway', methodology: 'DAC-v1' } },
  ],
  'transaction-risk': [
    { label: 'Large REDD+ Purchase ($71K)', itemFilter: item => item.totalPrice > 50000 },
    { label: 'Failed Transaction', itemFilter: item => item.status === 'failed' },
    { label: 'Pending High-Value', itemFilter: item => item.status === 'pending' && item.totalPrice > 5000 },
  ],
  'project-impact': [
    { label: 'Amazon Green Belt (Large Scale)', itemFilter: item => item.name?.includes('Amazon') },
    { label: 'Swiss DAC (Tech Removal)', itemFilter: item => item.name?.includes('Swiss') },
    { label: 'Borneo Rainforest (REDD+)', itemFilter: item => item.name?.includes('Borneo') },
  ],
  'auto-verify': [
    { label: 'Pending Verification', itemFilter: item => item.status === 'pending' },
    { label: 'In-Progress Review', itemFilter: item => item.status === 'in_progress' },
    { label: 'High Risk Entry', itemFilter: item => item.riskLevel === 'high' || item.riskLevel === 'medium' },
  ],
  'carbon-calculator': [
    { label: 'Tech Company (Office + Data Centers)', data: { activities: 'Office electricity 500MWh, natural gas heating 200MWh, employee commuting 150 employees, business flights 50 round trips, cloud data centers 100 servers, purchased laptops 200 units' } },
    { label: 'Manufacturing Plant', data: { activities: 'Industrial manufacturing 3500 tCO2e, diesel generators 95 tCO2e, waste to landfill 180 tCO2e, logistics fleet 1250 tCO2e, water treatment, raw material supply chain' } },
    { label: 'Retail Chain (5 Stores)', data: { activities: 'Retail stores electricity 800MWh, refrigeration systems HFC leakage, product distribution 890 tCO2e, employee commuting 300 employees, packaging waste, customer deliveries' } },
    { label: 'Financial Services Firm', data: { activities: 'Office buildings 3 locations, business air travel 200 flights, employee commuting 500 staff, data centers, paper consumption 12 tons, catering services' } },
  ],
  'reduction-plan': [
    { label: 'Aggressive Net-Zero by 2030', data: {} },
    { label: 'Moderate Reduction Plan', data: {} },
    { label: 'Budget-Conscious Approach', data: {} },
  ],
  'market-prediction': [
    { label: 'Full Market Analysis', data: {} },
    { label: 'Voluntary Carbon Focus', data: {} },
    { label: 'Compliance Market Focus', data: {} },
  ],
  'retirement-impact': [
    { label: 'Corporate Neutrality Retirement', itemFilter: item => item.reason?.includes('corporate') || item.reason?.includes('Annual') },
    { label: 'Large Volume Retirement', itemFilter: item => item.quantity >= 500 },
    { label: 'Pending Retirement', itemFilter: item => item.status === 'pending' },
  ],
  'certificate-summary': [
    { label: 'Full Portfolio Certificate', data: {} },
    { label: 'Annual Summary 2024', data: {} },
    { label: 'ESG Report Certificate', data: {} },
  ],
  'compliance-analysis': [
    { label: 'Non-Compliant Report', itemFilter: item => item.complianceStatus === 'non_compliant' },
    { label: 'EU ETS Framework', itemFilter: item => item.regulatoryFramework?.includes('EU') },
    { label: 'Pending Review Report', itemFilter: item => item.complianceStatus === 'pending_review' },
  ],
  'audit-security': [
    { label: 'Login Activity', itemFilter: item => item.action === 'LOGIN' },
    { label: 'AI Analysis Request', itemFilter: item => item.action?.includes('AI') },
    { label: 'Delete Action', itemFilter: item => item.action?.includes('DELETE') },
  ],
  'audit-patterns': [
    { label: 'Full Security Scan', data: {} },
    { label: 'Anomaly Detection', data: {} },
    { label: 'Compliance Audit', data: {} },
  ],
  'offset-recommendations': [
    { label: 'Moderate Budget - Balanced', data: { budget: 'moderate', priority: 'balanced' } },
    { label: 'High Budget - Premium Quality', data: { budget: 'high', priority: 'high quality and permanence' } },
    { label: 'Low Budget - Cost Efficient', data: { budget: 'low', priority: 'cost efficiency' } },
    { label: 'ESG-Focused Portfolio', data: { budget: 'moderate', priority: 'maximum ESG and co-benefits' } },
  ],
  'sustainability-insights': [
    { label: 'Published Annual Report', itemFilter: item => item.status === 'published' && item.title?.includes('Annual') },
    { label: 'Net Zero Roadmap', itemFilter: item => item.title?.includes('Net Zero') },
    { label: 'Draft Report (Needs Review)', itemFilter: item => item.status === 'draft' },
  ],
};

// Map feature IDs to API resource names for dropdown data
const FEATURE_RESOURCES = {
  'credit-quality': 'credits',
  'transaction-risk': 'transactions',
  'project-impact': 'projects',
  'auto-verify': 'verifications',
  'retirement-impact': 'retirements',
  'compliance-analysis': 'compliance',
  'audit-security': 'audit',
  'sustainability-insights': 'sustainability',
};

export default function AIHub({ aiFeatures, onNavigate, showToast }) {
  const [activeFeature, setActiveFeature] = useState(null);
  const [aiResult, setAiResult] = useState('');
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const [expandedCard, setExpandedCard] = useState(null);
  const [dropdownItems, setDropdownItems] = useState([]);
  const [selectedItemId, setSelectedItemId] = useState('');
  const [loadingDropdown, setLoadingDropdown] = useState(false);

  const categories = [...new Set(aiFeatures.map(f => f.category))];

  // Load dropdown data when a card with needsItem is expanded
  const loadDropdownData = async (featureId) => {
    const resource = FEATURE_RESOURCES[featureId];
    if (!resource) return;
    setLoadingDropdown(true);
    try {
      const data = await api.getAll(resource);
      setDropdownItems(data);
    } catch (err) {
      setDropdownItems([]);
    }
    setLoadingDropdown(false);
  };

  const handleCardClick = async (feature) => {
    if (expandedCard === feature.id) {
      setExpandedCard(null);
      return;
    }
    setExpandedCard(feature.id);
    setSelectedItemId('');
    setDropdownItems([]);
    if (feature.needsItem) {
      await loadDropdownData(feature.id);
    }
  };

  const getItemLabel = (item, featureId) => {
    if (item.name) return `#${item.id} — ${item.name}`;
    if (item.title) return `#${item.id} — ${item.title}`;
    if (item.action) return `#${item.id} — ${item.action} (${item.entityType || ''})`;
    if (item.reportType) return `#${item.id} — ${item.reportType} (${item.period || ''})`;
    if (item.creditType) return `#${item.id} — ${item.creditType}`;
    if (item.methodology) return `#${item.id} — ${item.methodology} (${item.status})`;
    if (item.beneficiary) return `#${item.id} — ${item.beneficiary} (${item.quantity} tons)`;
    return `#${item.id}`;
  };

  const runWithPreset = async (feature, preset) => {
    // If preset has itemFilter, find matching item from dropdown
    if (preset.itemFilter && dropdownItems.length > 0) {
      const match = dropdownItems.find(preset.itemFilter);
      if (match) {
        setSelectedItemId(match.id);
        await runAIFeature(feature, match.id, preset.data);
      } else {
        // fallback to first item
        setSelectedItemId(dropdownItems[0].id);
        await runAIFeature(feature, dropdownItems[0].id, preset.data);
      }
    } else {
      await runAIFeature(feature, null, preset.data);
    }
  };

  const runAIFeature = async (feature, itemId, extraData) => {
    const resolvedId = itemId || selectedItemId;

    if (feature.needsItem && !resolvedId) {
      showToast('Please select an item from the dropdown first', 'error');
      return;
    }

    setActiveFeature(feature);
    setLoading(true);
    setAiResult('');

    try {
      let result;
      switch (feature.action) {
        case 'aiDashboardInsights':
          result = await api.aiDashboardInsights();
          setAiResult(result.aiInsights);
          break;
        case 'aiAnalyzeCredit':
          result = await api.aiAnalyzeCredit(resolvedId);
          setAiResult(result.aiAnalysis);
          break;
        case 'aiPriceSuggestion':
          result = await api.aiPriceSuggestion(extraData || { projectType: 'Reforestation', vintage: 2024, quantity: 1000, country: 'Brazil', methodology: 'VCS' });
          setAiResult(result.aiSuggestion);
          break;
        case 'aiTransactionRisk':
          result = await api.aiTransactionRisk(resolvedId);
          setAiResult(result.aiRiskAnalysis);
          break;
        case 'aiProjectEvaluate':
          result = await api.aiProjectEvaluate(resolvedId);
          setAiResult(result.aiEvaluation);
          break;
        case 'aiVerify':
          result = await api.aiVerify(resolvedId);
          setAiResult(result.aiVerification);
          break;
        case 'aiCalculateEmissions':
          result = await api.aiCalculateEmissions(extraData || { activities: 'Corporate office operations' });
          setAiResult(result.aiCalculation);
          break;
        case 'aiReductionPlan':
          result = await api.aiReductionPlan();
          setAiResult(result.aiReductionPlan);
          break;
        case 'aiMarketPredict':
          result = await api.aiMarketPredict();
          setAiResult(result.aiPrediction);
          break;
        case 'aiRetirementAnalyze':
          result = await api.aiRetirementAnalyze(resolvedId);
          setAiResult(result.aiAnalysis);
          break;
        case 'aiCertificateSummary':
          result = await api.aiCertificateSummary();
          setAiResult(result.aiCertificate);
          break;
        case 'aiComplianceAnalyze':
          result = await api.aiComplianceAnalyze(resolvedId);
          setAiResult(result.aiAnalysis);
          break;
        case 'aiAuditAnalyze':
          result = await api.aiAuditAnalyze(resolvedId);
          setAiResult(result.aiAnalysis);
          break;
        case 'aiAuditPatterns':
          result = await api.aiAuditPatterns();
          setAiResult(result.aiPatternAnalysis);
          break;
        case 'aiGenerateRecommendation':
          result = await api.aiGenerateRecommendation(extraData || { budget: 'moderate', priority: 'balanced' });
          setAiResult(result.aiRecommendation);
          break;
        case 'aiSustainabilityInsights':
          result = await api.aiSustainabilityInsights(resolvedId);
          setAiResult(result.aiInsights);
          break;
        default:
          break;
      }

      const textResult = typeof aiResult === 'string' ? aiResult : '';
      setHistory(prev => [{
        feature: feature.name,
        icon: feature.icon,
        timestamp: new Date().toLocaleTimeString(),
        preview: (textResult || JSON.stringify(result || '')).substring(0, 100) + '...'
      }, ...prev].slice(0, 10));
    } catch (err) {
      showToast('AI Error: ' + err.message, 'error');
      setAiResult('');
    }
    setLoading(false);
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>🧠 AI Command Center</h1>
          <p>All AI-powered features in one place — select data, load samples, and run AI analysis</p>
        </div>
        <div className="badge badge-purple" style={{ fontSize: 14, padding: '8px 16px' }}>
          {aiFeatures.length} AI Features
        </div>
      </div>

      {/* AI Feature Categories */}
      {categories.map(category => (
        <div key={category} style={{ marginBottom: 32 }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: '#022c22', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ width: 4, height: 24, background: 'linear-gradient(135deg, #7c3aed, #6d28d9)', borderRadius: 2, display: 'inline-block' }}></span>
            {category}
          </h2>
          <div className="ai-features-grid">
            {aiFeatures.filter(f => f.category === category).map(feature => {
              const isExpanded = expandedCard === feature.id;
              const presets = SAMPLE_PRESETS[feature.id] || [];
              return (
                <div
                  key={feature.id}
                  className={`ai-feature-card ${isExpanded ? 'expanded' : ''} ${activeFeature?.id === feature.id && loading ? 'running' : ''}`}
                  style={isExpanded ? { gridColumn: 'span 2' } : {}}
                >
                  <div onClick={() => handleCardClick(feature)} style={{ cursor: 'pointer' }}>
                    <div className="ai-card-header">
                      <span className="ai-card-icon">{feature.icon}</span>
                      <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                        {feature.needsItem && <span className="badge badge-yellow" style={{ fontSize: 10 }}>Needs Data</span>}
                        {!feature.needsItem && <span className="badge badge-green" style={{ fontSize: 10 }}>Ready</span>}
                        <span style={{ fontSize: 12, color: '#94a3b8' }}>{isExpanded ? '▲' : '▼'}</span>
                      </div>
                    </div>
                    <h3>{feature.name}</h3>
                    <p>{feature.description}</p>
                  </div>

                  {/* Expanded Panel */}
                  {isExpanded && (
                    <div className="ai-card-expanded">
                      {/* Dropdown for item selection */}
                      {feature.needsItem && (
                        <div className="ai-card-section">
                          <label className="ai-card-label">Select Data</label>
                          {loadingDropdown ? (
                            <div style={{ padding: '8px 0', color: '#94a3b8', fontSize: 13 }}>Loading available data...</div>
                          ) : (
                            <select
                              className="ai-dropdown"
                              value={selectedItemId}
                              onChange={e => setSelectedItemId(e.target.value)}
                            >
                              <option value="">— Choose an item —</option>
                              {dropdownItems.map(item => (
                                <option key={item.id} value={item.id}>
                                  {getItemLabel(item, feature.id)}
                                </option>
                              ))}
                            </select>
                          )}
                        </div>
                      )}

                      {/* Sample Presets */}
                      <div className="ai-card-section">
                        <label className="ai-card-label">Quick Samples</label>
                        <div className="ai-sample-buttons">
                          {presets.map((preset, idx) => (
                            <button
                              key={idx}
                              className="btn btn-sample"
                              onClick={() => runWithPreset(feature, preset)}
                              disabled={loading}
                            >
                              ⚡ {preset.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Run Button */}
                      <div className="ai-card-section" style={{ borderTop: '1px solid #e2e8f0', paddingTop: 16 }}>
                        <button
                          className="btn btn-accent btn-full"
                          onClick={() => runAIFeature(feature)}
                          disabled={loading || (feature.needsItem && !selectedItemId)}
                        >
                          {loading && activeFeature?.id === feature.id ? '🔄 Running...' : `🤖 Run ${feature.name}`}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}

      {/* Loading */}
      {loading && (
        <div className="ai-loading-full">
          <div className="ai-loading-animation">
            <div className="spinner-large"></div>
            <h3>AI is Processing...</h3>
            <p>Running {activeFeature?.name}</p>
          </div>
        </div>
      )}

      {/* AI Result */}
      {aiResult && !loading && (
        <div className="ai-output-large" id="ai-result">
          <div className="ai-output-large-header">
            <span>{activeFeature?.icon} {activeFeature?.name} — Results</span>
            <button className="btn btn-sm btn-outline" onClick={() => setAiResult('')}>Close</button>
          </div>
          <div className="ai-output-content">{formatAIOutput(aiResult)}</div>
        </div>
      )}

      {/* Recent AI Activity */}
      {history.length > 0 && (
        <div style={{ marginTop: 32 }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: '#022c22', marginBottom: 16 }}>Recent AI Activity</h2>
          <div className="data-table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Feature</th>
                  <th>Time</th>
                  <th>Preview</th>
                </tr>
              </thead>
              <tbody>
                {history.map((h, i) => (
                  <tr key={i}>
                    <td><span style={{ marginRight: 8 }}>{h.icon}</span>{h.feature}</td>
                    <td>{h.timestamp}</td>
                    <td style={{ color: '#64748b', fontSize: 13 }}>{h.preview}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

function formatAIOutput(text) {
  if (!text) return '';
  return text.split('\n').map((line, i) => {
    if (line.match(/^#{1,3}\s/)) {
      return <h3 key={i} style={{ color: '#6b21a8', marginTop: 12, marginBottom: 6, fontSize: 15, fontWeight: 700 }}>{line.replace(/^#+\s/, '')}</h3>;
    }
    if (line.match(/^\*\*.*\*\*$/)) {
      return <h3 key={i} style={{ color: '#6b21a8', marginTop: 12, marginBottom: 6, fontSize: 15, fontWeight: 700 }}>{line.replace(/\*\*/g, '')}</h3>;
    }
    if (line.match(/^\d+\.\s/)) {
      return (
        <div key={i} style={{ paddingLeft: 16, marginBottom: 6, display: 'flex', gap: 8 }}>
          <span style={{ color: '#7c3aed', fontWeight: 700, minWidth: 24 }}>{line.match(/^\d+/)[0]}.</span>
          <span>{renderBold(line.replace(/^\d+\.\s/, ''))}</span>
        </div>
      );
    }
    if (line.match(/^[-•]\s/)) {
      return (
        <div key={i} style={{ paddingLeft: 32, marginBottom: 4, display: 'flex', gap: 8 }}>
          <span style={{ color: '#059669' }}>•</span>
          <span>{renderBold(line.replace(/^[-•]\s/, ''))}</span>
        </div>
      );
    }
    if (line.trim() === '') return <div key={i} style={{ height: 8 }} />;
    return <div key={i} style={{ marginBottom: 4 }}>{renderBold(line)}</div>;
  });
}

function renderBold(text) {
  const parts = text.split(/(\*\*.*?\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i} style={{ color: '#1e293b' }}>{part.slice(2, -2)}</strong>;
    }
    return part;
  });
}
