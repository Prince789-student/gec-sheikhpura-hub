import 'package:flutter/material.dart';
import '../services/data_service.dart';
import '../theme/app_theme.dart';

class SubmitListingScreen extends StatefulWidget {
  const SubmitListingScreen({super.key});

  @override
  State<SubmitListingScreen> createState() => _SubmitListingScreenState();
}

class _SubmitListingScreenState extends State<SubmitListingScreen> {
  final _formKey = GlobalKey<FormState>();
  String _selectedType = 'Room / PG Rental';
  final _titleController = TextEditingController();
  final _nameController = TextEditingController();
  final _phoneController = TextEditingController();
  final _addressController = TextEditingController();
  final _priceController = TextEditingController();
  final _detailsController = TextEditingController();

  bool _isSubmitting = false;
  String? _referenceId;

  final List<String> _types = [
    'Room / PG Rental',
    'Food & Tiffin Service',
    'Local Shop / Laundry',
    'Lost & Found Item',
  ];

  @override
  void dispose() {
    _titleController.dispose();
    _nameController.dispose();
    _phoneController.dispose();
    _addressController.dispose();
    _priceController.dispose();
    _detailsController.dispose();
    super.dispose();
  }

  Future<void> _submitListing() async {
    if (!_formKey.currentState!.validate()) return;
    setState(() => _isSubmitting = true);

    final refId = await DataService.instance.submitListing(
      listingType: _selectedType,
      title: _titleController.text.trim(),
      contactName: _nameController.text.trim(),
      contactPhone: _phoneController.text.trim(),
      address: _addressController.text.trim(),
      details: _detailsController.text.trim(),
      priceOrReward: _priceController.text.trim(),
    );

    setState(() {
      _isSubmitting = false;
      _referenceId = refId;
    });
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;

    return Scaffold(
      appBar: AppBar(
        title: const Text('Submit Listing / Item'),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: _referenceId != null
            ? _buildSuccessView(context, isDark)
            : _buildForm(context, isDark, theme),
      ),
    );
  }

  Widget _buildForm(BuildContext context, bool isDark, ThemeData theme) {
    return Form(
      key: _formKey,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Anti-Fraud Banner
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: isDark ? const Color(0xFF1E293B) : const Color(0xFFF1F5F9),
              borderRadius: BorderRadius.circular(10),
              border: Border.all(color: theme.dividerColor),
            ),
            child: Row(
              children: [
                const Icon(Icons.verified_user_outlined, size: 20, color: AppTheme.accentSky),
                const SizedBox(width: 8),
                Expanded(
                  child: Text(
                    'Free listing for Bajidpur property owners, student clubs, and local shops. All submissions are moderated for student safety.',
                    style: TextStyle(
                      fontSize: 11,
                      color: isDark ? const Color(0xFF94A3B8) : const Color(0xFF64748B),
                      height: 1.4,
                    ),
                  ),
                ),
              ],
            ),
          ),

          const SizedBox(height: 16),

          Text('Listing Category *', style: _labelStyle(isDark)),
          const SizedBox(height: 6),
          DropdownButtonFormField<String>(
            initialValue: _selectedType,
            decoration: _inputDecoration('', theme, isDark),
            items: _types.map((t) => DropdownMenuItem(value: t, child: Text(t, style: const TextStyle(fontSize: 12.5)))).toList(),
            onChanged: (val) {
              if (val != null) setState(() => _selectedType = val);
            },
          ),

          const SizedBox(height: 14),

          Text('Listing Title *', style: _labelStyle(isDark)),
          const SizedBox(height: 6),
          TextFormField(
            controller: _titleController,
            decoration: _inputDecoration('e.g. 2-Room Set in Bajidpur or Found Scientific Calculator', theme, isDark),
            validator: (v) => v == null || v.trim().isEmpty ? 'Required' : null,
          ),

          const SizedBox(height: 14),

          Row(
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text('Contact Person *', style: _labelStyle(isDark)),
                    const SizedBox(height: 6),
                    TextFormField(
                      controller: _nameController,
                      decoration: _inputDecoration('e.g. Ramesh Kumar', theme, isDark),
                      validator: (v) => v == null || v.trim().isEmpty ? 'Required' : null,
                    ),
                  ],
                ),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text('Phone Number *', style: _labelStyle(isDark)),
                    const SizedBox(height: 6),
                    TextFormField(
                      controller: _phoneController,
                      keyboardType: TextInputType.phone,
                      decoration: _inputDecoration('e.g. 06341-224401', theme, isDark),
                      validator: (v) => v == null || v.trim().isEmpty ? 'Required' : null,
                    ),
                  ],
                ),
              ),
            ],
          ),

          const SizedBox(height: 14),

          Text('Location / Campus Landmark *', style: _labelStyle(isDark)),
          const SizedBox(height: 6),
          TextFormField(
            controller: _addressController,
            decoration: _inputDecoration('e.g. Bajidpur Main Road, 300m from College Gate', theme, isDark),
            validator: (v) => v == null || v.trim().isEmpty ? 'Required' : null,
          ),

          const SizedBox(height: 14),

          Text('Price / Monthly Rent (or N/A)', style: _labelStyle(isDark)),
          const SizedBox(height: 6),
          TextFormField(
            controller: _priceController,
            decoration: _inputDecoration('e.g. ₹2,200/month or Free', theme, isDark),
          ),

          const SizedBox(height: 14),

          Text('Description & Amenities *', style: _labelStyle(isDark)),
          const SizedBox(height: 6),
          TextFormField(
            controller: _detailsController,
            maxLines: 4,
            decoration: _inputDecoration('Include facilities: Wi-Fi, Water, Attached Washroom, Meal timings...', theme, isDark),
            validator: (v) => v == null || v.trim().length < 10 ? 'Please enter detailed information' : null,
          ),

          const SizedBox(height: 20),

          SizedBox(
            width: double.infinity,
            child: ElevatedButton(
              onPressed: _isSubmitting ? null : _submitListing,
              style: ElevatedButton.styleFrom(
                backgroundColor: AppTheme.primaryBlue,
                foregroundColor: Colors.white,
                padding: const EdgeInsets.symmetric(vertical: 14),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
              ),
              child: _isSubmitting
                  ? const CircularProgressIndicator(color: Colors.white)
                  : const Text('Submit Listing for Review', style: TextStyle(fontSize: 13.5, fontWeight: FontWeight.w700)),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSuccessView(BuildContext context, bool isDark) {
    return Column(
      children: [
        const SizedBox(height: 30),
        const Icon(Icons.check_circle, color: AppTheme.successGreen, size: 64),
        const SizedBox(height: 16),
        Text(
          'Listing Submitted Successfully!',
          style: TextStyle(
            fontSize: 18,
            fontWeight: FontWeight.w800,
            color: isDark ? Colors.white : AppTheme.primaryNavy,
          ),
        ),
        const SizedBox(height: 8),
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 6),
          decoration: BoxDecoration(
            color: AppTheme.accentSky.withValues(alpha: 0.15),
            borderRadius: BorderRadius.circular(6),
          ),
          child: Text(
            'Reference: $_referenceId',
            style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w700, color: AppTheme.accentSky, fontFamily: 'monospace'),
          ),
        ),
        const SizedBox(height: 16),
        Text(
          'Your listing has been submitted to the moderation queue. Verified student moderators will inspect the contact telephone number and publish it to the student directory.',
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
          child: const Text('Back to Home'),
        ),
      ],
    );
  }

  TextStyle _labelStyle(bool isDark) {
    return TextStyle(
      fontSize: 12.5,
      fontWeight: FontWeight.w600,
      color: isDark ? Colors.white : AppTheme.primaryNavy,
    );
  }

  InputDecoration _inputDecoration(String hint, ThemeData theme, bool isDark) {
    return InputDecoration(
      hintText: hint,
      hintStyle: TextStyle(fontSize: 11.5, color: isDark ? const Color(0xFF64748B) : const Color(0xFF94A3B8)),
      filled: true,
      fillColor: isDark ? const Color(0xFF1E293B) : Colors.white,
      contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
      border: OutlineInputBorder(borderRadius: BorderRadius.circular(8)),
    );
  }
}

