// VeckoFynd service worker -- push notifications only. No offline caching
// (the app is a single live-data page; caching it would risk serving a
// stale week's deals), so this file's whole job is: receive a push, show
// it, and open the app when tapped.
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (event) => event.waitUntil(self.clients.claim()));

self.addEventListener('push', (event) => {
  const ICON = 'data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%20viewBox%3D%220%200%20108%20108%22%3E%3Crect%20width%3D%22108%22%20height%3D%22108%22%20rx%3D%2224%22%20fill%3D%22%23E0552E%22/%3E%3Cg%20transform%3D%22rotate%2845%2054%2060%29%22%3E%3Cpath%20d%3D%22M30%2036%20L78%2036%20Q90%2036%2090%2048%20L90%2072%20Q90%2084%2078%2084%20L42%2084%20Q30%2084%2030%2072%20Z%22%20fill%3D%22%23FBF6EE%22/%3E%3Ccircle%20cx%3D%2245%22%20cy%3D%2251%22%20r%3D%227%22%20fill%3D%22%23E0552E%22/%3E%3C/g%3E%3Cpath%20d%3D%22M54%2020%20C54%2012%2049%206%2041%205%20C41%2013%2046%2019%2054%2020%20Z%22%20fill%3D%22%23FBF6EE%22/%3E%3Cpath%20d%3D%22M54%2020%20C54%2013%2058%208%2065%207%20C65%2014%2061%2019%2054%2020%20Z%22%20fill%3D%22%23FBF6EE%22%20opacity%3D%220.72%22/%3E%3Crect%20x%3D%2252.4%22%20y%3D%2219%22%20width%3D%223.2%22%20height%3D%2212%22%20rx%3D%221.6%22%20fill%3D%22%23FBF6EE%22/%3E%3C/svg%3E';
  let data = { title: 'VeckoFynd', body: '', url: '/' };
  try { data = { ...data, ...event.data.json() }; } catch (e) { /* tyst */ }
  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: ICON,
      badge: ICON,
      data: { url: data.url },
    })
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = event.notification.data?.url || '/';
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clients) => {
      for (const client of clients) {
        if (client.url === url && 'focus' in client) return client.focus();
      }
      return self.clients.openWindow(url);
    })
  );
});
