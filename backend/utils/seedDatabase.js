import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { User } from '../models/User.js';
import { Seller } from '../models/Seller.js';
import { DeliveryAgent } from '../models/DeliveryAgent.js';
import { Category } from '../models/Category.js';
import { Product } from '../models/Product.js';
import { seedWarehouses } from './seedWarehouses.js';
import { seedPayments } from './seedPayments.js';
import { ROLES, ACCOUNT_STATUSES } from '../config/constants.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '..', '.env') });

export const seedDatabase = async () => {
  try {
    console.log('🔄 Checking database seed state...');

    // 1. Seed Super Administrator
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@yourstore.com';
    const adminPassword = process.env.ADMIN_PASSWORD || 'AdminSecurePassword2026!';

    let admin = await User.findOne({ email: adminEmail });
    if (!admin) {
      admin = await User.create({
        name: 'System Super Administrator',
        email: adminEmail,
        password: adminPassword,
        role: ROLES.ADMIN,
        phone: '+91 98765 43210',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'
      });
      console.log(`✅ [Seed] Super Admin created: ${admin.email}`);
    }

    // 2. Seed Verified Seller
    const sellerEmail = 'seller@gadgethub.com';
    let sellerUser = await User.findOne({ email: sellerEmail });
    if (!sellerUser) {
      sellerUser = await User.create({
        name: 'Vikram Mehta',
        email: sellerEmail,
        password: 'SellerSecure123!',
        role: ROLES.SELLER,
        phone: '+91 98112 34567',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80'
      });
      console.log(`✅ [Seed] Seller User created: ${sellerUser.email}`);
    }

    let sellerProfile = await Seller.findOne({ userId: sellerUser._id });
    if (!sellerProfile) {
      sellerProfile = await Seller.create({
        userId: sellerUser._id,
        storeName: 'GadgetHub Pro Store',
        ownerName: sellerUser.name,
        email: sellerEmail,
        phone: '+91 98112 34567',
        businessAddress: 'Plot 42, Cyber Hub, Phase 2, Gurugram, Haryana',
        location: {
          lat: 28.4595,
          lng: 77.0266,
          city: 'Gurugram',
          state: 'Haryana',
          postalCode: '122002'
        },
        businessRegistrationNumber: 'GSTIN07AAACG1234F1Z5',
        taxId: 'PANAAACG1234F',
        status: ACCOUNT_STATUSES.APPROVED,
        isApproved: true,
        logo: 'https://images.unsplash.com/photo-1472851294608-062f824d29cc?auto=format&fit=crop&w=200&q=80',
        banner: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1200&q=80'
      });
      console.log(`✅ [Seed] Verified Seller Store created: ${sellerProfile.storeName}`);
    }

    // 3. Seed Pending Seller (for testing Admin KYC Approval flow)
    const pendingSellerEmail = 'seller2@freshmart.com';
    let pendingUser = await User.findOne({ email: pendingSellerEmail });
    if (!pendingUser) {
      pendingUser = await User.create({
        name: 'Priya Sharma',
        email: pendingSellerEmail,
        password: 'SellerSecure123!',
        role: ROLES.SELLER,
        phone: '+91 98223 45678',
        avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80'
      });

      await Seller.create({
        userId: pendingUser._id,
        storeName: 'FreshMart Organic Groceries',
        ownerName: pendingUser.name,
        email: pendingSellerEmail,
        phone: '+91 98223 45678',
        businessAddress: 'Shop 12, Market Square, Sector 15, Noida',
        location: {
          lat: 28.5355,
          lng: 77.3910,
          city: 'Noida',
          state: 'Uttar Pradesh',
          postalCode: '201301'
        },
        status: ACCOUNT_STATUSES.PENDING,
        isApproved: false
      });
      console.log(`✅ [Seed] Pending KYC Seller Store created: FreshMart Organic Groceries`);
    }



    // 6. Seed Categories
    const categoriesData = [
      {
        name: 'Electronics & Gadgets',
        slug: 'electronics',
        icon: 'fa-laptop',
        image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80',
        description: 'Laptops, Headphones, Smartwatches, and High-Tech Gear'
      },
      {
        name: 'Fashion & Apparel',
        slug: 'fashion',
        icon: 'fa-shirt',
        image: 'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?auto=format&fit=crop&w=600&q=80',
        description: 'Trending Men & Women Apparel, Shoes, and Accessories'
      },
      {
        name: 'Groceries & Gourmet',
        slug: 'groceries',
        icon: 'fa-basket-shopping',
        image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=600&q=80',
        description: 'Fresh Produce, Organic Staples, Coffee, and Daily Essentials'
      },
      {
        name: 'Home & Living',
        slug: 'home-living',
        icon: 'fa-couch',
        image: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=600&q=80',
        description: 'Modern Decor, Kitchenware, Bedding, and Smart Home'
      },
      {
        name: 'Beauty & Personal Care',
        slug: 'beauty',
        icon: 'fa-sparkles',
        image: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=600&q=80',
        description: 'Skincare, Makeup, Fragrances, and Wellness Essentials'
      },
      {
        name: 'Sports & Fitness',
        slug: 'sports',
        icon: 'fa-dumbbell',
        image: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=600&q=80',
        description: 'Gym Equipment, Activewear, Yoga Gear, and Nutrition'
      }
    ];

    for (const cat of categoriesData) {
      const exists = await Category.findOne({ slug: cat.slug });
      if (!exists) {
        await Category.create(cat);
      }
    }
    console.log(`✅ [Seed] Categories verified and ready.`);

    // 7. Seed Initial Products
    const productCount = await Product.countDocuments();
    if (productCount === 0 && sellerProfile) {
      const sampleProducts = [
        {
          sellerId: sellerProfile._id,
          name: 'Nova Pro ANC Wireless Headphones',
          description: 'Next-generation active noise-cancelling wireless over-ear headphones with 40-hour battery life, high-res audio drivers, transparency mode, and ultra-soft memory foam earcups.',
          category: 'Electronics & Gadgets',
          brand: 'SonicNova',
          price: 4999,
          oldPrice: 8999,
          discount: '44% OFF',
          stock: 45,
          images: [
            'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80',
            'https://images.unsplash.com/photo-1583394838336-acd977736f90?auto=format&fit=crop&w=800&q=80'
          ],
          weight: '350g',
          status: 'active',
          ratingsAverage: 4.9,
          ratingsCount: 84,
          location: sellerProfile.location
        },
        {
          sellerId: sellerProfile._id,
          name: 'AeroFit Smart AMOLED Fitness Watch',
          description: 'Precision GPS smartwatch with 1.43-inch Always-On AMOLED display, 24/7 SpO2 & Heart-rate monitoring, 110+ sports modes, and 5ATM water resistance.',
          category: 'Electronics & Gadgets',
          brand: 'AeroTech',
          price: 2999,
          oldPrice: 5999,
          discount: '50% OFF',
          stock: 60,
          images: [
            'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80',
            'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?auto=format&fit=crop&w=800&q=80'
          ],
          weight: '48g',
          status: 'active',
          ratingsAverage: 4.8,
          ratingsCount: 112,
          location: sellerProfile.location
        },
        {
          sellerId: sellerProfile._id,
          name: 'Vortex RGB Mechanical Gaming Keyboard',
          description: 'Hot-swappable tactile mechanical switches, per-key RGB backlighting, sound-dampening silicone foam, and braided USB-C detachable cable.',
          category: 'Electronics & Gadgets',
          brand: 'Vortex Gaming',
          price: 3499,
          oldPrice: 6499,
          discount: '46% OFF',
          stock: 30,
          images: [
            'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=800&q=80',
            'https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?auto=format&fit=crop&w=800&q=80'
          ],
          weight: '900g',
          status: 'active',
          ratingsAverage: 4.7,
          ratingsCount: 65,
          location: sellerProfile.location
        },
        {
          sellerId: sellerProfile._id,
          name: 'Classic Indigo Denim Jacket',
          description: 'Authentic 100% heavy-duty denim jacket with custom brass hardware, dual chest flap pockets, and tailored modern fit for all seasons.',
          category: 'Fashion & Apparel',
          brand: 'UrbanCraft',
          price: 1799,
          oldPrice: 3499,
          discount: '48% OFF',
          stock: 40,
          images: [
            'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?auto=format&fit=crop&w=800&q=80',
            'https://images.unsplash.com/photo-1495105787522-5334e3ffa0ef?auto=format&fit=crop&w=800&q=80'
          ],
          weight: '750g',
          status: 'active',
          ratingsAverage: 4.8,
          ratingsCount: 42,
          location: sellerProfile.location
        },
        {
          sellerId: sellerProfile._id,
          name: 'Bohemian Floral Summer Maxi Dress',
          description: 'Lightweight breathable rayon fabric with vibrant floral botanical prints, empire waist, and flowy silhouette perfect for brunch and vacations.',
          category: 'Fashion & Apparel',
          brand: 'Aura Label',
          price: 1299,
          oldPrice: 2499,
          discount: '48% OFF',
          stock: 25,
          images: [
            'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&w=800&q=80',
            'https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=800&q=80'
          ],
          weight: '300g',
          status: 'active',
          ratingsAverage: 4.9,
          ratingsCount: 56,
          location: sellerProfile.location
        },
        {
          sellerId: sellerProfile._id,
          name: 'Thermal Smart Stainless Steel Flask (750ml)',
          description: 'Double-walled vacuum insulated bottle with built-in LED touch temperature display lid. Keeps beverages cold for 24h and hot for 12h.',
          category: 'Home & Living',
          brand: 'HydroSmart',
          price: 799,
          oldPrice: 1499,
          discount: '46% OFF',
          stock: 80,
          images: [
            'https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=800&q=80'
          ],
          weight: '400g',
          status: 'active',
          ratingsAverage: 4.7,
          ratingsCount: 94,
          location: sellerProfile.location
        },
        {
          sellerId: sellerProfile._id,
          name: 'Artisan Single-Origin Arabica Coffee Beans (500g)',
          description: 'Dark roasted single-origin Arabica beans sourced directly from Chikmagalur hills. Notes of dark chocolate, hazelnut, and caramel.',
          category: 'Groceries & Gourmet',
          brand: 'RoastMasters',
          price: 549,
          oldPrice: 899,
          discount: '38% OFF',
          stock: 100,
          images: [
            'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?auto=format&fit=crop&w=800&q=80'
          ],
          weight: '500g',
          status: 'active',
          ratingsAverage: 4.9,
          ratingsCount: 130,
          location: sellerProfile.location
        },
        {
          sellerId: sellerProfile._id,
          name: 'Eco-Friendly TPE Alignment Yoga Mat',
          description: 'Non-slip dual-texture exercise mat with laser-engraved posture alignment guide lines. Extra thick 6mm cushioning for joint protection.',
          category: 'Sports & Fitness',
          brand: 'ZenCore',
          price: 999,
          oldPrice: 1999,
          discount: '50% OFF',
          stock: 50,
          images: [
            'https://images.unsplash.com/photo-1592432678016-e910b452f9a2?auto=format&fit=crop&w=800&q=80'
          ],
          weight: '1kg',
          status: 'active',
          ratingsAverage: 4.8,
          ratingsCount: 78,
          location: sellerProfile.location
        },
        {
          sellerId: sellerProfile._id,
          name: 'Velvet Matte Liquid Lip Tint Duo',
          description: 'Long-wearing waterproof liquid lipstick enriched with vitamin E and jojoba oil. Non-drying, smudge-proof, velvet smooth finish.',
          category: 'Beauty & Personal Care',
          brand: 'LuxeGlow',
          price: 649,
          oldPrice: 1199,
          discount: '45% OFF',
          stock: 75,
          images: [
            'https://images.unsplash.com/photo-1586495777744-4413f21062fa?auto=format&fit=crop&w=800&q=80'
          ],
          weight: '100g',
          status: 'active',
          ratingsAverage: 4.6,
          ratingsCount: 45,
          location: sellerProfile.location
        }
      ];

      const insertedProducts = await Product.insertMany(sampleProducts);
      console.log(`✅ [Seed] Successfully seeded ${insertedProducts.length} starter products.`);
    }

    // Seed Warehouses across AP & TS
    await seedWarehouses();

    // Seed Digital Payments & Treasury
    await seedPayments();

    console.log('===========================================================');
    console.log('🎉 Core Database initialized with registered infrastructure:');
    console.log(`🔑 Admin:    ${adminEmail}`);
    console.log('===========================================================');

  } catch (error) {
    console.error('❌ [Database Seed Error]:', error.message);
  }
};
