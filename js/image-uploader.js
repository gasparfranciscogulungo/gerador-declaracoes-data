/**
 * ============================================
 * IMAGE UPLOADER - Sistema de Upload de Imagens
 * Gerencia upload de logos e carimbos para GitHub
 * ============================================
 */

class ImageUploader {
    constructor() {
        this.maxFileSize = 2 * 1024 * 1024; // 2MB
        this.allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/svg+xml'];
        this.allowedExtensions = ['.png', '.jpg', '.jpeg', '.svg'];
    }

    /**
     * Valida arquivo de imagem
     * @param {File} file - Arquivo a ser validado
     * @returns {Object} {valid: boolean, error: string}
     */
    validateImage(file) {
        // Verificar se arquivo existe
        if (!file) {
            return { valid: false, error: 'Nenhum arquivo selecionado' };
        }

        // Verificar tipo
        if (!this.allowedTypes.includes(file.type)) {
            return { 
                valid: false, 
                error: `Tipo inválido. Permitidos: ${this.allowedExtensions.join(', ')}` 
            };
        }

        // Verificar tamanho
        if (file.size > this.maxFileSize) {
            const maxSizeMB = (this.maxFileSize / (1024 * 1024)).toFixed(1);
            const fileSizeMB = (file.size / (1024 * 1024)).toFixed(1);
            return { 
                valid: false, 
                error: `Arquivo muito grande (${fileSizeMB}MB). Máximo: ${maxSizeMB}MB` 
            };
        }

        return { valid: true };
    }

    /**
     * Converte arquivo para Base64
     * @param {File} file - Arquivo a ser convertido
     * @returns {Promise<string>} Base64 string
     */
    async fileToBase64(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            
            reader.onload = () => {
                // Remover prefixo "data:image/png;base64," etc
                const base64 = reader.result.split(',')[1];
                resolve(base64);
            };
            
            reader.onerror = () => {
                reject(new Error('Erro ao ler arquivo'));
            };
            
            reader.readAsDataURL(file);
        });
    }

    /**
     * Cria preview da imagem
     * @param {File} file - Arquivo de imagem
     * @param {HTMLElement} previewElement - Elemento onde mostrar preview
     */
    async createPreview(file, previewElement) {
        const url = URL.createObjectURL(file);
        
        previewElement.innerHTML = `
            <img src="${url}" 
                 alt="Preview" 
                 style="max-width: 100%; max-height: 200px; object-fit: contain; border-radius: 8px; border: 2px solid #e5e7eb;">
        `;
        
        // Limpar URL após uso para evitar memory leak
        setTimeout(() => URL.revokeObjectURL(url), 60000);
    }

    /**
     * Faz upload de imagem para GitHub
     * @param {File} file - Arquivo de imagem
     * @param {string} empresaNif - NIF da empresa
     * @param {string} tipo - 'logo' ou 'carimbo'
     * @param {GitHubAPI} githubAPI - Instância do GitHubAPI
     * @returns {Promise<string>} URL da imagem no GitHub
     */
    async uploadToGitHub(file, empresaNif, tipo, githubAPI) {
        try {
            // Validar
            const validation = this.validateImage(file);
            if (!validation.valid) {
                throw new Error(validation.error);
            }

            // Converter para base64
            const base64Content = await this.fileToBase64(file);

            // Sanitizar NIF (remover caracteres especiais)
            const nifSanitizado = empresaNif.replace(/[^a-zA-Z0-9]/g, '');

            // Extensão do arquivo
            const extensao = file.name.split('.').pop().toLowerCase();

            // Caminho no GitHub: assets/empresas/{nif}/{tipo}.{ext}
            const fileName = `${tipo}.${extensao}`;
            const filePath = `assets/empresas/${nifSanitizado}/${fileName}`;

            console.log(`📤 Fazendo upload: ${filePath}`);

            // Verificar se arquivo já existe
            let sha = null;
            try {
                const existingFile = await githubAPI.getFile(filePath);
                sha = existingFile.sha;
                console.log('📝 Arquivo existente encontrado, será substituído');
            } catch (error) {
                console.log('🆕 Arquivo novo, será criado');
            }

            // Fazer upload
            const result = await githubAPI.uploadFile(
                filePath,
                base64Content,
                `Upload ${tipo} da empresa ${nifSanitizado}`,
                sha // Se existe, substitui; se null, cria novo
            );

            // URL direta do GitHub (raw content)
            const githubUrl = `https://raw.githubusercontent.com/${githubAPI.owner}/${githubAPI.repo}/${githubAPI.branch}/${filePath}`;

            console.log(`✅ Upload concluído: ${githubUrl}`);

            return githubUrl;

        } catch (error) {
            console.error('❌ Erro no upload:', error);
            throw error;
        }
    }

    /**
     * Atualiza dados da empresa com nova URL de imagem
     * @param {string} empresaId - ID da empresa
     * @param {string} tipo - 'logo' ou 'carimbo'
     * @param {string} imageUrl - URL da imagem
     * @param {GitHubAPI} githubAPI - Instância do GitHubAPI
     */
    async updateEmpresaImage(empresaId, tipo, imageUrl, githubAPI) {
        try {
            // Buscar empresas.json
            const empresasData = await githubAPI.getFile('data/empresas.json');
            const empresas = JSON.parse(atob(empresasData.content));

            // Encontrar empresa
            const empresa = empresas.find(e => e.id === empresaId);
            if (!empresa) {
                throw new Error(`Empresa ${empresaId} não encontrada`);
            }

            // Atualizar campo
            empresa[tipo] = imageUrl;

            // Salvar de volta
            const novoConteudo = JSON.stringify(empresas, null, 2);
            await githubAPI.uploadFile(
                'data/empresas.json',
                btoa(unescape(encodeURIComponent(novoConteudo))),
                `Atualizar ${tipo} da empresa ${empresa.nome}`,
                empresasData.sha
            );

            console.log(`✅ empresas.json atualizado: ${tipo} = ${imageUrl}`);

            return empresa;

        } catch (error) {
            console.error('❌ Erro ao atualizar empresas.json:', error);
            throw error;
        }
    }

    /**
     * Processo completo: upload + atualização de dados
     * @param {File} file - Arquivo de imagem
     * @param {Object} empresa - Objeto da empresa
     * @param {string} tipo - 'logo' ou 'carimbo'
     * @param {GitHubAPI} githubAPI - Instância do GitHubAPI
     * @param {Function} onProgress - Callback de progresso
     * @returns {Promise<Object>} Empresa atualizada
     */
    async processImageUpload(file, empresa, tipo, githubAPI, onProgress = null) {
        try {
            // 1. Validar
            if (onProgress) onProgress('Validando imagem...', 10);
            const validation = this.validateImage(file);
            if (!validation.valid) {
                throw new Error(validation.error);
            }

            // 2. Upload para GitHub
            if (onProgress) onProgress(`Enviando ${tipo} para GitHub...`, 30);
            const imageUrl = await this.uploadToGitHub(file, empresa.nif, tipo, githubAPI);

            // 3. Atualizar empresas.json
            if (onProgress) onProgress('Atualizando dados da empresa...', 70);
            const empresaAtualizada = await this.updateEmpresaImage(empresa.id, tipo, imageUrl, githubAPI);

            // 4. Concluído
            if (onProgress) onProgress('Concluído!', 100);

            return {
                success: true,
                empresa: empresaAtualizada,
                imageUrl: imageUrl
            };

        } catch (error) {
            if (onProgress) onProgress(`Erro: ${error.message}`, 0);
            throw error;
        }
    }
}

// Exportar para uso global
if (typeof window !== 'undefined') {
    window.ImageUploader = ImageUploader;
}
