import React, { useEffect, useState } from 'react';
import deliveryApi, { formatINR } from '../services/deliveryApi';

export const formatDateTimeWithSeconds = (dateStr) => {
  if (!dateStr) return 'N/A';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return 'N/A';
  return d.toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true
  });
};

export default function DeliveryHistoryPage() {
  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    deliveryApi.get('/delivery/history')
      .then(({ data }) => setDeliveries(data.deliveries || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <main className="delivery-container" style={{ padding: '16px 12px 28px 12px' }}>
      <div style={{ marginBottom: '18px' }}>
        <span style={{
          fontSize: '0.72rem',
          background: '#DCFCE7',
          color: '#166534',
          fontWeight: '800',
          padding: '3px 8px',
          borderRadius: '12px'
        }}>
          SETTLED DISPATCH LOGS
        </span>
        <h1 style={{ fontSize: '1.4rem', fontWeight: '800', color: '#0F172A', margin: '6px 0 2px 0' }}>
          Completed Deliveries
        </h1>
        <p style={{ color: '#64748B', fontSize: '0.8rem' }}>
          Permanent courier log with timestamp verification &amp; earnings breakdown
        </p>
      </div>

      {/* Quick Summary Metrics */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '10px',
        marginBottom: '18px'
      }}>
        <div style={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '12px' }}>
          <div style={{ fontSize: '0.7rem', color: '#64748B', fontWeight: '700', textTransform: 'uppercase' }}>Completed Stops</div>
          <div style={{ fontSize: '1.4rem', fontWeight: '800', color: '#0F172A', marginTop: '2px' }}>
            {deliveries.length}
          </div>
        </div>
        <div style={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '12px' }}>
          <div style={{ fontSize: '0.7rem', color: '#64748B', fontWeight: '700', textTransform: 'uppercase' }}>Trip Payouts</div>
          <div style={{ fontSize: '1.4rem', fontWeight: '800', color: '#16A34A', marginTop: '2px' }}>
            {formatINR(deliveries.length * 140)}
          </div>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px 0', color: '#64748B' }}>
          <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: '1.8rem', color: '#2563EB' }}></i>
          <p style={{ marginTop: '10px', fontSize: '0.85rem' }}>Loading verified trip logs...</p>
        </div>
      ) : deliveries.length === 0 ? (
        <div style={{
          background: '#fff',
          border: '1px solid #E2E8F0',
          borderRadius: '14px',
          padding: '36px 16px',
          textAlign: 'center',
          color: '#64748B'
        }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px auto', fontSize: '1.3rem', color: '#94A3B8' }}>
            <i className="fa-solid fa-box-open"></i>
          </div>
          <h3 style={{ fontSize: '1rem', fontWeight: '700', color: '#334155', marginBottom: '4px' }}>No Deliveries Yet</h3>
          <p style={{ fontSize: '0.82rem', margin: 0 }}>Start your duty radar and deliver orders to see your completed history here.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {deliveries.map((d, index) => (
            <div
              key={d._id || index}
              style={{
                background: '#fff',
                border: '1px solid #E2E8F0',
                borderRadius: '12px',
                padding: '14px',
                boxShadow: '0 2px 6px rgba(0,0,0,0.02)'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{
                  fontFamily: 'monospace',
                  fontSize: '0.82rem',
                  fontWeight: '800',
                  color: '#1E293B',
                  background: '#F1F5F9',
                  padding: '3px 8px',
                  borderRadius: '6px'
                }}>
                  #{d.orderNumber}
                </span>
                <span style={{
                  background: '#DCFCE7',
                  color: '#166534',
                  fontSize: '0.72rem',
                  fontWeight: '800',
                  padding: '3px 8px',
                  borderRadius: '20px'
                }}>
                  + ₹140.00 CREDITED
                </span>
              </div>

              <div style={{ fontSize: '0.88rem', fontWeight: '700', color: '#0F172A', marginBottom: '3px' }}>
                👤 {d.deliveryAddress?.fullName || 'Customer Recipient'}
              </div>

              <div style={{ fontSize: '0.78rem', color: '#475569', marginBottom: '6px' }}>
                📍 {d.deliveryAddress?.street ? `${d.deliveryAddress.street}, ` : ''}{d.deliveryAddress?.city}
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #F1F5F9', paddingTop: '8px', marginTop: '6px', fontSize: '0.74rem', color: '#64748B' }}>
                <div>
                  <i className="fa-solid fa-warehouse" style={{ color: '#2563EB', marginRight: '4px' }}></i>
                  {d.sellerId?.storeName || 'Central Hub Dock'}
                </div>
                <div style={{ fontWeight: '600' }}>
                  {formatDateTimeWithSeconds(d.updatedAt || d.createdAt)}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
