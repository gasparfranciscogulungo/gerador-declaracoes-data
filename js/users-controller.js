/**
 * Controller para Painel de Gerenciamento de Usuários
 * Alpine.js App
 */

function usersApp() {
    return {
        loading: false,
        loadingMessage: 'Carregando...',
        syncing: false,
        alert: {
            show: false,
            message: '',
            type: 'success' // success | error
        },
        
        // Tabs
        activeTab: 'users', // users | historico | analytics
        
        // Dados
        users: [],
        filtro: 'all', // all | active | pending | blocked
        searchQuery: '',
        
        // Histórico
        historico: [],
        historicoFiltrado: [],
        filtrosHistorico: {
            usuario: '',
            tipo_documento: '',
            data_inicio: '',
            data_fim: '',
            busca: ''
        },
        
        // Stats
        stats: {
            total: 0,
            active: 0,
            pending: 0,
            blocked: 0,
            totalClientes: 0,
            totalDeclaracoes: 0
        },
        
        statsHistorico: {
            totalDocumentos: 0,
            porTipo: {
                declaracao: 0,
                recibo: 0,
                combo: 0
            },
            porEmpresa: {},
            porUsuario: {},
            porDia: {}
        },
        
        insights: {
            usuarioMaisAtivo: { nome: '', total: 0 },
            empresaMaisUsada: { nome: '', total: 0 },
            tipoMaisGerado: { tipo: '', total: 0 }
        },
        
        // Modais
        modalDetalhes: false,
        selectedUser: null,
        modalDetalhesDocumento: false,
        selectedDocumento: null,
        
        // Charts
        charts: {
            documentosPorDia: null,
            tiposDocumentos: null,
            empresasTop: null,
            usuariosTop: null
        },
        
        // Managers
        userManager: null,
        historicoManager: null,
        
        /**
         * Inicialização
         */
        async init() {
            console.log('🎯 Iniciando Users Controller...');
            
            // Verifica autenticação (CORRIGIDO)
            const token = authManager.carregarToken();
            if (!token) {
                console.log('❌ Não autenticado, redirecionando...');
                window.location.href = 'index.html';
                return;
            }
            
            // Configurar GitHub API
            githubAPI.setToken(token);
            githubAPI.configurar(CONFIG.github);
            
            // Inicializa managers
            this.userManager = new UserManager();
            this.historicoManager = historicoManager;
            
            await this.historicoManager.inicializar(githubAPI, authManager);
            
            // Carrega dados
            await this.carregarUsuarios();
            await this.carregarHistorico();
            
            // Verifica se deve abrir tab de pendentes (vindo de notificação)
            const urlParams = new URLSearchParams(window.location.search);
            const tab = urlParams.get('tab');
            if (tab === 'pending') {
                this.filtro = 'pending';
                // Marca notificações como visualizadas
                notificationSystem.markAsViewed();
            }
            
            console.log('✅ Users Controller iniciado!');
        },
        
        /**
         * Carrega lista de usuários
         */
        async carregarUsuarios() {
            this.loading = true;
            this.loadingMessage = 'Carregando usuários...';
            
            try {
                const data = await githubAPI.readJSON('data/users.json');
                this.users = data.users || [];
                
                // Atualiza stats
                this.atualizarStats();
                
                console.log(`✅ ${this.users.length} usuários carregados`);
            } catch (error) {
                console.error('❌ Erro ao carregar usuários:', error);
                this.showAlert('Erro ao carregar usuários', 'error');
            } finally {
                this.loading = false;
            }
        },
        
        /**
         * Atualiza estatísticas
         */
        atualizarStats() {
            this.stats.total = this.users.length;
            this.stats.active = this.users.filter(u => u.status === 'active').length;
            this.stats.pending = this.users.filter(u => u.status === 'pending').length;
            this.stats.blocked = this.users.filter(u => u.status === 'blocked').length;
            
            // Soma total de clientes e declarações
            this.stats.totalClientes = this.users.reduce((sum, u) => sum + (u.stats?.clientes || 0), 0);
            this.stats.totalDeclaracoes = this.users.reduce((sum, u) => sum + (u.stats?.declaracoes || 0), 0);
        },
        
        /**
         * Usuários filtrados
         */
        get filteredUsers() {
            let filtered = this.users;
            
            // Aplica filtro de status
            if (this.filtro !== 'all') {
                filtered = filtered.filter(u => u.status === this.filtro);
            }
            
            // Aplica busca
            if (this.searchQuery) {
                const query = this.searchQuery.toLowerCase();
                filtered = filtered.filter(u => 
                    u.username.toLowerCase().includes(query) ||
                    u.id.toString().includes(query)
                );
            }
            
            return filtered;
        },
        
        /**
         * Aprovar usuário pendente
         */
        async aprovarUser(userId) {
            const confirmar = await showConfirm(
                'Aprovar este usuário?',
                { type: 'info', icon: 'bi-check-circle', confirmText: 'Aprovar' }
            );
            if (!confirmar) return;
            
            this.loading = true;
            this.loadingMessage = 'Aprovando usuário...';
            
            try {
                // Obter username do admin do GitHub API (CORRIGIDO)
                const adminUser = await githubAPI.getAuthenticatedUser();
                const adminUsername = adminUser.login;
                
                await this.userManager.aprovarUser(userId, adminUsername);
                
                await this.carregarUsuarios();
                this.showAlert('Usuário aprovado com sucesso!', 'success');
                
                // Atualiza badge de notificações
                await notificationSystem.checkPendingUsers();
            } catch (error) {
                console.error('❌ Erro ao aprovar:', error);
                this.showAlert('Erro ao aprovar usuário', 'error');
            } finally {
                this.loading = false;
            }
        },
        
        /**
         * Bloquear usuário
         */
        async bloquearUser(userId) {
            const confirmar = await showConfirm(
                'Bloquear este usuário?\n\nEle não poderá mais acessar o sistema.',
                { type: 'danger', icon: 'bi-ban', confirmText: 'Bloquear' }
            );
            if (!confirmar) return;
            
            this.loading = true;
            this.loadingMessage = 'Bloqueando usuário...';
            
            try {
                await this.userManager.bloquearUser(userId);
                
                await this.carregarUsuarios();
                this.showAlert('Usuário bloqueado com sucesso!', 'success');
            } catch (error) {
                console.error('❌ Erro ao bloquear:', error);
                this.showAlert('Erro ao bloquear usuário', 'error');
            } finally {
                this.loading = false;
            }
        },
        
        /**
         * Desbloquear usuário
         */
        async desbloquearUser(userId) {
            const confirmar = await showConfirm(
                'Desbloquear este usuário?',
                { type: 'info', icon: 'bi-unlock', confirmText: 'Desbloquear' }
            );
            if (!confirmar) return;
            
            this.loading = true;
            this.loadingMessage = 'Desbloqueando usuário...';
            
            try {
                await this.userManager.desbloquearUser(userId);
                
                await this.carregarUsuarios();
                this.showAlert('Usuário desbloqueado com sucesso!', 'success');
            } catch (error) {
                console.error('❌ Erro ao desbloquear:', error);
                this.showAlert('Erro ao desbloquear usuário', 'error');
            } finally {
                this.loading = false;
            }
        },
        
        /**
         * Rejeitar usuário pendente (remove da lista)
         */
        async rejeitarUser(userId) {
            const confirmar = await showConfirm(
                'Rejeitar este usuário?\n\nEle será removido permanentemente da lista.',
                { type: 'danger', icon: 'bi-x-circle', confirmText: 'Rejeitar' }
            );
            if (!confirmar) return;
            
            this.loading = true;
            this.loadingMessage = 'Rejeitando usuário...';
            
            try {
                await this.userManager.rejeitarUser(userId);
                
                await this.carregarUsuarios();
                this.showAlert('Usuário rejeitado e removido', 'success');
                
                // Atualiza badge de notificações
                await notificationSystem.checkPendingUsers();
            } catch (error) {
                console.error('❌ Erro ao rejeitar:', error);
                this.showAlert('Erro ao rejeitar usuário', 'error');
            } finally {
                this.loading = false;
            }
        },
        
        /**
         * Ver detalhes do usuário
         */
        verDetalhes(user) {
            this.selectedUser = user;
            this.modalDetalhes = true;
        },
        
        /**
         * Sincronizar dados manualmente
         */
        async sincronizar() {
            this.syncing = true;
            
            try {
                await this.carregarUsuarios();
                await notificationSystem.checkPendingUsers();
                this.showAlert('Dados sincronizados com sucesso!', 'success');
            } catch (error) {
                console.error('❌ Erro ao sincronizar:', error);
                this.showAlert('Erro ao sincronizar dados', 'error');
            } finally {
                this.syncing = false;
            }
        },
        
        /**
         * Formata data para exibição
         */
        formatarData(isoString) {
            if (!isoString) return 'Nunca';
            
            const data = new Date(isoString);
            const agora = new Date();
            const diff = agora - data;
            
            // Menos de 1 minuto
            if (diff < 60000) {
                return 'Agora mesmo';
            }
            
            // Menos de 1 hora
            if (diff < 3600000) {
                const minutos = Math.floor(diff / 60000);
                return `Há ${minutos} min`;
            }
            
            // Menos de 24 horas
            if (diff < 86400000) {
                const horas = Math.floor(diff / 3600000);
                return `Há ${horas}h`;
            }
            
            // Mais de 24 horas
            const dias = Math.floor(diff / 86400000);
            if (dias === 1) return 'Ontem';
            if (dias < 7) return `Há ${dias} dias`;
            
            // Data formatada
            return data.toLocaleDateString('pt-PT', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        },
        
        /**
         * Carrega histórico de documentos
         */
        async carregarHistorico() {
            try {
                await this.historicoManager.carregarHistorico();
                
                // Aplica filtros
                this.historico = this.historicoManager.listar(this.filtrosHistorico);
                this.historicoFiltrado = this.historico;
                
                // Atualiza estatísticas
                this.statsHistorico = this.historicoManager.estatisticas(this.filtrosHistorico);
                
                // Se não houver dados, inicializa com zeros
                if (!this.statsHistorico.porDia || Object.keys(this.statsHistorico.porDia).length === 0) {
                    const hoje = new Date();
                    this.statsHistorico.porDia = {};
                    for (let i = 29; i >= 0; i--) {
                        const data = new Date(hoje);
                        data.setDate(data.getDate() - i);
                        const key = data.toISOString().split('T')[0];
                        this.statsHistorico.porDia[key] = 0;
                    }
                }
                
                // Calcula insights
                this.calcularInsights();
                
                console.log(`✅ ${this.historico.length} documentos no histórico`);
                console.log('📊 Stats:', this.statsHistorico);
            } catch (error) {
                console.error('❌ Erro ao carregar histórico:', error);
                // Inicializa com dados vazios
                this.statsHistorico = {
                    totalDocumentos: 0,
                    porTipo: { declaracao: 0, recibo: 0, combo: 0 },
                    porEmpresa: {},
                    porUsuario: {},
                    porDia: {}
                };
            }
        },
        
        /**
         * Busca documentos por texto
         */
        buscarDocumentos() {
            if (!this.filtrosHistorico.busca) {
                this.historicoFiltrado = this.historico;
                return;
            }
            
            this.historicoFiltrado = this.historicoManager.buscar(this.filtrosHistorico.busca);
        },
        
        /**
         * Limpa todos os filtros
         */
        limparFiltros() {
            this.filtrosHistorico = {
                usuario: '',
                tipo_documento: '',
                data_inicio: '',
                data_fim: '',
                busca: ''
            };
            this.carregarHistorico();
        },
        
        /**
         * Calcula insights profissionais
         */
        calcularInsights() {
            // Usuário mais ativo
            const usuariosOrdenados = Object.entries(this.statsHistorico.porUsuario)
                .sort((a, b) => b[1] - a[1]);
            
            if (usuariosOrdenados.length > 0) {
                this.insights.usuarioMaisAtivo = {
                    nome: usuariosOrdenados[0][0],
                    total: usuariosOrdenados[0][1]
                };
            }
            
            // Empresa mais usada
            const empresasOrdenadas = Object.entries(this.statsHistorico.porEmpresa)
                .sort((a, b) => b[1].total - a[1].total);
            
            if (empresasOrdenadas.length > 0) {
                this.insights.empresaMaisUsada = {
                    nome: empresasOrdenadas[0][1].nome,
                    total: empresasOrdenadas[0][1].total
                };
            }
            
            // Tipo mais gerado
            const tiposOrdenados = Object.entries(this.statsHistorico.porTipo)
                .sort((a, b) => b[1] - a[1]);
            
            if (tiposOrdenados.length > 0) {
                this.insights.tipoMaisGerado = {
                    tipo: tiposOrdenados[0][0].charAt(0).toUpperCase() + tiposOrdenados[0][0].slice(1),
                    total: tiposOrdenados[0][1]
                };
            }
        },
        
        /**
         * Ver detalhes de um documento
         */
        verDetalhesDocumento(documento) {
            this.selectedDocumento = documento;
            this.modalDetalhesDocumento = true;
        },
        
        /**
         * Regenerar PDF a partir do histórico
         */
        async regenerarPDF(documento) {
            const confirmar = await showConfirm(
                'Regenerar este documento?\n\nVocê poderá editar os dados antes de gerar.',
                { type: 'info', icon: 'bi-arrow-clockwise', confirmText: 'Regenerar' }
            );
            if (!confirmar) return;
            
            try {
                const dadosRegeneracao = this.historicoManager.prepararRegeneracao(documento.id);
                
                // Salva dados no localStorage para o admin.html usar
                localStorage.setItem('regenerar_pdf_dados', JSON.stringify(dadosRegeneracao));
                
                // Redireciona para admin.html
                window.location.href = 'admin.html?action=regenerar';
                
            } catch (error) {
                console.error('❌ Erro ao preparar regeneração:', error);
                this.showAlert('Erro ao preparar regeneração do PDF', 'error');
            }
        },
        
        /**
         * Alterna para tab Analytics e inicializa gráficos
         */
        abrirAnalytics() {
            this.activeTab = 'analytics';
            // Aguarda renderização do DOM
            setTimeout(() => {
                if (!this.charts.documentosPorDia) {
                    this.initCharts();
                }
            }, 100);
        },
        
        /**
         * Inicializa gráficos Chart.js quando tab Analytics for aberta
         */
        initCharts() {
            console.log('📊 Inicializando gráficos...');
            
            // Evita duplicação
            if (this.charts.documentosPorDia) {
                console.log('📊 Gráficos já inicializados');
                return;
            }
            
            // Cria todos os gráficos
            this.createChartDocumentosPorDia();
            this.createChartTiposDocumentos();
            this.createChartEmpresasTop();
            this.createChartUsuariosTop();
            
            console.log('✅ Gráficos inicializados!');
        },
        
        /**
         * Gráfico: Documentos por Dia (Linha)
         */
        createChartDocumentosPorDia() {
            const ctx = document.getElementById('chartDocumentosPorDia');
            if (!ctx) {
                console.error('❌ Canvas chartDocumentosPorDia não encontrado');
                return;
            }
            
            const dias = Object.keys(this.statsHistorico.porDia).sort().slice(-30);
            const valores = dias.map(dia => this.statsHistorico.porDia[dia] || 0);
            
            console.log('📈 Criando gráfico de linha:', { dias: dias.length, valores });
            
            this.charts.documentosPorDia = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: dias.map(d => {
                        const date = new Date(d);
                        return date.toLocaleDateString('pt-PT', { day: '2-digit', month: '2-digit' });
                    }),
                    datasets: [{
                        label: 'Documentos Gerados',
                        data: valores,
                        borderColor: 'rgb(59, 130, 246)',
                        backgroundColor: 'rgba(59, 130, 246, 0.1)',
                        tension: 0.4,
                        fill: true,
                        pointRadius: 4,
                        pointHoverRadius: 6
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: true,
                    plugins: {
                        legend: { 
                            display: true,
                            position: 'top'
                        },
                        tooltip: {
                            mode: 'index',
                            intersect: false
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
         * Gráfico: Tipos de Documentos (Pizza)
         */
        createChartTiposDocumentos() {
            const ctx = document.getElementById('chartTiposDocumentos');
            if (!ctx) {
                console.error('❌ Canvas chartTiposDocumentos não encontrado');
                return;
            }
            
            const dados = [
                this.statsHistorico.porTipo.declaracao || 0,
                this.statsHistorico.porTipo.recibo || 0,
                this.statsHistorico.porTipo.combo || 0
            ];
            
            console.log('🍕 Criando gráfico de pizza:', dados);
            
            this.charts.tiposDocumentos = new Chart(ctx, {
                type: 'doughnut',
                data: {
                    labels: ['Declarações', 'Recibos', 'Combos'],
                    datasets: [{
                        data: dados,
                        backgroundColor: [
                            'rgb(34, 197, 94)',
                            'rgb(249, 115, 22)',
                            'rgb(168, 85, 247)'
                        ],
                        borderWidth: 2,
                        borderColor: '#fff'
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: true,
                    plugins: {
                        legend: { 
                            position: 'bottom',
                            labels: {
                                padding: 15,
                                font: {
                                    size: 12
                                }
                            }
                        },
                        tooltip: {
                            callbacks: {
                                label: function(context) {
                                    const label = context.label || '';
                                    const value = context.parsed || 0;
                                    const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                    const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
                                    return `${label}: ${value} (${percentage}%)`;
                                }
                            }
                        }
                    }
                }
            });
        },
        
        /**
         * Gráfico: Top Empresas (Barras)
         */
        createChartEmpresasTop() {
            const ctx = document.getElementById('chartEmpresasTop');
            if (!ctx) {
                console.error('❌ Canvas chartEmpresasTop não encontrado');
                return;
            }
            
            const empresas = Object.entries(this.statsHistorico.porEmpresa)
                .sort((a, b) => b[1].total - a[1].total)
                .slice(0, 10);
            
            const labels = empresas.length > 0 
                ? empresas.map(e => {
                    const nome = e[1].nome || 'Sem nome';
                    return nome.length > 25 ? nome.substring(0, 25) + '...' : nome;
                  })
                : ['Nenhuma empresa'];
            
            const dados = empresas.length > 0 
                ? empresas.map(e => e[1].total)
                : [0];
            
            console.log('📊 Criando gráfico de empresas:', { empresas: empresas.length, dados });
            
            this.charts.empresasTop = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: labels,
                    datasets: [{
                        label: 'Documentos',
                        data: dados,
                        backgroundColor: 'rgba(168, 85, 247, 0.8)',
                        borderColor: 'rgba(168, 85, 247, 1)',
                        borderWidth: 1
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: true,
                    indexAxis: 'y',
                    plugins: {
                        legend: { display: false },
                        tooltip: {
                            callbacks: {
                                label: function(context) {
                                    return `Documentos: ${context.parsed.x}`;
                                }
                            }
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
         * Gráfico: Top Usuários (Barras)
         */
        createChartUsuariosTop() {
            const ctx = document.getElementById('chartUsuariosTop');
            if (!ctx) {
                console.error('❌ Canvas chartUsuariosTop não encontrado');
                return;
            }
            
            const usuarios = Object.entries(this.statsHistorico.porUsuario)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 10);
            
            const labels = usuarios.length > 0 
                ? usuarios.map(u => u[0])
                : ['Nenhum usuário'];
            
            const dados = usuarios.length > 0 
                ? usuarios.map(u => u[1])
                : [0];
            
            console.log('👥 Criando gráfico de usuários:', { usuarios: usuarios.length, dados });
            
            this.charts.usuariosTop = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: labels,
                    datasets: [{
                        label: 'Documentos',
                        data: dados,
                        backgroundColor: 'rgba(249, 115, 22, 0.8)',
                        borderColor: 'rgba(249, 115, 22, 1)',
                        borderWidth: 1
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: true,
                    indexAxis: 'y',
                    plugins: {
                        legend: { display: false },
                        tooltip: {
                            callbacks: {
                                label: function(context) {
                                    return `Documentos: ${context.parsed.x}`;
                                }
                            }
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
         * Atualiza dados dos gráficos
         */
        updateCharts() {
            // Atualizar será implementado quando necessário
            console.log('📊 Atualizando gráficos...');
        },
        
        /**
         * Formata data completa
         */
        formatarDataCompleta(isoString) {
            if (!isoString) return '-';
            
            const data = new Date(isoString);
            return data.toLocaleString('pt-PT', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        },
        
        /**
         * Mostra alerta
         */
        showAlert(message, type = 'success') {
            this.alert.message = message;
            this.alert.type = type;
            this.alert.show = true;
            
            // Auto-esconde após 5 segundos
            setTimeout(() => {
                this.alert.show = false;
            }, 5000);
        }
    }
}
