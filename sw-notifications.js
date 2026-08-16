const PK_CACHE = 'petkarnem-notification-test-v1';

self.addEventListener('install', event => {
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('message', event => {
  const data = event.data || {};
  if (data.type === 'PK_SHOW_TEST_NOTIFICATION') {
    event.waitUntil(
      self.registration.showNotification('PetKarnem Test Bildirimi 🐾', {
        body: 'Bildirim sistemi çalışıyor. Bu yalnızca test bildirimi.',
        icon: 'icon-192.png',
        badge: 'icon-192.png',
        tag: 'petkarnem-test',
        renotify: true,
        data: { url: './' }
      })
    );
  }

  if (data.type === 'PK_SHOW_CALENDAR_REMINDER') {
    event.waitUntil(
      self.registration.showNotification(data.title || 'PetKarnem Hatırlatma 🐾', {
        body: data.body || 'Takviminde yaklaşan bir kayıt var.',
        icon: 'icon-192.png',
        badge: 'icon-192.png',
        tag: data.tag || 'petkarnem-calendar-reminder',
        renotify: true,
        data: { url: data.url || './' }
      })
    );
  }
});

self.addEventListener('notificationclick', event => {
  event.notification.close();
  const url = event.notification.data?.url || './';
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(list => {
      for (const client of list) {
        if ('focus' in client) return client.focus();
      }
      if (clients.openWindow) return clients.openWindow(url);
    })
  );
});
