/**
 * Pagination.jsx
 * ──────────────
 * Previous / Next pagination controls with page indicator.
 * Keeps the component purely presentational – state lives in useGithub.
 */
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';

const Pagination = ({ page, totalPages, onPrev, onNext }) => {
    if (totalPages <= 1) return null;

    return (
        <div className="flex items-center justify-center gap-4 mt-8 animate-fade-in">
            <button
                onClick={onPrev}
                disabled={page === 1}
                aria-label="Previous page"
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold
                   border border-slate-200 dark:border-slate-700
                   bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300
                   hover:bg-slate-100 dark:hover:bg-slate-700 transition-all duration-200
                   disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white
                   dark:disabled:hover:bg-slate-800"
            >
                <FiChevronLeft size={16} />
                Prev
            </button>

            <span className="min-w-[80px] text-center text-sm font-medium text-slate-600 dark:text-slate-400">
                Page <span className="font-bold text-brand-500">{page}</span> of {totalPages}
            </span>

            <button
                onClick={onNext}
                disabled={page === totalPages}
                aria-label="Next page"
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold
                   border border-slate-200 dark:border-slate-700
                   bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300
                   hover:bg-slate-100 dark:hover:bg-slate-700 transition-all duration-200
                   disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white
                   dark:disabled:hover:bg-slate-800"
            >
                Next
                <FiChevronRight size={16} />
            </button>
        </div>
    );
};

export default Pagination;
