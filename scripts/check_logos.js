const fs = require('fs');
const files = fs.readdirSync('.').filter(f => f.endsWith('.html'));
files.forEach(f => {
  const content = fs.readFileSync(f, 'utf8');
  const matches = content.match(/src="[^"]*logo[^"]*"/gi) || [];
  if (matches.length > 0) {
    console.log(f, matches);
  }
});
