import { precacheAndRoute } from 'workbox-precaching';

precacheAndRoute(self.__WB_MANIFEST);

self.addEventListener('push', event => {
  const data = event.data.json();
  const { title, body, icon } = data.notification;

  event.waitUntil(
    self.registration.showNotification(title, {
      body,
      icon,
    })
  );
});
