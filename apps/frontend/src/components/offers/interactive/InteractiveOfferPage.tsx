'use client';

import React, { useState, useEffect } from 'react';
import { useOfferDataPreview } from '../../../hooks/useOfferData';
import { OfferPreviewData } from '../../../types/offer';
import '../../../styles/offers-design-system.css';

export interface InteractiveOfferPageProps {
  offerId: string;
  onOfferAccepted?: (offerData: OfferPreviewData) => void;
  onOfferRejected?: (reason: string) => void;
  onError?: (error: Error) => void;
}

const InteractiveOfferPage: React.FC<InteractiveOfferPageProps> = ({
  offerId,
  onOfferAccepted,
  onOfferRejected,
  onError
}) => {
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(null);

  // Fetch offer data
  const {
    data: offerData,
    isLoading: dataLoading,
    error: dataError,
    refetch: refetchData
  } = useOfferDataPreview(offerId);

  // Set initial selected variant
  useEffect(() => {
    if (offerData?.variants && offerData.variants.length > 0 && !selectedVariantId) {
      setSelectedVariantId(offerData.variants[0].id);
    }
  }, [offerData?.variants, selectedVariantId]);

  // Handle variant selection
  const handleVariantSelect = (variantId: string) => {
    setSelectedVariantId(variantId);
  };

  // Handle offer acceptance
  const handleAcceptOffer = async () => {
    if (!offerData) return;
    onOfferAccepted?.(offerData);
  };

  // Handle offer rejection
  const handleRejectOffer = async (reason: string) => {
    onOfferRejected?.(reason);
  };

  // Loading state
  if (dataLoading) {
    return (
      <div className="offer-container">
        <div className="offer-loading">
          <div className="offer-flex offer-justify-center offer-items-center" style={{ minHeight: '400px' }}>
            <div className="offer-text-lg">Зареждане на офертата...</div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (dataError) {
    return (
      <div className="offer-container">
        <div className="offer-alert offer-alert-error">
          <h2 className="offer-heading-3">Грешка при зареждане</h2>
          <p>{dataError}</p>
          <button onClick={refetchData} className="offer-btn offer-btn-primary">
            Опитай отново
          </button>
        </div>
      </div>
    );
  }

  // No data state
  if (!offerData) {
    return (
      <div className="offer-container">
        <div className="offer-alert offer-alert-warning">
          <h2 className="offer-heading-3">Офертата не е налична</h2>
          <p>Офертата може да е изтекла или да не съществува.</p>
        </div>
      </div>
    );
  }

  const selectedVariant = offerData.variants.find(v => v.id === selectedVariantId) || offerData.variants[0];

  return (
    <div className="offer-container">
      {/* Hero Section */}
      <section className="offer-card offer-fade-in">
        <div className="offer-card-header">
          <div className="offer-flex offer-justify-between offer-items-center">
            <div>
              <div className="offer-heading-2">PARKETSENSE</div>
              <div className="offer-heading-3">{offerData.projectName}</div>
              <div className="offer-text-lg offer-text-secondary">Интерактивна оферта</div>
            </div>
            <div className="offer-badge offer-badge-primary">
              {offerData.offerNumber}
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Grid */}
      <main className="offer-grid offer-grid-cols-1 lg:offer-grid-cols-3 offer-space-y">
        {/* Variants Section */}
        <div className="lg:offer-col-span-2">
          <div className="offer-card">
            <div className="offer-card-header">
              <h3 className="offer-heading-4">Варианти</h3>
            </div>
            <div className="offer-card-body">
              <div className="offer-grid offer-grid-cols-1 md:offer-grid-cols-2 offer-space-y">
                {offerData.variants.map((variant) => (
                  <div
                    key={variant.id}
                    className={`offer-card ${selectedVariantId === variant.id ? 'offer-border-primary' : ''}`}
                    onClick={() => handleVariantSelect(variant.id)}
                    style={{ cursor: 'pointer' }}
                  >
                    <div className="offer-card-body">
                      <h4 className="offer-heading-4">{variant.name}</h4>
                      {variant.description && (
                        <p className="offer-text-sm offer-text-secondary">{variant.description}</p>
                      )}
                      <div className="offer-text-lg offer-text-primary">
                        {variant.totalPrice.toLocaleString('bg-BG')} лв.
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Selected Variant Details */}
          {selectedVariant && (
            <div className="offer-card offer-space-y">
              <div className="offer-card-header">
                <h3 className="offer-heading-4">{selectedVariant.name} - Детайли</h3>
              </div>
              <div className="offer-card-body">
                <div className="offer-space-y">
                  {selectedVariant.rooms.map((room) => (
                    <div key={room.id} className="offer-card">
                      <div className="offer-card-header">
                        <h4 className="offer-heading-4">{room.name}</h4>
                        <div className="offer-text-lg">{room.totalPrice.toLocaleString('bg-BG')} лв.</div>
                      </div>
                      <div className="offer-card-body">
                        <div className="offer-space-y">
                          {room.products.map((product) => (
                            <div key={product.id} className="offer-flex offer-justify-between offer-items-center">
                              <div>
                                <div className="offer-text-base">{product.name}</div>
                                <div className="offer-text-sm offer-text-secondary">
                                  {product.quantity} бр. x {product.unitPrice} лв.
                                </div>
                              </div>
                              <div className="offer-text-base">
                                {product.totalPrice.toLocaleString('bg-BG')} лв.
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="lg:offer-col-span-1">
          <div className="offer-card">
            <div className="offer-card-header">
              <h3 className="offer-heading-4">Обща стойност</h3>
            </div>
            <div className="offer-card-body">
              <div className="offer-text-3xl offer-text-primary offer-text-center">
                {offerData.totalValue.toLocaleString('bg-BG')} лв.
              </div>
            </div>
            <div className="offer-card-footer">
              <div className="offer-space-y">
                <button
                  onClick={handleAcceptOffer}
                  className="offer-btn offer-btn-success offer-btn-block"
                >
                  Приеми офертата
                </button>
                <button
                  onClick={() => handleRejectOffer('Не подходяща')}
                  className="offer-btn offer-btn-danger offer-btn-block"
                >
                  Отхвърли
                </button>
              </div>
            </div>
          </div>

          {/* Client Info */}
          <div className="offer-card offer-space-y">
            <div className="offer-card-header">
              <h3 className="offer-heading-4">Информация</h3>
            </div>
            <div className="offer-card-body">
              <div className="offer-space-y">
                <div>
                  <div className="offer-text-sm offer-text-secondary">Клиент</div>
                  <div className="offer-text-base">{offerData.clientName}</div>
                </div>
                <div>
                  <div className="offer-text-sm offer-text-secondary">Валидна до</div>
                  <div className="offer-text-base">
                    {new Date(offerData.validUntil).toLocaleDateString('bg-BG')}
                  </div>
                </div>
                <div>
                  <div className="offer-text-sm offer-text-secondary">Статус</div>
                  <div className="offer-badge offer-badge-primary">{offerData.status}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default InteractiveOfferPage; 