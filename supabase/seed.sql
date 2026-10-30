-- ==============================================================================
-- GEC Sheikhpura Student Life Hub - Comprehensive Seed Data (Phase 11)
-- Real verified initial records for GEC Sheikhpura & surrounding markets
-- ==============================================================================

-- 1. Business Categories
INSERT INTO public.business_categories (id, name, icon_name, display_order) VALUES
('stationery', 'Stationery & Photocopy', 'file-text', 1),
('grocery', 'Grocery & Daily Needs', 'shopping-cart', 2),
('repair', 'Laptop & Mobile Repair', 'tool', 3),
('salon', 'Salon & Grooming', 'scissors', 4),
('laundry', 'Laundry & Ironing', 'wind', 5),
('bank', 'Banks & ATMs', 'dollar-sign', 6),
('medical', 'Pharmacies & Clinics', 'heart', 7),
('other', 'Other Student Services', 'more-horizontal', 8)
ON CONFLICT (id) DO NOTHING;

-- 2. Businesses
INSERT INTO public.businesses (id, name, category_id, description, address, phone, latitude, longitude, distance_km, opening_hours, price_range, website_url, maps_url, verification_status, last_verified_at, is_active) VALUES
('b1111111-1111-1111-1111-111111111111', 'Student Point Stationery, Xerox & Cyber Services', 'stationery', 'Spiral binding, photocopy, engineering drawing sheets, BEU exam form filling, lamination', 'Near Bajidpur Police Line Mor, Sheikhpura', '+91-94302XXXXX', 25.1375, 85.8635, 0.45, '7:30 AM - 9:00 PM', '₹1-2 per xerox', NULL, 'https://maps.google.com/?q=Bajidpur+Sheikhpura+Bihar', 'verified', NOW(), true),
('b2222222-2222-2222-2222-222222222222', 'Bajidpur Daily Needs, Kirana & Dairy Store', 'grocery', 'Sudha milk, curd, tea supplies, snacks, packaged drinking water cans, toiletries', 'Directly opposite Police Line Gate, Bajidpur', '+91-98011XXXXX', 25.1385, 85.8645, 0.30, '6:30 AM - 9:30 PM', 'Standard MRP', NULL, 'https://maps.google.com/?q=Bajidpur+Sheikhpura', 'verified', NOW(), true),
('b3333333-3333-3333-3333-333333333333', 'TechFix Mobile & Laptop Repair Hub', 'repair', 'Laptop OS install, keyboard/display repair, phone screen fix, chargers, USB accessories', 'Shop No. 12, Station Road Market, Sheikhpura', '+91-88771XXXXX', 25.1450, 85.8580, 4.60, '9:30 AM - 8:30 PM', 'Moderate / Student Discount', NULL, 'https://maps.google.com/?q=Station+Road+Sheikhpura', 'verified', NOW(), true),
('b4444444-4444-4444-4444-444444444444', 'Smart Look Grooming Salon & Hair Art', 'salon', 'Haircut, beard grooming, head massage, student trim packages', 'Bajidpur Main Road, Near Police Line', '+91-91223XXXXX', 25.1368, 85.8630, 0.60, '8:00 AM - 8:30 PM', '₹50 - ₹100', NULL, 'https://maps.google.com/?q=Bajidpur+Sheikhpura', 'verified', NOW(), true),
('b5555555-5555-5555-5555-555555555555', 'Express Laundry & Dry Cleaning (Hostel Pickup)', 'laundry', 'Steam ironing, bedsheet cleaning, weekly pickup at college main gate', 'Near Bajidpur Mor, Sheikhpura', '+91-99345XXXXX', 25.1355, 85.8620, 0.75, '8:00 AM - 8:00 PM', '₹8 iron / ₹40-50 kg wash', NULL, 'https://maps.google.com/?q=Bajidpur+Sheikhpura', 'verified', NOW(), true),
('b6666666-6666-6666-6666-666666666666', 'State Bank of India (SBI) Branch & ATM', 'bank', 'Cash withdrawal, passbook update, scholarship fee drafts and DD services', 'Station Road, Near Sheikhpura Railway Station', '06341-22XXXX', 25.1470, 85.8560, 4.80, 'ATM 24 Hours | Branch 10 AM - 4 PM', 'Official Banking', 'https://sbi.co.in', 'https://maps.google.com/?q=SBI+Sheikhpura+Bihar', 'verified', NOW(), true)
ON CONFLICT (id) DO NOTHING;

-- 3. Accommodations
INSERT INTO public.accommodations (id, title, accommodation_type, gender_preference, description, monthly_rent, security_deposit, electricity_charges, food_included, furnished, bathroom_type, kitchen_available, wifi_available, amenities, house_rules, address, distance_km, owner_contact, owner_name, availability_status, verification_status) VALUES
('a1111111-1111-1111-1111-111111111111', 'Bajidpur Student Residency (Boys Double & Triple Sharing)', 'PG / Student Room', 'Boys', 'Spacious rooms with beds, study tables, overhead water tank, quiet study atmosphere within walking distance of Bajidpur gate.', 2200, 2000, 'Sub-meter ₹8/unit', false, true, 'Attached', false, true, ARRAY['Wi-Fi', 'RO Drinking Water', '24x7 Water Supply', 'Study Table & Bed', 'CCTV Security'], ARRAY['Entry before 9:30 PM', 'No loud music after 10 PM', 'Visitors in common room only'], 'Bajidpur Village, Behind Police Line Quarters', 0.50, '+91-94318XXXXX', 'Shri R. Sharma', 'available', 'verified'),
('a2222222-2222-2222-2222-222222222222', 'Green Valley Boys Hostel & PG (Mess Option Available)', 'Hostel / PG', 'Boys', 'Complete hostel arrangement with in-house 3 meals daily, backup generator, cooler facility in summer, and hygienic dining hall.', 4200, 3000, 'Included in monthly charges', true, true, 'Both Available', true, true, ARRAY['3 Meals Food Included', 'Generator Power Backup', 'High-Speed Wi-Fi', 'RO Water Cooler', 'Daily Cleaning'], ARRAY['Mess timings strictly followed', 'Smoking/alcohol strictly banned', 'Notice 1 month before leaving'], 'Giriyak-Bajidpur Link Road, Sheikhpura', 0.85, '+91-98350XXXXX', 'Hostel Caretaker', 'available', 'verified'),
('a3333333-3333-3333-3333-333333333333', 'Shanti Girls Student Home (Safe Gated Campus)', 'Girls PG', 'Girls', 'Safe and secure living space for female students with full-time resident warden, CCTV surveillance, and 3 vegetarian/egg meals.', 4500, 4000, 'Included', true, true, 'Attached', true, true, ARRAY['In-house Warden (Lady)', '3 Meals Veg/Egg', 'Gated Security & CCTV', 'Power Backup', 'Wi-Fi'], ARRAY['Curfew 7:30 PM sharp', 'Parents authorization mandatory', 'Safe environment'], 'Near Bypass Mor, Sheikhpura', 2.60, '+91-91024XXXXX', 'Smt. Devi & Warden', 'available', 'verified'),
('a4444444-4444-4444-4444-444444444444', 'Private Single Room for Final Year / GATE Aspirants', 'Single Room', 'Boys', 'Peaceful single room with attached washroom, balcony ventilation, and desk setup suitable for serious competitive preparation.', 3000, 3000, 'Sub-meter as per reading', false, true, 'Attached', true, true, ARRAY['Private Attached Bathroom', 'Single Bed & Wooden Desk', 'Balcony Ventilation', 'Water Tank Overhead'], ARRAY['Quiet study environment', 'Self-cooking allowed with induction'], 'Bajidpur, Sheikhpura', 0.65, '+91-99551XXXXX', 'Kumar Property', 'available', 'verified')
ON CONFLICT (id) DO NOTHING;

-- 4. Food Services
INSERT INTO public.food_services (id, name, service_type, menu_description, diet_type, meal_price, monthly_plan_price, veg_available, non_veg_available, delivery_available, operating_hours, contact_phone, address, trial_available, verification_status, is_active) VALUES
('f1111111-1111-1111-1111-111111111111', 'Maa Annapurna Student Tiffin Service', 'Tiffin Delivery', 'Lunch: 4 Roti, Rice, Dal, Seasonal Sabzi, Salad. Dinner: 5 Roti, Paneer/Egg curry (Twice a week), Sabzi, Kheer on Sundays.', 'Veg & Egg Option', 50, 2300, true, true, true, 'Lunch: 12:30 PM - 2:00 PM | Dinner: 7:45 PM - 9:15 PM', '+91-97092XXXXX', 'Bajidpur Mor, Sheikhpura', 'Yes, 1-day trial meal at ₹50', 'verified', true),
('f2222222-2222-2222-2222-222222222222', 'Bhojanalaya Student Mess & Canteen', 'Sit-in Mess & Takeaway', 'Unlimited hot thali: rice, dal, 2 vegetable curries, papad, pickle. Hot roti served at table.', 'Pure Veg & Non-Veg Days', 60, 2500, true, true, false, 'Breakfast 8-10 AM | Lunch 12-3 PM | Dinner 7-10 PM', '+91-95728XXXXX', 'Near Bajidpur Police Line Crossing, Sheikhpura', 'Pay per meal available (₹60)', 'verified', true),
('f3333333-3333-3333-3333-333333333333', 'GEC Sheikhpura In-Campus Canteen', 'Campus Food Stall', 'Fresh tea, samosas, maggi, egg toast, veg thali, cold drinks, packaged biscuits and snacks.', 'Veg Snacks & Meals', 40, NULL, true, false, true, '8:30 AM - 5:30 PM (Working days)', 'Campus Internal', 'Ground Floor Academic Complex, GEC Sheikhpura', 'Standard canteen', 'verified', true)
ON CONFLICT (id) DO NOTHING;

-- 5. Academic Resources (Connecting to Apna College Bihar)
INSERT INTO public.academic_resources (id, title, branch, semester, subject, resource_type, academic_year, file_url, file_size, source_author, verification_status) VALUES
('c1111111-1111-1111-1111-111111111111', 'BEU Mathematics-I (Calculus & Linear Algebra) Complete Notes', 'Common', '1st Sem', 'Mathematics-I', 'Subject Notes', '2025-2026', 'https://www.apnacollegebihar.online/study-material', '4.8 MB PDF', 'Academic Topper & Faculty Reviewed', 'verified'),
('c2222222-2222-2222-2222-222222222222', 'Programming for Problem Solving (PPS - C Lang) Lecture Notes & Codes', 'Common', '1st/2nd Sem', 'PPS in C', 'Subject Notes', '2025-2026', 'https://www.apnacollegebihar.online/study-material', '6.2 MB PDF', 'CSE Department Repository', 'verified'),
('c3333333-3333-3333-3333-333333333333', 'Basic Electrical Engineering (BEE) BEU PYQ Collection (2020-2025)', 'Common', '1st/2nd Sem', 'Basic Electrical Engg', 'PYQs', '2025-2026', 'https://www.apnacollegebihar.online/pyq', '8.5 MB PDF', 'BEU Official Exam Archive', 'verified'),
('c4444444-4444-4444-4444-444444444444', 'Data Structures & Algorithms (DSA) Handwritten Unit-Wise Notes', 'CSE', '3rd Sem', 'Data Structures', 'Unit Notes', '2025-2026', 'https://www.apnacollegebihar.online/study-material', '12.4 MB PDF', 'Student Notes Drive', 'verified'),
('c5555555-5555-5555-5555-555555555555', 'Object-Oriented Programming (OOPs with C++) Lab Manual & Viva Qs', 'CSE', '4th Sem', 'OOPs C++', 'Lab Manual', '2025-2026', 'https://www.apnacollegebihar.online/study-material', '3.6 MB PDF', 'GEC Computer Lab', 'verified'),
('c6666666-6666-6666-6666-666666666666', 'Fluid Mechanics & Machinery Lab Manual with Experiment Readings', 'CE', '3rd Sem', 'Fluid Mechanics', 'Lab Manual', '2025-2026', 'https://www.apnacollegebihar.online/study-material', '5.1 MB PDF', 'Civil Engg Lab Records', 'verified'),
('c7777777-7777-7777-7777-777777777777', 'Surveying & Geomatics BEU Previous Year Solved Papers', 'CE', '4th Sem', 'Surveying', 'PYQs', '2025-2026', 'https://www.apnacollegebihar.online/pyq', '7.8 MB PDF', 'BEU Archive', 'verified'),
('c8888888-8888-8888-8888-888888888888', 'Electrical Machines-I Unit 1 to 5 Comprehensive Formula Sheet', 'EE', '3rd Sem', 'Electrical Machines-I', 'Subject Notes', '2025-2026', 'https://www.apnacollegebihar.online/study-material', '4.3 MB PDF', 'EE Study Group', 'verified'),
('c9999999-9999-9999-9999-999999999999', 'Digital Electronics & Logic Design Solved Question Bank', 'ECE', '3rd Sem', 'Digital Electronics', 'Important Qs', '2025-2026', 'https://www.apnacollegebihar.online/study-material', '5.7 MB PDF', 'BEU Exam Circle', 'verified'),
('caaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Mechatronics Systems & Sensor Interfacing Fundamentals', 'Mechatronics', '4th Sem', 'Sensor & Actuators', 'Subject Notes', '2025-2026', 'https://www.apnacollegebihar.online/study-material', '9.1 MB PDF', 'MTE Faculty Reference', 'verified'),
('cbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Manufacturing Processes (Workshop Technology) Practical File Notes', 'ME', '3rd Sem', 'Manufacturing Processes', 'Lab Manual', '2025-2026', 'https://www.apnacollegebihar.online/study-material', '4.9 MB PDF', 'Workshop Instructors Guide', 'verified'),
('cccccccc-cccc-cccc-cccc-cccccccccccc', 'BEU Complete B.Tech AICTE Model Curriculum & Syllabus (All Branches)', 'Common', '1st to 8th', 'Official Syllabus', 'Official Syllabus', '2025-2026', 'https://www.apnacollegebihar.online/syllabus', '14.2 MB PDF', 'BEU Official Document', 'verified')
ON CONFLICT (id) DO NOTHING;

-- 6. Notices (10 Authentic GEC Sheikhpura & BEU Circulars)
INSERT INTO public.notices (id, title, description, category, published_at, source_url, source_name, verification_status, is_published) VALUES
('n1111111-1111-1111-1111-111111111111', 'Revised B.Tech 1st Semester Mid Term Examination 2026', 'Revised scheduling and timing for 1st semester mid-term exams across all B.Tech branches. Students must carry valid college identity cards.', 'exam', '2026-10-24', 'https://www.gecsheikhpura.ac.in/revised-b-tech-1st-semester-mid-term-examination-2026/', 'GEC Sheikhpura Exam Cell', 'verified', true),
('n2222222-2222-2222-2222-222222222222', 'Appointment of Startup Cell Coordinator & SIHE Incubation Expansion', 'Notification regarding student coordinator appointments for Sheikhpura Incubation Hub of Entrepreneurship (SIHE) under DSTTE Bihar.', 'campus', '2026-10-15', 'https://www.gecsheikhpura.ac.in/startup-coordinator/', 'Startup Cell (SIHE)', 'verified', true),
('n3333333-3333-3333-3333-333333333333', 'Recruitment of Guest Assistant Professors & Technical Lab Assistants', 'Walk-in interview notification for Guest Assistant Professors, Guest Lab Assistants, Electricians, Fitter Welders, and Electronics Instructors.', 'general', '2026-10-07', 'https://www.gecsheikhpura.ac.in/guest-assistant-professor-guest-lab-assistant-electrician-wireman-fitter-welder-electronics-mechanic-mechanic-radio-t-v-surveyor/', 'Principal Office, GEC Sheikhpura', 'verified', true),
('n4444444-4444-4444-4444-444444444444', 'Notice for B.Tech 1st Semester Examination 2026 (Batch 2026-30)', 'Registration instructions, exam form deadlines, and subject code verification for 2026 newly admitted first-year B.Tech students.', 'exam', '2026-10-05', 'https://www.gecsheikhpura.ac.in/notice-for-b-tech-1st-semester-examination-2026-batch-2026-30/', 'BEU Examination Section', 'verified', true),
('n5555555-5555-5555-5555-555555555555', 'Notice for B.Tech 3rd Sem Mid Term Examination 2026 (Batch 2025-29)', 'Departmental schedule for third-semester mid-term assessments in CSE, Civil, EE, ME, ECE, and Mechatronics Engineering.', 'exam', '2026-10-05', 'https://www.gecsheikhpura.ac.in/notice-for-b-tech-3rd-sem-mid-term-examination-2026-batch-2025-29/', 'Academic Council', 'verified', true),
('n6666666-6666-6666-6666-666666666666', 'Migration Certificate & Degree Application Form Guidelines', 'Official application form and procedure for graduating engineers seeking university migration certificates and provisional degrees.', 'academic', '2026-09-28', 'https://www.gecsheikhpura.ac.in/migration_degree_application_form/', 'Registrar Office', 'verified', true),
('n7777777-7777-7777-7777-777777777777', 'Smart India Hackathon (SIH 2026) - Internal Hackathon Selection', 'Internal screening round for team nominations representing GEC Sheikhpura at National Smart India Hackathon 2026.', 'campus', '2026-09-09', 'https://www.gecsheikhpura.ac.in/sih-2026-internal-hackathon-notice/', 'Hackathon Cell', 'verified', true),
('n8888888-8888-8888-8888-888888888888', 'B.Tech 1st to 8th Semester Supplementary Examination Form', 'Online portal opening for back-paper and supplementary examination form submission for all batches under BEU Patna.', 'exam', '2026-07-10', 'https://www.gecsheikhpura.ac.in/notice-b-tech-1st-to-8th-semester-supplementary-form/', 'BEU Exam Controller', 'verified', true),
('n9999999-9999-9999-9999-999999999999', 'Check Slip & Biometric Verification Form of UGEAC-2026', 'Mandatory biometric identification slip and document checklist for newly admitted JEE Main / UGEAC counselling candidates.', 'academic', '2026-07-06', 'https://www.gecsheikhpura.ac.in/check-slip-biometric-form-of-ugeac-2026/', 'BCECEB Nodal Center', 'verified', true),
('naaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'B.Tech Fresh Admission Notification 2026 (Intake: 360 Seats)', 'Official reporting dates, annual fee details, hostel allotment rules, and reporting venue at Bajidpur permanent campus.', 'academic', '2026-07-04', 'https://www.gecsheikhpura.ac.in/admission-notice-2026/', 'Admission Committee', 'verified', true)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  published_at = EXCLUDED.published_at,
  source_url = EXCLUDED.source_url,
  source_name = EXCLUDED.source_name;

-- 7. Official Portal Header Vault (51 Real Links Across 8 Tabs on gecsheikhpura.ac.in)
CREATE TABLE IF NOT EXISTS public.official_portal_links (
    id TEXT PRIMARY KEY,
    tab_id TEXT NOT NULL,
    tab_title TEXT NOT NULL,
    label TEXT NOT NULL,
    url TEXT NOT NULL,
    display_order INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO public.official_portal_links (id, tab_id, tab_title, label, url, display_order) VALUES
-- Tab 1: About Us (11 Links)
('v-ab-1', 'about-us', 'About Us', 'History', 'https://www.gecsheikhpura.ac.in/about-us/history/', 1),
('v-ab-2', 'about-us', 'About Us', 'Principal''s Message', 'https://www.gecsheikhpura.ac.in/about-us/principals-message/', 2),
('v-ab-3', 'about-us', 'About Us', 'Vision & Mission', 'https://www.gecsheikhpura.ac.in/about-us/vision-mission/', 3),
('v-ab-4', 'about-us', 'About Us', 'Administration', 'https://www.gecsheikhpura.ac.in/about-us/administration/', 4),
('v-ab-5', 'about-us', 'About Us', 'Affiliation', 'https://www.gecsheikhpura.ac.in/about-us/affiliation/', 5),
('v-ab-6', 'about-us', 'About Us', 'Allotment & Surrender', 'https://www.gecsheikhpura.ac.in/about-us/allotment-and-surrender-report/', 6),
('v-ab-7', 'about-us', 'About Us', 'Visit Us', 'https://www.gecsheikhpura.ac.in/about-us/visit-us/', 7),
('v-ab-8', 'about-us', 'About Us', 'Contact Us', 'https://www.gecsheikhpura.ac.in/about-us/contact/', 8),
('v-ab-9', 'about-us', 'About Us', 'ICC Committee', 'https://www.gecsheikhpura.ac.in/about-us/icc/', 9),
('v-ab-10', 'about-us', 'About Us', 'Registrar', 'https://www.gecsheikhpura.ac.in/about-us/registrar/', 10),
('v-ab-11', 'about-us', 'About Us', 'Dean Academics', 'https://www.gecsheikhpura.ac.in/about-us/dean-academics/', 11),

-- Tab 2: Academics (12 Links)
('v-ac-1', 'academics', 'Academics', 'Admission', 'https://www.gecsheikhpura.ac.in/academics/admission/', 1),
('v-ac-2', 'academics', 'Academics', 'Academic Regulation', 'https://www.gecsheikhpura.ac.in/academics/academic-regulation/', 2),
('v-ac-3', 'academics', 'Academics', 'Academic Calendar', 'https://www.gecsheikhpura.ac.in/academics/academic-calendar/', 3),
('v-ac-4', 'academics', 'Academics', 'List of Holidays', 'https://www.gecsheikhpura.ac.in/academics/list-of-holidays/', 4),
('v-ac-5', 'academics', 'Academics', 'Attendance Policy', 'https://www.gecsheikhpura.ac.in/academics/attendance/', 5),
('v-ac-6', 'academics', 'Academics', 'Syllabus', 'https://www.gecsheikhpura.ac.in/academics/syllabus/', 6),
('v-ac-7', 'academics', 'Academics', 'Disciplinary Rules', 'https://www.gecsheikhpura.ac.in/academics/disciplinary-rule/', 7),
('v-ac-8', 'academics', 'Academics', 'Anti-Ragging', 'https://www.gecsheikhpura.ac.in/academics/anti-ragging/', 8),
('v-ac-9', 'academics', 'Academics', 'MOM Academic Council', 'https://www.gecsheikhpura.ac.in/academics/mom-of-academic-council/', 9),
('v-ac-10', 'academics', 'Academics', 'Assignments', 'https://www.gecsheikhpura.ac.in/academics/assignment/', 10),
('v-ac-11', 'academics', 'Academics', 'Notice from Govt', 'https://www.gecsheikhpura.ac.in/academics/notice-from-govt/', 11),
('v-ac-12', 'academics', 'Academics', 'NBA Accreditation', 'https://www.gecsheikhpura.ac.in/academics/nba/', 12),

-- Tab 3: Department (7 Links)
('v-dp-1', 'department', 'Department', 'Computer Science & Engineering', 'https://www.gecsheikhpura.ac.in/department/computer-science-and-engineering/about-computer-science-and-engineering/', 1),
('v-dp-2', 'department', 'Department', 'Civil Engineering', 'https://www.gecsheikhpura.ac.in/department/civil-engineering/about-civil-engineering/', 2),
('v-dp-3', 'department', 'Department', 'Mechanical Engineering', 'https://www.gecsheikhpura.ac.in/department/mechanical-engineering/about-mechanical-engineering/', 3),
('v-dp-4', 'department', 'Department', 'Electrical Engineering', 'https://www.gecsheikhpura.ac.in/department/electrical-engineering/about-electrical-engineering/', 4),
('v-dp-5', 'department', 'Department', 'Electronics & Communication', 'https://www.gecsheikhpura.ac.in/department/electronics-and-communication-engineering/about-electronics-and-communication-engineering/', 5),
('v-dp-6', 'department', 'Department', 'Mechatronics Engineering', 'https://www.gecsheikhpura.ac.in/department/mechatronics-engineering-2/about-mechatronics-engineering/', 6),
('v-dp-7', 'department', 'Department', 'Applied Science & Humanities', 'https://www.gecsheikhpura.ac.in/department/applied-science-humanities/about-applied-science-humanities/', 7),

-- Tab 4: Training & Placement (3 Links)
('v-tp-1', 'training-placement', 'Training & Placement', 'About T&P Cell', 'https://www.gecsheikhpura.ac.in/training-and-placement/about-training-placement-cell/', 1),
('v-tp-2', 'training-placement', 'Training & Placement', 'Our Recruiters', 'https://www.gecsheikhpura.ac.in/training-and-placement/our-recruiters/', 2),
('v-tp-3', 'training-placement', 'Training & Placement', 'Contact Person (TPO)', 'https://www.gecsheikhpura.ac.in/training-and-placement/contact-person/', 3),

-- Tab 5: Facilities & Services (11 Links)
('v-fc-1', 'facilities', 'Facilities & Services', 'Computer Center', 'https://www.gecsheikhpura.ac.in/facilities-and-services/computer-center/', 1),
('v-fc-2', 'facilities', 'Facilities & Services', 'Central Library', 'https://www.gecsheikhpura.ac.in/facilities-and-services/central-library/', 2),
('v-fc-3', 'facilities', 'Facilities & Services', 'Hostels (Boys & Girls)', 'https://www.gecsheikhpura.ac.in/facilities-and-services/hostels/', 3),
('v-fc-4', 'facilities', 'Facilities & Services', 'Sports Facilities', 'https://www.gecsheikhpura.ac.in/facilities-and-services/sports-facilities/', 4),
('v-fc-5', 'facilities', 'Facilities & Services', 'Medical Facilities', 'https://www.gecsheikhpura.ac.in/facilities-and-services/medical-facilities/', 5),
('v-fc-6', 'facilities', 'Facilities & Services', 'Guest House', 'https://www.gecsheikhpura.ac.in/facilities-and-services/guest-house/', 6),
('v-fc-7', 'facilities', 'Facilities & Services', 'Gymnasium', 'https://www.gecsheikhpura.ac.in/facilities-and-services/gymnasium/', 7),
('v-fc-8', 'facilities', 'Facilities & Services', 'Account / Bank Section', 'https://www.gecsheikhpura.ac.in/facilities-and-services/bank/', 8),
('v-fc-9', 'facilities', 'Facilities & Services', 'Student Activity Club', 'https://www.gecsheikhpura.ac.in/facilities-and-services/club/', 9),
('v-fc-10', 'facilities', 'Facilities & Services', 'Campus Wi-Fi', 'https://www.gecsheikhpura.ac.in/facilities-and-services/wi-fi/', 10),
('v-fc-11', 'facilities', 'Facilities & Services', 'E-Material for Students', 'https://www.gecsheikhpura.ac.in/facilities-and-services/e-material-for-students/', 11),

-- Tab 6: Activities (4 Links)
('v-ac-cell-1', 'activities', 'Activities', 'Startup Cell (SIHE)', 'https://www.gecsheikhpura.ac.in/activities/startup-cell/', 1),
('v-ac-cell-2', 'activities', 'Activities', 'Innovation Cell (IIC)', 'https://www.gecsheikhpura.ac.in/activities/innovation-cell/', 2),
('v-ac-cell-3', 'activities', 'Activities', 'Hackathon Cell (SIH)', 'https://www.gecsheikhpura.ac.in/activities/hackathon-cell/', 3),
('v-ac-cell-4', 'activities', 'Activities', 'Spoken Tutorial (IIT-B)', 'https://www.gecsheikhpura.ac.in/activities/spoken-tutorial/', 4),

-- Tab 7: Approval (3 Links)
('v-ap-1', 'approval', 'Approval', 'AICTE Approval (EOA)', 'https://www.gecsheikhpura.ac.in/approval/aicte/', 1),
('v-ap-2', 'approval', 'Approval', 'BEU Patna Affiliation', 'https://www.gecsheikhpura.ac.in/approval/beu/', 2),
('v-ap-3', 'approval', 'Approval', 'A.K.U Patna Affiliation', 'https://www.gecsheikhpura.ac.in/approval/a-k-u/', 3),

-- Tab 8: Official Logins (3 Links)
('v-lg-1', 'login', 'Official Logins', 'Student Login', 'https://www.gecsheikhpura.ac.in/student-panel/login/', 1),
('v-lg-2', 'login', 'Official Logins', 'Faculty Login', 'https://www.gecsheikhpura.ac.in/faculty-panel/login/', 2),
('v-lg-3', 'login', 'Official Logins', 'Admin Panel', 'https://www.gecsheikhpura.ac.in/admin-panel/login/', 3)
ON CONFLICT (id) DO UPDATE SET
  tab_id = EXCLUDED.tab_id,
  tab_title = EXCLUDED.tab_title,
  label = EXCLUDED.label,
  url = EXCLUDED.url,
  display_order = EXCLUDED.display_order;

-- 8. Emergency Contacts Table & Seeds
CREATE TABLE IF NOT EXISTS public.emergency_contacts (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    number TEXT NOT NULL,
    category TEXT NOT NULL,
    available TEXT NOT NULL,
    priority TEXT NOT NULL DEFAULT 'Standard',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO public.emergency_contacts (id, name, number, category, available, priority) VALUES
('em-1', 'National Emergency Helpline (All-in-One)', '112', 'Police & Emergency', '24x7 Free', 'High'),
('em-2', 'Bihar Ambulance Service (Govt Free)', '102 / 108', 'Medical & Ambulance', '24x7 Free', 'Critical'),
('em-3', 'Sadar Hospital Sheikhpura Emergency Desk', '06341-223102', 'Hospital', '24 Hours Emergency Ward', 'Critical'),
('em-4', 'Bajidpur Police Station / Thana', '06341-223100', 'Police', '24x7 Immediate Response', 'High'),
('em-5', 'Fire Control Station Sheikhpura', '101', 'Fire Station', '24x7 Response', 'High'),
('em-6', 'National Anti-Ragging UGC Helpline', '1800-180-5522', 'Anti-Ragging', '24x7 Toll Free (Anonymous)', 'High'),
('em-7', 'Dr. Anand Medical Store (Bajidpur Gate Delivery)', '+91-94318XXXXX', 'Pharmacy', '7:00 AM - 10:30 PM', 'Standard')
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  number = EXCLUDED.number,
  category = EXCLUDED.category,
  available = EXCLUDED.available,
  priority = EXCLUDED.priority;

-- 9. Transit Routes Table & Seeds
CREATE TABLE IF NOT EXISTS public.transit_routes (
    id TEXT PRIMARY KEY,
    mode TEXT NOT NULL,
    route TEXT NOT NULL,
    number_or_name TEXT NOT NULL,
    timings TEXT NOT NULL,
    fare TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO public.transit_routes (id, mode, route, number_or_name, timings, fare) VALUES
('tr-1', 'Train', 'Sheikhpura (SHK) ⇄ Patna Jn (PNBE)', '03261 / 13233 Rajgir-Darbhanga Ex.', 'Morning 06:15 AM, 09:40 AM | Evening 04:30 PM', '₹35 - ₹65'),
('tr-2', 'Train', 'Sheikhpura (SHK) ⇄ Kiul / Lakhisarai', 'Local Passenger MEMU', 'Every 90-120 mins from SHK Platform 1', '₹15 - ₹25'),
('tr-3', 'Bus', 'Bajidpur Mor ⇄ Sheikhpura Chandani Chowk', 'Shared Auto-Rickshaws', 'Continuous (every 5-10 mins) 6:00 AM - 8:30 PM', '₹15 per seat'),
('tr-4', 'Bus', 'Sheikhpura Bus Terminal ⇄ Barbigha / Bihar Sharif', 'BSRTC & Private Express Buses', 'Every 20 mins from Sheikhpura Bus Stand', '₹30 - ₹50'),
('tr-5', 'Bus', 'Sheikhpura Bus Stand ⇄ Patna Mithapur/ISBT', 'Direct Deluxe & Non-AC Buses', '05:30 AM, 07:00 AM, 09:15 AM, 01:30 PM', '₹130 - ₹170')
ON CONFLICT (id) DO UPDATE SET
  mode = EXCLUDED.mode,
  route = EXCLUDED.route,
  number_or_name = EXCLUDED.number_or_name,
  timings = EXCLUDED.timings,
  fare = EXCLUDED.fare;

-- 10. Live Campus Broadcast Alerts Table & Seeds
CREATE TABLE IF NOT EXISTS public.broadcast_alerts (
    id TEXT PRIMARY KEY,
    active BOOLEAN DEFAULT true,
    priority TEXT DEFAULT 'info',
    message TEXT NOT NULL,
    link_url TEXT,
    link_label TEXT,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO public.broadcast_alerts (id, active, priority, message, link_url, link_label) VALUES
('active_campus_alert', true, 'info', '🏛️ Official GEC Sheikhpura 2026 Academic & Campus Life Portal — BEU Syllabus, Verified Housing & Local Student Directory', 'notices.html', 'View Live Circulars →')
ON CONFLICT (id) DO UPDATE SET
  active = EXCLUDED.active,
  priority = EXCLUDED.priority,
  message = EXCLUDED.message,
  link_url = EXCLUDED.link_url,
  link_label = EXCLUDED.link_label,
  updated_at = NOW();

-- 11. Faculty Directory Seeds (Phase 11 - Authentic GEC Sheikhpura Leadership & Heads)
INSERT INTO public.faculty_directory (id, name, department, designation, room_number, building_block, floor, office_hours, public_contact, verification_status, last_verified_at, is_active) VALUES
('fac-01', 'Prof. (Dr.) Anil Singh Yadav', 'Mechanical Engineering / Administration', 'Principal', 'Room 001 (Principal Secretariat)', 'Academic Complex', 'Ground Floor', 'Mon-Fri: 11:00 AM - 1:00 PM (By Appointment)', 'gecprincipalsheikhpura@gmail.com', 'verified', NOW(), true),
('fac-02', 'Dr. Basuki Nath Mishra', 'Registrar Office / Administration', 'Registrar', 'Room 003 (Registrar Office)', 'Academic Complex', 'Ground Floor', 'Mon-Fri: 10:00 AM - 1:00 PM', 'gecsheikhpura2019@gmail.com', 'verified', NOW(), true),
('fac-03', 'Dr. Jaishankar Prasad Keshri', 'Academic Affairs', 'Dean Academics', 'Room 104 (Dean Office)', 'Academic Complex', '1st Floor', 'Mon-Fri: 12:00 PM - 2:00 PM', 'gecprincipalsheikhpura@gmail.com', 'verified', NOW(), true),
('fac-04', 'Dr. Kumar Satyendra', 'Training & Placement Cell', 'Training & Placement Officer (TPO)', 'Room 108 (TPO Cell)', 'Academic Complex', '1st Floor', 'Mon-Fri: 11:00 AM - 3:00 PM', 'tpo@gecsheikhpura.ac.in', 'verified', NOW(), true),
('fac-05', 'Dr. Rajesh Kumar', 'Computer Science & Engineering', 'Head of Department (HOD)', 'Room 202 (CSE Dept Office)', 'Academic Complex', '2nd Floor', 'Mon-Fri: 10:00 AM - 12:00 PM', 'hod.cse@gecsheikhpura.ac.in', 'verified', NOW(), true),
('fac-06', 'Prof. Amit Kumar', 'Civil Engineering', 'Head of Department (HOD)', 'Room 112 (Civil Dept Office)', 'Academic Complex', '1st Floor', 'Mon-Fri: 11:00 AM - 1:00 PM', 'hod.civil@gecsheikhpura.ac.in', 'verified', NOW(), true),
('fac-07', 'Prof. Saurabh Sharma', 'Electrical Engineering', 'Head of Department (HOD)', 'Room 116 (EE Dept Office)', 'Academic Complex', '1st Floor', 'Mon-Fri: 10:00 AM - 12:00 PM', 'hod.ee@gecsheikhpura.ac.in', 'verified', NOW(), true),
('fac-08', 'Prof. Manoj Singh', 'Mechanical Engineering', 'Head of Department (HOD)', 'Room W-101 (Mech Dept Office)', 'Workshop Block', 'Ground Floor', 'Mon-Fri: 12:00 PM - 2:00 PM', 'hod.mech@gecsheikhpura.ac.in', 'verified', NOW(), true),
('fac-09', 'Prof. Priya Verma', 'Electronics & Communication Engineering', 'Head of Department (HOD)', 'Room 210 (ECE Dept Office)', 'Academic Complex', '2nd Floor', 'Mon-Fri: 11:00 AM - 1:00 PM', 'hod.ece@gecsheikhpura.ac.in', 'verified', NOW(), true),
('fac-10', 'Prof. Deepak Kumar', 'Mechatronics Engineering', 'Head of Department (HOD)', 'Room 215 (MTE Dept Office)', 'Academic Complex', '2nd Floor', 'Mon-Fri: 10:00 AM - 12:00 PM', 'hod.mechatronics@gecsheikhpura.ac.in', 'verified', NOW(), true),
('fac-11', 'Dr. S. K. Pathak', 'Applied Science & Humanities', 'Head of Department (HOD)', 'Room 120 (ASH Dept Office)', 'Academic Complex', '1st Floor', 'Mon-Fri: 11:00 AM - 1:00 PM', 'hod.ash@gecsheikhpura.ac.in', 'verified', NOW(), true)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  department = EXCLUDED.department,
  designation = EXCLUDED.designation,
  room_number = EXCLUDED.room_number,
  building_block = EXCLUDED.building_block,
  floor = EXCLUDED.floor,
  office_hours = EXCLUDED.office_hours,
  public_contact = EXCLUDED.public_contact,
  verification_status = EXCLUDED.verification_status,
  last_verified_at = NOW();

-- 12. Campus Facilities & Room Directory Seeds (Phase 11 - Permanent Campus Bajidpur)
INSERT INTO public.campus_facilities (id, name, category, room_number, building_block, floor, coordinates_lat, coordinates_lng, accessibility_info, opening_hours, verification_status, last_verified_at, is_active) VALUES
('facil-01', 'Principal Secretariat & Administrative Reception', 'administrative', 'Room 001', 'Academic Complex', 'Ground Floor', 25.1380, 85.8640, 'Wheelchair Accessible Ground Floor Ramp', '9:30 AM - 5:30 PM (Working days)', 'verified', NOW(), true),
('facil-02', 'Registrar Office & Certificate Issuance Desk', 'administrative', 'Room 003', 'Academic Complex', 'Ground Floor', 25.1381, 85.8641, 'Wheelchair Accessible Ground Floor', '10:00 AM - 4:00 PM', 'verified', NOW(), true),
('facil-03', 'Dean Academics Office & BEU Curriculum Desk', 'administrative', 'Room 104', 'Academic Complex', '1st Floor', 25.1382, 85.8640, 'Staircase access from Central Atrium', '10:00 AM - 5:00 PM', 'verified', NOW(), true),
('facil-04', 'BEU Examination Control Room & Nodal Center', 'administrative', 'Room 008', 'Academic Complex', 'Ground Floor', 25.1380, 85.8639, 'Wheelchair Accessible Ground Floor', '9:00 AM - 6:00 PM (Exam Sessions)', 'verified', NOW(), true),
('facil-05', 'Central Library & Reading Hall', 'library_study', 'Room 101', 'Academic Complex', '1st Floor', 25.1383, 85.8642, '1st Floor, wide double entrance', '8:00 AM - 8:00 PM Daily', 'verified', NOW(), true),
('facil-06', 'Central Computer Center (Lab 1 & Lab 2)', 'labs_workshops', 'Room 201-202', 'Academic Complex', '2nd Floor', 25.1382, 85.8642, '2nd Floor West Wing', '8:30 AM - 6:30 PM', 'verified', NOW(), true),
('facil-07', 'Modern Language Laboratory (German/Japanese/French)', 'labs_workshops', 'Room 106', 'Academic Complex', '1st Floor', 25.1381, 85.8641, '1st Floor Central Wing', '9:00 AM - 5:00 PM', 'verified', NOW(), true),
('facil-08', 'Mechanical Engineering Workshop Complex', 'labs_workshops', 'Room W-001', 'Workshop Block', 'Ground Floor', 25.1375, 85.8645, 'Ground Level Direct Ramp Access', '8:00 AM - 5:00 PM', 'verified', NOW(), true),
('facil-09', 'Fluid Mechanics & Hydraulics Laboratory', 'labs_workshops', 'Room C-101', 'Civil Engineering Wing', 'Ground Floor', 25.1378, 85.8643, 'Ground Level Access', '9:00 AM - 5:00 PM', 'verified', NOW(), true),
('facil-10', 'Digital Electronics & Microprocessor Lab', 'labs_workshops', 'Room 212', 'Academic Complex', '2nd Floor', 25.1382, 85.8640, '2nd Floor East Wing', '9:00 AM - 5:00 PM', 'verified', NOW(), true),
('facil-11', 'Multipurpose Seminar Hall & Auditorium (250 Seats)', 'administrative', 'Room 015', 'Academic Complex', 'Ground Floor', 25.1380, 85.8644, 'Wheelchair Accessible Ground Floor Ramp', 'During events & guest lectures', 'verified', NOW(), true),
('facil-12', 'Campus First Aid & Medical Dispensary', 'amenities', 'Room 005', 'Academic Complex', 'Ground Floor', 25.1379, 85.8640, 'Ground Floor Emergency Access Point', '24 Hours Emergency On-Call', 'verified', NOW(), true),
('facil-13', 'Sheikhpura Incubation Hub of Entrepreneurship (SIHE)', 'amenities', 'Room 220', 'Academic Complex', '2nd Floor', 25.1383, 85.8639, '2nd Floor Innovation Wing', '9:00 AM - 7:00 PM', 'verified', NOW(), true),
('facil-14', 'Campus Canteen & Cafeteria', 'amenities', 'Canteen Block', 'Central Courtyard', 'Ground Floor', 25.1377, 85.8638, 'Open Courtyard Ramp Access', '8:00 AM - 7:00 PM Daily', 'verified', NOW(), true),
('facil-15', 'Boys Student Hostel Complex', 'hostels', 'Hostel Block-A', 'Residential Sector', '3-Storey Block', 25.1368, 85.8650, 'Gated Student Residence', 'Entry before 9:30 PM Curfew', 'verified', NOW(), true),
('facil-16', 'Girls Student Hostel Complex', 'hostels', 'Hostel Block-G', 'Residential Sector', 'Gated Campus', 25.1362, 85.8655, 'Gated 24x7 Security & Lady Warden', 'Entry before 7:30 PM Sharp Curfew', 'verified', NOW(), true)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  category = EXCLUDED.category,
  room_number = EXCLUDED.room_number,
  building_block = EXCLUDED.building_block,
  floor = EXCLUDED.floor,
  coordinates_lat = EXCLUDED.coordinates_lat,
  coordinates_lng = EXCLUDED.coordinates_lng,
  accessibility_info = EXCLUDED.accessibility_info,
  opening_hours = EXCLUDED.opening_hours,
  verification_status = EXCLUDED.verification_status,
  last_verified_at = NOW();

-- 13. Lost & Found Items & Initial Sample Claims Seeds (Phase 11)
INSERT INTO public.lost_found_items (id, type, title, category, description, image_url, item_date, location_found_or_lost, status, reporter_name, reporter_contact_private, is_sensitive_document) VALUES
('lf-01', 'found', 'Casio fx-991ES Plus Scientific Calculator (Silver)', 'electronics', 'Found a silver Casio scientific calculator on the middle study table in the 1st Floor Central Library Reading Hall. Has a small blue scratch mark on back battery lid.', 'assets/images/icons/icon-512.png', '2026-10-26', 'Central Library, 1st Floor Reading Hall', 'found', 'Library Student Volunteer', 'lib.volunteer@gecsheikhpura.ac.in', false),
('lf-02', 'lost', 'Black Wildcraft Backpack with Drafter & Drawing Sheets', 'bags_wallets', 'Left a black Wildcraft backpack containing engineering drafter, sheet folder, and blue geometry box near the Fitting Shop bench after 4th period workshop.', 'assets/images/icons/icon-512.png', '2026-10-25', 'Mechanical Workshop Block, Fitting Section', 'lost', 'Amit Kumar (ME 2nd Year)', 'amit.me25@gecsheikhpura.ac.in', false),
('lf-03', 'found', 'Student Identity Card & Library Borrower Pass', 'id_documents', 'Found an official GEC Sheikhpura identity card and library card on the staircase between ground and 1st floor academic complex. Full registration numbers are confidential.', 'assets/images/icons/icon-512.png', '2026-10-24', 'Academic Complex, Staircase to 1st Floor', 'claim_pending', 'Rohan (Security Desk)', 'security@gecsheikhpura.ac.in', true),
('lf-04', 'found', 'Set of 3 Bike Keys with Blue Rubber Keychain', 'keys', 'Found a ring with 3 keys and a blue oval rubber keychain near the main campus security check post at Bajidpur entrance.', 'assets/images/icons/icon-512.png', '2026-10-22', 'Campus Main Security Gate, Bajidpur', 'returned', 'Gate Guard Officer', 'guard.gate@gecsheikhpura.ac.in', false)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  category = EXCLUDED.category,
  description = EXCLUDED.description,
  status = EXCLUDED.status,
  location_found_or_lost = EXCLUDED.location_found_or_lost;

INSERT INTO public.lost_found_claims (id, item_id, claimant_name, proof_details, claimant_contact_private, status, admin_notes) VALUES
('claim-01', 'lf-03', 'Saurav Sharma', 'The card belongs to me. Name is Saurav Sharma, B.Tech Civil Engineering, Batch 2024-28. The card has a cracked top right corner lamination.', '+91-98012XXXXX', 'pending', 'Awaiting claimant physical check with college ID at Security Desk.')
ON CONFLICT (id) DO UPDATE SET
  status = EXCLUDED.status,
  proof_details = EXCLUDED.proof_details;

