import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { adminDeliveryApi } from '../api/delivery.api';
import { getErrorMessage } from '../api/axiosClient';
import StatusBadge from '../components/StatusBadge';
import InfoGrid from '../components/InfoGrid';
import toast from 'react-hot-toast';

const extractList = (data: any): any[] => {
  if (Array.isArray(data)) return data;
  if (!data || typeof data !== 'object') return [];
  for (const k of ['jobs','orders','results','items','list']) {
    if (Array.isArray(data[k])) return data[k];
  }
  for (const v of Object.values(data)) if (Array.isArray(v)) return v as any[];
  return [];
};

const refId = (v: any): string | undefined => {
  if (!v) return undefined;
  if (typeof v === 'string') return v;
  if (typeof v === 'object') return v._id || v.id;
  return undefined;
};

const DeliveryPartnerDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [partner, setPartner] = useState<any>(null);
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        const [pRes, jRes] = await Promise.all([
          adminDeliveryApi.getOne(id).catch(() => null),
          adminDeliveryApi.jobs().catch(() => null),
        ]);
        if (pRes) setPartner((pRes.data as any).data);
        if (jRes) {
          const all = extractList((jRes.data as any).data);
          const mine = all.filter((o) => {
            const pid = refId(o.deliveryPartnerId) || refId(o.deliveryPartner) || refId(o.assignment?.deliveryPartnerId);
            return pid ? pid === String(id) : false;
          });
          setJobs(mine);
        }
      } catch (e) { toast.error(getErrorMessage(e)); } finally { setLoading(false); }
    })();
  }, [id]);

  if (loading) return <div>Loading partner...</div>;
  if (!partner) return <div>Delivery partner not found. <button onClick={() => navigate(-1)}>Go back</button></div>;

  const completed = jobs.filter((j) => j.status === 'DELIVERED').length;
  const active = jobs.filter((j) => ['ASSIGNED', 'PICKED_UP', 'OUT_FOR_DELIVERY'].indexOf(j.status) !== -1).length;
  const earnings = jobs.filter((j) => j.status === 'DELIVERED').reduce((s, j) => s + (j.deliveryFee || 40), 0);

  const change = async (s: string) => {
    if (!confirm('Set partner status to ' + s + '?')) return;
    try {
      await adminDeliveryApi.updateStatus(id!, s as any);
      setPartner({ ...partner, status: s });
      toast.success('Updated');
    } catch (e) { toast.error(getErrorMessage(e)); }
  };

  return (
    <div>
      <button onClick={() => navigate(-1)} style={{ marginBottom: 16 }}>← Back</button>
      <h1 style={{ marginTop: 0 }}>{partner.phone} <StatusBadge status={partner.status} /></h1>
      <p style={{ color: '#6b7280', fontSize: 13 }}>
        {partner.vehicleType} · {partner.availability}
        {partner.latitude && partner.longitude ? ' · live: ' + partner.latitude.toFixed(4) + ', ' + partner.longitude.toFixed(4) : ''}
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12, margin: '20px 0' }}>
        <Stat label="Total Jobs" value={jobs.length} />
        <Stat label="Active" value={active} accent="#f59e0b" />
        <Stat label="Completed" value={completed} accent="#16a34a" />
        <Stat label="Earnings" value={'₹' + earnings} accent="#7c3aed" />
      </div>

      <Section title="Partner Profile">
        <InfoGrid items={[
          { label: 'Phone', value: partner.phone },
          { label: 'Status', value: <StatusBadge status={partner.status} /> },
          { label: 'Availability', value: <StatusBadge status={partner.availability} /> },
          { label: 'Vehicle Type', value: partner.vehicleType },
          { label: 'Vehicle Number', value: partner.vehicleNumber },
          { label: 'Vehicle Model', value: partner.vehicleModel || '—' },
          { label: 'License', value: partner.licenseNumber },
          { label: 'Last Location', value: partner.latitude && partner.longitude ? partner.latitude.toFixed(5) + ', ' + partner.longitude.toFixed(5) : '—' },
        ]} />
        <div style={{ marginTop: 16, display: 'flex', gap: 8 }}>
          {partner.status === 'PENDING' && (<>
            <button onClick={() => change('APPROVED')} style={{ background: '#16a34a', color: '#fff', border: 0 }}>Approve</button>
            <button onClick={() => change('REJECTED')} style={{ background: '#dc2626', color: '#fff', border: 0 }}>Reject</button>
          </>)}
          {partner.status === 'APPROVED' && <button onClick={() => change('SUSPENDED')} style={{ background: '#dc2626', color: '#fff', border: 0 }}>Suspend</button>}
          {partner.status === 'SUSPENDED' && <button onClick={() => change('APPROVED')} style={{ background: '#16a34a', color: '#fff', border: 0 }}>Re-activate</button>}
        </div>
      </Section>

      {partner.latitude && partner.longitude && (
        <Section title="Live Location">
          <iframe
            title="map"
            width="100%"
            height="240"
            style={{ border: '1px solid #e5e7eb', borderRadius: 6 }}
            src={'https://www.openstreetmap.org/export/embed.html?bbox=' +
              (partner.longitude - 0.01) + ',' + (partner.latitude - 0.01) + ',' +
              (partner.longitude + 0.01) + ',' + (partner.latitude + 0.01) +
              '&layer=mapnik&marker=' + partner.latitude + ',' + partner.longitude}
          />
        </Section>
      )}

      <Section title={'Jobs (' + jobs.length + ')'}>
        {jobs.length === 0 ? (
          <div style={{ color: '#9ca3af', padding: 16, textAlign: 'center' }}>No jobs assigned yet</div>
        ) : (
          <table width="100%" cellPadding={8} style={{ fontSize: 13 }}>
            <thead style={{ background: '#f3f4f6', textAlign: 'left', fontSize: 11 }}>
              <tr><th>Order #</th><th>Status</th><th>Total</th><th>Date</th><th></th></tr>
            </thead>
            <tbody>
              {jobs.map((j) => (
                <tr key={j._id} style={{ borderTop: '1px solid #eee' }}>
                  <td><code>{j.orderNumber}</code></td>
                  <td><StatusBadge status={j.status} /></td>
                  <td>₹{j.total}</td>
                  <td>{new Date(j.createdAt).toLocaleString()}</td>
                  <td><button onClick={() => navigate('/orders/' + j._id)}>View</button></td>
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

export default DeliveryPartnerDetail;
