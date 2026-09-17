import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import sellerApi from '../services/sellerApi';
import { io } from 'socket.io-client';
import { SOCKET_BASE_URL } from '../services/sellerApi';
import { useSellerAuth } from '../context/SellerAuthContext';

const TYPE_ICONS = {
  ORDER_STATUS:      { icon: 'fa-receipt', color: '#3B82F6' },
  DELIVERY_DISPATCH: { icon: 'fa-motorcycle', color: '#10B981' },
  SELLER_APPROVAL:   { icon: 'fa-check-circle', color: '#8B5CF6' },
  PAYMENT:           { icon: 'fa-indian-rupee-sign', color: '#10B981' },
  PROMO:             { icon: 'fa-tag', color: '#EC4899' },
};

export default function SellerNotificationBell() {
  const { sellerUser, token } = useSellerAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [open, setOpen] = useState(false);
  const panelRef = useRef(null);
  const navigate = useNavigate();

  const fetchNotifications = useCallback(async () => {
    if (!token) return;
    try {
      const { data } = await sellerApi.get('/notifications');
      setNotifications(data.notifications || []);
      setUnreadCount(data.unreadCount || 0);
    } catch { /* silent */ }
  }, [token]);

  useEffect(() => { fetchNotifications(); }, [fetchNotifications]);

  useEffect(() => {
    const userId = sellerUser?.id || sellerUser?._id;
    if (!userId) return;
    const s = io(SOCKET_BASE_URL);
    s.emit('join_user_room', userId);
    s.on('new_notification', (notif) => {
      setNotifications(prev => [notif, ...prev]);
      setUnreadCount(prev => prev + 1);
    });
    return () => s.disconnect();
  }, [sellerUser]);

  useEffect(() => {
    const handler = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleMarkRead = async (id) => {
    try { await sellerApi.put(`/notifications/${id}/read`); } catch { }
    setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const handleMarkAllRead = async () => {
    try { await sellerApi.put('/notifications/read-all'); } catch { }
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    setUnreadCount(0);
  };

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    try { await sellerApi.delete(`/notifications/${id}`); } catch { }
    const notif = notifications.find(n => n._id === id);
    setNotifications(prev => prev.filter(n => n._id !== id));
    if (notif && !notif.isRead) setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const handleClick = async (notif) => {
    if (!notif.isRead) await handleMarkRead(notif._id);
    setOpen(false);
    if (notif.link) navigate(notif.link);
  };

  return (
    <div style={{ position: 'relative', padding: '10px 24px' }} ref={panelRef}>
      <button id="seller-notification-bell"
        onClick={() => setOpen(!open)}
        style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '8px', cursor: 'pointer', color: '#fff', fontSize: '0.9rem', fontWeight: '600', padding: '8px 14px', display: 'flex', alignItems: 'center', gap: '8px', width: '100%', position: 'relative' }}>
        <i className="fa-solid fa-bell"></i>
        Notifications
        {unreadCount > 0 && (
          <span style={{ background: '#EF4444', color: '#fff', borderRadius: '10px', padding: '1px 7px', fontSize: '0.7rem', fontWeight: '800', marginLeft: 'auto' }}>
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div style={{ position: 'fixed', left: '240px', bottom: '80px', width: '360px', background: '#fff', borderRadius: '12px', boxShadow: '0 12px 40px rgba(0,0,0,0.25)', zIndex: 9999, border: '1px solid #e5e7eb', overflow: 'hidden' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', borderBottom: '1px solid #f1f5f9', background: '#f8fafc' }}>
            <span style={{ fontWeight: '800', fontSize: '0.95rem', color: '#0f172a' }}>
              <i className="fa-solid fa-bell" style={{ color: '#8B5CF6', marginRight: '6px' }}></i>
              Notifications {unreadCount > 0 && <span style={{ background: '#EF4444', color: '#fff', borderRadius: '10px', padding: '1px 7px', fontSize: '0.72rem', marginLeft: '4px' }}>{unreadCount}</span>}
            </span>
            {unreadCount > 0 && (
              <button onClick={handleMarkAllRead} style={{ background: 'none', border: 'none', color: '#8B5CF6', fontSize: '0.78rem', cursor: 'pointer', fontWeight: '600' }}>Mark all read</button>
            )}
          </div>
          <div style={{ maxHeight: '380px', overflowY: 'auto' }}>
            {notifications.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 20px', color: '#94a3b8' }}>
                <i className="fa-regular fa-bell-slash" style={{ fontSize: '2rem', marginBottom: '10px', display: 'block' }}></i>
                <p style={{ margin: 0, fontSize: '0.88rem' }}>No notifications yet</p>
              </div>
            ) : notifications.map(notif => {
              const meta = TYPE_ICONS[notif.type] || TYPE_ICONS.ORDER_STATUS;
              return (
                <div key={notif._id} onClick={() => handleClick(notif)}
                  style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', padding: '12px 16px', cursor: notif.link ? 'pointer' : 'default', background: notif.isRead ? '#fff' : '#F5F3FF', borderBottom: '1px solid #f1f5f9', transition: 'background 0.15s' }}
                  onMouseEnter={e => e.currentTarget.style.background = notif.isRead ? '#f8fafc' : '#EDE9FE'}
                  onMouseLeave={e => e.currentTarget.style.background = notif.isRead ? '#fff' : '#F5F3FF'}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: `${meta.color}1A`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <i className={`fa-solid ${meta.icon}`} style={{ color: meta.color, fontSize: '0.85rem' }}></i>
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ margin: '0 0 2px', fontWeight: notif.isRead ? '500' : '700', fontSize: '0.85rem', color: '#0f172a' }}>{notif.title}</p>
                    <p style={{ margin: '0 0 4px', fontSize: '0.78rem', color: '#64748b', lineHeight: '1.4' }}>{notif.message}</p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>{new Date(notif.createdAt).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}</span>
                      {!notif.isRead && <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#8B5CF6', display: 'inline-block' }}></span>}
                      {notif.link && <span style={{ fontSize: '0.72rem', color: '#8B5CF6', fontWeight: '600' }}>→ View</span>}
                    </div>
                  </div>
                  <button onClick={(e) => handleDelete(e, notif._id)} style={{ background: 'none', border: 'none', color: '#cbd5e1', cursor: 'pointer', fontSize: '0.8rem', flexShrink: 0 }}>
                    <i className="fa-solid fa-xmark"></i>
                  </button>
                </div>
              );
            })}
          </div>
          {notifications.length > 0 && (
            <div style={{ padding: '10px 16px', borderTop: '1px solid #f1f5f9', textAlign: 'center', background: '#f8fafc' }}>
              <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>{notifications.length} notification{notifications.length !== 1 ? 's' : ''}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
