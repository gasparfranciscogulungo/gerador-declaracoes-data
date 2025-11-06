/**
 * ============================================
 * IMAGE CACHE MANAGER
 * Sistema profissional de cache de imagens
 * Estratégia: Cache-First com fallback
 * Storage: IndexedDB (melhor para binários)
 * ============================================
 */

class ImageCacheManager {
    constructor() {
        this.dbName = 'GeradorPDF_ImageCache';
        this.dbVersion = 1;
        this.storeName = 'images';
        this.db = null;
        this.initPromise = this.initDB();
    }

    /**
     * Inicializar IndexedDB
     */
    async initDB() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, this.dbVersion);

            request.onerror = () => {
                console.error('❌ Erro ao abrir IndexedDB:', request.error);
                reject(request.error);
            };

            request.onsuccess = () => {
                this.db = request.result;
                console.log('✅ IndexedDB iniciado:', this.dbName);
                resolve(this.db);
            };

            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                
                // Criar object store se não existir
                if (!db.objectStoreNames.contains(this.storeName)) {
                    const objectStore = db.createObjectStore(this.storeName, { keyPath: 'url' });
                    objectStore.createIndex('timestamp', 'timestamp', { unique: false });
                    objectStore.createIndex('hash', 'hash', { unique: false });
                    console.log('🗄️ Object store criado:', this.storeName);
                }
            };
        });
    }

    /**
     * Gerar hash simples da URL
     */
    hashURL(url) {
        // Remove query params para hash consistente
        const cleanUrl = url.split('?')[0];
        let hash = 0;
        for (let i = 0; i < cleanUrl.length; i++) {
            const char = cleanUrl.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32bit integer
        }
        return Math.abs(hash).toString(36);
    }

    /**
     * Buscar imagem no cache
     */
    async getFromCache(url) {
        try {
            await this.initPromise;
            
            const hash = this.hashURL(url);
            
            return new Promise((resolve, reject) => {
                const transaction = this.db.transaction([this.storeName], 'readonly');
                const objectStore = transaction.objectStore(this.storeName);
                const request = objectStore.get(url);

                request.onsuccess = () => {
                    const cached = request.result;
                    
                    if (cached) {
                        console.log(`📦 Cache HIT: ${url.substring(0, 50)}...`);
                        resolve(cached.dataUrl);
                    } else {
                        console.log(`📭 Cache MISS: ${url.substring(0, 50)}...`);
                        resolve(null);
                    }
                };

                request.onerror = () => {
                    console.warn('⚠️ Erro ao buscar cache:', request.error);
                    resolve(null);
                };
            });
        } catch (error) {
            console.warn('⚠️ Cache indisponível:', error);
            return null;
        }
    }

    /**
     * Salvar imagem no cache
     */
    async saveToCache(url, dataUrl) {
        try {
            await this.initPromise;
            
            const hash = this.hashURL(url);
            
            return new Promise((resolve, reject) => {
                const transaction = this.db.transaction([this.storeName], 'readwrite');
                const objectStore = transaction.objectStore(this.storeName);
                
                const data = {
                    url: url,
                    dataUrl: dataUrl,
                    hash: hash,
                    timestamp: Date.now(),
                    size: dataUrl.length
                };
                
                const request = objectStore.put(data);

                request.onsuccess = () => {
                    console.log(`💾 Salvo no cache: ${url.substring(0, 50)}... (${(dataUrl.length / 1024).toFixed(2)}KB)`);
                    resolve(true);
                };

                request.onerror = () => {
                    console.warn('⚠️ Erro ao salvar cache:', request.error);
                    resolve(false);
                };
            });
        } catch (error) {
            console.warn('⚠️ Não foi possível salvar no cache:', error);
            return false;
        }
    }

    /**
     * Baixar imagem do servidor e converter para Data URL
     */
    async fetchImageAsDataURL(url) {
        try {
            console.log(`🌐 Baixando do servidor: ${url.substring(0, 50)}...`);
            
            const response = await fetch(url, {
                method: 'GET',
                mode: 'cors',
                cache: 'no-cache'
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const blob = await response.blob();
            
            // Converter blob para data URL
            return new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onloadend = () => resolve(reader.result);
                reader.onerror = reject;
                reader.readAsDataURL(blob);
            });
            
        } catch (error) {
            console.error('❌ Erro ao baixar imagem:', error);
            throw error;
        }
    }

    /**
     * MÉTODO PRINCIPAL: Obter imagem (cache-first)
     * @param {string} url - URL da imagem
     * @param {boolean} forceRefresh - Forçar download mesmo com cache
     * @returns {Promise<string>} Data URL da imagem
     */
    async getImage(url, forceRefresh = false) {
        if (!url || url.trim() === '') {
            return null;
        }

        try {
            // 1. Tentar cache (se não forçar refresh)
            if (!forceRefresh) {
                const cached = await this.getFromCache(url);
                if (cached) {
                    return cached;
                }
            }

            // 2. Baixar do servidor
            const dataUrl = await this.fetchImageAsDataURL(url);

            // 3. Salvar no cache
            await this.saveToCache(url, dataUrl);

            return dataUrl;

        } catch (error) {
            console.error('❌ Falha ao obter imagem:', url, error);
            return null;
        }
    }

    /**
     * Limpar imagem específica do cache
     */
    async clearImage(url) {
        try {
            await this.initPromise;
            
            return new Promise((resolve) => {
                const transaction = this.db.transaction([this.storeName], 'readwrite');
                const objectStore = transaction.objectStore(this.storeName);
                const request = objectStore.delete(url);

                request.onsuccess = () => {
                    console.log(`🗑️ Cache removido: ${url.substring(0, 50)}...`);
                    resolve(true);
                };

                request.onerror = () => {
                    console.warn('⚠️ Erro ao remover cache:', request.error);
                    resolve(false);
                };
            });
        } catch (error) {
            console.warn('⚠️ Não foi possível remover do cache:', error);
            return false;
        }
    }

    /**
     * Limpar todo o cache
     */
    async clearAllCache() {
        try {
            await this.initPromise;
            
            return new Promise((resolve) => {
                const transaction = this.db.transaction([this.storeName], 'readwrite');
                const objectStore = transaction.objectStore(this.storeName);
                const request = objectStore.clear();

                request.onsuccess = () => {
                    console.log('🗑️ Todo cache limpo!');
                    resolve(true);
                };

                request.onerror = () => {
                    console.warn('⚠️ Erro ao limpar cache:', request.error);
                    resolve(false);
                };
            });
        } catch (error) {
            console.warn('⚠️ Não foi possível limpar cache:', error);
            return false;
        }
    }

    /**
     * Obter estatísticas do cache
     */
    async getCacheStats() {
        try {
            await this.initPromise;
            
            return new Promise((resolve) => {
                const transaction = this.db.transaction([this.storeName], 'readonly');
                const objectStore = transaction.objectStore(this.storeName);
                const request = objectStore.getAll();

                request.onsuccess = () => {
                    const items = request.result;
                    const totalSize = items.reduce((sum, item) => sum + (item.size || 0), 0);
                    
                    resolve({
                        count: items.length,
                        totalSize: totalSize,
                        totalSizeMB: (totalSize / (1024 * 1024)).toFixed(2),
                        items: items.map(item => ({
                            url: item.url,
                            size: item.size,
                            timestamp: new Date(item.timestamp).toLocaleString('pt-PT')
                        }))
                    });
                };

                request.onerror = () => {
                    resolve({ count: 0, totalSize: 0, items: [] });
                };
            });
        } catch (error) {
            return { count: 0, totalSize: 0, items: [] };
        }
    }

    /**
     * Pré-carregar imagens em segundo plano
     */
    async preloadImages(urls) {
        console.log(`🔄 Pré-carregando ${urls.length} imagens...`);
        
        const results = await Promise.allSettled(
            urls.map(url => this.getImage(url))
        );

        const successful = results.filter(r => r.status === 'fulfilled' && r.value).length;
        console.log(`✅ Pré-carregamento concluído: ${successful}/${urls.length} imagens`);
        
        return successful;
    }
}

// Exportar instância global
const imageCacheManager = new ImageCacheManager();

console.log('🖼️ Image Cache Manager inicializado');
