import React from 'react';
import { NavLink } from 'react-router-dom';
import { useWarehouseAuth } from '../context/WarehouseAuthContext';

export default function WarehouseNavbar({ warehouse }) {
  const { managerUser, logout } = useWarehouseAuth();

  return (
    <header className="wh-navbar">
      <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
        <NavLink to="/" className="wh-brand">
          <div className="wh-brand-logo">
            <i className="fa-solid fa-warehouse"></i>
          </div>
          <div>
            <div className="wh-brand-title">NovaKart Logistics &amp; Hub Command</div>
            <div className="wh-brand-subtitle">Warehouse Management Operating System</div>
          </div>
        </NavLink>

        {warehouse && (
          <div style={{
            background: 'rgba(59, 130, 246, 0.15)',
            border: '1px solid rgba(59, 130, 246, 0.35)',
            padding: '4px 12px',
            borderRadius: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '0.8rem',
            color: '#93C5FD'
          }}>
            <span style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: warehouse.status === 'active' ? '#10B981' : '#EF4444'
            }}></span>
            <strong style={{ color: '#FFFFFF' }}>{warehouse.name}</strong>
            <span style={{ color: '#60A5FA', fontFamily: 'monospace' }}>[{warehouse.code}]</span>
            <span style={{
              background: warehouse.state === 'Andhra Pradesh' ? '#065F46' : '#92400E',
              color: '#FFFFFF',
              fontSize: '0.68rem',
              padding: '1px 6px',
              borderRadius: '4px',
              fontWeight: '700'
            }}>
              {warehouse.state === 'Andhra Pradesh' ? 'AP' : 'TS'}
            </span>
          </div>
        )}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
        <nav className="wh-nav-links">
          <NavLink to="/" end className={({ isActive }) => `wh-nav-link ${isActive ? 'active' : ''}`}>
            <i className="fa-solid fa-truck-ramp-box"></i> Hub Shipments
          </NavLink>
          <NavLink to="/inventory" className={({ isActive }) => `wh-nav-link ${isActive ? 'active' : ''}`}>
            <i className="fa-solid fa-boxes-stacked"></i> Facility Capacity
          </NavLink>
          <NavLink to="/riders" className={({ isActive }) => `wh-nav-link ${isActive ? 'active' : ''}`}>
            <i className="fa-solid fa-motorcycle"></i> Fleet &amp; Riders
          </NavLink>
        </nav>

        {/* Manager User Pill */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', borderLeft: '1px solid #334155', paddingLeft: '16px' }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontWeight: '700', fontSize: '0.85rem', color: '#FFFFFF' }}>
              {managerUser?.name}
            </div>
            <div style={{ fontSize: '0.72rem', color: '#94A3B8' }}>
              Facility Manager &bull; <span style={{ fontFamily: 'monospace' }}>{managerUser?.employeeId || 'MGR'}</span>
            </div>
          </div>

          <button
            onClick={logout}
            title="Sign Out"
            style={{
              background: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              color: '#F87171',
              padding: '7px 12px',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: '600',
              fontSize: '0.78rem',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <i className="fa-solid fa-right-from-bracket"></i> Exit
          </button>
        </div>
      </div>
    </header>
  );
}
