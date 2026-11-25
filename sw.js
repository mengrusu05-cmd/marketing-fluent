// Marketing Fluent V1.0.71 - navigation network-first and recoverable manual update.
const CACHE='marketing-fluent-v1-0-71-production-20261125';
const APP_FILES=['./','./index.html','./manifest.webmanifest','./marketing-fluent-icon.svg','./apple-touch-icon.png','./icon-192.png','./icon-512.png'];
self.addEventListener('install',event=>event.waitUntil(
 caches.open(CACHE).then(c=>c.addAll(APP_FILES.map(file=>new Request(new URL(file,self.registration.scope),{cache:'reload'})))).then(()=>self.skipWaiting())
));
self.addEventListener('activate',event=>event.waitUntil(
 caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('marketing-fluent-')&&k!==CACHE).map(k=>caches.delete(k))))
 .then(()=>self.clients.claim())
));
self.addEventListener('message',event=>{if(event.data?.type==='SKIP_WAITING')self.skipWaiting()});
self.addEventListener('fetch',event=>{
 const req=event.request,u=new URL(req.url);
 if(req.method!=='GET'||u.origin!==self.location.origin)return;
 if(u.pathname.endsWith('/version.json')||u.pathname.endsWith('/sw.js')||u.searchParams.has('check_build'))return;
 if(req.mode==='navigate'){
  const home=new URL('./index.html',self.registration.scope), base=new URL('./',self.registration.scope);
  if(u.pathname!==home.pathname&&u.pathname!==base.pathname)return;
  event.respondWith(fetch(req,{cache:'no-store'}).then(res=>{
   if(!res.ok)throw Error('Bad navigation');
   const copy=res.clone();event.waitUntil(caches.open(CACHE).then(c=>c.put('./index.html',copy)));
   return res;
  }).catch(async()=>await (await caches.open(CACHE)).match('./index.html')||Response.error()));
  return;
 }
 if(!APP_FILES.some(file=>new URL(file,self.registration.scope).href===u.href))return;
 event.respondWith(caches.open(CACHE).then(c=>c.match(req)).then(cached=>cached||fetch(req).then(res=>{
  if(res.ok){const copy=res.clone();event.waitUntil(caches.open(CACHE).then(c=>c.put(req,copy)))}
  return res;
 })));
});
