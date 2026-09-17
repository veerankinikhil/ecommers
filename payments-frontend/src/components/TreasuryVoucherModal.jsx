import React from 'react';
import { formatINR } from '../services/paymentApi';

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

export default function TreasuryVoucherModal({ transaction, onClose }) {
  if (!transaction) return null;

  const handlePrint = () => {
    window.print();
  };

  const isInbound = transaction.type === 'INBOUND_CUSTOMER_PAYMENT';
  const receivedAtFormatted = formatDateTimeWithSeconds(transaction.receivedAt || transaction.createdAt);
  const disbursedAtFormatted = transaction.disbursedAt 
    ? formatDateTimeWithSeconds(transaction.disbursedAt) 
    : (isInbound ? receivedAtFormatted : 'Pending Disbursal');

  const voucherNo = `VCHR-2026-${transaction.transactionId?.replace(/[^0-9]/g, '') || Math.floor(100000 + Math.random() * 900000)}`;

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
        maxWidth: '840px',
        maxHeight: '94vh',
        borderRadius: '14px',
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
            <i className="fa-solid fa-vault" style={{ color: '#10B981', fontSize: '1.25rem' }}></i>
            <div>
              <span style={{ fontWeight: '800', fontSize: '1.05rem' }}>
                {isInbound ? 'Official Payment Receipt & Tax Invoice' : 'Treasury Bank Disbursal Voucher & Settlement Slip'}
              </span>
              <div style={{ fontSize: '0.74rem', color: '#94A3B8' }}>
                Ref: {transaction.transactionId} &bull; Exact Second-Precision Audit Trail
              </div>
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
              <i className="fa-solid fa-print"></i> Print Voucher / PDF
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
        <div id="treasury-printable-voucher" style={{ padding: '36px', overflowY: 'auto', color: '#1E293B', fontFamily: 'sans-serif' }}>
          
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid #0F172A', paddingBottom: '16px', marginBottom: '20px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                <span style={{ fontSize: '1.6rem', fontWeight: '900', color: '#0F172A' }}>
                  <span style={{ color: '#2563EB' }}>Nova</span>Kart
                </span>
                <span style={{ fontSize: '0.74rem', background: '#0F172A', color: '#fff', padding: '3px 8px', borderRadius: '4px', fontWeight: '800' }}>
                  TREASURY &amp; SETTLEMENT DIVISION
                </span>
              </div>
              <p style={{ fontSize: '0.8rem', color: '#64748B', margin: 0, lineHeight: '1.4' }}>
                NovaKart Marketplace Escrow Services &bull; RBI Nodal Pool ID: ESC-AP-2026<br />
                CIN: U72900AP2026PTC089201 &bull; GSTIN: 37AAACN0892P1Z4<br />
                Nodal Bank: HDFC Escrow &bull; A/C: 50200084729104 &bull; IFSC: HDFC0000001
              </p>
            </div>

            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '1.1rem', fontWeight: '900', color: '#0F172A' }}>
                {isInbound ? 'OFFICIAL PAYMENT RECEIPT' : 'BANK DISBURSAL VOUCHER'}
              </div>
              <div style={{ fontSize: '0.84rem', color: '#475569', marginTop: '3px' }}>
                <strong>Voucher #:</strong> {voucherNo}
              </div>
              <div style={{ fontSize: '0.84rem', color: '#475569' }}>
                <strong>Transaction ID:</strong> {transaction.transactionId}
              </div>
              {transaction.utrNumber && (
                <div style={{ fontSize: '0.88rem', color: '#059669', fontWeight: '800', marginTop: '3px', fontFamily: 'monospace' }}>
                  Bank UTR: {transaction.utrNumber}
                </div>
              )}
            </div>
          </div>

          {/* Timestamps Card with Explicit Seconds */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px', background: '#EFF6FF', border: '1px solid #BFDBFE', padding: '14px 18px', borderRadius: '8px', fontSize: '0.85rem' }}>
            <div>
              <div style={{ fontSize: '0.74rem', color: '#1E40AF', textTransform: 'uppercase', fontWeight: '800', marginBottom: '2px' }}>
                <i className="fa-regular fa-calendar-check" style={{ marginRight: '5px' }}></i>
                Funds Received At (Customer / Remitter):
              </div>
              <strong style={{ fontSize: '0.98rem', color: '#0F172A', fontFamily: 'monospace' }}>
                {receivedAtFormatted}
              </strong>
            </div>

            <div>
              <div style={{ fontSize: '0.74rem', color: '#1E40AF', textTransform: 'uppercase', fontWeight: '800', marginBottom: '2px' }}>
                <i className="fa-solid fa-paper-plane" style={{ marginRight: '5px' }}></i>
                Disbursed / Settled At (Beneficiary Bank):
              </div>
              <strong style={{ fontSize: '0.98rem', color: transaction.disbursedAt || isInbound ? '#059669' : '#D97706', fontFamily: 'monospace' }}>
                {disbursedAtFormatted}
              </strong>
            </div>
          </div>

          {/* Parties & Bank Routing Info */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px', background: '#F8FAFC', padding: '16px 20px', borderRadius: '8px', border: '1px solid #E2E8F0', fontSize: '0.84rem' }}>
            <div>
              <div style={{ fontSize: '0.72rem', color: '#64748B', textTransform: 'uppercase', fontWeight: '800', marginBottom: '4px' }}>
                <i className="fa-solid fa-arrow-up-from-bracket" style={{ color: '#2563EB', marginRight: '4px' }}></i>
                Remitter (Debit Source):
              </div>
              <strong style={{ fontSize: '0.95rem', color: '#0F172A' }}>{transaction.sender?.name || 'Customer'}</strong>
              <div style={{ marginTop: '4px', color: '#475569', lineHeight: '1.4' }}>
                <div>Role: <strong>{transaction.sender?.role?.toUpperCase()}</strong></div>
                <div>Account / VPA: <strong>{transaction.sender?.accountOrVpa || 'UPI / Gateway'}</strong></div>
                <div>Channel: <strong>{transaction.paymentMethod}</strong></div>
              </div>
            </div>

            <div>
              <div style={{ fontSize: '0.72rem', color: '#64748B', textTransform: 'uppercase', fontWeight: '800', marginBottom: '4px' }}>
                <i className="fa-solid fa-arrow-down-to-bracket" style={{ color: '#10B981', marginRight: '4px' }}></i>
                Beneficiary (Credit Destination):
              </div>
              <strong style={{ fontSize: '0.95rem', color: '#0F172A' }}>{transaction.recipient?.name}</strong>
              {transaction.recipient?.storeOrHubName && (
                <div style={{ color: '#2563EB', fontWeight: '700', fontSize: '0.82rem' }}>
                  {transaction.recipient.storeOrHubName}
                </div>
              )}
              <div style={{ marginTop: '4px', color: '#475569', lineHeight: '1.4' }}>
                {transaction.recipient?.bankName && <div>Bank: <strong>{transaction.recipient.bankName}</strong></div>}
                {transaction.recipient?.accountNumber && <div>Account: <strong>{transaction.recipient.accountNumber}</strong></div>}
                {transaction.recipient?.ifscCode && <div>IFSC: <strong>{transaction.recipient.ifscCode}</strong></div>}
                {transaction.recipient?.upiId && <div>UPI: <strong>{transaction.recipient.upiId}</strong></div>}
              </div>
            </div>
          </div>

          {/* Financial Breakdown Table */}
          <div style={{ background: '#F8FAFC', padding: '18px', borderRadius: '8px', border: '1px solid #E2E8F0', marginBottom: '20px', fontSize: '0.86rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
              <span>Gross Transaction Amount:</span>
              <strong>{formatINR(transaction.amount)}</strong>
            </div>

            {transaction.tax > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', color: '#475569' }}>
                <span>Applicable GST (18% Statutory Split):</span>
                <span>{formatINR(transaction.tax)}</span>
              </div>
            )}

            {transaction.platformCommissionCut > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', color: '#DC2626' }}>
                <span>Platform Commission Cut (10%):</span>
                <strong>&minus;{formatINR(transaction.platformCommissionCut)}</strong>
              </div>
            )}

            {transaction.gatewayFee > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', color: '#DC2626' }}>
                <span>Banking Gateway Processing Fee:</span>
                <strong>&minus;{formatINR(transaction.gatewayFee)}</strong>
              </div>
            )}

            {transaction.totalDeductions > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', color: '#64748B', borderTop: '1px dashed #CBD5E1', paddingTop: '6px' }}>
                <span>Total Statutory &amp; Platform Deductions:</span>
                <strong>&minus;{formatINR(transaction.totalDeductions)}</strong>
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '2px solid #0F172A', paddingTop: '10px', marginTop: '10px', fontSize: '1.15rem', fontWeight: '900', color: '#0F172A' }}>
              <span>Net Settled &amp; Disbursed Amount:</span>
              <span style={{ color: '#059669' }}>{formatINR(transaction.netDisbursedAmount || transaction.amount)}</span>
            </div>
          </div>

          {/* Compliance & Audit Notes */}
          <div style={{ background: '#F1F5F9', padding: '12px 16px', borderRadius: '8px', marginBottom: '20px', fontSize: '0.78rem', color: '#475569' }}>
            <strong>Treasury Verification Audit:</strong> {transaction.verificationNotes || 'Transaction verified under Automated Escrow Protocol.'}<br />
            Status: <strong>{transaction.status}</strong> &bull; Verification Status: <strong>{transaction.verificationStatus}</strong>
          </div>

          {/* Footer & Digital Treasury Stamp */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', borderTop: '1px solid #E2E8F0', paddingTop: '16px', fontSize: '0.78rem', color: '#64748B' }}>
            <div>
              <p style={{ margin: 0, lineHeight: '1.4' }}>
                Electronically generated treasury settlement advice.<br />
                Direct IMPS/NEFT routing verified against beneficiary PAN &amp; Bank IFSC records.
              </p>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ border: '2px solid #10B981', color: '#047857', padding: '6px 14px', borderRadius: '6px', fontWeight: '800', fontSize: '0.75rem', letterSpacing: '0.5px' }}>
                <i className="fa-solid fa-stamp" style={{ marginRight: '4px' }}></i> TREASURY AUDIT CLEARED
              </div>
              <div style={{ fontSize: '0.68rem', marginTop: '3px' }}>NovaKart Disbursal Engine</div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
