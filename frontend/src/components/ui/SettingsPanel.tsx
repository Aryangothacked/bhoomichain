import { useState, useEffect, useRef } from 'react';
import { X, Key, RefreshCw, Download, Info, Save, AlertTriangle } from 'lucide-react';
import client from '../../api/client';
import toast from 'react-hot-toast';

interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const SettingsPanel: React.FC<SettingsPanelProps> = ({ isOpen, onClose }) => {
  const [visible, setVisible] = useState(false);
  const [groqKey, setGroqKey] = useState('');
  const [saving, setSaving] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [exporting, setExporting] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  // Slide-in/out logic
  useEffect(() => {
    if (isOpen) {
      // Allow DOM to mount, then trigger slide
      requestAnimationFrame(() => setVisible(true));
    } else {
      setVisible(false);
    }
  }, [isOpen]);

  // Load stored Groq key from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('bhc_groq_key') || '';
    setGroqKey(stored);
  }, [isOpen]);

  const handleSaveKey = () => {
    setSaving(true);
    setTimeout(() => {
      localStorage.setItem('bhc_groq_key', groqKey);
      toast.success('Groq API key saved locally');
      setSaving(false);
    }, 400);
  };

  const handleResetDemo = async () => {
    setResetting(true);
    try {
      // Health check first
      await client.get('/health');
      const confirmed = window.confirm(
        'This will reset all demo blockchain data to its initial state. All registered properties will be removed.\n\nAre you sure?'
      );
      if (!confirmed) { setResetting(false); return; }
      await client.post('/reset-demo');
      toast.success('Demo data reset successfully. Refresh the page.');
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Reset failed — server may be offline');
    } finally {
      setResetting(false);
    }
  };

  const handleExportLedger = async () => {
    setExporting(true);
    try {
      const res = await client.get('/ledger?export=true');
      const json = JSON.stringify(res.data, null, 2);
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `bhoomichain-ledger-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success('Ledger exported successfully');
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Export failed');
    } finally {
      setExporting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* ── Overlay ── */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0, zIndex: 1000,
          background: 'rgba(15, 23, 42, 0.45)',
          opacity: visible ? 1 : 0,
          transition: 'opacity 0.3s ease',
        }}
      />

      {/* ── Panel ── */}
      <div
        ref={panelRef}
        style={{
          position: 'fixed', top: 0, right: 0, bottom: 0,
          width: 360, zIndex: 1001,
          background: '#fff',
          boxShadow: '-4px 0 32px rgba(0,0,0,0.12)',
          display: 'flex', flexDirection: 'column',
          transform: visible ? 'translateX(0)' : 'translateX(100%)',
          transition: 'transform 0.3s ease',
          fontFamily: "'Inter', 'Segoe UI', sans-serif",
        }}
      >
        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '20px 24px', borderBottom: '1px solid #F1F5F9',
        }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: '#0F172A', margin: 0 }}>Settings</h2>
          <button
            onClick={onClose}
            aria-label="Close settings"
            style={{
              width: 32, height: 32, borderRadius: 8, border: 'none',
              background: '#F1F5F9', cursor: 'pointer', display: 'flex',
              alignItems: 'center', justifyContent: 'center', color: '#64748B',
            }}
          >
            <X style={{ width: 16, height: 16 }} />
          </button>
        </div>

        {/* Scrollable content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>

          {/* ── Section 1: API Configuration ── */}
          <section style={{ marginBottom: 32 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
              <Key style={{ width: 15, height: 15, color: '#1B4F8A' }} />
              <h3 style={{ fontSize: 13, fontWeight: 700, color: '#374151', margin: 0, textTransform: 'uppercase', letterSpacing: 0.8 }}>
                API Configuration
              </h3>
            </div>

            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>
              Groq API Key
            </label>
            <input
              id="groq-api-key-input"
              type="password"
              value={groqKey}
              onChange={(e) => setGroqKey(e.target.value)}
              placeholder="gsk_..."
              autoComplete="off"
              style={{
                width: '100%', height: 40, border: '1px solid #D1D5DB',
                borderRadius: 8, padding: '0 14px', fontSize: 13,
                color: '#0F172A', outline: 'none', boxSizing: 'border-box',
                fontFamily: 'monospace',
              }}
            />
            <p style={{ fontSize: 11, color: '#94A3B8', margin: '6px 0 12px', lineHeight: 1.5 }}>
              Used for AI fraud analysis. Get your free key at{' '}
              <a href="https://console.groq.com" target="_blank" rel="noopener noreferrer"
                style={{ color: '#1B4F8A', textDecoration: 'none', fontWeight: 600 }}>
                console.groq.com
              </a>
            </p>

            <button
              id="save-api-key-btn"
              onClick={handleSaveKey}
              disabled={saving}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                height: 36, padding: '0 16px', borderRadius: 7,
                background: '#1B4F8A', border: 'none', color: '#fff',
                fontSize: 13, fontWeight: 600, cursor: saving ? 'not-allowed' : 'pointer',
                opacity: saving ? 0.7 : 1,
              }}
            >
              <Save style={{ width: 13, height: 13 }} />
              {saving ? 'Saving…' : 'Save Key'}
            </button>
          </section>

          <div style={{ height: 1, background: '#F1F5F9', marginBottom: 24 }} />

          {/* ── Section 2: Blockchain ── */}
          <section style={{ marginBottom: 32 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
              <RefreshCw style={{ width: 15, height: 15, color: '#1B4F8A' }} />
              <h3 style={{ fontSize: 13, fontWeight: 700, color: '#374151', margin: 0, textTransform: 'uppercase', letterSpacing: 0.8 }}>
                Blockchain
              </h3>
            </div>

            {/* Reset Demo */}
            <div style={{
              background: '#FFF7F5', border: '1px solid #FED7C3',
              borderRadius: 10, padding: '14px 16px', marginBottom: 12,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                <AlertTriangle style={{ width: 13, height: 13, color: '#C2410C' }} />
                <span style={{ fontSize: 12, fontWeight: 700, color: '#C2410C' }}>Reset Demo Data</span>
              </div>
              <p style={{ fontSize: 12, color: '#78350F', margin: '0 0 12px', lineHeight: 1.5 }}>
                Removes all registered properties and resets the chain to genesis state.
              </p>
              <button
                id="reset-demo-btn"
                onClick={handleResetDemo}
                disabled={resetting}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  height: 34, padding: '0 14px', borderRadius: 6,
                  background: '#fff', border: '1px solid #F97316', color: '#C2410C',
                  fontSize: 12, fontWeight: 700, cursor: resetting ? 'not-allowed' : 'pointer',
                  opacity: resetting ? 0.6 : 1,
                }}
              >
                <RefreshCw style={{ width: 12, height: 12 }} />
                {resetting ? 'Resetting…' : 'Reset Demo Data'}
              </button>
            </div>

            {/* Export Ledger */}
            <div style={{
              background: '#F0FDF4', border: '1px solid #BBF7D0',
              borderRadius: 10, padding: '14px 16px',
            }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: '#166534', display: 'block', marginBottom: 6 }}>
                Export Full Ledger
              </span>
              <p style={{ fontSize: 12, color: '#14532D', margin: '0 0 12px', lineHeight: 1.5 }}>
                Download the complete blockchain ledger as a JSON file.
              </p>
              <button
                id="export-ledger-btn"
                onClick={handleExportLedger}
                disabled={exporting}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  height: 34, padding: '0 14px', borderRadius: 6,
                  background: '#fff', border: '1px solid #22C55E', color: '#166534',
                  fontSize: 12, fontWeight: 700, cursor: exporting ? 'not-allowed' : 'pointer',
                  opacity: exporting ? 0.6 : 1,
                }}
              >
                <Download style={{ width: 12, height: 12 }} />
                {exporting ? 'Exporting…' : 'Export Full Ledger'}
              </button>
            </div>
          </section>

          <div style={{ height: 1, background: '#F1F5F9', marginBottom: 24 }} />

          {/* ── Section 3: About ── */}
          <section>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
              <Info style={{ width: 15, height: 15, color: '#1B4F8A' }} />
              <h3 style={{ fontSize: 13, fontWeight: 700, color: '#374151', margin: 0, textTransform: 'uppercase', letterSpacing: 0.8 }}>
                About
              </h3>
            </div>

            {[
              { label: 'Version', value: 'v1.0.0' },
              { label: 'Chain', value: 'BC-MAINNET (Simulated)' },
              { label: 'Protocol', value: 'SHA-256 · Merkle Tree' },
              { label: 'Environment', value: 'Development' },
            ].map(({ label, value }) => (
              <div key={label} style={{
                display: 'flex', justifyContent: 'space-between',
                padding: '8px 0', borderBottom: '1px solid #F8FAFC',
              }}>
                <span style={{ fontSize: 13, color: '#64748B' }}>{label}</span>
                <span style={{ fontSize: 13, fontWeight: 600, color: '#0F172A', fontFamily: 'monospace' }}>{value}</span>
              </div>
            ))}

            <p style={{ fontSize: 12, color: '#94A3B8', marginTop: 16, lineHeight: 1.6 }}>
              Built for transparency in Indian land registry.
              <br />
              Ministry of Housing &amp; Urban Affairs — Simulated Demo
            </p>
          </section>
        </div>
      </div>
    </>
  );
};

export default SettingsPanel;
