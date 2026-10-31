import 'package:flutter/material.dart';

class AppTheme {
  static const Color primaryNavy = Color(0xFF0F172A);
  static const Color primaryBlue = Color(0xFF1E3A8A);
  static const Color accentSky = Color(0xFF0284C7);
  static const Color accentLight = Color(0xFF38BDF8);
  static const Color dangerRed = Color(0xFFEF4444);
  static const Color successGreen = Color(0xFF10B981);
  static const Color warningAmber = Color(0xFFF59E0B);
  static const Color textPrimary = Color(0xFF0F172A);
  static const Color textSecondary = Color(0xFF64748B);

  static ThemeData lightTheme = ThemeData(
    useMaterial3: true,
    brightness: Brightness.light,
    colorScheme: ColorScheme.light(
      primary: primaryBlue,
      secondary: accentSky,
      surface: Colors.white,
      error: dangerRed,
      onPrimary: Colors.white,
      onSecondary: Colors.white,
      onSurface: const Color(0xFF0F172A),
    ),
    scaffoldBackgroundColor: const Color(0xFFF8FAFC),
    appBarTheme: const AppBarTheme(
      backgroundColor: Colors.white,
      foregroundColor: primaryNavy,
      elevation: 0,
      centerTitle: false,
      titleTextStyle: TextStyle(
        color: primaryNavy,
        fontSize: 18,
        fontWeight: FontWeight.w700,
        letterSpacing: -0.3,
      ),
    ),
    cardTheme: CardThemeData(
      color: Colors.white,
      elevation: 0,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(12),
        side: const BorderSide(color: Color(0xFFE2E8F0)),
      ),
      margin: const EdgeInsets.symmetric(vertical: 6, horizontal: 0),
    ),
    bottomNavigationBarTheme: const BottomNavigationBarThemeData(
      backgroundColor: Colors.white,
      selectedItemColor: primaryBlue,
      unselectedItemColor: Color(0xFF64748B),
      type: BottomNavigationBarType.fixed,
      elevation: 8,
      selectedLabelStyle: TextStyle(fontWeight: FontWeight.w700, fontSize: 11),
      unselectedLabelStyle: TextStyle(fontWeight: FontWeight.w500, fontSize: 11),
    ),
  );

  static ThemeData darkTheme = ThemeData(
    useMaterial3: true,
    brightness: Brightness.dark,
    colorScheme: ColorScheme.dark(
      primary: accentSky,
      secondary: accentLight,
      surface: const Color(0xFF0F172A),
      error: dangerRed,
      onPrimary: Colors.white,
      onSecondary: primaryNavy,
      onSurface: const Color(0xFFF8FAFC),
    ),
    scaffoldBackgroundColor: const Color(0xFF020617),
    appBarTheme: const AppBarTheme(
      backgroundColor: Color(0xFF0F172A),
      foregroundColor: Colors.white,
      elevation: 0,
      centerTitle: false,
      titleTextStyle: TextStyle(
        color: Colors.white,
        fontSize: 18,
        fontWeight: FontWeight.w700,
        letterSpacing: -0.3,
      ),
    ),
    cardTheme: CardThemeData(
      color: const Color(0xFF0F172A),
      elevation: 0,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(12),
        side: const BorderSide(color: Color(0xFF1E293B)),
      ),
      margin: const EdgeInsets.symmetric(vertical: 6, horizontal: 0),
    ),
    bottomNavigationBarTheme: const BottomNavigationBarThemeData(
      backgroundColor: Color(0xFF0F172A),
      selectedItemColor: accentLight,
      unselectedItemColor: Color(0xFF94A3B8),
      type: BottomNavigationBarType.fixed,
      elevation: 8,
      selectedLabelStyle: TextStyle(fontWeight: FontWeight.w700, fontSize: 11),
      unselectedLabelStyle: TextStyle(fontWeight: FontWeight.w500, fontSize: 11),
    ),
  );
}
