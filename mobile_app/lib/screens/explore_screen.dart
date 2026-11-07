import 'package:flutter/material.dart';
import '../models/models.dart';
import '../services/data_service.dart';
import '../services/auth_service.dart';
import '../services/navigation_service.dart';
import '../theme/app_theme.dart';
import 'submit_listing_screen.dart';

class ExploreScreen extends StatefulWidget {
  const ExploreScreen({super.key});

  @override
  State<ExploreScreen> createState() => _ExploreScreenState();
}

class _ExploreScreenState extends State<ExploreScreen> with SingleTickerProviderStateMixin {
  late TabController _tabController;
  final TextEditingController _searchController = TextEditingController();
  String _searchQuery = '';
  Set<String> _bookmarkedIds = {};

  @override
  void initState() {
    super.initState();
    final initialTab = NavigationService.instance.exploreSubTab.value.clamp(0, 3);
    _tabController = TabController(length: 4, vsync: this, initialIndex: initialTab);
    NavigationService.instance.exploreSubTab.addListener(_onSubTabNotified);
    _loadBookmarks();

    // Fetch initial laundry orders
    final user = AuthService.instance.currentUser.value;
    DataService.instance.fetchLiveLaundryOrders(
      studentEmail: user?.email,
      isStaffOrAdmin: user?.isAdmin ?? false,
    );
  }

  void _onSubTabNotified() {
    final target = NavigationService.instance.exploreSubTab.value.clamp(0, 3);
    if (_tabController.index != target && mounted) {
      _tabController.animateTo(target);
    }
  }

  Future<void> _loadBookmarks() async {
    final list = await DataService.instance.getBookmarkedIds();
    if (!mounted) return;
    setState(() {
      _bookmarkedIds = list.toSet();
    });
  }

  Future<void> _toggleBookmark(String id) async {
    final added = await DataService.instance.toggleBookmark(id);
    await _loadBookmarks();
    if (!mounted) return;
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(added ? 'Listing added to Saved Hub' : 'Listing removed from Saved Hub'),
        duration: const Duration(seconds: 1),
        behavior: SnackBarBehavior.floating,
      ),
    );
  }

  @override
  void dispose() {
    NavigationService.instance.exploreSubTab.removeListener(_onSubTabNotified);
    _tabController.dispose();
    _searchController.dispose();
    super.dispose();
  }

  void _showBookLaundryModal() {
    int shirts = 2;
    int pants = 2;
    int bedsheets = 1;
    int others = 0;
    String selectedHostel = 'Hostel 1';
    final roomCtrl = TextEditingController();
    final notesCtrl = TextEditingController();

    final user = AuthService.instance.currentUser.value;
    final phoneCtrl = TextEditingController(text: user?.phone ?? '');
    final nameCtrl = TextEditingController(text: user?.displayName ?? '');

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) {
        return StatefulBuilder(
          builder: (context, setModalState) {
            final isDark = Theme.of(context).brightness == Brightness.dark;
            final total = shirts + pants + bedsheets + others;

            return Container(
              padding: EdgeInsets.only(
                top: 20,
                left: 20,
                right: 20,
                bottom: MediaQuery.of(context).viewInsets.bottom + 20,
              ),
              decoration: BoxDecoration(
                color: isDark ? const Color(0xFF1E293B) : Colors.white,
                borderRadius: const BorderRadius.vertical(top: Radius.circular(24)),
              ),
              child: SingleChildScrollView(
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Center(
                      child: Container(
                        width: 40,
                        height: 4,
                        decoration: BoxDecoration(
                          color: Colors.grey.withValues(alpha: 0.3),
                          borderRadius: BorderRadius.circular(2),
                        ),
                      ),
                    ),
                    const SizedBox(height: 14),
                    const Row(
                      children: [
                        Icon(Icons.local_laundry_service, color: AppTheme.primaryNavy, size: 24),
                        SizedBox(width: 8),
                        Text(
                          'Book Laundry Clothes Pickup',
                          style: TextStyle(fontSize: 17, fontWeight: FontWeight.bold),
                        ),
                      ],
                    ),
                    const SizedBox(height: 4),
                    const Text(
                      'Enter your exact clothes count and hostel room. Data is private and only visible to authorized laundry staff.',
                      style: TextStyle(fontSize: 12, color: AppTheme.textSecondary),
                    ),
                    const SizedBox(height: 16),

                    // Clothes Counter Steppers
                    _buildCounterRow('👕 Shirts / T-Shirts', shirts, (v) => setModalState(() => shirts = v)),
                    _buildCounterRow('👖 Pants / Jeans', pants, (v) => setModalState(() => pants = v)),
                    _buildCounterRow('🛏️ Bedsheets / Blankets', bedsheets, (v) => setModalState(() => bedsheets = v)),
                    _buildCounterRow('🧦 Towels / Others', others, (v) => setModalState(() => others = v)),

                    const SizedBox(height: 8),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                      decoration: BoxDecoration(
                        color: AppTheme.primaryNavy.withValues(alpha: 0.08),
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          const Text('Total Clothes Count:', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
                          Text('$total Clothes', style: const TextStyle(fontWeight: FontWeight.w800, color: AppTheme.primaryNavy, fontSize: 14)),
                        ],
                      ),
                    ),

                    const SizedBox(height: 14),

                    // Hostel Selection
                    const Text('Hostel / Stay Location *', style: TextStyle(fontWeight: FontWeight.w600, fontSize: 12)),
                    const SizedBox(height: 6),
                    DropdownButtonFormField<String>(
                      value: selectedHostel,
                      decoration: const InputDecoration(border: OutlineInputBorder(), contentPadding: EdgeInsets.symmetric(horizontal: 12, vertical: 10)),
                      items: const [
                        DropdownMenuItem(value: 'Hostel 1', child: Text('Hostel 1 (Boys Hostel)')),
                        DropdownMenuItem(value: 'Hostel 2', child: Text('Hostel 2 (Girls Hostel)')),
                        DropdownMenuItem(value: 'Custom Stay / PG', child: Text('Outside PG / Custom Location')),
                      ],
                      onChanged: (v) => setModalState(() => selectedHostel = v ?? 'Hostel 1'),
                    ),

                    const SizedBox(height: 10),

                    // Room Number
                    TextField(
                      controller: roomCtrl,
                      decoration: const InputDecoration(
                        labelText: 'Room Number *',
                        hintText: 'e.g. Room 204 or Ground Floor 12',
                        border: OutlineInputBorder(),
                        prefixIcon: Icon(Icons.meeting_room_outlined),
                      ),
                    ),

                    const SizedBox(height: 10),

                    // Student Contact Phone
                    TextField(
                      controller: phoneCtrl,
                      keyboardType: TextInputType.phone,
                      decoration: const InputDecoration(
                        labelText: 'Contact Phone Number *',
                        hintText: '10-digit mobile number',
                        border: OutlineInputBorder(),
                        prefixIcon: Icon(Icons.phone_outlined),
                      ),
                    ),

                    const SizedBox(height: 10),

                    // Notes (optional)
                    TextField(
                      controller: notesCtrl,
                      decoration: const InputDecoration(
                        labelText: 'Special Notes / Instructions (Optional)',
                        hintText: 'e.g. Steam press for white shirt, pickup at 6 PM',
                        border: OutlineInputBorder(),
                        prefixIcon: Icon(Icons.note_alt_outlined),
                      ),
                    ),

                    const SizedBox(height: 18),

                    SizedBox(
                      width: double.infinity,
                      height: 50,
                      child: ElevatedButton(
                        style: ElevatedButton.styleFrom(
                          backgroundColor: AppTheme.primaryNavy,
                          foregroundColor: Colors.white,
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                        ),
                        onPressed: () async {
                          if (total <= 0) {
                            ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Please add at least 1 clothing item.')));
                            return;
                          }
                          if (roomCtrl.text.trim().isEmpty) {
                            ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Please enter your room number.')));
                            return;
                          }
                          if (phoneCtrl.text.trim().isEmpty) {
                            ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Please enter your contact phone.')));
                            return;
                          }

                          final newOrder = LaundryOrder(
                            id: 'lnd_${DateTime.now().millisecondsSinceEpoch}',
                            studentName: nameCtrl.text.trim().isNotEmpty ? nameCtrl.text.trim() : (user?.displayName ?? 'Student'),
                            studentEmail: user?.email ?? '',
                            studentPhone: phoneCtrl.text.trim(),
                            regNo: user?.regNo ?? '',
                            shirtsCount: shirts,
                            pantsCount: pants,
                            bedsheetsCount: bedsheets,
                            othersCount: others,
                            totalClothes: total,
                            roomNo: roomCtrl.text.trim(),
                            hostelName: selectedHostel,
                            notes: notesCtrl.text.trim(),
                            status: 'Pending Pickup',
                            createdAt: DateTime.now().toIso8601String(),
                          );

                          await DataService.instance.submitLaundryOrder(newOrder);

                          if (ctx.mounted) Navigator.pop(ctx);
                          if (mounted) {
                            setState(() {});
                            ScaffoldMessenger.of(context).showSnackBar(
                              const SnackBar(
                                content: Text('✓ Laundry pickup scheduled! Laundry manager has been notified.'),
                                backgroundColor: AppTheme.successGreen,
                              ),
                            );
                          }
                        },
                        child: const Text('Confirm Laundry Pickup Request', style: TextStyle(fontSize: 15, fontWeight: FontWeight.bold)),
                      ),
                    ),
                  ],
                ),
              ),
            );
          },
        );
      },
    );
  }

  Widget _buildCounterRow(String label, int value, ValueChanged<int> onChanged) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label, style: const TextStyle(fontSize: 13.5, fontWeight: FontWeight.w600)),
          Row(
            children: [
              IconButton(
                icon: const Icon(Icons.remove_circle_outline, size: 22, color: AppTheme.primaryNavy),
                onPressed: value > 0 ? () => onChanged(value - 1) : null,
              ),
              Container(
                constraints: const BoxConstraints(minWidth: 28),
                alignment: Alignment.center,
                child: Text('$value', style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w800)),
              ),
              IconButton(
                icon: const Icon(Icons.add_circle_outline, size: 22, color: AppTheme.primaryNavy),
                onPressed: () => onChanged(value + 1),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildEmptyState({
    required BuildContext context,
    required String title,
    required String subtitle,
    required IconData icon,
    bool showAddButton = true,
  }) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    return Center(
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 40),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                color: isDark ? const Color(0xFF1E293B) : const Color(0xFFF1F5F9),
                shape: BoxShape.circle,
              ),
              child: Icon(icon, size: 48, color: AppTheme.accentSky),
            ),
            const SizedBox(height: 16),
            Text(
              title,
              textAlign: TextAlign.center,
              style: TextStyle(
                fontSize: 16,
                fontWeight: FontWeight.w700,
                color: isDark ? Colors.white : AppTheme.primaryNavy,
              ),
            ),
            const SizedBox(height: 6),
            Text(
              subtitle,
              textAlign: TextAlign.center,
              style: const TextStyle(fontSize: 12.5, color: AppTheme.textSecondary, height: 1.4),
            ),
            if (showAddButton) ...[
              const SizedBox(height: 18),
              ElevatedButton.icon(
                onPressed: () {
                  Navigator.push(context, MaterialPageRoute(builder: (_) => const SubmitListingScreen()));
                },
                icon: const Icon(Icons.add, size: 18),
                label: const Text('Post a Listing', style: TextStyle(fontWeight: FontWeight.w700)),
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppTheme.primaryNavy,
                  foregroundColor: Colors.white,
                  padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 11),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                ),
              ),
            ],
          ],
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;

    final q = _searchQuery.toLowerCase();

    final filteredRooms = DataService.instance.sampleRooms.where((r) {
      return q.isEmpty ||
          r.title.toLowerCase().contains(q) ||
          r.address.toLowerCase().contains(q) ||
          r.roomType.toLowerCase().contains(q);
    }).toList();

    final filteredFood = DataService.instance.sampleFood.where((f) {
      return q.isEmpty ||
          f.name.toLowerCase().contains(q) ||
          f.serviceType.toLowerCase().contains(q) ||
          f.menuSummary.toLowerCase().contains(q);
    }).toList();

    final filteredShops = DataService.instance.sampleShops.where((s) {
      return q.isEmpty ||
          s.name.toLowerCase().contains(q) ||
          s.category.toLowerCase().contains(q) ||
          s.services.toLowerCase().contains(q);
    }).toList();

    final filteredRoutes = DataService.instance.transportRoutes.where((t) {
      return q.isEmpty ||
          t.from.toLowerCase().contains(q) ||
          t.to.toLowerCase().contains(q) ||
          t.mode.toLowerCase().contains(q);
    }).toList();

    final user = AuthService.instance.currentUser.value;
    final isStaffOrAdmin = user?.isAdmin ?? false;
    final laundryOrders = isStaffOrAdmin
        ? DataService.instance.allLaundryOrders
        : DataService.instance.studentLaundryOrders;

    return Scaffold(
      appBar: AppBar(
        title: const Text('Marketplace & Living Hub'),
        bottom: TabBar(
          controller: _tabController,
          isScrollable: true,
          tabAlignment: TabAlignment.start,
          labelColor: isDark ? AppTheme.accentLight : AppTheme.primaryBlue,
          unselectedLabelColor: isDark ? const Color(0xFF94A3B8) : const Color(0xFF64748B),
          indicatorColor: AppTheme.accentSky,
          indicatorWeight: 3,
          labelStyle: const TextStyle(fontWeight: FontWeight.w700, fontSize: 12.5),
          tabs: const [
            Tab(text: '🏠 Rooms & PGs'),
            Tab(text: '🍱 Food & Tiffin'),
            Tab(text: '🧺 Laundry & Shops'),
            Tab(text: '🚌 Transport Routes'),
          ],
        ),
      ),
      body: Column(
        children: [
          // Search Bar
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 12, 16, 8),
            child: TextField(
              controller: _searchController,
              onChanged: (val) => setState(() => _searchQuery = val),
              decoration: InputDecoration(
                hintText: 'Search rooms, mess, laundry, transport...',
                hintStyle: TextStyle(
                  fontSize: 12,
                  color: isDark ? const Color(0xFF64748B) : const Color(0xFF94A3B8),
                ),
                prefixIcon: const Icon(Icons.search, size: 20),
                suffixIcon: _searchQuery.isNotEmpty
                    ? IconButton(
                        icon: const Icon(Icons.clear, size: 18),
                        onPressed: () {
                          _searchController.clear();
                          setState(() => _searchQuery = '');
                        },
                      )
                    : null,
                filled: true,
                fillColor: isDark ? const Color(0xFF1E293B) : Colors.white,
                contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                border: OutlineInputBorder(borderRadius: BorderRadius.circular(10)),
              ),
            ),
          ),

          Expanded(
            child: TabBarView(
              controller: _tabController,
              children: [
                // 1. Rooms Tab
                filteredRooms.isEmpty
                    ? _buildEmptyState(
                        context: context,
                        title: 'No Rooms or PGs Listed Yet',
                        subtitle: 'Listings added via Admin Panel or student submissions will appear here instantly.',
                        icon: Icons.hotel_outlined,
                      )
                    : ListView.builder(
                        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                        itemCount: filteredRooms.length,
                        itemBuilder: (context, index) {
                          final room = filteredRooms[index];
                          final isSaved = _bookmarkedIds.contains(room.id);
                          return _buildRoomCard(context, room, isSaved);
                        },
                      ),

                // 2. Food Tab
                filteredFood.isEmpty
                    ? _buildEmptyState(
                        context: context,
                        title: 'No Food & Tiffin Services Listed Yet',
                        subtitle: 'Verified hostel mess and tiffin services will be shown here once posted.',
                        icon: Icons.restaurant_outlined,
                      )
                    : ListView.builder(
                        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                        itemCount: filteredFood.length,
                        itemBuilder: (context, index) {
                          final food = filteredFood[index];
                          final isSaved = _bookmarkedIds.contains(food.id);
                          return _buildFoodCard(context, food, isSaved);
                        },
                      ),

                // 3. Laundry & Shops Tab (Student Clothes Pickup + Shops)
                ListView(
                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                  children: [
                    // Campus Laundry Card
                    Container(
                      padding: const EdgeInsets.all(16),
                      decoration: BoxDecoration(
                        gradient: LinearGradient(
                          colors: isDark
                              ? [const Color(0xFF1E293B), const Color(0xFF0F172A)]
                              : [const Color(0xFFEFF6FF), const Color(0xFFDBEAFE)],
                        ),
                        borderRadius: BorderRadius.circular(16),
                        border: Border.all(
                          color: isDark ? Colors.blue.withValues(alpha: 0.3) : const Color(0xFF93C5FD),
                          width: 1.5,
                        ),
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            children: [
                              Container(
                                padding: const EdgeInsets.all(8),
                                decoration: BoxDecoration(
                                  color: AppTheme.primaryNavy,
                                  borderRadius: BorderRadius.circular(10),
                                ),
                                child: const Icon(Icons.local_laundry_service, color: Colors.white, size: 20),
                              ),
                              const SizedBox(width: 10),
                              const Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text(
                                      'Hostel Laundry & Ironing Pickup',
                                      style: TextStyle(fontSize: 15, fontWeight: FontWeight.bold),
                                    ),
                                    Text(
                                      'Doorstep pickup for Hostel 1 & 2',
                                      style: TextStyle(fontSize: 11.5, color: AppTheme.textSecondary),
                                    ),
                                  ],
                                ),
                              ),
                            ],
                          ),
                          const SizedBox(height: 12),
                          const Text(
                            'Add your clothes count (shirts, pants, bedsheets) and room number. Only authorized laundry staff sees your order.',
                            style: TextStyle(fontSize: 12, height: 1.4),
                          ),
                          const SizedBox(height: 14),
                          SizedBox(
                            width: double.infinity,
                            child: ElevatedButton.icon(
                              onPressed: _showBookLaundryModal,
                              icon: const Icon(Icons.add, size: 18),
                              label: const Text('Book Laundry Pickup Now', style: TextStyle(fontWeight: FontWeight.bold)),
                              style: ElevatedButton.styleFrom(
                                backgroundColor: AppTheme.primaryNavy,
                                foregroundColor: Colors.white,
                                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),

                    const SizedBox(height: 16),

                    // Active Laundry Bookings Section
                    if (laundryOrders.isNotEmpty) ...[
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Text(
                            isStaffOrAdmin ? 'All Student Orders (Staff View)' : 'Your Laundry Requests',
                            style: const TextStyle(fontSize: 14, fontWeight: FontWeight.bold),
                          ),
                          Text(
                            '${laundryOrders.length} active',
                            style: const TextStyle(fontSize: 12, color: AppTheme.textSecondary),
                          ),
                        ],
                      ),
                      const SizedBox(height: 8),
                      ...laundryOrders.map((order) => _buildLaundryOrderCard(context, order, isStaffOrAdmin)),
                      const SizedBox(height: 16),
                    ],

                    // Nearby Shops Header
                    const Text('Nearby Student Shops & Xerox', style: TextStyle(fontSize: 14, fontWeight: FontWeight.bold)),
                    const SizedBox(height: 8),

                    if (filteredShops.isEmpty)
                      Container(
                        padding: const EdgeInsets.all(16),
                        decoration: BoxDecoration(
                          color: isDark ? const Color(0xFF1E293B) : Colors.white,
                          borderRadius: BorderRadius.circular(12),
                          border: Border.all(color: theme.dividerColor),
                        ),
                        child: const Center(
                          child: Text(
                            'No shops listed yet. Add via Admin Panel or tap Submit Listing.',
                            style: TextStyle(fontSize: 12, color: AppTheme.textSecondary),
                          ),
                        ),
                      )
                    else
                      ...filteredShops.map((shop) => _buildShopCard(context, shop, isDark, theme)),
                  ],
                ),

                // 4. Transport Routes Tab
                ListView.builder(
                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                  itemCount: filteredRoutes.length,
                  itemBuilder: (context, index) {
                    final route = filteredRoutes[index];
                    return _buildTransportCard(context, route, isDark, theme);
                  },
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildLaundryOrderCard(BuildContext context, LaundryOrder order, bool isStaff) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    Color badgeColor = const Color(0xFFD97706);
    if (order.status == 'In Wash') badgeColor = const Color(0xFF2563EB);
    if (order.status == 'Delivered') badgeColor = const Color(0xFF059669);

    return Card(
      margin: const EdgeInsets.only(bottom: 10),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      child: Padding(
        padding: const EdgeInsets.all(12),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  'Order #${order.id.length > 6 ? order.id.substring(order.id.length - 6) : order.id}',
                  style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13, fontFamily: 'monospace'),
                ),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                  decoration: BoxDecoration(
                    color: badgeColor.withValues(alpha: 0.12),
                    borderRadius: BorderRadius.circular(6),
                  ),
                  child: Text(
                    order.status,
                    style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: badgeColor),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 6),
            Row(
              children: [
                const Icon(Icons.location_on, size: 14, color: AppTheme.accentSky),
                const SizedBox(width: 4),
                Text(
                  '${order.hostelName} • ${order.roomNo}',
                  style: const TextStyle(fontSize: 12.5, fontWeight: FontWeight.w600),
                ),
              ],
            ),
            const SizedBox(height: 6),
            Text(
              '👕 ${order.shirtsCount} Shirts  |  👖 ${order.pantsCount} Pants  |  🛏️ ${order.bedsheetsCount} Bedsheets${order.othersCount > 0 ? '  |  🧦 ${order.othersCount} Others' : ''}',
              style: TextStyle(
                fontSize: 12,
                color: isDark ? const Color(0xFFCBD5E1) : const Color(0xFF334155),
                fontWeight: FontWeight.w500,
              ),
            ),
            if (isStaff) ...[
              const SizedBox(height: 6),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text('Student: ${order.studentName} (${order.studentPhone})', style: const TextStyle(fontSize: 11, color: AppTheme.textSecondary)),
                  PopupMenuButton<String>(
                    child: const Text('Update Status ▾', style: TextStyle(fontSize: 11, color: AppTheme.primaryBlue, fontWeight: FontWeight.bold)),
                    onSelected: (val) async {
                      await DataService.instance.updateLaundryOrderStatus(order.id, val);
                      setState(() {});
                    },
                    itemBuilder: (_) => const [
                      PopupMenuItem(value: 'Pending Pickup', child: Text('Pending Pickup')),
                      PopupMenuItem(value: 'In Wash', child: Text('In Wash')),
                      PopupMenuItem(value: 'Ironing / Ready', child: Text('Ironing / Ready')),
                      PopupMenuItem(value: 'Delivered', child: Text('Delivered')),
                    ],
                  ),
                ],
              ),
            ],
          ],
        ),
      ),
    );
  }

  Widget _buildRoomCard(BuildContext context, RoomListing room, bool isSaved) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;

    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      child: Padding(
        padding: const EdgeInsets.all(14),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                  decoration: BoxDecoration(
                    color: AppTheme.accentSky.withValues(alpha: 0.1),
                    borderRadius: BorderRadius.circular(4),
                  ),
                  child: Text(
                    room.roomType,
                    style: const TextStyle(fontSize: 10.5, fontWeight: FontWeight.w700, color: AppTheme.accentSky),
                  ),
                ),
                IconButton(
                  icon: Icon(
                    isSaved ? Icons.bookmark : Icons.bookmark_border,
                    color: isSaved ? AppTheme.accentSky : const Color(0xFF94A3B8),
                    size: 22,
                  ),
                  onPressed: () => _toggleBookmark(room.id),
                  padding: EdgeInsets.zero,
                  constraints: const BoxConstraints(),
                ),
              ],
            ),
            const SizedBox(height: 6),
            Text(
              room.title,
              style: TextStyle(
                fontSize: 14.5,
                fontWeight: FontWeight.w700,
                color: isDark ? Colors.white : AppTheme.primaryNavy,
              ),
            ),
            const SizedBox(height: 4),
            Row(
              children: [
                const Icon(Icons.location_on_outlined, size: 13, color: Color(0xFF64748B)),
                const SizedBox(width: 4),
                Expanded(
                  child: Text(
                    '${room.distanceToCampus} • ${room.address}',
                    style: const TextStyle(fontSize: 11, color: Color(0xFF64748B)),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 8),
            Wrap(
              spacing: 6,
              runSpacing: 4,
              children: room.amenities
                  .take(3)
                  .map(
                    (a) => Container(
                      padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                      decoration: BoxDecoration(
                        color: isDark ? const Color(0xFF334155) : const Color(0xFFF1F5F9),
                        borderRadius: BorderRadius.circular(4),
                      ),
                      child: Text(
                        a,
                        style: TextStyle(
                          fontSize: 10,
                          color: isDark ? const Color(0xFFCBD5E1) : const Color(0xFF475569),
                        ),
                      ),
                    ),
                  )
                  .toList(),
            ),
            const SizedBox(height: 12),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                RichText(
                  text: TextSpan(
                    text: '₹${room.rentMonthly}',
                    style: TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.w800,
                      color: isDark ? Colors.white : AppTheme.primaryNavy,
                    ),
                    children: [
                      TextSpan(
                        text: ' /month',
                        style: TextStyle(
                          fontSize: 11,
                          fontWeight: FontWeight.w500,
                          color: isDark ? const Color(0xFF94A3B8) : const Color(0xFF64748B),
                        ),
                      ),
                    ],
                  ),
                ),
                ElevatedButton.icon(
                  onPressed: () => DataService.instance.callPhoneNumber(room.phone),
                  icon: const Icon(Icons.call, size: 15),
                  label: const Text('Call Owner'),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppTheme.primaryBlue,
                    foregroundColor: Colors.white,
                    padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                    textStyle: const TextStyle(fontSize: 12, fontWeight: FontWeight.w700),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildFoodCard(BuildContext context, FoodService food, bool isSaved) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;

    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      child: Padding(
        padding: const EdgeInsets.all(14),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                      decoration: BoxDecoration(
                        color: AppTheme.successGreen.withValues(alpha: 0.1),
                        borderRadius: BorderRadius.circular(4),
                      ),
                      child: Text(
                        food.serviceType,
                        style: const TextStyle(fontSize: 10.5, fontWeight: FontWeight.w700, color: AppTheme.successGreen),
                      ),
                    ),
                    if (food.rating > 0) ...[
                      const SizedBox(width: 8),
                      Row(
                        children: [
                          const Icon(Icons.star, size: 14, color: AppTheme.warningAmber),
                          const SizedBox(width: 2),
                          Text('${food.rating}', style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w700)),
                        ],
                      ),
                    ],
                  ],
                ),
                IconButton(
                  icon: Icon(
                    isSaved ? Icons.bookmark : Icons.bookmark_border,
                    color: isSaved ? AppTheme.accentSky : const Color(0xFF94A3B8),
                    size: 22,
                  ),
                  onPressed: () => _toggleBookmark(food.id),
                  padding: EdgeInsets.zero,
                  constraints: const BoxConstraints(),
                ),
              ],
            ),
            const SizedBox(height: 6),
            Text(
              food.name,
              style: TextStyle(fontSize: 14.5, fontWeight: FontWeight.w700, color: isDark ? Colors.white : AppTheme.primaryNavy),
            ),
            const SizedBox(height: 4),
            Text(
              food.menuSummary,
              style: TextStyle(fontSize: 11.5, color: isDark ? const Color(0xFF94A3B8) : const Color(0xFF64748B), height: 1.4),
            ),
            const SizedBox(height: 12),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                RichText(
                  text: TextSpan(
                    text: '₹${food.monthlyCharge}',
                    style: TextStyle(fontSize: 16, fontWeight: FontWeight.w800, color: isDark ? Colors.white : AppTheme.primaryNavy),
                    children: [
                      TextSpan(
                        text: ' /month',
                        style: TextStyle(fontSize: 11, fontWeight: FontWeight.w500, color: isDark ? const Color(0xFF94A3B8) : const Color(0xFF64748B)),
                      ),
                    ],
                  ),
                ),
                ElevatedButton.icon(
                  onPressed: () => DataService.instance.callPhoneNumber(food.phone),
                  icon: const Icon(Icons.call, size: 15),
                  label: const Text('Contact Mess'),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppTheme.primaryBlue,
                    foregroundColor: Colors.white,
                    padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                    textStyle: const TextStyle(fontSize: 12, fontWeight: FontWeight.w700),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildShopCard(BuildContext context, NearbyShop shop, bool isDark, ThemeData theme) {
    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      child: Padding(
        padding: const EdgeInsets.all(14),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                  decoration: BoxDecoration(
                    color: AppTheme.accentSky.withValues(alpha: 0.1),
                    borderRadius: BorderRadius.circular(4),
                  ),
                  child: Text(
                    shop.category,
                    style: const TextStyle(fontSize: 10, fontWeight: FontWeight.w700, color: AppTheme.accentSky),
                  ),
                ),
                Row(
                  children: [
                    const Icon(Icons.access_time, size: 12, color: Color(0xFF64748B)),
                    const SizedBox(width: 4),
                    Text(shop.timing, style: const TextStyle(fontSize: 10.5, color: Color(0xFF64748B))),
                  ],
                ),
              ],
            ),
            const SizedBox(height: 6),
            Text(
              shop.name,
              style: TextStyle(fontSize: 14, fontWeight: FontWeight.w700, color: isDark ? Colors.white : AppTheme.primaryNavy),
            ),
            const SizedBox(height: 4),
            Row(
              children: [
                const Icon(Icons.location_on_outlined, size: 13, color: Color(0xFF64748B)),
                const SizedBox(width: 4),
                Text(shop.location, style: const TextStyle(fontSize: 11, color: Color(0xFF64748B))),
              ],
            ),
            const SizedBox(height: 6),
            Text(
              shop.services,
              style: TextStyle(fontSize: 11.5, color: isDark ? const Color(0xFFCBD5E1) : const Color(0xFF475569), height: 1.4),
            ),
            const SizedBox(height: 10),
            ElevatedButton.icon(
              onPressed: () => DataService.instance.callPhoneNumber(shop.phone),
              icon: const Icon(Icons.call, size: 14),
              label: const Text('Call Shop / Store'),
              style: ElevatedButton.styleFrom(
                backgroundColor: isDark ? const Color(0xFF1E293B) : const Color(0xFFF1F5F9),
                foregroundColor: isDark ? Colors.white : AppTheme.primaryNavy,
                elevation: 0,
                minimumSize: const Size(double.infinity, 36),
                textStyle: const TextStyle(fontSize: 11.5, fontWeight: FontWeight.w700),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(6), side: BorderSide(color: theme.dividerColor)),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildTransportCard(BuildContext context, TransportRoute route, bool isDark, ThemeData theme) {
    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      child: Padding(
        padding: const EdgeInsets.all(14),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                  decoration: BoxDecoration(
                    color: AppTheme.accentSky.withValues(alpha: 0.1),
                    borderRadius: BorderRadius.circular(4),
                  ),
                  child: Text(
                    route.mode,
                    style: const TextStyle(fontSize: 10, fontWeight: FontWeight.w700, color: AppTheme.accentSky),
                  ),
                ),
                Text(
                  route.fare,
                  style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w800, color: AppTheme.successGreen),
                ),
              ],
            ),
            const SizedBox(height: 8),
            Row(
              children: [
                const Icon(Icons.trip_origin, size: 14, color: AppTheme.primaryBlue),
                const SizedBox(width: 6),
                Expanded(
                  child: Text(
                    route.from,
                    style: TextStyle(fontSize: 12.5, fontWeight: FontWeight.w700, color: isDark ? Colors.white : AppTheme.primaryNavy),
                  ),
                ),
              ],
            ),
            Padding(
              padding: const EdgeInsets.only(left: 6),
              child: Container(width: 2, height: 12, color: const Color(0xFF94A3B8)),
            ),
            Row(
              children: [
                const Icon(Icons.place, size: 14, color: AppTheme.dangerRed),
                const SizedBox(width: 6),
                Expanded(
                  child: Text(
                    route.to,
                    style: TextStyle(fontSize: 12.5, fontWeight: FontWeight.w700, color: isDark ? Colors.white : AppTheme.primaryNavy),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 8),
            Text(
              '${route.frequency} • ${route.firstLastTiming}',
              style: TextStyle(fontSize: 11, color: isDark ? const Color(0xFF94A3B8) : const Color(0xFF64748B)),
            ),
            const SizedBox(height: 2),
            Text(
              route.landmark,
              style: TextStyle(fontSize: 10.5, fontStyle: FontStyle.italic, color: isDark ? const Color(0xFF64748B) : const Color(0xFF94A3B8)),
            ),
          ],
        ),
      ),
    );
  }
}
