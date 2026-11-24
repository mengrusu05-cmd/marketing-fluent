// Marketing Fluent V1.0.1 - navigation network-first and recoverable manual update.
const CACHE='marketing-fluent-v1-0-1-production-20261124';
const APP_FILES=['./','./index.html','./manifest.webmanifest','./marketing-fluent-icon.svg','./apple-touch-icon.png','./icon-192.png','./icon-512.png'];
self.addEventListener('install',event=>event.waitUntil(
 caches.open(CACHE).then(c=>c.addAll(APP_FILES)).then(()=>self.skipWaiting())
));
self.addEventListener('activate',event=>event.waitUntil(
 caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('marketing-fluent-')&&k!==CACHE).map(k=>caches.delete(k))))
 .then(()=>self.clients.claim())
));
self.addEventListener('message',event=>{if(event.data?.type==='SKIP_WAITING')self.skipWaiting()});
self.addEventListener('fetch',event=>{
 const req=event.request,u=new URL(req.url);
 if(req.method!=='GET'||u.origin!==self.location.origin)return;
 if(u.pathname.endsWith('/version.json')||u.pathname.endsWith('/sw.js'))return;
 if(req.mode==='navigate'){
  event.respondWith(fetch(req,{cache:'no-store'}).then(res=>{
   if(!res.ok)throw Error('Bad navigation');
   const copy=res.clone();event.waitUntil(caches.open(CACHE).then(c=>c.put('./index.html',copy)));
   return res;
  }).catch(async()=>await caches.match('./index.html')||Response.error()));
  return;
 }
 event.respondWith(caches.match(req).then(cached=>cached||fetch(req).then(res=>{
  if(res.ok){const copy=res.clone();event.waitUntil(caches.open(CACHE).then(c=>c.put(req,copy)))}
  return res;
 })));
});
