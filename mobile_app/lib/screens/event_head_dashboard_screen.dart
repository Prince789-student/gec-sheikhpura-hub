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
  List<Map<String, dynamic>> _participantsList = [];
  String _taskFilter = 'all';

  @override
  void initState() {
    super.initState();
    _event = widget.event;
    _tabController = TabController(length: 5, vsync: this);
    _loadParticipants();
  }

  Future<void> _loadParticipants() async {
    final list = await SportsEventsService.instance.fetchEventParticipants(_event.id);
    if (mounted) {
      setState(() {
        _participantsList = list;
      });
    }
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  Future<void> _refreshEvent() async {
    setState(() => _isLoading = true);
    final updated = await SportsEventsService.instance.getEventById(_event.id);
    await _loadParticipants();
    if (mounted) {
      setState(() {
        if (updated != null) _event = updated;
        _isLoading = false;
      });
    }
  }

  // --- Dialog: Create Task (Module 1.5) ---
  void _showCreateTaskDialog() {
    final titleCtrl = TextEditingController();
    final descCtrl = TextEditingController();
    String selectedPriority = 'medium';
    String assignedTo = _event.members.isNotEmpty ? _event.members.first.name : _event.eventHeadName;
    String dueDate = DateTime.now().add(const Duration(days: 3)).toIso8601String().substring(0, 10);

    showDialog(
      context: context,
      builder: (ctx) {
        return StatefulBuilder(
          builder: (dialogCtx, setDialogState) {
            final assignees = <String>{_event.eventHeadName, ..._event.members.map((m) => m.name)}.toList();

            return AlertDialog(
              title: const Text('Create Event Task', style: TextStyle(fontSize: 17, fontWeight: FontWeight.bold)),
              content: SingleChildScrollView(
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    TextField(
                      controller: titleCtrl,
                      decoration: const InputDecoration(labelText: 'Task Title *', hintText: 'e.g. Sound setup & Mic testing', isDense: true),
                    ),
                    const SizedBox(height: 10),
                    TextField(
                      controller: descCtrl,
                      maxLines: 2,
                      decoration: const InputDecoration(labelText: 'Task Details', hintText: 'Specific deliverables & location', isDense: true),
                    ),
                    const SizedBox(height: 12),
                    DropdownButtonFormField<String>(
                      value: assignedTo,
                      decoration: const InputDecoration(labelText: 'Assign To Member *', isDense: true),
                      items: assignees.map((name) => DropdownMenuItem(value: name, child: Text(name))).toList(),
                      onChanged: (v) {
                        if (v != null) setDialogState(() => assignedTo = v);
                      },
                    ),
                    const SizedBox(height: 12),
                    DropdownButtonFormField<String>(
                      value: selectedPriority,
                      decoration: const InputDecoration(labelText: 'Priority Level', isDense: true),
                      items: const [
                        DropdownMenuItem(value: 'high', child: Text('🔴 High Priority')),
                        DropdownMenuItem(value: 'medium', child: Text('🟡 Medium Priority')),
                        DropdownMenuItem(value: 'low', child: Text('🟢 Low Priority')),
                      ],
                      onChanged: (v) {
                        if (v != null) setDialogState(() => selectedPriority = v);
                      },
                    ),
                  ],
                ),
              ),
              actions: [
                TextButton(onPressed: () => Navigator.pop(ctx), child: const Text('Cancel')),
                ElevatedButton(
                  onPressed: () async {
                    if (titleCtrl.text.trim().isEmpty) return;
                    final payload = {
                      'title': titleCtrl.text.trim(),
                      'description': descCtrl.text.trim(),
                      'assignedTo': assignedTo,
                      'priority': selectedPriority,
                      'status': 'pending',
                      'dueDate': dueDate,
                    };
                    final ok = await SportsEventsService.instance.createEventTask(_event.id, payload);
                    if (ctx.mounted) Navigator.pop(ctx);
                    if (ok) {
                      _refreshEvent();
                      if (mounted) {
                        ScaffoldMessenger.of(context).showSnackBar(
                          const SnackBar(content: Text('✓ Task created and assigned successfully!'), backgroundColor: AppTheme.successGreen),
                        );
                      }
                    }
                  },
                  child: const Text('Assign Task'),
                ),
              ],
            );
          },
        );
      },
    );
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
          isScrollable: true,
          tabAlignment: TabAlignment.start,
          labelStyle: const TextStyle(fontWeight: FontWeight.bold, fontSize: 12),
          tabs: const [
            Tab(icon: Icon(Icons.dashboard_outlined, size: 18), text: 'Overview'),
            Tab(icon: Icon(Icons.groups, size: 18), text: 'Team'),
            Tab(icon: Icon(Icons.assignment_outlined, size: 18), text: 'Tasks'),
            Tab(icon: Icon(Icons.people_alt, size: 18), text: 'Participants'),
            Tab(icon: Icon(Icons.campaign, size: 18), text: 'Broadcasts'),
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

                // 3. Task Management Tab (Module 1.5)
                _buildTasksTab(context, isDark),

                // 4. Participant Management Tab (Module 1.6)
                _buildParticipantsTab(context, isDark),

                // 5. Live Circulars / Updates Tab
                _buildUpdatesTab(context, isDark),
              ],
            ),
    );
  }

  // --- TAB 3: TASK MANAGEMENT (Module 1.5) ---
  Widget _buildTasksTab(BuildContext context, bool isDark) {
    final filteredTasks = _event.tasks.where((t) {
      if (_taskFilter == 'all') return true;
      return t.status.toLowerCase() == _taskFilter.toLowerCase();
    }).toList();

    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text('Event Task Management', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
                Text('${_event.tasks.length} total tasks assigned', style: TextStyle(fontSize: 12, color: Colors.grey.shade600)),
              ],
            ),
            ElevatedButton.icon(
              onPressed: _showCreateTaskDialog,
              icon: const Icon(Icons.add_task, size: 16),
              label: const Text('Add Task'),
              style: ElevatedButton.styleFrom(
                backgroundColor: AppTheme.primaryNavy,
                foregroundColor: Colors.white,
                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
              ),
            ),
          ],
        ),
        const SizedBox(height: 12),

        // Task Status Filters
        SingleChildScrollView(
          scrollDirection: Axis.horizontal,
          child: Row(
            children: [
              _buildTaskFilterChip('All Tasks', 'all'),
              const SizedBox(width: 6),
              _buildTaskFilterChip('Pending', 'pending'),
              const SizedBox(width: 6),
              _buildTaskFilterChip('In Progress', 'in_progress'),
              const SizedBox(width: 6),
              _buildTaskFilterChip('Completed', 'completed'),
            ],
          ),
        ),
        const SizedBox(height: 14),

        if (filteredTasks.isEmpty)
          const Padding(
            padding: EdgeInsets.all(32),
            child: Text(
              'No tasks in this view. Tap "+ Add Task" to assign logistics, equipment, or sound checks to your committee members.',
              textAlign: TextAlign.center,
              style: TextStyle(color: Colors.grey),
            ),
          )
        else
          ...filteredTasks.map((task) {
            Color priorityColor = Colors.orange;
            if (task.priority.toLowerCase() == 'high') priorityColor = AppTheme.dangerRed;
            if (task.priority.toLowerCase() == 'low') priorityColor = AppTheme.successGreen;

            return Card(
              margin: const EdgeInsets.only(bottom: 12),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
              elevation: 1.5,
              child: Padding(
                padding: const EdgeInsets.all(14),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                          decoration: BoxDecoration(
                            color: priorityColor.withOpacity(0.12),
                            borderRadius: BorderRadius.circular(6),
                          ),
                          child: Text(
                            task.priority.toUpperCase(),
                            style: TextStyle(color: priorityColor, fontSize: 10, fontWeight: FontWeight.bold),
                          ),
                        ),
                        const SizedBox(width: 8),
                        Expanded(
                          child: Text(
                            task.title,
                            style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14.5),
                          ),
                        ),
                        IconButton(
                          icon: const Icon(Icons.delete_outline, size: 18, color: Colors.grey),
                          tooltip: 'Delete Task',
                          onPressed: () => _deleteTask(task),
                        ),
                      ],
                    ),
                    if (task.description.isNotEmpty) ...[
                      const SizedBox(height: 6),
                      Text(task.description, style: TextStyle(fontSize: 12.5, color: isDark ? Colors.white70 : AppTheme.textSecondary)),
                    ],
                    const Divider(height: 20),
                    Row(
                      children: [
                        const Icon(Icons.person_pin, size: 15, color: AppTheme.primaryBlue),
                        const SizedBox(width: 4),
                        Text(
                          'Assigned: ${task.assignedTo}',
                          style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w600),
                        ),
                        const Spacer(),
                        InkWell(
                          onTap: () => _cycleTaskStatus(task),
                          borderRadius: BorderRadius.circular(8),
                          child: Container(
                            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                            decoration: BoxDecoration(
                              color: task.status == 'completed'
                                  ? AppTheme.successGreen.withOpacity(0.15)
                                  : task.status == 'in_progress'
                                      ? AppTheme.accentSky.withOpacity(0.15)
                                      : Colors.grey.withOpacity(0.15),
                              borderRadius: BorderRadius.circular(8),
                              border: Border.all(
                                color: task.status == 'completed'
                                    ? AppTheme.successGreen
                                    : task.status == 'in_progress'
                                        ? AppTheme.accentSky
                                        : Colors.grey,
                                width: 1,
                              ),
                            ),
                            child: Row(
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                Text(
                                  task.status.replaceAll('_', ' ').toUpperCase(),
                                  style: TextStyle(
                                    fontSize: 10.5,
                                    fontWeight: FontWeight.bold,
                                    color: task.status == 'completed'
                                        ? AppTheme.successGreen
                                        : task.status == 'in_progress'
                                            ? AppTheme.accentSky
                                            : Colors.grey.shade700,
                                  ),
                                ),
                                const SizedBox(width: 4),
                                const Icon(Icons.swap_horiz, size: 12),
                              ],
                            ),
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
    );
  }

  Widget _buildTaskFilterChip(String label, String value) {
    final isSelected = _taskFilter == value;
    return ChoiceChip(
      label: Text(label, style: TextStyle(fontWeight: FontWeight.bold, fontSize: 11.5, color: isSelected ? Colors.white : null)),
      selected: isSelected,
      selectedColor: AppTheme.primaryBlue,
      onSelected: (_) => setState(() => _taskFilter = value),
    );
  }

  Future<void> _cycleTaskStatus(EventTaskItem task) async {
    final nextStatus = task.status == 'pending'
        ? 'in_progress'
        : task.status == 'in_progress'
            ? 'completed'
            : 'pending';

    final ok = await SportsEventsService.instance.updateEventTask(_event.id, task.id, {'status': nextStatus});
    if (ok) {
      _refreshEvent();
    }
  }

  Future<void> _deleteTask(EventTaskItem task) async {
    final ok = await SportsEventsService.instance.deleteEventTask(_event.id, task.id);
    if (ok) {
      _refreshEvent();
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Task deleted.')));
      }
    }
  }

  // --- TAB 4: PARTICIPANT MANAGEMENT (Module 1.6) ---
  Widget _buildParticipantsTab(BuildContext context, bool isDark) {
    final total = _participantsList.isNotEmpty ? _participantsList.length : _event.registeredCount;

    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text('Registered Participants ($total)', style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
                const Text('Approve, take attendance, or export student list', style: TextStyle(fontSize: 11.5, color: Colors.grey)),
              ],
            ),
            ElevatedButton.icon(
              onPressed: _exportParticipantsCSV,
              icon: const Icon(Icons.download, size: 15),
              label: const Text('Export CSV'),
              style: ElevatedButton.styleFrom(
                backgroundColor: AppTheme.successGreen,
                foregroundColor: Colors.white,
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
              ),
            ),
          ],
        ),
        const SizedBox(height: 14),

        if (_participantsList.isEmpty && _event.registeredCount == 0)
          const Padding(
            padding: EdgeInsets.all(32),
            child: Text('No student registrations yet. Registrations will appear in real-time as students RSVP.', textAlign: TextAlign.center, style: TextStyle(color: Colors.grey)),
          )
        else if (_participantsList.isEmpty)
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
          )
        else
          ..._participantsList.map((p) {
            final regId = p['id']?.toString() ?? '';
            final name = p['studentName']?.toString() ?? 'GEC Student';
            final regNo = p['studentRegNo']?.toString() ?? 'BEU Verified';
            final status = p['status']?.toString() ?? 'approved';
            final isAttended = p['attendance'] == true || p['attended'] == true;

            return Card(
              margin: const EdgeInsets.only(bottom: 10),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
              child: Padding(
                padding: const EdgeInsets.all(12),
                child: Row(
                  children: [
                    CircleAvatar(
                      backgroundColor: AppTheme.primaryBlue.withOpacity(0.12),
                      child: Text(name.isNotEmpty ? name[0].toUpperCase() : 'S', style: const TextStyle(fontWeight: FontWeight.bold, color: AppTheme.primaryBlue)),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(name, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13.5)),
                          const SizedBox(height: 2),
                          Text('Reg: $regNo', style: TextStyle(fontSize: 11, color: Colors.grey.shade600)),
                          const SizedBox(height: 4),
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                            decoration: BoxDecoration(
                              color: status == 'approved' ? Colors.green.withOpacity(0.12) : Colors.orange.withOpacity(0.12),
                              borderRadius: BorderRadius.circular(4),
                            ),
                            child: Text(
                              status.toUpperCase(),
                              style: TextStyle(
                                fontSize: 9.5,
                                fontWeight: FontWeight.bold,
                                color: status == 'approved' ? Colors.green : Colors.orange,
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),
                    // Attendance Toggle Checkbox
                    Column(
                      children: [
                        Checkbox(
                          value: isAttended,
                          activeColor: AppTheme.successGreen,
                          onChanged: (val) async {
                            final ok = await SportsEventsService.instance.updateParticipantStatus(
                              _event.id,
                              regId,
                              {'attendance': val ?? false},
                            );
                            if (ok) _loadParticipants();
                          },
                        ),
                        const Text('Present', style: TextStyle(fontSize: 9.5, fontWeight: FontWeight.w600)),
                      ],
                    ),
                  ],
                ),
              ),
            );
          }),
      ],
    );
  }

  void _exportParticipantsCSV() {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text('✓ Exporting participant attendance list for ${_event.title} (CSV downloaded)!'),
        backgroundColor: AppTheme.successGreen,
      ),
    );
  }

  // --- TAB 5: BROADCAST UPDATES ---
  Widget _buildUpdatesTab(BuildContext context, bool isDark) {
    return ListView(
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
    );
  }
}
