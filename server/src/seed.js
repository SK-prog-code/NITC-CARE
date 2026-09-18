const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');

dotenv.config();

const User = require('./models/User');
const Department = require('./models/Department');
const Category = require('./models/Category');
const Complaint = require('./models/Complaint');
const connectDB = require('./config/db');

const seedDatabase = async () => {
  try {
    if (mongoose.connection.readyState !== 1) {
      await connectDB();
    }

    console.log('🗑️  Clearing existing database collections...');
    await Complaint.deleteMany({});
    await Category.deleteMany({});
    await Department.deleteMany({});
    await User.deleteMany({});

    console.log('🏢 Seeding NIT Calicut Hostel Departments & Maintenance Cells...');
    const departments = await Department.create([
      {
        name: 'Hostel Electrical Maintenance Wing',
        description: 'Handles hostel room electricals, geysers, ceiling fans, tube lights, switchboards, MCB distribution boards, and corridor lighting.',
        contactEmail: 'electrical.hostel@nitc.ac.in',
        contactPhone: '+91-495-228-6801',
      },
      {
        name: 'Hostel Plumbing & Water Supply Cell',
        description: 'Responsible for hostel washrooms, taps, showers, flush tanks, overhead water tanks, pipeline leakage, drainage, and water purification units.',
        contactEmail: 'plumbing.hostel@nitc.ac.in',
        contactPhone: '+91-495-228-6802',
      },
      {
        name: 'Hostel Carpentry & Furniture Division',
        description: 'Manages student room cots, study tables, chairs, door locks, almirah cupboard latches, window panes, and balcony doors.',
        contactEmail: 'carpentry.hostel@nitc.ac.in',
        contactPhone: '+91-495-228-6803',
      },
      {
        name: 'Campus Network Centre (CNC - Hostel Wi-Fi & LAN)',
        description: 'Oversees high-speed hostel Wi-Fi access points, in-room gigabit LAN ports, floor switches, optical fiber backbones, and portal connectivity.',
        contactEmail: 'cnc.hostel@nitc.ac.in',
        contactPhone: '+91-495-228-6804',
      },
      {
        name: 'Hostel Mess & Catering Management Committee',
        description: 'Monitors food hygiene, dining hall cleanliness, meal quality, water dispensers, mess worker hygiene, and catering schedules across all messes.',
        contactEmail: 'mess.committee@nitc.ac.in',
        contactPhone: '+91-495-228-6805',
      },
      {
        name: 'Hostel Housekeeping & Sanitation Division',
        description: 'Daily cleaning of hostel corridors, washroom disinfection, waste disposal, dustbins, and campus common area sanitation.',
        contactEmail: 'sanitation.hostel@nitc.ac.in',
        contactPhone: '+91-495-228-6806',
      },
      {
        name: 'Chief Warden Office & Hostel Administration (CWO)',
        description: 'Apex administrative body overseeing all 15+ NITC hostels, room allocations, discipline, security, and student grievance appeals.',
        contactEmail: 'chiefwarden@nitc.ac.in',
        contactPhone: '+91-495-228-6800',
      },
    ]);

    const deptMap = {};
    departments.forEach((d) => {
      deptMap[d.name] = d._id;
    });

    console.log('🏷️  Seeding NITC Grievance Categories...');
    const categories = await Category.create([
      {
        name: 'Hostel Electrical & Geysers',
        description: 'Faulty room lights, fan regulators, geyser tripping MCB, power socket sparks, corridor lighting.',
        defaultDepartmentId: deptMap['Hostel Electrical Maintenance Wing'],
        icon: 'Zap',
      },
      {
        name: 'Plumbing, Taps & Washrooms',
        description: 'Leaking taps, clogged washbasins, flush tank failure, toilet drainage overflow, shower head broken.',
        defaultDepartmentId: deptMap['Hostel Plumbing & Water Supply Cell'],
        icon: 'Droplet',
      },
      {
        name: 'Room Carpentry, Cots & Locks',
        description: 'Damaged study table, broken cot ply, cupboard key/lock stuck, door hinge loose, window latch broken.',
        defaultDepartmentId: deptMap['Hostel Carpentry & Furniture Division'],
        icon: 'Wrench',
      },
      {
        name: 'Hostel Wi-Fi & Room LAN Ports',
        description: 'Corridor access point offline, dead room LAN RJ45 port, high packet loss, slow internet speed.',
        defaultDepartmentId: deptMap['Campus Network Centre (CNC - Hostel Wi-Fi & LAN)'],
        icon: 'Wifi',
      },
      {
        name: 'Mess Food Quality & Dining',
        description: 'Meal quality concerns, cold food, unhygienic cutlery, drinking water cooler cooling failure in mess.',
        defaultDepartmentId: deptMap['Hostel Mess & Catering Management Committee'],
        icon: 'Utensils',
      },
      {
        name: 'Housekeeping & Cleanliness',
        description: 'Uncleaned floor washrooms, overflowing corridor trash bins, water stagnation in balcony/porch.',
        defaultDepartmentId: deptMap['Hostel Housekeeping & Sanitation Division'],
        icon: 'Sparkles',
      },
      {
        name: 'Hostel Civil Works & Seepage',
        description: 'Roof leakage during monsoon, wall paint peeling, cracked floor tiles, balcony railing damage.',
        defaultDepartmentId: deptMap['Hostel Carpentry & Furniture Division'],
        icon: 'Building2',
      },
      {
        name: 'Pest Control & Safety Hazard',
        description: 'Mosquito breeding, beehive near windows, stray animals inside hostel blocks, emergency lighting.',
        defaultDepartmentId: deptMap['Hostel Housekeeping & Sanitation Division'],
        icon: 'ShieldAlert',
      },
      {
        name: 'Other Hostel Issues',
        description: 'General hostel administrative requests, noise complaints, laundry area issues, guest room queries.',
        defaultDepartmentId: deptMap['Chief Warden Office & Hostel Administration (CWO)'],
        icon: 'HelpCircle',
      },
    ]);

    const catMap = {};
    categories.forEach((c) => {
      catMap[c.name] = c._id;
    });

    console.log('👤 Seeding NITC Users (Chief Warden, Caretakers, Students)...');
    const adminPassword = await bcrypt.hash('Admin@123', 10);
    const staffPassword = await bcrypt.hash('Staff@123', 10);
    const studentPassword = await bcrypt.hash('Student@123', 10);

    const chiefWarden = await User.create({
      name: 'Prof. K. A. Abdul Nazeer (Chief Warden)',
      email: 'chiefwarden@nitc.ac.in',
      passwordHash: adminPassword,
      role: 'admin',
      phone: '+91-495-228-6800',
    });

    const caretakerMH = await User.create({
      name: 'P. Vijayan (Caretaker - Mega Hostel)',
      email: 'caretaker.mh@nitc.ac.in',
      passwordHash: staffPassword,
      role: 'staff',
      departmentId: deptMap['Hostel Electrical Maintenance Wing'],
      hostelBlock: 'Mega Hostel Block 1',
      phone: '+91-495-228-6810',
    });

    const caretakerLH = await User.create({
      name: 'K. S. Latha (Caretaker - Ladies Hostel)',
      email: 'caretaker.lh@nitc.ac.in',
      passwordHash: staffPassword,
      role: 'staff',
      departmentId: deptMap['Hostel Plumbing & Water Supply Cell'],
      hostelBlock: 'Mega Ladies Hostel (MLH)',
      phone: '+91-495-228-6812',
    });

    const student1 = await User.create({
      name: 'S Keerthan Kumar',
      email: 'keerthan_b241139ch@nitc.ac.in',
      passwordHash: studentPassword,
      role: 'student',
      rollNumber: 'B241139CH',
      hostelBlock: 'Mega Hostel Block 1',
      roomNumber: 'MH1-304',
      messName: 'Mega Mess (South Non-Veg)',
      phone: '+91-98765-43210',
    });

    const student2 = await User.create({
      name: 'Anjali Menon',
      email: 'anjali_b220123ee@nitc.ac.in',
      passwordHash: studentPassword,
      role: 'student',
      rollNumber: 'B220123EE',
      hostelBlock: 'Mega Ladies Hostel (MLH)',
      roomNumber: 'MLH-215',
      messName: 'LH Mess (Veg Special)',
      phone: '+91-98765-43211',
    });

    const student3 = await User.create({
      name: 'Karthik Nair',
      email: 'karthik_m230011me@nitc.ac.in',
      passwordHash: studentPassword,
      role: 'student',
      rollNumber: 'M230011ME',
      hostelBlock: 'PG Hostel 1',
      roomNumber: 'PG1-108',
      messName: 'Mess A (North & South)',
      phone: '+91-98765-43212',
    });

    console.log('📋 Seeding Realistic NITC Hostel Complaints across Blocks...');

    // Complaint 1: In Progress in Mega Hostel
    const cmp1 = new Complaint({
      complaintCode: 'NITC-2026-000101',
      studentId: student1._id,
      title: 'Geyser in 3rd Floor East Wing Bathroom Tripping MCB',
      description: 'The instant water heater in Bathroom 3 of Mega Hostel Block 1 (East Wing, 3rd Floor) trips the main circuit breaker whenever switched on. Students are unable to get hot water during morning hours.',
      categoryId: catMap['Hostel Electrical & Geysers'],
      hostelBlock: 'Mega Hostel Block 1',
      roomNumber: 'MH1-304',
      location: 'Mega Hostel Block 1, 3rd Floor East Wing Bathroom 3',
      priority: 'high',
      status: 'in_progress',
      assignedDepartmentId: deptMap['Hostel Electrical Maintenance Wing'],
      assignedStaffId: caretakerMH._id,
      createdAt: new Date(Date.now() - 36 * 3600 * 1000),
      activityLog: [
        {
          actorId: student1._id,
          actorName: student1.name,
          actorRole: 'student',
          action: 'submitted',
          newValue: 'submitted',
          note: 'Hostel complaint submitted by student',
          createdAt: new Date(Date.now() - 36 * 3600 * 1000),
        },
        {
          actorId: chiefWarden._id,
          actorName: chiefWarden.name,
          actorRole: 'admin',
          action: 'assigned',
          newValue: 'Hostel Electrical Maintenance Wing',
          note: 'Routed to Mega Hostel maintenance team for electrical inspection.',
          createdAt: new Date(Date.now() - 24 * 3600 * 1000),
        },
        {
          actorId: caretakerMH._id,
          actorName: caretakerMH.name,
          actorRole: 'staff',
          action: 'status_changed',
          oldValue: 'assigned',
          newValue: 'in_progress',
          note: 'Electrician inspected the geyser. Heating element has developed a short circuit. Replacement element requisitioned from central store.',
          createdAt: new Date(Date.now() - 8 * 3600 * 1000),
        },
      ],
    });
    await cmp1.save();

    // Complaint 2: Critical - Under Review in Ladies Hostel
    const cmp2 = new Complaint({
      complaintCode: 'NITC-2026-000102',
      studentId: student2._id,
      title: 'Major Pipeline Leakage & Water Logging in MLH 2nd Floor Corridor',
      description: 'The main overhead distribution pipe connected to washroom cluster 2 has ruptured, causing continuous water logging across the corridor in front of rooms 210 to 218. High risk of slipping!',
      categoryId: catMap['Plumbing, Taps & Washrooms'],
      hostelBlock: 'Mega Ladies Hostel (MLH)',
      roomNumber: 'MLH-215',
      location: 'Mega Ladies Hostel (MLH), 2nd Floor Corridor near Washroom 2',
      priority: 'critical',
      status: 'under_review',
      assignedDepartmentId: deptMap['Hostel Plumbing & Water Supply Cell'],
      createdAt: new Date(Date.now() - 3 * 3600 * 1000),
      activityLog: [
        {
          actorId: student2._id,
          actorName: student2.name,
          actorRole: 'student',
          action: 'submitted',
          newValue: 'submitted',
          note: 'Urgent emergency hazard reported by resident.',
          createdAt: new Date(Date.now() - 3 * 3600 * 1000),
        },
        {
          actorId: chiefWarden._id,
          actorName: chiefWarden.name,
          actorRole: 'admin',
          action: 'status_changed',
          oldValue: 'submitted',
          newValue: 'under_review',
          note: 'Flagged as high-priority emergency. Plumbing team instructed to isolate main gate valve immediately.',
          createdAt: new Date(Date.now() - 1 * 3600 * 1000),
        },
      ],
    });
    await cmp2.save();

    // Complaint 3: Resolved in A Hostel
    const cmp3 = new Complaint({
      complaintCode: 'NITC-2026-000103',
      studentId: student3._id,
      title: 'Study Table Drawer Lock Broken & Chair Leg Loose',
      description: 'The wooden study table drawer lock in Room PG1-108 is jammed and the wooden study chair has a cracked rear support leg.',
      categoryId: catMap['Room Carpentry, Cots & Locks'],
      hostelBlock: 'PG Hostel 1',
      roomNumber: 'PG1-108',
      location: 'PG Hostel 1, Ground Floor Room 108',
      priority: 'medium',
      status: 'resolved',
      assignedDepartmentId: deptMap['Hostel Carpentry & Furniture Division'],
      resolutionNotes: 'Carpentry crew replaced the broken drawer lock with a new brass cylinder lock and replaced the damaged wooden chair with a heavy-duty ergonomic model.',
      createdAt: new Date(Date.now() - 72 * 3600 * 1000),
      resolvedAt: new Date(Date.now() - 12 * 3600 * 1000),
      activityLog: [
        {
          actorId: student3._id,
          actorName: student3.name,
          actorRole: 'student',
          action: 'submitted',
          newValue: 'submitted',
          note: 'Carpentry repair request submitted.',
          createdAt: new Date(Date.now() - 72 * 3600 * 1000),
        },
        {
          actorId: chiefWarden._id,
          actorName: chiefWarden.name,
          actorRole: 'admin',
          action: 'assigned',
          newValue: 'Hostel Carpentry & Furniture Division',
          note: 'Assigned to PG Hostel carpentry team.',
          createdAt: new Date(Date.now() - 48 * 3600 * 1000),
        },
        {
          actorId: chiefWarden._id,
          actorName: chiefWarden.name,
          actorRole: 'admin',
          action: 'resolved',
          oldValue: 'in_progress',
          newValue: 'resolved',
          note: 'Carpentry crew replaced the broken drawer lock with a new brass cylinder lock and replaced the damaged wooden chair with a heavy-duty ergonomic model.',
          createdAt: new Date(Date.now() - 12 * 3600 * 1000),
        },
      ],
    });
    await cmp3.save();

    // Complaint 4: Closed in Mega Hostel Block 2
    const cmp4 = new Complaint({
      complaintCode: 'NITC-2026-000104',
      studentId: student1._id,
      title: 'Hostel Wi-Fi Access Point (MH-AP-4B) Dropping Packets',
      description: 'The Cisco Wi-Fi access point installed outside Room 220 in Mega Hostel Block 1 has high packet loss (>40%) and students cannot connect during evening study hours.',
      categoryId: catMap['Hostel Wi-Fi & Room LAN Ports'],
      hostelBlock: 'Mega Hostel Block 1',
      roomNumber: 'MH1-304',
      location: 'Mega Hostel Block 1, 2nd Floor Corridor outside Room 220',
      priority: 'high',
      status: 'closed',
      assignedDepartmentId: deptMap['Campus Network Centre (CNC - Hostel Wi-Fi & LAN)'],
      resolutionNotes: 'CNC network engineer replaced the faulty PoE splitter and upgraded firmware on AP MH-AP-4B. Signal strength tested at -48 dBm with 0% packet loss.',
      createdAt: new Date(Date.now() - 120 * 3600 * 1000),
      resolvedAt: new Date(Date.now() - 40 * 3600 * 1000),
      closedAt: new Date(Date.now() - 20 * 3600 * 1000),
      activityLog: [
        {
          actorId: student1._id,
          actorName: student1.name,
          actorRole: 'student',
          action: 'submitted',
          newValue: 'submitted',
          note: 'Network issue logged.',
          createdAt: new Date(Date.now() - 120 * 3600 * 1000),
        },
        {
          actorId: chiefWarden._id,
          actorName: chiefWarden.name,
          actorRole: 'admin',
          action: 'assigned',
          newValue: 'Campus Network Centre (CNC - Hostel Wi-Fi & LAN)',
          note: 'Routed to CNC network engineers.',
          createdAt: new Date(Date.now() - 90 * 3600 * 1000),
        },
        {
          actorId: chiefWarden._id,
          actorName: chiefWarden.name,
          actorRole: 'admin',
          action: 'resolved',
          oldValue: 'in_progress',
          newValue: 'resolved',
          note: 'CNC network engineer replaced the faulty PoE splitter and upgraded firmware on AP MH-AP-4B. Signal strength tested at -48 dBm with 0% packet loss.',
          createdAt: new Date(Date.now() - 40 * 3600 * 1000),
        },
        {
          actorId: chiefWarden._id,
          actorName: chiefWarden.name,
          actorRole: 'admin',
          action: 'closed',
          oldValue: 'resolved',
          newValue: 'closed',
          note: 'Student verified working high-speed internet. Complaint closed.',
          createdAt: new Date(Date.now() - 20 * 3600 * 1000),
        },
      ],
    });
    await cmp4.save();

    // Complaint 5: Reopened in Mess A
    const cmp5 = new Complaint({
      complaintCode: 'NITC-2026-000105',
      studentId: student2._id,
      title: 'Water Cooler in Mega Mess Dispensing Warm Water',
      description: 'The commercial RO drinking water cooler near the south dining counter in Mega Mess is not cooling water and has a slow output rate.',
      categoryId: catMap['Mess Food Quality & Dining'],
      hostelBlock: 'Mega Hostel Block 1',
      messName: 'Mega Mess (South Non-Veg)',
      location: 'Mega Mess, South Dining Section Drinking Area',
      priority: 'medium',
      status: 'reopened',
      assignedDepartmentId: deptMap['Hostel Mess & Catering Management Committee'],
      resolutionNotes: 'Compressor was restarted.',
      createdAt: new Date(Date.now() - 80 * 3600 * 1000),
      resolvedAt: new Date(Date.now() - 30 * 3600 * 1000),
      activityLog: [
        {
          actorId: student2._id,
          actorName: student2.name,
          actorRole: 'student',
          action: 'submitted',
          newValue: 'submitted',
          note: 'Water cooler issue reported.',
          createdAt: new Date(Date.now() - 80 * 3600 * 1000),
        },
        {
          actorId: chiefWarden._id,
          actorName: chiefWarden.name,
          actorRole: 'admin',
          action: 'resolved',
          oldValue: 'in_progress',
          newValue: 'resolved',
          note: 'Compressor was restarted.',
          createdAt: new Date(Date.now() - 30 * 3600 * 1000),
        },
        {
          actorId: student2._id,
          actorName: student2.name,
          actorRole: 'student',
          action: 'reopened',
          oldValue: 'resolved',
          newValue: 'reopened',
          note: 'Water is still warm and now tasting of sediment. Filter cartridge replacement is needed.',
          createdAt: new Date(Date.now() - 5 * 3600 * 1000),
        },
      ],
    });
    await cmp5.save();

    // Complaint 6: Freshly Submitted in C Hostel
    const cmp6 = new Complaint({
      complaintCode: 'NITC-2026-000106',
      studentId: student3._id,
      title: 'Balcony Window Mosquito Net Torn in C Hostel 1st Floor',
      description: 'Due to a torn wire mesh on the balcony window of Room C-104, mosquitoes and insects are entering in large numbers in the evenings.',
      categoryId: catMap['Pest Control & Safety Hazard'],
      hostelBlock: 'C Hostel',
      roomNumber: 'C-104',
      location: 'C Hostel, 1st Floor Room C-104',
      priority: 'low',
      status: 'submitted',
      assignedDepartmentId: deptMap['Hostel Carpentry & Furniture Division'],
      createdAt: new Date(Date.now() - 2 * 3600 * 1000),
      activityLog: [
        {
          actorId: student3._id,
          actorName: student3.name,
          actorRole: 'student',
          action: 'submitted',
          newValue: 'submitted',
          note: 'Hostel complaint submitted by student.',
          createdAt: new Date(Date.now() - 2 * 3600 * 1000),
        },
      ],
    });
    await cmp6.save();

    console.log('\n======================================================');
    console.log('✅ NITC HOSTEL DATABASE SEEDING COMPLETED SUCCESSFULLY!');
    console.log('======================================================');
    console.log('🔑 TEST USER CREDENTIALS (NITC HOSTEL SYSTEM):');
    console.log('------------------------------------------------------');
    console.log('👑 Chief Warden (Admin):');
    console.log('   Email:    chiefwarden@nitc.ac.in');
    console.log('   Password: Admin@123');
    console.log('------------------------------------------------------');
    console.log('🛠️ Hostel Caretaker (Mega Hostel):');
    console.log('   Email:    caretaker.mh@nitc.ac.in');
    console.log('   Password: Staff@123');
    console.log('------------------------------------------------------');
    console.log('🎓 NITC Student (S Keerthan Kumar - Mega Hostel):');
    console.log('   Email:    keerthan_b241139ch@nitc.ac.in');
    console.log('   Password: Student@123');
    console.log('======================================================\n');

    if (require.main === module) {
      process.exit(0);
    }
  } catch (err) {
    console.error('❌ Seeding failed with error:', err);
    if (require.main === module) {
      process.exit(1);
    }
  }
};

if (require.main === module) {
  seedDatabase();
}

module.exports = seedDatabase;
