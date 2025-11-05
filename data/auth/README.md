# Pasta para arquivos de autenticação

Cada usuário terá um arquivo `{username}.json` criptografado nesta pasta.

**Estrutura do arquivo:**
```json
{
  "username": "gasparfranciscogulungo",
  "tokenEncrypted": "...",
  "passwordHash": "...",
  "isAdmin": true,
  "profile": {...},
  "createdAt": "2025-11-05T..."
}
```

**Segurança:**
- Token criptografado com AES-256-GCM
- Senha não é salva, apenas hash SHA-256
- Apenas quem sabe a senha consegue descriptografar o token
