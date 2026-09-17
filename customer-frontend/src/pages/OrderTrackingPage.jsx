import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api, { formatINR } from '../services/api';
import OrderStepper from '../components/OrderStepper';
import CustomerInvoiceModal, { formatDateTimeWithSeconds } from '../components/CustomerInvoiceModal';
import { useSocket } from '../context/SocketContext';

export default function OrderTrackingPage() {
  const { id } = useParams();
  const { liveAlerts } = useSocket();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);

  const fetchOrder = () => {
    api.get(`/orders/${id}`)
      .then(({ data }) => setOrder(data.order))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchOrder();
  }, [id]);

  // Refresh if socket event received for this order
  useEffect(() => {
    if (liveAlerts.some(a => a.orderId === id)) {
      fetchOrder();
    }
  }, [liveAlerts, id]);

  if (loading) return <div className="container section-padding"><p>Connecting to live order tracker...</p></div>;
  if (!order) return <div className="container section-padding"><h3>Order not found.</h3></div>;

  return (
    <main className="container section-padding">
      <div style={{ background: '#fff', border: '1px solid #E7E7E7', borderRadius: '12px', padding: '30px', marginBottom: '30px' }}>
        
        {/* Header Summary */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #eee', paddingBottom: '16px', flexWrap: 'wrap', gap: '14px' }}>
          <div>
            <span style={{ fontSize: '0.85rem', color: '#777' }}>LIVE ORDER STATUS</span>
            <h2 style={{ fontSize: '1.6rem', fontWeight: '800', color: 'var(--primary-color)', margin: '2px 0 6px 0' }}>
              Order #{order.orderNumber}
            </h2>
            <div style={{ fontSize: '0.82rem', color: '#475569', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <i className="fa-regular fa-clock" style={{ color: '#2563EB' }}></i>
              <span>Placed At: <strong>{formatDateTimeWithSeconds(order.createdAt)}</strong></span>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <span style={{ background: '#e7f4e8', color: '#2e7d32', padding: '8px 16px', borderRadius: '20px', fontWeight: '800', fontSize: '0.9rem', textTransform: 'uppercase' }}>
              <i className="fa-solid fa-satellite-dish" style={{ color: '#FF9900' }}></i> {order.orderStatus.replace(/_/g, ' ')}
            </span>
            <button
              onClick={() => setShowInvoiceModal(true)}
              style={{
                background: '#0F172A',
                color: '#FFFFFF',
                border: 'none',
                padding: '8px 16px',
                borderRadius: '8px',
                fontWeight: '700',
                fontSize: '0.85rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: '0 2px 6px rgba(15, 23, 42, 0.15)'
              }}
            >
              <i className="fa-solid fa-file-invoice" style={{ color: '#10B981' }}></i> Official Tax Invoice
            </button>
          </div>
        </div>

        {/* Visual 8-Stage Stepper */}
        <OrderStepper currentStatus={order.orderStatus} />

        {/* Delivery Details & Agent Box */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px', marginTop: '30px', background: '#fafafa', padding: '20px', borderRadius: '8px' }}>
          
          <div>
            <h4 style={{ fontSize: '0.95rem', fontWeight: '700', marginBottom: '8px', color: 'var(--primary-color)' }}>
              <i className="fa-solid fa-store" style={{ color: 'var(--accent-color)' }}></i> Store &amp; Fulfillment
            </h4>
            <p style={{ fontSize: '0.88rem', fontWeight: '600' }}>{order.sellerId?.storeName || 'NovaKart Central Store'}</p>
            <p style={{ fontSize: '0.8rem', color: '#666' }}>{order.sellerId?.businessAddress || 'Delhi Fulfillment Center'}</p>
          </div>

          <div>
            <h4 style={{ fontSize: '0.95rem', fontWeight: '700', marginBottom: '8px', color: 'var(--primary-color)' }}>
              <i className="fa-solid fa-location-dot" style={{ color: '#CC0C39' }}></i> Delivery Destination
            </h4>
            <p style={{ fontSize: '0.88rem', fontWeight: '600' }}>{order.deliveryAddress?.fullName} ({order.deliveryAddress?.phone})</p>
            <p style={{ fontSize: '0.8rem', color: '#666' }}>{order.deliveryAddress?.street}, {order.deliveryAddress?.city}, {order.deliveryAddress?.postalCode}</p>
          </div>

          <div>
            <h4 style={{ fontSize: '0.95rem', fontWeight: '700', marginBottom: '8px', color: 'var(--primary-color)' }}>
              <i className="fa-solid fa-motorcycle" style={{ color: '#2e7d32' }}></i> Assigned Delivery Agent
            </h4>
            {order.deliveryAgentId ? (
              <div>
                <p style={{ fontSize: '0.88rem', fontWeight: '600' }}>{order.deliveryAgentId.fullName}</p>
                <p style={{ fontSize: '0.8rem', color: '#666' }}>
                  Vehicle: {order.deliveryAgentId.vehicleType} ({order.deliveryAgentId.vehicleNumber})
                </p>
                <span style={{ fontSize: '0.75rem', background: '#2e7d32', color: '#fff', padding: '2px 8px', borderRadius: '4px', display: 'inline-block', marginTop: '4px' }}>
                  <i className="fa-solid fa-phone"></i> {order.deliveryAgentId.phone}
                </span>
              </div>
            ) : (
              <p style={{ fontSize: '0.82rem', color: '#FF9900', fontStyle: 'italic' }}>
                <i className="fa-solid fa-spinner fa-spin"></i> Nearby delivery agent dispatch in progress...
              </p>
            )}
          </div>
        </div>

        {/* Line Items */}
        <div style={{ marginTop: '30px' }}>
          <h4 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '14px', borderBottom: '1px solid #eee', paddingBottom: '8px' }}>
            Ordered Items ({order.items?.length})
          </h4>
          {order.items?.map((item, idx) => (
            <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid #f0f0f0' }}>
              <span>{item.name} &times; {item.quantity}</span>
              <strong>{formatINR(item.subtotal)}</strong>
            </div>
          ))}
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.2rem', fontWeight: '800', marginTop: '16px', color: 'var(--primary-color)' }}>
            <span>Total Amount Paid ({order.paymentMethod}):</span>
            <span>{formatINR(order.totalAmount)}</span>
          </div>
        </div>

      </div>

      {showInvoiceModal && (
        <CustomerInvoiceModal
          order={order}
          onClose={() => setShowInvoiceModal(false)}
        />
      )}
    </main>
  );
}
