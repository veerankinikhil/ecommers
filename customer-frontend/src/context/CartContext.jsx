import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from './AuthContext';

const CartContext = createContext();

export function CartProvider({ children }) {
  const { token } = useAuth();
  const [cart, setCart] = useState(() => {
    const saved = localStorage.getItem('novakart_local_cart');
    return saved ? JSON.parse(saved) : [];
  });
  const [toastMessage, setToastMessage] = useState(null);

  // Sync with Backend if logged in
  useEffect(() => {
    if (token) {
      api.get('/cart')
        .then(({ data }) => {
          if (data.cart?.items) {
            setCart(data.cart.items);
          }
        })
        .catch(() => {});
    }
  }, [token]);

  // Persist to local storage
  useEffect(() => {
    localStorage.setItem('novakart_local_cart', JSON.stringify(cart));
  }, [cart]);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3200);
  };

  const addToCart = async (product, quantity = 1) => {
    const qty = Number(quantity) || 1;
    let updated = [...cart];
    const index = updated.findIndex(i => (i.productId?._id || i.productId || i.id) === (product._id || product.id));

    if (index > -1) {
      updated[index].quantity += qty;
    } else {
      updated.push({
        productId: product._id || product.id,
        sellerId: product.sellerId?._id || product.sellerId || 'mock_seller',
        name: product.name,
        price: product.price,
        image: product.images?.[0] || product.image || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=400&q=80',
        quantity: qty
      });
    }

    setCart(updated);
    showToast(`🎉 "${product.name}" added to Cart!`);

    if (token) {
      try {
        await api.post('/cart', { productId: product._id || product.id, quantity: qty });
      } catch (e) {}
    }
  };

  const updateQuantity = (index, delta) => {
    const updated = [...cart];
    if (!updated[index]) return;
    const newQty = updated[index].quantity + delta;
    if (newQty <= 0) {
      updated.splice(index, 1);
    } else {
      updated[index].quantity = newQty;
    }
    setCart(updated);
  };

  const removeFromCart = (index) => {
    const updated = cart.filter((_, idx) => idx !== index);
    setCart(updated);
    showToast('Item removed from cart.');
  };

  const clearCart = () => {
    setCart([]);
  };

  const cartCount = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
  const subtotal = cart.reduce((sum, item) => sum + (item.price * (item.quantity || 1)), 0);
  const discount = subtotal > 2000 ? Math.round(subtotal * 0.1) : 0;
  const tax = subtotal > 0 ? 199 : 0;
  const shippingFee = subtotal >= 1000 ? 0 : (subtotal > 0 ? 50 : 0);
  const totalAmount = subtotal > 0 ? (subtotal - discount + tax + shippingFee) : 0;

  return (
    <CartContext.Provider value={{
      cart,
      addToCart,
      updateQuantity,
      removeFromCart,
      clearCart,
      cartCount,
      subtotal,
      discount,
      tax,
      shippingFee,
      totalAmount,
      toastMessage,
      showToast
    }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
