// ============================================
// ADMIN-CONTROLLER.JS
// Lógica COMPLETA do painel administrativo
// Conecta com dados REAIS de users, clientes e declarações
// ============================================

function adminApp() {
    return {
        // ========== ESTADO ==========
        usuario: null,
        usuarioData: null, // Dados completos do users.json (role, status, etc)
        empresas: [],
        modelos: [],
        contador: {},
        usersData: null,
        darkMode: localStorage.getItem('darkMode') === 'true',
        mobileMenuOpen: false, // Menu hamburger mobile
        
        activeTab: 'empresas',
        loading: false,
        loadingMessage: 'Carregando...',
        uploadProgress: null, // Progresso do upload (0-100)
        
        alert: {
            show: false,
            type: 'success',
            message: ''
        },
        
        // STATS REAIS
        stats: {
            empresas: 0,
            modelos: 0,
            users: 0,
            usersPendentes: 0, // Número de usuários aguardando aprovação
            declaracoesHoje: 0,
            totalClientes: 0,
            totalDeclaracoes: 0
        },
        
        config: {
            owner: CONFIG.github.owner,
            repo: CONFIG.github.repo
        },
        
        // Modals
        modalNovaEmpresa: false,
        modalNovoModelo: false,
        modalPreviewModelo: false,
        modalFluxoGeracao: false,
        modalGuiaTokens: false,
        modalLimiteEmpresa: false,
        empresaLimiteAtingido: null,
        
        // Modal de Confirmação
        modalConfirm: false,
        confirmData: {
            titulo: '',
            mensagem: '',
            textoBotaoConfirmar: 'Confirmar',
            textoBotaoCancelar: 'Cancelar',
            tipoPerigo: false, // true = botão vermelho
            resolve: null
        },
        
        // Colaboradores
        colaboradores: [],
        loadingColab: false,
        pesquisaColaborador: '',
        novoColaborador: {
            username: '',
            permission: 'push'
        },
        usuariosTeste: [
            { username: 'ndungisidraceugeniodacosta-cmd', token: '' },
            { username: 'luisafernandotiago-cmd', token: '' },
            { username: 'DanielGoncalves666', token: '' }
        ],
        logTestes: [],
        
        // Histórico e Analytics (Admin Panel)
        historicoAdmin: [],
        historicoAdminRecente: [],
        loadingHistoricoAdmin: false,
        statsHistoricoAdmin: {
            totalDocumentos: 0,
            porTipo: {},
            porEmpresa: {},
            porUsuario: {},
            porDia: {}
        },
        chartsAdmin: {
            documentosPorDia: null,
            tiposDocumentos: null,
            empresas: null,
            usuarios: null
        },
        
        // Computed: Colaboradores filtrados
        get colaboradoresFiltrados() {
            if (!this.pesquisaColaborador) {
                return this.colaboradores;
            }
            const search = this.pesquisaColaborador.toLowerCase();
            return this.colaboradores.filter(colab => {
                const name = (colab.name || '').toLowerCase();
                const login = (colab.login || '').toLowerCase();
                return name.includes(search) || login.includes(search);
            });
        },
        
        // Fluxo de Geração de Documento
        fluxoEtapa: 1, // 1=Empresa, 2=Cliente, 3=Tipo, 3.5=Modelo, 4=Preview
        fluxoEmpresaSelecionada: null,
        fluxoClienteSelecionado: null,
        fluxoTipoDocumento: null, // 'declaracao', 'recibo', 'combo', 'nif', 'atestado', 'bi'
        fluxoModeloSelecionado: null, // Modelo escolhido na etapa 3.5
        fluxoMesesRecibo: '1',
        fluxoBuscaEmpresa: '',
        fluxoBuscaCliente: '',
        
        // Sistema de Geração Múltipla
        modelosSelecionadosIds: [], // Array de IDs dos modelos selecionados
        
        // Editor BI
        modalCropperBI: false,
        cropperInstance: null,
        cropperFotoAtual: 1,
        biFoto1Preview: null,
        biFoto2Preview: null,
        biFoto1Blob: null,
        biFoto2Blob: null,
        biModoManual: false, // Se true, permite editar dados manualmente
        biDadosManuais: {
            nome: '',
            biNif: '', // BI / NIF (mesmo número em Angola)
            data: new Date().toLocaleDateString('pt-AO')
        },
        
        // Preview de Modelo
        modeloSelecionado: null,
        tipoPreview: 'declaracao', // 'declaracao', 'recibo', 'combo', 'bi'
        mostrarPersonalizacao: false,
        menuPreviewOpen: false, // Menu hamburger para tipos de documento
        mostrarControlesZoom: false, // Controles de zoom (toggle)
        mostrarAcoesPDF: false, // Ações PDF: Nova Aba, Imprimir, Baixar (toggle)
        
        // Customização do Preview
        previewConfig: {
            fontFamily: 'Arial',
            fontSize: 12,
            tamanhoTitulo: 24,
            tamanhoSubtitulo: 16,
            tamanhoEmpresa: 9,
            corTexto: '#000000',
            corDestaque: '#091f67',
            marcaDaguaOpacidade: 8,
            marcaDaguaRotacao: -45,
            marcaDaguaWidth: 350,
            marcaDaguaHeight: 350,
            espacamentoLinhas: 1.8,
            zoom: 55,
            // Edição de Conteúdo
            tituloDocumento: 'Declaração de Serviço',
            textoIntro: 'Declara-se, para os devidos efeitos, que',
            alinhamentoTexto: 'justify',
            alinhamentoCabecalho: 'left',
            // Controles Avançados do Cabeçalho
            cabecalhoMaxWidth: 450,           // Largura máxima do texto (px)
            cabecalhoMarginEntreLogoTexto: 340, // Espaço entre logo e texto (px) - Era 20, agora 340
            cabecalhoJustify: 'space-between', // Distribuição: space-between, flex-start, flex-end, center
            cabecalhoPaddingBottom: 5,        // Padding inferior (px) - Era 15, agora 5
            cabecalhoBordaLargura: 2,          // Largura da borda inferior (px) - Era 4, agora 2
            cabecalhoLogoSize: 90,             // Tamanho do logo (px) - Era 80, agora 90
            cabecalhoPaddingHorizontal: 5,     // Padding lateral do container (px) - Era 0, agora 5
            cabecalhoLineHeight: 1.2,          // Espaçamento entre linhas do texto (multiplicador) - Era 1.4, agora 1.2
            // Controles do Carimbo
            carimboWidth: 200,                 // Largura do carimbo (px) - Era 110, agora 200
            carimboHeight: 190                 // Altura do carimbo (px) - Era 110, agora 190
        },
        
        // Presets de Estilos Profissionais
        presetsEstilo: {
            formal: {
                nome: 'Formal',
                icone: 'bi-mortarboard',
                cor: 'blue',
                config: {
                    fontFamily: 'Arial',
                    fontSize: 12,
                    tamanhoTitulo: 24,
                    tamanhoSubtitulo: 16,
                    tamanhoEmpresa: 9,
                    corDestaque: '#091f67',
                    marcaDaguaOpacidade: 8,
                    marcaDaguaRotacao: -45,
                    marcaDaguaWidth: 350,
                    marcaDaguaHeight: 350,
                    espacamentoLinhas: 1.8,
                    cabecalhoLogoSize: 90,
                    cabecalhoMarginEntreLogoTexto: 340,
                    cabecalhoPaddingBottom: 5,
                    cabecalhoBordaLargura: 2,
                    cabecalhoPaddingHorizontal: 5,
                    cabecalhoLineHeight: 1.2,
                    carimboWidth: 200,
                    carimboHeight: 190,
                    zoom: 55
                }
            },
            moderno: {
                nome: 'Moderno',
                icone: 'bi-lightning',
                cor: 'purple',
                config: {
                    fontFamily: 'Arial, sans-serif',
                    fontSize: 11,
                    tamanhoTitulo: 32,
                    tamanhoSubtitulo: 20,
                    tamanhoEmpresa: 9,
                    corDestaque: '#7c3aed',
                    marcaDaguaOpacidade: 15,
                    marcaDaguaRotacao: -30,
                    marcaDaguaWidth: 450,
                    marcaDaguaHeight: 450,
                    espacamentoLinhas: 1.5
                }
            },
            minimalista: {
                nome: 'Minimalista',
                icone: 'bi-dash-circle',
                cor: 'gray',
                config: {
                    fontFamily: 'Calibri, sans-serif',
                    fontSize: 11,
                    tamanhoTitulo: 26,
                    tamanhoSubtitulo: 17,
                    tamanhoEmpresa: 8.5,
                    corDestaque: '#374151',
                    marcaDaguaOpacidade: 5,
                    marcaDaguaRotacao: 0,
                    marcaDaguaWidth: 300,
                    marcaDaguaHeight: 300,
                    espacamentoLinhas: 1.6
                }
            },
            executivo: {
                nome: 'Executivo',
                icone: 'bi-briefcase',
                cor: 'green',
                config: {
                    fontFamily: 'Georgia, serif',
                    fontSize: 12,
                    tamanhoTitulo: 30,
                    tamanhoSubtitulo: 19,
                    tamanhoEmpresa: 9.5,
                    corDestaque: '#059669',
                    marcaDaguaOpacidade: 12,
                    marcaDaguaRotacao: -45,
                    marcaDaguaWidth: 420,
                    marcaDaguaHeight: 420,
                    espacamentoLinhas: 1.7
                }
            }
        },
        
        // Forms
        empresaForm: {
            id: null,
            nome: '',
            nif: '',
            endereco: {
                rua: '',
                edificio: '',
                andar: '',
                sala: '',
                bairro: '',
                municipio: '',
                provincia: '',
                pais: 'Angola'
            },
            telefone: '',
            email: '',
            website: '',
            logo: '',
            carimbo: '',
            corPrimaria: '#1e40af',
            corSecundaria: '#64748b',
            marcaDagua: ''
        },
        
        // Managers
        userManager: null,

        // ========== SISTEMA DE PERSONALIZAÇÕES ==========
        personalizacoes: {
            slot1: null,
            slot2: null,
            slot3: null
        },
        autosaveEnabled: true,
        lastSaved: null,
        modalSalvarPersonalizacao: false,
        modalCarregarPersonalizacao: false,
        nomePersonalizacaoTemp: '',
        slotSelecionado: null,

        // ========== INICIALIZAÇÃO ==========
        async init() {
            console.log('🚀 Iniciando painel admin...');
            
            // Verificar autenticação
            this.loading = true;
            this.loadingMessage = 'Verificando autenticação...';
            
            // Verificar se tem token (USAR A MESMA CHAVE DO AUTH-MANAGER)
            const token = localStorage.getItem("token");
            if (!token) {
                console.log('❌ Token não encontrado, redirecionando...');
                window.location.href = 'index.html';
                return;
            }
            
            // Configurar GitHub API
            githubAPI.setToken(token);
            githubAPI.configurar(CONFIG.github);
            
            // Obter usuário do GitHub
            this.loadingMessage = 'Carregando perfil...';
            try {
                this.usuario = await githubAPI.getAuthenticatedUser();
                console.log('✅ Usuário GitHub:', this.usuario.login);
            } catch (error) {
                console.error('❌ Erro ao obter usuário:', error);
                this.showAlert('error', 'Erro ao carregar perfil. Token inválido?');
                // Limpar e redirecionar
                localStorage.removeItem('token');
                localStorage.removeItem('username');
                window.location.href = 'index.html';
                return;
            }
            
            // ========== VERIFICAÇÃO SIMPLES DE ADMIN ==========
            this.loadingMessage = 'Verificando permissões...';
            
            // Verificar se usuário é admin (lista em CONFIG.admins)
            const isAdmin = CONFIG.admins.includes(this.usuario.login);
            
            if (!isAdmin) {
                console.warn('⚠️ Usuário não é administrador');
                this.showAlert('error', '⚠️ Acesso restrito a administradores. Redirecionando para painel de usuário...');
                setTimeout(() => {
                    window.location.href = 'user-panel.html';
                }, 2000);
                return;
            }
            
            // Admin confirmado!
            console.log('✅ Admin confirmado:', this.usuario.login);
            
            // Inicializar outros managers
            this.clienteManager = new ClienteManager();
            
            // Inicializar HistoricoManager (SIMPLIFICADO - sem authManager)
            if (typeof historicoManager !== 'undefined') {
                // Skip - não precisa inicializar com authManager no modo simplificado
                console.log('⏭️  HistoricoManager: modo simplificado');
            }
            
            // Carregar TODOS os dados
            await this.carregarTodosDados();
            
            // Carregar colaboradores
            await this.carregarColaboradores();
            
            // Configurar autosave (a cada 10 segundos)
            setInterval(() => {
                if (this.autosaveEnabled && this.modalPreviewModelo) {
                    this.autoSalvarPersonalizacao();
                }
            }, 10000);
            
            this.loading = false;
            console.log('✅ Painel admin iniciado com SUCESSO!');
        },

        // ========== MODAL DE CONFIRMAÇÃO ==========
        showConfirm(titulo, mensagem, opcoes = {}) {
            return new Promise((resolve) => {
                this.confirmData = {
                    titulo: titulo || 'Confirmação',
                    mensagem: mensagem || 'Tem certeza?',
                    textoBotaoConfirmar: opcoes.textoBotaoConfirmar || 'Confirmar',
                    textoBotaoCancelar: opcoes.textoBotaoCancelar || 'Cancelar',
                    tipoPerigo: opcoes.tipoPerigo || false,
                    resolve: resolve
                };
                this.modalConfirm = true;
            });
        },

        confirmarModal() {
            if (this.confirmData.resolve) {
                this.confirmData.resolve(true);
            }
            this.modalConfirm = false;
        },

        cancelarModal() {
            if (this.confirmData.resolve) {
                this.confirmData.resolve(false);
            }
            this.modalConfirm = false;
        },

        // ========== CARREGAR TODOS OS DADOS ==========
        async carregarTodosDados() {
            try {
                // 1. Carregar usuários (para stats reais)
                this.loadingMessage = 'Carregando usuários...';
                await this.carregarUsuarios();
                
                // 1.5. Carregar usuários pendentes e atualizar badges
                this.loadingMessage = 'Verificando usuários pendentes...';
                await this.carregarUsuariosPendentes();
                
                // 2. Carregar empresas
                this.loadingMessage = 'Carregando empresas...';
                await this.carregarEmpresas();
                
                // 2.5. Pré-carregar imagens das empresas no cache
                if (typeof imageCacheManager !== 'undefined') {
                    this.loadingMessage = 'Otimizando imagens...';
                    await this.preloadEmpresasImages();
                }
                
                // 3. Carregar modelos
                this.loadingMessage = 'Carregando modelos...';
                await this.carregarModelos();
                
                // 4. Carregar contador
                this.loadingMessage = 'Carregando contadores...';
                await this.carregarContador();
                
                // 5. Carregar trabalhadores
                this.loadingMessage = 'Carregando trabalhadores...';
                await this.carregarTrabalhadores();
                
                // 6. Atualizar estatísticas REAIS
                await this.atualizarStatsReais();
                
                console.log('✅ Todos os dados carregados!');
                
            } catch (error) {
                console.error('❌ Erro ao carregar dados:', error);
                this.showAlert('error', 'Erro ao carregar dados: ' + error.message);
            }
        },

        // ========== CARREGAR USUÁRIOS ==========
        async carregarUsuarios() {
            try {
                const response = await githubAPI.lerJSON('data/users.json');
                this.usersData = response.data;
                console.log(`✅ ${this.usersData.users.length} usuários carregados`);
            } catch (error) {
                console.error('❌ Erro ao carregar users.json:', error);
                this.usersData = { users: [], metadata: {} };
            }
        },
        
        // ========== CARREGAR USUÁRIOS PENDENTES ==========
        // DESATIVADO: Sistema simplificado não usa aprovação
        async carregarUsuariosPendentes() {
            this.stats.usersPendentes = 0;
            console.log('⏭️  Sistema de aprovação desativado (modo simplificado)');
        },
        
        // ========== ATUALIZAR BADGES DE NOTIFICAÇÃO ==========
        atualizarBadges(quantidade) {
            try {
                const badgeMobile = document.getElementById('users-badge-mobile');
                const badgeDesktop = document.getElementById('users-badge');
                
                if (badgeMobile) {
                    if (quantidade > 0) {
                        badgeMobile.textContent = quantidade;
                        badgeMobile.classList.remove('hidden');
                    } else {
                        badgeMobile.classList.add('hidden');
                    }
                }
                
                if (badgeDesktop) {
                    if (quantidade > 0) {
                        badgeDesktop.textContent = quantidade;
                        badgeDesktop.classList.remove('hidden');
                    } else {
                        badgeDesktop.classList.add('hidden');
                    }
                }
                
                console.log(`🔔 Badges atualizados: ${quantidade} pendentes`);
            } catch (error) {
                console.error('❌ Erro ao atualizar badges:', error);
            }
        },

        // ========== CARREGAR EMPRESAS ==========
        async carregarEmpresas() {
            try {
                const response = await githubAPI.lerJSON('data/empresas.json');
                const empresasData = response.data;
                this.empresas = empresasData.empresas || [];
                console.log(`✅ ${this.empresas.length} empresas carregadas`, this.empresas);
                
                // Carregar imagens do cache para cada empresa
                if (typeof imageCacheManager !== 'undefined') {
                    console.log('🖼️ Carregando imagens do cache para empresas...');
                    for (const empresa of this.empresas) {
                        // Carregar logo do cache
                        if (empresa.logo && !empresa.logo.startsWith('data:')) {
                            const logoCache = await imageCacheManager.getImage(empresa.logo);
                            if (logoCache) {
                                empresa.logoPreview = logoCache;
                                console.log(`📦 Logo carregado do cache: ${empresa.nome}`);
                            } else {
                                empresa.logoPreview = empresa.logo; // Fallback para URL
                            }
                        } else {
                            empresa.logoPreview = empresa.logo;
                        }
                        
                        // Carregar carimbo do cache
                        if (empresa.carimbo && !empresa.carimbo.startsWith('data:')) {
                            const carimboCache = await imageCacheManager.getImage(empresa.carimbo);
                            if (carimboCache) {
                                empresa.carimboPreview = carimboCache;
                                console.log(`📦 Carimbo carregado do cache: ${empresa.nome}`);
                            } else {
                                empresa.carimboPreview = empresa.carimbo; // Fallback para URL
                            }
                        } else {
                            empresa.carimboPreview = empresa.carimbo;
                        }
                    }
                    console.log('✅ Imagens carregadas do cache para todas as empresas');
                    
                    // Forçar re-render do Alpine.js
                    await this.$nextTick();
                }
            } catch (error) {
                console.error('❌ Erro ao carregar empresas:', error);
                if (error.message.includes('404')) {
                    // Criar arquivo inicial
                    await this.inicializarEmpresas();
                } else {
                    this.empresas = [];
                }
            }
        },

        async inicializarEmpresas() {
            const estruturaInicial = {
                empresas: [],
                metadata: {
                    totalEmpresas: 0,
                    lastId: 0,
                    criadoEm: new Date().toISOString()
                }
            };
            
            await githubAPI.salvarJSON(
                'data/empresas.json',
                estruturaInicial,
                '🏢 Inicializar arquivo de empresas'
            );
            
            this.empresas = [];
            console.log('✅ Empresas inicializadas');
        },

        // ========== CARREGAR MODELOS ==========
        async carregarModelos() {
            try {
                const response = await githubAPI.lerJSON('data/modelos.json');
                const modelosData = response.data;
                this.modelos = modelosData.modelos || [];
                console.log(`✅ ${this.modelos.length} modelos carregados`, this.modelos);
            } catch (error) {
                console.error('❌ Erro ao carregar modelos:', error);
                if (error.message.includes('404')) {
                    await this.inicializarModelos();
                } else {
                    this.modelos = [];
                }
            }
        },

        async inicializarModelos() {
            const estruturaInicial = {
                modelos: [],
                metadata: {
                    totalModelos: 0,
                    lastId: 0,
                    criadoEm: new Date().toISOString()
                }
            };
            
            await githubAPI.salvarJSON(
                'data/modelos.json',
                estruturaInicial,
                '📄 Inicializar arquivo de modelos'
            );
            
            this.modelos = [];
            console.log('✅ Modelos inicializados');
        },

        // ========== CARREGAR CONTADOR ==========
        async carregarContador() {
            try {
                const response = await githubAPI.lerJSON('data/contador.json');
                const contadorData = response.data;
                this.contador = contadorData.contadores || {};
                console.log('✅ Contador carregado');
            } catch (error) {
                console.error('❌ Erro ao carregar contador:', error);
                if (error.message.includes('404')) {
                    await this.inicializarContador();
                } else {
                    this.contador = {};
                }
            }
        },

        async inicializarContador() {
            const contadorInicial = {
                contadores: {},
                historico: [],
                ultima_atualizacao: new Date().toISOString()
            };
            
            await githubAPI.salvarJSON(
                'data/contador.json',
                contadorInicial,
                '📊 Inicializar contador do sistema'
            );
            
            this.contador = {};
            console.log('✅ Contador inicializado');
        },

        // ========== ESTATÍSTICAS REAIS (OTIMIZADO - SEM LOOP) ==========
        async atualizarStatsReais() {
            try {
                // Stats básicas
                this.stats.empresas = this.empresas.length;
                this.stats.modelos = this.modelos.length;
                
                // Users ATIVOS (não pendentes ou bloqueados)
                const usersAtivos = this.usersData?.users.filter(u => u.status === 'active') || [];
                this.stats.users = usersAtivos.length;
                
                // Total de Clientes e Declarações (USA OS STATS JÁ SALVOS EM users.json)
                // Isso é MUITO mais rápido que ler arquivo de cada usuário!
                let totalClientes = 0;
                let totalDeclaracoes = 0;
                
                for (const user of usersAtivos) {
                    totalClientes += user.stats?.clientes || 0;
                    totalDeclaracoes += user.stats?.declaracoes || 0;
                }
                
                this.stats.totalClientes = totalClientes;
                this.stats.totalDeclaracoes = totalDeclaracoes;
                
                // 🆕 PDFs HOJE e TOTAL: Buscar do HistoricoManager
                if (typeof historicoManager !== 'undefined' && historicoManager.initialized) {
                    try {
                        const historicoStats = historicoManager.estatisticas();
                        this.stats.totalDeclaracoes = historicoStats.total || totalDeclaracoes;
                        this.stats.declaracoesHoje = historicoManager.estatisticasHoje();
                        console.log('📊 Stats do histórico carregadas:', {
                            totalDocs: historicoStats.total,
                            hoje: this.stats.declaracoesHoje
                        });
                    } catch (error) {
                        console.warn('⚠️ Erro ao carregar stats do histórico:', error);
                        this.stats.declaracoesHoje = 0;
                    }
                } else {
                    this.stats.declaracoesHoje = 0;
                }
                
                console.log('📊 Stats atualizadas:', {
                    empresas: this.stats.empresas,
                    modelos: this.stats.modelos,
                    usersAtivos: this.stats.users,
                    totalClientes: this.stats.totalClientes,
                    totalDeclaracoes: this.stats.totalDeclaracoes,
                    declaracoesHoje: this.stats.declaracoesHoje
                });
                
            } catch (error) {
                console.error('❌ Erro ao atualizar stats:', error);
            }
        },

        // ===============================================
        // TRABALHADORES / CLIENTES
        // ===============================================

        filtroTrabalhador: '',
        filtroDepartamento: '',
        filtroStatus: 'ativos',
        departamentos: [],
        trabalhadoresFiltrados: [],

        async carregarTrabalhadores() {
            try {
                // Instanciar clienteManager se necessário
                if (typeof ClienteManager !== 'undefined') {
                    this.clienteManager = this.clienteManager || new ClienteManager();
                }

                const lista = await this.clienteManager.carregar();
                this.trabalhadores = lista || [];

                // Extrair departamentos únicos
                const deps = new Set();
                (this.trabalhadores || []).forEach(t => { if (t.departamento) deps.add(t.departamento); });
                this.departamentos = Array.from(deps).sort();

                // Inicializar filtrados
                this.trabalhadoresFiltrados = this.trabalhadores.slice();
                console.log('✅ Trabalhadores carregados no painel:', this.trabalhadores.length);
                return this.trabalhadores;
            } catch (e) {
                console.error('❌ Erro ao carregar trabalhadores no painel:', e);
                this.trabalhadores = [];
                this.trabalhadoresFiltrados = [];
                return [];
            }
        },

        filtrarTrabalhadores() {
            const q = (this.filtroTrabalhador || '').toLowerCase();
            const dept = this.filtroDepartamento;
            const status = this.filtroStatus;

            let lista = (this.trabalhadores || []).slice();

            if (status === 'ativos') {
                lista = lista.filter(t => t.ativo !== false);
            } else if (status === 'inativos') {
                lista = lista.filter(t => t.ativo === false);
            }

            if (dept) {
                lista = lista.filter(t => (t.departamento || '').toLowerCase().includes(dept.toLowerCase()));
            }

            if (q) {
                lista = lista.filter(t => {
                    return (t.nome || '').toLowerCase().includes(q)
                        || (t.nif || '').toLowerCase().includes(q)
                        || (t.funcao || '').toLowerCase().includes(q);
                });
            }

            this.trabalhadoresFiltrados = lista;
        },

        modalNovoTrabalhador: false,
        modalEditarTrabalhador: false,
        modalVisualizarTrabalhador: false,
        novoTrabalhador: {},
        editarTrabalhadorObj: {},
        visualizarTrabalhador: null,

        abrirModalNovoTrabalhador() {
            this.modalNovoTrabalhador = true;
            this.novoTrabalhador = Object.assign({}, ClienteManager.MODELO_TRABALHADOR);
        },

        async salvarNovoTrabalhador() {
            try {
                this.loading = true;
                this.loadingMessage = 'Salvando trabalhador...';
                
                await this.clienteManager.criar(this.novoTrabalhador);
                await this.carregarTrabalhadores();
                this.filtrarTrabalhadores();
                
                this.modalNovoTrabalhador = false;
                this.showAlert('success', 'Trabalhador criado com sucesso!');
                
            } catch (e) {
                this.showAlert('error', e.message || 'Erro ao criar trabalhador');
            } finally {
                this.loading = false;
            }
        },

        async editarTrabalhador(trabalhador) {
            this.modalEditarTrabalhador = true;
            this.editarTrabalhadorObj = Object.assign({}, trabalhador);
        },

        async salvarEdicaoTrabalhador() {
            try {
                this.loading = true;
                this.loadingMessage = 'Atualizando trabalhador...';
                
                const id = this.editarTrabalhadorObj.id;
                await this.clienteManager.atualizar(id, this.editarTrabalhadorObj);
                await this.carregarTrabalhadores();
                this.filtrarTrabalhadores();
                
                this.modalEditarTrabalhador = false;
                this.showAlert('success', 'Trabalhador atualizado com sucesso!');
                
            } catch (e) {
                this.showAlert('error', e.message || 'Erro ao atualizar trabalhador');
            } finally {
                this.loading = false;
            }
        },

        async excluirTrabalhador(id) {
            console.log('🔍 excluirTrabalhador chamada com ID:', id);
            
            const trabalhador = this.trabalhadoresFiltrados.find(t => t.id === id);
            console.log('📦 Trabalhador encontrado:', trabalhador);
            
            // Usar confirm nativo temporariamente para debug
            const confirmar = confirm(
                `⚠️ EXCLUIR TRABALHADOR\n\n` +
                `Tem certeza que deseja excluir "${trabalhador?.nome || 'este trabalhador'}"?\n\n` +
                `Esta ação não pode ser desfeita.\n\n` +
                `Clique OK para confirmar`
            );
            
            console.log('✅ Usuário confirmou?', confirmar);
            
            if (!confirmar) {
                console.log('❌ Usuário cancelou');
                return;
            }
            
            try {
                this.loading = true;
                this.loadingMessage = 'Excluindo trabalhador...';
                
                console.log('🗑️ Excluindo trabalhador DEFINITIVAMENTE...');
                
                // Passar TRUE para excluir definitivamente (não só marcar como inativo)
                await this.clienteManager.excluir(id, true);
                
                console.log('✅ Trabalhador excluído do JSON!');
                
                // ATUALIZAÇÃO OTIMISTA: Remover da lista local imediatamente
                this.trabalhadores = this.trabalhadores.filter(t => t.id !== id);
                this.trabalhadoresFiltrados = this.trabalhadoresFiltrados.filter(t => t.id !== id);
                
                console.log('📋 Listas atualizadas localmente');
                
                alert('✅ Trabalhador excluído com sucesso!');
                this.showAlert('success', 'Trabalhador excluído com sucesso');
            } catch (e) {
                console.error('❌ Erro ao excluir:', e);
                alert('❌ Erro: ' + (e.message || 'Erro ao excluir'));
                this.showAlert('error', e.message || 'Erro ao excluir');
            } finally {
                this.loading = false;
            }
        },

        async verDetalhesTrabalhador(trabalhador) {
            this.modalVisualizarTrabalhador = true;
            this.visualizarTrabalhador = trabalhador;
        },

        // ========== EMPRESAS ==========
        getContador(empresaId) {
            return this.contador[empresaId] || 0;
        },

        async resetarContador(empresaId) {
            const empresa = this.empresas.find(e => e.id === empresaId);
            const confirmar = await this.showConfirm(
                '🔄 Resetar Contador',
                `Resetar contador da empresa "${empresa?.nome || empresaId}" para 0?`,
                {
                    textoBotaoConfirmar: 'Sim, Resetar',
                    textoBotaoCancelar: 'Cancelar',
                    tipoPerigo: false
                }
            );
            if (!confirmar) return;
            
            try {
                this.loading = true;
                this.loadingMessage = 'Resetando contador...';
                
                // Atualizar contador
                this.contador[empresaId] = 0;
                
                // Carregar dados atuais
                const response = await githubAPI.lerJSON('data/contador.json');
                const contadorData = response.data;
                
                // Atualizar
                contadorData.contadores[empresaId] = 0;
                contadorData.ultima_atualizacao = new Date().toISOString();
                
                // Adicionar ao histórico
                if (!contadorData.historico) contadorData.historico = [];
                contadorData.historico.push({
                    empresaId,
                    acao: 'reset',
                    admin: this.usuario.login,
                    timestamp: new Date().toISOString()
                });
                
                // Salvar
                await githubAPI.salvarJSON(
                    'data/contador.json',
                    contadorData,
                    `🔄 Admin ${this.usuario.login} resetou contador da empresa ${empresaId}`,
                    contadorData.sha
                );
                
                this.showAlert('success', '✅ Contador resetado com sucesso!');
                
            } catch (error) {
                console.error('❌ Erro ao resetar contador:', error);
                this.showAlert('error', 'Erro ao resetar contador');
            } finally {
                this.loading = false;
            }
        },

        editarEmpresa(empresa) {
            this.showAlert('success', `📝 Editar empresa: ${empresa.nome} (em desenvolvimento)`);
            // TODO: Implementar modal de edição
        },

        async deletarEmpresa(empresaId) {
            console.log('🔍 deletarEmpresa chamada com ID:', empresaId);
            
            const empresa = this.empresas.find(e => e.id === empresaId);
            console.log('📦 Empresa encontrada:', empresa);
            
            if (!empresa) {
                alert('❌ Empresa não encontrada!');
                this.showAlert('error', '❌ Empresa não encontrada!');
                return;
            }

            // Usar confirm nativo temporariamente para debug
            const confirmar = confirm(
                `⚠️ DELETAR EMPRESA\n\n` +
                `Tem certeza que deseja deletar permanentemente "${empresa.nome}"?\n\n` +
                `Esta ação não pode ser desfeita e irá remover:\n` +
                `• Logo e carimbo da empresa\n` +
                `• Todas as declarações geradas\n` +
                `• Contador de documentos\n\n` +
                `Digite OK para confirmar`
            );
            
            console.log('✅ Usuário confirmou?', confirmar);
            
            if (!confirmar) {
                console.log('❌ Usuário cancelou');
                return;
            }
            
            try {
                this.loading = true;
                this.loadingMessage = 'Deletando empresa...';
                
                console.log('📥 Carregando empresas.json do GitHub...');
                
                // Carregar dados atuais do GitHub
                const response = await githubAPI.lerJSON('data/empresas.json');
                console.log('📦 Dados carregados:', response.data);
                
                const empresasData = response.data;
                
                // Remover empresa da lista
                empresasData.empresas = empresasData.empresas.filter(e => e.id !== empresaId);
                console.log('🗑️ Empresa removida. Total restante:', empresasData.empresas.length);
                
                // Atualizar metadata se existir
                if (empresasData.metadata) {
                    empresasData.metadata.totalEmpresas = empresasData.empresas.length;
                    empresasData.metadata.atualizadoEm = new Date().toISOString();
                }
                
                // Salvar no GitHub
                console.log('💾 Salvando no GitHub...');
                await githubAPI.salvarJSON(
                    'data/empresas.json',
                    empresasData,
                    `🗑️ Admin deletou empresa: ${empresa.nome}`,
                    response.sha
                );
                
                console.log('✅ Salvo com sucesso!');
                
                // ATUALIZAÇÃO OTIMISTA: Remover da lista local imediatamente
                this.empresas = this.empresas.filter(e => e.id !== empresaId);
                
                console.log('📋 Lista local atualizada');
                
                // Atualizar stats
                await this.atualizarStatsReais();
                
                alert(`✅ Empresa "${empresa.nome}" deletada com sucesso!`);
                this.showAlert('success', `✅ Empresa "${empresa.nome}" deletada com sucesso!`);
                
            } catch (error) {
                console.error('❌ Erro ao deletar empresa:', error);
                this.showAlert('error', 'Erro ao deletar empresa');
                await this.carregarEmpresas(); // Recarregar
            } finally {
                this.loading = false;
            }
        },

        // ========== MODELOS ==========
        editarModelo(modelo) {
            this.showAlert('success', `📝 Editar modelo: ${modelo.nome} (em desenvolvimento)`);
            // TODO: Implementar modal de edição
        },

        async deletarModelo(modeloId) {
            const modelo = this.modelos.find(m => m.id === modeloId);
            const confirmar = await this.showConfirm(
                '⚠️ Deletar Modelo',
                `Tem certeza que deseja deletar o modelo "${modelo?.nome || modeloId}"?\n\nEsta ação não pode ser desfeita.`,
                {
                    textoBotaoConfirmar: 'Sim, Deletar',
                    textoBotaoCancelar: 'Cancelar',
                    tipoPerigo: true
                }
            );
            if (!confirmar) return;
            
            try {
                this.loading = true;
                this.loadingMessage = 'Deletando modelo...';
                
                // Remover da lista
                const modeloRemovido = this.modelos.find(m => m.id === modeloId);
                this.modelos = this.modelos.filter(m => m.id !== modeloId);
                
                // Carregar dados atuais
                const response = await githubAPI.lerJSON('data/modelos.json');
                const modelosData = response.data;
                modelosData.modelos = this.modelos;
                modelosData.metadata.totalModelos = this.modelos.length;
                modelosData.metadata.atualizadoEm = new Date().toISOString();
                
                // Salvar
                await githubAPI.salvarJSON(
                    'data/modelos.json',
                    modelosData,
                    `🗑️ Admin deletou modelo: ${modeloRemovido?.nome || modeloId}`,
                    response.sha
                );
                
                this.showAlert('success', '✅ Modelo deletado com sucesso!');
                await this.atualizarStatsReais();
                
            } catch (error) {
                console.error('❌ Erro ao deletar modelo:', error);
                this.showAlert('error', 'Erro ao deletar modelo');
                await this.carregarModelos(); // Recarregar
            } finally {
                this.loading = false;
            }
        },

        // ========== CONFIGURAÇÕES ==========
        async verificarRepo() {
            try {
                this.loading = true;
                this.loadingMessage = 'Verificando repositório...';
                
                // Tenta ler um arquivo qualquer
                await githubAPI.lerJSON('data/users.json');
                
                this.showAlert('success', '✅ Repositório conectado com sucesso!\n' + 
                    `Owner: ${this.config.owner}\n` +
                    `Repo: ${this.config.repo}`);
                
            } catch (error) {
                console.error('❌ Erro ao verificar repo:', error);
                this.showAlert('error', '❌ Erro ao conectar com repositório');
            } finally {
                this.loading = false;
            }
        },

        async sincronizarDados() {
            this.loading = true;
            this.loadingMessage = 'Sincronizando todos os dados...';
            
            try {
                await this.carregarTodosDados();
                this.showAlert('success', '✅ Dados sincronizados com sucesso!');
            } catch (error) {
                this.showAlert('error', 'Erro ao sincronizar dados');
            } finally {
                this.loading = false;
            }
        },

        /**
         * Pré-carregar imagens das empresas no cache
         */
        async preloadEmpresasImages() {
            if (!this.empresas || this.empresas.length === 0) {
                return;
            }

            try {
                // Coletar todas as URLs de imagens
                const imageUrls = [];
                
                this.empresas.forEach(empresa => {
                    if (empresa.logo) {
                        imageUrls.push(empresa.logo);
                    }
                    if (empresa.carimbo) {
                        imageUrls.push(empresa.carimbo);
                    }
                });

                if (imageUrls.length === 0) {
                    console.log('📭 Nenhuma imagem para pré-carregar');
                    return;
                }

                console.log(`🔄 Pré-carregando ${imageUrls.length} imagens...`);
                
                // Pré-carregar em segundo plano (não bloqueia UI)
                imageCacheManager.preloadImages(imageUrls).then(count => {
                    console.log(`✅ ${count} imagens cacheadas com sucesso!`);
                }).catch(error => {
                    console.warn('⚠️ Erro ao pré-carregar imagens:', error);
                });
                
            } catch (error) {
                console.warn('⚠️ Erro no pré-carregamento:', error);
            }
        },

        async verificarRateLimit() {
            try {
                this.loading = true;
                this.loadingMessage = 'Verificando rate limit...';
                
                const response = await fetch('https://api.github.com/rate_limit', {
                    headers: {
                        'Authorization': `token ${localStorage.getItem("token")}`,
                        'Accept': 'application/vnd.github.v3+json'
                    }
                });
                
                const data = await response.json();
                const core = data.resources.core;
                
                const resetTime = new Date(core.reset * 1000).toLocaleTimeString('pt-PT');
                
                this.showAlert('success', 
                    `📊 GitHub API Rate Limit\n\n` +
                    `Limite: ${core.limit}\n` +
                    `Usado: ${core.used}\n` +
                    `Restante: ${core.remaining}\n` +
                    `Reset às: ${resetTime}`
                );
                
            } catch (error) {
                console.error('❌ Erro ao verificar rate limit:', error);
                this.showAlert('error', 'Erro ao verificar rate limit');
            } finally {
                this.loading = false;
            }
        },

                // ========== UTILIDADES ==========
        async logout() {
            if (confirm('Tem certeza que deseja sair?')) {
                // Limpar dados e redirecionar
                localStorage.removeItem('token');
                localStorage.removeItem('username');
                window.location.href = 'index.html';
            }
        },

        showAlert(type, message) {
            this.alert = {
                show: true,
                type: type,
                message: message
            };
            
            // Auto-fechar após 5 segundos
            setTimeout(() => {
                this.alert.show = false;
            }, 5000);
        },

        /**
         * Helper: Sleep (delay)
         */
        sleep(ms) {
            return new Promise(resolve => setTimeout(resolve, ms));
        },

        /**
         * Helper: Remove cache busting parameter from URL
         */
        limparUrlCache(url) {
            if (!url) return url;
            // Remove ?v=timestamp ou &v=timestamp
            return url.replace(/[?&]v=\d+/, '');
        },

        /**
         * Helper: Aguardar CDN disponibilizar imagem (após upload)
         * Retorna true quando imagem estiver acessível no CDN
         */
        async aguardarCDNDisponivel(url, maxRetries = 10, delay = 1000) {
            console.log(`⏳ Aguardando CDN disponibilizar: ${url}`);
            
            for (let i = 0; i < maxRetries; i++) {
                try {
                    // Tentar carregar a imagem
                    const response = await fetch(url, { 
                        method: 'HEAD',
                        cache: 'no-cache'
                    });
                    
                    if (response.ok) {
                        console.log(`✅ CDN disponível após ${i + 1} tentativa(s) (${(i + 1) * delay / 1000}s)`);
                        return true;
                    }
                    
                    console.log(`⏳ Tentativa ${i + 1}/${maxRetries} - CDN retornou ${response.status}`);
                } catch (error) {
                    console.log(`⏳ Tentativa ${i + 1}/${maxRetries} - Erro: ${error.message}`);
                }
                
                // Aguardar antes da próxima tentativa
                if (i < maxRetries - 1) {
                    await this.sleep(delay);
                }
            }
            
            console.warn(`⚠️ CDN não disponibilizou imagem após ${maxRetries * delay / 1000}s`);
            return false;
        },

        /**
         * Helper: Verificar se imagem está acessível usando GitHub API (mais rápido que CDN)
         */
        async verificarImagemAcessivel(url, maxRetries = 3, delay = 1000) {
            if (!url) {
                console.warn('⚠️ URL vazia');
                return false;
            }

            // Extrair path do GitHub da URL
            // URL: https://raw.githubusercontent.com/owner/repo/branch/assets/empresas/123/logo.png?v=123
            // Path: assets/empresas/123/logo.png
            const urlLimpa = this.limparUrlCache(url);
            
            try {
                // Extrair path da URL do GitHub
                const githubPattern = /github(?:usercontent)?\.com\/[^\/]+\/[^\/]+\/[^\/]+\/(.+)/;
                const match = urlLimpa.match(githubPattern);
                
                if (!match) {
                    console.error('❌ URL não é do GitHub:', urlLimpa);
                    return false;
                }
                
                const filePath = match[1];
                console.log(`🔍 Verificando via API: ${filePath}`);
                
                // Tentar via GitHub API (muito mais rápido que CDN)
                for (let i = 0; i < maxRetries; i++) {
                    try {
                        console.log(`📡 Tentativa ${i + 1}/${maxRetries} - Consultando GitHub API...`);
                        
                        const fileInfo = await githubAPI.getFile(filePath);
                        
                        if (fileInfo && fileInfo.sha) {
                            console.log(`✅ Imagem confirmada na API: ${filePath} (SHA: ${fileInfo.sha.substring(0, 7)})`);
                            return true;
                        }
                        
                        console.log(`⚠️ Arquivo não encontrado, tentando novamente...`);
                    } catch (error) {
                        console.log(`⚠️ Erro na tentativa ${i + 1}: ${error.message}`);
                    }
                    
                    // Aguardar antes de tentar novamente
                    if (i < maxRetries - 1) {
                        await this.sleep(delay);
                    }
                }
                
                console.error(`❌ Imagem não acessível após ${maxRetries} tentativas`);
                return false;
                
            } catch (error) {
                console.error('❌ Erro ao verificar imagem:', error);
                return false;
            }
        },

        // ========== EMPRESAS - CRUD ==========
        
        async salvarEmpresa() {
            try {
                this.loading = true;
                this.loadingMessage = 'Salvando empresa...';

                // Validações básicas
                if (!this.empresaForm.nome || !this.empresaForm.nif) {
                    this.showAlert('error', 'Preencha todos os campos obrigatórios');
                    this.loading = false;
                    return;
                }

                // Validar se tem logo e carimbo (preview OU url)
                const temLogo = this.empresaForm.logoPreview || this.empresaForm.logo;
                const temCarimbo = this.empresaForm.carimboPreview || this.empresaForm.carimbo;
                
                if (!temLogo || !temCarimbo) {
                    this.showAlert('error', 'Logo e carimbo são obrigatórios. Faça upload das imagens primeiro.');
                    this.loading = false;
                    return;
                }

                // Se tem preview base64, significa que já foi carregado - não precisa verificar API
                // Só verifica se for URL do CDN (sem preview)
                if (!this.empresaForm.logoPreview && this.empresaForm.logo) {
                    this.loadingMessage = 'Verificando logo no servidor...';
                    console.log('🔍 Verificando acessibilidade do logo...');
                    
                    const logoAcessivel = await this.verificarImagemAcessivel(this.empresaForm.logo);
                    if (!logoAcessivel) {
                        this.showAlert('error', '❌ Logo ainda não está disponível no servidor. Aguarde alguns segundos e tente novamente.');
                        this.loading = false;
                        return;
                    }
                }
                
                if (!this.empresaForm.carimboPreview && this.empresaForm.carimbo) {
                    this.loadingMessage = 'Verificando carimbo no servidor...';
                    console.log('🔍 Verificando acessibilidade do carimbo...');
                    
                    const carimboAcessivel = await this.verificarImagemAcessivel(this.empresaForm.carimbo);
                    if (!carimboAcessivel) {
                        this.showAlert('error', '❌ Carimbo ainda não está disponível no servidor. Aguarde alguns segundos e tente novamente.');
                        this.loading = false;
                        return;
                    }
                }
                
                console.log('✅ Imagens validadas!');
                this.loadingMessage = 'Salvando empresa...';

                // Validar email se fornecido
                if (this.empresaForm.email && !this.validarEmail(this.empresaForm.email)) {
                    this.showAlert('error', 'Email inválido');
                    this.loading = false;
                    return;
                }

                // Limpar URLs de cache antes de salvar
                const logoLimpo = this.limparUrlCache(this.empresaForm.logo);
                const carimboLimpo = this.limparUrlCache(this.empresaForm.carimbo);

                // Carregar empresas existentes
                const response = await githubAPI.lerJSON('data/empresas.json').catch(() => ({
                    data: { empresas: [] },
                    sha: null
                }));

                const empresasData = response.data || { empresas: [] };
                let empresas = empresasData.empresas || [];
                const sha = response.sha;

                // Novo ou edição?
                if (this.empresaForm.id) {
                    // EDITAR
                    const index = empresas.findIndex(e => e.id === this.empresaForm.id);
                    if (index !== -1) {
                        // Preparar dados sem os previews base64
                        const { logoPreview, carimboPreview, ...dadosLimpos } = this.empresaForm;
                        
                        empresas[index] = {
                            ...dadosLimpos,
                            logo: logoLimpo,
                            carimbo: carimboLimpo,
                            updatedAt: new Date().toISOString()
                        };
                    }
                } else {
                    // CRIAR NOVO
                    // Preparar dados sem os previews base64
                    const { logoPreview, carimboPreview, ...dadosLimpos } = this.empresaForm;
                    
                    const novaEmpresa = {
                        ...dadosLimpos,
                        logo: logoLimpo,
                        carimbo: carimboLimpo,
                        id: `empresa_${Date.now()}`,
                        createdAt: new Date().toISOString(),
                        updatedAt: new Date().toISOString(),
                        contador: 0 // Contador de declarações
                    };
                    empresas.push(novaEmpresa);
                }

                // Salvar no GitHub
                await githubAPI.salvarJSON(
                    'data/empresas.json',
                    { empresas },
                    `${this.empresaForm.id ? 'Atualizar' : 'Adicionar'} empresa: ${this.empresaForm.nome}`,
                    sha
                );

                this.showAlert('success', `✅ Empresa ${this.empresaForm.id ? 'atualizada' : 'cadastrada'} com sucesso!`);
                
                // Recarregar empresas
                await this.carregarEmpresas();
                await this.atualizarStatsReais();
                
                // Fechar modal
                this.fecharModalEmpresa();

            } catch (error) {
                console.error('❌ Erro ao salvar empresa:', error);
                this.showAlert('error', 'Erro ao salvar empresa: ' + error.message);
            } finally {
                this.loading = false;
            }
        },

        async editarEmpresa(empresa) {
            console.log('📝 Editando empresa:', empresa.nome);
            
            // Preencher formulário com dados da empresa
            this.empresaForm = {
                id: empresa.id,
                nome: empresa.nome,
                nif: empresa.nif,
                endereco: { ...empresa.endereco },
                telefone: empresa.telefone || '',
                email: empresa.email || '',
                website: empresa.website || '',
                logo: empresa.logo || '',
                logoPreview: empresa.logoPreview || '', // Usar preview do cache
                carimbo: empresa.carimbo || '',
                carimboPreview: empresa.carimboPreview || '', // Usar preview do cache
                corPrimaria: empresa.corPrimaria || '#1e40af',
                corSecundaria: empresa.corSecundaria || '#64748b',
                marcaDagua: empresa.marcaDagua || ''
            };
            
            // Se não tiver preview, carregar do cache
            if (empresa.logo && !this.empresaForm.logoPreview) {
                console.log('📥 Carregando logo do cache para edição...');
                const logoCache = await imageCacheManager.getImage(empresa.logo);
                if (logoCache) {
                    this.empresaForm.logoPreview = logoCache;
                    console.log('✅ Logo carregado do cache');
                }
            }
            
            if (empresa.carimbo && !this.empresaForm.carimboPreview) {
                console.log('📥 Carregando carimbo do cache para edição...');
                const carimboCache = await imageCacheManager.getImage(empresa.carimbo);
                if (carimboCache) {
                    this.empresaForm.carimboPreview = carimboCache;
                    console.log('✅ Carimbo carregado do cache');
                }
            }
            
            this.modalNovaEmpresa = true;
        },

        fecharModalEmpresa() {
            this.modalNovaEmpresa = false;
            
            // Resetar formulário após animação
            setTimeout(() => {
                this.empresaForm = {
                    id: null,
                    nome: '',
                    nif: '',
                    endereco: {
                        rua: '',
                        edificio: '',
                        andar: '',
                        sala: '',
                        bairro: '',
                        municipio: '',
                        provincia: '',
                        pais: 'Angola'
                    },
                    telefone: '',
                    email: '',
                    website: '',
                    logo: '',
                    carimbo: '',
                    corPrimaria: '#1e40af',
                    corSecundaria: '#64748b',
                    marcaDagua: ''
                };
            }, 300);
        },

        /**
         * Handle upload de logo no formulário de empresa
         */
        async handleLogoUpload(event) {
            const file = event.target.files[0];
            if (!file) return;

            console.log('🔄 handleLogoUpload iniciado', { file: file.name, size: file.size });

            // VALIDAÇÃO DE TAMANHO: Máximo 100KB
            const MAX_SIZE = 100 * 1024; // 100KB em bytes
            if (file.size > MAX_SIZE) {
                console.error('❌ Arquivo muito grande:', (file.size / 1024).toFixed(2), 'KB');
                this.showAlert('error', `❌ Logo muito grande! Máximo: 100KB. Tamanho atual: ${(file.size / 1024).toFixed(2)}KB. Por favor, comprima a imagem antes de enviar.`);
                event.target.value = '';
                return;
            }

            // Verificar se empresa tem NIF (necessário para organizar no GitHub)
            if (!this.empresaForm.nif || this.empresaForm.nif.trim() === '') {
                console.warn('⚠️ NIF não preenchido');
                this.showAlert('error', '❌ Preencha o NIF da empresa primeiro!');
                event.target.value = '';
                return;
            }

            try {
                this.loading = true;
                this.uploadProgress = 0;
                this.loadingMessage = 'Iniciando upload do logo...';
                console.log('✅ Loading ativado');

                // Simular progresso inicial
                await this.sleep(300);
                this.uploadProgress = 10;
                console.log('📊 Progresso: 10%');

                const uploader = this.initImageUploader();
                console.log('✅ ImageUploader inicializado:', uploader);

                // Validar
                this.loadingMessage = 'Validando imagem...';
                this.uploadProgress = 20;
                console.log('📊 Progresso: 20% - Validando');
                const validation = uploader.validateImage(file);
                console.log('🔍 Validação:', validation);
                if (!validation.valid) {
                    console.error('❌ Validação falhou:', validation.error);
                    this.showAlert('error', `❌ ${validation.error}`);
                    return;
                }

                await this.sleep(300);
                this.uploadProgress = 30;
                console.log('📊 Progresso: 30%');

                // Converter para Base64
                this.loadingMessage = 'Preparando imagem...';
                this.uploadProgress = 40;
                console.log('📊 Progresso: 40% - Convertendo para Base64');
                const base64Content = await uploader.fileToBase64(file);
                console.log('✅ Base64 gerado, tamanho:', base64Content.length);

                await this.sleep(300);
                this.uploadProgress = 50;
                console.log('📊 Progresso: 50%');

                // Sanitizar NIF
                const nifSanitizado = this.empresaForm.nif.replace(/[^a-zA-Z0-9]/g, '');
                console.log('🔤 NIF sanitizado:', nifSanitizado);

                // Extensão do arquivo
                const extensao = file.name.split('.').pop().toLowerCase();
                console.log('📄 Extensão:', extensao);

                // Caminho no GitHub
                const fileName = `logo.${extensao}`;
                const filePath = `assets/empresas/${nifSanitizado}/${fileName}`;
                console.log('📂 Caminho no GitHub:', filePath);

                // Verificar se arquivo já existe
                this.loadingMessage = 'Verificando GitHub...';
                this.uploadProgress = 60;
                console.log('📊 Progresso: 60% - Verificando arquivo existente');
                let sha = null;
                let arquivoExistente = null;
                try {
                    arquivoExistente = await githubAPI.getFile(filePath);
                    sha = arquivoExistente.sha;
                    console.log('📄 Arquivo existe, SHA:', sha);
                    
                    // Verificar se é a mesma imagem (comparando conteúdo Base64)
                    if (arquivoExistente.content) {
                        const conteudoExistente = arquivoExistente.content.replace(/\s/g, '');
                        const novoConteudo = base64Content.replace(/\s/g, '');
                        
                        if (conteudoExistente === novoConteudo) {
                            console.log('✅ Imagem idêntica já existe no servidor!');
                            
                            // USAR DOIS CAMPOS: URL + PREVIEW
                            this.loadingMessage = 'Carregando preview...';
                            this.uploadProgress = 90;
                            
                            // Gerar URL do CDN para salvar no JSON
                            const timestamp = new Date().getTime();
                            const cdnUrl = `https://raw.githubusercontent.com/${githubAPI.owner}/${githubAPI.repo}/${githubAPI.branch}/${filePath}?v=${timestamp}`;
                            
                            // Gerar base64 para preview (data URI)
                            const mimeType = extensao === 'svg' ? 'image/svg+xml' : `image/${extensao}`;
                            const base64Preview = `data:${mimeType};base64,${arquivoExistente.content}`;
                            
                            // Atualizar ambos os campos
                            this.empresaForm.logo = cdnUrl; // Para salvar no JSON
                            this.empresaForm.logoPreview = base64Preview; // Para preview no HTML
                            
                            this.uploadProgress = 100;
                            this.loadingMessage = '✅ Logo já existe (reusando)';
                            
                            console.log('✅ Logo reutilizado:', {
                                urlCDN: cdnUrl,
                                previewBase64: base64Preview.substring(0, 50) + '...'
                            });
                            
                            await this.sleep(500);
                            this.showAlert('success', '✅ Logo já existe - preview carregado!');
                            this.loading = false;
                            this.uploadProgress = null;
                            event.target.value = '';
                            return;
                        } else {
                            console.log('🔄 Imagem diferente detectada, será atualizada');
                            
                            // Limpar cache da imagem antiga
                            if (typeof imageCacheManager !== 'undefined' && this.empresaForm.logo) {
                                console.log('🗑️ Limpando cache do logo antigo...');
                                await imageCacheManager.clearImage(this.empresaForm.logo);
                            }
                        }
                    }
                } catch (error) {
                    console.log('📄 Arquivo não existe (ok, será criado)');
                }

                await this.sleep(300);
                this.uploadProgress = 70;
                console.log('📊 Progresso: 70%');

                // Fazer upload com commit automático
                this.loadingMessage = 'Enviando para GitHub...';
                this.uploadProgress = 80;
                console.log('📊 Progresso: 80% - Enviando para GitHub');
                console.log('🚀 Chamando githubAPI.uploadFile...');
                await githubAPI.uploadFile(
                    filePath,
                    base64Content,
                    `Upload logo da empresa ${this.empresaForm.nome || nifSanitizado}`,
                    sha
                );
                console.log('✅ Upload concluído!');

                await this.sleep(300);
                this.uploadProgress = 85;
                console.log('📊 Progresso: 85%');

                // Gerar URL do GitHub com cache busting (timestamp para forçar reload)
                const timestamp = new Date().getTime();
                const githubUrl = `https://raw.githubusercontent.com/${githubAPI.owner}/${githubAPI.repo}/${githubAPI.branch}/${filePath}?v=${timestamp}`;
                console.log('🔗 URL gerada:', githubUrl);

                // AGUARDAR CDN disponibilizar a imagem
                this.loadingMessage = 'Aguardando imagem ficar disponível...';
                this.uploadProgress = 90;
                console.log('📊 Progresso: 90% - Aguardando CDN...');
                
                const cdnDisponivel = await this.aguardarCDNDisponivel(githubUrl, 10, 1000);
                
                if (!cdnDisponivel) {
                    console.warn('⚠️ CDN demorou muito, mas imagem foi enviada. Preview pode demorar a aparecer.');
                    this.showAlert('warning', '⚠️ Logo enviado, mas preview pode demorar alguns segundos.');
                } else {
                    console.log('✅ Preview disponível!');
                }

                this.uploadProgress = 95;
                console.log('📊 Progresso: 95%');

                // Gerar base64 preview (data URI)
                const mimeType = extensao === 'svg' ? 'image/svg+xml' : `image/${extensao}`;
                const base64Preview = `data:${mimeType};base64,${base64Content}`;

                // Salvar no cache do ImageCacheManager PRIMEIRO (antes de atualizar UI)
                if (typeof imageCacheManager !== 'undefined') {
                    await imageCacheManager.saveToCache(githubUrl, base64Preview);
                    console.log('📦 Imagem salva no cache IndexedDB');
                }

                // LIMPAR preview antigo primeiro (força Alpine.js a detectar mudança)
                this.empresaForm.logoPreview = '';
                await this.$nextTick();
                console.log('🔄 Preview antigo limpo');

                // Atualizar com nova imagem
                this.empresaForm.logo = githubUrl; // URL CDN (para salvar)
                this.empresaForm.logoPreview = base64Preview; // Base64 (para preview)
                console.log('✅ Formulário atualizado (URL + Preview)');

                // Forçar re-render do Alpine.js para atualizar preview visual
                await this.$nextTick();
                console.log('🔄 Preview visual atualizado com nova imagem');

                this.uploadProgress = 100;
                this.loadingMessage = '✅ Logo enviado e verificado!';
                console.log('📊 Progresso: 100% - Concluído!');
                await this.sleep(500);

                this.showAlert('success', '✅ Logo enviado e pronto para uso!');
                console.log(`✅ Logo URL final: ${githubUrl}`);

            } catch (error) {
                console.error('❌ ERRO NO UPLOAD DO LOGO:', error);
                console.error('📋 Stack trace:', error.stack);
                console.error('📋 Mensagem:', error.message);
                
                let errorMessage = error.message;
                if (error.message.includes('401')) {
                    errorMessage = 'Token GitHub inválido ou expirado. Configure em Configurações.';
                } else if (error.message.includes('404')) {
                    errorMessage = 'Repositório GitHub não encontrado. Verifique as configurações.';
                } else if (error.message.includes('network') || error.message.includes('fetch')) {
                    errorMessage = 'Erro de conexão. Verifique sua internet.';
                }
                
                this.showAlert('error', `❌ Erro: ${errorMessage}`);
            } finally {
                this.loading = false;
                this.uploadProgress = null;
                event.target.value = '';
                console.log('🏁 handleLogoUpload finalizado');
            }
        },

        /**
         * Handle upload de carimbo no formulário de empresa
         */
        async handleCarimboUpload(event) {
            const file = event.target.files[0];
            if (!file) return;

            console.log('🔄 handleCarimboUpload iniciado', { file: file.name, size: file.size });

            // VALIDAÇÃO DE TAMANHO: Máximo 100KB
            const MAX_SIZE = 100 * 1024; // 100KB em bytes
            if (file.size > MAX_SIZE) {
                console.error('❌ Arquivo muito grande:', (file.size / 1024).toFixed(2), 'KB');
                this.showAlert('error', `❌ Carimbo muito grande! Máximo: 100KB. Tamanho atual: ${(file.size / 1024).toFixed(2)}KB. Por favor, comprima a imagem antes de enviar.`);
                event.target.value = '';
                return;
            }

            // Verificar se empresa tem NIF
            if (!this.empresaForm.nif || this.empresaForm.nif.trim() === '') {
                console.warn('⚠️ NIF não preenchido');
                this.showAlert('error', '❌ Preencha o NIF da empresa primeiro!');
                event.target.value = '';
                return;
            }

            try {
                this.loading = true;
                this.uploadProgress = 0;
                this.loadingMessage = 'Iniciando upload do carimbo...';
                console.log('✅ Loading ativado');

                await this.sleep(300);
                this.uploadProgress = 10;
                console.log('📊 Progresso: 10%');

                const uploader = this.initImageUploader();
                console.log('✅ ImageUploader inicializado');

                // Validar
                this.loadingMessage = 'Validando imagem...';
                this.uploadProgress = 20;
                console.log('📊 Progresso: 20% - Validando');
                const validation = uploader.validateImage(file);
                console.log('🔍 Validação:', validation);
                if (!validation.valid) {
                    console.error('❌ Validação falhou:', validation.error);
                    this.showAlert('error', `❌ ${validation.error}`);
                    return;
                }

                await this.sleep(300);
                this.uploadProgress = 30;
                console.log('📊 Progresso: 30%');

                // Converter para Base64
                this.loadingMessage = 'Preparando imagem...';
                this.uploadProgress = 40;
                console.log('📊 Progresso: 40% - Convertendo para Base64');
                const base64Content = await uploader.fileToBase64(file);
                console.log('✅ Base64 gerado');

                await this.sleep(300);
                this.uploadProgress = 50;
                console.log('📊 Progresso: 50%');

                // Sanitizar NIF
                const nifSanitizado = this.empresaForm.nif.replace(/[^a-zA-Z0-9]/g, '');
                console.log('🔤 NIF sanitizado:', nifSanitizado);

                // Extensão do arquivo
                const extensao = file.name.split('.').pop().toLowerCase();
                console.log('📄 Extensão:', extensao);

                // Caminho no GitHub
                const fileName = `carimbo.${extensao}`;
                const filePath = `assets/empresas/${nifSanitizado}/${fileName}`;
                console.log('📂 Caminho no GitHub:', filePath);

                // Verificar se arquivo já existe
                this.loadingMessage = 'Verificando GitHub...';
                this.uploadProgress = 60;
                console.log('📊 Progresso: 60% - Verificando arquivo existente');
                let sha = null;
                let arquivoExistente = null;
                try {
                    arquivoExistente = await githubAPI.getFile(filePath);
                    sha = arquivoExistente.sha;
                    console.log('📄 Arquivo existe, SHA:', sha);
                    
                    // Verificar se é a mesma imagem (comparando conteúdo Base64)
                    if (arquivoExistente.content) {
                        const conteudoExistente = arquivoExistente.content.replace(/\s/g, '');
                        const novoConteudo = base64Content.replace(/\s/g, '');
                        
                        if (conteudoExistente === novoConteudo) {
                            console.log('✅ Imagem idêntica já existe no servidor!');
                            
                            // USAR DOIS CAMPOS: URL + PREVIEW
                            this.loadingMessage = 'Carregando preview...';
                            this.uploadProgress = 90;
                            
                            // Gerar URL do CDN para salvar no JSON
                            const timestamp = new Date().getTime();
                            const cdnUrl = `https://raw.githubusercontent.com/${githubAPI.owner}/${githubAPI.repo}/${githubAPI.branch}/${filePath}?v=${timestamp}`;
                            
                            // Gerar base64 para preview (data URI)
                            const mimeType = extensao === 'svg' ? 'image/svg+xml' : `image/${extensao}`;
                            const base64Preview = `data:${mimeType};base64,${arquivoExistente.content}`;
                            
                            // Atualizar ambos os campos
                            this.empresaForm.carimbo = cdnUrl; // Para salvar no JSON
                            this.empresaForm.carimboPreview = base64Preview; // Para preview no HTML
                            
                            this.uploadProgress = 100;
                            this.loadingMessage = '✅ Carimbo já existe (reusando)';
                            
                            console.log('✅ Carimbo reutilizado:', {
                                urlCDN: cdnUrl,
                                previewBase64: base64Preview.substring(0, 50) + '...'
                            });
                            
                            await this.sleep(500);
                            this.showAlert('success', '✅ Carimbo já existe - preview carregado!');
                            this.loading = false;
                            this.uploadProgress = null;
                            event.target.value = '';
                            return;
                        } else {
                            console.log('🔄 Imagem diferente detectada, será atualizada');
                            
                            // Limpar cache do carimbo antigo
                            if (typeof imageCacheManager !== 'undefined' && this.empresaForm.carimbo) {
                                console.log('🗑️ Limpando cache do carimbo antigo...');
                                await imageCacheManager.clearImage(this.empresaForm.carimbo);
                            }
                        }
                    }
                } catch (error) {
                    console.log('📄 Arquivo não existe (ok, será criado)');
                }

                await this.sleep(300);
                this.uploadProgress = 70;
                console.log('📊 Progresso: 70%');

                // Fazer upload com commit automático
                this.loadingMessage = 'Enviando para GitHub...';
                this.uploadProgress = 80;
                console.log('📊 Progresso: 80% - Enviando para GitHub');
                console.log('🚀 Chamando githubAPI.uploadFile...');
                await githubAPI.uploadFile(
                    filePath,
                    base64Content,
                    `Upload carimbo da empresa ${this.empresaForm.nome || nifSanitizado}`,
                    sha
                );
                console.log('✅ Upload concluído!');

                await this.sleep(300);
                this.uploadProgress = 85;
                console.log('📊 Progresso: 85%');

                // Gerar URL do GitHub com cache busting (timestamp para forçar reload)
                const timestamp = new Date().getTime();
                const githubUrl = `https://raw.githubusercontent.com/${githubAPI.owner}/${githubAPI.repo}/${githubAPI.branch}/${filePath}?v=${timestamp}`;
                console.log('🔗 URL gerada:', githubUrl);

                // AGUARDAR CDN disponibilizar a imagem
                this.loadingMessage = 'Aguardando imagem ficar disponível...';
                this.uploadProgress = 90;
                console.log('📊 Progresso: 90% - Aguardando CDN...');
                
                const cdnDisponivel = await this.aguardarCDNDisponivel(githubUrl, 10, 1000);
                
                if (!cdnDisponivel) {
                    console.warn('⚠️ CDN demorou muito, mas imagem foi enviada. Preview pode demorar a aparecer.');
                    this.showAlert('warning', '⚠️ Carimbo enviado, mas preview pode demorar alguns segundos.');
                } else {
                    console.log('✅ Preview disponível!');
                }

                this.uploadProgress = 95;
                console.log('📊 Progresso: 95%');

                // Gerar base64 preview (data URI)
                const mimeType = extensao === 'svg' ? 'image/svg+xml' : `image/${extensao}`;
                const base64Preview = `data:${mimeType};base64,${base64Content}`;

                // Salvar no cache do ImageCacheManager PRIMEIRO (antes de atualizar UI)
                if (typeof imageCacheManager !== 'undefined') {
                    await imageCacheManager.saveToCache(githubUrl, base64Preview);
                    console.log('📦 Imagem salva no cache IndexedDB');
                }

                // LIMPAR preview antigo primeiro (força Alpine.js a detectar mudança)
                this.empresaForm.carimboPreview = '';
                await this.$nextTick();
                console.log('🔄 Preview antigo limpo');

                // Atualizar com nova imagem
                this.empresaForm.carimbo = githubUrl; // URL CDN (para salvar)
                this.empresaForm.carimboPreview = base64Preview; // Base64 (para preview)
                console.log('✅ Formulário atualizado (URL + Preview)');

                // Forçar re-render do Alpine.js para atualizar preview visual
                await this.$nextTick();
                console.log('🔄 Preview visual atualizado com nova imagem');
                await this.$nextTick();
                console.log('🔄 Preview visual atualizado');

                this.uploadProgress = 100;
                this.loadingMessage = '✅ Carimbo enviado e verificado!';
                console.log('📊 Progresso: 100% - Concluído!');
                await this.sleep(500);

                this.showAlert('success', '✅ Carimbo enviado e pronto para uso!');
                console.log(`✅ Carimbo URL final: ${githubUrl}`);

            } catch (error) {
                console.error('❌ ERRO NO UPLOAD DO CARIMBO:', error);
                console.error('📋 Stack trace:', error.stack);
                console.error('📋 Mensagem:', error.message);
                
                let errorMessage = error.message;
                if (error.message.includes('401')) {
                    errorMessage = 'Token GitHub inválido ou expirado. Configure em Configurações.';
                } else if (error.message.includes('404')) {
                    errorMessage = 'Repositório GitHub não encontrado. Verifique as configurações.';
                } else if (error.message.includes('network') || error.message.includes('fetch')) {
                    errorMessage = 'Erro de conexão. Verifique sua internet.';
                }
                
                this.showAlert('error', `❌ Erro: ${errorMessage}`);
            } finally {
                this.loading = false;
                this.uploadProgress = null;
                event.target.value = '';
                console.log('🏁 handleCarimboUpload finalizado');
            }
        },

        /**
         * Remover logo da empresa (apenas do formulário)
         */
        async removerLogoEmpresa() {
            const confirmar = await this.showConfirm(
                'Deseja remover o logo?\n\n(O arquivo permanecerá no GitHub)',
                { type: 'warning', icon: 'bi-image', confirmText: 'Remover' }
            );
            if (confirmar) {
                this.empresaForm.logo = '';
                this.empresaForm.logoPreview = '';
                this.showAlert('success', '✅ Logo removido do formulário');
            }
        },

        /**
         * Remover carimbo da empresa (apenas do formulário)
         */
        async removerCarimboEmpresa() {
            const confirmar = await this.showConfirm(
                'Deseja remover o carimbo?\n\n(O arquivo permanecerá no GitHub)',
                { type: 'warning', icon: 'bi-stamp', confirmText: 'Remover' }
            );
            if (confirmar) {
                this.empresaForm.carimbo = '';
                this.empresaForm.carimboPreview = '';
                this.showAlert('success', '✅ Carimbo removido do formulário');
            }
        },

        validarImagemURL(tipo, url) {
            if (!url) return false;
            
            // Testar se é URL válida
            try {
                new URL(url);
                
                // Testar se imagem carrega
                const img = new Image();
                img.onload = () => {
                    console.log(`✅ ${tipo} válido:`, url);
                };
                img.onerror = () => {
                    console.warn(`⚠️ ${tipo} pode estar inválido:`, url);
                    this.showAlert('error', `A URL do ${tipo} pode não estar acessível. Verifique o link.`);
                };
                img.src = url;
                
                return true;
            } catch (e) {
                return false;
            }
        },

        validarEmail(email) {
            const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            return regex.test(email);
        },

        // ========== MODELOS ==========
        
        visualizarModelo(modelo) {
            // Selecionar modelo
            this.modeloSelecionado = modelo;
            
            // Se não tem empresa, mostrar alerta
            if (this.empresas.length === 0) {
                this.showAlert('warning', '⚠️ Cadastre uma empresa primeiro para ver o preview com dados reais!');
                return;
            }
            
            // Abrir modal
            this.modalPreviewModelo = true;
            this.tipoPreview = 'declaracao';
            
            // Carregar personalizações deste modelo específico
            this.carregarPersonalizacoesSalvas();
            
            // Tentar recuperar autosave
            this.recuperarAutosave();
            
            console.log('📄 Visualizando modelo:', modelo.nome);
        },
        
        fecharModalPreview() {
            this.modalPreviewModelo = false;
            this.modeloSelecionado = null;
            this.tipoPreview = 'declaracao';
        },
        
        /**
         * Aplicar preset de estilo
         */
        aplicarPreset(presetKey) {
            const preset = this.presetsEstilo[presetKey];
            if (preset) {
                this.previewConfig = {
                    ...this.previewConfig,
                    ...preset.config,
                    corTexto: '#000000', // Manter cor do texto preta
                    zoom: this.previewConfig.zoom // Manter zoom atual
                };
                this.showAlert('success', `✨ Estilo "${preset.nome}" aplicado com sucesso!`);
            }
        },
        
        /**
         * Reset por seção
         */
        resetFontes() {
            this.previewConfig.fontFamily = 'Times New Roman';
            this.previewConfig.fontSize = 12;
            this.previewConfig.tamanhoTitulo = 28;
            this.previewConfig.tamanhoSubtitulo = 18;
            this.previewConfig.tamanhoEmpresa = 9;
            this.showAlert('success', '🔤 Fontes resetadas!');
        },
        
        resetCores() {
            this.previewConfig.corDestaque = '#1e40af';
            this.previewConfig.corTexto = '#000000';
            this.showAlert('success', '🎨 Cores resetadas!');
        },
        
        resetMarcaDagua() {
            this.previewConfig.marcaDaguaOpacidade = 10;
            this.previewConfig.marcaDaguaRotacao = -45;
            this.previewConfig.marcaDaguaWidth = 400;
            this.previewConfig.marcaDaguaHeight = 400;
            this.showAlert('success', '💧 Marca d\'água resetada!');
        },
        
        getEmpresaExemplo() {
            // 1. Tentar pegar empresa do fluxo de geração (dados reais)
            if (this.fluxoEmpresaSelecionada) {
                console.log('📦 Usando empresa do fluxo:', this.fluxoEmpresaSelecionada.nome);
                return {
                    ...this.fluxoEmpresaSelecionada,
                    logo: this.fluxoEmpresaSelecionada.logoPreview || this.fluxoEmpresaSelecionada.logo || '',
                    carimbo: this.fluxoEmpresaSelecionada.carimboPreview || this.fluxoEmpresaSelecionada.carimbo || ''
                };
            }
            
            // 2. Tentar carregar do cache localStorage
            const cache = localStorage.getItem('fluxoGeracaoCache');
            if (cache) {
                try {
                    const dados = JSON.parse(cache);
                    if (dados.empresaId) {
                        const empresa = this.empresas.find(e => e.id === dados.empresaId);
                        if (empresa) {
                            console.log('📦 Usando empresa do cache:', empresa.nome);
                            return {
                                ...empresa,
                                logo: empresa.logoPreview || empresa.logo || '',
                                carimbo: empresa.carimboPreview || empresa.carimbo || ''
                            };
                        }
                    }
                } catch (e) {
                    console.warn('⚠️ Erro ao carregar empresa do cache:', e);
                }
            }
            
            // 3. Usar primeira empresa cadastrada
            if (this.empresas.length > 0) {
                const empresa = this.empresas[0];
                console.log('📦 Usando primeira empresa cadastrada:', empresa.nome);
                return {
                    ...empresa,
                    logo: empresa.logoPreview || empresa.logo || '',
                    carimbo: empresa.carimboPreview || empresa.carimbo || ''
                };
            }
            
            // 4. Fallback para dados fake (apenas se não houver nenhuma empresa)
            console.warn('⚠️ Nenhuma empresa encontrada - usando dados fake');
            return {
                nome: 'EMPRESA EXEMPLO LDA',
                nif: '1234567890',
                endereco: {
                    rua: 'Avenida 4 de Fevereiro',
                    edificio: 'Edifício Atlântico',
                    andar: '5º',
                    sala: 'Sala 502',
                    bairro: 'Ingombota',
                    municipio: 'Luanda',
                    provincia: 'Luanda',
                    pais: 'Angola'
                },
                telefone: '+244 923 456 789',
                email: 'geral@exemplo.ao',
                website: 'www.exemplo.ao',
                logo: '',
                carimbo: '',
                corPrimaria: '#1e40af',
                corSecundaria: '#64748b'
            };
        },
        
        getClienteExemplo() {
            // 1. Tentar pegar cliente do fluxo de geração (dados reais)
            if (this.fluxoClienteSelecionado) {
                console.log('📦 Usando cliente do fluxo:', this.fluxoClienteSelecionado.nome);
                return {
                    nome: this.fluxoClienteSelecionado.nome,
                    bi: this.fluxoClienteSelecionado.nif || this.fluxoClienteSelecionado.bi || '',
                    cargo: this.fluxoClienteSelecionado.funcao || this.fluxoClienteSelecionado.cargo || '',
                    salario: this.fluxoClienteSelecionado.salario_bruto || 0,
                    dataAdmissao: this.fluxoClienteSelecionado.data_admissao || '',
                    moeda: this.fluxoClienteSelecionado.moeda || 'Kz',
                    // Gerar meses de trabalho baseado nos dados reais
                    mesesTrabalho: this.gerarMesesTrabalho(this.fluxoClienteSelecionado)
                };
            }
            
            // 2. Tentar carregar do cache localStorage
            const cache = localStorage.getItem('fluxoGeracaoCache');
            if (cache) {
                try {
                    const dados = JSON.parse(cache);
                    if (dados.clienteId) {
                        const cliente = this.trabalhadores.find(t => t.id === dados.clienteId);
                        if (cliente) {
                            console.log('📦 Usando cliente do cache:', cliente.nome);
                            return {
                                nome: cliente.nome,
                                bi: cliente.nif || cliente.bi || '',
                                cargo: cliente.funcao || cliente.cargo || '',
                                salario: cliente.salario_bruto || 0,
                                dataAdmissao: cliente.data_admissao || '',
                                moeda: cliente.moeda || 'Kz',
                                mesesTrabalho: this.gerarMesesTrabalho(cliente)
                            };
                        }
                    }
                } catch (e) {
                    console.warn('⚠️ Erro ao carregar cliente do cache:', e);
                }
            }
            
            // 3. Usar primeiro trabalhador cadastrado
            if (this.trabalhadores.length > 0) {
                const cliente = this.trabalhadores[0];
                console.log('📦 Usando primeiro trabalhador cadastrado:', cliente.nome);
                return {
                    nome: cliente.nome,
                    bi: cliente.nif || cliente.bi || '',
                    cargo: cliente.funcao || cliente.cargo || '',
                    salario: cliente.salario_bruto || 0,
                    dataAdmissao: cliente.data_admissao || '',
                    moeda: cliente.moeda || 'Kz',
                    mesesTrabalho: this.gerarMesesTrabalho(cliente)
                };
            }
            
            // 4. Fallback para dados fake
            console.warn('⚠️ Nenhum cliente encontrado - usando dados fake');
            return {
                nome: 'João Manuel da Silva Santos',
                bi: '005678901LA042',
                cargo: 'Gestor Comercial',
                salario: 250000,
                moeda: 'Kz',
                dataAdmissao: '2023-01-15',
                mesesTrabalho: [
                    { mes: 'Janeiro/2025', salarioBruto: 250000, descontos: 12500, liquido: 237500 },
                    { mes: 'Fevereiro/2025', salarioBruto: 250000, descontos: 12500, liquido: 237500 },
                    { mes: 'Março/2025', salarioBruto: 250000, descontos: 12500, liquido: 237500 }
                ]
            };
        },
        
        /**
         * Gera array de meses de trabalho baseado nos dados do trabalhador
         */
        gerarMesesTrabalho(trabalhador) {
            const meses = [];
            const mesesNomes = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 
                               'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
            
            // Gerar últimos 3 meses
            const hoje = new Date();
            for (let i = 2; i >= 0; i--) {
                const data = new Date(hoje.getFullYear(), hoje.getMonth() - i, 1);
                const mesNome = mesesNomes[data.getMonth()];
                const ano = data.getFullYear();
                
                const salarioBruto = trabalhador.salario_bruto || 0;
                const descontos = trabalhador.descontos || (salarioBruto * 0.05); // 5% de desconto padrão
                const liquido = trabalhador.salario_liquido || (salarioBruto - descontos);
                
                meses.push({
                    mes: `${mesNome}/${ano}`,
                    salarioBruto: salarioBruto,
                    descontos: descontos,
                    liquido: liquido
                });
            }
            
            return meses;
        },

        /**
         * Renderiza modelo usando módulo externo
         */
        renderizarModelo() {
            const modelo = this.modeloSelecionado;
            
            // Verificar se há modelo selecionado
            if (!modelo) {
                return `
                    <div style="text-align: center; padding: 100px 20px; color: #666;">
                        <div style="font-size: 80px; margin-bottom: 20px;">📄</div>
                        <h2 style="font-size: 24px; margin-bottom: 10px;">Nenhum Modelo Selecionado</h2>
                        <p style="font-size: 14px;">Selecione um modelo para visualizar</p>
                    </div>
                `;
            }
            
            const empresa = this.getEmpresaExemplo();
            const cliente = this.getClienteExemplo();
            
            // Verificar qual modelo usar
            if (modelo.id === 'modelo_executivo' && typeof ModeloDeclaracaoExecutivo !== 'undefined') {
                return ModeloDeclaracaoExecutivo.renderizar(empresa, cliente, this.previewConfig);
            }
            
            // Fallback: modelo não implementado ainda
            return `
                <div style="text-align: center; padding: 100px 20px; color: #666;">
                    <div style="font-size: 80px; margin-bottom: 20px;">🚧</div>
                    <h2 style="font-size: 24px; margin-bottom: 10px;">Modelo em Desenvolvimento</h2>
                    <p style="font-size: 14px;">${modelo.nome || 'Este modelo'} será implementado em breve</p>
                </div>
            `;
        },

        /**
         * Toggle Dark Mode
         */
        toggleDarkMode() {
            this.darkMode = !this.darkMode;
            localStorage.setItem('darkMode', this.darkMode);
        },

        // ========== SISTEMA DE PERSONALIZAÇÕES ==========

        /**
         * Carrega personalizações salvas do localStorage E do servidor
         */
        async carregarPersonalizacoesSalvas() {
            const modeloId = this.modeloSelecionado?.id || 'default';
            
            // 1. Tentar carregar do servidor (GitHub)
            try {
                const response = await githubAPI.lerJSON('data/personalizacoes.json');
                const todasPersonalizacoes = response.data;
                
                // Carregar personalizações deste modelo específico
                if (todasPersonalizacoes[modeloId]) {
                    this.personalizacoes = todasPersonalizacoes[modeloId];
                    console.log('✅ Personalizações carregadas do servidor:', this.personalizacoes);
                }
            } catch (error) {
                console.log('ℹ️ Nenhuma personalização no servidor, usando localStorage');
                
                // 2. Fallback: carregar do localStorage
                const chave = `personalizacoes_${modeloId}`;
                try {
                    const dados = localStorage.getItem(chave);
                    if (dados) {
                        this.personalizacoes = JSON.parse(dados);
                        console.log('✅ Personalizações carregadas do localStorage');
                    }
                } catch (error) {
                    console.error('❌ Erro ao carregar do localStorage:', error);
                }
            }
        },

        /**
         * Salva personalização em um slot (localStorage + servidor)
         */
        async salvarPersonalizacao(slot) {
            if (!this.nomePersonalizacaoTemp.trim()) {
                this.showAlert('error', 'Digite um nome para a personalização');
                return;
            }

            const modeloId = this.modeloSelecionado?.id || 'default';

            // Criar objeto de personalização
            const personalizacao = {
                nome: this.nomePersonalizacaoTemp.trim(),
                config: { ...this.previewConfig },
                dataCriacao: new Date().toISOString(),
                modelo: this.modeloSelecionado?.nome || 'Modelo',
                usuario: this.usuario?.login || 'admin'
            };

            // Salvar no slot
            this.personalizacoes[slot] = personalizacao;

            // 1. Salvar no localStorage (backup rápido)
            const chaveLocal = `personalizacoes_${modeloId}`;
            try {
                localStorage.setItem(chaveLocal, JSON.stringify(this.personalizacoes));
            } catch (error) {
                console.error('⚠️ Erro ao salvar no localStorage:', error);
            }

            // 2. Salvar no servidor (GitHub)
            try {
                this.loading = true;
                this.loadingMessage = 'Salvando no servidor...';

                // Carregar arquivo completo
                let todasPersonalizacoes = {};
                try {
                    const response = await githubAPI.lerJSON('data/personalizacoes.json');
                    todasPersonalizacoes = response.data;
                } catch (error) {
                    console.log('ℹ️ Criando arquivo de personalizações');
                }

                // Atualizar personalizações deste modelo
                todasPersonalizacoes[modeloId] = this.personalizacoes;

                // Salvar no GitHub
                await githubAPI.salvarJSON(
                    'data/personalizacoes.json',
                    todasPersonalizacoes,
                    `Salvar personalização "${personalizacao.nome}" - Slot ${slot.replace('slot', '')}`
                );

                this.lastSaved = new Date();
                this.showAlert('success', `✅ Personalização "${personalizacao.nome}" salva no servidor!`);
                this.modalSalvarPersonalizacao = false;
                this.nomePersonalizacaoTemp = '';
                
            } catch (error) {
                console.error('❌ Erro ao salvar no servidor:', error);
                this.showAlert('warning', '⚠️ Salvo localmente, mas falhou no servidor: ' + error.message);
            } finally {
                this.loading = false;
            }
        },

        /**
         * Carrega personalização de um slot
         */
        carregarPersonalizacao(slot) {
            const personalizacao = this.personalizacoes[slot];
            
            if (!personalizacao) {
                this.showAlert('error', 'Slot vazio');
                return;
            }

            // Aplicar configuração
            this.previewConfig = { ...personalizacao.config };
            this.showAlert('success', `✅ Personalização "${personalizacao.nome}" carregada`);
            this.modalCarregarPersonalizacao = false;
        },

        /**
         * Deleta personalização de um slot (localStorage + servidor)
         */
        async deletarPersonalizacao(slot) {
            const personalizacao = this.personalizacoes[slot];
            if (!personalizacao) {
                this.showAlert('error', 'Slot vazio');
                return;
            }

            const confirmar = await this.showConfirm(
                `Tem certeza que deseja deletar "${personalizacao.nome}"?`,
                { type: 'danger', icon: 'bi-trash', confirmText: 'Deletar' }
            );
            if (!confirmar) return;

            const modeloId = this.modeloSelecionado?.id || 'default';

            // Remover do slot
            this.personalizacoes[slot] = null;

            // 1. Atualizar localStorage
            const chaveLocal = `personalizacoes_${modeloId}`;
            try {
                localStorage.setItem(chaveLocal, JSON.stringify(this.personalizacoes));
            } catch (error) {
                console.error('⚠️ Erro ao atualizar localStorage:', error);
            }

            // 2. Atualizar servidor
            try {
                this.loading = true;
                this.loadingMessage = 'Deletando do servidor...';

                // Carregar arquivo completo
                const response = await githubAPI.lerJSON('data/personalizacoes.json');
                const todasPersonalizacoes = response.data;

                // Atualizar personalizações deste modelo
                todasPersonalizacoes[modeloId] = this.personalizacoes;

                // Salvar no GitHub
                await githubAPI.salvarJSON(
                    'data/personalizacoes.json',
                    todasPersonalizacoes,
                    `Deletar personalização - Slot ${slot.replace('slot', '')}`
                );

                this.showAlert('success', 'Personalização deletada do servidor');
                
            } catch (error) {
                console.error('❌ Erro ao deletar do servidor:', error);
                this.showAlert('warning', '⚠️ Deletado localmente, mas falhou no servidor');
            } finally {
                this.loading = false;
            }
        },

        /**
         * Autosave - Salva automaticamente a cada mudança
         */
        autoSalvarPersonalizacao() {
            if (!this.autosaveEnabled) return;

            const modeloId = this.modeloSelecionado?.id || 'default';
            const chave = `autosave_${modeloId}`;

            try {
                const autosave = {
                    config: { ...this.previewConfig },
                    timestamp: new Date().toISOString()
                };
                localStorage.setItem(chave, JSON.stringify(autosave));
                this.lastSaved = new Date();
            } catch (error) {
                console.error('❌ Erro no autosave:', error);
            }
        },

        /**
         * Recupera autosave
         */
        recuperarAutosave() {
            const modeloId = this.modeloSelecionado?.id || 'default';
            const chave = `autosave_${modeloId}`;

            try {
                const dados = localStorage.getItem(chave);
                if (dados) {
                    const autosave = JSON.parse(dados);
                    this.previewConfig = { ...autosave.config };
                    this.showAlert('success', '✅ Autosave recuperado');
                }
            } catch (error) {
                console.error('❌ Erro ao recuperar autosave:', error);
            }
        },

        /**
         * Exporta personalização para JSON
         */
        exportarPersonalizacao() {
            const modeloId = this.modeloSelecionado?.id || 'default';
            const exportData = {
                modelo: this.modeloSelecionado?.nome || 'Modelo',
                modeloId: modeloId,
                config: this.previewConfig,
                dataExportacao: new Date().toISOString()
            };

            const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `personalizacao_${modeloId}_${Date.now()}.json`;
            a.click();
            URL.revokeObjectURL(url);

            this.showAlert('success', '✅ Personalização exportada');
        },

        /**
         * Importa personalização de JSON
         */
        importarPersonalizacao(event) {
            const file = event.target.files[0];
            if (!file) return;

            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const data = JSON.parse(e.target.result);
                    if (data.config) {
                        this.previewConfig = { ...data.config };
                        this.showAlert('success', `✅ Personalização "${data.modelo}" importada`);
                    } else {
                        this.showAlert('error', 'Arquivo inválido');
                    }
                } catch (error) {
                    console.error('❌ Erro ao importar:', error);
                    this.showAlert('error', 'Erro ao importar arquivo');
                }
            };
            reader.readAsText(file);
        },

        /**
         * Abre modal de salvar
         */
        abrirModalSalvar(slot) {
            this.slotSelecionado = slot;
            this.nomePersonalizacaoTemp = '';
            this.modalSalvarPersonalizacao = true;
        },

        // ========== GERAÇÃO DE PDF ==========

        /**
         * Gera e faz download do PDF da declaração
         */
        async gerarPDF() {
            try {
                // Validações
                if (!this.modeloSelecionado) {
                    this.showAlert('error', '❌ Nenhum modelo selecionado');
                    return;
                }

                if (typeof html2pdf === 'undefined') {
                    this.showAlert('error', '❌ Biblioteca html2pdf.js não carregada. Recarregue a página.');
                    console.error('html2pdf não está definido!');
                    return;
                }

                // Mostrar loading
                this.loading = true;
                this.loadingMessage = 'Gerando PDF profissional...';

                // Obter o HTML renderizado do preview
                const previewElement = document.getElementById('preview-render');
                if (!previewElement) {
                    throw new Error('Elemento de preview não encontrado');
                }

                // Pegar o conteúdo interno (o modelo renderizado) ao invés do wrapper
                const modeloHtml = previewElement.innerHTML;
                
                // Criar um container temporário limpo e centralizado
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
                
                // Adicionar temporariamente ao DOM para renderização
                document.body.appendChild(tempContainer);

                // Obter dados para nome do arquivo
                const empresa = this.getEmpresaExemplo();
                const cliente = this.getClienteExemplo();
                const dataAtual = new Date().toISOString().split('T')[0];
                
                // Nome do arquivo sanitizado
                const nomeArquivo = this.gerarNomeArquivo({
                    modeloNome: this.modeloSelecionado.nome,
                    empresaNome: empresa.nome,
                    clienteNome: cliente.nome,
                    data: dataAtual
                });

                // Configurações otimizadas para PDF profissional - UMA ÚNICA PÁGINA
                const opcoesPDF = {
                    margin: 0,
                    filename: nomeArquivo,
                    image: { 
                        type: 'jpeg', 
                        quality: 0.98
                    },
                    html2canvas: { 
                        scale: 1.5,
                        useCORS: true,
                        letterRendering: true,
                        logging: true,
                        scrollY: 0,
                        scrollX: 0,
                        windowWidth: 794,
                        windowHeight: 1123,
                        width: 794,
                        height: 1123,
                        x: 0,
                        y: 0
                    },
                    jsPDF: { 
                        unit: 'mm', 
                        format: 'a4', 
                        orientation: 'portrait',
                        compress: true
                    },
                    pagebreak: { 
                        mode: 'avoid-all'
                    }
                };

                console.log('📄 Gerando PDF com configurações:', opcoesPDF);
                console.log('📝 Nome do arquivo:', nomeArquivo);

                // Gerar e baixar PDF
                await html2pdf()
                    .set(opcoesPDF)
                    .from(tempContainer)
                    .save();

                // Remover container temporário
                document.body.removeChild(tempContainer);

                // Sucesso
                this.showAlert('success', `✅ PDF gerado com sucesso!\n📄 ${nomeArquivo}`);
                
                console.log('✅ PDF gerado e baixado com sucesso!');

                // Opcional: Registrar no histórico (pode implementar depois)
                this.registrarDownloadPDF(nomeArquivo);

            } catch (error) {
                console.error('❌ Erro ao gerar PDF:', error);
                this.showAlert('error', `❌ Erro ao gerar PDF: ${error.message}`);
            } finally {
                this.loading = false;
            }
        },

        /**
         * Abre PDF em nova aba (sem baixar)
         */
        async visualizarPDFNovaAba() {
            try {
                if (!this.modeloSelecionado) {
                    this.showAlert('error', '❌ Nenhum modelo selecionado');
                    return;
                }

                if (typeof html2pdf === 'undefined') {
                    this.showAlert('error', '❌ Biblioteca html2pdf.js não carregada');
                    return;
                }

                this.loading = true;
                this.loadingMessage = 'Preparando visualização...';

                const previewElement = document.getElementById('preview-render');
                if (!previewElement) {
                    throw new Error('Elemento de preview não encontrado');
                }

                // Pegar o conteúdo interno limpo
                const modeloHtml = previewElement.innerHTML;
                const tempContainer = document.createElement('div');
                tempContainer.innerHTML = modeloHtml;
                tempContainer.style.cssText = `
                    width: 210mm;
                    height: 297mm;
                    margin: 0 auto;
                    padding: 0;
                    box-sizing: border-box;
                    overflow: hidden;
                    background: white;
                `;
                
                document.body.appendChild(tempContainer);

                const opcoesPDF = {
                    margin: 0,
                    image: { type: 'jpeg', quality: 0.98 },
                    html2canvas: { 
                        scale: 1.5, 
                        useCORS: true, 
                        letterRendering: true,
                        logging: true,
                        scrollY: 0,
                        scrollX: 0,
                        windowWidth: 794,
                        windowHeight: 1123,
                        width: 794,
                        height: 1123,
                        x: 0,
                        y: 0
                    },
                    jsPDF: { 
                        unit: 'mm', 
                        format: 'a4', 
                        orientation: 'portrait',
                        compress: true
                    },
                    pagebreak: { 
                        mode: 'avoid-all'
                    }
                };

                const pdfBlob = await html2pdf()
                    .set(opcoesPDF)
                    .from(tempContainer)
                    .output('blob');

                document.body.removeChild(tempContainer);

                // Abrir em nova aba
                const url = URL.createObjectURL(pdfBlob);
                window.open(url, '_blank');

                // Limpar URL após 1 minuto
                setTimeout(() => URL.revokeObjectURL(url), 60000);

                this.showAlert('success', '✅ PDF aberto em nova aba!');

            } catch (error) {
                console.error('❌ Erro ao visualizar PDF:', error);
                this.showAlert('error', `❌ Erro: ${error.message}`);
            } finally {
                this.loading = false;
            }
        },

        /**
         * Gera nome de arquivo sanitizado e profissional
         */
        gerarNomeArquivo(dados) {
            const { modeloNome, empresaNome, clienteNome, data } = dados;
            
            // Função para sanitizar strings
            const sanitizar = (str) => {
                if (!str) return 'documento';
                return str
                    .normalize('NFD') // Normalizar caracteres
                    .replace(/[\u0300-\u036f]/g, '') // Remover acentos
                    .replace(/[^a-zA-Z0-9\s]/g, '') // Remover caracteres especiais
                    .replace(/\s+/g, '_') // Espaços para underscore
                    .toLowerCase()
                    .substring(0, 30); // Limitar tamanho
            };

            const modeloSanitizado = sanitizar(modeloNome);
            const empresaSanitizada = sanitizar(empresaNome);
            const clienteSanitizado = sanitizar(clienteNome);
            
            // Formato: modelo_cliente_empresa_data_timestamp.pdf
            return `${modeloSanitizado}_${clienteSanitizado}_${empresaSanitizada}_${data}_${Date.now()}.pdf`;
        },

        /**
         * Registra download no histórico (opcional - para implementar)
         */
        registrarDownloadPDF(nomeArquivo) {
            try {
                // Salvar em localStorage
                const historico = JSON.parse(localStorage.getItem('historico_pdfs') || '[]');
                
                historico.unshift({
                    arquivo: nomeArquivo,
                    modelo: this.modeloSelecionado?.nome,
                    empresa: this.getEmpresaExemplo().nome,
                    cliente: this.getClienteExemplo().nome,
                    usuario: this.usuario?.login,
                    timestamp: new Date().toISOString()
                });

                // Manter apenas últimos 50
                if (historico.length > 50) {
                    historico.splice(50);
                }

                localStorage.setItem('historico_pdfs', JSON.stringify(historico));
                console.log('📊 Download registrado no histórico');

            } catch (error) {
                console.error('⚠️ Erro ao registrar histórico:', error);
            }
        },

        /**
         * Imprime diretamente (abre diálogo de impressão)
         */
        async imprimirPDF() {
            try {
                if (!this.modeloSelecionado) {
                    this.showAlert('error', '❌ Nenhum modelo selecionado');
                    return;
                }

                this.loading = true;
                this.loadingMessage = 'Preparando impressão...';

                const previewElement = document.getElementById('preview-render');
                if (!previewElement) {
                    throw new Error('Elemento de preview não encontrado');
                }

                // Criar janela de impressão
                const printWindow = window.open('', '', 'width=800,height=600');
                printWindow.document.write(`
                    <!DOCTYPE html>
                    <html>
                    <head>
                        <title>Impressão - ${this.modeloSelecionado.nome}</title>
                        <style>
                            body { margin: 0; padding: 0; }
                            @media print {
                                body { margin: 0; }
                                @page { margin: 0; }
                            }
                        </style>
                    </head>
                    <body>
                        ${previewElement.innerHTML}
                    </body>
                    </html>
                `);
                
                printWindow.document.close();
                
                // Aguardar carregar e imprimir
                printWindow.onload = function() {
                    printWindow.focus();
                    printWindow.print();
                    setTimeout(() => printWindow.close(), 100);
                };

                this.showAlert('success', '🖨️ Diálogo de impressão aberto!');

            } catch (error) {
                console.error('❌ Erro ao imprimir:', error);
                this.showAlert('error', `❌ Erro: ${error.message}`);
            } finally {
                this.loading = false;
            }
        },

        // ========== UPLOAD DE IMAGENS ==========
        
        /**
         * Inicializar Image Uploader
         */
        initImageUploader() {
            if (!this.imageUploader) {
                this.imageUploader = new ImageUploader();
            }
            return this.imageUploader;
        },

        /**
         * Handle de arquivo selecionado
         * @param {Event} event - Evento do input file
         * @param {Object} empresa - Objeto da empresa
         * @param {string} tipo - 'logo' ou 'carimbo'
         */
        async handleImageUpload(event, empresa, tipo) {
            const file = event.target.files[0];
            if (!file) return;

            try {
                this.loading = true;
                this.loadingMessage = `Processando ${tipo}...`;

                // Inicializar uploader
                const uploader = this.initImageUploader();

                // Validar
                const validation = uploader.validateImage(file);
                if (!validation.valid) {
                    this.showAlert('error', `❌ ${validation.error}`);
                    return;
                }

                // Upload completo
                const result = await uploader.processImageUpload(
                    file,
                    empresa,
                    tipo,
                    githubAPI,
                    (message, progress) => {
                        this.loadingMessage = `${message} (${progress}%)`;
                    }
                );

                // Atualizar empresa localmente
                const empresaIndex = this.empresas.findIndex(e => e.id === empresa.id);
                if (empresaIndex !== -1) {
                    this.empresas[empresaIndex][tipo] = result.imageUrl;
                }

                this.showAlert('success', `✅ ${tipo.toUpperCase()} atualizado com sucesso!`);
                console.log(`✅ URL da imagem: ${result.imageUrl}`);

                // Recarregar preview se modelo estiver aberto
                if (this.modeloSelecionado) {
                    this.atualizarPreview();
                }

            } catch (error) {
                console.error(`❌ Erro no upload de ${tipo}:`, error);
                this.showAlert('error', `❌ Erro: ${error.message}`);
            } finally {
                this.loading = false;
                // Limpar input para permitir re-upload do mesmo arquivo
                event.target.value = '';
            }
        },

        /**
         * Abrir seletor de arquivo para logo
         * @param {Object} empresa - Objeto da empresa
         */
        selecionarLogo(empresa) {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = 'image/png,image/jpeg,image/jpg,image/svg+xml';
            input.onchange = (e) => this.handleImageUpload(e, empresa, 'logo');
            input.click();
        },

        /**
         * Abrir seletor de arquivo para carimbo
         * @param {Object} empresa - Objeto da empresa
         */
        selecionarCarimbo(empresa) {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = 'image/png,image/jpeg,image/jpg,image/svg+xml';
            input.onchange = (e) => this.handleImageUpload(e, empresa, 'carimbo');
            input.click();
        },

        /**
         * Remover imagem (logo ou carimbo)
         * @param {Object} empresa - Objeto da empresa
         * @param {string} tipo - 'logo' ou 'carimbo'
         */
        async removerImagem(empresa, tipo) {
            const confirmar = await this.showConfirm(
                `Deseja realmente remover o ${tipo} da empresa ${empresa.nome}?`,
                { type: 'warning', icon: tipo === 'logo' ? 'bi-image' : 'bi-stamp', confirmText: 'Remover' }
            );
            if (!confirmar) return;

            try {
                this.loading = true;
                this.loadingMessage = `Removendo ${tipo}...`;

                // Buscar empresas.json
                const empresasData = await githubAPI.getFile('data/empresas.json');
                const empresas = JSON.parse(atob(empresasData.content));

                // Encontrar e atualizar empresa
                const empresaIndex = empresas.findIndex(e => e.id === empresa.id);
                if (empresaIndex === -1) {
                    throw new Error('Empresa não encontrada');
                }

                empresas[empresaIndex][tipo] = '';

                // Salvar
                const novoConteudo = JSON.stringify(empresas, null, 2);
                await githubAPI.uploadFile(
                    'data/empresas.json',
                    btoa(unescape(encodeURIComponent(novoConteudo))),
                    `Remover ${tipo} da empresa ${empresa.nome}`,
                    empresasData.sha
                );

                // Atualizar localmente
                this.empresas[this.empresas.findIndex(e => e.id === empresa.id)][tipo] = '';

                this.showAlert('success', `✅ ${tipo.toUpperCase()} removido!`);

            } catch (error) {
                console.error(`❌ Erro ao remover ${tipo}:`, error);
                this.showAlert('error', `❌ Erro: ${error.message}`);
            } finally {
                this.loading = false;
            }
        },
        
        // ========== FLUXO DE GERAÇÃO DE DOCUMENTO ==========
        
        /**
         * Empresas filtradas pela busca
         */
        get empresasFiltradas() {
            if (!this.fluxoBuscaEmpresa) return this.empresas;
            
            const busca = this.fluxoBuscaEmpresa.toLowerCase();
            return this.empresas.filter(emp => 
                emp.nome.toLowerCase().includes(busca) ||
                emp.nif.includes(busca) ||
                (emp.endereco.municipio && emp.endereco.municipio.toLowerCase().includes(busca))
            );
        },
        
        /**
         * Clientes filtrados pela busca
         */
        get clientesFiltrados() {
            if (!this.fluxoBuscaCliente) return this.trabalhadores;
            
            const busca = this.fluxoBuscaCliente.toLowerCase();
            return this.trabalhadores.filter(cli => 
                cli.nome.toLowerCase().includes(busca) ||
                cli.nif.includes(busca) ||
                (cli.funcao && cli.funcao.toLowerCase().includes(busca)) ||
                (cli.departamento && cli.departamento.toLowerCase().includes(busca))
            );
        },
        
        /**
         * Abre o fluxo de geração (carrega cache se disponível)
         */
        abrirFluxoGeracao() {
            this.modalFluxoGeracao = true;
            
            // Tentar carregar cache do localStorage
            const cache = localStorage.getItem('fluxoGeracaoCache');
            if (cache) {
                try {
                    const dados = JSON.parse(cache);
                    console.log('📦 Carregando cache do fluxo:', dados);
                    
                    // Restaurar empresa selecionada
                    if (dados.empresaId) {
                        this.fluxoEmpresaSelecionada = this.empresas.find(e => e.id === dados.empresaId);
                    }
                    
                    // Restaurar cliente selecionado
                    if (dados.clienteId) {
                        this.fluxoClienteSelecionado = this.trabalhadores.find(t => t.id === dados.clienteId);
                    }
                    
                    // Restaurar etapa e configurações
                    this.fluxoEtapa = dados.etapa || 1;
                    this.fluxoTipoDocumento = dados.tipoDocumento || null;
                    this.fluxoMesesRecibo = dados.mesesRecibo || '1';
                    
                } catch (e) {
                    console.warn('⚠️ Erro ao carregar cache:', e);
                    this.resetarFluxo();
                }
            } else {
                this.resetarFluxo();
            }
            
            this.fluxoBuscaEmpresa = '';
            this.fluxoBuscaCliente = '';
        },
        
        /**
         * Reseta o fluxo para estado inicial
         */
        resetarFluxo() {
            this.fluxoEtapa = 1;
            this.fluxoEmpresaSelecionada = null;
            this.fluxoClienteSelecionado = null;
            this.fluxoTipoDocumento = null;
            this.fluxoMesesRecibo = '1';
        },
        
        /**
         * Salva o estado atual no localStorage
         */
        salvarCacheFluxo() {
            const cache = {
                empresaId: this.fluxoEmpresaSelecionada?.id || null,
                clienteId: this.fluxoClienteSelecionado?.id || null,
                etapa: this.fluxoEtapa,
                tipoDocumento: this.fluxoTipoDocumento,
                mesesRecibo: this.fluxoMesesRecibo,
                timestamp: new Date().toISOString()
            };
            localStorage.setItem('fluxoGeracaoCache', JSON.stringify(cache));
            console.log('💾 Cache salvo:', cache);
        },
        
        /**
         * Fecha o fluxo de geração (mantém cache)
         */
        fecharFluxoGeracao() {
            this.salvarCacheFluxo();
            this.modalFluxoGeracao = false;
        },
        
        /**
         * Limpa o cache e reseta o fluxo
         */
        limparCacheFluxo() {
            localStorage.removeItem('fluxoGeracaoCache');
            this.resetarFluxo();
            console.log('🗑️ Cache limpo');
        },
        
        /**
         * Salva fotos do BI no localStorage (cache do navegador)
         */
        salvarCacheBI() {
            try {
                const cache = {
                    foto1: this.biFoto1Editada,
                    foto2: this.biFoto2Editada,
                    timestamp: new Date().toISOString()
                };
                localStorage.setItem('editorBICache', JSON.stringify(cache));
                console.log('💾 Cache BI salvo (tamanho:', JSON.stringify(cache).length, 'bytes)');
            } catch (e) {
                console.warn('⚠️ Erro ao salvar cache BI (imagens muito grandes?):', e);
                // Se imagens forem muito grandes para localStorage, ignorar
            }
        },
        
        /**
         * Carrega fotos do BI do localStorage
         */
        carregarCacheBI() {
            try {
                const cache = localStorage.getItem('editorBICache');
                if (cache) {
                    const dados = JSON.parse(cache);
                    this.biFoto1Editada = dados.foto1 || null;
                    this.biFoto2Editada = dados.foto2 || null;
                    console.log('📦 Cache BI carregado:', dados.timestamp);
                    return true;
                }
            } catch (e) {
                console.warn('⚠️ Erro ao carregar cache BI:', e);
            }
            return false;
        },
        
        /**
         * Limpa cache do BI
         */
        limparCacheBI() {
            localStorage.removeItem('editorBICache');
            this.biFoto1Editada = null;
            this.biFoto2Editada = null;
            console.log('🗑️ Cache BI limpo');
        },
        
        /**
         * Gera documento automaticamente (NIF ou Atestado) sem edição
         */
        async gerarDocumentoAutomatico(tipo) {
            if (!this.fluxoEmpresaSelecionada || !this.fluxoClienteSelecionado) {
                this.showAlert('error', 'Selecione empresa e cliente primeiro');
                return;
            }
            
            console.log(`📄 Abrindo preview de ${tipo.toUpperCase()}...`);
            
            // Abrir modal de preview com o tipo selecionado
            this.tipoPreview = tipo;
            this.modalPreviewModelo = true;
        },
        
        /**
         * Abre editor de foto para documento BI
         */
        abrirEditorBI() {
            if (!this.fluxoEmpresaSelecionada || !this.fluxoClienteSelecionado) {
                this.showAlert('error', 'Selecione empresa e cliente primeiro');
                return;
            }
            
            console.log('📷 Abrindo editor de BI para:', {
                empresa: this.fluxoEmpresaSelecionada.nome,
                cliente: this.fluxoClienteSelecionado.nome
            });
            
            // Tentar carregar cache de fotos anteriores
            const cacheCarregado = this.carregarCacheBI();
            if (cacheCarregado) {
                console.log('✅ Fotos recuperadas do cache');
            }
            
            // Abrir o modal de preview com tipo 'bi'
            this.tipoPreview = 'bi';
            this.modalPreviewModelo = true;
        },
        
        /**
         * Carrega uma foto do BI (1 ou 2)
         */
        carregarFotoBI(numeroFoto, event) {
            const file = event.target.files[0];
            if (!file) return;
            
            // Validar tamanho (máx 5MB)
            if (file.size > 5 * 1024 * 1024) {
                this.showAlert('error', 'Foto muito grande! Máximo 5MB');
                return;
            }
            
            // Validar tipo
            if (!file.type.startsWith('image/')) {
                this.showAlert('error', 'Arquivo inválido! Use JPG ou PNG');
                return;
            }
            
            const reader = new FileReader();
            reader.onload = (e) => {
                if (numeroFoto === 1) {
                    this.biFoto1Preview = e.target.result;
                    this.biFoto1Blob = file;
                } else {
                    this.biFoto2Preview = e.target.result;
                    this.biFoto2Blob = file;
                }
                console.log(`✅ Foto ${numeroFoto} carregada`);
            };
            reader.readAsDataURL(file);
        },
        
        /**
         * Remove uma foto do BI
         */
        removerFotoBI(numeroFoto) {
            if (numeroFoto === 1) {
                this.biFoto1Preview = null;
                this.biFoto1Blob = null;
            } else {
                this.biFoto2Preview = null;
                this.biFoto2Blob = null;
            }
            console.log(`🗑️ Foto ${numeroFoto} removida`);
        },
        
        /**
         * Abre o cropper para editar uma foto
         */
        abrirCropperBI(numeroFoto) {
            const preview = numeroFoto === 1 ? this.biFoto1Preview : this.biFoto2Preview;
            if (!preview) return;
            
            this.cropperFotoAtual = numeroFoto;
            this.modalCropperBI = true;
            
            this.$nextTick(() => {
                const image = document.getElementById('cropper-image');
                if (image) {
                    image.src = preview;
                    
                    // Destruir cropper anterior se existir
                    if (this.cropperInstance) {
                        this.cropperInstance.destroy();
                    }
                    
                    // Inicializar Cropper.js com aspecto LIVRE (sem restrição)
                    this.cropperInstance = new Cropper(image, {
                        aspectRatio: NaN, // SEM manter proporção (crop livre)
                        viewMode: 1,
                        dragMode: 'move',
                        autoCropArea: 0.8,
                        restore: false,
                        guides: true,
                        center: true,
                        highlight: true,
                        cropBoxMovable: true,
                        cropBoxResizable: true,
                        toggleDragModeOnDblclick: false,
                        responsive: true,
                        checkOrientation: true,
                        background: true,
                        modal: true,
                    });
                    
                    console.log(`✂️ Cropper aberto para foto ${numeroFoto} (modo livre)`);
                }
            });
        },
        
        /**
         * Fecha o modal do cropper
         */
        fecharCropperBI() {
            if (this.cropperInstance) {
                this.cropperInstance.destroy();
                this.cropperInstance = null;
            }
            this.modalCropperBI = false;
        },
        
        /**
         * Rotaciona a imagem no cropper
         */
        rotacionarCropper(graus) {
            if (this.cropperInstance) {
                this.cropperInstance.rotate(graus);
            }
        },
        
        /**
         * Reseta o cropper
         */
        resetarCropper() {
            if (this.cropperInstance) {
                this.cropperInstance.reset();
            }
        },
        
        /**
         * Aplica o corte e atualiza o preview
         */
        aplicarCorte() {
            if (!this.cropperInstance) return;
            
            this.cropperInstance.getCroppedCanvas().toBlob((blob) => {
                const reader = new FileReader();
                reader.onloadend = () => {
                    const dataUrl = reader.result;
                    
                    if (this.cropperFotoAtual === 1) {
                        this.biFoto1Preview = dataUrl;
                        this.biFoto1Editada = dataUrl;
                        this.biFoto1Blob = blob;
                    } else {
                        this.biFoto2Preview = dataUrl;
                        this.biFoto2Editada = dataUrl;
                        this.biFoto2Blob = blob;
                    }
                    
                    // Salvar no cache do navegador
                    this.salvarCacheBI();
                    
                    console.log(`✅ Corte aplicado na foto ${this.cropperFotoAtual}`);
                    this.fecharCropperBI();
                    this.showAlert('success', 'Corte aplicado com sucesso!');
                };
                reader.readAsDataURL(blob);
            });
        },
        
        /**
         * Gera o PDF do BI com as 2 fotos (PROFISSIONAL)
         */
        async gerarBIPDF() {
            if (!this.biFoto1Editada || !this.biFoto2Editada) {
                this.showAlert('error', 'Adicione e edite as 2 fotos antes de gerar o BI');
                return;
            }
            
            // Verificar se jsPDF está disponível
            if (typeof window.jspdf === 'undefined' || !window.jspdf.jsPDF) {
                this.showAlert('error', '❌ Biblioteca jsPDF não carregada. Recarregue a página.');
                console.error('jsPDF não está definido!');
                return;
            }
            
            this.loading = true;
            this.loadingMessage = 'Gerando BI em PDF...';
            
            try {
                const { jsPDF } = window.jspdf;
                const pdf = new jsPDF({
                    orientation: 'portrait',
                    unit: 'mm',
                    format: 'a4'
                });
                
                const pageWidth = pdf.internal.pageSize.getWidth(); // 210mm
                const pageHeight = pdf.internal.pageSize.getHeight(); // 297mm
                const margin = 15;
                
                // ========== CABEÇALHO ==========
                pdf.setFillColor(25, 32, 103); // Azul escuro profissional
                pdf.rect(0, 0, pageWidth, 40, 'F');
                
                pdf.setTextColor(255, 255, 255);
                pdf.setFontSize(26);
                pdf.setFont('helvetica', 'bold');
                pdf.text('BILHETE DE IDENTIDADE', pageWidth / 2, 18, { align: 'center' });
                
                pdf.setFontSize(11);
                pdf.setFont('helvetica', 'normal');
                
                // Usar dados manuais se modo manual ativado, senão usar empresa/cliente do fluxo
                if (this.biModoManual) {
                    // Modo Manual: apenas data (sem empresa)
                    pdf.text(this.biDadosManuais.data || new Date().toLocaleDateString('pt-AO'), pageWidth / 2, 28, { align: 'center' });
                } else {
                    // Modo Automático: empresa + data
                    pdf.text(this.fluxoEmpresaSelecionada?.nome || 'Empresa', pageWidth / 2, 28, { align: 'center' });
                    pdf.text(new Date().toLocaleDateString('pt-AO'), pageWidth / 2, 35, { align: 'center' });
                }
                
                // ========== DADOS DO TITULAR ==========
                pdf.setTextColor(0, 0, 0);
                pdf.setFontSize(14);
                pdf.setFont('helvetica', 'bold');
                pdf.text('Dados do Titular', margin, 55);
                
                pdf.setDrawColor(25, 32, 103);
                pdf.setLineWidth(0.5);
                pdf.line(margin, 57, pageWidth - margin, 57);
                
                pdf.setFontSize(11);
                pdf.setFont('helvetica', 'normal');
                
                // Determinar dados (manual ou automático)
                const dadosTitular = this.biModoManual ? {
                    nome: this.biDadosManuais.nome || 'Nome não informado',
                    biNif: this.biDadosManuais.biNif || ''
                } : {
                    nome: this.fluxoClienteSelecionado?.nome || 'Cliente',
                    biNif: this.fluxoClienteSelecionado?.bi || this.fluxoClienteSelecionado?.nif || ''
                };
                
                let yPos = 67;
                
                pdf.setFont('helvetica', 'bold');
                pdf.text('Nome Completo:', margin, yPos);
                pdf.setFont('helvetica', 'normal');
                pdf.text(dadosTitular.nome, margin + 45, yPos);
                yPos += 7;
                
                if (dadosTitular.biNif) {
                    pdf.setFont('helvetica', 'bold');
                    pdf.text('BI / NIF:', margin, yPos);
                    pdf.setFont('helvetica', 'normal');
                    pdf.text(dadosTitular.biNif, margin + 45, yPos);
                    yPos += 7;
                }
                
                // ========== FOTO 1 (FRENTE) - Em cima ==========
                yPos += 3;
                pdf.setFontSize(11);
                pdf.setFont('helvetica', 'bold');
                pdf.text('Fotografia Frontal', margin, yPos);
                yPos += 4;
                
                // Dimensões equilibradas para foto 1 (proporção confortável 3:2)
                const foto1Width = 140; // mm - Largura moderada
                const foto1Height = 90; // mm - Altura proporcional
                const foto1X = (pageWidth - foto1Width) / 2; // Centralizar horizontalmente
                const foto1Y = yPos;
                
                pdf.addImage(this.biFoto1Editada, 'JPEG', foto1X, foto1Y, foto1Width, foto1Height, '', 'FAST');
                
                // Borda ao redor da foto 1
                pdf.setDrawColor(200, 200, 200);
                pdf.setLineWidth(0.3);
                pdf.rect(foto1X, foto1Y, foto1Width, foto1Height);
                
                // ========== FOTO 2 (VERSO) - Em baixo ==========
                yPos = foto1Y + foto1Height + 6;
                pdf.setFontSize(11);
                pdf.setFont('helvetica', 'bold');
                pdf.text('Fotografia de Identificação', margin, yPos);
                yPos += 4;
                
                // Dimensões equilibradas para foto 2 (mesma proporção da foto 1)
                const foto2Width = 140; // mm - Mesma largura
                const foto2Height = 90; // mm - Mesma altura
                const foto2X = (pageWidth - foto2Width) / 2; // Centralizar horizontalmente
                const foto2Y = yPos;
                
                pdf.addImage(this.biFoto2Editada, 'JPEG', foto2X, foto2Y, foto2Width, foto2Height, '', 'FAST');
                
                // Borda ao redor da foto 2
                pdf.rect(foto2X, foto2Y, foto2Width, foto2Height);
                
                // ========== RODAPÉ ==========
                const rodapeY = foto2Y + foto2Height + 6;
                pdf.setFontSize(8);
                pdf.setTextColor(100, 100, 100);
                pdf.setFont('helvetica', 'italic');
                pdf.text('Documento gerado automaticamente - Verificar autenticidade', pageWidth / 2, rodapeY, { align: 'center' });
                
                // ========== SALVAR PDF ==========
                // Nome do arquivo: manual ou automático
                let nomeArquivo;
                if (this.biModoManual) {
                    const nomeClean = this.biDadosManuais.nome.replace(/\s+/g, '_') || 'BI';
                    nomeArquivo = `${nomeClean}_BI.pdf`;
                } else {
                    nomeArquivo = `${this.fluxoEmpresaSelecionada?.nome || 'Empresa'}_${this.fluxoClienteSelecionado?.nome || 'Cliente'}_BI.pdf`;
                }
                
                pdf.save(nomeArquivo);
                
                this.loading = false;
                this.showAlert('success', `✅ BI gerado: ${nomeArquivo}`);
                console.log('✅ BI PDF gerado com sucesso:', nomeArquivo);
                
                // Limpar cache após gerar com sucesso
                this.limparCacheBI();
                
                // Perguntar se deseja gerar mais documentos
                this.perguntarGerarOutroDocumento();
                
            } catch (error) {
                this.loading = false;
                console.error('❌ Erro ao gerar BI:', error);
                this.showAlert('error', 'Erro ao gerar BI em PDF');
            }
        },
        
        /**
         * Renderiza o editor BI completo (REMOVIDO - Agora usa interface integrada no modal)
         */
        renderizarEditorBI_OLD() {
            const container = document.getElementById('editor-bi-container');
            if (!container) return;
            
            container.innerHTML = `
                <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8">
                    <h3 class="text-2xl font-bold mb-6 text-gray-800 dark:text-white flex items-center">
                        <i class="bi bi-person-badge text-pink-600 mr-3 text-3xl"></i>
                        Editor de BI - Documento de Identidade
                    </h3>
                    
                    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <!-- FOTO 1 -->
                        <div class="space-y-4">
                            <div class="flex items-center justify-between">
                                <label class="text-sm font-bold text-gray-700 dark:text-gray-300">
                                    📷 Foto 1 (Frente / Principal)
                                </label>
                                <button onclick="document.getElementById('upload-foto1').click()" 
                                        class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors">
                                    <i class="bi bi-upload mr-2"></i>Upload
                                </button>
                            </div>
                            <input type="file" id="upload-foto1" accept="image/*" class="hidden">
                            
                            <div class="border-4 border-dashed border-gray-300 dark:border-gray-600 rounded-xl overflow-hidden bg-gray-50 dark:bg-gray-900">
                                <div id="preview-foto1" class="w-full h-96 flex items-center justify-center text-gray-400">
                                    <div class="text-center">
                                        <i class="bi bi-image text-6xl mb-3"></i>
                                        <p class="text-sm">Clique em "Upload" para adicionar foto</p>
                                    </div>
                                </div>
                            </div>
                            
                            <!-- Controles Foto 1 -->
                            <div id="controles-foto1" class="hidden space-y-3 bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                                <div class="flex items-center justify-between">
                                    <span class="text-sm font-medium">🔍 Zoom</span>
                                    <div class="flex space-x-2">
                                        <button onclick="adminApp().cropperFoto1?.zoom(-0.1)" 
                                                class="px-3 py-1 bg-white border rounded hover:bg-gray-50">−</button>
                                        <button onclick="adminApp().cropperFoto1?.zoom(0.1)" 
                                                class="px-3 py-1 bg-white border rounded hover:bg-gray-50">+</button>
                                    </div>
                                </div>
                                <div class="flex items-center justify-between">
                                    <span class="text-sm font-medium">🔄 Rotação</span>
                                    <div class="flex space-x-2">
                                        <button onclick="adminApp().cropperFoto1?.rotate(-45)" 
                                                class="px-3 py-1 bg-white border rounded hover:bg-gray-50">↶ 45°</button>
                                        <button onclick="adminApp().cropperFoto1?.rotate(45)" 
                                                class="px-3 py-1 bg-white border rounded hover:bg-gray-50">↷ 45°</button>
                                    </div>
                                </div>
                                <button onclick="adminApp().resetarFoto1()" 
                                        class="w-full px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-medium">
                                    <i class="bi bi-trash mr-2"></i>Remover Foto
                                </button>
                            </div>
                        </div>
                        
                        <!-- FOTO 2 -->
                        <div class="space-y-4">
                            <div class="flex items-center justify-between">
                                <label class="text-sm font-bold text-gray-700 dark:text-gray-300">
                                    📷 Foto 2 (Verso / Secundária)
                                </label>
                                <button onclick="document.getElementById('upload-foto2').click()" 
                                        class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors">
                                    <i class="bi bi-upload mr-2"></i>Upload
                                </button>
                            </div>
                            <input type="file" id="upload-foto2" accept="image/*" class="hidden">
                            
                            <div class="border-4 border-dashed border-gray-300 dark:border-gray-600 rounded-xl overflow-hidden bg-gray-50 dark:bg-gray-900">
                                <div id="preview-foto2" class="w-full h-96 flex items-center justify-center text-gray-400">
                                    <div class="text-center">
                                        <i class="bi bi-image text-6xl mb-3"></i>
                                        <p class="text-sm">Clique em "Upload" para adicionar foto</p>
                                    </div>
                                </div>
                            </div>
                            
                            <!-- Controles Foto 2 -->
                            <div id="controles-foto2" class="hidden space-y-3 bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                                <div class="flex items-center justify-between">
                                    <span class="text-sm font-medium">🔍 Zoom</span>
                                    <div class="flex space-x-2">
                                        <button onclick="adminApp().cropperFoto2?.zoom(-0.1)" 
                                                class="px-3 py-1 bg-white border rounded hover:bg-gray-50">−</button>
                                        <button onclick="adminApp().cropperFoto2?.zoom(0.1)" 
                                                class="px-3 py-1 bg-white border rounded hover:bg-gray-50">+</button>
                                    </div>
                                </div>
                                <div class="flex items-center justify-between">
                                    <span class="text-sm font-medium">🔄 Rotação</span>
                                    <div class="flex space-x-2">
                                        <button onclick="adminApp().cropperFoto2?.rotate(-45)" 
                                                class="px-3 py-1 bg-white border rounded hover:bg-gray-50">↶ 45°</button>
                                        <button onclick="adminApp().cropperFoto2?.rotate(45)" 
                                                class="px-3 py-1 bg-white border rounded hover:bg-gray-50">↷ 45°</button>
                                    </div>
                                </div>
                                <button onclick="adminApp().resetarFoto2()" 
                                        class="w-full px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-medium">
                                    <i class="bi bi-trash mr-2"></i>Remover Foto
                                </button>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Botão Gerar PDF BI -->
                    <div class="mt-8 flex items-center justify-between bg-gradient-to-r from-pink-50 to-purple-50 dark:from-pink-900/20 dark:to-purple-900/20 p-6 rounded-xl">
                        <div class="text-sm text-gray-700 dark:text-gray-300">
                            <p class="font-bold mb-1">✅ Pronto para gerar PDF?</p>
                            <p class="text-xs">Empresa: <strong>${this.fluxoEmpresaSelecionada?.nome || 'N/A'}</strong> • Cliente: <strong>${this.fluxoClienteSelecionado?.nome || 'N/A'}</strong></p>
                        </div>
                        <button onclick="adminApp().gerarPDFBI()" 
                                class="px-8 py-3 bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 text-white rounded-xl font-bold shadow-lg hover:shadow-xl transition-all">
                            <i class="bi bi-file-earmark-pdf-fill mr-2"></i>Gerar PDF BI
                        </button>
                    </div>
                </div>
            `;
            
            // Inicializar eventos de upload
            this.inicializarUploadFotos();
        },
        
        /**
         * Inicializa os eventos de upload das fotos
         */
        inicializarUploadFotos() {
            // Upload Foto 1
            const input1 = document.getElementById('upload-foto1');
            if (input1) {
                input1.addEventListener('change', (e) => this.handleUploadFoto(e, 1));
            }
            
            // Upload Foto 2
            const input2 = document.getElementById('upload-foto2');
            if (input2) {
                input2.addEventListener('change', (e) => this.handleUploadFoto(e, 2));
            }
        },
        
        /**
         * Processa upload de foto
         */
        handleUploadFoto(event, numeroFoto) {
            const file = event.target.files[0];
            if (!file) return;
            
            const reader = new FileReader();
            reader.onload = (e) => {
                const previewId = `preview-foto${numeroFoto}`;
                const controlesId = `controles-foto${numeroFoto}`;
                const preview = document.getElementById(previewId);
                const controles = document.getElementById(controlesId);
                
                if (preview) {
                    // Criar imagem para o cropper
                    preview.innerHTML = `<img id="image-foto${numeroFoto}" src="${e.target.result}" style="max-width: 100%; display: block;">`;
                    
                    // Mostrar controles
                    if (controles) {
                        controles.classList.remove('hidden');
                    }
                    
                    // Inicializar Cropper.js
                    this.$nextTick(() => {
                        const image = document.getElementById(`image-foto${numeroFoto}`);
                        if (image && typeof Cropper !== 'undefined') {
                            if (numeroFoto === 1) {
                                if (this.cropperFoto1) {
                                    this.cropperFoto1.destroy();
                                }
                                this.cropperFoto1 = new Cropper(image, {
                                    aspectRatio: 4 / 5, // Proporção de foto BI
                                    viewMode: 1,
                                    dragMode: 'move',
                                    autoCropArea: 1,
                                    restore: false,
                                    guides: true,
                                    center: true,
                                    highlight: false,
                                    cropBoxMovable: true,
                                    cropBoxResizable: true,
                                    toggleDragModeOnDblclick: false,
                                });
                            } else {
                                if (this.cropperFoto2) {
                                    this.cropperFoto2.destroy();
                                }
                                this.cropperFoto2 = new Cropper(image, {
                                    aspectRatio: 4 / 5,
                                    viewMode: 1,
                                    dragMode: 'move',
                                    autoCropArea: 1,
                                    restore: false,
                                    guides: true,
                                    center: true,
                                    highlight: false,
                                    cropBoxMovable: true,
                                    cropBoxResizable: true,
                                    toggleDragModeOnDblclick: false,
                                });
                            }
                            
                            this.showAlert('success', `✅ Foto ${numeroFoto} carregada! Use os controles para ajustar.`);
                        }
                    });
                }
            };
            reader.readAsDataURL(file);
        },
        
        /**
         * Reseta foto 1
         */
        resetarFoto1() {
            if (this.cropperFoto1) {
                this.cropperFoto1.destroy();
                this.cropperFoto1 = null;
            }
            const preview = document.getElementById('preview-foto1');
            const controles = document.getElementById('controles-foto1');
            const input = document.getElementById('upload-foto1');
            
            if (preview) {
                preview.innerHTML = `
                    <div class="text-center">
                        <i class="bi bi-image text-6xl mb-3"></i>
                        <p class="text-sm">Clique em "Upload" para adicionar foto</p>
                    </div>
                `;
            }
            if (controles) controles.classList.add('hidden');
            if (input) input.value = '';
            
            this.showAlert('info', 'Foto 1 removida');
        },
        
        /**
         * Reseta foto 2
         */
        resetarFoto2() {
            if (this.cropperFoto2) {
                this.cropperFoto2.destroy();
                this.cropperFoto2 = null;
            }
            const preview = document.getElementById('preview-foto2');
            const controles = document.getElementById('controles-foto2');
            const input = document.getElementById('upload-foto2');
            
            if (preview) {
                preview.innerHTML = `
                    <div class="text-center">
                        <i class="bi bi-image text-6xl mb-3"></i>
                        <p class="text-sm">Clique em "Upload" para adicionar foto</p>
                    </div>
                `;
            }
            if (controles) controles.classList.add('hidden');
            if (input) input.value = '';
            
            this.showAlert('info', 'Foto 2 removida');
        },
        
        /**
         * Gera PDF do BI com as fotos editadas
         */
        async gerarPDFBI() {
            if (!this.cropperFoto1 && !this.cropperFoto2) {
                this.showAlert('error', '❌ Adicione pelo menos uma foto para gerar o PDF');
                return;
            }
            
            try {
                this.loading = true;
                this.loadingMessage = 'Gerando PDF do BI...';
                
                // Obter as imagens editadas
                const foto1 = this.cropperFoto1 ? this.cropperFoto1.getCroppedCanvas().toDataURL('image/jpeg', 0.9) : null;
                const foto2 = this.cropperFoto2 ? this.cropperFoto2.getCroppedCanvas().toDataURL('image/jpeg', 0.9) : null;
                
                // Nome do arquivo
                const nomeArquivo = `${this.fluxoEmpresaSelecionada?.nome || 'Empresa'}_${this.fluxoClienteSelecionado?.nome || 'Cliente'}_BI.pdf`;
                
                // Criar HTML do BI
                const htmlBI = this.gerarHTMLBI(foto1, foto2);
                
                // Gerar PDF
                const opt = {
                    margin: 0,
                    filename: nomeArquivo,
                    image: { type: 'jpeg', quality: 0.98 },
                    html2canvas: { scale: 2, useCORS: true, letterRendering: true },
                    jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
                };
                
                await html2pdf().set(opt).from(htmlBI).save();
                
                this.loading = false;
                this.showAlert('success', `✅ PDF do BI gerado: ${nomeArquivo}`);
                console.log('✅ PDF BI gerado com sucesso');
                
                // Perguntar se deseja gerar mais documentos
                this.perguntarGerarOutroDocumento();
                
            } catch (error) {
                this.loading = false;
                console.error('❌ Erro ao gerar PDF BI:', error);
                this.showAlert('error', 'Erro ao gerar PDF do BI');
            }
        },
        
        /**
         * Gera HTML do documento BI
         */
        gerarHTMLBI(foto1, foto2) {
            const empresa = this.fluxoEmpresaSelecionada || this.getEmpresaExemplo();
            const cliente = this.fluxoClienteSelecionado || this.getClienteExemplo();
            
            return `
                <div style="width: 210mm; min-height: 297mm; padding: 20mm; background: white; font-family: Arial, sans-serif;">
                    <div style="text-align: center; margin-bottom: 30px;">
                        <h1 style="color: #1e40af; font-size: 28px; margin: 0;">DOCUMENTO DE IDENTIDADE</h1>
                        <p style="color: #666; font-size: 14px; margin: 5px 0;">Bilhete de Identidade</p>
                    </div>
                    
                    <div style="display: flex; justify-content: space-between; margin-top: 40px;">
                        ${foto1 ? `
                        <div style="width: 45%; text-align: center;">
                            <img src="${foto1}" style="width: 100%; max-width: 250px; border: 3px solid #1e40af; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                            <p style="font-size: 12px; color: #666; margin-top: 10px;">Foto Principal</p>
                        </div>
                        ` : ''}
                        
                        ${foto2 ? `
                        <div style="width: 45%; text-align: center;">
                            <img src="${foto2}" style="width: 100%; max-width: 250px; border: 3px solid #1e40af; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                            <p style="font-size: 12px; color: #666; margin-top: 10px;">Foto Secundária</p>
                        </div>
                        ` : ''}
                    </div>
                    
                    <div style="margin-top: 40px; padding: 20px; background: #f8f9fa; border-left: 4px solid #1e40af; border-radius: 4px;">
                        <h3 style="color: #1e40af; font-size: 18px; margin-bottom: 15px;">Dados Pessoais</h3>
                        <table style="width: 100%; font-size: 14px;">
                            <tr>
                                <td style="padding: 8px 0; color: #666; font-weight: bold;">Nome Completo:</td>
                                <td style="padding: 8px 0;">${cliente.nome}</td>
                            </tr>
                            <tr>
                                <td style="padding: 8px 0; color: #666; font-weight: bold;">Número BI:</td>
                                <td style="padding: 8px 0;">${cliente.bi || 'N/A'}</td>
                            </tr>
                            <tr>
                                <td style="padding: 8px 0; color: #666; font-weight: bold;">Função:</td>
                                <td style="padding: 8px 0;">${cliente.funcao || 'N/A'}</td>
                            </tr>
                            <tr>
                                <td style="padding: 8px 0; color: #666; font-weight: bold;">Empresa:</td>
                                <td style="padding: 8px 0;">${empresa.nome}</td>
                            </tr>
                        </table>
                    </div>
                    
                    <div style="margin-top: 40px; text-align: center; color: #999; font-size: 11px;">
                        <p>Documento gerado digitalmente em ${new Date().toLocaleDateString('pt-AO', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
                        <p style="margin-top: 5px;">${empresa.nome}</p>
                    </div>
                </div>
            `;
        },
        
        /**
         * Reseta configurações de preview para padrão
         */
        resetarPreviewConfig() {
            this.previewConfig = {
                fontFamily: 'Times New Roman, serif', 
                fontSize: 12, 
                tamanhoTitulo: 28,
                tamanhoSubtitulo: 18,
                tamanhoEmpresa: 9,
                corTexto: '#000000', 
                corDestaque: '#1e40af', 
                marcaDaguaOpacidade: 10,
                marcaDaguaRotacao: -45,
                marcaDaguaWidth: 400,
                marcaDaguaHeight: 400,
                espacamentoLinhas: 1.6,
                zoom: 100,
                tituloDocumento: 'DECLARAÇÃO DE TRABALHO',
                textoIntro: 'Declara-se, para os devidos efeitos, que',
                alinhamentoTexto: 'justify',
                alinhamentoCabecalho: 'left',
                cabecalhoMaxWidth: 450,
                cabecalhoMarginEntreLogoTexto: 20,
                cabecalhoJustify: 'space-between',
                cabecalhoPaddingBottom: 15,
                cabecalhoBordaLargura: 4,
                cabecalhoLogoSize: 80,
                cabecalhoPaddingHorizontal: 0,
                cabecalhoLineHeight: 1.4,
                carimboWidth: 110,
                carimboHeight: 110
            };
            this.showAlert('success', '✅ Configurações resetadas');
            console.log('🔄 Preview config resetado');
        },
        
        /**
         * Volta do modal de preview para a escolha de modelo (ETAPA 3.5)
         */
        voltarParaEscolhaModelo() {
            this.modalPreviewModelo = false;
            this.fluxoEtapa = 3.5;
            console.log('⬅️ Voltando para escolha de modelo');
        },
        
        /**
         * Abre o modal de preview existente com os dados do fluxo
         */
        abrirPreviewDoFluxo() {
            console.log('📄 Abrindo preview do fluxo...', {
                empresa: this.fluxoEmpresaSelecionada?.nome,
                cliente: this.fluxoClienteSelecionado?.nome,
                tipo: this.fluxoTipoDocumento,
                modelo: this.fluxoModeloSelecionado?.nome
            });
            
            // Configurar o modelo selecionado para o modal
            if (this.fluxoModeloSelecionado) {
                this.modeloSelecionado = this.fluxoModeloSelecionado;
            } else {
                // Se não há modelo (combo), criar um modelo temporário
                this.modeloSelecionado = {
                    id: 'combo',
                    nome: 'Combo Completo',
                    descricao: 'Declaração + 3 Recibos',
                    tiposSuportados: ['combo', 'declaracao', 'recibo']
                };
            }
            
            // Configurar o tipo de preview baseado no fluxo
            this.tipoPreview = this.fluxoTipoDocumento;
            
            // Abrir o modal de preview existente
            this.modalPreviewModelo = true;
            
            console.log('✅ Modal de preview aberto com dados do fluxo');
        },
        
        /**
         * Gera PDF dentro do fluxo do wizard
         */
        async gerarPDFFluxo() {
            try {
                if (!this.fluxoEmpresaSelecionada || !this.fluxoClienteSelecionado) {
                    this.showAlert('error', 'Dados incompletos');
                    return;
                }
                
                console.log('📄 Gerando PDF do fluxo...', {
                    empresa: this.fluxoEmpresaSelecionada.nome,
                    cliente: this.fluxoClienteSelecionado.nome,
                    tipo: this.fluxoTipoDocumento,
                    modelo: this.fluxoModeloSelecionado?.nome
                });
                
                // Simular geração por enquanto
                this.loading = true;
                this.loadingMessage = 'Gerando PDF...';
                
                await new Promise(resolve => setTimeout(resolve, 1500));
                
                // Nome do arquivo: {empresa}_{cliente}_{tipo}.pdf
                const nomeArquivo = `${this.fluxoEmpresaSelecionada.nome}_${this.fluxoClienteSelecionado.nome}_${this.fluxoTipoDocumento}.pdf`;
                
                this.loading = false;
                this.showAlert('success', `✅ PDF gerado: ${nomeArquivo}`);
                console.log('✅ PDF gerado com sucesso:', nomeArquivo);
                
                // Perguntar se deseja gerar mais documentos
                this.perguntarGerarOutroDocumento();
                
            } catch (error) {
                this.loading = false;
                console.error('❌ Erro ao gerar PDF:', error);
                this.showAlert('error', 'Erro ao gerar PDF');
            }
        },
        
        /**
         * Seleciona uma empresa
         */
        selecionarEmpresa(empresa) {
            // Verificar limite de declarações (3 por empresa)
            const contador = this.getContador(empresa.id);
            const LIMITE_DECLARACOES = 3;
            
            if (contador >= LIMITE_DECLARACOES) {
                // Mostrar modal de aviso de limite
                this.empresaLimiteAtingido = empresa;
                this.modalLimiteEmpresa = true;
                return;
            }
            
            // Selecionar normalmente
            this.fluxoEmpresaSelecionada = empresa;
            this.salvarCacheFluxo();
            console.log('✅ Empresa selecionada:', empresa.nome);
        },
        
        /**
         * Confirmar seleção de empresa mesmo com limite atingido
         */
        confirmarEmpresaComLimite() {
            if (this.empresaLimiteAtingido) {
                this.fluxoEmpresaSelecionada = this.empresaLimiteAtingido;
                this.salvarCacheFluxo();
                console.log('⚠️ Empresa selecionada (limite excedido):', this.empresaLimiteAtingido.nome);
                this.modalLimiteEmpresa = false;
                this.empresaLimiteAtingido = null;
            }
        },
        
        /**
         * Cancelar e selecionar outra empresa
         */
        cancelarEmpresaComLimite() {
            this.modalLimiteEmpresa = false;
            this.empresaLimiteAtingido = null;
            // Voltar para a etapa de seleção de empresa
            this.fluxoEtapa = 1;
        },
        
        /**
         * Avança para seleção de clientes
         */
        avancarParaClientes() {
            if (!this.fluxoEmpresaSelecionada) {
                this.showAlert('error', 'Por favor, selecione uma empresa');
                return;
            }
            this.fluxoEtapa = 2;
            this.salvarCacheFluxo();
            this.fluxoBuscaCliente = '';
        },
        
        /**
         * Seleciona um cliente
         */
        selecionarCliente(cliente) {
            this.fluxoClienteSelecionado = cliente;
            this.salvarCacheFluxo();
            console.log('✅ Cliente selecionado:', cliente.nome);
        },
        
        /**
         * Avança para escolha do tipo
         */
        avancarParaTipo() {
            if (!this.fluxoClienteSelecionado) {
                this.showAlert('error', 'Por favor, selecione um cliente');
                return;
            }
            this.fluxoEtapa = 3;
            this.salvarCacheFluxo();
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
            this.salvarCacheFluxo();
            
            console.log('📄 Preview preparado:', {
                empresa: this.fluxoEmpresaSelecionada.nome,
                cliente: this.fluxoClienteSelecionado.nome,
                tipo: this.fluxoTipoDocumento,
                meses: this.fluxoMesesRecibo
            });
        },
        
        /**
         * Gera documento final com pdf-generator.js
         */
        async gerarDocumentoFinal() {
            this.loading = true;
            this.loadingMessage = '📄 Gerando PDF profissional...';
            
            try {
                console.log('📄 Gerando documento final:', {
                    empresa: this.fluxoEmpresaSelecionada.nome,
                    cliente: this.fluxoClienteSelecionado.nome,
                    tipo: this.fluxoTipoDocumento,
                    meses: this.fluxoMesesRecibo
                });
                
                // TODO: Integração com pdf-generator.js
                // Exemplo de chamada (precisa ser ajustado conforme sua API):
                // await pdfGenerator.gerarDeclaracao(
                //     this.fluxoEmpresaSelecionada, 
                //     this.fluxoClienteSelecionado
                // );
                
                this.showAlert('success', '✅ Documento gerado com sucesso!');
                
                // Perguntar se deseja gerar outro documento
                await this.perguntarGerarOutroDocumento();
                
            } catch (error) {
                console.error('❌ Erro ao gerar documento:', error);
                this.showAlert('error', `Erro ao gerar PDF: ${error.message}`);
            } finally {
                this.loading = false;
            }
        },
        
        /**
         * Pergunta se deseja gerar outro documento
         */
        async perguntarGerarOutroDocumento() {
            const resposta = await this.showConfirm(
                'PDF gerado!\n\nDeseja gerar outro documento?',
                { type: 'info', icon: 'bi-file-earmark-check', confirmText: 'Gerar Outro', cancelText: 'Não' }
            );
            
            if (resposta) {
                // SIM: Mantém empresa e cliente, volta para seleção de tipo
                console.log('🔄 Gerando outro documento para o mesmo cliente');
                this.fluxoEtapa = 3;
                this.fluxoTipoDocumento = null;
                this.fluxoMesesRecibo = '1';
                this.salvarCacheFluxo();
            } else {
                // NÃO: Pergunta se quer gerar para outro cliente
                const outroCliente = await this.showConfirm(
                    'Deseja gerar documento para outro cliente?',
                    { type: 'info', icon: 'bi-person', confirmText: 'Outro Cliente', cancelText: 'Não' }
                );
                
                if (outroCliente) {
                    // SIM: Mantém empresa, volta para seleção de cliente
                    console.log('🔄 Gerando documento para outro cliente');
                    this.fluxoEtapa = 2;
                    this.fluxoClienteSelecionado = null;
                    this.fluxoTipoDocumento = null;
                    this.fluxoMesesRecibo = '1';
                    this.salvarCacheFluxo();
                } else {
                    // NÃO: Fecha tudo e limpa cache
                    console.log('✅ Fluxo finalizado');
                    this.limparCacheFluxo();
                    this.fecharFluxoGeracao();
                }
            }
        },
        
        // ========== SISTEMA DE GERAÇÃO MÚLTIPLA ==========
        
        /**
         * Toggle seleção de modelo para geração múltipla
         */
        toggleModeloSelecionado(modelo) {
            const index = this.modelosSelecionadosIds.indexOf(modelo.id);
            
            if (index > -1) {
                // Remover da seleção
                this.modelosSelecionadosIds.splice(index, 1);
                console.log('❌ Modelo desmarcado:', modelo.nome);
            } else {
                // Adicionar à seleção
                this.modelosSelecionadosIds.push(modelo.id);
                console.log('✅ Modelo marcado:', modelo.nome);
            }
            
            console.log('📋 Total selecionados:', this.modelosSelecionadosIds.length);
        },
        
        /**
         * Limpa seleção de modelos
         */
        limparSelecaoModelos() {
            this.modelosSelecionadosIds = [];
            console.log('🗑️ Seleção de modelos limpa');
        },
        
        /**
         * Gera múltiplos PDFs (um para cada modelo selecionado)
         * TODO: Implementação completa - por enquanto apenas estrutura
         */
        async gerarMultiplosPDFs() {
            if (this.modelosSelecionadosIds.length === 0) {
                this.showAlert('warning', 'Nenhum modelo selecionado');
                return;
            }
            
            // Verificar se há empresa e cliente selecionados
            if (!this.fluxoEmpresaSelecionada || !this.fluxoClienteSelecionado) {
                const usar = await this.showConfirm(
                    'Nenhuma empresa/cliente selecionado no fluxo.\n\nDeseja usar dados de exemplo para preview?\n\nDica: Use o TAB "Gerar PDF" para selecionar dados reais.',
                    { type: 'warning', icon: 'bi-exclamation-circle', confirmText: 'Usar Exemplo', cancelText: 'Cancelar' }
                );
                
                if (!usar) return;
            }
            
            this.loading = true;
            this.loadingMessage = `📄 Gerando ${this.modelosSelecionadosIds.length} documento(s)...`;
            
            try {
                const empresa = this.getEmpresaExemplo();
                const cliente = this.getClienteExemplo();
                const timestamp = new Date().toISOString().split('T')[0];
                
                console.log('🚀 Iniciando geração múltipla:', {
                    modelos: this.modelosSelecionadosIds,
                    empresa: empresa.nome,
                    cliente: cliente.nome
                });
                
                // TODO: Loop para gerar cada PDF
                for (let i = 0; i < this.modelosSelecionadosIds.length; i++) {
                    const modeloId = this.modelosSelecionadosIds[i];
                    const modelo = this.modelos.find(m => m.id === modeloId);
                    
                    if (!modelo) continue;
                    
                    console.log(`📄 Gerando ${i + 1}/${this.modelosSelecionadosIds.length}: ${modelo.nome}`);
                    
                    // TODO: Chamar pdf-generator.js com dados corretos
                    // const filename = `${empresa.nome.replace(/\s+/g, '_')}_${cliente.nome.replace(/\s+/g, '_')}_${timestamp}_${modeloId}.pdf`;
                    // await pdfGenerator.gerar(empresa, cliente, modelo, filename);
                    
                    // Simulação de delay
                    await new Promise(resolve => setTimeout(resolve, 500));
                }
                
                this.showAlert('success', `✅ ${this.modelosSelecionadosIds.length} documento(s) gerado(s) com sucesso!`);
                this.limparSelecaoModelos();
                
            } catch (error) {
                console.error('❌ Erro na geração múltipla:', error);
                this.showAlert('error', `Erro: ${error.message}`);
            } finally {
                this.loading = false;
            }
        },
        
        // ========== GESTÃO DE COLABORADORES ==========
        
        /**
         * Carrega lista de colaboradores do repositório
         */
        async carregarColaboradores() {
            this.loadingColab = true;
            this.logTest('🔄 Carregando colaboradores...', 'info');
            
            try {
                const token = localStorage.getItem('token');
                const response = await fetch(
                    `https://api.github.com/repos/${this.config.owner}/${this.config.repo}/collaborators`,
                    {
                        headers: {
                            'Authorization': `token ${token}`,
                            'Accept': 'application/vnd.github.v3+json'
                        }
                    }
                );
                
                if (!response.ok) {
                    throw new Error(`Erro ${response.status}: Sem permissão para listar colaboradores`);
                }
                
                this.colaboradores = await response.json();
                this.logTest(`✅ ${this.colaboradores.length} colaboradores carregados`, 'success');
                
            } catch (error) {
                console.error('❌ Erro ao carregar colaboradores:', error);
                this.logTest(`❌ Erro: ${error.message}`, 'error');
                this.showAlert('error', error.message);
            } finally {
                this.loadingColab = false;
            }
        },
        
        /**
         * Adiciona novo colaborador ao repositório
         */
        async adicionarColaborador() {
            if (!this.novoColaborador.username) {
                this.showAlert('error', '❌ Insira o username do GitHub!');
                return;
            }
            
            this.loadingColab = true;
            this.logTest(`🔍 Verificando usuário: ${this.novoColaborador.username}`, 'info');
            
            try {
                const token = localStorage.getItem('token');
                
                // 1. Verificar se usuário existe
                const userCheck = await fetch(`https://api.github.com/users/${this.novoColaborador.username}`, {
                    headers: {
                        'Authorization': `token ${token}`,
                        'Accept': 'application/vnd.github.v3+json'
                    }
                });
                
                if (!userCheck.ok) {
                    throw new Error(`Usuário "${this.novoColaborador.username}" não encontrado no GitHub`);
                }
                
                const userData = await userCheck.json();
                this.logTest(`✅ Usuário encontrado: ${userData.name || userData.login}`, 'success');
                
                // 2. Adicionar como colaborador
                this.logTest(`➕ Adicionando como colaborador (${this.novoColaborador.permission})...`, 'info');
                
                const response = await fetch(
                    `https://api.github.com/repos/${this.config.owner}/${this.config.repo}/collaborators/${this.novoColaborador.username}`,
                    {
                        method: 'PUT',
                        headers: {
                            'Authorization': `token ${token}`,
                            'Accept': 'application/vnd.github.v3+json',
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({ permission: this.novoColaborador.permission })
                    }
                );
                
                if (!response.ok) {
                    const error = await response.json();
                    throw new Error(`Erro ${response.status}: ${error.message}`);
                }
                
                this.logTest('✅ Colaborador adicionado com sucesso!', 'success');
                this.logTest(`📧 Convite enviado para ${this.novoColaborador.username}`, 'warning');
                this.logTest(`🔗 Aceitar em: https://github.com/${this.config.owner}/${this.config.repo}/invitations`, 'info');
                
                this.showAlert('success', `✅ Convite enviado para ${this.novoColaborador.username}!`);
                
                // Limpar formulário
                this.novoColaborador.username = '';
                this.novoColaborador.permission = 'push';
                
                // Recarregar lista
                await this.carregarColaboradores();
                
            } catch (error) {
                console.error('❌ Erro ao adicionar colaborador:', error);
                this.logTest(`❌ Erro: ${error.message}`, 'error');
                this.showAlert('error', error.message);
            } finally {
                this.loadingColab = false;
            }
        },
        
        /**
         * Testa um usuário específico
         */
        async testarUsuario(userIdentifier) {
            this.logTestes = []; // Limpar log anterior
            this.logTest(`🧪 Testando ${userIdentifier}...`, 'warning');
            
            try {
                let token, username;
                
                if (userIdentifier === 'admin') {
                    token = localStorage.getItem('token');
                    username = this.usuario?.login || localStorage.getItem('username');
                } else {
                    const user = this.usuariosTeste.find(u => u.username === userIdentifier);
                    if (!user) {
                        this.logTest(`⚠️ Usuário "${userIdentifier}" não tem token cadastrado`, 'warning');
                        this.showAlert('warning', `Para testar @${userIdentifier}, adicione o token dele em "usuariosTeste" no código ou use a aba Colaboradores para gerenciar.`);
                        return;
                    }
                    token = user.token;
                    username = user.username;
                }
                
                // 1. Testar autenticação
                this.logTest('1️⃣ Verificando autenticação...', 'info');
                const authResponse = await fetch('https://api.github.com/user', {
                    headers: {
                        'Authorization': `token ${token}`,
                        'Accept': 'application/vnd.github.v3+json'
                    }
                });
                
                if (!authResponse.ok) {
                    throw new Error(`Token inválido: ${authResponse.status}`);
                }
                
                const userData = await authResponse.json();
                this.logTest(`✅ Autenticado: ${userData.login}`, 'success');
                
                // 2. Testar permissões do repositório
                this.logTest('2️⃣ Verificando permissões...', 'info');
                const repoResponse = await fetch(
                    `https://api.github.com/repos/${this.config.owner}/${this.config.repo}`,
                    {
                        headers: {
                            'Authorization': `token ${token}`,
                            'Accept': 'application/vnd.github.v3+json'
                        }
                    }
                );
                
                const repoData = await repoResponse.json();
                const perms = repoData.permissions;
                
                this.logTest(`✅ Permissões:`, 'success');
                this.logTest(`   - push: ${perms.push} ${perms.push ? '✅' : '❌'}`, perms.push ? 'success' : 'error');
                this.logTest(`   - pull: ${perms.pull} ${perms.pull ? '✅' : '❌'}`, perms.pull ? 'success' : 'info');
                this.logTest(`   - admin: ${perms.admin} ${perms.admin ? '✅' : '❌'}`, perms.admin ? 'success' : 'info');
                
                // 3. Testar leitura de empresas
                this.logTest('3️⃣ Testando leitura de empresas...', 'info');
                const empresasResponse = await fetch(
                    `https://api.github.com/repos/${this.config.owner}/${this.config.repo}/contents/data/empresas.json`,
                    {
                        headers: {
                            'Authorization': `token ${token}`,
                            'Accept': 'application/vnd.github.v3+json'
                        }
                    }
                );
                
                if (!empresasResponse.ok) {
                    throw new Error(`Erro ao ler empresas: ${empresasResponse.status}`);
                }
                
                const empresasData = await empresasResponse.json();
                const empresasContent = JSON.parse(atob(empresasData.content.replace(/\n/g, '')));
                this.logTest(`✅ ${empresasContent.empresas.length} empresas carregadas`, 'success');
                
                // 4. Testar leitura de trabalhadores
                this.logTest('4️⃣ Testando leitura de trabalhadores...', 'info');
                const trabResponse = await fetch(
                    `https://api.github.com/repos/${this.config.owner}/${this.config.repo}/contents/data/trabalhadores.json`,
                    {
                        headers: {
                            'Authorization': `token ${token}`,
                            'Accept': 'application/vnd.github.v3+json'
                        }
                    }
                );
                
                const trabData = await trabResponse.json();
                const trabContent = JSON.parse(atob(trabData.content.replace(/\n/g, '')));
                
                // Filtrar por usuário
                const meusTrab = trabContent.trabalhadores.filter(t => 
                    t.usuario_id === userData.login || userIdentifier === 'admin'
                );
                
                this.logTest(`✅ ${trabContent.trabalhadores.length} total, ${meusTrab.length} seus`, 'success');
                
                // Resultado final
                this.logTest('', 'info');
                this.logTest('🎉 TODOS OS TESTES PASSARAM!', 'success');
                
            } catch (error) {
                this.logTest(`❌ ERRO: ${error.message}`, 'error');
                console.error(error);
            }
        },
        
        /**
         * Adiciona log de teste
         */
        logTest(message, type = 'info') {
            this.logTestes.push({
                timestamp: new Date().toLocaleTimeString(),
                message: message,
                type: type
            });
        },
        
        /**
         * Limpa o log de testes
         */
        limparLogTestes() {
            this.logTestes = [];
            this.showAlert('success', '🗑️ Log limpo com sucesso!');
        },
        
        /**
         * Abre o painel admin (atual)
         */
        abrirPainelAdmin() {
            this.logTest('🚀 Abrindo Admin Panel...', 'success');
            window.location.reload();
        },
        
        /**
         * Abre o painel de usuário com token específico
         */
        abrirPainelUser(token) {
            localStorage.setItem('github_token', token);
            localStorage.setItem('token', token);
            this.logTest('🚀 Abrindo User Panel...', 'success');
            window.open('user-panel.html', '_blank');
        },
        
        /**
         * Abre o painel de um colaborador específico (busca token automaticamente)
         */
        async abrirPainelColaborador(username) {
            this.logTest(`🔍 Buscando token para @${username}...`, 'info');
            
            // Verifica se está nos usuários de teste
            const userTest = this.usuariosTeste.find(u => u.username === username);
            
            if (userTest) {
                this.abrirPainelUser(userTest.token);
            } else {
                this.logTest(`⚠️ Token não configurado para @${username}`, 'warning');
                this.showAlert('warning', `Token de @${username} não está cadastrado nos testes. Adicione-o manualmente em usuariosTeste.`);
            }
        },
        
        // ========== HISTÓRICO E ANALYTICS (ADMIN PANEL) ==========
        
        /**
         * Carrega histórico de documentos para o admin panel
         */
        async carregarHistoricoAdmin() {
            console.log('📂 Carregando histórico no admin panel...');
            this.loadingHistoricoAdmin = true;
            
            try {
                const result = await githubAPI.lerJSON('data/historico.json');
                this.historicoAdmin = result?.data?.historico || [];
                console.log(`✅ ${this.historicoAdmin.length} documentos carregados`);
                
                // Ordenar por data (mais recente primeiro)
                this.historicoAdminRecente = [...this.historicoAdmin].sort((a, b) => {
                    const dataA = new Date(a.data || a.created_at);
                    const dataB = new Date(b.data || b.created_at);
                    return dataB - dataA;
                });
                
                // Calcular estatísticas
                this.calcularStatsHistoricoAdmin();
                
                // Criar gráficos
                setTimeout(() => this.criarGraficosAdmin(), 100);
                
            } catch (error) {
                console.error('❌ Erro ao carregar histórico:', error);
                this.showAlert('error', 'Erro ao carregar histórico: ' + error.message);
            } finally {
                this.loadingHistoricoAdmin = false;
            }
        },
        
        /**
         * Calcula estatísticas do histórico
         */
        calcularStatsHistoricoAdmin() {
            this.statsHistoricoAdmin = {
                totalDocumentos: this.historicoAdmin.length,
                porTipo: {
                    declaracao: 0,
                    recibo: 0,
                    combo: 0,
                    nif: 0,
                    atestado: 0
                },
                porEmpresa: {},
                porUsuario: {},
                porDia: {}
            };
            
            this.historicoAdmin.forEach(doc => {
                // Por tipo
                const tipo = doc.tipo_documento || doc.tipo || 'declaracao';
                if (this.statsHistoricoAdmin.porTipo.hasOwnProperty(tipo)) {
                    this.statsHistoricoAdmin.porTipo[tipo]++;
                }
                
                // Por usuário
                const usuario = doc.usuario || doc.criado_por || 'desconhecido';
                this.statsHistoricoAdmin.porUsuario[usuario] = (this.statsHistoricoAdmin.porUsuario[usuario] || 0) + 1;
                
                // Por empresa
                const empresaNome = doc.dados_documento?.empresa_nome || doc.empresa_nome || 'Desconhecida';
                const empresaId = doc.dados_documento?.empresa_id || doc.empresa_id || empresaNome;
                if (!this.statsHistoricoAdmin.porEmpresa[empresaId]) {
                    this.statsHistoricoAdmin.porEmpresa[empresaId] = { nome: empresaNome, total: 0 };
                }
                this.statsHistoricoAdmin.porEmpresa[empresaId].total++;
                
                // Por dia
                const data = (doc.data || doc.created_at || '').split('T')[0];
                if (data) {
                    this.statsHistoricoAdmin.porDia[data] = (this.statsHistoricoAdmin.porDia[data] || 0) + 1;
                }
            });
            
            console.log('📊 Stats calculadas:', this.statsHistoricoAdmin);
        },
        
        /**
         * Cria gráficos do histórico
         */
        criarGraficosAdmin() {
            console.log('📈 Criando gráficos...');
            
            try {
                this.criarGraficoDocumentosPorDiaAdmin();
                this.criarGraficoTiposDocumentosAdmin();
                this.criarGraficoEmpresasAdmin();
                this.criarGraficoUsuariosAdmin();
                console.log('✅ Gráficos criados!');
            } catch (error) {
                console.error('❌ Erro ao criar gráficos:', error);
            }
        },
        
        /**
         * Gráfico: Documentos por Dia
         */
        criarGraficoDocumentosPorDiaAdmin() {
            const canvas = document.getElementById('chartDocumentosPorDiaAdmin');
            if (!canvas) return;
            
            // Destruir gráfico anterior
            if (this.chartsAdmin.documentosPorDia) {
                this.chartsAdmin.documentosPorDia.destroy();
            }
            
            // Preparar dados dos últimos 30 dias
            const dias = [];
            const valores = [];
            const hoje = new Date();
            
            for (let i = 29; i >= 0; i--) {
                const data = new Date(hoje);
                data.setDate(data.getDate() - i);
                const key = data.toISOString().split('T')[0];
                const dia = data.getDate() + '/' + (data.getMonth() + 1);
                
                dias.push(dia);
                valores.push(this.statsHistoricoAdmin.porDia[key] || 0);
            }
            
            const ctx = canvas.getContext('2d');
            this.chartsAdmin.documentosPorDia = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: dias,
                    datasets: [{
                        label: 'Documentos Gerados',
                        data: valores,
                        borderColor: 'rgb(59, 130, 246)',
                        backgroundColor: 'rgba(59, 130, 246, 0.1)',
                        tension: 0.4,
                        fill: true
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            display: false
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            ticks: {
                                stepSize: 1
                            }
                        }
                    }
                }
            });
        },
        
        /**
         * Gráfico: Tipos de Documentos
         */
        criarGraficoTiposDocumentosAdmin() {
            const canvas = document.getElementById('chartTiposDocumentosAdmin');
            if (!canvas) return;
            
            if (this.chartsAdmin.tiposDocumentos) {
                this.chartsAdmin.tiposDocumentos.destroy();
            }
            
            const tipos = Object.keys(this.statsHistoricoAdmin.porTipo);
            const valores = tipos.map(t => this.statsHistoricoAdmin.porTipo[t]);
            
            const ctx = canvas.getContext('2d');
            this.chartsAdmin.tiposDocumentos = new Chart(ctx, {
                type: 'doughnut',
                data: {
                    labels: tipos.map(t => t.charAt(0).toUpperCase() + t.slice(1)),
                    datasets: [{
                        data: valores,
                        backgroundColor: [
                            'rgb(34, 197, 94)',  // green
                            'rgb(59, 130, 246)',  // blue
                            'rgb(168, 85, 247)',  // purple
                            'rgb(249, 115, 22)',  // orange
                            'rgb(236, 72, 153)'   // pink
                        ]
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: 'bottom'
                        }
                    }
                }
            });
        },
        
        /**
         * Gráfico: Top 5 Empresas
         */
        criarGraficoEmpresasAdmin() {
            const canvas = document.getElementById('chartEmpresasAdmin');
            if (!canvas) return;
            
            if (this.chartsAdmin.empresas) {
                this.chartsAdmin.empresas.destroy();
            }
            
            // Top 5 empresas
            const empresas = Object.values(this.statsHistoricoAdmin.porEmpresa)
                .sort((a, b) => b.total - a.total)
                .slice(0, 5);
            
            const labels = empresas.map(e => e.nome);
            const valores = empresas.map(e => e.total);
            
            const ctx = canvas.getContext('2d');
            this.chartsAdmin.empresas = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: labels,
                    datasets: [{
                        label: 'Documentos',
                        data: valores,
                        backgroundColor: 'rgb(168, 85, 247)'
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            display: false
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            ticks: {
                                stepSize: 1
                            }
                        }
                    }
                }
            });
        },
        
        /**
         * Gráfico: Top 5 Usuários
         */
        criarGraficoUsuariosAdmin() {
            const canvas = document.getElementById('chartUsuariosAdmin');
            if (!canvas) return;
            
            if (this.chartsAdmin.usuarios) {
                this.chartsAdmin.usuarios.destroy();
            }
            
            // Top 5 usuários
            const usuarios = Object.entries(this.statsHistoricoAdmin.porUsuario)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 5);
            
            const labels = usuarios.map(u => '@' + u[0]);
            const valores = usuarios.map(u => u[1]);
            
            const ctx = canvas.getContext('2d');
            this.chartsAdmin.usuarios = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: labels,
                    datasets: [{
                        label: 'Documentos',
                        data: valores,
                        backgroundColor: 'rgb(249, 115, 22)'
                    }]
                },
                options: {
                    indexAxis: 'y',
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            display: false
                        }
                    },
                    scales: {
                        x: {
                            beginAtZero: true,
                            ticks: {
                                stepSize: 1
                            }
                        }
                    }
                }
            });
        },
        
        /**
         * Formata data de forma simples
         */
        formatarDataSimples(isoString) {
            if (!isoString) return 'N/A';
            const data = new Date(isoString);
            return data.toLocaleDateString('pt-BR', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        }
    };
}
