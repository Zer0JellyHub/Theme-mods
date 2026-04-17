(function(){'use strict';
document.head.appendChild(Object.assign(document.createElement('style'),{textContent:`#vsf-popup{position:fixed;bottom:90px;right:20px;width:300px;background:#1e1e1e;border:1px solid #444;border-radius:12px;z-index:999999;box-shadow:0 16px 60px rgba(0,0,0,.95);overflow:hidden;display:none;flex-direction:column}#vsf-popup.open{display:flex}#vsf-popup .hdr{padding:12px 16px;background:rgba(0,164,220,.1);border-bottom:1px solid #444;font-size:11px;font-weight:800;letter-spacing:1.5px;text-transform:uppercase;color:#00a4dc}#vsf-popup .list{max-height:280px;overflow-y:auto;padding:6px}#vsf-popup .item{padding:10px 12px;border-radius:8px;cursor:pointer;border:1px solid transparent;display:flex;align-items:center;justify-content:space-between;gap:8px;color:#fff;transition:background .15s}#vsf-popup .item:hover{background:rgba(255,255,255,.07)}#vsf-popup .item.active{background:rgba(0,164,220,.15);border-color:rgba(0,164,220,.4)}#vsf-popup .item.active .iname{color:#00a4dc}#vsf-popup .iname{font-size:13px;font-weight:600;margin-bottom:2px}#vsf-popup .imeta{font-size:10px;color:#888}#vsf-popup .chk{width:18px;height:18px;border-radius:50%;background:#00dc7d;display:flex;align-items:center;justify-content:center;font-size:10px;flex-shrink:0}#vsf-popup .unchk{width:18px;height:18px;border-radius:50%;border:1.5px solid #555;flex-shrink:0}#vsf-toast{position:fixed;bottom:140px;left:50%;transform:translateX(-50%) translateY(10px);background:rgba(0,0,0,.92);border:1px solid rgba(0,220,125,.45);color:#00dc7d;padding:9px 18px;border-radius:8px;font-size:12px;font-weight:700;z-index:999999;opacity:0;pointer-events:none;transition:all .3s ease;white-space:nowrap}#vsf-toast.show{opacity:1;transform:translateX(-50%) translateY(0)}`}));
function toast(m){let t=document.getElementById('vsf-toast');if(!t){t=document.createElement('div');t.id='vsf-toast';document.body.appendChild(t)}clearTimeout(t._t);t.textContent=m;t.classList.add('show');t._t=setTimeout(()=>t.classList.remove('show'),2500)}
function getItemId(){const v=document.querySelector('video');if(v?.src){const m=v.src.match(/\/Videos\/([a-f0-9]{20,})\//i);if(m)return m[1]}const h=(location.hash+location.search).match(/[?&]id=([a-f0-9]{20,})/i);return h?h[1]:null}
function getActiveMsId(){const v=document.querySelector('video');if(!v?.src)return null;const m=v.src.match(/mediaSourceId=([a-f0-9]{20,})/i)||v.src.match(/\/([a-f0-9]{20,})\/stream/i);return m?m[1]:null}
function verName(s,i){let r=(s.Name||'').trim().replace(/\btt\d{5,}\b/gi,'').replace(/\s{2,}/g,' ').trim();if(r&&!/^\d+$/.test(r)&&!/^[a-f0-9]{20,}$/i.test(r))return r;if(s.Path){const f=s.Path.split(/[/\\]/).pop().replace(/\.[^.]+$/,'').replace(/\btt\d{5,}\b/gi,'').trim(),p=f.split(' - ');return p.length>1?p[p.length-1].trim():f}return'Version '+(i+1)}
async function switchVersion(msId){
document.getElementById('vsf-popup')?.classList.remove('open');
const vid=document.querySelector('video'),ticks=vid?vid.currentTime:0,id=getItemId();
if(!id||!vid){toast('⚠ Kein Video');return}
try{
const u=ApiClient.getCurrentUserId(),tok=ApiClient.accessToken(),base=ApiClient.serverAddress();
const res=await fetch(`${base}/Items/${id}/PlaybackInfo?userId=${u}&mediaSourceId=${msId}`,{method:'POST',headers:{'Content-Type':'application/json','X-Emby-Token':tok},body:JSON.stringify({UserId:u,MediaSourceId:msId,EnableDirectStream:true,EnableDirectPlay:true})});
const info=await res.json();
const src=info.MediaSources?.find(s=>s.Id===msId)||info.MediaSources?.[0];
if(!src){toast('⚠ Version nicht gefunden');return}
const url=src.SupportsDirectStream?`${base}/Videos/${id}/stream.${src.Container||'mp4'}?MediaSourceId=${msId}&Static=true&api_key=${tok}`:src.TranscodingUrl?base+src.TranscodingUrl:`${base}/Videos/${id}/stream?MediaSourceId=${msId}&api_key=${tok}`;
vid.src=url;vid.currentTime=ticks;vid.play().catch(()=>{});
toast('✓ Version gewechselt');
}catch(e){toast('⚠ '+e.message)}}
async function openPopup(){
const pp=document.getElementById('vsf-popup');
if(pp?.classList.contains('open')){pp.classList.remove('open');clearTimeout(pp._autoClose);return}
const id=getItemId();if(!id){toast('⚠ Kein Video');return}
let item;try{item=await ApiClient.getItem(ApiClient.getCurrentUserId(),id)}catch(e){toast('⚠ Ladefehler');return}
if(item.Type!=="Movie"){return}
const src=item.MediaSources||[];if(src.length<=1){toast('ℹ Nur eine Version');return}
const activeId=getActiveMsId()||src[0].Id;
let p=document.getElementById('vsf-popup');
if(!p){p=document.createElement('div');p.id='vsf-popup';document.body.appendChild(p);document.addEventListener('click',e=>{const b=document.getElementById('vsf-btn');if(!p.contains(e.target)&&!b?.contains(e.target)){p.classList.remove('open');clearTimeout(p._autoClose)}})}
p.innerHTML=`<div class="hdr">🎬 Versionen <span style="opacity:.5;font-weight:400;letter-spacing:0;margin-left:6px">${src.length} verfügbar</span></div><div class="list">${src.map((s,i)=>{const a=s.Id===activeId,vs=(s.MediaStreams||[]).find(x=>x.Type==='Video'),meta=[vs?.Height?vs.Height+'p':'',s.Size?(s.Size/1073741824).toFixed(1)+' GB':''].filter(Boolean).join(' · ');return`<div class="item${a?' active':''}" data-ms="${s.Id}"><div style="min-width:0"><div class="iname">${verName(s,i)}</div>${meta?`<div class="imeta">${meta}</div>`:''}</div>${a?'<div class="chk">✓</div>':'<div class="unchk"></div>'}</div>`}).join('')}</div>`;
p.querySelectorAll('.item').forEach(el=>el.addEventListener('click',()=>switchVersion(el.dataset.ms)));
p.classList.add('open');
clearTimeout(p._autoClose);p._autoClose=setTimeout(()=>p.classList.remove('open'),5000)}
let _btn=null,_busy=false,_lastId='',_valid=false;
function getOrCreateBtn(){if(!_btn){_btn=document.createElement('button');_btn.id='vsf-btn';_btn.setAttribute('is','paper-icon-button-light');_btn.className='autoSize paper-icon-button-light';_btn.title='Version wählen';_btn.innerHTML=`<span class="material-icons" style="font-size:1.4em;vertical-align:middle">video_library</span>`;_btn.addEventListener('click',e=>{e.stopPropagation();openPopup()})}return _btn}
function tryInject(){
const id=getItemId(),c=document.querySelector('.buttons.focuscontainer-x');
if(!c||!id){if(_btn?.parentNode)_btn.parentNode.removeChild(_btn);return}
if(id!==_lastId&&!_busy){_lastId=id;_valid=false;if(_btn?.parentNode)_btn.parentNode.removeChild(_btn);_busy=true;ApiClient.getItem(ApiClient.getCurrentUserId(),id).then(item=>{_busy=false;if(item.Type!=="Movie"||!item.MediaSources||item.MediaSources.length<=1){_valid=false;return}_valid=true;const c2=document.querySelector('.buttons.focuscontainer-x');if(!c2)return;const btn=getOrCreateBtn();const cc=c2.querySelector('.btnSubtitles');if(cc)cc.before(btn);else c2.appendChild(btn)}).catch(()=>{_busy=false});return}
if(!_btn?.parentNode&&id===_lastId&&!_busy&&_valid){const btn=getOrCreateBtn();const cc=c.querySelector('.btnSubtitles');if(cc)cc.before(btn);else c.appendChild(btn)}}
setInterval(tryInject,500);
document.addEventListener('mousemove',()=>tryInject(),{passive:true});
new MutationObserver(()=>tryInject()).observe(document.body,{childList:true,subtree:true});
})();
