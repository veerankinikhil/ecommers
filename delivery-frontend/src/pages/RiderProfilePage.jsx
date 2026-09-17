import React, { useState, useEffect } from 'react';
import deliveryApi from '../services/deliveryApi';
import { useDeliveryAuth } from '../context/DeliveryAuthContext';

export default function RiderProfilePage() {
  const { agentUser } = useDeliveryAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('profile'); // 'profile' | 'security' | 'fleet'

  // Profile Form State
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [profileImage, setProfileImage] = useState('');
  const [emergencyName, setEmergencyName] = useState('');
  const [emergencyPhone, setEmergencyPhone] = useState('');
  const [emergencyRelation, setEmergencyRelation] = useState('');
  const [updatingProfile, setUpdatingProfile] = useState(false);
  const [profileMsg, setProfileMsg] = useState({ type: '', text: '' });

  // Password Form State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [updatingPassword, setUpdatingPassword] = useState(false);
  const [passwordMsg, setPasswordMsg] = useState({ type: '', text: '' });

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const { data } = await deliveryApi.get('/delivery/profile');
      if (data.profile) {
        setProfile(data.profile);
        setFullName(data.profile.fullName || '');
        setPhone(data.profile.phone || '');
        setAddress(data.profile.address || '');
        setProfileImage(data.profile.profileImage || '');
        setEmergencyName(data.profile.emergencyContact?.name || '');
        setEmergencyPhone(data.profile.emergencyContact?.phone || '');
        setEmergencyRelation(data.profile.emergencyContact?.relation || '');
      }
    } catch (err) {
      console.error('Failed to load profile', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setProfileMsg({ type: '', text: '' });
    setUpdatingProfile(true);

    try {
      const { data } = await deliveryApi.put('/delivery/profile', {
        fullName,
        phone,
        address,
        profileImage,
        emergencyContact: {
          name: emergencyName,
          phone: emergencyPhone,
          relation: emergencyRelation
        }
      });
      setProfileMsg({ type: 'success', text: data.message || 'Profile updated successfully!' });
      fetchProfile();
    } catch (err) {
      setProfileMsg({ type: 'error', text: err.response?.data?.message || 'Failed to update profile.' });
    } finally {
      setUpdatingProfile(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPasswordMsg({ type: '', text: '' });

    if (newPassword !== confirmPassword) {
      setPasswordMsg({ type: 'error', text: 'New passwords do not match. Please check and retype.' });
      return;
    }

    if (newPassword.length < 6) {
      setPasswordMsg({ type: 'error', text: 'New password must be at least 6 characters long.' });
      return;
    }

    setUpdatingPassword(true);
    try {
      const { data } = await deliveryApi.put('/delivery/change-password', {
        currentPassword,
        newPassword
      });
      setPasswordMsg({ type: 'success', text: data.message || 'Password changed successfully! Your account is now private and secure.' });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      fetchProfile();
    } catch (err) {
      setPasswordMsg({ type: 'error', text: err.response?.data?.message || 'Failed to change password. Please check your current password.' });
    } finally {
      setUpdatingPassword(false);
    }
  };

  if (loading) {
    return (
      <div className="delivery-container" style={{ padding: '60px 20px', textAlign: 'center' }}>
        <i className="fa-solid fa-circle-notch fa-spin" style={{ fontSize: '2rem', color: 'var(--agent-primary)' }}></i>
        <p style={{ marginTop: '12px', color: '#64748B' }}>Loading courier profile &amp; security data...</p>
      </div>
    );
  }

  return (
    <main className="delivery-container" style={{ padding: '16px 12px 28px 12px' }}>
      <div>
        
        {/* Profile Identity Card */}
        <div style={{
          background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)',
          borderRadius: '16px',
          padding: '20px 16px',
          color: '#FFFFFF',
          marginBottom: '20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '14px',
          boxShadow: '0 4px 20px rgba(15, 23, 42, 0.15)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <img
              src={profile?.profileImage || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'}
              alt={profile?.fullName}
              style={{
                width: '74px',
                height: '74px',
                borderRadius: '50%',
                objectFit: 'cover',
                border: '3px solid #10B981',
                boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)'
              }}
            />
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                <h1 style={{ fontSize: '1.5rem', fontWeight: '800', margin: 0 }}>
                  {profile?.fullName || 'Courier Agent'}
                </h1>
                <span style={{
                  background: '#10B981',
                  color: '#FFFFFF',
                  fontSize: '0.7rem',
                  fontWeight: '800',
                  padding: '2px 8px',
                  borderRadius: '12px'
                }}>
                  VERIFIED FLEET
                </span>
              </div>
              <div style={{ fontSize: '0.84rem', color: '#94A3B8', display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
                <span><i className="fa-solid fa-envelope"></i> {profile?.email}</span>
                <span><i className="fa-solid fa-phone"></i> {profile?.phone}</span>
                <span><i className="fa-solid fa-motorcycle"></i> {profile?.vehicleNumber}</span>
              </div>
            </div>
          </div>

          <div style={{ textAlign: 'right' }}>
            <div style={{
              background: 'rgba(59, 130, 246, 0.15)',
              border: '1px solid rgba(59, 130, 246, 0.3)',
              padding: '6px 14px',
              borderRadius: '8px',
              fontSize: '0.78rem',
              color: '#93C5FD',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px'
            }}>
              <i className="fa-solid fa-warehouse"></i>
              <span>Hub: <strong>{profile?.assignedWarehouse?.name || 'Guntur Regional Hub'}</strong></span>
            </div>
            {profile?.mustChangePassword && (
              <div style={{
                marginTop: '8px',
                background: '#FEF3C7',
                color: '#92400E',
                fontSize: '0.72rem',
                fontWeight: '800',
                padding: '3px 8px',
                borderRadius: '4px'
              }}>
                ⚠️ Temporary Password Active &bull; Please update
              </div>
            )}
          </div>
        </div>

        {/* Tab Navigation */}
        <div style={{
          display: 'flex',
          borderBottom: '2px solid #E2E8F0',
          marginBottom: '24px',
          gap: '8px'
        }}>
          <button
            onClick={() => setActiveTab('profile')}
            style={{
              padding: '12px 18px',
              background: 'none',
              border: 'none',
              borderBottom: activeTab === 'profile' ? '3px solid #10B981' : '3px solid transparent',
              color: activeTab === 'profile' ? '#0F172A' : '#64748B',
              fontWeight: activeTab === 'profile' ? '800' : '600',
              cursor: 'pointer',
              fontSize: '0.92rem',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <i className="fa-solid fa-id-card"></i> Profile Information
          </button>
          <button
            onClick={() => setActiveTab('security')}
            style={{
              padding: '12px 18px',
              background: 'none',
              border: 'none',
              borderBottom: activeTab === 'security' ? '3px solid #10B981' : '3px solid transparent',
              color: activeTab === 'security' ? '#0F172A' : '#64748B',
              fontWeight: activeTab === 'security' ? '800' : '600',
              cursor: 'pointer',
              fontSize: '0.92rem',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <i className="fa-solid fa-lock"></i> Security &amp; Password Update
            {profile?.mustChangePassword && (
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#EF4444' }}></span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('fleet')}
            style={{
              padding: '12px 18px',
              background: 'none',
              border: 'none',
              borderBottom: activeTab === 'fleet' ? '3px solid #10B981' : '3px solid transparent',
              color: activeTab === 'fleet' ? '#0F172A' : '#64748B',
              fontWeight: activeTab === 'fleet' ? '800' : '600',
              cursor: 'pointer',
              fontSize: '0.92rem',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <i className="fa-solid fa-truck-fast"></i> Fleet &amp; License Details
          </button>
        </div>

        {/* TAB 1: PROFILE INFORMATION */}
        {activeTab === 'profile' && (
          <div style={{ background: '#FFFFFF', borderRadius: '14px', border: '1px solid #E2E8F0', padding: '28px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
            <h2 style={{ fontSize: '1.2rem', fontWeight: '800', color: '#1E293B', marginBottom: '4px' }}>
              Personal &amp; Contact Information
            </h2>
            <p style={{ fontSize: '0.84rem', color: '#64748B', margin: '0 0 20px 0' }}>
              Keep your profile and emergency contact information up to date.
            </p>

            {profileMsg.text && (
              <div style={{
                background: profileMsg.type === 'success' ? '#F0FDF4' : '#FEF2F2',
                border: `1px solid ${profileMsg.type === 'success' ? '#86EFAC' : '#FECACA'}`,
                color: profileMsg.type === 'success' ? '#166534' : '#DC2626',
                padding: '12px 16px',
                borderRadius: '8px',
                fontSize: '0.86rem',
                marginBottom: '20px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <i className={`fa-solid ${profileMsg.type === 'success' ? 'fa-circle-check' : 'fa-circle-exclamation'}`}></i>
                <span>{profileMsg.text}</span>
              </div>
            )}

            <form onSubmit={handleUpdateProfile} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>
                    Full Legal Name
                  </label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.9rem', boxSizing: 'border-box' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>
                    Registered Mobile Phone
                  </label>
                  <input
                    type="text"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.9rem', boxSizing: 'border-box' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>
                  Profile Photo URL / Avatar
                </label>
                <input
                  type="text"
                  placeholder="https://..."
                  value={profileImage}
                  onChange={(e) => setProfileImage(e.target.value)}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.9rem', boxSizing: 'border-box' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>
                  Residential Address / Home Base
                </label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.9rem', boxSizing: 'border-box' }}
                />
              </div>

              {/* Emergency Contact */}
              <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '10px', padding: '16px' }}>
                <h4 style={{ fontSize: '0.88rem', fontWeight: '800', color: '#1E293B', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <i className="fa-solid fa-phone-volume" style={{ color: '#EF4444' }}></i> Emergency Contact Details
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: '700', color: '#64748B', marginBottom: '4px' }}>
                      Contact Name
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Ramesh"
                      value={emergencyName}
                      onChange={(e) => setEmergencyName(e.target.value)}
                      style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '0.84rem', boxSizing: 'border-box' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: '700', color: '#64748B', marginBottom: '4px' }}>
                      Contact Phone
                    </label>
                    <input
                      type="text"
                      placeholder="+91 98481 00000"
                      value={emergencyPhone}
                      onChange={(e) => setEmergencyPhone(e.target.value)}
                      style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '0.84rem', boxSizing: 'border-box' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: '700', color: '#64748B', marginBottom: '4px' }}>
                      Relationship
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Brother / Spouse"
                      value={emergencyRelation}
                      onChange={(e) => setEmergencyRelation(e.target.value)}
                      style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '0.84rem', boxSizing: 'border-box' }}
                    />
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '6px' }}>
                <button
                  type="submit"
                  disabled={updatingProfile}
                  className="btn-agent btn-agent-primary"
                  style={{ padding: '12px 26px', fontSize: '0.92rem', fontWeight: '700' }}
                >
                  {updatingProfile ? 'Saving Details...' : 'Save Profile Changes'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* TAB 2: SECURITY & PASSWORD UPDATE */}
        {activeTab === 'security' && (
          <div style={{ background: '#FFFFFF', borderRadius: '14px', border: '1px solid #E2E8F0', padding: '28px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
            
            {/* End-to-End Privacy Guarantee Notice */}
            <div style={{
              background: '#F0FDF4',
              border: '1px solid #BBF7D0',
              borderRadius: '12px',
              padding: '16px 20px',
              marginBottom: '24px',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '14px'
            }}>
              <i className="fa-solid fa-lock" style={{ fontSize: '1.4rem', color: '#16A34A', marginTop: '2px' }}></i>
              <div>
                <h3 style={{ margin: 0, fontSize: '0.96rem', fontWeight: '800', color: '#166534' }}>
                  🔒 Cryptographic Privacy &amp; Credential Protection
                </h3>
                <p style={{ margin: '4px 0 0 0', fontSize: '0.84rem', color: '#15803D', lineHeight: '1.5' }}>
                  When you update your password here, it is encrypted end-to-end using strong bcrypt cryptographic hashing. 
                  <strong> The Warehouse Manager, facility staff, and administrators CANNOT see or read your updated password.</strong> 
                  Your account credentials belong exclusively to you.
                </p>
              </div>
            </div>

            <h2 style={{ fontSize: '1.2rem', fontWeight: '800', color: '#1E293B', marginBottom: '4px' }}>
              Change Account Password
            </h2>
            <p style={{ fontSize: '0.84rem', color: '#64748B', margin: '0 0 20px 0' }}>
              Update your temporary initial password to a permanent secure password.
            </p>

            {passwordMsg.text && (
              <div style={{
                background: passwordMsg.type === 'success' ? '#F0FDF4' : '#FEF2F2',
                border: `1px solid ${passwordMsg.type === 'success' ? '#86EFAC' : '#FECACA'}`,
                color: passwordMsg.type === 'success' ? '#166534' : '#DC2626',
                padding: '12px 16px',
                borderRadius: '8px',
                fontSize: '0.86rem',
                marginBottom: '20px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <i className={`fa-solid ${passwordMsg.type === 'success' ? 'fa-circle-check' : 'fa-circle-exclamation'}`}></i>
                <span>{passwordMsg.text}</span>
              </div>
            )}

            <form onSubmit={handleChangePassword} style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '480px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>
                  Current / Temporary Password *
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showCurrent ? 'text' : 'password'}
                    required
                    placeholder="Enter current or temporary password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    style={{ width: '100%', padding: '10px 42px 10px 14px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.9rem', boxSizing: 'border-box' }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrent(!showCurrent)}
                    style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer' }}
                  >
                    <i className={`fa-solid ${showCurrent ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                  </button>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>
                  New Secure Password * (min 6 characters)
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showNew ? 'text' : 'password'}
                    required
                    placeholder="Enter new private password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    style={{ width: '100%', padding: '10px 42px 10px 14px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.9rem', boxSizing: 'border-box' }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowNew(!showNew)}
                    style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer' }}
                  >
                    <i className={`fa-solid ${showNew ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                  </button>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>
                  Confirm New Password *
                </label>
                <input
                  type="password"
                  required
                  placeholder="Re-type new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.9rem', boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ marginTop: '10px' }}>
                <button
                  type="submit"
                  disabled={updatingPassword}
                  className="btn-agent btn-agent-primary"
                  style={{ padding: '12px 26px', fontSize: '0.92rem', fontWeight: '700' }}
                >
                  {updatingPassword ? 'Encrypting & Updating...' : 'Update & Encrypt Password'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* TAB 3: FLEET & LICENSE DETAILS */}
        {activeTab === 'fleet' && (
          <div style={{ background: '#FFFFFF', borderRadius: '14px', border: '1px solid #E2E8F0', padding: '28px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
            <h2 style={{ fontSize: '1.2rem', fontWeight: '800', color: '#1E293B', marginBottom: '4px' }}>
              Fleet Assignment &amp; Regulatory Verification
            </h2>
            <p style={{ fontSize: '0.84rem', color: '#64748B', margin: '0 0 20px 0' }}>
              These records were verified by your Warehouse Facility Manager during onboarding.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
              <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', padding: '16px', borderRadius: '10px' }}>
                <div style={{ fontSize: '0.74rem', color: '#64748B', fontWeight: '700', textTransform: 'uppercase' }}>Assigned Warehouse Hub</div>
                <div style={{ fontSize: '1.05rem', fontWeight: '800', color: '#0F172A', marginTop: '4px' }}>
                  {profile?.assignedWarehouse?.name || 'Guntur Regional Hub'}
                </div>
                <div style={{ fontSize: '0.78rem', color: '#2563EB', fontWeight: '700', marginTop: '2px' }}>
                  Code: [{profile?.assignedWarehouse?.code || 'WH-AP-GNT01'}]
                </div>
              </div>

              <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', padding: '16px', borderRadius: '10px' }}>
                <div style={{ fontSize: '0.74rem', color: '#64748B', fontWeight: '700', textTransform: 'uppercase' }}>Assigned Vehicle</div>
                <div style={{ fontSize: '1.05rem', fontWeight: '800', color: '#0F172A', marginTop: '4px' }}>
                  {profile?.vehicleNumber || 'AP 07 BK 9021'}
                </div>
                <div style={{ fontSize: '0.78rem', color: '#475569', marginTop: '2px' }}>
                  Vehicle Class: <strong>{profile?.vehicleType || 'Motorcycle'}</strong>
                </div>
              </div>

              <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', padding: '16px', borderRadius: '10px' }}>
                <div style={{ fontSize: '0.74rem', color: '#64748B', fontWeight: '700', textTransform: 'uppercase' }}>Driving License (DL)</div>
                <div style={{ fontSize: '1.05rem', fontWeight: '800', color: '#0F172A', marginTop: '4px' }}>
                  {profile?.drivingLicense || 'AP07 20210087654'}
                </div>
                <div style={{ fontSize: '0.78rem', color: '#16A34A', fontWeight: '700', marginTop: '2px' }}>
                  ✓ In-Person Verified by Manager
                </div>
              </div>

              <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', padding: '16px', borderRadius: '10px' }}>
                <div style={{ fontSize: '0.74rem', color: '#64748B', fontWeight: '700', textTransform: 'uppercase' }}>Route Delivery Capacity</div>
                <div style={{ fontSize: '1.05rem', fontWeight: '800', color: '#0F172A', marginTop: '4px' }}>
                  Up to 10 Multi-Stop Orders
                </div>
                <div style={{ fontSize: '0.78rem', color: '#475569', marginTop: '2px' }}>
                  Nearest-Neighbor Area-Wise Sequencing
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </main>
  );
}
