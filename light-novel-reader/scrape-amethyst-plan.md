# Scraper Plan: amethystwriters.com

## Overview
Scrape chapters 1243-1962 from https://amethystwriters.com/novel/return-of-the-mount-hua-sect/

## Approach
- **Index discovery**: Find the manga's chapter list page, extract all chapter URLs
- **Direct Supabase upsert**: No local files, scrape → immediately upsert to Supabase
- **Rate limiting**: 500ms delay between requests

## Todo List

### Phase 1: Create Scraper
- [ ] Create `scrape-amethyst.js`
  - [x] Setup Supabase client
  - [ ] Implement index discovery (find chapter list page)
  - [ ] Parse chapter URLs and IDs from index
  - [ ] Implement chapter scraping (h1 title, .prose content)
  - [ ] Implement direct Supabase upsert
  - [ ] Add rate limiting (500ms)
  - [ ] Add error handling (skip failed, continue)
  - [ ] Add summary report

### Phase 2: Execute
- [ ] Run scrape for chapters 1243-1962
- [ ] Verify data in Supabase

---

## Supabase Schema
```json
{
  "id": 1243,
  "series_id": 2,
  "series_slug": "return-mount-hua-sect",
  "chapter_number": 1243,
  "title": "...",
  "slug": "...",
  "posted_at": "...",
  "content": "..."
}
```

## Environment Variables
```
SUPABASE_URL=https://fzroptznczrjmqmwjsde.supabase.co
SUPABASE_SERVICE_KEY=<service-role-key>
```
Note: Service role key needed for direct upserts (bypasses RLS).

## Notes
- Using cheerio (no puppeteer needed - site doesn't use lazy loading)
- Same selectors as skydemonorder: `h1` for title, `.prose` for content