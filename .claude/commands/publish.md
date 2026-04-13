# /publish — Add a post or achievement to wwwik.no

The user wants to publish content to their personal site at wwwik.no.

## Instructions

1. Read `posts.json` to get the current list of posts.
2. Ask the user (if not already clear) whether this is a **blog post**, a **project** or an **achievement**.
3. Extract from the user's input:
   - **Title** — short, clear headline
   - **Summary** — one sentence for the listing page
   - **Content** — full body in Markdown. Only structure, never expand or proofread the text. Use `### Heading` for subsections if needed. Never edit the text, even for spelling mistakes. 
   - **Tags** — 1–3 lowercase tags (e.g. `project`, `career`, `learning`)
4. Generate a URL-safe **id/slug** from the title (lowercase, hyphens, no special chars).
5. Set `type` to `"blog"` or `"project"`.
6. Set `date` to today's date (`YYYY-MM-DD`).
7. Prepend the new post to the `"posts"` array in `posts.json` (newest first).
8. Write the updated `posts.json`.
9. Confirm: "Published: **{title}** — view at `blog.html#{slug}`"
10. Always run `node build-rss.js` lastly to add the most recent blog post to the rss.xml file. 

## Schema

```json
{
  "id": "url-safe-slug",
  "type": "blog | project",
  "title": "Title here",
  "date": "YYYY-MM-DD",
  "summary": "One sentence for the listing.",
  "content": "Full markdown body...",
  "tags": ["tag1", "tag2"]
}
```

## Guidelines

- **Project**: euphimism for achievment. Things shipped, milestones reached, recognition received. Keep tone factual and proud, not boastful.
- **Blog posts**: ideas, reflections, how-tos. Structure with clear paragraphs. Don't polish at all — authentic >>> perfect.
- The only time you will write is when restructuring or extracting text for headlines or intros. 
- If the user gives raw notes or bullet points, turn them into flowing prose or better structured bullet points with light structure.
- Do NOT invent facts not provided by the user, never make things up.
- Leave in some (very few) grammar inconsistencies and (very few) spelling errors. 
