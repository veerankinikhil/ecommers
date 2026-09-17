import React from 'react';
import { NavLink } from 'react-router-dom';
import { useSellerAuth } from '../context/SellerAuthContext';
import SellerNotificationBell from './SellerNotificationBell';

export default function SellerSidebar() {
  const { sellerUser, logout } = useSellerAuth();

  return (
    <aside className="seller-sidebar">
      <div className="seller-brand">
        <i className="fa-solid fa-store" style={{ color: 'var(--seller-accent)' }}></i>
        <span>Merchant</span> Hub
      </div>

      <div style={{ padding: '16px 24px', background: 'rgba(255,255,255,0.05)', margin: '14px', borderRadius: '8px' }}>
        <p style={{ fontSize: '0.78rem', color: '#94A3B8', textTransform: 'uppercase' }}>Active Store</p>
        <p style={{ fontWeight: '700', fontSize: '0.95rem', color: '#fff' }}>{sellerUser?.storeName || 'My Store'}</p>
        <span style={{ fontSize: '0.75rem', background: sellerUser?.isApproved ? '#10B981' : '#F59E0B', color: '#fff', padding: '2px 8px', borderRadius: '4px', display: 'inline-block', marginTop: '6px' }}>
          {sellerUser?.isApproved ? 'Approved Merchant' : 'Awaiting KYC Approval'}
        </span>
      </div>

      <nav className="seller-nav">
        <NavLink to="/" end><i className="fa-solid fa-chart-line"></i> Dashboard</NavLink>
        <NavLink to="/products"><i className="fa-solid fa-boxes-stacked"></i> Products Inventory</NavLink>
        <NavLink to="/products/new"><i className="fa-solid fa-circle-plus"></i> Add New Product</NavLink>
        <NavLink to="/orders"><i className="fa-solid fa-receipt"></i> Store Orders</NavLink>
        <NavLink to="/payouts"><i className="fa-solid fa-building-columns"></i> Settlements & Payouts</NavLink>
        <NavLink to="/profile"><i className="fa-solid fa-shop"></i> Store Settings</NavLink>
        <a href="http://localhost:3000" target="_blank" rel="noreferrer"><i className="fa-solid fa-arrow-up-right-from-square"></i> Customer Store</a>
      </nav>

      <SellerNotificationBell />

      <div style={{ padding: '20px 14px' }}>
        <button onClick={logout} style={{ width: '100%', background: 'rgba(239,68,68,0.2)', color: '#EF4444', border: '1px solid rgba(239,68,68,0.4)', padding: '10px', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' }}>
          <i className="fa-solid fa-right-from-bracket"></i> Sign Out
        </button>
      </div>
    </aside>
  );
}
