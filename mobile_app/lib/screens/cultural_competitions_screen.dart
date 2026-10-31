import 'package:flutter/material.dart';
import '../models/sports_events_models.dart';
import '../services/sports_events_service.dart';
import '../services/auth_service.dart';
import '../theme/app_theme.dart';

class CulturalCompetitionsScreen extends StatefulWidget {
  const CulturalCompetitionsScreen({super.key});

  @override
  State<CulturalCompetitionsScreen> createState() => _CulturalCompetitionsScreenState();
}

class _CulturalCompetitionsScreenState extends State<CulturalCompetitionsScreen> {
  bool _isLoading = true;
  List<CulturalCompetition> _competitions = [];
  String _selectedCategory = 'all';

  final List<String> _official10Categories = [
    'All Categories',
    'Poetry Writing',
    'Group Discussion',
    'Extempore',
    'Essay Writing (English)',
    'Essay Writing (Hindi)',
    'Story Writing (English)',
    'Story Writing (Hindi)',
    'Debate',
    'Rangoli',
    'Painting',
  ];

  @override
  void initState() {
    super.initState();
    _loadCompetitions();
  }

  Future<void> _loadCompetitions() async {
    setState(() => _isLoading = true);
    final list = await SportsEventsService.instance.fetchCulturalCompetitions(
      category: _selectedCategory == 'all' ? null : _selectedCategory,
    );
    if (mounted) {
      setState(() {
        _competitions = list;
        _isLoading = false;
      });
    }
  }

  // --- Registration Dialog ---
  void _showRegisterDialog(CulturalCompetition comp) {
    final user = AuthService.instance.currentUser.value;
    final nameCtrl = TextEditingController(text: user?.displayName ?? '');
    final regNoCtrl = TextEditingController(text: user?.regNo ?? '');
    final phoneCtrl = TextEditingController(text: user?.phone ?? '');
    final submissionTopicCtrl = TextEditingController();

    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        title: Text('Register: ${comp.title}', style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
        content: SingleChildScrollView(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              TextField(
                controller: nameCtrl,
                decoration: const InputDecoration(labelText: 'Student Full Name *', isDense: true),
              ),
              const SizedBox(height: 10),
              TextField(
                controller: regNoCtrl,
                decoration: const InputDecoration(labelText: 'BEU Registration No. *', isDense: true),
              ),
              const SizedBox(height: 10),
              TextField(
                controller: phoneCtrl,
                keyboardType: TextInputType.phone,
                decoration: const InputDecoration(labelText: 'Contact Phone Number *', isDense: true),
              ),
              const SizedBox(height: 10),
              TextField(
                controller: submissionTopicCtrl,
                decoration: const InputDecoration(
                  labelText: 'Topic / Piece Title (Optional)',
                  hintText: 'e.g. Title of poem or essay topic',
                  isDense: true,
                ),
              ),
            ],
          ),
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx), child: const Text('Cancel')),
          ElevatedButton(
            style: ElevatedButton.styleFrom(backgroundColor: AppTheme.primaryNavy, foregroundColor: Colors.white),
            onPressed: () async {
              if (nameCtrl.text.trim().isEmpty || regNoCtrl.text.trim().isEmpty) return;

              final payload = {
                'participantName': nameCtrl.text.trim(),
                'regNo': regNoCtrl.text.trim(),
                'phone': phoneCtrl.text.trim(),
                'email': user?.email ?? '',
                'topic': submissionTopicCtrl.text.trim(),
                'entryDate': DateTime.now().toIso8601String(),
              };

              final messenger = ScaffoldMessenger.of(context);
              final nav = Navigator.of(ctx);

              final ok = await SportsEventsService.instance.registerCulturalCompetition(comp.id, payload);
              if (ok) {
                nav.pop();
                _loadCompetitions();
                messenger.showSnackBar(
                  SnackBar(content: Text('✓ Registered for ${comp.title}!'), backgroundColor: AppTheme.successGreen),
                );
              }
            },
            child: const Text('Confirm Registration'),
          ),
        ],
      ),
    );
  }

  // --- Judge Scoring Dialog ---
  void _showJudgeScoringDialog(CulturalCompetition comp) {
    final user = AuthService.instance.currentUser.value;
    final participantCtrl = TextEditingController();
    double contentScore = 32.0; // out of 40
    double deliveryScore = 24.0; // out of 30
    double originalityScore = 24.0; // out of 30
    final remarksCtrl = TextEditingController(text: 'Commendable performance and strong command.');

    showDialog(
      context: context,
      builder: (ctx) {
        return StatefulBuilder(
          builder: (dCtx, setDialogState) {
            final totalScore = contentScore + deliveryScore + originalityScore;

            return AlertDialog(
              title: Text('Judge Scoring: ${comp.title}', style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
              content: SingleChildScrollView(
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    TextField(
                      controller: participantCtrl,
                      decoration: const InputDecoration(labelText: 'Participant Name / Entry ID *', isDense: true),
                    ),
                    const SizedBox(height: 16),
                    Text('Content & Depth: ${contentScore.round()}/40', style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 12)),
                    Slider(
                      value: contentScore,
                      min: 0,
                      max: 40,
                      divisions: 40,
                      onChanged: (v) => setDialogState(() => contentScore = v),
                    ),
                    Text('Delivery & Expression: ${deliveryScore.round()}/30', style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 12)),
                    Slider(
                      value: deliveryScore,
                      min: 0,
                      max: 30,
                      divisions: 30,
                      onChanged: (v) => setDialogState(() => deliveryScore = v),
                    ),
                    Text('Creativity & Originality: ${originalityScore.round()}/30', style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 12)),
                    Slider(
                      value: originalityScore,
                      min: 0,
                      max: 30,
                      divisions: 30,
                      onChanged: (v) => setDialogState(() => originalityScore = v),
                    ),
                    const Divider(height: 16),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        const Text('Total Composite Score:', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
                        Text('${totalScore.round()}/100', style: const TextStyle(fontWeight: FontWeight.w900, fontSize: 16, color: AppTheme.primaryNavy)),
                      ],
                    ),
                    const SizedBox(height: 10),
                    TextField(
                      controller: remarksCtrl,
                      decoration: const InputDecoration(labelText: 'Judge Remarks', isDense: true),
                    ),
                  ],
                ),
              ),
              actions: [
                TextButton(onPressed: () => Navigator.pop(ctx), child: const Text('Cancel')),
                ElevatedButton(
                  style: ElevatedButton.styleFrom(backgroundColor: AppTheme.primaryNavy, foregroundColor: Colors.white),
                  onPressed: () async {
                    if (participantCtrl.text.trim().isEmpty) return;

                    final payload = {
                      'participantName': participantCtrl.text.trim(),
                      'judgeName': user?.displayName ?? 'Faculty Judge',
                      'judgeEmail': user?.email ?? '',
                      'contentScore': contentScore.round(),
                      'deliveryScore': deliveryScore.round(),
                      'originalityScore': originalityScore.round(),
                      'totalScore': totalScore.round(),
                      'remarks': remarksCtrl.text.trim(),
                    };

                    final messenger = ScaffoldMessenger.of(context);
                    final nav = Navigator.of(ctx);

                    final ok = await SportsEventsService.instance.submitJudgeScore(comp.id, payload);
                    if (ok) {
                      nav.pop();
                      _loadCompetitions();
                      messenger.showSnackBar(
                        const SnackBar(content: Text('✓ Judge Score Recorded!'), backgroundColor: AppTheme.successGreen),
                      );
                    }
                  },
                  child: const Text('Submit Score'),
                ),
              ],
            );
          },
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;
    final currentUser = AuthService.instance.currentUser.value;
    final isJudgeOrAdmin = currentUser != null && (currentUser.isAdmin || currentUser.email == 'pk3334238@gmail.com');

    return Scaffold(
      appBar: AppBar(
        title: const Text('Cultural Competitions Fest', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18)),
        actions: [
          IconButton(icon: const Icon(Icons.refresh), onPressed: _loadCompetitions),
        ],
      ),
      body: Column(
        children: [
          // Category selector chips
          SingleChildScrollView(
            scrollDirection: Axis.horizontal,
            padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
            child: Row(
              children: _official10Categories.map((cat) {
                final isSelected = (_selectedCategory == 'all' && cat == 'All Categories') || (_selectedCategory == cat);
                return Padding(
                  padding: const EdgeInsets.only(right: 8),
                  child: ChoiceChip(
                    label: Text(cat, style: TextStyle(fontSize: 12, fontWeight: isSelected ? FontWeight.bold : FontWeight.w500)),
                    selected: isSelected,
                    onSelected: (val) {
                      setState(() {
                        _selectedCategory = cat == 'All Categories' ? 'all' : cat;
                      });
                      _loadCompetitions();
                    },
                  ),
                );
              }).toList(),
            ),
          ),

          // Competitions List
          Expanded(
            child: _isLoading
                ? const Center(child: CircularProgressIndicator())
                : _competitions.isEmpty
                    ? Center(
                        child: Padding(
                          padding: const EdgeInsets.all(32),
                          child: Column(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              const Icon(Icons.theater_comedy, size: 54, color: Colors.grey),
                              const SizedBox(height: 14),
                              const Text('No cultural competitions listed for this category.', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 15)),
                              const SizedBox(height: 6),
                              const Text('All 10 official literary, artistic, and oratory events will appear here.', textAlign: TextAlign.center, style: TextStyle(fontSize: 12, color: Colors.grey)),
                            ],
                          ),
                        ),
                      )
                    : ListView.builder(
                        padding: const EdgeInsets.all(14),
                        itemCount: _competitions.length,
                        itemBuilder: (ctx, idx) {
                          final comp = _competitions[idx];
                          final hasResults = comp.results.isNotEmpty;

                          return Card(
                            margin: const EdgeInsets.only(bottom: 14),
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                            elevation: 1.5,
                            child: Padding(
                              padding: const EdgeInsets.all(16),
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Row(
                                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                    children: [
                                      Chip(
                                        label: Text(comp.categoryLabel, style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold)),
                                        backgroundColor: AppTheme.accentSky.withValues(alpha: 0.15),
                                        padding: EdgeInsets.zero,
                                        materialTapTargetSize: MaterialTapTargetSize.shrinkWrap,
                                      ),
                                      Chip(
                                        label: Text(comp.status.toUpperCase(), style: const TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: Colors.white)),
                                        backgroundColor: comp.status == 'completed' ? AppTheme.successGreen : AppTheme.primaryNavy,
                                        padding: EdgeInsets.zero,
                                        materialTapTargetSize: MaterialTapTargetSize.shrinkWrap,
                                      ),
                                    ],
                                  ),
                                  const SizedBox(height: 10),
                                  Text(comp.title, style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
                                  const SizedBox(height: 4),
                                  Text(comp.description, style: TextStyle(fontSize: 12.5, color: isDark ? Colors.white70 : AppTheme.textSecondary)),
                                  const SizedBox(height: 12),

                                  Row(
                                    children: [
                                      const Icon(Icons.place, size: 15, color: AppTheme.accentSky),
                                      const SizedBox(width: 4),
                                      Expanded(child: Text(comp.venue, style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w500))),
                                      const SizedBox(width: 8),
                                      const Icon(Icons.calendar_today, size: 14, color: AppTheme.accentSky),
                                      const SizedBox(width: 4),
                                      Text(comp.eventDate, style: const TextStyle(fontSize: 12)),
                                    ],
                                  ),

                                  // Results section if published
                                  if (hasResults) ...[
                                    const Divider(height: 20),
                                    const Text('🏆 Official Winners & Podium:', style: TextStyle(fontSize: 13, fontWeight: FontWeight.bold, color: AppTheme.primaryNavy)),
                                    const SizedBox(height: 6),
                                    ...comp.results.map((r) {
                                      final medal = r.rank == 1 ? '🥇' : r.rank == 2 ? '🥈' : '🥉';
                                      return Padding(
                                        padding: const EdgeInsets.symmetric(vertical: 2),
                                        child: Row(
                                          children: [
                                            Text(medal, style: const TextStyle(fontSize: 14)),
                                            const SizedBox(width: 6),
                                            Text('${r.rank}. ${r.participantName}', style: const TextStyle(fontSize: 12.5, fontWeight: FontWeight.bold)),
                                            const Spacer(),
                                            Text('${r.totalWeightedScore.toStringAsFixed(1)}/100 pts', style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: AppTheme.primaryBlue)),
                                          ],
                                        ),
                                      );
                                    }),
                                  ],

                                  const SizedBox(height: 14),
                                  Row(
                                    children: [
                                      Expanded(
                                        child: OutlinedButton.icon(
                                          icon: const Icon(Icons.how_to_reg, size: 16),
                                          label: const Text('Register Entry', style: TextStyle(fontSize: 12.5)),
                                          onPressed: comp.status == 'completed' ? null : () => _showRegisterDialog(comp),
                                        ),
                                      ),
                                      if (isJudgeOrAdmin) ...[
                                        const SizedBox(width: 8),
                                        ElevatedButton.icon(
                                          icon: const Icon(Icons.grade, size: 16),
                                          label: const Text('Score', style: TextStyle(fontSize: 12.5)),
                                          style: ElevatedButton.styleFrom(backgroundColor: AppTheme.primaryNavy, foregroundColor: Colors.white),
                                          onPressed: () => _showJudgeScoringDialog(comp),
                                        ),
                                      ],
                                    ],
                                  ),
                                ],
                              ),
                            ),
                          );
                        },
                      ),
          ),
        ],
      ),
    );
  }
}
