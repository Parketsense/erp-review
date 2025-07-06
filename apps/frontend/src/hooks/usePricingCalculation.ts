import { useState, useEffect, useCallback, useRef } from 'react';
import { interactiveOffersApi } from '../lib/api/offers';
import { PricingData, OfferSelection } from '../types/offers';

interface UsePricingCalculationOptions {
  token: string;
  offerId: string;
  autoCalculate?: boolean;
  debounceMs?: number;
  cacheTimeout?: number;
  onCalculation?: (pricing: PricingData) => void;
  onError?: (error: Error) => void;
}

interface UsePricingCalculationReturn {
  pricing: PricingData | null;
  loading: boolean;
  error: Error | null;
  calculatePricing: (selection: OfferSelection) => Promise<void>;
  clearCache: () => void;
  clearError: () => void;
  isCalculating: boolean;
  lastCalculated: Date | null;
  cacheKey: string | null;
}

export interface PricingItem {
  id: string;
  name: string;
  quantity: number;
  unitPrice: number;
  discount: number;
  totalPrice: number;
}

export interface PricingSummary {
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  currency: string;
}

/**
 * Custom hook for real-time pricing calculations
 * Provides caching, debouncing, and error handling
 */
export function usePricingCalculation(
  options: UsePricingCalculationOptions
): UsePricingCalculationReturn {
  const {
    token,
    offerId,
    autoCalculate = true,
    debounceMs = 500,
    cacheTimeout = 30000, // 30 seconds
    onCalculation,
    onError
  } = options;

  const [pricing, setPricing] = useState<PricingData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [lastCalculated, setLastCalculated] = useState<Date | null>(null);
  const [cacheKey, setCacheKey] = useState<string | null>(null);

  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const cacheRef = useRef<Map<string, { data: PricingData; timestamp: number }>>(new Map());

  // Generate cache key from selection
  const generateCacheKey = useCallback((selection: OfferSelection): string => {
    const keyData = {
      variants: selection.selectedVariants.sort(),
      rooms: Object.keys(selection.selectedRooms).sort().map(variantId => ({
        variantId,
        rooms: selection.selectedRooms[variantId]?.sort() || []
      })),
      products: Object.keys(selection.selectedProducts).sort().map(roomId => ({
        roomId,
        products: selection.selectedProducts[roomId]?.sort() || []
      })),
      options: selection.selectedOptions,
      customizations: Object.keys(selection.customizations).sort()
    };
    
    return JSON.stringify(keyData);
  }, []);

  // Check if cached data is still valid
  const isCacheValid = useCallback((key: string): boolean => {
    const cached = cacheRef.current.get(key);
    if (!cached) return false;
    
    const now = Date.now();
    return (now - cached.timestamp) < cacheTimeout;
  }, [cacheTimeout]);

  // Get cached pricing data
  const getCachedPricing = useCallback((key: string): PricingData | null => {
    if (!isCacheValid(key)) {
      cacheRef.current.delete(key);
      return null;
    }
    
    return cacheRef.current.get(key)?.data || null;
  }, [isCacheValid]);

  // Cache pricing data
  const cachePricing = useCallback((key: string, data: PricingData) => {
    cacheRef.current.set(key, {
      data,
      timestamp: Date.now()
    });
  }, []);

  // Clear cache
  const clearCache = useCallback(() => {
    cacheRef.current.clear();
    setCacheKey(null);
  }, []);

  // Calculate pricing with caching and debouncing
  const calculatePricing = useCallback(async (selection: OfferSelection) => {
    if (!token || !offerId) {
      setError(new Error('Token and offer ID are required'));
      return;
    }

    const key = generateCacheKey(selection);
    setCacheKey(key);

    // Check cache first
    const cached = getCachedPricing(key);
    if (cached) {
      setPricing(cached);
      setLastCalculated(new Date());
      setError(null);
      onCalculation?.(cached);
      return;
    }

    // Cancel previous request if still pending
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();

    try {
      setLoading(true);
      setIsCalculating(true);
      setError(null);

      const pricingData = await interactiveOffersApi.calculatePricing(token, offerId, selection);
      
      setPricing(pricingData);
      setLastCalculated(new Date());
      
      // Cache the result
      cachePricing(key, pricingData);
      
      onCalculation?.(pricingData);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to calculate pricing');
      setError(error);
      onError?.(error);
    } finally {
      setLoading(false);
      setIsCalculating(false);
    }
  }, [token, offerId, generateCacheKey, getCachedPricing, cachePricing, onCalculation, onError]);

  // Debounced calculation
  const debouncedCalculate = useCallback((selection: OfferSelection) => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      calculatePricing(selection);
    }, debounceMs);
  }, [calculatePricing, debounceMs]);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Auto-calculate when selection changes (if enabled)
  const handleSelectionChange = useCallback((selection: OfferSelection) => {
    if (autoCalculate) {
      debouncedCalculate(selection);
    }
  }, [autoCalculate, debouncedCalculate]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return {
    pricing,
    loading,
    error,
    calculatePricing,
    clearCache,
    clearError,
    isCalculating,
    lastCalculated,
    cacheKey
  };
}

/**
 * Hook for managing pricing calculations with selection integration
 */
export function usePricingWithSelection(
  token: string,
  offerId: string,
  selection: OfferSelection,
  options: Omit<UsePricingCalculationOptions, 'token' | 'offerId'> = {}
) {
  const pricingHook = usePricingCalculation({
    token,
    offerId,
    ...options
  });

  // Auto-calculate when selection changes
  useEffect(() => {
    if (selection && Object.keys(selection.selectedVariants).length > 0) {
      pricingHook.calculatePricing(selection);
    }
  }, [selection, pricingHook]);

  return pricingHook;
}

export function useSimplePricingCalculation() {
  const [items, setItems] = useState<PricingItem[]>([]);
  const [taxRate, setTaxRate] = useState(20); // 20% VAT
  const [currency, setCurrency] = useState('BGN');

  const addItem = useCallback((item: Omit<PricingItem, 'totalPrice'>) => {
    const totalPrice = item.quantity * item.unitPrice * (1 - item.discount / 100);
    const newItem: PricingItem = { ...item, totalPrice };
    
    setItems(prev => {
      const existingIndex = prev.findIndex(i => i.id === item.id);
      if (existingIndex >= 0) {
        const updated = [...prev];
        updated[existingIndex] = newItem;
        return updated;
      }
      return [...prev, newItem];
    });
  }, []);

  const removeItem = useCallback((itemId: string) => {
    setItems(prev => prev.filter(item => item.id !== itemId));
  }, []);

  const updateItem = useCallback((itemId: string, updates: Partial<PricingItem>) => {
    setItems(prev => prev.map(item => {
      if (item.id === itemId) {
        const updated = { ...item, ...updates };
        updated.totalPrice = updated.quantity * updated.unitPrice * (1 - updated.discount / 100);
        return updated;
      }
      return item;
    }));
  }, []);

  const clearItems = useCallback(() => {
    setItems([]);
  }, []);

  const calculateSummary = useCallback((): PricingSummary => {
    const subtotal = items.reduce((sum, item) => sum + item.totalPrice, 0);
    const discount = items.reduce((sum, item) => {
      const originalPrice = item.quantity * item.unitPrice;
      return sum + (originalPrice - item.totalPrice);
    }, 0);
    const tax = subtotal * (taxRate / 100);
    const total = subtotal + tax;

    return {
      subtotal,
      discount,
      tax,
      total,
      currency
    };
  }, [items, taxRate, currency]);

  const formatCurrency = useCallback((amount: number): string => {
    return `${amount.toLocaleString('bg-BG')} ${currency}`;
  }, [currency]);

  return {
    items,
    addItem,
    removeItem,
    updateItem,
    clearItems,
    calculateSummary,
    formatCurrency,
    taxRate,
    setTaxRate,
    currency,
    setCurrency
  };
} 