import mongoose from 'mongoose';
import { User } from '../models/User.js';
import dotenv from 'dotenv';

dotenv.config();

async function createKrishnaAdmin() {
  try {
    // Connect to MongoDB
    const uri = process.env.MONGODB_URI;
    if (!uri) {
      console.error('MONGODB_URI not set');
      process.exit(1);
    }
    
    await mongoose.connect(uri, { dbName: uri.split('/').pop() || 'rapidresponse' });
    console.log('Connected to MongoDB');

    // Check if user already exists
    const existingUser = await User.findOne({ email: 'krishna@gmail.com' });
    if (existingUser) {
      console.log('Krishna admin user already exists');
      await mongoose.disconnect();
      return;
    }

    // Create new admin user
    const adminUser = await User.create({
      name: 'Krishna Admin',
      email: 'krishna@gmail.com',
      role: 'admin',
      passwordHash: 'admin123', // This will be hashed by the pre-save middleware
      emailVerified: true,
      isActive: true
    });

    console.log('Krishna admin user created:');
    console.log('Email: krishna@gmail.com');
    console.log('Password: admin123');
    console.log('Role: admin');
    console.log('User ID:', adminUser._id);

  } catch (error) {
    console.error('Error creating Krishna admin:', error);
  } finally {
    await mongoose.disconnect();
  }
}

createKrishnaAdmin();
