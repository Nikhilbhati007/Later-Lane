# Phase 1: Visual Design System & Wireframe Blueprints

This document contains the visual design system, token specifications, layout schematics, and hand-drawn wireframe guides for **Later Lane** to fulfill the Phase 1 coursework deliverable.

---

## 1. Design System Tokens

- **Font Family**: `Plus Jakarta Sans`, system-ui, -apple-system, sans-serif
- **Dark Theme (Default)**: `#0d121d` (Restful Slate / Midnight)
- **Light Theme**: `#f7f9fc` (Restful Oat Cream)
- **Primary Brand (Lane)**: `#10b981` (Emerald 500)
- **Urge Highlight**: `#f59e0b` (Amber 500)
- **Elevation Surfaces**: `#141b29` (Cards) & `#1a2336` (Pills/Inputs)
- **Touch Targets**: Minimum 48×48px with 16px corner radius
- **Philosophy**: Zero red alerts, zero guilt streaks, low-contrast calming layout.

---

## 2. The 4 Core Screens & Wireframes

### Screen 1: Set Intent (`screen-intent`)
- **Purpose**: Lowers cognitive threshold by demanding only one sentence and one duration.
- **Components**:
  - Focus Question Input: *"What is the single thing?"*
  - Subject Tag Chips: `🎯 Deep Work`, `📚 Study`, `✍️ Writing`, `💻 Coding`, `📝 Assignment`
  - Quick Duration Pills: `15m`, `25m (Default)`, `45m`, `60m`
  - Pre-flight Rule Card: *"Don't fight the urge. Park it."*
  - CTA Button: `Enter Focus Session →`

### Screen 2: Focus Session & Breathing Timer (`screen-focus`)
- **Purpose**: Distraction-free countdown with grounding respiratory cadence.
- **Components**:
  - Pinned Intent Header with area badge
  - Circular SVG progress ring with 4-second breathing pulse
  - Large Monospace Countdown (`25:00`)
  - Ambient Sound Selector: `Off`, `🌧️ Rain`, `🌊 Waves`, `🧘 432Hz Drone`
  - **The Big "Park This Urge" Button** (with keyboard shortcut `P`)
  - Controls: Pause/Resume (`Space`), End Early
  - **The Live Later Lane Shelf**: Shows parked cards accumulating safely at the bottom.

### Screen 2b: The Stuck Signal Sheet / Overlay (The USP)
- **Purpose**: Under 5-second urge logging that uncovers the root cause.
- **Components**:
  - Short urge description input with 1-tap quick pills (`Check Instagram`, `Reply to text`, `Look up random question`)
  - **5 Reason Chips**: `🤯 Confusing`, `🥱 Bored`, `😴 Tired`, `😰 Anxious`, `🔄 Just Habit`
  - **Smart Strategy Card**: Instant micro-intervention (Rubber ducking, active recall, stretch & hydrate, 4-4-4 box breathing guide)
  - `Park Urge & Return` button + `⚡ Quick Park (Skip Reason)` for 2-second logging.

### Screen 3: Planned Break & Urge Expiry Review (`screen-break`)
- **Purpose**: Break countdown + the realization that parked urges evaporate on their own.
- **Components**:
  - Break Countdown: `05:00` with `+5m` button
  - Urge Expiry Review: List of all session urges with `🍃 Faded away` vs `⚡ Still want to do` toggles
  - Dynamic Realization Card: *"3 of 4 urges faded on their own (75%) — saved ~30 minutes of lost focus!"*
  - Actions: `Complete & View Reflection` or `Start Next Session`.

### Screen 4: Attention Pattern Map & Reflection (`screen-reflection`)
- **Purpose**: Shame-free self-discovery of attention rhythms.
- **Components**:
  - Key Metrics: Total Sessions, Focus Minutes, Urges Parked, Fade Rate (%)
  - Gentle Focus Insights: Plain-language observations based on data
  - Attention Waveform Histogram: Urges grouped by session minute (`0-5m`, `6-10m`, `11-15m`, `16-20m`, `21-25m`, `26-30m`, `31m+`)
  - Stuck Signal Distribution: Breakdown by trigger reason
  - Local History Table, JSON Export, and Data Reset.

---

## 3. Hand-Drawn Wireframing Guide for Your Portfolio

When sketching your wireframes on paper for the course submission:
1. Use a black fineliner pen on dotted or plain paper.
2. Draw a simple phone or laptop viewport frame for each screen.
3. Keep the "Park this urge" button on Screen 2 oversized (at least 25% of the viewport height).
4. Clearly show the bottom sheet sliding up over the dimmed timer on Screen 2b.
5. In your annotations, point an arrow to the **Stuck Signal chips** and write: *"USP: Identifies why the user got stuck rather than just blocking the app."*

