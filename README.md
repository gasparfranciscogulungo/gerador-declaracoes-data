# 🧾 Gerador de Declarações e Recibos

Sistema profissional de geração de declarações e recibos de vencimento com múltiplos modelos, totalmente offline.

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)
![PWA](https://img.shields.io/badge/PWA-Ready-purple)

---

## 📋 Índice

- [Sobre o Projeto](#sobre-o-projeto)
- [Funcionalidades](#funcionalidades)
- [Tecnologias](#tecnologias)
- [Estrutura do Projeto](#estrutura-do-projeto)
- [Como Usar](#como-usar)
- [Arquitetura](#arquitetura)
- [Roadmap](#roadmap)

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

### **Cenário A (Atual - Offline)**

- [x] Geração de PDFs localmente
- [x] 3 tipos de documentos (Declaração de Vencimento, Vínculo Laboral, Recibo)
- [x] Múltiplas empresas e trabalhadores
- [x] Sistema de placeholders dinâmicos
- [x] Preview antes de gerar PDF
- [x] Contador de declarações por empresa
- [x] Histórico de documentos gerados
- [x] LocalStorage para persistência

### **Cenário B (Futuro - Online)**

- [ ] Integração com Firebase (Firestore + Auth)
- [ ] Painel admin para criar modelos
- [ ] Upload de logos e carimbos
- [ ] Controle de usuários autenticados
- [ ] Hospedagem em Hostinger

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
├── index.html                 # Interface principal
├── manifest.json              # Configuração PWA
├── sw.js                      # Service Worker
│
├── assets/
│   ├── css/
│   │   └── styles.css        # Estilos customizados
│   ├── logos/                # Logos das empresas
│   └── carimbos/             # Carimbos das empresas
│
├── data/
│   ├── empresas.json         # Dados das empresas
│   ├── trabalhadores.json    # Dados dos trabalhadores
│   └── modelos.json          # Catálogo de modelos
│
├── js/
│   ├── main.js               # Orquestrador (Alpine.js)
│   ├── data-handler.js       # Manipulação de JSONs
│   ├── model-builder.js      # Motor de montagem
│   ├── pdf-generator.js      # Geração de PDFs
│   └── storage-handler.js    # Gerenciamento localStorage
│
└── models/
    ├── modelo-master.html    # Template base
    └── types/
        ├── type1.json        # Declaração de Vencimento
        ├── type2.json        # Declaração de Vínculo
        └── type3.json        # Recibo de Vencimento
```

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

### **Versão 1.0 (Atual)**
- [x] Sistema offline completo
- [x] 3 modelos de documentos
- [x] PWA funcional

### **Versão 2.0 (Futuro)**
- [ ] Migração para Firebase
- [ ] Painel administrativo
- [ ] Upload de assets
- [ ] Autenticação de usuários
- [ ] Histórico na nuvem

---

## 📝 Licença

Este projeto está sob a licença MIT.

---

## 👤 Autor

**Gaspar Gulungo**

---

## 🤝 Contribuindo

Contribuições são bem-vindas! Abra uma issue ou pull request.

---

<div align="center">

**Desenvolvido com ❤️ usando HTML, Tailwind, Alpine.js e JavaScript**

</div>
