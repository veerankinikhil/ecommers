import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDeliveryAuth } from '../context/DeliveryAuthContext';
import deliveryApi from '../services/deliveryApi';

export default function AgentLogin() {
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
  const { login, loading } = useDeliveryAuth();
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
    if (e && e.preventDefault) e.preventDefault();
    setErrorMsg(''); setSuccessMsg(''); setSubmitting(true);
    try {
      const { data } = await deliveryApi.post('/auth/send-otp', { email: otpEmail.trim(), purpose: 'login' });
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
      const { data } = await deliveryApi.post('/auth/login-otp', {
        identifier: otpEmail.trim(), otp: otpCode, expectedRole: 'delivery'
      });
      // Store session via context login
      const res = await login(otpEmail.trim(), null, data.token, data.user);
      navigate('/');
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Invalid or expired OTP code.');
    } finally { setSubmitting(false); }
  };

  const inputStyle = { width: '100%', padding: '11px 14px', border: '1.5px solid #334155', borderRadius: '8px', fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit', background: '#1e293b', color: '#f1f5f9' };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', background: 'var(--agent-bg)' }}>
      <div style={{ background: 'var(--agent-card-bg, #1e293b)', border: '1px solid var(--agent-border)', borderRadius: '12px', padding: '36px', width: '100%', maxWidth: '440px', boxShadow: '0 4px 24px rgba(0,0,0,0.2)' }}>
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <h1 style={{ fontSize: '1.6rem', fontWeight: '800', color: 'var(--agent-primary, #38bdf8)' }}>
            <i className="fa-solid fa-motorcycle" style={{ color: 'var(--agent-accent, #f59e0b)' }}></i> Delivery Fleet Login
          </h1>
          <p style={{ fontSize: '0.85rem', color: '#94a3b8' }}>Access nearby delivery requests radar and payouts</p>
        </div>

        {/* Mode Tabs */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
          {[['password', 'fa-key', 'Password'], ['otp', 'fa-mobile-screen', 'OTP Login']].map(([mode, icon, label]) => (
            <button key={mode} type="button"
              onClick={() => { setLoginMode(mode); setErrorMsg(''); setSuccessMsg(''); setOtpStep(1); }}
              style={{ flex: 1, padding: '8px', fontSize: '0.82rem', fontWeight: '700', border: `1.5px solid ${loginMode === mode ? 'var(--agent-accent, #f59e0b)' : '#334155'}`, borderRadius: '8px', background: loginMode === mode ? 'var(--agent-accent, #f59e0b)' : 'transparent', color: loginMode === mode ? '#0f172a' : '#94a3b8', cursor: 'pointer', transition: 'all 0.2s' }}>
              <i className={`fa-solid ${icon}`}></i> {label}
            </button>
          ))}
        </div>

        {errorMsg && (
          <div style={{ background: 'rgba(220,38,38,0.15)', color: '#fca5a5', padding: '10px 14px', borderRadius: '6px', fontSize: '0.85rem', marginBottom: '16px', border: '1px solid rgba(220,38,38,0.3)' }}>
            <i className="fa-solid fa-triangle-exclamation"></i> {errorMsg}
          </div>
        )}
        {successMsg && (
          <div style={{ background: 'rgba(16,185,129,0.15)', color: '#6ee7b7', padding: '10px 14px', borderRadius: '6px', fontSize: '0.85rem', marginBottom: '16px', border: '1px solid rgba(16,185,129,0.3)' }}>
            <i className="fa-solid fa-circle-check"></i> {successMsg}
          </div>
        )}

        {/* Password Login */}
        {loginMode === 'password' && (
          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ fontSize: '0.85rem', fontWeight: '600', display: 'block', marginBottom: '6px', color: '#cbd5e1' }}>Agent Email</label>
              <input type="email" style={inputStyle} placeholder="agent@fleet.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: '600', color: '#cbd5e1' }}>Password</label>
                <button type="button" onClick={() => { setLoginMode('otp'); setOtpEmail(email); }}
                  style={{ background: 'none', border: 'none', color: 'var(--agent-accent, #f59e0b)', fontSize: '0.78rem', cursor: 'pointer', fontWeight: '600' }}>
                  Forgot? Use OTP
                </button>
              </div>
              <div style={{ position: 'relative' }}>
                <input type={showPassword ? 'text' : 'password'} style={{ ...inputStyle, paddingRight: '42px' }}
                  placeholder="••••••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#64748b', cursor: 'pointer' }}>
                  <i className={`fa-solid ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                </button>
              </div>
            </div>
            <button type="submit" className="btn-agent btn-agent-primary" style={{ padding: '12px', justifyContent: 'center', width: '100%' }} disabled={loading}>
              {loading ? <><i className="fa-solid fa-spinner fa-spin"></i> Verifying...</> : 'Sign In to Radar →'}
            </button>
          </form>
        )}

        {/* OTP Login */}
        {loginMode === 'otp' && (
          <div>
            {otpStep === 1 ? (
              <form onSubmit={handleSendOTP} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <label style={{ fontSize: '0.85rem', fontWeight: '600', display: 'block', marginBottom: '6px', color: '#cbd5e1' }}>Agent Email</label>
                  <input type="email" style={inputStyle} placeholder="agent@fleet.com" value={otpEmail} onChange={(e) => setOtpEmail(e.target.value)} required />
                </div>
                <button type="submit" className="btn-agent btn-agent-primary" style={{ padding: '12px', justifyContent: 'center', width: '100%' }} disabled={submitting}>
                  {submitting ? <><i className="fa-solid fa-spinner fa-spin"></i> Sending...</> : <><i className="fa-solid fa-paper-plane"></i> Send OTP Code</>}
                </button>
              </form>
            ) : (
              <form onSubmit={handleVerifyOTP} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: '6px', padding: '10px 14px', fontSize: '0.84rem', color: '#6ee7b7' }}>
                  <i className="fa-solid fa-shield-check"></i> Code sent to {otpEmail}
                </div>
                {demoOtp && (
                  <div style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.3)', borderRadius: '6px', padding: '10px 14px', fontSize: '0.84rem', color: '#fcd34d', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>⚡ Demo OTP: <strong>{demoOtp}</strong></span>
                    <button type="button" onClick={() => setOtpCode(demoOtp)}
                      style={{ background: '#f59e0b', color: '#0f172a', border: 'none', borderRadius: '4px', padding: '4px 10px', fontSize: '0.78rem', cursor: 'pointer', fontWeight: '700' }}>
                      Auto-Fill
                    </button>
                  </div>
                )}
                <input type="text" maxLength="6" style={{ ...inputStyle, textAlign: 'center', fontSize: '1.8rem', letterSpacing: '12px', fontWeight: '800' }}
                  placeholder="••••••" value={otpCode} onChange={(e) => setOtpCode(e.target.value.replace(/[^0-9]/g, ''))} autoFocus required />
                <button type="submit" className="btn-agent btn-agent-primary" style={{ padding: '12px', justifyContent: 'center', width: '100%' }} disabled={submitting || otpCode.length < 6}>
                  {submitting ? 'Verifying...' : 'Verify & Sign In →'}
                </button>
                <div style={{ textAlign: 'center', fontSize: '0.82rem', color: '#94a3b8' }}>
                  {timer > 0 ? <span>Resend in <strong>{timer}s</strong></span>
                    : <button type="button" onClick={handleSendOTP}
                        style={{ background: 'none', border: 'none', color: 'var(--agent-accent, #f59e0b)', cursor: 'pointer', fontWeight: '600', fontSize: '0.82rem' }}>
                        Resend OTP
                      </button>}
                </div>
                <button type="button" onClick={() => setOtpStep(1)}
                  style={{ background: 'none', border: 'none', color: '#64748b', fontSize: '0.82rem', cursor: 'pointer', textDecoration: 'underline' }}>
                  ← Change Email
                </button>
              </form>
            )}
          </div>
        )}

        <div style={{ textAlign: 'center', marginTop: '20px', fontSize: '0.84rem', color: '#64748B' }}>
          New delivery partner? <Link to="/register" style={{ color: 'var(--agent-accent, #10B981)', fontWeight: '700' }}>Visit Warehouse Hub for Onboarding</Link>
        </div>
      </div>
    </div>
  );
}
