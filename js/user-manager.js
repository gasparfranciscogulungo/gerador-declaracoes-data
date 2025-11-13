// ============================================
// USER-MANAGER.JS
// Gerenciador de Usuários do Sistema
// ============================================

class UserManager {
    
    constructor() {
        this.USERS_PATH = 'data/users.json';
        this.users = [];
        this.metadata = {};
        this.CACHE_KEY = 'auth_cache';
        this.CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 horas
    }
    
    // ========== HASH DE TOKEN (SEGURANÇA) ==========
    
    async hashToken(token) {
        try {
            // SHA-256 hash do token para nunca salvar em texto plano
            const encoder = new TextEncoder();
            const data = encoder.encode(token);
            const hashBuffer = await crypto.subtle.digest('SHA-256', data);
            const hashArray = Array.from(new Uint8Array(hashBuffer));
            const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
            return hashHex;
        } catch (error) {
            console.error('❌ Erro ao criar hash:', error);
            // Fallback simples se crypto.subtle não disponível (ambiente antigo)
            return btoa(token).substring(0, 64);
        }
    }
    
    // ========== CACHE DE AUTORIZAÇÃO ==========
    
    getCachedAuth(username, token) {
        try {
            const cached = localStorage.getItem(`${this.CACHE_KEY}_${username}`);
            if (!cached) return null;
            
            const data = JSON.parse(cached);
            const now = Date.now();
            
            // Verificar se cache expirou
            if (now - data.timestamp > this.CACHE_DURATION) {
                this.clearAuthCache(username);
                return null;
            }
            
            // Verificar se token mudou (comparar hash)
            if (data.tokenHash !== this.simpleHash(token)) {
                this.clearAuthCache(username);
                return null;
            }
            
            console.log('✅ Usando cache de autorização para:', username);
            return data.auth;
            
        } catch (error) {
            console.error('⚠️ Erro ao ler cache:', error);
            return null;
        }
    }
    
    setCachedAuth(username, token, authData) {
        try {
            const cacheData = {
                timestamp: Date.now(),
                tokenHash: this.simpleHash(token),
                auth: authData
            };
            localStorage.setItem(`${this.CACHE_KEY}_${username}`, JSON.stringify(cacheData));
            console.log('💾 Cache de autorização salvo para:', username);
        } catch (error) {
            console.error('⚠️ Erro ao salvar cache:', error);
        }
    }
    
    clearAuthCache(username) {
        localStorage.removeItem(`${this.CACHE_KEY}_${username}`);
    }
    
    // Hash simples rápido para comparação (não precisa ser crypto)
    simpleHash(str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        return hash.toString(36);
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
            // OTIMIZAÇÃO: Verificar cache primeiro (evita chamada ao GitHub)
            if (token) {
                const cached = this.getCachedAuth(username, token);
                if (cached) {
                    return cached;
                }
            }
            
            await this.carregarUsers();
            
            const user = this.users.find(u => u.username === username);
            
            if (!user) {
                const result = { autorizado: false, status: 'not_found', user: null };
                return result;
            }
            
            // ⚠️ CORREÇÃO DO BUG: Não atualizar token em CADA login!
            // Tokens devem ser hasheados e salvos apenas quando NOVOS
            // REMOVIDO: Código que causava loop infinito de salvamento
            
            // Preparar resultado baseado no status
            let result;
            
            if (user.status === 'active') {
                result = { autorizado: true, status: 'active', user: user };
            } else if (user.status === 'pending') {
                result = { autorizado: false, status: 'pending', user: user };
            } else if (user.status === 'blocked') {
                result = { autorizado: false, status: 'blocked', user: user };
            } else {
                result = { autorizado: false, status: 'unknown', user: user };
            }
            
            // Salvar cache para próximo login (evita chamadas ao GitHub)
            if (token) {
                this.setCachedAuth(username, token, result);
            }
            
            return result;
            
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
            
            // Hash do token para segurança
            const tokenHash = userData.token ? await this.hashToken(userData.token) : '';
            
            // Criar novo usuário
            const newUser = {
                id: this.metadata.lastId + 1,
                username: userData.username,
                name: userData.name || userData.username,
                avatar: userData.avatar || `https://github.com/${userData.username}.png`,
                tokenHash: tokenHash, // ✅ Salvar HASH, não texto plano
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
