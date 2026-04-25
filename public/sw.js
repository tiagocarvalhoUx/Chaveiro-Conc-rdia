// Service Worker — Chaveiro Concórdia PWA
// Estratégia: network-first para HTML/API; cache-first para assets imutáveis.

const CACHE_VERSION = "chaveiro-v2";
const APP_SHELL = ["/", "/index.html", "/manifest.json", "/icon-192.png", "/icon-512.png"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_VERSION).then((cache) => cache.addAll(APP_SHELL).catch(() => undefined))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((k) => k !== CACHE_VERSION)
          .map((k) => caches.delete(k))
      )
    )
  );
  self.clients.claim();
});

// Cache.put() rejeita schemes != http(s) (ex.: chrome-extension://)
function isCacheableRequest(req, url) {
  return (
    req.method === "GET" &&
    (url.protocol === "http:" || url.protocol === "https:")
  );
}

function safePut(req, res) {
  return caches
    .open(CACHE_VERSION)
    .then((c) => c.put(req, res))
    .catch(() => undefined);
}

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;

  let url;
  try {
    url = new URL(req.url);
  } catch {
    return;
  }

  // Ignora schemes nao-cacheaveis (chrome-extension, etc.)
  if (!isCacheableRequest(req, url)) return;

  // Nunca cacheia chamadas para Supabase (API/realtime/auth)
  if (url.hostname.endsWith(".supabase.co")) return;

  // HTML / navegação → network-first com fallback offline para a home
  if (req.mode === "navigate") {
    event.respondWith(
      fetch(req)
        .then((res) => {
          if (res.ok) safePut(req, res.clone());
          return res;
        })
        .catch(() => caches.match(req).then((m) => m || caches.match("/")))
    );
    return;
  }

  // Assets estáticos → cache-first
  if (
    url.pathname.startsWith("/_expo/") ||
    url.pathname.startsWith("/assets/") ||
    /\.(?:js|css|woff2?|ttf|otf|png|jpg|jpeg|svg|webp|ico|wasm)$/.test(url.pathname)
  ) {
    event.respondWith(
      caches.match(req).then((cached) => {
        if (cached) return cached;
        return fetch(req).then((res) => {
          if (res.ok) safePut(req, res.clone());
          return res;
        });
      })
    );
  }
});
