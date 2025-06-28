'use client';

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { LoadingSpinner } from './LoadingSpinner';

// Loading Context Types
interface LoadingState {
  isLoading: boolean;
  loadingText?: string;
  loadingKey?: string;
}

interface LoadingContextValue {
  globalLoading: LoadingState;
  loadingStates: Map<string, LoadingState>;
  showLoading: (key?: string, text?: string) => void;
  hideLoading: (key?: string) => void;
  setGlobalLoading: (loading: boolean, text?: string) => void;
}

const LoadingContext = createContext<LoadingContextValue | undefined>(undefined);

// Loading Provider Component
interface LoadingProviderProps {
  children: ReactNode;
}

export function LoadingProvider({ children }: LoadingProviderProps) {
  const [globalLoading, setGlobalLoadingState] = useState<LoadingState>({
    isLoading: false,
  });
  
  const [loadingStates, setLoadingStates] = useState<Map<string, LoadingState>>(
    new Map()
  );

  const showLoading = useCallback((key: string = 'default', text?: string) => {
    setLoadingStates(prev => {
      const newMap = new Map(prev);
      newMap.set(key, {
        isLoading: true,
        loadingText: text,
        loadingKey: key,
      });
      return newMap;
    });
  }, []);

  const hideLoading = useCallback((key: string = 'default') => {
    setLoadingStates(prev => {
      const newMap = new Map(prev);
      newMap.delete(key);
      return newMap;
    });
  }, []);

  const setGlobalLoading = useCallback((loading: boolean, text?: string) => {
    setGlobalLoadingState({
      isLoading: loading,
      loadingText: text,
    });
  }, []);

  const contextValue: LoadingContextValue = {
    globalLoading,
    loadingStates,
    showLoading,
    hideLoading,
    setGlobalLoading,
  };

  return (
    <LoadingContext.Provider value={contextValue}>
      {children}
      
      {/* Global Loading Overlay */}
      {globalLoading.isLoading && (
        <LoadingSpinner
          size="large"
          text={globalLoading.loadingText}
          fullScreen={true}
        />
      )}
    </LoadingContext.Provider>
  );
}

// Custom Hook for Loading State
export function useLoading(key?: string) {
  const context = useContext(LoadingContext);
  
  if (!context) {
    throw new Error('useLoading must be used within a LoadingProvider');
  }

  const { loadingStates, showLoading, hideLoading, setGlobalLoading } = context;
  
  const currentKey = key || 'default';
  const isLoading = loadingStates.has(currentKey);
  const loadingState = loadingStates.get(currentKey);

  return {
    isLoading,
    loadingText: loadingState?.loadingText,
    showLoading: (text?: string) => showLoading(currentKey, text),
    hideLoading: () => hideLoading(currentKey),
    setGlobalLoading,
  };
}

// Higher Order Component for Loading
interface WithLoadingProps {
  loading?: boolean;
  loadingText?: string;
  loadingSize?: 'small' | 'medium' | 'large';
  children: ReactNode;
}

export function WithLoading({ 
  loading = false, 
  loadingText = 'Зареждане...', 
  loadingSize = 'medium',
  children 
}: WithLoadingProps) {
  if (loading) {
    return (
      <LoadingSpinner 
        size={loadingSize} 
        text={loadingText} 
      />
    );
  }
  
  return <>{children}</>;
}

// Hook for API Loading States
export function useApiLoading() {
  const { showLoading, hideLoading } = useLoading();

  const withLoading = useCallback(
    (apiCall: () => Promise<any>, loadingText?: string) => {
      return (async () => {
        try {
          showLoading(loadingText);
          const result = await apiCall();
          return result;
        } finally {
          hideLoading();
        }
      })();
    },
    [showLoading, hideLoading]
  );

  return { withLoading };
} 