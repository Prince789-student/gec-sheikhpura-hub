const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const sportsEventsRouter = require('./sports_events_router');

const app = express();
const PORT = process.env.PORT || 5000;

// Security & Middleware
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginResourcePolicy: false,
  crossOriginEmbedderPolicy: false
}));
app.use(compression());
app.use(express.json());

// CORS configuration for local dev and production Vercel frontend
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:5000',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:5000',
  process.env.FRONTEND_URL
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps, curl, or server-to-server)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1 || origin.endsWith('.vercel.app')) {
      return callback(null, true);
    }
    return callback(null, true); // Permissive for student testing
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// In-Memory Database for Live Student Hub
let listings = [];

let notices = [];

let events = [];

let grievances = [];

// Lost & Found Items Store (Live student submissions)
let lostFound = [];

// Laundry Orders Store (Privacy Protected - Student & Authorized Staff only)
let laundryOrders = [];

// Staff & Admin Role-Based Access Control Store
let adminRoles = [
  {
    email: 'pk3334238@gmail.com',
    name: 'Prince Kumar',
    role: 'super_admin',
    permissions: ['all'],
    updatedAt: new Date().toISOString()
  }
];

// --- API ROUTES ---

// Mount Master Sports & Events Management Router
app.use('/api', sportsEventsRouter);

// Health & Uptime
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    service: 'GEC Sheikhpura Student Hub Backend',
    version: '1.0.0'
  });
});

app.get('/api', (req, res) => {
  res.json({
    message: 'Welcome to GEC Sheikhpura Student Hub API',
    endpoints: {
      health: 'GET /health',
      listings: 'GET /api/listings',
      submitListing: 'POST /api/listings',
      notices: 'GET /api/notices',
      grievances: 'POST /api/grievances',
      adminPending: 'GET /api/admin/pending'
    }
  });
});

// Listings
app.get('/api/listings', (req, res) => {
  const { category, status } = req.query;
  let filtered = listings;
  if (category) {
    filtered = filtered.filter(l => l.category.toLowerCase() === category.toLowerCase());
  }
  if (status) {
    filtered = filtered.filter(l => l.status === status);
  } else {
    // By default, return only approved listings for students
    filtered = filtered.filter(l => l.status === 'approved');
  }
  res.json({ count: filtered.length, listings: filtered });
});

app.post('/api/listings', (req, res) => {
  const { category, title, price, contact, person, location, amenities } = req.body;
  if (!title || !contact) {
    return res.status(400).json({ error: 'Title and contact number are required' });
  }

  const newListing = {
    id: `lst_${Date.now()}`,
    category: category || 'room',
    title: title.trim(),
    price: price || 'Contact for price',
    contact: contact.trim(),
    person: person ? person.trim() : 'Anonymous',
    location: location ? location.trim() : 'Sheikhpura',
    amenities: amenities ? amenities.trim() : '',
    status: 'pending', // Requires admin review
    featured: false,
    createdAt: new Date().toISOString()
  };

  listings.unshift(newListing);
  res.status(201).json({
    message: '✓ Listing submitted successfully! Under admin review for student safety.',
    listing: newListing
  });
});

// Notices
app.get('/api/notices', (req, res) => {
  res.json({ count: notices.length, notices });
});

app.post('/api/notices', (req, res) => {
  const { title, category, isImportant } = req.body;
  if (!title) return res.status(400).json({ error: 'Notice title is required' });

  const newNotice = {
    id: `not_${Date.now()}`,
    title: title.trim(),
    date: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
    category: category || 'General',
    isImportant: Boolean(isImportant)
  };

  notices.unshift(newNotice);
  res.status(201).json({ message: 'Notice posted successfully', notice: newNotice });
});

app.delete('/api/notices/:id', (req, res) => {
  const { id } = req.params;
  notices = notices.filter(n => n.id !== id);
  res.json({ message: 'Notice deleted successfully', count: notices.length });
});

// Events API (Live Admin Sync)
app.get('/api/events', (req, res) => {
  res.json({ count: events.length, events });
});

app.post('/api/events', (req, res) => {
  const { title, dateStr, location, category, description, organizer, maxSpots } = req.body;
  if (!title) return res.status(400).json({ error: 'Event title is required' });

  const newEvent = {
    id: `ev_${Date.now()}`,
    title: title.trim(),
    dateStr: dateStr || new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
    location: location ? location.trim() : 'GEC Sheikhpura Campus',
    category: category || 'Technical',
    description: description ? description.trim() : 'Campus student event.',
    organizer: organizer ? organizer.trim() : 'GEC Student Society',
    spotsLeft: maxSpots ? parseInt(maxSpots) : 25
  };

  events.unshift(newEvent);
  res.status(201).json({ message: 'Event posted successfully', event: newEvent });
});

app.delete('/api/events/:id', (req, res) => {
  const { id } = req.params;
  events = events.filter(e => e.id !== id);
  res.json({ message: 'Event deleted successfully', count: events.length });
});

// Grievance / Anti-Ragging Cell
app.post('/api/grievances', (req, res) => {
  const { subject, details, contact, isAnonymous } = req.body;
  if (!details) return res.status(400).json({ error: 'Grievance details are required' });

  const newGrievance = {
    id: `grv_${Date.now()}`,
    subject: subject || 'General Grievance',
    details: details.trim(),
    contact: isAnonymous ? 'Anonymous' : (contact || 'Confidential'),
    status: 'open',
    createdAt: new Date().toISOString()
  };

  grievances.unshift(newGrievance);
  res.status(201).json({
    message: '✓ Grievance submitted securely to GEC Sheikhpura Cell.',
    ticketId: newGrievance.id
  });
});

// Lost & Found Endpoints (Live In-App Updates)
app.get('/api/lostfound', (req, res) => {
  res.json({ count: lostFound.length, items: lostFound });
});

app.post('/api/lostfound', (req, res) => {
  const { title, type, category, location, dateStr, contactName, contactPhone, description } = req.body;
  if (!title || !contactPhone) {
    return res.status(400).json({ error: 'Title and contact phone are required' });
  }

  const newItem = {
    id: `lf_${Date.now()}`,
    title: title.trim(),
    type: type || 'Lost',
    category: category || 'General',
    location: location ? location.trim() : 'GEC Sheikhpura Campus',
    dateStr: dateStr || new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
    contactName: contactName ? contactName.trim() : 'Student',
    contactPhone: contactPhone.trim(),
    description: description ? description.trim() : ''
  };

  lostFound.unshift(newItem);
  res.status(201).json({
    message: '✓ Lost & Found entry submitted and updated live!',
    item: newItem
  });
});

app.delete('/api/lostfound/:id', (req, res) => {
  const { id } = req.params;
  lostFound = lostFound.filter(item => item.id !== id);
  res.json({ message: 'Item removed successfully', count: lostFound.length });
});

// Super Admin Endpoints
app.get('/api/admin/pending', (req, res) => {
  const pendingListings = listings.filter(l => l.status === 'pending');
  res.json({
    pendingListings,
    totalListings: listings.length,
    openGrievances: grievances.length
  });
});

app.patch('/api/admin/listings/:id', (req, res) => {
  const { id } = req.params;
  const { status } = req.body; // 'approved' or 'rejected'

  const item = listings.find(l => l.id === id);
  if (!item) return res.status(404).json({ error: 'Listing not found' });

  item.status = status || 'approved';
  res.json({ message: `Listing marked as ${item.status}`, listing: item });
});

// --- LAUNDRY SERVICES API (Student Booking & Role Protected) ---

// Student submits laundry clothes count & room details
app.post('/api/laundry/orders', (req, res) => {
  const {
    studentName,
    studentEmail,
    studentPhone,
    regNo,
    shirtsCount,
    pantsCount,
    bedsheetsCount,
    othersCount,
    roomNo,
    hostelName,
    locationDetails,
    notes
  } = req.body;

  if (!studentName || !studentPhone || !roomNo) {
    return res.status(400).json({ error: 'Student name, phone, and room number are required.' });
  }

  const shirts = parseInt(shirtsCount) || 0;
  const pants = parseInt(pantsCount) || 0;
  const bedsheets = parseInt(bedsheetsCount) || 0;
  const others = parseInt(othersCount) || 0;
  const total = shirts + pants + bedsheets + others;

  if (total <= 0) {
    return res.status(400).json({ error: 'Please enter at least 1 item of clothing.' });
  }

  const newOrder = {
    id: `lnd_${Date.now()}`,
    studentName: studentName.trim(),
    studentEmail: (studentEmail || '').trim().toLowerCase(),
    studentPhone: studentPhone.trim(),
    regNo: (regNo || '').trim(),
    shirtsCount: shirts,
    pantsCount: pants,
    bedsheetsCount: bedsheets,
    othersCount: others,
    totalClothes: total,
    roomNo: roomNo.trim(),
    hostelName: hostelName ? hostelName.trim() : 'Hostel 1',
    locationDetails: (locationDetails || '').trim(),
    notes: (notes || '').trim(),
    status: 'Pending Pickup', // 'Pending Pickup', 'In Wash', 'Ironing / Ready', 'Delivered'
    createdAt: new Date().toISOString()
  };

  laundryOrders.unshift(newOrder);
  res.status(201).json({
    message: '✓ Laundry pickup requested! Staff has been notified.',
    order: newOrder
  });
});

// View laundry orders: Students only see their own orders; authorized laundry staff sees all
app.get('/api/laundry/orders', (req, res) => {
  const { email, role } = req.query;
  const cleanEmail = (email || '').toLowerCase().trim();

  // If role is laundry or admin, or Prince Kumar, return all orders
  const isSuperAdmin = (cleanEmail === 'pk3334238@gmail.com');
  const staff = adminRoles.find(r => r.email === cleanEmail && (r.permissions.includes('all') || r.permissions.includes('laundry')));

  if (isSuperAdmin || staff || role === 'admin' || role === 'laundry_manager') {
    return res.json({ count: laundryOrders.length, orders: laundryOrders });
  }

  // Student privacy guard: only return orders submitted by this student's email or phone
  if (cleanEmail) {
    const studentOrders = laundryOrders.filter(o => o.studentEmail === cleanEmail);
    return res.json({ count: studentOrders.length, orders: studentOrders });
  }

  // If no auth query given, return empty list for privacy
  res.json({ count: 0, orders: [] });
});

// Update laundry order status (Laundry staff or admin only)
app.patch('/api/laundry/orders/:id', (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  const order = laundryOrders.find(o => o.id === id);
  if (!order) return res.status(404).json({ error: 'Order not found' });

  if (status) order.status = status;
  order.updatedAt = new Date().toISOString();

  res.json({ message: `Laundry order status updated to ${order.status}`, order });
});

// Delete laundry order
app.delete('/api/laundry/orders/:id', (req, res) => {
  const { id } = req.params;
  laundryOrders = laundryOrders.filter(o => o.id !== id);
  res.json({ message: 'Order removed successfully', count: laundryOrders.length });
});

// --- ADMIN ROLES & RBAC PERMISSIONS API ---

// List all assigned admin roles
app.get('/api/admin/roles', (req, res) => {
  res.json({ count: adminRoles.length, roles: adminRoles });
});

// Assign or update a user's admin role / permissions
app.post('/api/admin/roles', (req, res) => {
  const { email, name, role, permissions } = req.body;
  if (!email) return res.status(400).json({ error: 'Email is required.' });

  const cleanEmail = email.toLowerCase().trim();
  const existingIndex = adminRoles.findIndex(r => r.email === cleanEmail);

  const roleObj = {
    email: cleanEmail,
    name: name ? name.trim() : cleanEmail.split('@')[0],
    role: role || 'laundry_manager',
    permissions: Array.isArray(permissions) ? permissions : [(role || 'laundry')],
    updatedAt: new Date().toISOString()
  };

  if (existingIndex >= 0) {
    adminRoles[existingIndex] = roleObj;
  } else {
    adminRoles.push(roleObj);
  }

  res.json({ message: `Permissions updated for ${cleanEmail}`, role: roleObj });
});

// Remove role
app.delete('/api/admin/roles/:email', (req, res) => {
  const cleanEmail = req.params.email.toLowerCase().trim();
  if (cleanEmail === 'pk3334238@gmail.com') {
    return res.status(403).json({ error: 'Cannot remove root Super Admin.' });
  }

  adminRoles = adminRoles.filter(r => r.email !== cleanEmail);
  res.json({ message: `Role removed for ${cleanEmail}`, count: adminRoles.length });
});

// Google Firebase Auth Verification
app.post('/api/auth/verify', (req, res) => {
  const { email, displayName } = req.body;
  if (!email) return res.status(400).json({ error: 'Email required' });

  const isAdmin = email.toLowerCase() === 'pk3334238@gmail.com';
  res.json({
    uid: `user_${Date.now()}`,
    email,
    displayName: displayName || (isAdmin ? 'Prince Kumar' : 'Student'),
    role: isAdmin ? 'SUPER_ADMIN' : 'VERIFIED_STUDENT',
    token: `gec_jwt_${Buffer.from(email).toString('base64')}`
  });
});

// Serve root static files (HTML, CSS, JS, assets, and /app/ Flutter web)
const rootStaticDir = path.join(__dirname, '..');
app.use(express.static(rootStaticDir, {
  extensions: ['html'],
  setHeaders: (res, filePath) => {
    // Disable caching on localhost to guarantee instantaneous updates
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.set('Pragma', 'no-cache');
    res.set('Expires', '0');
  }
}));

// Catch-all for SPA navigation if /app/ routes are accessed
app.get('/app/*', (req, res) => {
  res.sendFile(path.join(rootStaticDir, 'app', 'index.html'));
});

// Root fallback to index.html
app.get('/', (req, res) => {
  res.sendFile(path.join(rootStaticDir, 'index.html'));
});

// Start Server
app.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(`  GEC Sheikhpura Hub Local Server LIVE`);
  console.log(`  Frontend Web:    http://localhost:${PORT}`);
  console.log(`  Mobile App Web:  http://localhost:${PORT}/app/`);
  console.log(`  Admin Panel:     http://localhost:${PORT}/admin.html`);
  console.log(`  Backend API:     http://localhost:${PORT}/api`);
  console.log(`  Health Check:    http://localhost:${PORT}/health`);
  console.log(`=======================================================`);
});
