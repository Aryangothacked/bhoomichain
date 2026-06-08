
import { useState, useEffect } from 'react';
import client from '../api/client';
import { Spinner } from '../components/ui';
import { ShieldAlert, AlertTriangle, Scale, Clock } from 'lucide-react';
import toast from 'react-hot-toast';

export default function FraudDetection() {
  const [textToAnalyze, setTextToAnalyze] = useState('');
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetchingAlerts, setFetchingAlerts] = useState(true);

  useEffect(() => {
    console.log('FraudDetection Page Mounted');
    fetchAlerts();
  }, []);

  const fetchAlerts = async () => {
    setFetchingAlerts(true);
    try {
      const res = await client.get('/fraud/alerts');
      setAlerts(res.data.rejectedAttempts || []);
    } catch (err) {
      console.error('Failed to fetch fraud alerts:', err);
      // We don't toast error here to keep the UI clean as per user request to always render
    } finally {
      setFetchingAlerts(false);
    }
  };

  const handleAnalyze = async () => {
    if (!textToAnalyze.trim()) return;
    setLoading(true);
    try {
      const res = await client.post('/fraud/analyze', { text: textToAnalyze });
      if (res.data.success) {
        setAnalysisResult(res.data.aiAnalysis);
        toast.success('Analysis Complete');
      }
    } catch (err: any) {
      toast.error('AI Analysis failed. Check Groq API connectivity.');
    } finally {
      setLoading(false);
    }
  };

  const getRiskColor = (score: number) => {
    if (score < 30) return '#16A34A'; // Green
    if (score < 70) return '#D97706'; // Amber
    return '#DC2626'; // Red
  };

  return (
    <div className="max-w-6xl mx-auto space-y-10 pb-20" style={{ animation: 'fadeInUp 0.3s ease forwards' }}>
      {/* AI Fraud Analyzer Top Section */}
      <div className="card" style={{ padding: '32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
          <ShieldAlert size={28} color="#1B4F8A" />
          <h1 style={{ fontSize: '24px', fontWeight: 700, margin: 0 }}>AI Fraud Analyzer</h1>
        </div>
        <p style={{ color: '#64748B', fontSize: '15px', marginBottom: '24px' }}>
          Powered by Groq AI — Analyses transactions for PMLA violations, benami ownership, and circle rate fraud
        </p>

        <textarea
          style={{ height: '120px', width: '100%', marginBottom: '20px' }}
          className="textarea"
          placeholder="Describe a suspicious transaction or paste property details here..."
          value={textToAnalyze}
          onChange={(e) => setTextToAnalyze(e.target.value)}
        ></textarea>

        <button 
          onClick={handleAnalyze} 
          disabled={loading || !textToAnalyze.trim()}
          className="btn-primary" 
          style={{ width: '100%', height: '44px' }}
        >
          {loading ? (
            <div className="flex items-center gap-2">
              <Spinner /> Analyzing transaction...
            </div>
          ) : 'Analyze with AI'}
        </button>

        {analysisResult && (
          <div style={{ marginTop: '32px', padding: '32px', background: '#F8FAFC', borderRadius: '16px', border: '1px solid #E2E8F0' }} className="animate-fade-in">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '32px', marginBottom: '32px' }}>
              <div style={{ textAlign: 'center' }}>
                <p style={{ fontSize: '12px', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', marginBottom: '12px' }}>Suspected Risk Score</p>
                <div style={{ fontSize: '64px', fontWeight: 800, color: getRiskColor(analysisResult.riskScore || 0), lineHeight: 1 }}>
                  {analysisResult.riskScore || 0}
                </div>
              </div>
              
              <div>
                <p style={{ fontSize: '12px', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', marginBottom: '12px' }}>Recommendation</p>
                <span className="badge" style={{ 
                  fontSize: '14px', padding: '8px 16px',
                  backgroundColor: analysisResult.recommendation === 'REJECT' ? '#FDE8E8' : analysisResult.recommendation === 'FLAG' ? '#FEF3C7' : '#DEF7EC',
                  color: analysisResult.recommendation === 'REJECT' ? '#9B1C1C' : analysisResult.recommendation === 'FLAG' ? '#92400E' : '#03543F',
                  border: '1px solid currentColor'
                }}>
                  {analysisResult.recommendation}
                </span>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px', marginBottom: '32px' }}>
              <div>
                <h4 style={{ fontSize: '14px', fontWeight: 700, color: '#DC2626', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <AlertTriangle size={16} /> Red Flags Found:
                </h4>
                <ul style={{ listStyle: 'none', padding: 0 }}>
                  {analysisResult.redFlags?.map((flag: string, i: number) => (
                    <li key={i} style={{ fontSize: '13px', color: '#475569', marginBottom: '8px', display: 'flex', gap: '8px' }}>
                      <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#DC2626', marginTop: '6px', flexShrink: 0 }}></div>
                      {flag}
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 style={{ fontSize: '14px', fontWeight: 700, color: '#1B4F8A', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Scale size={16} /> Applicable Laws:
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {analysisResult.lawSections?.map((law: any, i: number) => (
                    <div key={i}>
                      <span style={{ fontSize: '12px', fontWeight: 700, color: '#1B4F8A', display: 'block' }}>{law.section}</span>
                      <span style={{ fontSize: '11px', color: '#64748B' }}>{law.description}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div style={{ borderTop: '1px solid #E2E8F0', paddingTop: '20px' }}>
               <h4 style={{ fontSize: '14px', fontWeight: 700, color: '#0F172A', marginBottom: '8px' }}>Summary:</h4>
               <p style={{ fontSize: '14px', color: '#475569', lineHeight: 1.6 }}>{analysisResult.summary}</p>
            </div>
          </div>
        )}
      </div>

      {/* Fraud Alerts Log Bottom Section */}
      <div className="card" style={{ padding: '32px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Clock size={20} color="#64748B" /> Fraud Alerts Log
        </h3>

        {fetchingAlerts ? (
          <div style={{ textAlign: 'center', padding: '40px' }}><Spinner /></div>
        ) : alerts.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px', background: '#F8FAFC', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
            <ShieldAlert size={48} color="#CBD5E1" style={{ marginBottom: '16px' }} />
            <p style={{ color: '#64748B', fontWeight: 500 }}>No fraud alerts recorded yet</p>
          </div>
        ) : (
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Attempted By</th>
                  <th>Property Details</th>
                  <th>Reason</th>
                  <th>Date</th>
                  <th>Action Taken</th>
                </tr>
              </thead>
              <tbody>
                {alerts.map((alert, idx) => (
                  <tr key={idx} style={{ backgroundColor: '#FEF2F2', borderLeft: '4px solid #DC2626' }}>
                    <td style={{ fontWeight: 600 }}>{alert.propertyDetails?.ownerName || 'Unknown'}</td>
                    <td>
                      <div className="mono" style={{ fontSize: '11px' }}>{alert.propertyDetails?.propertyId}</div>
                      <div style={{ fontSize: '11px', color: '#64748B' }}>{alert.propertyDetails?.city}</div>
                    </td>
                    <td style={{ color: '#9B1C1C', fontWeight: 500, maxWidth: '300px' }}>{alert.reason}</td>
                    <td style={{ color: '#64748B' }}>{new Date(alert.timestamp).toLocaleDateString()}</td>
                    <td>
                      <span className="badge" style={{ backgroundColor: '#FDE8E8', color: '#9B1C1C' }}>
                        REJECTED
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
