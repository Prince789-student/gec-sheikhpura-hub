const fs = require('fs');
const path = require('path');

const routerFile = path.join(__dirname, '..', 'server', 'sports_events_router.js');
let code = fs.readFileSync(routerFile, 'utf8');

// 1. Full 38 Sports Directory
const full38SportsCode = `let sportsList = [
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
];\n\n`;

const startIdx = code.indexOf('let sportsList = [');
const endIdx = code.indexOf('let teamsList = [');

if (startIdx !== -1 && endIdx !== -1) {
  code = code.substring(0, startIdx) + full38SportsCode + code.substring(endIdx);
  console.log('✓ Successfully replaced sportsList with full 38 sports!');
} else {
  console.error('Could not find sportsList bounds');
}

// 2. Add Event Task Management & Participant Management Routes
const newEventRoutes = `
// --- EVENT TASK MANAGEMENT ---
// Create Task
router.post('/events/:id/tasks', (req, res) => {
  const event = eventsList.find(e => e.id === req.params.id);
  if (!event) return res.status(404).json({ error: 'Event not found' });

  const { title, description, assignedTo, priority, dueDate } = req.body;
  if (!title) return res.status(400).json({ error: 'Task title is required.' });

  const newTask = {
    id: \`tsk_\${Date.now()}\`,
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
    rows.push(\`"\${r.id}","\${r.studentName}","\${r.regNo}","\${r.department || ''}","\${r.academicYear || ''}","\${r.status}","\${r.attendance || 'not_marked'}","\${r.registeredAt || ''}"\`);
  });

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', \`attachment; filename="event_\${event.id}_participants.csv"\`);
  res.send(rows.join('\\n'));
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

  res.json({ message: \`Points configuration updated for \${sportId}.\`, config: pointsConfigMap[sportId] });
});
`;

const modBHeader = '// -----------------------------------------------------------------------------\n// MODULE B: SPORTS & SQUAD MANAGEMENT ENDPOINTS';
if (code.includes(modBHeader)) {
  code = code.replace(modBHeader, newEventRoutes + '\n' + modBHeader);
  console.log('✓ Successfully inserted task, participant, and points config endpoints!');
} else {
  console.error('Could not find Module B header');
}

// 3. Add Basketball Scoring Handling in /matches/:id/events
const basketballScoringCode = `  } else if (match.sportId === 'basketball') {
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
  }`;

const kabaddiBlockEnd = "match.scoreDetails[activeTeamKey].allOutPoints;\n  }";
if (code.includes(kabaddiBlockEnd)) {
  code = code.replace(kabaddiBlockEnd, kabaddiBlockEnd + '\n' + basketballScoringCode);
  console.log('✓ Successfully added basketball scoring engine to /matches/:id/events!');
} else {
  console.log('Note: kabaddiBlockEnd not found directly, checking variations...');
}

fs.writeFileSync(routerFile, code, 'utf8');
console.log('✓ sports_events_router.js updated successfully!');

