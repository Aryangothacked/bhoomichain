
import { useState, useEffect } from 'react';
import client from '../api/client';
import { Spinner } from '../components/ui';
import { formatIndianCurrency } from '../utils/formatters';
import { ShieldCheck, ShieldAlert, Download, Plus, AlertCircle, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';
import { generateLedgerSummary } from '../utils/generatePDF';

export default function Ledger() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLedger = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await client.get('/ledger');
      // Axios returns response.data
      // structure is { chain: Block[], chainValid: boolean, totalBlocks: number }
      console.log('Ledger API full response:', response.data);
      setData(response.data);
    } catch (err: any) {
      console.error('Ledger fetch error:', err);
      setError(err.response?.data?.error || 'Unable to connect to the blockchain node.');
      toast.error('Blockchain sync failed');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLedger();
  }, []);

  const handleExport = () => {
    if (!data?.chain) return;
    const blob = new Blob([JSON.stringify(data.chain, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bhoomichain_ledger_${new Date().getTime()}.json`;
    a.click();
    toast.success('Ledger exported to JSON');
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '100px 0' }}>
        <Spinner className="w-10 h-10 text-primary" />
        <p style={{ marginTop: '16px', color: '#64748B', fontWeight: 500 }}>Syncing with Decentralized Nodes...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card" style={{ maxWidth: '500px', margin: '40px auto', textAlign: 'center' }}>
        <AlertCircle size={48} color="#DC2626" style={{ marginBottom: '16px' }} />
        <h3 style={{ marginBottom: '8px' }}>Security Error</h3>
        <p style={{ color: '#64748B', marginBottom: '24px' }}>{error}</p>
        <button className="btn-primary" onClick={fetchLedger} style={{ margin: '0 auto' }}>
          <RefreshCw size={16} /> Retry Connection
        </button>
      </div>
    );
  }

  const chain = data?.chain || [];

  return (
    <div style={{ animation: 'fadeInUp 0.3s ease forwards' }}>
      {/* Top Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <span style={{ fontSize: '15px', fontWeight: 600, color: '#475569' }}>
            {data?.totalBlocks || chain.length} blocks on chain
          </span>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '6px', 
            padding: '4px 10px', 
            borderRadius: '6px',
            backgroundColor: data?.chainValid ? '#DEF7EC' : '#FDE8E8',
            color: data?.chainValid ? '#03543F' : '#9B1C1C',
            fontSize: '11px',
            fontWeight: 700
          }}>
            {data?.chainValid ? <ShieldCheck size={14} /> : <ShieldAlert size={14} />}
            {data?.chainValid ? 'HEALTHY & VALID' : 'COMPROMISED'}
          </div>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <button onClick={() => generateLedgerSummary(chain)} style={{ 
            height: '40px', padding: '0 16px', borderRadius: '8px', border: '1px solid #1B4F8A', 
            background: 'none', color: '#1B4F8A', fontSize: '13px', fontWeight: 600, cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: '8px', transition: 'all 0.2s'
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = '#1B4F8A'; e.currentTarget.style.color = '#fff'; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = '#1B4F8A'; }}
          >
            <Download size={16} /> Export PDF Summary
          </button>
          <button onClick={handleExport} style={{ 
            height: '40px', padding: '0 16px', borderRadius: '8px', border: '1px solid #D1D5DB', 
            background: 'white', color: '#374151', fontSize: '13px', fontWeight: 600, cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: '8px'
          }}>
            <Download size={16} /> Export JSON
          </button>
          <a href="/register" style={{ 
             height: '40px', padding: '0 16px', borderRadius: '8px', background: '#1B4F8A', 
             color: 'white', fontSize: '13px', fontWeight: 600, textDecoration: 'none',
             display: 'flex', alignItems: 'center', gap: '8px'
          }}>
            <Plus size={16} /> Add Transaction
          </a>
        </div>
      </div>

      {/* Table */}
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Block #</th>
              <th>Event Type</th>
              <th>Property ID</th>
              <th>Owner</th>
              <th>City</th>
              <th>Value</th>
              <th>Timestamp</th>
              <th>Hash</th>
            </tr>
          </thead>
          <tbody>
            {chain
              .filter((b: any) => b.blockNumber > 0)
              .reverse()
              .map((block: any, idx: number) => (
              <tr key={idx}>
                <td className="mono" style={{ fontWeight: 700 }}>{block.blockNumber}</td>
                <td>
                  <span className="badge" style={{ 
                    backgroundColor: block.data?.eventType === 'SALE' ? '#DEF7EC' : block.data?.eventType === 'COURT_FREEZE' ? '#FDE8E8' : '#EBF5FF',
                    color: block.data?.eventType === 'SALE' ? '#03543F' : block.data?.eventType === 'COURT_FREEZE' ? '#9B1C1C' : '#1E429F',
                  }}>
                    {block.data?.eventType || 'ENTRY'}
                  </span>
                </td>
                <td className="mono" style={{ fontSize: '12px' }}>{block.data?.propertyId || '—'}</td>
                <td style={{ fontWeight: 500 }}>{block.data?.ownerName || '—'}</td>
                <td style={{ color: '#64748B' }}>{block.data?.city || '—'}</td>
                <td style={{ fontWeight: 600 }}>{block.data?.declaredValue ? formatIndianCurrency(block.data.declaredValue) : '—'}</td>
                <td style={{ color: '#64748B' }}>{new Date(block.timestamp).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}</td>
                <td>
                  <span className="hash-display" title={block.hash}>
                    {block.hash ? `${block.hash.substring(0, 16)}...` : '0x000...'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
