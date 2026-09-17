import React from 'react';

const STAGES = [
  { key: 'PENDING', label: 'Order Placed', icon: 'fa-cart-shopping' },
  { key: 'SELLER_ACCEPTED', label: 'Seller Packed', icon: 'fa-box-open' },
  { key: 'AGENT_ASSIGNED', label: 'Agent Assigned', icon: 'fa-id-badge' },
  { key: 'PICKED_UP', label: 'Picked Up', icon: 'fa-truck-ramp-box' },
  { key: 'OUT_FOR_DELIVERY', label: 'Out for Delivery', icon: 'fa-motorcycle' },
  { key: 'DELIVERED', label: 'Delivered', icon: 'fa-circle-check' }
];

export default function OrderStepper({ currentStatus }) {
  const stageKeys = STAGES.map(s => s.key);
  let currentIndex = stageKeys.indexOf(currentStatus);
  if (currentStatus === 'DELIVERY_REQUESTED') currentIndex = 1; // Between packed & agent assigned
  if (currentIndex === -1) currentIndex = 0;

  return (
    <div className="stepper-container">
      {STAGES.map((stage, idx) => {
        const isPassedOrActive = idx <= currentIndex;
        return (
          <div key={stage.key} className={`step-item ${isPassedOrActive ? 'active' : ''}`}>
            <div className="step-icon">
              <i className={`fa-solid ${stage.icon}`}></i>
            </div>
            <span className="step-label">{stage.label}</span>
          </div>
        );
      })}
    </div>
  );
}
