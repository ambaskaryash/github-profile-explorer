/**
 * ProfileViewer.jsx  (v2)
 * ────────────────────────
 * Now includes:
 *  - Clickable Followers / Following stat cards that open UserListModal
 *  - Passes onSelectUser to switch profile from the modal
 */
import { useState } from 'react';
import { FiMapPin, FiLink, FiGithub, FiBook, FiStar } from 'react-icons/fi';
import { HiOfficeBuilding } from 'react-icons/hi';
import { MdOutlinePeopleAlt, MdPeopleOutline } from 'react-icons/md';
import StatCard from './StatCard';
import UserListModal from './UserListModal';
import { formatNumber } from '../utils/formatUtils';

// ── Skeleton ───────────────────────────────────────────────────────────────────
const SkeletonProfile = () => (
    <div className="glass-card p-6 animate-fade-in">
        <div className="flex flex-col sm:flex-row gap-5 items-center sm:items-start">
            <div className="skeleton w-24 h-24 rounded-full shrink-0" />
            <div className="flex-1 space-y-3 w-full">
                <div className="skeleton h-5 w-40 rounded" />
                <div className="skeleton h-4 w-28 rounded" />
                <div className="skeleton h-3 w-full rounded" />
                <div className="skeleton h-3 w-3/4 rounded" />
            </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6">
            {[...Array(4)].map((_, i) => <div key={i} className="skeleton h-20 rounded-xl" />)}
        </div>
    </div>
);

// ── Clickable stat card wrapper ────────────────────────────────────────────────
const ClickableStatCard = ({ onClick, children, title }) => (
    <button
        onClick={onClick}
        title={title}
        className="text-left hover:scale-105 hover:shadow-xl transition-all duration-200 focus:outline-none
               focus:ring-2 focus:ring-brand-500/50 rounded-2xl"
    >
        {children}
    </button>
);

// ── Main ───────────────────────────────────────────────────────────────────────
const ProfileViewer = ({ profile, loading, onSelectUser }) => {
    const [modal, setModal] = useState(null); // null | 'followers' | 'following'

    if (loading) return <SkeletonProfile />;
    if (!profile) return null;

    const {
        avatar_url, name, login, bio, location, company, blog,
        followers, following, public_repos, public_gists, html_url,
    } = profile;

    return (
        <>
            <article className="glass-card p-6 animate-slide-up" aria-label={`GitHub profile of ${login}`}>
                {/* Header */}
                <div className="flex flex-col sm:flex-row gap-5 items-center sm:items-start">
                    <img
                        src={avatar_url}
                        alt={`${login} avatar`}
                        className="w-24 h-24 rounded-full ring-4 ring-brand-500/30 shadow-lg object-cover shrink-0"
                        loading="lazy"
                    />
                    <div className="flex-1 text-center sm:text-left">
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white leading-tight">
                            {name ?? login}
                        </h2>
                        <a href={html_url} target="_blank" rel="noreferrer"
                            className="text-sm text-brand-500 hover:underline font-medium">
                            @{login}
                        </a>
                        {bio && (
                            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400 leading-relaxed line-clamp-3">{bio}</p>
                        )}
                        <div className="mt-3 flex flex-wrap justify-center sm:justify-start gap-x-4 gap-y-1.5">
                            {location && (
                                <span className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                                    <FiMapPin size={12} /> {location}
                                </span>
                            )}
                            {company && (
                                <span className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                                    <HiOfficeBuilding size={12} /> {company.replace(/^@/, '')}
                                </span>
                            )}
                            {blog && (
                                <a href={blog.startsWith('http') ? blog : `https://${blog}`}
                                    target="_blank" rel="noreferrer"
                                    className="flex items-center gap-1 text-xs text-brand-500 hover:underline">
                                    <FiLink size={12} /> {blog}
                                </a>
                            )}
                        </div>
                    </div>

                    <a href={html_url} target="_blank" rel="noreferrer"
                        className="btn-primary text-sm shrink-0" aria-label={`Open ${login}'s GitHub profile`}>
                        <FiGithub size={16} /> GitHub
                    </a>
                </div>

                {/* Stat cards */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6">
                    {/* Followers – clickable */}
                    <ClickableStatCard onClick={() => setModal('followers')} title="View followers">
                        <StatCard icon={MdOutlinePeopleAlt} value={formatNumber(followers)} label="Followers" />
                    </ClickableStatCard>

                    {/* Following – clickable */}
                    <ClickableStatCard onClick={() => setModal('following')} title="View following">
                        <StatCard icon={MdPeopleOutline} value={formatNumber(following)} label="Following" color="text-emerald-500" />
                    </ClickableStatCard>

                    <StatCard icon={FiBook} value={formatNumber(public_repos)} label="Repos" color="text-violet-500" />
                    <StatCard icon={FiStar} value={formatNumber(public_gists)} label="Gists" color="text-amber-500" />
                </div>

                <p className="text-[10px] text-center text-slate-400 dark:text-slate-600 mt-3">
                    💡 Click Followers / Following to browse the list
                </p>
            </article>

            {/* Modal */}
            {modal && (
                <UserListModal
                    username={login}
                    type={modal}
                    onClose={() => setModal(null)}
                    onSelectUser={(u) => { onSelectUser?.(u); setModal(null); }}
                />
            )}
        </>
    );
};

export default ProfileViewer;
