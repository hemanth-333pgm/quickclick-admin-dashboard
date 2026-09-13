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
  for (const key of ['deliveryPartners', 'partners', 'results', 'items', 'list']) {
    if (Array.isArray(data[key])) return data[key];
  }
  for (const v of Object.values(data)) if (Array.isArray(v)) return v as any[];
  return [];
};

const OrderDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [order, setOrder] = useState<any>(null);
  const [partners, setPartners] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [assigning, setAssigning] = useState(false);

  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        const [oRes, pRes] = await Promise.all([
          adminOrdersApi.getOne(id).catch(() => null),
          adminDeliveryApi.list({ status: 'APPROVED', limit: 100 }).catch(() => null),
        ]);
        if (oRes) setOrder(oRes.data.data);
        if (pRes) setPartners(extractList(pRes.data.data));
      } catch (e) { toast.error(getErrorMessage(e)); } finally { setLoading(false); }
    })();
  }, [id]);

  if (loading) return <div>Loading order...</div>;
  if (!order) return <div>Order not found. <button onClick={() => navigate(-1)}>Go back</button></div>;

  const assign = async (partnerId: string) => {
    try {
      setAssigning(true);
      await adminOrdersApi.assign(id!, partnerId);
      toast.success('Assigned');
      const res = await adminOrdersApi.getOne(id!);
      setOrder(res.data.data);
    } catch (e) { toast.error(getErrorMessage(e)); } finally { setAssigning(false); }
  };

  return (
    <div>
      <button onClick={() => navigate(-1)} style={{ marginBottom: 16 }}>← Back</button>
      <h1 style={{ marginTop: 0 }}>
        Order <code>{order.orderNumber}</code> <StatusBadge status={order.status} />
      </h1>
      <p style={{ color: '#6b7280', fontSize: 13 }}>
        Placed {new Date(order.createdAt).toLocaleString()}
        {order.updatedAt ? ' · Updated ' + new Date(order.updatedAt).toLocaleString() : ''}
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16, marginTop: 20 }}>
        <div>
          <Section title="Items">
            <table width="100%" cellPadding={8} style={{ fontSize: 13 }}>
              <thead style={{ background: '#f3f4f6', textAlign: 'left', fontSize: 11 }}>
                <tr><th>Item</th><th>Price</th><th>Qty</th><th style={{ textAlign: 'right' }}>Subtotal</th></tr>
              </thead>
              <tbody>
                {(order.items || []).map((it: any, i: number) => (
                  <tr key={i} style={{ borderTop: '1px solid #eee' }}>
                    <td>{it.name || it.nameSnapshot || '—'}</td>
                    <td>₹{it.price ?? it.priceSnapshot}</td>
                    <td>{it.quantity}</td>
                    <td style={{ textAlign: 'right' }}>₹{(it.price ?? it.priceSnapshot) * it.quantity}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr><td colSpan={3} style={{ textAlign: 'right', paddingTop: 10 }}>Subtotal</td><td style={{ textAlign: 'right', paddingTop: 10 }}>₹{order.subtotal}</td></tr>
                <tr><td colSpan={3} style={{ textAlign: 'right' }}>Delivery Fee</td><td style={{ textAlign: 'right' }}>₹{order.deliveryFee || 0}</td></tr>
                {order.discount ? <tr><td colSpan={3} style={{ textAlign: 'right' }}>Discount</td><td style={{ textAlign: 'right' }}>-₹{order.discount}</td></tr> : null}
                <tr><td colSpan={3} style={{ textAlign: 'right', fontWeight: 700, paddingTop: 8 }}>Total</td><td style={{ textAlign: 'right', fontWeight: 700, paddingTop: 8 }}>₹{order.total}</td></tr>
              </tfoot>
            </table>
          </Section>

          <Section title="Delivery Address">
            {order.address ? (
              <InfoGrid columns={2} items={[
                { label: 'Label', value: order.address.label },
                { label: 'Contact', value: order.address.contactName || order.address.phone || '—' },
                { label: 'Line 1', value: order.address.line1 },
                { label: 'Line 2', value: order.address.line2 || '—' },
                { label: 'City', value: order.address.city },
                { label: 'State', value: order.address.state },
                { label: 'Pincode', value: order.address.postalCode },
                { label: 'Instructions', value: order.address.instructions || order.deliveryInstructions || '—' },
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
                      {p.phone} · {p.vehicleNumber}
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
              { label: 'Method', value: order.paymentMethod },
              { label: 'Status', value: <StatusBadge status={order.paymentStatus || 'PENDING'} /> },
              { label: 'Amount', value: '₹' + order.total },
              { label: 'Transaction ID', value: order.paymentId || '—' },
            ]} />
          </Section>

          <Section title="People">
            <InfoGrid columns={1} items={[
              { label: 'Customer ID', value: <code style={{ fontSize: 11 }}>{order.userId || '—'}</code> },
              { label: 'Retailer ID', value: <code style={{ fontSize: 11 }}>{order.retailerId || '—'}</code> },
              { label: 'Delivery Partner', value: order.deliveryPartnerId ? <code style={{ fontSize: 11 }}>{order.deliveryPartnerId}</code> : <span style={{ color: '#9ca3af' }}>Not assigned</span> },
            ]} />
          </Section>

          {order.statusHistory && order.statusHistory.length > 0 && (
            <Section title="Status History">
              <div style={{ fontSize: 12 }}>
                {order.statusHistory.map((h: any, i: number) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', borderBottom: '1px solid #f3f4f6' }}>
                    <StatusBadge status={h.status} />
                    <span style={{ color: '#6b7280' }}>{new Date(h.at || h.timestamp).toLocaleString()}</span>
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
