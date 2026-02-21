/**
 * LanguageChart.jsx
 * ──────────────────
 * Donut chart showing programming language distribution across all a user's repos.
 * Data is aggregated client-side from the repos array already fetched by useGithub.
 */
import { useMemo } from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { getLanguageColor } from '../utils/formatUtils';

const LanguageChart = ({ repos }) => {
    const data = useMemo(() => {
        const counts = {};
        repos.forEach(({ language }) => {
            if (language) counts[language] = (counts[language] ?? 0) + 1;
        });
        return Object.entries(counts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10)
            .map(([name, value]) => ({ name, value, color: getLanguageColor(name) }));
    }, [repos]);

    if (data.length === 0) return null;

    const total = data.reduce((s, d) => s + d.value, 0);

    return (
        <div className="glass-card p-5 animate-fade-in">
            <h3 className="text-sm font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-brand-500" />
                Language Distribution
            </h3>
            <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                    <Pie
                        data={data}
                        cx="50%"
                        cy="50%"
                        innerRadius={55}
                        outerRadius={85}
                        paddingAngle={2}
                        dataKey="value"
                        strokeWidth={0}
                    >
                        {data.map((entry, i) => (
                            <Cell key={i} fill={entry.color} />
                        ))}
                    </Pie>
                    <Tooltip
                        formatter={(v, n) => [`${v} repos (${Math.round((v / total) * 100)}%)`, n]}
                        contentStyle={{
                            borderRadius: '12px',
                            border: 'none',
                            boxShadow: '0 4px 24px rgba(0,0,0,0.12)',
                            fontSize: '12px',
                        }}
                    />
                </PieChart>
            </ResponsiveContainer>
            {/* Legend */}
            <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 mt-2">
                {data.map((d) => (
                    <div key={d.name} className="flex items-center gap-2 text-xs">
                        <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: d.color }} />
                        <span className="text-slate-600 dark:text-slate-400 truncate">{d.name}</span>
                        <span className="ml-auto text-slate-500 font-medium shrink-0">{d.value}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default LanguageChart;
