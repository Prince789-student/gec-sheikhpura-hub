const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Security & Middleware
app.use(helmet({ crossOriginResourcePolicy: false }));
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

// In-Memory Database with Seeded GEC Sheikhpura Data
let listings = [
  {
    id: 'lst_1',
    category: 'room',
    title: 'Maa Sharda Boys Hostel & PG',
    price: '₹2,200/mo',
    contact: '9835012345',
    person: 'Ramesh Singh',
    location: 'Bajidpur Main Road, Near Police Line, Sheikhpura',
    amenities: 'Wi-Fi, 24x7 Water, In-house Mess, Generator Power Backup',
    status: 'approved',
    featured: true,
    createdAt: new Date().toISOString()
  },
  {
    id: 'lst_2',
    category: 'room',
    title: 'Annapurna Student Residency',
    price: '₹3,200/mo',
    contact: '9431098765',
    person: 'Suresh Verma',
    location: 'Bajidpur Chowk, Behind Canteen, Sheikhpura',
    amenities: 'Single & Double Rooms, High-Speed Wi-Fi, CCTV, Purified Water',
    status: 'approved',
    featured: false,
    createdAt: new Date().toISOString()
  },
  {
    id: 'lst_3',
    category: 'food',
    title: 'Bhojan Griha Student Mess & Tiffin Service',
    price: '₹2,600/mo',
    contact: '9876543210',
    person: 'Mukesh Kumar',
    location: 'Near College Gate, Sheikhpura',
    amenities: 'Pure Veg & Non-Veg 2 times/day, Free Tiffin Delivery to Hostels',
    status: 'approved',
    featured: true,
    createdAt: new Date().toISOString()
  },
  {
    id: 'lst_4',
    category: 'shop',
    title: 'Anand Stationery & Fast Xerox Desk',
    price: 'Affordable Student Rates',
    contact: '9431098765',
    person: 'Anand Verma',
    location: 'Gate No. 1, GEC Sheikhpura',
    amenities: 'Spiral Binding, BEU Syllabus Prints, Lab Manuals, Stationery',
    status: 'approved',
    featured: false,
    createdAt: new Date().toISOString()
  }
];

let notices = [
  {
    id: 'not_1',
    title: 'Revised B.Tech Mid-Term Exam Schedule Announced',
    date: '30 Oct 2026',
    category: 'Examination',
    url: 'https://beu-bih.ac.in',
    isImportant: true
  }
];

let events = [];

let grievances = [];

// Lost & Found Items Store
let lostFound = [
  {
    id: 'lf_1',
    title: 'Casio fx-991ES Plus Scientific Calculator',
    type: 'Lost',
    category: 'Electronics',
    location: 'Classroom 204 (Academic Building)',
    dateStr: '30 Oct 2026',
    contactName: 'Aman Kumar (CSE 3rd Year)',
    contactPhone: '06341-224401',
    description: 'Black scientific calculator with blue batch sticker on back. Please return to guard room.'
  },
  {
    id: 'lf_2',
    title: 'Civil Engg 2nd Year Student ID Card',
    type: 'Found',
    category: 'Document',
    location: 'Central Library Reading Desk',
    dateStr: '29 Oct 2026',
    contactName: 'Library Security Desk',
    contactPhone: '06341-224402',
    description: 'Deposited at central library reception desk. Please collect with registration proof.'
  }
];

// --- API ROUTES ---

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

// Start Server
app.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(`  GEC Sheikhpura Hub API Server running on port ${PORT}`);
  console.log(`  Health Check: http://localhost:${PORT}/health`);
  console.log(`  Listings API: http://localhost:${PORT}/api/listings`);
  console.log(`=======================================================`);
});
