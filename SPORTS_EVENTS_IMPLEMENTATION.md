# GEC Sheikhpura – Sports & Events Management System
## Production Implementation Architecture & Technical Specification

---

### 1. Executive Summary

The **GEC Sheikhpura Sports & Events Management System** is a production-grade sports, esports, tournament, student events, and cultural competition platform integrated into the **GEC Sheikhpura Student Life Hub**.

It delivers real-time functionality across four core operational modules:
- **Module A: Student Events Management** (Creation, multi-role committee, permissions, tasks, circulars, RSVPs)
- **Module B: Sports & Squad Management** (Dynamic sport rules, Cricket/Kabaddi/Basketball squads, team approvals)
- **Module C: Tournament & Match Management** (Mandatory manual scheduling, authoritative match clock, sport-specific scoring, tie-breakers, isolated standings)
- **Module D: Cultural Competitions Management** (10 official literary, artistic, and oratory events, multi-criteria weighted judge scoring, podium rankings)
- **Core Security & RBAC Infrastructure** (Root Super Admin `pk3334238@gmail.com`, granular module permissions, student phone/ID masking)

---

### 2. Feature-to-File Implementation Matrix

| Module | Feature | Implementation Files |
| :--- | :--- | :--- |
| **Database** | Complete 25+ Tables DDL, RLS, Indexes | [`supabase/schema_sports_events.sql`](file:///c:/Users/princ/OneDrive/Pictures/Desktop/my%20poject/beu%20all%20unofficaial%20college/gec%20sheikhpura/supabase/schema_sports_events.sql) |
| **Backend API** | 31 REST Endpoints, State Machine, RBAC | [`server/sports_events_router.js`](file:///c:/Users/princ/OneDrive/Pictures/Desktop/my%20poject/beu%20all%20unofficaial%20college/gec%20sheikhpura/server/sports_events_router.js), [`server/server.js`](file:///c:/Users/princ/OneDrive/Pictures/Desktop/my%20poject/beu%20all%20unofficaial%20college/gec%20sheikhpura/server/server.js) |
| **Mobile Models** | Strongly-typed Dart entity classes | [`mobile_app/lib/models/sports_events_models.dart`](file:///c:/Users/princ/OneDrive/Pictures/Desktop/my%20poject/beu%20all%20unofficaial%20college/gec%20sheikhpura/mobile_app/lib/models/sports_events_models.dart) |
| **Mobile Service**| API Client & Local Caching Singleton | [`mobile_app/lib/services/sports_events_service.dart`](file:///c:/Users/princ/OneDrive/Pictures/Desktop/my%20poject/beu%20all%20unofficaial%20college/gec%20sheikhpura/mobile_app/lib/services/sports_events_service.dart) |
| **Mobile Hub** | 5-Tab Master Hub (Events, Live, Squads, Points, Fest) | [`mobile_app/lib/screens/sports_events_dashboard_screen.dart`](file:///c:/Users/princ/OneDrive/Pictures/Desktop/my%20poject/beu%20all%20unofficaial%20college/gec%20sheikhpura/mobile_app/lib/screens/sports_events_dashboard_screen.dart) |
| **Events UI** | Event Details, Rules & RSVPs | [`mobile_app/lib/screens/event_details_screen.dart`](file:///c:/Users/princ/OneDrive/Pictures/Desktop/my%20poject/beu%20all%20unofficaial%20college/gec%20sheikhpura/mobile_app/lib/screens/event_details_screen.dart) |
| **Create Event** | Student Event Creator & Head Assignment | [`mobile_app/lib/screens/create_event_screen.dart`](file:///c:/Users/princ/OneDrive/Pictures/Desktop/my%20poject/beu%20all%20unofficaial%20college/gec%20sheikhpura/mobile_app/lib/screens/create_event_screen.dart) |
| **Event Head Desk**| Management Team, Perms, Circulars, Tasks | [`mobile_app/lib/screens/event_head_dashboard_screen.dart`](file:///c:/Users/princ/OneDrive/Pictures/Desktop/my%20poject/beu%20all%20unofficaial%20college/gec%20sheikhpura/mobile_app/lib/screens/event_head_dashboard_screen.dart) |
| **Team Register** | Adaptive Squad Builder (Cricket/Kabaddi/Athletics) | [`mobile_app/lib/screens/team_registration_screen.dart`](file:///c:/Users/princ/OneDrive/Pictures/Desktop/my%20poject/beu%20all%20unofficaial%20college/gec%20sheikhpura/mobile_app/lib/screens/team_registration_screen.dart) |
| **Scheduler** | Manual Match Scheduling & Pairing | [`mobile_app/lib/screens/match_scheduler_screen.dart`](file:///c:/Users/princ/OneDrive/Pictures/Desktop/my%20poject/beu%20all%20unofficaial%20college/gec%20sheikhpura/mobile_app/lib/screens/match_scheduler_screen.dart) |
| **Live Match** | Authoritative Timer, Live Scoring, Tie-Breakers | [`mobile_app/lib/screens/live_match_screen.dart`](file:///c:/Users/princ/OneDrive/Pictures/Desktop/my%20poject/beu%20all%20unofficaial%20college/gec%20sheikhpura/mobile_app/lib/screens/live_match_screen.dart) |
| **Points Tables** | Strictly Separate Sport Standings & Podium | [`mobile_app/lib/screens/points_tables_screen.dart`](file:///c:/Users/princ/OneDrive/Pictures/Desktop/my%20poject/beu%20all%20unofficaial%20college/gec%20sheikhpura/mobile_app/lib/screens/points_tables_screen.dart) |
| **Cultural Fest** | 10 Official Categories & Judge Scoring | [`mobile_app/lib/screens/cultural_competitions_screen.dart`](file:///c:/Users/princ/OneDrive/Pictures/Desktop/my%20poject/beu%20all%20unofficaial%20college/gec%20sheikhpura/mobile_app/lib/screens/cultural_competitions_screen.dart) |
| **Web Client** | Modern Vanilla JS API Client | [`assets/js/sports-events.js`](file:///c:/Users/princ/OneDrive/Pictures/Desktop/my%20poject/beu%20all%20unofficaial%20college/gec%20sheikhpura/assets/js/sports-events.js) |
| **Web Portal** | Campus Community & Sports Integration | [`community.html`](file:///c:/Users/princ/OneDrive/Pictures/Desktop/my%20poject/beu%20all%20unofficaial%20college/gec%20sheikhpura/community.html) |
| **Admin Desks** | Staff Permissions, Fixtures, Laundry Management | [`admin.html`](file:///c:/Users/princ/OneDrive/Pictures/Desktop/my%20poject/beu%20all%20unofficaial%20college/gec%20sheikhpura/admin.html) |

---

### 3. Detailed Specifications by Module

#### MODULE A: Student Events Management
- **Verified Creation:** Only verified GEC students can initialize an event. The creator is registered as `Event Head`.
- **Management Committee & Granular RBAC:**
  - Roles: Co-Head, Coordinator, Technical Manager, Sports Manager, Registration Manager, Finance Manager, Media Manager, Volunteer.
  - Granular permissions: `view_participants`, `manage_registrations`, `update_schedules`, `upload_documents`, `publish_announcements`, `manage_tasks`.
- **Authoritative Updates:** Realtime publishing of announcements, schedule revisions, guidelines documents, and logistics tasks.

#### MODULE B: Sports & Squad Management
- **Configurable Sport Rules:**
  - Sport-specific squad boundaries:
    - Cricket: Min squad 11, Max squad 16, Playing XI 11, Substitutes 5. Player roles: Batsman, Bowler, All-Rounder, Wicketkeeper. Batting hand: Right Hand, Left Hand. Bowling style: Right-arm medium/fast/spin, Left-arm medium/fast/spin.
    - Kabaddi: 7 on-court players, 5 substitutes. Player roles: Raider, Defender, All-Rounder.
    - Basketball: 5 on-court players, 7 substitutes. Roles: Point Guard, Shooting Guard, Small Forward, Power Forward, Center.
    - Athletics: Individual participants, seed mark, attempt metrics.
- **Organizer Verification:** Squad submissions enter `submitted` status and must be approved by the GEC Sports Committee before inclusion in official match scheduling.

#### MODULE C: Tournament & Match Management
- **Manual Match Scheduling (Mandatory Standard):**
  - No random or automatic pairings. Organizers explicitly select Tournament, Sport, Stage, Team A, Team B, Date, Start Time, Venue, Referee Name, and Official Scorekeeper.
- **Authoritative Match Timer:**
  - Centralized timer state (`period`, `is_running`, `elapsed_seconds`, `period_duration_seconds`) synchronized between referee, scorekeeper, and spectators. Supports Kabaddi 20m + 20m halves with 30s raid countdown.
- **Sport-Specific Live Scoring:**
  - Cricket: Dot, Runs (+1, +2, +3), Boundaries (4, 6), Extras (Wide, No Ball, Bye, Leg Bye), Wickets.
  - Kabaddi: Touch Point (+1), Super Raid (+2), Tackle Point (+1), Super Tackle (+2), All-Out (+2).
- **Audited Tie-Breaker Resolution:**
  - Dedicated procedure: Super Over (Cricket), Golden Raid (Kabaddi), Penalty Shootout (Football), Extra Time (Basketball). Organizer records authority email and justification.
- **Strictly Isolated Points Tables:**
  - Standings are strictly isolated per sport (Cricket never mixes with Kabaddi or Athletics).
  - Cricket: Pos, Team, Played, Won, Lost, Tied, No Result, Points (Win = 2, Tie/NR = 1), Net Run Rate (NRR).
  - Kabaddi: Pos, Team, Played, Won, Lost, Drawn, Points, Score Difference.

#### MODULE D: Cultural Competitions Management
- **10 Official Categories:**
  1. Poetry Writing
  2. Group Discussion
  3. Extempore
  4. Essay Writing (English)
  5. Essay Writing (Hindi)
  6. Story Writing (English)
  7. Story Writing (Hindi)
  8. Debate
  9. Rangoli
  10. Painting
- **Multi-Criteria Weighted Judge Scoring:**
  - Content & Depth: 40 points
  - Delivery & Expression: 30 points
  - Creativity & Originality: 30 points
  - Total composite: 100 points
- **Podium & Rankings:**
  - Verification and publication of 1st (Gold), 2nd (Silver), and 3rd (Bronze) ranks with official scores.

---

### 4. Privacy & Access Control Specification

1. **Root Super Admin:** `pk3334238@gmail.com` (Prince Kumar) holds permanent, immutable master authority.
2. **Granular Staff Roles:** Super Admin can grant module-specific permissions:
   - `laundry`: Laundry staff can ONLY see and manage laundry pickup requests.
   - `sports`: Scorekeepers can only record scores and manage timers for their assigned matches.
   - `events`: Event heads can only administer their created events and committee.
3. **Data Protection:** Student phone numbers and institutional registration numbers are masked (`maskStudentData`) for public/unauthorized API requests.

---

### 5. Automated Verification & Status

- **Supabase Database Schema:** Validated & applied (`schema_sports_events.sql`).
- **Node.js Express Router:** 31 routes verified operational.
- **Flutter Mobile App:** 0 compiler errors across all new screens and services.
- **APK & Web Compilation:** Split-per-abi Android release and Web production build verified.
