import React, { useState, useEffect, useRef } from 'react';
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode';
import deliveryApi from '../services/deliveryApi';
import BarcodeVisual from './BarcodeVisual';

const SUPPORTED_BARCODE_FORMATS = [
  Html5QrcodeSupportedFormats.CODE_128,
  Html5QrcodeSupportedFormats.CODE_39,
  Html5QrcodeSupportedFormats.EAN_13,
  Html5QrcodeSupportedFormats.EAN_8,
  Html5QrcodeSupportedFormats.UPC_A,
  Html5QrcodeSupportedFormats.UPC_E,
  Html5QrcodeSupportedFormats.QR_CODE,
  Html5QrcodeSupportedFormats.CODABAR,
  Html5QrcodeSupportedFormats.ITF
];

export default function BarcodeScannerModal({ isOpen, onClose, onOrderClaimed }) {
  const [activeTab, setActiveTab] = useState('camera');
  const [searchCode, setSearchCode] = useState('');
  const [scanning, setScanning] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [dockPackages, setDockPackages] = useState([]);
  const [loadingDock, setLoadingDock] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState('');
  const [isTorchOn, setIsTorchOn] = useState(false);
  const [scannedAnim, setScannedAnim] = useState(false);
  const [availableCameras, setAvailableCameras] = useState([]);
  const [selectedCameraId, setSelectedCameraId] = useState('');
  const [requestingPerm, setRequestingPerm] = useState(false);
  const [permissionBlocked, setPermissionBlocked] = useState(false);

  const scannerRef = useRef(null);
  const isStartingRef = useRef(false);

  const handleSwitchToHttps = () => {
    try {
      const token = localStorage.getItem('novakart_delivery_token') || '';
      const user = localStorage.getItem('novakart_delivery_user') || '';
      let target = `https://${window.location.hostname}:3002${window.location.pathname}`;
      if (token) {
        target += `?auth_token=${encodeURIComponent(token)}&auth_user=${encodeURIComponent(user)}`;
      }
      window.location.href = target;
    } catch (e) {
      window.location.protocol = 'https:';
    }
  };


  const playScanBeep = () => {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(960, ctx.currentTime);
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.15);
    } catch (e) {}
  };

  const fetchDockPackages = async () => {
    setLoadingDock(true);
    try {
      const { data } = await deliveryApi.get('/delivery/warehouse-dock-packages');
      if (data.packages) {
        setDockPackages(data.packages);
      }
    } catch (err) {
      console.error('Failed to load dock packages', err);
    } finally {
      setLoadingDock(false);
    }
  };

  // Explicitly prompt for camera permission using standard getUserMedia API,
  // enumerate cameras, and start in-screen continuous barcode scanning
  const requestCameraPermissionAndStart = async (overrideCameraId = null) => {
    if (isStartingRef.current) return;
    isStartingRef.current = true;
    setRequestingPerm(true);
    setCameraError('');
    setPermissionBlocked(false);

    try {
      // 1. Check if mediaDevices is supported in current context
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        const isSecure = window.isSecureContext;
        if (!isSecure && window.location.protocol === 'http:' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
          throw new Error('SECURE_CONTEXT_REQUIRED');
        }
        throw new Error('Camera API (getUserMedia) is not supported in this browser.');
      }

      // 2. Request browser camera permission dialog explicitly
      let probeStream = null;
      try {
        probeStream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: 'environment' } }
        });
      } catch (firstErr) {
        console.warn('Probe with ideal environment failed, attempting fallback:', firstErr);
        if (firstErr.name === 'NotAllowedError' || firstErr.name === 'PermissionDeniedError') {
          setPermissionBlocked(true);
          throw new Error('PERMISSION_DENIED');
        }
        // Fallback to simple video constraint for desktop/laptop webcams
        try {
          probeStream = await navigator.mediaDevices.getUserMedia({ video: true });
        } catch (secondErr) {
          if (secondErr.name === 'NotAllowedError' || secondErr.name === 'PermissionDeniedError') {
            setPermissionBlocked(true);
            throw new Error('PERMISSION_DENIED');
          }
          throw secondErr;
        }
      }

      // Stop probe stream so device is released for Html5Qrcode
      if (probeStream) {
        probeStream.getTracks().forEach(track => track.stop());
      }

      // 3. Enumerate available cameras
      let devices = [];
      try {
        devices = await Html5Qrcode.getCameras();
        if (devices && devices.length > 0) {
          setAvailableCameras(devices);
        }
      } catch (enumErr) {
        console.warn('Failed to enumerate cameras:', enumErr);
      }

      // 4. Select best camera
      let targetCameraId = overrideCameraId;
      if (!targetCameraId && devices && devices.length > 0) {
        // Prioritize rear/back camera
        const backCamera = devices.find(d => {
          const lbl = (d.label || '').toLowerCase();
          return lbl.includes('back') || lbl.includes('rear') || lbl.includes('environment');
        });
        targetCameraId = backCamera ? backCamera.id : devices[0].id;
      }

      if (targetCameraId) {
        setSelectedCameraId(targetCameraId);
      }

      // 5. Ensure previous scanner is cleanly stopped
      if (scannerRef.current) {
        try {
          if (scannerRef.current.isScanning) {
            await scannerRef.current.stop();
          }
          scannerRef.current.clear();
        } catch (e) {}
        scannerRef.current = null;
      }

      const container = document.getElementById('delivery-barcode-reader');
      if (!container) {
        throw new Error('Scanner container element not found.');
      }

      const html5QrCode = new Html5Qrcode('delivery-barcode-reader', {
        formatsToSupport: SUPPORTED_BARCODE_FORMATS,
        verbose: false,
        experimentalFeatures: {
          useBarCodeDetectorIfSupported: true
        }
      });
      scannerRef.current = html5QrCode;

      const config = {
        fps: 20,
        qrbox: (viewfinderWidth, viewfinderHeight) => {
          const width = Math.floor(Math.min(viewfinderWidth * 0.92, 340));
          const height = Math.floor(Math.min(viewfinderHeight * 0.78, 220));
          return { width, height };
        },
        aspectRatio: 1.333
      };

      const cameraConstraint = targetCameraId ? targetCameraId : { facingMode: { ideal: 'environment' } };

      try {
        await html5QrCode.start(
          cameraConstraint,
          config,
          (decodedText) => {
            handleBarcodeDetected(decodedText);
          },
          () => {
            // Continuous frame scan without match
          }
        );
      } catch (startErr) {
        console.warn('Initial camera start failed, trying fallback video constraint:', startErr);
        await html5QrCode.start(
          true,
          config,
          (decodedText) => {
            handleBarcodeDetected(decodedText);
          },
          () => {}
        );
      }


      setCameraActive(true);
      setCameraError('');
      setPermissionBlocked(false);
    } catch (err) {
      console.warn('Camera start error:', err);
      setCameraActive(false);

      if (err.message === 'PERMISSION_DENIED') {
        setPermissionBlocked(true);
        setCameraError('Camera access was blocked by your browser. Please tap the lock or camera icon in your address bar, set Camera to "Allow", and try again.');
      } else if (err.message === 'SECURE_CONTEXT_REQUIRED') {
        setCameraError('🔒 Browser requires HTTPS or localhost for in-screen camera. On phone via LAN, you can use Staged Packages or enter the Order ID.');
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        setCameraError('No camera found on this device. You can enter the package code manually below.');
      } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
        setCameraError('Camera is currently in use by another application. Please close other camera apps and retry.');
      } else {
        setCameraError(err.message || 'Camera permission required or device camera is currently in use.');
      }
    } finally {
      setRequestingPerm(false);
      isStartingRef.current = false;
    }
  };

  const stopCamera = async () => {
    if (scannerRef.current) {
      try {
        if (scannerRef.current.isScanning) {
          await scannerRef.current.stop();
        }
        scannerRef.current.clear();
      } catch (e) {}
      scannerRef.current = null;
    }
    setCameraActive(false);
  };

  const switchCamera = async () => {
    if (!availableCameras || availableCameras.length <= 1) return;
    const currentIndex = availableCameras.findIndex(c => c.id === selectedCameraId);
    const nextIndex = (currentIndex + 1) % availableCameras.length;
    const nextCam = availableCameras[nextIndex];
    setSelectedCameraId(nextCam.id);
    await stopCamera();
    await requestCameraPermissionAndStart(nextCam.id);
  };

  useEffect(() => {
    if (isOpen) {
      setErrorMsg('');
      setSuccessMsg('');
      setCameraError('');
      fetchDockPackages();

      if (activeTab === 'camera') {
        const timer = setTimeout(() => {
          requestCameraPermissionAndStart();
        }, 200);
        return () => clearTimeout(timer);
      }
    } else {
      stopCamera();
    }

    return () => {
      stopCamera();
    };
  }, [isOpen, activeTab]);

  const handleBarcodeDetected = (code) => {
    if (!code || scanning) return;
    playScanBeep();
    setScannedAnim(true);
    setTimeout(() => setScannedAnim(false), 800);
    handleClaim(code);
  };

  const handleClaim = async (codeToClaim) => {
    const target = (codeToClaim || searchCode || '').trim();
    if (!target) {
      setErrorMsg('Please point camera at package barcode or enter the order number.');
      return;
    }

    playScanBeep();
    setScannedAnim(true);
    setTimeout(() => setScannedAnim(false), 600);

    setScanning(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const { data } = await deliveryApi.post('/delivery/warehouse-pickup/scan', {
        searchCode: target
      });

      if (data.success) {
        const claimed = data.claimedOrder;
        const sellerName = claimed?.sellerId?.storeName || 'Merchant Store';
        const customerName = claimed?.deliveryAddress?.fullName || 'Customer';
        const area = claimed?.deliveryAddress?.city || 'Delivery Area';

        setSuccessMsg(
          `🎉 Package Scanned & Claimed!\n📦 Package: #${claimed?.orderNumber || target}\n🏪 Seller: ${sellerName}\n📍 Customer: ${customerName} (${area})\n🚀 Added to your active delivery route!`
        );
        setSearchCode('');
        fetchDockPackages();

        if (onOrderClaimed) {
          onOrderClaimed(data.claimedOrder, data.activeOrders);
        }
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || `Package #${target} not found or already assigned.`);
    } finally {
      setScanning(false);
    }
  };

  // Toggle Torch if supported
  const toggleTorch = async () => {
    try {
      if (scannerRef.current && scannerRef.current.isScanning) {
        const track = scannerRef.current.getRunningTrackCameraCapabilities();
        if (track && track.torchFeature()) {
          const newState = !isTorchOn;
          await track.torchFeature().apply(newState);
          setIsTorchOn(newState);
        } else {
          setIsTorchOn(!isTorchOn);
        }
      } else {
        setIsTorchOn(!isTorchOn);
      }
    } catch (e) {
      setIsTorchOn(!isTorchOn);
    }
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      width: '100%',
      height: '100%',
      background: '#090D16',
      color: '#FFFFFF',
      zIndex: 5000,
      display: 'flex',
      flexDirection: 'column',
      borderRadius: 'inherit',
      overflow: 'hidden',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
      {/* Laser Scanning Keyframes */}
      <style>{`
        @keyframes liveLaserScan {
          0% { top: 12%; opacity: 0.8; }
          50% { top: 88%; opacity: 1; }
          100% { top: 12%; opacity: 0.8; }
        }
        #delivery-barcode-reader video {
          width: 100% !important;
          height: 100% !important;
          object-fit: cover !important;
          border-radius: 14px !important;
        }
      `}</style>

      {/* ─── 1. TOP MOBILE HEADER ─── */}
      <div style={{
        padding: '14px 16px',
        background: '#0B1120',
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexShrink: 0
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            onClick={() => { stopCamera(); onClose(); }}
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              background: 'rgba(255, 255, 255, 0.08)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              color: '#FFFFFF',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '0.95rem'
            }}
            title="Close Scanner"
          >
            <i className="fa-solid fa-arrow-left"></i>
          </button>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: cameraActive ? '#10B981' : '#F59E0B',
                boxShadow: cameraActive ? '0 0 8px #10B981' : '0 0 8px #F59E0B'
              }}></span>
              <h2 style={{ fontSize: '0.98rem', fontWeight: '800', margin: 0, color: '#FFFFFF' }}>
                Seller Package Scanner
              </h2>
            </div>
            <span style={{ fontSize: '0.68rem', color: '#94A3B8' }}>
              {cameraActive ? 'In-Screen Auto Scanner Active' : 'Point camera at seller package barcode'}
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          {activeTab === 'camera' && availableCameras.length > 1 && (
            <button
              onClick={switchCamera}
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                background: 'rgba(255, 255, 255, 0.08)',
                color: '#FFFFFF',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.85rem'
              }}
              title="Flip / Switch Camera (Back / Front)"
            >
              <i className="fa-solid fa-camera-rotate"></i>
            </button>
          )}

          {activeTab === 'camera' && (
            <button
              onClick={toggleTorch}
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                background: isTorchOn ? '#F59E0B' : 'rgba(255, 255, 255, 0.08)',
                color: isTorchOn ? '#090D16' : '#FFFFFF',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              title="Toggle Torch / Flashlight"
            >
              <i className="fa-solid fa-bolt"></i>
            </button>
          )}

          <button
            onClick={() => { stopCamera(); onClose(); }}
            style={{
              background: 'none',
              border: 'none',
              color: '#94A3B8',
              fontSize: '1.4rem',
              cursor: 'pointer',
              padding: '0 4px'
            }}
          >
            &times;
          </button>
        </div>
      </div>

      {/* ─── 2. TAB CONTROLS ─── */}
      <div style={{
        display: 'flex',
        background: '#0B1120',
        padding: '6px 12px',
        gap: '6px',
        flexShrink: 0
      }}>
        <button
          onClick={() => setActiveTab('camera')}
          style={{
            flex: 1,
            padding: '8px 6px',
            background: activeTab === 'camera' ? '#2563EB' : 'rgba(255, 255, 255, 0.05)',
            color: activeTab === 'camera' ? '#FFFFFF' : '#94A3B8',
            border: 'none',
            borderRadius: '8px',
            fontSize: '0.78rem',
            fontWeight: '700',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '5px'
          }}
        >
          <i className="fa-solid fa-camera"></i> Live Scanner
        </button>

        <button
          onClick={() => { stopCamera(); setActiveTab('input'); }}
          style={{
            flex: 1,
            padding: '8px 6px',
            background: activeTab === 'input' ? '#2563EB' : 'rgba(255, 255, 255, 0.05)',
            color: activeTab === 'input' ? '#FFFFFF' : '#94A3B8',
            border: 'none',
            borderRadius: '8px',
            fontSize: '0.78rem',
            fontWeight: '700',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '5px'
          }}
        >
          <i className="fa-solid fa-keyboard"></i> Order ID
        </button>

        <button
          onClick={() => { stopCamera(); setActiveTab('dock'); fetchDockPackages(); }}
          style={{
            flex: 1,
            padding: '8px 6px',
            background: activeTab === 'dock' ? '#2563EB' : 'rgba(255, 255, 255, 0.05)',
            color: activeTab === 'dock' ? '#FFFFFF' : '#94A3B8',
            border: 'none',
            borderRadius: '8px',
            fontSize: '0.78rem',
            fontWeight: '700',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '5px'
          }}
        >
          <i className="fa-solid fa-boxes-stacked"></i> Staged ({dockPackages.length})
        </button>
      </div>

      {/* ─── 3. SCROLLABLE SCREEN CONTENT ─── */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        overflowX: 'hidden',
        padding: '14px',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* Alerts */}
        {errorMsg && (
          <div style={{
            background: 'rgba(239, 68, 68, 0.16)',
            border: '1px solid rgba(239, 68, 68, 0.4)',
            color: '#FCA5A5',
            padding: '10px 12px',
            borderRadius: '10px',
            fontSize: '0.78rem',
            marginBottom: '12px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <i className="fa-solid fa-circle-exclamation" style={{ color: '#EF4444' }}></i>
            <div style={{ flex: 1 }}>{errorMsg}</div>
          </div>
        )}

        {successMsg && (
          <div style={{
            background: 'rgba(16, 185, 129, 0.18)',
            border: '1px solid rgba(16, 185, 129, 0.45)',
            color: '#6EE7B7',
            padding: '10px 12px',
            borderRadius: '10px',
            fontSize: '0.78rem',
            marginBottom: '12px',
            whiteSpace: 'pre-line',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '8px'
          }}>
            <i className="fa-solid fa-circle-check" style={{ color: '#10B981', marginTop: '2px' }}></i>
            <div style={{ flex: 1 }}>{successMsg}</div>
          </div>
        )}

        {/* ─── TAB 1: LIVE IN-SCREEN CAMERA SCANNER ─── */}
        {activeTab === 'camera' && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            {/* Viewfinder Container */}
            <div style={{
              position: 'relative',
              width: '100%',
              height: '240px',
              borderRadius: '16px',
              overflow: 'hidden',
              background: '#020617',
              border: scannedAnim ? '2px solid #10B981' : '1px solid rgba(255, 255, 255, 0.12)',
              boxShadow: scannedAnim ? '0 0 25px rgba(16, 185, 129, 0.7)' : 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '10px'
            }}>
              {/* Actual HTML5 Video Target */}
              <div
                id="delivery-barcode-reader"
                style={{
                  width: '100%',
                  height: '100%',
                  position: 'absolute',
                  inset: 0
                }}
              ></div>

              {/* Targeting Reticle Overlay */}
              <div style={{
                position: 'absolute',
                width: '78%',
                height: '65%',
                pointerEvents: 'none',
                zIndex: 10
              }}>
                <span style={{ position: 'absolute', top: 0, left: 0, width: '22px', height: '22px', borderTop: '3px solid #10B981', borderLeft: '3px solid #10B981', borderTopLeftRadius: '6px' }}></span>
                <span style={{ position: 'absolute', top: 0, right: 0, width: '22px', height: '22px', borderTop: '3px solid #10B981', borderRight: '3px solid #10B981', borderTopRightRadius: '6px' }}></span>
                <span style={{ position: 'absolute', bottom: 0, left: 0, width: '22px', height: '22px', borderBottom: '3px solid #10B981', borderLeft: '3px solid #10B981', borderBottomLeftRadius: '6px' }}></span>
                <span style={{ position: 'absolute', bottom: 0, right: 0, width: '22px', height: '22px', borderBottom: '3px solid #10B981', borderRight: '3px solid #10B981', borderBottomRightRadius: '6px' }}></span>

                {/* Sweeping laser animation */}
                <div style={{
                  position: 'absolute',
                  width: '100%',
                  height: '2px',
                  background: '#10B981',
                  boxShadow: '0 0 12px 2px #10B981',
                  animation: 'liveLaserScan 1.6s infinite ease-in-out'
                }}></div>
              </div>

              {/* Camera Overlays: Requesting Permission / Error / Idle / Active */}
              {requestingPerm ? (
                <div style={{
                  position: 'absolute',
                  inset: '12px',
                  background: 'rgba(15, 23, 42, 0.96)',
                  borderRadius: '12px',
                  padding: '16px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  textAlign: 'center',
                  zIndex: 20
                }}>
                  <div style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '50%',
                    border: '3px solid rgba(56, 189, 248, 0.2)',
                    borderTopColor: '#38BDF8',
                    animation: 'spin 0.8s linear infinite',
                    marginBottom: '10px'
                  }}></div>
                  <h4 style={{ margin: '0 0 4px 0', fontSize: '0.88rem', color: '#FFFFFF', fontWeight: '800' }}>
                    Requesting Camera Access...
                  </h4>
                  <p style={{ margin: 0, fontSize: '0.72rem', color: '#94A3B8', maxWidth: '240px' }}>
                    Please tap &ldquo;Allow&rdquo; on your browser prompt above to start live scanner.
                  </p>
                </div>
              ) : permissionBlocked ? (
                <div style={{
                  position: 'absolute',
                  inset: '12px',
                  background: 'rgba(15, 23, 42, 0.96)',
                  borderRadius: '12px',
                  padding: '16px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  textAlign: 'center',
                  zIndex: 20
                }}>
                  <i className="fa-solid fa-video-slash" style={{ fontSize: '1.8rem', color: '#EF4444', marginBottom: '8px' }}></i>
                  <h4 style={{ margin: '0 0 4px 0', fontSize: '0.88rem', color: '#FCA5A5', fontWeight: '800' }}>
                    Camera Access Blocked
                  </h4>
                  <p style={{ margin: '0 0 12px 0', fontSize: '0.72rem', color: '#CBD5E1', lineHeight: '1.35', maxWidth: '270px' }}>
                    1. Tap the 🔒 lock / camera icon in your address bar.<br />
                    2. Set Camera permission to <b>&ldquo;Allow&rdquo;</b>.<br />
                    3. Then tap the button below:
                  </p>
                  <button
                    onClick={() => requestCameraPermissionAndStart()}
                    style={{
                      background: '#2563EB',
                      color: '#FFFFFF',
                      border: 'none',
                      borderRadius: '20px',
                      padding: '9px 18px',
                      fontSize: '0.82rem',
                      fontWeight: '800',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      boxShadow: '0 4px 12px rgba(37, 99, 235, 0.4)'
                    }}
                  >
                    <i className="fa-solid fa-camera"></i> Allow Camera Access
                  </button>
                </div>
              ) : !cameraActive && cameraError ? (
                <div style={{
                  position: 'absolute',
                  inset: '12px',
                  background: 'rgba(15, 23, 42, 0.95)',
                  borderRadius: '12px',
                  padding: '16px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  textAlign: 'center',
                  zIndex: 20
                }}>
                  <i className="fa-solid fa-camera" style={{ fontSize: '1.8rem', color: '#38BDF8', marginBottom: '8px' }}></i>
                  <p style={{ fontSize: '0.76rem', color: '#E2E8F0', lineHeight: '1.4', margin: '0 0 12px 0', maxWidth: '280px' }}>
                    {cameraError}
                  </p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '100%', maxWidth: '280px' }}>
                    <button
                      type="button"
                      onClick={handleSwitchToHttps}
                      style={{
                        background: 'linear-gradient(135deg, #10B981, #059669)',
                        color: '#FFFFFF',
                        border: 'none',
                        borderRadius: '24px',
                        padding: '11px 18px',
                        fontSize: '0.86rem',
                        fontWeight: '800',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        boxShadow: '0 4px 14px rgba(16, 185, 129, 0.4)'
                      }}
                    >
                      <i className="fa-solid fa-shield-halved"></i> Open Secure HTTPS Camera
                    </button>

                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button
                        type="button"
                        onClick={() => { stopCamera(); setActiveTab('input'); }}
                        style={{
                          flex: 1,
                          background: '#2563EB',
                          color: '#FFFFFF',
                          border: 'none',
                          borderRadius: '20px',
                          padding: '8px 10px',
                          fontSize: '0.78rem',
                          fontWeight: '800',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '5px'
                        }}
                      >
                        <i className="fa-solid fa-keyboard"></i> Order ID
                      </button>

                      <button
                        type="button"
                        onClick={() => requestCameraPermissionAndStart()}
                        style={{
                          background: 'rgba(255, 255, 255, 0.08)',
                          color: '#E2E8F0',
                          border: '1px solid rgba(255, 255, 255, 0.15)',
                          borderRadius: '20px',
                          padding: '8px 12px',
                          fontSize: '0.78rem',
                          fontWeight: '700',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '5px'
                        }}
                      >
                        <i className="fa-solid fa-rotate-right"></i> Retry
                      </button>
                    </div>
                  </div>
                </div>
              ) : !cameraActive ? (
                <div style={{
                  position: 'absolute',
                  inset: '12px',
                  background: 'rgba(15, 23, 42, 0.92)',
                  borderRadius: '12px',
                  padding: '16px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  textAlign: 'center',
                  zIndex: 20
                }}>
                  <i className="fa-solid fa-camera" style={{ fontSize: '1.8rem', color: '#10B981', marginBottom: '8px' }}></i>
                  <h4 style={{ margin: '0 0 4px 0', fontSize: '0.88rem', color: '#FFFFFF', fontWeight: '800' }}>
                    Camera Scanner
                  </h4>
                  <p style={{ margin: '0 0 12px 0', fontSize: '0.72rem', color: '#94A3B8', maxWidth: '250px' }}>
                    Point camera at seller shipping barcode to claim and pick up.
                  </p>
                  <button
                    onClick={() => requestCameraPermissionAndStart()}
                    style={{
                      background: '#10B981',
                      color: '#090D16',
                      border: 'none',
                      borderRadius: '20px',
                      padding: '9px 18px',
                      fontSize: '0.82rem',
                      fontWeight: '900',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      boxShadow: '0 4px 12px rgba(16, 185, 129, 0.35)'
                    }}
                  >
                    <i className="fa-solid fa-camera"></i> Allow Camera Access
                  </button>
                </div>
              ) : (
                <div style={{
                  position: 'absolute',
                  bottom: '8px',
                  zIndex: 12,
                  fontSize: '0.68rem',
                  color: '#94A3B8',
                  background: 'rgba(0,0,0,0.65)',
                  padding: '3px 10px',
                  borderRadius: '12px',
                  backdropFilter: 'blur(4px)'
                }}>
                  <i className="fa-solid fa-expand" style={{ color: '#10B981', marginRight: '5px' }}></i>
                  Hold package barcode / QR code inside frame to auto-scan
                </div>
              )}
            </div>

            {/* Quick Restart Stream Bar */}
            <div style={{ display: 'flex', width: '100%', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', background: 'rgba(255,255,255,0.04)', padding: '6px 12px', borderRadius: '8px' }}>
              <span style={{ fontSize: '0.72rem', color: '#94A3B8' }}>
                <i className="fa-solid fa-barcode" style={{ color: '#10B981', marginRight: '6px' }}></i>
                Continuous In-Screen Scanner
              </span>
              <div style={{ display: 'flex', gap: '8px' }}>
                {availableCameras.length > 1 && (
                  <button
                    onClick={switchCamera}
                    disabled={scanning}
                    style={{
                      background: 'rgba(255,255,255,0.08)',
                      border: 'none',
                      color: '#FFFFFF',
                      fontSize: '0.7rem',
                      fontWeight: '700',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      padding: '4px 8px',
                      borderRadius: '6px'
                    }}
                  >
                    <i className="fa-solid fa-camera-rotate"></i> Flip Camera
                  </button>
                )}
                <button
                  onClick={() => requestCameraPermissionAndStart()}
                  disabled={scanning}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: '#38BDF8',
                    fontSize: '0.72rem',
                    fontWeight: '700',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  <i className="fa-solid fa-rotate-right"></i> Reset Camera
                </button>
              </div>
            </div>

            {/* ─── REAL SELLER PACKAGES AWAITING PICKUP ─── */}
            <div style={{ width: '100%' }}>
              <div style={{
                fontSize: '0.74rem',
                fontWeight: '800',
                color: '#94A3B8',
                textTransform: 'uppercase',
                marginBottom: '8px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <span>📦 Real Seller Packages Awaiting Pickup:</span>
                <button
                  onClick={fetchDockPackages}
                  style={{ background: 'none', border: 'none', color: '#38BDF8', fontSize: '0.7rem', cursor: 'pointer', fontWeight: '700' }}
                >
                  <i className="fa-solid fa-rotate-right"></i> Refresh
                </button>
              </div>

              {loadingDock ? (
                <div style={{ textAlign: 'center', padding: '16px', color: '#94A3B8', fontSize: '0.78rem' }}>
                  Loading seller packages...
                </div>
              ) : dockPackages.length === 0 ? (
                <div style={{
                  background: 'rgba(255, 255, 255, 0.04)',
                  borderRadius: '10px',
                  padding: '16px',
                  textAlign: 'center',
                  color: '#94A3B8',
                  fontSize: '0.78rem'
                }}>
                  <i className="fa-solid fa-boxes-stacked" style={{ fontSize: '1.4rem', color: '#475569', marginBottom: '6px', display: 'block' }}></i>
                  All current packages have been claimed. When sellers accept orders, they will appear here.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {dockPackages.slice(0, 4).map(pkg => (
                    <div
                      key={pkg._id}
                      style={{
                        background: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        borderRadius: '10px',
                        padding: '10px 12px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '10px'
                      }}
                    >
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px' }}>
                          <span style={{ fontFamily: 'monospace', fontWeight: '900', fontSize: '0.85rem', color: '#38BDF8' }}>
                            #{pkg.orderNumber}
                          </span>
                          <span style={{ fontSize: '0.62rem', background: '#1E293B', color: '#94A3B8', padding: '1px 5px', borderRadius: '4px' }}>
                            {pkg.items?.length || 1} item
                          </span>
                        </div>
                        <div style={{ fontSize: '0.72rem', color: '#E2E8F0', fontWeight: '700', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          <i className="fa-solid fa-shop" style={{ color: '#10B981', marginRight: '4px' }}></i>
                          {pkg.sellerId?.storeName || 'Merchant Partner'}
                        </div>
                        <div style={{ fontSize: '0.68rem', color: '#94A3B8', marginTop: '2px' }}>
                          📍 {pkg.deliveryAddress?.fullName} &bull; {pkg.deliveryAddress?.city}
                        </div>
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px' }}>
                        <BarcodeVisual code={pkg.orderNumber} width={1.2} height={26} showLabel={false} />
                        <button
                          onClick={() => handleClaim(pkg.orderNumber)}
                          disabled={scanning}
                          style={{
                            background: '#10B981',
                            color: '#090D16',
                            border: 'none',
                            borderRadius: '6px',
                            padding: '5px 12px',
                            fontSize: '0.72rem',
                            fontWeight: '900',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}
                        >
                          <i className="fa-solid fa-barcode"></i> Pick
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ─── TAB 2: MANUAL ORDER ID / BARCODE ENTRY ─── */}
        {activeTab === 'input' && (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{
              background: '#0B1120',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '12px',
              padding: '16px',
              marginBottom: '14px'
            }}>
              <label style={{ fontSize: '0.78rem', fontWeight: '700', color: '#94A3B8', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>
                Enter Package Order ID or Barcode
              </label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  type="text"
                  placeholder="e.g. ORD-260912-722101 or 722101"
                  value={searchCode}
                  onChange={(e) => setSearchCode(e.target.value)}
                  style={{
                    flex: 1,
                    background: '#0F172A',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    borderRadius: '8px',
                    padding: '12px',
                    color: '#FFFFFF',
                    fontSize: '0.92rem',
                    fontWeight: '700',
                    outline: 'none',
                    letterSpacing: '0.5px'
                  }}
                />
                <button
                  onClick={() => handleClaim(searchCode)}
                  disabled={scanning || !searchCode.trim()}
                  style={{
                    background: '#2563EB',
                    color: '#FFFFFF',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '0 18px',
                    fontWeight: '800',
                    fontSize: '0.85rem',
                    cursor: 'pointer'
                  }}
                >
                  Claim
                </button>
              </div>
            </div>

            {/* Quick Numeric Keypad */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
              {['1', '2', '3', '4', '5', '6', '7', '8', '9', 'CLR', '0', 'OK'].map(btn => (
                <button
                  key={btn}
                  onClick={() => {
                    if (btn === 'CLR') setSearchCode('');
                    else if (btn === 'OK') handleClaim(searchCode);
                    else setSearchCode(prev => prev + btn);
                  }}
                  style={{
                    padding: '14px',
                    borderRadius: '8px',
                    background: btn === 'OK' ? '#10B981' : btn === 'CLR' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(255, 255, 255, 0.08)',
                    color: btn === 'OK' ? '#090D16' : '#FFFFFF',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    fontSize: '1.1rem',
                    fontWeight: '800',
                    cursor: 'pointer'
                  }}
                >
                  {btn}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ─── TAB 3: COMPLETE STAGED PACKAGES LIST ─── */}
        {activeTab === 'dock' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
              <span style={{ fontSize: '0.76rem', color: '#94A3B8', fontWeight: '700' }}>
                REAL SELLER PACKAGES AWAITING DISPATCH ({dockPackages.length})
              </span>
              <button
                onClick={fetchDockPackages}
                style={{ background: 'none', border: 'none', color: '#38BDF8', fontSize: '0.72rem', cursor: 'pointer', fontWeight: '700' }}
              >
                <i className="fa-solid fa-rotate-right"></i> Refresh
              </button>
            </div>

            {loadingDock ? (
              <p style={{ textAlign: 'center', color: '#94A3B8', fontSize: '0.85rem', padding: '30px' }}>
                Fetching seller packages...
              </p>
            ) : dockPackages.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '30px 10px', color: '#94A3B8' }}>
                <i className="fa-solid fa-box-open" style={{ fontSize: '2.2rem', color: '#475569', marginBottom: '10px' }}></i>
                <p style={{ fontSize: '0.84rem' }}>No packages currently pending at the dock.</p>
              </div>
            ) : (
              dockPackages.map((pkg) => (
                <div
                  key={pkg._id}
                  style={{
                    background: '#0B1120',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '10px',
                    padding: '12px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontFamily: 'monospace', fontWeight: '800', color: '#38BDF8', fontSize: '0.88rem' }}>
                          #{pkg.orderNumber}
                        </span>
                        <span style={{ fontSize: '0.7rem', background: '#334155', padding: '1px 6px', borderRadius: '4px' }}>
                          {pkg.items?.length || 1} item(s)
                        </span>
                      </div>
                      <div style={{ fontSize: '0.74rem', color: '#E2E8F0', marginTop: '2px', fontWeight: '700' }}>
                        <i className="fa-solid fa-shop" style={{ color: '#10B981', marginRight: '4px' }}></i>
                        {pkg.sellerId?.storeName || 'Merchant'}
                      </div>
                      <div style={{ fontSize: '0.72rem', color: '#CBD5E1', marginTop: '2px' }}>
                        📍 {pkg.deliveryAddress?.fullName} &bull; {pkg.deliveryAddress?.city} ({pkg.deliveryAddress?.postalCode})
                      </div>
                    </div>

                    <button
                      onClick={() => handleClaim(pkg.orderNumber)}
                      disabled={scanning}
                      style={{
                        background: '#10B981',
                        color: '#090D16',
                        border: 'none',
                        borderRadius: '8px',
                        padding: '8px 14px',
                        fontSize: '0.76rem',
                        fontWeight: '800',
                        cursor: 'pointer'
                      }}
                    >
                      Scan &amp; Pick
                    </button>
                  </div>

                  <div style={{ alignSelf: 'center', background: '#FFFFFF', padding: '4px 8px', borderRadius: '6px' }}>
                    <BarcodeVisual code={pkg.orderNumber} width={1.4} height={28} showLabel={true} />
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
