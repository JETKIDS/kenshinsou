# 古式健身操アプリ Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 編集済み短尺動画からランダムに5動作を選び、スマホで見ながら運動できるReact/Vite WEBアプリを作る。

**Architecture:** Vite + React + TypeScript で構成する。動作データは `src/data/exercises.ts`、ランダム選択ロジックは `src/lib/selectWorkout.ts`、画面は `src/App.tsx` に分け、動画ファイルは `public/videos/` に置く。

**Tech Stack:** React, Vite, TypeScript, Vitest, CSS

---

### Task 1: Vite React Project Scaffold

**Files:**
- Create: `package.json`
- Create: `index.html`
- Create: `src/main.tsx`
- Create: `src/App.tsx`
- Create: `src/App.css`
- Create: `src/vite-env.d.ts`
- Create: `public/videos/.gitkeep`

- [ ] **Step 1: Scaffold Vite React TypeScript app**

Run: `npm create vite@latest . -- --template react-ts`
Expected: Vite creates the React TypeScript project files in the current folder.

- [ ] **Step 2: Install dependencies**

Run: `npm install`
Expected: dependencies install and `node_modules` plus lockfile are created.

- [ ] **Step 3: Create video asset directory**

Run: `New-Item -ItemType Directory -Path public/videos -Force`
Expected: `public/videos` exists.

### Task 2: Workout Selection Logic

**Files:**
- Create: `src/data/exercises.ts`
- Create: `src/lib/selectWorkout.ts`
- Create: `src/lib/selectWorkout.test.ts`

- [ ] **Step 1: Write failing tests**

Create `src/lib/selectWorkout.test.ts` with tests for selecting five unique exercises, returning all exercises when fewer than five exist, and not mutating source data.

- [ ] **Step 2: Run test to verify RED**

Run: `npx vitest run src/lib/selectWorkout.test.ts`
Expected: FAIL because `selectWorkout` does not exist yet.

- [ ] **Step 3: Implement data and selector**

Create `src/data/exercises.ts` with 20 placeholder exercise entries and `src/lib/selectWorkout.ts` with a pure selection function.

- [ ] **Step 4: Run test to verify GREEN**

Run: `npx vitest run src/lib/selectWorkout.test.ts`
Expected: PASS.

### Task 3: Mobile-First App UI

**Files:**
- Modify: `src/App.tsx`
- Modify: `src/App.css`

- [ ] **Step 1: Implement main screen**

Build a mobile-first screen with app title, selected exercise video, generate button, and selected five-exercise list.

- [ ] **Step 2: Verify build**

Run: `npm run build`
Expected: TypeScript compilation and Vite build complete with exit code 0.

### Task 4: Local Preview

**Files:**
- No source changes expected.

- [ ] **Step 1: Start dev server**

Run: `npm run dev -- --host 0.0.0.0`
Expected: Vite dev server starts and prints a local URL.

- [ ] **Step 2: Browser check**

Open the local URL and confirm the screen renders, the random button changes the selected list, and selecting a list item changes the active video.
