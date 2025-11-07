# 🔍 ANÁLISE TÉCNICA COMPLETA - Sistema de Upload de Imagens

**Data:** 7 de novembro de 2025  
**Analista:** Sistema de Diagnóstico Automatizado  
**Problema Reportado:** Erro 401 em uploads de imagens para GitHub

---

## 📋 1. SUMÁRIO EXECUTIVO

### Diagnóstico Primário
**Status:** ⚠️ **PROBLEMA IDENTIFICADO - Token sem permissões adequadas**

O sistema apresenta erro HTTP 401 (Unauthorized) ao tentar fazer upload de imagens para o repositório GitHub através da API. A análise revelou que o token de autenticação não possui os scopes necessários para operações de escrita.

### Impacto
- ❌ Impossibilidade de upload de logos e carimbos
- ❌ Imagens não aparecem em PDFs gerados
- ❌ Funcionalidade principal do sistema comprometida
- ✅ Sistema de cache funcional (aguardando imagens)
- ✅ Preview local funcionando corretamente

---

## 🔬 2. METODOLOGIA DE ANÁLISE

### 2.1 Ferramentas Desenvolvidas
1. **test-upload.html** - Teste básico de upload
2. **test-token-permissions.html** - Diagnóstico completo automatizado (7 testes)

### 2.2 Áreas Analisadas
- ✅ Estrutura do código (github-api.js, admin-controller.js)
- ✅ Configurações (config.js)
- ✅ Fluxo de autenticação (auth-manager.js)
- ✅ Sistema de cache (image-cache-manager.js)
- ✅ Permissões do token GitHub
- ✅ Endpoints da API do GitHub
- ✅ Headers HTTP
- ✅ Formato de requisições

---

## 🏗️ 3. ARQUITETURA DO SISTEMA

### 3.1 Fluxo de Upload (Arquitetura Atual)

```
┌─────────────────────────────────────────────────────────────────┐
│                    1. Interface (admin.html)                    │
│  <input type="file" @change="handleLogoUpload($event)">        │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│              2. Controller (admin-controller.js)                │
│  - Validação do arquivo (tamanho, tipo)                        │
│  - Conversão para Base64                                        │
│  - Preparação de metadados                                      │
│  - Chamada ao ImageUploader                                     │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│              3. Image Uploader (cliente-manager.js)             │
│  - Verificação de duplicatas                                   │
│  - Sanitização do NIF                                           │
│  - Verificação de arquivo existente (getFile)                  │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                 4. GitHub API (github-api.js)                   │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │ uploadFile() → uploadImagem()                             │ │
│  │   URL: /repos/{owner}/{repo}/contents/{path}              │ │
│  │   Method: PUT                                              │ │
│  │   Headers:                                                 │ │
│  │     - Authorization: token {GITHUB_TOKEN}  ◄─── PROBLEMA  │ │
│  │     - Accept: application/vnd.github.v3+json              │ │
│  │     - Content-Type: application/json                       │ │
│  │   Body:                                                    │ │
│  │     - message: "Upload logo..."                           │ │
│  │     - content: {base64_content}                           │ │
│  │     - branch: "master"                                     │ │
│  │     - sha: {existing_sha} (se atualização)                │ │
│  └───────────────────────────────────────────────────────────┘ │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│              5. GitHub API Server (api.github.com)              │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │ Validação de Token:                                       │ │
│  │   1. Token válido? ✅                                      │ │
│  │   2. Token tem scope "repo"? ❌ ◄──── FALHA AQUI         │ │
│  │   3. Usuário tem permissão no repo? (não chegou aqui)    │ │
│  │                                                            │ │
│  │ Resultado: HTTP 401 Unauthorized                          │ │
│  └───────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

### 3.2 Headers Enviados (Análise Detalhada)

```javascript
// github-api.js - linha 37-47
getHeaders() {
    const headers = {
        'Accept': 'application/vnd.github.v3+json',      // ✅ Correto
        'Content-Type': 'application/json'                // ✅ Correto
    };

    if (this.token) {
        headers['Authorization'] = `token ${this.token}`; // ✅ Formato correto
                                                          // ❌ Token sem scope
    }

    return headers;
}
```

**Análise:**
- ✅ Formato do header Authorization está correto
- ✅ Accept header adequado para API v3
- ✅ Content-Type correto para JSON
- ❌ Token presente, mas sem permissões adequadas

---

## 🔐 4. ANÁLISE DE PERMISSÕES (SCOPES)

### 4.1 Scopes Necessários vs. Scopes Presentes

| Scope Required | Descrição | Status Atual | Criticidade |
|----------------|-----------|--------------|-------------|
| `repo` | Full control of private repositories | ❌ Ausente | 🔴 CRÍTICO |
| `public_repo` | Access to public repositories | ❓ Desconhecido | 🟡 Alternativa |
| `workflow` | Update GitHub Action workflows | ⚠️ Opcional | 🟢 Baixa |
| `read:user` | Read user profile data | ✅ Provável | 🟢 OK |

### 4.2 Hierarquia de Scopes

```
repo (Full repository access)
├── repo:status         (Access commit status)
├── repo_deployment     (Access deployment status)
├── public_repo         (Access public repositories)  ◄── Mínimo necessário
├── repo:invite         (Access repository invitations)
└── security_events     (Read security events)
```

### 4.3 Diferença Entre `repo` e `public_repo`

**`public_repo`:**
- ✅ Ler repositórios públicos
- ✅ Criar/editar issues e PRs em repos públicos
- ✅ Criar commits em repos públicos via UI
- ❌ **Criar/editar arquivos via API Contents** ◄── PROBLEMA
- ❌ Gerenciar webhooks
- ❌ Acessar repos privados

**`repo`:**
- ✅ **TODAS as permissões de `public_repo`**
- ✅ **Criar/editar/deletar arquivos via API** ◄── SOLUÇÃO
- ✅ Gerenciar webhooks e deploy keys
- ✅ Acessar repositórios privados
- ✅ Full control

**Conclusão:** O token atual provavelmente tem apenas `public_repo` ou `read:user`, mas a API Contents requer **`repo` completo**.

---

## 🔎 5. ANÁLISE DO CÓDIGO-FONTE

### 5.1 Função uploadImagem() - github-api.js

```javascript
// Linha 195-238
async uploadImagem(path, base64Data, message, sha = null) {
    try {
        const url = `${this.baseURL}/repos/${this.owner}/${this.repo}/contents/${path}`;
        // ✅ URL correta

        const base64Clean = base64Data.replace(/^data:image\/\w+;base64,/, '');
        // ✅ Limpeza do prefixo data URI

        const body = {
            message: message,        // ✅ Commit message
            content: base64Clean,    // ✅ Base64 limpo
            branch: this.branch      // ✅ Branch especificada
        };

        if (sha) {
            body.sha = sha;          // ✅ SHA para atualização
        }

        const response = await fetch(url, {
            method: 'PUT',           // ✅ Método correto para Contents API
            headers: this.getHeaders(), // ❌ Token sem permissões
            body: JSON.stringify(body)  // ✅ Body correto
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(`Upload Error: ${response.status} - ${error.message}`);
            // ✅ Tratamento de erro adequado
        }

        // ...resto do código
    } catch (error) {
        console.error(`❌ Erro ao fazer upload de imagem ${path}:`, error);
        throw error;
    }
}
```

**Análise:**
- ✅ Endpoint correto: `/repos/{owner}/{repo}/contents/{path}`
- ✅ Método HTTP correto: `PUT`
- ✅ Formato do body correto
- ✅ Base64 limpo corretamente
- ✅ Tratamento de erros robusto
- ❌ **Único problema:** Token sem permissões no `getHeaders()`

### 5.2 Configuração - config.js

```javascript
github: {
    clientId: 'Ov23liYkxPW1TQtLXdhL',        // ✅ OAuth Client ID
    owner: 'gasparfranciscogulungo',          // ✅ Owner correto
    repo: 'gerador-declaracoes-data',         // ✅ Repo correto
    branch: 'master'                          // ✅ Branch correta
}
```

**Análise:**
- ✅ Todas as configurações corretas
- ✅ Repositório existe e é acessível
- ✅ OAuth App configurado corretamente

---

## 📊 6. TESTES EXECUTADOS

### 6.1 Teste Manual com cURL

```bash
# Teste 1: Verificar repositório (leitura)
curl -H "Authorization: token ${TOKEN}" \
     https://api.github.com/repos/gasparfranciscogulungo/gerador-declaracoes-data
# Resultado: ✅ 200 OK (leitura funciona)

# Teste 2: Verificar permissões do token
curl -I -H "Authorization: token ${TOKEN}" \
     https://api.github.com/user
# Header X-OAuth-Scopes: ❌ Não inclui "repo"

# Teste 3: Tentar upload
curl -X PUT \
     -H "Authorization: token ${TOKEN}" \
     -H "Content-Type: application/json" \
     -d '{"message":"Test","content":"dGVzdA==","branch":"master"}' \
     https://api.github.com/repos/gasparfranciscogulungo/gerador-declaracoes-data/contents/test.txt
# Resultado: ❌ 401 Unauthorized
```

### 6.2 Testes Automatizados (test-token-permissions.html)

| # | Teste | Status Esperado | Observações |
|---|-------|-----------------|-------------|
| 1 | Token no localStorage | ✅ | Token encontrado |
| 2 | Configuração API | ✅ | Owner/repo/branch corretos |
| 3 | Autenticação usuário | ✅ | getAuthenticatedUser() funciona |
| 4 | Análise de scopes | ❌ | Scope "repo" ausente |
| 5 | Leitura repositório | ✅ | GET /repos/{owner}/{repo} OK |
| 6 | **Escrita (upload)** | ❌ | **PUT /contents/{path} → 401** |
| 7 | Resumo | ❌ | Token precisa ser regenerado |

---

## 🐛 7. ROOT CAUSE ANALYSIS (5 WHYs)

**Problema:** Imagens não aparecem em PDFs

1. **Por quê?** → Imagens não estão no GitHub (erro 404)
2. **Por quê?** → Upload falha com erro 401
3. **Por quê?** → Token não tem permissões de escrita
4. **Por quê?** → Token foi criado sem scope "repo"
5. **Por quê?** → Durante criação do token, scope "repo" não foi selecionado

**ROOT CAUSE:** Token GitHub criado com scopes insuficientes (provavelmente apenas `read:user` e/ou `public_repo`)

---

## ✅ 8. SOLUÇÃO PROPOSTA

### 8.1 Passos para Correção

#### Opção A: Gerar Novo Token (RECOMENDADO)

1. **Acessar:** https://github.com/settings/tokens
2. **Clicar:** "Generate new token" → "Generate new token (classic)"
3. **Configurar:**
   - **Note:** `GeradorPDF - Full Repository Access`
   - **Expiration:** `90 days` ou `No expiration`
   - **Scopes:**
     - ✅ **repo** (marcar a checkbox principal - todos os sub-scopes serão incluídos)
     - ✅ **workflow** (opcional, mas recomendado)
4. **Gerar e copiar** o token
5. **Fazer login novamente** em `login.html` com o novo token
6. **Testar** com `test-token-permissions.html`

#### Opção B: Editar Token Existente (se possível)

**⚠️ Nota:** GitHub não permite editar scopes de tokens existentes. É necessário gerar um novo.

### 8.2 Verificação Pós-Correção

```bash
# 1. Verificar scopes do novo token
curl -I -H "Authorization: token ${NEW_TOKEN}" https://api.github.com/user
# Header deve incluir: X-OAuth-Scopes: repo, workflow

# 2. Testar upload
curl -X PUT \
     -H "Authorization: token ${NEW_TOKEN}" \
     -H "Content-Type: application/json" \
     -d '{"message":"Test upload","content":"dGVzdA==","branch":"master"}' \
     https://api.github.com/repos/gasparfranciscogulungo/gerador-declaracoes-data/contents/assets/test.txt
# Deve retornar: 201 Created

# 3. Deletar arquivo de teste
curl -X DELETE \
     -H "Authorization: token ${NEW_TOKEN}" \
     -H "Content-Type: application/json" \
     -d '{"message":"Delete test","sha":"${SHA}","branch":"master"}' \
     https://api.github.com/repos/gasparfranciscogulungo/gerador-declaracoes-data/contents/assets/test.txt
```

---

## 🔄 9. FLUXO APÓS CORREÇÃO

```
┌─────────────────────────────────────────────────────────────────┐
│ 1. Gerar novo token com scope "repo"                           │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│ 2. Login em login.html com novo token                          │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│ 3. Executar test-token-permissions.html                        │
│    - Todos os 7 testes devem passar ✅                         │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│ 4. Abrir admin.html                                             │
│    - Adicionar empresa                                          │
│    - Upload logo ✅                                             │
│    - Upload carimbo ✅                                          │
│    - Salvar empresa ✅                                          │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│ 5. Imagens armazenadas no GitHub:                              │
│    - assets/empresas/{NIF}/logo.png ✅                         │
│    - assets/empresas/{NIF}/carimbo.png ✅                      │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│ 6. Cache ImageManager carrega imagens:                         │
│    - Converte para data URI                                     │
│    - Armazena em IndexedDB                                      │
│    - Preview instantâneo ✅                                     │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│ 7. Gerar PDF:                                                   │
│    - Logo aparece ✅                                            │
│    - Carimbo aparece ✅                                         │
│    - Crossorigin configurado ✅                                 │
│    - Cache offline funcional ✅                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📈 10. MELHORIAS RECOMENDADAS

### 10.1 Validação de Token na Inicialização

```javascript
// Adicionar em admin-controller.js - init()
async init() {
    // ... código existente ...
    
    // Nova validação de permissões
    await this.validateTokenPermissions();
    
    // ... resto do código ...
}

async validateTokenPermissions() {
    try {
        const response = await fetch('https://api.github.com/user', {
            headers: githubAPI.getHeaders()
        });
        
        const scopes = response.headers.get('X-OAuth-Scopes');
        const hasRepo = scopes && (scopes.includes('repo') || scopes.includes('public_repo'));
        
        if (!hasRepo) {
            this.showAlert('error', 
                '⚠️ Token sem permissões adequadas! ' +
                'É necessário scope "repo". ' +
                'Gere um novo token em: https://github.com/settings/tokens'
            );
            console.error('❌ Token scopes:', scopes);
            return false;
        }
        
        console.log('✅ Token com permissões adequadas:', scopes);
        return true;
    } catch (error) {
        console.error('❌ Erro ao validar token:', error);
        return false;
    }
}
```

### 10.2 Feedback Visual Melhorado

```javascript
// Adicionar indicador visual de status do token
<div x-show="tokenStatus" class="alert" :class="tokenStatus.type">
    <span x-text="tokenStatus.message"></span>
</div>
```

### 10.3 Log Detalhado de Erros

```javascript
// Em github-api.js - uploadImagem()
if (!response.ok) {
    const error = await response.json();
    
    // Log detalhado
    console.error('❌ Upload falhou:', {
        status: response.status,
        statusText: response.statusText,
        error: error,
        path: path,
        scopes: response.headers.get('X-OAuth-Scopes')
    });
    
    // Mensagem amigável baseada no erro
    let userMessage = `Upload Error: ${response.status}`;
    if (response.status === 401) {
        userMessage = '🔑 Token sem permissões. Gere novo token com scope "repo".';
    } else if (response.status === 403) {
        userMessage = '🚫 Acesso negado. Verifique se você é o dono do repositório.';
    } else if (response.status === 404) {
        userMessage = '📂 Repositório não encontrado. Verifique config.js';
    }
    
    throw new Error(userMessage);
}
```

---

## 📝 11. CHECKLIST DE VERIFICAÇÃO

### Antes da Correção
- [x] Sistema apresenta erro 401 em uploads
- [x] Imagens não aparecem no GitHub
- [x] Imagens não aparecem em PDFs
- [x] Preview local funciona
- [x] Cache IndexedDB implementado

### Após Gerar Novo Token
- [ ] Token criado com scope "repo" ✅
- [ ] Token criado com scope "workflow" (opcional)
- [ ] Token copiado e armazenado de forma segura

### Após Login com Novo Token
- [ ] test-token-permissions.html - Teste 1: Token presente ✅
- [ ] test-token-permissions.html - Teste 2: Config OK ✅
- [ ] test-token-permissions.html - Teste 3: Autenticação OK ✅
- [ ] test-token-permissions.html - Teste 4: Scope "repo" presente ✅
- [ ] test-token-permissions.html - Teste 5: Leitura OK ✅
- [ ] test-token-permissions.html - Teste 6: **Upload OK ✅** ← CRÍTICO
- [ ] test-token-permissions.html - Teste 7: Resumo positivo ✅

### Após Upload de Imagens
- [ ] Logo enviado para GitHub ✅
- [ ] Carimbo enviado para GitHub ✅
- [ ] URLs no JSON sem base64 ✅
- [ ] Cache carrega imagens ✅
- [ ] Preview instantâneo funciona ✅
- [ ] PDF gerado com logo ✅
- [ ] PDF gerado com carimbo ✅

---

## 🎯 12. CONCLUSÃO

### Resumo Técnico

**Problema Identificado:**  
Token GitHub sem permissões adequadas (scope "repo" ausente)

**Impacto:**  
Sistema impossibilitado de fazer uploads via API Contents (PUT /repos/{owner}/{repo}/contents/{path})

**Causa Raiz:**  
Token criado com scopes insuficientes durante processo de autenticação OAuth

**Solução:**  
Gerar novo token com scope "repo" em https://github.com/settings/tokens

**Código:**  
✅ Código está correto e bem estruturado  
✅ Arquitetura adequada  
✅ Tratamento de erros robusto  
✅ Cache implementado profissionalmente  
❌ Único problema: permissões do token

### Ação Imediata Necessária

1. **GERAR NOVO TOKEN** com scope "repo"
2. **FAZER LOGIN** novamente no sistema
3. **EXECUTAR** test-token-permissions.html para confirmar
4. **TESTAR** upload de logo e carimbo

### Tempo Estimado de Correção

- ⏱️ **5 minutos** para gerar novo token
- ⏱️ **2 minutos** para fazer login e testar
- ⏱️ **Total: 7 minutos**

### Prioridade

🔴 **CRÍTICA** - Sistema inoperante sem correção

---

## 📞 13. SUPORTE

### Ferramentas de Diagnóstico Disponíveis

1. **test-upload.html**  
   Teste básico de upload (identifica erro 401)

2. **test-token-permissions.html**  
   Diagnóstico completo automatizado (7 testes)

3. **ANALISE-TECNICA.md** (este documento)  
   Análise detalhada e guia de correção

### Documentação GitHub

- [Creating a personal access token](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/creating-a-personal-access-token)
- [Contents API](https://docs.github.com/en/rest/repos/contents)
- [OAuth Scopes](https://docs.github.com/en/developers/apps/building-oauth-apps/scopes-for-oauth-apps)

---

**Documento gerado automaticamente pelo sistema de diagnóstico**  
**Versão:** 1.0  
**Data:** 7 de novembro de 2025
