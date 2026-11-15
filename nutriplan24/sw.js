/* NutriPlan 24 — service worker แบบเรียบง่าย: โหลดจากเน็ตก่อน ถ้าออฟไลน์ค่อยใช้ของที่เคยโหลดไว้
   (ไม่แตะคำขอไป Supabase หรือโดเมนอื่น) — จำเป็นเพื่อให้ Android ติดตั้งเป็นแอปได้ */
const CACHE = 'nutriplan24-v1';
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', e => {
  e.waitUntil((async () => {
    for (const k of await caches.keys()) if (k !== CACHE) await caches.delete(k);
    await self.clients.claim();
  })());
});
self.addEventListener('fetch', e => {
  const r = e.request;
  if (r.method !== 'GET') return;
  const u = new URL(r.url);
  if (u.origin !== location.origin) return;
  e.respondWith((async () => {
    try {
      const res = await fetch(r);
      if (res && res.ok) { const c = await caches.open(CACHE); c.put(r, res.clone()); }
      return res;
    } catch (err) {
      const hit = await caches.match(r, { ignoreSearch: true });
      if (hit) return hit;
      if (r.mode === 'navigate') {
        const home = (await caches.match('./index.html')) || (await caches.match('./'));
        if (home) return home;
      }
      throw err;
    }
  })());
});
