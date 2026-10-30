import 'dart:convert';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:url_launcher/url_launcher.dart';
import '../models/models.dart';

class DataService {
  static final DataService instance = DataService._();
  DataService._();

  // SharedPreferences keys
  static const String _bookmarksKey = 'gec_saved_bookmarks';
  static const String _grievanceTicketsKey = 'gec_mobile_tickets';
  static const String _userSubmissionsKey = 'gec_user_submissions';
  static const String _themeModeKey = 'gec_theme_mode';

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

  // --- 1. Seed Rooms Repository ---
  final List<RoomListing> sampleRooms = [
    const RoomListing(
      id: 'room-1',
      title: 'Maa Sharda Boys Hostel & PG',
      roomType: 'Double Sharing',
      rentMonthly: 2200,
      distanceToCampus: '400m from College Gate',
      address: 'Bajidpur Main Road, Near Police Line, Sheikhpura',
      amenities: ['24x7 Water', 'Inverter Backup', 'Wi-Fi 50Mbps', 'Bike Parking'],
      phone: '06341-223401',
      isVerified: true,
    ),
    const RoomListing(
      id: 'room-2',
      title: 'Annapurna Student Residency',
      roomType: 'Single Room',
      rentMonthly: 3200,
      distanceToCampus: '650m from Campus',
      address: 'Bajidpur Chowk, Behind Canteen, Sheikhpura',
      amenities: ['Attached Washroom', 'Ceiling Fan', 'Study Desk', 'RO Purifier'],
      phone: '06341-223402',
      isVerified: true,
    ),
    const RoomListing(
      id: 'room-3',
      title: 'Shree Balaji Girls PG & Safe Stay',
      roomType: 'Double Sharing + Food',
      rentMonthly: 4500,
      distanceToCampus: '500m from Campus',
      address: 'Near Old Circuit House, Sheikhpura',
      amenities: ['3 Times Meals', 'CCTV Security', 'Female Warden', 'Full Power Backup'],
      phone: '06341-223403',
      isVerified: true,
    ),
    const RoomListing(
      id: 'room-4',
      title: 'Kishan Bhavan Shared Student Flat',
      roomType: '3-Bed Shared',
      rentMonthly: 1600,
      distanceToCampus: '900m from Campus',
      address: 'Station Road, Near Bypass, Sheikhpura',
      amenities: ['Self-Cooking Kitchen', 'Water Cooler', 'Open Balcony'],
      phone: '06341-223404',
      isVerified: true,
    ),
  ];

  // --- 2. Seed Food Services ---
  final List<FoodService> sampleFood = [
    const FoodService(
      id: 'food-1',
      name: 'Maa Vaishno Tiffin Service',
      serviceType: 'Monthly Mess / Tiffin',
      monthlyCharge: 2400,
      deliveryAvailable: true,
      menuSummary: 'Roti (4), Sabzi, Dal Tadka, Jeera Rice, Salad, Pickle. Kheer on Sundays.',
      phone: '06341-224501',
      rating: 4.8,
    ),
    const FoodService(
      id: 'food-2',
      name: 'Bajidpur Student Canteen & Bhojanalaya',
      serviceType: 'Dine-In / Quick Lunch',
      monthlyCharge: 2200,
      deliveryAvailable: false,
      menuSummary: 'Unlimited Rice + Dal + seasonal vegetable sabzi, Roti combo ₹40.',
      phone: '06341-224502',
      rating: 4.5,
    ),
    const FoodService(
      id: 'food-3',
      name: 'Pooja Tiffin & Home Delivery',
      serviceType: 'Doorstep Hostel Delivery',
      monthlyCharge: 2600,
      deliveryAvailable: true,
      menuSummary: 'Fresh home-style cooking, pure mustard oil, special Paneer on Wednesday.',
      phone: '06341-224503',
      rating: 4.7,
    ),
  ];

  // --- 3. Nearby Shops & Laundry ---
  final List<NearbyShop> sampleShops = [
    const NearbyShop(
      id: 'shop-1',
      name: 'Gayatri Stationery, Xerox & Cyber Desk',
      category: 'Stationery & Printing',
      location: 'Opposite GEC College Gate, Bajidpur',
      timing: '08:00 AM – 09:30 PM',
      phone: '06341-225601',
      services: 'BEU Exam forms printout, B.Tech Lab manuals spiral binding, drafters, chart papers, ₹1 xerox.',
    ),
    const NearbyShop(
      id: 'shop-2',
      name: 'Bajidpur Student Laundry & Ironing Hub',
      category: 'Laundry & Ironing',
      location: 'Near Police Line More, Bajidpur',
      timing: '07:00 AM – 08:00 PM',
      phone: '06341-225602',
      services: '₹8/shirt, ₹10/jeans steam press. Monthly hostel pickup & delivery plan at ₹450 (40 clothes).',
    ),
    const NearbyShop(
      id: 'shop-3',
      name: 'Sanjeevani Medicos & First Aid Store',
      category: 'Pharmacy & Medical',
      location: 'Bajidpur Hospital More, Sheikhpura',
      timing: '24 Hours Open',
      phone: '06341-225603',
      services: 'All generic medicines, ORS, fever tablets, bandages, antiseptic, BP/Sugar testing.',
    ),
    const NearbyShop(
      id: 'shop-4',
      name: 'Maa Durga General & Student Grocery Store',
      category: 'Groceries & Daily Essentials',
      location: 'Near Hostel 1 Lane, Bajidpur',
      timing: '06:30 AM – 10:00 PM',
      phone: '06341-225604',
      services: 'Milk, bread, eggs, Maggie, room dustbins, buckets, LED bulbs, electric kettle.',
    ),
  ];

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

  // --- 5. College Events Directory ---
  final List<EventItem> sampleEvents = [
    const EventItem(
      id: 'event-1',
      title: 'TechnoUtsav 2026: Intra-College Hackathon',
      dateStr: 'Sat, 14 Nov 2026 • 10:00 AM',
      venue: 'Computer Science Lab 2 & Seminar Hall',
      organizer: 'CodeCraft CSE Society',
      category: 'Technical',
      seatsRemaining: 24,
    ),
    const EventItem(
      id: 'event-2',
      title: 'Shaurya Cup: Inter-Branch Cricket League',
      dateStr: 'Sun, 15 Nov 2026 • 08:30 AM',
      venue: 'College Main Sports Ground, Bajidpur',
      organizer: 'Campus Sports Committee',
      category: 'Sports',
      seatsRemaining: 18,
    ),
    const EventItem(
      id: 'event-3',
      title: 'Aarohan Cultural Festival Auditions',
      dateStr: 'Fri, 20 Nov 2026 • 04:30 PM',
      venue: 'Open Air Theatre / Main Auditorium',
      organizer: 'Natraj Dramatic Society',
      category: 'Cultural',
      seatsRemaining: 40,
    ),
  ];

  // --- 6. Clubs & Societies ---
  final List<ClubItem> sampleClubs = [
    const ClubItem(
      id: 'club-1',
      name: 'CodeCraft CSE & Dev Club',
      category: 'Technical & Coding',
      memberCount: 86,
      leadName: 'Aman Verma (CSE 4th Year)',
      leadContact: 'codecraft.gecskp@gmail.com',
      description: 'Open source development, competitive programming, web frameworks, and hackathons.',
    ),
    const ClubItem(
      id: 'club-2',
      name: 'Yantrika Robotics & Innovation Society',
      category: 'Robotics & Hardware',
      memberCount: 54,
      leadName: 'Priya Sharma (EE 3rd Year)',
      leadContact: 'robotics.gecskp@gmail.com',
      description: 'Arduino, drone prototyping, IoT campus automation, and national robotics challenges.',
    ),
    const ClubItem(
      id: 'club-3',
      name: 'Sheikhpura Sports & Athletics Association',
      category: 'Recreation & Fitness',
      memberCount: 112,
      leadName: 'Rohit Raj (Civil 4th Year)',
      leadContact: 'sports.gecskp@gmail.com',
      description: 'Coordinates annual sports meet, weekend badminton matches, and cricket league.',
    ),
  ];

  // --- 7. Sports & Squads Matches ---
  final List<SportsSquad> sportsSquads = [
    const SportsSquad(
      id: 'sp-1',
      sportName: 'Cricket',
      matchType: 'Match',
      title: 'Weekend Friendly T20 Match: 3rd Year vs 4th Year',
      dateStr: 'Sun, 1 Nov 2026 • 08:00 AM IST',
      venue: 'Bajidpur Campus Sports Ground',
      organizer: 'Rohit (ME 4th Year) • Hostel 2',
      currentPlayers: 18,
      maxPlayers: 22,
    ),
    const SportsSquad(
      id: 'sp-2',
      sportName: 'Badminton',
      matchType: 'Practice Session',
      title: 'Evening Doubles Badminton Sparring & Practice',
      dateStr: 'Fri, 30 Oct 2026 • 06:30 PM IST',
      venue: 'Boys Hostel Badminton Court',
      organizer: 'Hostel Sports Rep (Hostel Court)',
      currentPlayers: 6,
      maxPlayers: 8,
    ),
    const SportsSquad(
      id: 'sp-3',
      sportName: 'Volleyball',
      matchType: 'Team Recruitment',
      title: 'Hostel Volleyball Team Recruitment & Trials',
      dateStr: 'Mon, 2 Nov 2026 • 05:15 PM IST',
      venue: 'Volleyball Court, Near Gymnasium',
      organizer: 'Sunil (Captain) • sports.gecskp@gmail.com',
      currentPlayers: 7,
      maxPlayers: 12,
    ),
    const SportsSquad(
      id: 'sp-4',
      sportName: 'Chess & Indoor',
      matchType: 'Practice Session',
      title: 'Inter-Hostel Blitz Chess & Carrom Gathering',
      dateStr: 'Sat, 7 Nov 2026 • 07:00 PM IST',
      venue: 'Hostel 1 Indoor Recreation Room',
      organizer: 'Indoor Games Council',
      currentPlayers: 10,
      maxPlayers: 16,
    ),
  ];

  // --- 8. Lost & Found Items ---
  final List<LostFoundItem> lostFoundItems = [
    const LostFoundItem(
      id: 'lf-1',
      title: 'Lost Casio fx-991ES Plus Scientific Calculator',
      itemType: 'Lost',
      category: 'Electronics',
      location: 'Classroom 204 (after 3rd period)',
      dateStr: '28 Oct 2026',
      contactPerson: 'Aman Kumar (CSE 3rd Year)',
      contactPhone: '06341-224401',
      description: 'Black calculator with blue batch sticker on back cover. Urgent for maths internals.',
    ),
    const LostFoundItem(
      id: 'lf-2',
      title: 'Found College ID Card (Civil 2nd Year)',
      itemType: 'Found',
      category: 'Document',
      location: 'Central Library Reading Desk 4',
      dateStr: '29 Oct 2026',
      contactPerson: 'Library Security Desk',
      contactPhone: '06341-224402',
      description: 'Belongs to Roll 23CE14. Deposited with central librarian counter.',
    ),
    const LostFoundItem(
      id: 'lf-3',
      title: 'Found Room Key Bundle with Marvel Keychain',
      itemType: 'Found',
      category: 'Keys',
      location: 'Campus Canteen Entrance',
      dateStr: '30 Oct 2026',
      contactPerson: 'Canteen Cash Counter',
      contactPhone: '06341-224403',
      description: 'Set of 3 keys with Iron Man metallic ring. Claim from canteen owner.',
    ),
  ];

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
