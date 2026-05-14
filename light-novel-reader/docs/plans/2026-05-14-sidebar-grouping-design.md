# Sidebar Chapter Grouping Design

## Overview

Add a dropdown to the sidebar that lets users filter chapters by groups of 200. Selecting a group shows only chapters within that range.

## User Requirements

- **Group selection UI**: Dropdown selector at top of sidebar
- **Group range labels**: e.g., "1-200", "201-400", "1801-1900"
- **Behavior**: When user selects a group, just filter the list (no auto-navigate to first chapter)

## Key Files to Modify

| File | Changes |
|------|---------|
| `src/components/ChapterNav.jsx` | Add dropdown, filter state, grouped chapter list |
| `src/hooks/useChapters.js` | Already returning full chapter list - no changes needed |
| `src/styles/nav.css` | Add dropdown styling |

## Implementation Tasks

### Phase 1: Add Group Calculation and State

- Calculate group ranges dynamically from total chapter count
- Add state: `selectedGroup` (default: "all")
- Group format: `{ start: 1, end: 200, label: "1-200" }`

### Phase 2: Add Dropdown UI

- Place dropdown at top of sidebar, above chapter list
- Options: "All Chapters" + each group range
- Default selection based on current chapter's group (optional enhancement)

### Phase 3: Implement Chapter Filtering

- Filter `chapters` array based on `selectedGroup`
- Only show chapters within selected range

### Phase 4: Style Dropdown

- Match existing sidebar aesthetic (colors, fonts from nav.css)

## Data Flow

```
chapters (flat list) → filter by selectedGroup → filteredChapters → render list
```

## Edge Cases

- **0 chapters**: Show "No chapters" message
- **Partial last group**: Last group may have < 200 chapters (e.g., "1801-1900" with only 100)
- **Current chapter outside selected group**: Just filter the list, no navigation