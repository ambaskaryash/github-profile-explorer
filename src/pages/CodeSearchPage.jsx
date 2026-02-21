/**
 * CodeSearchPage.jsx
 * ────────────────────
 * Search code within a specific user's repositories using the GitHub Code Search API.
 * Displays matched file snippets with syntax-highlighted fragments.
 */
import { useState } from 'react';
import { FiSearch, FiCode, FiLoader, FiExternalLink } from 'react-icons/fi';
import { searchCode } from '../services/githubApi';
import ErrorMessage from '../components/ErrorMessage';

const ResultCard = ({ item }) => {
    const [expanded, setExpanded] = useState(false);
    const fragments = item.text_matches ?? [];

    return (
        <div className="glass-card p-4 space-y-3 animate-fade-in group">
            {/* Header */}
            <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                    <a href={item.html_url} target="_blank" rel="noreferrer"
                        className="text-sm font-bold text-brand-500 hover:underline break-all leading-tight">
                        {item.path}
                    </a>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{item.repository?.full_name}</p>
                </div>
                <a href={item.html_url} target="_blank" rel="noreferrer" aria-label="Open on GitHub"
                    className="shrink-0 text-slate-400 hover:text-brand-500 transition-colors mt-0.5">
                    <FiExternalLink size={15} />
                </a>
            </div>

            {/* Toggle fragments */}
            {fragments.length > 0 && (
                <>
                    <button onClick={() => setExpanded((v) => !v)}
                        className="text-xs text-brand-500 hover:underline font-medium">
                        {expanded ? 'Hide' : 'Show'} code fragments ({fragments.length})
                    </button>
                    {expanded && (
                        <div className="space-y-2">
                            {fragments.map((f, i) => (
                                <pre key={i}
                                    className="bg-slate-50 dark:bg-slate-800 rounded-xl p-3 text-xs text-slate-700 dark:text-slate-300
                             overflow-x-auto leading-relaxed font-mono whitespace-pre-wrap">
                                    {f.fragment}
                                </pre>
                            ))}
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

const CodeSearchPage = () => {
    const [username, setUsername] = useState('');
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [searched, setSearched] = useState(false);

    const search = async () => {
        if (!query.trim()) return;
        setLoading(true);
        setError(null);
        setSearched(true);
        try {
            const data = await searchCode(query.trim(), username.trim() || undefined);
            setResults(data);
        } catch (e) {
            setError(e.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            {/* Header */}
            <div className="text-center mb-8">
                <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white flex items-center justify-center gap-3">
                    <FiCode className="text-brand-500" /> Code Search
                </h1>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Search code across GitHub or within a specific user's repos</p>
            </div>

            {/* Search bar */}
            <div className="glass-card p-4 mb-6 flex flex-col sm:flex-row gap-3">
                <input
                    type="text" value={username} onChange={(e) => setUsername(e.target.value)}
                    placeholder="Limit to username (optional)"
                    className="w-40 shrink-0 px-4 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-700
                     bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 outline-none focus:border-brand-500"
                />
                <div className="relative flex-1">
                    <FiSearch size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    <input
                        type="text" value={query} onChange={(e) => setQuery(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && search()}
                        placeholder='Search code e.g. "useState useCallback"'
                        className="w-full pl-9 pr-4 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-700
                       bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 outline-none focus:border-brand-500"
                    />
                </div>
                <button onClick={search} disabled={loading} className="btn-primary text-sm shrink-0">
                    {loading ? <FiLoader size={15} className="animate-spin" /> : <FiSearch size={15} />}
                    Search
                </button>
            </div>

            {error && <ErrorMessage message={error} />}

            {/* Results */}
            {!loading && searched && results.length === 0 && !error && (
                <p className="text-center text-sm text-slate-400 dark:text-slate-500 py-8">No results found.</p>
            )}

            <div className="space-y-3">
                {loading
                    ? [...Array(5)].map((_, i) => <div key={i} className="skeleton h-16 rounded-2xl" />)
                    : results.map((item) => <ResultCard key={item.sha} item={item} />)
                }
            </div>

            {!loading && results.length > 0 && (
                <p className="text-center text-xs text-slate-400 dark:text-slate-500 mt-4">
                    Showing {results.length} results · GitHub Code Search is rate-limited without a token
                </p>
            )}
        </main>
    );
};

export default CodeSearchPage;
