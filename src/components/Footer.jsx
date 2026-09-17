import React from 'react';
import { Link } from 'react-router-dom';

export default function Footer() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="site-footer">
      <div className="footer-top-btn" onClick={scrollToTop}>
        <a href="#top"><i className="fa-solid fa-angle-up"></i> Back to top</a>
      </div>

      <div className="footer-main">
        <div className="container footer-grid">
          <div className="footer-col">
            <h4>About NovaKart</h4>
            <p style={{ fontSize: '0.85rem', color: '#bbbbbb', lineHeight: '1.6', marginBottom: '14px' }}>
              NovaKart is a modern, student-centric E-Commerce platform built for college projects, offering premium tech, fashion, and daily essentials with fast shipping.
            </p>
            <div className="social-links">
              <a href="#" className="social-icon" aria-label="Facebook"><i className="fa-brands fa-facebook-f"></i></a>
              <a href="#" className="social-icon" aria-label="Twitter"><i className="fa-brands fa-twitter"></i></a>
              <a href="#" className="social-icon" aria-label="Instagram"><i className="fa-brands fa-instagram"></i></a>
              <a href="#" className="social-icon" aria-label="LinkedIn"><i className="fa-brands fa-linkedin-in"></i></a>
            </div>
          </div>

          <div className="footer-col">
            <h4>Quick Links</h4>
            <ul>
              <li><Link to="/"><i className="fa-solid fa-angle-right"></i> Home</Link></li>
              <li><Link to="/products"><i className="fa-solid fa-angle-right"></i> Shop Products</Link></li>
              <li><Link to="/about"><i className="fa-solid fa-angle-right"></i> About Us</Link></li>
              <li><Link to="/contact"><i className="fa-solid fa-angle-right"></i> Contact Support</Link></li>
              <li><Link to="/login"><i className="fa-solid fa-angle-right"></i> My Account</Link></li>
            </ul>
          </div>

          <div className="footer-col">
            <h4>Popular Categories</h4>
            <ul>
              <li><Link to="/products"><i className="fa-solid fa-angle-right"></i> Electronics &amp; Gadgets</Link></li>
              <li><Link to="/products"><i className="fa-solid fa-angle-right"></i> Men's &amp; Women's Fashion</Link></li>
              <li><Link to="/products"><i className="fa-solid fa-angle-right"></i> Home &amp; Office Supplies</Link></li>
              <li><Link to="/products"><i className="fa-solid fa-angle-right"></i> Sports &amp; Fitness Equipment</Link></li>
              <li><Link to="/products"><i className="fa-solid fa-angle-right"></i> Books &amp; Textbooks</Link></li>
            </ul>
          </div>

          <div className="footer-col">
            <h4>Customer Service</h4>
            <ul>
              <li><Link to="/contact"><i className="fa-solid fa-angle-right"></i> Help Center / FAQ</Link></li>
              <li><Link to="/contact"><i className="fa-solid fa-angle-right"></i> Track Your Order</Link></li>
              <li><Link to="/contact"><i className="fa-solid fa-angle-right"></i> Shipping Rates &amp; Policies</Link></li>
              <li><Link to="/contact"><i className="fa-solid fa-angle-right"></i> Returns &amp; Replacements</Link></li>
              <li><Link to="/contact"><i className="fa-solid fa-angle-right"></i> Student Discount Policy</Link></li>
            </ul>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <div className="container">
          <p>&copy; 2026 <span>NovaKart / SmartKart</span> College Project. All Rights Reserved. Built with React JSX.</p>
        </div>
      </div>
    </footer>
  );
}
