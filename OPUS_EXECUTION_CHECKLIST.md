# Light Novel Reader - Complete Execution Checklist for Opus

This is the master checklist that tells Opus exactly what to do, in order. Download this along with the other files and give it to Opus.

---

## Phase 1: Web Scraping Setup & Execution

### Step 1.1: Create Project Directory and Initialize
- [ ] Create directory: `mkdir light-novel-reader && cd light-novel-reader`
- [ ] Initialize Node.js: `npm init -y`
- [ ] Install scraper dependencies: `npm install axios cheerio`
- [ ] Create file: `scraper.js` (copy from LIGHT_NOVEL_READER_PLAN.md, Phase 1.1)

### Step 1.2: Inspect Target Website
Before running scraper, analyze the site structure:
- [ ] Visit: https://skydemonorder.com/projects/3801994495-return-of-the-mount-hua-sect
- [ ] Open browser DevTools (F12) → Elements tab
- [ ] Find CSS selectors for:
  - Chapter list container (e.g., `.chapter-list`, `.chapters`)
  - Individual chapter links (e.g., `a.chapter`, `.chapter-link`)
  - Chapter title on content page (e.g., `.chapter-title`, `h1`)
  - Chapter content body (e.g., `.chapter-content`, `.content`, `article`)
- [ ] Update CSS selectors in `scraper.js` to match actual site
- [ ] Test with first 2-3 chapters only (add limit in scraper for testing)

### Step 1.3: Run Scraper
- [ ] Execute: `node scraper.js`
- [ ] Verify output: `ls -lh public/chapters.json`
- [ ] Check file size: Should be reasonable (10MB+)
- [ ] Validate JSON: `cat public/chapters.json | head -50` (should look like valid JSON)
- [ ] Count chapters: `grep -o '"id":' public/chapters.json | wc -l`
- [ ] If successful: Proceed to Phase 2
- [ ] If failed: Debug selectors and retry

### Step 1.4: Verify Scraped Data Quality
- [ ] Open `public/chapters.json` in editor
- [ ] Check first chapter:
  - [ ] Has `id`, `title`, `content` fields
  - [ ] Content is HTML (contains `<p>`, `<div>` tags)
  - [ ] No ads or navigation HTML mixed in
  - [ ] Text is readable and complete
- [ ] Check last chapter:
  - [ ] All fields present
  - [ ] Content looks clean
- [ ] Random sample check: Open middle chapter and verify quality

---

## Phase 2: React App Setup

### Step 2.1: Create React Project with Vite
- [ ] Execute: `npm create vite@latest . -- --template react`
- [ ] Install dependencies: `npm install`
- [ ] Verify Vite works: `npm run dev` (should show local server URL)
- [ ] Stop dev server: `Ctrl+C`

### Step 2.2: Create Directory Structure
```
src/
├── components/
│   ├── ChapterReader.jsx
│   └── ChapterNav.jsx
├── hooks/
│   ├── useChapters.js
│   └── useBookmarks.js
├── styles/
│   ├── reader.css
│   └── nav.css
├── App.jsx
├── index.css
└── main.jsx
```

- [ ] Create directories: `mkdir -p src/components src/hooks src/styles`
- [ ] Move/create all files in structure above

### Step 2.3: Copy Component Files
From **LIGHT_NOVEL_READER_PLAN.md** Phase 2.3, copy code to these files:

- [ ] `src/hooks/useChapters.js` - Load chapters.json
- [ ] `src/hooks/useBookmarks.js` - Track reading position
- [ ] `src/components/ChapterReader.jsx` - Render chapter content
- [ ] `src/components/ChapterNav.jsx` - Sidebar + navigation (UPDATED version with uiVisible)
- [ ] `src/App.jsx` - Main app component

### Step 2.4: Copy All CSS Files
From **LIGHT_NOVEL_READER_PLAN.md** Phase 3, copy styles to:

- [ ] `src/index.css` - Global styles (UPDATED - no header padding)
- [ ] `src/styles/reader.css` - Chapter display styles
- [ ] `src/styles/nav.css` - Header + hamburger + nav styles (NEW unified)

### Step 2.5: Install Additional Dependencies
- [ ] Install DOMPurify: `npm install dompurify`
- [ ] Verify all imports work: `npm run dev` (should start without errors)
- [ ] Check console: No errors or warnings
- [ ] Stop dev server

---

## Phase 3: Local Testing

### Step 3.1: Start Development Server
- [ ] Execute: `npm run dev`
- [ ] Open browser to localhost URL shown (usually `http://localhost:5173`)
- [ ] Page should load without errors

### Step 3.2: Test Reading Experience
- [ ] [ ] Page displays chapter content
- [ ] [ ] Content is readable with proper formatting
- [ ] [ ] No horizontal scrolling needed (responsive)
- [ ] [ ] Chapter text displays in justified alignment

### Step 3.3: Test UI Interactions
- [ ] [ ] Default state: Only content visible, no header/hamburger/nav
- [ ] [ ] Click anywhere in content: Header slides down
- [ ] [ ] Click anywhere in content: Hamburger (☰) fades in
- [ ] [ ] Click anywhere in content: Bottom nav slides up
- [ ] [ ] All three appear simultaneously (not sequentially)
- [ ] [ ] Click content again: All three disappear simultaneously
- [ ] [ ] Click hamburger: Sidebar opens from left
- [ ] [ ] Sidebar shows chapter list with current chapter highlighted
- [ ] [ ] Click chapter in sidebar: New chapter loads instantly
- [ ] [ ] Sidebar auto-closes after selecting chapter
- [ ] [ ] Click prev/next buttons: Navigate to previous/next chapter
- [ ] [ ] Progress bar shows current position
- [ ] [ ] Chapter counter shows: "X / Total"

### Step 3.4: Test Responsive Design
**On Desktop:**
- [ ] [ ] Sidebar is 280px wide
- [ ] [ ] Content is centered, max 900px wide
- [ ] [ ] All buttons properly sized (44px)

**On Tablet (Resize browser to ~768px):**
- [ ] [ ] Sidebar becomes full width when open
- [ ] [ ] Content adapts to smaller width
- [ ] [ ] All text remains readable

**On Mobile (Resize to ~375px):**
- [ ] [ ] Hamburger button: 40px × 40px
- [ ] [ ] Sidebar: full screen width
- [ ] [ ] Bottom nav stacks buttons vertically if needed
- [ ] [ ] No horizontal scrolling
- [ ] [ ] Touch targets are 44px+ (easy to tap)

### Step 3.5: Test Offline Functionality
- [ ] [ ] Open DevTools → Application → Storage → LocalStorage
- [ ] [ ] Navigate to a chapter (e.g., Chapter 10)
- [ ] [ ] Verify `currentChapter` is saved in localStorage
- [ ] [ ] Refresh page
- [ ] [ ] Should load the same chapter as before
- [ ] [ ] Enable offline mode: DevTools → Network → "Offline"
- [ ] [ ] Change chapters (should work instantly)
- [ ] [ ] All functionality works offline

### Step 3.6: Test Performance
- [ ] [ ] Page loads in <5 seconds
- [ ] [ ] Chapter switching is instant (<100ms)
- [ ] [ ] Animations are smooth (no jank/stuttering)
- [ ] [ ] Browser DevTools → Lighthouse scores:
  - [ ] Performance: >85
  - [ ] Accessibility: >90
  - [ ] Best Practices: >85

### Step 3.7: Check Console for Errors
- [ ] [ ] Open DevTools → Console tab
- [ ] [ ] No red error messages
- [ ] [ ] No yellow warnings
- [ ] [ ] No 404 errors for missing files

### Step 3.8: Stop Dev Server
- [ ] [ ] Press `Ctrl+C` to stop the server

---

## Phase 4: GitHub Pages Setup & Deployment

### Step 4.1: Create GitHub Repository
- [ ] [ ] Go to https://github.com/new
- [ ] [ ] Repository name: `light-novel-reader`
- [ ] [ ] Description: "A fast, offline-first light novel reader"
- [ ] [ ] Make it **Public** (required for free GitHub Pages)
- [ ] [ ] Click "Create repository"

### Step 4.2: Configure Vite for GitHub Pages
- [ ] [ ] Edit `vite.config.js`
- [ ] [ ] Change line `base:` to: `base: '/light-novel-reader/',`
- [ ] [ ] Save file

### Step 4.3: Install GitHub Pages Package
- [ ] [ ] Execute: `npm install --save-dev gh-pages`

### Step 4.4: Update package.json Scripts
- [ ] [ ] Open `package.json`
- [ ] [ ] Find the `"scripts"` section
- [ ] [ ] Replace/add these scripts:
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
- [ ] [ ] Save file

### Step 4.5: Initialize Git Repository
- [ ] [ ] Execute: `git init`
- [ ] [ ] Execute: `git add .`
- [ ] [ ] Execute: `git commit -m "Initial commit: Light novel reader app"`

### Step 4.6: Add Remote and Push
- [ ] [ ] Copy the HTTPS URL from your GitHub repo (green "Code" button)
- [ ] [ ] Execute: `git remote add origin https://github.com/YOUR_USERNAME/light-novel-reader.git`
- [ ] [ ] Execute: `git branch -M main`
- [ ] [ ] Execute: `git push -u origin main`
- [ ] [ ] Verify on GitHub: Repository should show all files

### Step 4.7: Deploy to GitHub Pages
- [ ] [ ] Execute: `npm run deploy`
- [ ] [ ] Wait for completion (should see "Published" message)
- [ ] [ ] Go to GitHub repo → Settings → Pages
- [ ] [ ] Verify "Source" is set to "Deploy from a branch"
- [ ] [ ] Verify branch is `gh-pages` and folder is `/root`
- [ ] [ ] Go to: `https://YOUR_USERNAME.github.io/light-novel-reader/`
- [ ] [ ] Website should be live!

---

## Phase 5: Final Testing on Live Site

### Step 5.1: Test Reading Features
- [ ] [ ] Page loads (may take 5-10 seconds first time)
- [ ] [ ] Can read chapters
- [ ] [ ] Can navigate with hamburger + sidebar
- [ ] [ ] Can navigate with prev/next buttons
- [ ] [ ] Progress bar shows correct position
- [ ] [ ] Works in different browsers (Chrome, Firefox, Safari, Edge)

### Step 5.2: Test on Mobile
- [ ] [ ] Open on phone/tablet
- [ ] [ ] Controls appear/disappear correctly
- [ ] [ ] Sidebar scrolls properly
- [ ] [ ] Text is readable (good font size)
- [ ] [ ] Buttons are easy to tap
- [ ] [ ] No layout issues

### Step 5.3: Test Offline (Mobile)
- [ ] [ ] Open app in browser (loads from cache)
- [ ] [ ] Toggle airplane mode on
- [ ] [ ] Can still read chapters
- [ ] [ ] Can navigate without internet
- [ ] [ ] Works completely offline

### Step 5.4: Share & Get Feedback
- [ ] [ ] Share link: `https://YOUR_USERNAME.github.io/light-novel-reader/`
- [ ] [ ] Test with friends/family
- [ ] [ ] Note any feedback
- [ ] [ ] Make improvements as needed

---

## Phase 6: Optional Enhancements (After MVP Works)

- [ ] Add keyboard navigation (arrow keys)
- [ ] Add font size slider in nav bar
- [ ] Add light/dark theme toggle
- [ ] Add chapter search functionality
- [ ] Add bookmark/note system
- [ ] Optimize chapters.json size (gzip)
- [ ] Add reading time estimates
- [ ] Add custom color themes

---

## Troubleshooting During Execution

### If Scraper Fails
- [ ] Check CSS selectors match actual site structure
- [ ] Add delays between requests: `await sleep(2000)`
- [ ] Try with Puppeteer instead of Cheerio if site uses JavaScript
- [ ] Manually inspect page with DevTools to find correct selectors

### If React App Won't Start
- [ ] Check all imports are correct: `import { ChapterNav } from './components/ChapterNav'`
- [ ] Verify file paths match directory structure
- [ ] Check `npm install` completed successfully
- [ ] Delete `node_modules` and run `npm install` again

### If Deployment Fails
- [ ] Verify Git repository is initialized: `git status`
- [ ] Check remote is added: `git remote -v`
- [ ] Verify branch is `main`: `git branch`
- [ ] Check `vite.config.js` has correct `base` setting
- [ ] Run `npm run build` to check for build errors

### If Live Site is Blank
- [ ] Check browser console for JavaScript errors
- [ ] Verify GitHub Pages is enabled in repo settings
- [ ] Check `gh-pages` branch exists in GitHub
- [ ] Clear browser cache: `Ctrl+Shift+Delete`
- [ ] Check that chapters.json loaded: DevTools → Network → chapters.json

---

## Success Checklist - You're Done When:

- ✅ Scraper successfully fetched all chapters to `public/chapters.json`
- ✅ React app runs locally with `npm run dev` without errors
- ✅ All UI interactions work (toggle, sidebar, nav)
- ✅ Chapter navigation works (instant switching)
- ✅ Reading position saved to localStorage
- ✅ Responsive design works on all screen sizes
- ✅ App works offline
- ✅ Live deployment works at GitHub Pages URL
- ✅ Shared link is accessible to others
- ✅ No console errors in production

---

## Files You Need

Download these 4 files before starting:

1. **LIGHT_NOVEL_READER_PLAN.md** - Complete code for all phases
2. **UI_DESIGN_SUMMARY.md** - Design reference
3. **UNIFIED_UI_CHANGES.md** - UI behavior explanation
4. **THIS FILE** - Your execution checklist

---

## How to Use This With Opus

1. Download all 4 files
2. Tell Opus: "Execute this todo list. Here's the checklist. Start from Phase 1, Step 1.1 and go through each step. For each step, do what it says and check it off. If you need code, get it from LIGHT_NOVEL_READER_PLAN.md. Tell me when each phase is complete."
3. Opus will work through systematically
4. You review each phase and confirm before moving to next

---

## Estimated Time

- **Phase 1** (Scraping): 15-30 minutes
- **Phase 2** (React Setup): 20-30 minutes  
- **Phase 3** (Local Testing): 30-45 minutes
- **Phase 4** (Deployment): 15-20 minutes
- **Phase 5** (Live Testing): 10-15 minutes
- **TOTAL**: ~2-2.5 hours

---

**You're ready! Download the files and give this checklist to Opus.** 🚀
