import React, { useEffect, useState } from 'react';
import adminApi, { formatINR } from '../services/adminApi';

export default function AdminDeliveryAgents() {
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAgents = () => {
    adminApi.get('/admin/delivery-agents')
      .then(({ data }) => setAgents(data.agents || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchAgents();
  }, []);

  const handleApprove = async (id) => {
    try {
      await adminApi.put(`/admin/delivery-agents/${id}/approve`);
      alert('🎉 Delivery agent approved! They can now go on duty & receive delivery radar requests.');
      fetchAgents();
    } catch (err) {
      alert('Failed to approve delivery agent');
    }
  };

  const handleReject = async (id) => {
    try {
      await adminApi.put(`/admin/delivery-agents/${id}/reject`);
      alert('Delivery agent rejected.');
      fetchAgents();
    } catch (err) {
      alert('Failed to reject delivery agent');
    }
  };

  const handleToggleBlock = async (id) => {
    try {
      const { data } = await adminApi.put(`/admin/delivery-agents/${id}/block`);
      alert(data.message);
      fetchAgents();
    } catch (err) {
      alert('Failed to toggle block status');
    }
  };

  return (
    <div>
      <div className="admin-top-header">
        <div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: '800' }}>Delivery Fleet &amp; Driver KYC</h1>
          <p style={{ color: '#64748B', fontSize: '0.88rem' }}>Verify vehicle registration, license numbers and manage delivery dispatch permissions</p>
        </div>
      </div>

      {loading ? (
        <p>Loading fleet records...</p>
      ) : agents.length === 0 ? (
        <p>No delivery agents registered yet.</p>
      ) : (
        <table className="data-table">
          <thead>
            <tr>
              <th>Agent Name</th>
              <th>Vehicle Type &amp; Plate</th>
              <th>Driving License</th>
              <th>Duty Status</th>
              <th>KYC Status</th>
              <th>Earnings (₹)</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {agents.map(a => (
              <tr key={a._id}>
                <td>
                  <strong>{a.fullName}</strong><br />
                  <span style={{ fontSize: '0.75rem', color: '#64748B' }}>{a.phone} &bull; {a.email}</span>
                </td>
                <td>
                  <strong>{a.vehicleType}</strong><br />
                  <span style={{ fontSize: '0.75rem', color: '#3B82F6' }}>{a.vehicleNumber}</span>
                </td>
                <td><code style={{ background: '#f1f5f9', padding: '2px 6px', borderRadius: '4px' }}>{a.drivingLicense}</code></td>
                <td>
                  <span style={{ color: a.isOnline ? '#10B981' : '#64748B', fontWeight: '700', fontSize: '0.8rem' }}>
                    <i className="fa-solid fa-circle" style={{ fontSize: '0.6rem', marginRight: '4px' }}></i>
                    {a.isOnline ? 'ONLINE' : 'OFFLINE'}
                  </span>
                </td>
                <td>
                  <span style={{
                    background: a.status === 'approved' ? '#e7f4e8' : a.status === 'rejected' ? '#fee2e2' : '#fef3c7',
                    color: a.status === 'approved' ? '#2e7d32' : a.status === 'rejected' ? '#dc2626' : '#d97706',
                    padding: '3px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase'
                  }}>
                    {a.status}
                  </span>
                </td>
                <td><strong style={{ color: '#10B981' }}>{formatINR(a.totalEarnings)}</strong></td>
                <td>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    {a.status !== 'approved' && (
                      <button className="btn-approve" onClick={() => handleApprove(a._id)}>
                        <i className="fa-solid fa-check"></i> Approve
                      </button>
                    )}
                    {a.status !== 'rejected' && a.status !== 'approved' && (
                      <button className="btn-reject" onClick={() => handleReject(a._id)}>
                        <i className="fa-solid fa-xmark"></i> Reject
                      </button>
                    )}
                    <button className="btn-block" onClick={() => handleToggleBlock(a._id)}>
                      {a.userId?.isBlocked ? 'Unblock' : 'Block'}
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
