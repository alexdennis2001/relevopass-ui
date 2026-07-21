import { apiClient } from "./apiClient";

export function isPushSupported(): boolean {
  return "serviceWorker" in navigator && "PushManager" in window;
}

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  return Uint8Array.from([...rawData].map((char) => char.charCodeAt(0)));
}

async function getServiceWorkerRegistration(): Promise<ServiceWorkerRegistration> {
  return navigator.serviceWorker.register("/sw.js");
}

export async function getExistingPushSubscription(): Promise<PushSubscription | null> {
  if (!isPushSupported()) return null;
  const registration = await navigator.serviceWorker.getRegistration();
  if (!registration) return null;
  return registration.pushManager.getSubscription();
}

/**
 * Must be called from a user-gesture handler (e.g. a button click) — browsers
 * only show the permission prompt in direct response to user interaction.
 */
export async function subscribeToPush(): Promise<void> {
  const permission = await Notification.requestPermission();
  if (permission !== "granted") {
    throw new Error("Permiso de notificaciones no concedido");
  }

  const registration = await getServiceWorkerRegistration();
  const { data } = await apiClient.get<{ publicKey: string }>(
    "/push/vapid-public-key"
  );

  const subscription = await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(data.publicKey) as BufferSource,
  });

  const json = subscription.toJSON();
  await apiClient.post("/push/subscribe", {
    endpoint: json.endpoint,
    keys: { p256dh: json.keys?.p256dh, auth: json.keys?.auth },
  });
}

export async function unsubscribeFromPush(): Promise<void> {
  const subscription = await getExistingPushSubscription();
  if (!subscription) return;

  const endpoint = subscription.endpoint;
  await subscription.unsubscribe();
  await apiClient.post("/push/unsubscribe", { endpoint });
}
