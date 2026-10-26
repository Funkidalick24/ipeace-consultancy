import mongoose from 'mongoose';
import { storage } from './storage';
import bcrypt from 'bcryptjs';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/legalDocConnect';

export const connectDB = async () => {
  const maxRetries = 5;
  let retries = 0;

  while (retries < maxRetries) {
    try {
      await mongoose.connect(MONGODB_URI, {
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 15000, // Increased from 5000 for production
        socketTimeoutMS: 45000,
        connectTimeoutMS: 15000, // Added connection timeout
      });
      console.log('MongoDB connected successfully with optimized connection pooling');
      
      // Seed admin user in development
      if (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test') {
        await seedAdminUser();
      }
      break; // Success, exit retry loop
    } catch (error) {
      retries++;
      console.error(`MongoDB connection error (attempt ${retries}/${maxRetries}):`, error);
      
      if (retries === maxRetries) {
        console.error('Failed to connect to MongoDB after maximum retries');
        process.exit(1);
      }
      
      // Wait before retrying (exponential backoff)
      const waitTime = Math.min(1000 * Math.pow(2, retries), 10000);
      console.log(`Retrying in ${waitTime}ms...`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
  }
};

const seedAdminUser = async () => {
  try {
    const existingAdmin = await storage.getUserByUsername('admin');
    if (!existingAdmin) {
      const hashedPassword = await bcrypt.hash('admin', 12);
      await storage.createUser({
        username: 'admin',
        password: hashedPassword,
        email: 'admin@ipeace.co.zw',
        firstName: 'Admin',
        lastName: 'User',
        role: 'admin'
      });
      console.log('✅ Admin user seeded (username: admin, password: admin)');
    }
  } catch (error) {
    console.error('Error seeding admin user:', error);
  }
};

// Handle connection events
mongoose.connection.on('disconnected', () => {
  console.log('MongoDB disconnected');
});

mongoose.connection.on('error', (error) => {
  console.error('MongoDB connection error:', error);
});

export default mongoose;