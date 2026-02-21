<div align="center">

<img src="https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=white" />
<img src="https://img.shields.io/badge/Vite-7-646CFF?style=for-the-badge&logo=vite&logoColor=white" />
<img src="https://img.shields.io/badge/TailwindCSS-3-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white" />
<img src="https://img.shields.io/badge/GitHub_API-REST-181717?style=for-the-badge&logo=github&logoColor=white" />

<br /><br />

# 🔭 GitExplorer

### *A production-ready GitHub Profile & Repository Explorer*

Search any GitHub user · Explore their repos · Visualise their activity · Compare developers · Discover trending projects

<br />

</div>

---

## ✨ Features

### 🧭 Explorer
- **Profile viewer** — avatar, bio, location, website, stat cards (followers, following, repos, gists)
- **Clickable Followers / Following** — browse user lists in a modal and jump to any profile
- **Repository grid** — sort by Recently Updated, Most Stars, or Most Forks
- **Client-side filtering** — search repos by name/description + filter by language
- **Slide-in detail panel** — click any repo card to reveal:
  - Stats (stars, forks, open issues, watchers)
  - Topics / tags
  - License, branch, created & updated dates
  - One-click clone URL copy
  - Language breakdown (Pie chart)
  - Star growth history (Area chart)
  - Top contributors with commit counts
  - Full **README preview** (GitHub-style prose, dark-mode aware)
- **Contribution heatmap** — 13-week activity calendar from public events
- **Language distribution chart** — donut chart across all repos
- **Dev Card generator** — downloadable PNG profile card (powered by html2canvas)
- **Search history** — recent usernames persisted in `localStorage`
- **Pagination** — browse all public repositories page by page

### 📊 Compare
Side-by-side comparison of two GitHub users showing stats, top languages, and most-starred repo.

### 🔥 Trending
Discover the hottest repositories right now, filtered by language and time range (Today / This Week / This Month) — powered by the official GitHub Search API.

### 🏢 Org Explorer
Browse any GitHub organisation: bio, stats, top repos, and a fully paginated member grid. Click any member to jump to their profile.

### 🔍 Code Search
Search code across all of GitHub or scoped to a specific user's repositories, with expandable inline code fragments.

---

## 🖥️ Tech Stack

| Layer | Technology |
|---|---|
| UI Framework | React 19 (functional components + hooks) |
| Bundler | Vite 7 |
| Styling | Tailwind CSS 3 + `@tailwindcss/typography` |
| HTTP | Axios (interceptors for auth & error handling) |
| Routing | React Router DOM v7 |
| Charts | Recharts |
| Markdown | `react-markdown` + `remark-gfm` + `rehype-raw` |
| Icons | `react-icons` |
| Dev Card | `html2canvas` |
| API | GitHub REST API v3 |

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** ≥ 18  
- **npm** ≥ 9

### Installation

```bash
# Clone the repo
git clone https://github.com/ambaskaryash/github-profile-explorer.git
cd gitub-profile

# Install dependencies
npm install

# Create your environment file
cp .env .env.local
```

### Environment Variables

Edit `.env` in the project root:

```env
# Optional but strongly recommended — raises rate limit from 60 → 5,000 req/hr
VITE_GITHUB_TOKEN=ghp_your_personal_access_token_here
```

> **How to generate a token:**  
> GitHub → Settings → Developer settings → Personal access tokens → Generate new token  
> Required scopes: `public_repo` (read-only public data is fine)

You can also set the token **at runtime** via the **⚙️ Settings** icon in the app navbar — no restart needed.

### Development

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Production Build

```bash
npm run build
npm run preview
```

---

## 📁 Project Structure

```
src/
├── components/
│   ├── ContributionHeatmap.jsx   # 13-week activity calendar
│   ├── DevCard.jsx               # Downloadable PNG profile card
│   ├── ErrorMessage.jsx          # Contextual error banner
│   ├── LanguageChart.jsx         # Language donut chart
│   ├── Navbar.jsx                # Sticky nav with tabs + token settings
│   ├── Pagination.jsx            # Prev / Next page controls
│   ├── ProfileViewer.jsx         # User profile card with modals
│   ├── RepoDetailPanel.jsx       # Slide-in repo detail drawer
│   ├── RepoExplorer.jsx          # Repo grid with filter + sort
│   ├── RepoFilter.jsx            # Name & language filter bar
│   ├── SearchForm.jsx            # Debounced search input
│   ├── SearchHistory.jsx         # Recent username strip
│   ├── StatCard.jsx              # Individual metric card
│   └── UserListModal.jsx         # Followers / Following modal
│
├── context/
│   └── AppContext.jsx            # Global: token, history, tab state
│
├── hooks/
│   └── useGithub.js              # Core data hook: search, pagination, sort
│
├── pages/
│   ├── Home.jsx                  # Explorer page (main)
│   ├── ComparePage.jsx           # Side-by-side user comparison
│   ├── TrendingPage.jsx          # Trending repositories
│   ├── OrgPage.jsx               # Organisation explorer
│   └── CodeSearchPage.jsx        # Code search across GitHub
│
├── services/
│   └── githubApi.js              # Axios instance + all API functions
│
└── utils/
    └── formatUtils.js            # Numbers, dates, language colours
```

---

## ⚡ API Rate Limits

| Mode | Limit |
|---|---|
| Unauthenticated | 60 requests / hour |
| Authenticated (token) | 5,000 requests / hour |

Add a GitHub Personal Access Token via the **⚙️** icon in the navbar to avoid hitting rate limits when exploring multiple profiles.

---

## 📄 License

MIT © 2026 — feel free to fork, star ⭐ and build on top of this!

---

<div align="center">

Built with ❤️ using React + Vite + Tailwind CSS  
Powered by the [GitHub REST API](https://docs.github.com/en/rest)

</div>
