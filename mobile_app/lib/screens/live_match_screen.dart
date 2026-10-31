import 'dart:async';
import 'package:flutter/material.dart';
import '../models/sports_events_models.dart';
import '../services/sports_events_service.dart';
import '../services/auth_service.dart';
import '../theme/app_theme.dart';

class LiveMatchScreen extends StatefulWidget {
  final TournamentMatch match;

  const LiveMatchScreen({super.key, required this.match});

  @override
  State<LiveMatchScreen> createState() => _LiveMatchScreenState();
}

class _LiveMatchScreenState extends State<LiveMatchScreen> {
  late TournamentMatch _match;
  bool _isLoading = false;
  Timer? _pollingTimer;

  int _timerSecondsRemaining = 1200; // 20 mins default
  bool _isClockRunning = false;

  @override
  void initState() {
    super.initState();
    _match = widget.match;
    _initTimerFromMatch();

    // Auto-poll live match updates every 5 seconds if live
    _pollingTimer = Timer.periodic(const Duration(seconds: 5), (_) {
      if (_match.status == 'live') {
        _pollMatchState();
      }
    });
  }

  void _initTimerFromMatch() {
    _isClockRunning = _match.timerState.isRunning;
    final duration = _match.timerState.periodDurationSeconds;
    final elapsed = _match.timerState.elapsedSeconds;
    _timerSecondsRemaining = (duration - elapsed).clamp(0, duration);
  }

  @override
  void dispose() {
    _pollingTimer?.cancel();
    super.dispose();
  }

  Future<void> _pollMatchState() async {
    final updated = await SportsEventsService.instance.getMatchById(_match.id);
    if (updated != null && mounted) {
      setState(() {
        _match = updated;
        _initTimerFromMatch();
      });
    }
  }

  // --- Scoring Event Action ---
  Future<void> _recordScoringEvent({
    required String teamName,
    required String eventType,
    required int pointsDelta,
    required String notes,
  }) async {
    setState(() => _isLoading = true);

    final payload = {
      'teamName': teamName,
      'eventType': eventType,
      'pointsDelta': pointsDelta,
      'notes': notes,
      'timestamp': DateTime.now().toIso8601String(),
    };

    final ok = await SportsEventsService.instance.recordMatchEvent(_match.id, payload);
    if (ok) {
      await _pollMatchState();
    }
    if (mounted) setState(() => _isLoading = false);
  }

  // --- Timer Control ---
  Future<void> _toggleTimer() async {
    final newRunningState = !_isClockRunning;
    final payload = {
      'isRunning': newRunningState,
      'elapsedSeconds': _match.timerState.periodDurationSeconds - _timerSecondsRemaining,
      'period': _match.timerState.period,
    };

    final ok = await SportsEventsService.instance.updateMatchTimer(_match.id, payload);
    if (ok) {
      setState(() => _isClockRunning = newRunningState);
    }
  }

  // --- Tie Breaker Resolution Dialog ---
  void _showTieBreakerDialog() {
    String selectedWinner = _match.teamAName;
    String method = _match.sportName.toLowerCase().contains('cricket') ? 'Super Over' : 'Golden Raid';
    final reasonCtrl = TextEditingController(text: 'Decision resolved per official tournament regulation.');

    showDialog(
      context: context,
      builder: (ctx) {
        return StatefulBuilder(
          builder: (dCtx, setDialogState) {
            return AlertDialog(
              title: const Text('Resolve Match Tie-Breaker', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
              content: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text('Select Winning Team:', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold)),
                  DropdownButtonFormField<String>(
                    value: selectedWinner,
                    isExpanded: true,
                    items: [
                      DropdownMenuItem(value: _match.teamAName, child: Text(_match.teamAName)),
                      DropdownMenuItem(value: _match.teamBName, child: Text(_match.teamBName)),
                    ],
                    onChanged: (v) {
                      if (v != null) setDialogState(() => selectedWinner = v);
                    },
                  ),
                  const SizedBox(height: 12),
                  const Text('Tie-Break Procedure:', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold)),
                  DropdownButtonFormField<String>(
                    value: method,
                    isExpanded: true,
                    items: const [
                      DropdownMenuItem(value: 'Super Over', child: Text('Super Over (Cricket)')),
                      DropdownMenuItem(value: 'Golden Raid', child: Text('Golden Raid (Kabaddi)')),
                      DropdownMenuItem(value: 'Penalty Shootout', child: Text('Penalty Shootout (Football)')),
                      DropdownMenuItem(value: 'Extra Time', child: Text('Extra Time (Basketball)')),
                    ],
                    onChanged: (v) {
                      if (v != null) setDialogState(() => method = v);
                    },
                  ),
                  const SizedBox(height: 12),
                  TextField(
                    controller: reasonCtrl,
                    maxLines: 2,
                    decoration: const InputDecoration(labelText: 'Audited Decision Justification *', isDense: true),
                  ),
                ],
              ),
              actions: [
                TextButton(onPressed: () => Navigator.pop(ctx), child: const Text('Cancel')),
                ElevatedButton(
                  onPressed: () async {
                    final user = AuthService.instance.currentUser.value;
                    final payload = {
                      'winningTeamName': selectedWinner,
                      'method': method,
                      'authorityEmail': user?.email ?? 'referee@gecsheikhpura.org',
                      'reason': reasonCtrl.text.trim(),
                    };

                    final messenger = ScaffoldMessenger.of(context);
                    final nav = Navigator.of(ctx);

                    final ok = await SportsEventsService.instance.resolveTieBreaker(_match.id, payload);
                    if (ok) {
                      nav.pop();
                      _pollMatchState();
                      messenger.showSnackBar(
                        SnackBar(content: Text('✓ Tie-Breaker recorded: $selectedWinner won via $method!'), backgroundColor: AppTheme.successGreen),
                      );
                    }
                  },
                  child: const Text('Confirm Decision'),
                ),
              ],
            );
          },
        );
      },
    );
  }

  // --- Publish Match Result ---
  Future<void> _publishResult() async {
    final confirm = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Publish Official Match Result?'),
        content: Text('This will set the match status to COMPLETED and automatically recalculate the ${_match.sportName} Points Table with verified points.'),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx, false), child: const Text('Cancel')),
          ElevatedButton(
            style: ElevatedButton.styleFrom(backgroundColor: AppTheme.successGreen, foregroundColor: Colors.white),
            onPressed: () => Navigator.pop(ctx, true),
            child: const Text('Publish & Update Standings'),
          ),
        ],
      ),
    );

    if (confirm != true) return;

    setState(() => _isLoading = true);
    final messenger = ScaffoldMessenger.of(context);

    final ok = await SportsEventsService.instance.publishMatchResult(_match.id);
    if (ok) {
      await _pollMatchState();
      messenger.showSnackBar(
        const SnackBar(content: Text('✓ Official Result Published & Standings Recalculated!'), backgroundColor: AppTheme.successGreen),
      );
    }
    if (mounted) setState(() => _isLoading = false);
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;
    final isCricket = _match.sportName.toLowerCase().contains('cricket');
    final isKabaddi = _match.sportName.toLowerCase().contains('kabaddi');
    final isBasketball = _match.sportName.toLowerCase().contains('basketball');
    final isFootball = _match.sportName.toLowerCase().contains('football') || _match.sportName.toLowerCase().contains('soccer');

    final currentUser = AuthService.instance.currentUser.value;
    final canScore = currentUser != null && (currentUser.isAdmin || currentUser.email == 'pk3334238@gmail.com' || currentUser.email == _match.scorekeeperName);

    final minutes = (_timerSecondsRemaining ~/ 60).toString().padLeft(2, '0');
    final seconds = (_timerSecondsRemaining % 60).toString().padLeft(2, '0');

    return Scaffold(
      appBar: AppBar(
        title: Text('${_match.sportName}: ${_match.roundName}', style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
        actions: [
          IconButton(icon: const Icon(Icons.refresh), onPressed: _pollMatchState),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          children: [
            // 1. Live Match Scoreboard Card
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(18),
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  colors: isDark
                      ? [const Color(0xFF1E293B), const Color(0xFF0F172A)]
                      : [const Color(0xFF0F172A), const Color(0xFF1E293B)],
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                ),
                borderRadius: BorderRadius.circular(20),
                boxShadow: [
                  BoxShadow(color: Colors.black.withValues(alpha: 0.3), blurRadius: 12, offset: const Offset(0, 6)),
                ],
              ),
              child: Column(
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                        decoration: BoxDecoration(
                          color: _match.status == 'live' ? AppTheme.dangerRed : AppTheme.accentSky.withValues(alpha: 0.2),
                          borderRadius: BorderRadius.circular(20),
                        ),
                        child: Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            if (_match.status == 'live') ...[
                              const Icon(Icons.circle, size: 8, color: Colors.white),
                              const SizedBox(width: 6),
                            ],
                            Text(
                              _match.status.toUpperCase(),
                              style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Colors.white),
                            ),
                          ],
                        ),
                      ),
                      Text(
                        _match.venue,
                        style: const TextStyle(fontSize: 12, color: Colors.white70),
                      ),
                    ],
                  ),
                  const SizedBox(height: 20),

                  // Teams & Scores Display
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      // Team A
                      Expanded(
                        child: Column(
                          children: [
                            const Icon(Icons.shield, color: AppTheme.accentSky, size: 36),
                            const SizedBox(height: 6),
                            Text(
                              _match.teamAName,
                              textAlign: TextAlign.center,
                              style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Colors.white),
                              maxLines: 2,
                              overflow: TextOverflow.ellipsis,
                            ),
                            const SizedBox(height: 4),
                            Text(
                              '${_match.teamAScore}',
                              style: const TextStyle(fontSize: 32, fontWeight: FontWeight.w900, color: AppTheme.accentSky),
                            ),
                            if (isCricket && _match.scoreDetails.containsKey('teamAOvers'))
                              Text('(${_match.scoreDetails['teamAOvers']} ov)', style: const TextStyle(fontSize: 12, color: Colors.white60)),
                          ],
                        ),
                      ),

                      // VS & Timer
                      Padding(
                        padding: const EdgeInsets.symmetric(horizontal: 12),
                        child: Column(
                          children: [
                            const Text('VS', style: TextStyle(fontSize: 14, fontWeight: FontWeight.bold, color: Colors.white38)),
                            const SizedBox(height: 8),
                            if (isKabaddi)
                              Container(
                                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                                decoration: BoxDecoration(
                                  color: Colors.black.withValues(alpha: 0.4),
                                  borderRadius: BorderRadius.circular(8),
                                  border: Border.all(color: Colors.white24),
                                ),
                                child: Text(
                                  '$minutes:$seconds',
                                  style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Colors.yellowAccent, fontFamily: 'monospace'),
                                ),
                              ),
                          ],
                        ),
                      ),

                      // Team B
                      Expanded(
                        child: Column(
                          children: [
                            const Icon(Icons.shield, color: AppTheme.accentLight, size: 36),
                            const SizedBox(height: 6),
                            Text(
                              _match.teamBName,
                              textAlign: TextAlign.center,
                              style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Colors.white),
                              maxLines: 2,
                              overflow: TextOverflow.ellipsis,
                            ),
                            const SizedBox(height: 4),
                            Text(
                              '${_match.teamBScore}',
                              style: const TextStyle(fontSize: 32, fontWeight: FontWeight.w900, color: AppTheme.accentLight),
                            ),
                            if (isCricket && _match.scoreDetails.containsKey('teamBOvers'))
                              Text('(${_match.scoreDetails['teamBOvers']} ov)', style: const TextStyle(fontSize: 12, color: Colors.white60)),
                          ],
                        ),
                      ),
                    ],
                  ),

                  // Result note if completed
                  if (_match.winnerName != null && _match.winnerName!.isNotEmpty) ...[
                    const SizedBox(height: 16),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                      decoration: BoxDecoration(color: AppTheme.successGreen.withValues(alpha: 0.2), borderRadius: BorderRadius.circular(8)),
                      child: Text(
                        '🏆 Winner: ${_match.winnerName!}',
                        textAlign: TextAlign.center,
                        style: const TextStyle(fontSize: 13, fontWeight: FontWeight.bold, color: Colors.greenAccent),
                      ),
                    ),
                  ],
                ],
              ),
            ),
            const SizedBox(height: 18),

            // 2. Authoritative Timer Controls (for Referee / Scorekeeper)
            if (canScore && isKabaddi)
              Card(
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                child: Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                  child: Row(
                    children: [
                      const Icon(Icons.timer_outlined, color: AppTheme.primaryNavy),
                      const SizedBox(width: 8),
                      Text('Official Match Clock: $minutes:$seconds', style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
                      const Spacer(),
                      ElevatedButton.icon(
                        icon: Icon(_isClockRunning ? Icons.pause : Icons.play_arrow, size: 16),
                        label: Text(_isClockRunning ? 'Pause Clock' : 'Start Clock'),
                        style: ElevatedButton.styleFrom(
                          backgroundColor: _isClockRunning ? AppTheme.warningAmber : AppTheme.successGreen,
                          foregroundColor: Colors.white,
                          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                        ),
                        onPressed: _toggleTimer,
                      ),
                    ],
                  ),
                ),
              ),
            const SizedBox(height: 12),

            // 3. Official Scorekeeper Action Console (Only authorized scorekeeper)
            if (canScore && _match.status != 'completed') ...[
              Card(
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                child: Padding(
                  padding: const EdgeInsets.all(16),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          const Icon(Icons.edit_note, color: AppTheme.primaryNavy),
                          const SizedBox(width: 8),
                          const Text('Scorekeeper Controls', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
                          const Spacer(),
                          TextButton(onPressed: _showTieBreakerDialog, child: const Text('Tie-Breaker')),
                        ],
                      ),
                      const Divider(height: 20),

                      // Scoring Actions for Cricket
                      if (isCricket) ...[
                        Text('Update ${_match.teamAName} Score:', style: const TextStyle(fontSize: 13, fontWeight: FontWeight.bold)),
                        const SizedBox(height: 8),
                        Wrap(
                          spacing: 8,
                          runSpacing: 8,
                          children: [
                            _buildScoreBtn('0 Dot', () => _recordScoringEvent(teamName: _match.teamAName, eventType: 'dot', pointsDelta: 0, notes: 'Dot ball')),
                            _buildScoreBtn('+1 Run', () => _recordScoringEvent(teamName: _match.teamAName, eventType: 'run', pointsDelta: 1, notes: 'Single run')),
                            _buildScoreBtn('+2 Runs', () => _recordScoringEvent(teamName: _match.teamAName, eventType: 'run', pointsDelta: 2, notes: 'Two runs')),
                            _buildScoreBtn('4 FOUR', () => _recordScoringEvent(teamName: _match.teamAName, eventType: 'boundary', pointsDelta: 4, notes: 'Boundary four'), color: AppTheme.primaryBlue),
                            _buildScoreBtn('6 SIX', () => _recordScoringEvent(teamName: _match.teamAName, eventType: 'six', pointsDelta: 6, notes: 'Maximum six!'), color: AppTheme.accentSky),
                            _buildScoreBtn('WICKET', () => _recordScoringEvent(teamName: _match.teamAName, eventType: 'wicket', pointsDelta: 0, notes: 'Wicket fell'), color: AppTheme.dangerRed),
                            _buildScoreBtn('Wide/NB', () => _recordScoringEvent(teamName: _match.teamAName, eventType: 'extra', pointsDelta: 1, notes: 'Extra run')),
                          ],
                        ),
                        const SizedBox(height: 16),
                        Text('Update ${_match.teamBName} Score:', style: const TextStyle(fontSize: 13, fontWeight: FontWeight.bold)),
                        const SizedBox(height: 8),
                        Wrap(
                          spacing: 8,
                          runSpacing: 8,
                          children: [
                            _buildScoreBtn('0 Dot', () => _recordScoringEvent(teamName: _match.teamBName, eventType: 'dot', pointsDelta: 0, notes: 'Dot ball')),
                            _buildScoreBtn('+1 Run', () => _recordScoringEvent(teamName: _match.teamBName, eventType: 'run', pointsDelta: 1, notes: 'Single run')),
                            _buildScoreBtn('4 FOUR', () => _recordScoringEvent(teamName: _match.teamBName, eventType: 'boundary', pointsDelta: 4, notes: 'Boundary four'), color: AppTheme.primaryBlue),
                            _buildScoreBtn('6 SIX', () => _recordScoringEvent(teamName: _match.teamBName, eventType: 'six', pointsDelta: 6, notes: 'Maximum six!'), color: AppTheme.accentSky),
                            _buildScoreBtn('WICKET', () => _recordScoringEvent(teamName: _match.teamBName, eventType: 'wicket', pointsDelta: 0, notes: 'Wicket fell'), color: AppTheme.dangerRed),
                          ],
                        ),
                      ],

                      // Scoring Actions for Kabaddi
                      if (isKabaddi) ...[
                        Text('Score Points for ${_match.teamAName}:', style: const TextStyle(fontSize: 13, fontWeight: FontWeight.bold)),
                        const SizedBox(height: 8),
                        Wrap(
                          spacing: 8,
                          runSpacing: 8,
                          children: [
                            _buildScoreBtn('+1 Raid Pt', () => _recordScoringEvent(teamName: _match.teamAName, eventType: 'raid', pointsDelta: 1, notes: 'Touch Point')),
                            _buildScoreBtn('+1 Bonus', () => _recordScoringEvent(teamName: _match.teamAName, eventType: 'bonus', pointsDelta: 1, notes: 'Bonus Point')),
                            _buildScoreBtn('+2 Super Raid', () => _recordScoringEvent(teamName: _match.teamAName, eventType: 'super_raid', pointsDelta: 2, notes: 'Super Raid!'), color: AppTheme.accentSky),
                            _buildScoreBtn('+1 Tackle', () => _recordScoringEvent(teamName: _match.teamAName, eventType: 'tackle', pointsDelta: 1, notes: 'Successful Tackle')),
                            _buildScoreBtn('+2 Super Tackle', () => _recordScoringEvent(teamName: _match.teamAName, eventType: 'super_tackle', pointsDelta: 2, notes: 'Super Tackle!'), color: AppTheme.primaryBlue),
                            _buildScoreBtn('+2 All Out', () => _recordScoringEvent(teamName: _match.teamAName, eventType: 'all_out', pointsDelta: 2, notes: 'Opponent All Out'), color: AppTheme.primaryNavy),
                          ],
                        ),
                        const SizedBox(height: 14),
                        Text('Score Points for ${_match.teamBName}:', style: const TextStyle(fontSize: 13, fontWeight: FontWeight.bold)),
                        const SizedBox(height: 8),
                        Wrap(
                          spacing: 8,
                          runSpacing: 8,
                          children: [
                            _buildScoreBtn('+1 Raid Pt', () => _recordScoringEvent(teamName: _match.teamBName, eventType: 'raid', pointsDelta: 1, notes: 'Touch Point')),
                            _buildScoreBtn('+1 Bonus', () => _recordScoringEvent(teamName: _match.teamBName, eventType: 'bonus', pointsDelta: 1, notes: 'Bonus Point')),
                            _buildScoreBtn('+2 Super Raid', () => _recordScoringEvent(teamName: _match.teamBName, eventType: 'super_raid', pointsDelta: 2, notes: 'Super Raid!'), color: AppTheme.accentSky),
                            _buildScoreBtn('+1 Tackle', () => _recordScoringEvent(teamName: _match.teamBName, eventType: 'tackle', pointsDelta: 1, notes: 'Successful Tackle')),
                            _buildScoreBtn('+2 Super Tackle', () => _recordScoringEvent(teamName: _match.teamBName, eventType: 'super_tackle', pointsDelta: 2, notes: 'Super Tackle!'), color: AppTheme.primaryBlue),
                            _buildScoreBtn('+2 All Out', () => _recordScoringEvent(teamName: _match.teamBName, eventType: 'all_out', pointsDelta: 2, notes: 'Opponent All Out'), color: AppTheme.primaryNavy),
                          ],
                        ),
                      ],

                      // Scoring Actions for Basketball (Module 3.3)
                      if (isBasketball) ...[
                        Text('Basketball Scoring for ${_match.teamAName}:', style: const TextStyle(fontSize: 13, fontWeight: FontWeight.bold)),
                        const SizedBox(height: 8),
                        Wrap(
                          spacing: 8,
                          runSpacing: 8,
                          children: [
                            _buildScoreBtn('+1 Free Throw', () => _recordScoringEvent(teamName: _match.teamAName, eventType: 'basketball_1pt', pointsDelta: 1, notes: 'Free throw')),
                            _buildScoreBtn('+2 Field Goal', () => _recordScoringEvent(teamName: _match.teamAName, eventType: 'basketball_2pt', pointsDelta: 2, notes: '2-pt basket'), color: AppTheme.primaryBlue),
                            _buildScoreBtn('+3 Three-Pointer', () => _recordScoringEvent(teamName: _match.teamAName, eventType: 'basketball_3pt', pointsDelta: 3, notes: '3-pt shot!'), color: AppTheme.accentSky),
                            _buildScoreBtn('Personal Foul', () => _recordScoringEvent(teamName: _match.teamAName, eventType: 'basketball_foul', pointsDelta: 0, notes: 'Personal foul charged'), color: AppTheme.warningAmber),
                            _buildScoreBtn('Timeout', () => _recordScoringEvent(teamName: _match.teamAName, eventType: 'basketball_timeout', pointsDelta: 0, notes: 'Timeout called')),
                          ],
                        ),
                        const SizedBox(height: 14),
                        Text('Basketball Scoring for ${_match.teamBName}:', style: const TextStyle(fontSize: 13, fontWeight: FontWeight.bold)),
                        const SizedBox(height: 8),
                        Wrap(
                          spacing: 8,
                          runSpacing: 8,
                          children: [
                            _buildScoreBtn('+1 Free Throw', () => _recordScoringEvent(teamName: _match.teamBName, eventType: 'basketball_1pt', pointsDelta: 1, notes: 'Free throw')),
                            _buildScoreBtn('+2 Field Goal', () => _recordScoringEvent(teamName: _match.teamBName, eventType: 'basketball_2pt', pointsDelta: 2, notes: '2-pt basket'), color: AppTheme.primaryBlue),
                            _buildScoreBtn('+3 Three-Pointer', () => _recordScoringEvent(teamName: _match.teamBName, eventType: 'basketball_3pt', pointsDelta: 3, notes: '3-pt shot!'), color: AppTheme.accentSky),
                            _buildScoreBtn('Personal Foul', () => _recordScoringEvent(teamName: _match.teamBName, eventType: 'basketball_foul', pointsDelta: 0, notes: 'Personal foul charged'), color: AppTheme.warningAmber),
                            _buildScoreBtn('Timeout', () => _recordScoringEvent(teamName: _match.teamBName, eventType: 'basketball_timeout', pointsDelta: 0, notes: 'Timeout called')),
                          ],
                        ),
                      ],

                      // General Other Sports Scoring (Football, Volleyball, Badminton, Table Tennis)
                      if (!isCricket && !isKabaddi && !isBasketball) ...[
                        Text('Score for ${_match.teamAName}:', style: const TextStyle(fontSize: 13, fontWeight: FontWeight.bold)),
                        const SizedBox(height: 8),
                        Wrap(
                          spacing: 8,
                          runSpacing: 8,
                          children: [
                            _buildScoreBtn(isFootball ? '+1 Goal' : '+1 Point', () => _recordScoringEvent(teamName: _match.teamAName, eventType: 'point', pointsDelta: 1, notes: 'Score point'), color: AppTheme.primaryBlue),
                            _buildScoreBtn('+2 Points', () => _recordScoringEvent(teamName: _match.teamAName, eventType: 'point', pointsDelta: 2, notes: 'Two points')),
                            _buildScoreBtn('Card / Penalty', () => _recordScoringEvent(teamName: _match.teamAName, eventType: 'penalty', pointsDelta: 0, notes: 'Penalty / Card issued'), color: AppTheme.dangerRed),
                          ],
                        ),
                        const SizedBox(height: 14),
                        Text('Score for ${_match.teamBName}:', style: const TextStyle(fontSize: 13, fontWeight: FontWeight.bold)),
                        const SizedBox(height: 8),
                        Wrap(
                          spacing: 8,
                          runSpacing: 8,
                          children: [
                            _buildScoreBtn(isFootball ? '+1 Goal' : '+1 Point', () => _recordScoringEvent(teamName: _match.teamBName, eventType: 'point', pointsDelta: 1, notes: 'Score point'), color: AppTheme.primaryBlue),
                            _buildScoreBtn('+2 Points', () => _recordScoringEvent(teamName: _match.teamBName, eventType: 'point', pointsDelta: 2, notes: 'Two points')),
                            _buildScoreBtn('Card / Penalty', () => _recordScoringEvent(teamName: _match.teamBName, eventType: 'penalty', pointsDelta: 0, notes: 'Penalty / Card issued'), color: AppTheme.dangerRed),
                          ],
                        ),
                      ],

                      const SizedBox(height: 20),
                      // Conclude Match Button
                      SizedBox(
                        width: double.infinity,
                        height: 46,
                        child: ElevatedButton.icon(
                          icon: const Icon(Icons.check_circle),
                          label: const Text('Publish Official Match Result', style: TextStyle(fontWeight: FontWeight.bold)),
                          style: ElevatedButton.styleFrom(
                            backgroundColor: AppTheme.successGreen,
                            foregroundColor: Colors.white,
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                          ),
                          onPressed: _publishResult,
                        ),
                      ),
                    ],
                  ),
                ),
              ),
              const SizedBox(height: 16),
            ],

            // 4. Ball-by-ball / Event Feed
            Card(
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        const Text('Live Match Feed & Log', style: TextStyle(fontSize: 15, fontWeight: FontWeight.bold)),
                        Text('${_match.events.length} events', style: const TextStyle(fontSize: 12, color: Colors.grey)),
                      ],
                    ),
                    const Divider(height: 20),
                    if (_match.events.isEmpty)
                      const Padding(
                        padding: EdgeInsets.all(24),
                        child: Center(
                          child: Text('Match awaiting start. Live scoring events will stream here ball-by-ball.', textAlign: TextAlign.center, style: TextStyle(color: Colors.grey, fontSize: 13)),
                        ),
                      )
                    else
                      ListView.separated(
                        shrinkWrap: true,
                        physics: const NeverScrollableScrollPhysics(),
                        itemCount: _match.events.reversed.take(20).length,
                        separatorBuilder: (_, __) => const Divider(height: 16),
                        itemBuilder: (ctx, idx) {
                          final event = _match.events.reversed.toList()[idx];
                          return Row(
                            children: [
                              CircleAvatar(
                                radius: 14,
                                backgroundColor: event.pointsDelta > 0 ? AppTheme.primaryBlue.withValues(alpha: 0.15) : Colors.grey.withValues(alpha: 0.15),
                                child: Text(
                                  '+${event.pointsDelta}',
                                  style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: event.pointsDelta > 0 ? AppTheme.primaryBlue : Colors.grey),
                                ),
                              ),
                              const SizedBox(width: 10),
                              Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text(event.notes, style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w600)),
                                    Text('${event.eventType.toUpperCase()} • ${event.timestamp}', style: const TextStyle(fontSize: 11, color: Colors.grey)),
                                  ],
                                ),
                              ),
                            ],
                          );
                        },
                      ),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildScoreBtn(String label, VoidCallback onPressed, {Color? color}) {
    return ElevatedButton(
      style: ElevatedButton.styleFrom(
        backgroundColor: color ?? AppTheme.primaryNavy,
        foregroundColor: Colors.white,
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
      ),
      onPressed: _isLoading ? null : onPressed,
      child: Text(label, style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold)),
    );
  }
}
