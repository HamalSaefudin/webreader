# Light Novel Reader - Project Overview

## 📖 Project Summary

You're building a **fast, offline-first light novel reader** that scrapes chapters from a website once, bundles them into a React app, and deploys to GitHub Pages for free.

**Key difference from original site**: Instead of clicking "Next Chapter" repeatedly, all chapters are pre-loaded. You navigate via:
1. **Hamburger menu** (☰) → Opens sidebar with full chapter list
2. **Click content** → Bottom nav bar appears with Prev/Next buttons
3. **Both methods are instant** (no API calls, no page reloads)

---

## 📁 What You Have

Three complete markdown documents with everything you need:

### 1. **LIGHT_NOVEL_READER_PLAN.md** (Main Document)
The complete technical blueprint with all code.

**Sections:**
- **Phase 1**: Web scraping script to fetch all chapters
- **Phase 2**: React components (ChapterReader, ChapterNav)
- **Phase 2.5**: NEW - Interaction design (sidebar + hidden nav)
- **Phase 3**: All CSS styles (updated for new UI)
- **Phase 4**: GitHub Pages deployment
- **Phase 5**: Optional features (themes, search, etc.)

**Use this to**: Build the actual project, copy-paste code

---

### 2. **UI_DESIGN_SUMMARY.md** (Design Document)
Detailed explanation of the UI/UX with interactions.

**Sections:**
- Design philosophy ("clean reading experience")
- Three navigation methods explained
- Layout structure with ASCII diagrams
- Component breakdown
- Animations & interactions
- Color scheme (dark theme)
- Responsive design details
- Testing checklist

**Use this to**: Understand design decisions, explain to others

---

### 3. **QUICK_START_GUIDE.md** (Reference)
Step-by-step setup + troubleshooting.

**Sections:**
- Project structure
- Setup instructions (7 steps)
- Testing checklist
- Deployment to GitHub Pages
- Customization guide
- Troubleshooting common issues
- File size expectations

**Use this to**: Quick reference while coding

---

## 🎯 Implementation Roadmap

### Week 1: Foundation
- [ ] Set up Node.js project
- [ ] Write and test scraper script
- [ ] Verify chapters.json is complete and valid
- [ ] Set up Vite + React

### Week 2: Core Components
- [ ] Build ChapterReader component
- [ ] Build ChapterNav with sidebar (NEW)
- [ ] Implement useChapters hook
- [ ] Implement useBookmarks hook
- [ ] Test chapter navigation

### Week 3: Styling & Polish
- [ ] Apply all CSS styles
- [ ] Test sidebar animations
- [ ] Test bottom nav animations
- [ ] Mobile responsive testing
- [ ] Dark theme validation

### Week 4: Deployment
- [ ] Set up Git repository
- [ ] Deploy to GitHub Pages
- [ ] Test live version
- [ ] Gather feedback
- [ ] Fix any issues

---

## 🎨 UI at a Glance

```
┌─────────────────────────────────────────┐
│ ☰ Mount Hua Sect                        │  ← Hamburger always visible
│   A Light Novel Reader                  │
├─────────────────────────────────────────┤
│                                         │
│ Chapter 6: Inner Strength               │
│                                         │
│ The morning sun cast long shadows       │
│ across the valley as Cheng Sansi stood  │
│ at the edge of the precipice...         │
│                                         │
│ [Click anywhere to show navigation]     │
│                                         │
├─────────────────────────────────────────┤
│ ← Prev    6 / 450 [=====>]   1.3%  Next →│  ← Hidden, appears on click
└─────────────────────────────────────────┘
```

**Sidebar (when open):**
```
┌──────────────────┐
│ Chapters      ✕  │
├──────────────────┤
│ Ch. 1            │
│ Ch. 2            │
│ Ch. 3            │
│ Ch. 6 ← ◄◄◄      │  Current
│ Ch. 7            │
│ [more...]        │
└──────────────────┘
```

---

## 🚀 Key Features

### MVP (Ready to Build)
- ✅ Web scraper (Node.js + Cheerio)
- ✅ React app with instant chapter switching
- ✅ Sidebar navigator (click chapters instantly)
- ✅ Bottom nav bar (prev/next + progress)
- ✅ Auto-saves reading position (localStorage)
- ✅ Fully responsive (mobile/tablet/desktop)
- ✅ Works offline after first load
- ✅ Smooth animations
- ✅ Dark theme (default)

### v1.1 (Nice to Have)
- 📝 Light/dark theme toggle
- 📝 Font size adjustment slider
- 📝 Line height adjustment
- 📝 Chapter search functionality
- 📝 Personal bookmarks/notes

### v2.0 (Future)
- 📝 Keyboard navigation (arrow keys)
- 📝 Reading time estimate
- 📝 Cross-device sync
- 📝 Custom color themes
- 📝 Mobile swipe gestures

---

## 💻 Technology Stack

| Layer | Tech | Why |
|-------|------|-----|
| **Scraping** | Node.js + Cheerio | Fast, lightweight HTML parsing |
| **Frontend** | React 18 | Component-based, fast rendering |
| **Build** | Vite | Lightning-fast dev/build, modern |
| **Bundling** | Vite | Automatic code splitting, optimization |
| **Styling** | CSS3 | No dependencies, full control |
| **Storage** | localStorage | Free, built-in browser storage |
| **Hosting** | GitHub Pages | Free, reliable, auto-deploys |
| **Sanitization** | DOMPurify | Prevent XSS attacks on HTML content |

---

## 📊 Project Stats

### Code Size (Estimated)
- **scraper.js**: ~150 lines
- **React components**: ~400 lines
- **CSS styles**: ~300 lines
- **Total**: ~850 lines (very reasonable)

### Bundle Size (After Build)
- React app: ~180KB (minified + gzipped)
- chapters.json: 10-50MB (depends on novel)
- **Total deployed**: 10-50MB (on GitHub Pages)

### Performance
- **First load**: 2-5 seconds (depends on chapters.json)
- **Chapter switch**: <100ms (instant, already loaded)
- **Works offline**: Yes (after first load)

---

## 🎓 Learning Outcomes

Building this project teaches you:

1. **Web Scraping** - How to extract data from HTML
2. **React Patterns** - Hooks, state management, component composition
3. **CSS/Animations** - Modern CSS with smooth transitions
4. **localStorage** - Browser storage for persistent data
5. **Responsive Design** - Mobile-first CSS techniques
6. **Git Workflow** - Commit, push, deploy
7. **Static Hosting** - GitHub Pages deployment

---

## ⚡ Quick Commands Reference

```bash
# Setup
npm create vite@latest . -- --template react
npm install && npm install axios cheerio dompurify

# Scraping
node scraper.js                 # Fetch chapters

# Development
npm run dev                     # Start dev server
npm run build                   # Build for production

# Deployment
npm run deploy                  # Deploy to GitHub Pages

# Testing
npm run preview                 # Preview production build
```

---

## 🔍 File Checklist

Before you start coding, make sure you have:

- [ ] **LIGHT_NOVEL_READER_PLAN.md** - Full implementation guide
- [ ] **UI_DESIGN_SUMMARY.md** - Design reference
- [ ] **QUICK_START_GUIDE.md** - Quick reference
- [ ] **This file** - Project overview

---

## 🎯 Success Criteria

Your project is done when:

- ✅ Scraper successfully fetches all chapters
- ✅ chapters.json is valid and complete
- ✅ React app loads without errors locally
- ✅ Sidebar opens/closes smoothly
- ✅ Chapter clicking navigates instantly
- ✅ Bottom nav appears on click
- ✅ Reading position saves to localStorage
- ✅ Mobile version is responsive
- ✅ Works offline after first load
- ✅ Deployed and live on GitHub Pages
- ✅ All animations are smooth (60fps)
- ✅ No console errors or warnings

---

## 📞 Getting Help

If you get stuck:

1. **Check QUICK_START_GUIDE.md** - Troubleshooting section
2. **Check browser console** - DevTools → Console (Ctrl+Shift+J)
3. **Check Network tab** - See if files are loading
4. **Check file paths** - Make sure imports match actual files
5. **Verify JSON syntax** - chapters.json must be valid JSON
6. **Test locally first** - Before deploying to GitHub Pages

---

## 🎉 Ready to Build?

You have everything you need. The three markdown documents contain:
- ✅ Complete code ready to copy-paste
- ✅ Step-by-step instructions
- ✅ All CSS styles
- ✅ Deployment guide
- ✅ Troubleshooting tips

**Start with**: QUICK_START_GUIDE.md → Follow the 7 setup steps  
**Reference**: LIGHT_NOVEL_READER_PLAN.md → Copy code from phases  
**Understand**: UI_DESIGN_SUMMARY.md → Learn the design decisions  

Good luck! 🚀
