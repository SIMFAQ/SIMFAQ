/* SIMFAQ PWA Service Worker - V9 pagination and push diagnostics UI cleanup. */
'use strict';
const CACHE_PREFIX = 'simfaq-pwa-';
const CACHE_VERSION = 'v9';
const CACHE_NAME = CACHE_PREFIX + CACHE_VERSION;
const APP_BASE = new URL('./', self.registration.scope);
const APP_PATH = new URL(APP_BASE).pathname;
const OFFLINE_URL = new URL('offline.html', APP_BASE).href;
const ALLOWED_ROUTES = new Set(['home','activities','exams','pengujian','pengujian-pra','pengujian-tashih','graduation','payments','finance','secretariat','distribution','reports','notifications','management','institutions','album','organization','auditbackup','settings','governance']);

function safeRoute(value) {
  const route = String(value || '').trim().toLowerCase();
  return ALLOWED_ROUTES.has(route) ? route : 'notifications';
}
function safeTarget(raw, data) {
  let target;
  try { target = new URL(raw || './', APP_BASE); } catch (_) { target = new URL('./', APP_BASE); }
  if (target.origin !== self.location.origin || !target.pathname.startsWith(APP_PATH)) target = new URL('./', APP_BASE);
  const route = safeRoute(data && data.route || target.searchParams.get('bkf_push_route'));
  target.searchParams.set('bkf_push_route', route);
  const fields = [
    ['bkf_push_notification_id', data && data.notificationId],
    ['bkf_push_related_table', data && data.relatedTable],
    ['bkf_push_related_id', data && data.relatedId],
    ['bkf_push_activity_id', data && data.activityId],
    ['bkf_push_event_type', data && data.eventType]
  ];
  for (const [key, value] of fields) if (value) target.searchParams.set(key, String(value));
  return target;
}

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
  if (url.origin !== self.location.origin || !url.pathname.startsWith(APP_PATH)) return;
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

// V549: local-only diagnostics. No push endpoint, message body, or personal data is stored.
const PUSH_DIAG_DB = 'bkf-push-diagnostics-v549';
function writePushDiagnostic(type, detail) {
  return new Promise(resolve => {
    try {
      const request = indexedDB.open(PUSH_DIAG_DB, 1);
      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains('events')) db.createObjectStore('events', {keyPath: 'id', autoIncrement: true});
      };
      request.onsuccess = () => {
        const db = request.result;
        try {
          const tx = db.transaction('events', 'readwrite');
          tx.objectStore('events').add({time: new Date().toISOString(), type, detail: String(detail || '').slice(0, 240)});
          tx.oncomplete = () => { db.close(); resolve(true); };
          tx.onerror = () => { db.close(); resolve(false); };
        } catch (_) { try { db.close(); } catch (_) {} resolve(false); }
      };
      request.onerror = () => resolve(false);
    } catch (_) { resolve(false); }
  });
}

self.addEventListener('push', event => {
  event.waitUntil((async () => {
    await writePushDiagnostic('push_received', 'Peristiwa push diterima Service Worker');
    let payload = {};
    try { payload = event.data ? event.data.json() : {}; }
    catch (_) { payload = {body: event.data ? event.data.text() : ''}; }
    let rawRoute = payload.route || payload.data && payload.data.route;
    if (!rawRoute && payload.url) { try { rawRoute = new URL(payload.url, APP_BASE).searchParams.get('bkf_push_route'); } catch (_) {} }
    const route = safeRoute(rawRoute);
    const data = {
      route,
      notificationId: payload.notificationId || payload.notification_id || payload.data && payload.data.notificationId || '',
      relatedTable: payload.relatedTable || payload.related_table || payload.data && payload.data.relatedTable || '',
      relatedId: payload.relatedId || payload.related_id || payload.data && payload.data.relatedId || '',
      activityId: payload.activityId || payload.activity_id || payload.data && payload.data.activityId || '',
      eventType: payload.eventType || payload.event_type || payload.data && payload.data.eventType || ''
    };
    const target = safeTarget(payload.url, data);
    const title = payload.title || 'SIMFAQ - BK FUSPAQ NU';
    const options = {
      body: payload.body || payload.message || 'Ada informasi terbaru dari SIMFAQ.',
      icon: new URL('icons/icon-192.png', APP_BASE).href,
      badge: new URL('icons/icon-192.png', APP_BASE).href,
      tag: payload.tag || data.notificationId || 'bkf-notification',
      data: Object.assign({url: target.href}, data),
      lang: 'id-ID',
      dir: 'auto'
    };
    try {
      await self.registration.showNotification(title, options);
      await writePushDiagnostic('show_notification_success', 'showNotification berhasil diselesaikan');
    } catch (error) {
      await writePushDiagnostic('show_notification_error', error && (error.name + ': ' + error.message) || 'Kesalahan tidak diketahui');
      throw error;
    }
  })());
});

// Ask an open SIMFAQ page to re-sync after the browser reports a subscription change.
self.addEventListener('pushsubscriptionchange', event => {
  event.waitUntil((async () => {
    await writePushDiagnostic('subscription_changed', 'Browser melaporkan perubahan subscription');
    const windows = await self.clients.matchAll({type: 'window', includeUncontrolled: true});
    for (const client of windows) {
      try { client.postMessage({type: 'BKF_PUSH_SUBSCRIPTION_CHANGED'}); } catch (_) {}
    }
    await writePushDiagnostic('subscription_sync_requested', windows.length ? 'Permintaan sinkronisasi dikirim ke halaman SIMFAQ' : 'Tidak ada halaman SIMFAQ yang sedang terbuka');
  })());
});

self.addEventListener('notificationclick', event => {
  event.notification.close();
  const data = event.notification.data || {};
  const target = safeTarget(data.url, data);
  const message = Object.assign({type: 'BKF_PUSH_OPEN'}, data, {route: safeRoute(data.route)});
  event.waitUntil((async () => {
    const windows = await self.clients.matchAll({type: 'window', includeUncontrolled: true});
    for (const client of windows) {
      const clientUrl = new URL(client.url);
      if (clientUrl.origin === target.origin && clientUrl.pathname.startsWith(APP_PATH)) {
        try { await client.focus(); } catch (_) {}
        try { client.postMessage(message); return; } catch (_) {}
        if ('navigate' in client) return client.navigate(target.href);
        return;
      }
    }
    return self.clients.openWindow(target.href);
  })());
});
