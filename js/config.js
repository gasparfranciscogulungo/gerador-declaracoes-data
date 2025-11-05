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
        repo: 'gerador-declaracoes-data'    // ← Nome do repositório de dados
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

    // Configurar Auth Manager
    authManager.configurar(CONFIG.github.clientId);

    // Configurar GitHub API
    githubAPI.configurar({
        owner: CONFIG.github.owner,
        repo: CONFIG.github.repo
    });

    console.log('✅ Sistema inicializado');
}

// Auto-inicializar quando carregar
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', inicializarSistema);
} else {
    inicializarSistema();
}
