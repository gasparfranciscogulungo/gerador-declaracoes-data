// ============================================
// STORAGE-HANDLER.JS
// Gerenciamento de localStorage (contadores, histórico)
// ============================================

class StorageHandler {
    constructor() {
        this.STORAGE_KEY = 'gerador_declaracoes';
        this.MAX_DECLARACOES = 5;
        this.inicializar();
    }

    // ========== INICIALIZAÇÃO ==========

    inicializar() {
        const dados = this.carregarDados();
        if (!dados) {
            this.criarEstrutura();
        }
    }

    criarEstrutura() {
        const estrutura = {
            contadores: {},
            historico: [],
            configuracoes: {
                tema: 'light',
                max_declaracoes: this.MAX_DECLARACOES
            },
            versao: '1.0.0',
            ultima_atualizacao: new Date().toISOString()
        };
        this.salvarDados(estrutura);
        console.log('✅ Estrutura de storage criada');
    }

    // ========== OPERAÇÕES BÁSICAS ==========

    carregarDados() {
        try {
            const dados = localStorage.getItem(this.STORAGE_KEY);
            return dados ? JSON.parse(dados) : null;
        } catch (error) {
            console.error('Erro ao carregar dados do storage:', error);
            return null;
        }
    }

    salvarDados(dados) {
        try {
            dados.ultima_atualizacao = new Date().toISOString();
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(dados));
            return true;
        } catch (error) {
            console.error('Erro ao salvar dados no storage:', error);
            return false;
        }
    }

    // ========== CONTADORES ==========

    getContador(empresaId) {
        const dados = this.carregarDados();
        return dados?.contadores?.[empresaId] || 0;
    }

    incrementarContador(empresaId) {
        const dados = this.carregarDados();
        if (!dados) return false;

        if (!dados.contadores[empresaId]) {
            dados.contadores[empresaId] = 0;
        }

        dados.contadores[empresaId]++;
        return this.salvarDados(dados);
    }

    resetarContador(empresaId) {
        const dados = this.carregarDados();
        if (!dados) return false;

        dados.contadores[empresaId] = 0;
        return this.salvarDados(dados);
    }

    verificarLimite(empresaId) {
        const contador = this.getContador(empresaId);
        const max = this.MAX_DECLARACOES;

        return {
            atingido: contador >= max,
            atual: contador,
            maximo: max,
            restantes: Math.max(0, max - contador)
        };
    }

    // ========== HISTÓRICO ==========

    adicionarHistorico(registro) {
        const dados = this.carregarDados();
        if (!dados) return false;

        const novoRegistro = {
            id: this.gerarId(),
            empresa_id: registro.empresaId,
            empresa_nome: registro.empresaNome,
            trabalhador_id: registro.trabalhadorId,
            trabalhador_nome: registro.trabalhadorNome,
            modelo_id: registro.modeloId,
            modelo_nome: registro.modeloNome,
            data: new Date().toISOString(),
            data_formatada: new Date().toLocaleString('pt-PT'),
            referencia: registro.referencia || this.gerarReferencia()
        };

        dados.historico.unshift(novoRegistro); // Adiciona no início

        // Limitar histórico a 100 registros
        if (dados.historico.length > 100) {
            dados.historico = dados.historico.slice(0, 100);
        }

        return this.salvarDados(dados);
    }

    getHistorico(limite = 50) {
        const dados = this.carregarDados();
        return dados?.historico?.slice(0, limite) || [];
    }

    getHistoricoPorEmpresa(empresaId) {
        const historico = this.getHistorico();
        return historico.filter(h => h.empresa_id === empresaId);
    }

    limparHistorico() {
        const dados = this.carregarDados();
        if (!dados) return false;

        dados.historico = [];
        return this.salvarDados(dados);
    }

    // ========== CONFIGURAÇÕES ==========

    getConfiguracao(chave) {
        const dados = this.carregarDados();
        return dados?.configuracoes?.[chave];
    }

    setConfiguracao(chave, valor) {
        const dados = this.carregarDados();
        if (!dados) return false;

        dados.configuracoes[chave] = valor;
        return this.salvarDados(dados);
    }

    // ========== ESTATÍSTICAS ==========

    getEstatisticas() {
        const dados = this.carregarDados();
        if (!dados) return null;

        const totalDeclaracoes = Object.values(dados.contadores).reduce((a, b) => a + b, 0);
        const empresasComDeclaracoes = Object.keys(dados.contadores).length;

        return {
            total_declaracoes: totalDeclaracoes,
            empresas_ativas: empresasComDeclaracoes,
            contadores: dados.contadores,
            total_historico: dados.historico.length,
            ultima_geracao: dados.historico[0]?.data_formatada || 'Nenhuma'
        };
    }

    // ========== UTILITÁRIOS ==========

    gerarId() {
        return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }

    gerarReferencia() {
        const ano = new Date().getFullYear();
        const timestamp = Date.now().toString().slice(-6);
        return `DEC-${ano}-${timestamp}`;
    }

    exportarDados() {
        const dados = this.carregarDados();
        const blob = new Blob([JSON.stringify(dados, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `backup-gerador-declaracoes-${Date.now()}.json`;
        a.click();
        
        URL.revokeObjectURL(url);
        console.log('📦 Dados exportados');
    }

    importarDados(jsonString) {
        try {
            const dados = JSON.parse(jsonString);
            this.salvarDados(dados);
            console.log('✅ Dados importados com sucesso');
            return true;
        } catch (error) {
            console.error('❌ Erro ao importar dados:', error);
            return false;
        }
    }

    resetarTudo() {
        if (confirm('⚠️ ATENÇÃO: Isso vai apagar TODOS os dados. Tem certeza?')) {
            localStorage.removeItem(this.STORAGE_KEY);
            this.criarEstrutura();
            console.log('🗑️ Todos os dados foram resetados');
            return true;
        }
        return false;
    }

    // Debug
    debug() {
        console.log('💾 Estado do Storage:', this.carregarDados());
        console.log('📊 Estatísticas:', this.getEstatisticas());
    }
}

// Exportar instância global
const storageHandler = new StorageHandler();
