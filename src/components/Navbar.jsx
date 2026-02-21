/**
 * Navbar.jsx  (v2)
 * ────────────────
 * Now includes:
 *  - Tab navigation (Explorer | Compare | Trending | Org | Code Search)
 *  - Runtime GitHub token input (Settings popover)
 *  - Dark mode toggle
 */
import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { FiGithub, FiSun, FiMoon, FiSettings, FiX, FiCheck } from 'react-icons/fi';
import { HiSparkles } from 'react-icons/hi2';
import { MdCompare, MdTrendingUp, MdCode, MdCorporateFare } from 'react-icons/md';
import { useAppContext } from '../context/AppContext';

const NAV_TABS = [
    { to: '/', label: 'Explorer', icon: FiGithub },
    { to: '/compare', label: 'Compare', icon: MdCompare },
    { to: '/trending', label: 'Trending', icon: MdTrendingUp },
    { to: '/org', label: 'Org', icon: MdCorporateFare },
    { to: '/codesearch', label: 'Code', icon: MdCode },
];

const Navbar = ({ darkMode, toggleDark }) => {
    const { token, setToken } = useAppContext();
    const [showSettings, setShowSettings] = useState(false);
    const [inputToken, setInputToken] = useState(token ?? '');

    const handleSave = () => {
        setToken(inputToken.trim());
        setShowSettings(false);
    };

    return (
        <header className="sticky top-0 z-50 w-full border-b border-slate-200/60 dark:border-slate-700/60
                       bg-white/70 dark:bg-slate-900/70 backdrop-blur-md shadow-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Top bar */}
                <div className="h-14 flex items-center justify-between">
                    {/* Brand */}
                    <NavLink to="/" className="flex items-center gap-2 group shrink-0">
                        <div className="p-1.5 rounded-xl bg-brand-500 shadow-md shadow-brand-500/30 group-hover:scale-110 transition-transform">
                            <FiGithub className="text-white" size={18} />
                        </div>
                        <span className="text-base font-bold tracking-tight text-slate-800 dark:text-white hidden sm:block">
                            Git<span className="text-brand-500">Explorer</span>
                        </span>
                        <HiSparkles className="text-brand-400 animate-pulse hidden sm:block" size={13} />
                    </NavLink>

                    {/* Tabs – desktop */}
                    <nav className="hidden md:flex items-center gap-1">
                        {NAV_TABS.map(({ to, label, icon: Icon }) => (
                            <NavLink
                                key={to}
                                to={to}
                                end={to === '/'}
                                className={({ isActive }) =>
                                    `flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150 ${isActive
                                        ? 'bg-brand-500 text-white shadow-md shadow-brand-500/30'
                                        : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                                    }`
                                }
                            >
                                <Icon size={13} /> {label}
                            </NavLink>
                        ))}
                    </nav>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                        {/* Token settings */}
                        <div className="relative">
                            <button
                                onClick={() => setShowSettings((v) => !v)}
                                aria-label="API token settings"
                                title="Set GitHub Token"
                                className={`p-2 rounded-xl border transition-all duration-200 hover:scale-110 active:scale-95 shadow-sm
                  ${token
                                        ? 'border-emerald-300 dark:border-emerald-600 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400'
                                        : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                                    }`}
                            >
                                <FiSettings size={16} />
                            </button>

                            {showSettings && (
                                <div className="absolute right-0 top-full mt-2 w-80 glass-card p-4 z-50 animate-fade-in">
                                    <div className="flex items-center justify-between mb-3">
                                        <h3 className="text-sm font-bold text-slate-800 dark:text-white">GitHub API Token</h3>
                                        <button onClick={() => setShowSettings(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
                                            <FiX size={15} />
                                        </button>
                                    </div>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
                                        Raises rate limit from 60 → 5,000 req/hr.{' '}
                                        <a href="https://github.com/settings/tokens" target="_blank" rel="noreferrer"
                                            className="text-brand-500 hover:underline">Generate token ↗</a>
                                    </p>
                                    <input
                                        type="password"
                                        value={inputToken}
                                        onChange={(e) => setInputToken(e.target.value)}
                                        placeholder="ghp_xxxxxxxxxxxxx"
                                        className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700
                               bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200
                               outline-none focus:border-brand-500 mb-3"
                                    />
                                    <button onClick={handleSave} className="btn-primary w-full justify-center text-xs">
                                        <FiCheck size={13} /> Save & Reload
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Dark mode */}
                        <button
                            onClick={toggleDark}
                            aria-label="Toggle dark mode"
                            className="p-2 rounded-xl border border-slate-200 dark:border-slate-700
                         bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300
                         hover:bg-slate-100 dark:hover:bg-slate-700 transition-all duration-200
                         hover:scale-110 active:scale-95 shadow-sm"
                        >
                            {darkMode ? <FiSun size={16} /> : <FiMoon size={16} />}
                        </button>
                    </div>
                </div>

                {/* Mobile tab strip */}
                <nav className="md:hidden flex items-center gap-1 pb-2 overflow-x-auto scrollbar-hide">
                    {NAV_TABS.map(({ to, label, icon: Icon }) => (
                        <NavLink
                            key={to}
                            to={to}
                            end={to === '/'}
                            className={({ isActive }) =>
                                `flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${isActive
                                    ? 'bg-brand-500 text-white'
                                    : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                                }`
                            }
                        >
                            <Icon size={11} /> {label}
                        </NavLink>
                    ))}
                </nav>
            </div>
        </header>
    );
};

export default Navbar;
