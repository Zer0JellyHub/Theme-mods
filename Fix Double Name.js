/* Deutsche Duplikat-Sektionen ausblenden – MyMedia bleibt */
(function () {
  var GERMAN = [
    'kürzlich hinzugefügte filme',
    'kürzlich hinzugefügte serien',
    'kürzlich hinzugefügt',
    'neueste serien',
    'neueste filme',
    'erneut ansehen',
    'weiterschauen',
    'nächste folge',
    'neueste folgen',
  ];

  function hideGerman() {
    document.querySelectorAll('.verticalSection, .emby-scroller-container').forEach(function (section) {
      // MyMedia (Filme/Serien Kacheln ganz oben) NIE anfassen
      if (section.classList.contains('MyMedia') ||
          section.classList.contains('section0') ||
          section.querySelector('.myMediaButton, .squareCard')) return;

      var title = section.querySelector('h2.sectionTitle, .sectionTitle, h2');
      if (!title) return;
      var text = title.textContent.trim().toLowerCase();
      if (GERMAN.some(function(g){ return text === g; })) {
        section.style.setProperty('display', 'none', 'important');
      }
    });
  }

  hideGerman();
  new MutationObserver(hideGerman).observe(document.body, { childList: true, subtree: true });
  setInterval(hideGerman, 2000);

  console.log('[HideGerman] Mod geladen ✓');
})();
