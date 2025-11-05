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
        
        // Dados
        users: [],
        filtro: 'all', // all | active | pending | blocked
        searchQuery: '',
        
        // Stats
        stats: {
            total: 0,
            active: 0,
            pending: 0,
            blocked: 0,
            totalClientes: 0,
            totalDeclaracoes: 0
        },
        
        // Modal
        modalDetalhes: false,
        selectedUser: null,
        
        // Managers
        userManager: null,
        
        /**
         * Inicialização
         */
        async init() {
            console.log('🎯 Iniciando Users Controller...');
            
            // Verifica autenticação
            if (!authManager.isAuthenticated()) {
                window.location.href = 'index.html';
                return;
            }
            
            // Inicializa managers
            this.userManager = new UserManager();
            
            // Carrega dados
            await this.carregarUsuarios();
            
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
            if (!confirm('Aprovar este usuário?')) return;
            
            this.loading = true;
            this.loadingMessage = 'Aprovando usuário...';
            
            try {
                // Obter username do admin do GitHub API
                const adminUser = await githubAPI.getUser();
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
            if (!confirm('Bloquear este usuário? Ele não poderá mais acessar o sistema.')) return;
            
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
            if (!confirm('Desbloquear este usuário?')) return;
            
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
            if (!confirm('Rejeitar este usuário? Ele será removido permanentemente da lista.')) return;
            
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
