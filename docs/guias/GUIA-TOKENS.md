# 🔑 GUIA: Como Criar Token GitHub para Usuários

## Para Usuários Normais (User Panel)

Quando criar um novo token em: https://github.com/settings/tokens/new

### ✅ Permissões Obrigatórias:

```
☑ repo (Controle total de repositórios privados)
  ☑ repo:status
  ☑ repo_deployment  
  ☑ public_repo
  ☑ repo:invite
```

**OU**, se o repositório for PÚBLICO, apenas:

```
☑ public_repo (Acesso a repositórios públicos)
```

### ⚙️ Configurações Recomendadas:

- **Note:** "Gerador PDF - User Token - [Nome do Usuário]"
- **Expiration:** 90 days (3 meses)
- **Resource owner:** Sua conta pessoal

---

## Para Administradores (Admin Panel)

### ✅ Permissões Necessárias:

```
☑ repo (Controle total de repositórios)
  ☑ repo:status
  ☑ repo_deployment
  ☑ public_repo
  ☑ repo:invite
  ☑ security_events

☑ admin:org (Se usar organização)
  ☑ write:org
  ☑ read:org

☑ delete_repo (Opcional, para limpeza)
```

---

## 📋 Passo a Passo para Criar Token

### 1. Acesse a página de tokens:
https://github.com/settings/tokens/new

### 2. Preencha os campos:

**Note (descrição):**
```
Gerador PDF - User Token - João Silva
```

**Expiration:**
```
90 days
```

### 3. Selecione as permissões:

**Para USUÁRIOS** (apenas ler e escrever seus próprios dados):
- ☑ `public_repo` (se repo for público)
- ☑ `repo` (se repo for privado)

**Para ADMINS** (gerenciar tudo):
- ☑ `repo` (completo)
- ☑ `admin:org` (se usar organização)

### 4. Clique em "Generate token"

### 5. COPIE O TOKEN
⚠️ **IMPORTANTE:** O token só aparece UMA VEZ! Copie e guarde em local seguro.

Exemplo de token:
```
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
```

---

## 🔐 Como Usar o Token

### No User Panel:

1. Abra `index.html` ou `user-panel.html`
2. Cole o token quando solicitado
3. Sistema salva automaticamente no localStorage

### Teste o Token:

Abra `test-completo.html` e clique em "Testar Tokens"

---

## ⚠️ SEGURANÇA - IMPORTANTE!

### ❌ NÃO FAZER:

- ❌ Compartilhar token com outras pessoas
- ❌ Commitar token no código (Git)
- ❌ Postar token em chat/email/WhatsApp
- ❌ Usar token de outra pessoa

### ✅ FAZER:

- ✅ Cada usuário cria seu próprio token
- ✅ Guarda token em local seguro (gestor de senhas)
- ✅ Revoga token se suspeitar de comprometimento
- ✅ Renova token a cada 90 dias

---

## 🗑️ Como Revogar Token (Se Comprometido)

1. Acesse: https://github.com/settings/tokens
2. Encontre o token comprometido
3. Clique em "Delete"
4. Crie um novo token

---

## 📊 Comparação de Permissões

| Funcionalidade | User (public_repo) | User (repo) | Admin (repo + org) |
|----------------|-------------------|-------------|-------------------|
| Ver empresas | ✅ | ✅ | ✅ |
| Ver seus trabalhadores | ✅ | ✅ | ✅ |
| Adicionar trabalhador | ✅ | ✅ | ✅ |
| Editar trabalhador | ✅ | ✅ | ✅ |
| Ver trabalhadores de outros | ❌ | ❌ | ✅ |
| Adicionar empresa | ❌ | ❌ | ✅ |
| Adicionar colaboradores | ❌ | ❌ | ✅ |
| Deletar dados | ❌ | ❌ | ✅ |

---

## 🚀 Resumo Rápido

### Para Usuário Normal:
```
Permissão: public_repo (repo público) OU repo (repo privado)
Uso: Ler empresas + Gerenciar SEUS trabalhadores
```

### Para Administrador:
```
Permissão: repo + admin:org (completo)
Uso: Gerenciar TUDO (empresas, todos trabalhadores, usuários)
```

---

## 🆘 Problemas Comuns

### "403 Forbidden" ao salvar trabalhador
**Causa:** Token sem permissão `repo` ou `public_repo`  
**Solução:** Recriar token com permissões corretas

### "404 Not Found" ao acessar dados
**Causa:** Usuário não é colaborador do repositório privado  
**Solução:** Admin precisa adicionar como colaborador

### "401 Unauthorized"
**Causa:** Token expirou ou inválido  
**Solução:** Criar novo token

### "Bad credentials"
**Causa:** Token copiado incorretamente  
**Solução:** Copiar token novamente com cuidado

---

## 📞 Suporte

Se precisar de ajuda:
1. Verifique se token foi copiado corretamente
2. Teste token em `test-completo.html`
3. Verifique permissões do token em: https://github.com/settings/tokens
4. Se necessário, delete e crie novo token

