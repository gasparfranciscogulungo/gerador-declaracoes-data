# 📋 TODO - O que Falta Fazer

Este documento lista **todas as funcionalidades pendentes** e melhorias futuras.

---

## 🚨 Prioridade ALTA

### 1. Implementar Tipos de Documento Adicionais

**Status:** 🔴 Pendente
  
**Tipos a implementar:**

#### a) **Recibo de Salário** 🔴
- [ ] Criar template HTML (`js/modelos/recibo-salario.js`)
- [ ] Layout com:
  - Cabeçalho com logo da empresa
  - Informações do trabalhador
  - Tabela de vencimentos (salário base, subsídios, horas extras)
  - Tabela de descontos (IRT, Segurança Social, outros)
  - Total bruto, descontos, líquido
  - Assinatura e carimbo
- [ ] Sistema de seleção de meses (1-3 meses)
- [ ] Cálculos automáticos de impostos
- [ ] Preview responsivo

**Estimativa:** 8-12 horas

#### b) **Combo (Declaração + Recibos)** 🔴
- [ ] Lógica para gerar múltiplas páginas em um PDF
- [ ] Página 1: Declaração
- [ ] Páginas 2-4: Recibos (1-3 meses)
- [ ] Numeração de páginas
- [ ] Índice opcional
- [ ] Quebras de página corretas

**Estimativa:** 4-6 horas

#### c) **NIF (Número de Identificação Fiscal)** 🔴
- [ ] Template de documento fiscal
- [ ] Campos:
  - Nome completo
  - NIF (validação)
  - Morada
  - Data de emissão
  - Entidade emissora
  - QR Code (opcional)
- [ ] Validação de NIF angolano (algoritmo)
- [ ] Preview e geração de PDF

**Estimativa:** 6-8 horas

#### d) **Atestado Médico/Profissional** 🔴
- [ ] Template de atestado
- [ ] Campos:
  - Médico/Entidade emissora
  - Paciente/Trabalhador
  - Período de validade (de/até)
  - Motivo/Diagnóstico (opcional)
  - CID (Classificação Internacional de Doenças)
  - Assinatura e carimbo
- [ ] Tipos: Médico, Trabalho, Comparecimento
- [ ] Preview e PDF

**Estimativa:** 6-8 horas

---

## ⚠️ Prioridade MÉDIA

### 2. Melhorias no Editor BI

- [ ] **Upload múltiplo:** Permitir arrastar e soltar múltiplas fotos
- [ ] **Filtros de imagem:** Brightness, contrast, saturation
- [ ] **Recorte automático:** Detecção de rosto com ML (face-api.js)
- [ ] **Compressão de imagem:** Reduzir tamanho antes de upload
- [ ] **Formatos adicionais:** HEIC, WEBP

**Estimativa:** 6-10 horas

### 3. Sistema de Modelos Customizáveis

- [ ] **Editor visual de modelos:** Drag-and-drop de elementos
- [ ] **Biblioteca de blocos:** Header, footer, tabelas, listas
- [ ] **Placeholders dinâmicos:** Inserir variáveis facilmente
- [ ] **Preview ao vivo:** Ver mudanças instantaneamente
- [ ] **Salvar como template:** Reutilizar modelos customizados

**Estimativa:** 16-20 horas

### 4. Histórico Avançado

- [ ] **Filtros:** Por empresa, trabalhador, tipo, data
- [ ] **Ordenação:** Por data, tipo, empresa
- [ ] **Exportar:** CSV, Excel, JSON
- [ ] **Re-gerar:** Abrir documento antigo e gerar novamente
- [ ] **Estatísticas:** Gráficos de documentos por período

**Estimativa:** 8-12 horas

### 5. Sistema de Backup e Restore

- [ ] **Backup automático:** Agendar backups periódicos
- [ ] **Exportar tudo:** ZIP com todos os dados JSON
- [ ] **Importar dados:** Upload de backup anterior
- [ ] **Sincronização:** Com GitHub ou Google Drive
- [ ] **Versionamento:** Histórico de alterações

**Estimativa:** 10-14 horas

---

## 📊 Prioridade BAIXA

### 6. Dashboard Avançado

- [ ] **Gráficos:** Chart.js para visualizações
  - Documentos por mês (linha)
  - Documentos por tipo (pizza)
  - Empresas mais ativas (barra)
- [ ] **Calendário:** Ver documentos gerados por data
- [ ] **Metas:** Definir e acompanhar objetivos
- [ ] **Relatórios:** PDF de relatórios mensais

**Estimativa:** 12-16 horas

### 7. Notificações Avançadas

- [ ] **Push Notifications:** Via Service Worker
- [ ] **Email Notifications:** Via SendGrid ou similar
- [ ] **Lembretes:** Renovação de documentos
- [ ] **Alertas:** Limite de declarações próximo

**Estimativa:** 8-10 horas

### 8. Multi-idioma (i18n)

- [ ] **Português (PT-AO)** ✅ (atual)
- [ ] **Português (PT-PT)**
- [ ] **Português (PT-BR)**
- [ ] **Inglês (EN)**
- [ ] **Francês (FR)** (para Angola)
- [ ] Seletor de idioma
- [ ] Arquivos de tradução (JSON)

**Estimativa:** 10-12 horas

### 9. Temas Customizáveis

- [ ] **Light Mode** ✅ (atual)
- [ ] **Dark Mode** ✅ (atual)
- [ ] **High Contrast Mode:** Para acessibilidade
- [ ] **Custom Themes:** Criar e salvar temas próprios
- [ ] **Tema por empresa:** Cores automáticas

**Estimativa:** 6-8 horas

### 10. Acessibilidade (A11Y)

- [ ] **ARIA labels:** Em todos os elementos interativos
- [ ] **Navegação por teclado:** Tab order correto
- [ ] **Screen reader support:** Texto alternativo
- [ ] **Focus visible:** Indicador de foco claro
- [ ] **Contraste de cores:** WCAG AA compliant
- [ ] **Tamanho de texto:** Ajustável

**Estimativa:** 8-12 horas

---

## 🔮 Futuro (Visão de Longo Prazo)

### 11. Migração para Firebase

**Por quê?**
- GitHub API tem rate limits (5000 req/hora)
- Não é ideal para múltiplos usuários simultâneos
- Falta funcionalidades de banco de dados (queries, índices)

**O que migrar:**
- [ ] **Firestore:** Para empresas, trabalhadores, modelos
- [ ] **Firebase Auth:** Substituir GitHub OAuth
- [ ] **Firebase Storage:** Para logos e carimbos
- [ ] **Cloud Functions:** Para cálculos complexos
- [ ] **Firebase Hosting:** Hospedar aplicação

**Estimativa:** 20-30 horas

### 12. Backend Node.js (Alternativa ao Firebase)

- [ ] **Express.js API:** RESTful
- [ ] **MongoDB:** Banco de dados
- [ ] **JWT Auth:** Autenticação segura
- [ ] **Upload de arquivos:** Multer
- [ ] **Hospedagem:** Hostinger, Heroku, ou AWS

**Estimativa:** 30-40 horas

### 13. App Mobile Nativo

- [ ] **React Native:** iOS + Android
- [ ] **Câmera integrada:** Capturar fotos para BI
- [ ] **Offline-first:** Sincronizar quando online
- [ ] **Notificações push:** Nativas

**Estimativa:** 60-80 horas

### 14. Sistema de Assinaturas

- [ ] **Planos:** Free, Pro, Enterprise
- [ ] **Limites:** Documentos por mês
- [ ] **Pagamentos:** Stripe, PayPal, ou Multicaixa Express (Angola)
- [ ] **Faturação:** Recibos automáticos

**Estimativa:** 20-30 horas

### 15. Colaboração em Tempo Real

- [ ] **Múltiplos usuários:** Editando simultaneamente
- [ ] **WebSockets:** Sincronização em tempo real
- [ ] **Versionamento:** Controle de conflitos
- [ ] **Comentários:** Em documentos

**Estimativa:** 30-40 horas

---

## 🐛 Bugs Conhecidos (Minor)

1. [ ] **Safari Mobile:** Service Worker às vezes não carrega
   - **Workaround:** Recarregar página
   - **Solução:** Debugar lifecycle do SW no iOS

2. [ ] **Dark Mode:** Flash de light mode ao carregar
   - **Solução:** Inline script no `<head>` para aplicar dark mode antes de renderizar

3. [ ] **Cropper.js:** Alguns gestos multi-touch não funcionam em Android antigo
   - **Solução:** Polyfill para touch events

4. [ ] **LocalStorage cheio:** Sem tratamento de erro quando excede limite
   - **Solução:** Try-catch e limpeza de cache antigo

5. [ ] **GitHub API rate limit:** Não há feedback visual quando atinge limite
   - **Solução:** Detectar header `X-RateLimit-Remaining` e avisar usuário

---

## 🧪 Testes Necessários

### Testes Manuais

- [ ] **Cross-browser:**
  - [ ] Chrome ✅
  - [ ] Firefox ✅
  - [ ] Safari
  - [ ] Edge
  - [ ] Opera
  
- [ ] **Mobile:**
  - [ ] iPhone (Safari)
  - [ ] Android (Chrome)
  - [ ] Tablets (iPad, Android)
  
- [ ] **Offline:**
  - [ ] Funciona sem internet?
  - [ ] Service Worker cacheia corretamente?

### Testes Automatizados

- [ ] **Unit Tests:** Jest para funções JS
- [ ] **E2E Tests:** Playwright ou Cypress
- [ ] **Visual Regression:** Percy ou Chromatic

**Estimativa:** 12-16 horas

---

## 📈 Performance

### Otimizações Pendentes

- [ ] **Code splitting:** Lazy load de módulos grandes
- [ ] **Image optimization:** Converter para WebP
- [ ] **Minificação:** JS e CSS
- [ ] **Bundling:** Webpack ou Vite
- [ ] **CDN:** Para assets estáticos
- [ ] **Caching agressivo:** Headers HTTP

**Estimativa:** 6-10 horas

---

## 📚 Documentação

### Faltam Criar

- [ ] **API Documentation:** Se criar backend
- [ ] **User Guide:** Manual do usuário (PDF)
- [ ] **Video Tutorials:** Screencasts
- [ ] **FAQ:** Perguntas frequentes
- [ ] **Troubleshooting:** Guia de resolução de problemas
- [ ] **Contributing Guide:** Para colaboradores

**Estimativa:** 10-15 horas

---

## 🛡️ Segurança

### Melhorias Necessárias

- [ ] **HTTPS obrigatório:** Force redirect
- [ ] **CSP (Content Security Policy):** Headers
- [ ] **Rate limiting:** Client-side e server-side
- [ ] **Input sanitization:** Prevenir XSS
- [ ] **CSRF tokens:** Em forms POST
- [ ] **Auditoria de segurança:** Scan de vulnerabilidades

**Estimativa:** 8-12 horas

---

## 🎯 Resumo de Estimativas

| Categoria | Estimativa Total | Prioridade |
|-----------|------------------|------------|
| **Tipos de Documento Adicionais** | 24-34 horas | 🔴 ALTA |
| **Melhorias no Editor BI** | 6-10 horas | ⚠️ MÉDIA |
| **Sistema de Modelos** | 16-20 horas | ⚠️ MÉDIA |
| **Histórico Avançado** | 8-12 horas | ⚠️ MÉDIA |
| **Backup e Restore** | 10-14 horas | ⚠️ MÉDIA |
| **Dashboard Avançado** | 12-16 horas | 📊 BAIXA |
| **Notificações Avançadas** | 8-10 horas | 📊 BAIXA |
| **Multi-idioma** | 10-12 horas | 📊 BAIXA |
| **Temas Customizáveis** | 6-8 horas | 📊 BAIXA |
| **Acessibilidade** | 8-12 horas | 📊 BAIXA |
| **Testes** | 12-16 horas | 🧪 |
| **Performance** | 6-10 horas | 📈 |
| **Segurança** | 8-12 horas | 🛡️ |
| **Documentação** | 10-15 horas | 📚 |
| **Futuro (Firebase/Backend)** | 50-110 horas | 🔮 |
| **TOTAL** | **194-301 horas** | - |

---

## 🗓️ Roadmap Sugerido

### **Fase 1 (1-2 semanas)** 🔴
- Implementar Recibo de Salário
- Implementar Combo
- Implementar NIF
- Implementar Atestado
- Testes manuais cross-browser

### **Fase 2 (2-3 semanas)** ⚠️
- Melhorias no Editor BI
- Sistema de Modelos Customizáveis
- Histórico Avançado
- Backup e Restore

### **Fase 3 (1-2 semanas)** 📊
- Dashboard Avançado
- Notificações Avançadas
- Temas e Dark Mode polish
- Acessibilidade

### **Fase 4 (2-4 semanas)** 🔮
- Decidir: Firebase ou Backend próprio
- Migrar dados
- Implementar autenticação robusta
- Hospedagem profissional

### **Fase 5 (Contínuo)** 🧪
- Testes automatizados
- Performance monitoring
- Segurança audits
- Documentação atualizada

---

**Última atualização:** Dezembro 2024  
**Próxima revisão:** Após completar Fase 1
