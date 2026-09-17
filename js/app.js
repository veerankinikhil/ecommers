/* SmartKart / NovaKart JavaScript App Controller */

document.addEventListener('DOMContentLoaded', () => {
  console.log('NovaKart / SmartKart Application Initialized.');

  // Cart Badge Counter Initializer
  const updateCartBadge = () => {
    const badges = document.querySelectorAll('.cart-badge');
    const savedCart = JSON.parse(localStorage.getItem('smartcart_items') || '[]');
    const count = savedCart.reduce((sum, item) => sum + (item.quantity || 1), 3);
    badges.forEach(badge => {
      badge.textContent = count;
    });
  };

  updateCartBadge();

  // Add to Cart Buttons Interactive Listener
  const addCartBtns = document.querySelectorAll('.btn-add-cart, .btn-detail-cart');
  addCartBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      
      let cart = JSON.parse(localStorage.getItem('smartcart_items') || '[]');
      cart.push({ id: Date.now(), name: 'Added Item', price: 1999, quantity: 1 });
      localStorage.setItem('smartcart_items', JSON.stringify(cart));

      showToast('🎉 Item added to your Shopping Cart!');
      updateCartBadge();
    });
  });

  // Quantity Spinners
  const qtyBtns = document.querySelectorAll('.qty-btn');
  qtyBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const input = btn.parentElement.querySelector('.qty-input');
      if (!input) return;
      let val = parseInt(input.value) || 1;
      if (btn.textContent.trim() === '+') {
        val++;
      } else if (btn.textContent.trim() === '-' && val > 1) {
        val--;
      }
      input.value = val;
    });
  });

  // Toast Popup Creator
  function showToast(message) {
    let toast = document.querySelector('.toast-notification-jsx');
    if (!toast) {
      toast = document.createElement('div');
      toast.className = 'toast-notification-jsx';
      document.body.appendChild(toast);
    }
    toast.innerHTML = `<i class="fa-solid fa-circle-check"></i> ${message}`;
    toast.style.display = 'flex';
    setTimeout(() => {
      toast.style.display = 'none';
    }, 3000);
  }
});
