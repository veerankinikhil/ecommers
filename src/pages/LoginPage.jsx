import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    alert(`Signed in successfully as ${email}`);
    navigate('/');
  };

  return (
    <main className="container">
      <div className="auth-section">
        <div className="auth-card">
          <div className="auth-header">
            <Link to="/" className="logo">
              <div className="logo-icon"><i className="fa-solid fa-cart-shopping"></i></div>
              <span>Nova<span className="logo-accent">Kart</span></span>
            </Link>
            <h1 className="auth-title">Welcome Back</h1>
            <p className="auth-subtitle">Sign in to your NovaKart account to continue</p>
          </div>

          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="login-email" className="form-label">Email Address</label>
              <div className="form-input-wrap">
                <i className="fa-solid fa-envelope"></i>
                <input 
                  type="email" 
                  id="login-email" 
                  className="form-input" 
                  placeholder="student@college.edu" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required 
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="login-password" className="form-label">Password</label>
              <div className="form-input-wrap">
                <i className="fa-solid fa-lock"></i>
                <input 
                  type="password" 
                  id="login-password" 
                  className="form-input" 
                  placeholder="••••••••••••" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required 
                />
              </div>
            </div>

            <div className="form-options">
              <label className="checkbox-wrap">
                <input type="checkbox" defaultChecked />
                <span>Remember Me</span>
              </label>
              <a href="#" className="forgot-link">Forgot Password?</a>
            </div>

            <button type="submit" className="btn-auth-submit">
              <i className="fa-solid fa-right-to-bracket"></i> Sign In
            </button>
          </form>

          <div className="auth-divider">
            <span>New to NovaKart?</span>
          </div>

          <div className="auth-switch-text">
            Don't have an account? <Link to="/register">Create Account</Link>
          </div>
        </div>
      </div>
    </main>
  );
}
