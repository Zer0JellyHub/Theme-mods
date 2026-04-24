<p align="center">
  <img src="assets/banner.svg" alt="TheHub – Jellyfin Theme & Mods" width="100%"/>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Jellyfin-10.x-00A4DC?style=flat-square&logo=jellyfin&logoColor=white"/>
  <img src="https://img.shields.io/badge/JavaScript-ES6-F7DF1E?style=flat-square&logo=javascript&logoColor=black"/>
  <img src="https://img.shields.io/badge/k3ntas%20Plugin-compatible-7C3AED?style=flat-square"/>
  <img src="https://img.shields.io/badge/Mobile-ready-22C55E?style=flat-square"/>
  <img src="https://img.shields.io/github/license/Zer0JellyHub/TheHub?style=flat-square"/>
</p>

<br/>

A personal collection of JavaScript mods, UI tweaks and overlays for a self-hosted Jellyfin server running the **TheHub** theme. Everything injects via the [JavaScript Injector](https://github.com/nicowillis/jellyfin-plugin-javascript-injector) plugin — no server modifications required.

---

# 🎯 TheHub — Jellyfin Custom HUD

> A full custom UI enhancement suite for Jellyfin — built for the **Ultrachromic / Kaleidochromic** theme.


---

## ✨ Features Overview

| Feature | Tab / Script | Description |
|---|---|---|
| 🏠 Home Icon | `Home Icon.js` | Replaces default home text with an icon |
| ❤️ Favoriten | native Jellyfin | Custom tab styling |
| 👁️ Watchlist | `Bookmarks home.js` | Watchlist preview overlay |
| 🔖 Bookmarks | `Bookmarks home.js` | Bookmarks overlay on home |
| 📅 Calendar | `Calendar.js` | "Coming Up" glassmorphism overlay — next 7 days |
| ⭐ Ratings | `Rating Custom Tab Hud + Overlay.js` | Full ratings HUD with Movies / Series ranking, Watchlist, History, Search & Rate |
| 👍? 4U | separate script | Personalized recommendations overlay |
| 🎬 Version Selector | `Version Button Movies/Series.js` | Switch between multiple file versions (4K, 1080p, Dub, Sub…) |
| 🔍 Search Fix | `K3nats Search Fix.js` | Custom search overlay, hides episodes from results |
| 🎞️ Media Bar | `Fix Mediabar.js` + `Media bar extention.js` | Featured content slideshow bar fix |
| 🔄 Refresh Button | `Refresh button Laptop app.js` | Adds refresh to desktop app header |
| 🎭 PF Fix | `PF Fix.js` | Profile picture / user fix |
| ✏️ Fix Double Name | `Fix Double Name.js` | Removes duplicate title display |
| ⚙️ Kefin Tweaks | `Kefin.js` + `KefinTweaks-Config.js` | Various Jellyfin UI tweaks |

---

### Calendar Overlay
Click **Calendar** → glassmorphism full-screen overlay with upcoming episodes sorted by day.

### Ratings Overlay
Click **Ratings** → full overlay with:
- 🎬 Ranked Movies
- 📺 Ranked Series
- 📋 Watchlist per user
- 📜 Watch History (filter: All / Movies / Series)
- 🔍 Search & Rate

---

## 📁 File Overview

| File / Folder | Description |
|---|---|
| `Calendar.js` | Coming Up overlay — shows upcoming episodes for the next 7 days |
| `Rating Custom Tab Hud + Overlay.js` | Full ratings system with user rankings, history, watchlist |
| `Bookmarks home.js` | Watchlist & Bookmarks overlays |
| `Home Icon.js` | Replaces home tab text with SVG icon |
| `K3nats Search Fix.js` | Custom search overlay, filters episodes from results |
| `Fix Mediabar.js` | Fixes the JellyFrame Media Bar mod |
| `Media bar extention.js` | Extends media bar functionality |
| `Version Button Movies/` | Version selector for movies (4K/1080p/etc.) |
| `Version Button Series.js` | Version selector for series episodes (Ger Dub/Eng Sub/etc.) |
| `Fix Double Name.js` | Removes duplicate title shown on detail pages |
| `Refresh button Laptop app.js` | Adds a reload button in the desktop app header |
| `PF Fix.js` | Fixes profile picture display |
| `Kefin.js` | Core UI tweaks |
| `KefinTweaks-Config.js` | Config file for Kefin tweaks |
| `Raiting k3ntas fix.js` | Rating display fix |
| `Remove Setting Button.js` | Hides the settings gear on media cards |
| `Remove default Search button.js` | Hides native Jellyfin search button |
| `Reshow Cast Button.js` | Restores cast/sync button in header |
| `Branding/` | Custom branding assets |
| `Startsite better/` | Home page improvements |

---

## ✨ Features at a glance

| Mod | Description |
|-----|-------------|
| **Ratings Overlay** | Full glassmorphism overlay with 5 tabs: Movies, Series, Watchlist, History, Search & Rate |
| **24h Cache** | Rankings cached in localStorage — instant load after first open |
| **k3ntas Integration** | Submit, change and delete ratings via the k3ntas ratings plugin API |
| **Media Bar** | Random items filtered by minimum community rating with gear settings |
| **Calendar** | Coming-up overlay showing upcoming episodes by day |
| **Watch History** | Per-user history showing both movies and episodes (S1 E3 format) |
| **Watchlist** | Per-user favorites as poster grid |
| **Search & Rate** | Server-wide search for any movie or series — rate directly from results |
| **Mobile Layout** | All tabs always visible, wrapping header, no horizontal scroll |
| **Fix Double Name** | Removes duplicate title display bug |
| **K3ntas Search Fix** | Hides episodes from k3ntas plugin search results |

---

## 📸 Preview

<p align="center">
  <a href="https://zer0jellyhub.github.io/TheHub/">
    <img src="https://img.shields.io/badge/🎬_Live_Demo-Try_it_interactively-7c6af7?style=for-the-badge" alt="Live Demo"/>
  </a>
</p>


---

## 📁 File overview

```
TheHub/
├── Rating Custom Tab Hud + Overlay.js   # Main ratings overlay (5 tabs)
├── Raiting k3ntas fix.js                # k3ntas API compatibility fix
├── K3nats Search Fix.js                 # Hide episodes from search
├── Media bar extention.js               # Random media bar with rating filter
├── Calendar.js                          # Upcoming episodes calendar
├── Bookmarks home.js                    # Home page bookmarks
├── Fix Double Name.js                   # Remove duplicate title bug
├── Fix Mediabar.js                      # Media bar display fix
├── Home Icon.js                         # Custom home icon
├── Kefin.js / KefinTweaks-Config.js     # Kefin theme tweaks
├── PF Fix.js                            # Profile picture fix
├── Refresh button Laptop app.js         # Adds refresh button in desktop app
├── Remove Setting Button.js             # Hides settings button
├── Remove default Search button.js      # Hides default search
├── Reshow Cast Button.js                # Restores cast button
├── Version Button Movies/               # Version indicator for movies
└── Version Button Series.js             # Version indicator for series
```

---

## 🚀 Installation

### Requirements

- Jellyfin 10.x
- [JavaScript Injector Plugin](https://github.com/nicowillis/jellyfin-plugin-javascript-injector)
- [k3ntas Ratings Plugin](https://github.com/k3ntas/jellyfin-plugin-ratings) *(for rating features)*

### Setup

1. Install the **JavaScript Injector** plugin via Jellyfin Dashboard → Plugins → Catalog
2. Go to **Dashboard → Plugins → JavaScript Injector**
3. Paste the contents of whichever `.js` files you want to use
4. Save and do a **hard refresh** (`Cmd+Shift+R` / `Ctrl+Shift+R`) in your browser

> **Important:** If updating an existing script, always delete the old code completely before pasting the new version. Then hard refresh.

---

## ⭐ Ratings Overlay

The main feature — a full-screen glassmorphism overlay triggered by clicking the **Ratings** custom tab.

### Tabs

| Tab | What it shows |
|-----|---------------|
| **Movies** | All rated movies ranked by average score |
| **Series** | All rated series ranked by average score |
| **Watchlist** | Per-user favorites as poster grid |
| **History** | Per-user watch history (movies + episodes) |
| **Search & Rate** | Search any title on the server and rate it |

### Rating a movie

1. Click any **⭐ Rate** button next to a title
2. A star picker (1–10) opens inline
3. Select stars → click **Rate**
4. To change: click **⭐ X/10** → picker opens with **Change** / **Remove** options

### Cache behaviour

Rankings are cached for **24 hours** in `localStorage`. First open loads everything from the server — subsequent opens within 24h are instant. Cache is automatically invalidated when you submit or delete a rating.


---

## 🔧 Other mods

### Media Bar Extension
Replaces the default Jellyfin media bar with randomly selected items filtered by a minimum community rating. Includes a gear icon (⚙) for settings (min rating, item count, media type).

### Calendar
Patches the Calendar custom tab to open an overlay showing upcoming episodes for the next 8 days, grouped by day with poster grid.

### K3ntas Search Fix
Intercepts Jellyfin's `/Items` and `/Search/Hints` API responses to remove `Type === "Episode"` from results — keeps search clean showing only movies and series.

---

## 📱 Mobile

All overlays are mobile-optimised:
- Header splits into two rows: title/search/close on top, all tabs below
- Tabs wrap automatically — no horizontal scrolling required
- Poster grids adapt to screen width
- Star picker works with touch

---

## 📄 License

AGPL-3.0 — see [LICENSE](LICENSE) for details.

---

<p align="center">
  <sub>Made for personal use on TheHub Jellyfin server · by <a href="https://github.com/Zer0JellyHub">Zer0JellyHub</a></sub>
</p>
