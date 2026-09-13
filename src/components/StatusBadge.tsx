import React from 'react';

const colors: Record<string, { bg: string; fg: string }> = {
  // Order statuses
  PLACED:           { bg: '#dbeafe', fg: '#1e40af' },
  ACCEPTED:         { bg: '#dcfce7', fg: '#166534' },
  PREPARING:        { bg: '#fef3c7', fg: '#92400e' },
  READY_FOR_PICKUP: { bg: '#e0e7ff', fg: '#3730a3' },
  ASSIGNED:         { bg: '#ede9fe', fg: '#5b21b6' },
  PICKED_UP:        { bg: '#cffafe', fg: '#155e75' },
  OUT_FOR_DELIVERY: { bg: '#fed7aa', fg: '#9a3412' },
  DELIVERED:        { bg: '#bbf7d0', fg: '#065f46' },
  CANCELLED:        { bg: '#fecaca', fg: '#991b1b' },
  REJECTED:         { bg: '#fecaca', fg: '#991b1b' },
  // User / retailer / partner statuses
  ACTIVE:           { bg: '#dcfce7', fg: '#166534' },
  SUSPENDED:        { bg: '#fecaca', fg: '#991b1b' },
  PENDING:          { bg: '#fef3c7', fg: '#92400e' },
  APPROVED:         { bg: '#dcfce7', fg: '#166534' },
  ONLINE:           { bg: '#dcfce7', fg: '#166534' },
  OFFLINE:          { bg: '#e5e7eb', fg: '#374151' },
  BUSY:             { bg: '#fed7aa', fg: '#9a3412' },
  BREAK:            { bg: '#fef3c7', fg: '#92400e' },
};

const StatusBadge: React.FC<{ status?: string }> = ({ status }) => {
  if (!status) return null;
  const c = colors[status] || { bg: '#e5e7eb', fg: '#374151' };
  return (
    <span
      style={{
        background: c.bg,
        color: c.fg,
        padding: '2px 10px',
        borderRadius: 12,
        fontSize: 11,
        fontWeight: 600,
        letterSpacing: 0.3,
        display: 'inline-block',
      }}
    >
      {status}
    </span>
  );
};

export default StatusBadge;
