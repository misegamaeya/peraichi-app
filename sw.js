// ペライチのアプリ（第45版）：画面のファイルをスマホに置いておく（開いた瞬間に出すため）。中身（件）はここには置かない
// 新しい版は裏で受け取り、次に開いたときから使う。Google（script.google.com）への頼みには触らない
const BUILD = '391f170326';
const C = 'peraichi-' + BUILD;
const FILES = ['./', 'index.html', 'tabs.html', 'config.js', 'manifest.json', 'icon-180.png', 'icon-512.png'];
self.addEventListener('install', e => { e.waitUntil(caches.open(C).then(c => c.addAll(FILES.map(f => new Request(f, { cache: 'reload' })))).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k.startsWith('peraichi-') && k !== C).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', e => {
  const u = new URL(e.request.url);
  if (e.request.method !== 'GET' || u.origin !== location.origin) return;
  // 10/13：入口の画面と行き先（config.js）は、つながっていれば新しい物を先に使う（古い版の入口が動いて、古い確認の画面が出たため）。つながらなければ置いてある物
  const fresh = e.request.mode === 'navigate' || /\/(index\.html|config\.js)?$/.test(u.pathname);
  if (fresh) { e.respondWith(fetch(e.request, { cache: 'no-store' }).then(r => { if (r.ok) { const cp = r.clone(); caches.open(C).then(c => c.put(e.request, cp)); } return r; }).catch(() => caches.open(C).then(c => c.match(e.request, { ignoreSearch: true })))); return; }
  e.respondWith(caches.open(C).then(c => c.match(e.request, { ignoreSearch: true }).then(hit => hit || fetch(e.request))));
});
