import React from 'react';
import StatusBadge from './StatusBadge';

const FLOW = [
  'PLACED',
  'ACCEPTED',
  'PREPARING',
  'READY_FOR_PICKUP',
  'ASSIGNED',
  'PICKED_UP',
  'OUT_FOR_DELIVERY',
  'DELIVERED',
];

const OrderTimeline: React.FC<{ current: string }> = ({ current }) => {
  if (current === 'CANCELLED' || current === 'REJECTED') {
    return (
      <div style={{ padding: 12, background: '#fef2f2', borderRadius: 8, color: '#991b1b', fontSize: 13 }}>
        Order ended with status <StatusBadge status={current} />
      </div>
    );
  }
  const idx = FLOW.indexOf(current);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {FLOW.map((step, i) => {
        const done = i <= idx;
        const isCurrent = i === idx;
        return (
          <div key={step} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div
              style={{
                width: 22, height: 22, borderRadius: '50%',
                background: done ? (isCurrent ? '#2563eb' : '#22c55e') : '#e5e7eb',
                color: '#fff',
                fontSize: 11,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 700,
                flexShrink: 0,
              }}
            >
              {done ? '✓' : i + 1}
            </div>
            <div style={{ fontSize: 13, color: done ? '#111827' : '#9ca3af', fontWeight: isCurrent ? 700 : 400 }}>
              {step}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default OrderTimeline;
