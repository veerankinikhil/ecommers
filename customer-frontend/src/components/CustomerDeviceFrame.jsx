import React, { useState, useEffect } from 'react';
import { useDeviceMode } from '../context/DeviceModeContext';
import CustomerMobileBottomNav from './CustomerMobileBottomNav';

export default function CustomerDeviceFrame({ children }) {
  const { deviceMode, isPhone, isTablet, isWeb, isRealMobile } = useDeviceMode();
  const [timeStr, setTimeStr] = useState('9:41');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const h = now.getHours();
      const m = now.getMinutes().toString().padStart(2, '0');
      setTimeStr(`${h}:${m}`);
    };
    updateTime();
    const interval = setInterval(updateTime, 30000);
    return () => clearInterval(interval);
  }, []);

  // ════════════════════════════════════════════════════════════════════════
  // 1. REAL SMARTPHONE / MOBILE DEVICE (Direct edge-to-edge native phone UX)
  // ════════════════════════════════════════════════════════════════════════
  if (isRealMobile) {
    return (
      <div
        className="customer-app-wrapper mobile-real-phone-wrapper"
        data-device-mode="phone"
        style={{
          width: '100%',
          height: '100dvh',
          background: '#F4F6F8',
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden'
        }}
      >
        {/* Scrollable screen body (the between screen that moves) */}
        <div className="customer-screen-body" style={{ flex: '1 1 auto', minHeight: 0, width: '100%', overflowY: 'auto', overflowX: 'hidden' }}>
          {children}
        </div>

        {/* Amazon-style Constant Bottom Navigation Bar */}
        <div style={{ flexShrink: 0, width: '100%', zIndex: 99999 }}>
          <CustomerMobileBottomNav isRealMobile={false} />
        </div>
      </div>
    );
  }

  // ════════════════════════════════════════════════════════════════════════
  // 2. FULL WEB VIEWPORT (DESKTOP)
  // ════════════════════════════════════════════════════════════════════════
  if (isWeb) {
    return (
      <div className="customer-app-wrapper desktop-web-wrapper" data-device-mode="web">
        {children}
      </div>
    );
  }

  // ════════════════════════════════════════════════════════════════════════
  // 3. IPAD / TABLET SIMULATOR VIEWPORT (ON DESKTOP)
  // ════════════════════════════════════════════════════════════════════════
  if (isTablet) {
    return (
      <div className="device-simulator-backdrop" style={{
        minHeight: '100vh',
        background: 'radial-gradient(circle at 50% 20%, #1E293B 0%, #090D16 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '50px 16px 20px 16px'
      }}>
        <div className="tablet-frame" style={{
          width: '100%',
          maxWidth: '820px',
          height: '92vh',
          maxHeight: '1050px',
          background: '#FFFFFF',
          borderRadius: '30px',
          border: '4px solid #334155',
          boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.8), 0 0 0 1px rgba(255, 255, 255, 0.1)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          position: 'relative'
        }}>
          {/* Tablet Top Bezel */}
          <div style={{
            height: '22px',
            background: '#0F172A',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            flexShrink: 0
          }}>
            <div style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: '#1E293B',
              border: '1.5px solid #475569'
            }}></div>
            <span style={{
              position: 'absolute',
              right: '18px',
              fontSize: '0.65rem',
              color: '#94A3B8',
              fontWeight: '700'
            }}>
              IPAD TAB &bull; {timeStr}
            </span>
          </div>

          {/* Tablet Scrollable Body */}
          <div
            className="device-screen-body"
            data-device-mode="tab"
            style={{
              flex: 1,
              overflowY: 'auto',
              overflowX: 'hidden',
              background: '#F4F6F8'
            }}
          >
            {children}
          </div>

          {/* Tablet Home Bar */}
          <div style={{
            height: '14px',
            background: '#0F172A',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}>
            <div style={{
              width: '180px',
              height: '4px',
              background: 'rgba(255, 255, 255, 0.3)',
              borderRadius: '4px'
            }}></div>
          </div>
        </div>
      </div>
    );
  }

  // ════════════════════════════════════════════════════════════════════════
  // 4. PHONE RATIO VIEWPORT (ON DESKTOP SIMULATOR)
  // ════════════════════════════════════════════════════════════════════════
  return (
    <div className="customer-phone-ratio-backdrop" style={{
      height: '100dvh',
      width: '100%',
      background: '#0B1120',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'stretch',
      overflow: 'hidden',
      paddingTop: '50px'
    }}>
      <div
        className="customer-app-wrapper mobile-real-phone-wrapper"
        data-device-mode="phone"
        style={{
          width: '100%',
          maxWidth: '430px',
          height: 'calc(100dvh - 50px)',
          background: '#F4F6F8',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          boxShadow: '0 0 35px rgba(0, 0, 0, 0.45)',
          overflow: 'hidden'
        }}
      >
        {/* Scrollable screen body (the between screen that moves) */}
        <div className="customer-screen-body" style={{ flex: '1 1 auto', minHeight: 0, width: '100%', overflowY: 'auto', overflowX: 'hidden' }}>
          {children}
        </div>

        {/* Amazon-style Constant Bottom Navigation Bar */}
        <div style={{ flexShrink: 0, width: '100%', zIndex: 99999 }}>
          <CustomerMobileBottomNav isRealMobile={false} />
        </div>
      </div>
    </div>
  );
}
