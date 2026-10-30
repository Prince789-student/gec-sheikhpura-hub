import 'package:flutter/material.dart';
import '../services/data_service.dart';
import '../theme/app_theme.dart';

class GrievanceFormScreen extends StatefulWidget {
  const GrievanceFormScreen({super.key});

  @override
  State<GrievanceFormScreen> createState() => _GrievanceFormScreenState();
}

class _GrievanceFormScreenState extends State<GrievanceFormScreen> {
  final _formKey = GlobalKey<FormState>();
  final _nameController = TextEditingController();
  final _emailController = TextEditingController();
  final _descriptionController = TextEditingController();
  String _selectedCategory = 'Room / PG Rental Fraud or Scam';
  bool _agreedToTerms = false;
  bool _isSubmitting = false;
  String? _generatedTicketId;

  final List<String> _categories = [
    'Room / PG Rental Fraud or Scam',
    'Anti-Ragging / Harassment Incident',
    'Unauthorized Phone / Data Disclosure',
    'Copyright / IP Infringement',
    'Food / Tiffin Vendor Dispute',
    'Delay in Data Deletion Request',
    'Other Platform Grievance',
  ];

  @override
  void dispose() {
    _nameController.dispose();
    _emailController.dispose();
    _descriptionController.dispose();
    super.dispose();
  }

  Future<void> _submitGrievance() async {
    if (!_formKey.currentState!.validate()) return;
    if (!_agreedToTerms) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Please certify that your statements are true to submit.'),
          behavior: SnackBarBehavior.floating,
        ),
      );
      return;
    }

    setState(() => _isSubmitting = true);

    final ticketId = await DataService.instance.submitGrievanceTicket(
      name: _nameController.text.trim(),
      email: _emailController.text.trim(),
      category: _selectedCategory,
      description: _descriptionController.text.trim(),
    );

    setState(() {
      _isSubmitting = false;
      _generatedTicketId = ticketId;
    });
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;

    return Scaffold(
      appBar: AppBar(
        title: const Text('File a Grievance'),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: _generatedTicketId != null
            ? _buildSuccessView(context, isDark)
            : _buildFormView(context, isDark, theme),
      ),
    );
  }

  Widget _buildFormView(BuildContext context, bool isDark, ThemeData theme) {
    return Form(
      key: _formKey,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Grievance Officer details card
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
                const Row(
                  children: [
                    Icon(Icons.gavel, color: AppTheme.accentSky, size: 20),
                    SizedBox(width: 8),
                    Text(
                      'Statutory Grievance Redressal',
                      style: TextStyle(fontSize: 13.5, fontWeight: FontWeight.w700),
                    ),
                  ],
                ),
                const SizedBox(height: 6),
                Text(
                  'IT Rules, 2021 (Rule 3(2)) Compliance Desk\nOfficer Email: grievance@gecsheikhpura.in\nSLA: 24–48h Acknowledgement • 15-Day Resolution',
                  style: TextStyle(
                    fontSize: 11,
                    color: isDark ? const Color(0xFF94A3B8) : const Color(0xFF64748B),
                    height: 1.4,
                  ),
                ),
              ],
            ),
          ),

          const SizedBox(height: 20),

          Text(
            'Full Name *',
            style: TextStyle(
              fontSize: 12.5,
              fontWeight: FontWeight.w600,
              color: isDark ? Colors.white : AppTheme.primaryNavy,
            ),
          ),
          const SizedBox(height: 6),
          TextFormField(
            controller: _nameController,
            decoration: _inputDecoration('e.g. Rahul Kumar', theme, isDark),
            validator: (val) => val == null || val.trim().isEmpty ? 'Enter your full name' : null,
          ),

          const SizedBox(height: 14),

          Text(
            'Contact Email *',
            style: TextStyle(
              fontSize: 12.5,
              fontWeight: FontWeight.w600,
              color: isDark ? Colors.white : AppTheme.primaryNavy,
            ),
          ),
          const SizedBox(height: 6),
          TextFormField(
            controller: _emailController,
            keyboardType: TextInputType.emailAddress,
            decoration: _inputDecoration('e.g. rahul@example.com', theme, isDark),
            validator: (val) {
              if (val == null || val.trim().isEmpty) return 'Enter your email address';
              if (!val.contains('@')) return 'Enter a valid email address';
              return null;
            },
          ),

          const SizedBox(height: 14),

          Text(
            'Grievance Category *',
            style: TextStyle(
              fontSize: 12.5,
              fontWeight: FontWeight.w600,
              color: isDark ? Colors.white : AppTheme.primaryNavy,
            ),
          ),
          const SizedBox(height: 6),
          DropdownButtonFormField<String>(
            initialValue: _selectedCategory,
            isExpanded: true,
            decoration: _inputDecoration('', theme, isDark),
            items: _categories.map((c) {
              return DropdownMenuItem(value: c, child: Text(c, style: const TextStyle(fontSize: 12.5)));
            }).toList(),
            onChanged: (val) {
              if (val != null) setState(() => _selectedCategory = val);
            },
          ),

          const SizedBox(height: 14),

          Text(
            'Description of Incident & Evidence *',
            style: TextStyle(
              fontSize: 12.5,
              fontWeight: FontWeight.w600,
              color: isDark ? Colors.white : AppTheme.primaryNavy,
            ),
          ),
          const SizedBox(height: 6),
          TextFormField(
            controller: _descriptionController,
            maxLines: 4,
            decoration: _inputDecoration('Describe facts, phone numbers, or advance requests...', theme, isDark),
            validator: (val) => val == null || val.trim().length < 10 ? 'Please provide detailed facts' : null,
          ),

          const SizedBox(height: 14),

          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Checkbox(
                value: _agreedToTerms,
                activeColor: AppTheme.accentSky,
                onChanged: (v) => setState(() => _agreedToTerms = v ?? false),
              ),
              Expanded(
                child: Padding(
                  padding: const EdgeInsets.only(top: 10),
                  child: Text(
                    'I certify that statements in this submission are true to the best of my knowledge.',
                    style: TextStyle(
                      fontSize: 11,
                      color: isDark ? const Color(0xFF94A3B8) : const Color(0xFF64748B),
                    ),
                  ),
                ),
              ),
            ],
          ),

          const SizedBox(height: 20),

          SizedBox(
            width: double.infinity,
            child: ElevatedButton(
              onPressed: _isSubmitting ? null : _submitGrievance,
              style: ElevatedButton.styleFrom(
                backgroundColor: AppTheme.primaryBlue,
                foregroundColor: Colors.white,
                padding: const EdgeInsets.symmetric(vertical: 14),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
              ),
              child: _isSubmitting
                  ? const SizedBox(
                      width: 20,
                      height: 20,
                      child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2),
                    )
                  : const Text(
                      'Submit Grievance to Officer',
                      style: TextStyle(fontSize: 14, fontWeight: FontWeight.w700),
                    ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSuccessView(BuildContext context, bool isDark) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.center,
      children: [
        const SizedBox(height: 30),
        const Icon(Icons.check_circle, color: AppTheme.successGreen, size: 64),
        const SizedBox(height: 16),
        Text(
          'Grievance Lodged Successfully',
          style: TextStyle(
            fontSize: 18,
            fontWeight: FontWeight.w800,
            color: isDark ? Colors.white : AppTheme.primaryNavy,
          ),
        ),
        const SizedBox(height: 8),
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
          decoration: BoxDecoration(
            color: AppTheme.accentSky.withValues(alpha: 0.15),
            borderRadius: BorderRadius.circular(8),
          ),
          child: Text(
            'Case Tracking ID: $_generatedTicketId',
            style: const TextStyle(
              fontSize: 14,
              fontWeight: FontWeight.w700,
              color: AppTheme.accentSky,
              fontFamily: 'monospace',
            ),
          ),
        ),
        const SizedBox(height: 16),
        Text(
          'In accordance with Information Technology Rules, 2021:\n• A formal acknowledgement has been generated.\n• The Grievance Officer will review within 24–48 hours.\n• Resolution will be communicated within 15 days.',
          textAlign: TextAlign.center,
          style: TextStyle(
            fontSize: 12,
            color: isDark ? const Color(0xFF94A3B8) : const Color(0xFF64748B),
            height: 1.5,
          ),
        ),
        const SizedBox(height: 24),
        ElevatedButton(
          onPressed: () => Navigator.pop(context),
          style: ElevatedButton.styleFrom(
            backgroundColor: AppTheme.primaryBlue,
            foregroundColor: Colors.white,
            padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
          ),
          child: const Text('Back to Profile & Settings'),
        ),
      ],
    );
  }

  InputDecoration _inputDecoration(String hint, ThemeData theme, bool isDark) {
    return InputDecoration(
      hintText: hint,
      hintStyle: TextStyle(
        fontSize: 12,
        color: isDark ? const Color(0xFF64748B) : const Color(0xFF94A3B8),
      ),
      filled: true,
      fillColor: isDark ? const Color(0xFF1E293B) : Colors.white,
      contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 12),
      border: OutlineInputBorder(
        borderRadius: BorderRadius.circular(8),
        borderSide: BorderSide(color: theme.dividerColor),
      ),
      enabledBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(8),
        borderSide: BorderSide(color: theme.dividerColor),
      ),
    );
  }
}
