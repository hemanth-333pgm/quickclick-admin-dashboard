import React from 'react';

interface Props {
  open: boolean;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  width?: number;
}

const DetailPanel: React.FC<Props> = ({ open, title, onClose, children, width = 720 }) => {
  if (!open) return null;
  return (
    <div
      style={{
        position: 'fixed',
        top: 0, left: 0, right: 0, bottom: 0,
        background: 'rgba(15,23,42,0.5)',
        zIndex: 1000,
        display: 'flex',
        justifyContent: 'flex-end',
      }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width,
          maxWidth: '100%',
          background: '#fff',
          height: '100vh',
          overflowY: 'auto',
          boxShadow: '-8px 0 24px rgba(0,0,0,0.15)',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '16px 20px',
            borderBottom: '1px solid #e5e7eb',
            position: 'sticky',
            top: 0,
            background: '#fff',
            zIndex: 1,
          }}
        >
          <h2 style={{ margin: 0, fontSize: 18 }}>{title}</h2>
          <button
            onClick={onClose}
            style={{ border: 0, background: 'transparent', fontSize: 20, cursor: 'pointer' }}
          >
            ✕
          </button>
        </div>
        <div style={{ padding: 20, flex: 1 }}>{children}</div>
      </div>
    </div>
  );
};

export default DetailPanel;
