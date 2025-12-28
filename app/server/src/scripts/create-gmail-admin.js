import mongoose from 'mongoose';
import { User } from '../models/User.js';
import dotenv from 'dotenv';

dotenv.config();

async function createGmailAdmin() {
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
    const existingAdmin = await User.findOne({ email: 'admin@gmail.com' });
    if (existingAdmin) {
      console.log('Gmail admin user already exists');
      await mongoose.disconnect();
      return;
    }

    // Create new admin user with Gmail address
    const adminUser = await User.create({
      name: 'System Administrator',
      email: 'admin@gmail.com',
      role: 'admin',
      passwordHash: 'Admin123!', // This will be hashed by the pre-save middleware
      emailVerified: true,
      isActive: true
    });

    console.log('New Gmail admin user created:');
    console.log('Email: admin@gmail.com');
    console.log('Password: Admin123!');
    console.log('Role: admin');
    console.log('User ID:', adminUser._id);

  } catch (error) {
    console.error('Error creating Gmail admin:', error);
  } finally {
    await mongoose.disconnect();
  }
}

createGmailAdmin();
