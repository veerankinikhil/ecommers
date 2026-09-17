import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { WarehouseAuthProvider, useWarehouseAuth } from './context/WarehouseAuthContext';
import warehouseApi from './services/warehouseApi';
import WarehouseNavbar from './components/WarehouseNavbar';
import WarehouseLogin from './pages/WarehouseLogin';
import WarehouseDashboard from './pages/WarehouseDashboard';
import WarehouseInventory from './pages/WarehouseInventory';
import WarehouseRiders from './pages/WarehouseRiders';
import './styles/warehouse.css';

function ProtectedWarehouseLayout({ children }) {
  const { managerUser, isInitialized } = useWarehouseAuth();
  const [warehouse, setWarehouse] = useState(null);
  const [loadingWh, setLoadingWh] = useState(true);

  useEffect(() => {
    if (managerUser) {
      warehouseApi.get('/warehouses/my-warehouse')
        .then(({ data }) => setWarehouse(data.warehouse))
        .catch((err) => console.error('Error fetching my warehouse:', err))
        .finally(() => setLoadingWh(false));
    } else {
      setLoadingWh(false);
    }
  }, [managerUser]);

  if (!isInitialized || loadingWh) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0F172A', color: '#FFFFFF' }}>
        <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: '2rem', color: '#3B82F6' }}></i>
      </div>
    );
  }

  if (!managerUser) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="wh-layout">
      <WarehouseNavbar warehouse={warehouse} />
      <main className="wh-main-container">
        {React.cloneElement(children, { warehouse, onWarehouseUpdate: setWarehouse })}
      </main>
    </div>
  );
}

export default function App() {
  return (
    <WarehouseAuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<WarehouseLogin />} />
          <Route
            path="/"
            element={
              <ProtectedWarehouseLayout>
                <WarehouseDashboard />
              </ProtectedWarehouseLayout>
            }
          />
          <Route
            path="/inventory"
            element={
              <ProtectedWarehouseLayout>
                <WarehouseInventory />
              </ProtectedWarehouseLayout>
            }
          />
          <Route
            path="/riders"
            element={
              <ProtectedWarehouseLayout>
                <WarehouseRiders />
              </ProtectedWarehouseLayout>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </WarehouseAuthProvider>
  );
}
