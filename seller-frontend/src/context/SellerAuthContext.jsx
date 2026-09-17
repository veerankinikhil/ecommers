import React, { createContext, useContext, useState, useEffect } from 'react';
import sellerApi, { SOCKET_BASE_URL } from '../services/sellerApi';
import { io } from 'socket.io-client';

const SellerAuthContext = createContext();

export function SellerAuthProvider({ children }) {
  const [sellerUser, setSellerUser] = useState(() => {
    const saved = localStorage.getItem('novakart_seller_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('novakart_seller_token'));
  const [loading, setLoading] = useState(false);
  const [liveOrdersAlert, setLiveOrdersAlert] = useState([]);

  // Always fetch fresh approval status from backend on load
  useEffect(() => {
    const savedToken = localStorage.getItem('novakart_seller_token');
    if (!savedToken) return;
    sellerApi.get('/auth/me').then(({ data }) => {
      if (data.seller) {
        const freshUser = {
          ...JSON.parse(localStorage.getItem('novakart_seller_user') || '{}'),
          isApproved: data.seller.isApproved,
          status: data.seller.status
        };
        setSellerUser(freshUser);
        localStorage.setItem('novakart_seller_user', JSON.stringify(freshUser));
      }
    }).catch(() => {});
  }, []);

  useEffect(() => {
    if (sellerUser?.sellerId) {
      const socket = io(SOCKET_BASE_URL);
      socket.emit('join_seller_room', sellerUser.sellerId);
      socket.emit('join_user_room', sellerUser.id);

      socket.on('account_status_approved', (data) => {
        alert(data.message);
        const updated = { ...sellerUser, isApproved: true };
        setSellerUser(updated);
        localStorage.setItem('novakart_seller_user', JSON.stringify(updated));
      });

      socket.on('new_incoming_order', (data) => {
        setLiveOrdersAlert((prev) => [data, ...prev]);
        alert(`🔔 New Order Received! Order #${data.orderNumber} (₹${data.totalAmount})`);
      });

      return () => socket.disconnect();
    }
  }, [sellerUser]);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const { data } = await sellerApi.post('/auth/login', { email, password, expectedRole: 'seller' });
      setSellerUser(data.user);
      setToken(data.token);
      localStorage.setItem('novakart_seller_user', JSON.stringify(data.user));
      localStorage.setItem('novakart_seller_token', data.token);
      return { success: true, message: data.message };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || 'Login failed' };
    } finally {
      setLoading(false);
    }
  };

  const register = async (payload) => {
    setLoading(true);
    try {
      const { data } = await sellerApi.post('/auth/seller/register', payload);
      setSellerUser(data.user);
      setToken(data.token);
      localStorage.setItem('novakart_seller_user', JSON.stringify(data.user));
      localStorage.setItem('novakart_seller_token', data.token);
      return { success: true, message: data.message };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || 'Registration failed' };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setSellerUser(null);
    setToken(null);
    localStorage.removeItem('novakart_seller_user');
    localStorage.removeItem('novakart_seller_token');
  };

  return (
    <SellerAuthContext.Provider value={{ sellerUser, token, loading, login, register, logout, liveOrdersAlert }}>
      {children}
    </SellerAuthContext.Provider>
  );
}

export const useSellerAuth = () => useContext(SellerAuthContext);
