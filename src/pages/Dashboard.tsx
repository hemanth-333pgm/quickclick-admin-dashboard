import React, { useEffect, useState } from 'react';
import { dashboardApi } from '../api/dashboard.api';
import StatCard from '../components/StatCard';
import { getErrorMessage } from '../api/axiosClient';
import toast from 'react-hot-toast';

const Dashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await dashboardApi.get();
        setMetrics(res.data.data.metrics || res.data.data);
      } catch (e) {
        toast.error(getErrorMessage(e));
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <div style={{ padding: 24 }}>Loading metrics...</div>;
  if (!metrics) return <div style={{ padding: 24 }}>No metrics available</div>;

  return (
    <div>
      <h1 style={{ marginTop: 0 }}>Dashboard</h1>
      <p style={{ color: '#6b7280', marginBottom: 24 }}>Overview of your platform</p>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: 16,
        }}
      >
        <StatCard label="Total Users" value={metrics.users?.total ?? 0} accent="#2563eb" />
        <StatCard label="Total Orders" value={metrics.orders?.total ?? 0} accent="#16a34a" />
        <StatCard
          label="Revenue"
          value={`₹${(metrics.revenue?.total ?? 0).toLocaleString()}`}
          accent="#f59e0b"
        />
      </div>
    </div>
  );
};

export default Dashboard;
