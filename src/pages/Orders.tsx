import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminOrdersApi } from '../api/orders.api';
import { adminDeliveryApi } from '../api/delivery.api';
import { getErrorMessage } from '../api/axiosClient';
import StatusBadge from '../components/StatusBadge';
import toast from 'react-hot-toast';

const extractList = (data: any): any[] => {
  if (Array.isArray(data)) return data;
  if (!data || typeof data !== 'object') return [];
  for (const key of ['orders', 'results', 'items', 'list', 'rows', 'docs']) {
    if (Array.isArray(data[key])) return data[key];
  }
  for (const v of Object.values(data)) if (Array.isArray(v)) return v as any[];
  return [];
};

const Orders: React.FC = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<any[]>([]);
  const [status, setStatus] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [loading, setLoading] = useState(false);

  const [partners, setPartners] = useState<any[]>([]);
  const [assigning, setAssigning] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const res = await adminOrdersApi.list({ status, dateFrom, dateTo, page: 1, limit: 50 });
      setOrders(extractList((res.data as any).data));
    } catch (e) { toast.error(getErrorMessage(e)); setOrders([]); }
    finally { setLoading(false); }
  };

  const loadPartners = async () => {
    try {
      const res = await adminDeliveryApi.list({ status: 'APPROVED' });
      setPartners(extractList((res.data as any).data));
    } catch { /* ignore */ }
  };

  useEffect(() => { load(); loadPartners(); }, [status, dateFrom, dateTo]);

  const assign = async (orderId: string, partnerId: string) => {
    try {
      await adminOrdersApi.assign(orderId, partnerId);
      toast.success('Delivery partner assigned');
      setAssigning(null); load();
    } catch (e) { toast.error(getErrorMessage(e)); }
  };

  return (
    <div>
      <h1 style={{ marginTop: 0 }}>Orders</h1>
      <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
        <select value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">All statuses</option>
          <option value="PLACED">Placed</option>
          <option value="ACCEPTED">Accepted</option>
          <option value="PREPARING">Preparing</option>
          <option value="READY_FOR_PICKUP">Ready for pickup</option>
          <option value="ASSIGNED">Assigned</option>
          <option value="PICKED_UP">Picked up</option>
          <option value="OUT_FOR_DELIVERY">Out for delivery</option>
          <option value="DELIVERED">Delivered</option>
          <option value="CANCELLED">Cancelled</option>
        </select>
        <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
        <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
      </div>
      {loading ? <div>Loading...</div> : (
        <div style={{ background: '#fff', borderRadius: 8, overflow: 'hidden' }}>
          <table width="100%" cellPadding={10}>
            <thead style={{ background: '#f3f4f6', textAlign: 'left', fontSize: 12 }}>
              <tr><th>Order #</th><th>Status</th><th>Total</th><th>Payment</th><th>Created</th><th>Action</th></tr>
            </thead>
            <tbody>
              {orders.length === 0 && (<tr><td colSpan={6} style={{ textAlign: 'center', color: '#9ca3af', padding: 24 }}>No orders</td></tr>)}
              {orders.map((o) => (
                <tr key={o._id} style={{ borderTop: '1px solid #eee', fontSize: 13 }}>
                  <td>
                    <a
                      onClick={() => navigate('/orders/' + o._id)}
                      style={{ color: '#2563eb', cursor: 'pointer', fontWeight: 600 }}
                    >
                      {o.orderNumber}
                    </a>
                  </td>
                  <td><StatusBadge status={o.status} /></td>
                  <td>₹{o.total}</td>
                  <td>{o.paymentMethod} ({o.paymentStatus || 'PENDING'})</td>
                  <td>{new Date(o.createdAt).toLocaleString()}</td>
                  <td>
                    <button onClick={() => navigate('/orders/' + o._id)}>View</button>{' '}
                    {['PLACED', 'ACCEPTED', 'PREPARING', 'READY_FOR_PICKUP'].indexOf(o.status) !== -1 && (
                      assigning === o._id ? (
                        <select onChange={(e) => e.target.value && assign(o._id, e.target.value)} defaultValue="">
                          <option value="" disabled>Pick partner...</option>
                          {partners.map((p) => (
                            <option key={p._id} value={p._id}>{p.phone} ({p.vehicleNumber})</option>
                          ))}
                        </select>
                      ) : (
                        <button onClick={() => setAssigning(o._id)}>Assign</button>
                      )
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Orders;
