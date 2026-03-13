/* eslint-disable no-undef */
/**
 * api/github-callback.js
 * ─────────────────────────
 * Vercel serverless function: exchanges GitHub OAuth `code` → `access_token`.
 * Keeps GITHUB_CLIENT_SECRET server-side only (never exposed to the browser).
 *
 * Endpoint: GET /api/github-callback?code=<auth_code>
 */
export default async function handler(req, res) {
    // Allow CORS for the Vite dev origin
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    const { code } = req.query;

    if (!code) {
        res.status(400).json({ error: 'Missing OAuth code parameter.' });
        return;
    }

    const clientId = process.env.GITHUB_CLIENT_ID;
    const clientSecret = process.env.GITHUB_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
        res.status(500).json({ error: 'OAuth credentials not configured on the server.' });
        return;
    }

    try {
        const response = await fetch('https://github.com/login/oauth/access_token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json',
            },
            body: JSON.stringify({
                client_id: clientId,
                client_secret: clientSecret,
                code,
                redirect_uri: `${req.headers['x-forwarded-proto'] || 'http'}://${req.headers.host}/auth/callback`,
            }),
        });

        const data = await response.json();

        if (data.error) {
            res.status(400).json({
                error: data.error_description || data.error,
                github_error: data.error,
                github_error_description: data.error_description
            });
            return;
        }

        res.status(200).json({
            access_token: data.access_token,
            token_type: data.token_type,
            scope: data.scope,
        });
    } catch (err) {
        console.error('GitHub OAuth exchange error:', err);
        res.status(500).json({ error: 'Failed to exchange OAuth code with GitHub.' });
    }
}
