/**
 * 🙈 Apps-Label Mod für Jellyfin TheHub
 * Blendet div.jf-app-header (das "Apps"-Wort) dauerhaft aus.
 */
(function () {
  'use strict';
  function hideAppsLabel() {
    document.querySelectorAll('.jf-app-header').forEach(el => {
      if (!el.dataset.rfLabelHidden) {
        el.style.setProperty('display', 'none', 'important');
        el.dataset.rfLabelHidden = '1';
      }
    });
  }
  hideAppsLabel();
  const observer = new MutationObserver(hideAppsLabel);
  observer.observe(document.body, { childList: true, subtree: true });
  console.log('[AppsLabel] Mod geladen ✓');
})();
