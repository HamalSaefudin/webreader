# Light Novel Reader - Complete Build Plan

## Project Overview
Build a fast, offline-first light novel reader that scrapes all chapters once and deploys to GitHub Pages. Users can instantly switch between chapters without API calls or page reloads.

**Live Demo Target**: Instant chapter navigation, no loading screens, works on GitHub Pages

---

## Phase 1: Web Scraping

### Goal
Fetch all chapters from https://skydemonorder.com/projects/3801994495-return-of-the-mount-hua-sect and save to a single JSON file.

### Step 1.1: Create Scraper Script

**File**: `scraper.js`

```javascript
const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');
const path = require('path');

const BASE_URL = 'https://skydemonorder.com/projects/3801994495-return-of-the-mount-hua-sect';
const OUTPUT_FILE = 'public/chapters.json';

// Configuration
const CHAPTERS = [];
const DELAY_MS = 1000; // Delay between requests to avoid rate limiting
let currentChapterId = 1;

async function scrapeChapter(url) {
  try {
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });
    
    const $ = cheerio.load(response.data);
    
    // ADJUST SELECTORS BASED ON ACTUAL SITE STRUCTURE
    const title = $('.chapter-title').text().trim() || `Chapter ${currentChapterId}`;
    const content = $('.chapter-content').html() || '';
    
    return {
      id: currentChapterId,
      title: title,
      content: content,
      url: url
    };
  } catch (error) {
    console.error(`Error scraping chapter ${currentChapterId}:`, error.message);
    return null;
  }
}

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function main() {
  console.log('Starting scraper...');
  
  // TODO: First, inspect the site structure to find:
  // 1. How chapters are listed/paginated
  // 2. The correct CSS selectors for chapter title and content
  // 3. The URL pattern for chapter links
  
  // MANUAL APPROACH (if pagination is complex):
  // Get all chapter links from the main page first
  const chapterLinks = await getChapterLinks(BASE_URL);
  
  console.log(`Found ${chapterLinks.length} chapters. Starting to scrape...`);
  
  for (const link of chapterLinks) {
    const chapter = await scrapeChapter(link);
    if (chapter) {
      CHAPTERS.push(chapter);
      console.log(`✓ Scraped: ${chapter.title} (${CHAPTERS.length}/${chapterLinks.length})`);
    }
    
    // Rate limit: wait before next request
    await sleep(DELAY_MS);
  }
  
  // Save to JSON
  fs.mkdirSync(path.dirname(OUTPUT_FILE), { recursive: true });
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(CHAPTERS, null, 2));
  
  console.log(`✓ Saved ${CHAPTERS.length} chapters to ${OUTPUT_FILE}`);
}

async function getChapterLinks(mainUrl) {
  try {
    const response = await axios.get(mainUrl);
    const $ = cheerio.load(response.data);
    
    // TODO: Adjust selector to match site's chapter list
    // Example: $('.chapter-link') or 'a[href*="/chapter/"]'
    const links = [];
    $('a.chapter-link').each((i, el) => {
      const href = $(el).attr('href');
      if (href) {
        links.push(href.startsWith('http') ? href : BASE_URL + href);
      }
    });
    
    return links;
  } catch (error) {
    console.error('Error getting chapter links:', error.message);
    return [];
  }
}

main().catch(console.error);
```

### Step 1.2: Set Up Scraper Environment

```bash
mkdir light-novel-reader
cd light-novel-reader

# Initialize Node project
npm init -y

# Install dependencies
npm install axios cheerio

# If the site uses JavaScript to render content, use Puppeteer instead:
# npm install puppeteer
```

### Step 1.3: Run the Scraper

```bash
node scraper.js
```

**Output**: `public/chapters.json`

```json
[
  {
    "id": 1,
    "title": "Chapter 1: Return of the Mount Hua Sect",
    "content": "<div class='chapter-content'><p>Lorem ipsum...</p></div>",
    "url": "https://skydemonorder.com/..."
  },
  {
    "id": 2,
    "title": "Chapter 2: The Heavenly Sword",
    "content": "<div class='chapter-content'><p>Lorem ipsum...</p></div>",
    "url": "https://skydemonorder.com/..."
  }
]
```

**Note**: The `content` field should contain **clean HTML** (no ads, no navigation, just the chapter text).

---

## Phase 2: React Reader App

### Goal
Build a React component that loads `chapters.json` and provides instant chapter navigation.

### Step 2.1: Create React Project

```bash
npm create vite@latest . -- --template react
# or: npx create-react-app .

cd light-novel-reader
npm install
```

### Step 2.2: App Structure

```
src/
├── components/
│   ├── ChapterReader.jsx      # Main reader component
│   ├── ChapterNav.jsx         # Navigation (dropdown, buttons)
│   └── BookmarkManager.jsx    # Save/load bookmarks
├── hooks/
│   ├── useChapters.js         # Load chapters.json
│   └── useBookmarks.js        # localStorage for bookmarks
├── styles/
│   ├── reader.css
│   ├── nav.css
│   └── global.css
├── App.jsx
└── main.jsx
```

### Step 2.3: Core Components

**File**: `src/hooks/useChapters.js`

```javascript
import { useState, useEffect } from 'react';
import chaptersData from '../data/chapters.json';

export function useChapters() {
  const [chapters, setChapters] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load chapters from bundled JSON
    setChapters(chaptersData);
    setLoading(false);
  }, []);

  return { chapters, loading };
}
```

**File**: `src/hooks/useBookmarks.js`

```javascript
import { useState, useEffect } from 'react';

export function useBookmarks() {
  const [currentChapter, setCurrentChapter] = useState(() => {
    const saved = localStorage.getItem('currentChapter');
    return saved ? parseInt(saved) : 1;
  });

  useEffect(() => {
    localStorage.setItem('currentChapter', currentChapter);
  }, [currentChapter]);

  const goToChapter = (chapterId) => setCurrentChapter(chapterId);
  const nextChapter = (totalChapters) => {
    if (currentChapter < totalChapters) setCurrentChapter(currentChapter + 1);
  };
  const prevChapter = () => {
    if (currentChapter > 1) setCurrentChapter(currentChapter - 1);
  };

  return { currentChapter, goToChapter, nextChapter, prevChapter };
}
```

**File**: `src/components/ChapterReader.jsx`

```javascript
import React from 'react';
import DOMPurify from 'dompurify';
import '../styles/reader.css';

export function ChapterReader({ chapter }) {
  if (!chapter) {
    return <div className="reader-empty">Select a chapter to read</div>;
  }

  const sanitizedHTML = DOMPurify.sanitize(chapter.content);

  return (
    <article className="chapter-reader">
      <header className="chapter-header">
        <h1>{chapter.title}</h1>
        <span className="chapter-id">Chapter {chapter.id}</span>
      </header>
      <div
        className="chapter-content"
        dangerouslySetInnerHTML={{ __html: sanitizedHTML }}
      />
    </article>
  );
}
```

**File**: `src/components/ChapterNav.jsx`

```javascript
import React, { useState } from 'react';
import '../styles/nav.css';

export function ChapterNav({
  chapters,
  currentChapterId,
  onChapterSelect,
  onNext,
  onPrev,
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [uiVisible, setUiVisible] = useState(false);
  const currentChapter = chapters.find(ch => ch.id === currentChapterId);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
  const toggleUI = () => setUiVisible(!uiVisible);

  const handleChapterSelect = (chapterId) => {
    onChapterSelect(chapterId);
    setSidebarOpen(false); // Close sidebar after selecting
  };

  return (
    <>
      {/* Header - hidden by default */}
      <header className={`app-header ${uiVisible ? 'visible' : ''}`}>
        <h1>Mount Hua Sect</h1>
        <p className="subtitle">A Light Novel Reader</p>
      </header>

      {/* Hamburger button - hidden by default */}
      <button
        className={`sidebar-toggle ${uiVisible ? 'visible' : ''}`}
        onClick={toggleSidebar}
        title="Open chapter list"
      >
        ☰
      </button>

      {/* Sidebar overlay */}
      {sidebarOpen && (
        <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`chapter-sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <h2>Chapters</h2>
          <button
            className="sidebar-close"
            onClick={() => setSidebarOpen(false)}
            title="Close"
          >
            ✕
          </button>
        </div>

        <div className="chapter-list">
          {chapters.map((ch) => (
            <button
              key={ch.id}
              className={`chapter-item ${
                ch.id === currentChapterId ? 'active' : ''
              }`}
              onClick={() => handleChapterSelect(ch.id)}
            >
              <span className="chapter-number">Ch. {ch.id}</span>
              <span className="chapter-name">{ch.title}</span>
            </button>
          ))}
        </div>
      </aside>

      {/* Bottom navigation - hidden by default */}
      <nav className={`chapter-nav ${uiVisible ? 'visible' : ''}`}>
        <button
          className="nav-button nav-prev"
          onClick={onPrev}
          disabled={currentChapterId === 1}
          title="Previous chapter"
        >
          ← Prev
        </button>

        {currentChapter && (
          <div className="nav-info">
            <span className="chapter-counter">
              {currentChapterId} / {chapters.length}
            </span>
            <div className="progress-bar">
              <div
                className="progress-fill"
                style={{
                  width: `${(currentChapterId / chapters.length) * 100}%`,
                }}
              />
            </div>
          </div>
        )}

        <button
          className="nav-button nav-next"
          onClick={onNext}
          disabled={currentChapterId === chapters.length}
          title="Next chapter"
        >
          Next →
        </button>
      </nav>

      {/* Click to show UI trigger (entire screen except sidebar and nav) */}
      <div className="ui-trigger" onClick={toggleUI} title="Click to show/hide controls" />
    </>
  );
}
```

**File**: `src/App.jsx`

```javascript
import React from 'react';
import { useChapters } from './hooks/useChapters';
import { useBookmarks } from './hooks/useBookmarks';
import { ChapterReader } from './components/ChapterReader';
import { ChapterNav } from './components/ChapterNav';
import './App.css';

function App() {
  const { chapters, loading } = useChapters();
  const { currentChapter, goToChapter, nextChapter, prevChapter } =
    useBookmarks();

  if (loading) {
    return <div className="loading">Loading novel...</div>;
  }

  if (chapters.length === 0) {
    return <div className="error">No chapters found</div>;
  }

  const chapter = chapters.find((ch) => ch.id === currentChapter);

  return (
    <div className="app">
      <header className="app-header">
        <h1>Mount Hua Sect</h1>
        <p className="subtitle">A Light Novel Reader</p>
      </header>

      <ChapterNav
        chapters={chapters}
        currentChapterId={currentChapter}
        onChapterSelect={goToChapter}
        onNext={() => nextChapter(chapters.length)}
        onPrev={prevChapter}
      />

      <main className="app-main">
        <ChapterReader chapter={chapter} />
      </main>

      <footer className="app-footer">
        <p>All chapters cached locally. Works offline!</p>
      </footer>
    </div>
  );
}

export default App;
```

### Step 2.4: Install Dependencies

```bash
npm install dompurify
```

---

## Phase 2.5: Interaction Design Overview

### Navigation Architecture - Unified Hide/Show

The reader uses a **minimalist interaction model** where ALL UI controls hide by default and appear on demand:

#### What Hides by Default
1. **Header** (title + subtitle)
2. **Hamburger button** (☰)
3. **Bottom navigation bar** (prev/next + progress)

#### Single Trigger
- **Click anywhere in the reading content** → ALL three elements slide in
- **Click again** → ALL three elements slide out
- **Click on sidebar or nav buttons** → Actions work, sidebar auto-closes on selection

#### Components

**Hamburger Button (☰)**
- **State**: Hidden by default (opacity: 0, pointer-events: none)
- **Position**: Fixed top-left
- **Trigger**: Becomes visible when content is clicked
- **Action**: Click to open chapter sidebar
- **Animation**: Smooth fade-in + slide down (300ms)

**Header**
- **State**: Hidden by default (translateY: -100%)
- **Content**: Novel title + subtitle
- **Trigger**: Appears with hamburger when content is clicked
- **Animation**: Smooth slide down from top (300ms)

**Bottom Navigation Bar**
- **State**: Hidden by default (translateY: 120%)
- **Content**: Previous button | Progress | Next button
- **Trigger**: Appears when content is clicked
- **Animation**: Smooth slide up from bottom (300ms)

**Sidebar**
- **State**: Closed by default (translateX: -100%)
- **Trigger**: Click hamburger to open
- **Animation**: Slide in from left (300ms)
- **Auto-close**: When chapter is selected or overlay is clicked

### User Flow

```
1. DEFAULT STATE
   - Only chapter content visible
   - Full screen reading space
   - Header, hamburger, nav all hidden

2. CLICK CONTENT ANYWHERE
   - Header slides down from top
   - Hamburger fades in (top-left)
   - Nav bar slides up from bottom
   - Everything appears with 300ms animation

3. TO NAVIGATE CHAPTERS
   Option A: Click hamburger (☰) → Sidebar opens → Click chapter
   Option B: Click prev/next in bottom nav → Jump to chapter

4. AFTER NAVIGATION
   - New chapter loads instantly
   - UI controls remain visible (stay on screen)
   - Click content again to hide everything

5. CLICK CONTENT AGAIN
   - Everything disappears
   - Back to minimal reading view
```

### Design Benefits

- **Maximum reading space** - No permanent UI clutter
- **One action to control** - Click content = toggle all controls
- **Touch-friendly** - Large click areas on mobile
- **Consistent behavior** - Sidebar and nav appear together
- **Distraction-free** - Content takes full attention by default
- **Full control** - Easy to access navigation when needed

### Responsive Behavior

**Desktop (>1024px)**
- Hamburger button: 44px × 44px
- Header: full width, left-padded for hamburger
- Sidebar: 280px wide (full screen aware)
- Bottom nav: full width, standard layout

**Tablet (768px - 1024px)**
- Hamburger button: 44px × 44px
- Sidebar: 100% width (full screen on open)
- Bottom nav: may stack buttons if needed

**Mobile (<768px)**
- Hamburger button: 40px × 40px, smaller font
- Sidebar: 100% full screen (covers everything)
- Bottom nav: Stack vertically (buttons full width)
- Touch targets: 44px minimum

---

### Step 3.1: Global Styles

**File**: `src/index.css`

```css
:root {
  --primary: #1a1a2e;
  --secondary: #16213e;
  --accent: #e94560;
  --text: #eaeaea;
  --text-muted: #b0b0b0;
  --border: #444;
  --bg-light: #0f3460;
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  background: var(--primary);
  color: var(--text);
  line-height: 1.6;
}

.app {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background: var(--primary);
}

.app-header {
  /* Handled by nav.css - it's now hidden by default */
}

.app-main {
  flex: 1;
  overflow-y: auto;
  padding-bottom: 80px;
  max-width: 900px;
  margin: 0 auto;
  width: 100%;
}

.app-footer {
  text-align: center;
  padding: 2rem 1rem;
  border-top: 1px solid var(--border);
  color: var(--text-muted);
  font-size: 0.85rem;
}

.loading,
.error {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  font-size: 1.2rem;
  color: var(--text-muted);
}

.error {
  color: var(--accent);
}

/* Scrollbar styling */
.app-main::-webkit-scrollbar {
  width: 8px;
}

.app-main::-webkit-scrollbar-track {
  background: transparent;
}

.app-main::-webkit-scrollbar-thumb {
  background: var(--border);
  border-radius: 4px;
}

.app-main::-webkit-scrollbar-thumb:hover {
  background: var(--text-muted);
}

@media (max-width: 768px) {
  .app-main {
    padding-bottom: 100px;
  }
}
```

### Step 3.2: Reader Styles

**File**: `src/styles/reader.css`

```css
.chapter-reader {
  background: var(--secondary);
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 3rem 2rem;
  line-height: 1.8;
  margin: 2rem 1rem;
}

.chapter-header {
  margin-bottom: 2rem;
  border-bottom: 2px solid var(--accent);
  padding-bottom: 1rem;
}

.chapter-header h1 {
  font-size: 2rem;
  color: var(--accent);
  margin-bottom: 0.5rem;
}

.chapter-id {
  color: var(--text-muted);
  font-size: 0.9rem;
}

.chapter-content {
  font-size: 1.1rem;
  line-height: 1.9;
  word-spacing: 0.05em;
}

.chapter-content p {
  margin-bottom: 1.5rem;
  text-align: justify;
}

.chapter-content p:first-letter {
  font-size: 1.2em;
  font-weight: bold;
}

.chapter-empty {
  text-align: center;
  padding: 3rem;
  color: var(--text-muted);
}

/* Responsive */
@media (max-width: 768px) {
  .chapter-reader {
    padding: 1.5rem 1rem;
    border-radius: 4px;
    margin: 1rem 0;
  }

  .chapter-header h1 {
    font-size: 1.5rem;
  }

  .chapter-content {
    font-size: 1rem;
  }
}

/* Tablet and smaller screens */
@media (max-width: 640px) {
  .chapter-reader {
    padding: 1.25rem 0.75rem;
    border: none;
    border-radius: 0;
    margin: 0.5rem 0;
  }

  .chapter-header {
    margin-bottom: 1rem;
    padding-bottom: 0.75rem;
  }

  .chapter-header h1 {
    font-size: 1.3rem;
  }

  .chapter-content {
    font-size: 0.95rem;
    line-height: 1.8;
  }
}
```

### Step 3.3: Navigation Styles

**File**: `src/styles/nav.css`

```css
/* Hamburger button - hidden by default */
.sidebar-toggle {
  position: fixed;
  top: 1rem;
  left: 1rem;
  z-index: 100;
  width: 44px;
  height: 44px;
  padding: 0;
  background: var(--accent);
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 1.5rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  box-shadow: 0 2px 8px rgba(233, 69, 96, 0.2);
  opacity: 0;
  pointer-events: none;
  transform: translateY(-20px);
}

.sidebar-toggle.visible {
  opacity: 1;
  pointer-events: auto;
  transform: translateY(0);
}

.sidebar-toggle:hover:not(.visible) {
  opacity: 0.5;
}

.sidebar-toggle:hover.visible {
  background: #ff1744;
  transform: scale(1.05);
  box-shadow: 0 4px 12px rgba(233, 69, 96, 0.3);
}

/* Header - hidden by default */
.app-header {
  background: linear-gradient(135deg, var(--secondary), var(--bg-light));
  padding: 2rem 1rem 2rem 4rem;
  border-bottom: 2px solid var(--accent);
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 50;
  transition: all 0.3s ease;
  opacity: 0;
  transform: translateY(-100%);
  pointer-events: none;
}

.app-header.visible {
  opacity: 1;
  transform: translateY(0);
  pointer-events: auto;
}

.app-header h1 {
  font-size: 1.8rem;
  color: var(--accent);
  margin-bottom: 0.25rem;
}

.app-header .subtitle {
  color: var(--text-muted);
  font-size: 0.8rem;
}

/* Sidebar overlay */
.sidebar-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 99;
  animation: fadeIn 0.2s ease;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideIn {
  from { transform: translateX(-100%); }
  to { transform: translateX(0); }
}

/* Sidebar */
.chapter-sidebar {
  position: fixed;
  top: 0;
  left: 0;
  width: 280px;
  height: 100vh;
  background: var(--secondary);
  border-right: 1px solid var(--border);
  z-index: 101;
  transform: translateX(-100%);
  transition: transform 0.3s ease;
  display: flex;
  flex-direction: column;
}

.chapter-sidebar.open {
  transform: translateX(0);
  animation: slideIn 0.3s ease;
}

.sidebar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid var(--border);
  flex-shrink: 0;
}

.sidebar-header h2 {
  font-size: 1.3rem;
  color: var(--accent);
  margin: 0;
}

.sidebar-close {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: var(--text-muted);
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: all 0.2s;
}

.sidebar-close:hover {
  background: var(--primary);
  color: var(--text);
}

/* Chapter list */
.chapter-list {
  flex: 1;
  overflow-y: auto;
  padding: 0.5rem 0;
}

.chapter-item {
  width: 100%;
  padding: 0.75rem 1rem;
  background: none;
  border: none;
  text-align: left;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  border-left: 3px solid transparent;
}

.chapter-item:hover {
  background: var(--primary);
}

.chapter-item.active {
  background: var(--bg-light);
  border-left-color: var(--accent);
}

.chapter-number {
  font-size: 0.8rem;
  color: var(--text-muted);
  font-weight: 600;
  text-transform: uppercase;
}

.chapter-name {
  font-size: 0.9rem;
  color: var(--text);
  line-height: 1.4;
}

.chapter-item.active .chapter-name {
  color: var(--accent);
  font-weight: 600;
}

/* Bottom navigation - hidden by default, shows on click */
.chapter-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: var(--secondary);
  border-top: 1px solid var(--border);
  padding: 1rem;
  display: flex;
  gap: 1rem;
  align-items: center;
  z-index: 50;
  transform: translateY(120%);
  transition: transform 0.3s ease;
}

.chapter-nav.visible {
  transform: translateY(0);
}

.nav-button {
  padding: 0.75rem 1.5rem;
  background: var(--accent);
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.2s;
  white-space: nowrap;
}

.nav-button:hover:not(:disabled) {
  background: #ff1744;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(233, 69, 96, 0.3);
}

.nav-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.nav-info {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 1rem;
  font-size: 0.9rem;
  color: var(--text-muted);
}

.chapter-counter {
  min-width: 60px;
  text-align: center;
  font-weight: 600;
}

.progress-bar {
  flex: 1;
  height: 6px;
  background: var(--border);
  border-radius: 3px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--accent), #ff1744);
  transition: width 0.3s ease;
}

/* Click trigger area - entire screen except sidebar and nav */
.ui-trigger {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  cursor: pointer;
  z-index: 10;
  background: transparent;
}

/* Responsive adjustments */
@media (max-width: 640px) {
  .sidebar-toggle {
    width: 40px;
    height: 40px;
    font-size: 1.2rem;
    top: 0.75rem;
    left: 0.75rem;
  }

  .chapter-sidebar {
    width: 100%;
  }

  .app-header {
    padding: 1.5rem 1rem 1.5rem 3.5rem;
  }

  .app-header h1 {
    font-size: 1.4rem;
  }

  .chapter-nav {
    flex-direction: column;
    gap: 0.75rem;
  }

  .nav-button {
    width: 100%;
    padding: 0.6rem 1rem;
  }

  .nav-info {
    width: 100%;
    flex-direction: column;
  }

  .progress-bar {
    width: 100%;
  }
}

/* Scrollbar styling */
.chapter-list::-webkit-scrollbar {
  width: 6px;
}

.chapter-list::-webkit-scrollbar-track {
  background: transparent;
}

.chapter-list::-webkit-scrollbar-thumb {
  background: var(--border);
  border-radius: 3px;
}

.chapter-list::-webkit-scrollbar-thumb:hover {
  background: var(--text-muted);
}
```

---

## Phase 4: Deployment to GitHub Pages

### Step 4.1: Set Up Git Repository

```bash
git init
git add .
git commit -m "Initial commit: Light novel reader"

# Create repo on GitHub, then:
git remote add origin https://github.com/YOUR_USERNAME/light-novel-reader.git
git branch -M main
git push -u origin main
```

### Step 4.2: Configure Vite for GitHub Pages

**File**: `vite.config.js`

```javascript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/light-novel-reader/',  // Replace with your repo name
})
```

### Step 4.3: Build and Deploy

```bash
# Install gh-pages package
npm install --save-dev gh-pages

# Add scripts to package.json
```

**File**: `package.json` (add these scripts)

```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "deploy": "npm run build && gh-pages -d dist"
  }
}
```

### Step 4.4: Deploy

```bash
npm run deploy
```

**Live at**: `https://YOUR_USERNAME.github.io/light-novel-reader/`

---

## Phase 5: Advanced Features (Optional)

### Feature 5.1: Dark/Light Theme Toggle

**File**: `src/hooks/useTheme.js`

```javascript
import { useState, useEffect } from 'react';

export function useTheme() {
  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem('isDark');
    return saved ? JSON.parse(saved) : true;
  });

  useEffect(() => {
    localStorage.setItem('isDark', JSON.stringify(isDark));
    document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
  }, [isDark]);

  return [isDark, setIsDark];
}
```

### Feature 5.2: Font Size Control

Add a slider in navigation to adjust `--font-size` CSS variable.

### Feature 5.3: Search Across Chapters

```javascript
const searchChapters = (query) => {
  return chapters.filter((ch) =>
    ch.title.toLowerCase().includes(query.toLowerCase()) ||
    ch.content.toLowerCase().includes(query.toLowerCase())
  );
};
```

### Feature 5.4: Chapter Annotations

Use `localStorage` to save notes per chapter.

---

## Testing Checklist

- [ ] Scraper fetches all chapters without errors
- [ ] chapters.json is valid JSON and includes all chapters
- [ ] React app loads without errors
- [ ] Chapter navigation works (dropdown, next, prev)
- [ ] localStorage saves current chapter position
- [ ] Page is responsive on mobile
- [ ] Keyboard navigation works (arrow keys for next/prev)
- [ ] Dark theme looks good
- [ ] Build completes without warnings
- [ ] GitHub Pages deployment works
- [ ] App works offline after first load

---

## Troubleshooting

| Problem | Solution |
|---------|----------|
| Scraper gets 403 Forbidden | Add delays, rotate User-Agent, use Puppeteer |
| chapters.json is too large | Gzip it or split into multiple files |
| Content has ads/junk | Refine CSS selectors in scraper |
| React app won't load on GitHub Pages | Check `base` setting in vite.config.js |
| localhost works but GitHub Pages doesn't | Check relative paths, ensure build succeeds |

---

## File Checklist

- [ ] `scraper.js` - Fetches chapters
- [ ] `public/chapters.json` - All chapter data
- [ ] `src/App.jsx` - Main app component
- [ ] `src/components/ChapterReader.jsx` - Renders chapter
- [ ] `src/components/ChapterNav.jsx` - Navigation UI
- [ ] `src/hooks/useChapters.js` - Load chapters
- [ ] `src/hooks/useBookmarks.js` - Track progress
- [ ] `src/index.css` - Global styles
- [ ] `src/styles/reader.css` - Reader styles
- [ ] `src/styles/nav.css` - Navigation styles
- [ ] `vite.config.js` - Vite configuration
- [ ] `package.json` - Dependencies and scripts
- [ ] `.gitignore` - Ignore node_modules, dist

---

## Next Steps

1. **Inspect the target website** to find correct CSS selectors for chapters
2. **Run the scraper** and verify chapters.json is correct
3. **Build the React app** locally and test chapter navigation
4. **Deploy to GitHub Pages** and share the link

Good luck! 🚀
