import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { adminRetailersApi } from '../api/retailers.api';
import { getErrorMessage } from '../api/axiosClient';
import StatusBadge from '../components/StatusBadge';
import InfoGrid from '../components/InfoGrid';
import toast from 'react-hot-toast';

const extractList = (data: any): any[] => {
  if (Array.isArray(data)) return data;
  if (!data || typeof data !== 'object') return [];
  for (const key of ['products', 'orders', 'results', 'items', 'list']) {
    if (Array.isArray(data[key])) return data[key];
  }
  for (const v of Object.values(data)) if (Array.isArray(v)) return v as any[];
  return [];
};

const RetailerDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [retailer, setRetailer] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'products' | 'orders'>('products');

  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        const [rRes, pRes, oRes] = await Promise.all([
          adminRetailersApi.getOne(id).catch(() => null),
          adminRetailersApi.products(id).catch(() => null),
          adminRetailersApi.orders(id).catch(() => null),
        ]);
        if (rRes) setRetailer(rRes.data.data);
        if (pRes) setProducts(extractList(pRes.data.data));
        if (oRes) setOrders(extractList(oRes.data.data));
      } catch (e) { toast.error(getErrorMessage(e)); } finally { setLoading(false); }
    })();
  }, [id]);

  if (loading) return <div>Loading retailer...</div>;
  if (!retailer) return <div>Retailer not found. <button onClick={() => navigate(-1)}>Go back</button></div>;

  const revenue = orders.filter((o) => o.status === 'DELIVERED').reduce((s, o) => s + (o.total || 0), 0);

  const change = async (newStatus: string) => {
    if (!confirm('Set retailer status to ' + newStatus + '?')) return;
    try {
      await adminRetailersApi.updateStatus(id!, newStatus as any, 'Reviewed by admin');
      toast.success('Updated');
      setRetailer({ ...retailer, status: newStatus });
    } catch (e) { toast.error(getErrorMessage(e)); }
  };

  return (
    <div>
      <button onClick={() => navigate(-1)} style={{ marginBottom: 16 }}>← Back</button>
      <h1 style={{ marginTop: 0 }}>
        {retailer.shopName} <StatusBadge status={retailer.status} />
      </h1>
      <p style={{ color: '#6b7280', fontSize: 13 }}>{retailer.phone} · {retailer.isOpen ? 'Open now' : 'Closed'}</p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12, margin: '20px 0' }}>
        <Stat label="Products" value={products.length} />
        <Stat label="Orders" value={orders.length} accent="#16a34a" />
        <Stat label="Delivered" value={orders.filter((o) => o.status === 'DELIVERED').length} accent="#16a34a" />
        <Stat label="Revenue" value={'₹' + revenue} accent="#f59e0b" />
      </div>

      <Section title="Store Profile">
        <InfoGrid items={[
          { label: 'Shop Name', value: retailer.shopName },
          { label: 'Phone', value: retailer.phone },
          { label: 'Status', value: <StatusBadge status={retailer.status} /> },
          { label: 'Operating', value: retailer.isOpen ? 'OPEN' : 'CLOSED' },
          { label: 'Categories', value: (retailer.categories || []).join(', ') || '—' },
          { label: 'Service Radius', value: retailer.serviceRadiusKm ? retailer.serviceRadiusKm + ' km' : '—' },
          { label: 'Address', value: retailer.address ? [retailer.address.line1, retailer.address.city, retailer.address.state, retailer.address.postalCode].filter(Boolean).join(', ') : '—' },
          { label: 'Location', value: retailer.location?.coordinates ? retailer.location.coordinates.join(', ') : '—' },
        ]} />
        <div style={{ marginTop: 16, display: 'flex', gap: 8 }}>
          {retailer.status === 'PENDING' && (<>
            <button onClick={() => change('APPROVED')} style={{ background: '#16a34a', color: '#fff', border: 0 }}>Approve</button>
            <button onClick={() => change('REJECTED')} style={{ background: '#dc2626', color: '#fff', border: 0 }}>Reject</button>
          </>)}
          {retailer.status === 'APPROVED' && (
            <button onClick={() => change('SUSPENDED')} style={{ background: '#dc2626', color: '#fff', border: 0 }}>Suspend</button>
          )}
          {retailer.status === 'SUSPENDED' && (
            <button onClick={() => change('APPROVED')} style={{ background: '#16a34a', color: '#fff', border: 0 }}>Re-activate</button>
          )}
        </div>
      </Section>

      {retailer.documents && retailer.documents.length > 0 && (
        <Section title="Documents">
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {retailer.documents.map((d: any, i: number) => (
              <a key={i} href={d.url} target="_blank" rel="noreferrer" style={{ padding: '6px 12px', background: '#eff6ff', color: '#1e40af', borderRadius: 6, fontSize: 12, textDecoration: 'none' }}>
                {d.type || 'Document'} ↗
              </a>
            ))}
          </div>
        </Section>
      )}

      <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
        <TabBtn active={tab === 'products'} onClick={() => setTab('products')}>Products ({products.length})</TabBtn>
        <TabBtn active={tab === 'orders'} onClick={() => setTab('orders')}>Orders ({orders.length})</TabBtn>
      </div>

      {tab === 'products' && (
        <Section title="">
          {products.length === 0 ? (
            <div style={{ color: '#9ca3af', padding: 16, textAlign: 'center' }}>No products</div>
          ) : (
            <table width="100%" cellPadding={8} style={{ fontSize: 13 }}>
              <thead style={{ background: '#f3f4f6', textAlign: 'left', fontSize: 11 }}>
                <tr><th>Name</th><th>Price</th><th>Stock</th><th>Unit</th><th>Status</th></tr>
              </thead>
              <tbody>
                {products.map((p) => (
                  <tr key={p._id} style={{ borderTop: '1px solid #eee' }}>
                    <td>{p.name}</td>
                    <td>₹{p.price} {p.discountPrice ? <span style={{ color: '#16a34a', fontSize: 11 }}>(₹{p.discountPrice})</span> : null}</td>
                    <td>{p.stockQty ?? '—'}</td>
                    <td>{p.unit || '—'}</td>
                    <td><StatusBadge status={p.status || 'ACTIVE'} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Section>
      )}

      {tab === 'orders' && (
        <Section title="">
          {orders.length === 0 ? (
            <div style={{ color: '#9ca3af', padding: 16, textAlign: 'center' }}>No orders</div>
          ) : (
            <table width="100%" cellPadding={8} style={{ fontSize: 13 }}>
              <thead style={{ background: '#f3f4f6', textAlign: 'left', fontSize: 11 }}>
                <tr><th>Order #</th><th>Status</th><th>Total</th><th>Date</th><th></th></tr>
              </thead>
              <tbody>
                {orders.map((o) => (
                  <tr key={o._id} style={{ borderTop: '1px solid #eee' }}>
                    <td><code>{o.orderNumber}</code></td>
                    <td><StatusBadge status={o.status} /></td>
                    <td>₹{o.total}</td>
                    <td>{new Date(o.createdAt).toLocaleString()}</td>
                    <td><button onClick={() => navigate('/orders/' + o._id)}>View</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Section>
      )}
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
    {title && <h3 style={{ marginTop: 0, marginBottom: 12, fontSize: 15 }}>{title}</h3>}
    {children}
  </div>
);
const TabBtn: React.FC<{ active: boolean; onClick: () => void; children: React.ReactNode }> = ({ active, onClick, children }) => (
  <button onClick={onClick} style={{ background: active ? '#2563eb' : '#fff', color: active ? '#fff' : '#374151', border: '1px solid #d1d5db', fontWeight: active ? 600 : 400 }}>{children}</button>
);

export default RetailerDetail;
