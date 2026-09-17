import React from 'react';
import { useWarehouseAuth } from '../context/WarehouseAuthContext';

export default function WarehouseInventory({ warehouse }) {
  const { managerUser } = useWarehouseAuth();

  const capacity = warehouse?.capacity || 25000;
  const currentLoad = warehouse?.currentLoad || 0;
  const loadPercentage = capacity ? Math.min(100, Math.round((currentLoad / capacity) * 100)) : 0;

  // Mock bay layout
  const bays = [
    { name: 'Bay A (Inbound Dock)', allocated: 8000, current: Math.round(currentLoad * 0.4), status: 'Active' },
    { name: 'Bay B (Sorting & Staging)', allocated: 7000, current: Math.round(currentLoad * 0.35), status: 'Active' },
    { name: 'Bay C (Outbound Fleet Dock)', allocated: 6000, current: Math.round(currentLoad * 0.2), status: 'Active' },
    { name: 'Bay D (High-Value / Electronics Vault)', allocated: 4000, current: Math.round(currentLoad * 0.05), status: 'Secure' }
  ];

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '1.6rem', fontWeight: '800', color: '#0F172A', margin: 0 }}>
          Facility Capacity &amp; Storage Bay Layout
        </h1>
        <p style={{ color: '#64748B', fontSize: '0.88rem', margin: '4px 0 0 0' }}>
          Physical zoning, load distribution, and manager operations for {warehouse?.name}
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px' }}>
        {/* Storage Bays */}
        <div>
          <div className="wh-card">
            <h3 style={{ fontSize: '1.1rem', fontWeight: '800', color: '#0F172A', marginBottom: '16px' }}>
              <i className="fa-solid fa-boxes-stacked" style={{ color: '#3B82F6', marginRight: '8px' }}></i>
              Active Storage Bays
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {bays.map((bay, idx) => {
                const bayPct = bay.allocated ? Math.min(100, Math.round((bay.current / bay.allocated) * 100)) : 0;
                return (
                  <div key={idx} style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '10px', padding: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <strong style={{ color: '#1E293B', fontSize: '0.92rem' }}>{bay.name}</strong>
                      <span className="wh-badge wh-badge-primary">{bay.status}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: '#64748B', marginBottom: '6px' }}>
                      <span>Storage: {bay.current.toLocaleString('en-IN')} units</span>
                      <span>Max: {bay.allocated.toLocaleString('en-IN')} units ({bayPct}%)</span>
                    </div>
                    <div style={{ height: '6px', background: '#E2E8F0', borderRadius: '3px', overflow: 'hidden' }}>
                      <div style={{
                        width: `${bayPct}%`,
                        height: '100%',
                        background: bayPct > 80 ? '#EF4444' : bayPct > 50 ? '#F59E0B' : '#3B82F6',
                        borderRadius: '3px'
                      }}></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Manager Profile & Contact */}
        <div>
          <div className="wh-card">
            <h3 style={{ fontSize: '1.1rem', fontWeight: '800', color: '#0F172A', marginBottom: '16px' }}>
              <i className="fa-solid fa-id-badge" style={{ color: '#10B981', marginRight: '8px' }}></i>
              Facility Manager
            </h3>

            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '18px' }}>
              <div style={{
                width: '52px',
                height: '52px',
                borderRadius: '50%',
                background: '#0F172A',
                color: '#FFFFFF',
                fontWeight: '800',
                fontSize: '1.2rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                {warehouse?.manager?.name ? warehouse.manager.name.split(' ').map(n => n[0]).join('').slice(0, 2) : 'MG'}
              </div>
              <div>
                <div style={{ fontWeight: '800', fontSize: '1rem', color: '#0F172A' }}>
                  {warehouse?.manager?.name || managerUser?.name}
                </div>
                <div style={{ fontSize: '0.76rem', color: '#64748B' }}>
                  Employee ID: <strong style={{ color: '#3B82F6', fontFamily: 'monospace' }}>{warehouse?.manager?.employeeId || 'MGR-01'}</strong>
                </div>
              </div>
            </div>

            <div style={{ fontSize: '0.82rem', display: 'flex', flexDirection: 'column', gap: '10px', borderTop: '1px solid #F1F5F9', paddingTop: '14px' }}>
              <div>
                <div style={{ color: '#64748B', fontSize: '0.72rem', fontWeight: '700', textTransform: 'uppercase' }}>Official Email</div>
                <div style={{ fontWeight: '600', color: '#0F172A' }}>{warehouse?.manager?.email || managerUser?.email}</div>
              </div>
              <div>
                <div style={{ color: '#64748B', fontSize: '0.72rem', fontWeight: '700', textTransform: 'uppercase' }}>Direct Phone</div>
                <div style={{ fontWeight: '600', color: '#0F172A' }}>{warehouse?.manager?.phone || '+91 98480 00000'}</div>
              </div>
              <div>
                <div style={{ color: '#64748B', fontSize: '0.72rem', fontWeight: '700', textTransform: 'uppercase' }}>Assigned Facility</div>
                <div style={{ fontWeight: '700', color: '#1D4ED8' }}>{warehouse?.name} ({warehouse?.code})</div>
              </div>
              <div>
                <div style={{ color: '#64748B', fontSize: '0.72rem', fontWeight: '700', textTransform: 'uppercase' }}>Facility Landline</div>
                <div style={{ fontWeight: '600', color: '#0F172A' }}>{warehouse?.contactPhone || 'N/A'}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
