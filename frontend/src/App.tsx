
import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { Layout } from './components/layout/Layout';
import LoadingScreen from './components/ui/LoadingScreen';

import Dashboard from './pages/Dashboard';
import Register from './pages/Register';
import Search from './pages/Search';
import Ledger from './pages/Ledger';
import FraudDetection from './pages/FraudDetection';
import ReitPortal from './pages/ReitPortal';
import Calculator from './pages/Calculator';
import PriceTrends from './pages/PriceTrends';
import CompareProperties from './pages/CompareProperties';

function App() {
  const [isLoading, setIsLoading] = useState(true);

  return (
    <>
      {isLoading && <LoadingScreen onComplete={() => setIsLoading(false)} />}
      {!isLoading && (
        <div style={{ animation: 'fadeIn 0.4s ease' }}>
          <Router>
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: '#0F172A',
                  color: 'white',
                  borderRadius: '10px',
                  fontSize: '14px',
                },
              }}
            />
            <Layout>
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/register" element={<Register />} />
                <Route path="/search" element={<Search />} />
                <Route path="/ledger" element={<Ledger />} />
                <Route path="/fraud" element={<FraudDetection />} />
                <Route path="/reit" element={<ReitPortal />} />
                <Route path="/calculator" element={<Calculator />} />
                <Route path="/trends" element={<PriceTrends />} />
                <Route path="/compare" element={<CompareProperties />} />
              </Routes>
            </Layout>
          </Router>
        </div>
      )}
    </>
  );
}

export default App;
