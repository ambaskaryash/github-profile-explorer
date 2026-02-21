/**
 * RepoFilter.jsx
 * ──────────────
 * Client-side filter bar: search by repo name + filter by language.
 * Props: repos (all fetched repos), onFilter (callback with filtered array)
 */
import { useState, useEffect, useMemo } from 'react';
import { FiSearch, FiFilter } from 'react-icons/fi';

const RepoFilter = ({ repos, onFilter }) => {
    const [query, setQuery] = useState('');
    const [language, setLanguage] = useState('');

    // Build unique language list from repos
    const languages = useMemo(() => {
        const set = new Set(repos.map((r) => r.language).filter(Boolean));
        return ['', ...Array.from(set).sort()];
    }, [repos]);

    useEffect(() => {
        const q = query.toLowerCase().trim();
        const filtered = repos.filter((r) => {
            const matchName = !q || r.name.toLowerCase().includes(q) || r.description?.toLowerCase().includes(q);
            const matchLang = !language || r.language === language;
            return matchName && matchLang;
        });
        onFilter(filtered);
    }, [query, language, repos, onFilter]);

    return (
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
            {/* Name search */}
            <div className="relative flex-1">
                <FiSearch size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Filter repositories…"
                    className="w-full pl-9 pr-4 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700
                     bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200
                     placeholder-slate-400 dark:placeholder-slate-500
                     outline-none focus:border-brand-500 transition-colors"
                />
            </div>

            {/* Language filter */}
            <div className="relative">
                <FiFilter size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="pl-8 pr-4 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700
                     bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300
                     outline-none focus:border-brand-500 cursor-pointer transition-colors"
                >
                    <option value="">All Languages</option>
                    {languages.slice(1).map((l) => (
                        <option key={l} value={l}>{l}</option>
                    ))}
                </select>
            </div>
        </div>
    );
};

export default RepoFilter;
