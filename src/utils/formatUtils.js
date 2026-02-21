/**
 * formatUtils.js
 * ──────────────
 * Stateless formatting helpers used across the UI.
 */

/**
 * Format large numbers into compact human-readable form.
 * e.g. 1234 → "1.2k", 1_000_000 → "1M"
 */
export const formatNumber = (n) => {
    if (n === null || n === undefined) return '0';
    if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
    if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`;
    return String(n);
};

/**
 * Format an ISO date string into a friendly relative date.
 * e.g. "2023-07-15T10:30:00Z" → "Jul 2023"
 */
export const formatDate = (iso) => {
    if (!iso) return '';
    const date = new Date(iso);
    return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
};

/**
 * Map a programming language name to a hex color consistent with GitHub's palette.
 */
const LANG_COLORS = {
    JavaScript: '#f1e05a',
    TypeScript: '#3178c6',
    Python: '#3572A5',
    Rust: '#dea584',
    Go: '#00ADD8',
    Java: '#b07219',
    'C++': '#f34b7d',
    C: '#555555',
    Ruby: '#701516',
    PHP: '#4F5D95',
    Swift: '#F05138',
    Kotlin: '#A97BFF',
    Shell: '#89e051',
    HTML: '#e34c26',
    CSS: '#563d7c',
    Dart: '#00B4AB',
    Scala: '#c22d40',
    Haskell: '#5e5086',
    Lua: '#000080',
    Vue: '#41b883',
    Svelte: '#ff3e00',
};

/**
 * Return the HEX color for a language, or a neutral fallback.
 */
export const getLanguageColor = (lang) => LANG_COLORS[lang] ?? '#8b8b8b';
