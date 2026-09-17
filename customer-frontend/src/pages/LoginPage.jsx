import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { COUNTRY_CODES } from '../data/countryCodes';
const auth = null;
import api from '../services/api';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';
const FACEBOOK_APP_ID = import.meta.env.VITE_FACEBOOK_APP_ID || '';

// Load Facebook SDK dynamically
function loadFacebookSDK(appId) {
  return new Promise((resolve) => {
    if (window.FB) { resolve(window.FB); return; }
    window.fbAsyncInit = () => {
      window.FB.init({ appId, cookie: true, xfbml: true, version: 'v19.0' });
      resolve(window.FB);
    };
    const script = document.createElement('script');
    script.src = 'https://connect.facebook.net/en_US/sdk.js';
    script.async = true;
    script.defer = true;
    document.body.appendChild(script);
  });
}

export default function LoginPage() {
  const [loginMode, setLoginMode] = useState('password'); // 'password' | 'otp'

  // Password Mode State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [resettingPassword, setResettingPassword] = useState(false);

  // OTP Mode State
  const [otpType, setOtpType] = useState('email');
  const [countryCode, setCountryCode] = useState('+91');
  const [phoneRaw, setPhoneRaw] = useState('');
  const [otpEmail, setOtpEmail] = useState('');
  const [otpStep, setOtpStep] = useState(1);
  const [otpCode, setOtpCode] = useState('');
  const [demoOtp, setDemoOtp] = useState(null);
  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);

  // Social Login State
  const [socialLoading, setSocialLoading] = useState('');
  const [confirmationResult, setConfirmationResult] = useState(null);

  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { login, sendOTP, loginWithOTP, socialLogin, loginWithFirebasePhone, loading } = useAuth();
  const navigate = useNavigate();

  // Initialize reCAPTCHA
  const setupRecaptcha = (buttonId) => {
    if (!auth) return null;
    try {
      if (window.recaptchaVerifier) {
        window.recaptchaVerifier.clear();
      }
      window.recaptchaVerifier = new RecaptchaVerifier(auth, buttonId, {
        size: 'invisible',
        callback: () => {
          // reCAPTCHA solved
        }
      });
      return window.recaptchaVerifier;
    } catch (err) {
      console.error('Recaptcha error:', err);
      return null;
    }
  };

  const fullPhone = `${countryCode} ${phoneRaw.trim()}`;
  const activeIdentifier = otpType === 'email' ? otpEmail.trim() : fullPhone;

  // ── OTP Countdown Timer ───────────────────────────────────────────────────
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

  // ── Initialize Google Identity Services ───────────────────────────────────
  const handleGoogleCredentialResponse = useCallback(async (response) => {
    setSocialLoading('google');
    setErrorMsg('');
    try {
      // Decode JWT from Google (ID token contains profile info)
      const base64Url = response.credential.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const profile = JSON.parse(window.atob(base64));

      const res = await socialLogin('google', {
        name: profile.name,
        email: profile.email,
        avatar: profile.picture,
        socialId: profile.sub,
      });

      if (res.success) {
        navigate('/');
      } else {
        setErrorMsg(res.message);
      }
    } catch {
      setErrorMsg('Google sign-in failed. Please try again.');
    } finally {
      setSocialLoading('');
    }
  }, [socialLogin, navigate]);

  useEffect(() => {
    if (!GOOGLE_CLIENT_ID) return;
    const initGoogle = () => {
      if (window.google?.accounts?.id) {
        window.google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: handleGoogleCredentialResponse,
          auto_select: false,
          cancel_on_tap_outside: true,
        });
      }
    };
    // Retry until GIS library loads
    const interval = setInterval(() => {
      if (window.google?.accounts?.id) { initGoogle(); clearInterval(interval); }
    }, 300);
    return () => clearInterval(interval);
  }, [handleGoogleCredentialResponse]);

  // ── Google Sign-In Button Click ───────────────────────────────────────────
  const handleGoogleSignIn = async () => {
    setErrorMsg('');
    if (GOOGLE_CLIENT_ID) {
      if (window.google?.accounts?.id) {
        window.google.accounts.id.prompt((notification) => {
          if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
            const popup = document.getElementById('google-one-tap-container');
            if (popup) popup.style.display = 'block';
          }
        });
      }
    } else {
      // Simulate successful Google Login in dev environment
      setSocialLoading('google');
      setTimeout(async () => {
        const res = await socialLogin('google', {
          name: 'Demo Google User',
          email: 'demouser@gmail.com',
          avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
          socialId: 'demo-google-123456'
        });
        if (res.success) navigate('/');
        setSocialLoading('');
      }, 1000);
    }
  };

  // ── Facebook Login ────────────────────────────────────────────────────────
  const handleFacebookSignIn = async () => {
    setErrorMsg('');
    if (FACEBOOK_APP_ID && window.FB) {
      window.FB.login(async (response) => {
        if (response.authResponse) {
          window.FB.api('/me', { fields: 'name,email,picture' }, async (profile) => {
            const res = await socialLogin('facebook', {
              name: profile.name,
              email: profile.email || `${profile.id}@facebook.com`,
              avatar: profile.picture?.data?.url || '',
              socialId: profile.id
            });
            if (res.success) navigate('/');
          });
        }
      }, { scope: 'public_profile,email' });
    } else {
      // Simulate successful Facebook Login in dev environment
      setSocialLoading('facebook');
      setTimeout(async () => {
        const res = await socialLogin('facebook', {
          name: 'Demo Facebook User',
          email: 'demofb@gmail.com',
          avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80',
          socialId: 'demo-fb-123456'
        });
        if (res.success) navigate('/');
        setSocialLoading('');
      }, 1000);
    }
  };

  // ── Password Login ────────────────────────────────────────────────────────
  const handlePasswordLogin = async (e) => {
    e.preventDefault();
    setErrorMsg(''); setSuccessMsg('');
    const res = await login(email, password);
    if (res.success) { navigate('/'); } else { setErrorMsg(res.message); }
  };

  // ── OTP Login ─────────────────────────────────────────────────────────────
  const handleSendLoginOTP = async (e) => {
    e.preventDefault();
    setErrorMsg(''); setSuccessMsg(''); setSubmitting(true);
    const emailP = otpType === 'email' ? otpEmail.trim() : null;
    const phoneP = otpType === 'mobile' ? fullPhone : null;

    try {
      const res = await sendOTP(emailP, phoneP, 'login');
      if (res.success) {
        if (res.demoOtp) setDemoOtp(res.demoOtp);
        setOtpStep(2); setTimer(60); setCanResend(false); setSuccessMsg(res.message);
      } else {
        setErrorMsg(res.message);
      }
    } catch {
      setErrorMsg('Failed to send login verification code. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleVerifyLoginOTP = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    if (!otpCode || otpCode.length < 6) { setErrorMsg('Please enter the 6-digit login OTP code.'); return; }
    setSubmitting(true);

    try {
      const res = await loginWithOTP(activeIdentifier, otpCode);
      if (res.success) {
        navigate('/');
      } else {
        setErrorMsg(res.message);
      }
    } catch (err) {
      setErrorMsg('Verification failed. Please check the code.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSaveNewPassword = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    if (newPassword.length < 6) {
      setErrorMsg('Password must be at least 6 characters.');
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setErrorMsg('Passwords do not match.');
      return;
    }
    setResettingPassword(true);
    try {
      const res = await api.post('/auth/reset-password', { email: activeIdentifier, newPassword });
      if (res.data.success) {
        alert('🎉 Password updated successfully!');
        navigate('/');
      } else {
        setErrorMsg(res.data.message || 'Failed to update password.');
      }
    } catch (err) {
      console.error(err);
      setErrorMsg(err.response?.data?.message || 'Error updating password.');
    } finally {
      setResettingPassword(false);
    }
  };

  const handleResendLoginOTP = async () => {
    if (!canResend) return;
    setErrorMsg('');
    if (otpType === 'email') {
      const emailP = otpEmail.trim();
      const res = await sendOTP(emailP, null, 'login');
      if (res.success) {
        if (res.demoOtp) setDemoOtp(res.demoOtp);
        setTimer(60); setCanResend(false); setSuccessMsg('A new login OTP has been sent.');
      } else { setErrorMsg(res.message); }
    } else {
      // For mobile, just re-run handleSendLoginOTP
      const fakeEvent = { preventDefault: () => {} };
      await handleSendLoginOTP(fakeEvent);
    }
  };

  return (
    <main className="container section-padding auth-section">
      <div className="auth-card" style={{ maxWidth: '490px' }}>
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <h1 style={{ fontSize: '1.65rem', fontWeight: '800', color: 'var(--primary-color)' }}>
            Customer Sign In
          </h1>
          <p style={{ fontSize: '0.85rem', color: '#666', marginTop: '4px' }}>
            Access your orders, saved addresses &amp; express checkout
          </p>
        </div>



        {/* Alerts */}
        {errorMsg && (
          <div style={{ background: '#ffebee', color: '#c62828', padding: '10px 14px', borderRadius: '6px', fontSize: '0.85rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <i className="fa-solid fa-triangle-exclamation"></i> {errorMsg}
          </div>
        )}
        {successMsg && (
          <div style={{ background: '#e8f5e9', color: '#2e7d32', padding: '10px 14px', borderRadius: '6px', fontSize: '0.85rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <i className="fa-solid fa-circle-check"></i> {successMsg}
          </div>
        )}

        {/* ── PASSWORD LOGIN ──────────────────────────────────────────── */}
        {loginMode === 'password' && (
          <form onSubmit={handlePasswordLogin} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div>
              <label style={{ fontSize: '0.85rem', fontWeight: '600' }}>Email Address</label>
              <input type="email" className="form-input" placeholder="customer@novakart.com"
                value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: '600' }}>Password</label>
                <button type="button" onClick={() => { setLoginMode('otp'); setOtpEmail(email); setOtpStep(1); }}
                  style={{ background: 'none', border: 'none', color: 'var(--secondary-color)', fontSize: '0.78rem', cursor: 'pointer', fontWeight: '600' }}>
                  Forgot Password / Use OTP
                </button>
              </div>
              <div style={{ position: 'relative' }}>
                <input type={showPassword ? 'text' : 'password'} className="form-input"
                  placeholder="••••••••••••" value={password}
                  onChange={(e) => setPassword(e.target.value)} required
                  style={{ paddingRight: '42px' }} />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#999', cursor: 'pointer', fontSize: '0.9rem' }}>
                  <i className={`fa-solid ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                </button>
              </div>
            </div>
            <button type="submit" className="btn btn-primary"
              style={{ width: '100%', padding: '13px', marginTop: '6px', fontSize: '0.95rem' }} disabled={loading}>
              {loading ? <span><i className="fa-solid fa-spinner fa-spin"></i> Authenticating...</span>
                : <span>Sign In as Customer &rarr;</span>}
            </button>
          </form>
        )}

        {/* ── OTP LOGIN ───────────────────────────────────────────────── */}
        {loginMode === 'otp' && (
          <div>
            {otpStep === 1 ? (
              <form onSubmit={handleSendLoginOTP} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div>
                  <label style={{ fontSize: '0.85rem', fontWeight: '600' }}>Email Address</label>
                  <input type="email" className="form-input" placeholder="customer@novakart.com"
                    value={otpEmail} onChange={(e) => setOtpEmail(e.target.value)} required />
                </div>
                <button type="submit" id="send-otp-btn" className="btn btn-primary"
                  style={{ width: '100%', padding: '13px', fontSize: '0.95rem' }}
                  disabled={submitting || loading || !otpEmail}>
                  {submitting ? <span><i className="fa-solid fa-spinner fa-spin"></i> Sending...</span>
                    : <span><i className="fa-solid fa-paper-plane"></i> Send Login OTP &rarr;</span>}
                </button>
              </form>
            ) : otpStep === 2 ? (
              <div className="otp-container">
                <div className="otp-badge-sent">
                  <i className="fa-solid fa-shield-check"></i> Code sent to {activeIdentifier}
                </div>
                {demoOtp && (
                  <div className="demo-otp-banner">
                    <div>⚡ <strong>Developer Demo OTP:</strong> <span className="demo-otp-code">{demoOtp}</span></div>
                    <button type="button" className="demo-otp-btn" onClick={() => setOtpCode(demoOtp)}>
                      <i className="fa-solid fa-wand-magic-sparkles"></i> 1-Click Auto-Fill Code
                    </button>
                  </div>
                )}
                <form onSubmit={handleVerifyLoginOTP}>
                  <div style={{ margin: '16px 0' }}>
                    <label style={{ fontSize: '0.9rem', fontWeight: '700' }}>Enter 6-Digit OTP:</label>
                    <input type="text" maxLength="6" className="form-input"
                      style={{ textAlign: 'center', fontSize: '1.8rem', letterSpacing: '10px', fontWeight: '800', maxWidth: '260px', margin: '12px auto', display: 'block' }}
                      placeholder="••••••" value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value.replace(/[^0-9]/g, ''))} autoFocus required />
                  </div>
                  <button type="submit" className="btn btn-primary"
                    style={{ width: '100%', padding: '13px', fontSize: '0.95rem' }}
                    disabled={submitting || loading || otpCode.length < 6}>
                    {submitting ? 'Verifying...' : 'Verify OTP'}
                  </button>
                  <div className="otp-timer-box">
                    {timer > 0 ? <span>Resend code in <strong>{timer}s</strong></span> : (
                      <button type="button" className="otp-resend-link" onClick={handleResendLoginOTP} disabled={!canResend}>Resend OTP</button>
                    )}
                  </div>
                  <div style={{ marginTop: '14px' }}>
                    <button type="button" onClick={() => setOtpStep(1)}
                      style={{ background: 'none', border: 'none', color: '#666', fontSize: '0.85rem', cursor: 'pointer', textDecoration: 'underline' }}>
                      &larr; Change Email
                    </button>
                  </div>
                </form>
              </div>
            ) : (
              <div className="otp-container" style={{ textAlign: 'left' }}>
                <div style={{ background: '#e8f5e9', color: '#2e7d32', padding: '10px 14px', borderRadius: '6px', fontSize: '0.85rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <i className="fa-solid fa-circle-check"></i> Email Verified Successfully!
                </div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '8px', color: 'var(--primary-color)' }}>Set New Password</h3>
                <p style={{ fontSize: '0.8rem', color: '#666', marginBottom: '14px' }}>
                  Please enter a new password to update your login credentials. You can also skip this if you do not want to set a new password right now.
                </p>
                <form onSubmit={handleSaveNewPassword} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div>
                    <label style={{ fontSize: '0.82rem', fontWeight: '600' }}>New Password</label>
                    <input type="password" className="form-input" placeholder="At least 6 characters"
                      value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.82rem', fontWeight: '600' }}>Confirm New Password</label>
                    <input type="password" className="form-input" placeholder="Re-enter password"
                      value={confirmNewPassword} onChange={(e) => setConfirmNewPassword(e.target.value)} required />
                  </div>
                  <div style={{ display: 'flex', gap: '10px', marginTop: '6px' }}>
                    <button type="button" className="btn" onClick={() => navigate('/')}
                      style={{ flex: 1, padding: '12px', background: '#f1f5f9', border: '1px solid #cbd5e1', color: '#475569', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' }}>
                      Skip
                    </button>
                    <button type="submit" className="btn btn-primary" style={{ flex: 2, padding: '12px' }} disabled={resettingPassword}>
                      {resettingPassword ? 'Saving...' : 'Save & Continue'}
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        )}

        {/* ── SOCIAL AUTH ─────────────────────────────────────────────── */}
        <div className="auth-divider"><span>Or Continue With</span></div>

        <div className="social-auth-group">
          {/* Real Google Sign-In */}
          <button type="button" className="btn-social btn-google"
            onClick={handleGoogleSignIn}
            disabled={!!socialLoading || loading}
            title={!GOOGLE_CLIENT_ID ? 'Add VITE_GOOGLE_CLIENT_ID to .env to enable' : 'Sign in with Google'}>
            {socialLoading === 'google' ? (
              <i className="fa-solid fa-spinner fa-spin"></i>
            ) : (
              <svg width="18" height="18" viewBox="0 0 48 48">
                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.79l7.97-6.2z"/>
                <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
              </svg>
            )}
            {socialLoading === 'google' ? 'Signing in with Google...' : 'Continue with Google'}
          </button>

          {/* Real Facebook Login */}
          <button type="button" className="btn-social btn-facebook"
            onClick={handleFacebookSignIn}
            disabled={!!socialLoading || loading}
            title={!FACEBOOK_APP_ID ? 'Add VITE_FACEBOOK_APP_ID to .env to enable' : 'Sign in with Facebook'}>
            {socialLoading === 'facebook' ? (
              <i className="fa-solid fa-spinner fa-spin"></i>
            ) : (
              <i className="fa-brands fa-facebook-f" style={{ fontSize: '1.1rem' }}></i>
            )}
            {socialLoading === 'facebook' ? 'Signing in with Facebook...' : 'Continue with Facebook'}
          </button>
        </div>

        {/* Info banner when credentials not set */}
        {(!GOOGLE_CLIENT_ID || !FACEBOOK_APP_ID) && (
          <div style={{ background: '#fff8e1', border: '1px solid #ffd54f', borderRadius: '6px', padding: '10px 14px', fontSize: '0.78rem', color: '#795548', marginTop: '12px', lineHeight: '1.5' }}>
            <i className="fa-solid fa-circle-info" style={{ color: '#f59e0b' }}></i>{' '}
            {!GOOGLE_CLIENT_ID && !FACEBOOK_APP_ID
              ? 'Google & Facebook logins require API credentials. Add VITE_GOOGLE_CLIENT_ID and VITE_FACEBOOK_APP_ID to customer-frontend/.env'
              : !GOOGLE_CLIENT_ID
              ? 'Add VITE_GOOGLE_CLIENT_ID to customer-frontend/.env to enable Google login.'
              : 'Add VITE_FACEBOOK_APP_ID to customer-frontend/.env to enable Facebook login.'}
          </div>
        )}

        <div style={{ textAlign: 'center', marginTop: '22px', fontSize: '0.85rem', color: '#666' }}>
          New customer? <Link to="/register" style={{ color: 'var(--secondary-color)', fontWeight: '700' }}>Create an Account</Link>
        </div>
      </div>
    </main>
  );
}
