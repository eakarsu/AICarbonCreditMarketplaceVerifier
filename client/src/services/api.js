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

  // Dashboard
  getDashboardStats: () => request('/dashboard/stats'),
};

export default api;
