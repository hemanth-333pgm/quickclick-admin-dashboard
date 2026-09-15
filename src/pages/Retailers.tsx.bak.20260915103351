import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminRetailersApi } from '../api/retailers.api';
import { getErrorMessage } from '../api/axiosClient';
import StatusBadge from '../components/StatusBadge';
import toast from 'react-hot-toast';

const extractList = (data: any): any[] => {
  if (Array.isArray(data)) return data;
  if (!data || typeof data !== 'object') return [];
  for (const key of ['retailers', 'results', 'items', 'list', 'rows', 'docs']) {
    if (Array.isArray(data[key])) return data[key];
  }
  for (const v of Object.values(data)) if (Array.isArray(v)) return v as any[];
  return [];
};

const Retailers: React.FC = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState<any[]>([]);
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const res = await adminRetailersApi.list({ status, page: 1, limit: 50 });
      setItems(extractList((res.data as any).data));
    } catch (e) { toast.error(getErrorMessage(e)); setItems([]); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [status]);

  const change = async (id: string, newStatus: string) => {
    if (!confirm('Set retailer status to ' + newStatus + '?')) return;
    try {
      await adminRetailersApi.updateStatus(id, newStatus as any, 'Reviewed by admin');
      toast.success('Updated'); load();
    } catch (e) { toast.error(getErrorMessage(e)); }
  };

  return (
    <div>
      <h1 style={{ marginTop: 0 }}>Retailers</h1>
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
              <tr><th>Shop</th><th>Phone</th><th>Status</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {items.length === 0 && (<tr><td colSpan={4} style={{ textAlign: 'center', color: '#9ca3af', padding: 24 }}>No retailers</td></tr>)}
              {items.map((r) => (
                <tr key={r._id} style={{ borderTop: '1px solid #eee', fontSize: 13 }}>
                  <td>{r.shopName}</td>
                  <td>{r.phone}</td>
                  <td><StatusBadge status={r.status} /></td>
                  <td>
                    <button onClick={() => navigate('/retailers/' + r._id)}>View</button>{' '}
                    {r.status === 'PENDING' && (<>
                      <button onClick={() => change(r._id, 'APPROVED')}>Approve</button>{' '}
                      <button onClick={() => change(r._id, 'REJECTED')}>Reject</button>
                    </>)}
                    {r.status === 'APPROVED' && <button onClick={() => change(r._id, 'SUSPENDED')}>Suspend</button>}
                    {r.status === 'SUSPENDED' && <button onClick={() => change(r._id, 'APPROVED')}>Re-activate</button>}
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

export default Retailers;
