import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootPath = path.join(__dirname, '..');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/multivendor_ecommerce';

async function runInspection() {
  console.log('📡 Starting MongoDB Database Inspection...');
  let conn;
  try {
    conn = await mongoose.connect(MONGO_URI);
    const db = conn.connection.db;
    
    const collections = await db.listCollections().toArray();
    let report = `========================================================\n`;
    report += `🟢 [MONGODB INSPECTION REPORT]\n`;
    report += `========================================================\n`;
    report += `📂 Database Name: ${conn.connection.name}\n`;
    report += `🔗 Connection Host: ${conn.connection.host}\n`;
    report += `📚 Total Collections found: ${collections.length}\n\n`;

    for (const col of collections) {
      const count = await db.collection(col.name).countDocuments();
      report += `  - Collection: [${col.name}] (${count} documents)\n`;
      if (count > 0) {
        const samples = await db.collection(col.name).find().limit(2).toArray();
        report += `    Sample Documents:\n`;
        samples.forEach((doc, idx) => {
          report += `      [${idx + 1}] ${JSON.stringify(doc, null, 2).split('\n').join('\n      ')}\n`;
        });
      }
      report += `\n`;
    }
    report += `========================================================\n`;
    
    fs.writeFileSync(path.join(rootPath, 'mongo-status.txt'), report);
    console.log('✅ MongoDB Database Inspection complete. Written to mongo-status.txt.');
  } catch (err) {
    fs.writeFileSync(
      path.join(rootPath, 'mongo-status.txt'),
      `❌ MongoDB Connection Failed:\n${err.message}\n${err.stack}\n\nMake sure your MongoDB server is running locally (e.g. 'net start MongoDB' or running in MongoDB Compass).`
    );
    console.error('❌ MongoDB Inspection failed:', err.message);
  } finally {
    if (conn) {
      await mongoose.disconnect();
    }
  }
}

runInspection();
