import 'package:flutter/foundation.dart';

/// Coordinated Navigation Service for GEC SHK Student App
/// Handles seamless switching between Main Tabs and their exact Nested Subtabs
class NavigationService {
  static final NavigationService instance = NavigationService._();
  NavigationService._();

  final ValueNotifier<int> mainTabNotifier = ValueNotifier<int>(0);
  final ValueNotifier<int> exploreSubTab = ValueNotifier<int>(0);
  final ValueNotifier<int> communitySubTab = ValueNotifier<int>(0);
  final ValueNotifier<int> academicsSubTab = ValueNotifier<int>(0);

  void navigateTo(int mainTab, [int? subTab]) {
    if (subTab != null) {
      if (mainTab == 1) {
        exploreSubTab.value = subTab;
      } else if (mainTab == 2) {
        communitySubTab.value = subTab;
      } else if (mainTab == 3) {
        academicsSubTab.value = subTab;
      }
    }
    mainTabNotifier.value = mainTab;
  }

  // Convenience navigation shortcuts
  void openHome() => navigateTo(0);
  
  // Market Subtabs: 0: Rooms, 1: Food, 2: Shops & Laundry, 3: Transport
  void openRooms() => navigateTo(1, 0);
  void openFood() => navigateTo(1, 1);
  void openShops() => navigateTo(1, 2);
  void openLaundry() => navigateTo(1, 2);
  void openTransport() => navigateTo(1, 3);

  // Campus Subtabs: 0: Events, 1: Clubs, 2: Sports, 3: Lost & Found, 4: Announcements
  void openEvents() => navigateTo(2, 0);
  void openClubs() => navigateTo(2, 1);
  void openSports() => navigateTo(2, 2);
  void openLostFound() => navigateTo(2, 3);
  void openAnnouncements() => navigateTo(2, 4);

  // Academics Subtabs: 0: Study Hub, 1: Departments, 2: Cutoffs, 3: Placements
  void openStudyHub() => navigateTo(3, 0);
  void openDepartments() => navigateTo(3, 1);
  void openCutoffs() => navigateTo(3, 2);
  void openPlacements() => navigateTo(3, 3);

  void openProfile() => navigateTo(4);
}
