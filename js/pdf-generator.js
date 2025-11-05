// ============================================
// PDF-GENERATOR.JS
// Geração de PDFs usando html2pdf.js
// ============================================

class PDFGenerator {
    constructor() {
        this.opcoesPadrao = {
            margin: [10, 10, 10, 10],
            filename: 'documento.pdf',
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { 
                scale: 2,
                useCORS: true,
                letterRendering: true
            },
            jsPDF: { 
                unit: 'mm', 
                format: 'a4', 
                orientation: 'portrait' 
            }
        };
    }

    // ========== GERAR PDF ==========

    async gerarPDF(htmlContent, opcoes = {}) {
        try {
            console.log('📄 Iniciando geração de PDF...');

            // Criar elemento temporário
            const container = this.criarContainer(htmlContent);

            // Configurar opções
            const opcoesFinais = { ...this.opcoesPadrao, ...opcoes };

            // Gerar PDF
            await html2pdf()
                .set(opcoesFinais)
                .from(container)
                .save();

            // Limpar
            this.removerContainer(container);

            console.log('✅ PDF gerado com sucesso:', opcoesFinais.filename);
            return true;

        } catch (error) {
            console.error('❌ Erro ao gerar PDF:', error);
            throw error;
        }
    }

    // ========== GERAR PDF COM METADADOS ==========

    async gerarPDFDeclaracao(empresaId, trabalhadorId, modeloId, htmlContent) {
        try {
            // Obter dados
            const empresa = dataHandler.getEmpresaPorId(empresaId);
            const trabalhador = dataHandler.getTrabalhadorPorId(trabalhadorId);
            const modelo = dataHandler.getModeloPorId(modeloId);

            // Verificar limite
            const limite = storageHandler.verificarLimite(empresaId);
            if (limite.atingido) {
                throw new Error(`Limite de ${limite.maximo} declarações atingido para esta empresa!`);
            }

            // Gerar referência
            const referencia = storageHandler.gerarReferencia();
            const timestamp = Date.now();

            // Nome do arquivo
            const nomeArquivo = this.gerarNomeArquivo({
                empresaNome: empresa.nome,
                trabalhadorNome: trabalhador.nome,
                modeloNome: modelo.nome,
                referencia: referencia
            });

            // Opções customizadas
            const opcoes = {
                filename: nomeArquivo,
                margin: [12, 12, 12, 12]
            };

            // Gerar PDF
            await this.gerarPDF(htmlContent, opcoes);

            // Atualizar contador
            storageHandler.incrementarContador(empresaId);

            // Adicionar ao histórico
            storageHandler.adicionarHistorico({
                empresaId: empresa.id,
                empresaNome: empresa.nome,
                trabalhadorId: trabalhador.id,
                trabalhadorNome: trabalhador.nome,
                modeloId: modelo.id,
                modeloNome: modelo.nome,
                referencia: referencia
            });

            console.log('✅ Declaração gerada e registrada:', referencia);

            return {
                sucesso: true,
                referencia: referencia,
                nomeArquivo: nomeArquivo,
                novoContador: storageHandler.getContador(empresaId)
            };

        } catch (error) {
            console.error('❌ Erro ao gerar declaração:', error);
            throw error;
        }
    }

    // ========== PREVIEW SEM DOWNLOAD ==========

    async gerarPreview(htmlContent, elementoDestino) {
        try {
            const container = this.criarContainer(htmlContent);
            
            // Renderizar no elemento de destino
            if (elementoDestino) {
                elementoDestino.innerHTML = '';
                elementoDestino.appendChild(container);
            }

            return container;

        } catch (error) {
            console.error('❌ Erro ao gerar preview:', error);
            throw error;
        }
    }

    // ========== UTILITÁRIOS ==========

    criarContainer(htmlContent) {
        const container = document.createElement('div');
        container.innerHTML = htmlContent;
        container.style.width = '210mm';
        container.style.background = 'white';
        container.style.margin = '0 auto';
        return container;
    }

    removerContainer(container) {
        if (container && container.parentNode) {
            container.parentNode.removeChild(container);
        }
    }

    gerarNomeArquivo(dados) {
        const { empresaNome, trabalhadorNome, modeloNome, referencia } = dados;
        
        // Sanitizar strings
        const sanitize = (str) => str
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '') // Remove acentos
            .replace(/[^a-zA-Z0-9\s]/g, '')  // Remove caracteres especiais
            .replace(/\s+/g, '_')             // Espaços para underscore
            .toLowerCase();

        const empresaSanitizada = sanitize(empresaNome).substring(0, 20);
        const trabalhadorSanitizado = sanitize(trabalhadorNome).substring(0, 20);
        const modeloSanitizado = sanitize(modeloNome).substring(0, 30);

        const data = new Date().toISOString().split('T')[0];

        return `${modeloSanitizado}_${trabalhadorSanitizado}_${empresaSanitizada}_${data}_${referencia}.pdf`;
    }

    // ========== DOWNLOAD DIRETO ==========

    async downloadPDF(htmlContent, nomeArquivo = 'documento.pdf') {
        const opcoes = {
            filename: nomeArquivo,
            margin: 10
        };

        return await this.gerarPDF(htmlContent, opcoes);
    }

    // ========== ABRIR EM NOVA ABA ==========

    async abrirEmNovaAba(htmlContent) {
        try {
            const container = this.criarContainer(htmlContent);

            const opcoes = {
                ...this.opcoesPadrao,
                margin: 10
            };

            const pdf = await html2pdf()
                .set(opcoes)
                .from(container)
                .output('blob');

            const url = URL.createObjectURL(pdf);
            window.open(url, '_blank');

            this.removerContainer(container);

            console.log('✅ PDF aberto em nova aba');
            return true;

        } catch (error) {
            console.error('❌ Erro ao abrir PDF:', error);
            throw error;
        }
    }

    // ========== CONFIGURAÇÕES ==========

    setOpcoesGlobais(opcoes) {
        this.opcoesPadrao = { ...this.opcoesPadrao, ...opcoes };
        console.log('⚙️ Opções globais atualizadas');
    }

    getOpcoesGlobais() {
        return { ...this.opcoesPadrao };
    }

    // Debug
    debug() {
        console.log('🖨️ Configurações do PDF Generator:', this.opcoesPadrao);
    }
}

// Exportar instância global
const pdfGenerator = new PDFGenerator();
