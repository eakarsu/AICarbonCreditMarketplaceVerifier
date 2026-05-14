const API_BASE = '/api';

function getHeaders() {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };
}

async function request(path, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: getHeaders()
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data;
}

const api = {
  // Auth
  login: (body) => request('/auth/login', { method: 'POST', body: JSON.stringify(body) }),
  register: (body) => request('/auth/register', { method: 'POST', body: JSON.stringify(body) }),
  getMe: () => request('/auth/me'),

  // Generic CRUD
  getAll: (resource) => request(`/${resource}`),
  getOne: (resource, id) => request(`/${resource}/${id}`),
  create: (resource, body) => request(`/${resource}`, { method: 'POST', body: JSON.stringify(body) }),
  update: (resource, id, body) => request(`/${resource}/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  delete: (resource, id) => request(`/${resource}/${id}`, { method: 'DELETE' }),

  // AI endpoints
  aiAnalyzeCredit: (id) => request(`/credits/${id}/ai-analyze`, { method: 'POST' }),
  aiPriceSuggestion: (body) => request('/credits/ai-price-suggestion', { method: 'POST', body: JSON.stringify(body) }),
  aiTransactionRisk: (id) => request(`/transactions/${id}/ai-risk`, { method: 'POST' }),
  aiProjectEvaluate: (id) => request(`/projects/${id}/ai-evaluate`, { method: 'POST' }),
  aiVerify: (id) => request(`/verifications/${id}/ai-verify`, { method: 'POST' }),
  aiCalculateEmissions: (body) => request('/emissions/ai-calculate', { method: 'POST', body: JSON.stringify(body) }),
  aiReductionPlan: () => request('/emissions/ai-reduction-plan', { method: 'POST' }),
  aiMarketPredict: () => request('/market-data/ai-predict', { method: 'POST' }),
  aiComplianceAnalyze: (id) => request(`/compliance/${id}/ai-analyze`, { method: 'POST' }),
  aiGenerateRecommendation: (body) => request('/recommendations/ai-generate', { method: 'POST', body: JSON.stringify(body) }),
  aiSustainabilityInsights: (id) => request(`/sustainability/${id}/ai-insights`, { method: 'POST' }),
  aiDashboardInsights: () => request('/dashboard/ai-insights'),
  aiRetirementAnalyze: (id) => request(`/retirements/${id}/ai-analyze`, { method: 'POST' }),
  aiCertificateSummary: () => request('/retirements/ai-certificate-summary', { method: 'POST' }),
  aiAuditPatterns: () => request('/audit/ai-analyze-patterns', { method: 'POST' }),
  aiAuditAnalyze: (id) => request(`/audit/${id}/ai-analyze`, { method: 'POST' }),

  // AI Hub New Features
  aiAdditionalityValidator: (body) => request('/ai/additionality-validator', { method: 'POST', body: JSON.stringify(body) }),
  aiVintageAnalyzer: (body) => request('/ai/vintage-analyzer', { method: 'POST', body: JSON.stringify(body) }),
  aiMarketPredictor: (body) => request('/ai/market-predictor', { method: 'POST', body: JSON.stringify(body) }),
  aiComplianceReporter: (body) => request('/ai/compliance-reporter', { method: 'POST', body: JSON.stringify(body) }),
  aiCertificationTracker: (body) => request('/ai/certification-tracker', { method: 'POST', body: JSON.stringify(body) }),
  aiImpactVerifier: (body) => request('/ai/impact-verifier', { method: 'POST', body: JSON.stringify(body) }),
  aiSupplyChainTracer: (body) => request('/ai/supply-chain-tracer', { method: 'POST', body: JSON.stringify(body) }),
  aiBuyerBrowse: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request(`/buyer/browse${qs ? `?${qs}` : ''}`);
  },
  aiBuyerRecommend: (body) => request('/buyer/recommend', { method: 'POST', body: JSON.stringify(body) }),
  aiResultsList: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request(`/ai/results${qs ? `?${qs}` : ''}`);
  },

  // Dashboard
  getDashboardStats: () => request('/dashboard/stats'),

  // Webhooks
  webhooksList: () => request('/webhooks'),
  webhookCreate: (body) => request('/webhooks', { method: 'POST', body: JSON.stringify(body) }),
  webhookDelete: (id) => request(`/webhooks/${id}`, { method: 'DELETE' }),
  webhookTest: (id) => request(`/webhooks/${id}/test`, { method: 'POST' }),
};

export default api;
