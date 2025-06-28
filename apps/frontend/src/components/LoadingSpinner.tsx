'use client';

import React from 'react';

interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large';
  text?: string;
  fullScreen?: boolean;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'medium', 
  text = 'Зареждане...', 
  fullScreen = false 
}) => {
  const sizeMap = {
    small: { spinner: '16px', text: '12px' },
    medium: { spinner: '24px', text: '14px' },
    large: { spinner: '32px', text: '16px' }
  };

  const containerStyle: React.CSSProperties = fullScreen ? {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(255, 255, 255, 0.9)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
    flexDirection: 'column',
    gap: '12px'
  } : {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px',
    flexDirection: 'column',
    gap: '8px'
  };

  return (
    <div style={containerStyle}>
      <div
        style={{
          width: sizeMap[size].spinner,
          height: sizeMap[size].spinner,
          border: '2px solid #f3f3f3',
          borderTop: '2px solid #3b82f6',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }}
      />
      {text && (
        <div
          style={{
            fontSize: sizeMap[size].text,
            color: '#6b7280',
            fontWeight: '500'
          }}
        >
          {text}
        </div>
      )}
      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}; 