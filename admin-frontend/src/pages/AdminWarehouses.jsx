import React, { useEffect, useState } from 'react';
import adminApi from '../services/adminApi';

export default function AdminWarehouses() {
  const [warehouses, setWarehouses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedState, setSelectedState] = useState('ALL'); // 'ALL' | 'Andhra Pradesh' | 'Telangana'
  const [selectedType, setSelectedType] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingWh, setEditingWh] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    type: 'Delivery Branch',
    state: 'Andhra Pradesh',
    city: '',
    address: '',
    pincode: '',
    lat: '',
    lng: '',
    managerName: '',
    managerPhone: '',
    managerEmail: '',
    managerEmpId: '',
    capacity: 25000,
    currentLoad: 5000,
    status: 'active'
  });

  // Password & Credentials management state
  const [passwordModalWh, setPasswordModalWh] = useState(null);
  const [newManagerPassword, setNewManagerPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [passwordUpdating, setPasswordUpdating] = useState(false);
  const [passwordUpdateSuccess, setPasswordUpdateSuccess] = useState(null);
  const [autoCopyOnSave, setAutoCopyOnSave] = useState(true);
  const [copiedWhId, setCopiedWhId] = useState(null);
  const [modalCopied, setModalCopied] = useState(false);

  const fetchWarehouses = () => {
    setLoading(true);
    adminApi.get('/warehouses')
      .then(({ data }) => setWarehouses(data.warehouses || []))
      .catch((err) => console.error('Error fetching warehouses:', err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchWarehouses();
  }, []);

  const apCount = warehouses.filter(w => w.state === 'Andhra Pradesh').length;
  const tsCount = warehouses.filter(w => w.state === 'Telangana').length;
  const totalCapacity = warehouses.reduce((acc, w) => acc + (w.capacity || 0), 0);
  const totalLoad = warehouses.reduce((acc, w) => acc + (w.currentLoad || 0), 0);
  const loadPercentage = totalCapacity ? Math.round((totalLoad / totalCapacity) * 100) : 0;

  // Filtered list
  const filteredWarehouses = warehouses.filter(w => {
    if (selectedState !== 'ALL' && w.state !== selectedState) return false;
    if (selectedType !== 'ALL' && w.type !== selectedType) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchName = w.name?.toLowerCase().includes(q);
      const matchCity = w.city?.toLowerCase().includes(q);
      const matchCode = w.code?.toLowerCase().includes(q);
      const matchManager = w.manager?.name?.toLowerCase().includes(q);
      const matchPin = w.pincode?.includes(q);
      if (!matchName && !matchCity && !matchCode && !matchManager && !matchPin) return false;
    }
    return true;
  });

  const openCreateModal = () => {
    setEditingWh(null);
    setFormData({
      name: '',
      code: `WH-AP-${Math.floor(100 + Math.random() * 900)}`,
      type: 'Delivery Branch',
      state: 'Andhra Pradesh',
      city: '',
      address: '',
      pincode: '',
      lat: '16.5062',
      lng: '80.6480',
      managerName: '',
      managerPhone: '+91 ',
      managerEmail: '',
      managerEmpId: `MGR-${Math.floor(100 + Math.random() * 900)}`,
      managerPassword: 'ManagerSecure123!',
      capacity: 25000,
      currentLoad: 2000,
      status: 'active'
    });
    setIsModalOpen(true);
  };

  const openEditModal = (wh) => {
    setEditingWh(wh);
    setFormData({
      name: wh.name,
      code: wh.code,
      type: wh.type,
      state: wh.state,
      city: wh.city,
      address: wh.address,
      pincode: wh.pincode,
      lat: wh.location?.lat?.toString() || '',
      lng: wh.location?.lng?.toString() || '',
      managerName: wh.manager?.name || '',
      managerPhone: wh.manager?.phone || '',
      managerEmail: wh.manager?.email || '',
      managerEmpId: wh.manager?.employeeId || '',
      managerPassword: '',
      capacity: wh.capacity || 25000,
      currentLoad: wh.currentLoad || 0,
      status: wh.status || 'active'
    });
    setIsModalOpen(true);
  };

  const generateRandomPassword = (wh) => {
    const cityClean = (wh?.city || 'Hub').replace(/[^a-zA-Z]/g, '');
    const randNum = Math.floor(1000 + Math.random() * 9000);
    const specialChars = ['!', '@', '#', '$'];
    const char = specialChars[Math.floor(Math.random() * specialChars.length)];
    return `Mgr@${cityClean}${randNum}${char}`;
  };

  const copyCredentialsToClipboard = async (wh, customPassword = null) => {
    const pwd = customPassword || 'ManagerSecure123!';
    const text = [
      `=========================================`,
      `🏭 WAREHOUSE MANAGER LOGIN CREDENTIALS`,
      `=========================================`,
      `Facility:    ${wh.name} (${wh.code})`,
      `Location:    ${wh.city}, ${wh.state} - ${wh.pincode}`,
      `Category:    ${wh.type}`,
      `-----------------------------------------`,
      `🌐 Portal:    http://localhost:3004`,
      `👤 Manager:   ${wh.manager?.name || 'Assigned Manager'} (ID: ${wh.manager?.employeeId || 'N/A'})`,
      `📞 Phone:     ${wh.manager?.phone || 'N/A'}`,
      `✉️ Email:     ${wh.manager?.email || ''}`,
      `🔑 Password:  ${pwd}`,
      `=========================================`,
      `⚠️ Warehouse Access: http://localhost:3004`
    ].join('\n');

    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }
      setCopiedWhId(wh._id);
      setTimeout(() => setCopiedWhId(null), 2500);
      return true;
    } catch (err) {
      console.error('Clipboard copy failed:', err);
      return false;
    }
  };

  const openPasswordModal = (wh) => {
    setPasswordModalWh(wh);
    setNewManagerPassword(generateRandomPassword(wh));
    setShowPassword(true);
    setPasswordUpdateSuccess(null);
    setModalCopied(false);
  };

  const closePasswordModal = () => {
    setPasswordModalWh(null);
    setNewManagerPassword('');
    setPasswordUpdateSuccess(null);
    setModalCopied(false);
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (!passwordModalWh) return;
    if (!newManagerPassword || newManagerPassword.trim().length < 6) {
      alert('Password must be at least 6 characters long');
      return;
    }

    setPasswordUpdating(true);
    try {
      const { data } = await adminApi.put(`/warehouses/${passwordModalWh._id}/manager-password`, {
        password: newManagerPassword.trim()
      });

      setPasswordUpdateSuccess({
        message: data.message || 'Password updated successfully!',
        password: newManagerPassword.trim(),
        credentials: data.credentials
      });

      if (autoCopyOnSave) {
        await copyCredentialsToClipboard(passwordModalWh, newManagerPassword.trim());
        setModalCopied(true);
      }
      fetchWarehouses();
    } catch (err) {
      console.error('Failed to update password:', err);
      alert(err.response?.data?.message || 'Failed to update manager password');
    } finally {
      setPasswordUpdating(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        name: formData.name,
        code: formData.code,
        type: formData.type,
        state: formData.state,
        city: formData.city,
        address: formData.address,
        pincode: formData.pincode,
        location: {
          lat: parseFloat(formData.lat) || 16.5062,
          lng: parseFloat(formData.lng) || 80.6480
        },
        manager: {
          name: formData.managerName,
          phone: formData.managerPhone,
          email: formData.managerEmail,
          employeeId: formData.managerEmpId
        },
        capacity: Number(formData.capacity),
        currentLoad: Number(formData.currentLoad),
        status: formData.status
      };

      if (formData.managerPassword) {
        payload.managerPassword = formData.managerPassword;
      }

      if (editingWh) {
        await adminApi.put(`/warehouses/${editingWh._id}`, payload);
        alert('Warehouse & Manager updated successfully!');
      } else {
        await adminApi.post('/warehouses', payload);
        alert('New Warehouse registered successfully!');
      }
      setIsModalOpen(false);
      fetchWarehouses();
    } catch (err) {
      alert(err.response?.data?.message || 'Error saving warehouse');
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to remove warehouse "${name}"?`)) return;
    try {
      await adminApi.delete(`/warehouses/${id}`);
      alert('Warehouse removed successfully');
      fetchWarehouses();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete warehouse');
    }
  };

  return (
    <div>
      {/* Top Header */}
      <div className="admin-top-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: '800', margin: 0, color: '#0F172A' }}>
            <i className="fa-solid fa-warehouse" style={{ color: '#4F46E5', marginRight: '10px' }}></i>
            Warehouse &amp; Logistics Hub System
          </h1>
          <p style={{ color: '#64748B', fontSize: '0.88rem', margin: '4px 0 0 0' }}>
            Real-time fulfillment infrastructure across Andhra Pradesh (AP) &amp; Telangana (TS)
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <a
            href="http://localhost:3004"
            target="_blank"
            rel="noreferrer"
            style={{
              background: '#0F172A',
              color: '#FFFFFF',
              border: '1px solid #334155',
              padding: '10px 18px',
              borderRadius: '8px',
              fontWeight: '700',
              fontSize: '0.88rem',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              textDecoration: 'none',
              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
            }}
          >
            <i className="fa-solid fa-arrow-up-right-from-square"></i> Open Warehouse Portal (Port 3004)
          </a>
          <button
            onClick={openCreateModal}
            style={{
              background: '#4F46E5',
              color: '#FFFFFF',
              border: 'none',
              padding: '10px 18px',
              borderRadius: '8px',
              fontWeight: '700',
              fontSize: '0.88rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: '0 2px 4px rgba(79, 70, 229, 0.25)'
            }}
          >
            <i className="fa-solid fa-plus"></i> Add New Warehouse
          </button>
        </div>
      </div>

      {/* Metrics Banner */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        <div style={{ background: '#FFFFFF', padding: '18px 20px', borderRadius: '12px', border: '1px solid #E2E8F0', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#64748B', fontSize: '0.8rem', fontWeight: '700', textTransform: 'uppercase' }}>
            <span>Total Hubs</span>
            <i className="fa-solid fa-network-wired" style={{ color: '#4F46E5', fontSize: '1.1rem' }}></i>
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: '800', color: '#0F172A', marginTop: '6px' }}>{warehouses.length}</div>
          <div style={{ fontSize: '0.75rem', color: '#10B981', fontWeight: '600', marginTop: '4px' }}>
            <i className="fa-solid fa-circle-check"></i> 100% Operational
          </div>
        </div>

        <div style={{ background: '#FFFFFF', padding: '18px 20px', borderRadius: '12px', border: '1px solid #E2E8F0', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#64748B', fontSize: '0.8rem', fontWeight: '700', textTransform: 'uppercase' }}>
            <span>Andhra Pradesh (AP)</span>
            <i className="fa-solid fa-map-location-dot" style={{ color: '#059669', fontSize: '1.1rem' }}></i>
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: '800', color: '#0F172A', marginTop: '6px' }}>{apCount} Hubs</div>
          <div style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '4px' }}>
            Vijayawada, Tenali, Vizag, Tirupati...
          </div>
        </div>

        <div style={{ background: '#FFFFFF', padding: '18px 20px', borderRadius: '12px', border: '1px solid #E2E8F0', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#64748B', fontSize: '0.8rem', fontWeight: '700', textTransform: 'uppercase' }}>
            <span>Telangana (TS)</span>
            <i className="fa-solid fa-city" style={{ color: '#D97706', fontSize: '1.1rem' }}></i>
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: '800', color: '#0F172A', marginTop: '6px' }}>{tsCount} Hubs</div>
          <div style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '4px' }}>
            Shamshabad, Gachibowli, Warangal...
          </div>
        </div>

        <div style={{ background: '#FFFFFF', padding: '18px 20px', borderRadius: '12px', border: '1px solid #E2E8F0', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#64748B', fontSize: '0.8rem', fontWeight: '700', textTransform: 'uppercase' }}>
            <span>Capacity Utilization</span>
            <i className="fa-solid fa-boxes-packing" style={{ color: '#2563EB', fontSize: '1.1rem' }}></i>
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: '800', color: '#0F172A', marginTop: '6px' }}>
            {loadPercentage}%
          </div>
          <div style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '4px' }}>
            {totalLoad.toLocaleString('en-IN')} / {totalCapacity.toLocaleString('en-IN')} units
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div style={{ background: '#FFFFFF', padding: '16px 20px', borderRadius: '12px', border: '1px solid #E2E8F0', marginBottom: '20px', display: 'flex', flexWrap: 'wrap', gap: '14px', alignItems: 'center', justifyContent: 'space-between' }}>
        {/* State Filter Buttons */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button
            onClick={() => setSelectedState('ALL')}
            style={{
              padding: '7px 16px',
              borderRadius: '6px',
              fontWeight: '700',
              fontSize: '0.82rem',
              cursor: 'pointer',
              border: 'none',
              background: selectedState === 'ALL' ? '#1E293B' : '#F1F5F9',
              color: selectedState === 'ALL' ? '#FFFFFF' : '#475569'
            }}
          >
            All Hubs ({warehouses.length})
          </button>
          <button
            onClick={() => setSelectedState('Andhra Pradesh')}
            style={{
              padding: '7px 16px',
              borderRadius: '6px',
              fontWeight: '700',
              fontSize: '0.82rem',
              cursor: 'pointer',
              border: 'none',
              background: selectedState === 'Andhra Pradesh' ? '#059669' : '#F1F5F9',
              color: selectedState === 'Andhra Pradesh' ? '#FFFFFF' : '#475569'
            }}
          >
            Andhra Pradesh ({apCount})
          </button>
          <button
            onClick={() => setSelectedState('Telangana')}
            style={{
              padding: '7px 16px',
              borderRadius: '6px',
              fontWeight: '700',
              fontSize: '0.82rem',
              cursor: 'pointer',
              border: 'none',
              background: selectedState === 'Telangana' ? '#D97706' : '#F1F5F9',
              color: selectedState === 'Telangana' ? '#FFFFFF' : '#475569'
            }}
          >
            Telangana ({tsCount})
          </button>
        </div>

        {/* Search & Type Filter */}
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap', flex: 1, justifyContent: 'flex-end' }}>
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            style={{
              padding: '8px 12px',
              borderRadius: '6px',
              border: '1px solid #CBD5E1',
              fontSize: '0.82rem',
              color: '#334155',
              background: '#FFFFFF',
              outline: 'none'
            }}
          >
            <option value="ALL">All Warehouse Types</option>
            <option value="Mother Warehouse">Mother Warehouse</option>
            <option value="Regional Sorting Hub">Regional Sorting Hub</option>
            <option value="Delivery Branch">Delivery Branch</option>
          </select>

          <div style={{ position: 'relative', minWidth: '220px' }}>
            <i className="fa-solid fa-magnifying-glass" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8', fontSize: '0.8rem' }}></i>
            <input
              type="text"
              placeholder="Search city, manager, code..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px 8px 34px',
                borderRadius: '6px',
                border: '1px solid #CBD5E1',
                fontSize: '0.82rem',
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />
          </div>
        </div>
      </div>

      {/* Warehouses Table */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0' }}>
          <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: '2rem', color: '#4F46E5' }}></i>
          <p style={{ marginTop: '12px', color: '#64748B' }}>Loading AP &amp; TS Warehouses...</p>
        </div>
      ) : filteredWarehouses.length === 0 ? (
        <div style={{ background: '#FFFFFF', padding: '50px 20px', textAlign: 'center', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
          <i className="fa-solid fa-warehouse" style={{ fontSize: '2.5rem', color: '#CBD5E1', marginBottom: '12px' }}></i>
          <h3 style={{ margin: 0, color: '#334155' }}>No warehouses match your criteria</h3>
          <p style={{ color: '#94A3B8', fontSize: '0.85rem' }}>Try changing state tabs or clearing your search term.</p>
        </div>
      ) : (
        <div style={{ background: '#FFFFFF', borderRadius: '12px', border: '1px solid #E2E8F0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
          <table className="data-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0', textAlign: 'left' }}>
                <th style={{ padding: '14px 16px', fontSize: '0.8rem', fontWeight: '700', color: '#475569' }}>Warehouse &amp; Code</th>
                <th style={{ padding: '14px 16px', fontSize: '0.8rem', fontWeight: '700', color: '#475569' }}>Facility Type</th>
                <th style={{ padding: '14px 16px', fontSize: '0.8rem', fontWeight: '700', color: '#475569' }}>Location &amp; Coordinates</th>
                <th style={{ padding: '14px 16px', fontSize: '0.8rem', fontWeight: '700', color: '#475569' }}>Assigned Manager</th>
                <th style={{ padding: '14px 16px', fontSize: '0.8rem', fontWeight: '700', color: '#475569' }}>Capacity &amp; Load</th>
                <th style={{ padding: '14px 16px', fontSize: '0.8rem', fontWeight: '700', color: '#475569' }}>Status</th>
                <th style={{ padding: '14px 16px', fontSize: '0.8rem', fontWeight: '700', color: '#475569' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredWarehouses.map(w => {
                const loadPct = w.capacity ? Math.round((w.currentLoad / w.capacity) * 100) : 0;
                const typeBadgeStyle = 
                  w.type === 'Mother Warehouse'
                    ? { bg: '#EFF6FF', color: '#1D4ED8', border: '#BFDBFE' }
                    : w.type === 'Regional Sorting Hub'
                    ? { bg: '#FDF4FF', color: '#9333EA', border: '#F0ABFC' }
                    : { bg: '#F0FDF4', color: '#15803D', border: '#BBF7D0' };

                return (
                  <tr key={w._id} style={{ borderBottom: '1px solid #F1F5F9', verticalAlign: 'top' }}>
                    {/* Warehouse Info */}
                    <td style={{ padding: '16px' }}>
                      <div style={{ fontWeight: '800', color: '#0F172A', fontSize: '0.92rem' }}>{w.name}</div>
                      <div style={{ display: 'inline-block', fontFamily: 'monospace', fontSize: '0.76rem', color: '#4F46E5', background: '#EEF2FF', padding: '2px 6px', borderRadius: '4px', marginTop: '4px', fontWeight: '600' }}>
                        {w.code}
                      </div>
                      <div style={{ fontSize: '0.74rem', color: '#64748B', marginTop: '4px' }}>
                        <i className="fa-solid fa-phone" style={{ fontSize: '0.68rem', marginRight: '4px' }}></i>
                        {w.contactPhone || 'N/A'}
                      </div>
                    </td>

                    {/* Facility Type */}
                    <td style={{ padding: '16px' }}>
                      <span style={{
                        background: typeBadgeStyle.bg,
                        color: typeBadgeStyle.color,
                        border: `1px solid ${typeBadgeStyle.border}`,
                        padding: '4px 8px',
                        borderRadius: '6px',
                        fontSize: '0.72rem',
                        fontWeight: '700',
                        display: 'inline-block',
                        whiteSpace: 'nowrap'
                      }}>
                        {w.type}
                      </span>
                    </td>

                    {/* Location */}
                    <td style={{ padding: '16px', maxWidth: '240px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <strong style={{ color: '#1E293B', fontSize: '0.88rem' }}>{w.city}</strong>
                        <span style={{
                          fontSize: '0.7rem',
                          padding: '1px 6px',
                          borderRadius: '4px',
                          fontWeight: '700',
                          background: w.state === 'Andhra Pradesh' ? '#ECFDF5' : '#FEF3C7',
                          color: w.state === 'Andhra Pradesh' ? '#047857' : '#B45309'
                        }}>
                          {w.state === 'Andhra Pradesh' ? 'AP' : 'TS'}
                        </span>
                      </div>
                      <div style={{ fontSize: '0.76rem', color: '#64748B', marginTop: '4px', lineHeight: '1.3' }}>
                        {w.address} - <strong style={{ color: '#334155' }}>{w.pincode}</strong>
                      </div>
                      <div style={{ fontSize: '0.72rem', color: '#475569', marginTop: '4px', fontFamily: 'monospace' }}>
                        <i className="fa-solid fa-crosshairs" style={{ color: '#EF4444', marginRight: '3px' }}></i>
                        {w.location?.lat?.toFixed(4)}° N, {w.location?.lng?.toFixed(4)}° E
                      </div>
                    </td>

                    {/* Manager Info */}
                    <td style={{ padding: '16px', minWidth: '190px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '50%',
                          background: '#E0E7FF',
                          color: '#4338CA',
                          fontWeight: '800',
                          fontSize: '0.8rem',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0
                        }}>
                          {w.manager?.name ? w.manager.name.split(' ').map(n => n[0]).join('').slice(0, 2) : 'MG'}
                        </div>
                        <div>
                          <div style={{ fontWeight: '700', color: '#1E293B', fontSize: '0.86rem' }}>
                            {w.manager?.name || 'Unassigned'}
                          </div>
                          <div style={{ fontSize: '0.72rem', color: '#64748B' }}>
                            ID: <strong>{w.manager?.employeeId || 'N/A'}</strong>
                          </div>
                        </div>
                      </div>
                      <div style={{ fontSize: '0.74rem', color: '#475569', marginTop: '6px' }}>
                        <i className="fa-solid fa-phone" style={{ fontSize: '0.68rem', marginRight: '5px', color: '#059669' }}></i>
                        <a href={`tel:${w.manager?.phone}`} style={{ color: '#059669', textDecoration: 'none', fontWeight: '600' }}>
                          {w.manager?.phone}
                        </a>
                      </div>
                      <div style={{ fontSize: '0.72rem', color: '#64748B', marginTop: '2px', wordBreak: 'break-all' }}>
                        <i className="fa-solid fa-envelope" style={{ fontSize: '0.68rem', marginRight: '5px', color: '#6366F1' }}></i>
                        {w.manager?.email || 'No email assigned'}
                      </div>

                      {/* Credentials & Quick Password Actions */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '8px', flexWrap: 'wrap' }}>
                        <button
                          type="button"
                          onClick={() => copyCredentialsToClipboard(w)}
                          title="Copy Warehouse Manager Login Credentials"
                          style={{
                            background: copiedWhId === w._id ? '#ECFDF5' : '#F1F5F9',
                            border: `1px solid ${copiedWhId === w._id ? '#10B981' : '#CBD5E1'}`,
                            color: copiedWhId === w._id ? '#047857' : '#334155',
                            padding: '3px 8px',
                            borderRadius: '5px',
                            cursor: 'pointer',
                            fontSize: '0.71rem',
                            fontWeight: '700',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            transition: 'all 0.15s ease'
                          }}
                        >
                          <i className={copiedWhId === w._id ? "fa-solid fa-check" : "fa-regular fa-copy"} style={{ color: copiedWhId === w._id ? '#047857' : '#6366F1' }}></i>
                          {copiedWhId === w._id ? 'Copied!' : 'Copy Login'}
                        </button>
                        <button
                          type="button"
                          onClick={() => openPasswordModal(w)}
                          title="Update/Reset Manager Password"
                          style={{
                            background: 'transparent',
                            border: 'none',
                            color: '#4F46E5',
                            fontSize: '0.71rem',
                            fontWeight: '700',
                            cursor: 'pointer',
                            padding: '2px 4px',
                            textDecoration: 'underline'
                          }}
                        >
                          Change Pwd
                        </button>
                      </div>
                    </td>

                    {/* Capacity & Load */}
                    <td style={{ padding: '16px', minWidth: '160px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '4px' }}>
                        <span style={{ fontWeight: '700', color: '#1E293B' }}>{w.currentLoad?.toLocaleString('en-IN')} units</span>
                        <span style={{ color: '#64748B' }}>{loadPct}%</span>
                      </div>
                      {/* Progress Bar */}
                      <div style={{ width: '100%', height: '7px', background: '#E2E8F0', borderRadius: '4px', overflow: 'hidden' }}>
                        <div style={{
                          width: `${Math.min(loadPct, 100)}%`,
                          height: '100%',
                          background: loadPct > 80 ? '#EF4444' : loadPct > 50 ? '#F59E0B' : '#10B981',
                          borderRadius: '4px'
                        }}></div>
                      </div>
                      <div style={{ fontSize: '0.7rem', color: '#94A3B8', marginTop: '4px' }}>
                        Max: {w.capacity?.toLocaleString('en-IN')} units
                      </div>
                    </td>

                    {/* Status */}
                    <td style={{ padding: '16px' }}>
                      <span style={{
                        background: w.status === 'active' ? '#ECFDF5' : '#FEF2F2',
                        color: w.status === 'active' ? '#047857' : '#B91C1C',
                        padding: '4px 8px',
                        borderRadius: '6px',
                        fontSize: '0.72rem',
                        fontWeight: '800',
                        textTransform: 'uppercase',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}>
                        <i className="fa-solid fa-circle" style={{ fontSize: '0.45rem' }}></i>
                        {w.status}
                      </span>
                    </td>

                    {/* Actions */}
                    <td style={{ padding: '16px' }}>
                      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                        <button
                          onClick={() => openPasswordModal(w)}
                          title="Update Warehouse Manager Password"
                          style={{
                            background: '#EEF2FF',
                            border: '1px solid #C7D2FE',
                            color: '#4338CA',
                            padding: '6px 9px',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontSize: '0.78rem',
                            fontWeight: '700',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '5px',
                            whiteSpace: 'nowrap'
                          }}
                        >
                          <i className="fa-solid fa-key" style={{ color: '#4F46E5' }}></i> Password
                        </button>
                        <button
                          onClick={() => openEditModal(w)}
                          title="Edit Warehouse & Manager"
                          style={{
                            background: '#F1F5F9',
                            border: '1px solid #CBD5E1',
                            color: '#334155',
                            padding: '6px 9px',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontSize: '0.78rem',
                            fontWeight: '600',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}
                        >
                          <i className="fa-solid fa-pen-to-square"></i> Edit
                        </button>
                        <button
                          onClick={() => handleDelete(w._id, w.name)}
                          title="Delete Facility"
                          style={{
                            background: '#FEF2F2',
                            border: '1px solid #FECACA',
                            color: '#DC2626',
                            padding: '6px 9px',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontSize: '0.78rem'
                          }}
                        >
                          <i className="fa-solid fa-trash"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Add / Edit Warehouse Modal */}
      {isModalOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: 'rgba(15, 23, 42, 0.65)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '20px'
        }}>
          <div style={{
            background: '#FFFFFF',
            borderRadius: '16px',
            width: '100%',
            maxWidth: '680px',
            maxHeight: '90vh',
            overflowY: 'auto',
            padding: '28px',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid #E2E8F0', paddingBottom: '14px' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#0F172A', margin: 0 }}>
                {editingWh ? 'Edit Warehouse & Manager' : 'Register New Warehouse Hub'}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                style={{ background: 'transparent', border: 'none', fontSize: '1.2rem', color: '#94A3B8', cursor: 'pointer' }}
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '700', color: '#475569', marginBottom: '4px' }}>
                    Warehouse Facility Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Tenali Delivery Branch"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '0.85rem' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '700', color: '#475569', marginBottom: '4px' }}>
                    Warehouse Code *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. WH-AP-TEN01"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '0.85rem', fontFamily: 'monospace' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '700', color: '#475569', marginBottom: '4px' }}>
                    Facility Type
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '0.85rem', background: '#fff' }}
                  >
                    <option value="Delivery Branch">Delivery Branch</option>
                    <option value="Regional Sorting Hub">Regional Sorting Hub</option>
                    <option value="Mother Warehouse">Mother Warehouse</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '700', color: '#475569', marginBottom: '4px' }}>
                    State *
                  </label>
                  <select
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '0.85rem', background: '#fff' }}
                  >
                    <option value="Andhra Pradesh">Andhra Pradesh (AP)</option>
                    <option value="Telangana">Telangana (TS)</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '700', color: '#475569', marginBottom: '4px' }}>
                    City *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Tenali"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '0.85rem' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '700', color: '#475569', marginBottom: '4px' }}>
                  Street / Industrial Address *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Station Road, Near Railway Goods Yard, Tenali"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '0.85rem' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '700', color: '#475569', marginBottom: '4px' }}>
                    Pincode *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 522201"
                    value={formData.pincode}
                    onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '0.85rem' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '700', color: '#475569', marginBottom: '4px' }}>
                    Latitude *
                  </label>
                  <input
                    type="number"
                    step="any"
                    required
                    placeholder="16.2437"
                    value={formData.lat}
                    onChange={(e) => setFormData({ ...formData, lat: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '0.85rem' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '700', color: '#475569', marginBottom: '4px' }}>
                    Longitude *
                  </label>
                  <input
                    type="number"
                    step="any"
                    required
                    placeholder="80.6400"
                    value={formData.lng}
                    onChange={(e) => setFormData({ ...formData, lng: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '0.85rem' }}
                  />
                </div>
              </div>

              {/* Manager Details Card */}
              <div style={{ background: '#F8FAFC', padding: '16px', borderRadius: '10px', border: '1px solid #E2E8F0', marginTop: '6px' }}>
                <div style={{ fontWeight: '800', fontSize: '0.86rem', color: '#1E293B', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <i className="fa-solid fa-user-tie" style={{ color: '#4F46E5' }}></i> Assigned Hub Manager Details
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '10px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: '700', color: '#475569', marginBottom: '4px' }}>
                      Manager Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Phani Kumar"
                      value={formData.managerName}
                      onChange={(e) => setFormData({ ...formData, managerName: e.target.value })}
                      style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '0.85rem' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: '700', color: '#475569', marginBottom: '4px' }}>
                      Employee ID *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. MGR-AP-04"
                      value={formData.managerEmpId}
                      onChange={(e) => setFormData({ ...formData, managerEmpId: e.target.value })}
                      style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '0.85rem', fontFamily: 'monospace' }}
                    />
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: '700', color: '#475569', marginBottom: '4px' }}>
                      Manager Mobile Phone *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="+91 98483 44556"
                      value={formData.managerPhone}
                      onChange={(e) => setFormData({ ...formData, managerPhone: e.target.value })}
                      style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '0.85rem' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: '700', color: '#475569', marginBottom: '4px' }}>
                      Manager Official Email *
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="phani.kumar@novacart.com"
                      value={formData.managerEmail}
                      onChange={(e) => setFormData({ ...formData, managerEmail: e.target.value })}
                      style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '0.85rem' }}
                    />
                  </div>
                </div>

                <div style={{ marginTop: '10px', paddingTop: '10px', borderTop: '1px dashed #E2E8F0' }}>
                  <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: '700', color: '#475569', marginBottom: '4px' }}>
                    Manager Portal Password {editingWh ? '(Leave blank to keep current password)' : '*'}
                  </label>
                  <input
                    type="password"
                    placeholder={editingWh ? 'Enter new password to reset...' : 'e.g. ManagerSecure123!'}
                    value={formData.managerPassword || ''}
                    onChange={(e) => setFormData({ ...formData, managerPassword: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '0.85rem' }}
                  />
                  <div style={{ fontSize: '0.72rem', color: '#64748B', marginTop: '3px' }}>
                    <i className="fa-solid fa-lock" style={{ fontSize: '0.68rem', marginRight: '4px' }}></i>
                    Managers use this password to sign into the dedicated Warehouse Portal (<code style={{ color: '#4F46E5' }}>:3004</code>).
                  </div>
                </div>
              </div>

              {/* Capacity & Load */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '700', color: '#475569', marginBottom: '4px' }}>
                    Total Capacity (units)
                  </label>
                  <input
                    type="number"
                    value={formData.capacity}
                    onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '0.85rem' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '700', color: '#475569', marginBottom: '4px' }}>
                    Current Storage Load
                  </label>
                  <input
                    type="number"
                    value={formData.currentLoad}
                    onChange={(e) => setFormData({ ...formData, currentLoad: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '0.85rem' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '700', color: '#475569', marginBottom: '4px' }}>
                    Hub Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '0.85rem', background: '#fff' }}
                  >
                    <option value="active">Active / Operational</option>
                    <option value="maintenance">Maintenance</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '12px', borderTop: '1px solid #E2E8F0', paddingTop: '16px' }}>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  style={{ padding: '9px 18px', borderRadius: '6px', border: '1px solid #CBD5E1', background: '#FFFFFF', color: '#475569', fontWeight: '600', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{ padding: '9px 22px', borderRadius: '6px', border: 'none', background: '#4F46E5', color: '#FFFFFF', fontWeight: '700', cursor: 'pointer', boxShadow: '0 2px 4px rgba(79, 70, 229, 0.3)' }}
                >
                  {editingWh ? 'Save Changes' : 'Create Warehouse'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Dedicated Warehouse Manager Password & Credentials Modal */}
      {passwordModalWh && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: 'rgba(15, 23, 42, 0.72)',
          backdropFilter: 'blur(5px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 10000,
          padding: '20px'
        }}>
          <div style={{
            background: '#FFFFFF',
            borderRadius: '16px',
            maxWidth: '540px',
            width: '100%',
            boxShadow: '0 25px 50px -12px rgba(15, 23, 42, 0.35)',
            overflow: 'hidden',
            border: '1px solid #E2E8F0',
            animation: 'fadeIn 0.15s ease-out'
          }}>
            {/* Header */}
            <div style={{
              background: 'linear-gradient(135deg, #1E1B4B 0%, #312E81 100%)',
              padding: '20px 24px',
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'flex-start',
              justifyContent: 'space-between'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '10px',
                  background: 'rgba(255, 255, 255, 0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.2rem',
                  color: '#FCD34D'
                }}>
                  <i className="fa-solid fa-key"></i>
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '800', letterSpacing: '-0.01em' }}>
                    Warehouse Manager Access
                  </h3>
                  <div style={{ fontSize: '0.8rem', color: '#C7D2FE', marginTop: '2px' }}>
                    {passwordModalWh.name} <span style={{ opacity: 0.7 }}>({passwordModalWh.code})</span>
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={closePasswordModal}
                style={{
                  background: 'rgba(255,255,255,0.1)',
                  border: 'none',
                  color: '#E0E7FF',
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '0.9rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: '24px' }}>
              {/* Manager Info Pill Card */}
              <div style={{
                background: '#F8FAFC',
                border: '1px solid #E2E8F0',
                borderRadius: '12px',
                padding: '14px 16px',
                marginBottom: '20px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '50%',
                      background: '#4F46E5',
                      color: '#FFFFFF',
                      fontWeight: '800',
                      fontSize: '0.85rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      {passwordModalWh.manager?.name ? passwordModalWh.manager.name.split(' ').map(n => n[0]).join('').slice(0, 2) : 'MG'}
                    </div>
                    <div>
                      <div style={{ fontWeight: '800', color: '#0F172A', fontSize: '0.92rem' }}>
                        {passwordModalWh.manager?.name || 'Assigned Manager'}
                      </div>
                      <div style={{ fontSize: '0.74rem', color: '#64748B' }}>
                        ID: <strong style={{ color: '#334155' }}>{passwordModalWh.manager?.employeeId || 'N/A'}</strong> | {passwordModalWh.city}, {passwordModalWh.state}
                      </div>
                    </div>
                  </div>
                  <span style={{
                    background: '#EEF2FF',
                    color: '#4338CA',
                    fontSize: '0.7rem',
                    fontWeight: '700',
                    padding: '2px 8px',
                    borderRadius: '4px',
                    border: '1px solid #C7D2FE'
                  }}>
                    Hub Manager
                  </span>
                </div>

                <div style={{ marginTop: '12px', paddingTop: '10px', borderTop: '1px dashed #CBD5E1', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '0.76rem' }}>
                  <div>
                    <span style={{ color: '#64748B' }}>Official Email:</span>
                    <div style={{ fontWeight: '700', color: '#1E293B', wordBreak: 'break-all' }}>
                      {passwordModalWh.manager?.email || 'N/A'}
                    </div>
                  </div>
                  <div>
                    <span style={{ color: '#64748B' }}>Portal URL:</span>
                    <div>
                      <a href="http://localhost:3004" target="_blank" rel="noreferrer" style={{ color: '#4F46E5', fontWeight: '700', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                        :3004 <i className="fa-solid fa-arrow-up-right-from-square" style={{ fontSize: '0.65rem' }}></i>
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              {/* Success Result Card */}
              {passwordUpdateSuccess ? (
                <div style={{
                  background: '#F0FDF4',
                  border: '1px solid #BBF7D0',
                  borderRadius: '12px',
                  padding: '16px',
                  marginBottom: '16px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#15803D', fontWeight: '800', fontSize: '0.9rem', marginBottom: '8px' }}>
                    <i className="fa-solid fa-circle-check" style={{ fontSize: '1.1rem' }}></i>
                    {passwordUpdateSuccess.message}
                  </div>

                  <div style={{ background: '#FFFFFF', border: '1px solid #DCFCE7', borderRadius: '8px', padding: '12px', fontSize: '0.8rem', color: '#1E293B' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                      <span style={{ color: '#64748B' }}>Login Email:</span>
                      <strong style={{ fontFamily: 'monospace' }}>{passwordModalWh.manager?.email}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                      <span style={{ color: '#64748B' }}>New Password:</span>
                      <strong style={{ fontFamily: 'monospace', color: '#047857', background: '#ECFDF5', padding: '1px 6px', borderRadius: '4px' }}>
                        {passwordUpdateSuccess.password}
                      </strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#64748B' }}>Portal URL:</span>
                      <a href="http://localhost:3004" target="_blank" rel="noreferrer" style={{ color: '#4F46E5', fontWeight: '700' }}>
                        http://localhost:3004
                      </a>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '10px', marginTop: '14px' }}>
                    <button
                      type="button"
                      onClick={() => {
                        copyCredentialsToClipboard(passwordModalWh, passwordUpdateSuccess.password);
                        setModalCopied(true);
                      }}
                      style={{
                        flex: 1,
                        background: modalCopied ? '#059669' : '#10B981',
                        border: 'none',
                        color: '#FFFFFF',
                        padding: '10px 14px',
                        borderRadius: '8px',
                        fontWeight: '700',
                        fontSize: '0.84rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                        boxShadow: '0 2px 6px rgba(16, 185, 129, 0.3)'
                      }}
                    >
                      <i className={modalCopied ? "fa-solid fa-check" : "fa-regular fa-copy"}></i>
                      {modalCopied ? 'Credentials Copied!' : 'Copy Updated Credentials'}
                    </button>
                    <button
                      type="button"
                      onClick={closePasswordModal}
                      style={{
                        padding: '10px 18px',
                        borderRadius: '8px',
                        border: '1px solid #CBD5E1',
                        background: '#FFFFFF',
                        color: '#475569',
                        fontWeight: '700',
                        fontSize: '0.84rem',
                        cursor: 'pointer'
                      }}
                    >
                      Done
                    </button>
                  </div>
                </div>
              ) : (
                /* Password Form */
                <form onSubmit={handlePasswordSubmit}>
                  <div style={{ marginBottom: '16px' }}>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '800', color: '#1E293B', marginBottom: '6px' }}>
                      Set New Password for {passwordModalWh.manager?.name || 'Manager'}
                    </label>

                    <div style={{ display: 'flex', gap: '8px' }}>
                      <div style={{ position: 'relative', flex: 1 }}>
                        <input
                          type={showPassword ? 'text' : 'password'}
                          required
                          value={newManagerPassword}
                          onChange={(e) => setNewManagerPassword(e.target.value)}
                          placeholder="Enter at least 6 characters..."
                          style={{
                            width: '100%',
                            padding: '10px 38px 10px 12px',
                            borderRadius: '8px',
                            border: '1.5px solid #CBD5E1',
                            fontSize: '0.9rem',
                            fontFamily: showPassword ? 'monospace' : 'inherit',
                            outline: 'none',
                            transition: 'border 0.2s',
                            boxSizing: 'border-box'
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          title={showPassword ? 'Hide Password' : 'Show Password'}
                          style={{
                            position: 'absolute',
                            right: '8px',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            background: 'transparent',
                            border: 'none',
                            color: '#64748B',
                            cursor: 'pointer',
                            padding: '4px'
                          }}
                        >
                          <i className={showPassword ? "fa-solid fa-eye-slash" : "fa-solid fa-eye"}></i>
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          const rnd = generateRandomPassword(passwordModalWh);
                          setNewManagerPassword(rnd);
                          setShowPassword(true);
                        }}
                        title="Generate strong random password"
                        style={{
                          background: '#EEF2FF',
                          border: '1px solid #C7D2FE',
                          color: '#4338CA',
                          padding: '0 12px',
                          borderRadius: '8px',
                          fontSize: '0.78rem',
                          fontWeight: '700',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '5px',
                          whiteSpace: 'nowrap'
                        }}
                      >
                        <i className="fa-solid fa-shuffle"></i> Generate
                      </button>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '6px', fontSize: '0.72rem', color: '#64748B' }}>
                      <span>
                        <i className="fa-solid fa-circle-info" style={{ marginRight: '4px', color: '#4F46E5' }}></i>
                        Minimum 6 characters (Letters, numbers &amp; symbols recommended).
                      </span>
                      {newManagerPassword && (
                        <span style={{
                          fontWeight: '700',
                          color: newManagerPassword.length < 6 ? '#EF4444' : newManagerPassword.length < 10 ? '#F59E0B' : '#10B981'
                        }}>
                          {newManagerPassword.length < 6 ? 'Too Short' : newManagerPassword.length < 10 ? 'Medium' : 'Strong'}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Preset quick pills */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '0.72rem', color: '#64748B', fontWeight: '600' }}>Presets:</span>
                    <button
                      type="button"
                      onClick={() => {
                        setNewManagerPassword('ManagerSecure123!');
                        setShowPassword(true);
                      }}
                      style={{
                        background: '#F1F5F9',
                        border: '1px solid #E2E8F0',
                        color: '#475569',
                        fontSize: '0.7rem',
                        fontWeight: '600',
                        padding: '3px 8px',
                        borderRadius: '4px',
                        cursor: 'pointer'
                      }}
                    >
                      Reset to Default (ManagerSecure123!)
                    </button>
                  </div>

                  {/* Auto-copy checkbox */}
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.78rem', color: '#334155', cursor: 'pointer', marginBottom: '20px' }}>
                    <input
                      type="checkbox"
                      checked={autoCopyOnSave}
                      onChange={(e) => setAutoCopyOnSave(e.target.checked)}
                      style={{ accentColor: '#4F46E5' }}
                    />
                    <span>Copy updated credentials to clipboard automatically on save</span>
                  </label>

                  {/* Action Buttons */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #E2E8F0', paddingTop: '16px' }}>
                    <button
                      type="button"
                      onClick={() => copyCredentialsToClipboard(passwordModalWh)}
                      title="Copy current credentials without changing password"
                      style={{
                        background: '#F8FAFC',
                        border: '1px solid #CBD5E1',
                        color: '#334155',
                        padding: '9px 14px',
                        borderRadius: '8px',
                        fontWeight: '600',
                        fontSize: '0.8rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}
                    >
                      <i className="fa-regular fa-copy" style={{ color: '#6366F1' }}></i>
                      Copy Current
                    </button>

                    <div style={{ display: 'flex', gap: '10px' }}>
                      <button
                        type="button"
                        onClick={closePasswordModal}
                        style={{
                          padding: '9px 16px',
                          borderRadius: '8px',
                          border: '1px solid #CBD5E1',
                          background: '#FFFFFF',
                          color: '#475569',
                          fontWeight: '600',
                          fontSize: '0.84rem',
                          cursor: 'pointer'
                        }}
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={passwordUpdating || !newManagerPassword || newManagerPassword.trim().length < 6}
                        style={{
                          padding: '9px 20px',
                          borderRadius: '8px',
                          border: 'none',
                          background: (passwordUpdating || !newManagerPassword || newManagerPassword.trim().length < 6) ? '#94A3B8' : '#4F46E5',
                          color: '#FFFFFF',
                          fontWeight: '700',
                          fontSize: '0.84rem',
                          cursor: (passwordUpdating || !newManagerPassword || newManagerPassword.trim().length < 6) ? 'not-allowed' : 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          boxShadow: '0 2px 6px rgba(79, 70, 229, 0.3)'
                        }}
                      >
                        {passwordUpdating ? (
                          <>
                            <i className="fa-solid fa-spinner fa-spin"></i> Updating...
                          </>
                        ) : (
                          <>
                            <i className="fa-solid fa-check"></i> Update Password
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
