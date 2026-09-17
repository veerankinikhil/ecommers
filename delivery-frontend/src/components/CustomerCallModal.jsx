import React, { useState, useEffect } from 'react';

export default function CustomerCallModal({ order, onClose, onCallCompleted }) {
  if (!order) return null;

  const [callState, setCallState] = useState('DIALING'); // 'DIALING', 'CONNECTED', 'ENDED'
  const [secondsElapsed, setSecondsElapsed] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeaker, setIsSpeaker] = useState(true);

  const customerName = order.deliveryAddress?.fullName || 'Customer';
  const customerPhone = order.deliveryAddress?.phone || '+91 98765 43210';
  const deliveryCity = order.deliveryAddress?.city || 'Delivery Address';
  const orderNumber = order.orderNumber || 'ORD';

  // Simulate ringing -> connect after 2 seconds
  useEffect(() => {
    let connectTimer;
    if (callState === 'DIALING') {
      connectTimer = setTimeout(() => {
        setCallState('CONNECTED');
      }, 2200);
    }
    return () => clearTimeout(connectTimer);
  }, [callState]);

  // Timer when connected
  useEffect(() => {
    let interval;
    if (callState === 'CONNECTED') {
      interval = setInterval(() => {
        setSecondsElapsed(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [callState]);

  const formatCallTime = (secs) => {
    const mins = Math.floor(secs / 60);
    const remainderSecs = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${remainderSecs.toString().padStart(2, '0')}`;
  };

  const handleEndCall = (outcome = 'CUSTOMER_CONFIRMED') => {
    setCallState('ENDED');
    setTimeout(() => {
      if (onCallCompleted) {
        onCallCompleted(outcome, {
          durationSecs: secondsElapsed,
          timestamp: new Date()
        });
      }
      onClose();
    }, 600);
  };

  return (
    <div style={{
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      width: '100%',
      height: '100%',
      borderRadius: 'inherit',
      overflow: 'hidden',
      background: 'rgba(2, 6, 23, 0.95)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      alignItems: 'center',
      zIndex: 6000,
      padding: '24px 20px 20px 20px',
      color: '#FFFFFF',
      fontFamily: 'sans-serif'
    }}>
      {/* Top Security Banner */}
      <div style={{ textAlign: 'center', width: '100%' }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          background: 'rgba(16, 185, 129, 0.18)',
          border: '1px solid rgba(16, 185, 129, 0.35)',
          padding: '4px 12px',
          borderRadius: '20px',
          fontSize: '0.72rem',
          fontWeight: '800',
          color: '#34D399',
          letterSpacing: '0.5px'
        }}>
          <i className="fa-solid fa-shield-halved"></i> NUMBER MASKED &bull; SECURE FLEET DIAL
        </div>
        <div style={{ fontSize: '0.74rem', color: '#94A3B8', marginTop: '6px' }}>
          Delivery Handover Pre-Verification &bull; Order #{orderNumber}
        </div>
      </div>

      {/* Center Caller Profile & Animated Pulse Waves */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', margin: 'auto 0' }}>
        {/* Pulsing Avatar */}
        <div style={{ position: 'relative', width: '110px', height: '110px', marginBottom: '24px' }}>
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            borderRadius: '50%',
            background: 'rgba(16, 185, 129, 0.25)',
            animation: 'pulse 2s infinite'
          }} />
          <div style={{
            position: 'absolute',
            top: '8px',
            left: '8px',
            right: '8px',
            bottom: '8px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #1E3A8A 0%, #0F172A 100%)',
            border: '3px solid #10B981',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '2.5rem',
            color: '#FFFFFF',
            boxShadow: '0 8px 30px rgba(16, 185, 129, 0.4)'
          }}>
            <i className="fa-solid fa-user"></i>
          </div>
        </div>

        {/* Customer Details */}
        <h2 style={{ fontSize: '1.45rem', fontWeight: '800', margin: '0 0 6px 0', letterSpacing: '-0.3px', textAlign: 'center' }}>
          {customerName}
        </h2>
        <div style={{ fontSize: '0.95rem', color: '#38BDF8', fontWeight: '700', fontFamily: 'monospace', marginBottom: '6px' }}>
          {customerPhone}
        </div>
        <div style={{ fontSize: '0.78rem', color: '#CBD5E1', marginBottom: '14px' }}>
          📍 Drop Location: <strong>{deliveryCity}</strong>
        </div>

        {/* Live Call Status / Timer */}
        <div style={{
          background: callState === 'CONNECTED' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(245, 158, 11, 0.2)',
          border: `1px solid ${callState === 'CONNECTED' ? '#10B981' : '#F59E0B'}`,
          color: callState === 'CONNECTED' ? '#34D399' : '#FBBF24',
          padding: '6px 16px',
          borderRadius: '20px',
          fontWeight: '800',
          fontSize: '0.85rem',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          fontFamily: 'monospace'
        }}>
          {callState === 'DIALING' && (
            <>
              <i className="fa-solid fa-phone-volume fa-shake"></i> Calling customer...
            </>
          )}
          {callState === 'CONNECTED' && (
            <>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10B981', display: 'inline-block' }}></span>
              Connected: {formatCallTime(secondsElapsed)}
            </>
          )}
          {callState === 'ENDED' && (
            <>
              <i className="fa-solid fa-phone-slash"></i> Call Completed
            </>
          )}
        </div>

        {/* Native Cellular Dial Backup Button */}
        <div style={{ marginTop: '16px' }}>
          <a
            href={`tel:${customerPhone}`}
            style={{
              fontSize: '0.74rem',
              color: '#94A3B8',
              textDecoration: 'underline',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            <i className="fa-solid fa-sim-card"></i> Open in Device Phone Dial App
          </a>
        </div>
      </div>

      {/* Mid Action Buttons: Mute, Speaker, Keypad */}
      <div style={{ display: 'flex', gap: '24px', marginBottom: '24px' }}>
        <button
          type="button"
          onClick={() => setIsMuted(!isMuted)}
          style={{
            width: '54px',
            height: '54px',
            borderRadius: '50%',
            background: isMuted ? '#EF4444' : 'rgba(255,255,255,0.12)',
            border: 'none',
            color: '#fff',
            fontSize: '1.2rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.15s'
          }}
          title={isMuted ? 'Unmute' : 'Mute'}
        >
          <i className={`fa-solid ${isMuted ? 'fa-microphone-slash' : 'fa-microphone'}`}></i>
        </button>

        <button
          type="button"
          onClick={() => setIsSpeaker(!isSpeaker)}
          style={{
            width: '54px',
            height: '54px',
            borderRadius: '50%',
            background: isSpeaker ? '#2563EB' : 'rgba(255,255,255,0.12)',
            border: 'none',
            color: '#fff',
            fontSize: '1.2rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.15s'
          }}
          title={isSpeaker ? 'Speaker Active' : 'Earpiece'}
        >
          <i className="fa-solid fa-volume-high"></i>
        </button>

        <button
          type="button"
          onClick={() => alert(`Customer Instructions:\n"Ring flat bell or call on arrival. Deliver package at door."`)}
          style={{
            width: '54px',
            height: '54px',
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.12)',
            border: 'none',
            color: '#fff',
            fontSize: '1.2rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
          title="Delivery Notes"
        >
          <i className="fa-solid fa-clipboard-list"></i>
        </button>
      </div>

      {/* Pre-Delivery Handover Confirmation Options */}
      <div style={{ width: '100%', maxWidth: '360px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <button
          type="button"
          onClick={() => handleEndCall('CUSTOMER_CONFIRMED')}
          style={{
            width: '100%',
            background: '#10B981',
            color: '#090D16',
            border: 'none',
            padding: '12px 18px',
            borderRadius: '10px',
            fontWeight: '800',
            fontSize: '0.88rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            boxShadow: '0 4px 14px rgba(16, 185, 129, 0.4)'
          }}
        >
          <i className="fa-solid fa-circle-check"></i> Customer Confirmed &bull; Ready for Handover
        </button>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            type="button"
            onClick={() => handleEndCall('LEAVE_AT_GATE')}
            style={{
              flex: 1,
              background: 'rgba(255,255,255,0.12)',
              color: '#FFFFFF',
              border: '1px solid rgba(255,255,255,0.2)',
              padding: '10px',
              borderRadius: '8px',
              fontWeight: '700',
              fontSize: '0.74rem',
              cursor: 'pointer'
            }}
          >
            Leave at Security Gate
          </button>
          <button
            type="button"
            onClick={() => handleEndCall('CUSTOMER_UNREACHABLE')}
            style={{
              flex: 1,
              background: 'rgba(239, 68, 68, 0.2)',
              color: '#F87171',
              border: '1px solid rgba(239, 68, 68, 0.4)',
              padding: '10px',
              borderRadius: '8px',
              fontWeight: '700',
              fontSize: '0.74rem',
              cursor: 'pointer'
            }}
          >
            Unreachable / Retry
          </button>
        </div>

        {/* End Call Button */}
        <button
          type="button"
          onClick={() => handleEndCall('CALL_ENDED')}
          style={{
            width: '100%',
            background: '#DC2626',
            color: '#FFFFFF',
            border: 'none',
            padding: '12px',
            borderRadius: '10px',
            fontWeight: '800',
            fontSize: '0.88rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            marginTop: '4px'
          }}
        >
          <i className="fa-solid fa-phone-slash"></i> End Call
        </button>
      </div>
    </div>
  );
}
