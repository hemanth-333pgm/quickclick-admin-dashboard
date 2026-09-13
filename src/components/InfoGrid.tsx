import React from 'react';

interface Props {
  items: Array<{ label: string; value: React.ReactNode }>;
  columns?: number;
}

const InfoGrid: React.FC<Props> = ({ items, columns = 2 }) => (
  <div
    style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(' + columns + ', 1fr)',
      gap: '10px 24px',
      fontSize: 13,
    }}
  >
    {items.map((it, i) => (
      <div key={i}>
        <div style={{ color: '#6b7280', fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.4 }}>
          {it.label}
        </div>
        <div style={{ marginTop: 2, color: '#111827' }}>{it.value || '—'}</div>
      </div>
    ))}
  </div>
);

export default InfoGrid;
