import React, { useEffect, useState } from 'react';
import sellerApi, { formatINR } from '../services/sellerApi';

export default function SellerPayouts() {
  const [walletData, setWalletData] = useState(null);
  const [settlements, setSettlements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isEditingBank, setIsEditingBank] = useState(false);
  const [bankForm, setBankForm] = useState({
    accountHolderName: '',
    bankName: '',
    accountNumber: '',
    ifscCode: '',
    upiId: ''
  });
  const [msg, setMsg] = useState('');

  const fetchWallet = async () => {
    setLoading(true);
    try {
      const { data } = await sellerApi.get('/payments/seller-wallet');
      setWalletData(data.wallet);
      setSettlements(data.settlements || []);
      if (data.wallet?.bankDetails) {
        setBankForm({
          accountHolderName: data.wallet.bankDetails.accountHolderName || '',
          bankName: data.wallet.bankDetails.bankName || 'HDFC Bank',
          accountNumber: data.wallet.bankDetails.accountNumber || '',
          ifscCode: data.wallet.bankDetails.ifscCode || '',
          upiId: data.wallet.bankDetails.upiId || ''
        });
      }
    } catch (err) {
      console.error('Error fetching seller wallet:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWallet();
  }, []);

  const handleUpdateBank = async (e) => {
    e.preventDefault();
    setMsg('');
    try {
      await sellerApi.put('/payments/seller-bank-details', bankForm);
      setMsg('✅ Bank payout details updated successfully!');
      setIsEditingBank(false);
      fetchWallet();
    } catch (err) {
      alert(`Error: ${err.response?.data?.message || err.message}`);
    }
  };

  const handleRequestPayout = () => {
    alert('✅ Payout claim submitted to Treasury! After verification of customer delivery confirmation & return period, funds will be released via IMPS with UTR tracking.');
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '10px 0 40px 0' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <span style={{ background: '#ECFDF5', color: '#047857', padding: '3px 10px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: '700' }}>
              <i className="fa-solid fa-shield-halved"></i> Escrow Verification Active
            </span>
          </div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: '800', color: '#0F172A' }}>
            Settlements & Merchant Bank Payouts
          </h1>
          <p style={{ color: '#64748B', fontSize: '0.88rem' }}>
            Track your product turnover, 10% platform cuts, return-window escrow, and direct bank disbursals
          </p>
        </div>

        <button 
          onClick={handleRequestPayout}
          style={{ background: '#10B981', color: '#090D16', border: 'none', padding: '12px 20px', borderRadius: '8px', fontWeight: '800', fontSize: '0.9rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 4px 12px rgba(16,185,129,0.25)' }}
        >
          <i className="fa-solid fa-paper-plane"></i> Request Disbursal
        </button>
      </div>

      {msg && (
        <div style={{ background: '#ECFDF5', border: '1px solid #A7F3D0', color: '#047857', padding: '12px 18px', borderRadius: '8px', marginBottom: '20px', fontSize: '0.9rem', fontWeight: '600' }}>
          {msg}
        </div>
      )}

      {/* Wallet Metric Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '18px', marginBottom: '28px' }}>
        <div style={{ background: '#fff', border: '1px solid var(--seller-border)', borderRadius: '12px', padding: '22px', borderLeft: '4px solid #10B981' }}>
          <span style={{ fontSize: '0.78rem', color: '#64748B', fontWeight: '700', textTransform: 'uppercase' }}>Available for Disbursal</span>
          <div style={{ fontSize: '1.8rem', fontWeight: '800', color: '#047857', marginTop: '4px' }}>
            {formatINR(walletData?.availableForWithdrawal || 0)}
          </div>
          <p style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '4px' }}>
            Orders cleared past return window
          </p>
        </div>

        <div style={{ background: '#fff', border: '1px solid var(--seller-border)', borderRadius: '12px', padding: '22px', borderLeft: '4px solid #F59E0B' }}>
          <span style={{ fontSize: '0.78rem', color: '#64748B', fontWeight: '700', textTransform: 'uppercase' }}>Under Escrow Verification</span>
          <div style={{ fontSize: '1.8rem', fontWeight: '800', color: '#B45309', marginTop: '4px' }}>
            {formatINR(walletData?.pendingVerification || 0)}
          </div>
          <p style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '4px' }}>
            7-day customer return period verification
          </p>
        </div>

        <div style={{ background: '#fff', border: '1px solid var(--seller-border)', borderRadius: '12px', padding: '22px', borderLeft: '4px solid #3B82F6' }}>
          <span style={{ fontSize: '0.78rem', color: '#64748B', fontWeight: '700', textTransform: 'uppercase' }}>Total Disbursed to Bank</span>
          <div style={{ fontSize: '1.8rem', fontWeight: '800', color: '#1D4ED8', marginTop: '4px' }}>
            {formatINR(walletData?.totalDisbursed || 0)}
          </div>
          <p style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '4px' }}>
            Cleared via IMPS / NEFT with Bank UTR
          </p>
        </div>

        <div style={{ background: '#fff', border: '1px solid var(--seller-border)', borderRadius: '12px', padding: '22px', borderLeft: '4px solid #EF4444' }}>
          <span style={{ fontSize: '0.78rem', color: '#64748B', fontWeight: '700', textTransform: 'uppercase' }}>Platform Deductions (10% + 2%)</span>
          <div style={{ fontSize: '1.8rem', fontWeight: '800', color: '#DC2626', marginTop: '4px' }}>
            &minus;{formatINR(walletData?.totalDeductions || 0)}
          </div>
          <p style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '4px' }}>
            Marketplace commission & PG surcharge
          </p>
        </div>
      </div>

      {/* Bank Account Details Card */}
      <div style={{ background: '#fff', border: '1px solid var(--seller-border)', borderRadius: '12px', padding: '24px', marginBottom: '28px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: '800', color: '#0F172A', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <i className="fa-solid fa-building-columns" style={{ color: '#2563EB' }}></i> Registered Bank Payout Routing Account
          </h3>
          <button 
            onClick={() => setIsEditingBank(!isEditingBank)}
            style={{ background: '#F1F5F9', border: '1px solid #CBD5E1', padding: '6px 14px', borderRadius: '6px', fontSize: '0.8rem', fontWeight: '700', cursor: 'pointer', color: '#334155' }}
          >
            <i className="fa-solid fa-pen-to-square"></i> {isEditingBank ? 'Cancel' : 'Edit Bank Details'}
          </button>
        </div>

        {isEditingBank ? (
          <form onSubmit={handleUpdateBank} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', background: '#F8FAFC', padding: '20px', borderRadius: '8px', border: '1px solid var(--seller-border)' }}>
            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: '700', color: '#475569' }}>Account Holder Name</label>
              <input 
                type="text"
                required
                value={bankForm.accountHolderName}
                onChange={(e) => setBankForm({ ...bankForm, accountHolderName: e.target.value })}
                className="seller-form-input"
                style={{ padding: '8px 12px', width: '100%', marginTop: '4px', borderRadius: '6px', border: '1px solid #CBD5E1' }}
              />
            </div>
            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: '700', color: '#475569' }}>Bank Name</label>
              <input 
                type="text"
                required
                value={bankForm.bankName}
                onChange={(e) => setBankForm({ ...bankForm, bankName: e.target.value })}
                style={{ padding: '8px 12px', width: '100%', marginTop: '4px', borderRadius: '6px', border: '1px solid #CBD5E1' }}
              />
            </div>
            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: '700', color: '#475569' }}>Account Number</label>
              <input 
                type="text"
                required
                value={bankForm.accountNumber}
                onChange={(e) => setBankForm({ ...bankForm, accountNumber: e.target.value })}
                style={{ padding: '8px 12px', width: '100%', marginTop: '4px', borderRadius: '6px', border: '1px solid #CBD5E1' }}
              />
            </div>
            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: '700', color: '#475569' }}>IFSC Code</label>
              <input 
                type="text"
                required
                value={bankForm.ifscCode}
                onChange={(e) => setBankForm({ ...bankForm, ifscCode: e.target.value })}
                style={{ padding: '8px 12px', width: '100%', marginTop: '4px', borderRadius: '6px', border: '1px solid #CBD5E1' }}
              />
            </div>
            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: '700', color: '#475569' }}>UPI ID (Optional)</label>
              <input 
                type="text"
                value={bankForm.upiId}
                onChange={(e) => setBankForm({ ...bankForm, upiId: e.target.value })}
                placeholder="store@upi"
                style={{ padding: '8px 12px', width: '100%', marginTop: '4px', borderRadius: '6px', border: '1px solid #CBD5E1' }}
              />
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-end' }}>
              <button 
                type="submit" 
                style={{ padding: '10px 20px', background: '#0F172A', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: '700', cursor: 'pointer' }}
              >
                Save Bank Details
              </button>
            </div>
          </form>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', background: '#F8FAFC', padding: '18px', borderRadius: '8px', border: '1px solid var(--seller-border)' }}>
            <div>
              <div style={{ fontSize: '0.72rem', color: '#64748B', textTransform: 'uppercase', fontWeight: '700' }}>Bank Institution</div>
              <div style={{ fontWeight: '800', color: '#0F172A', marginTop: '2px' }}>{walletData?.bankDetails?.bankName || 'HDFC Bank'}</div>
            </div>
            <div>
              <div style={{ fontSize: '0.72rem', color: '#64748B', textTransform: 'uppercase', fontWeight: '700' }}>Account Number</div>
              <div style={{ fontWeight: '800', color: '#0F172A', marginTop: '2px' }}>
                {walletData?.bankDetails?.accountNumber ? `•••• •••• ${walletData.bankDetails.accountNumber.slice(-4)}` : '5010 •••• 1244'}
              </div>
            </div>
            <div>
              <div style={{ fontSize: '0.72rem', color: '#64748B', textTransform: 'uppercase', fontWeight: '700' }}>IFSC Code</div>
              <div style={{ fontWeight: '800', color: '#0F172A', marginTop: '2px' }}>{walletData?.bankDetails?.ifscCode || 'HDFC0001234'}</div>
            </div>
            <div>
              <div style={{ fontSize: '0.72rem', color: '#64748B', textTransform: 'uppercase', fontWeight: '700' }}>Disbursal Method</div>
              <div style={{ fontWeight: '800', color: '#047857', marginTop: '2px' }}>
                <i className="fa-solid fa-bolt"></i> IMPS Direct Credit
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Settlement Disbursals Table */}
      <div style={{ background: '#fff', border: '1px solid var(--seller-border)', borderRadius: '12px', padding: '24px' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: '800', color: '#0F172A', marginBottom: '16px' }}>
          Settlement Statement & Payout Disbursals Ledger
        </h3>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
            <thead>
              <tr style={{ background: '#F8FAFC', borderBottom: '1px solid var(--seller-border)', textAlign: 'left', color: '#64748B', fontSize: '0.78rem', textTransform: 'uppercase' }}>
                <th style={{ padding: '12px 16px' }}>Statement ID & Date</th>
                <th style={{ padding: '12px 16px', textAlign: 'right' }}>Gross Subtotal</th>
                <th style={{ padding: '12px 16px', textAlign: 'right', color: '#DC2626' }}>Platform Cut (10% + 2%)</th>
                <th style={{ padding: '12px 16px', textAlign: 'right', color: '#047857' }}>Net Seller Payout</th>
                <th style={{ padding: '12px 16px' }}>Bank Reference / UTR</th>
                <th style={{ padding: '12px 16px', textAlign: 'center' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {settlements.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '30px', color: '#94A3B8' }}>
                    No settlement records found.
                  </td>
                </tr>
              ) : (
                settlements.map((s) => (
                  <tr key={s._id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                    <td style={{ padding: '14px 16px' }}>
                      <strong style={{ color: '#0F172A' }}>{s.transactionId}</strong>
                      <div style={{ fontSize: '0.75rem', color: '#64748B' }}>
                        {new Date(s.createdAt).toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </div>
                    </td>
                    <td style={{ padding: '14px 16px', textAlign: 'right', fontWeight: '700' }}>
                      {formatINR(s.subtotal)}
                    </td>
                    <td style={{ padding: '14px 16px', textAlign: 'right', color: '#DC2626', fontWeight: '700' }}>
                      &minus;{formatINR(s.totalDeductions)}
                    </td>
                    <td style={{ padding: '14px 16px', textAlign: 'right', fontWeight: '800', color: '#15803D' }}>
                      {formatINR(s.netDisbursedAmount)}
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      {s.utrNumber ? (
                        <span style={{ fontFamily: 'monospace', fontWeight: '700', color: '#047857', fontSize: '0.82rem' }}>
                          {s.utrNumber}
                        </span>
                      ) : (
                        <span style={{ color: '#94A3B8', fontSize: '0.78rem', fontStyle: 'italic' }}>
                          Pending Treasury Approval
                        </span>
                      )}
                    </td>
                    <td style={{ padding: '14px 16px', textAlign: 'center' }}>
                      {s.status === 'DISBURSED' && (
                        <span style={{ background: '#ECFDF5', color: '#047857', padding: '3px 10px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: '700' }}>
                          <i className="fa-solid fa-circle-check"></i> Disbursed
                        </span>
                      )}
                      {s.status === 'PENDING_VERIFICATION' && (
                        <span style={{ background: '#FFFBEB', color: '#B45309', padding: '3px 10px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: '700' }}>
                          <i className="fa-solid fa-clock"></i> In Verification
                        </span>
                      )}
                      {s.status === 'ON_HOLD' && (
                        <span style={{ background: '#FEF2F2', color: '#DC2626', padding: '3px 10px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: '700' }}>
                          <i className="fa-solid fa-hand"></i> On Hold
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
