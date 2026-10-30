import 'package:flutter/material.dart';
import 'screens/home_screen.dart';
import 'screens/explore_screen.dart';
import 'screens/community_screen.dart';
import 'screens/academics_screen.dart';
import 'screens/profile_screen.dart';
import 'services/data_service.dart';
import 'theme/app_theme.dart';

import 'services/auth_service.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await AuthService.instance.init();
  runApp(const GecStudentHubApp());
}

class GecStudentHubApp extends StatefulWidget {
  const GecStudentHubApp({super.key});

  @override
  State<GecStudentHubApp> createState() => _GecStudentHubAppState();
}

class _GecStudentHubAppState extends State<GecStudentHubApp> {
  bool _isDark = false;

  @override
  void initState() {
    super.initState();
    _loadTheme();
  }

  Future<void> _loadTheme() async {
    final dark = await DataService.instance.getIsDarkMode();
    setState(() => _isDark = dark);
  }

  void _handleThemeToggle(bool value) async {
    setState(() => _isDark = value);
    await DataService.instance.setIsDarkMode(value);
  }

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'GEC Sheikhpura Hub',
      debugShowCheckedModeBanner: false,
      theme: AppTheme.lightTheme,
      darkTheme: AppTheme.darkTheme,
      themeMode: _isDark ? ThemeMode.dark : ThemeMode.light,
      home: MainNavigationScaffold(
        isDark: _isDark,
        onThemeToggle: _handleThemeToggle,
      ),
    );
  }
}

class MainNavigationScaffold extends StatefulWidget {
  final bool isDark;
  final Function(bool) onThemeToggle;

  const MainNavigationScaffold({
    super.key,
    required this.isDark,
    required this.onThemeToggle,
  });

  @override
  State<MainNavigationScaffold> createState() => _MainNavigationScaffoldState();
}

class _MainNavigationScaffoldState extends State<MainNavigationScaffold> {
  int _currentIndex = 0;

  void _onTabChange(int index) {
    setState(() => _currentIndex = index);
  }

  @override
  Widget build(BuildContext context) {
    final screens = [
      HomeScreen(onTabChange: _onTabChange),
      const ExploreScreen(),
      const CommunityScreen(),
      const AcademicsScreen(),
      ProfileScreen(
        isDark: widget.isDark,
        onThemeToggle: widget.onThemeToggle,
      ),
    ];

    return Scaffold(
      body: IndexedStack(
        index: _currentIndex,
        children: screens,
      ),
      bottomNavigationBar: BottomNavigationBar(
        currentIndex: _currentIndex,
        onTap: _onTabChange,
        type: BottomNavigationBarType.fixed,
        selectedFontSize: 11,
        unselectedFontSize: 10,
        items: const [
          BottomNavigationBarItem(
            icon: Icon(Icons.home_outlined),
            activeIcon: Icon(Icons.home_rounded),
            label: 'Home',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.storefront_outlined),
            activeIcon: Icon(Icons.storefront_rounded),
            label: 'Market',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.groups_outlined),
            activeIcon: Icon(Icons.groups_rounded),
            label: 'Campus',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.school_outlined),
            activeIcon: Icon(Icons.school_rounded),
            label: 'Academics',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.badge_outlined),
            activeIcon: Icon(Icons.badge_rounded),
            label: 'Profile & ID',
          ),
        ],
      ),
    );
  }
}
