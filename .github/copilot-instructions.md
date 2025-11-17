# AI Agent Instructions - Gerador de Declarações e Recibos

## Project Overview

This is a **PWA for generating PDF documents** (Declarations, Receipts, NIF, etc.) for Angolan businesses. It uses **GitHub API as the backend** (no traditional server), Alpine.js for reactivity, and Tailwind CSS for styling. Currently **85% complete** - core infrastructure done, needs document type implementations.

**Critical Constraint:** No build process, no npm, no backend server. Everything runs from static files + GitHub API. This architectural decision drives all implementation patterns below.

## Critical Architecture Patterns

### 1. GitHub-as-Backend Pattern
**DO NOT** write code assuming traditional REST APIs. All data persistence goes through `js/github-api.js`:

```javascript
// ✅ Correct: Use GitHub API wrapper
const result = await githubAPI.lerJSON('data/empresas.json');
const empresas = result.data; // returns { data: [...], sha: "..." }

await githubAPI.salvarJSON('data/empresas.json', empresas, 'Update companies');

// For images: Upload returns GitHub raw URL
const logoUrl = await githubAPI.uploadImagem(base64Data, 'assets/empresas/123/logo.png');
// Returns: https://raw.githubusercontent.com/owner/repo/master/assets/empresas/123/logo.png

// ❌ Wrong: Traditional fetch/POST
fetch('/api/empresas', { method: 'POST', body: data });
```

**Critical Details:**
- **Rate limits:** 5000 req/hr authenticated. Cache aggressively in LocalStorage.
- **Configuration:** Set in `js/config.js` via `CONFIG.github.owner` and `CONFIG.github.repo`
- **Token:** User's Personal Access Token (scope: `repo`) stored in LocalStorage, set via `githubAPI.setToken()`
- **Branch:** Defaults to `master`, configurable via `CONFIG.github.branch`

### 2. Alpine.js State Management
All app state lives in the `adminApp()` function in `js/admin-controller.js` (5330 lines). When adding features:

```javascript
// ✅ Correct: Add to adminApp() return object (line 7)
function adminApp() {
  return {
    minhaNovaVariavel: false,
    
    minhaNovaFuncao() {
      this.minhaNovaVariavel = true; // Use 'this.' to access state
    }
  }
}

// ❌ Wrong: Global variables or separate Alpine components
let minhaVariavel = false;
```

**No separation of concerns** - everything is in one massive Alpine component. This is intentional for simplicity.

**Accessing from HTML:**
```html
<!-- In admin.html, bound via x-data="adminApp()" -->
<button @click="minhaNovaFuncao()">Click</button>
<div x-show="minhaNovaVariavel">Visible when true</div>

<!-- From onclick attributes (for inline handlers) -->
<button onclick="adminApp().cropperFoto1?.zoom(0.1)">Zoom+</button>
```

### 3. Modal-Heavy UI Pattern
The app uses **fullscreen modals** for all major workflows:
- `modalFluxoGeracao`: Document generation wizard (4 steps)
- `modalPreviewModelo`: Document preview + PDF generation
- `modalCropperBI`: Photo editor for ID cards
- `modalNovaEmpresa`: Company CRUD

**Key pattern:** Modals are `x-show` + `x-transition`, NOT conditionally rendered. Use `@click.stop` on modal content to prevent closing when clicking inside.

### 4. Responsive A4 Document Rendering
**CRITICAL:** The A4 sheet MUST scale correctly on mobile. Use this exact pattern:

```css
/* Mobile: Scale to viewport */
@media (max-width: 768px) {
  .a4-sheet-container {
    width: 100vw;
    max-width: calc(100vw - 16px);
  }
  
  .a4-sheet {
    width: 100%;
    min-height: 141.4vw; /* A4 ratio: 297/210 = 1.414 */
  }
}

/* Desktop: Real size */
@media (min-width: 1024px) {
  .a4-sheet {
    width: 210mm;
    min-height: 297mm;
  }
}
```

**Apply zoom via transform:** `transform: scale(${zoom / 100})` on the container, NOT the sheet itself.

## Document Generation Workflow

### Adding New Document Types (Primary TODO)
The system currently has **only Declaração working**. To add Recibo/Combo/NIF/Atestado:

1. **Create model file** `js/modelos/[tipo]-[nome].js`:
   ```javascript
   const Modelo[Tipo] = {
     renderizar(empresa, cliente, config = {}) {
       return `<div style="width: 210mm; height: 297mm; padding: 15mm;">
         <!-- Your HTML with ${empresa.nome}, ${cliente.nome} etc -->
       </div>`;
     }
   };
   ```

2. **Register in renderizarModelo()** (`admin-controller.js` ~line 2500):
   ```javascript
   renderizarModelo() {
     if (this.tipoPreview === 'recibo') {
       return ModeloRecibo.renderizar(
         this.fluxoEmpresaSelecionada,
         this.fluxoClienteSelecionado,
         this.previewConfig
       );
     }
   }
   ```

3. **Add preview template** in `admin.html` (lines 2563-2730):
   ```html
   <template x-if="tipoPreview === 'recibo'">
     <div class="a4-sheet-container">
       <div x-html="renderizarModelo()" class="a4-sheet bg-white"></div>
     </div>
   </template>
   ```

**Reference:** `js/modelos/declaracao-executivo.js` is the complete working example.

## Critical Conventions

### Dark Mode
**ALWAYS** use ternary `:class` bindings with `darkMode` state:

```html
<!-- ✅ Correct -->
<div :class="darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'">

<!-- ❌ Wrong: Static dark: classes don't respect toggle -->
<div class="bg-white dark:bg-gray-800">
```

### Touch Optimization
All interactive elements MUST meet **44-48px minimum** tap targets:

```html
<!-- ✅ Correct -->
<button class="h-12 px-4"> <!-- h-12 = 48px -->

<!-- ❌ Wrong -->
<button class="h-8 px-2"> <!-- h-8 = 32px, too small -->
```

### Responsive Breakpoints
Follow this **mobile-first** progression:
- `<640px`: Mobile (single column, bottom drawers, hamburger menus)
- `640-768px`: Large mobile
- `768-1024px`: Tablet (2 columns, sidebars start appearing)
- `≥1024px`: Desktop (multi-column, full sidebars, no hamburgers)

**Pattern:** Write base mobile styles, then `sm:`, `md:`, `lg:` progressively enhance.

## File Navigation

### Where to Find Things
- **Main app logic:** `js/admin-controller.js` (5330 lines, search by function name)
  - Line 7: `function adminApp()` - Entry point for all state/methods
  - Line 142: `tipoPreview` state - Controls which document type is active
  - Line 2663: `renderizarModelo()` - Document rendering dispatcher
- **UI structure:** `admin.html` (3740 lines):
  - Lines 1720-2800: Modal Preview (critical for document rendering)
  - Lines 2995-3300: Modal Nova Empresa
  - Lines 1501-1720: Fluxo de Geração wizard
  - Line 2563: Declaração preview template (working example)
- **Data models:** `data/*.json` (on GitHub, use `github-api.js` to read/write)
  - `empresas.json`: Company data with logos/stamps/colors
  - `trabalhadores.json`: Worker/client data with salaries
  - `users.json`: Authentication and permissions
- **Document templates:** `js/modelos/` (only `declaracao-executivo.js` exists, create others)

### When to Edit What
- **Adding UI:** `admin.html` + update `adminApp()` state in `admin-controller.js`
- **Adding data fields:** Update JSON schema + GitHub files + form validation
- **Adding document types:** New file in `js/modelos/` + register in `renderizarModelo()`
- **Changing styles:** Inline Tailwind classes (90% of cases) or `assets/css/styles.css` (A4-specific)

## Common Pitfalls

1. **Don't create separate Alpine components** - merge into `adminApp()` return object
2. **Don't use `v-if`** - this is Alpine.js, use `x-if` or `x-show`
3. **Don't reference Vue.js patterns** - Alpine is similar but simpler (no computed, no watchers)
4. **Don't commit Personal Access Tokens** - they're in LocalStorage only
5. **Don't modify `CONFIG.github`** without updating user's GitHub username/repo
6. **Don't use async/await in Alpine `x-` attributes** - wrap in separate functions

## Testing Workflow

**No automated tests exist.** Manual testing checklist:

1. **Login:** Use valid GitHub PAT → Should redirect to `admin.html`
2. **Create empresa:** Upload logo → Verify it appears in GitHub `assets/logos/`
3. **Generate PDF:** Select empresa + trabalhador + tipo → Preview should show A4 correctly on mobile
4. **Dark mode:** Toggle → All components should switch (check modals, cards, forms)
5. **Offline:** Disable network → App should still load from Service Worker cache

**Debug tools:**
```javascript
// In browser console:
Alpine.store('adminApp')      // View current state
localStorage.clear()          // Reset everything
```

## Performance Notes

- **Image caching:** Logos/carimbos cached in LocalStorage as base64 for 7 days
- **Debouncing:** Search inputs have 300ms delay (see `cliente-manager.js`)
- **Lazy loading:** Document models loaded via `<script>` tag injection only when needed
- **PDF generation:** Uses html2pdf.js with scale=3 for quality → Can be slow for complex documents

## Critical Dependencies (via CDN)

- **Alpine.js 3.13.3:** Reactive framework (DO NOT mix with Vue/React)
- **Tailwind CSS 3.x:** Utility-first CSS (use CDN classes, no build step)
- **html2pdf.js 0.10.1:** PDF generation (configure in `pdf-generator.js`)
- **Cropper.js 1.6.1:** Image editor (modal at lines 2904-2990)
- **Swiper.js 11.x:** Carousels (dashboard stats)

**No npm/build process** - everything is CDN-linked. Keep it that way for simplicity.

## Data Schema Essentials

### Empresa (Company)
```json
{
  "id": "empresa_1763340238250",
  "nome": "EMFC Consulting, S.A.",
  "nif": "5480023446",
  "endereco": {
    "rua": "Avenida 4 de Fevereiro",
    "edificio": "Edifício Summit Tower",
    "andar": "5.º andar",
    "sala": "Sala 502",
    "bairro": "Bairro Kinaxixe",
    "municipio": "Luanda",
    "provincia": "Luanda",
    "pais": "Angola"
  },
  "logo": "https://raw.githubusercontent.com/owner/repo/master/assets/empresas/123/logo.png",
  "carimbo": "https://raw.githubusercontent.com/owner/repo/master/assets/empresas/123/carimbo.png",
  "corPrimaria": "#1e40af",
  "corSecundaria": "#64748b",
  "contador": 0
}
```

### Trabalhador (Worker/Client)
```json
{
  "id": "TRAB-1763344070626-456",
  "nome": "Gaspar Francisco",
  "documento": "123456789BA",
  "tipo_documento": "BI",
  "nif": "123456789",
  "data_nascimento": "2000-06-18",
  "nacionalidade": "Angolana",
  "funcao": "Contabilista",
  "departamento": "Financeiro",
  "data_admissao": "2023-09-09",
  "tipo_contrato": "Contrato a termo incerto",
  "salario_base": "200000",
  "salario_liquido": "180000",
  "moeda": "AKZ",
  "ativo": true
}
```

## Next Steps (Priority Order)

1. **Implement Recibo de Salário** (~8h) - Template with salary breakdown table
2. **Implement NIF document** (~6h) - Tax ID card layout
3. **Implement Atestado** (~6h) - Medical/professional certificate
4. **Implement Combo** (~4h) - Multi-page PDF (Declaração + Recibos)
5. **Cross-browser testing** - Safari, Firefox, Edge
6. **Consider Firebase migration** - GitHub API rate limits may become issue at scale

## Questions to Ask Before Coding

- Does this need to persist? → Use `github-api.js`
- Is this user-facing? → Add to `adminApp()` state
- Is this a new document type? → Follow the 3-step pattern above
- Does this work on mobile? → Test at 375px viewport
- Does dark mode work? → Use `:class` ternary pattern
- Are touch targets big enough? → 44px minimum

---

**Key Insight:** This project trades "best practices" (separation of concerns, build tools, testing) for **simplicity and portability**. The entire app runs from static files + GitHub API. When adding features, maintain this constraint.
