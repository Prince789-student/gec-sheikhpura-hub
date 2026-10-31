import 'package:flutter/material.dart';
import '../models/sports_events_models.dart';
import '../services/sports_events_service.dart';
import '../services/auth_service.dart';
import '../theme/app_theme.dart';
import 'event_head_dashboard_screen.dart';

class EventDetailsScreen extends StatefulWidget {
  final StudentEvent event;

  const EventDetailsScreen({super.key, required this.event});

  @override
  State<EventDetailsScreen> createState() => _EventDetailsScreenState();
}

class _EventDetailsScreenState extends State<EventDetailsScreen> {
  late StudentEvent _event;
  bool _isRegistering = false;

  @override
  void initState() {
    super.initState();
    _event = widget.event;
    _refreshEvent();
  }

  Future<void> _refreshEvent() async {
    final updated = await SportsEventsService.instance.getEventById(_event.id);
    if (updated != null && mounted) {
      setState(() => _event = updated);
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;
    final currentUser = AuthService.instance.currentUser.value;
    final isEventHead = currentUser != null &&
        (_event.eventHeadName == currentUser.displayName ||
            _event.contactEmail == currentUser.email ||
            currentUser.email == 'pk3334238@gmail.com');

    return Scaffold(
      appBar: AppBar(
        title: Text(_event.title, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
        actions: [
          if (isEventHead)
            IconButton(
              icon: const Icon(Icons.admin_panel_settings, color: AppTheme.warningAmber),
              tooltip: 'Event Head Control Panel',
              onPressed: () {
                Navigator.push(
                  context,
                  MaterialPageRoute(builder: (_) => EventHeadDashboardScreen(event: _event)),
                ).then((_) => _refreshEvent());
              },
            ),
        ],
      ),
      body: ListView(
        children: [
          // Banner Poster
          if (_event.posterUrl.isNotEmpty)
            Image.network(
              _event.posterUrl,
              height: 200,
              width: double.infinity,
              fit: BoxFit.cover,
              errorBuilder: (_, __, ___) => Container(
                height: 180,
                color: AppTheme.primaryNavy,
                child: const Center(child: Icon(Icons.event, size: 60, color: Colors.white70)),
              ),
            ),

          Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Category & Status Chips
                Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                      decoration: BoxDecoration(color: AppTheme.primaryBlue.withOpacity(0.12), borderRadius: BorderRadius.circular(8)),
                      child: Text(_event.categoryName.toUpperCase(), style: const TextStyle(color: AppTheme.primaryBlue, fontWeight: FontWeight.bold, fontSize: 11)),
                    ),
                    const SizedBox(width: 8),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                      decoration: BoxDecoration(color: Colors.green.withOpacity(0.12), borderRadius: BorderRadius.circular(8)),
                      child: Text(_event.status.toUpperCase(), style: const TextStyle(color: Colors.green, fontWeight: FontWeight.bold, fontSize: 11)),
                    ),
                  ],
                ),
                const SizedBox(height: 12),

                Text(_event.title, style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 20)),
                const SizedBox(height: 8),
                Text(_event.description, style: TextStyle(fontSize: 13.5, height: 1.4, color: Colors.grey.shade700)),
                const SizedBox(height: 16),

                // Schedule & Venue Card
                Card(
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                  color: isDark ? const Color(0xFF1E293B) : const Color(0xFFF8FAFC),
                  child: Padding(
                    padding: const EdgeInsets.all(14),
                    child: Column(
                      children: [
                        _buildDetailRow(Icons.calendar_today, 'Event Dates', '${_event.startDate} to ${_event.endDate}'),
                        const Divider(height: 16),
                        _buildDetailRow(Icons.access_time, 'Timings', '${_event.startTime} - ${_event.endTime} IST'),
                        const Divider(height: 16),
                        _buildDetailRow(Icons.location_on, 'Venue', '${_event.venue} ${_event.venueDetails.isNotEmpty ? "(" + _event.venueDetails + ")" : ""}'),
                        const Divider(height: 16),
                        _buildDetailRow(Icons.person, 'Event Head', '${_event.eventHeadName} (${_event.eventHeadRegNo})'),
                        const Divider(height: 16),
                        _buildDetailRow(Icons.phone, 'Contact Helpline', _event.contactPhone),
                      ],
                    ),
                  ),
                ),
                const SizedBox(height: 20),

                // Event Rules
                if (_event.eventRules.isNotEmpty) ...[
                  const Text('Rules & Regulations', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 15)),
                  const SizedBox(height: 6),
                  Container(
                    width: double.infinity,
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(color: isDark ? const Color(0xFF1E293B) : const Color(0xFFFFFBEB), borderRadius: BorderRadius.circular(10), border: Border.all(color: const Color(0xFFFCD34D))),
                    child: Text(_event.eventRules, style: const TextStyle(fontSize: 12.5)),
                  ),
                  const SizedBox(height: 20),
                ],

                // Management Team Section
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    const Text('Management Committee', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 15)),
                    Text('${_event.members.length} Members', style: const TextStyle(fontSize: 12, color: Colors.grey)),
                  ],
                ),
                const SizedBox(height: 10),
                ..._event.members.map((m) => Card(
                      margin: const EdgeInsets.only(bottom: 8),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                      child: ListTile(
                        leading: CircleAvatar(
                          backgroundColor: AppTheme.primaryBlue.withOpacity(0.15),
                          child: Text(m.name[0], style: const TextStyle(fontWeight: FontWeight.bold, color: AppTheme.primaryBlue)),
                        ),
                        title: Text(m.name, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13.5)),
                        subtitle: Text('${m.role} • ${m.responsibilities}', style: const TextStyle(fontSize: 11.5)),
                        trailing: m.isSensitive
                            ? const Tooltip(message: 'Admin Verified Role', child: Icon(Icons.verified, size: 16, color: Colors.blue))
                            : null,
                      ),
                    )),
                const SizedBox(height: 20),

                // Live Updates Feed
                if (_event.updates.isNotEmpty) ...[
                  const Text('Live Event Updates & Announcements', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 15)),
                  const SizedBox(height: 10),
                  ..._event.updates.map((u) => Card(
                        margin: const EdgeInsets.only(bottom: 10),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                        color: u.isImportant ? const Color(0xFFFEF2F2) : null,
                        child: Padding(
                          padding: const EdgeInsets.all(12),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Row(
                                children: [
                                  if (u.isImportant) const Icon(Icons.campaign, size: 16, color: Colors.red),
                                  if (u.isImportant) const SizedBox(width: 4),
                                  Text(u.title, style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: u.isImportant ? Colors.red.shade900 : null)),
                                  const Spacer(),
                                  Text(u.updateType.toUpperCase(), style: TextStyle(fontSize: 9.5, fontWeight: FontWeight.bold, color: Colors.grey.shade600)),
                                ],
                              ),
                              const SizedBox(height: 6),
                              Text(u.content, style: const TextStyle(fontSize: 12)),
                              const SizedBox(height: 6),
                              Text('By ${u.authorName} (${u.authorRole})', style: TextStyle(fontSize: 10, color: Colors.grey.shade600)),
                            ],
                          ),
                        ),
                      )),
                  const SizedBox(height: 20),
                ],

                // Register Button
                SizedBox(
                  width: double.infinity,
                  height: 48,
                  child: ElevatedButton(
                    style: ElevatedButton.styleFrom(
                      backgroundColor: AppTheme.primaryBlue,
                      foregroundColor: Colors.white,
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                    ),
                    onPressed: _isRegistering ? null : () => _showRegistrationDialog(context),
                    child: _isRegistering
                        ? const CircularProgressIndicator(color: Colors.white)
                        : const Text('Register for Event 🎯', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 15)),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildDetailRow(IconData icon, String label, String value) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Icon(icon, size: 16, color: AppTheme.primaryBlue),
        const SizedBox(width: 8),
        SizedBox(
          width: 110,
          child: Text(label, style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 12, color: Colors.grey)),
        ),
        Expanded(
          child: Text(value, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 12.5)),
        ),
      ],
    );
  }

  void _showRegistrationDialog(BuildContext context) {
    final nameCtrl = TextEditingController(text: AuthService.instance.currentUser.value?.displayName ?? '');
    final regNoCtrl = TextEditingController();
    final deptCtrl = TextEditingController(text: 'CSE');
    final yearCtrl = TextEditingController(text: '3rd Year');
    final phoneCtrl = TextEditingController();

    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Event Registration', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
        content: SingleChildScrollView(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              TextField(controller: nameCtrl, decoration: const InputDecoration(labelText: 'Full Name', border: OutlineInputBorder())),
              const SizedBox(height: 10),
              TextField(controller: regNoCtrl, decoration: const InputDecoration(labelText: 'BEU Registration No.', border: OutlineInputBorder())),
              const SizedBox(height: 10),
              TextField(controller: deptCtrl, decoration: const InputDecoration(labelText: 'Department (CSE/CE/EE/ME)', border: OutlineInputBorder())),
              const SizedBox(height: 10),
              TextField(controller: yearCtrl, decoration: const InputDecoration(labelText: 'Academic Year', border: OutlineInputBorder())),
              const SizedBox(height: 10),
              TextField(controller: phoneCtrl, keyboardType: TextInputType.phone, decoration: const InputDecoration(labelText: 'Phone Number', border: OutlineInputBorder())),
            ],
          ),
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx), child: const Text('Cancel')),
          ElevatedButton(
            style: ElevatedButton.styleFrom(backgroundColor: AppTheme.primaryBlue, foregroundColor: Colors.white),
            onPressed: () async {
              if (nameCtrl.text.isEmpty || regNoCtrl.text.isEmpty) {
                ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Please enter name and reg number.')));
                return;
              }
              Navigator.pop(ctx);
              setState(() => _isRegistering = true);
              final success = await SportsEventsService.instance.registerForEvent(_event.id, {
                'studentName': nameCtrl.text.trim(),
                'regNo': regNoCtrl.text.trim(),
                'department': deptCtrl.text.trim(),
                'academicYear': yearCtrl.text.trim(),
                'phone': phoneCtrl.text.trim(),
                'email': AuthService.instance.currentUser.value?.email ?? 'student@gecsheikhpura.ac.in',
              });
              setState(() => _isRegistering = false);
              if (mounted) {
                ScaffoldMessenger.of(context).showSnackBar(SnackBar(
                  content: Text(success ? '🎉 Registered successfully!' : 'Registration failed or duplicate entry.'),
                  backgroundColor: success ? Colors.green : Colors.red,
                ));
                if (success) _refreshEvent();
              }
            },
            child: const Text('Confirm'),
          ),
        ],
      ),
    );
  }
}

