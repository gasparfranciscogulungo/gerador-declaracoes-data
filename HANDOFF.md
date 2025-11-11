# 🤝 HANDOFF - Guia para Continuar o Projeto

Este documento é um **guia completo** para quem for continuar trabalhando no projeto (seja você mesmo em outro chat, ou outro desenvolvedor).

---

## 🎯 Contexto Rápido

**Você está entrando em:** Um sistema PWA de geração de documentos (PDFs) para empresas angolanas.

**Estado atual:** ~85% completo, 100% funcional para declarações, interface totalmente responsiva.

**Próximo passo:** Implementar os tipos de documento adicionais (Recibo, Combo, NIF, Atestado).

---

## 📁 Arquivos Principais

### **Você vai trabalhar principalmente com:**

1. **`admin.html`** (3740 linhas)
   - Interface completa do admin
   - Modals: Preview, Cropper, Fluxo, Empresas, Trabalhadores
   - **Linha 2563:** Preview de Declaração (funciona ✅)
   - **Linhas 2584-2642:** Previews de outros tipos (placeholders 🔴)

2. **`js/admin-controller.js`** (4170 linhas)
   - Controlador Alpine.js
   - **Linha 7:** Função `adminApp()` (ponto de entrada)
   - **Linha 82:** Estado `tipoPreview` (controla qual tipo está ativo)
   - **Linha 2500+:** Funções de renderização de documentos

3. **`js/modelos/declaracao-executivo.js`**
   - Exemplo de template de documento
   - Use como base para criar outros tipos

4. **`data/*.json`**
   - `empresas.json`: Dados das empresas
   - `trabalhadores.json`: Dados dos trabalhadores
   - `modelos.json`: Catálogo de templates
   - **ATENÇÃO:** Estes arquivos estão no GitHub, use `github-api.js` para ler/salvar

---

## 🚀 Como Começar

### 1. **Configurar Ambiente Local**

```bash
# 1. Clone o repositório (se ainda não fez)
git clone https://github.com/seu-usuario/GeradorDePDF.git
cd GeradorDePDF

# 2. Inicie um servidor local
python -m http.server 8000
# OU
npx http-server

# 3. Abra no navegador
http://localhost:8000/admin.html
```

### 2. **Login**

- Vá para `/login.html` ou `/login-simples.html`
- Insira o **GitHub Personal Access Token**
- Será redirecionado para `/admin.html`

**Se não tiver token:**
1. GitHub → Settings → Developer Settings → Personal Access Tokens
2. Generate new token (classic)
3. Scopes: `repo` (acesso total ao repositório)

### 3. **Entender o Fluxo**

```
admin.html (Interface)
    ↓
admin-controller.js (Lógica Alpine.js)
    ↓
github-api.js (CRUD de dados)
    ↓
GitHub Repository (Backend)
```

---

## 🔧 Tarefas Prioritárias

### **Tarefa 1: Implementar Recibo de Salário** 🔴

**Objetivo:** Criar template de recibo com tabela de vencimentos e descontos.

**Passos:**

1. **Criar arquivo:** `js/modelos/recibo-salario.js`
   
   ```javascript
   function gerarRecibo(empresa, trabalhador, mes) {
     return `
       <div style="padding: 40px; font-family: Arial;">
         <!-- Header com logo -->
         <div style="text-align: center;">
           <img src="${empresa.logo}" style="width: 150px;">
           <h2>RECIBO DE SALÁRIO</h2>
           <p>Mês de referência: ${mes}</p>
         </div>
         
         <!-- Dados do trabalhador -->
         <div style="margin-top: 30px;">
           <p><strong>Nome:</strong> ${trabalhador.nome}</p>
           <p><strong>Função:</strong> ${trabalhador.funcao}</p>
           <p><strong>BI:</strong> ${trabalhador.documento}</p>
         </div>
         
         <!-- Tabela de vencimentos -->
         <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
           <thead>
             <tr style="background: #f0f0f0;">
               <th>Descrição</th>
               <th>Valor (Kz)</th>
             </tr>
           </thead>
           <tbody>
             <tr>
               <td>Salário Base</td>
               <td>${trabalhador.salarioBruto.toLocaleString()}</td>
             </tr>
             <tr>
               <td>Subsídio de Transporte</td>
               <td>15.000</td>
             </tr>
           </tbody>
         </table>
         
         <!-- Total -->
         <div style="margin-top: 20px; text-align: right;">
           <strong>Líquido a Receber: ${trabalhador.salarioLiquido.toLocaleString()} Kz</strong>
         </div>
       </div>
     `;
   }
   ```

2. **Integrar em `admin-controller.js`:**
   
   Encontre a função `renderizarModelo()` (linha ~2500) e adicione:
   
   ```javascript
   if (this.tipoPreview === 'recibo') {
     const script = document.createElement('script');
     script.src = 'js/modelos/recibo-salario.js';
     document.head.appendChild(script);
     
     return gerarRecibo(
       this.fluxoEmpresaSelecionada, 
       this.fluxoClienteSelecionado,
       new Date().toLocaleDateString('pt-AO', { month: 'long', year: 'numeric' })
     );
   }
   ```

3. **Atualizar preview em `admin.html`:**
   
   Linha 2584 (PREVIEW: RECIBO):
   
   ```html
   <template x-if="tipoPreview === 'recibo'">
     <div class="w-full flex items-start justify-center">
       <div class="a4-sheet-container"
            :style="'transform: scale(' + (previewConfig.zoom / 100) + '); transform-origin: top center;'">
         <div id="preview-render-recibo"
              x-html="renderizarModelo()" 
              class="a4-sheet bg-white dark:bg-gray-950 shadow-2xl"
              style="width: 210mm; min-height: 297mm;"></div>
       </div>
     </div>
   </template>
   ```

4. **Testar:**
   - Abra admin.html
   - Clique em "Gerar Documento"
   - Selecione empresa e trabalhador
   - Escolha tipo "Recibo"
   - Veja o preview
   - Gere o PDF

### **Tarefa 2: Implementar NIF** 🔴

**Objetivo:** Documento de identificação fiscal.

**Passos:**

1. **Criar:** `js/modelos/nif-documento.js`
2. **Template:** Semelhante a uma carteira de identidade
3. **Campos:** Nome, NIF, Morada, Data de emissão, Validade
4. **Validação de NIF:** Algoritmo de verificação (pesquisar formato angolano)

### **Tarefa 3: Implementar Atestado** 🔴

**Similar ao Recibo, mas com campos médicos.**

---

## 🐛 Problemas Comuns e Soluções

### **1. "GitHub API rate limit exceeded"**

**Problema:** Muitos requests em 1 hora.

**Solução:**
```javascript
// Em github-api.js, adicione cache:
const cache = {};
function lerArquivo(caminho) {
  if (cache[caminho]) return cache[caminho];
  // ... fetch
  cache[caminho] = resultado;
  return resultado;
}
```

### **2. "A4 não aparece no mobile"**

**Já corrigido!** CSS responsivo em `assets/css/styles.css` (linhas 50-90).

Se não aparecer, verifique:
- `.a4-sheet-container` tem `width: 100vw` no mobile?
- `.a4-sheet` tem `min-height: 141.4vw` no mobile?

### **3. "Dark mode não funciona em X componente"**

**Solução:**
```html
<!-- Sempre use :class com darkMode -->
<div :class="darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'">
  ...
</div>
```

### **4. "Cropper.js não inicializa"**

**Verificar:**
1. Cropper.js CSS está carregado? (linha 21 de admin.html)
2. Script está carregado? (linha 23)
3. Imagem tem `id="cropper-image"`?
4. Função `inicializarCropper()` é chamada?

### **5. "LocalStorage cheio"**

**Solução:**
```javascript
// Limpar cache de imagens antigas
function limparCacheAntigo() {
  Object.keys(localStorage).forEach(key => {
    if (key.startsWith('img_cache_')) {
      const data = JSON.parse(localStorage[key]);
      if (Date.now() - data.timestamp > 7 * 24 * 60 * 60 * 1000) {
        localStorage.removeItem(key);
      }
    }
  });
}
```

---

## 📖 Como Ler o Código

### **admin.html - Estrutura**

```
Linhas 1-35: Head (imports, configs)
Linhas 36-200: Loading overlay
Linhas 201-500: Notificações
Linhas 501-1000: Dashboard (stats, cards)
Linhas 1001-1500: Tabs (empresas, modelos, trabalhadores)
Linhas 1501-1720: Fluxo de geração
Linhas 1720-2800: MODAL PREVIEW (O MAIS IMPORTANTE!)
  - 1720-1900: Toolbar + Menu Hamburger
  - 1956-2402: Painel de Personalização
  - 2406-2542: Área de Preview (A4)
  - 2563-2730: Templates de cada tipo
  - 2798-2899: Footer do modal
Linhas 2900-2990: Modal Cropper BI
Linhas 2995-3500: Modal Nova Empresa
Linhas 3500-3740: Scripts, Swiper, final
```

### **admin-controller.js - Estrutura**

```javascript
function adminApp() {
  return {
    // ESTADO (linhas 8-120)
    darkMode: true,
    empresas: [],
    trabalhadores: [],
    tipoPreview: 'declaracao',
    
    // LIFECYCLE (linhas 121-200)
    init() { ... },
    carregarDados() { ... },
    
    // EMPRESAS (linhas 201-800)
    abrirModalEmpresa() { ... },
    salvarEmpresa() { ... },
    excluirEmpresa() { ... },
    
    // TRABALHADORES (linhas 801-1400)
    abrirModalTrabalhador() { ... },
    salvarTrabalhador() { ... },
    
    // PREVIEW (linhas 1401-2500)
    abrirPreview() { ... },
    renderizarModelo() { ... }, // ← VOCÊ VAI TRABALHAR AQUI
    gerarPDF() { ... },
    
    // PERSONALIZACAO (linhas 2501-3000)
    aplicarPreset() { ... },
    salvarPersonalizacao() { ... },
    
    // CROPPER (linhas 3001-3500)
    inicializarCropper() { ... },
    aplicarCorte() { ... },
    
    // UTILS (linhas 3501-4170)
    formatarData() { ... },
    validarNIF() { ... }
  }
}
```

---

## 🎨 Padrões de Código

### **1. Alpine.js State**

```javascript
// SEMPRE declare variáveis no return do adminApp()
return {
  minhaVariavel: false,
  meuArray: [],
  
  minhaFuncao() {
    // Use this.minhaVariavel
    this.minhaVariavel = true;
  }
}
```

### **2. Responsividade**

```html
<!-- Mobile-first, depois adicione breakpoints -->
<div class="p-4 sm:p-6 lg:p-8">
  <h1 class="text-xl sm:text-2xl lg:text-3xl">Título</h1>
</div>

<!-- Breakpoints Tailwind: -->
<!-- sm: 640px -->
<!-- md: 768px -->
<!-- lg: 1024px -->
<!-- xl: 1280px -->
```

### **3. Dark Mode**

```html
<!-- SEMPRE use :class com ternário -->
<div :class="darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'">
  ...
</div>

<!-- Para borders, shadows, etc também -->
<div class="shadow-lg" 
     :class="darkMode ? 'border-gray-700' : 'border-gray-200'">
```

### **4. Modals**

```html
<!-- Template padrão de modal -->
<div x-show="modalAberto" 
     x-transition
     class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
  <div @click.stop 
       :class="darkMode ? 'bg-gray-800' : 'bg-white'"
       class="rounded-xl p-6 max-w-4xl w-full">
    
    <!-- Header -->
    <div class="flex justify-between items-center mb-4">
      <h3 class="text-2xl font-bold">Título</h3>
      <button @click="modalAberto = false">&times;</button>
    </div>
    
    <!-- Content -->
    <div>...</div>
    
    <!-- Footer -->
    <div class="flex justify-end gap-2 mt-4">
      <button @click="modalAberto = false">Cancelar</button>
      <button @click="salvar()">Salvar</button>
    </div>
  </div>
</div>
```

---

## 🔍 Debugging

### **Console útil:**

```javascript
// Ver estado atual
Alpine.store('adminApp')

// Testar função
const app = Alpine.store('adminApp');
app.renderizarModelo();

// Limpar tudo
localStorage.clear();
location.reload();

// Ver erros de GitHub API
window.githubAPI.teste();
```

### **DevTools:**

1. **Elements:** Inspecione estrutura HTML, classes Tailwind
2. **Console:** Erros JS, warnings
3. **Network:** Requests ao GitHub API
4. **Application:**
   - LocalStorage: Ver sessões, cache
   - Service Workers: Ver se está ativo
5. **Lighthouse:** Testar performance, PWA

---

## 📚 Recursos

### **Documentação Oficial:**

- [Alpine.js](https://alpinejs.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [html2pdf.js](https://ekoopmans.github.io/html2pdf.js/)
- [Cropper.js](https://fengyuanchen.github.io/cropperjs/)
- [GitHub API](https://docs.github.com/en/rest)

### **Documentação do Projeto:**

- `README.md`: Visão geral
- `ARCHITECTURE.md`: Arquitetura detalhada
- `PROGRESS.md`: O que foi feito
- `TODO.md`: O que falta fazer
- Este arquivo (`HANDOFF.md`): Guia de continuação

---

## 🎯 Checklist para Próximo Chat

Antes de começar a trabalhar, certifique-se de:

- [ ] Ler `README.md` completo
- [ ] Ler `PROGRESS.md` para saber o que já está pronto
- [ ] Ler `TODO.md` para ver prioridades
- [ ] Abrir `admin.html` no navegador
- [ ] Testar funcionalidades existentes:
  - [ ] Login
  - [ ] Criar empresa
  - [ ] Criar trabalhador
  - [ ] Gerar declaração (tipo funcionando)
  - [ ] Preview responsivo
  - [ ] Dark mode
  - [ ] Menu hamburger
  - [ ] Editor de fotos (BI)
- [ ] Entender estrutura de pastas
- [ ] Localizar arquivos principais (admin.html, admin-controller.js)
- [ ] Ter token GitHub pronto

---

## 💬 Perguntas Frequentes

### **P: Por que GitHub API como backend?**
**R:** Simplicidade. Não precisa servidor, é gratuito, versionamento automático. Para produção, migre para Firebase ou backend próprio.

### **P: Como adicionar um novo tipo de documento?**
**R:** 
1. Crie `js/modelos/seu-tipo.js` com função `gerarSeuTipo()`
2. Adicione em `renderizarModelo()` no admin-controller.js
3. Crie template HTML no admin.html (seção PREVIEW)
4. Teste e ajuste responsividade

### **P: Como funciona o zoom?**
**R:** CSS `transform: scale()` aplicado ao container A4. O `previewConfig.zoom` controla o valor (30-200%). Controles flutuantes (mobile) permitem +/- 10%.

### **P: Posso usar biblioteca X?**
**R:** Sim, desde que:
- Seja via CDN (não precisa build)
- Não quebre Alpine.js/Tailwind existente
- Seja leve (<100KB)

### **P: Como deploy?**
**R:**
- **Gratuito:** GitHub Pages, Netlify, Vercel
- **Pago:** Hostinger (Angola), AWS S3 + CloudFront
- **PWA:** Funciona offline após primeiro acesso

---

## 🚀 Dicas de Produtividade

1. **Use Live Server** (VS Code extension) para hot reload
2. **Alpine.js DevTools** (extensão Chrome) para debug
3. **Tailwind IntelliSense** (VS Code) para autocomplete
4. **Git branches** para features novas
5. **Commit frequente** com mensagens claras

---

## 🎉 Mensagem Final

Você está pegando um projeto 85% completo, bem documentado e 100% funcional. O trabalho duro de arquitetura, design responsivo e integrações já foi feito.

**Seu objetivo:** Completar os últimos 15% (tipos de documento adicionais).

**Tempo estimado:** 24-34 horas de desenvolvimento focado.

**Quando terminar:** Você terá um sistema profissional, pronto para uso em empresas reais.

**Boa sorte e bom código! 🚀**

---

**Última atualização:** Dezembro 2024  
**Autor do Handoff:** GitHub Copilot  
**Próximo revisor:** [Seu nome aqui]
