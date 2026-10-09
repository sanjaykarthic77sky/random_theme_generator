# THEME RUSH — Random Theme Allocation System

> **Round 2 — Creativity** &bull; College Web Development Championship

A high-performance, dark-mode cybernetic dashboard for allocating random website development themes to 20–30 participating teams during college hackathons and technical symposiums.

---

## 🌟 Key Features

1. **100% Fair & Balanced Allocation Engine**
   - Implements cryptographic/Fisher-Yates randomization.
   - **Guaranteed Balanced Distribution:** Max difference between the number of teams assigned to any two themes is $\le 1$ (e.g., for 25 teams across 6 tracks: five themes get 4 teams, one theme gets 5 teams).
   - Every theme is assigned at least once before any theme receives a second team (when teams $\ge$ themes).
   - Supports any number of teams and themes (including $N < M$ edge case).

2. **Exciting Slot-Machine Roulette Draw Experience**
   - Live animated slot-machine cycling effect with Web Audio API sound effects (tick sounds, fanfare chords, click feedback).
   - Canvas confetti celebrations on theme reveals.
   - Immediate automatic persistence to `localStorage`.

3. **Alternative "Allocate All Teams" Mode**
   - 1-click batch allocation for organizers who want to prepare allocations in advance with safety confirmation modal.

4. **Dedicated Projector / Presentation Mode**
   - High-contrast, giant typography (readable from 50+ feet across an auditorium).
   - Slideshow navigation (Previous / Next) through revealed teams.
   - Live stage draw button right within projector view.
   - **Keyboard Shortcuts:** `Space` / `Right Arrow` for next, `Left Arrow` for previous, `F` for fullscreen, `Esc` to exit.

5. **Team & Theme Management**
   - Individual team registration and multiline bulk paste registration.
   - Auto-numbering and duplicate name prevention.
   - Default sample roster of 25 teams (`Team 01` to `Team 25`).
   - 6 curated default themes with categories, icons, and organizer evaluation notes.
   - **Roster Lock Safety:** Automatically locks team and theme editing while an allocation is active to prevent accidental corruption.

6. **Results & Reporting**
   - Searchable, sortable, and filterable results table.
   - Theme track breakdown matrix with live count pills.
   - **CSV Export:** Downloads `theme-rush-round-2-results.csv` formatted for Microsoft Excel.
   - **Print / PDF View:** Dedicated printable stylesheet for handing out physical allocation sheets.

---

## 🚀 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Start Development Server
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

### 3. Production Build
```bash
npm run build
npm run preview
```

---

## 🛠 Tech Stack

- **Framework:** React 19 + Vite 8
- **Styling:** Tailwind CSS v4 + Vanilla CSS custom cyber glowing panels
- **Icons:** Lucide React
- **Celebration Effects:** Canvas Confetti
- **Audio:** Web Audio API Native Synthesizer (Zero external audio files required)
- **Persistence:** LocalStorage API

---

## 🧪 Unit Tests

Run the pure algorithm suite to verify mathematical fairness and balance constraints:
```bash
node src/tests/allocation.test.js
```
*(Runs 35 automated assertion tests verifying quotas, bounds, bulk allocations, and sequential draws).*
