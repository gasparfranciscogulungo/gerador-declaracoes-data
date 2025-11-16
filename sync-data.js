#!/usr/bin/env node

/**
 * Script Node.js para sincronizar dados locais para GitHub
 * Uso: node sync-data.js
 */

const fs = require('fs');
const https = require('https');
const readline = require('readline');

// Configuração
const CONFIG = {
    owner: 'gasparfranciscogulungo',
    repo: 'gerador-declaracoes-data',
    branch: 'master'
};

// Cores para terminal
const colors = {
    reset: '\x1b[0m',
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m'
};

function log(message, color = 'reset') {
    console.log(`${colors[color]}${message}${colors.reset}`);
}

function askQuestion(query) {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });

    return new Promise(resolve => rl.question(query, ans => {
        rl.close();
        resolve(ans);
    }));
}

async function getFileSHA(token, path) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'api.github.com',
            path: `/repos/${CONFIG.owner}/${CONFIG.repo}/contents/${path}?ref=${CONFIG.branch}`,
            method: 'GET',
            headers: {
                'Authorization': `token ${token}`,
                'User-Agent': 'Node.js',
                'Accept': 'application/vnd.github.v3+json'
            }
        };

        https.get(options, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                if (res.statusCode === 200) {
                    const json = JSON.parse(data);
                    resolve(json.sha);
                } else if (res.statusCode === 404) {
                    resolve(null); // Arquivo não existe
                } else {
                    reject(new Error(`HTTP ${res.statusCode}: ${data}`));
                }
            });
        }).on('error', reject);
    });
}

async function uploadFile(token, path, content, message) {
    const sha = await getFileSHA(token, path);
    const base64Content = Buffer.from(content).toString('base64');

    return new Promise((resolve, reject) => {
        const payload = JSON.stringify({
            message: message,
            content: base64Content,
            branch: CONFIG.branch,
            ...(sha && { sha: sha })
        });

        const options = {
            hostname: 'api.github.com',
            path: `/repos/${CONFIG.owner}/${CONFIG.repo}/contents/${path}`,
            method: 'PUT',
            headers: {
                'Authorization': `token ${token}`,
                'User-Agent': 'Node.js',
                'Accept': 'application/vnd.github.v3+json',
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(payload)
            }
        };

        const req = https.request(options, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                if (res.statusCode === 200 || res.statusCode === 201) {
                    resolve(JSON.parse(data));
                } else {
                    reject(new Error(`HTTP ${res.statusCode}: ${data}`));
                }
            });
        });

        req.on('error', reject);
        req.write(payload);
        req.end();
    });
}

async function main() {
    console.clear();
    log('═══════════════════════════════════════════════', 'blue');
    log('  🚀 SINCRONIZAR DADOS PARA GITHUB', 'blue');
    log('═══════════════════════════════════════════════\n', 'blue');

    // Pedir token
    const token = await askQuestion('🔑 Cole seu GitHub Token (ghp_...): ');
    
    if (!token || !token.startsWith('ghp_')) {
        log('❌ Token inválido!', 'red');
        process.exit(1);
    }

    console.log('');
    log('📂 Lendo arquivos locais...', 'yellow');

    try {
        // Ler empresas.json
        const empresasPath = './data/empresas.json';
        if (!fs.existsSync(empresasPath)) {
            throw new Error('empresas.json não encontrado!');
        }
        const empresasContent = fs.readFileSync(empresasPath, 'utf8');
        const empresasData = JSON.parse(empresasContent);
        log(`✅ ${empresasData.empresas.length} empresas encontradas`, 'green');

        // Ler trabalhadores.json
        const trabalhadoresPath = './data/trabalhadores.json';
        if (!fs.existsSync(trabalhadoresPath)) {
            throw new Error('trabalhadores.json não encontrado!');
        }
        const trabalhadoresContent = fs.readFileSync(trabalhadoresPath, 'utf8');
        const trabalhadoresData = JSON.parse(trabalhadoresContent);
        log(`✅ ${trabalhadoresData.trabalhadores.length} trabalhadores encontrados`, 'green');

        console.log('');
        log('📤 Enviando para GitHub...', 'yellow');

        // Upload empresas.json
        log('   Enviando empresas.json...', 'blue');
        await uploadFile(
            token,
            'data/empresas.json',
            empresasContent,
            'feat: sincronizar empresas.json com dados locais'
        );
        log('   ✅ empresas.json enviado!', 'green');

        // Upload trabalhadores.json
        log('   Enviando trabalhadores.json...', 'blue');
        await uploadFile(
            token,
            'data/trabalhadores.json',
            trabalhadoresContent,
            'feat: sincronizar trabalhadores.json com dados locais'
        );
        log('   ✅ trabalhadores.json enviado!', 'green');

        console.log('');
        log('═══════════════════════════════════════════════', 'green');
        log('  🎉 SINCRONIZAÇÃO COMPLETA!', 'green');
        log('═══════════════════════════════════════════════', 'green');
        log('\n🔄 Agora recarregue user-panel.html no navegador\n', 'yellow');

    } catch (error) {
        console.log('');
        log('═══════════════════════════════════════════════', 'red');
        log(`  ❌ ERRO: ${error.message}`, 'red');
        log('═══════════════════════════════════════════════', 'red');
        console.error(error);
        process.exit(1);
    }
}

main();
