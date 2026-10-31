const fs = require('fs');
const path = require('path');

const rootDir = path.join(__dirname, '..');
const crestPath = path.join(rootDir, 'assets/images/college_crest.jpg');
const crestBase64 = fs.readFileSync(crestPath).toString('base64');
const dataUri = `data:image/jpeg;base64,${crestBase64}`;

// 1. Update logo.svg with embedded base64 so it works standalone & inside <img> tags everywhere
const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 100 100" width="100" height="100">
  <defs>
    <clipPath id="circleClip">
      <circle cx="50" cy="50" r="48"/>
    </clipPath>
  </defs>
  <circle cx="50" cy="50" r="49" fill="#ffffff" stroke="#1e3a8a" stroke-width="2"/>
  <image href="${dataUri}" xlink:href="${dataUri}" x="2" y="2" width="96" height="96" clip-path="url(#circleClip)" preserveAspectRatio="xMidYMid meet"/>
</svg>
`;

fs.writeFileSync(path.join(rootDir, 'assets/images/logo.svg'), svgContent, 'utf8');
console.log('Updated logo.svg with embedded base64 crest image.');

// 2. Update all HTML files
const htmlFiles = fs.readdirSync(rootDir).filter(f => f.endsWith('.html'));

let updatedFiles = 0;
for (const file of htmlFiles) {
  const filePath = path.join(rootDir, file);
  let html = fs.readFileSync(filePath, 'utf8');
  const original = html;

  // Replace header brand-crest img
  html = html.replace(/<div class="brand-crest"[^>]*>[\s\S]*?<\/div>/gi, () => {
    return `<div class="brand-crest" style="background: none; overflow: hidden; display: flex; align-items: center; justify-content: center; width: 44px; height: 44px; border-radius: 50%;">\n          <img src="assets/images/college_crest.jpg" alt="GEC Sheikhpura Logo" width="42" height="42" style="width: 42px; height: 42px; object-fit: contain; border-radius: 50%;">\n        </div>`;
  });

  // Replace footer-brand-crest
  html = html.replace(/<div class="footer-brand-crest"[^>]*>[\s\S]*?<\/div>/gi, () => {
    return `<div class="footer-brand-crest" style="background: none; overflow: hidden; display: flex; align-items: center; justify-content: center; width: 36px; height: 36px; border-radius: 50%;">\n            <img src="assets/images/college_crest.jpg" alt="GEC Sheikhpura Logo" width="34" height="34" style="width: 34px; height: 34px; object-fit: contain; border-radius: 50%;">\n          </div>`;
  });

  // Also replace any remaining <img src="assets/images/logo.svg" ...>
  html = html.replace(/src="assets\/images\/logo\.svg"/gi, 'src="assets/images/college_crest.jpg"');

  // Ensure favicon points to college_crest.jpg
  html = html.replace(/<link rel="icon"[^>]*href="assets\/images\/logo\.svg"[^>]*>/gi, '<link rel="icon" type="image/jpeg" href="assets/images/college_crest.jpg">');

  if (html !== original) {
    fs.writeFileSync(filePath, html, 'utf8');
    updatedFiles++;
    console.log(`Updated logos in ${file}`);
  }
}

console.log(`Completed logo unification across ${updatedFiles} HTML files.`);
