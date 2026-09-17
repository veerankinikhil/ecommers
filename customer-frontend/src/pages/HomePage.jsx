import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import ProductCard from '../components/ProductCard';
import { useDeviceMode } from '../context/DeviceModeContext';

export default function HomePage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isBannerPaused, setIsBannerPaused] = useState(false);
  const { isPhone } = useDeviceMode();
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/products')
      .then(({ data }) => {
        setProducts(data.products || []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <main>
      {/* ══════════════════════════════════════════════════════════════════════
          1. MOBILE AMAZON FEED (MATCHING USER SCREENSHOT!)
          ══════════════════════════════════════════════════════════════════════ */}
      {isPhone ? (
        <div className="amazon-mobile-home-feed" style={{ padding: '8px 10px 24px 10px' }}>
          
          {/* Featured Prime Perks Banner Carousel (Direct from Screenshot) */}
          <div style={{
            display: 'flex',
            gap: '12px',
            overflowX: 'auto',
            scrollbarWidth: 'none',
            marginBottom: '14px',
            paddingBottom: '4px'
          }}>
            {/* Card 1: Special Prime Offer (Blue Card) */}
            <div style={{
              flex: '0 0 78%',
              background: 'linear-gradient(180deg, #0066D6 0%, #00479E 100%)',
              color: '#FFFFFF',
              borderRadius: '16px',
              padding: '18px 16px',
              position: 'relative',
              boxShadow: '0 4px 14px rgba(0, 71, 158, 0.25)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              minHeight: '260px'
            }}>
              <div>
                <h2 style={{ fontSize: '1.45rem', fontWeight: '900', lineHeight: '1.2', margin: '0 0 4px 0' }}>
                  Special Prime<br />offer for you!
                </h2>
                <h3 style={{ fontSize: '1.15rem', fontWeight: '800', color: '#BAE6FD', margin: '0 0 16px 0', textShadow: '0 2px 4px rgba(0,0,0,0.2)' }}>
                  Shopping Perks
                </h3>

                {/* 4 Cluster Icons in Blue 3D style */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                    <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: '#38BDF8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', boxShadow: '0 4px 8px rgba(0,0,0,0.2)' }}>
                      🛵
                    </div>
                    <span style={{ fontSize: '0.62rem', fontWeight: '800', marginTop: '4px', lineHeight: '1.1' }}>FREE Fast delivery</span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                    <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: '#38BDF8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', boxShadow: '0 4px 8px rgba(0,0,0,0.2)' }}>
                      🏷️
                    </div>
                    <span style={{ fontSize: '0.62rem', fontWeight: '800', marginTop: '4px', lineHeight: '1.1' }}>% Discounts</span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                    <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: '#38BDF8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', boxShadow: '0 4px 8px rgba(0,0,0,0.2)' }}>
                      📅
                    </div>
                    <span style={{ fontSize: '0.62rem', fontWeight: '800', marginTop: '4px', lineHeight: '1.1' }}>Delivery scheduling</span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                    <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: '#38BDF8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', boxShadow: '0 4px 8px rgba(0,0,0,0.2)' }}>
                      💳
                    </div>
                    <span style={{ fontSize: '0.62rem', fontWeight: '800', marginTop: '4px', lineHeight: '1.1' }}>Cashback rewards</span>
                  </div>
                </div>
              </div>

              {/* Pause / Play icon at bottom left */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '14px' }}>
                <button
                  onClick={() => setIsBannerPaused(!isBannerPaused)}
                  style={{
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    background: 'rgba(0,0,0,0.5)',
                    border: 'none',
                    color: '#FFFFFF',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.7rem'
                  }}
                >
                  <i className={isBannerPaused ? "fa-solid fa-play" : "fa-solid fa-pause"}></i>
                </button>
                <span style={{ fontSize: '0.62rem', color: '#93C5FD' }}>*T&amp;C apply</span>
              </div>
            </div>

            {/* Card 2: Spin & Win Deals Card */}
            <div style={{
              flex: '0 0 78%',
              background: 'linear-gradient(180deg, #1E293B 0%, #0F172A 100%)',
              color: '#FFFFFF',
              borderRadius: '16px',
              padding: '18px 16px',
              position: 'relative',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              boxShadow: '0 4px 14px rgba(0,0,0,0.15)',
              minHeight: '260px'
            }}>
              <div>
                <span style={{ background: '#FF9900', color: '#131921', fontSize: '0.65rem', fontWeight: '800', padding: '2px 8px', borderRadius: '4px', textTransform: 'uppercase' }}>
                  LUCKY SPIN
                </span>
                <h2 style={{ fontSize: '1.35rem', fontWeight: '900', margin: '8px 0 2px 0' }}>
                  Spin &amp; Win Deals
                </h2>
                <h3 style={{ fontSize: '1.05rem', color: '#38BDF8', margin: '0 0 12px 0' }}>
                  Up to ₹300 Cashback!
                </h3>
                <p style={{ fontSize: '0.78rem', color: '#CBD5E1', lineHeight: '1.4' }}>
                  Place orders with verified Guntur corridor sellers and get instant cashback credited to your Nova wallet.
                </p>
              </div>

              <button
                onClick={() => navigate('/products')}
                style={{
                  background: '#FFD814',
                  border: '1px solid #FCD200',
                  color: '#0F172A',
                  fontWeight: '800',
                  fontSize: '0.82rem',
                  padding: '10px',
                  borderRadius: '20px',
                  cursor: 'pointer'
                }}
              >
                Shop Qualifying Deals &rarr;
              </button>
            </div>
          </div>

          {/* Row of Amazon-style Micro Cards (Deal for you, Presto, Lists) */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', marginBottom: '16px' }}>
            <div
              onClick={() => navigate('/products')}
              style={{
                background: '#FFFFFF',
                borderRadius: '10px',
                padding: '10px 8px',
                border: '1px solid #E2E8F0',
                boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                cursor: 'pointer'
              }}
            >
              <div style={{ fontSize: '0.72rem', fontWeight: '800', color: '#0F172A', lineHeight: '1.2' }}>
                Nova Brand
              </div>
              <div style={{ fontSize: '0.58rem', color: '#64748B', marginBottom: '6px' }}>Sponsored ℹ️</div>
              <img
                src="https://images.unsplash.com/photo-1583394838336-acd977736f90?auto=format&fit=crop&w=150&q=80"
                alt="Headphones"
                style={{ width: '100%', height: '54px', objectFit: 'contain' }}
              />
            </div>

            <div
              onClick={() => navigate('/products')}
              style={{
                background: '#FFFFFF',
                borderRadius: '10px',
                padding: '10px 8px',
                border: '1px solid #E2E8F0',
                boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                cursor: 'pointer'
              }}
            >
              <div style={{ fontSize: '0.72rem', fontWeight: '800', color: '#0F172A', lineHeight: '1.2' }}>
                Deal for you
              </div>
              <div style={{ fontSize: '0.58rem', color: '#16A34A', fontWeight: '700', marginBottom: '6px' }}>Up to 60% off</div>
              <img
                src="https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=150&q=80"
                alt="Sneakers"
                style={{ width: '100%', height: '54px', objectFit: 'contain' }}
              />
            </div>

            <div
              onClick={() => navigate('/products')}
              style={{
                background: '#FFFFFF',
                borderRadius: '10px',
                padding: '10px 8px',
                border: '1px solid #E2E8F0',
                boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                cursor: 'pointer'
              }}
            >
              <div style={{ fontSize: '0.72rem', fontWeight: '800', color: '#0F172A', lineHeight: '1.2' }}>
                Inspired Lists
              </div>
              <div style={{ fontSize: '0.58rem', color: '#64748B', marginBottom: '6px' }}>Based on trends</div>
              <img
                src="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=150&q=80"
                alt="Tech"
                style={{ width: '100%', height: '54px', objectFit: 'contain' }}
              />
            </div>
          </div>

          {/* 2-Column Mobile Feed Products */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: '800', color: '#0F172A', margin: 0 }}>
              Deals in Pincode 522019
            </h3>
            <Link to="/products" style={{ fontSize: '0.75rem', fontWeight: '700', color: '#007185', textDecoration: 'none' }}>
              See all deals &rarr;
            </Link>
          </div>

          {loading ? (
            <p style={{ textAlign: 'center', padding: '30px', color: '#666', fontSize: '0.85rem' }}>
              Loading products...
            </p>
          ) : (
            <div className="products-grid" style={{ gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
              {products.slice(0, 8).map(p => (
                <ProductCard key={p._id || p.id} product={p} />
              ))}
            </div>
          )}

        </div>
      ) : (
        /* ══════════════════════════════════════════════════════════════════════
            2. DESKTOP / TABLET WEB HERO SECTION (FOR COMPUTERS & TABLETS)
            ══════════════════════════════════════════════════════════════════════ */
        <>
          <section className="hero-section">
            <div className="container hero-grid">
              <div>
                <span className="hero-badge"><i className="fa-solid fa-bolt"></i> Mega Multi-Vendor Sale</span>
                <h1 className="hero-title">Next-Gen Tech &amp; <span>Campus Lifestyle</span></h1>
                <p className="hero-subtitle">
                  Discover flagship gadgets, sneakers, and smart home tech from verified local sellers with fast nearby delivery.
                </p>
                <div className="hero-cta-group">
                  <Link to="/products" className="btn btn-primary"><i className="fa-solid fa-bag-shopping"></i> Shop Now</Link>
                  <Link to="/products?category=electronics" className="btn btn-secondary"><i className="fa-solid fa-fire"></i> Electronics</Link>
                </div>
              </div>
              <div>
                <img src="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80" alt="Headphones" className="hero-img" />
              </div>
            </div>
          </section>

          <section className="section-padding container">
            <div className="section-header">
              <h2 className="section-title">Trending Marketplace Products</h2>
              <Link to="/products" style={{ color: 'var(--secondary-color)', fontWeight: '600' }}>View All &rarr;</Link>
            </div>

            {loading ? (
              <p style={{ textAlign: 'center', padding: '40px', color: '#666' }}>Loading latest products from MongoDB...</p>
            ) : (
              <div className="products-grid">
                {products.slice(0, 8).map(p => (
                  <ProductCard key={p._id || p.id} product={p} />
                ))}
              </div>
            )}
          </section>
        </>
      )}
    </main>
  );
}
