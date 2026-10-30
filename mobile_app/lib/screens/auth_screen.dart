import 'package:flutter/material.dart';
import '../models/models.dart';
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

  @override
  void dispose() {
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
          content: Text('✓ Authenticated as ${user.displayName} via Google Firebase!'),
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

  // Google Account Chooser & Permissions Consent Dialog
  void _openGoogleSignInModal(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;

    final customEmailCtrl = TextEditingController();
    final customNameCtrl = TextEditingController();
    bool showCustomAccount = false;

    showDialog(
      context: context,
      barrierDismissible: true,
      builder: (dialogCtx) {
        return StatefulBuilder(
          builder: (dialogCtx, setDialogState) {
            return Dialog(
              backgroundColor: isDark ? const Color(0xFF1E293B) : Colors.white,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
              elevation: 8,
              insetPadding: const EdgeInsets.symmetric(horizontal: 20, vertical: 24),
              child: ConstrainedBox(
                constraints: const BoxConstraints(maxWidth: 420),
                child: Padding(
                  padding: const EdgeInsets.all(22),
                  child: SingleChildScrollView(
                    child: Column(
                      mainAxisSize: MainAxisSize.min,
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        // Google Header
                        Row(
                          children: [
                            _buildGoogleIcon(),
                            const SizedBox(width: 12),
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    'Sign in with Google',
                                    style: TextStyle(
                                      fontSize: 17,
                                      fontWeight: FontWeight.w700,
                                      color: isDark ? Colors.white : const Color(0xFF1F1F1F),
                                    ),
                                  ),
                                  Text(
                                    'Choose an account for GEC Sheikhpura Hub',
                                    style: TextStyle(
                                      fontSize: 11.5,
                                      color: isDark ? const Color(0xFF94A3B8) : const Color(0xFF5F6368),
                                    ),
                                  ),
                                ],
                              ),
                            ),
                            IconButton(
                              icon: const Icon(Icons.close, size: 20),
                              onPressed: () => Navigator.pop(dialogCtx),
                              padding: EdgeInsets.zero,
                              constraints: const BoxConstraints(),
                            ),
                          ],
                        ),
                        const SizedBox(height: 16),
                        const Divider(height: 1),
                        const SizedBox(height: 16),

                        // Account 1: Prince Kumar (Super Admin)
                        InkWell(
                          borderRadius: BorderRadius.circular(12),
                          onTap: () {
                            Navigator.pop(dialogCtx);
                            _performGoogleLogin(
                              name: 'Prince Kumar',
                              email: 'pk3334238@gmail.com',
                              branch: 'Computer Science & Engg (CSE)',
                              batchYear: '2023-2027',
                              rollNo: '23CSE01',
                            );
                          },
                          child: Container(
                            padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                            decoration: BoxDecoration(
                              color: isDark ? const Color(0xFF0F172A) : const Color(0xFFF8FAFC),
                              borderRadius: BorderRadius.circular(12),
                              border: Border.all(
                                color: const Color(0xFF2563EB).withValues(alpha: 0.35),
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

                        const SizedBox(height: 12),

                        // Use Another Account
                        if (!showCustomAccount) ...[
                          InkWell(
                            borderRadius: BorderRadius.circular(8),
                            onTap: () {
                              setDialogState(() => showCustomAccount = true);
                            },
                            child: Padding(
                              padding: const EdgeInsets.symmetric(vertical: 8, horizontal: 4),
                              child: Row(
                                children: [
                                  const Icon(Icons.person_add_alt_1_outlined, size: 18, color: Color(0xFF2563EB)),
                                  const SizedBox(width: 10),
                                  Text(
                                    'Use another Google account',
                                    style: TextStyle(
                                      fontSize: 13,
                                      fontWeight: FontWeight.w600,
                                      color: isDark ? const Color(0xFF93C5FD) : const Color(0xFF2563EB),
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          ),
                        ] else ...[
                          Container(
                            padding: const EdgeInsets.all(12),
                            decoration: BoxDecoration(
                              color: isDark ? const Color(0xFF0F172A) : const Color(0xFFF1F5F9),
                              borderRadius: BorderRadius.circular(10),
                              border: Border.all(color: theme.dividerColor),
                            ),
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                const Text(
                                  'Enter Student Google Account:',
                                  style: TextStyle(fontSize: 11.5, fontWeight: FontWeight.w700),
                                ),
                                const SizedBox(height: 8),
                                TextField(
                                  controller: customNameCtrl,
                                  decoration: InputDecoration(
                                    labelText: 'Full Name',
                                    isDense: true,
                                    border: OutlineInputBorder(borderRadius: BorderRadius.circular(8)),
                                  ),
                                ),
                                const SizedBox(height: 8),
                                TextField(
                                  controller: customEmailCtrl,
                                  keyboardType: TextInputType.emailAddress,
                                  decoration: InputDecoration(
                                    labelText: 'Google Email (@gmail.com)',
                                    isDense: true,
                                    border: OutlineInputBorder(borderRadius: BorderRadius.circular(8)),
                                  ),
                                ),
                                const SizedBox(height: 10),
                                SizedBox(
                                  width: double.infinity,
                                  child: ElevatedButton(
                                    onPressed: () {
                                      final n = customNameCtrl.text.trim();
                                      final e = customEmailCtrl.text.trim();
                                      Navigator.pop(dialogCtx);
                                      _performGoogleLogin(
                                        name: n.isNotEmpty ? n : 'Student User',
                                        email: e.isNotEmpty ? e : 'student@gmail.com',
                                      );
                                    },
                                    style: ElevatedButton.styleFrom(
                                      backgroundColor: const Color(0xFF0B57D0),
                                      foregroundColor: Colors.white,
                                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                                    ),
                                    child: const Text('Continue with this account'),
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ],

                        const SizedBox(height: 16),

                        // Required Permissions Box
                        Container(
                          padding: const EdgeInsets.all(12),
                          decoration: BoxDecoration(
                            color: isDark ? const Color(0xFF0F172A) : const Color(0xFFF8FAFC),
                            borderRadius: BorderRadius.circular(10),
                            border: Border.all(
                              color: isDark ? const Color(0xFF334155) : const Color(0xFFE2E8F0),
                            ),
                          ),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Row(
                                children: [
                                  Icon(Icons.verified_user_outlined, size: 16, color: AppTheme.successGreen),
                                  const SizedBox(width: 8),
                                  Text(
                                    'Required Google & Firebase Permissions',
                                    style: TextStyle(
                                      fontSize: 11.5,
                                      fontWeight: FontWeight.w700,
                                      color: isDark ? Colors.white : AppTheme.primaryNavy,
                                    ),
                                  ),
                                ],
                              ),
                              const SizedBox(height: 6),
                              Text(
                                '• Access your basic profile info (name, profile picture)\n'
                                '• View primary email address for identity verification\n'
                                '• Authenticate via Firebase OAuth & SHA Certificate Handshake',
                                style: TextStyle(
                                  fontSize: 10.5,
                                  color: isDark ? const Color(0xFF94A3B8) : const Color(0xFF64748B),
                                  height: 1.4,
                                ),
                              ),
                            ],
                          ),
                        ),

                        const SizedBox(height: 14),
                        Center(
                          child: Text(
                            'To continue, Google will share your name, email, and photo with GEC Sheikhpura Hub.',
                            textAlign: TextAlign.center,
                            style: TextStyle(
                              fontSize: 10,
                              color: isDark ? const Color(0xFF64748B) : const Color(0xFF94A3B8),
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              ),
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
        title: const Text('Student Account & Access'),
      ),
      body: ValueListenableBuilder<UserModel?>(
        valueListenable: AuthService.instance.currentUser,
        builder: (context, user, _) {
          if (user != null) {
            return _buildProfileAndIdCard(context, user, isDark, theme);
          }
          return _buildLoginForm(context, isDark, theme);
        },
      ),
    );
  }

  Widget _buildLoginForm(BuildContext context, bool isDark, ThemeData theme) {
    return Center(
      child: ConstrainedBox(
        constraints: const BoxConstraints(maxWidth: 480),
        child: SingleChildScrollView(
          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 32),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              // Official College Seal Crest
              Container(
                width: 80,
                height: 80,
                padding: const EdgeInsets.all(4),
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  color: Colors.white,
                  boxShadow: [
                    BoxShadow(
                      color: Colors.black.withValues(alpha: 0.12),
                      blurRadius: 16,
                      offset: const Offset(0, 4),
                    ),
                  ],
                ),
                child: ClipOval(
                  child: Image.asset(
                    'assets/images/college_crest.jpg',
                    fit: BoxFit.contain,
                    errorBuilder: (context, error, stackTrace) {
                      return Container(
                        color: AppTheme.primaryNavy,
                        child: const Icon(Icons.school, color: AppTheme.accentSky, size: 36),
                      );
                    },
                  ),
                ),
              ),
              const SizedBox(height: 18),

              Text(
                'GEC Sheikhpura Student Hub',
                textAlign: TextAlign.center,
                style: TextStyle(
                  fontSize: 20,
                  fontWeight: FontWeight.w800,
                  color: isDark ? Colors.white : AppTheme.primaryNavy,
                  letterSpacing: -0.3,
                ),
              ),
              const SizedBox(height: 6),
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
                'Affiliated to BEU Patna • Google Firebase Single Sign-On',
                textAlign: TextAlign.center,
                style: TextStyle(
                  fontSize: 11,
                  color: isDark ? const Color(0xFF94A3B8) : const Color(0xFF64748B),
                ),
              ),

              const SizedBox(height: 32),

              // Error notification if any
              if (_errorMessage != null) ...[
                Container(
                  padding: const EdgeInsets.all(12),
                  margin: const EdgeInsets.only(bottom: 16),
                  width: double.infinity,
                  decoration: BoxDecoration(
                    color: AppTheme.dangerRed.withValues(alpha: 0.12),
                    borderRadius: BorderRadius.circular(10),
                    border: Border.all(color: AppTheme.dangerRed.withValues(alpha: 0.3)),
                  ),
                  child: Text(
                    '❌ $_errorMessage',
                    style: const TextStyle(fontSize: 12, color: AppTheme.dangerRed, fontWeight: FontWeight.w600),
                  ),
                ),
              ],

              // Standard Clean "Login with Google" Button
              SizedBox(
                width: double.infinity,
                height: 50,
                child: ElevatedButton(
                  onPressed: _isLoading ? null : () => _openGoogleSignInModal(context),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: isDark ? const Color(0xFF1E293B) : Colors.white,
                    foregroundColor: isDark ? Colors.white : const Color(0xFF1F1F1F),
                    elevation: 2,
                    shadowColor: Colors.black.withValues(alpha: 0.12),
                    padding: const EdgeInsets.symmetric(horizontal: 16),
                    side: BorderSide(
                      color: isDark ? const Color(0xFF334155) : const Color(0xFFDADCE0),
                      width: 1.4,
                    ),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(25),
                    ),
                  ),
                  child: _isLoading
                      ? const Row(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            SizedBox(
                              width: 18,
                              height: 18,
                              child: CircularProgressIndicator(strokeWidth: 2, color: Color(0xFF4285F4)),
                            ),
                            SizedBox(width: 12),
                            Text(
                              'Signing in with Google...',
                              style: TextStyle(fontSize: 14, fontWeight: FontWeight.w600),
                            ),
                          ],
                        )
                      : Row(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            _buildGoogleIcon(),
                            const SizedBox(width: 12),
                            const Text(
                              'Login with Google',
                              style: TextStyle(
                                fontSize: 15,
                                fontWeight: FontWeight.w600,
                                letterSpacing: 0.2,
                              ),
                            ),
                          ],
                        ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  // --- DIGITAL STUDENT ID CARD ---
  Widget _buildProfileAndIdCard(BuildContext context, UserModel user, bool isDark, ThemeData theme) {
    return Center(
      child: ConstrainedBox(
        constraints: const BoxConstraints(maxWidth: 520),
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Digital ID Card Container
              Container(
                padding: const EdgeInsets.all(18),
                decoration: BoxDecoration(
                  gradient: const LinearGradient(
                    colors: [Color(0xFF0F172A), Color(0xFF1E3A8A)],
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                  ),
                  borderRadius: BorderRadius.circular(16),
                  boxShadow: [
                    BoxShadow(
                      color: Colors.black.withValues(alpha: 0.25),
                      blurRadius: 12,
                      offset: const Offset(0, 4),
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
                              width: 32,
                              height: 32,
                              padding: const EdgeInsets.all(2),
                              decoration: const BoxDecoration(
                                shape: BoxShape.circle,
                                color: Colors.white,
                              ),
                              child: ClipOval(
                                child: Image.asset(
                                  'assets/images/college_crest.jpg',
                                  fit: BoxFit.contain,
                                  errorBuilder: (context, error, stackTrace) => const Icon(Icons.school, size: 18),
                                ),
                              ),
                            ),
                            const SizedBox(width: 8),
                            const Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  'GEC SHEIKHPURA',
                                  style: TextStyle(fontSize: 12, fontWeight: FontWeight.w800, color: Colors.white, letterSpacing: 0.5),
                                ),
                                Text(
                                  'Student Life Hub • Verified Card',
                                  style: TextStyle(fontSize: 9, color: Color(0xFF93C5FD)),
                                ),
                              ],
                            ),
                          ],
                        ),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                          decoration: BoxDecoration(
                            color: AppTheme.successGreen.withValues(alpha: 0.2),
                            borderRadius: BorderRadius.circular(4),
                            border: Border.all(color: AppTheme.successGreen),
                          ),
                          child: const Text(
                            'ACTIVE',
                            style: TextStyle(fontSize: 9, fontWeight: FontWeight.w800, color: AppTheme.successGreen),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 16),
                    Row(
                      children: [
                        CircleAvatar(
                          radius: 28,
                          backgroundColor: Colors.white.withValues(alpha: 0.2),
                          child: Text(
                            user.displayName.isNotEmpty ? user.displayName[0] : 'S',
                            style: const TextStyle(fontSize: 24, fontWeight: FontWeight.w800, color: Colors.white),
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
                                  if (user.isAdmin || user.email.toLowerCase() == 'pk3334238@gmail.com' || user.email.toLowerCase() == 'prince86944@gmail.com') ...[
                                    const SizedBox(width: 6),
                                    Container(
                                      padding: const EdgeInsets.symmetric(horizontal: 5, vertical: 1),
                                      decoration: BoxDecoration(
                                        color: const Color(0xFFD97706),
                                        borderRadius: BorderRadius.circular(4),
                                      ),
                                      child: const Text('👑 Super Admin', style: TextStyle(fontSize: 8, color: Colors.white, fontWeight: FontWeight.bold)),
                                    ),
                                  ],
                                ],
                              ),
                              Text(
                                user.branch,
                                style: const TextStyle(fontSize: 11, color: Color(0xFF93C5FD), fontWeight: FontWeight.w600),
                              ),
                              Text(
                                'Roll: ${user.rollNo} • Batch: ${user.batchYear}',
                                style: const TextStyle(fontSize: 10.5, color: Color(0xFFCBD5E1)),
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 16),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text(
                          user.email,
                          style: const TextStyle(fontSize: 10, color: Color(0xFF94A3B8)),
                        ),
                        Text(
                          'Auth: ${user.provider.toUpperCase()}',
                          style: const TextStyle(fontSize: 9.5, fontWeight: FontWeight.w700, color: AppTheme.accentLight),
                        ),
                      ],
                    ),
                  ],
                ),
              ),

              const SizedBox(height: 20),

              // Account Details Card
              Card(
                child: Padding(
                  padding: const EdgeInsets.all(14),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text('Account Information', style: TextStyle(fontSize: 14, fontWeight: FontWeight.w700)),
                      const SizedBox(height: 8),
                      _buildDetailRow('User UID', user.uid),
                      _buildDetailRow('Email', user.email),
                      _buildDetailRow('Role', user.isAdmin ? '👑 Super Administrator' : 'Verified Student'),
                      _buildDetailRow('Department', user.branch),
                      _buildDetailRow('Session / Batch', user.batchYear),
                      _buildDetailRow('Roll Number', user.rollNo),
                      _buildDetailRow('Auth Provider', 'Google Firebase (${user.provider})'),
                    ],
                  ),
                ),
              ),

              const SizedBox(height: 20),

              // Sign Out Button -> Cleanly returns to the Google Sign-In view
              SizedBox(
                width: double.infinity,
                child: OutlinedButton.icon(
                  onPressed: () async {
                    await AuthService.instance.signOut();
                    if (!context.mounted) return;
                    ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(
                        content: Text('✓ Signed out. Login with Google is ready!'),
                        backgroundColor: AppTheme.primaryNavy,
                      ),
                    );
                  },
                  icon: const Icon(Icons.logout, size: 16, color: AppTheme.dangerRed),
                  label: const Text('Sign Out from App', style: TextStyle(color: AppTheme.dangerRed, fontWeight: FontWeight.w700)),
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
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label, style: const TextStyle(fontSize: 11, color: Color(0xFF64748B))),
          Text(value, style: const TextStyle(fontSize: 11.5, fontWeight: FontWeight.w600)),
        ],
      ),
    );
  }

  Widget _buildGoogleIcon() {
    return Image.asset(
      'assets/images/google_logo.png',
      width: 22,
      height: 22,
      errorBuilder: (context, error, stackTrace) {
        return Container(
          width: 22,
          height: 22,
          decoration: const BoxDecoration(shape: BoxShape.circle),
          child: CustomPaint(painter: _GoogleLogoPainter()),
        );
      },
    );
  }
}

class _GoogleLogoPainter extends CustomPainter {
  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()..style = PaintingStyle.fill;

    // Blue
    paint.color = const Color(0xFF4285F4);
    canvas.drawRect(Rect.fromLTWH(size.width * 0.5, size.height * 0.35, size.width * 0.5, size.height * 0.3), paint);

    // Red
    paint.color = const Color(0xFFEA4335);
    canvas.drawCircle(Offset(size.width * 0.5, size.height * 0.2), size.width * 0.2, paint);

    // Green
    paint.color = const Color(0xFF34A853);
    canvas.drawCircle(Offset(size.width * 0.5, size.height * 0.8), size.width * 0.2, paint);

    // Yellow
    paint.color = const Color(0xFFFBBC05);
    canvas.drawCircle(Offset(size.width * 0.2, size.height * 0.5), size.width * 0.2, paint);
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}
