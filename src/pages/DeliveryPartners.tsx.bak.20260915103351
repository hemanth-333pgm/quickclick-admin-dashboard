import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminDeliveryApi } from '../api/delivery.api';
import { getErrorMessage } from '../api/axiosClient';
import StatusBadge from '../components/StatusBadge';
import toast from 'react-hot-toast';

const extractList = (data: any): any[] => {
  if (Array.isArray(data)) return data;
  if (!data || typeof data !== 'object') return [];
  for (const key of ['deliveryPartners', 'partners', 'results', 'items', 'list', 'rows', 'docs']) {
    if (Array.isArray(data[key])) return data[key];
  }
  for (const v of Object.values(data)) if (Array.isArray(v)) return v as any[];
  return [];
};

const DeliveryPartners: React.FC = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState<any[]>([]);
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const res = await adminDeliveryApi.list({ status, page: 1, limit: 50 });
      setItems(extractList((res.data as any).data));
    } catch (e) { toast.error(getErrorMessage(e)); setItems([]); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [status]);

  const change = async (id: string, newStatus: string) => {
    if (!confirm('Set delivery partner status to ' + newStatus + '?')) return;
    try {
      await adminDeliveryApi.updateStatus(id, newStatus as any);
      toast.success('Updated'); load();
    } catch (e) { toast.error(getErrorMessage(e)); }
  };

  return (
    <div>
      <h1 style={{ marginTop: 0 }}>Delivery Partners</h1>
      <select value={status} onChange={(e) => setStatus(e.target.value)} style={{ marginBottom: 16 }}>
        <option value="">All statuses</option>
        <option value="PENDING">Pending</option>
        <option value="APPROVED">Approved</option>
        <option value="REJECTED">Rejected</option>
        <option value="SUSPENDED">Suspended</option>
      </select>
      {loading ? <div>Loading...</div> : (
        <div style={{ background: '#fff', borderRadius: 8, overflow: 'hidden' }}>
          <table width="100%" cellPadding={10}>
            <thead style={{ background: '#f3f4f6', textAlign: 'left', fontSize: 12 }}>
              <tr><th>Phone</th><th>Vehicle</th><th>Availability</th><th>Status</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {items.length === 0 && (<tr><td colSpan={5} style={{ textAlign: 'center', color: '#9ca3af', padding: 24 }}>No delivery partners</td></tr>)}
              {items.map((p) => (
                <tr key={p._id} style={{ borderTop: '1px solid #eee', fontSize: 13 }}>
                  <td>{p.phone}</td>
                  <td>{p.vehicleType} - {p.vehicleNumber}</td>
                  <td><StatusBadge status={p.availability} /></td>
                  <td><StatusBadge status={p.status} /></td>
                  <td>
                    <button onClick={() => navigate('/delivery-partners/' + p._id)}>View</button>{' '}
                    {p.status === 'PENDING' && (<>
                      <button onClick={() => change(p._id, 'APPROVED')}>Approve</button>{' '}
                      <button onClick={() => change(p._id, 'REJECTED')}>Reject</button>
                    </>)}
                    {p.status === 'APPROVED' && <button onClick={() => change(p._id, 'SUSPENDED')}>Suspend</button>}
                    {p.status === 'SUSPENDED' && <button onClick={() => change(p._id, 'APPROVED')}>Re-activate</button>}
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

export default DeliveryPartners;
