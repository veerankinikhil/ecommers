import React, { useEffect, useState } from 'react';
import adminApi, { formatINR } from '../services/adminApi';

export default function AdminSellers() {
  const [sellers, setSellers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchSellers = () => {
    adminApi.get('/admin/sellers')
      .then(({ data }) => setSellers(data.sellers || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchSellers();
  }, []);

  const handleApprove = async (id) => {
    try {
      await adminApi.put(`/admin/sellers/${id}/approve`);
      alert('🎉 Seller store approved! They can now list products.');
      fetchSellers();
    } catch (err) {
      alert('Failed to approve seller');
    }
  };

  const handleReject = async (id) => {
    try {
      await adminApi.put(`/admin/sellers/${id}/reject`);
      alert('Seller store rejected.');
      fetchSellers();
    } catch (err) {
      alert('Failed to reject seller');
    }
  };

  const handleToggleBlock = async (id) => {
    try {
      const { data } = await adminApi.put(`/admin/sellers/${id}/block`);
      alert(data.message);
      fetchSellers();
    } catch (err) {
      alert('Failed to toggle block status');
    }
  };

  return (
    <div>
      <div className="admin-top-header">
        <div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: '800' }}>Seller Stores &amp; KYC Verification</h1>
          <p style={{ color: '#64748B', fontSize: '0.88rem' }}>Review store registration applications and manage merchant permissions</p>
        </div>
      </div>

      {loading ? (
        <p>Loading seller records...</p>
      ) : sellers.length === 0 ? (
        <p>No seller stores registered yet.</p>
      ) : (
        <table className="data-table">
          <thead>
            <tr>
              <th>Store Name</th>
              <th>Owner &amp; Email</th>
              <th>Phone</th>
              <th>Location Coordinates</th>
              <th>KYC Status</th>
              <th>Revenue (₹)</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {sellers.map(s => (
              <tr key={s._id}>
                <td><strong>{s.storeName}</strong></td>
                <td>
                  {s.ownerName}<br />
                  <span style={{ fontSize: '0.75rem', color: '#64748B' }}>{s.email}</span>
                </td>
                <td>{s.phone}</td>
                <td>
                  <span style={{ fontSize: '0.78rem', color: '#3B82F6' }}>
                    {s.location?.lat?.toFixed(4)}, {s.location?.lng?.toFixed(4)}
                  </span>
                </td>
                <td>
                  <span style={{
                    background: s.status === 'approved' ? '#e7f4e8' : s.status === 'rejected' ? '#fee2e2' : '#fef3c7',
                    color: s.status === 'approved' ? '#2e7d32' : s.status === 'rejected' ? '#dc2626' : '#d97706',
                    padding: '3px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase'
                  }}>
                    {s.status}
                  </span>
                </td>
                <td><strong>{formatINR(s.revenue)}</strong></td>
                <td>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    {s.status !== 'approved' && (
                      <button className="btn-approve" onClick={() => handleApprove(s._id)}>
                        <i className="fa-solid fa-check"></i> Approve
                      </button>
                    )}
                    {s.status !== 'rejected' && s.status !== 'approved' && (
                      <button className="btn-reject" onClick={() => handleReject(s._id)}>
                        <i className="fa-solid fa-xmark"></i> Reject
                      </button>
                    )}
                    <button className="btn-block" onClick={() => handleToggleBlock(s._id)}>
                      {s.userId?.isBlocked ? 'Unblock' : 'Block'}
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
