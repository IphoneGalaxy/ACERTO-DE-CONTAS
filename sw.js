// Detecta automaticamente o repositório no GitHub Pages (/meu-acerto-app ou /ACERTO-DE-CONTAS)
function repoBasePath() {
  const p = self.location.pathname || '';
  const m = p.match(/^(\/[^/]+)\//);
  return m ? m[1] : '';
}

const BASE = repoBasePath();
const CACHE = `meu-acerto-v7${BASE.replace(/\//g, '-')}`;

const APP_SHELL = [
  `${BASE}/`,
  `${BASE}/index.html`,
  `${BASE}/manifest.json`,
  `${BASE}/sw.js`,
  `${BASE}/assets/icon-192.png`,
  `${BASE}/assets/icon-512.png`,
  `${BASE}/assets/apple-touch-icon.png`,
  `${BASE}/assets/favicon-32.png`
];

const CDN_ASSETS = [
  'https://cdn.tailwindcss.com',
  'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap',
  'https://unpkg.com/react@18/umd/react.production.min.js',
  'https://unpkg.com/react-dom@18/umd/react-dom.production.min.js',
  'https://unpkg.com/@babel/standalone/babel.min.js',
  'https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js'
];

self.addEventListener('install', (e) => {
  e.waitUntil((async () => {
    const c = await caches.open(CACHE);
    try {
      await c.addAll(APP_SHELL);
    } catch (_) { /* ignora falha parcial no install */ }
    await Promise.all(CDN_ASSETS.map(async (url) => {
      try {
        const res = await fetch(url);
        if (res.ok) await c.put(url, res);
      } catch (_) { /* ignore */ }
    }));
  })());
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.map((k) => (k !== CACHE ? caches.delete(k) : null)));
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);

  // Navegação: rede primeiro, fallback para index em cache
  if (req.mode === 'navigate') {
    e.respondWith(
      fetch(req)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(`${BASE}/index.html`, copy)).catch(() => {});
          return res;
        })
        .catch(() => caches.match(`${BASE}/index.html`))
    );
    return;
  }

  // CDNs e outros domínios: sempre rede (evita cache corrompido de no-cors)
  if (url.origin !== self.location.origin) {
    e.respondWith(fetch(req));
    return;
  }

  // Arquivos do próprio site: cache-first com atualização
  e.respondWith(
    caches.match(req).then((hit) => {
      const fromNet = fetch(req)
        .then((res) => {
          const clone = res.clone();
          caches.open(CACHE).then((c) => c.put(req, clone)).catch(() => {});
          return res;
        })
        .catch(() => hit);
      return hit || fromNet;
    })
  );
});
