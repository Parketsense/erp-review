import React from 'react';

export interface Variant {
  id: string;
  name: string;
  description?: string;
  totalPrice: number;
}

export interface VariantsComparisonProps {
  variants: Variant[];
  selectedVariantId?: string;
  onSelectVariant?: (variantId: string) => void;
}

const VariantsComparison: React.FC<VariantsComparisonProps> = ({ variants, selectedVariantId, onSelectVariant }) => {
  return (
    <section className="variants-overview">
      <div className="section-title">Сравнение на варианти</div>
      <div className="variants-grid">
        {variants.map(variant => (
          <div
            key={variant.id}
            className={`variant-summary${selectedVariantId === variant.id ? ' selected' : ''}`}
            onClick={() => onSelectVariant && onSelectVariant(variant.id)}
          >
            <div className="variant-name">{variant.name}</div>
            {variant.description && <div className="variant-description">{variant.description}</div>}
            <div className="variant-total-price">{variant.totalPrice.toLocaleString('bg-BG', { style: 'currency', currency: 'BGN' })}</div>
            <div className="variant-total-label">Обща стойност</div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default VariantsComparison; 