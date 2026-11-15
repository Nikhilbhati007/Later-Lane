# Deliverable 3: Usability Testing & Evaluation
**Course Project 2: Design a Digital Wellness App**  
**Project Name:** Later Lane — Focus & Urge Parking  
**Accessible Prototype Tested:** [https://later-lane.vercel.app](https://later-lane.vercel.app)

---

## 1. Usability Testing Protocol & Methodology

To validate the user experience, cognitive load, and emotional response of Later Lane, we conducted moderated usability testing sessions with **six consenting participants** (undergraduate students and recent graduates). 

### Participant Profiles
* **P1 (Male, 21):** CS Student, heavy phone checker, uses dual screens.
* **P2 (Female, 20):** Biology Pre-Med, relies on Pomodoro timers, easily distracted during breaks.
* **P3 (Female, 22):** Graphic Design student, easily overwhelmed by rigid productivity apps.
* **P4 (Male, 23):** Economics Major, struggles with WhatsApp group chat notifications.
* **P5 (Female, 19):** First-year engineering student, uses Forest but dislikes losing streaks.
* **P6 (Male, 22):** Graduate student, studies in open library environments.

---

## 2. Realistic Usability Tasks

Participants were given three realistic tasks and asked to think aloud while interacting with the live prototype on both desktop and mobile devices.

### Task 1: Intent Initialization
> *"You are preparing to study for an upcoming midterm exam for 25 minutes. Set your intent to 'Review Chapter 3 Lecture Slides' under the 'Study' category and begin your focus session."*

### Task 2: Urge Parking & Stuck Signal Diagnostic
> *"Ten minutes into your study session, imagine your friend mentions a trending video on WhatsApp. Instead of picking up your phone, park this thought in Later Lane, select the reason that best matches the impulse, and return to studying."*

### Task 3: Planned Break, Scroll Guard & Expiry Review
> *"Your 25-minute timer has completed. Enter your planned break. Use the Mindful Scroll Guard to set a 3-minute boundary for checking your phone. Review whether your earlier parked urge still matters, and view your attention patterns."*

---

## 3. Quantitative Results & Metrics

| Participant | Task 1 Completion (Time) | Task 2 Completion (Time) | Task 3 Completion (Time) | Overall SEQ (1–7 Scale)* |
| :--- | :---: | :---: | :---: | :---: |
| **P1** | ✅ Success (14s) | ✅ Success (4s) | ✅ Success (32s) | 7 / 7 |
| **P2** | ✅ Success (18s) | ✅ Success (6s) | ✅ Success (28s) | 7 / 7 |
| **P3** | ✅ Success (12s) | ✅ Success (5s) | ✅ Success (35s) | 6 / 7 |
| **P4** | ✅ Success (16s) | ✅ Success (4s) | ✅ Success (30s) | 7 / 7 |
| **P5** | ✅ Success (15s) | ✅ Success (6s) | ✅ Success (26s) | 7 / 7 |
| **P6** | ✅ Success (13s) | ✅ Success (5s) | ✅ Success (29s) | 6 / 7 |
| **Average** | **100% (14.6s)** | **100% (5.0s)** | **100% (30.0s)** | **6.67 / 7.0** |

*\*Single Ease Question (SEQ): 1 = Very Difficult, 7 = Very Easy.*

---

## 4. Key Observations & Points of Confusion

### Observation 1: Sub-5-Second Urge Capture
* **Observation:** Every single participant was able to park their distracting thought in under 6 seconds (average 5.0 seconds).
* **Participant Reaction:** 
  > *"I loved that pressing 'P' immediately opened the box. I typed 'Check WhatsApp', hit Enter, and watched it slide down into the tray. It felt like putting a physical piece of paper in a drawer so I could stop holding it in my head."* (P1)

### Observation 2: The "Aha!" Moment of Urge Expiry
* **Observation:** The transition from the focus block to the Urge Expiry review created a palpable shift in mindset.
* **Participant Reaction:**
  > *"When the break started and it asked me 'Do you still want to check this?', I realized I didn't care about that meme anymore. It was crazy seeing 'Faded away — 100%'. It proved that the urge was just boredom, not an actual need."* (P2)

### Point of Confusion 1 (Pre-Revision): Break Doomscrolling
* **Initial Friction:** During early testing, participants noted that while the 5-minute break timer ran, they still opened Instagram on their phones and forgot to look back at the web timer.
* **Direct Solution:** Implemented the **Mindful Break Scroll Guard** feature with a 3-minute dedicated buffer and a distinctive singing bowl chime to pull attention back before the break slips away.

### Point of Confusion 2 (Pre-Revision): Phone Display Sleeping on Desk
* **Initial Friction:** Two participants placed their smartphones on their desks to use Later Lane as a focus clock, but their phone screens automatically dimmed and locked after 30 seconds.
* **Direct Solution:** Implemented the **Screen Wake Lock API (`navigator.wakeLock`)** toggle in Settings, allowing the screen to stay alive as a gentle desk clock.

---

## 5. Qualitative Feedback Quotes

> *"Every other app makes me feel like a bad student when I want to check my phone. Later Lane is the first app that says 'It's completely normal to feel an urge — just park it here and we'll check later.' That change in tone completely changes how I feel about studying."*  
> — **P5 (First-Year Engineering)**

> *"The Attention Waveform showed me that minutes 11 to 15 are when I always get restless. Knowing that in advance helped me anticipate the itch and breathe through it instead of giving in."*  
> — **P4 (Economics Student)**

> *"The notification audit tool gave me something real to do. I didn't know I could set Do Not Disturb to let emergency calls through while muting WhatsApp group chats. That alone solved my anxiety."*  
> — **P6 (Graduate Student)**
