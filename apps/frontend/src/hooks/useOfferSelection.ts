import { useState, useEffect, useCallback, useRef } from 'react';
import { interactiveOffersApi } from '../lib/api/offers';
import { OfferSelection, ClientPreferences } from '../types/offers';

interface UseOfferSelectionOptions {
  token: string;
  offerId: string;
  initialSelection?: Partial<OfferSelection>;
  autoSave?: boolean;
  saveDelay?: number;
  onSave?: (selection: OfferSelection) => void;
  onError?: (error: Error) => void;
}

interface UseOfferSelectionReturn {
  selection: OfferSelection;
  loading: boolean;
  saving: boolean;
  error: Error | null;
  updateSelection: (updates: Partial<OfferSelection>) => void;
  updateVariantSelection: (variantId: string, selected: boolean) => void;
  updateRoomSelection: (variantId: string, roomId: string, selected: boolean) => void;
  updateProductSelection: (roomId: string, productId: string, selected: boolean) => void;
  updateProductOption: (productId: string, optionValue: string) => void;
  updateCustomization: (productId: string, customization: any) => void;
  updatePreferences: (preferences: Partial<ClientPreferences>) => void;
  saveSelection: () => Promise<void>;
  resetSelection: () => void;
  clearError: () => void;
  hasChanges: boolean;
  lastSaved: Date | null;
}

/**
 * Default selection state
 */
const defaultSelection: OfferSelection = {
  selectedVariants: [],
  selectedRooms: {},
  selectedProducts: {},
  selectedOptions: {},
  customizations: {},
  preferences: {
    budget: {
      min: 0,
      max: 100000,
      preferred: 50000
    },
    timeline: {
      urgency: 'medium'
    },
    priorities: {
      quality: 7,
      price: 8,
      speed: 6,
      design: 7
    },
    style: {
      preferred: [],
      avoid: []
    }
  }
};

/**
 * Custom hook for managing client offer selections
 * Provides local state management with API synchronization
 */
export function useOfferSelection(
  options: UseOfferSelectionOptions
): UseOfferSelectionReturn {
  const {
    token,
    offerId,
    initialSelection,
    autoSave = true,
    saveDelay = 2000,
    onSave,
    onError
  } = options;

  const [selection, setSelection] = useState<OfferSelection>({
    ...defaultSelection,
    ...initialSelection
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [hasChanges, setHasChanges] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const originalSelectionRef = useRef<OfferSelection>(selection);

  // Update selection with change tracking
  const updateSelection = useCallback((updates: Partial<OfferSelection>) => {
    setSelection(prev => {
      const newSelection = { ...prev, ...updates };
      setHasChanges(true);
      
      // Schedule auto-save
      if (autoSave) {
        if (saveTimeoutRef.current) {
          clearTimeout(saveTimeoutRef.current);
        }
        saveTimeoutRef.current = setTimeout(() => {
          saveSelection();
        }, saveDelay);
      }
      
      return newSelection;
    });
  }, [autoSave, saveDelay]);

  // Update variant selection
  const updateVariantSelection = useCallback((variantId: string, selected: boolean) => {
    setSelection(prev => ({
      ...prev,
      selectedVariants: selected 
        ? [...prev.selectedVariants, variantId]
        : prev.selectedVariants.filter((id: string) => id !== variantId)
    }));
  }, []);

  // Update room selection
  const updateRoomSelection = useCallback((variantId: string, roomId: string, selected: boolean) => {
    setSelection(prev => ({
      ...prev,
      selectedRooms: {
        ...prev.selectedRooms,
        [variantId]: selected
          ? [...(prev.selectedRooms[variantId] || []), roomId]
          : (prev.selectedRooms[variantId] || []).filter((id: string) => id !== roomId)
      }
    }));
  }, []);

  // Update product selection
  const updateProductSelection = useCallback((roomId: string, productId: string, selected: boolean) => {
    setSelection(prev => ({
      ...prev,
      selectedProducts: {
        ...prev.selectedProducts,
        [roomId]: selected
          ? [...(prev.selectedProducts[roomId] || []), productId]
          : (prev.selectedProducts[roomId] || []).filter((id: string) => id !== productId)
      }
    }));
  }, []);

  // Update product option
  const updateProductOption = useCallback((productId: string, optionValue: string) => {
    setSelection(prev => ({
      ...prev,
      selectedOptions: {
        ...prev.selectedOptions,
        [productId]: optionValue
      }
    }));
  }, []);

  // Update product customization
  const updateCustomization = useCallback((productId: string, customization: any) => {
    setSelection(prev => ({
      ...prev,
      customizations: {
        ...prev.customizations,
        [productId]: customization
      }
    }));
  }, []);

  // Update client preferences
  const updatePreferences = useCallback((preferences: Partial<ClientPreferences>) => {
    setSelection(prev => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        ...preferences
      }
    }));
  }, []);

  // Save selection to API
  const saveSelection = useCallback(async () => {
    if (!token || !offerId) return;

    try {
      setSaving(true);
      setError(null);

      await interactiveOffersApi.updateOfferSelection(token, offerId, selection);
      
      setHasChanges(false);
      setLastSaved(new Date());
      originalSelectionRef.current = selection;
      
      onSave?.(selection);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to save selection');
      setError(error);
      onError?.(error);
    } finally {
      setSaving(false);
    }
  }, [token, offerId, selection, onSave, onError]);

  // Reset selection to original state
  const resetSelection = useCallback(() => {
    setSelection(originalSelectionRef.current);
    setHasChanges(false);
    setError(null);
    
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
  }, []);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Load initial selection from API if not provided
  useEffect(() => {
    if (initialSelection) {
      originalSelectionRef.current = { ...defaultSelection, ...initialSelection };
      return;
    }

    const loadInitialSelection = async () => {
      if (!token || !offerId) return;

      try {
        setLoading(true);
        const offerData = await interactiveOffersApi.getClientOffer(token, offerId);
        
        if (offerData.selections) {
          const initialData = { ...defaultSelection, ...offerData.selections };
          setSelection(initialData);
          originalSelectionRef.current = initialData;
        }
      } catch (err) {
        console.warn('Failed to load initial selection:', err);
      } finally {
        setLoading(false);
      }
    };

    loadInitialSelection();
  }, [token, offerId, initialSelection]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  return {
    selection,
    loading,
    saving,
    error,
    updateSelection,
    updateVariantSelection,
    updateRoomSelection,
    updateProductSelection,
    updateProductOption,
    updateCustomization,
    updatePreferences,
    saveSelection,
    resetSelection,
    clearError,
    hasChanges,
    lastSaved
  };
} 