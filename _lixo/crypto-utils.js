// ============================================
// CRYPTO-UTILS.JS
// Utilitários de criptografia (AES-256 + SHA-256)
// ============================================

class CryptoUtils {
    
    // ========== SHA-256 (Hash de senha) ==========
    
    static async sha256(text) {
        const encoder = new TextEncoder();
        const data = encoder.encode(text);
        const hashBuffer = await crypto.subtle.digest('SHA-256', data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
        return hashHex;
    }

    // ========== AES-256-GCM (Criptografia) ==========
    
    static async encrypt(text, password) {
        try {
            // 1. Derivar chave da senha
            const passwordKey = await this.deriveKey(password);
            
            // 2. Gerar IV aleatório
            const iv = crypto.getRandomValues(new Uint8Array(12));
            
            // 3. Criptografar
            const encoder = new TextEncoder();
            const data = encoder.encode(text);
            
            const encryptedBuffer = await crypto.subtle.encrypt(
                { name: 'AES-GCM', iv: iv },
                passwordKey,
                data
            );
            
            // 4. Combinar IV + dados criptografados
            const encryptedArray = new Uint8Array(encryptedBuffer);
            const combined = new Uint8Array(iv.length + encryptedArray.length);
            combined.set(iv);
            combined.set(encryptedArray, iv.length);
            
            // 5. Converter para Base64
            return this.arrayBufferToBase64(combined);
            
        } catch (error) {
            console.error('❌ Erro ao criptografar:', error);
            throw new Error('Falha na criptografia');
        }
    }

    static async decrypt(encryptedBase64, password) {
        try {
            // 1. Derivar chave da senha
            const passwordKey = await this.deriveKey(password);
            
            // 2. Converter Base64 para ArrayBuffer
            const combined = this.base64ToArrayBuffer(encryptedBase64);
            
            // 3. Separar IV e dados
            const iv = combined.slice(0, 12);
            const encryptedData = combined.slice(12);
            
            // 4. Descriptografar
            const decryptedBuffer = await crypto.subtle.decrypt(
                { name: 'AES-GCM', iv: iv },
                passwordKey,
                encryptedData
            );
            
            // 5. Converter para texto
            const decoder = new TextDecoder();
            return decoder.decode(decryptedBuffer);
            
        } catch (error) {
            console.error('❌ Erro ao descriptografar:', error);
            throw new Error('Senha incorreta ou dados corrompidos');
        }
    }

    // ========== DERIVAÇÃO DE CHAVE (PBKDF2) ==========
    
    static async deriveKey(password, salt = 'gerador-declaracoes-salt-2025') {
        const encoder = new TextEncoder();
        const passwordBuffer = encoder.encode(password);
        const saltBuffer = encoder.encode(salt);
        
        // Importar senha como chave
        const baseKey = await crypto.subtle.importKey(
            'raw',
            passwordBuffer,
            'PBKDF2',
            false,
            ['deriveKey']
        );
        
        // Derivar chave AES
        const key = await crypto.subtle.deriveKey(
            {
                name: 'PBKDF2',
                salt: saltBuffer,
                iterations: 100000,
                hash: 'SHA-256'
            },
            baseKey,
            { name: 'AES-GCM', length: 256 },
            false,
            ['encrypt', 'decrypt']
        );
        
        return key;
    }

    // ========== CONVERSORES BASE64 ==========
    
    static arrayBufferToBase64(buffer) {
        let binary = '';
        const bytes = new Uint8Array(buffer);
        const len = bytes.byteLength;
        for (let i = 0; i < len; i++) {
            binary += String.fromCharCode(bytes[i]);
        }
        return btoa(binary);
    }

    static base64ToArrayBuffer(base64) {
        const binary = atob(base64);
        const len = binary.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
            bytes[i] = binary.charCodeAt(i);
        }
        return bytes;
    }

    // ========== VALIDAÇÃO DE SENHA ==========
    
    static validarSenha(senha) {
        const erros = [];
        
        if (!senha || senha.length < 8) {
            erros.push('A senha deve ter no mínimo 8 caracteres');
        }
        
        if (!/\d/.test(senha)) {
            erros.push('A senha deve conter pelo menos 1 número');
        }
        
        return {
            valida: erros.length === 0,
            erros: erros
        };
    }

    // ========== GERAR SENHA ALEATÓRIA ==========
    
    static gerarSenhaAleatoria(length = 12) {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%&*';
        let senha = '';
        const array = new Uint8Array(length);
        crypto.getRandomValues(array);
        
        for (let i = 0; i < length; i++) {
            senha += chars[array[i] % chars.length];
        }
        
        // Garantir que tem pelo menos 1 número
        if (!/\d/.test(senha)) {
            senha = senha.slice(0, -1) + Math.floor(Math.random() * 10);
        }
        
        return senha;
    }
}

// Disponibilizar globalmente
window.CryptoUtils = CryptoUtils;

console.log('🔐 CryptoUtils carregado');
