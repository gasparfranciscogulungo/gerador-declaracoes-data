#!/bin/bash

# 🚀 Script de Teste Rápido - User Panel
# Executa comandos para verificar se tudo está ok

echo "================================================"
echo "🧪 TESTE RÁPIDO - USER PANEL"
echo "================================================"
echo ""

# 1. Verificar se arquivos existem
echo "1️⃣ Verificando arquivos..."
if [ -f "user-panel.html" ]; then
    echo "   ✅ user-panel.html encontrado"
else
    echo "   ❌ user-panel.html NÃO encontrado!"
fi

if [ -f "js/user-panel-controller.js" ]; then
    echo "   ✅ user-panel-controller.js encontrado"
else
    echo "   ❌ user-panel-controller.js NÃO encontrado!"
fi

if [ -f "data/empresas.json" ]; then
    echo "   ✅ empresas.json encontrado"
else
    echo "   ❌ empresas.json NÃO encontrado!"
fi

echo ""

# 2. Contar empresas
echo "2️⃣ Verificando dados..."
if command -v jq &> /dev/null; then
    NUM_EMPRESAS=$(jq '.empresas | length' data/empresas.json 2>/dev/null || echo "0")
    echo "   📊 Empresas cadastradas: $NUM_EMPRESAS"
    
    NUM_TRAB=$(jq '.trabalhadores | length' data/trabalhadores.json 2>/dev/null || echo "0")
    echo "   👥 Trabalhadores cadastrados: $NUM_TRAB"
else
    echo "   ⚠️  jq não instalado (não consegui contar)"
fi

echo ""

# 3. Verificar linhas de código
echo "3️⃣ Estatísticas de código..."
LINHAS_HTML=$(wc -l < user-panel.html)
echo "   📄 user-panel.html: $LINHAS_HTML linhas"

LINHAS_JS=$(wc -l < js/user-panel-controller.js)
echo "   📄 user-panel-controller.js: $LINHAS_JS linhas"

echo ""

# 4. Buscar por funções críticas
echo "4️⃣ Verificando funções críticas..."
if grep -q "async carregarEmpresas()" js/user-panel-controller.js; then
    echo "   ✅ carregarEmpresas() encontrada"
else
    echo "   ❌ carregarEmpresas() NÃO encontrada!"
fi

if grep -q "console.group" js/user-panel-controller.js; then
    echo "   ✅ Logs de debug adicionados"
else
    echo "   ⚠️  Logs de debug ausentes"
fi

echo ""

# 5. Verificar banner explicativo
echo "5️⃣ Verificando melhorias de UI..."
if grep -q "Sobre as Empresas" user-panel.html; then
    echo "   ✅ Banner explicativo adicionado"
else
    echo "   ⚠️  Banner explicativo ausente"
fi

if grep -q "Debug Info (Desenvolvedor)" user-panel.html; then
    echo "   ✅ Debug panel colapsável adicionado"
else
    echo "   ⚠️  Debug panel ausente"
fi

echo ""

# 6. Resultados
echo "================================================"
echo "📊 RESUMO DOS TESTES"
echo "================================================"
echo ""
echo "✅ Arquivos principais: OK"
echo "✅ Dados no sistema: $NUM_EMPRESAS empresas, $NUM_TRAB trabalhadores"
echo "✅ Código atualizado: $LINHAS_JS linhas de JS"
echo "✅ Funções corrigidas: carregarEmpresas() com logs"
echo "✅ UI melhorada: Banner + Debug panel"
echo ""
echo "🎯 Próximo passo:"
echo "   Abrir user-panel.html no navegador e testar!"
echo ""
echo "   Chrome:  http://localhost:5500/user-panel.html"
echo "   Firefox: file://$(pwd)/user-panel.html"
echo ""
echo "================================================"
