import 'dart:convert';
import 'package:flutter/foundation.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:google_sign_in/google_sign_in.dart';
import '../models/models.dart';

class AuthService {
  static final AuthService instance = AuthService._();
  AuthService._();

  static const String _userKey = 'gec_firebase_user';
  static const String _usersDbKey = 'gec_firebase_registered_users';

  final ValueNotifier<UserModel?> currentUser = ValueNotifier<UserModel?>(null);

  final GoogleSignIn _googleSignIn = GoogleSignIn(
    scopes: ['email', 'profile'],
  );

  Future<void> init() async {
    final prefs = await SharedPreferences.getInstance();
    final userJson = prefs.getString(_userKey);

    if (userJson != null) {
      try {
        final map = jsonDecode(userJson) as Map<String, dynamic>;
        currentUser.value = UserModel.fromMap(map);
        return;
      } catch (e) {
        debugPrint('Error restoring user session: $e');
      }
    }

    currentUser.value = null;
  }

  // --- Real Google Sign In (Pops up Native Android Account Chooser) ---
  Future<UserModel?> signInWithNativeGoogle() async {
    try {
      // Disconnect or sign out previous cache to ensure account picker opens
      try {
        await _googleSignIn.signOut();
      } catch (_) {}

      final GoogleSignInAccount? account = await _googleSignIn.signIn();
      if (account == null) {
        // User cancelled account selection
        return null;
      }

      final email = account.email.trim();
      final name = (account.displayName != null && account.displayName!.trim().isNotEmpty)
          ? account.displayName!.trim()
          : email.split('@')[0];
      final photo = account.photoUrl;

      // Check if user profile is already saved locally in DB
      final prefs = await SharedPreferences.getInstance();
      final usersDb = prefs.getStringList(_usersDbKey) ?? [];
      for (var uStr in usersDb) {
        try {
          final map = jsonDecode(uStr) as Map<String, dynamic>;
          if (map['email']?.toString().toLowerCase() == email.toLowerCase()) {
            final existingUser = UserModel.fromMap(map);
            currentUser.value = existingUser;
            await _saveSession(existingUser);
            return existingUser;
          }
        } catch (_) {}
      }

      // New Google User
      final isSuperAdmin = email.toLowerCase() == 'pk3334238@gmail.com';
      final newUser = UserModel(
        uid: account.id.isNotEmpty ? account.id : 'goog_${DateTime.now().millisecondsSinceEpoch}',
        displayName: name,
        email: email,
        photoUrl: photo ?? 'https://lh3.googleusercontent.com/a/default-user',
        branch: 'Computer Science & Engg (CSE)',
        batchYear: '2023-2027',
        rollNo: isSuperAdmin ? '23CSE01' : '',
        regNo: isSuperAdmin ? '23105127001' : '',
        dob: isSuperAdmin ? '15/08/2004' : '',
        phone: isSuperAdmin ? '9835012345' : '',
        provider: 'google',
        isVerified: true,
        isAdmin: isSuperAdmin,
        createdAt: DateTime.now().toIso8601String(),
      );

      currentUser.value = newUser;
      await _saveSession(newUser);
      return newUser;
    } catch (e) {
      debugPrint('Native Google Sign-In exception: $e');
      rethrow;
    }
  }

  // --- Manual/Fallback Google Sign In ---
  Future<UserModel> signInWithGoogle({
    String? email,
    String? name,
    String? photoUrl,
    String? regNo,
    String? dob,
    String? phone,
    String? branch,
    String? batchYear,
    String? rollNo,
  }) async {
    final safeEmail = (email != null && email.trim().isNotEmpty) ? email.trim() : 'pk3334238@gmail.com';
    final safeName = (name != null && name.trim().isNotEmpty)
        ? name.trim()
        : (safeEmail.toLowerCase() == 'pk3334238@gmail.com' ? 'Prince Kumar' : safeEmail.split('@')[0].replaceAll('.', ' '));

    final isSuperAdmin = safeEmail.toLowerCase() == 'pk3334238@gmail.com';

    final user = UserModel(
      uid: 'goog_${DateTime.now().millisecondsSinceEpoch}',
      displayName: safeName,
      email: safeEmail,
      photoUrl: photoUrl ?? 'https://lh3.googleusercontent.com/a/default-user',
      branch: branch ?? 'Computer Science & Engg (CSE)',
      batchYear: batchYear ?? '2023-2027',
      rollNo: rollNo ?? (isSuperAdmin ? '23CSE01' : ''),
      regNo: regNo ?? (isSuperAdmin ? '23105127001' : ''),
      dob: dob ?? (isSuperAdmin ? '15/08/2004' : ''),
      phone: phone ?? (isSuperAdmin ? '9835012345' : ''),
      provider: 'google',
      isVerified: true,
      isAdmin: isSuperAdmin,
      createdAt: DateTime.now().toIso8601String(),
    );

    currentUser.value = user;
    await _saveSession(user);
    return user;
  }

  // --- Save / Update Student Profile in SharedPreferences ---
  Future<UserModel> updateStudentProfile({
    required String name,
    required String regNo,
    required String dob,
    required String phone,
    required String branch,
    String? batchYear,
  }) async {
    final current = currentUser.value;
    final updated = UserModel(
      uid: current?.uid ?? 'usr_${DateTime.now().millisecondsSinceEpoch}',
      displayName: name.trim(),
      email: current?.email ?? 'student@gecsheikhpura.ac.in',
      photoUrl: current?.photoUrl,
      branch: branch.trim(),
      batchYear: batchYear ?? (current?.batchYear ?? '2023-2027'),
      rollNo: current?.rollNo ?? '',
      regNo: regNo.trim(),
      dob: dob.trim(),
      phone: phone.trim(),
      provider: 'google',
      isVerified: true,
      isAdmin: current?.isAdmin ?? (current?.email.toLowerCase() == 'pk3334238@gmail.com'),
      createdAt: current?.createdAt ?? DateTime.now().toIso8601String(),
    );

    currentUser.value = updated;
    await _saveSession(updated);

    // Also persist in registered users DB
    final prefs = await SharedPreferences.getInstance();
    final usersDb = prefs.getStringList(_usersDbKey) ?? [];
    usersDb.removeWhere((u) {
      try {
        final m = jsonDecode(u) as Map<String, dynamic>;
        return m['email']?.toString().toLowerCase() == updated.email.toLowerCase();
      } catch (_) {
        return false;
      }
    });
    usersDb.add(jsonEncode(updated.toMap()));
    await prefs.setStringList(_usersDbKey, usersDb);

    return updated;
  }

  // --- Sign In with Email & Password ---
  Future<UserModel> signInWithEmailAndPassword({
    required String email,
    required String password,
  }) async {
    final prefs = await SharedPreferences.getInstance();
    final usersDb = prefs.getStringList(_usersDbKey) ?? [];

    for (var uStr in usersDb) {
      final map = jsonDecode(uStr) as Map<String, dynamic>;
      if (map['email']?.toString().toLowerCase() == email.trim().toLowerCase()) {
        if (map['password'] != null && map['password'] != password) {
          throw Exception('Incorrect password. Please verify credentials.');
        }
        final user = UserModel.fromMap(map);
        await _saveSession(user);
        return user;
      }
    }

    // If new user signing in first time via email, auto-create student account
    final name = email.split('@')[0];
    final newUser = UserModel(
      uid: 'usr_${DateTime.now().millisecondsSinceEpoch}',
      displayName: name[0].toUpperCase() + name.substring(1),
      email: email.trim(),
      branch: 'Computer Science (CSE)',
      batchYear: '2023-2027',
      rollNo: '23CSE${(DateTime.now().millisecondsSinceEpoch % 60) + 1}',
      phone: '',
      provider: 'firebase_email',
      isVerified: true,
      createdAt: DateTime.now().toIso8601String(),
    );

    // Save to users DB
    final userMapWithPass = newUser.toMap();
    userMapWithPass['password'] = password;
    usersDb.add(jsonEncode(userMapWithPass));
    await prefs.setStringList(_usersDbKey, usersDb);

    await _saveSession(newUser);
    return newUser;
  }

  // --- Sign Up with Details ---
  Future<UserModel> signUpWithEmailAndPassword({
    required String name,
    required String email,
    required String password,
    required String branch,
    required String batchYear,
    required String rollNo,
    required String phone,
  }) async {
    final prefs = await SharedPreferences.getInstance();
    final usersDb = prefs.getStringList(_usersDbKey) ?? [];

    for (var uStr in usersDb) {
      final map = jsonDecode(uStr) as Map<String, dynamic>;
      if (map['email']?.toString().toLowerCase() == email.trim().toLowerCase()) {
        throw Exception('An account with this email already exists. Please sign in.');
      }
    }

    final newUser = UserModel(
      uid: 'usr_${DateTime.now().millisecondsSinceEpoch}',
      displayName: name.trim(),
      email: email.trim(),
      branch: branch,
      batchYear: batchYear,
      rollNo: rollNo.trim().toUpperCase(),
      phone: phone.trim(),
      provider: 'firebase_email',
      isVerified: true,
      createdAt: DateTime.now().toIso8601String(),
    );

    final userMapWithPass = newUser.toMap();
    userMapWithPass['password'] = password;
    usersDb.add(jsonEncode(userMapWithPass));
    await prefs.setStringList(_usersDbKey, usersDb);

    await _saveSession(newUser);
    return newUser;
  }

  // --- Sign In with Phone OTP ---
  Future<UserModel> signInWithPhone({
    required String phone,
    required String otp,
    String? name,
  }) async {
    final cleanPhone = phone.trim().replaceAll(RegExp(r'\s+'), '');
    if (cleanPhone.length < 10) {
      throw Exception('Please enter a valid 10-digit mobile number.');
    }
    if (otp.trim().length != 6) {
      throw Exception('Please enter the 6-digit verification code (OTP).');
    }

    final prefs = await SharedPreferences.getInstance();
    final usersDb = prefs.getStringList(_usersDbKey) ?? [];

    for (var uStr in usersDb) {
      final map = jsonDecode(uStr) as Map<String, dynamic>;
      final p = map['phone']?.toString().replaceAll(RegExp(r'\s+'), '') ?? '';
      if (p.isNotEmpty && (p == cleanPhone || cleanPhone.endsWith(p) || p.endsWith(cleanPhone))) {
        final existing = UserModel.fromMap(map);
        await _saveSession(existing);
        return existing;
      }
    }

    final last4 = cleanPhone.length >= 4 ? cleanPhone.substring(cleanPhone.length - 4) : cleanPhone;
    final displayName = (name != null && name.trim().isNotEmpty) ? name.trim() : 'GEC Student ($last4)';
    final user = UserModel(
      uid: 'ph_${DateTime.now().millisecondsSinceEpoch}',
      displayName: displayName,
      email: '${cleanPhone.substring(cleanPhone.length - 10)}@student.gecsheikhpura.ac.in',
      phone: cleanPhone,
      branch: 'Computer Science (CSE)',
      batchYear: '2023-2027',
      rollNo: '23CSE${(DateTime.now().millisecondsSinceEpoch % 60) + 1}',
      provider: 'phone',
      isVerified: true,
      isAdmin: false, // Super Admin strictly locked to pk3334238@gmail.com
      createdAt: DateTime.now().toIso8601String(),
    );

    usersDb.add(jsonEncode(user.toMap()));
    await prefs.setStringList(_usersDbKey, usersDb);
    await _saveSession(user);
    return user;
  }

  // --- Send Password Reset Email ---
  Future<void> sendPasswordResetEmail(String email) async {
    // In production, Firebase Auth sends recovery token
    await Future.delayed(const Duration(milliseconds: 600));
  }

  // --- Sign Out ---
  Future<void> signOut() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove(_userKey);
    await prefs.setBool('has_logged_out', true);
    currentUser.value = null;
  }

  Future<void> _saveSession(UserModel user) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_userKey, jsonEncode(user.toMap()));
    await prefs.setBool('has_logged_out', false);
    currentUser.value = user;
  }
}
