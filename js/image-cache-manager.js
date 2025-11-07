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
     * Verificar se URL está acessível (aguarda disponibilidade no CDN)
     * Útil após upload - espera propagação do GitHub CDN
     */
    async waitForImageAvailability(url, maxRetries = 10, delayMs = 2000) {
        console.log(`⏳ Aguardando disponibilidade: ${url.substring(0, 60)}...`);
        
        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                const response = await fetch(url, { 
                    method: 'HEAD',
                    cache: 'no-cache' 
                });
                
                if (response.ok) {
                    console.log(`✅ Imagem disponível após ${attempt} tentativa(s)`);
                    return true;
                }
            } catch (error) {
                // Continua tentando
            }
            
            if (attempt < maxRetries) {
                console.log(`🔄 Tentativa ${attempt}/${maxRetries} - Aguardando ${delayMs}ms...`);
                await new Promise(resolve => setTimeout(resolve, delayMs));
            }
        }
        
        console.warn(`⚠️ Imagem não disponível após ${maxRetries} tentativas`);
        return false;
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
     * COM FALLBACK PARA API DO GITHUB
     */
    async fetchImageAsDataURL(url) {
        try {
            console.log(`🌐 Baixando do servidor: ${url.substring(0, 50)}...`);
            
            // Tentar CDN primeiro
            const response = await fetch(url, {
                method: 'GET',
                mode: 'cors',
                cache: 'no-cache'
            });

            if (response.ok) {
                const blob = await response.blob();
                
                // Converter blob para data URL
                return new Promise((resolve, reject) => {
                    const reader = new FileReader();
                    reader.onloadend = () => resolve(reader.result);
                    reader.onerror = reject;
                    reader.readAsDataURL(blob);
                });
            }

            // Se CDN falhou (404), tentar API do GitHub
            console.warn(`⚠️ CDN retornou ${response.status}, tentando API do GitHub...`);
            return await this.fetchImageFromGitHubAPI(url);
            
        } catch (error) {
            console.warn('⚠️ Erro ao baixar do CDN:', error.message);
            
            // Fallback para API do GitHub
            try {
                return await this.fetchImageFromGitHubAPI(url);
            } catch (apiError) {
                console.error('❌ Erro também na API do GitHub:', apiError);
                throw apiError;
            }
        }
    }

    /**
     * Baixar imagem direto da API do GitHub (fallback quando CDN falha)
     */
    async fetchImageFromGitHubAPI(cdnUrl) {
        try {
            console.log('🔄 Tentando baixar via API do GitHub...');
            
            // Extrair path do arquivo da URL do CDN
            const match = cdnUrl.match(/githubusercontent\.com\/[^\/]+\/[^\/]+\/[^\/]+\/(.+?)(\?|$)/);
            if (!match) {
                throw new Error('URL inválida - não é do GitHub');
            }
            
            const filePath = match[1];
            
            // Verificar se CONFIG e githubAPI estão disponíveis
            if (typeof CONFIG === 'undefined' || typeof githubAPI === 'undefined') {
                throw new Error('CONFIG ou githubAPI não disponível');
            }

            // Construir URL da API
            const apiUrl = `https://api.github.com/repos/${CONFIG.github.owner}/${CONFIG.github.repo}/contents/${filePath}`;
            
            console.log(`📡 API URL: ${apiUrl}`);
            
            // Buscar arquivo via API
            const response = await fetch(apiUrl, {
                headers: {
                    'Authorization': `Bearer ${githubAPI.token}`,
                    'Accept': 'application/vnd.github.v3+json'
                }
            });

            if (!response.ok) {
                throw new Error(`API retornou ${response.status}`);
            }

            const data = await response.json();
            const base64Content = data.content.replace(/\n/g, '');
            
            // Determinar MIME type
            const ext = filePath.split('.').pop().toLowerCase();
            const mimeType = ext === 'png' ? 'image/png' : 
                            ext === 'jpg' || ext === 'jpeg' ? 'image/jpeg' :
                            ext === 'svg' ? 'image/svg+xml' : 'image/png';
            
            // Criar Data URL
            const dataUrl = `data:${mimeType};base64,${base64Content}`;
            
            console.log(`✅ Imagem baixada via API (${(base64Content.length / 1024).toFixed(2)} KB)`);
            
            return dataUrl;
            
        } catch (error) {
            console.error('❌ Erro ao baixar da API:', error);
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
