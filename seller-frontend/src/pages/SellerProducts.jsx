import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import sellerApi, { formatINR } from '../services/sellerApi';

export default function SellerProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchProducts = () => {
    sellerApi.get('/products/seller/my-products')
      .then(({ data }) => setProducts(data.products || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to remove this product from the customer storefront?')) {
      try {
        await sellerApi.delete(`/products/seller/${id}`);
        fetchProducts();
      } catch (err) {
        alert('Failed to delete product');
      }
    }
  };

  return (
    <div>
      <div className="seller-top-header">
        <div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: '800' }}>Store Products Catalog</h1>
          <p style={{ color: '#64748B', fontSize: '0.88rem' }}>Manage products live on the Customer Storefront</p>
        </div>
        <Link to="/products/new" className="btn-seller btn-seller-accent">
          <i className="fa-solid fa-plus"></i> Add New Product
        </Link>
      </div>

      {loading ? (
        <p>Loading inventory...</p>
      ) : products.length === 0 ? (
        <div style={{ background: '#fff', padding: '50px 20px', textAlign: 'center', borderRadius: '10px' }}>
          <h3>No products in your catalog yet</h3>
          <p style={{ color: '#666', marginBottom: '20px' }}>List your first product and it will immediately become visible to customers!</p>
          <Link to="/products/new" className="btn-seller btn-seller-primary">Add Product Now</Link>
        </div>
      ) : (
        <table className="data-table">
          <thead>
            <tr>
              <th>Image</th>
              <th>Product Name</th>
              <th>Category</th>
              <th>Price (₹)</th>
              <th>Stock</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {products.map(p => (
              <tr key={p._id}>
                <td>
                  <Link to={`/products/edit/${p._id}`} title="Edit this product">
                    <img 
                      src={p.images?.[0] || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=100&q=80'} 
                      alt={p.name} 
                      style={{ width: '48px', height: '48px', objectFit: 'contain', background: '#f8fafc', borderRadius: '6px', border: '1px solid #e2e8f0' }} 
                    />
                  </Link>
                </td>
                <td>
                  <Link to={`/products/edit/${p._id}`} style={{ color: '#0F172A', fontWeight: '700', textDecoration: 'none' }} title="Click to edit">
                    {p.name}
                  </Link>
                  <div style={{ fontSize: '0.75rem', color: '#64748B', display: 'flex', gap: '8px', marginTop: '2px' }}>
                    <span>{p.images?.length || 1} photo(s)</span>
                    {p.videos?.length > 0 && <span style={{ color: '#7C3AED', fontWeight: '600' }}>• {p.videos.length} video(s)</span>}
                  </div>
                </td>
                <td>{p.category}</td>
                <td><strong style={{ color: '#1A237E' }}>{formatINR(p.price)}</strong></td>
                <td>
                  <span style={{ fontWeight: '700', color: p.stock > 5 ? '#10B981' : '#EF4444' }}>
                    {p.stock} in stock
                  </span>
                </td>
                <td>
                  <span style={{ background: p.status === 'active' ? '#e7f4e8' : '#fee2e2', color: p.status === 'active' ? '#2e7d32' : '#991b1b', padding: '3px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase' }}>
                    {p.status}
                  </span>
                </td>
                <td>
                  <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                    <Link 
                      to={`/products/edit/${p._id}`} 
                      style={{ background: '#EFF6FF', color: '#1D4ED8', border: '1px solid #BFDBFE', padding: '5px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: '600', display: 'inline-flex', alignItems: 'center', gap: '4px', textDecoration: 'none' }}
                      title="Edit product details, photos and videos"
                    >
                      <i className="fa-solid fa-pen-to-square"></i> Edit
                    </Link>
                    <a
                      href={`http://localhost:3000/products/${p._id}`}
                      target="_blank"
                      rel="noreferrer"
                      style={{ background: '#F8FAFC', color: '#475569', border: '1px solid #CBD5E1', padding: '5px 8px', borderRadius: '4px', fontSize: '0.8rem' }}
                      title="View live product page on customer storefront"
                    >
                      <i className="fa-solid fa-arrow-up-right-from-square"></i>
                    </a>
                    <button 
                      onClick={() => handleDelete(p._id)} 
                      style={{ background: '#fee2e2', color: '#dc2626', border: '1px solid #fca5a5', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: '600' }}
                      title="Delete from catalog"
                    >
                      <i className="fa-solid fa-trash"></i>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
