# 🛒 NovaKart — Multi-Vendor MERN E-Commerce Platform

A production-grade, multi-vendor e-commerce platform built on the **MERN Stack** (MongoDB, Express.js, React.js, Node.js) featuring **FOUR completely separate frontend portals** and **ONE unified backend**.

---

## 🌐 Four Separate Frontend Portals

| Portal | Role & Purpose | Port / URL | Directory |
| :--- | :--- | :--- | :--- |
| **Customer Website** | Full e-commerce, search, category filters, cart, checkout, Indian Rupees (`₹`), 8-stage live order tracking. | `http://localhost:3000` | `customer-frontend/` |
| **Seller Website** | Merchant onboarding, store inventory CRUD (**auto-syncs to customer storefront**), accept/reject orders (triggers nearby dispatch). | `http://localhost:3001` | `seller-frontend/` |
| **Delivery Agent Website** | Vehicle/license info, online/offline duty toggle, **Proximity Radar (Haversine 15km)**, accept/reject, mark status, earnings. | `http://localhost:3002` | `delivery-frontend/` |
| **Admin Website** | Super admin control center, platform metrics, seller KYC approve/reject/block, delivery fleet KYC, product moderation. | `http://localhost:3003` | `admin-frontend/` |
| **Unified Backend** | REST API, MongoDB connection, JWT auth, Role middleware, Haversine nearby dispatcher, Socket.IO real-time engine. | `http://localhost:5000` | `backend/` |

---

## ⚡ How to Start the Platform

### 🚀 One-Click Launch (Recommended)
Simply **double-click [start.bat](file:///c:/Users/USER/Desktop/smartcart/start.bat)** in the root folder.
It will:
1. Automatically install any missing `node_modules` in each folder.
2. Open 5 dedicated command prompt windows for each service.
3. Automatically connect to MongoDB and seed demo accounts, categories, and products.
4. Open the Customer Storefront (`http://localhost:3000`) in your browser.

---

## 🔑 Pre-Seeded Operational Accounts

When the backend connects to MongoDB, it automatically seeds these ready-to-use accounts:

| Portal / Role | Email | Password |
| :--- | :--- | :--- |
| 🛡️ **Super Admin** | `admin@yourstore.com` | `AdminSecurePassword2026!` |
| 🏪 **Verified Seller** | `seller@gadgethub.com` | `SellerSecure123!` |
| 🏪 **Pending KYC Seller** | `seller2@freshmart.com` | `SellerSecure123!` |
| 🛵 **Delivery Agent** | `driver@speedy.com` | `DriverSecure123!` |
| 🛒 **Customer** | `customer@novakart.com` | `CustomerSecure123!` |
