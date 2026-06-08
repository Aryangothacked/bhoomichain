import { useEffect, useState } from 'react';

interface LoadingScreenProps {
  onComplete: () => void;
}

const MESSAGES = [
  'Initializing blockchain nodes...',
  'Loading property registry...',
  'Verifying chain integrity...',
  'Connecting to 10 city nodes...',
  'BhoomiChain ready.',
];

const LoadingScreen: React.FC<LoadingScreenProps> = ({ onComplete }) => {
  const [fading, setFading]       = useState(false);
  const [msgIdx, setMsgIdx]       = useState(0);
  const [msgVisible, setMsgVisible] = useState(true);

  // Dismiss after 3200ms
  useEffect(() => {
    const t = setTimeout(() => {
      setFading(true);
      setTimeout(onComplete, 400);
    }, 3200);
    return () => clearTimeout(t);
  }, [onComplete]);

  // Cycle messages every 700ms with 300ms fade
  useEffect(() => {
    const iv = setInterval(() => {
      setMsgVisible(false);
      setTimeout(() => {
        setMsgIdx(p => (p + 1) % MESSAGES.length);
        setMsgVisible(true);
      }, 300);
    }, 700);
    return () => clearInterval(iv);
  }, []);

  return (
    <>
      <style>{`
        .bcls-wrap {
          position: fixed; inset: 0; z-index: 9999;
          background: #0A1628;
          display: flex; flex-direction: column;
          align-items: center; justify-content: center;
          gap: 0;
          font-family: 'Inter', sans-serif;
          transition: opacity 0.4s ease;
        }
        .bcls-wrap.fading { opacity: 0; pointer-events: none; }

        /* Logo row */
        .bcls-logo-row {
          display: flex; align-items: center; gap: 12px;
          margin-bottom: 10px;
        }
        .bcls-icon { animation: bcls-pulse 2s ease-in-out infinite; }
        @keyframes bcls-pulse {
          0%,100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.07); opacity: 0.85; }
        }
        .bcls-name {
          font-size: 32px; font-weight: 700;
          color: #fff; letter-spacing: 2px; line-height: 1;
        }
        .bcls-tagline {
          font-size: 11px; color: #475569;
          letter-spacing: 4px; text-align: center;
          margin-bottom: 36px;
        }

        /* Blocks */
        .bcls-chain {
          display: flex; align-items: center;
          margin-bottom: 28px;
        }
        .bcls-block {
          width: 44px; height: 44px;
          border: 1.5px solid #1B4F8A;
          border-radius: 6px;
          background: rgba(27,79,138,0.15);
          flex-shrink: 0;
        }
        .bcls-line {
          width: 20px; height: 1px;
          background: #1B4F8A; flex-shrink: 0;
        }

        /* Sequential block glow — 5 blocks × 0.3 s apart, 1.5s each */
        .bcls-block:nth-child(1) { animation: bcls-glow 1.5s ease-in-out infinite 0.0s; }
        .bcls-block:nth-child(3) { animation: bcls-glow 1.5s ease-in-out infinite 0.3s; }
        .bcls-block:nth-child(5) { animation: bcls-glow 1.5s ease-in-out infinite 0.6s; }
        .bcls-block:nth-child(7) { animation: bcls-glow 1.5s ease-in-out infinite 0.9s; }
        .bcls-block:nth-child(9) { animation: bcls-glow 1.5s ease-in-out infinite 1.2s; }
        @keyframes bcls-glow {
          0%,100% { border-color: #1B4F8A; background: rgba(27,79,138,0.15); box-shadow: none; }
          40%,60% { border-color: #FF6B35; background: rgba(255,107,53,0.2); box-shadow: 0 0 12px rgba(255,107,53,0.4); }
        }

        /* Progress bar */
        .bcls-bar-wrap {
          width: 260px; height: 2px;
          background: rgba(255,255,255,0.08);
          border-radius: 2px; overflow: hidden;
          margin-bottom: 16px;
        }
        .bcls-bar-fill {
          height: 100%; width: 0%;
          background: linear-gradient(90deg, #1B4F8A, #FF6B35);
          animation: bcls-fill 2.8s ease-in-out forwards;
        }
        @keyframes bcls-fill { from { width: 0% } to { width: 100% } }

        /* Status text */
        .bcls-status {
          font-size: 13px; color: #64748B; text-align: center;
          transition: opacity 0.3s ease; height: 20px;
        }
        .bcls-status.hidden { opacity: 0; }
        .bcls-status.shown  { opacity: 1; }

        /* Footer */
        .bcls-footer {
          position: absolute; bottom: 24px;
          font-size: 11px; color: #334155; text-align: center;
        }
      `}</style>

      <div className={`bcls-wrap${fading ? ' fading' : ''}`}>
        {/* Logo */}
        <div className="bcls-logo-row">
          <svg className="bcls-icon" width="40" height="40" viewBox="0 0 64 64" fill="none" aria-hidden="true">
            <rect x="10" y="28" width="44" height="28" rx="2" stroke="white" strokeWidth="2" fill="none"/>
            <path d="M4 30 L32 8 L60 30" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
            <rect x="26" y="44" width="12" height="12" rx="1" stroke="white" strokeWidth="1.5" fill="none"/>
            <rect x="16" y="34" width="8" height="7" rx="1" stroke="white" strokeWidth="1.5" fill="none"/>
            <rect x="40" y="34" width="8" height="7" rx="1" stroke="white" strokeWidth="1.5" fill="none"/>
          </svg>
          <span className="bcls-name">BhoomiChain</span>
        </div>
        <p className="bcls-tagline">BLOCKCHAIN LAND REGISTRY OF INDIA</p>

        {/* Animated blocks */}
        <div className="bcls-chain" role="presentation">
          <div className="bcls-block" />
          <div className="bcls-line" />
          <div className="bcls-block" />
          <div className="bcls-line" />
          <div className="bcls-block" />
          <div className="bcls-line" />
          <div className="bcls-block" />
          <div className="bcls-line" />
          <div className="bcls-block" />
        </div>

        {/* Progress bar */}
        <div className="bcls-bar-wrap">
          <div className="bcls-bar-fill" />
        </div>

        {/* Status */}
        <p className={`bcls-status ${msgVisible ? 'shown' : 'hidden'}`}>
          {MESSAGES[msgIdx]}
        </p>

        <span className="bcls-footer">
          Ministry of Housing &amp; Urban Affairs — Simulated Demo
        </span>
      </div>
    </>
  );
};

export default LoadingScreen;
