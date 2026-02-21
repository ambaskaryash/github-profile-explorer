import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icon-192.png', 'icon-512.png', 'icon-512-maskable.png', 'offline.html'],
      manifest: {
        name: 'GitExplorer – GitHub Profile & Repo Explorer',
        short_name: 'GitExplorer',
        description: 'Search GitHub profiles, explore repositories, visualise activity, compare developers, and discover trending projects.',
        start_url: '/',
        display: 'standalone',
        background_color: '#0f172a',
        theme_color: '#6366f1',
        icons: [
          { src: '/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
          { src: '/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
          { src: '/icon-512-maskable.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
        shortcuts: [
          {
            name: 'Trending Repos',
            short_name: 'Trending',
            url: '/trending',
            icons: [{ src: '/icon-192.png', sizes: '192x192' }],
          },
          {
            name: 'Compare Developers',
            short_name: 'Compare',
            url: '/compare',
            icons: [{ src: '/icon-192.png', sizes: '192x192' }],
          },
        ],
      },
      workbox: {
        // Cache the app shell (JS/CSS/HTML)
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        // Offline fallback for navigation requests
        navigateFallback: '/offline.html',
        navigateFallbackDenylist: [/^\/api\//],
        runtimeCaching: [
          {
            // GitHub API – stale-while-revalidate, 1 hour cache
            urlPattern: /^https:\/\/api\.github\.com\/.*/i,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'github-api-cache',
              expiration: { maxEntries: 100, maxAgeSeconds: 60 * 60 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          {
            // GitHub avatar images – cache-first, 7 days
            urlPattern: /^https:\/\/avatars\.githubusercontent\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'github-avatars-cache',
              expiration: { maxEntries: 200, maxAgeSeconds: 60 * 60 * 24 * 7 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
        ],
      },
      devOptions: {
        // Enable SW in dev mode for testing (disable in daily dev if annoying)
        enabled: false,
      },
    }),
  ],
})

