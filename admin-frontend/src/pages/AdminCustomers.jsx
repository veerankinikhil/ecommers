import React, { useEffect, useState } from 'react';
import adminApi from '../services/adminApi';

export default function AdminCustomers() {
  const [customers, setCustomers] = useState([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchCustomers = () => {
    adminApi.get('/admin/customers', { params: { query } })
      .then(({ data }) => setCustomers(data.customers || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchCustomers();
  }, [query]);

  const handleToggleBlock = async (id) => {
    try {
      const { data } = await adminApi.put(`/admin/customers/${id}/block`);
      alert(data.message);
      fetchCustomers();
    } catch (err) {
      alert('Failed to update customer status');
    }
  };

  return (
    <div>
      <div className="admin-top-header">
        <div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: '800' }}>Customer Accounts &amp; Access</h1>
          <p style={{ color: '#64748B', fontSize: '0.88rem' }}>Inspect customer profiles and toggle platform account access</p>
        </div>

        <input
          type="text"
          className="form-input"
          placeholder="Search by customer name, email or phone..."
          style={{ maxWidth: '300px' }}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      {loading ? (
        <p>Loading customers...</p>
      ) : customers.length === 0 ? (
        <p>No customers matching search query.</p>
      ) : (
        <table className="data-table">
          <thead>
            <tr>
              <th>Customer Name</th>
              <th>Email Address</th>
              <th>Phone</th>
              <th>Registered Date</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {customers.map(c => (
              <tr key={c._id}>
                <td><strong>{c.name}</strong></td>
                <td>{c.email}</td>
                <td>{c.phone || '+91 98765 43210'}</td>
                <td>{new Date(c.createdAt).toLocaleDateString('en-IN')}</td>
                <td>
                  <span style={{
                    background: c.isBlocked ? '#fee2e2' : '#e7f4e8',
                    color: c.isBlocked ? '#dc2626' : '#2e7d32',
                    padding: '3px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase'
                  }}>
                    {c.isBlocked ? 'BLOCKED' : 'ACTIVE'}
                  </span>
                </td>
                <td>
                  <button className="btn-block" onClick={() => handleToggleBlock(c._id)}>
                    {c.isBlocked ? 'Unblock Customer' : 'Block Access'}
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
