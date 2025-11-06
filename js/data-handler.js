// ============================================
// DATA-HANDLER.JS
// Manipulação de dados JSON (empresas, trabalhadores, modelos)
// ============================================

class DataHandler {
    constructor() {
        this.empresas = [];
        this.trabalhadores = [];
        this.modelos = [];
        this.cache = new Map();
    }

    // ========== CARREGAR DADOS ==========
    
    async carregarTodosDados() {
        try {
            const [empresasData, trabalhadoresData, modelosData] = await Promise.all([
                this.carregarJSON('/data/empresas.json'),
                this.carregarJSON('/data/trabalhadores.json'),
                this.carregarJSON('/data/modelos.json')
            ]);

            this.empresas = empresasData.empresas || [];
            this.trabalhadores = trabalhadoresData.trabalhadores || [];
            this.modelos = modelosData.modelos || [];

            console.log('✅ Dados carregados:', {
                empresas: this.empresas.length,
                trabalhadores: this.trabalhadores.length,
                modelos: this.modelos.length
            });

            return true;
        } catch (error) {
            console.error('❌ Erro ao carregar dados:', error);
            return false;
        }
    }

    async carregarJSON(url) {
        // Verificar cache
        if (this.cache.has(url)) {
            return this.cache.get(url);
        }

        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${url}`);
            }
            const data = await response.json();
            this.cache.set(url, data);
            return data;
        } catch (error) {
            console.error(`Erro ao carregar ${url}:`, error);
            throw error;
        }
    }

    // ========== GETTERS ==========

    getEmpresas() {
        return this.empresas;
    }

    async getEmpresaPorId(id) {
        const empresa = this.empresas.find(e => e.id === id);
        
        if (!empresa) return null;
        
        // Obter imagens do cache (ou baixar se necessário)
        let logoUrl = empresa.logo || '';
        let carimboUrl = empresa.carimbo || '';
        
        // Carregar imagens via cache manager
        if (logoUrl && typeof imageCacheManager !== 'undefined') {
            try {
                const cachedLogo = await imageCacheManager.getImage(logoUrl);
                if (cachedLogo) {
                    logoUrl = cachedLogo; // Usar data URL do cache
                }
            } catch (error) {
                console.warn('⚠️ Erro ao carregar logo do cache:', error);
                // Fallback: adicionar timestamp
                const timestamp = new Date().getTime();
                logoUrl = `${logoUrl}?v=${timestamp}`;
            }
        }
        
        if (carimboUrl && typeof imageCacheManager !== 'undefined') {
            try {
                const cachedCarimbo = await imageCacheManager.getImage(carimboUrl);
                if (cachedCarimbo) {
                    carimboUrl = cachedCarimbo; // Usar data URL do cache
                }
            } catch (error) {
                console.warn('⚠️ Erro ao carregar carimbo do cache:', error);
                // Fallback: adicionar timestamp
                const timestamp = new Date().getTime();
                carimboUrl = `${carimboUrl}?v=${timestamp}`;
            }
        }
        
        return {
            ...empresa,
            logo: logoUrl,
            carimbo: carimboUrl
        };
    }

    getTrabalhadores() {
        return this.trabalhadores;
    }

    getTrabalhadorPorId(id) {
        return this.trabalhadores.find(t => t.id === id);
    }

    getModelos() {
        return this.modelos;
    }

    getModeloPorId(id) {
        return this.modelos.find(m => m.id === id);
    }

    // ========== TYPE MODELS ==========

    async carregarTypeModel(typeId) {
        const url = `/models/types/${typeId}.json`;
        
        try {
            return await this.carregarJSON(url);
        } catch (error) {
            console.error(`Erro ao carregar type model ${typeId}:`, error);
            return null;
        }
    }

    async carregarModeloMaster() {
        const url = '/models/modelo-master.html';
        
        if (this.cache.has(url)) {
            return this.cache.get(url);
        }

        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${url}`);
            }
            const html = await response.text();
            this.cache.set(url, html);
            return html;
        } catch (error) {
            console.error('Erro ao carregar modelo master:', error);
            throw error;
        }
    }

    // ========== FILTROS E VALIDAÇÕES ==========

    getModelosDisponiveis(empresaId) {
        const empresa = this.getEmpresaPorId(empresaId);
        if (!empresa || !empresa.type_models) {
            return this.modelos;
        }

        // Filtrar apenas os modelos disponíveis para esta empresa
        return this.modelos.filter(m => empresa.type_models.includes(m.id));
    }

    validarDadosCompletos(empresaId, trabalhadorId, modeloId) {
        const empresa = this.getEmpresaPorId(empresaId);
        const trabalhador = this.getTrabalhadorPorId(trabalhadorId);
        const modelo = this.getModeloPorId(modeloId);

        const erros = [];

        if (!empresa) erros.push('Empresa não encontrada');
        if (!trabalhador) erros.push('Trabalhador não encontrado');
        if (!modelo) erros.push('Modelo não encontrado');

        return {
            valido: erros.length === 0,
            erros: erros
        };
    }

    // ========== UTILITÁRIOS ==========

    limparCache() {
        this.cache.clear();
        console.log('🗑️ Cache limpo');
    }

    recarregarDados() {
        this.limparCache();
        return this.carregarTodosDados();
    }

    // Debug
    debug() {
        console.log('📊 Estado do DataHandler:', {
            empresas: this.empresas,
            trabalhadores: this.trabalhadores,
            modelos: this.modelos,
            cache: Array.from(this.cache.keys())
        });
    }
}

// Exportar instância global
const dataHandler = new DataHandler();
