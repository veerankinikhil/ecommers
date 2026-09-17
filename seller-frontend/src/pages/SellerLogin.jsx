import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSellerAuth } from '../context/SellerAuthContext';
import sellerApi from '../services/sellerApi';

export default function SellerLogin() {
  const [loginMode, setLoginMode] = useState('password');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // OTP State
  const [otpEmail, setOtpEmail] = useState('');
  const [otpStep, setOtpStep] = useState(1);
  const [otpCode, setOtpCode] = useState('');
  const [demoOtp, setDemoOtp] = useState(null);
  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const { login, loading } = useSellerAuth();
  const navigate = useNavigate();

  useEffect(() => {
    let interval = null;
    if (loginMode === 'otp' && otpStep === 2 && timer > 0) {
      interval = setInterval(() => setTimer((p) => p - 1), 1000);
    } else if (timer === 0) {
      setCanResend(true);
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [loginMode, otpStep, timer]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    const res = await login(email, password);
    if (res.success) { navigate('/'); } else { setErrorMsg(res.message); }
  };

  const handleSendOTP = async (e) => {
    e.preventDefault();
    setErrorMsg(''); setSuccessMsg(''); setSubmitting(true);
    try {
      const { data } = await sellerApi.post('/auth/send-otp', { email: otpEmail.trim(), purpose: 'login' });
      if (data.demoOtp) setDemoOtp(data.demoOtp);
      setOtpStep(2); setTimer(60); setCanResend(false);
      setSuccessMsg(`Login code sent to ${otpEmail}`);
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to send OTP. Try again.');
    } finally { setSubmitting(false); }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setErrorMsg(''); setSubmitting(true);
    try {
      const { data } = await sellerApi.post('/auth/login-otp', {
        identifier: otpEmail.trim(), otp: otpCode, expectedRole: 'seller'
      });
      // Use context to store user
      const { login: ctxLogin } = useSellerAuth();
      navigate('/');
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Invalid or expired OTP code.');
    } finally { setSubmitting(false); }
  };

  const inputStyle = { width: '100%', padding: '11px 14px', border: '1.5px solid var(--seller-border, #e2e8f0)', borderRadius: '8px', fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit' };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', background: 'var(--seller-bg)' }}>
      <div style={{ background: '#fff', border: '1px solid var(--seller-border)', borderRadius: '12px', padding: '36px', width: '100%', maxWidth: '440px', boxShadow: 'var(--shadow-md)' }}>
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <h1 style={{ fontSize: '1.6rem', fontWeight: '800', color: 'var(--seller-primary)' }}>
            <i className="fa-solid fa-store" style={{ color: 'var(--seller-accent)' }}></i> Merchant Sign In
          </h1>
          <p style={{ fontSize: '0.85rem', color: '#64748B' }}>Manage your store inventory, revenue and orders</p>
        </div>

        {/* Mode Tabs */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
          {[['password', 'fa-key', 'Password'], ['otp', 'fa-mobile-screen', 'OTP Login']].map(([mode, icon, label]) => (
            <button key={mode} type="button"
              onClick={() => { setLoginMode(mode); setErrorMsg(''); setSuccessMsg(''); setOtpStep(1); }}
              style={{ flex: 1, padding: '8px', fontSize: '0.82rem', fontWeight: '700', border: `1.5px solid ${loginMode === mode ? 'var(--seller-primary)' : '#e2e8f0'}`, borderRadius: '8px', background: loginMode === mode ? 'var(--seller-primary)' : '#fff', color: loginMode === mode ? '#fff' : '#64748B', cursor: 'pointer', transition: 'all 0.2s' }}>
              <i className={`fa-solid ${icon}`}></i> {label}
            </button>
          ))}
        </div>

        {errorMsg && (
          <div style={{ background: '#fee2e2', color: '#dc2626', padding: '10px 14px', borderRadius: '6px', fontSize: '0.85rem', marginBottom: '16px' }}>
            <i className="fa-solid fa-triangle-exclamation"></i> {errorMsg}
          </div>
        )}
        {successMsg && (
          <div style={{ background: '#e8f5e9', color: '#2e7d32', padding: '10px 14px', borderRadius: '6px', fontSize: '0.85rem', marginBottom: '16px' }}>
            <i className="fa-solid fa-circle-check"></i> {successMsg}
          </div>
        )}

        {/* Password Login */}
        {loginMode === 'password' && (
          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ fontSize: '0.85rem', fontWeight: '600', display: 'block', marginBottom: '6px' }}>Merchant Email</label>
              <input type="email" style={inputStyle} placeholder="seller@store.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: '600' }}>Password</label>
                <button type="button" onClick={() => { setLoginMode('otp'); setOtpEmail(email); }}
                  style={{ background: 'none', border: 'none', color: 'var(--seller-primary)', fontSize: '0.78rem', cursor: 'pointer', fontWeight: '600' }}>
                  Forgot Password / Use OTP
                </button>
              </div>
              <div style={{ position: 'relative' }}>
                <input type={showPassword ? 'text' : 'password'} style={{ ...inputStyle, paddingRight: '42px' }}
                  placeholder="••••••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}>
                  <i className={`fa-solid ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                </button>
              </div>
            </div>
            <button type="submit" className="btn-seller btn-seller-primary" style={{ padding: '12px', justifyContent: 'center', width: '100%' }} disabled={loading}>
              {loading ? <><i className="fa-solid fa-spinner fa-spin"></i> Authenticating...</> : 'Sign In as Seller →'}
            </button>
          </form>
        )}

        {/* OTP Login */}
        {loginMode === 'otp' && (
          <div>
            {otpStep === 1 ? (
              <form onSubmit={handleSendOTP} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <label style={{ fontSize: '0.85rem', fontWeight: '600', display: 'block', marginBottom: '6px' }}>Merchant Email</label>
                  <input type="email" style={inputStyle} placeholder="seller@store.com" value={otpEmail} onChange={(e) => setOtpEmail(e.target.value)} required />
                </div>
                <button type="submit" className="btn-seller btn-seller-primary" style={{ padding: '12px', justifyContent: 'center', width: '100%' }} disabled={submitting}>
                  {submitting ? <><i className="fa-solid fa-spinner fa-spin"></i> Sending...</> : <><i className="fa-solid fa-paper-plane"></i> Send OTP Code</>}
                </button>
              </form>
            ) : (
              <form onSubmit={handleVerifyOTP} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '6px', padding: '10px 14px', fontSize: '0.84rem', color: '#166534' }}>
                  <i className="fa-solid fa-shield-check"></i> Code sent to {otpEmail}
                </div>
                {demoOtp && (
                  <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: '6px', padding: '10px 14px', fontSize: '0.84rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>⚡ Demo OTP: <strong>{demoOtp}</strong></span>
                    <button type="button" onClick={() => setOtpCode(demoOtp)}
                      style={{ background: '#f59e0b', color: '#fff', border: 'none', borderRadius: '4px', padding: '4px 10px', fontSize: '0.78rem', cursor: 'pointer' }}>
                      Auto-Fill
                    </button>
                  </div>
                )}
                <input type="text" maxLength="6" style={{ ...inputStyle, textAlign: 'center', fontSize: '1.8rem', letterSpacing: '12px', fontWeight: '800' }}
                  placeholder="••••••" value={otpCode} onChange={(e) => setOtpCode(e.target.value.replace(/[^0-9]/g, ''))} autoFocus required />
                <button type="submit" className="btn-seller btn-seller-primary" style={{ padding: '12px', justifyContent: 'center', width: '100%' }} disabled={submitting || otpCode.length < 6}>
                  {submitting ? 'Verifying...' : 'Verify & Sign In →'}
                </button>
                <div style={{ textAlign: 'center', fontSize: '0.82rem', color: '#64748B' }}>
                  {timer > 0 ? <span>Resend in <strong>{timer}s</strong></span>
                    : <button type="button" onClick={async () => { await handleSendOTP({ preventDefault: () => {} }); }}
                        style={{ background: 'none', border: 'none', color: 'var(--seller-primary)', cursor: 'pointer', fontWeight: '600', fontSize: '0.82rem' }}>
                        Resend OTP
                      </button>}
                </div>
                <button type="button" onClick={() => setOtpStep(1)}
                  style={{ background: 'none', border: 'none', color: '#64748B', fontSize: '0.82rem', cursor: 'pointer', textDecoration: 'underline' }}>
                  ← Change Email
                </button>
              </form>
            )}
          </div>
        )}

        <div style={{ textAlign: 'center', marginTop: '20px', fontSize: '0.85rem', color: '#64748B' }}>
          Want to sell on NovaKart? <Link to="/register" style={{ color: 'var(--seller-primary)', fontWeight: '700' }}>Register Store</Link>
        </div>
      </div>
    </div>
  );
}
