import { useState } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area } from 'recharts'

const CIRCLE_RATES_HISTORY: Record<string, { year: string; rate: number; growth: number }[]> = {
  Mumbai: [
    { year: '2018', rate: 12000, growth: 0 },
    { year: '2019', rate: 13500, growth: 12.5 },
    { year: '2020', rate: 13200, growth: -2.2 },
    { year: '2021', rate: 14800, growth: 12.1 },
    { year: '2022', rate: 16200, growth: 9.5 },
    { year: '2023', rate: 17100, growth: 5.6 },
    { year: '2024', rate: 18000, growth: 5.3 },
  ],
  Delhi: [
    { year: '2018', rate: 8000, growth: 0 },
    { year: '2019', rate: 8800, growth: 10.0 },
    { year: '2020', rate: 8600, growth: -2.3 },
    { year: '2021', rate: 9500, growth: 10.5 },
    { year: '2022', rate: 10500, growth: 10.5 },
    { year: '2023', rate: 11200, growth: 6.7 },
    { year: '2024', rate: 12000, growth: 7.1 },
  ],
  Bengaluru: [
    { year: '2018', rate: 6000, growth: 0 },
    { year: '2019', rate: 6800, growth: 13.3 },
    { year: '2020', rate: 6500, growth: -4.4 },
    { year: '2021', rate: 7200, growth: 10.8 },
    { year: '2022', rate: 8100, growth: 12.5 },
    { year: '2023', rate: 8900, growth: 9.9 },
    { year: '2024', rate: 9500, growth: 6.7 },
  ],
  Hyderabad: [
    { year: '2018', rate: 4500, growth: 0 },
    { year: '2019', rate: 5100, growth: 13.3 },
    { year: '2020', rate: 5000, growth: -2.0 },
    { year: '2021', rate: 5600, growth: 12.0 },
    { year: '2022', rate: 6200, growth: 10.7 },
    { year: '2023', rate: 6800, growth: 9.7 },
    { year: '2024', rate: 7200, growth: 5.9 },
  ],
  Pune: [
    { year: '2018', rate: 5200, growth: 0 },
    { year: '2019', rate: 5800, growth: 11.5 },
    { year: '2020', rate: 5600, growth: -3.4 },
    { year: '2021', rate: 6400, growth: 14.3 },
    { year: '2022', rate: 7000, growth: 9.4 },
    { year: '2023', rate: 7600, growth: 8.6 },
    { year: '2024', rate: 8000, growth: 5.3 },
  ],
  Ahmedabad: [
    { year: '2018', rate: 2800, growth: 0 },
    { year: '2019', rate: 3100, growth: 10.7 },
    { year: '2020', rate: 3000, growth: -3.2 },
    { year: '2021', rate: 3400, growth: 13.3 },
    { year: '2022', rate: 3800, growth: 11.8 },
    { year: '2023', rate: 4200, growth: 10.5 },
    { year: '2024', rate: 4500, growth: 7.1 },
  ],
  Chennai: [
    { year: '2018', rate: 4200, growth: 0 },
    { year: '2019', rate: 4700, growth: 11.9 },
    { year: '2020', rate: 4500, growth: -4.3 },
    { year: '2021', rate: 5000, growth: 11.1 },
    { year: '2022', rate: 5600, growth: 12.0 },
    { year: '2023', rate: 6100, growth: 8.9 },
    { year: '2024', rate: 6500, growth: 6.6 },
  ],
  Kolkata: [
    { year: '2018', rate: 3200, growth: 0 },
    { year: '2019', rate: 3600, growth: 12.5 },
    { year: '2020', rate: 3400, growth: -5.6 },
    { year: '2021', rate: 3800, growth: 11.8 },
    { year: '2022', rate: 4200, growth: 10.5 },
    { year: '2023', rate: 4700, growth: 11.9 },
    { year: '2024', rate: 5000, growth: 6.4 },
  ],
}

const CITY_COLORS: Record<string, string> = {
  Mumbai: '#1B4F8A', Delhi: '#DC2626', Bengaluru: '#16A34A',
  Hyderabad: '#D97706', Pune: '#7C3AED', Ahmedabad: '#0891B2',
  Chennai: '#DB2777', Kolkata: '#65A30D'
}

export default function PriceTrends() {
  const [selectedCities, setSelectedCities] = useState(['Mumbai', 'Delhi', 'Bengaluru'])
  const [chartType, setChartType] = useState<'rate' | 'growth'>('rate')

  const toggleCity = (city: string) => {
    setSelectedCities(prev =>
      prev.includes(city)
        ? prev.filter(c => c !== city)
        : prev.length < 4 ? [...prev, city] : prev
    )
  }

  const chartData = CIRCLE_RATES_HISTORY[selectedCities[0]]?.map((_, i) => {
    const point: any = { year: CIRCLE_RATES_HISTORY[selectedCities[0]][i].year }
    selectedCities.forEach(city => {
      point[city] = chartType === 'rate'
        ? CIRCLE_RATES_HISTORY[city]?.[i]?.rate
        : CIRCLE_RATES_HISTORY[city]?.[i]?.growth
    })
    return point
  }) || []

  const currentRates = Object.entries(CIRCLE_RATES_HISTORY).map(([city, data]) => ({
    city,
    currentRate: data[data.length - 1].rate,
    growth2024: data[data.length - 1].growth,
    totalGrowth: ((data[data.length - 1].rate - data[0].rate) / data[0].rate * 100).toFixed(1)
  })).sort((a, b) => b.currentRate - a.currentRate)

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '22px', fontWeight: 700, color: '#0F172A', marginBottom: '4px' }}>Property Price Trends</h1>
        <p style={{ color: '#64748B', fontSize: '14px' }}>Circle rate history and growth across major Indian cities (2018–2024)</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '24px' }}>
        {currentRates.slice(0, 4).map(item => (
          <div key={item.city} style={{ background: 'white', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '16px' }}>
            <div style={{ fontSize: '13px', color: '#64748B', marginBottom: '4px' }}>{item.city}</div>
            <div style={{ fontSize: '20px', fontWeight: 700, color: '#0F172A', marginBottom: '4px' }}>₹{item.currentRate.toLocaleString('en-IN')}/sqft</div>
            <div style={{ fontSize: '12px', color: parseFloat(item.growth2024.toString()) > 0 ? '#16A34A' : '#DC2626', fontWeight: 500 }}>
              {item.growth2024 > 0 ? '↑' : '↓'} {item.growth2024}% in 2024
            </div>
            <div style={{ fontSize: '11px', color: '#94A3B8', marginTop: '2px' }}>+{item.totalGrowth}% since 2018</div>
          </div>
        ))}
      </div>

      <div style={{ background: 'white', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '24px', marginBottom: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#0F172A' }}>Circle Rate Trend Chart</h3>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button onClick={() => setChartType('rate')} style={{ padding: '6px 16px', borderRadius: '6px', border: '1px solid #E2E8F0', background: chartType === 'rate' ? '#1B4F8A' : 'white', color: chartType === 'rate' ? 'white' : '#374151', fontSize: '13px', cursor: 'pointer' }}>Rate (₹/sqft)</button>
            <button onClick={() => setChartType('growth')} style={{ padding: '6px 16px', borderRadius: '6px', border: '1px solid #E2E8F0', background: chartType === 'growth' ? '#1B4F8A' : 'white', color: chartType === 'growth' ? 'white' : '#374151', fontSize: '13px', cursor: 'pointer' }}>YoY Growth (%)</button>
          </div>
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '20px' }}>
          {Object.keys(CIRCLE_RATES_HISTORY).map(city => (
            <button key={city} onClick={() => toggleCity(city)} style={{ padding: '4px 12px', borderRadius: '20px', border: `2px solid ${CITY_COLORS[city]}`, background: selectedCities.includes(city) ? CITY_COLORS[city] : 'white', color: selectedCities.includes(city) ? 'white' : CITY_COLORS[city], fontSize: '12px', cursor: 'pointer', fontWeight: 500, opacity: !selectedCities.includes(city) && selectedCities.length >= 4 ? 0.5 : 1 }}>
              {city}
            </button>
          ))}
          <span style={{ fontSize: '11px', color: '#94A3B8', alignSelf: 'center' }}>Max 4 cities</span>
        </div>

        <ResponsiveContainer width="100%" height={320}>
          <AreaChart data={chartData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
            <defs>
              {selectedCities.map(city => (
                <linearGradient key={city} id={`grad-${city}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={CITY_COLORS[city]} stopOpacity={0.15}/>
                  <stop offset="95%" stopColor={CITY_COLORS[city]} stopOpacity={0}/>
                </linearGradient>
              ))}
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
            <XAxis dataKey="year" tick={{ fontSize: 12, fill: '#64748B' }} />
            <YAxis tick={{ fontSize: 11, fill: '#64748B' }} tickFormatter={v => chartType === 'rate' ? '₹' + (v/1000).toFixed(0) + 'k' : v + '%'} />
            <Tooltip formatter={(value: any, name: string) => [chartType === 'rate' ? '₹' + Number(value).toLocaleString('en-IN') + '/sqft' : value + '%', name]} />
            <Legend />
            {selectedCities.map(city => (
              <Area key={city} type="monotone" dataKey={city} stroke={CITY_COLORS[city]} strokeWidth={2.5} fill={`url(#grad-${city})`} dot={{ r: 4, fill: CITY_COLORS[city] }} activeDot={{ r: 6 }} />
            ))}
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div style={{ background: 'white', border: '1px solid #E2E8F0', borderRadius: '12px', overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #E2E8F0' }}>
          <h3 style={{ fontSize: '15px', fontWeight: 600, color: '#0F172A' }}>All Cities — Current Circle Rates</h3>
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#F8FAFC' }}>
              {['City', 'Circle Rate (₹/sqft)', '2024 Growth', 'Since 2018', 'Trend'].map(h => (
                <th key={h} style={{ padding: '12px 16px', fontSize: '12px', fontWeight: 600, color: '#64748B', textAlign: 'left', borderBottom: '1px solid #E2E8F0' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {currentRates.map((item, i) => (
              <tr key={item.city} style={{ background: i % 2 === 0 ? 'white' : '#F8FAFC' }}>
                <td style={{ padding: '12px 16px', fontSize: '14px', fontWeight: 500, color: '#0F172A' }}>
                  <span style={{ display: 'inline-block', width: '10px', height: '10px', borderRadius: '50%', background: CITY_COLORS[item.city], marginRight: '8px' }}></span>
                  {item.city}
                </td>
                <td style={{ padding: '12px 16px', fontSize: '14px', fontFamily: 'monospace', fontWeight: 600 }}>₹{item.currentRate.toLocaleString('en-IN')}</td>
                <td style={{ padding: '12px 16px', fontSize: '13px', color: item.growth2024 > 0 ? '#16A34A' : '#DC2626', fontWeight: 500 }}>
                  {item.growth2024 > 0 ? '↑' : '↓'} {item.growth2024}%
                </td>
                <td style={{ padding: '12px 16px', fontSize: '13px', color: '#16A34A', fontWeight: 500 }}>+{item.totalGrowth}%</td>
                <td style={{ padding: '12px 16px' }}>
                  <div style={{ width: '80px', height: '24px' }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={CIRCLE_RATES_HISTORY[item.city]}>
                        <Line type="monotone" dataKey="rate" stroke={CITY_COLORS[item.city]} strokeWidth={2} dot={false} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
