# Retro-Lite v2 🚀

[![CI](https://github.com/stefanasemota/retro-lite/actions/workflows/ci.yml/badge.svg)](https://github.com/stefanasemota/retro-lite/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

**Retro-Lite** is a premium, real-time collaboration tool designed to turn messy team discussions into actionable results. By following a structured 4-step drill-down process, it ensures no insight is lost and every problem finds its owner.

---

## 📖 Table of Contents
1. [Core Features](#-core-features)
2. [Getting Started](#-getting-started)
3. [The 4-Step Workflow](#-the-4-step-workflow)
4. [Architecture](#-architecture)
5. [Development](#-development)

---

## ✨ Core Features
- **Real-time Sync**: Powered by Firebase Firestore for zero-latency collaboration.
- **Context Sidebar**: A permanent "Red Thread" view so participants never lose focus.
- **Admin Control Tower**: Advanced navigation and phase control for facilitators.
- **Privacy First**: Dynamic "Blur" mode to prevent cognitive bias during brainstorming.
- **Export**: Instant CSV export for reporting.

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- Firebase Project

### Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/stefanasemota/retro-lite.git
   cd retro-lite
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables:
   Create a `.env.local` file with your Firebase credentials:
   ```env
   VITE_FIREBASE_API_KEY=your_key
   ...
   ```
4. Start development:
   ```bash
   npm run dev
   ```

---

## 🔄 The 4-Step Workflow
1. **⛵ Segelboot (Gather Data)**: Brainstorming using the 4L method (Liked, Learned, Lacked, Longed For).
2. **🔍 Insights (Generate Insights)**: Deep-dive into the "Why" of the winning cards.
3. **💡 Solutions (Decide What to Do)**: Brainstorming actionable solutions.
4. **✅ Actions (Concrete Actions)**: Assigning owners and deadlines.

---

## 🏗️ Architecture
The project follows a modular React architecture with a clear separation of concerns:
- **`logic.js`**: Pure business logic (Winners, Phases, Rules) - 100% testable.
- **`components.jsx`**: Reusable UI components (EntryCard, BoardView, Sidebar).
- **`App.jsx`**: Main application container and view orchestration.
- **`useRetroStore.js`**: Custom hook encapsulating Firebase & State management.

Detailed documentation can be found in `docs/ARCHITECTURE.md`.

---

## 🛠️ Development

### Scripts
- `npm run dev`: Start Vite development server.
- `npm run build`: Build production bundle.
- `npm test`: Run unit tests with Vitest.
- `npm run lint`: Run ESLint checks.

---

## ⚖️ License
Distributed under the MIT License. See `LICENSE` for more information.
