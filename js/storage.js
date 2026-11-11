/**
 * Later Lane - Local Storage & Data Store
 * Fully client-side, privacy-first, zero analytics tracking or accounts.
 */

const STORAGE_KEYS = {
  CURRENT_SESSION: 'laterlane_current_session',
  HISTORY: 'laterlane_sessions_history',
  SETTINGS: 'laterlane_settings'
};

const DEFAULT_SETTINGS = {
  uiVersion: 4,
  soundEnabled: false,
  ambientSound: 'none',
  ambientVolume: 0.25,
  reducedMotion: false,
  theme: 'dark',
  defaultDuration: 25
};

class LaterLaneStorage {
  constructor() {
    this.settings = this.loadSettings();
  }

  // Settings
  loadSettings() {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      if (!raw) return { ...DEFAULT_SETTINGS };
      const parsed = JSON.parse(raw);
      if (!parsed.uiVersion || parsed.uiVersion < 4) {
        const migrated = { ...DEFAULT_SETTINGS, ...parsed, theme: 'dark', uiVersion: 4 };
        localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(migrated));
        return migrated;
      }
      return { ...DEFAULT_SETTINGS, ...parsed };
    } catch (e) {
      console.warn('Failed to load settings from storage', e);
      return { ...DEFAULT_SETTINGS };
    }
  }

  saveSettings(newSettings) {
    this.settings = { ...this.settings, ...newSettings };
    try {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(this.settings));
    } catch (e) {
      console.error('Failed to save settings', e);
    }
    return this.settings;
  }

  // Active Session Persistence (survives accidental page reload)
  getCurrentSession() {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.CURRENT_SESSION);
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  }

  saveCurrentSession(session) {
    try {
      if (session) {
        localStorage.setItem(STORAGE_KEYS.CURRENT_SESSION, JSON.stringify(session));
      } else {
        localStorage.removeItem(STORAGE_KEYS.CURRENT_SESSION);
      }
    } catch (e) {
      console.error('Failed to save current session', e);
    }
  }

  clearCurrentSession() {
    try {
      localStorage.removeItem(STORAGE_KEYS.CURRENT_SESSION);
    } catch (e) {}
  }

  // History & Completed Sessions
  getHistory() {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.HISTORY);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      return [];
    }
  }

  saveCompletedSession(session) {
    const history = this.getHistory();
    // Add to beginning of history
    history.unshift(session);
    try {
      localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(history));
    } catch (e) {
      console.error('Failed to save session history', e);
    }
    this.clearCurrentSession();
    return history;
  }

  updateSessionInHistory(updatedSession) {
    const history = this.getHistory();
    const index = history.findIndex(s => s.id === updatedSession.id);
    if (index !== -1) {
      history[index] = updatedSession;
      try {
        localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(history));
      } catch (e) {
        console.error('Failed to update session', e);
      }
    }
  }

  // Analytics & Pattern Insights (Phase 4 of Roadmap)
  getAggregatedStats(timeframe = 'all') {
    const allHistory = this.getHistory();
    const weekAgoMs = Date.now() - 7 * 24 * 60 * 60 * 1000;
    const history = timeframe === 'weekly'
      ? allHistory.filter(s => new Date(s.startedAt || s.completedAt).getTime() >= weekAgoMs)
      : allHistory;

    const totalSessions = history.length;
    let totalFocusSeconds = 0;
    let totalUrges = 0;
    let fadedUrges = 0;

    const reasonsCount = {
      confusing: 0,
      bored: 0,
      tired: 0,
      anxious: 0,
      habit: 0,
      other: 0
    };

    const tagUrgesCount = {};

    // Buckets for minute distribution: 0-5, 6-10, 11-15, 16-20, 21-25, 26-30, 31+
    const minuteBuckets = {
      '0-5m': 0,
      '6-10m': 0,
      '11-15m': 0,
      '16-20m': 0,
      '21-25m': 0,
      '26-30m': 0,
      '31m+': 0
    };

    history.forEach(s => {
      totalFocusSeconds += (s.actualMinutesFocused || 0) * 60;
      if (Array.isArray(s.urges)) {
        const sessionTag = s.tag || 'General';
        tagUrgesCount[sessionTag] = (tagUrgesCount[sessionTag] || 0) + s.urges.length;

        s.urges.forEach(u => {
          totalUrges++;
          if (u.faded) fadedUrges++;

          const r = (u.reason || 'other').toLowerCase();
          if (reasonsCount[r] !== undefined) {
            reasonsCount[r]++;
          } else {
            reasonsCount.other++;
          }

          const m = u.minuteInSession || 1;
          if (m <= 5) minuteBuckets['0-5m']++;
          else if (m <= 10) minuteBuckets['6-10m']++;
          else if (m <= 15) minuteBuckets['11-15m']++;
          else if (m <= 20) minuteBuckets['16-20m']++;
          else if (m <= 25) minuteBuckets['21-25m']++;
          else if (m <= 30) minuteBuckets['26-30m']++;
          else minuteBuckets['31m+']++;
        });
      }
    });

    const fadeRate = totalUrges > 0 ? Math.round((fadedUrges / totalUrges) * 100) : 0;

    // Determine highest minute cluster
    let peakBucket = null;
    let peakCount = 0;
    for (const [bucket, count] of Object.entries(minuteBuckets)) {
      if (count > peakCount) {
        peakCount = count;
        peakBucket = bucket;
      }
    }

    // Determine top Stuck Signal
    let topReason = null;
    let topReasonCount = 0;
    for (const [reason, count] of Object.entries(reasonsCount)) {
      if (count > topReasonCount) {
        topReasonCount = count;
        topReason = reason;
      }
    }

    // Determine subject tag with most urges
    let topSubjectTag = null;
    let topSubjectUrges = 0;
    for (const [tag, count] of Object.entries(tagUrgesCount)) {
      if (count > topSubjectUrges) {
        topSubjectUrges = count;
        topSubjectTag = tag;
      }
    }

    // Build Latest Session Summary (Session-level urges parked, top reason, minute cluster)
    let latestSessionSummary = null;
    if (allHistory.length > 0) {
      const latest = allHistory[0];
      const latestUrges = Array.isArray(latest.urges) ? latest.urges : [];
      const latestFaded = latestUrges.filter(u => u.faded).length;
      const mins = latestUrges.map(u => u.minuteInSession || 1);
      let clusterText = 'No urges during this session';
      if (mins.length === 1) {
        clusterText = `Around minute ${mins[0]}`;
      } else if (mins.length > 1) {
        const minM = Math.min(...mins);
        const maxM = Math.max(...mins);
        const avgM = Math.round(mins.reduce((a, b) => a + b, 0) / mins.length);
        clusterText = minM === maxM
          ? `Clustered at minute ${avgM}`
          : `Clustered around minutes ${minM}–${maxM} (avg min ${avgM})`;
      }

      latestSessionSummary = {
        intent: latest.intent,
        tag: latest.tag || 'General',
        focusedMins: latest.actualMinutesFocused || 1,
        urgesCount: latestUrges.length,
        fadedCount: latestFaded,
        topReason: latest.topReason || 'none',
        clusterText
      };
    }

    // Generate gentle, non-judgmental insight sentences
    const insights = [];
    if (totalUrges > 0) {
      if (fadeRate >= 50) {
        insights.push(`${fadeRate}% of your parked urges faded away without you acting on them. Writing them down really gave your brain permission to release the itch.`);
      } else {
        insights.push(`You parked ${totalUrges} urges across your sessions. Each one was a pause instead of an automatic reflex.`);
      }

      if (peakBucket && peakCount > 1) {
        insights.push(`Urges tend to cluster around the ${peakBucket} window. Knowing this helps you ride the wave when that minute arrives.`);
      }

      if (topReason) {
        const readableReason = {
          confusing: 'when tasks feel confusing',
          bored: 'when you feel bored or restless',
          tired: 'when energy dips from fatigue',
          anxious: 'when subtle anxiety or overwhelm hits',
          habit: 'out of pure reflex or thumb muscle memory'
        }[topReason] || 'habit';

        insights.push(`Your most frequent stuck trigger is ${readableReason}. The Stuck Signal helps address the cause rather than feeling guilty.`);
      }

      if (topSubjectTag && topSubjectUrges >= 2 && totalSessions >= 2) {
        insights.push(`Most urges occurred during "${topSubjectTag}" tasks (${topSubjectUrges} urges) — try breaking those sessions into smaller pieces.`);
      }
    } else if (totalSessions > 0) {
      insights.push('Great start! Complete a few more sessions to reveal your personal attention pattern map.');
    } else {
      insights.push('Welcome to Later Lane. Start your first session to begin discovering your focus patterns.');
    }

    return {
      totalSessions,
      totalFocusMinutes: Math.round(totalFocusSeconds / 60),
      totalUrges,
      fadedUrges,
      fadeRate,
      reasonsCount,
      minuteBuckets,
      peakBucket,
      topReason,
      topSubjectTag,
      latestSessionSummary,
      insights
    };
  }

  // Backup / Export
  exportAllData() {
    const data = {
      version: 1,
      appName: 'Later Lane',
      exportedAt: new Date().toISOString(),
      settings: this.settings,
      history: this.getHistory()
    };
    return JSON.stringify(data, null, 2);
  }

  importAllData(jsonStr) {
    try {
      const data = JSON.parse(jsonStr);
      if (data && Array.isArray(data.history)) {
        localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(data.history));
        if (data.settings) {
          this.saveSettings(data.settings);
        }
        return true;
      }
      return false;
    } catch (e) {
      console.error('Import failed', e);
      return false;
    }
  }

  clearAllData() {
    localStorage.removeItem(STORAGE_KEYS.HISTORY);
    localStorage.removeItem(STORAGE_KEYS.CURRENT_SESSION);
  }
}

window.laneStorage = new LaterLaneStorage();

