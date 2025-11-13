// ============================================
// CONFIG.JS
// Configurações do sistema
// ============================================

const CONFIG = {
    // ========== GITHUB ==========
    github: {
        // IMPORTANTE: Você precisa criar um OAuth App no GitHub
        // https://github.com/settings/developers
        clientId: 'Ov23liYkxPW1TQtLXdhL',  // ← Client ID do OAuth App
        owner: 'gasparfranciscogulungo',    // ← Seu username do GitHub
        repo: 'gerador-declaracoes-data',   // ← Nome do repositório de dados
        branch: 'master'                    // ← Branch principal (master ou main)
    },

    // ========== ADMINISTRADORES ==========
    admins: [
        'gasparfranciscogulungo',  // ← Seu username
        // Adicione outros admins aqui
    ],

    // ========== LIMITES ==========
    limites: {
        maxDeclaracoesPorEmpresa: 5,
        maxClientesPorUser: 100,
        maxUploadSizeMB: 2
    },

    // ========== CAMINHOS NO REPOSITÓRIO ==========
    paths: {
        empresas: 'data/empresas.json',
        modelos: 'data/modelos.json',
        contador: 'data/contador.json',
        clientesDir: 'data/clientes',
        modelosDir: 'models/types',
        logosDir: 'assets/logos',
        carimbosDir: 'assets/carimbos'
    },

    // ========== SINCRONIZAÇÃO ==========
    sync: {
        pollingInterval: 5000,  // 5 segundos
        enableAutoSync: true
    },

    // ========== UI ==========
    ui: {
        itemsPorPagina: 20,
        animacoes: true,
        darkMode: false
    },

    // ========== VERSÃO ==========
    versao: '1.0.0'
};

// ========== INICIALIZAR SISTEMA ==========
async function inicializarSistema() {
    console.log(`
╔═══════════════════════════════════════╗
║  GERADOR DE DECLARAÇÕES v${CONFIG.versao}    ║
║  Sistema Admin + GitHub API           ║
╚═══════════════════════════════════════╝
    `);

    // Verificar se os objetos existem antes de configurar
    if (typeof authManager !== 'undefined') {
        authManager.configurar(CONFIG.github.clientId);
    } else {
        console.warn('⚠️ authManager não disponível ainda');
    }

    // Configurar GitHub API
    if (typeof githubAPI !== 'undefined') {
        githubAPI.configurar({
            owner: CONFIG.github.owner,                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             
            repo: CONFIG.github.repo,
            branch: CONFIG.github.branch
        });
    } else {
        console.warn('⚠️ githubAPI não disponível ainda');
    }

    console.log('✅ Sistema inicializado');
}

// NÃO auto-inicializar - deixar o index.html controlar
// Remover listeners automáticos para evitar conflitos
