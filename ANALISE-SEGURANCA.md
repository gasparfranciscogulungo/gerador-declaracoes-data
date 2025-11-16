# 🔐 ANÁLISE: Repositório Público vs Privado com Colaboradores

## Situação Atual
- ✅ **Funcionando:** Repo público, qualquer token pode ler
- ⚠️ **Problema:** Qualquer pessoa com link pode ver os dados das empresas
- 🎯 **Objetivo:** Controlar quem acessa os dados

---

## Opção 1: Repositório PÚBLICO (Atual)

### ✅ Vantagens
1. **Simplicidade total**
   - Usuário só precisa de token GitHub válido (qualquer token)
   - Sem necessidade de gerenciar colaboradores
   - Sem aprovações ou convites

2. **Performance**
   - GitHub CDN serve arquivos estáticos gratuitamente
   - Pode usar URLs raw diretas (logos, PDFs)
   - Sem limites de rate limit para conteúdo público

3. **Manutenção zero**
   - Não precisa adicionar/remover colaboradores
   - Não precisa sincronizar permissões
   - Sistema funciona imediatamente

### ❌ Desvantagens
1. **ZERO Segurança**
   - Qualquer pessoa pode ver: https://github.com/gasparfranciscogulungo/gerador-declaracoes-data
   - Dados de empresas expostos (NIF, endereços, salários)
   - Logos e carimbos públicos
   - Histórico de commits público (quem fez o quê)

2. **Compliance/RGPD**
   - Violação de privacidade de dados pessoais
   - Salários e informações sensíveis expostas
   - Possível problema legal em Angola/Portugal

3. **Reputação**
   - Não é profissional ter dados de clientes públicos
   - Empresas podem reclamar se descobrirem

---

## Opção 2: Repositório PRIVADO + Colaboradores Automáticos

### ✅ Vantagens
1. **Segurança Real**
   - Apenas usuários autorizados veem dados
   - GitHub gerencia autenticação
   - Logs de acesso (auditoria)
   - Dados protegidos por senha 2FA do GitHub

2. **Controle Granular**
   - Pode definir permissões por usuário:
     - `read` - apenas ler (para users normais)
     - `write` - editar dados
     - `admin` - controle total
   - Pode REVOGAR acesso a qualquer momento
   - Histórico de quem acessou quando

3. **Profissionalismo**
   - Sistema segue boas práticas
   - Compliance com proteção de dados
   - Empresas confiam mais no sistema

4. **Flexibilidade**
   - Pode ter múltiplos níveis de acesso
   - Usuários temporários (ex: freelancers)
   - Pode expulsar usuários problemáticos

### ❌ Desvantagens
1. **Complexidade Técnica**
   - Precisa implementar sistema de convites
   - Usuário precisa aceitar convite via email
   - Pode falhar se email não chegar

2. **Rate Limits GitHub**
   - Adicionar colaborador = 1 API call
   - Limite: 5000 calls/hora (suficiente)
   - Precisa token com permissão `admin:org` ou `repo`

3. **UX mais complexa**
   - User não entra imediatamente
   - Precisa ir ao email → aceitar convite → voltar ao app
   - Pode confundir usuários não técnicos

4. **Custo (possível)**
   - GitHub Free: repo privado ilimitado ✅
   - Mas colaboradores externos podem ter limites (verificar)

---

## Opção 3: HÍBRIDA (Recomendada) 🌟

### Arquitetura Proposta

```
├── gerador-declaracoes-data (PRIVADO) ← Dados sensíveis
│   ├── data/empresas.json
│   ├── data/trabalhadores.json (salários, NIF, BI)
│   └── data/users.json
│
└── gerador-declaracoes-assets (PÚBLICO) ← Assets não sensíveis
    ├── assets/logos/*.png
    ├── assets/carimbos/*.png
    └── models/templates/*.html
```

### Como Funciona
1. **Dados sensíveis** → Repo privado com colaboradores
2. **Imagens/templates** → Repo público (performance)
3. **Sistema adiciona colaboradores automaticamente** no login

### Vantagens COMBINADAS
- ✅ Segurança para dados críticos
- ✅ Performance para imagens (CDN público)
- ✅ Compliance legal
- ✅ UX razoável (aceita 1x o convite, depois funciona sempre)

---

## Implementação: Sistema de Colaboradores Automáticos

### Fluxo Proposto

```
User faz login (token GitHub)
    ↓
Sistema verifica: user já é colaborador?
    ├─ SIM → Acesso imediato ✅
    └─ NÃO → Convite automático
              ↓
         Mostra mensagem:
         "Convite enviado para seu email GitHub!
          Aceite o convite e recarregue a página"
              ↓
         User vai ao email → Aceita
              ↓
         Recarrega página → Acesso liberado ✅
```

### Código Necessário

```javascript
// Verificar se é colaborador
async function isColaborador(username, token) {
    const response = await fetch(
        `https://api.github.com/repos/${owner}/${repo}/collaborators/${username}`,
        { headers: { 'Authorization': `token ${token}` } }
    );
    return response.status === 204; // 204 = é colaborador
}

// Adicionar como colaborador
async function adicionarColaborador(username, adminToken) {
    await fetch(
        `https://api.github.com/repos/${owner}/${repo}/collaborators/${username}`,
        {
            method: 'PUT',
            headers: { 
                'Authorization': `token ${adminToken}`,
                'Accept': 'application/vnd.github.v3+json'
            },
            body: JSON.stringify({ permission: 'pull' }) // read-only
        }
    );
}
```

### Permissões GitHub API

Para adicionar colaboradores, o token ADMIN precisa de:
- `repo` (controle total do repositório)
- OU `admin:org` (se for organização)

---

## Requisitos de Permissões

### Níveis de Acesso GitHub

| Permissão | Pode Ler | Pode Escrever | Pode Admin |
|-----------|----------|---------------|------------|
| `pull` | ✅ | ❌ | ❌ |
| `push` | ✅ | ✅ | ❌ |
| `admin` | ✅ | ✅ | ✅ |
| `maintain` | ✅ | ✅ | ⚠️ Parcial |
| `triage` | ✅ | ❌ (só issues) | ❌ |

**Para user-panel:** Usar `pull` (read-only) é suficiente.

---

## Recomendação Final 🎯

### Para Sistema Profissional com Dados Sensíveis:

1. **TORNAR REPO PRIVADO NOVAMENTE**
2. **Implementar sistema de colaboradores automáticos**
3. **Criar repo público separado só para assets**

### Por quê?
- ✅ Proteção de dados (legal)
- ✅ Profissionalismo
- ✅ Controle de acesso
- ✅ Auditoria (quem acessou quando)
- ✅ Pode revogar acesso de ex-funcionários

### Custo Adicional?
- ❌ Zero! GitHub Free permite:
  - Repos privados ilimitados
  - Colaboradores ilimitados
  - 2000 minutos CI/mês (não estamos usando)

---

## Próximos Passos (Se Decidir Implementar)

1. **Verificar permissões do token admin**
   ```bash
   curl -H "Authorization: token $ADMIN_TOKEN" \
        https://api.github.com/user/repos | jq '.[0].permissions'
   ```

2. **Criar função de auto-convite** no `auth.js`

3. **Atualizar UI** para mostrar status do convite

4. **Testar fluxo completo** com usuário teste

5. **Documentar** processo para novos usuários

---

## Questões para Decidir

1. **Quantos usuários terás?** (< 10, < 100, > 100?)
2. **Dados são realmente sensíveis?** (Salários, NIF, BI são pessoais?)
3. **Compliance é importante?** (Regulamento de proteção de dados?)
4. **UX vs Segurança:** Aceitas pedir ao user para aceitar convite?
5. **Tempo de implementação:** Quanto tempo tens para implementar?

---

## Minha Recomendação Pessoal 💡

**Se é um sistema interno/pequena empresa (< 20 users):**
→ **Sistema de colaboradores automáticos** (2-3h implementação)

**Se é um produto SaaS público:**
→ **Backend próprio** (Node.js/Firebase) + GitHub só para versionamento

**Se é projeto pessoal/demonstração:**
→ **Público** está OK (mas remove dados reais antes!)

