import mongoose from 'mongoose';
import { Warehouse } from '../models/Warehouse.js';
import { User } from '../models/User.js';
import { ROLES } from '../config/constants.js';

export const warehousesData = [
  // --- ANDHRA PRADESH (8 Warehouses) ---
  {
    name: 'Vijayawada Central Mother Hub',
    code: 'WH-AP-VJA01',
    type: 'Mother Warehouse',
    state: 'Andhra Pradesh',
    city: 'Vijayawada',
    address: 'Plot 45, Autonagar Industrial Area, Vijayawada',
    pincode: '520007',
    location: { lat: 16.5062, lng: 80.6480 },
    manager: {
      name: 'Suresh Varma',
      phone: '+91 98480 11223',
      email: 'suresh.varma@novacart.com',
      employeeId: 'MGR-AP-01'
    },
    capacity: 75000,
    currentLoad: 41200,
    contactPhone: '+91 866 2489100',
    status: 'active'
  },
  {
    name: 'Visakhapatnam Port Logistics Hub',
    code: 'WH-AP-VSKP01',
    type: 'Regional Sorting Hub',
    state: 'Andhra Pradesh',
    city: 'Visakhapatnam',
    address: 'Duvvada VSEZ Logistic Park, Visakhapatnam',
    pincode: '530046',
    location: { lat: 17.6868, lng: 83.2185 },
    manager: {
      name: 'Rajesh Raju',
      phone: '+91 98481 22334',
      email: 'rajesh.raju@novacart.com',
      employeeId: 'MGR-AP-02'
    },
    capacity: 50000,
    currentLoad: 28400,
    contactPhone: '+91 891 2578340',
    status: 'active'
  },
  {
    name: 'Guntur Regional Hub',
    code: 'WH-AP-GNT01',
    type: 'Regional Sorting Hub',
    state: 'Andhra Pradesh',
    city: 'Guntur',
    address: 'Nallapadu Industrial Estate, Guntur',
    pincode: '522005',
    location: { lat: 16.3067, lng: 80.4365 },
    manager: {
      name: 'Venkat Rao',
      phone: '+91 98482 33445',
      email: 'venkat.rao@novacart.com',
      employeeId: 'MGR-AP-03'
    },
    capacity: 35000,
    currentLoad: 19800,
    contactPhone: '+91 863 2218400',
    status: 'active'
  },
  {
    name: 'Tenali Delivery Branch',
    code: 'WH-AP-TEN01',
    type: 'Delivery Branch',
    state: 'Andhra Pradesh',
    city: 'Tenali',
    address: 'Station Road, Near Railway Goods Yard, Tenali',
    pincode: '522201',
    location: { lat: 16.2437, lng: 80.6400 },
    manager: {
      name: 'Phani Kumar',
      phone: '+91 98483 44556',
      email: 'phani.kumar@novacart.com',
      employeeId: 'MGR-AP-04'
    },
    capacity: 15000,
    currentLoad: 6400,
    contactPhone: '+91 8644 227180',
    status: 'active'
  },
  {
    name: 'Tirupati Express Branch',
    code: 'WH-AP-TPT01',
    type: 'Delivery Branch',
    state: 'Andhra Pradesh',
    city: 'Tirupati',
    address: 'Renigunta Road Cargo Complex, Tirupati',
    pincode: '517501',
    location: { lat: 13.6288, lng: 79.4192 },
    manager: {
      name: 'Madhusudhan Reddy',
      phone: '+91 98484 55667',
      email: 'madhu.reddy@novacart.com',
      employeeId: 'MGR-AP-05'
    },
    capacity: 20000,
    currentLoad: 8900,
    contactPhone: '+91 877 2284900',
    status: 'active'
  },
  {
    name: 'Rajahmundry Delta Branch',
    code: 'WH-AP-RJY01',
    type: 'Delivery Branch',
    state: 'Andhra Pradesh',
    city: 'Rajahmundry',
    address: 'Morampudi Junction, NH16 Corridor, Rajahmundry',
    pincode: '533107',
    location: { lat: 17.0005, lng: 81.8040 },
    manager: {
      name: 'Satyanarayana Murthy',
      phone: '+91 98485 66778',
      email: 'satya.murthy@novacart.com',
      employeeId: 'MGR-AP-06'
    },
    capacity: 18000,
    currentLoad: 9200,
    contactPhone: '+91 883 2419020',
    status: 'active'
  },
  {
    name: 'Kurnool Rayalaseema Hub',
    code: 'WH-AP-KNL01',
    type: 'Regional Sorting Hub',
    state: 'Andhra Pradesh',
    city: 'Kurnool',
    address: 'Bellary Road Industrial Corridor, Kurnool',
    pincode: '518003',
    location: { lat: 15.8281, lng: 78.0373 },
    manager: {
      name: 'Anil Kumar Naidu',
      phone: '+91 98486 77889',
      email: 'anil.naidu@novacart.com',
      employeeId: 'MGR-AP-07'
    },
    capacity: 25000,
    currentLoad: 11400,
    contactPhone: '+91 8518 259300',
    status: 'active'
  },
  {
    name: 'Nellore Coast Branch',
    code: 'WH-AP-NLR01',
    type: 'Delivery Branch',
    state: 'Andhra Pradesh',
    city: 'Nellore',
    address: 'Muthukur Road Logistics Zone, Nellore',
    pincode: '524003',
    location: { lat: 14.4426, lng: 79.9865 },
    manager: {
      name: 'Krishna Chaitanya',
      phone: '+91 98487 88990',
      email: 'krishna.ch@novacart.com',
      employeeId: 'MGR-AP-08'
    },
    capacity: 16000,
    currentLoad: 7200,
    contactPhone: '+91 861 2341980',
    status: 'active'
  },

  // --- TELANGANA (8 Warehouses) ---
  {
    name: 'Hyderabad Shamshabad Super Mother Hub',
    code: 'WH-TS-HYD01',
    type: 'Mother Warehouse',
    state: 'Telangana',
    city: 'Hyderabad',
    address: 'GMR Aerospace & Logistics Park, Shamshabad, Hyderabad',
    pincode: '500409',
    location: { lat: 17.2403, lng: 78.4294 },
    manager: {
      name: 'Vikramaditya Reddy',
      phone: '+91 98490 12345',
      email: 'vikram.reddy@novacart.com',
      employeeId: 'MGR-TS-01'
    },
    capacity: 120000,
    currentLoad: 78400,
    contactPhone: '+91 40 66782000',
    status: 'active'
  },
  {
    name: 'Hyderabad Medchal Sorting Mega Center',
    code: 'WH-TS-HYD02',
    type: 'Regional Sorting Hub',
    state: 'Telangana',
    city: 'Hyderabad',
    address: 'NH-44 Logistics Corridor, Medchal, Hyderabad',
    pincode: '501401',
    location: { lat: 17.6297, lng: 78.4814 },
    manager: {
      name: 'Srikanth Goud',
      phone: '+91 98491 23456',
      email: 'srikanth.goud@novacart.com',
      employeeId: 'MGR-TS-02'
    },
    capacity: 60000,
    currentLoad: 39500,
    contactPhone: '+91 40 27901500',
    status: 'active'
  },
  {
    name: 'Gachibowli Tech City Delivery Branch',
    code: 'WH-TS-HYD03',
    type: 'Delivery Branch',
    state: 'Telangana',
    city: 'Hyderabad',
    address: 'Financial District, Nanakramguda, Gachibowli, Hyderabad',
    pincode: '500032',
    location: { lat: 17.4401, lng: 78.3489 },
    manager: {
      name: 'Praneeth Varma',
      phone: '+91 98492 34567',
      email: 'praneeth.varma@novacart.com',
      employeeId: 'MGR-TS-03'
    },
    capacity: 25000,
    currentLoad: 16800,
    contactPhone: '+91 40 23114920',
    status: 'active'
  },
  {
    name: 'Secunderabad Hub & Delivery Branch',
    code: 'WH-TS-SEC01',
    type: 'Delivery Branch',
    state: 'Telangana',
    city: 'Secunderabad',
    address: 'Paradise Junction Cargo Terminal, Secunderabad',
    pincode: '500003',
    location: { lat: 17.4399, lng: 78.4983 },
    manager: {
      name: 'Harish Chandra',
      phone: '+91 98493 45678',
      email: 'harish.chandra@novacart.com',
      employeeId: 'MGR-TS-04'
    },
    capacity: 22000,
    currentLoad: 14100,
    contactPhone: '+91 40 27803310',
    status: 'active'
  },
  {
    name: 'Warangal Tri-City Regional Hub',
    code: 'WH-TS-WGL01',
    type: 'Regional Sorting Hub',
    state: 'Telangana',
    city: 'Warangal',
    address: 'Enumamula Grain & Goods Market Yard, Warangal',
    pincode: '506002',
    location: { lat: 17.9689, lng: 79.5941 },
    manager: {
      name: 'Ramesh Rao',
      phone: '+91 98494 56789',
      email: 'ramesh.rao@novacart.com',
      employeeId: 'MGR-TS-05'
    },
    capacity: 35000,
    currentLoad: 17600,
    contactPhone: '+91 870 2441920',
    status: 'active'
  },
  {
    name: 'Karimnagar North Delivery Branch',
    code: 'WH-TS-KRN01',
    type: 'Delivery Branch',
    state: 'Telangana',
    city: 'Karimnagar',
    address: 'Collectorate Road, Mukarampura, Karimnagar',
    pincode: '505001',
    location: { lat: 18.4386, lng: 79.1288 },
    manager: {
      name: 'Santosh Kumar',
      phone: '+91 98495 67890',
      email: 'santosh.kumar@novacart.com',
      employeeId: 'MGR-TS-06'
    },
    capacity: 18000,
    currentLoad: 8100,
    contactPhone: '+91 878 2267100',
    status: 'active'
  },
  {
    name: 'Nizamabad Logistics Branch',
    code: 'WH-TS-NZB01',
    type: 'Delivery Branch',
    state: 'Telangana',
    city: 'Nizamabad',
    address: 'Armoor Road Industrial Area, Nizamabad',
    pincode: '503001',
    location: { lat: 18.6725, lng: 78.0941 },
    manager: {
      name: 'Srinivas Yadav',
      phone: '+91 98496 78901',
      email: 'srinivas.yadav@novacart.com',
      employeeId: 'MGR-TS-07'
    },
    capacity: 15000,
    currentLoad: 6700,
    contactPhone: '+91 8462 238910',
    status: 'active'
  },
  {
    name: 'Khammam Logistics Branch',
    code: 'WH-TS-KMM01',
    type: 'Delivery Branch',
    state: 'Telangana',
    city: 'Khammam',
    address: 'Wyra Road Bypass, Khammam',
    pincode: '507001',
    location: { lat: 17.2473, lng: 80.1514 },
    manager: {
      name: 'Mahesh Babu',
      phone: '+91 98497 89012',
      email: 'mahesh.babu@novacart.com',
      employeeId: 'MGR-TS-08'
    },
    capacity: 16000,
    currentLoad: 7500,
    contactPhone: '+91 8742 225640',
    status: 'active'
  }
];

export const seedWarehouses = async () => {
  try {
    for (const wh of warehousesData) {
      const email = wh.manager.email.toLowerCase().trim();
      let managerUser = await User.findOne({ email });

      if (!managerUser) {
        managerUser = await User.create({
          name: wh.manager.name,
          email,
          password: 'ManagerSecure123!',
          phone: wh.manager.phone,
          role: ROLES.WAREHOUSE_MANAGER
        });
      } else {
        managerUser.role = ROLES.WAREHOUSE_MANAGER;
        managerUser.name = wh.manager.name;
        managerUser.phone = wh.manager.phone;
        await managerUser.save();
      }

      const whDoc = {
        ...wh,
        manager: {
          ...wh.manager,
          userId: managerUser._id
        }
      };

      const savedWh = await Warehouse.findOneAndUpdate(
        { code: wh.code },
        whDoc,
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );

      managerUser.warehouseId = savedWh._id;
      await managerUser.save();
    }
    console.log(`[SEED] Successfully seeded ${warehousesData.length} Warehouses & Manager User Accounts across AP and TS!`);
  } catch (err) {
    console.error('[SEED] Error seeding warehouses:', err);
  }
};
