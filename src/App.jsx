/**
 * App.jsx  (v2)
 * ──────────────
 * Root component with:
 *  - React Router v6 (BrowserRouter + Routes)
 *  - AppContext (token, history)
 *  - Dark mode persisted in localStorage
 *  - Slide-in panel animation keyframe (injected globally)
 */
import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import TrendingPage from './pages/TrendingPage';
import ComparePage from './pages/ComparePage';
import CodeSearchPage from './pages/CodeSearchPage';
import OrgPage from './pages/OrgPage';
import OAuthCallback from './pages/OAuthCallback';

// Inject the slide-in animation once
const injectSlideAnimation = () => {
  if (document.getElementById('slide-anim')) return;
  const style = document.createElement('style');
  style.id = 'slide-anim';
  style.textContent = `
    @keyframes slideInRight {
      from { transform: translateX(100%); opacity: 0; }
      to   { transform: translateX(0);   opacity: 1; }
    }
  `;
  document.head.appendChild(style);
};
injectSlideAnimation();

const App = () => {
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('githubExplorer_darkMode');
    if (saved !== null) return saved === 'true';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
    localStorage.setItem('githubExplorer_darkMode', String(darkMode));
  }, [darkMode]);

  const toggleDark = () => setDarkMode((prev) => !prev);

  return (
    <AppProvider>
      <BrowserRouter>
        <div className="min-h-screen bg-gradient-to-br from-slate-100 via-slate-50 to-indigo-50
                        dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950 transition-colors duration-300">
          <Navbar darkMode={darkMode} toggleDark={toggleDark} />
          <Routes>
            <Route path="/" element={<Home darkMode={darkMode} />} />
            <Route path="/trending" element={<TrendingPage />} />
            <Route path="/compare" element={<ComparePage />} />
            <Route path="/codesearch" element={<CodeSearchPage />} />
            <Route path="/org" element={<OrgPage />} />
            <Route path="/auth/callback" element={<OAuthCallback />} />
          </Routes>
        </div>
      </BrowserRouter>
    </AppProvider>
  );
};

export default App;
