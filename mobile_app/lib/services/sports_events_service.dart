import 'dart:convert';
import 'package:flutter/foundation.dart';
import 'package:http/http.dart' as http;
import '../models/sports_events_models.dart';

class SportsEventsService {
  static final SportsEventsService instance = SportsEventsService._();
  SportsEventsService._();

  static const String _apiBase = 'https://gec-sheikhpura-backend.onrender.com/api';

  // In-memory caches for fast UI response
  final List<StudentEvent> cachedEvents = [];
  final List<SportItem> cachedSports = [];
  final List<SportsTeam> cachedTeams = [];
  final List<Tournament> cachedTournaments = [];
  final List<TournamentMatch> cachedMatches = [];
  final List<TournamentStanding> cachedStandings = [];
  final List<IndividualRanking> cachedRankings = [];
  final List<CulturalCompetition> cachedCultural = [];
  final List<SportsNotification> cachedNotifications = [];

  // ==========================================
  // MODULE A: EVENTS SERVICE METHODS
  // ==========================================

  Future<List<StudentEvent>> fetchEvents({String? status, String? category, String? query, String? managedBy, String? registeredUser}) async {
    try {
      final queryParams = <String, String>{};
      if (status != null && status != 'all') queryParams['status'] = status;
      if (category != null && category != 'all') queryParams['category'] = category;
      if (query != null && query.isNotEmpty) queryParams['query'] = query;
      if (managedBy != null) queryParams['managedBy'] = managedBy;
      if (registeredUser != null) queryParams['registeredUser'] = registeredUser;

      final uri = Uri.parse('$_apiBase/events').replace(queryParameters: queryParams.isNotEmpty ? queryParams : null);
      final res = await http.get(uri).timeout(const Duration(seconds: 8));

      if (res.statusCode == 200) {
        final data = jsonDecode(res.body);
        if (data is Map && data['events'] is List) {
          final list = (data['events'] as List)
              .map((e) => StudentEvent.fromMap(Map<String, dynamic>.from(e)))
              .toList();
          cachedEvents.clear();
          cachedEvents.addAll(list);
          return list;
        }
      }
    } catch (e) {
      debugPrint('Error fetching events: $e');
    }
    return cachedEvents;
  }

  Future<StudentEvent?> getEventById(String eventId) async {
    try {
      final res = await http.get(Uri.parse('$_apiBase/events/$eventId')).timeout(const Duration(seconds: 8));
      if (res.statusCode == 200) {
        final data = jsonDecode(res.body);
        if (data is Map && data['event'] != null) {
          return StudentEvent.fromMap(Map<String, dynamic>.from(data['event']));
        }
      }
    } catch (e) {
      debugPrint('Error getting event details: $e');
    }
    return cachedEvents.cast<StudentEvent?>().firstWhere((e) => e?.id == eventId, orElse: () => null);
  }

  Future<StudentEvent?> createEvent(Map<String, dynamic> payload) async {
    try {
      final res = await http.post(
        Uri.parse('$_apiBase/events'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode(payload),
      ).timeout(const Duration(seconds: 10));

      if (res.statusCode == 201) {
        final data = jsonDecode(res.body);
        if (data is Map && data['event'] != null) {
          final newEvent = StudentEvent.fromMap(Map<String, dynamic>.from(data['event']));
          cachedEvents.insert(0, newEvent);
          return newEvent;
        }
      }
    } catch (e) {
      debugPrint('Error creating event: $e');
    }
    return null;
  }

  Future<bool> addEventMember(String eventId, Map<String, dynamic> payload) async {
    try {
      final res = await http.post(
        Uri.parse('$_apiBase/events/$eventId/members'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode(payload),
      ).timeout(const Duration(seconds: 8));
      return (res.statusCode == 200 || res.statusCode == 201);
    } catch (e) {
      debugPrint('Error adding event member: $e');
      return false;
    }
  }

  Future<bool> publishEventUpdate(String eventId, Map<String, dynamic> payload) async {
    try {
      final res = await http.post(
        Uri.parse('$_apiBase/events/$eventId/updates'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode(payload),
      ).timeout(const Duration(seconds: 8));
      return (res.statusCode == 200 || res.statusCode == 201);
    } catch (e) {
      debugPrint('Error publishing event update: $e');
      return false;
    }
  }

  Future<bool> registerForEvent(String eventId, Map<String, dynamic> payload) async {
    try {
      final res = await http.post(
        Uri.parse('$_apiBase/events/$eventId/register'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode(payload),
      ).timeout(const Duration(seconds: 8));
      return (res.statusCode == 200 || res.statusCode == 201);
    } catch (e) {
      debugPrint('Error registering for event: $e');
      return false;
    }
  }

  // --- Task Management Methods ---
  Future<bool> createEventTask(String eventId, Map<String, dynamic> payload) async {
    try {
      final res = await http.post(
        Uri.parse('$_apiBase/events/$eventId/tasks'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode(payload),
      ).timeout(const Duration(seconds: 8));
      return (res.statusCode == 200 || res.statusCode == 201);
    } catch (e) {
      debugPrint('Error creating event task: $e');
      return false;
    }
  }

  Future<bool> updateEventTask(String eventId, String taskId, Map<String, dynamic> payload) async {
    try {
      final res = await http.patch(
        Uri.parse('$_apiBase/events/$eventId/tasks/$taskId'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode(payload),
      ).timeout(const Duration(seconds: 8));
      return res.statusCode == 200;
    } catch (e) {
      debugPrint('Error updating event task: $e');
      return false;
    }
  }

  Future<bool> deleteEventTask(String eventId, String taskId) async {
    try {
      final res = await http.delete(
        Uri.parse('$_apiBase/events/$eventId/tasks/$taskId'),
      ).timeout(const Duration(seconds: 8));
      return res.statusCode == 200;
    } catch (e) {
      debugPrint('Error deleting event task: $e');
      return false;
    }
  }

  // --- Participant Management Methods ---
  Future<List<Map<String, dynamic>>> fetchEventParticipants(String eventId, {String? status, String? query}) async {
    try {
      final qp = <String, String>{};
      if (status != null && status != 'all') qp['status'] = status;
      if (query != null && query.isNotEmpty) qp['query'] = query;

      final uri = Uri.parse('$_apiBase/events/$eventId/participants').replace(queryParameters: qp.isNotEmpty ? qp : null);
      final res = await http.get(uri).timeout(const Duration(seconds: 8));
      if (res.statusCode == 200) {
        final data = jsonDecode(res.body);
        if (data is Map && data['participants'] is List) {
          return (data['participants'] as List).map((p) => Map<String, dynamic>.from(p)).toList();
        }
      }
    } catch (e) {
      debugPrint('Error fetching event participants: $e');
    }
    return [];
  }

  Future<bool> updateParticipantStatus(String eventId, String regId, Map<String, dynamic> payload) async {
    try {
      final res = await http.patch(
        Uri.parse('$_apiBase/events/$eventId/participants/$regId'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode(payload),
      ).timeout(const Duration(seconds: 8));
      return res.statusCode == 200;
    } catch (e) {
      debugPrint('Error updating participant status: $e');
      return false;
    }
  }

  // ==========================================
  // MODULE B: SPORTS & SQUADS METHODS
  // ==========================================

  Future<List<SportItem>> fetchSports({bool activeOnly = true}) async {
    try {
      final res = await http.get(Uri.parse('$_apiBase/sports?activeOnly=$activeOnly')).timeout(const Duration(seconds: 8));
      if (res.statusCode == 200) {
        final data = jsonDecode(res.body);
        if (data is Map && data['sports'] is List) {
          final list = (data['sports'] as List)
              .map((s) => SportItem.fromMap(Map<String, dynamic>.from(s)))
              .toList();
          cachedSports.clear();
          cachedSports.addAll(list);
          return list;
        }
      }
    } catch (e) {
      debugPrint('Error fetching sports: $e');
    }
    return cachedSports;
  }

  Future<List<SportsTeam>> fetchTeams({String? sportId, String? tournamentId, String? status}) async {
    try {
      final queryParams = <String, String>{};
      if (sportId != null) queryParams['sportId'] = sportId;
      if (tournamentId != null) queryParams['tournamentId'] = tournamentId;
      if (status != null) queryParams['status'] = status;

      final uri = Uri.parse('$_apiBase/sports/teams').replace(queryParameters: queryParams.isNotEmpty ? queryParams : null);
      final res = await http.get(uri).timeout(const Duration(seconds: 8));

      if (res.statusCode == 200) {
        final data = jsonDecode(res.body);
        if (data is Map && data['teams'] is List) {
          final list = (data['teams'] as List)
              .map((t) => SportsTeam.fromMap(Map<String, dynamic>.from(t)))
              .toList();
          cachedTeams.clear();
          cachedTeams.addAll(list);
          return list;
        }
      }
    } catch (e) {
      debugPrint('Error fetching teams: $e');
    }
    return cachedTeams;
  }

  Future<bool> registerTeam(Map<String, dynamic> payload) async {
    try {
      final res = await http.post(
        Uri.parse('$_apiBase/sports/teams/register'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode(payload),
      ).timeout(const Duration(seconds: 10));
      return (res.statusCode == 200 || res.statusCode == 201);
    } catch (e) {
      debugPrint('Error registering team: $e');
      return false;
    }
  }

  Future<bool> updateTeamStatus(String teamId, String status, {String? rejectionReason}) async {
    try {
      final res = await http.patch(
        Uri.parse('$_apiBase/sports/teams/$teamId/status'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({'status': status, 'rejectionReason': rejectionReason}),
      ).timeout(const Duration(seconds: 8));
      return res.statusCode == 200;
    } catch (e) {
      debugPrint('Error updating team status: $e');
      return false;
    }
  }

  // ==========================================
  // MODULE C: TOURNAMENTS & MATCHES METHODS
  // ==========================================

  Future<List<Tournament>> fetchTournaments({String? sportId, String? status}) async {
    try {
      final queryParams = <String, String>{};
      if (sportId != null) queryParams['sportId'] = sportId;
      if (status != null) queryParams['status'] = status;

      final uri = Uri.parse('$_apiBase/tournaments').replace(queryParameters: queryParams.isNotEmpty ? queryParams : null);
      final res = await http.get(uri).timeout(const Duration(seconds: 8));

      if (res.statusCode == 200) {
        final data = jsonDecode(res.body);
        if (data is Map && data['tournaments'] is List) {
          final list = (data['tournaments'] as List)
              .map((t) => Tournament.fromMap(Map<String, dynamic>.from(t)))
              .toList();
          cachedTournaments.clear();
          cachedTournaments.addAll(list);
          return list;
        }
      }
    } catch (e) {
      debugPrint('Error fetching tournaments: $e');
    }
    return cachedTournaments;
  }

  Future<List<TournamentMatch>> fetchMatches({String? tournamentId, String? sportId, String? status}) async {
    try {
      final queryParams = <String, String>{};
      if (tournamentId != null) queryParams['tournamentId'] = tournamentId;
      if (sportId != null) queryParams['sportId'] = sportId;
      if (status != null) queryParams['status'] = status;

      final uri = Uri.parse('$_apiBase/matches').replace(queryParameters: queryParams.isNotEmpty ? queryParams : null);
      final res = await http.get(uri).timeout(const Duration(seconds: 8));

      if (res.statusCode == 200) {
        final data = jsonDecode(res.body);
        if (data is Map && data['matches'] is List) {
          final list = (data['matches'] as List)
              .map((m) => TournamentMatch.fromMap(Map<String, dynamic>.from(m)))
              .toList();
          cachedMatches.clear();
          cachedMatches.addAll(list);
          return list;
        }
      }
    } catch (e) {
      debugPrint('Error fetching matches: $e');
    }
    return cachedMatches;
  }

  Future<TournamentMatch?> getMatchById(String matchId) async {
    try {
      final res = await http.get(Uri.parse('$_apiBase/matches/$matchId')).timeout(const Duration(seconds: 8));
      if (res.statusCode == 200) {
        final data = jsonDecode(res.body);
        if (data is Map && data['match'] != null) {
          return TournamentMatch.fromMap(Map<String, dynamic>.from(data['match']));
        }
      }
    } catch (e) {
      debugPrint('Error getting match details: $e');
    }
    return cachedMatches.cast<TournamentMatch?>().firstWhere((m) => m?.id == matchId, orElse: () => null);
  }

  // MANUAL MATCH SCHEDULING (Default & Required)
  Future<TournamentMatch?> scheduleMatch(Map<String, dynamic> payload) async {
    try {
      final res = await http.post(
        Uri.parse('$_apiBase/matches/schedule'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode(payload),
      ).timeout(const Duration(seconds: 10));

      if (res.statusCode == 201) {
        final data = jsonDecode(res.body);
        if (data is Map && data['match'] != null) {
          final newMatch = TournamentMatch.fromMap(Map<String, dynamic>.from(data['match']));
          cachedMatches.insert(0, newMatch);
          return newMatch;
        }
      }
    } catch (e) {
      debugPrint('Error scheduling match manually: $e');
    }
    return null;
  }

  Future<bool> updateMatchStatus(String matchId, String status, {String? reason}) async {
    try {
      final res = await http.patch(
        Uri.parse('$_apiBase/matches/$matchId/status'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({'status': status, 'reason': reason}),
      ).timeout(const Duration(seconds: 8));
      return res.statusCode == 200;
    } catch (e) {
      debugPrint('Error updating match status: $e');
      return false;
    }
  }

  Future<bool> recordMatchEvent(String matchId, Map<String, dynamic> payload) async {
    try {
      final res = await http.post(
        Uri.parse('$_apiBase/matches/$matchId/events'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode(payload),
      ).timeout(const Duration(seconds: 8));
      return (res.statusCode == 200 || res.statusCode == 201);
    } catch (e) {
      debugPrint('Error recording match scoring event: $e');
      return false;
    }
  }

  Future<bool> updateMatchTimer(String matchId, Map<String, dynamic> payload) async {
    try {
      final res = await http.post(
        Uri.parse('$_apiBase/matches/$matchId/timer'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode(payload),
      ).timeout(const Duration(seconds: 6));
      return res.statusCode == 200;
    } catch (e) {
      debugPrint('Error updating match timer: $e');
      return false;
    }
  }

  Future<bool> resolveTieBreaker(String matchId, Map<String, dynamic> payload) async {
    try {
      final res = await http.post(
        Uri.parse('$_apiBase/matches/$matchId/tie-breaker'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode(payload),
      ).timeout(const Duration(seconds: 8));
      return res.statusCode == 200;
    } catch (e) {
      debugPrint('Error recording tie breaker: $e');
      return false;
    }
  }

  Future<bool> publishMatchResult(String matchId) async {
    try {
      final res = await http.post(
        Uri.parse('$_apiBase/matches/$matchId/publish-result'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({}),
      ).timeout(const Duration(seconds: 10));
      return res.statusCode == 200;
    } catch (e) {
      debugPrint('Error publishing match result: $e');
      return false;
    }
  }

  Future<List<TournamentStanding>> fetchStandings({String? tournamentId, String? sportId}) async {
    try {
      final queryParams = <String, String>{};
      if (tournamentId != null) queryParams['tournamentId'] = tournamentId;
      if (sportId != null) queryParams['sportId'] = sportId;

      final uri = Uri.parse('$_apiBase/standings').replace(queryParameters: queryParams.isNotEmpty ? queryParams : null);
      final res = await http.get(uri).timeout(const Duration(seconds: 8));

      if (res.statusCode == 200) {
        final data = jsonDecode(res.body);
        if (data is Map && data['standings'] is List) {
          final list = (data['standings'] as List)
              .map((s) => TournamentStanding.fromMap(Map<String, dynamic>.from(s)))
              .toList();
          cachedStandings.clear();
          cachedStandings.addAll(list);
          return list;
        }
      }
    } catch (e) {
      debugPrint('Error fetching standings: $e');
    }
    return cachedStandings;
  }

  Future<List<IndividualRanking>> fetchIndividualRankings({String? sportId}) async {
    try {
      final uri = Uri.parse('$_apiBase/rankings/individual${sportId != null ? '?sportId=$sportId' : ''}');
      final res = await http.get(uri).timeout(const Duration(seconds: 8));

      if (res.statusCode == 200) {
        final data = jsonDecode(res.body);
        if (data is Map && data['rankings'] is List) {
          final list = (data['rankings'] as List)
              .map((r) => IndividualRanking.fromMap(Map<String, dynamic>.from(r)))
              .toList();
          cachedRankings.clear();
          cachedRankings.addAll(list);
          return list;
        }
      }
    } catch (e) {
      debugPrint('Error fetching individual rankings: $e');
    }
    return cachedRankings;
  }

  // ==========================================
  // MODULE D: CULTURAL COMPETITIONS METHODS
  // ==========================================

  Future<List<CulturalCompetition>> fetchCulturalCompetitions({String? category, String? status}) async {
    try {
      final queryParams = <String, String>{};
      if (category != null) queryParams['category'] = category;
      if (status != null) queryParams['status'] = status;

      final uri = Uri.parse('$_apiBase/cultural/competitions').replace(queryParameters: queryParams.isNotEmpty ? queryParams : null);
      final res = await http.get(uri).timeout(const Duration(seconds: 8));

      if (res.statusCode == 200) {
        final data = jsonDecode(res.body);
        if (data is Map && data['competitions'] is List) {
          final list = (data['competitions'] as List)
              .map((c) => CulturalCompetition.fromMap(Map<String, dynamic>.from(c)))
              .toList();
          cachedCultural.clear();
          cachedCultural.addAll(list);
          return list;
        }
      }
    } catch (e) {
      debugPrint('Error fetching cultural competitions: $e');
    }
    return cachedCultural;
  }

  Future<bool> registerCulturalCompetition(String compId, Map<String, dynamic> payload) async {
    try {
      final res = await http.post(
        Uri.parse('$_apiBase/cultural/competitions/$compId/register'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode(payload),
      ).timeout(const Duration(seconds: 8));
      return (res.statusCode == 200 || res.statusCode == 201);
    } catch (e) {
      debugPrint('Error registering for cultural competition: $e');
      return false;
    }
  }

  Future<bool> submitJudgeScore(String compId, Map<String, dynamic> payload) async {
    try {
      final res = await http.post(
        Uri.parse('$_apiBase/cultural/competitions/$compId/scores'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode(payload),
      ).timeout(const Duration(seconds: 8));
      return (res.statusCode == 200 || res.statusCode == 201);
    } catch (e) {
      debugPrint('Error submitting judge score: $e');
      return false;
    }
  }

  Future<bool> publishCulturalResults(String compId) async {
    try {
      final res = await http.post(
        Uri.parse('$_apiBase/cultural/competitions/$compId/publish'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({}),
      ).timeout(const Duration(seconds: 8));
      return res.statusCode == 200;
    } catch (e) {
      debugPrint('Error publishing cultural results: $e');
      return false;
    }
  }

  // ==========================================
  // MODULE E: NOTIFICATIONS METHODS
  // ==========================================

  Future<List<SportsNotification>> fetchNotifications({String? email}) async {
    try {
      final uri = Uri.parse('$_apiBase/notifications${email != null ? '?email=${Uri.encodeComponent(email)}' : ''}');
      final res = await http.get(uri).timeout(const Duration(seconds: 8));

      if (res.statusCode == 200) {
        final data = jsonDecode(res.body);
        if (data is Map && data['notifications'] is List) {
          final list = (data['notifications'] as List)
              .map((n) => SportsNotification.fromMap(Map<String, dynamic>.from(n)))
              .toList();
          cachedNotifications.clear();
          cachedNotifications.addAll(list);
          return list;
        }
      }
    } catch (e) {
      debugPrint('Error fetching notifications: $e');
    }
    return cachedNotifications;
  }
}

