import React, { useEffect, useState } from 'react';
import adminApi, { formatINR } from '../services/adminApi';
import MetricCard from '../components/MetricCard';
import { useAdminAuth } from '../context/AdminAuthContext';
import { Link } from 'react-router-dom';

export default function AdminOverview() {
  const { liveEvents } = useAdminAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminApi.get('/admin/dashboard-stats')
      .then(({ data }) => setStats(data.stats))
      .catch((err) => console.error('Error fetching admin stats:', err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      {/* Top Header */}
      <div className="admin-top-header" style={{ marginBottom: '24px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <span style={{ background: '#EFF6FF', color: '#1D4ED8', padding: '3px 10px', borderRadius: '20px', fontSize: '0.74rem', fontWeight: '800', border: '1px solid #BFDBFE' }}>
              <i className="fa-solid fa-shield-halved"></i> Master Operations Command
            </span>
            <span style={{ background: '#ECFDF5', color: '#047857', padding: '3px 10px', borderRadius: '20px', fontSize: '0.74rem', fontWeight: '800', border: '1px solid #A7F3D0' }}>
              <i className="fa-solid fa-circle-check"></i> System Operational
            </span>
          </div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: '800', color: '#0F172A', letterSpacing: '-0.5px' }}>
            Platform Executive Overview
          </h1>
          <p style={{ color: '#64748B', fontSize: '0.88rem' }}>
            Operations, merchant KYC moderation, fleet dispatch governance, and catalog oversight
          </p>
        </div>

        {/* Prominent Separate Payments Portal Quick-Launch Button */}
        <div style={{ display: 'flex', gap: '10px' }}>
          <a
            href="http://localhost:3005"
            target="_blank"
            rel="noreferrer"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              background: 'linear-gradient(135deg, #090D16 0%, #0F172A 100%)',
              color: '#10B981',
              border: '1px solid rgba(16, 185, 129, 0.4)',
              padding: '11px 20px',
              borderRadius: '10px',
              textDecoration: 'none',
              fontWeight: '800',
              fontSize: '0.88rem',
              boxShadow: '0 4px 14px rgba(0,0,0,0.15)',
              transition: 'transform 0.15s'
            }}
          >
            <i className="fa-solid fa-vault" style={{ fontSize: '1.1rem' }}></i>
            <span>Open Digital Payments &amp; Treasury (Port 3005)</span>
            <i className="fa-solid fa-arrow-up-right-from-square" style={{ fontSize: '0.78rem', marginLeft: '4px' }}></i>
          </a>
        </div>
      </div>

      {loading ? (
        <div style={{ background: '#fff', padding: '40px', borderRadius: '12px', textAlign: 'center', border: '1px solid var(--admin-border)' }}>
          <i className="fa-solid fa-circle-notch fa-spin" style={{ fontSize: '2rem', color: '#3B82F6', marginBottom: '14px' }}></i>
          <p style={{ fontWeight: '600', color: '#475569' }}>Loading master platform executive metrics...</p>
        </div>
      ) : (
        <>
          {/* Executive KPI Grid */}
          <div className="admin-grid" style={{ marginBottom: '24px' }}>
            <MetricCard 
              title="Gross Marketplace GMV" 
              value={formatINR(stats?.totalRevenue || stats?.financials?.totalGrossRevenue || 0)} 
              icon="fa-sack-dollar" 
              color="#10B981" 
            />
            <MetricCard 
              title="Total Orders Handled" 
              value={stats?.totalOrders || 0} 
              icon="fa-receipt" 
              color="#3B82F6" 
            />
            <MetricCard 
              title="Active Customers" 
              value={stats?.totalCustomers || 0} 
              icon="fa-users" 
              color="#6366F1" 
            />
            <MetricCard 
              title="Verified Sellers" 
              value={stats?.totalSellers || 0} 
              icon="fa-store" 
              color="#F59E0B" 
            />
            <MetricCard 
              title="Delivery Fleet Size" 
              value={stats?.totalDeliveryAgents || 0} 
              icon="fa-motorcycle" 
              color="#EC4899" 
            />
            <MetricCard 
              title="Listed Catalog Products" 
              value={stats?.totalProducts || 0} 
              icon="fa-boxes-stacked" 
              color="#14B8A6" 
            />
          </div>

          {/* Dedicated Callout Banner: Separate Payments & Treasury Portal */}
          <div style={{
            background: 'linear-gradient(135deg, #090D16 0%, #1E293B 100%)',
            color: '#FFFFFF',
            borderRadius: '14px',
            padding: '24px 28px',
            marginBottom: '28px',
            boxShadow: '0 8px 24px rgba(15, 23, 42, 0.2)',
            border: '1px solid rgba(255,255,255,0.1)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '20px'
          }}>
            <div style={{ maxWidth: '750px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <span style={{ background: 'rgba(16, 185, 129, 0.2)', color: '#6EE7B7', padding: '3px 10px', borderRadius: '12px', fontSize: '0.74rem', fontWeight: '800' }}>
                  <i className="fa-solid fa-lock"></i> SEPARATE SECURE PORTAL
                </span>
                <span style={{ color: '#94A3B8', fontSize: '0.82rem' }}>
                  Dedicated to Finance &amp; Treasury Officers
                </span>
              </div>
              <h2 style={{ fontSize: '1.35rem', fontWeight: '800', margin: '0 0 6px 0', letterSpacing: '-0.02em', color: '#FFFFFF' }}>
                💰 Digital Payments, Settlements &amp; Payroll Command
              </h2>
              <p style={{ color: '#94A3B8', fontSize: '0.88rem', margin: 0, lineHeight: '1.5' }}>
                All payment transactions, 10% platform cuts, pending seller verifications, courier trip compensations, and warehouse manager salaries are separated into the dedicated Treasury Portal on <strong>Port 3005</strong>.
              </p>
            </div>

            <div>
              <a
                href="http://localhost:3005"
                target="_blank"
                rel="noreferrer"
                style={{
                  background: '#10B981',
                  color: '#090D16',
                  padding: '12px 24px',
                  borderRadius: '10px',
                  textDecoration: 'none',
                  fontWeight: '800',
                  fontSize: '0.92rem',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  boxShadow: '0 4px 16px rgba(16, 185, 129, 0.35)'
                }}
              >
                <span>Access Port 3005</span>
                <i className="fa-solid fa-arrow-right"></i>
              </a>
            </div>
          </div>

          {/* Operational Status & Quick Moderation Action Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', marginBottom: '28px' }}>
            {/* Seller Moderation Card */}
            <div style={{ background: '#fff', border: '1px solid var(--admin-border)', borderRadius: '12px', padding: '22px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#FFFBEB', color: '#F59E0B', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}>
                    <i className="fa-solid fa-store"></i>
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1.05rem', fontWeight: '800', color: '#0F172A' }}>Seller Moderation</h3>
                    <p style={{ fontSize: '0.78rem', color: '#64748B' }}>Merchant stores &amp; business licenses</p>
                  </div>
                </div>
                <span className="fin-badge fin-badge-green">
                  {stats?.totalSellers || 2} Active Stores
                </span>
              </div>
              <p style={{ fontSize: '0.85rem', color: '#475569', marginBottom: '16px' }}>
                Pending KYC applications: <strong>{stats?.pendingSellers || 0} merchants</strong> waiting for review.
              </p>
              <Link to="/sellers" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#2563EB', fontWeight: '700', fontSize: '0.85rem' }}>
                <span>Review Merchant KYC</span>
                <i className="fa-solid fa-arrow-right"></i>
              </Link>
            </div>

            {/* Delivery Fleet Card */}
            <div style={{ background: '#fff', border: '1px solid var(--admin-border)', borderRadius: '12px', padding: '22px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#FDF2F8', color: '#EC4899', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}>
                    <i className="fa-solid fa-motorcycle"></i>
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1.05rem', fontWeight: '800', color: '#0F172A' }}>Fleet Operations</h3>
                    <p style={{ fontSize: '0.78rem', color: '#64748B' }}>Active courier agents &amp; radar</p>
                  </div>
                </div>
                <span className="fin-badge fin-badge-green">
                  {stats?.totalDeliveryAgents || 2} Riders Active
                </span>
              </div>
              <p style={{ fontSize: '0.85rem', color: '#475569', marginBottom: '16px' }}>
                Drivers deployed: <strong>Gandu Bhargav</strong> (Tenali) &bull; <strong>Srinivas Varma</strong> (Vijayawada).
              </p>
              <Link to="/delivery-agents" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#2563EB', fontWeight: '700', fontSize: '0.85rem' }}>
                <span>Manage Fleet KYC</span>
                <i className="fa-solid fa-arrow-right"></i>
              </Link>
            </div>

            {/* Warehouses Hub Logistics Card */}
            <div style={{ background: '#fff', border: '1px solid var(--admin-border)', borderRadius: '12px', padding: '22px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#F5F3FF', color: '#8B5CF6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}>
                    <i className="fa-solid fa-warehouse"></i>
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1.05rem', fontWeight: '800', color: '#0F172A' }}>Warehouses &amp; Hubs</h3>
                    <p style={{ fontSize: '0.78rem', color: '#64748B' }}>AP &amp; TS Logistics Infrastructure</p>
                  </div>
                </div>
                <span className="fin-badge fin-badge-purple">
                  16 Hubs Online
                </span>
              </div>
              <p style={{ fontSize: '0.85rem', color: '#475569', marginBottom: '16px' }}>
                Mother Warehouses, Regional Sorting Hubs &amp; Delivery Branches operational.
              </p>
              <Link to="/warehouses" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#2563EB', fontWeight: '700', fontSize: '0.85rem' }}>
                <span>Inspect All 16 Warehouses</span>
                <i className="fa-solid fa-arrow-right"></i>
              </Link>
            </div>
          </div>

          {/* Real-Time Platform Event Stream */}
          <div style={{ background: '#fff', border: '1px solid var(--admin-border)', borderRadius: '12px', padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '1.05rem', fontWeight: '800', color: '#0F172A', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <i className="fa-solid fa-satellite-dish" style={{ color: '#3B82F6' }}></i> Real-Time Platform Event Stream ({liveEvents.length})
              </h3>
              <span className="fin-badge fin-badge-blue">
                <i className="fa-solid fa-wifi"></i> Socket.IO Active
              </span>
            </div>

            {liveEvents.length === 0 ? (
              <p style={{ color: '#94A3B8', fontStyle: 'italic', fontSize: '0.88rem' }}>
                Connected to multi-vendor Socket.IO engine. Listening for live platform events (orders placed, seller acceptances, courier agent dispatches)...
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {liveEvents.slice(0, 8).map((ev, i) => (
                  <div key={i} style={{ background: '#F8FAFC', padding: '10px 14px', borderRadius: '6px', fontSize: '0.88rem', borderLeft: '4px solid #3B82F6' }}>
                    <i className="fa-solid fa-bell" style={{ color: '#3B82F6', marginRight: '8px' }}></i>
                    Event: Order #{ev.orderNumber || ev.orderId} &bull; Status: <strong>{ev.status || 'NEW_ORDER'}</strong>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
