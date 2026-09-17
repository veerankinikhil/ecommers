import React, { createContext, useContext, useState, useEffect } from 'react';
import paymentApi, { SOCKET_BASE_URL } from '../services/paymentApi';
import { io } from 'socket.io-client';

const PaymentAuthContext = createContext();

export function PaymentAuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('novakart_finance_token'));
  const [loading, setLoading] = useState(true);
  const [livePayments, setLivePayments] = useState([]);

  useEffect(() => {
    if (token) {
      paymentApi.get('/auth/me')
        .then(({ data }) => {
          if (data.user && (data.user.role === 'finance' || data.user.role === 'admin')) {
            setUser(data.user);
          } else {
            logout();
          }
        })
        .catch(() => logout())
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [token]);

  // Connect to Socket.IO for real-time transactions stream
  useEffect(() => {
    const socket = io(SOCKET_BASE_URL);

    socket.on('connect', () => {
      console.log('⚡ Connected to Treasury Socket.IO Stream');
      socket.emit('join_treasury_channel');
    });

    socket.on('ORDER_PAYMENT_CAPTURED', (eventData) => {
      console.log('💸 Live Payment Captured:', eventData);
      setLivePayments(prev => [eventData, ...prev]);
    });

    socket.on('PAYOUT_DISBURSED', (eventData) => {
      console.log('🏦 Live Payout Disbursed:', eventData);
      setLivePayments(prev => [eventData, ...prev]);
    });

    return () => socket.disconnect();
  }, []);

  const login = async (email, password) => {
    const { data } = await paymentApi.post('/auth/login', { email, password });
    if (data.user?.role !== 'finance' && data.user?.role !== 'admin') {
      throw new Error('Access Denied: Only Treasury and Finance Officers can enter this portal.');
    }
    localStorage.setItem('novakart_finance_token', data.token);
    setToken(data.token);
    setUser(data.user);
    return data;
  };

  const logout = () => {
    localStorage.removeItem('novakart_finance_token');
    setToken(null);
    setUser(null);
  };

  return (
    <PaymentAuthContext.Provider value={{ user, token, loading, login, logout, livePayments }}>
      {children}
    </PaymentAuthContext.Provider>
  );
}

export const usePaymentAuth = () => useContext(PaymentAuthContext);
