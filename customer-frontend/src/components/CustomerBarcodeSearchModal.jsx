import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode';

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

export default function CustomerBarcodeSearchModal({ isOpen, onClose }) {
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState('');
  const [scannedCode, setScannedCode] = useState('');
  const [scanning, setScanning] = useState(false);
  const scannerRef = useRef(null);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  const playBeep = () => {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(1020, ctx.currentTime);
      gain.gain.setValueAtTime(0.25, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.15);
    } catch (e) {}
  };

  const startCamera = async () => {
    setCameraError('');
    if (!document.getElementById('customer-barcode-reader')) return;

    try {
      if (scannerRef.current) {
        try {
          if (scannerRef.current.isScanning) {
            await scannerRef.current.stop();
          }
          scannerRef.current.clear();
        } catch (e) {}
        scannerRef.current = null;
      }

      const html5QrCode = new Html5Qrcode('customer-barcode-reader', {
        formatsToSupport: SUPPORTED_BARCODE_FORMATS,
        verbose: false
      });
      scannerRef.current = html5QrCode;

      await html5QrCode.start(
        { facingMode: 'environment' },
        {
          fps: 12,
          qrbox: { width: 250, height: 160 },
          aspectRatio: 1.333
        },
        (decodedText) => {
          handleDetected(decodedText);
        },
        () => {}
      );

      setCameraActive(true);
      setCameraError('');
    } catch (err) {
      console.warn('Customer camera start error:', err);
      setCameraActive(false);
      const isSecure = window.isSecureContext;
      if (!isSecure && window.location.protocol === 'http:' && window.location.hostname !== 'localhost') {
        setCameraError('🔒 Browser requires HTTPS for live camera streaming. Tap "Snap Photo with Camera" below to use your native phone camera, or open via our HTTPS link!');
      } else {
        setCameraError(err.message || 'Camera permission was not granted. You can snap a photo with your phone camera or select a demo product below.');
      }
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

  useEffect(() => {
    if (isOpen) {
      setScannedCode('');
      setCameraError('');
      const timer = setTimeout(() => {
        startCamera();
      }, 200);
      return () => clearTimeout(timer);
    } else {
      stopCamera();
    }

    return () => {
      stopCamera();
    };
  }, [isOpen]);

  const handleDetected = (code) => {
    if (!code || scanning) return;
    setScanning(true);
    playBeep();
    setScannedCode(code);

    setTimeout(() => {
      stopCamera();
      onClose();
      // Search the product catalog with the scanned barcode/code
      navigate(`/products?query=${encodeURIComponent(code)}`);
    }, 800);
  };

  const handlePhotoCapture = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      let scanner = scannerRef.current;
      if (!scanner) {
        scanner = new Html5Qrcode('customer-barcode-reader', {
          formatsToSupport: SUPPORTED_BARCODE_FORMATS,
          verbose: false
        });
        scannerRef.current = scanner;
      }

      const decodedText = await scanner.scanFile(file, true);
      if (decodedText) {
        handleDetected(decodedText);
      }
    } catch (err) {
      setCameraError('Could not detect barcode from photo. Please align clearly or tap one of the popular search items below.');
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(0, 0, 0, 0.85)',
      backdropFilter: 'blur(8px)',
      zIndex: 100000,
      display: 'flex',
      alignItems: 'flex-end',
      justifyContent: 'center',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
      <style>{`
        @keyframes customerLaserScan {
          0% { top: 10%; opacity: 0.8; }
          50% { top: 88%; opacity: 1; }
          100% { top: 10%; opacity: 0.8; }
        }
        #customer-barcode-reader video {
          width: 100% !important;
          height: 100% !important;
          object-fit: cover !important;
          border-radius: 16px !important;
        }
      `}</style>

      <div style={{
        background: '#0B1120',
        width: '100%',
        maxWidth: '430px',
        borderTopLeftRadius: '24px',
        borderTopRightRadius: '24px',
        padding: '20px 18px calc(20px + env(safe-area-inset-bottom, 0px)) 18px',
        boxShadow: '0 -10px 35px rgba(0, 0, 0, 0.5)',
        color: '#FFFFFF',
        display: 'flex',
        flexDirection: 'column',
        maxHeight: '92vh',
        overflowY: 'auto'
      }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              background: '#0284C7',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#FFFFFF',
              fontSize: '1rem'
            }}>
              <i className="fa-solid fa-barcode"></i>
            </span>
            <div>
              <strong style={{ fontSize: '1.05rem', color: '#FFFFFF', display: 'block', lineHeight: '1.2' }}>
                Amazon Barcode &amp; Lens Search
              </strong>
              <span style={{ fontSize: '0.72rem', color: '#94A3B8' }}>
                {cameraActive ? 'Camera Connected & Ready' : 'Scan any item or package barcode'}
              </span>
            </div>
          </div>

          <button
            onClick={() => { stopCamera(); onClose(); }}
            style={{
              background: 'none',
              border: 'none',
              color: '#94A3B8',
              fontSize: '1.6rem',
              cursor: 'pointer',
              padding: '0 6px'
            }}
          >
            &times;
          </button>
        </div>

        {/* Viewfinder box */}
        <div style={{
          position: 'relative',
          width: '100%',
          height: '220px',
          borderRadius: '16px',
          overflow: 'hidden',
          background: '#020617',
          border: scannedCode ? '2px solid #10B981' : '1px solid rgba(255, 255, 255, 0.15)',
          boxShadow: scannedCode ? '0 0 25px rgba(16, 185, 129, 0.7)' : 'none',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '14px'
        }}>
          {/* HTML5 video element */}
          <div id="customer-barcode-reader" style={{ width: '100%', height: '100%', position: 'absolute', inset: 0 }}></div>

          {/* Targeting Reticles */}
          <div style={{ position: 'absolute', width: '74%', height: '65%', pointerEvents: 'none', zIndex: 10 }}>
            <span style={{ position: 'absolute', top: 0, left: 0, width: '22px', height: '22px', borderTop: '3px solid #38BDF8', borderLeft: '3px solid #38BDF8', borderTopLeftRadius: '6px' }}></span>
            <span style={{ position: 'absolute', top: 0, right: 0, width: '22px', height: '22px', borderTop: '3px solid #38BDF8', borderRight: '3px solid #38BDF8', borderTopRightRadius: '6px' }}></span>
            <span style={{ position: 'absolute', bottom: 0, left: 0, width: '22px', height: '22px', borderBottom: '3px solid #38BDF8', borderLeft: '3px solid #38BDF8', borderBottomLeftRadius: '6px' }}></span>
            <span style={{ position: 'absolute', bottom: 0, right: 0, width: '22px', height: '22px', borderBottom: '3px solid #38BDF8', borderRight: '3px solid #38BDF8', borderBottomRightRadius: '6px' }}></span>

            <div style={{
              position: 'absolute',
              width: '100%',
              height: '2px',
              background: '#38BDF8',
              boxShadow: '0 0 12px 2px #38BDF8',
              animation: 'customerLaserScan 1.6s infinite ease-in-out'
            }}></div>
          </div>

          {/* Error / Insecure Warning */}
          {cameraError ? (
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
              <i className="fa-solid fa-camera-slash" style={{ fontSize: '1.8rem', color: '#F59E0B', marginBottom: '8px' }}></i>
              <p style={{ fontSize: '0.78rem', color: '#E2E8F0', lineHeight: '1.4', margin: '0 0 12px 0' }}>
                {cameraError}
              </p>
              <button
                onClick={() => fileInputRef.current?.click()}
                style={{
                  background: '#0284C7',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '20px',
                  padding: '8px 16px',
                  fontSize: '0.8rem',
                  fontWeight: '800',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <i className="fa-solid fa-camera"></i> Snap Photo with Camera
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
              borderRadius: '12px'
            }}>
              <i className="fa-solid fa-expand" style={{ color: '#38BDF8', marginRight: '5px' }}></i>
              Point camera at barcode or product
            </div>
          )}
        </div>

        {/* Hidden native camera photo trigger */}
        <input
          type="file"
          ref={fileInputRef}
          accept="image/*"
          capture="environment"
          onChange={handlePhotoCapture}
          style={{ display: 'none' }}
        />

        {/* Action buttons */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '14px' }}>
          <button
            onClick={() => fileInputRef.current?.click()}
            style={{
              flex: 1,
              background: 'rgba(56, 189, 248, 0.15)',
              border: '1px solid #38BDF8',
              color: '#7DD3FC',
              borderRadius: '12px',
              padding: '11px',
              fontSize: '0.82rem',
              fontWeight: '700',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px'
            }}
          >
            <i className="fa-solid fa-camera"></i>
            <span>Snap Photo with Phone Camera</span>
          </button>

          <button
            onClick={() => startCamera()}
            style={{
              background: 'rgba(255, 255, 255, 0.08)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              color: '#FFFFFF',
              borderRadius: '12px',
              padding: '11px 14px',
              cursor: 'pointer'
            }}
            title="Restart Camera"
          >
            <i className="fa-solid fa-rotate-right"></i>
          </button>
        </div>

        {/* One-Tap Demo Barcodes & Search */}
        <div>
          <span style={{ fontSize: '0.72rem', fontWeight: '800', color: '#94A3B8', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>
            ⚡ Or Tap to Search Popular Items:
          </span>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            {[
              { label: 'Wireless Headphones', code: '8901030', icon: '🎧' },
              { label: 'Running Sneakers', code: '8901031', icon: '👟' },
              { label: 'Smart Fitness Band', code: '8901032', icon: '⌚' },
              { label: 'Fresh Grocery Basket', code: '8901033', icon: '🍎' }
            ].map(item => (
              <button
                key={item.code}
                onClick={() => handleDetected(item.label)}
                style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '10px',
                  padding: '9px 10px',
                  textAlign: 'left',
                  color: '#FFFFFF',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <span style={{ fontSize: '1.1rem' }}>{item.icon}</span>
                <div>
                  <div style={{ fontSize: '0.76rem', fontWeight: '700' }}>{item.label}</div>
                  <div style={{ fontSize: '0.62rem', color: '#94A3B8', fontFamily: 'monospace' }}>#{item.code}</div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
