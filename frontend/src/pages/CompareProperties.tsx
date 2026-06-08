import { useState } from 'react'
import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'

export default function CompareProperties() {
  const [searchInputs, setSearchInputs] = useState(['', '', ''])
  const [properties, setProperties] = useState<(any | null)[]>([null, null, null])
  const [loading, setLoading] = useState([false, false, false])
  const [errors, setErrors] = useState(['', '', ''])

  const searchProperty = async (index: number, query: string) => {
    if (!query.trim()) return
    const newLoading = [...loading]
    newLoading[index] = true
    setLoading(newLoading)

    try {
      const res = await axios.get(`${API_BASE_URL}/api/properties/search?q=${encodeURIComponent(query)}`, { timeout: 10000 })
      const results = res.data.properties || res.data || []
      if (results.length > 0) {
        const prop = results[0]
        const histRes = await axios.get(`${API_BASE_URL}/api/properties/${prop.data?.propertyId || prop.propertyId}`, { timeout: 10000 })
        const newProps = [...properties]
        newProps[index] = histRes.data
        setProperties(newProps)
        const newErrors = [...errors]
        newErrors[index] = ''
        setErrors(newErrors)
      } else {
        const newErrors = [...errors]
        newErrors[index] = 'Property not found'
        setErrors(newErrors)
      }
    } catch (err: any) {
      const newErrors = [...errors]
      newErrors[index] = 'Search failed: ' + err.message
      setErrors(newErrors)
    } finally {
      const newLoading = [...loading]
      newLoading[index] = false
      setLoading(newLoading)
    }
  }

  const clearProperty = (index: number) => {
    const newProps = [...properties]
    newProps[index] = null
    setProperties(newProps)
    const newInputs = [...searchInputs]
    newInputs[index] = ''
    setSearchInputs(newInputs)
  }

  const fmt = (n: number) => '₹' + Math.round(n || 0).toLocaleString('en-IN')
  const fmtCr = (n: number) => n >= 10000000 ? '₹' + (n/10000000).toFixed(2) + ' Cr' : fmt(n)

  const statusColor: Record<string, string> = {
    CLEAR: '#16A34A', DISPUTED: '#D97706', UNDER_LIEN: '#2563EB', COURT_FREEZE: '#DC2626'
  }

  const comparisonRows = [
    { label: 'Property ID', key: (p: any) => p?.data?.propertyId || '-', mono: true },
    { label: 'Owner', key: (p: any) => p?.data?.ownerName || '-' },
    { label: 'City', key: (p: any) => p?.data?.city || '-' },
    { label: 'Type', key: (p: any) => p?.data?.propertyType || '-' },
    { label: 'Status', key: (p: any) => p?.data?.status || '-', badge: true },
    { label: 'Area', key: (p: any) => p?.data?.area ? Number(p.data.area).toLocaleString('en-IN') + ' sqft' : '-' },
    { label: 'Circle Rate', key: (p: any) => p?.data?.circleRate ? fmt(p.data.circleRate) + '/sqft' : '-' },
    { label: 'Declared Value', key: (p: any) => p?.data?.declaredValue ? fmtCr(p.data.declaredValue) : '-', highlight: true },
    { label: 'Stamp Duty Paid', key: (p: any) => p?.data?.stampDuty ? fmtCr(p.data.stampDuty) : '-' },
    { label: 'Chain Length', key: (p: any) => p?.history?.length ? p.history.length + ' blocks' : '-' },
    { label: 'Registered On', key: (p: any) => p?.history?.[0]?.timestamp ? new Date(p.history[0].timestamp).toLocaleDateString('en-IN') : '-' },
    { label: 'Last Updated', key: (p: any) => p?.property?.timestamp ? new Date(p.property.timestamp).toLocaleDateString('en-IN') : '-' },
    { label: 'Survey Number', key: (p: any) => p?.data?.surveyNo || '-', mono: true },
    { label: 'GPS Location', key: (p: any) => p?.data?.gpsLat ? p.data.gpsLat + ', ' + p.data.gpsLng : '-', mono: true },
  ]

  const loadedCount = properties.filter(p => p !== null).length

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '22px', fontWeight: 700, color: '#0F172A', marginBottom: '4px' }}>Compare Properties</h1>
        <p style={{ color: '#64748B', fontSize: '14px' }}>Search and compare up to 3 properties side by side</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '24px' }}>
        {[0, 1, 2].map(i => (
          <div key={i} style={{ background: 'white', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '16px' }}>
            <div style={{ fontSize: '12px', fontWeight: 600, color: '#94A3B8', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Property {i + 1}</div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input
                value={searchInputs[i]}
                onChange={e => { const n = [...searchInputs]; n[i] = e.target.value; setSearchInputs(n) }}
                onKeyDown={e => e.key === 'Enter' && searchProperty(i, searchInputs[i])}
                placeholder="Property ID or owner name..."
                style={{ flex: 1, height: '38px', border: '1px solid #D1D5DB', borderRadius: '8px', padding: '0 10px', fontSize: '13px' }}
              />
              <button onClick={() => searchProperty(i, searchInputs[i])} disabled={loading[i]} style={{ height: '38px', padding: '0 14px', background: '#1B4F8A', color: 'white', border: 'none', borderRadius: '8px', fontSize: '13px', cursor: 'pointer' }}>
                {loading[i] ? '...' : 'Search'}
              </button>
            </div>
            {errors[i] && <p style={{ fontSize: '12px', color: '#DC2626', marginTop: '6px' }}>{errors[i]}</p>}
            {properties[i] && (
              <div style={{ marginTop: '10px', padding: '10px', background: '#F0FDF4', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '12px', color: '#16A34A', fontWeight: 500 }}>✓ {properties[i]?.data?.propertyId || properties[i]?.property?.data?.propertyId}</span>
                <button onClick={() => clearProperty(i)} style={{ background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer', fontSize: '16px' }}>×</button>
              </div>
            )}
          </div>
        ))}
      </div>

      {loadedCount >= 2 && (
        <div style={{ background: 'white', border: '1px solid #E2E8F0', borderRadius: '12px', overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid #E2E8F0', background: '#F8FAFC' }}>
            <h3 style={{ fontSize: '15px', fontWeight: 600, color: '#0F172A' }}>Side-by-Side Comparison</h3>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '600px' }}>
              <thead>
                <tr style={{ background: '#F8FAFC' }}>
                  <th style={{ padding: '12px 16px', fontSize: '12px', fontWeight: 600, color: '#64748B', textAlign: 'left', width: '160px', borderBottom: '1px solid #E2E8F0' }}>Field</th>
                  {properties.map((p, i) => p && (
                    <th key={i} style={{ padding: '12px 16px', fontSize: '12px', fontWeight: 600, color: '#1B4F8A', textAlign: 'left', borderBottom: '1px solid #E2E8F0' }}>
                      Property {i + 1}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {comparisonRows.map((row, ri) => {
                  const values = properties.map(p => p ? row.key(p.property || p) : null)
                  const allSame = values.filter(Boolean).every(v => v === values.find(Boolean))

                  return (
                    <tr key={ri} style={{ background: ri % 2 === 0 ? 'white' : '#F8FAFC', borderBottom: '1px solid #F1F5F9' }}>
                      <td style={{ padding: '11px 16px', fontSize: '13px', fontWeight: 500, color: '#64748B' }}>{row.label}</td>
                      {properties.map((p, i) => p && (
                        <td key={i} style={{ padding: '11px 16px', fontSize: '13px', background: row.highlight && !allSame ? '#FFFBEB' : 'transparent' }}>
                          {row.badge ? (
                            <span style={{ background: (statusColor[values[i] as string] || '#64748B') + '20', color: statusColor[values[i] as string] || '#64748B', padding: '2px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 600 }}>{values[i]}</span>
                          ) : (
                            <span style={{ fontFamily: row.mono ? 'monospace' : 'inherit', fontSize: row.mono ? '12px' : '13px', fontWeight: row.highlight ? 600 : 400, color: '#0F172A' }}>{values[i]}</span>
                          )}
                        </td>
                      ))}
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {loadedCount < 2 && (
        <div style={{ textAlign: 'center', padding: '60px', color: '#94A3B8' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>⚖️</div>
          <p style={{ fontSize: '16px', fontWeight: 500, marginBottom: '8px', color: '#64748B' }}>Search at least 2 properties to compare</p>
          <p style={{ fontSize: '13px' }}>Try: BHC-MUM-2024-00001 or BHC-DEL-2024-00002</p>
        </div>
      )}
    </div>
  )
}
