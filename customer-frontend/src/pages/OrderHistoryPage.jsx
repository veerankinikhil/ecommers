import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api, { formatINR } from '../services/api';
import CustomerInvoiceModal, { formatDateTimeWithSeconds } from '../components/CustomerInvoiceModal';

export default function OrderHistoryPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedInvoiceOrder, setSelectedInvoiceOrder] = useState(null);

  useEffect(() => {
    api.get('/orders/my-orders')
      .then(({ data }) => setOrders(data.orders || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <main className="container section-padding">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
        <h2 style={{ fontSize: '1.6rem', fontWeight: '700', color: 'var(--primary-color)' }}>
          <i className="fa-solid fa-clock-rotate-left" style={{ color: 'var(--accent-color)' }}></i> My Order History
        </h2>
        <Link to="/products" className="btn btn-primary" style={{ padding: '8px 16px', fontSize: '0.85rem' }}>
          Browse Catalog
        </Link>
      </div>

      {loading ? (
        <p style={{ textAlign: 'center', padding: '40px' }}>Loading order history...</p>
      ) : orders.length === 0 ? (
        <div style={{ background: '#fff', padding: '50px 20px', textAlign: 'center', borderRadius: '8px', border: '1px solid #eee' }}>
          <i className="fa-solid fa-box-open" style={{ fontSize: '3rem', color: '#ccc', marginBottom: '14px' }}></i>
          <h3>No Orders Placed Yet</h3>
          <p style={{ color: '#777', marginBottom: '20px' }}>Shop top products from verified local sellers with fast nearby delivery.</p>
          <Link to="/products" className="btn btn-primary">Start Shopping</Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {orders.map(order => (
            <div key={order._id} style={{ background: '#fff', border: '1px solid #E7E7E7', borderRadius: '10px', padding: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #eee', paddingBottom: '12px', marginBottom: '14px', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                  <span style={{ fontSize: '0.78rem', color: '#777', textTransform: 'uppercase', fontWeight: '700' }}>ORDER NUMBER</span>
                  <p style={{ fontWeight: '800', fontSize: '1rem', color: 'var(--primary-color)', fontFamily: 'monospace', margin: '2px 0 0 0' }}>{order.orderNumber}</p>
                </div>
                <div>
                  <span style={{ fontSize: '0.78rem', color: '#777', textTransform: 'uppercase', fontWeight: '700' }}>DATE &amp; TIME (WITH SECONDS)</span>
                  <p style={{ fontSize: '0.86rem', fontWeight: '700', color: '#0F172A', margin: '2px 0 0 0', fontFamily: 'monospace' }}>
                    <i className="fa-regular fa-clock" style={{ color: '#2563EB', marginRight: '5px' }}></i>
                    {formatDateTimeWithSeconds(order.createdAt)}
                  </p>
                </div>
                <div>
                  <span style={{ fontSize: '0.78rem', color: '#777', textTransform: 'uppercase', fontWeight: '700' }}>TOTAL AMOUNT</span>
                  <p style={{ fontSize: '1.1rem', fontWeight: '800', color: '#B12704', margin: '2px 0 0 0' }}>{formatINR(order.totalAmount)}</p>
                </div>
                <div>
                  <span style={{ fontSize: '0.78rem', color: '#777', textTransform: 'uppercase', fontWeight: '700' }}>PAYMENT &amp; STATUS</span>
                  <div style={{ display: 'flex', gap: '6px', alignItems: 'center', marginTop: '2px' }}>
                    <span style={{ background: '#e7f4e8', color: '#2e7d32', padding: '3px 8px', borderRadius: '4px', fontWeight: '800', fontSize: '0.75rem', textTransform: 'uppercase' }}>
                      {order.orderStatus.replace(/_/g, ' ')}
                    </span>
                    <span style={{ background: '#EFF6FF', color: '#1D4ED8', padding: '3px 8px', borderRadius: '4px', fontWeight: '700', fontSize: '0.72rem' }}>
                      {order.paymentMethod || 'UPI'}
                    </span>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  <button
                    onClick={() => setSelectedInvoiceOrder(order)}
                    style={{
                      background: '#0F172A',
                      color: '#FFFFFF',
                      border: 'none',
                      padding: '8px 14px',
                      borderRadius: '6px',
                      fontWeight: '700',
                      fontSize: '0.82rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                    }}
                  >
                    <i className="fa-solid fa-file-invoice" style={{ color: '#10B981' }}></i> View Tax Invoice
                  </button>
                  <Link to={`/orders/${order._id}/track`} className="btn btn-primary" style={{ padding: '8px 14px', fontSize: '0.82rem' }}>
                    <i className="fa-solid fa-location-crosshairs"></i> Track Order
                  </Link>
                </div>
              </div>

              {/* Items Preview */}
              <div style={{ display: 'flex', gap: '14px', overflowX: 'auto' }}>
                {order.items.map((item, idx) => (
                  <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: '220px', background: '#fafafa', padding: '8px 12px', borderRadius: '6px' }}>
                    <img src={item.image || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=150&q=80'} alt={item.name} style={{ width: '40px', height: '40px', objectFit: 'contain' }} />
                    <div>
                      <p style={{ fontSize: '0.82rem', fontWeight: '600', color: 'var(--text-primary)' }}>{item.name}</p>
                      <span style={{ fontSize: '0.75rem', color: '#666' }}>Qty: {item.quantity} &bull; {formatINR(item.price)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Customer GST Tax Invoice Modal */}
      {selectedInvoiceOrder && (
        <CustomerInvoiceModal
          order={selectedInvoiceOrder}
          onClose={() => setSelectedInvoiceOrder(null)}
        />
      )}
    </main>
  );
}
