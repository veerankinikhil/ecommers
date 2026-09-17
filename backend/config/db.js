import mongoose from 'mongoose';

export const connectDB = async () => {
  const primaryUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/multivendor_ecommerce';
  const uriCandidates = [
    primaryUri,
    'mongodb://127.0.0.1:27017/multivendor_ecommerce',
    'mongodb://localhost:27017/multivendor_ecommerce'
  ];

  // Remove duplicates while preserving priority order
  const uniqueUris = [...new Set(uriCandidates)];

  let isConnected = false;

  for (const uri of uniqueUris) {
    try {
      console.log(`🔌 Attempting MongoDB connection to: ${uri}...`);
      const conn = await mongoose.connect(uri, {
        serverSelectionTimeoutMS: 3500,
        connectTimeoutMS: 5000
      });

      console.log(`===========================================================`);
      console.log(`✅ [MongoDB Connected]: Successfully connected to database!`);
      console.log(`📡 Host:     ${conn.connection.host}`);
      console.log(`📂 Database: ${conn.connection.name}`);
      console.log(`🔗 Endpoint: ${uri}`);
      console.log(`===========================================================`);

      isConnected = true;
      break;
    } catch (error) {
      console.warn(`⚠️ [MongoDB Connection Attempt]: Failed connecting to ${uri}: ${error.message}`);
    }
  }

  if (!isConnected) {
    console.error(`===========================================================`);
    console.error(`❌ [MongoDB Error]: Could not establish a connection to MongoDB.`);
    console.error(`👉 Solution Options:`);
    console.error(`  1. Start local MongoDB service (e.g. 'net start MongoDB' or 'mongod')`);
    console.error(`  2. Or set MONGO_URI in 'backend/.env' with your MongoDB Atlas Cloud URI:`);
    console.error(`     MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/multivendor_ecommerce`);
    console.error(`===========================================================`);
  }

  // Register Connection Lifecycle Handlers
  mongoose.connection.on('disconnected', () => {
    console.warn(`⚠️ [MongoDB Warning]: Connection disconnected. Attempting auto-reconnect...`);
  });

  mongoose.connection.on('reconnected', () => {
    console.log(`🔄 [MongoDB]: Auto-reconnected to database.`);
  });

  return isConnected;
};
