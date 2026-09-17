import React, { useEffect, useState } from 'react';
import warehouseApi from '../services/warehouseApi';

export default function WarehouseRiders({ warehouse }) {
  const [riders, setRiders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showOnboardModal, setShowOnboardModal] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [selectedRider, setSelectedRider] = useState(null);
  const [newTempPassword, setNewTempPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Form State
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: 'RiderSecure123!',
    vehicleType: 'Motorcycle',
    vehicleNumber: '',
    drivingLicense: '',
    address: '',
    emergencyName: '',
    emergencyPhone: '',
    emergencyRelation: 'Spouse'
  });

  const fetchRiders = async () => {
    setLoading(true);
    try {
      const { data } = await warehouseApi.get('/warehouses/my-warehouse/riders');
      setRiders(data.riders || []);
    } catch (err) {
      console.error('Failed to load fleet riders', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRiders();
  }, []);

  const handleOnboardSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setSubmitting(true);

    try {
      const payload = {
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        vehicleType: formData.vehicleType,
        vehicleNumber: formData.vehicleNumber,
        drivingLicense: formData.drivingLicense,
        address: formData.address || `${warehouse?.city || 'Local Area'}, ${warehouse?.state || 'AP'}`,
        emergencyContact: {
          name: formData.emergencyName,
          phone: formData.emergencyPhone,
          relation: formData.emergencyRelation
        }
      };

      const { data } = await warehouseApi.post('/warehouses/my-warehouse/riders', payload);
      setSuccessMsg(data.message || 'Delivery rider onboarded successfully!');
      setShowOnboardModal(false);
      setFormData({
        fullName: '',
        email: '',
        phone: '',
        password: 'RiderSecure123!',
        vehicleType: 'Motorcycle',
        vehicleNumber: '',
        drivingLicense: '',
        address: '',
        emergencyName: '',
        emergencyPhone: '',
        emergencyRelation: 'Spouse'
      });
      fetchRiders();
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to onboard delivery rider');
    } finally {
      setSubmitting(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!selectedRider || !newTempPassword) return;

    setSubmitting(true);
    setErrorMsg('');
    try {
      const { data } = await warehouseApi.put(`/warehouses/my-warehouse/riders/${selectedRider._id}/reset-temp-password`, {
        newTempPassword
      });
      alert(data.message || 'Temporary password issued successfully!');
      setShowResetModal(false);
      setSelectedRider(null);
      setNewTempPassword('');
      fetchRiders();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to reset password');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      {/* Top Banner */}
      <div style={{
        background: '#0F172A',
        color: '#FFFFFF',
        borderRadius: '16px',
        padding: '24px 28px',
        marginBottom: '20px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '16px',
        boxShadow: '0 4px 20px rgba(15, 23, 42, 0.12)'
      }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: '#3B82F6', padding: '3px 10px', borderRadius: '20px', fontSize: '0.74rem', fontWeight: '800', marginBottom: '8px' }}>
            <i className="fa-solid fa-motorcycle"></i> FLEET OPERATIONS &amp; ONBOARDING
          </div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: '800', margin: 0 }}>
            {warehouse?.name || 'Warehouse'} Courier Fleet
          </h1>
          <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem', color: '#94A3B8' }}>
            In-person rider onboarding, fleet credential issuance, and courier assignment &bull; {riders.length} Active Couriers
          </p>
        </div>

        <button
          onClick={() => { setShowOnboardModal(true); setErrorMsg(''); setSuccessMsg(''); }}
          style={{
            background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
            color: '#FFFFFF',
            border: 'none',
            padding: '12px 22px',
            borderRadius: '10px',
            fontSize: '0.9rem',
            fontWeight: '700',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            boxShadow: '0 4px 14px rgba(16, 185, 129, 0.35)'
          }}
        >
          <i className="fa-solid fa-user-plus"></i> Onboard New Delivery Rider
        </button>
      </div>

      {/* Strict Privacy Notice */}
      <div style={{
        background: '#EFF6FF',
        border: '1px solid #BFDBFE',
        borderRadius: '12px',
        padding: '14px 20px',
        marginBottom: '24px',
        display: 'flex',
        alignItems: 'flex-start',
        gap: '14px'
      }}>
        <i className="fa-solid fa-shield-halved" style={{ fontSize: '1.4rem', color: '#2563EB', marginTop: '2px' }}></i>
        <div>
          <h4 style={{ margin: 0, fontSize: '0.9rem', fontWeight: '800', color: '#1E3A8A' }}>
            End-to-End Courier Password Privacy &amp; Onboarding Policy
          </h4>
          <p style={{ margin: '4px 0 0 0', fontSize: '0.82rem', color: '#1E40AF', lineHeight: '1.5' }}>
            Delivery agents cannot register online; they must visit this warehouse in-person. The manager issues their <strong>initial temporary credentials</strong>. 
            Once the rider logs into the Delivery Portal, they can update their password and profile. 
            <strong> For privacy and security, the rider's updated password is encrypted and CANNOT be viewed by warehouse managers or system administrators.</strong>
          </p>
        </div>
      </div>

      {successMsg && (
        <div style={{
          background: '#F0FDF4',
          border: '1px solid #86EFAC',
          color: '#166534',
          padding: '14px 18px',
          borderRadius: '10px',
          marginBottom: '20px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          fontSize: '0.88rem'
        }}>
          <i className="fa-solid fa-circle-check" style={{ fontSize: '1.1rem' }}></i>
          <span>{successMsg}</span>
        </div>
      )}

      {/* Fleet Roster Table */}
      <div style={{
        background: '#FFFFFF',
        borderRadius: '14px',
        border: '1px solid #E2E8F0',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
        overflow: 'hidden'
      }}>
        <div style={{
          padding: '16px 20px',
          borderBottom: '1px solid #E2E8F0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{ fontWeight: '800', color: '#0F172A', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <i className="fa-solid fa-users" style={{ color: '#3B82F6' }}></i>
            Registered Hub Delivery Agents ({riders.length})
          </div>
          <button
            onClick={fetchRiders}
            style={{
              background: 'none',
              border: 'none',
              color: '#2563EB',
              fontSize: '0.82rem',
              fontWeight: '700',
              cursor: 'pointer'
            }}
          >
            <i className="fa-solid fa-arrows-rotate"></i> Refresh Roster
          </button>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '50px 0' }}>
            <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: '2rem', color: '#3B82F6' }}></i>
            <p style={{ marginTop: '12px', color: '#64748B' }}>Loading fleet couriers...</p>
          </div>
        ) : riders.length === 0 ? (
          <div style={{ padding: '60px 20px', textAlign: 'center' }}>
            <i className="fa-solid fa-motorcycle" style={{ fontSize: '3rem', color: '#CBD5E1', marginBottom: '14px' }}></i>
            <h3 style={{ margin: 0, color: '#334155' }}>No couriers onboarded yet</h3>
            <p style={{ color: '#94A3B8', fontSize: '0.86rem', marginTop: '6px' }}>
              Click "+ Onboard New Delivery Rider" above to register riders arriving at the hub.
            </p>
          </div>
        ) : (
          <table className="wh-table">
            <thead>
              <tr>
                <th>Rider Profile</th>
                <th>Contact Details</th>
                <th>Vehicle &amp; License</th>
                <th>Duty Status</th>
                <th>Password Security</th>
                <th>Manager Action</th>
              </tr>
            </thead>
            <tbody>
              {riders.map((r) => (
                <tr key={r._id}>
                  {/* Rider Profile */}
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <img
                        src={r.profileImage || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'}
                        alt={r.fullName}
                        style={{
                          width: '44px',
                          height: '44px',
                          borderRadius: '50%',
                          objectFit: 'cover',
                          border: '2px solid #E2E8F0'
                        }}
                      />
                      <div>
                        <div style={{ fontWeight: '800', color: '#0F172A', fontSize: '0.92rem' }}>
                          {r.fullName}
                        </div>
                        <div style={{ fontSize: '0.74rem', color: '#64748B' }}>
                          Onboarded: {new Date(r.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </div>
                        {r.todayDeliveries !== undefined && (
                          <div style={{ fontSize: '0.72rem', color: '#059669', fontWeight: '700' }}>
                            ✓ {r.completedDeliveries || 0} Total Deliveries Done
                          </div>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* Contact */}
                  <td>
                    <div style={{ fontSize: '0.84rem', fontWeight: '700', color: '#1E293B' }}>
                      <i className="fa-solid fa-phone" style={{ color: '#3B82F6', marginRight: '6px', fontSize: '0.78rem' }}></i>
                      {r.phone}
                    </div>
                    <div style={{ fontSize: '0.78rem', color: '#64748B', marginTop: '2px' }}>
                      <i className="fa-solid fa-envelope" style={{ color: '#94A3B8', marginRight: '6px', fontSize: '0.75rem' }}></i>
                      {r.email}
                    </div>
                    {r.emergencyContact?.name && (
                      <div style={{ fontSize: '0.72rem', color: '#94A3B8', marginTop: '3px' }}>
                        Emergency: {r.emergencyContact.name} ({r.emergencyContact.phone})
                      </div>
                    )}
                  </td>

                  {/* Vehicle & License */}
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{
                        background: '#F1F5F9',
                        color: '#0F172A',
                        padding: '2px 8px',
                        borderRadius: '4px',
                        fontWeight: '800',
                        fontSize: '0.78rem',
                        fontFamily: 'monospace'
                      }}>
                        {r.vehicleNumber}
                      </span>
                      <span style={{ fontSize: '0.74rem', color: '#64748B' }}>
                        ({r.vehicleType})
                      </span>
                    </div>
                    <div style={{ fontSize: '0.74rem', color: '#64748B', marginTop: '4px' }}>
                      DL: <strong>{r.drivingLicense}</strong>
                    </div>
                  </td>

                  {/* Duty Status */}
                  <td>
                    <span style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '4px 10px',
                      borderRadius: '12px',
                      fontSize: '0.75rem',
                      fontWeight: '700',
                      background: r.isOnline ? '#DCFCE7' : '#F1F5F9',
                      color: r.isOnline ? '#166534' : '#64748B'
                    }}>
                      <span style={{
                        width: '6px',
                        height: '6px',
                        borderRadius: '50%',
                        background: r.isOnline ? '#16A34A' : '#94A3B8'
                      }}></span>
                      {r.isOnline ? 'On Active Duty' : 'Offline / Standby'}
                    </span>
                  </td>

                  {/* Password Security Status */}
                  <td>
                    {r.mustChangePassword ? (
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '3px 8px',
                        borderRadius: '6px',
                        fontSize: '0.72rem',
                        fontWeight: '700',
                        background: '#FEF3C7',
                        color: '#92400E',
                        border: '1px solid #FDE68A'
                      }}>
                        <i className="fa-solid fa-clock"></i> Temp Password Active
                      </span>
                    ) : (
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '3px 8px',
                        borderRadius: '6px',
                        fontSize: '0.72rem',
                        fontWeight: '700',
                        background: '#F0FDF4',
                        color: '#166534',
                        border: '1px solid #BBF7D0'
                      }}>
                        <i className="fa-solid fa-lock"></i> Secured by Rider
                      </span>
                    )}
                    <div style={{ fontSize: '0.68rem', color: '#94A3B8', marginTop: '3px' }}>
                      Password is encrypted
                    </div>
                  </td>

                  {/* Actions */}
                  <td>
                    <button
                      onClick={() => {
                        setSelectedRider(r);
                        setNewTempPassword('TempPass' + Math.floor(1000 + Math.random() * 9000) + '!');
                        setShowResetModal(true);
                      }}
                      style={{
                        background: '#FFFFFF',
                        border: '1px solid #CBD5E1',
                        borderRadius: '6px',
                        padding: '6px 12px',
                        fontSize: '0.76rem',
                        fontWeight: '700',
                        color: '#334155',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}
                    >
                      <i className="fa-solid fa-key" style={{ color: '#F59E0B' }}></i> Issue Temp Password
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* MODAL 1: ONBOARD NEW RIDER */}
      {showOnboardModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(15, 23, 42, 0.75)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '20px'
        }}>
          <div style={{
            background: '#FFFFFF',
            width: '100%',
            maxWidth: '560px',
            maxHeight: '90vh',
            borderRadius: '16px',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden'
          }}>
            {/* Modal Header */}
            <div style={{
              background: '#0F172A',
              padding: '20px 24px',
              color: '#FFFFFF',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <i className="fa-solid fa-user-plus" style={{ color: '#10B981', fontSize: '1.2rem' }}></i>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: '800' }}>
                    In-Person Rider Fleet Onboarding
                  </h3>
                  <p style={{ margin: '2px 0 0 0', fontSize: '0.76rem', color: '#94A3B8' }}>
                    Register courier &bull; Issue initial temporary credentials
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowOnboardModal(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#94A3B8',
                  fontSize: '1.2rem',
                  cursor: 'pointer'
                }}
              >
                &times;
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleOnboardSubmit} style={{ padding: '24px', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {errorMsg && (
                <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', color: '#DC2626', padding: '10px 14px', borderRadius: '8px', fontSize: '0.82rem' }}>
                  {errorMsg}
                </div>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '700', color: '#334155', marginBottom: '4px' }}>
                    Rider Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Praveen Kumar"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '0.86rem', boxSizing: 'border-box' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '700', color: '#334155', marginBottom: '4px' }}>
                    Phone Number *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="+91 98481 00000"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '0.86rem', boxSizing: 'border-box' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '700', color: '#334155', marginBottom: '4px' }}>
                  Email Address (Login Username) *
                </label>
                <input
                  type="email"
                  required
                  placeholder="e.g. praveen.courier@speedy.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '0.86rem', boxSizing: 'border-box' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '700', color: '#334155', marginBottom: '4px' }}>
                  Initial Temporary Password * (Rider must change upon login)
                </label>
                <input
                  type="text"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '0.86rem', boxSizing: 'border-box', fontFamily: 'monospace', fontWeight: '700' }}
                />
                <span style={{ fontSize: '0.72rem', color: '#64748B' }}>
                  The rider will use this password for their first sign-in and will be prompted to set their private password.
                </span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '700', color: '#334155', marginBottom: '4px' }}>
                    Vehicle Type *
                  </label>
                  <select
                    value={formData.vehicleType}
                    onChange={(e) => setFormData({ ...formData, vehicleType: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '0.86rem', boxSizing: 'border-box' }}
                  >
                    <option value="Motorcycle">Motorcycle / Bike</option>
                    <option value="Scooter">Scooter / Moped</option>
                    <option value="Electric Bike">Electric Bike (EV)</option>
                    <option value="Delivery Van">Delivery Van</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '700', color: '#334155', marginBottom: '4px' }}>
                    Vehicle Registration Plate *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. AP 07 BK 9021"
                    value={formData.vehicleNumber}
                    onChange={(e) => setFormData({ ...formData, vehicleNumber: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '0.86rem', boxSizing: 'border-box', textTransform: 'uppercase' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '700', color: '#334155', marginBottom: '4px' }}>
                  Driving License Number *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. AP07 20210087654"
                  value={formData.drivingLicense}
                  onChange={(e) => setFormData({ ...formData, drivingLicense: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '0.86rem', boxSizing: 'border-box', textTransform: 'uppercase' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '700', color: '#334155', marginBottom: '4px' }}>
                    Emergency Contact Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Ramesh (Father)"
                    value={formData.emergencyName}
                    onChange={(e) => setFormData({ ...formData, emergencyName: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '0.86rem', boxSizing: 'border-box' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '700', color: '#334155', marginBottom: '4px' }}>
                    Emergency Phone Number
                  </label>
                  <input
                    type="text"
                    placeholder="+91 98481 11111"
                    value={formData.emergencyPhone}
                    onChange={(e) => setFormData({ ...formData, emergencyPhone: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '0.86rem', boxSizing: 'border-box' }}
                  />
                </div>
              </div>

              <div style={{
                background: '#F8FAFC',
                border: '1px solid #E2E8F0',
                borderRadius: '8px',
                padding: '10px 14px',
                fontSize: '0.76rem',
                color: '#64748B'
              }}>
                <i className="fa-solid fa-lock" style={{ color: '#10B981', marginRight: '6px' }}></i>
                Assigned Warehouse: <strong>{warehouse?.name}</strong> [{warehouse?.code}]. The rider will be granted immediate access to the Delivery Portal upon creation.
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={() => setShowOnboardModal(false)}
                  style={{
                    background: '#F1F5F9',
                    border: '1px solid #CBD5E1',
                    color: '#475569',
                    padding: '10px 18px',
                    borderRadius: '8px',
                    fontSize: '0.85rem',
                    fontWeight: '700',
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  style={{
                    background: '#10B981',
                    border: 'none',
                    color: '#FFFFFF',
                    padding: '10px 22px',
                    borderRadius: '8px',
                    fontSize: '0.85rem',
                    fontWeight: '700',
                    cursor: submitting ? 'not-allowed' : 'pointer'
                  }}
                >
                  {submitting ? 'Onboarding Rider...' : 'Complete Onboarding & Issue Credentials'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: ISSUE NEW TEMPORARY PASSWORD */}
      {showResetModal && selectedRider && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(15, 23, 42, 0.75)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '20px'
        }}>
          <div style={{
            background: '#FFFFFF',
            width: '100%',
            maxWidth: '460px',
            borderRadius: '16px',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            overflow: 'hidden'
          }}>
            <div style={{
              background: '#0F172A',
              padding: '18px 22px',
              color: '#FFFFFF',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: '800' }}>
                Issue New Temporary Password
              </h3>
              <button onClick={() => setShowResetModal(false)} style={{ background: 'none', border: 'none', color: '#94A3B8', fontSize: '1.2rem', cursor: 'pointer' }}>
                &times;
              </button>
            </div>

            <form onSubmit={handleResetPassword} style={{ padding: '22px' }}>
              <p style={{ fontSize: '0.84rem', color: '#475569', marginTop: 0 }}>
                Resetting password for: <strong>{selectedRider.fullName}</strong> ({selectedRider.email})
              </p>

              <div style={{
                background: '#FEF3C7',
                border: '1px solid #FDE68A',
                borderRadius: '8px',
                padding: '10px 14px',
                fontSize: '0.78rem',
                color: '#92400E',
                marginBottom: '16px'
              }}>
                <i className="fa-solid fa-triangle-exclamation" style={{ marginRight: '6px' }}></i>
                You cannot view the rider's current password. Entering a new temporary password will overwrite it and require the rider to change it on their next login.
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>
                  New Temporary Password (min 6 chars)
                </label>
                <input
                  type="text"
                  required
                  value={newTempPassword}
                  onChange={(e) => setNewTempPassword(e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '0.9rem', fontFamily: 'monospace', fontWeight: '700', boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => setShowResetModal(false)}
                  style={{ background: '#F1F5F9', border: '1px solid #CBD5E1', color: '#475569', padding: '8px 16px', borderRadius: '6px', fontSize: '0.84rem', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  style={{ background: '#2563EB', border: 'none', color: '#FFFFFF', padding: '8px 18px', borderRadius: '6px', fontSize: '0.84rem', fontWeight: '700', cursor: 'pointer' }}
                >
                  {submitting ? 'Updating...' : 'Issue Temporary Password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
