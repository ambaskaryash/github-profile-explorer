/**
 * TrendingPage.jsx
 * ─────────────────
 * Shows GitHub's trending repositories fetched from the unofficial gtrending API.
 * Filters by language and time range (daily / weekly / monthly).
 */
import { useState, useEffect } from 'react';
import { FiStar, FiGitBranch, FiLoader, FiTrendingUp, FiRefreshCw } from 'react-icons/fi';
import { getTrendingRepos } from '../services/githubApi';
import { getLanguageColor, formatNumber } from '../utils/formatUtils';
import ErrorMessage from '../components/ErrorMessage';

const LANGUAGES = ['', 'JavaScript', 'TypeScript', 'Python', 'Rust', 'Go', 'Java', 'C++', 'C', 'Ruby', 'PHP', 'Swift', 'Kotlin'];
const SINCE_OPTIONS = [
    { value: 'daily', label: 'Today' },
    { value: 'weekly', label: 'This Week' },
    { value: 'monthly', label: 'This Month' },
];

const SkeletonCard = () => (
    <div className="glass-card p-5 space-y-3">
        <div className="skeleton h-4 w-2/3 rounded" />
        <div className="skeleton h-3 w-full rounded" />
        <div className="skeleton h-3 w-3/4 rounded" />
        <div className="flex gap-3 pt-2">
            <div className="skeleton h-5 w-16 rounded-full" />
            <div className="skeleton h-5 w-12 rounded-full" />
        </div>
    </div>
);

const TrendingPage = () => {
    const [repos, setRepos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [language, setLanguage] = useState('');
    const [since, setSince] = useState('daily');

    const load = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await getTrendingRepos(language, since);
            setRepos(data);
        } catch (e) {
            setError(e.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { load(); }, [language, since]);

    return (
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            {/* Header */}
            <div className="text-center mb-8">
                <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center justify-center gap-3">
                    <FiTrendingUp className="text-brand-500" />
                    GitHub Trending
                </h1>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Discover the hottest repositories right now</p>
            </div>

            {/* Controls */}
            <div className="flex flex-wrap gap-3 justify-center mb-8">
                {SINCE_OPTIONS.map((o) => (
                    <button
                        key={o.value}
                        onClick={() => setSince(o.value)}
                        className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${since === o.value
                                ? 'bg-brand-500 text-white shadow-md shadow-brand-500/30'
                                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 hover:border-brand-500'
                            }`}
                    >
                        {o.label}
                    </button>
                ))}

                <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="px-4 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700
                     bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 outline-none focus:border-brand-500"
                >
                    <option value="">All Languages</option>
                    {LANGUAGES.slice(1).map((l) => <option key={l} value={l}>{l}</option>)}
                </select>

                <button onClick={load} className="btn-primary text-sm" aria-label="Refresh">
                    <FiRefreshCw size={14} className={loading ? 'animate-spin' : ''} />
                </button>
            </div>

            {error && <ErrorMessage message={error} />}

            {/* Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {loading
                    ? [...Array(9)].map((_, i) => <SkeletonCard key={i} />)
                    : repos.map((repo, i) => {
                        const langColor = getLanguageColor(repo.language);
                        return (
                            <a
                                key={i}
                                href={repo.url}
                                target="_blank"
                                rel="noreferrer"
                                className="glass-card p-5 flex flex-col gap-3 group hover:shadow-xl hover:-translate-y-1
                             transition-all duration-200 animate-fade-in"
                            >
                                <div className="flex items-start gap-3">
                                    <img src={repo.avatar} alt={repo.author} className="w-8 h-8 rounded-full object-cover" />
                                    <div className="min-w-0">
                                        <p className="text-xs text-slate-500 dark:text-slate-400">{repo.author}</p>
                                        <p className="text-sm font-bold text-slate-800 dark:text-white group-hover:text-brand-500
                                   transition-colors truncate">{repo.name}</p>
                                    </div>
                                    <span className="ml-auto text-xs font-bold text-slate-400">#{i + 1}</span>
                                </div>

                                {repo.description && (
                                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                                        {repo.description}
                                    </p>
                                )}

                                <div className="flex flex-wrap gap-2 mt-auto">
                                    {repo.language && (
                                        <span className="lang-badge bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                                            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: langColor }} />
                                            {repo.language}
                                        </span>
                                    )}
                                    <span className="lang-badge bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400">
                                        <FiStar size={11} /> {formatNumber(repo.stars)}
                                    </span>
                                    <span className="lang-badge bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                                        <FiGitBranch size={11} /> {formatNumber(repo.forks)}
                                    </span>
                                    {repo.currentPeriodStars > 0 && (
                                        <span className="lang-badge bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400">
                                            ↑ {formatNumber(repo.currentPeriodStars)} stars
                                        </span>
                                    )}
                                </div>
                            </a>
                        );
                    })
                }
            </div>
        </main>
    );
};

export default TrendingPage;
