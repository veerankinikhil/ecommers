import React from 'react';
import { Link } from 'react-router-dom';
import { useDeviceMode } from '../context/DeviceModeContext';

export default function Footer() {
  const { isPhone } = useDeviceMode();

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (isPhone) {
    return (
      <footer className="amazon-mobile-footer" style={{
        padding: '20px 14px 40px 14px',
        textAlign: 'center',
        background: '#232F3E',
        color: '#FFFFFF',
        fontSize: '0.78rem'
      }}>
        <div
          onClick={scrollToTop}
          style={{
            background: '#37475A',
            padding: '12px',
            color: '#FFFFFF',
            fontWeight: '700',
            cursor: 'pointer',
            borderRadius: '6px',
            marginBottom: '16px',
            fontSize: '0.8rem'
          }}
        >
          &uarr; TOP OF PAGE
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', marginBottom: '12px', fontSize: '0.76rem', color: '#94A3B8' }}>
          <Link to="/orders" style={{ color: '#E2E8F0' }}>Your Orders</Link>
          <span>&bull;</span>
          <Link to="/profile" style={{ color: '#E2E8F0' }}>Your Account</Link>
          <span>&bull;</span>
          <Link to="/cart" style={{ color: '#E2E8F0' }}>Amazon Cart</Link>
        </div>
        <p style={{ color: '#94A3B8', fontSize: '0.7rem', margin: 0 }}>
          &copy; 1996–2026, NovaKart.com, Inc. or its affiliates
        </p>
      </footer>
    );
  }

  return (
    <footer className="site-footer">
      {/* Back to top bar */}
      <div className="footer-top-btn" onClick={scrollToTop}>
        Back to top
      </div>

      {/* Main 4-Column Directory */}
      <div className="footer-main">
        <div className="container footer-grid">
          
          <div className="footer-col">
            <h4>Get to Know Us</h4>
            <ul>
              <li><Link to="/about">About NovaKart</Link></li>
              <li><a href="#careers">Careers</a></li>
              <li><a href="#press">Press Releases</a></li>
              <li><a href="#science">NovaKart Science</a></li>
              <li><a href="#sustainability">Sustainability</a></li>
            </ul>
          </div>

          <div className="footer-col">
            <h4>Connect with Us</h4>
            <ul>
              <li><a href="https://facebook.com" target="_blank" rel="noreferrer"><i className="fa-brands fa-facebook"></i> Facebook</a></li>
              <li><a href="https://twitter.com" target="_blank" rel="noreferrer"><i className="fa-brands fa-x-twitter"></i> Twitter</a></li>
              <li><a href="https://instagram.com" target="_blank" rel="noreferrer"><i className="fa-brands fa-instagram"></i> Instagram</a></li>
            </ul>
          </div>

          <div className="footer-col">
            <h4>Make Money with Us</h4>
            <ul>
              <li><a href="http://localhost:3001" target="_blank" rel="noreferrer">Sell on NovaKart</a></li>
              <li><a href="http://localhost:3002" target="_blank" rel="noreferrer">Become a Delivery Partner</a></li>
              <li><a href="#brand-protection">Protect and Build Your Brand</a></li>
              <li><a href="#global-selling">NovaKart Global Selling</a></li>
              <li><a href="#advertise">Advertise Your Products</a></li>
              <li><a href="#fulfilment">Fulfilment by NovaKart</a></li>
            </ul>
          </div>

          <div className="footer-col">
            <h4>Let Us Help You</h4>
            <ul>
              <li><Link to="/profile">Your Account</Link></li>
              <li><Link to="/orders">Returns Centre</Link></li>
              <li><a href="#protection">100% Purchase Protection</a></li>
              <li><a href="#app">NovaKart App Download</a></li>
              <li><a href="#help">Help &amp; Support</a></li>
            </ul>
          </div>

        </div>
      </div>

      {/* Middle Brand & Locale Bar */}
      <div className="footer-middle">
        <div className="container footer-middle-content">
          <Link to="/" className="footer-logo">
            <span style={{ color: '#ff9900' }}>Nova</span>Kart
          </Link>

          <div className="footer-locale-group">
            <button className="locale-btn" type="button">
              <i className="fa-solid fa-globe"></i> English <i className="fa-solid fa-angle-down" style={{ fontSize: '0.65rem' }}></i>
            </button>
            <button className="locale-btn" type="button">
              <span style={{ marginRight: '6px' }}>🇮🇳</span> India
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Legal Disclaimer Bar */}
      <div className="footer-bottom">
        <div className="container">
          <div className="footer-legal-links">
            <a href="#conditions">Conditions of Use &amp; Sale</a>
            <a href="#privacy">Privacy Notice</a>
            <a href="#ads">Interest-Based Ads</a>
          </div>
          <p className="footer-copyright">
            &copy; 1996–2026, NovaKart.com, Inc. or its affiliates
          </p>
        </div>
      </div>
    </footer>
  );
}
