import mongoose from 'mongoose';

export const connectDB = async (): Promise<void> => {
  const MONGODB_URI = process.env.MONGODB_URI || '';

  if (!MONGODB_URI) {
    console.warn('⚠️  MONGODB_URI is not defined in environment variables');
    console.warn('⚠️  Server will continue running, but database features will not work');
    return;
  }

  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    console.warn('⚠️  Server will continue running, but database features will not work');
    // Don't exit - allow server to run without DB for testing
  }
};
