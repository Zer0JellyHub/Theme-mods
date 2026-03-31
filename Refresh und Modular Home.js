// ==UserScript==
// @name         Jellyfin Sidebar Tools
// @namespace    jellyfin-sidebar-tools
// @version      1.3
// @description  Neu laden Button + ModularHome verstecken
// @author       Custom
// @match        *://*/web/*
// @match        *://*/web/#*
// @grant        none
// @run-at       document-idle
// ==/UserScript==

(function () {

  /* ── 1) ModularHome Links verstecken ─────────────────────────── */
  function hideModularHome() {
    document.querySelectorAll('a.lnkMenuOption, .navMenuOption').forEach(link => {
      if (link.href && link.href.includes('ModularHomeViews')) {
        link.style.setProperty('display', 'none', 'important');
      }
    });
  }

  document.addEventListener('viewshow', () => setTimeout(hideModularHome, 500));
  hideModularHome();

  /* ── 2) "Neu laden" Button in der Sidebar ─────────────────────── */
  const BTN_ID   = 'jfi-sidebar-refresh';
  const STYLE_ID = 'jfi-sidebar-refresh-style';

  function inject() {
    if (document.getElementById(BTN_ID)) return;
    const scrollContainer = document.querySelector('.mainDrawer-scrollContainer');
    if (!scrollContainer) return;

    // Padding eines echten Sidebar-Links messen
    const existingItem = scrollContainer.querySelector('a[href], button:not(#' + BTN_ID + ')');
    let detectedPadding = '1.8em';
    if (existingItem) {
      const cs = window.getComputedStyle(existingItem);
      detectedPadding = cs.paddingInlineStart || cs.paddingLeft || '1.8em';
    }

    if (!document.getElementById(STYLE_ID)) {
      const style = document.createElement('style');
      style.id = STYLE_ID;
      style.textContent = `
        #jfi-sidebar-refresh {
          display: flex;
          align-items: center;
          cursor: pointer;
          color: rgba(255,255,255,0.7);
          font-size: inherit;
          font-family: inherit;
          background: none;
          border: none;
          width: 100%;
          text-align: left;
          height: 3.5em;
          padding-inline-start: ${detectedPadding};
          padding-inline-end: 1em;
          box-sizing: border-box;
        }
        #jfi-sidebar-refresh:hover {
          color: #fff;
          background: rgba(255,255,255,0.08);
        }
        #jfi-sidebar-refresh:active .jfi-refresh-icon {
          transform: rotate(180deg);
        }
        .jfi-refresh-icon {
          width: 1.5em;
          height: 1.5em;
          margin-inline-end: 1.1em;
          flex-shrink: 0;
          transition: transform 0.3s;
          opacity: 0.7;
        }
        #jfi-sidebar-refresh:hover .jfi-refresh-icon {
          opacity: 1;
        }
      `;
      document.head.appendChild(style);
    }

    const btn = document.createElement('button');
    btn.id = BTN_ID;
    btn.innerHTML = `
      <svg class="jfi-refresh-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
           stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M23 4v6h-6"/>
        <path d="M1 20v-6h6"/>
        <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10"/>
        <path d="M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
      </svg>
      <span>Neu laden</span>
    `;
    btn.addEventListener('click', () => window.location.reload());
    scrollContainer.appendChild(btn);
  }

  setTimeout(inject, 1000);
  const observer = new MutationObserver(() => {
    if (!document.getElementById(BTN_ID)) setTimeout(inject, 800);
    hideModularHome();
  });
  observer.observe(document.body, { childList: true, subtree: true });

})();
