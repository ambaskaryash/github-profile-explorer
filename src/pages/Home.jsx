/**
 * Home.jsx  (v2 – full-featured Explorer page)
 * ──────────────────────────────────────────────
 * Now includes:
 *  - SearchHistory (recent usernames from localStorage)
 *  - ContributionHeatmap (loaded from events API)
 *  - LanguageChart (aggregated from repos)
 *  - DevCard (downloadable profile card)
 *  - RepoDetailPanel (slide-in drawer on repo click)
 *  - Updated ProfileViewer (clickable followers/following)
 *  - URL param support: ?u=username (used by OrgPage member click)
 */
import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { FiGithub } from 'react-icons/fi';
import useGithub from '../hooks/useGithub';
import { getUserEvents } from '../services/githubApi';
import { useAppContext } from '../context/AppContext';
import SearchForm from '../components/SearchForm';
import SearchHistory from '../components/SearchHistory';
import ProfileViewer from '../components/ProfileViewer';
import RepoExplorer from '../components/RepoExplorer';
import Pagination from '../components/Pagination';
import ErrorMessage from '../components/ErrorMessage';
import LanguageChart from '../components/LanguageChart';
import ContributionHeatmap from '../components/ContributionHeatmap';
import DevCard from '../components/DevCard';
import RepoDetailPanel from '../components/RepoDetailPanel';
import SEO from '../components/SEO';

const EmptyState = () => (
    <div className="flex flex-col items-center justify-center gap-4 py-20 text-center animate-fade-in">
        <div className="p-6 rounded-full bg-brand-500/10 text-brand-500">
            <FiGithub size={48} />
        </div>
        <h2 className="text-xl font-bold text-slate-700 dark:text-slate-300">Explore GitHub Profiles</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm">
            Search any GitHub username to view profile stats, repositories, contribution activity, and more.
        </p>
    </div>
);

const Home = ({ darkMode }) => {
    const { addToHistory } = useAppContext();
    const [searchParams] = useSearchParams();

    const {
        username, setUsername,
        profile, repos,
        loading, error,
        page, setPage, totalPages,
        sortBy, setSortBy,
        hasResults,
    } = useGithub();

    // Repo detail panel state
    const [panelRepo, setPanelRepo] = useState(null); // { owner, repoName }

    // Contribution events
    const [events, setEvents] = useState([]);

    // Handle ?u= URL param (from OrgPage member click)
    useEffect(() => {
        const u = searchParams.get('u');
        if (u) setUsername(u);
    }, []);

    // Add to history + fetch events when profile loads
    useEffect(() => {
        if (profile?.login) {
            addToHistory(profile.login);
            getUserEvents(profile.login).then(setEvents).catch(() => setEvents([]));
        } else {
            setEvents([]);
        }
    }, [profile?.login]);

    const handleRepoClick = useCallback((owner, repoName) => {
        setPanelRepo({ owner, repoName });
    }, []);

    const handleSelectUser = useCallback((u) => {
        setUsername(u);
        setPage(1);
    }, []);

    return (
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
            <SEO 
                title={profile?.login ? `${profile.login}'s GitHub Profile` : 'Explorer'} 
                description={profile?.bio || 'Explore GitHub profiles, repositories, and contribution stats.'}
                path={profile?.login ? `/?u=${profile.login}` : '/'}
            />
            {/* Hero */}
            <div className="text-center space-y-2">
                <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                    GitHub{' '}
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-500 to-violet-500">
                        Profile Explorer
                    </span>
                </h1>
                <p className="text-sm text-slate-500 dark:text-slate-400">Search · Discover · Explore</p>
            </div>

            {/* Search */}
            <SearchForm username={username} setUsername={setUsername} loading={loading} />
            <SearchHistory onSelect={(u) => { setUsername(u); setPage(1); }} />

            {/* Error */}
            {error && <ErrorMessage message={error} />}

            {/* Empty state */}
            {!error && !hasResults && !loading && <EmptyState />}

            {/* Content */}
            {(hasResults || loading) && (
                <div className="space-y-6">
                    {/* Profile */}
                    <ProfileViewer profile={profile} loading={loading} onSelectUser={handleSelectUser} />

                    {/* Heatmap + Language + DevCard (side extras) */}
                    {!loading && profile && (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {events.length > 0 && (
                                <ContributionHeatmap events={events} darkMode={darkMode} />
                            )}
                            {repos.length > 0 && <LanguageChart repos={repos} />}
                        </div>
                    )}

                    {/* Dev card */}
                    {!loading && profile && repos.length > 0 && (
                        <DevCard profile={profile} repos={repos} />
                    )}

                    {/* Repos */}
                    <RepoExplorer
                        repos={repos}
                        loading={loading}
                        sortBy={sortBy}
                        setSortBy={(val) => { setSortBy(val); setPage(1); }}
                        onRepoClick={handleRepoClick}
                    />

                    {/* Pagination */}
                    {!loading && (
                        <Pagination
                            page={page}
                            totalPages={totalPages}
                            onPrev={() => setPage((p) => Math.max(1, p - 1))}
                            onNext={() => setPage((p) => Math.min(totalPages, p + 1))}
                        />
                    )}
                </div>
            )}

            {/* Slide-in side panel */}
            {panelRepo && (
                <RepoDetailPanel
                    owner={panelRepo.owner}
                    repoName={panelRepo.repoName}
                    onClose={() => setPanelRepo(null)}
                />
            )}
        </main>
    );
};

export default Home;
