// ============================================
// MODEL-BUILDER.JS
// Motor de montagem de documentos (master + type + dados)
// ============================================

class ModelBuilder {
    constructor() {
        this.placeholders = {};
        this.debugMode = false;
    }

    // ========== CONSTRUIR DECLARAÇÃO COMPLETA ==========

    async construirDeclaracao(empresaId, trabalhadorId, modeloId) {
        try {
            console.log('🔨 Construindo declaração...', { empresaId, trabalhadorId, modeloId });

            // 1. Carregar recursos
            const [master, typeModel, empresa, trabalhador] = await Promise.all([
                dataHandler.carregarModeloMaster(),
                dataHandler.carregarTypeModel(modeloId),
                Promise.resolve(dataHandler.getEmpresaPorId(empresaId)),
                Promise.resolve(dataHandler.getTrabalhadorPorId(trabalhadorId))
            ]);

            // 2. Validar dados
            if (!master) throw new Error('Modelo master não encontrado');
            if (!typeModel) throw new Error(`Type model "${modeloId}" não encontrado`);
            if (!empresa) throw new Error('Empresa não encontrada');
            if (!trabalhador) throw new Error('Trabalhador não encontrado');

            // 3. Construir placeholders (ASYNC - aguarda cache de imagens)
            await this.construirPlaceholders(empresa, trabalhador, typeModel);

            // 4. Montar conteúdo do type model
            const typeContent = this.montarTypeContent(typeModel.type_content);
            const trabalhadorSection = typeModel.trabalhador_section.template;
            const typeFooter = typeModel.type_footer.template;

            // 5. Substituir seções no master
            let htmlFinal = master;
            htmlFinal = htmlFinal.replace('{TYPE_CONTENT}', typeContent);
            htmlFinal = htmlFinal.replace('{TRABALHADOR_SECTION}', trabalhadorSection);
            htmlFinal = htmlFinal.replace('{TYPE_FOOTER}', typeFooter);

            // 6. Substituir todos os placeholders
            htmlFinal = this.substituirPlaceholders(htmlFinal);

            console.log('✅ Declaração construída com sucesso');
            return htmlFinal;

        } catch (error) {
            console.error('❌ Erro ao construir declaração:', error);
            throw error;
        }
    }

    // ========== CONSTRUIR PLACEHOLDERS ==========

    async construirPlaceholders(empresa, trabalhador, typeModel) {
        // Carregar imagens do cache para uso no PDF
        let logoParaPDF = empresa.logo;
        let carimboParaPDF = empresa.carimbo;
        
        if (typeof imageCacheManager !== 'undefined') {
            console.log('🖼️ Carregando imagens do cache para PDF...');
            
            // Logo
            if (empresa.logo && !empresa.logo.startsWith('data:')) {
                const logoCache = await imageCacheManager.getImage(empresa.logo);
                if (logoCache) {
                    logoParaPDF = logoCache;
                    console.log('✅ Logo carregado do cache para PDF');
                } else {
                    console.warn('⚠️ Logo não encontrado no cache, usando URL');
                }
            }
            
            // Carimbo
            if (empresa.carimbo && !empresa.carimbo.startsWith('data:')) {
                const carimboCache = await imageCacheManager.getImage(empresa.carimbo);
                if (carimboCache) {
                    carimboParaPDF = carimboCache;
                    console.log('✅ Carimbo carregado do cache para PDF');
                } else {
                    console.warn('⚠️ Carimbo não encontrado no cache, usando URL');
                }
            }
        }
        
        this.placeholders = {
            // Empresa
            'EMPRESA_NOME': empresa.nome,
            'EMPRESA_NIF': empresa.nif,
            'EMPRESA_MORADA': empresa.morada,
            'EMPRESA_CIDADE': empresa.cidade,
            'EMPRESA_TELEFONE': empresa.telefone,
            'EMPRESA_EMAIL': empresa.email,
            'EMPRESA_LOGO': logoParaPDF,
            'EMPRESA_CARIMBO': carimboParaPDF,
            'EMPRESA_COR_PRIMARIA': empresa.cor_primaria,
            'EMPRESA_COR_SECUNDARIA': empresa.cor_secundaria,
            'EMPRESA_REPRESENTANTE': empresa.representante,
            'CARGO_REPRESENTANTE': empresa.cargo_representante,

            // Trabalhador
            'TRABALHADOR_NOME': trabalhador.nome,
            'TRABALHADOR_DOC': trabalhador.documento,
            'TRABALHADOR_TIPO_DOC': trabalhador.tipo_documento,
            'TRABALHADOR_NIF': trabalhador.nif,
            'TRABALHADOR_DATA_NASCIMENTO': trabalhador.data_nascimento,
            'TRABALHADOR_NACIONALIDADE': trabalhador.nacionalidade,
            'TRABALHADOR_MORADA': trabalhador.morada,
            'TRABALHADOR_CIDADE': trabalhador.cidade,
            'TRABALHADOR_TELEFONE': trabalhador.telefone,
            'TRABALHADOR_EMAIL': trabalhador.email,
            'TRABALHADOR_FUNCAO': trabalhador.funcao,
            'TRABALHADOR_DEPARTAMENTO': trabalhador.departamento,
            'TRABALHADOR_IBAN': trabalhador.iban,

            // Contrato
            'DATA_ADMISSAO': trabalhador.data_admissao,
            'TIPO_CONTRATO': trabalhador.tipo_contrato,

            // Salários
            'SALARIO_BRUTO': this.formatarMoeda(trabalhador.salario_bruto),
            'SALARIO_LIQUIDO': this.formatarMoeda(trabalhador.salario_liquido),
            'SALARIO_BRUTO_EXTENSO': this.numeroExtenso(trabalhador.salario_bruto),
            'MOEDA': trabalhador.moeda || 'EUR',

            // Cálculos para recibos
            'TOTAL_VENCIMENTOS': this.formatarMoeda(parseFloat(trabalhador.salario_bruto) + 132),
            'DESCONTO_SS': this.formatarMoeda(parseFloat(trabalhador.salario_bruto) * 0.11),
            'DESCONTO_IRS': this.formatarMoeda(parseFloat(trabalhador.salario_bruto) - parseFloat(trabalhador.salario_liquido) - (parseFloat(trabalhador.salario_bruto) * 0.11)),
            'TOTAL_DESCONTOS': this.formatarMoeda(parseFloat(trabalhador.salario_bruto) - parseFloat(trabalhador.salario_liquido)),

            // Datas
            'DATA_ATUAL': this.formatarData(new Date()),
            'DATA_HORA_EMISSAO': this.formatarDataHora(new Date()),
            'MES_REFERENCIA': this.getMesReferencia(),
            'DATA_PAGAMENTO': this.getDataPagamento(),

            // Documento
            'DOCUMENTO_REF': storageHandler.gerarReferencia(),
        };

        if (this.debugMode) {
            console.log('📋 Placeholders construídos:', this.placeholders);
        }
    }

    // ========== MONTAR CONTEÚDO DO TYPE MODEL ==========

    montarTypeContent(contentConfig) {
        let html = contentConfig.titulo || '';

        if (contentConfig.corpo && Array.isArray(contentConfig.corpo)) {
            contentConfig.corpo.forEach(secao => {
                switch (secao.tipo) {
                    case 'paragrafo':
                        const classe = secao.classe || '';
                        html += `<p class="${classe}">${secao.texto}</p>`;
                        break;

                    case 'destaque':
                        html += `<div class="destaque">${secao.texto}</div>`;
                        break;

                    case 'tabela':
                        html += secao.html || '';
                        break;

                    case 'lista':
                        html += '<ul>';
                        secao.itens.forEach(item => {
                            html += `<li>${item}</li>`;
                        });
                        html += '</ul>';
                        break;

                    default:
                        html += `<div>${secao.texto || ''}</div>`;
                }
            });
        }

        return html;
    }

    // ========== SUBSTITUIR PLACEHOLDERS ==========

    substituirPlaceholders(html) {
        let resultado = html;

        // Substituir cada placeholder
        Object.keys(this.placeholders).forEach(key => {
            const regex = new RegExp(`\\{${key}\\}`, 'g');
            const valor = this.placeholders[key] || '';
            resultado = resultado.replace(regex, valor);
        });

        // Detectar placeholders não substituídos (debug)
        if (this.debugMode) {
            const naoSubstituidos = resultado.match(/\{[A-Z_]+\}/g);
            if (naoSubstituidos) {
                console.warn('⚠️ Placeholders não substituídos:', [...new Set(naoSubstituidos)]);
            }
        }

        return resultado;
    }

    // ========== FORMATADORES ==========

    formatarMoeda(valor) {
        const numero = parseFloat(valor);
        if (isNaN(numero)) return '0,00';
        return numero.toFixed(2).replace('.', ',').replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    }

    formatarData(data) {
        return new Date(data).toLocaleDateString('pt-PT', {
            day: '2-digit',
            month: 'long',
            year: 'numeric'
        });
    }

    formatarDataHora(data) {
        return new Date(data).toLocaleString('pt-PT', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    getMesReferencia() {
        const agora = new Date();
        return agora.toLocaleDateString('pt-PT', { month: 'long', year: 'numeric' });
    }

    getDataPagamento() {
        const agora = new Date();
        const ultimoDia = new Date(agora.getFullYear(), agora.getMonth() + 1, 0);
        return ultimoDia.toLocaleDateString('pt-PT');
    }

    numeroExtenso(valor) {
        // Simplificado - versão básica
        const numero = parseFloat(valor);
        if (isNaN(numero)) return 'Zero euros';

        const parteInteira = Math.floor(numero);
        
        // Conversão básica (pode ser expandida)
        if (parteInteira < 1000) {
            return `${parteInteira} euros`;
        } else if (parteInteira < 2000) {
            return `Mil e ${parteInteira - 1000} euros`;
        } else {
            const milhares = Math.floor(parteInteira / 1000);
            const resto = parteInteira % 1000;
            return `${milhares} mil e ${resto} euros`;
        }
    }

    // ========== UTILITÁRIOS ==========

    ativarDebug(ativo = true) {
        this.debugMode = ativo;
        console.log(`🔍 Debug mode: ${ativo ? 'ON' : 'OFF'}`);
    }

    getPlaceholders() {
        return { ...this.placeholders };
    }

    limparCache() {
        this.placeholders = {};
    }
}

// Exportar instância global
const modelBuilder = new ModelBuilder();
