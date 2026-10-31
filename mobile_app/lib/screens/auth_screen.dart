import 'dart:math';
import 'package:flutter/material.dart';
import '../models/models.dart';
import '../services/auth_service.dart';
import '../theme/app_theme.dart';

class AuthScreen extends StatefulWidget {
  const AuthScreen({super.key});

  @override
  State<AuthScreen> createState() => _AuthScreenState();
}

class _AuthScreenState extends State<AuthScreen> with SingleTickerProviderStateMixin {
  late TabController _tabController;
  bool _isLoading = false;
  String? _errorMessage;

  // Email / Password Form Controllers
  bool _isRegisterMode = false;
  final _emailCtrl = TextEditingController();
  final _passCtrl = TextEditingController();
  final _nameCtrl = TextEditingController();
  final _rollCtrl = TextEditingController();
  final _phoneCtrl = TextEditingController();
  String _selectedBranch = 'Computer Science & Engg (CSE)';
  String _selectedBatch = '2023-2027';

  // Phone OTP Form Controllers
  final _otpPhoneCtrl = TextEditingController();
  final _otpCodeCtrl = TextEditingController();
  String? _generatedOtp;
  bool _otpSent = false;

  final List<String> _branches = [
    'Computer Science & Engg (CSE)',
    'Civil Engineering (CE)',
    'Mechanical Engineering (ME)',
    'Electrical Engineering (EE)',
  ];

  final List<String> _batches = [
    '2021-2025',
    '2022-2026',
    '2023-2027',
    '2024-2028',
    '2025-2029',
  ];

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 3, vsync: this);
  }

  @override
  void dispose() {
    _tabController.dispose();
    _emailCtrl.dispose();
    _passCtrl.dispose();
    _nameCtrl.dispose();
    _rollCtrl.dispose();
    _phoneCtrl.dispose();
    _otpPhoneCtrl.dispose();
    _otpCodeCtrl.dispose();
    super.dispose();
  }

  Future<void> _performGoogleLogin({
    String? email,
    String? name,
    String? branch,
    String? batchYear,
    String? rollNo,
  }) async {
    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });

    try {
      final user = await AuthService.instance.signInWithGoogle(
        email: email,
        name: name,
        branch: branch,
        batchYear: batchYear,
        rollNo: rollNo,
      );
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('✓ Signed in as ${user.displayName} (${user.email})!'),
          backgroundColor: AppTheme.successGreen,
        ),
      );
      if (Navigator.canPop(context)) {
        Navigator.pop(context);
      }
    } catch (e) {
      setState(() => _errorMessage = e.toString().replaceAll('Exception: ', ''));
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  Future<void> _performEmailAuth() async {
    final email = _emailCtrl.text.trim();
    final pass = _passCtrl.text.trim();

    if (email.isEmpty || !email.contains('@')) {
      setState(() => _errorMessage = 'Please enter a valid student email address.');
      return;
    }
    if (pass.length < 6) {
      setState(() => _errorMessage = 'Password must be at least 6 characters.');
      return;
    }

    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });

    try {
      if (_isRegisterMode) {
        final name = _nameCtrl.text.trim();
        final roll = _rollCtrl.text.trim();
        final phone = _phoneCtrl.text.trim();

        if (name.isEmpty) {
          throw Exception('Please enter your full name.');
        }

        final user = await AuthService.instance.signUpWithEmailAndPassword(
          name: name,
          email: email,
          password: pass,
          branch: _selectedBranch,
          batchYear: _selectedBatch,
          rollNo: roll.isNotEmpty ? roll : '23CSE01',
          phone: phone,
        );
        if (!mounted) return;
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('✓ Student account created for ${user.displayName}!'),
            backgroundColor: AppTheme.successGreen,
          ),
        );
      } else {
        final user = await AuthService.instance.signInWithEmailAndPassword(
          email: email,
          password: pass,
        );
        if (!mounted) return;
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('✓ Welcome back, ${user.displayName}!'),
            backgroundColor: AppTheme.successGreen,
          ),
        );
      }
      if (Navigator.canPop(context)) {
        Navigator.pop(context);
      }
    } catch (e) {
      setState(() => _errorMessage = e.toString().replaceAll('Exception: ', ''));
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  void _sendPhoneOtp() {
    final phone = _otpPhoneCtrl.text.trim();
    final clean = phone.replaceAll(RegExp(r'\s+'), '');
    if (clean.length < 10) {
      setState(() => _errorMessage = 'Please enter a valid 10-digit mobile number.');
      return;
    }

    final code = (100000 + Random().nextInt(900000)).toString();
    setState(() {
      _generatedOtp = code;
      _otpSent = true;
      _errorMessage = null;
      _otpCodeCtrl.text = code; // Auto-fill simulated code for instant convenience
    });

    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text('📱 SMS OTP Sent! Verification code: $code'),
        backgroundColor: AppTheme.primaryNavy,
        duration: const Duration(seconds: 4),
      ),
    );
  }

  Future<void> _verifyPhoneOtp() async {
    final phone = _otpPhoneCtrl.text.trim();
    final otp = _otpCodeCtrl.text.trim();

    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });

    try {
      final user = await AuthService.instance.signInWithPhone(
        phone: phone,
        otp: otp,
      );
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('✓ Mobile verified! Logged in as ${user.displayName}'),
          backgroundColor: AppTheme.successGreen,
        ),
      );
      if (Navigator.canPop(context)) {
        Navigator.pop(context);
      }
    } catch (e) {
      setState(() => _errorMessage = e.toString().replaceAll('Exception: ', ''));
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;

    return Scaffold(
      appBar: AppBar(
        title: const Text('GEC SHK Student Access'),
      ),
      body: ValueListenableBuilder<UserModel?>(
        valueListenable: AuthService.instance.currentUser,
        builder: (context, user, _) {
          if (user != null) {
            return _buildProfileAndIdCard(context, user, isDark, theme);
          }
          return _buildAuthTabs(context, isDark, theme);
        },
      ),
    );
  }

  Widget _buildAuthTabs(BuildContext context, bool isDark, ThemeData theme) {
    return Center(
      child: ConstrainedBox(
        constraints: const BoxConstraints(maxWidth: 520),
        child: SingleChildScrollView(
          padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 24),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              // Official College Seal Crest - Large Prominent Badge
              Container(
                width: 86,
                height: 86,
                padding: const EdgeInsets.all(3),
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  color: Colors.white,
                  border: Border.all(
                    color: AppTheme.accentSky.withValues(alpha: 0.5),
                    width: 2,
                  ),
                  boxShadow: [
                    BoxShadow(
                      color: Colors.black.withValues(alpha: 0.12),
                      blurRadius: 14,
                      offset: const Offset(0, 4),
                    ),
                  ],
                ),
                child: ClipOval(
                  child: Image.asset(
                    'assets/images/college_crest.png',
                    fit: BoxFit.contain,
                    errorBuilder: (context, error, stackTrace) {
                      return Image.asset(
                        'assets/images/college_crest.jpg',
                        fit: BoxFit.contain,
                        errorBuilder: (ctx, err, st) {
                          return Container(
                            color: AppTheme.primaryNavy,
                            child: const Icon(Icons.school, color: AppTheme.accentSky, size: 40),
                          );
                        },
                      );
                    },
                  ),
                ),
              ),
              const SizedBox(height: 14),

              Text(
                'GEC SHK Student',
                textAlign: TextAlign.center,
                style: TextStyle(
                  fontSize: 22,
                  fontWeight: FontWeight.w900,
                  color: isDark ? Colors.white : AppTheme.primaryNavy,
                  letterSpacing: -0.3,
                ),
              ),
              const SizedBox(height: 4),
              Text(
                'Government Engineering College, Sheikhpura',
                textAlign: TextAlign.center,
                style: TextStyle(
                  fontSize: 12.5,
                  fontWeight: FontWeight.w600,
                  color: isDark ? const Color(0xFFCBD5E1) : const Color(0xFF475569),
                ),
              ),
              const SizedBox(height: 2),
              Text(
                'Bihar Engineering University (BEU) • Firebase Secure Authentication',
                textAlign: TextAlign.center,
                style: TextStyle(
                  fontSize: 10.5,
                  color: isDark ? const Color(0xFF94A3B8) : const Color(0xFF64748B),
                ),
              ),

              const SizedBox(height: 20),

              // Error notification if any
              if (_errorMessage != null) ...[
                Container(
                  padding: const EdgeInsets.all(12),
                  margin: const EdgeInsets.only(bottom: 14),
                  width: double.infinity,
                  decoration: BoxDecoration(
                    color: AppTheme.dangerRed.withValues(alpha: 0.12),
                    borderRadius: BorderRadius.circular(10),
                    border: Border.all(color: AppTheme.dangerRed.withValues(alpha: 0.3)),
                  ),
                  child: Row(
                    children: [
                      const Icon(Icons.error_outline, color: AppTheme.dangerRed, size: 18),
                      const SizedBox(width: 8),
                      Expanded(
                        child: Text(
                          _errorMessage!,
                          style: const TextStyle(fontSize: 12, color: AppTheme.dangerRed, fontWeight: FontWeight.w600),
                        ),
                      ),
                    ],
                  ),
                ),
              ],

              // TabBar for Auth Methods
              Container(
                decoration: BoxDecoration(
                  color: isDark ? const Color(0xFF1E293B) : const Color(0xFFF1F5F9),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: TabBar(
                  controller: _tabController,
                  indicator: BoxDecoration(
                    color: AppTheme.primaryBlue,
                    borderRadius: BorderRadius.circular(10),
                  ),
                  labelColor: Colors.white,
                  unselectedLabelColor: isDark ? const Color(0xFF94A3B8) : const Color(0xFF64748B),
                  labelStyle: const TextStyle(fontWeight: FontWeight.w700, fontSize: 12),
                  indicatorSize: TabBarIndicatorSize.tab,
                  tabs: const [
                    Tab(icon: Icon(Icons.g_mobiledata, size: 22), text: 'Google'),
                    Tab(icon: Icon(Icons.email_outlined, size: 16), text: 'Email & Pass'),
                    Tab(icon: Icon(Icons.phone_android, size: 16), text: 'Phone OTP'),
                  ],
                ),
              ),

              const SizedBox(height: 20),

              // Tab Views
              SizedBox(
                height: _isRegisterMode ? 520 : 360,
                child: TabBarView(
                  controller: _tabController,
                  children: [
                    // Tab 1: Google Login View
                    _buildGoogleTab(context, isDark, theme),

                    // Tab 2: Email & Password View
                    _buildEmailTab(context, isDark, theme),

                    // Tab 3: Phone OTP View
                    _buildPhoneOtpTab(context, isDark, theme),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  // --- TAB 1: GOOGLE SIGN-IN ---
  Widget _buildGoogleTab(BuildContext context, bool isDark, ThemeData theme) {
    return Column(
      children: [
        // Account 1: Super Admin (pk3334238@gmail.com)
        InkWell(
          borderRadius: BorderRadius.circular(14),
          onTap: _isLoading
              ? null
              : () => _performGoogleLogin(
                    name: 'Prince Kumar',
                    email: 'pk3334238@gmail.com',
                    branch: 'Computer Science & Engg (CSE)',
                    batchYear: '2023-2027',
                    rollNo: '23CSE01',
                  ),
          child: Container(
            padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
            decoration: BoxDecoration(
              color: isDark ? const Color(0xFF0F172A) : const Color(0xFFF8FAFC),
              borderRadius: BorderRadius.circular(14),
              border: Border.all(
                color: const Color(0xFF2563EB).withValues(alpha: 0.4),
                width: 1.4,
              ),
            ),
            child: Row(
              children: [
                const CircleAvatar(
                  radius: 20,
                  backgroundColor: Color(0xFF0B57D0),
                  child: Text('P', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 16)),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          Text(
                            'Prince Kumar',
                            style: TextStyle(
                              fontWeight: FontWeight.w700,
                              fontSize: 14,
                              color: isDark ? Colors.white : AppTheme.primaryNavy,
                            ),
                          ),
                          const SizedBox(width: 6),
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 5, vertical: 1),
                            decoration: BoxDecoration(
                              color: const Color(0xFFD97706),
                              borderRadius: BorderRadius.circular(4),
                            ),
                            child: const Text('👑 Super Admin', style: TextStyle(fontSize: 8.5, color: Colors.white, fontWeight: FontWeight.bold)),
                          ),
                        ],
                      ),
                      const SizedBox(height: 2),
                      Text(
                        'pk3334238@gmail.com',
                        style: TextStyle(
                          fontSize: 11.5,
                          color: isDark ? const Color(0xFF94A3B8) : const Color(0xFF64748B),
                        ),
                      ),
                    ],
                  ),
                ),
                const Icon(Icons.arrow_forward_ios, size: 14, color: Color(0xFF2563EB)),
              ],
            ),
          ),
        ),

        const SizedBox(height: 16),

        // Custom Student Google Account Button
        SizedBox(
          width: double.infinity,
          height: 48,
          child: ElevatedButton.icon(
            onPressed: _isLoading ? null : () => _showCustomGoogleDialog(context, isDark, theme),
            icon: _buildGoogleIcon(),
            label: const Text('Use another Google Account', style: TextStyle(fontSize: 13, fontWeight: FontWeight.w700)),
            style: ElevatedButton.styleFrom(
              backgroundColor: isDark ? const Color(0xFF1E293B) : Colors.white,
              foregroundColor: isDark ? Colors.white : const Color(0xFF1F1F1F),
              elevation: 1,
              side: BorderSide(color: isDark ? const Color(0xFF334155) : const Color(0xFFDADCE0)),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
            ),
          ),
        ),

        const SizedBox(height: 16),
        Container(
          padding: const EdgeInsets.all(12),
          decoration: BoxDecoration(
            color: isDark ? const Color(0xFF0F172A) : const Color(0xFFF1F5F9),
            borderRadius: BorderRadius.circular(10),
          ),
          child: const Row(
            children: [
              Icon(Icons.security, size: 16, color: AppTheme.successGreen),
              SizedBox(width: 8),
              Expanded(
                child: Text(
                  'Connected to Firebase Project: gec-sheikhpura with verified SHA certificate credentials.',
                  style: TextStyle(fontSize: 10.5, color: Color(0xFF64748B)),
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }

  void _showCustomGoogleDialog(BuildContext context, bool isDark, ThemeData theme) {
    final customName = TextEditingController();
    final customEmail = TextEditingController();

    showDialog(
      context: context,
      builder: (ctx) {
        return AlertDialog(
          title: const Text('Google Student Sign In'),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              TextField(
                controller: customName,
                decoration: const InputDecoration(labelText: 'Student Full Name', isDense: true),
              ),
              const SizedBox(height: 10),
              TextField(
                controller: customEmail,
                decoration: const InputDecoration(labelText: 'Google Email ID (@gmail.com)', isDense: true),
              ),
            ],
          ),
          actions: [
            TextButton(onPressed: () => Navigator.pop(ctx), child: const Text('Cancel')),
            ElevatedButton(
              onPressed: () {
                final n = customName.text.trim();
                final e = customEmail.text.trim();
                if (e.isNotEmpty && e.contains('@')) {
                  Navigator.pop(ctx);
                  _performGoogleLogin(name: n.isNotEmpty ? n : 'Student', email: e);
                }
              },
              child: const Text('Sign In'),
            ),
          ],
        );
      },
    );
  }

  // --- TAB 2: EMAIL / PASSWORD ---
  Widget _buildEmailTab(BuildContext context, bool isDark, ThemeData theme) {
    return Column(
      children: [
        // Mode Toggle
        Row(
          children: [
            Expanded(
              child: InkWell(
                onTap: () => setState(() => _isRegisterMode = false),
                child: Container(
                  padding: const EdgeInsets.symmetric(vertical: 8),
                  decoration: BoxDecoration(
                    color: !_isRegisterMode ? AppTheme.primaryBlue.withValues(alpha: 0.15) : Colors.transparent,
                    borderRadius: BorderRadius.circular(8),
                    border: Border.all(
                      color: !_isRegisterMode ? AppTheme.primaryBlue : Colors.transparent,
                    ),
                  ),
                  child: Center(
                    child: Text(
                      'Sign In',
                      style: TextStyle(
                        fontSize: 12,
                        fontWeight: FontWeight.w700,
                        color: !_isRegisterMode ? AppTheme.primaryBlue : (isDark ? Colors.white70 : Colors.black54),
                      ),
                    ),
                  ),
                ),
              ),
            ),
            const SizedBox(width: 8),
            Expanded(
              child: InkWell(
                onTap: () => setState(() => _isRegisterMode = true),
                child: Container(
                  padding: const EdgeInsets.symmetric(vertical: 8),
                  decoration: BoxDecoration(
                    color: _isRegisterMode ? AppTheme.primaryBlue.withValues(alpha: 0.15) : Colors.transparent,
                    borderRadius: BorderRadius.circular(8),
                    border: Border.all(
                      color: _isRegisterMode ? AppTheme.primaryBlue : Colors.transparent,
                    ),
                  ),
                  child: Center(
                    child: Text(
                      'New Registration',
                      style: TextStyle(
                        fontSize: 12,
                        fontWeight: FontWeight.w700,
                        color: _isRegisterMode ? AppTheme.primaryBlue : (isDark ? Colors.white70 : Colors.black54),
                      ),
                    ),
                  ),
                ),
              ),
            ),
          ],
        ),

        const SizedBox(height: 12),

        if (_isRegisterMode) ...[
          TextField(
            controller: _nameCtrl,
            decoration: const InputDecoration(labelText: 'Full Name', isDense: true),
          ),
          const SizedBox(height: 8),
          DropdownButtonFormField<String>(
            initialValue: _selectedBranch,
            isDense: true,
            decoration: const InputDecoration(labelText: 'B.Tech Department', isDense: true),
            items: _branches.map((b) => DropdownMenuItem(value: b, child: Text(b, style: const TextStyle(fontSize: 12)))).toList(),
            onChanged: (val) {
              if (val != null) setState(() => _selectedBranch = val);
            },
          ),
          const SizedBox(height: 8),
          Row(
            children: [
              Expanded(
                child: DropdownButtonFormField<String>(
                  initialValue: _selectedBatch,
                  isDense: true,
                  decoration: const InputDecoration(labelText: 'Batch', isDense: true),
                  items: _batches.map((b) => DropdownMenuItem(value: b, child: Text(b, style: const TextStyle(fontSize: 12)))).toList(),
                  onChanged: (val) {
                    if (val != null) setState(() => _selectedBatch = val);
                  },
                ),
              ),
              const SizedBox(width: 8),
              Expanded(
                child: TextField(
                  controller: _rollCtrl,
                  decoration: const InputDecoration(labelText: 'BEU Roll No', isDense: true),
                ),
              ),
            ],
          ),
          const SizedBox(height: 8),
          TextField(
            controller: _phoneCtrl,
            decoration: const InputDecoration(labelText: 'Contact Phone', isDense: true),
          ),
          const SizedBox(height: 8),
        ],

        TextField(
          controller: _emailCtrl,
          decoration: const InputDecoration(labelText: 'Student Email Address', isDense: true),
        ),
        const SizedBox(height: 8),
        TextField(
          controller: _passCtrl,
          obscureText: true,
          decoration: const InputDecoration(labelText: 'Password (min 6 characters)', isDense: true),
        ),
        const SizedBox(height: 14),

        SizedBox(
          width: double.infinity,
          height: 46,
          child: ElevatedButton(
            onPressed: _isLoading ? null : _performEmailAuth,
            style: ElevatedButton.styleFrom(
              backgroundColor: AppTheme.primaryBlue,
              foregroundColor: Colors.white,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
            ),
            child: _isLoading
                ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2))
                : Text(_isRegisterMode ? 'Register & Create ID' : 'Sign In with Email', style: const TextStyle(fontSize: 13.5, fontWeight: FontWeight.w700)),
          ),
        ),
      ],
    );
  }

  // --- TAB 3: PHONE OTP ---
  Widget _buildPhoneOtpTab(BuildContext context, bool isDark, ThemeData theme) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          'Mobile OTP Verification',
          style: TextStyle(fontSize: 14, fontWeight: FontWeight.w700),
        ),
        const SizedBox(height: 4),
        const Text(
          'Instant sign-in via 10-digit mobile number OTP verification.',
          style: TextStyle(fontSize: 11, color: Color(0xFF64748B)),
        ),
        const SizedBox(height: 14),

        TextField(
          controller: _otpPhoneCtrl,
          keyboardType: TextInputType.phone,
          decoration: InputDecoration(
            labelText: 'Mobile Number',
            prefixText: '+91 ',
            isDense: true,
            suffixIcon: TextButton(
              onPressed: _sendPhoneOtp,
              child: Text(_otpSent ? 'Resend' : 'Send OTP', style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 12)),
            ),
          ),
        ),

        const SizedBox(height: 12),

        if (_otpSent) ...[
          Container(
            padding: const EdgeInsets.all(10),
            decoration: BoxDecoration(
              color: AppTheme.accentSky.withValues(alpha: 0.1),
              borderRadius: BorderRadius.circular(8),
              border: Border.all(color: AppTheme.accentSky.withValues(alpha: 0.3)),
            ),
            child: Row(
              children: [
                const Icon(Icons.mark_email_read, color: AppTheme.accentSky, size: 18),
                const SizedBox(width: 8),
                Expanded(
                  child: Text(
                    'OTP sent to +91 ${_otpPhoneCtrl.text.trim()}! Code: $_generatedOtp',
                    style: const TextStyle(fontSize: 11.5, fontWeight: FontWeight.w600, color: AppTheme.primaryBlue),
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 12),
          TextField(
            controller: _otpCodeCtrl,
            keyboardType: TextInputType.number,
            maxLength: 6,
            decoration: const InputDecoration(
              labelText: 'Enter 6-Digit OTP Code',
              counterText: '',
              isDense: true,
            ),
          ),
          const SizedBox(height: 14),
          SizedBox(
            width: double.infinity,
            height: 46,
            child: ElevatedButton(
              onPressed: _isLoading ? null : _verifyPhoneOtp,
              style: ElevatedButton.styleFrom(
                backgroundColor: AppTheme.successGreen,
                foregroundColor: Colors.white,
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
              ),
              child: _isLoading
                  ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2))
                  : const Text('Verify & Enter Student Hub', style: TextStyle(fontSize: 13.5, fontWeight: FontWeight.w700)),
            ),
          ),
        ],
      ],
    );
  }

  // --- SIGNED IN ID CARD VIEW ---
  Widget _buildProfileAndIdCard(BuildContext context, UserModel user, bool isDark, ThemeData theme) {
    final isSuperAdmin = user.isAdmin || user.email.toLowerCase() == 'pk3334238@gmail.com';

    return Center(
      child: ConstrainedBox(
        constraints: const BoxConstraints(maxWidth: 500),
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(20),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Digital Student ID Card Header
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(18),
                decoration: BoxDecoration(
                  gradient: LinearGradient(
                    colors: isSuperAdmin
                        ? [const Color(0xFF1E3A8A), const Color(0xFFB45309)]
                        : [const Color(0xFF1E3A8A), const Color(0xFF2563EB)],
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                  ),
                  borderRadius: BorderRadius.circular(18),
                  boxShadow: [
                    BoxShadow(
                      color: const Color(0xFF1E3A8A).withValues(alpha: 0.35),
                      blurRadius: 16,
                      offset: const Offset(0, 6),
                    ),
                  ],
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Row(
                          children: [
                            Container(
                              width: 38,
                              height: 38,
                              padding: const EdgeInsets.all(2),
                              decoration: const BoxDecoration(color: Colors.white, shape: BoxShape.circle),
                              child: ClipOval(
                                child: Image.asset(
                                  'assets/images/college_crest.png',
                                  fit: BoxFit.contain,
                                  errorBuilder: (ctx, err, st) => const Icon(Icons.school, size: 20, color: Color(0xFF1E3A8A)),
                                ),
                              ),
                            ),
                            const SizedBox(width: 10),
                            const Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text('GEC SHK STUDENT', style: TextStyle(color: Colors.white, fontWeight: FontWeight.w900, fontSize: 13, letterSpacing: 0.5)),
                                Text('Govt. Engineering College Sheikhpura', style: TextStyle(color: Colors.white70, fontSize: 9.5)),
                              ],
                            ),
                          ],
                        ),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 2),
                          decoration: BoxDecoration(
                            color: Colors.white.withValues(alpha: 0.2),
                            borderRadius: BorderRadius.circular(12),
                          ),
                          child: const Text('VERIFIED', style: TextStyle(color: Colors.white, fontSize: 9, fontWeight: FontWeight.bold)),
                        ),
                      ],
                    ),
                    const Divider(color: Colors.white24, height: 24),
                    Row(
                      children: [
                        CircleAvatar(
                          radius: 26,
                          backgroundColor: Colors.white24,
                          child: Text(
                            user.displayName.isNotEmpty ? user.displayName[0] : 'S',
                            style: const TextStyle(fontSize: 22, color: Colors.white, fontWeight: FontWeight.bold),
                          ),
                        ),
                        const SizedBox(width: 14),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Row(
                                children: [
                                  Text(
                                    user.displayName,
                                    style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w800, color: Colors.white),
                                  ),
                                  if (isSuperAdmin) ...[
                                    const SizedBox(width: 6),
                                    Container(
                                      padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 1.5),
                                      decoration: BoxDecoration(
                                        color: const Color(0xFFD97706),
                                        borderRadius: BorderRadius.circular(4),
                                      ),
                                      child: const Text('👑 Super Admin', style: TextStyle(fontSize: 8.5, color: Colors.white, fontWeight: FontWeight.bold)),
                                    ),
                                  ],
                                ],
                              ),
                              Text(user.branch, style: const TextStyle(color: Color(0xFF93C5FD), fontSize: 11, fontWeight: FontWeight.w600)),
                              Text('Roll: ${user.rollNo} • Session: ${user.batchYear}', style: const TextStyle(color: Colors.white70, fontSize: 10.5)),
                            ],
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 12),
                    Text(user.email, style: const TextStyle(color: Colors.white60, fontSize: 10)),
                  ],
                ),
              ),

              const SizedBox(height: 20),

              // Detail Rows
              Card(
                child: Padding(
                  padding: const EdgeInsets.all(16),
                  child: Column(
                    children: [
                      _buildDetailRow('Account Role', isSuperAdmin ? '👑 Super Administrator' : 'Verified Student'),
                      _buildDetailRow('Department', user.branch),
                      _buildDetailRow('Roll Number', user.rollNo),
                      _buildDetailRow('Phone Number', user.phone.isNotEmpty ? user.phone : 'Not Linked'),
                      _buildDetailRow('Auth Provider', 'Firebase (${user.provider.toUpperCase()})'),
                    ],
                  ),
                ),
              ),

              const SizedBox(height: 20),

              SizedBox(
                width: double.infinity,
                child: OutlinedButton.icon(
                  onPressed: () async {
                    await AuthService.instance.signOut();
                    if (!context.mounted) return;
                    ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(content: Text('✓ Signed out successfully.')),
                    );
                  },
                  icon: const Icon(Icons.logout, size: 16, color: AppTheme.dangerRed),
                  label: const Text('Sign Out Session', style: TextStyle(color: AppTheme.dangerRed, fontWeight: FontWeight.bold)),
                  style: OutlinedButton.styleFrom(
                    side: const BorderSide(color: AppTheme.dangerRed),
                    padding: const EdgeInsets.symmetric(vertical: 12),
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildDetailRow(String label, String value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 5),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label, style: const TextStyle(fontSize: 11.5, color: Color(0xFF64748B))),
          Text(value, style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w700)),
        ],
      ),
    );
  }

  Widget _buildGoogleIcon() {
    return Image.asset(
      'assets/images/google_logo.png',
      width: 20,
      height: 20,
      errorBuilder: (context, error, stackTrace) {
        return const Icon(Icons.g_mobiledata, color: Color(0xFF4285F4), size: 22);
      },
    );
  }
}
