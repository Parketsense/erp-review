import React from 'react';
import { ButtonHTMLAttributes } from 'react';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  icon?: React.ReactNode;
  fullWidth?: boolean;
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  loading = false,
  icon,
  fullWidth = false,
  children,
  className = '',
  disabled,
  ...props
}) => {
  const baseClasses = 'button-base';
  const variantClasses = {
    primary: 'button-primary',
    secondary: 'button-secondary',
    outline: 'button-outline',
    ghost: 'button-ghost',
    danger: 'button-danger',
    success: 'button-success'
  };
  const sizeClasses = {
    sm: 'button-sm',
    md: 'button-md',
    lg: 'button-lg'
  };

  const buttonClasses = [
    baseClasses,
    variantClasses[variant],
    sizeClasses[size],
    fullWidth ? 'button-full-width' : '',
    className
  ].filter(Boolean).join(' ');

  return (
    <button
      className={buttonClasses}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <div className="button-loading">
          <div className="loading-spinner"></div>
        </div>
      )}
      {icon && !loading && (
        <span className="button-icon">{icon}</span>
      )}
      <span className="button-text">{children}</span>

      <style jsx>{`
        .button-base {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: var(--space-xs);
          border: none;
          border-radius: var(--radius-md);
          font-family: var(--font-family);
          font-weight: var(--font-medium);
          cursor: pointer;
          transition: all 0.2s ease;
          text-decoration: none;
          position: relative;
          overflow: hidden;
        }

        .button-base:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .button-primary {
          background: var(--color-primary);
          color: var(--white);
          box-shadow: var(--shadow-sm);
        }

        .button-primary:hover:not(:disabled) {
          background: var(--color-primary-dark);
          box-shadow: var(--shadow-md);
          transform: translateY(-1px);
        }

        .button-secondary {
          background: var(--color-neutral-100);
          color: var(--text-primary);
          border: 1px solid var(--border-light);
        }

        .button-secondary:hover:not(:disabled) {
          background: var(--color-neutral-200);
          border-color: var(--border-medium);
        }

        .button-outline {
          background: transparent;
          color: var(--color-primary);
          border: 2px solid var(--color-primary);
        }

        .button-outline:hover:not(:disabled) {
          background: var(--color-primary);
          color: var(--white);
        }

        .button-ghost {
          background: transparent;
          color: var(--text-primary);
        }

        .button-ghost:hover:not(:disabled) {
          background: var(--background-light);
        }

        .button-danger {
          background: var(--color-error);
          color: var(--white);
        }

        .button-danger:hover:not(:disabled) {
          background: var(--color-error-dark);
          transform: translateY(-1px);
        }

        .button-success {
          background: var(--color-success);
          color: var(--white);
        }

        .button-success:hover:not(:disabled) {
          background: var(--color-success-dark);
          transform: translateY(-1px);
        }

        .button-full-width {
          width: 100%;
        }

        .button-sm {
          padding: var(--space-xs) var(--space-sm);
          font-size: var(--text-sm);
          min-height: 32px;
        }

        .button-md {
          padding: var(--space-sm) var(--space-md);
          font-size: var(--text-sm);
          min-height: 40px;
        }

        .button-lg {
          padding: var(--space-md) var(--space-lg);
          font-size: var(--text-base);
          min-height: 48px;
        }

        .button-loading {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
        }

        .loading-spinner {
          width: 16px;
          height: 16px;
          border: 2px solid transparent;
          border-top: 2px solid currentColor;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        .button-icon {
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .button-text {
          display: flex;
          align-items: center;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        /* Focus states */
        .button-base:focus {
          outline: none;
          box-shadow: 0 0 0 3px var(--color-primary-light);
        }

        .button-outline:focus {
          box-shadow: 0 0 0 3px var(--color-primary-light);
        }

        .button-ghost:focus {
          box-shadow: 0 0 0 3px var(--color-neutral-300);
        }
      `}</style>
    </button>
  );
}; 