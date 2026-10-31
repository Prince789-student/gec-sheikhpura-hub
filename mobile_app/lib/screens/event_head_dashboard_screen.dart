import 'package:flutter/material.dart';
import '../models/sports_events_models.dart';
import '../services/sports_events_service.dart';
import '../services/auth_service.dart';
import '../theme/app_theme.dart';

class EventHeadDashboardScreen extends StatefulWidget {
  final StudentEvent event;

  const EventHeadDashboardScreen({super.key, required this.event});

  @override
  State<EventHeadDashboardScreen> createState() => _EventHeadDashboardScreenState();
}

class _EventHeadDashboardScreenState extends State<EventHeadDashboardScreen> with SingleTickerProviderStateMixin {
  late TabController _tabController;
  late StudentEvent _event;
  bool _isLoading = false;

  @override
  void initState() {
    super.initState();
    _event = widget.event;
    _tabController = TabController(length: 4, vsync: this);
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  Future<void> _refreshEvent() async {
    setState(() => _isLoading = true);
    final updated = await SportsEventsService.instance.getEventById(_event.id);
    if (mounted) {
      setState(() {
        if (updated != null) _event = updated;
        _isLoading = false;
      });
    }
  }

  // --- Dialog: Add Committee Member ---
  void _showAddMemberDialog() {
    final nameCtrl = TextEditingController();
    final emailCtrl = TextEditingController();
    final regNoCtrl = TextEditingController();
    final responsibilitiesCtrl = TextEditingController();

    String selectedRole = 'Event Coordinator';
    final List<String> roles = [
      'Co-Head',
      'Event Coordinator',
      'Technical Manager',
      'Sports Manager',
      'Registration Manager',
      'Finance Manager',
      'Media Manager',
      'Volunteer',
      'Custom Role',
    ];

    bool permViewParticipants = true;
    bool permManageRegistrations = true;
    bool permUpdateSchedules = false;
    bool permUploadDocs = false;
    bool permPublishAnnouncements = false;
    bool permManageTasks = true;

    showDialog(
      context: context,
      builder: (ctx) {
        return StatefulBuilder(
          builder: (dialogCtx, setDialogState) {
            return AlertDialog(
              title: const Text('Add Management Member', style: TextStyle(fontSize: 17, fontWeight: FontWeight.bold)),
              content: SingleChildScrollView(
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    TextField(
                      controller: nameCtrl,
                      decoration: const InputDecoration(labelText: 'Member Full Name *', isDense: true),
                    ),
                    const SizedBox(height: 10),
                    TextField(
                      controller: emailCtrl,
                      decoration: const InputDecoration(labelText: 'Student College Email *', isDense: true),
                    ),
                    const SizedBox(height: 10),
                    TextField(
                      controller: regNoCtrl,
                      decoration: const InputDecoration(labelText: 'BEU Registration No.', isDense: true),
                    ),
                    const SizedBox(height: 12),
                    DropdownButtonFormField<String>(
                      value: selectedRole,
                      decoration: const InputDecoration(labelText: 'Assigned Role', isDense: true),
                      items: roles.map((r) => DropdownMenuItem(value: r, child: Text(r))).toList(),
                      onChanged: (v) {
                        if (v != null) setDialogState(() => selectedRole = v);
                      },
                    ),
                    const SizedBox(height: 10),
                    TextField(
                      controller: responsibilitiesCtrl,
                      decoration: const InputDecoration(labelText: 'Key Responsibilities', isDense: true),
                    ),
                    const SizedBox(height: 16),
                    const Text('Granular Permissions', style: TextStyle(fontSize: 13, fontWeight: FontWeight.bold)),
                    CheckboxListTile(
                      dense: true,
                      title: const Text('View Registered Participants', style: TextStyle(fontSize: 12.5)),
                      value: permViewParticipants,
                      onChanged: (v) => setDialogState(() => permViewParticipants = v ?? false),
                    ),
                    CheckboxListTile(
                      dense: true,
                      title: const Text('Manage Registrations / Approvals', style: TextStyle(fontSize: 12.5)),
                      value: permManageRegistrations,
                      onChanged: (v) => setDialogState(() => permManageRegistrations = v ?? false),
                    ),
                    CheckboxListTile(
                      dense: true,
                      title: const Text('Update Event Schedules', style: TextStyle(fontSize: 12.5)),
                      value: permUpdateSchedules,
                      onChanged: (v) => setDialogState(() => permUpdateSchedules = v ?? false),
                    ),
                    CheckboxListTile(
                      dense: true,
                      title: const Text('Upload Documents & Circulars', style: TextStyle(fontSize: 12.5)),
                      value: permUploadDocs,
                      onChanged: (v) => setDialogState(() => permUploadDocs = v ?? false),
                    ),
                    CheckboxListTile(
                      dense: true,
                      title: const Text('Publish Live Announcements', style: TextStyle(fontSize: 12.5)),
                      value: permPublishAnnouncements,
                      onChanged: (v) => setDialogState(() => permPublishAnnouncements = v ?? false),
                    ),
                    CheckboxListTile(
                      dense: true,
                      title: const Text('Manage Event Tasks & Logistics', style: TextStyle(fontSize: 12.5)),
                      value: permManageTasks,
                      onChanged: (v) => setDialogState(() => permManageTasks = v ?? false),
                    ),
                  ],
                ),
              ),
              actions: [
                TextButton(onPressed: () => Navigator.pop(ctx), child: const Text('Cancel')),
                ElevatedButton(
                  onPressed: () async {
                    if (nameCtrl.text.trim().isEmpty || emailCtrl.text.trim().isEmpty) return;
                    final permissions = <String>[];
                    if (permViewParticipants) permissions.add('view_participants');
                    if (permManageRegistrations) permissions.add('manage_registrations');
                    if (permUpdateSchedules) permissions.add('update_schedules');
                    if (permUploadDocs) permissions.add('upload_documents');
                    if (permPublishAnnouncements) permissions.add('publish_announcements');
                    if (permManageTasks) permissions.add('manage_tasks');

                    final payload = {
                      'studentName': nameCtrl.text.trim(),
                      'studentEmail': emailCtrl.text.trim(),
                      'regNo': regNoCtrl.text.trim(),
                      'role': selectedRole,
                      'responsibilities': responsibilitiesCtrl.text.trim(),
                      'permissions': permissions,
                    };

                    final messenger = ScaffoldMessenger.of(context);
                    final nav = Navigator.of(ctx);

                    final ok = await SportsEventsService.instance.addEventMember(_event.id, payload);
                    if (ok) {
                      nav.pop();
                      _refreshEvent();
                      messenger.showSnackBar(
                        SnackBar(content: Text('✓ Added ${nameCtrl.text.trim()} to Management Committee!'), backgroundColor: AppTheme.successGreen),
                      );
                    }
                  },
                  child: const Text('Add Member'),
                ),
              ],
            );
          },
        );
      },
    );
  }

  // --- Dialog: Publish Official Update ---
  void _showPublishUpdateDialog() {
    final titleCtrl = TextEditingController();
    final contentCtrl = TextEditingController();
    String selectedType = 'announcement';

    showDialog(
      context: context,
      builder: (ctx) {
        return StatefulBuilder(
          builder: (dialogCtx, setDialogState) {
            return AlertDialog(
              title: const Text('Broadcast Event Circular / Update', style: TextStyle(fontSize: 17, fontWeight: FontWeight.bold)),
              content: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  TextField(
                    controller: titleCtrl,
                    decoration: const InputDecoration(labelText: 'Title / Subject *', isDense: true),
                  ),
                  const SizedBox(height: 10),
                  DropdownButtonFormField<String>(
                    value: selectedType,
                    decoration: const InputDecoration(labelText: 'Update Type', isDense: true),
                    items: const [
                      DropdownMenuItem(value: 'announcement', child: Text('Official Announcement')),
                      DropdownMenuItem(value: 'schedule', child: Text('Schedule Revision')),
                      DropdownMenuItem(value: 'document', child: Text('Rules / Guidelines Document')),
                      DropdownMenuItem(value: 'text', child: Text('General Notice')),
                    ],
                    onChanged: (v) {
                      if (v != null) setDialogState(() => selectedType = v);
                    },
                  ),
                  const SizedBox(height: 10),
                  TextField(
                    controller: contentCtrl,
                    maxLines: 4,
                    decoration: const InputDecoration(labelText: 'Message Body *', isDense: true),
                  ),
                ],
              ),
              actions: [
                TextButton(onPressed: () => Navigator.pop(ctx), child: const Text('Cancel')),
                ElevatedButton(
                  onPressed: () async {
                    if (titleCtrl.text.trim().isEmpty || contentCtrl.text.trim().isEmpty) return;
                    final user = AuthService.instance.currentUser.value;
                    final payload = {
                      'title': titleCtrl.text.trim(),
                      'content': contentCtrl.text.trim(),
                      'type': selectedType,
                      'authorName': user?.displayName ?? 'Event Head',
                      'authorEmail': user?.email ?? '',
                    };

                    final messenger = ScaffoldMessenger.of(context);
                    final nav = Navigator.of(ctx);

                    final ok = await SportsEventsService.instance.publishEventUpdate(_event.id, payload);
                    if (ok) {
                      nav.pop();
                      _refreshEvent();
                      messenger.showSnackBar(
                        const SnackBar(content: Text('✓ Circular broadcasted successfully!'), backgroundColor: AppTheme.successGreen),
                      );
                    }
                  },
                  child: const Text('Broadcast'),
                ),
              ],
            );
          },
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;

    return Scaffold(
      appBar: AppBar(
        title: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text('Event Head Control Desk', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
            Text(_event.title, style: const TextStyle(fontSize: 12, color: Colors.white70), overflow: TextOverflow.ellipsis),
          ],
        ),
        actions: [
          IconButton(icon: const Icon(Icons.refresh), onPressed: _refreshEvent),
        ],
        bottom: TabBar(
          controller: _tabController,
          indicatorColor: AppTheme.accentSky,
          indicatorWeight: 3,
          labelStyle: const TextStyle(fontWeight: FontWeight.bold, fontSize: 12),
          tabs: const [
            Tab(icon: Icon(Icons.dashboard_outlined, size: 18), text: 'Overview'),
            Tab(icon: Icon(Icons.groups, size: 18), text: 'Team'),
            Tab(icon: Icon(Icons.campaign, size: 18), text: 'Updates'),
            Tab(icon: Icon(Icons.people_alt, size: 18), text: 'Participants'),
          ],
        ),
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : TabBarView(
              controller: _tabController,
              children: [
                // 1. Overview Tab
                ListView(
                  padding: const EdgeInsets.all(16),
                  children: [
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
                                Chip(
                                  label: Text(_event.categoryName, style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold)),
                                  backgroundColor: AppTheme.primaryBlue.withValues(alpha: 0.1),
                                ),
                                Chip(
                                  label: Text(_event.status.toUpperCase(), style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Colors.white)),
                                  backgroundColor: _event.status == 'published' ? AppTheme.successGreen : AppTheme.accentSky,
                                ),
                              ],
                            ),
                            const SizedBox(height: 10),
                            Text(_event.title, style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                            const SizedBox(height: 6),
                            Text(_event.description, style: TextStyle(fontSize: 13, color: isDark ? Colors.white70 : AppTheme.textSecondary)),
                            const Divider(height: 24),
                            Row(
                              children: [
                                const Icon(Icons.place, size: 16, color: AppTheme.accentSky),
                                const SizedBox(width: 6),
                                Expanded(child: Text(_event.venue, style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w600))),
                              ],
                            ),
                            const SizedBox(height: 8),
                            Row(
                              children: [
                                const Icon(Icons.calendar_month, size: 16, color: AppTheme.accentSky),
                                const SizedBox(width: 6),
                                Expanded(child: Text('Date: ${_event.startDate} (${_event.startTime})', style: const TextStyle(fontSize: 13))),
                              ],
                            ),
                          ],
                        ),
                      ),
                    ),
                    const SizedBox(height: 16),
                    Row(
                      children: [
                        Expanded(
                          child: Container(
                            padding: const EdgeInsets.all(16),
                            decoration: BoxDecoration(
                              color: AppTheme.primaryNavy.withValues(alpha: 0.08),
                              borderRadius: BorderRadius.circular(12),
                            ),
                            child: Column(
                              children: [
                                Text('${_event.registeredCount}', style: const TextStyle(fontSize: 24, fontWeight: FontWeight.bold, color: AppTheme.primaryNavy)),
                                const SizedBox(height: 4),
                                const Text('Total RSVPs', style: TextStyle(fontSize: 12, fontWeight: FontWeight.w600)),
                              ],
                            ),
                          ),
                        ),
                        const SizedBox(width: 12),
                        Expanded(
                          child: Container(
                            padding: const EdgeInsets.all(16),
                            decoration: BoxDecoration(
                              color: AppTheme.successGreen.withValues(alpha: 0.08),
                              borderRadius: BorderRadius.circular(12),
                            ),
                            child: Column(
                              children: [
                                Text('${_event.members.length}', style: const TextStyle(fontSize: 24, fontWeight: FontWeight.bold, color: AppTheme.successGreen)),
                                const SizedBox(height: 4),
                                const Text('Committee Members', style: TextStyle(fontSize: 12, fontWeight: FontWeight.w600)),
                              ],
                            ),
                          ),
                        ),
                      ],
                    ),
                  ],
                ),

                // 2. Management Committee Tab
                ListView(
                  padding: const EdgeInsets.all(16),
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        const Text('Committee Members', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
                        ElevatedButton.icon(
                          onPressed: _showAddMemberDialog,
                          icon: const Icon(Icons.person_add, size: 16),
                          label: const Text('Add Member'),
                          style: ElevatedButton.styleFrom(
                            backgroundColor: AppTheme.primaryNavy,
                            foregroundColor: Colors.white,
                            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 12),
                    if (_event.members.isEmpty)
                      const Padding(
                        padding: EdgeInsets.all(32),
                        child: Text('No coordinators added yet. Tap "Add Member" to assign co-heads and technical managers.', textAlign: TextAlign.center, style: TextStyle(color: Colors.grey)),
                      )
                    else
                      ..._event.members.map((m) {
                        return Card(
                          margin: const EdgeInsets.only(bottom: 10),
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                          child: ListTile(
                            leading: CircleAvatar(
                              backgroundColor: AppTheme.primaryBlue.withValues(alpha: 0.15),
                              child: Text(m.name.isNotEmpty ? m.name[0].toUpperCase() : 'M', style: const TextStyle(fontWeight: FontWeight.bold, color: AppTheme.primaryBlue)),
                            ),
                            title: Text(m.name, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
                            subtitle: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text('${m.role} • Reg: ${m.regNo}', style: const TextStyle(fontSize: 12)),
                                if (m.responsibilities.isNotEmpty) Text('Duty: ${m.responsibilities}', style: const TextStyle(fontSize: 11, fontStyle: FontStyle.italic)),
                              ],
                            ),
                            trailing: Chip(
                              label: Text(m.role, style: const TextStyle(fontSize: 10)),
                              backgroundColor: Colors.grey.withValues(alpha: 0.1),
                            ),
                          ),
                        );
                      }),
                  ],
                ),

                // 3. Live Circulars / Updates Tab
                ListView(
                  padding: const EdgeInsets.all(16),
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        const Text('Broadcast Circulars', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
                        ElevatedButton.icon(
                          onPressed: _showPublishUpdateDialog,
                          icon: const Icon(Icons.add_alert, size: 16),
                          label: const Text('New Notice'),
                          style: ElevatedButton.styleFrom(
                            backgroundColor: AppTheme.accentSky,
                            foregroundColor: Colors.white,
                            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 12),
                    if (_event.updates.isEmpty)
                      const Padding(
                        padding: EdgeInsets.all(32),
                        child: Text('No announcements published yet. Tap "New Notice" to send schedule changes or instructions to all participants.', textAlign: TextAlign.center, style: TextStyle(color: Colors.grey)),
                      )
                    else
                      ..._event.updates.map((u) {
                        return Card(
                          margin: const EdgeInsets.only(bottom: 12),
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                          child: Padding(
                            padding: const EdgeInsets.all(14),
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Row(
                                  children: [
                                    Container(
                                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                                      decoration: BoxDecoration(color: AppTheme.primaryBlue.withValues(alpha: 0.1), borderRadius: BorderRadius.circular(4)),
                                      child: Text(u.updateType.toUpperCase(), style: const TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: AppTheme.primaryBlue)),
                                    ),
                                    const Spacer(),
                                    Text(u.createdAt, style: const TextStyle(fontSize: 11, color: Colors.grey)),
                                  ],
                                ),
                                const SizedBox(height: 8),
                                Text(u.title, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 15)),
                                const SizedBox(height: 4),
                                Text(u.content, style: TextStyle(fontSize: 13, color: isDark ? Colors.white70 : AppTheme.textSecondary)),
                                const SizedBox(height: 8),
                                Text('By: ${u.authorName} (${u.authorRole})', style: const TextStyle(fontSize: 11, fontStyle: FontStyle.italic, color: Colors.grey)),
                              ],
                            ),
                          ),
                        );
                      }),
                  ],
                ),

                // 4. Participants Tab
                ListView(
                  padding: const EdgeInsets.all(16),
                  children: [
                    Text('Registered Participants (${_event.registeredCount})', style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
                    const SizedBox(height: 12),
                    if (_event.registeredCount == 0)
                      const Padding(
                        padding: EdgeInsets.all(32),
                        child: Text('No student registrations yet. Registrations will appear in real-time as students RSVP.', textAlign: TextAlign.center, style: TextStyle(color: Colors.grey)),
                      )
                    else
                      Container(
                        padding: const EdgeInsets.all(16),
                        decoration: BoxDecoration(
                          color: isDark ? const Color(0xFF1E293B) : Colors.white,
                          borderRadius: BorderRadius.circular(12),
                          border: Border.all(color: Colors.grey.withValues(alpha: 0.2)),
                        ),
                        child: Column(
                          children: [
                            const Row(
                              children: [
                                Icon(Icons.verified, size: 18, color: AppTheme.successGreen),
                                SizedBox(width: 8),
                                Text('Verified GEC Sheikhpura Students', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
                              ],
                            ),
                            const Divider(height: 20),
                            Text('${_event.registeredCount} students have confirmed attendance for this event.', style: const TextStyle(fontSize: 13)),
                          ],
                        ),
                      ),
                  ],
                ),
              ],
            ),
    );
  }
}
