import React, { useEffect, useState } from 'react';
import deliveryApi, { formatINR } from '../services/deliveryApi';
import { useNavigate, Link } from 'react-router-dom';
import BarcodeScannerModal from '../components/BarcodeScannerModal';
import BarcodeVisual from '../components/BarcodeVisual';
import DeliveryRouteMap, { PERMANENT_WAREHOUSES } from '../components/DeliveryRouteMap';
import CustomerCallModal from '../components/CustomerCallModal';
import DoorstepDeliveryScanModal from '../components/DoorstepDeliveryScanModal';

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

export default function ActiveDeliveryPage() {
  const [activeOrders, setActiveOrders] = useState([]);
  const [activeOrder, setActiveOrder] = useState(null);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [deliveryNote, setDeliveryNote] = useState('');
  const [isScanModalOpen, setIsScanModalOpen] = useState(false);
  const [isDoorstepScanModalOpen, setIsDoorstepScanModalOpen] = useState(false);
  const [isCallModalOpen, setIsCallModalOpen] = useState(false);
  const [customerContactedMap, setCustomerContactedMap] = useState({});
  const [warehouses, setWarehouses] = useState(PERMANENT_WAREHOUSES);
  const [endLocation, setEndLocation] = useState({
    code: 'TENALI',
    name: 'Tenali Delivery Branch Hub',
    lat: 16.2437,
    lng: 80.6400
  });
  const navigate = useNavigate();

  const handleCallCompleted = (outcome) => {
    if (!activeOrder) return;
    setCustomerContactedMap(prev => ({
      ...prev,
      [activeOrder._id]: outcome
    }));
    setDeliveryNote(`📞 Customer contacted (${outcome.replace(/_/g, ' ')}). Ready for delivery handover!`);
  };

  const fetchActiveOrders = (customEndLoc = endLocation) => {
    setLoading(true);
    const params = {};
    if (customEndLoc?.lat && customEndLoc?.lng) {
      params.endLat = customEndLoc.lat;
      params.endLng = customEndLoc.lng;
      params.endName = customEndLoc.name;
    }
    deliveryApi.get('/delivery/dashboard-stats', { params })
      .then(({ data }) => {
        const orders = data.activeOrders || (data.activeOrder ? [data.activeOrder] : []);
        setActiveOrders(orders);
        if (orders.length > 0) {
          setSelectedIndex(prev => (prev < orders.length ? prev : 0));
          setActiveOrder(orders[selectedIndex < orders.length ? selectedIndex : 0]);
        } else {
          setActiveOrder(null);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchActiveOrders(endLocation);
    // Fetch permanent warehouses from backend
    deliveryApi.get('/warehouses')
      .then(({ data }) => {
        if (data.warehouses && data.warehouses.length > 0) {
          setWarehouses(data.warehouses);
        }
      })
      .catch(() => {});
  }, []);

  const handleEndLocationChange = (newEndLoc) => {
    setEndLocation(newEndLoc);
    fetchActiveOrders(newEndLoc);
  };

  // Sync activeOrder when selectedIndex or activeOrders change
  useEffect(() => {
    if (activeOrders.length > 0) {
      const idx = selectedIndex < activeOrders.length ? selectedIndex : 0;
      setActiveOrder(activeOrders[idx]);
    } else {
      setActiveOrder(null);
    }
  }, [selectedIndex, activeOrders]);

  const handleUpdateStatus = async (nextStatus) => {
    if (!activeOrder) return;
    setUpdating(true);
    try {
      await deliveryApi.put(`/orders/delivery/${activeOrder._id}/update-status`, { status: nextStatus });
      
      if (nextStatus === 'DELIVERED') {
        const remainingCount = activeOrders.length - 1;
        if (remainingCount > 0) {
          alert(`🎉 Stop Delivered! Payout credited to your earnings.\n\n👉 Next stop: ${remainingCount} delivery remaining on this route. Advancing to next stop...`);
          setDeliveryNote(`Order #${activeOrder.orderNumber} delivered successfully. Next stop ready!`);
          setSelectedIndex(0);
          fetchActiveOrders();
        } else {
          alert('🎉 All route deliveries completed successfully! Payouts credited to your earnings.');
          navigate('/earnings');
        }
      } else {
        alert(`✅ Status updated to: ${nextStatus.replace(/_/g, ' ')}`);
        fetchActiveOrders();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update delivery status');
    } finally {
      setUpdating(false);
    }
  };

  const handleOrderClaimedFromScan = (claimedOrder, updatedActiveOrders) => {
    if (updatedActiveOrders && updatedActiveOrders.length > 0) {
      setActiveOrders(updatedActiveOrders);
      setActiveOrder(updatedActiveOrders[0]);
      setSelectedIndex(0);
    } else {
      fetchActiveOrders();
    }
  };

  if (loading) {
    return (
      <div className="delivery-container" style={{ padding: '60px 20px', textAlign: 'center' }}>
        <i className="fa-solid fa-circle-notch fa-spin" style={{ fontSize: '2rem', color: 'var(--agent-primary)' }}></i>
        <p style={{ marginTop: '14px', color: '#64748B' }}>Loading route delivery assignments &amp; waypoint sequence...</p>
      </div>
    );
  }

  if (!activeOrders || activeOrders.length === 0) {
    return (
      <div className="delivery-container" style={{ padding: '60px 20px', textAlign: 'center' }}>
        <div style={{ background: '#fff', border: '1px solid var(--agent-border)', borderRadius: '16px', padding: '50px 20px', maxWidth: '640px', margin: '0 auto', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
          <div style={{ width: '70px', height: '70px', borderRadius: '50%', background: '#EFF6FF', color: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', margin: '0 auto 20px auto' }}>
            <i className="fa-solid fa-route"></i>
          </div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '800', color: '#1E293B', marginBottom: '8px' }}>
            No Active Route Deliveries
          </h2>
          <p style={{ color: '#64748B', maxWidth: '480px', margin: '0 auto 24px auto', fontSize: '0.92rem', lineHeight: '1.6' }}>
            Pick up route packages from the delivery branch warehouse by scanning barcodes or entering the last 6 digits of the Order ID.
            The system will automatically arrange deliveries area-wise (e.g. <strong>Etukuru</strong> at the top first, then <strong>Budampadu</strong>, then <strong>Prathipadu</strong>).
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', flexWrap: 'wrap' }}>
            <button
              className="btn-agent"
              style={{ background: '#2563EB', color: '#FFFFFF', padding: '12px 22px', fontSize: '0.92rem', fontWeight: '700' }}
              onClick={() => setIsScanModalOpen(true)}
            >
              <i className="fa-solid fa-barcode"></i> Scan Warehouse Packages
            </button>
            <button
              className="btn-agent"
              style={{ background: '#0F172A', color: '#FFFFFF', padding: '12px 22px', fontSize: '0.92rem', fontWeight: '700' }}
              onClick={() => navigate('/')}
            >
              <i className="fa-solid fa-radar"></i> Live Dispatch Radar
            </button>
          </div>
        </div>

        <BarcodeScannerModal
          isOpen={isScanModalOpen}
          onClose={() => setIsScanModalOpen(false)}
          onOrderClaimed={handleOrderClaimedFromScan}
        />
      </div>
    );
  }

  return (
    <main className="delivery-container" style={{ padding: '30px 20px' }}>
      <div style={{ maxWidth: '1020px', margin: '0 auto' }}>
        
        {/* Route Overview Header */}
        <div style={{
          background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)',
          borderRadius: '16px',
          padding: '24px 28px',
          color: '#fff',
          marginBottom: '20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px',
          boxShadow: '0 8px 24px rgba(15, 23, 42, 0.12)'
        }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(56, 189, 248, 0.15)', border: '1px solid rgba(56, 189, 248, 0.3)', padding: '4px 12px', borderRadius: '20px', fontSize: '0.76rem', fontWeight: '800', color: '#38BDF8', marginBottom: '8px', letterSpacing: '0.5px' }}>
              <i className="fa-solid fa-network-wired"></i> AUTOMATED AREA-WISE SEQUENCED ROUTE
            </div>
            <h1 style={{ fontSize: '1.65rem', fontWeight: '800', margin: 0 }}>
              Route Queue: {activeOrders.length} {activeOrders.length === 1 ? 'Package' : 'Packages'} on Route
            </h1>
            <p style={{ margin: '6px 0 0 0', fontSize: '0.86rem', color: '#94A3B8' }}>
              Optimized travel sequence: Closer areas (e.g. <strong>Etukuru</strong>) are ordered at the top first, continuing outward along the delivery corridor.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <button
              onClick={() => setIsScanModalOpen(true)}
              className="btn-agent"
              style={{ background: '#2563EB', color: '#fff', border: 'none', padding: '10px 18px', fontSize: '0.85rem', fontWeight: '700' }}
            >
              <i className="fa-solid fa-barcode"></i> Pick Up / Scan Package
            </button>
            <Link to="/" className="btn-agent" style={{ background: 'rgba(255,255,255,0.12)', color: '#fff', border: 'none', padding: '10px 16px', fontSize: '0.82rem', fontWeight: '700' }}>
              <i className="fa-solid fa-radar"></i> Radar
            </Link>
            <Link to="/earnings" className="btn-agent" style={{ background: 'var(--agent-amber)', color: '#131921', border: 'none', padding: '10px 16px', fontSize: '0.82rem', fontWeight: '700' }}>
              <i className="fa-solid fa-wallet"></i> Earnings
            </Link>
          </div>
        </div>

        {deliveryNote && (
          <div style={{ background: '#ECFDF5', border: '1px solid #A7F3D0', color: '#065F46', padding: '14px 18px', borderRadius: '10px', fontSize: '0.88rem', fontWeight: '600', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <i className="fa-solid fa-circle-check" style={{ fontSize: '1.1rem' }}></i> {deliveryNote}
          </div>
        )}

        {/* IN-APP INTERACTIVE FLEET RADAR & ROUTE SEQUENCING MAP */}
        <DeliveryRouteMap
          activeOrders={activeOrders}
          selectedIndex={selectedIndex}
          onSelectStop={(idx) => setSelectedIndex(idx)}
          endLocation={endLocation}
          onEndLocationChange={handleEndLocationChange}
          warehouses={warehouses}
        />

        {/* VISUAL CORRIDOR WAYPOINT PROGRESSION STEPPER */}
        <div style={{
          background: '#FFFFFF',
          border: '1px solid #E2E8F0',
          borderRadius: '14px',
          padding: '16px 20px',
          marginBottom: '20px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '8px' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: '800', color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              <i className="fa-solid fa-route" style={{ color: '#2563EB', marginRight: '6px' }}></i>
              Route Corridor Progression (Origin ➔ Waypoints):
            </span>
            <span style={{ fontSize: '0.76rem', fontWeight: '700', color: '#059669', background: '#D1FAE5', padding: '3px 10px', borderRadius: '12px' }}>
              ✓ Auto-Arranged Area Wise
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', overflowX: 'auto', paddingBottom: '6px', gap: '8px' }}>
            {/* Origin Warehouse Node */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 12px',
              borderRadius: '8px',
              background: '#F1F5F9',
              border: '1px solid #CBD5E1',
              flexShrink: 0
            }}>
              <i className="fa-solid fa-warehouse" style={{ color: '#0F172A', fontSize: '0.9rem' }}></i>
              <div>
                <div style={{ fontSize: '0.72rem', fontWeight: '800', color: '#475569' }}>ORIGIN HUB</div>
                <div style={{ fontSize: '0.8rem', fontWeight: '700', color: '#0F172A' }}>Guntur Hub</div>
              </div>
            </div>

            {/* Waypoint Arrows & Stops */}
            {activeOrders.map((ord, idx) => {
              const isSelected = idx === selectedIndex;
              const area = ord.routeSequence?.areaName || ord.deliveryAddress?.city || 'Local Area';
              const isEtukuru = area.toLowerCase().includes('etukuru');
              const dist = ord.routeSequence?.totalDistanceFromOriginKm;

              return (
                <React.Fragment key={ord._id || idx}>
                  <i className="fa-solid fa-chevron-right" style={{ color: '#94A3B8', fontSize: '0.75rem', flexShrink: 0 }}></i>
                  <div
                    onClick={() => setSelectedIndex(idx)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '8px 12px',
                      borderRadius: '8px',
                      background: isSelected ? '#EFF6FF' : isEtukuru ? '#F0FDF4' : '#F8FAFC',
                      border: isSelected ? '2px solid #2563EB' : isEtukuru ? '1px solid #86EFAC' : '1px solid #E2E8F0',
                      cursor: 'pointer',
                      flexShrink: 0,
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <div style={{
                      width: '24px',
                      height: '24px',
                      borderRadius: '50%',
                      background: isSelected ? '#2563EB' : isEtukuru ? '#16A34A' : '#64748B',
                      color: '#FFFFFF',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.72rem',
                      fontWeight: '800'
                    }}>
                      {idx + 1}
                    </div>
                    <div>
                      <div style={{ fontSize: '0.7rem', fontWeight: '800', color: isSelected ? '#1E40AF' : '#64748B', textTransform: 'uppercase' }}>
                        STOP #{idx + 1} {isEtukuru && idx === 0 ? '(TOP)' : ''}
                      </div>
                      <div style={{ fontSize: '0.82rem', fontWeight: '700', color: '#1E293B' }}>
                        {area} {dist ? `(${dist} km)` : ''}
                      </div>
                    </div>
                  </div>
                </React.Fragment>
              );
            })}

            {/* End Location Route Finish Node */}
            {endLocation && endLocation.lat && (
              <>
                <i className="fa-solid fa-chevron-right" style={{ color: '#DC2626', fontSize: '0.75rem', flexShrink: 0 }}></i>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 12px',
                  borderRadius: '8px',
                  background: '#FEF2F2',
                  border: '1px solid #FECACA',
                  flexShrink: 0
                }}>
                  <i className="fa-solid fa-flag-checkered" style={{ color: '#DC2626', fontSize: '0.9rem' }}></i>
                  <div>
                    <div style={{ fontSize: '0.7rem', fontWeight: '800', color: '#DC2626' }}>ROUTE END HUB</div>
                    <div style={{ fontSize: '0.8rem', fontWeight: '700', color: '#7F1D1D' }}>{endLocation.name}</div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Multi-Stop Sequence Cards Grid */}
        <div style={{ background: '#fff', border: '1px solid var(--agent-border)', borderRadius: '14px', padding: '16px', marginBottom: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
          <div style={{ fontSize: '0.78rem', fontWeight: '800', textTransform: 'uppercase', color: '#64748B', marginBottom: '12px', letterSpacing: '0.5px' }}>
            Route Stops Sequence (Deliver One by One):
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: `repeat(auto-fit, minmax(220px, 1fr))`, gap: '12px' }}>
            {activeOrders.map((ord, idx) => {
              const isSelected = idx === selectedIndex;
              const area = ord.routeSequence?.areaName || ord.deliveryAddress?.city || 'Local Area';
              const isEtukuru = area.toLowerCase().includes('etukuru');
              const rawNum = ord.orderNumber || '';
              const parts = rawNum.split('-');
              const last6 = parts.length > 1 ? parts[parts.length - 1] : rawNum.slice(-6);

              return (
                <div
                  key={ord._id}
                  onClick={() => setSelectedIndex(idx)}
                  style={{
                    cursor: 'pointer',
                    padding: '12px 14px',
                    borderRadius: '10px',
                    border: isSelected ? '2px solid #2563EB' : '1px solid #E2E8F0',
                    background: isSelected ? '#EFF6FF' : '#F8FAFC',
                    transition: 'all 0.2s',
                    position: 'relative'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <span style={{
                      fontSize: '0.72rem',
                      fontWeight: '800',
                      padding: '2px 6px',
                      borderRadius: '4px',
                      background: isEtukuru ? '#DCFCE7' : '#E2E8F0',
                      color: isEtukuru ? '#166534' : '#475569'
                    }}>
                      STOP #{idx + 1} {isEtukuru && idx === 0 ? '• TOP' : ''}
                    </span>
                    <span style={{
                      fontSize: '0.68rem',
                      fontWeight: '800',
                      padding: '2px 8px',
                      borderRadius: '12px',
                      background: ord.orderStatus === 'OUT_FOR_DELIVERY' ? '#FEF3C7' : ord.orderStatus === 'PICKED_UP' ? '#E0E7FF' : '#F1F5F9',
                      color: ord.orderStatus === 'OUT_FOR_DELIVERY' ? '#92400E' : ord.orderStatus === 'PICKED_UP' ? '#3730A3' : '#475569'
                    }}>
                      {ord.orderStatus === 'AGENT_ASSIGNED' ? 'To Pickup' : ord.orderStatus === 'PICKED_UP' ? 'Picked Up' : 'On The Way'}
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '3px' }}>
                    <i className="fa-solid fa-location-dot" style={{ color: isEtukuru ? '#16A34A' : '#2563EB', fontSize: '0.8rem' }}></i>
                    <strong style={{ fontSize: '0.86rem', color: '#0F172A' }}>{area}</strong>
                    {ord.routeSequence?.totalDistanceFromOriginKm && (
                      <span style={{ fontSize: '0.72rem', color: '#64748B' }}>
                        ~{ord.routeSequence.totalDistanceFromOriginKm} km
                      </span>
                    )}
                  </div>

                  <div style={{ fontFamily: 'monospace', fontWeight: '800', fontSize: '0.82rem', color: '#334155' }}>
                    #{rawNum.replace(last6, '')}
                    <span style={{ background: '#FEF08A', padding: '1px 3px', borderRadius: '3px', color: '#854D0E' }}>
                      {last6}
                    </span>
                  </div>

                  <div style={{ fontSize: '0.76rem', color: '#64748B', marginTop: '4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    👤 {ord.deliveryAddress?.fullName || 'Customer'}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Stop Full Action Card */}
        {activeOrder && (
          <div style={{ background: '#fff', border: '1px solid var(--agent-border)', borderRadius: '16px', padding: '28px', boxShadow: '0 4px 16px rgba(0,0,0,0.03)' }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #F1F5F9', paddingBottom: '16px', marginBottom: '22px', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '0.78rem', fontWeight: '800', color: '#2563EB', background: '#DBEAFE', padding: '4px 10px', borderRadius: '6px' }}>
                    ACTIVE STOP #{selectedIndex + 1} OF {activeOrders.length}
                  </span>
                  <span style={{ fontSize: '0.75rem', fontWeight: '700', color: '#166534', background: '#DCFCE7', padding: '4px 10px', borderRadius: '6px' }}>
                    📍 Area: {activeOrder.routeSequence?.areaName || activeOrder.deliveryAddress?.city || 'Local Area'}
                  </span>
                </div>
                <h2 style={{ fontSize: '1.5rem', fontWeight: '800', color: '#1E293B', margin: '8px 0 0 0' }}>
                  Order #{activeOrder.orderNumber}
                </h2>
                <div style={{ fontSize: '0.8rem', color: '#64748B', marginTop: '4px', fontFamily: 'monospace' }}>
                  <i className="fa-regular fa-clock" style={{ color: '#2563EB', marginRight: '5px' }}></i>
                  Placed At: <strong>{formatDateTimeWithSeconds(activeOrder.createdAt)}</strong>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
                {/* Visual Barcode Display */}
                <BarcodeVisual code={activeOrder.orderNumber} width={140} height={32} />
                <span style={{ background: '#F0FDF4', color: '#166534', border: '1px solid #BBF7D0', padding: '8px 16px', borderRadius: '20px', fontWeight: '800', fontSize: '0.88rem' }}>
                  💰 Stop Payout: ₹140.00
                </span>
              </div>
            </div>

            {/* STEP 1: MERCHANT STORE / WAREHOUSE ORIGIN */}
            <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '20px', marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '10px' }}>
                <div>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: '800', color: '#1E293B', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <i className="fa-solid fa-warehouse" style={{ color: '#2563EB' }}></i> 1. Package Origin / Dispatch Point
                  </h4>
                  <p style={{ fontSize: '0.92rem', fontWeight: '700', color: '#334155', margin: '0 0 4px 0' }}>
                    {activeOrder.logisticsRoute?.originWarehouse?.name || activeOrder.sellerId?.storeName || 'Guntur Delivery Branch Hub'}
                  </p>
                  <p style={{ fontSize: '0.82rem', color: '#64748B', margin: '0 0 6px 0' }}>
                    {activeOrder.logisticsRoute?.originWarehouse?.address?.street || activeOrder.sellerId?.businessAddress || 'Guntur Hub Dispatch Dock'}
                  </p>
                  <p style={{ fontSize: '0.82rem', color: '#475569', margin: 0 }}>
                    <i className="fa-solid fa-circle-info" style={{ color: '#2563EB', marginRight: '4px' }}></i>
                    Pickup Mode: <strong>Warehouse Barcode Scan / 6-Digit Claim</strong>
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => window.scrollTo({ top: 180, behavior: 'smooth' })}
                  className="btn-agent"
                  style={{ background: '#EFF6FF', border: '1px solid #BFDBFE', color: '#1E40AF', padding: '8px 14px', fontSize: '0.8rem', fontWeight: '700', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                >
                  <i className="fa-solid fa-map-location-dot" style={{ color: '#2563EB' }}></i> View Dock on In-App Map
                </button>
              </div>
            </div>

            {/* STEP 2: CUSTOMER DESTINATION */}
            <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '20px', marginBottom: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '10px', marginBottom: '14px' }}>
                <div>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: '800', color: '#1E293B', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <i className="fa-solid fa-house-user" style={{ color: '#EF4444' }}></i> 2. Customer Drop-Off Destination
                  </h4>
                  <p style={{ fontSize: '0.92rem', fontWeight: '700', color: '#334155', margin: '0 0 4px 0' }}>
                    {activeOrder.deliveryAddress?.fullName}
                  </p>
                  <p style={{ fontSize: '0.84rem', color: '#0F172A', fontWeight: '600', margin: '0 0 6px 0' }}>
                    📍 {activeOrder.deliveryAddress?.street}, <strong>{activeOrder.deliveryAddress?.city}</strong> - {activeOrder.deliveryAddress?.postalCode}
                  </p>
                  <p style={{ fontSize: '0.82rem', color: '#475569', margin: 0 }}>
                    <i className="fa-solid fa-phone"></i> Customer Phone: <strong>{activeOrder.deliveryAddress?.phone || '+91 98765 43210'}</strong>
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => window.scrollTo({ top: 180, behavior: 'smooth' })}
                  className="btn-agent"
                  style={{ background: '#FEF2F2', border: '1px solid #FECACA', color: '#991B1B', padding: '8px 14px', fontSize: '0.8rem', fontWeight: '700', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                >
                  <i className="fa-solid fa-location-dot" style={{ color: '#DC2626' }}></i> Focus Stop on Map
                </button>
              </div>

              {/* CALL CUSTOMER BEFORE DELIVERY CARD */}
              <div style={{
                background: customerContactedMap[activeOrder._id] ? '#F0FDF4' : '#FFFBEB',
                border: customerContactedMap[activeOrder._id] ? '1px solid #BBF7D0' : '1px solid #FDE68A',
                borderRadius: '10px',
                padding: '12px 14px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '10px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '50%',
                    background: customerContactedMap[activeOrder._id] ? '#16A34A' : '#F59E0B',
                    color: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1rem',
                    flexShrink: 0
                  }}>
                    <i className={customerContactedMap[activeOrder._id] ? 'fa-solid fa-phone-volume' : 'fa-solid fa-phone'}></i>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.82rem', fontWeight: '800', color: customerContactedMap[activeOrder._id] ? '#166534' : '#92400E' }}>
                      {customerContactedMap[activeOrder._id] ? '✅ Customer Contacted Before Handover' : '⚠️ Fleet Protocol: Call Customer Before Delivery'}
                    </div>
                    <div style={{ fontSize: '0.74rem', color: customerContactedMap[activeOrder._id] ? '#15803D' : '#B45309' }}>
                      {customerContactedMap[activeOrder._id] 
                        ? `Handover status: ${customerContactedMap[activeOrder._id].replace(/_/g, ' ')}` 
                        : 'Confirm recipient availability, gate pass & landmark directions'}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    type="button"
                    onClick={() => setIsCallModalOpen(true)}
                    style={{
                      background: 'linear-gradient(135deg, #10B981, #059669)',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '8px',
                      padding: '8px 14px',
                      fontSize: '0.82rem',
                      fontWeight: '800',
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      boxShadow: '0 2px 8px rgba(16, 185, 129, 0.3)'
                    }}
                  >
                    <i className="fa-solid fa-phone-flip"></i> {customerContactedMap[activeOrder._id] ? 'Call Again' : 'Call Customer Now'}
                  </button>
                  {activeOrder.deliveryAddress?.phone && (
                    <a
                      href={`tel:${activeOrder.deliveryAddress.phone}`}
                      style={{
                        background: '#fff',
                        border: '1px solid #CBD5E1',
                        color: '#334155',
                        borderRadius: '8px',
                        padding: '8px 12px',
                        fontSize: '0.82rem',
                        fontWeight: '700',
                        textDecoration: 'none',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                      title="Direct Cellular Dial"
                    >
                      <i className="fa-solid fa-square-phone"></i> Cellular
                    </a>
                  )}
                </div>
              </div>

            </div>

            {/* PACKAGE & ITEMS SUMMARY */}
            <div style={{ background: '#F1F5F9', borderRadius: '8px', padding: '12px 18px', marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
              <span style={{ fontSize: '0.82rem', color: '#475569', fontWeight: '600' }}>
                <i className="fa-solid fa-box"></i> {activeOrder.items?.length || 1} Item(s) in Parcel &bull; {activeOrder.items?.[0]?.name || 'Freight Goods'}
              </span>
              <span style={{ fontSize: '0.86rem', fontWeight: '700', color: '#1E293B' }}>
                Collection: {activeOrder.paymentMethod === 'Cash on Delivery (COD)' ? `COD ${formatINR(activeOrder.totalAmount)}` : 'Prepaid (Online)'}
              </span>
            </div>

            {/* ACTION WORKFLOW BUTTONS FOR CURRENT STOP */}
            <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
              {activeOrder.orderStatus === 'AGENT_ASSIGNED' && (
                <button
                  className="btn-agent btn-agent-primary"
                  style={{ flex: 1, padding: '16px', justifyContent: 'center', fontSize: '0.96rem', fontWeight: '800' }}
                  disabled={updating}
                  onClick={() => handleUpdateStatus('PICKED_UP')}
                >
                  <i className="fa-solid fa-box-check"></i> Mark Stop #{selectedIndex + 1} as Picked Up from Dock
                </button>
              )}

              {activeOrder.orderStatus === 'PICKED_UP' && (
                <button
                  className="btn-agent btn-agent-amber"
                  style={{ flex: 1, padding: '16px', justifyContent: 'center', fontSize: '0.96rem', fontWeight: '800' }}
                  disabled={updating}
                  onClick={() => handleUpdateStatus('OUT_FOR_DELIVERY')}
                >
                  <i className="fa-solid fa-motorcycle"></i> Start Journey for Stop #{selectedIndex + 1} ({activeOrder.routeSequence?.areaName || activeOrder.deliveryAddress?.city})
                </button>
              )}

              {activeOrder.orderStatus === 'OUT_FOR_DELIVERY' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
                  <button
                    className="btn-agent btn-agent-primary"
                    style={{
                      flex: 1,
                      padding: '16px',
                      justifyContent: 'center',
                      fontSize: '0.98rem',
                      fontWeight: '800',
                      background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                      borderColor: '#10B981',
                      boxShadow: '0 4px 18px rgba(16, 185, 129, 0.4)'
                    }}
                    disabled={updating}
                    onClick={() => setIsDoorstepScanModalOpen(true)}
                  >
                    <i className="fa-solid fa-barcode"></i> Scan Package Barcode to Deliver (Stop #{selectedIndex + 1})
                  </button>
                  <span style={{ fontSize: '0.74rem', color: '#64748B', textAlign: 'center' }}>
                    <i className="fa-solid fa-shield-halved" style={{ color: '#10B981' }}></i> Doorstep Proof-of-Delivery Barcode Scan required before customer handover
                  </span>
                </div>
              )}
            </div>

          </div>
        )}

        {/* Warehouse Pickup Barcode Scanner Modal */}
        <BarcodeScannerModal
          isOpen={isScanModalOpen}
          onClose={() => setIsScanModalOpen(false)}
          onOrderClaimed={handleOrderClaimedFromScan}
        />

        {/* Doorstep Proof-of-Delivery Barcode Scan Modal */}
        {isDoorstepScanModalOpen && activeOrder && (
          <DoorstepDeliveryScanModal
            isOpen={isDoorstepScanModalOpen}
            onClose={() => setIsDoorstepScanModalOpen(false)}
            order={activeOrder}
            onDeliveryCompleted={(deliveredOrder, notes) => {
              setDeliveryNote(`🎉 Stop #${selectedIndex + 1} Delivered & Verified via Doorstep Barcode Scan! Payout ₹140 credited.`);
              fetchActiveOrders();
            }}
          />
        )}

        {/* Customer Call Modal (In-App Pre-Delivery Handover Dialing) */}
        {isCallModalOpen && activeOrder && (
          <CustomerCallModal
            order={activeOrder}
            onClose={() => setIsCallModalOpen(false)}
            onCallCompleted={handleCallCompleted}
          />
        )}

      </div>
    </main>
  );
}
