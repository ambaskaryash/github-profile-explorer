/**
 * OAuthCallback.jsx
 * ──────────────────
 * Handles the GitHub OAuth redirect: reads `?code=` from the URL,
 * calls the Vercel serverless function to exchange it for an access_token,
 * fetches the authenticated user's profile, saves to AppContext, then
 * redirects to the home page.
 */
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';

const OAuthCallback = () => {
    const navigate = useNavigate();
    const { setOauthSession } = useAppContext();
    const [status, setStatus] = useState('Connecting to GitHub…');
    const [error, setError] = useState(null);

    useEffect(() => {
        const code = new URLSearchParams(window.location.search).get('code');

        if (!code) {
            setError('No OAuth code found in the URL. Please try logging in again.');
            return;
        }

        const exchange = async () => {
            try {
                setStatus('Exchanging authorization code…');

                // Call the Vercel serverless function
                const tokenRes = await fetch(`/api/github-callback?code=${code}`);
                const tokenData = await tokenRes.json();

                if (!tokenRes.ok || tokenData.error) {
                    throw new Error(tokenData.error || 'Failed to exchange OAuth code.');
                }

                const { access_token } = tokenData;
                setStatus('Fetching your GitHub profile…');

                // Fetch the authenticated user's profile
                const userRes = await fetch('https://api.github.com/user', {
                    headers: {
                        Authorization: `token ${access_token}`,
                        Accept: 'application/vnd.github.v3+json',
                    },
                });

                if (!userRes.ok) throw new Error('Failed to fetch GitHub user profile.');
                const user = await userRes.json();

                // Save to context + sessionStorage
                setOauthSession(access_token, user);
                setStatus(`Welcome, ${user.login}! Redirecting…`);

                setTimeout(() => navigate('/'), 800);
            } catch (err) {
                console.error('OAuth error:', err);
                setError(err.message || 'An unknown error occurred during login.');
            }
        };

        exchange();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <div className="min-h-screen flex items-center justify-center
                        bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950">
            <div className="glass-card p-10 max-w-sm w-full text-center space-y-5">
                <div className="text-5xl">
                    {error ? '❌' : '🔭'}
                </div>

                {error ? (
                    <>
                        <h2 className="text-lg font-bold text-red-400">Login Failed</h2>
                        <p className="text-sm text-slate-400">{error}</p>
                        <button
                            onClick={() => navigate('/')}
                            className="btn-primary mx-auto"
                        >
                            Back to Home
                        </button>
                    </>
                ) : (
                    <>
                        <h2 className="text-lg font-bold text-white">Logging in with GitHub</h2>
                        <p className="text-sm text-slate-400">{status}</p>
                        {/* Spinner */}
                        <div className="flex justify-center">
                            <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent
                                            rounded-full animate-spin" />
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default OAuthCallback;
