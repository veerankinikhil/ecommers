import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';

export default function Navbar() {
  const { cartCount } = useCart();
  const [navOpen, setNavOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?query=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <header className="site-header">
      {/* Top Bar */}
      <div class="top-bar">
        <div className="container">
          <p><i className="fa-solid fa-truck-fast"></i> <span>FREE Express Delivery</span> on orders over ₹999 | Use Code: <span>SMARTKART20</span></p>
        </div>
      </div>

      {/* Main Header */}
      <div className="main-header">
        <div className="container header-container">
          <Link to="/" className="logo">
            <div className="logo-icon"><i className="fa-solid fa-cart-shopping"></i></div>
            <span>Nova<span className="logo-accent">Kart</span></span>
          </Link>

          {/* Search Bar */}
          <form className="header-search" onSubmit={handleSearchSubmit}>
            <select className="search-category-select" defaultValue="all">
              <option value="all">All Categories</option>
              <option value="electronics">Electronics</option>
              <option value="fashion">Fashion</option>
              <option value="home">Home & Kitchen</option>
              <option value="beauty">Beauty & Care</option>
            </select>
            <input 
              type="text" 
              className="search-input" 
              placeholder="Search NovaKart..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button type="submit" className="search-btn" aria-label="Search">
              <i className="fa-solid fa-magnifying-glass"></i>
            </button>
          </form>

          {/* Mobile Menu Toggle */}
          <div className="nav-toggle-label" onClick={() => setNavOpen(!navOpen)}>
            <span></span>
            <span></span>
            <span></span>
          </div>
        </div>
      </div>

      {/* Sub-Navbar */}
      <nav className="sub-navbar">
        <div className="container">
          <ul className={`nav-menu ${navOpen ? 'active-mobile-menu' : ''}`}>
            <li><NavLink to="/" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}><i className="fa-solid fa-house"></i> Home</NavLink></li>
            <li><NavLink to="/products" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}><i className="fa-solid fa-box"></i> Products</NavLink></li>
            <li><NavLink to="/products" className="nav-link"><i className="fa-solid fa-layer-group"></i> Categories</NavLink></li>
            <li><NavLink to="/about" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}><i className="fa-solid fa-circle-info"></i> About</NavLink></li>
            <li><NavLink to="/contact" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}><i className="fa-solid fa-envelope"></i> Contact</NavLink></li>
            <li><NavLink to="/login" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}><i className="fa-solid fa-user"></i> Login</NavLink></li>
            <li>
              <NavLink to="/cart" className={({ isActive }) => isActive ? "nav-link cart-nav-link active" : "nav-link cart-nav-link"}>
                <i className="fa-solid fa-cart-shopping"></i> Cart <span className="cart-badge">{cartCount}</span>
              </NavLink>
            </li>
          </ul>
        </div>
      </nav>
    </header>
  );
}
