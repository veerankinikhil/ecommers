import React, { useEffect, useState, useCallback } from 'react';
import sellerApi, { formatINR, SOCKET_BASE_URL } from '../services/sellerApi';
import { useSellerAuth } from '../context/SellerAuthContext';
import { io } from 'socket.io-client';
import SellerInvoiceModal, { formatDateTimeWithSeconds } from '../components/SellerInvoiceModal';
import PackageShippingLabelModal from '../components/PackageShippingLabelModal';

const FALLBACK_PRODUCT_IMG = 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=400&q=80';

export default function SellerOrders() {
  const { sellerUser } = useSellerAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [expandedRouteOrderId, setExpandedRouteOrderId] = useState(null);
  const [selectedInvoiceOrder, setSelectedInvoiceOrder] = useState(null);
  const [selectedLabelOrder, setSelectedLabelOrder] = useState(null);

  const fetchOrders = useCallback((isManual = false) => {
    if (isManual) setRefreshing(true);
    sellerApi.get('/orders/seller/incoming')
      .then(({ data }) => setOrders(data.orders || []))
      .catch(() => {})
      .finally(() => {
        setLoading(false);
        if (isManual) setTimeout(() => setRefreshing(false), 500);
      });
  }, []);

  useEffect(() => {
    fetchOrders();

    // Auto-polling every 6 seconds
    const interval = setInterval(() => {
      fetchOrders();
    }, 6000);

    // Socket real-time updates
    const socket = io(SOCKET_BASE_URL);
    if (sellerUser?.sellerId) {
      socket.emit('join_seller_room', sellerUser.sellerId);
    }
    if (sellerUser?.id) {
      socket.emit('join_user_room', sellerUser.id);
    }

    socket.on('new_incoming_order', () => {
      fetchOrders();
    });

    socket.on('order_status_update', () => {
      fetchOrders();
    });

    return () => {
      clearInterval(interval);
      socket.disconnect();
    };
  }, [fetchOrders, sellerUser]);

  const handleAccept = async (orderId) => {
    try {
      await sellerApi.put(`/orders/seller/${orderId}/accept`);
      fetchOrders();
    } catch (err) {
      alert(err.response?.data?.message || 'Error accepting order');
    }
  };

  const handleReject = async (orderId) => {
    const reason = prompt('Please enter cancellation / rejection reason:');
    if (reason === null) return;
    try {
      await sellerApi.put(`/orders/seller/${orderId}/reject`, { reason });
      fetchOrders();
    } catch (err) {
      alert(err.response?.data?.message || 'Error rejecting order');
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '800', color: '#0F172A', letterSpacing: '-0.02em', margin: 0 }}>
            Store Orders &amp; Fulfillment
          </h2>
          <p style={{ color: '#64748B', fontSize: '0.88rem', margin: '4px 0 0 0' }}>
            Multi-stage logistics tracking: Store &rarr; Mother Hub &rarr; Delivery Branch &rarr; Customer
          </p>
        </div>
        <button
          onClick={() => fetchOrders(true)}
          disabled={refreshing}
          className="btn-seller"
          style={{
            background: refreshing ? '#F1F5F9' : '#FFFFFF',
            border: '1px solid #CBD5E1',
            color: '#334155',
            fontWeight: '600',
            fontSize: '0.85rem',
            padding: '8px 16px',
            borderRadius: '8px',
            cursor: refreshing ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
          }}
        >
          <i className={`fa-solid fa-rotate ${refreshing ? 'fa-spin' : ''}`}></i>
          {refreshing ? 'Refreshing...' : 'Refresh Orders'}
        </button>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0' }}>
          <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: '2rem', color: '#1A237E' }}></i>
          <p style={{ marginTop: '12px', color: '#64748B' }}>Loading store incoming orders...</p>
        </div>
      ) : orders.length === 0 ? (
        <div style={{ background: '#fff', padding: '60px 20px', textAlign: 'center', borderRadius: '12px', border: '1px solid #E2E8F0', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
          <i className="fa-solid fa-box-open" style={{ fontSize: '3rem', color: '#94A3B8', marginBottom: '16px' }}></i>
          <h3 style={{ fontSize: '1.25rem', color: '#1E293B', marginBottom: '8px' }}>No orders placed yet</h3>
          <p style={{ color: '#64748B', maxWidth: '450px', margin: '0 auto 20px auto', fontSize: '0.9rem' }}>
            When customers order your products from the store, they will appear here in real time.
          </p>
          <button 
            onClick={() => fetchOrders(true)} 
            className="btn-seller btn-seller-primary"
            style={{ fontSize: '0.88rem' }}
          >
            <i className="fa-solid fa-rotate"></i> Check For New Orders
          </button>
        </div>
      ) : (
        <div style={{ background: '#FFFFFF', borderRadius: '12px', border: '1px solid #E2E8F0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
          <table className="data-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0', textAlign: 'left' }}>
                <th style={{ padding: '14px 16px', fontSize: '0.8rem', fontWeight: '700', color: '#475569' }}>Order ID &amp; Time</th>
                <th style={{ padding: '14px 16px', fontSize: '0.8rem', fontWeight: '700', color: '#475569' }}>Customer &amp; Address</th>
                <th style={{ padding: '14px 16px', fontSize: '0.8rem', fontWeight: '700', color: '#475569' }}>Product &amp; Item Details</th>
                <th style={{ padding: '14px 16px', fontSize: '0.8rem', fontWeight: '700', color: '#475569' }}>Logistics Routing</th>
                <th style={{ padding: '14px 16px', fontSize: '0.8rem', fontWeight: '700', color: '#475569' }}>Total (₹)</th>
                <th style={{ padding: '14px 16px', fontSize: '0.8rem', fontWeight: '700', color: '#475569' }}>Status</th>
                <th style={{ padding: '14px 16px', fontSize: '0.8rem', fontWeight: '700', color: '#475569' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {orders.map(o => {
                const originWh = o.logisticsRoute?.originWarehouse;
                const destWh = o.logisticsRoute?.destinationBranch;
                const isExpanded = expandedRouteOrderId === o._id;

                return (
                  <React.Fragment key={o._id}>
                    <tr style={{ borderBottom: '1px solid #F1F5F9', verticalAlign: 'top' }}>
                      {/* Order ID & Time */}
                      <td style={{ padding: '16px' }}>
                        <strong style={{ color: '#0F172A', fontSize: '0.92rem', fontFamily: 'monospace' }}>{o.orderNumber}</strong>
                        <div style={{ fontSize: '0.74rem', color: '#475569', marginTop: '4px', fontFamily: 'monospace', fontWeight: '600' }}>
                          <i className="fa-regular fa-clock" style={{ color: '#2563EB', marginRight: '4px' }}></i>
                          {formatDateTimeWithSeconds(o.createdAt)}
                        </div>
                        {o.deliveryAgentId && (
                          <div style={{ marginTop: '8px', display: 'inline-flex', alignItems: 'center', gap: '5px', fontSize: '0.72rem', color: '#047857', background: '#ECFDF5', padding: '3px 7px', borderRadius: '4px', fontWeight: '600' }}>
                            <i className="fa-solid fa-motorcycle"></i> {o.deliveryAgentId.fullName}
                          </div>
                        )}
                      </td>

                      {/* Customer */}
                      <td style={{ padding: '16px', maxWidth: '220px' }}>
                        <div style={{ fontWeight: '700', color: '#1E293B', fontSize: '0.9rem' }}>{o.deliveryAddress?.fullName}</div>
                        <div style={{ fontSize: '0.78rem', color: '#64748B', marginTop: '2px' }}>
                          <i className="fa-solid fa-phone" style={{ fontSize: '0.7rem' }}></i> {o.deliveryAddress?.phone}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: '#94A3B8', marginTop: '4px', lineHeight: '1.3' }}>
                          {o.deliveryAddress?.street}, {o.deliveryAddress?.city}, {o.deliveryAddress?.state} - {o.deliveryAddress?.postalCode}
                        </div>
                      </td>

                      {/* Items with Photo */}
                      <td style={{ padding: '16px' }}>
                        {o.items?.map((it, idx) => {
                          const imgSrc = it.image || it.productId?.images?.[0] || FALLBACK_PRODUCT_IMG;
                          return (
                            <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: idx < o.items.length - 1 ? '10px' : 0 }}>
                              <img
                                src={imgSrc}
                                alt={it.name}
                                onError={(e) => { e.currentTarget.src = FALLBACK_PRODUCT_IMG; }}
                                style={{
                                  width: '46px',
                                  height: '46px',
                                  objectFit: 'cover',
                                  background: '#F8FAFC',
                                  borderRadius: '8px',
                                  border: '1px solid #E2E8F0',
                                  boxShadow: '0 1px 2px rgba(0,0,0,0.06)',
                                  flexShrink: 0
                                }}
                              />
                              <div>
                                <div style={{ fontWeight: '700', color: '#1E293B', fontSize: '0.86rem', textTransform: 'capitalize' }}>
                                  {it.name}
                                </div>
                                <div style={{ fontSize: '0.76rem', color: '#64748B', marginTop: '2px' }}>
                                  Qty: <strong style={{ color: '#0F172A' }}>{it.quantity}</strong> &times; {formatINR(it.price)}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </td>

                      {/* Multi-Stage Logistics Routing */}
                      <td style={{ padding: '16px', minWidth: '240px' }}>
                        <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '8px', padding: '8px 10px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                            <span style={{ fontSize: '0.72rem', fontWeight: '800', color: '#4338CA', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                              <i className="fa-solid fa-truck-fast"></i> Logistics Route
                            </span>
                            <button
                              onClick={() => setExpandedRouteOrderId(isExpanded ? null : o._id)}
                              style={{
                                background: 'transparent',
                                border: 'none',
                                color: '#4F46E5',
                                fontSize: '0.72rem',
                                fontWeight: '700',
                                cursor: 'pointer',
                                padding: 0,
                                textDecoration: 'underline'
                              }}
                            >
                              {isExpanded ? 'Hide Details' : 'Hub Details'}
                            </button>
                          </div>

                          {/* Route Chain Visualizer */}
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.74rem', color: '#334155' }}>
                            <span title="Store / Pickup Location" style={{ fontWeight: '600', color: '#0F172A' }}>
                              <i className="fa-solid fa-shop" style={{ color: '#059669', marginRight: '3px' }}></i> Store
                            </span>
                            <i className="fa-solid fa-arrow-right" style={{ fontSize: '0.62rem', color: '#94A3B8' }}></i>
                            <span title={originWh ? `${originWh.name} (${originWh.city})` : 'Regional Hub'} style={{ fontWeight: '600', color: '#1D4ED8' }}>
                              <i className="fa-solid fa-warehouse" style={{ marginRight: '3px' }}></i>
                              {originWh ? originWh.city : 'Regional Hub'}
                            </span>
                            <i className="fa-solid fa-arrow-right" style={{ fontSize: '0.62rem', color: '#94A3B8' }}></i>
                            <span title={destWh ? `${destWh.name} (${destWh.city})` : 'Delivery Branch'} style={{ fontWeight: '700', color: '#B45309' }}>
                              <i className="fa-solid fa-location-dot" style={{ color: '#DC2626', marginRight: '3px' }}></i>
                              {destWh ? destWh.city : 'Branch'}
                            </span>
                          </div>

                          <div style={{ marginTop: '5px', fontSize: '0.7rem', color: '#64748B' }}>
                            Dest Branch: <strong style={{ color: '#0F172A' }}>{destWh?.name || 'Tenali Delivery Branch'}</strong>
                          </div>
                        </div>

                        {/* Expandable Logistics Hub Details */}
                        {isExpanded && (
                          <div style={{ marginTop: '8px', padding: '10px', background: '#EEF2FF', borderRadius: '6px', border: '1px solid #C7D2FE', fontSize: '0.75rem' }}>
                            <div style={{ fontWeight: '700', color: '#3730A3', marginBottom: '4px' }}>
                              <i className="fa-solid fa-sitemap"></i> Dispatch &amp; Hub Assignment
                            </div>
                            <div style={{ color: '#1E1B4B', lineHeight: '1.4' }}>
                              <div><strong>Origin Hub:</strong> {originWh?.name || 'Vijayawada Central Mother Hub'} ({originWh?.code || 'WH-AP-VJA01'})</div>
                              <div><strong>Dest Branch:</strong> {destWh?.name || 'Tenali Delivery Branch'} ({destWh?.code || 'WH-AP-TEN01'})</div>
                              {destWh?.manager && (
                                <div style={{ marginTop: '4px', paddingTop: '4px', borderTop: '1px dashed #C7D2FE', color: '#4338CA' }}>
                                  <strong>Branch Manager:</strong> {destWh.manager.name} &bull; <i className="fa-solid fa-phone"></i> {destWh.manager.phone}
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </td>

                      {/* Total */}
                      <td style={{ padding: '16px', whiteSpace: 'nowrap' }}>
                        <div style={{ color: '#1A237E', fontWeight: '800', fontSize: '1.05rem' }}>{formatINR(o.totalAmount)}</div>
                        <div style={{ fontSize: '0.72rem', color: '#64748B' }}>{o.paymentMethod || 'COD'}</div>
                      </td>

                      {/* Status */}
                      <td style={{ padding: '16px' }}>
                        <span style={{ 
                          background: o.orderStatus === 'PENDING' ? '#FEF3C7' : o.orderStatus === 'DELIVERED' ? '#DCFCE7' : '#E0F2FE', 
                          color: o.orderStatus === 'PENDING' ? '#92400E' : o.orderStatus === 'DELIVERED' ? '#166534' : '#0369A1', 
                          padding: '4px 10px', 
                          borderRadius: '6px', 
                          fontSize: '0.74rem', 
                          fontWeight: '800',
                          textTransform: 'uppercase',
                          letterSpacing: '0.03em',
                          display: 'inline-block'
                        }}>
                          {o.orderStatus}
                        </span>
                      </td>

                      {/* Action */}
                      <td style={{ padding: '16px' }}>
                        {o.orderStatus === 'PENDING' ? (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                            <button 
                              className="btn-accept" 
                              onClick={() => handleAccept(o._id)}
                              style={{ padding: '6px 12px', fontSize: '0.8rem', fontWeight: '700', borderRadius: '6px' }}
                            >
                              <i className="fa-solid fa-check"></i> Dispatch &amp; Accept
                            </button>
                            <button 
                              className="btn-reject" 
                              onClick={() => handleReject(o._id)}
                              style={{ padding: '6px 12px', fontSize: '0.8rem', fontWeight: '600', borderRadius: '6px' }}
                            >
                              <i className="fa-solid fa-xmark"></i> Reject
                            </button>
                            <button
                              onClick={() => setSelectedLabelOrder(o)}
                              style={{
                                background: '#10B981',
                                color: '#090D16',
                                border: 'none',
                                padding: '6px 8px',
                                borderRadius: '6px',
                                fontSize: '0.74rem',
                                fontWeight: '800',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '5px',
                                justifyContent: 'center',
                                boxShadow: '0 1px 2px rgba(16, 185, 129, 0.2)'
                              }}
                            >
                              <i className="fa-solid fa-barcode"></i> Package Barcode
                            </button>
                            <button
                              onClick={() => setSelectedInvoiceOrder(o)}
                              style={{
                                background: '#F1F5F9',
                                color: '#334155',
                                border: '1px solid #CBD5E1',
                                padding: '5px 8px',
                                borderRadius: '6px',
                                fontSize: '0.74rem',
                                fontWeight: '700',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px',
                                justifyContent: 'center'
                              }}
                            >
                              <i className="fa-solid fa-file-invoice" style={{ color: '#2563EB' }}></i> Tax Invoice
                            </button>
                          </div>
                        ) : (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                            <span style={{ fontSize: '0.8rem', color: '#059669', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '5px' }}>
                              <i className="fa-solid fa-circle-check"></i> Dispatched / Active
                            </span>
                            <button
                              onClick={() => setSelectedLabelOrder(o)}
                              style={{
                                background: '#10B981',
                                color: '#090D16',
                                border: 'none',
                                padding: '7px 10px',
                                borderRadius: '6px',
                                fontSize: '0.76rem',
                                fontWeight: '800',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                                justifyContent: 'center',
                                boxShadow: '0 2px 4px rgba(16, 185, 129, 0.3)'
                              }}
                            >
                              <i className="fa-solid fa-barcode"></i> Package Barcode Label
                            </button>
                            <button
                              onClick={() => setSelectedInvoiceOrder(o)}
                              style={{
                                background: '#0F172A',
                                color: '#FFFFFF',
                                border: 'none',
                                padding: '6px 10px',
                                borderRadius: '6px',
                                fontSize: '0.76rem',
                                fontWeight: '700',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                                justifyContent: 'center',
                                boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                              }}
                            >
                              <i className="fa-solid fa-file-invoice-dollar" style={{ color: '#10B981' }}></i> Tax Invoice
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Official Package Shipping Label & Barcode Modal */}
      {selectedLabelOrder && (
        <PackageShippingLabelModal
          order={selectedLabelOrder}
          sellerInfo={sellerUser}
          onClose={() => setSelectedLabelOrder(null)}
        />
      )}

      {/* Official Seller Tax Invoice & Packing Slip Modal */}
      {selectedInvoiceOrder && (
        <SellerInvoiceModal
          order={selectedInvoiceOrder}
          sellerInfo={sellerUser}
          onClose={() => setSelectedInvoiceOrder(null)}
        />
      )}
    </div>
  );
}
