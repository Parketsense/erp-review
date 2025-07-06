import React from 'react';

export interface PricingSidebarProps {
  variant: {
    id: string;
    name: string;
    totalPrice: number;
    discount?: number;
    finalPrice?: number;
  };
}

const PricingSidebar: React.FC<PricingSidebarProps> = ({ variant }) => {
  return (
    <aside className="sidebar">
      <div className="sidebar-title">Обобщение на цената</div>
      <div className="price-summary">
        <div className="price-line">
          <span>Обща стойност</span>
          <span>{variant.totalPrice.toLocaleString('bg-BG', { style: 'currency', currency: 'BGN' })}</span>
        </div>
        {variant.discount && (
          <div className="price-line">
            <span>Отстъпка</span>
            <span>-{variant.discount}%</span>
          </div>
        )}
        <div className="price-line">
          <span>Крайна цена</span>
          <span className="total-price">{(variant.finalPrice ?? variant.totalPrice).toLocaleString('bg-BG', { style: 'currency', currency: 'BGN' })}</span>
        </div>
      </div>
      <button className="btn btn-success w-full mt-6">Изпрати офертата</button>
    </aside>
  );
};

export default PricingSidebar; 