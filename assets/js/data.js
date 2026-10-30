/**
 * GEC Sheikhpura Student Life Hub - Primary Data Store
 * Modular, verified, and community-maintained JSON structures.
 * Primary sources: gecsheikhpura.ac.in, beu-bih.ac.in, local surveys.
 */

const HUB_DATA = {
  meta: {
    collegeName: "Government Engineering College, Sheikhpura",
    shortName: "GEC Sheikhpura",
    university: "Bihar Engineering University (BEU), Patna",
    established: 2019,
    governingBody: "Department of Science, Technology and Technical Education, Govt. of Bihar",
    campusLocation: "At: Bajidpur, Near Police Line, P.O. – Sheikhpura, District – Sheikhpura, Bihar – 811105",
    coordinates: { lat: 25.1380, lng: 85.8640 },
    officialSite: "https://www.gecsheikhpura.ac.in/",
    beuSite: "https://beu-bih.ac.in/",
    officialEmails: ["gecprincipalsheikhpura@gmail.com", "gecsheikhpura2019@gmail.com"],
    officialPhones: ["+91-7783822790", "+91-6204141910"],
    lastUpdated: "October 2026",
    isUnofficial: true
  },

  branches: [
    {
      id: "cse",
      name: "Computer Science & Engineering",
      code: "CSE",
      intake: 60,
      description: "Focusing on software development, algorithms, artificial intelligence, database engineering, and modern cloud infrastructure.",
      labs: ["Programming Lab (Linux/C/Python)", "Database & Web Tech Lab", "Networking & OS Lab", "Project & AI Lab"]
    },
    {
      id: "ce",
      name: "Civil Engineering",
      code: "CE",
      intake: 60,
      description: "Core discipline covering structural analysis, geotechnical engineering, surveying, hydrology, and transportation systems.",
      labs: ["Strength of Materials Lab", "Surveying & Geomatics Lab", "Geotechnical & Soil Mechanics Lab", "Concrete & Transportation Lab"]
    },
    {
      id: "ee",
      name: "Electrical Engineering",
      code: "EE",
      intake: 60,
      description: "Dedicated to power generation, transmission systems, electrical machines, control systems, and power electronics.",
      labs: ["Electrical Machines Lab", "Power Systems Lab", "Control Systems Lab", "Basic Electrical Lab"]
    },
    {
      id: "me",
      name: "Mechanical Engineering",
      code: "ME",
      intake: 60,
      description: "Emphasizing thermodynamics, fluid machinery, machine design, CAD/CAM modeling, and advanced manufacturing.",
      labs: ["Central Mechanical Workshop", "Fluid Mechanics & Machinery Lab", "Heat Transfer & IC Engines Lab", "CAD/CAM Simulation Lab"]
    },
    {
      id: "ece",
      name: "Electronics & Communication Engineering",
      code: "ECE",
      intake: 60,
      description: "Encompassing digital signal processing, VLSI design, wireless communication, microprocessors, and embedded systems.",
      labs: ["Digital Electronics Lab", "Communication Systems Lab", "Microprocessor & Embedded Systems Lab", "Analog Circuits Lab"]
    },
    {
      id: "mechatronics",
      name: "Mechatronics Engineering",
      code: "MTE",
      intake: 60,
      description: "Interdisciplinary branch integrating mechanical engineering, electronics, robotics, sensors, and intelligent automation.",
      labs: ["Robotics & Automation Lab", "Sensors & Actuators Lab", "PLC & Industrial Instrumentation Lab", "Mechatronic Simulation Lab"]
    }
  ],

  academics: [
    {
      id: "ac-01",
      title: "BEU Mathematics-I (Calculus & Linear Algebra) Complete Notes",
      branch: "Common",
      semester: "1st Sem",
      subject: "Mathematics-I",
      type: "Subject Notes",
      uploadDate: "Oct 2026",
      verified: true,
      source: "Academic Topper & Faculty Reviewed",
      downloadUrl: "#download-math1",
      fileSize: "4.8 MB PDF"
    },
    {
      id: "ac-02",
      title: "Programming for Problem Solving (PPS - C Lang) Lecture Notes & Codes",
      branch: "Common",
      semester: "1st/2nd Sem",
      subject: "PPS in C",
      type: "Subject Notes",
      uploadDate: "Oct 2026",
      verified: true,
      source: "CSE Department Repository",
      downloadUrl: "#download-pps",
      fileSize: "6.2 MB PDF"
    },
    {
      id: "ac-03",
      title: "Basic Electrical Engineering (BEE) BEU PYQ Collection (2020-2025)",
      branch: "Common",
      semester: "1st/2nd Sem",
      subject: "Basic Electrical Engg",
      type: "PYQs",
      uploadDate: "Sep 2026",
      verified: true,
      source: "BEU Official Exam Archive",
      downloadUrl: "#download-bee-pyq",
      fileSize: "8.5 MB PDF"
    },
    {
      id: "ac-04",
      title: "Data Structures & Algorithms (DSA) Handwritten Unit-Wise Notes",
      branch: "CSE",
      semester: "3rd Sem",
      subject: "Data Structures",
      type: "Unit Notes",
      uploadDate: "Oct 2026",
      verified: true,
      source: "Student Notes Drive",
      downloadUrl: "#download-dsa",
      fileSize: "12.4 MB PDF"
    },
    {
      id: "ac-05",
      title: "Object-Oriented Programming (OOPs with C++) Lab Manual & Viva Qs",
      branch: "CSE",
      semester: "4th Sem",
      subject: "OOPs C++",
      type: "Lab Manual",
      uploadDate: "Oct 2026",
      verified: true,
      source: "GEC Computer Lab",
      downloadUrl: "#download-oops-lab",
      fileSize: "3.6 MB PDF"
    },
    {
      id: "ac-06",
      title: "Fluid Mechanics & Machinery Lab Manual with Experiment Readings",
      branch: "CE",
      semester: "3rd Sem",
      subject: "Fluid Mechanics",
      type: "Lab Manual",
      uploadDate: "Sep 2026",
      verified: true,
      source: "Civil Engg Lab Records",
      downloadUrl: "#download-fm-lab",
      fileSize: "5.1 MB PDF"
    },
    {
      id: "ac-07",
      title: "Surveying & Geomatics BEU Previous Year Solved Papers",
      branch: "CE",
      semester: "4th Sem",
      subject: "Surveying",
      type: "PYQs",
      uploadDate: "Sep 2026",
      verified: true,
      source: "BEU Archive",
      downloadUrl: "#download-surveying-pyq",
      fileSize: "7.8 MB PDF"
    },
    {
      id: "ac-08",
      title: "Electrical Machines-I Unit 1 to 5 Comprehensive Formula Sheet",
      branch: "EE",
      semester: "3rd Sem",
      subject: "Electrical Machines-I",
      type: "Subject Notes",
      uploadDate: "Oct 2026",
      verified: true,
      source: "EE Study Group",
      downloadUrl: "#download-em1-notes",
      fileSize: "4.3 MB PDF"
    },
    {
      id: "ac-09",
      title: "Digital Electronics & Logic Design Solved Question Bank",
      branch: "ECE",
      semester: "3rd Sem",
      subject: "Digital Electronics",
      type: "Important Qs",
      uploadDate: "Oct 2026",
      verified: true,
      source: "BEU Exam Circle",
      downloadUrl: "#download-de-bank",
      fileSize: "5.7 MB PDF"
    },
    {
      id: "ac-10",
      title: "Mechatronics Systems & Sensor Interfacing Fundamentals",
      branch: "Mechatronics",
      semester: "4th Sem",
      subject: "Sensor & Actuators",
      type: "Subject Notes",
      uploadDate: "Oct 2026",
      verified: true,
      source: "MTE Faculty Reference",
      downloadUrl: "#download-mechatronics-notes",
      fileSize: "9.1 MB PDF"
    },
    {
      id: "ac-11",
      title: "Manufacturing Processes (Workshop Technology) Practical File Notes",
      branch: "ME",
      semester: "3rd Sem",
      subject: "Manufacturing Processes",
      type: "Lab Manual",
      uploadDate: "Sep 2026",
      verified: true,
      source: "Workshop Instructors Guide",
      downloadUrl: "#download-workshop-notes",
      fileSize: "4.9 MB PDF"
    },
    {
      id: "ac-12",
      title: "BEU Complete B.Tech AICTE Model Curriculum & Syllabus (All Branches)",
      branch: "Common",
      semester: "1st to 8th",
      subject: "Official Syllabus",
      type: "Syllabus",
      uploadDate: "Oct 2026",
      verified: true,
      source: "BEU Official Document",
      downloadUrl: "#download-beu-syllabus",
      fileSize: "14.2 MB PDF"
    }
  ],

  notices: [
    {
      id: "not-01",
      title: "Revised B.Tech 1st Semester Mid Term Examination 2026",
      category: "examination",
      date: "24 Oct, 2026",
      source: "GEC Sheikhpura Exam Cell",
      summary: "Revised scheduling and timing for 1st semester mid-term exams across all B.Tech branches. Students must carry valid college identity cards.",
      link: "https://www.gecsheikhpura.ac.in/revised-b-tech-1st-semester-mid-term-examination-2026/",
      verified: true
    },
    {
      id: "not-02",
      title: "Appointment of Startup Cell Coordinator & SIHE Incubation Expansion",
      category: "activities",
      date: "15 Oct, 2026",
      source: "Startup Cell (SIHE)",
      summary: "Notification regarding student coordinator appointments for Sheikhpura Incubation Hub of Entrepreneurship (SIHE) under DSTTE Bihar.",
      link: "https://www.gecsheikhpura.ac.in/startup-coordinator/",
      verified: true
    },
    {
      id: "not-03",
      title: "Recruitment of Guest Assistant Professors & Technical Lab Assistants",
      category: "recruitment",
      date: "07 Oct, 2026",
      source: "Principal Office, GEC Sheikhpura",
      summary: "Walk-in interview notification for Guest Assistant Professors, Guest Lab Assistants, Electricians, Fitter Welders, and Electronics Instructors.",
      link: "https://www.gecsheikhpura.ac.in/guest-assistant-professor-guest-lab-assistant-electrician-wireman-fitter-welder-electronics-mechanic-mechanic-radio-t-v-surveyor/",
      verified: true
    },
    {
      id: "not-04",
      title: "Notice for B.Tech 1st Semester Examination 2026 (Batch 2026-30)",
      category: "examination",
      date: "05 Oct, 2026",
      source: "BEU Examination Section",
      summary: "Registration instructions, exam form deadlines, and subject code verification for 2026 newly admitted first-year B.Tech students.",
      link: "https://www.gecsheikhpura.ac.in/notice-for-b-tech-1st-semester-examination-2026-batch-2026-30/",
      verified: true
    },
    {
      id: "not-05",
      title: "Notice for B.Tech 3rd Sem Mid Term Examination 2026 (Batch 2025-29)",
      category: "examination",
      date: "05 Oct, 2026",
      source: "Academic Council",
      summary: "Departmental schedule for third-semester mid-term assessments in CSE, Civil, EE, ME, ECE, and Mechatronics Engineering.",
      link: "https://www.gecsheikhpura.ac.in/notice-for-b-tech-3rd-sem-mid-term-examination-2026-batch-2025-29/",
      verified: true
    },
    {
      id: "not-06",
      title: "Migration Certificate & Degree Application Form Guidelines",
      category: "academic",
      date: "28 Sep, 2026",
      source: "Registrar Office",
      summary: "Official application form and procedure for graduating engineers seeking university migration certificates and provisional degrees.",
      link: "https://www.gecsheikhpura.ac.in/migration_degree_application_form/",
      verified: true
    },
    {
      id: "not-07",
      title: "Smart India Hackathon (SIH 2026) - Internal Hackathon Selection",
      category: "hackathon",
      date: "09 Sep, 2026",
      source: "Hackathon Cell",
      summary: "Internal screening round for team nominations representing GEC Sheikhpura at National Smart India Hackathon 2026.",
      link: "https://www.gecsheikhpura.ac.in/sih-2026-internal-hackathon-notice/",
      verified: true
    },
    {
      id: "not-08",
      title: "B.Tech 1st to 8th Semester Supplementary Examination Form",
      category: "examination",
      date: "10 Jul, 2026",
      source: "BEU Exam Controller",
      summary: "Online portal opening for back-paper and supplementary examination form submission for all batches under BEU Patna.",
      link: "https://www.gecsheikhpura.ac.in/notice-b-tech-1st-to-8th-semester-supplementary-form/",
      verified: true
    },
    {
      id: "not-09",
      title: "Check Slip & Biometric Verification Form of UGEAC-2026",
      category: "admission",
      date: "06 Jul, 2026",
      source: "BCECEB Nodal Center",
      summary: "Mandatory biometric identification slip and document checklist for newly admitted JEE Main / UGEAC counselling candidates.",
      link: "https://www.gecsheikhpura.ac.in/check-slip-biometric-form-of-ugeac-2026/",
      verified: true
    },
    {
      id: "not-10",
      title: "B.Tech Fresh Admission Notification 2026 (Intake: 360 Seats)",
      category: "admission",
      date: "04 Jul, 2026",
      source: "Admission Committee",
      summary: "Official reporting dates, annual fee details, hostel allotment rules, and reporting venue at Bajidpur permanent campus.",
      link: "https://www.gecsheikhpura.ac.in/admission-notice-2026/",
      verified: true
    }
  ],

  officialTabs: [
    {
      id: "about-us",
      title: "About Us",
      url: "https://www.gecsheikhpura.ac.in/about-us/history/",
      items: [
        { label: "History", url: "https://www.gecsheikhpura.ac.in/about-us/history/" },
        { label: "Principal's Message", url: "https://www.gecsheikhpura.ac.in/about-us/principals-message/" },
        { label: "Vision & Mission", url: "https://www.gecsheikhpura.ac.in/about-us/vision-mission/" },
        { label: "Administration", url: "https://www.gecsheikhpura.ac.in/about-us/administration/" },
        { label: "Affiliation", url: "https://www.gecsheikhpura.ac.in/about-us/affiliation/" },
        { label: "Allotment & Surrender", url: "https://www.gecsheikhpura.ac.in/about-us/allotment-and-surrender-report/" },
        { label: "Visit Us", url: "https://www.gecsheikhpura.ac.in/about-us/visit-us/" },
        { label: "Contact Us", url: "https://www.gecsheikhpura.ac.in/about-us/contact/" },
        { label: "ICC Committee", url: "https://www.gecsheikhpura.ac.in/about-us/icc/" },
        { label: "Registrar", url: "https://www.gecsheikhpura.ac.in/about-us/registrar/" },
        { label: "Dean Academics", url: "https://www.gecsheikhpura.ac.in/about-us/dean-academics/" }
      ]
    },
    {
      id: "academics",
      title: "Academics",
      url: "https://www.gecsheikhpura.ac.in/academics/admission/",
      items: [
        { label: "Admission", url: "https://www.gecsheikhpura.ac.in/academics/admission/" },
        { label: "Academic Regulation", url: "https://www.gecsheikhpura.ac.in/academics/academic-regulation/" },
        { label: "Academic Calendar", url: "https://www.gecsheikhpura.ac.in/academics/academic-calendar/" },
        { label: "List of Holidays", url: "https://www.gecsheikhpura.ac.in/academics/list-of-holidays/" },
        { label: "Attendance Policy", url: "https://www.gecsheikhpura.ac.in/academics/attendance/" },
        { label: "Syllabus", url: "https://www.gecsheikhpura.ac.in/academics/syllabus/" },
        { label: "Disciplinary Rules", url: "https://www.gecsheikhpura.ac.in/academics/disciplinary-rule/" },
        { label: "Anti-Ragging", url: "https://www.gecsheikhpura.ac.in/academics/anti-ragging/" },
        { label: "MOM Academic Council", url: "https://www.gecsheikhpura.ac.in/academics/mom-of-academic-council/" },
        { label: "Assignments", url: "https://www.gecsheikhpura.ac.in/academics/assignment/" },
        { label: "Notice from Govt", url: "https://www.gecsheikhpura.ac.in/academics/notice-from-govt/" },
        { label: "NBA Accreditation", url: "https://www.gecsheikhpura.ac.in/academics/nba/" }
      ]
    },
    {
      id: "department",
      title: "Department",
      url: "https://www.gecsheikhpura.ac.in/department/computer-science-and-engineering/about-computer-science-and-engineering/",
      items: [
        { label: "Computer Science & Engineering", url: "https://www.gecsheikhpura.ac.in/department/computer-science-and-engineering/about-computer-science-and-engineering/" },
        { label: "Civil Engineering", url: "https://www.gecsheikhpura.ac.in/department/civil-engineering/about-civil-engineering/" },
        { label: "Mechanical Engineering", url: "https://www.gecsheikhpura.ac.in/department/mechanical-engineering/about-mechanical-engineering/" },
        { label: "Electrical Engineering", url: "https://www.gecsheikhpura.ac.in/department/electrical-engineering/about-electrical-engineering/" },
        { label: "Electronics & Communication", url: "https://www.gecsheikhpura.ac.in/department/electronics-and-communication-engineering/about-electronics-and-communication-engineering/" },
        { label: "Mechatronics Engineering", url: "https://www.gecsheikhpura.ac.in/department/mechatronics-engineering-2/about-mechatronics-engineering/" },
        { label: "Applied Science & Humanities", url: "https://www.gecsheikhpura.ac.in/department/applied-science-humanities/about-applied-science-humanities/" }
      ]
    },
    {
      id: "training-placement",
      title: "Training & Placement",
      url: "https://www.gecsheikhpura.ac.in/training-and-placement/about-training-placement-cell/",
      items: [
        { label: "About T&P Cell", url: "https://www.gecsheikhpura.ac.in/training-and-placement/about-training-placement-cell/" },
        { label: "Our Recruiters", url: "https://www.gecsheikhpura.ac.in/training-and-placement/our-recruiters/" },
        { label: "Contact Person (TPO)", url: "https://www.gecsheikhpura.ac.in/training-and-placement/contact-person/" }
      ]
    },
    {
      id: "facilities",
      title: "Facilities & Services",
      url: "https://www.gecsheikhpura.ac.in/facilities-and-services/computer-center/",
      items: [
        { label: "Computer Center", url: "https://www.gecsheikhpura.ac.in/facilities-and-services/computer-center/" },
        { label: "Central Library", url: "https://www.gecsheikhpura.ac.in/facilities-and-services/central-library/" },
        { label: "Hostels (Boys & Girls)", url: "https://www.gecsheikhpura.ac.in/facilities-and-services/hostels/" },
        { label: "Sports Facilities", url: "https://www.gecsheikhpura.ac.in/facilities-and-services/sports-facilities/" },
        { label: "Medical Facilities", url: "https://www.gecsheikhpura.ac.in/facilities-and-services/medical-facilities/" },
        { label: "Guest House", url: "https://www.gecsheikhpura.ac.in/facilities-and-services/guest-house/" },
        { label: "Gymnasium", url: "https://www.gecsheikhpura.ac.in/facilities-and-services/gymnasium/" },
        { label: "Account / Bank Section", url: "https://www.gecsheikhpura.ac.in/facilities-and-services/bank/" },
        { label: "Student Activity Club", url: "https://www.gecsheikhpura.ac.in/facilities-and-services/club/" },
        { label: "Campus Wi-Fi", url: "https://www.gecsheikhpura.ac.in/facilities-and-services/wi-fi/" },
        { label: "E-Material for Students", url: "https://www.gecsheikhpura.ac.in/facilities-and-services/e-material-for-students/" }
      ]
    },
    {
      id: "activities",
      title: "Activities",
      url: "https://www.gecsheikhpura.ac.in/activities/startup-cell/",
      items: [
        { label: "Startup Cell (SIHE)", url: "https://www.gecsheikhpura.ac.in/activities/startup-cell/" },
        { label: "Innovation Cell (IIC)", url: "https://www.gecsheikhpura.ac.in/activities/innovation-cell/" },
        { label: "Hackathon Cell (SIH)", url: "https://www.gecsheikhpura.ac.in/activities/hackathon-cell/" },
        { label: "Spoken Tutorial (IIT-B)", url: "https://www.gecsheikhpura.ac.in/activities/spoken-tutorial/" }
      ]
    },
    {
      id: "approval",
      title: "Approval",
      url: "https://www.gecsheikhpura.ac.in/approval/aicte/",
      items: [
        { label: "AICTE Approval (EOA)", url: "https://www.gecsheikhpura.ac.in/approval/aicte/" },
        { label: "BEU Patna Affiliation", url: "https://www.gecsheikhpura.ac.in/approval/beu/" },
        { label: "A.K.U Patna Affiliation", url: "https://www.gecsheikhpura.ac.in/approval/a-k-u/" }
      ]
    },
    {
      id: "login",
      title: "Official Logins",
      url: "https://www.gecsheikhpura.ac.in/student-panel/login/",
      items: [
        { label: "Student Login", url: "https://www.gecsheikhpura.ac.in/student-panel/login/" },
        { label: "Faculty Login", url: "https://www.gecsheikhpura.ac.in/faculty-panel/login/" },
        { label: "Admin Panel", url: "https://www.gecsheikhpura.ac.in/admin-panel/login/" }
      ]
    }
  ],

  shops: [],
  rooms: [],
  foodServices: [],

  transport: [
    {
      id: "tr-01",
      station: "Sheikhpura Railway Station (Code: SHK)",
      type: "Train Hub",
      distance: "4.8 km road distance from Bajidpur campus",
      routes: "Gaya - Kiul Junction branch line (East Central Railway). Direct trains to Patna, Gaya, Kiul, Bhagalpur, and Howrah connections.",
      autoFare: "Shared E-Rickshaw: ₹20-25 per person | Reserve Auto: ₹100-120",
      tips: "E-rickshaws frequently run from the railway station exit to Bypass Mor and Bajidpur Police Line."
    },
    {
      id: "tr-02",
      station: "Sheikhpura Bus Stand (Chandi Mor & Bypass)",
      type: "Bus & Traveller Terminal",
      distance: "4.2 km road distance from Bajidpur campus",
      routes: "Frequent buses to Patna (ISBT Bairiya / Mithapur, ~3 to 3.5 hrs), Bihar Sharif (~45 mins), Nawada (~1 hr), Barbigha (~30 mins), Lakhisarai (~1 hr).",
      autoFare: "Shared Auto: ₹15-20 to Bajidpur Gate",
      tips: "Morning and evening express travellers leave every 30-45 minutes towards Patna and Bihar Sharif."
    },
    {
      id: "tr-03",
      station: "Bajidpur Police Line Auto & Tuk-Tuk Stand",
      type: "Local Transit",
      distance: "300 meters from college campus",
      routes: "Connecting college campus to Sheikhpura Bazaar, Hospital Mor, Bus Stand, and SHK Railway Station.",
      autoFare: "Local shared: ₹10 to Bypass, ₹20 to Station / Bazaar",
      tips: "Service is readily available between 6:30 AM and 8:30 PM. For late night arrivals at SHK station, reserve transport is recommended."
    }
  ],

  emergency: [
    {
      name: "Sadar Hospital Sheikhpura (District Govt Hospital)",
      type: "Govt Hospital & 24x7 Emergency",
      address: "Hospital Road, Near Collectorate, Sheikhpura",
      distance: "3.8 km from GEC Sheikhpura",
      phone: "06341-223233 / 102",
      available: "24 Hours Emergency Casualty, ICU, Ambulance & Blood Bank",
      verified: true
    },
    {
      name: "National Emergency Response Support System (ERSS)",
      type: "Central Emergency Helpline",
      address: "All India / Bihar State",
      distance: "Direct Dial",
      phone: "112",
      available: "24x7 Police, Fire, and Medical Assistance",
      verified: true
    },
    {
      name: "Bihar State Ambulance Service",
      type: "Free Emergency Ambulance",
      address: "Toll-Free Dispatch",
      distance: "Dispatched from Sheikhpura Base",
      phone: "108",
      available: "24x7 Toll Free",
      verified: true
    },
    {
      name: "Women Helpline Bihar (Safety & Assistance)",
      type: "Helpline",
      address: "Bihar Women Protection Cell",
      distance: "Toll-Free",
      phone: "181 / 1090",
      available: "24 Hours Toll Free Support",
      verified: true
    },
    {
      name: "Sanjeevani 24-Hour Medical Hall & Chemist",
      type: "24/7 Pharmacy",
      address: "Opposite Sadar Hospital Main Gate, Sheikhpura",
      distance: "3.9 km from campus",
      phone: "+91-94308-55991",
      available: "All essential medicines, first-aid, ORS, surgical items",
      verified: true
    },
    {
      name: "Sheikhpura Thana / Police Station",
      type: "Police Station",
      address: "Thana Chowk, Sheikhpura",
      distance: "3.5 km from campus",
      phone: "06341-223225 / 112",
      available: "24x7 Law & Order",
      verified: true
    }
  ],

  beuGrades: [
    { grade: "O", point: 10, range: "90% - 100%", desc: "Outstanding" },
    { grade: "A+", point: 9, range: "80% - 89%", desc: "Excellent" },
    { grade: "A", point: 8, range: "70% - 79%", desc: "Very Good" },
    { grade: "B+", point: 7, range: "60% - 69%", desc: "Good" },
    { grade: "B", point: 6, range: "50% - 59%", desc: "Above Average" },
    { grade: "C", point: 5, range: "45% - 49%", desc: "Average" },
    { grade: "P", point: 4, range: "40% - 44%", desc: "Pass" },
    { grade: "F", point: 0, range: "< 40%", desc: "Fail / Re-appear" }
  ]
};

// Freeze dataset to prevent accidental runtime mutations
Object.freeze(HUB_DATA);

if (typeof module !== 'undefined' && module.exports) {
  module.exports = HUB_DATA;
}
if (typeof window !== 'undefined') {
  window.HUB_DATA = HUB_DATA;
}
