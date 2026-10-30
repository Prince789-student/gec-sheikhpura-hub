const data = require('./official_tab_data.json');
console.log('Total entries:', data.length);
data.forEach((d, i) => {
  console.log(`${i+1}. [${d.tab}] ${d.name} -> ${d.text ? d.text.length : 0} chars | tables: ${d.tables ? d.tables.length : 0} ${d.error ? 'ERR: ' + d.error : ''}`);
});
