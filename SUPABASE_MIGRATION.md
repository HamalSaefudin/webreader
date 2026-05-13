# Migration Plan: Local JSON → Supabase

## Overview

Migrate from local JSON files + localStorage to Supabase with minimal in-memory caching only.

### Current State

| Aspect | Current | After |
|--------|---------|-------|
| Data | 677 JSON files in `public/chapters/` | Supabase `chapters` table |
| Index | `index.json` | Supabase query |
| Chapter cache | localStorage | In-memory only (Map) |
| Progress | localStorage | Supabase `user_progress` |
| Hosting | Vite → Vercel/Netlify | No change |

- **Project path**: `light-novel-reader/`
- **Base URL**: `/webreader/`
- **Chapters**: 677

---

## Supabase Schema

Create tables in Supabase SQL Editor:

```sql
-- Series (supports multiple novels)
CREATE TABLE series (
  id SERIAL PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  cover_image TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Chapters
CREATE TABLE chapters (
  id INTEGER NOT NULL,
  series_id INTEGER REFERENCES series(id) ON DELETE CASCADE,
  series_slug TEXT,
  chapter_number INTEGER NOT NULL,
  title TEXT NOT NULL,
  slug TEXT NOT NULL,
  posted_at TEXT,
  content TEXT NOT NULL,
  PRIMARY KEY (series_id, id)
);

-- User progress (single user)
CREATE TABLE user_progress (
  series_id INTEGER REFERENCES series(id) PRIMARY KEY,
  current_chapter_id INTEGER DEFAULT 1,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- RLS
ALTER TABLE series ENABLE ROW LEVEL SECURITY;
ALTER TABLE chapters ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read series" ON series FOR SELECT USING (true);
CREATE POLICY "Public insert series" ON series FOR INSERT WITH CHECK (true);
CREATE POLICY "Public read chapters" ON chapters FOR SELECT USING (true);
CREATE POLICY "Public insert chapters" ON chapters FOR INSERT WITH CHECK (true);
CREATE POLICY "Public read progress" ON user_progress FOR SELECT USING (true);
CREATE POLICY "Public update progress" ON user_progress FOR UPDATE USING (true);
CREATE POLICY "Public insert progress" ON user_progress FOR INSERT WITH CHECK (true);
```

### Initial Data

Insert series:
```sql
INSERT INTO series (slug, title, description)
VALUES ('return-mount-hua-sect', 'Mount Hua Sect', 'Novel about Mount Hua Sect martial arts');
```

Seed 677 chapters using `scripts/seed-chapters.js`.

---

## Migration Steps

### Phase 1: Supabase Setup ✅
1. [x] Create Supabase project at supabase.com
2. [x] Copy schema SQL to SQL Editor and execute
3. [x] Get project URL and anon key

### Phase 2: Seed Data ✅
4. [x] Get anon key from Settings → API
5. [x] Use service_role key in `.env`
6. [x] Run `npm run seed`

### Phase 3: Frontend Changes ✅
7. [x] Create `src/lib/supabase.js`
8. [x] Update `useChapter.js`
9. [x] Update `useChapters.js`
10. [x] Update `useBookmarks.js`

---

## Deployment

1. [ ] Build: `npm run build`
2. [ ] Deploy `dist/` folder to hosting

---

## File Changes

### New Files
| File | Description |
|------|-------------|
| `src/lib/supabase.js` | Supabase client |
| `.env` | Supabase credentials |
| `scripts/seed-chapters.js` | Seed script |

### Modified Files
| File | Changes |
|------|---------|
| `src/hooks/useChapter.js` | Fetch from Supabase |
| `src/hooks/useChapters.js` | Fetch from Supabase |
| `src/hooks/useBookmarks.js` | Use Supabase for progress |

### Environment Variables
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

---

## API Queries

```js
// Get chapter list for a series
supabase
  .from('chapters')
  .select('id, title, slug, posted_at')
  .eq('series_slug', 'return-mount-hua-sect')
  .order('chapter_number')

// Get single chapter content
supabase
  .from('chapters')
  .select('*')
  .eq('series_slug', 'return-mount-hua-sect')
  .eq('chapter_number', 5)
  .single()

// Get user progress
supabase
  .from('user_progress')
  .select('*')
  .eq('series_id', 1)
  .single()

// Update user progress
supabase
  .from('user_progress')
  .upsert({ series_id: 1, current_chapter_id: 5 })
```

---

## Caching After Migration

| Type | Implementation |
|------|----------------|
| In-memory | React useState + Map (cleared on refresh) |
| localStorage | REMOVED |

---

## Keep Local Files

`public/chapters/` directory kept as backup until further notice.

---

## Rollback

If issues:
1. Keep local JSON files as fallback
2. Revert hook changes to fetch from local files
3. Restore localStorage logic