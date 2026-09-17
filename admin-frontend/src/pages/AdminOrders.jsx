import React, { useEffect, useState } from 'react';
import adminApi, { formatINR } from '../services/adminApi';

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminApi.get('/orders/admin/all')
      .then(({ data }) => setOrders(data.orders || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <div className="admin-top-header">
        <div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: '800' }}>Global Orders Command Monitor</h1>
          <p style={{ color: '#64748B', fontSize: '0.88rem' }}>Live tracking across customers, merchant stores, and delivery agents</p>
        </div>
      </div>

      {loading ? (
        <p>Loading global order logs...</p>
      ) : orders.length === 0 ? (
        <p>No orders placed across platform yet.</p>
      ) : (
        <table className="data-table">
          <thead>
            <tr>
              <th>Order Number</th>
              <th>Customer</th>
              <th>Seller Store</th>
              <th>Assigned Delivery Agent</th>
              <th>Total Amount (₹)</th>
              <th>Payment</th>
              <th>Order Status</th>
            </tr>
          </thead>
          <tbody>
            {orders.map(o => (
              <tr key={o._id}>
                <td><strong>{o.orderNumber}</strong></td>
                <td>
                  <strong>{o.deliveryAddress?.fullName}</strong><br />
                  <span style={{ fontSize: '0.75rem', color: '#64748B' }}>{o.deliveryAddress?.phone}</span>
                </td>
                <td>{o.sellerId?.storeName || 'Merchant'}</td>
                <td>
                  {o.deliveryAgentId ? (
                    <span style={{ color: '#10B981', fontWeight: '600' }}>
                      <i className="fa-solid fa-motorcycle"></i> {o.deliveryAgentId.fullName} ({o.deliveryAgentId.vehicleNumber})
                    </span>
                  ) : (
                    <span style={{ color: '#F59E0B', fontStyle: 'italic', fontSize: '0.78rem' }}>Awaiting Dispatch</span>
                  )}
                </td>
                <td>
                  <strong style={{ color: '#0F172A' }}>{formatINR(o.totalAmount)}</strong>
                  {o.discount > 0 && (
                    <div style={{ fontSize: '0.72rem', color: '#16a34a', fontWeight: '600' }}>
                      (Discount: -{formatINR(o.discount)})
                    </div>
                  )}
                  {o.convenienceFee > 0 && (
                    <div style={{ fontSize: '0.72rem', color: '#ef4444', fontWeight: '600' }}>
                      (COD Fee: +{formatINR(o.convenienceFee)})
                    </div>
                  )}
                </td>
                <td>
                  <span style={{ fontSize: '0.75rem', fontWeight: '700', color: o.paymentStatus === 'PAID' ? '#10B981' : '#F59E0B' }}>
                    {o.paymentStatus}
                  </span>
                </td>
                <td>
                  <span style={{
                    background: '#e0f2fe',
                    color: '#0369a1',
                    padding: '3px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: '700'
                  }}>
                    {o.orderStatus.replace(/_/g, ' ')}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
