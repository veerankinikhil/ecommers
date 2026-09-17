import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWarehouseAuth } from '../context/WarehouseAuthContext';
import warehouseApi from '../services/warehouseApi';

export default function WarehouseLogin() {
  const { login } = useWarehouseAuth();
  const navigate = useNavigate();

  // Inputs start completely empty - NO automated autofilling of credentials!
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Warehouse Dropdown & Search state
  const [warehouses, setWarehouses] = useState([]);
  const [selectedWarehouse, setSelectedWarehouse] = useState(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [loadingWh, setLoadingWh] = useState(false);
  const dropdownRef = useRef(null);

  // Fetch all active warehouses for the dropdown selector
  useEffect(() => {
    setLoadingWh(true);
    warehouseApi.get('/warehouses')
      .then(({ data }) => {
        if (data.warehouses && data.warehouses.length > 0) {
          setWarehouses(data.warehouses);
        }
      })
      .catch((err) => {
        console.error('Error fetching warehouses:', err);
      })
      .finally(() => setLoadingWh(false));
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectWarehouse = (wh) => {
    setSelectedWarehouse(wh);
    // When a warehouse is chosen from dropdown, set the manager's official email
    // but leave the password strictly empty for the manager to enter manually.
    if (wh.manager?.email) {
      setEmail(wh.manager.email);
    }
    setIsDropdownOpen(false);
    setSearchQuery('');
  };

  const handleClearWarehouse = (e) => {
    e.stopPropagation();
    setSelectedWarehouse(null);
    setEmail('');
    setPassword('');
  };

  const filteredWarehouses = warehouses.filter((wh) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    const matchName = wh.name?.toLowerCase().includes(q);
    const matchCode = wh.code?.toLowerCase().includes(q);
    const matchCity = wh.city?.toLowerCase().includes(q);
    const matchState = wh.state?.toLowerCase().includes(q);
    const matchManager = wh.manager?.name?.toLowerCase().includes(q);
    return matchName || matchCode || matchCity || matchState || matchManager;
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !password) {
      setError('Please provide both your manager corporate email and terminal password.');
      return;
    }

    setLoading(true);
    try {
      await login(email.trim(), password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Invalid manager credentials. Please check your password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'radial-gradient(ellipse at top, #1E293B 0%, #0F172A 50%, #020617 100%)',
      padding: '24px',
      position: 'relative',
      fontFamily: "'Inter', system-ui, -apple-system, sans-serif"
    }}>
      {/* Ambient background glow */}
      <div style={{
        position: 'absolute',
        width: '600px',
        height: '600px',
        background: 'radial-gradient(circle, rgba(59, 130, 246, 0.08) 0%, transparent 70%)',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        pointerEvents: 'none'
      }}></div>

      <div style={{
        position: 'relative',
        zIndex: 1,
        width: '100%',
        maxWidth: '480px',
        background: 'rgba(15, 23, 42, 0.85)',
        backdropFilter: 'blur(16px)',
        border: '1px solid rgba(255, 255, 255, 0.12)',
        borderRadius: '20px',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(255, 255, 255, 0.05)',
        overflow: 'hidden'
      }}>
        {/* Terminal Header */}
        <div style={{
          padding: '32px 32px 20px 32px',
          textAlign: 'center',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)'
        }}>
          <div style={{
            width: '52px',
            height: '52px',
            borderRadius: '14px',
            background: 'linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.5rem',
            color: '#FFFFFF',
            margin: '0 auto 14px auto',
            boxShadow: '0 8px 20px -4px rgba(59, 130, 246, 0.5)'
          }}>
            <i className="fa-solid fa-warehouse"></i>
          </div>
          <h1 style={{ fontSize: '1.4rem', fontWeight: '800', color: '#FFFFFF', margin: 0, letterSpacing: '-0.02em' }}>
            Warehouse Terminal Access
          </h1>
          <p style={{ color: '#94A3B8', fontSize: '0.82rem', margin: '6px 0 0 0', lineHeight: '1.4' }}>
            NovaKart Central Logistics Operating System (AP &amp; TS)
          </p>
        </div>

        {/* Security Alert: Personnel Only */}
        <div style={{
          background: 'rgba(245, 158, 11, 0.1)',
          borderBottom: '1px solid rgba(245, 158, 11, 0.2)',
          padding: '10px 24px',
          fontSize: '0.76rem',
          color: '#FCD34D',
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          <i className="fa-solid fa-shield-halved" style={{ fontSize: '0.86rem', flexShrink: 0, color: '#F59E0B' }}></i>
          <span>
            <strong>Official Personnel:</strong> Select your facility and sign in with your admin-issued credentials.
          </span>
        </div>

        {/* Form Body */}
        <div style={{ padding: '26px 32px' }}>
          {error && (
            <div style={{
              background: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              color: '#FCA5A5',
              padding: '12px 16px',
              borderRadius: '10px',
              fontSize: '0.84rem',
              marginBottom: '20px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}>
              <i className="fa-solid fa-circle-exclamation"></i>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            
            {/* 1. SEARCHABLE WAREHOUSE DROPDOWN SELECTOR */}
            <div ref={dropdownRef} style={{ position: 'relative' }}>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '600', color: '#E2E8F0', marginBottom: '6px' }}>
                Select Assigned Warehouse Facility
              </label>

              {/* Dropdown Trigger Box */}
              <div
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: '10px',
                  background: 'rgba(30, 41, 59, 0.7)',
                  border: isDropdownOpen ? '1px solid #3B82F6' : '1px solid rgba(255, 255, 255, 0.15)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  boxSizing: 'border-box',
                  transition: 'all 0.2s'
                }}
              >
                {selectedWarehouse ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', overflow: 'hidden' }}>
                    <span style={{
                      background: selectedWarehouse.state === 'Andhra Pradesh' ? '#065F46' : '#92400E',
                      color: '#FFFFFF',
                      fontSize: '0.68rem',
                      fontWeight: '800',
                      padding: '2px 6px',
                      borderRadius: '4px'
                    }}>
                      {selectedWarehouse.state === 'Andhra Pradesh' ? 'AP' : 'TS'}
                    </span>
                    <div style={{ overflow: 'hidden' }}>
                      <div style={{ fontWeight: '700', fontSize: '0.86rem', color: '#FFFFFF', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {selectedWarehouse.name}
                      </div>
                      <div style={{ fontSize: '0.72rem', color: '#94A3B8' }}>
                        [{selectedWarehouse.code}] &bull; {selectedWarehouse.city}
                      </div>
                    </div>
                  </div>
                ) : (
                  <span style={{ color: '#94A3B8', fontSize: '0.86rem' }}>
                    {loadingWh ? 'Loading warehouse facilities...' : 'Choose warehouse hub or branch...'}
                  </span>
                )}

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {selectedWarehouse && (
                    <button
                      type="button"
                      onClick={handleClearWarehouse}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: '#94A3B8',
                        cursor: 'pointer',
                        padding: '2px 6px',
                        fontSize: '0.85rem'
                      }}
                      title="Clear selection"
                    >
                      <i className="fa-solid fa-xmark"></i>
                    </button>
                  )}
                  <i className={`fa-solid fa-chevron-${isDropdownOpen ? 'up' : 'down'}`} style={{ color: '#64748B', fontSize: '0.8rem' }}></i>
                </div>
              </div>

              {/* Searchable Dropdown Popup Menu */}
              {isDropdownOpen && (
                <div style={{
                  position: 'absolute',
                  top: 'calc(100% + 6px)',
                  left: 0,
                  right: 0,
                  background: '#0F172A',
                  border: '1px solid rgba(59, 130, 246, 0.4)',
                  borderRadius: '12px',
                  boxShadow: '0 20px 40px rgba(0, 0, 0, 0.6)',
                  zIndex: 9999,
                  maxHeight: '300px',
                  display: 'flex',
                  flexDirection: 'column',
                  overflow: 'hidden'
                }}>
                  {/* Search Bar Input */}
                  <div style={{
                    padding: '10px',
                    borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                    background: '#1E293B',
                    position: 'sticky',
                    top: 0,
                    zIndex: 2
                  }}>
                    <div style={{ position: 'relative' }}>
                      <i className="fa-solid fa-magnifying-glass" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8', fontSize: '0.78rem' }}></i>
                      <input
                        type="text"
                        placeholder="Search by hub name, city, or code (e.g. Guntur, Tenali)..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        autoFocus
                        style={{
                          width: '100%',
                          padding: '8px 10px 8px 30px',
                          borderRadius: '6px',
                          background: '#0F172A',
                          border: '1px solid rgba(255, 255, 255, 0.2)',
                          color: '#FFFFFF',
                          fontSize: '0.8rem',
                          outline: 'none',
                          boxSizing: 'border-box'
                        }}
                      />
                    </div>
                  </div>

                  {/* Warehouses Filtered List */}
                  <div style={{ overflowY: 'auto', flex: 1, padding: '4px' }}>
                    {filteredWarehouses.length === 0 ? (
                      <div style={{ padding: '16px', textAlign: 'center', color: '#94A3B8', fontSize: '0.8rem' }}>
                        No warehouse found matching "{searchQuery}"
                      </div>
                    ) : (
                      filteredWarehouses.map((wh) => {
                        const isSelected = selectedWarehouse?.code === wh.code;
                        return (
                          <div
                            key={wh.code || wh._id}
                            onClick={() => handleSelectWarehouse(wh)}
                            style={{
                              padding: '10px 12px',
                              borderRadius: '8px',
                              cursor: 'pointer',
                              background: isSelected ? 'rgba(59, 130, 246, 0.2)' : 'transparent',
                              borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
                              transition: 'background 0.15s'
                            }}
                            onMouseEnter={(e) => { if (!isSelected) e.currentTarget.style.background = 'rgba(255, 255, 255, 0.06)'; }}
                            onMouseLeave={(e) => { if (!isSelected) e.currentTarget.style.background = 'transparent'; }}
                          >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <span style={{ fontWeight: '700', fontSize: '0.85rem', color: '#FFFFFF' }}>
                                {wh.name}
                              </span>
                              <span style={{
                                fontSize: '0.66rem',
                                fontWeight: '800',
                                padding: '1px 5px',
                                borderRadius: '4px',
                                background: wh.state === 'Andhra Pradesh' ? '#065F46' : '#92400E',
                                color: '#FFFFFF'
                              }}>
                                {wh.state === 'Andhra Pradesh' ? 'AP' : 'TS'}
                              </span>
                            </div>
                            <div style={{ fontSize: '0.74rem', color: '#94A3B8', marginTop: '3px', display: 'flex', justifyContent: 'space-between' }}>
                              <span>[{wh.code}] &bull; {wh.city}</span>
                              <span style={{ color: '#60A5FA' }}>Mgr: {wh.manager?.name}</span>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* 2. MANAGER EMAIL */}
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '600', color: '#E2E8F0', marginBottom: '6px' }}>
                Manager Corporate Email
              </label>
              <div style={{ position: 'relative' }}>
                <i className="fa-solid fa-envelope" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#64748B', fontSize: '0.9rem' }}></i>
                <input
                  type="email"
                  required
                  placeholder="manager@novacart.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px 14px 12px 42px',
                    borderRadius: '10px',
                    background: 'rgba(30, 41, 59, 0.7)',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    color: '#FFFFFF',
                    fontSize: '0.92rem',
                    outline: 'none',
                    boxSizing: 'border-box',
                    transition: 'border-color 0.2s'
                  }}
                  onFocus={(e) => { e.currentTarget.style.borderColor = '#3B82F6'; }}
                  onBlur={(e) => { e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.15)'; }}
                />
              </div>
            </div>

            {/* 3. TERMINAL PASSWORD - NEVER AUTO-FILLED */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <label style={{ fontSize: '0.82rem', fontWeight: '600', color: '#E2E8F0' }}>
                  Terminal Security Password
                </label>
                <span style={{ fontSize: '0.72rem', color: '#64748B' }}>
                  Enter manually
                </span>
              </div>
              <div style={{ position: 'relative' }}>
                <i className="fa-solid fa-lock" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#64748B', fontSize: '0.9rem' }}></i>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="Enter your security password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px 42px 12px 42px',
                    borderRadius: '10px',
                    background: 'rgba(30, 41, 59, 0.7)',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    color: '#FFFFFF',
                    fontSize: '0.92rem',
                    outline: 'none',
                    boxSizing: 'border-box',
                    transition: 'border-color 0.2s'
                  }}
                  onFocus={(e) => { e.currentTarget.style.borderColor = '#3B82F6'; }}
                  onBlur={(e) => { e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.15)'; }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '14px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'transparent',
                    border: 'none',
                    color: '#64748B',
                    cursor: 'pointer',
                    fontSize: '0.9rem'
                  }}
                >
                  <i className={`fa-solid ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                </button>
              </div>
            </div>

            {/* Biometric & Bank Verification Security Notice */}
            <div style={{
              background: 'rgba(16, 185, 129, 0.08)',
              border: '1px solid rgba(16, 185, 129, 0.25)',
              borderRadius: '10px',
              padding: '12px 14px',
              marginBottom: '18px',
              fontSize: '0.78rem',
              color: '#A7F3D0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <i className="fa-solid fa-fingerprint" style={{ color: '#10B981', fontSize: '1.1rem' }}></i>
                <div>
                  <strong>Biometric Security & Bank Routing:</strong>
                  <div style={{ color: '#94A3B8', fontSize: '0.72rem', marginTop: '1px' }}>
                    Face Auth & Fingerprint ready for v2 enrollment &bull; NEFT Salary Linked
                  </div>
                </div>
              </div>
              <span style={{ background: '#065F46', color: '#6EE7B7', padding: '2px 8px', borderRadius: '6px', fontSize: '0.68rem', fontWeight: '800' }}>
                ACTIVE
              </span>
            </div>

            {/* Sign In Button */}
            <button
              type="submit"
              disabled={loading}
              style={{
                background: 'linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)',
                color: '#FFFFFF',
                border: 'none',
                padding: '14px',
                borderRadius: '10px',
                fontSize: '0.95rem',
                fontWeight: '700',
                cursor: loading ? 'not-allowed' : 'pointer',
                marginTop: '6px',
                boxShadow: '0 4px 14px rgba(37, 99, 235, 0.4)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px',
                transition: 'opacity 0.2s'
              }}
            >
              {loading ? (
                <>
                  <i className="fa-solid fa-spinner fa-spin"></i> Authenticating Terminal...
                </>
              ) : (
                <>
                  <i className="fa-solid fa-right-to-bracket"></i> Sign In to Hub Terminal
                </>
              )}
            </button>
          </form>

        </div>
      </div>
    </div>
  );
}
