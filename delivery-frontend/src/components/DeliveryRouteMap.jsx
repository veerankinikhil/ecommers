import React, { useEffect, useRef, useState } from 'react';

// Permanent AP/TS Warehouses Fallback
export const PERMANENT_WAREHOUSES = [
  {
    _id: 'wh-gnt',
    name: 'Guntur Regional Logistics Hub',
    code: 'WH-AP-GNT01',
    type: 'Regional Sorting Hub',
    city: 'Guntur',
    address: 'Nallapadu Industrial Estate, Guntur',
    location: { lat: 16.3067, lng: 80.4365 },
    manager: { name: 'Venkat Rao', phone: '+91 98482 33445' }
  },
  {
    _id: 'wh-ten',
    name: 'Tenali Delivery Branch Hub',
    code: 'WH-AP-TEN01',
    type: 'Delivery Branch',
    city: 'Tenali',
    address: 'Station Road, Near Goods Yard, Tenali',
    location: { lat: 16.2437, lng: 80.6400 },
    manager: { name: 'Phani Kumar', phone: '+91 98483 44556' }
  },
  {
    _id: 'wh-vja',
    name: 'Vijayawada Central Mother Hub',
    code: 'WH-AP-VJA01',
    type: 'Mother Warehouse',
    city: 'Vijayawada',
    address: 'Autonagar Industrial Area, Vijayawada',
    location: { lat: 16.5062, lng: 80.6480 },
    manager: { name: 'Suresh Varma', phone: '+91 98480 11223' }
  },
  {
    _id: 'wh-mgl',
    name: 'Mangalagiri Sorting Hub',
    code: 'WH-AP-MGL01',
    type: 'Regional Sorting Hub',
    city: 'Mangalagiri',
    address: 'Near AIIMS Highway Corridor, Mangalagiri',
    location: { lat: 16.4328, lng: 80.5683 },
    manager: { name: 'K. Prasad', phone: '+91 98485 66778' }
  },
  {
    _id: 'wh-hyd',
    name: 'Hyderabad Mega Central Hub',
    code: 'WH-TS-HYD01',
    type: 'Mother Warehouse',
    city: 'Hyderabad',
    address: 'Shamshabad Air Cargo Logistics Park, Hyderabad',
    location: { lat: 17.2403, lng: 78.4294 },
    manager: { name: 'K. Venkataramana', phone: '+91 98490 88990' }
  }
];

export default function DeliveryRouteMap({
  activeOrders = [],
  selectedIndex = 0,
  onSelectStop,
  endLocation,
  onEndLocationChange,
  warehouses = []
}) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const layerGroupRef = useRef(null);
  const [mapReady, setMapReady] = useState(false);

  // Available warehouses list
  const allWarehouses = warehouses && warehouses.length > 0 ? warehouses : PERMANENT_WAREHOUSES;

  // Initialize Leaflet Map
  useEffect(() => {
    if (!window.L || !mapContainerRef.current) return;

    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    const L = window.L;
    const initialCenter = [16.3067, 80.4365]; // Guntur Hub Default

    const map = L.map(mapContainerRef.current, {
      zoomControl: true,
      attributionControl: false
    }).setView(initialCenter, 11);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19
    }).addTo(map);

    const layerGroup = L.layerGroup().addTo(map);
    layerGroupRef.current = layerGroup;
    mapInstanceRef.current = map;
    setMapReady(true);

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update map markers, permanent warehouses, and routed polylines
  useEffect(() => {
    if (!mapReady || !mapInstanceRef.current || !window.L) return;

    const L = window.L;
    const map = mapInstanceRef.current;
    const layerGroup = layerGroupRef.current;
    layerGroup.clearLayers();

    const boundsPoints = [];

    // 1. Plot All Permanent Warehouse Locations (Blue Hub Pins)
    allWarehouses.forEach(wh => {
      const lat = wh.location?.lat;
      const lng = wh.location?.lng;
      if (!lat || !lng) return;

      boundsPoints.push([lat, lng]);

      const isMother = wh.type?.includes('Mother');
      const hubIconHtml = `
        <div style="
          background: ${isMother ? '#1E3A8A' : '#0284C7'};
          color: #fff;
          width: 32px;
          height: 32px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 3px 8px rgba(0,0,0,0.3);
          border: 2px solid #FFFFFF;
          font-size: 14px;
        ">
          <i class="fa-solid fa-warehouse"></i>
        </div>
      `;

      const customHubIcon = L.divIcon({
        html: hubIconHtml,
        className: 'custom-hub-icon',
        iconSize: [32, 32],
        iconAnchor: [16, 16],
        popupAnchor: [0, -18]
      });

      const marker = L.marker([lat, lng], { icon: customHubIcon }).addTo(layerGroup);
      marker.bindPopup(`
        <div style="font-family: sans-serif; padding: 4px; min-width: 200px;">
          <div style="font-size: 0.72rem; color: #0284C7; font-weight: 800; text-transform: uppercase;">
            ${wh.type || 'Permanent Logistics Hub'}
          </div>
          <strong style="font-size: 0.92rem; color: #0F172A; display: block; margin: 2px 0;">
            ${wh.name}
          </strong>
          <div style="font-size: 0.76rem; color: #475569; margin-bottom: 4px;">
            Code: <strong>${wh.code}</strong> &bull; ${wh.city}
          </div>
          <div style="font-size: 0.74rem; color: #64748B;">
            📍 ${wh.address || wh.city}
          </div>
          ${wh.manager ? `
            <div style="font-size: 0.74rem; color: #1E293B; margin-top: 4px; padding-top: 4px; border-top: 1px solid #E2E8F0;">
              👤 Manager: <strong>${wh.manager.name}</strong> (${wh.manager.phone || 'Dock Office'})
            </div>
          ` : ''}
        </div>
      `);
    });

    // 2. Plot Delivery Stops (Numbered Waypoints)
    const routePoints = [];
    // Start from origin (Guntur Hub or origin warehouse)
    const originLat = 16.3067;
    const originLng = 80.4365;
    routePoints.push([originLat, originLng]);

    activeOrders.forEach((ord, idx) => {
      const coords = ord.deliveryAddress?.coordinates || { lat: 16.3067 + (idx + 1) * 0.015, lng: 80.4365 + (idx + 1) * 0.02 };
      const isSelected = idx === selectedIndex;
      const isOutForDelivery = ord.orderStatus === 'OUT_FOR_DELIVERY';
      const isDelivered = ord.orderStatus === 'DELIVERED';

      boundsPoints.push([coords.lat, coords.lng]);
      routePoints.push([coords.lat, coords.lng]);

      const pinBg = isSelected ? '#2563EB' : isDelivered ? '#16A34A' : isOutForDelivery ? '#D97706' : '#475569';
      const stopPinHtml = `
        <div style="
          background: ${pinBg};
          color: #fff;
          width: 32px;
          height: 32px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 10px rgba(0,0,0,0.35);
          border: 3px solid ${isSelected ? '#FBBF24' : '#FFFFFF'};
          font-weight: 800;
          font-size: 14px;
          cursor: pointer;
        ">
          ${idx + 1}
        </div>
      `;

      const stopIcon = L.divIcon({
        html: stopPinHtml,
        className: 'stop-pin-icon',
        iconSize: [32, 32],
        iconAnchor: [16, 16],
        popupAnchor: [0, -18]
      });

      const stopMarker = L.marker([coords.lat, coords.lng], { icon: stopIcon }).addTo(layerGroup);
      
      stopMarker.on('click', () => {
        if (onSelectStop) onSelectStop(idx);
      });

      stopMarker.bindPopup(`
        <div style="font-family: sans-serif; padding: 4px; min-width: 210px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
            <span style="background: ${pinBg}; color: #fff; font-size: 0.72rem; font-weight: 800; padding: 2px 6px; borderRadius: 4px;">
              STOP #${idx + 1}
            </span>
            <span style="font-size: 0.72rem; font-weight: 700; color: #475569;">
              ${ord.orderStatus}
            </span>
          </div>
          <strong style="font-size: 0.95rem; color: #0F172A; display: block;">
            Order #${ord.orderNumber}
          </strong>
          <div style="font-size: 0.8rem; color: #1E293B; margin-top: 4px;">
            👤 ${ord.deliveryAddress?.fullName} &bull; 📞 <strong>${ord.deliveryAddress?.phone || 'N/A'}</strong>
          </div>
          <div style="font-size: 0.76rem; color: #475569; margin-top: 2px;">
            📍 ${ord.deliveryAddress?.street}, <strong>${ord.deliveryAddress?.city}</strong>
          </div>
          <div style="font-size: 0.75rem; color: #059669; font-weight: 700; margin-top: 6px; padding-top: 4px; border-top: 1px solid #E2E8F0;">
            ${ord.paymentMethod === 'Cash on Delivery (COD)' ? `COD: ₹${ord.totalAmount}` : 'Prepaid Order (Deliver Direct)'}
          </div>
        </div>
      `);

      if (isSelected) {
        stopMarker.openPopup();
      }
    });

    // 3. Connect End Location if selected
    if (endLocation && endLocation.lat && endLocation.lng) {
      boundsPoints.push([endLocation.lat, endLocation.lng]);
      routePoints.push([endLocation.lat, endLocation.lng]);

      const endIconHtml = `
        <div style="
          background: #DC2626;
          color: #fff;
          width: 34px;
          height: 34px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 10px rgba(220, 38, 38, 0.4);
          border: 2px solid #FFFFFF;
          font-size: 15px;
        ">
          <i class="fa-solid fa-flag-checkered"></i>
        </div>
      `;

      const endIcon = L.divIcon({
        html: endIconHtml,
        className: 'end-dest-icon',
        iconSize: [34, 34],
        iconAnchor: [17, 17],
        popupAnchor: [0, -18]
      });

      const endMarker = L.marker([endLocation.lat, endLocation.lng], { icon: endIcon }).addTo(layerGroup);
      endMarker.bindPopup(`
        <div style="font-family: sans-serif; padding: 4px;">
          <div style="font-size: 0.72rem; color: #DC2626; font-weight: 800;">ROUTE FINISH / RETURN HUB</div>
          <strong style="font-size: 0.95rem; color: #0F172A;">${endLocation.name}</strong>
          <p style="font-size: 0.76rem; color: #64748B; margin: 4px 0 0 0;">
            All delivery route packages sequenced toward this final return point.
          </p>
        </div>
      `);
    }

    // 4. Draw Route Polyline
    if (routePoints.length > 1) {
      L.polyline(routePoints, {
        color: '#2563EB',
        weight: 4,
        opacity: 0.85,
        dashArray: '8, 8',
        lineJoin: 'round'
      }).addTo(layerGroup);
    }

    // 5. Fit bounds smoothly if bounds exist
    if (boundsPoints.length > 0) {
      try {
        map.fitBounds(boundsPoints, { padding: [40, 40], maxZoom: 14 });
      } catch (err) {}
    }
  }, [mapReady, activeOrders, selectedIndex, endLocation, allWarehouses]);

  const handleCenterSelected = () => {
    if (!mapInstanceRef.current || !activeOrders[selectedIndex]) return;
    const ord = activeOrders[selectedIndex];
    const coords = ord.deliveryAddress?.coordinates;
    if (coords && coords.lat && coords.lng) {
      mapInstanceRef.current.flyTo([coords.lat, coords.lng], 15, { duration: 1 });
    }
  };

  const handleFitAll = () => {
    if (!mapInstanceRef.current) return;
    const allPoints = [];
    allWarehouses.forEach(w => {
      if (w.location?.lat) allPoints.push([w.location.lat, w.location.lng]);
    });
    activeOrders.forEach(o => {
      const c = o.deliveryAddress?.coordinates;
      if (c?.lat) allPoints.push([c.lat, c.lng]);
    });
    if (allPoints.length > 0) {
      mapInstanceRef.current.fitBounds(allPoints, { padding: [40, 40] });
    }
  };

  return (
    <div style={{
      background: '#FFFFFF',
      border: '1px solid #CBD5E1',
      borderRadius: '16px',
      overflow: 'hidden',
      boxShadow: '0 4px 20px rgba(15, 23, 42, 0.08)',
      marginBottom: '24px'
    }}>
      {/* Interactive Controls Bar */}
      <div style={{
        background: '#0F172A',
        color: '#FFFFFF',
        padding: '14px 20px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem' }}>
            <i className="fa-solid fa-map-location-dot"></i>
          </div>
          <div>
            <div style={{ fontWeight: '800', fontSize: '0.98rem' }}>
              In-App Fleet Radar &amp; Route Sequencing Map
            </div>
            <div style={{ fontSize: '0.74rem', color: '#94A3B8' }}>
              Permanent Hubs Plotted &bull; Strictly No Google Maps Redirect &bull; Dynamic Re-Sequencing
            </div>
          </div>
        </div>

        {/* End-Location Selector Dropdown */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <label style={{ fontSize: '0.76rem', color: '#93C5FD', fontWeight: '700', textTransform: 'uppercase' }}>
              <i className="fa-solid fa-flag-checkered" style={{ color: '#F87171' }}></i> End Location:
            </label>
            <select
              value={endLocation?.code || 'TENALI'}
              onChange={(e) => {
                const val = e.target.value;
                if (val === 'TENALI') {
                  onEndLocationChange({ code: 'TENALI', name: 'Tenali Delivery Branch Hub', lat: 16.2437, lng: 80.6400 });
                } else if (val === 'GUNTUR') {
                  onEndLocationChange({ code: 'GUNTUR', name: 'Guntur Regional Logistics Hub', lat: 16.3067, lng: 80.4365 });
                } else if (val === 'VIJAYAWADA') {
                  onEndLocationChange({ code: 'VIJAYAWADA', name: 'Vijayawada Central Mother Hub', lat: 16.5062, lng: 80.6480 });
                } else if (val === 'MANGALAGIRI') {
                  onEndLocationChange({ code: 'MANGALAGIRI', name: 'Mangalagiri Sorting Hub', lat: 16.4328, lng: 80.5683 });
                } else if (val === 'FINAL_STOP') {
                  onEndLocationChange({ code: 'FINAL_STOP', name: 'Final Customer Stop (One-Way)', lat: null, lng: null });
                }
              }}
              style={{
                background: '#1E293B',
                color: '#FFFFFF',
                border: '1px solid #334155',
                padding: '6px 12px',
                borderRadius: '6px',
                fontSize: '0.8rem',
                fontWeight: '700',
                cursor: 'pointer'
              }}
            >
              <option value="TENALI">End at Tenali Delivery Branch Hub (Return Hub)</option>
              <option value="GUNTUR">End at Guntur Regional Logistics Hub (Origin)</option>
              <option value="VIJAYAWADA">End at Vijayawada Central Mother Hub</option>
              <option value="MANGALAGIRI">End at Mangalagiri Sorting Hub</option>
              <option value="FINAL_STOP">End at Final Customer Stop (One-Way)</option>
            </select>
          </div>

          <div style={{ display: 'flex', gap: '6px' }}>
            <button
              onClick={handleCenterSelected}
              style={{
                background: '#2563EB',
                color: '#fff',
                border: 'none',
                padding: '6px 12px',
                borderRadius: '6px',
                fontSize: '0.78rem',
                fontWeight: '700',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '5px'
              }}
              title="Focus on selected active stop"
            >
              <i className="fa-solid fa-crosshairs"></i> Focus Stop #{selectedIndex + 1}
            </button>
            <button
              onClick={handleFitAll}
              style={{
                background: '#334155',
                color: '#fff',
                border: 'none',
                padding: '6px 12px',
                borderRadius: '6px',
                fontSize: '0.78rem',
                fontWeight: '700',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '5px'
              }}
              title="Show entire route and all permanent hubs"
            >
              <i className="fa-solid fa-arrows-to-eye"></i> View All Hubs
            </button>
          </div>
        </div>
      </div>

      {/* Embedded Leaflet Map Container */}
      <div
        ref={mapContainerRef}
        style={{
          width: '100%',
          height: '380px',
          background: '#E2E8F0',
          position: 'relative',
          zIndex: 1
        }}
      />

      {/* Map Legend Footer */}
      <div style={{
        padding: '10px 18px',
        background: '#F8FAFC',
        borderTop: '1px solid #E2E8F0',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '10px',
        fontSize: '0.78rem',
        color: '#475569'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '12px', height: '12px', background: '#0284C7', borderRadius: '3px', display: 'inline-block' }}></span>
            <span>Permanent Hubs ({allWarehouses.length})</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '12px', height: '12px', background: '#2563EB', borderRadius: '50%', display: 'inline-block' }}></span>
            <span>Customer Delivery Stops ({activeOrders.length})</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '12px', height: '12px', background: '#DC2626', borderRadius: '3px', display: 'inline-block' }}></span>
            <span>Route End Destination</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '20px', height: '2px', background: '#2563EB', borderTop: '2px dashed #2563EB', display: 'inline-block' }}></span>
            <span>Optimized Sequence Path</span>
          </div>
        </div>

        <div style={{ fontWeight: '700', color: '#0F172A' }}>
          <i className="fa-solid fa-shield-halved" style={{ color: '#10B981', marginRight: '4px' }}></i>
          100% In-App Map (Zero External Redirects)
        </div>
      </div>
    </div>
  );
}
