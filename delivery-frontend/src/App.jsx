import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { DeliveryAuthProvider, useDeliveryAuth } from './context/DeliveryAuthContext';
import MobileAppLayout from './components/MobileAppLayout';

// Pages
import DutyDashboard from './pages/DutyDashboard';
import ActiveDeliveryPage from './pages/ActiveDeliveryPage';
import DeliveryHistoryPage from './pages/DeliveryHistoryPage';
import EarningsPage from './pages/EarningsPage';
import AgentLogin from './pages/AgentLogin';
import AgentRegister from './pages/AgentRegister';
import RiderProfilePage from './pages/RiderProfilePage';

import './styles/delivery.css';

function ProtectedDeliveryLayout({ children }) {
  const { agentUser } = useDeliveryAuth();
  if (!agentUser) return <Navigate to="/login" replace />;

  if (!agentUser.isApproved) {
    return (
      <MobileAppLayout>
        <div style={{ textAlign: 'center', padding: '4rem 1.2rem', background: '#0F172A', color: 'white', minHeight: '100%' }}>
          <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'rgba(245, 158, 11, 0.2)', color: '#F59E0B', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.8rem', margin: '0 auto 16px auto' }}>
            <i className="fa-solid fa-clock-rotate-left"></i>
          </div>
          <h2 style={{ fontSize: '1.35rem', marginBottom: '0.8rem', color: '#F59E0B' }}>Application Pending Verification</h2>
          <p style={{ margin: '0 auto', lineHeight: '1.6', fontSize: '0.88rem', color: '#94A3B8' }}>
            Your delivery agent account documents and vehicle registration are currently under review by the warehouse administrator.
          </p>
        </div>
      </MobileAppLayout>
    );
  }

  return (
    <MobileAppLayout>
      {children}
    </MobileAppLayout>
  );
}

function MobileAuthWrapper({ children }) {
  return (
    <div className="mobile-viewport-wrapper">
      <div className="delivery-mobile-container">
        <div className="delivery-screen-body">
          {children}
        </div>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <DeliveryAuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<MobileAuthWrapper><AgentLogin /></MobileAuthWrapper>} />
          <Route path="/register" element={<MobileAuthWrapper><AgentRegister /></MobileAuthWrapper>} />

          <Route path="/" element={<ProtectedDeliveryLayout><DutyDashboard /></ProtectedDeliveryLayout>} />
          <Route path="/active" element={<ProtectedDeliveryLayout><ActiveDeliveryPage /></ProtectedDeliveryLayout>} />
          <Route path="/history" element={<ProtectedDeliveryLayout><DeliveryHistoryPage /></ProtectedDeliveryLayout>} />
          <Route path="/earnings" element={<ProtectedDeliveryLayout><EarningsPage /></ProtectedDeliveryLayout>} />
          <Route path="/profile" element={<ProtectedDeliveryLayout><RiderProfilePage /></ProtectedDeliveryLayout>} />
        </Routes>
      </Router>
    </DeliveryAuthProvider>
  );
}
