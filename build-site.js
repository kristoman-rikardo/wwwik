// Baker cv.json og de nyeste innleggene inn i index.html, og legger inn
// schema.org-metadata (JSON-LD) i <head>. Kjøres ved publisering, før commit.
// Innholdet ligger dermed i selve HTML-en for søkemotorer og lesere uten JavaScript;
// JavaScript på siden oppdaterer bare alderen og eventuelle endringer etterpå.
const fs = require('fs');
const path = require('path');
const { marked } = require('./vendor/marked.min.js');
const SITE = 'https://www.wwwik.no';

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
              <a href="/posts/${esc(p.id)}.html">${esc(p.title)}</a>
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
// ── Egen side per innlegg (HTML + Markdown), bakt liste i blog.html, sitemap, llms.txt ──
const sorted = [...posts].sort((a, b) => b.date.localeCompare(a.date));
const badge = (p) => `<span class="badge badge-${p.type === 'achievement' ? 'achievement' : 'blog'}">${p.type === 'achievement' ? 'Achievement' : 'Post'}</span>`;
const listItem = (p) => `
        <li class="post-item">
          <span class="post-date">${fmtDate(p.date)}</span>
          <div class="post-body">
            <div class="post-title">${badge(p)} <a href="/posts/${esc(p.id)}.html">${esc(p.title)}</a></div>
            <p class="post-summary">${esc(p.summary)}</p>
          </div>
        </li>`;

const chrome = (title, description, body, extraHead = '') => `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${esc(title)}</title>
  <meta name="description" content="${esc(description)}" />
  <link rel="stylesheet" href="/style.css" />
  <link rel="icon" type="image/x-icon" href="/favicon.ico?v=2">
  <link rel="alternate" type="application/rss+xml" title="Kristoffer Strømdal Wik" href="/rss.xml" />
${extraHead}</head>
<body>
<div class="wrap">
  <header>
    <div class="site-name"><a href="/">Kristoffer Strømdal Wik</a></div>
    <nav>
      <a href="/">About</a>
      <a href="/blog.html" class="active">Writing</a>
    </nav>
  </header>
  <main>
${body}
  </main>
  <footer>
    <span>Kristoffer Strømdal Wik</span>
    <span><a href="https://wwwik.no">wwwik.no</a></span>
    <span><a href="/rss.xml">RSS</a></span>
    <span><a href="/auth/login" id="signin">Sign in</a></span>
  </footer>
</div>
<script>
  fetch('/auth/me', { credentials: 'same-origin' }).then(r => r.ok ? r.json() : null).then(m => {
    if (m && m.signedIn) { const a = document.getElementById('signin'); a.textContent = 'Admin'; a.href = '/admin/'; }
  }).catch(() => {});
</script>
</body>
</html>
`;

fs.mkdirSync('posts', { recursive: true });
for (const f of fs.readdirSync('posts')) if (/\.(html|md)$/.test(f)) fs.unlinkSync(path.join('posts', f));
for (const p of sorted) {
  const url = `${SITE}/posts/${p.id}.html`;
  const article = {
    '@context': 'https://schema.org', '@type': p.type === 'blog' ? 'BlogPosting' : 'Article',
    headline: p.title, description: p.summary, datePublished: p.date, url,
    keywords: (p.tags || []).join(', '), inLanguage: 'en',
    author: { '@type': 'Person', name: 'Kristoffer Strømdal Wik', url: SITE },
    mainEntityOfPage: url,
  };
  const head = `  <link rel="canonical" href="${url}" />
  <link rel="alternate" type="text/markdown" href="${SITE}/posts/${esc(p.id)}.md" />
  <meta property="og:type" content="article" />
  <meta property="og:title" content="${esc(p.title)}" />
  <meta property="og:description" content="${esc(p.summary)}" />
  <meta property="og:url" content="${url}" />
  <script type="application/ld+json">${JSON.stringify(article)}</script>
`;
  const body = `    <a href="/blog.html" class="back-link">← All posts</a>
    <article>
      <div class="post-header">
        <h1>${esc(p.title)}</h1>
        <p class="post-meta">${badge(p)}<time datetime="${esc(p.date)}">${fmtDate(p.date)}</time>${(p.tags || []).length ? ' · ' + p.tags.map((t) => '#' + esc(t)).join(' ') : ''}</p>
      </div>
      <div class="post-content">
${marked.parse(p.content)}
      </div>
    </article>`;
  fs.writeFileSync(`posts/${p.id}.html`, chrome(`${p.title} — Kristoffer Strømdal Wik`, p.summary, body, head));
  fs.writeFileSync(`posts/${p.id}.md`, `# ${p.title}\n\n> ${p.summary}\n\nPublished ${p.date} by Kristoffer Strømdal Wik · ${url}${(p.tags || []).length ? ' · Tags: ' + p.tags.join(', ') : ''}\n\n${p.content.trim()}\n`);
}

// blog.html: bakt liste
let blog = fs.readFileSync('blog.html', 'utf8');
const blogRe = /(<!-- build:post-list -->)[\s\S]*?(<!-- \/build:post-list -->)/;
if (!blogRe.test(blog)) { console.error('Mangler markør build:post-list i blog.html'); process.exit(1); }
fs.writeFileSync('blog.html', blog.replace(blogRe, `$1${sorted.map(listItem).join('')}\n        $2`));

// sitemap.xml
const urls = [[`${SITE}/`, sorted[0]?.date], [`${SITE}/blog.html`, sorted[0]?.date], ...sorted.map((p) => [`${SITE}/posts/${p.id}.html`, p.date])];
fs.writeFileSync('sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map(([u, d]) => `  <url><loc>${u}</loc>${d ? `<lastmod>${d}</lastmod>` : ''}</url>`).join('\n')}\n</urlset>\n`);

// llms.txt (oversikt) og llms-full.txt (alt innhold)
const md = (e) => `- **${e.title}**${e.date ? ` (${e.date})` : ''}${e.sub ? ` — ${e.sub}` : ''}${e.href ? ` — ${e.href}` : ''}${e.desc ? `: ${e.desc}` : ''}`;
const about = `# Kristoffer Strømdal Wik

> ${description}

Personal site of Kristoffer Strømdal Wik (wwwik.no): writing, projects and CV. Content is in English. Each post is also available as Markdown at the .md link.

## About

- Links: ${(cv.links || []).map((l) => `${l.label} ${l.href}`).join(', ')}
- Skills: ${cv.skills}

## Projects

${cv.projects.map(md).join('\n')}

## Experience

${cv.experience.map(md).join('\n')}

## Education

${cv.education.map(md).join('\n')}
`;
fs.writeFileSync('llms.txt', `${about}
## Writing

${sorted.map((p) => `- [${p.title}](${SITE}/posts/${p.id}.md) (${p.date}): ${p.summary}`).join('\n')}

## Optional

- [Full content of all posts](${SITE}/llms-full.txt)
- [RSS feed](${SITE}/rss.xml)
`);
fs.writeFileSync('llms-full.txt', `${about}
## Writing

${sorted.map((p) => `---\n\n${fs.readFileSync(`posts/${p.id}.md`, 'utf8')}`).join('\n')}`);
console.log(`✅ ${sorted.length} postsider, blog.html, sitemap.xml, llms.txt, llms-full.txt`);

