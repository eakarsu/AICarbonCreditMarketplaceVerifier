import React, { useState, useEffect, useCallback } from 'react';
import api from '../services/api';

export default function CrudPage({ feature, showToast }) {
  const [items, setItems] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [formData, setFormData] = useState({});
  const [aiResult, setAiResult] = useState('');
  const [loadingAI, setLoadingAI] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showConfirm, setShowConfirm] = useState(null);
  const [view, setView] = useState('list'); // list | detail

  const loadItems = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.getAll(feature.resource);
      setItems(data);
    } catch (err) {
      showToast('Failed to load data: ' + err.message, 'error');
    }
    setLoading(false);
  }, [feature.resource, showToast]);

  useEffect(() => {
    loadItems();
    setView('list');
    setSelectedItem(null);
    setAiResult('');
  }, [feature.key, loadItems]);

  const handleCreate = () => {
    setEditItem(null);
    setFormData({});
    setShowModal(true);
  };

  const handleEdit = (item) => {
    setEditItem(item);
    const data = {};
    feature.fields.forEach(f => {
      let val = item[f.name];
      if (f.type === 'date' && val) val = val.substring(0, 10);
      data[f.name] = val || '';
    });
    setFormData(data);
    setShowModal(true);
  };

  const handleSave = async () => {
    try {
      const payload = { ...formData };
      feature.fields.forEach(f => {
        if (f.type === 'number' && payload[f.name]) payload[f.name] = parseFloat(payload[f.name]);
      });

      if (editItem) {
        await api.update(feature.resource, editItem.id, payload);
        showToast('Updated successfully');
      } else {
        await api.create(feature.resource, payload);
        showToast('Created successfully');
      }
      setShowModal(false);
      loadItems();
    } catch (err) {
      showToast('Error: ' + err.message, 'error');
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(feature.resource, id);
      showToast('Deleted successfully');
      if (view === 'detail') setView('list');
      loadItems();
      setShowConfirm(null);
    } catch (err) {
      showToast('Error: ' + err.message, 'error');
      setShowConfirm(null);
    }
  };

  const handleRowClick = async (item) => {
    try {
      const detail = await api.getOne(feature.resource, item.id);
      setSelectedItem(detail);
      setView('detail');
      setAiResult('');
    } catch (err) {
      setSelectedItem(item);
      setView('detail');
    }
  };

  const handleAIAction = async (action, itemId) => {
    setLoadingAI(true);
    setAiResult('');
    try {
      let result;
      switch (action) {
        case 'aiAnalyzeCredit': result = await api.aiAnalyzeCredit(itemId); break;
        case 'aiTransactionRisk': result = await api.aiTransactionRisk(itemId); break;
        case 'aiProjectEvaluate': result = await api.aiProjectEvaluate(itemId); break;
        case 'aiVerify': result = await api.aiVerify(itemId); break;
        case 'aiComplianceAnalyze': result = await api.aiComplianceAnalyze(itemId); break;
        case 'aiSustainabilityInsights': result = await api.aiSustainabilityInsights(itemId); break;
        case 'aiRetirementAnalyze': result = await api.aiRetirementAnalyze(itemId); break;
        case 'aiAuditAnalyze': result = await api.aiAuditAnalyze(itemId); break;
        default: break;
      }
      const aiText = result.aiAnalysis || result.aiVerification || result.aiEvaluation ||
        result.aiRiskAnalysis || result.aiInsights || result.aiRecommendation || JSON.stringify(result, null, 2);
      setAiResult(aiText);
    } catch (err) {
      showToast('AI Error: ' + err.message, 'error');
    }
    setLoadingAI(false);
  };

  const handleGlobalAIAction = async (action) => {
    setLoadingAI(true);
    setAiResult('');
    try {
      let result;
      switch (action) {
        case 'aiPriceSuggestion': result = await api.aiPriceSuggestion({ projectType: 'Reforestation', vintage: 2024, quantity: 1000, country: 'Brazil', methodology: 'VCS' }); break;
        case 'aiCalculateEmissions': result = await api.aiCalculateEmissions({ activities: 'Office operations, employee commuting, business travel, data centers' }); break;
        case 'aiReductionPlan': result = await api.aiReductionPlan(); break;
        case 'aiMarketPredict': result = await api.aiMarketPredict(); break;
        case 'aiGenerateRecommendation': result = await api.aiGenerateRecommendation({ budget: 'moderate', priority: 'balanced' }); break;
        case 'aiCertificateSummary': result = await api.aiCertificateSummary(); break;
        case 'aiAuditPatterns': result = await api.aiAuditPatterns(); break;
        default: break;
      }
      const aiText = result.aiSuggestion || result.aiCalculation || result.aiReductionPlan ||
        result.aiPrediction || result.aiRecommendation || result.aiCertificate || result.aiPatternAnalysis || JSON.stringify(result, null, 2);
      setAiResult(aiText);
    } catch (err) {
      showToast('AI Error: ' + err.message, 'error');
    }
    setLoadingAI(false);
  };

  const formatValue = (key, value) => {
    if (value === null || value === undefined) return '—';
    if (key === 'totalPrice' || key === 'pricePerTon' || key === 'fee' || key === 'estimatedCost' || key === 'price') return `$${parseFloat(value).toLocaleString()}`;
    if (key === 'quantity' || key === 'amount' || key === 'volume' || key === 'estimatedReduction' || key === 'actualReduction' || key === 'totalEmissions' || key === 'totalOffsets' || key === 'netEmissions' || key === 'emissionAmount') return parseFloat(value).toLocaleString();
    if (key === 'changePercent' || key === 'reductionTarget' || key === 'actualReduction') return typeof value === 'number' ? `${value > 0 ? '+' : ''}${value.toFixed(2)}%` : value;
    if (key === 'change') return typeof value === 'number' ? `${value > 0 ? '+' : ''}$${value.toFixed(2)}` : value;
    if (key === 'createdAt' || key === 'date' || key === 'timestamp' || key === 'retirementDate' || key === 'dueDate') return value ? new Date(value).toLocaleDateString() : '—';
    if (key === 'aiScore') return value ? `${value}/100` : '—';
    return String(value);
  };

  const getStatusBadge = (value) => {
    if (!value) return '';
    const v = String(value).toLowerCase();
    if (['available', 'completed', 'approved', 'verified', 'compliant', 'published', 'accepted', 'active'].includes(v)) return 'badge-green';
    if (['pending', 'pending_review', 'under_review', 'in_progress', 'proposed', 'draft'].includes(v)) return 'badge-yellow';
    if (['sold', 'reserved', 'buy', 'transfer'].includes(v)) return 'badge-blue';
    if (['rejected', 'failed', 'cancelled', 'non_compliant', 'suspended', 'critical'].includes(v)) return 'badge-red';
    if (['retired', 'retire', 'archived'].includes(v)) return 'badge-purple';
    if (['low'].includes(v)) return 'badge-green';
    if (['medium'].includes(v)) return 'badge-yellow';
    if (['high'].includes(v)) return 'badge-red';
    return 'badge-gray';
  };

  const isStatusField = (key) => ['status', 'verificationStatus', 'complianceStatus', 'transactionType', 'riskLevel', 'scope', 'priority'].includes(key);

  // Detail View
  if (view === 'detail' && selectedItem) {
    return (
      <div>
        <button className="back-btn" onClick={() => { setView('list'); setAiResult(''); }}>
          ← Back to {feature.label}
        </button>

        <div className="detail-view">
          <div className="detail-header">
            <h2>{selectedItem.name || selectedItem.title || selectedItem.action || `${feature.label} #${selectedItem.id}`}</h2>
            <p>{feature.label} — ID: {selectedItem.id}</p>
          </div>
          <div className="detail-body">
            <div className="detail-grid">
              {Object.entries(selectedItem).filter(([k]) => !['id', 'createdAt', 'updatedAt', 'aiAnalysis', 'aiRecommendations', 'aiInsights', 'recommendedCredits'].includes(k)).map(([key, value]) => (
                <div key={key} className="detail-field">
                  <label>{key.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase())}</label>
                  {isStatusField(key) ? (
                    <span className={`badge ${getStatusBadge(value)}`}>{value || '—'}</span>
                  ) : (
                    <div className="value">{formatValue(key, value)}</div>
                  )}
                </div>
              ))}
            </div>

            {/* Show existing AI data if present */}
            {(selectedItem.aiAnalysis || selectedItem.aiRecommendations || selectedItem.aiInsights) && (
              <div className="ai-output" style={{ marginTop: 24 }}>
                <div className="ai-output-content">
                  {formatAIOutput(selectedItem.aiAnalysis || selectedItem.aiRecommendations || selectedItem.aiInsights)}
                </div>
              </div>
            )}

            <div className="detail-actions">
              <button className="btn btn-primary" onClick={() => handleEdit(selectedItem)}>✏️ Edit</button>
              <button className="btn btn-danger" onClick={() => setShowConfirm(selectedItem.id)}>🗑️ Delete</button>
              {feature.aiActions?.map(ai => (
                <button key={ai.key} className="btn btn-accent" onClick={() => handleAIAction(ai.action, selectedItem.id)} disabled={loadingAI}>
                  {ai.icon} {ai.label}
                </button>
              ))}
            </div>

            {/* AI: Select different item + sample buttons */}
            {(feature.aiActions?.length > 0 || feature.aiGlobalActions?.length > 0) && (
              <div style={{ marginTop: 20, padding: 20, background: '#faf5ff', borderRadius: 12, border: '1px solid #ede9fe' }}>
                <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, color: '#7c3aed', marginBottom: 10 }}>AI Tools — Analyze Another Item</div>
                <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
                  <select className="ai-dropdown" style={{ flex: 1, minWidth: 200 }}
                    value={selectedItem?.id || ''} onChange={e => {
                      const item = items.find(i => i.id === parseInt(e.target.value));
                      if (item) handleRowClick(item);
                    }}>
                    {items.map(item => (
                      <option key={item.id} value={item.id}>
                        #{item.id} — {item.name || item.title || item.action || item.reportType || item.beneficiary || item.creditType || item.category || `Item ${item.id}`}
                      </option>
                    ))}
                  </select>
                  {feature.aiActions?.map(ai => (
                    <button key={ai.key} className="btn btn-sm btn-accent" onClick={() => handleAIAction(ai.action, selectedItem.id)} disabled={loadingAI}>
                      {ai.icon} Run
                    </button>
                  ))}
                </div>
                {/* Sample quick-run buttons */}
                <div style={{ marginTop: 12, display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {items.slice(0, 5).map((item, idx) => (
                    <button key={item.id} className="btn-sample" disabled={loadingAI}
                      onClick={async () => {
                        const detail = await api.getOne(feature.resource, item.id).catch(() => item);
                        setSelectedItem(detail);
                        setAiResult('');
                        if (feature.aiActions?.[0]) handleAIAction(feature.aiActions[0].action, item.id);
                      }}>
                      ⚡ {item.name || item.title || item.action || item.reportType || item.beneficiary || `#${item.id}`}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {loadingAI && (
              <div className="ai-loading">
                <div className="spinner"></div>
                <span>AI is analyzing... This may take a moment</span>
              </div>
            )}

            {aiResult && (
              <div className="ai-output">
                <div className="ai-output-content">{formatAIOutput(aiResult)}</div>
              </div>
            )}
          </div>
        </div>

        {showConfirm && (
          <div className="confirm-overlay">
            <div className="confirm-dialog">
              <h3>Confirm Delete</h3>
              <p>Are you sure you want to delete this item? This action cannot be undone.</p>
              <div className="actions">
                <button className="btn btn-outline" onClick={() => setShowConfirm(null)}>Cancel</button>
                <button className="btn btn-danger" onClick={() => handleDelete(showConfirm)}>Delete</button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // List View
  return (
    <div>
      <div className="page-header">
        <div>
          <h1>{feature.icon} {feature.label}</h1>
          <p>{feature.description}</p>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          {feature.aiGlobalActions?.map(ai => (
            <button key={ai.key} className="btn btn-accent" onClick={() => handleGlobalAIAction(ai.action)} disabled={loadingAI}>
              {ai.icon} {ai.label}
            </button>
          ))}
          <button className="btn btn-primary" onClick={handleCreate}>+ New {feature.label.replace(/s$/, '')}</button>
        </div>
      </div>

      {/* AI Sample Buttons Bar for Global Actions */}
      {feature.aiGlobalActions?.length > 0 && (
        <div style={{ marginBottom: 20, padding: 20, background: '#faf5ff', borderRadius: 12, border: '1px solid #ede9fe' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, color: '#7c3aed' }}>AI Quick Samples</div>
          </div>
          {feature.aiActions?.length > 0 && items.length > 0 && (
            <div style={{ marginBottom: 12 }}>
              <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 8 }}>
                <select className="ai-dropdown" style={{ flex: 1 }}
                  onChange={e => {
                    const item = items.find(i => i.id === parseInt(e.target.value));
                    if (item) handleRowClick(item);
                  }}>
                  <option value="">Select an item for AI analysis...</option>
                  {items.map(item => (
                    <option key={item.id} value={item.id}>
                      #{item.id} — {item.name || item.title || item.action || item.reportType || item.category || `Item ${item.id}`}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {items.slice(0, 4).map(item => (
              <button key={item.id} className="btn-sample" disabled={loadingAI}
                onClick={() => {
                  handleRowClick(item);
                  if (feature.aiActions?.[0]) {
                    setTimeout(() => handleAIAction(feature.aiActions[0].action, item.id), 200);
                  }
                }}>
                ⚡ {item.name?.substring(0, 25) || item.title?.substring(0, 25) || item.action || item.reportType || `#${item.id}`}
              </button>
            ))}
          </div>
        </div>
      )}

      {loadingAI && (
        <div className="ai-loading" style={{ marginBottom: 20 }}>
          <div className="spinner"></div>
          <span>AI is analyzing... This may take a moment</span>
        </div>
      )}

      {aiResult && (
        <div className="ai-output" style={{ marginBottom: 24 }}>
          <div className="ai-output-content">{formatAIOutput(aiResult)}</div>
        </div>
      )}

      {loading ? (
        <div className="empty-state"><div className="icon">⏳</div><h3>Loading...</h3></div>
      ) : items.length === 0 ? (
        <div className="empty-state">
          <div className="icon">{feature.icon}</div>
          <h3>No {feature.label} Yet</h3>
          <p>Click the button above to create your first entry.</p>
        </div>
      ) : (
        <div className="data-table-container">
          <table className="data-table">
            <thead>
              <tr>
                {(feature.tableColumns || []).map(col => (
                  <th key={col}>{col.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase())}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {items.map(item => (
                <tr key={item.id} onClick={() => handleRowClick(item)}>
                  {(feature.tableColumns || []).map(col => (
                    <td key={col}>
                      {isStatusField(col) ? (
                        <span className={`badge ${getStatusBadge(item[col])}`}>{item[col] || '—'}</span>
                      ) : (
                        formatValue(col, item[col])
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setShowModal(false)}>
          <div className="modal">
            <div className="modal-header">
              <h3>{editItem ? 'Edit' : 'New'} {feature.label.replace(/s$/, '')}</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
            </div>
            <div className="modal-body">
              {feature.fields.map(field => (
                <div key={field.name} className="form-group">
                  <label>{field.label} {field.required && '*'}</label>
                  {field.type === 'textarea' ? (
                    <textarea value={formData[field.name] || ''} onChange={e => setFormData({ ...formData, [field.name]: e.target.value })}
                      placeholder={`Enter ${field.label.toLowerCase()}`} />
                  ) : field.type === 'select' ? (
                    <select value={formData[field.name] || ''} onChange={e => setFormData({ ...formData, [field.name]: e.target.value })}>
                      <option value="">Select {field.label}</option>
                      {field.options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                  ) : (
                    <input type={field.type === 'number' ? 'number' : field.type === 'date' ? 'date' : 'text'}
                      step={field.type === 'number' ? 'any' : undefined}
                      value={formData[field.name] || ''} onChange={e => setFormData({ ...formData, [field.name]: e.target.value })}
                      placeholder={`Enter ${field.label.toLowerCase()}`} required={field.required} />
                  )}
                </div>
              ))}
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleSave}>{editItem ? 'Update' : 'Create'}</button>
            </div>
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
      const bold = line.replace(/\*\*(.*?)\*\*/g, '|||$1|||');
      return (
        <div key={i} style={{ paddingLeft: 16, marginBottom: 6, display: 'flex', gap: 8 }}>
          <span style={{ color: '#7c3aed', fontWeight: 700, minWidth: 24 }}>{line.match(/^\d+/)[0]}.</span>
          <span>{renderBoldText(line.replace(/^\d+\.\s/, ''))}</span>
        </div>
      );
    }
    if (line.match(/^[-•]\s/)) {
      return (
        <div key={i} style={{ paddingLeft: 32, marginBottom: 4, display: 'flex', gap: 8 }}>
          <span style={{ color: '#059669' }}>•</span>
          <span>{renderBoldText(line.replace(/^[-•]\s/, ''))}</span>
        </div>
      );
    }
    if (line.trim() === '') return <div key={i} style={{ height: 8 }} />;
    return <div key={i} style={{ marginBottom: 4 }}>{renderBoldText(line)}</div>;
  });
}

function renderBoldText(text) {
  const parts = text.split(/(\*\*.*?\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i} style={{ color: '#1e293b' }}>{part.slice(2, -2)}</strong>;
    }
    return part;
  });
}
