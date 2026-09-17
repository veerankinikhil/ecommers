import React, { useState } from 'react';
import { useSellerAuth } from '../context/SellerAuthContext';
import sellerApi from '../services/sellerApi';

export default function SellerProfile() {
  const { sellerUser } = useSellerAuth();
  const [storeName, setStoreName] = useState(sellerUser?.storeName || '');
  const [phone, setPhone] = useState(sellerUser?.phone || '');
  const [businessAddress, setBusinessAddress] = useState('Connaught Place, Central Hub, New Delhi');
  const [lat, setLat] = useState('28.6139');
  const [lng, setLng] = useState('77.2090');

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await sellerApi.put('/sellers/profile', {
        storeName,
        phone,
        businessAddress,
        lat,
        lng
      });
      alert('Store location coordinates & profile saved.');
    } catch (err) {
      alert('Failed to update store profile.');
    }
  };

  return (
    <div>
      <div className="seller-top-header">
        <div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: '800' }}>Store Profile &amp; Location Coordinates</h1>
          <p style={{ color: '#64748B', fontSize: '0.88rem' }}>Coordinates are used by the nearby delivery agent Haversine algorithm</p>
        </div>
      </div>

      <div className="form-card">
        <form onSubmit={handleUpdate} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ fontSize: '0.85rem', fontWeight: '600' }}>Store / Merchant Business Name</label>
            <input type="text" className="form-input" value={storeName} onChange={(e) => setStoreName(e.target.value)} required />
          </div>

          <div>
            <label style={{ fontSize: '0.85rem', fontWeight: '600' }}>Contact Phone</label>
            <input type="tel" className="form-input" value={phone} onChange={(e) => setPhone(e.target.value)} required />
          </div>

          <div>
            <label style={{ fontSize: '0.85rem', fontWeight: '600' }}>Store Pickup Address</label>
            <input type="text" className="form-input" value={businessAddress} onChange={(e) => setBusinessAddress(e.target.value)} required />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label style={{ fontSize: '0.85rem', fontWeight: '600' }}>Latitude (GPS)</label>
              <input type="text" className="form-input" value={lat} onChange={(e) => setLat(e.target.value)} required />
            </div>
            <div>
              <label style={{ fontSize: '0.85rem', fontWeight: '600' }}>Longitude (GPS)</label>
              <input type="text" className="form-input" value={lng} onChange={(e) => setLng(e.target.value)} required />
            </div>
          </div>

          <button type="submit" className="btn-seller btn-seller-primary" style={{ padding: '12px', justifyContent: 'center' }}>
            Save Store Coordinates &amp; Settings
          </button>
        </form>
      </div>
    </div>
  );
}
