self.addEventListener('install',()=>self.skipWaiting());
self.addEventListener('activate',event=>{
  event.waitUntil(caches.keys().then(keys=>Promise.all(keys.map(k=>caches.delete(k)))));
});


/* v2.77 — real Web Push */
self.addEventListener('push', event => {
  let data = {};
  try { data = event.data ? event.data.json() : {}; } catch(e) {
    data = { body: event.data ? event.data.text() : '' };
  }

  const title = data.title || 'PetKarnem 🐾';
  const options = {
    body: data.body || 'PetKarnem bildirimin hazır.',
    icon: './icon-192.png',
    badge: './icon-192.png',
    tag: data.tag || 'petkarnem-push',
    data: { url: data.url || './' }
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', event => {
  event.notification.close();
  const target = event.notification.data?.url || './';
  event.waitUntil(
    clients.matchAll({type:'window', includeUncontrolled:true}).then(list => {
      for (const client of list) {
        if ('focus' in client) {
          client.navigate(target).catch(()=>{});
          return client.focus();
        }
      }
      if (clients.openWindow) return clients.openWindow(target);
    })
  );
});
