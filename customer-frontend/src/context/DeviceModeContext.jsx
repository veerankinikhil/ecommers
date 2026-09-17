import React, { createContext, useContext, useState, useEffect } from 'react';

const DeviceModeContext = createContext();

export function DeviceModeProvider({ children }) {
  const [windowWidth, setWindowWidth] = useState(
    typeof window !== 'undefined' ? window.innerWidth : 1200
  );

  const [deviceMode, setDeviceModeState] = useState(() => {
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      return 'phone';
    }
    const saved = localStorage.getItem('novakart_customer_device_mode');
    if (saved && ['web', 'tab', 'phone'].includes(saved)) {
      return saved;
    }
    if (typeof window !== 'undefined') {
      if (window.innerWidth <= 1024) return 'tab';
    }
    return 'web';
  });

  useEffect(() => {
    const handleResize = () => {
      const w = window.innerWidth;
      setWindowWidth(w);
      // Auto-detect mobile screen on physical phones or small windows
      if (w < 768) {
        setDeviceModeState('phone');
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const setDeviceMode = (mode) => {
    if (['web', 'tab', 'phone'].includes(mode)) {
      setDeviceModeState(mode);
      localStorage.setItem('novakart_customer_device_mode', mode);
    }
  };

  const isRealMobile = windowWidth < 768;
  const isPhone = isRealMobile || deviceMode === 'phone';
  const isTablet = !isPhone && (deviceMode === 'tab' || (windowWidth >= 768 && windowWidth <= 1024));
  const isWeb = !isPhone && !isTablet;

  return (
    <DeviceModeContext.Provider value={{
      deviceMode,
      setDeviceMode,
      windowWidth,
      isRealMobile,
      isPhone,
      isTablet,
      isWeb
    }}>
      {children}
    </DeviceModeContext.Provider>
  );
}

export const useDeviceMode = () => useContext(DeviceModeContext);
