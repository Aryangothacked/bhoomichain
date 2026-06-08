import { useState, useEffect } from 'react'
import { Settings } from 'lucide-react'

interface HeaderProps {
  title: string;
  onHamburgerClick?: () => void;
}

export default function Header({ title, onHamburgerClick }: HeaderProps) {
  const [showSettings, setShowSettings] = useState(false)
  const [, setTime] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  return (
    <>
      <header style={{
        height: '60px',
        background: 'white',
        borderBottom: '1px solid #E2E8F0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 24px',
        position: 'sticky',
        top: 0,
        zIndex: 100
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {onHamburgerClick && (
            <button className="hamburger-btn" onClick={onHamburgerClick}>
              <span />
              <span />
              <span />
            </button>
          )}
          <h1 style={{ fontSize: '18px', fontWeight: 500, color: '#0F172A' }}>{title}</h1>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <span className="header-time" style={{ fontSize: '14px', color: '#64748B' }}>
            {new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })} IST
          </span>
          <span className="bhc-version-badge" style={{ fontSize: '13px', fontWeight: 500, color: '#1B4F8A', background: '#EFF6FF', padding: '4px 10px', borderRadius: '6px' }}>
            BhoomiChain v1.0
          </span>
          <button
            onClick={() => setShowSettings(true)}
            style={{
              background: 'none',
              border: '1px solid #E2E8F0',
              borderRadius: '8px',
              padding: '6px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#64748B'
            }}
          >
            <Settings size={18} />
          </button>
        </div>
      </header>

      {showSettings && (
        <>
          <div
            onClick={() => setShowSettings(false)}
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0,0,0,0.4)',
              zIndex: 998
            }}
          />
          <div style={{
            position: 'fixed',
            top: 0,
            right: 0,
            width: '360px',
            height: '100vh',
            background: 'white',
            zIndex: 999,
            boxShadow: '-4px 0 24px rgba(0,0,0,0.15)',
            display: 'flex',
            flexDirection: 'column'
          }}>
            <div style={{
              padding: '20px 24px',
              borderBottom: '1px solid #E2E8F0',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <h2 style={{ fontSize: '18px', fontWeight: 600, color: '#0F172A' }}>Settings</h2>
              <button
                onClick={() => setShowSettings(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '18px',
                  color: '#64748B',
                  lineHeight: 1
                }}
              >✕</button>
            </div>

            <div style={{ padding: '24px', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '28px' }}>

              <div>
                <p style={{ fontSize: '11px', fontWeight: 600, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '12px' }}>API Configuration</p>
                <label style={{ fontSize: '13px', fontWeight: 500, color: '#374151', display: 'block', marginBottom: '6px' }}>Groq API Key</label>
                <input
                  id="groq-key-input"
                  type="password"
                  placeholder="gsk_..."
                  defaultValue={localStorage.getItem('groq_api_key') || ''}
                  style={{ width: '100%', height: '40px', border: '1px solid #D1D5DB', borderRadius: '8px', padding: '0 12px', fontSize: '14px', marginBottom: '6px' }}
                />
                <p style={{ fontSize: '12px', color: '#94A3B8', marginBottom: '10px' }}>Get your free key at console.groq.com</p>
                <button
                  onClick={() => {
                    const val = (document.getElementById('groq-key-input') as HTMLInputElement).value
                    localStorage.setItem('groq_api_key', val)
                    alert('API key saved!')
                  }}
                  style={{ background: '#1B4F8A', color: 'white', border: 'none', borderRadius: '8px', padding: '8px 20px', fontSize: '14px', cursor: 'pointer' }}
                >Save Key</button>
              </div>

              <div>
                <p style={{ fontSize: '11px', fontWeight: 600, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '12px' }}>Blockchain</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <button
                    onClick={() => {
                      if (window.confirm('Reset all demo data? This cannot be undone.')) {
                        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001'
                        fetch(`${apiUrl}/api/reset-demo`, { method: 'POST' })
                          .then(() => window.location.reload())
                          .catch(() => alert('Reset failed. Check backend.'))
                      }
                    }}
                    style={{ background: 'none', border: '1px solid #DC2626', color: '#DC2626', borderRadius: '8px', padding: '10px 16px', fontSize: '14px', cursor: 'pointer', textAlign: 'left' }}
                  >🔄  Reset Demo Data</button>
                  <button
                    onClick={async () => {
                      try {
                        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001'
                        const response = await fetch(`${apiUrl}/api/ledger?export=true`)
                        const data = await response.json()
                        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
                        const url = URL.createObjectURL(blob)
                        const a = document.createElement('a')
                        a.href = url
                        a.download = `BhoomiChain_Ledger_${new Date().toISOString().split('T')[0]}.json`
                        document.body.appendChild(a)
                        a.click()
                        document.body.removeChild(a)
                        URL.revokeObjectURL(url)
                      } catch (err) {
                        alert('Export failed. Make sure backend is running.')
                      }
                    }}
                    style={{ background: 'none', border: '1px solid #1B4F8A', color: '#1B4F8A', borderRadius: '8px', padding: '10px 16px', fontSize: '14px', cursor: 'pointer', textAlign: 'left' }}
                  >⬇️  Export Full Ledger (JSON)</button>
                </div>
              </div>

              <div>
                <p style={{ fontSize: '11px', fontWeight: 600, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '12px' }}>About</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
                    <span style={{ color: '#64748B' }}>Version</span>
                    <span style={{ fontWeight: 500 }}>v1.0.0</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
                    <span style={{ color: '#64748B' }}>Network</span>
                    <span style={{ fontWeight: 500, color: '#16A34A' }}>● BC-MAINNET</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
                    <span style={{ color: '#64748B' }}>Mode</span>
                    <span style={{ fontWeight: 500 }}>Simulated Demo</span>
                  </div>
                </div>
                <p style={{ fontSize: '12px', color: '#94A3B8', marginTop: '16px', lineHeight: 1.6 }}>
                  Built for transparency in Indian land registry. Simulated demo — not connected to any real government system.
                </p>
              </div>

            </div>
          </div>
        </>
      )}
    </>
  )
}
