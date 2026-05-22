import React, { useState } from 'react';
import api from '../services/api';

export default function PortfolioIntegrityPage() {
  const [payload, setPayload] = useState('{"credits":[{"name":"Forest A","quantity":1200,"vintage":2021,"registry":"Verra","status":"available"},{"name":"Cookstove B","quantity":400,"vintage":2016,"registry":"Gold Standard","status":"available"}]}');
  const [result, setResult] = useState(null);
  const run = async () => setResult(await api.portfolioIntegrityScore(JSON.parse(payload || '{}')));
  return (
    <div className="page">
      <div className="page-header"><h1>Portfolio Integrity</h1><button className="btn btn-primary" onClick={run}>Score Portfolio</button></div>
      <textarea rows={8} value={payload} onChange={(e) => setPayload(e.target.value)} />
      {result && <pre className="card">{JSON.stringify(result, null, 2)}</pre>}
    </div>
  );
}
