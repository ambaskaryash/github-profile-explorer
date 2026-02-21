/**
 * InstallPWAButton.jsx
 * ─────────────────────
 * Shows a discreet "Install App" button when the browser fires the
 * `beforeinstallprompt` event (Chromium-based browsers on desktop/Android).
 * Hidden automatically on iOS (no install prompt API) and when already
 * running in standalone PWA mode.
 */
import { useState, useEffect } from 'react';
import { MdInstallMobile } from 'react-icons/md';

const InstallPWAButton = ({ variant = 'navbar' }) => {
    const [deferredPrompt, setDeferredPrompt] = useState(null);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        // Don't show if already installed (running in standalone mode)
        if (window.matchMedia('(display-mode: standalone)').matches) return;

        const handler = (e) => {
            e.preventDefault();
            setDeferredPrompt(e);
            setIsVisible(true);
        };

        window.addEventListener('beforeinstallprompt', handler);

        // Hide button once the app is installed
        window.addEventListener('appinstalled', () => {
            setIsVisible(false);
            setDeferredPrompt(null);
        });

        return () => window.removeEventListener('beforeinstallprompt', handler);
    }, []);

    const handleInstall = async () => {
        if (!deferredPrompt) return;
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === 'accepted') {
            setIsVisible(false);
            setDeferredPrompt(null);
        }
    };

    if (!isVisible) return null;

    if (variant === 'banner') {
        return (
            <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50
                      flex items-center gap-3 px-5 py-3 rounded-2xl shadow-2xl
                      bg-indigo-600/95 backdrop-blur-sm text-white
                      animate-bounce-in border border-indigo-400/30">
                <MdInstallMobile className="text-xl flex-shrink-0" />
                <span className="text-sm font-semibold">Install GitExplorer as an app</span>
                <button
                    onClick={handleInstall}
                    className="ml-2 px-3 py-1 bg-white text-indigo-700 text-xs font-bold rounded-lg
                     hover:bg-indigo-50 transition-colors"
                >
                    Install
                </button>
                <button
                    onClick={() => setIsVisible(false)}
                    className="text-indigo-200 hover:text-white text-lg leading-none ml-1"
                    aria-label="Dismiss"
                >
                    ×
                </button>
            </div>
        );
    }

    // Default: compact navbar button
    return (
        <button
            onClick={handleInstall}
            title="Install GitExplorer as an app"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold
                 bg-indigo-600 hover:bg-indigo-500 text-white
                 transition-all duration-200 hover:shadow-lg hover:shadow-indigo-500/25
                 active:scale-95"
        >
            <MdInstallMobile className="text-base" />
            <span className="hidden sm:inline">Install</span>
        </button>
    );
};

export default InstallPWAButton;
