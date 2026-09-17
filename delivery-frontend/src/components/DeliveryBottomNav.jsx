import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';

export default function DeliveryBottomNav({ onOpenScanner, activeOrdersCount = 0 }) {
  const location = useLocation();
  const currentPath = location.pathname;
  return (
    <nav style={{
      height: '64px',
      minHeight: '64px',
      maxHeight: '64px',
      background: '#0F172A',
      borderTop: '1px solid #1E293B',
      display: 'flex',
      justifyContent: 'space-around',
      alignItems: 'center',
      flexShrink: 0,
      zIndex: 1000,
      padding: '0 8px calc(4px + env(safe-area-inset-bottom, 0px)) 8px',
      boxShadow: '0 -4px 20px rgba(0,0,0,0.3)',
      userSelect: 'none'
    }}>
      {/* SHAPE 1: Radar / Duty Compass (Circle) */}
      <NavLink
        to="/"
        title="Duty Radar"
        style={({ isActive }) => ({
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textDecoration: 'none',
          position: 'relative'
        })}
      >
        {({ isActive }) => (
          <div style={{
            width: '42px',
            height: '42px',
            borderRadius: '50%',
            background: isActive ? 'rgba(16, 185, 129, 0.18)' : 'transparent',
            border: isActive ? '2px solid #10B981' : '1px solid transparent',
            color: isActive ? '#10B981' : '#94A3B8',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.2rem',
            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
            transform: isActive ? 'translateY(-2px)' : 'none',
            boxShadow: isActive ? '0 0 14px rgba(16, 185, 129, 0.4)' : 'none'
          }}>
            <i className="fa-solid fa-compass"></i>
          </div>
        )}
      </NavLink>

      {/* SHAPE 2: Active Route Waypoint (Diamond / Route Pin) */}
      <NavLink
        to="/active"
        title="Active Delivery Route"
        style={({ isActive }) => ({
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textDecoration: 'none',
          position: 'relative'
        })}
      >
        {({ isActive }) => (
          <div style={{
            width: '42px',
            height: '42px',
            borderRadius: '12px',
            background: isActive ? 'rgba(56, 189, 248, 0.18)' : 'transparent',
            border: isActive ? '2px solid #38BDF8' : '1px solid transparent',
            color: isActive ? '#38BDF8' : '#94A3B8',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.15rem',
            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
            transform: isActive ? 'translateY(-2px)' : 'none',
            boxShadow: isActive ? '0 0 14px rgba(56, 189, 248, 0.4)' : 'none',
            position: 'relative'
          }}>
            <i className="fa-solid fa-route"></i>
            {activeOrdersCount > 0 && (
              <span style={{
                position: 'absolute',
                top: '-3px',
                right: '-3px',
                background: '#EF4444',
                color: '#fff',
                fontSize: '0.62rem',
                fontWeight: '900',
                width: '16px',
                height: '16px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '2px solid #0F172A'
              }}>
                {activeOrdersCount}
              </span>
            )}
          </div>
        )}
      </NavLink>

      {/* SHAPE 3: Center Elevated Floating Circular Barcode Scanner */}
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', margin: '0 4px' }}>
        <button
          type="button"
          onClick={onOpenScanner}
          title="Scan Warehouse Package Barcode"
          style={{
            width: '52px',
            height: '52px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #10B981 0%, #047857 100%)',
            border: '3px solid #0F172A',
            color: '#090D16',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.4rem',
            cursor: 'pointer',
            boxShadow: '0 4px 18px rgba(16, 185, 129, 0.55)',
            transform: 'translateY(-10px)',
            transition: 'transform 0.15s ease'
          }}
          onMouseDown={(e) => { e.currentTarget.style.transform = 'translateY(-8px) scale(0.95)'; }}
          onMouseUp={(e) => { e.currentTarget.style.transform = 'translateY(-10px) scale(1)'; }}
        >
          <i className="fa-solid fa-barcode"></i>
        </button>
      </div>

      {/* SHAPE 4: Earnings / Wallet (Hexagonal Card Shape) */}
      <NavLink
        to="/earnings"
        title="Earnings & Disbursals"
        style={({ isActive }) => ({
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textDecoration: 'none',
          position: 'relative'
        })}
      >
        {({ isActive }) => (
          <div style={{
            width: '42px',
            height: '42px',
            borderRadius: '12px',
            background: isActive ? 'rgba(251, 191, 36, 0.18)' : 'transparent',
            border: isActive ? '2px solid #FBBF24' : '1px solid transparent',
            color: isActive ? '#FBBF24' : '#94A3B8',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.15rem',
            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
            transform: isActive ? 'translateY(-2px)' : 'none',
            boxShadow: isActive ? '0 0 14px rgba(251, 191, 36, 0.4)' : 'none'
          }}>
            <i className="fa-solid fa-wallet"></i>
          </div>
        )}
      </NavLink>

      {/* SHAPE 5: Delivery History (Clock / Shield Shape) */}
      <NavLink
        to="/history"
        title="Delivery History"
        style={({ isActive }) => ({
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textDecoration: 'none',
          position: 'relative'
        })}
      >
        {({ isActive }) => (
          <div style={{
            width: '42px',
            height: '42px',
            borderRadius: '12px',
            background: isActive ? 'rgba(168, 85, 247, 0.18)' : 'transparent',
            border: isActive ? '2px solid #A855F7' : '1px solid transparent',
            color: isActive ? '#A855F7' : '#94A3B8',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.15rem',
            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
            transform: isActive ? 'translateY(-2px)' : 'none',
            boxShadow: isActive ? '0 0 14px rgba(168, 85, 247, 0.4)' : 'none'
          }}>
            <i className="fa-solid fa-clock-rotate-left"></i>
          </div>
        )}
      </NavLink>
    </nav>
  );
}
