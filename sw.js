/* SIMFAQ PWA Service Worker. Cache only same-origin app documents/assets. */
'use strict';
const CACHE_PREFIX = 'simfaq-pwa-';
const CACHE_VERSION = 'v6';
const CACHE_NAME = CACHE_PREFIX + CACHE_VERSION;
const APP_BASE = new URL('./', self.registration.scope);
const OFFLINE_URL = new URL('offline.html', APP_BASE).href;


self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') self.skipWaiting();
});

self.addEventListener('install', event => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_NAME);
    await cache.add(new Request(OFFLINE_URL, {cache: 'reload'}));
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(key => key.startsWith(CACHE_PREFIX) && key !== CACHE_NAME).map(key => caches.delete(key)));
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', event => {
  const request = event.request;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  // Never intercept Supabase, third-party CDNs, or paths outside this app.
  if (url.origin !== self.location.origin || !url.pathname.startsWith(new URL(APP_BASE).pathname)) return;
  // Do not cache API-like requests or authenticated/dynamic app data.
  if (url.pathname.includes('/rest/v1/') || url.pathname.includes('/auth/v1/') || url.pathname.includes('/storage/v1/') || url.pathname.includes('/functions/v1/') || url.pathname.includes('/realtime/')) return;

  if (request.mode === 'navigate') {
    event.respondWith((async () => {
      try {
        const response = await fetch(new Request(request, {cache: 'no-cache'}));
        if (response && response.ok) {
          const cache = await caches.open(CACHE_NAME);
          await cache.put(new Request(new URL('./', APP_BASE).href), response.clone());
        }
        return response;
      } catch (_) {
        const cache = await caches.open(CACHE_NAME);
        const appPage = await cache.match(new URL('./', APP_BASE).href);
        if (appPage) return appPage;
        const offline = await cache.match(OFFLINE_URL);
        return offline || new Response('SIMFAQ sedang offline. Hubungkan perangkat ke internet lalu muat ulang.', {status: 503, headers: {'Content-Type':'text/plain; charset=utf-8'}});
      }
    })());
    return;
  }

  // Cache only the bundled PWA icon files. Other same-origin assets stay network-only.
  if (url.pathname.includes('/icons/')) {
    event.respondWith((async () => {
      const cache = await caches.open(CACHE_NAME);
      const cached = await cache.match(request);
      if (cached) return cached;
      const response = await fetch(request);
      if (response && response.ok) await cache.put(request, response.clone());
      return response;
    })());
  }
});

self.addEventListener('push', event => {
  let payload = {};
  try { payload = event.data ? event.data.json() : {}; }
  catch (_) { payload = {body: event.data ? event.data.text() : ''}; }
  const title = payload.title || 'SIMFAQ - BK FUSPAQ NU';
  const options = {
    body: payload.body || payload.message || 'Ada informasi terbaru dari SIMFAQ.',
    icon: new URL('icons/icon-192.png', APP_BASE).href,
    badge: new URL('icons/icon-192.png', APP_BASE).href,
    data: {url: payload.url || './', route: payload.route || 'notifications', eventType: payload.eventType || '', notificationId: payload.notificationId || '', relatedTable: payload.relatedTable || '', relatedId: payload.relatedId || '', activityId: payload.activityId || ''},
    lang: 'id-ID',
    dir: 'auto',
    // Reuse one notification slot for retries of the same push event.
    tag: String(payload.tag || payload.notificationId || ''),
    renotify: false
  };
  // Keep the signed display-ack data with the notification so the SW can
  // report successful showNotification() completion even when no page is open.
  options.data.ack = payload.ack && typeof payload.ack === 'object' ? {
    url: String(payload.ack.url || ''),
    subscriptionId: String(payload.ack.subscriptionId || ''),
    token: String(payload.ack.token || '')
  } : null;

  event.waitUntil((async () => {
    await self.registration.showNotification(title, options);

    // This confirms that the browser accepted showNotification(), not that
    // Android necessarily rendered a heads-up banner on screen.
    const ack = options.data.ack;
    if (!ack || !ack.url || !ack.subscriptionId || !ack.token) return;
    try {
      const ackUrl = new URL(ack.url);
      if (ackUrl.origin !== 'https://yhxetkdsuogbehxnarhk.supabase.co' ||
          ackUrl.pathname !== '/functions/v1/bkf-push') return;
      const response = await fetch(ackUrl.href, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'ack_display',
          notificationId: options.data.notificationId,
          subscriptionId: ack.subscriptionId,
          token: ack.token
        }),
        cache: 'no-store',
        credentials: 'omit',
        keepalive: true
      });
      if (!response.ok) {
        console.warn('[SIMFAQ PUSH ACK] Server menolak konfirmasi:', response.status);
      }
    } catch (error) {
      console.warn('[SIMFAQ PUSH ACK] Konfirmasi tampilan gagal dikirim:', error);
    }
  })());
});

self.addEventListener('notificationclick', event => {
  event.notification.close();
  const data = event.notification.data || {};
  const target = new URL(data.url || './', APP_BASE);
  if (target.origin !== self.location.origin || !target.pathname.startsWith(new URL(APP_BASE).pathname)) return;
  event.waitUntil((async () => {
    const windows = await self.clients.matchAll({type:'window', includeUncontrolled:true});
    for (const client of windows) {
      if (new URL(client.url).origin === target.origin && new URL(client.url).pathname.startsWith(new URL(APP_BASE).pathname)) {
        await client.focus();
        client.postMessage({
          type: 'BKF_PUSH_OPEN', route: data.route || 'notifications',
          eventType: data.eventType || '', notificationId: data.notificationId || '',
          relatedTable: data.relatedTable || '', relatedId: data.relatedId || '', activityId: data.activityId || ''
        });
        return;
      }
    }
    // Preserve notification context when the PWA has no open window. The page
    // consumes these parameters after authentication/bootstrap and routes exam
    // score notifications directly to the unified Hasil Ujian form.
    const params = {
      bkf_push_route: data.route || 'notifications',
      bkf_push_notification_id: data.notificationId || '',
      bkf_push_related_table: data.relatedTable || '',
      bkf_push_related_id: data.relatedId || '',
      bkf_push_activity_id: data.activityId || '',
      bkf_push_event_type: data.eventType || ''
    };
    for (const [key, value] of Object.entries(params)) {
      if (value) target.searchParams.set(key, String(value));
    }
    return self.clients.openWindow(target.href);
  })());
});
