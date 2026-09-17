import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useDeviceMode } from '../context/DeviceModeContext';
import NotificationBell from './NotificationBell';
import CustomerBarcodeSearchModal from './CustomerBarcodeSearchModal';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { cartCount } = useCart();
  const { isPhone, isTablet, isWeb } = useDeviceMode();
  const [searchQuery, setSearchQuery] = useState('');
  const [category, setCategory] = useState('all');
  const [selectedPincode, setSelectedPincode] = useState('522019');
  const [isBarcodeModalOpen, setIsBarcodeModalOpen] = useState(false);
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    if (!searchQuery.trim() && category === 'all') return;
    navigate(`/products?query=${encodeURIComponent(searchQuery)}&category=${category}`);
  };

  // Amazon-style quick service icons matching user's mobile screenshot
  const amazonQuickServices = [
    {
      id: 'pay',
      name: 'Pay',
      bg: '#FEF3C7',
      border: '#FDE68A',
      icon: 'fa-solid fa-credit-card',
      iconColor: '#D97706',
      link: '/checkout/payment'
    },
    {
      id: 'fresh',
      name: 'Fresh',
      bg: '#FFFFFF',
      border: '#E2E8F0',
      icon: 'fa-solid fa-apple-whole',
      iconColor: '#16A34A',
      badge: 'Groceries',
      link: '/products?category=home'
    },
    {
      id: 'bazaar',
      name: 'Bazaar',
      bg: '#FEE2E2',
      border: '#FECACA',
      icon: 'fa-solid fa-bag-shopping',
      iconColor: '#DC2626',
      badge: 'CRAZY PRICES',
      link: '/products?category=fashion'
    },
    {
      id: 'video',
      name: 'Video',
      bg: '#E0F2FE',
      border: '#BAE6FD',
      icon: 'fa-solid fa-circle-play',
      iconColor: '#0284C7',
      link: '/products?category=electronics'
    },
    {
      id: 'pharm',
      name: 'Pharm',
      bg: '#FFFFFF',
      border: '#E2E8F0',
      icon: 'fa-solid fa-square-plus',
      iconColor: '#059669',
      link: '/products?category=beauty'
    }
  ];

  const categories = [
    { id: 'all', name: 'All Categories' },
    { id: 'electronics', name: 'Electronics & Mobiles' },
    { id: 'fashion', name: 'Fashion & Apparel' },
    { id: 'home', name: 'Home & Kitchen' },
    { id: 'beauty', name: 'Beauty & Care' },
    { id: 'sports', name: 'Sports & Fitness' }
  ];

  // ════════════════════════════════════════════════════════════════════════
  // 1. EXACT AMAZON MOBILE INTERFACE HEADER (Matching User's Screenshot!)
  // ════════════════════════════════════════════════════════════════════════
  if (isPhone) {
    return (
      <header className="amazon-mobile-header-container" style={{
        position: 'sticky',
        top: 0,
        zIndex: 999,
        flexShrink: 0,
        background: 'linear-gradient(180deg, #74C0FC 0%, #A5D8FF 60%, #CBE7FD 100%)',
        padding: '10px 12px 6px 12px',
        color: '#0F1111',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        boxShadow: '0 2px 6px rgba(0,0,0,0.06)'
      }}>
        {/* Row 1: Quick Services Row (Pay, Fresh, Bazaar, Video, Pharm) */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '8px',
          marginBottom: '10px',
          overflowX: 'auto',
          scrollbarWidth: 'none',
          paddingBottom: '2px'
        }}>
          {amazonQuickServices.map((svc) => (
            <div
              key={svc.id}
              onClick={() => navigate(svc.link)}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                cursor: 'pointer',
                flex: '1 0 58px',
                minWidth: '58px'
              }}
            >
              <div style={{
                width: '56px',
                height: '46px',
                background: svc.bg,
                border: `1px solid ${svc.border}`,
                borderRadius: '12px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
                position: 'relative'
              }}>
                {svc.badge && (
                  <span style={{
                    position: 'absolute',
                    top: '2px',
                    fontSize: '0.48rem',
                    fontWeight: '800',
                    color: svc.iconColor,
                    lineHeight: '1',
                    textTransform: 'uppercase'
                  }}>
                    {svc.badge}
                  </span>
                )}
                <i className={svc.icon} style={{ color: svc.iconColor, fontSize: '1.25rem', marginTop: svc.badge ? '8px' : '0' }}></i>
              </div>
              <span style={{ fontSize: '0.68rem', fontWeight: '700', color: '#111827', marginTop: '3px' }}>
                {svc.name}
              </span>
            </div>
          ))}
        </div>

        {/* Row 2: Amazon White Pill Search Bar */}
        <form
          onSubmit={handleSearch}
          style={{
            background: '#FFFFFF',
            borderRadius: '24px',
            height: '44px',
            display: 'flex',
            alignItems: 'center',
            padding: '0 14px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
            marginBottom: '8px'
          }}
        >
          <i className="fa-solid fa-magnifying-glass" style={{ color: '#334155', fontSize: '1rem', marginRight: '8px' }}></i>
          <input
            type="text"
            placeholder="Search or ask a question"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              flex: 1,
              border: 'none',
              outline: 'none',
              fontSize: '0.9rem',
              color: '#0F172A',
              background: 'transparent'
            }}
          />
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', color: '#475569', fontSize: '1.05rem' }}>
            <i
              className="fa-solid fa-camera"
              title="Search with Camera Lens"
              style={{ cursor: 'pointer' }}
              onClick={() => setIsBarcodeModalOpen(true)}
            ></i>
            <i
              className="fa-solid fa-microphone"
              title="Voice Search"
              style={{ cursor: 'pointer' }}
              onClick={() => {
                const term = prompt('Voice Search query:', 'Headphones');
                if (term) navigate(`/products?query=${encodeURIComponent(term)}`);
              }}
            ></i>
            <i
              className="fa-solid fa-barcode"
              title="Scan Barcode"
              style={{ cursor: 'pointer' }}
              onClick={() => setIsBarcodeModalOpen(true)}
            ></i>
          </div>
        </form>

        {/* Row 3: Deliver to Pincode & Join Prime Bar */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '2px 4px 4px 4px',
          fontSize: '0.82rem',
          color: '#0F172A'
        }}>
          <div
            onClick={() => {
              const newPin = prompt('Enter Delivery Pincode:', selectedPincode);
              if (newPin) setSelectedPincode(newPin.trim());
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              cursor: 'pointer',
              fontWeight: '600'
            }}
          >
            <i className="fa-solid fa-location-dot" style={{ color: '#0F172A', fontSize: '0.9rem' }}></i>
            <span>Deliver to <strong>{selectedPincode}</strong></span>
            <i className="fa-solid fa-chevron-down" style={{ fontSize: '0.65rem' }}></i>
          </div>

          <button
            type="button"
            onClick={() => alert('🌟 Nova Prime Active! Enjoy Free 1-Day Express Delivery on all orders.')}
            style={{
              background: '#0071E3',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '20px',
              padding: '5px 14px',
              fontSize: '0.76rem',
              fontWeight: '800',
              cursor: 'pointer',
              boxShadow: '0 2px 6px rgba(0, 113, 227, 0.3)'
            }}
          >
            Join Prime
          </button>
        </div>

        {/* Real Live Camera & Barcode Search Modal */}
        <CustomerBarcodeSearchModal
          isOpen={isBarcodeModalOpen}
          onClose={() => setIsBarcodeModalOpen(false)}
        />
      </header>
    );
  }

  // ════════════════════════════════════════════════════════════════════════
  // 2. TABLET INTERFACE HEADER
  // ════════════════════════════════════════════════════════════════════════
  if (isTablet) {
    return (
      <header className="site-header tablet-header-root">
        <div style={{
          background: '#0b0e14',
          color: '#ccc',
          fontSize: '0.75rem',
          padding: '4px 16px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <span><i className="fa-solid fa-bolt" style={{ color: '#FF9900', marginRight: '4px' }}></i> FREE Express Delivery over ₹999 &bull; Code: <strong>NOVAKART20</strong></span>
          <span style={{ color: '#94A3B8' }}>TABLET VIEW &bull; 820px</span>
        </div>

        <div style={{
          background: '#131921',
          padding: '10px 18px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px'
        }}>
          <Link to="/" className="logo" style={{ fontSize: '1.4rem' }}>
            <div className="logo-icon" style={{ width: '30px', height: '30px', fontSize: '0.9rem' }}>
              <i className="fa-solid fa-cart-shopping"></i>
            </div>
            <span>Nova<span className="logo-accent">Kart</span></span>
          </Link>

          <form className="header-search" onSubmit={handleSearch} style={{ flex: 1, maxWidth: '440px', height: '38px' }}>
            <select
              className="search-category-select"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              style={{ fontSize: '0.8rem', padding: '0 8px' }}
            >
              <option value="all">All</option>
              <option value="electronics">Electronics</option>
              <option value="fashion">Fashion</option>
              <option value="home">Home</option>
              <option value="beauty">Beauty</option>
              <option value="sports">Sports</option>
            </select>
            <input
              type="text"
              className="search-input"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ fontSize: '0.85rem' }}
            />
            <button type="submit" className="search-btn" style={{ width: '42px' }}>
              <i className="fa-solid fa-magnifying-glass"></i>
            </button>
          </form>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {user ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Link to="/profile" style={{ color: '#fff', fontSize: '0.82rem', fontWeight: '600' }}>
                  Hi, {user.name.split(' ')[0]}
                </Link>
                <NotificationBell theme="dark" />
              </div>
            ) : (
              <Link to="/login" style={{ color: '#fff', fontSize: '0.82rem', fontWeight: '600' }}>
                Sign In
              </Link>
            )}

            <Link to="/cart" className="cart-nav-link" style={{ padding: '5px 10px', fontSize: '0.82rem' }}>
              <i className="fa-solid fa-cart-shopping"></i>
              <span className="cart-badge">{cartCount}</span>
            </Link>
          </div>
        </div>

        <nav style={{ background: '#232F3E', padding: '6px 16px', overflowX: 'auto' }}>
          <ul style={{ display: 'flex', gap: '6px', listStyle: 'none', margin: 0, padding: 0 }}>
            <li><Link to="/" className="nav-link" style={{ fontSize: '0.82rem', padding: '6px 12px' }}><i className="fa-solid fa-house"></i> Home</Link></li>
            <li><Link to="/products" className="nav-link" style={{ fontSize: '0.82rem', padding: '6px 12px' }}><i className="fa-solid fa-box"></i> Products</Link></li>
            <li><Link to="/orders" className="nav-link" style={{ fontSize: '0.82rem', padding: '6px 12px' }}><i className="fa-solid fa-clock-rotate-left"></i> My Orders</Link></li>
            {categories.slice(1).map(cat => (
              <li key={cat.id}>
                <Link to={`/products?category=${cat.id}`} className="nav-link" style={{ fontSize: '0.82rem', padding: '6px 12px' }}>
                  {cat.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </header>
    );
  }

  // ════════════════════════════════════════════════════════════════════════
  // 3. FULL WEB / DESKTOP INTERFACE HEADER (STANDARD DESKTOP NAVBAR)
  // ════════════════════════════════════════════════════════════════════════
  return (
    <header className="site-header desktop-header-root">
      <div className="top-bar">
        <div className="container">
          <p><i className="fa-solid fa-truck-fast"></i> <span>FREE Express Delivery</span> on orders over ₹999 | Code: <span>NOVAKART20</span></p>
        </div>
      </div>

      <div className="main-header">
        <div className="container header-container">
          <Link to="/" className="logo">
            <div className="logo-icon"><i className="fa-solid fa-cart-shopping"></i></div>
            <span>Nova<span className="logo-accent">Kart</span></span>
          </Link>

          <form className="header-search" onSubmit={handleSearch}>
            <select className="search-category-select" value={category} onChange={(e) => setCategory(e.target.value)}>
              <option value="all">All Categories</option>
              <option value="electronics">Electronics</option>
              <option value="fashion">Fashion</option>
              <option value="home">Home &amp; Office</option>
              <option value="beauty">Beauty &amp; Care</option>
              <option value="sports">Sports</option>
            </select>
            <input
              type="text"
              className="search-input"
              placeholder="Search products, brands and tech in Indian Rupees (₹)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button type="submit" className="search-btn" aria-label="Search">
              <i className="fa-solid fa-magnifying-glass"></i>
            </button>
          </form>

          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            {user ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Link to="/profile" style={{ color: '#fff', fontSize: '0.85rem', fontWeight: '600' }}>
                  <i className="fa-solid fa-user-check"></i> Hi, {user.name.split(' ')[0]}
                </Link>
                <NotificationBell theme="dark" />
                <button onClick={logout} style={{ background: 'rgba(255,255,255,0.15)', border: 'none', color: '#fff', padding: '4px 10px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.75rem' }}>
                  Logout
                </button>
              </div>
            ) : (
              <Link to="/login" style={{ color: '#fff', fontSize: '0.9rem', fontWeight: '600' }}>
                <i className="fa-solid fa-user"></i> Sign In
              </Link>
            )}

            <Link to="/cart" className="cart-nav-link">
              <i className="fa-solid fa-cart-shopping"></i> Cart <span className="cart-badge">{cartCount}</span>
            </Link>
          </div>
        </div>
      </div>

      <nav className="sub-navbar">
        <div className="container">
          <ul className="nav-menu">
            <li><Link to="/" className="nav-link"><i className="fa-solid fa-house"></i> Home</Link></li>
            <li><Link to="/products" className="nav-link"><i className="fa-solid fa-box"></i> All Products</Link></li>
            <li><Link to="/orders" className="nav-link"><i className="fa-solid fa-clock-rotate-left"></i> My Orders</Link></li>
            {categories.slice(1).map(cat => (
              <li key={cat.id}>
                <Link to={`/products?category=${cat.id}`} className="nav-link">
                  {cat.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </nav>
    </header>
  );
}
