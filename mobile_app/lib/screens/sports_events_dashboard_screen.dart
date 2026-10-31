import 'package:flutter/material.dart';
import '../models/sports_events_models.dart';
import '../services/sports_events_service.dart';
import '../services/auth_service.dart';
import '../theme/app_theme.dart';
import 'event_details_screen.dart';
import 'create_event_screen.dart';
import 'team_registration_screen.dart';
import 'match_scheduler_screen.dart';
import 'live_match_screen.dart';
import 'points_tables_screen.dart';
import 'cultural_competitions_screen.dart';

class SportsEventsDashboardScreen extends StatefulWidget {
  const SportsEventsDashboardScreen({super.key});

  @override
  State<SportsEventsDashboardScreen> createState() => _SportsEventsDashboardScreenState();
}

class _SportsEventsDashboardScreenState extends State<SportsEventsDashboardScreen> with SingleTickerProviderStateMixin {
  late TabController _tabController;
  bool _isLoading = true;

  List<StudentEvent> _events = [];
  List<SportItem> _sports = [];
  List<TournamentMatch> _matches = [];
  List<TournamentStanding> _standings = [];
  List<CulturalCompetition> _cultural = [];

  String _eventFilter = 'all'; // 'all', 'upcoming', 'ongoing', 'completed'

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 5, vsync: this);
    _loadAllData();
  }

  Future<void> _loadAllData() async {
    setState(() => _isLoading = true);
    final srv = SportsEventsService.instance;
    final results = await Future.wait([
      srv.fetchEvents(),
      srv.fetchSports(),
      srv.fetchMatches(),
      srv.fetchStandings(),
      srv.fetchCulturalCompetitions(),
    ]);

    if (mounted) {
      setState(() {
        _events = results[0] as List<StudentEvent>;
        _sports = results[1] as List<SportItem>;
        _matches = results[2] as List<TournamentMatch>;
        _standings = results[3] as List<TournamentStanding>;
        _cultural = results[4] as List<CulturalCompetition>;
        _isLoading = false;
      });
    }
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;
    final currentUser = AuthService.instance.currentUser.value;
    final isOrganizerOrAdmin = currentUser != null && (currentUser.isAdmin || currentUser.email == 'pk3334238@gmail.com');

    return Scaffold(
      appBar: AppBar(
        title: const Text('Sports & Events Hub', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18)),
        bottom: TabBar(
          controller: _tabController,
          isScrollable: true,
          tabAlignment: TabAlignment.start,
          indicatorColor: AppTheme.accentSky,
          indicatorWeight: 3,
          labelColor: isDark ? AppTheme.accentLight : AppTheme.primaryBlue,
          unselectedLabelColor: isDark ? const Color(0xFF94A3B8) : const Color(0xFF64748B),
          labelStyle: const TextStyle(fontWeight: FontWeight.w700, fontSize: 12.5),
          tabs: const [
            Tab(text: '🎯 Events'),
            Tab(text: '⚡ Live Matches'),
            Tab(text: '🏆 Sports & Squads'),
            Tab(text: '📊 Points Tables'),
            Tab(text: '🎭 Cultural Fest'),
          ],
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            tooltip: 'Refresh live fixtures & events',
            onPressed: _loadAllData,
          ),
          if (isOrganizerOrAdmin)
            IconButton(
              icon: const Icon(Icons.add_task, color: AppTheme.warningAmber),
              tooltip: 'Manual Match Scheduler',
              onPressed: () {
                Navigator.push(context, MaterialPageRoute(builder: (_) => const MatchSchedulerScreen()))
                    .then((_) => _loadAllData());
              },
            ),
        ],
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : TabBarView(
              controller: _tabController,
              children: [
                _buildEventsTab(context, isDark),
                _buildMatchesTab(context, isDark),
                _buildSportsDirectoryTab(context, isDark),
                _buildPointsTableTab(context, isDark),
                _buildCulturalTab(context, isDark),
              ],
            ),
      floatingActionButton: FloatingActionButton.extended(
        backgroundColor: AppTheme.primaryBlue,
        foregroundColor: Colors.white,
        icon: const Icon(Icons.add),
        label: const Text('Create Event / Team', style: TextStyle(fontWeight: FontWeight.bold)),
        onPressed: () {
          _showCreateActionModal(context);
        },
      ),
    );
  }

  void _showCreateActionModal(BuildContext context) {
    showModalBottomSheet(
      context: context,
      shape: const RoundedRectangleBorder(borderRadius: BorderRadius.vertical(top: Radius.circular(20))),
      builder: (ctx) => SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(20),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Container(width: 40, height: 4, decoration: BoxDecoration(color: Colors.grey.shade400, borderRadius: BorderRadius.circular(2))),
              const SizedBox(height: 16),
              const Text('What would you like to register?', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
              const SizedBox(height: 16),
              ListTile(
                leading: const CircleAvatar(backgroundColor: Color(0xFFEFF6FF), child: Icon(Icons.event_note, color: AppTheme.primaryBlue)),
                title: const Text('Create College Event', style: TextStyle(fontWeight: FontWeight.bold)),
                subtitle: const Text('Student-led Hackathon, Workshop, Fest, or Seminar (Becomes Event Head)'),
                trailing: const Icon(Icons.arrow_forward_ios, size: 14),
                onTap: () {
                  Navigator.pop(ctx);
                  Navigator.push(context, MaterialPageRoute(builder: (_) => const CreateEventScreen()))
                      .then((_) => _loadAllData());
                },
              ),
              const Divider(),
              ListTile(
                leading: const CircleAvatar(backgroundColor: Color(0xFFFEF3C7), child: Icon(Icons.groups, color: Color(0xFFD97706))),
                title: const Text('Register Sports Team / Squad', style: TextStyle(fontWeight: FontWeight.bold)),
                subtitle: const Text('Cricket (Playing XI), Kabaddi, Basketball, Volleyball, Relay'),
                trailing: const Icon(Icons.arrow_forward_ios, size: 14),
                onTap: () {
                  Navigator.pop(ctx);
                  Navigator.push(context, MaterialPageRoute(builder: (_) => const TeamRegistrationScreen()))
                      .then((_) => _loadAllData());
                },
              ),
            ],
          ),
        ),
      ),
    );
  }

  // --- TAB 1: EVENTS VIEW ---
  Widget _buildEventsTab(BuildContext context, bool isDark) {
    final filteredEvents = _eventFilter == 'all'
        ? _events
        : _events.filter((e) => e.status == _eventFilter).toList();

    return RefreshIndicator(
      onRefresh: _loadAllData,
      child: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          // Filter Chips
          SingleChildScrollView(
            scrollDirection: Axis.horizontal,
            child: Row(
              children: [
                _buildFilterChip('All Events', 'all'),
                const SizedBox(width: 8),
                _buildFilterChip('Upcoming', 'upcoming'),
                const SizedBox(width: 8),
                _buildFilterChip('Ongoing', 'ongoing'),
                const SizedBox(width: 8),
                _buildFilterChip('Completed', 'completed'),
              ],
            ),
          ),
          const SizedBox(height: 16),

          if (filteredEvents.isEmpty)
            _buildEmptyState(
              icon: Icons.event_available,
              title: 'No events found in this category',
              desc: 'Tap "+ Create Event" below to host an official verified student event.',
            )
          else
            ...filteredEvents.map((evt) => _buildEventCard(context, evt, isDark)),
        ],
      ),
    );
  }

  Widget _buildFilterChip(String label, String value) {
    final isSelected = _eventFilter == value;
    return ChoiceChip(
      label: Text(label, style: TextStyle(fontWeight: FontWeight.bold, fontSize: 12, color: isSelected ? Colors.white : null)),
      selected: isSelected,
      selectedColor: AppTheme.primaryBlue,
      onSelected: (_) => setState(() => _eventFilter = value),
    );
  }

  Widget _buildEventCard(BuildContext context, StudentEvent evt, bool isDark) {
    return Card(
      margin: const EdgeInsets.only(bottom: 14),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      elevation: 2,
      child: InkWell(
        borderRadius: BorderRadius.circular(16),
        onTap: () {
          Navigator.push(context, MaterialPageRoute(builder: (_) => EventDetailsScreen(event: evt)))
              .then((_) => _loadAllData());
        },
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                    decoration: BoxDecoration(
                      color: AppTheme.primaryBlue.withOpacity(0.12),
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: Text(
                      evt.categoryName.toUpperCase(),
                      style: const TextStyle(color: AppTheme.primaryBlue, fontSize: 10, fontWeight: FontWeight.bold),
                    ),
                  ),
                  const Spacer(),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                    decoration: BoxDecoration(
                      color: evt.status == 'live' || evt.status == 'ongoing'
                          ? Colors.red.withOpacity(0.15)
                          : Colors.green.withOpacity(0.15),
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: Text(
                      evt.status.toUpperCase(),
                      style: TextStyle(
                        color: evt.status == 'live' || evt.status == 'ongoing' ? Colors.red : Colors.green,
                        fontSize: 10,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 10),
              Text(evt.title, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 15)),
              const SizedBox(height: 6),
              Text(evt.description, maxLines: 2, overflow: TextOverflow.ellipsis, style: TextStyle(fontSize: 12, color: Colors.grey.shade600)),
              const SizedBox(height: 12),
              Row(
                children: [
                  const Icon(Icons.calendar_today, size: 13, color: AppTheme.accentSky),
                  const SizedBox(width: 4),
                  Text('${evt.startDate} • ${evt.startTime}', style: const TextStyle(fontSize: 11.5, fontWeight: FontWeight.w600)),
                  const SizedBox(width: 14),
                  const Icon(Icons.location_on, size: 14, color: AppTheme.dangerRed),
                  const SizedBox(width: 4),
                  Expanded(
                    child: Text(evt.venue, maxLines: 1, overflow: TextOverflow.ellipsis, style: const TextStyle(fontSize: 11.5)),
                  ),
                ],
              ),
              const Divider(height: 20),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text('Head: ${evt.eventHeadName}', style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w600)),
                  Text(
                    '${evt.registeredCount}${evt.maxParticipants != null ? '/${evt.maxParticipants}' : ''} Registered',
                    style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: AppTheme.primaryBlue),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }

  // --- TAB 2: LIVE & SCHEDULED MATCHES ---
  Widget _buildMatchesTab(BuildContext context, bool isDark) {
    if (_matches.isEmpty) {
      return _buildEmptyState(
        icon: Icons.sports_cricket,
        title: 'No matches scheduled right now',
        desc: 'Tournament organizers can schedule fixtures manually from the top scheduler icon.',
      );
    }

    return RefreshIndicator(
      onRefresh: _loadAllData,
      child: ListView.builder(
        padding: const EdgeInsets.all(16),
        itemCount: _matches.length,
        itemBuilder: (ctx, idx) {
          final m = _matches[idx];
          return _buildMatchCard(context, m, isDark);
        },
      ),
    );
  }

  Widget _buildMatchCard(BuildContext context, TournamentMatch m, bool isDark) {
    final isLive = m.status == 'live';

    return Card(
      margin: const EdgeInsets.only(bottom: 14),
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(16),
        side: isLive ? const BorderSide(color: Colors.red, width: 1.5) : BorderSide.none,
      ),
      child: InkWell(
        borderRadius: BorderRadius.circular(16),
        onTap: () {
          Navigator.push(context, MaterialPageRoute(builder: (_) => LiveMatchScreen(match: m)))
              .then((_) => _loadAllData());
        },
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Column(
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text('${m.sportName} • ${m.roundName}', style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 12, color: AppTheme.primaryBlue)),
                  if (isLive)
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                      decoration: BoxDecoration(color: Colors.red, borderRadius: BorderRadius.circular(12)),
                      child: const Row(
                        children: [
                          Icon(Icons.fiber_manual_record, size: 8, color: Colors.white),
                          SizedBox(width: 4),
                          Text('LIVE', style: TextStyle(color: Colors.white, fontSize: 9.5, fontWeight: FontWeight.bold)),
                        ],
                      ),
                    )
                  else
                    Text(m.status.toUpperCase(), style: TextStyle(fontSize: 10.5, fontWeight: FontWeight.bold, color: Colors.grey.shade600)),
                ],
              ),
              const SizedBox(height: 14),
              Row(
                children: [
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(m.teamAName, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
                        if (isLive || m.status == 'completed' || m.status == 'published')
                          Text('${m.teamAScore}', style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 20, color: AppTheme.primaryNavy)),
                      ],
                    ),
                  ),
                  const Padding(
                    padding: EdgeInsets.symmetric(horizontal: 12),
                    child: Text('VS', style: TextStyle(fontWeight: FontWeight.w900, color: Colors.grey, fontSize: 13)),
                  ),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.end,
                      children: [
                        Text(m.teamBName, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14), textAlign: TextAlign.end),
                        if (isLive || m.status == 'completed' || m.status == 'published')
                          Text('${m.teamBScore}', style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 20, color: AppTheme.primaryNavy)),
                      ],
                    ),
                  ),
                ],
              ),
              const Divider(height: 24),
              Row(
                children: [
                  const Icon(Icons.location_on, size: 13, color: Colors.grey),
                  const SizedBox(width: 4),
                  Expanded(child: Text('${m.venue} • ${m.scheduledDate} ${m.scheduledTime}', style: TextStyle(fontSize: 11, color: Colors.grey.shade700))),
                  const Icon(Icons.arrow_forward_ios, size: 12, color: Colors.grey),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }

  // --- TAB 3: SPORTS DIRECTORY ---
  Widget _buildSportsDirectoryTab(BuildContext context, bool isDark) {
    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        const Text('Inter-Branch & Campus Sports Directory', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 15)),
        const SizedBox(height: 4),
        Text('Configurable rules, custom squad sizes, and sport-specific scoring algorithms.', style: TextStyle(fontSize: 12, color: Colors.grey.shade600)),
        const SizedBox(height: 16),
        GridView.builder(
          shrinkWrap: true,
          physics: const NeverScrollableScrollPhysics(),
          gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
            crossAxisCount: 2,
            crossAxisSpacing: 12,
            mainAxisSpacing: 12,
            childAspectRatio: 1.25,
          ),
          itemCount: _sports.length,
          itemBuilder: (ctx, idx) {
            final s = _sports[idx];
            return Card(
              elevation: 1.5,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
              child: Padding(
                padding: const EdgeInsets.all(12),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text(s.icon, style: const TextStyle(fontSize: 24)),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                          decoration: BoxDecoration(color: AppTheme.primaryBlue.withOpacity(0.1), borderRadius: BorderRadius.circular(6)),
                          child: Text(s.code, style: const TextStyle(fontSize: 9.5, fontWeight: FontWeight.bold, color: AppTheme.primaryBlue)),
                        ),
                      ],
                    ),
                    Text(s.name, maxLines: 1, overflow: TextOverflow.ellipsis, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
                    Text('Playing: ${s.playingSquadSize} • Squad: ${s.minSquadSize}-${s.maxSquadSize}', style: TextStyle(fontSize: 10, color: Colors.grey.shade600)),
                  ],
                ),
              ),
            );
          },
        ),
      ],
    );
  }

  // --- TAB 4: POINTS TABLES & INDIVIDUAL RANKINGS ---
  Widget _buildPointsTableTab(BuildContext context, bool isDark) {
    return const PointsTablesScreen();
  }

  // --- TAB 5: CULTURAL COMPETITIONS (10 CATEGORIES) ---
  Widget _buildCulturalTab(BuildContext context, bool isDark) {
    return const CulturalCompetitionsScreen();
  }

  Widget _buildEmptyState({required IconData icon, required String title, required String desc}) {
    return Padding(
      padding: const EdgeInsets.all(32),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(icon, size: 48, color: Colors.grey.shade400),
          const SizedBox(height: 12),
          Text(title, textAlign: TextAlign.center, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 15)),
          const SizedBox(height: 6),
          Text(desc, textAlign: TextAlign.center, style: TextStyle(fontSize: 12, color: Colors.grey.shade600)),
        ],
      ),
    );
  }
}

extension ListFilter<T> on List<T> {
  Iterable<T> filter(bool Function(T) test) sync* {
    for (var element in this) {
      if (test(element)) yield element;
    }
  }
}
