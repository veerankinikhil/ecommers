import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

const DEFAULT_CART_ITEMS = [
  {
    id: 'p1',
    name: 'Wireless ANC Studio Headphones',
    categoryLabel: 'Audio & Electronics',
    price: 9999,
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=200&q=80',
    quantity: 1
  },
  {
    id: 'p2',
    name: 'Smart Fitness Watch Series X',
    categoryLabel: 'Wearables',
    price: 6999,
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=200&q=80',
    quantity: 2
  },
  {
    id: 'p6',
    name: 'Waterproof College Laptop Backpack',
    categoryLabel: 'Bags & Travel',
    price: 3299,
    image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=200&q=80',
    quantity: 1
  }
];

export function CartProvider({ children }) {
  const [cart, setCart] = useState(() => {
    const saved = localStorage.getItem('smartcart_react_items');
    return saved ? JSON.parse(saved) : DEFAULT_CART_ITEMS;
  });

  const [toastMessage, setToastMessage] = useState(null);

  useEffect(() => {
    localStorage.setItem('smartcart_react_items', JSON.stringify(cart));
  }, [cart]);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  const addToCart = (product, qty = 1) => {
    setCart((prevCart) => {
      const existingIndex = prevCart.findIndex(item => item.id === product.id || item.name === product.name);
      if (existingIndex > -1) {
        const updated = [...prevCart];
        updated[existingIndex].quantity += qty;
        return updated;
      } else {
        return [
          ...prevCart,
          {
            id: product.id || 'p_' + Date.now(),
            name: product.name,
            categoryLabel: product.categoryLabel || 'Electronics',
            price: Number(product.price),
            image: product.image,
            quantity: qty
          }
        ];
      }
    });
    showToast(`"${product.name}" added to cart!`);
  };

  const updateQuantity = (index, change) => {
    setCart((prevCart) => {
      const updated = [...prevCart];
      if (updated[index]) {
        updated[index].quantity += change;
        if (updated[index].quantity <= 0) {
          updated.splice(index, 1);
        }
      }
      return updated;
    });
  };

  const removeFromCart = (index) => {
    setCart((prevCart) => {
      const name = prevCart[index]?.name;
      const updated = prevCart.filter((_, i) => i !== index);
      showToast(`Removed "${name}" from cart`);
      return updated;
    });
  };

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <CartContext.Provider value={{ cart, addToCart, updateQuantity, removeFromCart, cartCount, subtotal }}>
      {children}
      {toastMessage && (
        <div className="toast-notification-jsx">
          <i className="fa-solid fa-circle-check"></i> {toastMessage}
        </div>
      )}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}
