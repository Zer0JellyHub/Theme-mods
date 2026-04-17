/* ══════════════════════════════════════════════════════════
   Jellyfin – Ratings Overlay  FINAL
   – Entfernt alten CSS beim Laden (kein Konflikt mehr)
   – Mobile: 2 klare Zeilen (Titel+Suche / Tabs)
   – 24h Cache nach erstem Laden
   – History: Filme + Episoden
   – Echte Benutzernamen
   – Rate-Tab: Server-Suche + Bewerten
   ══════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  /* ── Alten CSS entfernen damit kein Konflikt entsteht ────── */
  ['jf-rat-css','jfrat3css','jf-rat-css2'].forEach(function(id){
    var el=document.getElementById(id);if(el)el.remove();
  });

  /* ── ir-widget weg ───────────────────────────────────────── */
  (function(){var s=document.createElement('style');s.id='jfrat-irfix';
    s.textContent='#ir-widget,#ir-widget-on,.ir-pill,[id^="ir-widget"]{display:none!important;}';
    document.head.appendChild(s);
  })();

  /* ── Alten Overlay-Code killen ──────────────────────────────
     Beide Codes laufen parallel: alter Code patcht den Tab zuerst.
     Wir fangen den Klick auf Document-Ebene ab (capture phase),
     damit unser neues Overlay immer geöffnet wird.
  ────────────────────────────────────────────────────────── */
  document.addEventListener('click', function(e){
    var btn = e.target;
    // Bis zu 4 Eltern hochgehen (Icon, Span, etc. könnten geklickt sein)
    for(var i=0;i<5;i++){
      if(!btn) break;
      var te = btn.querySelector && (btn.querySelector('.emby-tab-button-text,span') || btn);
      var txt = (te && te.textContent || btn.textContent || '').trim();
      if(/^ratings$/i.test(txt) && (btn.dataset.jfRatPatched || btn.dataset.jfPF || btn.dataset.jfP3)){
        e.stopImmediatePropagation();
        e.preventDefault();
        openOv();
        return;
      }
      btn = btn.parentElement;
    }
  }, true);

  /* ── 24h Cache ───────────────────────────────────────────── */
  var TTL=86400000;
  function ck(k){return 'jfratF_'+k;}
  function cget(k){try{var r=localStorage.getItem(ck(k));if(!r)return null;var o=JSON.parse(r);if(Date.now()-o.ts>TTL){localStorage.removeItem(ck(k));return null;}return o.d;}catch(e){return null;}}
  function cset(k,d){try{localStorage.setItem(ck(k),JSON.stringify({ts:Date.now(),d:d}));}catch(e){}}
  function cdel(k){try{localStorage.removeItem(ck(k));}catch(e){}}

  /* ── CSS ─────────────────────────────────────────────────── */
  var CSS=[
    '.jrt-ti{display:flex;align-items:center;justify-content:center;}',
    '.jrt-ti svg{width:22px;height:22px;fill:currentColor;opacity:.87;}',
    '.jrt-tp{display:flex!important;flex-direction:column!important;align-items:center!important;justify-content:center!important;}',

    /* Overlay */
    '#jro{position:fixed;inset:0;z-index:99999;',
    'background:rgba(0,0,0,.55);',
    'backdrop-filter:blur(24px) saturate(1.4);',
    '-webkit-backdrop-filter:blur(24px) saturate(1.4);',
    'display:flex;flex-direction:column;overflow:hidden;',
    'font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;}',

    /* Header wrapper */
    '#jrh{display:flex;flex-direction:column;flex-shrink:0;',
    'background:rgba(0,0,0,.2);border-bottom:1px solid rgba(255,255,255,.12);}',

    /* Zeile 1: Titel + Suche + X */
    '#jrh1{display:flex;align-items:center;gap:9px;padding:11px 14px;}',
    '#jrtitle{font-size:1.1em;font-weight:300;letter-spacing:.03em;',
    'display:flex;align-items:center;gap:7px;color:rgba(255,255,255,.95);flex-shrink:0;}',
    '#jrsw{display:flex;align-items:center;gap:6px;flex:1;',
    'background:rgba(255,255,255,.07);border:1px solid rgba(255,255,255,.14);',
    'border-radius:8px;padding:6px 10px;transition:border-color .2s;}',
    '#jrsw:focus-within{border-color:rgba(255,255,255,.38);}',
    '#jrsi{background:none;border:none;outline:none;color:#fff;',
    'font-size:.8em;flex:1;font-family:inherit;min-width:0;}',
    '#jrsi::placeholder{color:rgba(255,255,255,.3);}',
    '#jrsc{background:none;border:none;color:rgba(255,255,255,.35);cursor:pointer;',
    'font-size:12px;padding:0;display:none;flex-shrink:0;line-height:1;}',
    '#jrsc.show{display:block;}',
    '#jrclose{background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.18);',
    'color:rgba(255,255,255,.85);border-radius:50%;width:30px;height:30px;',
    'cursor:pointer;display:flex;align-items:center;justify-content:center;',
    'flex-shrink:0;font-size:.9em;}',

    /* Zeile 2: Tabs — IMMER umbrechen */
    '#jrh2{display:flex;flex-wrap:wrap;gap:5px;row-gap:5px;padding:0 14px 10px;justify-content:center;}',
    '.jrb{background:rgba(255,255,255,.07);border:1px solid rgba(255,255,255,.14);',
    'color:rgba(255,255,255,.7);border-radius:8px;padding:5px 12px;cursor:pointer;',
    'flex-shrink:0;font-size:.76em;font-family:inherit;white-space:nowrap;',
    'transition:background .15s,color .15s;}',
    '.jrb:hover{background:rgba(255,255,255,.14);color:#fff;}',
    '.jrb.on{background:rgba(255,255,255,.22);border-color:rgba(255,255,255,.5);color:#fff;font-weight:500;}',

    /* Body */
    '#jrb{flex:1;overflow-y:auto;padding:0 14px 3em;',
    'scrollbar-width:thin;scrollbar-color:rgba(255,255,255,.2) transparent;}',
    '#jrb::-webkit-scrollbar{width:4px;}',
    '#jrb::-webkit-scrollbar-thumb{background:rgba(255,255,255,.2);border-radius:2px;}',

    /* Section */
    '.jrs{padding-top:26px;}',
    '.jrs h2{font-size:1.1em;font-weight:300;letter-spacing:.04em;margin:0 0 .3em;color:rgba(255,255,255,.9);}',
    '.jrsub{font-size:.68em;color:rgba(255,255,255,.3);letter-spacing:.08em;text-transform:uppercase;margin-bottom:13px;}',

    /* List */
    '.jrl{display:flex;flex-direction:column;gap:2px;}',
    '.jriw{border-radius:9px;overflow:hidden;margin-bottom:2px;}',
    '.jrrow{display:flex;align-items:center;gap:10px;padding:8px 10px;cursor:pointer;transition:background .15s;}',
    '.jrrow:hover{background:rgba(255,255,255,.05);}',
    '.jrrow.hi{background:rgba(255,255,255,.06);}',
    '.jrrank{font-size:1.1em;width:26px;text-align:center;flex-shrink:0;}',
    '.jrrank.pl{font-size:.78em;color:rgba(255,255,255,.25);font-weight:600;}',
    '.jrposter{width:34px;height:50px;border-radius:4px;background:rgba(255,255,255,.08);',
    'border:1px solid rgba(255,255,255,.06);flex-shrink:0;object-fit:cover;}',
    '.jrinfo{flex:1;min-width:0;}',
    '.jrname{font-size:.84em;font-weight:500;color:#fff;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}',
    '.jrmeta{font-size:.67em;color:rgba(255,255,255,.38);margin-top:2px;}',
    '.jrsc2{text-align:right;flex-shrink:0;margin-right:5px;}',
    '.jravg{font-size:1.05em;font-weight:500;color:#fff;line-height:1;}',
    '.jravg small{font-size:.5em;color:rgba(255,255,255,.28);font-weight:300;}',
    '.jrstars{font-size:.56em;color:rgba(255,255,255,.5);margin-top:2px;letter-spacing:1px;}',
    '.jrrc{font-size:.58em;color:rgba(255,255,255,.28);margin-top:1px;}',

    /* Expand */
    '.jrexp{background:rgba(255,255,255,.07);border:1px solid rgba(255,255,255,.13);',
    'color:rgba(255,255,255,.55);border-radius:6px;width:22px;height:22px;cursor:pointer;',
    'display:flex;align-items:center;justify-content:center;flex-shrink:0;font-size:10px;',
    'font-family:inherit;transition:all .15s;}',
    '.jrexp:hover,.jrexp.open{background:rgba(255,255,255,.14);border-color:rgba(255,255,255,.3);color:#fff;}',
    '.jrep{background:rgba(0,0,0,.2);padding:8px 12px;border-top:1px solid rgba(255,255,255,.06);}',
    '.jreptit{font-size:.61em;color:rgba(255,255,255,.3);letter-spacing:.08em;text-transform:uppercase;margin-bottom:7px;}',
    '.jrur{display:flex;align-items:center;gap:8px;margin-bottom:5px;}',
    '.jrur:last-child{margin-bottom:0;}',
    '.jrav{width:18px;height:18px;border-radius:50%;background:rgba(255,255,255,.15);',
    'display:flex;align-items:center;justify-content:center;font-size:7px;',
    'color:rgba(255,255,255,.8);flex-shrink:0;overflow:hidden;}',
    '.jrav img{width:100%;height:100%;object-fit:cover;}',
    '.jrun{font-size:.74em;color:rgba(255,255,255,.7);flex:1;}',
    '.jrus{font-size:.6em;color:rgba(255,255,255,.5);letter-spacing:1px;}',
    '.jruv{font-size:.74em;font-weight:500;color:rgba(255,255,255,.9);margin-left:4px;}',
    '.jrdiv{height:1px;background:rgba(255,255,255,.06);margin:4px 0;}',

    /* Rate button */
    '.jrrb{background:rgba(255,193,7,.12);border:1px solid rgba(255,193,7,.28);',
    'color:rgba(255,210,60,.85);border-radius:6px;padding:3px 7px;font-size:.65em;',
    'font-family:inherit;cursor:pointer;white-space:nowrap;flex-shrink:0;transition:background .15s;}',
    '.jrrb:hover{background:rgba(255,193,7,.25);}',
    '.jrrb.rated{background:rgba(255,193,7,.22);border-color:rgba(255,193,7,.55);color:#ffe040;}',

    /* Picker */
    '.jrpk{background:rgba(0,0,0,.55);border:1px solid rgba(255,255,255,.11);',
    'border-radius:9px;padding:10px 12px;margin:2px 0 3px;}',
    '.jrpkt{font-size:.65em;color:rgba(255,255,255,.35);letter-spacing:.06em;',
    'text-transform:uppercase;margin-bottom:8px;}',
    '.jrsr{display:flex;gap:2px;align-items:center;margin-bottom:8px;flex-wrap:wrap;}',
    '.jrstar{font-size:1.4em;cursor:pointer;color:rgba(255,255,255,.18);',
    'transition:color .1s,transform .1s;user-select:none;line-height:1;}',
    '.jrstar:hover,.jrstar.lit{color:#FFD700;}',
    '.jrstar:hover{transform:scale(1.15);}',
    '.jrpv{font-size:.76em;color:rgba(255,255,255,.42);min-width:28px;margin-left:5px;}',
    '.jrpa{display:flex;gap:6px;flex-wrap:wrap;}',
    '.jrpsv{background:rgba(255,193,7,.2);border:1px solid rgba(255,193,7,.42);color:#ffe040;',
    'border-radius:7px;padding:4px 11px;font-size:.73em;font-family:inherit;cursor:pointer;}',
    '.jrpsv:hover{background:rgba(255,193,7,.35);}',
    '.jrpdl{background:rgba(255,60,60,.08);border:1px solid rgba(255,60,60,.25);',
    'color:rgba(255,120,120,.9);border-radius:7px;padding:4px 11px;font-size:.73em;',
    'font-family:inherit;cursor:pointer;}',
    '.jrpdl:hover{background:rgba(255,60,60,.18);}',
    '.jrpcn{background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.11);',
    'color:rgba(255,255,255,.42);border-radius:7px;padding:4px 11px;font-size:.73em;',
    'font-family:inherit;cursor:pointer;}',
    '.jrpmsg{font-size:.68em;margin-top:5px;}',
    '.jrpmsg.ok{color:#7ec87e;} .jrpmsg.err{color:#f88;}',

    /* Pills */
    '.jrpills{display:flex;gap:7px;flex-wrap:wrap;margin-bottom:16px;}',
    '.jrpill{display:flex;align-items:center;gap:7px;padding:5px 11px;border-radius:8px;',
    'border:1px solid rgba(255,255,255,.13);background:rgba(255,255,255,.07);',
    'cursor:pointer;font-family:inherit;transition:background .15s;}',
    '.jrpill:hover{background:rgba(255,255,255,.13);}',
    '.jrpav{width:20px;height:20px;border-radius:50%;background:rgba(255,255,255,.15);',
    'overflow:hidden;display:flex;align-items:center;justify-content:center;',
    'font-size:8px;color:rgba(255,255,255,.8);flex-shrink:0;}',
    '.jrpav img{width:100%;height:100%;object-fit:cover;}',
    '.jrpnm{font-size:.79em;color:#fff;}',

    /* Detail */
    '.jrdh{display:flex;align-items:center;gap:8px;margin-bottom:12px;}',
    '.jrbk{background:rgba(255,255,255,.07);border:1px solid rgba(255,255,255,.13);',
    'color:rgba(255,255,255,.65);border-radius:6px;padding:4px 10px;',
    'font-size:.72em;cursor:pointer;font-family:inherit;}',
    '.jrbk:hover{background:rgba(255,255,255,.14);color:#fff;}',
    '.jrdl{font-size:.76em;color:rgba(255,255,255,.45);}',

    /* Cards */
    '.jrcards{display:flex;flex-wrap:wrap;gap:9px;}',
    '.jrcard{width:100px;flex-shrink:0;cursor:pointer;transition:transform .2s,opacity .2s;}',
    '.jrcard:hover{transform:scale(1.05);opacity:.85;}',
    '.jrci{width:100px;height:150px;border-radius:6px;overflow:hidden;',
    'background:rgba(255,255,255,.06);position:relative;border:1px solid rgba(255,255,255,.07);}',
    '.jrci img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;display:block;}',
    '.jrct{font-size:.7em;margin-top:5px;text-align:center;color:rgba(255,255,255,.8);',
    'overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}',
    '.jrcs{font-size:.62em;margin-top:2px;text-align:center;color:rgba(255,255,255,.36);}',

    /* History */
    '.jrhr{display:flex;align-items:center;gap:10px;padding:7px 10px;border-radius:9px;',
    'transition:background .15s;}',
    '.jrhr.cl{cursor:pointer;}',
    '.jrhr:hover{background:rgba(255,255,255,.05);}',
    '.jrhr.hi{background:rgba(255,255,255,.05);}',
    '.jrhdate{width:30px;text-align:center;flex-shrink:0;}',
    '.jrhday{font-size:.95em;font-weight:400;color:rgba(255,255,255,.88);line-height:1;}',
    '.jrhmon{font-size:.58em;color:rgba(255,255,255,.3);}',

    /* Rate-Tab Suche */
    '#jrts{width:100%;background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.17);',
    'color:#fff;border-radius:9px;padding:9px 13px;font-size:.86em;font-family:inherit;',
    'outline:none;box-sizing:border-box;margin-bottom:13px;}',
    '#jrts::placeholder{color:rgba(255,255,255,.3);}',
    '#jrts:focus{border-color:rgba(255,255,255,.38);}',

    /* States */
    '.jrspin{padding:2.5em;text-align:center;color:rgba(255,255,255,.38);font-size:.85em;}',
    '.jrempty{padding:1.5em 0;color:rgba(255,255,255,.22);font-size:.82em;font-style:italic;}',
  ].join('');

  function injectCSS(){
    var old=document.getElementById('jfratFcss');if(old)old.remove();
    var s=document.createElement('style');s.id='jfratFcss';s.textContent=CSS;document.head.appendChild(s);
  }
  injectCSS();

  /* ── Helpers ─────────────────────────────────────────────── */
  function AC(){return window.ApiClient;}
  function srv(){var a=AC();return a?(a._serverAddress||a._serverUrl||'').replace(/\/$/,''):'';}
  function tok(){var a=AC();return a?(a._token||(a.accessToken&&a.accessToken())||''):''}
  function uid(){var a=AC();return a?(a._currentUserId||(a.getCurrentUserId&&a.getCurrentUserId())||''):'';}
  function ah(){return{'X-Emby-Token':tok(),'X-MediaBrowser-Token':tok()};}
  function jget(p,q){var qs=q?'?'+Object.keys(q).map(function(k){return encodeURIComponent(k)+'='+encodeURIComponent(q[k]);}).join('&'):'';return fetch(srv()+'/'+p+qs,{headers:ah()}).then(function(r){return r.ok?r.json():null;}).catch(function(){return null;});}
  function rget(p){return fetch(srv()+p,{headers:ah()}).then(function(r){return r.ok?r.json():null;}).catch(function(){return null;});}
  function rsubmit(id,n){return fetch(srv()+'/Ratings/Items/'+id+'/Rating?rating='+n,{method:'POST',headers:ah()}).then(function(r){return r.ok;}).catch(function(){return false;});}
  function rdel(id){return fetch(srv()+'/Ratings/Items/'+id+'/Rating',{method:'DELETE',headers:ah()}).then(function(r){return r.ok;}).catch(function(){return false;});}
  function sts(v){var f=Math.round(v/10*5);return'★'.repeat(Math.max(0,f))+'☆'.repeat(Math.max(0,5-f));}
  function ini(n){if(!n)return'?';var p=n.trim().split(/\s+/);return p.length>1?(p[0][0]+p[p.length-1][0]).toUpperCase():n.substring(0,2).toUpperCase();}
  function esc(s){return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');}
  function pimg(item,sz){sz=sz||300;if(item.ImageTags&&item.ImageTags.Primary)return srv()+'/Items/'+item.Id+'/Images/Primary?tag='+item.ImageTags.Primary+'&maxHeight='+sz+'&quality=85';if(item.SeriesId&&item.SeriesPrimaryImageTag)return srv()+'/Items/'+item.SeriesId+'/Images/Primary?tag='+item.SeriesPrimaryImageTag+'&maxHeight='+sz+'&quality=85';return '';}
  function avurl(id){return srv()+'/Users/'+id+'/Images/Primary?maxHeight=64&quality=85&_='+Math.floor(Date.now()/3600000);}
  function navTo(id){var a=AC(),sid=a&&((a._serverInfo&&a._serverInfo.Id)||(a.serverId&&a.serverId()));closeOv();setTimeout(function(){if(window.appRouter&&appRouter.showItem){appRouter.showItem({Id:id,ServerId:sid});return;}if(window.Emby&&Emby.Page&&Emby.Page.showItem){Emby.Page.showItem(id);return;}window.location.hash='#!/details?id='+id+(sid?'&serverId='+sid:'');},200);}
  function myRating(itemId){return rget('/Ratings/Items/'+itemId+'/DetailedRatings').then(function(data){if(!data)return null;var rows=Array.isArray(data)?data:(data.Ratings||data.ratings||[]);var me=uid();for(var i=0;i<rows.length;i++){if((rows[i].UserId||rows[i].userId)===me)return parseFloat(rows[i].Rating||rows[i].rating||0)||null;}return null;});}

  /* ── Sterne-Picker ───────────────────────────────────────── */
  function showPicker(container,itemId,itemName,cur,onDone){
    container.innerHTML='';var sel=cur||0;
    var wrap=document.createElement('div');wrap.className='jrpk';
    var tit=document.createElement('div');tit.className='jrpkt';tit.textContent='Rate: '+itemName;wrap.appendChild(tit);
    var srow=document.createElement('div');srow.className='jrsr';
    var vl=document.createElement('span');vl.className='jrpv';vl.textContent=sel?sel+'/10':'–';
    var sarr=[];
    for(var i=1;i<=10;i++){(function(v){var s=document.createElement('span');s.className='jrstar'+(v<=sel?' lit':'');s.textContent='★';
      s.addEventListener('mouseenter',function(){sarr.forEach(function(x,j){x.classList.toggle('lit',j<v);});vl.textContent=v+'/10';});
      s.addEventListener('mouseleave',function(){sarr.forEach(function(x,j){x.classList.toggle('lit',j<sel);});vl.textContent=sel?sel+'/10':'–';});
      s.addEventListener('click',function(){sel=v;sarr.forEach(function(x,j){x.classList.toggle('lit',j<sel);});vl.textContent=sel+'/10';});
      sarr.push(s);srow.appendChild(s);})(i);}
    srow.appendChild(vl);wrap.appendChild(srow);
    var msg=document.createElement('div');msg.className='jrpmsg';wrap.appendChild(msg);
    var acts=document.createElement('div');acts.className='jrpa';
    var sv=document.createElement('button');sv.className='jrpsv';sv.textContent=cur?'Change':'Rate';
    sv.addEventListener('click',function(){
      if(!sel){msg.className='jrpmsg err';msg.textContent='Please select stars.';return;}
      sv.disabled=true;sv.textContent='…';
      rsubmit(itemId,sel).then(function(ok){
        if(ok){msg.className='jrpmsg ok';msg.textContent='✓ Saved ('+sel+'/10)';setTimeout(function(){if(onDone)onDone(sel);},700);}
        else{msg.className='jrpmsg err';msg.textContent='Error – try again.';sv.disabled=false;sv.textContent=cur?'Change':'Rate';}
      });
    });acts.appendChild(sv);
    if(cur){var dv=document.createElement('button');dv.className='jrpdl';dv.textContent='Remove';
      dv.addEventListener('click',function(){dv.disabled=true;dv.textContent='…';
        rdel(itemId).then(function(ok){if(ok){msg.className='jrpmsg ok';msg.textContent='✓ Removed';setTimeout(function(){if(onDone)onDone(null);},700);}
          else{msg.className='jrpmsg err';msg.textContent='Error.';dv.disabled=false;dv.textContent='Remove';}});});acts.appendChild(dv);}
    var ca=document.createElement('button');ca.className='jrpcn';ca.textContent='Cancel';ca.addEventListener('click',function(){container.innerHTML='';});acts.appendChild(ca);
    wrap.appendChild(acts);container.appendChild(wrap);
  }

  function attachRate(btn,pel,itemId,itemName){
    btn.addEventListener('click',function(e){e.stopPropagation();if(pel.hasChildNodes()){pel.innerHTML='';return;}
      btn.textContent='…';btn.disabled=true;
      myRating(itemId).then(function(r){btn.disabled=false;btn.textContent=r?'⭐ '+r+'/10':'⭐ Rate';btn.classList.toggle('rated',!!r);
        showPicker(pel,itemId,itemName,r,function(nv){pel.innerHTML='';btn.textContent=nv?'⭐ '+nv+'/10':'⭐ Rate';btn.classList.toggle('rated',!!nv);cdel('movies');cdel('series');DC.movies=null;DC.series=null;});
      });
    });
  }

  /* ── Data Cache ──────────────────────────────────────────── */
  var DC={movies:null,series:null,users:null,wl:{},hist:{}};

  function loadAll(){
    var cm=cget('movies'),cs=cget('series');if(cm)DC.movies=cm;if(cs)DC.series=cs;
    return Promise.all([
      DC.movies?Promise.resolve():loadRanking('Movie').then(function(r){DC.movies=r;cset('movies',r);}),
      DC.series?Promise.resolve():loadRanking('Series').then(function(r){DC.series=r;cset('series',r);}),
      DC.users?Promise.resolve():jget('Users').then(function(data){DC.users=Array.isArray(data)?data.map(function(u){return{Id:u.Id,Name:u.Name};}):[];})
    ]);
  }

  function loadRanking(type){
    return jget('Items',{Recursive:true,IncludeItemTypes:type,Fields:'ProductionYear,Genres,ImageTags',Limit:1000,UserId:uid()})
      .then(function(data){if(!data||!data.Items)return[];
        var items=data.Items,res=new Array(items.length).fill(null),idx=0;
        function next(){if(idx>=items.length)return Promise.resolve();var s=idx;idx+=30;
          return Promise.all(items.slice(s,s+30).map(function(it,i){return rget('/Ratings/Items/'+it.Id+'/Stats').then(function(st){res[s+i]=st;});})).then(next);}
        return next().then(function(){var ranked=[];
          items.forEach(function(it,i){var st=res[i];if(!st||!st.TotalRatings||st.TotalRatings===0)return;
            ranked.push({id:it.Id,name:it.Name,year:it.ProductionYear||'',genres:(it.Genres||[]).slice(0,2).join(' · '),avg:parseFloat(st.AverageRating||0),count:st.TotalRatings||0,imgTag:it.ImageTags&&it.ImageTags.Primary});});
          ranked.sort(function(a,b){return b.avg-a.avg||b.count-a.count;});return ranked;});
      });
  }

  function loadWL(id){if(DC.wl[id])return Promise.resolve(DC.wl[id]);
    return jget('Users/'+id+'/Items',{Filters:'IsFavorite',Recursive:true,IncludeItemTypes:'Movie,Series',Fields:'ImageTags,ProductionYear',Limit:200})
      .then(function(d){var it=(d&&d.Items)||[];DC.wl[id]=it;return it;});}

  function loadHist(id){if(DC.hist[id])return Promise.resolve(DC.hist[id]);
    return fetch(srv()+'/user_usage_stats/UserPlaylist?user_id='+id+'&days=90&limit=100',{headers:ah()})
      .then(function(r){if(!r.ok)throw 0;return r.json();})
      .then(function(data){var rows=Array.isArray(data)?data:(data.results||data.Items||[]);
        var it=rows.map(function(row){return{Id:row.ItemId||row.id||'',Name:row.ItemName||row.name||'',Type:row.ItemType||row.type||'',SeriesName:row.SeriesName||'',SeasonNum:row.SeasonNumber,EpisodeNum:row.EpisodeNumber,PlayedDate:row.DateCreated||row.date||'',RunTime:row.PlayDuration||row.duration||0,ImageTags:{Primary:row.PrimaryImageTag||''},SeriesId:row.SeriesId||''};});
        DC.hist[id]=it;return it;})
      .catch(function(){return jget('Users/'+id+'/Items',{Filters:'IsPlayed',Recursive:true,IncludeItemTypes:'Movie,Episode',SortBy:'DatePlayed',SortOrder:'Descending',Fields:'ImageTags,SeriesName,ParentIndexNumber,IndexNumber,RunTimeTicks,SeriesId',Limit:150})
        .then(function(d){var it=(d&&d.Items)||[];DC.hist[id]=it;return it;});});}

  /* ── Render ──────────────────────────────────────────────── */
  function gb(){return document.getElementById('jrb');}

  function renderTab(tab){var b=gb();if(!b)return;
    if(tab==='movies'||tab==='series')renderRanking(tab);
    else if(tab==='watchlist')renderPills('watchlist');
    else if(tab==='history')renderPills('history');
    else if(tab==='rate')renderRateTab();}

  function renderRanking(tab){var b=gb();if(!b)return;var items=DC[tab];
    if(!items){b.innerHTML='<div class="jrspin">Loading…</div>';
      loadRanking(tab==='movies'?'Movie':'Series').then(function(r){DC[tab]=r;cset(tab,r);renderRanking(tab);});return;}
    b.innerHTML='';var sec=document.createElement('div');sec.className='jrs';
    sec.innerHTML='<h2>'+(tab==='movies'?'Ranked Movies':'Ranked Series')+'</h2><div class="jrsub">'+items.length+' rated title'+(items.length!==1?'s':'')+'</div>';
    if(!items.length){sec.innerHTML+='<div class="jrempty">No rated titles yet.</div>';b.appendChild(sec);return;}
    var list=document.createElement('div');list.className='jrl';
    items.forEach(function(item,i){
      var rank=i+1,medal=rank===1?'🥇':rank===2?'🥈':rank===3?'🥉':null;
      var img=item.imgTag?srv()+'/Items/'+item.id+'/Images/Primary?tag='+item.imgTag+'&maxHeight=110&quality=85':'';
      if(rank===4&&items.length>3){var dv=document.createElement('div');dv.className='jrdiv';list.appendChild(dv);}
      var wrap=document.createElement('div');wrap.className='jriw';wrap.dataset.name=item.name.toLowerCase();
      var row=document.createElement('div');row.className='jrrow'+(rank<=3?' hi':'');
      row.innerHTML='<div class="jrrank'+(medal?'':' pl')+'">'+(medal||rank)+'</div>'
        +(img?'<img class="jrposter" src="'+img+'" alt="" loading="lazy" onerror="this.style.display=\'none\'">':'<div class="jrposter" style="display:flex;align-items:center;justify-content:center;font-size:12px;color:rgba(255,255,255,.1)">▪</div>')
        +'<div class="jrinfo"><div class="jrname">'+esc(item.name)+'</div><div class="jrmeta">'+item.year+(item.genres?' · '+esc(item.genres):'')+'</div></div>'
        +'<div class="jrsc2"><div class="jravg">'+item.avg.toFixed(1)+'<small>/10</small></div><div class="jrstars">'+sts(item.avg)+'</div><div class="jrrc">'+item.count+' rating'+(item.count!==1?'s':'')+'</div></div>'
        +'<button class="jrrb">⭐ Rate</button><button class="jrexp">▾</button>';
      var rb=row.querySelector('.jrrb'),eb=row.querySelector('.jrexp'),pel=document.createElement('div');
      attachRate(rb,pel,item.id,item.name);
      var panel=document.createElement('div');panel.className='jrep';panel.style.display='none';
      panel.innerHTML='<div class="jrspin" style="padding:.7em 0">Loading…</div>';
      eb.addEventListener('click',function(e){e.stopPropagation();var op=panel.style.display!=='none';panel.style.display=op?'none':'block';eb.textContent=op?'▾':'▴';eb.classList.toggle('open',!op);
        if(!op&&!panel.dataset.loaded){panel.dataset.loaded='1';rget('/Ratings/Items/'+item.id+'/DetailedRatings').then(function(d){renderExpand(panel,d);});}});
      row.addEventListener('click',function(e){if(eb.contains(e.target)||rb.contains(e.target))return;navTo(item.id);});
      wrap.appendChild(row);wrap.appendChild(pel);wrap.appendChild(panel);list.appendChild(wrap);
    });sec.appendChild(list);b.appendChild(sec);}

  /* User-Name-Cache: userId -> Name */
  var userNameCache={};
  function getUserName(rid,given){
    if(given) return Promise.resolve(given);
    if(userNameCache[rid]) return Promise.resolve(userNameCache[rid]);
    if(DC.users){var f=DC.users.filter(function(u){return u.Id===rid;})[0];if(f){userNameCache[rid]=f.Name;return Promise.resolve(f.Name);}}
    return jget('Users/'+rid).then(function(u){var n=(u&&(u.Name||u.name))||'User';userNameCache[rid]=n;return n;}).catch(function(){return 'User';});
  }

  function renderExpand(panel,data){
    var rows=data&&(Array.isArray(data)?data:(data.Ratings||data.ratings||[]));
    if(!rows||!rows.length){panel.innerHTML='<div class="jreptit">User Ratings</div><div class="jrempty">No ratings found.</div>';return;}
    rows.sort(function(a,b){return(b.Rating||b.rating||0)-(a.Rating||a.rating||0);});
    panel.innerHTML='<div class="jreptit">User Ratings</div><div class="jrspin" style="padding:.4em 0">Loading…</div>';
    Promise.all(rows.map(function(r){
      var rid=r.UserId||r.userId||'';
      var given=r.UserName||r.userName||r.Name||r.name||'';
      return getUserName(rid,given).then(function(name){return{name:name,rid:rid,rating:parseFloat(r.Rating||r.rating||0)};});
    })).then(function(res){
      var html='<div class="jreptit">User Ratings</div>';
      res.forEach(function(u){
        var av=u.rid?'<div class="jrav"><img src="'+avurl(u.rid)+'" alt="" onerror="this.parentElement.textContent=\''+ini(u.name).replace(/'/g,"\\'")+'\'"></div>':'<div class="jrav">'+ini(u.name)+'</div>';
        html+='<div class="jrur">'+av+'<span class="jrun">'+esc(u.name)+'</span><span class="jrus">'+sts(u.rating)+'</span><span class="jruv">'+u.rating.toFixed(1)+'/10</span></div>';
      });
      panel.innerHTML=html;
    });
  }

  function filterRanking(q){var b=gb();if(!b)return;b.querySelectorAll('.jriw').forEach(function(w){w.style.display=(!q||(w.dataset.name||'').includes(q))?'':'none';});}

  function renderPills(mode){var b=gb();if(!b)return;b.innerHTML='';
    var sec=document.createElement('div');sec.className='jrs';
    sec.innerHTML='<h2>'+(mode==='watchlist'?'Watchlists':'Watch History')+'</h2>';
    if(!DC.users||!DC.users.length){sec.innerHTML+='<div class="jrempty">No users found.</div>';b.appendChild(sec);return;}
    var pills=document.createElement('div');pills.className='jrpills';
    DC.users.forEach(function(user){var p=document.createElement('button');p.className='jrpill';
      p.innerHTML='<div class="jrpav"><img src="'+avurl(user.Id)+'" alt="" onerror="this.parentElement.textContent=\''+ini(user.Name).replace(/'/g,"\\'")+'\'" ></div><span class="jrpnm">'+esc(user.Name)+'</span>';
      p.addEventListener('click',function(){delete DC.wl[user.Id];delete DC.hist[user.Id];if(mode==='watchlist')showWL(user,sec,pills);else showHist(user,sec,pills);});pills.appendChild(p);});
    sec.appendChild(pills);b.appendChild(sec);}

  function showWL(user,sec,pills){pills.style.display='none';
    var det=document.createElement('div');det.innerHTML=bkHdr(user,'watchlist');
    det.querySelector('.jrbk').addEventListener('click',function(){det.remove();pills.style.display='';});
    var grid=document.createElement('div');grid.className='jrcards';grid.innerHTML='<div class="jrspin">Loading…</div>';
    det.appendChild(grid);sec.appendChild(det);
    loadWL(user.Id).then(function(items){grid.innerHTML='';
      if(!items.length){grid.innerHTML='<div class="jrempty">Watchlist is empty.</div>';return;}
      items.forEach(function(item){var img=pimg(item,300);var card=document.createElement('div');card.className='jrcard';card.dataset.name=(item.Name||'').toLowerCase();
        card.innerHTML='<div class="jrci">'+(img?'<img src="'+img+'" alt="" loading="lazy" onerror="this.style.display=\'none\'">':'')+'</div><div class="jrct">'+esc(item.Name||'')+'</div><div class="jrcs">'+(item.ProductionYear||'')+'</div>';
        card.addEventListener('click',function(){navTo(item.Id);});grid.appendChild(card);});});}

  function showHist(user,sec,pills){pills.style.display='none';
    var det=document.createElement('div');det.innerHTML=bkHdr(user,'history');
    det.querySelector('.jrbk').addEventListener('click',function(){det.remove();pills.style.display='';});
    var list=document.createElement('div');list.innerHTML='<div class="jrspin">Loading…</div>';
    det.appendChild(list);sec.appendChild(det);
    loadHist(user.Id).then(function(items){list.innerHTML='';
      if(!items.length){list.innerHTML='<div class="jrempty">No watch history found.</div>';return;}
      var pm='';
      items.forEach(function(item,idx){
        var d=item.PlayedDate?new Date(item.PlayedDate):null;
        var mo=d?d.toLocaleString('en',{month:'long',year:'numeric'}):'';
        if(mo&&mo!==pm){pm=mo;var mh=document.createElement('div');mh.className='jrsub';mh.style.paddingTop=idx===0?'0':'11px';mh.textContent=mo;list.appendChild(mh);}
        var row=document.createElement('div');
        var title=item.SeriesName||item.Name||'',sub='';
        if(item.Type==='Episode'||(item.SeriesName&&item.SeriesName!==item.Name)){
          var sn=item.ParentIndexNumber!=null?item.ParentIndexNumber:(item.SeasonNum!=null?item.SeasonNum:null);
          var en=item.IndexNumber!=null?item.IndexNumber:(item.EpisodeNum!=null?item.EpisodeNum:null);
          if(sn!=null&&en!=null)sub='S'+sn+' E'+en;else if(en!=null)sub='E'+en;else sub='Episode';
        }else{sub='Movie';var rt=item.RunTimeTicks||item.RunTime||0;if(rt>0)sub+=' · '+Math.round(rt/600000000)+' min';}
        var img=pimg(item,110);
        row.className='jrhr'+(idx%2===0?' hi':'')+(item.Id?' cl':'');
        row.dataset.name=((item.Name||'')+' '+(item.SeriesName||'')).toLowerCase();
        row.innerHTML='<div class="jrhdate">'+(d?'<div class="jrhday">'+d.getDate()+'</div><div class="jrhmon">'+d.toLocaleString('en',{month:'short'})+'</div>':'<div class="jrhday">—</div>')+'</div>'
          +(img?'<img class="jrposter" src="'+img+'" alt="" loading="lazy" onerror="this.style.display=\'none\'">':'<div class="jrposter" style="display:flex;align-items:center;justify-content:center;font-size:12px;color:rgba(255,255,255,.1)">▪</div>')
          +'<div class="jrinfo"><div class="jrname">'+esc(title)+'</div><div class="jrmeta">'+esc(sub)+'</div></div>';
        if(item.Id)row.addEventListener('click',function(){navTo(item.Id);});list.appendChild(row);});});}

  function bkHdr(user,mode){return '<div class="jrdh"><button class="jrbk">← Back</button><span class="jrdl"><span style="display:inline-flex;align-items:center;gap:5px;"><span style="display:inline-flex;width:14px;height:14px;border-radius:50%;background:rgba(255,255,255,.15);align-items:center;justify-content:center;font-size:6px;color:rgba(255,255,255,.8);">'+ini(user.Name)+'</span>'+esc(user.Name)+"'s "+mode+'</span></span></div>';}

  /* ── Rate-Tab ────────────────────────────────────────────── */
  var rtTimer=null;
  function renderRateTab(){var b=gb();if(!b)return;b.innerHTML='';
    var sec=document.createElement('div');sec.className='jrs';
    sec.innerHTML='<h2>Search &amp; Rate</h2><div class="jrsub">Find any movie or series</div>';
    var inp=document.createElement('input');inp.id='jrts';inp.type='text';inp.placeholder='Search titles…';inp.autocomplete='off';
    sec.appendChild(inp);var res=document.createElement('div');res.className='jrl';sec.appendChild(res);b.appendChild(sec);inp.focus();
    inp.addEventListener('input',function(){var q=inp.value.trim();res.innerHTML='';if(q.length<2)return;
      clearTimeout(rtTimer);rtTimer=setTimeout(function(){res.innerHTML='<div class="jrspin">Searching…</div>';
        jget('Items',{SearchTerm:q,Recursive:true,IncludeItemTypes:'Movie,Series',Fields:'ProductionYear,Genres,ImageTags',Limit:40,UserId:uid()})
          .then(function(data){renderRateResults(res,(data&&data.Items)||[]);});},350);});}

  function renderRateResults(container,items){container.innerHTML='';
    if(!items.length){container.innerHTML='<div class="jrempty">No results.</div>';return;}
    items.forEach(function(item){var wrap=document.createElement('div');wrap.className='jriw';
      var img=item.ImageTags&&item.ImageTags.Primary?srv()+'/Items/'+item.Id+'/Images/Primary?tag='+item.ImageTags.Primary+'&maxHeight=110&quality=85':'';
      var sid='jfrs-'+item.Id;
      var row=document.createElement('div');row.className='jrrow';
      row.innerHTML=(img?'<img class="jrposter" src="'+img+'" alt="" loading="lazy" onerror="this.style.display=\'none\'">':'<div class="jrposter" style="display:flex;align-items:center;justify-content:center;font-size:12px;color:rgba(255,255,255,.1)">▪</div>')
        +'<div class="jrinfo"><div class="jrname">'+esc(item.Name||'')+'</div><div class="jrmeta">'+esc(String(item.ProductionYear||''))+' · '+(item.Type==='Series'?'Series':'Movie')+'</div></div>'
        +'<div id="'+sid+'" class="jrsc2" style="font-size:.58em;color:rgba(255,255,255,.25);">…</div>'
        +'<button class="jrrb">⭐ Rate</button>';
      rget('/Ratings/Items/'+item.Id+'/Stats').then(function(st){var el=document.getElementById(sid);if(!el)return;
        if(st&&st.TotalRatings){var avg=parseFloat(st.AverageRating||0);el.innerHTML='<div class="jravg">'+avg.toFixed(1)+'<small>/10</small></div><div class="jrstars">'+sts(avg)+'</div><div class="jrrc">'+st.TotalRatings+' ratings</div>';}
        else el.innerHTML='<span style="font-size:.58em;color:rgba(255,255,255,.18)">–</span>';});
      var rb=row.querySelector('.jrrb'),pel=document.createElement('div');
      rb.addEventListener('click',function(e){e.stopPropagation();if(pel.hasChildNodes()){pel.innerHTML='';return;}
        rb.textContent='…';rb.disabled=true;
        myRating(item.Id).then(function(r){rb.disabled=false;rb.textContent=r?'⭐ '+r+'/10':'⭐ Rate';rb.classList.toggle('rated',!!r);
          showPicker(pel,item.Id,item.Name,r,function(nv){pel.innerHTML='';rb.textContent=nv?'⭐ '+nv+'/10':'⭐ Rate';rb.classList.toggle('rated',!!nv);
            rget('/Ratings/Items/'+item.Id+'/Stats').then(function(st){var el=document.getElementById(sid);if(!el||!st||!st.TotalRatings)return;var avg=parseFloat(st.AverageRating||0);
              el.innerHTML='<div class="jravg">'+avg.toFixed(1)+'<small>/10</small></div><div class="jrstars">'+sts(avg)+'</div><div class="jrrc">'+st.TotalRatings+' ratings</div>';});
            cdel('movies');cdel('series');DC.movies=null;DC.series=null;});});});
      row.addEventListener('click',function(e){if(rb.contains(e.target))return;navTo(item.Id);});
      wrap.appendChild(row);wrap.appendChild(pel);container.appendChild(wrap);});}

  /* ── Overlay öffnen ──────────────────────────────────────── */
  var openOv=function(){
    if(document.getElementById('jro')){closeOv();return;}
    injectCSS();
    var ov=document.createElement('div');ov.id='jro';
    /* WICHTIG: 2-Zeilen-Header hart im HTML */
    ov.innerHTML=
      '<div id="jrh">'
      +'<div id="jrh1">'
      +'<div id="jrtitle"><svg viewBox="0 0 24 24" width="14" height="14" style="flex-shrink:0;opacity:.88;fill:rgba(255,255,255,.85)"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>Ratings</div>'
      +'<div id="jrsw"><svg viewBox="0 0 24 24" width="12" height="12" style="fill:none;stroke:rgba(255,255,255,.4);stroke-width:2;stroke-linecap:round;flex-shrink:0"><circle cx="10.5" cy="10.5" r="6.5"/><line x1="15.5" y1="15.5" x2="21" y2="21"/></svg><input id="jrsi" type="text" placeholder="Filter…" autocomplete="off"/><button id="jrsc">✕</button></div>'
      +'<button id="jrclose">✕</button>'
      +'</div>'
      +'<div id="jrh2">'
      +'<button class="jrb on" data-tab="movies">Movies</button>'
      +'<button class="jrb" data-tab="series">Series</button>'
      +'<button class="jrb" data-tab="watchlist">Watchlist</button>'
      +'<button class="jrb" data-tab="history">History</button>'
      +'<button class="jrb" data-tab="rate">Search &amp; Rate</button>'
      +'</div>'
      +'</div>'
      +'<div id="jrb"><div class="jrspin">Loading…</div></div>';
    document.body.appendChild(ov);
    document.addEventListener('keydown',escH);
    document.getElementById('jrclose').onclick=closeOv;

    var curTab='movies',si=document.getElementById('jrsi'),sc=document.getElementById('jrsc');
    ov.querySelectorAll('.jrb[data-tab]').forEach(function(btn){
      btn.addEventListener('click',function(){
        ov.querySelectorAll('.jrb[data-tab]').forEach(function(b){b.classList.remove('on');});
        btn.classList.add('on');curTab=btn.dataset.tab;
        si.value='';sc.classList.remove('show');
        document.getElementById('jrsw').style.display=curTab==='rate'?'none':'';
        renderTab(curTab);});});
    si.addEventListener('input',function(){var q=si.value.trim().toLowerCase();sc.classList.toggle('show',q.length>0);if(q.length===0){renderTab(curTab);return;}if(curTab==='movies'||curTab==='series')filterRanking(q);});
    sc.addEventListener('click',function(){si.value='';sc.classList.remove('show');renderTab(curTab);si.focus();});
    loadAll().then(function(){renderTab('movies');});
  };

  var escH=function(e){if(e.key==='Escape')closeOv();};
  function closeOv(){document.removeEventListener('keydown',escH);var o=document.getElementById('jro');if(o)o.remove();var w=document.getElementById('ir-widget');if(w)w.style.display='none';}

  /* ── Tab patchen ─────────────────────────────────────────── */
  function patchTab(){
    document.querySelectorAll('[id^="customTabButton"],.emby-tab-button,[class*="tabButton"],[class*="tab-button"]').forEach(function(btn){
      if(btn.dataset.jfPF)return;
      var te=btn.querySelector('.emby-tab-button-text,span')||btn;
      if(!/^ratings$/i.test(te.textContent.trim()))return;
      btn.dataset.jfPF='1';btn.classList.add('jrt-tp');
      var ic=document.createElement('span');ic.className='jrt-ti';
      ic.innerHTML='<svg viewBox="0 0 24 24" width="22" height="22"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" fill="currentColor"/></svg>';
      btn.insertBefore(ic,btn.firstChild);
      btn.addEventListener('click',function(e){e.preventDefault();e.stopImmediatePropagation();openOv();},true);
      console.log('[Ratings] Tab patched ✓');
    });}

  /* ── Init ────────────────────────────────────────────────── */
  var iv=setInterval(function(){if(typeof ApiClient==='undefined')return;injectCSS();patchTab();var w=document.getElementById('ir-widget');if(w)w.style.display='none';},400);
  setTimeout(function(){clearInterval(iv);},20000);
  new MutationObserver(function(){patchTab();var w=document.getElementById('ir-widget');if(w)w.style.display='none';}).observe(document.body,{childList:true,subtree:true});
  window.__openRatingsOverlay=openOv;
  console.log('[Ratings FINAL] Loaded ✓');
})();
