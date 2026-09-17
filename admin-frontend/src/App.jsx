import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AdminAuthProvider, useAdminAuth } from './context/AdminAuthContext';
import AdminSidebar from './components/AdminSidebar';

// Pages
import AdminOverview from './pages/AdminOverview';
import AdminSellers from './pages/AdminSellers';
import AdminDeliveryAgents from './pages/AdminDeliveryAgents';
import AdminCustomers from './pages/AdminCustomers';
import AdminProducts from './pages/AdminProducts';
import AdminOrders from './pages/AdminOrders';
import AdminWarehouses from './pages/AdminWarehouses';
import AdminLogin from './pages/AdminLogin';

import './styles/admin.css';

function ProtectedAdminLayout({ children }) {
  const { adminUser } = useAdminAuth();
  if (!adminUser) return <Navigate to="/login" replace />;

  return (
    <div className="admin-layout">
      <AdminSidebar />
      <main className="admin-content">
        {children}
      </main>
    </div>
  );
}

export default function App() {
  return (
    <AdminAuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<AdminLogin />} />

          <Route path="/" element={<ProtectedAdminLayout><AdminOverview /></ProtectedAdminLayout>} />
          <Route path="/sellers" element={<ProtectedAdminLayout><AdminSellers /></ProtectedAdminLayout>} />
          <Route path="/delivery-agents" element={<ProtectedAdminLayout><AdminDeliveryAgents /></ProtectedAdminLayout>} />
          <Route path="/customers" element={<ProtectedAdminLayout><AdminCustomers /></ProtectedAdminLayout>} />
          <Route path="/users" element={<ProtectedAdminLayout><AdminCustomers /></ProtectedAdminLayout>} />
          <Route path="/products" element={<ProtectedAdminLayout><AdminProducts /></ProtectedAdminLayout>} />
          <Route path="/orders" element={<ProtectedAdminLayout><AdminOrders /></ProtectedAdminLayout>} />
          <Route path="/warehouses" element={<ProtectedAdminLayout><AdminWarehouses /></ProtectedAdminLayout>} />
        </Routes>
      </Router>
    </AdminAuthProvider>
  );
}
