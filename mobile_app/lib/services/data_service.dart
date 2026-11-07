import 'dart:convert';
import 'package:flutter/foundation.dart';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';
import 'package:url_launcher/url_launcher.dart';
import '../models/models.dart';

class DataService {
  static final DataService instance = DataService._();
  DataService._();

  static String get apiBase {
    if (kIsWeb) {
      return Uri.base.origin;
    }
    return 'https://gec-sheikhpura-backend.onrender.com';
  }

  // SharedPreferences keys
  static const String _bookmarksKey = 'gec_saved_bookmarks';
  static const String _grievanceTicketsKey = 'gec_mobile_tickets';
  static const String _userSubmissionsKey = 'gec_user_submissions';
  static const String _themeModeKey = 'gec_theme_mode';

  Future<void> init() async {
    // Background fetch live data from Render backend without blocking UI
    fetchLiveNotices();
    fetchLiveListings();
  }

  Future<void> fetchLiveListings() async {
    try {
      final response = await http.get(Uri.parse('$apiBase/api/listings')).timeout(const Duration(seconds: 8));
      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        if (data is Map && data['listings'] is List) {
          final list = data['listings'] as List;
          for (var item in list) {
            final cat = (item['category'] ?? 'room').toString().toLowerCase();
            final id = item['id'] ?? 'remote_${DateTime.now().millisecondsSinceEpoch}';
            final title = item['title'] ?? 'Listing';
            final contact = item['contact'] ?? '06341-224401';
            final location = item['location'] ?? 'Sheikhpura';
            final priceStr = item['price'] ?? 'Contact';
            final amenitiesStr = item['amenities'] ?? '';
            final amenitiesList = amenitiesStr.toString().split(',').map((e) => e.trim()).where((e) => e.isNotEmpty).toList();

            if (cat == 'room') {
              final rentNum = int.tryParse(priceStr.replaceAll(RegExp(r'[^\d]'), '')) ?? 2000;
              if (!sampleRooms.any((r) => r.id == id || r.title == title)) {
                sampleRooms.insert(
                  0,
                  RoomListing(
                    id: id,
                    title: title,
                    roomType: 'Verified Listing',
                    rentMonthly: rentNum,
                    distanceToCampus: 'Near Campus',
                    address: location,
                    amenities: amenitiesList.isNotEmpty ? amenitiesList : ['Verified Owner', 'Electricity', 'Water'],
                    phone: contact,
                    isVerified: true,
                  ),
                );
              }
            } else if (cat == 'food') {
              final priceNum = int.tryParse(priceStr.replaceAll(RegExp(r'[^\d]'), '')) ?? 2400;
              if (!sampleFood.any((f) => f.id == id || f.name == title)) {
                sampleFood.insert(
                  0,
                  FoodService(
                    id: id,
                    name: title,
                    serviceType: 'Tiffin Mess',
                    monthlyCharge: priceNum,
                    deliveryAvailable: true,
                    menuSummary: amenitiesStr.isNotEmpty ? amenitiesStr : 'Fresh meals twice daily',
                    phone: contact,
                    rating: 0.0,
                  ),
                );
              }
            } else if (cat == 'shop') {
              if (!sampleShops.any((s) => s.id == id || s.name == title)) {
                sampleShops.insert(
                  0,
                  NearbyShop(
                    id: id,
                    name: title,
                    category: 'Stationery & Xerox',
                    location: location,
                    timing: '08:00 AM – 09:00 PM',
                    phone: contact,
                    services: amenitiesStr.isNotEmpty ? amenitiesStr : 'Student essentials & services',
                  ),
                );
              }
            }
          }
        }
      }
    } catch (e) {
      debugPrint('Live listings fetch notice: $e');
    }
  }

  Future<void> fetchLiveNotices() async {
    try {
      final response = await http.get(Uri.parse('$apiBase/api/notices')).timeout(const Duration(seconds: 8));
      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        if (data is Map && data['notices'] is List) {
          final list = data['notices'] as List;
          for (var item in list) {
            final id = item['id'] ?? 'not_${DateTime.now().millisecondsSinceEpoch}';
            final title = item['title'] ?? 'Notice';
            final date = item['date'] ?? 'Recent';
            final cat = item['category'] ?? 'Administration';
            final url = item['url'] ?? '';
            final isImp = item['isImportant'] ?? false;
            if (!campusNotices.any((n) => n.id == id || n.title == title)) {
              campusNotices.insert(
                0,
                CampusNotice(
                  id: id,
                  title: title,
                  category: cat,
                  dateStr: date,
                  authority: 'GEC Sheikhpura Authority',
                  description: 'Official circular from University & College Administration. $url',
                  isUrgent: isImp,
                ),
              );
            }
          }
        }
      }
    } catch (e) {
      debugPrint('Live notices fetch notice: $e');
    }
  }

  Future<void> fetchLiveLostFound() async {
    try {
      final response = await http.get(Uri.parse('$apiBase/api/lostfound')).timeout(const Duration(seconds: 8));
      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        if (data is Map && data['items'] is List) {
          final list = data['items'] as List;
          final List<LostFoundItem> liveItems = [];
          for (var item in list) {
            liveItems.add(
              LostFoundItem(
                id: item['id']?.toString() ?? 'lf_${DateTime.now().millisecondsSinceEpoch}',
                title: item['title']?.toString() ?? 'Item',
                itemType: item['type']?.toString() ?? 'Lost',
                category: item['category']?.toString() ?? 'General',
                location: item['location']?.toString() ?? 'Sheikhpura Campus',
                dateStr: item['dateStr']?.toString() ?? 'Today',
                contactPerson: item['contactName']?.toString() ?? 'Student',
                contactPhone: item['contactPhone']?.toString() ?? '',
                description: item['description']?.toString() ?? '',
              ),
            );
          }
          if (liveItems.isNotEmpty) {
            lostFoundItems.clear();
            lostFoundItems.addAll(liveItems);
          }
        }
      }
    } catch (e) {
      debugPrint('Live lost & found fetch notice: $e');
    }
  }

  Future<void> submitLostFoundItem({
    required String title,
    required String itemType,
    required String category,
    required String location,
    required String dateStr,
    required String contactPerson,
    required String contactPhone,
    required String description,
  }) async {
    final newItem = LostFoundItem(
      id: 'lf_${DateTime.now().millisecondsSinceEpoch}',
      title: title,
      itemType: itemType,
      category: category,
      location: location,
      dateStr: dateStr,
      contactPerson: contactPerson,
      contactPhone: contactPhone,
      description: description,
    );

    lostFoundItems.insert(0, newItem);

    // Live broadcast to Render backend
    try {
      await http.post(
        Uri.parse('$apiBase/api/lostfound'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({
          'title': title,
          'type': itemType,
          'category': category,
          'location': location,
          'dateStr': dateStr,
          'contactName': contactPerson,
          'contactPhone': contactPhone,
          'description': description,
        }),
      ).timeout(const Duration(seconds: 8));
    } catch (e) {
      debugPrint('Lost & Found broadcast notice: $e');
    }
  }

  Future<void> fetchLiveEvents() async {
    try {
      final response = await http.get(Uri.parse('$apiBase/api/events')).timeout(const Duration(seconds: 8));
      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        if (data is Map && data['events'] is List) {
          final list = data['events'] as List;
          final List<EventItem> liveEvents = [];
          for (var item in list) {
            liveEvents.add(
              EventItem(
                id: item['id']?.toString() ?? 'ev_${DateTime.now().millisecondsSinceEpoch}',
                title: item['title']?.toString() ?? 'College Event',
                dateStr: item['dateStr']?.toString() ?? 'Upcoming',
                venue: item['location']?.toString() ?? 'GEC Sheikhpura Campus',
                organizer: item['organizer']?.toString() ?? 'Administration',
                category: item['category']?.toString() ?? 'Campus Event',
                seatsRemaining: item['spotsLeft'] is int ? item['spotsLeft'] : 25,
              ),
            );
          }
          sampleEvents.clear();
          sampleEvents.addAll(liveEvents);
        }
      }
    } catch (e) {
      debugPrint('Live events fetch notice: $e');
    }
  }

  Future<void> fetchLiveLaundryOrders({String? studentEmail, bool isStaffOrAdmin = false}) async {
    try {
      final url = isStaffOrAdmin
          ? '$apiBase/api/laundry/orders?role=laundry_manager'
          : (studentEmail != null && studentEmail.isNotEmpty
              ? '$apiBase/api/laundry/orders?email=${Uri.encodeComponent(studentEmail)}'
              : '$apiBase/api/laundry/orders');
      final res = await http.get(Uri.parse(url)).timeout(const Duration(seconds: 8));
      if (res.statusCode == 200) {
        final data = jsonDecode(res.body);
        if (data is Map && data['orders'] is List) {
          final list = (data['orders'] as List)
              .map((m) => LaundryOrder.fromMap(m as Map<String, dynamic>))
              .toList();
          if (isStaffOrAdmin) {
            allLaundryOrders.clear();
            allLaundryOrders.addAll(list);
          } else {
            studentLaundryOrders.clear();
            studentLaundryOrders.addAll(list);
          }
        }
      }
    } catch (e) {
      debugPrint('Live laundry orders fetch notice: $e');
    }
  }

  Future<bool> submitLaundryOrder(LaundryOrder order) async {
    studentLaundryOrders.insert(0, order);
    try {
      final res = await http.post(
        Uri.parse('$apiBase/api/laundry/orders'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode(order.toMap()),
      ).timeout(const Duration(seconds: 8));
      return (res.statusCode == 200 || res.statusCode == 201);
    } catch (e) {
      debugPrint('Laundry submit notice: $e');
      return true; // Saved locally
    }
  }

  Future<void> updateLaundryOrderStatus(String orderId, String newStatus) async {
    final idx = allLaundryOrders.indexWhere((o) => o.id == orderId);
    if (idx != -1) {
      final old = allLaundryOrders[idx];
      allLaundryOrders[idx] = LaundryOrder(
        id: old.id,
        studentName: old.studentName,
        studentEmail: old.studentEmail,
        studentPhone: old.studentPhone,
        regNo: old.regNo,
        shirtsCount: old.shirtsCount,
        pantsCount: old.pantsCount,
        bedsheetsCount: old.bedsheetsCount,
        othersCount: old.othersCount,
        totalClothes: old.totalClothes,
        roomNo: old.roomNo,
        hostelName: old.hostelName,
        locationDetails: old.locationDetails,
        notes: old.notes,
        status: newStatus,
        createdAt: old.createdAt,
      );
    }
    try {
      await http.patch(
        Uri.parse('$apiBase/api/laundry/orders/$orderId'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({'status': newStatus}),
      ).timeout(const Duration(seconds: 8));
    } catch (e) {
      debugPrint('Update laundry status notice: $e');
    }
  }

  Future<void> refreshAll() async {
    await Future.wait([
      fetchLiveNotices(),
      fetchLiveListings(),
      fetchLiveLostFound(),
      fetchLiveEvents(),
      fetchLiveLaundryOrders(),
    ]);
  }

  Future<void> launchExternalUrl(String urlString) async {
    final uri = Uri.parse(urlString);
    if (await canLaunchUrl(uri)) {
      await launchUrl(uri, mode: LaunchMode.externalApplication);
    }
  }

  Future<void> callPhoneNumber(String phone) async {
    final cleanPhone = phone.replaceAll(RegExp(r'[^\d+]'), '');
    final uri = Uri.parse('tel:$cleanPhone');
    if (await canLaunchUrl(uri)) {
      await launchUrl(uri);
    }
  }

  // --- Bookmarks Management ---
  Future<List<String>> getBookmarkedIds() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getStringList(_bookmarksKey) ?? [];
  }

  Future<bool> isBookmarked(String id) async {
    final bookmarks = await getBookmarkedIds();
    return bookmarks.contains(id);
  }

  Future<bool> toggleBookmark(String id) async {
    final prefs = await SharedPreferences.getInstance();
    final bookmarks = await getBookmarkedIds();
    bool added;
    if (bookmarks.contains(id)) {
      bookmarks.remove(id);
      added = false;
    } else {
      bookmarks.add(id);
      added = true;
    }
    await prefs.setStringList(_bookmarksKey, bookmarks);
    return added;
  }

  // --- Grievance Tickets ---
  Future<String> submitGrievanceTicket({
    required String name,
    required String email,
    required String category,
    required String description,
  }) async {
    final prefs = await SharedPreferences.getInstance();
    final ticketId = 'GRV-APP-${DateTime.now().millisecondsSinceEpoch.toString().substring(7)}';
    final ticketsJson = prefs.getStringList(_grievanceTicketsKey) ?? [];
    
    final newTicket = {
      'id': ticketId,
      'name': name,
      'email': email,
      'category': category,
      'description': description,
      'date': DateTime.now().toIso8601String(),
      'status': 'Under Review (SLA: 48h Ack / 15d Resolve)',
    };
    
    ticketsJson.add(jsonEncode(newTicket));
    await prefs.setStringList(_grievanceTicketsKey, ticketsJson);

    // Live broadcast to Render backend
    try {
      http.post(
        Uri.parse('$apiBase/api/grievance'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({
          'name': name,
          'email': email,
          'category': category,
          'description': description,
        }),
      ).timeout(const Duration(seconds: 6));
    } catch (e) {
      debugPrint('Live grievance broadcast notice: $e');
    }

    return ticketId;
  }

  // --- Submit User Listing (Room, Mess, Shop, Lost/Found) ---
  Future<String> submitListing({
    required String listingType,
    required String title,
    required String contactName,
    required String contactPhone,
    required String address,
    required String details,
    String? priceOrReward,
  }) async {
    final prefs = await SharedPreferences.getInstance();
    final refId = 'LST-${DateTime.now().millisecondsSinceEpoch.toString().substring(7)}';
    final submissions = prefs.getStringList(_userSubmissionsKey) ?? [];

    final item = {
      'refId': refId,
      'type': listingType,
      'title': title,
      'contactName': contactName,
      'phone': contactPhone,
      'address': address,
      'details': details,
      'price': priceOrReward ?? 'N/A',
      'date': DateTime.now().toIso8601String(),
      'status': 'Pending Verification',
    };

    submissions.add(jsonEncode(item));
    await prefs.setStringList(_userSubmissionsKey, submissions);

    // Live broadcast to Render backend
    try {
      final cat = listingType.contains('Food') ? 'food' : (listingType.contains('Shop') ? 'shop' : 'room');
      http.post(
        Uri.parse('$apiBase/api/listings'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({
          'category': cat,
          'title': title,
          'price': priceOrReward ?? 'Contact for price',
          'contact': contactPhone,
          'person': contactName,
          'location': address,
          'amenities': details,
        }),
      ).timeout(const Duration(seconds: 6));
    } catch (e) {
      debugPrint('Live listing broadcast notice: $e');
    }

    return refId;
  }

  // --- Theme Mode Persistence ---
  Future<bool> getIsDarkMode() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getBool(_themeModeKey) ?? false;
  }

  Future<void> setIsDarkMode(bool isDark) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setBool(_themeModeKey, isDark);
  }

  // --- 1. Rooms Repository (Live from Admin / Server) ---
  final List<RoomListing> sampleRooms = [];

  // --- 2. Food & Mess Services (Live from Admin / Server) ---
  final List<FoodService> sampleFood = [];

  // --- 3. Nearby Shops (Live from Admin / Server) ---
  final List<NearbyShop> sampleShops = [];

  // --- 4. Sheikhpura Transport Routes ---
  final List<TransportRoute> transportRoutes = [
    const TransportRoute(
      id: 'tr-1',
      from: 'GEC College Gate (Bajidpur)',
      to: 'Sheikhpura Railway Station',
      mode: 'Shared Auto-Rickshaw',
      fare: '₹15 – ₹20',
      frequency: 'Every 5–10 minutes',
      firstLastTiming: '05:30 AM – 09:30 PM',
      landmark: 'Auto stand directly outside main college entrance.',
    ),
    const TransportRoute(
      id: 'tr-2',
      from: 'Sheikhpura Bus Stand',
      to: 'Kiul Junction (Main Rail Hub)',
      mode: 'Express Bus / Auto',
      fare: '₹40 – ₹50',
      frequency: 'Every 20 minutes',
      firstLastTiming: '05:00 AM – 08:30 PM',
      landmark: 'Direct connectivity to Delhi, Kolkata, Patna trunk trains.',
    ),
    const TransportRoute(
      id: 'tr-3',
      from: 'Sheikhpura',
      to: 'Patna (Mithapur / Bairiya ISBT)',
      mode: 'Bihar State Transport Bus',
      fare: '₹140 – ₹170',
      frequency: 'Hourly',
      firstLastTiming: '05:00 AM – 06:30 PM',
      landmark: 'Travel time ~3.5 hours via Barbigha – Bihar Sharif – Bakhtiyarpur.',
    ),
    const TransportRoute(
      id: 'tr-4',
      from: 'Sheikhpura Junction',
      to: 'Gaya Junction',
      mode: 'Passenger / Express Train',
      fare: '₹30 – ₹45',
      frequency: '6 Trains Daily',
      firstLastTiming: '06:15 AM – 09:45 PM',
      landmark: 'Via Warsaliganj, Nawada, Tilaiya.',
    ),
  ];

  // --- 5. College Events Directory (Live from Backend / Admin) ---
  final List<EventItem> sampleEvents = [];

  // --- 6. Clubs & Societies (Live from Admin) ---
  final List<ClubItem> sampleClubs = [];

  // --- 7. Sports & Squads Matches (Live Student & Admin Matches) ---
  final List<SportsSquad> sportsSquads = [];

  // --- 8. Lost & Found Items (Live from Backend) ---
  final List<LostFoundItem> lostFoundItems = [];

  // --- 9. Student Laundry Orders (Live & Role-Gated) ---
  final List<LaundryOrder> studentLaundryOrders = [];
  final List<LaundryOrder> allLaundryOrders = [];

  // --- 9. Campus Notices & Circulars ---
  final List<CampusNotice> campusNotices = [
    const CampusNotice(
      id: 'not-1',
      title: 'BEU B.Tech 3rd & 5th Semester Examination Form Submission Schedule',
      category: 'Examination',
      dateStr: '30 Oct 2026',
      authority: 'Controller of Examinations, BEU Patna',
      description: 'Online examination portal is live for all regular and carry students. Verify subject codes with HOD before submission.',
      isUrgent: true,
    ),
    const CampusNotice(
      id: 'not-2',
      title: 'Post-Matric Scholarship (PMS Bihar) Academic Year 2026-27 Renewal',
      category: 'Scholarship',
      dateStr: '28 Oct 2026',
      authority: 'Nodal Scholarship Officer, GEC Sheikhpura',
      description: 'BC/EBC/SC/ST students must submit bonafide certificate and fee receipt at college scholarship counter before Nov 20.',
      isUrgent: false,
    ),
    const CampusNotice(
      id: 'not-3',
      title: 'Semester Break & Hostel Maintenance Notification',
      category: 'Administration',
      dateStr: '25 Oct 2026',
      authority: 'Office of the Principal, GEC Sheikhpura',
      description: 'Hostel rooms deep sanitization and water tank maintenance will take place during upcoming holidays.',
      isUrgent: false,
    ),
  ];

  // --- 10. UGEAC Cutoffs Data (2024 / 2025) ---
  final List<CutoffRecord> cutoffRecords = [
    const CutoffRecord(branch: 'Computer Science & Engg (CSE)', category: 'UR', openingRank: 1204, closingRank: 3410),
    const CutoffRecord(branch: 'Computer Science & Engg (CSE)', category: 'BC', openingRank: 3420, closingRank: 4890),
    const CutoffRecord(branch: 'Computer Science & Engg (CSE)', category: 'EBC', openingRank: 3600, closingRank: 5210),
    const CutoffRecord(branch: 'Computer Science & Engg (CSE)', category: 'EWS', openingRank: 3450, closingRank: 4950),
    const CutoffRecord(branch: 'Civil Engineering (CE)', category: 'UR', openingRank: 4200, closingRank: 8900),
    const CutoffRecord(branch: 'Civil Engineering (CE)', category: 'BC', openingRank: 8950, closingRank: 11200),
    const CutoffRecord(branch: 'Mechanical Engineering (ME)', category: 'UR', openingRank: 5100, closingRank: 10400),
    const CutoffRecord(branch: 'Mechanical Engineering (ME)', category: 'BC', openingRank: 10500, closingRank: 12800),
    const CutoffRecord(branch: 'Electrical Engineering (EE)', category: 'UR', openingRank: 4800, closingRank: 9600),
    const CutoffRecord(branch: 'Electrical Engineering (EE)', category: 'BC', openingRank: 9700, closingRank: 11800),
  ];

  // --- 11. Emergency Contacts ---
  final List<EmergencyContact> emergencyContacts = [
    const EmergencyContact(
      title: 'Bihar State Emergency Response (ERSS)',
      number: '112',
      subtitle: '24x7 Unified Police, Fire, Ambulance',
      category: 'Police & Life Safety',
    ),
    const EmergencyContact(
      title: 'National Anti-Ragging Helpline',
      number: '18001805522',
      subtitle: 'UGC 24x7 Confidential Toll-Free Desk',
      category: 'Anti-Ragging',
    ),
    const EmergencyContact(
      title: 'District Sadar Hospital Sheikhpura',
      number: '06341223201',
      subtitle: 'Casualty, ICU & Emergency Ward',
      category: 'Medical',
    ),
    const EmergencyContact(
      title: 'National Cyber Crime Helpline',
      number: '1930',
      subtitle: 'Online Financial Scams & UPI Frauds',
      category: 'Cyber Safety',
    ),
    const EmergencyContact(
      title: 'Bihar State Women Helpline',
      number: '181',
      subtitle: '24x7 Women Safety & Support Desk',
      category: 'Women Safety',
    ),
  ];

  // --- 12. Complete 10 Legal Documents ---
  final List<LegalDoc> legalDocs = [
    const LegalDoc(
      id: 'privacy',
      title: 'Privacy Policy',
      icon: '🔒',
      summary: 'Data protection standards under DPDP Act 2023, zero third-party tracking, and encrypted Supabase auth.',
      fullContent: '''1. HONEST ARCHITECTURE COMMITMENT
The GEC Sheikhpura Student Life Hub is an educational, non-profit community utility designed by students for students. We strictly reject predatory tracking, surveillance advertising, data broking, or monetization of student activity.

2. WHAT WE COLLECT & STORE
- Local Storage (Browser/Device-Only): Bookmarked items, UI theme preference, and offline emergency numbers remain on your device.
- Student Accounts: Display name, batch, branch, and encrypted password hash (managed securely via Supabase Authentication).
- Public Listings: Item title, rent, photos, and contact phone number provided by listing submitter.

3. DATA RETENTION & SECURITY
All web communications use TLS 1.3 encryption. Passwords and sensitive tokens are strictly redacted in operational logs. Data is stored with Row Level Security in PostgreSQL.''',
    ),
    const LegalDoc(
      id: 'terms',
      title: 'Terms & Conditions',
      icon: '📜',
      summary: 'Permitted users, user responsibilities, mandatory physical room inspection, and limitation of liability.',
      fullContent: '''1. NATURE OF THE PLATFORM
The Hub is an open, community-curated bulletin board and student directory. The platform does not own rental accommodations, employ caterers, or broker commercial payments.

2. MANDATORY PHYSICAL INSPECTION & ANTI-SCAM RULES
- Never pay advance booking tokens or security money via UPI before physically visiting the room in Bajidpur.
- Second-hand marketplace transactions must take place in public campus areas in broad daylight.

3. PROHIBITED CONDUCT
Users must not impersonate college authorities, post misleading room listings, scrape contact details, or promote illegal items.''',
    ),
    const LegalDoc(
      id: 'disclaimer',
      title: 'Website Disclaimer',
      icon: '⚠️',
      summary: 'Independent unofficial status, non-affiliation with DSTTE/BEU, and peer listing disclaimer.',
      fullContent: '''1. INDEPENDENT STUDENT PLATFORM
This website and mobile app are created, maintained, and operated independently by engineering students of Government Engineering College Sheikhpura.

2. NO OFFICIAL GOVERNMENT AFFILIATION
The Hub is NOT an official portal of Government Engineering College Sheikhpura, Bihar Engineering University (BEU), or the Department of Science, Technology and Technical Education (DSTTE), Government of Bihar.

Official notices are sourced directly from gecsheikhpura.ac.in.''',
    ),
    const LegalDoc(
      id: 'cookie-policy',
      title: 'Cookie & Storage Policy',
      icon: '🍪',
      summary: 'Zero commercial ad cookies, transparent explanation of functional local storage keys.',
      fullContent: '''1. ZERO TRACKING COOKIES
We do not place advertising cookies, third-party profiling cookies, or marketing pixels on your device.

2. FUNCTIONAL LOCAL STORAGE KEYS
- gec_theme_mode: Stores light/dark theme preference.
- gec_saved_bookmarks: Stores your shortlisted room and food IDs locally.
- gec_mobile_tickets: Stores your submitted grievance complaint reference numbers.''',
    ),
    const LegalDoc(
      id: 'community-guidelines',
      title: 'Community Guidelines',
      icon: '🤝',
      summary: 'Anti-Ragging statutory directive, peer respect, fair trading, and inclusive participation.',
      fullContent: '''1. ZERO-TOLERANCE ANTI-RAGGING DIRECTIVE
In accordance with the Supreme Court of India directives and UGC Regulations, ragging in any form is strictly prohibited and punishable by law.

Emergency Helplines:
- National Anti-Ragging Toll-Free Helpline: 1800-180-5522
- Bihar State Police ERSS: Dial 112

2. PEER CONDUCT & RESPECT
Treat all peers, juniors, and seniors with mutual collegiate respect without discrimination.''',
    ),
    const LegalDoc(
      id: 'acceptable-use',
      title: 'Acceptable Use Policy',
      icon: '🛡️',
      summary: 'Permitted and prohibited campus activities, system security rules, and responsible vulnerability disclosure.',
      fullContent: '''1. PERMITTED ACTIVITIES
The platform is provided for finding student accommodation, verified mess services, campus club events, and academic peer networking.

2. STRICTLY PROHIBITED ACTIVITIES
- Mass automated web scraping of student phone numbers.
- Submitting ghost or fictitious room listings.
- Initiating denial-of-service (DDoS) traffic or security bypass attempts.''',
    ),
    const LegalDoc(
      id: 'data-deletion',
      title: 'Data Deletion Policy',
      icon: '🗑️',
      summary: 'Self-service listing deletion and formal account erasure procedures within 7 business days.',
      fullContent: '''1. SELF-SERVICE REMOVAL
You can delete any room, food, or marketplace listing at any time directly through your dashboard.

2. COMPLETE ACCOUNT ERASURE
To request permanent purging of your account credentials, submit a request to contact@gecsheikhpura.in. Requests are acknowledged within 48 hours and completed within 7 business days.''',
    ),
    const LegalDoc(
      id: 'intellectual-property',
      title: 'Copyright & IP Policy',
      icon: '⚖️',
      summary: 'Fair-use of institutional insignia, user-generated content ownership, and Apna College Bihar attribution.',
      fullContent: '''1. NOMINATIVE FAIR USE
College names, department crests, and emblems are used solely for nominative identification and informational reference.

2. APNA COLLEGE BIHAR ATTRIBUTION
All academic syllabi, semester notes, PYQs, and CGPA tools are hosted independently on Apna College Bihar (apnacollegebihar.online).''',
    ),
    const LegalDoc(
      id: 'accessibility',
      title: 'Accessibility Statement',
      icon: '♿',
      summary: 'WCAG 2.1 AA compliance, high contrast text, screen reader labels, and touch targets ≥ 44x44px.',
      fullContent: '''1. COMMITMENT TO ACCESSIBILITY
We strive to make this student platform accessible to everyone, including students with visual, auditory, cognitive, or motor impairments.

2. STANDARDS IMPLEMENTED
- WCAG 2.1 Level AA conformance.
- Minimum touch target sizing (≥ 44x44 dp) on all buttons.
- Minimum 4.5:1 text color contrast ratio.''',
    ),
    const LegalDoc(
      id: 'grievance',
      title: 'Grievance Redressal Policy',
      icon: '⚖️',
      summary: 'Designated Grievance Officer details, IT Rules 2021 compliance, and 48-hour response protocol.',
      fullContent: '''1. STATUTORY COMPLIANCE & GRIEVANCE OFFICER
In accordance with Rule 3(2) of the Information Technology (Intermediary Guidelines and Digital Media Ethics Code) Rules, 2021:

- Designation: Grievance Redressal Officer
- Official Email: grievance@gecsheikhpura.in (CC: contact@gecsheikhpura.in)
- Location: Bajidpur, Near Police Line, Sheikhpura, Bihar – 811105
- Hours: Monday to Saturday, 10:00 AM – 6:00 PM IST

2. REDRESSAL PROTOCOLS
- Acknowledgment: Within 24 to 48 hours of ticket receipt.
- Resolution: Formal determination and corrective action within 15 days.''',
    ),
  ];
}
