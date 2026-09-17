import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import api from '../services/api';
import ProductCard from '../components/ProductCard';

export default function ProductsPage() {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const initialQuery = searchParams.get('query') || '';
  const initialCategory = searchParams.get('category') || 'all';

  const [products, setProducts] = useState([]);
  const [query, setQuery] = useState(initialQuery);
  const [category, setCategory] = useState(initialCategory);
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [sortBy, setSortBy] = useState('featured');
  const [loading, setLoading] = useState(true);

  const fetchFilteredProducts = () => {
    setLoading(true);
    api.get('/products', {
      params: {
        query: query || undefined,
        category: category !== 'all' ? category : undefined,
        minPrice: minPrice || undefined,
        maxPrice: maxPrice || undefined,
        sortBy
      }
    })
      .then(({ data }) => setProducts(data.products || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchFilteredProducts();
  }, [query, category, minPrice, maxPrice, sortBy]);

  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  return (
    <main className="container section-padding">
      {/* Mobile Filter Trigger Button */}
      <div className="mobile-filter-trigger-row" style={{ marginBottom: '14px' }}>
        <button
          onClick={() => setIsMobileFilterOpen(!isMobileFilterOpen)}
          className="btn-mobile-filter"
          style={{
            width: '100%',
            padding: '10px',
            background: '#fff',
            border: '1px solid #E7E7E7',
            borderRadius: '8px',
            fontWeight: '700',
            fontSize: '0.85rem',
            color: '#131921',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            cursor: 'pointer'
          }}
        >
          <i className="fa-solid fa-filter" style={{ color: 'var(--accent-color)' }}></i>
          {isMobileFilterOpen ? 'Hide Filters' : 'Filter & Search Products'}
        </button>
      </div>

      <div className="products-page-layout">
        
        {/* FILTERS */}
        <aside className={`products-filter-aside ${isMobileFilterOpen ? 'open' : ''}`} style={{ background: '#fff', border: '1px solid #E7E7E7', borderRadius: '8px', padding: '20px', height: 'fit-content' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '16px' }}>
            <i className="fa-solid fa-filter" style={{ color: 'var(--accent-color)' }}></i> Filters
          </h3>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ fontSize: '0.85rem', fontWeight: '600' }}>Search</label>
            <input
              type="text"
              className="form-input"
              placeholder="Search products..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ fontSize: '0.85rem', fontWeight: '600' }}>Category</label>
            <select className="form-input" value={category} onChange={(e) => setCategory(e.target.value)}>
              <option value="all">All Categories</option>
              <option value="electronics">Electronics &amp; Gadgets</option>
              <option value="fashion">Fashion &amp; Apparel</option>
              <option value="home">Home &amp; Office</option>
              <option value="beauty">Beauty &amp; Care</option>
              <option value="sports">Sports &amp; Fitness</option>
            </select>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ fontSize: '0.85rem', fontWeight: '600' }}>Price Range (₹)</label>
            <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
              <input type="number" className="form-input" placeholder="Min ₹" value={minPrice} onChange={(e) => setMinPrice(e.target.value)} />
              <input type="number" className="form-input" placeholder="Max ₹" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} />
            </div>
          </div>
        </aside>

        {/* PRODUCTS LIST */}
        <section>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', background: '#fff', padding: '12px 20px', borderRadius: '8px', border: '1px solid #E7E7E7' }}>
            <span style={{ fontSize: '0.9rem', color: '#565959' }}>Showing <strong>{products.length}</strong> products</span>
            <div>
              <label style={{ fontSize: '0.85rem', fontWeight: '600', marginRight: '8px' }}>Sort By:</label>
              <select style={{ padding: '6px 12px', borderRadius: '4px', border: '1px solid #ccc' }} value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                <option value="featured">Featured</option>
                <option value="low-high">Price: Low to High</option>
                <option value="high-low">Price: High to Low</option>
                <option value="rating">Highest Rated</option>
              </select>
            </div>
          </div>

          {loading ? (
            <p style={{ textAlign: 'center', padding: '40px' }}>Filtering products...</p>
          ) : products.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 20px', background: '#fff', borderRadius: '8px' }}>
              <i className="fa-solid fa-magnifying-glass" style={{ fontSize: '2.5rem', color: '#ccc', marginBottom: '12px' }}></i>
              <h3>No products found</h3>
              <p style={{ color: '#777', fontSize: '0.9rem' }}>Try clearing filters or search terms.</p>
            </div>
          ) : (
            <div className="products-grid">
              {products.map(p => (
                <ProductCard key={p._id || p.id} product={p} />
              ))}
            </div>
          )}
        </section>

      </div>
    </main>
  );
}
