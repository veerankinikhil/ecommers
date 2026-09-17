import React, { createContext, useContext, useState, useEffect } from 'react';
import deliveryApi, { SOCKET_BASE_URL } from '../services/deliveryApi';
import { io } from 'socket.io-client';

const DeliveryAuthContext = createContext();

export function DeliveryAuthProvider({ children }) {
  const [agentUser, setAgentUser] = useState(() => {
    const saved = localStorage.getItem('novakart_delivery_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('novakart_delivery_token'));
  const [loading, setLoading] = useState(false);
  const [incomingRadarOffers, setIncomingRadarOffers] = useState([]);
  const [socket, setSocket] = useState(null);

  // Always fetch fresh approval status from backend on load
  useEffect(() => {
    const savedToken = localStorage.getItem('novakart_delivery_token');
    if (!savedToken) return;
    deliveryApi.get('/auth/me').then(({ data }) => {
      if (data.deliveryAgent) {
        const freshUser = {
          ...JSON.parse(localStorage.getItem('novakart_delivery_user') || '{}'),
          isApproved: data.deliveryAgent.isApproved,
          status: data.deliveryAgent.status
        };
        setAgentUser(freshUser);
        localStorage.setItem('novakart_delivery_user', JSON.stringify(freshUser));
      }
    }).catch(() => {});
  }, []);

  useEffect(() => {
    if (agentUser?.agentId) {
      const s = io(SOCKET_BASE_URL);
      s.emit('join_delivery_radar', agentUser.agentId);
      s.emit('join_user_room', agentUser.id);

      s.on('account_status_approved', (data) => {
        alert(data.message);
        const updated = { ...agentUser, isApproved: true };
        setAgentUser(updated);
        localStorage.setItem('novakart_delivery_user', JSON.stringify(updated));
      });

      s.on('new_delivery_request', (offer) => {
        setIncomingRadarOffers((prev) => [offer, ...prev]);
        alert(`🚨 New Nearby Delivery Request: Order #${offer.orderNumber} (${offer.distanceKm} km away - Payout ₹${offer.payoutAmount})`);
      });

      s.on('targeted_delivery_offer', (offer) => {
        setIncomingRadarOffers((prev) => [offer, ...prev]);
      });

      setSocket(s);
      return () => s.disconnect();
    }
  }, [agentUser]);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const { data } = await deliveryApi.post('/auth/login', { email, password, expectedRole: 'delivery' });
      setAgentUser(data.user);
      setToken(data.token);
      localStorage.setItem('novakart_delivery_user', JSON.stringify(data.user));
      localStorage.setItem('novakart_delivery_token', data.token);
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
      const { data } = await deliveryApi.post('/auth/delivery/register', payload);
      setAgentUser(data.user);
      setToken(data.token);
      localStorage.setItem('novakart_delivery_user', JSON.stringify(data.user));
      localStorage.setItem('novakart_delivery_token', data.token);
      return { success: true, message: data.message };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || 'Registration failed' };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setAgentUser(null);
    setToken(null);
    localStorage.removeItem('novakart_delivery_user');
    localStorage.removeItem('novakart_delivery_token');
  };

  const [isScanModalOpen, setIsScanModalOpen] = useState(false);
  const openScanner = () => setIsScanModalOpen(true);
  const closeScanner = () => setIsScanModalOpen(false);

  return (
    <DeliveryAuthContext.Provider value={{
      agentUser,
      token,
      loading,
      login,
      register,
      logout,
      incomingRadarOffers,
      setIncomingRadarOffers,
      socket,
      isScanModalOpen,
      openScanner,
      closeScanner,
      setIsScanModalOpen
    }}>
      {children}
    </DeliveryAuthContext.Provider>
  );
}

export const useDeliveryAuth = () => useContext(DeliveryAuthContext);
