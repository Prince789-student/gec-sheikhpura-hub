const fs = require('fs');
const path = require('path');

const dir = path.resolve(__dirname, '..');
const footerHtml = fs.readFileSync(path.join(dir, 'components/footer.html'), 'utf8').trim();

// Dynamically find all HTML pages in root directory
const targetPages = fs.readdirSync(dir).filter(f => f.endsWith('.html') && !f.includes('.backup'));


let updatedCount = 0;

targetPages.forEach(fileName => {
  const filePath = path.join(dir, fileName);
  if (!fs.existsSync(filePath)) {
    console.warn('Page not found:', fileName);
    return;
  }

  let content = fs.readFileSync(filePath, 'utf8');

  // 1. Ensure components/footer.css is linked in <head>
  if (!content.includes('components/footer.css')) {
    content = content.replace('</head>', '  <link rel="stylesheet" href="components/footer.css">\n</head>');
  }

  // 2. Replace any existing <footer...>...</footer> with the canonical footerHtml
  const footerRegex = /<footer[\s\S]*?<\/footer>/i;
  if (footerRegex.test(content)) {
    content = content.replace(footerRegex, footerHtml);
  } else {
    // If no footer exists, insert before </body>
    content = content.replace('</body>', footerHtml + '\n</body>');
  }

  // 3. Ensure components/footer.js is included before </body>
  if (!content.includes('components/footer.js')) {
    content = content.replace('</body>', '  <script src="components/footer.js"></script>\n</body>');
  }

  fs.writeFileSync(filePath, content, 'utf8');
  updatedCount++;
  console.log('Unified footer applied to:', fileName);
});

console.log('\nSUCCESS: Total pages updated with universal footer:', updatedCount);
