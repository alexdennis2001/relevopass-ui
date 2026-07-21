self.addEventListener("push", (event) => {
  if (!event.data) return;

  const payload = event.data.json();
  const { title, body, url } = payload;

  event.waitUntil(
    self.registration.showNotification(title, {
      body,
      icon: "/web-app-manifest-192x192.png",
      data: { url: url ?? "/" },
    })
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = event.notification.data?.url ?? "/";

  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clients) => {
      for (const client of clients) {
        if ("focus" in client) {
          client.navigate(url);
          return client.focus();
        }
      }
      if (self.clients.openWindow) {
        return self.clients.openWindow(url);
      }
    })
  );
});
