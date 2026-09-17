import React, { useState } from 'react';
import { usePaymentAuth } from '../context/PaymentAuthContext';

export default function PaymentLogin() {
  const { login } = usePaymentAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Login failed. Verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  const autofillFinance = () => {
    setEmail('finance@yourstore.com');
    setPassword('FinanceSecure2026!');
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #090D16 0%, #0F172A 100%)', padding: '20px' }}>
      <div style={{ width: '100%', maxWidth: '440px', background: '#FFFFFF', borderRadius: '16px', padding: '36px', boxShadow: '0 20px 40px rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)' }}>
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div style={{ width: '56px', height: '56px', borderRadius: '14px', background: '#ECFDF5', color: '#10B981', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.6rem', margin: '0 auto 14px auto' }}>
            <i className="fa-solid fa-building-columns"></i>
          </div>
          <h1 style={{ fontSize: '1.45rem', fontWeight: '800', color: '#0F172A' }}>NovaKart Treasury</h1>
          <p style={{ color: '#64748B', fontSize: '0.85rem', marginTop: '4px' }}>
            Digital Payments & Disbursals Command Center
          </p>
        </div>

        {error && (
          <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', color: '#DC2626', padding: '12px 14px', borderRadius: '8px', fontSize: '0.85rem', marginBottom: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <i className="fa-solid fa-triangle-exclamation"></i>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '18px' }}>
            <label style={{ fontSize: '0.82rem', fontWeight: '700', color: '#334155', display: 'block', marginBottom: '6px' }}>
              Treasury Officer Email
            </label>
            <input 
              type="email"
              required
              className="pay-input"
              placeholder="e.g. finance@yourstore.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div style={{ marginBottom: '22px' }}>
            <label style={{ fontSize: '0.82rem', fontWeight: '700', color: '#334155', display: 'block', marginBottom: '6px' }}>
              Security Password
            </label>
            <input 
              type="password"
              required
              className="pay-input"
              placeholder="••••••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            style={{ width: '100%', padding: '12px', background: '#10B981', color: '#090D16', border: 'none', borderRadius: '8px', fontWeight: '800', fontSize: '0.95rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
          >
            {loading ? (
              <><i className="fa-solid fa-circle-notch fa-spin"></i> Authenticating Treasury Credentials...</>
            ) : (
              <><i className="fa-solid fa-key"></i> Enter Treasury Command</>
            )}
          </button>
        </form>

        <div style={{ marginTop: '22px', paddingTop: '18px', borderTop: '1px solid var(--pay-border)', textAlign: 'center' }}>
          <button 
            type="button" 
            onClick={autofillFinance}
            style={{ background: '#F1F5F9', border: '1px dashed #CBD5E1', padding: '8px 14px', borderRadius: '6px', fontSize: '0.78rem', color: '#475569', cursor: 'pointer', fontWeight: '600' }}
          >
            🔑 Quick Fill Finance Officer Credentials
          </button>
        </div>
      </div>
    </div>
  );
}
