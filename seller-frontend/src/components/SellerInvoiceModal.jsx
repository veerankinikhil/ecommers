import React, { useEffect, useRef, useState } from 'react';
import JsBarcode from 'jsbarcode';
import QRCode from 'qrcode';
import { formatINR } from '../services/sellerApi';

export const formatDateTimeWithSeconds = (dateStr) => {
  if (!dateStr) return 'N/A';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return 'N/A';
  return d.toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true
  });
};

export default function SellerInvoiceModal({ order, sellerInfo, onClose }) {
  const barcodeRef = useRef(null);
  const [qrDataUrl, setQrDataUrl] = useState('');

  const orderNum = order?.orderNumber || 'ORD-UNKNOWN';

  useEffect(() => {
    if (!order) return;
    if (barcodeRef.current) {
      try {
        JsBarcode(barcodeRef.current, orderNum, {
          format: 'CODE128',
          width: 1.8,
          height: 40,
          displayValue: true,
          font: 'monospace',
          fontSize: 12,
          margin: 4
        });
      } catch (e) {}
    }
    QRCode.toDataURL(orderNum, { width: 90, margin: 1 })
      .then(url => setQrDataUrl(url))
      .catch(() => {});
  }, [order, orderNum]);

  if (!order) return null;

  const handlePrint = () => {
    window.print();
  };

  const invoiceNo = `SLR-INV-2026-${order.orderNumber?.replace(/[^0-9]/g, '') || Math.floor(100000 + Math.random() * 900000)}`;
  const orderPlacedWithSeconds = formatDateTimeWithSeconds(order.createdAt);
  const orderAcceptedWithSeconds = formatDateTimeWithSeconds(order.updatedAt || order.createdAt);

  const subtotal = order.subtotal || order.totalAmount || 0;
  const platformFee = Math.round(subtotal * 0.10); // 10% platform commission cut
  const gatewayFee = Math.round(subtotal * 0.02); // 2% payment gateway fee
  const logisticsFee = order.shippingFee || 40;
  const totalDeductions = platformFee + gatewayFee;
  const netSellerPayout = Math.max(0, subtotal - totalDeductions);

  const storeName = sellerInfo?.storeName || order.sellerId?.storeName || 'Verified NovaKart Merchant Partner';
  const ownerName = sellerInfo?.ownerName || order.sellerId?.ownerName || 'Authorized Merchant';
  const businessAddress = sellerInfo?.businessAddress || order.sellerId?.businessAddress || 'Plot 12, Industrial Hub, AP Corridor';
  const gstin = sellerInfo?.gstin || '37AAAFM1092R1Z8';

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(15, 23, 42, 0.75)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      padding: '20px',
      overflowY: 'auto'
    }}>
      <div style={{
        background: '#FFFFFF',
        width: '100%',
        maxWidth: '860px',
        maxHeight: '94vh',
        borderRadius: '12px',
        boxShadow: '0 25px 50px -12px rgba(0,0,0,0.3)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden'
      }}>
        {/* Top Control Bar (Hidden on Print) */}
        <div className="no-print" style={{
          padding: '14px 24px',
          background: '#0F172A',
          color: '#fff',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <i className="fa-solid fa-file-invoice-dollar" style={{ color: '#10B981', fontSize: '1.25rem' }}></i>
            <div>
              <span style={{ fontWeight: '800', fontSize: '1.05rem' }}>Seller Commercial Tax Invoice &amp; Dispatch Slip</span>
              <div style={{ fontSize: '0.74rem', color: '#94A3B8' }}>Generated upon order acceptance &bull; Payout calculated with 10% platform fee</div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={handlePrint}
              style={{
                background: '#10B981',
                color: '#090D16',
                border: 'none',
                padding: '8px 18px',
                borderRadius: '6px',
                fontWeight: '800',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '0.85rem'
              }}
            >
              <i className="fa-solid fa-print"></i> Print / Save PDF
            </button>
            <button
              onClick={onClose}
              style={{
                background: 'rgba(255,255,255,0.12)',
                color: '#fff',
                border: 'none',
                padding: '8px 14px',
                borderRadius: '6px',
                fontWeight: '700',
                cursor: 'pointer',
                fontSize: '0.85rem'
              }}
            >
              <i className="fa-solid fa-xmark"></i> Close
            </button>
          </div>
        </div>

        {/* Printable Content */}
        <div id="seller-printable-invoice" style={{ padding: '36px', overflowY: 'auto', color: '#1E293B', fontFamily: 'sans-serif' }}>
          
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid #0F172A', paddingBottom: '16px', marginBottom: '20px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                <span style={{ fontSize: '1.5rem', fontWeight: '900', color: '#0F172A' }}>{storeName}</span>
                <span style={{ fontSize: '0.72rem', background: '#2563EB', color: '#fff', padding: '2px 8px', borderRadius: '4px', fontWeight: '800' }}>SELLER DISPATCH COPY</span>
              </div>
              <p style={{ fontSize: '0.8rem', color: '#64748B', margin: 0, lineHeight: '1.4' }}>
                Proprietor: <strong>{ownerName}</strong><br />
                Address: {businessAddress}<br />
                Seller GSTIN: <strong>{gstin}</strong> &bull; State: Andhra Pradesh (37)
              </p>
            </div>

            <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
              <div style={{ fontSize: '1.1rem', fontWeight: '900', color: '#0F172A' }}>TAX INVOICE &amp; PACKING SLIP</div>
              <div style={{ fontSize: '0.82rem', color: '#475569', marginTop: '3px' }}>
                <strong>Invoice #:</strong> {invoiceNo}
              </div>
              <div style={{ fontSize: '0.82rem', color: '#475569' }}>
                <strong>Order #:</strong> {order.orderNumber}
              </div>
              <div style={{ fontSize: '0.74rem', color: '#2563EB', marginTop: '2px', lineHeight: '1.3' }}>
                <div>Placed: <strong>{orderPlacedWithSeconds}</strong></div>
                <div>Accepted: <strong>{orderAcceptedWithSeconds}</strong></div>
              </div>

              {/* Scannable Barcode & QR Block */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '6px' }}>
                <svg ref={barcodeRef} style={{ display: 'block' }}></svg>
                {qrDataUrl && (
                  <img src={qrDataUrl} alt="QR" style={{ width: '56px', height: '56px', border: '1px solid #CBD5E1', borderRadius: '4px' }} />
                )}
              </div>
            </div>
          </div>

          {/* Delivery & Routing Info */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px', background: '#F8FAFC', padding: '16px 20px', borderRadius: '8px', border: '1px solid #E2E8F0', fontSize: '0.84rem' }}>
            <div>
              <div style={{ fontSize: '0.72rem', color: '#64748B', textTransform: 'uppercase', fontWeight: '800', marginBottom: '4px' }}>
                <i className="fa-solid fa-location-dot" style={{ color: '#DC2626' }}></i> Delivery Destination (Buyer):
              </div>
              <strong style={{ fontSize: '0.95rem', color: '#0F172A' }}>{order.deliveryAddress?.fullName || 'Customer'}</strong>
              <p style={{ margin: '4px 0 0 0', color: '#475569', lineHeight: '1.4' }}>
                {order.deliveryAddress?.street}<br />
                {order.deliveryAddress?.city}, {order.deliveryAddress?.state || 'AP'} - {order.deliveryAddress?.postalCode || order.deliveryAddress?.pincode}<br />
                Phone: <strong>{order.deliveryAddress?.phone || 'N/A'}</strong>
              </p>
            </div>

            <div>
              <div style={{ fontSize: '0.72rem', color: '#64748B', textTransform: 'uppercase', fontWeight: '800', marginBottom: '4px' }}>
                <i className="fa-solid fa-truck-fast" style={{ color: '#2563EB' }}></i> Logistics &amp; Fulfillment Routing:
              </div>
              <div style={{ color: '#334155', lineHeight: '1.5' }}>
                <div><strong>Origin Dispatch Dock:</strong> {order.logisticsRoute?.originWarehouse?.name || 'Guntur Hub / Regional Dispatch'}</div>
                <div><strong>Destination Branch:</strong> {order.logisticsRoute?.destinationBranch?.name || 'Tenali Delivery Branch'}</div>
                {order.deliveryAgentId && (
                  <div><strong>Assigned Fleet Agent:</strong> {order.deliveryAgentId.fullName} ({order.deliveryAgentId.phone})</div>
                )}
                <div><strong>Current Order Status:</strong> <span style={{ color: '#059669', fontWeight: '800' }}>{order.orderStatus}</span></div>
              </div>
            </div>
          </div>

          {/* Line Items Table */}
          <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '20px', fontSize: '0.84rem' }}>
            <thead>
              <tr style={{ background: '#0F172A', color: '#fff', textAlign: 'left' }}>
                <th style={{ padding: '10px 12px' }}>#</th>
                <th style={{ padding: '10px 12px' }}>Product Description</th>
                <th style={{ padding: '10px 12px' }}>HSN</th>
                <th style={{ padding: '10px 12px', textAlign: 'center' }}>Qty</th>
                <th style={{ padding: '10px 12px', textAlign: 'right' }}>Unit Price</th>
                <th style={{ padding: '10px 12px', textAlign: 'right' }}>Taxable Val</th>
                <th style={{ padding: '10px 12px', textAlign: 'right' }}>GST (18%)</th>
                <th style={{ padding: '10px 12px', textAlign: 'right' }}>Total</th>
              </tr>
            </thead>
            <tbody>
              {(order.items || []).map((it, idx) => {
                const itemTotal = it.price * it.quantity;
                const itemTax = Math.round(itemTotal * 0.18);
                return (
                  <tr key={idx} style={{ borderBottom: '1px solid #E2E8F0' }}>
                    <td style={{ padding: '10px 12px' }}>{idx + 1}</td>
                    <td style={{ padding: '10px 12px' }}>
                      <strong>{it.name}</strong>
                    </td>
                    <td style={{ padding: '10px 12px', color: '#64748B' }}>8517.13</td>
                    <td style={{ padding: '10px 12px', textAlign: 'center' }}>{it.quantity}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'right' }}>{formatINR(it.price)}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'right' }}>{formatINR(itemTotal)}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'right', color: '#0891B2' }}>{formatINR(itemTax)}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'right', fontWeight: '700' }}>{formatINR(itemTotal + itemTax)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {/* Seller Payout Statement & Commission Deductions */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '20px', marginBottom: '20px', fontSize: '0.84rem' }}>
            <div style={{ background: '#F8FAFC', padding: '16px', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
              <div style={{ fontSize: '0.8rem', fontWeight: '800', color: '#0F172A', textTransform: 'uppercase', marginBottom: '8px' }}>
                <i className="fa-solid fa-building-columns" style={{ color: '#2563EB', marginRight: '6px' }}></i>
                Merchant Settlement Account:
              </div>
              <div style={{ color: '#475569', lineHeight: '1.5' }}>
                <div>Bank Name: <strong>HDFC Bank / Union Bank</strong></div>
                <div>Account Number: <strong>50100234891244</strong></div>
                <div>IFSC Code: <strong>HDFC0001234</strong></div>
                <div>Payout Mode: <strong>Direct Bank IMPS / NEFT Transfer</strong></div>
                <div style={{ marginTop: '6px', fontSize: '0.76rem', color: '#059669', fontWeight: '700' }}>
                  ✓ Treasury Verified &amp; Cleared for Auto-Settlement
                </div>
              </div>
            </div>

            <div style={{ background: '#F8FAFC', padding: '16px', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <span>Gross Order Subtotal:</span>
                <strong>{formatINR(subtotal)}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', color: '#DC2626' }}>
                <span>NovaKart Commission (10%):</span>
                <strong>&minus;{formatINR(platformFee)}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', color: '#DC2626' }}>
                <span>Payment Gateway Fee (2%):</span>
                <strong>&minus;{formatINR(gatewayFee)}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', color: '#64748B' }}>
                <span>Logistics &amp; Courier Fee:</span>
                <span>Customer Paid</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '2px solid #0F172A', paddingTop: '8px', marginTop: '8px', fontSize: '1.05rem', fontWeight: '900', color: '#0F172A' }}>
                <span>Net Disbursable Payout:</span>
                <span style={{ color: '#059669' }}>{formatINR(netSellerPayout)}</span>
              </div>
            </div>
          </div>

          {/* Footer & Digital Seal */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', borderTop: '1px solid #E2E8F0', paddingTop: '16px', fontSize: '0.78rem', color: '#64748B' }}>
            <div>
              <p style={{ margin: 0, lineHeight: '1.4' }}>
                Issued by Registered Seller on the NovaKart Marketplace Platform.<br />
                Subject to Guntur / Vijayawada Jurisdiction. Goods once sold are backed by seller warranty.
              </p>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ border: '2px solid #2563EB', color: '#1D4ED8', padding: '6px 14px', borderRadius: '6px', fontWeight: '800', fontSize: '0.75rem', letterSpacing: '0.5px' }}>
                <i className="fa-solid fa-stamp" style={{ marginRight: '4px' }}></i> SELLER CERTIFIED DISPATCH
              </div>
              <div style={{ fontSize: '0.68rem', marginTop: '3px' }}>NovaKart Automated Merchant Invoicing</div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
