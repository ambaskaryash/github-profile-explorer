/**
 * RepoExplorer.jsx  (v2)
 * ──────────────────────
 * Repo grid with:
 *  - Click a card → fires onRepoClick(owner, repoName) for the side panel
 *  - RepoFilter for client-side name/language filtering
 *  - Sort dropdown
 *  - Skeleton loading
 */
import { useState, useCallback } from 'react';
import { FiStar, FiGitBranch, FiCalendar, FiCode } from 'react-icons/fi';
import { MdOutlineTouchApp } from 'react-icons/md';
import { formatNumber, formatDate, getLanguageColor } from '../utils/formatUtils';
import RepoFilter from './RepoFilter';

// ── Skeleton ───────────────────────────────────────────────────────────────────
const SkeletonRepo = () => (
    <div className="glass-card p-5 space-y-3">
        <div className="skeleton h-4 w-3/4 rounded" />
        <div className="skeleton h-3 w-full rounded" />
        <div className="skeleton h-3 w-2/3 rounded" />
        <div className="flex gap-3 pt-2">
            <div className="skeleton h-5 w-16 rounded-full" />
            <div className="skeleton h-5 w-12 rounded-full" />
        </div>
    </div>
);

// ── Repo card ──────────────────────────────────────────────────────────────────
const RepoCard = ({ repo, onClick }) => {
    const { name, description, language, stargazers_count, forks_count, updated_at, owner } = repo;
    const langColor = getLanguageColor(language);

    return (
        <article
            onClick={() => onClick(owner?.login, name)}
            className="glass-card p-5 flex flex-col gap-3 group hover:shadow-xl hover:-translate-y-1
                 hover:ring-2 hover:ring-brand-500/30 transition-all duration-200 cursor-pointer animate-fade-in"
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && onClick(owner?.login, name)}
            aria-label={`View details for ${name}`}
        >
            {/* Repo name */}
            <div className="flex items-start justify-between gap-2">
                <span className="text-sm font-bold text-brand-500 group-hover:text-brand-600 dark:group-hover:text-brand-400
                         transition-colors leading-tight break-all">
                    {name}
                </span>
                <MdOutlineTouchApp
                    size={15}
                    className="shrink-0 text-slate-300 dark:text-slate-600 group-hover:text-brand-500 transition-colors mt-0.5"
                />
            </div>

            {/* Description */}
            {description && (
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-2 flex-1">
                    {description}
                </p>
            )}

            {/* Badges */}
            <div className="flex flex-wrap items-center gap-2 mt-auto pt-1">
                {language && (
                    <span className="lang-badge bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                        <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: langColor }} />
                        {language}
                    </span>
                )}
                <span className="lang-badge bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400">
                    <FiStar size={11} />
                    {formatNumber(stargazers_count)}
                </span>
                <span className="lang-badge bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                    <FiGitBranch size={11} />
                    {formatNumber(forks_count)}
                </span>
                <span className="lang-badge bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400">
                    <FiCalendar size={11} />
                    {formatDate(updated_at)}
                </span>
            </div>

            {/* Click hint */}
            <p className="text-[10px] text-slate-300 dark:text-slate-600 group-hover:text-brand-400 transition-colors -mt-1">
                Click to view details →
            </p>
        </article>
    );
};

// ── RepoExplorer ───────────────────────────────────────────────────────────────
const RepoExplorer = ({ repos, loading, sortBy, setSortBy, onRepoClick }) => {
    const [filteredRepos, setFilteredRepos] = useState(repos);

    // Sync filteredRepos when top-level repos change (new user / page)
    const handleFilter = useCallback((filtered) => setFilteredRepos(filtered), []);

    if (!loading && repos.length === 0) return null;

    return (
        <section aria-label="Repository explorer">
            {/* Header */}
            <div className="flex items-center justify-between mb-3">
                <h3 className="flex items-center gap-2 text-base font-bold text-slate-800 dark:text-white">
                    <FiCode className="text-brand-500" size={18} />
                    Repositories
                    {!loading && (
                        <span className="text-xs font-normal text-slate-400 dark:text-slate-500">
                            ({filteredRepos.length} shown)
                        </span>
                    )}
                </h3>

                <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    aria-label="Sort repositories"
                    className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700
                     bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300
                     outline-none focus:border-brand-500 cursor-pointer transition-colors"
                >
                    <option value="updated">🕐 Recently Updated</option>
                    <option value="stars">⭐ Most Stars</option>
                    <option value="forks">🍴 Most Forks</option>
                </select>
            </div>

            {/* Filter bar (only shown when repos available) */}
            {!loading && repos.length > 0 && (
                <RepoFilter repos={repos} onFilter={handleFilter} />
            )}

            {/* Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {loading
                    ? [...Array(9)].map((_, i) => <SkeletonRepo key={i} />)
                    : filteredRepos.map((repo) => (
                        <RepoCard key={repo.id} repo={repo} onClick={onRepoClick} />
                    ))
                }
            </div>

            {!loading && filteredRepos.length === 0 && repos.length > 0 && (
                <p className="text-center text-sm text-slate-400 dark:text-slate-500 py-8">
                    No repositories match your filter.
                </p>
            )}
        </section>
    );
};

export default RepoExplorer;
