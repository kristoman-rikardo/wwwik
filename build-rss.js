const fs = require('fs');

// Les inn JSON-filen din
const data = JSON.parse(fs.readFileSync('posts.json', 'utf8'));

// Start på RSS-strukturen
let rss = `<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0">
<channel>
  <title>Kristoffer Strømdal Wik</title>
  <link>https://wwwik.no</link>
  <description>Writing and projects by Kristoffer.</description>
`;

// Gå gjennom hvert innlegg og lag en <item>
data.posts.forEach(post => {
  // Gjør om "2026-03-13" til riktig tidsformat for RSS (RFC 822)
  const dateObj = new Date(post.date + 'T00:00:00');
  const pubDate = dateObj.toUTCString(); 

  rss += `
  <item>
    <title>${post.title}</title>
    <link>https://wwwik.no/blog.html#${post.id}</link>
    <description>${post.summary}</description>
    <pubDate>${pubDate}</pubDate>
  </item>`;
});

// Lukk taggene til slutt
rss += `
</channel>
</rss>`;

// Skriv resultatet til rss.xml
fs.writeFileSync('rss.xml', rss);
console.log('✅ rss.xml ble oppdatert!');