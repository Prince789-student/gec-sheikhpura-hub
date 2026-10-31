import 'package:flutter/material.dart';
import '../models/sports_events_models.dart';
import '../services/sports_events_service.dart';
import '../theme/app_theme.dart';

class PointsTablesScreen extends StatefulWidget {
  final String? initialSport;

  const PointsTablesScreen({super.key, this.initialSport});

  @override
  State<PointsTablesScreen> createState() => _PointsTablesScreenState();
}

class _PointsTablesScreenState extends State<PointsTablesScreen> with SingleTickerProviderStateMixin {
  late TabController _sportTabController;
  bool _isLoading = true;

  final List<String> _sports = [
    'Cricket',
    'Kabaddi',
    'Basketball',
    'Volleyball',
    'Football',
    'Athletics & Track',
  ];

  List<TournamentStanding> _allStandings = [];
  List<IndividualRanking> _allRankings = [];

  @override
  void initState() {
    super.initState();
    int initialIdx = 0;
    if (widget.initialSport != null) {
      final found = _sports.indexWhere((s) => s.toLowerCase().contains(widget.initialSport!.toLowerCase()));
      if (found != -1) initialIdx = found;
    }
    _sportTabController = TabController(length: _sports.length, vsync: this, initialIndex: initialIdx);
    _loadStandings();
  }

  @override
  void dispose() {
    _sportTabController.dispose();
    super.dispose();
  }

  Future<void> _loadStandings() async {
    setState(() => _isLoading = true);
    final srv = SportsEventsService.instance;
    final results = await Future.wait([
      srv.fetchStandings(),
      srv.fetchIndividualRankings(),
    ]);

    if (mounted) {
      setState(() {
        _allStandings = results[0] as List<TournamentStanding>;
        _allRankings = results[1] as List<IndividualRanking>;
        _isLoading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;

    return Scaffold(
      appBar: AppBar(
        title: const Text('Official Points & Standings', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18)),
        actions: [
          IconButton(icon: const Icon(Icons.refresh), onPressed: _loadStandings),
        ],
        bottom: TabBar(
          controller: _sportTabController,
          isScrollable: true,
          tabAlignment: TabAlignment.start,
          indicatorColor: AppTheme.accentSky,
          indicatorWeight: 3,
          labelColor: isDark ? AppTheme.accentLight : AppTheme.primaryBlue,
          unselectedLabelColor: isDark ? const Color(0xFF94A3B8) : const Color(0xFF64748B),
          labelStyle: const TextStyle(fontWeight: FontWeight.bold, fontSize: 12.5),
          tabs: _sports.map((s) => Tab(text: s)).toList(),
        ),
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : TabBarView(
              controller: _sportTabController,
              children: [
                _buildTeamStandingsTable('cricket', displayName: 'Cricket', isCricket: true),
                _buildTeamStandingsTable('kabaddi', displayName: 'Kabaddi', isKabaddi: true),
                _buildTeamStandingsTable('basketball', displayName: 'Basketball'),
                _buildTeamStandingsTable('volleyball', displayName: 'Volleyball'),
                _buildTeamStandingsTable('football', displayName: 'Football'),
                _buildIndividualRankingsView(),
              ],
            ),
    );
  }

  // --- 1. Sport-Specific Team Standings Table ---
  Widget _buildTeamStandingsTable(String sportId, {required String displayName, bool isCricket = false, bool isKabaddi = false}) {
    final list = _allStandings
        .where((s) => s.sportId.toLowerCase().contains(sportId.toLowerCase()))
        .toList();

    if (list.isEmpty) {
      return Center(
        child: Padding(
          padding: const EdgeInsets.all(32),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              const Icon(Icons.leaderboard_outlined, size: 54, color: Colors.grey),
              const SizedBox(height: 14),
              Text('No standings recorded for $displayName yet.', style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
              const SizedBox(height: 6),
              const Text('Points tables update automatically as match results are officially verified and concluded.', textAlign: TextAlign.center, style: TextStyle(fontSize: 12, color: Colors.grey)),
            ],
          ),
        ),
      );
    }

    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        // Table Header Banner
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
          decoration: BoxDecoration(
            color: AppTheme.primaryNavy.withValues(alpha: 0.08),
            borderRadius: BorderRadius.circular(10),
          ),
          child: Row(
            children: [
              const Icon(Icons.emoji_events, size: 16, color: AppTheme.primaryNavy),
              const SizedBox(width: 8),
              Text(
                '$displayName Championship Standings',
                style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: AppTheme.primaryNavy),
              ),
            ],
          ),
        ),
        const SizedBox(height: 12),

        // Data Table Card
        Card(
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
          elevation: 1.5,
          child: SingleChildScrollView(
            scrollDirection: Axis.horizontal,
            child: DataTable(
              columnSpacing: 14,
              horizontalMargin: 12,
              headingRowHeight: 44,
              dataRowMinHeight: 48,
              dataRowMaxHeight: 52,
              columns: [
                const DataColumn(label: Text('Pos', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 12))),
                const DataColumn(label: Text('Team', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 12))),
                const DataColumn(label: Text('P', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 12))),
                const DataColumn(label: Text('W', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 12))),
                const DataColumn(label: Text('L', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 12))),
                const DataColumn(label: Text('D/T', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 12))),
                const DataColumn(label: Text('Pts', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 12, color: AppTheme.primaryBlue))),
                if (isCricket)
                  const DataColumn(label: Text('NRR', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 12)))
                else
                  const DataColumn(label: Text('Diff', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 12))),
              ],
              rows: list.asMap().entries.map((entry) {
                final pos = entry.key + 1;
                final s = entry.value;
                final diff = s.scoreFor - s.scoreAgainst;

                return DataRow(
                  cells: [
                    DataCell(
                      CircleAvatar(
                        radius: 11,
                        backgroundColor: pos == 1
                            ? Colors.amber
                            : pos == 2
                                ? Colors.grey.shade400
                                : pos == 3
                                    ? Colors.brown.shade300
                                    : Colors.grey.withValues(alpha: 0.2),
                        child: Text('$pos', style: TextStyle(fontSize: 10.5, fontWeight: FontWeight.bold, color: pos <= 3 ? Colors.black : Colors.grey)),
                      ),
                    ),
                    DataCell(
                      ConstrainedBox(
                        constraints: const BoxConstraints(maxWidth: 130),
                        child: Text(s.teamName, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 12.5), overflow: TextOverflow.ellipsis),
                      ),
                    ),
                    DataCell(Text('${s.matchesPlayed}', style: const TextStyle(fontSize: 12))),
                    DataCell(Text('${s.wins}', style: const TextStyle(fontSize: 12, color: AppTheme.successGreen, fontWeight: FontWeight.w600))),
                    DataCell(Text('${s.losses}', style: const TextStyle(fontSize: 12, color: AppTheme.dangerRed))),
                    DataCell(Text('${s.draws}', style: const TextStyle(fontSize: 12))),
                    DataCell(
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                        decoration: BoxDecoration(color: AppTheme.primaryBlue.withValues(alpha: 0.12), borderRadius: BorderRadius.circular(6)),
                        child: Text('${s.points}', style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 12, color: AppTheme.primaryBlue)),
                      ),
                    ),
                    if (isCricket)
                      DataCell(Text(s.netRunRate >= 0 ? '+${s.netRunRate.toStringAsFixed(2)}' : s.netRunRate.toStringAsFixed(2), style: const TextStyle(fontSize: 11.5, fontWeight: FontWeight.w500)))
                    else
                      DataCell(Text(diff >= 0 ? '+$diff' : '$diff', style: const TextStyle(fontSize: 11.5, fontWeight: FontWeight.w500))),
                  ],
                );
              }).toList(),
            ),
          ),
        ),
      ],
    );
  }

  // --- 2. Athletics & Individual Rankings View ---
  Widget _buildIndividualRankingsView() {
    if (_allRankings.isEmpty) {
      return Center(
        child: Padding(
          padding: const EdgeInsets.all(32),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              const Icon(Icons.directions_run, size: 54, color: Colors.grey),
              const SizedBox(height: 14),
              const Text('No individual athletic rankings published yet.', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
              const SizedBox(height: 6),
              const Text('Track and field podium finishes (100m, 200m, 400m, Shot Put, Javelin, Long Jump) will be announced here.', textAlign: TextAlign.center, style: TextStyle(fontSize: 12, color: Colors.grey)),
            ],
          ),
        ),
      );
    }

    // Group rankings by event
    final Map<String, List<IndividualRanking>> grouped = {};
    for (final r in _allRankings) {
      grouped.putIfAbsent(r.sportName, () => []).add(r);
    }

    return ListView(
      padding: const EdgeInsets.all(16),
      children: grouped.entries.map((group) {
        return Card(
          margin: const EdgeInsets.only(bottom: 16),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
          child: Padding(
            padding: const EdgeInsets.all(14),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    const Icon(Icons.sports_score, size: 18, color: AppTheme.primaryBlue),
                    const SizedBox(width: 8),
                    Text(group.key, style: const TextStyle(fontSize: 15, fontWeight: FontWeight.bold)),
                  ],
                ),
                const Divider(height: 18),
                ...group.value.map((rank) {
                  return Padding(
                    padding: const EdgeInsets.symmetric(vertical: 4),
                    child: Row(
                      children: [
                        _buildMedalBadge(rank.rank),
                        const SizedBox(width: 10),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(rank.participantName, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
                              Text('${rank.department} • Reg: ${rank.regNo}', style: const TextStyle(fontSize: 11, color: Colors.grey)),
                            ],
                          ),
                        ),
                        if (rank.bestMetric.isNotEmpty)
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                            decoration: BoxDecoration(color: Colors.grey.withValues(alpha: 0.1), borderRadius: BorderRadius.circular(6)),
                            child: Text(rank.bestMetric, style: const TextStyle(fontSize: 11.5, fontWeight: FontWeight.bold)),
                          ),
                      ],
                    ),
                  );
                }),
              ],
            ),
          ),
        );
      }).toList(),
    );
  }

  Widget _buildMedalBadge(int rank) {
    if (rank == 1) {
      return const CircleAvatar(radius: 12, backgroundColor: Colors.amber, child: Text('🥇', style: TextStyle(fontSize: 13)));
    } else if (rank == 2) {
      return CircleAvatar(radius: 12, backgroundColor: Colors.grey.shade300, child: const Text('🥈', style: TextStyle(fontSize: 13)));
    } else if (rank == 3) {
      return CircleAvatar(radius: 12, backgroundColor: Colors.brown.shade200, child: const Text('🥉', style: TextStyle(fontSize: 13)));
    }
    return CircleAvatar(radius: 12, backgroundColor: Colors.grey.withValues(alpha: 0.15), child: Text('$rank', style: const TextStyle(fontSize: 10, fontWeight: FontWeight.bold)));
  }
}
