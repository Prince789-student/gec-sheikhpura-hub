import 'dart:convert';
import 'package:flutter/foundation.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../models/models.dart';

class AuthService {
  static final AuthService instance = AuthService._();
  AuthService._();

  static const String _userKey = 'gec_firebase_user';
  static const String _usersDbKey = 'gec_firebase_registered_users';

  final ValueNotifier<UserModel?> currentUser = ValueNotifier<UserModel?>(null);

  Future<void> init() async {
    final prefs = await SharedPreferences.getInstance();
    final userJson = prefs.getString(_userKey);
    final hasLoggedOut = prefs.getBool('has_logged_out') ?? false;

    if (userJson != null) {
      try {
        final map = jsonDecode(userJson) as Map<String, dynamic>;
        currentUser.value = UserModel.fromMap(map);
      } catch (e) {
        debugPrint('Error restoring user session: $e');
      }
    } else if (!hasLoggedOut) {
      // Pre-seed authenticated Super Admin student session: Prince Kumar (pk3334238@gmail.com) on initial launch
      final princeUser = UserModel(
        uid: 'admin_prince_pk',
        displayName: 'Prince Kumar',
        email: 'pk3334238@gmail.com',
        photoUrl: 'https://lh3.googleusercontent.com/a/default-user',
        branch: 'Computer Science & Engg (CSE)',
        batchYear: '2023-2027',
        rollNo: '23CSE01',
        phone: '06341-224401',
        provider: 'google',
        isVerified: true,
        isAdmin: true,
        createdAt: DateTime.now().toIso8601String(),
      );
      currentUser.value = princeUser;
      await _saveSession(princeUser);
    } else {
      currentUser.value = null;
    }
  }

  // --- Sign In with Google (Firebase OAuth) ---
  Future<UserModel> signInWithGoogle({
    String? email,
    String? name,
    String? branch,
    String? batchYear,
    String? rollNo,
    String? phone,
  }) async {
    final safeEmail = (email != null && email.trim().isNotEmpty) ? email.trim() : 'pk3334238@gmail.com';
    final safeName = (name != null && name.trim().isNotEmpty)
        ? name.trim()
        : (safeEmail.split('@')[0].replaceAll('.', ' '));

    final isSuperAdmin = safeEmail.toLowerCase() == 'pk3334238@gmail.com';

    final user = UserModel(
      uid: 'goog_${DateTime.now().millisecondsSinceEpoch}',
      displayName: safeName[0].toUpperCase() + safeName.substring(1),
      email: safeEmail,
      photoUrl: 'https://lh3.googleusercontent.com/a/default-user',
      branch: branch ?? 'Computer Science & Engg (CSE)',
      batchYear: batchYear ?? '2023-2027',
      rollNo: rollNo ?? '23CSE${(DateTime.now().millisecondsSinceEpoch % 60) + 1}',
      phone: phone ?? '06341-224401',
      provider: 'google',
      isVerified: true,
      isAdmin: isSuperAdmin,
      createdAt: DateTime.now().toIso8601String(),
    );

    await _saveSession(user);
    return user;
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
