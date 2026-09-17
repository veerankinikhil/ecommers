import React, { useEffect, useState } from 'react';
import { useDeliveryAuth } from '../context/DeliveryAuthContext';
import deliveryApi, { formatINR } from '../services/deliveryApi';
import RadarOfferCard from '../components/RadarOfferCard';
import BarcodeScannerModal from '../components/BarcodeScannerModal';
import { useNavigate } from 'react-router-dom';

export default function DutyDashboard() {
  const { agentUser, incomingRadarOffers, setIncomingRadarOffers } = useDeliveryAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(agentUser?.isOnline || false);
  const [lat, setLat] = useState('16.3067');
  const [lng, setLng] = useState('80.4365');
  const [isScanModalOpen, setIsScanModalOpen] = useState(false);
  const navigate = useNavigate();

  const fetchStats = () => {
    deliveryApi.get('/delivery/dashboard-stats')
      .then(({ data }) => {
        setStats(data.stats);
        setIsOnline(data.stats?.isOnline);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  const fetchRadarRequests = () => {
    deliveryApi.get('/orders/delivery/radar-requests')
      .then(({ data }) => {
        if (data.requests) {
          const formatted = data.requests.map(r => ({
            requestId: r._id,
            orderId: r.orderId?._id,
            orderNumber: r.orderId?.orderNumber,
            sellerStoreName: r.orderId?.sellerId?.storeName,
            pickupAddress: r.orderId?.pickupLocation?.address || r.orderId?.sellerId?.businessAddress,
            deliveryAddress: r.orderId?.deliveryAddress?.street + ', ' + r.orderId?.deliveryAddress?.city,
            distanceKm: r.distanceKm,
            payoutAmount: r.payoutAmount,
            customerName: r.orderId?.deliveryAddress?.fullName
          }));
          setIncomingRadarOffers(formatted);
        }
      })
      .catch(() => {});
  };

  useEffect(() => {
    fetchStats();
    fetchRadarRequests();
  }, []);

  const handleToggleDuty = async () => {
    try {
      const { data } = await deliveryApi.put('/delivery/toggle-duty');
      setIsOnline(data.isOnline);
      alert(data.message);
      if (data.isOnline) fetchRadarRequests();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to toggle duty');
    }
  };

  const handleUpdateGps = async () => {
    try {
      await deliveryApi.put('/delivery/location', { lat, lng });
      alert('📍 Live GPS coordinates synced with MongoDB.');
    } catch (err) {
      alert('Failed to sync location');
    }
  };

  const handleAcceptOffer = async (requestId) => {
    try {
      const { data } = await deliveryApi.put(`/orders/delivery/requests/${requestId}/accept`);
      alert('🎉 Delivery request accepted! Proceeding to active delivery route.');
      setIncomingRadarOffers(prev => prev.filter(o => o.requestId !== requestId));
      navigate('/active');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to accept request.');
    }
  };

  const handleRejectOffer = (requestId) => {
    setIncomingRadarOffers(prev => prev.filter(o => o.requestId !== requestId));
  };

  const handleOrderClaimedFromModal = () => {
    setIsScanModalOpen(false);
    navigate('/active');
  };

  return (
    <main className="delivery-container" style={{ padding: '16px 12px 28px 12px' }}>
      
      {/* Top Bar Duty Switch */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '18px' }}>
        <div>
          <h1 style={{ fontSize: '1.4rem', fontWeight: '800', color: '#0F172A', margin: 0 }}>Delivery Radar &amp; Duty Deck</h1>
          <p style={{ color: '#64748B', fontSize: '0.8rem', marginTop: '2px' }}>Automated proximity dispatch &bull; Warehouse barcode scanner pickup</p>
        </div>

        <button
          className={`duty-toggle-btn ${isOnline ? 'duty-online' : 'duty-offline'}`}
          onClick={handleToggleDuty}
          style={{ width: '100%', justifyContent: 'center', padding: '10px 16px', fontSize: '0.86rem' }}
        >
          <i className="fa-solid fa-power-off"></i> {isOnline ? 'DUTY ONLINE (Accepting Deliveries)' : 'OFFLINE (Tap to Go on Duty)'}
        </button>
      </div>

      {/* Temporary Password Change Notice */}
      {stats?.mustChangePassword && (
        <div style={{
          background: '#FEF3C7',
          border: '1px solid #FDE68A',
          color: '#92400E',
          padding: '12px 18px',
          borderRadius: '10px',
          marginBottom: '20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '10px',
          fontSize: '0.86rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <i className="fa-solid fa-triangle-exclamation" style={{ fontSize: '1.2rem', color: '#D97706' }}></i>
            <div>
              <strong>Initial Temporary Password Active:</strong> Your account is currently using the initial password issued by the warehouse manager. Please set your own private password.
            </div>
          </div>
          <button
            onClick={() => navigate('/profile')}
            style={{
              background: '#92400E',
              color: '#FFFFFF',
              border: 'none',
              padding: '6px 14px',
              borderRadius: '6px',
              fontSize: '0.78rem',
              fontWeight: '700',
              cursor: 'pointer'
            }}
          >
            Update Password &rarr;
          </button>
        </div>
      )}

      {/* WAREHOUSE PACKAGE PICKUP DOCK CARD */}
      <div style={{
        background: 'linear-gradient(135deg, #1E3A8A 0%, #172554 100%)',
        color: '#FFFFFF',
        borderRadius: '14px',
        padding: '20px 24px',
        marginBottom: '20px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '16px',
        boxShadow: '0 4px 16px rgba(30, 58, 138, 0.15)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '12px',
            background: '#3B82F6',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.5rem',
            flexShrink: 0
          }}>
            <i className="fa-solid fa-barcode"></i>
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <span style={{ fontSize: '0.72rem', background: '#60A5FA', color: '#172554', fontWeight: '800', padding: '2px 8px', borderRadius: '4px' }}>
                WAREHOUSE DOCK DISPATCH
              </span>
              <span style={{ fontSize: '0.75rem', color: '#93C5FD' }}>
                Guntur Hub ➔ Etukuru ➔ Budampadu ➔ Prathipadu Corridor
              </span>
            </div>
            <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: '800' }}>
              Pick Up Route Packages by Barcode / Last 6 Digits
            </h3>
            <p style={{ margin: '4px 0 0 0', fontSize: '0.82rem', color: '#CBD5E1' }}>
              Scan package barcode or type last 6 digits of Order ID (e.g. 722101). The system automatically arranges deliveries area-wise with Etukuru at top!
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsScanModalOpen(true)}
          className="btn-agent"
          style={{
            background: '#22C55E',
            color: '#FFFFFF',
            fontWeight: '800',
            padding: '12px 20px',
            fontSize: '0.9rem',
            border: 'none',
            borderRadius: '8px',
            boxShadow: '0 2px 8px rgba(34, 197, 94, 0.3)'
          }}
        >
          <i className="fa-solid fa-barcode"></i> Scan / Enter 6 Digits
        </button>
      </div>

      {/* ACTIVE ROUTE BANNER */}
      {stats?.activeOrdersCount > 0 && (
        <div style={{ background: 'linear-gradient(135deg, #1E293B 0%, #0F172A 100%)', color: '#fff', padding: '16px 22px', borderRadius: '12px', marginBottom: '22px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}>
          <div>
            <span style={{ fontSize: '0.78rem', background: '#2563EB', padding: '3px 10px', borderRadius: '12px', fontWeight: '800', textTransform: 'uppercase' }}>
              Multi-Order Route Active
            </span>
            <h3 style={{ margin: '6px 0 2px 0', fontSize: '1.15rem', fontWeight: '800' }}>
              You have {stats.activeOrdersCount} order(s) in progress on your route
            </h3>
            <p style={{ margin: 0, fontSize: '0.82rem', color: '#94A3B8' }}>
              Route Capacity: {stats.activeOrdersCount} / {stats.maxConcurrentOrders || 5} orders. Arranged area-wise for step-by-step travel efficiency.
            </p>
          </div>
          <button
            className="btn-agent btn-agent-amber"
            style={{ fontWeight: '800', padding: '10px 18px' }}
            onClick={() => navigate('/active')}
          >
            <i className="fa-solid fa-route"></i> Open Route Stops &amp; Deliver One by One
          </button>
        </div>
      )}

      {/* STATS */}
      <div className="agent-grid">
        <div className="agent-card">
          <span className="agent-lbl">Today's Earnings</span>
          <div className="agent-val" style={{ color: '#10B981' }}>{formatINR(stats?.totalEarnings || 0)}</div>
        </div>
        <div className="agent-card">
          <span className="agent-lbl">Active Route Queue</span>
          <div className="agent-val" style={{ color: '#2563EB' }}>
            {stats?.activeOrdersCount || 0} <span style={{ fontSize: '0.8rem', color: '#64748B' }}>/ {stats?.maxConcurrentOrders || 5} orders</span>
          </div>
        </div>
        <div className="agent-card">
          <span className="agent-lbl">Completed Orders</span>
          <div className="agent-val">{stats?.completedDeliveries || 0}</div>
        </div>
        <div className="agent-card">
          <span className="agent-lbl">Vehicle Assigned</span>
          <div className="agent-val" style={{ fontSize: '1.1rem', color: '#1A237E' }}>{stats?.vehicleType} ({stats?.vehicleNumber})</div>
        </div>
      </div>

      {/* LIVE RADAR */}
      <div className="radar-box">
        <div className="radar-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span className="radar-pulse"></span>
            <h2 style={{ fontSize: '1.3rem', fontWeight: '700' }}>Nearby Delivery Radar Stream</h2>
          </div>
          <span style={{ fontSize: '0.82rem', color: '#94A3B8' }}>
            {isOnline ? 'Live Socket.IO Dispatch Active' : 'Go online to receive nearby delivery requests'}
          </span>
        </div>

        {incomingRadarOffers.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 0', color: '#94A3B8' }}>
            <i className="fa-solid fa-satellite" style={{ fontSize: '2.4rem', marginBottom: '10px' }}></i>
            <p>{isOnline ? 'Scanning for nearby seller orders within 15 km...' : 'You are currently offline. Turn on duty switch above to start receiving deliveries.'}</p>
          </div>
        ) : (
          incomingRadarOffers.map((offer, idx) => (
            <RadarOfferCard
              key={offer.requestId || idx}
              offer={offer}
              onAccept={handleAcceptOffer}
              onReject={handleRejectOffer}
            />
          ))
        )}
      </div>

      {/* GPS COORDINATES SIMULATOR */}
      <div style={{ background: '#fff', border: '1px solid var(--agent-border)', borderRadius: '10px', padding: '24px' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '12px' }}>
          <i className="fa-solid fa-location-crosshairs" style={{ color: 'var(--agent-accent)' }}></i> GPS Proximity Coordinates Simulator
        </h3>
        <p style={{ fontSize: '0.85rem', color: '#64748B', marginBottom: '16px' }}>
          Simulate your current GPS location to test nearby distance calculations against warehouse hubs and delivery destinations.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
          <div>
            <label style={{ fontSize: '0.78rem', fontWeight: '700', color: '#475569' }}>Latitude</label>
            <input type="text" className="form-input" value={lat} onChange={(e) => setLat(e.target.value)} />
          </div>
          <div>
            <label style={{ fontSize: '0.78rem', fontWeight: '700', color: '#475569' }}>Longitude</label>
            <input type="text" className="form-input" value={lng} onChange={(e) => setLng(e.target.value)} />
          </div>
        </div>
        <button className="btn-agent btn-agent-primary" style={{ width: '100%', justifyContent: 'center' }} onClick={handleUpdateGps}>
          <i className="fa-solid fa-location-arrow"></i> Update Location in DB
        </button>
      </div>

      {/* Barcode Scanner Modal */}
      <BarcodeScannerModal
        isOpen={isScanModalOpen}
        onClose={() => setIsScanModalOpen(false)}
        onOrderClaimed={handleOrderClaimedFromModal}
      />

    </main>
  );
}
