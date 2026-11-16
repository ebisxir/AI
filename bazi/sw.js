/* Service worker ของ BaZi Precision Navigator
   หน้าที่หลัก: ให้เบราว์เซอร์ (โดยเฉพาะ Android Chrome) ถือว่าเว็บนี้ติดตั้งเป็นแอปจริงได้
   กลยุทธ์: ไปเอาจากเครือข่ายก่อนเสมอ (อัปเดตไฟล์แล้วเห็นผลทันที) ถ้าออฟไลน์ค่อยใช้ของที่เก็บไว้
   ไม่แตะคำขอไปยังโดเมนอื่น (Supabase / CDN) */
const CACHE = 'bazi-shell-v1';
const SHELL = ['./', 'index.html', 'icon.png', 'manifest.json'];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE)
      .then(c => Promise.all(SHELL.map(u => c.add(u).catch(() => null))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const r = e.request;
  if (r.method !== 'GET') return;
  const u = new URL(r.url);
  if (u.origin !== self.location.origin) return;
  e.respondWith(
    fetch(r).then(res => {
      if (res && res.ok && res.type === 'basic') {
        const copy = res.clone();
        caches.open(CACHE).then(c => c.put(r, copy)).catch(() => {});
      }
      return res;
    }).catch(() =>
      caches.match(r, { ignoreSearch: true }).then(m => m || caches.match('index.html'))
    )
  );
});
