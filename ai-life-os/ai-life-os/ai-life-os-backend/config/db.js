const mongoose = require('mongoose');

const connectDB = async () => {
  const primaryUri = process.env.MONGO_URI;
  const localUri = 'mongodb://127.0.0.1:27017/ai-life-os';

  try {
    const conn = await mongoose.connect(primaryUri, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log(`✅ Primary MongoDB connected: ${conn.connection.host}`);
    return;
  } catch (err) {
    console.warn(`⚠️ Primary MongoDB connection failed (${err.message}). Trying local fallback...`);
  }

  try {
    const conn = await mongoose.connect(localUri, {
      serverSelectionTimeoutMS: 3000,
    });
    console.log(`✅ Local MongoDB connected: ${conn.connection.host}`);
  } catch (err) {
    console.warn(`⚠️ Local MongoDB unreachable. Operating in memory fallback mode (AI & stateless API routes remain active).`);
    console.warn(`👉 To connect a database, set a valid MONGO_URI in .env or run local MongoDB.`);
  }
};

module.exports = connectDB;
