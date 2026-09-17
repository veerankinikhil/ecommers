import React, { useState } from 'react';
import { Link } from 'react-router-dom';

export default function ContactPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    alert(`Thank you ${name}! Your message "${subject}" has been sent successfully. We will reply to ${email} shortly.`);
    setName('');
    setEmail('');
    setSubject('');
    setMessage('');
  };

  return (
    <main className="container">
      <div className="breadcrumbs">
        <Link to="/">Home</Link> <span>/</span> <span>Contact Us</span>
      </div>

      <div className="contact-layout">
        <div className="contact-info-container">
          <div className="contact-card">
            <h3>Get In Touch</h3>

            <div className="info-item">
              <div className="info-icon-box"><i className="fa-solid fa-location-dot"></i></div>
              <div className="info-details">
                <h4>Campus Location / Address</h4>
                <p>NovaKart Innovation Tech Hub, Block 4<br />University Tech Park, Silicon Valley, CA 94025</p>
              </div>
            </div>

            <div className="info-item">
              <div className="info-icon-box"><i className="fa-solid fa-envelope"></i></div>
              <div className="info-details">
                <h4>Email Support</h4>
                <p>support@novakart-smartcart.edu<br />helpdesk@novakart.com</p>
              </div>
            </div>

            <div className="info-item">
              <div className="info-icon-box"><i className="fa-solid fa-phone"></i></div>
              <div className="info-details">
                <h4>Phone / Helpline</h4>
                <p>+1 (800) 555-NOVA (6682)<br />Mon - Sat: 8:00 AM - 8:00 PM EST</p>
              </div>
            </div>
          </div>

          <div className="map-placeholder-card">
            <div className="map-placeholder">
              <i className="fa-solid fa-map-location-dot"></i>
              <p>Google Maps Interactive Location</p>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>NovaKart Tech Hub • 37.3861° N, 122.0839° W</span>
            </div>
          </div>
        </div>

        <div className="contact-form-card">
          <h2>Send Us a Message</h2>
          <p>Have questions about your order, student discounts, or product inquiries? Fill out the form below and our team will get back to you within 2 hours.</p>

          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Your Name</label>
              <div className="form-input-wrap">
                <i className="fa-solid fa-user"></i>
                <input type="text" className="form-input" placeholder="e.g. Sarah Connor" value={name} onChange={(e) => setName(e.target.value)} required />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Your Email Address</label>
              <div className="form-input-wrap">
                <i className="fa-solid fa-envelope"></i>
                <input type="email" className="form-input" placeholder="sarah@college.edu" value={email} onChange={(e) => setEmail(e.target.value)} required />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Subject</label>
              <div className="form-input-wrap">
                <i className="fa-solid fa-tag"></i>
                <input type="text" className="form-input" placeholder="Order Tracking / General Inquiry" value={subject} onChange={(e) => setSubject(e.target.value)} required />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Your Message</label>
              <textarea className="form-textarea" placeholder="Write your message details here..." value={message} onChange={(e) => setMessage(e.target.value)} required></textarea>
            </div>

            <button type="submit" className="btn-auth-submit" style={{ marginTop: '10px' }}>
              <i className="fa-solid fa-paper-plane"></i> Send Message
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
