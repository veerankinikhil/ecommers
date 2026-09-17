import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import api, { formatINR } from '../services/api';

export default function MockPaymentPage() {
  const navigate = useNavigate();
  const { clearCart } = useCart();
  
  const [orderPayload, setOrderPayload] = useState(null);
  const [paymentOption, setPaymentOption] = useState('card'); // 'card' | 'upi' | 'netbanking'
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [upiId, setUpiId] = useState('');
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');

  useEffect(() => {
    const payloadStr = localStorage.getItem('pending_order_payload');
    if (!payloadStr) {
      alert('No pending checkout records found. Redirecting to cart.');
      navigate('/cart');
      return;
    }
    try {
      setOrderPayload(JSON.parse(payloadStr));
    } catch {
      navigate('/cart');
    }
  }, [navigate]);

  if (!orderPayload) return <div style={{ textAlign: 'center', padding: '50px' }}>Loading transaction gateway...</div>;

  // Compute total payable amount with discounts, shipping, etc.
  const { items, deliveryAddress, giftCardCode, promoCode } = orderPayload;
  
  const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const tax = 199;
  const shippingFee = 50;
  const freeDeliveryDiscount = subtotal >= 1000 ? 50 : 0;
  
  // Calculate promo discount
  let promoDiscount = 0;
  if (promoCode === 'NOVAKART20') promoDiscount = 50;
  else if (promoCode === 'SUPER200') promoDiscount = 200;
  else if (promoCode === 'FESTIVE100') promoDiscount = 100;

  // We'll verify gift card discount if any was passed
  const giftCardDiscount = giftCardCode ? 50 : 0; // standard gift card discount
  const totalPayable = subtotal + tax + shippingFee - freeDeliveryDiscount - promoDiscount - giftCardDiscount;

  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    setProcessing(true);
    setStatusMessage('Contacting bank gateway secure API...');

    setTimeout(() => {
      setStatusMessage('Authorizing transaction credentials...');
      setTimeout(() => {
        setStatusMessage('Processing payment confirmation...');
        setTimeout(async () => {
          try {
            // Finalize order placement via MERN backend
            const finalPayload = {
              ...orderPayload,
              paymentStatus: 'PAID' // Mark paid instantly
            };
            const { data } = await api.post('/orders/place', finalPayload);
            
            setSuccess(true);
            setProcessing(false);
            localStorage.removeItem('pending_order_payload');
            clearCart();
            
            setTimeout(() => {
              navigate(`/orders/${data.order._id}/track`);
            }, 1800);
          } catch (err) {
            alert(err.response?.data?.message || 'Transaction authorization failed on backend server.');
            setProcessing(false);
          }
        }, 1200);
      }, 1000);
    }, 1000);
  };

  return (
    <main className="container section-padding" style={{ maxWidth: '600px', margin: '0 auto' }}>
      <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '30px', boxShadow: '0 10px 30px rgba(0,0,0,0.06)' }}>
        
        {success ? (
          <div style={{ textAlign: 'center', padding: '30px 0' }}>
            <div style={{ width: '80px', height: '80px', background: '#e8f5e9', color: '#2e7d32', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px auto', fontSize: '2.5rem' }}>
              <i className="fa-solid fa-circle-check"></i>
            </div>
            <h2 style={{ color: '#1e293b', fontWeight: '800', marginBottom: '8px' }}>Payment Approved!</h2>
            <p style={{ color: '#64748b', fontSize: '0.95rem' }}>Creating secure order and dispatching to delivery agent radar...</p>
          </div>
        ) : processing ? (
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: '3rem', color: 'var(--secondary-color)', marginBottom: '20px' }}></i>
            <h3 style={{ fontWeight: '800', color: '#1e293b', marginBottom: '8px' }}>Processing Payment</h3>
            <p style={{ color: '#64748b', fontSize: '0.85rem' }}>{statusMessage}</p>
            <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '8px', marginTop: '20px', fontSize: '0.8rem', color: '#475569' }}>
              <i className="fa-solid fa-lock" style={{ color: '#22c55e', marginRight: '6px' }}></i> Secured by 256-bit SSL encryption
            </div>
          </div>
        ) : (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f0f0f0', paddingBottom: '14px', marginBottom: '20px' }}>
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--primary-color)' }}>NovaPay Secure Gateway</h3>
                <span style={{ fontSize: '0.78rem', color: '#64748b' }}>Merchant: NovaKart Storefront</span>
              </div>
              <strong style={{ fontSize: '1.3rem', color: '#0f172a' }}>{formatINR(totalPayable)}</strong>
            </div>

            {/* Payment Modes Tabs */}
            <div style={{ display: 'flex', borderBottom: '1px solid #e2e8f0', marginBottom: '20px' }}>
              <button 
                type="button" 
                onClick={() => setPaymentOption('card')}
                style={{ flex: 1, padding: '12px', background: 'none', border: 'none', borderBottom: paymentOption === 'card' ? '2px solid var(--secondary-color)' : 'none', fontWeight: 'bold', color: paymentOption === 'card' ? 'var(--secondary-color)' : '#64748b', cursor: 'pointer' }}
              >
                <i className="fa-solid fa-credit-card"></i> Card
              </button>
              <button 
                type="button" 
                onClick={() => setPaymentOption('upi')}
                style={{ flex: 1, padding: '12px', background: 'none', border: 'none', borderBottom: paymentOption === 'upi' ? '2px solid var(--secondary-color)' : 'none', fontWeight: 'bold', color: paymentOption === 'upi' ? 'var(--secondary-color)' : '#64748b', cursor: 'pointer' }}
              >
                <i className="fa-solid fa-mobile-screen-button"></i> UPI / GPay
              </button>
            </div>

            <form onSubmit={handlePaymentSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {paymentOption === 'card' ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div>
                    <label style={{ fontSize: '0.8rem', fontWeight: '700', color: '#475569', display: 'block', marginBottom: '4px' }}>Card Number</label>
                    <input 
                      type="text" 
                      required 
                      className="form-input" 
                      placeholder="XXXX XXXX XXXX XXXX" 
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value.replace(/\D/g, '').slice(0, 16))}
                    />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div>
                      <label style={{ fontSize: '0.8rem', fontWeight: '700', color: '#475569', display: 'block', marginBottom: '4px' }}>Expiry Date</label>
                      <input 
                        type="text" 
                        required 
                        className="form-input" 
                        placeholder="MM/YY" 
                        value={expiry}
                        onChange={(e) => setExpiry(e.target.value.slice(0, 5))}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: '0.8rem', fontWeight: '700', color: '#475569', display: 'block', marginBottom: '4px' }}>CVV Security Code</label>
                      <input 
                        type="password" 
                        required 
                        className="form-input" 
                        placeholder="***" 
                        value={cvv}
                        onChange={(e) => setCvv(e.target.value.replace(/\D/g, '').slice(0, 3))}
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: '700', color: '#475569', display: 'block', marginBottom: '4px' }}>UPI Address / ID</label>
                  <input 
                    type="text" 
                    required 
                    className="form-input" 
                    placeholder="e.g. mobileNumber@upi / name@okaxis" 
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                  />
                </div>
              )}

              <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '14px', marginTop: '10px', fontSize: '1rem' }}>
                Securely Pay {formatINR(totalPayable)}
              </button>

              <button 
                type="button" 
                onClick={() => navigate('/checkout')}
                style={{ width: '100%', background: 'none', border: '1px solid #cbd5e1', padding: '10px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 'bold', color: '#64748b' }}
              >
                Cancel and Go Back
              </button>
            </form>
          </div>
        )}
      </div>
    </main>
  );
}
