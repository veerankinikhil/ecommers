import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { PaymentAuthProvider, usePaymentAuth } from './context/PaymentAuthContext';
import PaymentLogin from './pages/PaymentLogin';
import TreasuryDashboard from './pages/TreasuryDashboard';

function ProtectedApp() {
  const { user, loading } = usePaymentAuth();

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#090D16', color: '#10B981', fontFamily: 'sans-serif' }}>
        <div style={{ textAlign: 'center' }}>
          <i className="fa-solid fa-circle-notch fa-spin" style={{ fontSize: '2.5rem', marginBottom: '14px' }}></i>
          <p style={{ fontWeight: '600', color: '#94A3B8' }}>Connecting to NovaKart Nodal Treasury Core...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <PaymentLogin />;
  }

  return (
    <Routes>
      <Route path="/" element={<TreasuryDashboard />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <PaymentAuthProvider>
        <ProtectedApp />
      </PaymentAuthProvider>
    </BrowserRouter>
  );
}
