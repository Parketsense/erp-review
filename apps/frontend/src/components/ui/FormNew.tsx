import React from 'react';
import { LucideIcon } from 'lucide-react';

interface InputProps {
  label?: string;
  placeholder?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  type?: string;
  required?: boolean;
  error?: string;
  success?: string;
  icon?: LucideIcon;
  disabled?: boolean;
  className?: string;
}

export const Input: React.FC<InputProps> = ({
  label,
  placeholder,
  value,
  onChange,
  type = 'text',
  required = false,
  error,
  success,
  icon: Icon,
  disabled = false,
  className = ''
}) => {
  return (
    <div className={`form-group ${className}`}>
      {label && (
        <label className="form-label">
          {label}
          {required && <span className="required-mark">*</span>}
        </label>
      )}
      <div className="input-wrapper">
        {Icon && (
          <div className="input-icon">
            <Icon className="icon" />
          </div>
        )}
        <input
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          className={`
            form-input
            ${Icon ? 'has-icon' : ''}
            ${error ? 'error' : success ? 'success' : ''}
          `}
        />
      </div>
      {error && (
        <p className="form-error">
          <span className="error-icon">⚠️</span>
          {error}
        </p>
      )}
      {success && (
        <p className="form-success">
          <span className="success-icon">✓</span>
          {success}
        </p>
      )}

      <style jsx>{`
        .form-group {
          margin-bottom: var(--space-md);
        }

        .form-label {
          display: block;
          font-size: var(--text-sm);
          font-weight: var(--font-medium);
          color: var(--text-primary);
          margin-bottom: var(--space-xs);
        }

        .required-mark {
          color: var(--color-error);
          margin-left: var(--space-xs);
        }

        .input-wrapper {
          position: relative;
        }

        .input-icon {
          position: absolute;
          left: var(--space-sm);
          top: 50%;
          transform: translateY(-50%);
          color: var(--text-secondary);
          z-index: 1;
        }

        .icon {
          width: 16px;
          height: 16px;
        }

        .form-input {
          width: 100%;
          padding: var(--space-sm) var(--space-md);
          border: 1px solid var(--border-light);
          border-radius: var(--radius-md);
          font-size: var(--text-sm);
          font-family: var(--font-family);
          background: var(--background-white);
          color: var(--text-primary);
          transition: all 0.2s ease;
        }

        .form-input.has-icon {
          padding-left: calc(var(--space-md) + 16px + var(--space-sm));
        }

        .form-input:focus {
          outline: none;
          border-color: var(--color-primary);
          box-shadow: 0 0 0 3px var(--color-primary-light);
        }

        .form-input:disabled {
          background: var(--background-light);
          color: var(--text-secondary);
          cursor: not-allowed;
        }

        .form-input.error {
          border-color: var(--color-error);
        }

        .form-input.error:focus {
          box-shadow: 0 0 0 3px var(--color-error-light);
        }

        .form-input.success {
          border-color: var(--color-success);
        }

        .form-input.success:focus {
          box-shadow: 0 0 0 3px var(--color-success-light);
        }

        .form-error {
          font-size: var(--text-xs);
          color: var(--color-error);
          margin-top: var(--space-xs);
          display: flex;
          align-items: center;
          gap: var(--space-xs);
        }

        .error-icon {
          font-size: var(--text-xs);
        }

        .form-success {
          font-size: var(--text-xs);
          color: var(--color-success);
          margin-top: var(--space-xs);
          display: flex;
          align-items: center;
          gap: var(--space-xs);
        }

        .success-icon {
          font-size: var(--text-xs);
        }
      `}</style>
    </div>
  );
};

interface SelectProps {
  label?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  required?: boolean;
  error?: string;
  disabled?: boolean;
  className?: string;
  children: React.ReactNode;
}

export const Select: React.FC<SelectProps> = ({
  label,
  value,
  onChange,
  required = false,
  error,
  disabled = false,
  className = '',
  children
}) => {
  return (
    <div className={`form-group ${className}`}>
      {label && (
        <label className="form-label">
          {label}
          {required && <span className="required-mark">*</span>}
        </label>
      )}
      <select
        value={value}
        onChange={onChange}
        disabled={disabled}
        className={`form-select ${error ? 'error' : ''}`}
      >
        {children}
      </select>
      {error && (
        <p className="form-error">
          <span className="error-icon">⚠️</span>
          {error}
        </p>
      )}

      <style jsx>{`
        .form-select {
          width: 100%;
          padding: var(--space-sm) var(--space-md);
          border: 1px solid var(--border-light);
          border-radius: var(--radius-md);
          font-size: var(--text-sm);
          font-family: var(--font-family);
          background: var(--background-white);
          color: var(--text-primary);
          transition: all 0.2s ease;
          cursor: pointer;
        }

        .form-select:focus {
          outline: none;
          border-color: var(--color-primary);
          box-shadow: 0 0 0 3px var(--color-primary-light);
        }

        .form-select:disabled {
          background: var(--background-light);
          color: var(--text-secondary);
          cursor: not-allowed;
        }

        .form-select.error {
          border-color: var(--color-error);
        }

        .form-select.error:focus {
          box-shadow: 0 0 0 3px var(--color-error-light);
        }
      `}</style>
    </div>
  );
};

interface TextareaProps {
  label?: string;
  placeholder?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  required?: boolean;
  error?: string;
  disabled?: boolean;
  rows?: number;
  className?: string;
}

export const Textarea: React.FC<TextareaProps> = ({
  label,
  placeholder,
  value,
  onChange,
  required = false,
  error,
  disabled = false,
  rows = 3,
  className = ''
}) => {
  return (
    <div className={`form-group ${className}`}>
      {label && (
        <label className="form-label">
          {label}
          {required && <span className="required-mark">*</span>}
        </label>
      )}
      <textarea
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        rows={rows}
        className={`form-textarea ${error ? 'error' : ''}`}
      />
      {error && (
        <p className="form-error">
          <span className="error-icon">⚠️</span>
          {error}
        </p>
      )}

      <style jsx>{`
        .form-textarea {
          width: 100%;
          padding: var(--space-sm) var(--space-md);
          border: 1px solid var(--border-light);
          border-radius: var(--radius-md);
          font-size: var(--text-sm);
          font-family: var(--font-family);
          background: var(--background-white);
          color: var(--text-primary);
          transition: all 0.2s ease;
          resize: vertical;
          min-height: 80px;
        }

        .form-textarea:focus {
          outline: none;
          border-color: var(--color-primary);
          box-shadow: 0 0 0 3px var(--color-primary-light);
        }

        .form-textarea:disabled {
          background: var(--background-light);
          color: var(--text-secondary);
          cursor: not-allowed;
        }

        .form-textarea.error {
          border-color: var(--color-error);
        }

        .form-textarea.error:focus {
          box-shadow: 0 0 0 3px var(--color-error-light);
        }
      `}</style>
    </div>
  );
};

interface CheckboxProps {
  label: string;
  checked?: boolean;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  disabled?: boolean;
  className?: string;
}

export const Checkbox: React.FC<CheckboxProps> = ({
  label,
  checked,
  onChange,
  disabled = false,
  className = ''
}) => {
  return (
    <div className={`checkbox-group ${className}`}>
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        disabled={disabled}
        className="checkbox-input"
      />
      <label className="checkbox-label">
        {label}
      </label>

      <style jsx>{`
        .checkbox-group {
          display: flex;
          align-items: center;
          gap: var(--space-sm);
          margin-bottom: var(--space-sm);
        }

        .checkbox-input {
          width: 16px;
          height: 16px;
          border: 2px solid var(--border-light);
          border-radius: var(--radius-sm);
          background: var(--background-white);
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .checkbox-input:checked {
          background: var(--color-primary);
          border-color: var(--color-primary);
        }

        .checkbox-input:focus {
          outline: none;
          box-shadow: 0 0 0 3px var(--color-primary-light);
        }

        .checkbox-input:disabled {
          background: var(--background-light);
          border-color: var(--border-light);
          cursor: not-allowed;
        }

        .checkbox-label {
          font-size: var(--text-sm);
          color: var(--text-primary);
          cursor: pointer;
          user-select: none;
        }
      `}</style>
    </div>
  );
};

interface FormRowProps {
  children: React.ReactNode;
  className?: string;
}

export const FormRow: React.FC<FormRowProps> = ({
  children,
  className = ''
}) => {
  return (
    <div className={`form-row ${className}`}>
      {children}

      <style jsx>{`
        .form-row {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: var(--space-md);
          margin-bottom: var(--space-md);
        }

        @media (max-width: 768px) {
          .form-row {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}; 