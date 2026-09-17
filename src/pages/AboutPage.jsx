import React from 'react';
import { Link } from 'react-router-dom';

export default function AboutPage() {
  return (
    <main className="container">
      <div className="breadcrumbs">
        <Link to="/">Home</Link> <span>/</span> <span>About Us</span>
      </div>

      <section className="about-hero">
        <div className="container about-intro-grid">
          <div className="about-intro-text">
            <h1 className="about-title">Empowering College Shopping with <span>NovaKart</span></h1>
            <p className="about-text">
              Founded as a premier college project initiative, NovaKart (SmartKart) is designed to deliver an Amazon-grade online shopping experience. We bridge the gap between high-end electronics, campus fashion, home essentials, and budget-friendly student pricing.
            </p>
            <p className="about-text">
              Our platform combines modern React JSX architecture, lightning-fast order fulfillment, and top-tier product curation to make online shopping seamless, affordable, and trustworthy.
            </p>
          </div>
          <div className="about-img-box">
            <img src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=800&q=80" alt="NovaKart Team & Office Collaboration" />
          </div>
        </div>
      </section>

      <div className="stats-bar">
        <div>
          <span className="stat-num">50K+</span>
          <span className="stat-label">Happy Customers</span>
        </div>
        <div>
          <span className="stat-num">1,200+</span>
          <span className="stat-label">Products Listed</span>
        </div>
        <div>
          <span className="stat-num">99.4%</span>
          <span className="stat-label">On-Time Delivery</span>
        </div>
        <div>
          <span className="stat-num">4.9/5</span>
          <span className="stat-label">Average Rating</span>
        </div>
      </div>

      <section className="section-padding" style={{ paddingTop: 0 }}>
        <div className="section-header">
          <div className="section-title-wrap">
            <h2 className="section-title">Our Guiding Principles</h2>
          </div>
        </div>

        <div className="mv-grid">
          <div className="mv-card">
            <div className="mv-icon"><i className="fa-solid fa-bullseye"></i></div>
            <h3>Our Mission</h3>
            <p>
              To empower students, tech enthusiasts, and everyday shoppers by delivering genuine, top-quality products at unbeatable prices with seamless navigation, fast shipping, and transparent customer care.
            </p>
          </div>

          <div className="mv-card">
            <div className="mv-icon"><i className="fa-solid fa-eye"></i></div>
            <h3>Our Vision</h3>
            <p>
              To become the premier campus-first digital e-commerce ecosystem, setting benchmark standards in frontend aesthetics, user accessibility, security, and digital convenience across all devices.
            </p>
          </div>
        </div>
      </section>

      <section className="section-padding">
        <div className="section-header">
          <div className="section-title-wrap">
            <h2 className="section-title">Why Choose NovaKart?</h2>
          </div>
        </div>

        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon-box"><i className="fa-solid fa-truck-fast"></i></div>
            <h4>Superfast Express Delivery</h4>
            <p>Next-day campus &amp; doorstep delivery with real-time order tracking support.</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon-box"><i className="fa-solid fa-shield-halved"></i></div>
            <h4>100% Secure Shopping</h4>
            <p>Encrypted checkouts, verified payment gateways, and zero hidden transaction fees.</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon-box"><i className="fa-solid fa-tags"></i></div>
            <h4>Exclusive Student Discounts</h4>
            <p>Special promotional codes, student coupons, and seasonal flash sales every week.</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon-box"><i className="fa-solid fa-headset"></i></div>
            <h4>24/7 Dedicated Support</h4>
            <p>Friendly customer support team ready to assist with returns, refunds, and inquiries.</p>
          </div>
        </div>
      </section>
    </main>
  );
}
