import React, { useState, useEffect } from 'react';

export default function MobileStatusBar() {
  const [timeStr, setTimeStr] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(now.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{
      height: '38px',
      padding: '6px 20px 0 20px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      background: '#0F172A',
      color: '#FFFFFF',
      fontSize: '0.78rem',
      fontWeight: '700',
      letterSpacing: '0.2px',
      userSelect: 'none',
      position: 'sticky',
      top: 0,
      zIndex: 1001
    }}>
      {/* Left Time */}
      <span style={{ fontFamily: 'sans-serif' }}>
        {timeStr || '9:41 AM'}
      </span>

      {/* Center Dynamic Island Notch */}
      <div style={{
        width: '90px',
        height: '20px',
        background: '#020617',
        borderRadius: '16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '6px',
        border: '1px solid rgba(255,255,255,0.08)'
      }}>
        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#1E293B' }}></div>
        <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#0284C7' }}></div>
      </div>

      {/* Right Icons: 5G, Wi-Fi, Battery */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.72rem' }}>
        <span style={{ fontSize: '0.68rem', fontWeight: '800', letterSpacing: '0.5px' }}>5G</span>
        <i className="fa-solid fa-wifi"></i>
        <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
          <i className="fa-solid fa-battery-three-quarters" style={{ fontSize: '0.9rem', color: '#10B981' }}></i>
        </div>
      </div>
    </div>
  );
}
