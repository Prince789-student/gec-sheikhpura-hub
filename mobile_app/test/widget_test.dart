import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:gec_student_hub/main.dart';

void main() {
  testWidgets('App smoke test initializes navigation tabs', (WidgetTester tester) async {
    await tester.pumpWidget(const GecStudentHubApp());
    await tester.pumpAndSettle();

    // Verify BottomNavigationBar exists and has 5 items
    expect(find.byType(BottomNavigationBar), findsOneWidget);
    final bottomNav = tester.widget<BottomNavigationBar>(find.byType(BottomNavigationBar));
    expect(bottomNav.items.length, 5);
    expect(bottomNav.items[0].label, 'Home');
    expect(bottomNav.items[1].label, 'Explore');
    expect(bottomNav.items[2].label, 'Community');
    expect(bottomNav.items[3].label, 'Academics');
    expect(bottomNav.items[4].label, 'Saved Hub');

    // Verify Apna College Bihar academic referral banner on HomeScreen
    expect(find.text('Apna College Bihar Partner'), findsOneWidget);
  });
}
