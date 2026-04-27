/* ══════════════════════════════════════════════════════════
   Jellyfin Custom – Alles in einem
   ══════════════════════════════════════════════════════════ */

/* ════════════════════════════════════════════════════════════
   1) SEARCH FILTER
   ════════════════════════════════════════════════════════════ */
(function () {
  'use strict';
  var _origFetch = window.fetch;
  window._origFetch = _origFetch; /* expose for other modules */
  window.fetch = function (input, init) {
    return _origFetch.apply(this, arguments).then(function (response) {
      var url = (typeof input === 'string' ? input : (input && input.url)) || '';
      var hasSearchTerm = /[?&][Ss]earch[Tt]erm=/.test(url);
      var isSearchHints = /\/Search\/Hints/.test(url);
      if (!hasSearchTerm && !isSearchHints) return response;
      var clone = response.clone();
      return clone.json().then(function (data) {
        if (!data) return response;
        if (Array.isArray(data.Items)) {
          var before = data.Items.length;
          data.Items = data.Items.filter(function (item) { return item.Type !== 'Episode'; });
          data.TotalRecordCount = (data.TotalRecordCount || before) - (before - data.Items.length);
        }
        if (Array.isArray(data.SearchHints)) {
          data.SearchHints = data.SearchHints.filter(function (item) { return item.Type !== 'Episode'; });
          data.TotalRecordCount = data.SearchHints.length;
        }
        var newBody = JSON.stringify(data);
        return new Response(newBody, { status: response.status, statusText: response.statusText, headers: response.headers });
      }).catch(function () { return response; });
    });
  };
  var sfStyle = document.createElement('style');
  sfStyle.textContent = '.itemsContainer[data-type="Episode"]{display:none!important;}';
  document.head.appendChild(sfStyle);
  function hideEpisodeSections() {
    document.querySelectorAll('.sectionTitle,.listHeader,h1,h2,h3,.sectionTitleContainer').forEach(function (header) {
      if (/episode|folgen|episoden/i.test(header.textContent || '')) {
        var section = header.closest('.verticalSection') || header.closest('.section') || header.closest('[data-type]') || header.parentElement;
        if (section) section.style.display = 'none';
      }
    });
    document.querySelectorAll('[data-type="Episode"],.card[data-itemtype="Episode"]').forEach(function (card) {
      var wrap = card.closest('.cardBox') || card.closest('li') || card;
      wrap.style.display = 'none';
    });
  }
  new MutationObserver(function () {
    if (!/search/i.test(window.location.href) && !document.querySelector('.searchPage,.searchResults,#searchPage')) return;
    hideEpisodeSections();
  }).observe(document.body, { childList: true, subtree: true });
  hideEpisodeSections();
})();


/* ════════════════════════════════════════════════════════════
   2) RATINGS OVERLAY
   ════════════════════════════════════════════════════════════ */
(function () {
  'use strict';
  ['jf-rat-css','jfrat3css','jf-rat-css2'].forEach(function(id){var el=document.getElementById(id);if(el)el.remove();});
  (function(){var s=document.createElement('style');s.id='jfrat-irfix';s.textContent='#ir-widget,#ir-widget-on,.ir-pill,[id^="ir-widget"]{display:none!important;}';document.head.appendChild(s);})();
  document.addEventListener('click', function(e){
    var btn = e.target;
    for(var i=0;i<5;i++){
      if(!btn) break;
      var te = btn.querySelector && (btn.querySelector('.emby-tab-button-text,span') || btn);
      var txt = (te && te.textContent || btn.textContent || '').trim();
      if(/^ratings$/i.test(txt) && (btn.dataset.jfRatPatched || btn.dataset.jfPF || btn.dataset.jfP3)){e.stopImmediatePropagation();e.preventDefault();openOv();return;}
      btn = btn.parentElement;
    }
  }, true);
  var TTL=86400000;
  function ck(k){return 'jfratF_'+k;}
  function cget(k){try{var r=localStorage.getItem(ck(k));if(!r)return null;var o=JSON.parse(r);if(Date.now()-o.ts>TTL){localStorage.removeItem(ck(k));return null;}return o.d;}catch(e){return null;}}
  function cset(k,d){try{localStorage.setItem(ck(k),JSON.stringify({ts:Date.now(),d:d}));}catch(e){}}
  function cdel(k){try{localStorage.removeItem(ck(k));}catch(e){}}
  var CSS=['.jrt-ti{display:flex;align-items:center;justify-content:center;}.jrt-ti svg{width:22px;height:22px;fill:currentColor;opacity:.87;}.jrt-tp{display:flex!important;flex-direction:column!important;align-items:center!important;justify-content:center!important;}','#jro{position:fixed;inset:0;z-index:99999;background:rgba(0,0,0,.55);backdrop-filter:blur(24px) saturate(1.4);-webkit-backdrop-filter:blur(24px) saturate(1.4);display:flex;flex-direction:column;overflow:hidden;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;}','#jrh{display:flex;flex-direction:column;flex-shrink:0;background:rgba(0,0,0,.2);border-bottom:1px solid rgba(255,255,255,.12);}','#jrh1{display:flex;align-items:center;gap:9px;padding:11px 14px;}','#jrtitle{font-size:1.1em;font-weight:300;letter-spacing:.03em;display:flex;align-items:center;gap:7px;color:rgba(255,255,255,.95);flex-shrink:0;}','#jrsw{display:flex;align-items:center;gap:6px;flex:1;background:rgba(255,255,255,.07);border:1px solid rgba(255,255,255,.14);border-radius:8px;padding:6px 10px;transition:border-color .2s;}','#jrsw:focus-within{border-color:rgba(255,255,255,.38);}','#jrsi{background:none;border:none;outline:none;color:#fff;font-size:.8em;flex:1;font-family:inherit;min-width:0;}','#jrsi::placeholder{color:rgba(255,255,255,.3);}','#jrsc{background:none;border:none;color:rgba(255,255,255,.35);cursor:pointer;font-size:12px;padding:0;display:none;flex-shrink:0;line-height:1;}','#jrsc.show{display:block;}','#jrclose{background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.18);color:rgba(255,255,255,.85);border-radius:50%;width:30px;height:30px;cursor:pointer;display:flex;align-items:center;justify-content:center;flex-shrink:0;font-size:.9em;}','#jrh2{display:flex;flex-wrap:wrap;gap:5px;row-gap:5px;padding:0 14px 10px;justify-content:center;}','.jrb{background:rgba(255,255,255,.07);border:1px solid rgba(255,255,255,.14);color:rgba(255,255,255,.7);border-radius:8px;padding:5px 12px;cursor:pointer;flex-shrink:0;font-size:.76em;font-family:inherit;white-space:nowrap;transition:background .15s,color .15s;}','.jrb:hover{background:rgba(255,255,255,.14);color:#fff;}','.jrb.on{background:rgba(255,255,255,.22);border-color:rgba(255,255,255,.5);color:#fff;font-weight:500;}','#jrb{flex:1;overflow-y:auto;padding:0 14px 3em;scrollbar-width:thin;scrollbar-color:rgba(255,255,255,.2) transparent;}','#jrb::-webkit-scrollbar{width:4px;}','#jrb::-webkit-scrollbar-thumb{background:rgba(255,255,255,.2);border-radius:2px;}','.jrs{padding-top:26px;}','.jrs h2{font-size:1.1em;font-weight:300;letter-spacing:.04em;margin:0 0 .3em;color:rgba(255,255,255,.9);}','.jrsub{font-size:.68em;color:rgba(255,255,255,.3);letter-spacing:.08em;text-transform:uppercase;margin-bottom:13px;}','.jrl{display:flex;flex-direction:column;gap:2px;}','.jriw{border-radius:9px;overflow:hidden;margin-bottom:2px;}','.jrrow{display:flex;align-items:center;gap:10px;padding:8px 10px;cursor:pointer;transition:background .15s;}','.jrrow:hover{background:rgba(255,255,255,.05);}','.jrrow.hi{background:rgba(255,255,255,.06);}','.jrrank{font-size:1.1em;width:26px;text-align:center;flex-shrink:0;}','.jrrank.pl{font-size:.78em;color:rgba(255,255,255,.25);font-weight:600;}','.jrposter{width:34px;height:50px;border-radius:4px;background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.06);flex-shrink:0;object-fit:cover;}','.jrinfo{flex:1;min-width:0;}','.jrname{font-size:.84em;font-weight:500;color:#fff;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}','.jrmeta{font-size:.67em;color:rgba(255,255,255,.38);margin-top:2px;}','.jrsc2{text-align:right;flex-shrink:0;margin-right:5px;}','.jravg{font-size:1.05em;font-weight:500;color:#fff;line-height:1;}','.jravg small{font-size:.5em;color:rgba(255,255,255,.28);font-weight:300;}','.jrstars{font-size:.56em;color:rgba(255,255,255,.5);margin-top:2px;letter-spacing:1px;}','.jrrc{font-size:.58em;color:rgba(255,255,255,.28);margin-top:1px;}','.jrexp{background:rgba(255,255,255,.07);border:1px solid rgba(255,255,255,.13);color:rgba(255,255,255,.55);border-radius:6px;width:22px;height:22px;cursor:pointer;display:flex;align-items:center;justify-content:center;flex-shrink:0;font-size:10px;font-family:inherit;transition:all .15s;}','.jrexp:hover,.jrexp.open{background:rgba(255,255,255,.14);border-color:rgba(255,255,255,.3);color:#fff;}','.jrep{background:rgba(0,0,0,.2);padding:8px 12px;border-top:1px solid rgba(255,255,255,.06);}','.jreptit{font-size:.61em;color:rgba(255,255,255,.3);letter-spacing:.08em;text-transform:uppercase;margin-bottom:7px;}','.jrur{display:flex;align-items:center;gap:8px;margin-bottom:5px;}','.jrur:last-child{margin-bottom:0;}','.jrav{width:18px;height:18px;border-radius:50%;background:rgba(255,255,255,.15);display:flex;align-items:center;justify-content:center;font-size:7px;color:rgba(255,255,255,.8);flex-shrink:0;overflow:hidden;}','.jrav img{width:100%;height:100%;object-fit:cover;}','.jrun{font-size:.74em;color:rgba(255,255,255,.7);flex:1;}','.jrus{font-size:.6em;color:rgba(255,255,255,.5);letter-spacing:1px;}','.jruv{font-size:.74em;font-weight:500;color:rgba(255,255,255,.9);margin-left:4px;}','.jrdiv{height:1px;background:rgba(255,255,255,.06);margin:4px 0;}','.jrrb{background:rgba(255,193,7,.12);border:1px solid rgba(255,193,7,.28);color:rgba(255,210,60,.85);border-radius:6px;padding:3px 7px;font-size:.65em;font-family:inherit;cursor:pointer;white-space:nowrap;flex-shrink:0;transition:background .15s;}','.jrrb:hover{background:rgba(255,193,7,.25);}','.jrrb.rated{background:rgba(255,193,7,.22);border-color:rgba(255,193,7,.55);color:#ffe040;}','.jrpk{background:rgba(0,0,0,.55);border:1px solid rgba(255,255,255,.11);border-radius:9px;padding:10px 12px;margin:2px 0 3px;}','.jrpkt{font-size:.65em;color:rgba(255,255,255,.35);letter-spacing:.06em;text-transform:uppercase;margin-bottom:8px;}','.jrsr{display:flex;gap:2px;align-items:center;margin-bottom:8px;flex-wrap:wrap;}','.jrstar{font-size:1.4em;cursor:pointer;color:rgba(255,255,255,.18);transition:color .1s,transform .1s;user-select:none;line-height:1;}','.jrstar:hover,.jrstar.lit{color:#FFD700;}','.jrstar:hover{transform:scale(1.15);}','.jrpv{font-size:.76em;color:rgba(255,255,255,.42);min-width:28px;margin-left:5px;}','.jrpa{display:flex;gap:6px;flex-wrap:wrap;}','.jrpsv{background:rgba(255,193,7,.2);border:1px solid rgba(255,193,7,.42);color:#ffe040;border-radius:7px;padding:4px 11px;font-size:.73em;font-family:inherit;cursor:pointer;}','.jrpsv:hover{background:rgba(255,193,7,.35);}','.jrpdl{background:rgba(255,60,60,.08);border:1px solid rgba(255,60,60,.25);color:rgba(255,120,120,.9);border-radius:7px;padding:4px 11px;font-size:.73em;font-family:inherit;cursor:pointer;}','.jrpdl:hover{background:rgba(255,60,60,.18);}','.jrpcn{background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.11);color:rgba(255,255,255,.42);border-radius:7px;padding:4px 11px;font-size:.73em;font-family:inherit;cursor:pointer;}','.jrpmsg{font-size:.68em;margin-top:5px;}','.jrpmsg.ok{color:#7ec87e;}.jrpmsg.err{color:#f88;}','.jrpills{display:flex;gap:7px;flex-wrap:wrap;margin-bottom:16px;}','.jrpill{display:flex;align-items:center;gap:7px;padding:5px 11px;border-radius:8px;border:1px solid rgba(255,255,255,.13);background:rgba(255,255,255,.07);cursor:pointer;font-family:inherit;transition:background .15s;}','.jrpill:hover{background:rgba(255,255,255,.13);}','.jrpav{width:20px;height:20px;border-radius:50%;background:rgba(255,255,255,.15);overflow:hidden;display:flex;align-items:center;justify-content:center;font-size:8px;color:rgba(255,255,255,.8);flex-shrink:0;}','.jrpav img{width:100%;height:100%;object-fit:cover;}','.jrpnm{font-size:.79em;color:#fff;}','.jrdh{display:flex;align-items:center;gap:8px;margin-bottom:12px;}','.jrbk{background:rgba(255,255,255,.07);border:1px solid rgba(255,255,255,.13);color:rgba(255,255,255,.65);border-radius:6px;padding:4px 10px;font-size:.72em;cursor:pointer;font-family:inherit;}','.jrbk:hover{background:rgba(255,255,255,.14);color:#fff;}','.jrdl{font-size:.76em;color:rgba(255,255,255,.45);}','.jrcards{display:flex;flex-wrap:wrap;gap:9px;}','.jrcard{width:100px;flex-shrink:0;cursor:pointer;transition:transform .2s,opacity .2s;}','.jrcard:hover{transform:scale(1.05);opacity:.85;}','.jrci{width:100px;height:150px;border-radius:6px;overflow:hidden;background:rgba(255,255,255,.06);position:relative;border:1px solid rgba(255,255,255,.07);}','.jrci img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;display:block;}','.jrct{font-size:.7em;margin-top:5px;text-align:center;color:rgba(255,255,255,.8);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}','.jrcs{font-size:.62em;margin-top:2px;text-align:center;color:rgba(255,255,255,.36);}','.jrhr{display:flex;align-items:center;gap:10px;padding:7px 10px;border-radius:9px;transition:background .15s;}','.jrhr.cl{cursor:pointer;}','.jrhr:hover{background:rgba(255,255,255,.05);}','.jrhr.hi{background:rgba(255,255,255,.05);}','.jrhdate{width:30px;text-align:center;flex-shrink:0;}','.jrhday{font-size:.95em;font-weight:400;color:rgba(255,255,255,.88);line-height:1;}','.jrhmon{font-size:.58em;color:rgba(255,255,255,.3);}','.jrhtbadge{font-size:.6em;font-weight:600;letter-spacing:.04em;border-radius:4px;padding:2px 5px;flex-shrink:0;white-space:nowrap;}','.jrhtbadge.movie{background:rgba(59,130,246,.25);color:rgba(147,197,253,.9);border:1px solid rgba(59,130,246,.35);}','.jrhtbadge.ep{background:rgba(168,85,247,.22);color:rgba(216,180,254,.9);border:1px solid rgba(168,85,247,.32);}','.jrhfrow{display:flex;gap:5px;flex-wrap:wrap;margin-bottom:12px;}','.jrhfbtn{background:rgba(255,255,255,.07);border:1px solid rgba(255,255,255,.14);color:rgba(255,255,255,.6);border-radius:20px;padding:4px 12px;cursor:pointer;font-size:.72em;font-family:inherit;white-space:nowrap;transition:background .15s,color .15s;}','.jrhfbtn:hover{background:rgba(255,255,255,.13);color:#fff;}','.jrhfbtn.on{background:rgba(255,255,255,.2);border-color:rgba(255,255,255,.45);color:#fff;font-weight:500;}','.jrhmo{font-size:.64em;color:rgba(255,255,255,.28);letter-spacing:.1em;text-transform:uppercase;padding:14px 0 5px;border-bottom:1px solid rgba(255,255,255,.06);margin-bottom:4px;display:flex;align-items:center;justify-content:space-between;}','.jrhmo-count{background:rgba(255,255,255,.08);border-radius:10px;padding:1px 7px;font-size:1em;color:rgba(255,255,255,.35);}','#jrts{width:100%;background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.17);color:#fff;border-radius:9px;padding:9px 13px;font-size:.86em;font-family:inherit;outline:none;box-sizing:border-box;margin-bottom:13px;}','#jrts::placeholder{color:rgba(255,255,255,.3);}','#jrts:focus{border-color:rgba(255,255,255,.38);}','.jrspin{padding:2.5em;text-align:center;color:rgba(255,255,255,.38);font-size:.85em;}','.jrempty{padding:1.5em 0;color:rgba(255,255,255,.22);font-size:.82em;font-style:italic;}'].join('');
  function injectCSS(){var old=document.getElementById('jfratFcss');if(old)old.remove();var s=document.createElement('style');s.id='jfratFcss';s.textContent=CSS;document.head.appendChild(s);}
  injectCSS();
  function AC(){return window.ApiClient;}
  function srv(){var a=AC();return a?(a._serverAddress||a._serverUrl||'').replace(/\/$/,''):'';}
  function tok(){var a=AC();return a?(a._token||(a.accessToken&&a.accessToken())||''):''}
  function uid(){var a=AC();return a?(a._currentUserId||(a.getCurrentUserId&&a.getCurrentUserId())||''):'';}
  function ah(){return{'X-Emby-Token':tok(),'X-MediaBrowser-Token':tok()};}
  function jget(p,q){var qs=q?'?'+Object.keys(q).map(function(k){return encodeURIComponent(k)+'='+encodeURIComponent(q[k]);}).join('&'):'';return fetch(srv()+'/'+p+qs,{headers:ah()}).then(function(r){return r.ok?r.json():null;}).catch(function(){return null;});}
  function rget(p){return fetch(srv()+p,{headers:ah()}).then(function(r){return r.ok?r.json():null;}).catch(function(){return null;});}
  function ahFull(){var t=tok();return{'X-Emby-Token':t,'X-MediaBrowser-Token':t,'Authorization':'MediaBrowser Token="'+t+'"','Content-Type':'application/json'};}
  function rsubmit(id,n){var u=uid();var base=srv()+'/Ratings/Items/'+id+'/Rating';var endpoints=[{url:base+'?rating='+n+'&userId='+u,hdrs:ahFull(),body:'{}'},{url:base+'?rating='+n+'&userId='+u,hdrs:ah(),body:null},{url:base+'?rating='+n,hdrs:ahFull(),body:'{}'},{url:base+'?userId='+u,hdrs:ahFull(),body:JSON.stringify({Rating:n,rating:n,UserId:u})},{url:srv()+'/Ratings/Items/'+id+'/UserRating?rating='+n+'&userId='+u,hdrs:ahFull(),body:'{}'}];var lastStatus=[];function tryNext(i){if(i>=endpoints.length){window.__jfRatingLastStatus=lastStatus;return Promise.resolve(false);}var ep=endpoints[i];var opts={method:'POST',headers:ep.hdrs};if(ep.body)opts.body=ep.body;return fetch(ep.url,opts).then(function(r){lastStatus.push('V'+(i+1)+':'+r.status);if(r.ok)return true;return tryNext(i+1);}).catch(function(){lastStatus.push('V'+(i+1)+':ERR');return tryNext(i+1);});}return tryNext(0);}
  function rdel(id){return fetch(srv()+'/Ratings/Items/'+id+'/Rating',{method:'DELETE',headers:ah()}).then(function(r){return r.ok;}).catch(function(){return false;});}
  function sts(v){var f=Math.round(v/10*5);return'★'.repeat(Math.max(0,f))+'☆'.repeat(Math.max(0,5-f));}
  function ini(n){if(!n)return'?';var p=n.trim().split(/\s+/);return p.length>1?(p[0][0]+p[p.length-1][0]).toUpperCase():n.substring(0,2).toUpperCase();}
  function esc(s){return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');}
  function pimg(item,sz){sz=sz||300;if(item.ImageTags&&item.ImageTags.Primary)return srv()+'/Items/'+item.Id+'/Images/Primary?tag='+item.ImageTags.Primary+'&maxHeight='+sz+'&quality=85';if(item.SeriesId&&item.SeriesPrimaryImageTag)return srv()+'/Items/'+item.SeriesId+'/Images/Primary?tag='+item.SeriesPrimaryImageTag+'&maxHeight='+sz+'&quality=85';return '';}
  function avurl(id){return srv()+'/Users/'+id+'/Images/Primary?maxHeight=64&quality=85&_='+Math.floor(Date.now()/3600000);}
  function navTo(id){var a=AC(),sid=a&&((a._serverInfo&&a._serverInfo.Id)||(a.serverId&&a.serverId()));closeOv();setTimeout(function(){if(window.appRouter&&appRouter.showItem){appRouter.showItem({Id:id,ServerId:sid});return;}if(window.Emby&&Emby.Page&&Emby.Page.showItem){Emby.Page.showItem(id);return;}window.location.hash='#!/details?id='+id+(sid?'&serverId='+sid:'');},200);}
  function myRating(itemId){return rget('/Ratings/Items/'+itemId+'/DetailedRatings').then(function(data){if(!data)return null;var rows=Array.isArray(data)?data:(data.Ratings||data.ratings||[]);var me=uid();for(var i=0;i<rows.length;i++){if((rows[i].UserId||rows[i].userId)===me)return parseFloat(rows[i].Rating||rows[i].rating||0)||null;}return null;});}
  function showPicker(container,itemId,itemName,cur,onDone){container.innerHTML='';var sel=cur||0;var wrap=document.createElement('div');wrap.className='jrpk';var tit=document.createElement('div');tit.className='jrpkt';tit.textContent='Rate: '+itemName;wrap.appendChild(tit);var srow=document.createElement('div');srow.className='jrsr';var vl=document.createElement('span');vl.className='jrpv';vl.textContent=sel?sel+'/10':'–';var sarr=[];for(var i=1;i<=10;i++){(function(v){var s=document.createElement('span');s.className='jrstar'+(v<=sel?' lit':'');s.textContent='★';s.addEventListener('mouseenter',function(){sarr.forEach(function(x,j){x.classList.toggle('lit',j<v);});vl.textContent=v+'/10';});s.addEventListener('mouseleave',function(){sarr.forEach(function(x,j){x.classList.toggle('lit',j<sel);});vl.textContent=sel?sel+'/10':'–';});s.addEventListener('click',function(){sel=v;sarr.forEach(function(x,j){x.classList.toggle('lit',j<sel);});vl.textContent=sel+'/10';});sarr.push(s);srow.appendChild(s);})(i);}srow.appendChild(vl);wrap.appendChild(srow);var msg=document.createElement('div');msg.className='jrpmsg';wrap.appendChild(msg);var acts=document.createElement('div');acts.className='jrpa';var sv=document.createElement('button');sv.className='jrpsv';sv.textContent=cur?'Change':'Rate';sv.addEventListener('click',function(){if(!sel){msg.className='jrpmsg err';msg.textContent='Please select stars.';return;}sv.disabled=true;sv.textContent='…';rsubmit(itemId,sel).then(function(ok){if(ok){msg.className='jrpmsg ok';msg.textContent='✓ Saved ('+sel+'/10)';setTimeout(function(){if(onDone)onDone(sel);},700);}else{var st=(window.__jfRatingLastStatus||[]).join(' ');msg.className='jrpmsg err';msg.textContent='Fehler: '+st;sv.disabled=false;sv.textContent=cur?'Change':'Rate';}});});acts.appendChild(sv);if(cur){var dv=document.createElement('button');dv.className='jrpdl';dv.textContent='Remove';dv.addEventListener('click',function(){dv.disabled=true;dv.textContent='…';rdel(itemId).then(function(ok){if(ok){msg.className='jrpmsg ok';msg.textContent='✓ Removed';setTimeout(function(){if(onDone)onDone(null);},700);}else{msg.className='jrpmsg err';msg.textContent='Error.';dv.disabled=false;dv.textContent='Remove';}});});acts.appendChild(dv);}var ca=document.createElement('button');ca.className='jrpcn';ca.textContent='Cancel';ca.addEventListener('click',function(){container.innerHTML='';});acts.appendChild(ca);wrap.appendChild(acts);container.appendChild(wrap);}
  function attachRate(btn,pel,itemId,itemName){btn.addEventListener('click',function(e){e.stopPropagation();if(pel.hasChildNodes()){pel.innerHTML='';return;}btn.textContent='…';btn.disabled=true;myRating(itemId).then(function(r){btn.disabled=false;btn.textContent=r?'⭐ '+r+'/10':'⭐ Rate';btn.classList.toggle('rated',!!r);showPicker(pel,itemId,itemName,r,function(nv){pel.innerHTML='';btn.textContent=nv?'⭐ '+nv+'/10':'⭐ Rate';btn.classList.toggle('rated',!!nv);cdel('movies');cdel('series');DC.movies=null;DC.series=null;});});})}
  var DC={movies:null,series:null,users:null,wl:{},hist:{}};
  function loadAll(){var cm=cget('movies'),cs=cget('series');if(cm)DC.movies=cm;if(cs)DC.series=cs;return Promise.all([DC.movies?Promise.resolve():loadRanking('Movie').then(function(r){DC.movies=r;cset('movies',r);}),DC.series?Promise.resolve():loadRanking('Series').then(function(r){DC.series=r;cset('series',r);}),DC.users?Promise.resolve():jget('Users').then(function(data){DC.users=Array.isArray(data)?data.map(function(u){return{Id:u.Id,Name:u.Name};}):[];})]);}
  function loadRanking(type){return jget('Items',{Recursive:true,IncludeItemTypes:type,Fields:'ProductionYear,Genres,ImageTags',Limit:1000,UserId:uid()}).then(function(data){if(!data||!data.Items)return[];var items=data.Items,res=new Array(items.length).fill(null),idx=0;function next(){if(idx>=items.length)return Promise.resolve();var s=idx;idx+=30;return Promise.all(items.slice(s,s+30).map(function(it,i){return rget('/Ratings/Items/'+it.Id+'/Stats').then(function(st){res[s+i]=st;});})).then(next);}return next().then(function(){var ranked=[];items.forEach(function(it,i){var st=res[i];if(!st||!st.TotalRatings||st.TotalRatings===0)return;ranked.push({id:it.Id,name:it.Name,year:it.ProductionYear||'',genres:(it.Genres||[]).slice(0,2).join(' · '),avg:parseFloat(st.AverageRating||0),count:st.TotalRatings||0,imgTag:it.ImageTags&&it.ImageTags.Primary});});ranked.sort(function(a,b){return b.avg-a.avg||b.count-a.count;});return ranked;});});}
  function loadWL(id){if(DC.wl[id])return Promise.resolve(DC.wl[id]);return jget('Users/'+id+'/Items',{Filters:'IsFavorite',Recursive:true,IncludeItemTypes:'Movie,Series',Fields:'ImageTags,ProductionYear',Limit:200}).then(function(d){var it=(d&&d.Items)||[];DC.wl[id]=it;return it;});}
  function loadHist(id){if(DC.hist[id])return Promise.resolve(DC.hist[id]);return fetch(srv()+'/user_usage_stats/UserPlaylist?user_id='+id+'&days=90&limit=100',{headers:ah()}).then(function(r){if(!r.ok)throw 0;return r.json();}).then(function(data){var rows=Array.isArray(data)?data:(data.results||data.Items||[]);var it=rows.map(function(row){return{Id:row.ItemId||row.id||'',Name:row.ItemName||row.name||'',Type:row.ItemType||row.type||'',SeriesName:row.SeriesName||'',SeasonNum:row.SeasonNumber,EpisodeNum:row.EpisodeNumber,PlayedDate:row.DateCreated||row.date||'',RunTime:row.PlayDuration||row.duration||0,ImageTags:{Primary:row.PrimaryImageTag||''},SeriesId:row.SeriesId||''};});DC.hist[id]=it;return it;}).catch(function(){return jget('Users/'+id+'/Items',{Recursive:true,IncludeItemTypes:'Movie,Episode',SortBy:'DatePlayed',SortOrder:'Descending',Fields:'ImageTags,SeriesName,ParentIndexNumber,IndexNumber,RunTimeTicks,SeriesId,UserData',Limit:150}).then(function(d){var it=(d&&d.Items)||[];DC.hist[id]=it;return it;});});}
  function gb(){return document.getElementById('jrb');}
  function renderTab(tab){var b=gb();if(!b)return;if(tab==='movies'||tab==='series')renderRanking(tab);else if(tab==='watchlist')renderPills('watchlist');else if(tab==='history')renderPills('history');else if(tab==='rate')renderRateTab();}
  function renderRanking(tab){var b=gb();if(!b)return;var items=DC[tab];if(!items){b.innerHTML='<div class="jrspin">Loading…</div>';loadRanking(tab==='movies'?'Movie':'Series').then(function(r){DC[tab]=r;cset(tab,r);renderRanking(tab);});return;}b.innerHTML='';var sec=document.createElement('div');sec.className='jrs';sec.innerHTML='<h2>'+(tab==='movies'?'Ranked Movies':'Ranked Series')+'</h2><div class="jrsub">'+items.length+' rated title'+(items.length!==1?'s':'')+'</div>';if(!items.length){sec.innerHTML+='<div class="jrempty">No rated titles yet.</div>';b.appendChild(sec);return;}var list=document.createElement('div');list.className='jrl';items.forEach(function(item,i){var rank=i+1,medal=rank===1?'🥇':rank===2?'🥈':rank===3?'🥉':null;var img=item.imgTag?srv()+'/Items/'+item.id+'/Images/Primary?tag='+item.imgTag+'&maxHeight=110&quality=85':'';if(rank===4&&items.length>3){var dv=document.createElement('div');dv.className='jrdiv';list.appendChild(dv);}var wrap=document.createElement('div');wrap.className='jriw';wrap.dataset.name=item.name.toLowerCase();var row=document.createElement('div');row.className='jrrow'+(rank<=3?' hi':'');row.innerHTML='<div class="jrrank'+(medal?'':' pl')+'">'+(medal||rank)+'</div>'+(img?'<img class="jrposter" src="'+img+'" alt="" loading="lazy" onerror="this.style.display=\'none\'">':'<div class="jrposter" style="display:flex;align-items:center;justify-content:center;font-size:12px;color:rgba(255,255,255,.1)">▪</div>')+'<div class="jrinfo"><div class="jrname">'+esc(item.name)+'</div><div class="jrmeta">'+item.year+(item.genres?' · '+esc(item.genres):'')+'</div></div>'+'<div class="jrsc2"><div class="jravg">'+item.avg.toFixed(1)+'<small>/10</small></div><div class="jrstars">'+sts(item.avg)+'</div><div class="jrrc">'+item.count+' rating'+(item.count!==1?'s':'')+'</div></div>'+'<button class="jrrb">⭐ Rate</button><button class="jrexp">▾</button>';var rb=row.querySelector('.jrrb'),eb=row.querySelector('.jrexp'),pel=document.createElement('div');attachRate(rb,pel,item.id,item.name);var panel=document.createElement('div');panel.className='jrep';panel.style.display='none';panel.innerHTML='<div class="jrspin" style="padding:.7em 0">Loading…</div>';eb.addEventListener('click',function(e){e.stopPropagation();var op=panel.style.display!=='none';panel.style.display=op?'none':'block';eb.textContent=op?'▾':'▴';eb.classList.toggle('open',!op);if(!op&&!panel.dataset.loaded){panel.dataset.loaded='1';rget('/Ratings/Items/'+item.id+'/DetailedRatings').then(function(d){renderExpand(panel,d);});}});row.addEventListener('click',function(e){if(eb.contains(e.target)||rb.contains(e.target))return;navTo(item.id);});wrap.appendChild(row);wrap.appendChild(pel);wrap.appendChild(panel);list.appendChild(wrap);});sec.appendChild(list);b.appendChild(sec);}
  var userNameCache={};
  function getUserName(rid,given){if(given)return Promise.resolve(given);if(userNameCache[rid])return Promise.resolve(userNameCache[rid]);if(DC.users){var f=DC.users.filter(function(u){return u.Id===rid;})[0];if(f){userNameCache[rid]=f.Name;return Promise.resolve(f.Name);}}return jget('Users/'+rid).then(function(u){var n=(u&&(u.Name||u.name))||'User';userNameCache[rid]=n;return n;}).catch(function(){return 'User';});}
  function renderExpand(panel,data){var rows=data&&(Array.isArray(data)?data:(data.Ratings||data.ratings||[]));if(!rows||!rows.length){panel.innerHTML='<div class="jreptit">User Ratings</div><div class="jrempty">No ratings found.</div>';return;}rows.sort(function(a,b){return(b.Rating||b.rating||0)-(a.Rating||a.rating||0);});panel.innerHTML='<div class="jreptit">User Ratings</div><div class="jrspin" style="padding:.4em 0">Loading…</div>';Promise.all(rows.map(function(r){var rid=r.UserId||r.userId||'';var given=r.UserName||r.userName||r.Name||r.name||'';return getUserName(rid,given).then(function(name){return{name:name,rid:rid,rating:parseFloat(r.Rating||r.rating||0)};});})).then(function(res){var html='<div class="jreptit">User Ratings</div>';res.forEach(function(u){var av=u.rid?'<div class="jrav"><img src="'+avurl(u.rid)+'" alt="" onerror="this.parentElement.textContent=\''+ini(u.name).replace(/'/g,"\\'")+'\'"></div>':'<div class="jrav">'+ini(u.name)+'</div>';html+='<div class="jrur">'+av+'<span class="jrun">'+esc(u.name)+'</span><span class="jrus">'+sts(u.rating)+'</span><span class="jruv">'+u.rating.toFixed(1)+'/10</span></div>';});panel.innerHTML=html;});}
  function filterRanking(q){var b=gb();if(!b)return;b.querySelectorAll('.jriw').forEach(function(w){w.style.display=(!q||(w.dataset.name||'').includes(q))?'':'none';});}
  function renderPills(mode){var b=gb();if(!b)return;b.innerHTML='';var sec=document.createElement('div');sec.className='jrs';sec.innerHTML='<h2>'+(mode==='watchlist'?'Watchlists':'Watch History')+'</h2>';if(!DC.users||!DC.users.length){sec.innerHTML+='<div class="jrempty">No users found.</div>';b.appendChild(sec);return;}var pills=document.createElement('div');pills.className='jrpills';DC.users.forEach(function(user){var p=document.createElement('button');p.className='jrpill';p.innerHTML='<div class="jrpav"><img src="'+avurl(user.Id)+'" alt="" onerror="this.parentElement.textContent=\''+ini(user.Name).replace(/'/g,"\\'")+'\'" ></div><span class="jrpnm">'+esc(user.Name)+'</span>';p.addEventListener('click',function(){delete DC.wl[user.Id];delete DC.hist[user.Id];if(mode==='watchlist')showWL(user,sec,pills);else showHist(user,sec,pills);});pills.appendChild(p);});sec.appendChild(pills);b.appendChild(sec);}
  function showWL(user,sec,pills){pills.style.display='none';var det=document.createElement('div');det.innerHTML=bkHdr(user,'watchlist');det.querySelector('.jrbk').addEventListener('click',function(){det.remove();pills.style.display='';});var grid=document.createElement('div');grid.className='jrcards';grid.innerHTML='<div class="jrspin">Loading…</div>';det.appendChild(grid);sec.appendChild(det);loadWL(user.Id).then(function(items){grid.innerHTML='';if(!items.length){grid.innerHTML='<div class="jrempty">Watchlist is empty.</div>';return;}items.forEach(function(item){var img=pimg(item,300);var card=document.createElement('div');card.className='jrcard';card.dataset.name=(item.Name||'').toLowerCase();card.innerHTML='<div class="jrci">'+(img?'<img src="'+img+'" alt="" loading="lazy" onerror="this.style.display=\'none\'">':'')+'</div><div class="jrct">'+esc(item.Name||'')+'</div><div class="jrcs">'+(item.ProductionYear||'')+'</div>';card.addEventListener('click',function(){navTo(item.Id);});grid.appendChild(card);});});}
  function isEpisode(item){return item.Type==='Episode'||(item.SeriesName&&item.SeriesName!==item.Name)||item.ParentIndexNumber!=null||item.SeasonNum!=null;}
  function showHist(user,sec,pills){pills.style.display='none';var det=document.createElement('div');det.innerHTML=bkHdr(user,'history');det.querySelector('.jrbk').addEventListener('click',function(){det.remove();pills.style.display='';});var filterRow=document.createElement('div');filterRow.className='jrhfrow';var activeFilter='all';var filterDefs=[{key:'all',label:'Alle'},{key:'movie',label:'🎬 Filme'},{key:'episode',label:'📺 Serien'}];var filterBtns={};filterDefs.forEach(function(fd){var btn=document.createElement('button');btn.className='jrhfbtn'+(fd.key==='all'?' on':'');btn.textContent=fd.label;filterBtns[fd.key]=btn;btn.addEventListener('click',function(){activeFilter=fd.key;Object.keys(filterBtns).forEach(function(k){filterBtns[k].classList.remove('on');});btn.classList.add('on');renderList();});filterRow.appendChild(btn);});det.appendChild(filterRow);var listEl=document.createElement('div');listEl.innerHTML='<div class="jrspin">Loading…</div>';det.appendChild(listEl);sec.appendChild(det);var allItems=[];function renderList(){listEl.innerHTML='';var filtered=allItems.filter(function(item){if(activeFilter==='movie')return!isEpisode(item);if(activeFilter==='episode')return isEpisode(item);return true;});var counts={all:allItems.length,movie:0,episode:0};allItems.forEach(function(it){if(isEpisode(it))counts.episode++;else counts.movie++;});filterDefs.forEach(function(fd){filterBtns[fd.key].textContent=fd.label+' ('+counts[fd.key]+')';});if(!filtered.length){listEl.innerHTML='<div class="jrempty">Keine Einträge.</div>';return;}var pm='';filtered.forEach(function(item,idx){var d=item.PlayedDate?new Date(item.PlayedDate):null;var mo=d?d.toLocaleString('de',{month:'long',year:'numeric'}):'';if(mo&&mo!==pm){pm=mo;var moCount=filtered.filter(function(x){var xd=x.PlayedDate?new Date(x.PlayedDate):null;return xd&&xd.toLocaleString('de',{month:'long',year:'numeric'})===mo;}).length;var mh=document.createElement('div');mh.className='jrhmo';mh.innerHTML='<span>'+mo+'</span><span class="jrhmo-count">'+moCount+'</span>';listEl.appendChild(mh);}var title=item.SeriesName||item.Name||'';var sub='';var typeIsEp=isEpisode(item);if(typeIsEp){var sn=item.ParentIndexNumber!=null?item.ParentIndexNumber:(item.SeasonNum!=null?item.SeasonNum:null);var en=item.IndexNumber!=null?item.IndexNumber:(item.EpisodeNum!=null?item.EpisodeNum:null);if(sn!=null&&en!=null)sub='S'+sn+' E'+en;else if(en!=null)sub='E'+en;else sub='Episode';}else{var rt=item.RunTimeTicks||item.RunTime||0;sub=rt>0?Math.round(rt/600000000)+' min':'Film';}var img=pimg(item,110);var badgeClass=typeIsEp?'ep':'movie';var badgeLabel=typeIsEp?'📺 Serie':'🎬 Film';var row=document.createElement('div');row.className='jrhr'+(idx%2===0?' hi':'')+(item.Id?' cl':'');row.innerHTML='<div class="jrhdate">'+(d?'<div class="jrhday">'+d.getDate()+'</div><div class="jrhmon">'+d.toLocaleString('de',{month:'short'})+'</div>':'<div class="jrhday">—</div>')+'</div>'+(img?'<img class="jrposter" src="'+img+'" alt="" loading="lazy" onerror="this.style.display=\'none\'">':'<div class="jrposter" style="display:flex;align-items:center;justify-content:center;font-size:12px;color:rgba(255,255,255,.1)">▪</div>')+'<div class="jrinfo"><div class="jrname">'+esc(title)+'</div><div class="jrmeta">'+esc(sub)+'</div></div>'+'<span class="jrhtbadge '+badgeClass+'">'+badgeLabel+'</span>';if(item.Id)row.addEventListener('click',function(){navTo(item.Id);});listEl.appendChild(row);});}loadHist(user.Id).then(function(items){allItems=items;renderList();});}
  function bkHdr(user,mode){return '<div class="jrdh"><button class="jrbk">← Back</button><span class="jrdl"><span style="display:inline-flex;align-items:center;gap:5px;"><span style="display:inline-flex;width:14px;height:14px;border-radius:50%;background:rgba(255,255,255,.15);align-items:center;justify-content:center;font-size:6px;color:rgba(255,255,255,.8);">'+ini(user.Name)+'</span>'+esc(user.Name)+"'s "+mode+'</span></span></div>';}
  var rtTimer=null;
  function renderRateTab(){var b=gb();if(!b)return;b.innerHTML='';var sec=document.createElement('div');sec.className='jrs';sec.innerHTML='<h2>Search &amp; Rate</h2><div class="jrsub">Find any movie or series</div>';var inp=document.createElement('input');inp.id='jrts';inp.type='text';inp.placeholder='Search titles…';inp.autocomplete='off';sec.appendChild(inp);var res=document.createElement('div');res.className='jrl';sec.appendChild(res);b.appendChild(sec);inp.focus();inp.addEventListener('input',function(){var q=inp.value.trim();res.innerHTML='';if(q.length<2)return;clearTimeout(rtTimer);rtTimer=setTimeout(function(){res.innerHTML='<div class="jrspin">Searching…</div>';jget('Items',{SearchTerm:q,Recursive:true,IncludeItemTypes:'Movie,Series',Fields:'ProductionYear,Genres,ImageTags',Limit:40,UserId:uid()}).then(function(data){renderRateResults(res,(data&&data.Items)||[]);});},350);});}
  function renderRateResults(container,items){container.innerHTML='';if(!items.length){container.innerHTML='<div class="jrempty">No results.</div>';return;}items.forEach(function(item){var wrap=document.createElement('div');wrap.className='jriw';var img=item.ImageTags&&item.ImageTags.Primary?srv()+'/Items/'+item.Id+'/Images/Primary?tag='+item.ImageTags.Primary+'&maxHeight=110&quality=85':'';var sid='jfrs-'+item.Id;var row=document.createElement('div');row.className='jrrow';row.innerHTML=(img?'<img class="jrposter" src="'+img+'" alt="" loading="lazy" onerror="this.style.display=\'none\'">':'<div class="jrposter" style="display:flex;align-items:center;justify-content:center;font-size:12px;color:rgba(255,255,255,.1)">▪</div>')+'<div class="jrinfo"><div class="jrname">'+esc(item.Name||'')+'</div><div class="jrmeta">'+esc(String(item.ProductionYear||''))+' · '+(item.Type==='Series'?'Series':'Movie')+'</div></div>'+'<div id="'+sid+'" class="jrsc2" style="font-size:.58em;color:rgba(255,255,255,.25);">…</div>'+'<button class="jrrb">⭐ Rate</button>';rget('/Ratings/Items/'+item.Id+'/Stats').then(function(st){var el=document.getElementById(sid);if(!el)return;if(st&&st.TotalRatings){var avg=parseFloat(st.AverageRating||0);el.innerHTML='<div class="jravg">'+avg.toFixed(1)+'<small>/10</small></div><div class="jrstars">'+sts(avg)+'</div><div class="jrrc">'+st.TotalRatings+' ratings</div>';}else el.innerHTML='<span style="font-size:.58em;color:rgba(255,255,255,.18)">–</span>';});var rb=row.querySelector('.jrrb'),pel=document.createElement('div');rb.addEventListener('click',function(e){e.stopPropagation();if(pel.hasChildNodes()){pel.innerHTML='';return;}rb.textContent='…';rb.disabled=true;myRating(item.Id).then(function(r){rb.disabled=false;rb.textContent=r?'⭐ '+r+'/10':'⭐ Rate';rb.classList.toggle('rated',!!r);showPicker(pel,item.Id,item.Name,r,function(nv){pel.innerHTML='';rb.textContent=nv?'⭐ '+nv+'/10':'⭐ Rate';rb.classList.toggle('rated',!!nv);rget('/Ratings/Items/'+item.Id+'/Stats').then(function(st){var el=document.getElementById(sid);if(!el||!st||!st.TotalRatings)return;var avg=parseFloat(st.AverageRating||0);el.innerHTML='<div class="jravg">'+avg.toFixed(1)+'<small>/10</small></div><div class="jrstars">'+sts(avg)+'</div><div class="jrrc">'+st.TotalRatings+' ratings</div>';});cdel('movies');cdel('series');DC.movies=null;DC.series=null;});});});row.addEventListener('click',function(e){if(rb.contains(e.target))return;navTo(item.Id);});wrap.appendChild(row);wrap.appendChild(pel);container.appendChild(wrap);});}
  var openOv=function(){if(document.getElementById('jro')){closeOv();return;}injectCSS();var ov=document.createElement('div');ov.id='jro';ov.innerHTML='<div id="jrh"><div id="jrh1"><div id="jrtitle"><svg viewBox="0 0 24 24" width="14" height="14" style="flex-shrink:0;opacity:.88;fill:rgba(255,255,255,.85)"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>Ratings</div><div id="jrsw"><svg viewBox="0 0 24 24" width="12" height="12" style="fill:none;stroke:rgba(255,255,255,.4);stroke-width:2;stroke-linecap:round;flex-shrink:0"><circle cx="10.5" cy="10.5" r="6.5"/><line x1="15.5" y1="15.5" x2="21" y2="21"/></svg><input id="jrsi" type="text" placeholder="Filter…" autocomplete="off"/><button id="jrsc">✕</button></div><button id="jrclose">✕</button></div><div id="jrh2"><button class="jrb on" data-tab="movies">Movies</button><button class="jrb" data-tab="series">Series</button><button class="jrb" data-tab="watchlist">Watchlist</button><button class="jrb" data-tab="history">History</button><button class="jrb" data-tab="rate">Search &amp; Rate</button></div></div><div id="jrb"><div class="jrspin">Loading…</div></div>';
  document.body.appendChild(ov);document.addEventListener('keydown',escH);document.getElementById('jrclose').onclick=closeOv;var curTab='movies',si=document.getElementById('jrsi'),sc=document.getElementById('jrsc');ov.querySelectorAll('.jrb[data-tab]').forEach(function(btn){btn.addEventListener('click',function(){ov.querySelectorAll('.jrb[data-tab]').forEach(function(b){b.classList.remove('on');});btn.classList.add('on');curTab=btn.dataset.tab;si.value='';sc.classList.remove('show');document.getElementById('jrsw').style.display=curTab==='rate'?'none':'';renderTab(curTab);});});si.addEventListener('input',function(){var q=si.value.trim().toLowerCase();sc.classList.toggle('show',q.length>0);if(q.length===0){renderTab(curTab);return;}if(curTab==='movies'||curTab==='series')filterRanking(q);});sc.addEventListener('click',function(){si.value='';sc.classList.remove('show');renderTab(curTab);si.focus();});loadAll().then(function(){renderTab('movies');});};
  var escH=function(e){if(e.key==='Escape')closeOv();};
  function closeOv(){document.removeEventListener('keydown',escH);var o=document.getElementById('jro');if(o)o.remove();var w=document.getElementById('ir-widget');if(w)w.style.display='none';}
  function patchTab(){document.querySelectorAll('[id^="customTabButton"],.emby-tab-button,[class*="tabButton"],[class*="tab-button"]').forEach(function(btn){if(btn.dataset.jfPF)return;var te=btn.querySelector('.emby-tab-button-text,span')||btn;if(!/^ratings$/i.test(te.textContent.trim()))return;btn.dataset.jfPF='1';btn.classList.add('jrt-tp');var ic=document.createElement('span');ic.className='jrt-ti';ic.innerHTML='<svg viewBox="0 0 24 24" width="22" height="22"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" fill="currentColor"/></svg>';btn.insertBefore(ic,btn.firstChild);btn.addEventListener('click',function(e){e.preventDefault();e.stopImmediatePropagation();openOv();},true);});}
  var iv=setInterval(function(){if(typeof ApiClient==='undefined')return;injectCSS();patchTab();var w=document.getElementById('ir-widget');if(w)w.style.display='none';},400);
  setTimeout(function(){clearInterval(iv);},20000);
  new MutationObserver(function(){patchTab();var w=document.getElementById('ir-widget');if(w)w.style.display='none';}).observe(document.body,{childList:true,subtree:true});
  window.__openRatingsOverlay=openOv;
})();


/* ════════════════════════════════════════════════════════════
   3a) BUTTON INJECTOR (Lupe + Request)
   ════════════════════════════════════════════════════════════ */
(function () {
  "use strict";
  var CONTAINER_ID="jbi-container",STYLE_ID="jbi-styles",OVERLAY_ID="jbi-search-overlay";
  var CSS=['#headerSearchField{display:none!important;width:0!important;height:0!important;overflow:hidden!important;pointer-events:none!important;position:absolute!important;left:-9999px!important;}','#requestMediaBtn{display:none!important;}','#jbi-container{display:inline-flex;align-items:center;gap:0;flex-shrink:0;}','.jbi-btn{position:relative!important;display:inline-flex!important;align-items:center!important;justify-content:center!important;top:auto!important;right:auto!important;width:40px;height:40px;padding:0!important;border:none!important;border-radius:50%!important;background:transparent!important;cursor:pointer!important;outline:none!important;transition:background 0.15s ease;transform:none!important;}','.jbi-btn:hover{background:rgba(255,255,255,0.1)!important;}','.jbi-btn:active{background:rgba(255,255,255,0.18)!important;}','.jbi-btn svg{width:22px;height:22px;fill:none;stroke:rgba(255,255,255,0.87);stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round;display:block;transition:stroke 0.15s;}','.jbi-btn:hover svg{stroke:#fff;}','#jbi-search-overlay{display:none;position:fixed!important;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.8)!important;z-index:100999!important;align-items:flex-start;justify-content:center;padding-top:80px;box-sizing:border-box;}','#jbi-search-overlay.show{display:flex;}','#jbi-search-modal{background:#1c1c1c;border-radius:8px;padding:28px 32px 32px;width:90%;max-width:560px;position:relative;box-shadow:0 8px 40px rgba(0,0,0,0.7);}','#jbi-search-title{font-size:24px;font-weight:600;color:#fff;margin:0 0 20px;font-family:-apple-system,sans-serif;}','#jbi-search-close{position:absolute;top:12px;right:14px;background:none;border:none;color:rgba(255,255,255,0.6);font-size:22px;cursor:pointer;padding:4px 8px;border-radius:4px;line-height:1;}','#jbi-search-close:hover{color:#fff;background:rgba(255,255,255,0.1);}','#jbi-input-row{display:flex;align-items:center;background:#2a2a2a;border:1px solid rgba(255,255,255,0.12);border-radius:6px;padding:0 12px;}','#jbi-input-row:focus-within{border-color:rgba(255,255,255,0.35);}','#jbi-input-row svg{width:18px;height:18px;flex-shrink:0;stroke:rgba(255,255,255,0.4);stroke-width:1.8;stroke-linecap:round;fill:none;}','#jbi-search-input{flex:1;background:none;border:none;color:#fff;font-size:16px;padding:13px 10px;outline:none;}','#jbi-search-input::placeholder{color:rgba(255,255,255,0.3);}','#jbi-dropdown-wrap{position:relative;width:100%;}','#jbi-search-overlay,#jbi-search-overlay.show{display:none!important;pointer-events:none!important;}'].join('\n');
  var SEARCH_SVG='<svg viewBox="0 0 24 24"><circle cx="10.5" cy="10.5" r="6.5"/><line x1="15.5" y1="15.5" x2="21" y2="21"/></svg>';
  var REQUEST_SVG='<svg viewBox="0 0 24 24"><path d="M6 4.5L6 19.5L19.5 12Z" stroke-linejoin="round"/><circle cx="19" cy="5" r="4.5" fill="#1c1c1c" stroke="rgba(255,255,255,0.87)" stroke-width="1.4"/><line x1="19" y1="2.5" x2="19" y2="7.5" stroke-width="1.6"/><line x1="16.5" y1="5" x2="21.5" y2="5" stroke-width="1.6"/></svg>';
  var overlayEl=null,dropdownWrap=null;
  function hideNativeSearch(){var f=document.getElementById('headerSearchField');if(!f)return;f.style.setProperty('display','none','important');f.style.setProperty('width','0','important');f.style.setProperty('height','0','important');f.style.setProperty('overflow','hidden','important');f.style.setProperty('pointer-events','none','important');f.style.setProperty('position','absolute','important');f.style.setProperty('left','-9999px','important');}
  function openOverlay(){ openSearchOverlay(''); }
  function closeOverlay(){var ov=document.getElementById(OVERLAY_ID);if(ov)ov.classList.remove("show");var dd=document.getElementById("searchDropdown");if(dd&&dropdownWrap&&dropdownWrap.contains(dd)){document.body.appendChild(dd);dd.style.display="none";}hideNativeSearch();var ni=document.getElementById("headerSearchInput");if(ni){ni.value="";ni.dispatchEvent(new Event("input",{bubbles:true}));}}
  function doRequest(){var b=document.getElementById("requestMediaBtn");if(b){b.click();return;}var m=document.getElementById("requestMediaModal");if(m){m.classList.add("show");m.style.display="flex";}}
  function makeBtn(id,svg,tip,fn){var b=document.createElement("button");b.type="button";b.id=id;b.className="jbi-btn";b.title=tip;b.innerHTML=svg;b.addEventListener("click",function(e){e.stopPropagation();fn();});return b;}
  function inject(){if(document.getElementById(CONTAINER_ID))return;var target=document.querySelector(".headerRight")||document.querySelector(".headerTop");if(!target)return;var c=document.createElement("div");c.id=CONTAINER_ID;c.appendChild(makeBtn("jbi-search-btn",SEARCH_SVG,"Suche",function(){ openSearchOverlay(""); }));c.appendChild(makeBtn("jbi-request-btn",REQUEST_SVG,"Medien anfordern",doRequest));target.appendChild(c);document.dispatchEvent(new CustomEvent('jbi-ready'));}
  function init(){if(!document.getElementById(STYLE_ID)){var s=document.createElement("style");s.id=STYLE_ID;s.textContent=CSS;document.head.appendChild(s);}inject();hideNativeSearch();var f=document.getElementById('headerSearchField');if(f)new MutationObserver(hideNativeSearch).observe(f,{attributes:true,attributeFilter:['style','class']});}
  function tryInit(){if(document.querySelector('.headerRight')){init();return;}setTimeout(tryInit,300);}
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",function(){setTimeout(tryInit,500);});else setTimeout(tryInit,500);
  new MutationObserver(function(){if(!document.getElementById(CONTAINER_ID)&&document.querySelector('.headerRight'))inject();hideNativeSearch();}).observe(document.body||document.documentElement,{childList:true,subtree:true});

  /* ── Fullscreen Search Overlay ── */
  var SEARCH_OV_ID = 'jbi-search-fullscreen';

  function openSearchOverlay(query) {
    var existing = document.getElementById(SEARCH_OV_ID);
    if (existing) existing.remove();

    /* CSS einmalig injizieren */
    if (!document.getElementById('jbi-sov-css')) {
      var sc = document.createElement('style');
      sc.id = 'jbi-sov-css';
      sc.textContent = [
        '#jbi-search-fullscreen{position:fixed;top:80px;left:50%;transform:translateX(-50%);',
          'width:680px;max-height:78vh;z-index:99999;',
          'display:flex;flex-direction:column;overflow:hidden;',
          'background:#1c1c1c;border-radius:12px;',
          'box-shadow:0 8px 40px rgba(0,0,0,.8);',
          'font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;}',
        '#jbi-sov-head{display:flex;flex-direction:column;',
          'padding:20px 20px 14px;',
          'flex-shrink:0;}',
        '#jbi-sov-input-wrap{width:100%;display:flex;align-items:center;box-sizing:border-box;',
          'background:rgba(255,255,255,.07);border:1px solid rgba(255,255,255,.14);',
          'border-radius:10px;padding:0 14px;transition:border-color .15s;}',
        '#jbi-sov-input-wrap:focus-within{border-color:rgba(0,164,220,.5);}',
        '#jbi-sov-input-wrap svg{width:16px;height:16px;fill:none;stroke:rgba(255,255,255,.4);stroke-width:1.8;stroke-linecap:round;flex-shrink:0;}',
        '#jbi-sov-input{flex:1;background:none;border:none;outline:none;color:#fff;font-size:15px;padding:12px 10px;}',
        '#jbi-sov-input::placeholder{color:rgba(255,255,255,.25);}',
        '#jbi-sov-close:hover{background:rgba(255,255,255,.1)!important;}',
        '#jbi-sov-meta{padding:6px 20px 4px;font-size:.68em;color:rgba(255,255,255,.28);',
          'letter-spacing:.08em;text-transform:uppercase;flex-shrink:0;}',
        '#jbi-sov-body{flex:1;overflow-y:auto;padding:2px 20px 20px;',
          'scrollbar-width:thin;scrollbar-color:rgba(255,255,255,.18) transparent;}',
        '#jbi-sov-body::-webkit-scrollbar{width:4px;}',
        '#jbi-sov-body::-webkit-scrollbar-thumb{background:rgba(255,255,255,.18);border-radius:2px;}',
        /* Section titles */
        '.jbi-sov-section{margin-top:18px;}',
        '.jbi-sov-section-title{font-size:.65em;font-weight:600;letter-spacing:.12em;',
          'text-transform:uppercase;color:rgba(255,255,255,.28);margin-bottom:14px;}',
        /* Cards grid */
        '.jbi-sov-grid{display:flex;flex-wrap:wrap;gap:10px;}',
        '.jbi-sov-card{width:90px;cursor:pointer;flex-shrink:0;transition:transform .15s,opacity .15s;}',
        '.jbi-sov-card:hover{transform:scale(1.04);opacity:.9;}',
        '.jbi-sov-poster{width:90px;height:135px;border-radius:6px;',
          'background:rgba(255,255,255,.06);overflow:hidden;border:1px solid rgba(255,255,255,.07);}',
        '.jbi-sov-poster img{width:100%;height:100%;object-fit:cover;display:block;}',
        '.jbi-sov-title{font-size:11px;font-weight:500;color:rgba(255,255,255,.88);',
          'margin-top:5px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}',
        '.jbi-sov-year{font-size:9px;color:rgba(255,255,255,.3);margin-top:1px;}',
        /* Episode row */
        '.jbi-sov-ep-row{display:flex;align-items:center;gap:12px;padding:8px 0;',
          'border-bottom:1px solid rgba(255,255,255,.05);cursor:pointer;transition:background .12s;}',
        '.jbi-sov-ep-row:hover{background:rgba(255,255,255,.04);}',
        '.jbi-sov-ep-thumb{width:80px;height:46px;border-radius:5px;flex-shrink:0;',
          'background:rgba(255,255,255,.07);overflow:hidden;}',
        '.jbi-sov-ep-thumb img{width:100%;height:100%;object-fit:cover;display:block;}',
        '.jbi-sov-ep-info{flex:1;min-width:0;}',
        '.jbi-sov-ep-name{font-size:13px;font-weight:500;color:rgba(255,255,255,.9);',
          'white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}',
        '.jbi-sov-ep-meta{font-size:10px;color:rgba(255,255,255,.3);margin-top:3px;}',
        /* Spinner / hint */
        '.jbi-sov-ep-list-inner{display:flex;flex-direction:column;}',
        '.jbi-sov-spin{padding:60px 0;text-align:center;color:rgba(255,255,255,.25);font-size:.85em;}',
        '.jbi-sov-empty{padding:60px 0;text-align:center;color:rgba(255,255,255,.2);font-size:.85em;line-height:2.4;}',
      ].join('');
      document.head.appendChild(sc);
    }

    /* Backdrop */
    var backdrop = document.createElement('div');
    backdrop.id = 'jbi-sov-backdrop';
    backdrop.style.cssText = 'position:fixed;inset:0;z-index:99998;background:rgba(0,0,0,.5);backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);';
    document.body.appendChild(backdrop);

    var ov = document.createElement('div');
    ov.id = SEARCH_OV_ID;

    /* Header */
    var head = document.createElement('div');
    head.id = 'jbi-sov-head';
    var closeId = 'jbi-sov-close';
    head.innerHTML =
      '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px;">'
        + '<span style="font-size:22px;font-weight:600;color:#fff;font-family:-apple-system,BlinkMacSystemFont,sans-serif;">Suche</span>'
        + '<button id="'+closeId+'" style="background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.18);color:rgba(255,255,255,.7);font-size:16px;cursor:pointer;line-height:1;width:30px;height:30px;display:flex;align-items:center;justify-content:center;border-radius:50%;">✕</button>'
      + '</div>'
      + '<div id="jbi-sov-input-wrap">'
        + '<svg viewBox="0 0 24 24"><circle cx="10.5" cy="10.5" r="6.5"/><line x1="15.5" y1="15.5" x2="21" y2="21"/></svg>'
        + '<input id="jbi-sov-input" type="text" autocomplete="off" spellcheck="false" placeholder="Suche…" value="'+query.replace(/"/g,'&quot;')+'"/>'
      + '</div>';
    ov.appendChild(head);

    var meta = document.createElement('div');
    meta.id = 'jbi-sov-meta';
    meta.textContent = query ? 'Suche nach „'+query+'"…' : '';
    ov.appendChild(meta);

    var body = document.createElement('div');
    body.id = 'jbi-sov-body';
    body.innerHTML = '<div class="jbi-sov-spin">Suche läuft…</div>';
    /* Reset list on new search */
    ov.appendChild(body);

    document.body.appendChild(ov);

    /* Close */
    function closeSearchOv() {
      ov.remove();
      var bd = document.getElementById('jbi-sov-backdrop');
      if (bd) bd.remove();
      document.removeEventListener('keydown', sovEsc);
    }
    function sovEsc(e){ if(e.key==='Escape') closeSearchOv(); }
    document.getElementById('jbi-sov-close').addEventListener('click', closeSearchOv);
    backdrop.addEventListener('click', closeSearchOv);
    document.addEventListener('keydown', sovEsc);

    /* Live search on input change */
    var sovTimer = null;
    var sovInput = document.getElementById('jbi-sov-input');
    sovInput.focus();
    if (query) sovInput.setSelectionRange(query.length, query.length);
    sovInput.addEventListener('input', function() {
      var q = sovInput.value.trim();
      meta.textContent = q ? 'Suche nach „'+q+'"…' : 'Suche…';
      if (sovTimer) clearTimeout(sovTimer);
      sovTimer = setTimeout(function(){ doSearchOv(q, body, meta, closeSearchOv); }, 120);
    });

    /* Initial search — nur wenn query nicht leer */
    if (query && query.trim()) {
      doSearchOv(query, body, meta, closeSearchOv);
    } else {
      body.innerHTML = '<div class="jbi-sov-empty">Suchbegriff eingeben…</div>';
      meta.textContent = '';
    }
  }

  function doSearchOv(query, body, meta, closeSearchOv) {
    if (!query || !query.trim()) {
      body.innerHTML = '<div class="jbi-sov-empty">Suchbegriff eingeben…</div>';
      return;
    }
    body.innerHTML = '<div class="jbi-sov-spin">Suche läuft…</div>';

    var ac = window.ApiClient;
    if (!ac) return;
    var userId = ac._currentUserId || (ac.getCurrentUserId && ac.getCurrentUserId());
    var token = ac._token || (ac.accessToken && ac.accessToken());
    var serverUrl = (ac._serverAddress || ac._serverUrl || '').replace(/\/$/, '');

    function imgUrl(item) {
      if (item.ImageTags && item.ImageTags.Primary)
        return serverUrl+'/Items/'+item.Id+'/Images/Primary?maxHeight=300&tag='+item.ImageTags.Primary;
      if (item.SeriesId && item.SeriesPrimaryImageTag)
        return serverUrl+'/Items/'+item.SeriesId+'/Images/Primary?maxHeight=300&tag='+item.SeriesPrimaryImageTag;
      if (item.BackdropImageTags && item.BackdropImageTags[0])
        return serverUrl+'/Items/'+item.Id+'/Images/Backdrop?maxWidth=400&tag='+item.BackdropImageTags[0];
      return '';
    }

    function navToItem(id) {
      closeSearchOv();
      var sid = ac._serverInfo && ac._serverInfo.Id;
      setTimeout(function(){
        if (window.appRouter && appRouter.showItem) { appRouter.showItem({Id:id, ServerId:sid}); return; }
        window.location.hash = '#!/details?id='+id+(sid?'&serverId='+sid:'');
      }, 150);
    }

    var PAGE_SIZE = 30;
    var currentStartIndex = 0;
    var allLoadedItems = [];

    function fetchPage(startIndex, append) {
      /* _origFetch bypasses the search-filter interceptor → keine doppelte JSON-Verarbeitung */
      var _rawFetch = window._origFetch || window.fetch;
      _rawFetch(serverUrl+'/Users/'+userId+'/Items'
        +'?SearchTerm='+encodeURIComponent(query.trim())
        +'&IncludeItemTypes=Movie,Series'
        +'&Recursive=true&Limit='+PAGE_SIZE+'&StartIndex='+startIndex
        +'&Fields=ProductionYear,BackdropImageTags,ImageTags,SeriesName,ParentIndexNumber,IndexNumber,SeriesPrimaryImageTag,SeriesId'
        +'&SortBy=SortName',
        {headers:{'X-Emby-Token':token}}
      ).then(function(r){return r.json();}).then(function(data){
        var items = data && data.Items ? data.Items : [];
        var total = data && data.TotalRecordCount ? data.TotalRecordCount : 0;

        if (!append) {
          allLoadedItems = items;
          body.innerHTML = '';
          /* list will be recreated */
        } else {
          allLoadedItems = allLoadedItems.concat(items);
          /* Alten "Show more" Button entfernen */
          var old = document.getElementById('jbi-sov-more');
          if (old) old.remove();
        }

        meta.textContent = total + ' Ergebnis' + (total!==1?'se':'') + ' für „'+query+'"';

        if (!allLoadedItems.length) {
          body.innerHTML = '<div class="jbi-sov-empty">Keine Ergebnisse gefunden.<br>Versuche einen anderen Suchbegriff.</div>';
          return;
        }

        /* Neue Items rendern */
        var movies   = items.filter(function(i){ return i.Type === 'Movie'; });
        var series   = items.filter(function(i){ return i.Type === 'Series'; });
        var episodes = items.filter(function(i){ return i.Type === 'Episode'; });

        function addCard(item, grid) {
          var card = document.createElement('div'); card.className = 'jbi-sov-card';
          card.addEventListener('click', function(){ navToItem(item.Id); });
          var url = imgUrl(item);
          card.innerHTML =
            '<div class="jbi-sov-poster">'+(url?'<img src="'+url+'" alt="" loading="lazy" onerror="this.style.display=\'none\'">':"")+'</div>'
            +'<div class="jbi-sov-title">'+item.Name+'</div>'
            +'<div class="jbi-sov-year">'+(item.ProductionYear||'')+'</div>';
          grid.appendChild(card);
        }

        function getOrCreateSection(id, title, isEp) {
          var existing = document.getElementById(id);
          if (existing) return existing.querySelector('.jbi-sov-grid, .jbi-sov-ep-list-inner');
          var sec = document.createElement('div'); sec.className = 'jbi-sov-section'; sec.id = id;
          var h = document.createElement('div'); h.className = 'jbi-sov-section-title'; h.textContent = title;
          sec.appendChild(h);
          var container = document.createElement('div');
          container.className = isEp ? 'jbi-sov-ep-list-inner' : 'jbi-sov-grid';
          sec.appendChild(container);
          body.appendChild(sec);
          return container;
        }

        if (movies.length) {
          var mg = getOrCreateSection('jbi-sec-movies','Movies',false);
          movies.forEach(function(item){ addCard(item, mg); });
        }
        if (series.length) {
          var sg = getOrCreateSection('jbi-sec-series','Series',false);
          series.forEach(function(item){ addCard(item, sg); });
        }
        if (episodes.length) {
          var eg = getOrCreateSection('jbi-sec-episodes','Episodes',true);
          episodes.forEach(function(item){
            var row = document.createElement('div'); row.className = 'jbi-sov-ep-row';
            row.addEventListener('click', function(){ navToItem(item.Id); });
            var url = imgUrl(item);
            var s = item.ParentIndexNumber != null ? 'S'+item.ParentIndexNumber : '';
            var e = item.IndexNumber != null ? 'E'+String(item.IndexNumber).padStart(2,'0') : '';
            row.innerHTML =
              '<div class="jbi-sov-ep-thumb">'+(url?'<img src="'+url+'" alt="" loading="lazy" onerror="this.style.display=\'none\'">':"")+'</div>'
              +'<div class="jbi-sov-ep-info">'
                +'<div class="jbi-sov-ep-name">'+item.Name+'</div>'
                +'<div class="jbi-sov-ep-meta">'+(item.SeriesName||'')+((s||e)?' · '+s+e:'')+'</div>'
              +'</div>';
            eg.appendChild(row);
          });
        }

        /* "Show more" Button → öffnet Vollbild-Overlay mit allen Ergebnissen */
        if (total > 10) {
          var moreBtn = document.createElement('button');
          moreBtn.id = 'jbi-sov-more';
          moreBtn.textContent = 'Show all ' + total + ' results';
          moreBtn.style.cssText = 'display:block;margin:24px auto 8px;padding:10px 28px;'
            +'background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.18);'
            +'border-radius:8px;color:rgba(255,255,255,.8);font-size:13px;cursor:pointer;'
            +'transition:all .15s;font-family:inherit;';
          moreBtn.onmouseover = function(){ moreBtn.style.background='rgba(255,255,255,.16)';moreBtn.style.color='#fff'; };
          moreBtn.onmouseout  = function(){ moreBtn.style.background='rgba(255,255,255,.08)';moreBtn.style.color='rgba(255,255,255,.8)'; };
          moreBtn.addEventListener('click', function() {
            closeSearchOv(); /* kleines Modal schließen */
            openAllResultsOverlay(query, total, serverUrl, userId, token, imgUrl, navToItem);
          });
          body.appendChild(moreBtn);
        }

      }).catch(function(){
        if (!append) body.innerHTML = '<div class="jbi-sov-empty">Fehler bei der Suche.</div>';
      });
    }

    fetchPage(0, false);
  }



  /* ── Vollbild: alle Suchergebnisse ── */
  function openAllResultsOverlay(query, total, serverUrl, userId, token, imgUrl, navToItem) {
    var ovId = 'jbi-all-results-ov';
    var existing = document.getElementById(ovId);
    if (existing) existing.remove();

    var ov = document.createElement('div');
    ov.id = ovId;
    ov.style.cssText = 'position:fixed;inset:0;z-index:100000;'
      +'background:rgba(0,0,0,.55);backdrop-filter:blur(24px) saturate(1.4);'
      +'-webkit-backdrop-filter:blur(24px) saturate(1.4);'
      +'display:flex;flex-direction:column;overflow:hidden;'
      +'font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;';

    /* Header */
    var head = document.createElement('div');
    head.style.cssText = 'display:flex;align-items:center;gap:12px;padding:14px 3.5%;'
      +'border-bottom:1px solid rgba(255,255,255,.12);flex-shrink:0;background:rgba(0,0,0,.2);';
    var titleEl = document.createElement('div');
    titleEl.style.cssText = 'flex:1;font-size:1.1em;font-weight:300;color:rgba(255,255,255,.95);';
    titleEl.textContent = 'All results for „'+query+'"';
    var countEl = document.createElement('span');
    countEl.style.cssText = 'font-size:.65em;color:rgba(255,255,255,.3);letter-spacing:.08em;text-transform:uppercase;margin-left:10px;';
    countEl.textContent = '0 / '+total+' loaded';
    titleEl.appendChild(countEl);
    var closeBtn2 = document.createElement('button');
    closeBtn2.textContent = '✕';
    closeBtn2.style.cssText = 'background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.18);'
      +'color:rgba(255,255,255,.85);border-radius:50%;width:34px;height:34px;cursor:pointer;'
      +'display:flex;align-items:center;justify-content:center;font-size:1em;flex-shrink:0;';
    closeBtn2.onclick = function(){ ov.remove(); document.removeEventListener('keydown',escAll); };
    head.appendChild(titleEl);
    head.appendChild(closeBtn2);
    ov.appendChild(head);

    /* Filter row */
    var filterRow = document.createElement('div');
    filterRow.style.cssText = 'display:flex;gap:8px;padding:10px 3.5%;flex-shrink:0;border-bottom:1px solid rgba(255,255,255,.06);';
    var activeFilter = 'all';
    var filterBtns = {};
    ['all','Movie','Series','Episode'].forEach(function(f){
      var fb = document.createElement('button');
      fb.textContent = f==='all'?'All':f==='Movie'?'Movies':f==='Series'?'Series':'Episodes';
      fb.style.cssText = 'padding:4px 14px;border-radius:999px;border:1px solid rgba(255,255,255,.18);'
        +'background:'+(f==='all'?'rgba(255,255,255,.18)':'rgba(255,255,255,.06)')+';'
        +'color:'+(f==='all'?'#fff':'rgba(255,255,255,.5)')+';'
        +'font-size:11px;cursor:pointer;transition:all .15s;font-family:inherit;';
      fb.addEventListener('click', function(){
        activeFilter = f;
        Object.keys(filterBtns).forEach(function(k){
          filterBtns[k].style.background = k===f?'rgba(255,255,255,.18)':'rgba(255,255,255,.06)';
          filterBtns[k].style.color = k===f?'#fff':'rgba(255,255,255,.5)';
        });
        renderGrid();
      });
      filterBtns[f] = fb;
      filterRow.appendChild(fb);
    });
    ov.appendChild(filterRow);

    /* Grid container */
    var gridWrap = document.createElement('div');
    gridWrap.style.cssText = 'flex:1;overflow-y:auto;padding:20px 3.5% 40px;'
      +'scrollbar-width:thin;scrollbar-color:rgba(255,255,255,.18) transparent;';
    var grid = document.createElement('div');
    grid.style.cssText = 'display:flex;flex-wrap:wrap;gap:14px;';
    gridWrap.appendChild(grid);
    ov.appendChild(gridWrap);

    /* Loading bar */
    var loadBar = document.createElement('div');
    loadBar.style.cssText = 'padding:16px 3.5%;text-align:center;color:rgba(255,255,255,.3);font-size:.8em;flex-shrink:0;';
    loadBar.textContent = 'Loading…';
    ov.appendChild(loadBar);

    document.body.appendChild(ov);
    var escAll = function(e){ if(e.key==='Escape'){ ov.remove(); document.removeEventListener('keydown',escAll); } };
    document.addEventListener('keydown', escAll);

    /* Load ALL pages */
    var allItems = [];
    var PAGE = 60;

    function loadAllPages(start) {
      fetch(serverUrl+'/Users/'+userId+'/Items'
        +'?SearchTerm='+encodeURIComponent(query.trim())
        +'&IncludeItemTypes=Movie,Series,Episode'
        +'&Recursive=true&Limit='+PAGE+'&StartIndex='+start
        +'&Fields=ProductionYear,BackdropImageTags,ImageTags,SeriesName,ParentIndexNumber,IndexNumber,SeriesPrimaryImageTag,SeriesId'
        +'&SortBy=SortName',
        {headers:{'X-Emby-Token':token}}
      ).then(function(r){return r.json();}).then(function(data){
        var items = data && data.Items ? data.Items : [];
        allItems = allItems.concat(items);
        countEl.textContent = allItems.length+' / '+total+' loaded';
        renderGrid();
        if (start + PAGE < total) {
          setTimeout(function(){ loadAllPages(start + PAGE); }, 100);
        } else {
          loadBar.style.display = 'none';
        }
      }).catch(function(){
        loadBar.textContent = 'Error loading results.';
      });
    }

    function renderGrid() {
      grid.innerHTML = '';
      var filtered = activeFilter === 'all'
        ? allItems
        : allItems.filter(function(i){ return i.Type === activeFilter; });

      filtered.forEach(function(item){
        var card = document.createElement('div');
        card.style.cssText = 'width:130px;cursor:pointer;flex-shrink:0;transition:transform .15s,opacity .15s;';
        card.onmouseover = function(){ card.style.transform='scale(1.04)';card.style.opacity='.9'; };
        card.onmouseout  = function(){ card.style.transform='scale(1)';card.style.opacity='1'; };
        card.addEventListener('click', function(){
          ov.remove();
          document.removeEventListener('keydown',escAll);
          navToItem(item.Id);
        });
        var url = imgUrl(item);
        card.innerHTML =
          '<div style="width:130px;height:195px;border-radius:8px;background:rgba(255,255,255,.06);'
            +'overflow:hidden;border:1px solid rgba(255,255,255,.07);">'
            +(url?'<img src="'+url+'" alt="" loading="lazy" style="width:100%;height:100%;object-fit:cover;display:block;" onerror="this.style.display=\'none\'">':"")
          +'</div>'
          +'<div style="font-size:12px;font-weight:500;color:rgba(255,255,255,.88);margin-top:7px;'
            +'white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">'+item.Name+'</div>'
          +'<div style="font-size:10px;color:rgba(255,255,255,.3);margin-top:2px;">'+(item.ProductionYear||item.Type||'')+'</div>';
        grid.appendChild(card);
      });

      if (!filtered.length && allItems.length > 0) {
        grid.innerHTML = '<div style="padding:60px 0;color:rgba(255,255,255,.2);font-size:.85em;text-align:center;">No results in this category.</div>';
      }
    }

    loadAllPages(0);
  }

})();


/* ════════════════════════════════════════════════════════════
   3b) HEADER REORDER + WÜRFEL + DREIECK
   ════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  var PILL_BASE = ['display:none','position:fixed','background:rgba(22,23,34,0.97)','border:1px solid rgba(255,255,255,0.16)','border-radius:999px','padding:4px 6px','flex-direction:row','align-items:center','justify-content:center','gap:0','z-index:9999999','box-shadow:0 8px 28px rgba(0,0,0,0.65)','white-space:nowrap','min-width:max-content','box-sizing:border-box'].join(';')+';';

  /* ── Gemeinsamer Popup-State für gegenseitiges Schließen ── */
  var activePopup = null; // 'wuerfel' | 'tri' | null

  function closeWuerfelPopup() {
    var p = document.getElementById('jf-wuerfel-popup');
    if (p) p.style.display = 'none';
  }
  function closeTriPopup() {
    var p = document.getElementById('jf-pill');
    if (p) p.style.display = 'none';
    var svg = document.getElementById('jf-tri-svg');
    if (svg) svg.style.transform = 'rotate(180deg)';
  }
  function closeAll() {
    closeWuerfelPopup();
    closeTriPopup();
    activePopup = null;
  }

  function positionBelow(popup,refEl,alignRight){var rect=refEl.getBoundingClientRect();popup.style.top=(rect.bottom+6)+'px';if(alignRight){popup.style.right=(window.innerWidth-rect.right)+'px';popup.style.left='auto';popup.style.transform='none';}else{popup.style.left=(rect.left+rect.width/2)+'px';popup.style.right='auto';popup.style.transform='translateX(-50%)';}}

  if (!document.querySelector('#jf-header-style')) {
    var hs=document.createElement('style');hs.id='jf-header-style';
    hs.textContent=[
      '#chatBtn,#ratingsButtonGroup{display:none!important;visibility:hidden!important;width:0!important;height:0!important;min-width:0!important;min-height:0!important;padding:0!important;margin:0!important;border:none!important;overflow:hidden!important;pointer-events:none!important;position:absolute!important;left:-9999px!important;opacity:0!important;}',
      '#jf-pill #chatBtn{display:inline-flex!important;visibility:visible!important;width:40px!important;height:40px!important;min-width:40px!important;padding:0!important;margin:0!important;position:relative!important;left:auto!important;opacity:1!important;pointer-events:auto!important;flex-shrink:0!important;}',
      '#jf-pill #je-active-streams{display:inline-flex!important;visibility:visible!important;width:40px!important;min-width:40px!important;height:40px!important;padding:0!important;margin:0!important;position:relative!important;left:auto!important;opacity:1!important;pointer-events:auto!important;flex-shrink:0!important;align-items:center!important;justify-content:center!important;}',
      '#jf-pill>*,#jf-pill button{flex-shrink:0!important;margin:0!important;}',
      /* Streams-Panel nach links verschieben damit Dreieck nicht verdeckt wird */
      '#je-active-streams-panel{right:auto!important;left:auto!important;transform:none!important;}',
      '.headerAudioPlayerButton{display:none!important;}',
      'span.headerSelectedPlayer{display:none!important;}',
      '#randomItemButtonContainer{display:none!important;}',
      /* IP-Adresse im Streams-Panel ausblenden */
      '.je-as-user{display:none!important;}',
      '.je-as-broadcast-form a[href*="192."],.je-as-broadcast-form a[href*="10."],.je-as-broadcast-form a[href*="http"]{display:none!important;}',
      '#jf-pill #je-active-streams-panel a[href*="http"],.je-as-card-direct{display:none!important;}',
      '#jf-tri-badge{position:absolute;top:-3px;right:-5px;background:#e53935;color:#fff;font-size:9px;font-weight:700;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;min-width:14px;height:14px;border-radius:7px;display:none;align-items:center;justify-content:center;padding:0 3px;pointer-events:none;line-height:1;z-index:2;}',
      /* Action Sheets immer mittig — CSS schlägt JS-Inline-Styles */
      /* Nur Sync/Cast Dialoge mittig — KefinTweaks und andere ausschließen */
      '.syncPlayGroupMenu.opened{left:50%!important;transform:translateX(-50%)!important;right:auto!important;margin:0!important;top:58px!important;}',
      '.focuscontainer.dialog.actionSheet.opened:not(.kefinTweaks-popover):not([class*="kefin"]):not([class*="season"]):not([class*="popover"]){left:50%!important;transform:translateX(-50%)!important;right:auto!important;margin:0!important;top:58px!important;}'
    ].join('\n');
    document.head.appendChild(hs);
  }

  function forceHideChatBtn(){var el=document.getElementById('chatBtn');if(!el||el.closest('#jf-pill'))return;el.style.setProperty('display','none','important');el.style.setProperty('visibility','hidden','important');el.style.setProperty('width','0','important');el.style.setProperty('height','0','important');el.style.setProperty('pointer-events','none','important');el.style.setProperty('position','absolute','important');el.style.setProperty('left','-9999px','important');el.style.setProperty('opacity','0','important');}
  var chatHideObs=new MutationObserver(forceHideChatBtn);
  function watchChatBtn(){var el=document.getElementById('chatBtn');if(el){forceHideChatBtn();chatHideObs.observe(el,{attributes:true,attributeFilter:['style']});}}
  setInterval(function(){forceHideChatBtn();watchChatBtn();},1000);
  setTimeout(watchChatBtn,500);
  setTimeout(watchChatBtn,2000);

  /* ── WÜRFEL ── */
  function buildWuerfel(){
    if(document.getElementById('jf-wuerfel-wrap'))return document.getElementById('jf-wuerfel-wrap');
    function loadSettings(){try{return JSON.parse(localStorage.getItem('jf-wuerfel-cfg')||'{}');}catch(e){return{};}}
    function saveSettings(cfg){try{localStorage.setItem('jf-wuerfel-cfg',JSON.stringify(cfg));}catch(e){}}
    var wrap=document.createElement('div');wrap.id='jf-wuerfel-wrap';wrap.style.cssText='position:relative;display:inline-flex;align-items:center;flex-shrink:0;';
    var btn=document.createElement('button');btn.id='jf-wuerfel-btn';btn.title='Zufälliges Medium';btn.style.cssText='display:inline-flex;align-items:center;justify-content:center;width:40px;height:40px;background:none;border:none;outline:none;cursor:pointer;border-radius:50%;transition:background 0.2s;flex-shrink:0;padding:0;';
    btn.innerHTML='<svg width="24" height="24" viewBox="0 0 24 24"><rect x="2" y="2" width="20" height="20" rx="3.5" fill="rgba(255,255,255,0.87)"/><circle cx="7" cy="7" r="1.6" fill="rgba(22,23,34,0.95)"/><circle cx="17" cy="7" r="1.6" fill="rgba(22,23,34,0.95)"/><circle cx="12" cy="12" r="1.6" fill="rgba(22,23,34,0.95)"/><circle cx="7" cy="17" r="1.6" fill="rgba(22,23,34,0.95)"/><circle cx="17" cy="17" r="1.6" fill="rgba(22,23,34,0.95)"/></svg>';
    btn.onmouseover=function(){btn.style.background='rgba(255,255,255,0.1)';};btn.onmouseout=function(){btn.style.background='none';};
    var popup=document.createElement('div');popup.id='jf-wuerfel-popup';popup.style.cssText=PILL_BASE;
    function fetchRandom(types){var cfg=loadSettings();var ac=window.ApiClient;if(!ac)return;var userId=ac._currentUserId||(ac.getCurrentUserId&&ac.getCurrentUserId());var token=ac._token||(ac.accessToken&&ac.accessToken());if(!userId||!token)return;var url='/Items?SortBy=Random&Limit=1&Recursive=true&IncludeItemTypes='+types+'&UserId='+userId;if(cfg.minRating&&cfg.minRating>0)url+='&MinCommunityRating='+cfg.minRating;if(cfg.genres&&cfg.genres.length>0)url+='&Genres='+encodeURIComponent(cfg.genres.join('|'));fetch(url,{headers:{'X-Emby-Token':token}}).then(function(r){return r.json();}).then(function(d){var item=d.Items&&d.Items[0];if(item)window.location.href='/web/#/details?id='+item.Id;});}
    function makeDiceBtn(letter,tooltip,types){var b=document.createElement('button');b.title=tooltip;b.style.cssText='display:inline-flex;align-items:center;justify-content:center;width:40px;height:40px;background:none;border:none;outline:none;cursor:pointer;border-radius:50%;transition:background 0.15s;padding:0;flex-shrink:0;';b.innerHTML='<svg width="26" height="26" viewBox="0 0 26 26" fill="none"><rect x="2" y="2" width="22" height="22" rx="4" stroke="rgba(255,255,255,0.87)" stroke-width="1.8"/><text x="13" y="17.5" text-anchor="middle" font-family="-apple-system,BlinkMacSystemFont,sans-serif" font-size="12" font-weight="700" fill="rgba(255,255,255,0.87)">'+letter+'</text></svg>';b.onmouseover=function(){b.style.background='rgba(255,255,255,0.1)';};b.onmouseout=function(){b.style.background='none';};b.addEventListener('click',function(e){e.stopPropagation();closeAll();fetchRandom(types);});return b;}
    var settingsModal=null;
    function openSettings(){if(settingsModal){settingsModal.style.display='flex';loadGenres();return;}var cfg=loadSettings();settingsModal=document.createElement('div');settingsModal.style.cssText='display:flex;position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.75);z-index:9999999;align-items:center;justify-content:center;box-sizing:border-box;';var box=document.createElement('div');box.style.cssText='background:#1e1e2e;border:1px solid rgba(255,255,255,0.15);border-radius:12px;padding:24px 28px;width:92%;max-width:420px;color:#fff;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;box-shadow:0 12px 48px rgba(0,0,0,0.8);position:relative;max-height:80vh;overflow-y:auto;';box.innerHTML='<button id="jf-cfg-close" style="position:absolute;top:10px;right:14px;background:none;border:none;color:rgba(255,255,255,0.5);font-size:20px;cursor:pointer;padding:4px 8px;border-radius:4px;">\xd7</button><h3 style="margin:0 0 18px;font-size:17px;font-weight:600;">⚙ Zufalls-Einstellungen</h3><label style="display:block;margin-bottom:6px;font-size:13px;color:rgba(255,255,255,0.7);">Mindestbewertung: <span id="jf-cfg-rating-val">'+(cfg.minRating||1)+'</span> ★</label><input id="jf-cfg-rating" type="range" min="1" max="10" step="0.5" value="'+(cfg.minRating||1)+'" style="width:100%;accent-color:#7c6af7;margin-bottom:20px;"><div style="font-size:13px;color:rgba(255,255,255,0.7);margin-bottom:8px;">Genres <span style="font-size:11px;opacity:0.5;">(leer = alle)</span></div><div id="jf-cfg-genres" style="display:flex;flex-wrap:wrap;gap:6px;margin-bottom:20px;min-height:32px;"><span style="opacity:0.4;font-size:12px;">Laden…</span></div><button id="jf-cfg-save" style="width:100%;padding:10px;background:#7c6af7;border:none;border-radius:8px;color:#fff;font-size:14px;font-weight:600;cursor:pointer;">Speichern</button>';settingsModal.appendChild(box);document.body.appendChild(settingsModal);var slider=document.getElementById('jf-cfg-rating');var ratingVal=document.getElementById('jf-cfg-rating-val');slider.addEventListener('input',function(){ratingVal.textContent=this.value;});document.getElementById('jf-cfg-save').addEventListener('click',function(){var selected=[];box.querySelectorAll('.jf-genre-chip.active').forEach(function(c){selected.push(c.dataset.genre);});saveSettings({minRating:parseFloat(slider.value),genres:selected});settingsModal.style.display='none';});document.getElementById('jf-cfg-close').addEventListener('click',function(){settingsModal.style.display='none';});settingsModal.addEventListener('click',function(e){if(e.target===settingsModal)settingsModal.style.display='none';});loadGenres();}
    function loadGenres(){var ac=window.ApiClient;if(!ac)return;var userId=ac._currentUserId||(ac.getCurrentUserId&&ac.getCurrentUserId());var token=ac._token||(ac.accessToken&&ac.accessToken());var container=document.getElementById('jf-cfg-genres');if(!container||container.querySelector('.jf-genre-chip'))return;var cfg=loadSettings();fetch('/Genres?UserId='+userId+'&SortBy=SortName&Recursive=true&IncludeItemTypes=Movie,Series',{headers:{'X-Emby-Token':token}}).then(function(r){return r.json();}).then(function(d){container.innerHTML='';(d.Items||[]).forEach(function(g){var isActive=cfg.genres&&cfg.genres.indexOf(g.Name)>-1;var chip=document.createElement('button');chip.className='jf-genre-chip'+(isActive?' active':'');chip.dataset.genre=g.Name;chip.textContent=g.Name;chip.style.cssText='padding:4px 10px;border-radius:999px;border:1px solid '+(isActive?'#7c6af7':'rgba(255,255,255,0.25)')+';background:'+(isActive?'#7c6af7':'transparent')+';color:#fff;font-size:12px;cursor:pointer;transition:all 0.15s;';chip.addEventListener('click',function(e){e.stopPropagation();chip.classList.toggle('active');chip.style.background=chip.classList.contains('active')?'#7c6af7':'transparent';chip.style.borderColor=chip.classList.contains('active')?'#7c6af7':'rgba(255,255,255,0.25)';});container.appendChild(chip);});});}
    var gearBtn=document.createElement('button');gearBtn.title='Einstellungen';gearBtn.style.cssText='display:inline-flex;align-items:center;justify-content:center;width:36px;height:40px;background:none;border:none;outline:none;cursor:pointer;border-radius:50%;color:rgba(255,255,255,0.5);transition:color 0.15s;padding:0;flex-shrink:0;';gearBtn.innerHTML='<svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor"><path d="M19.14 12.94c.04-.3.06-.61.06-.94s-.02-.64-.07-.94l2.03-1.58a.49.49 0 00.12-.61l-1.92-3.32a.49.49 0 00-.59-.22l-2.39.96a7.02 7.02 0 00-1.62-.94l-.36-2.54a.484.484 0 00-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87a.49.49 0 00.12.61l2.03 1.58c-.05.3-.07.62-.07.94s.02.64.07.94l-2.03 1.58a.49.49 0 00-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.37 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.57 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32a.49.49 0 00-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z"/></svg>';gearBtn.onmouseover=function(){gearBtn.style.color='rgba(255,255,255,0.9)';};gearBtn.onmouseout=function(){gearBtn.style.color='rgba(255,255,255,0.5)';};gearBtn.addEventListener('click',function(e){e.stopPropagation();closeAll();openSettings();});
    popup.appendChild(makeDiceBtn('S','Zufällige Serie','Series'));
    popup.appendChild(makeDiceBtn('M','Zufälliger Film','Movie'));
    popup.appendChild(gearBtn);

    btn.addEventListener('click',function(e){
      e.stopPropagation();
      if(activePopup==='wuerfel'){closeAll();return;}
      closeAll();
      activePopup='wuerfel';
      positionBelow(popup,btn,false);
      popup.style.display='flex';
    });
    document.addEventListener('click',function(e){if(activePopup==='wuerfel'&&!wrap.contains(e.target)&&!popup.contains(e.target)){closeAll();}});
    window.addEventListener('scroll',function(){if(activePopup==='wuerfel')positionBelow(popup,btn,false);},true);
    window.addEventListener('resize',function(){if(activePopup==='wuerfel')positionBelow(popup,btn,false);});
    wrap.appendChild(btn);document.body.appendChild(popup);return wrap;
  }

  /* ── BADGE SYNC ── */
  function startBadgeSync(){var chatBtn=document.querySelector('#chatBtn');var triBadge=document.getElementById('jf-tri-badge');if(!chatBtn||!triBadge)return;function syncBadge(){var badge=chatBtn.querySelector('.chat-dm-badge,.chatDMBadge,[id*="chatDM"],.notificationCount,.badge');var count=badge?(badge.textContent||'').trim():'';if(!count){var m=(chatBtn.getAttribute('aria-label')||chatBtn.title||'').match(/\d+/);if(m)count=m[0];}if(count&&count!=='0'){triBadge.textContent=parseInt(count)>99?'99+':count;triBadge.style.display='flex';}else triBadge.style.display='none';}syncBadge();new MutationObserver(syncBadge).observe(chatBtn,{subtree:true,childList:true,attributes:true,characterData:true});}

  /* ── DREIECK + PILL ── */
  function buildTriangle(hr){
    if(document.querySelector('#jf-tri-wrap'))return;
    var chatBtn=document.querySelector('#chatBtn');
    var requestBtn=document.querySelector('#jbi-request-btn');
    var syncBtn=document.querySelector('button.headerSyncButton');
    var castBtn=document.querySelector('button.castButton');

    var pill=document.createElement('div');pill.id='jf-pill';pill.style.cssText=PILL_BASE;

    /* Streams: ganz links in die Pill — MutationObserver wie bei Chat */
    var LIVE_SVG = '<svg width="26" height="26" viewBox="0 0 28 28" fill="none" stroke="rgba(255,255,255,0.87)" stroke-width="1.7" stroke-linecap="round" style="display:block;">'
      + '<path d="M9.5 10a6 6 0 0 0 0 8"/>'
      + '<path d="M6.5 7.5a10 10 0 0 0 0 13"/>'
      + '<circle cx="14" cy="14" r="2.5" fill="#e53935" stroke="#e53935"/>'
      + '<path d="M18.5 10a6 6 0 0 1 0 8"/>'
      + '<path d="M21.5 7.5a10 10 0 0 1 0 13"/>'
      + '</svg>';

    function addStreamsBtn() {
      var sb = document.querySelector('#je-active-streams');
      if (!sb || pill.contains(sb)) return;
      /* Original-Icon durch Live-SVG ersetzen */
      if (!sb.querySelector('#jf-live-svg')) {
        /* Alle Kindelemente verstecken */
        Array.prototype.forEach.call(sb.children, function(c){ c.style.setProperty('display','none','important'); });
        var svgWrap = document.createElement('span');
        svgWrap.id = 'jf-live-svg';
        svgWrap.style.cssText = 'display:inline-flex;align-items:center;justify-content:center;pointer-events:none;';
        svgWrap.innerHTML = LIVE_SVG;
        sb.appendChild(svgWrap);
      }
      sb.style.setProperty('display','inline-flex','important');
      sb.style.setProperty('align-items','center','important');
      sb.style.setProperty('justify-content','center','important');
      sb.style.setProperty('flex-shrink','0','important');
      sb.style.setProperty('margin','0','important');
      sb.style.setProperty('width','40px','important');
      sb.style.setProperty('height','40px','important');
      /* Ganz links einfügen */
      pill.insertBefore(sb, pill.firstChild);
    }
    addStreamsBtn();

    /* Klick auf Streams-Button → Panel unter Pill positionieren */
    document.addEventListener('click', function(e) {
      var sb = document.getElementById('je-active-streams');
      if (!sb || !sb.contains(e.target)) return;
      setTimeout(function() {
        var panel = document.getElementById('je-active-streams-panel');
        if (!panel) return;
        var pill = document.getElementById('jf-pill');
        if (!pill) return;
        var pillRect = pill.getBoundingClientRect();
        panel.style.setProperty('position', 'fixed', 'important');
        panel.style.setProperty('top', (pillRect.bottom + 6) + 'px', 'important');
        /* Rechter Rand bündig mit Bildschirmrand — nie abgeschnitten */
        /* Bündig am rechten Bildschirmrand — nie abgeschnitten */
        panel.style.setProperty('left', '50%', 'important');
        panel.style.setProperty('right', 'auto', 'important');
        panel.style.setProperty('transform', 'translateX(-50%)', 'important');
        panel.style.setProperty('min-width', pillRect.width + 'px', 'important');
        panel.style.setProperty('border-radius', '12px', 'important');
        panel.style.setProperty('z-index', '9999999', 'important');
      }, 50);
    }, true);

    var streamsWatcher = new MutationObserver(function() {
      if (document.querySelector('#je-active-streams')) {
        addStreamsBtn();
        if (pill.querySelector('#je-active-streams')) streamsWatcher.disconnect();
      }
    });
    streamsWatcher.observe(document.body, {childList:true, subtree:true});
    setTimeout(function(){ streamsWatcher.disconnect(); }, 15000);

    /* Chat: Original verschieben */
    function addChatBtn(){var cb=document.querySelector('#chatBtn');if(!cb||pill.contains(cb))return;cb.style.setProperty('display','inline-flex','important');cb.style.setProperty('width','40px','important');cb.style.setProperty('height','40px','important');cb.style.setProperty('flex-shrink','0','important');cb.style.removeProperty('margin');pill.appendChild(cb);startBadgeSync();}
    addChatBtn();
    var chatWatcher=new MutationObserver(function(){if(document.querySelector('#chatBtn')){addChatBtn();chatWatcher.disconnect();}});
    chatWatcher.observe(document.body,{childList:true,subtree:true});
    setTimeout(function(){chatWatcher.disconnect();},10000);

    /* Request: Original verschieben */
    if(requestBtn){requestBtn.style.setProperty('display','inline-flex','important');requestBtn.style.setProperty('width','40px','important');requestBtn.style.setProperty('height','40px','important');requestBtn.style.setProperty('flex-shrink','0','important');requestBtn.style.setProperty('margin','0','important');pill.appendChild(requestBtn);}

    /* Sync + Cast: Original verschieben */
    [syncBtn,castBtn].forEach(function(el){if(!el)return;el.style.setProperty('display','inline-flex','important');el.style.setProperty('flex-shrink','0','important');el.style.setProperty('margin','0','important');pill.appendChild(el);});

    /* Dreieck */
    var triWrap=document.createElement('div');triWrap.id='jf-tri-wrap';triWrap.style.cssText='position:relative;display:inline-flex;align-items:center;margin-left:2px;';
    var triDiv=document.createElement('div');triDiv.id='jf-tri-btn';triDiv.title='Streams / Chat / Request / Sync / Cast';triDiv.style.cssText='cursor:pointer;display:inline-flex;align-items:center;justify-content:center;width:32px;height:40px;background:none;border:none;outline:none;user-select:none;line-height:0;position:relative;';
    triDiv.innerHTML='<svg id="jf-tri-svg" width="12" height="10" viewBox="0 0 12 10" fill="rgba(255,255,255,0.85)" style="display:block;transition:transform 0.2s ease;transform:rotate(180deg);"><polygon points="6,0 12,10 0,10"/></svg><span id="jf-tri-badge"></span>';

    triDiv.addEventListener('click',function(e){
      e.stopPropagation();
      if(activePopup==='tri'){closeAll();return;}
      closeAll();
      activePopup='tri';
      positionBelow(pill,triDiv,true);
      pill.style.display='flex';
      var svg=document.getElementById('jf-tri-svg');
      if(svg)svg.style.transform='rotate(0deg)';
    });
    document.addEventListener('click',function(e){
      if(activePopup==='tri'&&!triWrap.contains(e.target)&&!pill.contains(e.target)){
        closeAll();
      }
    });
    window.addEventListener('scroll',function(){if(activePopup==='tri')positionBelow(pill,triDiv,true);},true);
    window.addEventListener('resize',function(){if(activePopup==='tri')positionBelow(pill,triDiv,true);});

    triWrap.appendChild(triDiv);hr.appendChild(triWrap);document.body.appendChild(pill);

    /* ── Pill: alle Buttons schließen sich gegenseitig ── */
    pill.addEventListener('click', function() {
      /* Alle offenen Jellyfin-Dialoge schließen */
      document.querySelectorAll('.actionSheet.opened, .dialog.actionSheet').forEach(function(d) {
        var cb = d.querySelector('.btnCancel,.btnClose,[data-action="cancel"],[data-action="close"]');
        if (cb) cb.click();
        else {
          var backdrop = document.querySelector('.dialogBackdropOpened');
          if (backdrop) backdrop.click();
        }
      });
      /* Streams-Panel schließen */
      var sp = document.getElementById('je-active-streams-panel');
      if (sp && sp.classList.contains('je-as-panel-open')) {
        var sb = document.getElementById('je-active-streams');
        if (sb) sb.click(); /* Toggle: einmal klicken schließt es */
      }
    }, true); /* capture=true → läuft VOR dem Button-Handler */
  }

  /* ── STREAMS-PANEL REPOSITIONER ── */
  /* Wenn das Panel aufgeht, links vom Dreieck positionieren */
  new MutationObserver(function(mutations) {
    mutations.forEach(function(m) {
      m.addedNodes.forEach(function(node) {
        if (node.id === 'je-active-streams-panel' || (node.nodeType === 1 && node.querySelector && node.querySelector('#je-active-streams-panel'))) {
          setTimeout(repositionStreamsPanel, 30);
        }
      });
    });
    mutations.forEach(function(m) {
      if (m.type === 'attributes' && m.target.id === 'je-active-streams-panel') {
        setTimeout(repositionStreamsPanel, 30);
      }
    });
  }).observe(document.body, {childList: true, subtree: true, attributes: true, attributeFilter: ['style', 'class']});

  function repositionStreamsPanel() {
    var panel = document.getElementById('je-active-streams-panel');
    if (!panel || panel.style.display === 'none') return;
    var pill = document.getElementById('jf-pill');
    if (!pill) return;
    var pillRect = pill.getBoundingClientRect();
    /* Panel unten bündig unter dem Langloch — linksbündig mit Pill */
    panel.style.setProperty('position', 'fixed', 'important');
    panel.style.setProperty('right', 'auto', 'important');
    panel.style.setProperty('left', pillRect.left + 'px', 'important');
    panel.style.setProperty('top', (pillRect.bottom + 6) + 'px', 'important');
    panel.style.setProperty('min-width', pillRect.width + 'px', 'important');
    panel.style.setProperty('border-radius', '12px', 'important');
  }

  /* ── ACTION SHEET REPOSITIONER (Sync/Cast/Watchgroup Popups unter Pill) ── */
  function repositionActionSheet(el) {
    if (!el || !el.classList) return;
    if (!el.classList.contains('actionSheet') && !el.classList.contains('dialog')) return;
    /* Nur wenn aus der Pill ausgelöst (Pill sichtbar) */
    var pill = document.getElementById('jf-pill');
    if (!pill || pill.style.display === 'none') return;

    /* KefinTweaks und Popover-Dialoge nicht anfassen */
    if (el.classList.contains('kefinTweaks-popover') ||
        el.className.indexOf('kefin') > -1 ||
        el.className.indexOf('season') > -1 ||
        el.className.indexOf('popover') > -1) return;

    /* Gegenseitiges Schließen: alle anderen offenen Action Sheets schließen */
    document.querySelectorAll('.actionSheet.opened, .dialog.opened').forEach(function(other) {
      if (other === el) return;
      /* Jellyfin's eigene Close-Funktion aufrufen */
      var closeBtn = other.querySelector('.btnCancel, .btnClose, [data-action="cancel"]');
      if (closeBtn) {
        closeBtn.click();
      } else {
        /* Fallback: backdrop klicken */
        var backdrop = document.querySelector('.dialogBackdropOpened');
        if (backdrop) backdrop.click();
      }
    });

    var pillRect = pill.getBoundingClientRect();
    el.style.setProperty('position', 'fixed', 'important');
    el.style.setProperty('top', (pillRect.bottom + 8) + 'px', 'important');
    el.style.setProperty('left', '50%', 'important');
    el.style.setProperty('right', 'auto', 'important');
    el.style.setProperty('margin', '0', 'important');
    el.style.setProperty('transform', 'translateX(-50%)', 'important');
    el.style.setProperty('z-index', '9999998', 'important');
  }

  /* Style-Watcher: korrigiert Position sofort wenn Jellyfin sie überschreibt */
  var sheetStyleObs = new MutationObserver(function(mutations) {
    mutations.forEach(function(m) {
      var el = m.target;
      if (!el.classList) return;
      if (!el.classList.contains('actionSheet') && !el.classList.contains('dialog')) return;
      if (!el.classList.contains('opened')) return;
      /* Wenn left nicht 50% ist → sofort korrigieren */
      if (el.style.left !== '50%') {
        repositionActionSheet(el);
      }
    });
  });

  new MutationObserver(function(mutations) {
    mutations.forEach(function(m) {
      /* Neues Dialog-Element hinzugefügt */
      m.addedNodes.forEach(function(node) {
        if (node.nodeType !== 1) return;
        if (node.classList && (node.classList.contains('actionSheet') || node.classList.contains('focuscontainer'))) {
          /* Mehrfach feuern + Style-Watcher starten */
          [0, 50, 150, 300].forEach(function(delay) {
            setTimeout(function() { repositionActionSheet(node); }, delay);
          });
          sheetStyleObs.observe(node, { attributes: true, attributeFilter: ['style'] });
          setTimeout(function() { sheetStyleObs.disconnect(); }, 5000);
        }
      });
      /* Class-Änderung: 'opened' wurde hinzugefügt */
      if (m.type === 'attributes' && m.target.classList) {
        if (m.target.classList.contains('opened') &&
            (m.target.classList.contains('actionSheet') || m.target.classList.contains('dialog'))) {
          [0, 50, 150, 300].forEach(function(delay) {
            setTimeout(function() { repositionActionSheet(m.target); }, delay);
          });
          sheetStyleObs.observe(m.target, { attributes: true, attributeFilter: ['style'] });
          setTimeout(function() { sheetStyleObs.disconnect(); }, 5000);
        }
      }
    });
  }).observe(document.body, {
    childList: true, subtree: true,
    attributes: true, attributeFilter: ['class']
  });

  /* ── APPLY ORDER ── */
  function applyOrder(){
    var hr=document.querySelector('.headerRight');if(!hr)return false;
    var jbi=document.querySelector('#jbi-container');if(!jbi)return false;
    var ping=document.querySelector('[id^="jf-ping"]')||document.querySelector('#jf-header-ping');
    var origRand=document.querySelector('#randomItemButtonContainer');if(origRand)origRand.style.setProperty('display','none','important');
    var rand=document.querySelector('#jf-wuerfel-wrap');if(!rand)rand=buildWuerfel();
    var avatar=document.querySelector('button.headerUserButtonRound')||document.querySelector('button.headerUserButton')||document.querySelector('button[data-long-press-enhanced]');
    buildTriangle(hr);
    var triWrap=document.querySelector('#jf-tri-wrap');
    [ping,rand,jbi,triWrap,avatar].forEach(function(el){if(el)hr.appendChild(el);});
    console.log('[JF-Header] ✓ Fertig');
    return true;
  }

  var applied=false;
  function tryApply(){if(applied)return;if(applyOrder()){applied=true;return;}setTimeout(tryApply,400);}
  document.addEventListener('jbi-ready',function(){setTimeout(tryApply,200);});
  var applyObs=new MutationObserver(function(){if(applied){applyObs.disconnect();return;}if(document.querySelector('#jbi-container')&&document.querySelector('.headerRight')){setTimeout(function(){if(applyOrder()){applied=true;applyObs.disconnect();}},300);}});
  function startApplyObs(){applyObs.observe(document.body,{childList:true,subtree:true});setTimeout(function(){applyObs.disconnect();},20000);}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',startApplyObs);else startApplyObs();

})();


/* ══════════════════════════════════════════════════════════
   SUCHE: Native Suchseite unterdrücken → zurück zur vorherigen Seite
   ══════════════════════════════════════════════════════════ */
(function() {
  'use strict';
  function suppressSearchPage() {
    var hash = window.location.hash || '';
    if (hash.indexOf('search.html') !== -1 || hash.indexOf('/search') !== -1) {
      /* Suche-Seite → sofort zurück */
      if (window.history.length > 1) {
        window.history.back();
      } else {
        window.location.hash = '#!/home.html';
      }
      /* Custom Search Modal öffnen */
      setTimeout(function() {
        var jbiSearchBtn = document.getElementById('jbi-search-btn');
        if (jbiSearchBtn) jbiSearchBtn.click();
      }, 150);
    }
  }
  window.addEventListener('hashchange', suppressSearchPage);
  suppressSearchPage();
})();
