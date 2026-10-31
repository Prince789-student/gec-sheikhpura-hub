import 'package:flutter/material.dart';
import '../models/sports_events_models.dart';
import '../services/sports_events_service.dart';
import '../services/auth_service.dart';
import '../theme/app_theme.dart';

class MatchSchedulerScreen extends StatefulWidget {
  final String? initialSport;

  const MatchSchedulerScreen({super.key, this.initialSport});

  @override
  State<MatchSchedulerScreen> createState() => _MatchSchedulerScreenState();
}

class _MatchSchedulerScreenState extends State<MatchSchedulerScreen> {
  final _formKey = GlobalKey<FormState>();

  final _teamACtrl = TextEditingController();
  final _teamBCtrl = TextEditingController();
  final _venueCtrl = TextEditingController(text: 'Main College Sports Ground, Bajidpur');
  final _refereeNameCtrl = TextEditingController();
  final _scorekeeperNameCtrl = TextEditingController();
  final _oversCtrl = TextEditingController(text: '12');

  String _selectedSport = 'Cricket';
  String _selectedStage = 'League Stage';

  DateTime _matchDate = DateTime.now().add(const Duration(days: 1));
  TimeOfDay _matchTime = const TimeOfDay(hour: 9, minute: 30);

  bool _isLoadingTeams = false;
  List<SportsTeam> _approvedTeams = [];
  bool _isSubmitting = false;
  String? _errorMessage;

  final List<String> _stages = [
    'League Stage',
    'Super 8',
    'Quarter-Final',
    'Semi-Final',
    'Final',
    'Exhibition / Friendly',
  ];

  final List<String> _sportsList = [
    'Cricket',
    'Kabaddi',
    'Basketball',
    'Volleyball',
    'Football',
    'Badminton',
    'Table Tennis',
  ];

  @override
  void initState() {
    super.initState();
    if (widget.initialSport != null) {
      _selectedSport = widget.initialSport!;
    }
    _loadApprovedTeams();
  }

  Future<void> _loadApprovedTeams() async {
    setState(() => _isLoadingTeams = true);
    final teams = await SportsEventsService.instance.fetchTeams(sportId: _selectedSport.toLowerCase());
    if (mounted) {
      setState(() {
        _approvedTeams = teams;
        _isLoadingTeams = false;
      });
    }
  }

  @override
  void dispose() {
    _teamACtrl.dispose();
    _teamBCtrl.dispose();
    _venueCtrl.dispose();
    _refereeNameCtrl.dispose();
    _scorekeeperNameCtrl.dispose();
    _oversCtrl.dispose();
    super.dispose();
  }

  Future<void> _scheduleMatch() async {
    if (!_formKey.currentState!.validate()) return;

    final user = AuthService.instance.currentUser.value;
    if (user == null) {
      setState(() => _errorMessage = 'Please sign in to schedule match fixtures.');
      return;
    }

    if (_teamACtrl.text.trim().toLowerCase() == _teamBCtrl.text.trim().toLowerCase()) {
      setState(() => _errorMessage = 'Team A and Team B cannot be the same team.');
      return;
    }

    setState(() {
      _isSubmitting = true;
      _errorMessage = null;
    });

    final scheduledDateTime = DateTime(
      _matchDate.year,
      _matchDate.month,
      _matchDate.day,
      _matchTime.hour,
      _matchTime.minute,
    );

    final payload = {
      'sport': _selectedSport,
      'stage': _selectedStage,
      'teamAName': _teamACtrl.text.trim(),
      'teamBName': _teamBCtrl.text.trim(),
      'venue': _venueCtrl.text.trim(),
      'scheduledAt': scheduledDateTime.toIso8601String(),
      'refereeName': _refereeNameCtrl.text.trim().isNotEmpty ? _refereeNameCtrl.text.trim() : 'Official Faculty Referee',
      'scorekeeperName': _scorekeeperNameCtrl.text.trim().isNotEmpty ? _scorekeeperNameCtrl.text.trim() : user.displayName,
      'scorekeeperEmail': user.email,
      'rules': {
        'totalOvers': int.tryParse(_oversCtrl.text.trim()) ?? 12,
        'halfDurationMinutes': 20,
        'raidDurationSeconds': 30,
      },
    };

    final scheduledMatch = await SportsEventsService.instance.scheduleMatch(payload);

    if (!mounted) return;
    setState(() => _isSubmitting = false);

    if (scheduledMatch != null) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('✓ Match Scheduled: ${_teamACtrl.text.trim()} vs ${_teamBCtrl.text.trim()}'),
          backgroundColor: AppTheme.successGreen,
        ),
      );
      Navigator.pop(context, scheduledMatch);
    } else {
      setState(() => _errorMessage = 'Failed to schedule match. Please verify tournament settings.');
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;
    final isCricket = _selectedSport.toLowerCase().contains('cricket');

    return Scaffold(
      appBar: AppBar(
        title: const Text('Manual Match Scheduler', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18)),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(18),
        child: Form(
          key: _formKey,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Directive notice
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: AppTheme.primaryNavy.withValues(alpha: 0.08),
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: AppTheme.primaryNavy.withValues(alpha: 0.2)),
                ),
                child: const Row(
                  children: [
                    Icon(Icons.event_note, color: AppTheme.primaryNavy, size: 22),
                    SizedBox(width: 10),
                    Expanded(
                      child: Text(
                        'Manual Match Scheduling (Mandatory System): Select specific teams, venue, date, referee, and scorekeeper. No randomized auto-pairing.',
                        style: TextStyle(fontSize: 12, fontWeight: FontWeight.w500),
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 18),

              if (_errorMessage != null)
                Container(
                  padding: const EdgeInsets.all(12),
                  margin: const EdgeInsets.only(bottom: 16),
                  decoration: BoxDecoration(
                    color: AppTheme.dangerRed.withValues(alpha: 0.1),
                    borderRadius: BorderRadius.circular(10),
                    border: Border.all(color: AppTheme.dangerRed),
                  ),
                  child: Text(_errorMessage!, style: const TextStyle(color: AppTheme.dangerRed, fontSize: 13)),
                ),

              // 1. Sport & Stage Selection
              const Text('Sport & Stage', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
              const SizedBox(height: 12),

              Row(
                children: [
                  Expanded(
                    child: DropdownButtonFormField<String>(
                      value: _selectedSport,
                      decoration: const InputDecoration(labelText: 'Sport *', prefixIcon: Icon(Icons.sports)),
                      items: _sportsList.map((s) => DropdownMenuItem(value: s, child: Text(s))).toList(),
                      onChanged: (v) {
                        if (v != null) {
                          setState(() => _selectedSport = v);
                          _loadApprovedTeams();
                        }
                      },
                    ),
                  ),
                  const SizedBox(width: 10),
                  Expanded(
                    child: DropdownButtonFormField<String>(
                      value: _selectedStage,
                      decoration: const InputDecoration(labelText: 'Stage *', prefixIcon: Icon(Icons.military_tech)),
                      items: _stages.map((s) => DropdownMenuItem(value: s, child: Text(s, style: const TextStyle(fontSize: 12)))).toList(),
                      onChanged: (v) {
                        if (v != null) setState(() => _selectedStage = v);
                      },
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 20),

              // 2. Pair Teams
              const Text('Team Pairing (Team A vs Team B)', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
              const SizedBox(height: 12),

              TextFormField(
                controller: _teamACtrl,
                decoration: InputDecoration(
                  labelText: 'Team A Name *',
                  hintText: 'e.g. CSE Titans',
                  prefixIcon: const Icon(Icons.shield, color: AppTheme.primaryNavy),
                  suffixIcon: _approvedTeams.isNotEmpty
                      ? PopupMenuButton<String>(
                          icon: const Icon(Icons.arrow_drop_down),
                          onSelected: (val) => _teamACtrl.text = val,
                          itemBuilder: (_) => _approvedTeams.map((t) => PopupMenuItem(value: t.name, child: Text(t.name))).toList(),
                        )
                      : null,
                ),
                validator: (v) => (v == null || v.trim().isEmpty) ? 'Enter Team A' : null,
              ),
              const SizedBox(height: 12),

              Center(
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 4),
                  decoration: BoxDecoration(color: Colors.grey.withValues(alpha: 0.15), borderRadius: BorderRadius.circular(16)),
                  child: const Text('VS', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13, letterSpacing: 1)),
                ),
              ),
              const SizedBox(height: 12),

              TextFormField(
                controller: _teamBCtrl,
                decoration: InputDecoration(
                  labelText: 'Team B Name *',
                  hintText: 'e.g. Mechanical Warriors',
                  prefixIcon: const Icon(Icons.shield, color: AppTheme.dangerRed),
                  suffixIcon: _approvedTeams.isNotEmpty
                      ? PopupMenuButton<String>(
                          icon: const Icon(Icons.arrow_drop_down),
                          onSelected: (val) => _teamBCtrl.text = val,
                          itemBuilder: (_) => _approvedTeams.map((t) => PopupMenuItem(value: t.name, child: Text(t.name))).toList(),
                        )
                      : null,
                ),
                validator: (v) => (v == null || v.trim().isEmpty) ? 'Enter Team B' : null,
              ),
              const SizedBox(height: 20),

              // 3. Venue & Schedule
              const Text('Venue & Date/Time', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
              const SizedBox(height: 12),

              TextFormField(
                controller: _venueCtrl,
                decoration: const InputDecoration(labelText: 'Venue / Court / Ground *', prefixIcon: Icon(Icons.place)),
                validator: (v) => (v == null || v.trim().isEmpty) ? 'Enter venue' : null,
              ),
              const SizedBox(height: 12),

              Row(
                children: [
                  Expanded(
                    child: OutlinedButton.icon(
                      icon: const Icon(Icons.calendar_month, size: 16),
                      label: Text('Date: ${_matchDate.day}/${_matchDate.month}/${_matchDate.year}'),
                      onPressed: () async {
                        final picked = await showDatePicker(
                          context: context,
                          initialDate: _matchDate,
                          firstDate: DateTime.now(),
                          lastDate: DateTime.now().add(const Duration(days: 90)),
                        );
                        if (picked != null) setState(() => _matchDate = picked);
                      },
                    ),
                  ),
                  const SizedBox(width: 10),
                  Expanded(
                    child: OutlinedButton.icon(
                      icon: const Icon(Icons.access_time, size: 16),
                      label: Text('Time: ${_matchTime.format(context)}'),
                      onPressed: () async {
                        final picked = await showTimePicker(context: context, initialTime: _matchTime);
                        if (picked != null) setState(() => _matchTime = picked);
                      },
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 20),

              // 4. Officials & Rules
              const Text('Officials & Match Rules', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
              const SizedBox(height: 12),

              Row(
                children: [
                  Expanded(
                    child: TextFormField(
                      controller: _refereeNameCtrl,
                      decoration: const InputDecoration(labelText: 'Referee / Umpire', prefixIcon: Icon(Icons.sports)),
                    ),
                  ),
                  const SizedBox(width: 10),
                  Expanded(
                    child: TextFormField(
                      controller: _scorekeeperNameCtrl,
                      decoration: const InputDecoration(labelText: 'Scorekeeper', prefixIcon: Icon(Icons.edit_note)),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 12),

              if (isCricket)
                TextFormField(
                  controller: _oversCtrl,
                  keyboardType: TextInputType.number,
                  decoration: const InputDecoration(
                    labelText: 'Total Overs per Inning',
                    hintText: '10, 12, 15, or 20',
                    prefixIcon: Icon(Icons.timer),
                  ),
                ),
              const SizedBox(height: 30),

              // Schedule Button
              SizedBox(
                width: double.infinity,
                height: 52,
                child: ElevatedButton(
                  onPressed: _isSubmitting ? null : _scheduleMatch,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppTheme.primaryBlue,
                    foregroundColor: Colors.white,
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                  ),
                  child: _isSubmitting
                      ? const SizedBox(width: 22, height: 22, child: CircularProgressIndicator(strokeWidth: 2.5, color: Colors.white))
                      : const Row(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Icon(Icons.calendar_today),
                            SizedBox(width: 8),
                            Text('Confirm & Schedule Match Fixture', style: TextStyle(fontSize: 15, fontWeight: FontWeight.bold)),
                          ],
                        ),
                ),
              ),
              const SizedBox(height: 20),
            ],
          ),
        ),
      ),
    );
  }
}

