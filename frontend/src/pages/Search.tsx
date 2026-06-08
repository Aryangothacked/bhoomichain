import { useState, type FormEvent } from 'react';
import { useProperty } from '../hooks/useProperty';
import { Spinner, Badge } from '../components/ui';
import {
  Search as SearchIcon, ShieldCheck, XCircle,
  ChevronDown, ChevronUp, Clock, MapPin, LayoutGrid,
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { formatIndianCurrency, formatArea, timeAgo, truncateHash } from '../utils/formatters';
import { generatePropertyReport } from '../utils/generatePDF';
import PropertyMap from '../components/property/PropertyMap';

const HINT_CHIPS = [
  { label: 'BHC-MUM-2024-00001', value: 'BHC-MUM-2024-00001' },
  { label: 'Rajesh Kumar',        value: 'Rajesh Kumar' },
  { label: 'Survey 45/B',         value: '45/B' },
];

const EVENT_COLORS: Record<string, string> = {
  REGISTRATION:  '#1B4F8A',
  SALE:          '#7C3AED',
  TRANSFER:      '#7C3AED',
  LIEN:          '#D97706',
  RELEASE:       '#059669',
  MUTATION:      '#0891B2',
  DISPUTE:       '#DC2626',
  COURT_FREEZE:  '#DC2626',
};

function statusVariant(status: string) {
  const map: Record<string, string> = {
    CLEAR:        'success',
    DISPUTED:     'warning',
    UNDER_LIEN:   'primary',
    COURT_FREEZE: 'danger',
  };
  return map[status] || 'gray';
}

export default function Search() {
  const [query, setQuery]               = useState('');
  const [results, setResults]           = useState<any[]>([]);
  const [searched, setSearched]         = useState(false);
  const [expandedHistory, setExpandedHistory] = useState<string | null>(null);
  const [verifyingId, setVerifyingId]   = useState<string | null>(null);
  const [verifications, setVerifications] = useState<Record<string, any>>({});
  const [showQr, setShowQr]             = useState<string | null>(null);
  const [showMap, setShowMap]           = useState<string | null>(null);

  const { searchProperties, verifyIntegrity, loading } = useProperty();

  const handleSearch = async (e: FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    const data = await searchProperties(query);
    setResults(data.results || []);
    setSearched(true);
    setExpandedHistory(null);
    setVerifications({});
    setShowQr(null);
  };

  const handleVerify = async (propertyId: string) => {
    setVerifyingId(propertyId);
    const res = await verifyIntegrity(propertyId);
    if (res) {
      setVerifications((prev) => ({ ...prev, [propertyId]: res }));
      setShowQr(propertyId);
    }
    setVerifyingId(null);
  };

  const toggleHistory = (propertyId: string) =>
    setExpandedHistory((prev) => (prev === propertyId ? null : propertyId));

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '8px 0', animation: 'fadeInUp 0.3s ease forwards' }}>

      {/* ── Search Card ── */}
      <div style={{
        background: '#fff', borderRadius: 12,
        border: '1px solid #E2E8F0', padding: 24, marginBottom: 24,
      }}>
        <h1 style={{ fontSize: 20, fontWeight: 600, color: '#0F172A', margin: '0 0 4px' }}>
          Search &amp; Verify Property
        </h1>
        <p style={{ fontSize: 14, color: '#64748B', margin: '0 0 20px' }}>
          Search any property by ID, owner name, or survey number to verify its blockchain record
        </p>

        <form onSubmit={handleSearch} style={{ display: 'flex', gap: 12, marginBottom: 14 }}>
          <input
            id="search-input"
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Enter Property ID, Owner Name, or Survey Number..."
            style={{
              flex: 1, height: 44, border: '1px solid #D1D5DB', borderRadius: 8,
              padding: '0 16px', fontSize: 14, outline: 'none', color: '#0F172A',
              transition: 'border-color 0.2s, box-shadow 0.2s',
            }}
            onFocus={(e) => {
              e.target.style.borderColor = '#1B4F8A';
              e.target.style.boxShadow = '0 0 0 3px rgba(27,79,138,0.1)';
            }}
            onBlur={(e) => {
              e.target.style.borderColor = '#D1D5DB';
              e.target.style.boxShadow = 'none';
            }}
          />
          <button
            id="search-btn"
            type="submit"
            disabled={loading}
            style={{
              height: 44, padding: '0 24px',
              background: loading ? '#94A3B8' : '#1B4F8A',
              color: '#fff', borderRadius: 8, fontSize: 14, fontWeight: 600,
              border: 'none', cursor: loading ? 'not-allowed' : 'pointer',
              display: 'flex', alignItems: 'center', gap: 8,
              transition: 'background 0.2s', whiteSpace: 'nowrap',
            }}
          >
            {loading && !verifyingId
              ? <><Spinner className="w-4 h-4" /> Searching...</>
              : <><SearchIcon style={{ width: 16, height: 16 }} /> Search</>}
          </button>
        </form>

        {/* Hint chips */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 12, color: '#94A3B8', lineHeight: '26px' }}>Try:</span>
          {HINT_CHIPS.map((chip) => (
            <button
              key={chip.value}
              onClick={() => setQuery(chip.value)}
              style={{
                height: 26, padding: '0 12px',
                background: '#F1F5F9', border: '1px solid #E2E8F0',
                borderRadius: 20, fontSize: 12, color: '#475569', cursor: 'pointer',
                fontFamily: chip.value.startsWith('BHC') ? 'monospace' : 'inherit',
              }}
            >
              {chip.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Loading ── */}
      {loading && !verifyingId && (
        <div style={{ textAlign: 'center', padding: '48px 0', color: '#64748B' }}>
          <Spinner className="w-6 h-6" />
          <p style={{ marginTop: 12, fontSize: 14 }}>Searching blockchain...</p>
        </div>
      )}

      {/* ── No results ── */}
      {searched && !loading && results.length === 0 && (
        <div style={{ textAlign: 'center', padding: '56px 24px', color: '#94A3B8' }}>
          <SearchIcon style={{ width: 40, height: 40, margin: '0 auto 16px', display: 'block', opacity: 0.4 }} />
          <p style={{ fontSize: 16, fontWeight: 600, color: '#475569', margin: '0 0 6px' }}>No property found</p>
          <p style={{ fontSize: 14 }}>Try searching with a different ID or owner name</p>
        </div>
      )}

      {/* ── Results ── */}
      {results.map((r) => {
        // API shape: { property, registrationBlock, history, qrData }
        // history items: { blockNumber, eventType, ownerName, status, notes, timestamp, hash }
        const p         = r.property;
        const pid       = p.propertyId;
        const history   = r.history as any[];
        const lastBlock = history[history.length - 1];
        const histOpen  = expandedHistory === pid;
        const verif     = verifications[pid];

        return (
          <div key={pid} style={{
            background: '#fff', borderRadius: 12,
            border: '1px solid #E2E8F0', marginBottom: 16, overflow: 'hidden',
          }}>
            {/* ── Card body ── */}
            <div style={{ padding: '20px 24px' }}>
              {/* Row 1: ID + status */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <span style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: 14, color: '#1B4F8A' }}>
                  {pid}
                </span>
                <Badge variant={statusVariant(p.status)}>{(p.status || '').replace('_', ' ')}</Badge>
              </div>

              {/* Row 2: Owner + city + type */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10, flexWrap: 'wrap' }}>
                <span style={{ fontSize: 15, fontWeight: 600, color: '#0F172A' }}>{p.ownerName}</span>
                <span style={{ fontSize: 12, padding: '2px 8px', background: '#EFF6FF', color: '#1D4ED8', borderRadius: 4, fontWeight: 500 }}>
                  <MapPin style={{ width: 11, height: 11, display: 'inline', marginRight: 3 }} />{p.city}
                </span>
                <span style={{ fontSize: 12, padding: '2px 8px', background: '#F1F5F9', color: '#475569', borderRadius: 4, fontWeight: 500, textTransform: 'capitalize' }}>
                  <LayoutGrid style={{ width: 11, height: 11, display: 'inline', marginRight: 3 }} />{p.propertyType}
                </span>
              </div>

              {/* Row 3: Area + declared value + survey */}
              <div style={{ display: 'flex', gap: 24, fontSize: 13, color: '#64748B', marginBottom: 10, flexWrap: 'wrap' }}>
                <span><strong style={{ color: '#334155' }}>{formatArea(p.area)}</strong></span>
                <span>Declared: <strong style={{ color: '#334155' }}>{formatIndianCurrency(p.declaredValue)}</strong></span>
                <span>Survey: <strong style={{ color: '#334155' }}>#{p.surveyNo}</strong></span>
              </div>

              {/* Row 4: Last updated */}
              <div style={{ fontSize: 12, color: '#94A3B8', display: 'flex', alignItems: 'center', gap: 4, marginBottom: 16 }}>
                <Clock style={{ width: 12, height: 12 }} />
                Last updated {timeAgo(lastBlock.timestamp)}&nbsp;·&nbsp;Block #{lastBlock.blockNumber}
              </div>

              {/* Row 5: Action buttons */}
              <div style={{ display: 'flex', gap: 10 }}>
                <button
                  onClick={() => setShowMap(showMap === pid ? null : pid)}
                  style={{
                    height: 36, padding: '0 16px', border: '1px solid #D1D5DB',
                    borderRadius: 7, background: '#fff', color: '#374151',
                    fontSize: 13, fontWeight: 500, cursor: 'pointer',
                    display: 'flex', alignItems: 'center', gap: 6,
                  }}
                >
                  <MapPin style={{ width: 14, height: 14 }} /> {showMap === pid ? 'Hide Map' : 'View on Map'}
                </button>
                <button
                  onClick={() => toggleHistory(pid)}
                  style={{
                    height: 36, padding: '0 16px', border: '1px solid #D1D5DB',
                    borderRadius: 7, background: '#fff', color: '#374151',
                    fontSize: 13, fontWeight: 500, cursor: 'pointer',
                    display: 'flex', alignItems: 'center', gap: 6,
                  }}
                >
                  {histOpen
                    ? <><ChevronUp style={{ width: 14, height: 14 }} /> Hide History</>
                    : <><ChevronDown style={{ width: 14, height: 14 }} /> View Full History</>}
                </button>
                <button
                  onClick={() => handleVerify(pid)}
                  disabled={!!verifyingId}
                  style={{
                    height: 36, padding: '0 16px', border: 'none',
                    borderRadius: 7, background: '#1B4F8A', color: '#fff',
                    fontSize: 13, fontWeight: 600, cursor: verifyingId ? 'not-allowed' : 'pointer',
                    display: 'flex', alignItems: 'center', gap: 6,
                    opacity: verifyingId ? 0.7 : 1,
                  }}
                >
                  {verifyingId === pid
                    ? <><Spinner className="w-3 h-3" /> Verifying...</>
                    : <><ShieldCheck style={{ width: 14, height: 14 }} /> Verify Integrity</>}
                </button>
              </div>
            </div>

            {/* ── Map Display ── */}
            {showMap === pid && (
              <div style={{ padding: '0 24px 20px 24px' }}>
                <PropertyMap properties={[p]} height={300} />
              </div>
            )}

            {/* ── History Timeline ── */}
            {histOpen && (
              <div style={{ borderTop: '1px solid #F1F5F9', padding: '20px 24px', background: '#FAFAFA' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <h4 style={{
                    fontSize: 13, fontWeight: 700, color: '#374151',
                    margin: 0, textTransform: 'uppercase', letterSpacing: 1,
                  }}>
                    Transaction History — {history.length} blocks
                  </h4>
                  <button 
                    onClick={() => generatePropertyReport(p, history)}
                    style={{
                      background: 'none', border: '1px solid #1B4F8A', color: '#1B4F8A',
                      borderRadius: '6px', padding: '6px 14px', fontSize: '13px', cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = '#1B4F8A'; e.currentTarget.style.color = '#fff'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = '#1B4F8A'; }}
                  >
                    ⬇ Download PDF Report
                  </button>
                </div>
                <div style={{ position: 'relative' }}>
                  {/* Vertical line */}
                  <div style={{
                    position: 'absolute', left: 19, top: 0, bottom: 0,
                    width: 2, background: '#E2E8F0', zIndex: 0,
                  }} />
                  {[...history].reverse().map((block: any, i: number) => {
                    const color = EVENT_COLORS[block.eventType] || '#64748B';
                    return (
                      <div key={i} style={{ display: 'flex', gap: 16, marginBottom: 14, position: 'relative', zIndex: 1 }}>
                        {/* Circle dot */}
                        <div style={{
                          width: 38, height: 38, borderRadius: '50%', flexShrink: 0,
                          background: `${color}20`, border: `2px solid ${color}`,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: 10, fontWeight: 700, color, fontFamily: 'monospace',
                        }}>
                          {block.blockNumber}
                        </div>
                        {/* Block content */}
                        <div style={{
                          flex: 1, background: '#fff', border: '1px solid #E2E8F0',
                          borderRadius: 8, padding: '10px 14px', borderLeft: `3px solid ${color}`,
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                            <span style={{
                              fontSize: 11, fontWeight: 700, color: '#fff',
                              background: color, borderRadius: 4, padding: '1px 7px',
                            }}>
                              {block.eventType || 'EVENT'}
                            </span>
                            <span style={{ fontSize: 12, color: '#94A3B8' }}>
                              {timeAgo(block.timestamp)}
                            </span>
                          </div>
                          {block.ownerName && (
                            <p style={{ fontSize: 13, color: '#374151', margin: '3px 0', fontWeight: 500 }}>
                              {block.ownerName}
                            </p>
                          )}
                          {block.notes && (
                            <p style={{ fontSize: 12, color: '#64748B', margin: '2px 0' }}>{block.notes}</p>
                          )}
                          <p style={{ fontSize: 11, fontFamily: 'monospace', color: '#94A3B8', margin: '4px 0 0' }}>
                            {truncateHash(block.hash, 24)}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ── Verification Result ── */}
            {verif && (
              <div style={{ borderTop: '1px solid #F1F5F9', padding: '20px 24px' }}>
                {/* Verdict banner */}
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20,
                  padding: '14px 20px', borderRadius: 10,
                  background: verif.valid ? '#DCFCE7' : '#FEE2E2',
                  border: `1px solid ${verif.valid ? '#86EFAC' : '#FCA5A5'}`,
                }}>
                  {verif.valid
                    ? <ShieldCheck style={{ width: 22, height: 22, color: '#16A34A', flexShrink: 0 }} />
                    : <XCircle    style={{ width: 22, height: 22, color: '#DC2626', flexShrink: 0 }} />}
                  <span style={{
                    fontSize: 14, fontWeight: 700, letterSpacing: 0.4,
                    color: verif.valid ? '#15803D' : '#B91C1C',
                  }}>
                    {verif.valid
                      ? '✓ CHAIN INTEGRITY VERIFIED'
                      : '✗ CHAIN COMPROMISED — TAMPERED DATA DETECTED'}
                  </span>
                </div>

                {/* Per-block table */}
                {verif.blocks && verif.blocks.length > 0 && (
                  <div style={{ marginBottom: 20, overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                      <thead>
                        <tr style={{ background: '#F8FAFC' }}>
                          {['Block #', 'Stored Hash', 'Computed Hash', 'Match'].map((h) => (
                            <th key={h} style={{
                              padding: '8px 12px', textAlign: 'left',
                              fontWeight: 700, color: '#64748B', fontSize: 11,
                              textTransform: 'uppercase', letterSpacing: 0.8,
                              borderBottom: '1px solid #E2E8F0',
                            }}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {verif.blocks.map((b: any, i: number) => (
                          <tr key={i} style={{ borderBottom: '1px solid #F1F5F9' }}>
                            <td style={{ padding: '8px 12px', fontFamily: 'monospace', fontWeight: 700, color: '#1B4F8A' }}>
                              {b.blockNumber}
                            </td>
                            <td style={{ padding: '8px 12px', fontFamily: 'monospace', color: '#64748B' }}>
                              <span title={b.storedHash}>{truncateHash(b.storedHash || b.hash, 20)}</span>
                            </td>
                            <td style={{ padding: '8px 12px', fontFamily: 'monospace', color: '#64748B' }}>
                              <span title={b.computedHash}>{truncateHash(b.computedHash || b.hash, 20)}</span>
                            </td>
                            <td style={{ padding: '8px 12px' }}>
                              {b.match
                                ? <span style={{ color: '#16A34A', fontWeight: 700, fontSize: 18 }}>✓</span>
                                : <span style={{ color: '#DC2626', fontWeight: 700, fontSize: 18 }}>✗</span>}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* QR Code */}
                {showQr === pid && (
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 20 }}>
                    <div style={{
                      background: '#fff', border: '1px solid #E2E8F0',
                      borderRadius: 12, padding: 16, display: 'inline-block',
                    }}>
                      <QRCodeSVG
                        value={`BhoomiChain://verify/${pid}/${lastBlock.hash}`}
                        size={128}
                      />
                      <p style={{
                        fontSize: 10, color: '#94A3B8', textAlign: 'center',
                        margin: '8px 0 0', fontFamily: 'monospace',
                      }}>
                        {pid}
                      </p>
                    </div>
                    <div style={{ paddingTop: 8 }}>
                      <p style={{ fontSize: 12, fontWeight: 700, color: '#334155', margin: '0 0 4px' }}>
                        Property QR Code
                      </p>
                      <p style={{ fontSize: 12, color: '#64748B', margin: '0 0 8px', lineHeight: 1.6 }}>
                        Scan to verify this property's blockchain record from any BhoomiChain-compatible app.
                      </p>
                      <p style={{ fontSize: 11, fontFamily: 'monospace', color: '#94A3B8', wordBreak: 'break-all' }}>
                        BhoomiChain://verify/{pid}/<wbr />{truncateHash(lastBlock.hash, 16)}…
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
