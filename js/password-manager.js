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
            console.log(`🔐 Iniciando criação de conta para: ${username}`);
            
            // 1. Validar senha
            const validacao = CryptoUtils.validarSenha(password);
            if (!validacao.valida) {
                throw new Error(validacao.erros.join('. '));
            }

            // 2. Criptografar token com a senha
            console.log('🔒 Criptografando token...');
            const tokenEncrypted = await CryptoUtils.encrypt(token, password);
            
            // 3. Hash da senha (para verificação)
            console.log('🔑 Gerando hash da senha...');
            const passwordHash = await CryptoUtils.sha256(password);
            
            // 4. Verificar se é admin
            const isAdmin = CONFIG.admins.includes(username);
            console.log(`👤 Admin: ${isAdmin}`);
            
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
            
            // 6. Verificar se arquivo já existe
            const authPath = `${this.AUTH_DIR}/${username}.json`;
            console.log(`📝 Salvando em: ${authPath}`);
            
            const existente = await githubAPI.lerJSON(authPath);
            const sha = existente ? existente.sha : null;
            
            if (existente) {
                console.log('⚠️ Conta já existe, sobrescrevendo...');
            }
            
            // 7. Salvar no GitHub
            const resultado = await githubAPI.salvarJSON(
                authPath,
                authData,
                `🔐 Criar conta para ${username}`,
                sha
            );
            
            console.log('✅ Arquivo salvo no GitHub:', resultado);
            
            // 8. Verificar se salvou corretamente
            console.log('🔍 Verificando se arquivo foi criado...');
            await new Promise(resolve => setTimeout(resolve, 1000)); // Aguardar 1s
            
            const verificacao = await githubAPI.lerJSON(authPath);
            if (!verificacao || !verificacao.data) {
                throw new Error('Erro ao verificar criação do arquivo. Tente novamente.');
            }
            
            console.log('✅ Verificação OK - Arquivo existe');
            
            // 9. Salvar último username localmente
            this.salvarUltimoUsername(username);
            
            // 10. Configurar token no sistema
            githubAPI.setToken(token);
            authManager.salvarToken(token);
            
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
            console.log(`🔓 Tentando login para: ${username}`);
            
            // 1. Buscar arquivo de autenticação do GitHub
            const authPath = `${this.AUTH_DIR}/${username}.json`;
            console.log(`📂 Buscando: ${authPath}`);
            
            let result = await githubAPI.lerJSON(authPath);
            
            // Retry se não encontrar (pode ser delay do GitHub)
            if (!result || !result.data) {
                console.log('⏳ Arquivo não encontrado, aguardando e tentando novamente...');
                await new Promise(resolve => setTimeout(resolve, 2000));
                result = await githubAPI.lerJSON(authPath);
            }
            
            if (!result || !result.data) {
                console.error('❌ Usuário não encontrado após retry');
                throw new Error('Usuário não encontrado. Use "Primeiro acesso" para criar conta.');
            }
            
            const authData = result.data;
            console.log('✅ Arquivo encontrado:', authData.username);
            
            // 2. Verificar senha
            console.log('🔑 Verificando senha...');
            const passwordHash = await CryptoUtils.sha256(password);
            
            if (passwordHash !== authData.passwordHash) {
                console.error('❌ Senha incorreta');
                throw new Error('Senha incorreta');
            }
            
            console.log('✅ Senha correta');
            
            // 3. Descriptografar token
            console.log('🔓 Descriptografando token...');
            const token = await CryptoUtils.decrypt(authData.tokenEncrypted, password);
            
            if (!token || !token.startsWith('ghp_')) {
                console.error('❌ Token inválido após descriptografia');
                throw new Error('Token inválido. Por favor, refaça o login com GitHub.');
            }
            
            console.log('✅ Token descriptografado com sucesso');
            
            // 4. Configurar sistema com o token
            githubAPI.setToken(token);
            authManager.salvarToken(token);
            
            // 5. Atualizar último login
            authData.lastLogin = new Date().toISOString();
            await githubAPI.salvarJSON(
                authPath,
                authData,
                `🔓 Login de ${username}`,
                result.sha
            );
            
            // 6. Salvar último username
            this.salvarUltimoUsername(username);
            
            console.log(`✅ Login bem-sucedido: ${username} (Admin: ${authData.isAdmin})`);
            
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
            const result = await githubAPI.lerJSON(`${this.AUTH_DIR}/${username}.json`);
            const authData = result.data;
            
            // 5. Atualizar apenas senha e token
            authData.tokenEncrypted = tokenEncrypted;
            authData.passwordHash = passwordHash;
            authData.passwordChangedAt = new Date().toISOString();
            
            // 6. Salvar
            await githubAPI.salvarJSON(
                `${this.AUTH_DIR}/${username}.json`,
                authData,
                `🔑 Troca de senha para ${username}`,
                result.sha
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
            console.log(`🔍 Verificando se usuário existe: ${username}`);
            const authPath = `${this.AUTH_DIR}/${username}.json`;
            const result = await githubAPI.lerJSON(authPath);
            const existe = !!(result && result.data);
            console.log(`${existe ? '✅' : '❌'} Usuário ${username} ${existe ? 'EXISTE' : 'NÃO EXISTE'}`);
            return existe;
        } catch (error) {
            console.log(`❌ Erro ao verificar usuário ${username}, assumindo que não existe:`, error.message);
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
