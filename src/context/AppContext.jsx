/**
 * AppContext.jsx
 * ─────────────
 * Global app state shared across all pages:
 *  - GitHub API token (runtime, stored in sessionStorage)
 *  - Search history (localStorage, last 10 usernames)
 *  - Active page tab  (Explorer | Compare | Trending | Org)
 */
import { createContext, useContext, useState, useEffect, useCallback } from 'react';

const AppContext = createContext(null);

const HISTORY_KEY = 'gitexplorer_history';
const TOKEN_KEY = 'gitexplorer_token';
const MAX_HISTORY = 10;

export const AppProvider = ({ children }) => {
    // ── Token ────────────────────────────────────────────────────────────────
    const [token, setTokenState] = useState(
        () => sessionStorage.getItem(TOKEN_KEY) ?? import.meta.env.VITE_GITHUB_TOKEN ?? ''
    );

    const setToken = useCallback((t) => {
        setTokenState(t);
        sessionStorage.setItem(TOKEN_KEY, t);
        // Reload to pick up new token in Axios instance
        window.location.reload();
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
        <AppContext.Provider value={{ token, setToken, history, addToHistory, clearHistory }}>
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
