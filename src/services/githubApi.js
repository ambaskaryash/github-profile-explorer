/**
 * githubApi.js  (v2 – expanded)
 * ──────────────────────────────
 * Centralised GitHub REST API service.
 * Token is read once at module load from sessionStorage → env fallback.
 * Handles 403 (rate-limit) and 404 with descriptive errors.
 */
import axios from 'axios';

// ── Token resolution (sessionStorage > env) ───────────────────────────────────
const resolveToken = () =>
    sessionStorage.getItem('gitexplorer_token') ?? import.meta.env.VITE_GITHUB_TOKEN ?? '';

// ── Axios instance ────────────────────────────────────────────────────────────
const githubApi = axios.create({
    baseURL: 'https://api.github.com',
    headers: { Accept: 'application/vnd.github.v3+json' },
});

// Inject token per-request so runtime token changes are picked up
githubApi.interceptors.request.use((config) => {
    const token = resolveToken();
    if (token) config.headers.Authorization = `token ${token}`;
    return config;
});

// ── Response interceptor ─────────────────────────────────────────────────────
githubApi.interceptors.response.use(
    (res) => res,
    (err) => {
        if (err.response?.status === 403)
            return Promise.reject(new Error('GitHub API rate limit exceeded. Add a token in Settings to increase your limit.'));
        if (err.response?.status === 404)
            return Promise.reject(new Error('Not found. Please check the username / repo name.'));
        return Promise.reject(err);
    }
);

// ─────────────────────────────────────────────────────────────────────────────
// USER ENDPOINTS
// ─────────────────────────────────────────────────────────────────────────────

export const getUserProfile = async (username) => {
    const { data } = await githubApi.get(`/users/${username}`);
    return data;
};

export const getUserRepos = async (username, page = 1, perPage = 9, sort = 'updated') => {
    const { data, headers } = await githubApi.get(`/users/${username}/repos`, {
        params: { page, per_page: perPage, sort, direction: 'desc' },
    });
    let totalCount = data.length;
    const lastMatch = (headers['link'] ?? '').match(/page=(\d+)>; rel="last"/);
    if (lastMatch) totalCount = parseInt(lastMatch[1], 10) * perPage;
    return { repos: data, totalCount };
};

export const getUserFollowers = async (username, page = 1) => {
    const { data } = await githubApi.get(`/users/${username}/followers`, {
        params: { per_page: 30, page },
    });
    return data;
};

export const getUserFollowing = async (username, page = 1) => {
    const { data } = await githubApi.get(`/users/${username}/following`, {
        params: { per_page: 30, page },
    });
    return data;
};

/** Returns up to 300 public events (10 pages) for contribution heatmap */
export const getUserEvents = async (username) => {
    const pages = await Promise.allSettled(
        [1, 2, 3].map((p) =>
            githubApi.get(`/users/${username}/events/public`, { params: { per_page: 100, page: p } })
        )
    );
    return pages
        .filter((r) => r.status === 'fulfilled')
        .flatMap((r) => r.value.data);
};

// ─────────────────────────────────────────────────────────────────────────────
// REPO ENDPOINTS
// ─────────────────────────────────────────────────────────────────────────────

export const getRepoDetails = async (owner, repo) => {
    const { data } = await githubApi.get(`/repos/${owner}/${repo}`);
    return data;
};

export const getRepoReadme = async (owner, repo) => {
    try {
        const { data } = await githubApi.get(`/repos/${owner}/${repo}/readme`, {
            headers: { Accept: 'application/vnd.github.v3.raw' },
        });
        return data; // raw markdown string
    } catch {
        return null; // no README
    }
};

export const getRepoContributors = async (owner, repo) => {
    try {
        const { data } = await githubApi.get(`/repos/${owner}/${repo}/contributors`, {
            params: { per_page: 10 },
        });
        return data;
    } catch {
        return [];
    }
};

export const getRepoLanguages = async (owner, repo) => {
    const { data } = await githubApi.get(`/repos/${owner}/${repo}/languages`);
    return data; // { "JavaScript": 12345, "CSS": 678 }
};

export const getRepoTopics = async (owner, repo) => {
    const { data } = await githubApi.get(`/repos/${owner}/${repo}/topics`, {
        headers: { Accept: 'application/vnd.github.mercy-preview+json' },
    });
    return data.names ?? [];
};

/**
 * Fetch star history timestamps (up to N pages × 100 per page).
 * Returns array of ISO date strings (one per star).
 */
export const getRepoStargazers = async (owner, repo, maxPages = 5) => {
    const pages = await Promise.allSettled(
        Array.from({ length: maxPages }, (_, i) =>
            githubApi.get(`/repos/${owner}/${repo}/stargazers`, {
                params: { per_page: 100, page: i + 1 },
                headers: { Accept: 'application/vnd.github.star+json' },
            })
        )
    );
    const events = pages
        .filter((r) => r.status === 'fulfilled')
        .flatMap((r) => r.value.data);
    return events.map((e) => e.starred_at);
};

// ─────────────────────────────────────────────────────────────────────────────
// SEARCH ENDPOINTS
// ─────────────────────────────────────────────────────────────────────────────

export const searchCode = async (query, username) => {
    const q = username ? `${query} user:${username}` : query;
    const { data } = await githubApi.get('/search/code', { params: { q, per_page: 20 } });
    return data.items;
};

// ─────────────────────────────────────────────────────────────────────────────
// ORGANISATION ENDPOINTS
// ─────────────────────────────────────────────────────────────────────────────

export const getOrgDetails = async (org) => {
    const { data } = await githubApi.get(`/orgs/${org}`);
    return data;
};

export const getOrgMembers = async (org, page = 1) => {
    const { data } = await githubApi.get(`/orgs/${org}/members`, {
        params: { per_page: 30, page },
    });
    return data;
};

export const getOrgRepos = async (org, page = 1) => {
    const { data } = await githubApi.get(`/orgs/${org}/repos`, {
        params: { per_page: 9, page, sort: 'stars', direction: 'desc' },
    });
    return data;
};

// ─────────────────────────────────────────────────────────────────────────────
// TRENDING  (GitHub Search API – official, no third-party dependency)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Trending repos via GitHub Search API.
 * `since` maps to a date-based pushed filter:
 *   daily   → pushed ≥ yesterday
 *   weekly  → pushed ≥ 7 days ago
 *   monthly → pushed ≥ 30 days ago
 */
export const getTrendingRepos = async (language = '', since = 'daily') => {
    const daysMap = { daily: 1, weekly: 7, monthly: 30 };
    const days = daysMap[since] ?? 1;
    const date = new Date();
    date.setDate(date.getDate() - days);
    const dateStr = date.toISOString().slice(0, 10);

    let q = `pushed:>=${dateStr} stars:>10`;
    if (language) q += ` language:${language}`;

    const { data } = await githubApi.get('/search/repositories', {
        params: { q, sort: 'stars', order: 'desc', per_page: 30 },
    });

    // Normalise to consistent shape used by TrendingPage
    return data.items.map((r) => ({
        author: r.owner?.login ?? '',
        name: r.name,
        url: r.html_url,
        description: r.description ?? '',
        language: r.language ?? '',
        stars: r.stargazers_count,
        forks: r.forks_count,
        avatar: r.owner?.avatar_url ?? '',
        currentPeriodStars: 0, // not available from Search API
    }));
};

export default githubApi;
