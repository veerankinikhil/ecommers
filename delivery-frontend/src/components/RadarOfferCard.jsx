import React from 'react';
import { formatINR } from '../services/deliveryApi';

export default function RadarOfferCard({ offer, onAccept, onReject }) {
  return (
    <div className="offer-card">
      <div className="offer-route">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ background: 'var(--agent-accent)', color: '#0F172A', fontWeight: '800', fontSize: '0.78rem', padding: '2px 8px', borderRadius: '4px' }}>
            ORDER #{offer.orderNumber || 'ORD-9821'}
          </span>
          <span style={{ color: '#FF9900', fontWeight: '700', fontSize: '0.85rem' }}>
            <i className="fa-solid fa-location-arrow"></i> {offer.distanceKm} km away
          </span>
        </div>

        <p style={{ fontSize: '0.9rem', color: '#fff', marginTop: '6px' }}>
          <strong>Pickup Store:</strong> {offer.sellerStoreName || 'NovaKart Merchant'} ({offer.pickupAddress || 'Connaught Place'})
        </p>
        <p style={{ fontSize: '0.85rem', color: '#94A3B8' }}>
          <strong>Drop-off Customer:</strong> {offer.deliveryAddress || 'Delhi Residential'} ({offer.customerName})
        </p>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        <div style={{ textAlign: 'right' }}>
          <span style={{ fontSize: '0.75rem', color: '#94A3B8' }}>COMMISSION PAYOUT</span>
          <div style={{ fontSize: '1.4rem', fontWeight: '800', color: 'var(--agent-accent)' }}>
            {formatINR(offer.payoutAmount || 140)}
          </div>
        </div>

        <button className="btn-agent btn-agent-primary" onClick={() => onAccept(offer.requestId || offer._id)}>
          <i className="fa-solid fa-check"></i> Accept Delivery
        </button>
        <button className="btn-agent" style={{ background: 'rgba(239,68,68,0.2)', color: '#EF4444' }} onClick={() => onReject(offer.requestId || offer._id)}>
          Decline
        </button>
      </div>
    </div>
  );
}
