// ============================================
// SERVICE WORKER - PWA
// Cache e funcionalidade offline
// ============================================

const CACHE_NAME = 'gerador-declaracoes-v1.0.0';
const urlsToCache = [
    '/',
    '/index.html',
    '/manifest.json',
    '/assets/css/styles.css',
    '/js/main.js',
    '/js/data-handler.js',
    '/js/storage-handler.js',
    '/js/model-builder.js',
    '/js/pdf-generator.js',
    '/data/empresas.json',
    '/data/trabalhadores.json',
    '/data/modelos.json',
    '/models/modelo-master.html',
    '/models/types/type1.json',
    '/models/types/type2.json',
    '/models/types/type3.json',
    '/assets/logos/empresa1.png',
    '/assets/logos/empresa2.png',
    '/assets/logos/empresa3.png',
    '/assets/carimbos/carimbo1.png',
    '/assets/carimbos/carimbo2.png',
    '/assets/carimbos/carimbo3.png'
];

// Instalação - cachear recursos
self.addEventListener('install', (event) => {
    console.log('[SW] Instalando Service Worker...');
    
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('[SW] Cache aberto');
                return cache.addAll(urlsToCache);
            })
            .then(() => {
                console.log('[SW] ✅ Recursos cacheados');
                return self.skipWaiting();
            })
            .catch((error) => {
                console.error('[SW] ❌ Erro ao cachear:', error);
            })
    );
});

// Ativação - limpar caches antigos
self.addEventListener('activate', (event) => {
    console.log('[SW] Ativando Service Worker...');
    
    event.waitUntil(
        caches.keys()
            .then((cacheNames) => {
                return Promise.all(
                    cacheNames.map((cacheName) => {
                        if (cacheName !== CACHE_NAME) {
                            console.log('[SW] 🗑️ Removendo cache antigo:', cacheName);
                            return caches.delete(cacheName);
                        }
                    })
                );
            })
            .then(() => {
                console.log('[SW] ✅ Service Worker ativado');
                return self.clients.claim();
            })
    );
});

// Fetch - estratégia Cache First com Network Fallback
self.addEventListener('fetch', (event) => {
    // Ignorar requisições não GET
    if (event.request.method !== 'GET') return;

    // Ignorar CDNs externas
    if (event.request.url.includes('cdn.')) {
        return;
    }

    event.respondWith(
        caches.match(event.request)
            .then((cachedResponse) => {
                // Se encontrou no cache, retorna
                if (cachedResponse) {
                    console.log('[SW] 📦 Servindo do cache:', event.request.url);
                    return cachedResponse;
                }

                // Senão, busca na rede
                return fetch(event.request)
                    .then((response) => {
                        // Verificar se a resposta é válida
                        if (!response || response.status !== 200 || response.type !== 'basic') {
                            return response;
                        }

                        // Clonar a resposta
                        const responseToCache = response.clone();

                        // Adicionar ao cache
                        caches.open(CACHE_NAME)
                            .then((cache) => {
                                cache.put(event.request, responseToCache);
                            });

                        return response;
                    })
                    .catch((error) => {
                        console.error('[SW] ❌ Erro no fetch:', error);
                        
                        // Retornar página offline se disponível
                        return caches.match('/index.html');
                    });
            })
    );
});

// Mensagens do app
self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }

    if (event.data && event.data.type === 'CLEAR_CACHE') {
        caches.delete(CACHE_NAME)
            .then(() => {
                console.log('[SW] 🗑️ Cache limpo');
            });
    }
});

console.log('[SW] 🚀 Service Worker carregado');
