/**
 * ErrorMessage.jsx
 * ────────────────
 * Styled error banner displayed when an API call fails.
 * Differentiates between rate-limit errors and user-not-found errors.
 */
import { FiAlertTriangle, FiUserX, FiZap } from 'react-icons/fi';

const isRateLimit = (msg) => msg?.toLowerCase().includes('rate limit');
const isNotFound = (msg) => msg?.toLowerCase().includes('not found');

const ErrorMessage = ({ message }) => {
    const icon = isRateLimit(message) ? <FiZap size={24} />
        : isNotFound(message) ? <FiUserX size={24} />
            : <FiAlertTriangle size={24} />;

    const color = isRateLimit(message)
        ? 'bg-amber-50 border-amber-300 text-amber-800 dark:bg-amber-900/30 dark:border-amber-600 dark:text-amber-300'
        : 'bg-red-50 border-red-300 text-red-800 dark:bg-red-900/30 dark:border-red-600 dark:text-red-300';

    return (
        <div
            role="alert"
            className={`flex items-start gap-3 p-4 rounded-2xl border animate-fade-in ${color}`}
        >
            <span className="mt-0.5 shrink-0">{icon}</span>
            <div>
                <p className="font-semibold text-sm">
                    {isRateLimit(message) ? 'Rate Limit Reached' : isNotFound(message) ? 'User Not Found' : 'Something went wrong'}
                </p>
                <p className="text-xs mt-0.5 opacity-80">{message}</p>
            </div>
        </div>
    );
};

export default ErrorMessage;
