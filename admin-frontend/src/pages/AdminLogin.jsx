import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminAuth } from '../context/AdminAuthContext';

export default function AdminLogin() {
  const [email, setEmail] = useState('admin@novakart.com');
  const [password, setPassword] = useState('Admin@NovaKart2026!');
  const [errorMsg, setErrorMsg] = useState('');
  const { login, loading } = useAdminAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    const res = await login(email, password);
    if (res.success) {
      navigate('/');
    } else {
      setErrorMsg(res.message);
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', background: 'var(--admin-bg)' }}>
      <div style={{ background: '#fff', border: '1px solid var(--admin-border)', borderRadius: '12px', padding: '36px', width: '100%', maxWidth: '440px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}>
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{ width: '56px', height: '56px', borderRadius: '12px', background: 'var(--admin-primary)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px auto', fontSize: '1.6rem' }}>
            <i className="fa-solid fa-shield-halved" style={{ color: 'var(--admin-accent)' }}></i>
          </div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: '800', color: 'var(--admin-primary)' }}>Super Admin Portal</h1>
          <p style={{ fontSize: '0.85rem', color: '#64748B' }}>Master command &amp; platform governance authorization</p>
        </div>

        {errorMsg && (
          <div style={{ background: '#fee2e2', color: '#dc2626', padding: '10px 14px', borderRadius: '6px', fontSize: '0.85rem', marginBottom: '16px' }}>
            <i className="fa-solid fa-triangle-exclamation"></i> {errorMsg}
          </div>
        )}

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ fontSize: '0.85rem', fontWeight: '600' }}>Admin Credentials Email</label>
            <input type="email" className="form-input" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>

          <div>
            <label style={{ fontSize: '0.85rem', fontWeight: '600' }}>Master Key Password</label>
            <input type="password" className="form-input" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>

          <button type="submit" className="btn-approve" style={{ padding: '12px', justifyContent: 'center', width: '100%', fontSize: '0.92rem', background: 'var(--admin-primary)' }} disabled={loading}>
            {loading ? 'Validating Token...' : 'Access Admin Command'}
          </button>
        </form>

        <div style={{ marginTop: '20px', background: '#F8FAFC', padding: '10px', borderRadius: '6px', fontSize: '0.78rem', color: '#64748B', textAlign: 'center' }}>
          🔒 Protected seed account configured in environment variables.
        </div>
      </div>
    </div>
  );
}
