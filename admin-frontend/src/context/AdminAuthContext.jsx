import React, { createContext, useContext, useState, useEffect } from 'react';
import adminApi, { SOCKET_BASE_URL } from '../services/adminApi';
import { io } from 'socket.io-client';

const AdminAuthContext = createContext();

export function AdminAuthProvider({ children }) {
  const [adminUser, setAdminUser] = useState(() => {
    const saved = localStorage.getItem('novakart_admin_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('novakart_admin_token'));
  const [loading, setLoading] = useState(false);
  const [liveEvents, setLiveEvents] = useState([]);

  useEffect(() => {
    if (adminUser) {
      const s = io(SOCKET_BASE_URL);
      s.emit('join_admin_room');

      s.on('admin_new_order', (data) => {
        setLiveEvents((prev) => [data, ...prev]);
      });

      s.on('admin_order_update', (data) => {
        setLiveEvents((prev) => [data, ...prev]);
      });

      return () => s.disconnect();
    }
  }, [adminUser]);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const { data } = await adminApi.post('/auth/login', { email, password, expectedRole: 'admin' });
      setAdminUser(data.user);
      setToken(data.token);
      localStorage.setItem('novakart_admin_user', JSON.stringify(data.user));
      localStorage.setItem('novakart_admin_token', data.token);
      return { success: true, message: data.message };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || 'Admin authentication failed' };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setAdminUser(null);
    setToken(null);
    localStorage.removeItem('novakart_admin_user');
    localStorage.removeItem('novakart_admin_token');
  };

  return (
    <AdminAuthContext.Provider value={{ adminUser, token, loading, login, logout, liveEvents }}>
      {children}
    </AdminAuthContext.Provider>
  );
}

export const useAdminAuth = () => useContext(AdminAuthContext);
