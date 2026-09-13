import React from 'react';

const StatCard: React.FC<{ label: string; value: string | number; accent?: string }> = ({
  label,
  value,
  accent = '#2563eb',
}) => (
  <div
    style={{
      background: '#fff',
      border: '1px solid #e5e7eb',
      borderLeft: `4px solid ${accent}`,
      borderRadius: 8,
      padding: 18,
      boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
    }}
  >
    <div style={{ fontSize: 12, color: '#6b7280', textTransform: 'uppercase', letterSpacing: 0.5 }}>
      {label}
    </div>
    <div style={{ fontSize: 26, fontWeight: 700, marginTop: 8, color: '#111827' }}>{value}</div>
  </div>
);

export default StatCard;
