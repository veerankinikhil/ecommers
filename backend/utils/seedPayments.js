import mongoose from 'mongoose';
import { User } from '../models/User.js';
import { Seller } from '../models/Seller.js';
import { DeliveryAgent } from '../models/DeliveryAgent.js';
import { Warehouse } from '../models/Warehouse.js';
import { Order } from '../models/Order.js';
import { PaymentTransaction } from '../models/PaymentTransaction.js';
import { ROLES } from '../config/constants.js';

export const seedPayments = async () => {
  try {
    console.log('🔄 Verifying Finance & Treasury infrastructure...');

    // 1. Ensure Finance Officer User Exists
    const financeEmail = 'finance@yourstore.com';
    let financeUser = await User.findOne({ email: financeEmail });
    if (!financeUser) {
      financeUser = await User.create({
        name: 'Finance & Treasury Director',
        email: financeEmail,
        password: 'FinanceSecure2026!',
        role: ROLES.FINANCE,
        phone: '+91 99887 76655',
        avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80'
      });
      console.log(`✅ [Seed] Finance Officer created: ${financeEmail}`);
    }

    // 2. Sync Inbound Customer Payments from existing orders
    const orders = await Order.find({ orderStatus: { $ne: 'CANCELLED' } })
      .populate('sellerId', 'storeName ownerName')
      .populate('deliveryAgentId', 'fullName');

    for (const ord of orders) {
      const inboundTxId = `TXN-IN-${ord.orderNumber}`;
      const existingInbound = await PaymentTransaction.findOne({ transactionId: inboundTxId });

      if (!existingInbound) {
        await PaymentTransaction.create({
          transactionId: inboundTxId,
          utrNumber: `UTR-IN-${Date.now().toString().slice(-6)}${Math.floor(1000 + Math.random() * 9000)}`,
          type: 'INBOUND_CUSTOMER_PAYMENT',
          amount: ord.totalAmount,
          subtotal: ord.subtotal,
          tax: ord.tax || 0,
          deliveryFee: ord.shippingFee || 0,
          sender: {
            name: ord.deliveryAddress?.fullName || 'Customer',
            role: 'customer',
            accountOrVpa: ord.paymentMethod?.includes('UPI') ? 'buyer@okaxis' : 'HDFC PG / 4532-****-****-8921'
          },
          recipient: {
            name: 'NovaKart Marketplace Escrow Pool',
            role: 'platform',
            storeOrHubName: 'NovaKart Central Treasury',
            bankName: 'HDFC Escrow Account',
            accountNumber: '50200084729104',
            ifscCode: 'HDFC0000001'
          },
          paymentMethod: ord.paymentMethod || 'UPI / Google Pay',
          status: 'SUCCESS',
          verificationStatus: 'VERIFIED',
          verificationNotes: 'Payment captured and settled into NovaKart nodal escrow account',
          orderId: ord._id,
          orderNumber: ord.orderNumber,
          createdAt: ord.createdAt
        });
      }
    }

    // 3. Ensure Outbound Seller Settlements
    const existingSellerSettlements = await PaymentTransaction.countDocuments({ type: 'SELLER_SETTLEMENT' });
    if (existingSellerSettlements === 0) {
      // Disbursed July & August settlement for GadgetHub
      await PaymentTransaction.create({
        transactionId: 'TXN-SETTLE-GH-2608',
        utrNumber: 'UTR260831094821',
        type: 'SELLER_SETTLEMENT',
        amount: 47985,
        subtotal: 44985,
        platformCommissionCut: 4498,
        gatewayFee: 959,
        totalDeductions: 5457,
        netDisbursedAmount: 39528,
        sender: {
          name: 'NovaKart Treasury Nodal Account',
          role: 'finance',
          accountOrVpa: 'nodal@novakart'
        },
        recipient: {
          name: 'Vikram Mehta',
          role: 'seller',
          storeOrHubName: 'GadgetHub Pro Store',
          bankName: 'HDFC Bank',
          accountNumber: '50100234891244',
          ifscCode: 'HDFC0001234',
          upiId: 'gadgethub@hdfcbank'
        },
        paymentMethod: 'IMPS Direct Bank Disbursal',
        status: 'DISBURSED',
        verificationStatus: 'VERIFIED',
        verificationNotes: 'August 2026 multi-order settlement cleared after 7-day customer return period verification.',
        disbursedAt: new Date('2026-08-31T18:00:00.000Z')
      });

      // Pending September 2026 settlement for GadgetHub
      await PaymentTransaction.create({
        transactionId: 'TXN-SETTLE-GH-2609-PND',
        utrNumber: null,
        type: 'SELLER_SETTLEMENT',
        amount: 21976,
        subtotal: 19595,
        platformCommissionCut: 1959,
        gatewayFee: 439,
        totalDeductions: 2398,
        netDisbursedAmount: 17197,
        sender: {
          name: 'NovaKart Treasury Nodal Account',
          role: 'finance',
          accountOrVpa: 'nodal@novakart'
        },
        recipient: {
          name: 'Vikram Mehta',
          role: 'seller',
          storeOrHubName: 'GadgetHub Pro Store',
          bankName: 'HDFC Bank',
          accountNumber: '50100234891244',
          ifscCode: 'HDFC0001234',
          upiId: 'gadgethub@hdfcbank'
        },
        paymentMethod: 'IMPS Direct Bank Disbursal',
        status: 'PENDING_VERIFICATION',
        verificationStatus: 'PENDING_AUDIT',
        verificationNotes: 'September sales awaiting Treasury sign-off. Orders under return window verification.',
        createdAt: new Date()
      });

      // Pending September 2026 settlement for FreshMart Organics
      await PaymentTransaction.create({
        transactionId: 'TXN-SETTLE-FM-2609-PND',
        utrNumber: null,
        type: 'SELLER_SETTLEMENT',
        amount: 14864,
        subtotal: 13994,
        platformCommissionCut: 1399,
        gatewayFee: 297,
        totalDeductions: 1696,
        netDisbursedAmount: 12298,
        sender: {
          name: 'NovaKart Treasury Nodal Account',
          role: 'finance',
          accountOrVpa: 'nodal@novakart'
        },
        recipient: {
          name: 'Rajesh Sharma',
          role: 'seller',
          storeOrHubName: 'FreshMart Organic Groceries',
          bankName: 'ICICI Bank',
          accountNumber: '001205009874',
          ifscCode: 'ICIC0000012',
          upiId: 'freshmart@icici'
        },
        paymentMethod: 'IMPS Direct Bank Disbursal',
        status: 'PENDING_VERIFICATION',
        verificationStatus: 'PENDING_AUDIT',
        verificationNotes: 'Pending grocery vendor disbursal verification.',
        createdAt: new Date()
      });
    }

    // 4. Ensure Outbound Rider Payouts
    const existingRiderPayouts = await PaymentTransaction.countDocuments({ type: 'RIDER_PAYOUT' });
    if (existingRiderPayouts === 0) {
      // Disbursed rider payout for Gandu Bhargav (August trips)
      await PaymentTransaction.create({
        transactionId: 'TXN-RIDER-GB-2608',
        utrNumber: 'UTR260831782104',
        type: 'RIDER_PAYOUT',
        amount: 250,
        netDisbursedAmount: 250,
        sender: { name: 'NovaKart Logistics Treasury', role: 'finance' },
        recipient: {
          name: 'Gandu Bhargav',
          role: 'delivery',
          storeOrHubName: 'Tenali Delivery Hub',
          bankName: 'State Bank of India',
          accountNumber: '309204918204',
          ifscCode: 'SBIN0004521',
          upiId: 'bhargav@sbi'
        },
        paymentMethod: 'UPI Direct Disbursal',
        status: 'DISBURSED',
        verificationStatus: 'VERIFIED',
        verificationNotes: 'Trip proofs verified. 5 successful delivery dispatches cleared.',
        disbursedAt: new Date('2026-08-31T20:00:00.000Z')
      });

      // Pending rider payout for Gandu Bhargav (September trips)
      await PaymentTransaction.create({
        transactionId: 'TXN-RIDER-GB-2609-PND',
        utrNumber: null,
        type: 'RIDER_PAYOUT',
        amount: 150,
        netDisbursedAmount: 150,
        sender: { name: 'NovaKart Logistics Treasury', role: 'finance' },
        recipient: {
          name: 'Gandu Bhargav',
          role: 'delivery',
          storeOrHubName: 'Tenali Delivery Hub',
          bankName: 'State Bank of India',
          accountNumber: '309204918204',
          ifscCode: 'SBIN0004521',
          upiId: 'bhargav@sbi'
        },
        paymentMethod: 'UPI Direct Disbursal',
        status: 'PENDING_VERIFICATION',
        verificationStatus: 'PENDING_AUDIT',
        verificationNotes: '3 trips completed in September. Awaiting dispatch reconciliation approval.',
        createdAt: new Date()
      });

      // Pending rider payout for Srinivas Varma
      await PaymentTransaction.create({
        transactionId: 'TXN-RIDER-SV-2609-PND',
        utrNumber: null,
        type: 'RIDER_PAYOUT',
        amount: 250,
        netDisbursedAmount: 250,
        sender: { name: 'NovaKart Logistics Treasury', role: 'finance' },
        recipient: {
          name: 'Srinivas Varma',
          role: 'delivery',
          storeOrHubName: 'Vijayawada Central Hub',
          bankName: 'Canara Bank',
          accountNumber: '110029384756',
          ifscCode: 'CNRB0001100',
          upiId: 'varma@canara'
        },
        paymentMethod: 'UPI Direct Disbursal',
        status: 'PENDING_VERIFICATION',
        verificationStatus: 'PENDING_AUDIT',
        verificationNotes: '5 delivery completions pending supervisor review.',
        createdAt: new Date()
      });
    }

    // 5. Ensure Outbound Warehouse Staff & Manager Salaries
    const existingSalaries = await PaymentTransaction.countDocuments({ type: 'WAREHOUSE_SALARY' });
    if (existingSalaries === 0) {
      // Disbursed August salary for Tenali Branch Manager
      await PaymentTransaction.create({
        transactionId: 'TXN-SAL-WH-TEN-2608',
        utrNumber: 'UTR260831998124',
        type: 'WAREHOUSE_SALARY',
        amount: 45000,
        netDisbursedAmount: 45000,
        sender: { name: 'NovaKart Corporate Payroll', role: 'finance' },
        recipient: {
          name: 'Siva Prasad Reddy',
          role: 'warehouse_manager',
          storeOrHubName: 'Tenali Branch Hub (AP)',
          bankName: 'Union Bank of India',
          accountNumber: '012910100084729',
          ifscCode: 'UBIN0801291'
        },
        paymentMethod: 'NEFT Corporate Salary Disbursal',
        status: 'DISBURSED',
        verificationStatus: 'VERIFIED',
        verificationNotes: 'August 2026 monthly manager compensation processed.',
        disbursedAt: new Date('2026-08-31T22:00:00.000Z')
      });

      // Pending September salary for Tenali Branch Manager
      await PaymentTransaction.create({
        transactionId: 'TXN-SAL-WH-TEN-2609-PND',
        utrNumber: null,
        type: 'WAREHOUSE_SALARY',
        amount: 45000,
        netDisbursedAmount: 45000,
        sender: { name: 'NovaKart Corporate Payroll', role: 'finance' },
        recipient: {
          name: 'Siva Prasad Reddy',
          role: 'warehouse_manager',
          storeOrHubName: 'Tenali Branch Hub (AP)',
          bankName: 'Union Bank of India',
          accountNumber: '012910100084729',
          ifscCode: 'UBIN0801291'
        },
        paymentMethod: 'NEFT Corporate Salary Disbursal',
        status: 'PENDING_VERIFICATION',
        verificationStatus: 'PENDING_AUDIT',
        verificationNotes: 'September payroll cycle ready for treasury disbursement.',
        createdAt: new Date()
      });

      // Pending September salary for Vijayawada Central Sorting Hub Manager
      await PaymentTransaction.create({
        transactionId: 'TXN-SAL-WH-VJA-2609-PND',
        utrNumber: null,
        type: 'WAREHOUSE_SALARY',
        amount: 52000,
        netDisbursedAmount: 52000,
        sender: { name: 'NovaKart Corporate Payroll', role: 'finance' },
        recipient: {
          name: 'K. Venkatesh Rao',
          role: 'warehouse_manager',
          storeOrHubName: 'Vijayawada Regional Sorting Hub (AP)',
          bankName: 'State Bank of India',
          accountNumber: '201948372615',
          ifscCode: 'SBIN0001234'
        },
        paymentMethod: 'NEFT Corporate Salary Disbursal',
        status: 'PENDING_VERIFICATION',
        verificationStatus: 'PENDING_AUDIT',
        verificationNotes: 'Regional sorting manager payroll cycle ready.',
        createdAt: new Date()
      });
    }

    console.log('✅ [Seed] Digital Payments & Treasury ledger initialized.');
  } catch (error) {
    console.error('❌ [Seed Payments Error]:', error.message);
  }
};
