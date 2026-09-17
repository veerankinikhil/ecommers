import React, { useState } from 'react';
import { useDeviceMode } from '../context/DeviceModeContext';

export default function DeviceSwitcherBar() {
  const { deviceMode, setDeviceMode, isRealMobile } = useDeviceMode();
  const [isCollapsed, setIsCollapsed] = useState(false);

  // On actual physical smartphones, hide the switcher so the Amazon interface is 100% clean and unblocked
  if (isRealMobile) {
    return null;
  }

  const devices = [
    {
      id: 'web',
      label: 'Web',
      fullName: 'Desktop View',
      icon: 'fa-solid fa-desktop',
      widthLabel: '100% Full Width'
    },
    {
      id: 'tab',
      label: 'Tab',
      fullName: 'iPad / Tablet',
      icon: 'fa-solid fa-tablet-screen-button',
      widthLabel: '820px iPad'
    },
    {
      id: 'phone',
      label: 'Phone',
      fullName: 'Mobile Phone',
      icon: 'fa-solid fa-mobile-screen',
      widthLabel: '414px Mobile'
    }
  ];

  if (isCollapsed) {
    return (
      <button
        onClick={() => setIsCollapsed(false)}
        style={{
          position: 'fixed',
          top: '12px',
          right: '16px',
          zIndex: 99999,
          background: '#0F172A',
          color: '#F8FAFC',
          border: '1.5px solid #38BDF8',
          borderRadius: '30px',
          padding: '6px 14px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          cursor: 'pointer',
          boxShadow: '0 4px 16px rgba(0,0,0,0.4)',
          fontSize: '0.78rem',
          fontWeight: '700'
        }}
        title="Open Device Viewport Switcher"
      >
        <i className={deviceMode === 'web' ? 'fa-solid fa-desktop' : deviceMode === 'tab' ? 'fa-solid fa-tablet-screen-button' : 'fa-solid fa-mobile-screen'} style={{ color: '#38BDF8' }}></i>
        <span>{deviceMode.toUpperCase()} VIEW</span>
        <i className="fa-solid fa-chevron-down" style={{ fontSize: '0.7rem' }}></i>
      </button>
    );
  }

  return (
    <aside
      aria-label="Device Interface Switcher"
      style={{
        position: 'fixed',
        top: '10px',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 99999,
        background: 'rgba(15, 23, 42, 0.92)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 255, 255, 0.15)',
        borderRadius: '32px',
        padding: '5px 8px 5px 14px',
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.45), 0 0 0 1px rgba(56, 189, 248, 0.3)',
        color: '#FFFFFF',
        fontFamily: 'sans-serif'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        <span style={{
          width: '7px',
          height: '7px',
          borderRadius: '50%',
          background: '#10B981',
          boxShadow: '0 0 6px #10B981',
          display: 'inline-block'
        }}></span>
        <span style={{ fontSize: '0.72rem', fontWeight: '800', color: '#94A3B8', letterSpacing: '0.5px' }}>
          VIEWPORT:
        </span>
      </div>

      {/* Mode Buttons */}
      <div style={{ display: 'flex', background: 'rgba(255,255,255,0.06)', borderRadius: '24px', padding: '3px' }}>
        {devices.map((d) => {
          const isActive = deviceMode === d.id;
          return (
            <button
              key={d.id}
              onClick={() => setDeviceMode(d.id)}
              style={{
                background: isActive ? '#38BDF8' : 'transparent',
                color: isActive ? '#0F172A' : '#CBD5E1',
                border: 'none',
                borderRadius: '20px',
                padding: '6px 14px',
                fontSize: '0.78rem',
                fontWeight: '800',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'all 0.18s ease',
                boxShadow: isActive ? '0 2px 8px rgba(56, 189, 248, 0.4)' : 'none'
              }}
              title={`Switch to ${d.fullName} (${d.widthLabel})`}
            >
              <i className={d.icon} style={{ fontSize: '0.85rem' }}></i>
              <span>{d.label}</span>
              {isActive && (
                <span style={{
                  fontSize: '0.62rem',
                  fontWeight: '800',
                  background: 'rgba(15, 23, 42, 0.2)',
                  padding: '1px 5px',
                  borderRadius: '10px'
                }}>
                  {d.id === 'web' ? '100%' : d.id === 'tab' ? '820px' : '414px'}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Collapse button */}
      <button
        onClick={() => setIsCollapsed(true)}
        style={{
          background: 'transparent',
          border: 'none',
          color: '#94A3B8',
          cursor: 'pointer',
          padding: '4px 6px',
          fontSize: '0.76rem',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
        title="Minimize Switcher"
      >
        <i className="fa-solid fa-chevron-up"></i>
      </button>
    </aside>
  );
}
