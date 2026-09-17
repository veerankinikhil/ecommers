import React from 'react';
import MobileDeliveryTopBar from './MobileDeliveryTopBar';
import DeliveryBottomNav from './DeliveryBottomNav';
import BarcodeScannerModal from './BarcodeScannerModal';
import { useDeliveryAuth } from '../context/DeliveryAuthContext';

export default function MobileAppLayout({ children, activeOrdersCount = 0 }) {
  const { isScanModalOpen, openScanner, closeScanner, fetchStats } = useDeliveryAuth() || {};

  const handleOrderClaimedFromNavScan = () => {
    if (closeScanner) closeScanner();
    if (fetchStats) fetchStats();
  };

  return (
    <div className="mobile-viewport-wrapper">
      {/* Phone Screen Ratio Container (Pure mobile screen ratio, no phone shape/chassis) */}
      <div className="delivery-mobile-container">
        
        {/* Compact Fleet App Bar */}
        <MobileDeliveryTopBar />

        {/* Scrollable Screen Body */}
        <div className="delivery-screen-body">
          {children}
        </div>

        {/* Bottom Nav with Geometric Shapes */}
        <DeliveryBottomNav
          onOpenScanner={openScanner}
          activeOrdersCount={activeOrdersCount}
        />

        {/* Global Barcode Scanner Modal */}
        <BarcodeScannerModal
          isOpen={isScanModalOpen}
          onClose={closeScanner}
          onOrderClaimed={handleOrderClaimedFromNavScan}
        />

      </div>
    </div>
  );
}
