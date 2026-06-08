
import { useState, useEffect, type ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import Header from './Header';

export const Layout = ({ children }: { children: ReactNode }) => {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Collapse sidebar on mobile by default
  useEffect(() => {
    const handleResize = () => {
      setSidebarOpen(window.innerWidth >= 768);
    };
    handleResize(); // run on mount
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const getPageTitle = (path: string) => {
    switch (path) {
      case '/': return 'National Property Dashboard';
      case '/register': return 'Register New Property';
      case '/search': return 'Search & Verify Property';
      case '/ledger': return 'Global Chain Ledger';
      case '/fraud': return 'Fraud Detection Engine';
      case '/reit': return 'REIT Portal';
      default: return 'BhoomiChain Node';
    }
  };

  return (
    <div className="layout-container">
      {/* Mobile overlay — clicking closes sidebar */}
      {sidebarOpen && window.innerWidth < 768 && (
        <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main content */}
      <div style={{
        flex: 1,
        marginLeft: sidebarOpen ? '240px' : '0',
        minHeight: '100vh',
        backgroundColor: '#F8FAFC',
        display: 'flex',
        flexDirection: 'column',
        transition: 'margin-left 0.25s ease',
      }}>
        <Header
          title={getPageTitle(location.pathname)}
          onHamburgerClick={() => setSidebarOpen(o => !o)}
        />

        <main style={{ padding: '24px', flex: 1 }}>
          {children}
        </main>
      </div>
    </div>
  );
};
