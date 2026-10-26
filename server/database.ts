import mongoose from 'mongoose';
import { storage } from './storage';
import bcrypt from 'bcryptjs';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/legalDocConnect';

export const connectDB = async () => {
  try {
    await mongoose.connect(MONGODB_URI, {
      maxPoolSize: 10, // Increase from default for better performance
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    console.log('MongoDB connected successfully with optimized connection pooling');
    
    // Seed admin user in development
    if (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test') {
      await seedAdminUser();
    }
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
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