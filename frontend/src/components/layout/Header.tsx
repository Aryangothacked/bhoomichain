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
  <p style={{ fontSize: '11px', fontWeight: 600, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '12px' }}>
    📱 Alert Settings
  </p>

  <p style={{ fontSize: '12px', color: '#64748B', marginBottom: '16px', lineHeight: 1.6 }}>
    Get instant free alerts on WhatsApp and Telegram when properties are registered or fraud is detected.
  </p>

  <p style={{ fontSize: '12px', fontWeight: 600, color: '#374151', marginBottom: '8px' }}>WhatsApp (via CallMeBot — Free)</p>
  <input
    id="callmebot-phone"
    type="tel"
    placeholder="919876543210 (91 + number)"
    style={{ width: '100%', height: '40px', border: '1px solid #D1D5DB', borderRadius: '8px', padding: '0 12px', fontSize: '14px', marginBottom: '6px' }}
  />
  <input
    id="callmebot-key"
    type="text"
    placeholder="CallMeBot API Key"
    style={{ width: '100%', height: '40px', border: '1px solid #D1D5DB', borderRadius: '8px', padding: '0 12px', fontSize: '14px', marginBottom: '4px' }}
  />
  <p style={{ fontSize: '11px', color: '#94A3B8', marginBottom: '16px' }}>
    Setup: Send "I allow callmebot to send me messages" to +34 644 44 26 07 on WhatsApp → they reply with your API key
  </p>

  <p style={{ fontSize: '12px', fontWeight: 600, color: '#374151', marginBottom: '8px' }}>Telegram (Free, Unlimited)</p>
  <input
    id="telegram-token"
    type="text"
    placeholder="Telegram Bot Token"
    style={{ width: '100%', height: '40px', border: '1px solid #D1D5DB', borderRadius: '8px', padding: '0 12px', fontSize: '14px', marginBottom: '6px' }}
  />
  <input
    id="telegram-chat"
    type="text"
    placeholder="Telegram Chat ID"
    style={{ width: '100%', height: '40px', border: '1px solid #D1D5DB', borderRadius: '8px', padding: '0 12px', fontSize: '14px', marginBottom: '4px' }}
  />
  <p style={{ fontSize: '11px', color: '#94A3B8', marginBottom: '16px' }}>
    Setup: Message @BotFather on Telegram → /newbot → get token. Then message @userinfobot to get your Chat ID.
  </p>

  <div style={{ display: 'flex', gap: '8px' }}>
    <button
      onClick={() => {
        localStorage.setItem('callmebot_phone', (document.getElementById('callmebot-phone') as HTMLInputElement).value)
        localStorage.setItem('callmebot_key', (document.getElementById('callmebot-key') as HTMLInputElement).value)
        localStorage.setItem('telegram_token', (document.getElementById('telegram-token') as HTMLInputElement).value)
        localStorage.setItem('telegram_chat', (document.getElementById('telegram-chat') as HTMLInputElement).value)
        alert('Alert settings saved!')
      }}
      style={{ flex: 1, background: '#1B4F8A', color: 'white', border: 'none', borderRadius: '8px', padding: '10px', fontSize: '13px', cursor: 'pointer' }}
    >Save Settings</button>
    <button
      onClick={async () => {
        const res = await fetch('http://localhost:3001/api/test-alert', { method: 'POST' })
        const data = await res.json()
        alert(`Test Alert Sent!\n\nWhatsApp: ${data.result?.whatsapp?.success ? '✅ Delivered' : '❌ Failed — ' + (data.result?.whatsapp?.reason || data.result?.whatsapp?.error || 'Not configured')}\nTelegram: ${data.result?.telegram?.success ? '✅ Delivered' : '❌ Failed — ' + (data.result?.telegram?.reason || data.result?.telegram?.error || 'Not configured')}`)
      }}
      style={{ flex: 1, background: '#16A34A', color: 'white', border: 'none', borderRadius: '8px', padding: '10px', fontSize: '13px', cursor: 'pointer' }}
    >🔔 Test Alert</button>
  </div>
</div>

              <div>
                <p style={{ fontSize: '11px', fontWeight: 600, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '12px' }}>Blockchain</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <button
                    onClick={() => {
                      if (window.confirm('Reset all demo data? This cannot be undone.')) {
                        fetch('http://localhost:3001/api/reset-demo', { method: 'POST' })
                          .then(() => window.location.reload())
                          .catch(() => alert('Reset failed. Check backend.'))
                      }
                    }}
                    style={{ background: 'none', border: '1px solid #DC2626', color: '#DC2626', borderRadius: '8px', padding: '10px 16px', fontSize: '14px', cursor: 'pointer', textAlign: 'left' }}
                  >🔄  Reset Demo Data</button>
                  <button
                    onClick={() => window.open('http://localhost:3001/api/ledger?export=true', '_blank')}
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
