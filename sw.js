// Marketing Fluent V1.0.73 - cache-first normal navigation and recoverable manual update.
const CACHE='marketing-fluent-v1-0-73-production-20261125';
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
  event.respondWith((async()=>{
   const cache=await caches.open(CACHE),cached=await cache.match('./index.html');
   // Normal launches never wait for the network when the installed shell exists.
   if(cached&&!u.searchParams.has('hr_refresh'))return cached;
   const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),5000);
   try{const res=await fetch(req,{cache:'no-store',signal:controller.signal});
    if(!res.ok)throw Error('Bad navigation');
    await cache.put('./index.html',res.clone());return res;
   }catch(e){return cached||Response.error()}finally{clearTimeout(timer)}
  })());
  return;
 }
 if(!APP_FILES.some(file=>new URL(file,self.registration.scope).href===u.href))return;
 event.respondWith(caches.open(CACHE).then(c=>c.match(req)).then(cached=>cached||fetch(req).then(res=>{
  if(res.ok){const copy=res.clone();event.waitUntil(caches.open(CACHE).then(c=>c.put(req,copy)))}
  return res;
 })));
});
