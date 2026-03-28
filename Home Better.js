// ==UserScript==
// @name         Jellyfin Tab Icons
// @namespace    jellyfin-tab-icons
// @version      1.8
// @description  Adds matching icons above all tab labels in Jellyfin (like the Home tabs)
// @author       Custom
// @match        *://*/web/*
// @match        *://*/web/#*
// @grant        GM_addStyle
// @run-at       document-idle
// ==/UserScript==

(function () {
  'use strict';

  /* ─── SVG ICONS (Material Design, fill=currentColor) ─────────────────── */
  const ICONS = {
    home:      `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/></svg>`,
    favorite:  `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>`,
    bookmark:  `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M17 3H7c-1.1 0-2 .9-2 2v16l7-3 7 3V5c0-1.1-.9-2-2-2z"/></svg>`,
    bookmarks: `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M17 11v6.97l-5-2.14-5 2.14V5h6V3H7c-1.1 0-2 .9-2 2v16l7-3 7 3v-9h-2zm2-4h-2v2h-2v2h2v2h2v-2h2v-2h-2V7z"/></svg>`,
    tv:        `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M21 3H3c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h5v2h8v-2h5c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 14H3V5h18v12zM10 7.5v7l6-3.5z"/></svg>`,
    movie:     `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M20 3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 2v2.5l-3-2.5h3zm-5.2 0l3.7 3H14V5h.8zM10 5h2v3h-4.1L10 5zM4 5h3.3L5 7.5V5H4zm0 14V9h16v10H4z"/></svg>`,
    suggest:   `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M1 21h4V9H1v12zm22-11c0-1.1-.9-2-2-2h-6.31l.95-4.57.03-.32c0-.41-.17-.79-.44-1.06L14.17 1 7.59 7.59C7.22 7.95 7 8.45 7 9v10c0 1.1.9 2 2 2h9c.83 0 1.54-.5 1.84-1.22l3.02-7.05c.09-.23.14-.47.14-.73v-2l-.01-.01L23 10z"/></svg>`,
    upcoming:  `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M17 12h-5v5h5v-5zM16 1v2H8V1H6v2H5C3.89 3 3.01 3.9 3.01 5L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2h-1V1h-2zm3 18H5V8h14v11z"/></svg>`,
    genre:     `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M21.41 11.58l-9-9C12.05 2.22 11.55 2 11 2H4c-1.1 0-2 .9-2 2v7c0 .55.22 1.05.59 1.42l9 9c.36.36.86.58 1.41.58s1.05-.22 1.41-.59l7-7c.37-.36.59-.86.59-1.41s-.23-1.06-.59-1.42zM5.5 7C4.67 7 4 6.33 4 5.5S4.67 4 5.5 4 7 4.67 7 5.5 6.33 7 5.5 7z"/></svg>`,
    shuffle:   `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M10.59 9.17L5.41 4 4 5.41l5.17 5.17 1.42-1.41zM14.5 4l2.04 2.04L4 18.59 5.41 20 17.96 7.46 20 9.5V4h-5.5zm.33 9.41l-1.41 1.41 3.13 3.13L14.5 20H20v-5.5l-2.04 2.04-3.13-3.13z"/></svg>`,
    studio:    `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M12 7V3H2v18h20V7H12zM6 19H4v-2h2v2zm0-4H4v-2h2v2zm0-4H4V9h2v2zm0-4H4V5h2v2zm4 12H8v-2h2v2zm0-4H8v-2h2v2zm0-4H8V9h2v2zm0-4H8V5h2v2zm10 12h-8v-2h2v-2h-2v-2h2v-2h-2V9h8v10zm-2-8h-2v2h2v-2zm0 4h-2v2h2v-2z"/></svg>`,
    music:     `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/></svg>`,
    photo:     `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/></svg>`,
    livetv:    `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M21 6h-7.59l3.29-3.29L15 1.41 11.71 4.7 8.41 1.41 7 2.71 10.29 6H3c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm0 14H3V8h18v12zM9 10v8l7-4z"/></svg>`,
    guide:     `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/></svg>`,
    year:      `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M20 3h-1V1h-2v2H7V1H5v2H4c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 18H4V8h16v13z"/></svg>`,
    person:    `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>`,
    watchlist: `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/></svg>`,
    collections: `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6zm16-4H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-1 9H9V9h10v2zm-4 4H9v-2h6v2zm4-8H9V5h10v2z"/></svg>`,
    network:   `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M1.41 1.69L0 3.1l4.84 4.84C3.07 9.21 2 11.48 2 14h2c0-2.09.83-3.98 2.17-5.38l1.43 1.43C6.6 11.19 6 12.53 6 14h2c0-1.07.43-2.03 1.12-2.73L12 14.17V21h2v-6.83l7.07 7.07 1.41-1.41L1.41 1.69zM12 4c2.42 0 4.61.96 6.21 2.51l1.43-1.43C17.73 3.28 15.01 2 12 2c-1.76 0-3.41.46-4.86 1.25l1.46 1.46C9.61 4.27 10.77 4 12 4z"/></svg>`,
    episodes:  `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6zm16-4H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-8 12.5v-9l6 4.5-6 4.5z"/></svg>`,
  };

  /* ─── TEXT → ICON MAPPING (German + English) ─────────────────────────── */
  const TEXT_MAP = {
    'Startseite': 'home',        'Home': 'home',
    'Favoriten': 'favorite',     'Favorites': 'favorite',
    'Watchlist': 'watchlist',    'Watch List': 'watchlist',
    'Bookmarks': 'bookmarks',    'Lesezeichen': 'bookmarks',
    'Serien': 'tv',              'Series': 'tv',
    'Filme': 'movie',            'Movies': 'movie',
    'Vorschläge': 'suggest',     'Suggestions': 'suggest',     'Empfehlungen': 'suggest',
    'Demnächst': 'upcoming',     'Upcoming': 'upcoming',       'Nächste': 'upcoming',
    'Genres': 'genre',           'Genre': 'genre',
    'Zufällig': 'shuffle',       'Random': 'shuffle',          'Shuffle': 'shuffle',
    'Studios': 'studio',         'Studio': 'studio',
    'Sammlungen': 'collections', 'Collections': 'collections', 'Kollektion': 'collections',
    'Fernsehsender': 'network',  'Networks': 'network',        'Sender': 'network',
    'Folgen': 'episodes',        'Episodes': 'episodes',
    'Musik': 'music',            'Music': 'music',
    'Fotos': 'photo',            'Photos': 'photo',            'Bilder': 'photo',
    'Live TV': 'livetv',         'Live-TV': 'livetv',
    'Senderführer': 'guide',     'Guide': 'guide',             'TV-Programm': 'guide',
    'Jahre': 'year',             'Years': 'year',              'Jahrgang': 'year',
    'Personen': 'person',        'Schauspieler': 'person',     'Persons': 'person',
  };

  /* ─── CSS ─────────────────────────────────────────────────────────────── */
  const css = `
    .emby-tab-button {
      display: inline-flex !important;
      flex-direction: column !important;
      align-items: center !important;
      justify-content: center !important;
      gap: 4px !important;
      padding: 8px 18px !important;
    }
    .jf-tab-icon {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 22px;
      height: 22px;
      opacity: 0.65;
      transition: opacity 0.2s ease, transform 0.2s ease;
      flex-shrink: 0;
    }
    .jf-tab-icon svg {
      width: 22px;
      height: 22px;
      fill: currentColor;
      display: block;
    }
    .emby-tab-button-active .jf-tab-icon,
    .emby-tab-button:hover   .jf-tab-icon {
      opacity: 1;
      transform: scale(1.12);
    }
    .emby-tab-button > span:not(.jf-tab-icon),
    .emby-tab-button > .emby-button-text {
      display: block;
      line-height: 1.2;
    }
  `;

  (typeof GM_addStyle !== 'undefined')
    ? GM_addStyle(css)
    : (() => {
        const s = document.createElement('style');
        s.id = 'jf-tab-icons-style';
        s.textContent = css;
        (document.head || document.documentElement).appendChild(s);
      })();

  /* ─── TABS TO HIDE COMPLETELY ─────────────────────────────────────────── */
  const HIDDEN_ALWAYS = new Set([
    'Fernsehsender', 'Networks', 'Sender',
  ]);

  const HIDDEN_ON_PAGE = {
    'collectionType=movies': new Set(['Watchlist', 'Watch List', 'Sammlungen', 'Collections']),
  };

  function shouldHide(label) {
    if (HIDDEN_ALWAYS.has(label)) return true;
    const url = window.location.href;
    for (const [param, set] of Object.entries(HIDDEN_ON_PAGE)) {
      if (url.includes(param) && set.has(label)) return true;
    }
    return false;
  }

  /* ─── GET CLEAN LABEL (strips icon-font Private Use Area glyphs) ──────── */
  function getCleanLabel(btn) {
    let text = '';
    btn.childNodes.forEach(node => {
      if (node.nodeType === Node.TEXT_NODE) {
        // Direct text node – take it
        text += node.textContent;
      } else if (node.nodeType === Node.ELEMENT_NODE &&
                 !node.classList.contains('jf-tab-icon') &&
                 node.tagName !== 'I' &&
                 node.tagName !== 'SVG') {
        // Child element that is NOT our icon span and NOT a <i> icon glyph
        text += node.textContent || '';
      }
    });
    // Remove Unicode Private Use Area characters (icon fonts use E000–F8FF)
    return text
      .replace(/[\uE000-\uF8FF]/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  }

  /* ─── ADD ICON TO ONE BUTTON ──────────────────────────────────────────── */
  function decorateButton(btn) {
    if (btn.dataset.jfIconDone) return;
    if (btn.querySelector('.jf-tab-icon')) {
      btn.dataset.jfIconDone = 'skip';
      return;
    }

    const label = getCleanLabel(btn);  // ← use clean label instead of textContent

    if (shouldHide(label)) {
      btn.style.setProperty('display', 'none', 'important');
      btn.dataset.jfIconDone = 'hidden';
      return;
    }

    const iconKey = TEXT_MAP[label];
    if (!iconKey || !ICONS[iconKey]) {
      btn.dataset.jfIconDone = 'no-match';
      return;
    }

    const wrap = document.createElement('span');
    wrap.className = 'jf-tab-icon';
    wrap.setAttribute('aria-hidden', 'true');
    wrap.innerHTML = ICONS[iconKey];
    btn.insertBefore(wrap, btn.firstChild);
    btn.dataset.jfIconDone = 'done';
  }

  /* ─── PROCESS ALL VISIBLE BUTTONS ────────────────────────────────────── */
  function processAll() {
    document.querySelectorAll('.emby-tab-button').forEach(btn => {
      if (btn.dataset.jfIconDone === 'hidden') {
        const label = getCleanLabel(btn);
        if (!shouldHide(label)) {
          btn.style.removeProperty('display');
          delete btn.dataset.jfIconDone;
        }
      }
      decorateButton(btn);
    });
  }

  // SPA URL-change detection
  let lastUrl = location.href;
  new MutationObserver(() => {
    if (location.href !== lastUrl) {
      lastUrl = location.href;
      document.querySelectorAll('.emby-tab-button[data-jf-icon-done="hidden"]').forEach(btn => {
        delete btn.dataset.jfIconDone;
      });
      processAll();
    }
  }).observe(document, { subtree: true, childList: true });

  const observer = new MutationObserver(() => processAll());
  observer.observe(document.documentElement, { childList: true, subtree: true });

  processAll();
  setTimeout(processAll, 800);
  setTimeout(processAll, 2000);

})();
