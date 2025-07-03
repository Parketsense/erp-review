import React from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showCloseButton?: boolean;
  className?: string;
}

const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  showCloseButton = true,
  className = ''
}) => {
  if (!isOpen) return null;

  const sizes = {
    sm: 'modal-sm',
    md: 'modal-md',
    lg: 'modal-lg',
    xl: 'modal-xl'
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className={`modal-container ${sizes[size]} ${className}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <h3 className="modal-title">{title}</h3>
          {showCloseButton && (
            <button 
              onClick={onClose} 
              className="modal-close"
              aria-label="Затвори"
            >
              <X className="modal-close-icon" />
            </button>
          )}
        </div>
        <div className="modal-body">
          {children}
        </div>
      </div>

      <style jsx>{`
        .modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: var(--space-lg);
        }

        .modal-container {
          background: var(--background-white);
          border-radius: var(--radius-lg);
          box-shadow: var(--shadow-xl);
          max-height: 90vh;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          width: 100%;
        }

        .modal-sm {
          max-width: 400px;
        }

        .modal-md {
          max-width: 600px;
        }

        .modal-lg {
          max-width: 800px;
        }

        .modal-xl {
          max-width: 1200px;
        }

        .modal-header {
          padding: var(--space-lg);
          border-bottom: 1px solid var(--border-light);
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: var(--background-light);
        }

        .modal-title {
          font-size: var(--text-lg);
          font-weight: var(--font-semibold);
          color: var(--text-primary);
          margin: 0;
        }

        .modal-close {
          background: transparent;
          border: none;
          border-radius: var(--radius-md);
          padding: var(--space-xs);
          cursor: pointer;
          transition: background-color 0.2s ease;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .modal-close:hover {
          background: var(--background-light);
        }

        .modal-close-icon {
          width: 24px;
          height: 24px;
          color: var(--text-secondary);
        }

        .modal-body {
          padding: var(--space-lg);
          overflow-y: auto;
          flex: 1;
        }

        /* Responsive */
        @media (max-width: 768px) {
          .modal-overlay {
            padding: var(--space-md);
          }

          .modal-header {
            padding: var(--space-md);
          }

          .modal-body {
            padding: var(--space-md);
          }

          .modal-sm,
          .modal-md,
          .modal-lg,
          .modal-xl {
            max-width: 100%;
          }
        }
      `}</style>
    </div>
  );
};

export default Modal; 