import React, { useEffect, useState } from 'react';
import sellerApi, { formatINR } from '../services/sellerApi';
import StatsMetricCard from '../components/StatsMetricCard';
import { useSellerAuth } from '../context/SellerAuthContext';
import { Link } from 'react-router-dom';

export default function SellerDashboard() {
  const { sellerUser } = useSellerAuth();
  const [stats, setStats] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchDashboard = () => {
    sellerApi.get('/sellers/dashboard-stats')
      .then(({ data }) => {
        setStats(data.stats);
        setOrders(data.recentOrders || []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const handleAcceptOrder = async (orderId) => {
    try {
      const { data } = await sellerApi.put(`/orders/seller/${orderId}/accept`);
      alert(`🎉 Order accepted! Nearby delivery agent dispatch triggered (${data.dispatchResult?.nearbyCount || 1} agents notified).`);
      fetchDashboard();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to accept order.');
    }
  };

  if (loading) return <p>Loading merchant analytics...</p>;

  return (
    <div>
      <div className="seller-top-header">
        <div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: '800' }}>Store Dashboard</h1>
          <p style={{ color: '#64748B', fontSize: '0.88rem' }}>Overview of revenue, stock levels and incoming customer orders</p>
        </div>
        <Link to="/products/new" className="btn-seller btn-seller-accent">
          <i className="fa-solid fa-plus"></i> Add Product to Customer Store
        </Link>
      </div>

      {/* METRIC CARDS */}
      <div className="stats-grid">
        <StatsMetricCard title="Total Revenue" value={formatINR(stats?.revenue || 0)} icon="fa-indian-rupee-sign" color="#10B981" />
        <StatsMetricCard title="Total Orders" value={stats?.totalOrders || 0} icon="fa-receipt" color="#1A237E" />
        <StatsMetricCard title="Pending Fulfillment" value={stats?.pendingOrders || 0} icon="fa-clock" color="#F59E0B" />
        <StatsMetricCard title="Active Listed Products" value={stats?.totalProducts || 0} icon="fa-boxes-stacked" color="#6366F1" />
      </div>

      {/* RECENT ORDERS */}
      <div style={{ background: '#fff', border: '1px solid var(--seller-border)', borderRadius: '10px', padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: '700' }}>Recent Incoming Orders</h3>
          <Link to="/orders" style={{ fontSize: '0.85rem', color: 'var(--seller-primary)', fontWeight: '600' }}>View All Orders &rarr;</Link>
        </div>

        {orders.length === 0 ? (
          <p style={{ color: '#888', fontStyle: 'italic', padding: '20px 0' }}>No incoming orders yet. Listed products are active on the customer store!</p>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Order #</th>
                <th>Customer</th>
                <th>Items</th>
                <th>Total (₹)</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {orders.map(order => (
                <tr key={order._id}>
                  <td><strong>{order.orderNumber}</strong></td>
                  <td>{order.deliveryAddress?.fullName || 'Customer'}</td>
                  <td>{order.items?.length} items</td>
                  <td><strong>{formatINR(order.totalAmount)}</strong></td>
                  <td>
                    <span style={{ background: '#e0f2fe', color: '#0369a1', padding: '4px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: '700' }}>
                      {order.orderStatus}
                    </span>
                  </td>
                  <td>
                    {order.orderStatus === 'PENDING' ? (
                      <button className="btn-accept" onClick={() => handleAcceptOrder(order._id)}>
                        <i className="fa-solid fa-check"></i> Accept &amp; Dispatch Agent
                      </button>
                    ) : (
                      <span style={{ fontSize: '0.8rem', color: '#10B981', fontWeight: '600' }}>In Transit / Completed</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
