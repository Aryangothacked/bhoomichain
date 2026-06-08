import { useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../api/client';
import PropertyMap from '../components/property/PropertyMap';
import { CityBarChart } from '../components/charts/CityBarChart';
import { formatCrore } from '../utils/formatters';
import { Database, Activity, ShieldAlert, ScrollText } from 'lucide-react';

interface DashboardStats {
  totalProperties: number;
  transactionsToday: number;
  fraudAlertsTotal: number;
  stampDutyCollected: number;
  registrationsByCity: Record<string, number>;
  recentTransactions: any[];
  cityNodeStatus: Record<string, string>;
}

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const [mapProperties, setMapProperties] = useState<any[]>([]);

  const fetchStats = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/dashboard/stats`, {
        timeout: 15000
      });
      
      console.log('Dashboard API response:', response.data);
      
      const data = response.data;
      setStats({
        totalProperties: data.totalProperties || 0,
        transactionsToday: data.transactionsToday || 0,
        fraudAlertsTotal: data.fraudAlertsTotal || 0,
        stampDutyCollected: data.stampDutyCollected || 0,
        registrationsByCity: data.registrationsByCity || {},
        recentTransactions: data.recentTransactions || [],
        cityNodeStatus: data.cityNodeStatus || {}
      });
      setError(null);
    } catch (err: any) {
      console.error('Dashboard fetch error:', err);
      setError(err.message || 'Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 30000);
    
    axios.get(`${API_BASE_URL}/api/properties`).then(res => {
      setMapProperties(res.data.properties || []);
    }).catch(console.error);

    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div style={{ padding: '24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
          {[1,2,3,4].map(i => (
            <div key={i} style={{ background: 'white', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '20px', height: '100px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ color: '#94A3B8', fontSize: '14px' }}>Loading...</span>
            </div>
          ))}
        </div>
        <div style={{ textAlign: 'center', padding: '40px', color: '#64748B' }}>
          <div style={{ fontSize: '24px', marginBottom: '8px' }}>⏳</div>
          <p>Connecting to blockchain...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '24px' }}>
        <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '12px', padding: '24px', textAlign: 'center' }}>
          <div style={{ fontSize: '32px', marginBottom: '12px' }}>⚠️</div>
          <h3 style={{ color: '#DC2626', marginBottom: '8px' }}>Dashboard failed to load</h3>
          <p style={{ color: '#64748B', marginBottom: '16px' }}>{error}</p>
          <p style={{ color: '#94A3B8', fontSize: '13px', marginBottom: '16px' }}>Make sure backend is running at {API_BASE_URL}</p>
          <button
            onClick={() => { setLoading(true); fetchStats() }}
            style={{ background: '#1B4F8A', color: 'white', border: 'none', borderRadius: '8px', padding: '10px 24px', cursor: 'pointer', fontSize: '14px' }}
          >Retry</button>
        </div>
      </div>
    );
  }

  if (!stats) return null;

  const chartData = stats.registrationsByCity
    ? Object.entries(stats.registrationsByCity).map(([city, count]) => ({
        city: city.substring(0, 3),
        fullCity: city,
        count: Number(count)
      }))
    : [];

  const METRICS = [
    { label: "Total Properties", value: stats.totalProperties, icon: Database, color: "#EBF5FF", iconColor: "#1B4F8A" },
    { label: "Transactions Today", value: stats.transactionsToday, icon: Activity, color: "#DEF7EC", iconColor: "#16A34A" },
    { label: "Fraud Alerts", value: stats.fraudAlertsTotal, icon: ShieldAlert, color: "#FDE8E8", iconColor: "#DC2626" },
    { label: "Stamp Duty Collected", value: (stats.stampDutyCollected / 10000000).toFixed(2) + ' Cr', icon: ScrollText, color: "#FEF3C7", iconColor: "#D97706" },
  ];

  return (
    <div style={{ animation: 'fadeInUp 0.3s ease forwards' }}>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '16px' }}>
        <div style={{ display: 'flex', background: '#F1F5F9', borderRadius: '8px', padding: '4px' }}>
          <button 
            onClick={() => setViewMode('list')}
            style={{ 
              padding: '6px 16px', borderRadius: '6px', fontSize: '13px', fontWeight: 600, border: 'none', cursor: 'pointer',
              background: viewMode === 'list' ? '#fff' : 'transparent', color: viewMode === 'list' ? '#1B4F8A' : '#64748B',
              boxShadow: viewMode === 'list' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
            }}
          >List View</button>
          <button 
            onClick={() => setViewMode('map')}
            style={{ 
              padding: '6px 16px', borderRadius: '6px', fontSize: '13px', fontWeight: 600, border: 'none', cursor: 'pointer',
              background: viewMode === 'map' ? '#fff' : 'transparent', color: viewMode === 'map' ? '#1B4F8A' : '#64748B',
              boxShadow: viewMode === 'map' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
            }}
          >Map View</button>
        </div>
      </div>

      {viewMode === 'map' ? (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <PropertyMap properties={mapProperties} height="calc(100vh - 200px)" />
        </div>
      ) : (
        <>
          <div className="metric-grid">
            {METRICS.map((item) => (
              <div key={item.label} className="metric-card">
                <div className="metric-icon" style={{ backgroundColor: item.color }}>
                  <item.icon size={20} color={item.iconColor} />
                </div>
                <p className="metric-value">{item.value}</p>
                <p className="metric-label">{item.label}</p>
              </div>
            ))}
          </div>

          <div className="dashboard-grid">
            <div className="card">
              <h3 className="section-title">Registrations by City</h3>
              <div style={{ height: '220px', width: '100%' }}>
                <CityBarChart data={chartData} />
              </div>
            </div>

            <div className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h3 style={{ fontSize: '15px', fontWeight: 500, margin: 0 }}>Live Activity Feed</h3>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <span className="pulsing-dot"></span>
                  <span style={{ fontSize: '11px', color: '#16A34A', fontWeight: 700 }}>LIVE</span>
                </div>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
                {stats.recentTransactions && stats.recentTransactions.length > 0 ? (
                  stats.recentTransactions
                    .filter(block => block.blockNumber > 0 && block.data?.propertyId)
                    .slice(0, 8)
                    .map(block => {
                      const eventColors: Record<string, string> = {
                        REGISTRATION: '#1B4F8A',
                        SALE: '#16A34A',
                        MUTATION: '#D97706',
                        INHERITANCE: '#7C3AED',
                        LIEN: '#EA580C',
                        COURT_FREEZE: '#DC2626'
                      }
                      const color = eventColors[block.data?.eventType || ''] || '#64748B'
                      return (
                        <div key={block.blockNumber} style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          padding: '10px 0',
                          borderBottom: '1px solid #F1F5F9'
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
                            <span style={{
                              background: color,
                              color: 'white',
                              padding: '2px 8px',
                              borderRadius: '4px',
                              fontSize: '10px',
                              fontWeight: 600,
                              whiteSpace: 'nowrap',
                              flexShrink: 0
                            }}>
                              {block.data?.eventType || 'ENTRY'}
                            </span>
                            <span style={{
                              fontFamily: 'monospace',
                              fontSize: '12px',
                              color: '#0F172A',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap'
                            }}>
                              {block.data?.propertyId || '-'}
                            </span>
                          </div>
                          <div style={{ textAlign: 'right', flexShrink: 0, marginLeft: '8px' }}>
                            <div style={{ fontSize: '11px', color: '#64748B' }}>{block.data?.city || ''}</div>
                            <div style={{ fontSize: '11px', color: '#94A3B8' }}>
                              {new Date(block.timestamp).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                            </div>
                          </div>
                        </div>
                      )
                    })
                ) : (
                  <p style={{ color: '#94A3B8', textAlign: 'center', padding: '20px', fontSize: '14px' }}>
                    No recent transactions
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="card">
            <h3 className="section-title">Regional Node Status</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '16px' }}>
              {Object.entries(stats.cityNodeStatus || {}).map(([city]) => (
                <div key={city} style={{ 
                  backgroundColor: '#F8FAFC', 
                  padding: '12px', 
                  borderRadius: '8px', 
                  border: '1px solid #E2E8F0',
                  textAlign: 'center'
                }}>
                  <p style={{ fontSize: '13px', fontWeight: 500, marginBottom: '8px' }}>{city}</p>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                    <span style={{ width: '8px', height: '8px', background: '#16A34A', borderRadius: '50%' }}></span>
                    <span style={{ fontSize: '10px', fontWeight: 700, color: '#16A34A' }}>ONLINE</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
