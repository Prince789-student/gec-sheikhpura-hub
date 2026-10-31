import 'package:flutter/material.dart';
import '../models/models.dart';
import '../services/data_service.dart';
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
                // 1. Events Tab
                ListView.builder(
                  padding: const EdgeInsets.all(16),
                  itemCount: DataService.instance.sampleEvents.length,
                  itemBuilder: (context, index) {
                    final event = DataService.instance.sampleEvents[index];
                    final isRsvpd = _rsvpdEventIds.contains(event.id);
                    return _buildEventCard(context, event, isRsvpd);
                  },
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
                ListView.builder(
                  padding: const EdgeInsets.all(16),
                  itemCount: DataService.instance.sportsSquads.length,
                  itemBuilder: (context, index) {
                    final squad = DataService.instance.sportsSquads[index];
                    final isJoined = _joinedSquadIds.contains(squad.id);
                    return _buildSportsCard(context, squad, isJoined, isDark);
                  },
                ),

                // 4. Lost & Found Tab
                ListView.builder(
                  padding: const EdgeInsets.all(16),
                  itemCount: DataService.instance.lostFoundItems.length,
                  itemBuilder: (context, index) {
                    final item = DataService.instance.lostFoundItems[index];
                    return _buildLostFoundCard(context, item, isDark, theme);
                  },
                ),

                // 5. Announcements Tab
                ListView(
                  padding: const EdgeInsets.all(16),
                  children: [
                    _buildAnnouncementCard(
                      context: context,
                      category: 'Sports & Ground',
                      title: 'Hostel Badminton Court Floodlight Sparring — Evening 6:30 PM',
                      date: 'Oct 30, 2026',
                      author: 'Hostel Sports Representative',
                      content: 'Open doubles sparring at Boys Hostel court. Bring your own rackets; shuttles provided by committee.',
                    ),
                    _buildAnnouncementCard(
                      context: context,
                      category: 'Lost & Found',
                      title: 'Lost Casio fx-991ES Plus Scientific Calculator in Room 204',
                      date: 'Oct 29, 2026',
                      author: 'Aman Kumar (CSE 3rd Year)',
                      content: 'Left in Room 204 after 3rd period. If found, return to CSE HOD desk or guard room.',
                    ),
                    _buildAnnouncementCard(
                      context: context,
                      category: 'Cultural',
                      title: 'Natraj Drama Club Auditions for Aarohan Street Play',
                      date: 'Oct 28, 2026',
                      author: 'Natraj Cultural Society',
                      content: 'Calling actors, scriptwriters, and musicians. Auditions on Friday at Open Air Stage.',
                    ),
                  ],
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
}
