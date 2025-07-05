'use client';

import React from 'react';
import { 
  Home, 
  Package, 
  Image as ImageIcon, 
  Ruler,
  TrendingUp,
  DollarSign,
  Percent,
  Layers
} from 'lucide-react';

interface RoomStatsGridProps {
  stats: {
    total: number;
    withProducts: number;
    withImages: number;
    emptyRooms: number;
    averageArea: number;
    totalProducts: number;
  };
}

const RoomStatsGrid: React.FC<RoomStatsGridProps> = ({ stats }) => {
  const statCards = [
    {
      title: 'Общо стаи',
      value: stats.total,
      icon: Home,
      color: 'bg-blue-500',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-600',
      description: 'Всички създадени стаи'
    },
    {
      title: 'С продукти',
      value: stats.withProducts,
      icon: Package,
      color: 'bg-green-500',
      bgColor: 'bg-green-50',
      textColor: 'text-green-600',
      description: 'Стаи с добавени продукти'
    },
    {
      title: 'С изображения',
      value: stats.withImages,
      icon: ImageIcon,
      color: 'bg-purple-500',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-600',
      description: 'Стаи с прикачени снимки'
    },
    {
      title: 'Празни стаи',
      value: stats.emptyRooms,
      icon: Layers,
      color: 'bg-gray-500',
      bgColor: 'bg-gray-50',
      textColor: 'text-gray-600',
      description: 'Стаи без продукти'
    },
    {
      title: 'Средна площ',
      value: `${stats.averageArea.toFixed(1)} м²`,
      icon: Ruler,
      color: 'bg-orange-500',
      bgColor: 'bg-orange-50',
      textColor: 'text-orange-600',
      description: 'Средна площ на стаите'
    },
    {
      title: 'Общо продукти',
      value: stats.totalProducts,
      icon: TrendingUp,
      color: 'bg-indigo-500',
      bgColor: 'bg-indigo-50',
      textColor: 'text-indigo-600',
      description: 'Всички продукти в стаите'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
      {statCards.map((card, index) => {
        const IconComponent = card.icon;
        return (
          <div
            key={index}
            className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200 overflow-hidden"
          >
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3">
                    <div className={`p-3 rounded-lg ${card.bgColor}`}>
                      <IconComponent className={`w-6 h-6 ${card.textColor}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-500 truncate">
                        {card.title}
                      </p>
                      <p className="text-2xl font-bold text-gray-900 mt-1">
                        {card.value}
                      </p>
                    </div>
                  </div>
                  <p className="mt-3 text-xs text-gray-500">
                    {card.description}
                  </p>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default RoomStatsGrid; 