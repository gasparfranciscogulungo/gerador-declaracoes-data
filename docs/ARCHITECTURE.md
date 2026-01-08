# 🏗️ Arquitetura do Sistema

## Visão Geral

O Gerador de PDF é uma **PWA (Progressive Web App)** construída com arquitetura **modular e orientada a componentes**, utilizando **Alpine.js** para reatividade e **GitHub API** como backend.

---

## Stack Tecnológica

| Camada | Tecnologia | Versão | Função |
|--------|-----------|---------|---------|
| **Frontend** | HTML5 + Tailwind CSS | 3.x | Interface e estilos |
| **Reatividade** | Alpine.js | 3.13.3 | State management |
| **PDF** | html2pdf.js | 0.10.1 | Geração de PDFs |
| **Imagens** | Cropper.js | 1.6.1 | Editor de fotos |
| **Carrossel** | Swiper.js | 11.x | Componentes slider |
| **Backend** | GitHub API | REST v3 | Armazenamento de dados |
| **Cache** | LocalStorage | - | Persistência local |
| **PWA** | Service Worker | - | Offline-first |

---

## Arquitetura de Dados

### Fluxo de Dados Principal

```
┌─────────────────────────────────────────────────────────────┐
│                     CAMADA DE APRESENTAÇÃO                   │
│  (admin.html - Alpine.js Components)                         │
└───────────────────┬─────────────────────────────────────────┘
                    │
                    ↓
┌─────────────────────────────────────────────────────────────┐
│                  CAMADA DE CONTROLE                          │
│  admin-controller.js (4170 linhas)                           │
│  - State management (darkMode, modals, forms)                │
│  - Event handlers                                            │
│  - Orquestração de módulos                                   │
└───────────────────┬─────────────────────────────────────────┘
                    │
        ┌───────────┼───────────┐
        ↓           ↓           ↓
┌───────────┐ ┌───────────┐ ┌────────────┐
│  Auth     │ │  GitHub   │ │  PDF       │
│  Manager  │ │  API      │ │  Generator │
└───────────┘ └───────────┘ └────────────┘
        ↓           ↓           ↓
┌─────────────────────────────────────────────────────────────┐
│                    CAMADA DE DADOS                           │
│  - LocalStorage (cache de imagens, sessões)                  │
│  - GitHub Repository (empresas.json, trabalhadores.json)     │
└─────────────────────────────────────────────────────────────┘
```

---

## Módulos Principais

### 1. **admin-controller.js** (Orquestrador)

**Responsabilidades:**
- Inicializa Alpine.js app
- Gerencia estado global (empresas, modelos, usuário)
- Controla modals e tabs
- Orquestra fluxos de geração de documento

**Estado Principal:**
```javascript
{
  usuario: null,
  empresas: [],
  modelos: [],
  trabalhadores: [],
  darkMode: true,
  activeTab: 'empresas',
  
  // Modals
  modalNovaEmpresa: false,
  modalPreviewModelo: false,
  modalCropperBI: false,
  menuPreviewOpen: false,  // Hamburger menu
  
  // Preview
  tipoPreview: 'declaracao',
  previewConfig: {
    fontFamily: 'Arial',
    fontSize: 12,
    zoom: 55,
    // ... mais configurações
  }
}
```

### 2. **auth-manager.js** (Autenticação)

**Funcionalidades:**
- Login/Logout via GitHub Personal Access Token
- Validação de token
- Gestão de sessões (LocalStorage)
- Verificação de permissões

**Fluxo de Autenticação:**
```
Usuario insere token → auth-manager valida com GitHub API 
→ Salva sessão → Carrega dados do usuário (users.json)
→ Redireciona para admin.html
```

### 3. **github-api.js** (Backend Integration)

**Operações:**
- `lerArquivo(caminho)` - GET de arquivo JSON/imagem
- `salvarArquivo(caminho, conteudo, mensagem)` - Commit de alterações
- `uploadImagem(base64, caminho)` - Upload de logos/carimbos
- `listarArquivos(pasta)` - Listagem de diretório

**Limitações:**
- Rate limit: 5000 requests/hora (autenticado)
- Tamanho máximo de arquivo: 100MB (API), mas prático ~5MB
- Suporta apenas operações síncronas (não batch)

### 4. **cliente-manager.js** (Gestão de Trabalhadores)

**CRUD Completo:**
- Criar trabalhador
- Editar trabalhador
- Excluir trabalhador
- Buscar por nome/documento
- Calcular salário líquido automaticamente

### 5. **pdf-generator.js** (Geração de PDF)

**Pipeline:**
```
HTML do preview → html2pdf.js config → Canvas rendering 
→ jsPDF → Blob → Download
```

**Configurações:**
```javascript
{
  margin: 0,
  filename: 'documento.pdf',
  image: { type: 'jpeg', quality: 0.98 },
  html2canvas: { scale: 3, useCORS: true },
  jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
}
```

---

## Sistema de Preview Responsivo

### Modal Preview - Estrutura

```
┌─────────────────────────────────────────────────────────────┐
│  TOOLBAR (Hamburger Menu + Personalizar + Fechar)           │
├─────────────────────────────────────────────────────────────┤
│  ┌──────────┐                                                │
│  │ MENU     │  ← Slide-in (mobile) / Dropdown (desktop)      │
│  │ - Decl   │                                                │
│  │ - Recibo │                                                │
│  │ - Combo  │                                                │
│  │ - NIF    │                                                │
│  │ - Atest  │                                                │
│  │ - BI     │                                                │
│  └──────────┘                                                │
│                                                               │
│  ┌───────────────────────────────────────────────────────┐  │
│  │         AREA DE PREVIEW (Scroll + Zoom)               │  │
│  │  ┌─────────────────────────────────────────────────┐  │  │
│  │  │                                                   │  │  │
│  │  │         FOLHA A4 (210mm x 297mm)                 │  │  │
│  │  │         - Responsive scaling                     │  │  │
│  │  │         - Box-shadow                             │  │  │
│  │  │         - Border-radius                          │  │  │
│  │  │                                                   │  │  │
│  │  └─────────────────────────────────────────────────┘  │  │
│  │                                                         │  │
│  │  [Zoom +] [Reset] [Zoom -] [%]  ← Floating controls  │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                               │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  PAINEL PERSONALIZAÇÃO (Bottom Drawer Mobile)         │  │
│  │  - 6 Presets                                           │  │
│  │  - 6 Slots customizáveis                               │  │
│  │  - Controles: Fonte, Tamanho, Cores, Alinhamento      │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                               │
│  FOOTER (Gerar PDF / Cancelar)                               │
└─────────────────────────────────────────────────────────────┘
```

### CSS Responsivo A4

**Problema Original:** Folha A4 não aparecia corretamente no mobile.

**Solução Implementada:**

```css
/* Mobile: Escala para 100vw - 16px */
@media (max-width: 768px) {
  .a4-sheet-container {
    width: 100vw;
    max-width: calc(100vw - 16px);
    padding: 8px;
  }
  
  .a4-sheet {
    width: 100%;
    min-height: 141.4vw; /* Ratio A4: 297/210 = 1.414 */
  }
}

/* Desktop: Tamanho real */
@media (min-width: 1024px) {
  .a4-sheet {
    width: 210mm;
    min-height: 297mm;
  }
}
```

---

## Sistema de Personalização

### Presets (6 estilos pré-definidos)

1. **Formal** - Arial, texto preto, destaque azul
2. **Moderno** - Inter, espaçamento amplo, cores vibrantes
3. **Elegante** - Georgia, serif clássico, tons burgundy
4. **Corporativo** - Helvetica, limpo, azul marinho
5. **Minimalista** - Sans-serif, espaços brancos, cinza escuro
6. **Clássico** - Times, tradicional, preto sólido

### Slots (6 slots customizáveis)

Cada usuário pode salvar até 6 personalizações customizadas em `data/personalizacoes.json`.

**Estrutura de um Slot:**
```json
{
  "slot1": {
    "nome": "Minha Personalização",
    "config": {
      "fontFamily": "Arial",
      "fontSize": 12,
      "corTexto": "#000000",
      "corDestaque": "#1e40af"
    }
  }
}
```

---

## Editor de Fotos (BI)

### Cropper.js Integration

**Modal Cropper:**
- Viewport: Área de corte visível
- Container: Canvas de edição
- Controles: Rotacionar (-90°, +90°), Reset

**Fluxo:**
```
Usuario seleciona foto → Input file → FileReader base64 
→ Cropper init → Usuario ajusta → Aplicar corte 
→ Canvas to Blob → Preview atualizado
```

**Touch Gestures:**
- **Pinch**: Zoom in/out
- **Drag**: Pan/mover imagem
- **Two-finger rotate**: Rotação livre
- **Tap**: Selecionar área

---

## Gestão de Empresas

### Upload de Logo/Carimbo

```
Usuario seleciona imagem → Validação (tipo, tamanho) 
→ Resize/compress (opcional) → Base64 encode 
→ GitHub API upload → URL retornado → Salvo em empresas.json 
→ Cache local → Preview atualizado
```

### Cache de Imagens

**ImageCacheManager:**
- Salva base64 no LocalStorage
- Chave: `img_cache_${url_hash}`
- Expiração: 7 dias
- Limpeza automática de cache antigo

---

## PWA e Offline-First

### Service Worker (sw.js)

**Estratégias de Cache:**
```javascript
// Cache-first para assets estáticos
self.addEventListener('fetch', (event) => {
  if (event.request.url.includes('/assets/')) {
    return caches.match(event.request)
           .then(cached => cached || fetch(event.request));
  }
});

// Network-first para dados JSON
if (event.request.url.includes('/data/')) {
  return fetch(event.request)
         .catch(() => caches.match(event.request));
}
```

### Manifest.json

```json
{
  "name": "Gerador de PDF",
  "short_name": "PDFGen",
  "start_url": "/admin.html",
  "display": "standalone",
  "background_color": "#1e40af",
  "theme_color": "#1e40af",
  "icons": [...]
}
```

---

## Segurança

### Autenticação

- **Token Storage**: LocalStorage com expiração
- **Validação**: Cada request valida token
- **Logout automático**: Sessão expira após inatividade

### GitHub API

- **Personal Access Token**: Armazenado localmente (não no GitHub)
- **Scopes necessários**: `repo` (acesso total ao repositório)
- **Rate Limiting**: 5000 req/hora

### XSS Protection

- **Alpine.js**: Escapa HTML automaticamente
- **x-html**: Usado apenas para preview confiável
- **CSP**: Content Security Policy configurado

---

## Performance

### Otimizações

1. **Lazy Loading**: Módulos JS carregados sob demanda
2. **Image Caching**: LocalStorage para assets pesados
3. **Debouncing**: Busca de trabalhadores com delay 300ms
4. **Virtual Scrolling**: Listas grandes (futuro)
5. **Code Splitting**: Modelos carregados dinamicamente

### Métricas Alvo

- **First Contentful Paint**: < 1.5s
- **Time to Interactive**: < 3s
- **Lighthouse Score**: > 90

---

## Limitações Conhecidas

1. **GitHub API Rate Limit**: 5000 req/hora (pode ser problema com muitos usuários)
2. **LocalStorage**: Limite de ~5-10MB (varia por browser)
3. **PDF Generation**: Pesado para documentos muito grandes (>10 páginas)
4. **Mobile Safari**: Algumas limitações com Service Worker
5. **Cropper.js**: Não suporta multi-touch em alguns dispositivos antigos

---

## Próximos Passos de Arquitetura

1. **Migrar para IndexedDB**: Substituir LocalStorage para dados maiores
2. **Implementar WebSockets**: Sincronização em tempo real (se múltiplos usuários)
3. **Service Worker Avançado**: Background sync, push notifications
4. **Web Workers**: Processar PDFs em background thread
5. **Firebase Integration**: Alternativa ao GitHub API (mais escalável)

---

**Última atualização:** Dezembro 2024  
**Versão da arquitetura:** 2.0
