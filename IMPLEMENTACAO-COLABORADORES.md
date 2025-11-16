# 🔐 IMPLEMENTAÇÃO: Sistema de Colaboradores Automáticos

## ⚠️ IMPORTANTE: Token Admin Expirado

O token admin `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` retornou "Bad credentials".

**Você precisa gerar um NOVO token com as permissões corretas.**

---

## 📋 Passo 1: Criar Token Admin com Permissões Corretas

### Como Criar Token no GitHub:

1. Acesse: https://github.com/settings/tokens/new
2. **Note:** "Gerador PDF - Admin Token"
3. **Expiration:** 90 days (ou No expiration se confiar)
4. **Selecione estas permissões:**

```
✅ repo (Controle total de repositórios privados)
  ✅ repo:status
  ✅ repo_deployment
  ✅ public_repo
  ✅ repo:invite (← ESSENCIAL para adicionar colaboradores)
  
✅ admin:org (Se o repo estiver em organização)
  ✅ write:org
  ✅ read:org
```

5. Clique em "Generate token"
6. **COPIE O TOKEN** (só aparece uma vez!)

---

## 📋 Passo 2: Tornar Repositório PRIVADO Novamente

```bash
curl -X PATCH \
  -H "Authorization: token SEU_NOVO_TOKEN_ADMIN" \
  -H "Accept: application/vnd.github.v3+json" \
  "https://api.github.com/repos/gasparfranciscogulungo/gerador-declaracoes-data" \
  -d '{"private": true}'
```

---

## 📋 Passo 3: Implementar Sistema de Auto-Convite

### 3.1 - Adicionar Funções no `github-api.js`

```javascript
// ========== COLABORADORES ==========

/**
 * Verifica se um usuário é colaborador do repositório
 */
async verificarColaborador(username) {
    try {
        const url = `${this.baseURL}/repos/${this.owner}/${this.repo}/collaborators/${username}`;
        
        const response = await fetch(url, {
            headers: this.getHeaders()
        });
        
        // 204 = é colaborador, 404 = não é
        return response.status === 204;
        
    } catch (error) {
        console.error('❌ Erro ao verificar colaborador:', error);
        return false;
    }
}

/**
 * Adiciona usuário como colaborador (requer token ADMIN)
 * @param {string} username - Username do GitHub
 * @param {string} permission - 'pull', 'push', 'admin', 'maintain', 'triage'
 */
async adicionarColaborador(username, permission = 'pull') {
    try {
        const url = `${this.baseURL}/repos/${this.owner}/${this.repo}/collaborators/${username}`;
        
        console.log(`➕ Adicionando ${username} como colaborador (${permission})...`);
        
        const response = await fetch(url, {
            method: 'PUT',
            headers: this.getHeaders(),
            body: JSON.stringify({ permission })
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(`Erro ${response.status}: ${error.message}`);
        }
        
        const data = await response.json();
        
        console.log(`✅ Convite enviado para ${username}`);
        
        return {
            success: true,
            inviteId: data.id,
            status: data.state // 'pending' ou 'active'
        };
        
    } catch (error) {
        console.error('❌ Erro ao adicionar colaborador:', error);
        throw error;
    }
}

/**
 * Remove colaborador (requer token ADMIN)
 */
async removerColaborador(username) {
    try {
        const url = `${this.baseURL}/repos/${this.owner}/${this.repo}/collaborators/${username}`;
        
        const response = await fetch(url, {
            method: 'DELETE',
            headers: this.getHeaders()
        });
        
        if (!response.ok) {
            throw new Error(`Erro ${response.status}`);
        }
        
        console.log(`🗑️ ${username} removido como colaborador`);
        
        return { success: true };
        
    } catch (error) {
        console.error('❌ Erro ao remover colaborador:', error);
        throw error;
    }
}

/**
 * Lista todos os colaboradores
 */
async listarColaboradores() {
    try {
        const url = `${this.baseURL}/repos/${this.owner}/${this.repo}/collaborators`;
        
        const response = await fetch(url, {
            headers: this.getHeaders()
        });
        
        if (!response.ok) {
            throw new Error(`Erro ${response.status}`);
        }
        
        const colaboradores = await response.json();
        
        return colaboradores.map(c => ({
            username: c.login,
            name: c.name,
            avatar: c.avatar_url,
            permissions: c.permissions
        }));
        
    } catch (error) {
        console.error('❌ Erro ao listar colaboradores:', error);
        return [];
    }
}
```

### 3.2 - Atualizar Fluxo de Login no `user-panel-controller.js`

```javascript
async init() {
    try {
        this.loading = true;
        this.loadingMessage = 'Verificando autenticação...';
        
        const token = localStorage.getItem('github_token') || localStorage.getItem('token');
        
        if (!token) {
            window.location.href = 'index.html';
            return;
        }
        
        // Configurar API
        githubAPI.setToken(token);
        githubAPI.configurar(CONFIG.github);
        
        // Obter usuário
        this.usuario = await githubAPI.getAuthenticatedUser();
        console.log('👤 Usuário:', this.usuario.login);
        
        // ✅ Se é ADMIN → Painel Admin
        if (CONFIG.admins.includes(this.usuario.login)) {
            console.log('🔑 Admin detectado, redirecionando...');
            window.location.href = 'admin.html';
            return;
        }
        
        // ✅ Se é USER → Verificar se é colaborador
        this.loadingMessage = 'Verificando permissões...';
        
        const ehColaborador = await this.verificarAcessoColaborador();
        
        if (!ehColaborador) {
            // Mostrar tela de "aguardando convite"
            this.mostrarTelaConvitePendente();
            return;
        }
        
        // ✅ Colaborador confirmado → Carregar dados
        this.usuarioData = {
            username: this.usuario.login,
            name: this.usuario.name || this.usuario.login,
            avatar: this.usuario.avatar_url,
            role: 'user',
            status: 'active'
        };
        
        await this.carregarDados();
        this.loading = false;
        
    } catch (error) {
        console.error('❌ Erro ao inicializar:', error);
        this.showAlert('error', 'Erro ao carregar: ' + error.message);
        this.loading = false;
    }
},

/**
 * Verifica se usuário tem acesso e solicita convite se necessário
 */
async verificarAcessoColaborador() {
    try {
        console.log('🔍 Verificando se é colaborador...');
        
        // Tentar ler arquivo para testar acesso
        const testeAcesso = await githubAPI.lerJSON('data/empresas.json');
        
        if (testeAcesso && testeAcesso.data) {
            console.log('✅ Acesso confirmado!');
            return true;
        }
        
        console.log('⚠️ Sem acesso, solicitando convite...');
        
        // Chamar endpoint que adiciona colaborador
        await this.solicitarConviteColaborador();
        
        return false;
        
    } catch (error) {
        console.error('❌ Erro ao verificar acesso:', error);
        return false;
    }
},

/**
 * Solicita convite de colaborador via backend/webhook
 */
async solicitarConviteColaborador() {
    try {
        // OPÇÃO A: Chamar API própria que tem token ADMIN
        // const response = await fetch('https://seu-backend.com/api/request-access', {
        //     method: 'POST',
        //     body: JSON.stringify({ username: this.usuario.login })
        // });
        
        // OPÇÃO B: GitHub Actions via repository_dispatch
        // (webhook que executa action para adicionar colaborador)
        
        console.log('📧 Convite solicitado para:', this.usuario.login);
        
    } catch (error) {
        console.error('❌ Erro ao solicitar convite:', error);
    }
},

/**
 * Mostra tela informando que convite foi enviado
 */
mostrarTelaConvitePendente() {
    this.loading = false;
    this.showAlert('warning', 'Convite de acesso enviado! Verifique seu email do GitHub.');
    
    // Adicionar UI customizada
    document.querySelector('.main-content').innerHTML = `
        <div style="text-align: center; padding: 60px 20px;">
            <div style="font-size: 80px; margin-bottom: 20px;">📧</div>
            <h1 style="color: #333; margin-bottom: 15px;">Convite Enviado!</h1>
            <p style="color: #666; font-size: 18px; margin-bottom: 30px;">
                Enviamos um convite de colaborador para seu email do GitHub.
            </p>
            
            <div style="background: #fff3cd; padding: 20px; border-radius: 10px; margin: 30px auto; max-width: 500px;">
                <h3 style="color: #856404; margin-bottom: 15px;">📋 Próximos Passos:</h3>
                <ol style="text-align: left; color: #856404; line-height: 2;">
                    <li>Verifique seu email (${this.usuario.email || 'email do GitHub'})</li>
                    <li>Clique em "Accept Invitation"</li>
                    <li>Volte aqui e recarregue a página</li>
                </ol>
            </div>
            
            <button 
                onclick="window.location.reload()" 
                style="background: #6366f1; color: white; border: none; padding: 15px 30px; font-size: 16px; border-radius: 8px; cursor: pointer; margin-top: 20px;">
                🔄 Recarregar Página
            </button>
            
            <p style="color: #999; margin-top: 30px; font-size: 14px;">
                Usuário: <strong>${this.usuario.login}</strong>
            </p>
        </div>
    `;
}
```

---

## 📋 Passo 4: Criar Backend Simples para Adicionar Colaboradores

### Opção A: Cloudflare Worker (Grátis, Serverless)

```javascript
// worker.js
addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

async function handleRequest(request) {
  // Apenas POST
  if (request.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 })
  }
  
  const { username } = await request.json()
  
  // Token admin como secret do Cloudflare
  const ADMIN_TOKEN = GITHUB_ADMIN_TOKEN // Configurado no dashboard
  
  const response = await fetch(
    `https://api.github.com/repos/gasparfranciscogulungo/gerador-declaracoes-data/collaborators/${username}`,
    {
      method: 'PUT',
      headers: {
        'Authorization': `token ${ADMIN_TOKEN}`,
        'Accept': 'application/vnd.github.v3+json'
      },
      body: JSON.stringify({ permission: 'pull' })
    }
  )
  
  if (response.ok) {
    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json' }
    })
  }
  
  return new Response(JSON.stringify({ error: 'Failed' }), {
    status: 500,
    headers: { 'Content-Type': 'application/json' }
  })
}
```

### Opção B: GitHub Actions com repository_dispatch

```yaml
# .github/workflows/add-collaborator.yml
name: Add Collaborator

on:
  repository_dispatch:
    types: [add-collaborator]

jobs:
  add:
    runs-on: ubuntu-latest
    steps:
      - name: Add collaborator
        uses: actions/github-script@v6
        with:
          github-token: ${{ secrets.ADMIN_PAT }}
          script: |
            await github.rest.repos.addCollaborator({
              owner: 'gasparfranciscogulungo',
              repo: 'gerador-declaracoes-data',
              username: '${{ github.event.client_payload.username }}',
              permission: 'pull'
            });
```

Depois chamar via:
```javascript
await fetch('https://api.github.com/repos/owner/repo/dispatches', {
  method: 'POST',
  headers: {
    'Authorization': `token ${USER_TOKEN}`,
    'Accept': 'application/vnd.github.v3+json'
  },
  body: JSON.stringify({
    event_type: 'add-collaborator',
    client_payload: { username: 'Msicky42' }
  })
});
```

---

## 🎯 DECISÃO FINAL

### Você precisa escolher:

**A) Sistema Simples (Repo Público)** ⚡
- ✅ Já funciona agora
- ❌ Zero segurança
- ⏱️ 0h implementação

**B) Sistema Seguro (Colaboradores Manuais)** 🔐
- ✅ Segurança total
- ❌ Admin adiciona manualmente cada user
- ⏱️ 0h implementação (só usar GitHub UI)

**C) Sistema Automático (Colaboradores + Backend)** 🚀
- ✅ Segurança + UX boa
- ⚠️ Precisa backend (Cloudflare Worker ou GitHub Actions)
- ⏱️ 3-4h implementação

**D) Sistema Híbrido (2 Repos)** 🌟
- ✅ Segurança para dados, performance para assets
- ⚠️ Mais complexo de gerenciar
- ⏱️ 2h implementação

---

## 💡 Minha Recomendação

**Para sistema com < 50 usuários:**
→ **Opção B** (manual) + depois migrar para C quando crescer

**Para produto comercial:**
→ **Opção C** com Cloudflare Workers (grátis até 100k requests/dia)

**Para MVP/teste:**
→ **Opção A** (público) mas sem dados reais

---

## ❓ O Que Você Prefere?

Me diga:
1. Quantos usuários terás? (aproximado)
2. Os dados são realmente sensíveis? (salários, documentos pessoais?)
3. Aceitas implementar backend simples? (Cloudflare Worker é grátis)
4. Ou preferes adicionar users manualmente por enquanto?

