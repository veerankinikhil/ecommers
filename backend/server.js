import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { connectDB } from './config/db.js';
import { seedDatabase } from './utils/seedDatabase.js';
import { setSocketIO } from './services/socketService.js';
import { configureSockets } from './sockets/socketHandler.js';
import { notFoundHandler, errorHandler } from './middleware/errorMiddleware.js';

// Route Imports
import authRoutes from './routes/authRoutes.js';
import productRoutes from './routes/productRoutes.js';
import cartRoutes from './routes/cartRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import sellerRoutes from './routes/sellerRoutes.js';
import deliveryRoutes from './routes/deliveryRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import reviewRoutes from './routes/reviewRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import giftCardRoutes from './routes/giftCardRoutes.js';
import warehouseRoutes from './routes/warehouseRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';

import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '.env') });

const app = express();
const server = http.createServer(app);

// Configure Socket.IO
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE']
  }
});

// Set global Socket.IO instance & register event handlers
setSocketIO(io);
configureSockets(io);

// Core Middlewares
app.use(cors({ origin: '*' }));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Health Check Endpoint with Database Connectivity Status
app.get('/api/health', (req, res) => {
  const dbState = mongoose.connection.readyState;
  const dbStateMap = {
    0: 'DISCONNECTED',
    1: 'CONNECTED',
    2: 'CONNECTING',
    3: 'DISCONNECTING'
  };

  res.json({
    success: true,
    status: 'ONLINE',
    system: 'Multi-Vendor MERN E-Commerce Backend Engine',
    database: {
      status: dbStateMap[dbState] || 'UNKNOWN',
      isConnected: dbState === 1,
      name: mongoose.connection.name || 'None',
      host: mongoose.connection.host || 'None'
    },
    timestamp: new Date().toISOString()
  });
});

// API Routes Mounting
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/sellers', sellerRoutes);
app.use('/api/delivery', deliveryRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/gift-cards', giftCardRoutes);
app.use('/api/warehouses', warehouseRoutes);
app.use('/api/payments', paymentRoutes);

// Error Handling Middlewares
app.use(notFoundHandler);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

// Initialize Database, Auto-Seed, and Start Server
const startServer = async () => {
  const isDbConnected = await connectDB();
  
  if (isDbConnected) {
    await seedDatabase();
  } else {
    console.warn('⚠️ [Server]: Database not connected yet. Will attempt to seed when connected.');
    mongoose.connection.once('open', async () => {
      console.log('✅ [MongoDB]: Connection opened. Starting auto-seeding...');
      await seedDatabase();
    });
  }

  server.listen(PORT, () => {
    console.log(`===========================================================`);
    console.log(`🚀 Multi-Vendor Backend API Server running on port ${PORT}`);
    console.log(`📡 Socket.IO Real-Time Engine Active`);
    console.log(`🌐 Portals Supported: Customer, Seller, Delivery Agent, Admin`);
    console.log(`🌐 API Health Check: http://localhost:${PORT}/api/health`);
    console.log(`===========================================================`);
  });
};

startServer();
