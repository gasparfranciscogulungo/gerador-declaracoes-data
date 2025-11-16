#!/bin/bash

# Script para fazer upload dos arquivos de dados para o GitHub via API
# Requer: token do GitHub no localStorage ou variável de ambiente

TOKEN="${GITHUB_TOKEN:-$(cat ~/.github-token 2>/dev/null)}"
OWNER="gasparfranciscogulungo"
REPO="gerador-declaracoes-data"

echo "🚀 Sincronizando arquivos de dados para GitHub..."
echo "Owner: $OWNER"
echo "Repo: $REPO"
echo ""

# Função para fazer upload de arquivo
upload_file() {
    local file=$1
    local path=$2
    
    echo "📤 Enviando: $path"
    
    # Ler conteúdo do arquivo e codificar em base64
    CONTENT=$(base64 -w 0 "$file")
    
    # Criar JSON payload
    JSON=$(jq -n \
        --arg content "$CONTENT" \
        --arg message "feat: adicionar $path via script" \
        '{
            message: $message,
            content: $content
        }')
    
    # Fazer upload via GitHub API
    curl -s -X PUT \
        -H "Authorization: token $TOKEN" \
        -H "Accept: application/vnd.github.v3+json" \
        "https://api.github.com/repos/$OWNER/$REPO/contents/$path" \
        -d "$JSON" | jq -r '.content.name // "ERRO"'
    
    echo "✅ $path enviado"
    echo ""
}

# Verificar se token existe
if [ -z "$TOKEN" ]; then
    echo "❌ ERRO: Token do GitHub não encontrado!"
    echo "Configure com: export GITHUB_TOKEN='seu_token_aqui'"
    exit 1
fi

# Upload dos arquivos
upload_file "data/empresas.json" "data/empresas.json"
upload_file "data/trabalhadores.json" "data/trabalhadores.json"
upload_file "data/contador.json" "data/contador.json"
upload_file "data/users.json" "data/users.json"

echo "🎉 Sincronização completa!"
