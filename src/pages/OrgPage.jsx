/**
 * OrgPage.jsx
 * ────────────
 * Explore a GitHub Organization: org details, members (paginated), and top repos.
 */
import { useState } from 'react';
import { FiSearch, FiLoader, FiUsers, FiBook } from 'react-icons/fi';
import { MdCorporateFare } from 'react-icons/md';
import { getOrgDetails, getOrgMembers, getOrgRepos } from '../services/githubApi';
import { formatNumber, formatDate } from '../utils/formatUtils';
import ErrorMessage from '../components/ErrorMessage';
import StatCard from '../components/StatCard';
import { useNavigate } from 'react-router-dom';

const OrgPage = () => {
    const [orgName, setOrgName] = useState('');
    const [org, setOrg] = useState(null);
    const [members, setMembers] = useState([]);
    const [repos, setRepos] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(false);
    const navigate = useNavigate();

    const load = async (orgInput, pg = 1) => {
        const name = orgInput.trim();
        if (!name) return;
        setLoading(true);
        setError(null);
        if (pg === 1) { setMembers([]); setRepos([]); setOrg(null); }
        try {
            const [orgData, memberData, repoData] = await Promise.all([
                pg === 1 ? getOrgDetails(name) : Promise.resolve(org),
                getOrgMembers(name, pg),
                pg === 1 ? getOrgRepos(name) : Promise.resolve(repos),
            ]);
            setOrg(orgData);
            setMembers((prev) => pg === 1 ? memberData : [...prev, ...memberData]);
            if (pg === 1) setRepos(repoData);
            setHasMore(memberData.length === 30);
        } catch (e) {
            setError(e.message);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = () => { setPage(1); load(orgName, 1); };
    const loadMore = () => { const next = page + 1; setPage(next); load(orgName, next); };

    return (
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            {/* Header */}
            <div className="text-center mb-8">
                <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white flex items-center justify-center gap-3">
                    <MdCorporateFare className="text-brand-500" /> Organization Explorer
                </h1>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Browse GitHub organizations, members, and their top repos</p>
            </div>

            {/* Search */}
            <div className="flex gap-3 max-w-lg mx-auto mb-8">
                <div className="relative flex-1">
                    <MdCorporateFare size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    <input
                        type="text" value={orgName} onChange={(e) => setOrgName(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                        placeholder="e.g. facebook, google, microsoft"
                        className="w-full pl-10 pr-4 py-3 rounded-2xl border-2 border-slate-200 dark:border-slate-700
                       bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 outline-none
                       focus:border-brand-500 text-sm font-medium placeholder-slate-400"
                    />
                </div>
                <button onClick={handleSubmit} disabled={loading} className="btn-primary">
                    {loading && page === 1 ? <FiLoader size={16} className="animate-spin" /> : <FiSearch size={16} />}
                    Search
                </button>
            </div>

            {error && <ErrorMessage message={error} />}

            {org && (
                <div className="space-y-8 animate-fade-in">
                    {/* Org header */}
                    <div className="glass-card p-6 flex flex-col sm:flex-row gap-5 items-center sm:items-start">
                        <img src={org.avatar_url} alt={org.login}
                            className="w-20 h-20 rounded-2xl ring-4 ring-brand-500/20 object-cover shrink-0" />
                        <div className="flex-1 text-center sm:text-left">
                            <h2 className="text-xl font-bold text-slate-900 dark:text-white">{org.name ?? org.login}</h2>
                            <a href={org.html_url} target="_blank" rel="noreferrer" className="text-sm text-brand-500 hover:underline">
                                @{org.login}
                            </a>
                            {org.description && <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">{org.description}</p>}
                            {org.location && <p className="text-xs text-slate-500 mt-1">📍 {org.location}</p>}
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 w-full sm:w-auto">
                            <StatCard icon={FiUsers} value={formatNumber(org.followers ?? 0)} label="Followers" />
                            <StatCard icon={FiBook} value={formatNumber(org.public_repos ?? 0)} label="Repos" color="text-violet-500" />
                            {org.public_gists > 0 && (
                                <StatCard icon={MdCorporateFare} value={formatNumber(org.public_gists)} label="Gists" color="text-amber-500" />
                            )}
                        </div>
                    </div>

                    {/* Top repos */}
                    {repos.length > 0 && (
                        <div>
                            <h3 className="text-base font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                                <FiBook className="text-brand-500" size={16} /> Top Repositories
                            </h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                                {repos.map((r) => (
                                    <a key={r.id} href={r.html_url} target="_blank" rel="noreferrer"
                                        className="glass-card p-4 hover:shadow-xl hover:-translate-y-1 transition-all duration-200 group">
                                        <p className="text-sm font-bold text-brand-500 group-hover:underline">{r.name}</p>
                                        {r.description && <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">{r.description}</p>}
                                        <div className="flex gap-3 mt-3 text-xs text-slate-500">
                                            <span>⭐ {formatNumber(r.stargazers_count)}</span>
                                            <span>🍴 {formatNumber(r.forks_count)}</span>
                                            <span className="ml-auto">{formatDate(r.updated_at)}</span>
                                        </div>
                                    </a>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Members */}
                    <div>
                        <h3 className="text-base font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                            <FiUsers className="text-brand-500" size={16} /> Members ({members.length}{hasMore ? '+' : ''})
                        </h3>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                            {members.map((m) => (
                                <button
                                    key={m.login}
                                    onClick={() => navigate(`/?u=${m.login}`)}
                                    title={`View ${m.login}'s profile`}
                                    className="glass-card p-3 flex flex-col items-center gap-2 hover:shadow-lg hover:-translate-y-1
                             transition-all duration-200 group text-center"
                                >
                                    <img src={m.avatar_url} alt={m.login}
                                        className="w-12 h-12 rounded-full object-cover ring-2 ring-brand-500/20 group-hover:ring-brand-500/50 transition-all" />
                                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 group-hover:text-brand-500
                                   transition-colors truncate w-full text-center">
                                        {m.login}
                                    </span>
                                </button>
                            ))}
                        </div>
                        {hasMore && (
                            <div className="text-center mt-4">
                                <button onClick={loadMore} disabled={loading}
                                    className="btn-primary text-sm">
                                    {loading ? <FiLoader size={14} className="animate-spin" /> : null}
                                    Load more members
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </main>
    );
};

export default OrgPage;
