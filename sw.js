/* Service worker do HubAcad — cache básico para funcionar offline. */
const CACHE_NAME = "hubacad-v2";

self.addEventListener("install", (event) => {
  self.skipWaiting();
  event.waitUntil(caches.open(CACHE_NAME));
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  // Navegação (index.html): sempre busca a rede ignorando o HTTP cache do
  // navegador. Sem isso, o navegador pode reaproveitar um index.html antigo
  // (que aponta pro bundle JS antigo) mesmo depois de um deploy novo.
  const isNavigation = event.request.mode === "navigate";
  const request = isNavigation
    ? new Request(event.request.url, { cache: "no-store" })
    : event.request;

  event.respondWith(
    fetch(request)
      .then((response) => {
        const clone = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        return response;
      })
      .catch(() => caches.match(event.request)),
  );
});
