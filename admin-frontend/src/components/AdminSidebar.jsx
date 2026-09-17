import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAdminAuth } from '../context/AdminAuthContext';
import AdminNotificationBell from './AdminNotificationBell';

export default function AdminSidebar() {
  const { logout } = useAdminAuth();

  return (
    <aside className="admin-sidebar">
      <div className="admin-brand">
        <i className="fa-solid fa-shield-halved" style={{ color: 'var(--admin-accent)' }}></i>
        <span>Admin Command</span>
      </div>

      <nav className="admin-nav">
        <NavLink to="/" end><i className="fa-solid fa-chart-pie"></i> Platform Overview</NavLink>
        <NavLink to="/sellers"><i className="fa-solid fa-store"></i> Seller KYC &amp; Approvals</NavLink>
        <NavLink to="/delivery-agents"><i className="fa-solid fa-motorcycle"></i> Delivery Fleet KYC</NavLink>
        <NavLink to="/customers"><i className="fa-solid fa-users"></i> Customer Management</NavLink>
        <NavLink to="/products"><i className="fa-solid fa-boxes-stacked"></i> Catalog Moderation</NavLink>
        <NavLink to="/orders"><i className="fa-solid fa-receipt"></i> Global Orders Monitor</NavLink>
        <NavLink to="/warehouses"><i className="fa-solid fa-warehouse"></i> Warehouses &amp; Hubs</NavLink>
        <a 
          href="http://localhost:3005" 
          target="_blank" 
          rel="noreferrer"
          style={{
            marginTop: '8px',
            background: 'rgba(16, 185, 129, 0.12)',
            color: '#34D399',
            border: '1px solid rgba(16, 185, 129, 0.25)',
            fontWeight: '700'
          }}
        >
          <i className="fa-solid fa-vault"></i> 
          <span>Payments &amp; Treasury (3005)</span>
          <i className="fa-solid fa-arrow-up-right-from-square" style={{ fontSize: '0.72rem', marginLeft: 'auto' }}></i>
        </a>
      </nav>

      <AdminNotificationBell />

      <div style={{ padding: '20px 14px' }}>
        <button onClick={logout} style={{ width: '100%', background: 'rgba(239,68,68,0.2)', color: '#EF4444', border: '1px solid rgba(239,68,68,0.4)', padding: '10px', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' }}>
          <i className="fa-solid fa-lock"></i> Exit Admin Portal
        </button>
      </div>
    </aside>
  );
}
