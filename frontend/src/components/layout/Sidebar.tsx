
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  FilePlus, 
  Search, 
  Database, 
  ShieldAlert, 
  Building2,
  Box,
  X
} from 'lucide-react';
import { useChain } from '../../hooks/useChain';

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

const navItems = [
  { path: '/', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/register', label: 'Register Property', icon: FilePlus },
  { path: '/search', label: 'Search & Verify', icon: Search },
  { path: '/ledger', label: 'Ledger', icon: Database },
  { path: '/fraud', label: 'Fraud Detection', icon: ShieldAlert },
  { path: '/reit', label: 'REIT Portal', icon: Building2 },
];

export const Sidebar = ({ isOpen = true, onClose }: SidebarProps) => {
  const { isChainHealthy } = useChain();
  const isMobile = window.innerWidth < 768;

  return (
    <aside style={{
      width: '240px',
      height: '100vh',
      backgroundColor: '#0A1628',
      position: 'fixed',
      left: 0,
      top: 0,
      display: 'flex',
      flexDirection: 'column',
      zIndex: 150,
      transform: isOpen ? 'translateX(0)' : 'translateX(-100%)',
      transition: 'transform 0.25s ease',
    }}>
      {/* Top section: Logo */}
      <div style={{ padding: '32px 24px', borderBottom: '1px solid rgba(255,255,255,0.05)', position: 'relative' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Box size={24} color="#FFFFFF" strokeWidth={2.5} />
          <h1 style={{ color: '#FFFFFF', fontSize: '20px', fontWeight: 'bold' }}>BhoomiChain</h1>
        </div>
        <p style={{ color: '#64748B', fontSize: '11px', marginTop: '6px', fontWeight: '500' }}>
          Transparent. Tamper-proof. Trusted.
        </p>
        {isMobile && onClose && (
          <button 
            onClick={onClose}
            style={{ position: 'absolute', top: '32px', right: '16px', background: 'none', border: 'none', color: '#64748B', cursor: 'pointer' }}
          >
            <X size={20} />
          </button>
        )}
      </div>

      {/* Navigation items */}
      <nav style={{ flex: 1, padding: '24px 12px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => {
                if (window.innerWidth < 768 && onClose) {
                  onClose();
                }
              }}
              className={({ isActive }) => `sidebar-nav-link ${isActive ? 'active' : ''}`}
            >
              <Icon size={18} />
              <span style={{ fontSize: '14px', fontWeight: '500' }}>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* Bottom area */}
      <div style={{ padding: '24px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ 
            width: '8px', 
            height: '8px', 
            borderRadius: '50%', 
            backgroundColor: isChainHealthy ? '#16A34A' : '#DC2626' 
          }} />
          <span style={{ color: '#94A3B8', fontSize: '12px', fontWeight: '500' }}>
            {isChainHealthy ? 'Chain Secured' : 'Node Link Broken'}
          </span>
        </div>
      </div>
    </aside>
  );
};
