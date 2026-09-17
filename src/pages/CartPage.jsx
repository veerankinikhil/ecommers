import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { formatINR } from '../data/products';

export default function CartPage() {
  const { cart, updateQuantity, removeFromCart, cartCount, subtotal } = useCart();
  const [promoApplied, setPromoApplied] = useState(true);

  const discountRate = promoApplied ? 0.20 : 0;
  const discountAmount = subtotal * discountRate;
  const taxAmount = subtotal > 0 ? 199 : 0;
  const finalTotal = subtotal > 0 ? (subtotal - discountAmount + taxAmount) : 0;

  const handleCheckout = () => {
    alert(`🎉 Thank you for your college order!\nTotal Amount: ${formatINR(finalTotal)}\n\nYour order has been placed successfully on SmartKart!`);
  };

  return (
    <main className="container">
      <div className="breadcrumbs">
        <Link to="/">Home</Link> <span>/</span> <span>Shopping Cart</span>
      </div>

      <div className="cart-layout">
        {/* Left: Product List */}
        <section className="cart-items-container">
          <div className="cart-header-title">
            <h2>Shopping Cart</h2>
            <span>{cartCount} Items in Cart</span>
          </div>

          {cart.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '50px 20px' }}>
              <i className="fa-solid fa-cart-arrow-down" style={{ fontSize: '3.5rem', color: '#ccc', marginBottom: '16px' }}></i>
              <h3 style={{ fontSize: '1.3rem', marginBottom: '8px', color: 'var(--primary-color)' }}>Your Shopping Cart is Empty</h3>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '20px' }}>Explore our catalog and grab the best college deals today!</p>
              <Link to="/products" className="btn btn-primary"><i className="fa-solid fa-bag-shopping"></i> Start Shopping</Link>
            </div>
          ) : (
            cart.map((item, index) => (
              <article key={item.id + index} className="cart-item-row">
                <img src={item.image} alt={item.name} className="cart-item-img" />
                <div className="cart-item-info">
                  <span className="cart-item-category">{item.categoryLabel || 'Item'}</span>
                  <Link to="/product-details" className="cart-item-name">{item.name}</Link>
                  <span className="cart-item-stock"><i className="fa-solid fa-circle-check"></i> In Stock</span>

                  <div className="cart-item-actions">
                    <div className="quantity-box">
                      <button className="qty-btn" onClick={() => updateQuantity(index, -1)}>-</button>
                      <input type="text" className="qty-input" value={item.quantity} readOnly />
                      <button className="qty-btn" onClick={() => updateQuantity(index, 1)}>+</button>
                    </div>
                    <span className="cart-remove-link" onClick={() => removeFromCart(index)}>
                      <i className="fa-solid fa-trash-can"></i> Delete
                    </span>
                  </div>
                </div>
                <div className="cart-item-pricing">
                  <span className="cart-unit-price">{formatINR(item.price)}</span>
                  <span className="cart-item-subtotal">Subtotal: {formatINR(item.price * item.quantity)}</span>
                </div>
              </article>
            ))
          )}
        </section>

        {/* Right: Order Summary */}
        <aside className="summary-card">
          <h3 className="summary-title">Order Summary</h3>

          <div className="summary-row">
            <span>Items ({cartCount} units):</span>
            <span>{formatINR(subtotal)}</span>
          </div>

          <div className="summary-row">
            <span>Estimated Shipping:</span>
            <span style={{ color: '#2e7d32', fontWeight: '600' }}>FREE</span>
          </div>

          <div className="summary-row discount">
            <span>Student Promo Discount (20%):</span>
            <span>-{formatINR(discountAmount)}</span>
          </div>

          <div className="summary-row">
            <span>Estimated Tax:</span>
            <span>{formatINR(taxAmount)}</span>
          </div>

          <div className="summary-divider"></div>

          <div className="summary-total-row">
            <span>Order Total:</span>
            <span>{formatINR(finalTotal)}</span>
          </div>

          <button className="btn-proceed-checkout" onClick={handleCheckout} disabled={cart.length === 0}>
            <i className="fa-solid fa-lock"></i> Proceed to Checkout
          </button>

          <div style={{ marginTop: '24px' }}>
            <label style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-primary)' }}>Apply Promo Code</label>
            <div className="promo-input-group">
              <input type="text" className="promo-input-field" defaultValue="SMARTKART20" placeholder="Enter coupon code" />
              <button className="promo-apply-btn" onClick={() => setPromoApplied(true)}>Apply</button>
            </div>
          </div>

          <div className="payment-badges">
            <i className="fa-brands fa-cc-visa" title="Visa"></i>
            <i className="fa-brands fa-cc-mastercard" title="Mastercard"></i>
            <i className="fa-brands fa-cc-paypal" title="PayPal"></i>
            <i className="fa-brands fa-cc-apple-pay" title="Apple Pay"></i>
          </div>
        </aside>
      </div>
    </main>
  );
}
