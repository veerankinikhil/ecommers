import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import ProductCard from '../components/ProductCard';
import { PRODUCTS_DATA, formatINR } from '../data/products';

export default function ProductDetailsPage() {
  const { addToCart } = useCart();
  const navigate = useNavigate();
  const [selectedImage, setSelectedImage] = useState('https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80');
  const [quantity, setQuantity] = useState(1);

  const product = {
    id: 'p1',
    name: 'Wireless ANC Studio Noise-Cancelling Headphones',
    brand: 'NOVATECH AUDIO',
    price: 9999,
    oldPrice: 14999,
    discount: 'SAVE 33%',
    rating: 4.8,
    ratingCount: 412,
    image: selectedImage
  };

  const thumbnails = [
    'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=400&q=80',
    'https://images.unsplash.com/photo-1484704849700-f032a568e944?auto=format&fit=crop&w=400&q=80',
    'https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=400&q=80',
    'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=400&q=80'
  ];

  const relatedProducts = PRODUCTS_DATA.slice(1, 5);

  const handleBuyNow = () => {
    addToCart(product, quantity);
    navigate('/cart');
  };

  return (
    <main className="container">
      <div className="breadcrumbs">
        <Link to="/">Home</Link> <span>/</span> <Link to="/products">Electronics</Link> <span>/</span> <span>Wireless ANC Studio Headphones</span>
      </div>

      <section className="product-detail-layout">
        {/* Gallery */}
        <div className="gallery-container">
          <div className="main-image-box">
            <img src={selectedImage} alt={product.name} />
          </div>
          <div className="thumbnail-row">
            {thumbnails.map((img, idx) => (
              <div 
                key={idx} 
                className={`thumb-item ${selectedImage === img ? 'active' : ''}`}
                onClick={() => setSelectedImage(img)}
              >
                <img src={img} alt="Thumbnail view" />
              </div>
            ))}
          </div>
        </div>

        {/* Info */}
        <div className="detail-info">
          <span className="detail-brand">{product.brand}</span>
          <h1 className="detail-title">{product.name}</h1>

          <div className="detail-rating">
            <div className="stars" style={{ color: '#FFA41C', fontSize: '1rem' }}>
              <i className="fa-solid fa-star"></i>
              <i className="fa-solid fa-star"></i>
              <i className="fa-solid fa-star"></i>
              <i className="fa-solid fa-star"></i>
              <i className="fa-solid fa-star-half-stroke"></i>
            </div>
            <span style={{ fontWeight: '600', fontSize: '0.9rem' }}>4.8 / 5.0</span>
            <span style={{ fontSize: '0.85rem', color: '#007185' }}>(412 ratings &amp; 98 verified reviews)</span>
            <span className="rating-badge"><i className="fa-solid fa-shield-halved"></i> Amazon Choice</span>
          </div>

          <div className="detail-price-box">
            <span className="current-price">{formatINR(product.price)}</span>
            <span className="old-price">{formatINR(product.oldPrice)}</span>
            <span className="detail-discount-tag">{product.discount}</span>
          </div>

          <p style={{ fontSize: '0.85rem', color: '#2e7d32', fontWeight: '600', marginBottom: '16px' }}>
            <i className="fa-solid fa-circle-check"></i> In Stock. Free Delivery by Tomorrow, 3:00 PM.
          </p>

          <p className="detail-description">
            Experience crystalline studio acoustics with active noise cancellation (ANC) powered by dual HD audio processors. Engineered with memory-foam ear cushions, up to 40 hours of continuous wireless playback, and fast USB-C charging.
          </p>

          {/* Specs */}
          <div className="specs-section">
            <h3 className="specs-title">Technical Specifications</h3>
            <table className="specs-table">
              <tbody>
                <tr><th>Brand</th><td>NovaTech Audio</td></tr>
                <tr><th>Model Name</th><td>Studio ANC Pro-X</td></tr>
                <tr><th>Connectivity</th><td>Bluetooth 5.3 / 3.5mm AUX Cable</td></tr>
                <tr><th>Battery Life</th><td>Up to 40 Hours (ANC On)</td></tr>
                <tr><th>Warranty</th><td>1-Year Replacement Warranty</td></tr>
              </tbody>
            </table>
          </div>

          {/* Actions */}
          <div className="detail-actions">
            <div className="quantity-box">
              <button className="qty-btn" onClick={() => setQuantity(Math.max(1, quantity - 1))}>-</button>
              <input type="text" className="qty-input" value={quantity} readOnly />
              <button className="qty-btn" onClick={() => setQuantity(quantity + 1)}>+</button>
            </div>

            <div className="action-btn-group">
              <button className="btn-detail-cart" onClick={() => addToCart(product, quantity)}>
                <i className="fa-solid fa-cart-plus"></i> Add to Cart
              </button>
              <button className="btn-detail-buy" onClick={handleBuyNow}>
                <i className="fa-solid fa-bolt"></i> Buy Now
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Related Products */}
      <section className="section-padding">
        <div className="section-header">
          <div className="section-title-wrap">
            <h2 className="section-title">Related Products</h2>
          </div>
        </div>
        <div className="products-grid">
          {relatedProducts.map(p => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>
    </main>
  );
}
