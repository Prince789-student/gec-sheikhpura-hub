import 'package:flutter/material.dart';
import '../models/sports_events_models.dart';
import '../services/sports_events_service.dart';
import '../services/auth_service.dart';
import '../theme/app_theme.dart';

class TeamRegistrationScreen extends StatefulWidget {
  final SportItem? initialSport;

  const TeamRegistrationScreen({super.key, this.initialSport});

  @override
  State<TeamRegistrationScreen> createState() => _TeamRegistrationScreenState();
}

class _TeamRegistrationScreenState extends State<TeamRegistrationScreen> {
  final _formKey = GlobalKey<FormState>();

  final _teamNameCtrl = TextEditingController();
  final _captainNameCtrl = TextEditingController();
  final _captainRegNoCtrl = TextEditingController();
  final _captainPhoneCtrl = TextEditingController();

  String _selectedSport = 'Cricket';
  String _selectedDepartment = 'Computer Science & Engineering';
  String _selectedYear = '3rd Year';

  final List<String> _departments = [
    'Computer Science & Engineering',
    'Civil Engineering',
    'Mechanical Engineering',
    'Electrical Engineering',
    'Electronics & Communication',
  ];

  final List<String> _years = [
    '1st Year',
    '2nd Year',
    '3rd Year',
    '4th Year',
  ];

  final List<String> _sportsList = [
    'Cricket',
    'Kabaddi',
    'Basketball',
    'Volleyball',
    'Football',
    'Badminton (Doubles)',
    'Table Tennis (Doubles)',
    'Athletics (Relay 4x100m)',
  ];

  // Squad Players list
  final List<Map<String, dynamic>> _players = [];

  bool _isSubmitting = false;
  String? _errorMessage;

  @override
  void initState() {
    super.initState();
    if (widget.initialSport != null) {
      _selectedSport = widget.initialSport!.name;
    }

    final user = AuthService.instance.currentUser.value;
    if (user != null) {
      _captainNameCtrl.text = user.displayName;
      if (user.regNo.isNotEmpty) _captainRegNoCtrl.text = user.regNo;
      if (user.phone.isNotEmpty) _captainPhoneCtrl.text = user.phone;
      if (user.branch.isNotEmpty) {
        if (_departments.any((d) => d.toLowerCase().contains(user.branch.toLowerCase()))) {
          _selectedDepartment = _departments.firstWhere((d) => d.toLowerCase().contains(user.branch.toLowerCase()));
        }
      }
    }

    _initializeInitialSquad();
  }

  void _initializeInitialSquad() {
    _players.clear();
    // Default: Add Captain as Player 1
    final user = AuthService.instance.currentUser.value;
    _players.add({
      'name': user?.displayName ?? 'Captain',
      'regNo': user?.regNo ?? '',
      'role': _getDefaultRoleForSport(_selectedSport),
      'battingHand': 'Right Hand',
      'bowlingStyle': 'Right-arm medium',
      'isSubstitute': false,
    });
  }

  String _getDefaultRoleForSport(String sport) {
    if (sport.toLowerCase().contains('cricket')) return 'All-Rounder';
    if (sport.toLowerCase().contains('kabaddi')) return 'All-Rounder';
    if (sport.toLowerCase().contains('basketball')) return 'Point Guard';
    if (sport.toLowerCase().contains('football')) return 'Midfielder';
    return 'Player';
  }

  List<String> _getRolesForSport(String sport) {
    if (sport.toLowerCase().contains('cricket')) {
      return ['Batsman', 'Bowler', 'All-Rounder', 'Wicketkeeper'];
    } else if (sport.toLowerCase().contains('kabaddi')) {
      return ['Raider', 'Defender', 'All-Rounder'];
    } else if (sport.toLowerCase().contains('basketball')) {
      return ['Point Guard', 'Shooting Guard', 'Small Forward', 'Power Forward', 'Center'];
    } else if (sport.toLowerCase().contains('football')) {
      return ['Forward', 'Midfielder', 'Defender', 'Goalkeeper'];
    }
    return ['Player', 'Substitute'];
  }

  int _getMinSquadSize(String sport) {
    if (sport.toLowerCase().contains('cricket')) return 11;
    if (sport.toLowerCase().contains('kabaddi')) return 7;
    if (sport.toLowerCase().contains('basketball')) return 5;
    if (sport.toLowerCase().contains('football')) return 11;
    return 2;
  }

  int _getMaxSquadSize(String sport) {
    if (sport.toLowerCase().contains('cricket')) return 16;
    if (sport.toLowerCase().contains('kabaddi')) return 12;
    if (sport.toLowerCase().contains('basketball')) return 12;
    if (sport.toLowerCase().contains('football')) return 18;
    return 4;
  }

  void _addPlayer() {
    final max = _getMaxSquadSize(_selectedSport);
    if (_players.length >= max) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Maximum squad limit of $max players reached for $_selectedSport.')),
      );
      return;
    }

    setState(() {
      _players.add({
        'name': '',
        'regNo': '',
        'role': _getDefaultRoleForSport(_selectedSport),
        'battingHand': 'Right Hand',
        'bowlingStyle': 'None',
        'isSubstitute': _players.length >= _getMinSquadSize(_selectedSport),
      });
    });
  }

  void _removePlayer(int index) {
    if (_players.length <= 1) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Squad must have at least the Captain.')),
      );
      return;
    }
    setState(() => _players.removeAt(index));
  }

  Future<void> _submitTeamRegistration() async {
    if (!_formKey.currentState!.validate()) return;

    final minSquad = _getMinSquadSize(_selectedSport);
    if (_players.length < minSquad) {
      setState(() => _errorMessage = 'Squad must have at least $minSquad players for $_selectedSport.');
      return;
    }

    // Validate player names
    for (int i = 0; i < _players.length; i++) {
      if ((_players[i]['name'] as String).trim().isEmpty) {
        setState(() => _errorMessage = 'Please enter name for Player ${i + 1}.');
        return;
      }
    }

    final user = AuthService.instance.currentUser.value;
    if (user == null) {
      setState(() => _errorMessage = 'Please sign in with Google to register a squad.');
      return;
    }

    setState(() {
      _isSubmitting = true;
      _errorMessage = null;
    });

    final payload = {
      'teamName': _teamNameCtrl.text.trim(),
      'sport': _selectedSport,
      'department': _selectedDepartment,
      'academicYear': _selectedYear,
      'captainName': _captainNameCtrl.text.trim(),
      'captainEmail': user.email,
      'captainRegNo': _captainRegNoCtrl.text.trim(),
      'captainPhone': _captainPhoneCtrl.text.trim(),
      'players': _players,
    };

    final ok = await SportsEventsService.instance.registerTeam(payload);

    if (!mounted) return;
    setState(() => _isSubmitting = false);

    if (ok) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('✓ ${_teamNameCtrl.text.trim()} submitted successfully! Pending Sports Committee approval.'),
          backgroundColor: AppTheme.successGreen,
        ),
      );
      Navigator.pop(context);
    } else {
      setState(() => _errorMessage = 'Failed to submit team registration. Please check inputs.');
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;
    final isCricket = _selectedSport.toLowerCase().contains('cricket');

    return Scaffold(
      appBar: AppBar(
        title: const Text('Register Sports Squad', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18)),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(18),
        child: Form(
          key: _formKey,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Info Banner
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: AppTheme.primaryNavy.withValues(alpha: 0.08),
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: AppTheme.primaryNavy.withValues(alpha: 0.2)),
                ),
                child: Row(
                  children: [
                    const Icon(Icons.sports, color: AppTheme.primaryNavy, size: 22),
                    const SizedBox(width: 10),
                    Expanded(
                      child: Text(
                        'Team registration requires verification by GEC Sports Committee. Min squad for $_selectedSport: ${_getMinSquadSize(_selectedSport)} players.',
                        style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w500),
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

              // 1. Team Basics
              const Text('Team Identity', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
              const SizedBox(height: 12),

              TextFormField(
                controller: _teamNameCtrl,
                decoration: const InputDecoration(
                  labelText: 'Team / Squad Name *',
                  hintText: 'e.g. CSE Thunderbolts / Bajidpur Warriors',
                  prefixIcon: Icon(Icons.shield_outlined),
                ),
                validator: (v) => (v == null || v.trim().isEmpty) ? 'Enter team name' : null,
              ),
              const SizedBox(height: 14),

              DropdownButtonFormField<String>(
                value: _selectedSport,
                decoration: const InputDecoration(labelText: 'Sport Category *', prefixIcon: Icon(Icons.emoji_events)),
                items: _sportsList.map((s) => DropdownMenuItem(value: s, child: Text(s))).toList(),
                onChanged: (v) {
                  if (v != null) {
                    setState(() {
                      _selectedSport = v;
                      _initializeInitialSquad();
                    });
                  }
                },
              ),
              const SizedBox(height: 14),

              Row(
                children: [
                  Expanded(
                    child: DropdownButtonFormField<String>(
                      value: _selectedDepartment,
                      decoration: const InputDecoration(labelText: 'Department *', prefixIcon: Icon(Icons.school)),
                      items: _departments.map((d) => DropdownMenuItem(value: d, child: Text(d, style: const TextStyle(fontSize: 11.5)))).toList(),
                      onChanged: (v) {
                        if (v != null) setState(() => _selectedDepartment = v);
                      },
                    ),
                  ),
                  const SizedBox(width: 10),
                  Expanded(
                    child: DropdownButtonFormField<String>(
                      value: _selectedYear,
                      decoration: const InputDecoration(labelText: 'Academic Year *', prefixIcon: Icon(Icons.calendar_today)),
                      items: _years.map((y) => DropdownMenuItem(value: y, child: Text(y))).toList(),
                      onChanged: (v) {
                        if (v != null) setState(() => _selectedYear = v);
                      },
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 20),

              // 2. Captain Details
              const Text('Captain / Team Representative', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
              const SizedBox(height: 12),

              TextFormField(
                controller: _captainNameCtrl,
                decoration: const InputDecoration(labelText: 'Captain Full Name *', prefixIcon: Icon(Icons.person)),
                validator: (v) => (v == null || v.trim().isEmpty) ? 'Enter captain name' : null,
              ),
              const SizedBox(height: 12),

              Row(
                children: [
                  Expanded(
                    child: TextFormField(
                      controller: _captainRegNoCtrl,
                      decoration: const InputDecoration(labelText: 'BEU Reg No. *', prefixIcon: Icon(Icons.badge)),
                      validator: (v) => (v == null || v.trim().isEmpty) ? 'Required' : null,
                    ),
                  ),
                  const SizedBox(width: 10),
                  Expanded(
                    child: TextFormField(
                      controller: _captainPhoneCtrl,
                      keyboardType: TextInputType.phone,
                      decoration: const InputDecoration(labelText: 'Mobile Number *', prefixIcon: Icon(Icons.phone)),
                      validator: (v) => (v == null || v.trim().length < 10) ? 'Enter valid phone' : null,
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 24),

              // 3. Squad Builder
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text('Squad Players (${_players.length}/${_getMaxSquadSize(_selectedSport)})', style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
                  TextButton.icon(
                    onPressed: _addPlayer,
                    icon: const Icon(Icons.add_circle, size: 18),
                    label: const Text('Add Player'),
                  ),
                ],
              ),
              const SizedBox(height: 8),

              ..._players.asMap().entries.map((entry) {
                final idx = entry.key;
                final player = entry.value;
                final isPlaying = idx < _getMinSquadSize(_selectedSport);

                return Card(
                  margin: const EdgeInsets.only(bottom: 12),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                  child: Padding(
                    padding: const EdgeInsets.all(12),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          children: [
                            CircleAvatar(
                              radius: 12,
                              backgroundColor: isPlaying ? AppTheme.primaryNavy : Colors.grey,
                              child: Text('${idx + 1}', style: const TextStyle(fontSize: 11, color: Colors.white, fontWeight: FontWeight.bold)),
                            ),
                            const SizedBox(width: 8),
                            Text(
                              idx == 0 ? 'Player 1 (Captain)' : 'Player ${idx + 1}',
                              style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13),
                            ),
                            const Spacer(),
                            Chip(
                              label: Text(isPlaying ? 'Playing XI' : 'Substitute', style: const TextStyle(fontSize: 10, fontWeight: FontWeight.bold)),
                              backgroundColor: isPlaying ? AppTheme.accentSky.withValues(alpha: 0.15) : Colors.grey.withValues(alpha: 0.1),
                              padding: EdgeInsets.zero,
                              materialTapTargetSize: MaterialTapTargetSize.shrinkWrap,
                            ),
                            if (idx > 0)
                              IconButton(
                                icon: const Icon(Icons.delete_outline, size: 20, color: AppTheme.dangerRed),
                                onPressed: () => _removePlayer(idx),
                              ),
                          ],
                        ),
                        const SizedBox(height: 8),
                        Row(
                          children: [
                            Expanded(
                              flex: 2,
                              child: TextFormField(
                                initialValue: player['name'] as String,
                                decoration: const InputDecoration(labelText: 'Name *', isDense: true),
                                onChanged: (v) => player['name'] = v,
                              ),
                            ),
                            const SizedBox(width: 8),
                            Expanded(
                              flex: 2,
                              child: TextFormField(
                                initialValue: player['regNo'] as String,
                                decoration: const InputDecoration(labelText: 'Reg No.', isDense: true),
                                onChanged: (v) => player['regNo'] = v,
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 8),
                        Row(
                          children: [
                            Expanded(
                              child: DropdownButtonFormField<String>(
                                value: player['role'] as String,
                                decoration: const InputDecoration(labelText: 'Role', isDense: true),
                                items: _getRolesForSport(_selectedSport).map((r) => DropdownMenuItem(value: r, child: Text(r, style: const TextStyle(fontSize: 12)))).toList(),
                                onChanged: (v) {
                                  if (v != null) setState(() => player['role'] = v);
                                },
                              ),
                            ),
                            if (isCricket) ...[
                              const SizedBox(width: 8),
                              Expanded(
                                child: DropdownButtonFormField<String>(
                                  value: player['battingHand'] as String,
                                  decoration: const InputDecoration(labelText: 'Batting', isDense: true),
                                  items: const [
                                    DropdownMenuItem(value: 'Right Hand', child: Text('Right Hand', style: TextStyle(fontSize: 12))),
                                    DropdownMenuItem(value: 'Left Hand', child: Text('Left Hand', style: TextStyle(fontSize: 12))),
                                  ],
                                  onChanged: (v) {
                                    if (v != null) setState(() => player['battingHand'] = v);
                                  },
                                ),
                              ),
                            ],
                          ],
                        ),
                      ],
                    ),
                  ),
                );
              }),

              const SizedBox(height: 24),

              // Submit Button
              SizedBox(
                width: double.infinity,
                height: 52,
                child: ElevatedButton(
                  onPressed: _isSubmitting ? null : _submitTeamRegistration,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppTheme.primaryNavy,
                    foregroundColor: Colors.white,
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                  ),
                  child: _isSubmitting
                      ? const SizedBox(width: 22, height: 22, child: CircularProgressIndicator(strokeWidth: 2.5, color: Colors.white))
                      : const Row(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Icon(Icons.send),
                            SizedBox(width: 8),
                            Text('Submit Squad for Approval', style: TextStyle(fontSize: 15, fontWeight: FontWeight.bold)),
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

