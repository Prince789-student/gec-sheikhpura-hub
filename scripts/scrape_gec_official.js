const https = require('https');
const fs = require('fs');

const tabEndpoints = [
  // 1. About Us
  { tab: 'About Us', name: 'History', url: 'https://www.gecsheikhpura.ac.in/about-us/history/' },
  { tab: 'About Us', name: 'Principal Message', url: 'https://www.gecsheikhpura.ac.in/about-us/principals-message/' },
  { tab: 'About Us', name: 'Vision & Mission', url: 'https://www.gecsheikhpura.ac.in/about-us/vision-mission/' },
  { tab: 'About Us', name: 'Administration', url: 'https://www.gecsheikhpura.ac.in/about-us/administration/' },
  { tab: 'About Us', name: 'Affiliation', url: 'https://www.gecsheikhpura.ac.in/about-us/affiliation/' },
  { tab: 'About Us', name: 'Allotment and Surrender Report', url: 'https://www.gecsheikhpura.ac.in/about-us/allotment-and-surrender-report/' },
  { tab: 'About Us', name: 'Visit Us', url: 'https://www.gecsheikhpura.ac.in/about-us/visit-us/' },
  { tab: 'About Us', name: 'Contact Us', url: 'https://www.gecsheikhpura.ac.in/about-us/contact/' },
  { tab: 'About Us', name: 'Internal Complaint Committee (ICC)', url: 'https://www.gecsheikhpura.ac.in/about-us/icc/' },
  { tab: 'About Us', name: 'Registrar', url: 'https://www.gecsheikhpura.ac.in/about-us/registrar/' },
  { tab: 'About Us', name: 'Dean Academics', url: 'https://www.gecsheikhpura.ac.in/about-us/dean-academics/' },

  // 2. Academics
  { tab: 'Academics', name: 'Admission', url: 'https://www.gecsheikhpura.ac.in/academics/admission/' },
  { tab: 'Academics', name: 'Academic Regulation', url: 'https://www.gecsheikhpura.ac.in/academics/academic-regulation/' },
  { tab: 'Academics', name: 'Academic Calendar', url: 'https://www.gecsheikhpura.ac.in/academics/academic-calendar/' },
  { tab: 'Academics', name: 'List of Holidays', url: 'https://www.gecsheikhpura.ac.in/academics/list-of-holidays/' },
  { tab: 'Academics', name: 'Attendance', url: 'https://www.gecsheikhpura.ac.in/academics/attendance/' },
  { tab: 'Academics', name: 'Syllabus', url: 'https://www.gecsheikhpura.ac.in/academics/syllabus/' },
  { tab: 'Academics', name: 'Disciplinary Rule', url: 'https://www.gecsheikhpura.ac.in/academics/disciplinary-rule/' },
  { tab: 'Academics', name: 'Anti Ragging', url: 'https://www.gecsheikhpura.ac.in/academics/anti-ragging/' },
  { tab: 'Academics', name: 'MOM of Academic Council', url: 'https://www.gecsheikhpura.ac.in/academics/mom-of-academic-council/' },
  { tab: 'Academics', name: 'Assignment', url: 'https://www.gecsheikhpura.ac.in/academics/assignment/' },
  { tab: 'Academics', name: 'Notice from Govt', url: 'https://www.gecsheikhpura.ac.in/academics/notice-from-govt/' },
  { tab: 'Academics', name: 'NBA', url: 'https://www.gecsheikhpura.ac.in/academics/nba/' },

  // 3. Department
  { tab: 'Department', name: 'Civil Engineering', url: 'https://www.gecsheikhpura.ac.in/department/civil-engineering/about-civil-engineering/' },
  { tab: 'Department', name: 'Mechanical Engineering', url: 'https://www.gecsheikhpura.ac.in/department/mechanical-engineering/about-mechanical-engineering/' },
  { tab: 'Department', name: 'Electronics and Communication Engineering', url: 'https://www.gecsheikhpura.ac.in/department/electronics-and-communication-engineering/about-electronics-and-communication-engineering/' },
  { tab: 'Department', name: 'Electrical Engineering', url: 'https://www.gecsheikhpura.ac.in/department/electrical-engineering/about-electrical-engineering/' },
  { tab: 'Department', name: 'Computer Science and Engineering', url: 'https://www.gecsheikhpura.ac.in/department/computer-science-and-engineering/about-computer-science-and-engineering/' },
  { tab: 'Department', name: 'Mechatronics Engineering', url: 'https://www.gecsheikhpura.ac.in/department/mechatronics-engineering-2/about-mechatronics-engineering/' },
  { tab: 'Department', name: 'Applied Science & Humanities', url: 'https://www.gecsheikhpura.ac.in/department/applied-science-humanities/about-applied-science-humanities/' },

  // 4. Training & Placement
  { tab: 'Training & Placement', name: 'About T&P Cell', url: 'https://www.gecsheikhpura.ac.in/training-and-placement/about-training-placement-cell/' },
  { tab: 'Training & Placement', name: 'Our Recruiters', url: 'https://www.gecsheikhpura.ac.in/training-and-placement/our-recruiters/' },
  { tab: 'Training & Placement', name: 'Contact Person', url: 'https://www.gecsheikhpura.ac.in/training-and-placement/contact-person/' },

  // 5. Facilities & Services
  { tab: 'Facilities & Services', name: 'Computer Center', url: 'https://www.gecsheikhpura.ac.in/facilities-and-services/computer-center/' },
  { tab: 'Facilities & Services', name: 'Central Library', url: 'https://www.gecsheikhpura.ac.in/facilities-and-services/central-library/' },
  { tab: 'Facilities & Services', name: 'Hostels', url: 'https://www.gecsheikhpura.ac.in/facilities-and-services/hostels/' },
  { tab: 'Facilities & Services', name: 'Sports Facilities', url: 'https://www.gecsheikhpura.ac.in/facilities-and-services/sports-facilities/' },
  { tab: 'Facilities & Services', name: 'Medical Facilities', url: 'https://www.gecsheikhpura.ac.in/facilities-and-services/medical-facilities/' },
  { tab: 'Facilities & Services', name: 'Guest House', url: 'https://www.gecsheikhpura.ac.in/facilities-and-services/guest-house/' },
  { tab: 'Facilities & Services', name: 'Gymnasium', url: 'https://www.gecsheikhpura.ac.in/facilities-and-services/gymnasium/' },
  { tab: 'Facilities & Services', name: 'Account / Bank', url: 'https://www.gecsheikhpura.ac.in/facilities-and-services/bank/' },
  { tab: 'Facilities & Services', name: 'Club', url: 'https://www.gecsheikhpura.ac.in/facilities-and-services/club/' },
  { tab: 'Facilities & Services', name: 'Wi-Fi', url: 'https://www.gecsheikhpura.ac.in/facilities-and-services/wi-fi/' },
  { tab: 'Facilities & Services', name: 'E-Material for Students', url: 'https://www.gecsheikhpura.ac.in/facilities-and-services/e-material-for-students/' },

  // 6. Activities
  { tab: 'Activities', name: 'Innovation Cell', url: 'https://www.gecsheikhpura.ac.in/activities/innovation-cell/' },
  { tab: 'Activities', name: 'Startup Cell', url: 'https://www.gecsheikhpura.ac.in/activities/startup-cell/' },
  { tab: 'Activities', name: 'Hackathon Cell', url: 'https://www.gecsheikhpura.ac.in/activities/hackathon-cell/' },
  { tab: 'Activities', name: 'Spoken Tutorial', url: 'https://www.gecsheikhpura.ac.in/activities/spoken-tutorial/' },

  // 7. Approval
  { tab: 'Approval', name: 'AICTE', url: 'https://www.gecsheikhpura.ac.in/approval/aicte/' },
  { tab: 'Approval', name: 'AKU', url: 'https://www.gecsheikhpura.ac.in/approval/a-k-u/' },
  { tab: 'Approval', name: 'BEU', url: 'https://www.gecsheikhpura.ac.in/approval/beu/' }
];

function fetchPage(item) {
  return new Promise((resolve) => {
    https.get(item.url, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }, timeout: 10000 }, (res) => {
      let raw = '';
      res.on('data', chunk => raw += chunk);
      res.on('end', () => {
        // Strip header and footer
        let clean = raw;
        const navEnd = clean.indexOf('</header>');
        if (navEnd !== -1) clean = clean.slice(navEnd);
        const footerStart = clean.indexOf('<div class="menuFooter');
        if (footerStart !== -1) clean = clean.slice(0, footerStart);

        // Remove script, style, comments
        clean = clean.replace(/<script[\s\S]*?<\/script>/gi, ' ')
                     .replace(/<style[\s\S]*?<\/style>/gi, ' ')
                     .replace(/<!--[\s\S]*?-->/g, ' ');

        // Extract tables if any
        const tables = [];
        const tableMatches = clean.match(/<table[\s\S]*?<\/table>/gi);
        if (tableMatches) {
          tableMatches.forEach(t => {
            const rowMatches = t.match(/<tr[\s\S]*?<\/tr>/gi);
            if (rowMatches) {
              const rows = rowMatches.map(r => {
                const cells = r.match(/<(td|th)[^>]*>([\s\S]*?)<\/(td|th)>/gi);
                if (cells) {
                  return cells.map(c => c.replace(/<[^>]+>/g, '').trim()).filter(Boolean);
                }
                return [];
              }).filter(r => r.length > 0);
              if (rows.length > 0) tables.push(rows);
            }
          });
        }

        // Plain text
        const plainText = clean.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();

        resolve({
          tab: item.tab,
          name: item.name,
          url: item.url,
          text: plainText,
          tables: tables
        });
      });
    }).on('error', (err) => {
      resolve({
        tab: item.tab,
        name: item.name,
        url: item.url,
        error: err.message
      });
    });
  });
}

async function run() {
  console.log(`Starting crawl of ${tabEndpoints.length} endpoints...`);
  const batchSize = 6;
  const allResults = [];
  for (let i = 0; i < tabEndpoints.length; i += batchSize) {
    const batch = tabEndpoints.slice(i, i + batchSize);
    console.log(`Fetching batch ${Math.floor(i / batchSize) + 1} (${batch.length} items)...`);
    const results = await Promise.all(batch.map(fetchPage));
    allResults.push(...results);
  }

  fs.writeFileSync('scripts/official_tab_data.json', JSON.stringify(allResults, null, 2), 'utf-8');
  console.log('Finished! Saved to scripts/official_tab_data.json with ' + allResults.length + ' entries.');
}

run();
