/**
 * useGithub.js
 * ────────────
 * Central custom hook encapsulating all GitHub API logic.
 *
 * Responsibilities:
 *  - Debounced username search (300ms) to avoid spamming the API
 *  - Fetch profile + repositories together
 *  - Pagination state (page, totalPages)
 *  - Sorting by 'updated' | 'stars'
 *  - Unified loading / error states
 */
import { useState, useEffect, useCallback, useRef } from 'react';
import { getUserProfile, getUserRepos } from '../services/githubApi';

const PER_PAGE = 9;

const useGithub = () => {
    const [username, setUsername] = useState('');
    const [debouncedUsername, setDebounced] = useState('');
    const [profile, setProfile] = useState(null);
    const [repos, setRepos] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [sortBy, setSortBy] = useState('updated'); // 'updated' | 'stars'

    const debounceRef = useRef(null);

    // ── Debounce ───────────────────────────────────────────────────────────────
    useEffect(() => {
        clearTimeout(debounceRef.current);
        if (!username.trim()) {
            setDebounced('');
            return;
        }
        debounceRef.current = setTimeout(() => {
            setDebounced(username.trim());
            setPage(1); // Reset to first page on new search
        }, 300);

        return () => clearTimeout(debounceRef.current);
    }, [username]);

    // ── Fetch data when debounced username / page / sort changes ──────────────
    const fetchData = useCallback(async () => {
        if (!debouncedUsername) {
            setProfile(null);
            setRepos([]);
            setError(null);
            return;
        }

        setLoading(true);
        setError(null);

        try {
            // Fetch profile first to get accurate public_repos count,
            // then fetch repos using that count for reliable pagination.
            const profileData = await getUserProfile(debouncedUsername);
            const repoData = await getUserRepos(debouncedUsername, page, PER_PAGE, sortBy);

            setProfile(profileData);
            setRepos(repoData.repos);

            // profile.public_repos is the authoritative count –
            // GitHub's Link header is unreliable for unauthenticated requests.
            const knownTotal = profileData.public_repos ?? repoData.totalCount;
            setTotalPages(Math.max(1, Math.ceil(knownTotal / PER_PAGE)));
        } catch (err) {
            setError(err.message ?? 'An unexpected error occurred.');
            setProfile(null);
            setRepos([]);
        } finally {
            setLoading(false);
        }
    }, [debouncedUsername, page, sortBy]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // Expose sorted repos client-side when sort changes after load
    // (API re-fetches, so this is handled by the effect above)

    return {
        username,
        setUsername,
        profile,
        repos,
        loading,
        error,
        page,
        setPage,
        totalPages,
        sortBy,
        setSortBy,
        hasResults: !!profile,
    };
};

export default useGithub;
