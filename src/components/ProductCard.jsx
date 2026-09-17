import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { formatINR } from '../data/products';

export default function ProductCard({ product }) {
  const { addToCart } = useCart();

  return (
    <article className="product-card">
      <span className="badge-discount">{product.discount}</span>
      {product.badge && <span className="badge-tag">{product.badge}</span>}
      
      <div className="product-img-wrapper">
        <img src={product.image} alt={product.name} className="product-img" />
      </div>

      <div className="product-info">
        <span className="product-category-sub">{product.categoryLabel}</span>
        <h3 className="product-name">
          <Link to={`/product-details`}>{product.name}</Link>
        </h3>

        <div className="rating-wrap">
          <div className="stars" style={{ color: '#FFA41C' }}>
            <i className="fa-solid fa-star"></i>
            <i className="fa-solid fa-star"></i>
            <i className="fa-solid fa-star"></i>
            <i className="fa-solid fa-star"></i>
            <i className="fa-solid fa-star-half-stroke"></i>
          </div>
          <span className="rating-count">({product.ratingCount})</span>
        </div>

        <div className="price-wrap">
          <span className="current-price">{formatINR(product.price)}</span>
          <span className="old-price">{formatINR(product.oldPrice)}</span>
        </div>

        <button 
          className="btn-add-cart" 
          onClick={() => addToCart(product, 1)}
        >
          <i className="fa-solid fa-cart-plus"></i> Add to Cart
        </button>
      </div>
    </article>
  );
}
