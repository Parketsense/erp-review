import React from 'react';
import { X } from 'lucide-react';
import './Chip.module.css';

export interface ChipProps {
  variant?: 'success' | 'warning' | 'default';
  size?: 'sm' | 'md';
  children: React.ReactNode;
  onRemove?: () => void;
}

export const Chip: React.FC<ChipProps> = ({
  variant = 'default',
  size = 'md',
  children,
  onRemove,
}) => {
  const variantStyles = {
    success: { backgroundColor: 'var(--color-success-light)', color: 'var(--color-neutral-700)' },
    warning: { backgroundColor: 'var(--color-warning-light)', color: 'var(--color-neutral-700)' },
    default: { backgroundColor: 'var(--color-neutral-100)', color: 'var(--color-primary)' },
  };

  return (
    <span 
      className={`chip chip-${variant} chip-${size}`}
      style={variantStyles[variant]}
    >
      {children}
      {onRemove && (
        <button onClick={onRemove} className="chip-remove">
          <X size={14} />
        </button>
      )}
    </span>
  );
}; 