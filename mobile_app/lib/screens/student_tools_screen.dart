import 'package:flutter/material.dart';
import '../services/data_service.dart';
import '../theme/app_theme.dart';

class SubjectItem {
  String name;
  int credits;
  int gradePoint;
  String gradeLetter;

  SubjectItem({
    required this.name,
    required this.credits,
    required this.gradePoint,
    required this.gradeLetter,
  });
}

class StudentToolsScreen extends StatefulWidget {
  const StudentToolsScreen({super.key});

  @override
  State<StudentToolsScreen> createState() => _StudentToolsScreenState();
}

class _StudentToolsScreenState extends State<StudentToolsScreen> with SingleTickerProviderStateMixin {
  late TabController _tabController;

  // SGPA State
  final List<SubjectItem> _subjects = [
    SubjectItem(name: 'Data Structures & Algorithms', credits: 4, gradePoint: 9, gradeLetter: 'A+ (9)'),
    SubjectItem(name: 'Object Oriented Programming', credits: 4, gradePoint: 9, gradeLetter: 'A+ (9)'),
    SubjectItem(name: 'Discrete Mathematics', credits: 4, gradePoint: 8, gradeLetter: 'A (8)'),
    SubjectItem(name: 'Digital Logic & Circuit Design', credits: 3, gradePoint: 8, gradeLetter: 'A (8)'),
    SubjectItem(name: 'Data Structures Lab', credits: 2, gradePoint: 10, gradeLetter: 'O (10)'),
    SubjectItem(name: 'Constitution of India', credits: 2, gradePoint: 8, gradeLetter: 'A (8)'),
  ];

  // Attendance State
  final TextEditingController _totalClassesController = TextEditingController(text: '48');
  final TextEditingController _attendedClassesController = TextEditingController(text: '34');
  final double _targetPercent = 75.0;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 2, vsync: this);
  }

  @override
  void dispose() {
    _tabController.dispose();
    _totalClassesController.dispose();
    _attendedClassesController.dispose();
    super.dispose();
  }

  double _calculateSgpa() {
    int totalCredits = 0;
    int totalPoints = 0;
    for (var s in _subjects) {
      totalCredits += s.credits;
      totalPoints += (s.credits * s.gradePoint);
    }
    if (totalCredits == 0) return 0.0;
    return double.parse((totalPoints / totalCredits).toStringAsFixed(2));
  }

  void _addSubject() {
    setState(() {
      _subjects.add(
        SubjectItem(
          name: 'Subject ${_subjects.length + 1}',
          credits: 3,
          gradePoint: 8,
          gradeLetter: 'A (8)',
        ),
      );
    });
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;

    return Scaffold(
      appBar: AppBar(
        title: const Text('Student Tools & Calculators'),
        bottom: TabBar(
          controller: _tabController,
          labelColor: isDark ? AppTheme.accentLight : AppTheme.primaryBlue,
          unselectedLabelColor: isDark ? const Color(0xFF94A3B8) : const Color(0xFF64748B),
          indicatorColor: AppTheme.accentSky,
          indicatorWeight: 3,
          labelStyle: const TextStyle(fontWeight: FontWeight.w700, fontSize: 13),
          tabs: const [
            Tab(text: '🧮 BEU SGPA Calc'),
            Tab(text: '⏱️ 75% Attendance'),
          ],
        ),
      ),
      body: TabBarView(
        controller: _tabController,
        children: [
          _buildSgpaTab(context, isDark, theme),
          _buildAttendanceTab(context, isDark, theme),
        ],
      ),
    );
  }

  Widget _buildSgpaTab(BuildContext context, bool isDark, ThemeData theme) {
    final sgpa = _calculateSgpa();

    final gradeOptions = [
      {'letter': 'O (10)', 'pts': 10},
      {'letter': 'A+ (9)', 'pts': 9},
      {'letter': 'A (8)', 'pts': 8},
      {'letter': 'B+ (7)', 'pts': 7},
      {'letter': 'B (6)', 'pts': 6},
      {'letter': 'C (5)', 'pts': 5},
      {'letter': 'P (4)', 'pts': 4},
      {'letter': 'F (0)', 'pts': 0},
    ];

    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Result Banner
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              gradient: LinearGradient(
                colors: isDark
                    ? [const Color(0xFF1E3A8A), const Color(0xFF0F172A)]
                    : [const Color(0xFFEFF6FF), const Color(0xFFDBEAFE)],
              ),
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: AppTheme.accentSky.withValues(alpha: 0.3)),
            ),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text(
                      'Calculated Semester SGPA',
                      style: TextStyle(fontSize: 11, fontWeight: FontWeight.w700, color: AppTheme.accentSky),
                    ),
                    Text(
                      '$sgpa',
                      style: TextStyle(
                        fontSize: 32,
                        fontWeight: FontWeight.w900,
                        color: isDark ? Colors.white : AppTheme.primaryNavy,
                      ),
                    ),
                    Text(
                      sgpa >= 8.5
                          ? '🌟 First Class with Distinction'
                          : sgpa >= 6.5
                              ? '✓ First Class'
                              : 'Passed',
                      style: TextStyle(
                        fontSize: 11,
                        fontWeight: FontWeight.w600,
                        color: isDark ? const Color(0xFFCBD5E1) : const Color(0xFF475569),
                      ),
                    ),
                  ],
                ),
                ElevatedButton.icon(
                  onPressed: () => DataService.instance.launchExternalUrl('https://www.apnacollegebihar.online/cgpa-calculator'),
                  icon: const Icon(Icons.open_in_new, size: 14),
                  label: const Text('CGPA Tool'),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppTheme.primaryBlue,
                    foregroundColor: Colors.white,
                    textStyle: const TextStyle(fontSize: 11, fontWeight: FontWeight.w700),
                  ),
                ),
              ],
            ),
          ),

          const SizedBox(height: 16),

          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                'Semester Subjects & Grades',
                style: TextStyle(
                  fontSize: 14,
                  fontWeight: FontWeight.w700,
                  color: isDark ? Colors.white : AppTheme.primaryNavy,
                ),
              ),
              TextButton.icon(
                onPressed: _addSubject,
                icon: const Icon(Icons.add, size: 16),
                label: const Text('Add Subject'),
              ),
            ],
          ),

          ..._subjects.asMap().entries.map((entry) {
            final index = entry.key;
            final sub = entry.value;

            return Card(
              margin: const EdgeInsets.only(bottom: 8),
              child: Padding(
                padding: const EdgeInsets.all(12),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Expanded(
                          child: TextFormField(
                            initialValue: sub.name,
                            decoration: const InputDecoration(
                              isDense: true,
                              contentPadding: EdgeInsets.symmetric(horizontal: 8, vertical: 6),
                              border: UnderlineInputBorder(),
                            ),
                            style: const TextStyle(fontSize: 12.5, fontWeight: FontWeight.w700),
                            onChanged: (val) => sub.name = val,
                          ),
                        ),
                        if (_subjects.length > 1)
                          IconButton(
                            icon: const Icon(Icons.delete_outline, size: 18, color: AppTheme.dangerRed),
                            onPressed: () => setState(() => _subjects.removeAt(index)),
                            padding: EdgeInsets.zero,
                            constraints: const BoxConstraints(),
                          ),
                      ],
                    ),
                    const SizedBox(height: 8),
                    Row(
                      children: [
                        Expanded(
                          child: Row(
                            children: [
                              const Text('Credits: ', style: TextStyle(fontSize: 11)),
                              DropdownButton<int>(
                                value: sub.credits,
                                isDense: true,
                                items: [1, 2, 3, 4, 5].map((c) {
                                  return DropdownMenuItem(value: c, child: Text('$c', style: const TextStyle(fontSize: 11)));
                                }).toList(),
                                onChanged: (val) {
                                  if (val != null) setState(() => sub.credits = val);
                                },
                              ),
                            ],
                          ),
                        ),
                        Expanded(
                          child: Row(
                            children: [
                              const Text('Grade: ', style: TextStyle(fontSize: 11)),
                              DropdownButton<String>(
                                value: sub.gradeLetter,
                                isDense: true,
                                items: gradeOptions.map((g) {
                                  return DropdownMenuItem(
                                    value: g['letter'] as String,
                                    child: Text(g['letter'] as String, style: const TextStyle(fontSize: 11)),
                                  );
                                }).toList(),
                                onChanged: (val) {
                                  if (val != null) {
                                    final opt = gradeOptions.firstWhere((element) => element['letter'] == val);
                                    setState(() {
                                      sub.gradeLetter = val;
                                      sub.gradePoint = opt['pts'] as int;
                                    });
                                  }
                                },
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            );
          }),
        ],
      ),
    );
  }

  Widget _buildAttendanceTab(BuildContext context, bool isDark, ThemeData theme) {
    final total = int.tryParse(_totalClassesController.text) ?? 0;
    final attended = int.tryParse(_attendedClassesController.text) ?? 0;

    double currentPercent = total > 0 ? (attended / total) * 100 : 0.0;
    currentPercent = double.parse(currentPercent.toStringAsFixed(1));

    int safeBunks = 0;
    int classesNeeded = 0;

    if (total > 0) {
      if (currentPercent >= _targetPercent) {
        // Can bunk: attended / (total + x) >= target/100
        safeBunks = ((attended * 100 / _targetPercent) - total).floor();
        if (safeBunks < 0) safeBunks = 0;
      } else {
        // Classes needed: (attended + y) / (total + y) >= target/100
        // attended + y >= (total + y) * 0.75
        // y * 0.25 >= 0.75 * total - attended
        classesNeeded = (((_targetPercent * total) - (100 * attended)) / (100 - _targetPercent)).ceil();
        if (classesNeeded < 0) classesNeeded = 0;
      }
    }

    final isSafe = currentPercent >= _targetPercent;

    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Attendance Percentage Banner
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: isSafe
                  ? (isDark ? const Color(0xFF064E3B) : const Color(0xFFECFDF5))
                  : (isDark ? const Color(0xFF7F1D1D) : const Color(0xFFFEF2F2)),
              borderRadius: BorderRadius.circular(12),
              border: Border.all(
                color: isSafe ? AppTheme.successGreen : AppTheme.dangerRed,
              ),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      'Current Attendance Status',
                      style: TextStyle(
                        fontSize: 11,
                        fontWeight: FontWeight.w700,
                        color: isSafe ? AppTheme.successGreen : AppTheme.dangerRed,
                      ),
                    ),
                    Text(
                      '$currentPercent%',
                      style: TextStyle(
                        fontSize: 26,
                        fontWeight: FontWeight.w900,
                        color: isSafe ? AppTheme.successGreen : AppTheme.dangerRed,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 8),
                Text(
                  isSafe
                      ? '🎉 Good Standing! You can safely bunk the next $safeBunks classes and still maintain ${ _targetPercent.toInt()}% attendance.'
                      : '⚠️ Warning! You are below ${ _targetPercent.toInt()}%. You must attend the next $classesNeeded consecutive classes without missing.',
                  style: TextStyle(
                    fontSize: 12,
                    fontWeight: FontWeight.w600,
                    color: isDark ? Colors.white : AppTheme.primaryNavy,
                    height: 1.4,
                  ),
                ),
              ],
            ),
          ),

          const SizedBox(height: 20),

          Text(
            'Classes Conducted (Held) *',
            style: TextStyle(
              fontSize: 12.5,
              fontWeight: FontWeight.w600,
              color: isDark ? Colors.white : AppTheme.primaryNavy,
            ),
          ),
          const SizedBox(height: 6),
          TextField(
            controller: _totalClassesController,
            keyboardType: TextInputType.number,
            decoration: InputDecoration(
              filled: true,
              fillColor: isDark ? const Color(0xFF1E293B) : Colors.white,
              border: OutlineInputBorder(borderRadius: BorderRadius.circular(8)),
              contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
            ),
            onChanged: (val) => setState(() {}),
          ),

          const SizedBox(height: 14),

          Text(
            'Classes Attended *',
            style: TextStyle(
              fontSize: 12.5,
              fontWeight: FontWeight.w600,
              color: isDark ? Colors.white : AppTheme.primaryNavy,
            ),
          ),
          const SizedBox(height: 6),
          TextField(
            controller: _attendedClassesController,
            keyboardType: TextInputType.number,
            decoration: InputDecoration(
              filled: true,
              fillColor: isDark ? const Color(0xFF1E293B) : Colors.white,
              border: OutlineInputBorder(borderRadius: BorderRadius.circular(8)),
              contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
            ),
            onChanged: (val) => setState(() {}),
          ),

          const SizedBox(height: 20),

          // Bihar Engineering University 75% Rule Notice
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: isDark ? const Color(0xFF1E293B) : const Color(0xFFF1F5F9),
              borderRadius: BorderRadius.circular(8),
              border: Border.all(color: theme.dividerColor),
            ),
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Icon(Icons.info_outline, size: 16, color: AppTheme.accentSky),
                const SizedBox(width: 8),
                Expanded(
                  child: Text(
                    'BEU Statutory Rule: Minimum 75% aggregate attendance is mandatory across all theory and laboratory courses to qualify for university end-semester examinations.',
                    style: TextStyle(
                      fontSize: 10.5,
                      color: isDark ? const Color(0xFF94A3B8) : const Color(0xFF64748B),
                      height: 1.4,
                    ),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
