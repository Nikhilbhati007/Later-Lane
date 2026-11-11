# Later Lane 🚗🍃
> **A calm focus app for the urge to check your phone.**  
> *Park the urge instead of fighting it. Decode your attention with the Stuck Signal.*

---

## 🌟 Overview & Core Idea

Most productivity and focus apps rely on **blocking, guilt, or artificial gamification** (app blockers, timers with streak counters, death-of-a-tree animations). When an impulse hits ("just check Instagram", "reply to Rahul"), these tools treat the urge as an adversary to be suppressed.

**Later Lane takes a fundamentally different psychological approach:**
Instead of fighting the urge, **it parks it.**

1. **Set Intent**: One task, one length, one sentence. ("What's the single thing?")
2. **Focus Session**: A calm timer with a rhythmic breathing ring and one big, accessible button: **"Park this urge"**.
3. **The Stuck Signal (USP)**: When an urge hits, you tap it, jot down ~3 words, and tap why you got stuck (`Confusing`, `Bored`, `Tired`, `Anxious`, `Just Habit`). The app responds with an empathetic micro-strategy (e.g., rubber ducking, 4-4-4 box breathing, hydration reset) rather than a lecture.
4. **Planned Break & Urge Expiry Review**: At break time, your parked urges are waiting for you. You review them with a calm realization: **most impulses fade completely on their own** once the itch is acknowledged.
5. **Attention Pattern Map**: Zero streaks, zero red warnings, zero guilt. Pure self-discovery showing when your focus tends to dip and which tasks trigger avoidance.

---

## 🚀 Key Features Built

| Screen / Feature | What it Does | Why it Works |
| :--- | :--- | :--- |
| **Set Intent** | Single task input with category tags (`Deep Work`, `Study`, `Writing`, `Coding`) and duration presets (15m, 25m, 45m, 60m). | Eliminates cognitive overload before work starts. |
| **Calm Breathing Timer** | Circular SVG progress ring with gentle 4-second breathing glow, session pause/resume, and keyboard shortcuts (`Space`, `P`, `Esc`). | Keeps nervous system regulated during deep work. |
| **Ambient Focus Audio** | 100% offline synthesized background sound (Gentle Rain, Brownian Waves, 432Hz Calm Drone) generated via the Web Audio API — **zero external audio files or downloads required**. | Masks auditory distractions offline. |
| **The Big "Park Urge" Button** | Accessible one-tap button and keyboard trigger (`P`). | Gives the brain permission to let go of the thought. |
| **The Stuck Signal (USP)** | 5-second categorization of the urge (`Confusing`, `Bored`, `Tired`, `Anxious`, `Just Habit`) with instant micro-strategies. Skippable with 1 tap. | Addresses the root cause of distraction instead of shaming the symptom. |
| **The "Later Lane" Live Shelf** | Parked urges visually slide down with GSAP physics into a dedicated parking bay at the bottom of the session screen. | Visual proof to your subconscious that the urge is safe and will not be forgotten. |
| **Urge Expiry Review** | At break time, user marks whether each urge `Faded away` or `Still want to do`. Calculates personal fade rate (e.g., *"4 of 5 urges faded on their own — saved ~40 mins!"*). | Builds intrinsic motivation through direct evidence. |
| **Attention Pattern Map** | Histogram of urges by minute of session, Stuck Signal breakdown, dynamic plain-language insights, and local history table. | Identifies focus drop-off points (e.g., "Urges peak around minute 18"). |
| **Offline-First PWA** | Web App Manifest, Service Worker caching (`sw.js`), vector icons, and `localStorage` persistence. | Works without internet; collects zero personal data. |
| **Accessibility & Themes** | Dark (Deep Slate) and Light (Restful Cream) themes, high contrast ratios, full keyboard navigation, and `prefers-reduced-motion` compliance. | Inclusive and easy on the eyes during late-night study sessions. |

---

## 🛠️ Technology Stack

- **Frontend**: Semantic HTML5, Vanilla JavaScript (ES6+ modular classes).
- **Styling**: Tailwind CSS utility classes + custom CSS variables for theme and breathing animations (`css/styles.css`).
- **Animations**: GSAP (GreenSock) for organic spring physics, card docking, and breathing timers (with reduced-motion fallbacks).
- **Audio Engine**: Native Web Audio API synthesizer for chimes and procedural ambient sounds (no external MP3/WAV assets).
- **Storage**: Client-side `localStorage` with JSON export/import and zero external analytics or trackers.
- **PWA**: `manifest.json` and `sw.js` for full offline installation on Android, iOS, Windows, and macOS.

---

## 📂 Project Structure

```text
Later Lane/
├── index.html                                 # Single-page PWA shell
├── manifest.json                              # PWA manifest
├── sw.js                                      # Service Worker for offline support
├── css/
│   └── styles.css                             # Theme variables, breathing ring, lane shelf styles
├── js/
│   ├── audio.js                               # Web Audio API synthesizer & procedural ambient sounds
│   ├── storage.js                             # LocalStorage manager & pattern analytics engine
│   ├── animations.js                          # GSAP animation controller (parking, breathing, modals)
│   └── app.js                                 # Main application logic & state machine
├── assets/
│   ├── icon.svg                               # Vector brand icon
│   ├── icon-192.png                           # 192x192 PWA icon
│   └── icon-512.png                           # 512x512 PWA icon
├── docs/
│   ├── phase_0_research_and_competitors.md    # Problem statement, competitor teardown, interview guide
│   ├── phase_1_wireframes_and_design.md       # Design tokens, screen blueprints, Stranger Test
│   ├── phase_6_usability_testing.md           # 3-task test protocol, observation table, revision log
│   └── phase_7_report_and_presentation.md     # Report outline, 10-slide deck plan, AI attribution log
├── vercel.json                                # PWA service-worker & manifest HTTP headers
├── .vercelignore                              # Keeps local assignment docs private on deploy
└── README.md                                  # Complete documentation & assignment guide
```

---

## 💻 How to Run the App

### Option 1: Direct File Open (Easiest)
Simply double-click `index.html` or drag it into any modern web browser (Chrome, Edge, Safari, Firefox). All core features, timers, sounds, and local storage work out of the box!

### Option 2: Local HTTP Server (Recommended for PWA Install)
To test PWA installation and service workers:
```bash
# Using Node:
npx serve .

# Or using Python:
python -m http.server 8000
```
Then visit `http://localhost:8000` in your browser.

---

## ⌨️ Keyboard Shortcuts

- `Space`: Pause or resume active focus session
- `P` or `U`: Instantly open the "Park this urge" sheet
- `Esc`: Close open sheets or breathing modal
- `1-5`: Select Stuck Signal reasons when the sheet is open

---

## 📋 Usability Testing Guide (For Course Deliverable)

To satisfy the usability testing requirements of the assignment:
1. **Recruit 5–8 classmates/peers**.
2. **Give them 3 realistic tasks**:
   - *Task 1*: "Set a 25-minute focus session for studying a specific chapter or completing an assignment."
   - *Task 2*: "While the session is running, pretend you had an impulse to check Instagram or message a friend. Park that urge in Later Lane and choose your reason."
   - *Task 3*: "When the session finishes, complete your break review and check your Attention Pattern Map."
3. **Record Key Questions**:
   - Did the Stuck Signal prompt feel helpful or like friction? (Notice how fast they complete it — target is < 5 seconds).
   - How did the Urge Expiry Review feel compared to standard app blockers?
4. **Document Two Design Changes**:
   - Note down points of hesitation and implement 2 documented revisions in the revision log.

---

## 🛡️ Privacy by Design

- **Zero telemetry**: No Google Analytics, no tracking pixels, no third-party cookies.
- **Zero backend**: All sessions, urges, and reflection statistics remain 100% on the user's local device.
- **Data Portability**: Users can export their full focus history as a JSON file or clear it at any time.

---

## 🤖 AI Assistance Acknowledgement

In compliance with academic integrity guidelines:
- **Concept & Architecture**: Built according to the user specification and project roadmap.
- **Implementation**: AI assistance utilized for scaffolding HTML/CSS/JS, GSAP animation orchestration, procedural Web Audio API synthesis, and documentation.
- **Verification**: Verified syntax and state transitions across all 4 application screens.

