import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { SocketProvider } from './context/SocketContext';
import { DeviceModeProvider } from './context/DeviceModeContext';
import DeviceSwitcherBar from './components/DeviceSwitcherBar';
import CustomerDeviceFrame from './components/CustomerDeviceFrame';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

// Pages
import HomePage from './pages/HomePage';
import ProductsPage from './pages/ProductsPage';
import ProductDetailsPage from './pages/ProductDetailsPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import MockPaymentPage from './pages/MockPaymentPage';
import OrderHistoryPage from './pages/OrderHistoryPage';
import OrderTrackingPage from './pages/OrderTrackingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProfilePage from './pages/ProfilePage';

import './styles/customer.css';

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <SocketProvider>
          <DeviceModeProvider>
            <Router>
              {/* Floating Multi-Device Switcher (Web, Tab, Phone) */}
              <DeviceSwitcherBar />

              {/* Dynamic Viewport Chassis Frame */}
              <CustomerDeviceFrame>
                <Navbar />
                <Routes>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/products" element={<ProductsPage />} />
                  <Route path="/products/:id" element={<ProductDetailsPage />} />
                  <Route path="/cart" element={<CartPage />} />
                  <Route path="/checkout" element={<CheckoutPage />} />
                  <Route path="/checkout/payment" element={<MockPaymentPage />} />
                  <Route path="/orders" element={<OrderHistoryPage />} />
                  <Route path="/orders/:id/track" element={<OrderTrackingPage />} />
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/register" element={<RegisterPage />} />
                  <Route path="/profile" element={<ProfilePage />} />
                  <Route path="/user" element={<ProfilePage />} />
                  <Route path="/users" element={<ProfilePage />} />
                  <Route path="/account" element={<ProfilePage />} />
                </Routes>
                <Footer />
              </CustomerDeviceFrame>
            </Router>
          </DeviceModeProvider>
        </SocketProvider>
      </CartProvider>
    </AuthProvider>
  );
}
