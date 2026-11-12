/* SIMFAQ PWA Service Worker. Cache only same-origin app documents/assets. */
'use strict';
const CACHE_PREFIX = 'simfaq-pwa-';
const CACHE_VERSION = 'v5';
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
    dir: 'auto'
  };
  event.waitUntil(self.registration.showNotification(title, options));
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
    return self.clients.openWindow(target.href);
  })());
});
