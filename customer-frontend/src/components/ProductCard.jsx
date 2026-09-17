import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { formatINR } from '../services/api';

export default function ProductCard({ product }) {
  const { addToCart } = useCart();
  const navigate = useNavigate();

  const prodId = product._id || product.id;
  const imgUrl = product.images?.[0] || product.image || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=400&q=80';

  const handleCardClick = (e) => {
    // If the click is not on a button, navigate to the full screen product details page
    if (!e.target.closest('.btn-add-cart')) {
      navigate(`/products/${prodId}`);
    }
  };

  const handleAddCart = (e) => {
    e.stopPropagation();
    addToCart(product, 1);
  };

  return (
    <article 
      className="product-card" 
      onClick={handleCardClick}
      style={{ cursor: 'pointer' }}
      title={`Click to view full details for ${product.name}`}
    >
      {product.discount && <span className="badge-discount">{product.discount}</span>}
      
      <Link to={`/products/${prodId}`} className="product-img-wrapper" onClick={(e) => e.stopPropagation()}>
        <img src={imgUrl} alt={product.name} className="product-img" />
      </Link>

      <div className="product-info">
        <span className="product-category-sub">{product.category || 'Electronics'}</span>
        <h3 className="product-name">
          <Link to={`/products/${prodId}`}>{product.name}</Link>
        </h3>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
          <div className="stars">
            <i className="fa-solid fa-star"></i>
            <i className="fa-solid fa-star"></i>
            <i className="fa-solid fa-star"></i>
            <i className="fa-solid fa-star"></i>
            <i className="fa-solid fa-star-half-stroke"></i>
          </div>
          <span style={{ fontSize: '0.75rem', color: '#565959' }}>({product.ratingsCount || 24})</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '4px' }}>
          <span style={{ color: '#007185', fontWeight: '900', fontStyle: 'italic', fontSize: '0.78rem' }}>
            ✓prime
          </span>
          <span style={{ fontSize: '0.68rem', color: '#565959' }}>FREE Delivery</span>
        </div>

        <div className="price-wrap">
          <span className="current-price">{formatINR(product.price)}</span>
          {product.oldPrice > product.price && (
            <span className="old-price">{formatINR(product.oldPrice)}</span>
          )}
        </div>

        <button className="btn-add-cart" onClick={handleAddCart}>
          <i className="fa-solid fa-cart-plus"></i> Add to Cart
        </button>
      </div>
    </article>
  );
}
