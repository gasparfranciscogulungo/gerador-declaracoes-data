// ============================================
// ADMIN-CONTROLLER.JS
// Lógica do painel administrativo
// ============================================

function adminApp() {
    return {
        // ========== ESTADO ==========
        usuario: null,
        empresas: [],
        modelos: [],
        contador: {},
        
        activeTab: 'empresas',
        loading: false,
        loadingMessage: 'Carregando...',
        
        alert: {
            show: false,
            type: 'success',
            message: ''
        },
        
        stats: {
            empresas: 0,
            modelos: 0,
            users: 0,
            declaracoesHoje: 0
        },
        
        config: {
            owner: CONFIG.github.owner,
            repo: CONFIG.github.repo
        },
        
        // Modals
        modalNovaEmpresa: false,
        modalNovoModelo: false,

        // ========== INICIALIZAÇÃO ==========
        async init() {
            console.log('🚀 Iniciando painel admin...');
            
            // Verificar autenticação
            this.loading = true;
            this.loadingMessage = 'Verificando autenticação...';
            
            const autenticado = await authManager.protegerPagina();
            
            if (!autenticado) {
                return;
            }
            
            // Verificar se é admin
            if (!authManager.isAdmin()) {
                this.showAlert('error', '❌ Acesso negado! Você não é administrador.');
                setTimeout(() => {
                    window.location.href = '/user.html';
                }, 2000);
                return;
            }
            
            // Carregar dados do usuário
            this.usuario = authManager.getUser();
            
            // Carregar dados
            await this.carregarDados();
            
            this.loading = false;
        },

        // ========== CARREGAR DADOS ==========
        async carregarDados() {
            try {
                this.loadingMessage = 'Carregando empresas...';
                
                // Carregar empresas
                const empresasData = await githubAPI.lerJSON(CONFIG.paths.empresas);
                if (empresasData) {
                    this.empresas = empresasData.data.empresas || [];
                }
                
                this.loadingMessage = 'Carregando modelos...';
                
                // Carregar modelos
                const modelosData = await githubAPI.lerJSON(CONFIG.paths.modelos);
                if (modelosData) {
                    this.modelos = modelosData.data.modelos || [];
                }
                
                this.loadingMessage = 'Carregando contadores...';
                
                // Carregar contador
                const contadorData = await githubAPI.lerJSON(CONFIG.paths.contador);
                if (contadorData) {
                    this.contador = contadorData.data.contadores || {};
                } else {
                    // Criar contador inicial
                    await this.inicializarContador();
                }
                
                // Atualizar estatísticas
                this.atualizarStats();
                
                console.log('✅ Dados carregados:', {
                    empresas: this.empresas.length,
                    modelos: this.modelos.length
                });
                
            } catch (error) {
                console.error('❌ Erro ao carregar dados:', error);
                this.showAlert('error', 'Erro ao carregar dados: ' + error.message);
            }
        },

        async inicializarContador() {
            const contadorInicial = {
                contadores: {},
                historico: [],
                ultima_atualizacao: new Date().toISOString()
            };
            
            await githubAPI.salvarJSON(
                CONFIG.paths.contador,
                contadorInicial,
                '🔧 Inicializar contador do sistema'
            );
            
            this.contador = {};
        },

        // ========== ESTATÍSTICAS ==========
        atualizarStats() {
            this.stats.empresas = this.empresas.length;
            this.stats.modelos = this.modelos.length;
            this.stats.users = 5; // Valor fixo por enquanto
            
            // Calcular declarações de hoje
            const hoje = new Date().toISOString().split('T')[0];
            this.stats.declaracoesHoje = Object.values(this.contador).reduce((a, b) => a + b, 0);
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
                
                // Carregar SHA atual
                const contadorData = await githubAPI.lerJSON(CONFIG.paths.contador);
                
                // Salvar
                await githubAPI.salvarJSON(
                    CONFIG.paths.contador,
                    {
                        contadores: this.contador,
                        historico: contadorData?.data.historico || [],
                        ultima_atualizacao: new Date().toISOString()
                    },
                    `🔄 Admin resetou contador da empresa ${empresaId}`,
                    contadorData?.sha
                );
                
                this.showAlert('success', '✅ Contador resetado com sucesso!');
                
            } catch (error) {
                console.error('❌ Erro ao resetar contador:', error);
                this.showAlert('error', 'Erro ao resetar contador: ' + error.message);
            } finally {
                this.loading = false;
            }
        },

        editarEmpresa(empresa) {
            this.showAlert('success', `Editar empresa: ${empresa.nome} (em desenvolvimento)`);
        },

        async deletarEmpresa(empresaId) {
            if (!confirm('⚠️ ATENÇÃO: Deletar esta empresa?')) {
                return;
            }
            
            try {
                this.loading = true;
                this.loadingMessage = 'Deletando empresa...';
                
                // Remover da lista
                this.empresas = this.empresas.filter(e => e.id !== empresaId);
                
                // Carregar SHA atual
                const empresasData = await githubAPI.lerJSON(CONFIG.paths.empresas);
                
                // Salvar
                await githubAPI.salvarJSON(
                    CONFIG.paths.empresas,
                    { empresas: this.empresas },
                    `🗑️ Admin deletou empresa ${empresaId}`,
                    empresasData?.sha
                );
                
                this.showAlert('success', '✅ Empresa deletada!');
                this.atualizarStats();
                
            } catch (error) {
                console.error('❌ Erro ao deletar empresa:', error);
                this.showAlert('error', 'Erro ao deletar: ' + error.message);
                await this.carregarDados(); // Recarregar
            } finally {
                this.loading = false;
            }
        },

        // ========== MODELOS ==========
        editarModelo(modelo) {
            this.showAlert('success', `Editar modelo: ${modelo.nome} (em desenvolvimento)`);
        },

        async deletarModelo(modeloId) {
            if (!confirm('⚠️ Deletar este modelo?')) {
                return;
            }
            
            try {
                this.loading = true;
                this.loadingMessage = 'Deletando modelo...';
                
                // Remover da lista
                this.modelos = this.modelos.filter(m => m.id !== modeloId);
                
                // Carregar SHA atual
                const modelosData = await githubAPI.lerJSON(CONFIG.paths.modelos);
                
                // Salvar
                await githubAPI.salvarJSON(
                    CONFIG.paths.modelos,
                    { modelos: this.modelos },
                    `🗑️ Admin deletou modelo ${modeloId}`,
                    modelosData?.sha
                );
                
                // Deletar arquivo do type model
                await githubAPI.deletarArquivo(
                    `${CONFIG.paths.modelosDir}/${modeloId}.json`,
                    `🗑️ Deletar type model ${modeloId}`
                );
                
                this.showAlert('success', '✅ Modelo deletado!');
                this.atualizarStats();
                
            } catch (error) {
                console.error('❌ Erro ao deletar modelo:', error);
                this.showAlert('error', 'Erro ao deletar: ' + error.message);
                await this.carregarDados();
            } finally {
                this.loading = false;
            }
        },

        // ========== CONFIGURAÇÕES ==========
        async verificarRepo() {
            try {
                this.loading = true;
                this.loadingMessage = 'Verificando repositório...';
                
                const existe = await githubAPI.verificarRepo();
                
                if (existe) {
                    this.showAlert('success', '✅ Repositório conectado com sucesso!');
                } else {
                    this.showAlert('error', '❌ Repositório não encontrado!');
                }
                
            } catch (error) {
                this.showAlert('error', 'Erro: ' + error.message);
            } finally {
                this.loading = false;
            }
        },

        async sincronizarDados() {
            this.loading = true;
            this.loadingMessage = 'Sincronizando...';
            
            await this.carregarDados();
            
            this.showAlert('success', '✅ Dados sincronizados!');
            this.loading = false;
        },

        async verificarRateLimit() {
            try {
                const rateLimit = await githubAPI.verificarRateLimit();
                
                this.showAlert('success', 
                    `📊 Rate Limit:\n` +
                    `Usado: ${rateLimit.used}/${rateLimit.limit}\n` +
                    `Restante: ${rateLimit.remaining}`
                );
                
            } catch (error) {
                this.showAlert('error', 'Erro: ' + error.message);
            }
        },

        // ========== UTILIDADES ==========
        logout() {
            authManager.logout();
        },

        showAlert(type, message) {
            this.alert = {
                show: true,
                type: type,
                message: message
            };

            setTimeout(() => {
                this.alert.show = false;
            }, 5000);
        }
    };
}
