import React from 'react';

export interface Room {
  id: string;
  name: string;
  description?: string;
  products: Array<{ id: string; name: string; quantity: number; price: number }>;
}

export interface VariantDetailsProps {
  variant: {
    id: string;
    name: string;
    rooms: Room[];
  };
}

const VariantDetails: React.FC<VariantDetailsProps> = ({ variant }) => {
  return (
    <section className="variant-details active">
      <div className="section-title">Детайли за вариант: {variant.name}</div>
      <div className="rooms-grid">
        {variant.rooms.map(room => (
          <div key={room.id} className="room-card">
            <div className="room-header">
              <div className="room-name">{room.name}</div>
              {room.description && <div className="room-meta">{room.description}</div>}
            </div>
            <div className="room-content">
              <table className="products-table">
                <thead>
                  <tr>
                    <th>Продукт</th>
                    <th>Количество</th>
                    <th>Цена</th>
                  </tr>
                </thead>
                <tbody>
                  {room.products.map(product => (
                    <tr key={product.id}>
                      <td className="product-name">{product.name}</td>
                      <td>{product.quantity}</td>
                      <td>{product.price.toLocaleString('bg-BG', { style: 'currency', currency: 'BGN' })}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default VariantDetails; 