import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

export default function CustomerMobileBottomNav({ isRealMobile = false }) {
  const { cartCount } = useCart();
  const { user } = useAuth();
  const [showRufusModal, setShowRufusModal] = useState(false);
  const navigate = useNavigate();

  return (
    <>
      <nav
        className="amazon-mobile-bottom-nav"
        style={{
          position: isRealMobile ? 'fixed' : 'relative',
          bottom: 0,
          left: 0,
          right: 0,
          width: '100%',
          height: '56px',
          background: '#FFFFFF',
          borderTop: '1px solid #E5E7EB',
          display: 'flex',
          justifyContent: 'space-around',
          alignItems: 'center',
          padding: isRealMobile ? '4px 2px calc(4px + env(safe-area-inset-bottom, 0px)) 2px' : '4px 2px',
          zIndex: 99999,
          boxShadow: '0 -2px 10px rgba(0,0,0,0.07)',
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
        }}
      >
        {/* 1. HOME (with Amazon smile curve underneath house) */}
        <NavLink
          to="/"
          className={({ isActive }) => `amazon-nav-item ${isActive ? 'active' : ''}`}
          style={({ isActive }) => ({
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            color: isActive ? '#007185' : '#111827',
            textDecoration: 'none',
            flex: 1,
            padding: '2px 0'
          })}
        >
          {({ isActive }) => (
            <>
              <div style={{ position: 'relative', height: '22px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <i className="fa-solid fa-house" style={{ fontSize: '1.2rem' }}></i>
                {/* Amazon signature curved smile arrow underneath */}
                <svg
                  width="22"
                  height="7"
                  viewBox="0 0 24 8"
                  style={{
                    position: 'absolute',
                    bottom: '-4px',
                    left: '50%',
                    transform: 'translateX(-50%)'
                  }}
                >
                  <path
                    d="M1 1C7 6 17 6 23 1"
                    fill="none"
                    stroke={isActive ? "#FF9900" : "#111827"}
                    strokeWidth="2.4"
                    strokeLinecap="round"
                  />
                </svg>
              </div>
              <span style={{ fontSize: '0.66rem', fontWeight: isActive ? '800' : '600', marginTop: '4px' }}>
                Home
              </span>
            </>
          )}
        </NavLink>

        {/* 2. YOU (with notification dot) */}
        <NavLink
          to={user ? "/profile" : "/login"}
          className={({ isActive }) => `amazon-nav-item ${isActive ? 'active' : ''}`}
          style={({ isActive }) => ({
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            color: isActive ? '#007185' : '#111827',
            textDecoration: 'none',
            flex: 1,
            padding: '2px 0'
          })}
        >
          {({ isActive }) => (
            <>
              <div style={{ position: 'relative', height: '22px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <i className="fa-regular fa-user" style={{ fontSize: '1.25rem', fontWeight: '700' }}></i>
                {/* Pink notification dot as seen in Amazon app */}
                <span style={{
                  position: 'absolute',
                  top: '-1px',
                  right: '-5px',
                  width: '7px',
                  height: '7px',
                  background: '#E11D48',
                  borderRadius: '50%',
                  border: '1.5px solid #FFFFFF'
                }}></span>
              </div>
              <span style={{ fontSize: '0.66rem', fontWeight: isActive ? '800' : '600', marginTop: '4px' }}>
                You
              </span>
            </>
          )}
        </NavLink>

        {/* 3. WALLET / AMAZON PAY */}
        <NavLink
          to="/checkout/payment"
          className={({ isActive }) => `amazon-nav-item ${isActive ? 'active' : ''}`}
          style={({ isActive }) => ({
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            color: isActive ? '#007185' : '#111827',
            textDecoration: 'none',
            flex: 1,
            padding: '2px 0'
          })}
        >
          {({ isActive }) => (
            <>
              <div style={{ position: 'relative', height: '22px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <i className="fa-solid fa-wallet" style={{ fontSize: '1.2rem' }}></i>
              </div>
              <span style={{ fontSize: '0.66rem', fontWeight: isActive ? '800' : '600', marginTop: '4px' }}>
                Wallet
              </span>
            </>
          )}
        </NavLink>

        {/* 4. CART (with item count on cart) */}
        <NavLink
          to="/cart"
          className={({ isActive }) => `amazon-nav-item ${isActive ? 'active' : ''}`}
          style={({ isActive }) => ({
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            color: isActive ? '#007185' : '#111827',
            textDecoration: 'none',
            flex: 1,
            padding: '2px 0'
          })}
        >
          {({ isActive }) => (
            <>
              <div style={{ position: 'relative', height: '22px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <i className="fa-solid fa-cart-shopping" style={{ fontSize: '1.25rem' }}></i>
                <span style={{
                  position: 'absolute',
                  top: '-6px',
                  right: '-10px',
                  background: '#FFFFFF',
                  color: '#CC0C39',
                  fontSize: '0.74rem',
                  fontWeight: '900',
                  lineHeight: '1',
                  padding: '1px 4px',
                  borderRadius: '10px',
                  border: '1px solid rgba(204, 12, 57, 0.3)'
                }}>
                  {cartCount || 0}
                </span>
              </div>
              <span style={{ fontSize: '0.66rem', fontWeight: isActive ? '800' : '600', marginTop: '4px' }}>
                Cart
              </span>
            </>
          )}
        </NavLink>

        {/* 5. BROWSE */}
        <NavLink
          to="/products"
          className={({ isActive }) => `amazon-nav-item ${isActive ? 'active' : ''}`}
          style={({ isActive }) => ({
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            color: isActive ? '#007185' : '#111827',
            textDecoration: 'none',
            flex: 1,
            padding: '2px 0'
          })}
        >
          {({ isActive }) => (
            <>
              <div style={{ position: 'relative', height: '22px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <i className="fa-solid fa-bars" style={{ fontSize: '1.25rem' }}></i>
              </div>
              <span style={{ fontSize: '0.66rem', fontWeight: isActive ? '800' : '600', marginTop: '4px' }}>
                Browse
              </span>
            </>
          )}
        </NavLink>

        {/* 6. RUFUS (Amazon AI shopping assistant) */}
        <button
          onClick={() => setShowRufusModal(true)}
          style={{
            background: 'none',
            border: 'none',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#111827',
            cursor: 'pointer',
            flex: 1,
            padding: '2px 0'
          }}
          title="Amazon Rufus AI Assistant"
        >
          <div style={{ position: 'relative', height: '22px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.2rem',
              background: 'linear-gradient(135deg, #FF9900, #2563EB)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              <i className="fa-solid fa-wand-magic-sparkles"></i>
            </span>
            <span style={{
              position: 'absolute',
              top: '-2px',
              right: '-6px',
              width: '6px',
              height: '6px',
              background: '#FF9900',
              borderRadius: '50%'
            }}></span>
          </div>
          <span style={{ fontSize: '0.66rem', fontWeight: '800', marginTop: '4px', color: '#1E293B' }}>
            Rufus
          </span>
        </button>
      </nav>

      {/* RUFUS AI ASSISTANT MODAL (SLIDE-UP SHEET) */}
      {showRufusModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.6)',
          zIndex: 100000,
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'center'
        }}>
          <div style={{
            background: '#FFFFFF',
            width: '100%',
            maxWidth: '430px',
            borderTopLeftRadius: '24px',
            borderTopRightRadius: '24px',
            padding: '20px 18px calc(20px + env(safe-area-inset-bottom, 0px)) 18px',
            boxShadow: '0 -10px 30px rgba(0,0,0,0.25)',
            animation: 'slideUp 0.25s ease-out'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{
                  background: 'linear-gradient(135deg, #FF9900, #3B82F6)',
                  color: '#fff',
                  width: '30px',
                  height: '30px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.9rem'
                }}>
                  <i className="fa-solid fa-wand-magic-sparkles"></i>
                </span>
                <div>
                  <strong style={{ fontSize: '1.05rem', color: '#0F172A', display: 'block', lineHeight: '1.2' }}>Rufus</strong>
                  <span style={{ fontSize: '0.72rem', color: '#64748B' }}>Amazon AI Shopping Companion</span>
                </div>
              </div>
              <button
                onClick={() => setShowRufusModal(false)}
                style={{ background: 'none', border: 'none', fontSize: '1.4rem', color: '#64748B', cursor: 'pointer', padding: '4px 8px' }}
              >
                &times;
              </button>
            </div>

            <p style={{ fontSize: '0.84rem', color: '#475569', marginBottom: '14px', lineHeight: '1.4' }}>
              Ask anything! Compare prices in <strong>522019</strong>, find same-day local deals, or get instant delivery answers.
            </p>

            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '16px' }}>
              {['🔥 Best electronics under ₹5,000', '📦 Fastest delivery to 522019', '⭐ Top rated deals today'].map((prompt, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setShowRufusModal(false);
                    navigate(`/products?query=${encodeURIComponent(prompt.slice(2))}`);
                  }}
                  style={{
                    background: '#F1F5F9',
                    border: '1px solid #CBD5E1',
                    borderRadius: '20px',
                    padding: '6px 12px',
                    fontSize: '0.75rem',
                    fontWeight: '600',
                    color: '#1E293B',
                    cursor: 'pointer'
                  }}
                >
                  {prompt}
                </button>
              ))}
            </div>

            <button
              onClick={() => { setShowRufusModal(false); navigate('/products'); }}
              style={{
                width: '100%',
                background: '#FFD814',
                border: '1px solid #FCD200',
                borderRadius: '24px',
                padding: '12px',
                fontWeight: '800',
                fontSize: '0.92rem',
                cursor: 'pointer',
                color: '#0F172A',
                boxShadow: '0 2px 8px rgba(255, 216, 20, 0.4)'
              }}
            >
              Explore AI Recommendations &rarr;
            </button>
          </div>
        </div>
      )}
    </>
  );
}
