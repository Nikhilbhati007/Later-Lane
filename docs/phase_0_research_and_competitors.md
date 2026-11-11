# Phase 0: Research, Competitor Teardown & Requirements

> **Roadmap Milestone**: Phase 0 — Validate the problem and competitive gap  
> **Themes Covered**: Attention span, context switching penalty, and problematic social media use.

---

## 1. Problem Statement
> *"Students who start a study session but get pulled away by impulse checks need a way to acknowledge the urge without acting on it, and understand why their attention broke."*

---

## 2. Competitor Teardown Matrix

| Tool | What happens at the exact moment of an urge? | Limitation / Gap | How Later Lane Solves It |
| :--- | :--- | :--- | :--- |
| **Forest / Flora** | Warns you that leaving the app will kill your virtual tree. | Relies on **loss-aversion guilt**; does not tell you *why* you got stuck or capture the thought you wanted to look up. | Parks the urge instead of punishing you; gives your brain permission to release the itch. |
| **Opal / Freedom** | Hard-blocks social media apps behind a lock screen. | Triggers **psychological reactance** (users bypass the block, switch to another device, or feel frustrated). | Treats the impulse non-judgmentally; logs the urge in under 5 seconds so you stay in flow. |
| **one sec** | Adds a breathing delay before opening an app like Instagram. | Helpful pause, but still interrupts your desk session and leaves you holding your phone. | Keeps your hands off your phone completely and lets you review expired urges at break time. |
| **Standard Pomodoro Timers** | Only counts down 25 minutes; silent when distracted. | Treats every 25-minute block identically without surfacing *when* or *why* attention collapsed. | Uses the **Stuck Signal** + **Attention Waveform** to map when (e.g., min 18) and why urges strike. |

---

## 3. Core Requirements List

### Functional Requirements
1. **Intent Setting**: One single task sentence, optional subject tag, and duration selector (`15m`, `25m`, `45m`, `60m`, or custom).
2. **Focus Session**: Breathing circular countdown timer + prominent **"Park this urge"** trigger (`P` / `U` shortcut).
3. **The Stuck Signal (USP)**: 1-tap optional classification (`Confusing`, `Bored`, `Tired`, `Anxious`, `Just Habit`) with tailored, non-judgmental micro-strategies and a `< 3s` **Quick Park** bypass.
4. **Planned Break & Urge Expiry Review**: Dedicated break countdown where users mark each parked urge as **`🍃 Faded away`** or **`⚡ Still want to do`** to reveal how many impulses dissolve naturally.
5. **Attention Pattern Map**: Weekly (`7d`) & All-Time charts (urges by minute bucket + Stuck Signal distribution) with neutral, plain-language insights.

### Non-Functional & Privacy Requirements
- **Zero Backend / Zero Accounts**: All data stored locally in `localStorage` with JSON export/import.
- **Offline-First PWA**: Installable standalone app with service worker asset caching and Web Audio API procedural sound (off by default for silent libraries).
- **Accessible & Restorative Tone**: Low-contrast themes, keyboard shortcuts (`Space`, `P`, `1–5`, `Esc`), `aria-live` announcements, and `prefers-reduced-motion` support.

---

## 4. Classmate Interview Guide (3–5 Participants, Pen & Paper)

Record anonymized responses (`Participant A`, `B`, `C`...) before or alongside your usability tests:

1. *"Walk me through the last time you sat down to study and ended up scrolling on your phone instead. What exact sentence or task were you looking at right before?"*
2. *"At that moment, did you feel stuck/confused, bored, tired, anxious, or was it pure thumb habit?"*
3. *"What focus tools or blockers have you tried, and why did you stop using them?"*
4. **Summary Finding Template**:  
   - `[X of Y]` classmates reported getting distracted primarily when stuck on difficult steps (`Confusing`) or during passive reading (`Bored`), rather than genuinely wanting social media content.

