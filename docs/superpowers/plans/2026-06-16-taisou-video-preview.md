# Taisou Video Preview Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Use the 12 MP4 clips in `public/taisou/` as the exercise library and play a 5-second next-exercise preview before each full exercise video.

**Architecture:** Keep the existing React/Vite single-page structure. Store static exercise metadata in `src/data/exercises.ts`, and keep playback phase state inside `src/App.tsx` because it only drives this screen.

**Tech Stack:** React, TypeScript, Vite, Vitest, HTML video.

---

### Task 1: Exercise Data

**Files:**
- Modify: `src/data/exercises.ts`
- Modify: `src/data/exercises.test.ts`

- [ ] Replace sample and placeholder records with 12 records pointing at `/taisou/1.mp4` through `/taisou/12.mp4`.
- [ ] Update tests to assert that 12 clips are registered and that the first and last public paths are correct.

### Task 2: Preview Playback Flow

**Files:**
- Modify: `src/App.tsx`

- [ ] Add playback phase state: `preview`, `playing`, and `finished`.
- [ ] Use the active exercise video twice: muted autoplay preview for 5 seconds, then controlled full playback from the start.
- [ ] Advance to the next exercise when a full video ends, or finish after the fifth item.
- [ ] Reset to preview mode when the workout is regenerated or a list item is selected.

### Task 3: UI Styling

**Files:**
- Modify: `src/App.css`

- [ ] Add compact status styling for preview, active practice, and finished states.
- [ ] Keep the existing mobile-first layout and avoid changing unrelated visual structure.

### Task 4: Verification

**Commands:**
- `npm test`
- `npm run build`
- `npm run lint`

- [ ] All commands pass.
- [ ] If a command fails, fix the relevant issue and rerun it.
