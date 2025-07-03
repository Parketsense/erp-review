import React from 'react';
import { LucideIcon } from 'lucide-react';

interface CardProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  icon?: LucideIcon;
  actions?: React.ReactNode;
  className?: string;
  hover?: boolean;
  headerColor?: 'default' | 'primary' | 'success' | 'warning' | 'danger';
}

const Card: React.FC<CardProps> = ({
  children,
  title,
  subtitle,
  icon: Icon,
  actions,
  className = '',
  hover = true,
  headerColor = 'default'
}) => {
  const headerColors = {
    default: 'var(--color-neutral-800)',
    primary: 'var(--color-primary)',
    success: 'var(--color-success)',
    warning: 'var(--color-warning)',
    danger: 'var(--color-error)'
  };

  return (
    <div className={`card ${hover ? 'card-hover' : ''} ${className}`}>
      {(title || subtitle || Icon) && (
        <div className="card-header" style={{ backgroundColor: headerColors[headerColor] }}>
          <div className="card-header-content">
            {Icon && <Icon className="card-header-icon" />}
            <div className="card-header-text">
              {title && <h3 className="card-title">{title}</h3>}
              {subtitle && <p className="card-subtitle">{subtitle}</p>}
            </div>
          </div>
          {actions && (
            <div className="card-actions">
              {actions}
            </div>
          )}
        </div>
      )}
      <div className="card-body">
        {children}
      </div>

      <style jsx>{`
        .card {
          background: var(--background-white);
          border-radius: var(--radius-lg);
          box-shadow: var(--shadow-sm);
          border: 1px solid var(--border-light);
          overflow: hidden;
          transition: all 0.2s ease;
        }

        .card-hover:hover {
          box-shadow: var(--shadow-md);
          transform: translateY(-2px);
        }

        .card-header {
          padding: var(--space-lg);
          color: var(--white);
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .card-header-content {
          display: flex;
          align-items: center;
          gap: var(--space-md);
        }

        .card-header-icon {
          width: 20px;
          height: 20px;
          opacity: 0.9;
        }

        .card-header-text {
          display: flex;
          flex-direction: column;
          gap: var(--space-xs);
        }

        .card-title {
          font-size: var(--text-lg);
          font-weight: var(--font-semibold);
          margin: 0;
        }

        .card-subtitle {
          font-size: var(--text-sm);
          opacity: 0.9;
          margin: 0;
        }

        .card-actions {
          display: flex;
          align-items: center;
          gap: var(--space-sm);
        }

        .card-body {
          padding: var(--space-lg);
        }

        /* Responsive */
        @media (max-width: 768px) {
          .card-header {
            padding: var(--space-md);
            flex-direction: column;
            align-items: flex-start;
            gap: var(--space-md);
          }

          .card-actions {
            width: 100%;
            justify-content: flex-end;
          }

          .card-body {
            padding: var(--space-md);
          }
        }
      `}</style>
    </div>
  );
};

export default Card; 