import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { adminOrdersApi } from '../api/orders.api';
import { adminDeliveryApi } from '../api/delivery.api';
import { getErrorMessage } from '../api/axiosClient';
import StatusBadge from '../components/StatusBadge';
import InfoGrid from '../components/InfoGrid';
import OrderTimeline from '../components/OrderTimeline';
import toast from 'react-hot-toast';

const extractList = (data: any): any[] => {
  if (Array.isArray(data)) return data;
  if (!data || typeof data !== 'object') return [];
  for (const k of ['orders','deliveryPartners','partners','results','items','list']) {
    if (Array.isArray(data[k])) return data[k];
  }
  for (const v of Object.values(data)) if (Array.isArray(v)) return v as any[];
  return [];
};

// Safely stringify a value that might be a populated object, a raw id, or a primitive
const s = (v: any, field = 'name'): string => {
  if (v == null) return '—';
  if (typeof v === 'string' || typeof v === 'number') return String(v);
  if (typeof v === 'object') {
    return String(v[field] || v.name || v.shopName || v.phone || v._id || v.id || '—');
  }
  return '—';
};

const OrderDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [order, setOrder] = useState<any>(null);
  const [partners, setPartners] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [assigning, setAssigning] = useState(false);

  useEffect(() => {
    if (!id) { setError('No order id'); setLoading(false); return; }
    (async () => {
      try {
        const [oRes, pRes] = await Promise.all([
          adminOrdersApi.getOne(id),
          adminDeliveryApi.list({ status: 'APPROVED', limit: 100 }).catch(() => null),
        ]);
        const o = (oRes.data as any).data;
        if (!o) throw new Error('Order not found');
        setOrder(o);
        if (pRes) setPartners(extractList((pRes.data as any).data));
      } catch (e) {
        const msg = getErrorMessage(e);
        setError(msg);
        toast.error(msg);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  if (loading) return <div style={{ padding: 24 }}>Loading order...</div>;
  if (error || !order) {
    return (
      <div style={{ padding: 24 }}>
        <button onClick={() => navigate(-1)} style={{ marginBottom: 16 }}>← Back</button>
        <div style={{ background: '#fef2f2', color: '#991b1b', padding: 20, borderRadius: 8 }}>
          <strong>Could not load order.</strong>
          <div style={{ marginTop: 8, fontSize: 13 }}>{error || 'Unknown error'}</div>
        </div>
      </div>
    );
  }

  const items = Array.isArray(order.items) ? order.items : [];
  const statusHistory = Array.isArray(order.statusHistory) ? order.statusHistory : [];

  const assign = async (partnerId: string) => {
    try {
      setAssigning(true);
      await adminOrdersApi.assign(id!, partnerId);
      toast.success('Assigned');
      const res = await adminOrdersApi.getOne(id!);
      setOrder((res.data as any).data);
    } catch (e) { toast.error(getErrorMessage(e)); }
    finally { setAssigning(false); }
  };

  const customerLine = order.userId && typeof order.userId === 'object'
    ? (s(order.userId) + (order.userId.mobile ? ' · ' + order.userId.mobile : ''))
    : s(order.userId);
  const retailerLine = order.retailerId && typeof order.retailerId === 'object'
    ? (s(order.retailerId, 'shopName') + (order.retailerId.phone ? ' · ' + order.retailerId.phone : ''))
    : s(order.retailerId);
  const partnerLine = order.deliveryPartnerId
    ? (typeof order.deliveryPartnerId === 'object'
        ? (s(order.deliveryPartnerId, 'phone') + ' · ' + s(order.deliveryPartnerId, 'vehicleNumber'))
        : s(order.deliveryPartnerId))
    : null;

  return (
    <div>
      <button onClick={() => navigate(-1)} style={{ marginBottom: 16 }}>← Back</button>
      <h1 style={{ marginTop: 0 }}>
        Order <code>{s(order.orderNumber)}</code> <StatusBadge status={order.status} />
      </h1>
      <p style={{ color: '#6b7280', fontSize: 13 }}>
        Placed {order.createdAt ? new Date(order.createdAt).toLocaleString() : '—'}
        {order.updatedAt ? ' · Updated ' + new Date(order.updatedAt).toLocaleString() : ''}
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,2fr) minmax(280px,1fr)', gap: 16, marginTop: 20 }}>
        <div>
          <Section title="Items">
            {items.length === 0 ? (
              <div style={{ color: '#9ca3af' }}>No items</div>
            ) : (
              <table width="100%" cellPadding={8} style={{ fontSize: 13 }}>
                <thead style={{ background: '#f3f4f6', textAlign: 'left', fontSize: 11 }}>
                  <tr><th>Item</th><th>Price</th><th>Qty</th><th style={{ textAlign: 'right' }}>Subtotal</th></tr>
                </thead>
                <tbody>
                  {items.map((it: any, i: number) => {
                    const price = Number(it.price ?? it.priceSnapshot ?? 0);
                    const qty = Number(it.quantity ?? 0);
                    return (
                      <tr key={it._id || i} style={{ borderTop: '1px solid #eee' }}>
                        <td>{s(it.name || it.nameSnapshot)}</td>
                        <td>₹{price}</td>
                        <td>{qty}</td>
                        <td style={{ textAlign: 'right' }}>₹{price * qty}</td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot>
                  <tr><td colSpan={3} style={{ textAlign: 'right', paddingTop: 10 }}>Subtotal</td><td style={{ textAlign: 'right', paddingTop: 10 }}>₹{Number(order.subtotal ?? 0)}</td></tr>
                  <tr><td colSpan={3} style={{ textAlign: 'right' }}>Delivery Fee</td><td style={{ textAlign: 'right' }}>₹{Number(order.deliveryFee ?? 0)}</td></tr>
                  {order.platformFee ? <tr><td colSpan={3} style={{ textAlign: 'right' }}>Platform Fee</td><td style={{ textAlign: 'right' }}>₹{Number(order.platformFee)}</td></tr> : null}
                  {order.discount ? <tr><td colSpan={3} style={{ textAlign: 'right' }}>Discount</td><td style={{ textAlign: 'right' }}>-₹{Number(order.discount)}</td></tr> : null}
                  {order.tax ? <tr><td colSpan={3} style={{ textAlign: 'right' }}>Tax</td><td style={{ textAlign: 'right' }}>₹{Number(order.tax)}</td></tr> : null}
                  <tr><td colSpan={3} style={{ textAlign: 'right', fontWeight: 700, paddingTop: 8 }}>Total</td><td style={{ textAlign: 'right', fontWeight: 700, paddingTop: 8 }}>₹{Number(order.total ?? 0)}</td></tr>
                </tfoot>
              </table>
            )}
          </Section>

          <Section title="Delivery Address">
            {order.addressSnapshot ? (
              <InfoGrid columns={2} items={[
                { label: 'Line 1', value: s(order.addressSnapshot.line1) },
                { label: 'Line 2', value: s(order.addressSnapshot.line2) },
                { label: 'City', value: s(order.addressSnapshot.city) },
                { label: 'State', value: s(order.addressSnapshot.state) },
                { label: 'Pincode', value: s(order.addressSnapshot.postalCode) },
                { label: 'Coordinates', value: order.addressSnapshot.latitude ? order.addressSnapshot.latitude + ', ' + order.addressSnapshot.longitude : '—' },
              ]} />
            ) : order.address ? (
              <InfoGrid columns={2} items={[
                { label: 'Line 1', value: s(order.address.line1) },
                { label: 'City', value: s(order.address.city) },
                { label: 'State', value: s(order.address.state) },
                { label: 'Pincode', value: s(order.address.postalCode) },
              ]} />
            ) : <div style={{ color: '#9ca3af' }}>No address on file</div>}
          </Section>

          {['PLACED', 'ACCEPTED', 'PREPARING', 'READY_FOR_PICKUP'].indexOf(order.status) !== -1 && (
            <Section title="Assign Delivery Partner">
              {partners.length === 0 ? (
                <div style={{ color: '#9ca3af' }}>No approved delivery partners available</div>
              ) : (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {partners.map((p) => (
                    <button
                      key={p._id}
                      disabled={assigning}
                      onClick={() => assign(p._id)}
                      style={{ padding: '8px 14px', background: '#2563eb', color: '#fff', border: 0 }}
                    >
                      {s(p.phone)} · {s(p.vehicleNumber)}
                    </button>
                  ))}
                </div>
              )}
            </Section>
          )}
        </div>

        <div>
          <Section title="Lifecycle">
            <OrderTimeline current={order.status} />
          </Section>

          <Section title="Payment">
            <InfoGrid columns={1} items={[
              { label: 'Method', value: s(order.paymentMethod) },
              { label: 'Status', value: <StatusBadge status={order.paymentStatus || 'PENDING'} /> },
              { label: 'Amount', value: '₹' + Number(order.total ?? 0) },
            ]} />
          </Section>

          <Section title="People">
            <InfoGrid columns={1} items={[
              { label: 'Customer', value: customerLine },
              { label: 'Retailer', value: retailerLine },
              { label: 'Delivery Partner', value: partnerLine || <span style={{ color: '#9ca3af' }}>Not assigned</span> },
            ]} />
          </Section>

          {statusHistory.length > 0 && (
            <Section title="Status History">
              <div style={{ fontSize: 12 }}>
                {statusHistory.map((h: any, i: number) => (
                  <div key={h._id || i} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #f3f4f6' }}>
                    <span>
                      <StatusBadge status={h.toStatus} />
                      <span style={{ marginLeft: 8, color: '#6b7280' }}>by {s(h.actorRole)}</span>
                    </span>
                    <span style={{ color: '#6b7280' }}>{h.timestamp ? new Date(h.timestamp).toLocaleString() : ''}</span>
                  </div>
                ))}
              </div>
            </Section>
          )}
        </div>
      </div>
    </div>
  );
};

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div style={{ background: '#fff', borderRadius: 8, padding: 18, marginBottom: 16 }}>
    <h3 style={{ marginTop: 0, marginBottom: 12, fontSize: 15 }}>{title}</h3>
    {children}
  </div>
);

export default OrderDetail;
