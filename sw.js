/* APA POS Service Worker — ทำให้ติดตั้งเป็นโปรแกรม + เปิดออฟไลน์ได้ */
const CACHE = 'apa-pos-v1';

self.addEventListener('install', e => { self.skipWaiting(); });
self.addEventListener('activate', e => { e.waitUntil(clients.claim()); });

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  let url;
  try { url = new URL(req.url); } catch (_) { return; }

  // ไม่ยุ่งกับ Supabase / CDN — ให้ผ่านตรงไปเสมอ เพื่อให้ข้อมูลสดจากคลาวด์
  if (url.hostname.includes('supabase') ||
      url.hostname.includes('jsdelivr') ||
      url.hostname.includes('cloudflare')) {
    return;
  }

  // network-first: พยายามโหลดจากเน็ตก่อน แล้ว cache ไว้ ถ้าเน็ตหลุดค่อยใช้ cache
  e.respondWith(
    fetch(req).then(res => {
      const copy = res.clone();
      caches.open(CACHE).then(c => c.put(req, copy)).catch(() => {});
      return res;
    }).catch(() => caches.match(req))
  );
});
