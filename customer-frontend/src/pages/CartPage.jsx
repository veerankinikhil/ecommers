import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { formatINR } from '../services/api';

export default function CartPage() {
  const { cart, updateQuantity, removeFromCart, cartCount, subtotal, discount, tax, shippingFee, totalAmount } = useCart();
  const navigate = useNavigate();

  return (
    <main className="container section-padding">
      {/* Dynamic Delivery Charge Banner (Amazon style progress bar) */}
      {subtotal > 0 && (
        subtotal < 1000 ? (
          <div style={{ background: '#fff9e6', border: '1px solid #ffe3b3', padding: '16px 20px', borderRadius: '12px', marginBottom: '24px', boxShadow: '0 4px 15px rgba(0,0,0,0.02)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.88rem', color: '#665d00', marginBottom: '8px' }}>
              <span>🛒 Add <strong>₹{1000 - subtotal}</strong> more worth of items to unlock <strong>FREE Delivery</strong>!</span>
              <strong>Subtotal: {formatINR(subtotal)}</strong>
            </div>
            <div style={{ width: '100%', background: '#e2e8f0', height: '8px', borderRadius: '4px', overflow: 'hidden' }}>
              <div style={{ width: `${(subtotal / 1000) * 100}%`, background: '#ff9900', height: '100%', transition: 'width 0.3s' }}></div>
            </div>
          </div>
        ) : (
          <div style={{ background: '#e8f5e9', border: '1px solid #c8e6c9', padding: '16px 20px', borderRadius: '12px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px', color: '#2e7d32', fontSize: '0.88rem', fontWeight: '700', boxShadow: '0 4px 15px rgba(0,0,0,0.02)' }}>
            <i className="fa-solid fa-circle-check" style={{ fontSize: '1.1rem' }}></i> 🎉 Your order qualifies for FREE Delivery!
          </div>
        )
      )}

      <div className="cart-layout">
        
        {/* ITEMS CONTAINER */}
        <section className="cart-items-container">
          <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid #eee', paddingBottom: '12px', marginBottom: '16px' }}>
            <h2 style={{ fontSize: '1.4rem', fontWeight: '700' }}>Shopping Cart</h2>
            <span>{cartCount} Items</span>
          </div>

          {cart.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '50px 20px' }}>
              <i className="fa-solid fa-cart-arrow-down" style={{ fontSize: '3rem', color: '#ccc', marginBottom: '14px' }}></i>
              <h3>Your Shopping Cart is Empty</h3>
              <p style={{ color: '#666', marginBottom: '20px' }}>Explore top-rated products from verified local sellers.</p>
              <Link to="/products" className="btn btn-primary">Start Shopping</Link>
            </div>
          ) : (
            cart.map((item, index) => (
              <div key={item.productId?._id || item.productId || index} className="cart-item-row">
                <img src={item.image || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=200&q=80'} alt={item.name} className="cart-item-img" />
                <div style={{ flex: 1 }}>
                  <Link to={`/products/${item.productId?._id || item.productId}`} style={{ fontWeight: '600', color: 'var(--text-primary)', fontSize: '0.95rem' }}>
                    {item.name}
                  </Link>
                  <p style={{ color: '#2e7d32', fontSize: '0.78rem', fontWeight: '600', marginTop: '2px' }}>
                    <i className="fa-solid fa-circle-check"></i> In Stock &bull; Nearby Delivery Eligible
                  </p>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginTop: '10px' }}>
                    <div className="quantity-box">
                      <button className="qty-btn" onClick={() => updateQuantity(index, -1)}>-</button>
                      <input type="text" className="qty-input" value={item.quantity} readOnly />
                      <button className="qty-btn" onClick={() => updateQuantity(index, 1)}>+</button>
                    </div>
                    <span onClick={() => removeFromCart(index)} style={{ color: '#CC0C39', fontSize: '0.82rem', fontWeight: '600', cursor: 'pointer' }}>
                      <i className="fa-solid fa-trash-can"></i> Delete
                    </span>
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: '1.2rem', fontWeight: '700' }}>{formatINR(item.price)}</span>
                  <p style={{ fontSize: '0.8rem', color: '#666' }}>Subtotal: {formatINR(item.price * item.quantity)}</p>
                </div>
              </div>
            ))
          )}
        </section>

        {/* SUMMARY CARD */}
        <aside className="summary-card">
          <h3 style={{ fontSize: '1.2rem', fontWeight: '700', borderBottom: '2px solid #eee', paddingBottom: '10px', marginBottom: '14px' }}>
            Order Summary
          </h3>

          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.92rem' }}>
            <span>Items ({cartCount} units):</span>
            <span>{formatINR(subtotal)}</span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.92rem', color: '#2e7d32', fontWeight: '600' }}>
            <span>Promotion Discount:</span>
            <span>-{formatINR(discount)}</span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '14px', fontSize: '0.92rem' }}>
            <span>Delivery Charges:</span>
            <span style={{ color: shippingFee === 0 ? '#2e7d32' : 'inherit', fontWeight: shippingFee === 0 ? '600' : 'normal' }}>
              {shippingFee === 0 ? 'FREE' : formatINR(shippingFee)}
            </span>
          </div>

          <div className="summary-total-row">
            <span>Order Total:</span>
            <span>{formatINR(totalAmount)}</span>
          </div>

          <button
            className="btn-proceed-checkout"
            onClick={() => navigate('/checkout')}
            disabled={cart.length === 0}
            style={{ opacity: cart.length === 0 ? 0.5 : 1, cursor: cart.length === 0 ? 'not-allowed' : 'pointer' }}
          >
            <i className="fa-solid fa-lock"></i> Proceed to Checkout
          </button>
        </aside>

      </div>
    </main>
  );
}
