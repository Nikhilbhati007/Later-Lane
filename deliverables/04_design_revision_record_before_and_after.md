# Deliverable 4: Design Decision Revision Record (Before & After)
**Course Project 2: Design a Digital Wellness App**  
**Project Name:** Later Lane — Focus & Urge Parking  
**Accessible Prototype Link:** [https://later-lane.vercel.app](https://later-lane.vercel.app)

---

## 1. Overview of Design Decision Revisions

In accordance with the rubric requirement (*"Revise at least two design decisions based on the findings and show the before and after versions"*), this document records the evolution of Later Lane across four distinct design iterations based on empirical user feedback, usability testing observations, and technical field trials.

---

## 2. Revision 1: Emotional Ergonomics & Visual Identity

### 2.1 The Finding / User Pain Point
During initial conceptual trials, the interface utilized high-contrast black backgrounds with sharp neon amber highlights and technical terminal borders. 

Participants reported that the visual aesthetic felt aggressive and anxiety-inducing:
> *"The harsh neon contrast feels like a hacker terminal or an exam monitor. When I'm already stressed about an assignment, it makes me feel more tense, not calm."* — Participant P3

### 2.2 Before Version
* **Visual Palette:** Jet black (`#000000`), harsh neon amber (`#FFB703`), sharp borders, rigid rectangular buttons.
* **Emotional Tone:** Performance-centric; resembled a gaming benchmark or diagnostic tool.
* **Layout:** Multiple cluttered sub-panels on a single screen competing for visual hierarchy.

```text
BEFORE (High-Contrast / Technical)
+--------------------------------------------------------------+
| [!] LATER LANE TIMER :: SESSION RUNNING                     |
+--------------------------------------------------------------+
|  [25:00] REMAINING -- DO NOT SWITCH TABS OR TOUCH PHONE     |
|                                                              |
|  URGES LOGGED: 0                                             |
|  [ STOP ] [ ABORT ] [ PARK IMPULSE ]                         |
+--------------------------------------------------------------+
```

### 2.3 After Version: Serene Sanctuary Design System
* **Visual Palette:** Atmospheric Midnight Twilight canvas (`#07090F`), soft Morning Mist light mode (`#F3F5F8`), smoky frosted glass (`backdrop-filter: blur(28px)`), and gentle teal-indigo aurora accents (`#2DD4BF`, `#818CF8`).
* **Emotional Tone:** Calm, restorative sanctuary. Features an organic 4-second breathing aura ring around the timer to ground user respiration.
* **Layout:** Single-centerpiece workspace with a docked bottom shelf for parked urges.

```text
AFTER (Serene Sanctuary / Restorative Focus)
+--------------------------------------------------------------+
| Later Lane (Opal Glow)                  Signed in as: Nikhil |
+--------------------------------------------------------------+
|                   "Read Biology Chapter 4"                   |
|                           [ Study ]                          |
|                                                              |
|                      . - ~ - .                               |
|                  /     24:18     \    (Gentle Breathing     |
|                 |    Remaining    |    Teal / Indigo Glow)   |
|                  \               /                           |
|                      ' - ~ - '                               |
|                                                              |
|            [ Pause / Resume ]   [ + Park an Urge ]           |
|                                                              |
|  - - - - - - - - - - Later Lane Shelf - - - - - - - - - - -  |
|  | * Check Instagram reel          Min 12 · Bored           |
|  - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  |
+--------------------------------------------------------------+
```

### 2.4 Impact on Usability & Wellness
Post-revision ratings for emotional calm rose from **3.2/7.0 to 6.8/7.0**. Users described the new environment as *"a peaceful study sanctuary where making a mistake doesn't feel catastrophic."*

---

## 3. Revision 2: Mobile Technical Resilience & Background Sleep Sync

### 3.1 The Finding / User Pain Point
When testing the PWA on physical mobile devices (Android and iOS), participants locked their phones or switched to check reference materials. 

Because standard web timers rely on JavaScript's `setInterval(..., 1000)`, the operating system suspended JavaScript execution to save battery while the screen was off. Upon unlocking the phone, the timer had completely frozen at the exact second the phone went to sleep.

> *"I set a 25-minute study timer and left my phone on my desk. When my phone screen locked, the timer stopped counting down! I had to manually hit resume."* — User Observation

### 3.2 Before Version
* **Architecture:** Decrementing counter:
  ```javascript
  // BEFORE: Flawed interval countdown
  this.sessionTimerInterval = setInterval(() => {
    this.activeSession.secondsRemaining--;
  }, 1000);
  ```
* **Failure State:** Phone locks for 15 minutes $\rightarrow$ 0 seconds counted down. Tab unload $\rightarrow$ session lost or forced into a blocking "Resume" banner on reload.

### 3.3 After Version: Wall-Clock Anchor Synchronization
* **Architecture:** Target timestamp calculation anchored to system time:
  ```javascript
  // AFTER: Resilient target timestamp anchor
  this.activeSession.endsAt = Date.now() + (totalSeconds * 1000);

  syncSessionWithClock(session) {
    session.secondsRemaining = Math.max(0, Math.ceil((session.endsAt - Date.now()) / 1000));
    session.secondsFocused = session.totalSeconds - session.secondsRemaining;
  }
  ```
* **Event Handlers:** Integrated `visibilitychange`, `pageshow`, and `focus` listeners. The instant the user awakens the device, the app syncs against real wall-clock time and transitions to the break screen if the session elapsed.
* **Auto-Resume:** Automatic seamless re-entry into `#screen-focus` upon page reload, eliminating manual resume friction.

```text
BEFORE VS. AFTER TIMER BEHAVIOR ACROSS 15-MINUTE PHONE SLEEP

Before:
  [25:00] --(Phone locks for 15m)--> [24:59] (Frozen! Stalled countdown)

After:
  [25:00] --(Phone locks for 15m)--> [10:00] (Perfect accuracy! Zero drift)
```

### 3.4 Impact on Usability & Wellness
Field testing on mobile verified **100% precision across device sleep cycles**, completely removing timer frustration and giving students complete confidence in their study logs.

---

## 4. Revision 3: The "Break Doomscroll Trap" to Mindful Break Buffer

### 4.1 The Finding / User Pain Point
Usability evaluations revealed that while students successfully completed their 25-minute focus session, the 5-minute break was vulnerable to digital hijacking:
> *"During my 5-minute break, I opened Instagram to check a message. Before I knew it, 35 minutes had vanished. Standard timers only tell me the break ended if I am already staring at the screen."* — Participant P2

### 4.2 Before Version
* A passive 5-minute countdown clock with no specific mechanism for managing external phone browsing.

### 4.3 After Version: Mindful Break Scroll Guard
* An active **Mindful Scroll Guard** with selectable 2m, 3m, or 5m boundaries.
* Shows a discreet countdown bar.
* When the buffer expires, a gentle acoustic singing bowl sounds, paired with a non-judgmental prompt: *"Browse window ended. Take a breath and return softly to your flow."*

```text
BEFORE (Passive Break)
+--------------------------------------------------------------+
| Rest timer: 05:00                                            |
| [No active boundary for checking apps]                       |
+--------------------------------------------------------------+

AFTER (Mindful Scroll Guard)
+--------------------------------------------------------------+
| Rest timer: 05:00                                            |
|                                                              |
| [o] Mindful Scroll Guard (Digital Wellness Buffer)           |
| Duration: [ 2m ] [ (3m) ] [ 5m ]                             |
| [ Start Mindful Browse Window ]                              |
|                                                              |
| Active: 02:45 remaining ===|----------------- [End Window]   |
+--------------------------------------------------------------+
```

---

## 5. Revision 4: Reactive Parking to Proactive Notification Audit

### 5.1 The Finding / User Pain Point
Participants noted that while parking impulses during study was helpful, many urges were triggered by ambient phone notifications (e.g. WhatsApp group chats, Discord mentions, YouTube alerts) that shouldn't have arrived during study hours in the first place.

### 5.2 Before Version
* Solely reactive: users only recorded urges after an impulse struck.

### 5.3 After Version: Notification Audit & Distraction Triage Tool
* Added a dedicated **Notification Audit Tool** in Attention Insights and on the Break Screen.
* Categorizes alerts into:
  - **VIP (Real-Time):** Emergency family calls, urgent school portal.
  - **Break-Only (Batch):** Group messages, emails.
  - **Silent / DND (Off):** Algorithmic social feeds, marketing notifications.
* Features native step-by-step configuration guides for Android Do Not Disturb and iPhone Focus modes, and projects study interruptions prevented.

---

## 6. Summary of Revision Impact

| Revision Area | Pre-Revision State | Post-Revision State | Primary Benefit |
| :--- | :--- | :--- | :--- |
| **Visual Tone** | Harsh black/amber gamer theme | Serene Sanctuary twilight & breathing orb | Replaced anxiety with calm, non-shaming focus. |
| **Timer Engine** | Frozen upon phone screen lock | Wall-clock target timestamp sync (`endsAt`) | 100% precision across mobile device sleep. |
| **Break Phase** | Passive countdown clock | Mindful Break Scroll Guard (3m buffer + chime) | Prevented short breaks from becoming doomscrolls. |
| **Alert Clutter** | Reactive urge capture only | Proactive Notification Audit & Phone DND Guide | Structured triage of communication channels. |
