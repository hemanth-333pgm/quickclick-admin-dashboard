import React, { useEffect, useState } from 'react';
import { adminCouponsApi } from '../api/coupons.api';
import { getErrorMessage } from '../api/axiosClient';
import toast from 'react-hot-toast';

const extractList = (data: any): any[] => {
  if (Array.isArray(data)) return data;
  if (!data || typeof data !== 'object') return [];
  for (const key of ['coupons', 'results', 'items', 'list', 'rows', 'docs']) {
    if (Array.isArray(data[key])) return data[key];
  }
  for (const v of Object.values(data)) if (Array.isArray(v)) return v as any[];
  return [];
};

const empty = { code: '', discountType: 'PERCENT', discountValue: 10, minOrderValue: 0, maxDiscount: 0, expiresAt: '', isActive: true };

const Coupons: React.FC = () => {
  const [items, setItems] = useState<any[]>([]);
  const [form, setForm] = useState<any>(empty);
  const [editingId, setEditingId] = useState<string | null>(null);

  const load = async () => {
    try {
      const res = await adminCouponsApi.list();
      setItems(extractList(res.data.data));
    } catch (e) {
      toast.error(getErrorMessage(e));
      setItems([]);
    }
  };

  useEffect(() => { load(); }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await adminCouponsApi.update(editingId, form);
        toast.success('Updated');
      } else {
        await adminCouponsApi.create(form);
        toast.success('Created');
      }
      setForm(empty);
      setEditingId(null);
      load();
    } catch (e) { toast.error(getErrorMessage(e)); }
  };

  const edit = (c: any) => {
    setEditingId(c._id);
    setForm({ ...empty, ...c, expiresAt: c.expiresAt ? c.expiresAt.slice(0, 10) : '' });
  };

  const remove = async (id: string) => {
    if (!confirm('Delete this coupon?')) return;
    try {
      await adminCouponsApi.remove(id);
      toast.success('Deleted');
      load();
    } catch (e) { toast.error(getErrorMessage(e)); }
  };

  return (
    <div>
      <h1 style={{ marginTop: 0 }}>Coupons</h1>
      <form onSubmit={submit} style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 24, background: '#fff', padding: 16, borderRadius: 8 }}>
        <input placeholder="Code" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })} required />
        <select value={form.discountType} onChange={(e) => setForm({ ...form, discountType: e.target.value })}>
          <option value="PERCENT">Percent</option>
          <option value="FLAT">Flat</option>
        </select>
        <input type="number" placeholder="Value" value={form.discountValue} onChange={(e) => setForm({ ...form, discountValue: +e.target.value })} required />
        <input type="number" placeholder="Min order" value={form.minOrderValue} onChange={(e) => setForm({ ...form, minOrderValue: +e.target.value })} />
        <input type="number" placeholder="Max discount" value={form.maxDiscount} onChange={(e) => setForm({ ...form, maxDiscount: +e.target.value })} />
        <input type="date" value={form.expiresAt} onChange={(e) => setForm({ ...form, expiresAt: e.target.value })} required />
        <label style={{ fontSize: 13 }}><input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} /> Active</label>
        <div style={{ gridColumn: '1 / -1', display: 'flex', gap: 8 }}>
          <button type="submit" style={{ background: '#2563eb', color: '#fff', border: 0, fontWeight: 600 }}>{editingId ? 'Update' : 'Create'}</button>
          {editingId && <button type="button" onClick={() => { setEditingId(null); setForm(empty); }}>Cancel</button>}
        </div>
      </form>
      <div style={{ background: '#fff', borderRadius: 8, overflow: 'hidden' }}>
        <table width="100%" cellPadding={10}>
          <thead style={{ background: '#f3f4f6', textAlign: 'left', fontSize: 12 }}>
            <tr><th>Code</th><th>Type</th><th>Value</th><th>Min</th><th>Expires</th><th>Active</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {items.map((c) => (
              <tr key={c._id} style={{ borderTop: '1px solid #eee', fontSize: 13 }}>
                <td><strong>{c.code}</strong></td>
                <td>{c.discountType}</td>
                <td>{c.discountValue}</td>
                <td>{'₹' + (c.minOrderValue || 0)}</td>
                <td>{c.expiresAt ? c.expiresAt.slice(0, 10) : '-'}</td>
                <td>{c.isActive ? 'Yes' : 'No'}</td>
                <td>
                  <button onClick={() => edit(c)}>Edit</button>{' '}
                  <button onClick={() => remove(c._id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Coupons;
