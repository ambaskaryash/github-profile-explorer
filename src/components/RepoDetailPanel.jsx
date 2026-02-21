/**
 * RepoDetailPanel.jsx
 * ────────────────────
 * Slide-in side panel that appears when the user clicks a repository card.
 *
 * Displays:
 *  - Repo name, description, topics/tags
 *  - Stats: stars, forks, issues, watchers, license
 *  - Contributors list (top 10 with avatars)
 *  - Language chart (Recharts)
 *  - Clone URL (one-click copy)
 *  - README preview (rendered Markdown)
 *  - Star growth chart (Recharts area chart)
 *  - Link to GitHub
 */
import { useEffect, useState, useCallback } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import {
    FiX, FiStar, FiGitBranch, FiAlertCircle, FiEye, FiCopy, FiCheck,
    FiExternalLink, FiGithub, FiCode,
} from 'react-icons/fi';
import {
    PieChart, Pie, Cell, Tooltip as ReTooltip, AreaChart, Area,
    XAxis, YAxis, ResponsiveContainer, CartesianGrid,
} from 'recharts';
import {
    getRepoReadme, getRepoContributors, getRepoLanguages,
    getRepoTopics, getRepoStargazers, getRepoDetails,
} from '../services/githubApi';
import { formatNumber, formatDate, getLanguageColor } from '../utils/formatUtils';

// ─── helpers ──────────────────────────────────────────────────────────────────

const buildStarHistory = (timestamps) => {
    if (!timestamps?.length) return [];
    const counts = {};
    timestamps.forEach((ts) => {
        const month = ts?.slice(0, 7) ?? '';
        if (month) counts[month] = (counts[month] ?? 0) + 1;
    });
    let cumulative = 0;
    return Object.entries(counts)
        .sort()
        .map(([month, n]) => { cumulative += n; return { month, stars: cumulative }; });
};

// ─── tiny sub-components ──────────────────────────────────────────────────────

const CopyButton = ({ text }) => {
    const [copied, setCopied] = useState(false);
    const copy = () => {
        navigator.clipboard.writeText(text).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        });
    };
    return (
        <button onClick={copy} title="Copy clone URL"
            className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-700 hover:bg-brand-100 dark:hover:bg-brand-900/30
                 text-slate-500 hover:text-brand-500 transition-colors">
            {copied ? <FiCheck size={14} className="text-emerald-500" /> : <FiCopy size={14} />}
        </button>
    );
};

const Tag = ({ label }) => (
    <span className="px-2.5 py-0.5 rounded-full bg-brand-50 dark:bg-brand-900/30 text-brand-600 dark:text-brand-400
                   text-xs font-medium border border-brand-200 dark:border-brand-700">
        {label}
    </span>
);

// ─── Main Panel ───────────────────────────────────────────────────────────────

const RepoDetailPanel = ({ owner, repoName, onClose }) => {
    const [repo, setRepo] = useState(null);
    const [readme, setReadme] = useState(null);
    const [contributors, setContribs] = useState([]);
    const [languages, setLanguages] = useState({});
    const [topics, setTopics] = useState([]);
    const [starHistory, setStarHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [readmeLoading, setRLoading] = useState(true);

    const fetchAll = useCallback(async () => {
        if (!owner || !repoName) return;
        setLoading(true);
        setRLoading(true);

        try {
            const [repoData, contribData, langData, topicsData] = await Promise.all([
                getRepoDetails(owner, repoName),
                getRepoContributors(owner, repoName),
                getRepoLanguages(owner, repoName),
                getRepoTopics(owner, repoName),
            ]);
            setRepo(repoData);
            setContribs(contribData);
            setLanguages(langData);
            setTopics(topicsData);

            // Load README separately (may be large)
            getRepoReadme(owner, repoName).then((md) => {
                setReadme(md);
                setRLoading(false);
            });

            // Load star history separately (multiple API calls)
            getRepoStargazers(owner, repoName, 4).then((ts) => {
                setStarHistory(buildStarHistory(ts));
            });
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, [owner, repoName]);

    useEffect(() => { fetchAll(); }, [fetchAll]);

    // Prevent body scroll when panel is open
    useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => { document.body.style.overflow = ''; };
    }, []);

    // Language pie data
    const totalBytes = Object.values(languages).reduce((a, b) => a + b, 0);
    const langData = Object.entries(languages).map(([name, bytes]) => ({
        name, value: Math.round((bytes / totalBytes) * 100),
        color: getLanguageColor(name),
    }));

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 animate-fade-in"
                onClick={onClose}
            />

            {/* Drawer */}
            <aside
                className="fixed top-0 right-0 h-full w-full max-w-2xl z-50 flex flex-col
                   bg-white dark:bg-slate-900 shadow-2xl
                   animate-[slideInRight_0.3s_ease-out]"
                style={{ animation: 'slideInRight 0.3s ease-out' }}
            >
                {/* Header */}
                <div className="flex items-start justify-between gap-4 p-5 border-b border-slate-200 dark:border-slate-700 shrink-0">
                    <div className="min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                            <FiCode className="text-brand-500 shrink-0" size={16} />
                            <span className="text-xs text-slate-500 dark:text-slate-400">{owner}</span>
                            <span className="text-slate-300 dark:text-slate-600">/</span>
                            <h2 className="text-base font-bold text-slate-900 dark:text-white truncate">{repoName}</h2>
                        </div>
                        {repo?.description && (
                            <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">{repo.description}</p>
                        )}
                    </div>
                    <button onClick={onClose} aria-label="Close panel"
                        className="shrink-0 p-2 rounded-xl border border-slate-200 dark:border-slate-700
                       text-slate-500 hover:text-slate-800 dark:hover:text-white
                       hover:bg-slate-100 dark:hover:bg-slate-800 transition-all">
                        <FiX size={18} />
                    </button>
                </div>

                {/* Scrollable body */}
                <div className="flex-1 overflow-y-auto p-5 space-y-6">
                    {loading ? (
                        <div className="space-y-4">
                            {[...Array(6)].map((_, i) => <div key={i} className={`skeleton h-${i % 2 === 0 ? 6 : 4} rounded-lg`} />)}
                        </div>
                    ) : (
                        <>
                            {/* Stats row */}
                            {repo && (
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                    {[
                                        { icon: FiStar, val: formatNumber(repo.stargazers_count), label: 'Stars', color: 'text-amber-500' },
                                        { icon: FiGitBranch, val: formatNumber(repo.forks_count), label: 'Forks', color: 'text-violet-500' },
                                        { icon: FiAlertCircle, val: formatNumber(repo.open_issues_count), label: 'Issues', color: 'text-rose-500' },
                                        { icon: FiEye, val: formatNumber(repo.watchers_count), label: 'Watchers', color: 'text-brand-500' },
                                    ].map(({ icon: Icon, val, label, color }) => (
                                        <div key={label} className="glass-card p-3 flex flex-col items-center gap-1 text-center">
                                            <Icon className={color} size={18} />
                                            <span className="text-lg font-bold text-slate-800 dark:text-white">{val}</span>
                                            <span className="text-xs text-slate-500 dark:text-slate-400">{label}</span>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Topics */}
                            {topics.length > 0 && (
                                <div>
                                    <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-2">Topics</h3>
                                    <div className="flex flex-wrap gap-2">
                                        {topics.map((t) => <Tag key={t} label={t} />)}
                                    </div>
                                </div>
                            )}

                            {/* License + dates */}
                            {repo && (
                                <div className="glass-card p-4 grid grid-cols-2 gap-3 text-xs">
                                    <div>
                                        <p className="text-slate-400 dark:text-slate-500 mb-0.5">License</p>
                                        <p className="font-semibold text-slate-700 dark:text-slate-300">{repo.license?.name ?? 'None'}</p>
                                    </div>
                                    <div>
                                        <p className="text-slate-400 dark:text-slate-500 mb-0.5">Default Branch</p>
                                        <p className="font-semibold text-slate-700 dark:text-slate-300">{repo.default_branch}</p>
                                    </div>
                                    <div>
                                        <p className="text-slate-400 dark:text-slate-500 mb-0.5">Created</p>
                                        <p className="font-semibold text-slate-700 dark:text-slate-300">{formatDate(repo.created_at)}</p>
                                    </div>
                                    <div>
                                        <p className="text-slate-400 dark:text-slate-500 mb-0.5">Updated</p>
                                        <p className="font-semibold text-slate-700 dark:text-slate-300">{formatDate(repo.updated_at)}</p>
                                    </div>
                                </div>
                            )}

                            {/* Clone URL */}
                            {repo && (
                                <div>
                                    <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-2">Clone</h3>
                                    <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                                        <code className="flex-1 text-xs text-slate-600 dark:text-slate-300 truncate">
                                            {repo.clone_url}
                                        </code>
                                        <CopyButton text={repo.clone_url} />
                                    </div>
                                </div>
                            )}

                            {/* Language pie chart */}
                            {langData.length > 0 && (
                                <div>
                                    <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-3">Languages</h3>
                                    <div className="flex items-center gap-4">
                                        <PieChart width={120} height={120}>
                                            <Pie data={langData} dataKey="value" cx="50%" cy="50%" outerRadius={55} strokeWidth={0}>
                                                {langData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                                            </Pie>
                                            <ReTooltip formatter={(v, n) => [`${v}%`, n]} />
                                        </PieChart>
                                        <div className="flex flex-col gap-1.5 flex-1 min-w-0">
                                            {langData.map((l) => (
                                                <div key={l.name} className="flex items-center gap-2 text-xs">
                                                    <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: l.color }} />
                                                    <span className="text-slate-700 dark:text-slate-300 truncate">{l.name}</span>
                                                    <span className="ml-auto text-slate-500 font-medium">{l.value}%</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Star history chart */}
                            {starHistory.length > 1 && (
                                <div>
                                    <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-3">Star Growth</h3>
                                    <ResponsiveContainer width="100%" height={140}>
                                        <AreaChart data={starHistory} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                                            <defs>
                                                <linearGradient id="starGrad" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                                                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0.02} />
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" strokeOpacity={0.3} />
                                            <XAxis dataKey="month" tick={{ fontSize: 9 }} tickLine={false} />
                                            <YAxis tick={{ fontSize: 9 }} tickLine={false} tickFormatter={formatNumber} />
                                            <ReTooltip formatter={(v) => [formatNumber(v), 'Total Stars']} />
                                            <Area type="monotone" dataKey="stars" stroke="#6366f1" fill="url(#starGrad)" strokeWidth={2} dot={false} />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </div>
                            )}

                            {/* Contributors */}
                            {contributors.length > 0 && (
                                <div>
                                    <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-3">
                                        Top Contributors
                                    </h3>
                                    <div className="flex flex-col gap-2">
                                        {contributors.slice(0, 8).map((c, i) => (
                                            <a key={c.login} href={c.html_url} target="_blank" rel="noreferrer"
                                                className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800
                                    transition-colors group">
                                                <span className="text-xs font-bold text-slate-400 w-4 text-right shrink-0">#{i + 1}</span>
                                                <img src={c.avatar_url} alt={c.login}
                                                    className="w-7 h-7 rounded-full object-cover ring-2 ring-brand-500/20" />
                                                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 group-hover:text-brand-500 transition-colors flex-1 truncate">
                                                    {c.login}
                                                </span>
                                                <span className="text-xs text-slate-400 dark:text-slate-500 shrink-0">
                                                    {formatNumber(c.contributions)} commits
                                                </span>
                                            </a>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* README */}
                            <div>
                                <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-3">README</h3>
                                {readmeLoading ? (
                                    <div className="space-y-2">
                                        {[...Array(8)].map((_, i) => (
                                            <div key={i} className="skeleton h-3 rounded" style={{ width: `${60 + (i % 4) * 10}%` }} />
                                        ))}
                                    </div>
                                ) : readme ? (
                                    <div className="readme-body rounded-2xl border border-slate-200 dark:border-slate-700
                                                    bg-white dark:bg-slate-900 p-5 overflow-hidden">
                                        <div className="prose prose-slate dark:prose-invert max-w-none
                                            prose-headings:font-bold prose-headings:tracking-tight
                                            prose-h1:text-xl prose-h1:border-b prose-h1:border-slate-200 dark:prose-h1:border-slate-700 prose-h1:pb-2 prose-h1:mb-4
                                            prose-h2:text-lg prose-h2:border-b prose-h2:border-slate-100 dark:prose-h2:border-slate-800 prose-h2:pb-1.5 prose-h2:mb-3
                                            prose-h3:text-base
                                            prose-p:text-slate-700 dark:prose-p:text-slate-300 prose-p:leading-relaxed
                                            prose-a:text-brand-500 prose-a:no-underline hover:prose-a:underline prose-a:font-medium
                                            prose-strong:text-slate-800 dark:prose-strong:text-white prose-strong:font-semibold
                                            prose-code:text-brand-600 dark:prose-code:text-brand-400
                                            prose-code:bg-slate-100 dark:prose-code:bg-slate-800
                                            prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded-md prose-code:text-[0.82em]
                                            prose-code:before:content-none prose-code:after:content-none
                                            prose-pre:bg-slate-950 dark:prose-pre:bg-slate-950
                                            prose-pre:border prose-pre:border-slate-800
                                            prose-pre:rounded-xl prose-pre:overflow-x-auto
                                            prose-pre:shadow-inner
                                            prose-pre:code:bg-transparent prose-pre:code:p-0 prose-pre:code:text-slate-200
                                            prose-blockquote:border-l-4 prose-blockquote:border-brand-400
                                            prose-blockquote:bg-brand-50 dark:prose-blockquote:bg-brand-900/20
                                            prose-blockquote:rounded-r-xl prose-blockquote:py-1 prose-blockquote:px-4
                                            prose-blockquote:text-slate-600 dark:prose-blockquote:text-slate-400
                                            prose-blockquote:not-italic
                                            prose-table:w-full prose-table:text-sm
                                            prose-th:bg-slate-50 dark:prose-th:bg-slate-800
                                            prose-th:px-3 prose-th:py-2 prose-th:text-left prose-th:font-semibold
                                            prose-td:px-3 prose-td:py-2 prose-td:border-b prose-td:border-slate-100 dark:prose-td:border-slate-800
                                            prose-img:rounded-xl prose-img:mx-auto prose-img:shadow-md prose-img:max-w-full
                                            prose-hr:border-slate-200 dark:prose-hr:border-slate-700
                                            prose-li:text-slate-700 dark:prose-li:text-slate-300
                                            prose-ul:list-disc prose-ol:list-decimal">
                                            <ReactMarkdown
                                                remarkPlugins={[remarkGfm]}
                                                rehypePlugins={[rehypeRaw]}
                                            >
                                                {readme}
                                            </ReactMarkdown>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center gap-3 py-8 text-center rounded-2xl border border-dashed border-slate-200 dark:border-slate-700">
                                        <span className="text-3xl">📄</span>
                                        <p className="text-sm text-slate-400 dark:text-slate-500 italic">No README found for this repository.</p>
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                </div>

                {/* Footer */}
                {repo && (
                    <div className="border-t border-slate-200 dark:border-slate-700 p-4 shrink-0">
                        <a href={repo.html_url} target="_blank" rel="noreferrer" className="btn-primary w-full justify-center">
                            <FiGithub size={16} /> Open on GitHub <FiExternalLink size={14} />
                        </a>
                    </div>
                )}
            </aside>
        </>
    );
};

export default RepoDetailPanel;
