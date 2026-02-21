/**
 * ComparePage.jsx
 * ────────────────
 * Side-by-side comparison of two GitHub user profiles.
 * Shows: avatar, bio, stats, top languages, most-starred repo.
 */
import { useState } from 'react';
import { FiLoader, FiSearch, FiGithub } from 'react-icons/fi';
import { MdCompare } from 'react-icons/md';
import { PieChart, Pie, Cell, Tooltip as ReTooltip, ResponsiveContainer } from 'recharts';
import { getUserProfile, getUserRepos } from '../services/githubApi';
import { formatNumber, formatDate, getLanguageColor } from '../utils/formatUtils';
import ErrorMessage from '../components/ErrorMessage';

// ── User column ───────────────────────────────────────────────────────────────
const UserColumn = ({ label, data }) => {
    if (!data) return (
        <div className="flex-1 glass-card p-8 flex items-center justify-center text-slate-400 dark:text-slate-600 text-sm">
            {label === 'A' ? 'Enter left user' : 'Enter right user'}
        </div>
    );

    const { profile, repos } = data;

    // Top languages
    const langCounts = {};
    repos.forEach(({ language }) => { if (language) langCounts[language] = (langCounts[language] ?? 0) + 1; });
    const topLangs = Object.entries(langCounts).sort((a, b) => b[1] - a[1]).slice(0, 5)
        .map(([name, value]) => ({ name, value, color: getLanguageColor(name) }));

    const topRepo = [...repos].sort((a, b) => b.stargazers_count - a.stargazers_count)[0];

    const STATS = [
        { label: 'Followers', value: profile.followers },
        { label: 'Following', value: profile.following },
        { label: 'Repos', value: profile.public_repos },
        { label: 'Gists', value: profile.public_gists },
        { label: 'Top ⭐', value: topRepo?.stargazers_count ?? 0 },
        { label: 'Total Repos', value: repos.length },
    ];

    return (
        <div className="flex-1 glass-card p-5 space-y-5 animate-fade-in min-w-0">
            {/* Header */}
            <div className="flex items-center gap-3">
                <img src={profile.avatar_url} alt={profile.login}
                    className="w-16 h-16 rounded-full ring-4 ring-brand-500/20 object-cover shrink-0" />
                <div className="min-w-0">
                    <h3 className="font-bold text-slate-900 dark:text-white truncate">{profile.name ?? profile.login}</h3>
                    <a href={profile.html_url} target="_blank" rel="noreferrer"
                        className="text-sm text-brand-500 hover:underline">@{profile.login}</a>
                    {profile.bio && <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">{profile.bio}</p>}
                </div>
            </div>

            {/* Stats grid */}
            <div className="grid grid-cols-2 gap-2">
                {STATS.map(({ label, value }) => (
                    <div key={label} className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-3 text-center">
                        <p className="text-lg font-bold text-slate-800 dark:text-white">{formatNumber(value)}</p>
                        <p className="text-[10px] text-slate-500 uppercase tracking-wide">{label}</p>
                    </div>
                ))}
            </div>

            {/* Language pie */}
            {topLangs.length > 0 && (
                <div>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Languages</p>
                    <div className="flex items-center gap-3">
                        <PieChart width={80} height={80}>
                            <Pie data={topLangs} cx="50%" cy="50%" outerRadius={38} strokeWidth={0} dataKey="value">
                                {topLangs.map((e, i) => <Cell key={i} fill={e.color} />)}
                            </Pie>
                        </PieChart>
                        <div className="space-y-1 text-xs flex-1 min-w-0">
                            {topLangs.map((l) => (
                                <div key={l.name} className="flex items-center gap-1.5">
                                    <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: l.color }} />
                                    <span className="text-slate-700 dark:text-slate-300 truncate">{l.name}</span>
                                    <span className="ml-auto text-slate-400 shrink-0">{l.value}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Top repo */}
            {topRepo && (
                <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-xl p-3">
                    <p className="text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-widest mb-1">🏆 Top Starred Repo</p>
                    <a href={topRepo.html_url} target="_blank" rel="noreferrer"
                        className="text-sm font-bold text-slate-800 dark:text-white hover:text-brand-500 transition-colors">
                        {topRepo.name}
                    </a>
                    <p className="text-xs text-slate-500 mt-0.5">⭐ {formatNumber(topRepo.stargazers_count)} stars</p>
                </div>
            )}
        </div>
    );
};

// ── ComparePage ───────────────────────────────────────────────────────────────
const ComparePage = () => {
    const [usernameA, setA] = useState('');
    const [usernameB, setB] = useState('');
    const [dataA, setDataA] = useState(null);
    const [dataB, setDataB] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const compare = async () => {
        if (!usernameA.trim() || !usernameB.trim()) return;
        setLoading(true);
        setError(null);
        try {
            const [pA, pB, rARes, rBRes] = await Promise.all([
                getUserProfile(usernameA.trim()),
                getUserProfile(usernameB.trim()),
                getUserRepos(usernameA.trim(), 1, 100, 'stars'),
                getUserRepos(usernameB.trim(), 1, 100, 'stars'),
            ]);
            setDataA({ profile: pA, repos: rARes.repos });
            setDataB({ profile: pB, repos: rBRes.repos });
        } catch (e) {
            setError(e.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            {/* Header */}
            <div className="text-center mb-8">
                <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white flex items-center justify-center gap-3">
                    <MdCompare className="text-brand-500" /> Compare Developers
                </h1>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Side-by-side profile comparison</p>
            </div>

            {/* Input row */}
            <div className="flex flex-col sm:flex-row gap-3 mb-6 max-w-2xl mx-auto">
                <input
                    type="text" value={usernameA} onChange={(e) => setA(e.target.value)}
                    placeholder="First GitHub username"
                    onKeyDown={(e) => e.key === 'Enter' && compare()}
                    className="flex-1 px-4 py-3 rounded-2xl border-2 border-slate-200 dark:border-slate-700
                     bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 outline-none
                     focus:border-brand-500 placeholder-slate-400 text-sm font-medium"
                />
                <span className="hidden sm:flex items-center text-slate-400 font-bold text-lg">vs</span>
                <input
                    type="text" value={usernameB} onChange={(e) => setB(e.target.value)}
                    placeholder="Second GitHub username"
                    onKeyDown={(e) => e.key === 'Enter' && compare()}
                    className="flex-1 px-4 py-3 rounded-2xl border-2 border-slate-200 dark:border-slate-700
                     bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 outline-none
                     focus:border-brand-500 placeholder-slate-400 text-sm font-medium"
                />
                <button onClick={compare} disabled={loading} className="btn-primary w-full sm:w-auto">
                    {loading ? <FiLoader size={16} className="animate-spin" /> : <FiSearch size={16} />}
                    {loading ? 'Comparing…' : 'Compare'}
                </button>
            </div>

            {error && <ErrorMessage message={error} />}

            {/* Columns */}
            <div className="flex flex-col lg:flex-row gap-6 mt-4">
                <UserColumn label="A" data={dataA} />
                <div className="lg:w-10 flex items-center justify-center text-2xl font-black text-slate-300 dark:text-slate-700 shrink-0">
                    vs
                </div>
                <UserColumn label="B" data={dataB} />
            </div>
        </main>
    );
};

export default ComparePage;
