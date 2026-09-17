import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { SellerAuthProvider, useSellerAuth } from './context/SellerAuthContext';
import SellerSidebar from './components/SellerSidebar';

// Pages
import SellerDashboard from './pages/SellerDashboard';
import SellerProducts from './pages/SellerProducts';
import AddProductPage from './pages/AddProductPage';
import EditProductPage from './pages/EditProductPage';
import SellerOrders from './pages/SellerOrders';
import SellerProfile from './pages/SellerProfile';
import SellerPayouts from './pages/SellerPayouts';
import SellerLogin from './pages/SellerLogin';
import SellerRegister from './pages/SellerRegister';

import './styles/seller.css';

function ProtectedSellerLayout({ children }) {
  const { sellerUser } = useSellerAuth();
  if (!sellerUser) return <Navigate to="/login" replace />;

  if (!sellerUser.isApproved) {
    return (
      <div className="seller-layout">
        <SellerSidebar />
        <main className="seller-content" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F3F4F6' }}>
          <div style={{ textAlign: 'center', padding: '3rem', background: 'white', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', maxWidth: '600px' }}>
            <h2 style={{ fontSize: '1.8rem', color: '#F59E0B', marginBottom: '1rem' }}>Account at Pending Stage</h2>
            <p style={{ color: '#4B5563', fontSize: '1.1rem', lineHeight: '1.6' }}>
              Your merchant store application is currently pending admin approval. 
              Please wait until our team verifies your business license. 
              The dashboard features will unlock upon approval.
            </p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="seller-layout">
      <SellerSidebar />
      <main className="seller-content">
        {children}
      </main>
    </div>
  );
}

export default function App() {
  return (
    <SellerAuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<SellerLogin />} />
          <Route path="/register" element={<SellerRegister />} />
          
          <Route path="/" element={<ProtectedSellerLayout><SellerDashboard /></ProtectedSellerLayout>} />
          <Route path="/products" element={<ProtectedSellerLayout><SellerProducts /></ProtectedSellerLayout>} />
          <Route path="/products/new" element={<ProtectedSellerLayout><AddProductPage /></ProtectedSellerLayout>} />
          <Route path="/products/edit/:id" element={<ProtectedSellerLayout><EditProductPage /></ProtectedSellerLayout>} />
          <Route path="/orders" element={<ProtectedSellerLayout><SellerOrders /></ProtectedSellerLayout>} />
          <Route path="/payouts" element={<ProtectedSellerLayout><SellerPayouts /></ProtectedSellerLayout>} />
          <Route path="/profile" element={<ProtectedSellerLayout><SellerProfile /></ProtectedSellerLayout>} />
        </Routes>
      </Router>
    </SellerAuthProvider>
  );
}
