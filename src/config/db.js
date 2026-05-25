import mongoose from 'mongoose';
import env from './env.js';
import logger from './logger.js';

const connectDB = async () => {
  try {
    const connString = env.MONGO_URI || process.env.MONGODB_URI;
    
    logger.info("🔄 Connecting to MongoDB using standard port bypass string...");

    const conn = await mongoose.connect(connString, {
      serverSelectionTimeoutMS: 10000, // 10 seconds timeout
    });

    return conn;
  } catch (error) {
    logger.error("❌ MongoDB Connection Error:", {
      message: error.message,
      code: error.code
    });
    process.exit(1);
  }
};

export default connectDB;