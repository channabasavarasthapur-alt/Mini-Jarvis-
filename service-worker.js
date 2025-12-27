const cacheName = "jarvis-v1";
const files = [
  "index.html",
  "style.css",
  "script.js",
  "manifest.json"
];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(cacheName).then(c => c.addAll(files)));
});

self.addEventListener("fetch", e => {
  e.respondWith(caches.match(e.request).then(r => r || fetch(e.request)));
});
