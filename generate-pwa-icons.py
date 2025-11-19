#!/usr/bin/env python3
"""
============================================
GERADOR DE ÍCONES PWA
============================================
Gera todos os ícones necessários para PWA
a partir do logo de 515px em /assets/logo.png

Requisitos: Pillow (pip install Pillow)
============================================
"""

import os
import sys
from pathlib import Path

try:
    from PIL import Image, ImageDraw, ImageFont, ImageFilter
except ImportError:
    print("❌ Pillow não está instalado!")
    print("\nInstalação:")
    print("  pip install Pillow")
    print("  ou")
    print("  pip3 install Pillow")
    sys.exit(1)

# Cores
RED = '\033[0;31m'
GREEN = '\033[0;32m'
YELLOW = '\033[1;33m'
BLUE = '\033[0;34m'
PURPLE = '\033[0;35m'
NC = '\033[0m'

# Configuração
SOURCE_LOGO = "logo 515x515.png"  # Logo na raiz do projeto
OUTPUT_DIR = "assets/icons"
FAVICON_DIR = "assets"

def print_header():
    """Imprime cabeçalho estilizado"""
    print(f"{PURPLE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━{NC}")
    print(f"{PURPLE}   🎨 GERADOR DE ÍCONES PWA{NC}")
    print(f"{PURPLE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━{NC}")
    print()

def verify_source():
    """Verifica se logo fonte existe"""
    if not os.path.exists(SOURCE_LOGO):
        print(f"{RED}❌ Logo não encontrado: {SOURCE_LOGO}{NC}")
        sys.exit(1)
    
    print(f"{BLUE}📂 Fonte: {SOURCE_LOGO}{NC}")
    print(f"{BLUE}📁 Destino: {OUTPUT_DIR}{NC}")
    print()

def create_output_dir():
    """Cria diretório de saída"""
    Path(OUTPUT_DIR).mkdir(parents=True, exist_ok=True)

def resize_icon(source_img, size, output_path, quality=95):
    """Redimensiona ícone mantendo proporção e qualidade"""
    img = source_img.copy()
    img = img.resize((size, size), Image.Resampling.LANCZOS)
    img.save(output_path, "PNG", quality=quality, optimize=True)
    return output_path

def generate_pwa_icons(source_img):
    """Gera ícones PWA padrão"""
    print(f"{GREEN}🔷 Gerando ícones PWA padrão...{NC}")
    
    sizes = [72, 96, 128, 144, 152, 192, 384, 512]
    
    for size in sizes:
        output_path = os.path.join(OUTPUT_DIR, f"icon-{size}x{size}.png")
        resize_icon(source_img, size, output_path)
        print(f"  ✓ {size}x{size}px → {output_path}")
    
    print()

def generate_maskable_icons(source_img):
    """Gera ícones maskable (Android Adaptive) com safe zone de 20%"""
    print(f"{GREEN}🟢 Gerando ícones maskable (Android)...{NC}")
    
    sizes = [192, 512]
    
    for size in sizes:
        # Criar canvas transparente
        canvas = Image.new('RGBA', (size, size), (0, 0, 0, 0))
        
        # Calcular tamanho interno (80% para safe zone de 20%)
        inner_size = int(size * 0.8)
        
        # Redimensionar logo
        logo = source_img.copy()
        logo = logo.resize((inner_size, inner_size), Image.Resampling.LANCZOS)
        
        # Centralizar no canvas
        position = ((size - inner_size) // 2, (size - inner_size) // 2)
        canvas.paste(logo, position, logo if logo.mode == 'RGBA' else None)
        
        output_path = os.path.join(OUTPUT_DIR, f"icon-{size}x{size}-maskable.png")
        canvas.save(output_path, "PNG", quality=95, optimize=True)
        print(f"  ✓ {size}x{size}px maskable → {output_path}")
    
    print()

def generate_apple_icons(source_img):
    """Gera Apple Touch Icons"""
    print(f"{GREEN}🍎 Gerando Apple Touch Icons...{NC}")
    
    sizes = [120, 152, 167, 180]
    
    for size in sizes:
        output_path = os.path.join(OUTPUT_DIR, f"apple-touch-icon-{size}x{size}.png")
        resize_icon(source_img, size, output_path)
        print(f"  ✓ {size}x{size}px → {output_path}")
    
    # Apple padrão (180x180 sem sufixo)
    output_path = os.path.join(OUTPUT_DIR, "apple-touch-icon.png")
    resize_icon(source_img, 180, output_path)
    print(f"  ✓ 180x180px → {output_path} (padrão)")
    
    print()

def generate_favicons(source_img):
    """Gera favicons"""
    print(f"{GREEN}⭐ Gerando favicons...{NC}")
    
    # favicon.ico com múltiplos tamanhos
    favicon_path = os.path.join(FAVICON_DIR, "favicon.ico")
    icon_sizes = [(16, 16), (32, 32), (48, 48)]
    
    icons = []
    for size in icon_sizes:
        img = source_img.copy()
        img = img.resize(size, Image.Resampling.LANCZOS)
        icons.append(img)
    
    icons[0].save(favicon_path, format='ICO', sizes=icon_sizes)
    print(f"  ✓ favicon.ico (16, 32, 48px) → {favicon_path}")
    
    # PNG favicons
    for size in [16, 32]:
        output_path = os.path.join(OUTPUT_DIR, f"icon-{size}x{size}.png")
        resize_icon(source_img, size, output_path)
        print(f"  ✓ {size}x{size}px → {output_path}")
    
    print()

def generate_ms_tiles(source_img):
    """Gera Microsoft Tiles"""
    print(f"{GREEN}🪟 Gerando Microsoft Tiles...{NC}")
    
    # Tiles quadrados
    sizes = [70, 144, 150, 310]
    
    for size in sizes:
        output_path = os.path.join(OUTPUT_DIR, f"ms-tile-{size}x{size}.png")
        resize_icon(source_img, size, output_path)
        print(f"  ✓ {size}x{size}px → {output_path}")
    
    # Wide tile (310x150)
    img = source_img.copy()
    img = img.resize((310, 150), Image.Resampling.LANCZOS)
    output_path = os.path.join(OUTPUT_DIR, "ms-tile-310x150.png")
    img.save(output_path, "PNG", quality=95, optimize=True)
    print(f"  ✓ 310x150px → {output_path}")
    
    print()

def generate_safari_pinned_tab(source_img):
    """Gera Safari Pinned Tab (monocromático)"""
    print(f"{GREEN}🦁 Gerando Safari Pinned Tab...{NC}")
    
    # Converter para grayscale e threshold
    img = source_img.copy()
    img = img.convert('L')  # Grayscale
    img = img.point(lambda x: 255 if x > 128 else 0, mode='1')  # Threshold
    img = img.convert('RGBA')
    img = img.resize((128, 128), Image.Resampling.LANCZOS)
    
    output_path = os.path.join(OUTPUT_DIR, "safari-pinned-tab.png")
    img.save(output_path, "PNG", quality=95, optimize=True)
    print(f"  ✓ 128x128px monocromático → {output_path}")
    
    print()

def generate_shortcut_icons(source_img):
    """Gera ícones de atalhos com badges"""
    print(f"{GREEN}⚡ Gerando ícones de atalhos...{NC}")
    
    shortcuts = [
        ("declaracao", "D", "#1e40af"),  # Azul escuro (blue-800)
        ("recibo", "R", "#2563eb"),      # Azul médio (blue-600)
        ("gestao", "G", "#3b82f6"),      # Azul claro (blue-500)
    ]
    
    for name, letter, color in shortcuts:
        # Redimensionar logo base
        img = source_img.copy()
        img = img.resize((96, 96), Image.Resampling.LANCZOS)
        
        # Criar badge circular
        badge = Image.new('RGBA', (96, 96), (0, 0, 0, 0))
        draw = ImageDraw.Draw(badge)
        
        # Desenhar círculo no canto inferior direito
        circle_radius = 15
        circle_center = (75, 75)
        circle_bbox = [
            circle_center[0] - circle_radius,
            circle_center[1] - circle_radius,
            circle_center[0] + circle_radius,
            circle_center[1] + circle_radius
        ]
        draw.ellipse(circle_bbox, fill=color)
        
        # Desenhar letra (usando fonte padrão)
        try:
            # Tentar usar fonte maior
            font_size = 20
            # Desenhar texto no centro do círculo
            text_bbox = draw.textbbox((0, 0), letter)
            text_width = text_bbox[2] - text_bbox[0]
            text_height = text_bbox[3] - text_bbox[1]
            text_pos = (
                circle_center[0] - text_width // 2,
                circle_center[1] - text_height // 2 - 2
            )
            draw.text(text_pos, letter, fill='white')
        except:
            pass
        
        # Compor badge sobre logo
        img = Image.alpha_composite(img.convert('RGBA'), badge)
        
        output_path = os.path.join(OUTPUT_DIR, f"shortcut-{name}.png")
        img.save(output_path, "PNG", quality=95, optimize=True)
        print(f"  ✓ Atalho {name.capitalize()} → {output_path}")
    
    print()

def generate_og_images(source_img):
    """Gera imagens para Open Graph e Twitter Card"""
    print(f"{GREEN}📱 Gerando imagens para compartilhamento...{NC}")
    
    # Open Graph (1200x630)
    og_img = Image.new('RGB', (1200, 630))
    draw = ImageDraw.Draw(og_img)
    
    # Criar gradiente (aproximado)
    for y in range(630):
        # Gradiente azul (blue-700 → blue-500)
        ratio = y / 630
        r = int(29 * (1 - ratio) + 59 * ratio)    # 29→59
        g = int(78 * (1 - ratio) + 130 * ratio)   # 78→130
        b = int(216 * (1 - ratio) + 246 * ratio)  # 216→246
        draw.line([(0, y), (1200, y)], fill=(r, g, b))
    
    # Adicionar logo centralizado
    logo = source_img.copy()
    logo = logo.resize((400, 400), Image.Resampling.LANCZOS)
    
    # Calcular posição central
    x = (1200 - 400) // 2
    y = (630 - 400) // 2
    
    og_img.paste(logo, (x, y), logo if logo.mode == 'RGBA' else None)
    
    output_path = os.path.join("assets", "og-image.png")
    og_img.save(output_path, "PNG", quality=95, optimize=True)
    print(f"  ✓ Open Graph 1200x630px → {output_path}")
    
    # Twitter Card (1200x600)
    twitter_img = Image.new('RGB', (1200, 600))
    draw = ImageDraw.Draw(twitter_img)
    
    for y in range(600):
        # Gradiente azul (blue-700 → blue-500)
        ratio = y / 600
        r = int(29 * (1 - ratio) + 59 * ratio)    # 29→59
        g = int(78 * (1 - ratio) + 130 * ratio)   # 78→130
        b = int(216 * (1 - ratio) + 246 * ratio)  # 216→246
        draw.line([(0, y), (1200, y)], fill=(r, g, b))
    
    logo = source_img.copy()
    logo = logo.resize((380, 380), Image.Resampling.LANCZOS)
    
    x = (1200 - 380) // 2
    y = (600 - 380) // 2
    
    twitter_img.paste(logo, (x, y), logo if logo.mode == 'RGBA' else None)
    
    output_path = os.path.join("assets", "twitter-card.png")
    twitter_img.save(output_path, "PNG", quality=95, optimize=True)
    print(f"  ✓ Twitter Card 1200x600px → {output_path}")
    
    print()

def print_summary():
    """Imprime resumo final"""
    print(f"{PURPLE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━{NC}")
    print(f"{GREEN}✅ Geração concluída com sucesso!{NC}")
    print(f"{PURPLE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━{NC}")
    print()
    
    # Contar arquivos
    total_files = len(list(Path(OUTPUT_DIR).glob("*.png")))
    print(f"{BLUE}📊 Total de ícones gerados: {YELLOW}{total_files}{NC}")
    print()
    
    print(f"{YELLOW}📋 Próximos passos:{NC}")
    print(f"  1. Verificar os ícones em: {BLUE}{OUTPUT_DIR}{NC}")
    print(f"  2. Copiar {BLUE}pwa-meta-tags.html{NC} para <head> das páginas")
    print(f"  3. Copiar {BLUE}pwa-install-banner.html{NC} antes do </body>")
    print(f"  4. Testar instalação PWA em mobile e desktop")
    print(f"  5. Validar com Lighthouse (PWA score)")
    print()
    
    print(f"{GREEN}🎉 PWA pronto para produção!{NC}")
    print()

def main():
    """Função principal"""
    print_header()
    verify_source()
    create_output_dir()
    
    # Carregar logo fonte
    try:
        source_img = Image.open(SOURCE_LOGO)
        
        # Garantir que tem canal alpha
        if source_img.mode != 'RGBA':
            source_img = source_img.convert('RGBA')
        
    except Exception as e:
        print(f"{RED}❌ Erro ao carregar logo: {e}{NC}")
        sys.exit(1)
    
    # Gerar todos os ícones
    generate_pwa_icons(source_img)
    generate_maskable_icons(source_img)
    generate_apple_icons(source_img)
    generate_favicons(source_img)
    generate_ms_tiles(source_img)
    generate_safari_pinned_tab(source_img)
    generate_shortcut_icons(source_img)
    generate_og_images(source_img)
    
    print_summary()

if __name__ == "__main__":
    main()
