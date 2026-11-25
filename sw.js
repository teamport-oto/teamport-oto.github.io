// TeamPort 入口ページを端末に保存し、電波が無くても開けるようにする
var CACHE='tp-shell-v1';
var FILES=['./','./index.html','./favicon.ico','./favicon.svg','./apple-touch-icon.png','./icon-192.png','./icon-512.png'];
self.addEventListener('install',function(e){
  e.waitUntil(caches.open(CACHE).then(function(c){return c.addAll(FILES)}).then(function(){return self.skipWaiting()}));
});
self.addEventListener('activate',function(e){
  e.waitUntil(caches.keys().then(function(ks){
    return Promise.all(ks.filter(function(k){return k!==CACHE}).map(function(k){return caches.delete(k)}));
  }).then(function(){return self.clients.claim()}));
});
// 保存済みならすぐ返し、裏で最新を取って保存し直す（次に開いたとき反映）
self.addEventListener('fetch',function(e){
  var req=e.request;
  if(req.method!=='GET'||new URL(req.url).origin!==location.origin)return;
  e.respondWith(caches.open(CACHE).then(function(c){
    return c.match(req,{ignoreSearch:true}).then(function(hit){
      var net=fetch(req).then(function(res){if(res.ok)c.put(req,res.clone());return res});
      if(hit){e.waitUntil(net.catch(function(){}));return hit}
      return net.catch(function(){return c.match('./index.html')});
    });
  }));
});
