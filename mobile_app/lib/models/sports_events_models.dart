import 'dart:convert';

// --- MODULE A: STUDENT EVENTS MODELS ---

class EventPermissions {
  final bool canViewParticipants;
  final bool canManageRegistrations;
  final bool canUpdateSchedule;
  final bool canUploadDocuments;
  final bool canPublishAnnouncements;
  final bool canManageTasks;
  final bool canManageResources;

  const EventPermissions({
    this.canViewParticipants = true,
    this.canManageRegistrations = false,
    this.canUpdateSchedule = false,
    this.canUploadDocuments = false,
    this.canPublishAnnouncements = false,
    this.canManageTasks = false,
    this.canManageResources = false,
  });

  factory EventPermissions.fromMap(Map<String, dynamic> map) {
    return EventPermissions(
      canViewParticipants: map['canViewParticipants'] ?? true,
      canManageRegistrations: map['canManageRegistrations'] ?? false,
      canUpdateSchedule: map['canUpdateSchedule'] ?? false,
      canUploadDocuments: map['canUploadDocuments'] ?? false,
      canPublishAnnouncements: map['canPublishAnnouncements'] ?? false,
      canManageTasks: map['canManageTasks'] ?? false,
      canManageResources: map['canManageResources'] ?? false,
    );
  }

  Map<String, dynamic> toMap() => {
    'canViewParticipants': canViewParticipants,
    'canManageRegistrations': canManageRegistrations,
    'canUpdateSchedule': canUpdateSchedule,
    'canUploadDocuments': canUploadDocuments,
    'canPublishAnnouncements': canPublishAnnouncements,
    'canManageTasks': canManageTasks,
    'canManageResources': canManageResources,
  };
}

class EventMember {
  final String id;
  final String name;
  final String regNo;
  final String role;
  final String responsibilities;
  final String phone;
  final bool isSensitive;
  final bool isApproved;
  final EventPermissions permissions;

  const EventMember({
    required this.id,
    required this.name,
    required this.regNo,
    required this.role,
    required this.responsibilities,
    required this.phone,
    this.isSensitive = false,
    this.isApproved = true,
    this.permissions = const EventPermissions(),
  });

  factory EventMember.fromMap(Map<String, dynamic> map) {
    return EventMember(
      id: map['id']?.toString() ?? '',
      name: map['name']?.toString() ?? '',
      regNo: map['regNo']?.toString() ?? '',
      role: map['role']?.toString() ?? 'Volunteer',
      responsibilities: map['responsibilities']?.toString() ?? '',
      phone: map['phone']?.toString() ?? '',
      isSensitive: map['isSensitive'] ?? false,
      isApproved: map['isApproved'] ?? true,
      permissions: map['permissions'] is Map
          ? EventPermissions.fromMap(Map<String, dynamic>.from(map['permissions']))
          : const EventPermissions(),
    );
  }
}

class EventUpdateItem {
  final String id;
  final String authorName;
  final String authorRole;
  final String updateType; // 'text', 'image', 'pdf', 'task', 'schedule'
  final String title;
  final String content;
  final String mediaUrl;
  final bool isImportant;
  final String createdAt;

  const EventUpdateItem({
    required this.id,
    required this.authorName,
    required this.authorRole,
    required this.updateType,
    required this.title,
    required this.content,
    required this.mediaUrl,
    required this.isImportant,
    required this.createdAt,
  });

  factory EventUpdateItem.fromMap(Map<String, dynamic> map) {
    return EventUpdateItem(
      id: map['id']?.toString() ?? '',
      authorName: map['authorName']?.toString() ?? 'Coordinator',
      authorRole: map['authorRole']?.toString() ?? 'Management Team',
      updateType: map['updateType']?.toString() ?? 'text',
      title: map['title']?.toString() ?? '',
      content: map['content']?.toString() ?? '',
      mediaUrl: map['mediaUrl']?.toString() ?? '',
      isImportant: map['isImportant'] ?? false,
      createdAt: map['createdAt']?.toString() ?? '',
    );
  }
}

class EventTaskItem {
  final String id;
  final String title;
  final String description;
  final String assignedTo;
  final String priority;
  final String status;
  final String dueDate;

  const EventTaskItem({
    required this.id,
    required this.title,
    required this.description,
    required this.assignedTo,
    required this.priority,
    required this.status,
    required this.dueDate,
  });

  factory EventTaskItem.fromMap(Map<String, dynamic> map) {
    return EventTaskItem(
      id: map['id']?.toString() ?? '',
      title: map['title']?.toString() ?? '',
      description: map['description']?.toString() ?? '',
      assignedTo: map['assignedTo']?.toString() ?? '',
      priority: map['priority']?.toString() ?? 'medium',
      status: map['status']?.toString() ?? 'pending',
      dueDate: map['dueDate']?.toString() ?? '',
    );
  }
}

class StudentEvent {
  final String id;
  final String title;
  final String slug;
  final String description;
  final String categoryId;
  final String categoryName;
  final String posterUrl;
  final String venue;
  final String venueDetails;
  final String startDate;
  final String endDate;
  final String startTime;
  final String endTime;
  final String regDeadline;
  final int? maxParticipants;
  final int registeredCount;
  final String eventRules;
  final String requiredResources;
  final String contactPhone;
  final String contactEmail;
  final String eventHeadName;
  final String eventHeadRegNo;
  final String status; // 'upcoming', 'ongoing', 'completed', 'cancelled'
  final bool isVerified;
  final List<EventMember> members;
  final List<EventUpdateItem> updates;
  final List<EventTaskItem> tasks;

  const StudentEvent({
    required this.id,
    required this.title,
    required this.slug,
    required this.description,
    required this.categoryId,
    required this.categoryName,
    required this.posterUrl,
    required this.venue,
    required this.venueDetails,
    required this.startDate,
    required this.endDate,
    required this.startTime,
    required this.endTime,
    required this.regDeadline,
    this.maxParticipants,
    required this.registeredCount,
    required this.eventRules,
    required this.requiredResources,
    required this.contactPhone,
    required this.contactEmail,
    required this.eventHeadName,
    required this.eventHeadRegNo,
    required this.status,
    required this.isVerified,
    required this.members,
    required this.updates,
    required this.tasks,
  });

  factory StudentEvent.fromMap(Map<String, dynamic> map) {
    final membersList = (map['members'] as List?)
            ?.map((m) => EventMember.fromMap(Map<String, dynamic>.from(m)))
            .toList() ??
        [];
    final updatesList = (map['updates'] as List?)
            ?.map((u) => EventUpdateItem.fromMap(Map<String, dynamic>.from(u)))
            .toList() ??
        [];
    final tasksList = (map['tasks'] as List?)
            ?.map((t) => EventTaskItem.fromMap(Map<String, dynamic>.from(t)))
            .toList() ??
        [];

    return StudentEvent(
      id: map['id']?.toString() ?? '',
      title: map['title']?.toString() ?? '',
      slug: map['slug']?.toString() ?? '',
      description: map['description']?.toString() ?? '',
      categoryId: map['categoryId']?.toString() ?? 'technical',
      categoryName: map['categoryName']?.toString() ?? 'Technical',
      posterUrl: map['posterUrl']?.toString() ?? '',
      venue: map['venue']?.toString() ?? '',
      venueDetails: map['venueDetails']?.toString() ?? '',
      startDate: map['startDate']?.toString() ?? '',
      endDate: map['endDate']?.toString() ?? '',
      startTime: map['startTime']?.toString() ?? '',
      endTime: map['endTime']?.toString() ?? '',
      regDeadline: map['regDeadline']?.toString() ?? '',
      maxParticipants: map['maxParticipants'] != null ? int.tryParse(map['maxParticipants'].toString()) : null,
      registeredCount: map['registeredCount'] != null ? int.tryParse(map['registeredCount'].toString()) ?? 0 : 0,
      eventRules: map['eventRules']?.toString() ?? '',
      requiredResources: map['requiredResources']?.toString() ?? '',
      contactPhone: map['contactPhone']?.toString() ?? '',
      contactEmail: map['contactEmail']?.toString() ?? '',
      eventHeadName: map['eventHeadName']?.toString() ?? '',
      eventHeadRegNo: map['eventHeadRegNo']?.toString() ?? '',
      status: map['status']?.toString() ?? 'upcoming',
      isVerified: map['isVerified'] ?? true,
      members: membersList,
      updates: updatesList,
      tasks: tasksList,
    );
  }
}

// --- MODULE B: SPORTS & SQUADS MODELS ---

class SportItem {
  final String id;
  final String name;
  final String code;
  final String sportType; // 'team', 'individual', 'doubles', 'relay', 'athletics', 'indoor'
  final String icon;
  final int minSquadSize;
  final int maxSquadSize;
  final int playingSquadSize;
  final int substituteCount;
  final String scoringSystem;
  final bool isActive;

  const SportItem({
    required this.id,
    required this.name,
    required this.code,
    required this.sportType,
    required this.icon,
    required this.minSquadSize,
    required this.maxSquadSize,
    required this.playingSquadSize,
    required this.substituteCount,
    required this.scoringSystem,
    this.isActive = true,
  });

  factory SportItem.fromMap(Map<String, dynamic> map) {
    return SportItem(
      id: map['id']?.toString() ?? '',
      name: map['name']?.toString() ?? '',
      code: map['code']?.toString() ?? '',
      sportType: map['sportType']?.toString() ?? 'team',
      icon: map['icon']?.toString() ?? '🏆',
      minSquadSize: int.tryParse(map['minSquadSize']?.toString() ?? '1') ?? 1,
      maxSquadSize: int.tryParse(map['maxSquadSize']?.toString() ?? '15') ?? 15,
      playingSquadSize: int.tryParse(map['playingSquadSize']?.toString() ?? '1') ?? 1,
      substituteCount: int.tryParse(map['substituteCount']?.toString() ?? '0') ?? 0,
      scoringSystem: map['scoringSystem']?.toString() ?? 'standard_points',
      isActive: map['isActive'] ?? true,
    );
  }
}

class TeamPlayer {
  final String name;
  final String regNo;
  final String role;
  final String battingHand;
  final String bowlingStyle;
  final String position;
  final int? jerseyNumber;
  final bool isCaptain;
  final bool isPlayingXi;

  const TeamPlayer({
    required this.name,
    required this.regNo,
    required this.role,
    this.battingHand = 'Right Hand',
    this.bowlingStyle = 'None',
    this.position = 'Forward',
    this.jerseyNumber,
    this.isCaptain = false,
    this.isPlayingXi = true,
  });

  factory TeamPlayer.fromMap(Map<String, dynamic> map) {
    return TeamPlayer(
      name: map['name']?.toString() ?? '',
      regNo: map['regNo']?.toString() ?? '',
      role: map['role']?.toString() ?? 'Player',
      battingHand: map['battingHand']?.toString() ?? 'Right Hand',
      bowlingStyle: map['bowlingStyle']?.toString() ?? 'None',
      position: map['position']?.toString() ?? 'Forward',
      jerseyNumber: map['jerseyNumber'] != null ? int.tryParse(map['jerseyNumber'].toString()) : null,
      isCaptain: map['isCaptain'] ?? false,
      isPlayingXi: map['isPlayingXi'] ?? true,
    );
  }

  Map<String, dynamic> toMap() => {
    'name': name,
    'regNo': regNo,
    'role': role,
    'battingHand': battingHand,
    'bowlingStyle': bowlingStyle,
    'position': position,
    'jerseyNumber': jerseyNumber,
    'isCaptain': isCaptain,
    'isPlayingXi': isPlayingXi,
  };
}

class SportsTeam {
  final String id;
  final String name;
  final String sportId;
  final String sportName;
  final String tournamentId;
  final String logoUrl;
  final String captainName;
  final String captainRegNo;
  final String captainPhone;
  final String department;
  final String academicYear;
  final String status; // 'pending_approval', 'approved', 'rejected'
  final List<TeamPlayer> players;

  const SportsTeam({
    required this.id,
    required this.name,
    required this.sportId,
    required this.sportName,
    required this.tournamentId,
    required this.logoUrl,
    required this.captainName,
    required this.captainRegNo,
    required this.captainPhone,
    required this.department,
    required this.academicYear,
    required this.status,
    required this.players,
  });

  factory SportsTeam.fromMap(Map<String, dynamic> map) {
    final pList = (map['players'] as List?)
            ?.map((p) => TeamPlayer.fromMap(Map<String, dynamic>.from(p)))
            .toList() ??
        [];

    return SportsTeam(
      id: map['id']?.toString() ?? '',
      name: map['name']?.toString() ?? '',
      sportId: map['sportId']?.toString() ?? 'cricket',
      sportName: map['sportName']?.toString() ?? 'Cricket',
      tournamentId: map['tournamentId']?.toString() ?? '',
      logoUrl: map['logoUrl']?.toString() ?? '',
      captainName: map['captainName']?.toString() ?? '',
      captainRegNo: map['captainRegNo']?.toString() ?? '',
      captainPhone: map['captainPhone']?.toString() ?? '',
      department: map['department']?.toString() ?? '',
      academicYear: map['academicYear']?.toString() ?? '',
      status: map['status']?.toString() ?? 'pending_approval',
      players: pList,
    );
  }
}

// --- MODULE C: TOURNAMENTS & MATCHES MODELS ---

class Tournament {
  final String id;
  final String title;
  final String sportId;
  final String sportName;
  final String academicYear;
  final String tournamentType;
  final String startDate;
  final String endDate;
  final String venue;
  final String organizerName;
  final String organizerContact;
  final String status;
  final String bannerUrl;

  const Tournament({
    required this.id,
    required this.title,
    required this.sportId,
    required this.sportName,
    required this.academicYear,
    required this.tournamentType,
    required this.startDate,
    required this.endDate,
    required this.venue,
    required this.organizerName,
    required this.organizerContact,
    required this.status,
    required this.bannerUrl,
  });

  factory Tournament.fromMap(Map<String, dynamic> map) {
    return Tournament(
      id: map['id']?.toString() ?? '',
      title: map['title']?.toString() ?? '',
      sportId: map['sportId']?.toString() ?? '',
      sportName: map['sportName']?.toString() ?? 'Tournament',
      academicYear: map['academicYear']?.toString() ?? '2026-2027',
      tournamentType: map['tournamentType']?.toString() ?? 'knockout',
      startDate: map['startDate']?.toString() ?? '',
      endDate: map['endDate']?.toString() ?? '',
      venue: map['venue']?.toString() ?? '',
      organizerName: map['organizerName']?.toString() ?? '',
      organizerContact: map['organizerContact']?.toString() ?? '',
      status: map['status']?.toString() ?? 'upcoming',
      bannerUrl: map['bannerUrl']?.toString() ?? '',
    );
  }
}

class MatchEvent {
  final String id;
  final String periodOrOver;
  final String eventType;
  final int pointsDelta;
  final String teamName;
  final String playerName;
  final String notes;
  final String recordedBy;
  final String timestamp;

  const MatchEvent({
    required this.id,
    required this.periodOrOver,
    required this.eventType,
    required this.pointsDelta,
    required this.teamName,
    required this.playerName,
    required this.notes,
    required this.recordedBy,
    required this.timestamp,
  });

  factory MatchEvent.fromMap(Map<String, dynamic> map) {
    return MatchEvent(
      id: map['id']?.toString() ?? '',
      periodOrOver: map['periodOrOver']?.toString() ?? '',
      eventType: map['eventType']?.toString() ?? '',
      pointsDelta: int.tryParse(map['pointsDelta']?.toString() ?? '0') ?? 0,
      teamName: map['teamName']?.toString() ?? '',
      playerName: map['playerName']?.toString() ?? '',
      notes: map['notes']?.toString() ?? '',
      recordedBy: map['recordedBy']?.toString() ?? '',
      timestamp: map['timestamp']?.toString() ?? '',
    );
  }
}

class MatchTimerState {
  final int period;
  final bool isRunning;
  final int elapsedSeconds;
  final int periodDurationSeconds;
  final bool raidTimerRunning;
  final int raidElapsedSeconds;
  final int raidDurationSeconds;

  const MatchTimerState({
    this.period = 1,
    this.isRunning = false,
    this.elapsedSeconds = 0,
    this.periodDurationSeconds = 1200,
    this.raidTimerRunning = false,
    this.raidElapsedSeconds = 0,
    this.raidDurationSeconds = 30,
  });

  factory MatchTimerState.fromMap(Map<String, dynamic> map) {
    return MatchTimerState(
      period: int.tryParse(map['period']?.toString() ?? '1') ?? 1,
      isRunning: map['isRunning'] ?? false,
      elapsedSeconds: int.tryParse(map['elapsedSeconds']?.toString() ?? '0') ?? 0,
      periodDurationSeconds: int.tryParse(map['periodDurationSeconds']?.toString() ?? '1200') ?? 1200,
      raidTimerRunning: map['raidTimerRunning'] ?? false,
      raidElapsedSeconds: int.tryParse(map['raidElapsedSeconds']?.toString() ?? '0') ?? 0,
      raidDurationSeconds: int.tryParse(map['raidDurationSeconds']?.toString() ?? '30') ?? 30,
    );
  }
}

class TournamentMatch {
  final String id;
  final String tournamentId;
  final String tournamentTitle;
  final String sportId;
  final String sportName;
  final String roundName;
  final int matchNumber;
  final String teamAName;
  final String teamBName;
  final String scheduledDate;
  final String scheduledTime;
  final String venue;
  final String refereeName;
  final String scorekeeperName;
  final String instructions;
  final String status; // 'scheduled', 'confirmed', 'live', 'half_time', 'completed', 'published'
  final int teamAScore;
  final int teamBScore;
  final Map<String, dynamic> scoreDetails;
  final MatchTimerState timerState;
  final List<MatchEvent> events;
  final String? winnerName;
  final bool isDraw;
  final String? tieBreakerReason;

  const TournamentMatch({
    required this.id,
    required this.tournamentId,
    required this.tournamentTitle,
    required this.sportId,
    required this.sportName,
    required this.roundName,
    required this.matchNumber,
    required this.teamAName,
    required this.teamBName,
    required this.scheduledDate,
    required this.scheduledTime,
    required this.venue,
    required this.refereeName,
    required this.scorekeeperName,
    required this.instructions,
    required this.status,
    required this.teamAScore,
    required this.teamBScore,
    required this.scoreDetails,
    required this.timerState,
    required this.events,
    this.winnerName,
    this.isDraw = false,
    this.tieBreakerReason,
  });

  factory TournamentMatch.fromMap(Map<String, dynamic> map) {
    final eList = (map['events'] as List?)
            ?.map((e) => MatchEvent.fromMap(Map<String, dynamic>.from(e)))
            .toList() ??
        [];
    final tState = map['timerState'] is Map
        ? MatchTimerState.fromMap(Map<String, dynamic>.from(map['timerState']))
        : const MatchTimerState();

    return TournamentMatch(
      id: map['id']?.toString() ?? '',
      tournamentId: map['tournamentId']?.toString() ?? '',
      tournamentTitle: map['tournamentTitle']?.toString() ?? 'Tournament Match',
      sportId: map['sportId']?.toString() ?? 'cricket',
      sportName: map['sportName']?.toString() ?? 'Cricket',
      roundName: map['roundName']?.toString() ?? 'Round 1',
      matchNumber: int.tryParse(map['matchNumber']?.toString() ?? '1') ?? 1,
      teamAName: map['teamAName']?.toString() ?? 'Team A',
      teamBName: map['teamBName']?.toString() ?? 'Team B',
      scheduledDate: map['scheduledDate']?.toString() ?? '',
      scheduledTime: map['scheduledTime']?.toString() ?? '',
      venue: map['venue']?.toString() ?? '',
      refereeName: map['refereeName']?.toString() ?? 'Referee',
      scorekeeperName: map['scorekeeperName']?.toString() ?? 'Scorekeeper',
      instructions: map['instructions']?.toString() ?? '',
      status: map['status']?.toString() ?? 'scheduled',
      teamAScore: int.tryParse(map['teamAScore']?.toString() ?? '0') ?? 0,
      teamBScore: int.tryParse(map['teamBScore']?.toString() ?? '0') ?? 0,
      scoreDetails: map['scoreDetails'] is Map ? Map<String, dynamic>.from(map['scoreDetails']) : {},
      timerState: tState,
      events: eList,
      winnerName: map['winnerName']?.toString(),
      isDraw: map['isDraw'] ?? false,
      tieBreakerReason: map['tieBreakerReason']?.toString(),
    );
  }
}

class TournamentStanding {
  final String id;
  final String tournamentId;
  final String sportId;
  final String teamName;
  final int matchesPlayed;
  final int wins;
  final int losses;
  final int draws;
  final int points;
  final int scoreFor;
  final int scoreAgainst;
  final double netRunRate;
  final int rank;

  const TournamentStanding({
    required this.id,
    required this.tournamentId,
    required this.sportId,
    required this.teamName,
    required this.matchesPlayed,
    required this.wins,
    required this.losses,
    required this.draws,
    required this.points,
    required this.scoreFor,
    required this.scoreAgainst,
    required this.netRunRate,
    required this.rank,
  });

  factory TournamentStanding.fromMap(Map<String, dynamic> map) {
    return TournamentStanding(
      id: map['id']?.toString() ?? '',
      tournamentId: map['tournamentId']?.toString() ?? '',
      sportId: map['sportId']?.toString() ?? '',
      teamName: map['teamName']?.toString() ?? '',
      matchesPlayed: int.tryParse(map['matchesPlayed']?.toString() ?? '0') ?? 0,
      wins: int.tryParse(map['wins']?.toString() ?? '0') ?? 0,
      losses: int.tryParse(map['losses']?.toString() ?? '0') ?? 0,
      draws: int.tryParse(map['draws']?.toString() ?? '0') ?? 0,
      points: int.tryParse(map['points']?.toString() ?? '0') ?? 0,
      scoreFor: int.tryParse(map['scoreFor']?.toString() ?? '0') ?? 0,
      scoreAgainst: int.tryParse(map['scoreAgainst']?.toString() ?? '0') ?? 0,
      netRunRate: double.tryParse(map['netRunRate']?.toString() ?? '0.0') ?? 0.0,
      rank: int.tryParse(map['rank']?.toString() ?? '1') ?? 1,
    );
  }
}

class IndividualRanking {
  final String id;
  final String sportId;
  final String sportName;
  final String participantName;
  final String regNo;
  final String department;
  final int points;
  final int rank;
  final String bestMetric;

  const IndividualRanking({
    required this.id,
    required this.sportId,
    required this.sportName,
    required this.participantName,
    required this.regNo,
    required this.department,
    required this.points,
    required this.rank,
    required this.bestMetric,
  });

  factory IndividualRanking.fromMap(Map<String, dynamic> map) {
    return IndividualRanking(
      id: map['id']?.toString() ?? '',
      sportId: map['sportId']?.toString() ?? '',
      sportName: map['sportName']?.toString() ?? '',
      participantName: map['participantName']?.toString() ?? '',
      regNo: map['regNo']?.toString() ?? '',
      department: map['department']?.toString() ?? '',
      points: int.tryParse(map['points']?.toString() ?? '0') ?? 0,
      rank: int.tryParse(map['rank']?.toString() ?? '1') ?? 1,
      bestMetric: map['bestMetric']?.toString() ?? '',
    );
  }
}

// --- MODULE D: CULTURAL COMPETITIONS MODELS ---

class JudgingCriterion {
  final String id;
  final String name;
  final double maxScore;
  final double weight;

  const JudgingCriterion({
    required this.id,
    required this.name,
    required this.maxScore,
    required this.weight,
  });

  factory JudgingCriterion.fromMap(Map<String, dynamic> map) {
    return JudgingCriterion(
      id: map['id']?.toString() ?? '',
      name: map['name']?.toString() ?? '',
      maxScore: double.tryParse(map['maxScore']?.toString() ?? '10.0') ?? 10.0,
      weight: double.tryParse(map['weight']?.toString() ?? '20.0') ?? 20.0,
    );
  }
}

class CompetitionEntry {
  final String id;
  final String participantName;
  final String regNo;
  final String gender;
  final String department;
  final String academicYear;
  final String phone;
  final String? groupName;
  final String attendance;

  const CompetitionEntry({
    required this.id,
    required this.participantName,
    required this.regNo,
    required this.gender,
    required this.department,
    required this.academicYear,
    required this.phone,
    this.groupName,
    required this.attendance,
  });

  factory CompetitionEntry.fromMap(Map<String, dynamic> map) {
    return CompetitionEntry(
      id: map['id']?.toString() ?? '',
      participantName: map['participantName']?.toString() ?? '',
      regNo: map['regNo']?.toString() ?? '',
      gender: map['gender']?.toString() ?? 'Male',
      department: map['department']?.toString() ?? '',
      academicYear: map['academicYear']?.toString() ?? '',
      phone: map['phone']?.toString() ?? '',
      groupName: map['groupName']?.toString(),
      attendance: map['attendance']?.toString() ?? 'registered',
    );
  }
}

class CompetitionResultItem {
  final String entryId;
  final String participantName;
  final String regNo;
  final String department;
  final double totalWeightedScore;
  final int rank;
  final String awardTitle;

  const CompetitionResultItem({
    required this.entryId,
    required this.participantName,
    required this.regNo,
    required this.department,
    required this.totalWeightedScore,
    required this.rank,
    required this.awardTitle,
  });

  factory CompetitionResultItem.fromMap(Map<String, dynamic> map) {
    return CompetitionResultItem(
      entryId: map['entryId']?.toString() ?? '',
      participantName: map['participantName']?.toString() ?? '',
      regNo: map['regNo']?.toString() ?? '',
      department: map['department']?.toString() ?? '',
      totalWeightedScore: double.tryParse(map['totalWeightedScore']?.toString() ?? '0.0') ?? 0.0,
      rank: int.tryParse(map['rank']?.toString() ?? '1') ?? 1,
      awardTitle: map['awardTitle']?.toString() ?? '',
    );
  }
}

class CulturalCompetition {
  final String id;
  final String title;
  final String category;
  final String categoryLabel;
  final String competitionType;
  final int minGroupSize;
  final int maxGroupSize;
  final String description;
  final String venue;
  final String eventDate;
  final String startTime;
  final String endTime;
  final String regDeadline;
  final int maxParticipants;
  final String rules;
  final String organizerName;
  final String status;
  final List<JudgingCriterion> criteria;
  final List<CompetitionEntry> entries;
  final List<CompetitionResultItem> results;

  const CulturalCompetition({
    required this.id,
    required this.title,
    required this.category,
    required this.categoryLabel,
    required this.competitionType,
    required this.minGroupSize,
    required this.maxGroupSize,
    required this.description,
    required this.venue,
    required this.eventDate,
    required this.startTime,
    required this.endTime,
    required this.regDeadline,
    required this.maxParticipants,
    required this.rules,
    required this.organizerName,
    required this.status,
    required this.criteria,
    required this.entries,
    required this.results,
  });

  factory CulturalCompetition.fromMap(Map<String, dynamic> map) {
    final cList = (map['criteria'] as List?)
            ?.map((c) => JudgingCriterion.fromMap(Map<String, dynamic>.from(c)))
            .toList() ??
        [];
    final eList = (map['entries'] as List?)
            ?.map((e) => CompetitionEntry.fromMap(Map<String, dynamic>.from(e)))
            .toList() ??
        [];
    final rList = (map['results'] as List?)
            ?.map((r) => CompetitionResultItem.fromMap(Map<String, dynamic>.from(r)))
            .toList() ??
        [];

    return CulturalCompetition(
      id: map['id']?.toString() ?? '',
      title: map['title']?.toString() ?? '',
      category: map['category']?.toString() ?? 'poetry_writing',
      categoryLabel: map['categoryLabel']?.toString() ?? 'Poetry Writing',
      competitionType: map['competitionType']?.toString() ?? 'individual',
      minGroupSize: int.tryParse(map['minGroupSize']?.toString() ?? '1') ?? 1,
      maxGroupSize: int.tryParse(map['maxGroupSize']?.toString() ?? '1') ?? 1,
      description: map['description']?.toString() ?? '',
      venue: map['venue']?.toString() ?? '',
      eventDate: map['eventDate']?.toString() ?? '',
      startTime: map['startTime']?.toString() ?? '',
      endTime: map['endTime']?.toString() ?? '',
      regDeadline: map['regDeadline']?.toString() ?? '',
      maxParticipants: int.tryParse(map['maxParticipants']?.toString() ?? '30') ?? 30,
      rules: map['rules']?.toString() ?? '',
      organizerName: map['organizerName']?.toString() ?? '',
      status: map['status']?.toString() ?? 'upcoming',
      criteria: cList,
      entries: eList,
      results: rList,
    );
  }
}

// --- MODULE E: NOTIFICATIONS MODEL ---

class SportsNotification {
  final String id;
  final String title;
  final String message;
  final String notificationType;
  final String entityType;
  final String entityId;
  final String actionUrl;
  final bool isRead;
  final String createdAt;

  const SportsNotification({
    required this.id,
    required this.title,
    required this.message,
    required this.notificationType,
    required this.entityType,
    required this.entityId,
    required this.actionUrl,
    required this.isRead,
    required this.createdAt,
  });

  factory SportsNotification.fromMap(Map<String, dynamic> map) {
    return SportsNotification(
      id: map['id']?.toString() ?? '',
      title: map['title']?.toString() ?? '',
      message: map['message']?.toString() ?? '',
      notificationType: map['notificationType']?.toString() ?? 'score_updated',
      entityType: map['entityType']?.toString() ?? 'match',
      entityId: map['entityId']?.toString() ?? '',
      actionUrl: map['actionUrl']?.toString() ?? '',
      isRead: map['isRead'] ?? false,
      createdAt: map['createdAt']?.toString() ?? '',
    );
  }
}

