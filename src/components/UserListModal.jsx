/**
 * UserListModal.jsx
 * ──────────────────
 * Modal showing a list of GitHub users (followers OR following).
 * Each user is clickable → loads their profile in the Explorer.
 */
import { useState, useEffect } from 'react';
import { FiX, FiLoader, FiUsers } from 'react-icons/fi';
import { getUserFollowers, getUserFollowing } from '../services/githubApi';

const UserListModal = ({ username, type, onClose, onSelectUser }) => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);

    useEffect(() => {
        let cancelled = false;
        (async () => {
            setLoading(true);
            const fn = type === 'followers' ? getUserFollowers : getUserFollowing;
            const data = await fn(username, page).catch(() => []);
            if (!cancelled) {
                setUsers((prev) => page === 1 ? data : [...prev, ...data]);
                setHasMore(data.length === 30);
                setLoading(false);
            }
        })();
        return () => { cancelled = true; };
    }, [username, type, page]);

    return (
        <>
            <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40" onClick={onClose} />
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <div className="glass-card w-full max-w-md max-h-[80vh] flex flex-col animate-slide-up">
                    {/* Header */}
                    <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700">
                        <h2 className="text-sm font-bold text-slate-800 dark:text-white flex items-center gap-2">
                            <FiUsers size={15} className="text-brand-500" />
                            {type === 'followers' ? `Followers of @${username}` : `@${username} is Following`}
                        </h2>
                        <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
                            <FiX size={18} />
                        </button>
                    </div>

                    {/* List */}
                    <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
                        {users.map((u) => (
                            <button
                                key={u.login}
                                onClick={() => { onSelectUser(u.login); onClose(); }}
                                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-800/50
                           transition-colors text-left group"
                            >
                                <img src={u.avatar_url} alt={u.login}
                                    className="w-9 h-9 rounded-full object-cover ring-2 ring-brand-500/20" />
                                <div className="min-w-0">
                                    <p className="text-sm font-semibold text-slate-800 dark:text-white group-hover:text-brand-500 transition-colors truncate">
                                        {u.login}
                                    </p>
                                </div>
                                <a href={u.html_url} target="_blank" rel="noreferrer"
                                    onClick={(e) => e.stopPropagation()}
                                    className="ml-auto text-xs text-slate-400 hover:text-brand-500 shrink-0">
                                    ↗
                                </a>
                            </button>
                        ))}

                        {loading && (
                            <div className="flex justify-center p-4">
                                <FiLoader size={18} className="animate-spin text-brand-500" />
                            </div>
                        )}

                        {!loading && hasMore && (
                            <button
                                onClick={() => setPage((p) => p + 1)}
                                className="w-full py-3 text-sm text-brand-500 font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                            >
                                Load more
                            </button>
                        )}

                        {!loading && users.length === 0 && (
                            <p className="text-center text-sm text-slate-400 p-6">No users found.</p>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
};

export default UserListModal;
