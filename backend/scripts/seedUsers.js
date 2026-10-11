import dotenv from 'dotenv';
import mongoose from 'mongoose';
import User from '../src/models/User.js';
dotenv.config();

const users = [
  { name: 'Demo Director', email: 'director@example.com', password: 'Director@123', role: 'DIRECTOR', department: 'Administration' },
  { name: 'Demo Accounts', email: 'accounts@example.com', password: 'Accounts@123', role: 'ACCOUNTS', department: 'Accounts' },
  { name: 'Demo Employee', email: 'employee@example.com', password: 'Employee@123', role: 'EMPLOYEE', employeeId: 'EMP001', department: 'Technology' }
];
try {
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/expense_voucher_db');
  for (const item of users) {
    const exists = await User.findOne({ email: item.email });
    if (!exists) await User.create(item);
    console.log(`${item.email}: ${exists ? 'already exists' : 'created'}`);
  }
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
} finally {
  await mongoose.disconnect();
}
