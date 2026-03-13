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

    const clientId = process.env.GITHUB_CLIENT_ID?.trim();
    const clientSecret = process.env.GITHUB_CLIENT_SECRET?.trim();

    if (!clientId || !clientSecret) {
        res.status(500).json({ error: 'OAuth credentials not configured on the server.' });
        return;
    }

    try {
        console.log(`Exchanging code for token with Client ID: ${clientId.slice(0, 4)}...`);
        
        const params = new URLSearchParams({
            client_id: clientId,
            client_secret: clientSecret,
            code,
        });

        const response = await fetch('https://github.com/login/oauth/access_token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                Accept: 'application/json',
            },
            body: params.toString(),
        });

        const data = await response.json();

        if (!response.ok || data.error) {
            console.error('GitHub API error:', data);
            
            let errorMessage = data.error_description || data.error || 'GitHub returned an error.';
            
            // "Not Found" usually means the Client ID is incorrect/invalid
            if (data.error === 'Not Found') {
                errorMessage = `Client ID not found or invalid (ID starts with: ${clientId.slice(0, 4)}...). Check GITHUB_CLIENT_ID.`;
            } else if (data.error === 'bad_verification_code') {
                errorMessage = 'The OAuth code is invalid or expired. Please try logging in again.';
            }

            res.status(response.status || 400).json({
                error: errorMessage,
                github_error: data.error,
                github_status: response.status,
                // Do not expose raw_data in production if it contains secrets, but here it's mostly error info
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
