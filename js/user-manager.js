// ============================================
// USER-MANAGER.JS
// Gerenciador de Usuários do Sistema
// ============================================

class UserManager {
    
    constructor() {
        this.USERS_PATH = 'data/users.json';
        this.users = [];
        this.metadata = {};
    }

    // ========== CARREGAR USUÁRIOS ==========
    
    async carregarUsers() {
        try {
            console.log('📂 Carregando usuários...');
            const result = await githubAPI.lerJSON(this.USERS_PATH);
            
            if (result && result.data) {
                this.users = result.data.users || [];
                this.metadata = result.data.metadata || {};
                console.log(`✅ ${this.users.length} usuários carregados`);
                return { sha: result.sha, users: this.users, metadata: this.metadata };
            }
            
            return null;
        } catch (error) {
            console.error('❌ Erro ao carregar usuários:', error);
            throw error;
        }
    }

    // ========== SALVAR USUÁRIOS ==========
    
    async salvarUsers(sha = null) {
        try {
            console.log('💾 Salvando usuários...');
            
            const data = {
                users: this.users,
                metadata: this.metadata
            };
            
            const result = await githubAPI.salvarJSON(
                this.USERS_PATH,
                data,
                '👥 Atualizar lista de usuários',
                sha
            );
            
            console.log('✅ Usuários salvos com sucesso');
            return result;
        } catch (error) {
            console.error('❌ Erro ao salvar usuários:', error);
            throw error;
        }
    }

    // ========== VERIFICAR SE USUÁRIO ESTÁ AUTORIZADO ==========
    
    async verificarAutorizacao(username, token = null) {
        try {
            await this.carregarUsers();
            
            const user = this.users.find(u => u.username === username);
            
            if (!user) {
                return { autorizado: false, status: 'not_found', user: null };
            }
            
            // Atualizar token se fornecido e diferente
            if (token && user.token !== token) {
                console.log('🔄 Atualizando token do usuário...');
                user.token = token;
                const loaded = await this.carregarUsers();
                await this.salvarUsers(loaded.sha);
            }
            
            if (user.status === 'active') {
                return { autorizado: true, status: 'active', user: user };
            }
            
            if (user.status === 'pending') {
                return { autorizado: false, status: 'pending', user: user };
            }
            
            if (user.status === 'blocked') {
                return { autorizado: false, status: 'blocked', user: user };
            }
            
            return { autorizado: false, status: 'unknown', user: user };
            
        } catch (error) {
            console.error('❌ Erro ao verificar autorização:', error);
            throw error;
        }
    }

    // ========== ADICIONAR NOVO USUÁRIO (PENDENTE) ==========
    
    async adicionarPendente(userData) {
        try {
            const loaded = await this.carregarUsers();
            
            // Verificar se já existe
            const existe = this.users.find(u => u.username === userData.username);
            if (existe) {
                console.log('⚠️ Usuário já existe:', userData.username);
                return { success: false, message: 'Usuário já existe', user: existe };
            }
            
            // Criar novo usuário
            const newUser = {
                id: this.metadata.lastId + 1,
                username: userData.username,
                name: userData.name || userData.username,
                avatar: userData.avatar || `https://github.com/${userData.username}.png`,
                token: userData.token || '',
                role: 'user',
                status: 'pending',
                stats: {
                    clientes: 0,
                    declaracoes: 0,
                    ultimoAcesso: new Date().toISOString()
                },
                createdAt: new Date().toISOString(),
                authorizedBy: null
            };
            
            this.users.push(newUser);
            
            // Atualizar metadata
            this.metadata.lastId = newUser.id;
            this.metadata.totalUsers = this.users.length;
            this.metadata.totalPending = this.users.filter(u => u.status === 'pending').length;
            
            await this.salvarUsers(loaded.sha);
            
            console.log('✅ Usuário pendente adicionado:', newUser.username);
            return { success: true, user: newUser };
            
        } catch (error) {
            console.error('❌ Erro ao adicionar pendente:', error);
            throw error;
        }
    }

    // ========== APROVAR USUÁRIO ==========
    
    async aprovarUser(userId, adminUsername) {
        try {
            const loaded = await this.carregarUsers();
            
            const user = this.users.find(u => u.id === userId);
            if (!user) {
                throw new Error('Usuário não encontrado');
            }
            
            user.status = 'active';
            user.authorizedBy = adminUsername;
            
            // Atualizar metadata
            this.metadata.totalActive = this.users.filter(u => u.status === 'active').length;
            this.metadata.totalPending = this.users.filter(u => u.status === 'pending').length;
            
            await this.salvarUsers(loaded.sha);
            
            console.log('✅ Usuário aprovado:', user.username);
            return { success: true, user: user };
            
        } catch (error) {
            console.error('❌ Erro ao aprovar usuário:', error);
            throw error;
        }
    }

    // ========== BLOQUEAR USUÁRIO ==========
    
    async bloquearUser(userId) {
        try {
            const loaded = await this.carregarUsers();
            
            const user = this.users.find(u => u.id === userId);
            if (!user) {
                throw new Error('Usuário não encontrado');
            }
            
            user.status = 'blocked';
            
            // Atualizar metadata
            this.metadata.totalActive = this.users.filter(u => u.status === 'active').length;
            this.metadata.totalBlocked = this.users.filter(u => u.status === 'blocked').length;
            
            await this.salvarUsers(loaded.sha);
            
            console.log('🚫 Usuário bloqueado:', user.username);
            return { success: true, user: user };
            
        } catch (error) {
            console.error('❌ Erro ao bloquear usuário:', error);
            throw error;
        }
    }

    // ========== DESBLOQUEAR USUÁRIO ==========
    
    async desbloquearUser(userId) {
        try {
            const loaded = await this.carregarUsers();
            
            const user = this.users.find(u => u.id === userId);
            if (!user) {
                throw new Error('Usuário não encontrado');
            }
            
            user.status = 'active';
            
            // Atualizar metadata
            this.metadata.totalActive = this.users.filter(u => u.status === 'active').length;
            this.metadata.totalBlocked = this.users.filter(u => u.status === 'blocked').length;
            
            await this.salvarUsers(loaded.sha);
            
            console.log('🔓 Usuário desbloqueado:', user.username);
            return { success: true, user: user };
            
        } catch (error) {
            console.error('❌ Erro ao desbloquear usuário:', error);
            throw error;
        }
    }

    // ========== REJEITAR USUÁRIO ==========
    
    async rejeitarUser(userId) {
        try {
            const loaded = await this.carregarUsers();
            
            const index = this.users.findIndex(u => u.id === userId);
            if (index === -1) {
                throw new Error('Usuário não encontrado');
            }
            
            const user = this.users[index];
            this.users.splice(index, 1);
            
            // Atualizar metadata
            this.metadata.totalUsers = this.users.length;
            this.metadata.totalPending = this.users.filter(u => u.status === 'pending').length;
            
            await this.salvarUsers(loaded.sha);
            
            console.log('❌ Usuário rejeitado e removido:', user.username);
            return { success: true };
            
        } catch (error) {
            console.error('❌ Erro ao rejeitar usuário:', error);
            throw error;
        }
    }

    // ========== ATUALIZAR ÚLTIMO ACESSO ==========
    
    async atualizarAcesso(username) {
        try {
            const loaded = await this.carregarUsers();
            
            const user = this.users.find(u => u.username === username);
            if (user) {
                user.stats.ultimoAcesso = new Date().toISOString();
                await this.salvarUsers(loaded.sha);
            }
            
        } catch (error) {
            console.error('⚠️ Erro ao atualizar acesso:', error);
            // Não lançar erro, é só uma atualização de timestamp
        }
    }

    // ========== OBTER USUÁRIOS PENDENTES ==========
    
    async obterPendentes() {
        await this.carregarUsers();
        return this.users.filter(u => u.status === 'pending');
    }

    // ========== OBTER ESTATÍSTICAS ==========
    
    async obterEstatisticas() {
        await this.carregarUsers();
        
        return {
            total: this.users.length,
            active: this.users.filter(u => u.status === 'active').length,
            pending: this.users.filter(u => u.status === 'pending').length,
            blocked: this.users.filter(u => u.status === 'blocked').length,
            totalClientes: this.users.reduce((sum, u) => sum + (u.stats.clientes || 0), 0),
            totalDeclaracoes: this.users.reduce((sum, u) => sum + (u.stats.declaracoes || 0), 0)
        };
    }
}

// Instância global
const userManager = new UserManager();
window.userManager = userManager;

console.log('👥 UserManager carregado');
