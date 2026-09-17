import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      alert('Passwords do not match!');
      return;
    }
    alert(`Account created successfully for ${formData.fullName}!`);
    navigate('/login');
  };

  return (
    <main className="container">
      <div className="auth-section">
        <div className="auth-card" style={{ maxWidth: '500px' }}>
          <div className="auth-header">
            <Link to="/" className="logo">
              <div className="logo-icon"><i className="fa-solid fa-cart-shopping"></i></div>
              <span>Nova<span className="logo-accent">Kart</span></span>
            </Link>
            <h1 className="auth-title">Create Account</h1>
            <p className="auth-subtitle">Join NovaKart for exclusive college deals and fast delivery</p>
          </div>

          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <div className="form-input-wrap">
                <i className="fa-solid fa-user"></i>
                <input type="text" name="fullName" className="form-input" placeholder="John Doe" value={formData.fullName} onChange={handleChange} required />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Email Address</label>
              <div className="form-input-wrap">
                <i className="fa-solid fa-envelope"></i>
                <input type="email" name="email" className="form-input" placeholder="student@college.edu" value={formData.email} onChange={handleChange} required />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Phone Number</label>
              <div className="form-input-wrap">
                <i className="fa-solid fa-phone"></i>
                <input type="tel" name="phone" className="form-input" placeholder="+91 98765 43210" value={formData.phone} onChange={handleChange} required />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <div className="form-input-wrap">
                <i className="fa-solid fa-lock"></i>
                <input type="password" name="password" className="form-input" placeholder="At least 6 characters" value={formData.password} onChange={handleChange} required />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Confirm Password</label>
              <div className="form-input-wrap">
                <i className="fa-solid fa-shield-halved"></i>
                <input type="password" name="confirmPassword" className="form-input" placeholder="Re-enter your password" value={formData.confirmPassword} onChange={handleChange} required />
              </div>
            </div>

            <label className="checkbox-wrap" style={{ fontSize: '0.82rem', marginTop: '4px' }}>
              <input type="checkbox" defaultChecked required />
              <span>I agree to the NovaKart Terms of Use &amp; Privacy Policy</span>
            </label>

            <button type="submit" className="btn-auth-submit">
              <i className="fa-solid fa-user-plus"></i> Create Account
            </button>
          </form>

          <div className="auth-divider">
            <span>Already registered?</span>
          </div>

          <div className="auth-switch-text">
            Already have an account? <Link to="/login">Sign In Here</Link>
          </div>
        </div>
      </div>
    </main>
  );
}
