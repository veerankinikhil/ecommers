import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useDeviceMode } from '../context/DeviceModeContext';
import api, { formatINR } from '../services/api';

export default function CheckoutPage() {
  const { cart, subtotal, tax, clearCart } = useCart();
  const { user } = useAuth();
  const { isPhone } = useDeviceMode();
  const navigate = useNavigate();

  // Multi-address book states
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [selectedAddressIndex, setSelectedAddressIndex] = useState(0);
  const [isEditingAddress, setIsEditingAddress] = useState(false);
  const [editIndex, setEditIndex] = useState(null); // null = new, number = edit index

  // Input fields for the active edit form
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [houseNo, setHouseNo] = useState('');
  const [street, setStreet] = useState('');
  const [landmark, setLandmark] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [saveToProfile, setSaveToProfile] = useState(true);

  // Gift Card System states
  const [giftCardCodeInput, setGiftCardCodeInput] = useState('');
  const [appliedGiftCard, setAppliedGiftCard] = useState(null);
  const [giftCardError, setGiftCardError] = useState('');

  // Promotional Offers states
  const [firstOrderEligible, setFirstOrderEligible] = useState(true);
  const [selectedOfferCode, setSelectedOfferCode] = useState('');
  const [promoDiscount, setPromoDiscount] = useState(0);
  const [offerError, setOfferError] = useState('');

  // Pinned Coordinates
  const [coordinates, setCoordinates] = useState({ lat: 28.6139, lng: 77.2090 });

  // Map & GPS UI states
  const [locating, setLocating] = useState(false);
  const [showMapModal, setShowMapModal] = useState(false);
  const [pinnedCoords, setPinnedCoords] = useState(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [reverseGeocoding, setReverseGeocoding] = useState(false);
  const [mapSelectedAddress, setMapSelectedAddress] = useState('');

  const [paymentMethod, setPaymentMethod] = useState('Cash on Delivery (COD)');
  const [loading, setLoading] = useState(false);

  // Address parser (loads array of saved addresses)
  useEffect(() => {
    if (user?.address) {
      try {
        const parsed = JSON.parse(user.address);
        if (Array.isArray(parsed)) {
          setSavedAddresses(parsed);
          setIsEditingAddress(parsed.length === 0);
        } else if (parsed && typeof parsed === 'object') {
          setSavedAddresses([parsed]);
          setIsEditingAddress(false);
        } else {
          setSavedAddresses([]);
          setIsEditingAddress(true);
        }
      } catch {
        // Fallback for raw text address
        const fallback = {
          recipientName: user.name || '',
          recipientPhone: user.phone || '',
          houseNo: '',
          street: user.address,
          landmark: '',
          city: '',
          state: '',
          pincode: ''
        };
        setSavedAddresses([fallback]);
        setIsEditingAddress(false);
      }
    } else {
      setSavedAddresses([]);
      setIsEditingAddress(true);
    }
  }, [user?.address]);

  // Check first order eligibility by fetching order count
  useEffect(() => {
    if (user) {
      api.get('/orders')
        .then(({ data }) => {
          const validOrders = (data.orders || []).filter(o => o.orderStatus !== 'CANCELLED');
          setFirstOrderEligible(validOrders.length === 0);
        })
        .catch(() => {
          setFirstOrderEligible(true);
        });
    }
  }, [user]);

  // Inject Leaflet CSS & JS dynamically
  useEffect(() => {
    if (!document.getElementById('leaflet-css')) {
      const link = document.createElement('link');
      link.id = 'leaflet-css';
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(link);
    }
    if (!document.getElementById('leaflet-js')) {
      const script = document.createElement('script');
      script.id = 'leaflet-js';
      script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
      script.onload = () => setMapLoaded(true);
      document.head.appendChild(script);
    } else {
      setMapLoaded(true);
    }
  }, []);

  // Map Canvas Instantiation Hooks
  const mapRef = useRef(null);
  const leafletMapInstance = useRef(null);
  const markerInstance = useRef(null);

  useEffect(() => {
    if (showMapModal && mapLoaded && mapRef.current) {
      const timer = setTimeout(() => {
        const defaultCoords = [17.3850, 78.4867]; // Hyderabad, India
        const initialCoords = pinnedCoords || defaultCoords;

        if (leafletMapInstance.current) {
          leafletMapInstance.current.remove();
        }

        const L = window.L;
        if (!L) return;

        const DefaultIcon = L.icon({
          iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
          shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
          iconSize: [25, 41],
          iconAnchor: [12, 41]
        });
        L.Marker.prototype.options.icon = DefaultIcon;

        const map = L.map(mapRef.current).setView(initialCoords, 14);
        leafletMapInstance.current = map;

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© OpenStreetMap contributors'
        }).addTo(map);

        const marker = L.marker(initialCoords, { draggable: true }).addTo(map);
        markerInstance.current = marker;

        const performReverseGeocode = async (coords) => {
          setReverseGeocoding(true);
          try {
            const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${coords.lat}&lon=${coords.lng}&addressdetails=1`);
            const data = await res.json();
            if (data) {
              setMapSelectedAddress(data.display_name);
            }
          } catch (e) {
            console.error(e);
          } finally {
            setReverseGeocoding(false);
          }
        };

        performReverseGeocode({ lat: initialCoords[0], lng: initialCoords[1] });

        marker.on('dragend', () => {
          const latLng = marker.getLatLng();
          setPinnedCoords([latLng.lat, latLng.lng]);
          performReverseGeocode(latLng);
        });

        map.on('click', (e) => {
          const { lat, lng } = e.latlng;
          marker.setLatLng([lat, lng]);
          setPinnedCoords([lat, lng]);
          performReverseGeocode({ lat, lng });
        });
      }, 100);

      return () => clearTimeout(timer);
    }
  }, [showMapModal, mapLoaded, pinnedCoords]);

  const handleConfirmMapLocation = () => {
    if (!pinnedCoords) return;
    setCoordinates({ lat: pinnedCoords[0], lng: pinnedCoords[1] });
    setReverseGeocoding(true);
    fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${pinnedCoords[0]}&lon=${pinnedCoords[1]}&addressdetails=1`)
      .then(res => res.json())
      .then(data => {
        if (data && data.address) {
          const addr = data.address;
          setPostalCode(addr.postcode || '');
          setCity(addr.city || addr.town || addr.village || addr.suburb || '');
          setState(addr.state || '');
          setStreet(addr.road || addr.suburb || addr.neighbourhood || addr.amenity || '');
        }
        setShowMapModal(false);
      })
      .catch(err => {
        console.error(err);
        setShowMapModal(false);
      })
      .finally(() => {
        setReverseGeocoding(false);
      });
  };

  const handleUseLiveLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        setPinnedCoords([latitude, longitude]);
        setCoordinates({ lat: latitude, lng: longitude });
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1`);
          const data = await res.json();
          if (data && data.address) {
            const addr = data.address;
            setPostalCode(addr.postcode || '');
            setCity(addr.city || addr.town || addr.village || addr.suburb || '');
            setState(addr.state || '');
            setStreet(addr.road || addr.suburb || addr.neighbourhood || addr.amenity || '');
          }
        } catch (e) {
          console.error(e);
        } finally {
          setLocating(false);
        }
      },
      (err) => {
        console.error(err);
        alert('GPS location permission denied. Please fill address manually or select on Map.');
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handlePincodeChange = async (e) => {
    const val = e.target.value.replace(/\D/g, '').slice(0, 6);
    setPostalCode(val);
    if (val.length === 6) {
      try {
        const res = await fetch(`https://api.postalpincode.in/pincode/${val}`);
        const data = await res.json();
        if (data && data[0] && data[0].Status === 'Success') {
          const postOffice = data[0].PostOffice[0];
          setCity(postOffice.District || postOffice.Division || '');
          setState(postOffice.State || '');
        }
      } catch (err) {
        console.error('Pincode lookup error:', err);
      }
    }
  };

  const handleAddNewAddressClick = () => {
    setEditIndex(null);
    setFullName('');
    setPhone('');
    setHouseNo('');
    setStreet('');
    setLandmark('');
    setCity('');
    setState('');
    setPostalCode('');
    setCoordinates({ lat: 28.6139, lng: 77.2090 });
    setIsEditingAddress(true);
  };

  const handleEditAddressClick = (index, e) => {
    e.stopPropagation();
    setEditIndex(index);
    const addr = savedAddresses[index];
    setFullName(addr.recipientName || '');
    setPhone(addr.recipientPhone || '');
    setHouseNo(addr.houseNo || '');
    setStreet(addr.street || '');
    setLandmark(addr.landmark || '');
    setCity(addr.city || '');
    setState(addr.state || '');
    setPostalCode(addr.pincode || addr.postalCode || '');
    setCoordinates(addr.coordinates || { lat: 28.6139, lng: 77.2090 });
    setIsEditingAddress(true);
  };

  const handleDeleteAddress = async (index, e) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this address?')) return;
    const updated = savedAddresses.filter((_, i) => i !== index);
    setSavedAddresses(updated);
    if (selectedAddressIndex === index) {
      setSelectedAddressIndex(0);
    } else if (selectedAddressIndex > index) {
      setSelectedAddressIndex(selectedAddressIndex - 1);
    }

    try {
      await api.put('/auth/profile', {
        name: user.name,
        phone: user.phone,
        avatar: user.avatar,
        address: JSON.stringify(updated)
      });
    } catch (err) {
      console.error('Failed to update address array in MongoDB:', err);
    }
  };

  const handleSaveAddressToList = async (e) => {
    e.preventDefault();
    if (!fullName.trim() || !phone.trim() || !houseNo.trim() || !street.trim() || !city.trim() || !state.trim() || !postalCode.trim()) {
      alert('Please fill in all required delivery details.');
      return;
    }

    const newAddr = {
      recipientName: fullName,
      recipientPhone: phone,
      houseNo,
      street,
      landmark,
      city,
      state,
      pincode: postalCode,
      coordinates
    };

    let updatedList = [];
    if (editIndex !== null) {
      updatedList = savedAddresses.map((addr, idx) => idx === editIndex ? newAddr : addr);
    } else {
      updatedList = [...savedAddresses, newAddr];
    }

    setSavedAddresses(updatedList);
    setIsEditingAddress(false);
    setEditIndex(null);

    // Save list array to profile
    if (saveToProfile) {
      try {
        await api.put('/auth/profile', {
          name: user.name,
          phone: user.phone,
          avatar: user.avatar,
          address: JSON.stringify(updatedList)
        });
      } catch (err) {
        console.error('Failed to save updated address list to profile database:', err);
      }
    }
  };

  const handleApplyGiftCard = async () => {
    setGiftCardError('');
    if (!giftCardCodeInput.trim()) {
      setGiftCardError('Enter a code.');
      return;
    }
    try {
      const { data } = await api.post('/gift-cards/apply', { code: giftCardCodeInput });
      if (data.success) {
        setAppliedGiftCard(data.card);
        setGiftCardCodeInput('');
      }
    } catch (err) {
      setGiftCardError(err.response?.data?.message || 'Invalid or expired gift card.');
    }
  };

  const handleRemoveGiftCard = () => {
    setAppliedGiftCard(null);
  };

  // Handle Offer Select
  const handleOfferSelect = (offerCode) => {
    setOfferError('');
    setSelectedOfferCode(offerCode);

    if (!offerCode) {
      setPromoDiscount(0);
      return;
    }

    if (offerCode === 'NOVAKART20') {
      if (!firstOrderEligible) {
        setOfferError('This promo code is only valid for your first order.');
        setPromoDiscount(0);
        setSelectedOfferCode('');
      } else {
        setPromoDiscount(50);
      }
    } else if (offerCode === 'SUPER200') {
      if (subtotal < 2000) {
        setOfferError(`Add ${formatINR(2000 - subtotal)} more to unlock SUPER200!`);
        setPromoDiscount(0);
        setSelectedOfferCode('');
      } else {
        setPromoDiscount(200);
      }
    } else if (offerCode === 'FESTIVE100') {
      if (subtotal < 1200) {
        setOfferError(`Add ${formatINR(1200 - subtotal)} more to unlock FESTIVE100!`);
        setPromoDiscount(0);
        setSelectedOfferCode('');
      } else {
        setPromoDiscount(100);
      }
    }
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    if (!user) {
      alert('Please sign in to place your order.');
      navigate('/login');
      return;
    }

    if (cart.length === 0) {
      alert('Your cart is empty.');
      navigate('/products');
      return;
    }

    if (isEditingAddress) {
      alert('Please save your address details before confirming the order.');
      return;
    }

    if (savedAddresses.length === 0) {
      alert('Please add a delivery address first.');
      return;
    }

    const activeAddress = savedAddresses[selectedAddressIndex];
    if (!activeAddress) {
      alert('Please select a shipping address card.');
      return;
    }

    const combinedStreet = [activeAddress.houseNo, activeAddress.street, activeAddress.landmark].filter(Boolean).join(', ');

    const orderPayload = {
      items: cart.map(i => ({
        productId: i.productId?._id || i.productId || i.id,
        sellerId: i.sellerId?._id || i.sellerId || '6614fa3829dc7a18432a1011',
        name: i.name || 'Product',
        price: i.price,
        quantity: i.quantity,
        image: i.image
      })),
      deliveryAddress: {
        fullName: activeAddress.recipientName,
        phone: activeAddress.recipientPhone,
        street: combinedStreet,
        city: activeAddress.city,
        state: activeAddress.state,
        postalCode: activeAddress.pincode,
        coordinates: activeAddress.coordinates || coordinates
      },
      paymentMethod,
      giftCardCode: appliedGiftCard?.code || undefined,
      promoCode: selectedOfferCode || undefined
    };

    if (paymentMethod === 'Online Payment (Credit/Debit/UPI)') {
      // Redirect to mock payment gateway
      localStorage.setItem('pending_order_payload', JSON.stringify(orderPayload));
      navigate('/checkout/payment');
      return;
    }

    // Direct Cash on Delivery placement (with COD Convenience Fee)
    setLoading(true);
    try {
      const { data } = await api.post('/orders/place', orderPayload);
      clearCart();
      alert(`🎉 Order placed successfully! Order ID: ${data.order.orderNumber}`);
      navigate(`/orders/${data.order._id}/track`);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to place order.');
    } finally {
      setLoading(false);
    }
  };

  // Pricing calculations
  const standardShipping = 50;
  const isFreeDelivery = subtotal >= 1000;
  const convenienceFee = paymentMethod === 'Cash on Delivery (COD)' ? 10 : 0;
  
  const discountTotal = promoDiscount + (appliedGiftCard?.amount || 0);
  const payableTotal = subtotal + tax + standardShipping - (isFreeDelivery ? 50 : 0) + convenienceFee - discountTotal;

  return (
    <main
      className="container section-padding"
      style={{
        padding: isPhone ? '12px 10px 85px 10px' : '40px 20px',
        maxWidth: isPhone ? '100%' : 'var(--container-max)'
      }}
    >
      {/* Dynamic Delivery Charge Banner (Amazon style progress bar) */}
      {subtotal > 0 && (
        !isFreeDelivery ? (
          <div style={{ background: '#fff9e6', border: '1px solid #ffe3b3', padding: isPhone ? '12px 14px' : '16px 20px', borderRadius: '12px', marginBottom: isPhone ? '14px' : '24px', boxShadow: '0 4px 15px rgba(0,0,0,0.02)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: isPhone ? '0.78rem' : '0.88rem', color: '#665d00', marginBottom: '8px', flexWrap: 'wrap', gap: '4px' }}>
              <span>🛒 Add <strong>₹{1000 - subtotal}</strong> more for <strong>FREE Delivery</strong>!</span>
              <strong>Subtotal: {formatINR(subtotal)}</strong>
            </div>
            <div style={{ width: '100%', background: '#e2e8f0', height: '8px', borderRadius: '4px', overflow: 'hidden' }}>
              <div style={{ width: `${(subtotal / 1000) * 100}%`, background: '#ff9900', height: '100%', transition: 'width 0.3s' }}></div>
            </div>
          </div>
        ) : (
          <div style={{ background: '#e8f5e9', border: '1px solid #c8e6c9', padding: isPhone ? '12px 14px' : '16px 20px', borderRadius: '12px', marginBottom: isPhone ? '14px' : '24px', display: 'flex', alignItems: 'center', gap: '8px', color: '#2e7d32', fontSize: isPhone ? '0.82rem' : '0.88rem', fontWeight: '700', boxShadow: '0 4px 15px rgba(0,0,0,0.02)' }}>
            <i className="fa-solid fa-circle-check" style={{ fontSize: '1.1rem' }}></i> 🎉 Your order qualifies for FREE Delivery!
          </div>
        )
      )}

      <h2 style={{ fontSize: isPhone ? '1.25rem' : '1.6rem', fontWeight: '800', marginBottom: isPhone ? '16px' : '24px', color: 'var(--primary-color)' }}>
        <i className="fa-solid fa-shield-halved" style={{ color: 'var(--accent-color)', marginRight: '6px' }}></i> Secure Order Checkout
      </h2>

      <div
        className="checkout-layout"
        style={{
          display: 'grid',
          gridTemplateColumns: isPhone ? '1fr' : '1.2fr 0.8fr',
          gap: isPhone ? '16px' : '30px'
        }}
      >
        {/* SHIPPING & ADDRESS SECTION */}
        <div style={{ background: '#fff', border: '1px solid #E7E7E7', borderRadius: '12px', padding: isPhone ? '16px 12px' : '26px', display: 'flex', flexDirection: 'column', gap: isPhone ? '18px' : '26px' }}>
          
          <div>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', borderBottom: '1px solid #eee', paddingBottom: '8px' }}>
              <h3 style={{ fontSize: isPhone ? '1.05rem' : '1.15rem', fontWeight: '700', margin: 0 }}>
                1. Delivery Address &amp; Recipient Details
              </h3>
            </div>

            {!isEditingAddress ? (
              // Saved Address Cards List
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '10px' }}>
                {savedAddresses.map((addr, idx) => {
                  const displayName = addr.recipientName || addr.name || addr.fullName || user?.name || '';
                  const displayPhone = addr.recipientPhone || addr.phone || user?.phone || '';
                  const addressParts = [
                    addr.houseNo,
                    addr.street || addr.address,
                    addr.landmark,
                    addr.city,
                    addr.state ? (addr.pincode ? `${addr.state} - ${addr.pincode}` : addr.state) : (addr.pincode || addr.postalCode)
                  ].filter(Boolean);

                  return (
                    <div 
                      key={idx}
                      onClick={() => setSelectedAddressIndex(idx)}
                      style={{ 
                        background: selectedAddressIndex === idx ? '#f8fafc' : '#fff',
                        border: selectedAddressIndex === idx ? '2px solid var(--secondary-color)' : '1px solid #e2e8f0',
                        borderRadius: '12px',
                        padding: isPhone ? '12px 10px' : '16px',
                        cursor: 'pointer',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                        position: 'relative',
                        transition: 'all 0.2s',
                        boxShadow: selectedAddressIndex === idx ? '0 4px 12px rgba(0,0,0,0.05)' : 'none'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', flex: 1, minWidth: 0 }}>
                        <input 
                          type="radio" 
                          name="selectedAddress" 
                          checked={selectedAddressIndex === idx} 
                          onChange={() => setSelectedAddressIndex(idx)}
                          style={{ cursor: 'pointer', marginTop: '3px', flexShrink: 0 }}
                        />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                            <strong style={{ fontSize: isPhone ? '0.88rem' : '0.95rem', color: '#1e293b' }}>
                              {displayName ? `${displayName} ${displayPhone ? `(${displayPhone})` : ''}` : `Delivery Address ${idx + 1}`}
                            </strong>
                            {selectedAddressIndex === idx && (
                              <span style={{ fontSize: '0.62rem', background: '#007185', color: '#fff', padding: '2px 8px', borderRadius: '10px', fontWeight: '800', whiteSpace: 'nowrap', flexShrink: 0 }}>
                                DELIVER HERE
                              </span>
                            )}
                          </div>
                          <p style={{ fontSize: isPhone ? '0.78rem' : '0.85rem', color: '#64748b', lineHeight: '1.4', margin: 0, wordBreak: 'break-word' }}>
                            {addressParts.join(', ')}
                          </p>
                        </div>
                      </div>
                      
                      <div style={{ display: 'flex', gap: '4px', marginLeft: '6px', flexShrink: 0 }}>
                        <button 
                          type="button" 
                          onClick={(e) => handleEditAddressClick(idx, e)}
                          style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', fontSize: '0.88rem', padding: '4px' }}
                          title="Edit address details"
                        >
                          <i className="fa-solid fa-pen-to-square"></i>
                        </button>
                        <button 
                          type="button" 
                          onClick={(e) => handleDeleteAddress(idx, e)}
                          style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '0.88rem', padding: '4px' }}
                          title="Delete address"
                        >
                          <i className="fa-solid fa-trash"></i>
                        </button>
                      </div>
                    </div>
                  );
                })}

                <button 
                  type="button" 
                  onClick={handleAddNewAddressClick} 
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', background: 'none', border: '1px dashed #cbd5e1', padding: '14px', borderRadius: '12px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: '700', color: 'var(--secondary-color)', width: '100%', transition: 'all 0.2s', marginTop: '10px' }}
                >
                  <i className="fa-solid fa-plus"></i> Add New Address
                </button>
              </div>
            ) : (
              // Add / Edit Address Form Panel
              <form onSubmit={handleSaveAddressToList} style={{ background: '#f8fafc', border: '1px dashed #cbd5e1', borderRadius: '12px', padding: isPhone ? '14px 10px' : '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <label style={{ fontSize: '0.9rem', fontWeight: '800', color: 'var(--primary-color)' }}>
                    {editIndex !== null ? '✏️ Edit Shipping Details' : '➕ Add New Delivery Address'}
                  </label>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button type="button" onClick={handleUseLiveLocation} disabled={locating} style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'var(--secondary-color)', border: 'none', color: '#fff', fontSize: '0.72rem', padding: '6px 10px', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' }}>
                      {locating ? <i className="fa-solid fa-spinner fa-spin"></i> : <i className="fa-solid fa-crosshairs"></i>}
                      Live GPS
                    </button>
                    <button type="button" onClick={() => setShowMapModal(true)} style={{ display: 'flex', alignItems: 'center', gap: '4px', background: '#3b82f6', border: 'none', color: '#fff', fontSize: '0.72rem', padding: '6px 10px', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' }}>
                      <i className="fa-solid fa-map"></i> Pin on Map
                    </button>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: isPhone ? '1fr' : '1fr 1fr', gap: isPhone ? '10px' : '14px' }}>
                    <div>
                      <label style={{ fontSize: '0.85rem', fontWeight: '600', color: '#475569', display: 'block', marginBottom: '4px' }}>Name *</label>
                      <input type="text" className="form-input" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Enter Name" required />
                    </div>
                    <div>
                      <label style={{ fontSize: '0.85rem', fontWeight: '600', color: '#475569', display: 'block', marginBottom: '4px' }}>Phone Number *</label>
                      <input type="tel" className="form-input" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Enter Phone Number" required />
                    </div>
                  </div>

                  <div>
                    <label style={{ fontSize: '0.85rem', fontWeight: '600', color: '#475569', display: 'block', marginBottom: '4px' }}>House / Flat / Block No, Building Name *</label>
                    <input type="text" className="form-input" value={houseNo} onChange={(e) => setHouseNo(e.target.value)} placeholder="e.g. Flat 402, Block-B, Royal Residency" required />
                  </div>

                  <div>
                    <label style={{ fontSize: '0.85rem', fontWeight: '600', color: '#475569', display: 'block', marginBottom: '4px' }}>Road Name, Area, Colony *</label>
                    <input type="text" className="form-input" value={street} onChange={(e) => setStreet(e.target.value)} placeholder="e.g. University Campus Road, Sector 12" required />
                  </div>

                  <div>
                    <label style={{ fontSize: '0.85rem', fontWeight: '600', color: '#475569', display: 'block', marginBottom: '4px' }}>Landmark (Optional)</label>
                    <input type="text" className="form-input" value={landmark} onChange={(e) => setLandmark(e.target.value)} placeholder="e.g. Near Metro Station / Opp Supermarket" />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: isPhone ? '1fr' : '1fr 1fr 1fr', gap: isPhone ? '10px' : '14px' }}>
                    <div>
                      <label style={{ fontSize: '0.85rem', fontWeight: '600', color: '#475569', display: 'block', marginBottom: '4px' }}>Postal Pincode *</label>
                      <input type="text" className="form-input" value={postalCode} onChange={handlePincodeChange} placeholder="e.g. 500001" required />
                    </div>
                    <div>
                      <label style={{ fontSize: '0.85rem', fontWeight: '600', color: '#475569', display: 'block', marginBottom: '4px' }}>City *</label>
                      <input type="text" className="form-input" value={city} onChange={(e) => setCity(e.target.value)} placeholder="City" required />
                    </div>
                    <div>
                      <label style={{ fontSize: '0.85rem', fontWeight: '600', color: '#475569', display: 'block', marginBottom: '4px' }}>State *</label>
                      <input type="text" className="form-input" value={state} onChange={(e) => setState(e.target.value)} placeholder="State" required />
                    </div>
                  </div>

                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', color: '#4b5563', cursor: 'pointer', userSelect: 'none', marginTop: '4px' }}>
                    <input type="checkbox" checked={saveToProfile} onChange={(e) => setSaveToProfile(e.target.checked)} />
                    Save this address to my profile address book
                  </label>

                  <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                    <button type="submit" className="btn btn-primary" style={{ padding: '10px 20px', fontSize: '0.85rem' }}>
                      Save Address Details
                    </button>
                    {savedAddresses.length > 0 && (
                      <button 
                        type="button" 
                        onClick={() => { setIsEditingAddress(false); setEditIndex(null); }} 
                        style={{ background: '#fff', border: '1px solid #cbd5e1', padding: '10px 20px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: '600', color: '#64748b' }}
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
              </form>
            )}
          </div>

          {/* PAYMENT METHOD */}
          <div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: '700', marginBottom: '16px', borderBottom: '1px solid #eee', paddingBottom: '8px' }}>
              2. Payment Method
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
              <label style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', padding: '12px', border: '1px solid #ddd', borderRadius: '6px', cursor: 'pointer' }}>
                <input type="radio" name="payMethod" value="Cash on Delivery (COD)" checked={paymentMethod === 'Cash on Delivery (COD)'} onChange={() => setPaymentMethod('Cash on Delivery (COD)')} style={{ marginTop: '3px', flexShrink: 0 }} />
                <div>
                  <strong style={{ fontSize: isPhone ? '0.86rem' : '0.95rem' }}>Cash on Delivery (COD) <span style={{ color: '#ef4444', fontSize: '0.78rem' }}>(+₹10 Convenience Fee applies)</span></strong>
                  <p style={{ fontSize: '0.78rem', color: '#666', margin: '2px 0 0 0' }}>Pay cash or UPI upon delivery at your doorstep.</p>
                </div>
              </label>

              <label style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', padding: '12px', border: '1px solid #ddd', borderRadius: '6px', cursor: 'pointer' }}>
                <input type="radio" name="payMethod" value="Online Payment (Credit/Debit/UPI)" checked={paymentMethod === 'Online Payment (Credit/Debit/UPI)'} onChange={() => setPaymentMethod('Online Payment (Credit/Debit/UPI)')} style={{ marginTop: '3px', flexShrink: 0 }} />
                <div>
                  <strong style={{ fontSize: isPhone ? '0.86rem' : '0.95rem' }}>Online Card / UPI Payment (Instant Receipt) <span style={{ color: '#22c55e', fontSize: '0.78rem' }}>(No Convenience Fees)</span></strong>
                  <p style={{ fontSize: '0.78rem', color: '#666', margin: '2px 0 0 0' }}>Visa, Mastercard, RuPay &amp; Unified Payments Interface.</p>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* ORDER REVIEW CARD */}
        <aside className="summary-card" style={{ height: 'fit-content' }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: '700', borderBottom: '2px solid #eee', paddingBottom: '10px', marginBottom: '14px' }}>
            Items in Order ({cart.length})
          </h3>

          {cart.map((item, idx) => (
            <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', fontSize: isPhone ? '0.82rem' : '0.88rem', gap: '8px' }}>
              <span style={{ wordBreak: 'break-word', flex: 1 }}>{item.name} &times; {item.quantity}</span>
              <strong style={{ flexShrink: 0, whiteSpace: 'nowrap' }}>{formatINR(item.price * item.quantity)}</strong>
            </div>
          ))}

          {/* Offers Selector Dropdown */}
          <div style={{ borderTop: '1px dashed #cbd5e1', padding: '16px 0 0 0', marginTop: '14px' }}>
            <label style={{ fontSize: '0.8rem', fontWeight: '700', color: '#475569', display: 'block', marginBottom: '6px' }}>
              🉐 Select Coupon Offer Code
            </label>
            <select 
              value={selectedOfferCode} 
              onChange={(e) => handleOfferSelect(e.target.value)} 
              className="form-input" 
              style={{ width: '100%', padding: '8px', borderRadius: '6px', fontSize: '0.85rem' }}
            >
              <option value="">-- Apply Promotional Coupon --</option>
              <option value="NOVAKART20" disabled={!firstOrderEligible}>
                NOVAKART20 - First Order (₹50 Off) {!firstOrderEligible && '(First Order Only)'}
              </option>
              <option value="SUPER200" disabled={subtotal < 2000}>
                SUPER200 - Orders over ₹2000 (₹200 Off) {subtotal < 2000 && `(Spend ₹${2000 - subtotal} more)`}
              </option>
              <option value="FESTIVE100" disabled={subtotal < 1200}>
                FESTIVE100 - Orders over ₹1200 (₹100 Off) {subtotal < 1200 && `(Spend ₹${1200 - subtotal} more)`}
              </option>
            </select>
            {offerError && (
              <span style={{ display: 'block', marginTop: '6px', fontSize: '0.72rem', color: '#d97706', fontWeight: '600' }}>
                <i className="fa-solid fa-circle-exclamation"></i> {offerError}
              </span>
            )}
            {selectedOfferCode && !offerError && (
              <span style={{ display: 'block', marginTop: '6px', fontSize: '0.75rem', color: '#2e7d32', fontWeight: '700' }}>
                🎉 Coupon Applied: -{formatINR(promoDiscount)}
              </span>
            )}
          </div>

          {/* Apply Gift Card Code widget */}
          <div style={{ borderBottom: '1px dashed #cbd5e1', padding: '14px 0 16px 0', marginBottom: '14px' }}>
            <label style={{ fontSize: '0.8rem', fontWeight: '700', color: '#475569', display: 'block', marginBottom: '6px' }}>
              🎁 Have a Rewards Gift Card?
            </label>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input 
                type="text" 
                value={giftCardCodeInput} 
                onChange={(e) => setGiftCardCodeInput(e.target.value)} 
                placeholder="Enter GC-XXXXXX"
                className="form-input" 
                style={{ padding: '6px 10px', fontSize: '0.8rem', flex: 1, minWidth: 0 }}
              />
              <button 
                type="button" 
                onClick={handleApplyGiftCard}
                style={{ background: 'var(--secondary-color)', color: '#fff', border: 'none', padding: '6px 14px', borderRadius: '6px', fontSize: '0.8rem', fontWeight: '700', cursor: 'pointer', flexShrink: 0 }}
              >
                Apply
              </button>
            </div>
            {appliedGiftCard && (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px', fontSize: '0.78rem', color: '#2e7d32', fontWeight: '700', background: '#e8f5e9', padding: '6px 10px', borderRadius: '6px' }}>
                <span>Applied: {appliedGiftCard.code} (-₹{appliedGiftCard.amount})</span>
                <span onClick={handleRemoveGiftCard} style={{ color: '#ef4444', cursor: 'pointer', fontWeight: 'bold' }}>Remove</span>
              </div>
            )}
            {giftCardError && (
              <span style={{ display: 'block', marginTop: '6px', fontSize: '0.72rem', color: '#ef4444', fontWeight: '600' }}>
                <i className="fa-solid fa-triangle-exclamation"></i> {giftCardError}
              </span>
            )}
          </div>

          {/* Pricing Summary Breakdown */}
          <div style={{ marginTop: '14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '0.85rem' }}>
              <span>Items Total:</span>
              <span>{formatINR(subtotal)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '0.85rem' }}>
              <span>Taxes &amp; Fees:</span>
              <span>{formatINR(tax)}</span>
            </div>
            
            {/* Delivery charge breakdown layout */}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '0.85rem' }}>
              <span>Delivery Charges:</span>
              <span>{formatINR(standardShipping)}</span>
            </div>
            {isFreeDelivery && (
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', color: '#2e7d32', fontSize: '0.85rem', fontWeight: '600' }}>
                <span>Free Delivery Applied:</span>
                <span>-{formatINR(standardShipping)}</span>
              </div>
            )}

            {/* COD Convenience fee */}
            {convenienceFee > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', color: '#dc2626', fontSize: '0.85rem', fontWeight: '600' }}>
                <span>COD Convenience Fee:</span>
                <span>+{formatINR(convenienceFee)}</span>
              </div>
            )}

            {/* Promo code discount */}
            {promoDiscount > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', color: '#2e7d32', fontSize: '0.85rem' }}>
                <span>Promo Coupon Discount:</span>
                <span>-{formatINR(promoDiscount)}</span>
              </div>
            )}

            {/* Gift card discount */}
            {appliedGiftCard && (
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', color: '#2e7d32', fontSize: '0.85rem' }}>
                <span>Gift Card Discount:</span>
                <span>-{formatINR(appliedGiftCard.amount)}</span>
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.25rem', fontWeight: '800', marginTop: '12px', color: 'var(--primary-color)', borderTop: '2px double #eee', paddingTop: '10px' }}>
              <span>Total Payable:</span>
              <span>{formatINR(payableTotal)}</span>
            </div>

            <button 
              type="button" 
              onClick={handlePlaceOrder}
              className="btn btn-primary" 
              style={{ width: '100%', padding: '14px', fontSize: '1rem', marginTop: '16px', fontWeight: '700' }} 
              disabled={loading || isEditingAddress}
            >
              {isEditingAddress ? 'Please Save Address Details First' : loading ? 'Placing Order...' : `Confirm Order (${formatINR(payableTotal)})`}
            </button>
          </div>
        </aside>
      </div>

      {/* Interactive Map Modal (Rapido-style Pinning) */}
      {showMapModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 10000 }}>
          <div style={{ background: '#fff', width: '90%', maxWidth: '500px', borderRadius: '16px', padding: '24px', boxShadow: '0 10px 40px rgba(0,0,0,0.2)', position: 'relative' }}>
            
            {/* Modal Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: '800', color: 'var(--primary-color)', margin: 0 }}>🎯 Pin Delivery Location</h3>
                <p style={{ fontSize: '0.78rem', color: '#64748b', margin: '2px 0 0 0' }}>Drag the marker or click map to pinpoint your location.</p>
              </div>
              <button onClick={() => setShowMapModal(false)} style={{ border: 'none', background: 'none', fontSize: '1.25rem', cursor: 'pointer', color: '#94a3b8' }}>
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>

            {/* Map Canvas */}
            <div 
              ref={mapRef} 
              id="profile-map" 
              style={{ width: '100%', height: '320px', borderRadius: '12px', border: '1px solid #e2e8f0', background: '#f8fafc', position: 'relative' }}
            >
              {!mapLoaded && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                  <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: '1.5rem', color: 'var(--secondary-color)' }}></i>
                  <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Loading map system...</span>
                </div>
              )}
            </div>

            {/* Address Preview Bar */}
            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '12px', margin: '14px 0', minHeight: '50px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.72rem', fontWeight: '700', color: 'var(--secondary-color)', marginBottom: '4px' }}>
                <i className="fa-solid fa-location-dot"></i> Pinned Coordinates Address
              </div>
              <p style={{ fontSize: '0.8rem', color: '#334155', margin: 0, lineHeight: '1.35' }}>
                {reverseGeocoding ? (
                  <span style={{ color: '#94a3b8' }}><i className="fa-solid fa-spinner fa-spin"></i> Resolving pinned location details...</span>
                ) : (
                  mapSelectedAddress || 'Locating pinned coordinates...'
                )}
              </p>
            </div>

            {/* Confirm Button */}
            <button 
              type="button" 
              onClick={handleConfirmMapLocation}
              disabled={reverseGeocoding}
              style={{ width: '100%', background: 'var(--secondary-color)', color: '#fff', border: 'none', padding: '12px', borderRadius: '8px', fontWeight: '700', fontSize: '0.9rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
            >
              <i className="fa-solid fa-circle-check"></i> Confirm Pinned Address
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
