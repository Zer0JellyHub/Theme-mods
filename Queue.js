/* ══════════════════════════════════════════════════════════
   Jellyfin Watch Queue — Custom Tab
   · Trophäe-Icon über Tab-Label (wie Ranking/Calendar)
   · Vollbild-Overlay mit Suche links + Queue rechts
   · Englische UI
   · Keine Card-Buttons (sauber)
   ══════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  var QUEUE_KEY = 'jf_queue_v3';
  var CSS_ID    = 'jfq-css';
  var OV_ID     = 'jfq-overlay';

  /* ── Tab Icon (Playlist) ── */
  var TAB_ICON =
    '<span class="jf-tab-icon"><svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">'
    + '<path d="M15 6H3v2h12V6zm0 4H3v2h12v-2zM3 16h8v-2H3v2z'
    + 'M17 6v8.18c-.31-.11-.65-.18-1-.18-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3V8h3V6h-5z"/>'
    + '</svg></span>';

  /* ── State ── */
  var queue      = loadQueue();
  var searchTmr  = null;

  function loadQueue() {
    try { return JSON.parse(localStorage.getItem(QUEUE_KEY) || '[]'); } catch(e) { return []; }
  }
  function saveQueue() {
    try { localStorage.setItem(QUEUE_KEY, JSON.stringify(queue)); } catch(e) {}
  }

  /* ── API ── */
  function ac()  { return window.ApiClient; }
  function srv() { var a=ac(); return a?(a._serverAddress||a._serverUrl||'').replace(/\/$/,''):''; }
  function tok() { var a=ac(); return a?(a._token||(a.accessToken&&a.accessToken())||''):''; }
  function uid() { var a=ac(); return a?(a._currentUserId||(a.getCurrentUserId&&a.getCurrentUserId())||''):''; }

  function jfetch(path) {
    return fetch(srv()+path, {headers:{'X-Emby-Token':tok()}})
      .then(function(r){ return r.ok?r.json():null; })
      .catch(function(){ return null; });
  }

  /* ── Thumb URL ── */
  function thumb(item) {
    if (!item) return '';
    var base = srv()+'/Items/'+(item.Id||item.id)+'/Images/';
    if (item.BackdropImageTags && item.BackdropImageTags[0])
      return base+'Backdrop?maxWidth=400&tag='+item.BackdropImageTags[0];
    if (item.ImageTags && item.ImageTags.Primary)
      return base+'Primary?maxWidth=200&tag='+item.ImageTags.Primary;
    if (item.ParentBackdropItemId)
      return srv()+'/Items/'+item.ParentBackdropItemId+'/Images/Backdrop?maxWidth=400';
    return '';
  }

  /* ── Queue ops ── */
  function inQueue(id) {
    for (var i=0;i<queue.length;i++) { if(queue[i].id===id) return true; }
    return false;
  }

  function addItem(raw) {
    var id = raw.Id||raw.id;
    if (inQueue(id)) { toast(raw.Name+' is already in the queue'); return; }
    queue.push({ id:id, name:raw.Name||'?', type:raw.Type||'', thumbUrl:thumb(raw) });
    saveQueue();
    renderQueue();
  }

  function removeItem(idx) {
    queue.splice(idx, 1);
    saveQueue();
    renderQueue();
  }

  function moveItem(from, to) {
    if (to < 0 || to >= queue.length) return;
    var item = queue.splice(from, 1)[0];
    queue.splice(to, 0, item);
    saveQueue();
    renderQueue();
  }

  function shuffle() {
    for (var i=queue.length-1;i>0;i--) {
      var j = Math.floor(Math.random()*(i+1));
      var t = queue[i]; queue[i]=queue[j]; queue[j]=t;
    }
    saveQueue();
    renderQueue();
    toast('Queue shuffled');
  }

  function clearAll() {
    if (!confirm('Clear the entire queue?')) return;
    queue = [];
    saveQueue();
    renderQueue();
  }

  /* ── Navigate ── */
  function navTo(id) {
    var a = ac();
    var sid = a && ((a._serverInfo && a._serverInfo.Id) || (a.serverId && a.serverId()));
    closeOverlay();
    setTimeout(function() {
      if (window.appRouter && appRouter.showItem) {
        appRouter.showItem({Id:id, ServerId:sid}); return;
      }
      window.location.hash = '#!/details?id='+id+(sid?'&serverId='+sid:'');
    }, 150);
  }

  /* ── Toast ── */
  var _toastT = null;
  function toast(msg) {
    var t = document.getElementById('jfq-toast');
    if (!t) { t=document.createElement('div'); t.id='jfq-toast'; document.body.appendChild(t); }
    t.textContent = msg;
    t.classList.add('show');
    if (_toastT) clearTimeout(_toastT);
    _toastT = setTimeout(function(){ t.classList.remove('show'); }, 2400);
  }

  function esc(s){ return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

  /* ── CSS ── */
  function injectCSS() {
    if (document.getElementById(CSS_ID)) return;
    var s = document.createElement('style');
    s.id = CSS_ID;
    s.textContent = [
      /* Vollbild wie Calendar/Ranking */
      '#jfq-overlay{position:fixed;inset:0;z-index:99999;',
        'background:rgba(0,0,0,.55);backdrop-filter:blur(24px) saturate(1.4);',
        '-webkit-backdrop-filter:blur(24px) saturate(1.4);',
        'display:flex;flex-direction:column;overflow:hidden;',
        'font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;}',

      /* Header */
      '#jfq-head{display:flex;align-items:center;justify-content:space-between;',
        'padding:14px 3.5%;border-bottom:1px solid rgba(255,255,255,.12);',
        'flex-shrink:0;background:rgba(0,0,0,.2);}',
      '#jfq-title{font-size:1.2em;font-weight:300;letter-spacing:.03em;',
        'display:flex;align-items:center;gap:10px;color:rgba(255,255,255,.95);}',
      '#jfq-title svg{width:20px;height:20px;opacity:.9;}',
      '#jfq-head-right{display:flex;align-items:center;gap:8px;}',
      '.jfq-hbtn{background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.14);',
        'color:rgba(255,255,255,.7);border-radius:8px;padding:7px 14px;cursor:pointer;',
        'font-size:12px;font-weight:500;transition:all .15s;}',
      '.jfq-hbtn:hover{background:rgba(255,255,255,.16);color:#fff;}',
      '.jfq-hbtn.danger:hover{background:rgba(244,67,54,.18);border-color:rgba(244,67,54,.4);color:#f87171;}',
      '#jfq-close{background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.18);',
        'color:rgba(255,255,255,.85);border-radius:50%;width:34px;height:34px;cursor:pointer;',
        'display:flex;align-items:center;justify-content:center;font-size:1em;transition:background .2s;}',
      '#jfq-close:hover{background:rgba(255,255,255,.22);color:#fff;}',

      /* Body */
      '#jfq-body{flex:1;overflow:hidden;display:flex;}',

      /* Linke Spalte: Suche */
      '#jfq-left{width:420px;flex-shrink:0;display:flex;flex-direction:column;',
        'border-right:1px solid rgba(255,255,255,.08);}',
      '#jfq-search-wrap{padding:24px 24px 12px;flex-shrink:0;}',
      '.jfq-col-label{font-size:.65em;font-weight:600;letter-spacing:.12em;',
        'text-transform:uppercase;color:rgba(255,255,255,.28);margin-bottom:10px;}',
      '#jfq-input{width:100%;box-sizing:border-box;background:rgba(255,255,255,.07);',
        'border:1px solid rgba(255,255,255,.14);border-radius:10px;color:#fff;',
        'font-size:14px;padding:11px 16px;outline:none;transition:border-color .15s;}',
      '#jfq-input:focus{border-color:rgba(0,164,220,.55);}',
      '#jfq-input::placeholder{color:rgba(255,255,255,.22);}',
      '#jfq-results{flex:1;overflow-y:auto;padding:4px 24px 24px;',
        'scrollbar-width:thin;scrollbar-color:rgba(255,255,255,.18) transparent;}',
      '#jfq-results::-webkit-scrollbar{width:4px;}',
      '#jfq-results::-webkit-scrollbar-thumb{background:rgba(255,255,255,.18);border-radius:2px;}',

      /* Suchergebnis-Zeile */
      '.jfq-sr{display:flex;align-items:center;gap:12px;padding:9px 0;',
        'border-bottom:1px solid rgba(255,255,255,.05);}',
      '.jfq-sr:last-child{border-bottom:none;}',
      '.jfq-sr-thumb{width:72px;height:42px;border-radius:6px;flex-shrink:0;',
        'background:rgba(255,255,255,.07);overflow:hidden;}',
      '.jfq-sr-thumb img{width:100%;height:100%;object-fit:cover;display:block;}',
      '.jfq-sr-info{flex:1;min-width:0;}',
      '.jfq-sr-name{font-size:13px;font-weight:500;color:rgba(255,255,255,.9);',
        'white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}',
      '.jfq-sr-meta{font-size:10px;color:rgba(255,255,255,.32);margin-top:3px;',
        'text-transform:uppercase;letter-spacing:.04em;}',
      '.jfq-add-btn{background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.14);',
        'color:rgba(255,255,255,.6);border-radius:6px;padding:5px 12px;cursor:pointer;',
        'font-size:11px;font-weight:600;white-space:nowrap;flex-shrink:0;transition:all .15s;}',
      '.jfq-add-btn:hover{background:rgba(0,164,220,.2);border-color:rgba(0,164,220,.5);color:#00a4dc;}',
      '.jfq-add-btn.inq{background:rgba(0,164,220,.12);border-color:rgba(0,164,220,.35);color:#00a4dc;}',
      '.jfq-hint{padding:40px 0;text-align:center;color:rgba(255,255,255,.18);font-size:.82em;line-height:2.4;}',

      /* Rechte Spalte: Queue */
      '#jfq-right{flex:1;display:flex;flex-direction:column;min-width:0;}',
      '#jfq-queue-top{padding:24px 3.5% 10px;flex-shrink:0;}',
      '#jfq-queue-list{flex:1;overflow-y:auto;padding:0 3.5% 16px;',
        'scrollbar-width:thin;scrollbar-color:rgba(255,255,255,.18) transparent;}',
      '#jfq-queue-list::-webkit-scrollbar{width:4px;}',
      '#jfq-queue-list::-webkit-scrollbar-thumb{background:rgba(255,255,255,.18);border-radius:2px;}',

      /* Queue-Zeile */
      '.jfq-qi{display:flex;align-items:center;gap:12px;padding:8px 0;',
        'border-bottom:1px solid rgba(255,255,255,.04);}',
      '.jfq-qi:last-child{border-bottom:none;}',
      '.jfq-qi-num{font-size:11px;color:rgba(255,255,255,.2);width:22px;text-align:right;flex-shrink:0;}',
      '.jfq-qi-thumb{width:72px;height:42px;border-radius:6px;flex-shrink:0;',
        'background:rgba(255,255,255,.07);background-size:cover;background-position:center;}',
      '.jfq-qi-info{flex:1;min-width:0;}',
      '.jfq-qi-name{font-size:13px;font-weight:500;color:rgba(255,255,255,.88);',
        'white-space:nowrap;overflow:hidden;text-overflow:ellipsis;cursor:pointer;}',
      '.jfq-qi-name:hover{color:#00a4dc;}',
      '.jfq-qi-type{font-size:10px;color:rgba(255,255,255,.28);margin-top:3px;',
        'text-transform:uppercase;letter-spacing:.06em;}',
      '.jfq-qi-acts{display:flex;gap:2px;flex-shrink:0;}',
      '.jfq-qb{background:none;border:none;color:rgba(255,255,255,.22);cursor:pointer;',
        'width:30px;height:30px;border-radius:6px;display:flex;align-items:center;',
        'justify-content:center;transition:all .15s;font-size:15px;}',
      '.jfq-qb:hover{color:#fff;background:rgba(255,255,255,.1);}',
      '.jfq-qb.rm:hover{color:#f87171;background:rgba(244,67,54,.1);}',
      '.jfq-empty{padding:60px 0;text-align:center;color:rgba(255,255,255,.18);font-size:.85em;line-height:2.4;}',

      /* Footer */
      '#jfq-footer{padding:14px 3.5%;border-top:1px solid rgba(255,255,255,.08);',
        'flex-shrink:0;background:rgba(0,0,0,.18);display:flex;gap:10px;}',
      '#jfq-auto-btn{flex:1;height:40px;background:#00a4dc;border:none;border-radius:8px;',
        'color:#fff;font-size:13px;font-weight:700;cursor:pointer;transition:all .15s;}',
      '#jfq-auto-btn:hover{background:#0090c4;transform:translateY(-1px);}',
      '#jfq-auto-btn:disabled{background:rgba(255,255,255,.07);color:rgba(255,255,255,.2);cursor:default;transform:none;}',
      '#jfq-man-btn{flex:1;height:40px;background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.16);border-radius:8px;',
        'color:rgba(255,255,255,.8);font-size:13px;font-weight:600;cursor:pointer;transition:all .15s;}',
      '#jfq-man-btn:hover{background:rgba(255,255,255,.16);color:#fff;}',
      '#jfq-man-btn:disabled{background:rgba(255,255,255,.04);color:rgba(255,255,255,.2);border-color:rgba(255,255,255,.08);cursor:default;}',

      /* Expand button */
      '.jfq-exp-btn{background:rgba(255,255,255,.07);border:1px solid rgba(255,255,255,.13);',
        'color:rgba(255,255,255,.5);border-radius:6px;width:28px;height:28px;',
        'display:flex;align-items:center;justify-content:center;cursor:pointer;transition:all .15s;flex-shrink:0;}',
      '.jfq-exp-btn:hover,.jfq-exp-btn.open{background:rgba(255,255,255,.14);color:#fff;border-color:rgba(255,255,255,.3);}',

      /* Expand panel */
      '.jfq-exp-panel{background:rgba(0,0,0,.25);border-top:1px solid rgba(255,255,255,.06);',
        'padding:10px 20px 12px;border-bottom:1px solid rgba(255,255,255,.05);}',
      '.jfq-season-tabs{display:flex;gap:5px;flex-wrap:wrap;margin-bottom:10px;}',
      '.jfq-s-tab{padding:3px 10px;border-radius:999px;border:1px solid rgba(255,255,255,.13);',
        'background:rgba(255,255,255,.06);color:rgba(255,255,255,.5);font-size:11px;',
        'cursor:pointer;transition:all .15s;font-family:inherit;}',
      '.jfq-s-tab:hover{background:rgba(255,255,255,.12);color:#fff;}',
      '.jfq-s-tab.active{background:rgba(0,164,220,.2);border-color:rgba(0,164,220,.5);color:#00a4dc;font-weight:600;}',
      '.jfq-ep-list{display:flex;flex-direction:column;gap:2px;max-height:160px;overflow-y:auto;',
        'scrollbar-width:thin;scrollbar-color:rgba(255,255,255,.15) transparent;}',
      '.jfq-ep-list::-webkit-scrollbar{width:3px;}',
      '.jfq-ep-list::-webkit-scrollbar-thumb{background:rgba(255,255,255,.15);border-radius:2px;}',
      '.jfq-ep-row{display:flex;align-items:center;gap:8px;padding:5px 6px;border-radius:6px;cursor:default;transition:background .12s;}',
      '.jfq-ep-row:hover{background:rgba(255,255,255,.06);}',
      '.jfq-ep-num{font-size:10px;color:rgba(255,255,255,.25);width:32px;flex-shrink:0;font-family:monospace;}',
      '.jfq-ep-name{font-size:12px;color:rgba(255,255,255,.75);flex:1;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}',
      '.jfq-ep-add{background:none;border:none;color:rgba(255,255,255,.25);font-size:14px;cursor:pointer;',
        'padding:0 2px;line-height:1;transition:color .15s;flex-shrink:0;font-family:inherit;}',
      '.jfq-ep-add:hover{color:#00a4dc;}',
      '.jfq-ep-add.inq{color:#00a4dc;}',
      '.jfq-add-season-btn{margin-top:8px;width:100%;padding:5px;background:rgba(255,255,255,.05);',
        'border:1px solid rgba(255,255,255,.1);border-radius:7px;color:rgba(255,255,255,.4);',
        'font-size:11px;cursor:pointer;transition:all .15s;font-family:inherit;}',
      '.jfq-add-season-btn:hover:not(:disabled){background:rgba(0,164,220,.15);border-color:rgba(0,164,220,.4);color:#00a4dc;}',
      '.jfq-add-season-btn:disabled{opacity:.4;cursor:default;}',
      '.jfq-sr-wrap{display:flex;flex-direction:column;}',

      /* Toast */
      '#jfq-toast{position:fixed;bottom:28px;left:50%;transform:translateX(-50%) translateY(10px);',
        'background:rgba(15,15,20,.95);border:1px solid rgba(255,255,255,.14);',
        'backdrop-filter:blur(12px);color:#fff;padding:11px 22px;border-radius:10px;',
        'font-size:13px;z-index:9999999;opacity:0;transition:all .25s;',
        'pointer-events:none;white-space:nowrap;}',
      '#jfq-toast.show{opacity:1;transform:translateX(-50%) translateY(0);}',
    ].join('');
    document.head.appendChild(s);
  }

  /* ── Load Seasons Panel ── */
  function loadSeasonsPanel(seriesId, panel) {
    var u = uid();
    jfetch('/Shows/'+seriesId+'/Seasons?UserId='+u).then(function(data) {
      var seasons = data && data.Items ? data.Items : [];
      if (!seasons.length) { panel.innerHTML = '<div class="jfq-hint">No seasons found.</div>'; return; }
      renderSeasonPanel(panel, seriesId, seasons, 0);
    });
  }

  function renderSeasonPanel(panel, seriesId, seasons, activeIdx) {
    panel.innerHTML = '';

    /* Season Tabs */
    var tabRow = document.createElement('div');
    tabRow.className = 'jfq-season-tabs';
    seasons.forEach(function(s, i) {
      var tab = document.createElement('button');
      tab.className = 'jfq-s-tab' + (i === activeIdx ? ' active' : '');
      tab.textContent = s.Name || ('Season ' + s.IndexNumber);
      tab.addEventListener('click', function() {
        renderSeasonPanel(panel, seriesId, seasons, i);
      });
      tabRow.appendChild(tab);
    });
    panel.appendChild(tabRow);

    /* Episode list */
    var epList = document.createElement('div');
    epList.className = 'jfq-ep-list';
    epList.innerHTML = '<div class="jfq-spin" style="padding:.8em 0">Loading…</div>';
    panel.appendChild(epList);

    /* Add season btn */
    var addSeasonBtn = document.createElement('button');
    addSeasonBtn.className = 'jfq-add-season-btn';
    addSeasonBtn.textContent = '＋ Add all episodes of ' + (seasons[activeIdx].Name || 'this season');
    panel.appendChild(addSeasonBtn);

    /* Load episodes */
    var seasonId = seasons[activeIdx].Id;
    var u = uid();
    jfetch('/Users/'+u+'/Items?ParentId='+seasonId
      +'&IncludeItemTypes=Episode&SortBy=IndexNumber&Fields=RunTimeTicks,BackdropImageTags,ImageTags,ParentBackdropItemId'
      +'&Limit=200'
    ).then(function(data) {
      var eps = data && data.Items ? data.Items : [];
      epList.innerHTML = '';
      if (!eps.length) { epList.innerHTML = '<div class="jfq-hint" style="padding:.5em 0">No episodes found.</div>'; return; }

      eps.forEach(function(ep) {
        var row = document.createElement('div');
        row.className = 'jfq-ep-row';
        var num = document.createElement('span');
        num.className = 'jfq-ep-num';
        num.textContent = 'E' + String(ep.IndexNumber || '?').padStart(2,'0');
        var name = document.createElement('span');
        name.className = 'jfq-ep-name';
        name.textContent = ep.Name || '?';
        var addB = document.createElement('button');
        addB.className = 'jfq-ep-add' + (inQueue(ep.Id) ? ' inq' : '');
        addB.textContent = inQueue(ep.Id) ? '✓' : '＋';
        addB.addEventListener('click', function(e) {
          e.stopPropagation();
          if (inQueue(ep.Id)) return;
          addItem(ep);
          addB.textContent = '✓';
          addB.className = 'jfq-ep-add inq';
        });
        row.appendChild(num); row.appendChild(name); row.appendChild(addB);
        epList.appendChild(row);
      });

      /* Add all button */
      addSeasonBtn.addEventListener('click', function() {
        var added = 0;
        eps.forEach(function(ep) {
          if (!inQueue(ep.Id)) { addItem(ep); added++; }
        });
        toast('Added ' + added + ' episodes');
        addSeasonBtn.textContent = '✓ ' + added + ' episodes added';
        addSeasonBtn.disabled = true;
        /* Update ep checkmarks */
        epList.querySelectorAll('.jfq-ep-add').forEach(function(b) {
          b.textContent = '✓'; b.className = 'jfq-ep-add inq';
        });
      });
    });
  }

  /* ── Search ── */
  function doSearch(q) {
    var res = document.getElementById('jfq-results');
    if (!res) return;
    if (!q.trim()) {
      res.innerHTML = '<div class="jfq-hint">Search for any movie,<br>series or episode<br>to add it to your queue.</div>';
      return;
    }
    res.innerHTML = '<div class="jfq-hint">Searching…</div>';
    var u = uid();
    jfetch('/Users/'+u+'/Items'
      +'?SearchTerm='+encodeURIComponent(q.trim())
      +'&IncludeItemTypes=Movie,Series,Episode'
      +'&Recursive=true&Limit=30'
      +'&Fields=ProductionYear,BackdropImageTags,ImageTags,ParentBackdropItemId'
    ).then(function(data) {
      var res2 = document.getElementById('jfq-results');
      if (!res2) return;
      var items = data && data.Items ? data.Items : [];
      if (!items.length) { res2.innerHTML = '<div class="jfq-hint">No results found.</div>'; return; }
      res2.innerHTML = '';
      items.forEach(function(item) {
        var row = document.createElement('div');
        row.className = 'jfq-sr';

        var thumbDiv = document.createElement('div');
        thumbDiv.className = 'jfq-sr-thumb';
        var th = thumb(item);
        if (th) {
          var img = document.createElement('img');
          img.src = th; img.onerror = function(){ img.remove(); };
          thumbDiv.appendChild(img);
        }

        var info = document.createElement('div');
        info.className = 'jfq-sr-info';
        var year = item.ProductionYear ? ' · '+item.ProductionYear : '';
        info.innerHTML = '<div class="jfq-sr-name">'+esc(item.Name||'?')+'</div>'
          + '<div class="jfq-sr-meta">'+(item.Type||'')+year+'</div>';

        var btns = document.createElement('div');
        btns.style.cssText = 'display:flex;align-items:center;gap:4px;flex-shrink:0;';

        /* Dreieck-Expand nur für Serien */
        var expandPanel = null;
        if (item.Type === 'Series') {
          var expBtn = document.createElement('button');
          expBtn.className = 'jfq-exp-btn';
          expBtn.title = 'Seasons & Episodes';
          expBtn.innerHTML = '<svg width="10" height="8" viewBox="0 0 10 8" fill="currentColor"><polygon points="5,0 10,8 0,8"/></svg>';
          expBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            var isOpen = expBtn.classList.contains('open');
            /* Alle anderen schließen */
            document.querySelectorAll('.jfq-exp-btn.open').forEach(function(b) {
              b.classList.remove('open');
              b.innerHTML = '<svg width="10" height="8" viewBox="0 0 10 8" fill="currentColor"><polygon points="5,0 10,8 0,8"/></svg>';
              var p = b.closest('.jfq-sr-wrap') && b.closest('.jfq-sr-wrap').querySelector('.jfq-exp-panel');
              if (p) { p.style.display = 'none'; }
            });
            if (!isOpen) {
              expBtn.classList.add('open');
              expBtn.innerHTML = '<svg width="10" height="8" viewBox="0 0 10 8" fill="currentColor"><polygon points="0,0 10,0 5,8"/></svg>';
              expandPanel.style.display = 'block';
              if (!expandPanel.dataset.loaded) {
                expandPanel.dataset.loaded = '1';
                loadSeasonsPanel(item.Id, expandPanel);
              }
            }
          });
          btns.appendChild(expBtn);
        }

        var addBtn = document.createElement('button');
        addBtn.className = 'jfq-add-btn'+(inQueue(item.Id)?' inq':'');
        addBtn.textContent = inQueue(item.Id) ? '✓ Added' : (item.Type === 'Series' ? '+ All' : '+ Add');
        addBtn.addEventListener('click', function() {
          if (inQueue(item.Id)) { toast(item.Name+' is already in the queue'); return; }
          addItem(item);
          addBtn.textContent = '✓ Added';
          addBtn.className = 'jfq-add-btn inq';
        });
        btns.appendChild(addBtn);

        /* Wrapper für row + expand panel */
        var srWrap = document.createElement('div');
        srWrap.className = 'jfq-sr-wrap';
        row.appendChild(thumbDiv);
        row.appendChild(info);
        row.appendChild(btns);
        srWrap.appendChild(row);

        if (item.Type === 'Series') {
          expandPanel = document.createElement('div');
          expandPanel.className = 'jfq-exp-panel';
          expandPanel.style.display = 'none';
          expandPanel.innerHTML = '<div class="jfq-spin">Loading seasons…</div>';
          srWrap.appendChild(expandPanel);
        }

        res2.appendChild(srWrap);
      });
    });
  }

  /* ── Render Queue ── */
  function renderQueue() {
    var list = document.getElementById('jfq-queue-list');
    var top  = document.getElementById('jfq-queue-top');
    if (!list) return;

    if (top) top.innerHTML = '<div class="jfq-col-label">Up next · '
      + queue.length + ' item'+(queue.length!==1?'s':'')+'</div>';

    list.innerHTML = '';

    if (!queue.length) {
      list.innerHTML = '<div class="jfq-empty">Your queue is empty.<br>Search on the left to add content.</div>';
    } else {
      queue.forEach(function(item, i) {
        var row = document.createElement('div');
        row.className = 'jfq-qi';

        var num = document.createElement('div');
        num.className = 'jfq-qi-num';
        num.textContent = i + 1;

        var td = document.createElement('div');
        td.className = 'jfq-qi-thumb';
        if (item.thumbUrl) td.style.backgroundImage = 'url('+item.thumbUrl+')';

        var info = document.createElement('div');
        info.className = 'jfq-qi-info';
        var nameEl = document.createElement('div');
        nameEl.className = 'jfq-qi-name';
        nameEl.textContent = item.name;
        nameEl.addEventListener('click', function(){ navTo(item.id); });
        var typeEl = document.createElement('div');
        typeEl.className = 'jfq-qi-type';
        typeEl.textContent = item.type || '';
        info.appendChild(nameEl);
        info.appendChild(typeEl);

        var acts = document.createElement('div');
        acts.className = 'jfq-qi-acts';

        if (i > 0) {
          var upB = document.createElement('button');
          upB.className = 'jfq-qb'; upB.title = 'Move up'; upB.textContent = '↑';
          upB.addEventListener('click', (function(idx){ return function(){ moveItem(idx,idx-1); }; })(i));
          acts.appendChild(upB);
        }
        if (i < queue.length - 1) {
          var dnB = document.createElement('button');
          dnB.className = 'jfq-qb'; dnB.title = 'Move down'; dnB.textContent = '↓';
          dnB.addEventListener('click', (function(idx){ return function(){ moveItem(idx,idx+1); }; })(i));
          acts.appendChild(dnB);
        }
        var rmB = document.createElement('button');
        rmB.className = 'jfq-qb rm'; rmB.title = 'Remove'; rmB.textContent = '✕';
        rmB.addEventListener('click', (function(idx){ return function(){ removeItem(idx); }; })(i));
        acts.appendChild(rmB);

        row.appendChild(num);
        row.appendChild(td);
        row.appendChild(info);
        row.appendChild(acts);
        list.appendChild(row);
      });
    }

    var ab = document.getElementById('jfq-auto-btn');
    var mb = document.getElementById('jfq-man-btn');
    if (ab) ab.disabled = queue.length === 0;
    if (mb) mb.disabled = queue.length === 0;
  }

  /* ── Overlay ── */
  var escH = function(e){ if(e.key==='Escape') closeOverlay(); };

  function openOverlay() {
    if (document.getElementById(OV_ID)) { closeOverlay(); return; }

    var ov = document.createElement('div');
    ov.id = OV_ID;

    /* Header */
    var head = document.createElement('div'); head.id = 'jfq-head';

    var title = document.createElement('div'); title.id = 'jfq-title';
    title.innerHTML = '<svg viewBox="0 0 24 24" fill="currentColor">'
      +'<path d="M15 6H3v2h12V6zm0 4H3v2h12v-2zM3 16h8v-2H3v2z'
      +'M17 6v8.18c-.31-.11-.65-.18-1-.18-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3V8h3V6h-5z"/>'
      +'</svg>Watch Queue';
    head.appendChild(title);

    var headRight = document.createElement('div'); headRight.id = 'jfq-head-right';
    if (queue.length > 1) {
      var shuffleBtn = document.createElement('button');
      shuffleBtn.className = 'jfq-hbtn'; shuffleBtn.textContent = '⇄ Shuffle';
      shuffleBtn.addEventListener('click', shuffle);
      headRight.appendChild(shuffleBtn);
    }
    if (queue.length > 0) {
      var clearBtn = document.createElement('button');
      clearBtn.className = 'jfq-hbtn danger'; clearBtn.textContent = 'Clear All';
      clearBtn.addEventListener('click', clearAll);
      headRight.appendChild(clearBtn);
    }
    var closeBtn = document.createElement('button');
    closeBtn.id = 'jfq-close'; closeBtn.textContent = '✕';
    closeBtn.addEventListener('click', closeOverlay);
    headRight.appendChild(closeBtn);
    head.appendChild(headRight);
    ov.appendChild(head);

    /* Body */
    var body = document.createElement('div'); body.id = 'jfq-body';

    /* Links: Suche */
    var left = document.createElement('div'); left.id = 'jfq-left';
    var sw = document.createElement('div'); sw.id = 'jfq-search-wrap';
    sw.innerHTML = '<div class="jfq-col-label">Add to Queue</div>';
    var inp = document.createElement('input');
    inp.type = 'text'; inp.id = 'jfq-input';
    inp.placeholder = 'Search movies, series, episodes…';
    inp.addEventListener('input', function() {
      if (searchTmr) clearTimeout(searchTmr);
      searchTmr = setTimeout(function(){ doSearch(inp.value); }, 320);
    });
    sw.appendChild(inp);
    left.appendChild(sw);
    var results = document.createElement('div'); results.id = 'jfq-results';
    results.innerHTML = '<div class="jfq-hint">Search for any movie,<br>series or episode<br>to add it to your queue.</div>';
    left.appendChild(results);
    body.appendChild(left);

    /* Rechts: Queue */
    var right = document.createElement('div'); right.id = 'jfq-right';
    var qTop = document.createElement('div'); qTop.id = 'jfq-queue-top';
    right.appendChild(qTop);
    var qList = document.createElement('div'); qList.id = 'jfq-queue-list';
    right.appendChild(qList);

    var footer = document.createElement('div'); footer.id = 'jfq-footer';

    /* ── Autoplay Button ── */
    var autoBtn = document.createElement('button');
    autoBtn.id = 'jfq-auto-btn';
    autoBtn.disabled = !queue.length;
    autoBtn.title = 'Starts all items automatically one after another';
    autoBtn.innerHTML = '⏭ Autoplay';
    autoBtn.addEventListener('click', function() {
      if (!queue.length) return;
      var a = ac();
      var sid = a && ((a._serverInfo && a._serverInfo.Id) || (a.serverId && a.serverId()));

      /* ── Schritt 1: Navigiere zu Item ── */
      function goToItem() {
        if (!queue.length) { console.log('[AutoPlay] Queue done'); return; }
        var item = queue[0]; /* Immer erstes Item */
        console.log('[AutoPlay] Going to:', item.name);

        if (window.appRouter && appRouter.showItem) {
          appRouter.showItem({Id: item.id, ServerId: sid});
        } else {
          window.location.hash = '#!/details?id=' + item.id + (sid ? '&serverId=' + sid : '');
        }

        /* Schritt 2: Warten bis URL passt */
        var t1 = 0;
        var iv1 = setInterval(function() {
          t1++;
          if ((window.location.hash || '').indexOf(item.id) === -1) {
            if (t1 > 50) { clearInterval(iv1); console.log('[AutoPlay] URL timeout'); }
            return;
          }
          clearInterval(iv1);

          /* Schritt 3: Warten bis Play-Button sichtbar */
          var t2 = 0;
          var iv2 = setInterval(function() {
            t2++;
            var playBtn = null;
            var candidates = document.querySelectorAll('button.btnPlay, button[data-action="play"], button[data-action="resume"]');
            for (var i = 0; i < candidates.length; i++) {
              var b = candidates[i];
              if (!b.classList.contains('hide') && b.offsetParent !== null) {
                playBtn = b; break;
              }
            }
            if (!playBtn) {
              if (t2 > 40) { clearInterval(iv2); console.log('[AutoPlay] Play button timeout'); }
              return;
            }
            clearInterval(iv2);
            console.log('[AutoPlay] Clicking play');
            playBtn.click();

            /* Schritt 4: Warten bis <video> erscheint */
            var t3 = 0;
            var iv3 = setInterval(function() {
              t3++;
              var vid = document.querySelector('video');
              if (!vid) {
                if (t3 > 50) { clearInterval(iv3); console.log('[AutoPlay] Video element timeout'); }
                return;
              }
              clearInterval(iv3);
              console.log('[AutoPlay] Video playing, waiting for end');

              /* Schritt 5: auf video.ended ODER verschwindenden Player warten */
              var done = false;
              function onFinished() {
                if (done) return;
                done = true;
                clearInterval(iv4);
                console.log('[AutoPlay] Finished, removing from queue');
                queue.shift();
                saveQueue();
                setTimeout(goToItem, 1200);
              }

              /* Methode A: ended event direkt auf video */
              vid.addEventListener('ended', onFinished, {once: true});

              /* Methode B: Poll ob video noch im DOM */
              var iv4 = setInterval(function() {
                if (!document.querySelector('video')) onFinished();
              }, 2000);

              /* Cleanup nach 6h */
              setTimeout(function(){ done = true; clearInterval(iv4); }, 21600000);
            }, 300);
          }, 250);
        }, 200);
      }

      closeOverlay();
      setTimeout(goToItem, 400);
    });

    /* ── Manual Play Button ── */
    var manBtn = document.createElement('button');
    manBtn.id = 'jfq-man-btn';
    manBtn.disabled = !queue.length;
    manBtn.title = 'Opens the first item — play manually';
    manBtn.innerHTML = '▶ Manual Play';
    manBtn.addEventListener('click', function() {
      if (!queue.length) return;
      var a = ac(), sid = a&&((a._serverInfo&&a._serverInfo.Id)||(a.serverId&&a.serverId()));
      closeOverlay();
      setTimeout(function() {
        if (window.appRouter && appRouter.showItem) {
          appRouter.showItem({Id:queue[0].id, ServerId:sid}); return;
        }
        window.location.hash = '#!/details?id='+queue[0].id+(sid?'&serverId='+sid:'');
      }, 150);
    });

    footer.appendChild(autoBtn);
    footer.appendChild(manBtn);
    right.appendChild(footer);
    body.appendChild(right);
    ov.appendChild(body);

    document.body.appendChild(ov);
    document.addEventListener('keydown', escH);
    ov.addEventListener('click', function(e){ if(e.target===ov) closeOverlay(); });

    renderQueue();
    setTimeout(function(){ var i=document.getElementById('jfq-input'); if(i) i.focus(); }, 80);
  }

  function closeOverlay() {
    var ov = document.getElementById(OV_ID);
    if (ov) ov.remove();
    document.removeEventListener('keydown', escH);
  }

  /* ── Tab patchen — identisch Calendar/Ranking ── */
  function patchTab() {
    var btns = document.querySelectorAll('[id^="customTabButton"], .emby-tab-button, [class*="tabButton"]');
    btns.forEach(function(btn) {
      if (btn.dataset.jfqPatched) return;
      var label = btn.querySelector('.emby-tab-button-text, span') || btn;
      var txt = (label.textContent || btn.textContent || '').trim().toLowerCase();
      if (txt.indexOf('queue') === -1) return;
      if (!btn.querySelector('.jf-tab-icon')) {
        btn.insertAdjacentHTML('afterbegin', TAB_ICON);
      }
      btn.dataset.jfqPatched = '1';
      btn.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopImmediatePropagation();
        if (document.getElementById(OV_ID)) { closeOverlay(); return; }
        openOverlay();
      }, true);
      console.log('[Queue] Tab patched ✓');
    });
  }

  /* ── Boot ── */
  setInterval(function() {
    if (typeof ApiClient === 'undefined') return;
    injectCSS();
    patchTab();
  }, 400);

  window.__openQueueOverlay = openOverlay;

})();
