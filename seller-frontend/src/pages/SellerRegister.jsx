import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSellerAuth } from '../context/SellerAuthContext';

export default function SellerRegister() {
  const [storeName, setStoreName] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [businessAddress, setBusinessAddress] = useState('');
  const [lat, setLat] = useState('28.6139');
  const [lng, setLng] = useState('77.2090');
  const [errorMsg, setErrorMsg] = useState('');
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const { register, loading } = useSellerAuth();
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    if (!acceptedTerms) {
      setErrorMsg('You must accept the Merchant Terms & Conditions.');
      return;
    }
    const res = await register({
      storeName,
      ownerName,
      email,
      phone,
      password,
      businessAddress,
      lat,
      lng,
      acceptedTerms
    });

    if (res.success) {
      alert('🎉 Seller store registered successfully! Awaiting administrator KYC approval.');
      navigate('/');
    } else {
      setErrorMsg(res.message);
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', background: 'var(--seller-bg)', padding: '40px 0' }}>
      <div style={{ background: '#fff', border: '1px solid var(--seller-border)', borderRadius: '12px', padding: '36px', width: '100%', maxWidth: '520px', boxShadow: 'var(--shadow-md)' }}>
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <h1 style={{ fontSize: '1.6rem', fontWeight: '800', color: 'var(--seller-primary)' }}>
            <i className="fa-solid fa-store" style={{ color: 'var(--seller-accent)' }}></i> Merchant Onboarding
          </h1>
          <p style={{ fontSize: '0.85rem', color: '#64748B' }}>Join our multi-vendor platform with automated nearby delivery dispatch</p>
        </div>

        {errorMsg && (
          <div style={{ background: '#fee2e2', color: '#dc2626', padding: '10px 14px', borderRadius: '6px', fontSize: '0.85rem', marginBottom: '16px' }}>
            <i className="fa-solid fa-triangle-exclamation"></i> {errorMsg}
          </div>
        )}

        <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <label style={{ fontSize: '0.85rem', fontWeight: '600' }}>Store / Business Name</label>
            <input type="text" className="form-input" placeholder="e.g. Apex Electronics Hub" value={storeName} onChange={(e) => setStoreName(e.target.value)} required />
          </div>

          <div>
            <label style={{ fontSize: '0.85rem', fontWeight: '600' }}>Store Owner Full Name</label>
            <input type="text" className="form-input" placeholder="Johnathan Doe" value={ownerName} onChange={(e) => setOwnerName(e.target.value)} required />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ fontSize: '0.85rem', fontWeight: '600' }}>Business Email</label>
              <input type="email" className="form-input" placeholder="store@apex.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div>
              <label style={{ fontSize: '0.85rem', fontWeight: '600' }}>Contact Phone</label>
              <input type="tel" className="form-input" placeholder="+91 98765 43210" value={phone} onChange={(e) => setPhone(e.target.value)} required />
            </div>
          </div>

          <div>
            <label style={{ fontSize: '0.85rem', fontWeight: '600' }}>Password</label>
            <input type="password" className="form-input" placeholder="••••••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>

          <div>
            <label style={{ fontSize: '0.85rem', fontWeight: '600' }}>Physical Store / Warehouse Address</label>
            <input type="text" className="form-input" placeholder="Warehouse 4, Connaught Place, New Delhi" value={businessAddress} onChange={(e) => setBusinessAddress(e.target.value)} required />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ fontSize: '0.85rem', fontWeight: '600' }}>Store Lat (GPS)</label>
              <input type="text" className="form-input" value={lat} onChange={(e) => setLat(e.target.value)} required />
            </div>
            <div>
              <label style={{ fontSize: '0.85rem', fontWeight: '600' }}>Store Lng (GPS)</label>
              <input type="text" className="form-input" value={lng} onChange={(e) => setLng(e.target.value)} required />
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '10px', marginBottom: '14px' }}>
            <input type="checkbox" id="acceptedTerms" checked={acceptedTerms} onChange={(e) => setAcceptedTerms(e.target.checked)} required />
            <label htmlFor="acceptedTerms" style={{ fontSize: '0.85rem', color: '#64748B', cursor: 'pointer' }}>
              I agree to the <button type="button" onClick={() => setShowTermsModal(true)} style={{ background: 'none', border: 'none', padding: 0, textDecoration: 'underline', color: 'var(--seller-primary)', fontWeight: '600', cursor: 'pointer' }}>Merchant Terms &amp; Conditions</button>
            </label>
          </div>

          <button type="submit" className="btn-seller btn-seller-primary" style={{ padding: '12px', justifyContent: 'center', width: '100%', marginTop: '6px' }} disabled={loading}>
            {loading ? 'Submitting Application...' : 'Register Merchant Store'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '20px', fontSize: '0.85rem', color: '#64748B' }}>
          Already approved merchant? <Link to="/login" style={{ color: 'var(--seller-primary)', fontWeight: '700' }}>Sign In</Link>
        </div>
      </div>

      {/* Terms & Conditions Modal Overlay */}
      {showTermsModal && (
        <div className="terms-modal-overlay" style={{
          position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
          background: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(8px)',
          display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 10000,
          padding: '20px', boxSizing: 'border-box'
        }}>
          <div className="terms-modal-card" style={{
            background: '#ffffff', borderRadius: '16px', maxWidth: '640px', width: '100%',
            maxHeight: '85vh', display: 'flex', flexDirection: 'column',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.15)', border: '1px solid #e2e8f0',
            overflow: 'hidden', animation: 'fadeIn 0.25s ease-out'
          }}>
            {/* Header */}
            <div style={{
              padding: '20px 24px', borderBottom: '1px solid #e2e8f0',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              background: 'linear-gradient(135deg, #0f766e 0%, #115e59 100%)', color: '#ffffff'
            }}>
              <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '8px', zIndex: 10002 }}>
                <i className="fa-solid fa-store-slash" style={{ color: '#f59e0b' }}></i> NovaKart Merchant Partnership Agreement
              </h3>
              <button type="button" onClick={() => setShowTermsModal(false)} style={{
                background: 'none', border: 'none', color: '#ccfbf1', fontSize: '1.5rem',
                cursor: 'pointer', lineHeight: 1, padding: 0
              }}>&times;</button>
            </div>

            {/* Body */}
            <div style={{
              padding: '24px', overflowY: 'auto', maxHeight: '55vh',
              fontSize: '0.88rem', lineHeight: '1.6', color: '#334155', textAlign: 'left'
            }}>
              <p style={{ marginTop: 0, fontWeight: '600' }}>Last Updated: August 27, 2026</p>
              <p>Welcome to NovaKart Merchant network! This Partnership Agreement governs your activities as a registered merchant on our multi-vendor marketplace platform. By checking the agreement checkbox, you commit to comply with the terms set forth below.</p>

              <h4 style={{ color: '#0f172a', fontSize: '0.95rem', fontWeight: '700', marginTop: '16px', marginBottom: '8px' }}>1. Merchant Verifications & KYC Compliance</h4>
              <p>To register as a merchant, you must provide valid business details, physical warehouse coordinates, owner contact details, and tax identification files. NovaKart reserves the right to suspend accounts failing basic compliance audits or failing to produce appropriate government business registration proofs upon request.</p>

              <h4 style={{ color: '#0f172a', fontSize: '0.95rem', fontWeight: '700', marginTop: '16px', marginBottom: '8px' }}>2. Catalog Compliance & Accuracy</h4>
              <p>You agree to maintain precise pricing, accurate stock counts, and high-resolution item descriptions. Listings presenting counterfeits, hazardous materials, or illegal goods will be permanently blacklisted. If a listing contains pricing anomalies, you agree to fulfill the order or reimburse the customer coordinate adjustments.</p>

              <h4 style={{ color: '#0f172a', fontSize: '0.95rem', fontWeight: '700', marginTop: '16px', marginBottom: '8px' }}>3. Commissions & Settlements</h4>
              <p>NovaKart charges a standard flat commission on orders processed through our payment gateway. Financial disbursements/settlements are computed weekly and transferred directly to the verified merchant business ledger account registered on the profile.</p>

              <h4 style={{ color: '#0f172a', fontSize: '0.95rem', fontWeight: '700', marginTop: '16px', marginBottom: '8px' }}>4. Order Preparation & Fulfillment SLA</h4>
              <p>NovaKart uses a high-speed nearby delivery agent dispatch system. Upon receiving an order notification, you must prepare and package the items for pickup within 30 minutes. Repeated fulfillment delay penalties or delivery agent rejection logs will lower your storefront tier rating and may result in platform suspension.</p>

              <h4 style={{ color: '#0f172a', fontSize: '0.95rem', fontWeight: '700', marginTop: '16px', marginBottom: '8px' }}>5. Return Handling & Customer Disputes</h4>
              <p>Merchants are bound to honor our standard 10-day customer return policy. If a product is returned damaged due to factory faults, you are responsible for processing refunds or shipping replacement stock at zero fee to the customer.</p>
            </div>

            {/* Footer */}
            <div style={{
              padding: '16px 24px', borderTop: '1px solid #e2e8f0',
              display: 'flex', justifyContent: 'flex-end', gap: '12px', background: '#f8fafc'
            }}>
              <button type="button" onClick={() => { setAcceptedTerms(true); setShowTermsModal(false); }} className="btn btn-seller btn-seller-primary" style={{
                padding: '10px 20px', fontSize: '0.88rem', fontWeight: '700'
              }}>
                I Accept Terms &amp; Conditions
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
