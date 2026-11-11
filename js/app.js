/**
 * Later Lane - Main Application Controller
 * Handles the complete lifecycle: Set Intent -> Focus Session -> Park Urge & Stuck Signal -> Break & Expiry -> Reflection & Pattern Map.
 */

class LaterLaneApp {
  constructor() {
    this.storage = window.laneStorage;
    this.sound = window.soundEngine;
    this.animations = window.laneAnimations;

    // State
    this.currentScreen = 'screen-intent';
    this.activeSession = null;
    this.sessionTimerInterval = null;
    this.breakTimerInterval = null;
    this.breakSecondsRemaining = 300; // 5 min default
    this.breakTotalSeconds = 300;
    this.isBreakPaused = false;

    // Park Sheet state
    this.selectedReason = null;
    this.activeBoxBreathingInterval = null;

    // PWA Install prompt state
    this.deferredInstallPrompt = null;
    this.insightsTimeframe = 'all';

    this.init();
  }

  init() {
    this.applySettings();
    this.bindEvents();
    this.setupPWAInstall();
    this.checkActiveSession();
    this.renderAggregatedInsights();

    // Register service worker if available
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('./sw.js').catch(err => {
        console.log('SW registration note:', err);
      });
    }
  }

  applySettings() {
    const s = this.storage.settings;
    const theme = s.theme || 'dark';
    document.documentElement.setAttribute('data-theme', theme);
    this.sound.toggleSound(s.soundEnabled);
    this.sound.setVolume(s.ambientVolume || 0.25);

    const quickThemeLabel = document.getElementById('quick-theme-label');
    if (quickThemeLabel) {
      quickThemeLabel.textContent = theme === 'dark' ? 'Light' : 'Dark';
    }

    // Update settings UI controls
    const soundToggle = document.getElementById('setting-sound-toggle');
    if (soundToggle) soundToggle.checked = s.soundEnabled;

    const motionToggle = document.getElementById('setting-motion-toggle');
    if (motionToggle) motionToggle.checked = s.reducedMotion;

    const themeSelect = document.getElementById('setting-theme-select');
    if (themeSelect) themeSelect.value = theme;

    const ambientSelect = document.getElementById('setting-ambient-select');
    if (ambientSelect) ambientSelect.value = s.ambientSound || 'none';

    document.querySelectorAll('.ambient-chip').forEach(c => {
      c.classList.toggle('active', c.dataset.ambient === (s.ambientSound || 'none'));
    });

    const defaultDurationInput = document.getElementById('setting-default-duration');
    if (defaultDurationInput) defaultDurationInput.value = s.defaultDuration || 25;

    const sessionDurationInput = document.getElementById('input-duration');
    if (sessionDurationInput && !this.activeSession) {
      sessionDurationInput.value = s.defaultDuration || 25;
      document.querySelectorAll('.duration-pill').forEach(p => {
        const isMatch = parseInt(p.dataset.mins, 10) === (s.defaultDuration || 25);
        p.classList.toggle('active', isMatch);
      });
    }
  }

  toggleQuickTheme() {
    const next = (this.storage.settings.theme || 'dark') === 'dark' ? 'light' : 'dark';
    this.storage.saveSettings({ theme: next });
    this.applySettings();
  }

  showScreen(screenId) {
    const oldScreenEl = document.getElementById(this.currentScreen);
    const newScreenEl = document.getElementById(screenId);

    if (oldScreenEl === newScreenEl) return;

    this.animations.transitionScreens(oldScreenEl, newScreenEl, () => {
      this.currentScreen = screenId;
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // Check if a session was in progress (e.g., page refresh)
  checkActiveSession() {
    const saved = this.storage.getCurrentSession();
    if (saved && saved.secondsRemaining > 0) {
      this.activeSession = saved;
      const resumeBanner = document.getElementById('resume-session-banner');
      const resumeIntent = document.getElementById('resume-session-intent');
      if (resumeBanner && resumeIntent) {
        resumeIntent.textContent = `"${saved.intent}" (${Math.ceil(saved.secondsRemaining / 60)}m left)`;
        resumeBanner.classList.remove('hidden');
      }
    }
  }

  resumeActiveSession() {
    if (!this.activeSession) return;
    document.getElementById('resume-session-banner')?.classList.add('hidden');
    this.setupFocusScreenUI();
    this.showScreen('screen-focus');
    this.startFocusTimer();
  }

  dismissActiveSession() {
    this.storage.clearCurrentSession();
    this.activeSession = null;
    document.getElementById('resume-session-banner')?.classList.add('hidden');
  }

  // --- START NEW SESSION ---
  startNewSession() {
    const intentInput = document.getElementById('input-intent');
    const intent = intentInput?.value.trim() || 'Focus Session';
    const durationMins = parseInt(document.getElementById('input-duration')?.value || '25', 10);
    const tag = document.querySelector('.tag-chip.active')?.dataset.tag || 'General';

    this.activeSession = {
      id: 'session_' + Date.now(),
      intent: intent,
      tag: tag,
      durationMinutes: durationMins,
      totalSeconds: durationMins * 60,
      secondsRemaining: durationMins * 60,
      secondsFocused: 0,
      isPaused: false,
      startedAt: new Date().toISOString(),
      urges: []
    };

    this.storage.saveCurrentSession(this.activeSession);
    this.setupFocusScreenUI();
    this.showScreen('screen-focus');
    this.sound.playSessionStart();
    this.startFocusTimer();

    // Start ambient sound if enabled
    if (this.storage.settings.ambientSound !== 'none') {
      this.sound.setAmbient(this.storage.settings.ambientSound);
    }
  }

  setupFocusScreenUI() {
    if (!this.activeSession) return;
    const intentDisplay = document.getElementById('focus-current-intent');
    const tagDisplay = document.getElementById('focus-current-tag');
    if (intentDisplay) intentDisplay.textContent = this.activeSession.intent;
    if (tagDisplay) tagDisplay.textContent = this.activeSession.tag;

    this.updateTimerDisplay();
    this.renderParkedUrgesInLane();

    const timerRing = document.getElementById('timer-ring');
    const timerGlow = document.getElementById('timer-glow');
    this.animations.startBreathingRing(timerRing, timerGlow);
  }

  startFocusTimer() {
    clearInterval(this.sessionTimerInterval);
    this.activeSession.isPaused = false;
    this.updatePauseResumeButtonUI();

    this.sessionTimerInterval = setInterval(() => {
      if (!this.activeSession || this.activeSession.isPaused) return;

      this.activeSession.secondsRemaining--;
      this.activeSession.secondsFocused++;

      this.updateTimerDisplay();
      this.storage.saveCurrentSession(this.activeSession);

      if (this.activeSession.secondsRemaining <= 0) {
        this.completeFocusSession();
      }
    }, 1000);
  }

  pauseFocusTimer() {
    if (!this.activeSession) return;
    this.activeSession.isPaused = true;
    clearInterval(this.sessionTimerInterval);
    this.updatePauseResumeButtonUI();
    this.storage.saveCurrentSession(this.activeSession);
  }

  togglePauseResume() {
    if (!this.activeSession) return;
    if (this.activeSession.isPaused) {
      this.startFocusTimer();
    } else {
      this.pauseFocusTimer();
    }
  }

  updatePauseResumeButtonUI() {
    const btn = document.getElementById('btn-pause-resume');
    if (!btn || !this.activeSession) return;
    if (this.activeSession.isPaused) {
      btn.innerHTML = `<span>Resume</span>`;
      btn.classList.remove('calm-btn-soft');
      btn.classList.add('calm-btn-primary');
    } else {
      btn.innerHTML = `<span>Pause</span>`;
      btn.classList.remove('calm-btn-primary');
      btn.classList.add('calm-btn-soft');
    }
  }

  updateTimerDisplay() {
    if (!this.activeSession) return;
    const mins = Math.floor(Math.max(0, this.activeSession.secondsRemaining) / 60);
    const secs = Math.max(0, this.activeSession.secondsRemaining) % 60;
    const formatted = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;

    const textEl = document.getElementById('timer-time-text');
    if (textEl) textEl.textContent = formatted;

    // Update browser tab title
    document.title = `${formatted} • ${this.activeSession.intent} | Later Lane`;

    // SVG Circular progress
    const circle = document.getElementById('timer-circle-progress');
    if (circle) {
      const radius = 120;
      const circumference = 2 * Math.PI * radius;
      const progress = this.activeSession.secondsRemaining / this.activeSession.totalSeconds;
      const offset = circumference * (1 - Math.max(0, Math.min(1, progress)));
      circle.style.strokeDasharray = `${circumference} ${circumference}`;
      circle.style.strokeDashoffset = offset;
    }
  }

  // --- URGE PARKING & STUCK SIGNAL MODAL ---
  openParkUrgeSheet() {
    this.selectedReason = null;
    const overlay = document.getElementById('park-urge-overlay');
    const sheet = document.getElementById('park-urge-sheet');
    const input = document.getElementById('input-urge-text');
    const suggestionBox = document.getElementById('stuck-signal-suggestion');

    if (input) input.value = '';
    if (suggestionBox) suggestionBox.classList.add('hidden');

    // Reset chips
    document.querySelectorAll('.reason-chip').forEach(c => c.classList.remove('active'));

    this.animations.openSheet(overlay, sheet);

    // Auto-focus input
    setTimeout(() => {
      input?.focus();
    }, 200);
  }

  closeParkUrgeSheet() {
    const overlay = document.getElementById('park-urge-overlay');
    const sheet = document.getElementById('park-urge-sheet');
    this.animations.closeSheet(overlay, sheet);
  }

  selectReason(reason) {
    this.selectedReason = reason;
    document.querySelectorAll('.reason-chip').forEach(chip => {
      chip.classList.toggle('active', chip.dataset.reason === reason);
    });

    // Show Smart Empathetic Suggestion based on Stuck Signal
    this.renderStuckSignalResponse(reason);
  }

  renderStuckSignalResponse(reason) {
    const box = document.getElementById('stuck-signal-suggestion');
    const titleEl = document.getElementById('suggestion-title');
    const textEl = document.getElementById('suggestion-text');
    const actionArea = document.getElementById('suggestion-action-area');
    if (!box || !titleEl || !textEl) return;

    box.classList.remove('hidden');

    const responses = {
      confusing: {
        title: 'Stuck on a hard step',
        text: 'Try "Rubber Ducking": explain what you are trying to do out loud for 30 seconds, or break this step in half.',
        actionHtml: `<button type="button" onclick="window.app.quickSplitStepPrompt()" class="calm-btn calm-btn-soft mt-2 text-xs px-3 py-1.5">Split step into 2 micro-tasks</button>`
      },
      bored: {
        title: 'Low stimulation alert',
        text: 'Passive reading often triggers boredom urges. Shift to active mode: sketch a quick diagram or write 2 test questions.',
        actionHtml: ''
      },
      tired: {
        title: 'Energy dip detected',
        text: 'Stand up gently, roll your shoulders, or take a drink of cold water before resuming.',
        actionHtml: ''
      },
      anxious: {
        title: 'Scope feeling heavy',
        text: 'Take three slow breaths. You do not need to finish everything today — only the next few minutes matter.',
        actionHtml: `<button type="button" onclick="window.app.triggerBoxBreathModal()" class="calm-btn calm-btn-soft mt-2 text-xs px-3 py-1.5">Start 30s Guided Breath</button>`
      },
      habit: {
        title: 'Reflex itch parked',
        text: 'Your thumb simply craved novelty. Writing it down closes the mental loop. Return softly to your flow.',
        actionHtml: ''
      }
    };

    const data = responses[reason] || responses.habit;
    titleEl.textContent = data.title;
    textEl.textContent = data.text;
    if (actionArea) actionArea.innerHTML = data.actionHtml;
  }

  submitParkUrge(skipReason = false) {
    if (!this.activeSession) return;
    const input = document.getElementById('input-urge-text');
    let text = input?.value.trim();

    if (!text) {
      text = 'Impulse check';
    }

    const currentMinute = Math.max(1, Math.ceil(this.activeSession.secondsFocused / 60));
    const reason = skipReason ? 'habit' : (this.selectedReason || 'habit');

    const urge = {
      id: 'urge_' + Date.now(),
      text: text,
      reason: reason,
      minuteInSession: currentMinute,
      timestamp: new Date().toISOString(),
      faded: null
    };

    this.activeSession.urges.push(urge);
    this.storage.saveCurrentSession(this.activeSession);

    // Play urge parked sound
    this.sound.playUrgeParked();

    // GSAP Park animation
    const sheet = document.getElementById('park-urge-sheet');
    const tray = document.getElementById('parking-lane-tray');

    this.animations.parkUrgeAnimation(sheet, tray, () => {
      this.closeParkUrgeSheet();
      this.renderParkedUrgesInLane();
      this.animations.bumpBadge(document.getElementById('parked-urges-badge'));
    });
  }

  renderParkedUrgesInLane() {
    const tray = document.getElementById('parking-lane-items');
    const badge = document.getElementById('parked-urges-badge');
    const count = this.activeSession?.urges?.length || 0;

    if (badge) badge.textContent = `${count} parked`;

    if (!tray) return;

    if (!this.activeSession || count === 0) {
      tray.innerHTML = `
        <div class="text-xs text-mut py-2 text-center">
          Your lane is quiet — parked thoughts rest here until your break
        </div>`;
      return;
    }

    tray.innerHTML = this.activeSession.urges.map((u) => {
      const reasonLabel = (u.reason || 'habit');

      return `
        <div class="parked-urge-pill flex items-center justify-between gap-3 animate-fade-in">
          <div class="flex items-center gap-2.5 overflow-hidden">
            <span class="w-1.5 h-1.5 rounded-full bg-[#FBBF24] shrink-0"></span>
            <span class="font-medium text-main truncate">${this.escapeHtml(u.text)}</span>
          </div>
          <div class="flex items-center gap-2 shrink-0">
            <span class="text-[11px] text-sec capitalize">${this.escapeHtml(reasonLabel)}</span>
            <span class="text-[10px] text-mut px-2 py-0.5 rounded-full calm-inset">${u.minuteInSession}m</span>
          </div>
        </div>
      `;
    }).join('');
  }

  // --- FINISH SESSION & BREAK SCREEN ---
  completeFocusSession() {
    clearInterval(this.sessionTimerInterval);
    this.animations.stopBreathingRing(document.getElementById('timer-ring'));
    this.sound.stopAmbient();
    this.sound.playBreakChime();

    // Setup Break Screen & Urge Expiry Review
    this.setupBreakScreenUI();
    this.showScreen('screen-break');
  }

  setupBreakScreenUI() {
    if (!this.activeSession) return;
    document.title = 'Planned Break | Later Lane';

    const sessionSummaryText = document.getElementById('break-session-intent');
    if (sessionSummaryText) {
      const focusedMins = Math.max(1, Math.round(this.activeSession.secondsFocused / 60));
      sessionSummaryText.textContent = `Completed ${focusedMins}m of "${this.activeSession.intent}"`;
    }

    this.renderUrgeExpiryList();
    this.startBreakTimer(5); // 5 min break default
  }

  startBreakTimer(minutes) {
    clearInterval(this.breakTimerInterval);
    this.breakTotalSeconds = minutes * 60;
    this.breakSecondsRemaining = minutes * 60;
    this.isBreakPaused = false;
    document.getElementById('break-finished-alert')?.classList.add('hidden');
    const pauseBtn = document.getElementById('btn-break-pause');
    if (pauseBtn) pauseBtn.textContent = 'Pause';
    this.updateBreakTimerDisplay();

    this.breakTimerInterval = setInterval(() => {
      if (this.isBreakPaused) return;
      this.breakSecondsRemaining--;
      this.updateBreakTimerDisplay();

      if (this.breakSecondsRemaining <= 0) {
        clearInterval(this.breakTimerInterval);
        this.sound.playBreakChime();
        const alertEl = document.getElementById('break-finished-alert');
        if (alertEl) alertEl.classList.remove('hidden');
      }
    }, 1000);
  }

  updateBreakTimerDisplay() {
    const mins = Math.floor(Math.max(0, this.breakSecondsRemaining) / 60);
    const secs = Math.max(0, this.breakSecondsRemaining) % 60;
    const formatted = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    const display = document.getElementById('break-timer-display');
    if (display) display.textContent = formatted;
  }

  toggleBreakPause() {
    this.isBreakPaused = !this.isBreakPaused;
    const btn = document.getElementById('btn-break-pause');
    if (btn) btn.textContent = this.isBreakPaused ? 'Resume' : 'Pause';
  }

  addBreakMinutes(mins) {
    this.breakSecondsRemaining += mins * 60;
    this.breakTotalSeconds += mins * 60;
    this.updateBreakTimerDisplay();
  }

  // --- URGE EXPIRY REVIEW (The Aha! Moment) ---
  renderUrgeExpiryList() {
    const container = document.getElementById('urge-expiry-container');
    if (!container) return;

    const urges = this.activeSession?.urges || [];

    if (urges.length === 0) {
      container.innerHTML = `
        <div class="calm-card-sm p-6 text-center">
          <p class="text-sm font-medium text-main">Clean session — zero urges parked.</p>
          <p class="text-xs text-sec mt-1">Focus stayed steady without impulse interruptions.</p>
        </div>`;
      this.updateExpiryRealization();
      return;
    }

    container.innerHTML = urges.map((u) => {
      const isFaded = u.faded === true;
      const isStillWanted = u.faded === false;

      return `
        <div class="calm-card-sm p-4 transition-all" id="expiry-card-${u.id}">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div class="flex items-start gap-3">
              <span class="w-2 h-2 rounded-full bg-[#FBBF24] mt-1.5 shrink-0"></span>
              <div>
                <p class="font-medium text-main text-sm">${this.escapeHtml(u.text)}</p>
                <p class="text-xs text-mut mt-0.5">Minute ${u.minuteInSession} · <span class="capitalize">${this.escapeHtml(u.reason || 'habit')}</span></p>
              </div>
            </div>

            <div class="flex items-center gap-2 shrink-0">
              <button type="button" 
                      onclick="window.app.setUrgeExpiry('${u.id}', true)" 
                      class="calm-btn calm-btn-soft px-3.5 py-1.5 text-xs ${isFaded ? 'expiry-btn-faded-active' : ''}">
                Faded away
              </button>
              <button type="button" 
                      onclick="window.app.setUrgeExpiry('${u.id}', false)" 
                      class="calm-btn calm-btn-soft px-3.5 py-1.5 text-xs ${isStillWanted ? 'expiry-btn-wanted-active' : ''}">
                Still want to do
              </button>
            </div>
          </div>
        </div>
      `;
    }).join('');

    this.updateExpiryRealization();
  }

  setUrgeExpiry(urgeId, faded) {
    if (!this.activeSession) return;
    const urge = this.activeSession.urges.find(u => u.id === urgeId);
    if (urge) {
      urge.faded = faded;
      this.storage.saveCurrentSession(this.activeSession);
      this.renderUrgeExpiryList();
    }
  }

  updateExpiryRealization() {
    const card = document.getElementById('expiry-realization-card');
    const titleEl = document.getElementById('expiry-realization-title');
    const textEl = document.getElementById('expiry-realization-text');
    if (!card || !titleEl || !textEl) return;

    const urges = this.activeSession?.urges || [];
    if (urges.length === 0) {
      card.classList.add('hidden');
      return;
    }

    const evaluated = urges.filter(u => u.faded !== null);
    const fadedCount = urges.filter(u => u.faded === true).length;
    const total = urges.length;

    card.classList.remove('hidden');

    if (evaluated.length < total) {
      titleEl.textContent = 'Reflect on your parked urges';
      textEl.textContent = `Tap whether each impulse naturally faded or if you still genuinely want to check it now. (${evaluated.length}/${total} reviewed)`;
    } else {
      const percentage = Math.round((fadedCount / total) * 100);
      titleEl.textContent = `${fadedCount} of ${total} urges faded on their own (${percentage}%)`;
      if (percentage >= 50) {
        textEl.textContent = `By parking them in Later Lane instead of acting on reflex, you saved ~${fadedCount * 10} minutes of phone distraction.`;
      } else {
        textEl.textContent = `You created space to choose intentionally instead of reacting instantly. Enjoy your break.`;
      }
    }
  }

  // --- SAVE SESSION & GO TO REFLECTION ---
  finishBreakAndGoToReflection(targetScreen = 'screen-reflection') {
    clearInterval(this.breakTimerInterval);

    if (this.activeSession) {
      // Default unreviewed urges to faded if user completed
      this.activeSession.urges.forEach(u => {
        if (u.faded === null) u.faded = true;
      });

      const totalUrges = this.activeSession.urges.length;
      const fadedCount = this.activeSession.urges.filter(u => u.faded).length;
      const expiryRate = totalUrges > 0 ? Math.round((fadedCount / totalUrges) * 100) : 100;

      // Find top reason
      const counts = {};
      this.activeSession.urges.forEach(u => {
        counts[u.reason] = (counts[u.reason] || 0) + 1;
      });
      let topReason = 'none';
      let topCount = 0;
      for (const [r, c] of Object.entries(counts)) {
        if (c > topCount) {
          topCount = c;
          topReason = r;
        }
      }

      const completedSession = {
        ...this.activeSession,
        actualMinutesFocused: Math.max(1, Math.round(this.activeSession.secondsFocused / 60)),
        completedAt: new Date().toISOString(),
        expiryRate,
        topReason
      };

      this.storage.saveCompletedSession(completedSession);
      this.activeSession = null;
    }

    document.title = 'Later Lane — Focus & Urge Parking';
    this.renderAggregatedInsights();
    this.showScreen(targetScreen);
  }

  // Early end session confirmation
  confirmEndSessionEarly() {
    if (confirm('End this focus session now? Your progress and parked urges will be saved.')) {
      this.completeFocusSession();
    }
  }

  // --- REFLECTION & PATTERN MAP VIEW ---
  setInsightsTimeframe(timeframe) {
    this.insightsTimeframe = timeframe === 'weekly' ? 'weekly' : 'all';
    const weeklyBtn = document.getElementById('timeframe-weekly');
    const allBtn = document.getElementById('timeframe-all');
    if (weeklyBtn && allBtn) {
      const isWeekly = this.insightsTimeframe === 'weekly';
      weeklyBtn.className = isWeekly
        ? 'whitespace-nowrap px-3 py-1 rounded-xl bg-[var(--text-main)] text-[var(--bg-app)] font-medium transition'
        : 'whitespace-nowrap px-3 py-1 rounded-xl text-sec hover:text-main font-medium transition';
      allBtn.className = !isWeekly
        ? 'whitespace-nowrap px-3 py-1 rounded-xl bg-[var(--text-main)] text-[var(--bg-app)] font-medium transition'
        : 'whitespace-nowrap px-3 py-1 rounded-xl text-sec hover:text-main font-medium transition';
    }
    this.renderAggregatedInsights();
  }

  renderAggregatedInsights() {
    const stats = this.storage.getAggregatedStats(this.insightsTimeframe);
    const history = this.storage.getHistory();

    // Latest Session Summary Card
    const latestCard = document.getElementById('latest-session-summary-card');
    if (latestCard) {
      if (stats.latestSessionSummary) {
        const ls = stats.latestSessionSummary;
        latestCard.classList.remove('hidden');
        latestCard.classList.add('flex');
        const tagEl = document.getElementById('latest-session-tag');
        const intentEl = document.getElementById('latest-session-intent');
        const urgesEl = document.getElementById('latest-session-urges');
        const reasonEl = document.getElementById('latest-session-reason');
        const clusterEl = document.getElementById('latest-session-cluster');
        if (tagEl) tagEl.textContent = ls.tag;
        if (intentEl) intentEl.textContent = `${ls.intent} (${ls.focusedMins}m)`;
        if (urgesEl) urgesEl.textContent = `${ls.urgesCount} parked (${ls.fadedCount} faded)`;
        if (reasonEl) reasonEl.textContent = ls.topReason === 'none' ? 'Clear focus' : ls.topReason;
        if (clusterEl) clusterEl.textContent = ls.clusterText;
      } else {
        latestCard.classList.add('hidden');
        latestCard.classList.remove('flex');
      }
    }

    // Stat metric numbers
    const totalSessionsEl = document.getElementById('stat-total-sessions');
    const totalMinsEl = document.getElementById('stat-total-minutes');
    const totalUrgesEl = document.getElementById('stat-total-urges');
    const fadeRateEl = document.getElementById('stat-fade-rate');

    if (totalSessionsEl) totalSessionsEl.textContent = stats.totalSessions;
    if (totalMinsEl) totalMinsEl.textContent = stats.totalFocusMinutes;
    if (totalUrgesEl) totalUrgesEl.textContent = stats.totalUrges;
    if (fadeRateEl) fadeRateEl.textContent = `${stats.fadeRate}%`;

    // Dynamic Insight sentences
    const insightsContainer = document.getElementById('insights-sentences-list');
    if (insightsContainer) {
      insightsContainer.innerHTML = stats.insights.map((txt) => `
        <div class="calm-inset flex items-start gap-2.5 p-3.5">
          <span class="w-1.5 h-1.5 rounded-full bg-[#2DD4BF] mt-1.5 shrink-0"></span>
          <p class="text-xs sm:text-sm text-main leading-relaxed">${this.escapeHtml(txt)}</p>
        </div>
      `).join('');
    }

    // Minutes Histogram Bars (Serene Teal-Indigo Aura)
    const chartContainer = document.getElementById('minute-histogram-bars');
    if (chartContainer) {
      if (stats.totalUrges === 0) {
        chartContainer.innerHTML = `
          <div class="w-full h-36 flex flex-col items-center justify-center text-center gap-3">
            <p class="text-xs text-mut max-w-xs">Park urges during a focus session to see which minutes pull your attention.</p>
            <button type="button" onclick="window.app.loadDemoData()" class="calm-btn calm-btn-soft px-3.5 py-1.5 text-xs">
              Load 3 Sample Sessions
            </button>
          </div>`;
      } else {
        const maxVal = Math.max(1, ...Object.values(stats.minuteBuckets));
        chartContainer.innerHTML = Object.entries(stats.minuteBuckets).map(([bucket, count]) => {
          const heightPct = Math.round((count / maxVal) * 100);
          const isPeak = count > 0 && bucket === stats.peakBucket;
          return `
            <div class="flex flex-col items-center flex-1 h-36 justify-end group">
              <span class="text-[11px] font-medium ${isPeak ? 'text-aura' : 'text-mut'} mb-1.5">${count}</span>
              <div class="w-full max-w-[30px] rounded-t-xl ${isPeak ? 'bg-gradient-to-t from-[#0D9488] to-[#2DD4BF] shadow-sm shadow-teal-500/20' : 'bg-[var(--bg-glass-hover)] border border-[var(--border-soft)]'} transition-all" 
                   style="height: ${Math.max(8, heightPct)}%;"></div>
              <span class="text-[10px] text-mut mt-2 whitespace-nowrap">${bucket}</span>
            </div>
          `;
        }).join('');
      }
    }

    // Reasons Breakdown Badges
    const reasonsContainer = document.getElementById('reasons-breakdown-badges');
    if (reasonsContainer) {
      const total = stats.totalUrges || 1;
      const labelMap = { confusing: 'Confusing', bored: 'Bored', tired: 'Tired', anxious: 'Anxious', habit: 'Just Habit' };
      reasonsContainer.innerHTML = Object.entries(stats.reasonsCount)
        .filter(([k]) => labelMap[k])
        .map(([k, count]) => {
          const pct = Math.round((count / total) * 100);
          return `
            <div class="calm-inset flex items-center justify-between p-3 text-xs">
              <span class="text-main font-medium flex items-center gap-2">
                <span class="w-1.5 h-1.5 rounded-full bg-[#2DD4BF] opacity-80"></span>
                ${labelMap[k]}
              </span>
              <span class="text-sec">${count} (${pct}%)</span>
            </div>
          `;
        }).join('');
    }

    // Session History Cards
    const historyList = document.getElementById('history-sessions-list');
    if (historyList) {
      if (history.length === 0) {
        historyList.innerHTML = `<p class="text-xs text-mut py-4 text-center">No completed sessions yet. Begin a focus session above.</p>`;
      } else {
        historyList.innerHTML = history.slice(0, 8).map(s => {
          const dateStr = new Date(s.startedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
          const urgeCount = s.urges ? s.urges.length : 0;
          return `
            <div class="calm-inset p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-sm">
              <div>
                <div class="flex items-center gap-2">
                  <span class="font-medium text-main">${this.escapeHtml(s.intent)}</span>
                  <span class="text-[10px] font-medium px-2.5 py-0.5 rounded-full border calm-divider text-sec">${this.escapeHtml(s.tag || 'General')}</span>
                </div>
                <p class="text-[11px] text-mut mt-1">${dateStr} · ${s.actualMinutesFocused} min focused</p>
              </div>
              <div class="flex items-center">
                <span class="text-[11px] font-medium px-3 py-1 rounded-full calm-card-sm text-sec">
                  ${urgeCount} parked (${s.expiryRate || 100}% faded)
                </span>
              </div>
            </div>
          `;
        }).join('');
      }
    }
  }

  // Guided box breathing modal helper for anxious signal
  triggerBoxBreathModal() {
    const modal = document.getElementById('box-breathing-modal');
    if (!modal) return;
    modal.classList.remove('hidden');

    const phaseText = document.getElementById('box-breath-phase');
    const ring = document.getElementById('box-breath-ring');
    let phase = 0; // 0: inhale, 1: hold, 2: exhale, 3: hold
    const phases = ['Inhale gently (4s)', 'Hold peacefully (4s)', 'Exhale slowly (4s)', 'Rest (4s)'];

    clearInterval(this.activeBoxBreathingInterval);
    const updateBreath = () => {
      if (phaseText) phaseText.textContent = phases[phase % 4];
      if (ring) {
        ring.style.transform = (phase % 4 === 0 || phase % 4 === 1) ? 'scale(1.35)' : 'scale(1.0)';
        ring.style.transition = 'transform 4s ease-in-out';
      }
      phase++;
    };

    updateBreath();
    this.activeBoxBreathingInterval = setInterval(updateBreath, 4000);
  }

  closeBoxBreathModal() {
    clearInterval(this.activeBoxBreathingInterval);
    document.getElementById('box-breathing-modal')?.classList.add('hidden');
  }

  quickSplitStepPrompt() {
    const advice = prompt('What is the very first 2-minute step you can do right now? (e.g. read 1 paragraph, write 1 line)', '');
    if (advice && this.activeSession) {
      alert(`Small step locked in: "${advice}". You got this!`);
      this.closeParkUrgeSheet();
    }
  }

  // Export / Import / Clear Data
  exportData() {
    const dataStr = this.storage.exportAllData();
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `later-lane-data-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  promptImportData() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (event) => {
        const success = this.storage.importAllData(event.target.result);
        if (success) {
          alert('Data imported successfully!');
          this.renderAggregatedInsights();
        } else {
          alert('Invalid file format. Please upload a valid Later Lane JSON export.');
        }
      };
      reader.readAsText(file);
    };
    input.click();
  }

  loadDemoData() {
    const now = Date.now();
    const hour = 3600 * 1000;
    const demoSessions = [
      {
        id: 'demo_1',
        intent: 'Read Biology Chapter 4: Cell Division',
        tag: 'Study',
        durationMinutes: 25,
        actualMinutesFocused: 25,
        startedAt: new Date(now - 26 * hour).toISOString(),
        completedAt: new Date(now - 25.5 * hour).toISOString(),
        expiryRate: 75,
        topReason: 'confusing',
        urges: [
          { id: 'du_1', text: 'Check Instagram reels', reason: 'bored', minuteInSession: 12, faded: true },
          { id: 'du_2', text: 'Look up mitosis diagram meme', reason: 'confusing', minuteInSession: 17, faded: true },
          { id: 'du_3', text: 'Reply to Rahul', reason: 'habit', minuteInSession: 19, faded: false },
          { id: 'du_4', text: 'Check notifications', reason: 'confusing', minuteInSession: 22, faded: true }
        ]
      },
      {
        id: 'demo_2',
        intent: 'Solve Calculus Problem Set 3',
        tag: 'Assignment',
        durationMinutes: 45,
        actualMinutesFocused: 45,
        startedAt: new Date(now - 18 * hour).toISOString(),
        completedAt: new Date(now - 17.25 * hour).toISOString(),
        expiryRate: 67,
        topReason: 'confusing',
        urges: [
          { id: 'du_5', text: 'Check WhatsApp group', reason: 'anxious', minuteInSession: 16, faded: true },
          { id: 'du_6', text: 'Open YouTube explanation', reason: 'confusing', minuteInSession: 18, faded: false },
          { id: 'du_7', text: 'Get a snack', reason: 'tired', minuteInSession: 32, faded: true }
        ]
      },
      {
        id: 'demo_3',
        intent: 'Draft HCI Project Intro Section',
        tag: 'Writing',
        durationMinutes: 25,
        actualMinutesFocused: 25,
        startedAt: new Date(now - 4 * hour).toISOString(),
        completedAt: new Date(now - 3.5 * hour).toISOString(),
        expiryRate: 100,
        topReason: 'habit',
        urges: [
          { id: 'du_8', text: 'Check cricket score', reason: 'habit', minuteInSession: 8, faded: true },
          { id: 'du_9', text: 'Check email inbox', reason: 'anxious', minuteInSession: 19, faded: true }
        ]
      }
    ];

    demoSessions.forEach(s => this.storage.saveCompletedSession(s));
    this.renderAggregatedInsights();
  }

  confirmClearData() {
    if (confirm('Clear all your past sessions and stats? This cannot be undone.')) {
      this.storage.clearAllData();
      this.renderAggregatedInsights();
      alert('Data cleared.');
    }
  }

  // Event bindings
  bindEvents() {
    // Keyboard shortcuts
    window.addEventListener('keydown', (e) => {
      // If modal is open, Esc closes it
      if (e.key === 'Escape') {
        this.closeParkUrgeSheet();
        this.closeBoxBreathModal();
        this.closeSettingsModal();
        this.closeInstallHelpModal();
        return;
      }

      const parkSheetOpen = !document.getElementById('park-urge-overlay')?.classList.contains('hidden');
      const activeTag = document.activeElement?.tagName;
      const isTyping = activeTag === 'INPUT' || activeTag === 'TEXTAREA';

      // Quick number keys 1-5 for Stuck Signal chips when sheet is open and user isn't typing
      if (parkSheetOpen && !isTyping && ['1', '2', '3', '4', '5'].includes(e.key)) {
        const reasons = ['confusing', 'bored', 'tired', 'anxious', 'habit'];
        const chosen = reasons[parseInt(e.key, 10) - 1];
        if (chosen) {
          e.preventDefault();
          this.selectReason(chosen);
        }
        return;
      }

      // In focus session (only when Park sheet isn't blocking)
      if (this.currentScreen === 'screen-focus' && !parkSheetOpen && !isTyping) {
        if (e.code === 'Space') {
          e.preventDefault();
          this.togglePauseResume();
        } else if (e.key.toLowerCase() === 'p' || e.key.toLowerCase() === 'u') {
          e.preventDefault();
          this.openParkUrgeSheet();
        }
      }
    });

    // Enter key submissions for smooth zero-friction flow
    document.getElementById('input-intent')?.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        this.startNewSession();
      }
    });

    document.getElementById('input-urge-text')?.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        this.submitParkUrge(false);
      }
    });

    // Backdrop clicks to close modals gracefully
    document.getElementById('park-urge-overlay')?.addEventListener('click', (e) => {
      if (e.target.id === 'park-urge-overlay') this.closeParkUrgeSheet();
    });
    document.getElementById('box-breathing-modal')?.addEventListener('click', (e) => {
      if (e.target.id === 'box-breathing-modal') this.closeBoxBreathModal();
    });
    document.getElementById('settings-modal')?.addEventListener('click', (e) => {
      if (e.target.id === 'settings-modal') this.closeSettingsModal();
    });
    document.getElementById('install-help-modal')?.addEventListener('click', (e) => {
      if (e.target.id === 'install-help-modal') this.closeInstallHelpModal();
    });

    // Tag chips selector on Intent screen
    document.querySelectorAll('.tag-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        document.querySelectorAll('.tag-chip').forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
      });
    });

    // Quick duration selector
    document.querySelectorAll('.duration-pill').forEach(pill => {
      pill.addEventListener('click', () => {
        document.querySelectorAll('.duration-pill').forEach(p => p.classList.remove('active'));
        pill.classList.add('active');
        const durationInput = document.getElementById('input-duration');
        if (durationInput) durationInput.value = pill.dataset.mins;
      });
    });

    // Quick urge suggestions
    document.querySelectorAll('.quick-urge-pill').forEach(pill => {
      pill.addEventListener('click', () => {
        const input = document.getElementById('input-urge-text');
        if (input) {
          input.value = pill.dataset.text;
          input.focus();
        }
      });
    });
  }

  openSettingsModal() {
    document.getElementById('settings-modal')?.classList.remove('hidden');
  }

  closeSettingsModal() {
    document.getElementById('settings-modal')?.classList.add('hidden');
  }

  saveSettingsFromModal() {
    const soundEnabled = document.getElementById('setting-sound-toggle')?.checked ?? true;
    const reducedMotion = document.getElementById('setting-motion-toggle')?.checked ?? false;
    const theme = document.getElementById('setting-theme-select')?.value || 'dark';
    const ambientSound = document.getElementById('setting-ambient-select')?.value || 'none';
    const defaultDuration = parseInt(document.getElementById('setting-default-duration')?.value || '25', 10);

    this.storage.saveSettings({
      soundEnabled,
      reducedMotion,
      theme,
      ambientSound,
      defaultDuration
    });

    this.applySettings();
    this.closeSettingsModal();
  }

  setQuickAmbient(type) {
    this.sound.setAmbient(type);
    this.storage.saveSettings({ ambientSound: type });
    document.querySelectorAll('.ambient-chip').forEach(c => {
      c.classList.toggle('active', c.dataset.ambient === type);
    });
  }

  // --- PWA INSTALLATION HANDLER ---
  setupPWAInstall() {
    const installBtn = document.getElementById('btn-install-app');
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;

    if (isStandalone && installBtn) {
      installBtn.classList.add('hidden');
      return;
    }

    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      this.deferredInstallPrompt = e;
      if (installBtn) installBtn.classList.remove('hidden');
    });

    window.addEventListener('appinstalled', () => {
      this.deferredInstallPrompt = null;
      if (installBtn) installBtn.classList.add('hidden');
      this.closeInstallHelpModal();
    });
  }

  async triggerInstallApp() {
    if (this.deferredInstallPrompt) {
      this.deferredInstallPrompt.prompt();
      const { outcome } = await this.deferredInstallPrompt.userChoice;
      if (outcome === 'accepted') {
        this.deferredInstallPrompt = null;
        document.getElementById('btn-install-app')?.classList.add('hidden');
      }
      return;
    }
    document.getElementById('install-help-modal')?.classList.remove('hidden');
  }

  closeInstallHelpModal() {
    document.getElementById('install-help-modal')?.classList.add('hidden');
  }

  escapeHtml(str) {
    if (!str) return '';
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
}

document.addEventListener('DOMContentLoaded', () => {
  window.app = new LaterLaneApp();
});

