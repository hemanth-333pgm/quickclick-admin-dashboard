import React, { useEffect, useState } from 'react';
import { adminCategoriesApi } from '../api/categories.api';
import { getErrorMessage } from '../api/axiosClient';
import toast from 'react-hot-toast';

const extractList = (data: any): any[] => {
  if (Array.isArray(data)) return data;
  if (!data || typeof data !== 'object') return [];
  for (const key of ['categories', 'results', 'items', 'list', 'rows', 'docs']) {
    if (Array.isArray(data[key])) return data[key];
  }
  for (const v of Object.values(data)) if (Array.isArray(v)) return v as any[];
  return [];
};

const empty = { name: '', slug: '', description: '', imageUrl: '', isActive: true, isFeatured: false, sortOrder: 0 };

const Categories: React.FC = () => {
  const [items, setItems] = useState<any[]>([]);
  const [form, setForm] = useState<any>(empty);
  const [editingId, setEditingId] = useState<string | null>(null);

  const load = async () => {
    try {
      const res = await adminCategoriesApi.list();
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
        await adminCategoriesApi.update(editingId, form);
        toast.success('Updated');
      } else {
        await adminCategoriesApi.create(form);
        toast.success('Created');
      }
      setForm(empty);
      setEditingId(null);
      load();
    } catch (e) { toast.error(getErrorMessage(e)); }
  };

  const edit = (c: any) => {
    setEditingId(c._id);
    setForm({ ...empty, ...c });
  };

  const remove = async (id: string) => {
    if (!confirm('Delete this category?')) return;
    try {
      await adminCategoriesApi.remove(id);
      toast.success('Deleted');
      load();
    } catch (e) { toast.error(getErrorMessage(e)); }
  };

  return (
    <div>
      <h1 style={{ marginTop: 0 }}>Categories</h1>
      <form onSubmit={submit} style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10, marginBottom: 24, background: '#fff', padding: 16, borderRadius: 8 }}>
        <input placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
        <input placeholder="Slug" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} required />
        <input placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        <input placeholder="Image URL" value={form.imageUrl} onChange={(e) => setForm({ ...form, imageUrl: e.target.value })} />
        <label style={{ fontSize: 13 }}><input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} /> Active</label>
        <label style={{ fontSize: 13 }}><input type="checkbox" checked={form.isFeatured} onChange={(e) => setForm({ ...form, isFeatured: e.target.checked })} /> Featured</label>
        <div style={{ gridColumn: '1 / -1', display: 'flex', gap: 8 }}>
          <button type="submit" style={{ background: '#2563eb', color: '#fff', border: 0, fontWeight: 600 }}>{editingId ? 'Update' : 'Create'}</button>
          {editingId && <button type="button" onClick={() => { setEditingId(null); setForm(empty); }}>Cancel</button>}
        </div>
      </form>
      <div style={{ background: '#fff', borderRadius: 8, overflow: 'hidden' }}>
        <table width="100%" cellPadding={10}>
          <thead style={{ background: '#f3f4f6', textAlign: 'left', fontSize: 12 }}>
            <tr><th>Name</th><th>Slug</th><th>Active</th><th>Featured</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {items.map((c) => (
              <tr key={c._id} style={{ borderTop: '1px solid #eee', fontSize: 13 }}>
                <td>{c.name}</td>
                <td>{c.slug}</td>
                <td>{c.isActive ? 'Yes' : 'No'}</td>
                <td>{c.isFeatured ? 'Yes' : 'No'}</td>
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

export default Categories;
