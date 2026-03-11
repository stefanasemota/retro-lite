# Architecture Overview - Retro-Lite v2

## System Context
Retro-Lite is a high-performance, real-time collaboration tool for agile retrospectives. It focuses on the "Roter Faden" (Red Thread) - a logical drill-down from observations to concrete actions.

## Core Concepts

### 1. Hierarchical Data (Drill-Down)
The system uses a parent-child relationship for all entries:
- **Phase 1 (4L)**: Root entries (no parentId).
- **Phase 2 (Insights)**: Child of a selected Phase 1 entry.
- **Phase 3 (Solutions)**: Child of a selected Phase 2 entry.
- **Phase 4 (Actions)**: Final commitment based on a Phase 3 entry.

### 2. State Management (useRetroStore)
A custom hook `useRetroStore.js` manages all Firebase interactions and derived state.
- **Reactivity**: Uses `onSnapshot` for instantaneous updates across all participants.
- **Local Cache**: Derived state (filtered entries, winner identification) is calculated locally in real-time.

### 3. Admin Control Tower
Admins (Hosts) have specialized UI to:
- Manually override session phases.
- Navigate via `navigationHistory` (Branching Log).
- Control visibility (Blur/Unblur).

## Data Schema (Firestore)

### Sessions
- `id`: Unique room code.
- `drillPath`: Array of objects tracking the current discussion branch.
- `navigationHistory`: Registry of all visited discussion nodes.
- `isBlurred`: Privacy toggle.

### Entries
- `parentId`: Links the entry to its predecessor in the hierarchy.
- `votes`: Number of upvotes.
- `voters`: Array of User UIDs to prevent double voting.
- `phase`: The phase during which the entry was created.

## UI Principles
- **Responsive Flex-Layout**: Horizontal on Desktop, Vertical on Mobile.
- **Glassmorphism**: Use of `backdrop-blur` and `bg-white/80` for a modern aesthetic.
- **Compact Sidebar**: Permanent orientation through the Context Sidebar.
