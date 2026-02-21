/**
 * AppContext.jsx  (v2 – OAuth)
 * ─────────────────────────────
 * Global app state shared across all pages:
 *  - GitHub API token (runtime, stored in sessionStorage)
 *  - Search history (localStorage, last 10 usernames)
 *  - OAuth user + token (GitHub OAuth flow via Vercel function)
 */
import { createContext, useContext, useState, useCallback } from 'react';

const AppContext = createContext(null);

const HISTORY_KEY = 'gitexplorer_history';
const TOKEN_KEY = 'gitexplorer_token';
const OAUTH_TOKEN_KEY = 'gitexplorer_oauth_token';
const OAUTH_USER_KEY = 'gitexplorer_oauth_user';
const MAX_HISTORY = 10;

export const AppProvider = ({ children }) => {
    // ── Manual PAT Token ─────────────────────────────────────────────────────
    const [token, setTokenState] = useState(
        () => sessionStorage.getItem(TOKEN_KEY) ?? import.meta.env.VITE_GITHUB_TOKEN ?? ''
    );

    const setToken = useCallback((t) => {
        setTokenState(t);
        sessionStorage.setItem(TOKEN_KEY, t);
        window.location.reload();
    }, []);

    // ── OAuth State ───────────────────────────────────────────────────────────
    const [oauthToken, setOauthTokenState] = useState(
        () => sessionStorage.getItem(OAUTH_TOKEN_KEY) ?? null
    );
    const [oauthUser, setOauthUserState] = useState(() => {
        try {
            const stored = sessionStorage.getItem(OAUTH_USER_KEY);
            return stored ? JSON.parse(stored) : null;
        } catch { return null; }
    });

    /** Called by OAuthCallback after successful token exchange */
    const setOauthSession = useCallback((accessToken, user) => {
        sessionStorage.setItem(OAUTH_TOKEN_KEY, accessToken);
        sessionStorage.setItem(OAUTH_USER_KEY, JSON.stringify(user));
        setOauthTokenState(accessToken);
        setOauthUserState(user);
    }, []);

    /** Redirect to GitHub OAuth authorize page */
    const login = useCallback(() => {
        const clientId = import.meta.env.VITE_GITHUB_CLIENT_ID;
        if (!clientId) {
            alert('GitHub OAuth is not configured. Set VITE_GITHUB_CLIENT_ID in .env');
            return;
        }
        const params = new URLSearchParams({
            client_id: clientId,
            redirect_uri: `${window.location.origin}/auth/callback`,
            scope: 'read:user public_repo',
        });
        window.location.href = `https://github.com/login/oauth/authorize?${params}`;
    }, []);

    /** Clear OAuth session */
    const logout = useCallback(() => {
        sessionStorage.removeItem(OAUTH_TOKEN_KEY);
        sessionStorage.removeItem(OAUTH_USER_KEY);
        setOauthTokenState(null);
        setOauthUserState(null);
    }, []);

    // ── Search History ────────────────────────────────────────────────────────
    const [history, setHistory] = useState(() => {
        try { return JSON.parse(localStorage.getItem(HISTORY_KEY) ?? '[]'); }
        catch { return []; }
    });

    const addToHistory = useCallback((username) => {
        if (!username?.trim()) return;
        setHistory((prev) => {
            const next = [username, ...prev.filter((u) => u !== username)].slice(0, MAX_HISTORY);
            localStorage.setItem(HISTORY_KEY, JSON.stringify(next));
            return next;
        });
    }, []);

    const clearHistory = useCallback(() => {
        setHistory([]);
        localStorage.removeItem(HISTORY_KEY);
    }, []);

    return (
        <AppContext.Provider value={{
            // Manual token
            token, setToken,
            // OAuth
            oauthToken, oauthUser, login, logout, setOauthSession,
            // Effective token for API (OAuth takes priority over manual PAT)
            effectiveToken: oauthToken ?? token,
            // History
            history, addToHistory, clearHistory,
        }}>
            {children}
        </AppContext.Provider>
    );
};

export const useAppContext = () => {
    const ctx = useContext(AppContext);
    if (!ctx) throw new Error('useAppContext must be used inside AppProvider');
    return ctx;
};

export default AppContext;

