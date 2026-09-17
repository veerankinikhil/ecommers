import React, { createContext, useContext, useState, useEffect } from 'react';
import warehouseApi from '../services/warehouseApi';

const WarehouseAuthContext = createContext();

export function WarehouseAuthProvider({ children }) {
  const [managerUser, setManagerUser] = useState(null);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem('novakart_warehouse_user');
    const token = localStorage.getItem('novakart_warehouse_token');

    if (storedUser && token) {
      try {
        setManagerUser(JSON.parse(storedUser));
      } catch (err) {
        localStorage.removeItem('novakart_warehouse_user');
        localStorage.removeItem('novakart_warehouse_token');
      }
    }
    setIsInitialized(true);
  }, []);

  const login = async (email, password) => {
    const { data } = await warehouseApi.post('/auth/login', {
      email,
      password,
      expectedRole: 'warehouse_manager'
    });

    if (data.token && data.user) {
      localStorage.setItem('novakart_warehouse_token', data.token);
      localStorage.setItem('novakart_warehouse_user', JSON.stringify(data.user));
      setManagerUser(data.user);
      return data;
    }
    throw new Error('Authentication failed: Missing manager session token');
  };

  const logout = () => {
    localStorage.removeItem('novakart_warehouse_token');
    localStorage.removeItem('novakart_warehouse_user');
    setManagerUser(null);
  };

  return (
    <WarehouseAuthContext.Provider value={{ managerUser, login, logout, isInitialized }}>
      {children}
    </WarehouseAuthContext.Provider>
  );
}

export function useWarehouseAuth() {
  const context = useContext(WarehouseAuthContext);
  if (!context) {
    throw new Error('useWarehouseAuth must be used within WarehouseAuthProvider');
  }
  return context;
}
