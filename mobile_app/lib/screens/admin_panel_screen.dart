import 'package:flutter/material.dart';
import '../services/data_service.dart';
import '../models/models.dart';
import '../theme/app_theme.dart';

class AdminPanelScreen extends StatefulWidget {
  const AdminPanelScreen({super.key});

  @override
  State<AdminPanelScreen> createState() => _AdminPanelScreenState();
}

class _AdminPanelScreenState extends State<AdminPanelScreen> with SingleTickerProviderStateMixin {
  late TabController _tabController;

  // Manageable State
  List<RoomListing> _rooms = [];
  List<CampusNotice> _notices = [];
  final List<Map<String, dynamic>> _pendingListings = [
    {
      'id': 'sub_001',
      'title': 'Maa Tara Boys PG & Mess (Near Bajidpur Gate)',
      'type': 'Double Bed Room',
      'owner': 'Ramesh Singh',
      'phone': '9835012345',
      'rent': '₹2,500/mo',
      'submitted': 'Today, 11:30 AM',
      'status': 'Pending Approval',
    },
    {
      'id': 'sub_002',
      'title': 'Anand Stationery & Fast Xerox Desk',
      'type': 'Campus Store',
      'owner': 'Anand Verma',
      'phone': '9431098765',
      'services': 'Spiral binding, BEU syllabus prints, Lab manuals',
      'submitted': 'Yesterday',
      'status': 'Pending Approval',
    },
  ];

  final List<Map<String, dynamic>> _grievances = [
    {
      'id': 'grv_001',
      'category': 'Hostel Maintenance',
      'urgency': 'Medium',
      'title': 'Water purifier filter replacement needed in Hostel 2',
      'student': 'CSE 2nd Year Student',
      'date': '29 Oct 2026',
      'status': 'Under Review',
    },
    {
      'id': 'grv_002',
      'category': 'Anti-Ragging Vigilance',
      'urgency': 'High',
      'title': 'Routine night inspection request at Bajidpur private rentals',
      'student': 'Hostel Prefect Committee',
      'date': '30 Oct 2026',
      'status': 'Action Assigned',
    },
  ];

  // Notice Form Controllers
  final _noticeTitleCtrl = TextEditingController();
  final _noticeAuthorityCtrl = TextEditingController(text: 'Admin Office / Dean Academics');
  final _noticeBodyCtrl = TextEditingController();
  String _noticeCategory = 'Examination';
  bool _noticeIsUrgent = true;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 4, vsync: this);
    _rooms = List.from(DataService.instance.sampleRooms);
    _notices = List.from(DataService.instance.campusNotices);
  }

  @override
  void dispose() {
    _tabController.dispose();
    _noticeTitleCtrl.dispose();
    _noticeAuthorityCtrl.dispose();
    _noticeBodyCtrl.dispose();
    super.dispose();
  }

  void _approvePendingListing(int index) {
    setState(() {
      final item = _pendingListings.removeAt(index);
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('✓ Approved and published "${item['title']}" to live Marketplace!'),
          backgroundColor: AppTheme.successGreen,
        ),
      );
    });
  }

  void _rejectPendingListing(int index) {
    setState(() {
      final item = _pendingListings.removeAt(index);
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('✕ Rejected submission "${item['title']}". Submitter notified.'),
          backgroundColor: AppTheme.dangerRed,
        ),
      );
    });
  }

  void _broadcastNotice() {
    final title = _noticeTitleCtrl.text.trim();
    final body = _noticeBodyCtrl.text.trim();
    final auth = _noticeAuthorityCtrl.text.trim();

    if (title.isEmpty || body.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Please fill out notice title and details.'),
          backgroundColor: AppTheme.warningAmber,
        ),
      );
      return;
    }

    final newNotice = CampusNotice(
      id: 'ntc_${DateTime.now().millisecondsSinceEpoch}',
      title: title,
      category: _noticeCategory,
      dateStr: 'Just Now',
      authority: auth.isNotEmpty ? auth : 'GEC Sheikhpura Administration',
      description: body,
      isUrgent: _noticeIsUrgent,
    );

    setState(() {
      _notices.insert(0, newNotice);
      _noticeTitleCtrl.clear();
      _noticeBodyCtrl.clear();
    });

    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text('📢 Notice published live: "$title"'),
        backgroundColor: AppTheme.successGreen,
      ),
    );
  }

  void _deleteNotice(int index) {
    setState(() {
      final removed = _notices.removeAt(index);
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Archived notice "${removed.title}"'),
          duration: const Duration(seconds: 1),
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
        titleSpacing: 8,
        title: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(6),
              decoration: BoxDecoration(
                color: const Color(0xFFD97706).withValues(alpha: 0.15),
                borderRadius: BorderRadius.circular(8),
              ),
              child: const Icon(Icons.admin_panel_settings, color: Color(0xFFD97706), size: 22),
            ),
            const SizedBox(width: 10),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                mainAxisSize: MainAxisSize.min,
                children: [
                  const Text(
                    'Super Admin Dashboard',
                    style: TextStyle(fontWeight: FontWeight.w800, fontSize: 16),
                  ),
                  Text(
                    'pk3334238@gmail.com • Lead Administrator',
                    style: TextStyle(
                      fontSize: 11,
                      color: isDark ? const Color(0xFF94A3B8) : const Color(0xFF64748B),
                    ),
                    overflow: TextOverflow.ellipsis,
                  ),
                ],
              ),
            ),
          ],
        ),
        bottom: TabBar(
          controller: _tabController,
          isScrollable: true,
          tabAlignment: TabAlignment.start,
          labelColor: const Color(0xFFD97706),
          indicatorColor: const Color(0xFFD97706),
          indicatorWeight: 3,
          labelStyle: const TextStyle(fontWeight: FontWeight.w700, fontSize: 12.5),
          tabs: [
            Tab(
              icon: const Icon(Icons.approval_rounded, size: 18),
              text: 'Approvals (${_pendingListings.length})',
            ),
            Tab(
              icon: const Icon(Icons.campaign_rounded, size: 18),
              text: 'Broadcast Notice (${_notices.length})',
            ),
            Tab(
              icon: const Icon(Icons.shield_rounded, size: 18),
              text: 'Grievance Desk (${_grievances.length})',
            ),
            const Tab(
              icon: Icon(Icons.storage_rounded, size: 18),
              text: 'Web & System Sync',
            ),
          ],
        ),
      ),
      body: Center(
        child: ConstrainedBox(
          constraints: const BoxConstraints(maxWidth: 860),
          child: Column(
            children: [
              // Admin Status Pill
              Container(
                width: double.infinity,
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                color: isDark ? const Color(0xFF1E293B) : const Color(0xFFFEF3C7),
                child: Row(
                  children: [
                    const Icon(Icons.verified_user, size: 15, color: Color(0xFFD97706)),
                    const SizedBox(width: 8),
                    Expanded(
                      child: Text(
                        'Full Control Mode • Authenticated as Super Admin: Prince Kumar',
                        style: TextStyle(
                          fontSize: 11,
                          fontWeight: FontWeight.w700,
                          color: isDark ? const Color(0xFFFDE68A) : const Color(0xFF92400E),
                        ),
                      ),
                    ),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                      decoration: BoxDecoration(
                        color: const Color(0xFFD97706),
                        borderRadius: BorderRadius.circular(4),
                      ),
                      child: const Text('SUPER_ADMIN', style: TextStyle(fontSize: 9, color: Colors.white, fontWeight: FontWeight.bold)),
                    ),
                  ],
                ),
              ),

              // Tab Views
              Expanded(
                child: TabBarView(
                  controller: _tabController,
                  children: [
                    _buildApprovalsTab(isDark, theme),
                    _buildNoticesTab(isDark, theme),
                    _buildGrievanceTab(isDark, theme),
                    _buildSystemSyncTab(isDark, theme),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  // --- TAB 1: LISTING APPROVALS ---
  Widget _buildApprovalsTab(bool isDark, ThemeData theme) {
    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(
              'Pending Student & Owner Submissions',
              style: TextStyle(
                fontSize: 14,
                fontWeight: FontWeight.w800,
                color: isDark ? Colors.white : AppTheme.primaryNavy,
              ),
            ),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
              decoration: BoxDecoration(
                color: const Color(0xFF3B82F6).withValues(alpha: 0.15),
                borderRadius: BorderRadius.circular(12),
              ),
              child: Text(
                '${_pendingListings.length} Require Review',
                style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Color(0xFF2563EB)),
              ),
            ),
          ],
        ),
        const SizedBox(height: 12),
        if (_pendingListings.isEmpty)
          Container(
            padding: const EdgeInsets.all(24),
            decoration: BoxDecoration(
              color: theme.cardColor,
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: theme.dividerColor),
            ),
            child: const Center(
              child: Column(
                children: [
                  Icon(Icons.check_circle_outline, size: 40, color: AppTheme.successGreen),
                  SizedBox(height: 10),
                  Text('All caught up!', style: TextStyle(fontSize: 14, fontWeight: FontWeight.bold)),
                  Text('No pending room or business approvals at this time.', style: TextStyle(fontSize: 12, color: Colors.grey)),
                ],
              ),
            ),
          )
        else
          ..._pendingListings.asMap().entries.map((entry) {
            final idx = entry.key;
            final item = entry.value;
            return Container(
              margin: const EdgeInsets.only(bottom: 12),
              padding: const EdgeInsets.all(14),
              decoration: BoxDecoration(
                color: theme.cardColor,
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: const Color(0xFFF59E0B).withValues(alpha: 0.4)),
                boxShadow: [
                  BoxShadow(color: Colors.black.withValues(alpha: 0.04), blurRadius: 4, offset: const Offset(0, 2)),
                ],
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                        decoration: BoxDecoration(
                          color: const Color(0xFFF59E0B).withValues(alpha: 0.15),
                          borderRadius: BorderRadius.circular(4),
                        ),
                        child: Text(
                          item['type'] ?? 'Listing',
                          style: const TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: Color(0xFFD97706)),
                        ),
                      ),
                      const SizedBox(width: 8),
                      Text(item['submitted'] ?? '', style: const TextStyle(fontSize: 10, color: Colors.grey)),
                      const Spacer(),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                        decoration: BoxDecoration(
                          color: const Color(0xFFF59E0B),
                          borderRadius: BorderRadius.circular(4),
                        ),
                        child: const Text('Pending Review', style: TextStyle(fontSize: 9, color: Colors.white, fontWeight: FontWeight.bold)),
                      ),
                    ],
                  ),
                  const SizedBox(height: 8),
                  Text(
                    item['title'] ?? '',
                    style: TextStyle(
                      fontSize: 14,
                      fontWeight: FontWeight.w700,
                      color: isDark ? Colors.white : AppTheme.primaryNavy,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    'Contact: ${item['owner']} • 📞 ${item['phone']}',
                    style: const TextStyle(fontSize: 12, color: Colors.grey),
                  ),
                  if (item['rent'] != null)
                    Text('Proposed Rent: ${item['rent']}', style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: AppTheme.accentSky)),
                  if (item['services'] != null)
                    Text('Services: ${item['services']}', style: const TextStyle(fontSize: 11.5, color: Colors.grey)),
                  const SizedBox(height: 12),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.end,
                    children: [
                      OutlinedButton.icon(
                        onPressed: () => _rejectPendingListing(idx),
                        icon: const Icon(Icons.close, size: 14, color: AppTheme.dangerRed),
                        label: const Text('Reject / Spam', style: TextStyle(color: AppTheme.dangerRed, fontSize: 11.5)),
                        style: OutlinedButton.styleFrom(
                          side: const BorderSide(color: AppTheme.dangerRed),
                          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                        ),
                      ),
                      const SizedBox(width: 8),
                      ElevatedButton.icon(
                        onPressed: () => _approvePendingListing(idx),
                        icon: const Icon(Icons.check, size: 14),
                        label: const Text('Approve & Publish', style: TextStyle(fontSize: 11.5)),
                        style: ElevatedButton.styleFrom(
                          backgroundColor: AppTheme.successGreen,
                          foregroundColor: Colors.white,
                          padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            );
          }),

        const SizedBox(height: 20),
        Text(
          'Active Marketplace Listings (${_rooms.length} Verified Rooms)',
          style: TextStyle(
            fontSize: 14,
            fontWeight: FontWeight.w800,
            color: isDark ? Colors.white : AppTheme.primaryNavy,
          ),
        ),
        const SizedBox(height: 10),
        ..._rooms.take(4).map((r) {
          return ListTile(
            contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(8),
              side: BorderSide(color: theme.dividerColor),
            ),
            leading: const CircleAvatar(
              backgroundColor: Color(0xFF0284C7),
              child: Icon(Icons.bed_rounded, color: Colors.white, size: 18),
            ),
            title: Text(r.title, style: const TextStyle(fontSize: 13, fontWeight: FontWeight.bold)),
            subtitle: Text('₹${r.rentMonthly}/mo • ${r.address}', style: const TextStyle(fontSize: 11)),
            trailing: const Chip(
              label: Text('Live', style: TextStyle(fontSize: 10, color: Colors.white, fontWeight: FontWeight.bold)),
              backgroundColor: AppTheme.successGreen,
              padding: EdgeInsets.zero,
              materialTapTargetSize: MaterialTapTargetSize.shrinkWrap,
            ),
          );
        }),
      ],
    );
  }

  // --- TAB 2: BROADCAST NOTICES ---
  Widget _buildNoticesTab(bool isDark, ThemeData theme) {
    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        // Notice Posting Form
        Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: theme.cardColor,
            borderRadius: BorderRadius.circular(14),
            border: Border.all(color: const Color(0xFFD97706).withValues(alpha: 0.3)),
            boxShadow: [
              BoxShadow(color: Colors.black.withValues(alpha: 0.04), blurRadius: 6, offset: const Offset(0, 2)),
            ],
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  const Icon(Icons.campaign, color: Color(0xFFD97706), size: 20),
                  const SizedBox(width: 8),
                  Text(
                    'Post Official Campus Notice / Alert',
                    style: TextStyle(
                      fontSize: 14,
                      fontWeight: FontWeight.w800,
                      color: isDark ? Colors.white : AppTheme.primaryNavy,
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 12),
              TextField(
                controller: _noticeTitleCtrl,
                decoration: InputDecoration(
                  labelText: 'Notice Title *',
                  hintText: 'e.g. Revised Mid-Semester Examination Schedule Announced',
                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(8)),
                  contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                ),
              ),
              const SizedBox(height: 10),
              Row(
                children: [
                  Expanded(
                    child: DropdownButtonFormField<String>(
                      initialValue: _noticeCategory,
                      decoration: InputDecoration(
                        labelText: 'Category',
                        border: OutlineInputBorder(borderRadius: BorderRadius.circular(8)),
                        contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                      ),
                      items: const [
                        DropdownMenuItem(value: 'Examination', child: Text('Examination')),
                        DropdownMenuItem(value: 'University', child: Text('University (BEU)')),
                        DropdownMenuItem(value: 'Administration', child: Text('Administration')),
                        DropdownMenuItem(value: 'Scholarship', child: Text('Scholarship')),
                        DropdownMenuItem(value: 'Emergency', child: Text('Emergency Alert')),
                      ],
                      onChanged: (v) {
                        if (v != null) setState(() => _noticeCategory = v);
                      },
                    ),
                  ),
                  const SizedBox(width: 10),
                  Expanded(
                    child: TextField(
                      controller: _noticeAuthorityCtrl,
                      decoration: InputDecoration(
                        labelText: 'Authority / Department',
                        hintText: 'e.g. Dean Academics',
                        border: OutlineInputBorder(borderRadius: BorderRadius.circular(8)),
                        contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                      ),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 10),
              TextField(
                controller: _noticeBodyCtrl,
                maxLines: 3,
                decoration: InputDecoration(
                  labelText: 'Notice Body / Official Circular Details *',
                  hintText: 'Enter complete announcement, instructions for students, and reporting deadlines...',
                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(8)),
                  contentPadding: const EdgeInsets.all(12),
                ),
              ),
              const SizedBox(height: 8),
              Row(
                children: [
                  Checkbox(
                    value: _noticeIsUrgent,
                    activeColor: AppTheme.dangerRed,
                    onChanged: (v) => setState(() => _noticeIsUrgent = v ?? false),
                  ),
                  const Text('Mark as Urgent Flash Notice (Show prominently on live banner)', style: TextStyle(fontSize: 12, fontWeight: FontWeight.w600)),
                  const Spacer(),
                  ElevatedButton.icon(
                    onPressed: _broadcastNotice,
                    icon: const Icon(Icons.send_rounded, size: 15),
                    label: const Text('Broadcast Live Notice'),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(0xFFD97706),
                      foregroundColor: Colors.white,
                      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),

        const SizedBox(height: 20),
        Text(
          'Live Published Notices (${_notices.length})',
          style: TextStyle(
            fontSize: 14,
            fontWeight: FontWeight.w800,
            color: isDark ? Colors.white : AppTheme.primaryNavy,
          ),
        ),
        const SizedBox(height: 10),
        ..._notices.asMap().entries.map((entry) {
          final idx = entry.key;
          final n = entry.value;
          return Card(
            margin: const EdgeInsets.only(bottom: 8),
            child: ListTile(
              leading: Icon(
                n.isUrgent ? Icons.warning_rounded : Icons.info_rounded,
                color: n.isUrgent ? AppTheme.dangerRed : AppTheme.primaryBlue,
              ),
              title: Text(n.title, style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w700)),
              subtitle: Text('${n.authority} • ${n.dateStr}\n${n.description}', style: const TextStyle(fontSize: 11)),
              trailing: IconButton(
                icon: const Icon(Icons.delete_outline, color: AppTheme.dangerRed, size: 20),
                tooltip: 'Archive / Delete',
                onPressed: () => _deleteNotice(idx),
              ),
            ),
          );
        }),
      ],
    );
  }

  // --- TAB 3: GRIEVANCES ---
  Widget _buildGrievanceTab(bool isDark, ThemeData theme) {
    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(
              'Confidential Student Grievance Tickets',
              style: TextStyle(
                fontSize: 14,
                fontWeight: FontWeight.w800,
                color: isDark ? Colors.white : AppTheme.primaryNavy,
              ),
            ),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
              decoration: BoxDecoration(
                color: AppTheme.dangerRed.withValues(alpha: 0.15),
                borderRadius: BorderRadius.circular(12),
              ),
              child: const Text('Statutory Compliance', style: TextStyle(fontSize: 10.5, fontWeight: FontWeight.bold, color: AppTheme.dangerRed)),
            ),
          ],
        ),
        const SizedBox(height: 12),
        ..._grievances.asMap().entries.map((entry) {
          final idx = entry.key;
          final g = entry.value;
          return Container(
            margin: const EdgeInsets.only(bottom: 12),
            padding: const EdgeInsets.all(14),
            decoration: BoxDecoration(
              color: theme.cardColor,
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: theme.dividerColor),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                      decoration: BoxDecoration(
                        color: g['urgency'] == 'High' ? AppTheme.dangerRed.withValues(alpha: 0.15) : AppTheme.warningAmber.withValues(alpha: 0.15),
                        borderRadius: BorderRadius.circular(4),
                      ),
                      child: Text(
                        '${g['category']} • ${g['urgency']}',
                        style: TextStyle(
                          fontSize: 10,
                          fontWeight: FontWeight.bold,
                          color: g['urgency'] == 'High' ? AppTheme.dangerRed : const Color(0xFFD97706),
                        ),
                      ),
                    ),
                    const Spacer(),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                      decoration: BoxDecoration(
                        color: AppTheme.primaryBlue.withValues(alpha: 0.15),
                        borderRadius: BorderRadius.circular(4),
                      ),
                      child: Text(g['status'] ?? '', style: const TextStyle(fontSize: 10, color: AppTheme.primaryBlue, fontWeight: FontWeight.bold)),
                    ),
                  ],
                ),
                const SizedBox(height: 8),
                Text(g['title'] ?? '', style: const TextStyle(fontSize: 13.5, fontWeight: FontWeight.w700)),
                const SizedBox(height: 4),
                Text('Reported By: ${g['student']} • ${g['date']}', style: const TextStyle(fontSize: 11.5, color: Colors.grey)),
                const SizedBox(height: 10),
                Row(
                  mainAxisAlignment: MainAxisAlignment.end,
                  children: [
                    TextButton.icon(
                      onPressed: () {
                        setState(() {
                          _grievances[idx]['status'] = 'Resolved';
                        });
                        ScaffoldMessenger.of(context).showSnackBar(
                          SnackBar(content: Text('Ticket marked as Resolved: "${g['title']}"')),
                        );
                      },
                      icon: const Icon(Icons.check_circle_outline, size: 15, color: AppTheme.successGreen),
                      label: const Text('Mark Resolved', style: TextStyle(color: AppTheme.successGreen, fontSize: 11.5)),
                    ),
                  ],
                ),
              ],
            ),
          );
        }),
      ],
    );
  }

  // --- TAB 4: SYSTEM SYNC ---
  Widget _buildSystemSyncTab(bool isDark, ThemeData theme) {
    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: theme.cardColor,
            borderRadius: BorderRadius.circular(14),
            border: Border.all(color: theme.dividerColor),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                'Desktop Web Admin Console',
                style: TextStyle(
                  fontSize: 14,
                  fontWeight: FontWeight.w800,
                  color: isDark ? Colors.white : AppTheme.primaryNavy,
                ),
              ),
              const SizedBox(height: 6),
              const Text(
                'Access deep database inspection, Supabase configuration, crawler audits, and multi-table management on the website admin dashboard.',
                style: TextStyle(fontSize: 12, color: Colors.grey, height: 1.4),
              ),
              const SizedBox(height: 12),
              ElevatedButton.icon(
                onPressed: () {
                  DataService.instance.launchExternalUrl('http://localhost:3000/admin.html');
                },
                icon: const Icon(Icons.open_in_browser, size: 16),
                label: const Text('Open Web Admin (admin.html)'),
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppTheme.primaryNavy,
                  foregroundColor: Colors.white,
                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
                ),
              ),
            ],
          ),
        ),
        const SizedBox(height: 16),
        Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: theme.cardColor,
            borderRadius: BorderRadius.circular(14),
            border: Border.all(color: theme.dividerColor),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                'Data Backup & Vault Sync',
                style: TextStyle(
                  fontSize: 14,
                  fontWeight: FontWeight.w800,
                  color: isDark ? Colors.white : AppTheme.primaryNavy,
                ),
              ),
              const SizedBox(height: 8),
              const ListTile(
                leading: Icon(Icons.cloud_done, color: AppTheme.successGreen),
                title: Text('Supabase Cloud Database', style: TextStyle(fontSize: 13, fontWeight: FontWeight.bold)),
                subtitle: Text('Connected & Synchronized with College Seed Store', style: TextStyle(fontSize: 11)),
              ),
              const ListTile(
                leading: Icon(Icons.security, color: Color(0xFFD97706)),
                title: Text('Designated Super Administrator', style: TextStyle(fontSize: 13, fontWeight: FontWeight.bold)),
                subtitle: Text('Prince Kumar (pk3334238@gmail.com)', style: TextStyle(fontSize: 11)),
              ),
            ],
          ),
        ),
      ],
    );
  }
}
