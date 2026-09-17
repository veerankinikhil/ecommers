import React, { useEffect, useState } from 'react';
import adminApi, { formatINR } from '../services/adminApi';

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchProducts = () => {
    adminApi.get('/products')
      .then(({ data }) => setProducts(data.products || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleToggleStatus = async (id) => {
    try {
      const { data } = await adminApi.put(`/admin/products/${id}/toggle-status`);
      alert(data.message);
      fetchProducts();
    } catch (err) {
      alert('Failed to update product status');
    }
  };

  return (
    <div>
      <div className="admin-top-header">
        <div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: '800' }}>Platform Product Catalog Moderation</h1>
          <p style={{ color: '#64748B', fontSize: '0.88rem' }}>Inspect multi-vendor listed items and disable inappropriate listings</p>
        </div>
      </div>

      {loading ? (
        <p>Loading products...</p>
      ) : products.length === 0 ? (
        <p>No products listed in catalog yet.</p>
      ) : (
        <table className="data-table">
          <thead>
            <tr>
              <th>Image</th>
              <th>Product Name</th>
              <th>Category</th>
              <th>Price (₹)</th>
              <th>Stock</th>
              <th>Moderation Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {products.map(p => (
              <tr key={p._id}>
                <td>
                  <img src={p.images?.[0]} alt={p.name} style={{ width: '40px', height: '40px', objectFit: 'contain', background: '#f5f5f5', borderRadius: '4px' }} />
                </td>
                <td><strong>{p.name}</strong></td>
                <td>{p.category}</td>
                <td><strong style={{ color: '#0F172A' }}>{formatINR(p.price)}</strong></td>
                <td>{p.stock}</td>
                <td>
                  <span style={{
                    background: p.status === 'active' ? '#e7f4e8' : '#fee2e2',
                    color: p.status === 'active' ? '#2e7d32' : '#dc2626',
                    padding: '3px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase'
                  }}>
                    {p.status}
                  </span>
                </td>
                <td>
                  <button className="btn-block" onClick={() => handleToggleStatus(p._id)}>
                    {p.status === 'active' ? 'Disable Item' : 'Enable Item'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
