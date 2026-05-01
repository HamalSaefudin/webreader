# Updated UI Design - Unified Hide/Show Controls

## What Changed

The header and hamburger button now have the **same behavior as the prev/next navigation** - they all hide by default and appear together when you click the content.

---

## New Interaction Model

### Before
- ❌ Hamburger button always visible
- ❌ Header always visible  
- ❌ Only nav bar hidden

### After  
- ✅ Hamburger button hidden by default
- ✅ Header hidden by default
- ✅ Navigation bar hidden by default
- ✅ **All three appear together** when you click the content
- ✅ **All three disappear together** when you click again

---

## How It Works

### Default Reading Mode
```
Just the chapter content, full screen, no UI visible
↓
Click anywhere in the content
↓
Three things slide in:
  1. Header slides down from top
  2. Hamburger button fades in
  3. Navigation bar slides up from bottom
↓
All animations happen at the same time (300ms)
↓
Click content again → Everything hides
```

---

## Component Changes

### React Component (ChapterNav.jsx)
**Changed**: One state variable instead of two

```javascript
// Before:
const [sidebarOpen, setSidebarOpen] = useState(false);
const [navVisible, setNavVisible] = useState(false);

// After:
const [sidebarOpen, setSidebarOpen] = useState(false);
const [uiVisible, setUiVisible] = useState(false);  // Controls ALL UI
```

**How it works**:
- `uiVisible` = true: Header, hamburger, and nav all show
- `uiVisible` = false: Header, hamburger, and nav all hide
- `sidebarOpen` = true: Sidebar opens (independent of uiVisible)

---

## CSS Changes

### Header (app-header)
```css
.app-header {
  position: fixed;
  top: 0;
  opacity: 0;
  transform: translateY(-100%);  /* Starts off-screen */
  pointer-events: none;          /* Can't click when hidden */
  transition: all 0.3s ease;
}

.app-header.visible {
  opacity: 1;
  transform: translateY(0);      /* Slides down to view */
  pointer-events: auto;
}
```

### Hamburger Button (sidebar-toggle)
```css
.sidebar-toggle {
  position: fixed;
  top: 1rem;
  left: 1rem;
  opacity: 0;
  pointer-events: none;
  transform: translateY(-20px);  /* Subtle hidden position */
  transition: all 0.3s ease;
}

.sidebar-toggle.visible {
  opacity: 1;
  pointer-events: auto;
  transform: translateY(0);      /* Fades in */
}
```

### Bottom Navigation (chapter-nav)
```css
.chapter-nav {
  position: fixed;
  bottom: 0;
  transform: translateY(120%);   /* Starts below screen */
  transition: transform 0.3s ease;
}

.chapter-nav.visible {
  transform: translateY(0);      /* Slides up to view */
}
```

---

## Trigger Element

A new `.ui-trigger` element covers the entire screen:

```javascript
<div className="ui-trigger" onClick={toggleUI} />
```

This element:
- Covers the full screen
- Has `z-index: 10` (behind header, hamburger, nav when visible)
- Invisible (transparent background)
- Toggles all UI controls on click

---

## Visual Flow

```
┌─────────────────────────┐
│   Reading Mode          │
│  (Hidden UI)            │
│                         │
│  Click anywhere →       │
└─────────────────────────┘
          ↓
┌─────────────────────────┐
│ ☰ Header ↓              │  ← Header slides down
│  Content                │
│  Reading                │
│  Text...                │
│                         │
│  ← Prev | Nav ↑ Next →  │  ← Nav slides up
└─────────────────────────┘
          ↓
      Click again
          ↓
┌─────────────────────────┐
│                         │
│   Reading Mode          │
│  (Hidden UI)            │
│                         │
└─────────────────────────┘
```

---

## Browser DevTools Reference

If you want to debug the visibility:

```javascript
// In browser console:
document.querySelector('.app-header').classList.add('visible');      // Show
document.querySelector('.sidebar-toggle').classList.add('visible');  // Show
document.querySelector('.chapter-nav').classList.add('visible');     // Show

// Hide:
document.querySelector('.app-header').classList.remove('visible');
```

---

## Animation Timing

All animations are synchronized:
- **Duration**: 300ms
- **Easing**: ease (smooth)
- **Direction**: All slide/fade at the same time
- **Reversible**: Clicking again triggers the reverse animation

---

## Performance Notes

**No impact on performance because:**
- Using CSS transitions (GPU accelerated)
- Only changing `opacity`, `transform`, and `pointer-events`
- No layout reflows or repaints
- Smooth 60fps animation on all devices

**Browser Compatibility:**
- Works on all modern browsers
- CSS transforms are well-supported
- Fallback: Instant show/hide without animation (if CSS not supported)

---

## Touch Behavior on Mobile

On touchscreen devices:
- Tap content → Controls appear
- Tap hamburger → Sidebar opens
- Tap chapter → Sidebar closes, new chapter loads
- Tap content again → Controls disappear
- Tap sidebar overlay → Sidebar closes

All interactions feel natural and responsive.

---

## Files Updated

1. **LIGHT_NOVEL_READER_PLAN.md**
   - ChapterNav.jsx component (new state management)
   - nav.css (header + hamburger hide/show styles)
   - index.css (removed header padding)
   - Phase 2.5 (new interaction design explanation)

2. **UI_DESIGN_SUMMARY.md**
   - Updated design philosophy
   - New layout structure diagrams
   - Unified animation explanation
   - Interactions section rewritten

3. **QUICK_START_GUIDE.md**
   - (No changes needed, still valid)

---

## Testing Checklist

After implementing:

- [ ] Click content → Header slides down
- [ ] Click content → Hamburger fades in
- [ ] Click content → Nav bar slides up
- [ ] All three appear simultaneously
- [ ] Click content again → All three disappear
- [ ] All three disappear simultaneously
- [ ] Hamburger works when visible
- [ ] Nav buttons work when visible
- [ ] Sidebar opens/closes properly
- [ ] Animations are smooth (60fps)
- [ ] On mobile: responsive layout
- [ ] No console errors

---

## Summary

Your light novel reader now has a **truly minimal interface**:
- Default: Just the content
- Click: Full controls appear
- Click again: Controls disappear
- All controls appear/disappear together with smooth animations
- Maximum reading space with easy access to navigation

The design prioritizes the **reading experience first**, with navigation as an on-demand feature.
