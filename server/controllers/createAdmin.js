const mongoose = require('mongoose');
const Admin = require('../models/Admin');
require('dotenv').config();

const createAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    const admin = new Admin({
      username: 'admin',
      email: 'admin@crimetrack.com',
      password: 'admin123',
      role: 'superadmin',
    });

    await admin.save();
    console.log('✅ Admin created successfully');
    console.log('Username: admin');
    console.log('Password: admin123');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

createAdmin();
