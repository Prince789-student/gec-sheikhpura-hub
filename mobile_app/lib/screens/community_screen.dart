import 'package:flutter/material.dart';
import '../models/models.dart';
import '../services/data_service.dart';
import '../services/auth_service.dart';
import '../services/navigation_service.dart';
import '../theme/app_theme.dart';

class CommunityScreen extends StatefulWidget {
  const CommunityScreen({super.key});

  @override
  State<CommunityScreen> createState() => _CommunityScreenState();
}

class _CommunityScreenState extends State<CommunityScreen> with SingleTickerProviderStateMixin {
  late TabController _tabController;
  final Set<String> _rsvpdEventIds = {};
  final Set<String> _joinedSquadIds = {};

  @override
  void initState() {
    super.initState();
    final initialTab = NavigationService.instance.communitySubTab.value.clamp(0, 4);
    _tabController = TabController(length: 5, vsync: this, initialIndex: initialTab);
    NavigationService.instance.communitySubTab.addListener(_onSubTabNotified);
  }

  void _onSubTabNotified() {
    final target = NavigationService.instance.communitySubTab.value.clamp(0, 4);
    if (_tabController.index != target && mounted) {
      _tabController.animateTo(target);
    }
  }

  @override
  void dispose() {
    NavigationService.instance.communitySubTab.removeListener(_onSubTabNotified);
    _tabController.dispose();
    super.dispose();
  }

  void _toggleRsvp(String eventId) {
    setState(() {
      if (_rsvpdEventIds.contains(eventId)) {
        _rsvpdEventIds.remove(eventId);
      } else {
        _rsvpdEventIds.add(eventId);
      }
    });

    final isRsvpd = _rsvpdEventIds.contains(eventId);
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(isRsvpd ? 'RSVP confirmed! Added to your schedule.' : 'RSVP cancelled.'),
        duration: const Duration(seconds: 1),
        behavior: SnackBarBehavior.floating,
      ),
    );
  }

  void _toggleSquad(String squadId) {
    setState(() {
      if (_joinedSquadIds.contains(squadId)) {
        _joinedSquadIds.remove(squadId);
      } else {
        _joinedSquadIds.add(squadId);
      }
    });

    final isJoined = _joinedSquadIds.contains(squadId);
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(isJoined ? 'Joined Squad roster! Coordinator notified.' : 'Left Squad roster.'),
        duration: const Duration(seconds: 1),
        behavior: SnackBarBehavior.floating,
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;

    return Scaffold(
      appBar: AppBar(
        title: const Text('Community & Campus Life'),
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
            Tab(text: '📅 Events'),
            Tab(text: '🤝 Clubs'),
            Tab(text: '⚽ Sports & Squads'),
            Tab(text: '🎒 Lost & Found'),
            Tab(text: '📢 Announcements'),
          ],
        ),
      ),
      body: Column(
        children: [
          // Anti-Ragging Statutory Strip
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
            color: isDark ? const Color(0xFF1E293B) : const Color(0xFFF1F5F9),
            child: Row(
              children: [
                const Icon(Icons.shield, size: 16, color: AppTheme.dangerRed),
                const SizedBox(width: 8),
                Expanded(
                  child: Text(
                    'Zero Tolerance Anti-Ragging Policy • 24x7 Helpline: 1800-180-5522',
                    style: TextStyle(
                      fontSize: 10.5,
                      fontWeight: FontWeight.w600,
                      color: isDark ? const Color(0xFFE2E8F0) : const Color(0xFF334155),
                    ),
                  ),
                ),
              ],
            ),
          ),

          Expanded(
            child: TabBarView(
              controller: _tabController,
              children: [
                // 1. Events Tab (Live Sync from Admin Panel)
                RefreshIndicator(
                  onRefresh: () async {
                    await DataService.instance.fetchLiveEvents();
                    setState(() {});
                  },
                  child: DataService.instance.sampleEvents.isEmpty
                      ? ListView(
                          padding: const EdgeInsets.all(32),
                          children: const [
                            SizedBox(height: 40),
                            Icon(Icons.event_available, size: 48, color: Colors.grey),
                            SizedBox(height: 12),
                            Text('No active events scheduled.', textAlign: TextAlign.center, style: TextStyle(fontWeight: FontWeight.bold)),
                            SizedBox(height: 4),
                            Text('Official college events published from the Admin Panel will appear here automatically.', textAlign: TextAlign.center, style: TextStyle(fontSize: 12, color: Colors.grey)),
                          ],
                        )
                      : ListView.builder(
                          padding: const EdgeInsets.all(16),
                          itemCount: DataService.instance.sampleEvents.length,
                          itemBuilder: (context, index) {
                            final event = DataService.instance.sampleEvents[index];
                            final isRsvpd = _rsvpdEventIds.contains(event.id);
                            return _buildEventCard(context, event, isRsvpd);
                          },
                        ),
                ),

                // 2. Clubs Tab
                ListView.builder(
                  padding: const EdgeInsets.all(16),
                  itemCount: DataService.instance.sampleClubs.length,
                  itemBuilder: (context, index) {
                    final club = DataService.instance.sampleClubs[index];
                    return _buildClubCard(context, club);
                  },
                ),

                // 3. Sports & Squads Tab
                DataService.instance.sportsSquads.isEmpty
                    ? ListView(
                        padding: const EdgeInsets.all(32),
                        children: const [
                          SizedBox(height: 40),
                          Icon(Icons.sports_cricket, size: 48, color: Colors.grey),
                          SizedBox(height: 12),
                          Text('No sports matches active today.', textAlign: TextAlign.center, style: TextStyle(fontWeight: FontWeight.bold)),
                          SizedBox(height: 4),
                          Text('Upcoming tournament fixtures from Sports Committee will appear here.', textAlign: TextAlign.center, style: TextStyle(fontSize: 12, color: Colors.grey)),
                        ],
                      )
                    : ListView.builder(
                        padding: const EdgeInsets.all(16),
                        itemCount: DataService.instance.sportsSquads.length,
                        itemBuilder: (context, index) {
                          final squad = DataService.instance.sportsSquads[index];
                          final isJoined = _joinedSquadIds.contains(squad.id);
                          return _buildSportsCard(context, squad, isJoined, isDark);
                        },
                      ),

                // 4. Lost & Found Tab (Interactive Student Submission & Live Sync)
                RefreshIndicator(
                  onRefresh: () async {
                    await DataService.instance.fetchLiveLostFound();
                    setState(() {});
                  },
                  child: ListView(
                    padding: const EdgeInsets.all(16),
                    children: [
                      // Direct Post Banner
                      Container(
                        padding: const EdgeInsets.all(14),
                        margin: const EdgeInsets.only(bottom: 16),
                        decoration: BoxDecoration(
                          gradient: const LinearGradient(
                            colors: [AppTheme.primaryNavy, Color(0xFF1E3A8A)],
                          ),
                          borderRadius: BorderRadius.circular(12),
                          boxShadow: [
                            BoxShadow(
                              color: AppTheme.primaryNavy.withOpacity(0.2),
                              blurRadius: 8,
                              offset: const Offset(0, 3),
                            ),
                          ],
                        ),
                        child: Row(
                          children: [
                            Container(
                              padding: const EdgeInsets.all(10),
                              decoration: BoxDecoration(
                                color: Colors.white.withOpacity(0.15),
                                shape: BoxShape.circle,
                              ),
                              child: const Icon(Icons.campaign, color: Colors.white, size: 22),
                            ),
                            const SizedBox(width: 12),
                            const Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    'Lost or Found Something on Campus?',
                                    style: TextStyle(
                                      color: Colors.white,
                                      fontWeight: FontWeight.bold,
                                      fontSize: 13,
                                    ),
                                  ),
                                  SizedBox(height: 2),
                                  Text(
                                    'Post details instantly for all students and guard rooms.',
                                    style: TextStyle(
                                      color: Colors.white70,
                                      fontSize: 11,
                                    ),
                                  ),
                                ],
                              ),
                            ),
                            ElevatedButton.icon(
                              onPressed: () => _showPostLostFoundSheet(context, isDark),
                              icon: const Icon(Icons.add, size: 16),
                              label: const Text('Post'),
                              style: ElevatedButton.styleFrom(
                                backgroundColor: AppTheme.warningAmber,
                                foregroundColor: Colors.black87,
                                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                                textStyle: const TextStyle(fontWeight: FontWeight.bold, fontSize: 12),
                                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                              ),
                            ),
                          ],
                        ),
                      ),

                      if (DataService.instance.lostFoundItems.isEmpty)
                        Container(
                          padding: const EdgeInsets.all(32),
                          alignment: Alignment.center,
                          child: const Column(
                            children: [
                              Icon(Icons.check_circle_outline, size: 48, color: AppTheme.successGreen),
                              SizedBox(height: 12),
                              Text('No active lost items reported.', style: TextStyle(fontWeight: FontWeight.bold)),
                              SizedBox(height: 4),
                              Text('Campus is safe! Tap "Post" above if you lost or found something.', style: TextStyle(fontSize: 12, color: Colors.grey)),
                            ],
                          ),
                        )
                      else
                        ...DataService.instance.lostFoundItems.map(
                          (item) => _buildLostFoundCard(context, item, isDark, theme),
                        ),
                    ],
                  ),
                ),

                // 5. Announcements Tab (Live Sync from Admin Panel)
                RefreshIndicator(
                  onRefresh: () async {
                    await DataService.instance.fetchLiveNotices();
                    setState(() {});
                  },
                  child: DataService.instance.campusNotices.isEmpty
                      ? ListView(
                          padding: const EdgeInsets.all(32),
                          children: const [
                            SizedBox(height: 40),
                            Icon(Icons.campaign_outlined, size: 48, color: Colors.grey),
                            SizedBox(height: 12),
                            Text('No circulars or announcements posted yet.', textAlign: TextAlign.center, style: TextStyle(fontWeight: FontWeight.bold)),
                            SizedBox(height: 4),
                            Text('Official notices published from the Admin Panel will appear here automatically.', textAlign: TextAlign.center, style: TextStyle(fontSize: 12, color: Colors.grey)),
                          ],
                        )
                      : ListView.builder(
                          padding: const EdgeInsets.all(16),
                          itemCount: DataService.instance.campusNotices.length,
                          itemBuilder: (context, index) {
                            final notice = DataService.instance.campusNotices[index];
                            return _buildAnnouncementCard(
                              context: context,
                              category: notice.category,
                              title: notice.title,
                              date: notice.dateStr,
                              author: notice.authority,
                              content: notice.description,
                            );
                          },
                        ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildEventCard(BuildContext context, EventItem event, bool isRsvpd) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;

    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      child: Padding(
        padding: const EdgeInsets.all(14),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                  decoration: BoxDecoration(
                    color: AppTheme.accentSky.withValues(alpha: 0.1),
                    borderRadius: BorderRadius.circular(4),
                  ),
                  child: Text(
                    event.category,
                    style: const TextStyle(fontSize: 10.5, fontWeight: FontWeight.w700, color: AppTheme.accentSky),
                  ),
                ),
                Text(
                  '${event.seatsRemaining} spots left',
                  style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w600, color: AppTheme.successGreen),
                ),
              ],
            ),
            const SizedBox(height: 6),
            Text(
              event.title,
              style: TextStyle(fontSize: 14.5, fontWeight: FontWeight.w700, color: isDark ? Colors.white : AppTheme.primaryNavy),
            ),
            const SizedBox(height: 4),
            Row(
              children: [
                const Icon(Icons.calendar_today, size: 13, color: Color(0xFF64748B)),
                const SizedBox(width: 4),
                Text(event.dateStr, style: TextStyle(fontSize: 11, color: isDark ? const Color(0xFF94A3B8) : const Color(0xFF64748B))),
              ],
            ),
            const SizedBox(height: 2),
            Row(
              children: [
                const Icon(Icons.location_on_outlined, size: 13, color: Color(0xFF64748B)),
                const SizedBox(width: 4),
                Expanded(
                  child: Text(
                    event.venue,
                    style: TextStyle(fontSize: 11, color: isDark ? const Color(0xFF94A3B8) : const Color(0xFF64748B)),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 12),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  'By ${event.organizer}',
                  style: TextStyle(fontSize: 11, fontWeight: FontWeight.w500, color: isDark ? const Color(0xFF94A3B8) : const Color(0xFF64748B)),
                ),
                ElevatedButton(
                  onPressed: () => _toggleRsvp(event.id),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: isRsvpd ? AppTheme.successGreen : AppTheme.primaryBlue,
                    foregroundColor: Colors.white,
                    padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                    textStyle: const TextStyle(fontSize: 12, fontWeight: FontWeight.w700),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                  ),
                  child: Text(isRsvpd ? '✓ Registered' : 'RSVP Free Spot'),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildClubCard(BuildContext context, ClubItem club) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;

    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      child: Padding(
        padding: const EdgeInsets.all(14),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                  decoration: BoxDecoration(
                    color: AppTheme.accentSky.withValues(alpha: 0.1),
                    borderRadius: BorderRadius.circular(4),
                  ),
                  child: Text(
                    club.category,
                    style: const TextStyle(fontSize: 10.5, fontWeight: FontWeight.w700, color: AppTheme.accentSky),
                  ),
                ),
                Row(
                  children: [
                    const Icon(Icons.people, size: 14, color: AppTheme.accentSky),
                    const SizedBox(width: 4),
                    Text('${club.memberCount} members', style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w600)),
                  ],
                ),
              ],
            ),
            const SizedBox(height: 6),
            Text(
              club.name,
              style: TextStyle(fontSize: 14.5, fontWeight: FontWeight.w700, color: isDark ? Colors.white : AppTheme.primaryNavy),
            ),
            const SizedBox(height: 4),
            Text(
              club.description,
              style: TextStyle(fontSize: 11.5, color: isDark ? const Color(0xFF94A3B8) : const Color(0xFF64748B), height: 1.4),
            ),
            const SizedBox(height: 8),
            Text(
              'Lead: ${club.leadName}',
              style: TextStyle(fontSize: 11, fontWeight: FontWeight.w600, color: isDark ? const Color(0xFFCBD5E1) : const Color(0xFF475569)),
            ),
            const SizedBox(height: 10),
            ElevatedButton.icon(
              onPressed: () {
                ScaffoldMessenger.of(context).showSnackBar(
                  SnackBar(
                    content: Text('Contact coordinator: ${club.leadContact}'),
                    behavior: SnackBarBehavior.floating,
                  ),
                );
              },
              icon: const Icon(Icons.mail_outline, size: 14),
              label: const Text('Contact Student Coordinator'),
              style: ElevatedButton.styleFrom(
                backgroundColor: isDark ? const Color(0xFF1E293B) : const Color(0xFFF1F5F9),
                foregroundColor: isDark ? Colors.white : AppTheme.primaryNavy,
                elevation: 0,
                minimumSize: const Size(double.infinity, 36),
                textStyle: const TextStyle(fontSize: 11.5, fontWeight: FontWeight.w700),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8), side: BorderSide(color: theme.dividerColor)),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildSportsCard(BuildContext context, SportsSquad squad, bool isJoined, bool isDark) {
    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      child: Padding(
        padding: const EdgeInsets.all(14),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                      decoration: BoxDecoration(
                        color: AppTheme.warningAmber.withValues(alpha: 0.15),
                        borderRadius: BorderRadius.circular(4),
                      ),
                      child: Text(
                        '${squad.sportName} • ${squad.matchType}',
                        style: const TextStyle(fontSize: 10, fontWeight: FontWeight.w700, color: AppTheme.warningAmber),
                      ),
                    ),
                  ],
                ),
                Text(
                  'Squad: ${squad.currentPlayers + (isJoined ? 1 : 0)} / ${squad.maxPlayers}',
                  style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w700, color: AppTheme.accentSky),
                ),
              ],
            ),
            const SizedBox(height: 8),
            Text(
              squad.title,
              style: TextStyle(fontSize: 14, fontWeight: FontWeight.w700, color: isDark ? Colors.white : AppTheme.primaryNavy),
            ),
            const SizedBox(height: 4),
            Row(
              children: [
                const Icon(Icons.location_on_outlined, size: 13, color: Color(0xFF64748B)),
                const SizedBox(width: 4),
                Text(squad.venue, style: const TextStyle(fontSize: 11, color: Color(0xFF64748B))),
              ],
            ),
            const SizedBox(height: 2),
            Row(
              children: [
                const Icon(Icons.access_time, size: 13, color: Color(0xFF64748B)),
                const SizedBox(width: 4),
                Text(squad.dateStr, style: const TextStyle(fontSize: 11, color: Color(0xFF64748B))),
              ],
            ),
            const SizedBox(height: 10),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Expanded(
                  child: Text(
                    'Organizer: ${squad.organizer}',
                    style: TextStyle(fontSize: 10.5, color: isDark ? const Color(0xFF94A3B8) : const Color(0xFF64748B)),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                ),
                ElevatedButton(
                  onPressed: () => _toggleSquad(squad.id),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: isJoined ? AppTheme.successGreen : AppTheme.primaryBlue,
                    foregroundColor: Colors.white,
                    padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 6),
                    textStyle: const TextStyle(fontSize: 11.5, fontWeight: FontWeight.w700),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(6)),
                  ),
                  child: Text(isJoined ? '✓ In Squad' : 'Join Squad / Play'),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildLostFoundCard(BuildContext context, LostFoundItem item, bool isDark, ThemeData theme) {
    final isLost = item.itemType == 'Lost';

    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      child: Padding(
        padding: const EdgeInsets.all(14),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                  decoration: BoxDecoration(
                    color: isLost ? AppTheme.dangerRed.withValues(alpha: 0.12) : AppTheme.successGreen.withValues(alpha: 0.12),
                    borderRadius: BorderRadius.circular(4),
                  ),
                  child: Text(
                    '${item.itemType.toUpperCase()} • ${item.category}',
                    style: TextStyle(
                      fontSize: 10,
                      fontWeight: FontWeight.w800,
                      color: isLost ? AppTheme.dangerRed : AppTheme.successGreen,
                    ),
                  ),
                ),
                Text(item.dateStr, style: const TextStyle(fontSize: 11, color: Color(0xFF64748B))),
              ],
            ),
            const SizedBox(height: 8),
            Text(
              item.title,
              style: TextStyle(fontSize: 14, fontWeight: FontWeight.w700, color: isDark ? Colors.white : AppTheme.primaryNavy),
            ),
            const SizedBox(height: 4),
            Text(
              item.description,
              style: TextStyle(fontSize: 11.5, color: isDark ? const Color(0xFFCBD5E1) : const Color(0xFF475569), height: 1.4),
            ),
            const SizedBox(height: 6),
            Row(
              children: [
                const Icon(Icons.place_outlined, size: 13, color: Color(0xFF64748B)),
                const SizedBox(width: 4),
                Text('Location: ${item.location}', style: const TextStyle(fontSize: 11, color: Color(0xFF64748B))),
              ],
            ),
            const SizedBox(height: 10),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  'Contact: ${item.contactPerson}',
                  style: TextStyle(fontSize: 11, fontWeight: FontWeight.w600, color: isDark ? const Color(0xFFCBD5E1) : const Color(0xFF334155)),
                ),
                ElevatedButton.icon(
                  onPressed: () => DataService.instance.callPhoneNumber(item.contactPhone),
                  icon: const Icon(Icons.call, size: 13),
                  label: const Text('Contact Desk'),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppTheme.primaryBlue,
                    foregroundColor: Colors.white,
                    padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                    textStyle: const TextStyle(fontSize: 11, fontWeight: FontWeight.w700),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(6)),
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildAnnouncementCard({
    required BuildContext context,
    required String category,
    required String title,
    required String date,
    required String author,
    required String content,
  }) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;

    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      child: Padding(
        padding: const EdgeInsets.all(14),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                  decoration: BoxDecoration(
                    color: AppTheme.accentSky.withValues(alpha: 0.1),
                    borderRadius: BorderRadius.circular(4),
                  ),
                  child: Text(
                    category,
                    style: const TextStyle(fontSize: 10.5, fontWeight: FontWeight.w700, color: AppTheme.accentSky),
                  ),
                ),
                Text(date, style: TextStyle(fontSize: 11, color: isDark ? const Color(0xFF94A3B8) : const Color(0xFF64748B))),
              ],
            ),
            const SizedBox(height: 6),
            Text(
              title,
              style: TextStyle(fontSize: 14, fontWeight: FontWeight.w700, color: isDark ? Colors.white : AppTheme.primaryNavy),
            ),
            const SizedBox(height: 4),
            Text(
              content,
              style: TextStyle(fontSize: 11.5, color: isDark ? const Color(0xFF94A3B8) : const Color(0xFF64748B), height: 1.4),
            ),
            const SizedBox(height: 6),
            Text(
              'Posted by: $author',
              style: TextStyle(fontSize: 10.5, fontStyle: FontStyle.italic, color: isDark ? const Color(0xFF64748B) : const Color(0xFF94A3B8)),
            ),
          ],
        ),
      ),
    );
  }

  void _showPostLostFoundSheet(BuildContext context, bool isDark) {
    final titleCtrl = TextEditingController();
    final locationCtrl = TextEditingController();
    final descCtrl = TextEditingController();
    final user = AuthService.instance.currentUser.value;
    final contactNameCtrl = TextEditingController(text: user?.displayName ?? '');
    final contactPhoneCtrl = TextEditingController(text: user?.phone ?? '');

    String selectedType = 'Lost';
    String selectedCategory = 'Electronics';

    final categories = ['Electronics', 'Document / ID Card', 'Keys', 'Books & Notes', 'Bag / Purse', 'Other'];

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: isDark ? const Color(0xFF1E293B) : Colors.white,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (ctx) {
        return StatefulBuilder(
          builder: (ctx, setSheetState) {
            final isLost = selectedType == 'Lost';
            return Padding(
              padding: EdgeInsets.only(
                left: 20,
                right: 20,
                top: 20,
                bottom: MediaQuery.of(ctx).viewInsets.bottom + 24,
              ),
              child: SingleChildScrollView(
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text(
                          'Post Lost or Found Notice',
                          style: TextStyle(
                            fontSize: 17,
                            fontWeight: FontWeight.bold,
                            color: isDark ? Colors.white : AppTheme.primaryNavy,
                          ),
                        ),
                        IconButton(
                          icon: const Icon(Icons.close, size: 20),
                          onPressed: () => Navigator.pop(ctx),
                        ),
                      ],
                    ),
                    const SizedBox(height: 12),

                    // Toggle: Lost or Found
                    Row(
                      children: [
                        Expanded(
                          child: InkWell(
                            onTap: () => setSheetState(() => selectedType = 'Lost'),
                            borderRadius: BorderRadius.circular(8),
                            child: Container(
                              padding: const EdgeInsets.symmetric(vertical: 10),
                              decoration: BoxDecoration(
                                color: isLost ? AppTheme.dangerRed : Colors.transparent,
                                border: Border.all(
                                  color: isLost ? AppTheme.dangerRed : Colors.grey.shade400,
                                ),
                                borderRadius: BorderRadius.circular(8),
                              ),
                              alignment: Alignment.center,
                              child: Text(
                                '🔴 I Lost Something',
                                style: TextStyle(
                                  fontWeight: FontWeight.bold,
                                  fontSize: 12.5,
                                  color: isLost ? Colors.white : (isDark ? Colors.white70 : AppTheme.textPrimary),
                                ),
                              ),
                            ),
                          ),
                        ),
                        const SizedBox(width: 12),
                        Expanded(
                          child: InkWell(
                            onTap: () => setSheetState(() => selectedType = 'Found'),
                            borderRadius: BorderRadius.circular(8),
                            child: Container(
                              padding: const EdgeInsets.symmetric(vertical: 10),
                              decoration: BoxDecoration(
                                color: !isLost ? AppTheme.successGreen : Colors.transparent,
                                border: Border.all(
                                  color: !isLost ? AppTheme.successGreen : Colors.grey.shade400,
                                ),
                                borderRadius: BorderRadius.circular(8),
                              ),
                              alignment: Alignment.center,
                              child: Text(
                                '🟢 I Found Something',
                                style: TextStyle(
                                  fontWeight: FontWeight.bold,
                                  fontSize: 12.5,
                                  color: !isLost ? Colors.white : (isDark ? Colors.white70 : AppTheme.textPrimary),
                                ),
                              ),
                            ),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 16),

                    // Item Title
                    TextFormField(
                      controller: titleCtrl,
                      decoration: const InputDecoration(
                        labelText: 'Item Name / Title *',
                        hintText: 'e.g. Boat Earbuds Black Case, Casio Calculator',
                        prefixIcon: Icon(Icons.search, size: 18),
                        border: OutlineInputBorder(),
                        isDense: true,
                      ),
                    ),
                    const SizedBox(height: 12),

                    // Category Dropdown
                    DropdownButtonFormField<String>(
                      initialValue: selectedCategory,
                      items: categories
                          .map((c) => DropdownMenuItem(value: c, child: Text(c, style: const TextStyle(fontSize: 13))))
                          .toList(),
                      onChanged: (val) {
                        if (val != null) setSheetState(() => selectedCategory = val);
                      },
                      decoration: const InputDecoration(
                        labelText: 'Category',
                        prefixIcon: Icon(Icons.category_outlined, size: 18),
                        border: OutlineInputBorder(),
                        isDense: true,
                      ),
                    ),
                    const SizedBox(height: 12),

                    // Location
                    TextFormField(
                      controller: locationCtrl,
                      decoration: const InputDecoration(
                        labelText: 'Location on Campus *',
                        hintText: 'e.g. Room 204, Library 1st Floor, Canteen',
                        prefixIcon: Icon(Icons.place_outlined, size: 18),
                        border: OutlineInputBorder(),
                        isDense: true,
                      ),
                    ),
                    const SizedBox(height: 12),

                    // Detailed Description ("jo user likhna chahta hon")
                    TextFormField(
                      controller: descCtrl,
                      maxLines: 3,
                      decoration: const InputDecoration(
                        labelText: 'Full Description & Identification Details',
                        hintText: 'Color, brand, identifying marks, serial number, or any message you want to post...',
                        prefixIcon: Icon(Icons.description_outlined, size: 18),
                        border: OutlineInputBorder(),
                        alignLabelWithHint: true,
                        isDense: true,
                      ),
                    ),
                    const SizedBox(height: 12),

                    // Contact Details
                    Row(
                      children: [
                        Expanded(
                          child: TextFormField(
                            controller: contactNameCtrl,
                            decoration: const InputDecoration(
                              labelText: 'Your Name *',
                              prefixIcon: Icon(Icons.person_outline, size: 18),
                              border: OutlineInputBorder(),
                              isDense: true,
                            ),
                          ),
                        ),
                        const SizedBox(width: 10),
                        Expanded(
                          child: TextFormField(
                            controller: contactPhoneCtrl,
                            keyboardType: TextInputType.phone,
                            decoration: const InputDecoration(
                              labelText: 'Contact Phone *',
                              prefixIcon: Icon(Icons.phone_outlined, size: 18),
                              border: OutlineInputBorder(),
                              isDense: true,
                            ),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 20),

                    // Submit Button
                    SizedBox(
                      width: double.infinity,
                      height: 48,
                      child: ElevatedButton.icon(
                        style: ElevatedButton.styleFrom(
                          backgroundColor: isLost ? AppTheme.dangerRed : AppTheme.successGreen,
                          foregroundColor: Colors.white,
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                        ),
                        onPressed: () async {
                          final title = titleCtrl.text.trim();
                          final loc = locationCtrl.text.trim();
                          final phone = contactPhoneCtrl.text.trim();
                          final name = contactNameCtrl.text.trim();
                          final desc = descCtrl.text.trim();

                          if (title.isEmpty || phone.isEmpty) {
                            ScaffoldMessenger.of(context).showSnackBar(
                              const SnackBar(content: Text('Please enter Item Name and Contact Phone.')),
                            );
                            return;
                          }

                          final now = DateTime.now();
                          final dateStr = '${now.day} ${_monthName(now.month)} ${now.year}';

                          await DataService.instance.submitLostFoundItem(
                            title: title,
                            itemType: selectedType,
                            category: selectedCategory,
                            location: loc.isNotEmpty ? loc : 'Sheikhpura Campus',
                            dateStr: dateStr,
                            contactPerson: name.isNotEmpty ? name : 'Student',
                            contactPhone: phone,
                            description: desc.isNotEmpty ? desc : 'Contact owner/finder directly via phone.',
                          );

                          if (ctx.mounted) Navigator.pop(ctx);
                          if (context.mounted) {
                            setState(() {});
                            ScaffoldMessenger.of(context).showSnackBar(
                              SnackBar(
                                content: Text('✓ $selectedType notice published live across campus!'),
                                backgroundColor: AppTheme.successGreen,
                              ),
                            );
                          }
                        },
                        icon: const Icon(Icons.send, size: 18),
                        label: Text(
                          'Publish $selectedType Notice',
                          style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14),
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            );
          },
        );
      },
    );
  }

  String _monthName(int month) {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return (month >= 1 && month <= 12) ? months[month - 1] : '';
  }
}
