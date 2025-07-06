import { useState, useEffect, useCallback, useRef } from 'react';
import { interactiveOffersApi } from '../lib/api/offers';
import { ClientOfferData, OfferUpdate } from '../types/offers';
import { offersApi } from '@/lib/api/admin/offers';
import { OfferPreviewData } from '@/types/offer';

interface UseOfferDataOptions {
  autoRefresh?: boolean;
  refreshInterval?: number;
  enableRealTime?: boolean;
  onError?: (error: Error) => void;
  onUpdate?: (data: ClientOfferData) => void;
}

interface UseOfferDataReturn {
  data: ClientOfferData | null;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
  updateData: (updates: Partial<ClientOfferData>) => void;
  clearError: () => void;
  isStale: boolean;
  lastUpdated: Date | null;
}

/**
 * Custom hook for fetching and managing offer data
 * Provides caching, real-time updates, and error handling
 */
export function useOfferData(
  token: string,
  offerId: string,
  options: UseOfferDataOptions = {}
): UseOfferDataReturn {
  const {
    autoRefresh = false,
    refreshInterval = 30000, // 30 seconds
    enableRealTime = false,
    onError,
    onUpdate
  } = options;

  const [data, setData] = useState<ClientOfferData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [isStale, setIsStale] = useState(false);

  const abortControllerRef = useRef<AbortController | null>(null);
  const refreshTimerRef = useRef<NodeJS.Timeout | null>(null);
  const realTimeTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch offer data
  const fetchData = useCallback(async () => {
    if (!token || !offerId) {
      setError(new Error('Token and offer ID are required'));
      setLoading(false);
      return;
    }

    try {
      // Cancel previous request if still pending
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      abortControllerRef.current = new AbortController();
      setLoading(true);
      setError(null);

      const offerData = await interactiveOffersApi.getClientOffer(token, offerId);
      
      setData(offerData);
      setLastUpdated(new Date());
      setIsStale(false);
      
      // Call update callback
      onUpdate?.(offerData);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to fetch offer data');
      setError(error);
      onError?.(error);
    } finally {
      setLoading(false);
    }
  }, [token, offerId, onError, onUpdate]);

  // Real-time updates
  const fetchUpdates = useCallback(async () => {
    if (!enableRealTime || !token || !offerId || !data) return;

    try {
      const updates = await interactiveOffersApi.getOfferUpdates(token, offerId);
      
      if (updates.length > 0) {
        // Apply updates to current data
        let updatedData = { ...data };
        
        updates.forEach((update: OfferUpdate) => {
          switch (update.type) {
            case 'pricing':
              updatedData.pricing = { ...updatedData.pricing, ...update.data };
              break;
            case 'selection':
              updatedData.selections = { ...updatedData.selections, ...update.data };
              break;
            case 'gallery':
              // Update galleries if needed
              break;
            case 'status':
              updatedData.metadata = { ...updatedData.metadata, ...update.data };
              break;
          }
        });

        setData(updatedData);
        setLastUpdated(new Date());
        setIsStale(false);
        onUpdate?.(updatedData);
      }
    } catch (err) {
      console.warn('Failed to fetch real-time updates:', err);
    }
  }, [enableRealTime, token, offerId, data, onUpdate]);

  // Update data manually
  const updateData = useCallback((updates: Partial<ClientOfferData>) => {
    if (data) {
      const updatedData = { ...data, ...updates };
      setData(updatedData);
      setLastUpdated(new Date());
      setIsStale(false);
      onUpdate?.(updatedData);
    }
  }, [data, onUpdate]);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Mark data as stale
  const markAsStale = useCallback(() => {
    setIsStale(true);
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchData();

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [fetchData]);

  // Auto-refresh setup
  useEffect(() => {
    if (!autoRefresh || !data) return;

    refreshTimerRef.current = setInterval(() => {
      markAsStale();
      fetchData();
    }, refreshInterval);

    return () => {
      if (refreshTimerRef.current) {
        clearInterval(refreshTimerRef.current);
      }
    };
  }, [autoRefresh, refreshInterval, data, fetchData, markAsStale]);

  // Real-time updates setup
  useEffect(() => {
    if (!enableRealTime || !data) return;

    realTimeTimerRef.current = setInterval(() => {
      fetchUpdates();
    }, 5000); // Check for updates every 5 seconds

    return () => {
      if (realTimeTimerRef.current) {
        clearInterval(realTimeTimerRef.current);
      }
    };
  }, [enableRealTime, data, fetchUpdates]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      if (refreshTimerRef.current) {
        clearInterval(refreshTimerRef.current);
      }
      if (realTimeTimerRef.current) {
        clearInterval(realTimeTimerRef.current);
      }
    };
  }, []);

  return {
    data,
    loading,
    error,
    refetch: fetchData,
    updateData,
    clearError,
    isStale,
    lastUpdated
  };
}

export function useOfferDataPreview(offerId: string) {
  const [data, setData] = useState<OfferPreviewData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!offerId) {
      setIsLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await offersApi.getOfferPreview(offerId);
        setData(response as any);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Грешка при зареждане на офертата');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [offerId]);

  const refetch = async () => {
    if (offerId) {
      setIsLoading(true);
      setError(null);
      try {
        const response = await offersApi.getOfferPreview(offerId);
        setData(response as any);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Грешка при зареждане на офертата');
      } finally {
        setIsLoading(false);
      }
    }
  };

  return {
    data,
    isLoading,
    error,
    refetch
  };
} 