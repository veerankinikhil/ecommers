import React, { useEffect, useState, useMemo } from 'react';
import paymentApi, { formatINR } from '../services/paymentApi';
import { usePaymentAuth } from '../context/PaymentAuthContext';
import TreasuryVoucherModal, { formatDateTimeWithSeconds } from '../components/TreasuryVoucherModal';

export default function TreasuryDashboard() {
  const { user, logout, livePayments } = usePaymentAuth();
  const [stats, setStats] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'sellers', 'riders', 'warehouse', 'pending'
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [processingId, setProcessingId] = useState(null);
  const [actionSuccessMsg, setActionSuccessMsg] = useState('');
  const [selectedVoucherTx, setSelectedVoucherTx] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [statsRes, txRes] = await Promise.all([
        paymentApi.get('/payments/treasury-stats'),
        paymentApi.get('/payments/transactions?limit=100')
      ]);
      setStats(statsRes.data.stats);
      setTransactions(txRes.data.transactions);
    } catch (err) {
      console.error('Error loading treasury data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDisburse = async (txId, recipientName, amount) => {
    if (!window.confirm(`Confirm IMPS/NEFT disbursal of ${formatINR(amount)} to ${recipientName}?`)) return;
    setProcessingId(txId);
    setActionSuccessMsg('');

    try {
      const { data } = await paymentApi.post(`/payments/disburse/${txId}`, {
        notes: 'Approved & verified by Treasury. IMPS payment settled.'
      });
      setActionSuccessMsg(`✅ ${data.message}`);
      fetchData();
    } catch (err) {
      alert(`Error executing disbursal: ${err.response?.data?.message || err.message}`);
    } finally {
      setProcessingId(null);
    }
  };

  const handleHold = async (txId, recipientName) => {
    const reason = window.prompt(`Enter compliance reason to place payout to ${recipientName} on hold:`, 'Additional return window verification required');
    if (!reason) return;
    setProcessingId(txId);

    try {
      const { data } = await paymentApi.post(`/payments/hold/${txId}`, { reason });
      setActionSuccessMsg(`⚠️ ${data.message}`);
      fetchData();
    } catch (err) {
      alert(`Error holding transaction: ${err.response?.data?.message || err.message}`);
    } finally {
      setProcessingId(null);
    }
  };

  const handleReleaseHold = async (txId) => {
    setProcessingId(txId);
    try {
      const { data } = await paymentApi.post(`/payments/release-hold/${txId}`);
      setActionSuccessMsg(`✅ ${data.message}`);
      fetchData();
    } catch (err) {
      alert(`Error releasing hold: ${err.response?.data?.message || err.message}`);
    } finally {
      setProcessingId(null);
    }
  };

  // Filtered transactions
  const filteredList = useMemo(() => {
    return transactions.filter(t => {
      // Tab specific filter
      if (activeTab === 'sellers' && t.type !== 'SELLER_SETTLEMENT') return false;
      if (activeTab === 'riders' && t.type !== 'RIDER_PAYOUT') return false;
      if (activeTab === 'warehouse' && t.type !== 'WAREHOUSE_SALARY') return false;
      if (activeTab === 'pending' && t.status !== 'PENDING_VERIFICATION' && t.status !== 'ON_HOLD') return false;

      // Dropdown type filter
      if (typeFilter !== 'ALL' && t.type !== typeFilter) return false;

      // Search filter
      if (search) {
        const q = search.toLowerCase();
        const matchesTx = t.transactionId?.toLowerCase().includes(q);
        const matchesUtr = t.utrNumber?.toLowerCase().includes(q);
        const matchesOrd = t.orderNumber?.toLowerCase().includes(q);
        const matchesRecipient = t.recipient?.name?.toLowerCase().includes(q) || t.recipient?.storeOrHubName?.toLowerCase().includes(q);
        const matchesSender = t.sender?.name?.toLowerCase().includes(q);
        return matchesTx || matchesUtr || matchesOrd || matchesRecipient || matchesSender;
      }

      return true;
    });
  }, [transactions, activeTab, typeFilter, search]);

  const sellerPendingCount = transactions.filter(t => t.type === 'SELLER_SETTLEMENT' && t.status === 'PENDING_VERIFICATION').length;
  const riderPendingCount = transactions.filter(t => t.type === 'RIDER_PAYOUT' && t.status === 'PENDING_VERIFICATION').length;
  const whPendingCount = transactions.filter(t => t.type === 'WAREHOUSE_SALARY' && t.status === 'PENDING_VERIFICATION').length;

  return (
    <div className="pay-layout">
      {/* Sidebar */}
      <aside className="pay-sidebar">
        <div className="pay-brand">
          <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#10B981', color: '#090D16', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}>
            <i className="fa-solid fa-vault"></i>
          </div>
          <div>
            <div>NovaKart Treasury</div>
            <div className="pay-brand-sub">Digital Payments</div>
          </div>
        </div>

        <nav className="pay-nav">
          <button 
            className={`pay-nav-btn ${activeTab === 'all' ? 'active' : ''}`}
            onClick={() => setActiveTab('all')}
          >
            <i className="fa-solid fa-arrows-split-up-and-left"></i>
            <span>All Transactions ({transactions.length})</span>
          </button>

          <button 
            className={`pay-nav-btn ${activeTab === 'sellers' ? 'active' : ''}`}
            onClick={() => setActiveTab('sellers')}
          >
            <i className="fa-solid fa-store"></i>
            <span>Seller Settlements</span>
            {sellerPendingCount > 0 && (
              <span style={{ marginLeft: 'auto', background: '#F59E0B', color: '#090D16', padding: '2px 8px', borderRadius: '10px', fontSize: '0.7rem', fontWeight: '800' }}>
                {sellerPendingCount}
              </span>
            )}
          </button>

          <button 
            className={`pay-nav-btn ${activeTab === 'riders' ? 'active' : ''}`}
            onClick={() => setActiveTab('riders')}
          >
            <i className="fa-solid fa-motorcycle"></i>
            <span>Rider Fleet Payouts</span>
            {riderPendingCount > 0 && (
              <span style={{ marginLeft: 'auto', background: '#F59E0B', color: '#090D16', padding: '2px 8px', borderRadius: '10px', fontSize: '0.7rem', fontWeight: '800' }}>
                {riderPendingCount}
              </span>
            )}
          </button>

          <button 
            className={`pay-nav-btn ${activeTab === 'warehouse' ? 'active' : ''}`}
            onClick={() => setActiveTab('warehouse')}
          >
            <i className="fa-solid fa-warehouse"></i>
            <span>Warehouse Salaries</span>
            {whPendingCount > 0 && (
              <span style={{ marginLeft: 'auto', background: '#F59E0B', color: '#090D16', padding: '2px 8px', borderRadius: '10px', fontSize: '0.7rem', fontWeight: '800' }}>
                {whPendingCount}
              </span>
            )}
          </button>

          <button 
            className={`pay-nav-btn ${activeTab === 'pending' ? 'active' : ''}`}
            onClick={() => setActiveTab('pending')}
          >
            <i className="fa-solid fa-clock-rotate-left"></i>
            <span>Pending Approvals</span>
            <span style={{ marginLeft: 'auto', background: '#EF4444', color: '#fff', padding: '2px 8px', borderRadius: '10px', fontSize: '0.7rem', fontWeight: '800' }}>
              {stats?.pendingVerificationCount || 0}
            </span>
          </button>
        </nav>

        <div style={{ padding: '20px 18px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
            <img src={user?.avatar || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=100&q=80'} alt="Avatar" style={{ width: '38px', height: '38px', borderRadius: '50%', objectFit: 'cover' }} />
            <div style={{ overflow: 'hidden' }}>
              <div style={{ fontSize: '0.85rem', fontWeight: '700', color: '#fff', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>{user?.name || 'Treasury Officer'}</div>
              <div style={{ fontSize: '0.72rem', color: '#10B981', fontWeight: '600' }}>Disbursal Authority</div>
            </div>
          </div>
          <button 
            onClick={logout}
            style={{ width: '100%', padding: '8px', background: 'rgba(239, 68, 68, 0.15)', color: '#F87171', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '6px', fontSize: '0.8rem', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
          >
            <i className="fa-solid fa-arrow-right-from-bracket"></i> Exit Treasury
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="pay-content">
        {/* Header */}
        <div className="pay-top-header">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <span className="badge badge-success">
                <i className="fa-solid fa-shield-check"></i> RBI Compliant Nodal Escrow
              </span>
              <span className="badge badge-blue">
                <i className="fa-solid fa-bolt"></i> IMPS / NEFT 24x7 Settlement
              </span>
            </div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: '800', color: '#0F172A' }}>
              Digital Payments & Disbursals Command
            </h1>
            <p style={{ color: '#64748B', fontSize: '0.88rem' }}>
              Monitoring inbound order payments, 10% platform cuts, vendor settlements, and staff salaries
            </p>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button 
              onClick={fetchData}
              style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#fff', border: '1px solid var(--pay-border)', padding: '10px 16px', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', color: '#334155', fontSize: '0.85rem' }}
            >
              <i className={`fa-solid fa-rotate ${loading ? 'fa-spin' : ''}`}></i> Sync Gateway
            </button>

            <button 
              onClick={() => {
                const csv = "data:text/csv;charset=utf-8," +
                  "Transaction ID,UTR Number,Type,Status,Amount,Net Disbursed,Sender,Recipient,Bank Name,Account No,IFSC,Date\n" +
                  transactions.map(t => `"${t.transactionId}","${t.utrNumber || 'PENDING'}","${t.type}","${t.status}",${t.amount},${t.netDisbursedAmount},"${t.sender?.name}","${t.recipient?.name}","${t.recipient?.bankName || ''}","${t.recipient?.accountNumber || ''}","${t.recipient?.ifscCode || ''}","${new Date(t.createdAt).toISOString()}"`).join("\n");
                const link = document.createElement("a");
                link.setAttribute("href", encodeURI(csv));
                link.setAttribute("download", `Treasury_Ledger_${new Date().toISOString().slice(0,10)}.csv`);
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
              }}
              style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#090D16', color: '#fff', border: 'none', padding: '10px 18px', borderRadius: '8px', cursor: 'pointer', fontWeight: '700', fontSize: '0.85rem' }}
            >
              <i className="fa-solid fa-file-invoice-dollar"></i> Export Audit Statement
            </button>
          </div>
        </div>

        {/* Action success alert */}
        {actionSuccessMsg && (
          <div style={{ background: '#ECFDF5', border: '1px solid #A7F3D0', color: '#047857', padding: '12px 18px', borderRadius: '8px', fontSize: '0.9rem', fontWeight: '600', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <i className="fa-solid fa-circle-check" style={{ fontSize: '1.1rem' }}></i>
            <span>{actionSuccessMsg}</span>
          </div>
        )}

        {/* Master Liquidity Ribbon */}
        <div className="pay-grid">
          <div className="pay-card" style={{ borderLeft: '4px solid #10B981' }}>
            <div>
              <span className="pay-lbl">Inbound Customer Inflows</span>
              <div className="pay-val" style={{ color: '#047857' }}>
                {formatINR(stats?.totalInboundReceived || 0)}
              </div>
              <div style={{ fontSize: '0.78rem', color: '#64748B', marginTop: '4px' }}>
                All captured customer checkout payments
              </div>
            </div>
            <div style={{ width: '46px', height: '46px', borderRadius: '12px', background: '#ECFDF5', color: '#10B981', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem' }}>
              <i className="fa-solid fa-arrow-down-left"></i>
            </div>
          </div>

          <div className="pay-card" style={{ borderLeft: '4px solid #3B82F6' }}>
            <div>
              <span className="pay-lbl">Outbound Disbursed</span>
              <div className="pay-val" style={{ color: '#1D4ED8' }}>
                {formatINR(stats?.totalOutboundDisbursed || 0)}
              </div>
              <div style={{ fontSize: '0.78rem', color: '#64748B', marginTop: '4px' }}>
                Settlements + Rider Fees + Salaries
              </div>
            </div>
            <div style={{ width: '46px', height: '46px', borderRadius: '12px', background: '#EFF6FF', color: '#3B82F6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem' }}>
              <i className="fa-solid fa-arrow-up-right"></i>
            </div>
          </div>

          <div className="pay-card" style={{ borderLeft: '4px solid #8B5CF6' }}>
            <div>
              <span className="pay-lbl">Escrow Nodal Reserve</span>
              <div className="pay-val" style={{ color: '#6D28D9' }}>
                {formatINR(stats?.escrowReserve || 0)}
              </div>
              <div style={{ fontSize: '0.78rem', color: '#64748B', marginTop: '4px' }}>
                Liquid pool held in RBI-compliant escrow
              </div>
            </div>
            <div style={{ width: '46px', height: '46px', borderRadius: '12px', background: '#F5F3FF', color: '#8B5CF6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem' }}>
              <i className="fa-solid fa-landmark"></i>
            </div>
          </div>

          <div className="pay-card" style={{ borderLeft: '4px solid #F59E0B' }}>
            <div>
              <span className="pay-lbl">Pending Verification Disbursals</span>
              <div className="pay-val" style={{ color: '#B45309' }}>
                {formatINR(stats?.totalPendingDisbursals || 0)}
              </div>
              <div style={{ fontSize: '0.78rem', color: '#64748B', marginTop: '4px' }}>
                <strong>{stats?.pendingVerificationCount || 0} claims</strong> awaiting compliance release
              </div>
            </div>
            <div style={{ width: '46px', height: '46px', borderRadius: '12px', background: '#FFFBEB', color: '#F59E0B', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem' }}>
              <i className="fa-solid fa-clock-rotate-left"></i>
            </div>
          </div>
        </div>

        {/* Verification Rule Notice Banner */}
        <div style={{ background: '#090D16', color: '#fff', borderRadius: '12px', padding: '18px 24px', marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid rgba(255,255,255,0.1)' }}>
          <div>
            <div style={{ fontSize: '0.75rem', color: '#10B981', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              <i className="fa-solid fa-shield-halved" style={{ marginRight: '6px' }}></i> Two-Tier Payout Protection Protocol
            </div>
            <div style={{ fontSize: '0.98rem', fontWeight: '700', marginTop: '4px' }}>
              Funds are never auto-credited immediately to sellers or riders without Treasury verification
            </div>
            <p style={{ color: '#94A3B8', fontSize: '0.8rem', marginTop: '2px' }}>
              Sellers undergo a 7-day customer return window check. Courier riders undergo dispatch proof reconciliation. Warehouse managers require verified bank IFSC & PAN accounts.
            </p>
          </div>
          <div>
            <span className="badge badge-success" style={{ fontSize: '0.8rem', padding: '6px 14px' }}>
              <i className="fa-solid fa-check"></i> Escrow Verification Active
            </span>
          </div>
        </div>

        {/* Filters and Search */}
        <div style={{ background: '#fff', border: '1px solid var(--pay-border)', borderRadius: '12px', padding: '20px', marginBottom: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px', marginBottom: '16px' }}>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <h2 style={{ fontSize: '1.15rem', fontWeight: '800', color: '#0F172A' }}>
                {activeTab === 'all' && 'All Inbound & Outbound Treasury Transactions'}
                {activeTab === 'sellers' && 'Seller Settlements & Escrow Deductions'}
                {activeTab === 'riders' && 'Delivery Courier Fleet Compensation Ledger'}
                {activeTab === 'warehouse' && 'Warehouse Logistics Staff & Manager Payroll'}
                {activeTab === 'pending' && 'Pending Verification & Compliance Release Queue'}
              </h2>
              <span className="badge badge-blue">
                {filteredList.length} Records
              </span>
            </div>

            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <div style={{ position: 'relative' }}>
                <i className="fa-solid fa-magnifying-glass" style={{ position: 'absolute', left: '12px', top: '12px', color: '#94A3B8', fontSize: '0.85rem' }}></i>
                <input 
                  type="text" 
                  placeholder="Search TXN #, UTR, Name, Store..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  style={{ padding: '9px 12px 9px 34px', border: '1px solid var(--pay-border)', borderRadius: '6px', fontSize: '0.85rem', width: '260px' }}
                />
              </div>

              <select 
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                style={{ padding: '9px 14px', border: '1px solid var(--pay-border)', borderRadius: '6px', fontSize: '0.85rem', color: '#334155' }}
              >
                <option value="ALL">All Transaction Types</option>
                <option value="INBOUND_CUSTOMER_PAYMENT">Customer Payments Inbound</option>
                <option value="SELLER_SETTLEMENT">Seller Settlements Outbound</option>
                <option value="RIDER_PAYOUT">Delivery Rider Payouts</option>
                <option value="WAREHOUSE_SALARY">Warehouse Manager Payroll</option>
              </select>
            </div>
          </div>

          {/* Master Transactions Table */}
          <div style={{ overflowX: 'auto' }}>
            <table className="pay-table">
              <thead>
                <tr>
                  <th>Transaction ID</th>
                  <th>Flow &amp; Type</th>
                  <th>Received At (Date, Time, Seconds)</th>
                  <th>Disbursed At (Date, Time, Seconds)</th>
                  <th>Counterparty (Sender ➔ Recipient)</th>
                  <th>Payment Method</th>
                  <th style={{ textAlign: 'right' }}>Gross Amount</th>
                  <th style={{ textAlign: 'right' }}>Deductions</th>
                  <th style={{ textAlign: 'right' }}>Net Disbursed</th>
                  <th>Bank / UTR Reference</th>
                  <th style={{ textAlign: 'center' }}>Verification Status</th>
                  <th style={{ textAlign: 'center' }}>Voucher &amp; Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredList.length === 0 ? (
                  <tr>
                    <td colSpan="12" style={{ textAlign: 'center', padding: '36px', color: '#94A3B8' }}>
                      No financial transactions matching the selected criteria.
                    </td>
                  </tr>
                ) : (
                  filteredList.map((tx) => {
                    const isInbound = tx.type === 'INBOUND_CUSTOMER_PAYMENT';
                    const isDisbursed = tx.status === 'DISBURSED' || tx.status === 'SUCCESS';
                    const isOnHold = tx.status === 'ON_HOLD';
                    const isPending = tx.status === 'PENDING_VERIFICATION';
                    const receivedFormatted = formatDateTimeWithSeconds(tx.receivedAt || tx.createdAt);
                    const disbursedFormatted = tx.disbursedAt ? formatDateTimeWithSeconds(tx.disbursedAt) : null;

                    return (
                      <tr key={tx._id}>
                        <td>
                          <strong style={{ color: '#0F172A', fontFamily: 'monospace' }}>{tx.transactionId}</strong>
                          {tx.orderNumber && (
                            <div style={{ fontSize: '0.72rem', color: '#2563EB', fontWeight: '700', marginTop: '2px' }}>
                              Order: #{tx.orderNumber}
                            </div>
                          )}
                        </td>

                        <td>
                          {isInbound ? (
                            <span className="badge badge-success" style={{ fontSize: '0.7rem' }}>
                              <i className="fa-solid fa-arrow-down-left"></i> INBOUND
                            </span>
                          ) : (
                            <span className="badge badge-purple" style={{ fontSize: '0.7rem' }}>
                              <i className="fa-solid fa-arrow-up-right"></i> OUTBOUND
                            </span>
                          )}
                          <div style={{ fontSize: '0.75rem', fontWeight: '700', color: '#334155', marginTop: '4px' }}>
                            {tx.type === 'INBOUND_CUSTOMER_PAYMENT' && 'Customer Order Pay'}
                            {tx.type === 'SELLER_SETTLEMENT' && 'Seller Settlement'}
                            {tx.type === 'RIDER_PAYOUT' && 'Rider Trip Compensation'}
                            {tx.type === 'WAREHOUSE_SALARY' && 'Warehouse Manager Salary'}
                          </div>
                        </td>

                        {/* Received At (With Seconds) */}
                        <td style={{ whiteSpace: 'nowrap' }}>
                          <div style={{ fontFamily: 'monospace', fontWeight: '700', fontSize: '0.8rem', color: '#0F172A' }}>
                            <i className="fa-regular fa-clock" style={{ color: '#2563EB', marginRight: '5px' }}></i>
                            {receivedFormatted}
                          </div>
                          <span style={{ fontSize: '0.68rem', color: '#64748B' }}>Captured in Escrow</span>
                        </td>

                        {/* Disbursed At (With Seconds) */}
                        <td style={{ whiteSpace: 'nowrap' }}>
                          {disbursedFormatted ? (
                            <div>
                              <div style={{ fontFamily: 'monospace', fontWeight: '700', fontSize: '0.8rem', color: '#059669' }}>
                                <i className="fa-solid fa-check-double" style={{ marginRight: '5px' }}></i>
                                {disbursedFormatted}
                              </div>
                              <span style={{ fontSize: '0.68rem', color: '#059669', fontWeight: '600' }}>Settled to Beneficiary</span>
                            </div>
                          ) : isInbound ? (
                            <div>
                              <div style={{ fontFamily: 'monospace', fontWeight: '700', fontSize: '0.8rem', color: '#059669' }}>
                                <i className="fa-solid fa-check" style={{ marginRight: '5px' }}></i>
                                {receivedFormatted}
                              </div>
                              <span style={{ fontSize: '0.68rem', color: '#059669', fontWeight: '600' }}>Nodal Pool Clear</span>
                            </div>
                          ) : (
                            <span style={{ fontSize: '0.72rem', color: '#92400E', fontWeight: '700', background: '#FEF3C7', padding: '3px 8px', borderRadius: '4px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                              <i className="fa-solid fa-hourglass-half fa-spin"></i> Pending Disbursal
                            </span>
                          )}
                        </td>

                        <td>
                          <div>
                            <span style={{ fontSize: '0.72rem', color: '#64748B' }}>From: </span>
                            <strong style={{ fontSize: '0.82rem' }}>{tx.sender?.name}</strong>
                          </div>
                          <div style={{ marginTop: '2px' }}>
                            <span style={{ fontSize: '0.72rem', color: '#64748B' }}>To: </span>
                            <strong style={{ color: '#0F172A', fontSize: '0.84rem' }}>{tx.recipient?.name}</strong>
                            {tx.recipient?.storeOrHubName && (
                              <span style={{ fontSize: '0.74rem', color: '#2563EB', marginLeft: '4px' }}>
                                ({tx.recipient.storeOrHubName})
                              </span>
                            )}
                          </div>
                        </td>

                        <td>
                          <span className="method-chip">
                            <i className="fa-solid fa-credit-card" style={{ fontSize: '0.7rem' }}></i>
                            {tx.paymentMethod}
                          </span>
                        </td>

                        <td style={{ textAlign: 'right', fontWeight: '800', color: isInbound ? '#047857' : '#0F172A' }}>
                          {formatINR(tx.amount)}
                        </td>

                        <td style={{ textAlign: 'right', color: '#DC2626', fontWeight: '600' }}>
                          {tx.totalDeductions > 0 ? `-${formatINR(tx.totalDeductions)}` : '₹0'}
                        </td>

                        <td style={{ textAlign: 'right', fontWeight: '800', color: isInbound ? '#047857' : '#15803D' }}>
                          {formatINR(tx.netDisbursedAmount || tx.amount)}
                        </td>

                        <td>
                          {tx.utrNumber ? (
                            <div>
                              <span style={{ fontFamily: 'monospace', fontWeight: '700', color: '#047857', fontSize: '0.8rem' }}>
                                {tx.utrNumber}
                              </span>
                              {tx.recipient?.bankName && (
                                <div style={{ fontSize: '0.72rem', color: '#64748B' }}>
                                  {tx.recipient.bankName} &bull; A/C: ****{tx.recipient.accountNumber?.slice(-4)}
                                </div>
                              )}
                            </div>
                          ) : (
                            <span style={{ color: '#94A3B8', fontSize: '0.78rem', fontStyle: 'italic' }}>
                              Awaiting Disbursal
                            </span>
                          )}
                        </td>

                        <td style={{ textAlign: 'center' }}>
                          {isDisbursed && (
                            <span className="badge badge-success">
                              <i className="fa-solid fa-circle-check"></i> Settled
                            </span>
                          )}
                          {isPending && (
                            <span className="badge badge-pending">
                              <i className="fa-solid fa-clock"></i> Verification Hold
                            </span>
                          )}
                          {isOnHold && (
                            <span className="badge badge-hold">
                              <i className="fa-solid fa-hand"></i> Audit Hold
                            </span>
                          )}
                          <div style={{ fontSize: '0.7rem', color: '#64748B', marginTop: '4px', maxWidth: '180px' }}>
                            {tx.verificationNotes}
                          </div>
                        </td>

                        <td style={{ textAlign: 'center' }}>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', alignItems: 'center' }}>
                            <button
                              onClick={() => setSelectedVoucherTx(tx)}
                              style={{
                                background: '#0F172A',
                                color: '#FFFFFF',
                                border: 'none',
                                padding: '5px 12px',
                                borderRadius: '6px',
                                fontSize: '0.74rem',
                                fontWeight: '700',
                                cursor: 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '5px',
                                width: '100%',
                                justifyContent: 'center',
                                boxShadow: '0 1px 3px rgba(0,0,0,0.15)'
                              }}
                            >
                              <i className="fa-solid fa-file-invoice-dollar" style={{ color: '#10B981' }}></i>
                              Voucher
                            </button>

                            {isPending && (
                              <div style={{ display: 'flex', gap: '4px', width: '100%' }}>
                                <button
                                  className="btn-disburse"
                                  disabled={processingId === tx._id}
                                  onClick={() => handleDisburse(tx._id, tx.recipient?.name, tx.netDisbursedAmount || tx.amount)}
                                  style={{ flex: 1, padding: '5px 8px', fontSize: '0.72rem' }}
                                  title="Verify bank account and execute instant IMPS/NEFT payout"
                                >
                                  <i className="fa-solid fa-paper-plane"></i> Pay
                                </button>
                                <button
                                  className="btn-hold"
                                  disabled={processingId === tx._id}
                                  onClick={() => handleHold(tx._id, tx.recipient?.name)}
                                  style={{ padding: '5px 8px', fontSize: '0.72rem' }}
                                  title="Hold payout for compliance/fraud check"
                                >
                                  <i className="fa-solid fa-pause"></i>
                                </button>
                              </div>
                            )}

                            {isOnHold && (
                              <button
                                className="btn-release"
                                disabled={processingId === tx._id}
                                onClick={() => handleReleaseHold(tx._id)}
                                style={{ width: '100%', padding: '5px 8px', fontSize: '0.72rem' }}
                                title="Release hold and send to verification queue"
                              >
                                <i className="fa-solid fa-play"></i> Release
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Live Socket.IO Gateway Stream */}
        <div style={{ background: '#fff', border: '1px solid var(--pay-border)', borderRadius: '12px', padding: '22px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: '800', color: '#0F172A', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <i className="fa-solid fa-satellite-dish" style={{ color: '#10B981' }}></i> Real-Time Gateway Event Stream ({livePayments.length})
            </h3>
            <span className="badge badge-success">
              <i className="fa-solid fa-wifi"></i> Gateway Webhook Active
            </span>
          </div>

          {livePayments.length === 0 ? (
            <p style={{ color: '#94A3B8', fontStyle: 'italic', fontSize: '0.85rem' }}>
              Listening for live customer checkout payments, gateway captures, and instant disbursal webhooks...
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {livePayments.slice(0, 5).map((ev, idx) => (
                <div key={idx} style={{ background: '#F8FAFC', padding: '10px 14px', borderRadius: '6px', fontSize: '0.85rem', borderLeft: '4px solid #10B981', display: 'flex', justifyContent: 'space-between' }}>
                  <div>
                    <strong>{ev.event || 'PAYMENT_EVENT'}</strong> &bull; TXN #{ev.transactionId || ev.orderNumber}
                  </div>
                  <div style={{ fontWeight: '800', color: '#047857' }}>
                    {formatINR(ev.amount || 0)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Official Treasury Bank Disbursal Voucher Modal */}
      {selectedVoucherTx && (
        <TreasuryVoucherModal
          transaction={selectedVoucherTx}
          onClose={() => setSelectedVoucherTx(null)}
        />
      )}
    </div>
  );
}
