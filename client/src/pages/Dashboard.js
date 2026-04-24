import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Legend } from 'recharts';
import api from '../services/api';

const COLORS = ['#059669', '#0891b2', '#7c3aed', '#f59e0b', '#dc2626', '#10b981', '#6366f1', '#ec4899'];

export default function Dashboard({ features, onNavigate, showToast }) {
  const [stats, setStats] = useState({});
  const [aiInsights, setAiInsights] = useState('');
  const [loadingAI, setLoadingAI] = useState(false);
  const [marketData, setMarketData] = useState([]);
  const [emissions, setEmissions] = useState([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [s, md, em] = await Promise.all([
        api.getDashboardStats(),
        api.getAll('market-data'),
        api.getAll('emissions')
      ]);
      setStats(s);
      setMarketData(md);
      setEmissions(em);
    } catch (err) { console.error(err); }
  };

  const getAIInsights = async () => {
    setLoadingAI(true);
    try {
      const data = await api.aiDashboardInsights();
      setAiInsights(data.aiInsights);
    } catch (err) {
      showToast('Failed to get AI insights: ' + err.message, 'error');
    }
    setLoadingAI(false);
  };

  const statCards = [
    { label: 'Total Credits', value: stats.totalCredits || 0, icon: '🌿', color: '#dcfce7' },
    { label: 'Available Credits', value: stats.availableCredits || 0, icon: '✅', color: '#dbeafe' },
    { label: 'Transactions', value: stats.totalTransactions || 0, icon: '💱', color: '#fef9c3' },
    { label: 'Active Projects', value: stats.totalProjects || 0, icon: '🏗️', color: '#f3e8ff' },
    { label: 'Emissions (tCO2e)', value: stats.totalEmissions || 0, icon: '🏭', color: '#fef2f2' },
    { label: 'Verifications', value: stats.totalVerifications || 0, icon: '🔍', color: '#e0f2fe' },
    { label: 'Avg. Price ($/ton)', value: `$${stats.avgMarketPrice || 0}`, icon: '📈', color: '#ecfdf5' },
    { label: 'Total Volume ($)', value: `$${(stats.transactionVolume || 0).toLocaleString()}`, icon: '💰', color: '#fdf4ff' },
  ];

  const featureCards = features.filter(f => f.resource);

  // Chart data
  const emissionsByCategory = emissions.reduce((acc, e) => {
    const existing = acc.find(a => a.name === e.category);
    if (existing) existing.value += e.amount;
    else acc.push({ name: e.category, value: e.amount });
    return acc;
  }, []).sort((a, b) => b.value - a.value).slice(0, 8);

  const marketByType = marketData.reduce((acc, m) => {
    if (!acc.find(a => a.name === m.creditType)) {
      acc.push({ name: m.creditType.substring(0, 20), price: m.price, volume: m.volume || 0 });
    }
    return acc;
  }, []).slice(0, 8);

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Dashboard</h1>
          <p>AI-Powered Carbon Credit Marketplace Overview</p>
        </div>
        <button className="btn btn-accent" onClick={getAIInsights} disabled={loadingAI}>
          {loadingAI ? '🔄 Analyzing...' : '🤖 Get AI Insights'}
        </button>
      </div>

      <div className="stats-grid">
        {statCards.map((s, i) => (
          <div key={i} className="stat-card">
            <div className="stat-icon" style={{ background: s.color }}>{s.icon}</div>
            <div className="stat-value">{s.value}</div>
            <div className="stat-label">{s.label}</div>
          </div>
        ))}
      </div>

      {aiInsights && (
        <div className="ai-output" style={{ marginBottom: 32 }}>
          <div className="ai-output-content">{formatAIOutput(aiInsights)}</div>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 32 }}>
        <div className="chart-container">
          <h3>Emissions by Category</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={emissionsByCategory} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label={({ name, value }) => `${name}: ${value.toFixed(0)}`}>
                {emissionsByCategory.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-container">
          <h3>Market Prices by Credit Type</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={marketByType}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" angle={-25} textAnchor="end" height={80} fontSize={11} />
              <YAxis />
              <Tooltip />
              <Bar dataKey="price" fill="#059669" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 20, color: '#022c22' }}>Features</h2>
      <div className="features-grid">
        {featureCards.map(f => (
          <div key={f.key} className="feature-card" onClick={() => onNavigate(f.key)}>
            <div className="card-icon" style={{ background: '#f0fdf4' }}>{f.icon}</div>
            <h3>{f.label}</h3>
            <p>{f.description}</p>
            {(f.aiActions?.length > 0 || f.aiGlobalActions?.length > 0) && (
              <span className="card-count">🤖 AI-Powered</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function formatAIOutput(text) {
  if (!text) return '';
  return text.split('\n').map((line, i) => {
    if (line.match(/^#{1,3}\s/)) {
      return <h3 key={i} style={{ color: '#6b21a8', marginTop: 12 }}>{line.replace(/^#+\s/, '')}</h3>;
    }
    if (line.match(/^\*\*.*\*\*$/)) {
      return <h3 key={i} style={{ color: '#6b21a8', marginTop: 12 }}>{line.replace(/\*\*/g, '')}</h3>;
    }
    if (line.match(/^\d+\.\s/)) {
      return <div key={i} style={{ paddingLeft: 16, marginBottom: 4 }}>{renderBold(line)}</div>;
    }
    if (line.match(/^[-•]\s/)) {
      return <div key={i} style={{ paddingLeft: 24, marginBottom: 4 }}>{renderBold(line)}</div>;
    }
    if (line.trim() === '') return <br key={i} />;
    return <div key={i} style={{ marginBottom: 4 }}>{renderBold(line)}</div>;
  });
}

function renderBold(text) {
  const parts = text.split(/(\*\*.*?\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i}>{part.slice(2, -2)}</strong>;
    }
    return part;
  });
}
