import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import deliveryApi from '../services/deliveryApi';
import { io } from 'socket.io-client';
import { SOCKET_BASE_URL } from '../services/deliveryApi';
import { useDeliveryAuth } from '../context/DeliveryAuthContext';

const TYPE_ICONS = {
  ORDER_STATUS:      { icon: 'fa-box', color: '#38BDF8' },
  DELIVERY_DISPATCH: { icon: 'fa-motorcycle', color: '#10B981' },
  AGENT_APPROVAL:    { icon: 'fa-id-badge', color: '#F59E0B' },
  PAYMENT:           { icon: 'fa-indian-rupee-sign', color: '#10B981' },
  PROMO:             { icon: 'fa-tag', color: '#EC4899' },
};

export default function DeliveryNotificationBell() {
  const { agentUser, token } = useDeliveryAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [open, setOpen] = useState(false);
  const panelRef = useRef(null);
  const navigate = useNavigate();

  const fetchNotifications = useCallback(async () => {
    if (!token) return;
    try {
      const { data } = await deliveryApi.get('/notifications');
      setNotifications(data.notifications || []);
      setUnreadCount(data.unreadCount || 0);
    } catch { }
  }, [token]);

  useEffect(() => { fetchNotifications(); }, [fetchNotifications]);

  useEffect(() => {
    const userId = agentUser?.id || agentUser?._id;
    if (!userId) return;
    const s = io(SOCKET_BASE_URL);
    s.emit('join_user_room', userId);
    s.on('new_notification', (notif) => {
      setNotifications(prev => [notif, ...prev]);
      setUnreadCount(prev => prev + 1);
    });
    return () => s.disconnect();
  }, [agentUser]);

  useEffect(() => {
    const handler = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleMarkRead = async (id) => {
    try { await deliveryApi.put(`/notifications/${id}/read`); } catch { }
    setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const handleMarkAllRead = async () => {
    try { await deliveryApi.put('/notifications/read-all'); } catch { }
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    setUnreadCount(0);
  };

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    try { await deliveryApi.delete(`/notifications/${id}`); } catch { }
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
    <div style={{ position: 'relative' }} ref={panelRef}>
      <button id="delivery-notification-bell"
        onClick={() => setOpen(!open)}
        style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#fff', fontSize: '1.15rem', position: 'relative', padding: '4px 6px' }}
        title="Notifications">
        <i className="fa-solid fa-bell"></i>
        {unreadCount > 0 && (
          <span style={{ position: 'absolute', top: '-2px', right: '-2px', background: '#EF4444', color: '#fff', borderRadius: '50%', width: '18px', height: '18px', fontSize: '0.65rem', fontWeight: '800', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div style={{ position: 'absolute', right: 0, top: 'calc(100% + 10px)', width: '360px', background: '#1e293b', borderRadius: '12px', boxShadow: '0 12px 40px rgba(0,0,0,0.4)', zIndex: 9999, border: '1px solid #334155', overflow: 'hidden' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', borderBottom: '1px solid #334155', background: '#0f172a' }}>
            <span style={{ fontWeight: '800', fontSize: '0.95rem', color: '#f1f5f9' }}>
              <i className="fa-solid fa-bell" style={{ color: '#38BDF8', marginRight: '6px' }}></i>
              Notifications {unreadCount > 0 && <span style={{ background: '#EF4444', color: '#fff', borderRadius: '10px', padding: '1px 7px', fontSize: '0.72rem', marginLeft: '4px' }}>{unreadCount}</span>}
            </span>
            {unreadCount > 0 && (
              <button onClick={handleMarkAllRead} style={{ background: 'none', border: 'none', color: '#38BDF8', fontSize: '0.78rem', cursor: 'pointer', fontWeight: '600' }}>Mark all read</button>
            )}
          </div>
          <div style={{ maxHeight: '380px', overflowY: 'auto' }}>
            {notifications.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 20px', color: '#475569' }}>
                <i className="fa-regular fa-bell-slash" style={{ fontSize: '2rem', marginBottom: '10px', display: 'block' }}></i>
                <p style={{ margin: 0, fontSize: '0.88rem' }}>No notifications yet</p>
              </div>
            ) : notifications.map(notif => {
              const meta = TYPE_ICONS[notif.type] || TYPE_ICONS.ORDER_STATUS;
              return (
                <div key={notif._id} onClick={() => handleClick(notif)}
                  style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', padding: '12px 16px', cursor: notif.link ? 'pointer' : 'default', background: notif.isRead ? '#1e293b' : '#0f2341', borderBottom: '1px solid #334155', transition: 'background 0.15s' }}
                  onMouseEnter={e => e.currentTarget.style.background = '#293548'}
                  onMouseLeave={e => e.currentTarget.style.background = notif.isRead ? '#1e293b' : '#0f2341'}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: `${meta.color}22`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <i className={`fa-solid ${meta.icon}`} style={{ color: meta.color, fontSize: '0.85rem' }}></i>
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ margin: '0 0 2px', fontWeight: notif.isRead ? '500' : '700', fontSize: '0.85rem', color: '#f1f5f9' }}>{notif.title}</p>
                    <p style={{ margin: '0 0 4px', fontSize: '0.78rem', color: '#94a3b8', lineHeight: '1.4' }}>{notif.message}</p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '0.72rem', color: '#64748b' }}>{new Date(notif.createdAt).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}</span>
                      {!notif.isRead && <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#38BDF8', display: 'inline-block' }}></span>}
                      {notif.link && <span style={{ fontSize: '0.72rem', color: '#38BDF8', fontWeight: '600' }}>→ View</span>}
                    </div>
                  </div>
                  <button onClick={(e) => handleDelete(e, notif._id)} style={{ background: 'none', border: 'none', color: '#475569', cursor: 'pointer', fontSize: '0.8rem', flexShrink: 0 }}>
                    <i className="fa-solid fa-xmark"></i>
                  </button>
                </div>
              );
            })}
          </div>
          {notifications.length > 0 && (
            <div style={{ padding: '10px 16px', borderTop: '1px solid #334155', textAlign: 'center', background: '#0f172a' }}>
              <span style={{ fontSize: '0.78rem', color: '#64748b' }}>{notifications.length} notification{notifications.length !== 1 ? 's' : ''}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
