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
        
        activeTab: 'empresas',
        loading: false,
        loadingMessage: 'Carregando...',
        
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

                // Validar URLs de imagens
                if (!this.empresaForm.logo || !this.empresaForm.carimbo) {
                    this.showAlert('error', 'Logo e carimbo são obrigatórios');
                    this.loading = false;
                    return;
                }

                // Validar email se fornecido
                if (this.empresaForm.email && !this.validarEmail(this.empresaForm.email)) {
                    this.showAlert('error', 'Email inválido');
                    this.loading = false;
                    return;
                }

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
                            updatedAt: new Date().toISOString()
                        };
                    }
                } else {
                    // CRIAR NOVO
                    const novaEmpresa = {
                        ...this.empresaForm,
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
            // Preencher formulário com dados da empresa
            this.empresaForm = {
                id: empresa.id,
                nome: empresa.nome,
                nif: empresa.nif,
                endereco: { ...empresa.endereco },
                telefone: empresa.telefone || '',
                email: empresa.email || '',
                website: empresa.website || '',
                logo: empresa.logo,
                carimbo: empresa.carimbo,
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
        
        modeloSelecionado: null,
        modalPreviewModelo: false,
        tipoPreview: 'declaracao', // 'declaracao', 'recibo', 'combo'
        
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
            
            console.log('📄 Visualizando modelo:', modelo.nome);
        },
        
        fecharModalPreview() {
            this.modalPreviewModelo = false;
            this.modeloSelecionado = null;
            this.tipoPreview = 'declaracao';
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
        }
    };
}
