import 'package:flutter/material.dart';
import '../services/data_service.dart';
import '../services/navigation_service.dart';
import '../theme/app_theme.dart';

class AcademicsScreen extends StatefulWidget {
  const AcademicsScreen({super.key});

  @override
  State<AcademicsScreen> createState() => _AcademicsScreenState();
}

class _AcademicsScreenState extends State<AcademicsScreen> with SingleTickerProviderStateMixin {
  late TabController _tabController;

  @override
  void initState() {
    super.initState();
    final initialTab = NavigationService.instance.academicsSubTab.value.clamp(0, 3);
    _tabController = TabController(length: 4, vsync: this, initialIndex: initialTab);
    NavigationService.instance.academicsSubTab.addListener(_onSubTabNotified);
  }

  void _onSubTabNotified() {
    final target = NavigationService.instance.academicsSubTab.value.clamp(0, 3);
    if (_tabController.index != target && mounted) {
      _tabController.animateTo(target);
    }
  }

  @override
  void dispose() {
    NavigationService.instance.academicsSubTab.removeListener(_onSubTabNotified);
    _tabController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;

    final tools = [
      {'title': 'BEU Result Portal', 'subtitle': 'Check semester results & grade cards', 'url': 'https://www.apnacollegebihar.online/', 'icon': '🌐'},
      {'title': 'B.Tech Notes Hub', 'subtitle': 'CSE, Civil, Mech & EE semester lecture notes', 'url': 'https://www.apnacollegebihar.online/notes', 'icon': '📖'},
      {'title': 'Previous Year Questions (PYQs)', 'subtitle': 'Solved university exam papers (1st - 8th Sem)', 'url': 'https://www.apnacollegebihar.online/pyq', 'icon': '📝'},
      {'title': 'BEU Syllabus Repository', 'subtitle': 'Updated AICTE model curriculum for Bihar', 'url': 'https://www.apnacollegebihar.online/syllabus', 'icon': '📋'},
      {'title': 'SGPA & CGPA Calculator', 'subtitle': 'Exact BEU grading formula converter', 'url': 'https://www.apnacollegebihar.online/cgpa-calculator', 'icon': '🧮'},
      {'title': '75% Attendance Tracker', 'subtitle': 'Plan classes needed to avoid debarment', 'url': 'https://www.apnacollegebihar.online/attendance-tracker', 'icon': '⏱️'},
      {'title': 'Free Senior Mentorship', 'subtitle': 'Get guidance from placed BEU seniors', 'url': 'https://www.apnacollegebihar.online/mentorship', 'icon': '👥'},
    ];

    return Scaffold(
      appBar: AppBar(
        title: const Text('Academics & Admissions'),
        bottom: TabBar(
          controller: _tabController,
          isScrollable: true,
          tabAlignment: TabAlignment.start,
          labelColor: isDark ? AppTheme.accentLight : AppTheme.primaryBlue,
          unselectedLabelColor: isDark ? const Color(0xFF94A3B8) : const Color(0xFF64748B),
          indicatorColor: AppTheme.accentSky,
          indicatorWeight: 3,
          labelStyle: const TextStyle(fontWeight: FontWeight.w700, fontSize: 12.5),
          tabs: const [
            Tab(text: '📚 Apna College Hub'),
            Tab(text: '🏛️ Departments'),
            Tab(text: '🎓 Cutoffs & Seats'),
            Tab(text: '💼 Training & Placements'),
          ],
        ),
      ),
      body: TabBarView(
        controller: _tabController,
        children: [
          // 1. Study Hub Tab
          SingleChildScrollView(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Partner Strip
                Container(
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    gradient: LinearGradient(
                      colors: isDark
                          ? [const Color(0xFF1E3A8A), const Color(0xFF0F172A)]
                          : [const Color(0xFFDBEAFE), const Color(0xFFEFF6FF)],
                    ),
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(color: AppTheme.accentSky.withValues(alpha: 0.3)),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Row(
                        children: [
                          Text('📚', style: TextStyle(fontSize: 28)),
                          SizedBox(width: 10),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text('Apna College Bihar Partner', style: TextStyle(fontSize: 11, fontWeight: FontWeight.w700, color: AppTheme.accentSky)),
                                Text('Official Academic Study Platform', style: TextStyle(fontSize: 14, fontWeight: FontWeight.w800)),
                              ],
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 8),
                      Text(
                        'All B.Tech semester notes, BEU syllabi, question papers, and grading tools are powered directly by Apna College Bihar to avoid duplication.',
                        style: TextStyle(fontSize: 11.5, color: isDark ? const Color(0xFFCBD5E1) : const Color(0xFF475569), height: 1.4),
                      ),
                      const SizedBox(height: 12),
                      SizedBox(
                        width: double.infinity,
                        child: ElevatedButton.icon(
                          onPressed: () => DataService.instance.launchExternalUrl('https://www.apnacollegebihar.online/'),
                          icon: const Icon(Icons.open_in_new, size: 16),
                          label: const Text('Open Apna College Bihar Portal'),
                          style: ElevatedButton.styleFrom(
                            backgroundColor: AppTheme.primaryBlue,
                            foregroundColor: Colors.white,
                            padding: const EdgeInsets.symmetric(vertical: 10),
                            textStyle: const TextStyle(fontSize: 12.5, fontWeight: FontWeight.w700),
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                          ),
                        ),
                      ),
                    ],
                  ),
                ),

                const SizedBox(height: 20),
                Text('BEU Academic Quick Utilities', style: TextStyle(fontSize: 15, fontWeight: FontWeight.w700, color: isDark ? Colors.white : AppTheme.primaryNavy)),
                const SizedBox(height: 10),

                ...tools.map((tool) {
                  return Card(
                    margin: const EdgeInsets.only(bottom: 8),
                    child: ListTile(
                      dense: true,
                      contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 2),
                      leading: Text(tool['icon']!, style: const TextStyle(fontSize: 22)),
                      title: Text(tool['title']!, style: TextStyle(fontSize: 13, fontWeight: FontWeight.w700, color: isDark ? Colors.white : AppTheme.primaryNavy)),
                      subtitle: Text(tool['subtitle']!, style: TextStyle(fontSize: 10.5, color: isDark ? const Color(0xFF94A3B8) : const Color(0xFF64748B))),
                      trailing: const Icon(Icons.arrow_forward_ios, size: 12, color: AppTheme.accentSky),
                      onTap: () => DataService.instance.launchExternalUrl(tool['url']!),
                    ),
                  );
                }),
              ],
            ),
          ),

          // 2. Departments Tab
          ListView(
            padding: const EdgeInsets.all(16),
            children: [
              _buildDeptCard(
                context: context,
                name: 'Computer Science & Engineering (CSE)',
                intake: '60 Seats',
                desc: 'Modern programming laboratories, cloud computing, AI & Machine Learning, Data Structures, and Web Technologies. HOD Office: Academic Block A.',
              ),
              _buildDeptCard(
                context: context,
                name: 'Civil Engineering (CE)',
                intake: '60 Seats',
                desc: 'Surveying labs, total stations, fluid mechanics, concrete structure testing, environmental engineering, and geotechnical labs. HOD Office: Block B.',
              ),
              _buildDeptCard(
                context: context,
                name: 'Mechanical Engineering (ME)',
                intake: '60 Seats',
                desc: 'Machine shop, CNC lathe, CAD/CAM workstations, IC engine testing lab, metallurgy, and thermodynamics. Central Workshop adjacent to sports ground.',
              ),
              _buildDeptCard(
                context: context,
                name: 'Electrical Engineering (EE)',
                intake: '60 Seats',
                desc: 'Power electronics, high voltage machines lab, circuit analysis, simulation software (MATLAB), and renewable energy systems. Block C.',
              ),
            ],
          ),

          // 3. Cutoffs & Admissions Tab
          ListView(
            padding: const EdgeInsets.all(16),
            children: [
              // UGEAC Banner
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: isDark ? const Color(0xFF1E293B) : const Color(0xFFF1F5F9),
                  borderRadius: BorderRadius.circular(8),
                  border: Border.all(color: theme.dividerColor),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text('BCECEB UGEAC Bihar Counselling', style: TextStyle(fontSize: 13, fontWeight: FontWeight.w700, color: AppTheme.accentSky)),
                    const SizedBox(height: 4),
                    Text(
                      'Admissions to all 240 B.Tech seats are conducted through BCECEB Bihar Under Graduate Engineering Admission Counselling (UGEAC) on the basis of JEE Main percentile.',
                      style: TextStyle(fontSize: 11, color: isDark ? const Color(0xFFCBD5E1) : const Color(0xFF475569), height: 1.4),
                    ),
                  ],
                ),
              ),

              const SizedBox(height: 14),
              Text('Recent Opening & Closing Cutoff Ranks (UGEAC)', style: TextStyle(fontSize: 14, fontWeight: FontWeight.w700, color: isDark ? Colors.white : AppTheme.primaryNavy)),
              const SizedBox(height: 8),

              ...DataService.instance.cutoffRecords.map((c) {
                return Card(
                  margin: const EdgeInsets.only(bottom: 8),
                  child: Padding(
                    padding: const EdgeInsets.all(12),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(c.branch, style: TextStyle(fontSize: 12.5, fontWeight: FontWeight.w700, color: isDark ? Colors.white : AppTheme.primaryNavy)),
                            const SizedBox(height: 2),
                            Text('Category: ${c.category}', style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w600, color: AppTheme.accentSky)),
                          ],
                        ),
                        Column(
                          crossAxisAlignment: CrossAxisAlignment.end,
                          children: [
                            Text('Rank ${c.openingRank} – ${c.closingRank}', style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w800, color: AppTheme.successGreen)),
                            const Text('State Merited', style: TextStyle(fontSize: 9.5, color: Color(0xFF94A3B8))),
                          ],
                        ),
                      ],
                    ),
                  ),
                );
              }),
            ],
          ),

          // 4. Placements Tab
          ListView(
            padding: const EdgeInsets.all(16),
            children: [
              Container(
                padding: const EdgeInsets.all(14),
                decoration: BoxDecoration(
                  color: isDark ? const Color(0xFF1E293B) : const Color(0xFFF1F5F9),
                  borderRadius: BorderRadius.circular(10),
                  border: Border.all(color: theme.dividerColor),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text('Training & Placement Cell (T&P)', style: TextStyle(fontSize: 14, fontWeight: FontWeight.w700, color: AppTheme.accentSky)),
                    const SizedBox(height: 4),
                    Text(
                      'Dedicated cell organizing mock interviews, aptitude training, soft skill development, and on-campus & pooled placement drives with Bihar Engineering University.',
                      style: TextStyle(fontSize: 11.5, color: isDark ? const Color(0xFFCBD5E1) : const Color(0xFF475569), height: 1.4),
                    ),
                  ],
                ),
              ),

              const SizedBox(height: 16),
              Text('Major Recruiters & Hiring Partners', style: TextStyle(fontSize: 14, fontWeight: FontWeight.w700, color: isDark ? Colors.white : AppTheme.primaryNavy)),
              const SizedBox(height: 8),

              _buildCompanyCard('Tata Consultancy Services (TCS)', 'Ninja & Digital', '₹3.6 – ₹7.0 LPA', 'CSE, EE, Mech, Civil'),
              _buildCompanyCard('Infosys Limited', 'Systems Engineer', '₹3.6 – ₹6.5 LPA', 'All Branches'),
              _buildCompanyCard('Wipro Technologies', 'Project Engineer', '₹3.5 – ₹5.5 LPA', 'All Branches'),
              _buildCompanyCard('HCL Technologies', 'Software Associate', '₹3.6 – ₹5.0 LPA', 'CSE & EE'),
              _buildCompanyCard('PRADAN & NGO Rural Infra', 'Development Apprentice', '₹4.2 – ₹5.0 LPA', 'Civil & Mech'),
              _buildCompanyCard('Government JE & Bihar WRD', 'Junior Engineer', '7th Pay Level', 'Civil, Mech, EE'),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildCompanyCard(String name, String role, String ctc, String eligibility) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;

    return Card(
      margin: const EdgeInsets.only(bottom: 8),
      child: Padding(
        padding: const EdgeInsets.all(12),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(name, style: TextStyle(fontSize: 13, fontWeight: FontWeight.w700, color: isDark ? Colors.white : AppTheme.primaryNavy)),
                  const SizedBox(height: 2),
                  Text('$role • $eligibility', style: TextStyle(fontSize: 10.5, color: isDark ? const Color(0xFF94A3B8) : const Color(0xFF64748B))),
                ],
              ),
            ),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
              decoration: BoxDecoration(
                color: AppTheme.successGreen.withValues(alpha: 0.12),
                borderRadius: BorderRadius.circular(4),
              ),
              child: Text(ctc, style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w800, color: AppTheme.successGreen)),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildDeptCard({
    required BuildContext context,
    required String name,
    required String intake,
    required String desc,
  }) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;

    return Card(
      margin: const EdgeInsets.only(bottom: 10),
      child: Padding(
        padding: const EdgeInsets.all(12),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Expanded(
                  child: Text(
                    name,
                    style: TextStyle(fontSize: 13, fontWeight: FontWeight.w700, color: isDark ? Colors.white : AppTheme.primaryNavy),
                  ),
                ),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                  decoration: BoxDecoration(
                    color: AppTheme.accentSky.withValues(alpha: 0.1),
                    borderRadius: BorderRadius.circular(4),
                  ),
                  child: Text(intake, style: const TextStyle(fontSize: 10, fontWeight: FontWeight.w600, color: AppTheme.accentSky)),
                ),
              ],
            ),
            const SizedBox(height: 4),
            Text(desc, style: TextStyle(fontSize: 11, color: isDark ? const Color(0xFF94A3B8) : const Color(0xFF64748B), height: 1.4)),
          ],
        ),
      ),
    );
  }
}
