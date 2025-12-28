import mongoose from 'mongoose';
import { User } from '../models/User.js';
import dotenv from 'dotenv';

dotenv.config();

async function createInitialAdmin() {
  try {
    // Connect to MongoDB
    const uri = process.env.MONGODB_URI;
    if (!uri) {
      console.error('MONGODB_URI not set');
      process.exit(1);
    }
    
    await mongoose.connect(uri, { dbName: uri.split('/').pop() || 'rapidresponse' });
    console.log('Connected to MongoDB');

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: 'admin@rapidresponse.com' });
    if (existingAdmin) {
      console.log('Admin user already exists');
      await mongoose.disconnect();
      return;
    }

    // Create initial admin user
    const adminUser = await User.create({
      name: 'System Administrator',
      email: 'admin@rapidresponse.com',
      role: 'admin',
      passwordHash: 'Admin123!', // This will be hashed by the pre-save middleware
      emailVerified: true,
      isActive: true
    });

    console.log('Initial admin user created:');
    console.log('Email: admin@rapidresponse.com');
    console.log('Password: Admin123!');
    console.log('Role: admin');
    console.log('User ID:', adminUser._id);

  } catch (error) {
    console.error('Error creating initial admin:', error);
  } finally {
    await mongoose.disconnect();
  }
}

createInitialAdmin();
