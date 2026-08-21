const PK_SW_VERSION = '2.118';

self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(self.clients.claim());
});

function pkIconUrl() {
  try {
    return new URL('./icon-192.png', self.registration.scope).href;
  } catch {
    return './icon-192.png';
  }
}

async function pkShowNotification(data = {}) {
  const title = data.title || 'PetKarnem Hatırlatma 🐾';
  const body = data.body || 'Takviminde yaklaşan bir kayıt var.';
  const url = data.url || './';

  // iPhone PWA için seçenekleri bilinçli olarak sade tutuyoruz.
  // Aynı tag ile bildirimin sessizce değiştirilmesini önlemek için
  // her push'a benzersiz bir tag veriyoruz.
  const options = {
    body,
    icon: pkIconUrl(),
    tag: data.tag || `petkarnem-push-${Date.now()}`,
    data: { url }
  };

  await self.registration.showNotification(title, options);
}

self.addEventListener('message', event => {
  const data = event.data || {};

  if (data.type === 'PK_SHOW_TEST_NOTIFICATION') {
    event.waitUntil(
      pkShowNotification({
        title: 'PetKarnem Test Bildirimi 🐾',
        body: 'Bildirim sistemi çalışıyor. Bu yalnızca test bildirimi.',
        tag: `petkarnem-local-test-${Date.now()}`,
        url: './'
      })
    );
  }

  if (data.type === 'PK_SHOW_CALENDAR_REMINDER') {
    event.waitUntil(pkShowNotification(data));
  }
});

self.addEventListener('push', event => {
  event.waitUntil((async () => {
    let data = {};

    try {
      const raw = event.data ? event.data.text() : '';
      data = raw ? JSON.parse(raw) : {};
    } catch (err) {
      try {
        data = { body: event.data ? event.data.text() : '' };
      } catch {
        data = {};
      }
    }

    await pkShowNotification(data);
  })());
});

self.addEventListener('notificationclick', event => {
  event.notification.close();
  const url = event.notification.data?.url || './';

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(list => {
      for (const client of list) {
        if ('focus' in client) {
          client.navigate?.(url).catch?.(() => {});
          return client.focus();
        }
      }
      if (self.clients.openWindow) return self.clients.openWindow(url);
    })
  );
});
