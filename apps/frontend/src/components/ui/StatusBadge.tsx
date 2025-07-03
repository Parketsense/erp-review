import React from 'react';

interface StatusBadgeProps {
  status: 'active' | 'completed' | 'with-architect';
  children: React.ReactNode;
  className?: string;
}

const statusConfig = {
  active: {
    bg: 'rgba(5, 150, 105, 0.1)',
    color: 'var(--color-green)',
    text: 'Активен'
  },
  completed: {
    bg: 'rgba(124, 58, 237, 0.1)',
    color: 'var(--color-purple)',
    text: 'Завършен'
  },
  'with-architect': {
    bg: 'rgba(234, 88, 12, 0.1)',
    color: 'var(--color-orange)',
    text: 'С архитект'
  }
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  children,
  className = ''
}) => {
  const config = statusConfig[status];
  
  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium uppercase tracking-wider ${className}`}
      style={{
        backgroundColor: config.bg,
        color: config.color,
        padding: '4px 12px',
        borderRadius: '20px',
        fontSize: '12px',
        fontWeight: '500',
        textTransform: 'uppercase',
        letterSpacing: '0.5px'
      }}
    >
      {children}
    </span>
  );
}; 