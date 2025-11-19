// ============================================
// SERVICE WORKER - PWA PROFISSIONAL
// Cache strategies, offline support, background sync
// Version: 2.0.0
// ============================================

const VERSION = '2.0.0';
const CACHE_NAME = `gerador-pdf-v${VERSION}`;
const CACHE_STATIC = `static-v${VERSION}`;
const CACHE_DYNAMIC = `dynamic-v${VERSION}`;
const CACHE_IMAGES = `images-v${VERSION}`;

// Recursos críticos (cache primeiro)
const STATIC_ASSETS = [
    '/',
    '/index.html',
    '/admin.html',
    '/manifest.json',
    '/assets/css/styles.css',
    '/assets/icons/icon-192x192.png',
    '/assets/icons/icon-512x512.png'
];

// Recursos dinâmicos (network primeiro, fallback para cache)
const DYNAMIC_ASSETS = [
    '/data/empresas.json',
    '/data/trabalhadores.json',
    '/data/modelos.json',
    '/data/personalizacoes.json'
];

// Tamanho máximo do cache dinâmico
const CACHE_SIZE_LIMIT = 50;

// ========== INSTALAÇÃO ==========
self.addEventListener('install', (event) => {
    console.log(`[SW v${VERSION}] 🔧 Instalando Service Worker...`);
    
    event.waitUntil(
        caches.open(CACHE_STATIC)
            .then((cache) => {
                console.log('[SW] 📦 Cacheando recursos estáticos...');
                return cache.addAll(STATIC_ASSETS);
            })
            .then(() => {
                console.log('[SW] ✅ Recursos estáticos cacheados com sucesso');
                return self.skipWaiting();
            })
            .catch((error) => {
                console.error('[SW] ❌ Erro ao cachear recursos:', error);
            })
    );
});

// ========== ATIVAÇÃO ==========
self.addEventListener('activate', (event) => {
    console.log(`[SW v${VERSION}] 🔄 Ativando Service Worker...`);
    
    event.waitUntil(
        caches.keys()
            .then((cacheNames) => {
                return Promise.all(
                    cacheNames
                        .filter(cacheName => {
                            // Deletar caches de versões antigas
                            return cacheName.startsWith('gerador-pdf-') && 
                                   cacheName !== CACHE_STATIC && 
                                   cacheName !== CACHE_DYNAMIC &&
                                   cacheName !== CACHE_IMAGES;
                        })
                        .map(cacheName => {
                            console.log('[SW] 🗑️ Removendo cache antigo:', cacheName);
                            return caches.delete(cacheName);
                        })
                );
            })
            .then(() => {
                console.log('[SW] ✅ Service Worker ativado e assumindo controle');
                return self.clients.claim();
            })
    );
});

// ========== FETCH - ESTRATÉGIAS DE CACHE ==========
self.addEventListener('fetch', (event) => {
    const { request } = event;
    const { url, method } = request;

    // Ignorar requisições não-GET
    if (method !== 'GET') return;

    // Ignorar CDNs externos e GitHub API
    if (url.includes('cdn.') || url.includes('api.github.com')) {
        return;
    }

    // Estratégia: Cache First para recursos estáticos
    if (STATIC_ASSETS.some(asset => url.includes(asset))) {
        event.respondWith(cacheFirst(request, CACHE_STATIC));
        return;
    }

    // Estratégia: Network First para dados dinâmicos (JSON)
    if (url.endsWith('.json') || url.includes('/data/')) {
        event.respondWith(networkFirst(request, CACHE_DYNAMIC));
        return;
    }

    // Estratégia: Cache First para imagens
    if (url.match(/\.(png|jpg|jpeg|svg|gif|webp)$/)) {
        event.respondWith(cacheFirst(request, CACHE_IMAGES));
        return;
    }

    // Estratégia: Stale While Revalidate para HTML
    if (url.endsWith('.html') || url.endsWith('/')) {
        event.respondWith(staleWhileRevalidate(request, CACHE_STATIC));
        return;
    }

    // Fallback: Network First
    event.respondWith(networkFirst(request, CACHE_DYNAMIC));
});

// ========== ESTRATÉGIAS DE CACHE ==========

// Cache First (ideal para assets estáticos)
async function cacheFirst(request, cacheName) {
    const cache = await caches.open(cacheName);
    const cached = await cache.match(request);
    
    if (cached) {
        console.log('[SW] 📦 Cache First:', request.url);
        return cached;
    }
    
    try {
        const response = await fetch(request);
        if (response.ok) {
            cache.put(request, response.clone());
        }
        return response;
    } catch (error) {
        console.error('[SW] ❌ Cache First falhou:', error);
        return new Response('Offline', { status: 503 });
    }
}

// Network First (ideal para dados dinâmicos)
async function networkFirst(request, cacheName) {
    const cache = await caches.open(cacheName);
    
    try {
        const response = await fetch(request);
        if (response.ok) {
            console.log('[SW] 🌐 Network First (atualizando cache):', request.url);
            cache.put(request, response.clone());
            limitCacheSize(cacheName, CACHE_SIZE_LIMIT);
        }
        return response;
    } catch (error) {
        console.log('[SW] 📦 Network falhou, usando cache:', request.url);
        const cached = await cache.match(request);
        return cached || new Response('Offline', { status: 503 });
    }
}

// Stale While Revalidate (retorna cache imediatamente, atualiza em background)
async function staleWhileRevalidate(request, cacheName) {
    const cache = await caches.open(cacheName);
    const cached = await cache.match(request);
    
    const fetchPromise = fetch(request).then(response => {
        if (response.ok) {
            cache.put(request, response.clone());
        }
        return response;
    });
    
    return cached || fetchPromise;
}

// Limitar tamanho do cache
async function limitCacheSize(cacheName, maxSize) {
    const cache = await caches.open(cacheName);
    const keys = await cache.keys();
    
    if (keys.length > maxSize) {
        console.log(`[SW] 🗑️ Limpando cache ${cacheName} (${keys.length}/${maxSize})`);
        await cache.delete(keys[0]);
        limitCacheSize(cacheName, maxSize);
    }
}

// ========== MENSAGENS DO APP ==========
self.addEventListener('message', (event) => {
    console.log('[SW] 📨 Mensagem recebida:', event.data);
    
    if (event.data && event.data.type === 'SKIP_WAITING') {
        console.log('[SW] ⏭️ Pulando espera e ativando...');
        self.skipWaiting();
    }

    if (event.data && event.data.type === 'CLEAR_CACHE') {
        console.log('[SW] 🗑️ Limpando todos os caches...');
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => caches.delete(cacheName))
            );
        }).then(() => {
            console.log('[SW] ✅ Todos os caches foram limpos');
            event.ports[0].postMessage({ success: true });
        });
    }

    if (event.data && event.data.type === 'GET_VERSION') {
        event.ports[0].postMessage({ version: VERSION });
    }
});

// ========== BACKGROUND SYNC (para quando voltar online) ==========
self.addEventListener('sync', (event) => {
    console.log('[SW] 🔄 Background Sync:', event.tag);
    
    if (event.tag === 'sync-data') {
        event.waitUntil(syncData());
    }
});

async function syncData() {
    console.log('[SW] 📤 Sincronizando dados...');
    // Implementar lógica de sincronização aqui
}

// ========== PUSH NOTIFICATIONS (futuro) ==========
self.addEventListener('push', (event) => {
    console.log('[SW] 📬 Push notification recebida');
    
    const options = {
        body: event.data ? event.data.text() : 'Nova notificação',
        icon: '/assets/icons/icon-192x192.png',
        badge: '/assets/icons/icon-72x72.png',
        vibrate: [200, 100, 200],
        data: {
            dateOfArrival: Date.now(),
            primaryKey: 1
        }
    };
    
    event.waitUntil(
        self.registration.showNotification('Gerador PDF', options)
    );
});

console.log(`[SW v${VERSION}] 🚀 Service Worker carregado e pronto!`);
