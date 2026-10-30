const fs = require('fs');

const adminHtml = fs.readFileSync('admin.html', 'utf8');
const adminJs = fs.readFileSync('assets/js/admin.js', 'utf8');

// Find all getElementById in admin.js
const regex = /getElementById\(['"]([^'"]+)['"]\)/g;
let match;
const idsInJs = new Set();
while ((match = regex.exec(adminJs)) !== null) {
  idsInJs.add(match[1]);
}

console.log(`Total unique IDs queried in admin.js: ${idsInJs.size}`);

const missingInHtml = [];
idsInJs.forEach(id => {
  if (!adminHtml.includes(`id="${id}"`) && !adminHtml.includes(`id='${id}'`)) {
    missingInHtml.push(id);
  }
});

console.log(`Missing IDs in admin.html (${missingInHtml.length}):`);
missingInHtml.forEach(id => console.log(`  - ${id}`));
