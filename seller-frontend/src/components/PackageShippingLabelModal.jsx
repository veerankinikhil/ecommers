import React, { useEffect, useRef, useState } from 'react';
import JsBarcode from 'jsbarcode';
import QRCode from 'qrcode';
import { formatINR } from '../services/sellerApi';
import { formatDateTimeWithSeconds } from './SellerInvoiceModal';

export default function PackageShippingLabelModal({ order, sellerInfo, onClose }) {
  const barcodeSvgRef = useRef(null);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState('');

  const orderNum = order?.orderNumber || 'ORD-UNKNOWN';

  useEffect(() => {
    if (!order) return;

    // Render standard Code 128 Linear Barcode
    if (barcodeSvgRef.current) {
      try {
        JsBarcode(barcodeSvgRef.current, orderNum, {
          format: 'CODE128',
          lineColor: '#000000',
          width: 2.2,
          height: 52,
          displayValue: true,
          font: 'monospace',
          fontSize: 13,
          textMargin: 4,
          margin: 6,
          background: '#FFFFFF'
        });
      } catch (err) {
        console.warn('JsBarcode render error:', err);
      }
    }

    // Render 2D QR Code
    QRCode.toDataURL(orderNum, {
      width: 130,
      margin: 1,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    })
      .then(url => setQrCodeDataUrl(url))
      .catch(err => console.warn('QRCode generate error:', err));
  }, [order, orderNum]);

  if (!order) return null;

  const storeName = sellerInfo?.storeName || order.sellerId?.storeName || 'Verified NovaKart Merchant';
  const ownerName = sellerInfo?.ownerName || order.sellerId?.ownerName || 'Merchant Partner';
  const businessAddress = sellerInfo?.businessAddress || order.sellerId?.businessAddress || 'Industrial Hub, AP Corridor';
  const gstin = sellerInfo?.gstin || '37AAAFM1092R1Z8';

  const handlePrint = () => {
    window.print();
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(15, 23, 42, 0.78)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      padding: '16px',
      overflowY: 'auto'
    }}>
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #printable-package-label, #printable-package-label * {
            visibility: visible;
          }
          #printable-package-label {
            position: absolute;
            left: 0;
            top: 0;
            width: 100% !important;
            margin: 0 !important;
            padding: 20px !important;
            box-shadow: none !important;
          }
          .no-print-label-ctrl {
            display: none !important;
          }
        }
      `}</style>

      <div style={{
        background: '#FFFFFF',
        width: '100%',
        maxWidth: '720px',
        maxHeight: '94vh',
        borderRadius: '14px',
        boxShadow: '0 25px 50px -12px rgba(0,0,0,0.35)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden'
      }}>
        {/* Modal Top Control Bar */}
        <div className="no-print-label-ctrl" style={{
          padding: '12px 20px',
          background: '#0F172A',
          color: '#FFFFFF',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ background: '#10B981', color: '#090D16', padding: '3px 8px', borderRadius: '4px', fontWeight: '800', fontSize: '0.72rem' }}>
              SELLER DISPATCH
            </span>
            <span style={{ fontWeight: '800', fontSize: '0.98rem' }}>
              Official Package Shipping Label &amp; Barcode
            </span>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={handlePrint}
              style={{
                background: '#10B981',
                color: '#090D16',
                border: 'none',
                padding: '7px 16px',
                borderRadius: '6px',
                fontWeight: '800',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '0.82rem'
              }}
            >
              <i className="fa-solid fa-print"></i> Print Label
            </button>
            <button
              onClick={onClose}
              style={{
                background: 'rgba(255,255,255,0.12)',
                color: '#FFFFFF',
                border: 'none',
                padding: '7px 12px',
                borderRadius: '6px',
                fontWeight: '700',
                cursor: 'pointer',
                fontSize: '0.82rem'
              }}
            >
              <i className="fa-solid fa-xmark"></i> Close
            </button>
          </div>
        </div>

        {/* Printable Physical Shipping Label Area */}
        <div id="printable-package-label" style={{
          padding: '24px',
          overflowY: 'auto',
          color: '#0F172A',
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
        }}>
          {/* Label Container with classic logistics border */}
          <div style={{
            border: '2px solid #0F172A',
            borderRadius: '8px',
            overflow: 'hidden',
            background: '#FFFFFF'
          }}>
            {/* Header: Carrier & Hub Banner */}
            <div style={{
              background: '#0F172A',
              color: '#FFFFFF',
              padding: '10px 16px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <i className="fa-solid fa-truck-fast" style={{ color: '#38BDF8', fontSize: '1.2rem' }}></i>
                <div>
                  <span style={{ fontSize: '1.1rem', fontWeight: '900', letterSpacing: '0.5px' }}>
                    NOVAKART EXPRESS LOGISTICS
                  </span>
                  <div style={{ fontSize: '0.66rem', color: '#94A3B8' }}>
                    PRIORITY STANDARD SURFACE PARCEL &bull; AP-CR-01
                  </div>
                </div>
              </div>

              <div style={{ textAlign: 'right' }}>
                <span style={{
                  background: order.paymentMethod === 'COD' ? '#F59E0B' : '#10B981',
                  color: '#090D16',
                  padding: '3px 10px',
                  borderRadius: '4px',
                  fontWeight: '900',
                  fontSize: '0.82rem',
                  letterSpacing: '0.5px'
                }}>
                  {order.paymentMethod === 'COD' ? 'CASH ON DELIVERY (COD)' : 'PREPAID'}
                </span>
                <div style={{ fontSize: '0.74rem', color: '#E2E8F0', marginTop: '3px', fontWeight: '800' }}>
                  Collect: {order.paymentMethod === 'COD' ? formatINR(order.totalAmount) : '₹0 (PAID)'}
                </div>
              </div>
            </div>

            {/* ─── DUAL SCANNABLE BARCODES SECTION ─── */}
            <div style={{
              padding: '14px 16px',
              borderBottom: '2px solid #0F172A',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '16px',
              background: '#FAFAFA'
            }}>
              {/* Left: Code 128 Linear Barcode for 1D Laser Guns */}
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <span style={{ fontSize: '0.68rem', fontWeight: '800', color: '#64748B', textTransform: 'uppercase', marginBottom: '2px' }}>
                  Linear Package Barcode (Code 128)
                </span>
                <svg ref={barcodeSvgRef} style={{ maxWidth: '100%' }}></svg>
                <span style={{ fontSize: '0.68rem', color: '#64748B', marginTop: '2px' }}>
                  Rider Scanner Gun: Point at bars to pick
                </span>
              </div>

              {/* Vertical divider */}
              <div style={{ width: '1px', alignSelf: 'stretch', background: '#CBD5E1' }}></div>

              {/* Right: 2D QR Code for Mobile Phone Cameras */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: '130px' }}>
                <span style={{ fontSize: '0.68rem', fontWeight: '800', color: '#64748B', textTransform: 'uppercase', marginBottom: '4px' }}>
                  2D Camera QR
                </span>
                {qrCodeDataUrl ? (
                  <img
                    src={qrCodeDataUrl}
                    alt="Package QR Code"
                    style={{
                      width: '100px',
                      height: '100px',
                      border: '1px solid #E2E8F0',
                      borderRadius: '6px',
                      padding: '2px',
                      background: '#FFFFFF'
                    }}
                  />
                ) : (
                  <div style={{ width: '100px', height: '100px', background: '#E2E8F0', borderRadius: '6px' }}></div>
                )}
                <span style={{ fontSize: '0.66rem', color: '#10B981', fontWeight: '800', marginTop: '3px' }}>
                  ✓ Instant Phone Scan
                </span>
              </div>
            </div>

            {/* ─── SHIP FROM & SHIP TO DETAILS ─── */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              borderBottom: '2px solid #0F172A'
            }}>
              {/* Ship To (Buyer Destination) */}
              <div style={{ padding: '14px 16px', borderRight: '1px solid #0F172A', background: '#FFFFFF' }}>
                <div style={{ fontSize: '0.7rem', fontWeight: '800', color: '#DC2626', textTransform: 'uppercase', marginBottom: '4px' }}>
                  <i className="fa-solid fa-location-dot"></i> Deliver To (Customer / Consignee):
                </div>
                <div style={{ fontSize: '1.05rem', fontWeight: '900', color: '#0F172A' }}>
                  {order.deliveryAddress?.fullName || 'Customer'}
                </div>
                <div style={{ fontSize: '0.85rem', color: '#1E293B', marginTop: '4px', lineHeight: '1.4' }}>
                  <strong>Address:</strong> {order.deliveryAddress?.street}<br />
                  <strong>City/District:</strong> {order.deliveryAddress?.city}, {order.deliveryAddress?.state || 'AP'}<br />
                  <strong>PINCODE:</strong> <span style={{ fontSize: '1rem', fontWeight: '900', color: '#0F172A' }}>{order.deliveryAddress?.postalCode || order.deliveryAddress?.pincode}</span><br />
                  <strong>Phone:</strong> <span style={{ fontFamily: 'monospace', fontWeight: '800', fontSize: '0.92rem' }}>{order.deliveryAddress?.phone || 'N/A'}</span>
                </div>
              </div>

              {/* Ship From (Merchant Store) */}
              <div style={{ padding: '14px 16px', background: '#F8FAFC' }}>
                <div style={{ fontSize: '0.7rem', fontWeight: '800', color: '#2563EB', textTransform: 'uppercase', marginBottom: '4px' }}>
                  <i className="fa-solid fa-shop"></i> Dispatched From (Seller / Consignor):
                </div>
                <div style={{ fontSize: '0.98rem', fontWeight: '900', color: '#0F172A' }}>
                  {storeName}
                </div>
                <div style={{ fontSize: '0.8rem', color: '#475569', marginTop: '4px', lineHeight: '1.4' }}>
                  Proprietor: {ownerName}<br />
                  Facility: {businessAddress}<br />
                  Seller GSTIN: <strong>{gstin}</strong><br />
                  Dispatch Time: <strong style={{ color: '#0F172A' }}>{formatDateTimeWithSeconds(order.updatedAt || order.createdAt)}</strong>
                </div>
              </div>
            </div>

            {/* ─── ROUTING & HUB TRANSIT LINE ─── */}
            <div style={{
              padding: '10px 16px',
              background: '#F1F5F9',
              borderBottom: '1px solid #E2E8F0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: '0.78rem'
            }}>
              <div>
                <strong>Dispatch Hub:</strong> {order.logisticsRoute?.originWarehouse?.name || 'Guntur Delivery Hub'}
              </div>
              <div>
                <i className="fa-solid fa-arrow-right" style={{ color: '#94A3B8', margin: '0 6px' }}></i>
              </div>
              <div>
                <strong>Destination Branch:</strong> {order.logisticsRoute?.destinationBranch?.name || `${order.deliveryAddress?.city || 'Local'} Branch`}
              </div>
              <div>
                <i className="fa-solid fa-arrow-right" style={{ color: '#94A3B8', margin: '0 6px' }}></i>
              </div>
              <div>
                <strong>Fleet Rider:</strong> {order.deliveryAgentId?.fullName ? order.deliveryAgentId.fullName : 'Scan to Assign Rider'}
              </div>
            </div>

            {/* ─── PACKAGE ITEMS MANIFEST ─── */}
            <div style={{ padding: '12px 16px' }}>
              <div style={{ fontSize: '0.72rem', fontWeight: '800', color: '#64748B', textTransform: 'uppercase', marginBottom: '6px' }}>
                Package Item Manifest ({order.items?.length || 1} item(s)):
              </div>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
                <thead>
                  <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0', textAlign: 'left' }}>
                    <th style={{ padding: '6px 8px', color: '#475569' }}>Item Description</th>
                    <th style={{ padding: '6px 8px', textAlign: 'center', color: '#475569' }}>Qty</th>
                    <th style={{ padding: '6px 8px', textAlign: 'right', color: '#475569' }}>Declared Value</th>
                  </tr>
                </thead>
                <tbody>
                  {(order.items || []).map((it, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px dashed #E2E8F0' }}>
                      <td style={{ padding: '6px 8px', fontWeight: '700' }}>{it.name}</td>
                      <td style={{ padding: '6px 8px', textAlign: 'center' }}>{it.quantity}</td>
                      <td style={{ padding: '6px 8px', textAlign: 'right', fontWeight: '700' }}>{formatINR(it.price * it.quantity)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div style={{
                marginTop: '12px',
                paddingTop: '8px',
                borderTop: '1px solid #E2E8F0',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                fontSize: '0.72rem',
                color: '#64748B'
              }}>
                <div>
                  Instructions: Hand over to authorized NovaKart delivery agent upon barcode scan.
                </div>
                <div style={{ fontWeight: '800', color: '#0F172A', fontSize: '0.78rem' }}>
                  PACKAGE ID: #{orderNum}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
