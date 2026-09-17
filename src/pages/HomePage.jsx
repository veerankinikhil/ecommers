import React from 'react';
import { Link } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import { PRODUCTS_DATA } from '../data/products';

export default function HomePage() {
  const trendingProducts = PRODUCTS_DATA.slice(0, 4);
  const bestSellers = PRODUCTS_DATA.slice(4, 8);
  const flashDeals = PRODUCTS_DATA.slice(0, 4);

  return (
    <main>
      {/* 1. HERO BANNER SECTION */}
      <section className="hero-section">
        <div className="container hero-grid">
          <div className="hero-content">
            <span className="hero-badge"><i className="fa-solid fa-bolt"></i> Mega Electronics Sale</span>
            <h1 className="hero-title">Next-Gen Tech &amp; <span>Smart Accessories</span></h1>
            <p className="hero-subtitle">Discover premium wireless headphones, smartwatches, and flagship gadgets with up to 40% instant college discount.</p>
            <div className="hero-cta-group">
              <Link to="/products" className="btn btn-primary"><i className="fa-solid fa-bag-shopping"></i> Shop Now</Link>
              <Link to="/products" className="btn btn-secondary"><i className="fa-solid fa-fire"></i> View Deals</Link>
            </div>
          </div>
          <div className="hero-image-wrapper">
            <img src="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80" alt="Premium Headphones Hero Banner" className="hero-img" />
            <div className="floating-card">
              <div className="floating-icon"><i className="fa-solid fa-star" style={{ color: '#FF9900' }}></i></div>
              <div className="floating-text">
                <h4>Top Rated Audio 2026</h4>
                <p>4.9 / 5.0 (2.4k+ Reviews)</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. OFFER BANNER SECTION */}
      <section className="offer-banner-section">
        <div className="container">
          <div className="offer-card">
            <div className="offer-info">
              <span className="offer-badge-tag"><i className="fa-solid fa-tags"></i> Special Offer</span>
              <div className="offer-text">
                <h3>College Special: Flat 20% OFF</h3>
                <p>Get extra cashback on all electronic gadgets &amp; textbooks.</p>
              </div>
            </div>
            <div className="offer-code">CODE: SMARTKART20</div>
          </div>
        </div>
      </section>

      {/* 3. FEATURED CATEGORIES */}
      <section className="section-padding">
        <div className="container">
          <div className="section-header">
            <div className="section-title-wrap">
              <h2 className="section-title">Featured Categories</h2>
            </div>
            <Link to="/products" className="view-all-link">Browse All <i className="fa-solid fa-arrow-right"></i></Link>
          </div>

          <div className="categories-grid">
            <Link to="/products" className="category-card">
              <div className="category-icon-bg"><i className="fa-solid fa-laptop" style={{ color: '#FF9900' }}></i></div>
              <h3 className="category-name">Electronics</h3>
              <span className="category-count">120+ Items</span>
            </Link>
            <Link to="/products" className="category-card">
              <div className="category-icon-bg"><i className="fa-solid fa-shirt" style={{ color: '#FF9900' }}></i></div>
              <h3 className="category-name">Fashion</h3>
              <span className="category-count">340+ Items</span>
            </Link>
            <Link to="/products" className="category-card">
              <div className="category-icon-bg"><i className="fa-solid fa-couch" style={{ color: '#FF9900' }}></i></div>
              <h3 className="category-name">Home &amp; Living</h3>
              <span className="category-count">85+ Items</span>
            </Link>
            <Link to="/products" className="category-card">
              <div className="category-icon-bg"><i className="fa-solid fa-spa" style={{ color: '#FF9900' }}></i></div>
              <h3 className="category-name">Beauty &amp; Care</h3>
              <span className="category-count">95+ Items</span>
            </Link>
            <Link to="/products" className="category-card">
              <div className="category-icon-bg"><i className="fa-solid fa-baseball-bat-ball" style={{ color: '#FF9900' }}></i></div>
              <h3 className="category-name">Sports</h3>
              <span className="category-count">60+ Items</span>
            </Link>
            <Link to="/products" className="category-card">
              <div className="category-icon-bg"><i className="fa-solid fa-book" style={{ color: '#FF9900' }}></i></div>
              <h3 className="category-name">Books &amp; Study</h3>
              <span className="category-count">210+ Items</span>
            </Link>
          </div>
        </div>
      </section>

      {/* 4. TODAY'S FLASH DEALS */}
      <section className="section-padding">
        <div className="container">
          <div className="deals-container">
            <div className="deals-header">
              <div>
                <h2 className="section-title" style={{ color: '#ffffff' }}><i className="fa-solid fa-stopwatch" style={{ color: '#FF9900' }}></i> Today's Flash Deals</h2>
                <p style={{ color: '#aaaaaa', fontSize: '0.9rem', marginTop: '4px' }}>Grab these exclusive prices before time runs out!</p>
              </div>
              <div className="timer-box">
                <i className="fa-solid fa-clock" style={{ color: '#FF9900' }}></i> Ends In:
                <span className="timer-unit">05</span>h :
                <span className="timer-unit">42</span>m :
                <span className="timer-unit">19</span>s
              </div>
            </div>

            <div className="products-grid">
              {flashDeals.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 5. TRENDING PRODUCTS */}
      <section className="section-padding">
        <div className="container">
          <div className="section-header">
            <div className="section-title-wrap">
              <h2 className="section-title">Trending Products</h2>
            </div>
            <Link to="/products" className="view-all-link">View All <i className="fa-solid fa-arrow-right"></i></Link>
          </div>

          <div className="products-grid">
            {trendingProducts.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* 6. BEST SELLERS */}
      <section className="section-padding" style={{ backgroundColor: '#ffffff' }}>
        <div className="container">
          <div className="section-header">
            <div className="section-title-wrap">
              <h2 className="section-title">Best Sellers</h2>
            </div>
            <Link to="/products" className="view-all-link">Shop Best Sellers <i className="fa-solid fa-arrow-right"></i></Link>
          </div>

          <div className="products-grid">
            {bestSellers.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* 7. REVIEWS */}
      <section className="section-padding">
        <div className="container">
          <div className="section-header">
            <div className="section-title-wrap">
              <h2 className="section-title">What Our Customers Say</h2>
            </div>
          </div>

          <div className="reviews-grid">
            <article className="review-card">
              <div className="reviewer-profile">
                <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80" alt="Alex Johnson" className="reviewer-avatar" />
                <div className="reviewer-info">
                  <h4>Alex Johnson</h4>
                  <span><i className="fa-solid fa-circle-check"></i> Verified Buyer</span>
                </div>
              </div>
              <div className="stars" style={{ marginBottom: '8px' }}><i className="fa-solid fa-star"></i><i className="fa-solid fa-star"></i><i className="fa-solid fa-star"></i><i className="fa-solid fa-star"></i><i className="fa-solid fa-star"></i></div>
              <p className="review-text">"NovaKart delivery was incredibly fast! The wireless headphones arrived in perfect condition. The student discount made it super affordable."</p>
            </article>

            <article className="review-card">
              <div className="reviewer-profile">
                <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80" alt="David Smith" className="reviewer-avatar" />
                <div className="reviewer-info">
                  <h4>David Smith</h4>
                  <span><i className="fa-solid fa-circle-check"></i> Verified Buyer</span>
                </div>
              </div>
              <div className="stars" style={{ marginBottom: '8px' }}><i className="fa-solid fa-star"></i><i className="fa-solid fa-star"></i><i className="fa-solid fa-star"></i><i className="fa-solid fa-star"></i><i className="fa-solid fa-star-half-stroke"></i></div>
              <p className="review-text">"Best college project shopping store interface I've used. Clean Amazon-like layout, easy search bar, and genuine product specs."</p>
            </article>

            <article className="review-card">
              <div className="reviewer-profile">
                <img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80" alt="Emily Davis" className="reviewer-avatar" />
                <div className="reviewer-info">
                  <h4>Emily Davis</h4>
                  <span><i className="fa-solid fa-circle-check"></i> Verified Buyer</span>
                </div>
              </div>
              <div className="stars" style={{ marginBottom: '8px' }}><i className="fa-solid fa-star"></i><i className="fa-solid fa-star"></i><i className="fa-solid fa-star"></i><i className="fa-solid fa-star"></i><i className="fa-solid fa-star"></i></div>
              <p className="review-text">"Ordered my semester backpack and smart watch. Got them within 48 hours. Excellent customer support team!"</p>
            </article>
          </div>
        </div>
      </section>

      {/* 8. NEWSLETTER */}
      <section className="container">
        <div className="newsletter-section">
          <div className="newsletter-content">
            <h2 className="newsletter-title">Subscribe to <span>NovaKart Deals</span></h2>
            <p className="newsletter-desc">Get weekly discount codes, exclusive flash sales announcements, and student coupons directly in your inbox.</p>
            <form className="newsletter-form" onSubmit={(e) => { e.preventDefault(); alert('Subscribed to NovaKart newsletter!'); }}>
              <input type="email" className="newsletter-input" placeholder="Enter your email address..." required />
              <button type="submit" className="btn btn-primary" style={{ padding: '12px 24px' }}><i className="fa-solid fa-paper-plane"></i> Subscribe</button>
            </form>
            <span className="privacy-note"><i className="fa-solid fa-lock"></i> We respect your privacy. Unsubscribe anytime with 1-click.</span>
          </div>
        </div>
      </section>
    </main>
  );
}
