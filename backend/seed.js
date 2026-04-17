// seed.js
require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('./config/database');
const User = require('./models/User');

const seedDatabase = async () => {
  try {
    await connectDB();

    // Check if admin already exists
    const adminExists = await User.findOne({ username: 'admin' });

    if (adminExists) {
      console.log('Admin user already exists');
      process.exit(0);
    }

    // Create default admin user
    const admin = new User({
      username: 'admin',
      email: 'admin@shopmgmt.local',
      password: 'admin123', // Default password (will be hashed - min 6 chars)
      role: 'admin',
    });

    await admin.save();

    console.log('Admin user created successfully');
    console.log('Username: admin');
    console.log('Password: admin123');

    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();
