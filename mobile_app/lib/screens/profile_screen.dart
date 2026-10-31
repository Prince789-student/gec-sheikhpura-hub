import 'package:flutter/material.dart';
import '../services/data_service.dart';
import '../services/auth_service.dart';
import '../models/models.dart';
import '../theme/app_theme.dart';
import 'legal_viewer_screen.dart';
import 'grievance_form_screen.dart';
import 'submit_listing_screen.dart';
import 'student_tools_screen.dart';
import 'auth_screen.dart';
import 'admin_panel_screen.dart';

class ProfileScreen extends StatefulWidget {
  final bool isDark;
  final Function(bool) onThemeToggle;

  const ProfileScreen({
    super.key,
    required this.isDark,
    required this.onThemeToggle,
  });

  @override
  State<ProfileScreen> createState() => _ProfileScreenState();
}

class _ProfileScreenState extends State<ProfileScreen> {
  List<String> _bookmarkedIds = [];

  @override
  void initState() {
    super.initState();
    _loadBookmarks();
  }

  Future<void> _loadBookmarks() async {
    final list = await DataService.instance.getBookmarkedIds();
    setState(() {
      _bookmarkedIds = list;
    });
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;

    return Scaffold(
      appBar: AppBar(
        title: const Text('Saved Hub & Settings'),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Student Profile & Firebase Auth Card
            ValueListenableBuilder<UserModel?>(
              valueListenable: AuthService.instance.currentUser,
              builder: (context, user, _) {
                if (user != null) {
                  return Container(
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      color: theme.cardColor,
                      borderRadius: BorderRadius.circular(14),
                      border: Border.all(color: AppTheme.accentSky.withValues(alpha: 0.3)),
                      boxShadow: [
                        BoxShadow(
                          color: Colors.black.withValues(alpha: isDark ? 0.2 : 0.04),
                          blurRadius: 6,
                          offset: const Offset(0, 3),
                        ),
                      ],
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          children: [
                            CircleAvatar(
                              radius: 26,
                              backgroundColor: AppTheme.primaryBlue,
                              child: Text(
                                user.displayName.isNotEmpty ? user.displayName[0].toUpperCase() : 'U',
                                style: const TextStyle(fontSize: 22, color: Colors.white, fontWeight: FontWeight.bold),
                              ),
                            ),
                            const SizedBox(width: 14),
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Row(
                                    children: [
                                      Expanded(
                                        child: Text(
                                          user.displayName,
                                          style: TextStyle(
                                            fontSize: 16,
                                            fontWeight: FontWeight.w800,
                                            color: isDark ? Colors.white : AppTheme.primaryNavy,
                                          ),
                                          maxLines: 1,
                                          overflow: TextOverflow.ellipsis,
                                        ),
                                      ),
                                      IconButton(
                                        icon: Icon(
                                          widget.isDark ? Icons.light_mode : Icons.dark_mode,
                                          color: widget.isDark ? AppTheme.warningAmber : AppTheme.primaryBlue,
                                        ),
                                        onPressed: () => widget.onThemeToggle(!widget.isDark),
                                        tooltip: 'Toggle Theme',
                                      ),
                                    ],
                                  ),
                                  Text(
                                    user.email,
                                    style: TextStyle(
                                      fontSize: 11.5,
                                      color: isDark ? const Color(0xFF94A3B8) : const Color(0xFF64748B),
                                    ),
                                    maxLines: 1,
                                    overflow: TextOverflow.ellipsis,
                                  ),
                                  if (user.branch.isNotEmpty)
                                    Padding(
                                      padding: const EdgeInsets.only(top: 2),
                                      child: Text(
                                        '${user.branch} • ${user.batchYear}',
                                        style: const TextStyle(
                                          fontSize: 11,
                                          fontWeight: FontWeight.w600,
                                          color: AppTheme.accentSky,
                                        ),
                                        maxLines: 1,
                                        overflow: TextOverflow.ellipsis,
                                      ),
                                    ),
                                ],
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 12),
                        Row(
                          children: [
                            Expanded(
                              child: ElevatedButton.icon(
                                onPressed: () {
                                  Navigator.push(context, MaterialPageRoute(builder: (_) => const AuthScreen()));
                                },
                                icon: const Icon(Icons.badge, size: 15),
                                label: const Text('Digital Student ID'),
                                style: ElevatedButton.styleFrom(
                                  backgroundColor: AppTheme.primaryBlue,
                                  foregroundColor: Colors.white,
                                  padding: const EdgeInsets.symmetric(vertical: 8),
                                  textStyle: const TextStyle(fontSize: 11.5, fontWeight: FontWeight.w700),
                                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                                ),
                              ),
                            ),
                            const SizedBox(width: 8),
                            OutlinedButton.icon(
                              onPressed: () async {
                                await AuthService.instance.signOut();
                                if (context.mounted) {
                                  ScaffoldMessenger.of(context).showSnackBar(
                                    const SnackBar(content: Text('Signed out successfully.')),
                                  );
                                }
                              },
                              icon: const Icon(Icons.logout, size: 15, color: AppTheme.dangerRed),
                              label: const Text('Sign Out', style: TextStyle(color: AppTheme.dangerRed)),
                              style: OutlinedButton.styleFrom(
                                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                                textStyle: const TextStyle(fontSize: 11.5, fontWeight: FontWeight.w700),
                                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                              ),
                            ),
                          ],
                        ),
                        if (user.isAdmin || user.email.toLowerCase() == 'pk3334238@gmail.com') ...[
                          const SizedBox(height: 10),
                          Container(
                            width: double.infinity,
                            decoration: BoxDecoration(
                              gradient: const LinearGradient(
                                colors: [Color(0xFFB45309), Color(0xFFD97706)],
                              ),
                              borderRadius: BorderRadius.circular(10),
                              boxShadow: [
                                BoxShadow(
                                  color: const Color(0xFFD97706).withValues(alpha: 0.25),
                                  blurRadius: 6,
                                  offset: const Offset(0, 2),
                                ),
                              ],
                            ),
                            child: ElevatedButton.icon(
                              onPressed: () {
                                Navigator.push(context, MaterialPageRoute(builder: (_) => const AdminPanelScreen()));
                              },
                              icon: const Icon(Icons.admin_panel_settings, size: 18, color: Colors.white),
                              label: const Text(
                                '👑 Super Admin Control Panel',
                                style: TextStyle(fontSize: 12.5, fontWeight: FontWeight.w800, color: Colors.white),
                              ),
                              style: ElevatedButton.styleFrom(
                                backgroundColor: Colors.transparent,
                                shadowColor: Colors.transparent,
                                padding: const EdgeInsets.symmetric(vertical: 10),
                                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                              ),
                            ),
                          ),
                        ],
                      ],
                    ),
                  );
                }

                // Guest Session
                return Container(
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: theme.cardColor,
                    borderRadius: BorderRadius.circular(14),
                    border: Border.all(color: theme.dividerColor),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          CircleAvatar(
                            radius: 24,
                            backgroundColor: AppTheme.accentSky.withValues(alpha: 0.15),
                            child: const Icon(Icons.person, color: AppTheme.accentSky, size: 28),
                          ),
                          const SizedBox(width: 14),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  'Guest Student Session',
                                  style: TextStyle(
                                    fontSize: 15,
                                    fontWeight: FontWeight.w700,
                                    color: isDark ? Colors.white : AppTheme.primaryNavy,
                                  ),
                                ),
                                const SizedBox(height: 2),
                                Text(
                                  'Sign in with Google for Digital ID & Hub Sync',
                                  style: TextStyle(
                                    fontSize: 11,
                                    color: isDark ? const Color(0xFF94A3B8) : const Color(0xFF64748B),
                                  ),
                                ),
                              ],
                            ),
                          ),
                          IconButton(
                            icon: Icon(
                              widget.isDark ? Icons.light_mode : Icons.dark_mode,
                              color: widget.isDark ? AppTheme.warningAmber : AppTheme.primaryBlue,
                            ),
                            onPressed: () => widget.onThemeToggle(!widget.isDark),
                            tooltip: 'Toggle Theme',
                          ),
                        ],
                      ),
                      const SizedBox(height: 12),
                      SizedBox(
                        width: double.infinity,
                        child: ElevatedButton.icon(
                          onPressed: () {
                            Navigator.push(context, MaterialPageRoute(builder: (_) => const AuthScreen()));
                          },
                          icon: const Icon(Icons.login, size: 16),
                          label: const Text('Sign In with Google / Firebase'),
                          style: ElevatedButton.styleFrom(
                            backgroundColor: AppTheme.primaryBlue,
                            foregroundColor: Colors.white,
                            padding: const EdgeInsets.symmetric(vertical: 10),
                            textStyle: const TextStyle(fontSize: 12, fontWeight: FontWeight.w700),
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                          ),
                        ),
                      ),
                    ],
                  ),
                );
              },
            ),

            const SizedBox(height: 16),

            // Quick Actions Strip
            Row(
              children: [
                Expanded(
                  child: OutlinedButton.icon(
                    onPressed: () {
                      Navigator.push(context, MaterialPageRoute(builder: (_) => const SubmitListingScreen()));
                    },
                    icon: const Icon(Icons.add_home_work, size: 16),
                    label: const Text('List Room/Shop'),
                    style: OutlinedButton.styleFrom(
                      padding: const EdgeInsets.symmetric(vertical: 10),
                      textStyle: const TextStyle(fontSize: 11.5, fontWeight: FontWeight.w700),
                    ),
                  ),
                ),
                const SizedBox(width: 8),
                Expanded(
                  child: OutlinedButton.icon(
                    onPressed: () {
                      Navigator.push(context, MaterialPageRoute(builder: (_) => const StudentToolsScreen()));
                    },
                    icon: const Icon(Icons.calculate, size: 16),
                    label: const Text('SGPA & Bunk Calc'),
                    style: OutlinedButton.styleFrom(
                      padding: const EdgeInsets.symmetric(vertical: 10),
                      textStyle: const TextStyle(fontSize: 11.5, fontWeight: FontWeight.w700),
                    ),
                  ),
                ),
              ],
            ),

            const SizedBox(height: 20),

            // Saved Items Count
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  'Saved Bookmarks',
                  style: TextStyle(
                    fontSize: 15,
                    fontWeight: FontWeight.w700,
                    color: isDark ? Colors.white : AppTheme.primaryNavy,
                  ),
                ),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                  decoration: BoxDecoration(
                    color: AppTheme.accentSky.withValues(alpha: 0.12),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Text(
                    '${_bookmarkedIds.length} saved',
                    style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w700, color: AppTheme.accentSky),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 8),

            if (_bookmarkedIds.isEmpty)
              Container(
                padding: const EdgeInsets.all(16),
                width: double.infinity,
                decoration: BoxDecoration(
                  color: isDark ? const Color(0xFF1E293B) : const Color(0xFFF1F5F9),
                  borderRadius: BorderRadius.circular(10),
                ),
                child: Center(
                  child: Text(
                    'No bookmarks yet. Tap the bookmark icon on any room or food service to save it offline.',
                    textAlign: TextAlign.center,
                    style: TextStyle(
                      fontSize: 11.5,
                      color: isDark ? const Color(0xFF94A3B8) : const Color(0xFF64748B),
                    ),
                  ),
                ),
              )
            else
              ..._bookmarkedIds.map((id) {
                return Card(
                  margin: const EdgeInsets.only(bottom: 6),
                  child: ListTile(
                    dense: true,
                    leading: const Icon(Icons.bookmark, color: AppTheme.accentSky, size: 20),
                    title: Text(id.replaceAll('-', ' ').toUpperCase(), style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w700)),
                    trailing: IconButton(
                      icon: const Icon(Icons.close, size: 16),
                      onPressed: () async {
                        await DataService.instance.toggleBookmark(id);
                        _loadBookmarks();
                      },
                    ),
                  ),
                );
              }),

            const SizedBox(height: 24),

            // Emergency Contacts Directory
            Text(
              '24x7 Emergency Helplines',
              style: TextStyle(
                fontSize: 15,
                fontWeight: FontWeight.w700,
                color: isDark ? Colors.white : AppTheme.primaryNavy,
              ),
            ),
            const SizedBox(height: 10),

            ...DataService.instance.emergencyContacts.map((contact) {
              return Card(
                margin: const EdgeInsets.only(bottom: 8),
                child: ListTile(
                  dense: true,
                  leading: CircleAvatar(
                    radius: 16,
                    backgroundColor: AppTheme.dangerRed.withValues(alpha: 0.1),
                    child: const Icon(Icons.phone_in_talk, color: AppTheme.dangerRed, size: 16),
                  ),
                  title: Text(
                    contact.title,
                    style: TextStyle(
                      fontSize: 12.5,
                      fontWeight: FontWeight.w700,
                      color: isDark ? Colors.white : AppTheme.primaryNavy,
                    ),
                  ),
                  subtitle: Text(
                    '${contact.subtitle} • Dial ${contact.number}',
                    style: TextStyle(
                      fontSize: 10.5,
                      color: isDark ? const Color(0xFF94A3B8) : const Color(0xFF64748B),
                    ),
                  ),
                  trailing: ElevatedButton(
                    onPressed: () => DataService.instance.callPhoneNumber(contact.number),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: AppTheme.dangerRed,
                      foregroundColor: Colors.white,
                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                      textStyle: const TextStyle(fontSize: 11, fontWeight: FontWeight.w700),
                      minimumSize: const Size(50, 30),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(6)),
                    ),
                    child: const Text('Call'),
                  ),
                ),
              );
            }),

            const SizedBox(height: 24),

            // Statutory Grievance Button
            Container(
              padding: const EdgeInsets.all(14),
              decoration: BoxDecoration(
                color: isDark ? const Color(0xFF1E293B) : const Color(0xFFF8FAFC),
                borderRadius: BorderRadius.circular(10),
                border: Border.all(color: theme.dividerColor),
              ),
              child: Row(
                children: [
                  const Icon(Icons.gavel, color: AppTheme.accentSky, size: 24),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'Encountered Fraud or Abuse?',
                          style: TextStyle(
                            fontSize: 13,
                            fontWeight: FontWeight.w700,
                            color: isDark ? Colors.white : AppTheme.primaryNavy,
                          ),
                        ),
                        Text(
                          'Direct statutory filing with Grievance Officer under IT Rules 2021.',
                          style: TextStyle(
                            fontSize: 10.5,
                            color: isDark ? const Color(0xFF94A3B8) : const Color(0xFF64748B),
                          ),
                        ),
                      ],
                    ),
                  ),
                  ElevatedButton(
                    onPressed: () {
                      Navigator.push(
                        context,
                        MaterialPageRoute(builder: (_) => const GrievanceFormScreen()),
                      );
                    },
                    style: ElevatedButton.styleFrom(
                      backgroundColor: AppTheme.primaryBlue,
                      foregroundColor: Colors.white,
                      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                      textStyle: const TextStyle(fontSize: 11, fontWeight: FontWeight.w700),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(6)),
                    ),
                    child: const Text('File Report'),
                  ),
                ],
              ),
            ),

            const SizedBox(height: 24),

            // All 10 Legal Documents
            Text(
              'Legal & Governance (All 10 Documents)',
              style: TextStyle(
                fontSize: 15,
                fontWeight: FontWeight.w700,
                color: isDark ? Colors.white : AppTheme.primaryNavy,
              ),
            ),
            const SizedBox(height: 10),

            ...DataService.instance.legalDocs.map((doc) {
              return Card(
                margin: const EdgeInsets.only(bottom: 6),
                child: ListTile(
                  dense: true,
                  leading: Text(doc.icon, style: const TextStyle(fontSize: 18)),
                  title: Text(
                    doc.title,
                    style: TextStyle(
                      fontSize: 12.5,
                      fontWeight: FontWeight.w700,
                      color: isDark ? Colors.white : AppTheme.primaryNavy,
                    ),
                  ),
                  subtitle: Text(
                    doc.summary,
                    style: TextStyle(
                      fontSize: 10.5,
                      color: isDark ? const Color(0xFF94A3B8) : const Color(0xFF64748B),
                    ),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                  trailing: const Icon(Icons.arrow_forward_ios, size: 12, color: AppTheme.accentSky),
                  onTap: () {
                    Navigator.push(
                      context,
                      MaterialPageRoute(
                        builder: (_) => LegalViewerScreen(document: doc),
                      ),
                    );
                  },
                ),
              );
            }),

            const SizedBox(height: 24),

            // Bottom Copyright
            Center(
              child: Column(
                children: [
                  Text(
                    '© 2026 GEC Sheikhpura Student Life Hub',
                    style: TextStyle(
                      fontSize: 11,
                      fontWeight: FontWeight.w600,
                      color: isDark ? const Color(0xFF64748B) : const Color(0xFF94A3B8),
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    'Independent Student Platform • Bajidpur, Sheikhpura (811105)',
                    style: TextStyle(
                      fontSize: 10,
                      color: isDark ? const Color(0xFF475569) : const Color(0xFF94A3B8),
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 20),
          ],
        ),
      ),
    );
  }
}
