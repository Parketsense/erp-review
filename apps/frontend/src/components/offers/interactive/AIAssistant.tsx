import React from 'react';

const AIAssistant: React.FC = () => {
  return (
    <div style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 9999 }}>
      <button className="btn btn-success" style={{ borderRadius: '50%', width: 56, height: 56, boxShadow: '0 4px 16px rgba(0,0,0,0.12)' }}>
        🤖
      </button>
      {/* TODO: Add chat modal logic */}
    </div>
  );
};

export default AIAssistant; 