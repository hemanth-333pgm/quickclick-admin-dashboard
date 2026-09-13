import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { adminUsersApi } from '../api/users.api';
import { getErrorMessage } from '../api/axiosClient';
import StatusBadge from '../components/StatusBadge';
import InfoGrid from '../components/InfoGrid';
import toast from 'react-hot-toast';

const extractList = (data: any): any[] => {
  if (Array.isArray(data)) return data;
  if (!data || typeof data !== 'object') return [];
  for (const k of ['orders','results','items','list','rows','docs']) {
    if (Array.isArray(data[k])) return data[k];
  }
  for (const v of Object.values(data)) if (Array.isArray(v)) return v as any[];
  return [];
};

// Extract the customer id from an order. The backend returns userId as a
// populated object `{ _id, name, mobile }`, but we also handle plain strings
// and every alternative field name.
const orderUserId = (o: any): string | undefined => {
  if (!o || typeof o !== 'object') return undefined;
  const candidates = [o.userId, o.user_id, o.customerId, o.customer_id, o.user, o.customer, o.placedBy, o.buyerId, o.buyer];
  for (const c of candidates) {
    if (!c) continue;
    if (typeof c === 'string') return c;
    if (typeof c === 'object') {
      const id = c._id || c.id;
      if (id) return String(id);
    }
  }
  return undefined;
};

const CustomerDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [showWarning, setShowWarning] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        const [uRes, oRes] = await Promise.all([
          adminUsersApi.getOne(id).catch(() => null),
          adminUsersApi.ordersByUser(id).catch(() => null),
        ]);
        if (uRes) setUser((uRes.data as any).data);
        if (oRes) {
          const all = extractList((oRes.data as any).data);
          const mine = all.filter((o) => {
            const uid = orderUserId(o);
            return uid ? String(uid) === String(id) : false;
          });
          if (mine.length > 0 || all.length === 0) {
            setOrders(mine);
            setShowWarning(false);
          } else {
            setOrders(all);
            setShowWarning(true);
          }
        }
      } catch (e) {
        toast.error(getErrorMessage(e));
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  if (loading) return <div>Loading customer...</div>;
  if (!user) return <div>Customer not found. <button onClick={() => navigate(-1)}>Go back</button></div>;

  const totalSpend = orders.filter((o) => o.status === 'DELIVERED').reduce((s, o) => s + (o.total || 0), 0);

  const setUserStatus = async (s: string) => {
    if (!confirm('Set customer status to ' + s + '?')) return;
    try {
      await adminUsersApi.updateStatus(id!, s, 'Admin action');
      setUser({ ...user, status: s });
      toast.success('Updated');
    } catch (e) { toast.error(getErrorMessage(e)); }
  };

  return (
    <div>
      <button onClick={() => navigate(-1)} style={{ marginBottom: 16 }}>← Back</button>
      <h1 style={{ marginTop: 0 }}>{user.name} <StatusBadge status={user.status} /></h1>
      <p style={{ color: '#6b7280', fontSize: 13 }}>{user.role} · joined {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : '—'}</p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12, margin: '20px 0' }}>
        <Stat label="Total Orders" value={orders.length} />
        <Stat label="Delivered" value={orders.filter((o) => o.status === 'DELIVERED').length} accent="#16a34a" />
        <Stat label="Cancelled" value={orders.filter((o) => o.status === 'CANCELLED').length} accent="#dc2626" />
        <Stat label="Total Spend" value={'₹' + totalSpend} accent="#f59e0b" />
      </div>

      <Section title="Profile">
        <InfoGrid items={[
          { label: 'Mobile', value: user.mobile },
          { label: 'Email', value: user.email || '—' },
          { label: 'Role', value: user.role },
          { label: 'Status', value: <StatusBadge status={user.status} /> },
          { label: 'User ID', value: <code style={{ fontSize: 11 }}>{user._id || user.id}</code> },
          { label: 'Joined', value: user.createdAt ? new Date(user.createdAt).toLocaleString() : '—' },
        ]} />
        <div style={{ marginTop: 16 }}>
          {user.status !== 'SUSPENDED'
            ? <button onClick={() => setUserStatus('SUSPENDED')} style={{ background: '#dc2626', color: '#fff', border: 0 }}>Suspend</button>
            : <button onClick={() => setUserStatus('ACTIVE')} style={{ background: '#16a34a', color: '#fff', border: 0 }}>Activate</button>}
        </div>
      </Section>

      <Section title={'Orders (' + orders.length + ')'}>
        {showWarning && (
          <div style={{ padding: 12, background: '#fef3c7', color: '#92400e', borderRadius: 6, fontSize: 12, marginBottom: 12 }}>
            ⚠ Could not match orders to this customer — showing all orders.
          </div>
        )}
        {orders.length === 0 ? (
          <div style={{ color: '#9ca3af', padding: 16, textAlign: 'center' }}>No orders yet</div>
        ) : (
          <table width="100%" cellPadding={8} style={{ fontSize: 13 }}>
            <thead style={{ background: '#f3f4f6', textAlign: 'left', fontSize: 11 }}>
              <tr><th>Order #</th><th>Status</th><th>Total</th><th>Payment</th><th>Date</th><th></th></tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o._id} style={{ borderTop: '1px solid #eee' }}>
                  <td><code>{o.orderNumber}</code></td>
                  <td><StatusBadge status={o.status} /></td>
                  <td>₹{o.total}</td>
                  <td>{o.paymentMethod} ({o.paymentStatus || 'PENDING'})</td>
                  <td>{new Date(o.createdAt).toLocaleString()}</td>
                  <td><button onClick={() => navigate('/orders/' + o._id)}>View</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Section>
    </div>
  );
};

const Stat: React.FC<{ label: string; value: any; accent?: string }> = ({ label, value, accent = '#2563eb' }) => (
  <div style={{ background: '#fff', padding: 14, borderRadius: 8, borderLeft: '3px solid ' + accent }}>
    <div style={{ fontSize: 11, color: '#6b7280', textTransform: 'uppercase' }}>{label}</div>
    <div style={{ fontSize: 22, fontWeight: 700, marginTop: 4 }}>{value}</div>
  </div>
);

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div style={{ background: '#fff', borderRadius: 8, padding: 18, marginBottom: 16 }}>
    <h3 style={{ marginTop: 0, marginBottom: 12, fontSize: 15 }}>{title}</h3>
    {children}
  </div>
);

export default CustomerDetail;
