/* ══════════════════════════════════════════════════════════
   Search Filter – Episoden ausblenden
   Nur Filme & Serien in den Suchergebnissen anzeigen
   ══════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  /* ── 1. API-Interceptor: Episode aus fetch-Antworten entfernen ───────────
     Jellyfin lädt Suchergebnisse via fetch(/Items?...).
     Wir patchen fetch so, dass Items mit Type "Episode" herausgefiltert
     werden, bevor sie die UI erreichen.                                    */
  var _origFetch = window.fetch;
  window.fetch = function (input, init) {
    return _origFetch.apply(this, arguments).then(function (response) {
      var url = (typeof input === 'string' ? input : (input && input.url)) || '';

      /* Nur Such-Endpunkte anfassen */
      var isSearch = /\/Items(\?|$)/.test(url) || /\/Search\/Hints/.test(url);
      if (!isSearch) return response;

      /* Response klonen (body kann nur einmal gelesen werden) */
      var clone = response.clone();
      return clone.json().then(function (data) {
        if (!data) return response;

        /* /Items – Array in data.Items */
        if (Array.isArray(data.Items)) {
          var before = data.Items.length;
          data.Items = data.Items.filter(function (item) {
            return item.Type !== 'Episode';
          });
          data.TotalRecordCount = (data.TotalRecordCount || before) - (before - data.Items.length);
        }

        /* /Search/Hints – Array in data.SearchHints */
        if (Array.isArray(data.SearchHints)) {
          data.SearchHints = data.SearchHints.filter(function (item) {
            return item.Type !== 'Episode';
          });
          data.TotalRecordCount = data.SearchHints.length;
        }

        /* Neue Response mit gefiltertem Body zurückgeben */
        var newBody = JSON.stringify(data);
        var newResponse = new Response(newBody, {
          status:     response.status,
          statusText: response.statusText,
          headers:    response.headers
        });
        return newResponse;
      }).catch(function () {
        /* Kein JSON (z.B. Bild) → Original zurückgeben */
        return response;
      });
    });
  };

  /* ── 2. DOM-Filter: Episoden-Sektionen im Suchergebnis verstecken ────────
     Jellyfin gruppiert Suchergebnisse in Sektionen mit einem Header-Text.
     Wir suchen nach Sektionen die "Episode" im Titel haben und
     verstecken diese komplett.                                             */
  var style = document.createElement('style');
  style.textContent = `
    /* Fallback: Episoden-Sektion via CSS verstecken */
    .searchResults .verticalSection:has(h2.sectionTitle),
    .itemsContainer[data-type="Episode"] {
      display: none !important;
    }
  `;
  document.head.appendChild(style);

  function hideEpisodeSections() {
    /* Alle Sektions-Header durchsuchen */
    document.querySelectorAll(
      '.sectionTitle, .listHeader, h1, h2, h3, .sectionTitleContainer'
    ).forEach(function (header) {
      var text = header.textContent || '';
      /* Deutsch & Englisch abdecken */
      if (/episode|folgen|episoden/i.test(text)) {
        /* Übergeordneten Container verstecken */
        var section =
          header.closest('.verticalSection') ||
          header.closest('.section') ||
          header.closest('[data-type]') ||
          header.parentElement;
        if (section) {
          section.style.display = 'none';
        }
      }
    });

    /* Einzelne Karten mit Episode-Typ verstecken */
    document.querySelectorAll(
      '[data-type="Episode"], .card[data-itemtype="Episode"]'
    ).forEach(function (card) {
      var wrap = card.closest('.cardBox') || card.closest('li') || card;
      wrap.style.display = 'none';
    });
  }

  /* MutationObserver – greift bei jeder DOM-Änderung (Suchergebnisse laden) */
  var observer = new MutationObserver(function (mutations) {
    /* Nur ausführen wenn wir auf der Suchseite sind */
    if (!/search/i.test(window.location.href) &&
        !document.querySelector('.searchPage, .searchResults, #searchPage')) {
      return;
    }
    hideEpisodeSections();
  });

  observer.observe(document.body, { childList: true, subtree: true });

  /* Sofort beim Laden einmal ausführen */
  hideEpisodeSections();

  console.log('[SearchFilter] Episoden aus Suchergebnissen ausgeblendet ✓');
})();
