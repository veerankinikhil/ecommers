import React from 'react';
import { formatINR } from '../services/api';

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

export default function CustomerInvoiceModal({ order, onClose }) {
  if (!order) return null;

  const handlePrint = () => {
    window.print();
  };

  const invoiceNo = `INV-2026-${order.orderNumber?.replace(/[^0-9]/g, '') || Math.floor(100000 + Math.random() * 900000)}`;
  const orderDateWithSeconds = formatDateTimeWithSeconds(order.createdAt);
  const taxAmount = order.tax || Math.round((order.subtotal || 0) * 0.18);
  const cgst = Math.round(taxAmount / 2);
  const sgst = Math.round(taxAmount / 2);

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.65)',
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
        maxWidth: '820px',
        maxHeight: '92vh',
        borderRadius: '12px',
        boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden'
      }}>
        {/* Action Header (Hidden during print) */}
        <div className="no-print" style={{
          padding: '16px 24px',
          background: '#0F172A',
          color: '#fff',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <i className="fa-solid fa-file-invoice" style={{ color: '#10B981', fontSize: '1.2rem' }}></i>
            <span style={{ fontWeight: '700', fontSize: '1.05rem' }}>Official GST Tax Invoice &amp; Payment Receipt</span>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={handlePrint}
              style={{
                background: '#10B981',
                color: '#090D16',
                border: 'none',
                padding: '8px 16px',
                borderRadius: '6px',
                fontWeight: '700',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '0.85rem'
              }}
            >
              <i className="fa-solid fa-print"></i> Print / Download PDF
            </button>
            <button
              onClick={onClose}
              style={{
                background: 'rgba(255,255,255,0.15)',
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

        {/* Printable Tax Invoice Content */}
        <div id="printable-invoice" style={{ padding: '36px', overflowY: 'auto', color: '#1E293B', fontFamily: 'sans-serif' }}>
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid #0F172A', paddingBottom: '18px', marginBottom: '20px' }}>
            <div>
              <div style={{ fontSize: '1.6rem', fontWeight: '900', color: '#0F172A', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ color: '#2563EB' }}>Nova</span>Kart
                <span style={{ fontSize: '0.72rem', background: '#0F172A', color: '#fff', padding: '2px 8px', borderRadius: '4px', verticalAlign: 'middle' }}>TAX INVOICE</span>
              </div>
              <p style={{ fontSize: '0.8rem', color: '#64748B', marginTop: '4px', lineHeight: '1.4' }}>
                NovaKart E-Commerce Private Limited<br />
                CIN: U72900AP2026PTC089201 &bull; GSTIN: 37AAACN0892P1Z4<br />
                Plot 42, Tech Corridor, Benz Circle, Vijayawada, AP - 520010
              </p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '1.15rem', fontWeight: '800', color: '#0F172A' }}>ORIGINAL FOR RECIPIENT</div>
              <div style={{ fontSize: '0.84rem', color: '#475569', marginTop: '4px' }}>
                <strong>Invoice #:</strong> {invoiceNo}
              </div>
              <div style={{ fontSize: '0.84rem', color: '#475569', marginTop: '2px' }}>
                <strong>Order #:</strong> {order.orderNumber}
              </div>
              <div style={{ fontSize: '0.82rem', color: '#2563EB', fontWeight: '700', marginTop: '4px' }}>
                <strong>Placed &amp; Confirmed At:</strong><br />
                <span style={{ fontFamily: 'monospace', fontSize: '0.88rem', color: '#0F172A' }}>{orderDateWithSeconds}</span>
              </div>
            </div>
          </div>

          {/* Parties Info */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '24px', background: '#F8FAFC', padding: '16px 20px', borderRadius: '8px', border: '1px solid #E2E8F0', fontSize: '0.84rem' }}>
            <div>
              <div style={{ fontSize: '0.72rem', color: '#64748B', textTransform: 'uppercase', fontWeight: '800', marginBottom: '4px' }}>
                Sold By (Registered Merchant):
              </div>
              <strong style={{ fontSize: '0.95rem', color: '#0F172A' }}>{order.sellerId?.storeName || 'Verified NovaKart Merchant Partner'}</strong>
              <p style={{ margin: '4px 0 0 0', color: '#475569', lineHeight: '1.4' }}>
                {order.sellerId?.businessAddress || 'Authorized Distribution Center, Andhra Pradesh Corridor'}<br />
                State: Andhra Pradesh &bull; Code: 37<br />
                Merchant GSTIN: 37AAAFM1092R1Z8
              </p>
            </div>

            <div>
              <div style={{ fontSize: '0.72rem', color: '#64748B', textTransform: 'uppercase', fontWeight: '800', marginBottom: '4px' }}>
                Billing &amp; Delivery Address:
              </div>
              <strong style={{ fontSize: '0.95rem', color: '#0F172A' }}>{order.deliveryAddress?.fullName || 'Customer'}</strong>
              <p style={{ margin: '4px 0 0 0', color: '#475569', lineHeight: '1.4' }}>
                {order.deliveryAddress?.street || 'Delivery Address'}<br />
                {order.deliveryAddress?.city}, {order.deliveryAddress?.state || 'AP'} - {order.deliveryAddress?.pincode}<br />
                Phone: {order.deliveryAddress?.phone || 'N/A'}
              </p>
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

          {/* Tax Breakdown & Calculations */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '20px', marginBottom: '20px', fontSize: '0.84rem' }}>
            <div style={{ background: '#F8FAFC', padding: '16px', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
              <strong style={{ fontSize: '0.84rem', color: '#0F172A' }}>GST Statutory Breakdown:</strong>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px', color: '#475569' }}>
                <span>Central GST (CGST 9%):</span>
                <strong>{formatINR(cgst)}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px', color: '#475569' }}>
                <span>State GST (SGST 9%):</span>
                <strong>{formatINR(sgst)}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px', color: '#475569' }}>
                <span>Payment Mode:</span>
                <strong style={{ color: '#2563EB' }}>{order.paymentMethod || 'UPI / Online'}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px', color: '#475569' }}>
                <span>Order Payment Status:</span>
                <span style={{ color: '#059669', fontWeight: '800' }}>CAPTURED &amp; SETTLED</span>
              </div>
            </div>

            <div style={{ background: '#F8FAFC', padding: '16px', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <span>Product Subtotal:</span>
                <strong>{formatINR(order.subtotal || 0)}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <span>Total GST (18%):</span>
                <strong>{formatINR(taxAmount)}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <span>Delivery &amp; Courier Fee:</span>
                <strong>{order.shippingFee === 0 ? 'FREE' : formatINR(order.shippingFee || 0)}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <span>Platform Convenience Fee:</span>
                <strong>{formatINR(order.convenienceFee || 15)}</strong>
              </div>
              {order.discount > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', color: '#DC2626' }}>
                  <span>Discount Applied:</span>
                  <strong>&minus;{formatINR(order.discount)}</strong>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '2px solid #0F172A', paddingTop: '8px', marginTop: '8px', fontSize: '1.05rem', fontWeight: '900', color: '#0F172A' }}>
                <span>Grand Total:</span>
                <span style={{ color: '#059669' }}>{formatINR(order.totalAmount)}</span>
              </div>
            </div>
          </div>

          {/* Footer & Digital Seal */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', borderTop: '1px solid #E2E8F0', paddingTop: '16px', fontSize: '0.78rem', color: '#64748B' }}>
            <div>
              <p style={{ margin: 0 }}>
                This is a computer-generated tax invoice issued in accordance with Section 31 of the CGST Act, 2017.<br />
                No physical signature is required. For inquiries, contact support@novakart.com
              </p>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ border: '2px solid #10B981', color: '#047857', padding: '6px 14px', borderRadius: '6px', fontWeight: '800', fontSize: '0.75rem', letterSpacing: '0.5px' }}>
                <i className="fa-solid fa-stamp" style={{ marginRight: '4px' }}></i> DIGITALLY SIGNED &amp; VERIFIED
              </div>
              <div style={{ fontSize: '0.68rem', marginTop: '3px' }}>NovaKart Automated Invoicing Engine</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
