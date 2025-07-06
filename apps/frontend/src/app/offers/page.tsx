'use client';

import React from 'react';
import { ErrorBoundary } from '../../components/ErrorBoundary';
import { OffersList } from '../../components/offers';
import '../../styles/offers-design-system.css';

export default function OffersPage() {
  return (
    <ErrorBoundary>
      <div className="min-h-screen" style={{ backgroundColor: 'var(--color-bg)' }}>
        <OffersList />
      </div>
    </ErrorBoundary>
  );
} 