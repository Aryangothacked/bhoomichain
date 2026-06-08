import { useState } from 'react';
import client from '../api/client';
import toast from 'react-hot-toast';

export function useFraud() {
  const [loading, setLoading] = useState(false);

  const analyzeWithAI = async (propertyDetails: string) => {
    setLoading(true);
    try {
      const res = await client.post('/fraud/analyze', { propertyDetails });
      return res.data;
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'AI Analysis failed');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const getFraudAlerts = async () => {
    setLoading(true);
    try {
      const res = await client.get('/fraud/alerts');
      return res.data;
    } catch (err: any) {
      toast.error('Failed to load fraud alerts');
      return { rejectedAttempts: [], analytics: {} };
    } finally {
      setLoading(false);
    }
  };

  return { analyzeWithAI, getFraudAlerts, loading };
}
