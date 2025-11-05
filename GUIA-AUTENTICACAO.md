# 🔐 GUIA COMPLETO DE AUTENTICAÇÃO E CONFIGURAÇÃO

## 📋 ÍNDICE
1. [Como funciona a autenticação](#como-funciona)
2. [Configuração passo a passo](#configuracao-passo-a-passo)
3. [Opções de autenticação](#opcoes-de-autenticacao)
4. [Configurar Dark Mode](#dark-mode)
5. [Troubleshooting](#troubleshooting)

---

## 🔐 COMO FUNCIONA A AUTENTICAÇÃO

### **Fluxo Completo:**

```
USER                    SISTEMA                 GITHUB
  │                        │                        │
  ├─1. Abre site──────────>│                        │
  │   (index.html)          │                        │
  │                         │                        │
  ├─2. Clica "Login"──────>│                        │
  │                         │                        │
  │                         ├─3. Redireciona────────>│
  │                         │   para GitHub OAuth    │
  │                         │                        │
  │<────────────────────────┼─4. Página de login────┤
  │   (github.com/login)    │                        │
  │                         │                        │
  ├─5. Insere credenciais─>│                        │
  │   Username + Password   │                        │
  │                         │                        │
  │<────────────────────────┼─6. "Autorizar app?"───┤
  │                         │                        │
  ├─7. Clica "Autorizar"──>│                        │
  │                         │                        │
  │<────────────────────────┼─8. Redirect com code──┤
  │   (callback.html?code=) │                        │
  │                         │                        │
  │                         ├─9. Troca code────────>│
  │                         │   por Access Token     │
  │                         │                        │
  │                         │<─10. Retorna token────┤
  │                         │                        │
  │<─11. Salva token no─────┤                        │
  │     localStorage        │                        │
  │                         │                        │
  │─12. Redireciona para────>                        │
      /admin.html ou /user.html
```

---

## ⚙️ CONFIGURAÇÃO PASSO A PASSO

### **MÉTODO 1: Usar Assistente de Configuração (RECOMENDADO)** ⭐

1. **Abra o sistema:**
   ```
   http://localhost:8000/setup.html
   ```

2. **Siga o wizard:** O assistente vai guiar você por todos os passos

3. **Baixe o config.js gerado** e substitua o arquivo existente

4. **Pronto!** Volte para `/index.html` e faça login

---

### **MÉTODO 2: Configuração Manual**

#### **Passo 1: Criar Repositório de Dados**

```bash
# 1. No GitHub, crie novo repositório PRIVADO
# Nome: gerador-declaracoes-data

# 2. No terminal:
mkdir gerador-declaracoes-data
cd gerador-declaracoes-data
git init

# 3. Criar estrutura
mkdir -p data models/types assets/logos assets/carimbos

# 4. Criar arquivos iniciais
echo '{"empresas":[]}' > data/empresas.json
echo '{"modelos":[]}' > data/modelos.json
echo '{"contadores":{},"historico":[]}' > data/contador.json

# 5. Primeiro commit
git add .
git commit -m "🎉 Estrutura inicial"
git branch -M main
git remote add origin https://github.com/SEU-USER/gerador-declaracoes-data.git
git push -u origin main
```

#### **Passo 2: Configurar OAuth App (Opcional - para produção)**

1. Acesse: https://github.com/settings/developers
2. Clique em **"New OAuth App"**
3. Preencha:
   - **Application name:** `Gerador de Declarações`
   - **Homepage URL:** `http://localhost:8000`
   - **Authorization callback URL:** `http://localhost:8000/callback.html`
4. Clique em **"Register application"**
5. Copie o **Client ID**
6. Clique em **"Generate a new client secret"**
7. Copie o **Client Secret** ⚠️ (não verá novamente!)

#### **Passo 3: Criar Personal Access Token (Para desenvolvimento)**

1. Acesse: https://github.com/settings/tokens
2. Clique em **"Generate new token"** → **"Generate new token (classic)"**
3. Configurações:
   - **Note:** `Gerador Declarações - Dev Token`
   - **Expiration:** 90 days
   - **Scopes:** Marque:
     - ✅ `repo` (Full control of private repositories)
     - ✅ `user` (Read user profile data)
4. Clique em **"Generate token"**
5. **COPIE O TOKEN** (começa com `ghp_`)

#### **Passo 4: Editar js/config.js**

```javascript
const CONFIG = {
    github: {
        clientId: 'SEU_CLIENT_ID_AQUI',    // ← OAuth (opcional)
        owner: 'gaspargulungo',             // ← SEU USERNAME
        repo: 'gerador-declaracoes-data'    // ← Nome do repo
    },
    
    admins: [
        'gaspargulungo',  // ← Seu username
        'outro-admin'     // ← Outros admins
    ],
    
    // ... resto permanece igual
};
```

---

## 🎭 OPÇÕES DE AUTENTICAÇÃO

### **Opção A: Personal Access Token (Desenvolvimento)** 🔧

**Prós:**
- ✅ Mais simples de configurar
- ✅ Não precisa OAuth App
- ✅ Funciona imediatamente

**Contras:**
- ⚠️ Token expira (90 dias)
- ⚠️ Precisa colar manualmente na primeira vez
- ⚠️ Não é ideal para múltiplos usuários

**Como usar:**
1. Crie o Personal Access Token (passo 3 acima)
2. Abra `http://localhost:8000`
3. Clique em "Entrar com GitHub"
4. Cole o token quando solicitado
5. Pronto!

---

### **Opção B: GitHub OAuth (Produção)** 🚀

**Prós:**
- ✅ Login automático via GitHub
- ✅ Usuários não veem tokens
- ✅ Mais profissional
- ✅ Ideal para múltiplos usuários

**Contras:**
- ⚠️ Mais complexo de configurar
- ⚠️ Precisa OAuth App
- ⚠️ Callback URL deve estar correto

**Como usar:**
1. Crie OAuth App (passo 2 acima)
2. Configure `config.js` com Client ID
3. Usuários clicam em "Entrar com GitHub"
4. GitHub redireciona automaticamente
5. Sistema troca code por token automaticamente

---

## 🌙 CONFIGURAR DARK MODE

O Dark Mode já está **100% funcional**!

### **Como funciona:**

1. **Automático:** Detecta preferência do sistema
2. **Manual:** Botão flutuante no canto inferior direito
3. **Persistente:** Salva sua escolha no navegador

### **Ativar/Desativar:**

- Clique no botão 🌙 / ☀️ no canto inferior direito
- Ou pelo console:
  ```javascript
  // Ativar
  enableDarkMode();
  
  // Desativar
  disableDarkMode();
  
  // Alternar
  toggleDarkMode();
  ```

### **Personalizar (opcional):**

Edite `assets/css/styles.css` na seção `/* DARK MODE */` para ajustar cores.

---

## 🐛 TROUBLESHOOTING

### **Erro: "Owner/Repo não configurado"**

**Solução:**
1. Abra `js/config.js`
2. Substitua `'gaspargulungo'` pelo SEU username
3. Verifique se o nome do repo está correto

---

### **Erro: "Token inválido"**

**Possíveis causas:**
- Token expirou (90 dias)
- Token não tem permissões `repo` e `user`
- Token foi revogado

**Solução:**
1. Crie novo Personal Access Token
2. Cole quando o sistema pedir
3. Ou acesse `/callback.html` direto

---

### **Erro: "Repositório não encontrado"**

**Verificar:**
1. Nome do repo está correto no `config.js`?
2. Repo é PRIVADO?
3. Você tem acesso ao repo?
4. Token tem permissão `repo`?

**Solução:**
```bash
# Verificar se repo existe
curl -H "Authorization: token SEU_TOKEN" \
  https://api.github.com/repos/SEU_USER/gerador-declaracoes-data

# Deve retornar 200 OK
```

---

### **Erro: "Rate limit exceeded"**

**Causa:** Muitas requisições à API do GitHub (5000/hora)

**Solução:**
- Aguarde 1 hora
- Verifique no painel admin: "Configurações" → "Verificar Rate Limit"

---

### **Dark Mode não funciona**

**Verificar:**
1. Arquivo `js/dark-mode.js` foi carregado?
2. Console tem erros?
3. Botão está visível?

**Forçar:**
```javascript
// No console do navegador:
document.body.classList.add('dark-mode');
```

---

### **Callback não funciona (OAuth)**

**Verificar:**
1. URL de callback está correta no OAuth App?
2. Está acessando via servidor (não `file://`)?
3. Client ID está correto no `config.js`?

**Solução temporária:**
Use Personal Access Token em vez de OAuth

---

## 🎯 CHECKLIST DE CONFIGURAÇÃO

Antes de testar, confirme:

- [ ] Repositório `gerador-declaracoes-data` criado (PRIVADO)
- [ ] Estrutura de pastas criada no repo
- [ ] Personal Access Token gerado
- [ ] `js/config.js` editado com:
  - [ ] Seu username em `owner`
  - [ ] Nome do repo em `repo`
  - [ ] Seu username em `admins`
- [ ] Servidor HTTP rodando (`python3 -m http.server 8000`)
- [ ] Dark mode funcionando (botão aparece)

---

## 🚀 PRÓXIMOS PASSOS

Depois de configurado:

1. ✅ Teste o login (`/index.html`)
2. ✅ Acesse painel admin (`/admin.html`)
3. ✅ Verifique conexão com GitHub (tab Configurações)
4. ✅ Teste dark mode
5. ✅ Prossiga para Cenário B (usuários)

---

## 💬 AINDA TEM DÚVIDAS?

**Me diga:**
- Qual erro está aparecendo?
- Em qual etapa travou?
- Conseguiu criar o repo?
- Conseguiu o token?

**Estou aqui para ajudar!** 🤝
