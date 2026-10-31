import 'package:flutter/material.dart';
import '../models/models.dart';
import '../services/data_service.dart';
import '../services/navigation_service.dart';
import '../theme/app_theme.dart';

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
            Tab(text: '🏪 Shops & Laundry'),
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
                hintText: 'Search rooms, mess, xerox, transport...',
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
                ListView.builder(
                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                  itemCount: filteredRooms.length,
                  itemBuilder: (context, index) {
                    final room = filteredRooms[index];
                    final isSaved = _bookmarkedIds.contains(room.id);
                    return _buildRoomCard(context, room, isSaved);
                  },
                ),

                // 2. Food Tab
                ListView.builder(
                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                  itemCount: filteredFood.length,
                  itemBuilder: (context, index) {
                    final food = filteredFood[index];
                    final isSaved = _bookmarkedIds.contains(food.id);
                    return _buildFoodCard(context, food, isSaved);
                  },
                ),

                // 3. Shops & Laundry Tab
                ListView.builder(
                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                  itemCount: filteredShops.length,
                  itemBuilder: (context, index) {
                    final shop = filteredShops[index];
                    return _buildShopCard(context, shop, isDark, theme);
                  },
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
                const Icon(Icons.place_outlined, size: 14, color: Color(0xFF64748B)),
                const SizedBox(width: 4),
                Expanded(
                  child: Text(
                    '${room.address} • ${room.distanceToCampus}',
                    style: TextStyle(fontSize: 11, color: isDark ? const Color(0xFF94A3B8) : const Color(0xFF64748B)),
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
              children: room.amenities.map((a) {
                return Container(
                  padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                  decoration: BoxDecoration(
                    color: isDark ? const Color(0xFF1E293B) : const Color(0xFFF1F5F9),
                    borderRadius: BorderRadius.circular(4),
                  ),
                  child: Text(
                    '✓ $a',
                    style: TextStyle(fontSize: 9.5, color: isDark ? const Color(0xFFCBD5E1) : const Color(0xFF475569)),
                  ),
                );
              }).toList(),
            ),
            const SizedBox(height: 12),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                RichText(
                  text: TextSpan(
                    text: '₹${room.rentMonthly}',
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
                    const SizedBox(width: 8),
                    Row(
                      children: [
                        const Icon(Icons.star, size: 14, color: AppTheme.warningAmber),
                        const SizedBox(width: 2),
                        Text('${food.rating}', style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w700)),
                      ],
                    ),
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
