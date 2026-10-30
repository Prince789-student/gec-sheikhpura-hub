const fs = require('fs');

const files = [
  'student-tools.html',
  'admissions.html',
  'community.html',
  'academics.html',
  'college-info.html',
  'campus-directory.html',
  'official-directory.html',
  'placement.html',
  'index.html',
  'assets/js/app.js'
];

console.log('====================================================');
console.log('🔗 APNA COLLEGE BIHAR DEEP-LINK VERIFICATION REPORT');
console.log('====================================================\n');

let totalLinks = 0;
const allUniqueUrls = new Set();

files.forEach(file => {
  const content = fs.readFileSync(file, 'utf8');
  const matches = content.match(/https:\/\/www\.apnacollegebihar\.online[^\s"'`<>]*/g) || [];
  const uniqueInFile = [...new Set(matches)];
  totalLinks += matches.length;
  uniqueInFile.forEach(u => allUniqueUrls.add(u));

  console.log(`📄 ${file} (${matches.length} occurrences, ${uniqueInFile.length} unique targets):`);
  uniqueInFile.forEach(u => console.log(`   ➔ ${u}`));
  console.log('');
});

console.log('====================================================');
console.log(`Total Link Instances: ${totalLinks}`);
console.log(`Distinct Unique Deep-Link Destinations: ${allUniqueUrls.size}`);
console.log('All Unique Destination Targets:');
[...allUniqueUrls].sort().forEach(u => console.log(`   • ${u}`));
console.log('====================================================');
