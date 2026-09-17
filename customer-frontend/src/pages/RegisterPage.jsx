import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { COUNTRY_CODES } from '../data/countryCodes';
const auth = null;

export default function RegisterPage() {
  // 1. Basic Form Fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // 2. Mobile & Country Code
  const [countryCode, setCountryCode] = useState('+91');
  const [phoneRaw, setPhoneRaw] = useState('');
  const fullPhone = `${countryCode} ${phoneRaw.trim()}`;

  // 3. Email OTP State & Verification
  const [emailOtpSent, setEmailOtpSent] = useState(false);
  const [emailVerified, setEmailVerified] = useState(false);
  const [emailOtpInput, setEmailOtpInput] = useState('');
  const [emailDemoOtp, setEmailDemoOtp] = useState(null);
  const [emailTimer, setEmailTimer] = useState(60);
  const [emailCanResend, setEmailCanResend] = useState(false);
  const [emailSending, setEmailSending] = useState(false);
  const [emailVerifying, setEmailVerifying] = useState(false);

  // 4. Mobile State (OTP removed)
  const [phoneVerified, setPhoneVerified] = useState(true);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);

  // UI Status
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { register, sendOTP, verifyOTP, socialLogin, loginWithFirebasePhone, loading } = useAuth();
  const navigate = useNavigate();

  // Email Timer Countdown
  useEffect(() => {
    let interval = null;
    if (emailOtpSent && !emailVerified && emailTimer > 0) {
      interval = setInterval(() => setEmailTimer(prev => prev - 1), 1000);
    } else if (emailTimer === 0) {
      setEmailCanResend(true);
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [emailOtpSent, emailVerified, emailTimer]);

  // ================= 1. Send Email OTP =================
  const handleSendEmailOTP = async () => {
    if (!email || !email.includes('@')) {
      setErrorMsg('Please enter a valid email address first.');
      return;
    }
    setErrorMsg('');
    setEmailSending(true);
    try {
      const res = await sendOTP(email, null, 'registration');
      if (res.success) {
        setEmailOtpSent(true);
        if (res.demoOtp) setEmailDemoOtp(res.demoOtp);
        setEmailTimer(60);
        setEmailCanResend(false);
        setSuccessMsg(`OTP sent to email: ${email}`);
      } else {
        setErrorMsg(res.message);
      }
    } catch (err) {
      setErrorMsg('Failed to send email OTP.');
    } finally {
      setEmailSending(false);
    }
  };

  // ================= 2. Verify Email OTP =================
  const handleVerifyEmailOTP = async () => {
    if (!emailOtpInput || emailOtpInput.length < 6) {
      setErrorMsg('Please enter the 6-digit email OTP.');
      return;
    }
    setErrorMsg('');
    setEmailVerifying(true);
    try {
      const res = await verifyOTP(email, emailOtpInput, 'registration');
      if (res.success) {
        setEmailVerified(true);
        setEmailOtpSent(false);
        setSuccessMsg('✅ Email verified successfully!');
      } else {
        setErrorMsg(res.message);
      }
    } catch (err) {
      setErrorMsg('Invalid email OTP code.');
    } finally {
      setEmailVerifying(false);
    }
  };

  // ================= 3. Send Mobile SMS OTP (Removed) =================

  // ================= 5. Final Form Submission =================
  const handleFinalSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!name.trim()) {
      setErrorMsg('Please enter your full name.');
      return;
    }
    if (!emailVerified) {
      setErrorMsg('Please verify your Email OTP before creating account.');
      return;
    }
    if (!acceptedTerms) {
      setErrorMsg('You must accept the Terms & Conditions.');
      return;
    }
    if (password.length < 6) {
      setErrorMsg('Password must be at least 6 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match. Please re-enter.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await register(name, email, password, fullPhone, acceptedTerms);
      if (res.success) {
        alert('🎉 Registration complete! Welcome to NovaKart.');
        navigate('/');
      } else {
        setErrorMsg(res.message);
      }
    } catch (err) {
      setErrorMsg('Error creating account. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // Social Sign Ups (Local simulation fallback)
  const handleSocialSignUp = async (providerName) => {
    setErrorMsg('');
    try {
      const res = await socialLogin(providerName, {
        name: `Demo ${providerName.charAt(0).toUpperCase() + providerName.slice(1)} User`,
        email: `demo${providerName}@gmail.com`,
        avatar: providerName === 'google' 
          ? 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80'
          : 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80',
        socialId: `demo-${providerName}-123456`
      });
      if (res.success) {
        navigate('/');
      } else {
        setErrorMsg(res.message);
      }
    } catch (err) {
      setErrorMsg(`${providerName.toUpperCase()} Sign-Up failed.`);
    }
  };

  return (
    <main className="container section-padding auth-section">
      <div className="auth-card" style={{ maxWidth: '520px' }}>
        <div style={{ textAlign: 'center', marginBottom: '18px' }}>
          <h1 style={{ fontSize: '1.65rem', fontWeight: '800', color: 'var(--primary-color)' }}>
            Customer Registration
          </h1>
          <p style={{ fontSize: '0.84rem', color: '#666', marginTop: '4px' }}>
            All-In-One Verified Account Creation
          </p>
        </div>

        {/* Social Registration */}
        <div className="social-auth-group">
          <button type="button" className="btn-social btn-google" onClick={() => handleSocialSignUp('google')} disabled={loading}>
            <svg width="18" height="18" viewBox="0 0 48 48">
              <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
              <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
              <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.79l7.97-6.2z"/>
              <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
            </svg>
            Sign up with Google
          </button>

          <button type="button" className="btn-social btn-facebook" onClick={() => handleSocialSignUp('facebook')} disabled={loading}>
            <i className="fa-brands fa-facebook-f" style={{ fontSize: '1.1rem' }}></i>
            Sign up with Facebook
          </button>
        </div>

        <div className="auth-divider">
          <span>Or Complete Verified Registration</span>
        </div>

        {/* Global Error Alert */}
        {errorMsg && (
          <div style={{ background: '#ffebee', color: '#c62828', padding: '10px 14px', borderRadius: '6px', fontSize: '0.85rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <i className="fa-solid fa-triangle-exclamation"></i> {errorMsg}
          </div>
        )}

        {/* Global Success Alert */}
        {successMsg && (
          <div style={{ background: '#e8f5e9', color: '#2e7d32', padding: '10px 14px', borderRadius: '6px', fontSize: '0.85rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <i className="fa-solid fa-circle-check"></i> {successMsg}
          </div>
        )}

        <form onSubmit={handleFinalSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* 1. Full Name */}
          <div>
            <label style={{ fontSize: '0.85rem', fontWeight: '600' }}>Full Name *</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Gandu Bhargav"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          {/* 2. Email Address with Beside Send OTP Button */}
          <div>
            <label style={{ fontSize: '0.85rem', fontWeight: '600' }}>Email Address *</label>
            <div className="input-action-row">
              <input
                type="email"
                className="form-input"
                placeholder="241fa07004@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={emailVerified}
                required
              />
              {emailVerified ? (
                <div className="btn-verified-status">
                  <i className="fa-solid fa-circle-check"></i> Verified
                </div>
              ) : (
                <button
                  type="button"
                  className="btn-action-send"
                  onClick={handleSendEmailOTP}
                  disabled={emailSending || !email || (emailOtpSent && !emailCanResend)}
                >
                  {emailSending ? (
                    <i className="fa-solid fa-spinner fa-spin"></i>
                  ) : emailOtpSent ? (
                    emailCanResend ? 'Resend OTP' : `Resend (${emailTimer}s)`
                  ) : (
                    'Send OTP'
                  )}
                </button>
              )}
            </div>

            {/* Email OTP Inline Dropdown Bar */}
            {emailOtpSent && !emailVerified && (
              <div className="inline-otp-dropdown">
                <div className="inline-otp-row">
                  <input
                    type="text"
                    maxLength="6"
                    className="inline-otp-input"
                    placeholder="Enter 6-Digit Email OTP"
                    value={emailOtpInput}
                    onChange={(e) => setEmailOtpInput(e.target.value.replace(/[^0-9]/g, ''))}
                    autoFocus
                  />
                  <button
                    type="button"
                    className="btn-verify-otp"
                    onClick={handleVerifyEmailOTP}
                    disabled={emailVerifying || emailOtpInput.length < 6}
                  >
                    {emailVerifying ? 'Verifying...' : 'Verify OTP'}
                  </button>
                </div>
                <div className="inline-otp-footer">
                  <span>Enter the 6-digit code sent to <strong>{email}</strong></span>
                </div>
              </div>
            )}
          </div>

          {/* 3. Mobile Number with Country Code Dropdown */}
          <div>
            <label style={{ fontSize: '0.85rem', fontWeight: '600' }}>Mobile Phone Number *</label>
            <div className="input-action-row">
              <select
                className="country-code-select"
                value={countryCode}
                onChange={(e) => setCountryCode(e.target.value)}
              >
                {COUNTRY_CODES.map((c) => (
                  <option key={c.code + c.name} value={c.code}>
                    {c.flag} {c.code} ({c.name})
                  </option>
                ))}
              </select>

              <input
                type="tel"
                className="form-input"
                placeholder="9177850108"
                value={phoneRaw}
                onChange={(e) => setPhoneRaw(e.target.value.replace(/[^0-9]/g, ''))}
                required
              />
            </div>
          </div>

          {/* 4. Password */}
          <div>
            <label style={{ fontSize: '0.85rem', fontWeight: '600' }}>Password *</label>
            <input
              type="password"
              className="form-input"
              placeholder="At least 6 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
            />
          </div>

          {/* 5. Re-Enter Password */}
          <div>
            <label style={{ fontSize: '0.85rem', fontWeight: '600' }}>Re-enter Password *</label>
            <input
              type="password"
              className="form-input"
              placeholder="Confirm your password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength={6}
            />
            {confirmPassword && password !== confirmPassword && (
              <span style={{ fontSize: '0.78rem', color: '#c62828', marginTop: '4px', display: 'block' }}>
                <i className="fa-solid fa-circle-xmark"></i> Passwords do not match
              </span>
            )}
            {confirmPassword && password === confirmPassword && (
              <span style={{ fontSize: '0.78rem', color: '#2e7d32', marginTop: '4px', display: 'block' }}>
                <i className="fa-solid fa-circle-check"></i> Passwords match!
              </span>
            )}
          </div>

          {/* Terms and Conditions Checkbox */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '10px' }}>
            <input
              type="checkbox"
              id="acceptedTerms"
              checked={acceptedTerms}
              onChange={(e) => setAcceptedTerms(e.target.checked)}
              required
            />
            <label htmlFor="acceptedTerms" style={{ fontSize: '0.85rem', color: '#555', cursor: 'pointer' }}>
              I agree to the <button type="button" onClick={() => setShowTermsModal(true)} style={{ background: 'none', border: 'none', padding: 0, textDecoration: 'underline', color: 'var(--secondary-color)', fontWeight: '600', cursor: 'pointer' }}>Terms & Conditions</button>
            </label>
          </div>

          {/* 6. Complete Registration Button */}
          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', padding: '14px', marginTop: '8px', fontSize: '1rem', fontWeight: '700' }}
            disabled={submitting || loading || !emailVerified}
          >
            {submitting ? (
              <span><i className="fa-solid fa-spinner fa-spin"></i> Creating Verified Account...</span>
            ) : !emailVerified ? (
              'Verify Email to Continue'
            ) : (
              'Create Verified Customer Account \u2714'
            )}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '22px', fontSize: '0.85rem', color: '#666' }}>
          Already have an account? <Link to="/login" style={{ color: 'var(--secondary-color)', fontWeight: '700' }}>Sign In</Link>
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
              background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)', color: '#ffffff'
            }}>
              <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '800', display: 'flex', alignItems: 'center', zIndex: 10002, gap: '8px' }}>
                <i className="fa-solid fa-file-shield" style={{ color: '#fbbf24' }}></i> NovaKart Customer Terms of Service
              </h3>
              <button type="button" onClick={() => setShowTermsModal(false)} style={{
                background: 'none', border: 'none', color: '#94a3b8', fontSize: '1.5rem',
                cursor: 'pointer', lineHeight: 1, padding: 0
              }}>&times;</button>
            </div>

            {/* Body */}
            <div style={{
              padding: '24px', overflowY: 'auto', maxHeight: '55vh',
              fontSize: '0.88rem', lineHeight: '1.6', color: '#334155', textAlign: 'left'
            }}>
              <p style={{ marginTop: 0, fontWeight: '600' }}>Last Updated: August 27, 2026</p>
              <p>Welcome to NovaKart! Please read these Customer Terms of Service carefully before creating your account or purchasing products. By registering as a customer, you agree to comply with and be bound by the following terms.</p>

              <h4 style={{ color: '#0f172a', fontSize: '0.95rem', fontWeight: '700', marginTop: '16px', marginBottom: '8px' }}>1. Customer Account Eligibility & Security</h4>
              <p>To register for a customer account on NovaKart, you must be at least 18 years of age or possess legal parental consent. You agree to provide accurate, complete, and current registration information. You are solely responsible for maintaining the confidentiality of your username and password, and you accept responsibility for all activities that occur under your account.</p>

              <h4 style={{ color: '#0f172a', fontSize: '0.95rem', fontWeight: '700', marginTop: '16px', marginBottom: '8px' }}>2. Product Listings and Ordering</h4>
              <p>NovaKart is a multi-vendor platform, meaning products are listed, sold, and fulfilled directly by independent third-party merchants. While we require all sellers to list products accurately, NovaKart does not guarantee that product descriptions, pricing, images, or availability metrics are entirely error-free. We reserve the right to cancel orders arising from typographical or computational pricing errors.</p>

              <h4 style={{ color: '#0f172a', fontSize: '0.95rem', fontWeight: '700', marginTop: '16px', marginBottom: '8px' }}>3. Fair Billing & Shipping Coordinates</h4>
              <p>By placing an order, you warrant that you are authorized to use the specified payment instrument and that your billing information is accurate. You must provide valid shipping coordinates. Any shipping delays or delivery failures caused by inaccurate physical addresses are the sole responsibility of the customer.</p>

              <h4 style={{ color: '#0f172a', fontSize: '0.95rem', fontWeight: '700', marginTop: '16px', marginBottom: '8px' }}>4. Return Policy & Refund Credits</h4>
              <p>Standard products purchased on NovaKart are covered by our 10-day return policy, starting from the recorded day of delivery. Returns must be shipped back in their original packaging, unused, and with all protective tags intact. Refunds will be credited to the original payment channel or as store credits upon successful product verification by the respective merchant.</p>

              <h4 style={{ color: '#0f172a', fontSize: '0.95rem', fontWeight: '700', marginTop: '16px', marginBottom: '8px' }}>5. Respectful Code of Conduct</h4>
              <p>Customers must interact respectfully with independent sellers and our delivery agents. Harassment, abuse, fraudulent chargebacks, or attempts to manipulate our review rating system will result in immediate account suspension or termination.</p>
            </div>

            {/* Footer */}
            <div style={{
              padding: '16px 24px', borderTop: '1px solid #e2e8f0',
              display: 'flex', justifyContent: 'flex-end', gap: '12px', background: '#f8fafc'
            }}>
              <button type="button" onClick={() => { setAcceptedTerms(true); setShowTermsModal(false); }} className="btn btn-primary" style={{
                padding: '10px 20px', fontSize: '0.88rem', fontWeight: '700'
              }}>
                I Accept Terms &amp; Conditions
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
