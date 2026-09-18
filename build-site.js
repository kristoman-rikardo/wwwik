// Baker cv.json og de nyeste innleggene inn i index.html, og legger inn
// schema.org-metadata (JSON-LD) i <head>. Kjøres ved publisering, før commit.
// Innholdet ligger dermed i selve HTML-en for søkemotorer og lesere uten JavaScript;
// JavaScript på siden oppdaterer bare alderen og eventuelle endringer etterpå.
const fs = require('fs');

const cv = JSON.parse(fs.readFileSync('cv.json', 'utf8'));
const posts = JSON.parse(fs.readFileSync('posts.json', 'utf8')).posts;
let html = fs.readFileSync('index.html', 'utf8');

const esc = (v) => String(v ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const ext = (href) => (/^https?:/.test(href) ? ' target="_blank" rel="noopener"' : '');
const age = (() => { const b = new Date(2005, 9, 3), n = new Date(); let a = n.getFullYear() - b.getFullYear(); if (n < new Date(n.getFullYear(), b.getMonth(), b.getDate())) a--; return a; })();
const fmtDate = (iso) => new Date(iso + 'T00:00:00').toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

const entry = (e) => `
      <div class="entry">
        <span class="entry-title">${e.href ? `<a href="${esc(e.href)}"${ext(e.href)}>${esc(e.title)}</a>` : esc(e.title)}</span>
        <span class="entry-date">${esc(e.date)}</span>
        <span class="entry-sub">${esc(e.sub)}</span>${e.desc ? `
        <p class="entry-desc">${esc(e.desc)}</p>` : ''}
      </div>`;

const recent = [...posts].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 4).map((p) => `
        <li class="post-item">
          <span class="post-date">${fmtDate(p.date)}</span>
          <div class="post-body">
            <div class="post-title">
              <span class="badge badge-${p.type === 'achievement' ? 'achievement' : 'blog'}">${p.type === 'achievement' ? 'Achievement' : 'Post'}</span>
              <a href="blog.html#${esc(p.id)}">${esc(p.title)}</a>
            </div>
            <p class="post-summary">${esc(p.summary)}</p>
          </div>
        </li>`).join('');

const blocks = {
  'cv-name': esc(cv.name || 'Kristoffer'),
  'cv-bio': (cv.bio || []).map((l) => esc(l).replace('{age}', `<span id="my-age">${age}</span>`)).join('\n        <br> '),
  'cv-links': (cv.links || []).map((l) => `<a href="${esc(l.href)}"${ext(l.href)}>${esc(l.label)}</a>`).join('\n        '),
  'cv-projects': cv.projects.map(entry).join(''),
  'cv-experience': cv.experience.map(entry).join(''),
  'cv-education': cv.education.map(entry).join(''),
  'cv-skills': esc(cv.skills || ''),
  'recent-posts': recent,
};

// Strukturerte data for søkemotorer.
const description = (cv.bio || []).map((l) => l.replace('{age}', age)).join(' ');
const jsonld = {
  '@context': 'https://schema.org', '@type': 'Person',
  name: 'Kristoffer Strømdal Wik', givenName: cv.name || 'Kristoffer', url: 'https://wwwik.no', description,
  sameAs: (cv.links || []).map((l) => l.href).filter((h) => /^https?:/.test(h)),
  jobTitle: cv.experience[0]?.title, worksFor: cv.experience[0]?.sub ? { '@type': 'Organization', name: cv.experience[0].sub } : undefined,
  alumniOf: cv.education.map((e) => ({ '@type': 'EducationalOrganization', name: e.sub })),
  knowsAbout: cv.projects.map((p) => p.title),
};
blocks['jsonld'] = `<script type="application/ld+json">${JSON.stringify(jsonld)}</script>`;
blocks['meta-description'] = `<meta name="description" content="${esc(description)}" />`;

let missing = [];
for (const [id, content] of Object.entries(blocks)) {
  const re = new RegExp(`(<!-- build:${id} -->)[\\s\\S]*?(<!-- /build:${id} -->)`);
  if (!re.test(html)) { missing.push(id); continue; }
  html = html.replace(re, `$1${content}$2`);
}
if (missing.length) { console.error('Mangler markører i index.html:', missing.join(', ')); process.exit(1); }
fs.writeFileSync('index.html', html);
console.log('✅ index.html bygget fra cv.json og posts.json');
