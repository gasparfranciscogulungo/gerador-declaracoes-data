# 🗺️ ROADMAP - Próximos Passos do Projeto

## ✅ **CONCLUÍDO (Estado Atual)**

### **Sistema de Imagens** ✅
- [x] Upload de logo e carimbo para GitHub
- [x] Cache inteligente com IndexedDB
- [x] Fallback automático (CDN → API)
- [x] Validação de tamanho (100KB máximo)
- [x] Preview responsivo e atualizado
- [x] Imagens em lista, preview e PDF

### **Gestão de Empresas** ✅
- [x] CRUD completo (criar, editar, deletar)
- [x] Formulário profissional com validação
- [x] Endereço estruturado (Angola)
- [x] Cores personalizadas
- [x] Preview em tempo real

### **Sistema de Autenticação** ✅
- [x] Login via GitHub
- [x] OAuth App configurado
- [x] Token persistente
- [x] Verificação de permissões

---

## 🎯 **PRIORIDADE ALTA (Próximos 1-2 dias)**

### **1. 🔒 SEGURANÇA: Revogar Token Exposto**
**Prioridade:** 🔴 CRÍTICA

**Problema:**
- Token `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` exposto na conversa
- Risco de acesso não autorizado ao repositório

**Solução:**
1. Revogar token atual: https://github.com/settings/tokens
2. Gerar novo token com escopo "repo"
3. Atualizar `login-direto.html` (se usar)
4. Atualizar variáveis de ambiente (se houver)
5. **NÃO** commitar novo token no repositório

**Arquivos Afetados:**
- `login-direto.html` (deletar ou remover token)
- Qualquer arquivo de configuração com token hardcoded

**Tempo Estimado:** 15 minutos

---

### **2. 📄 LGPD: Proteção de Dados Sensíveis**
**Prioridade:** 🟠 ALTA

**Contexto:**
> "vamos falar sobre etica concernente a dados sencives" - Usuário

**Dados Sensíveis no Sistema:**
- NIF de empresas (identificação fiscal)
- Endereços completos
- Telefones e emails
- Nomes de trabalhadores nas declarações

**Implementar:**

#### **2.1. Criptografia de Dados**
```javascript
// Criptografar antes de salvar
const dadosCriptografados = await cryptoManager.encrypt(empresa);
await githubAPI.salvarJSON('data/empresas.json', dadosCriptografados);

// Descriptografar ao carregar
const dados = await githubAPI.carregarJSON('data/empresas.json');
const empresas = await cryptoManager.decrypt(dados);
```

**Bibliotecas:**
- `crypto-js` para AES-256
- Chave de criptografia em variável de ambiente

#### **2.2. Validação e Sanitização**
```javascript
// Validar NIF (Angola: 9-14 dígitos)
validarNIF(nif) {
  const nifLimpo = nif.replace(/[^0-9]/g, '');
  return nifLimpo.length >= 9 && nifLimpo.length <= 14;
}

// Sanitizar inputs (prevenir XSS)
sanitizeInput(input) {
  return DOMPurify.sanitize(input);
}
```

#### **2.3. Política de Privacidade**
- Criar `POLITICA-PRIVACIDADE.md`
- Explicar coleta, uso e armazenamento de dados
- Link na interface (`admin.html`, `index.html`)

#### **2.4. Consentimento do Usuário**
```html
<!-- Checkbox obrigatório ao criar empresa -->
<label>
  <input type="checkbox" required>
  Li e aceito a <a href="POLITICA-PRIVACIDADE.md">Política de Privacidade</a>
</label>
```

**Tempo Estimado:** 2-3 horas

---

### **3. 📊 Sistema de Auditoria (Logs)**
**Prioridade:** 🟡 MÉDIA

**Implementar:**
```javascript
// Registrar ações importantes
async registrarAuditoria(acao, detalhes) {
  const log = {
    timestamp: new Date().toISOString(),
    usuario: this.usuario.login,
    acao: acao, // 'criar_empresa', 'deletar_empresa', etc.
    detalhes: detalhes,
    ip: await obterIP() // opcional
  };
  
  await githubAPI.appendToFile('data/auditoria.log', JSON.stringify(log));
}
```

**Ações a Auditar:**
- Criação/edição/exclusão de empresas
- Upload de imagens
- Geração de PDFs
- Login/logout

**Tempo Estimado:** 1-2 horas

---

## 🚀 **PRIORIDADE MÉDIA (Próxima semana)**

### **4. 🎨 Sistema de Modelos Personalizados**
**Status:** Parcialmente implementado

**Melhorias:**
- [ ] Editor WYSIWYG de modelos
- [ ] Mais presets profissionais (jurídico, médico, etc.)
- [ ] Importar/exportar modelos como JSON
- [ ] Biblioteca pública de modelos

**Tempo Estimado:** 4-6 horas

---

### **5. 📱 Responsividade Mobile**
**Status:** Básico implementado

**Melhorias:**
- [ ] Interface otimizada para celular
- [ ] Gestos touch (swipe, pinch-to-zoom)
- [ ] Menu hamburger
- [ ] PWA (Progressive Web App)

**Tempo Estimado:** 3-4 horas

---

### **6. 🔍 Busca e Filtros Avançados**
**Implementar:**
```javascript
// Busca por nome, NIF, província
buscarEmpresas(termo) {
  return this.empresas.filter(e => 
    e.nome.toLowerCase().includes(termo.toLowerCase()) ||
    e.nif.includes(termo) ||
    e.endereco.provincia.toLowerCase().includes(termo.toLowerCase())
  );
}

// Filtros
filtrarPorProvincia(provincia) {
  return this.empresas.filter(e => e.endereco.provincia === provincia);
}

// Ordenação
ordenarPor(campo, ordem = 'asc') {
  this.empresas.sort((a, b) => {
    if (ordem === 'asc') return a[campo] > b[campo] ? 1 : -1;
    return a[campo] < b[campo] ? 1 : -1;
  });
}
```

**Tempo Estimado:** 2-3 horas

---

## 💡 **PRIORIDADE BAIXA (Futuro)**

### **7. 📈 Dashboard com Estatísticas**
- Gráficos de declarações por mês
- Top 5 empresas mais usadas
- Exportar relatórios (Excel/CSV)

**Bibliotecas:**
- Chart.js ou ApexCharts
- SheetJS para Excel

**Tempo Estimado:** 4-5 horas

---

### **8. 🔔 Sistema de Notificações**
- Notificações de upload concluído
- Avisos de erro
- Confirmação de ações críticas

**Implementar:**
```javascript
// Toast notifications
mostrarNotificacao(tipo, mensagem) {
  // Usar biblioteca como Toastify ou criar custom
}
```

**Tempo Estimado:** 1-2 horas

---

### **9. 🌐 Internacionalização (i18n)**
- Suporte para Português e Inglês
- Seletor de idioma

**Bibliotecas:**
- i18next
- Alpine.js i18n plugin

**Tempo Estimado:** 3-4 horas

---

### **10. ☁️ Backup Automático**
- Exportar dados periodicamente
- Download de backup em JSON/ZIP
- Restaurar de backup

**Tempo Estimado:** 2-3 horas

---

### **11. 👥 Gestão de Usuários Multi-tenant**
- Vários usuários no sistema
- Níveis de permissão (admin, editor, viewer)
- Empresas privadas por usuário

**Tempo Estimado:** 6-8 horas

---

### **12. 🖨️ Impressão em Lote**
- Gerar múltiplas declarações de uma vez
- Combinar PDFs
- Enviar por email automaticamente

**Tempo Estimado:** 3-4 horas

---

## 🛠️ **MELHORIAS TÉCNICAS**

### **13. ⚡ Performance**
- [ ] Lazy loading de imagens
- [ ] Virtual scrolling para lista longa
- [ ] Web Workers para processamento pesado
- [ ] Service Worker para offline

**Tempo Estimado:** 4-6 horas

---

### **14. 🧪 Testes Automatizados**
```javascript
// Jest + Testing Library
describe('Admin Controller', () => {
  test('deve criar empresa com sucesso', async () => {
    const resultado = await adminApp.salvarEmpresa();
    expect(resultado.success).toBe(true);
  });
});
```

**Tempo Estimado:** 6-8 horas

---

### **15. 📦 Build System**
- Webpack/Vite para bundling
- Minificação de JS/CSS
- Tree-shaking
- Code splitting

**Tempo Estimado:** 3-4 horas

---

## 📅 **CRONOGRAMA SUGERIDO**

### **Semana 1 (Segurança e Compliance)**
- Dia 1: Revogar token ✅
- Dia 2-3: Implementar LGPD (criptografia + validação)
- Dia 4: Política de privacidade + consentimento
- Dia 5: Sistema de auditoria

### **Semana 2 (UX e Features)**
- Dia 1-2: Busca e filtros avançados
- Dia 3-4: Responsividade mobile
- Dia 5: Testes e refinamentos

### **Semana 3 (Polimento)**
- Dia 1-2: Dashboard com estatísticas
- Dia 3: Notificações
- Dia 4-5: Documentação completa

---

## 🎯 **PRIORIDADES IMEDIATAS (HOJE/AMANHÃ)**

1. **🔴 CRÍTICO:** Revogar token GitHub exposto
2. **🟠 IMPORTANTE:** Implementar criptografia básica de dados
3. **🟡 RECOMENDADO:** Sistema de auditoria (logs)

---

## 📊 **MÉTRICAS DE SUCESSO**

- ✅ Sem tokens expostos
- ✅ Dados sensíveis criptografados
- ✅ 100% conformidade com LGPD
- ✅ Sistema de logs funcional
- ✅ Interface responsiva (mobile)
- ✅ Performance < 2s por operação

---

## 🤝 **PRÓXIMA AÇÃO**

**Agora você deve:**

1. **Revogar token imediatamente:**
   - https://github.com/settings/tokens
   - Deletar `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`

2. **Escolher próximo passo:**
   - Implementar LGPD? (2-3h)
   - Sistema de auditoria? (1-2h)
   - Melhorar modelos? (4-6h)

3. **Me dizer qual prioridade você quer focar! 🚀**

---

**Última Atualização:** 7 de novembro de 2025  
**Projeto:** Gerador de Declarações - Estado Atual: FUNCIONAL ✅
