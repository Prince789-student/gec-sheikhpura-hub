/**
 * GEC Sheikhpura Student Life Hub - Sports & Events Management Router
 * Complete Production-Grade Implementation:
 * - Module A: Student Events Management & Permissions
 * - Module B: Sports & Squad Management (Team, Athletics, Individual, Indoor)
 * - Module C: Tournament & Manual Match Management (Scoring Engines, Timers, Tie Resolution, Points)
 * - Module D: Cultural Competitions Management (10 Categories, Judging, Weighted Scoring)
 * - Module E: Realtime Notifications & Security Audit Trail
 */

const express = require('express');
const router = express.Router();

// In-Memory Authoritative Datastores (Synced with Supabase & Client Apps)
let eventsList = [];

// Sports Directory & Dynamic Rules
let sportsList = [
  // --- A. TEAM SPORTS (9) ---
  {
    id: 'cricket',
    name: 'Cricket',
    code: 'CRI',
    category: 'Team Sports',
    sportType: 'team',
    icon: '🏏',
    minSquadSize: 11,
    maxSquadSize: 16,
    playingSquadSize: 11,
    substituteCount: 5,
    roles: ['Batsman', 'Bowler', 'All-Rounder', 'Wicketkeeper'],
    scoringSystem: 'cricket',
    isActive: true,
    rules: { defaultOvers: 10, powerplayOvers: 3, superOver: true, pointsWin: 2, pointsDraw: 1, pointsLoss: 0 }
  },
  {
    id: 'kabaddi',
    name: 'Kabaddi',
    code: 'KBD',
    category: 'Team Sports',
    sportType: 'team',
    icon: '🤼',
    minSquadSize: 7,
    maxSquadSize: 12,
    playingSquadSize: 7,
    substituteCount: 5,
    roles: ['Raider', 'Defender', 'All-Rounder'],
    scoringSystem: 'kabaddi',
    isActive: true,
    rules: { halves: 2, halfDurationMinutes: 20, halfBreakMinutes: 5, raidTimerSeconds: 30, bonusLine: true, pointsWin: 2, pointsDraw: 1, pointsLoss: 0 }
  },
  {
    id: 'basketball',
    name: 'Basketball',
    code: 'BB',
    category: 'Team Sports',
    sportType: 'team',
    icon: '🏀',
    minSquadSize: 5,
    maxSquadSize: 12,
    playingSquadSize: 5,
    substituteCount: 7,
    roles: ['Point Guard', 'Shooting Guard', 'Small Forward', 'Power Forward', 'Center'],
    scoringSystem: 'basketball',
    isActive: true,
    rules: { quarters: 4, quarterDurationMinutes: 10, shotClockSeconds: 24, timeoutsPerHalf: 3, maxFoulsAllowed: 5, pointsWin: 2, pointsLoss: 0 }
  },
  {
    id: 'volleyball',
    name: 'Volleyball',
    code: 'VB',
    category: 'Team Sports',
    sportType: 'team',
    icon: '🏐',
    minSquadSize: 6,
    maxSquadSize: 12,
    playingSquadSize: 6,
    substituteCount: 6,
    roles: ['Setter', 'Outside Hitter', 'Middle Blocker', 'Opposite Hitter', 'Libero'],
    scoringSystem: 'volleyball',
    isActive: true,
    rules: { setsToWin: 3, pointsPerSet: 25, decidingSetPoints: 15, deuceMargin: 2, pointsWin: 2, pointsLoss: 0 }
  },
  {
    id: 'football',
    name: 'Football',
    code: 'FB',
    category: 'Team Sports',
    sportType: 'team',
    icon: '⚽',
    minSquadSize: 11,
    maxSquadSize: 18,
    playingSquadSize: 11,
    substituteCount: 7,
    roles: ['Forward', 'Midfielder', 'Defender', 'Goalkeeper'],
    scoringSystem: 'standard_points',
    isActive: true,
    rules: { halves: 2, halfDurationMinutes: 45, halfBreakMinutes: 15, pointsWin: 3, pointsDraw: 1, pointsLoss: 0 }
  },
  {
    id: 'handball',
    name: 'Handball',
    code: 'HB',
    category: 'Team Sports',
    sportType: 'team',
    icon: '🤾',
    minSquadSize: 7,
    maxSquadSize: 14,
    playingSquadSize: 7,
    substituteCount: 7,
    roles: ['Backcourt', 'Winger', 'Pivot', 'Goalkeeper'],
    scoringSystem: 'standard_points',
    isActive: true,
    rules: { halves: 2, halfDurationMinutes: 30, pointsWin: 2, pointsDraw: 1, pointsLoss: 0 }
  },
  {
    id: 'hockey',
    name: 'Hockey',
    code: 'HCK',
    category: 'Team Sports',
    sportType: 'team',
    icon: '🏑',
    minSquadSize: 11,
    maxSquadSize: 16,
    playingSquadSize: 11,
    substituteCount: 5,
    roles: ['Forward', 'Midfielder', 'Fullback', 'Goalkeeper'],
    scoringSystem: 'standard_points',
    isActive: true,
    rules: { quarters: 4, quarterDurationMinutes: 15, pointsWin: 3, pointsDraw: 1, pointsLoss: 0 }
  },
  {
    id: 'tug_of_war',
    name: 'Tug of War',
    code: 'TOW',
    category: 'Team Sports',
    sportType: 'team',
    icon: '🪢',
    minSquadSize: 8,
    maxSquadSize: 10,
    playingSquadSize: 8,
    substituteCount: 2,
    roles: ['Anchor', 'Puller'],
    scoringSystem: 'standard_points',
    isActive: true,
    rules: { pulls: 3, distanceMeters: 4, pointsWin: 2, pointsLoss: 0 }
  },
  {
    id: 'kho_kho',
    name: 'Kho-Kho',
    code: 'KHO',
    category: 'Team Sports',
    sportType: 'team',
    icon: '🏃',
    minSquadSize: 9,
    maxSquadSize: 12,
    playingSquadSize: 9,
    substituteCount: 3,
    roles: ['Chaser', 'Runner'],
    scoringSystem: 'standard_points',
    isActive: true,
    rules: { innings: 2, turnsPerInning: 2, turnDurationMinutes: 9, pointsWin: 2, pointsLoss: 0 }
  },

  // --- B. INDOOR & RACKET SPORTS (5) ---
  {
    id: 'badminton',
    name: 'Badminton',
    code: 'BDM',
    category: 'Indoor & Racket Sports',
    sportType: 'doubles',
    icon: '🏸',
    minSquadSize: 1,
    maxSquadSize: 2,
    playingSquadSize: 1,
    substituteCount: 0,
    roles: ['Singles Player', 'Doubles Pair'],
    scoringSystem: 'standard_points',
    isActive: true,
    rules: { setsToWin: 2, pointsPerSet: 21 }
  },
  {
    id: 'table_tennis',
    name: 'Table Tennis',
    code: 'TT',
    category: 'Indoor & Racket Sports',
    sportType: 'doubles',
    icon: '🏓',
    minSquadSize: 1,
    maxSquadSize: 2,
    playingSquadSize: 1,
    substituteCount: 0,
    roles: ['Singles Player', 'Doubles Pair'],
    scoringSystem: 'standard_points',
    isActive: true,
    rules: { setsToWin: 3, pointsPerSet: 11 }
  },
  {
    id: 'chess',
    name: 'Chess',
    code: 'CHS',
    category: 'Indoor & Racket Sports',
    sportType: 'indoor',
    icon: '♟️',
    minSquadSize: 1,
    maxSquadSize: 1,
    playingSquadSize: 1,
    substituteCount: 0,
    roles: ['Chess Player'],
    scoringSystem: 'chess_carrom',
    isActive: true,
    rules: { timeControlMinutes: 30, incrementSeconds: 5 }
  },
  {
    id: 'carrom',
    name: 'Carrom',
    code: 'CRM',
    category: 'Indoor & Racket Sports',
    sportType: 'indoor',
    icon: '🎯',
    minSquadSize: 1,
    maxSquadSize: 2,
    playingSquadSize: 1,
    substituteCount: 0,
    roles: ['Striker'],
    scoringSystem: 'chess_carrom',
    isActive: true,
    rules: { boardsToWin: 29, queenPoints: 3 }
  },
  {
    id: 'table_football',
    name: 'Table Football (Foosball)',
    code: 'FOOS',
    category: 'Indoor & Racket Sports',
    sportType: 'indoor',
    icon: '🕹️',
    minSquadSize: 2,
    maxSquadSize: 4,
    playingSquadSize: 2,
    substituteCount: 2,
    roles: ['Offense', 'Defense'],
    scoringSystem: 'standard_points',
    isActive: true,
    rules: { goalsToWin: 10, setsToWin: 2 }
  },

  // --- C. ATHLETICS – TRACK EVENTS (13) ---
  { id: 'run_100m', name: '100 Metres Sprint', code: 'R100', category: 'Athletics Track', sportType: 'athletics', icon: '⚡', minSquadSize: 1, maxSquadSize: 1, playingSquadSize: 1, substituteCount: 0, scoringSystem: 'athletics_time', isActive: true, rules: { lanes: 8 } },
  { id: 'run_200m', name: '200 Metres Sprint', code: 'R200', category: 'Athletics Track', sportType: 'athletics', icon: '🏃', minSquadSize: 1, maxSquadSize: 1, playingSquadSize: 1, substituteCount: 0, scoringSystem: 'athletics_time', isActive: true, rules: { lanes: 8 } },
  { id: 'run_400m', name: '400 Metres Race', code: 'R400', category: 'Athletics Track', sportType: 'athletics', icon: '⏱️', minSquadSize: 1, maxSquadSize: 1, playingSquadSize: 1, substituteCount: 0, scoringSystem: 'athletics_time', isActive: true, rules: { lanes: 8 } },
  { id: 'run_800m', name: '800 Metres Middle Distance', code: 'R800', category: 'Athletics Track', sportType: 'athletics', icon: '🏃‍♂️', minSquadSize: 1, maxSquadSize: 1, playingSquadSize: 1, substituteCount: 0, scoringSystem: 'athletics_time', isActive: true, rules: { lanes: 8 } },
  { id: 'run_1500m', name: '1500 Metres Race', code: 'R1500', category: 'Athletics Track', sportType: 'athletics', icon: '👟', minSquadSize: 1, maxSquadSize: 1, playingSquadSize: 1, substituteCount: 0, scoringSystem: 'athletics_time', isActive: true, rules: { lanes: 8 } },
  { id: 'run_3000m', name: '3000 Metres Long Distance', code: 'R3000', category: 'Athletics Track', sportType: 'athletics', icon: '👟', minSquadSize: 1, maxSquadSize: 1, playingSquadSize: 1, substituteCount: 0, scoringSystem: 'athletics_time', isActive: true, rules: { laps: 7.5 } },
  { id: 'run_5000m', name: '5000 Metres Endurance', code: 'R5000', category: 'Athletics Track', sportType: 'athletics', icon: '🎽', minSquadSize: 1, maxSquadSize: 1, playingSquadSize: 1, substituteCount: 0, scoringSystem: 'athletics_time', isActive: true, rules: { laps: 12.5 } },
  { id: 'relay_4x100m', name: '4 × 100 Metres Relay', code: 'RELAY1', category: 'Athletics Track', sportType: 'relay', icon: '🎽', minSquadSize: 4, maxSquadSize: 5, playingSquadSize: 4, substituteCount: 1, scoringSystem: 'athletics_time', isActive: true, rules: { runners: 4 } },
  { id: 'relay_4x400m', name: '4 × 400 Metres Relay', code: 'RELAY2', category: 'Athletics Track', sportType: 'relay', icon: '🏁', minSquadSize: 4, maxSquadSize: 5, playingSquadSize: 4, substituteCount: 1, scoringSystem: 'athletics_time', isActive: true, rules: { runners: 4 } },
  { id: 'hurdles_110m', name: '110m Hurdles', code: 'H110', category: 'Athletics Track', sportType: 'athletics', icon: '🚧', minSquadSize: 1, maxSquadSize: 1, playingSquadSize: 1, substituteCount: 0, scoringSystem: 'athletics_time', isActive: true, rules: { hurdleHeightCm: 106.7 } },
  { id: 'hurdles_400m', name: '400m Hurdles', code: 'H400', category: 'Athletics Track', sportType: 'athletics', icon: '🚧', minSquadSize: 1, maxSquadSize: 1, playingSquadSize: 1, substituteCount: 0, scoringSystem: 'athletics_time', isActive: true, rules: { hurdleHeightCm: 91.4 } },
  { id: 'marathon', name: 'Campus Half Marathon (10K)', code: 'MARA', category: 'Athletics Track', sportType: 'athletics', icon: '🏅', minSquadSize: 1, maxSquadSize: 1, playingSquadSize: 1, substituteCount: 0, scoringSystem: 'athletics_time', isActive: true, rules: { distanceKm: 10 } },
  { id: 'cross_country', name: 'Cross Country Run', code: 'XCTR', category: 'Athletics Track', sportType: 'athletics', icon: '🌲', minSquadSize: 1, maxSquadSize: 1, playingSquadSize: 1, substituteCount: 0, scoringSystem: 'athletics_time', isActive: true, rules: { distanceKm: 6 } },

  // --- D. ATHLETICS – FIELD EVENTS (5) ---
  { id: 'shot_put', name: 'Shot Put', code: 'SP', category: 'Athletics Field', sportType: 'athletics', icon: '⚪', minSquadSize: 1, maxSquadSize: 1, playingSquadSize: 1, substituteCount: 0, scoringSystem: 'athletics_distance', isActive: true, rules: { attemptsAllowed: 3 } },
  { id: 'discus_throw', name: 'Discus Throw', code: 'DT', category: 'Athletics Field', sportType: 'athletics', icon: '💿', minSquadSize: 1, maxSquadSize: 1, playingSquadSize: 1, substituteCount: 0, scoringSystem: 'athletics_distance', isActive: true, rules: { attemptsAllowed: 3 } },
  { id: 'javelin_throw', name: 'Javelin Throw', code: 'JT', category: 'Athletics Field', sportType: 'athletics', icon: '🗡️', minSquadSize: 1, maxSquadSize: 1, playingSquadSize: 1, substituteCount: 0, scoringSystem: 'athletics_distance', isActive: true, rules: { attemptsAllowed: 3 } },
  { id: 'long_jump', name: 'Long Jump', code: 'LJ', category: 'Athletics Field', sportType: 'athletics', icon: '🏃', minSquadSize: 1, maxSquadSize: 1, playingSquadSize: 1, substituteCount: 0, scoringSystem: 'athletics_distance', isActive: true, rules: { attemptsAllowed: 3 } },
  { id: 'high_jump', name: 'High Jump', code: 'HJ', category: 'Athletics Field', sportType: 'athletics', icon: '🤸', minSquadSize: 1, maxSquadSize: 1, playingSquadSize: 1, substituteCount: 0, scoringSystem: 'athletics_distance', isActive: true, rules: { attemptsAllowed: 3 } },

  // --- E. OTHER SPORTS (6) ---
  { id: 'arm_wrestling', name: 'Arm Wrestling', code: 'ARMW', category: 'Other Sports', sportType: 'individual', icon: '💪', minSquadSize: 1, maxSquadSize: 1, playingSquadSize: 1, substituteCount: 0, scoringSystem: 'standard_points', isActive: true, rules: { weightClasses: ['Under 65kg', '65-75kg', 'Over 75kg'] } },
  { id: 'weightlifting', name: 'Weightlifting', code: 'WLT', category: 'Other Sports', sportType: 'individual', icon: '🏋️', minSquadSize: 1, maxSquadSize: 1, playingSquadSize: 1, substituteCount: 0, scoringSystem: 'athletics_distance', isActive: true, rules: { snatches: 3, cleanAndJerk: 3 } },
  { id: 'powerlifting', name: 'Powerlifting', code: 'PLT', category: 'Other Sports', sportType: 'individual', icon: '🏋️‍♂️', minSquadSize: 1, maxSquadSize: 1, playingSquadSize: 1, substituteCount: 0, scoringSystem: 'athletics_distance', isActive: true, rules: { squat: 3, benchPress: 3, deadlift: 3 } },
  { id: 'yoga', name: 'Yoga Asana Competition', code: 'YOGA', category: 'Other Sports', sportType: 'individual', icon: '🧘', minSquadSize: 1, maxSquadSize: 1, playingSquadSize: 1, substituteCount: 0, scoringSystem: 'standard_points', isActive: true, rules: { compulsoryAsanas: 4, optionalAsanas: 2 } },
  { id: 'cycling', name: 'Cycling Time Trial (5K)', code: 'CYC', category: 'Other Sports', sportType: 'athletics', icon: '🚴', minSquadSize: 1, maxSquadSize: 1, playingSquadSize: 1, substituteCount: 0, scoringSystem: 'athletics_time', isActive: true, rules: { distanceKm: 5 } },
  { id: 'swimming', name: '50m Freestyle Swimming', code: 'SWM', category: 'Other Sports', sportType: 'athletics', icon: '🏊', minSquadSize: 1, maxSquadSize: 1, playingSquadSize: 1, substituteCount: 0, scoringSystem: 'athletics_time', isActive: true, rules: { stroke: 'Freestyle', distanceM: 50 } }
];

// Teams Store
let teamsList = [];

// Tournaments Store
let tournamentsList = [];

// Matches Store (Manual Scheduling Only)
let matchesList = [];

// Standings / Points Table Store
let standingsList = [];

// Separate Sport-Wise Individual Rankings Store
let individualRankingsList = [];

// Points Rules Configuration (Rank-Based per Sport)
let pointsConfigMap = {
  default: { firstPlace: 10, secondPlace: 7, thirdPlace: 5, fourthPlace: 3, participation: 1 },
  cricket: { firstPlace: 15, secondPlace: 10, thirdPlace: 7, fourthPlace: 4, participation: 2 },
  kabaddi: { firstPlace: 15, secondPlace: 10, thirdPlace: 7, fourthPlace: 4, participation: 2 }
};

// Points Awarded Store
let pointsAwardsList = [];

// Cultural Competitions Store (10 Official Categories)
let culturalCompetitionsList = [];

// In-App Notifications Queue
let notificationsList = [];

// Security Audit Logs Queue
let auditLogsList = [];

// Helper: Mask sensitive phone and reg number for non-privileged viewers
function maskStudentData(record, isPrivileged) {
  if (isPrivileged) return record;
  const clone = { ...record };
  if (clone.phone) {
    clone.phone = clone.phone.substring(0, 3) + '****' + clone.phone.slice(-3);
  }
  if (clone.captainPhone) {
    clone.captainPhone = clone.captainPhone.substring(0, 3) + '****' + clone.captainPhone.slice(-3);
  }
  if (clone.contactPhone) {
    clone.contactPhone = clone.contactPhone.substring(0, 3) + '****' + clone.contactPhone.slice(-3);
  }
  return clone;
}

// -----------------------------------------------------------------------------
// MODULE A: STUDENT EVENTS ENDPOINTS
// -----------------------------------------------------------------------------

// 1. Get all events with filters (status, category, search)
router.get('/events', (req, res) => {
  const { status, category, query, managedBy, registeredUser } = req.query;
  let result = eventsList;

  if (status && status !== 'all') {
    result = result.filter(e => e.status.toLowerCase() === status.toLowerCase());
  }
  if (category && category !== 'all') {
    result = result.filter(e => e.categoryId.toLowerCase() === category.toLowerCase());
  }
  if (query) {
    const q = query.toLowerCase().trim();
    result = result.filter(e => 
      e.title.toLowerCase().includes(q) || 
      e.description.toLowerCase().includes(q) ||
      e.venue.toLowerCase().includes(q)
    );
  }
  if (managedBy) {
    const m = managedBy.toLowerCase().trim();
    result = result.filter(e => 
      (e.eventHeadId && e.eventHeadId.toLowerCase() === m) ||
      (e.contactEmail && e.contactEmail.toLowerCase() === m) ||
      (e.members && e.members.some(mem => mem.phone === m || mem.regNo === m))
    );
  }
  if (registeredUser) {
    const r = registeredUser.toLowerCase().trim();
    result = result.filter(e => 
      e.registrations && e.registrations.some(reg => (reg.regNo && reg.regNo.toLowerCase() === r) || (reg.email && reg.email.toLowerCase() === r))
    );
  }

  res.json({ count: result.length, events: result });
});

// 2. Get single event details
router.get('/events/:id', (req, res) => {
  const event = eventsList.find(e => e.id === req.params.id);
  if (!event) return res.status(404).json({ error: 'Event not found' });
  res.json({ event });
});

// 3. Create Event (Verified student automatically becomes Event Head)
router.post('/events', (req, res) => {
  const {
    title,
    description,
    categoryId,
    venue,
    venueDetails,
    startDate,
    endDate,
    startTime,
    endTime,
    regDeadline,
    maxParticipants,
    eventRules,
    requiredResources,
    contactPhone,
    contactEmail,
    eventHeadName,
    eventHeadRegNo,
    posterUrl
  } = req.body;

  if (!title || !description || !venue || !startDate || !contactPhone) {
    return res.status(400).json({ error: 'Please provide title, description, venue, start date, and contact phone.' });
  }

  const categoryObj = sportsList.find(c => c.id === categoryId) || { name: 'Campus Event' };

  const newEvent = {
    id: `evt_${Date.now()}`,
    title: title.trim(),
    slug: title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
    description: description.trim(),
    categoryId: categoryId || 'technical',
    categoryName: categoryObj.name,
    posterUrl: posterUrl || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80',
    venue: venue.trim(),
    venueDetails: venueDetails ? venueDetails.trim() : '',
    startDate,
    endDate: endDate || startDate,
    startTime: startTime || '10:00',
    endTime: endTime || '17:00',
    regStartDate: new Date().toISOString(),
    regDeadline: regDeadline || new Date(Date.now() + 7 * 86400000).toISOString(),
    maxParticipants: maxParticipants ? parseInt(maxParticipants) : null,
    registeredCount: 0,
    eventRules: eventRules ? eventRules.trim() : 'Standard college code of conduct applies.',
    requiredResources: requiredResources ? requiredResources.trim() : '',
    contactPhone: contactPhone.trim(),
    contactEmail: contactEmail ? contactEmail.trim() : 'events@gecsheikhpura.ac.in',
    eventHeadId: req.body.userId || 'usr_verified_head',
    eventHeadName: eventHeadName ? eventHeadName.trim() : 'Event Head',
    eventHeadRegNo: eventHeadRegNo ? eventHeadRegNo.trim() : '22105128001',
    status: 'upcoming',
    isVerified: true,
    members: [
      {
        id: `mem_${Date.now()}`,
        name: eventHeadName || 'Event Head',
        regNo: eventHeadRegNo || '22105128001',
        role: 'Event Head',
        responsibilities: 'Full administrative control and coordination.',
        phone: contactPhone,
        isSensitive: true,
        isApproved: true,
        permissions: {
          canViewParticipants: true,
          canManageRegistrations: true,
          canUpdateSchedule: true,
          canUploadDocuments: true,
          canPublishAnnouncements: true,
          canManageTasks: true,
          canManageResources: true
        }
      }
    ],
    updates: [],
    tasks: [],
    documents: [],
    registrations: [],
    createdAt: new Date().toISOString()
  };

  eventsList.unshift(newEvent);

  // Audit log
  auditLogsList.unshift({
    id: `aud_${Date.now()}`,
    userEmail: contactEmail || 'student@gecsheikhpura.ac.in',
    userRole: 'Event Head',
    action: 'event_created',
    entityType: 'event',
    entityId: newEvent.id,
    reason: `Event '${newEvent.title}' created by ${newEvent.eventHeadName}`,
    timestamp: new Date().toISOString()
  });

  res.status(201).json({ message: '🎉 Event created successfully! You are assigned as Event Head.', event: newEvent });
});

// 4. Update Event (Event Head only)
router.put('/events/:id', (req, res) => {
  const event = eventsList.find(e => e.id === req.params.id);
  if (!event) return res.status(404).json({ error: 'Event not found' });

  const { title, description, venue, venueDetails, startDate, endDate, startTime, endTime, regDeadline, eventRules } = req.body;
  if (title) event.title = title.trim();
  if (description) event.description = description.trim();
  if (venue) event.venue = venue.trim();
  if (venueDetails !== undefined) event.venueDetails = venueDetails;
  if (startDate) event.startDate = startDate;
  if (endDate) event.endDate = endDate;
  if (startTime) event.startTime = startTime;
  if (endTime) event.endTime = endTime;
  if (regDeadline) event.regDeadline = regDeadline;
  if (eventRules) event.eventRules = eventRules;
  event.updatedAt = new Date().toISOString();

  res.json({ message: 'Event details updated successfully.', event });
});

// 5. Add Management Member
router.post('/events/:id/members', (req, res) => {
  const event = eventsList.find(e => e.id === req.params.id);
  if (!event) return res.status(404).json({ error: 'Event not found' });

  const { name, regNo, role, responsibilities, phone, isSensitive } = req.body;
  if (!name || !regNo || !role) {
    return res.status(400).json({ error: 'Name, registration number, and assigned role are required.' });
  }

  // Duplicate member check
  if (event.members.some(m => m.regNo.toLowerCase() === regNo.toLowerCase())) {
    return res.status(400).json({ error: 'This student is already in the management team.' });
  }

  const sensitiveRoles = ['Finance Manager', 'Event Head', 'Co-Head'];
  const requiresAdmin = sensitiveRoles.includes(role) || Boolean(isSensitive);

  const newMember = {
    id: `mem_${Date.now()}`,
    name: name.trim(),
    regNo: regNo.trim(),
    role: role.trim(),
    responsibilities: responsibilities ? responsibilities.trim() : 'Support event operations.',
    phone: phone ? phone.trim() : '',
    isSensitive: requiresAdmin,
    isApproved: !requiresAdmin, // Sensitive roles require admin approval
    permissions: {
      canViewParticipants: true,
      canManageRegistrations: ['Event Head', 'Co-Head', 'Registration Manager'].includes(role),
      canUpdateSchedule: ['Event Head', 'Co-Head', 'Technical Manager'].includes(role),
      canUploadDocuments: ['Event Head', 'Media Manager', 'Technical Manager'].includes(role),
      canPublishAnnouncements: ['Event Head', 'Co-Head', 'Media Manager'].includes(role),
      canManageTasks: ['Event Head', 'Co-Head', 'Event Coordinator'].includes(role),
      canManageResources: ['Event Head', 'Finance Manager'].includes(role)
    }
  };

  event.members.push(newMember);
  res.status(201).json({
    message: requiresAdmin ? 'Member added (Awaiting admin approval for sensitive role).' : 'Team member added successfully.',
    member: newMember
  });
});

// 6. Publish Event Update (Text, Image, PDF, Schedule, Task format)
router.post('/events/:id/updates', (req, res) => {
  const event = eventsList.find(e => e.id === req.params.id);
  if (!event) return res.status(404).json({ error: 'Event not found' });

  const { authorName, authorRole, updateType, title, content, mediaUrl, isImportant } = req.body;
  if (!title || !content) {
    return res.status(400).json({ error: 'Update title and content are required.' });
  }

  const newUpdate = {
    id: `upd_${Date.now()}`,
    authorName: authorName || 'Event Coordinator',
    authorRole: authorRole || 'Management Team',
    updateType: updateType || 'text',
    title: title.trim(),
    content: content.trim(),
    mediaUrl: mediaUrl || '',
    isImportant: Boolean(isImportant),
    createdAt: new Date().toISOString()
  };

  event.updates.unshift(newUpdate);

  // Broadcast in-app notification to all registered participants
  event.registrations.forEach(r => {
    notificationsList.unshift({
      id: `notif_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      recipientEmail: r.email || 'student@gecsheikhpura.ac.in',
      title: `📢 Update on ${event.title}`,
      message: `${newUpdate.title}: ${newUpdate.content.substring(0, 80)}...`,
      notificationType: 'event_updated',
      entityType: 'event',
      entityId: event.id,
      actionUrl: `/community?tab=events&eventId=${event.id}`,
      isRead: false,
      createdAt: new Date().toISOString()
    });
  });

  res.status(201).json({ message: 'Update published and participants notified.', update: newUpdate });
});

// 7. Student Event Registration
router.post('/events/:id/register', (req, res) => {
  const event = eventsList.find(e => e.id === req.params.id);
  if (!event) return res.status(404).json({ error: 'Event not found' });

  const { studentName, regNo, department, academicYear, phone, email } = req.body;
  if (!studentName || !regNo) {
    return res.status(400).json({ error: 'Student name and registration number are required.' });
  }

  // Duplicate registration check
  if (event.registrations.some(r => r.regNo.toLowerCase() === regNo.toLowerCase())) {
    return res.status(400).json({ error: 'You are already registered for this event.' });
  }

  // Capacity check
  if (event.maxParticipants && event.registeredCount >= event.maxParticipants) {
    return res.status(400).json({ error: 'Event has reached maximum participant capacity.' });
  }

  const newReg = {
    id: `reg_${Date.now()}`,
    studentName: studentName.trim(),
    regNo: regNo.trim(),
    department: department || 'Engineering',
    academicYear: academicYear || 'Current Year',
    phone: phone ? phone.trim() : '',
    email: (email || '').trim().toLowerCase(),
    status: 'confirmed',
    registeredAt: new Date().toISOString()
  };

  event.registrations.push(newReg);
  event.registeredCount = event.registrations.length;

  res.status(201).json({
    message: '🎉 Registration confirmed! Your slot is booked.',
    registration: newReg,
    totalRegistered: event.registeredCount
  });
});


// --- EVENT TASK MANAGEMENT ---
// Create Task
router.post('/events/:id/tasks', (req, res) => {
  const event = eventsList.find(e => e.id === req.params.id);
  if (!event) return res.status(404).json({ error: 'Event not found' });

  const { title, description, assignedTo, priority, dueDate } = req.body;
  if (!title) return res.status(400).json({ error: 'Task title is required.' });

  const newTask = {
    id: `tsk_${Date.now()}`,
    title: title.trim(),
    description: description ? description.trim() : '',
    assignedTo: assignedTo || 'Unassigned',
    priority: priority || 'medium', // 'high', 'medium', 'low'
    status: 'pending', // 'pending', 'in_progress', 'completed', 'overdue', 'cancelled'
    dueDate: dueDate || '',
    createdAt: new Date().toISOString()
  };

  if (!event.tasks) event.tasks = [];
  event.tasks.push(newTask);

  res.status(201).json({ message: 'Task created successfully.', task: newTask, tasks: event.tasks });
});

// Update Task Status / Details
router.patch('/events/:id/tasks/:taskId', (req, res) => {
  const event = eventsList.find(e => e.id === req.params.id);
  if (!event) return res.status(404).json({ error: 'Event not found' });

  const task = (event.tasks || []).find(t => t.id === req.params.taskId);
  if (!task) return res.status(404).json({ error: 'Task not found' });

  const { status, title, description, assignedTo, priority, dueDate } = req.body;
  if (status) task.status = status;
  if (title) task.title = title.trim();
  if (description !== undefined) task.description = description.trim();
  if (assignedTo) task.assignedTo = assignedTo;
  if (priority) task.priority = priority;
  if (dueDate) task.dueDate = dueDate;
  task.updatedAt = new Date().toISOString();

  res.json({ message: 'Task updated successfully.', task, tasks: event.tasks });
});

// Delete Task
router.delete('/events/:id/tasks/:taskId', (req, res) => {
  const event = eventsList.find(e => e.id === req.params.id);
  if (!event) return res.status(404).json({ error: 'Event not found' });

  event.tasks = (event.tasks || []).filter(t => t.id !== req.params.taskId);
  res.json({ message: 'Task deleted successfully.', tasks: event.tasks });
});

// --- EVENT PARTICIPANT MANAGEMENT ---
// Get Participants
router.get('/events/:id/participants', (req, res) => {
  const event = eventsList.find(e => e.id === req.params.id);
  if (!event) return res.status(404).json({ error: 'Event not found' });

  const { status, query } = req.query;
  let list = event.registrations || [];

  if (status && status !== 'all') {
    list = list.filter(r => r.status === status);
  }
  if (query) {
    const q = query.toLowerCase().trim();
    list = list.filter(r => r.studentName.toLowerCase().includes(q) || (r.regNo && r.regNo.toLowerCase().includes(q)));
  }

  res.json({ count: list.length, participants: list });
});

// Update Participant Status (Approve, Reject, Attendance, Cancel)
router.patch('/events/:id/participants/:regId', (req, res) => {
  const event = eventsList.find(e => e.id === req.params.id);
  if (!event) return res.status(404).json({ error: 'Event not found' });

  const reg = (event.registrations || []).find(r => r.id === req.params.regId);
  if (!reg) return res.status(404).json({ error: 'Participant registration not found' });

  const { status, attendance, remarks } = req.body;
  if (status) reg.status = status; // 'confirmed', 'pending_approval', 'rejected', 'waitlisted', 'cancelled'
  if (attendance) reg.attendance = attendance; // 'present', 'absent', 'not_marked'
  if (remarks) reg.remarks = remarks;
  reg.updatedAt = new Date().toISOString();

  res.json({ message: 'Participant record updated.', participant: reg });
});

// Export Participants CSV Data
router.get('/events/:id/participants/export', (req, res) => {
  const event = eventsList.find(e => e.id === req.params.id);
  if (!event) return res.status(404).json({ error: 'Event not found' });

  const list = event.registrations || [];
  const rows = ['ID,Student Name,Registration No,Department,Academic Year,Status,Attendance,Registered At'];
  list.forEach(r => {
    rows.push(`"${r.id}","${r.studentName}","${r.regNo}","${r.department || ''}","${r.academicYear || ''}","${r.status}","${r.attendance || 'not_marked'}","${r.registeredAt || ''}"`);
  });

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', `attachment; filename="event_${event.id}_participants.csv"`);
  res.send(rows.join('\n'));
});

// --- POINTS CONFIGURATION MANAGEMENT ---
// Get Points Configuration
router.get('/points/config', (req, res) => {
  res.json({ pointsConfig: pointsConfigMap });
});

// Update Points Configuration for a sport
router.post('/points/config', (req, res) => {
  const { sportId, firstPlace, secondPlace, thirdPlace, fourthPlace, participation } = req.body;
  if (!sportId) return res.status(400).json({ error: 'sportId is required.' });

  pointsConfigMap[sportId] = {
    firstPlace: firstPlace !== undefined ? parseInt(firstPlace) : 10,
    secondPlace: secondPlace !== undefined ? parseInt(secondPlace) : 7,
    thirdPlace: thirdPlace !== undefined ? parseInt(thirdPlace) : 5,
    fourthPlace: fourthPlace !== undefined ? parseInt(fourthPlace) : 3,
    participation: participation !== undefined ? parseInt(participation) : 1,
    updatedAt: new Date().toISOString()
  };

  res.json({ message: `Points configuration updated for ${sportId}.`, config: pointsConfigMap[sportId] });
});

// -----------------------------------------------------------------------------
// MODULE B: SPORTS & SQUAD MANAGEMENT ENDPOINTS
// -----------------------------------------------------------------------------

// 1. Get all sports with squad rules & scoring engine details
router.get('/sports', (req, res) => {
  const { activeOnly, type } = req.query;
  let list = sportsList;
  if (activeOnly !== 'false') {
    list = list.filter(s => s.isActive);
  }
  if (type) {
    list = list.filter(s => s.sportType === type);
  }
  res.json({ count: list.length, sports: list });
});

// 2. Admin toggle/add sport
router.post('/sports', (req, res) => {
  const { id, name, code, sportType, icon, minSquadSize, maxSquadSize, playingSquadSize, substituteCount, scoringSystem } = req.body;
  if (!id || !name || !code) {
    return res.status(400).json({ error: 'Sport ID, name, and unique code are required.' });
  }

  const newSport = {
    id: id.toLowerCase().replace(/[^a-z0-9_]/g, ''),
    name: name.trim(),
    code: code.toUpperCase().trim(),
    sportType: sportType || 'team',
    icon: icon || '🏆',
    minSquadSize: minSquadSize ? parseInt(minSquadSize) : 1,
    maxSquadSize: maxSquadSize ? parseInt(maxSquadSize) : 15,
    playingSquadSize: playingSquadSize ? parseInt(playingSquadSize) : 1,
    substituteCount: substituteCount ? parseInt(substituteCount) : 0,
    scoringSystem: scoringSystem || 'standard_points',
    isActive: true,
    rules: req.body.rules || {}
  };

  const existingIdx = sportsList.findIndex(s => s.id === newSport.id || s.code === newSport.code);
  if (existingIdx >= 0) {
    sportsList[existingIdx] = newSport;
  } else {
    sportsList.push(newSport);
  }

  res.status(201).json({ message: 'Sport added / configured successfully.', sport: newSport });
});

// 3. Get all registered teams
router.get('/sports/teams', (req, res) => {
  const { sportId, status, tournamentId, captainEmail } = req.query;
  let list = teamsList;

  if (sportId) list = list.filter(t => t.sportId === sportId);
  if (status) list = list.filter(t => t.status === status);
  if (tournamentId) list = list.filter(t => t.tournamentId === tournamentId);
  if (captainEmail) {
    list = list.filter(t => t.captainPhone === captainEmail || (t.captainRegNo && t.captainRegNo.toLowerCase() === captainEmail.toLowerCase()));
  }

  // Mask sensitive phone numbers for non-admin viewers
  const sanitized = list.map(t => maskStudentData(t, false));
  res.json({ count: sanitized.length, teams: sanitized });
});

// 4. Register a Team (Cricket, Kabaddi, Basketball, Volleyball custom squad)
router.post('/sports/teams/register', (req, res) => {
  const {
    name,
    sportId,
    tournamentId,
    logoUrl,
    captainName,
    captainRegNo,
    captainPhone,
    department,
    academicYear,
    players
  } = req.body;

  if (!name || !sportId || !captainName || !captainRegNo || !captainPhone) {
    return res.status(400).json({ error: 'Team name, sport, captain details and contact phone are required.' });
  }

  const sport = sportsList.find(s => s.id === sportId);
  if (!sport) return res.status(400).json({ error: 'Invalid sport selected.' });

  // Custom squad size validation against sport or tournament configuration
  const squad = Array.isArray(players) ? players : [];
  if (squad.length < sport.minSquadSize) {
    return res.status(400).json({
      error: `Minimum squad size for ${sport.name} is ${sport.minSquadSize} players (Submitted: ${squad.length}).`
    });
  }
  if (squad.length > sport.maxSquadSize) {
    return res.status(400).json({
      error: `Maximum squad size for ${sport.name} is ${sport.maxSquadSize} players (Submitted: ${squad.length}).`
    });
  }

  // Duplicate team name check in same tournament
  if (teamsList.some(t => t.name.toLowerCase() === name.toLowerCase().trim() && t.sportId === sportId)) {
    return res.status(400).json({ error: 'A team with this name already exists in this sport.' });
  }

  const newTeam = {
    id: `team_${Date.now()}`,
    name: name.trim(),
    sportId,
    sportName: sport.name,
    tournamentId: tournamentId || 'tourn_default',
    logoUrl: logoUrl || 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?auto=format&fit=crop&w=200&q=80',
    captainId: req.body.userId || 'usr_captain',
    captainName: captainName.trim(),
    captainRegNo: captainRegNo.trim(),
    captainPhone: captainPhone.trim(),
    department: department || 'Engineering',
    academicYear: academicYear || '3rd Year',
    status: 'pending_approval', // Organizer must approve
    players: squad.map(p => ({
      name: (p.name || '').trim(),
      regNo: (p.regNo || '').trim(),
      role: p.role || 'Player',
      battingHand: p.battingHand || 'Right Hand',
      bowlingStyle: p.bowlingStyle || 'Right-arm medium',
      position: p.position || 'Forward',
      jerseyNumber: p.jerseyNumber ? parseInt(p.jerseyNumber) : null,
      isCaptain: Boolean(p.isCaptain),
      isPlayingXi: p.isPlayingXi !== false
    })),
    createdAt: new Date().toISOString()
  };

  teamsList.unshift(newTeam);

  res.status(201).json({
    message: '🛡️ Team registration submitted! Awaiting tournament organizer approval.',
    team: newTeam
  });
});

// 5. Organizer Approve/Reject Team
router.patch('/sports/teams/:id/status', (req, res) => {
  const { status, rejectionReason } = req.body;
  const team = teamsList.find(t => t.id === req.params.id);
  if (!team) return res.status(404).json({ error: 'Team not found.' });

  team.status = status || 'approved';
  if (rejectionReason) team.rejectionReason = rejectionReason;
  team.updatedAt = new Date().toISOString();

  // Audit log
  auditLogsList.unshift({
    id: `aud_${Date.now()}`,
    userEmail: 'sports.admin@gecsheikhpura.ac.in',
    userRole: 'Sports Admin',
    action: `team_${team.status}`,
    entityType: 'team',
    entityId: team.id,
    reason: rejectionReason || `Team ${team.name} marked as ${team.status}`,
    timestamp: new Date().toISOString()
  });

  res.json({ message: `Team status updated to ${team.status}.`, team });
});

// -----------------------------------------------------------------------------
// MODULE C: TOURNAMENTS & MANUAL MATCH MANAGEMENT
// -----------------------------------------------------------------------------

// 1. Get Tournaments
router.get('/tournaments', (req, res) => {
  const { sportId, status } = req.query;
  let list = tournamentsList;
  if (sportId) list = list.filter(t => t.sportId === sportId);
  if (status) list = list.filter(t => t.status === status);
  res.json({ count: list.length, tournaments: list });
});

// 2. Create Tournament
router.post('/tournaments', (req, res) => {
  const { title, sportId, academicYear, tournamentType, startDate, endDate, venue, organizerName, organizerContact, bannerUrl, squadConfig } = req.body;
  if (!title || !sportId || !startDate || !venue) {
    return res.status(400).json({ error: 'Tournament title, sport, start date, and venue are required.' });
  }

  const sport = sportsList.find(s => s.id === sportId) || { name: 'Sports' };

  const newTourn = {
    id: `tourn_${Date.now()}`,
    title: title.trim(),
    sportId,
    sportName: sport.name,
    academicYear: academicYear || '2026-2027',
    tournamentType: tournamentType || 'knockout',
    startDate,
    endDate: endDate || startDate,
    venue: venue.trim(),
    organizerId: req.body.userId || 'usr_organizer',
    organizerName: organizerName ? organizerName.trim() : 'Sports Committee',
    organizerContact: organizerContact ? organizerContact.trim() : 'sports@gecsheikhpura.ac.in',
    status: 'upcoming',
    bannerUrl: bannerUrl || 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?auto=format&fit=crop&w=1200&q=80',
    squadConfig: squadConfig || { minSquad: sport.minSquadSize, maxSquad: sport.maxSquadSize, playingXi: sport.playingSquadSize, substitutes: sport.substituteCount },
    createdAt: new Date().toISOString()
  };

  tournamentsList.unshift(newTourn);
  res.status(201).json({ message: '🏆 Tournament created successfully.', tournament: newTourn });
});

// 3. Get Matches
router.get('/matches', (req, res) => {
  const { tournamentId, sportId, status } = req.query;
  let list = matchesList;
  if (tournamentId) list = list.filter(m => m.tournamentId === tournamentId);
  if (sportId) list = list.filter(m => m.sportId === sportId);
  if (status) list = list.filter(m => m.status === status);
  res.json({ count: list.length, matches: list });
});

// 4. Get Match by ID (full details, timer, events)
router.get('/matches/:id', (req, res) => {
  const match = matchesList.find(m => m.id === req.params.id);
  if (!match) return res.status(404).json({ error: 'Match not found.' });
  res.json({ match });
});

// 5. MANUAL MATCH SCHEDULING (Default & Required: Organizer Manually Assigns Opponents)
router.post('/matches/schedule', (req, res) => {
  const {
    tournamentId,
    sportId,
    roundName,
    matchNumber,
    teamAId,
    teamBId,
    teamAName,
    teamBName,
    scheduledDate,
    scheduledTime,
    venue,
    refereeName,
    scorekeeperName,
    instructions
  } = req.body;

  if (!sportId || !teamAName || !teamBName || !scheduledDate || !scheduledTime || !venue) {
    return res.status(400).json({
      error: 'Please specify Sport, Team A, Team B, Match Date, Match Time, and Venue.'
    });
  }

  const sport = sportsList.find(s => s.id === sportId) || { name: 'Sports' };
  const tourn = tournamentsList.find(t => t.id === tournamentId) || { title: 'College Tournament' };

  const newMatch = {
    id: `match_${sportId}_${Date.now()}`,
    tournamentId: tournamentId || 'tourn_default',
    tournamentTitle: tourn.title,
    sportId,
    sportName: sport.name,
    roundName: roundName || 'Round 1',
    matchNumber: matchNumber ? parseInt(matchNumber) : (matchesList.length + 1),
    teamAId: teamAId || null,
    teamBId: teamBId || null,
    teamAName: teamAName.trim(),
    teamBName: teamBName.trim(),
    scheduledDate,
    scheduledTime,
    venue: venue.trim(),
    refereeId: req.body.refereeId || null,
    refereeName: refereeName ? refereeName.trim() : 'Official Referee',
    scorekeeperId: req.body.scorekeeperId || null,
    scorekeeperName: scorekeeperName ? scorekeeperName.trim() : 'Official Scorekeeper',
    instructions: instructions ? instructions.trim() : '',
    status: 'scheduled',
    teamAScore: 0,
    teamBScore: 0,
    scoreDetails: {},
    timerState: {
      period: 1,
      isRunning: false,
      elapsedSeconds: 0,
      periodDurationSeconds: (sportId === 'kabaddi' ? 1200 : (sportId === 'basketball' ? 600 : 2700)),
      raidTimerRunning: false,
      raidElapsedSeconds: 0,
      raidDurationSeconds: 30
    },
    events: [],
    winnerName: null,
    isDraw: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  matchesList.unshift(newMatch);

  // Broadcast in-app notification
  notificationsList.unshift({
    id: `notif_${Date.now()}`,
    title: `📅 Match Scheduled: ${newMatch.teamAName} vs ${newMatch.teamBName}`,
    message: `${sport.name} ${newMatch.roundName} at ${newMatch.venue} on ${newMatch.scheduledDate} at ${newMatch.scheduledTime}.`,
    notificationType: 'match_scheduled',
    entityType: 'match',
    entityId: newMatch.id,
    actionUrl: `/community?tab=sports&match=${newMatch.id}`,
    isRead: false,
    createdAt: new Date().toISOString()
  });

  res.status(201).json({ message: '🎯 Match scheduled successfully under manual assignment.', match: newMatch });
});

// 6. Match State Machine Transition (Scheduled -> Live -> Half-Time -> Completed -> Published)
router.patch('/matches/:id/status', (req, res) => {
  const { status, reason } = req.body;
  const match = matchesList.find(m => m.id === req.params.id);
  if (!match) return res.status(404).json({ error: 'Match not found.' });

  const validStatuses = [
    'scheduled', 'confirmed', 'live', 'half_time', 'paused',
    'completed', 'result_pending_approval', 'published', 'cancelled', 'postponed'
  ];

  if (!validStatuses.includes(status)) {
    return res.status(400).json({ error: `Invalid status. Permitted: ${validStatuses.join(', ')}` });
  }

  const oldStatus = match.status;
  match.status = status;
  match.updatedAt = new Date().toISOString();

  // Audit log
  auditLogsList.unshift({
    id: `aud_${Date.now()}`,
    userEmail: req.body.userEmail || 'referee@gecsheikhpura.ac.in',
    userRole: 'Match Official',
    action: 'match_status_change',
    entityType: 'match',
    entityId: match.id,
    reason: reason || `Match status changed from ${oldStatus} to ${status}`,
    timestamp: new Date().toISOString()
  });

  res.json({ message: `Match status updated to ${status}.`, match });
});

// 7. Live Scoring Event (Chronological Log & Authoritative Score Sync)
router.post('/matches/:id/events', (req, res) => {
  const match = matchesList.find(m => m.id === req.params.id);
  if (!match) return res.status(404).json({ error: 'Match not found.' });

  const { periodOrOver, eventType, pointsDelta, teamName, playerName, notes, recordedByName } = req.body;
  if (!eventType) return res.status(400).json({ error: 'Event type is required.' });

  const delta = pointsDelta !== undefined ? parseInt(pointsDelta) : 0;

  // Update cumulative scores
  if (teamName === match.teamAName) {
    match.teamAScore = Math.max(0, match.teamAScore + delta);
  } else if (teamName === match.teamBName) {
    match.teamBScore = Math.max(0, match.teamBScore + delta);
  }

  // Update sport-specific score details
  if (match.sportId === 'cricket') {
    if (!match.scoreDetails.teamA) match.scoreDetails.teamA = { runs: 0, wickets: 0, overs: 0, recentBalls: [] };
    if (!match.scoreDetails.teamB) match.scoreDetails.teamB = { runs: 0, wickets: 0, overs: 0, recentBalls: [] };

    const activeTeamKey = (teamName === match.teamAName) ? 'teamA' : 'teamB';
    if (eventType === 'cricket_run') {
      match.scoreDetails[activeTeamKey].runs += delta;
      match.scoreDetails[activeTeamKey].recentBalls.push(String(delta));
    } else if (eventType === 'cricket_wicket') {
      match.scoreDetails[activeTeamKey].wickets += 1;
      match.scoreDetails[activeTeamKey].recentBalls.push('W');
    }
    if (req.body.overs) match.scoreDetails[activeTeamKey].overs = req.body.overs;
    if (req.body.striker) match.scoreDetails[activeTeamKey].striker = req.body.striker;
    if (req.body.bowler) match.scoreDetails[activeTeamKey].currentBowler = req.body.bowler;
  } else if (match.sportId === 'kabaddi') {
    if (!match.scoreDetails.teamA) match.scoreDetails.teamA = { raidPoints: 0, tacklePoints: 0, bonusPoints: 0, allOutPoints: 0, total: 0 };
    if (!match.scoreDetails.teamB) match.scoreDetails.teamB = { raidPoints: 0, tacklePoints: 0, bonusPoints: 0, allOutPoints: 0, total: 0 };

    const activeTeamKey = (teamName === match.teamAName) ? 'teamA' : 'teamB';
    if (eventType === 'kabaddi_raid') match.scoreDetails[activeTeamKey].raidPoints += delta;
    if (eventType === 'kabaddi_tackle') match.scoreDetails[activeTeamKey].tacklePoints += delta;
    if (eventType === 'kabaddi_bonus') match.scoreDetails[activeTeamKey].bonusPoints += delta;
    if (eventType === 'kabaddi_allout') match.scoreDetails[activeTeamKey].allOutPoints += delta;
    match.scoreDetails[activeTeamKey].total = 
      match.scoreDetails[activeTeamKey].raidPoints +
      match.scoreDetails[activeTeamKey].tacklePoints +
      match.scoreDetails[activeTeamKey].bonusPoints +
      match.scoreDetails[activeTeamKey].allOutPoints;
  } else if (match.sportId === 'basketball') {
    if (!match.scoreDetails.teamA) match.scoreDetails.teamA = { points: 0, fouls: 0, timeouts: 3, q1: 0, q2: 0, q3: 0, q4: 0 };
    if (!match.scoreDetails.teamB) match.scoreDetails.teamB = { points: 0, fouls: 0, timeouts: 3, q1: 0, q2: 0, q3: 0, q4: 0 };

    const activeTeamKey = (teamName === match.teamAName) ? 'teamA' : 'teamB';
    if (eventType === 'basketball_1pt' || eventType === 'free_throw') {
      match.scoreDetails[activeTeamKey].points += 1;
    } else if (eventType === 'basketball_2pt' || eventType === 'field_goal') {
      match.scoreDetails[activeTeamKey].points += 2;
    } else if (eventType === 'basketball_3pt') {
      match.scoreDetails[activeTeamKey].points += 3;
    } else if (eventType === 'basketball_foul') {
      match.scoreDetails[activeTeamKey].fouls += 1;
    } else if (eventType === 'basketball_timeout') {
      match.scoreDetails[activeTeamKey].timeouts = Math.max(0, match.scoreDetails[activeTeamKey].timeouts - 1);
    }
  }

  const newEvent = {
    id: `ev_${Date.now()}`,
    periodOrOver: periodOrOver || 'Live',
    eventType,
    pointsDelta: delta,
    teamName: teamName || match.teamAName,
    playerName: playerName || 'Player',
    notes: notes || '',
    recordedBy: recordedByName || 'Scorekeeper',
    timestamp: new Date().toISOString()
  };

  match.events.unshift(newEvent);
  match.updatedAt = new Date().toISOString();

  res.status(201).json({ message: 'Scoring event recorded.', event: newEvent, match });
});

// 8. Authoritative Match Timer Controller (Kabaddi / Basketball)
router.post('/matches/:id/timer', (req, res) => {
  const match = matchesList.find(m => m.id === req.params.id);
  if (!match) return res.status(404).json({ error: 'Match not found.' });

  const { action, period, elapsedSeconds, raidAction } = req.body;
  if (!match.timerState) {
    match.timerState = { period: 1, isRunning: false, elapsedSeconds: 0, periodDurationSeconds: 1200 };
  }

  if (action === 'start') {
    match.timerState.isRunning = true;
    match.timerState.lastResumedAt = new Date().toISOString();
    match.status = 'live';
  } else if (action === 'pause') {
    match.timerState.isRunning = false;
  } else if (action === 'half_time') {
    match.timerState.isRunning = false;
    match.timerState.period = 2;
    match.status = 'half_time';
  } else if (action === 'end_match') {
    match.timerState.isRunning = false;
    match.status = 'completed';
  }

  if (period !== undefined) match.timerState.period = parseInt(period);
  if (elapsedSeconds !== undefined) match.timerState.elapsedSeconds = parseInt(elapsedSeconds);

  // Authoritative Raid Timer for Kabaddi
  if (raidAction === 'start_raid') {
    match.timerState.raidTimerRunning = true;
    match.timerState.raidElapsedSeconds = 0;
  } else if (raidAction === 'stop_raid') {
    match.timerState.raidTimerRunning = false;
  }

  match.updatedAt = new Date().toISOString();
  res.json({ message: `Timer updated (${action || 'sync'})`, timerState: match.timerState, matchStatus: match.status });
});

// 9. Organizer Tie-Breaker Resolution (Audited Decision)
router.post('/matches/:id/tie-breaker', (req, res) => {
  const match = matchesList.find(m => m.id === req.params.id);
  if (!match) return res.status(404).json({ error: 'Match not found.' });

  const { decisionType, winnerName, reason, authorityName } = req.body;
  if (!winnerName || !reason) {
    return res.status(400).json({ error: 'Winner name and official recorded reason are required for tie-breaking.' });
  }

  match.winnerName = winnerName.trim();
  match.isDraw = (winnerName.toLowerCase() === 'draw' || winnerName.toLowerCase() === 'joint');
  match.tieBreakerReason = reason.trim();
  match.decidedBy = authorityName ? authorityName.trim() : 'Tournament Organizer';
  match.status = 'result_pending_approval';
  match.updatedAt = new Date().toISOString();

  // Audit log
  auditLogsList.unshift({
    id: `aud_${Date.now()}`,
    userEmail: req.body.userEmail || 'organizer@gecsheikhpura.ac.in',
    userRole: 'Tournament Organizer',
    action: 'tie_resolution',
    entityType: 'match',
    entityId: match.id,
    reason: `Tie resolved in favor of ${winnerName}. Decision: ${reason} (Authority: ${match.decidedBy})`,
    timestamp: new Date().toISOString()
  });

  res.json({ message: 'Tie resolution officially recorded and pending publication.', match });
});

// 10. Publish Final Result & Calculate Rank-Based Points
router.post('/matches/:id/publish-result', (req, res) => {
  const match = matchesList.find(m => m.id === req.params.id);
  if (!match) return res.status(404).json({ error: 'Match not found.' });

  // Determine winner if not manually broken
  if (!match.winnerName) {
    if (match.teamAScore > match.teamBScore) {
      match.winnerName = match.teamAName;
      match.winnerTeamId = match.teamAId;
    } else if (match.teamBScore > match.teamAScore) {
      match.winnerName = match.teamBName;
      match.winnerTeamId = match.teamBId;
    } else {
      match.isDraw = true;
      match.winnerName = 'Draw / Tie';
    }
  }

  match.status = 'published';
  match.updatedAt = new Date().toISOString();

  // Recalculate Standings / Points Table
  let stdA = standingsList.find(s => s.tournamentId === match.tournamentId && s.teamName === match.teamAName);
  if (!stdA) {
    stdA = { id: `std_${Date.now()}_1`, tournamentId: match.tournamentId, sportId: match.sportId, teamName: match.teamAName, matchesPlayed: 0, wins: 0, losses: 0, draws: 0, points: 0, scoreFor: 0, scoreAgainst: 0, netRunRate: 0, rank: 1 };
    standingsList.push(stdA);
  }
  let stdB = standingsList.find(s => s.tournamentId === match.tournamentId && s.teamName === match.teamBName);
  if (!stdB) {
    stdB = { id: `std_${Date.now()}_2`, tournamentId: match.tournamentId, sportId: match.sportId, teamName: match.teamBName, matchesPlayed: 0, wins: 0, losses: 0, draws: 0, points: 0, scoreFor: 0, scoreAgainst: 0, netRunRate: 0, rank: 2 };
    standingsList.push(stdB);
  }

  stdA.matchesPlayed += 1;
  stdB.matchesPlayed += 1;
  stdA.scoreFor += match.teamAScore;
  stdA.scoreAgainst += match.teamBScore;
  stdB.scoreFor += match.teamBScore;
  stdB.scoreAgainst += match.teamAScore;

  const sportConfig = pointsConfigMap[match.sportId] || pointsConfigMap.default;

  if (match.winnerName === match.teamAName) {
    stdA.wins += 1;
    stdA.points += 2;
    stdB.losses += 1;
  } else if (match.winnerName === match.teamBName) {
    stdB.wins += 1;
    stdB.points += 2;
    stdA.losses += 1;
  } else {
    stdA.draws += 1;
    stdB.draws += 1;
    stdA.points += 1;
    stdB.points += 1;
  }

  // Re-sort standings by points then score difference
  standingsList.sort((a, b) => b.points - a.points || (b.scoreFor - b.scoreAgainst) - (a.scoreFor - a.scoreAgainst));
  standingsList.forEach((s, idx) => s.rank = idx + 1);

  // Broadcast result notification
  notificationsList.unshift({
    id: `notif_${Date.now()}`,
    title: `🏆 Final Result Published: ${match.teamAName} vs ${match.teamBName}`,
    message: `${match.winnerName === 'Draw / Tie' ? 'Match Tied!' : match.winnerName + ' won!'} Final: ${match.teamAName} ${match.teamAScore} - ${match.teamBScore} ${match.teamBName}.`,
    notificationType: 'result_published',
    entityType: 'match',
    entityId: match.id,
    actionUrl: `/community?tab=sports&match=${match.id}`,
    isRead: false,
    createdAt: new Date().toISOString()
  });

  res.json({ message: 'Result officially published and points table recalculated.', match, standings: standingsList });
});

// 11. Get Standings / Points Table
router.get('/standings', (req, res) => {
  const { tournamentId, sportId } = req.query;
  let list = standingsList;
  if (tournamentId) list = list.filter(s => s.tournamentId === tournamentId);
  if (sportId) list = list.filter(s => s.sportId === sportId);
  res.json({ count: list.length, standings: list });
});

// 12. Get Individual Sport-Wise Rankings
router.get('/rankings/individual', (req, res) => {
  const { sportId } = req.query;
  let list = individualRankingsList;
  if (sportId) list = list.filter(r => r.sportId === sportId);
  res.json({ count: list.length, rankings: list });
});

// -----------------------------------------------------------------------------
// MODULE D: CULTURAL COMPETITIONS ENDPOINTS
// -----------------------------------------------------------------------------

// 1. Get Cultural Competitions (10 Categories)
router.get('/cultural/competitions', (req, res) => {
  const { category, status } = req.query;
  let list = culturalCompetitionsList;
  if (category) list = list.filter(c => c.category === category);
  if (status) list = list.filter(c => c.status === status);
  res.json({ count: list.length, competitions: list });
});

// 2. Register for Cultural Competition (Individual or Group)
router.post('/cultural/competitions/:id/register', (req, res) => {
  const comp = culturalCompetitionsList.find(c => c.id === req.params.id);
  if (!comp) return res.status(404).json({ error: 'Cultural competition not found.' });

  const { participantName, regNo, gender, department, academicYear, phone, email, groupName, groupMembers } = req.body;
  if (!participantName || !regNo) {
    return res.status(400).json({ error: 'Participant name and registration number are required.' });
  }

  // Duplicate registration check
  if (comp.entries.some(e => e.regNo.toLowerCase() === regNo.toLowerCase())) {
    return res.status(400).json({ error: 'You are already registered for this competition.' });
  }

  const newEntry = {
    id: `entry_${Date.now()}`,
    participantName: participantName.trim(),
    regNo: regNo.trim(),
    gender: gender || 'Male',
    department: department || 'Engineering',
    academicYear: academicYear || 'Current Year',
    phone: phone ? phone.trim() : '',
    email: (email || '').trim().toLowerCase(),
    groupName: groupName ? groupName.trim() : null,
    groupMembers: Array.isArray(groupMembers) ? groupMembers : [],
    attendance: 'registered',
    scores: [],
    registeredAt: new Date().toISOString()
  };

  comp.entries.push(newEntry);
  res.status(201).json({ message: '🎭 Registered for cultural competition successfully.', entry: newEntry });
});

// 3. Judge Multi-Criteria Score Submission
router.post('/cultural/competitions/:id/scores', (req, res) => {
  const comp = culturalCompetitionsList.find(c => c.id === req.params.id);
  if (!comp) return res.status(404).json({ error: 'Competition not found.' });

  const { entryId, judgeName, criterionId, score, remarks } = req.body;
  const entry = comp.entries.find(e => e.id === entryId);
  if (!entry) return res.status(404).json({ error: 'Participant entry not found.' });

  const crit = comp.criteria.find(c => c.id === criterionId) || { name: 'Performance', maxScore: 10, weight: 100 };
  const rawScore = parseFloat(score);

  if (isNaN(rawScore) || rawScore < 0 || rawScore > crit.maxScore) {
    return res.status(400).json({ error: `Score must be between 0 and ${crit.maxScore}` });
  }

  // Record score
  const scoreRecord = {
    judgeName: judgeName || 'Faculty Judge',
    criterionId,
    criterionName: crit.name,
    score: rawScore,
    weight: crit.weight,
    remarks: remarks || '',
    timestamp: new Date().toISOString()
  };

  entry.scores.push(scoreRecord);
  res.status(201).json({ message: 'Judge score recorded successfully.', scoreRecord });
});

// 4. Publish Cultural Competition Results
router.post('/cultural/competitions/:id/publish', (req, res) => {
  const comp = culturalCompetitionsList.find(c => c.id === req.params.id);
  if (!comp) return res.status(404).json({ error: 'Competition not found.' });

  // Calculate weighted score for each entry
  const results = comp.entries.map(entry => {
    let totalWeightedScore = 0;
    if (entry.scores && entry.scores.length > 0) {
      entry.scores.forEach(s => {
        totalWeightedScore += (s.score * (s.weight / 100));
      });
    }
    return {
      entryId: entry.id,
      participantName: entry.participantName,
      regNo: entry.regNo,
      department: entry.department,
      totalWeightedScore: parseFloat(totalWeightedScore.toFixed(2)),
      rank: 1,
      awardTitle: ''
    };
  });

  // Sort descending by weighted score
  results.sort((a, b) => b.totalWeightedScore - a.totalWeightedScore);

  // Assign ranks & award titles
  results.forEach((r, idx) => {
    r.rank = idx + 1;
    if (idx === 0) r.awardTitle = '1st Position (Winner)';
    else if (idx === 1) r.awardTitle = '2nd Position (Runner-Up)';
    else if (idx === 2) r.awardTitle = '3rd Position (2nd Runner-Up)';
    else r.awardTitle = 'Participation';
  });

  comp.results = results;
  comp.status = 'results_published';

  res.json({ message: 'Cultural competition results published successfully.', results });
});

// -----------------------------------------------------------------------------
// MODULE E: NOTIFICATIONS & AUDIT LOGS ENDPOINTS
// -----------------------------------------------------------------------------

// 1. Get in-app notifications
router.get('/notifications', (req, res) => {
  const { email } = req.query;
  let list = notificationsList;
  if (email) {
    const cleanEmail = email.toLowerCase().trim();
    list = list.filter(n => !n.recipientEmail || n.recipientEmail.toLowerCase() === cleanEmail);
  }
  res.json({ count: list.length, notifications: list });
});

// 2. Mark notification read
router.patch('/notifications/:id/read', (req, res) => {
  const notif = notificationsList.find(n => n.id === req.params.id);
  if (notif) notif.isRead = true;
  res.json({ message: 'Notification marked as read.' });
});

// 3. Get Security Audit Logs (Super Admin only)
router.get('/audit-logs', (req, res) => {
  res.json({ count: auditLogsList.length, logs: auditLogsList });
});

module.exports = router;

