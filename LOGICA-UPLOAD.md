# 📤 LÓGICA DE UPLOAD DE IMAGENS

## 🎯 Visão Geral

O sistema usa **GitHub como backend** para armazenar todas as imagens (logos e carimbos) das empresas. Não há servidor Node.js - tudo é feito via **GitHub API** diretamente do navegador.

---

## 🏗️ Arquitetura (3 Camadas)

```
┌─────────────────────────────────────────────────────────────┐
│                     1. INTERFACE (UI)                       │
│                    admin.html                               │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ <button @click="$refs.logoInput.click()">            │  │
│  │ <input type="file" @change="handleLogoUpload()">     │  │
│  └──────────────────────────────────────────────────────┘  │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│              2. CONTROLADOR (Lógica)                        │
│              admin-controller.js                            │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ async handleLogoUpload(event) {                      │  │
│  │   1. Valida NIF preenchido                           │  │
│  │   2. Valida arquivo (tipo, tamanho)                  │  │
│  │   3. Converte para Base64                            │  │
│  │   4. Chama GitHubAPI.uploadFile()                    │  │
│  │   5. Atualiza URL no formulário                      │  │
│  │ }                                                     │  │
│  └──────────────────────────────────────────────────────┘  │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│           3. COMUNICAÇÃO COM GITHUB                         │
│              github-api.js                                  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ async uploadFile(path, base64, message, sha) {       │  │
│  │   PUT /repos/{owner}/{repo}/contents/{path}          │  │
│  │   Headers: Authorization: token {GITHUB_TOKEN}       │  │
│  │   Body: { message, content: base64, sha? }           │  │
│  │ }                                                     │  │
│  └──────────────────────────────────────────────────────┘  │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        ▼
                 ┌─────────────┐
                 │   GITHUB    │
                 │  Repository │
                 └─────────────┘
```

---

## 📋 Fluxo Detalhado de Upload

### **Passo 1: Seleção do Arquivo**
```javascript
// admin.html
<input type="file" 
       x-ref="logoInput"
       @change="handleLogoUpload($event)"
       accept="image/png,image/jpeg,image/jpg,image/svg+xml">
```

### **Passo 2: Validação Inicial (Controller)**
```javascript
// admin-controller.js - handleLogoUpload()

// 2.1 - Verificar se NIF foi preenchido
if (!this.empresaForm.nif || this.empresaForm.nif.trim() === '') {
    this.showAlert('error', '❌ Preencha o NIF da empresa primeiro!');
    return;
}

// 2.2 - Validar tipo e tamanho do arquivo
const uploader = new ImageUploader();
const validation = uploader.validateImage(file);

if (!validation.valid) {
    this.showAlert('error', `❌ ${validation.error}`);
    return;
}
// Aceita: PNG, JPG, SVG
// Tamanho máximo: 2MB
```

### **Passo 3: Conversão para Base64**
```javascript
// 3.1 - Converter arquivo para Base64
const base64Content = await uploader.fileToBase64(file);

// 3.2 - Sanitizar NIF (remover caracteres especiais)
const nifSanitizado = this.empresaForm.nif.replace(/[^a-zA-Z0-9]/g, '');

// 3.3 - Definir caminho no GitHub
const extensao = file.name.split('.').pop().toLowerCase();
const fileName = `logo.${extensao}`;
const filePath = `assets/empresas/${nifSanitizado}/${fileName}`;

// Exemplo: assets/empresas/5480023446/logo.png
```

### **Passo 4: Verificar se Arquivo Já Existe**
```javascript
// 4.1 - Verificar se já existe um logo para atualizar
let sha = null;
try {
    const existingFile = await githubAPI.getFile(filePath);
    sha = existingFile.sha; // SHA necessário para atualizar
} catch (error) {
    // Arquivo não existe (ok, será criado)
}
```

### **Passo 5: Upload para GitHub**
```javascript
// 5.1 - Fazer upload via GitHub API
await githubAPI.uploadFile(
    filePath,                    // 'assets/empresas/5480023446/logo.png'
    base64Content,               // Conteúdo em Base64
    `Upload logo da empresa ${nome}`, // Mensagem do commit
    sha                          // SHA se estiver atualizando (ou null)
);

// 5.2 - GitHub API faz:
// PUT https://api.github.com/repos/{owner}/{repo}/contents/{path}
// Headers: { Authorization: 'token {TOKEN}' }
// Body: {
//   message: 'Upload logo da empresa...',
//   content: 'iVBORw0KGgoAAAANSUhEUgAA...', // Base64
//   branch: 'master',
//   sha: '...' // Se estiver atualizando
// }
```

### **Passo 6: Gerar URL e Atualizar Formulário**
```javascript
// 6.1 - Gerar URL pública do GitHub
const githubUrl = `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${filePath}`;

// Exemplo:
// https://raw.githubusercontent.com/gasparfranciscogulungo/gerador-declaracoes-data/master/assets/empresas/5480023446/logo.png

// 6.2 - Atualizar campo do formulário
this.empresaForm.logo = githubUrl;

// 6.3 - Preview atualiza automaticamente (Alpine.js reativo)
```

---

## 🔑 Métodos Principais

### **GitHubAPI Methods**

| Método | Descrição | Parâmetros |
|--------|-----------|------------|
| `uploadFile(path, base64, message, sha?)` | Upload/atualização de arquivo | path, conteúdo Base64, mensagem commit, SHA opcional |
| `getFile(path)` | Obter informações de arquivo | caminho do arquivo |
| `uploadImagem(path, base64, message, sha?)` | Alias para uploadFile | mesmos parâmetros |
| `salvarJSON(path, data, message, sha?)` | Salvar objeto JSON | caminho, objeto, mensagem, SHA opcional |
| `lerJSON(path)` | Ler e parsear JSON | caminho do arquivo |

### **ImageUploader Methods**

| Método | Descrição | Retorno |
|--------|-----------|---------|
| `validateImage(file)` | Valida tipo e tamanho | `{valid: boolean, error?: string}` |
| `fileToBase64(file)` | Converte File para Base64 | `Promise<string>` |

---

## 📂 Estrutura de Arquivos no GitHub

```
gerador-declaracoes-data/
├── data/
│   ├── empresas.json          # Lista de todas empresas
│   ├── modelos.json           # Modelos de documentos
│   ├── users.json             # Usuários do sistema
│   └── contador.json          # Contador de PDFs
│
└── assets/
    └── empresas/
        ├── 5480023446/        # NIF da empresa
        │   ├── logo.png       # Logo da empresa
        │   └── carimbo.png    # Carimbo/assinatura
        │
        ├── 9876543210/
        │   ├── logo.jpg
        │   └── carimbo.svg
        │
        └── ...
```

---

## ⚙️ Configuração Necessária

### **1. GitHub Personal Access Token**

O usuário precisa criar um token em: https://github.com/settings/tokens

**Permissões necessárias:**
- ✅ `repo` (acesso completo ao repositório)
- ✅ `workflow` (opcional, para actions)

### **2. Repositório**

- **Nome:** `gerador-declaracoes-data` (configurável em `config.js`)
- **Visibilidade:** Privado (recomendado) ou Público
- **Branch:** `master` (padrão)

### **3. Configuração no Sistema**

```javascript
// js/config.js
const CONFIG = {
    github: {
        owner: 'gasparfranciscogulungo',  // Seu username GitHub
        repo: 'gerador-declaracoes-data', // Nome do repositório
        branch: 'master'
    }
};
```

---

## 🔒 Segurança

### **Token Armazenamento**
- ✅ Token salvo em `localStorage` (criptografado)
- ✅ Nunca exposto no código-fonte
- ✅ Validação em cada requisição

### **Validações**
- ✅ Tipo de arquivo (PNG, JPG, SVG)
- ✅ Tamanho máximo (2MB)
- ✅ NIF obrigatório antes do upload
- ✅ Sanitização do NIF (remove caracteres especiais)

---

## 🐛 Tratamento de Erros

### **Erros Comuns e Soluções**

| Erro | Causa | Solução |
|------|-------|---------|
| `uploadFile is not a function` | Método não existia | ✅ **CORRIGIDO** - Método adicionado |
| `401 Unauthorized` | Token inválido ou expirado | Gerar novo token e fazer login novamente |
| `404 Not Found` | Repositório não existe | Verificar nome do repo em `config.js` |
| `422 Unprocessable Entity` | SHA incorreto ao atualizar | Verificar se SHA está correto |
| `Network error` | Sem internet ou CORS | Verificar conexão e configurações |

### **Console Logs (Debug)**

O sistema tem logs detalhados em cada etapa:

```javascript
🔄 handleLogoUpload iniciado
📊 Progresso: 10%
✅ ImageUploader inicializado
📊 Progresso: 20% - Validando
🔍 Validação: {valid: true}
📊 Progresso: 40% - Convertendo para Base64
✅ Base64 gerado, tamanho: 45678
🔤 NIF sanitizado: 5480023446
📂 Caminho no GitHub: assets/empresas/5480023446/logo.png
📊 Progresso: 60% - Verificando arquivo existente
📄 Arquivo não existe (ok)
📊 Progresso: 80% - Enviando para GitHub
🚀 Chamando githubAPI.uploadFile...
✅ Upload concluído!
🔗 URL gerada: https://raw.githubusercontent.com/.../logo.png
✅ Formulário atualizado
📊 Progresso: 100% - Concluído!
```

---

## 🎯 Vantagens desta Abordagem

1. **✅ Sem Servidor Backend** → Menos custos, mais simples
2. **✅ Versionamento Automático** → GitHub mantém histórico de todas alterações
3. **✅ CDN Grátis** → URLs `raw.githubusercontent.com` são servidas por CDN
4. **✅ Segurança** → Controle de acesso via tokens GitHub
5. **✅ Escalável** → GitHub API suporta milhares de requisições
6. **✅ Backup Automático** → Tudo salvo no GitHub
7. **✅ Colaboração** → Múltiplos usuários podem gerenciar

---

## 📊 Limitações da GitHub API

- **Rate Limit:** 5.000 requisições/hora (autenticado)
- **Tamanho de Arquivo:** 100MB máximo (nosso limite: 2MB)
- **Commits:** Cada upload = 1 commit no repositório

---

## 🚀 Melhorias Futuras

1. ✅ **Compressão de Imagens** → Reduzir tamanho antes do upload
2. ✅ **Cache Local** → Evitar downloads repetidos
3. ✅ **Batch Upload** → Múltiplos arquivos de uma vez
4. ✅ **Thumbnail Generation** → Gerar miniaturas automaticamente
5. ✅ **Lazy Loading** → Carregar imagens sob demanda

---

**Sistema desenvolvido por:** Gaspar Francisco Gulungo  
**Data:** 6 de novembro de 2025  
**Versão:** 2.0
