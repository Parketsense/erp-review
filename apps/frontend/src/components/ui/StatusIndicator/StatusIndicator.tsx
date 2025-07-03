import React from 'react';
import './StatusIndicator.module.css';

export interface StatusIndicatorProps {
  status?: 'active' | 'inactive' | 'pending';
  size?: 'sm' | 'md';
  pulse?: boolean;
}

export const StatusIndicator: React.FC<StatusIndicatorProps> = ({
  status = 'active',
  size = 'sm',
  pulse = false,
}) => {
  const sizes = {
    sm: '8px',
    md: '12px',
  };

  const colors = {
    active: 'var(--color-info-indicator)',
    inactive: 'var(--color-neutral-500)',
    pending: 'var(--color-warning)',
  };

  return (
    <span
      className={`status-indicator ${pulse ? 'pulse' : ''}`}
      style={{
        width: sizes[size],
        height: sizes[size],
        backgroundColor: colors[status],
        borderRadius: '50%',
        display: 'inline-block',
      }}
    />
  );
}; 