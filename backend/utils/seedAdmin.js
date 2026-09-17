import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { User } from '../models/User.js';
import { ROLES } from '../config/constants.js';

dotenv.config();

export const seedInitialAdmin = async () => {
  try {
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@yourstore.com';
    const adminPassword = process.env.ADMIN_PASSWORD || 'AdminSecurePassword2026!';

    const existingAdmin = await User.findOne({ role: ROLES.ADMIN });
    if (existingAdmin) {
      console.log(`[Admin Security]: Master administrator account already present (${existingAdmin.email}).`);
      return;
    }

    const admin = await User.create({
      name: 'System Super Administrator',
      email: adminEmail,
      password: adminPassword,
      role: ROLES.ADMIN,
      phone: '+91 99999 00000',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'
    });

    console.log(`===========================================================`);
    console.log(`[Admin Seed Success]: Master Admin created securely.`);
    console.log(`Email: ${admin.email}`);
    console.log(`Role: ${admin.role}`);
    console.log(`===========================================================`);
  } catch (error) {
    console.error(`[Admin Seed Error]:`, error.message);
  }
};
