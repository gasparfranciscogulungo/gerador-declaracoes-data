// ============================================
// PASSWORD-MANAGER.JS
// Gerenciador de autenticação com senha + token criptografado
// ============================================

class PasswordManager {
    
    constructor() {
        this.LAST_USERNAME_KEY = 'last_username';
        this.AUTH_DIR = 'data/auth';
    }

    // ========== CRIAR CONTA (Primeira vez) ==========
    
    async criarConta(username, password, token, profile) {
        try {
            // 1. Validar senha
            const validacao = CryptoUtils.validarSenha(password);
            if (!validacao.valida) {
                throw new Error(validacao.erros.join('. '));
            }

            // 2. Criptografar token com a senha
            const tokenEncrypted = await CryptoUtils.encrypt(token, password);
            
            // 3. Hash da senha (para verificação)
            const passwordHash = await CryptoUtils.sha256(password);
            
            // 4. Verificar se é admin
            const isAdmin = CONFIG.admins.includes(username);
            
            // 5. Montar objeto de autenticação
            const authData = {
                username: username,
                tokenEncrypted: tokenEncrypted,
                passwordHash: passwordHash,
                isAdmin: isAdmin,
                profile: {
                    name: profile.name || username,
                    avatar: profile.avatar_url || '',
                    email: profile.email || '',
                    company: profile.company || ''
                },
                createdAt: new Date().toISOString(),
                lastLogin: new Date().toISOString()
            };
            
            // 6. Salvar no GitHub
            await githubAPI.salvarJSON(
                `${this.AUTH_DIR}/${username}.json`,
                authData,
                `🔐 Criar conta para ${username}`
            );
            
            // 7. Salvar último username localmente
            this.salvarUltimoUsername(username);
            
            console.log(`✅ Conta criada para ${username} (Admin: ${isAdmin})`);
            
            return {
                success: true,
                isAdmin: isAdmin,
                profile: authData.profile
            };
            
        } catch (error) {
            console.error('❌ Erro ao criar conta:', error);
            throw error;
        }
    }

    // ========== LOGIN COM SENHA ==========
    
    async loginComSenha(username, password) {
        try {
            // 1. Buscar arquivo de autenticação do GitHub
            const authData = await githubAPI.lerJSON(`${this.AUTH_DIR}/${username}.json`);
            
            if (!authData) {
                throw new Error('Usuário não encontrado. Use "Primeiro acesso" para criar conta.');
            }
            
            // 2. Verificar senha
            const passwordHash = await CryptoUtils.sha256(password);
            
            if (passwordHash !== authData.passwordHash) {
                throw new Error('Senha incorreta');
            }
            
            // 3. Descriptografar token
            const token = await CryptoUtils.decrypt(authData.tokenEncrypted, password);
            
            if (!token || !token.startsWith('ghp_')) {
                throw new Error('Token inválido. Por favor, refaça o login com GitHub.');
            }
            
            // 4. Configurar sistema com o token
            githubAPI.setToken(token);
            authManager.salvarToken(token);
            
            // 5. Atualizar último login
            authData.lastLogin = new Date().toISOString();
            await githubAPI.salvarJSON(
                `${this.AUTH_DIR}/${username}.json`,
                authData,
                `🔓 Login de ${username}`
            );
            
            // 6. Salvar último username
            this.salvarUltimoUsername(username);
            
            console.log(`✅ Login bem-sucedido: ${username}`);
            
            return {
                success: true,
                isAdmin: authData.isAdmin,
                profile: authData.profile,
                token: token
            };
            
        } catch (error) {
            console.error('❌ Erro no login:', error);
            throw error;
        }
    }

    // ========== RECUPERAR SENHA (Recriar com novo token) ==========
    
    async recuperarSenha(username, novaSenha, novoToken, profile) {
        try {
            // Funciona igual a criar conta, mas sobrescreve arquivo existente
            console.log(`🔄 Recuperando senha para ${username}...`);
            return await this.criarConta(username, novaSenha, novoToken, profile);
            
        } catch (error) {
            console.error('❌ Erro ao recuperar senha:', error);
            throw error;
        }
    }

    // ========== TROCAR SENHA (Com senha atual) ==========
    
    async trocarSenha(username, senhaAtual, senhaNova) {
        try {
            // 1. Validar nova senha
            const validacao = CryptoUtils.validarSenha(senhaNova);
            if (!validacao.valida) {
                throw new Error(validacao.erros.join('. '));
            }

            // 2. Fazer login para pegar o token
            const loginResult = await this.loginComSenha(username, senhaAtual);
            const token = loginResult.token;
            
            // 3. Re-criptografar token com nova senha
            const tokenEncrypted = await CryptoUtils.encrypt(token, senhaNova);
            const passwordHash = await CryptoUtils.sha256(senhaNova);
            
            // 4. Buscar dados atuais
            const authData = await githubAPI.lerJSON(`${this.AUTH_DIR}/${username}.json`);
            
            // 5. Atualizar apenas senha e token
            authData.tokenEncrypted = tokenEncrypted;
            authData.passwordHash = passwordHash;
            authData.passwordChangedAt = new Date().toISOString();
            
            // 6. Salvar
            await githubAPI.salvarJSON(
                `${this.AUTH_DIR}/${username}.json`,
                authData,
                `🔑 Troca de senha para ${username}`
            );
            
            console.log(`✅ Senha alterada para ${username}`);
            
            return { success: true };
            
        } catch (error) {
            console.error('❌ Erro ao trocar senha:', error);
            throw error;
        }
    }

    // ========== VERIFICAR SE USUÁRIO EXISTE ==========
    
    async usuarioExiste(username) {
        try {
            const authData = await githubAPI.lerJSON(`${this.AUTH_DIR}/${username}.json`);
            return !!authData;
        } catch (error) {
            return false;
        }
    }

    // ========== SALVAR/OBTER ÚLTIMO USERNAME ==========
    
    salvarUltimoUsername(username) {
        localStorage.setItem(this.LAST_USERNAME_KEY, username);
    }

    obterUltimoUsername() {
        return localStorage.getItem(this.LAST_USERNAME_KEY) || '';
    }

    limparUltimoUsername() {
        localStorage.removeItem(this.LAST_USERNAME_KEY);
    }

    // ========== LOGOUT ==========
    
    async logout() {
        authManager.logout();
        // Não limpar último username (para facilitar próximo login)
        console.log('👋 Logout realizado');
    }
}

// Instância global
const passwordManager = new PasswordManager();
window.passwordManager = passwordManager;

console.log('🔑 PasswordManager carregado');
