const V='logbook-v2';
const SHELL=['./','./index.html','./manifest.json','./icon-192.png','./icon-512.png'];
const LIBS=['https://cdn.jsdelivr.net/npm/react@18.3.1/umd/react.production.min.js','https://cdn.jsdelivr.net/npm/react-dom@18.3.1/umd/react-dom.production.min.js','https://cdn.jsdelivr.net/npm/htm@3.1.1/dist/htm.umd.js'];
/* cada arquivo é guardado separadamente: se um faltar, os outros continuam funcionando */
self.addEventListener('install',e=>{e.waitUntil(caches.open(V).then(c=>Promise.all([...SHELL,...LIBS].map(u=>c.add(u).catch(()=>{})))).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==V).map(x=>caches.delete(x)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{
  const r=e.request;if(r.method!=='GET')return;
  const u=new URL(r.url);
  if(u.origin===location.origin){
    /* app: abre na hora com a cópia guardada e atualiza em segundo plano (a versão nova aparece na próxima abertura) */
    e.respondWith((async()=>{
      const c=await caches.open(V),m=await c.match(r,{ignoreSearch:true});
      const net=fetch(r).then(res=>{if(res&&res.ok)c.put(r,res.clone());return res}).catch(()=>null);
      if(m){e.waitUntil(net);return m}
      const res=await net;
      return res||(await c.match('./index.html'))||Response.error();
    })());
  }else if(u.hostname==='cdn.jsdelivr.net'){
    /* bibliotecas: cache primeiro */
    e.respondWith(caches.match(r).then(m=>m||fetch(r).then(res=>{const cp=res.clone();caches.open(V).then(c=>c.put(r,cp));return res})));
  }
});
