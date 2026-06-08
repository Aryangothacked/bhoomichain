import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import client from '../api/client';
import type { DashboardStats } from '../types';

export function useChain() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isChainHealthy, setIsChainHealthy] = useState(true);

  const fetchStats = useCallback(async () => {
    try {
      const res = await client.get('/dashboard/stats');
      setStats(res.data);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || 'Error fetching chain stats');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 30000); // 30s refresh
    return () => clearInterval(interval);
  }, [fetchStats]);

  // Dedicated health check — reads /api/health which always returns chainValid
  useEffect(() => {
    const checkHealth = async () => {
      try {
        const res = await axios.get('http://localhost:3001/api/health', { timeout: 5000 })
        if (res.data && (res.data.status === 'ok' || res.data.chainValid !== undefined)) {
          setIsChainHealthy(true)
        } else {
          setIsChainHealthy(false)
        }
      } catch {
        setIsChainHealthy(false)
      }
    }

    checkHealth()
    const interval = setInterval(checkHealth, 30000)
    return () => clearInterval(interval)
  }, []);

  return { stats, loading, error, isChainHealthy, refetch: fetchStats };
}
