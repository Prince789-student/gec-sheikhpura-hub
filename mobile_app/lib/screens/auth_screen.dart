import 'package:flutter/material.dart';
import '../services/auth_service.dart';
import '../theme/app_theme.dart';

class AuthScreen extends StatefulWidget {
  const AuthScreen({super.key});

  @override
  State<AuthScreen> createState() => _AuthScreenState();
}

class _AuthScreenState extends State<AuthScreen> {
  bool _isLoading = false;
  String? _errorMessage;

  // Google Sign-In & Profile Step State
  bool _showProfileStep = false;

  // Profile Form Controllers (5 Mandatory Fields)
  final _nameCtrl = TextEditingController();
  final _regNoCtrl = TextEditingController();
  final _dobCtrl = TextEditingController();
  final _phoneCtrl = TextEditingController();
  String _selectedBranch = 'Computer Science & Engg (CSE)';

  final List<String> _branches = [
    'Computer Science & Engg (CSE)',
    'Civil Engineering (CE)',
    'Mechanical Engineering (ME)',
    'Electrical Engineering (EE)',
    'Electronics & Communication (ECE)',
  ];

  @override
  void initState() {
    super.initState();
    final user = AuthService.instance.currentUser.value;
    if (user != null) {
      _nameCtrl.text = user.displayName;
      _regNoCtrl.text = user.regNo;
      _dobCtrl.text = user.dob;
      _phoneCtrl.text = user.phone;
      if (_branches.contains(user.branch)) {
        _selectedBranch = user.branch;
      }
    }
  }

  @override
  void dispose() {
    _nameCtrl.dispose();
    _regNoCtrl.dispose();
    _dobCtrl.dispose();
    _phoneCtrl.dispose();
    super.dispose();
  }

  // --- 1. Native Google Sign-In (Opens Device Account Picker on Phone) ---
  Future<void> _handleNativeGoogleSignIn() async {
    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });

    try {
      final googleUser = await AuthService.instance.signInWithNativeGoogle();
      if (googleUser == null) {
        // User closed or dismissed the Google account chooser
        setState(() => _isLoading = false);
        return;
      }

      setState(() {
        _isLoading = false;
      });

      // Pre-fill profile name from Google account
      if (_nameCtrl.text.isEmpty) {
        _nameCtrl.text = googleUser.displayName;
      }
      if (googleUser.regNo.isNotEmpty) _regNoCtrl.text = googleUser.regNo;
      if (googleUser.dob.isNotEmpty) _dobCtrl.text = googleUser.dob;
      if (googleUser.phone.isNotEmpty) _phoneCtrl.text = googleUser.phone;

      // If user already has registration and phone saved in local storage, login immediately
      if (googleUser.isAdmin || (googleUser.regNo.isNotEmpty && googleUser.phone.isNotEmpty)) {
        if (!mounted) return;
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('✓ Signed in as ${googleUser.displayName} (${googleUser.email})!'),
            backgroundColor: AppTheme.successGreen,
          ),
        );
        if (Navigator.canPop(context)) {
          Navigator.pop(context);
        }
      } else {
        // Prompt student to enter Registration Number, DOB, Phone & Branch
        setState(() {
          _showProfileStep = true;
        });
      }
    } catch (e) {
      // If native Google Play Services fails (e.g. running on web/test simulator), show clean error or fallback
      setState(() {
        _isLoading = false;
        _errorMessage = 'Google Sign-In note: ${e.toString().replaceAll('Exception: ', '')}. Please check connection and try again.';
      });
    }
  }

  Future<void> _showManualEmailDialog() async {
    final emailCtrl = TextEditingController();
    await showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        title: const Text('Google Email Verification', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
        content: TextField(
          controller: emailCtrl,
          keyboardType: TextInputType.emailAddress,
          decoration: const InputDecoration(
            labelText: 'Google Account Email',
            hintText: 'yourname@gmail.com',
            prefixIcon: Icon(Icons.email_outlined),
          ),
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx), child: const Text('Cancel')),
          ElevatedButton(
            onPressed: () {
              final email = emailCtrl.text.trim();
              Navigator.pop(ctx);
              if (email.isNotEmpty && email.contains('@')) {
                _handleDirectSignIn(email: email);
              }
            },
            child: const Text('Continue'),
          ),
        ],
      ),
    );
  }

  // Fallback sign in for Admin or specific email
  Future<void> _handleDirectSignIn({String? email, String? customName}) async {
    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });

    try {
      final googleUser = await AuthService.instance.signInWithGoogle(
        email: email,
        name: customName,
      );

      setState(() => _isLoading = false);

      if (_nameCtrl.text.isEmpty) _nameCtrl.text = googleUser.displayName;
      if (googleUser.regNo.isNotEmpty) _regNoCtrl.text = googleUser.regNo;
      if (googleUser.dob.isNotEmpty) _dobCtrl.text = googleUser.dob;
      if (googleUser.phone.isNotEmpty) _phoneCtrl.text = googleUser.phone;

      if (googleUser.isAdmin || (googleUser.regNo.isNotEmpty && googleUser.phone.isNotEmpty)) {
        if (!mounted) return;
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('✓ Signed in as ${googleUser.displayName}!'),
            backgroundColor: AppTheme.successGreen,
          ),
        );
        if (Navigator.canPop(context)) Navigator.pop(context);
      } else {
        setState(() => _showProfileStep = true);
      }
    } catch (e) {
      setState(() {
        _isLoading = false;
        _errorMessage = e.toString().replaceAll('Exception: ', '');
      });
    }
  }

  // --- 2. Save Student Profile in Local Storage (5 Fields) ---
  Future<void> _saveStudentProfile() async {
    final name = _nameCtrl.text.trim();
    final regNo = _regNoCtrl.text.trim();
    final dob = _dobCtrl.text.trim();
    final phone = _phoneCtrl.text.trim();

    if (name.isEmpty) {
      setState(() => _errorMessage = 'Please enter your Full Name.');
      return;
    }
    if (regNo.isEmpty) {
      setState(() => _errorMessage = 'Please enter your BEU Registration Number.');
      return;
    }
    if (dob.isEmpty) {
      setState(() => _errorMessage = 'Please enter your Date of Birth (DOB).');
      return;
    }
    if (phone.length < 10) {
      setState(() => _errorMessage = 'Please enter a valid 10-digit mobile number.');
      return;
    }

    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });

    try {
      final updated = await AuthService.instance.updateStudentProfile(
        name: name,
        regNo: regNo,
        dob: dob,
        phone: phone,
        branch: _selectedBranch,
      );

      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('✓ Welcome, ${updated.displayName}! Profile saved locally.'),
          backgroundColor: AppTheme.successGreen,
        ),
      );

      if (Navigator.canPop(context)) {
        Navigator.pop(context);
      }
    } catch (e) {
      setState(() {
        _isLoading = false;
        _errorMessage = e.toString().replaceAll('Exception: ', '');
      });
    }
  }

  Future<void> _pickDateOfBirth() async {
    final now = DateTime.now();
    final initialDate = DateTime(2004, 1, 1);
    final picked = await showDatePicker(
      context: context,
      initialDate: initialDate,
      firstDate: DateTime(1990),
      lastDate: DateTime(now.year - 15),
      builder: (context, child) {
        return Theme(
          data: Theme.of(context).copyWith(
            colorScheme: const ColorScheme.light(
              primary: AppTheme.primaryNavy,
              onPrimary: Colors.white,
              onSurface: AppTheme.textPrimary,
            ),
          ),
          child: child!,
        );
      },
    );

    if (picked != null) {
      final day = picked.day.toString().padLeft(2, '0');
      final month = picked.month.toString().padLeft(2, '0');
      final year = picked.year.toString();
      setState(() {
        _dobCtrl.text = '$day/$month/$year';
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Scaffold(
      backgroundColor: isDark ? const Color(0xFF0F172A) : const Color(0xFFF8FAFC),
      appBar: AppBar(
        elevation: 0,
        backgroundColor: Colors.transparent,
        leading: IconButton(
          icon: Icon(Icons.arrow_back, color: isDark ? Colors.white : AppTheme.primaryNavy),
          onPressed: () => Navigator.pop(context),
        ),
        title: Text(
          _showProfileStep ? 'Complete Student Profile' : 'Student Sign In',
          style: TextStyle(
            fontSize: 18,
            fontWeight: FontWeight.bold,
            color: isDark ? Colors.white : AppTheme.primaryNavy,
          ),
        ),
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
          child: _showProfileStep
              ? _buildProfileCompletionForm(isDark)
              : _buildGoogleSignInCard(isDark),
        ),
      ),
    );
  }

  // --- View A: Pure Google Sign In with Device Account Chooser ---
  Widget _buildGoogleSignInCard(bool isDark) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.center,
      children: [
        const SizedBox(height: 10),

        // Official College Logo (Pura Fit)
        Container(
          width: 100,
          height: 100,
          decoration: BoxDecoration(
            shape: BoxShape.circle,
            color: Colors.white,
            boxShadow: [
              BoxShadow(
                color: Colors.black.withValues(alpha: 0.08),
                blurRadius: 12,
                offset: const Offset(0, 4),
              ),
            ],
            border: Border.all(color: AppTheme.primaryNavy.withValues(alpha: 0.2), width: 2),
          ),
          child: ClipOval(
            child: Image.asset(
              'assets/images/college_crest.jpg',
              fit: BoxFit.contain,
              errorBuilder: (_, __, ___) => const Icon(Icons.school, size: 50, color: AppTheme.primaryNavy),
            ),
          ),
        ),
        const SizedBox(height: 16),

        const Text(
          'GEC SHK Student',
          style: TextStyle(
            fontSize: 22,
            fontWeight: FontWeight.w800,
            color: AppTheme.primaryNavy,
            letterSpacing: 0.3,
          ),
        ),
        const SizedBox(height: 4),
        Text(
          'Government Engineering College, Sheikhpura',
          textAlign: TextAlign.center,
          style: TextStyle(
            fontSize: 13,
            color: isDark ? Colors.white70 : AppTheme.textSecondary,
            fontWeight: FontWeight.w500,
          ),
        ),
        const SizedBox(height: 8),

        // Verified Security Badge
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
          decoration: BoxDecoration(
            color: AppTheme.primaryNavy.withValues(alpha: 0.08),
            borderRadius: BorderRadius.circular(20),
          ),
          child: const Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              Icon(Icons.verified_user, size: 14, color: AppTheme.primaryNavy),
              SizedBox(width: 6),
              Text(
                'Official Google Authentication',
                style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: AppTheme.primaryNavy),
              ),
            ],
          ),
        ),

        const SizedBox(height: 32),

        if (_errorMessage != null)
          Container(
            padding: const EdgeInsets.all(12),
            margin: const EdgeInsets.only(bottom: 20),
            decoration: BoxDecoration(
              color: AppTheme.dangerRed.withValues(alpha: 0.1),
              borderRadius: BorderRadius.circular(10),
              border: Border.all(color: AppTheme.dangerRed.withValues(alpha: 0.3)),
            ),
            child: Row(
              children: [
                const Icon(Icons.error_outline, color: AppTheme.dangerRed, size: 20),
                const SizedBox(width: 8),
                Expanded(
                  child: Text(
                    _errorMessage!,
                    style: const TextStyle(color: AppTheme.dangerRed, fontSize: 13),
                  ),
                ),
              ],
            ),
          ),

        // Main Google Sign-In Card
        Container(
          width: double.infinity,
          padding: const EdgeInsets.all(24),
          decoration: BoxDecoration(
            color: isDark ? const Color(0xFF1E293B) : Colors.white,
            borderRadius: BorderRadius.circular(20),
            boxShadow: [
              BoxShadow(
                color: Colors.black.withValues(alpha: isDark ? 0.3 : 0.06),
                blurRadius: 16,
                offset: const Offset(0, 6),
              ),
            ],
          ),
          child: Column(
            children: [
              const Text(
                'Sign In with Google',
                style: TextStyle(
                  fontSize: 19,
                  fontWeight: FontWeight.w700,
                ),
              ),
              const SizedBox(height: 8),
              Text(
                'Tap below to choose any Google account present on your phone.',
                textAlign: TextAlign.center,
                style: TextStyle(
                  fontSize: 13,
                  color: isDark ? Colors.white60 : AppTheme.textSecondary,
                  height: 1.4,
                ),
              ),
              const SizedBox(height: 24),

              // 1. Native Device Google Account Picker Button
              SizedBox(
                width: double.infinity,
                height: 52,
                child: ElevatedButton(
                  onPressed: _isLoading ? null : _handleNativeGoogleSignIn,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Colors.white,
                    foregroundColor: const Color(0xFF3C4043),
                    elevation: 2,
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(12),
                      side: const BorderSide(color: Color(0xFFDADCE0), width: 1.5),
                    ),
                  ),
                  child: _isLoading
                      ? const SizedBox(
                          width: 22,
                          height: 22,
                          child: CircularProgressIndicator(strokeWidth: 2.5),
                        )
                      : Row(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Image.asset(
                              'assets/images/google_logo.png',
                              height: 22,
                              width: 22,
                              errorBuilder: (_, _, _) => const Icon(Icons.g_mobiledata, size: 28, color: Colors.blue),
                            ),
                            const SizedBox(width: 12),
                            const Text(
                              'Sign in with Google',
                              style: TextStyle(
                                fontSize: 15,
                                fontWeight: FontWeight.w600,
                                color: Color(0xFF3C4043),
                              ),
                            ),
                          ],
                        ),
                ),
              ),

              const SizedBox(height: 14),
              TextButton(
                onPressed: _isLoading ? null : _showManualEmailDialog,
                child: Text(
                  'Or sign in with Google email manually',
                  style: TextStyle(
                    fontSize: 12.5,
                    color: isDark ? Colors.white60 : AppTheme.primaryNavy.withValues(alpha: 0.8),
                    decoration: TextDecoration.underline,
                  ),
                ),
              ),
            ],
          ),
        ),

        const SizedBox(height: 24),

        // Information Callout
        Container(
          padding: const EdgeInsets.all(14),
          decoration: BoxDecoration(
            color: const Color(0xFFEFF6FF),
            borderRadius: BorderRadius.circular(12),
            border: Border.all(color: const Color(0xFFBFDBFE)),
          ),
          child: const Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Icon(Icons.info_outline, size: 18, color: Color(0xFF1D4ED8)),
              SizedBox(width: 10),
              Expanded(
                child: Text(
                  'After Google verification, your student record (Name, BEU Reg No, DOB, Phone & Branch) is stored securely in your phone.',
                  style: TextStyle(fontSize: 12, color: Color(0xFF1E40AF), height: 1.4),
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }

  // --- View B: 5-Field Student Profile Setup ---
  Widget _buildProfileCompletionForm(bool isDark) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const SizedBox(height: 8),

        // Header
        Center(
          child: Column(
            children: [
              Container(
                width: 76,
                height: 76,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  color: Colors.white,
                  border: Border.all(color: AppTheme.primaryNavy, width: 2),
                ),
                child: ClipOval(
                  child: Image.asset(
                    'assets/images/college_crest.jpg',
                    fit: BoxFit.contain,
                  ),
                ),
              ),
              const SizedBox(height: 12),
              const Text(
                'Complete Student Profile',
                style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: 4),
              Text(
                'Enter your institutional details to generate your Digital Student ID',
                textAlign: TextAlign.center,
                style: TextStyle(fontSize: 12.5, color: isDark ? Colors.white60 : AppTheme.textSecondary),
              ),
            ],
          ),
        ),

        const SizedBox(height: 24),

        if (_errorMessage != null)
          Container(
            padding: const EdgeInsets.all(12),
            margin: const EdgeInsets.only(bottom: 16),
            decoration: BoxDecoration(
              color: AppTheme.dangerRed.withValues(alpha: 0.1),
              borderRadius: BorderRadius.circular(8),
              border: Border.all(color: AppTheme.dangerRed.withValues(alpha: 0.3)),
            ),
            child: Row(
              children: [
                const Icon(Icons.error_outline, color: AppTheme.dangerRed, size: 18),
                const SizedBox(width: 8),
                Expanded(
                  child: Text(
                    _errorMessage!,
                    style: const TextStyle(color: AppTheme.dangerRed, fontSize: 13),
                  ),
                ),
              ],
            ),
          ),

        Container(
          padding: const EdgeInsets.all(20),
          decoration: BoxDecoration(
            color: isDark ? const Color(0xFF1E293B) : Colors.white,
            borderRadius: BorderRadius.circular(16),
            boxShadow: [
              BoxShadow(
                color: Colors.black.withValues(alpha: isDark ? 0.2 : 0.05),
                blurRadius: 10,
                offset: const Offset(0, 4),
              ),
            ],
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // 1. Full Name
              _buildFieldLabel('1. Student Full Name *'),
              TextFormField(
                controller: _nameCtrl,
                decoration: _inputDecoration(
                  hint: 'Enter your full name',
                  icon: Icons.person_outline,
                ),
              ),
              const SizedBox(height: 16),

              // 2. Registration Number (Clean empty field with hint)
              _buildFieldLabel('2. BEU Registration Number *'),
              TextFormField(
                controller: _regNoCtrl,
                decoration: _inputDecoration(
                  hint: 'e.g. 23105127001',
                  icon: Icons.badge_outlined,
                ),
              ),
              const SizedBox(height: 16),

              // 3. Date of Birth (DOB)
              _buildFieldLabel('3. Date of Birth (DOB) *'),
              TextFormField(
                controller: _dobCtrl,
                readOnly: true,
                onTap: _pickDateOfBirth,
                decoration: _inputDecoration(
                  hint: 'DD/MM/YYYY (Tap calendar to select)',
                  icon: Icons.calendar_today_outlined,
                  suffixIcon: IconButton(
                    icon: const Icon(Icons.calendar_month, color: AppTheme.primaryNavy),
                    onPressed: _pickDateOfBirth,
                  ),
                ),
              ),
              const SizedBox(height: 16),

              // 4. Phone Number
              _buildFieldLabel('4. Mobile Phone Number *'),
              TextFormField(
                controller: _phoneCtrl,
                keyboardType: TextInputType.phone,
                decoration: _inputDecoration(
                  hint: 'e.g. 9835012345',
                  icon: Icons.phone_outlined,
                ),
              ),
              const SizedBox(height: 16),

              // 5. Branch Dropdown
              _buildFieldLabel('5. Engineering Branch *'),
              DropdownButtonFormField<String>(
                initialValue: _selectedBranch,
                items: _branches
                    .map((b) => DropdownMenuItem(
                          value: b,
                          child: Text(b, style: const TextStyle(fontSize: 13.5)),
                        ))
                    .toList(),
                onChanged: (val) {
                  if (val != null) setState(() => _selectedBranch = val);
                },
                decoration: _inputDecoration(
                  hint: 'Select Branch',
                  icon: Icons.account_tree_outlined,
                ),
              ),

              const SizedBox(height: 28),

              // Submit Button
              SizedBox(
                width: double.infinity,
                height: 50,
                child: ElevatedButton(
                  onPressed: _isLoading ? null : _saveStudentProfile,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppTheme.primaryNavy,
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                  ),
                  child: _isLoading
                      ? const SizedBox(
                          width: 20,
                          height: 20,
                          child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2),
                        )
                      : const Row(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Icon(Icons.check_circle_outline, color: Colors.white, size: 20),
                            SizedBox(width: 8),
                            Text(
                              'Save & Enter Student Hub',
                              style: TextStyle(fontSize: 15, fontWeight: FontWeight.bold, color: Colors.white),
                            ),
                          ],
                        ),
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildFieldLabel(String label) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 6),
      child: Text(
        label,
        style: const TextStyle(fontSize: 12.5, fontWeight: FontWeight.w700),
      ),
    );
  }

  InputDecoration _inputDecoration({
    required String hint,
    required IconData icon,
    Widget? suffixIcon,
  }) {
    return InputDecoration(
      hintText: hint,
      prefixIcon: Icon(icon, size: 20, color: AppTheme.primaryNavy),
      suffixIcon: suffixIcon,
      isDense: true,
      contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
      border: OutlineInputBorder(borderRadius: BorderRadius.circular(10)),
      enabledBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(10),
        borderSide: BorderSide(color: Colors.grey.shade300),
      ),
      focusedBorder: const OutlineInputBorder(
        borderRadius: BorderRadius.all(Radius.circular(10)),
        borderSide: BorderSide(color: AppTheme.primaryNavy, width: 1.8),
      ),
    );
  }
}
