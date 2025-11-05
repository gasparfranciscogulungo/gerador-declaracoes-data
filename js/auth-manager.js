// ============================================
// AUTH-MANAGER.JS
// Gerenciador de autenticação GitHub OAuth
// ============================================

class AuthManager {
    constructor() {
        this.CLIENT_ID = null;  // Será configurado
        this.REDIRECT_URI = window.location.origin + window.location.pathname.replace(/\/[^\/]*$/, '/callback.html');
        this.STORAGE_KEY = 'github_auth';
        this.isAuthenticated = false;
        this.currentUser = null;
    }

    // ========== CONFIGURAÇÃO ==========

    configurar(clientId) {
        this.CLIENT_ID = clientId;
        console.log('🔐 Auth Manager configurado');
    }

    // ========== LOGIN (Redirecionar para GitHub) ==========

    login() {
        if (!this.CLIENT_ID) {
            alert('❌ CLIENT_ID não configurado! Configure primeiro no config.js');
            return;
        }

        const scope = 'repo user'; // Permissões necessárias
        const state = this.gerarState();

        // Salvar state para validação depois
        sessionStorage.setItem('oauth_state', state);

        console.log('🔐 Redirect URI:', this.REDIRECT_URI);

        const authURL = `https://github.com/login/oauth/authorize?client_id=${this.CLIENT_ID}&redirect_uri=${encodeURIComponent(this.REDIRECT_URI)}&scope=${scope}&state=${state}`;

        console.log('🔗 Auth URL completa:', authURL);
        console.log('🔐 Redirecionando para GitHub OAuth...');
        window.location.href = authURL;
    }

    // ========== LOGOUT ==========

    logout() {
        localStorage.removeItem(this.STORAGE_KEY);
        localStorage.removeItem('username');
        sessionStorage.clear();
        this.isAuthenticated = false;
        this.currentUser = null;

        console.log('👋 Logout realizado');

        // Redirecionar para página inicial (caminho relativo)
        window.location.href = 'index.html';
    }

    // ========== PROCESSAR CALLBACK (depois do redirect) ==========

    async processarCallback() {
        try {
            const urlParams = new URLSearchParams(window.location.search);
            const code = urlParams.get('code');
            const state = urlParams.get('state');

            // Validar state
            const savedState = sessionStorage.getItem('oauth_state');
            if (state !== savedState) {
                throw new Error('State inválido! Possível ataque CSRF.');
            }

            if (!code) {
                throw new Error('Código de autorização não encontrado');
            }

            console.log('🔑 Código de autorização recebido');

            // Trocar código por token
            const token = await this.trocarCodigoPorToken(code);

            // Salvar token
            this.salvarToken(token);

            // Configurar GitHub API
            githubAPI.setToken(token);

            // Obter dados do usuário
            const user = await githubAPI.getAuthenticatedUser();
            this.currentUser = user;
            this.isAuthenticated = true;

            console.log('✅ Autenticação completa:', user.login);

            return { success: true, user: user };

        } catch (error) {
            console.error('❌ Erro no callback OAuth:', error);
            throw error;
        }
    }

    // ========== TROCAR CÓDIGO POR TOKEN ==========

    async trocarCodigoPorToken(code) {
        try {
            // IMPORTANTE: Por segurança, este processo DEVE ser feito via servidor proxy
            // Para desenvolvimento/teste, vamos usar uma solução temporária
            
            // Opção 1: Usar serviço proxy gratuito (para testes)
            // https://github-oauth-proxy.vercel.app/
            
            // Opção 2: Token direto (APENAS PARA DESENVOLVIMENTO LOCAL)
            // Em produção, você DEVE usar um backend proxy

            console.warn('⚠️ ATENÇÃO: Para produção, configure um servidor proxy para OAuth!');
            
            // Para desenvolvimento, vamos usar Personal Access Token
            // Usuário deve criar em: https://github.com/settings/tokens
            
            const token = prompt(
                '🔑 DESENVOLVIMENTO: Cole seu Personal Access Token do GitHub\n\n' +
                'Crie em: https://github.com/settings/tokens\n' +
                'Permissões necessárias: repo, user'
            );

            if (!token) {
                throw new Error('Token não fornecido');
            }

            return token;

        } catch (error) {
            console.error('❌ Erro ao obter token:', error);
            throw error;
        }
    }

    // ========== SALVAR/CARREGAR TOKEN ==========

    salvarToken(token) {
        const authData = {
            token: token,
            timestamp: Date.now()
        };
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(authData));
        console.log('💾 Token salvo');
    }

    carregarToken() {
        try {
            const data = localStorage.getItem(this.STORAGE_KEY);
            if (!data) return null;

            const authData = JSON.parse(data);
            return authData.token;

        } catch (error) {
            console.error('Erro ao carregar token:', error);
            return null;
        }
    }

    // ========== VERIFICAR SE ESTÁ AUTENTICADO ==========

    async verificarAutenticacao() {
        try {
            const token = this.carregarToken();

            if (!token) {
                console.log('❌ Não autenticado');
                return false;
            }

            // Configurar API com token
            githubAPI.setToken(token);

            // Verificar se token é válido
            const user = await githubAPI.getAuthenticatedUser();

            if (user) {
                this.currentUser = user;
                this.isAuthenticated = true;
                console.log('✅ Autenticado como:', user.login);
                return true;
            }

            return false;

        } catch (error) {
            console.error('❌ Token inválido ou expirado');
            this.logout();
            return false;
        }
    }

    // ========== PROTEGER PÁGINA (redirecionar se não autenticado) ==========

    async protegerPagina() {
        const autenticado = await this.verificarAutenticacao();

        if (!autenticado) {
            console.log('🔒 Página protegida - Redirecionando para login...');
            window.location.href = '/index.html';
            return false;
        }

        return true;
    }

    // ========== VERIFICAR SE É ADMIN ==========

    isAdmin() {
        if (!this.currentUser) return false;

        // Usar lista de admins do CONFIG
        return CONFIG.admins.includes(this.currentUser.login);
    }

    // ========== OBTER USUÁRIO ATUAL ==========

    getUser() {
        return this.currentUser;
    }

    getUserId() {
        return this.currentUser ? this.currentUser.login : null;
    }

    // ========== UTILITÁRIOS ==========

    gerarState() {
        return Math.random().toString(36).substring(2, 15) + 
               Math.random().toString(36).substring(2, 15);
    }

    // ========== DEBUG ==========

    debug() {
        console.log('🔐 Auth Status:', {
            autenticado: this.isAuthenticated,
            usuario: this.currentUser ? this.currentUser.login : 'Nenhum',
            admin: this.isAdmin(),
            token: this.carregarToken() ? '✅ Presente' : '❌ Ausente'
        });
    }
}

// Exportar instância global
const authManager = new AuthManager();
