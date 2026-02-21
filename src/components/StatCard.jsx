/**
 * StatCard.jsx
 * ────────────
 * Reusable metric card displaying an icon, numeric value, and label.
 * Used inside ProfileViewer to show followers, following, repos, gists.
 */
const StatCard = ({ icon: Icon, value, label, color = 'text-brand-500' }) => (
    <div className="glass-card p-4 flex flex-col items-center gap-1.5 text-center
                  hover:scale-105 hover:shadow-xl transition-all duration-200 cursor-default">
        <div className={`${color} opacity-90`}>
            <Icon size={22} />
        </div>
        <span className="text-xl font-bold text-slate-800 dark:text-white leading-none">
            {value}
        </span>
        <span className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">
            {label}
        </span>
    </div>
);

export default StatCard;
