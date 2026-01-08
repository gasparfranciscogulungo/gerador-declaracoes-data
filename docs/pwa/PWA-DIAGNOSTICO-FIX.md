# 🔧 DIAGNÓSTICO E CORREÇÃO - PWA iOS/Android

**Data:** 19 de Novembro de 2025  
**Status:** Problemas identificados e corrigidos ✅

---

## 🐛 PROBLEMAS IDENTIFICADOS

### 1. Android - Não aparece opção de instalar ❌

**Causa Raiz:**
- ❌ Nomes dos ícones maskable errados no manifest.json
- ❌ HTTPS obrigatório (Android Chrome não instala via file:// ou http://)
- ❌ Service Worker pode não estar registrado corretamente

**Sintomas:**
- Não aparece banner "Adicionar à tela inicial"
- Ícone ⊕ não aparece na barra de endereço
- Lighthouse mostra "Not installable"

---

### 2. iOS - Logo não aparece ❌

**Causa Raiz:**
- ❌ Falta `apple-touch-icon` sem especificação de tamanho (padrão iOS)
- ❌ iOS Safari precisa de ícone exato em 180x180px como fallback

**Sintomas:**
- Ícone genérico (screenshot da página) em vez do logo
- Ícone não aparece bonito na tela inicial

---

### 3. Desktop - Funcionou ✅

**Por que funcionou:**
- ✅ Chrome desktop é mais permissivo
- ✅ Localhost é considerado "seguro"
- ✅ Service Worker registrado com sucesso

---

## ✅ CORREÇÕES APLICADAS

### 1. Manifest.json - Nomes de Ícones Maskable

**Antes (errado):**
```json
"src": "assets/icons/icon-maskable-192x192.png"
"src": "assets/icons/icon-maskable-512x512.png"
```

**Depois (correto):**
```json
"src": "assets/icons/icon-192x192-maskable.png"
"src": "assets/icons/icon-512x512-maskable.png"
```

**Motivo:** Os arquivos reais foram gerados com sufixo `-maskable`, não prefixo `maskable-`.

---

### 2. Apple Touch Icon Padrão

**Adicionado em `admin.html`:**
```html
<link rel="apple-touch-icon" href="/assets/icons/apple-touch-icon.png">
```

**Motivo:** iOS Safari procura primeiro por `apple-touch-icon.png` sem especificação de tamanho. Se não encontra, usa screenshot da página.

---

## 🚀 COMO TESTAR CORRETAMENTE

### Android Chrome (CRÍTICO: Precisa HTTPS)

**❌ NÃO FUNCIONA:**
```
file:///caminho/para/admin.html
http://192.168.1.x/admin.html  (IP local sem SSL)
```

**✅ FUNCIONA:**
```
https://seu-dominio.com/admin.html
http://localhost:8000/admin.html (localhost é exceção)
```

**Como testar localmente:**

```bash
# Opção 1: Python HTTP Server
cd /home/gaspargulungo/GeradorDePDF
python3 -m http.server 8000

# Abrir no Chrome Android:
# http://localhost:8000/admin.html
# ou
# http://IP-DO-SEU-PC:8000/admin.html
```

```bash
# Opção 2: Node.js http-server (melhor)
npm install -g http-server
cd /home/gaspargulungo/GeradorDePDF
http-server -p 8000 -c-1

# Abrir:
# http://localhost:8000/admin.html
```

```bash
# Opção 3: PHP (se tiver instalado)
cd /home/gaspargulungo/GeradorDePDF
php -S localhost:8000

# Abrir:
# http://localhost:8000/admin.html
```

**Passo a passo Android:**
1. Conectar celular no mesmo Wi-Fi do PC
2. Descobrir IP do PC: `ip addr show` ou `ifconfig`
3. Iniciar servidor local no PC
4. Abrir no Chrome Android: `http://192.168.1.X:8000/admin.html`
5. Menu (⋮) → "Adicionar à tela inicial"
6. OU aguardar 3 segundos para aparecer banner automático

---

### iOS Safari

**Como testar:**

1. **Via localhost (se estiver na mesma rede):**
   ```
   http://IP-DO-SEU-MAC:8000/admin.html
   ```

2. **Adicionar à tela inicial:**
   - Abrir no Safari
   - Tocar no botão Share (quadrado com seta para cima)
   - Rolar e tocar em "Adicionar à Tela de Início"
   - Verificar se o ícone azul aparece (não screenshot)

3. **Verificar ícone:**
   - Se aparecer logo azul do Gerador PDF = ✅ Funcionou
   - Se aparecer screenshot da página = ❌ Ícone não carregou

---

## 🔍 CHECKLIST DE DIAGNÓSTICO

### Verificar Arquivos Existem

```bash
# Verificar ícones obrigatórios
ls -lh assets/icons/icon-192x192.png
ls -lh assets/icons/icon-512x512.png
ls -lh assets/icons/icon-192x192-maskable.png
ls -lh assets/icons/icon-512x512-maskable.png
ls -lh assets/icons/apple-touch-icon.png
ls -lh assets/icons/apple-touch-icon-180x180.png

# Verificar manifest e service worker
ls -lh manifest.json sw.js
```

**Todos devem existir!** Se faltar algum, o PWA não instala.

---

### Validar Manifest.json

**Online:**
https://manifest-validator.appspot.com/

**Deve retornar:**
- ✅ 0 errors
- ✅ 0 warnings
- ✅ All icons valid

---

### Lighthouse PWA Audit

**Desktop (Chrome DevTools):**
```
F12 → Lighthouse → Progressive Web App → Run audit
```

**Esperado:**
- ✅ Installable (90+ pontos)
- ✅ Works offline
- ✅ Configured for a custom splash screen
- ✅ Sets a theme color
- ✅ Content sized correctly for viewport
- ✅ Has a `<meta name="viewport">` tag
- ✅ Manifest includes name
- ✅ Manifest has maskable icon

**Se falhar "Installable":**
- Verificar se está em HTTPS ou localhost
- Verificar se Service Worker está registrado
- Verificar se manifest.json está acessível

---

## 🌐 DEPLOY PARA PRODUÇÃO (HTTPS)

### Opção 1: GitHub Pages (Grátis + HTTPS)

```bash
# 1. Criar branch gh-pages
git checkout -b gh-pages
git push origin gh-pages

# 2. Ir em Settings → Pages
# 3. Source: gh-pages branch
# 4. Acessar: https://gasparfranciscogulungo.github.io/gerador-declaracoes-data/admin.html
```

**Prós:** Grátis, HTTPS automático, fácil  
**Contras:** URL longa

---

### Opção 2: Netlify (Recomendado)

```bash
# 1. Instalar Netlify CLI
npm install -g netlify-cli

# 2. Deploy
cd /home/gaspargulungo/GeradorDePDF
netlify deploy --prod

# 3. Seguir instruções
# Site live em: https://seu-site.netlify.app
```

**Prós:** HTTPS grátis, domínio customizado grátis, CI/CD  
**Contras:** Precisa conta Netlify

---

### Opção 3: Vercel

```bash
# 1. Instalar Vercel CLI
npm install -g vercel

# 2. Deploy
cd /home/gaspargulungo/GeradorDePDF
vercel --prod

# Site live em: https://seu-site.vercel.app
```

**Prós:** Muito rápido, HTTPS automático  
**Contras:** Precisa conta Vercel

---

### Opção 4: Domínio Próprio + CloudFlare

Se você tem domínio `geradorpdf.ao`:

1. Apontar DNS para servidor
2. Configurar CloudFlare (HTTPS grátis)
3. Upload dos arquivos via FTP/cPanel
4. Acessar: `https://geradorpdf.ao/admin.html`

---

## 🧪 TESTE FINAL - CHECKLIST

### Android (Chrome)

- [ ] Servidor rodando em HTTPS ou localhost
- [ ] Abrir `http://localhost:8000/admin.html`
- [ ] Aguardar 3 segundos
- [ ] Banner azul aparece no rodapé
- [ ] Clicar em "Instalar"
- [ ] Ícone azul aparece no app drawer
- [ ] Abrir app → Sem barra do navegador (standalone)
- [ ] Status bar azul (#1e40af)
- [ ] Funciona offline (modo avião)

### iOS (Safari)

- [ ] Abrir no Safari
- [ ] Botão Share → "Adicionar à Tela de Início"
- [ ] Ícone azul aparece na tela inicial (não screenshot)
- [ ] Nome "Gerador PDF" aparece embaixo
- [ ] Abrir app → Splash screen azul (rápido)
- [ ] Sem barra do Safari (fullscreen)
- [ ] Status bar preta translúcida
- [ ] Funciona offline

### Desktop (Chrome/Edge)

- [ ] Ícone ⊕ aparece na barra de endereço
- [ ] Clicar → "Instalar Gerador PDF"
- [ ] App abre em janela separada
- [ ] Ícone azul na barra de tarefas
- [ ] Barra de título com cor azul
- [ ] Funciona offline
- [ ] Pode criar shortcut no desktop

---

## 🐛 TROUBLESHOOTING

### Problema: "Manifest não carrega"

```bash
# Verificar se está acessível
curl http://localhost:8000/manifest.json

# Deve retornar JSON válido
# Se retornar 404 → Caminho errado
# Se retornar HTML → .htaccess redirecionando
```

**Solução:**
```html
<!-- Verificar em admin.html -->
<link rel="manifest" href="/manifest.json">
<!-- OU -->
<link rel="manifest" href="./manifest.json">
```

---

### Problema: "Service Worker não registra"

```javascript
// Abrir Console (F12)
// Executar:
navigator.serviceWorker.getRegistrations().then(registrations => {
    console.log('SW registrado:', registrations.length > 0);
});

// Se retornar false:
// 1. Verificar HTTPS/localhost
// 2. Verificar se sw.js existe
// 3. Verificar erros no console
```

**Solução:**
```javascript
// Forçar re-registro
navigator.serviceWorker.getRegistrations().then(registrations => {
    registrations.forEach(reg => reg.unregister());
});
location.reload();
```

---

### Problema: "Ícones não aparecem no Android"

**Diagnóstico:**
```
Chrome DevTools → Application → Manifest
Verificar:
- ✅ Icons carregam (não 404)
- ✅ Maskable icons têm purpose: "maskable"
- ✅ Pelo menos um ícone 192x192
- ✅ Pelo menos um ícone 512x512
```

**Solução:** Corrigir paths no manifest.json

---

### Problema: "iOS usa screenshot em vez do ícone"

**Causa:** `apple-touch-icon.png` não foi encontrado

**Verificar:**
```bash
curl http://localhost:8000/assets/icons/apple-touch-icon.png --head
# Deve retornar 200 OK
```

**Solução:**
```html
<!-- Adicionar no <head> -->
<link rel="apple-touch-icon" href="/assets/icons/apple-touch-icon.png">
```

---

### Problema: "Banner não aparece no Android"

**Verificar:**
1. Está em HTTPS ou localhost?
2. Service Worker registrado?
3. Manifest válido?
4. beforeinstallprompt está sendo capturado?

**Debug:**
```javascript
// Console:
window.deferredPrompt  // Deve existir depois de 3 segundos

// Se for undefined:
// Banner já foi dispensado (LocalStorage)
localStorage.removeItem('pwa-install-dismissed');
location.reload();
```

---

## 📊 COMANDOS ÚTEIS

### Iniciar Servidor Local (Python)
```bash
cd /home/gaspargulungo/GeradorDePDF
python3 -m http.server 8000
# Abrir: http://localhost:8000/admin.html
```

### Ver IP Local (para testar no celular)
```bash
ip addr show | grep "inet " | grep -v 127.0.0.1
# Usar o IP mostrado (ex: 192.168.1.105)
# No celular: http://192.168.1.105:8000/admin.html
```

### Validar Manifest Online
```bash
# Copiar conteúdo de manifest.json
# Colar em: https://manifest-validator.appspot.com/
```

### Limpar Cache PWA (Chrome)
```
F12 → Application → Storage → Clear site data
```

### Forçar Update do Service Worker
```javascript
// Console:
navigator.serviceWorker.getRegistration().then(reg => {
    reg.update();
});
```

---

## ✅ CORREÇÕES COMMITADAS

```bash
git status
# modified:   manifest.json (nomes de ícones maskable corrigidos)
# modified:   admin.html (apple-touch-icon padrão adicionado)
```

---

## 🎯 PRÓXIMA AÇÃO

**Para testar AGORA mesmo:**

```bash
# 1. Iniciar servidor
cd /home/gaspargulungo/GeradorDePDF
python3 -m http.server 8000

# 2. Android: Abrir Chrome
http://localhost:8000/admin.html
# ou (mesmo Wi-Fi):
http://IP-DO-SEU-PC:8000/admin.html

# 3. Aguardar 3 segundos → Banner aparece
# 4. Instalar → Verificar ícone azul

# 5. iOS: Safari
http://IP-DO-SEU-MAC:8000/admin.html
# Share → "Adicionar à Tela de Início"
# Verificar ícone azul (não screenshot)
```

---

**🚨 IMPORTANTE:** O problema principal é **HTTPS/localhost**. Android Chrome NÃO instala PWA em `file://` ou `http://` (exceto localhost).

**Solução imediata:** Use `python3 -m http.server 8000` e acesse via `http://localhost:8000`

**Solução permanente:** Deploy em GitHub Pages, Netlify ou Vercel (todos têm HTTPS grátis).
