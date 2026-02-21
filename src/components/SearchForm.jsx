/**
 * SearchForm.jsx
 * ──────────────
 * Search input with animated icon and inline loading spinner.
 * The debounce logic lives in useGithub, so this component only
 * manages controlled input and visual feedback.
 */
import { FiSearch, FiLoader } from 'react-icons/fi';
import { MdClear } from 'react-icons/md';

const SearchForm = ({ username, setUsername, loading }) => (
    <form
        onSubmit={(e) => e.preventDefault()}
        className="w-full max-w-2xl mx-auto"
        aria-label="GitHub username search"
    >
        <div className="relative group">
            {/* Search icon */}
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-brand-500
                       transition-colors duration-200 pointer-events-none">
                {loading
                    ? <FiLoader size={20} className="animate-spin" />
                    : <FiSearch size={20} />
                }
            </span>

            <input
                id="github-search"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Search any GitHub username…"
                autoComplete="off"
                className="w-full pl-12 pr-12 py-4 rounded-2xl text-base font-medium
                   bg-white dark:bg-slate-800
                   border-2 border-slate-200 dark:border-slate-700
                   text-slate-800 dark:text-slate-100
                   placeholder-slate-400 dark:placeholder-slate-500
                   outline-none focus:border-brand-500 dark:focus:border-brand-400
                   shadow-md hover:shadow-lg transition-all duration-200"
            />

            {/* Clear button */}
            {username && (
                <button
                    type="button"
                    onClick={() => setUsername('')}
                    aria-label="Clear search"
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400
                     hover:text-brand-500 transition-colors duration-200"
                >
                    <MdClear size={20} />
                </button>
            )}
        </div>

        <p className="text-center text-xs text-slate-400 dark:text-slate-500 mt-3">
            Try searching for <span className="text-brand-500 font-semibold cursor-pointer hover:underline"
                onClick={() => setUsername('torvalds')}>torvalds</span>,{' '}
            <span className="text-brand-500 font-semibold cursor-pointer hover:underline"
                onClick={() => setUsername('gaearon')}>gaearon</span>, or{' '}
            <span className="text-brand-500 font-semibold cursor-pointer hover:underline"
                onClick={() => setUsername('sindresorhus')}>sindresorhus</span>
        </p>
    </form>
);

export default SearchForm;
