/**
 * DevCard.jsx
 * ────────────
 * Generates a shareable developer profile card that can be downloaded as PNG.
 * Uses the DOM + html2canvas approach via a hidden ref div.
 * Falls back gracefully if html2canvas fails (just shows the card).
 */
import { useRef } from 'react';
import { FiDownload, FiGithub, FiStar, FiBook, FiUsers } from 'react-icons/fi';
import { formatNumber } from '../utils/formatUtils';
import { getLanguageColor } from '../utils/formatUtils';

const DevCard = ({ profile, repos }) => {
    const cardRef = useRef(null);

    if (!profile) return null;

    const topLangs = (() => {
        const counts = {};
        repos.forEach(({ language }) => { if (language) counts[language] = (counts[language] ?? 0) + 1; });
        return Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 4).map(([l]) => l);
    })();

    const topRepo = [...repos].sort((a, b) => b.stargazers_count - a.stargazers_count)[0];

    const handleDownload = async () => {
        try {
            const { default: html2canvas } = await import('html2canvas');
            const canvas = await html2canvas(cardRef.current, {
                scale: 2, backgroundColor: null, useCORS: true, logging: false,
            });
            const link = document.createElement('a');
            link.download = `${profile.login}-devcard.png`;
            link.href = canvas.toDataURL('image/png');
            link.click();
        } catch {
            alert('Download not available. Try installing html2canvas: npm install html2canvas');
        }
    };

    return (
        <div className="glass-card p-5 animate-fade-in">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-slate-800 dark:text-white flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-rose-500" />
                    Dev Card
                </h3>
                <button
                    onClick={handleDownload}
                    className="btn-primary text-xs py-1.5"
                >
                    <FiDownload size={13} /> Download PNG
                </button>
            </div>

            {/* Card preview */}
            <div
                ref={cardRef}
                className="relative overflow-hidden rounded-2xl p-6 text-white"
                style={{
                    background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 40%, #4338ca 100%)',
                    minHeight: 200,
                }}
            >
                {/* Background circles */}
                <div className="absolute -top-10 -right-10 w-48 h-48 rounded-full bg-white/5 pointer-events-none" />
                <div className="absolute -bottom-8 -left-8 w-36 h-36 rounded-full bg-white/5 pointer-events-none" />

                <div className="relative z-10 flex flex-col sm:flex-row gap-5 items-center sm:items-start">
                    <img
                        src={profile.avatar_url}
                        alt={profile.login}
                        crossOrigin="anonymous"
                        className="w-20 h-20 rounded-2xl ring-4 ring-white/20 object-cover shrink-0"
                    />
                    <div className="text-center sm:text-left flex-1 min-w-0">
                        <h4 className="text-xl font-bold leading-tight">{profile.name ?? profile.login}</h4>
                        <p className="text-indigo-300 text-sm">@{profile.login}</p>
                        {profile.bio && (
                            <p className="text-indigo-200 text-xs mt-1.5 line-clamp-2">{profile.bio}</p>
                        )}

                        {/* Lang badges */}
                        <div className="flex flex-wrap gap-1.5 mt-3 justify-center sm:justify-start">
                            {topLangs.map((l) => (
                                <span key={l} className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium"
                                    style={{ backgroundColor: getLanguageColor(l) + '30', color: '#fff', border: `1px solid ${getLanguageColor(l)}60` }}>
                                    <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: getLanguageColor(l) }} />
                                    {l}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Stats row */}
                <div className="relative z-10 grid grid-cols-3 gap-3 mt-5">
                    {[
                        { icon: FiUsers, val: formatNumber(profile.followers), label: 'Followers' },
                        { icon: FiBook, val: formatNumber(profile.public_repos), label: 'Repos' },
                        { icon: FiStar, val: topRepo ? formatNumber(topRepo.stargazers_count) : '0', label: 'Top Stars' },
                    ].map(({ icon: Icon, val, label }) => (
                        <div key={label} className="text-center p-2 rounded-xl bg-white/10 backdrop-blur-sm">
                            <Icon size={14} className="mx-auto mb-0.5 text-indigo-300" />
                            <p className="text-lg font-bold leading-none">{val}</p>
                            <p className="text-indigo-300 text-[10px] mt-0.5">{label}</p>
                        </div>
                    ))}
                </div>

                {/* Branding */}
                <div className="relative z-10 flex items-center gap-1 mt-4 text-indigo-400 text-[10px]">
                    <FiGithub size={10} /> GitExplorer
                </div>
            </div>
        </div>
    );
};

export default DevCard;
