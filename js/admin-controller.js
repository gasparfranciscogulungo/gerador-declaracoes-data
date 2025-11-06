// ============================================
// ADMIN-CONTROLLER.JS
// Lógica COMPLETA do painel administrativo
// Conecta com dados REAIS de users, clientes e declarações
// ============================================

function adminApp() {
    return {
        // ========== ESTADO ==========
        usuario: null,
        empresas: [],
        modelos: [],
        contador: {},
        usersData: null,
        darkMode: localStorage.getItem('darkMode') === 'true',
        
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
        
        // Preview de Modelo
        modeloSelecionado: null,
        tipoPreview: 'declaracao', // 'declaracao', 'recibo', 'combo'
        mostrarPersonalizacao: false,
        
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
            const token = authManager.carregarToken();
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
                console.log('✅ Usuário:', this.usuario.login);
            } catch (error) {
                console.error('❌ Erro ao obter usuário:', error);
                this.showAlert('error', 'Erro ao carregar perfil. Token inválido?');
                authManager.logout(); // USA O MÉTODO DO AUTH-MANAGER
                return;
            }
            
            // Inicializar managers
            this.userManager = new UserManager();
            
            // Carregar TODOS os dados
            await this.carregarTodosDados();
            
            // Configurar autosave (a cada 10 segundos)
            setInterval(() => {
                if (this.autosaveEnabled && this.modalPreviewModelo) {
                    this.autoSalvarPersonalizacao();
                }
            }, 10000);
            
            this.loading = false;
            console.log('✅ Painel admin iniciado com SUCESSO!');
        },

        // ========== CARREGAR TODOS OS DADOS ==========
        async carregarTodosDados() {
            try {
                // 1. Carregar usuários (para stats reais)
                this.loadingMessage = 'Carregando usuários...';
                await this.carregarUsuarios();
                
                // 2. Carregar empresas
                this.loadingMessage = 'Carregando empresas...';
                await this.carregarEmpresas();
                
                // 3. Carregar modelos
                this.loadingMessage = 'Carregando modelos...';
                await this.carregarModelos();
                
                // 4. Carregar contador
                this.loadingMessage = 'Carregando contadores...';
                await this.carregarContador();
                
                // 5. Atualizar estatísticas REAIS
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

        // ========== CARREGAR EMPRESAS ==========
        async carregarEmpresas() {
            try {
                const response = await githubAPI.lerJSON('data/empresas.json');
                const empresasData = response.data;
                this.empresas = empresasData.empresas || [];
                console.log(`✅ ${this.empresas.length} empresas carregadas`, this.empresas);
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
                
                // PDFs HOJE: Para isso seria necessário ler arquivos, então deixamos 0 por padrão
                // Será atualizado quando implementarmos histórico de declarações
                this.stats.declaracoesHoje = 0;
                
                console.log('📊 Stats atualizadas:', {
                    empresas: this.stats.empresas,
                    modelos: this.stats.modelos,
                    usersAtivos: this.stats.users,
                    totalClientes: this.stats.totalClientes,
                    totalDeclaracoes: this.stats.totalDeclaracoes
                });
                
            } catch (error) {
                console.error('❌ Erro ao atualizar stats:', error);
            }
        },

        // ========== EMPRESAS ==========
        getContador(empresaId) {
            return this.contador[empresaId] || 0;
        },

        async resetarContador(empresaId) {
            if (!confirm('⚠️ Resetar contador desta empresa para 0?')) {
                return;
            }
            
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
            if (!confirm('⚠️ ATENÇÃO: Deletar esta empresa permanentemente?')) {
                return;
            }
            
            try {
                this.loading = true;
                this.loadingMessage = 'Deletando empresa...';
                
                // Remover da lista
                const empresaRemovida = this.empresas.find(e => e.id === empresaId);
                this.empresas = this.empresas.filter(e => e.id !== empresaId);
                
                // Carregar dados atuais
                const response = await githubAPI.lerJSON('data/empresas.json');
                const empresasData = response.data;
                empresasData.empresas = this.empresas;
                empresasData.metadata.totalEmpresas = this.empresas.length;
                empresasData.metadata.atualizadoEm = new Date().toISOString();
                
                // Salvar
                await githubAPI.salvarJSON(
                    'data/empresas.json',
                    empresasData,
                    `🗑️ Admin deletou empresa: ${empresaRemovida?.nome || empresaId}`,
                    response.sha
                );
                
                this.showAlert('success', '✅ Empresa deletada com sucesso!');
                await this.atualizarStatsReais();
                
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
            if (!confirm('⚠️ Deletar este modelo permanentemente?')) {
                return;
            }
            
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

        async verificarRateLimit() {
            try {
                this.loading = true;
                this.loadingMessage = 'Verificando rate limit...';
                
                const response = await fetch('https://api.github.com/rate_limit', {
                    headers: {
                        'Authorization': `token ${authManager.getToken()}`,
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
        logout() {
            if (confirm('Tem certeza que deseja sair?')) {
                authManager.logout();
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
                        empresas[index] = {
                            ...this.empresaForm,
                            logo: logoLimpo,
                            carimbo: carimboLimpo,
                            updatedAt: new Date().toISOString()
                        };
                    }
                } else {
                    // CRIAR NOVO
                    const novaEmpresa = {
                        ...this.empresaForm,
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

        editarEmpresa(empresa) {
            // Adicionar timestamp nas URLs para forçar reload das imagens
            const timestamp = new Date().getTime();
            
            // Preencher formulário com dados da empresa
            this.empresaForm = {
                id: empresa.id,
                nome: empresa.nome,
                nif: empresa.nif,
                endereco: { ...empresa.endereco },
                telefone: empresa.telefone || '',
                email: empresa.email || '',
                website: empresa.website || '',
                logo: empresa.logo ? `${this.limparUrlCache(empresa.logo)}?v=${timestamp}` : '',
                logoPreview: '', // Preview base64 (carregado depois)
                carimbo: empresa.carimbo ? `${this.limparUrlCache(empresa.carimbo)}?v=${timestamp}` : '',
                carimboPreview: '', // Preview base64 (carregado depois)
                corPrimaria: empresa.corPrimaria || '#1e40af',
                corSecundaria: empresa.corSecundaria || '#64748b',
                marcaDagua: empresa.marcaDagua || ''
            };
            
            this.modalNovaEmpresa = true;
        },

        async deletarEmpresa(empresaId) {
            if (!confirm('Tem certeza que deseja excluir esta empresa?\n\nEsta ação não pode ser desfeita!')) {
                return;
            }

            try {
                this.loading = true;
                this.loadingMessage = 'Excluindo empresa...';

                // Carregar empresas
                const response = await githubAPI.lerJSON('data/empresas.json');
                const empresasData = response.data;
                let empresas = empresasData.empresas || [];
                
                const empresaIndex = empresas.findIndex(e => e.id === empresaId);
                const empresaNome = empresas[empresaIndex]?.nome;
                
                // Remover empresa
                empresas = empresas.filter(e => e.id !== empresaId);

                // Salvar
                await githubAPI.salvarJSON(
                    'data/empresas.json',
                    { empresas },
                    `Excluir empresa: ${empresaNome}`,
                    response.sha
                );

                this.showAlert('success', '✅ Empresa excluída com sucesso!');
                
                // Recarregar
                await this.carregarEmpresas();
                await this.atualizarStatsReais();

            } catch (error) {
                console.error('❌ Erro ao excluir empresa:', error);
                this.showAlert('error', 'Erro ao excluir empresa: ' + error.message);
            } finally {
                this.loading = false;
            }
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

                // Atualizar ambos os campos
                this.empresaForm.logo = githubUrl; // URL CDN (para salvar)
                this.empresaForm.logoPreview = base64Preview; // Base64 (para preview)
                console.log('✅ Formulário atualizado (URL + Preview)');

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

                // Atualizar ambos os campos
                this.empresaForm.carimbo = githubUrl; // URL CDN (para salvar)
                this.empresaForm.carimboPreview = base64Preview; // Base64 (para preview)
                console.log('✅ Formulário atualizado (URL + Preview)');

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
        removerLogoEmpresa() {
            if (confirm('Deseja remover o logo? (O arquivo permanecerá no GitHub)')) {
                this.empresaForm.logo = '';
                this.empresaForm.logoPreview = '';
                this.showAlert('success', '✅ Logo removido do formulário');
            }
        },

        /**
         * Remover carimbo da empresa (apenas do formulário)
         */
        removerCarimboEmpresa() {
            if (confirm('Deseja remover o carimbo? (O arquivo permanecerá no GitHub)')) {
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
            // Retorna primeira empresa cadastrada ou dados fake
            return this.empresas[0] || {
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
            // Dados fake de cliente para demonstração
            return {
                nome: 'João Manuel da Silva Santos',
                bi: '005678901LA042',
                cargo: 'Gestor Comercial',
                salario: 250000,
                dataAdmissao: '2023-01-15',
                mesesTrabalho: [
                    { mes: 'Janeiro/2025', salarioBruto: 250000, descontos: 12500, liquido: 237500 },
                    { mes: 'Fevereiro/2025', salarioBruto: 250000, descontos: 12500, liquido: 237500 },
                    { mes: 'Março/2025', salarioBruto: 250000, descontos: 12500, liquido: 237500 }
                ]
            };
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

            if (!confirm(`Tem certeza que deseja deletar "${personalizacao.nome}"?`)) {
                return;
            }

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
            if (!confirm(`Deseja realmente remover o ${tipo} da empresa ${empresa.nome}?`)) {
                return;
            }

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
        }
    };
}
