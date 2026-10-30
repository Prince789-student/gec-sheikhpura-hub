const https = require('https');

function testFetch() {
  https.get('https://www.gecsheikhpura.ac.in/', {
    headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) GECSheikhpuraHubBot/1.0' },
    timeout: 10000
  }, (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
      const linkRegex = /<a\s+[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi;
      let match;
      const links = [];
      const seen = new Set();
      while ((match = linkRegex.exec(data)) !== null) {
        let href = match[1].trim();
        const text = match[2].replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
        if (href && !href.startsWith('javascript:') && !href.startsWith('#')) {
          if (!seen.has(href)) {
            seen.add(href);
            links.push({ href, text });
          }
        }
      }
      console.log('Total unique links found on homepage:', links.length);
      const internal = links.filter(l => l.href.includes('gecsheikhpura.ac.in') || l.href.startsWith('/'));
      console.log('Internal links found:', internal.length);
      console.log('Sample 20 internal links:');
      internal.slice(0, 20).forEach(l => console.log(`  - [${l.text || 'No text'}] -> ${l.href}`));
    });
  }).on('error', (err) => {
    console.error('Error:', err.message);
  });
}

testFetch();
