import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const linkStyle = ({ isActive }: { isActive: boolean }): React.CSSProperties => ({
  display: 'block',
  padding: '10px 14px',
  color: isActive ? '#fff' : '#cbd5e1',
  background: isActive ? '#2563eb' : 'transparent',
  borderRadius: 6,
  textDecoration: 'none',
  marginBottom: 4,
  fontSize: 14,
});

const Sidebar: React.FC = () => {
  const { user, logout } = useAuth();
  return (
    <aside
      style={{
        width: 240,
        background: '#0f172a',
        color: '#fff',
        minHeight: '100vh',
        padding: 16,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <div style={{ fontSize: 20, fontWeight: 700, marginBottom: 24, color: '#60a5fa' }}>
        QuickClick
      </div>
      <nav style={{ flex: 1 }}>
        <NavLink to="/" style={linkStyle} end>📊 Dashboard</NavLink>
        <NavLink to="/users" style={linkStyle}>👥 Users</NavLink>
        <NavLink to="/retailers" style={linkStyle}>🏪 Retailers</NavLink>
        <NavLink to="/delivery-partners" style={linkStyle}>🚴 Delivery Partners</NavLink>
        <NavLink to="/orders" style={linkStyle}>📦 Orders</NavLink>
        <NavLink to="/categories" style={linkStyle}>🗂️ Categories</NavLink>
        <NavLink to="/coupons" style={linkStyle}>🎟️ Coupons</NavLink>
      </nav>
      <div style={{ borderTop: '1px solid #1e293b', paddingTop: 12, fontSize: 12, color: '#94a3b8' }}>
        <div style={{ fontWeight: 600, color: '#e2e8f0' }}>{user?.name}</div>
        <div>{user?.mobile}</div>
        <div style={{ marginTop: 2, color: '#60a5fa' }}>{user?.role}</div>
        <button
          onClick={logout}
          style={{
            marginTop: 10,
            padding: '6px 10px',
            background: '#dc2626',
            color: '#fff',
            border: 0,
            borderRadius: 4,
            cursor: 'pointer',
            width: '100%',
          }}
        >
          Logout
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
