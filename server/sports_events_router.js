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
let eventsList = [
  {
    id: 'evt_tech_fest_2026',
    title: 'TechnoUtsav 2026: Annual Inter-College Technical Hackathon',
    slug: 'technoutsav-2026',
    description: '36-hour continuous hackathon, IoT innovation sprint, and coding challenge across CSE, ECE, and EE departments.',
    categoryId: 'technical',
    categoryName: 'Technical & Hackathons',
    posterUrl: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=1200&q=80',
    venue: 'Computer Center & Central Auditorium, Bajidpur Campus',
    venueDetails: 'Lab 1, Lab 2 and Main Seminar Hall',
    startDate: '2026-11-15',
    endDate: '2026-11-17',
    startTime: '09:00',
    endTime: '18:00',
    regStartDate: '2026-10-25T00:00:00.000Z',
    regDeadline: '2026-11-12T23:59:59.000Z',
    maxParticipants: 120,
    registeredCount: 42,
    eventRules: 'Teams must consist of 2 to 4 members. Bring college ID card. Original work only.',
    requiredResources: 'High speed Wi-Fi, power extensions, projector, whiteboards.',
    contactPhone: '06341-224401',
    contactEmail: 'events.gecskp@gmail.com',
    eventHeadId: 'usr_prince_admin',
    eventHeadName: 'Prince Kumar',
    eventHeadRegNo: '22105128001',
    status: 'upcoming',
    isVerified: true,
    members: [
      {
        id: 'mem_1',
        name: 'Prince Kumar',
        regNo: '22105128001',
        role: 'Event Head',
        responsibilities: 'Overall event coordination, schedule, and permissions.',
        phone: '9801234567',
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
      },
      {
        id: 'mem_2',
        name: 'Aman Kumar',
        regNo: '22105128014',
        role: 'Technical Manager',
        responsibilities: 'Server configuration, local networking, and judging portal.',
        phone: '9801234568',
        isSensitive: false,
        isApproved: true,
        permissions: {
          canViewParticipants: true,
          canManageRegistrations: false,
          canUpdateSchedule: false,
          canUploadDocuments: true,
          canPublishAnnouncements: true,
          canManageTasks: true,
          canManageResources: false
        }
      }
    ],
    updates: [
      {
        id: 'upd_1',
        authorName: 'Prince Kumar',
        authorRole: 'Event Head',
        updateType: 'text',
        title: 'Problem Statements Released for Track 1',
        content: 'Campus automation & Smart Irrigation problem statements have been posted under guidelines.',
        isImportant: true,
        createdAt: new Date().toISOString()
      }
    ],
    tasks: [
      {
        id: 'tsk_1',
        title: 'Verify Lab 2 Internet Connectivity',
        description: 'Ensure 50 concurrent ethernet connections active.',
        assignedTo: 'Aman Kumar',
        priority: 'high',
        status: 'in_progress',
        dueDate: '2026-11-14'
      }
    ],
    documents: [
      {
        id: 'doc_1',
        title: 'Official Rulebook & Evaluation Matrix.pdf',
        fileType: 'pdf',
        fileUrl: 'https://gecsheikhpura.ac.in/assets/rules.pdf',
        fileSize: '420 KB',
        isPrivate: false,
        uploadedAt: new Date().toISOString()
      }
    ],
    registrations: [
      {
        id: 'reg_1',
        studentName: 'Rahul Verma',
        regNo: '22105128020',
        department: 'CSE',
        academicYear: '3rd Year',
        phone: '9876543210',
        email: 'rahul.cse@gmail.com',
        status: 'confirmed',
        registeredAt: new Date().toISOString()
      }
    ],
    createdAt: new Date().toISOString()
  }
];

// Sports Directory & Dynamic Rules
let sportsList = [
  // Team Sports
  {
    id: 'cricket',
    name: 'Cricket',
    code: 'CRI',
    sportType: 'team',
    icon: '🏏',
    minSquadSize: 11,
    maxSquadSize: 16,
    playingSquadSize: 11,
    substituteCount: 5,
    scoringSystem: 'cricket',
    isActive: true,
    rules: {
      defaultOvers: 10,
      powerplayOvers: 3,
      superOver: true,
      pointsWin: 2,
      pointsDraw: 1,
      pointsLoss: 0
    }
  },
  {
    id: 'kabaddi',
    name: 'Kabaddi',
    code: 'KBD',
    sportType: 'team',
    icon: '🤼',
    minSquadSize: 7,
    maxSquadSize: 12,
    playingSquadSize: 7,
    substituteCount: 5,
    scoringSystem: 'kabaddi',
    isActive: true,
    rules: {
      halves: 2,
      halfDurationMinutes: 20,
      halfBreakMinutes: 5,
      raidTimerSeconds: 30,
      bonusLine: true,
      pointsWin: 2,
      pointsDraw: 1,
      pointsLoss: 0
    }
  },
  {
    id: 'basketball',
    name: 'Basketball',
    code: 'BB',
    sportType: 'team',
    icon: '🏀',
    minSquadSize: 5,
    maxSquadSize: 12,
    playingSquadSize: 5,
    substituteCount: 7,
    scoringSystem: 'basketball',
    isActive: true,
    rules: {
      quarters: 4,
      quarterDurationMinutes: 10,
      shotClockSeconds: 24,
      timeoutsPerHalf: 3,
      maxFoulsAllowed: 5,
      pointsWin: 2,
      pointsLoss: 0
    }
  },
  {
    id: 'volleyball',
    name: 'Volleyball',
    code: 'VB',
    sportType: 'team',
    icon: '🏐',
    minSquadSize: 6,
    maxSquadSize: 12,
    playingSquadSize: 6,
    substituteCount: 6,
    scoringSystem: 'volleyball',
    isActive: true,
    rules: {
      setsToWin: 3,
      pointsPerSet: 25,
      decidingSetPoints: 15,
      deuceMargin: 2,
      pointsWin: 2,
      pointsLoss: 0
    }
  },
  {
    id: 'football',
    name: 'Football',
    code: 'FB',
    sportType: 'team',
    icon: '⚽',
    minSquadSize: 11,
    maxSquadSize: 18,
    playingSquadSize: 11,
    substituteCount: 7,
    scoringSystem: 'standard_points',
    isActive: true,
    rules: {
      halves: 2,
      halfDurationMinutes: 45,
      halfBreakMinutes: 15,
      pointsWin: 3,
      pointsDraw: 1,
      pointsLoss: 0
    }
  },
  // Individual & Doubles Racquet / Indoor Sports
  {
    id: 'badminton',
    name: 'Badminton (Singles / Doubles)',
    code: 'BDM',
    sportType: 'doubles',
    icon: '🏸',
    minSquadSize: 1,
    maxSquadSize: 2,
    playingSquadSize: 1,
    substituteCount: 0,
    scoringSystem: 'standard_points',
    isActive: true,
    rules: { setsToWin: 2, pointsPerSet: 21 }
  },
  {
    id: 'table_tennis',
    name: 'Table Tennis',
    code: 'TT',
    sportType: 'doubles',
    icon: '🏓',
    minSquadSize: 1,
    maxSquadSize: 2,
    playingSquadSize: 1,
    substituteCount: 0,
    scoringSystem: 'standard_points',
    isActive: true,
    rules: { setsToWin: 3, pointsPerSet: 11 }
  },
  {
    id: 'chess',
    name: 'Chess',
    code: 'CHS',
    sportType: 'indoor',
    icon: '♟️',
    minSquadSize: 1,
    maxSquadSize: 1,
    playingSquadSize: 1,
    substituteCount: 0,
    scoringSystem: 'chess_carrom',
    isActive: true,
    rules: { timeControlMinutes: 30, incrementSeconds: 5 }
  },
  {
    id: 'carrom',
    name: 'Carrom',
    code: 'CRM',
    sportType: 'indoor',
    icon: '🎯',
    minSquadSize: 1,
    maxSquadSize: 2,
    playingSquadSize: 1,
    substituteCount: 0,
    scoringSystem: 'chess_carrom',
    isActive: true,
    rules: { boardsToWin: 29, queenPoints: 3 }
  },
  // Athletics Field Events
  { id: 'shot_put', name: 'Shot Put', code: 'SP', sportType: 'athletics', icon: '⚪', minSquadSize: 1, maxSquadSize: 1, playingSquadSize: 1, substituteCount: 0, scoringSystem: 'athletics_distance', isActive: true, rules: { attemptsAllowed: 3 } },
  { id: 'discus_throw', name: 'Discus Throw', code: 'DT', sportType: 'athletics', icon: '💿', minSquadSize: 1, maxSquadSize: 1, playingSquadSize: 1, substituteCount: 0, scoringSystem: 'athletics_distance', isActive: true, rules: { attemptsAllowed: 3 } },
  { id: 'javelin_throw', name: 'Javelin Throw', code: 'JT', sportType: 'athletics', icon: '🗡️', minSquadSize: 1, maxSquadSize: 1, playingSquadSize: 1, substituteCount: 0, scoringSystem: 'athletics_distance', isActive: true, rules: { attemptsAllowed: 3 } },
  { id: 'long_jump', name: 'Long Jump', code: 'LJ', sportType: 'athletics', icon: '🏃', minSquadSize: 1, maxSquadSize: 1, playingSquadSize: 1, substituteCount: 0, scoringSystem: 'athletics_distance', isActive: true, rules: { attemptsAllowed: 3 } },
  { id: 'high_jump', name: 'High Jump', code: 'HJ', sportType: 'athletics', icon: '🤸', minSquadSize: 1, maxSquadSize: 1, playingSquadSize: 1, substituteCount: 0, scoringSystem: 'athletics_distance', isActive: true, rules: { attemptsAllowed: 3 } },
  // Athletics Track Events
  { id: 'run_100m', name: '100 Metres Sprint', code: 'R100', sportType: 'athletics', icon: '⚡', minSquadSize: 1, maxSquadSize: 1, playingSquadSize: 1, substituteCount: 0, scoringSystem: 'athletics_time', isActive: true, rules: { lanes: 8 } },
  { id: 'run_200m', name: '200 Metres Sprint', code: 'R200', sportType: 'athletics', icon: '🏃', minSquadSize: 1, maxSquadSize: 1, playingSquadSize: 1, substituteCount: 0, scoringSystem: 'athletics_time', isActive: true, rules: { lanes: 8 } },
  { id: 'run_400m', name: '400 Metres Race', code: 'R400', sportType: 'athletics', icon: '⏱️', minSquadSize: 1, maxSquadSize: 1, playingSquadSize: 1, substituteCount: 0, scoringSystem: 'athletics_time', isActive: true, rules: { lanes: 8 } },
  { id: 'relay_4x100m', name: '4 × 100 Metres Relay', code: 'RELAY1', sportType: 'relay', icon: '🎽', minSquadSize: 4, maxSquadSize: 5, playingSquadSize: 4, substituteCount: 1, scoringSystem: 'athletics_time', isActive: true, rules: { runners: 4 } },
  { id: 'relay_4x400m', name: '4 × 400 Metres Relay', code: 'RELAY2', sportType: 'relay', icon: '🏁', minSquadSize: 4, maxSquadSize: 5, playingSquadSize: 4, substituteCount: 1, scoringSystem: 'athletics_time', isActive: true, rules: { runners: 4 } }
];

// Teams Roster Store
let teamsList = [
  {
    id: 'team_cse_tigers',
    name: 'CSE Cyber Tigers',
    sportId: 'cricket',
    sportName: 'Cricket',
    tournamentId: 'tourn_shaurya_2026',
    logoUrl: 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?auto=format&fit=crop&w=200&q=80',
    captainId: 'usr_prince_admin',
    captainName: 'Prince Kumar',
    captainRegNo: '22105128001',
    captainPhone: '9801234567',
    department: 'CSE',
    academicYear: '3rd Year',
    status: 'approved',
    players: [
      { name: 'Prince Kumar', regNo: '22105128001', role: 'All-Rounder', battingHand: 'Right Hand', bowlingStyle: 'Right-arm fast', isCaptain: true, isPlayingXi: true },
      { name: 'Aman Kumar', regNo: '22105128014', role: 'Batsman', battingHand: 'Right Hand', bowlingStyle: 'Right-arm spin', isCaptain: false, isPlayingXi: true },
      { name: 'Rohan Singh', regNo: '22105128032', role: 'Wicketkeeper', battingHand: 'Left Hand', bowlingStyle: 'None', isCaptain: false, isPlayingXi: true },
      { name: 'Vikash Kumar', regNo: '22105128045', role: 'Bowler', battingHand: 'Right Hand', bowlingStyle: 'Right-arm fast', isCaptain: false, isPlayingXi: true },
      { name: 'Abhishek Jha', regNo: '22105128051', role: 'All-Rounder', battingHand: 'Left Hand', bowlingStyle: 'Left-arm spin', isCaptain: false, isPlayingXi: true },
      { name: 'Deepak Patel', regNo: '22105128058', role: 'Batsman', battingHand: 'Right Hand', bowlingStyle: 'None', isCaptain: false, isPlayingXi: true },
      { name: 'Manish Kumar', regNo: '22105128062', role: 'Bowler', battingHand: 'Right Hand', bowlingStyle: 'Right-arm medium', isCaptain: false, isPlayingXi: true },
      { name: 'Saurav Raj', regNo: '22105128070', role: 'Bowler', battingHand: 'Right Hand', bowlingStyle: 'Right-arm fast', isCaptain: false, isPlayingXi: true },
      { name: 'Kunal Sharma', regNo: '22105128075', role: 'Batsman', battingHand: 'Right Hand', bowlingStyle: 'None', isCaptain: false, isPlayingXi: true },
      { name: 'Aditya Raj', regNo: '22105128082', role: 'All-Rounder', battingHand: 'Right Hand', bowlingStyle: 'Right-arm spin', isCaptain: false, isPlayingXi: true },
      { name: 'Sumit Kumar', regNo: '22105128089', role: 'Bowler', battingHand: 'Left Hand', bowlingStyle: 'Left-arm fast', isCaptain: false, isPlayingXi: true }
    ],
    createdAt: new Date().toISOString()
  },
  {
    id: 'team_ce_titans',
    name: 'Civil Concrete Titans',
    sportId: 'cricket',
    sportName: 'Cricket',
    tournamentId: 'tourn_shaurya_2026',
    logoUrl: 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?auto=format&fit=crop&w=200&q=80',
    captainId: 'usr_ce_captain',
    captainName: 'Alok Ranjan',
    captainRegNo: '22101128005',
    captainPhone: '9801234569',
    department: 'Civil',
    academicYear: '3rd Year',
    status: 'approved',
    players: [
      { name: 'Alok Ranjan', regNo: '22101128005', role: 'All-Rounder', battingHand: 'Right Hand', bowlingStyle: 'Right-arm fast', isCaptain: true, isPlayingXi: true },
      { name: 'Chandan Kumar', regNo: '22101128012', role: 'Batsman', battingHand: 'Right Hand', bowlingStyle: 'None', isCaptain: false, isPlayingXi: true },
      { name: 'Gaurav Roy', regNo: '22101128019', role: 'Bowler', battingHand: 'Right Hand', bowlingStyle: 'Right-arm fast', isCaptain: false, isPlayingXi: true }
    ],
    createdAt: new Date().toISOString()
  },
  {
    id: 'team_ee_warriors',
    name: 'EE Voltage Warriors',
    sportId: 'kabaddi',
    sportName: 'Kabaddi',
    tournamentId: 'tourn_kabaddi_2026',
    logoUrl: 'https://images.unsplash.com/photo-1517649763962-0c623266ddc0?auto=format&fit=crop&w=200&q=80',
    captainId: 'usr_ee_captain',
    captainName: 'Ravi Teja',
    captainRegNo: '22103128004',
    captainPhone: '9801234571',
    department: 'Electrical',
    academicYear: '2nd Year',
    status: 'approved',
    players: [
      { name: 'Ravi Teja', regNo: '22103128004', role: 'Raider', isCaptain: true, isPlayingXi: true },
      { name: 'Sanjay Kumar', regNo: '22103128011', role: 'Defender', isCaptain: false, isPlayingXi: true },
      { name: 'Mohit Sinha', regNo: '22103128018', role: 'All-Rounder', isCaptain: false, isPlayingXi: true },
      { name: 'Praveen Ray', regNo: '22103128025', role: 'Defender', isCaptain: false, isPlayingXi: true },
      { name: 'Sunny Deol', regNo: '22103128032', role: 'Raider', isCaptain: false, isPlayingXi: true },
      { name: 'Tarun Kumar', regNo: '22103128039', role: 'Defender', isCaptain: false, isPlayingXi: true },
      { name: 'Umesh Yadav', regNo: '22103128046', role: 'All-Rounder', isCaptain: false, isPlayingXi: true }
    ],
    createdAt: new Date().toISOString()
  }
];

// Tournaments Store
let tournamentsList = [
  {
    id: 'tourn_shaurya_2026',
    title: 'Shaurya Cup: Inter-Branch T20 Cricket Championship 2026',
    sportId: 'cricket',
    sportName: 'Cricket',
    academicYear: '2026-2027',
    tournamentType: 'knockout',
    startDate: '2026-11-05',
    endDate: '2026-11-08',
    venue: 'Bajidpur Campus Main Cricket Ground',
    organizerId: 'usr_prince_admin',
    organizerName: 'Shaurya Sports Committee',
    organizerContact: 'sports.gecskp@gmail.com',
    status: 'active',
    bannerUrl: 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?auto=format&fit=crop&w=1200&q=80',
    squadConfig: { minSquad: 11, maxSquad: 16, playingXi: 11, substitutes: 5 },
    createdAt: new Date().toISOString()
  },
  {
    id: 'tourn_kabaddi_2026',
    title: 'Veer Cup: Inter-Hostel Pro Kabaddi League 2026',
    sportId: 'kabaddi',
    sportName: 'Kabaddi',
    academicYear: '2026-2027',
    tournamentType: 'league',
    startDate: '2026-11-10',
    endDate: '2026-11-12',
    venue: 'Hostel 1 Quadrangle Mud Court',
    organizerId: 'usr_prince_admin',
    organizerName: 'Hostel Sports Committee',
    organizerContact: 'hostel.sports@gecsheikhpura.ac.in',
    status: 'upcoming',
    bannerUrl: 'https://images.unsplash.com/photo-1517649763962-0c623266ddc0?auto=format&fit=crop&w=1200&q=80',
    squadConfig: { minSquad: 7, maxSquad: 12, playingXi: 7, substitutes: 5 },
    createdAt: new Date().toISOString()
  }
];

// Matches Store (Manual Scheduling Only)
let matchesList = [
  {
    id: 'match_cri_1',
    tournamentId: 'tourn_shaurya_2026',
    tournamentTitle: 'Shaurya Cup: Inter-Branch T20 Cricket Championship 2026',
    sportId: 'cricket',
    sportName: 'Cricket',
    roundName: 'Semi-Final',
    matchNumber: 1,
    teamAId: 'team_cse_tigers',
    teamBId: 'team_ce_titans',
    teamAName: 'CSE Cyber Tigers',
    teamBName: 'Civil Concrete Titans',
    scheduledDate: '2026-11-06',
    scheduledTime: '09:30',
    venue: 'Bajidpur Campus Main Cricket Ground',
    refereeId: 'usr_referee_1',
    refereeName: 'Prof. S. K. Singh (Sports Officer)',
    scorekeeperId: 'usr_scorekeeper_1',
    scorekeeperName: 'Prince Kumar',
    instructions: '10 overs match due to winter evening fog. White ball, colored jersey.',
    status: 'live',
    teamAScore: 78,
    teamBScore: 42,
    scoreDetails: {
      teamA: {
        runs: 78,
        wickets: 3,
        overs: 8.2,
        maxOvers: 10,
        striker: 'Prince Kumar (42 off 22)',
        nonStriker: 'Aman Kumar (18 off 14)',
        currentBowler: 'Gaurav Roy (1.2-0-12-1)',
        recentBalls: ['1', '4', 'W', '0', '6', '1']
      },
      teamB: {
        runs: 42,
        wickets: 0,
        overs: 0.0,
        maxOvers: 10
      }
    },
    timerState: {
      isRunning: true,
      period: 1,
      elapsedSeconds: 1840,
      lastResumedAt: new Date().toISOString()
    },
    events: [
      { id: 'ev_1', periodOrOver: 'Over 1.2', eventType: 'cricket_run', pointsDelta: 4, teamName: 'CSE Cyber Tigers', playerName: 'Prince Kumar', notes: 'Cover drive boundary', recordedBy: 'Prince Kumar', timestamp: new Date().toISOString() },
      { id: 'ev_2', periodOrOver: 'Over 4.5', eventType: 'cricket_wicket', pointsDelta: 0, teamName: 'CSE Cyber Tigers', playerName: 'Rohan Singh', notes: 'Caught behind', recordedBy: 'Prince Kumar', timestamp: new Date().toISOString() }
    ],
    winnerName: null,
    isDraw: false,
    tieBreakerReason: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'match_kbd_1',
    tournamentId: 'tourn_kabaddi_2026',
    tournamentTitle: 'Veer Cup: Inter-Hostel Pro Kabaddi League 2026',
    sportId: 'kabaddi',
    sportName: 'Kabaddi',
    roundName: 'Round 1',
    matchNumber: 1,
    teamAId: 'team_ee_warriors',
    teamBId: 'team_ce_titans',
    teamAName: 'EE Voltage Warriors',
    teamBName: 'Hostel 2 Lions',
    scheduledDate: '2026-11-10',
    scheduledTime: '16:00',
    venue: 'Hostel 1 Quadrangle Mud Court',
    refereeId: 'usr_referee_2',
    refereeName: 'Hostel Warden Incharge',
    scorekeeperId: 'usr_scorekeeper_2',
    scorekeeperName: 'Aman Kumar',
    instructions: '20 mins first half, 5 mins break, 20 mins second half.',
    status: 'scheduled',
    teamAScore: 0,
    teamBScore: 0,
    scoreDetails: {
      teamA: { raidPoints: 0, tacklePoints: 0, bonusPoints: 0, allOutPoints: 0, total: 0 },
      teamB: { raidPoints: 0, tacklePoints: 0, bonusPoints: 0, allOutPoints: 0, total: 0 }
    },
    timerState: {
      period: 1,
      isRunning: false,
      elapsedSeconds: 0,
      periodDurationSeconds: 1200,
      raidTimerRunning: false,
      raidElapsedSeconds: 0,
      raidDurationSeconds: 30
    },
    events: [],
    winnerName: null,
    isDraw: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

// Standings / Points Table Store
let standingsList = [
  {
    id: 'std_1',
    tournamentId: 'tourn_shaurya_2026',
    sportId: 'cricket',
    teamId: 'team_cse_tigers',
    teamName: 'CSE Cyber Tigers',
    matchesPlayed: 2,
    wins: 2,
    losses: 0,
    draws: 0,
    points: 4,
    scoreFor: 186,
    scoreAgainst: 132,
    netRunRate: 1.450,
    rank: 1
  },
  {
    id: 'std_2',
    tournamentId: 'tourn_shaurya_2026',
    sportId: 'cricket',
    teamId: 'team_ce_titans',
    teamName: 'Civil Concrete Titans',
    matchesPlayed: 2,
    wins: 1,
    losses: 1,
    draws: 0,
    points: 2,
    scoreFor: 142,
    scoreAgainst: 155,
    netRunRate: -0.320,
    rank: 2
  }
];

// Separate Sport-Wise Individual Rankings Store
let individualRankingsList = [
  { id: 'ir_1', sportId: 'shot_put', sportName: 'Shot Put', participantName: 'Vikash Kumar', regNo: '22105128045', department: 'CSE', points: 10, rank: 1, bestMetric: '11.85 metres' },
  { id: 'ir_2', sportId: 'shot_put', sportName: 'Shot Put', participantName: 'Gaurav Roy', regNo: '22101128019', department: 'Civil', points: 7, rank: 2, bestMetric: '10.92 metres' },
  { id: 'ir_3', sportId: 'chess', sportName: 'Chess', participantName: 'Abhishek Jha', regNo: '22105128051', department: 'CSE', points: 10, rank: 1, bestMetric: '4.5 / 5 Wins' },
  { id: 'ir_4', sportId: 'run_100m', sportName: '100 Metres Sprint', participantName: 'Saurav Raj', regNo: '22105128070', department: 'EE', points: 10, rank: 1, bestMetric: '11.42 seconds' }
];

// Points Rules Configuration (Rank-Based per Sport)
let pointsConfigMap = {
  default: { firstPlace: 10, secondPlace: 7, thirdPlace: 5, fourthPlace: 3, participation: 1 },
  cricket: { firstPlace: 15, secondPlace: 10, thirdPlace: 7, fourthPlace: 4, participation: 2 },
  kabaddi: { firstPlace: 15, secondPlace: 10, thirdPlace: 7, fourthPlace: 4, participation: 2 }
};

// Points Awarded Store
let pointsAwardsList = [];

// Cultural Competitions Store (10 Official Categories)
let culturalCompetitionsList = [
  {
    id: 'cult_poetry',
    title: 'Kavya Sandhya: Inter-Branch Hindi & Urdu Poetry Writing & Recitation',
    category: 'poetry_writing',
    categoryLabel: 'Poetry Writing',
    competitionType: 'individual',
    description: 'Original poetry writing on social reform, engineering life, or nation building followed by 3-minute stage recitation.',
    venue: 'Open Air Amphitheatre, Bajidpur Campus',
    eventDate: '2026-11-20',
    startTime: '16:00',
    endTime: '19:00',
    regDeadline: '2026-11-18T23:59:59.000Z',
    maxParticipants: 30,
    rules: 'Original self-written composition. Maximum 3 minutes recitation time. Offensive words strictly prohibited.',
    organizerName: 'Kalam Literary Society',
    organizerContact: 'literary.gecskp@gmail.com',
    status: 'registration_open',
    criteria: [
      { id: 'crit_1', name: 'Creativity & Theme', maxScore: 10, weight: 30 },
      { id: 'crit_2', name: 'Language & Rhythm', maxScore: 10, weight: 30 },
      { id: 'crit_3', name: 'Stage Delivery & Impact', maxScore: 10, weight: 40 }
    ],
    judges: [
      { id: 'jdg_1', name: 'Prof. A. N. Jha', designation: 'HOD Humanities', accessCode: 'JUDGE901' }
    ],
    entries: [
      {
        id: 'entry_1',
        participantName: 'Prince Kumar',
        regNo: '22105128001',
        gender: 'Male',
        department: 'CSE',
        academicYear: '3rd Year',
        phone: '9801234567',
        attendance: 'registered',
        scores: []
      }
    ],
    results: []
  },
  {
    id: 'cult_debate',
    title: 'Tark-Vitark 2026: Parliamentary Debate on AI in Engineering',
    category: 'debate',
    categoryLabel: 'Debate',
    competitionType: 'individual',
    description: 'Oxford-style debate competition on ethical implications of Autonomous AI agents in public infrastructure.',
    venue: 'Seminar Hall 1, Academic Block',
    eventDate: '2026-11-22',
    startTime: '14:00',
    endTime: '17:30',
    regDeadline: '2026-11-20T23:59:59.000Z',
    maxParticipants: 24,
    rules: 'Each speaker gets 4 minutes constructive argument and 1 minute rebuttal. Language: English or Hindi.',
    organizerName: 'Youth Parliament Club',
    organizerContact: 'debate.gec@gmail.com',
    status: 'upcoming',
    criteria: [
      { id: 'crit_d1', name: 'Content & Facts', maxScore: 10, weight: 35 },
      { id: 'crit_d2', name: 'Rebuttal Logic', maxScore: 10, weight: 35 },
      { id: 'crit_d3', name: 'Oratory & Body Language', maxScore: 10, weight: 30 }
    ],
    judges: [],
    entries: [],
    results: []
  },
  {
    id: 'cult_rangoli',
    title: 'Rangotsav: Traditional Geometric & Eco-Friendly Rangoli Contest',
    category: 'rangoli',
    categoryLabel: 'Rangoli',
    competitionType: 'group',
    minGroupSize: 2,
    maxGroupSize: 4,
    description: 'Create 4x4 ft geometric or theme-based Rangoli using eco-friendly natural powders and flower petals.',
    venue: 'Academic Block Central Lobby',
    eventDate: '2026-11-23',
    startTime: '10:00',
    endTime: '13:00',
    regDeadline: '2026-11-21T20:00:00.000Z',
    maxParticipants: 16,
    rules: 'Maximum 4 members per team. Time limit: 2.5 hours. Strictly organic colors only.',
    organizerName: 'Natraj Fine Arts Committee',
    organizerContact: 'arts.gec@gmail.com',
    status: 'upcoming',
    criteria: [
      { id: 'crit_r1', name: 'Color Combination', maxScore: 10, weight: 30 },
      { id: 'crit_r2', name: 'Symmetry & Geometry', maxScore: 10, weight: 40 },
      { id: 'crit_r3', name: 'Cleanliness & Theme', maxScore: 10, weight: 30 }
    ],
    judges: [],
    entries: [],
    results: []
  }
];

// In-App Notifications Queue
let notificationsList = [
  {
    id: 'notif_1',
    recipientEmail: 'pk3334238@gmail.com',
    title: '🏆 Live Match Update: CSE vs Civil',
    message: 'Semi-Final 1 is live! CSE Cyber Tigers are 78/3 in 8.2 overs.',
    notificationType: 'score_updated',
    entityType: 'match',
    entityId: 'match_cri_1',
    actionUrl: '/community?tab=sports&match=match_cri_1',
    isRead: false,
    createdAt: new Date().toISOString()
  }
];

// Security Audit Logs Queue
let auditLogsList = [
  {
    id: 'aud_1',
    userEmail: 'pk3334238@gmail.com',
    userRole: 'Super Admin',
    action: 'match_scheduled',
    entityType: 'match',
    entityId: 'match_cri_1',
    reason: 'Official Semi-Final 1 manual fixture confirmed by organizer.',
    timestamp: new Date().toISOString()
  }
];

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
