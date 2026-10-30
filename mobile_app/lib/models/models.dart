class RoomListing {
  final String id;
  final String title;
  final String roomType; // Single, Double, 1BHK, PG
  final int rentMonthly;
  final String distanceToCampus;
  final String address;
  final List<String> amenities;
  final String phone;
  final bool isVerified;
  final bool depositRequired;

  const RoomListing({
    required this.id,
    required this.title,
    required this.roomType,
    required this.rentMonthly,
    required this.distanceToCampus,
    required this.address,
    required this.amenities,
    required this.phone,
    this.isVerified = true,
    this.depositRequired = false,
  });
}

class FoodService {
  final String id;
  final String name;
  final String serviceType; // Tiffin Mess, Restaurant, Snacks
  final int monthlyCharge;
  final bool deliveryAvailable;
  final String menuSummary;
  final String phone;
  final double rating;

  const FoodService({
    required this.id,
    required this.name,
    required this.serviceType,
    required this.monthlyCharge,
    required this.deliveryAvailable,
    required this.menuSummary,
    required this.phone,
    required this.rating,
  });
}

class NearbyShop {
  final String id;
  final String name;
  final String category; // Stationery & Xerox, Grocery, Pharmacy, Laundry
  final String location;
  final String timing;
  final String phone;
  final String services;

  const NearbyShop({
    required this.id,
    required this.name,
    required this.category,
    required this.location,
    required this.timing,
    required this.phone,
    required this.services,
  });
}

class TransportRoute {
  final String id;
  final String from;
  final String to;
  final String mode; // Auto Rickshaw, Train, Bus
  final String fare;
  final String frequency;
  final String firstLastTiming;
  final String landmark;

  const TransportRoute({
    required this.id,
    required this.from,
    required this.to,
    required this.mode,
    required this.fare,
    required this.frequency,
    required this.firstLastTiming,
    required this.landmark,
  });
}

class EventItem {
  final String id;
  final String title;
  final String dateStr;
  final String venue;
  final String organizer;
  final String category; // Technical, Sports, Cultural
  final int seatsRemaining;
  final bool isRsvpOpen;

  const EventItem({
    required this.id,
    required this.title,
    required this.dateStr,
    required this.venue,
    required this.organizer,
    required this.category,
    required this.seatsRemaining,
    this.isRsvpOpen = true,
  });
}

class ClubItem {
  final String id;
  final String name;
  final String category;
  final int memberCount;
  final String leadName;
  final String leadContact;
  final String description;

  const ClubItem({
    required this.id,
    required this.name,
    required this.category,
    required this.memberCount,
    required this.leadName,
    required this.leadContact,
    required this.description,
  });
}

class SportsSquad {
  final String id;
  final String sportName;
  final String matchType; // Match, Practice Session, Team Recruitment
  final String title;
  final String dateStr;
  final String venue;
  final String organizer;
  final int currentPlayers;
  final int maxPlayers;

  const SportsSquad({
    required this.id,
    required this.sportName,
    required this.matchType,
    required this.title,
    required this.dateStr,
    required this.venue,
    required this.organizer,
    required this.currentPlayers,
    required this.maxPlayers,
  });
}

class LostFoundItem {
  final String id;
  final String title;
  final String itemType; // Lost or Found
  final String category; // Calculator, Electronics, Document, Keys, Other
  final String location;
  final String dateStr;
  final String contactPerson;
  final String contactPhone;
  final String description;

  const LostFoundItem({
    required this.id,
    required this.title,
    required this.itemType,
    required this.category,
    required this.location,
    required this.dateStr,
    required this.contactPerson,
    required this.contactPhone,
    required this.description,
  });
}

class CampusNotice {
  final String id;
  final String title;
  final String category; // University, Administration, Examination, Scholarship
  final String dateStr;
  final String authority;
  final String description;
  final bool isUrgent;

  const CampusNotice({
    required this.id,
    required this.title,
    required this.category,
    required this.dateStr,
    required this.authority,
    required this.description,
    this.isUrgent = false,
  });
}

class CutoffRecord {
  final String branch;
  final String category;
  final int openingRank;
  final int closingRank;

  const CutoffRecord({
    required this.branch,
    required this.category,
    required this.openingRank,
    required this.closingRank,
  });
}

class EmergencyContact {
  final String title;
  final String number;
  final String subtitle;
  final String category;

  const EmergencyContact({
    required this.title,
    required this.number,
    required this.subtitle,
    required this.category,
  });
}

class LegalDoc {
  final String id;
  final String title;
  final String icon;
  final String summary;
  final String fullContent;

  const LegalDoc({
    required this.id,
    required this.title,
    required this.icon,
    required this.summary,
    required this.fullContent,
  });
}

class UserModel {
  final String uid;
  final String displayName;
  final String email;
  final String? photoUrl;
  final String branch;
  final String batchYear;
  final String rollNo;
  final String phone;
  final String provider;
  final bool isVerified;
  final bool isAdmin;
  final String createdAt;

  const UserModel({
    required this.uid,
    required this.displayName,
    required this.email,
    this.photoUrl,
    required this.branch,
    required this.batchYear,
    required this.rollNo,
    required this.phone,
    required this.provider,
    this.isVerified = true,
    this.isAdmin = false,
    required this.createdAt,
  });

  Map<String, dynamic> toMap() {
    return {
      'uid': uid,
      'displayName': displayName,
      'email': email,
      'photoUrl': photoUrl,
      'branch': branch,
      'batchYear': batchYear,
      'rollNo': rollNo,
      'phone': phone,
      'provider': provider,
      'isVerified': isVerified,
      'isAdmin': isAdmin,
      'createdAt': createdAt,
    };
  }

  factory UserModel.fromMap(Map<String, dynamic> map) {
    final email = map['email'] as String? ?? '';
    final isExplicitAdmin = map['isAdmin'] as bool?;
    final isAdminUser = isExplicitAdmin ??
        (email.trim().toLowerCase() == 'prince86944@gmail.com' ||
            email.trim().toLowerCase().contains('admin'));

    return UserModel(
      uid: map['uid'] as String,
      displayName: map['displayName'] as String? ?? 'Student',
      email: email,
      photoUrl: map['photoUrl'] as String?,
      branch: map['branch'] as String? ?? 'Computer Science (CSE)',
      batchYear: map['batchYear'] as String? ?? '2023-2027',
      rollNo: map['rollNo'] as String? ?? '23CSE01',
      phone: map['phone'] as String? ?? '',
      provider: map['provider'] as String? ?? 'firebase',
      isVerified: map['isVerified'] as bool? ?? true,
      isAdmin: isAdminUser,
      createdAt: map['createdAt'] as String? ?? DateTime.now().toIso8601String(),
    );
  }
}

