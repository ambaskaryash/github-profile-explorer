/**
 * ContributionHeatmap.jsx
 * ───────────────────────
 * Activity heatmap calendar built from the GitHub events API.
 * Shows the last ~90 days of public activity using colour intensity.
 */
import { useMemo } from 'react';

const DAYS = 91; // 13 weeks
const COLS = 13;

const getIntensity = (count) => {
    if (!count) return 0;
    if (count <= 1) return 1;
    if (count <= 3) return 2;
    if (count <= 6) return 3;
    return 4;
};

const COLOURS = {
    light: ['#ebedf0', '#9be9a8', '#40c463', '#30a14e', '#216e39'],
    dark: ['#161b22', '#0e4429', '#006d32', '#26a641', '#39d353'],
};

const ContributionHeatmap = ({ events, darkMode = false }) => {
    const { grid, months } = useMemo(() => {
        // Build date → count map
        const counts = {};
        events.forEach(({ created_at }) => {
            const day = created_at?.slice(0, 10);
            if (day) counts[day] = (counts[day] ?? 0) + 1;
        });

        // Build grid: COLS weeks × 7 days, newest at the right
        const today = new Date();
        const gridArr = [];
        const monthLabels = [];
        let lastMonth = -1;

        for (let col = COLS - 1; col >= 0; col--) {
            const week = [];
            for (let row = 6; row >= 0; row--) {
                const d = new Date(today);
                d.setDate(today.getDate() - (col * 7 + row));
                const key = d.toISOString().slice(0, 10);
                const count = counts[key] ?? 0;
                const month = d.getMonth();
                if (month !== lastMonth && row === 6) {
                    monthLabels.push({ col: COLS - 1 - col, label: d.toLocaleString('en', { month: 'short' }) });
                    lastMonth = month;
                }
                week.unshift({ key, count });
            }
            gridArr.unshift(week);
        }

        return { grid: gridArr, months: monthLabels };
    }, [events]);

    const palette = COLOURS[darkMode ? 'dark' : 'light'];
    const total = events.length;

    return (
        <div className="glass-card p-5 animate-fade-in">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-slate-800 dark:text-white flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    Contribution Activity (last 13 weeks)
                </h3>
                <span className="text-xs text-slate-500 dark:text-slate-400">{total} events</span>
            </div>

            <div className="overflow-x-auto">
                <div style={{ minWidth: 'max-content' }}>
                    {/* Month labels */}
                    <div className="flex gap-[3px] mb-1 ml-5">
                        {Array.from({ length: COLS }).map((_, col) => {
                            const label = months.find((m) => m.col === col);
                            return (
                                <div key={col} className="w-[13px] text-[9px] text-slate-400 dark:text-slate-500 leading-none">
                                    {label?.label ?? ''}
                                </div>
                            );
                        })}
                    </div>

                    {/* Grid */}
                    <div className="flex gap-[3px]">
                        {/* Day-of-week labels */}
                        <div className="flex flex-col gap-[3px] mr-1 justify-start pt-0.5">
                            {['', 'Mon', '', 'Wed', '', 'Fri', ''].map((d, i) => (
                                <div key={i} className="h-[13px] text-[9px] text-slate-400 dark:text-slate-500 leading-[13px] w-4 text-right">
                                    {d}
                                </div>
                            ))}
                        </div>

                        {grid.map((week, ci) => (
                            <div key={ci} className="flex flex-col gap-[3px]">
                                {week.map(({ key, count }) => (
                                    <div
                                        key={key}
                                        title={`${key}: ${count} event${count !== 1 ? 's' : ''}`}
                                        className="w-[13px] h-[13px] rounded-sm cursor-default transition-opacity hover:opacity-80"
                                        style={{ backgroundColor: palette[getIntensity(count)] }}
                                    />
                                ))}
                            </div>
                        ))}
                    </div>

                    {/* Legend */}
                    <div className="flex items-center gap-2 mt-3 justify-end">
                        <span className="text-[10px] text-slate-400 dark:text-slate-500">Less</span>
                        {palette.map((c, i) => (
                            <div key={i} className="w-[13px] h-[13px] rounded-sm" style={{ backgroundColor: c }} />
                        ))}
                        <span className="text-[10px] text-slate-400 dark:text-slate-500">More</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ContributionHeatmap;
