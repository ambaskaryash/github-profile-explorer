/**
 * SearchHistory.jsx
 * ──────────────────
 * Dropdown that shows recently searched usernames from localStorage.
 * Rendered below the SearchForm on the Explorer page.
 */
import { FiClock, FiX, FiTrash2 } from 'react-icons/fi';
import { useAppContext } from '../context/AppContext';

const SearchHistory = ({ onSelect }) => {
    const { history, clearHistory } = useAppContext();

    if (history.length === 0) return null;

    return (
        <div className="flex items-center gap-2 flex-wrap justify-center">
            <FiClock size={13} className="text-slate-400 shrink-0" />
            <span className="text-xs text-slate-400 dark:text-slate-500 shrink-0">Recent:</span>
            {history.map((u) => (
                <button
                    key={u}
                    onClick={() => onSelect(u)}
                    className="text-xs px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-700
                     text-slate-600 dark:text-slate-300 hover:bg-brand-100 dark:hover:bg-brand-900/30
                     hover:text-brand-600 dark:hover:text-brand-400 transition-colors font-medium"
                >
                    {u}
                </button>
            ))}
            <button
                onClick={clearHistory}
                title="Clear history"
                className="text-xs text-slate-400 hover:text-red-500 transition-colors flex items-center gap-1"
            >
                <FiTrash2 size={11} /> Clear
            </button>
        </div>
    );
};

export default SearchHistory;
