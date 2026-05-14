import React, { useState, useEffect } from 'react';
import api from '../services/api';

// Sample payloads for each AI feature
const SAMPLES = {
  'additionality-validator': {
    project_data: {
      name: 'Amazon Reforestation Phase 2',
      type: 'Reforestation',
      country: 'Brazil',
      area_hectares: 2500,
      methodology: 'VM0047',
      financing: 'Carbon revenue + grant',
      counterfactual_baseline: 'Continued cattle ranching',
    },
    baseline_scenario: {
      land_use: 'Pasture for cattle',
      annual_emissions_tco2e: 12500,
      existing_regulations: 'No mandate to reforest',
      profitability_without_credits: 'Marginally profitable',
    },
  },
  'vintage-analyzer': {
    credits: [
      { id: 'C-001', vintage: 2018, quantity: 5000, registry: 'Verra VCS' },
      { id: 'C-002', vintage: 2020, quantity: 3500, registry: 'Gold Standard' },
      { id: 'C-003', vintage: 2023, quantity: 7200, registry: 'Verra VCS' },
      { id: 'C-004', vintage: 2017, quantity: 1800, registry: 'CDM' },
    ],
    vintage_dates: [2017, 2018, 2020, 2023],
  },
  'market-predictor': {
    credit_type: 'Reforestation',
    historical_prices: [
      { date: '2024-01-01', price_usd_per_ton: 8.5 },
      { date: '2024-04-01', price_usd_per_ton: 10.2 },
      { date: '2024-07-01', price_usd_per_ton: 11.8 },
      { date: '2024-10-01', price_usd_per_ton: 12.4 },
      { date: '2025-01-01', price_usd_per_ton: 13.1 },
      { date: '2025-04-01', price_usd_per_ton: 14.6 },
    ],
  },
  'compliance-reporter': {
    reporting_period: 'FY2024',
    portfolio_data: {
      total_emissions_tco2e: 18500,
      retired_credits_tco2e: 15000,
      remaining_offsets: 3500,
      reduction_target_pct: 30,
      actual_reduction_pct: 22,
      frameworks: ['CDP', 'TCFD', 'GRI'],
    },
  },
  'certification-tracker': {
    certifications: [
      { id: 'CERT-001', registry: 'Gold Standard', name: 'Kenya Cookstove Project', issued: '2022-06-01', expiry: '2025-06-01', status: 'Active' },
      { id: 'CERT-002', registry: 'Verra VCS', name: 'Amazon Reforestation', issued: '2023-08-15', expiry: '2026-08-15', status: 'Active' },
      { id: 'CERT-003', registry: 'CDM', name: 'India Wind Farm', issued: '2018-01-01', expiry: '2025-01-01', status: 'Expiring' },
    ],
  },
  'impact-verifier': {
    project_data: { name: 'Borneo Rainforest Protection', type: 'REDD+', country: 'Indonesia' },
    promised_outcomes: {
      annual_emissions_avoided_tco2e: 45000,
      hectares_protected: 12000,
      jobs_created: 200,
      sdg_alignment: ['SDG 13', 'SDG 15'],
    },
    actual_metrics: {
      year: 2024,
      annual_emissions_avoided_tco2e: 38500,
      hectares_protected: 11200,
      jobs_created: 165,
      satellite_verified_canopy_loss_pct: 4.2,
    },
  },
  'supply-chain-tracer': {
    credit_id: 'C-VCS-001-2024',
    project_data: { name: 'Amazon Reforestation', registry: 'Verra VCS', methodology: 'VM0047' },
    transactions: [
      { step: 1, event_type: 'Issuance', date: '2024-03-01', from: 'Verra', to: 'Project Owner', quantity_tco2e: 10000, registry_serial: 'VCS-001-2024-A' },
      { step: 2, event_type: 'Transfer', date: '2024-05-12', from: 'Project Owner', to: 'Broker A', quantity_tco2e: 5000, registry_serial: 'VCS-001-2024-A' },
      { step: 3, event_type: 'Transfer', date: '2024-07-08', from: 'Broker A', to: 'Corporation X', quantity_tco2e: 3000, registry_serial: 'VCS-001-2024-A' },
      { step: 4, event_type: 'Retirement', date: '2024-12-15', from: 'Corporation X', to: 'Retired', quantity_tco2e: 3000, registry_serial: 'VCS-001-2024-A' },
    ],
  },
  'buyer-recommend': {
    esg_goals: ['biodiversity', 'community impact', 'high permanence'],
    budget: 50000,
  },
};

const FEATURES = [
  { id: 'additionality-validator', name: 'Additionality Validator', icon: '🔬', description: 'Validate additionality claims and identify questionable elements', api: 'aiAdditionalityValidator' },
  { id: 'vintage-analyzer', name: 'Vintage Maturity Analyzer', icon: '📅', description: 'Track vintage maturity, retirement windows, and near-expiry alerts', api: 'aiVintageAnalyzer' },
  { id: 'market-predictor', name: 'Market Price Predictor', icon: '📈', description: 'Predict carbon credit price trends and arbitrage opportunities', api: 'aiMarketPredictor' },
  { id: 'compliance-reporter', name: 'Compliance Reporter', icon: '📋', description: 'Auto-generate ESG/TCFD/CDP reports with full disclosures', api: 'aiComplianceReporter' },
  { id: 'certification-tracker', name: 'Certification Tracker', icon: '🏅', description: 'Monitor Gold Standard, VCS, CDM expiries and recertification progress', api: 'aiCertificationTracker' },
  { id: 'impact-verifier', name: 'Impact Verifier', icon: '🌍', description: 'Verify real-world environmental impact vs promised outcomes', api: 'aiImpactVerifier' },
  { id: 'supply-chain-tracer', name: 'Supply Chain Tracer', icon: '🔗', description: 'Trace chain-of-custody, detect double-counting, verify serialization', api: 'aiSupplyChainTracer' },
  { id: 'buyer-recommend', name: 'Buyer Portal Recommender', icon: '🛒', description: 'AI-recommend an optimal carbon credit portfolio for ESG goals + budget', api: 'aiBuyerRecommend' },
];

export default function AIStudio({ showToast }) {
  const [activeId, setActiveId] = useState(FEATURES[0].id);
  const [payload, setPayload] = useState(JSON.stringify(SAMPLES[FEATURES[0].id], null, 2));
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const [historyPage, setHistoryPage] = useState(1);
  const [historyTotal, setHistoryTotal] = useState(1);
  const [historyFeature, setHistoryFeature] = useState('');

  const active = FEATURES.find(f => f.id === activeId);

  useEffect(() => {
    setPayload(JSON.stringify(SAMPLES[activeId], null, 2));
    setResult(null);
  }, [activeId]);

  const loadHistory = async (page = 1, feature = '') => {
    try {
      const params = { page, limit: 10 };
      if (feature) params.feature = feature;
      const res = await api.aiResultsList(params);
      setHistory(res.data || []);
      setHistoryTotal(res.pagination?.totalPages || 1);
      setHistoryPage(page);
    } catch (e) {
      showToast?.('Failed to load AI history: ' + e.message, 'error');
    }
  };

  useEffect(() => { loadHistory(1, historyFeature); }, [historyFeature]);

  const run = async () => {
    let body;
    try { body = JSON.parse(payload); }
    catch { showToast?.('Payload must be valid JSON', 'error'); return; }

    setLoading(true);
    setResult(null);
    try {
      const res = await api[active.api](body);
      setResult(res);
      showToast?.(`${active.name} complete`, 'success');
      loadHistory(1, historyFeature);
    } catch (e) {
      showToast?.('AI call failed: ' + e.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>🧪 AI Studio</h1>
          <p>8 advanced AI capabilities — feed structured inputs, get JSON insight</p>
        </div>
        <div className="badge badge-purple" style={{ fontSize: 14, padding: '8px 16px' }}>{FEATURES.length} Tools</div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: 16 }}>
        <div className="card" style={{ padding: 12, height: 'fit-content' }}>
          <h3 style={{ marginTop: 0, marginBottom: 12, fontSize: 14, color: '#022c22' }}>Tools</h3>
          {FEATURES.map(f => (
            <div
              key={f.id}
              onClick={() => setActiveId(f.id)}
              style={{
                padding: '10px 12px',
                marginBottom: 6,
                borderRadius: 6,
                cursor: 'pointer',
                background: activeId === f.id ? 'linear-gradient(135deg,#7c3aed,#6d28d9)' : 'transparent',
                color: activeId === f.id ? 'white' : '#1e293b',
                fontSize: 13,
                fontWeight: activeId === f.id ? 600 : 400,
              }}
            >
              <span style={{ marginRight: 8 }}>{f.icon}</span>{f.name}
            </div>
          ))}
        </div>

        <div>
          <div className="card" style={{ padding: 16, marginBottom: 16 }}>
            <h2 style={{ marginTop: 0 }}>{active.icon} {active.name}</h2>
            <p style={{ color: '#64748b', marginTop: 4 }}>{active.description}</p>

            <label style={{ display: 'block', marginTop: 16, marginBottom: 6, fontWeight: 600, fontSize: 13 }}>Request Payload (JSON)</label>
            <textarea
              value={payload}
              onChange={e => setPayload(e.target.value)}
              rows={14}
              style={{ width: '100%', fontFamily: 'monospace', fontSize: 12, padding: 12, border: '1px solid #e2e8f0', borderRadius: 6 }}
            />
            <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
              <button className="btn btn-accent" onClick={run} disabled={loading}>
                {loading ? '🔄 Running...' : `🚀 Run ${active.name}`}
              </button>
              <button className="btn btn-outline" onClick={() => setPayload(JSON.stringify(SAMPLES[activeId], null, 2))} disabled={loading}>
                Reset to Sample
              </button>
            </div>
          </div>

          {result && (
            <div className="card" style={{ padding: 16, marginBottom: 16 }}>
              <h3 style={{ marginTop: 0 }}>Response</h3>
              <pre style={{ background: '#0f172a', color: '#e2e8f0', padding: 16, borderRadius: 6, fontSize: 12, overflow: 'auto', maxHeight: 600 }}>
                {JSON.stringify(result, null, 2)}
              </pre>
            </div>
          )}

          <div className="card" style={{ padding: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
              <h3 style={{ margin: 0 }}>📜 AI Results History (paginated)</h3>
              <select value={historyFeature} onChange={e => setHistoryFeature(e.target.value)} style={{ padding: 6, border: '1px solid #e2e8f0', borderRadius: 4 }}>
                <option value="">All features</option>
                {FEATURES.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
              </select>
            </div>
            {history.length === 0 && <div style={{ color: '#94a3b8', padding: 20, textAlign: 'center' }}>No stored results yet.</div>}
            {history.length > 0 && (
              <table className="data-table" style={{ width: '100%' }}>
                <thead>
                  <tr><th>ID</th><th>Feature</th><th>Created</th><th>Preview</th></tr>
                </thead>
                <tbody>
                  {history.map(h => (
                    <tr key={h.id}>
                      <td>#{h.id}</td>
                      <td><span className="badge">{h.feature}</span></td>
                      <td style={{ fontSize: 12 }}>{new Date(h.createdAt || h.created_at).toLocaleString()}</td>
                      <td style={{ fontSize: 12, color: '#64748b', maxWidth: 400, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {JSON.stringify(h.output).substring(0, 120)}...
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 12, justifyContent: 'center' }}>
              <button className="btn btn-outline" disabled={historyPage <= 1} onClick={() => loadHistory(historyPage - 1, historyFeature)}>Previous</button>
              <span>Page {historyPage} of {historyTotal}</span>
              <button className="btn btn-outline" disabled={historyPage >= historyTotal} onClick={() => loadHistory(historyPage + 1, historyFeature)}>Next</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
