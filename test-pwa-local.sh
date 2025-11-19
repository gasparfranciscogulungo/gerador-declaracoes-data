#!/bin/bash

# ====================================================================
# SERVIDOR DE TESTE PWA LOCAL
# ====================================================================
# Este script inicia um servidor HTTP local para testar o PWA
# ====================================================================

# Cores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Banner
echo -e "${PURPLE}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${PURPLE}║         ${CYAN}🚀 SERVIDOR DE TESTE PWA LOCAL${PURPLE}                ║${NC}"
echo -e "${PURPLE}╔════════════════════════════════════════════════════════════╗${NC}"
echo ""

# Verificar porta
PORT=8000
echo -e "${BLUE}📡 Verificando porta ${PORT}...${NC}"

if lsof -Pi :$PORT -sTCP:LISTEN -t >/dev/null 2>&1 ; then
    echo -e "${YELLOW}⚠️  Porta ${PORT} já está em uso. Matando processo...${NC}"
    kill -9 $(lsof -t -i:$PORT) 2>/dev/null
    sleep 1
fi

# Descobrir IP local
echo -e "${BLUE}🌐 Descobrindo IP local...${NC}"
LOCAL_IP=$(ip addr show | grep "inet " | grep -v 127.0.0.1 | head -1 | awk '{print $2}' | cut -d/ -f1)

if [ -z "$LOCAL_IP" ]; then
    LOCAL_IP="localhost"
fi

echo ""
echo -e "${GREEN}✅ Servidor iniciado com sucesso!${NC}"
echo ""
echo -e "${PURPLE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${CYAN}📱 TESTAR NO MESMO DISPOSITIVO:${NC}"
echo -e "${GREEN}   http://localhost:${PORT}/admin.html${NC}"
echo ""
echo -e "${CYAN}📱 TESTAR NO CELULAR (mesma rede Wi-Fi):${NC}"
echo -e "${GREEN}   http://${LOCAL_IP}:${PORT}/admin.html${NC}"
echo ""
echo -e "${YELLOW}🔧 ANDROID:${NC}"
echo -e "   1. Conectar no mesmo Wi-Fi"
echo -e "   2. Abrir Chrome e acessar a URL acima"
echo -e "   3. Aguardar 3 segundos → Banner azul aparece"
echo -e "   4. Clicar em ${GREEN}Instalar${NC}"
echo -e "   5. Verificar ícone azul no app drawer"
echo ""
echo -e "${YELLOW}🔧 iOS:${NC}"
echo -e "   1. Conectar no mesmo Wi-Fi"
echo -e "   2. Abrir Safari e acessar a URL acima"
echo -e "   3. Botão ${GREEN}Share 🔼${NC} → ${GREEN}Adicionar à Tela de Início${NC}"
echo -e "   4. Verificar ícone azul (não screenshot)"
echo ""
echo -e "${RED}⏹️  Para parar o servidor: Ctrl+C${NC}"
echo -e "${PURPLE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Iniciar servidor
python3 -m http.server $PORT
