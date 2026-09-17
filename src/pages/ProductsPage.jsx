import React, { useState, useMemo } from 'react';
import { useLocation, Link } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import { PRODUCTS_DATA } from '../data/products';

export default function ProductsPage() {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const initialQuery = searchParams.get('query') || '';

  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [sortBy, setSortBy] = useState('featured');
  const [selectedCategories, setSelectedCategories] = useState([]);

  const handleCategoryToggle = (cat) => {
    setSelectedCategories(prev => 
      prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
    );
  };

  const filteredProducts = useMemo(() => {
    return PRODUCTS_DATA.filter(p => {
      const matchSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          p.category.toLowerCase().includes(searchQuery.toLowerCase());
      
      const minVal = parseFloat(minPrice) || 0;
      const maxVal = parseFloat(maxPrice) || Infinity;
      const matchPrice = p.price >= minVal && p.price <= maxVal;

      const matchCategory = selectedCategories.length === 0 || selectedCategories.includes(p.category);

      return matchSearch && matchPrice && matchCategory;
    }).sort((a, b) => {
      if (sortBy === 'low-high') return a.price - b.price;
      if (sortBy === 'high-low') return b.price - a.price;
      if (sortBy === 'rating') return b.rating - a.rating;
      return 0;
    });
  }, [searchQuery, minPrice, maxPrice, sortBy, selectedCategories]);

  return (
    <main className="container">
      <div className="breadcrumbs">
        <Link to="/">Home</Link> <span>/</span> <span>Products</span>
      </div>

      <div className="shop-layout">
        {/* SIDEBAR FILTERS */}
        <aside className="filter-sidebar">
          <div className="filter-header">
            <h3><i className="fa-solid fa-filter" style={{ color: 'var(--accent-color)' }}></i> Filters</h3>
            <button className="clear-filter-btn" style={{ background: 'none', border: 'none', cursor: 'pointer' }} onClick={() => { setSearchQuery(''); setMinPrice(''); setMaxPrice(''); setSelectedCategories([]); }}>Reset All</button>
          </div>

          <div className="filter-group">
            <h4 className="filter-title">Search Products</h4>
            <input 
              type="text" 
              className="price-input-field" 
              placeholder="Filter by title..." 
              style={{ padding: '8px 12px' }}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="filter-group">
            <h4 className="filter-title">Categories</h4>
            <div className="filter-list">
              {[
                { id: 'electronics', label: 'Electronics & Gadgets', count: 124 },
                { id: 'fashion', label: 'Men & Women Fashion', count: 340 },
                { id: 'home', label: 'Home & Office', count: 85 }
              ].map(c => (
                <label key={c.id} className="filter-item">
                  <input 
                    type="checkbox" 
                    checked={selectedCategories.includes(c.id)}
                    onChange={() => handleCategoryToggle(c.id)}
                  /> {c.label}
                  <span className="filter-count">({c.count})</span>
                </label>
              ))}
            </div>
          </div>

          <div className="filter-group">
            <h4 className="filter-title">Price Range (₹)</h4>
            <div className="price-inputs">
              <input type="number" className="price-input-field" placeholder="Min ₹" value={minPrice} onChange={(e) => setMinPrice(e.target.value)} />
              <span>-</span>
              <input type="number" className="price-input-field" placeholder="Max ₹" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} />
            </div>
          </div>
        </aside>

        {/* PRODUCTS GRID CONTAINER */}
        <section className="products-container">
          <div className="shop-toolbar">
            <div className="results-count">
              Showing <strong>{filteredProducts.length}</strong> of <strong>{PRODUCTS_DATA.length}</strong> Results
            </div>
            <div className="toolbar-controls">
              <label htmlFor="sort-by" style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: '500' }}>Sort By:</label>
              <select id="sort-by" className="sort-select" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                <option value="featured">Featured Deals</option>
                <option value="low-high">Price: Low to High</option>
                <option value="high-low">Price: High to Low</option>
                <option value="rating">Highest Rated</option>
              </select>
            </div>
          </div>

          {filteredProducts.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '50px 20px', color: 'var(--text-secondary)' }}>
              <i className="fa-solid fa-magnifying-glass" style={{ fontSize: '3rem', color: '#ccc', marginBottom: '16px' }}></i>
              <h3>No products found</h3>
              <p>Try clearing your search query or adjusting your filters.</p>
            </div>
          ) : (
            <div className="products-grid">
              {filteredProducts.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
