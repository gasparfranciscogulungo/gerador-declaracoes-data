
}{/**
 * ============================================
 * HISTÓRICO MANAGER v2.0 - Sistema Inteligente
 * ============================================
 * 
 * Funcionalidades:
 * - Registro completo de documentos gerados
 * - Tracking de trabalhadores por empresa
 * - Alertas de multi-empresa (trabalhador em várias empresas)
 * - Alertas de limite de documentos
 * - Registro manual de lacunas (documentos anteriores)
 * - Estatísticas avançadas por trabalhador/empresa
 * - Busca e filtros profissionais
 * 
 * NÃO armazena PDFs, apenas metadados!
 * 
 * @version 2.0.0
 * @author Sistema Gerador de Declarações
 */

class HistoricoManagerV2 {
    constructor() {
        // Dados principais
        this.historico = [];
        this.trabalhadoresEmpresas = {}; // Mapa trabalhador -> empresas
        this.configLimites = {
            docsEmpresaAlerta: 3,          // Alerta ao gerar 3+ docs para mesma empresa
            bloquearMultiEmpresa: false,    // Se true, bloqueia (senão só alerta)
            diasConsiderarRecente: 30       // Período para considerar "recente"
        };
        
        // Dependências
        this.githubAPI = null;
        this.authManager = null;
        this.initialized = false;
        
        // Cache de SHA para atualizações
        this.historicoSHA = null;
        
        // Callbacks para alertas
        this.onAlertaMultiEmpresa = null;
        this.onAlertaLimiteDocumentos = null;
    }

    // ==========================================
    // INICIALIZAÇÃO
    // ==========================================

    /**
     * Inicializa o manager com as dependências
     */
    async inicializar(githubAPI, authManager) {
        try {
            this.githubAPI = githubAPI;
            this.authManager = authManager;

            await this.carregarHistorico();
            this.construirMapaTrabalhadores();
            this.initialized = true;
            
            console.log('✅ HistoricoManagerV2 inicializado');
            console.log(`   📊 ${this.historico.length} documentos`);
            console.log(`   👥 ${Object.keys(this.trabalhadoresEmpresas).length} trabalhadores rastreados`);
            
            return true;
        } catch (error) {
            console.error('❌ Erro ao inicializar HistoricoManagerV2:', error);
            this.historico = [];
            this.trabalhadoresEmpresas = {};
            return false;
        }
    }

    // ==========================================
    // CARREGAR / SALVAR
    // ==========================================

    /**
     * Carrega histórico do GitHub
     */
    async carregarHistorico() {
        try {
            const result = await this.githubAPI.lerJSON('data/historico.json');
            
            if (result && result.data) {
                this.historico = result.data.historico || [];
                this.trabalhadoresEmpresas = result.data.trabalhadores_empresas || {};
                this.configLimites = { ...this.configLimites, ...(result.data.limites || {}) };
                this.historicoSHA = result.sha;
                
                console.log(`📚 Histórico carregado: ${this.historico.length} documentos`);
            } else {
                this.historico = [];
                this.trabalhadoresEmpresas = {};
            }
            
            return this.historico;
        } catch (error) {
            console.warn('⚠️ Histórico não encontrado, iniciando vazio:', error.message);
            this.historico = [];
            this.trabalhadoresEmpresas = {};
            return [];
        }
    }

    /**
     * Salva histórico no GitHub
     */
    async salvarHistorico(mensagemCommit = null) {
        try {
            const data = {
                historico: this.historico,
                trabalhadores_empresas: this.trabalhadoresEmpresas,
                limites: this.configLimites,
                _metadata: {
                    versao: "2.0.0",
                    atualizado_em: new Date().toISOString(),
                    total_documentos: this.historico.length,
                    total_trabalhadores: Object.keys(this.trabalhadoresEmpresas).length
                }
            };

            const msg = mensagemCommit || `📊 Histórico: ${this.historico.length} documentos`;
            
            await this.githubAPI.salvarJSON('data/historico.json', data, msg);

            console.log('💾 Histórico salvo com sucesso');
            return true;
        } catch (error) {
            console.error('❌ Erro ao salvar histórico:', error);
            throw error;
        }
    }

    // ==========================================
    // CONSTRUIR MAPA DE TRABALHADORES
    // ==========================================

    /**
     * Reconstrói o mapa de trabalhadores a partir do histórico
     * Útil para migração ou correção de dados
     */
    construirMapaTrabalhadores() {
        console.log('🔄 Construindo mapa de trabalhadores...');
        
        // Não resetar se já existe dados (para preservar dados manuais)
        const mapaExistente = { ...this.trabalhadoresEmpresas };
        
        this.historico.forEach(doc => {
            const trabId = doc.trabalhador_id;
            const empresaId = doc.empresa_id;
            
            if (!trabId || !empresaId) return;
            
            if (!this.trabalhadoresEmpresas[trabId]) {
                // Verificar se existia no mapa anterior
                this.trabalhadoresEmpresas[trabId] = mapaExistente[trabId] || {
                    nome: doc.trabalhador_nome || doc.dados_documento?.trabalhador_nome || '',
                    bi: doc.trabalhador_bi || doc.dados_documento?.trabalhador_bi || '',
                    empresa_principal: empresaId,
                    empresas_usadas: [],
                    total_documentos: 0,
                    historico_empresas: []
                };
            }
            
            const trab = this.trabalhadoresEmpresas[trabId];
            
            // Adicionar empresa se não existir
            if (!trab.empresas_usadas.includes(empresaId)) {
                trab.empresas_usadas.push(empresaId);
                trab.historico_empresas.push({
                    empresa_id: empresaId,
                    empresa_nome: doc.empresa_nome || doc.dados_documento?.empresa_nome || '',
                    data_primeira_geracao: doc.gerado_em || doc.data,
                    total_docs: 0
                });
            }
            
            // Incrementar contador
            trab.total_documentos++;
            
            // Incrementar contador da empresa específica
            const empHist = trab.historico_empresas.find(e => e.empresa_id === empresaId);
            if (empHist) {
                empHist.total_docs++;
            }
        });
        
        console.log(`✅ Mapa construído: ${Object.keys(this.trabalhadoresEmpresas).length} trabalhadores`);
    }

    // ==========================================
    // VERIFICAÇÕES E ALERTAS
    // ==========================================

    /**
     * Verifica se trabalhador já tem documentos em outra empresa
     * @returns {Object} { alerta: boolean, empresas: [], mensagem: string }
     */
    verificarMultiEmpresa(trabalhadorId, empresaAtualId) {
        const trab = this.trabalhadoresEmpresas[trabalhadorId];
        
        if (!trab) {
            return { alerta: false, empresas: [], mensagem: null };
        }
        
        // Filtrar empresas diferentes da atual
        const outrasEmpresas = trab.historico_empresas.filter(
            e => e.empresa_id !== empresaAtualId
        );
        
        if (outrasEmpresas.length === 0) {
            return { alerta: false, empresas: [], mensagem: null };
        }
        
        // Construir mensagem de alerta
        const listaEmpresas = outrasEmpresas.map(e => 
            `• ${e.empresa_nome} (${e.total_docs} doc${e.total_docs > 1 ? 's' : ''})`
        ).join('\n');
        
        return {
            alerta: true,
            empresas: outrasEmpresas,
            trabalhador: trab,
            mensagem: `⚠️ ATENÇÃO: ${trab.nome || 'Este trabalhador'} já possui documentos gerados para outra(s) empresa(s):\n\n${listaEmpresas}\n\nDeseja continuar mesmo assim?`,
            bloquear: this.configLimites.bloquearMultiEmpresa
        };
    }

    /**
     * Verifica limite de documentos para empresa
     * @returns {Object} { alerta: boolean, quantidade: number, mensagem: string }
     */
    verificarLimiteDocumentos(trabalhadorId, empresaId) {
        const trab = this.trabalhadoresEmpresas[trabalhadorId];
        
        if (!trab) {
            return { alerta: false, quantidade: 0, mensagem: null };
        }
        
        const empHist = trab.historico_empresas.find(e => e.empresa_id === empresaId);
        const quantidade = empHist ? empHist.total_docs : 0;
        
        if (quantidade < this.configLimites.docsEmpresaAlerta) {
            return { alerta: false, quantidade, mensagem: null };
        }
        
        return {
            alerta: true,
            quantidade,
            limite: this.configLimites.docsEmpresaAlerta,
            mensagem: `ℹ️ INFO: Este trabalhador já possui ${quantidade} documento(s) gerado(s) para esta empresa.\n\nDeseja gerar mais um?`
        };
    }

    /**
     * Executa todas as verificações antes de gerar documento
     * @returns {Object} { permitir: boolean, alertas: [] }
     */
    verificarAntesDeGerar(trabalhadorId, trabalhadorNome, trabalhadorBI, empresaId, empresaNome) {
        const alertas = [];
        let permitir = true;
        
        // 1. Verificar multi-empresa
        const multiEmpresa = this.verificarMultiEmpresa(trabalhadorId, empresaId);
        if (multiEmpresa.alerta) {
            alertas.push({
                tipo: 'multi-empresa',
                severidade: multiEmpresa.bloquear ? 'bloqueio' : 'aviso',
                ...multiEmpresa
            });
            if (multiEmpresa.bloquear) {
                permitir = false;
            }
        }
        
        // 2. Verificar limite de documentos
        const limite = this.verificarLimiteDocumentos(trabalhadorId, empresaId);
        if (limite.alerta) {
            alertas.push({
                tipo: 'limite-documentos',
                severidade: 'info',
                ...limite
            });
        }
        
        return {
            permitir,
            alertas,
            trabalhadorInfo: this.trabalhadoresEmpresas[trabalhadorId] || null
        };
    }

    // ==========================================
    // REGISTRAR DOCUMENTO
    // ==========================================

    /**
     * Gera ID único para documento
     */
    gerarId() {
        const timestamp = Date.now();
        const random = Math.random().toString(36).substr(2, 6).toUpperCase();
        return `DOC-${timestamp}-${random}`;
    }

    /**
     * Registra novo documento no histórico
     */
    async registrarDocumento(dados) {
        try {
            // Validação
            if (!dados.tipo_documento || !dados.empresa_id || !dados.trabalhador_id) {
                throw new Error('Dados incompletos: tipo_documento, empresa_id e trabalhador_id são obrigatórios');
            }

            // Obter usuário atual
            let usuarioAtual = 'sistema';
            if (this.authManager) {
                const user = this.authManager.obterUsuarioAtual?.() || this.authManager.getCurrentUser?.();
                usuarioAtual = user?.username || user?.login || 'sistema';
            }

            // Criar registro completo
            const registro = {
                id: this.gerarId(),
                
                // Tipo e layout
                tipo_documento: dados.tipo_documento,
                layout_usado: dados.layout_usado || dados.modelo_usado || 'executivo',
                
                // Empresa
                empresa_id: dados.empresa_id,
                empresa_nome: dados.empresa_nome || dados.dados_documento?.empresa_nome || '',
                empresa_nif: dados.empresa_nif || dados.dados_documento?.empresa_nif || '',
                
                // Trabalhador
                trabalhador_id: dados.trabalhador_id,
                trabalhador_nome: dados.trabalhador_nome || dados.dados_documento?.trabalhador_nome || '',
                trabalhador_bi: dados.trabalhador_bi || dados.dados_documento?.trabalhador_bi || '',
                
                // Metadados
                gerado_por: usuarioAtual,
                gerado_em: new Date().toISOString(),
                contador: dados.contador || '',
                
                // Dados completos para regeneração
                dados_documento: dados.dados_documento || {},
                
                // Status e origem
                status: 'ativo',
                origem: dados.origem || 'automatico', // 'automatico' ou 'manual'
                
                // Notas
                notas: dados.notas || ''
            };

            // Adicionar ao histórico (mais recente primeiro)
            this.historico.unshift(registro);

            // Atualizar mapa de trabalhadores
            this.atualizarMapaTrabalhador(registro);

            // Salvar no GitHub
            await this.salvarHistorico(`📝 Novo documento: ${registro.tipo_documento} - ${registro.trabalhador_nome}`);

            console.log('✅ Documento registrado:', registro.id);
            return registro;
            
        } catch (error) {
            console.error('❌ Erro ao registrar documento:', error);
            throw error;
        }
    }

    /**
     * Atualiza mapa de trabalhador após novo documento
     */
    atualizarMapaTrabalhador(registro) {
        const trabId = registro.trabalhador_id;
        const empresaId = registro.empresa_id;
        
        if (!this.trabalhadoresEmpresas[trabId]) {
            this.trabalhadoresEmpresas[trabId] = {
                nome: registro.trabalhador_nome,
                bi: registro.trabalhador_bi,
                empresa_principal: empresaId,
                empresas_usadas: [],
                total_documentos: 0,
                historico_empresas: []
            };
        }
        
        const trab = this.trabalhadoresEmpresas[trabId];
        
        // Atualizar nome/bi se estavam vazios
        if (!trab.nome && registro.trabalhador_nome) trab.nome = registro.trabalhador_nome;
        if (!trab.bi && registro.trabalhador_bi) trab.bi = registro.trabalhador_bi;
        
        // Adicionar empresa se nova
        if (!trab.empresas_usadas.includes(empresaId)) {
            trab.empresas_usadas.push(empresaId);
            trab.historico_empresas.push({
                empresa_id: empresaId,
                empresa_nome: registro.empresa_nome,
                data_primeira_geracao: registro.gerado_em,
                total_docs: 0
            });
        }
        
        // Incrementar contadores
        trab.total_documentos++;
        
        const empHist = trab.historico_empresas.find(e => e.empresa_id === empresaId);
        if (empHist) {
            empHist.total_docs++;
            empHist.ultima_geracao = registro.gerado_em;
        }
    }

    // ==========================================
    // REGISTRO MANUAL (LACUNAS)
    // ==========================================

    /**
     * Registra documento manualmente (para preencher lacunas de documentos anteriores)
     */
    async registrarManual(dados) {
        // Validação específica para registro manual
        if (!dados.trabalhador_nome || !dados.empresa_nome) {
            throw new Error('Para registro manual, trabalhador_nome e empresa_nome são obrigatórios');
        }
        
        // Gerar IDs se não fornecidos
        if (!dados.trabalhador_id) {
            dados.trabalhador_id = `TRAB-MANUAL-${Date.now()}`;
        }
        if (!dados.empresa_id) {
            dados.empresa_id = `EMP-MANUAL-${Date.now()}`;
        }
        
        // Marcar como manual
        dados.origem = 'manual';
        dados.notas = dados.notas || 'Registro manual - documento gerado antes do sistema';
        
        // Se data foi fornecida, usar como gerado_em
        if (dados.data_geracao) {
            const dataOriginal = new Date(dados.data_geracao);
            dados.dados_documento = dados.dados_documento || {};
            dados.dados_documento.data_original = dados.data_geracao;
        }
        
        return await this.registrarDocumento(dados);
    }

    /**
     * Importa múltiplos registros manuais de uma vez
     */
    async importarRegistrosManuais(registros) {
        const resultados = {
            sucesso: [],
            erros: []
        };
        
        for (const reg of registros) {
            try {
                const resultado = await this.registrarManual(reg);
                resultados.sucesso.push(resultado);
            } catch (error) {
                resultados.erros.push({ registro: reg, erro: error.message });
            }
        }
        
        console.log(`📥 Importação: ${resultados.sucesso.length} sucesso, ${resultados.erros.length} erros`);
        return resultados;
    }

    // ==========================================
    // CONSULTAS E FILTROS
    // ==========================================

    /**
     * Lista documentos com filtros avançados
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
        
        // Filtro por nome do trabalhador (busca parcial)
        if (filtros.trabalhador_nome) {
            const termo = filtros.trabalhador_nome.toLowerCase();
            resultado = resultado.filter(doc => 
                (doc.trabalhador_nome || '').toLowerCase().includes(termo)
            );
        }

        // Filtro por tipo de documento
        if (filtros.tipo_documento) {
            resultado = resultado.filter(doc => doc.tipo_documento === filtros.tipo_documento);
        }

        // Filtro por período
        if (filtros.data_inicio) {
            resultado = resultado.filter(doc => 
                new Date(doc.gerado_em) >= new Date(filtros.data_inicio)
            );
        }
        if (filtros.data_fim) {
            const dataFim = new Date(filtros.data_fim);
            dataFim.setHours(23, 59, 59, 999);
            resultado = resultado.filter(doc => 
                new Date(doc.gerado_em) <= dataFim
            );
        }

        // Filtro por status
        if (filtros.status) {
            resultado = resultado.filter(doc => doc.status === filtros.status);
        }
        
        // Filtro por origem
        if (filtros.origem) {
            resultado = resultado.filter(doc => doc.origem === filtros.origem);
        }

        // Ordenação
        if (filtros.ordenar) {
            const campo = filtros.ordenar;
            const direcao = filtros.ordem === 'asc' ? 1 : -1;
            resultado.sort((a, b) => {
                if (a[campo] < b[campo]) return -1 * direcao;
                if (a[campo] > b[campo]) return 1 * direcao;
                return 0;
            });
        }

        // Limite de resultados
        if (filtros.limite) {
            resultado = resultado.slice(0, filtros.limite);
        }

        return resultado;
    }

    /**
     * Busca textual em múltiplos campos
     */
    buscar(query) {
        if (!query || query.trim() === '') {
            return this.historico;
        }

        const termo = query.toLowerCase().trim();

        return this.historico.filter(doc => {
            return (
                (doc.trabalhador_nome || '').toLowerCase().includes(termo) ||
                (doc.trabalhador_bi || '').toLowerCase().includes(termo) ||
                (doc.empresa_nome || '').toLowerCase().includes(termo) ||
                (doc.empresa_nif || '').toLowerCase().includes(termo) ||
                (doc.tipo_documento || '').toLowerCase().includes(termo) ||
                (doc.gerado_por || '').toLowerCase().includes(termo) ||
                (doc.contador || '').toLowerCase().includes(termo) ||
                (doc.notas || '').toLowerCase().includes(termo)
            );
        });
    }

    /**
     * Obtém documento por ID
     */
    obterPorId(id) {
        return this.historico.find(doc => doc.id === id);
    }

    /**
     * Obtém todos os documentos de um trabalhador
     */
    obterDocumentosTrabalhador(trabalhadorId) {
        return this.listar({ trabalhador_id: trabalhadorId });
    }

    /**
     * Obtém informações completas de um trabalhador
     */
    obterInfoTrabalhador(trabalhadorId) {
        const info = this.trabalhadoresEmpresas[trabalhadorId];
        if (!info) return null;
        
        return {
            ...info,
            documentos: this.obterDocumentosTrabalhador(trabalhadorId)
        };
    }

    // ==========================================
    // ESTATÍSTICAS
    // ==========================================

    /**
     * Calcula estatísticas gerais ou filtradas
     */
    estatisticas(filtros = {}) {
        const docs = this.listar(filtros);

        // Contadores por tipo
        const porTipo = {};
        const tipos = ['declaracao', 'recibo', 'combo', 'nif', 'atestado', 'bi'];
        tipos.forEach(t => porTipo[t] = 0);

        // Contadores por empresa
        const porEmpresa = {};

        // Contadores por usuário
        const porUsuario = {};

        // Contadores por dia (últimos 30 dias)
        const hoje = new Date();
        const porDia = {};
        for (let i = 0; i < 30; i++) {
            const data = new Date(hoje);
            data.setDate(data.getDate() - i);
            const key = data.toISOString().split('T')[0];
            porDia[key] = 0;
        }

        // Processar documentos
        docs.forEach(doc => {
            // Por tipo
            const tipo = doc.tipo_documento || 'outro';
            porTipo[tipo] = (porTipo[tipo] || 0) + 1;

            // Por empresa
            const empresaId = doc.empresa_id || 'desconhecida';
            if (!porEmpresa[empresaId]) {
                porEmpresa[empresaId] = {
                    nome: doc.empresa_nome || 'Desconhecida',
                    total: 0
                };
            }
            porEmpresa[empresaId].total++;

            // Por usuário
            const usuario = doc.gerado_por || 'desconhecido';
            porUsuario[usuario] = (porUsuario[usuario] || 0) + 1;

            // Por dia
            const dataDoc = (doc.gerado_em || '').split('T')[0];
            if (porDia.hasOwnProperty(dataDoc)) {
                porDia[dataDoc]++;
            }
        });

        // Ranking de trabalhadores mais frequentes
        const rankingTrabalhadores = Object.entries(this.trabalhadoresEmpresas)
            .map(([id, info]) => ({
                id,
                nome: info.nome,
                total: info.total_documentos,
                empresas: info.empresas_usadas.length
            }))
            .sort((a, b) => b.total - a.total)
            .slice(0, 10);

        return {
            total: docs.length,
            porTipo,
            porEmpresa,
            porUsuario,
            porDia,
            rankingTrabalhadores,
            totalTrabalhadores: Object.keys(this.trabalhadoresEmpresas).length,
            trabalhadoresMultiEmpresa: Object.values(this.trabalhadoresEmpresas)
                .filter(t => t.empresas_usadas.length > 1).length,
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
        });
    }

    /**
     * Estatísticas por trabalhador específico
     */
    estatisticasTrabalhador(trabalhadorId) {
        const docs = this.obterDocumentosTrabalhador(trabalhadorId);
        const info = this.trabalhadoresEmpresas[trabalhadorId];
        
        if (!info) return null;
        
        const porTipo = {};
        const porEmpresa = {};
        
        docs.forEach(doc => {
            // Por tipo
            const tipo = doc.tipo_documento || 'outro';
            porTipo[tipo] = (porTipo[tipo] || 0) + 1;
            
            // Por empresa
            const empId = doc.empresa_id;
            if (!porEmpresa[empId]) {
                porEmpresa[empId] = {
                    nome: doc.empresa_nome,
                    total: 0,
                    tipos: {}
                };
            }
            porEmpresa[empId].total++;
            porEmpresa[empId].tipos[tipo] = (porEmpresa[empId].tipos[tipo] || 0) + 1;
        });
        
        return {
            trabalhador: info,
            totalDocumentos: docs.length,
            porTipo,
            porEmpresa,
            documentos: docs,
            primeiroDocumento: docs[docs.length - 1] || null,
            ultimoDocumento: docs[0] || null
        };
    }

    // ==========================================
    // AÇÕES EM DOCUMENTOS
    // ==========================================

    /**
     * Prepara dados para regenerar PDF
     */
    prepararRegeneracao(id) {
        const documento = this.obterPorId(id);
        if (!documento) {
            throw new Error('Documento não encontrado');
        }

        return {
            tipo_documento: documento.tipo_documento,
            empresa_id: documento.empresa_id,
            trabalhador_id: documento.trabalhador_id,
            layout: documento.layout_usado,
            dados: documento.dados_documento,
            contador_original: documento.contador,
            documento_original: documento
        };
    }

    /**
     * Marca documento como inativo (soft delete)
     */
    async inativarDocumento(id, motivo = '') {
        const doc = this.obterPorId(id);
        if (!doc) {
            throw new Error('Documento não encontrado');
        }

        doc.status = 'inativo';
        doc.inativado_em = new Date().toISOString();
        doc.motivo_inativacao = motivo;

        await this.salvarHistorico(`🗑️ Documento inativado: ${id}`);
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
        delete doc.motivo_inativacao;

        await this.salvarHistorico(`♻️ Documento reativado: ${id}`);
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

        await this.salvarHistorico(`📝 Notas atualizadas: ${id}`);
        console.log('📝 Notas atualizadas:', id);
        return true;
    }

    // ==========================================
    // CONFIGURAÇÃO DE LIMITES
    // ==========================================

    /**
     * Atualiza configurações de limites
     */
    async atualizarConfigLimites(novasConfigs) {
        this.configLimites = { ...this.configLimites, ...novasConfigs };
        await this.salvarHistorico('⚙️ Configurações de limites atualizadas');
        return this.configLimites;
    }

    /**
     * Obtém configurações atuais
     */
    obterConfigLimites() {
        return { ...this.configLimites };
    }
}

// ==========================================
// INSTÂNCIA GLOBAL
// ==========================================

const historicoManagerV2 = new HistoricoManagerV2();

// Alias para compatibilidade
const historicoManager = historicoManagerV2;

// Export para módulos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { HistoricoManagerV2, historicoManagerV2 };
}
