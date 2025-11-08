// ============================================
// GITHUB-API.JS
// Módulo de comunicação com GitHub API
// ============================================

class GitHubAPI {
    constructor() {
        this.baseURL = 'https://api.github.com';
        this.token = null;
        this.owner = null;  // Será configurado depois do login
        this.repo = null;   // Será configurado depois do login
        this.branch = 'master';  // Branch padrão
        this.user = null;
    }

    // ========== CONFIGURAÇÃO ==========

    configurar(config) {
        this.owner = config.owner;
        this.repo = config.repo;
        this.branch = config.branch || 'master';
        console.log(`✅ GitHub API configurado: ${this.owner}/${this.repo} (${this.branch})`);
    }

    setToken(token) {
        this.token = token;
        console.log('🔑 Token configurado');
    }

    setUser(user) {
        this.user = user;
        console.log(`👤 Usuário: ${user.login}`);
    }

    // ========== HEADERS AUTENTICADOS ==========

    getHeaders() {
        const headers = {
            'Accept': 'application/vnd.github.v3+json',
            'Content-Type': 'application/json'
        };

        if (this.token) {
            headers['Authorization'] = `token ${this.token}`;
        }

        return headers;
    }

    // ========== USUÁRIO AUTENTICADO ==========

    async getAuthenticatedUser() {
        try {
            const response = await fetch(`${this.baseURL}/user`, {
                headers: this.getHeaders()
            });

            if (!response.ok) {
                throw new Error(`GitHub API Error: ${response.status}`);
            }

            const user = await response.json();
            this.setUser(user);
            return user;

        } catch (error) {
            console.error('❌ Erro ao obter usuário:', error);
            throw error;
        }
    }

    // ========== LER ARQUIVO DO REPO ==========

    async lerArquivo(path) {
        try {
            const url = `${this.baseURL}/repos/${this.owner}/${this.repo}/contents/${path}`;
            
            console.log(`📂 Lendo arquivo: ${path}`);
            
            const response = await fetch(url, {
                headers: this.getHeaders()
            });

            if (response.status === 404) {
                console.log(`📝 Arquivo não existe: ${path}`);
                return null;
            }

            if (!response.ok) {
                const errorText = await response.text();
                console.error(`❌ Erro HTTP ${response.status}:`, errorText);
                throw new Error(`GitHub API Error: ${response.status} - ${errorText}`);
            }

            const data = await response.json();

            // Decodificar conteúdo Base64 com suporte UTF-8 correto
            // Primeiro remove quebras de linha do base64
            const base64Clean = data.content.replace(/\n/g, '');
            // Decodifica base64 para string binária
            const binaryString = atob(base64Clean);
            // Converte string binária para array de bytes
            const bytes = new Uint8Array(binaryString.length);
            for (let i = 0; i < binaryString.length; i++) {
                bytes[i] = binaryString.charCodeAt(i);
            }
            // Decodifica UTF-8 corretamente
            const content = new TextDecoder('utf-8').decode(bytes);

            console.log(`✅ Arquivo lido: ${path} (${data.size} bytes)`);

            return {
                content: content,
                sha: data.sha,
                path: data.path,
                size: data.size
            };

        } catch (error) {
            console.error(`❌ Erro ao ler arquivo ${path}:`, error);
            throw error;
        }
    }

    // ========== LER JSON DO REPO ==========

    async lerJSON(path) {
        try {
            const arquivo = await this.lerArquivo(path);
            
            if (!arquivo) {
                return null;
            }

            return {
                data: JSON.parse(arquivo.content),
                sha: arquivo.sha
            };

        } catch (error) {
            console.error(`❌ Erro ao ler JSON ${path}:`, error);
            throw error;
        }
    }

    // ========== CRIAR/ATUALIZAR ARQUIVO ==========

    async salvarArquivo(path, content, message, sha = null) {
        try {
            const url = `${this.baseURL}/repos/${this.owner}/${this.repo}/contents/${path}`;

            // Encodar conteúdo para Base64 com suporte UTF-8 correto
            // Converte string para UTF-8 bytes
            const utf8Bytes = new TextEncoder().encode(content);
            // Converte bytes para string binária
            let binaryString = '';
            for (let i = 0; i < utf8Bytes.length; i++) {
                binaryString += String.fromCharCode(utf8Bytes[i]);
            }
            // Encodifica para base64
            const contentBase64 = btoa(binaryString);

            const body = {
                message: message,
                content: contentBase64,
                branch: this.branch
            };

            // Se está atualizando, precisa do SHA
            if (sha) {
                body.sha = sha;
            }

            const response = await fetch(url, {
                method: 'PUT',
                headers: this.getHeaders(),
                body: JSON.stringify(body)
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(`GitHub API Error: ${response.status} - ${error.message}`);
            }

            const result = await response.json();

            console.log(`✅ Arquivo salvo: ${path}`);

            return {
                success: true,
                sha: result.content.sha,
                commit: result.commit.sha
            };

        } catch (error) {
            console.error(`❌ Erro ao salvar arquivo ${path}:`, error);
            throw error;
        }
    }

    // ========== SALVAR JSON ==========

    async salvarJSON(path, data, message, sha = null) {
        console.log(`💾 Salvando JSON: ${path}${sha ? ' (atualizando)' : ' (novo)'}`);
        const content = JSON.stringify(data, null, 2);
        const result = await this.salvarArquivo(path, content, message, sha);
        console.log(`✅ JSON salvo com sucesso: ${path}`);
        return result;
    }

    // ========== UPLOAD DE IMAGEM (BASE64) ==========

    async uploadImagem(path, base64Data, message, sha = null) {
        try {
            const url = `${this.baseURL}/repos/${this.owner}/${this.repo}/contents/${path}`;

            // Remover prefixo "data:image/png;base64," se existir
            const base64Clean = base64Data.replace(/^data:image\/\w+;base64,/, '');

            const body = {
                message: message,
                content: base64Clean,
                branch: this.branch
            };

            // Se está atualizando arquivo existente, precisa do SHA
            if (sha) {
                body.sha = sha;
            }

            const response = await fetch(url, {
                method: 'PUT',
                headers: this.getHeaders(),
                body: JSON.stringify(body)
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(`Upload Error: ${response.status} - ${error.message}`);
            }

            const result = await response.json();

            console.log(`✅ Imagem enviada: ${path}`);

            return {
                success: true,
                url: result.content.download_url,
                sha: result.content.sha,
                path: result.content.path
            };

        } catch (error) {
            console.error(`❌ Erro ao fazer upload de imagem ${path}:`, error);
            throw error;
        }
    }

    // ========== UPLOAD DE ARQUIVO GENÉRICO (Alias para uploadImagem) ==========
    
    async uploadFile(path, base64Content, message, sha = null) {
        console.log(`📤 Uploading file: ${path}${sha ? ' (updating)' : ' (new)'}`);
        return await this.uploadImagem(path, base64Content, message, sha);
    }

    // ========== OBTER INFORMAÇÕES DE ARQUIVO (para verificar se existe) ==========

    async getFile(path) {
        try {
            const url = `${this.baseURL}/repos/${this.owner}/${this.repo}/contents/${path}`;
            
            console.log(`🔍 Verificando arquivo: ${path}`);
            
            const response = await fetch(url, {
                headers: this.getHeaders()
            });

            if (response.status === 404) {
                console.log(`📝 Arquivo não existe: ${path}`);
                return null;
            }

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`GitHub API Error: ${response.status} - ${errorText}`);
            }

            const data = await response.json();

            console.log(`✅ Arquivo encontrado: ${path}`);

            return {
                sha: data.sha,
                path: data.path,
                size: data.size,
                url: data.download_url,
                content: data.content // Base64
            };

        } catch (error) {
            console.error(`❌ Erro ao obter arquivo ${path}:`, error);
            throw error;
        }
    }

    // ========== DELETAR ARQUIVO ==========

    async deletarArquivo(path, message) {
        try {
            // Primeiro precisa obter o SHA do arquivo
            const arquivo = await this.lerArquivo(path);
            
            if (!arquivo) {
                console.log(`⚠️ Arquivo não existe: ${path}`);
                return { success: true };
            }

            const url = `${this.baseURL}/repos/${this.owner}/${this.repo}/contents/${path}`;

            const response = await fetch(url, {
                method: 'DELETE',
                headers: this.getHeaders(),
                body: JSON.stringify({
                    message: message,
                    sha: arquivo.sha,
                    branch: this.branch
                })
            });

            if (!response.ok) {
                throw new Error(`GitHub API Error: ${response.status}`);
            }

            console.log(`🗑️ Arquivo deletado: ${path}`);

            return { success: true };

        } catch (error) {
            console.error(`❌ Erro ao deletar arquivo ${path}:`, error);
            throw error;
        }
    }

    // ========== LISTAR ARQUIVOS DE UMA PASTA ==========

    async listarPasta(path) {
        try {
            const url = `${this.baseURL}/repos/${this.owner}/${this.repo}/contents/${path}`;

            const response = await fetch(url, {
                headers: this.getHeaders()
            });

            if (!response.ok) {
                throw new Error(`GitHub API Error: ${response.status}`);
            }

            const files = await response.json();

            return files.map(file => ({
                name: file.name,
                path: file.path,
                type: file.type,
                sha: file.sha,
                size: file.size,
                url: file.download_url
            }));

        } catch (error) {
            console.error(`❌ Erro ao listar pasta ${path}:`, error);
            throw error;
        }
    }

    // ========== OBTER ÚLTIMO COMMIT ==========

    async getUltimoCommit() {
        try {
            const url = `${this.baseURL}/repos/${this.owner}/${this.repo}/commits/${this.branch}`;

            const response = await fetch(url, {
                headers: this.getHeaders()
            });

            if (!response.ok) {
                throw new Error(`GitHub API Error: ${response.status}`);
            }

            const commit = await response.json();

            return {
                sha: commit.sha,
                message: commit.commit.message,
                author: commit.commit.author.name,
                date: commit.commit.author.date
            };

        } catch (error) {
            console.error('❌ Erro ao obter último commit:', error);
            throw error;
        }
    }

    // ========== VERIFICAR SE REPO EXISTE ==========

    async verificarRepo() {
        try {
            const url = `${this.baseURL}/repos/${this.owner}/${this.repo}`;

            const response = await fetch(url, {
                headers: this.getHeaders()
            });

            return response.ok;

        } catch (error) {
            return false;
        }
    }

    // ========== CRIAR REPO (se não existir) ==========

    async criarRepo(isPrivate = true) {
        try {
            const url = `${this.baseURL}/user/repos`;

            const response = await fetch(url, {
                method: 'POST',
                headers: this.getHeaders(),
                body: JSON.stringify({
                    name: this.repo,
                    description: 'Gerador de Declarações - Sistema Profissional',
                    private: isPrivate,
                    auto_init: true
                })
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(`Erro ao criar repo: ${error.message}`);
            }

            const repo = await response.json();

            console.log(`✅ Repositório criado: ${repo.full_name}`);

            return repo;

        } catch (error) {
            console.error('❌ Erro ao criar repositório:', error);
            throw error;
        }
    }

    // ========== RATE LIMIT (monitorar uso da API) ==========

    async verificarRateLimit() {
        try {
            const response = await fetch(`${this.baseURL}/rate_limit`, {
                headers: this.getHeaders()
            });

            const data = await response.json();

            console.log('📊 Rate Limit:', {
                usado: data.rate.used,
                limite: data.rate.limit,
                restante: data.rate.remaining,
                reset: new Date(data.rate.reset * 1000).toLocaleString('pt-PT')
            });

            return data.rate;

        } catch (error) {
            console.error('❌ Erro ao verificar rate limit:', error);
            throw error;
        }
    }

    // ========== DEBUG ==========

    debug() {
        console.log('🔍 GitHub API Status:', {
            token: this.token ? '✅ Configurado' : '❌ Não configurado',
            owner: this.owner || 'Não configurado',
            repo: this.repo || 'Não configurado',
            user: this.user ? this.user.login : 'Não autenticado'
        });
    }

    // ========== ALIASES PARA COMPATIBILIDADE ==========
    // Alguns códigos usam readJSON/writeJSON, outros lerJSON/salvarJSON
    // Criando aliases para funcionar com ambos
    
    async readJSON(path) {
        return await this.lerJSON(path);
    }

    async writeJSON(path, data, message, sha = null) {
        return await this.salvarJSON(path, data, message, sha);
    }
}

// Exportar instância global
const githubAPI = new GitHubAPI();
