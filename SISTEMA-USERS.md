# Sistema de Rastreamento Automático de Usuários

## 🎯 Como Funciona

O sistema **não usa banco de dados de usuários** tradicional. Em vez disso, rastreia automaticamente a atividade dos usuários através dos arquivos existentes:

### Fontes de Dados

1. **`data/trabalhadores.json`** - Rastreia clientes criados
   - Campo `usuario_id` ou `criado_por` identifica quem criou
   - Conta quantos clientes cada usuário tem

2. **`data/historico.json`** - Rastreia documentos gerados
   - Campo `usuario` ou `criado_por` identifica quem gerou
   - Conta quantos PDFs cada usuário criou
   - Registra data do último acesso

### Exemplo de Dados Rastreados

```json
{
  "username": "joaosilva",
  "clientes": 5,        // ← 5 trabalhadores criados
  "documentos": 23,     // ← 23 PDFs gerados
  "ultimoAcesso": "2025-11-15T01:45:00Z"
}
```

## 📊 Estatísticas Disponíveis

### 1. Painel de Usuários (`users.html`)

**Stats Gerais:**
- Total de usuários ativos (extraído dos dados)
- Total de clientes criados (soma de todos)
- Total de documentos gerados (soma de todos)

**Por Usuário:**
- Username (extraído do GitHub)
- Avatar (via GitHub API: `https://github.com/{username}.png`)
- Quantidade de clientes
- Quantidade de documentos
- Último acesso
- Role (admin ou user)

### 2. Histórico de Documentos

**Filtros:**
- Por usuário
- Por tipo de documento (declaração, recibo, combo)
- Por empresa
- Por data (início e fim)
- Busca por texto

**Analytics:**
- Gráfico de documentos por dia (30 dias)
- Gráfico de tipos de documentos (pizza)
- Top empresas mais usadas
- Top usuários mais ativos

## 🔄 Fluxo de Registro Automático

### Quando um Novo Usuário Entra:

1. **Login** (`index.html`)
   - Verifica token no GitHub
   - Salva `localStorage.token` e `localStorage.username`
   - Se não é admin → redireciona para `user-panel.html`

2. **Primeiro Acesso** (`user-panel.html`)
   - Usuário entra sem aprovação
   - Pode criar clientes (trabalhadores)
   - Pode gerar documentos

3. **Registro Automático**
   - Ao criar cliente: `data/trabalhadores.json` recebe `usuario_id: username`
   - Ao gerar PDF: `data/historico.json` recebe `usuario: username`

4. **Rastreamento** (`users.html`)
   - Admin acessa gerenciador
   - Sistema lê `trabalhadores.json` e `historico.json`
   - Extrai usuários únicos automaticamente
   - Calcula estatísticas em tempo real

## 🛠️ Estrutura dos Dados

### `data/trabalhadores.json`
```json
{
  "data": {
    "trabalhadores": [
      {
        "id": "1",
        "nome": "João Silva",
        "usuario_id": "joaodev",  // ← RASTREAMENTO
        "criado_por": "joaodev",   // ← BACKUP
        "created_at": "2025-11-15T00:00:00Z"
      }
    ]
  }
}
```

### `data/historico.json`
```json
{
  "data": {
    "historico": [
      {
        "id": "1",
        "tipo": "declaracao",
        "trabalhador_nome": "João Silva",
        "empresa_nome": "Tech LTDA",
        "usuario": "joaodev",      // ← RASTREAMENTO
        "criado_por": "joaodev",   // ← BACKUP
        "data": "2025-11-15T01:30:00Z"
      }
    ]
  }
}
```

## 🎨 Interface do Gerenciador

### Cards de Estatísticas
- **Total Usuários** - Contador em tempo real
- **Ativos** - Sempre = Total (sem aprovação)
- **Pendentes** - Sempre 0 (sistema removido)
- **Bloqueados** - Sempre 0 (sistema removido)
- **Total Docs** - Soma de `historico.json`

### Tabela de Usuários
| Username | Avatar | Clientes | Documentos | Último Acesso | Role |
|----------|--------|----------|------------|---------------|------|
| joaodev  | 🖼️     | 5        | 23         | Há 2h         | User |
| maria    | 🖼️     | 12       | 67         | Há 1 dia      | User |
| admin    | 🖼️     | 0        | 0          | Há 5 min      | Admin|

### Filtros
- **Todos** - Mostra todos os usuários
- **Ativos** - Sempre = Todos
- **Pendentes** - Sempre vazio
- **Bloqueados** - Sempre vazio
- **Busca** - Por username

## 🚀 Vantagens do Sistema

1. **Sem Banco de Dados**
   - GitHub como backend
   - Sem servidor próprio
   - Custo zero

2. **Registro Automático**
   - Sem aprovação manual
   - Usuário entra e usa imediatamente
   - Admin só monitora atividade

3. **Rastreamento Passivo**
   - Não precisa criar registro explícito
   - Dados extraídos de ações reais
   - Estatísticas sempre atualizadas

4. **Privacidade**
   - Não armazena senhas
   - Usa GitHub PAT do próprio usuário
   - Admin vê apenas username público

## 🔒 Controle de Acesso

### Admins (em `js/config.js`)
```javascript
CONFIG = {
  admins: ['gasparfranciscogulungo']
}
```

- Admin pode:
  - Ver todos os usuários
  - Ver estatísticas globais
  - Criar empresas (usuários não podem)
  - Acessar `users.html`

- Usuário comum pode:
  - Criar clientes (trabalhadores)
  - Gerar documentos
  - Ver apenas seus próprios dados
  - Acessa apenas `user-panel.html`

## 📝 Notas Importantes

1. **Primeiro Login**
   - Não aparece em `users.html` até criar algo
   - Precisa criar 1 cliente OU gerar 1 documento

2. **Histórico**
   - Limitado ao que está em `data/historico.json`
   - Se histórico for limpo, stats zeradas

3. **Performance**
   - Sistema lê arquivos JSON a cada carregamento
   - Para muitos usuários (100+), pode ficar lento
   - Considerar cache no futuro

4. **Migração Futura**
   - Se precisar de mais controle, migrar para Firebase
   - Estrutura atual facilita migração
   - Basta adaptar `githubAPI.lerJSON()` para `firebase.get()`

## 🧪 Como Testar

1. **Como Admin:**
   ```
   1. Login com seu token (gasparfranciscogulungo)
   2. Acesse "Gerenciar Usuários" no admin
   3. Veja estatísticas em tempo real
   ```

2. **Como Novo Usuário:**
   ```
   1. Crie token do GitHub com outro usuário
   2. Faça login no sistema
   3. Crie 1 cliente
   4. Gere 1 documento
   5. Como admin, atualize users.html
   6. Novo usuário aparece automaticamente! ✅
   ```

## 🐛 Troubleshooting

**Usuário não aparece?**
- Verifique se criou cliente ou documento
- Veja console do navegador (F12)
- Confira `data/trabalhadores.json` ou `data/historico.json`

**Stats erradas?**
- Clique em "Sincronizar" no header
- Hard reload (Ctrl+Shift+R)
- Verifique campos `usuario_id` nos JSONs

**Gráficos não aparecem?**
- Abra tab "Analytics"
- Aguarde 1-2 segundos
- Precisa de pelo menos 1 documento no histórico
