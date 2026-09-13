import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminUsersApi } from '../api/users.api';
import { getErrorMessage } from '../api/axiosClient';
import StatusBadge from '../components/StatusBadge';
import toast from 'react-hot-toast';

const extractList = (data: any): any[] => {
  if (Array.isArray(data)) return data;
  if (!data || typeof data !== 'object') return [];
  for (const key of ['users', 'results', 'items', 'list', 'rows', 'docs']) {
    if (Array.isArray(data[key])) return data[key];
  }
  for (const v of Object.values(data)) if (Array.isArray(v)) return v as any[];
  return [];
};

const Users: React.FC = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState<any[]>([]);
  const [role, setRole] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await adminUsersApi.list({ role, status, page: 1, limit: 50 });
      setUsers(extractList((res.data as any).data));
    } catch (e) { toast.error(getErrorMessage(e)); setUsers([]); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchUsers(); }, [role, status]);

  const setStatusFor = async (id: string, newStatus: string) => {
    if (!confirm('Set user status to ' + newStatus + '?')) return;
    try {
      await adminUsersApi.updateStatus(id, newStatus, 'Admin action');
      toast.success('Status updated');
      fetchUsers();
    } catch (e) { toast.error(getErrorMessage(e)); }
  };

  return (
    <div>
      <h1 style={{ marginTop: 0 }}>Users</h1>
      <div style={{ marginBottom: 16, display: 'flex', gap: 8 }}>
        <select value={role} onChange={(e) => setRole(e.target.value)}>
          <option value="">All roles</option>
          <option value="CUSTOMER">Customer</option>
          <option value="RETAILER">Retailer</option>
          <option value="DELIVERY_PARTNER">Delivery Partner</option>
          <option value="ADMIN">Admin</option>
        </select>
        <select value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">All statuses</option>
          <option value="ACTIVE">Active</option>
          <option value="SUSPENDED">Suspended</option>
        </select>
      </div>
      {loading ? <div>Loading...</div> : (
        <div style={{ background: '#fff', borderRadius: 8, overflow: 'hidden' }}>
          <table width="100%" cellPadding={10}>
            <thead style={{ background: '#f3f4f6', textAlign: 'left', fontSize: 12 }}>
              <tr><th>Name</th><th>Mobile</th><th>Role</th><th>Status</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {users.length === 0 && (<tr><td colSpan={5} style={{ textAlign: 'center', color: '#9ca3af', padding: 24 }}>No users</td></tr>)}
              {users.map((u) => (
                <tr key={u._id || u.id} style={{ borderTop: '1px solid #eee', fontSize: 13 }}>
                  <td>{u.name || '-'}</td>
                  <td>{u.mobile}</td>
                  <td>{u.role}</td>
                  <td><StatusBadge status={u.status} /></td>
                  <td>
                    <button onClick={() => navigate('/customers/' + (u._id || u.id))}>View</button>{' '}
                    {u.status !== 'SUSPENDED'
                      ? <button onClick={() => setStatusFor(u._id || u.id, 'SUSPENDED')}>Suspend</button>
                      : <button onClick={() => setStatusFor(u._id || u.id, 'ACTIVE')}>Activate</button>}
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

export default Users;
