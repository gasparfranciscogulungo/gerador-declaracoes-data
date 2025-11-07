# 🧪 GUIA DE TESTES PROFISSIONAL - Sistema de Upload de Imagens

**Data:** 7 de novembro de 2025  
**Status:** ✅ Upload funcionando - Testando integração completa  
**Token:** Temporário (atualizar após validação)

---

## 📋 CHECKLIST DE TESTES

### ✅ **FASE 1: Validação do Token** (COMPLETO)
- [x] Token testado no test-direct-upload.html
- [x] Upload bem-sucedido
- [x] Imagem acessível via URL gerada
- [x] Scopes confirmados: `repo` presente

---

### 🔄 **FASE 2: Login e Configuração Sistema**

#### Teste 1: Login Automático
```bash
# Abrir:
http://localhost:8000/login-direto.html

# Resultado esperado:
✅ Login automático com token dev
✅ Redirecionamento para admin.html
✅ Token salvo em localStorage
✅ Usuário identificado
```

#### Teste 2: Verificar Cache IndexedDB
```bash
# DevTools → Application → IndexedDB
# Verificar:
✅ Database: GeradorPDF_ImageCache existe
✅ Store: images existe
✅ Indexes: url, timestamp, hash
```

---

### 🎯 **FASE 3: Upload Completo de Empresa**

#### Teste 3.1: Adicionar Nova Empresa

**Dados de Teste:**
```
Nome: Empresa Teste Upload
NIF: 999888777
Endereço: Rua Teste, 123
```

**Imagens:**
- Logo: PNG pequeno (< 500KB)
- Carimbo: PNG pequeno (< 500KB)

**Passos:**
1. Abrir `admin.html`
2. Clicar em "Nova Empresa"
3. Preencher dados
4. Upload logo:
   - Selecionar imagem
   - Aguardar progresso
   - **Verificar:** Preview aparece INSTANTANEAMENTE
5. Upload carimbo:
   - Selecionar imagem
   - Aguardar progresso
   - **Verificar:** Preview aparece INSTANTANEAMENTE
6. Clicar em "Salvar Empresa"

**Resultado Esperado:**
```
✅ Upload logo: Sucesso
✅ Upload carimbo: Sucesso
✅ Preview visual: Ambas imagens aparecem
✅ Empresa salva em data/empresas.json
✅ JSON limpo (sem base64)
✅ Imagens no GitHub: assets/empresas/999888777/
```

#### Teste 3.2: Verificar GitHub

```bash
# Acessar:
https://github.com/gasparfranciscogulungo/gerador-declaracoes-data/tree/master/assets/empresas/999888777

# Verificar arquivos:
✅ logo.png (ou .jpg)
✅ carimbo.png (ou .jpg)
```

#### Teste 3.3: Verificar JSON

```bash
# Abrir DevTools → Network → XHR
# Fazer reload da página
# Verificar data/empresas.json

# Empresa deve ter:
{
  "id": "empresa_...",
  "nome": "Empresa Teste Upload",
  "nif": "999888777",
  "logo": "https://raw.githubusercontent.com/.../logo.png",
  "carimbo": "https://raw.githubusercontent.com/.../carimbo.png"
  // SEM logoPreview ou carimboPreview!
}
```

---

### 🖼️ **FASE 4: Visualização de Imagens**

#### Teste 4.1: Preview em Admin

**Após salvar empresa:**
```
1. Fechar modal
2. Abrir lista de empresas
3. Clicar na empresa recém-criada
4. Verificar preview lateral
```

**Resultado Esperado:**
```
✅ Logo aparece no preview lateral
✅ Carimbo aparece no preview lateral
✅ Imagens carregam SEM recarregar página
✅ Não há delay perceptível
```

#### Teste 4.2: Preview em Modal de Edição

```
1. Na lista, clicar em "Editar" na empresa
2. Modal abre com formulário preenchido
```

**Resultado Esperado:**
```
✅ Logo aparece no preview do modal
✅ Carimbo aparece no preview do modal
✅ Status mostra "carregado" (verde)
✅ Botões "Alterar" e "Remover" visíveis
```

---

### 📄 **FASE 5: Geração de PDF**

#### Teste 5.1: Criar Trabalhador

```
1. Ir para aba "Trabalhadores"
2. Adicionar trabalhador teste:
   - Nome: João Teste Silva
   - BI: 123456789LA000
   - Função: Desenvolvedor
   - Salário: 150.000
```

#### Teste 5.2: Gerar Declaração

```
1. Ir para aba "Declarações"
2. Selecionar empresa "Empresa Teste Upload"
3. Selecionar trabalhador "João Teste Silva"
4. Tipo: Trabalho e Vencimento
5. Preencher dados:
   - Período: Novembro 2025
   - Referência: DEC-001/2025
6. Clicar "Gerar Declaração"
```

**Resultado Esperado:**
```
✅ PDF gerado
✅ Logo aparece NO PDF (canto superior)
✅ Carimbo aparece NO PDF (rodapé)
✅ Imagens com qualidade boa
✅ Sem erro de CORS
✅ Sem placeholder/imagem quebrada
```

#### Teste 5.3: Verificar Cache

```
# DevTools → Application → IndexedDB → GeradorPDF_ImageCache → images

# Deve conter 2 registros:
✅ URL do logo → dataUrl (base64)
✅ URL do carimbo → dataUrl (base64)
```

---

### 🔄 **FASE 6: Cache e Performance**

#### Teste 6.1: Reload da Página

```
1. Após gerar PDF, fazer F5 (reload completo)
2. Ir novamente para "Declarações"
3. Gerar NOVA declaração da mesma empresa
```

**Resultado Esperado:**
```
✅ Imagens carregam INSTANTANEAMENTE
✅ Não há requisição HTTP (cache hit)
✅ Console mostra: "📦 Cache HIT: ..."
✅ PDF gerado em < 2 segundos
```

#### Teste 6.2: Modo Offline (Simulado)

```
1. DevTools → Network → Offline checkbox
2. Tentar gerar PDF novamente
```

**Resultado Esperado:**
```
✅ PDF ainda é gerado
✅ Logo e carimbo aparecem (cache)
✅ Apenas falha ao salvar (esperado offline)
```

---

### 🔐 **FASE 7: Validação de Segurança**

#### Teste 7.1: Dados Sensíveis

```
# Verificar que NÃO aparecem em logs públicos:
❌ Token completo no console
❌ Base64 completo de imagens
❌ Dados pessoais de trabalhadores

# OK aparecer:
✅ Token parcial (primeiros 10 chars)
✅ Hash de URLs
✅ IDs de empresas/trabalhadores
```

#### Teste 7.2: Validação de Inputs

```
# Testar upload de:
❌ Arquivo muito grande (> 2MB)
❌ Arquivo não-imagem (.txt, .pdf)
❌ Imagem corrompida
```

**Resultado Esperado:**
```
✅ Erro amigável exibido
✅ Não trava o sistema
✅ Formulário permanece editável
```

---

### 📊 **FASE 8: Performance e Métricas**

#### Métricas Aceitáveis:

| Operação | Tempo Aceitável | Tempo Ideal |
|----------|-----------------|-------------|
| Upload logo/carimbo | < 10s | < 5s |
| Preview aparecer | < 2s | Instantâneo |
| Salvar empresa | < 5s | < 3s |
| Gerar PDF (cache) | < 5s | < 2s |
| Gerar PDF (sem cache) | < 15s | < 8s |
| Carregamento página | < 3s | < 1.5s |

#### Teste de Performance:

```javascript
// No console do navegador:
console.time('Upload Logo');
// Fazer upload
console.timeEnd('Upload Logo');

console.time('Gerar PDF');
// Gerar PDF
console.timeEnd('Gerar PDF');
```

---

## ✅ CHECKLIST RESUMIDO

### Funcionalidades Críticas:
- [ ] Login funcionando
- [ ] Upload logo + carimbo
- [ ] Preview instantâneo após upload
- [ ] Salvar empresa (JSON limpo)
- [ ] Imagens no GitHub
- [ ] Cache IndexedDB funcionando
- [ ] PDF com logo + carimbo visíveis
- [ ] Reload mantém cache
- [ ] Modo offline funciona

### Qualidade de Código:
- [ ] Sem console.error não tratado
- [ ] Sem dados sensíveis em logs
- [ ] Validação de inputs
- [ ] Mensagens de erro amigáveis
- [ ] Loading states visuais
- [ ] Performance aceitável

### Segurança:
- [ ] Token não exposto em logs
- [ ] Validação de tipos de arquivo
- [ ] Sanitização de inputs
- [ ] HTTPS em produção (GitHub Pages)

---

## 🐛 TROUBLESHOOTING

### Problema: Logo não aparece no PDF
```
1. Verificar console.log
2. Verificar cache IndexedDB
3. Verificar URL no JSON
4. Testar URL manualmente no navegador
5. Verificar crossorigin no template
```

### Problema: Preview não atualiza
```
1. Verificar Alpine.js está carregado
2. Verificar empresaForm.logoPreview tem valor
3. F5 para forçar reload
4. Limpar cache do navegador
```

### Problema: Erro 401 no upload
```
1. Token expirou - gerar novo
2. Scope "repo" ausente - refazer token
3. Token errado no localStorage - fazer login novamente
```

---

## 📝 NOTAS IMPORTANTES

### Token de Desenvolvimento:
```
⚠️ TEMPORÁRIO - NÃO USAR EM PRODUÇÃO
Token atual: ghp_C6lHn4A7...CJbtQ
Status: Funcionando, mas EXPOSTO PUBLICAMENTE
Ação: Revogar e gerar novo após testes
```

### Próximos Passos:
1. ✅ Completar todos os testes acima
2. 🔐 Atualizar token para produção
3. 🛡️ Implementar proteção de dados sensíveis (LGPD)
4. 📚 Documentar para equipe
5. 🚀 Deploy para produção

---

**Testar TODAS as fases antes de considerar completo!**
