// ============================================
// AUTH.JS - Sistema de Autenticação Simplificado
// Versão: 2.0 - Auto-cadastro direto sem aprovação
// ============================================

class SimpleAuth {
    constructor() {
        this.token = localStorage.getItem('auth_token');
        this.username = localStorage.getItem('auth_username');
        this.role = localStorage.getItem('auth_role');
    }

    // ========== LOGIN ==========
    async login(token) {
        try {
            console.log('🔐 Iniciando login...');
            
            // 1. Configurar GitHub API
            githubAPI.setToken(token);
            githubAPI.configurar(CONFIG.github);
            
            // 2. Verificar se token é válido
            console.log('🔍 Verificando token...');
            const githubUser = await githubAPI.getAuthenticatedUser();
            console.log('✅ Token válido:', githubUser.login);
            
            // 3. Carregar lista de usuários
            console.log('📂 Carregando usuários...');
            const result = await githubAPI.lerJSON('data/users.json');
            const users = result.data || [];
            
            // 4. Verificar se usuário existe
            const user = users.find(u => u.token === token);
            
            if (!user) {
                throw new Error('❌ Token não cadastrado. Entre em contato com o administrador.');
            }
            
            console.log('✅ Usuário encontrado:', user.name);
            
            // 5. Salvar no localStorage
            localStorage.setItem('auth_token', token);
            localStorage.setItem('auth_username', user.username);
            localStorage.setItem('auth_role', user.role);
            
            this.token = token;
            this.username = user.username;
            this.role = user.role;
            
            return {
                success: true,
                user: user,
                isAdmin: user.role === 'admin'
            };
            
        } catch (error) {
            console.error('❌ Erro no login:', error);
            throw error;
        }
    }

    // ========== LOGOUT ==========
    logout() {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('auth_username');
        localStorage.removeItem('auth_role');
        this.token = null;
        this.username = null;
        this.role = null;
        console.log('👋 Logout realizado');
        window.location.href = 'index.html';
    }

    // ========== VERIFICAÇÕES ==========
    isLoggedIn() {
        return !!this.token;
    }

    isAdmin() {
        return this.role === 'admin';
    }

    getUsername() {
        return this.username;
    }

    getToken() {
        return this.token;
    }

    // ========== PROTEÇÃO DE PÁGINA ==========
    async protectPage(requireAdmin = false) {
        if (!this.isLoggedIn()) {
            console.warn('🚫 Não autenticado - Redirecionando...');
            window.location.href = 'index.html';
            return false;
        }

        if (requireAdmin && !this.isAdmin()) {
            console.warn('🚫 Permissão negada - Não é admin');
            alert('Você não tem permissão de administrador!');
            window.location.href = 'index.html';
            return false;
        }

        // Configurar GitHub API com token salvo
        githubAPI.setToken(this.token);
        githubAPI.configurar(CONFIG.github);

        return true;
    }
}

// Instância global
const simpleAuth = new SimpleAuth();

console.log('🔐 SimpleAuth carregado');
