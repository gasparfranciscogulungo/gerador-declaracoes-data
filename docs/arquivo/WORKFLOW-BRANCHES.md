# 🌳 Workflow de Branches - Gerador de PDF

## 📋 Padrão de Trabalho

A partir de agora, **TODA** alteração seguirá este fluxo:

### 1. **Criar Branch para a Feature/Fix**
```bash
# Sintaxe: feature/nome-descritivo ou fix/nome-problema
git checkout -b feature/implementar-recibo
# ou
git checkout -b fix/corrigir-dark-mode
```

### 2. **Fazer Alterações e Commit**
```bash
# Fazer as modificações necessárias
# Depois commitar com mensagem descritiva
git add .
git commit -m "feat: implementar geração de recibo de salário"
```

### 3. **Push da Branch**
```bash
git push -u origin feature/implementar-recibo
```

### 4. **Merge no Master (Após Validação)**
```bash
# Voltar para master
git checkout master

# Fazer merge (squash para commits limpos)
git merge --squash feature/implementar-recibo
git commit -m "feat: adicionar geração de recibo de salário"

# Push do master
git push origin master
```

### 5. **Limpar Commits Posteriores (Se Necessário)**

Se houver commits indesejados no master (como os commits 632af37, 0e31405, etc):

```bash
# Ver commits para identificar até onde voltar
git log --oneline -10

# Reset para o commit desejado (mantém working directory)
git reset --soft <commit-hash>

# Ou reset hard (apaga alterações)
git reset --hard <commit-hash>

# Force push para limpar no GitHub
git push --force origin master
```

### 6. **Apagar Branch Local e Remota (Opcional)**
```bash
# Local
git branch -d feature/implementar-recibo

# Remota
git push origin --delete feature/implementar-recibo
```

---

## 🏷️ Estado Atual Estável

**Tag:** `v1.0-stable`  
**Commit:** `34481f5`  
**Descrição:** Preview funcionando, modal de senha, sistema completo

Para voltar a este estado:
```bash
git checkout v1.0-stable
# ou
git reset --hard v1.0-stable
```

---

## 📝 Convenções de Nome de Branches

| Tipo | Prefixo | Exemplo |
|------|---------|---------|
| Nova funcionalidade | `feature/` | `feature/recibo-salario` |
| Correção de bug | `fix/` | `fix/preview-mobile` |
| Melhorias de UI | `ui/` | `ui/dark-mode-empresas` |
| Refatoração | `refactor/` | `refactor/admin-controller` |
| Documentação | `docs/` | `docs/guia-tokens` |
| Testes | `test/` | `test/pdf-generation` |

---

## 📝 Convenções de Commits

Seguir o padrão **Conventional Commits**:

```bash
feat: adiciona nova funcionalidade
fix: corrige um bug
docs: atualiza documentação
style: formatação (não afeta código)
refactor: refatora código sem mudar funcionalidade
test: adiciona ou corrige testes
chore: tarefas de manutenção
```

**Exemplos:**
```bash
git commit -m "feat: adicionar modal de senha nas seções protegidas"
git commit -m "fix: corrigir renderização do preview no mobile"
git commit -m "docs: atualizar README com novas instruções"
git commit -m "refactor: separar lógica de PDF em módulo"
```

---

## ⚠️ Regras Importantes

1. ✅ **SEMPRE** criar branch antes de começar
2. ✅ **NUNCA** commitar direto no master
3. ✅ Testar localmente antes de push
4. ✅ Fazer push da branch para backup
5. ✅ Merge no master apenas após validação
6. ✅ Manter histórico limpo (squash commits quando necessário)

---

## 🗑️ Limpeza de Commits Indesejados

### Cenário: Commits posteriores ao estável que precisam ser removidos

```bash
# 1. Ver commits
git log --oneline -10

# 2. Identificar o commit estável (ex: 34481f5)
# 3. Reset para ele
git reset --hard 34481f5

# 4. Force push (CUIDADO: apaga histórico no GitHub)
git push --force origin master

# 5. Atualizar branches de backup (se necessário)
git push --force origin backup-preview-melhorias
```

### ⚠️ ATENÇÃO com `git push --force`
- Use apenas quando tiver certeza
- Avise colaboradores antes
- Faça backup em branches separadas

---

## 🔄 Fluxo Completo (Exemplo Real)

```bash
# 1. Criar branch para implementar Recibo
git checkout -b feature/recibo-salario

# 2. Criar arquivo js/modelos/recibo-salario.js
# 3. Editar admin-controller.js (adicionar lógica)
# 4. Editar admin.html (adicionar template)

# 5. Commitar
git add js/modelos/recibo-salario.js js/admin-controller.js admin.html
git commit -m "feat: implementar geração de recibo de salário

- Criar módulo ModeloReciboSalario
- Adicionar renderização no admin-controller
- Criar template HTML no modal preview
- Adicionar cálculo de descontos (IRT, Segurança Social)"

# 6. Push da branch
git push -u origin feature/recibo-salario

# 7. Testar no GitHub Pages (ou localmente)

# 8. Merge no master (squash para commit limpo)
git checkout master
git merge --squash feature/recibo-salario
git commit -m "feat: adicionar geração de recibo de salário"
git push origin master

# 9. Limpar branch
git branch -d feature/recibo-salario
git push origin --delete feature/recibo-salario
```

---

## 📌 Branches Atuais

- ✅ **master** (HEAD em `34481f5`) - Estado estável
- 🗄️ **backup-estado-atual** (632af37) - Backup do estado quebrado
- 🗄️ **backup-preview-melhorias** (0928731) - Tentativa de melhoria
- 🏷️ **v1.0-stable** (tag em `34481f5`) - Referência estável

---

## 🎯 Próximos Passos

1. **Validar funcionalidades críticas** (login, preview, PDF, dark mode)
2. **Limpar commits posteriores** (632af37, 0e31405, 2833c23, ebe43f0, b322964)
3. **Force push do master limpo**
4. **Apagar branches de backup antigas**
5. **Começar feature/recibo-salario** (próximo documento)

---

**Última Atualização:** 3 de dezembro de 2025  
**Commit Base:** 34481f5 - "Resolvendo problemas no preview edit"
