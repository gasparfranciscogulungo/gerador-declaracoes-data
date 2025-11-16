// ============================================
// USER-PANEL-CONTROLLER.JS
// Lógica do painel do usuário (operador)
// Usuário VÊ empresas (criadas pelo admin)
// Usuário CRIA seus próprios trabalhadores
// Usuário GERA PDFs usando empresas + seus trabalhadores
// ============================================

function userPanelApp() {
    return {
        // ========== ESTADO ==========
        usuario: null,
        usuarioData: null, // Dados completos do users.json (role, status, etc)
        empresasDisponiveis: [], // Empresas criadas pelo admin (READ-ONLY)
        meusTrabalhadores: [], // Só os trabalhadores criados por este user
        meuHistorico: [], // Só os PDFs gerados por este user
        darkMode: localStorage.getItem('darkMode') === 'true',
        mobileMenuOpen: false,
        
        // Modal de aguardando
        modalAguardando: false,
        mensagemAguardando: '',
        statusAguardando: '', // pending, blocked, not_found
        
        activeTab: 'empresas',
        loading: false,
        loadingMessage: 'Carregando...',
        uploadProgress: null,
        
        alert: {
            show: false,
            type: 'success',
            message: ''
        },
        
        // STATS PESSOAIS
        stats: {
            totalTrabalhadores: 0,
            pdfsMesAtual: 0,
            limiteRestante: 0,
            empresasDisponiveis: 0
        },
        
        config: {
            owner: CONFIG.github.owner,
            repo: CONFIG.github.repo
        },
        
        // Modals
        modalNovoTrabalhador: false,
        modalEditarTrabalhador: false,
        modalPreviewModelo: false,
        modalFluxoGeracao: false,
        modalCropperBI: false,
        
        // Fluxo de Geração
        fluxoEtapa: 1,
        fluxoEmpresaSelecionada: null,
        fluxoTrabalhadorSelecionado: null,
        fluxoTipoDocumento: null,
        fluxoBuscaEmpresa: '',
        fluxoBuscaTrabalhador: '',
        
        // Preview
        tipoPreview: 'declaracao',
        mostrarPersonalizacao: false,
        menuPreviewOpen: false,
        
        // Trabalhador em edição
        trabalhadorEmEdicao: null,
        formTrabalhador: {
            nome: '',
            documento: '',
            tipo_documento: 'BI',
            nif: '',
            data_nascimento: '',
            nacionalidade: 'Angolana',
            morada: '',
            cidade: '',
            telefone: '',
            email: '',
            funcao: '',
            departamento: '',
            data_admissao: '',
            tipo_contrato: 'Contrato sem termo',
            salario_bruto: '',
            salario_liquido: '',
            moeda: 'AKZ',
            iban: '',
            empresa_id: '', // Empresa onde trabalha
            ativo: true,
            observacoes: ''
        },
        
        // Personalização
        previewConfig: {
            fontFamily: 'Arial',
            fontSize: 12,
            tamanhoTitulo: 24,
            tamanhoSubtitulo: 16,
            tamanhoEmpresa: 9,
            corTexto: '#000000',
            corDestaque: '#091f67',
            espacamentoLinhas: 1.8,
            zoom: 55,
            tituloDocumento: 'Declaração de Serviço',
            textoIntro: 'Declara-se, para os devidos efeitos, que',
            alinhamentoTexto: 'justify',
            alinhamentoCabecalho: 'left'
        },
        
        // ========== LIFECYCLE ==========
        
        async init() {
            console.log('🚀 Iniciando User Panel...');
            
            this.loading = true;
            this.loadingMessage = 'Verificando autenticação...';
            
            try {
                // ✅ Verificação simplificada
                const token = localStorage.getItem('token');
                const username = localStorage.getItem('username');
                
                if (!token || !username) {
                    console.log('❌ Token não encontrado');
                    window.location.href = 'index.html';
                    return;
                }
                
                // Configurar GitHub API PRIMEIRO
                console.log('🔧 Configurando GitHub API...');
                githubAPI.setToken(token);
                
                const githubConfig = {
                    owner: 'gasparfranciscogulungo',
                    repo: 'gerador-declaracoes-data',
                    branch: 'master'
                };
                console.log('Config:', githubConfig);
                githubAPI.configurar(githubConfig);
                
                // Obter usuário do GitHub
                this.loadingMessage = 'Carregando perfil...';
                console.log('👤 Obtendo usuário autenticado...');
                this.usuario = await githubAPI.getAuthenticatedUser();
                console.log('✅ Usuário GitHub:', this.usuario.login);
                
                // ✅ VERIFICAÇÃO SIMPLIFICADA - Se é admin, redirecionar
                if (CONFIG.admins.includes(this.usuario.login)) {
                    console.log('⚠️ Admin detectado, redirecionando...');
                    this.showAlert('success', 'Redirecionando para painel administrativo...');
                    setTimeout(() => {
                        window.location.href = 'admin.html';
                    }, 1500);
                    return;
                }
                
                // ✅ Usuário normal autorizado (sistema simplificado: todos podem entrar)
                this.usuarioData = {
                    username: this.usuario.login,
                    name: this.usuario.name || this.usuario.login,
                    avatar: this.usuario.avatar_url,
                    role: 'user',
                    status: 'active'
                };
                
                console.log('✅ Acesso autorizado:', {
                    username: this.usuarioData.username,
                    role: this.usuarioData.role,
                    status: this.usuarioData.status
                });
                
                // Carregar dados
                await this.carregarDados();
                
                this.loading = false;
                console.log('✅ User Panel carregado com sucesso!');
                
            } catch (error) {
                console.error('❌ Erro ao inicializar:', error);
                this.showAlert('error', 'Erro ao carregar painel: ' + error.message);
                this.loading = false;
            }
        },
        
        // ========== TELA DE AGUARDANDO ==========
        
        mostrarTelaAguardando(status) {
            this.statusAguardando = status;
            this.loading = false;
            
            const mensagens = {
                pending: '⏳ Sua conta está aguardando aprovação do administrador.\n\nVocê receberá acesso em breve.',
                blocked: '🚫 Sua conta foi bloqueada.\n\nEntre em contato com o administrador para mais informações.',
                not_found: '❓ Conta não encontrada no sistema.\n\nFaça login novamente ou entre em contato com o administrador.'
            };
            
            this.mensagemAguardando = mensagens[status] || 'Status desconhecido.';
            this.modalAguardando = true;
            
            console.log('🔒 Acesso bloqueado - Status:', status);
        },
        
        async carregarDados() {
            this.loading = true;
            this.loadingMessage = 'Carregando dados...';
            
            try {
                // Carregar empresas (todas - criadas pelo admin)
                await this.carregarEmpresas();
                
                // Carregar trabalhadores (só os meus)
                await this.carregarMeusTrabalhadores();
                
                // Carregar histórico (só o meu)
                await this.carregarMeuHistorico();
                
                // Calcular estatísticas
                this.calcularStats();
                
            } catch (error) {
                console.error('❌ Erro ao carregar dados:', error);
                throw error;
            } finally {
                this.loading = false;
            }
        },
        
        // ========== EMPRESAS (READ-ONLY) ==========
        
        async carregarEmpresas() {
            console.group('🔍 DEBUG: carregarEmpresas()');
            try {
                console.log('1️⃣ Iniciando carregamento de empresas...');
                console.log('Token existe?', localStorage.getItem('token') ? '✅ Sim' : '❌ Não');
                console.log('Config GitHub:', CONFIG.github);
                
                console.log('2️⃣ Chamando githubAPI.lerJSON()...');
                const response = await githubAPI.lerJSON('data/empresas.json');
                
                console.log('3️⃣ Resposta recebida:', response);
                
                if (!response || !response.data) {
                    console.warn('⚠️ Resposta vazia ou inválida');
                    this.empresasDisponiveis = [];
                    this.showAlert('warning', 'Nenhuma empresa encontrada no sistema');
                    this.calcularStats();
                    console.groupEnd();
                    return;
                }
                
                const empresasData = response.data;
                console.log('4️⃣ Dados parseados:', empresasData);
                
                if (empresasData && empresasData.empresas) {
                    this.empresasDisponiveis = empresasData.empresas;
                    console.log(`✅ ${this.empresasDisponiveis.length} empresas carregadas com sucesso!`);
                    this.showAlert('success', `${this.empresasDisponiveis.length} empresas carregadas`);
                } else {
                    console.warn('⚠️ Estrutura de dados inesperada:', empresasData);
                    this.empresasDisponiveis = [];
                    this.showAlert('warning', 'Formato de dados inválido');
                }
                
                this.calcularStats();
            } catch (error) {
                console.error('❌ Erro completo ao carregar empresas:', error);
                console.error('Stack trace:', error.stack);
                this.empresasDisponiveis = [];
                this.showAlert('error', 'Erro ao carregar empresas: ' + error.message);
            }
            console.groupEnd();
        },
        
        getEmpresaPorId(id) {
            return this.empresasDisponiveis.find(e => e.id === id);
        },
        
        // ========== TRABALHADORES (MEUS) ==========
        
        async carregarMeusTrabalhadores() {
            console.group('🔍 DEBUG: carregarMeusTrabalhadores()');
            try {
                console.log('📂 Carregando trabalhadores...');
                
                const response = await githubAPI.lerJSON('data/trabalhadores.json');
                console.log('Resposta:', response);
                
                if (!response || !response.data) {
                    console.warn('⚠️ Resposta vazia');
                    this.meusTrabalhadores = [];
                    this.calcularStats();
                    console.groupEnd();
                    return;
                }
                
                const data = response.data;
                const todos = data.trabalhadores || [];
                console.log(`Total de trabalhadores no sistema: ${todos.length}`);
                
                // ✅ FILTRAR POR USUÁRIO: Cada user vê apenas seus trabalhadores
                const meuUsername = this.usuario.login;
                console.log(`👤 Filtrando para usuário: ${meuUsername}`);
                
                this.meusTrabalhadores = todos.filter(t => {
                    // Trabalhador pertence ao usuário se:
                    // 1. Tem usuario_id igual ao login atual, OU
                    // 2. Tem criado_por igual ao login atual
                    const pertenceAoUser = t.usuario_id === meuUsername || t.criado_por === meuUsername;
                    
                    if (pertenceAoUser) {
                        console.log(`  ✅ ${t.nome} pertence a ${meuUsername}`);
                    }
                    
                    return pertenceAoUser;
                });
                
                console.log(`✅ ${this.meusTrabalhadores.length} trabalhadores do usuário ${meuUsername}`);
                console.log(`📊 Total no sistema: ${todos.length}, Meus: ${this.meusTrabalhadores.length}`);
                
                this.calcularStats();
            } catch (error) {
                console.error('❌ Erro ao carregar trabalhadores:', error);
                this.meusTrabalhadores = [];
                this.showAlert('error', 'Erro ao carregar trabalhadores');
            }
            console.groupEnd();
        },
        
        async salvarTrabalhador() {
            console.group('💾 DEBUG: salvarTrabalhador()');
            try {
                console.log('1️⃣ Validando formulário...');
                if (!this.validarFormTrabalhador()) {
                    console.warn('⚠️ Validação falhou');
                    console.groupEnd();
                    return;
                }
                
                console.log('2️⃣ Formulário válido, iniciando salvamento...');
                this.loading = true;
                this.loadingMessage = 'Salvando trabalhador...';
                
                // Carregar todos os trabalhadores
                console.log('3️⃣ Carregando trabalhadores existentes...');
                const arquivo = await githubAPI.lerJSON('data/trabalhadores.json');
                console.log('Arquivo carregado:', arquivo);
                
                let trabalhadores = arquivo?.data?.trabalhadores || [];
                console.log(`Total de trabalhadores existentes: ${trabalhadores.length}`);
                
                if (this.trabalhadorEmEdicao) {
                    // Editar existente
                    console.log('4️⃣ Modo: EDITAR trabalhador existente');
                    const index = trabalhadores.findIndex(t => t.id === this.trabalhadorEmEdicao.id);
                    if (index !== -1) {
                        trabalhadores[index] = {
                            ...this.formTrabalhador,
                            id: this.trabalhadorEmEdicao.id,
                            usuario_id: this.usuario.login,
                            criado_por: this.usuario.login,
                            data_atualizacao: new Date().toISOString()
                        };
                        console.log('✅ Trabalhador atualizado:', trabalhadores[index]);
                    }
                } else {
                    // Criar novo
                    console.log('4️⃣ Modo: CRIAR novo trabalhador');
                    const novoTrabalhador = {
                        ...this.formTrabalhador,
                        id: `TRAB-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
                        usuario_id: this.usuario.login,
                        criado_por: this.usuario.login,
                        data_criacao: new Date().toISOString(),
                        ativo: true
                    };
                    trabalhadores.push(novoTrabalhador);
                    console.log('✅ Novo trabalhador criado:', novoTrabalhador);
                }
                
                console.log(`5️⃣ Total após operação: ${trabalhadores.length} trabalhadores`);
                
                // Salvar no GitHub
                console.log('6️⃣ Salvando no GitHub...');
                const jsonContent = JSON.stringify({ trabalhadores }, null, 2);
                console.log('Conteúdo a salvar (preview):', jsonContent.substring(0, 200) + '...');
                
                await githubAPI.salvarArquivo(
                    'data/trabalhadores.json',
                    jsonContent,
                    `${this.trabalhadorEmEdicao ? 'Update' : 'Add'} trabalhador: ${this.formTrabalhador.nome}`,
                    arquivo?.sha
                );
                
                console.log('✅ Salvo no GitHub com sucesso!');
                
                // Recarregar
                console.log('7️⃣ Recarregando lista...');
                await this.carregarMeusTrabalhadores();
                this.calcularStats();
                
                // Fechar modal
                this.modalNovoTrabalhador = false;
                this.modalEditarTrabalhador = false;
                this.limparFormTrabalhador();
                
                this.showAlert('success', '✅ Trabalhador salvo com sucesso!');
                console.log('🎉 Operação concluída com sucesso!');
                
            } catch (error) {
                console.error('❌ ERRO COMPLETO ao salvar trabalhador:', error);
                console.error('Stack:', error.stack);
                this.showAlert('error', 'Erro ao salvar: ' + error.message);
            } finally {
                this.loading = false;
                console.groupEnd();
            }
        },
        
        abrirModalNovoTrabalhador() {
            this.limparFormTrabalhador();
            this.trabalhadorEmEdicao = null;
            this.modalNovoTrabalhador = true;
        },
        
        abrirModalEditarTrabalhador(trabalhador) {
            this.trabalhadorEmEdicao = trabalhador;
            this.formTrabalhador = { ...trabalhador };
            this.modalEditarTrabalhador = true;
        },
        
        async excluirTrabalhador(id) {
            if (!confirm('Tem certeza que deseja excluir este trabalhador?')) {
                return;
            }
            
            try {
                this.loading = true;
                this.loadingMessage = 'Excluindo trabalhador...';
                
                const arquivo = await githubAPI.lerJSON('data/trabalhadores.json');
                let trabalhadores = arquivo?.data?.trabalhadores || [];
                
                trabalhadores = trabalhadores.filter(t => t.id !== id);
                
                await githubAPI.salvarArquivo(
                    'data/trabalhadores.json',
                    JSON.stringify({ trabalhadores }, null, 2),
                    'Delete trabalhador'
                );
                
                await this.carregarMeusTrabalhadores();
                this.calcularStats();
                
                this.showAlert('success', 'Trabalhador excluído!');
                
            } catch (error) {
                console.error('❌ Erro ao excluir:', error);
                this.showAlert('error', 'Erro ao excluir trabalhador');
            } finally {
                this.loading = false;
            }
        },
        
        validarFormTrabalhador() {
            if (!this.formTrabalhador.nome.trim()) {
                this.showAlert('error', 'Nome é obrigatório');
                return false;
            }
            
            if (!this.formTrabalhador.documento.trim()) {
                this.showAlert('error', 'Documento é obrigatório');
                return false;
            }
            
            // Empresa não é obrigatória - será atribuída no fluxo de geração
            
            return true;
        },
        
        limparFormTrabalhador() {
            this.formTrabalhador = {
                nome: '',
                documento: '',
                tipo_documento: 'BI',
                nif: '',
                data_nascimento: '',
                nacionalidade: 'Angolana',
                morada: '',
                cidade: '',
                telefone: '',
                email: '',
                funcao: '',
                departamento: '',
                data_admissao: '',
                tipo_contrato: 'Contrato sem termo',
                salario_bruto: '',
                salario_liquido: '',
                moeda: 'AKZ',
                iban: '',
                empresa_id: '',
                ativo: true,
                observacoes: ''
            };
        },
        
        // ========== FLUXO DE GERAÇÃO ==========
        
        abrirFluxoGeracao() {
            this.fluxoEtapa = 1;
            this.fluxoEmpresaSelecionada = null;
            this.fluxoTrabalhadorSelecionado = null;
            this.fluxoTipoDocumento = null;
            this.modalFluxoGeracao = true;
        },
        
        selecionarEmpresaFluxo(empresa) {
            this.fluxoEmpresaSelecionada = empresa;
            this.fluxoEtapa = 2;
        },
        
        selecionarTrabalhadorFluxo(trabalhador) {
            this.fluxoTrabalhadorSelecionado = trabalhador;
            this.fluxoEtapa = 3;
        },
        
        selecionarTipoDocumento(tipo) {
            this.fluxoTipoDocumento = tipo;
            this.tipoPreview = tipo;
            
            // Abrir preview
            this.modalFluxoGeracao = false;
            this.modalPreviewModelo = true;
        },
        
        voltarEtapa() {
            if (this.fluxoEtapa > 1) {
                this.fluxoEtapa--;
                
                if (this.fluxoEtapa === 1) {
                    this.fluxoEmpresaSelecionada = null;
                } else if (this.fluxoEtapa === 2) {
                    this.fluxoTrabalhadorSelecionado = null;
                }
            }
        },
        
        // ========== HISTÓRICO ==========
        
        async carregarMeuHistorico() {
            // TODO: Implementar quando houver sistema de histórico
            this.meuHistorico = [];
        },
        
        // ========== ESTATÍSTICAS ==========
        
        calcularStats() {
            this.stats.totalTrabalhadores = this.meusTrabalhadores.length;
            this.stats.empresasDisponiveis = this.empresasDisponiveis.length;
            this.stats.pdfsMesAtual = this.meuHistorico.length; // Por enquanto
            this.stats.limiteRestante = 50 - this.stats.pdfsMesAtual; // Exemplo: limite de 50
        },
        
        // ========== FILTROS ==========
        
        get empresasFiltradas() {
            if (!this.fluxoBuscaEmpresa) {
                return this.empresasDisponiveis;
            }
            
            const busca = this.fluxoBuscaEmpresa.toLowerCase();
            return this.empresasDisponiveis.filter(e => 
                e.nome.toLowerCase().includes(busca) ||
                e.nif.includes(busca)
            );
        },
        
        get trabalhadoresFiltrados() {
            if (!this.fluxoBuscaTrabalhador) {
                return this.meusTrabalhadores;
            }
            
            const busca = this.fluxoBuscaTrabalhador.toLowerCase();
            return this.meusTrabalhadores.filter(t => 
                t.nome.toLowerCase().includes(busca) ||
                t.documento.includes(busca) ||
                t.nif?.includes(busca)
            );
        },
        
        // ========== FLUXO DE GERAÇÃO PROFISSIONAL ==========
        
        /**
         * Abre o modal de fluxo de geração
         */
        abrirModalFluxoGeracao() {
            this.fluxoEtapa = 1;
            this.fluxoEmpresaSelecionada = null;
            this.fluxoTrabalhadorSelecionado = null;
            this.fluxoTipoDocumento = null;
            this.fluxoModeloSelecionado = null;
            this.modalFluxoGeracao = true;
            console.log('📂 Modal Fluxo Geração aberto');
        },
        
        /**
         * Fecha o modal de fluxo
         */
        fecharFluxoGeracao() {
            this.modalFluxoGeracao = false;
            console.log('🔒 Modal Fluxo Geração fechado');
        },
        
        /**
         * Seleciona uma empresa no fluxo
         */
        selecionarEmpresa(empresa) {
            this.fluxoEmpresaSelecionada = empresa;
            console.log('✅ Empresa selecionada:', empresa.nome);
        },
        
        /**
         * Avança para seleção de trabalhadores
         */
        avancarParaTrabalhadores() {
            if (!this.fluxoEmpresaSelecionada) {
                this.showAlert('error', 'Por favor, selecione uma empresa');
                return;
            }
            this.fluxoEtapa = 2;
            this.fluxoBuscaTrabalhador = '';
            console.log('➡️ Avançou para seleção de trabalhadores');
        },
        
        /**
         * Seleciona um trabalhador
         */
        selecionarTrabalhador(trabalhador) {
            this.fluxoTrabalhadorSelecionado = trabalhador;
            console.log('✅ Trabalhador selecionado:', trabalhador.nome);
        },
        
        /**
         * Avança para escolha do tipo
         */
        avancarParaTipo() {
            if (!this.fluxoTrabalhadorSelecionado) {
                this.showAlert('error', 'Por favor, selecione um trabalhador');
                return;
            }
            this.fluxoEtapa = 3;
            console.log('➡️ Avançou para seleção de tipo');
        },
        
        /**
         * Gera preview do documento (ETAPA 4)
         */
        async gerarPreviewDocumento() {
            if (!this.fluxoTipoDocumento) {
                this.showAlert('error', 'Por favor, escolha o tipo de documento');
                return;
            }
            
            this.fluxoEtapa = 4;
            
            console.log('📄 Preview preparado:', {
                empresa: this.fluxoEmpresaSelecionada.nome,
                trabalhador: this.fluxoTrabalhadorSelecionado.nome,
                tipo: this.fluxoTipoDocumento
            });
        },
        
        /**
         * Abre preview após selecionar modelo (Etapa 3.5 → 4)
         */
        abrirPreviewDoFluxo() {
            this.tipoPreview = this.fluxoTipoDocumento;
            this.modalPreviewModelo = true;
            this.modalFluxoGeracao = false;
            console.log('👁️ Preview aberto para:', this.fluxoTipoDocumento);
        },
        
        /**
         * Fecha modal de preview
         */
        fecharModalPreview() {
            this.modalPreviewModelo = false;
            this.mostrarControlesZoom = false;
            console.log('🔒 Modal Preview fechado');
        },
        
        /**
         * Volta para escolha de modelo (da etapa 4 para 3.5)
         */
        voltarParaEscolhaModelo() {
            this.modalPreviewModelo = false;
            this.modalFluxoGeracao = true;
            this.fluxoEtapa = 3.5;
            console.log('⬅️ Voltou para escolha de modelo');
        },
        
        /**
         * Variável para controlar modelos disponíveis
         */
        modelos: [
            {
                id: 'modelo_executivo',
                nome: 'Executivo',
                descricao: 'Layout moderno com cores da empresa',
                estilo: 'Moderno',
                categoria: 'declaracao',
                tiposSuportados: ['declaracao']
            },
            {
                id: 'modelo_classico',
                nome: 'Clássico',
                descricao: 'Layout tradicional simples',
                estilo: 'Tradicional',
                categoria: 'declaracao',
                tiposSuportados: ['declaracao']
            },
            {
                id: 'modelo_formal',
                nome: 'Formal',
                descricao: 'Layout corporativo elegante',
                estilo: 'Elegante',
                categoria: 'declaracao',
                tiposSuportados: ['declaracao']
            }
        ],
        
        fluxoModeloSelecionado: null,
        modeloSelecionado: null,
        mostrarControlesZoom: false,
        
        /**
         * Renderiza o modelo no preview
         */
        renderizarModelo() {
            const modelo = this.fluxoModeloSelecionado || this.modeloSelecionado;
            
            if (!modelo) {
                return `
                    <div style="text-align: center; padding: 100px 20px; color: #666;">
                        <div style="font-size: 80px; margin-bottom: 20px;">📄</div>
                        <h2 style="font-size: 24px; margin-bottom: 10px;">Nenhum Modelo Selecionado</h2>
                        <p style="font-size: 14px;">Selecione um modelo para visualizar</p>
                    </div>
                `;
            }
            
            const empresa = this.fluxoEmpresaSelecionada;
            const trabalhador = this.fluxoTrabalhadorSelecionado;
            
            // Verificar se temos dados reais
            if (!empresa || !trabalhador) {
                return `
                    <div style="text-align: center; padding: 100px 20px; color: #666;">
                        <div style="font-size: 80px; margin-bottom: 20px;">⚠️</div>
                        <h2 style="font-size: 24px; margin-bottom: 10px;">Dados Incompletos</h2>
                        <p style="font-size: 14px;">Selecione empresa e trabalhador no fluxo</p>
                    </div>
                `;
            }
            
            // Usar modelo Executivo (único implementado)
            if (modelo.id === 'modelo_executivo' && typeof ModeloDeclaracaoExecutivo !== 'undefined') {
                return ModeloDeclaracaoExecutivo.renderizar(empresa, trabalhador, this.previewConfig);
            }
            
            // Fallback: modelo não implementado
            return `
                <div style="text-align: center; padding: 100px 20px; color: #666;">
                    <div style="font-size: 80px; margin-bottom: 20px;">🚧</div>
                    <h2 style="font-size: 24px; margin-bottom: 10px;">Modelo em Desenvolvimento</h2>
                    <p style="font-size: 14px;">${modelo.nome || 'Este modelo'} será implementado em breve</p>
                </div>
            `;
        },
        
        /**
         * Gera PDF para download
         */
        async gerarPDF() {
            try {
                const modelo = this.fluxoModeloSelecionado || this.modeloSelecionado;
                
                if (!modelo) {
                    this.showAlert('error', '❌ Nenhum modelo selecionado');
                    return;
                }

                if (typeof html2pdf === 'undefined') {
                    this.showAlert('error', '❌ Biblioteca html2pdf.js não carregada. Recarregue a página.');
                    return;
                }

                this.loading = true;
                this.loadingMessage = 'Gerando PDF profissional...';

                const previewElement = document.getElementById('preview-render');
                if (!previewElement) {
                    throw new Error('Elemento de preview não encontrado');
                }

                const modeloHtml = previewElement.innerHTML;
                const tempContainer = document.createElement('div');
                tempContainer.innerHTML = modeloHtml;
                tempContainer.style.cssText = `
                    width: 210mm;
                    min-height: 297mm;
                    max-height: 297mm;
                    margin: 0 auto;
                    padding: 0;
                    box-sizing: border-box;
                    position: relative;
                    overflow: hidden;
                    background: white;
                `;
                
                document.body.appendChild(tempContainer);

                const empresa = this.fluxoEmpresaSelecionada;
                const trabalhador = this.fluxoTrabalhadorSelecionado;
                const dataAtual = new Date().toISOString().split('T')[0];
                
                const nomeArquivo = `Declaracao_${empresa.nome.replace(/\s+/g, '_')}_${trabalhador.nome.replace(/\s+/g, '_')}_${dataAtual}.pdf`;

                const opcoesPDF = {
                    margin: 0,
                    filename: nomeArquivo,
                    image: { type: 'jpeg', quality: 0.98 },
                    html2canvas: { 
                        scale: 1.5,
                        useCORS: true,
                        letterRendering: true,
                        logging: false,
                        scrollY: 0,
                        scrollX: 0,
                        windowWidth: 794,
                        windowHeight: 1123
                    },
                    jsPDF: { 
                        unit: 'mm', 
                        format: 'a4', 
                        orientation: 'portrait',
                        compress: true
                    },
                    pagebreak: { mode: 'avoid-all' }
                };

                console.log('📄 Gerando PDF:', nomeArquivo);

                await html2pdf()
                    .set(opcoesPDF)
                    .from(tempContainer)
                    .save();

                document.body.removeChild(tempContainer);

                this.showAlert('success', `✅ PDF gerado!\n📄 ${nomeArquivo}`);
                
                console.log('✅ PDF baixado com sucesso!');

            } catch (error) {
                console.error('❌ Erro ao gerar PDF:', error);
                this.showAlert('error', `❌ Erro: ${error.message}`);
            } finally {
                this.loading = false;
            }
        },
        
        /**
         * Gera documento final (rota alternativa para gerarPDF)
         */
        async gerarDocumentoFinal() {
            await this.gerarPDF();
        },
        
        /**
         * Cropper BI - funções placeholder
         */
        fecharCropperBI() {
            this.modalCropperBI = false;
            console.log('🔒 Modal Cropper BI fechado');
        },
        
        rotacionarCropper(graus) {
            console.log('🔄 Rotacionar:', graus);
            // TODO: Implementar Cropper.js
        },
        
        resetarCropper() {
            console.log('🔄 Resetar cropper');
            // TODO: Implementar Cropper.js
        },
        
        aplicarCorte() {
            console.log('✂️ Aplicar corte');
            // TODO: Implementar Cropper.js
            this.fecharCropperBI();
        },
        
        // ========== DARK MODE ==========
        
        toggleDarkMode() {
            this.darkMode = !this.darkMode;
            localStorage.setItem('darkMode', this.darkMode.toString());
        },
        
        // ========== NOTIFICAÇÕES ==========
        
        showAlert(type, message) {
            this.alert = {
                show: true,
                type: type,
                message: message
            };
            
            setTimeout(() => {
                this.alert.show = false;
            }, 5000);
        },
        
        // ========== LOGOUT ==========
        
        logout() {
            if (confirm('Tem certeza que deseja sair?')) {
                localStorage.removeItem('userSession');
                window.location.href = 'index.html';
            }
        },
        
        // ========== UTILS ==========
        
        formatarData(data) {
            if (!data) return '-';
            return new Date(data).toLocaleDateString('pt-AO');
        },
        
        formatarSalario(valor) {
            if (!valor) return '0,00';
            return parseFloat(valor).toLocaleString('pt-AO', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            });
        }
    };
}
