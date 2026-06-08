import { useState, useEffect } from 'react'
import axios from 'axios'
import { API_BASE_URL } from '../api/client'

export default function ReitPortal() {
  const [properties, setProperties] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [city, setCity] = useState('')
  const [propertyType, setPropertyType] = useState('')
  const [minArea, setMinArea] = useState('')
  const [ddLoading, setDdLoading] = useState<string | null>(null)
  const [ddReports, setDdReports] = useState<Record<string, string>>({})

  useEffect(() => {
    fetchProperties()
  }, [])

  const fetchProperties = async () => {
    try {
      setLoading(true)
      setError(null)
      const params = new URLSearchParams()
      if (city && city !== 'All Cities') params.append('city', city)
      if (propertyType && propertyType !== 'All Types') params.append('type', propertyType)
      if (minArea) params.append('minArea', minArea)

      const res = await axios.get(`${API_BASE_URL}/api/reit/properties?${params.toString()}`, { timeout: 15000 })
      const data = res.data
      const props = data.properties || data || []
      setProperties(Array.isArray(props) ? props : [])
    } catch (err: any) {
      setError(err.message || 'Failed to load properties')
      setProperties([])
    } finally {
      setLoading(false)
    }
  }

  const generateDD = async (propertyId: string) => {
    try {
      setDdLoading(propertyId)
      const res = await axios.post(`${API_BASE_URL}/api/reit/due-diligence`, { propertyId }, { timeout: 30000 })
      const report = res.data.report || JSON.stringify(res.data, null, 2)
      setDdReports(prev => ({ ...prev, [propertyId]: typeof report === 'string' ? report : JSON.stringify(report, null, 2) }))
    } catch (err: any) {
      setDdReports(prev => ({ ...prev, [propertyId]: 'Failed to generate report: ' + err.message }))
    } finally {
      setDdLoading(null)
    }
  }

  const statusColor: Record<string, { bg: string; text: string }> = {
    CLEAR: { bg: '#DCFCE7', text: '#16A34A' },
    DISPUTED: { bg: '#FEF9C3', text: '#D97706' },
    UNDER_LIEN: { bg: '#DBEAFE', text: '#2563EB' },
    COURT_FREEZE: { bg: '#FEE2E2', text: '#DC2626' },
    FROZEN: { bg: '#FEE2E2', text: '#DC2626' },
  }

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '22px', fontWeight: 700, color: '#0F172A', marginBottom: '4px' }}>REIT & Investor Portal</h1>
        <p style={{ color: '#64748B', fontSize: '14px' }}>Browse blockchain-verified properties available for investment</p>
      </div>

      <div style={{ background: 'white', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '20px', marginBottom: '24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr auto', gap: '12px', alignItems: 'end' }}>
          <div>
            <label style={{ fontSize: '13px', fontWeight: 500, color: '#374151', display: 'block', marginBottom: '6px' }}>City</label>
            <select value={city} onChange={e => setCity(e.target.value)} style={{ width: '100%', height: '40px', border: '1px solid #D1D5DB', borderRadius: '8px', padding: '0 12px', fontSize: '14px' }}>
              <option value="">All Cities</option>
              {['Mumbai','Delhi','Bengaluru','Hyderabad','Pune','Chennai','Ahmedabad','Kolkata','Jaipur','Surat'].map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label style={{ fontSize: '13px', fontWeight: 500, color: '#374151', display: 'block', marginBottom: '6px' }}>Property Type</label>
            <select value={propertyType} onChange={e => setPropertyType(e.target.value)} style={{ width: '100%', height: '40px', border: '1px solid #D1D5DB', borderRadius: '8px', padding: '0 12px', fontSize: '14px' }}>
              <option value="">All Types</option>
              <option value="residential">Residential</option>
              <option value="commercial">Commercial</option>
              <option value="agricultural">Agricultural</option>
            </select>
          </div>
          <div>
            <label style={{ fontSize: '13px', fontWeight: 500, color: '#374151', display: 'block', marginBottom: '6px' }}>Minimum Area (sq ft)</label>
            <input value={minArea} onChange={e => setMinArea(e.target.value)} placeholder="e.g. 1000" type="number" style={{ width: '100%', height: '40px', border: '1px solid #D1D5DB', borderRadius: '8px', padding: '0 12px', fontSize: '14px' }} />
          </div>
          <button onClick={fetchProperties} style={{ height: '40px', padding: '0 24px', background: '#1B4F8A', color: 'white', border: 'none', borderRadius: '8px', fontSize: '14px', cursor: 'pointer', fontWeight: 500 }}>
            Search
          </button>
        </div>
      </div>

      {loading && (
        <div style={{ textAlign: 'center', padding: '60px' }}>
          <div style={{ fontSize: '32px', marginBottom: '12px' }}>⏳</div>
          <p style={{ color: '#64748B' }}>Loading verified properties...</p>
        </div>
      )}

      {error && !loading && (
        <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '12px', padding: '24px', textAlign: 'center' }}>
          <div style={{ fontSize: '32px', marginBottom: '8px' }}>⚠️</div>
          <p style={{ color: '#DC2626', marginBottom: '12px' }}>{error}</p>
          <button onClick={fetchProperties} style={{ background: '#1B4F8A', color: 'white', border: 'none', borderRadius: '8px', padding: '10px 24px', cursor: 'pointer' }}>Retry</button>
        </div>
      )}

      {!loading && !error && properties.length === 0 && (
        <div style={{ textAlign: 'center', padding: '60px' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>🏘️</div>
          <h3 style={{ color: '#374151', marginBottom: '8px' }}>No properties found</h3>
          <p style={{ color: '#94A3B8' }}>Try different filters or register new properties first.</p>
        </div>
      )}

      {!loading && !error && properties.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
          {properties.map((prop: any, index: number) => {
            const d = prop.data || prop
            const pid = d.propertyId || 'Unknown'
            const sc = statusColor[d.status] || { bg: '#F1F5F9', text: '#64748B' }

            return (
              <div key={pid + index} style={{ background: 'white', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                  <div>
                    <div style={{ fontFamily: 'monospace', fontSize: '13px', fontWeight: 700, color: '#1B4F8A', marginBottom: '4px' }}>{pid}</div>
                    <div style={{ fontSize: '16px', fontWeight: 600, color: '#0F172A' }}>{d.ownerName || 'Unknown'}</div>
                  </div>
                  <span style={{ background: '#DCFCE7', color: '#16A34A', padding: '4px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 600, whiteSpace: 'nowrap' }}>✓ Verified</span>
                </div>

                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '12px' }}>
                  <span style={{ background: '#F1F5F9', color: '#475569', padding: '2px 8px', borderRadius: '4px', fontSize: '12px' }}>{d.city}</span>
                  <span style={{ background: '#F1F5F9', color: '#475569', padding: '2px 8px', borderRadius: '4px', fontSize: '12px', textTransform: 'capitalize' }}>{d.propertyType}</span>
                  <span style={{ background: sc.bg, color: sc.text, padding: '2px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 600 }}>{d.status}</span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '16px' }}>
                  {[
                    { label: 'Area', value: Number(d.area || 0).toLocaleString('en-IN') + ' sqft' },
                    { label: 'Value', value: '₹' + (Number(d.declaredValue || 0) / 10000000).toFixed(2) + ' Cr' },
                    { label: 'Chain Length', value: (prop.historyLength || 1) + ' blocks' },
                    { label: 'Circle Rate', value: '₹' + Number(d.circleRate || 0).toLocaleString('en-IN') + '/sqft' },
                  ].map(item => (
                    <div key={item.label} style={{ background: '#F8FAFC', borderRadius: '8px', padding: '10px' }}>
                      <div style={{ fontSize: '11px', color: '#94A3B8', marginBottom: '2px' }}>{item.label}</div>
                      <div style={{ fontSize: '13px', fontWeight: 600, color: '#0F172A' }}>{item.value}</div>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => generateDD(pid)}
                  disabled={ddLoading === pid}
                  style={{ width: '100%', background: ddLoading === pid ? '#94A3B8' : '#1B4F8A', color: 'white', border: 'none', borderRadius: '8px', padding: '10px', fontSize: '13px', cursor: ddLoading === pid ? 'not-allowed' : 'pointer', fontWeight: 500, marginBottom: ddReports[pid] ? '12px' : '0' }}
                >
                  {ddLoading === pid ? 'Generating Report...' : 'Generate Due Diligence Report'}
                </button>

                {ddReports[pid] && (
                  <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '8px', padding: '14px', marginTop: '12px' }}>
                    <div style={{ fontSize: '12px', fontWeight: 600, color: '#374151', marginBottom: '8px' }}>Due Diligence Report</div>
                    <pre style={{ fontSize: '11px', color: '#475569', whiteSpace: 'pre-wrap', wordBreak: 'break-word', fontFamily: 'monospace', margin: 0 }}>{ddReports[pid]}</pre>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
