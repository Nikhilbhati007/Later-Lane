# Phase 6: Usability Testing Protocol & Revision Record

> **Roadmap Milestone**: Phase 6 — Test and Revise  
> **Target Sample**: 5–8 consenting student peers  
> **Primary Research Question**: *"Does the Stuck Signal prompt feel helpful and calming, or like annoying friction?"*  
> **Done When**: You have task completion rates, a list of confusion points, and at least two before/after documented design revisions.

---

## 1. Pre-Test Setup & Privacy Protocol

### 🔒 Ethical & Privacy Checklist (Zero Personal Data)
- Do **not** record participants' full names; label sheets `P1`, `P2`, `P3`, etc.
- Ask participants to use **simulated or generic urges** during testing (e.g., *"Check Instagram"*, *"Reply to Rahul"*) rather than private personal messages.
- Clear `localStorage` between participants using **Pattern Map → Clear Data**, or use **Load Demo Data** when testing Task 3.

### 🛠️ Moderator Setup (2 Minutes Before Each Session)
1. Start the local server (`python -m http.server 8000`) and open `http://localhost:8000`.
2. Ensure sound is enabled or headphones are available if testing ambient sounds.
3. Have a stopwatch ready to time **Task 2 (Time-to-Park)**.
4. Read the opening script aloud:
   > *"Hi! Thanks for helping test **Later Lane**. Remember, we are testing the app, not you—there are no wrong clicks. Please think out loud as you go so I can hear what feels clear or confusing. Your data stays completely on this device and won't be shared anywhere."*

---

## 2. The 3 Standardized Test Tasks

Give one task card at a time. Avoid hinting unless the user gets stuck for more than 30 seconds.

### Task 1: Set Intent & Start Focus
- **Prompt**: *"Imagine you are sitting down to study your hardest subject for 25 minutes. Start a focused session for that task."*
- **What to Observe**:
  - Do they understand *"What is the single thing?"* immediately?
  - Do they notice the subject tags and duration presets?
  - *(Tip for rapid live testing: After they select 25 min, let the timer run for ~20 seconds, or have them try a `1` min custom duration so they can experience the timer reaching `00:00` naturally).*

### Task 2: Park an Urge & The Stuck Signal
- **Prompt**: *"While you're focusing, pretend you suddenly feel the urge to check Instagram or reply to a friend. Without opening your phone, use the app to handle that urge."*
- **What to Observe**:
  - How quickly do they spot **"Park this urge"**?
  - **Measure Time-to-Park** (from tapping the button to returning to the timer; target is **`< 5 seconds`**).
  - Do they tap a **Stuck Signal** chip (`Confusing`, `Bored`, `Tired`, `Anxious`, `Just Habit`) or hit **Quick Park**?
  - Do they notice the smart strategy card and the card sliding into the bottom **Later Lane** tray?

### Task 3: Planned Break, Urge Expiry & Pattern Map
- **Prompt**: *"Your session is over (tap 'End Early & Break' or wait for the 1-minute timer). Review the urges you parked, then find the screen that shows your overall distraction patterns."*
- **What to Observe**:
  - Do they immediately grasp what **`🍃 Faded away`** vs **`⚡ Still want to do`** means?
  - Do they react positively to the **Realization Card** (e.g., *"X of Y urges faded on their own"*)?
  - *(Before checking Pattern Map, let them click **Load Demo Data** in the Reflection footer if testing with only 1 session so they can inspect the 3-session **Attention Waveform** histogram).*

---

## 3. Participant Observation & Metrics Matrix

Print or fill in this table during your 5–8 sessions:

| Participant | Task 1 (Intent) | Task 2 (Park Urge) | Time to Park (sec) | Task 3 (Break & Map) | Stuck Signal Verdict | Key Confusion Points / Verbatim Quotes |
| :--- | :---: | :---: | :---: | :---: | :---: | :--- |
| **P1** | ☐ Pass / ☐ Struggle | ☐ Pass / ☐ Struggle | ____ s | ☐ Pass / ☐ Struggle | ☐ Helpful / ☐ Friction | |
| **P2** | ☐ Pass / ☐ Struggle | ☐ Pass / ☐ Struggle | ____ s | ☐ Pass / ☐ Struggle | ☐ Helpful / ☐ Friction | |
| **P3** | ☐ Pass / ☐ Struggle | ☐ Pass / ☐ Struggle | ____ s | ☐ Pass / ☐ Struggle | ☐ Helpful / ☐ Friction | |
| **P4** | ☐ Pass / ☐ Struggle | ☐ Pass / ☐ Struggle | ____ s | ☐ Pass / ☐ Struggle | ☐ Helpful / ☐ Friction | |
| **P5** | ☐ Pass / ☐ Struggle | ☐ Pass / ☐ Struggle | ____ s | ☐ Pass / ☐ Struggle | ☐ Helpful / ☐ Friction | |
| **P6** | ☐ Pass / ☐ Struggle | ☐ Pass / ☐ Struggle | ____ s | ☐ Pass / ☐ Struggle | ☐ Helpful / ☐ Friction | |

---

## 4. Post-Test Debrief Questions (3 Minutes)

1. **The Stuck Signal Question**: *"When the app asked WHY the urge happened (`Confusing`, `Bored`, `Tired`, `Anxious`, `Just Habit`), did that feel helpful or annoying?"*
2. **Comparison to Blockers**: *"How did parking the urge feel compared to apps like Forest or Screen Time that lock your apps?"*
3. **Tone Check**: *"Did any wording in the break review or pattern map feel judgmental or stressful?"*
4. **Magic Wand**: *"If you could change one button or label to make this faster, what would it be?"*

---

## 5. Usability Audit & Revision Record

### A. Pre-Release Heuristic Audit Fixes *(Already Implemented Before Peer Tests)*
During internal flow testing prior to peer sessions, we caught and resolved two key friction points:

- **Heuristic Revision 1 — Eliminating Keyboard & Rapid-Test Friction**
  - **Before**: Pressing `Enter` inside *"What is the single thing?"* or *"What do you want to check?"* did not submit; minimum duration was locked to `5` minutes, preventing quick 1-minute live walkthroughs; and clicking outside modals did not close them.
  - **After**: Added `Enter`-to-submit handlers on both inputs, `1–5` number hotkeys for Stuck Signal chips, backdrop-click dismissal on all modals, `min="1"` custom duration support, and a **Load Demo Data** button in Reflection so testers can inspect multi-session charts instantly.

- **Heuristic Revision 2 — Fixing Break-to-Next-Session Screen Race Condition**
  - **Before**: Clicking **"Start Next Session"** on the Break screen fired two simultaneous GSAP screen transitions (`screen-reflection` followed synchronously by `screen-intent`), causing a visual flash and leaving `"Break finished!"` alert visible on subsequent breaks.
  - **After**: Parameterized `finishBreakAndGoToReflection('screen-intent')` so transitions run once cleanly, and reset the break alert and button state on each new break.

---

### B. Peer Usability Testing Revisions *(Fill After Testing With 5–8 Users)*

Use this template to document your **two formal before-and-after UI changes** (with screenshots) for your final report:

#### Revision #1: `[Title, e.g., Making Quick Park / Reason Chips Clearer]`
- **Observation & Evidence**: *(e.g., "4 of 6 testers hesitated for ~3 seconds looking for where to submit after tapping a chip...")*
- **Before**: `[Insert Before Screenshot Description / Filename]`
- **Change Made**: `[Exact HTML/CSS/JS change implemented]`
- **After**: `[Insert After Screenshot Description / Filename]`
- **Impact**: *(e.g., "Average Time-to-Park dropped from X.Xs to Y.Ys")*

#### Revision #2: `[Title, e.g., Rewording Urge Expiry or Reflection Text]`
- **Observation & Evidence**: *(e.g., "P2 and P5 felt unsure what 'Fade Rate' meant on first glance...")*
- **Before**: `[Insert Before Screenshot Description / Filename]`
- **Change Made**: `[Exact HTML/CSS/JS change implemented]`
- **After**: `[Insert After Screenshot Description / Filename]`
- **Impact**: *(e.g., "6/6 testers accurately explained the expiry metric without hints")*

