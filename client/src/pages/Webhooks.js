import React, { useState, useEffect } from 'react';
import api from '../services/api';

const ALLOWED_EVENTS = [
  'credit.created',
  'credit.verified',
  'credit.retired',
  'transaction.completed',
  'project.added',
  'verification.passed',
  'verification.rejected',
  'compliance.report_generated',
  'market_data.updated',
];

export default function Webhooks({ showToast }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ url: '', secret: '', events: ['credit.created'] });
  const [testResult, setTestResult] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const r = await api.webhooksList();
      setItems(Array.isArray(r) ? r : (r?.data || []));
    } catch (e) {
      showToast?.('Failed to load webhooks: ' + e.message, 'error');
    }
    setLoading(false);
  };
  useEffect(() => { load(); /* eslint-disable-next-line */ }, []);

  const toggleEvent = (ev) => {
    setForm((f) => ({
      ...f,
      events: f.events.includes(ev) ? f.events.filter((e) => e !== ev) : [...f.events, ev],
    }));
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!form.url) { showToast?.('URL is required', 'error'); return; }
    if (form.events.length === 0) { showToast?.('Select at least one event', 'error'); return; }
    setCreating(true);
    try {
      await api.webhookCreate({ url: form.url, events: form.events, secret: form.secret || null });
      showToast?.('Webhook created', 'success');
      setForm({ url: '', secret: '', events: ['credit.created'] });
      load();
    } catch (e) { showToast?.('Failed: ' + e.message, 'error'); }
    setCreating(false);
  };

  const remove = async (id) => {
    if (!window.confirm('Remove this webhook?')) return;
    try {
      await api.webhookDelete(id);
      setItems((xs) => xs.filter((x) => x.id !== id));
    } catch (e) { showToast?.('Failed: ' + e.message, 'error'); }
  };

  const test = async (id) => {
    setTestResult(null);
    try {
      const r = await api.webhookTest(id);
      setTestResult(r);
      showToast?.('Test payload generated', 'success');
    } catch (e) { showToast?.('Test failed: ' + e.message, 'error'); }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>🔔 Webhook Subscriptions</h1>
          <p>Subscribe external systems to marketplace events</p>
        </div>
      </div>

      <div className="card" style={{ padding: 16, marginBottom: 16 }}>
        <h3 style={{ marginTop: 0 }}>+ New Subscription</h3>
        <form onSubmit={submit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label>Endpoint URL</label>
              <input type="url" placeholder="https://example.com/hooks/carbon" value={form.url}
                onChange={(e) => setForm({ ...form, url: e.target.value })} required />
            </div>
            <div>
              <label>Signing Secret (optional)</label>
              <input type="text" placeholder="hex/base64" value={form.secret}
                onChange={(e) => setForm({ ...form, secret: e.target.value })} />
            </div>
          </div>
          <div style={{ marginTop: 12 }}>
            <label>Events</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {ALLOWED_EVENTS.map((ev) => (
                <label key={ev} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <input type="checkbox" checked={form.events.includes(ev)} onChange={() => toggleEvent(ev)} />
                  <span>{ev}</span>
                </label>
              ))}
            </div>
          </div>
          <button type="submit" className="btn btn-primary" style={{ marginTop: 12 }} disabled={creating}>
            {creating ? 'Creating...' : 'Create Subscription'}
          </button>
        </form>
      </div>

      <div className="card" style={{ padding: 16 }}>
        <h3 style={{ marginTop: 0 }}>Active Webhooks</h3>
        {loading && <p>Loading...</p>}
        {!loading && items.length === 0 && <p>No webhooks subscribed yet.</p>}
        {!loading && items.length > 0 && (
          <table className="data-table" style={{ width: '100%' }}>
            <thead>
              <tr><th>ID</th><th>URL</th><th>Events</th><th>Active</th><th>Created</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {items.map((w) => (
                <tr key={w.id}>
                  <td>{w.id}</td>
                  <td style={{ wordBreak: 'break-all', maxWidth: 280 }}>{w.url}</td>
                  <td style={{ fontSize: 12 }}>{(w.events || []).join(', ')}</td>
                  <td>{w.active ? 'Yes' : 'No'}</td>
                  <td>{w.created_at ? new Date(w.created_at).toLocaleString() : ''}</td>
                  <td>
                    <button className="btn" style={{ marginRight: 8 }} onClick={() => test(w.id)}>Test</button>
                    <button className="btn" onClick={() => remove(w.id)}>Remove</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {testResult && (
        <div className="card" style={{ padding: 16, marginTop: 16 }}>
          <h3>Test Payload</h3>
          <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', maxHeight: 400, overflow: 'auto', fontSize: 12 }}>
            {JSON.stringify(testResult, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
