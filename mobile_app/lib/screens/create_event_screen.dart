import 'package:flutter/material.dart';
import '../services/sports_events_service.dart';
import '../services/auth_service.dart';
import '../theme/app_theme.dart';
import 'event_details_screen.dart';

class CreateEventScreen extends StatefulWidget {
  const CreateEventScreen({super.key});

  @override
  State<CreateEventScreen> createState() => _CreateEventScreenState();
}

class _CreateEventScreenState extends State<CreateEventScreen> {
  final _formKey = GlobalKey<FormState>();

  final _titleCtrl = TextEditingController();
  final _descCtrl = TextEditingController();
  final _venueCtrl = TextEditingController();
  final _rulesCtrl = TextEditingController();
  final _resourcesCtrl = TextEditingController();
  final _contactNameCtrl = TextEditingController();
  final _contactPhoneCtrl = TextEditingController();
  final _posterUrlCtrl = TextEditingController();

  String _selectedCategory = 'Umang (Annual College Fest)';
  DateTime _startDate = DateTime.now().add(const Duration(days: 3));
  TimeOfDay _startTime = const TimeOfDay(hour: 10, minute: 0);
  DateTime _endDate = DateTime.now().add(const Duration(days: 3));
  TimeOfDay _endTime = const TimeOfDay(hour: 17, minute: 0);
  DateTime _regDeadline = DateTime.now().add(const Duration(days: 2));

  bool _isSubmitting = false;
  String? _errorMessage;

  final List<String> _categories = [
    'Umang (Annual College Fest)',
    'Sports & Tournaments',
    'Technical',
    'Cultural',
    'Academic',
    'Workshop',
    'Seminar',
    'Competition',
    'Festival',
    'Other',
  ];

  @override
  void initState() {
    super.initState();
    final user = AuthService.instance.currentUser.value;
    if (user != null) {
      _contactNameCtrl.text = user.displayName;
      if (user.phone.isNotEmpty) {
        _contactPhoneCtrl.text = user.phone;
      }
    }
  }

  @override
  void dispose() {
    _titleCtrl.dispose();
    _descCtrl.dispose();
    _venueCtrl.dispose();
    _rulesCtrl.dispose();
    _resourcesCtrl.dispose();
    _contactNameCtrl.dispose();
    _contactPhoneCtrl.dispose();
    _posterUrlCtrl.dispose();
    super.dispose();
  }

  Future<void> _submitEvent() async {
    if (!_formKey.currentState!.validate()) return;

    final user = AuthService.instance.currentUser.value;
    if (user == null) {
      setState(() => _errorMessage = 'Please sign in with Google to create an event.');
      return;
    }

    setState(() {
      _isSubmitting = true;
      _errorMessage = null;
    });

    final startDateTime = DateTime(
      _startDate.year,
      _startDate.month,
      _startDate.day,
      _startTime.hour,
      _startTime.minute,
    );

    final endDateTime = DateTime(
      _endDate.year,
      _endDate.month,
      _endDate.day,
      _endTime.hour,
      _endTime.minute,
    );

    final payload = {
      'title': _titleCtrl.text.trim(),
      'category': _selectedCategory,
      'description': _descCtrl.text.trim(),
      'venue': _venueCtrl.text.trim(),
      'startDate': startDateTime.toIso8601String(),
      'endDate': endDateTime.toIso8601String(),
      'startTime': '${_startTime.hour.toString().padLeft(2, '0')}:${_startTime.minute.toString().padLeft(2, '0')}',
      'endTime': '${_endTime.hour.toString().padLeft(2, '0')}:${_endTime.minute.toString().padLeft(2, '0')}',
      'registrationDeadline': _regDeadline.toIso8601String(),
      'maxParticipants': 0,
      'rules': _rulesCtrl.text.trim(),
      'requiredResources': _resourcesCtrl.text.trim(),
      'contactName': _contactNameCtrl.text.trim(),
      'contactPhone': _contactPhoneCtrl.text.trim(),
      'posterUrl': _posterUrlCtrl.text.trim().isNotEmpty
          ? _posterUrlCtrl.text.trim()
          : 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&q=80',
      'creatorEmail': user.email,
      'creatorName': user.displayName,
      'creatorRegNo': user.regNo,
    };

    final newEvent = await SportsEventsService.instance.createEvent(payload);

    if (!mounted) return;
    setState(() => _isSubmitting = false);

    if (newEvent != null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('✓ Event created successfully! You are assigned as Event Head.'),
          backgroundColor: AppTheme.successGreen,
        ),
      );
      Navigator.pushReplacement(
        context,
        MaterialPageRoute(builder: (_) => EventDetailsScreen(event: newEvent)),
      );
    } else {
      setState(() => _errorMessage = 'Failed to create event. Please verify details and try again.');
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Create Student Event', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18)),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(18),
        child: Form(
          key: _formKey,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Event Head Role Notice
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: AppTheme.accentSky.withValues(alpha: 0.12),
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: AppTheme.accentSky.withValues(alpha: 0.3)),
                ),
                child: const Row(
                  children: [
                    Icon(Icons.shield, color: AppTheme.primaryBlue, size: 22),
                    SizedBox(width: 10),
                    Expanded(
                      child: Text(
                        'As the event creator, you will be registered as Event Head with full administrative control to add coordinators, manage tasks, and publish official circulars.',
                        style: TextStyle(fontSize: 12, fontWeight: FontWeight.w500),
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 20),

              if (_errorMessage != null)
                Container(
                  padding: const EdgeInsets.all(12),
                  margin: const EdgeInsets.only(bottom: 16),
                  decoration: BoxDecoration(
                    color: AppTheme.dangerRed.withValues(alpha: 0.1),
                    borderRadius: BorderRadius.circular(10),
                    border: Border.all(color: AppTheme.dangerRed),
                  ),
                  child: Text(_errorMessage!, style: const TextStyle(color: AppTheme.dangerRed, fontSize: 13)),
                ),

              // 1. Basic Information
              const Text('Event Details', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
              const SizedBox(height: 12),

              TextFormField(
                controller: _titleCtrl,
                decoration: const InputDecoration(
                  labelText: 'Event Title *',
                  hintText: 'e.g. Intra-College Coding Hackathon 2026',
                  prefixIcon: Icon(Icons.title),
                ),
                validator: (v) => (v == null || v.trim().isEmpty) ? 'Please enter event title' : null,
              ),
              const SizedBox(height: 14),

              DropdownButtonFormField<String>(
                value: _selectedCategory,
                decoration: const InputDecoration(
                  labelText: 'Category *',
                  prefixIcon: Icon(Icons.category),
                ),
                items: _categories.map((c) => DropdownMenuItem(value: c, child: Text(c))).toList(),
                onChanged: (v) {
                  if (v != null) setState(() => _selectedCategory = v);
                },
              ),
              const SizedBox(height: 14),

              TextFormField(
                controller: _descCtrl,
                maxLines: 3,
                decoration: const InputDecoration(
                  labelText: 'Event Description *',
                  hintText: 'Brief summary of the event objective and agenda',
                  prefixIcon: Icon(Icons.description),
                ),
                validator: (v) => (v == null || v.trim().isEmpty) ? 'Please describe the event' : null,
              ),
              const SizedBox(height: 14),

              TextFormField(
                controller: _venueCtrl,
                decoration: const InputDecoration(
                  labelText: 'Venue *',
                  hintText: 'e.g. Main Auditorium / CSE Lab 2 / Sports Ground',
                  prefixIcon: Icon(Icons.place),
                ),
                validator: (v) => (v == null || v.trim().isEmpty) ? 'Please specify the venue' : null,
              ),
              const SizedBox(height: 20),

              // 2. Schedule & Dates
              const Text('Dates & Timings', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
              const SizedBox(height: 12),

              Row(
                children: [
                  Expanded(
                    child: OutlinedButton.icon(
                      icon: const Icon(Icons.calendar_today, size: 16),
                      label: Text('Start: ${_startDate.day}/${_startDate.month}/${_startDate.year}'),
                      onPressed: () async {
                        final picked = await showDatePicker(
                          context: context,
                          initialDate: _startDate,
                          firstDate: DateTime.now(),
                          lastDate: DateTime.now().add(const Duration(days: 365)),
                        );
                        if (picked != null) setState(() => _startDate = picked);
                      },
                    ),
                  ),
                  const SizedBox(width: 10),
                  Expanded(
                    child: OutlinedButton.icon(
                      icon: const Icon(Icons.access_time, size: 16),
                      label: Text('Time: ${_startTime.format(context)}'),
                      onPressed: () async {
                        final picked = await showTimePicker(context: context, initialTime: _startTime);
                        if (picked != null) setState(() => _startTime = picked);
                      },
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 10),

              Row(
                children: [
                  Expanded(
                    child: OutlinedButton.icon(
                      icon: const Icon(Icons.calendar_today, size: 16),
                      label: Text('End: ${_endDate.day}/${_endDate.month}/${_endDate.year}'),
                      onPressed: () async {
                        final picked = await showDatePicker(
                          context: context,
                          initialDate: _endDate,
                          firstDate: _startDate,
                          lastDate: DateTime.now().add(const Duration(days: 365)),
                        );
                        if (picked != null) setState(() => _endDate = picked);
                      },
                    ),
                  ),
                  const SizedBox(width: 10),
                  Expanded(
                    child: OutlinedButton.icon(
                      icon: const Icon(Icons.access_time, size: 16),
                      label: Text('Time: ${_endTime.format(context)}'),
                      onPressed: () async {
                        final picked = await showTimePicker(context: context, initialTime: _endTime);
                        if (picked != null) setState(() => _endTime = picked);
                      },
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 10),

              OutlinedButton.icon(
                icon: const Icon(Icons.hourglass_bottom, size: 16),
                label: Text('Registration Deadline: ${_regDeadline.day}/${_regDeadline.month}/${_regDeadline.year}'),
                onPressed: () async {
                  final picked = await showDatePicker(
                    context: context,
                    initialDate: _regDeadline,
                    firstDate: DateTime.now(),
                    lastDate: _startDate,
                  );
                  if (picked != null) setState(() => _regDeadline = picked);
                },
              ),
              const SizedBox(height: 20),

              // 3. Rules & Logistics
              const Text('Event Rules & Logistics', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
              const SizedBox(height: 12),

              TextFormField(
                controller: _rulesCtrl,
                maxLines: 3,
                decoration: const InputDecoration(
                  labelText: 'Event Rules & Eligibility Guidelines',
                  hintText: 'e.g. 1. Teams of 2-4 members. 2. Bring your own laptops. 3. College ID required.',
                  prefixIcon: Icon(Icons.gavel),
                ),
              ),
              const SizedBox(height: 14),

              TextFormField(
                controller: _resourcesCtrl,
                maxLines: 2,
                decoration: const InputDecoration(
                  labelText: 'Required Resources & Equipment',
                  hintText: 'e.g. Projector, Mic, High-speed Wi-Fi, Power Strips',
                  prefixIcon: Icon(Icons.inventory_2),
                ),
              ),
              const SizedBox(height: 20),

              // 4. Contact & Media
              const Text('Contact & Cover Media', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
              const SizedBox(height: 12),

              Row(
                children: [
                  Expanded(
                    child: TextFormField(
                      controller: _contactNameCtrl,
                      decoration: const InputDecoration(
                        labelText: 'Contact Person *',
                        prefixIcon: Icon(Icons.person),
                      ),
                      validator: (v) => (v == null || v.trim().isEmpty) ? 'Required' : null,
                    ),
                  ),
                  const SizedBox(width: 10),
                  Expanded(
                    child: TextFormField(
                      controller: _contactPhoneCtrl,
                      keyboardType: TextInputType.phone,
                      decoration: const InputDecoration(
                        labelText: 'Mobile Number *',
                        prefixIcon: Icon(Icons.phone),
                      ),
                      validator: (v) => (v == null || v.trim().length < 10) ? 'Enter valid phone' : null,
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 14),

              TextFormField(
                controller: _posterUrlCtrl,
                decoration: const InputDecoration(
                  labelText: 'Poster Image URL (Optional)',
                  hintText: 'https://...',
                  prefixIcon: Icon(Icons.image),
                ),
              ),
              const SizedBox(height: 30),

              // Submit Button
              SizedBox(
                width: double.infinity,
                height: 52,
                child: ElevatedButton(
                  onPressed: _isSubmitting ? null : _submitEvent,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppTheme.primaryBlue,
                    foregroundColor: Colors.white,
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                  ),
                  child: _isSubmitting
                      ? const SizedBox(width: 22, height: 22, child: CircularProgressIndicator(strokeWidth: 2.5, color: Colors.white))
                      : const Row(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Icon(Icons.check_circle_outline),
                            SizedBox(width: 8),
                            Text('Publish & Initialize Event', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
                          ],
                        ),
                ),
              ),
              const SizedBox(height: 24),
            ],
          ),
        ),
      ),
    );
  }
}

