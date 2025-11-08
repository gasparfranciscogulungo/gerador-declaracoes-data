/**
 * HistoricoManager - Gerencia histórico de documentos gerados
 * 
 * Funcionalidades:
 * - Registrar documento após geração
 * - Busca avançada (NIF, nome empresa, período)
 * - Estatísticas e análises
 * - Regenerar PDF a partir dos metadados
 * 
 * NÃO armazena PDFs, apenas metadados!
 */

class HistoricoManager {
    constructor() {
        this.historico = [];
        this.githubAPI = null;
        this.authManager = null;
        this.initialized = false;
    }

    /**
     * Inicializa o manager
     */
    async inicializar(githubAPI, authManager) {
        try {
            this.githubAPI = githubAPI;
            this.authManager = authManager;

            await this.carregarHistorico();
            this.initialized = true;
            console.log('✅ HistoricoManager inicializado');
            return true;
        } catch (error) {
            console.error('❌ Erro ao inicializar HistoricoManager:', error);
            throw error;
        }
    }

    /**
     * Carrega histórico do GitHub
     */
    async carregarHistorico() {
        try {
            const data = await this.githubAPI.lerArquivo('data/historico.json');
            const parsed = JSON.parse(data);
            this.historico = parsed.historico || [];
            console.log(`📚 ${this.historico.length} documentos carregados do histórico`);
            return this.historico;
        } catch (error) {
            console.warn('⚠️ Erro ao carregar histórico, iniciando vazio:', error);
            this.historico = [];
            return [];
        }
    }

    /**
     * Salva histórico no GitHub
     */
    async salvarHistorico() {
        try {
            const data = {
                historico: this.historico,
                _metadata: {
                    versao: "1.0.0",
                    atualizado_em: new Date().toISOString(),
                    total_documentos: this.historico.length
                }
            };

            await this.githubAPI.salvarArquivo(
                'data/historico.json',
                JSON.stringify(data, null, 2),
                `Atualização histórico: ${this.historico.length} documentos`
            );

            console.log('💾 Histórico salvo com sucesso');
            return true;
        } catch (error) {
            console.error('❌ Erro ao salvar histórico:', error);
            throw error;
        }
    }

    /**
     * Registra novo documento no histórico
     * 
     * @param {Object} documento - Dados do documento
     * @param {string} documento.tipo_documento - "declaracao", "recibo" ou "combo"
     * @param {string} documento.empresa_id - ID da empresa
     * @param {string} documento.trabalhador_id - ID do trabalhador
     * @param {Object} documento.dados_documento - Dados completos do documento
     * @param {string} documento.modelo_usado - ID do modelo utilizado
     * @param {string} documento.contador - Número do contador (ex: "001/2025")
     * @param {string} [documento.notas] - Observações opcionais
     */
    async registrarDocumento(documento) {
        try {
            // Validação básica
            if (!documento.tipo_documento || !documento.empresa_id || !documento.trabalhador_id) {
                throw new Error('Dados incompletos para registrar documento');
            }

            // Obter usuário atual
            const usuarioAtual = this.authManager.obterUsuarioAtual();
            if (!usuarioAtual) {
                throw new Error('Usuário não autenticado');
            }

            // Criar registro
            const registro = {
                id: this.gerarId(),
                tipo_documento: documento.tipo_documento,
                empresa_id: documento.empresa_id,
                trabalhador_id: documento.trabalhador_id,
                dados_documento: documento.dados_documento,
                gerado_por: usuarioAtual.username,
                gerado_em: new Date().toISOString(),
                contador: documento.contador,
                modelo_usado: documento.modelo_usado,
                status: 'ativo',
                notas: documento.notas || ''
            };

            // Adicionar ao histórico
            this.historico.unshift(registro); // Adiciona no início (mais recente primeiro)

            // Salvar no GitHub
            await this.salvarHistorico();

            console.log('📝 Documento registrado no histórico:', registro.id);
            return registro;
        } catch (error) {
            console.error('❌ Erro ao registrar documento:', error);
            throw error;
        }
    }

    /**
     * Gera ID único para documento
     */
    gerarId() {
        const timestamp = Date.now();
        const random = Math.random().toString(36).substr(2, 9);
        return `DOC-${timestamp}-${random}`;
    }

    /**
     * Lista documentos com filtros
     * 
     * @param {Object} filtros
     * @param {string} [filtros.usuario] - Filtrar por usuário
     * @param {string} [filtros.empresa_id] - Filtrar por empresa
     * @param {string} [filtros.trabalhador_id] - Filtrar por trabalhador
     * @param {string} [filtros.tipo_documento] - Filtrar por tipo
     * @param {string} [filtros.data_inicio] - Data início (ISO)
     * @param {string} [filtros.data_fim] - Data fim (ISO)
     * @param {string} [filtros.status] - Filtrar por status
     * @param {number} [filtros.limite] - Limite de resultados
     */
    listar(filtros = {}) {
        let resultado = [...this.historico];

        // Filtro por usuário
        if (filtros.usuario) {
            resultado = resultado.filter(doc => doc.gerado_por === filtros.usuario);
        }

        // Filtro por empresa
        if (filtros.empresa_id) {
            resultado = resultado.filter(doc => doc.empresa_id === filtros.empresa_id);
        }

        // Filtro por trabalhador
        if (filtros.trabalhador_id) {
            resultado = resultado.filter(doc => doc.trabalhador_id === filtros.trabalhador_id);
        }

        // Filtro por tipo de documento
        if (filtros.tipo_documento) {
            resultado = resultado.filter(doc => doc.tipo_documento === filtros.tipo_documento);
        }

        // Filtro por período
        if (filtros.data_inicio) {
            resultado = resultado.filter(doc => new Date(doc.gerado_em) >= new Date(filtros.data_inicio));
        }
        if (filtros.data_fim) {
            resultado = resultado.filter(doc => new Date(doc.gerado_em) <= new Date(filtros.data_fim));
        }

        // Filtro por status
        if (filtros.status) {
            resultado = resultado.filter(doc => doc.status === filtros.status);
        }

        // Limite de resultados
        if (filtros.limite) {
            resultado = resultado.slice(0, filtros.limite);
        }

        return resultado;
    }

    /**
     * Busca avançada por múltiplos campos
     * 
     * @param {string} query - Termo de busca (NIF, nome, etc)
     */
    buscar(query) {
        if (!query || query.trim() === '') {
            return this.historico;
        }

        const termo = query.toLowerCase().trim();

        return this.historico.filter(doc => {
            // Buscar em dados do documento
            const dados = JSON.stringify(doc.dados_documento).toLowerCase();
            const usuario = doc.gerado_por.toLowerCase();
            const contador = doc.contador.toLowerCase();
            const tipo = doc.tipo_documento.toLowerCase();

            return dados.includes(termo) || 
                   usuario.includes(termo) || 
                   contador.includes(termo) ||
                   tipo.includes(termo);
        });
    }

    /**
     * Obtém documento por ID
     */
    obterPorId(id) {
        return this.historico.find(doc => doc.id === id);
    }

    /**
     * Calcula estatísticas gerais
     * 
     * @param {Object} filtros - Mesmo formato do método listar()
     */
    estatisticas(filtros = {}) {
        const docs = this.listar(filtros);

        // Contadores por tipo
        const porTipo = {
            declaracao: docs.filter(d => d.tipo_documento === 'declaracao').length,
            recibo: docs.filter(d => d.tipo_documento === 'recibo').length,
            combo: docs.filter(d => d.tipo_documento === 'combo').length
        };

        // Contadores por empresa
        const porEmpresa = {};
        docs.forEach(doc => {
            if (!porEmpresa[doc.empresa_id]) {
                porEmpresa[doc.empresa_id] = {
                    total: 0,
                    nome: doc.dados_documento.empresa_nome || 'Desconhecido'
                };
            }
            porEmpresa[doc.empresa_id].total++;
        });

        // Contadores por usuário
        const porUsuario = {};
        docs.forEach(doc => {
            if (!porUsuario[doc.gerado_por]) {
                porUsuario[doc.gerado_por] = 0;
            }
            porUsuario[doc.gerado_por]++;
        });

        // Documentos por período (últimos 30 dias)
        const hoje = new Date();
        const porDia = {};
        for (let i = 0; i < 30; i++) {
            const data = new Date(hoje);
            data.setDate(data.getDate() - i);
            const key = data.toISOString().split('T')[0];
            porDia[key] = 0;
        }

        docs.forEach(doc => {
            const data = doc.gerado_em.split('T')[0];
            if (porDia.hasOwnProperty(data)) {
                porDia[data]++;
            }
        });

        return {
            total: docs.length,
            porTipo,
            porEmpresa,
            porUsuario,
            porDia,
            ultimoDocumento: docs[0] || null
        };
    }

    /**
     * Estatísticas de hoje
     */
    estatisticasHoje() {
        const hoje = new Date().toISOString().split('T')[0];
        return this.listar({
            data_inicio: hoje + 'T00:00:00Z',
            data_fim: hoje + 'T23:59:59Z'
        }).length;
    }

    /**
     * Prepara dados para regenerar PDF
     * 
     * @param {string} id - ID do documento
     */
    prepararRegeneracao(id) {
        const documento = this.obterPorId(id);
        if (!documento) {
            throw new Error('Documento não encontrado');
        }

        // Retorna dados estruturados para recriar o PDF
        return {
            tipo_documento: documento.tipo_documento,
            empresa_id: documento.empresa_id,
            trabalhador_id: documento.trabalhador_id,
            modelo: documento.modelo_usado,
            dados: documento.dados_documento,
            contador_original: documento.contador
        };
    }

    /**
     * Marca documento como inativo (soft delete)
     */
    async inativarDocumento(id) {
        const doc = this.obterPorId(id);
        if (!doc) {
            throw new Error('Documento não encontrado');
        }

        doc.status = 'inativo';
        doc.inativado_em = new Date().toISOString();

        await this.salvarHistorico();
        console.log('🗑️ Documento inativado:', id);
        return true;
    }

    /**
     * Reativa documento
     */
    async reativarDocumento(id) {
        const doc = this.obterPorId(id);
        if (!doc) {
            throw new Error('Documento não encontrado');
        }

        doc.status = 'ativo';
        delete doc.inativado_em;

        await this.salvarHistorico();
        console.log('♻️ Documento reativado:', id);
        return true;
    }

    /**
     * Atualiza notas de um documento
     */
    async atualizarNotas(id, notas) {
        const doc = this.obterPorId(id);
        if (!doc) {
            throw new Error('Documento não encontrado');
        }

        doc.notas = notas;
        doc.atualizado_em = new Date().toISOString();

        await this.salvarHistorico();
        console.log('📝 Notas atualizadas:', id);
        return true;
    }
}

// Instância global
const historicoManager = new HistoricoManager();

// Export para uso em módulos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = HistoricoManager;
}
