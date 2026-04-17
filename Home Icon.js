/* ══════════════════════════════════════════════════════════
   Jellyfin Custom – Header Reorder + Button Injector
   ══════════════════════════════════════════════════════════ */

/* ── 1) BUTTON INJECTOR (Lupe + Request-Modal) ── */
(function () {
  "use strict";

  var CONTAINER_ID = "jbi-container";
  var STYLE_ID     = "jbi-styles";
  var OVERLAY_ID   = "jbi-search-overlay";

  var CSS = [
    '#headerSearchField  { display:none!important; width:0!important; height:0!important; overflow:hidden!important; pointer-events:none!important; position:absolute!important; left:-9999px!important; }',
    '#requestMediaBtn    { display:none!important; }',
    '#jbi-container { display:inline-flex; align-items:center; gap:0; flex-shrink:0; }',
    '.jbi-btn { position:relative!important; display:inline-flex!important; align-items:center!important; justify-content:center!important; top:auto!important; right:auto!important; width:40px; height:40px; padding:0!important; border:none!important; border-radius:50%!important; background:transparent!important; cursor:pointer!important; outline:none!important; transition:background 0.15s ease; transform:none!important; }',
    '.jbi-btn:hover  { background:rgba(255,255,255,0.1)!important; }',
    '.jbi-btn:active { background:rgba(255,255,255,0.18)!important; }',
    '.jbi-btn svg { width:22px; height:22px; fill:none; stroke:rgba(255,255,255,0.87); stroke-width:1.8; stroke-linecap:round; stroke-linejoin:round; display:block; transition:stroke 0.15s; }',
    '.jbi-btn:hover svg { stroke:#fff; }',
    '#jbi-search-overlay { display:none; position:fixed!important; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.8)!important; z-index:100999!important; align-items:flex-start; justify-content:center; padding-top:80px; box-sizing:border-box; }',
    '#jbi-search-overlay.show { display:flex; }',
    '#jbi-search-modal { background:#1c1c1c; border-radius:8px; padding:28px 32px 32px; width:90%; max-width:560px; position:relative; box-shadow:0 8px 40px rgba(0,0,0,0.7); }',
    '#jbi-search-title { font-size:24px; font-weight:600; color:#fff; margin:0 0 20px; font-family:-apple-system,sans-serif; }',
    '#jbi-search-close { position:absolute; top:12px; right:14px; background:none; border:none; color:rgba(255,255,255,0.6); font-size:22px; cursor:pointer; padding:4px 8px; border-radius:4px; line-height:1; }',
    '#jbi-search-close:hover { color:#fff; background:rgba(255,255,255,0.1); }',
    '#jbi-input-row { display:flex; align-items:center; background:#2a2a2a; border:1px solid rgba(255,255,255,0.12); border-radius:6px; padding:0 12px; }',
    '#jbi-input-row:focus-within { border-color:rgba(255,255,255,0.35); }',
    '#jbi-input-row svg { width:18px; height:18px; flex-shrink:0; stroke:rgba(255,255,255,0.4); stroke-width:1.8; stroke-linecap:round; fill:none; }',
    '#jbi-search-input { flex:1; background:none; border:none; color:#fff; font-size:16px; padding:13px 10px; outline:none; }',
    '#jbi-search-input::placeholder { color:rgba(255,255,255,0.3); }',
    '#jbi-dropdown-wrap { position:relative; width:100%; }',
    '#jbi-dropdown-wrap #searchDropdown { position:relative!important; top:auto!important; left:auto!important; width:100%!important; max-height:320px; overflow-y:auto; background:#252525!important; border:1px solid rgba(255,255,255,0.1)!important; border-top:none!important; border-radius:0 0 6px 6px!important; }'
  ].join('\n');

  var SEARCH_SVG  = '<svg viewBox="0 0 24 24"><circle cx="10.5" cy="10.5" r="6.5"/><line x1="15.5" y1="15.5" x2="21" y2="21"/></svg>';
  var REQUEST_SVG = '<svg viewBox="0 0 24 24"><path d="M6 4.5L6 19.5L19.5 12Z" stroke-linejoin="round"/><circle cx="19" cy="5" r="4.5" fill="#1c1c1c" stroke="rgba(255,255,255,0.87)" stroke-width="1.4"/><line x1="19" y1="2.5" x2="19" y2="7.5" stroke-width="1.6"/><line x1="16.5" y1="5" x2="21.5" y2="5" stroke-width="1.6"/></svg>';

  var overlayEl = null, dropdownWrap = null;

  function hideNativeSearch() {
    var f = document.getElementById('headerSearchField');
    if (!f) return;
    f.style.setProperty('display','none','important');
    f.style.setProperty('width','0','important');
    f.style.setProperty('height','0','important');
    f.style.setProperty('overflow','hidden','important');
    f.style.setProperty('pointer-events','none','important');
    f.style.setProperty('position','absolute','important');
    f.style.setProperty('left','-9999px','important');
  }

  function openOverlay() {
    if (!document.getElementById(OVERLAY_ID)) {
      overlayEl = document.createElement("div");
      overlayEl.id = OVERLAY_ID;
      overlayEl.innerHTML = '<div id="jbi-search-modal">'
        + '<button id="jbi-search-close">\xd7</button>'
        + '<div id="jbi-search-title">Suche</div>'
        + '<div id="jbi-input-row">'
        + '<svg viewBox="0 0 24 24"><circle cx="10.5" cy="10.5" r="6.5"/><line x1="15.5" y1="15.5" x2="21" y2="21"/></svg>'
        + '<input id="jbi-search-input" type="text" placeholder="Titel suchen..." autocomplete="off" spellcheck="false"/>'
        + '</div><div id="jbi-dropdown-wrap"></div></div>';
      document.body.appendChild(overlayEl);
      dropdownWrap = document.getElementById("jbi-dropdown-wrap");

      document.getElementById("jbi-search-input").addEventListener("input", function() {
        var q = this.value;
        var ni = document.getElementById("headerSearchInput");
        var nf = document.getElementById("headerSearchField");
        if (!ni) return;
        if (nf) nf.style.cssText = "display:block!important;opacity:0!important;position:absolute!important;left:-9999px!important;";
        ni.value = q;
        ni.dispatchEvent(new Event("input",{bubbles:true}));
        ni.dispatchEvent(new Event("change",{bubbles:true}));
        setTimeout(function(){
          var dd = document.getElementById("searchDropdown");
          if (dd && dropdownWrap && !dropdownWrap.contains(dd)) { dropdownWrap.appendChild(dd); dd.style.cssText=""; }
        }, 80);
      });
      document.getElementById("jbi-search-input").addEventListener("keydown", function(e) {
        if (e.key==="Enter") { var q=this.value.trim(); if(q){closeOverlay();window.location.href='/web/#/search.html?query='+encodeURIComponent(q);} }
        if (e.key==="Escape") closeOverlay();
      });
      document.getElementById("jbi-search-close").addEventListener("click", closeOverlay);
      overlayEl.addEventListener("click", function(e){ if(e.target===overlayEl) closeOverlay(); });
    }
    document.getElementById(OVERLAY_ID).classList.add("show");
    setTimeout(function(){ var i=document.getElementById("jbi-search-input"); if(i){i.value="";i.focus();} }, 60);
  }

  function closeOverlay() {
    var ov = document.getElementById(OVERLAY_ID);
    if (ov) ov.classList.remove("show");
    var dd = document.getElementById("searchDropdown");
    if (dd && dropdownWrap && dropdownWrap.contains(dd)) { document.body.appendChild(dd); dd.style.display="none"; }
    hideNativeSearch();
    var ni = document.getElementById("headerSearchInput");
    if (ni) { ni.value=""; ni.dispatchEvent(new Event("input",{bubbles:true})); }
  }

  function doRequest() {
    var b = document.getElementById("requestMediaBtn");
    if (b) { b.click(); return; }
    var m = document.getElementById("requestMediaModal");
    if (m) { m.classList.add("show"); m.style.display="flex"; }
  }

  function makeBtn(id, svg, tip, fn) {
    var b = document.createElement("button");
    b.type="button"; b.id=id; b.className="jbi-btn"; b.title=tip; b.innerHTML=svg;
    b.addEventListener("click", function(e){ e.stopPropagation(); fn(); });
    return b;
  }

  function inject() {
    if (document.getElementById(CONTAINER_ID)) return;
    var target = document.querySelector(".headerRight") || document.querySelector(".headerTop");
    if (!target) return;
    var c = document.createElement("div");
    c.id = CONTAINER_ID;
    c.appendChild(makeBtn("jbi-search-btn",  SEARCH_SVG,  "Suche",           openOverlay));
    c.appendChild(makeBtn("jbi-request-btn", REQUEST_SVG, "Medien anfordern", doRequest));
    target.appendChild(c);
  }

  function init() {
    if (!document.getElementById(STYLE_ID)) {
      var s=document.createElement("style"); s.id=STYLE_ID; s.textContent=CSS; document.head.appendChild(s);
    }
    inject(); hideNativeSearch();
    var f=document.getElementById('headerSearchField');
    if(f) new MutationObserver(hideNativeSearch).observe(f,{attributes:true,attributeFilter:['style','class']});
  }

  setTimeout(init, document.readyState==="loading" ? 1500 : 900);
  setTimeout(function(){ hideNativeSearch(); }, 3000);
  var obs = new MutationObserver(function(){ if(!document.getElementById(CONTAINER_ID)) inject(); hideNativeSearch(); });
  if (document.body) obs.observe(document.body,{childList:true,subtree:false});
  else document.addEventListener("DOMContentLoaded", function(){ obs.observe(document.body,{childList:true,subtree:false}); });

})();


/* ── 2) HEADER REORDER + DREIECK-MENÜ ── */
(function () {
  'use strict';

  /* ── Pill: symmetrisch, Buttons ohne extra Margin ── */
  var PILL_BASE = [
    'display:none',
    'position:fixed',
    'background:rgba(22,23,34,0.97)',
    'border:1px solid rgba(255,255,255,0.16)',
    'border-radius:999px',
    'padding:4px 4px',
    'flex-direction:row',
    'align-items:center',
    'justify-content:center',
    'gap:0',
    'z-index:9999999',
    'box-shadow:0 8px 28px rgba(0,0,0,0.65)',
    'white-space:nowrap',
    'min-width:max-content',
    'box-sizing:border-box'
  ].join(';') + ';';

  function positionBelow(popup, refEl, alignRight) {
    var rect = refEl.getBoundingClientRect();
    popup.style.top = (rect.bottom + 6) + 'px';
    if (alignRight) {
      popup.style.right     = (window.innerWidth - rect.right) + 'px';
      popup.style.left      = 'auto';
      popup.style.transform = 'none';
    } else {
      popup.style.left      = (rect.left + rect.width / 2) + 'px';
      popup.style.right     = 'auto';
      popup.style.transform = 'translateX(-50%)';
    }
  }

  if (!document.querySelector('#jf-header-style')) {
    var s = document.createElement('style');
    s.id = 'jf-header-style';
    s.textContent = [
      '#chatBtn, #ratingsButtonGroup {',
      '  display:none!important; visibility:hidden!important;',
      '  width:0!important; height:0!important; min-width:0!important; min-height:0!important;',
      '  padding:0!important; margin:0!important; border:none!important;',
      '  overflow:hidden!important; pointer-events:none!important;',
      '  position:absolute!important; left:-9999px!important; opacity:0!important;',
      '}',
      '#jf-pill #chatBtn {',
      '  display:inline-flex!important; visibility:visible!important;',
      '  width:40px!important; height:40px!important; min-width:40px!important;',
      '  padding:0!important; margin:0!important; position:relative!important;',
      '  left:auto!important; opacity:1!important; pointer-events:auto!important;',
      '  flex-shrink:0!important;',
      '}',
      '#jf-pill > *,',
      '#jf-pill button {',
      '  flex-shrink:0!important;',
      '  margin:0!important;',
      '}',
      '.headerAudioPlayerButton  { display:none!important; }',
      'span.headerSelectedPlayer { display:none!important; }',
      '#randomItemButtonContainer {',
      '  display:none!important;',
      '}',
      '#jf-wuerfel-btn:hover { background:rgba(255,255,255,0.1)!important; }',
      '#jf-tri-badge {',
      '  position:absolute; top:-3px; right:-5px;',
      '  background:#e53935; color:#fff; font-size:9px; font-weight:700;',
      '  font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;',
      '  min-width:14px; height:14px; border-radius:7px;',
      '  display:none; align-items:center; justify-content:center;',
      '  padding:0 3px; pointer-events:none; line-height:1; z-index:2;',
      '}'
    ].join('\n');
    document.head.appendChild(s);
  }

  function forceHideChatBtn() {
    var el = document.getElementById('chatBtn');
    if (!el || el.closest('#jf-pill')) return;
    el.style.setProperty('display','none','important');
    el.style.setProperty('visibility','hidden','important');
    el.style.setProperty('width','0','important');
    el.style.setProperty('height','0','important');
    el.style.setProperty('pointer-events','none','important');
    el.style.setProperty('position','absolute','important');
    el.style.setProperty('left','-9999px','important');
    el.style.setProperty('opacity','0','important');
  }

  var chatHideObs = new MutationObserver(forceHideChatBtn);
  function watchChatBtn() {
    var el = document.getElementById('chatBtn');
    if (el) { forceHideChatBtn(); chatHideObs.observe(el,{attributes:true,attributeFilter:['style']}); }
  }
  setInterval(function(){ forceHideChatBtn(); watchChatBtn(); }, 1000);
  setTimeout(watchChatBtn, 500);
  setTimeout(watchChatBtn, 2000);

  /* ════════════ WUERFEL ════════════ */
  function buildWuerfel() {
    if (document.getElementById('jf-wuerfel-wrap')) return document.getElementById('jf-wuerfel-wrap');

    function loadSettings() { try { return JSON.parse(localStorage.getItem('jf-wuerfel-cfg')||'{}'); } catch(e){ return {}; } }
    function saveSettings(cfg) { try { localStorage.setItem('jf-wuerfel-cfg', JSON.stringify(cfg)); } catch(e){} }

    var wrap = document.createElement('div');
    wrap.id = 'jf-wuerfel-wrap';
    wrap.style.cssText = 'position:relative;display:inline-flex;align-items:center;flex-shrink:0;';

    var btn = document.createElement('button');
    btn.id = 'jf-wuerfel-btn';
    btn.title = 'Zuf\xe4lliges Medium';
    btn.style.cssText = 'display:inline-flex;align-items:center;justify-content:center;width:40px;height:40px;background:none;border:none;outline:none;cursor:pointer;border-radius:50%;transition:background 0.2s;flex-shrink:0;padding:0;';
    btn.innerHTML = '<svg width="24" height="24" viewBox="0 0 24 24">'
      + '<rect x="2" y="2" width="20" height="20" rx="3.5" fill="rgba(255,255,255,0.87)"/>'
      + '<circle cx="7"  cy="7"  r="1.6" fill="rgba(22,23,34,0.95)"/>'
      + '<circle cx="17" cy="7"  r="1.6" fill="rgba(22,23,34,0.95)"/>'
      + '<circle cx="12" cy="12" r="1.6" fill="rgba(22,23,34,0.95)"/>'
      + '<circle cx="7"  cy="17" r="1.6" fill="rgba(22,23,34,0.95)"/>'
      + '<circle cx="17" cy="17" r="1.6" fill="rgba(22,23,34,0.95)"/>'
      + '</svg>';
    btn.onmouseover = function(){ btn.style.background='rgba(255,255,255,0.1)'; };
    btn.onmouseout  = function(){ btn.style.background='none'; };

    var popup = document.createElement('div');
    popup.id = 'jf-wuerfel-popup';
    popup.style.cssText = PILL_BASE;

    function fetchRandom(types) {
      var cfg = loadSettings();
      var ac = window.ApiClient; if (!ac) return;
      var userId = ac._currentUserId || (ac.getCurrentUserId && ac.getCurrentUserId());
      var token  = ac._token || (ac.accessToken && ac.accessToken());
      if (!userId || !token) return;
      var url = '/Items?SortBy=Random&Limit=1&Recursive=true&IncludeItemTypes=' + types + '&UserId=' + userId;
      if (cfg.minRating && cfg.minRating > 0) url += '&MinCommunityRating=' + cfg.minRating;
      if (cfg.genres && cfg.genres.length > 0) url += '&Genres=' + encodeURIComponent(cfg.genres.join('|'));
      fetch(url, { headers: { 'X-Emby-Token': token } })
        .then(function(r){ return r.json(); })
        .then(function(d){ var item = d.Items && d.Items[0]; if (item) window.location.href = '/web/#/details?id=' + item.Id; });
    }

    function makeDiceBtn(letter, tooltip, types) {
      var b = document.createElement('button');
      b.title = tooltip;
      b.style.cssText = 'display:inline-flex;align-items:center;justify-content:center;width:40px;height:40px;background:none;border:none;outline:none;cursor:pointer;border-radius:50%;transition:background 0.15s;padding:0;flex-shrink:0;';
      b.innerHTML = '<svg width="26" height="26" viewBox="0 0 26 26" fill="none">'
        + '<rect x="2" y="2" width="22" height="22" rx="4" stroke="rgba(255,255,255,0.87)" stroke-width="1.8"/>'
        + '<text x="13" y="17.5" text-anchor="middle" font-family="-apple-system,BlinkMacSystemFont,sans-serif" font-size="12" font-weight="700" fill="rgba(255,255,255,0.87)">' + letter + '</text>'
        + '</svg>';
      b.onmouseover = function(){ b.style.background='rgba(255,255,255,0.1)'; };
      b.onmouseout  = function(){ b.style.background='none'; };
      b.addEventListener('click', function(e){
        e.stopPropagation();
        popup.style.display = 'none'; popupOpen = false;
        fetchRandom(types);
      });
      return b;
    }

    var settingsModal = null;
    function openSettings() {
      if (settingsModal) { settingsModal.style.display='flex'; loadGenres(); return; }
      var cfg = loadSettings();
      settingsModal = document.createElement('div');
      settingsModal.style.cssText = 'display:flex;position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.75);z-index:9999999;align-items:center;justify-content:center;box-sizing:border-box;';
      var box = document.createElement('div');
      box.style.cssText = 'background:#1e1e2e;border:1px solid rgba(255,255,255,0.15);border-radius:12px;padding:24px 28px;width:92%;max-width:420px;color:#fff;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;box-shadow:0 12px 48px rgba(0,0,0,0.8);position:relative;max-height:80vh;overflow-y:auto;';
      box.innerHTML = ''
        + '<button id="jf-cfg-close" style="position:absolute;top:10px;right:14px;background:none;border:none;color:rgba(255,255,255,0.5);font-size:20px;cursor:pointer;padding:4px 8px;border-radius:4px;">\xd7</button>'
        + '<h3 style="margin:0 0 18px;font-size:17px;font-weight:600;">\u2699 Zufalls-Einstellungen</h3>'
        + '<label style="display:block;margin-bottom:6px;font-size:13px;color:rgba(255,255,255,0.7);">Mindestbewertung: <span id="jf-cfg-rating-val">' + (cfg.minRating||1) + '</span> \u2605</label>'
        + '<input id="jf-cfg-rating" type="range" min="1" max="10" step="0.5" value="' + (cfg.minRating||1) + '" style="width:100%;accent-color:#7c6af7;margin-bottom:20px;">'
        + '<div style="font-size:13px;color:rgba(255,255,255,0.7);margin-bottom:8px;">Genres <span style="font-size:11px;opacity:0.5;">(leer = alle)</span></div>'
        + '<div id="jf-cfg-genres" style="display:flex;flex-wrap:wrap;gap:6px;margin-bottom:20px;min-height:32px;"><span style="opacity:0.4;font-size:12px;">Laden\u2026</span></div>'
        + '<button id="jf-cfg-save" style="width:100%;padding:10px;background:#7c6af7;border:none;border-radius:8px;color:#fff;font-size:14px;font-weight:600;cursor:pointer;">Speichern</button>';
      settingsModal.appendChild(box);
      document.body.appendChild(settingsModal);

      var slider = document.getElementById('jf-cfg-rating');
      var ratingVal = document.getElementById('jf-cfg-rating-val');
      slider.addEventListener('input', function(){ ratingVal.textContent = this.value; });
      document.getElementById('jf-cfg-save').addEventListener('click', function(){
        var selected = [];
        box.querySelectorAll('.jf-genre-chip.active').forEach(function(c){ selected.push(c.dataset.genre); });
        saveSettings({ minRating: parseFloat(slider.value), genres: selected });
        settingsModal.style.display = 'none';
      });
      document.getElementById('jf-cfg-close').addEventListener('click', function(){ settingsModal.style.display='none'; });
      settingsModal.addEventListener('click', function(e){ if(e.target===settingsModal) settingsModal.style.display='none'; });
      loadGenres();
    }

    function loadGenres() {
      var ac = window.ApiClient; if (!ac) return;
      var userId = ac._currentUserId || (ac.getCurrentUserId && ac.getCurrentUserId());
      var token  = ac._token || (ac.accessToken && ac.accessToken());
      var container = document.getElementById('jf-cfg-genres');
      if (!container || container.querySelector('.jf-genre-chip')) return;
      var cfg = loadSettings();
      fetch('/Genres?UserId=' + userId + '&SortBy=SortName&Recursive=true&IncludeItemTypes=Movie,Series', { headers: { 'X-Emby-Token': token } })
        .then(function(r){ return r.json(); })
        .then(function(d){
          container.innerHTML = '';
          (d.Items||[]).forEach(function(g){
            var isActive = cfg.genres && cfg.genres.indexOf(g.Name) > -1;
            var chip = document.createElement('button');
            chip.className = 'jf-genre-chip' + (isActive ? ' active' : '');
            chip.dataset.genre = g.Name;
            chip.textContent = g.Name;
            chip.style.cssText = 'padding:4px 10px;border-radius:999px;border:1px solid ' + (isActive ? '#7c6af7' : 'rgba(255,255,255,0.25)') + ';background:' + (isActive ? '#7c6af7' : 'transparent') + ';color:#fff;font-size:12px;cursor:pointer;transition:all 0.15s;';
            chip.addEventListener('click', function(e){
              e.stopPropagation();
              chip.classList.toggle('active');
              chip.style.background  = chip.classList.contains('active') ? '#7c6af7' : 'transparent';
              chip.style.borderColor = chip.classList.contains('active') ? '#7c6af7' : 'rgba(255,255,255,0.25)';
            });
            container.appendChild(chip);
          });
        });
    }

    var gearBtn = document.createElement('button');
    gearBtn.title = 'Einstellungen';
    gearBtn.style.cssText = 'display:inline-flex;align-items:center;justify-content:center;width:36px;height:40px;background:none;border:none;outline:none;cursor:pointer;border-radius:50%;color:rgba(255,255,255,0.5);transition:color 0.15s;padding:0;flex-shrink:0;';
    gearBtn.innerHTML = '<svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor"><path d="M19.14 12.94c.04-.3.06-.61.06-.94s-.02-.64-.07-.94l2.03-1.58a.49.49 0 00.12-.61l-1.92-3.32a.49.49 0 00-.59-.22l-2.39.96a7.02 7.02 0 00-1.62-.94l-.36-2.54a.484.484 0 00-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87a.49.49 0 00.12.61l2.03 1.58c-.05.3-.07.62-.07.94s.02.64.07.94l-2.03 1.58a.49.49 0 00-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.37 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.57 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32a.49.49 0 00-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z"/></svg>';
    gearBtn.onmouseover = function(){ gearBtn.style.color='rgba(255,255,255,0.9)'; };
    gearBtn.onmouseout  = function(){ gearBtn.style.color='rgba(255,255,255,0.5)'; };
    gearBtn.addEventListener('click', function(e){
      e.stopPropagation();
      popup.style.display = 'none'; popupOpen = false;
      openSettings();
    });

    popup.appendChild(makeDiceBtn('S', 'Zuf\xe4llige Serie', 'Series'));
    popup.appendChild(makeDiceBtn('M', 'Zuf\xe4lliger Film',  'Movie'));
    popup.appendChild(gearBtn);

    var popupOpen = false;
    btn.addEventListener('click', function(e){
      e.stopPropagation();
      popupOpen = !popupOpen;
      if (popupOpen) { positionBelow(popup, btn, false); popup.style.display='flex'; }
      else popup.style.display = 'none';
    });
    document.addEventListener('click', function(e){
      if (popupOpen && !wrap.contains(e.target) && !popup.contains(e.target)) {
        popupOpen = false; popup.style.display = 'none';
      }
    });
    window.addEventListener('scroll', function(){ if(popupOpen) positionBelow(popup,btn,false); }, true);
    window.addEventListener('resize', function(){ if(popupOpen) positionBelow(popup,btn,false); });

    wrap.appendChild(btn);
    document.body.appendChild(popup);
    return wrap;
  }

  /* ════════════ BADGE SYNC ════════════ */
  function startBadgeSync() {
    var chatBtn  = document.querySelector('#chatBtn');
    var triBadge = document.getElementById('jf-tri-badge');
    if (!chatBtn || !triBadge) return;
    function syncBadge() {
      var badge = chatBtn.querySelector('.chat-dm-badge,.chatDMBadge,[id*="chatDM"],.notificationCount,.badge');
      var count = badge ? (badge.textContent||'').trim() : '';
      if (!count) { var m=(chatBtn.getAttribute('aria-label')||chatBtn.title||'').match(/\d+/); if(m) count=m[0]; }
      if (count && count!=='0') { triBadge.textContent=parseInt(count)>99?'99+':count; triBadge.style.display='flex'; }
      else triBadge.style.display='none';
    }
    syncBadge();
    new MutationObserver(syncBadge).observe(chatBtn,{subtree:true,childList:true,attributes:true,characterData:true});
  }

  /* ════════════ DREIECK + PILL ════════════ */
  function buildTriangle(hr) {
    if (document.querySelector('#jf-tri-wrap')) return;

    var requestBtn = document.querySelector('#jbi-request-btn');
    var syncBtn    = document.querySelector('button.headerSyncButton');
    var castBtn    = document.querySelector('button.castButton');

    var pill = document.createElement('div');
    pill.id = 'jf-pill';
    pill.style.cssText = PILL_BASE;

    /* Chat: Original verschieben → Badge bleibt live */
    function addChatBtn() {
      var chatBtn = document.querySelector('#chatBtn');
      if (!chatBtn || pill.contains(chatBtn)) return;
      chatBtn.style.setProperty('display','inline-flex','important');
      chatBtn.style.setProperty('width','40px','important');
      chatBtn.style.setProperty('height','40px','important');
      chatBtn.style.setProperty('flex-shrink','0','important');
      chatBtn.style.removeProperty('margin');
      pill.insertBefore(chatBtn, pill.firstChild);
      startBadgeSync();
    }
    addChatBtn();
    var chatWatcher = new MutationObserver(function(){
      if (document.querySelector('#chatBtn')) { addChatBtn(); chatWatcher.disconnect(); }
    });
    chatWatcher.observe(document.body,{childList:true,subtree:true});
    setTimeout(function(){ chatWatcher.disconnect(); }, 10000);

    /* Request: Original verschieben */
    if (requestBtn) {
      requestBtn.style.setProperty('display','inline-flex','important');
      requestBtn.style.setProperty('width','40px','important');
      requestBtn.style.setProperty('height','40px','important');
      requestBtn.style.setProperty('flex-shrink','0','important');
      requestBtn.style.setProperty('margin','0','important');
      pill.appendChild(requestBtn);
    }

    /* Sync + Cast: Original verschieben */
    [syncBtn, castBtn].forEach(function(el){
      if (!el) return;
      el.style.setProperty('display','inline-flex','important');
      el.style.setProperty('flex-shrink','0','important');
      el.style.setProperty('margin','0','important');
      pill.appendChild(el);
    });

    /* Dreieck */
    var triWrap = document.createElement('div');
    triWrap.id = 'jf-tri-wrap';
    triWrap.style.cssText = 'position:relative;display:inline-flex;align-items:center;margin-left:2px;';

    var triDiv = document.createElement('div');
    triDiv.id = 'jf-tri-btn';
    triDiv.title = 'Chat / Request / Sync / Cast';
    triDiv.style.cssText = 'cursor:pointer;display:inline-flex;align-items:center;justify-content:center;width:32px;height:40px;background:none;border:none;outline:none;user-select:none;line-height:0;position:relative;';
    triDiv.innerHTML = '<svg id="jf-tri-svg" width="12" height="10" viewBox="0 0 12 10" fill="rgba(255,255,255,0.85)" style="display:block;transition:transform 0.2s ease;transform:rotate(180deg);"><polygon points="6,0 12,10 0,10"/></svg><span id="jf-tri-badge"></span>';

    var triOpen = false;
    triDiv.addEventListener('click', function(e){
      e.stopPropagation();
      triOpen = !triOpen;
      if (triOpen) { positionBelow(pill, triDiv, true); pill.style.display='flex'; }
      else pill.style.display = 'none';
      var svg = document.getElementById('jf-tri-svg');
      if (svg) svg.style.transform = triOpen ? 'rotate(0deg)' : 'rotate(180deg)';
    });
    document.addEventListener('click', function(e){
      if (triOpen && !triWrap.contains(e.target) && !pill.contains(e.target)) {
        triOpen = false; pill.style.display = 'none';
        var svg = document.getElementById('jf-tri-svg');
        if (svg) svg.style.transform = 'rotate(180deg)';
      }
    });
    window.addEventListener('scroll', function(){ if(triOpen) positionBelow(pill,triDiv,true); }, true);
    window.addEventListener('resize', function(){ if(triOpen) positionBelow(pill,triDiv,true); });

    triWrap.appendChild(triDiv);
    hr.appendChild(triWrap);
    document.body.appendChild(pill);
  }

  /* ════════════ APPLY ORDER ════════════ */
  function applyOrder() {
    var hr = document.querySelector('.headerRight');
    if (!hr) return false;
    var jbi = document.querySelector('#jbi-container');
    if (!jbi) return false;

    var ping   = document.querySelector('[id^="jf-ping"]') ||
                 document.querySelector('#jf-header-ping');

    /* FIX: nativen Würfel-Button immer verstecken, nur jf-wuerfel-wrap verwenden */
    var origRand = document.querySelector('#randomItemButtonContainer');
    if (origRand) origRand.style.setProperty('display', 'none', 'important');
    var rand = document.querySelector('#jf-wuerfel-wrap');
    if (!rand) rand = buildWuerfel();

    var avatar = document.querySelector('button.headerUserButtonRound') ||
                 document.querySelector('button.headerUserButton')      ||
                 document.querySelector('button[data-long-press-enhanced]');

    buildTriangle(hr);
    var triWrap = document.querySelector('#jf-tri-wrap');

    [ping, rand, jbi, triWrap, avatar].forEach(function(el){
      if (el) hr.appendChild(el);
    });

    console.log('[JF-Header] \u2713 Fertig');
    return true;
  }

  var applied = false;
  var obs = new MutationObserver(function(){
    if (applied || !document.querySelector('#jbi-container')) return;
    setTimeout(function(){ obs.disconnect(); if (applyOrder()) applied = true; }, 600);
  });

  function start() {
    if (document.querySelector('#jbi-container')) {
      setTimeout(function(){
        if (applyOrder()) { applied=true; return; }
        obs.observe(document.body,{childList:true,subtree:true});
        setTimeout(function(){ obs.disconnect(); }, 15000);
      }, 600);
    } else {
      obs.observe(document.body,{childList:true,subtree:true});
      setTimeout(function(){ obs.disconnect(); }, 15000);
    }
  }

  if (document.readyState==='loading') document.addEventListener('DOMContentLoaded', start);
  else start();

})();
