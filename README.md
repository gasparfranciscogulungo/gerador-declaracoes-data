# 🧾 Gerador de Declarações e Recibos

Sistema profissional PWA de geração de documentos (Declarações, Recibos, NIF, Atestado, BI) com múltiplos modelos personalizados, gestão de empresas, trabalhadores e autenticação GitHub.

![Version](https://img.shields.io/badge/version-2.0.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)
![PWA](https://img.shields.io/badge/PWA-Ready-purple)
![Responsive](https://img.shields.io/badge/Responsive-100%25-success)

---

## 📋 Índice

- [Sobre o Projeto](#sobre-o-projeto)
- [Funcionalidades](#funcionalidades)
- [Tecnologias](#tecnologias)
- [Estrutura do Projeto](#estrutura-do-projeto)
- [Como Usar](#como-usar)
- [Arquitetura](#arquitetura)
- [Roadmap](#roadmap)
- [Documentação Completa](#documentação-completa)

---

## 🎯 Sobre o Projeto

Sistema modular que permite criar, visualizar e gerar PDFs de declarações e recibos para diferentes empresas, com modelos personalizados.

### **Características Principais:**

✅ **100% Offline** - Funciona sem internet  
✅ **PWA** - Instalável como app  
✅ **Modular** - Arquitetura baseada em modelo master + type models  
✅ **Dinâmico** - Dados carregados via JSON  
✅ **Profissional** - Design limpo com Tailwind CSS  
✅ **Controle de Limite** - Máximo 5 declarações por empresa  

---

## ⚡ Funcionalidades

### **🎯 Gestão de Documentos**
- [x] **6 Tipos de Documentos**: Declaração, Recibo, Combo, NIF, Atestado, BI
- [x] **Preview em Tempo Real** - Visualização antes de gerar PDF
- [x] **Personalização Completa** - Cores, fontes, tamanhos, alinhamento
- [x] **Sistema de Slots** - Salve até 6 personalizações diferentes
- [x] **Modelos Pré-definidos** - Formal, Moderno, Elegante, Corporativo
- [x] **Zoom Responsivo** - Controles de zoom (30% - 200%)
- [x] **Marca d'Água** - Customizável com opacidade e rotação

### **🏢 Gestão de Empresas**
- [x] **CRUD Completo** - Criar, editar, excluir empresas
- [x] **Upload de Logos e Carimbos** - Via GitHub API
- [x] **Cache Inteligente** - Imagens cacheadas localmente
- [x] **Cores Personalizadas** - Primária e secundária para cada empresa
- [x] **Preview ao Vivo** - Visualize mudanças instantaneamente

### **👥 Gestão de Trabalhadores (Clientes)**
- [x] **Sistema Completo** - Nome, documento, NIF, função, salário
- [x] **Cálculo Automático** - Salário líquido, impostos, subsídios
- [x] **Busca Rápida** - Filtro por nome ou documento
- [x] **Estatísticas** - Total de trabalhadores por empresa

### **🔐 Autenticação e Segurança**
- [x] **Login com GitHub** - OAuth2 via Personal Access Token
- [x] **Sistema de Usuários** - Multi-tenant com permissões
- [x] **Sessões Persistentes** - LocalStorage com expiração
- [x] **Proteção de Rotas** - Apenas usuários autenticados

### **📱 100% Responsivo**
- [x] **Mobile-First** - Design otimizado para mobile
- [x] **Touch Optimizado** - Botões de 44-48px, gestos suaves
- [x] **Menu Hamburger Profissional** - Slide-in para tipos de documento
- [x] **Dark Mode** - Suporte completo a modo escuro
- [x] **A4 Perfeito** - Visualização correta em todos os dispositivos
- [x] **Bottom Drawer** - Painel de personalização mobile-friendly

### **🖼️ Editor de Fotos (BI)**
- [x] **Cropper.js Integrado** - Corte preciso de fotos
- [x] **Rotação** - 90° horário/anti-horário
- [x] **Reset** - Voltar ao estado original
- [x] **Touch Gestures** - Pinch to zoom, pan
- [x] **2 Fotos** - Superior e inferior para BI

### **💾 Armazenamento**
- [x] **GitHub como Backend** - Dados persistidos no repositório
- [x] **LocalStorage** - Cache local de imagens e personalizações
- [x] **Histórico** - Registro de documentos gerados
- [x] **Contador** - Limite de declarações por empresa

---

## 🛠️ Tecnologias

| Tecnologia | Uso |
|------------|-----|
| **HTML5** | Estrutura |
| **Tailwind CSS** | Estilos responsivos |
| **Alpine.js** | Reatividade leve |
| **JavaScript ES6+** | Lógica da aplicação |
| **html2pdf.js** | Geração de PDFs |
| **Bootstrap Icons** | Ícones |
| **Service Worker** | PWA e cache |
| **LocalStorage** | Persistência local |

---

## 📂 Estrutura do Projeto

```
GeradorDePDF/
│
├── 📄 admin.html                      # Painel administrativo principal (3740 linhas)
├── 📄 index.html                      # Interface pública (se existir)
├── 📄 login.html                      # Página de login/autenticação
├── 📄 users.html                      # Gerenciamento de usuários
├── 📄 manifest.json                   # PWA config
├── 📄 sw.js                          # Service Worker
│
├── 📂 assets/
│   ├── css/
│   │   ├── styles.css                # Estilos base + A4 responsivo
│   │   └── responsive.css            # Media queries adicionais
│   ├── logos/                        # Logos das empresas (via GitHub)
│   ├── carimbos/                     # Carimbos das empresas (via GitHub)
│   └── fonts/                        # Fontes customizadas
│
├── 📂 data/
│   ├── empresas.json                 # Dados das empresas
│   ├── trabalhadores.json            # Dados dos trabalhadores (clientes)
│   ├── modelos.json                  # Catálogo de modelos
│   ├── personalizacoes.json          # Slots de personalização salvos
│   ├── contador.json                 # Contador de declarações por empresa
│   ├── users.json                    # Base de usuários
│   └── auth/                         # Dados de autenticação por usuário
│       ├── usuario1.json
│       └── usuario2.json
│
├── 📂 js/
│   ├── admin-controller.js           # Controlador principal Alpine.js (4170 linhas)
│   ├── auth-manager.js               # Autenticação e sessões
│   ├── user-manager.js               # Gerenciamento de usuários
│   ├── cliente-manager.js            # CRUD de trabalhadores
│   ├── github-api.js                 # Integração com GitHub API
│   ├── data-handler.js               # Manipulação de JSONs
│   ├── model-builder.js              # Motor de montagem de documentos
│   ├── pdf-generator.js              # Geração de PDFs (html2pdf.js)
│   ├── storage-handler.js            # LocalStorage management
│   ├── notification-system.js        # Sistema de notificações
│   ├── dark-mode.js                  # Toggle dark mode
│   ├── crypto-utils.js               # Funções de criptografia
│   ├── password-manager.js           # Gestão de senhas
│   └── modelos/
│       └── declaracao-executivo.js   # Template de declaração
│
├── 📂 models/
│   ├── modelo-master.html            # Template HTML base
│   └── types/
│       ├── type2.json                # Modelo tipo 2
│       └── type3.json                # Modelo tipo 3
│
└── 📚 Documentação/
    ├── README.md                     # Este arquivo
    ├── ARCHITECTURE.md               # Arquitetura detalhada
    ├── PROGRESS.md                   # O que foi feito
    ├── TODO.md                       # O que falta fazer
    └── HANDOFF.md                    # Guia para próximo chat
```

**📊 Estatísticas do Projeto:**
- **Total de linhas (admin.html)**: 3740
- **Total de linhas (admin-controller.js)**: 4170
- **Total de módulos JS**: 15+
- **Total de tipos de documento**: 6
- **Total de presets de personalização**: 6

---

## 🚀 Como Usar

### **Instalação**

1. **Clone o repositório:**
```bash
git clone https://github.com/seu-usuario/GeradorDePDF.git
cd GeradorDePDF
```

2. **Abra com Live Server:**
```bash
# Usando Python
python -m http.server 8000

# Usando Node.js (http-server)
npx http-server

# Ou use a extensão Live Server do VS Code
```

3. **Acesse no navegador:**
```
http://localhost:8000
```

### **Uso**

1. **Selecione a Empresa**
2. **Selecione o Trabalhador**
3. **Escolha o Tipo de Documento**
4. **Clique em "Visualizar"** para ver o preview
5. **Clique em "Gerar PDF"** para baixar

### **Atalhos de Teclado**

- `Ctrl + P` - Gerar PDF
- `Ctrl + R` - Recarregar página

### **Comandos do Console**

```javascript
window.exportarHistorico()  // Exportar dados
window.limparDados()         // Resetar tudo
window.estatisticas()        // Ver estatísticas
```

---

## 🏗️ Arquitetura

### **Sistema de Modelos Dinâmicos**

```
┌─────────────────┐
│  MODELO MASTER  │ ← Template HTML base
└────────┬────────┘
         │ recebe
         ↓
┌─────────────────┐
│   TYPE MODEL    │ ← JSON com conteúdo específico
└────────┬────────┘
         │ preenche com
         ↓
┌─────────────────┐
│  DADOS (JSON)   │ ← Empresa + Trabalhador
└────────┬────────┘
         │ gera
         ↓
┌─────────────────┐
│   DOCUMENTO     │ ← HTML final
└────────┬────────┘
         │ transforma em
         ↓
┌─────────────────┐
│      PDF        │ ← Arquivo final
└─────────────────┘
```

### **Fluxo de Dados**

1. **Usuário seleciona** empresa, trabalhador e modelo
2. **DataHandler** carrega os JSONs necessários
3. **ModelBuilder** monta o documento:
   - Carrega `modelo-master.html`
   - Carrega `type-model.json` correspondente
   - Substitui placeholders com dados reais
4. **Preview** é renderizado na tela
5. **PDFGenerator** converte HTML em PDF
6. **StorageHandler** atualiza contador e histórico

---

## 📊 Placeholders Disponíveis

### **Empresa**
- `{EMPRESA_NOME}`, `{EMPRESA_NIF}`, `{EMPRESA_MORADA}`, `{EMPRESA_CIDADE}`
- `{EMPRESA_LOGO}`, `{EMPRESA_CARIMBO}`
- `{EMPRESA_COR_PRIMARIA}`, `{EMPRESA_COR_SECUNDARIA}`

### **Trabalhador**
- `{TRABALHADOR_NOME}`, `{TRABALHADOR_DOC}`, `{TRABALHADOR_NIF}`
- `{TRABALHADOR_FUNCAO}`, `{TRABALHADOR_DEPARTAMENTO}`
- `{SALARIO_BRUTO}`, `{SALARIO_LIQUIDO}`

### **Datas**
- `{DATA_ATUAL}`, `{DATA_ADMISSAO}`, `{MES_REFERENCIA}`

---

## 🗺️ Roadmap

### **Versão 2.0 (Atual)** ✅
- [x] Sistema completo com GitHub API backend
- [x] 6 tipos de documentos (1 funcional, 5 em desenvolvimento)
- [x] PWA 100% responsivo
- [x] Interface profissional com dark mode
- [x] Autenticação GitHub OAuth
- [x] Editor de fotos integrado
- [x] Sistema de personalização completo

### **Versão 2.5 (Próximo)** 🔄
- [ ] Implementar Recibo de Salário
- [ ] Implementar Combo (Declaração + Recibos)
- [ ] Implementar NIF
- [ ] Implementar Atestado
- [ ] Testes cross-browser completos

### **Versão 3.0 (Futuro)** 🔮
- [ ] Migração para Firebase
- [ ] Backend Node.js (alternativa)
- [ ] App mobile nativo
- [ ] Sistema de assinaturas
- [ ] Colaboração em tempo real

---

## � Documentação Completa

Para informações detalhadas sobre o projeto, consulte:

- **[📖 README.md](README.md)** - Este arquivo (visão geral)
- **[🏗️ ARCHITECTURE.md](ARCHITECTURE.md)** - Arquitetura técnica completa, stack, fluxos de dados, módulos
- **[✅ PROGRESS.md](PROGRESS.md)** - Tudo que já foi implementado (85% do projeto)
- **[📋 TODO.md](TODO.md)** - O que falta fazer, roadmap, estimativas
- **[🤝 HANDOFF.md](HANDOFF.md)** - Guia para continuar o projeto (ESSENCIAL para próximo chat)

### Guias Específicos

- **[🚀 INICIO-RAPIDO.md](INICIO-RAPIDO.md)** - Como começar a usar o sistema
- **[🔐 GUIA-AUTENTICACAO.md](GUIA-AUTENTICACAO.md)** - Como fazer login e configurar token GitHub
- **[⚙️ SETUP-ADMIN.md](SETUP-ADMIN.md)** - Configuração do painel administrativo

---

## �📝 Licença

Este projeto está sob a licença MIT.

---

## 👤 Autor

**Gaspar Gulungo**

📧 Email: gasparfranciscogulungo@gmail.com  
🌐 GitHub: [github.com/GasparGulungo](https://github.com/GasparGulungo)

---

## 🤝 Contribuindo

Contribuições são bem-vindas! 

1. Fork o projeto
2. Crie sua feature branch (`git checkout -b feature/NovaFuncionalidade`)
3. Commit suas mudanças (`git commit -m 'Adiciona nova funcionalidade'`)
4. Push para a branch (`git push origin feature/NovaFuncionalidade`)
5. Abra um Pull Request

**Antes de contribuir, leia:**
- [ARCHITECTURE.md](ARCHITECTURE.md) - Entenda a arquitetura
- [HANDOFF.md](HANDOFF.md) - Guia de desenvolvimento
- [TODO.md](TODO.md) - Veja o que está pendente

---

## 🐛 Reportar Bugs

Encontrou um bug? Abra uma [issue](https://github.com/GasparGulungo/GeradorDePDF/issues) com:
- Descrição clara do problema
- Passos para reproduzir
- Screenshots (se aplicável)
- Navegador e versão

---

## ⭐ Apoie o Projeto

Se este projeto foi útil para você:
- ⭐ Dê uma estrela no GitHub
- 🐛 Reporte bugs
- 💡 Sugira melhorias
- 🤝 Contribua com código
- 📢 Compartilhe com outros

---

<div align="center">

**Desenvolvido com ❤️ usando HTML5, Tailwind CSS, Alpine.js e JavaScript**

![Made with Love](https://img.shields.io/badge/Made%20with-❤️-red)
![Responsive](https://img.shields.io/badge/Responsive-100%25-success)
![PWA Ready](https://img.shields.io/badge/PWA-Ready-purple)

---

**⚠️ Para continuar o desenvolvimento em outro chat, leia [HANDOFF.md](HANDOFF.md) primeiro!**

</div>

````
