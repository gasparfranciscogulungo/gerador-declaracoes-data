/**
 * Controller para Painel de Gerenciamento de Usuários
 * Alpine.js App
 */

function usersApp() {
    return {
        // UI State
        darkMode: localStorage.getItem('darkMode') === 'true' || false,
        mobileMenuOpen: false,
        
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
            
            // ✅ Verificação simplificada
            const token = localStorage.getItem('token');
            const username = localStorage.getItem('username');
            
            if (!token || !username) {
                console.log('❌ Não autenticado, redirecionando...');
                window.location.href = 'index.html';
                return;
            }
            
            // Configurar GitHub API
            githubAPI.setToken(token);
            githubAPI.configurar(CONFIG.github);
            
            // ✅ Modo simplificado - sem managers complexos
            
            // Carrega dados
            await this.carregarUsuarios();
            await this.carregarHistorico();
            
            // ✅ Tab de pendentes removida (sem sistema de aprovação)
            
            console.log('✅ Users Controller iniciado!');
        },
        
        /**
         * ✅ NOVO: Carrega usuários reais baseado em trabalhadores e histórico
         */
        async carregarUsuarios() {
            this.loading = true;
            this.loadingMessage = 'Rastreando atividade de usuários...';
            
            try {
                console.log('📂 Carregando trabalhadores...');
                // 1. Carregar trabalhadores
                const trabalhadores = await githubAPI.lerJSON('data/trabalhadores.json');
                const listaTrabalhadores = trabalhadores?.data?.trabalhadores || [];
                console.log(`✅ ${listaTrabalhadores.length} trabalhadores carregados`);
                
                console.log('📂 Carregando histórico...');
                // 2. Carregar histórico
                const historico = await githubAPI.lerJSON('data/historico.json');
                const listaHistorico = historico?.data?.historico || [];
                console.log(`✅ ${listaHistorico.length} documentos no histórico`);
                
                // 3. Extrair usuários únicos dos trabalhadores (campo usuario_id ou criado_por)
                const usuariosMap = new Map();
                
                // ✅ AJUSTE: Pegar username atual do admin logado para trabalhadores sem usuario_id
                const adminUsername = localStorage.getItem('username') || 'gasparfranciscogulungo';
                
                console.log('🔍 Processando trabalhadores...');
                console.log(`📌 Admin atual: ${adminUsername}`);
                
                listaTrabalhadores.forEach(t => {
                    // Se não tem usuario_id, atribuir ao admin atual (trabalhadores antigos)
                    const username = t.usuario_id || t.criado_por || adminUsername;
                    console.log('   Trabalhador:', t.nome, '→ Usuario:', username);
                    
                    if (!usuariosMap.has(username)) {
                        usuariosMap.set(username, {
                            username: username,
                            clientes: 0,
                            documentos: 0,
                            ultimoAcesso: null
                        });
                    }
                    usuariosMap.get(username).clientes++;
                });
                console.log(`✅ ${usuariosMap.size} usuários únicos encontrados nos trabalhadores`);
                
                // 4. Contar documentos por usuário no histórico
                console.log('🔍 Processando histórico...');
                listaHistorico.forEach(h => {
                    const username = h.gerado_por || h.usuario || h.criado_por;
                    console.log('   Documento:', h.dados_documento?.trabalhador_nome, '→ Usuario:', username);
                    if (username) {
                        if (!usuariosMap.has(username)) {
                            usuariosMap.set(username, {
                                username: username,
                                clientes: 0,
                                documentos: 0,
                                ultimoAcesso: null
                            });
                        }
                        usuariosMap.get(username).documentos++;
                        
                        // Atualizar último acesso
                        const dataDoc = new Date(h.gerado_em || h.data || h.created_at);
                        const dataAtual = usuariosMap.get(username).ultimoAcesso;
                        if (!dataAtual || dataDoc > new Date(dataAtual)) {
                            usuariosMap.get(username).ultimoAcesso = h.gerado_em || h.data || h.created_at;
                        }
                    }
                });
                console.log(`✅ ${usuariosMap.size} usuários únicos totais`);
                
                // 5. Converter Map para array e adicionar avatar do GitHub
                this.users = await Promise.all(
                    Array.from(usuariosMap.values()).map(async (userData) => {
                        return {
                            id: userData.username,
                            username: userData.username,
                            name: userData.username,
                            avatar: `https://github.com/${userData.username}.png`,
                            role: CONFIG.admins.includes(userData.username) ? 'admin' : 'user',
                            status: 'active',
                            stats: {
                                clientes: userData.clientes,
                                declaracoes: userData.documentos,
                                ultimoAcesso: userData.ultimoAcesso || new Date().toISOString()
                            }
                        };
                    })
                );
                
                // ✅ ADICIONAL: Incluir admin atual se não estiver na lista
                const adminAtual = localStorage.getItem('username');
                if (adminAtual && !this.users.find(u => u.username === adminAtual)) {
                    console.log(`📌 Adicionando admin atual à lista: ${adminAtual}`);
                    this.users.push({
                        id: adminAtual,
                        username: adminAtual,
                        name: adminAtual,
                        avatar: `https://github.com/${adminAtual}.png`,
                        role: CONFIG.admins.includes(adminAtual) ? 'admin' : 'user',
                        status: 'active',
                        stats: {
                            clientes: 0,
                            declaracoes: 0,
                            ultimoAcesso: new Date().toISOString()
                        }
                    });
                }
                
                // Ordenar por mais ativo (mais documentos)
                this.users.sort((a, b) => b.stats.declaracoes - a.stats.declaracoes);
                
                // Atualiza stats
                this.atualizarStats();
                
                console.log(`✅ ${this.users.length} usuários ativos rastreados`);
                console.log('📊 Usuários:', this.users);
                console.log('📊 Stats:', this.stats);
            } catch (error) {
                console.error('❌ Erro ao carregar usuários:', error);
                this.showAlert('Erro ao carregar usuários: ' + error.message, 'error');
                this.users = [];
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
         * Bloquear usuário
         */
        async bloquearUser(userId) {
            if (!confirm('Tem certeza que deseja bloquear este usuário?')) return;
            
            try {
                const user = this.users.find(u => u.id === userId);
                if (!user) {
                    this.showAlert('Usuário não encontrado', 'error');
                    return;
                }
                
                // Atualizar status
                user.status = 'blocked';
                user.bloqueado_em = new Date().toISOString();
                
                // Salvar no GitHub
                await githubAPI.salvarArquivo(
                    'data/users.json',
                    JSON.stringify({ users: this.users }, null, 2),
                    `Bloqueio de usuário: ${user.username}`
                );
                
                this.showAlert(`✅ Usuário @${user.username} bloqueado com sucesso!`, 'success');
                await this.carregarUsuarios();
                
            } catch (error) {
                console.error('❌ Erro ao bloquear usuário:', error);
                this.showAlert('Erro ao bloquear usuário: ' + error.message, 'error');
            }
        },
        
        /**
         * Desbloquear usuário
         */
        async desbloquearUser(userId) {
            if (!confirm('Tem certeza que deseja desbloquear este usuário?')) return;
            
            try {
                const user = this.users.find(u => u.id === userId);
                if (!user) {
                    this.showAlert('Usuário não encontrado', 'error');
                    return;
                }
                
                // Atualizar status
                user.status = 'active';
                user.desbloqueado_em = new Date().toISOString();
                delete user.bloqueado_em;
                
                // Salvar no GitHub
                await githubAPI.salvarArquivo(
                    'data/users.json',
                    JSON.stringify({ users: this.users }, null, 2),
                    `Desbloqueio de usuário: ${user.username}`
                );
                
                this.showAlert(`✅ Usuário @${user.username} desbloqueado com sucesso!`, 'success');
                await this.carregarUsuarios();
                
            } catch (error) {
                console.error('❌ Erro ao desbloquear usuário:', error);
                this.showAlert('Erro ao desbloquear usuário: ' + error.message, 'error');
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
                // ✅ Removido: notificationSystem não existe mais
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
         * ✅ FUNCIONAL: Carrega histórico completo do GitHub
         */
        async carregarHistorico() {
            console.log('📂 Carregando histórico de documentos...');
            this.loadingHistorico = true;
            
            try {
                const result = await githubAPI.lerJSON('data/historico.json');
                this.historico = result?.data?.historico || [];
                console.log(`✅ ${this.historico.length} documentos carregados do histórico`);
                
                // Aplicar filtros
                this.aplicarFiltrosHistorico();
                
                // Calcular estatísticas completas
                this.calcularStatsHistorico();
                
                console.log('📊 Stats histórico:', this.statsHistorico);
                
            } catch (error) {
                console.error('❌ Erro ao carregar histórico:', error);
                this.showAlert('Erro ao carregar histórico: ' + error.message, 'error');
                this.historico = [];
                this.historicoFiltrado = [];
            } finally {
                this.loadingHistorico = false;
            }
        },
        
        /**
         * Calcula estatísticas do histórico
         */
        calcularStatsHistorico() {
            console.log('🔢 Calculando estatísticas...');
            
            this.statsHistorico = {
                totalDocumentos: this.historico.length,
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
            
            this.historico.forEach(doc => {
                // Por tipo
                const tipo = doc.tipo_documento || doc.tipo || 'declaracao';
                if (this.statsHistorico.porTipo.hasOwnProperty(tipo)) {
                    this.statsHistorico.porTipo[tipo]++;
                }
                
                // Por usuário
                const usuario = doc.gerado_por || doc.usuario || doc.criado_por || 'desconhecido';
                this.statsHistorico.porUsuario[usuario] = (this.statsHistorico.porUsuario[usuario] || 0) + 1;
                
                // Por empresa
                const empresaNome = doc.dados_documento?.empresa_nome || doc.empresa_nome || 'Empresa Desconhecida';
                const empresaId = doc.dados_documento?.empresa_id || doc.empresa_id || empresaNome;
                if (empresaId) {
                    if (!this.statsHistorico.porEmpresa[empresaId]) {
                        this.statsHistorico.porEmpresa[empresaId] = { nome: empresaNome, total: 0 };
                    }
                    this.statsHistorico.porEmpresa[empresaId].total++;
                }
                
                // Por dia
                const data = (doc.gerado_em || doc.data || doc.created_at || '').split('T')[0];
                if (data) {
                    this.statsHistorico.porDia[data] = (this.statsHistorico.porDia[data] || 0) + 1;
                }
            });
            
            // Preencher últimos 30 dias com zeros se não houver dados
            if (Object.keys(this.statsHistorico.porDia).length === 0) {
                const hoje = new Date();
                for (let i = 29; i >= 0; i--) {
                    const data = new Date(hoje);
                    data.setDate(data.getDate() - i);
                    const key = data.toISOString().split('T')[0];
                    this.statsHistorico.porDia[key] = 0;
                }
            }
            
            // Calcula insights
            this.calcularInsights();
            
            console.log(`📊 Total de documentos: ${this.statsHistorico.totalDocumentos}`);
            console.log(`📊 Por tipo:`, this.statsHistorico.porTipo);
        },
        
        /**
         * Aplica filtros ao histórico
         */
        aplicarFiltrosHistorico() {
            let filtrado = [...this.historico];
            
            // Filtro por usuário
            if (this.filtrosHistorico.usuario) {
                filtrado = filtrado.filter(doc => 
                    (doc.gerado_por || doc.usuario || doc.criado_por) === this.filtrosHistorico.usuario
                );
            }
            
            // Filtro por tipo de documento
            if (this.filtrosHistorico.tipo_documento) {
                filtrado = filtrado.filter(doc => 
                    (doc.tipo_documento || doc.tipo) === this.filtrosHistorico.tipo_documento
                );
            }
            
            // Filtro por data início
            if (this.filtrosHistorico.data_inicio) {
                const dataInicio = new Date(this.filtrosHistorico.data_inicio);
                filtrado = filtrado.filter(doc => {
                    const dataDoc = new Date(doc.gerado_em || doc.data || doc.created_at);
                    return dataDoc >= dataInicio;
                });
            }
            
            // Filtro por data fim
            if (this.filtrosHistorico.data_fim) {
                const dataFim = new Date(this.filtrosHistorico.data_fim);
                dataFim.setHours(23, 59, 59, 999); // Fim do dia
                filtrado = filtrado.filter(doc => {
                    const dataDoc = new Date(doc.gerado_em || doc.data || doc.created_at);
                    return dataDoc <= dataFim;
                });
            }
            
            // Busca textual
            if (this.filtrosHistorico.busca) {
                const busca = this.filtrosHistorico.busca.toLowerCase();
                filtrado = filtrado.filter(doc => {
                    const nif = (doc.dados_documento?.trabalhador_nif || doc.nif || '').toLowerCase();
                    const empresa = (doc.dados_documento?.empresa_nome || doc.empresa_nome || '').toLowerCase();
                    const trabalhador = (doc.dados_documento?.trabalhador_nome || doc.trabalhador_nome || '').toLowerCase();
                    return nif.includes(busca) || empresa.includes(busca) || trabalhador.includes(busca);
                });
            }
            
            this.historicoFiltrado = filtrado;
            console.log(`✅ ${filtrado.length} documentos após filtros`);
        },
        
        /**
         * ✅ SIMPLIFICADO: Busca documentos por texto
         */
        buscarDocumentos() {
            if (!this.filtrosHistorico.busca) {
                this.historicoFiltrado = this.historico;
                return;
            }
            
            const busca = this.filtrosHistorico.busca.toLowerCase();
            this.historicoFiltrado = this.historico.filter(doc => 
                (doc.trabalhador_nome || '').toLowerCase().includes(busca) ||
                (doc.empresa_nome || '').toLowerCase().includes(busca) ||
                (doc.tipo || '').toLowerCase().includes(busca) ||
                (doc.usuario || '').toLowerCase().includes(busca)
            );
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
         * Regenerar PDF de um documento do histórico
         */
        /**
         * ✅ DESABILITADO: Regeneração de PDF (requer historicoManager)
         */
        async regenerarPDF(documento) {
            this.showAlert('Função de regeneração desabilitada no modo simplificado.', 'error');
        },        /**
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
