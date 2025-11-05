// ============================================
// MAIN.JS
// Lógica principal da aplicação (Alpine.js)
// ============================================

// ========== FUNÇÃO ALPINE.JS DATA ==========
function appData() {
    return {
        // Estado
        empresas: [],
        trabalhadores: [],
        modelos: [],
        modelosDisponiveis: [],

        // Seleções
        selectedEmpresa: '',
        selectedTrabalhador: '',
        selectedModelo: '',

        // UI
        previewGerado: false,
        carregando: false,
        alert: {
            show: false,
            type: 'success',
            message: ''
        },

        // ========== INICIALIZAÇÃO ==========
        async init() {
            console.log('🚀 Inicializando aplicação...');
            await this.carregarDados();
        },

        async carregarDados() {
            this.carregando = true;
            
            try {
                const sucesso = await dataHandler.carregarTodosDados();
                
                if (sucesso) {
                    this.empresas = dataHandler.getEmpresas();
                    this.trabalhadores = dataHandler.getTrabalhadores();
                    this.modelos = dataHandler.getModelos();
                    
                    console.log('✅ Dados carregados:', {
                        empresas: this.empresas.length,
                        trabalhadores: this.trabalhadores.length,
                        modelos: this.modelos.length
                    });
                } else {
                    this.showAlert('error', 'Erro ao carregar dados do sistema');
                }
                
            } catch (error) {
                console.error('Erro ao carregar dados:', error);
                this.showAlert('error', 'Erro ao inicializar o sistema');
            } finally {
                this.carregando = false;
            }
        },

        // ========== EVENTOS DE MUDANÇA ==========
        
        onEmpresaChange() {
            console.log('Empresa selecionada:', this.selectedEmpresa);
            
            // Resetar seleções
            this.selectedModelo = '';
            this.fecharPreview();
            
            if (this.selectedEmpresa) {
                // Carregar modelos disponíveis para esta empresa
                this.modelosDisponiveis = dataHandler.getModelosDisponiveis(this.selectedEmpresa);
            } else {
                this.modelosDisponiveis = [];
            }
        },

        onTrabalhadorChange() {
            console.log('Trabalhador selecionado:', this.selectedTrabalhador);
            this.fecharPreview();
        },

        onModeloChange() {
            console.log('Modelo selecionado:', this.selectedModelo);
            this.fecharPreview();
        },

        // ========== VALIDAÇÕES ==========

        isFormValid() {
            return this.selectedEmpresa && 
                   this.selectedTrabalhador && 
                   this.selectedModelo;
        },

        // ========== GERAR PREVIEW ==========

        async gerarPreview() {
            if (!this.isFormValid()) {
                this.showAlert('error', 'Por favor, preencha todos os campos');
                return;
            }

            this.carregando = true;

            try {
                // Construir documento
                const htmlContent = await modelBuilder.construirDeclaracao(
                    this.selectedEmpresa,
                    this.selectedTrabalhador,
                    this.selectedModelo
                );

                // Renderizar preview
                const previewContainer = document.getElementById('preview-container');
                if (previewContainer) {
                    previewContainer.innerHTML = htmlContent;
                    this.previewGerado = true;
                    
                    // Scroll suave até o preview
                    setTimeout(() => {
                        previewContainer.scrollIntoView({ 
                            behavior: 'smooth', 
                            block: 'start' 
                        });
                    }, 100);

                    this.showAlert('success', 'Pré-visualização gerada com sucesso!');
                }

            } catch (error) {
                console.error('Erro ao gerar preview:', error);
                this.showAlert('error', `Erro ao gerar preview: ${error.message}`);
            } finally {
                this.carregando = false;
            }
        },

        fecharPreview() {
            this.previewGerado = false;
            const previewContainer = document.getElementById('preview-container');
            if (previewContainer) {
                previewContainer.innerHTML = '';
            }
        },

        // ========== GERAR PDF ==========

        async gerarPDF() {
            if (!this.previewGerado) {
                this.showAlert('error', 'Primeiro gere a pré-visualização');
                return;
            }

            // Verificar limite
            const limite = storageHandler.verificarLimite(this.selectedEmpresa);
            if (limite.atingido) {
                this.showAlert('error', `❌ Limite de ${limite.maximo} declarações atingido para esta empresa!`);
                return;
            }

            this.carregando = true;

            try {
                // Obter HTML do preview
                const previewContainer = document.getElementById('preview-container');
                const htmlContent = previewContainer.innerHTML;

                // Gerar PDF
                const resultado = await pdfGenerator.gerarPDFDeclaracao(
                    this.selectedEmpresa,
                    this.selectedTrabalhador,
                    this.selectedModelo,
                    htmlContent
                );

                if (resultado.sucesso) {
                    this.showAlert('success', `✅ PDF gerado! Referência: ${resultado.referencia}`);
                    
                    // Resetar formulário
                    setTimeout(() => {
                        this.resetarFormulario();
                    }, 2000);
                }

            } catch (error) {
                console.error('Erro ao gerar PDF:', error);
                this.showAlert('error', `❌ ${error.message}`);
            } finally {
                this.carregando = false;
            }
        },

        // ========== INFORMAÇÕES ==========

        getEmpresaInfo() {
            if (!this.selectedEmpresa) return '';
            const empresa = dataHandler.getEmpresaPorId(this.selectedEmpresa);
            return empresa ? `NIF: ${empresa.nif}` : '';
        },

        getTrabalhadorInfo() {
            if (!this.selectedTrabalhador) return '';
            const trab = dataHandler.getTrabalhadorPorId(this.selectedTrabalhador);
            return trab ? `${trab.funcao} • ${trab.departamento}` : '';
        },

        getContador() {
            if (!this.selectedEmpresa) return 0;
            return storageHandler.getContador(this.selectedEmpresa);
        },

        // ========== ALERTAS ==========

        showAlert(type, message) {
            this.alert = {
                show: true,
                type: type,
                message: message
            };

            // Auto-fechar após 5 segundos
            setTimeout(() => {
                this.alert.show = false;
            }, 5000);
        },

        // ========== UTILIDADES ==========

        resetarFormulario() {
            this.selectedEmpresa = '';
            this.selectedTrabalhador = '';
            this.selectedModelo = '';
            this.modelosDisponiveis = [];
            this.fecharPreview();
        },

        toggleTheme() {
            // Preparado para futuro dark mode
            console.log('🌙 Toggle theme (em desenvolvimento)');
            this.showAlert('success', 'Tema escuro em breve!');
        },

        showHelp() {
            const mensagem = `
📘 COMO USAR:

1. Selecione a EMPRESA
2. Selecione o TRABALHADOR
3. Escolha o TIPO DE DOCUMENTO
4. Clique em VISUALIZAR
5. Confira os dados e clique em GERAR PDF

⚠️ Limite: 5 declarações por empresa

ℹ️ Os PDFs são gerados localmente no seu dispositivo.
            `.trim();

            alert(mensagem);
        }
    };
}

// ========== INICIALIZAÇÃO GLOBAL ==========

document.addEventListener('DOMContentLoaded', () => {
    console.log('✅ DOM carregado');
    console.log('📦 Versão: 1.0.0');
    console.log('🏢 Sistema de Geração de Declarações');
    
    // Verificar dependências
    if (typeof html2pdf === 'undefined') {
        console.error('❌ html2pdf.js não carregado!');
    }
    
    if (typeof Alpine === 'undefined') {
        console.error('❌ Alpine.js não carregado!');
    }
});

// ========== ATALHOS DE TECLADO ==========

document.addEventListener('keydown', (e) => {
    // Ctrl + P = Gerar PDF
    if (e.ctrlKey && e.key === 'p') {
        e.preventDefault();
        const btnPDF = document.querySelector('[\\@click="gerarPDF()"]');
        if (btnPDF && !btnPDF.disabled) {
            btnPDF.click();
        }
    }
    
    // Ctrl + R = Resetar
    if (e.ctrlKey && e.key === 'r') {
        e.preventDefault();
        location.reload();
    }
});

// ========== FUNÇÕES GLOBAIS DE UTILIDADE ==========

window.exportarHistorico = () => {
    storageHandler.exportarDados();
};

window.limparDados = () => {
    storageHandler.resetarTudo();
    location.reload();
};

window.estatisticas = () => {
    console.table(storageHandler.getEstatisticas());
};

console.log(`
╔═══════════════════════════════════════╗
║   GERADOR DE DECLARAÇÕES v1.0.0       ║
║   Sistema Profissional Offline        ║
╚═══════════════════════════════════════╝

📋 Comandos disponíveis no console:
   • window.exportarHistorico() - Exportar dados
   • window.limparDados() - Limpar tudo
   • window.estatisticas() - Ver estatísticas

⌨️  Atalhos:
   • Ctrl + P - Gerar PDF
   • Ctrl + R - Recarregar
`);
