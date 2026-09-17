import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api, { formatINR } from '../services/api';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

export default function ProductDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { user } = useAuth();

  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);

  // Review Form
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');

  useEffect(() => {
    api.get(`/products/${id}`)
      .then(({ data }) => {
        setProduct(data.product);
        setReviews(data.reviews || []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  const handleAddReview = async (e) => {
    e.preventDefault();
    if (!user) {
      alert('Please log in to submit a product review.');
      navigate('/login');
      return;
    }
    try {
      const { data } = await api.post('/reviews', { productId: product._id, rating, comment });
      setReviews([data.review, ...reviews]);
      setComment('');
      alert('Thank you! Your verified review has been published.');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to submit review');
    }
  };

  const handleAddToCart = () => {
    if (!user) {
      alert('Please register or sign in to add items to your cart.');
      navigate('/register');
      return;
    }
    addToCart(product, quantity);
  };

  const handleBuyNow = () => {
    if (!user) {
      alert('Please register or sign in to purchase items.');
      navigate('/register');
      return;
    }
    addToCart(product, quantity);
    navigate('/cart');
  };

  const [activeMediaIndex, setActiveMediaIndex] = useState(0);

  useEffect(() => {
    setActiveMediaIndex(0);
  }, [id]);

  if (loading) return <div className="container section-padding"><p>Loading product details...</p></div>;
  if (!product) return <div className="container section-padding"><h3>Product not found.</h3></div>;

  const defaultImage = product.images?.[0] || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80';
  const mrp = product.oldPrice > product.price ? product.oldPrice : (product.price * 1.3); // mock MRP
  const discountPercent = Math.round(((mrp - product.price) / mrp) * 100);

  // Dynamic media items list: Only items that exist
  // Rule:
  // - Slot 1: Cover Photo (photos[0])
  // - Slot 2: 1st Video (if uploaded)
  // - Slot 3..N: Middle Photos (photos[1..N])
  // - Final Slot: 2nd Video (if uploaded)
  const photos = Array.isArray(product.images) && product.images.length > 0
    ? product.images.filter(img => typeof img === 'string' && img.trim() !== '')
    : [defaultImage];

  const vids = Array.isArray(product.videos)
    ? product.videos.filter(vid => typeof vid === 'string' && vid.trim() !== '')
    : [];

  const mediaList = [];
  if (photos.length > 0) {
    mediaList.push({ type: 'image', url: photos[0], label: 'Main Cover Photo' });
  }
  if (vids.length > 0) {
    mediaList.push({ type: 'video', url: vids[0], label: 'Product Video 1' });
  }
  for (let i = 1; i < photos.length; i++) {
    mediaList.push({ type: 'image', url: photos[i], label: `Photo #${i + 1}` });
  }
  if (vids.length > 1) {
    mediaList.push({ type: 'video', url: vids[1], label: 'Product Video 2' });
  }

  const currentMedia = mediaList[activeMediaIndex] || mediaList[0] || { type: 'image', url: defaultImage };

  const handlePrevMedia = () => {
    setActiveMediaIndex(prev => (prev === 0 ? mediaList.length - 1 : prev - 1));
  };
  const handleNextMedia = () => {
    setActiveMediaIndex(prev => (prev === mediaList.length - 1 ? 0 : prev + 1));
  };

  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  // Close lightbox on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setIsLightboxOpen(false);
      if (e.key === 'ArrowLeft') handlePrevMedia();
      if (e.key === 'ArrowRight') handleNextMedia();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  });

  return (
    <main className="pdp-full-container">
      {/* BREADCRUMB */}
      <nav className="pdp-breadcrumb" aria-label="Breadcrumb">
        <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', color: '#007185', cursor: 'pointer', fontSize: '0.82rem', padding: 0, marginRight: '4px' }}>
          <i className="fa-solid fa-arrow-left"></i> Back
        </button>
        <span>|</span>
        <button onClick={() => navigate('/')} style={{ background: 'none', border: 'none', color: '#007185', cursor: 'pointer', fontSize: '0.82rem', padding: 0 }}>
          Home
        </button>
        <span>&rsaquo;</span>
        <button onClick={() => navigate(`/products?category=${encodeURIComponent(product.category)}`)} style={{ background: 'none', border: 'none', color: '#007185', cursor: 'pointer', fontSize: '0.82rem', padding: 0 }}>
          {product.category}
        </button>
        <span>&rsaquo;</span>
        <span style={{ color: '#0F1111', fontWeight: '600', maxWidth: '300px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {product.name}
        </span>
      </nav>

      <section className="amazon-pdp-layout">
        
        {/* LEFT COLUMN: DYNAMIC MEDIA SLIDER & THUMBNAILS */}
        <div className="pdp-left">
          {/* Vertical Thumbnail List (Only actual media) */}
          {mediaList.length > 1 && (
            <div className="thumbnail-gallery" role="tablist">
              {mediaList.map((item, idx) => (
                <div 
                  key={idx} 
                  className={`thumb-item ${idx === activeMediaIndex ? 'active-thumb' : ''}`}
                  onClick={() => setActiveMediaIndex(idx)}
                  onMouseEnter={() => setActiveMediaIndex(idx)}
                  title={item.label}
                  role="tab"
                  aria-selected={idx === activeMediaIndex}
                >
                  {item.type === 'image' ? (
                    <img src={item.url} alt={`Thumb ${idx + 1}`} />
                  ) : (
                    <div style={{ width: '100%', height: '100%', background: '#0F172A', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                      <i className="fa-solid fa-play" style={{ color: '#FFD814', fontSize: '0.9rem' }}></i>
                      <span className="thumb-video-icon">
                        <i className="fa-solid fa-video"></i> VIDEO
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Main Display Box with Carousel Navigation */}
          <div className="main-image-box">
            {/* Top Badges */}
            {currentMedia.type === 'video' && (
              <div className="pdp-video-badge">
                <i className="fa-solid fa-circle-play"></i> Product Video
              </div>
            )}

            {mediaList.length > 1 && (
              <div className="pdp-slide-counter">
                {activeMediaIndex + 1} / {mediaList.length}
              </div>
            )}

            {/* Fullscreen Expand Button */}
            <button 
              type="button" 
              className="pdp-fullscreen-btn"
              onClick={() => setIsLightboxOpen(true)}
              title="View photos and video in Fullscreen"
            >
              <i className="fa-solid fa-expand"></i> Fullscreen
            </button>

            {/* Slider Navigation Arrows */}
            {mediaList.length > 1 && (
              <>
                <button 
                  type="button" 
                  className="pdp-slider-nav-btn prev" 
                  onClick={handlePrevMedia} 
                  aria-label="Previous image/video"
                >
                  <i className="fa-solid fa-chevron-left"></i>
                </button>
                <button 
                  type="button" 
                  className="pdp-slider-nav-btn next" 
                  onClick={handleNextMedia} 
                  aria-label="Next image/video"
                >
                  <i className="fa-solid fa-chevron-right"></i>
                </button>
              </>
            )}

            {/* Media Content */}
            {currentMedia.type === 'image' ? (
              <img 
                src={currentMedia.url} 
                alt={product.name} 
                className="pdp-main-media" 
                onClick={() => setIsLightboxOpen(true)}
                style={{ cursor: 'zoom-in' }}
                title="Click to view full screen"
              />
            ) : (
              <video 
                key={currentMedia.url}
                src={currentMedia.url} 
                controls 
                autoPlay 
                muted 
                playsInline
                className="pdp-main-media" 
                style={{ background: '#000', padding: 0 }}
              />
            )}

            {/* Bottom Slider Dots */}
            {mediaList.length > 1 && (
              <div className="pdp-slider-dots">
                {mediaList.map((_, idx) => (
                  <span 
                    key={idx} 
                    className={`pdp-slider-dot ${idx === activeMediaIndex ? 'active' : ''}`}
                    onClick={() => setActiveMediaIndex(idx)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* CENTER COLUMN: DETAILS */}
        <div className="pdp-center">
          <span className="brand-link">Visit the {product.brand || 'Verified'} Store</span>
          <h1 className="detail-title">{product.name}</h1>
          
          <div className="rating-row">
            <span className="stars">
              <i className="fa-solid fa-star"></i><i className="fa-solid fa-star"></i><i className="fa-solid fa-star"></i><i className="fa-solid fa-star"></i><i className="fa-solid fa-star-half-stroke"></i>
            </span>
            <span className="rating-count">{product.ratingsAverage} / 5.0 ({reviews.length} ratings)</span>
          </div>
          
          <hr className="pdp-divider" />
          
          <div className="price-section">
            <div className="discount-tag">-{discountPercent}%</div>
            <div className="current-price">
              <span className="price-symbol">₹</span>
              {product.price.toLocaleString('en-IN')}
            </div>
          </div>
          
          <div className="mrp">
            M.R.P.: <del>{formatINR(mrp)}</del>
          </div>
          <p className="taxes-info">Inclusive of all taxes</p>

          <hr className="pdp-divider" />

          <div className="offers-section">
            <h4><i className="fa-solid fa-percent"></i> Offers</h4>
            <div className="offers-grid">
              <div className="offer-card">
                <strong>Cashback</strong><br/>
                Upto ₹50.00 cashback on selected wallets
              </div>
              <div className="offer-card">
                <strong>Bank Offer</strong><br/>
                Upto ₹2,000.00 discount on select Credit Cards
              </div>
              <div className="offer-card">
                <strong>Partner Offers</strong><br/>
                Get GST invoice and save up to 18% on business purchases
              </div>
            </div>
          </div>

          {/* Trust Highlights Grid */}
          <div className="pdp-trust-grid">
            <div className="pdp-trust-item">
              <i className="fa-solid fa-truck-fast"></i>
              <span>Free 1-Day Delivery</span>
            </div>
            <div className="pdp-trust-item">
              <i className="fa-solid fa-shield-halved"></i>
              <span>1-Year Warranty</span>
            </div>
            <div className="pdp-trust-item">
              <i className="fa-solid fa-rotate-left"></i>
              <span>7-Day Replacement</span>
            </div>
            <div className="pdp-trust-item">
              <i className="fa-solid fa-handshake"></i>
              <span>Pay on Delivery</span>
            </div>
          </div>

          <div className="features-list">
            <h4>About this item</h4>
            <ul>
              <li>{product.description}</li>
              <li>Fast Dispatch: Nearby local hubs ensure instant delivery.</li>
              <li>{product.category} &bull; 100% Genuine, Authenticated Inventory.</li>
              <li>Guaranteed safe payment gateways and hassle-free returns.</li>
            </ul>

            <h4 style={{ marginTop: '20px', marginBottom: '8px' }}>Technical Specifications</h4>
            <table className="pdp-specs-table">
              <tbody>
                <tr>
                  <td>Brand</td>
                  <td>{product.brand || 'Verified Brand'}</td>
                </tr>
                <tr>
                  <td>Category</td>
                  <td>{product.category}</td>
                </tr>
                <tr>
                  <td>Item Weight / Size</td>
                  <td>{product.weight || '500g'}</td>
                </tr>
                <tr>
                  <td>Availability Status</td>
                  <td style={{ color: '#007600', fontWeight: '600' }}>{product.stock} units currently in stock</td>
                </tr>
                <tr>
                  <td>Verified Seller</td>
                  <td>{product.sellerId?.storeName || product.brand || 'Authorized Merchant'}</td>
                </tr>
                <tr>
                  <td>Ships From</td>
                  <td>NovaKart Hyperlocal Express Hub</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* RIGHT COLUMN: BUY BOX */}
        <div className="pdp-right">
          <div className="buy-box">
            <div className="buy-box-price">
              <span className="price-symbol">₹</span>
              {product.price.toLocaleString('en-IN')}
            </div>
            
            <div className="delivery-info">
              FREE delivery <strong>Tomorrow</strong>.<br/>
              Order within 2 hrs 30 mins.
            </div>
            
            <div className="location-info">
              <i className="fa-solid fa-location-dot"></i> Delivering to {(() => {
                if (!user?.address) return 'your registered location';
                try {
                  const parsed = JSON.parse(user.address);
                  return [parsed.houseNo, parsed.street, parsed.landmark, parsed.city, parsed.state, parsed.pincode].filter(Boolean).join(', ');
                } catch {
                  return user.address;
                }
              })()} - Update
            </div>
            
            <h4 className="in-stock-text">In stock</h4>
            
            <div className="qty-selector">
              <label>Quantity: </label>
              <select className="qty-dropdown" value={quantity} onChange={(e) => setQuantity(Number(e.target.value))}>
                {[1,2,3,4,5,6,7,8,9,10].map(n => <option key={n} value={n}>{n}</option>)}
              </select>
            </div>

            <button className="btn add-to-cart-btn" onClick={handleAddToCart}>Add to Cart</button>
            <button className="btn buy-now-btn" onClick={handleBuyNow}>Buy Now</button>

            <div className="secure-transaction">
              <i className="fa-solid fa-lock"></i> Secure transaction
            </div>

            <table className="seller-info-table">
              <tbody>
                <tr><td>Ships from</td><td>NovaKart Agents</td></tr>
                <tr><td>Sold by</td><td>{product.brand || 'Verified Seller'}</td></tr>
              </tbody>
            </table>
            
            <div className="gift-options">
              <input type="checkbox" id="gift" />
              <label htmlFor="gift"> Add a gift receipt for easy returns</label>
            </div>
          </div>
        </div>
      </section>

      {/* FREQUENTLY BOUGHT TOGETHER */}
      <section className="frequently-bought-together">
        <h3>Frequently bought together</h3>
        <div className="fbt-container">
          <div className="fbt-images">
            <img src={defaultImage} alt="item1" />
            <span className="fbt-plus">+</span>
            <img src="https://images.unsplash.com/photo-1546435770-a3e426fa99f5?auto=format&fit=crop&w=200&q=80" alt="item2" />
            <span className="fbt-plus">+</span>
            <img src="https://images.unsplash.com/photo-1572569432711-409ea64024b4?auto=format&fit=crop&w=200&q=80" alt="item3" />
          </div>
          <div className="fbt-action">
            <div className="fbt-total">Total price: <strong>{formatINR(product.price + 1200 + 450)}</strong></div>
            <button className="btn add-all-btn">Add all 3 to Cart</button>
          </div>
        </div>
      </section>

      {/* REVIEWS & RATINGS */}
      <section style={{ background: '#fff', border: '1px solid #E7E7E7', borderRadius: '10px', padding: '30px', marginTop: '30px' }}>
        <h3 style={{ fontSize: '1.3rem', fontWeight: '700', marginBottom: '20px', color: '#0f1111' }}>
          Customer Reviews &amp; Ratings ({reviews.length})
        </h3>

        {/* Add Review Form */}
        <form onSubmit={handleAddReview} style={{ background: '#fafafa', border: '1px solid #eee', borderRadius: '8px', padding: '20px', marginBottom: '30px' }}>
          <h4 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '10px' }}>Leave a Verified Review</h4>
          <div style={{ display: 'flex', gap: '20px', marginBottom: '12px' }}>
            <div>
              <label style={{ fontSize: '0.85rem', fontWeight: '600' }}>Rating (Stars):</label>
              <select className="form-input" style={{ width: '120px' }} value={rating} onChange={(e) => setRating(Number(e.target.value))}>
                <option value="5">⭐⭐⭐⭐⭐ (5/5)</option>
                <option value="4">⭐⭐⭐⭐ (4/5)</option>
                <option value="3">⭐⭐⭐ (3/5)</option>
                <option value="2">⭐⭐ (2/5)</option>
                <option value="1">⭐ (1/5)</option>
              </select>
            </div>
          </div>

          <div style={{ marginBottom: '12px' }}>
            <label style={{ fontSize: '0.85rem', fontWeight: '600' }}>Your Feedback &amp; Experience:</label>
            <textarea className="form-input" style={{ minHeight: '80px' }} placeholder="Share details about sound quality, packaging or delivery speed..." value={comment} onChange={(e) => setComment(e.target.value)} required />
          </div>

          <button type="submit" className="btn btn-primary" style={{ padding: '8px 18px' }}>
            Submit Review
          </button>
        </form>

        {/* Existing Reviews */}
        {reviews.length === 0 ? (
          <p style={{ color: '#888', fontStyle: 'italic' }}>No reviews yet. Be the first customer to review this product!</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {reviews.map(r => (
              <div key={r._id} style={{ borderBottom: '1px solid #eee', paddingBottom: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                  <strong style={{ fontSize: '0.92rem' }}>{r.customerName}</strong>
                  <span style={{ fontSize: '0.75rem', color: '#2e7d32', fontWeight: '600' }}><i className="fa-solid fa-circle-check"></i> Verified Purchase</span>
                </div>
                <div className="stars" style={{ marginBottom: '6px' }}>
                  {[...Array(r.rating)].map((_, i) => <i key={i} className="fa-solid fa-star"></i>)}
                </div>
                <p style={{ fontSize: '0.88rem', color: '#565959' }}>{r.comment}</p>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ============================================================= */}
      {/* FULL-SCREEN LIGHTBOX MODAL */}
      {/* ============================================================= */}
      {isLightboxOpen && (
        <div className="pdp-lightbox-overlay" onClick={() => setIsLightboxOpen(false)}>
          <div className="pdp-lightbox-top" onClick={(e) => e.stopPropagation()}>
            <span className="pdp-lightbox-title">
              {product.name} &bull; {currentMedia.label} ({activeMediaIndex + 1} of {mediaList.length})
            </span>
            <button 
              className="pdp-lightbox-close" 
              onClick={() => setIsLightboxOpen(false)}
              aria-label="Close fullscreen"
              title="Close Fullscreen (Esc)"
            >
              <i className="fa-solid fa-xmark"></i>
            </button>
          </div>

          <div className="pdp-lightbox-media-wrap" onClick={(e) => e.stopPropagation()}>
            {mediaList.length > 1 && (
              <button 
                type="button"
                className="pdp-lightbox-nav prev"
                onClick={handlePrevMedia}
                aria-label="Previous Media"
                title="Previous"
              >
                <i className="fa-solid fa-chevron-left"></i>
              </button>
            )}

            {currentMedia.type === 'image' ? (
              <img 
                src={currentMedia.url} 
                alt={product.name} 
                className="pdp-lightbox-media"
              />
            ) : (
              <video 
                key={currentMedia.url}
                src={currentMedia.url} 
                controls 
                autoPlay 
                playsInline
                className="pdp-lightbox-media"
                style={{ maxHeight: '72vh', background: '#000' }}
              />
            )}

            {mediaList.length > 1 && (
              <button 
                type="button"
                className="pdp-lightbox-nav next"
                onClick={handleNextMedia}
                aria-label="Next Media"
                title="Next"
              >
                <i className="fa-solid fa-chevron-right"></i>
              </button>
            )}
          </div>

          {/* Lightbox Thumbnails Navigation */}
          {mediaList.length > 1 && (
            <div className="pdp-lightbox-thumbs" onClick={(e) => e.stopPropagation()}>
              {mediaList.map((m, idx) => (
                <div 
                  key={idx} 
                  className={`pdp-lightbox-thumb ${idx === activeMediaIndex ? 'active' : ''}`}
                  onClick={() => setActiveMediaIndex(idx)}
                >
                  {m.type === 'image' ? (
                    <img src={m.url} alt={`Thumbnail ${idx + 1}`} />
                  ) : (
                    <div style={{ background: '#0F172A', width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <i className="fa-solid fa-play" style={{ color: '#FFD814', fontSize: '0.8rem' }}></i>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </main>
  );
}
