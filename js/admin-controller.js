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
        
        // Managers
        userManager: null,

        // ========== INICIALIZAÇÃO ==========
        async init() {
            console.log('🚀 Iniciando painel admin COMPLETO...');
            
            // Verificar autenticação
            this.loading = true;
            this.loadingMessage = 'Verificando autenticação...';
            
            if (!authManager.isAuthenticated()) {
                console.log('❌ Não autenticado, redirecionando...');
                window.location.href = 'index.html';
                return;
            }
            
            // Obter usuário do GitHub
            this.loadingMessage = 'Carregando perfil...';
            try {
                this.usuario = await githubAPI.getUser();
                console.log('✅ Usuário:', this.usuario.login);
            } catch (error) {
                console.error('❌ Erro ao obter usuário:', error);
                this.showAlert('error', 'Erro ao carregar perfil');
                this.loading = false;
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
                this.usersData = await githubAPI.readJSON('data/users.json');
                console.log(`✅ ${this.usersData.users.length} usuários carregados`);
            } catch (error) {
                console.error('❌ Erro ao carregar users.json:', error);
                this.usersData = { users: [], metadata: {} };
            }
        },

        // ========== CARREGAR EMPRESAS ==========
        async carregarEmpresas() {
            try {
                const empresasData = await githubAPI.readJSON('data/empresas.json');
                this.empresas = empresasData.empresas || [];
                console.log(`✅ ${this.empresas.length} empresas carregadas`);
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
            
            await githubAPI.writeJSON(
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
                const modelosData = await githubAPI.readJSON('data/modelos.json');
                this.modelos = modelosData.modelos || [];
                console.log(`✅ ${this.modelos.length} modelos carregados`);
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
            
            await githubAPI.writeJSON(
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
                const contadorData = await githubAPI.readJSON('data/contador.json');
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
            
            await githubAPI.writeJSON(
                'data/contador.json',
                contadorInicial,
                '� Inicializar contador do sistema'
            );
            
            this.contador = {};
            console.log('✅ Contador inicializado');
        },

        // ========== ESTATÍSTICAS REAIS ==========
        async atualizarStatsReais() {
            try {
                // Stats básicas
                this.stats.empresas = this.empresas.length;
                this.stats.modelos = this.modelos.length;
                
                // Users ATIVOS (não pendentes ou bloqueados)
                const usersAtivos = this.usersData?.users.filter(u => u.status === 'active') || [];
                this.stats.users = usersAtivos.length;
                
                // Declarações HOJE + Total de Clientes + Total de Declarações
                const hoje = new Date().toISOString().split('T')[0];
                let declaracoesHoje = 0;
                let totalClientes = 0;
                let totalDeclaracoes = 0;
                
                // Percorre cada usuário ativo
                for (const user of usersAtivos) {
                    try {
                        // Lê arquivo de clientes do usuário
                        const clientesData = await githubAPI.readJSON(`data/clientes/${user.username}/clientes.json`);
                        
                        // Conta clientes
                        const clientes = clientesData.clientes || [];
                        totalClientes += clientes.length;
                        
                        // Conta declarações de hoje e total
                        for (const cliente of clientes) {
                            const totalDeclaracoesCliente = cliente.stats?.totalDeclaracoes || 0;
                            totalDeclaracoes += totalDeclaracoesCliente;
                            
                            const ultimaDeclaracao = cliente.stats?.ultimaDeclaracao;
                            if (ultimaDeclaracao && ultimaDeclaracao.startsWith(hoje)) {
                                declaracoesHoje++;
                            }
                        }
                    } catch (error) {
                        // Se arquivo não existe, ignora
                        if (!error.message.includes('404')) {
                            console.warn(`⚠️ Erro ao ler clientes de ${user.username}:`, error);
                        }
                    }
                }
                
                this.stats.declaracoesHoje = declaracoesHoje;
                this.stats.totalClientes = totalClientes;
                this.stats.totalDeclaracoes = totalDeclaracoes;
                
                console.log('📊 Stats atualizadas:', this.stats);
                
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
                const contadorData = await githubAPI.readJSON('data/contador.json');
                
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
                await githubAPI.writeJSON(
                    'data/contador.json',
                    contadorData,
                    `🔄 Admin ${this.usuario.login} resetou contador da empresa ${empresaId}`
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
                const empresasData = await githubAPI.readJSON('data/empresas.json');
                empresasData.empresas = this.empresas;
                empresasData.metadata.totalEmpresas = this.empresas.length;
                empresasData.metadata.atualizadoEm = new Date().toISOString();
                
                // Salvar
                await githubAPI.writeJSON(
                    'data/empresas.json',
                    empresasData,
                    `🗑️ Admin deletou empresa: ${empresaRemovida?.nome || empresaId}`
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
                const modelosData = await githubAPI.readJSON('data/modelos.json');
                modelosData.modelos = this.modelos;
                modelosData.metadata.totalModelos = this.modelos.length;
                modelosData.metadata.atualizadoEm = new Date().toISOString();
                
                // Salvar
                await githubAPI.writeJSON(
                    'data/modelos.json',
                    modelosData,
                    `🗑️ Admin deletou modelo: ${modeloRemovido?.nome || modeloId}`
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
                await githubAPI.readJSON('data/users.json');
                
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

            // Auto-esconde após 5 segundos
            setTimeout(() => {
                this.alert.show = false;
            }, 5000);
        }
    };
}
