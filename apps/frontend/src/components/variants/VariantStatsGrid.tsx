'use client';

import React from 'react';
import { PhaseVariant, VariantRoom } from '@/types/variant';
import { 
  Package, 
  CheckCircle, 
  DollarSign, 
  TrendingUp,
  Users,
  Home,
  Percent
} from 'lucide-react';

interface VariantStatsGridProps {
  variants: PhaseVariant[];
  isLoading?: boolean;
}

const VariantStatsGrid: React.FC<VariantStatsGridProps> = ({ 
  variants, 
  isLoading = false 
}) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[...Array(4)].map((_, index) => (
          <div 
            key={index}
            className="bg-white rounded-xl border border-gray-200 p-6 animate-pulse"
          >
            <div className="h-4 bg-gray-200 rounded mb-3"></div>
            <div className="h-8 bg-gray-200 rounded mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-2/3"></div>
          </div>
        ))}
      </div>
    );
  }

  // Calculate statistics
  const totalVariants = variants.length;
  const selectedVariants = variants.filter(v => v.isSelected).length;
  const totalValue = variants.reduce((sum, variant) => {
    const variantTotal = variant.rooms?.reduce((roomSum: number, room: VariantRoom) => {
      return roomSum + (room.products?.reduce((productSum: number, product: any) => {
        return productSum + (product.quantity * product.unitPrice * (1 - (product.discount || 0) / 100));
      }, 0) || 0);
    }, 0) || 0;
    return sum + variantTotal;
  }, 0);
  const averageValue = totalVariants > 0 ? totalValue / totalVariants : 0;

  const stats = [
    {
      title: 'Общо варианти',
      value: totalVariants,
      icon: Package,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200'
    },
    {
      title: 'Избрани варианти',
      value: selectedVariants,
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200'
    },
    {
      title: 'Обща стойност',
      value: `${totalValue.toLocaleString('bg-BG')} лв.`,
      icon: DollarSign,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200'
    },
    {
      title: 'Средна стойност',
      value: `${averageValue.toLocaleString('bg-BG')} лв.`,
      icon: TrendingUp,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      borderColor: 'border-orange-200'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {stats.map((stat, index) => {
        const IconComponent = stat.icon;
        return (
          <div 
            key={index}
            className={`bg-white rounded-xl border ${stat.borderColor} p-6 shadow-sm hover:shadow-md transition-all duration-200 group`}
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-lg ${stat.bgColor} group-hover:scale-110 transition-transform duration-200`}>
                <IconComponent className={`w-6 h-6 ${stat.color}`} />
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-gray-900 group-hover:text-gray-700 transition-colors">
                  {stat.value}
                </div>
                <div className="text-sm text-gray-500 mt-1">
                  {stat.title}
                </div>
              </div>
            </div>
            
            {/* Progress indicator for selected variants */}
            {stat.title === 'Избрани варианти' && totalVariants > 0 && (
              <div className="mt-4">
                <div className="flex justify-between text-xs text-gray-500 mb-1">
                  <span>Прогрес</span>
                  <span>{Math.round((selectedVariants / totalVariants) * 100)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-green-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${(selectedVariants / totalVariants) * 100}%` }}
                  ></div>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default VariantStatsGrid; 