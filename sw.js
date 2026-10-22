// 한 줄 알림장 오프라인 작동용 서비스 워커
const CACHE="alim-5e1bc0f4";
const CORE=["./","index.html","manifest.webmanifest","icon-192.png","icon-512.png","maskable-512.png","apple-touch-icon.png","favicon-32.png"];
self.addEventListener("install",e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(CORE)).then(()=>self.skipWaiting()));});
self.addEventListener("activate",e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k.startsWith("alim-")&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));});
self.addEventListener("fetch",e=>{
  const r=e.request;if(r.method!=="GET")return;
  const u=new URL(r.url);
  if(u.hostname==="api.anthropic.com")return;               // AI 요청은 그대로 보냄
  const font=u.hostname==="fonts.googleapis.com"||u.hostname==="fonts.gstatic.com";
  if(u.origin!==location.origin&&!font)return;
  if(r.mode==="navigate"){                                    // 페이지: 인터넷 먼저, 안 되면 저장본
    e.respondWith(fetch(r).then(res=>{const cp=res.clone();caches.open(CACHE).then(c=>c.put("index.html",cp));return res;}).catch(()=>caches.match("index.html")));return;
  }
  e.respondWith(caches.match(r).then(hit=>{                   // 나머지: 저장본 먼저, 뒤에서 새로 받기
    const net=fetch(r).then(res=>{if(res&&(res.ok||res.type==="opaque")){const cp=res.clone();caches.open(CACHE).then(c=>c.put(r,cp));}return res;}).catch(()=>hit);
    return hit||net;
  }));
});
