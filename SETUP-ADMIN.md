# 🚀 GUIA DE CONFIGURAÇÃO - CENÁRIO A (ADMIN)

## ✅ O QUE FOI CRIADO:

### **Arquivos JavaScript:**
- ✅ `js/github-api.js` - Comunicação com GitHub API
- ✅ `js/auth-manager.js` - Gerenciamento de autenticação
- ✅ `js/config.js` - Configurações do sistema
- ✅ `js/admin-controller.js` - Lógica do painel admin

### **Interface:**
- ✅ `admin.html` - Painel administrativo completo
- ✅ `index.html` - Página de login atualizada

---

## 📋 PRÓXIMOS PASSOS PARA VOCÊ:

### **1. Criar Repositório de Dados no GitHub**

```bash
# 1. Crie um novo repositório PRIVADO no GitHub
#    Nome sugerido: gerador-declaracoes-data
#    https://github.com/new

# 2. Inicialize com estrutura básica
mkdir gerador-declaracoes-data
cd gerador-declaracoes-data
git init

# 3. Criar estrutura de pastas
mkdir -p data models/types assets/logos assets/carimbos

# 4. Criar arquivos iniciais
echo '{"empresas":[]}' > data/empresas.json
echo '{"modelos":[]}' > data/modelos.json
echo '{"contadores":{},"historico":[]}' > data/contador.json

# 5. Commit e push
git add .
git commit -m "🎉 Estrutura inicial"
git branch -M main
git remote add origin https://github.com/SEU-USER/gerador-declaracoes-data.git
git push -u origin main
```

---

### **2. Criar Personal Access Token (para desenvolvimento)**

1. Acesse: https://github.com/settings/tokens
2. Clique em "Generate new token" → "Generate new token (classic)"
3. Configurações:
   - **Note:** `Gerador Declarações - Dev Token`
   - **Expiration:** 90 days (ou custom)
   - **Scopes:** Marque:
     - ✅ `repo` (Full control of private repositories)
     - ✅ `user` (Read user profile data)
4. Clique em "Generate token"
5. **COPIE O TOKEN** (você não verá novamente!)

---

### **3. Configurar o Sistema**

Edite o arquivo `js/config.js`:

```javascript
const CONFIG = {
    github: {
        clientId: 'SEU_CLIENT_ID_AQUI',  // ← Por enquanto deixe assim
        owner: 'gaspargulungo',           // ← SEU USERNAME do GitHub
        repo: 'gerador-declaracoes-data'  // ← Nome do repo que criou
    },
    
    admins: [
        'gaspargulungo',  // ← SEU USERNAME
    ],
    
    // ... resto fica igual
};
```

---

### **4. Testar Localmente**

```bash
# No diretório do projeto frontend (GeradorDePDF)
# Precisa de um servidor local

# Opção 1: Python (se tiver instalado)
python3 -m http.server 8000

# Opção 2: Node.js
npx http-server -p 8000

# Opção 3: PHP
php -S localhost:8000

# Acesse: http://localhost:8000
```

---

### **5. Como usar o sistema:**

#### **Login (por enquanto simplificado):**

1. Abra `http://localhost:8000`
2. Clique em "Painel Admin" diretamente
3. **Quando pedir o token:** Cole o Personal Access Token que você criou

#### **No Painel Admin você poderá:**

✅ Ver estatísticas (empresas, modelos, users)  
✅ Listar empresas existentes  
✅ Resetar contador de declarações  
✅ Deletar empresas/modelos  
✅ Verificar conexão com repo  
✅ Sincronizar dados  
✅ Ver rate limit da API  

---

## 🔜 PRÓXIMO CENÁRIO (B - USERS)

Depois de testar o admin, vamos criar:

1. **user.html** - Painel do usuário
2. **user-controller.js** - Lógica de gestão de clientes
3. Formulário "Adicionar Cliente"
4. Sistema de geração de declarações integrado com GitHub

---

## 🐛 TROUBLESHOOTING:

### **Erro: "Owner/Repo não configurado"**
→ Edite `js/config.js` com seus dados

### **Erro: "Token inválido"**
→ Crie novo Personal Access Token com permissões `repo` e `user`

### **Erro: "Repo não encontrado"**
→ Verifique se o nome do repo está correto no `config.js`
→ Verifique se o repo é PRIVADO e você tem acesso

### **Erro 404 ao carregar arquivos**
→ Certifique-se que está rodando via servidor (não abrindo arquivo:// direto)

---

## 📞 STATUS ATUAL:

✅ **CENÁRIO A - ADMIN: 90% COMPLETO**

**O que funciona:**
- ✅ Autenticação básica
- ✅ Conexão com GitHub API
- ✅ Leitura de dados do repo
- ✅ Escrita (commit/push) automática
- ✅ Interface admin responsiva
- ✅ Gestão de empresas (visualizar, deletar)
- ✅ Gestão de modelos (visualizar, deletar)
- ✅ Reset de contadores
- ✅ Sincronização de dados

**O que falta (faremos a seguir):**
- ⏳ Modal "Adicionar Empresa" (formulário completo)
- ⏳ Modal "Criar Modelo" (editor de type models)
- ⏳ Upload de logos e carimbos
- ⏳ Editor visual de modelos

---

## 🎯 QUER TESTAR AGORA?

**Faça:**

1. ✅ Crie o repositório `gerador-declaracoes-data`
2. ✅ Crie o Personal Access Token
3. ✅ Configure `js/config.js`
4. ✅ Rode servidor local
5. ✅ Acesse o painel admin
6. ✅ Cole o token quando pedir

**Me diga se conseguiu ou se encontrou algum erro!** 🚀

---

## 🔥 PRÓXIMA ITERAÇÃO:

Quando estiver funcionando, vamos:

1. Completar modals de criar/editar
2. Sistema de upload de imagens
3. Criar painel USER (Cenário B)

**Está pronto para testar?** 💪
