# Chapter Content Separation Migration Plan

## Overview

Split the `chapters` table into two tables to optimize load performance:
- `chapters`: metadata only (for navigation list)
- `chapter_contents`: full text content (loaded on demand)

## Current Schema

```sql
-- chapters table (CURRENT - heavy)
CREATE TABLE chapters (
  id INTEGER NOT NULL,
  series_id INTEGER REFERENCES series(id) ON DELETE CASCADE,
  series_slug TEXT,
  chapter_number INTEGER NOT NULL,
  title TEXT NOT NULL,
  slug TEXT NOT NULL,
  posted_at TEXT,
  content TEXT NOT NULL,          -- <-- THIS IS HEAVY
  PRIMARY KEY (series_id, id)
);
```

## Target Schema

### Table: `chapters` (瘦身后)
```sql
CREATE TABLE chapters (
  id INTEGER NOT NULL,
  series_id INTEGER REFERENCES series(id) ON DELETE CASCADE,
  series_slug TEXT,
  chapter_number INTEGER NOT NULL,
  title TEXT NOT NULL,
  slug TEXT NOT NULL,
  posted_at TEXT,
  -- content COLUMN REMOVED
  PRIMARY KEY (series_id, id)
);
```

### Table: `chapter_contents` (NEW)
```sql
CREATE TABLE chapter_contents (
  series_id INTEGER NOT NULL,
  chapter_id INTEGER NOT NULL,
  content TEXT NOT NULL,
  PRIMARY KEY (series_id, chapter_id),
  FOREIGN KEY (series_id, chapter_id)
    REFERENCES chapters(series_id, id)
    ON DELETE CASCADE
);
```

## Migration Steps

### Step 1: SQL Schema Migration

```sql
-- 1. Create new chapter_contents table with FK
CREATE TABLE chapter_contents (
  series_id INTEGER NOT NULL,
  chapter_id INTEGER NOT NULL,
  content TEXT NOT NULL,
  PRIMARY KEY (series_id, chapter_id),
  FOREIGN KEY (series_id, chapter_id)
    REFERENCES chapters(series_id, id)
    ON DELETE CASCADE
);

-- 2. Enable RLS
ALTER TABLE chapter_contents ENABLE ROW LEVEL SECURITY;

-- 3. Create RLS policies
CREATE POLICY "Public read chapter_contents" ON chapter_contents FOR SELECT USING (true);
CREATE POLICY "Public insert chapter_contents" ON chapter_contents FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update chapter_contents" ON chapter_contents FOR UPDATE USING (true);
```

### Step 2: Data Migration

```sql
-- Move existing content from chapters to chapter_contents
INSERT INTO chapter_contents (series_id, chapter_id, content)
SELECT series_id, id, content
FROM chapters
WHERE content IS NOT NULL AND content != '';
```

### Step 3: Remove content column from chapters (AFTER verification)

```sql
-- Only run after confirming data migration worked
ALTER TABLE chapters DROP COLUMN content;
```

## Data Flow (After Migration)

```
App Load
├── useChapters() ──────────────────────────────────────┐
│   SELECT id, title, slug, posted_at FROM chapters      │ ← LIGHTWEIGHT
└── useUserProgress()                                    │
    └── useChapter(currentId) ──────────────────────────┐
        SELECT content FROM chapter_contents            │ ← ON DEMAND
        WHERE series_id = X AND chapter_id = Y

User Navigates to Chapter X
└── useChapter(X)
    └── SELECT content FROM chapter_contents
        WHERE series_id = X AND chapter_id = X
```

## Code Changes

### useChapter.js

**Before:**
```javascript
const { data, error } = await supabase
  .from('chapters')
  .select('id, title, content')
  .eq('series_id', SERIES_ID)
  .eq('id', id)
  .single();
```

**After:**
```javascript
const { data: meta, error: metaError } = await supabase
  .from('chapters')
  .select('id, title')
  .eq('series_id', SERIES_ID)
  .eq('id', id)
  .single();

const { data: contentData, error: contentError } = await supabase
  .from('chapter_contents')
  .select('content')
  .eq('series_id', SERIES_ID)
  .eq('chapter_id', id)
  .single();
```

### seed-chapters.js

**Before:** Single upsert with all fields
```javascript
chapters.push({
  id, series_id, series_slug, chapter_number,
  title, slug, posted_at, content
});

supabase.from('chapters').upsert(batch, { onConflict: 'series_id,id' });
```

**After:** Two separate upserts
```javascript
// Step 1: Upsert chapter metadata (no content)
const metaBatch = chapters.map(ch => ({
  id: ch.id,
  series_id: ch.series_id,
  series_slug: ch.series_slug,
  chapter_number: ch.chapter_number,
  title: ch.title,
  slug: ch.slug,
  posted_at: ch.posted_at
}));

await supabase.from('chapters').upsert(metaBatch, { onConflict: 'series_id,id' });

// Step 2: Upsert chapter contents
const contentBatch = chapters.map(ch => ({
  series_id: ch.series_id,
  chapter_id: ch.id,
  content: ch.content
}));

await supabase.from('chapter_contents').upsert(contentBatch, { onConflict: 'series_id,chapter_id' });
```

## Todo List

- [ ] Create SQL migration: new `chapter_contents` table WITH FK + RLS policies
- [ ] Run schema migration in Supabase
- [ ] Create data migration script: move content from chapters → chapter_contents
- [ ] Run data migration in Supabase
- [ ] Update useChapter.js: query chapter_contents table for content
- [ ] Update seed-chapters.js: upsert metadata and content separately
- [ ] Test: chapter list loads fast + chapter content loads correctly
- [ ] Drop content column from chapters table (after verification)

## Rollback Plan

If something goes wrong:

```sql
-- Rollback: move content back to chapters
INSERT INTO chapters (series_id, id, content)
SELECT series_id, chapter_id, content
FROM chapter_contents
WHERE content IS NOT NULL;

-- Drop chapter_contents table
DROP TABLE chapter_contents;

-- Recreate content column (if dropped)
ALTER TABLE chapters ADD COLUMN content TEXT;
```

## Benefits

| Aspect | Before | After |
|--------|--------|-------|
| Chapter list query | `SELECT * FROM chapters` (with heavy TEXT) | `SELECT id, title, slug, posted_at` (no TEXT) |
| Content loading | N/A (same) | Same - loads on demand |
| Delete cascade | Via chapters FK | Same - FK handles cleanup |
| Data integrity | Single table | Foreign key relationship |