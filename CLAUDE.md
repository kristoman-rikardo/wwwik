# wwwik.no — Personal site

Static portfolio, CV, and blog for Kristoffer Strømdal Wik at **wwwik.no**.

## Structure

```
index.html   — CV / portfolio / recent posts
blog.html    — Blog listing + individual posts (hash routing: blog.html#slug)
style.css    — Shared styles
posts.json   — All posts & achievements (source of truth)
```

## Publishing content

Type `/publish` and describe what you want to publish.
Claude will format it and add it to `posts.json`.

Two content types:
- `blog` — posts, thoughts, how-tos
- `achievement` — milestones, shipped projects, recognition

## Updating the CV

To update the CV (experience, education, skills, bio) just ask:
- "Add [Company] as [Role] from [year] to [year]"
- "Add Python and Rust to skills"
- "Update my bio to: …"

Claude will edit `index.html` directly.

## Deployment

<!-- Fill in your deploy method: -->
<!-- Option A: GitHub Pages — push to main and it auto-deploys -->
<!-- Option B: rsync -avz --delete . user@server:/var/www/wwwik.no/ -->
<!-- Option C: Netlify/Vercel — connected to this repo -->
