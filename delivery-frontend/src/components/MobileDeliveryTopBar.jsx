import React from 'react';
import { Link } from 'react-router-dom';
import { useDeliveryAuth } from '../context/DeliveryAuthContext';
import DeliveryNotificationBell from './DeliveryNotificationBell';

export default function MobileDeliveryTopBar() {
  const { agentUser, logout } = useDeliveryAuth();
  const isOnline = agentUser?.isOnline;

  return (
    <header style={{
      height: '56px',
      minHeight: '56px',
      maxHeight: '56px',
      padding: '0 16px',
      background: '#0F172A',
      borderBottom: '1px solid #1E293B',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      flexShrink: 0,
      zIndex: 1000,
      color: '#FFFFFF'
    }}>
      {/* Brand & Duty Status */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#fff', textDecoration: 'none' }}>
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: '8px',
            background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
            color: '#090D16',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1rem',
            fontWeight: '900'
          }}>
            <i className="fa-solid fa-motorcycle"></i>
          </div>
          <div>
            <div style={{ fontSize: '0.88rem', fontWeight: '900', letterSpacing: '-0.2px' }}>
              Nova<span style={{ color: '#10B981' }}>Fleet</span>
            </div>
            <div style={{ fontSize: '0.64rem', color: isOnline ? '#34D399' : '#EF4444', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '3px', marginTop: '-2px' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: isOnline ? '#10B981' : '#EF4444' }}></span>
              {isOnline ? 'DUTY ONLINE' : 'OFF DUTY'}
            </div>
          </div>
        </Link>
      </div>

      {/* Right Controls: Notifications & Profile / Logout */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <DeliveryNotificationBell />
        <Link
          to="/profile"
          style={{
            background: '#1E293B',
            color: '#CBD5E1',
            border: '1px solid #334155',
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '0.85rem'
          }}
          title={agentUser?.fullName || 'Profile'}
        >
          <i className="fa-solid fa-user-shield"></i>
        </Link>
        <button
          onClick={logout}
          style={{
            background: 'rgba(239, 68, 68, 0.15)',
            color: '#F87171',
            border: 'none',
            width: '30px',
            height: '30px',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            fontSize: '0.78rem'
          }}
          title="Logout"
        >
          <i className="fa-solid fa-arrow-right-from-bracket"></i>
        </button>
      </div>
    </header>
  );
}
