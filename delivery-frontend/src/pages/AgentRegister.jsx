import React from 'react';
import { Link } from 'react-router-dom';

const WAREHOUSE_LOCATIONS = [
  { name: 'Guntur Regional Hub', code: 'WH-AP-GNT01', city: 'Guntur', address: 'Autonagar Logistics Park, Guntur', contact: 'manager.gnt01@novakart.com' },
  { name: 'Tenali Delivery Branch', code: 'WH-AP-TEN01', city: 'Tenali', address: 'Station Road Industrial Bay, Tenali', contact: 'phani.kumar@novacart.com' },
  { name: 'Vijayawada Central Mother Hub', code: 'WH-AP-VJA01', city: 'Vijayawada', address: 'NH16 Logistics Superhub, Vijayawada', contact: 'suresh.varma@novacart.com' },
  { name: 'Hyderabad Shamshabad Mother Hub', code: 'WH-TS-HYD01', city: 'Hyderabad', address: 'Cargo Airport Zone, Shamshabad', contact: 'vikram.reddy@novacart.com' },
  { name: 'Gachibowli Tech Branch', code: 'WH-TS-HYD03', city: 'Hyderabad', address: 'Financial District Bay 4, Gachibowli', contact: 'praneeth.varma@novacart.com' },
  { name: 'Warangal Regional Hub', code: 'WH-TS-WGL01', city: 'Warangal', address: 'Kazipet Highway Yard, Warangal', contact: 'ramesh.rao@novacart.com' }
];

export default function AgentRegister() {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'radial-gradient(ellipse at top, #1E293B 0%, #0F172A 60%, #020617 100%)',
      padding: '30px 20px',
      fontFamily: "'Poppins', sans-serif"
    }}>
      <div style={{
        maxWidth: '680px',
        width: '100%',
        background: '#FFFFFF',
        borderRadius: '20px',
        boxShadow: '0 25px 50px -12px rgba(0,0,0,0.4)',
        overflow: 'hidden'
      }}>
        {/* Header */}
        <div style={{
          background: '#0F172A',
          color: '#FFFFFF',
          padding: '32px 30px',
          textAlign: 'center',
          borderBottom: '3px solid #10B981'
        }}>
          <div style={{
            width: '56px',
            height: '56px',
            borderRadius: '14px',
            background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.8rem',
            margin: '0 auto 16px auto',
            boxShadow: '0 6px 16px rgba(16, 185, 129, 0.4)'
          }}>
            <i className="fa-solid fa-warehouse"></i>
          </div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: '800', margin: 0 }}>
            Fleet Courier Onboarding Policy
          </h1>
          <p style={{ margin: '6px 0 0 0', color: '#94A3B8', fontSize: '0.88rem' }}>
            In-Person Warehouse Hub Registration &amp; Credential Verification
          </p>
        </div>

        {/* Notice Body */}
        <div style={{ padding: '28px 32px' }}>
          
          {/* Alert Box */}
          <div style={{
            background: '#FEF3C7',
            border: '1px solid #FDE68A',
            borderRadius: '12px',
            padding: '16px 20px',
            marginBottom: '24px',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '14px'
          }}>
            <i className="fa-solid fa-triangle-exclamation" style={{ fontSize: '1.4rem', color: '#D97706', marginTop: '2px' }}></i>
            <div>
              <h3 style={{ margin: 0, fontSize: '0.98rem', fontWeight: '800', color: '#92400E' }}>
                Online Self-Registration is Disabled
              </h3>
              <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem', color: '#B45309', lineHeight: '1.5' }}>
                Delivery agents cannot register directly online. For safety, compliance, and background verification, couriers must visit their local <strong>Warehouse Hub</strong> in-person. The Warehouse Manager will review your documents, register your vehicle, and issue your official initial credentials.
              </p>
            </div>
          </div>

          {/* Required Documents Checklist */}
          <h3 style={{ fontSize: '1.05rem', fontWeight: '800', color: '#1E293B', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <i className="fa-solid fa-clipboard-check" style={{ color: '#10B981' }}></i>
            Documents Required for Warehouse Registration:
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '10px', marginBottom: '24px' }}>
            <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', padding: '12px 14px', borderRadius: '8px', fontSize: '0.82rem', color: '#334155' }}>
              ✓ <strong>Valid Driving License (DL)</strong> &bull; Two-wheeler / LMV
            </div>
            <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', padding: '12px 14px', borderRadius: '8px', fontSize: '0.82rem', color: '#334155' }}>
              ✓ <strong>Vehicle RC &amp; Insurance</strong> &bull; Registered vehicle
            </div>
            <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', padding: '12px 14px', borderRadius: '8px', fontSize: '0.82rem', color: '#334155' }}>
              ✓ <strong>Aadhaar Card / PAN Card</strong> &bull; Identity proof
            </div>
            <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', padding: '12px 14px', borderRadius: '8px', fontSize: '0.82rem', color: '#334155' }}>
              ✓ <strong>Bank Account Details</strong> &bull; For direct daily payout
            </div>
          </div>

          {/* Local Hubs List */}
          <h3 style={{ fontSize: '1.05rem', fontWeight: '800', color: '#1E293B', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <i className="fa-solid fa-location-dot" style={{ color: '#2563EB' }}></i>
            Authorized Warehouse Onboarding Facilities:
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '24px' }}>
            {WAREHOUSE_LOCATIONS.map((wh) => (
              <div
                key={wh.code}
                style={{
                  background: '#F8FAFC',
                  border: '1px solid #E2E8F0',
                  borderRadius: '10px',
                  padding: '12px 16px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '8px'
                }}
              >
                <div>
                  <div style={{ fontWeight: '800', color: '#0F172A', fontSize: '0.88rem' }}>
                    {wh.name} <span style={{ color: '#64748B', fontSize: '0.76rem', fontWeight: '600' }}>[{wh.code}]</span>
                  </div>
                  <div style={{ fontSize: '0.78rem', color: '#64748B', marginTop: '2px' }}>
                    📍 {wh.address}
                  </div>
                </div>
                <div style={{ fontSize: '0.78rem', color: '#2563EB', fontWeight: '700' }}>
                  <i className="fa-solid fa-envelope" style={{ marginRight: '4px' }}></i>
                  {wh.contact}
                </div>
              </div>
            ))}
          </div>

          {/* Privacy & Initial Credentials Notice */}
          <div style={{
            background: '#F0FDF4',
            border: '1px solid #BBF7D0',
            borderRadius: '10px',
            padding: '12px 16px',
            fontSize: '0.82rem',
            color: '#166534',
            marginBottom: '24px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}>
            <i className="fa-solid fa-lock" style={{ fontSize: '1.1rem' }}></i>
            <div>
              <strong>Security Assurance:</strong> The manager gives you an initial temporary password. Once you sign in, you can update your password in Profile &amp; Security. <strong>The warehouse manager CANNOT view your updated password.</strong>
            </div>
          </div>

          {/* Bottom Action */}
          <div style={{ textAlign: 'center', paddingTop: '12px', borderTop: '1px solid #E2E8F0' }}>
            <p style={{ color: '#64748B', fontSize: '0.88rem', margin: '0 0 14px 0' }}>
              Already registered and received credentials from your Warehouse Manager?
            </p>
            <Link
              to="/login"
              className="btn-agent btn-agent-primary"
              style={{
                display: 'inline-flex',
                padding: '12px 28px',
                fontSize: '0.95rem',
                fontWeight: '700',
                background: '#0F172A',
                color: '#FFFFFF'
              }}
            >
              <i className="fa-solid fa-right-to-bracket"></i> Sign In to Delivery Portal
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
}
