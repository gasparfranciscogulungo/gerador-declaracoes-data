# 🎨 Ferramentas de Edição - Photo Editor, PDF Editor, Doc Editor

## 📋 Visão Geral do Projeto

### 🎯 Objetivo
Criar uma **seção "Ferramentas"** integrada ao painel Admin e User que oferece editores web leves para substituir softwares pesados como Adobe Photoshop, Acrobat e Word em tarefas simples do dia a dia.

### 💡 Problema Identificado
- **Uso excessivo de recursos:** Abrir programas pesados (Photoshop, Acrobat, Word) para tarefas básicas
- **Dependência de VM:** Usuários Linux precisam de máquina virtual para rodar softwares Adobe
- **Múltiplas ferramentas:** Trocar entre vários programas para editar foto, gerar PDF, editar documento
- **Licenças caras:** Adobe Creative Cloud custa $54.99/mês só para edições simples

### ✅ Solução Proposta
Sistema de ferramentas integrado ao Gerador de PDF com 3 editores web:
1. **📸 Photo Editor** (Prioridade 1)
2. **📄 PDF Editor** (Prioridade 2)
3. **📝 Doc Editor** (Prioridade 3)

---

## 🏗️ Arquitetura do Sistema

### Estrutura de Navegação
```
PAINEL ADMIN/USER
├── 📊 Dashboard
├── 🏢 Empresas
├── 👥 Trabalhadores
├── 📄 Gerar Documentos
└── 🛠️ FERRAMENTAS ←────── NOVA SEÇÃO
    ├── 📸 Editor de Fotos
    ├── 📄 Editor de PDF
    └── 📝 Editor de Documentos
```

### Estrutura de Arquivos
```
GeradorDePDF/
├── admin.html
├── user-panel.html
│
├── js/
│   ├── ferramentas/
│   │   ├── photo-editor.js         # Editor de fotos principal
│   │   ├── background-remover.js   # Remoção de fundo IA
│   │   ├── image-compressor.js     # Compressão inteligente
│   │   ├── image-filters.js        # Filtros e ajustes
│   │   ├── export-manager.js       # Export PDF/PNG/JPG/WEBP
│   │   ├── pdf-editor.js           # Editor de PDF (futuro)
│   │   └── doc-editor.js           # Editor de documentos (futuro)
│   │
│   └── admin-controller.js
│
├── assets/
│   └── ferramentas/
│       ├── temp/                   # Arquivos temporários
│       └── presets/                # Presets de filtros
│
└── data/
    └── ferramentas-config.json     # Configurações das ferramentas
```

---

## 📸 FASE 1: Photo Editor (Prioridade Máxima)

### 🎯 Funcionalidades Core (MVP - 2-3 dias)

#### 1. **Upload de Imagem** ✅
- Arrastar e soltar (drag & drop)
- Click para selecionar arquivo
- Colar da área de transferência (Ctrl+V)
- Captura da webcam
- Formatos: JPG, PNG, WEBP, BMP, GIF

#### 2. **Cortar/Crop** ✅
- Usar Cropper.js (já implementado no projeto)
- Proporções predefinidas: Livre, 1:1, 4:3, 16:9, A4
- Ajuste manual com drag
- Zoom in/out
- Rotação 90°, 180°, 270°
- Flip horizontal/vertical

#### 3. **Remover Fundo** 🤖 AI
**Opção Escolhida:** Lib offline (@imgly/background-removal)
- Remove fundo automaticamente usando IA
- Roda 100% no navegador (sem API externa)
- Preview antes/depois com slider
- Opções de refinamento de bordas
- Trocar fundo por:
  - Transparente (PNG)
  - Cor sólida customizável
  - Gradiente
  - Imagem de fundo

**Alternativa:** remove.bg API (fallback se offline falhar)
- 50 imagens grátis/mês
- Maior precisão em fotos complexas

#### 4. **Redimensionar** 📐
- Width e Height customizados
- Manter proporção (toggle)
- Presets comuns:
  - 🖼️ Thumbnail: 150x150px
  - 👤 Avatar: 512x512px
  - 📱 Instagram: 1080x1080px
  - 🖥️ HD: 1920x1080px
  - 📄 A4: 2480x3508px (300 DPI)

#### 5. **Comprimir Imagem** 🗜️
- Usar `browser-image-compression` (já no projeto)
- Controle de qualidade: 25%, 50%, 75%, 90%, 100%
- Mostrar peso antes/depois
- Modos:
  - 📦 Máxima compressão (web)
  - ⚖️ Balanceado
  - 🎨 Qualidade máxima (impressão)

#### 6. **Exportar** 💾
- Formatos: PNG, JPG, WEBP, PDF
- PDF: Múltiplas fotos em páginas
- Tamanhos de página: A4, Carta, Ofício, Custom
- Nome do arquivo customizável
- Download direto
- Salvar no GitHub (opcional)

---

### 🎨 Funcionalidades Avançadas (Fase 2 - 3-4 dias)

#### 7. **Filtros Fotográficos** 🌈
```javascript
// Filtros básicos
- Preto e Branco
- Sépia
- Vintage
- Negativo
- Polaroid

// Ajustes manuais
- Brilho: -100 a +100
- Contraste: -100 a +100
- Saturação: -100 a +100
- Temperatura: Frio ↔ Quente
- Exposição: -2 a +2 EV
- Sombras/Realces
- Nitidez
- Desfoque
- Vinheta
```

#### 8. **Texto e Anotações** 📝
- Adicionar textos
- Fontes: Arial, Roboto, Open Sans, Montserrat
- Tamanhos: 8px a 144px
- Cores customizáveis
- Stroke (contorno)
- Sombra
- Rotação do texto
- Alinhamento: Esquerda, Centro, Direita

#### 9. **Desenho e Marcações** 🖌️
- Pincel livre
- Formas: Retângulo, Círculo, Linha, Seta
- Espessura: 1px a 20px
- Cores
- Borracha
- Desfazer/Refazer (Ctrl+Z / Ctrl+Y)
- Highlights/marcadores

#### 10. **Stickers e Overlays** 🎭
- Emojis
- Ícones Font Awesome
- Carimbos customizados
- Logotipos
- Assinaturas

---

### 🚀 Funcionalidades Premium (Fase 3 - 4-5 dias)

#### 11. **Inteligência Artificial** 🤖
- **Enhance:** Melhorar qualidade automaticamente
- **Upscale:** Aumentar resolução com IA (2x, 4x)
- **Denoiser:** Remover ruído de fotos
- **Face Detection:** Auto-crop em rostos
- **Smart Crop:** Detectar objeto principal
- **Color Correction:** Ajuste automático de cores

#### 12. **Processamento em Lote** 📦
- Upload de múltiplas fotos
- Aplicar mesmas edições em todas
- Redimensionar em lote
- Comprimir em lote
- Adicionar marca d'água em todas
- Export em ZIP

#### 13. **Histórico e Camadas** 🗂️
- Sistema de desfazer ilimitado
- Timeline de edições
- Camadas (layers)
- Máscaras
- Blend modes

---

## 🎨 Design da Interface (UI/UX)

### Layout Desktop (≥1024px)
```
┌──────────────────────────────────────────────────────────────┐
│ 🏠 Admin > Ferramentas > Editor de Fotos                     │
├──────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────┐  ┌─────────────────────────────────┐      │
│  │  FERRAMENTAS │  │                                  │      │
│  │              │  │                                  │      │
│  │ 📁 Abrir     │  │      CANVAS DE EDIÇÃO           │      │
│  │ 💾 Salvar    │  │      (Preview da Foto)          │      │
│  │              │  │                                  │      │
│  ├──────────────┤  │                                  │      │
│  │              │  │                                  │      │
│  │ ✂️ Cortar    │  └─────────────────────────────────┘      │
│  │ 🎭 Rm Fundo  │                                            │
│  │ 📐 Tamanho   │  ┌─────────────────────────────────┐      │
│  │ 🔄 Rotação   │  │ PROPRIEDADES                    │      │
│  │ 🗜️ Comprimir │  │                                  │      │
│  │ 🎨 Filtros   │  │ 📏 Tamanho: 1920x1080px         │      │
│  │ 📝 Texto     │  │ 💾 Peso: 2.5 MB → 850 KB        │      │
│  │ 🖌️ Desenhar  │  │ 🎨 Formato: PNG                 │      │
│  │              │  │                                  │      │
│  │ ⬅️ Desfazer  │  │ [Exportar PNG] [Exportar JPG]   │      │
│  │ ➡️ Refazer   │  │ [Gerar PDF] [Salvar GitHub]     │      │
│  │              │  │                                  │      │
│  └──────────────┘  └─────────────────────────────────┘      │
│                                                               │
└──────────────────────────────────────────────────────────────┘
```

### Layout Mobile (≤768px)
```
┌─────────────────────────┐
│ ← Editor de Fotos    ⋮  │
├─────────────────────────┤
│                         │
│                         │
│   CANVAS DE EDIÇÃO      │
│   (Tela cheia)          │
│                         │
│                         │
├─────────────────────────┤
│ [✂️] [🎭] [🔄] [🎨] [💾] │ ← Toolbar fixa
└─────────────────────────┘
      ↓ Swipe up
┌─────────────────────────┐
│ 🛠️ OPÇÕES               │ ← Drawer deslizante
│                         │
│ ✂️ Cortar               │
│ 🎭 Remover Fundo        │
│ ...                     │
└─────────────────────────┘
```

---

## 🛠️ Stack Tecnológico

### Bibliotecas JavaScript

#### **Edição de Imagem**
```javascript
// Cropping
Cropper.js v1.6.1 ✅ (já implementado)

// Remoção de fundo
@imgly/background-removal
// ~30MB, mas carrega lazy (só quando usuário usar)
// 100% offline, sem API keys

// Filtros e manipulação
CamanJS ou Fabric.js
// CamanJS: Mais leve, focado em filtros
// Fabric.js: Mais completo, suporta camadas

// Compressão
browser-image-compression ✅ (já implementado)
```

#### **Export e Conversão**
```javascript
// PDF
html2pdf.js ✅ (já implementado)
jsPDF (alternativa mais leve)

// Canvas para Blob
HTMLCanvasElement.toBlob()
```

#### **UI/UX**
```javascript
// Já implementados no projeto:
Alpine.js 3.13.3 ✅
Tailwind CSS 3.x ✅
Font Awesome Icons ✅
```

### Dependências CDN (sem build)
```html
<!-- Remover fundo (carregar sob demanda) -->
<script src="https://cdn.jsdelivr.net/npm/@imgly/background-removal"></script>

<!-- Filtros de imagem -->
<script src="https://cdn.jsdelivr.net/npm/camanjs/dist/caman.full.min.js"></script>

<!-- Canvas avançado (se escolher Fabric.js) -->
<script src="https://cdn.jsdelivr.net/npm/fabric"></script>
```

---

## 📊 Fluxo de Uso (User Flow)

### Cenário 1: Remover fundo de foto para BI
```
1. Usuário clica em "Ferramentas" → "Editor de Fotos"
2. Upload da foto de perfil (drag & drop)
3. Preview aparece no canvas
4. Clica em "🎭 Remover Fundo"
   → Loading 3-5 segundos (processamento IA)
   → Preview antes/depois com slider
5. Ajusta refinamento de bordas (opcional)
6. Escolhe fundo transparente
7. Clica em "💾 Exportar PNG"
8. Download automático: "foto-sem-fundo.png"
```

### Cenário 2: Redimensionar e comprimir lote de fotos
```
1. Abre "Editor de Fotos"
2. Upload de 10 fotos (múltipla seleção)
3. Clica em "📦 Processar em Lote"
4. Define:
   - Novo tamanho: 1920x1080px
   - Qualidade: 75%
   - Formato: JPG
5. Clica em "Aplicar a Todas"
   → Barra de progresso (1/10, 2/10...)
6. Clica em "💾 Download ZIP"
7. Recebe "fotos-comprimidas.zip"
```

### Cenário 3: Criar PDF com múltiplas fotos
```
1. Upload de 3 fotos de documentos
2. Para cada foto:
   - Corta bordas
   - Ajusta brilho/contraste
   - Aplica filtro B&W
3. Clica em "📄 Gerar PDF"
4. Escolhe:
   - Tamanho: A4
   - Orientação: Retrato
   - Fotos por página: 1
5. Preview do PDF
6. Download: "documentos.pdf"
```

---

## 🎯 Casos de Uso Reais

### Para o Projeto Gerador de PDF
1. **Editar foto antes do BI:** Remover fundo, ajustar tamanho
2. **Preparar logotipos:** Comprimir, remover fundo, converter formato
3. **Editar carimbos:** Aumentar contraste, remover imperfeições
4. **Criar documentos visuais:** Combinar fotos em PDF

### Para Usuários Finais
1. **Substituir Photoshop:** Edições rápidas sem instalar nada
2. **Documentos profissionais:** Fotos de perfil sem fundo
3. **Reduzir tamanho de arquivos:** Antes de enviar por email
4. **Converter formatos:** JPG ↔ PNG ↔ PDF ↔ WEBP

---

## 📈 Métricas de Sucesso

### Performance
- ⏱️ **Tempo de carregamento:** < 2s (lazy load libs)
- 🚀 **Processamento IA:** < 5s (remover fundo)
- 💾 **Compressão:** 60-80% redução de peso
- 📱 **Mobile:** Funcional em telas ≥375px

### Usabilidade
- 👤 **Usuários ativos:** ≥50% usam ferramentas
- ⭐ **Satisfação:** 4.5+ estrelas
- 🔄 **Retenção:** Uso recorrente semanal
- 📊 **Funcionalidade mais usada:** Remover fundo + Comprimir

### Técnico
- 🐛 **Bugs críticos:** 0
- ✅ **Compatibilidade:** Chrome, Firefox, Safari, Edge
- 📦 **Bundle size:** < 500KB (inicial, sem libs pesadas)
- 🔒 **Segurança:** Processamento local (não envia fotos para servidor)

---

## 🗓️ Roadmap de Implementação

### **Sprint 1: MVP Photo Editor (3-5 dias)**
- [ ] Criar aba "Ferramentas" no menu admin/user
- [ ] Upload de imagem (drag & drop + click + paste)
- [ ] Preview no canvas
- [ ] Integrar Cropper.js (reuso do código BI)
- [ ] Redimensionar imagem
- [ ] Comprimir imagem (reuso do código existente)
- [ ] Exportar PNG/JPG/WEBP
- [ ] UI responsiva (mobile + desktop)

### **Sprint 2: Remover Fundo IA (3-4 dias)**
- [ ] Integrar @imgly/background-removal (lazy load)
- [ ] Loading state com cancelamento
- [ ] Preview antes/depois (slider)
- [ ] Opções de fundo: Transparente, Cor, Gradiente
- [ ] Refinamento de bordas
- [ ] Fallback para remove.bg API (50 grátis/mês)

### **Sprint 3: Filtros e Ajustes (2-3 dias)**
- [ ] Integrar CamanJS para filtros
- [ ] Filtros predefinidos (B&W, Sepia, Vintage)
- [ ] Ajustes manuais (Brilho, Contraste, Saturação)
- [ ] Preview em tempo real
- [ ] Presets salvos no LocalStorage

### **Sprint 4: Export PDF (1-2 dias)**
- [ ] Múltiplas fotos em PDF (reuso html2pdf.js)
- [ ] Opções de layout (A4, Carta, Custom)
- [ ] Fotos por página (1, 2, 4, 6)
- [ ] Orientação (Retrato/Paisagem)
- [ ] Preview antes de exportar

### **Sprint 5: Texto e Desenho (2-3 dias)**
- [ ] Adicionar texto com Fabric.js
- [ ] Escolher fonte, tamanho, cor
- [ ] Desenho livre (pincel)
- [ ] Formas geométricas
- [ ] Desfazer/Refazer

### **Sprint 6: Processamento em Lote (2-3 dias)**
- [ ] Upload múltiplo de imagens
- [ ] Aplicar ações em todas
- [ ] Barra de progresso
- [ ] Export em ZIP
- [ ] Cancelamento de operações

### **Sprint 7: IA Avançada (3-5 dias) - OPCIONAL**
- [ ] Enhance automático
- [ ] Upscale 2x/4x
- [ ] Face detection
- [ ] Smart crop
- [ ] Color correction

---

## 📄 FASE 2: PDF Editor (Futuro - 1-2 semanas)

### Funcionalidades Planejadas
1. **Visualizar PDF:** Renderizar páginas
2. **Editar texto:** Modificar textos existentes
3. **Adicionar elementos:** Texto, imagens, assinaturas
4. **Mesclar PDFs:** Combinar múltiplos arquivos
5. **Dividir PDF:** Extrair páginas específicas
6. **Comprimir PDF:** Reduzir tamanho
7. **Converter:** PDF ↔ Imagens
8. **Preencher formulários:** Campos editáveis
9. **Assinatura digital:** Desenhar ou upload
10. **Proteger PDF:** Senha, marcas d'água

### Bibliotecas Sugeridas
- **PDF.js** (Mozilla) - Renderizar PDF
- **jsPDF** - Criar e editar PDF
- **pdf-lib** - Manipulação avançada

---

## 📝 FASE 3: Doc Editor (Futuro - 2-3 semanas)

### Funcionalidades Planejadas
1. **Editor WYSIWYG:** Rich text editor
2. **Formatação:** Negrito, itálico, sublinhado, cores
3. **Listas:** Numeradas e bullet points
4. **Tabelas:** Criar e editar
5. **Imagens:** Inserir e posicionar
6. **Cabeçalho/Rodapé:** Templates
7. **Estilos:** Títulos, parágrafos, citações
8. **Exportar:** DOCX, PDF, HTML, TXT
9. **Templates:** Cartas, currículos, contratos
10. **Colaboração:** Múltiplos usuários (futuro)

### Bibliotecas Sugeridas
- **TinyMCE** ou **CKEditor** - Editor WYSIWYG
- **Quill.js** - Mais leve e moderno
- **docx.js** - Gerar arquivos DOCX

---

## 🔒 Segurança e Privacidade

### Princípios
1. ✅ **Processamento local:** Tudo roda no navegador
2. ✅ **Sem upload obrigatório:** Fotos não saem do dispositivo
3. ✅ **GitHub opcional:** Usuário escolhe se quer salvar
4. ✅ **Sem analytics de imagens:** Não rastreamos conteúdo
5. ✅ **LocalStorage criptografado:** Dados sensíveis protegidos

### APIs Externas (apenas se usuário aceitar)
- **remove.bg:** Fallback para remoção de fundo (50/mês grátis)
- **Unsplash:** Banco de imagens para fundos (opcional)

---

## 💰 Modelo de Negócio (Futuro)

### Versão Gratuita
- Photo Editor completo (exceto IA avançada)
- Remover fundo: 10 imagens/dia (offline)
- Export PDF: Até 5 páginas
- Marca d'água discreta

### Versão Pro (R$ 19,90/mês)
- Remover fundo ilimitado
- IA avançada (enhance, upscale)
- Processamento em lote ilimitado
- PDF Editor completo
- Doc Editor completo
- Sem marca d'água
- Suporte prioritário

---

## 🎓 Documentação para Usuários

### Tutoriais Planejados
1. 📹 **Vídeo:** "Como remover fundo de foto em 30 segundos"
2. 📖 **Guia:** "10 edições rápidas para fotos profissionais"
3. 🎨 **Galeria:** Antes/Depois de fotos editadas
4. ❓ **FAQ:** Perguntas frequentes
5. 💡 **Dicas:** Atalhos de teclado

### Tooltips no Sistema
- Hover em cada ferramenta mostra descrição
- Tour guiado na primeira vez (opcional)
- Vídeos curtos (GIF) mostrando uso

---

## 🤝 Contribuições Futuras

### Como Outros Podem Ajudar
1. **Testar funcionalidades:** Report de bugs
2. **Sugerir filtros:** Novos presets de edição
3. **Criar tutoriais:** Documentação em vídeo
4. **Traduzir:** Interface para outros idiomas
5. **Otimizar performance:** Melhorias de código

---

## 📞 Próximos Passos

### Antes de Começar a Implementação
1. ✅ Criar este documento de planejamento
2. ⏳ **Revisar e aprovar** escopo com equipe/usuário
3. ⏳ **Definir prioridades:** Qual Sprint começar?
4. ⏳ **Escolher libs finais:** CamanJS vs Fabric.js?
5. ⏳ **Criar mockups de UI:** Protótipo visual no Figma/HTML

### Perguntas para Responder
- [ ] Quer começar com MVP (Sprint 1) ou incluir remover fundo desde início?
- [ ] Preferência: Lib offline (@imgly) ou API (remove.bg)?
- [ ] Ferramentas disponíveis para todos ou só admin?
- [ ] Salvar fotos editadas no GitHub ou só LocalStorage?
- [ ] Quer protótipo visual antes de implementar?

---

## 📚 Referências e Inspirações

### Ferramentas Similares
- **Photopea:** Editor online tipo Photoshop
- **Remove.bg:** Remoção de fundo especializada
- **Canva:** Design gráfico simplificado
- **Pixlr:** Editor de fotos web
- **Squoosh:** Compressor de imagens do Google

### Diferenciais do Nosso Sistema
✅ **Integrado ao workflow:** Já está no sistema de documentos  
✅ **Sem instalação:** 100% web, funciona offline (PWA)  
✅ **Gratuito e open-source:** Sem vendor lock-in  
✅ **Foco em produtividade:** Edições rápidas, não arte complexa  
✅ **GitHub como backend:** Persistência nativa  

---

## 🎉 Conclusão

Este sistema de **Ferramentas de Edição** transformará o Gerador de PDF em uma **suíte de produtividade completa**, eliminando a necessidade de softwares pesados para tarefas cotidianas.

**Impacto esperado:**
- ⬇️ **Reduzir dependência** de Adobe Creative Cloud
- ⚡ **Aumentar produtividade** com tudo em um lugar
- 💰 **Economizar dinheiro** (sem licenças caras)
- 🌍 **Acessível em qualquer lugar** (apenas navegador)

**Tempo estimado total:** 3-4 semanas para Photo Editor completo  
**ROI:** Alto - funcionalidade única que diferencia o produto

---

**Documento criado em:** 20 de novembro de 2025  
**Última atualização:** 20 de novembro de 2025  
**Status:** 📋 Planejamento  
**Próximo marco:** Aprovar escopo e iniciar Sprint 1

---

## 📝 Checklist de Aprovação

- [ ] Escopo revisado e aprovado
- [ ] Tecnologias escolhidas (CamanJS vs Fabric.js?)
- [ ] Mockup de UI criado
- [ ] Prioridades definidas (qual Sprint começar?)
- [ ] Responder 5 perguntas na seção "Próximos Passos"
- [ ] Definir timeline para início
- [ ] ✅ **APROVADO PARA COMEÇAR IMPLEMENTAÇÃO**
