import 'package:flutter/material.dart';
import '../services/data_service.dart';
import '../services/auth_service.dart';
import '../services/navigation_service.dart';
import '../models/models.dart';
import '../theme/app_theme.dart';
import 'notices_screen.dart';
import 'submit_listing_screen.dart';
import 'student_tools_screen.dart';
import 'auth_screen.dart';
import 'grievance_form_screen.dart';
import 'admin_panel_screen.dart';

class HomeScreen extends StatelessWidget {
  final Function(int) onTabChange;

  const HomeScreen({super.key, required this.onTabChange});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;
    final screenWidth = MediaQuery.sizeOf(context).width;
    final isMobile = screenWidth < 540;

    return Scaffold(
      appBar: AppBar(
        titleSpacing: isMobile ? 8 : 12,
        title: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            // Official GEC Sheikhpura Crest Logo - Clean prominent circular badge
            Container(
              width: isMobile ? 38 : 42,
              height: isMobile ? 38 : 42,
              padding: const EdgeInsets.all(2.0),
              decoration: BoxDecoration(
                color: Colors.white,
                shape: BoxShape.circle,
                border: Border.all(
                  color: AppTheme.accentSky.withValues(alpha: 0.6),
                  width: 1.5,
                ),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withValues(alpha: 0.1),
                    blurRadius: 4,
                    offset: const Offset(0, 2),
                  ),
                ],
              ),
              child: ClipOval(
                child: Image.asset(
                  'assets/images/college_crest.png',
                  width: isMobile ? 34 : 38,
                  height: isMobile ? 34 : 38,
                  fit: BoxFit.contain,
                  errorBuilder: (context, error, stackTrace) {
                    return Image.asset(
                      'assets/images/college_crest.jpg',
                      fit: BoxFit.contain,
                      errorBuilder: (ctx, err, st) {
                        return Container(
                          color: AppTheme.primaryNavy,
                          child: const Icon(Icons.school, color: AppTheme.accentSky, size: 20),
                        );
                      },
                    );
                  },
                ),
              ),
            ),
            SizedBox(width: isMobile ? 8 : 12),
            Flexible(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                mainAxisSize: MainAxisSize.min,
                children: [
                  Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Flexible(
                        child: Text(
                          'GEC SHK Student',
                          style: TextStyle(
                            color: isDark ? Colors.white : AppTheme.primaryNavy,
                            fontWeight: FontWeight.w800,
                            fontSize: isMobile ? 15 : 17,
                            letterSpacing: -0.2,
                          ),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                      ),
                      const SizedBox(width: 5),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 5, vertical: 1.5),
                        decoration: BoxDecoration(
                          gradient: const LinearGradient(
                            colors: [Color(0xFF2563EB), Color(0xFF1D4ED8)],
                          ),
                          borderRadius: BorderRadius.circular(4),
                        ),
                        child: const Text(
                          'OFFICIAL',
                          style: TextStyle(
                            color: Colors.white,
                            fontWeight: FontWeight.w900,
                            fontSize: 8.5,
                            letterSpacing: 0.5,
                          ),
                        ),
                      ),
                    ],
                  ),
                  Text(
                    'Govt. Engineering College, Sheikhpura',
                    style: TextStyle(
                      fontSize: isMobile ? 9.5 : 11,
                      fontWeight: FontWeight.w500,
                      color: isDark ? const Color(0xFF94A3B8) : const Color(0xFF64748B),
                    ),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                ],
              ),
            ),
          ],
        ),
        actions: [
          // Super Admin Quick Access Chip strictly for pk3334238@gmail.com
          ValueListenableBuilder<UserModel?>(
            valueListenable: AuthService.instance.currentUser,
            builder: (context, user, _) {
              if (user != null && (user.isAdmin || user.email.toLowerCase() == 'pk3334238@gmail.com')) {
                return Padding(
                  padding: const EdgeInsets.only(right: 2),
                  child: isMobile
                      ? IconButton(
                          constraints: const BoxConstraints(minWidth: 32, minHeight: 32),
                          padding: const EdgeInsets.all(4),
                          tooltip: '👑 Super Admin Panel',
                          icon: Container(
                            padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2.5),
                            decoration: BoxDecoration(
                              color: const Color(0xFFD97706),
                              borderRadius: BorderRadius.circular(10),
                            ),
                            child: const Row(
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                Icon(Icons.shield, size: 12, color: Colors.white),
                                SizedBox(width: 2),
                                Text(
                                  'Admin',
                                  style: TextStyle(color: Colors.white, fontSize: 9.5, fontWeight: FontWeight.bold),
                                ),
                              ],
                            ),
                          ),
                          onPressed: () {
                            Navigator.push(context, MaterialPageRoute(builder: (_) => const AdminPanelScreen()));
                          },
                        )
                      : ActionChip(
                          avatar: const Icon(Icons.admin_panel_settings, size: 15, color: Colors.white),
                          label: const Text('Admin', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 11)),
                          backgroundColor: const Color(0xFFD97706),
                          side: BorderSide.none,
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                          padding: const EdgeInsets.symmetric(horizontal: 4, vertical: 0),
                          materialTapTargetSize: MaterialTapTargetSize.shrinkWrap,
                          onPressed: () {
                            Navigator.push(context, MaterialPageRoute(builder: (_) => const AdminPanelScreen()));
                          },
                        ),
                );
              }
              return const SizedBox.shrink();
            },
          ),
          // Live Notices Button
          IconButton(
            constraints: const BoxConstraints(minWidth: 32, minHeight: 32),
            padding: const EdgeInsets.all(4),
            icon: const Icon(Icons.campaign_outlined, size: 21, color: AppTheme.accentSky),
            tooltip: 'Campus Notices',
            onPressed: () {
              Navigator.push(context, MaterialPageRoute(builder: (_) => const NoticesScreen()));
            },
          ),
          // User Profile / Firebase Auth Button
          ValueListenableBuilder<UserModel?>(
            valueListenable: AuthService.instance.currentUser,
            builder: (context, user, _) {
              if (user != null) {
                return Padding(
                  padding: EdgeInsets.only(right: isMobile ? 6 : 8),
                  child: InkWell(
                    onTap: () {
                      _showUserMenuDialog(context, user);
                    },
                    borderRadius: BorderRadius.circular(20),
                    child: isMobile
                        ? Padding(
                            padding: const EdgeInsets.all(2),
                            child: CircleAvatar(
                              radius: 13,
                              backgroundColor: AppTheme.primaryBlue,
                              child: Text(
                                user.displayName.isNotEmpty ? user.displayName[0].toUpperCase() : 'P',
                                style: const TextStyle(fontSize: 10.5, color: Colors.white, fontWeight: FontWeight.bold),
                              ),
                            ),
                          )
                        : Container(
                            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                            decoration: BoxDecoration(
                              color: AppTheme.accentSky.withValues(alpha: 0.15),
                              borderRadius: BorderRadius.circular(20),
                              border: Border.all(color: AppTheme.accentSky.withValues(alpha: 0.3)),
                            ),
                            child: Row(
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                CircleAvatar(
                                  radius: 12,
                                  backgroundColor: AppTheme.primaryBlue,
                                  child: Text(
                                    user.displayName.isNotEmpty ? user.displayName[0].toUpperCase() : 'U',
                                    style: const TextStyle(fontSize: 11, color: Colors.white, fontWeight: FontWeight.bold),
                                  ),
                                ),
                                const SizedBox(width: 4),
                                ConstrainedBox(
                                  constraints: const BoxConstraints(maxWidth: 70),
                                  child: Text(
                                    user.displayName.split(' ')[0],
                                    style: TextStyle(
                                      fontSize: 11,
                                      fontWeight: FontWeight.w700,
                                      color: isDark ? Colors.white : AppTheme.primaryNavy,
                                    ),
                                    overflow: TextOverflow.ellipsis,
                                  ),
                                ),
                              ],
                            ),
                          ),
                  ),
                );
              }
              return IconButton(
                constraints: const BoxConstraints(minWidth: 32, minHeight: 32),
                padding: const EdgeInsets.all(4),
                icon: const Icon(Icons.account_circle_outlined, size: 22, color: AppTheme.primaryBlue),
                tooltip: 'Student Sign In',
                onPressed: () {
                  Navigator.push(context, MaterialPageRoute(builder: (_) => const AuthScreen()));
                },
              );
            },
          ),
        ],
      ),
      body: Center(
        child: ConstrainedBox(
          constraints: const BoxConstraints(maxWidth: 960),
          child: SingleChildScrollView(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // 1. Campus Broadcast Notice Ticker
                InkWell(
                  onTap: () {
                    Navigator.push(context, MaterialPageRoute(builder: (_) => const NoticesScreen()));
                  },
                  borderRadius: BorderRadius.circular(10),
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 9),
                    decoration: BoxDecoration(
                      color: AppTheme.dangerRed.withValues(alpha: 0.08),
                      borderRadius: BorderRadius.circular(10),
                      border: Border.all(color: AppTheme.dangerRed.withValues(alpha: 0.25)),
                    ),
                    child: Row(
                      children: [
                        const Icon(Icons.campaign, size: 18, color: AppTheme.dangerRed),
                        const SizedBox(width: 8),
                        const Expanded(
                          child: Text(
                            'LIVE NOTICE: BEU 3rd & 5th Semester Exam Forms Live • Tap to View All Notices',
                            style: TextStyle(fontSize: 11.5, fontWeight: FontWeight.w700, color: AppTheme.dangerRed),
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                          ),
                        ),
                        const Icon(Icons.arrow_forward_ios, size: 12, color: AppTheme.dangerRed),
                      ],
                    ),
                  ),
                ),

                // 1b. Super Admin Dashboard Quick Access Tile for pk3334238@gmail.com
                ValueListenableBuilder<UserModel?>(
                  valueListenable: AuthService.instance.currentUser,
                  builder: (context, user, _) {
                    if (user != null && (user.isAdmin || user.email.toLowerCase() == 'pk3334238@gmail.com' || user.email.toLowerCase() == 'prince86944@gmail.com')) {
                      return Padding(
                        padding: const EdgeInsets.only(top: 10),
                        child: InkWell(
                          onTap: () {
                            Navigator.push(context, MaterialPageRoute(builder: (_) => const AdminPanelScreen()));
                          },
                          borderRadius: BorderRadius.circular(12),
                          child: Container(
                            padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 11),
                            decoration: BoxDecoration(
                              gradient: const LinearGradient(
                                colors: [Color(0xFF78350F), Color(0xFFD97706)],
                              ),
                              borderRadius: BorderRadius.circular(12),
                              boxShadow: [
                                BoxShadow(
                                  color: const Color(0xFFD97706).withValues(alpha: 0.3),
                                  blurRadius: 8,
                                  offset: const Offset(0, 3),
                                ),
                              ],
                            ),
                            child: Row(
                              children: [
                                const CircleAvatar(
                                  radius: 17,
                                  backgroundColor: Colors.white,
                                  child: Icon(Icons.admin_panel_settings, color: Color(0xFFD97706), size: 20),
                                ),
                                const SizedBox(width: 10),
                                Expanded(
                                  child: Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      Row(
                                        children: [
                                          const Text(
                                            'Super Admin Control Panel',
                                            style: TextStyle(color: Colors.white, fontWeight: FontWeight.w800, fontSize: 13),
                                          ),
                                          const SizedBox(width: 6),
                                          Container(
                                            padding: const EdgeInsets.symmetric(horizontal: 5, vertical: 1),
                                            decoration: BoxDecoration(
                                              color: Colors.amber,
                                              borderRadius: BorderRadius.circular(4),
                                            ),
                                            child: const Text('ACTIVE', style: TextStyle(color: Colors.black, fontSize: 8.5, fontWeight: FontWeight.w900)),
                                          ),
                                        ],
                                      ),
                                      const SizedBox(height: 2),
                                      Text(
                                        '${user.email} • Manage approvals, post notices & review complaints',
                                        style: const TextStyle(color: Colors.white70, fontSize: 11),
                                        overflow: TextOverflow.ellipsis,
                                      ),
                                    ],
                                  ),
                                ),
                                const Icon(Icons.arrow_forward_ios, size: 13, color: Colors.white),
                              ],
                            ),
                          ),
                        ),
                      );
                    }
                    return const SizedBox.shrink();
                  },
                ),

                const SizedBox(height: 18),

                // 2. SECTION: CAMPUS LIFE & STUDENT ACTIVITIES
                _buildSectionHeader(
                  context: context,
                  title: 'CAMPUS LIFE & STUDENT ACTIVITIES',
                  subtitle: 'Student community, clubs, sports meet, campus directory & tools',
                  icon: Icons.groups_rounded,
                  accentColor: const Color(0xFF3B82F6),
                ),
                const SizedBox(height: 10),
                LayoutBuilder(
                  builder: (context, constraints) {
                    final int cols = constraints.maxWidth > 700 ? 4 : 2;
                    final double aspect = constraints.maxWidth > 700 ? 1.6 : 1.35;
                    return GridView.count(
                      crossAxisCount: cols,
                      shrinkWrap: true,
                      physics: const NeverScrollableScrollPhysics(),
                      mainAxisSpacing: 10,
                      crossAxisSpacing: 10,
                      childAspectRatio: aspect,
                      children: [
                        _buildFeatureCard(
                          context: context,
                          icon: Icons.celebration_rounded,
                          badge: 'Active Events',
                          title: 'Student Events',
                          subtitle: 'Fests, workshops & RSVP',
                          color: const Color(0xFF8B5CF6),
                          onTap: () => NavigationService.instance.openEvents(),
                        ),
                        _buildFeatureCard(
                          context: context,
                          icon: Icons.diversity_3_rounded,
                          badge: 'Societies',
                          title: 'Clubs & Societies',
                          subtitle: 'Coding, robotics & drama',
                          color: const Color(0xFFEC4899),
                          onTap: () => NavigationService.instance.openClubs(),
                        ),
                        _buildFeatureCard(
                          context: context,
                          icon: Icons.sports_cricket_rounded,
                          badge: 'Squads Open',
                          title: 'Sports & Matches',
                          subtitle: 'Cricket, badminton squads',
                          color: const Color(0xFF10B981),
                          onTap: () => NavigationService.instance.openSports(),
                        ),
                        _buildFeatureCard(
                          context: context,
                          icon: Icons.find_in_page_rounded,
                          badge: 'Active Desk',
                          title: 'Lost & Found',
                          subtitle: 'Report or claim items',
                          color: const Color(0xFFF59E0B),
                          onTap: () => NavigationService.instance.openLostFound(),
                        ),
                        _buildFeatureCard(
                          context: context,
                          icon: Icons.calculate_rounded,
                          badge: 'BEU Calculators',
                          title: 'SGPA & Attendance',
                          subtitle: 'Marks & 75% bunk planner',
                          color: const Color(0xFF3B82F6),
                          onTap: () {
                            Navigator.push(context, MaterialPageRoute(builder: (_) => const StudentToolsScreen()));
                          },
                        ),
                        _buildFeatureCard(
                          context: context,
                          icon: Icons.campaign_rounded,
                          badge: 'Circulated',
                          title: 'Campus Notices',
                          subtitle: 'BEU & College circulars',
                          color: const Color(0xFFEF4444),
                          onTap: () {
                            Navigator.push(context, MaterialPageRoute(builder: (_) => const NoticesScreen()));
                          },
                        ),
                        _buildFeatureCard(
                          context: context,
                          icon: Icons.school_rounded,
                          badge: 'Campus Guide',
                          title: 'Faculty & Rooms',
                          subtitle: 'Departments & contacts',
                          color: const Color(0xFF06B6D4),
                          onTap: () => NavigationService.instance.openDepartments(),
                        ),
                        _buildFeatureCard(
                          context: context,
                          icon: Icons.shield_rounded,
                          badge: 'Anti-Ragging',
                          title: 'Grievance Cell',
                          subtitle: 'Confidential support desk',
                          color: const Color(0xFF6366F1),
                          onTap: () {
                            Navigator.push(context, MaterialPageRoute(builder: (_) => const GrievanceFormScreen()));
                          },
                        ),
                      ],
                    );
                  },
                ),

                const SizedBox(height: 24),

                // 3. SECTION: MARKETPLACE & LOCAL LIVING
                _buildSectionHeader(
                  context: context,
                  title: 'CAMPUS MARKETPLACE & LOCAL LIVING',
                  subtitle: 'Student housing, mess, transport & verified shops in Bajidpur',
                  icon: Icons.storefront_rounded,
                  accentColor: const Color(0xFF10B981),
                ),
                const SizedBox(height: 10),
                LayoutBuilder(
                  builder: (context, constraints) {
                    final int cols = constraints.maxWidth > 700 ? 4 : 2;
                    final double aspect = constraints.maxWidth > 700 ? 1.6 : 1.35;
                    return GridView.count(
                      crossAxisCount: cols,
                      shrinkWrap: true,
                      physics: const NeverScrollableScrollPhysics(),
                      mainAxisSpacing: 10,
                      crossAxisSpacing: 10,
                      childAspectRatio: aspect,
                      children: [
                        _buildFeatureCard(
                          context: context,
                          icon: Icons.bed_rounded,
                          badge: 'Verified Rooms',
                          title: 'Rooms & PGs',
                          subtitle: 'Hostels & private rooms',
                          color: const Color(0xFF0284C7),
                          onTap: () => NavigationService.instance.openRooms(),
                        ),
                        _buildFeatureCard(
                          context: context,
                          icon: Icons.restaurant_rounded,
                          badge: 'Mess Delivery',
                          title: 'Food & Tiffin',
                          subtitle: 'Monthly mess & meals',
                          color: const Color(0xFFF97316),
                          onTap: () => NavigationService.instance.openFood(),
                        ),
                        _buildFeatureCard(
                          context: context,
                          icon: Icons.storefront_rounded,
                          badge: 'Near Campus',
                          title: 'Nearby Shops',
                          subtitle: 'Stationery, grocery & meds',
                          color: const Color(0xFF0D9488),
                          onTap: () => NavigationService.instance.openShops(),
                        ),
                        _buildFeatureCard(
                          context: context,
                          icon: Icons.local_laundry_service_rounded,
                          badge: 'Hostel Pickup',
                          title: 'Laundry Services',
                          subtitle: 'Ironing & wash pickup',
                          color: const Color(0xFF6366F1),
                          onTap: () => NavigationService.instance.openLaundry(),
                        ),
                        _buildFeatureCard(
                          context: context,
                          icon: Icons.directions_bus_rounded,
                          badge: 'Transit Hub',
                          title: 'Sheikhpura Transit',
                          subtitle: 'Auto, buses & trains',
                          color: const Color(0xFF8B5CF6),
                          onTap: () => NavigationService.instance.openTransport(),
                        ),
                        _buildFeatureCard(
                          context: context,
                          icon: Icons.local_hospital_rounded,
                          badge: '24x7 Dial 112',
                          title: 'Medical & Emergency',
                          subtitle: 'Hospital & ambulances',
                          color: const Color(0xFFDC2626),
                          onTap: () => _showEmergencyDialog(context),
                        ),
                        _buildFeatureCard(
                          context: context,
                          icon: Icons.add_business_rounded,
                          badge: 'Free Listing',
                          title: 'List Room / Shop',
                          subtitle: 'Owners & students post',
                          color: const Color(0xFF059669),
                          onTap: () {
                            Navigator.push(context, MaterialPageRoute(builder: (_) => const SubmitListingScreen()));
                          },
                        ),
                        _buildFeatureCard(
                          context: context,
                          icon: Icons.verified_user_rounded,
                          badge: 'Anti-Fraud',
                          title: 'Rental Safety Rules',
                          subtitle: 'Zero advance UPI rule',
                          color: const Color(0xFFD97706),
                          onTap: () => _showAntiScamDialog(context),
                        ),
                      ],
                    );
                  },
                ),

                const SizedBox(height: 24),

                // 4. SECTION: BEU ACADEMIC PLATFORM PARTNER (Apna College Bihar)
                Container(
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    gradient: LinearGradient(
                      colors: isDark
                          ? [const Color(0xFF1E293B), const Color(0xFF0F172A)]
                          : [const Color(0xFFEFF6FF), const Color(0xFFDBEAFE)],
                      begin: Alignment.topLeft,
                      end: Alignment.bottomRight,
                    ),
                    borderRadius: BorderRadius.circular(14),
                    border: Border.all(
                      color: isDark ? const Color(0xFF3B82F6).withValues(alpha: 0.3) : const Color(0xFF93C5FD),
                    ),
                    boxShadow: [
                      BoxShadow(
                        color: Colors.black.withValues(alpha: 0.04),
                        blurRadius: 8,
                        offset: const Offset(0, 3),
                      ),
                    ],
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          Container(
                            padding: const EdgeInsets.all(8),
                            decoration: BoxDecoration(
                              color: AppTheme.primaryBlue.withValues(alpha: 0.15),
                              borderRadius: BorderRadius.circular(10),
                            ),
                            child: const Text('📚', style: TextStyle(fontSize: 24)),
                          ),
                          const SizedBox(width: 12),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Row(
                                  children: [
                                    const Text(
                                      'APNA COLLEGE BIHAR',
                                      style: TextStyle(
                                        fontSize: 11,
                                        fontWeight: FontWeight.w800,
                                        letterSpacing: 0.5,
                                        color: AppTheme.primaryBlue,
                                      ),
                                    ),
                                    const SizedBox(width: 6),
                                    Container(
                                      padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                                      decoration: BoxDecoration(
                                        color: AppTheme.primaryBlue,
                                        borderRadius: BorderRadius.circular(4),
                                      ),
                                      child: const Text(
                                        'Academic Partner',
                                        style: TextStyle(fontSize: 9, color: Colors.white, fontWeight: FontWeight.bold),
                                      ),
                                    ),
                                  ],
                                ),
                                const SizedBox(height: 2),
                                Text(
                                  'BEU Notes, Syllabus, PYQs & Mentorship',
                                  style: TextStyle(
                                    fontSize: 14,
                                    fontWeight: FontWeight.w700,
                                    color: isDark ? Colors.white : AppTheme.primaryNavy,
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 10),
                      Text(
                        'All official semester syllabus, engineering notes, previous year question papers (PYQs), and lecture links are hosted on the Apna College Bihar platform.',
                        style: TextStyle(
                          fontSize: 11.5,
                          color: isDark ? const Color(0xFF94A3B8) : const Color(0xFF475569),
                          height: 1.45,
                        ),
                      ),
                      const SizedBox(height: 12),
                      Wrap(
                        spacing: 8,
                        runSpacing: 8,
                        children: [
                          ElevatedButton.icon(
                            onPressed: () => DataService.instance.launchExternalUrl('https://www.apnacollegebihar.online/'),
                            icon: const Icon(Icons.open_in_new, size: 14),
                            label: const Text('Open Apna College Bihar'),
                            style: ElevatedButton.styleFrom(
                              backgroundColor: AppTheme.primaryBlue,
                              foregroundColor: Colors.white,
                              padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 9),
                              textStyle: const TextStyle(fontSize: 11.5, fontWeight: FontWeight.w700),
                              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                            ),
                          ),
                          OutlinedButton.icon(
                            onPressed: () => NavigationService.instance.openCutoffs(), // Academics Tab (Cutoffs & Seats)
                            icon: const Icon(Icons.analytics_outlined, size: 14),
                            label: const Text('Cutoffs & Placements'),
                            style: OutlinedButton.styleFrom(
                              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 9),
                              textStyle: const TextStyle(fontSize: 11.5, fontWeight: FontWeight.w700),
                              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),

                const SizedBox(height: 20),

                // 5. Emergency Helpline Strip
                Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: isDark ? const Color(0xFF1E293B) : const Color(0xFFF8FAFC),
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(color: theme.dividerColor),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          const Icon(Icons.phone_in_talk, size: 16, color: AppTheme.dangerRed),
                          const SizedBox(width: 6),
                          Text(
                            '24x7 Student Emergency Contacts',
                            style: TextStyle(
                              fontSize: 12,
                              fontWeight: FontWeight.w700,
                              color: isDark ? Colors.white : AppTheme.primaryNavy,
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 8),
                      Wrap(
                        spacing: 8,
                        runSpacing: 8,
                        children: [
                          _buildEmergencyChip('Dial 112 (Police & Emergency)', '112'),
                          _buildEmergencyChip('Sadar Hospital: 06341-223333', '06341223333'),
                          _buildEmergencyChip('Anti-Ragging: 1800-180-5522', '18001805522'),
                        ],
                      ),
                    ],
                  ),
                ),

                const SizedBox(height: 30),
              ],
            ),
          ),
        ),
      ),
    );
  }

  // --- Helper Widgets ---

  Widget _buildSectionHeader({
    required BuildContext context,
    required String title,
    required String subtitle,
    required IconData icon,
    required Color accentColor,
  }) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;

    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Container(
          padding: const EdgeInsets.all(6),
          decoration: BoxDecoration(
            color: accentColor.withValues(alpha: 0.15),
            borderRadius: BorderRadius.circular(8),
          ),
          child: Icon(icon, color: accentColor, size: 18),
        ),
        const SizedBox(width: 10),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                title,
                style: TextStyle(
                  fontSize: 13,
                  fontWeight: FontWeight.w800,
                  letterSpacing: 0.3,
                  color: isDark ? Colors.white : AppTheme.primaryNavy,
                ),
              ),
              const SizedBox(height: 2),
              Text(
                subtitle,
                style: TextStyle(
                  fontSize: 11,
                  color: isDark ? const Color(0xFF94A3B8) : const Color(0xFF64748B),
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildFeatureCard({
    required BuildContext context,
    required IconData icon,
    required String badge,
    required String title,
    required String subtitle,
    required Color color,
    required VoidCallback onTap,
  }) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;

    return Material(
      color: Colors.transparent,
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(12),
        child: Container(
          padding: const EdgeInsets.all(11),
          decoration: BoxDecoration(
            color: theme.cardColor,
            borderRadius: BorderRadius.circular(12),
            border: Border.all(color: theme.dividerColor),
            boxShadow: [
              BoxShadow(
                color: Colors.black.withValues(alpha: isDark ? 0.2 : 0.03),
                blurRadius: 4,
                offset: const Offset(0, 2),
              ),
            ],
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Container(
                    width: 36,
                    height: 36,
                    decoration: BoxDecoration(
                      color: color.withValues(alpha: 0.12),
                      borderRadius: BorderRadius.circular(9),
                      border: Border.all(color: color.withValues(alpha: 0.25), width: 1),
                    ),
                    alignment: Alignment.center,
                    child: Icon(icon, color: color, size: 20),
                  ),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                    decoration: BoxDecoration(
                      color: isDark ? const Color(0xFF334155) : const Color(0xFFF1F5F9),
                      borderRadius: BorderRadius.circular(4),
                    ),
                    child: Text(
                      badge,
                      style: TextStyle(
                        fontSize: 9,
                        fontWeight: FontWeight.w600,
                        color: isDark ? const Color(0xFFCBD5E1) : const Color(0xFF64748B),
                      ),
                    ),
                  ),
                ],
              ),
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                mainAxisSize: MainAxisSize.min,
                children: [
                  Text(
                    title,
                    style: TextStyle(
                      fontSize: 12.5,
                      fontWeight: FontWeight.w700,
                      color: isDark ? Colors.white : AppTheme.primaryNavy,
                    ),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                  const SizedBox(height: 2),
                  Text(
                    subtitle,
                    style: TextStyle(
                      fontSize: 10,
                      color: isDark ? const Color(0xFF94A3B8) : const Color(0xFF64748B),
                    ),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildEmergencyChip(String label, String phone) {
    return InkWell(
      onTap: () => DataService.instance.callPhoneNumber(phone),
      borderRadius: BorderRadius.circular(6),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 5),
        decoration: BoxDecoration(
          color: AppTheme.dangerRed.withValues(alpha: 0.1),
          borderRadius: BorderRadius.circular(6),
          border: Border.all(color: AppTheme.dangerRed.withValues(alpha: 0.3)),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Icon(Icons.call, size: 12, color: AppTheme.dangerRed),
            const SizedBox(width: 4),
            Text(
              label,
              style: const TextStyle(fontSize: 10.5, fontWeight: FontWeight.w700, color: AppTheme.dangerRed),
            ),
          ],
        ),
      ),
    );
  }

  void _showUserMenuDialog(BuildContext context, UserModel user) {
    showModalBottomSheet(
      context: context,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(16)),
      ),
      builder: (context) {
        return SafeArea(
          child: Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    CircleAvatar(
                      radius: 24,
                      backgroundColor: AppTheme.primaryBlue,
                      child: Text(
                        user.displayName.isNotEmpty ? user.displayName[0].toUpperCase() : 'U',
                        style: const TextStyle(fontSize: 20, color: Colors.white, fontWeight: FontWeight.bold),
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            user.displayName,
                            style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w800),
                          ),
                          Text(
                            user.email,
                            style: const TextStyle(fontSize: 12, color: Colors.grey),
                          ),
                          if (user.branch.isNotEmpty)
                            Text(
                              '${user.branch} • Roll: ${user.rollNo}',
                              style: const TextStyle(fontSize: 11, color: AppTheme.accentSky),
                            ),
                        ],
                      ),
                    ),
                  ],
                ),
                const Divider(height: 24),
                if (user.isAdmin || user.email.toLowerCase() == 'pk3334238@gmail.com' || user.email.toLowerCase() == 'prince86944@gmail.com')
                  ListTile(
                    leading: const Icon(Icons.admin_panel_settings, color: Color(0xFFD97706)),
                    title: const Text('👑 Open Super Admin Panel', style: TextStyle(fontWeight: FontWeight.bold, color: Color(0xFFD97706))),
                    subtitle: const Text('Manage listings, approvals & broadcast alerts', style: TextStyle(fontSize: 11)),
                    tileColor: const Color(0xFFFEF3C7).withValues(alpha: 0.5),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                    onTap: () {
                      Navigator.pop(context);
                      Navigator.push(context, MaterialPageRoute(builder: (_) => const AdminPanelScreen()));
                    },
                  ),
                ListTile(
                  leading: const Icon(Icons.badge_outlined, color: AppTheme.primaryBlue),
                  title: const Text('View Digital Student ID Card'),
                  onTap: () {
                    Navigator.pop(context);
                    Navigator.push(context, MaterialPageRoute(builder: (_) => const AuthScreen()));
                  },
                ),
                ListTile(
                  leading: const Icon(Icons.switch_account_outlined, color: AppTheme.accentSky),
                  title: const Text('Switch Account / Google Sign-In'),
                  onTap: () {
                    Navigator.pop(context);
                    Navigator.push(context, MaterialPageRoute(builder: (_) => const AuthScreen()));
                  },
                ),
                ListTile(
                  leading: const Icon(Icons.add_circle_outline, color: AppTheme.successGreen),
                  title: const Text('Post New Room or Business Listing'),
                  onTap: () {
                    Navigator.pop(context);
                    Navigator.push(context, MaterialPageRoute(builder: (_) => const SubmitListingScreen()));
                  },
                ),
                ListTile(
                  leading: const Icon(Icons.logout, color: AppTheme.dangerRed),
                  title: const Text('Sign Out Session', style: TextStyle(color: AppTheme.dangerRed)),
                  onTap: () async {
                    Navigator.pop(context);
                    await AuthService.instance.signOut();
                    if (context.mounted) {
                      ScaffoldMessenger.of(context).showSnackBar(
                        const SnackBar(content: Text('Logged out successfully.')),
                      );
                    }
                  },
                ),
              ],
            ),
          ),
        );
      },
    );
  }

  void _showEmergencyDialog(BuildContext context) {
    showDialog(
      context: context,
      builder: (context) {
        return AlertDialog(
          title: const Row(
            children: [
              Text('🚑', style: TextStyle(fontSize: 22)),
              SizedBox(width: 8),
              Text('Emergency Helplines'),
            ],
          ),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              ListTile(
                leading: const Icon(Icons.local_police, color: AppTheme.dangerRed),
                title: const Text('Bihar Unified Emergency'),
                subtitle: const Text('Dial 112 (Toll Free)'),
                trailing: const Icon(Icons.call, color: AppTheme.dangerRed),
                onTap: () => DataService.instance.callPhoneNumber('112'),
              ),
              ListTile(
                leading: const Icon(Icons.local_hospital, color: AppTheme.dangerRed),
                title: const Text('District Sadar Hospital'),
                subtitle: const Text('06341-223333'),
                trailing: const Icon(Icons.call, color: AppTheme.dangerRed),
                onTap: () => DataService.instance.callPhoneNumber('06341223333'),
              ),
              ListTile(
                leading: const Icon(Icons.shield, color: AppTheme.primaryBlue),
                title: const Text('National Anti-Ragging'),
                subtitle: const Text('1800-180-5522'),
                trailing: const Icon(Icons.call, color: AppTheme.primaryBlue),
                onTap: () => DataService.instance.callPhoneNumber('18001805522'),
              ),
            ],
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(context),
              child: const Text('Close'),
            ),
          ],
        );
      },
    );
  }

  void _showAntiScamDialog(BuildContext context) {
    showDialog(
      context: context,
      builder: (context) {
        return AlertDialog(
          title: const Row(
            children: [
              Text('🛡️', style: TextStyle(fontSize: 22)),
              SizedBox(width: 8),
              Text('Rental Verification Rules'),
            ],
          ),
          content: const Text(
            '1. Physical Inspection First: Always visit the room in Bajidpur or near college premises before committing.\n\n'
            '2. Zero Advance UPI: Never transfer token money or advance rent to unknown QR codes or phone numbers online.\n\n'
            '3. Direct Owner Verification: Confirm electricity meter terms, food inclusion, and gate timings in person.\n\n'
            '4. In case of fraudulent listings, tap the ⚠️ Report button to immediately alert hub admins.',
            style: TextStyle(fontSize: 12.5, height: 1.5),
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(context),
              child: const Text('I Understand'),
            ),
          ],
        );
      },
    );
  }
}
