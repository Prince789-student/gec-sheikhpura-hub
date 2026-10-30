# GEC Sheikhpura Student Life Hub

> **Independent, Unofficial Student Life & Academic Portal for Government Engineering College (GEC) Sheikhpura, Bihar**  
> Affiliated with Bihar Engineering University (BEU), Patna • Approved by AICTE, New Delhi

---

## 1. Project Overview

**GEC Sheikhpura Student Life Hub** is an unofficial, publicly accessible, mobile-first web portal built to simplify the college journey for students, freshers, parents, and visitors of Government Engineering College, Sheikhpura.

The platform provides:
- **Verified College Information:** Permanent campus details at Bajidpur (Near Police Line), 6 engineering branches (CSE, CE, EE, ME, ECE, Mechatronics), infrastructure, and official contacts.
- **B.Tech & Lateral Entry Admissions:** Step-by-step UGEAC guidance, BCECE-LE lateral entry flow, comprehensive document checklist, fee structures, and Bihar Student Credit Card (MNSSBY) 4 Lakh financing.
- **Academic Resource Centre:** Searchable and filterable library for BEU syllabus PDFs, handwritten notes, unit-wise summaries, previous year question papers (PYQs), and lab manuals.
- **Local Directory ("Explore Nearby"):** Verified stationery shops, photocopying/binding, supermarkets, computer/laptop repairs, salons, laundry, and ATMs around Bajidpur and Sheikhpura town.
- **Accommodation Board:** Rooms, PGs, and hostels with verified rent, security deposits, distance from Bajidpur campus gate, amenities, and student anti-fraud safety warnings.
- **Food & Tiffin Services:** Tiffin delivery to campus/hostel, student mess subscriptions, breakfast stalls, and trial meal details.
- **Transport Directory:** Sheikhpura Railway Station (SHK) trains, bus stands (Patna, Bihar Sharif, Nawada, Barbigha), local e-rickshaw fares, and bicycle/bike maintenance shops.
- **Medical & Emergency Services:** 24x7 hotlines (112, 108, 181, 102), Sadar Hospital Sheikhpura casualty details, and 24-hour pharmacies.
- **Student Tools Suite:**
  1. **BEU SGPA Calculator:** Official Bihar Engineering University 10-point credit scale with 1st-year syllabus preset loader.
  2. **BEU CGPA Calculator:** Multi-semester credit-weighted GPA calculation with AICTE percentage conversion.
  3. **Monthly Student Expense Planner:** Living cost tracker tailored to Sheikhpura student budgets.
  4. **Room-Rent Comparison Tool:** Side-by-side accommodation matrix.
  5. **Pomodoro Focus Timer:** 25m focus / 5m break timer with Web Audio API chime.
  6. **BEU Exam Countdown:** Live countdown to university exams.
- **My Hub (Offline Bookmarks):** Save notes, rooms, and shops to browser `localStorage` without login or tracking.

---

## 2. Technology Stack & Architecture

- **Core Technologies:** HTML5, Vanilla CSS3, Vanilla JavaScript (ES6+).
- **Data Architecture:** Modular, frozen JSON store (`assets/js/data.js`) designed for zero-dependency static execution and seamless future migration to Supabase/Firebase.
- **Design System:** Strictly compliant with the **Hallmark Anti-AI-Slop** and **UI/UX Pro Max** systems:
  - Locked CSS Custom Properties (`--color-primary-900`, `--font-display`, `--color-accent`).
  - Roman headings only (`font-style: normal`).
  - Dark and Light mode toggle with persistent `localStorage` memory.
  - Mobile-first responsiveness with `overflow-x: clip`, `minmax(0, 1fr)` grids, and touch targets ≥ 44×44px.
  - Zero fake statistics, real verified dates, and honest copy.

---

## 3. Directory Structure

```
gec sheikhpura/
├── index.html              # Homepage with global search, notices, and quick access
├── college-info.html       # History, BEU affiliation, departments, labs, facilities
├── admissions.html         # UGEAC counselling, BCECE-LE, checklist, fees, MNSSBY loan
├── academics.html          # Searchable library: notes, syllabus, PYQs, lab manuals
├── explore-nearby.html     # Local shops, stationery, cyber cafes, repairs, banks
├── rooms-pg.html           # Accommodation marketplace with safety warnings
├── food-tiffin.html        # Mess subscriptions, tiffin delivery, campus canteen
├── transport.html          # Sheikhpura Railway Station (SHK), bus routes, auto fares
├── emergency.html          # Sadar Hospital, 24/7 pharmacies, 112/108 helplines
├── student-tools.html      # SGPA, CGPA, expense tracker, room comparison, timer
├── placement.html          # T&P guidance, mandatory BEU internships, coding roadmap
├── notices.html            # Verified BEU examination circulars & scholarship notices
├── saved-items.html        # My Hub: bookmarked notes, shortlisted rooms & shops
├── contact.html            # Peer submissions, note uploads, and correction reporting
├── assets/
│   ├── css/
│   │   ├── style.css       # Core design tokens, light/dark themes, navigation
│   │   └── components.css  # Academic cards, directory cards, calculators, tables
│   ├── js/
│   │   ├── data.js         # Primary structured dataset (frozen JSON store)
│   │   ├── app.js          # Theme switcher, drawer nav, search, bookmarks, toasts
│   │   ├── academic.js     # Academic resource filters and preview controller
│   │   ├── directory.js    # Shops, rooms, and food directory controller
│   │   └── tools.js        # SGPA/CGPA, expense, timer, and countdown logic
│   └── images/
│       └── logo.svg        # Custom academic crest & engineering gear vector logo
└── README.md
```

---

## 4. Running & Deployment

### Running Locally
No build tools, bundlers, or `npm install` required.
1. Open the project folder in any modern browser (e.g., double-click `index.html` or open via VS Code Live Server).
2. All interactive features (SGPA calculator, Pomodoro timer, search, theme switch, bookmarks) work directly out of the box.

### Deploying to GitHub Pages
1. Initialize Git in the `gec sheikhpura` directory:
   ```bash
   git init
   git add .
   git commit -m "Initial commit: GEC Sheikhpura Student Life Hub"
   ```
2. Create a repository on GitHub (e.g. `gec-sheikhpura-hub`).
3. Link and push:
   ```bash
   git remote add origin https://github.com/<your-username>/gec-sheikhpura-hub.git
   git branch -M main
   git push -u origin main
   ```
4. Go to **Settings** → **Pages** → Source: **Deploy from a branch** → Branch: **main** / **(root)** → Save.
5. Your site is live instantly with HTTPS!

---

## 5. Architectural Separation: Apna College Bihar & GEC Sheikhpura Hub

A mandatory design and system architectural principle divides the digital student ecosystem into two clear, non-duplicative platforms:

### Platform A: Apna College Bihar
- **URL:** [https://www.apnacollegebihar.online/](https://www.apnacollegebihar.online/)
- **Core Domain:** Dedicated educational & academic learning platform.
- **Scope:**
  - AICTE model curriculum, official BEU syllabus PDFs.
  - Semester handwritten toppers' notes and unit-wise summaries.
  - Previous Year Questions (PYQs) and solved question banks.
  - Educational video lectures and study groups.
  - Academic mentorship programs, study timers, and revision planning.
  - Learning progress and academic performance tracking.
- *Strict Rule:* GEC Sheikhpura Student Life Hub never rebuilds, duplicates, or stores study progress or notes archives. All academic study inquiries are directly routed to Apna College Bihar with the designated prompt:
  > *“Ye study resources Apna College Bihar par available hain. Complete academic platform visit karein.”*

### Platform B: GEC Sheikhpura Student Life Hub
- **Core Domain:** Everyday student life beyond studying.
- **Scope:**
  - Verified local shops, stationery, cyber cafes, and laptop/mobile repairs.
  - Room rentals, PGs, and student lodges around Bajidpur campus with safety warnings.
  - Mess subscriptions, tiffin delivery, and food stalls.
  - Local transport (auto rickshaw fares, Sheikhpura station trains, bus schedules).
  - Medical directory (Sadar Hospital 24x7 casualty, pharmacies).
  - Private monthly living-expense planner.
  - Side-by-side room comparison matrix.
  - Campus announcements and notices board.

---

## 6. Phase 3: Student Accounts & Personalized Dashboard

- **Optional Student Accounts (`login.html`):**
  - Email registration, login, logout, password recovery, session persistence.
  - Independent accounts for saving local services and managing living budgets. Not shared Apna College Bihar accounts.
  - Visitors can browse 100% of public listings without creating an account.
- **Personalized Student Dashboard (`dashboard.html`):**
  - **Welcome & Shortcuts:** Student name, branch, semester, batch badge, and preferred services.
  - **Cross-Device Bookmarking:** Cloud persistence in `saved_items` table with offline `localStorage` fallback.
  - **Private Living-Expense Planner:** Interactive calculator for rent, food, electricity, transit, stationery, mobile recharge, and personal needs with secure profile persistence.
  - **Life Preferences:** Tailor preferred accommodation type, budget range, and local market categories.
  - **Community Submissions & Correction Reports:** Track student feedback tickets.
  - **Apna College Bihar Card:** Prominent direct study handoff section.
- **Database Architecture (`supabase/`):**
  - `schema.sql` (Phase 2 core listings and moderation tables).
  - `schema_phase3.sql` (Profiles, preferences, saved items, private expenses, and strict Row Level Security policies).

---

## 7. Disclaimer

This website is an independent, student-run informational platform. It is **not** affiliated with, operated by, or endorsed by the administration of Government Engineering College Sheikhpura, the Department of Science, Technology and Technical Education (Govt. of Bihar), or Bihar Engineering University (BEU), Patna. Academic study resources are powered by [Apna College Bihar](https://www.apnacollegebihar.online/).

