# Interactive Offer Components Integration

This document explains how to integrate the React interactive offer components with real API data using the custom hooks and API services.

## Overview

The interactive offer system consists of:

1. **Types** (`/src/types/offers.ts`) - Comprehensive TypeScript interfaces
2. **API Service** (`/src/lib/api/offers.ts`) - Backend communication
3. **Custom Hooks** (`/src/hooks/`) - State management and data fetching
4. **React Components** - UI components with real data integration

## Quick Start Example

```tsx
import React from 'react';
import InteractiveOfferPage from './InteractiveOfferPage';
import { useOfferData, useOfferSelection, usePricingCalculation } from '../../hooks';

const OfferPage: React.FC<{ token: string; offerId: string }> = ({ token, offerId }) => {
  return (
    <InteractiveOfferPage
      token={token}
      offerId={offerId}
      onOfferAccepted={(offerData) => {
        console.log('Offer accepted:', offerData);
        // Handle offer acceptance
      }}
      onOfferRejected={(reason) => {
        console.log('Offer rejected:', reason);
        // Handle offer rejection
      }}
      onError={(error) => {
        console.error('Error:', error);
        // Handle errors
      }}
    />
  );
};
```

## Custom Hooks Usage

### 1. useOfferData Hook

Fetches and manages offer data with caching and real-time updates:

```tsx
import { useOfferData } from '../../hooks/useOfferData';

const MyComponent = ({ token, offerId }) => {
  const {
    data: offerData,
    loading,
    error,
    refetch,
    isStale,
    lastUpdated
  } = useOfferData(token, offerId, {
    autoRefresh: true,
    enableRealTime: true,
    onError: (error) => console.error('Data error:', error),
    onUpdate: (data) => console.log('Data updated:', data)
  });

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  if (!offerData) return <div>No data available</div>;

  return (
    <div>
      <h1>{offerData.project.name}</h1>
      <p>Last updated: {lastUpdated?.toLocaleString()}</p>
      {isStale && <p>Data is being refreshed...</p>}
    </div>
  );
};
```

### 2. useOfferSelection Hook

Manages client selections with auto-save and validation:

```tsx
import { useOfferSelection } from '../../hooks/useOfferSelection';

const SelectionManager = ({ token, offerId, initialSelection }) => {
  const {
    selection,
    loading,
    saving,
    error,
    updateVariantSelection,
    updateRoomSelection,
    updateProductSelection,
    updateProductOption,
    updateCustomization,
    updatePreferences,
    saveSelection,
    hasChanges,
    lastSaved
  } = useOfferSelection({
    token,
    offerId,
    initialSelection,
    autoSave: true,
    saveDelay: 2000,
    onSave: (selection) => console.log('Selection saved:', selection),
    onError: (error) => console.error('Selection error:', error)
  });

  const handleVariantSelect = (variantId: string) => {
    updateVariantSelection(variantId, true);
  };

  const handleRoomSelect = (variantId: string, roomId: string) => {
    updateRoomSelection(variantId, roomId, true);
  };

  return (
    <div>
      <h2>Selections</h2>
      {hasChanges && <p>You have unsaved changes</p>}
      {saving && <p>Saving...</p>}
      {lastSaved && <p>Last saved: {lastSaved.toLocaleString()}</p>}
      
      {/* Selection UI components */}
    </div>
  );
};
```

### 3. usePricingCalculation Hook

Real-time pricing calculations with caching and debouncing:

```tsx
import { usePricingCalculation } from '../../hooks/usePricingCalculation';

const PricingCalculator = ({ token, offerId, selection }) => {
  const {
    pricing,
    loading,
    error,
    calculatePricing,
    isCalculating,
    lastCalculated,
    cacheKey
  } = usePricingCalculation({
    token,
    offerId,
    autoCalculate: true,
    debounceMs: 500,
    cacheTimeout: 30000,
    onCalculation: (pricing) => console.log('Pricing calculated:', pricing),
    onError: (error) => console.error('Pricing error:', error)
  });

  return (
    <div>
      <h2>Pricing</h2>
      {isCalculating && <p>Calculating...</p>}
      {pricing && (
        <div>
          <p>Total: {pricing.total} {pricing.currency}</p>
          <p>Discount: {pricing.discounts.totalDiscount}</p>
          <p>Last calculated: {lastCalculated?.toLocaleString()}</p>
        </div>
      )}
    </div>
  );
};
```

## API Service Usage

### Direct API Calls

```tsx
import { interactiveOffersApi } from '../../lib/api/offers';

// Fetch client offer data
const fetchOfferData = async (token: string, offerId: string) => {
  try {
    const data = await interactiveOffersApi.getClientOffer(token, offerId);
    return data;
  } catch (error) {
    console.error('Failed to fetch offer:', error);
    throw error;
  }
};

// Update selections
const updateSelections = async (token: string, offerId: string, selection: any) => {
  try {
    await interactiveOffersApi.updateOfferSelection(token, offerId, selection);
  } catch (error) {
    console.error('Failed to update selection:', error);
    throw error;
  }
};

// Calculate pricing
const calculatePricing = async (token: string, offerId: string, selection: any) => {
  try {
    const pricing = await interactiveOffersApi.calculatePricing(token, offerId, selection);
    return pricing;
  } catch (error) {
    console.error('Failed to calculate pricing:', error);
    throw error;
  }
};

// Accept offer
const acceptOffer = async (token: string, offerId: string, acceptance: any) => {
  try {
    await interactiveOffersApi.acceptOffer(token, offerId, acceptance);
  } catch (error) {
    console.error('Failed to accept offer:', error);
    throw error;
  }
};
```

## Component Integration Examples

### VariantsComparison Component

```tsx
import React from 'react';
import { useOfferSelection } from '../../hooks/useOfferSelection';

const VariantsComparisonWithData = ({ token, offerId, variants }) => {
  const { selection, updateVariantSelection, loading } = useOfferSelection({
    token,
    offerId
  });

  return (
    <VariantsComparison
      variants={variants}
      selectedVariantId={selection.selectedVariants[0]}
      selection={selection}
      onSelectVariant={(variantId) => updateVariantSelection(variantId, true)}
      onUpdateSelection={updateVariantSelection}
      loading={loading}
    />
  );
};
```

### PricingSidebar Component

```tsx
import React from 'react';
import { usePricingCalculation } from '../../hooks/usePricingCalculation';

const PricingSidebarWithData = ({ token, offerId, variant, selection }) => {
  const { pricing, loading, isCalculating } = usePricingCalculation({
    token,
    offerId,
    autoCalculate: true
  });

  return (
    <PricingSidebar
      variant={variant}
      pricing={pricing}
      selection={selection}
      onUpdatePreferences={(preferences) => {
        // Update preferences logic
      }}
      onAcceptOffer={(offerData) => {
        // Accept offer logic
      }}
      onRejectOffer={(reason) => {
        // Reject offer logic
      }}
      loading={loading}
      isCalculating={isCalculating}
    />
  );
};
```

## Error Handling

```tsx
const ErrorBoundary = ({ children }) => {
  const [error, setError] = useState(null);

  if (error) {
    return (
      <div className="error-container">
        <h2>Something went wrong</h2>
        <p>{error.message}</p>
        <button onClick={() => window.location.reload()}>
          Reload Page
        </button>
      </div>
    );
  }

  return (
    <ErrorBoundary onError={setError}>
      {children}
    </ErrorBoundary>
  );
};
```

## Loading States

```tsx
const LoadingStates = () => {
  const { loading: dataLoading } = useOfferData(token, offerId);
  const { loading: selectionLoading, saving } = useOfferSelection({ token, offerId });
  const { loading: pricingLoading, isCalculating } = usePricingCalculation({ token, offerId });

  if (dataLoading) {
    return <div className="loading-spinner">Loading offer data...</div>;
  }

  if (selectionLoading) {
    return <div className="loading-spinner">Loading selections...</div>;
  }

  if (pricingLoading || isCalculating) {
    return <div className="loading-spinner">Calculating pricing...</div>;
  }

  return <div>All data loaded!</div>;
};
```

## Real-time Updates

```tsx
const RealTimeOffer = ({ token, offerId }) => {
  const { data, isStale, lastUpdated } = useOfferData(token, offerId, {
    enableRealTime: true,
    autoRefresh: true,
    refreshInterval: 30000
  });

  return (
    <div>
      <h1>Real-time Offer</h1>
      {isStale && <p>Data is being updated...</p>}
      {lastUpdated && <p>Last updated: {lastUpdated.toLocaleString()}</p>}
      
      {/* Offer content */}
    </div>
  );
};
```

## Best Practices

1. **Always handle loading and error states**
2. **Use TypeScript for type safety**
3. **Implement proper error boundaries**
4. **Cache expensive operations**
5. **Debounce user inputs**
6. **Provide user feedback for async operations**
7. **Handle network connectivity issues**
8. **Implement retry logic for failed requests**

## File Structure

```
src/
├── types/
│   └── offers.ts                 # TypeScript interfaces
├── lib/
│   └── api/
│       └── offers.ts             # API service
├── hooks/
│   ├── useOfferData.ts           # Data fetching hook
│   ├── useOfferSelection.ts      # Selection management hook
│   ├── usePricingCalculation.ts  # Pricing calculation hook
│   └── index.ts                  # Hook exports
└── components/
    └── offers/
        └── interactive/
            ├── InteractiveOfferPage.tsx
            ├── VariantsComparison.tsx
            ├── VariantDetails.tsx
            ├── PricingSidebar.tsx
            ├── AIAssistant.tsx
            ├── InstallationModal.tsx
            └── README.md
``` 