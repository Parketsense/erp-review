import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: number | string;
  change?: string;
  icon: LucideIcon;
  color: 'blue' | 'green' | 'orange' | 'purple';
  onClick?: () => void;
  className?: string;
}

const colorConfig = {
  blue: {
    bg: 'rgba(37, 99, 235, 0.1)',
    text: 'var(--color-blue)',
    iconBg: 'rgba(37, 99, 235, 0.1)',
    iconColor: 'var(--color-blue)'
  },
  green: {
    bg: 'rgba(5, 150, 105, 0.1)',
    text: 'var(--color-green)',
    iconBg: 'rgba(5, 150, 105, 0.1)',
    iconColor: 'var(--color-green)'
  },
  orange: {
    bg: 'rgba(234, 88, 12, 0.1)',
    text: 'var(--color-orange)',
    iconBg: 'rgba(234, 88, 12, 0.1)',
    iconColor: 'var(--color-orange)'
  },
  purple: {
    bg: 'rgba(124, 58, 237, 0.1)',
    text: 'var(--color-purple)',
    iconBg: 'rgba(124, 58, 237, 0.1)',
    iconColor: 'var(--color-purple)'
  }
};

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  change,
  icon: Icon,
  color,
  onClick,
  className = ''
}) => {
  const config = colorConfig[color];
  
  return (
    <div
      className={`stat-card bg-white rounded-lg p-6 border border-gray-200 ${onClick ? 'cursor-pointer' : ''} ${className}`}
      onClick={onClick}
      style={{
        transition: 'all 0.2s ease',
        boxShadow: 'var(--elevation-1)'
      }}
      onMouseEnter={(e) => {
        if (onClick) {
          e.currentTarget.style.transform = 'translateY(-2px)';
          e.currentTarget.style.boxShadow = 'var(--elevation-2)';
        }
      }}
      onMouseLeave={(e) => {
        if (onClick) {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = 'var(--elevation-1)';
        }
      }}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center mb-2">
            <div 
              className="p-3 rounded-full mr-4"
              style={{
                backgroundColor: config.iconBg,
                color: config.iconColor
              }}
            >
              <Icon size={24} />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-900">{value}</h3>
              <p className="text-sm text-gray-600">{title}</p>
            </div>
          </div>
          {change && (
            <p 
              className="text-xs font-medium"
              style={{ color: config.text }}
            >
              {change}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}; 