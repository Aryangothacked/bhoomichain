import { useState } from 'react';
import client from '../api/client';
import toast from 'react-hot-toast';

export function useProperty() {
  const [loading, setLoading] = useState(false);

  const searchProperties = async (query: string) => {
    setLoading(true);
    try {
      const res = await client.get(`/properties/search?q=${encodeURIComponent(query)}`);
      return res.data;
    } catch (err: any) {
      if (err.response?.status !== 404) {
        toast.error(err.response?.data?.message || 'Search failed');
      }
      return { results: [] };
    } finally {
      setLoading(false);
    }
  };

  const registerProperty = async (data: any) => {
    setLoading(true);
    try {
      const res = await client.post('/properties/register', data);
      toast.success('Property registered successfully!');
      return { success: true, data: res.data };
    } catch (err: any) {
      if (err.response?.status === 422) {
        return { success: false, validationError: true, data: err.response.data };
      }
      toast.error(err.response?.data?.error || 'Registration failed');
      return { success: false, data: null };
    } finally {
      setLoading(false);
    }
  };

  const verifyIntegrity = async (propertyId: string) => {
    setLoading(true);
    try {
      const res = await client.post(`/properties/verify-integrity/${propertyId}`);
      if (res.data.valid) {
        toast.success(res.data.message);
      } else {
        toast.error(res.data.message);
      }
      return res.data;
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Integrity check failed');
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { searchProperties, registerProperty, verifyIntegrity, loading };
}
