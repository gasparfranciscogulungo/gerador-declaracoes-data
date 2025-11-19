#!/bin/bash

# ============================================
# GERADOR DE ÍCONES PWA
# ============================================
# Este script gera todos os ícones necessários para PWA
# a partir do logo de 515px localizado em /assets/logo.png
#
# Requisitos: ImageMagick
# Instalação Ubuntu/Debian: sudo apt install imagemagick
# Instalação macOS: brew install imagemagick
# ============================================

set -e  # Parar em caso de erro

# Cores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

# Verificar se ImageMagick está instalado
if ! command -v convert &> /dev/null; then
    echo -e "${RED}❌ ImageMagick não está instalado!${NC}"
    echo -e "${YELLOW}Instalação:${NC}"
    echo -e "  Ubuntu/Debian: ${BLUE}sudo apt install imagemagick${NC}"
    echo -e "  macOS: ${BLUE}brew install imagemagick${NC}"
    echo -e "  Windows: ${BLUE}https://imagemagick.org/script/download.php${NC}"
    exit 1
fi

echo -e "${PURPLE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${PURPLE}   🎨 GERADOR DE ÍCONES PWA${NC}"
echo -e "${PURPLE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Configuração
SOURCE_LOGO="assets/logo.png"
OUTPUT_DIR="assets/icons"
FAVICON_DIR="assets"

# Verificar se logo existe
if [ ! -f "$SOURCE_LOGO" ]; then
    echo -e "${RED}❌ Logo não encontrado: $SOURCE_LOGO${NC}"
    exit 1
fi

# Criar diretório de saída
mkdir -p "$OUTPUT_DIR"

echo -e "${BLUE}📂 Fonte: $SOURCE_LOGO${NC}"
echo -e "${BLUE}📁 Destino: $OUTPUT_DIR${NC}"
echo ""

# ============================================
# 1. ÍCONES PWA PADRÃO
# ============================================
echo -e "${GREEN}🔷 Gerando ícones PWA padrão...${NC}"

PWA_SIZES=(72 96 128 144 152 192 384 512)

for size in "${PWA_SIZES[@]}"; do
    OUTPUT_FILE="$OUTPUT_DIR/icon-${size}x${size}.png"
    convert "$SOURCE_LOGO" -resize ${size}x${size} -quality 100 "$OUTPUT_FILE"
    echo -e "  ✓ ${size}x${size}px → $OUTPUT_FILE"
done

echo ""

# ============================================
# 2. ÍCONES MASKABLE (Android Adaptive)
# ============================================
echo -e "${GREEN}🟢 Gerando ícones maskable (Android)...${NC}"

# Maskable precisa de 20% de safe zone
# Para 192x192, a imagem interna deve ser ~154x154
# Para 512x512, a imagem interna deve ser ~410x410

MASKABLE_SIZES=(192 512)

for size in "${MASKABLE_SIZES[@]}"; do
    # Calcular tamanho interno (80% do total)
    inner_size=$(echo "$size * 0.8" | bc | cut -d'.' -f1)
    
    OUTPUT_FILE="$OUTPUT_DIR/icon-${size}x${size}-maskable.png"
    
    # Criar canvas transparente do tamanho total
    # Redimensionar logo para 80% e centralizar
    convert "$SOURCE_LOGO" \
        -resize ${inner_size}x${inner_size} \
        -background none \
        -gravity center \
        -extent ${size}x${size} \
        -quality 100 \
        "$OUTPUT_FILE"
    
    echo -e "  ✓ ${size}x${size}px maskable → $OUTPUT_FILE"
done

echo ""

# ============================================
# 3. APPLE TOUCH ICONS
# ============================================
echo -e "${GREEN}🍎 Gerando Apple Touch Icons...${NC}"

APPLE_SIZES=(120 152 167 180)

for size in "${APPLE_SIZES[@]}"; do
    OUTPUT_FILE="$OUTPUT_DIR/apple-touch-icon-${size}x${size}.png"
    convert "$SOURCE_LOGO" -resize ${size}x${size} -quality 100 "$OUTPUT_FILE"
    echo -e "  ✓ ${size}x${size}px → $OUTPUT_FILE"
done

# Apple precisa de um padrão sem sufixo
convert "$SOURCE_LOGO" -resize 180x180 -quality 100 "$OUTPUT_DIR/apple-touch-icon.png"
echo -e "  ✓ 180x180px → $OUTPUT_DIR/apple-touch-icon.png (padrão)"

echo ""

# ============================================
# 4. FAVICONS
# ============================================
echo -e "${GREEN}⭐ Gerando favicons...${NC}"

# favicon.ico com múltiplos tamanhos
convert "$SOURCE_LOGO" \
    \( -clone 0 -resize 16x16 \) \
    \( -clone 0 -resize 32x32 \) \
    \( -clone 0 -resize 48x48 \) \
    -delete 0 -alpha on \
    "$FAVICON_DIR/favicon.ico"
echo -e "  ✓ favicon.ico (16, 32, 48px) → $FAVICON_DIR/favicon.ico"

# PNG favicons
convert "$SOURCE_LOGO" -resize 16x16 -quality 100 "$OUTPUT_DIR/icon-16x16.png"
echo -e "  ✓ 16x16px → $OUTPUT_DIR/icon-16x16.png"

convert "$SOURCE_LOGO" -resize 32x32 -quality 100 "$OUTPUT_DIR/icon-32x32.png"
echo -e "  ✓ 32x32px → $OUTPUT_DIR/icon-32x32.png"

echo ""

# ============================================
# 5. MICROSOFT TILES
# ============================================
echo -e "${GREEN}🪟 Gerando Microsoft Tiles...${NC}"

MS_SIZES=(70 144 150 310)

for size in "${MS_SIZES[@]}"; do
    OUTPUT_FILE="$OUTPUT_DIR/ms-tile-${size}x${size}.png"
    convert "$SOURCE_LOGO" -resize ${size}x${size} -quality 100 "$OUTPUT_FILE"
    echo -e "  ✓ ${size}x${size}px → $OUTPUT_FILE"
done

# Wide tile 310x150
convert "$SOURCE_LOGO" -resize 310x150 -quality 100 "$OUTPUT_DIR/ms-tile-310x150.png"
echo -e "  ✓ 310x150px → $OUTPUT_DIR/ms-tile-310x150.png"

echo ""

# ============================================
# 6. SAFARI PINNED TAB (SVG ou PNG)
# ============================================
echo -e "${GREEN}🦁 Gerando Safari Pinned Tab...${NC}"

# Como SVG é complexo, vamos criar um PNG monocromático
convert "$SOURCE_LOGO" \
    -alpha off \
    -colorspace gray \
    -threshold 50% \
    -alpha on \
    -resize 128x128 \
    -quality 100 \
    "$OUTPUT_DIR/safari-pinned-tab.png"
echo -e "  ✓ 128x128px monocromático → $OUTPUT_DIR/safari-pinned-tab.png"

echo ""

# ============================================
# 7. ÍCONES DE ATALHOS (Shortcuts)
# ============================================
echo -e "${GREEN}⚡ Gerando ícones de atalhos...${NC}"

# Criar ícones com badges/overlays para atalhos
# Declaração (Azul)
convert "$SOURCE_LOGO" -resize 96x96 \
    \( -size 96x96 xc:none -fill "#3B82F6" -draw "circle 75,75 90,90" \
       -fill white -pointsize 32 -gravity center -annotate +18+18 "D" \) \
    -composite -quality 100 \
    "$OUTPUT_DIR/shortcut-declaracao.png"
echo -e "  ✓ Atalho Declaração → $OUTPUT_DIR/shortcut-declaracao.png"

# Recibo (Verde)
convert "$SOURCE_LOGO" -resize 96x96 \
    \( -size 96x96 xc:none -fill "#10B981" -draw "circle 75,75 90,90" \
       -fill white -pointsize 32 -gravity center -annotate +18+18 "R" \) \
    -composite -quality 100 \
    "$OUTPUT_DIR/shortcut-recibo.png"
echo -e "  ✓ Atalho Recibo → $OUTPUT_DIR/shortcut-recibo.png"

# Gestão (Roxo)
convert "$SOURCE_LOGO" -resize 96x96 \
    \( -size 96x96 xc:none -fill "#A855F7" -draw "circle 75,75 90,90" \
       -fill white -pointsize 32 -gravity center -annotate +18+18 "G" \) \
    -composite -quality 100 \
    "$OUTPUT_DIR/shortcut-gestao.png"
echo -e "  ✓ Atalho Gestão → $OUTPUT_DIR/shortcut-gestao.png"

echo ""

# ============================================
# 8. OPEN GRAPH IMAGE
# ============================================
echo -e "${GREEN}📱 Gerando imagens para compartilhamento...${NC}"

# Open Graph (1200x630) com logo centralizado e background gradient
convert -size 1200x630 \
    gradient:"#EC4899-#A855F7" \
    \( "$SOURCE_LOGO" -resize 400x400 \) \
    -gravity center -composite \
    -quality 95 \
    "assets/og-image.png"
echo -e "  ✓ Open Graph 1200x630px → assets/og-image.png"

# Twitter Card (1200x600)
convert -size 1200x600 \
    gradient:"#EC4899-#A855F7" \
    \( "$SOURCE_LOGO" -resize 380x380 \) \
    -gravity center -composite \
    -quality 95 \
    "assets/twitter-card.png"
echo -e "  ✓ Twitter Card 1200x600px → assets/twitter-card.png"

echo ""

# ============================================
# RESUMO
# ============================================
echo -e "${PURPLE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}✅ Geração concluída com sucesso!${NC}"
echo -e "${PURPLE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Contar arquivos gerados
TOTAL_FILES=$(find "$OUTPUT_DIR" -type f -name "*.png" | wc -l)
echo -e "${BLUE}📊 Total de ícones gerados: ${YELLOW}$TOTAL_FILES${NC}"
echo ""

echo -e "${YELLOW}📋 Próximos passos:${NC}"
echo -e "  1. Verificar os ícones em: ${BLUE}$OUTPUT_DIR${NC}"
echo -e "  2. Copiar ${BLUE}pwa-meta-tags.html${NC} para <head> das páginas"
echo -e "  3. Copiar ${BLUE}pwa-install-banner.html${NC} antes do </body>"
echo -e "  4. Testar instalação PWA em mobile e desktop"
echo -e "  5. Validar com Lighthouse (PWA score)"
echo ""

echo -e "${GREEN}🎉 PWA pronto para produção!${NC}"
echo ""
