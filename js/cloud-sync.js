/**
 * Later Lane - Supabase Auth & Cross-Device Cloud Sync
 * Uses Supabase Auth (Google OAuth PKCE) + Postgres RLS-protected tables (`focus_sessions`, `user_settings`).
 * Note: Only the public Publishable key (`sb_publishable_...`) is used in client code; RLS enforces per-user isolation.
 */

const SUPABASE_CONFIG = {
  url: 'https://ubarkvwaiuqisrggklqn.supabase.co',
  publishableKey: 'sb_publishable_lMsA3H-IohhnEmTN9FQZkQ_c62IHAQN'
};

class LaterLaneCloud {
  constructor() {
    this.client = null;
    this.currentUser = null;
    this.syncState = 'idle'; // 'idle' | 'syncing' | 'synced' | 'offline' | 'error'
    this.lastAuthError = null;
    this.onSyncStatusChange = null;
    this.initClient();
  }

  initClient() {
    this.captureUrlError();

    if (window.supabase && typeof window.supabase.createClient === 'function') {
      try {
        this.client = window.supabase.createClient(
          SUPABASE_CONFIG.url,
          SUPABASE_CONFIG.publishableKey,
          {
            auth: {
              flowType: 'pkce',
              detectSessionInUrl: true,
              persistSession: true,
              autoRefreshToken: true
            }
          }
        );
      } catch (err) {
        console.warn('Supabase client init warning:', err);
      }
    }
  }

  captureUrlError() {
    try {
      const searchParams = new URLSearchParams(window.location.search);
      const hashStr = window.location.hash.startsWith('#') ? window.location.hash.slice(1) : '';
      const hashParams = new URLSearchParams(hashStr);
      const errDesc = searchParams.get('error_description') || hashParams.get('error_description');
      const errCode = searchParams.get('error') || hashParams.get('error');
      if (errDesc || errCode) {
        this.lastAuthError = errDesc || `Sign-in failed (${errCode}).`;
      }
    } catch (e) {}
  }

  cleanAuthUrl() {
    try {
      const url = new URL(window.location.href);
      const authParams = ['code', 'state', 'error', 'error_code', 'error_description'];
      let changed = false;
      authParams.forEach((p) => {
        if (url.searchParams.has(p)) {
          url.searchParams.delete(p);
          changed = true;
        }
      });
      if (url.hash && (url.hash.includes('access_token=') || url.hash.includes('error='))) {
        url.hash = '';
        changed = true;
      }
      if (changed) {
        const cleanUrl = url.pathname + (url.searchParams.toString() ? '?' + url.searchParams.toString() : '');
        window.history.replaceState({}, document.title, cleanUrl);
      }
    } catch (e) {}
  }

  setSyncState(state) {
    this.syncState = state;
    if (typeof this.onSyncStatusChange === 'function') {
      this.onSyncStatusChange(state);
    }
  }

  async resolveSession() {
    if (!this.client) {
      this.initClient();
    }
    if (!this.client) {
      return {
        user: null,
        error: this.lastAuthError || 'Authentication SDK unavailable offline. Connect to the internet to sign in.'
      };
    }

    try {
      const { data, error } = await this.client.auth.getSession();
      this.cleanAuthUrl();

      if (error) {
        return { user: null, error: error.message || this.lastAuthError };
      }

      const session = data?.session;
      if (!session || !session.user) {
        this.currentUser = null;
        return { user: null, error: this.lastAuthError };
      }

      // Verify JWT against Supabase Auth when online so revoked/expired sessions cannot access protected views
      if (navigator.onLine !== false) {
        const { data: userData, error: userErr } = await this.client.auth.getUser();
        if (userErr) {
          const isAuthRejection =
            userErr.status === 401 ||
            userErr.status === 403 ||
            userErr.code === 'bad_jwt' ||
            userErr.code === 'user_not_found' ||
            userErr.code === 'session_not_found';

          if (isAuthRejection) {
            await this.client.auth.signOut({ scope: 'local' });
            this.currentUser = null;
            return { user: null, error: 'Your session expired. Please sign in with Google again.' };
          }
          // Network hiccup: preserve local session so PWA continues offline gracefully
          this.currentUser = session.user;
          this.setSyncState('offline');
          return { user: session.user, error: null };
        }
        this.currentUser = userData?.user || session.user;
        return { user: this.currentUser, error: null };
      }

      this.currentUser = session.user;
      this.setSyncState('offline');
      return { user: this.currentUser, error: null };
    } catch (err) {
      return { user: null, error: this.lastAuthError || 'Could not verify session.' };
    }
  }

  onAuthStateChange(handler) {
    if (!this.client) return () => {};
    const { data } = this.client.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED') {
        this.currentUser = session?.user || null;
        this.cleanAuthUrl();
      } else if (event === 'SIGNED_OUT') {
        this.currentUser = null;
        this.setSyncState('idle');
      }
      handler(event, session);
    });
    return () => data?.subscription?.unsubscribe();
  }

  async signInWithGoogle() {
    if (!this.client) {
      this.initClient();
    }
    if (!this.client) {
      throw new Error('Supabase Auth library could not be loaded. Check your internet connection and reload.');
    }
    if (navigator.onLine === false) {
      throw new Error('You appear to be offline. Connect to the internet to sign in with Google.');
    }

    const redirectTo = window.location.origin + window.location.pathname;
    const { data, error } = await this.client.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo,
        queryParams: {
          prompt: 'select_account'
        }
      }
    });

    if (error) {
      const msg = error.message || '';
      if (msg.toLowerCase().includes('provider is not enabled') || msg.toLowerCase().includes('unsupported provider')) {
        throw new Error('Google provider is not enabled in your Supabase Dashboard yet (Authentication → Providers → Google).');
      }
      throw error;
    }

    return data;
  }

  async signOut() {
    if (!this.client) return;
    try {
      await this.client.auth.signOut();
    } catch (err) {
      await this.client.auth.signOut({ scope: 'local' });
    }
    this.currentUser = null;
    this.setSyncState('idle');
  }

  sessionToRow(session, userId) {
    return {
      user_id: userId,
      client_id: String(session.id || ('sess_' + Date.now())),
      intent: String(session.intent || 'Focus Session'),
      tag: String(session.tag || 'General'),
      duration_minutes: Math.max(1, parseInt(session.durationMinutes || 25, 10)),
      actual_minutes_focused: Math.max(0, parseInt(session.actualMinutesFocused || 0, 10)),
      started_at: session.startedAt || session.completedAt || new Date().toISOString(),
      completed_at: session.completedAt || new Date().toISOString(),
      expiry_rate: typeof session.expiryRate === 'number' ? session.expiryRate : 100,
      top_reason: session.topReason || 'none',
      urges: Array.isArray(session.urges) ? session.urges : []
    };
  }

  rowToSession(row) {
    return {
      id: row.client_id,
      intent: row.intent,
      tag: row.tag || 'General',
      durationMinutes: row.duration_minutes || 25,
      actualMinutesFocused: row.actual_minutes_focused || 0,
      startedAt: row.started_at,
      completedAt: row.completed_at,
      expiryRate: row.expiry_rate ?? 100,
      topReason: row.top_reason || 'none',
      urges: Array.isArray(row.urges) ? row.urges : []
    };
  }

  async upsertSessions(sessions) {
    if (!this.client || !this.currentUser || !Array.isArray(sessions) || sessions.length === 0) {
      return { ok: true };
    }
    if (navigator.onLine === false) {
      this.setSyncState('offline');
      return { ok: false, offline: true };
    }

    this.setSyncState('syncing');
    const rows = sessions.map((s) => this.sessionToRow(s, this.currentUser.id));
    const { error } = await this.client
      .from('focus_sessions')
      .upsert(rows, { onConflict: 'user_id,client_id' });

    if (error) {
      console.warn('Cloud session upsert failed:', error);
      this.setSyncState('error');
      return { ok: false, error };
    }

    this.setSyncState('synced');
    return { ok: true };
  }

  async clearCloudSessions() {
    if (!this.client || !this.currentUser) return { ok: true };
    if (navigator.onLine === false) {
      this.setSyncState('offline');
      return { ok: false, offline: true };
    }

    this.setSyncState('syncing');
    const { error } = await this.client
      .from('focus_sessions')
      .delete()
      .eq('user_id', this.currentUser.id);

    if (error) {
      console.warn('Cloud clear failed:', error);
      this.setSyncState('error');
      return { ok: false, error };
    }

    this.setSyncState('synced');
    return { ok: true };
  }

  async upsertSettings(settings) {
    if (!this.client || !this.currentUser) return { ok: false };
    if (navigator.onLine === false) {
      this.setSyncState('offline');
      return { ok: false, offline: true };
    }

    const { error } = await this.client
      .from('user_settings')
      .upsert(
        {
          user_id: this.currentUser.id,
          settings: settings || {}
        },
        { onConflict: 'user_id' }
      );

    if (error) {
      console.warn('Cloud settings upsert failed:', error);
      return { ok: false, error };
    }
    return { ok: true };
  }

  async syncAccountData(localSessions, localSettings, legacySessions = []) {
    if (!this.client || !this.currentUser) return { ok: false };
    if (navigator.onLine === false) {
      this.setSyncState('offline');
      return { ok: false, offline: true };
    }

    this.setSyncState('syncing');

    try {
      // 1. Push any local or pre-login legacy sessions first so offline sessions are never lost
      const toPushMap = new Map();
      [...legacySessions, ...localSessions].forEach((s) => {
        if (s && s.id) toPushMap.set(String(s.id), s);
      });
      if (toPushMap.size > 0) {
        const pushRows = Array.from(toPushMap.values()).map((s) =>
          this.sessionToRow(s, this.currentUser.id)
        );
        const { error: pushErr } = await this.client
          .from('focus_sessions')
          .upsert(pushRows, { onConflict: 'user_id,client_id' });
        if (pushErr) throw pushErr;
      }

      // 2. Pull full remote sessions list sorted newest first
      const { data: remoteRows, error: fetchErr } = await this.client
        .from('focus_sessions')
        .select('*')
        .eq('user_id', this.currentUser.id)
        .order('started_at', { ascending: false });

      if (fetchErr) throw fetchErr;

      // 3. Pull or initialize remote user settings
      const { data: remoteSettingsRow, error: settingsErr } = await this.client
        .from('user_settings')
        .select('settings')
        .eq('user_id', this.currentUser.id)
        .maybeSingle();

      if (settingsErr) throw settingsErr;

      if (!remoteSettingsRow && localSettings) {
        await this.upsertSettings(localSettings);
      }

      const sessions = (remoteRows || []).map((r) => this.rowToSession(r));
      this.setSyncState('synced');

      return {
        ok: true,
        sessions,
        settings: remoteSettingsRow?.settings || null
      };
    } catch (err) {
      console.warn('Supabase sync failed:', err);
      this.setSyncState('error');
      return { ok: false, error: err };
    }
  }
}

window.laneCloud = new LaterLaneCloud();

