import { useState } from 'react'

const CIRCLE_RATES: Record<string, number> = {
  Mumbai: 18000, Delhi: 12000, Bengaluru: 9500, Hyderabad: 7200,
  Pune: 8000, Chennai: 6500, Ahmedabad: 4500, Kolkata: 5000,
  Jaipur: 3800, Surat: 3500
}

export default function Calculator() {
  const [city, setCity] = useState('')
  const [area, setArea] = useState('')
  const [declaredValue, setDeclaredValue] = useState('')
  const [propertyType, setPropertyType] = useState('residential')
  const [gender, setGender] = useState('male')
  const [result, setResult] = useState<any>(null)

  const calculate = () => {
    if (!city || !area || !declaredValue) return

    const circleRate = CIRCLE_RATES[city]
    const areaNum = parseFloat(area)
    const declaredNum = parseFloat(declaredValue)
    const minimumValue = circleRate * areaNum
    const assessableValue = Math.max(minimumValue, declaredNum)
    const isBelowCircleRate = declaredNum < minimumValue

    // Stamp duty rates vary by state and gender
    let stampDutyRate = 0.05
    if (city === 'Mumbai') stampDutyRate = gender === 'female' ? 0.05 : 0.06
    if (city === 'Delhi') stampDutyRate = gender === 'female' ? 0.04 : 0.06
    if (city === 'Bengaluru') stampDutyRate = 0.056
    if (city === 'Hyderabad') stampDutyRate = 0.06
    if (city === 'Kolkata') stampDutyRate = 0.06

    const stampDuty = assessableValue * stampDutyRate
    const registrationFee = assessableValue * 0.01
    const metroSurcharge = city === 'Mumbai' ? assessableValue * 0.01 : 0
    const totalPayable = stampDuty + registrationFee + metroSurcharge

    setResult({
      city, area: areaNum, declaredValue: declaredNum,
      circleRate, minimumValue, assessableValue,
      isBelowCircleRate, stampDutyRate,
      stampDuty, registrationFee, metroSurcharge, totalPayable
    })
  }

  const fmt = (n: number) => '₹' + Math.round(n).toLocaleString('en-IN')
  const fmtCr = (n: number) => n >= 10000000 ? '₹' + (n/10000000).toFixed(2) + ' Cr' : n >= 100000 ? '₹' + (n/100000).toFixed(2) + ' L' : fmt(n)

  return (
    <div style={{ padding: '24px', maxWidth: '800px' }}>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '22px', fontWeight: 700, color: '#0F172A', marginBottom: '4px' }}>Stamp Duty Calculator</h1>
        <p style={{ color: '#64748B', fontSize: '14px' }}>Estimate stamp duty, registration fee and total payable for any property in India</p>
      </div>

      <div style={{ background: 'white', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '24px', marginBottom: '20px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>

          <div>
            <label style={{ fontSize: '13px', fontWeight: 500, color: '#374151', display: 'block', marginBottom: '6px' }}>City</label>
            <select value={city} onChange={e => setCity(e.target.value)} style={{ width: '100%', height: '42px', border: '1px solid #D1D5DB', borderRadius: '8px', padding: '0 12px', fontSize: '14px' }}>
              <option value="">Select City</option>
              {Object.keys(CIRCLE_RATES).map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div>
            <label style={{ fontSize: '13px', fontWeight: 500, color: '#374151', display: 'block', marginBottom: '6px' }}>Property Type</label>
            <select value={propertyType} onChange={e => setPropertyType(e.target.value)} style={{ width: '100%', height: '42px', border: '1px solid #D1D5DB', borderRadius: '8px', padding: '0 12px', fontSize: '14px' }}>
              <option value="residential">Residential</option>
              <option value="commercial">Commercial</option>
              <option value="agricultural">Agricultural</option>
            </select>
          </div>

          <div>
            <label style={{ fontSize: '13px', fontWeight: 500, color: '#374151', display: 'block', marginBottom: '6px' }}>Area (sq ft)</label>
            <input type="number" value={area} onChange={e => setArea(e.target.value)} placeholder="e.g. 1200" style={{ width: '100%', height: '42px', border: '1px solid #D1D5DB', borderRadius: '8px', padding: '0 12px', fontSize: '14px' }} />
          </div>

          <div>
            <label style={{ fontSize: '13px', fontWeight: 500, color: '#374151', display: 'block', marginBottom: '6px' }}>Declared Value (₹)</label>
            <input type="number" value={declaredValue} onChange={e => setDeclaredValue(e.target.value)} placeholder="e.g. 10000000" style={{ width: '100%', height: '42px', border: '1px solid #D1D5DB', borderRadius: '8px', padding: '0 12px', fontSize: '14px' }} />
            {city && area && (
              <p style={{ fontSize: '11px', color: '#64748B', marginTop: '4px' }}>
                Circle rate minimum: {fmt(CIRCLE_RATES[city] * parseFloat(area || '0'))}
              </p>
            )}
          </div>

          <div>
            <label style={{ fontSize: '13px', fontWeight: 500, color: '#374151', display: 'block', marginBottom: '6px' }}>Buyer Gender</label>
            <select value={gender} onChange={e => setGender(e.target.value)} style={{ width: '100%', height: '42px', border: '1px solid #D1D5DB', borderRadius: '8px', padding: '0 12px', fontSize: '14px' }}>
              <option value="male">Male</option>
              <option value="female">Female (lower stamp duty in some states)</option>
              <option value="joint">Joint</option>
            </select>
          </div>

          <div style={{ display: 'flex', alignItems: 'flex-end' }}>
            <button onClick={calculate} style={{ width: '100%', height: '42px', background: '#1B4F8A', color: 'white', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: 500, cursor: 'pointer' }}>
              Calculate
            </button>
          </div>
        </div>
      </div>

      {result && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

          {result.isBelowCircleRate && (
            <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '12px', padding: '16px', display: 'flex', gap: '12px', alignItems: 'center' }}>
              <span style={{ fontSize: '24px' }}>⚠️</span>
              <div>
                <p style={{ fontWeight: 600, color: '#DC2626', marginBottom: '2px' }}>Below Circle Rate!</p>
                <p style={{ fontSize: '13px', color: '#64748B' }}>Declared value {fmtCr(result.declaredValue)} is below minimum {fmtCr(result.minimumValue)}. Registration will be calculated on circle rate value.</p>
              </div>
            </div>
          )}

          <div style={{ background: 'white', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '24px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '16px', color: '#0F172A' }}>Calculation Breakdown</h3>
            
            {[
              { label: 'Property Area', value: result.area.toLocaleString('en-IN') + ' sq ft' },
              { label: 'Circle Rate', value: fmt(result.circleRate) + '/sqft' },
              { label: 'Minimum Value (Circle Rate)', value: fmtCr(result.minimumValue), highlight: result.isBelowCircleRate },
              { label: 'Declared Value', value: fmtCr(result.declaredValue) },
              { label: 'Assessable Value (higher of above)', value: fmtCr(result.assessableValue), bold: true },
              { label: `Stamp Duty (${(result.stampDutyRate * 100).toFixed(1)}%)`, value: fmtCr(result.stampDuty) },
              { label: 'Registration Fee (1%)', value: fmtCr(result.registrationFee) },
              ...(result.metroSurcharge > 0 ? [{ label: 'Metro Surcharge (1% - Mumbai)', value: fmtCr(result.metroSurcharge) }] : []),
            ].map((row, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #F1F5F9' }}>
                <span style={{ fontSize: '14px', color: row.highlight ? '#DC2626' : '#64748B' }}>{row.label}</span>
                <span style={{ fontSize: '14px', fontWeight: row.bold ? 700 : 500, color: '#0F172A' }}>{row.value}</span>
              </div>
            ))}

            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '16px', background: '#EFF6FF', borderRadius: '8px', marginTop: '12px' }}>
              <span style={{ fontSize: '16px', fontWeight: 700, color: '#1B4F8A' }}>Total Payable</span>
              <span style={{ fontSize: '20px', fontWeight: 700, color: '#1B4F8A' }}>{fmtCr(result.totalPayable)}</span>
            </div>
          </div>

          <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '16px' }}>
            <p style={{ fontSize: '12px', color: '#94A3B8', lineHeight: 1.6 }}>
              ⚠️ This is an estimate only. Actual stamp duty may vary based on state government rates, property location, and other factors. Consult a legal expert for accurate calculations.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
