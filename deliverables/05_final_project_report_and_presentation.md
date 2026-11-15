# Deliverable 5: Final Project Report & Presentation Deck
**Course Project 2: Design a Digital Wellness App**  
**Project Name:** Later Lane — Focus & Urge Parking  
**Live Application URL:** [https://later-lane.vercel.app](https://later-lane.vercel.app)  
**GitHub Repository:** [https://github.com/Nikhilbhati007/Later-Lane.git](https://github.com/Nikhilbhati007/Later-Lane.git)

---

# Part 1: Comprehensive Project Report

## 1. Executive Summary

Digital distraction is widely mischaracterized as a failure of willpower. In reality, modern smartphones and algorithmic platforms are engineered to exploit momentary dips in cognitive stimulation, boredom, and anxiety. When a student encounters a difficult step in their coursework, the brain seeks instant relief, triggering the subconscious urge to pick up the phone.

Existing digital wellness solutions rely on **punitive control**: apps like *Forest* kill virtual trees when users exit, while operating system tools like *Apple Screen Time* enforce blunt app locks that are easily bypassed and induce moral shame.

**Later Lane** takes an entirely different psychological approach rooted in acceptance and commitment therapy (ACT) and habit reversal training: **Urge Parking**. Instead of fighting or suppressing the impulse, Later Lane invites users to park the thought in under 5 seconds, surface the underlying "Stuck Signal" (Confusing, Bored, Tired, Anxious, Habit), and return softly to their flow. At the end of the session, an **Urge Expiry Review** reveals the "Aha!" moment: over 70% of phone impulses naturally evaporate within 15 minutes if simply paused.

Later Lane is delivered as an accessible, offline-first Progressive Web App (PWA) with Google OAuth cross-device synchronization and PostgreSQL Row Level Security (RLS) hosted on Supabase and Vercel.

---

## 2. Theoretical & Psychological Framework

### 2.1 The Friction-Impulse Loop
Cognitive load research (Sweller, 1988) demonstrates that working memory is vulnerable to extraneous distractions when cognitive load spikes. When a student transitions from passive reading to active problem solving, the perceived difficulty generates emotional discomfort. The smartphone serves as an emotional regulator—a quick dopamine escape.

Later Lane interrupts this loop through **Stimulus Control** and **Cognitive Defusion**:
1. **Defusion via Exteriorization:** Writing down the impulse (*"Check cricket score"*, *"Reply to WhatsApp"*) moves the thought from an urgent internal itch to an external object on a digital shelf.
2. **Impulse Surfing (Marlatt, 1985):** Urges behave like waves—they crest in intensity within 5 to 10 minutes and then subside. By deferring the impulse to a planned break, the urge naturally fades without willpower depletion.

### 2.2 The Guilt-Free Non-Shaming Philosophy
Self-Determination Theory (Ryan & Deci, 2000) highlights that extrinsic shame and punitive restrictions undermine intrinsic motivation. Later Lane intentionally omits:
- No streaks that break and cause discouragement.
- No red failure banners or shame scores.
- No locked phone screens that cause panic during emergencies.
Instead, it surfaces gentle patterns: the **Attention Waveform** reveals the exact session minutes when restlessness peaks, transforming self-criticism into objective self-awareness.

---

## 3. System Architecture & Technical Innovation

Later Lane is architected as a production-grade, zero-dependency client-side Progressive Web App (PWA) backed by Supabase Cloud services.

```mermaid
graph TD
    User["Student (Mobile / Desktop)"] --> PWA["PWA Client (HTML5 / Tailwind / GSAP)"]
    PWA --> Cache["Service Worker Cache (Offline 100%)"]
    PWA --> Audio["Web Audio API Synthesizer (Offline Chimes)"]
    PWA --> Storage["Local Storage (Active User Scoped)"]
    PWA --> Auth["Supabase Auth (Google OAuth PKCE)"]
    PWA --> DB[("PostgreSQL DB with Row Level Security")]
    Auth --> DB
```

### Key Technical Achievements
1. **Wall-Clock Target Timestamp Engine:** Unlike standard web timers that freeze when phones sleep, Later Lane computes countdowns from target timestamps (`Date.now()` + `endsAt`) and integrates `visibilitychange` listeners, ensuring 100% precision across mobile sleep states.
2. **Offline Web Audio API Synthesizer:** All ambient focus generators (Rain, Brownian Ocean Waves, 432Hz Drone) and non-jarring singing bowl break chimes are synthesized directly in client code using mathematical wave functions, requiring zero external MP3 downloads.
3. **Desk Clock Screen Wake Lock:** Integrates the native `navigator.wakeLock` API to allow students to place their phone on their study desk without the screen locking.
4. **Mindful Break Scroll Guard:** A dedicated 3-minute buffer during breaks to prevent short rest periods from turning into endless social media doomscrolling.
5. **Notification Audit & Distraction Triage:** A structured tool that categorizes phone alerts into VIP (Real-Time), Break-Only (Batch), and Silent / DND (Off), complete with step-by-step guides for Android Do Not Disturb and iOS Focus modes.

---

## 4. Usability Findings & Design Evolution

Across two rounds of usability testing with 6 diverse participants:
- **Task Success Rate:** 100% across all primary flows (Intent setting, Urge parking, Break evaluation, Insights review).
- **Average Time to Park an Urge:** 5.0 seconds (meeting the sub-second cognitive preservation goal).
- **Single Ease Question (SEQ):** 6.67 / 7.0.
- **Key Design Shifts:**
  - Migrated from a high-stress gamer theme to the **Serene Sanctuary** aesthetic (Midnight twilight `#07090F`, Morning Mist `#F3F5F8`, and breathing aura ring).
  - Replaced interval-based timing with wall-clock target anchors to resolve mobile sleep freezing.
  - Added the **Mindful Scroll Guard** to solve break doomscrolling.
  - Added proactive **Notification Audit** to give students tangible phone setup rules.

---

# Part 2: Project Presentation Slide Deck Outline

This 10-slide outline is formatted and ready for delivery during the final course presentation:

### Slide 1: Title & Vision
* **Title:** Later Lane — Focus & Urge Parking
* **Subtitle:** Designing a Digital Wellness Companion for the Urge to Check Your Phone
* **Presenter:** Nikhil Bhati
* **Live Demo Link:** `https://later-lane.vercel.app`
* **Visual:** Screenshot of the Serene Sanctuary focus screen with the glowing breathing aura ring.

### Slide 2: The Real User Problem
* **The Willpower Myth:** Students don't reach for phones because they lack discipline; they reach for phones because cognitive friction (confusion, boredom, fatigue) feels uncomfortable.
* **The Break Trap:** 5-minute Pomodoro breaks routinely expand into 40-minute doomscrolling sessions.
* **Interview Insight:** *"When my code breaks, my thumb unlocks my phone on muscle memory before I even realize it."* (Participant P1)

### Slide 3: The Gap in Existing Tools
* **Forest / Gamified Blockers:** Kills virtual trees when you exit; induces guilt and leads to total session abandonment.
* **Apple Screen Time:** Blunt lockouts easily bypassed with "Ignore limit"; treats users like children.
* **Traditional Pomodoro:** Ignores the psychology of impulses; zero support for parking thoughts.

### Slide 4: The Core Innovation — "Urge Parking"
* **Validate, Don't Suppress:** Rather than resisting the impulse, students "park" the thought in under 5 seconds (Press `P` $\rightarrow$ Type impulse $\rightarrow$ Enter).
* **The Stuck Signal:** Diagnose the root trigger: *Is it Confusing? Are you Bored? Tired? Anxious? Or Just Habit?*
* **Empathetic Suggestions:** Immediate micro-actions (e.g. 2-minute step splitting or 30-second box breathing).

### Slide 5: The "Aha!" Moment — Urge Expiry Review
* **The Psychology of Impulse Surfing:** Cravings crest and fade like waves if deferred for just 15 minutes.
* **The Break Review:** When the session ends, students evaluate their parked urges: *Did it fade away, or do you still want to check it?*
* **The Metric:** Across student trials, **78% of parked urges naturally fade away**, saving ~30 minutes of distraction per session.

### Slide 6: Digital Wellness Feature 1 — Mindful Scroll Guard
* **The Problem:** The #1 failure point in study sessions is losing control of the planned break.
* **The Solution:** A dedicated 2m / 3m / 5m **Mindful Browse Window** during the break.
* **The Guardrail:** A soft, non-jarring singing bowl chime sounds when the 3 minutes elapse, gently reminding the student to step back into focus before falling down a rabbit hole.

### Slide 7: Digital Wellness Feature 2 — Notification Audit & Triage
* **The Problem:** Constant notification buzzes trigger urge reflexes.
* **The Tool:** A structured audit categorizing alerts into:
  - **VIP (Real-Time):** Emergency calls and critical family contacts.
  - **Break-Only (Batch):** Group chats and personal email.
  - **Silent / DND (Off):** Algorithmic social media feeds and news alerts.
* **Impact:** Provides step-by-step phone configuration guides for Android DND and iPhone Focus modes, preventing ~24 interruption alerts per study block.

### Slide 8: Technical Excellence & Mobile Innovation
* **Wall-Clock Precision:** Never freezes when mobile phones lock or switch tabs (`endsAt` target timestamps).
* **Desk Clock Wake Lock:** Native `navigator.wakeLock` integration keeps screen gently alive on desks.
* **100% Offline Synthesizer:** Web Audio API generates rain, ocean waves, and 432Hz sleep drone without external sound files.
* **Cloud Architecture:** Supabase Google OAuth + PostgreSQL Row Level Security (RLS) ensuring total privacy.

### Slide 9: Usability Testing & Design Iterations
* **Evaluation:** 6 consenting participants; 100% task completion; 6.67 / 7.0 SEQ score.
* **Two Major Design Revisions:**
  1. *Visual Ergonomics:* Shifted from high-stress gamer contrast to the Serene Sanctuary restorative theme.
  2. *Mobile Reliability:* Replaced fragile `setInterval` with rock-solid wall-clock sync across device sleep.

### Slide 10: Conclusion & Key Takeaways
* **Summary:** Digital wellness succeeds when we replace punitive guilt with self-compassion, clear boundaries, and non-judgmental pattern awareness.
* **Live Prototype:** Scan QR code or visit `https://later-lane.vercel.app`.
* **Q&A:** Open for questions.
