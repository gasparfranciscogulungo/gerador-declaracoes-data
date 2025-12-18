/**
 * ============================================
 * LAYOUTS DE RECIBO DE VENCIMENTO - MÚLTIPLOS ESTILOS
 * 4 layouts profissionais com a mesma tipologia das declarações
 * ============================================
 * 
 * LAYOUTS DISPONÍVEIS:
 * 1. Formal      - Tradicional, estrutura clássica
 * 2. Moderno     - Design contemporâneo com faixa lateral
 * 3. Minimalista - Clean, elegante
 * 4. Executivo   - Corporativo robusto, completo
 * 
 * CÁLCULOS:
 * - Vencimento Bruto = Salário Base + Subsídios
 * - INSS = 3% do Bruto
 * - IRT = Configurável (padrão 18%)
 * - Líquido = Bruto - (INSS + IRT + Outros)
 * 
 * DATA DE PAGAMENTO:
 * - Empresas pagam entre dia 1 e 15 do mês seguinte
 * - Lógica automática: se mês referência = Dezembro, pagamento = Janeiro do ano seguinte
 */

const ModelosRecibo = {
    
    // ==========================================
    // UTILITÁRIOS COMUNS
    // ==========================================
    
    /**
     * Formata data para português de Portugal (extenso)
     */
    _formatarData(data) {
        if (!data) return 'N/D';
        return new Date(data).toLocaleDateString('pt-PT', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
    },
    
    /**
     * Formata período no formato YYYY/MM
     */
    _formatarPeriodo(data) {
        if (!data) return 'N/D';
        const d = new Date(data);
        return `${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, '0')}`;
    },

    /**
     * Calcula e formata a Data de Pagamento
     * Lógica: Empresas pagam entre dia 1 e 15 do mês seguinte ao mês de referência
     */
    _calcularDataPagamento(mesReferencia, diaPagamento = null) {
        const refDate = mesReferencia ? new Date(mesReferencia + '-01') : new Date();
        
        // Mês seguinte ao mês de referência
        const mesPagamento = new Date(refDate);
        mesPagamento.setMonth(mesPagamento.getMonth() + 1);
        
        // Dia de pagamento (padrão: dia 8, mas pode ser 1-15)
        const dia = diaPagamento || 8;
        mesPagamento.setDate(Math.min(dia, 15)); // Máximo dia 15
        
        return {
            ano: mesPagamento.getFullYear(),
            mes: String(mesPagamento.getMonth() + 1).padStart(2, '0'),
            dia: String(mesPagamento.getDate()).padStart(2, '0'),
            formatado: `${mesPagamento.getFullYear()}/${String(mesPagamento.getMonth() + 1).padStart(2, '0')}/${String(mesPagamento.getDate()).padStart(2, '0')}`,
            extenso: this._formatarData(mesPagamento)
        };
    },

    /**
     * Gera texto da data de processamento (editável)
     * Formato: "Luanda aos XX de XXXX de XXXX"
     */
    _gerarTextoDataProcessamento(config, empresa) {
        // Se há texto personalizado, usar
        if (config.textoDataProcessamento) {
            return config.textoDataProcessamento;
        }
        
        // Gerar automático
        const cidade = empresa.endereco?.municipio || 'Luanda';
        const dataAtual = new Date();
        const dataFormatada = this._formatarData(dataAtual);
        
        return `${cidade} aos ${dataFormatada}`;
    },

    /**
     * Retorna nome do mês
     */
    _nomeMes(data) {
        if (!data) return 'N/D';
        return new Date(data).toLocaleDateString('pt-PT', { month: 'long', year: 'numeric' });
    },
    
    /**
     * Formata valor monetário
     */
    _formatarValor(valor) {
        const num = parseFloat(valor) || 0;
        return new Intl.NumberFormat('pt-PT', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(num);
    },
    
    /**
     * Retorna a cor profissional
     */
    _corProfissional(empresa, config) {
        if (config.corDestaque && config.corDestaque !== '#7c3aed' && config.corDestaque !== '#059669') {
            return config.corDestaque;
        }
        if (empresa.corPrimaria) {
            return empresa.corPrimaria;
        }
        return '#1a365d'; // Azul escuro profissional padrão
    },
    
    /**
     * Calcula subsídios automáticos baseado no salário
     * Lógica: Percentagem varia conforme faixa salarial
     */
    _calcularSubsidiosAutomaticos(salarioBase) {
        let percAlimentacao, percTransporte;
        
        if (salarioBase < 100000) {
            percAlimentacao = 8;
            percTransporte = 5;
        } else if (salarioBase <= 300000) {
            percAlimentacao = 10;
            percTransporte = 6;
        } else if (salarioBase <= 500000) {
            percAlimentacao = 12;
            percTransporte = 8;
        } else {
            percAlimentacao = 15;
            percTransporte = 10;
        }
        
        // Calcular valores (arredondados para valores "partidos" mais realistas)
        let alimentacao = Math.round(salarioBase * percAlimentacao / 100);
        let transporte = Math.round(salarioBase * percTransporte / 100);
        
        // Arredondar para centenas para parecer mais realista
        alimentacao = Math.round(alimentacao / 100) * 100;
        transporte = Math.round(transporte / 100) * 100;
        
        return {
            alimentacao,
            transporte,
            percAlimentacao,
            percTransporte
        };
    },

    /**
     * Calcula os valores do recibo
     * Usa valores do cliente ou calcula automaticamente
     */
    _calcularRecibo(cliente, config = {}) {
        const salarioBase = parseFloat(cliente.salario_base) || parseFloat(cliente.salario) || 0;
        
        // Subsídios: usar do config (editado), do cliente, ou calcular automaticamente
        let subsidioAlimentacao, subsidioTransporte;
        
        // Verificar se há valores editados no config (preview)
        if (config.subsidioAlimentacao !== undefined && config.subsidioAlimentacao !== null) {
            subsidioAlimentacao = parseFloat(config.subsidioAlimentacao);
        } else if (cliente.subsidio_alimentacao && parseFloat(cliente.subsidio_alimentacao) > 0) {
            subsidioAlimentacao = parseFloat(cliente.subsidio_alimentacao);
        } else {
            // Calcular automaticamente
            const auto = this._calcularSubsidiosAutomaticos(salarioBase);
            subsidioAlimentacao = auto.alimentacao;
        }
        
        if (config.subsidioTransporte !== undefined && config.subsidioTransporte !== null) {
            subsidioTransporte = parseFloat(config.subsidioTransporte);
        } else if (cliente.subsidio_transporte && parseFloat(cliente.subsidio_transporte) > 0) {
            subsidioTransporte = parseFloat(cliente.subsidio_transporte);
        } else {
            // Calcular automaticamente
            const auto = this._calcularSubsidiosAutomaticos(salarioBase);
            subsidioTransporte = auto.transporte;
        }
        
        // Taxa IRT configurável (padrão 18%)
        const taxaIRT = parseFloat(config.irtPercentagem) || parseFloat(config.taxaIRT) || 18;
        const taxaINSS = 3; // Fixo 3%
        
        // Vencimento Bruto = Base + Subsídios
        const bruto = salarioBase + subsidioAlimentacao + subsidioTransporte;
        
        // Descontos
        const inss = Math.round(bruto * (taxaINSS / 100));
        const irt = Math.round(bruto * (taxaIRT / 100));
        const outrosDescontos = parseFloat(config.outrosDescontos) || 0;
        const totalDescontos = inss + irt + outrosDescontos;
        
        // Líquido = Bruto - Descontos
        const liquido = bruto - totalDescontos;
        
        return {
            salarioBase,
            subsidioAlimentacao,
            subsidioTransporte,
            bruto,
            taxaINSS,
            taxaIRT,
            inss,
            irt,
            outrosDescontos,
            totalDescontos,
            liquido
        };
    },
    
    /**
     * Gera array de meses para recibos múltiplos
     */
    _gerarMeses(config = {}) {
        const meses = [];
        const quantidade = parseInt(config.quantidadeMeses) || 1;
        const mesSelecionado = config.mesSelecionado ? new Date(config.mesSelecionado) : new Date();
        
        for (let i = 0; i < quantidade; i++) {
            const data = new Date(mesSelecionado);
            data.setMonth(data.getMonth() - i);
            meses.push(data);
        }
        
        return meses;
    },
    
    // ==========================================
    // LAYOUT 1: EXECUTIVO (Corporativo - Baseado na imagem)
    // ==========================================
    
    executivo: {
        nome: 'Executivo',
        descricao: 'Layout corporativo profissional',
        
        renderizar(empresa, cliente, config = {}) {
            const utils = ModelosRecibo;
            const calc = utils._calcularRecibo(cliente, config);
            const corDestaque = utils._corProfissional(empresa, config);
            
            // Mês de referência (do config ou mês anterior)
            const mesRef = config.mesReferencia || new Date().toISOString().slice(0, 7);
            const mesRefDate = new Date(mesRef + '-01');
            const periodoFormatado = utils._formatarPeriodo(mesRefDate);
            
            // Data de pagamento (dia 1-15 do mês seguinte)
            const diaPagamento = config.diaPagamento || 8;
            const dataPagamento = utils._calcularDataPagamento(mesRef, diaPagamento);
            
            // Data de admissão
            const dataAdmissao = utils._formatarData(cliente.data_admissao || cliente.dataAdmissao);
            
            // Texto da data de processamento (editável)
            const textoDataProcessamento = utils._gerarTextoDataProcessamento(config, empresa);
            
            const cfg = {
                fontFamily: config.fontFamily || 'Arial, Helvetica, sans-serif',
                fontSize: config.fontSize || 10,
                corTexto: config.corTexto || '#1a1a1a',
                cabecalhoLogoSize: config.cabecalhoLogoSize || 80,
                carimboWidth: config.carimboWidth || 150,
                carimboHeight: config.carimboHeight || 120
            };
            
            return `
                <div style="
                    font-family: ${cfg.fontFamily};
                    font-size: ${cfg.fontSize}pt;
                    color: ${cfg.corTexto};
                    width: 210mm;
                    height: 297mm;
                    padding: 12mm 15mm;
                    background: white;
                    position: relative;
                    box-sizing: border-box;
                    margin: 0 auto;
                    overflow: hidden;
                ">
                    <!-- CABEÇALHO DA EMPRESA -->
                    <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 15px; padding-bottom: 10px; border-bottom: 2px solid ${corDestaque};">
                        <div style="flex: 1;">
                            <h1 style="font-size: 14pt; font-weight: bold; color: ${corDestaque}; margin: 0 0 5px 0;">${empresa.nome}</h1>
                            <p style="font-size: 9pt; margin: 2px 0; color: #444;">NIF/CC: ${empresa.nif}</p>
                            <p style="font-size: 8pt; margin: 2px 0; color: #666;">Sede: ${empresa.endereco?.completo || empresa.endereco?.rua || 'Luanda – Angola'}</p>
                            <p style="font-size: 8pt; margin: 2px 0; color: #666;">${empresa.endereco?.municipio || 'Luanda'} — Angola</p>
                        </div>
                        ${empresa.logo ? `
                            <img src="${empresa.logo}" 
                                 alt="Logo" 
                                 crossorigin="anonymous"
                                 style="max-width: ${cfg.cabecalhoLogoSize}px; max-height: ${cfg.cabecalhoLogoSize}px; object-fit: contain;">
                        ` : ''}
                    </div>
                    
                    <!-- DADOS DO COLABORADOR -->
                    <div style="display: flex; gap: 20px; margin-bottom: 15px;">
                        <div style="flex: 1; border: 1px solid #ddd; padding: 12px; border-radius: 4px;">
                            <p style="margin: 4px 0;"><strong>Nome:</strong> ${cliente.nome}</p>
                            <p style="margin: 4px 0;"><strong>B.I nº:</strong> ${cliente.documento || cliente.bi || cliente.nif || 'N/D'}</p>
                            <p style="margin: 4px 0;"><strong>Data de Admissão:</strong> ${dataAdmissao}</p>
                            <p style="margin: 4px 0;"><strong>Função:</strong> ${cliente.funcao || cliente.cargo || 'N/D'}</p>
                            <p style="margin: 4px 0;"><strong>Data de Pagamento:</strong> ${dataPagamento.formatado}</p>
                            <p style="margin: 4px 0;"><strong>Local de Trabalho:</strong> ${cliente.local_trabalho || 'Sede'}</p>
                        </div>
                    </div>
                    
                    <!-- TÍTULO -->
                    <h2 style="font-size: 12pt; font-weight: normal; margin: 20px 0 15px 0; border-bottom: 1px solid #ccc; padding-bottom: 5px;">Recibo de Vencimento</h2>
                    
                    <!-- TABELA DE RUBRICAS -->
                    <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 9pt;">
                        <thead>
                            <tr style="background: ${corDestaque}; color: white;">
                                <th style="padding: 8px; text-align: left; border: 1px solid ${corDestaque};">Discrição de Rubricas</th>
                                <th style="padding: 8px; text-align: center; border: 1px solid ${corDestaque};">Período</th>
                                <th style="padding: 8px; text-align: right; border: 1px solid ${corDestaque};">Valor base</th>
                                <th style="padding: 8px; text-align: center; border: 1px solid ${corDestaque};">Taxa</th>
                                <th style="padding: 8px; text-align: right; border: 1px solid ${corDestaque};">Pagamento</th>
                                <th style="padding: 8px; text-align: right; border: 1px solid ${corDestaque};">Desconto</th>
                            </tr>
                        </thead>
                        <tbody>
                            <!-- PAGAMENTOS -->
                            <tr style="background: #f8f9fa;">
                                <td colspan="6" style="padding: 6px 8px; font-weight: bold; border: 1px solid #ddd;">Pagamentos</td>
                            </tr>
                            <tr>
                                <td style="padding: 6px 8px; border: 1px solid #ddd;">Vencimento Base</td>
                                <td style="padding: 6px 8px; text-align: center; border: 1px solid #ddd;">${periodoFormatado}</td>
                                <td style="padding: 6px 8px; text-align: right; border: 1px solid #ddd;">${utils._formatarValor(calc.salarioBase)}</td>
                                <td style="padding: 6px 8px; text-align: center; border: 1px solid #ddd;"></td>
                                <td style="padding: 6px 8px; text-align: right; border: 1px solid #ddd;"></td>
                                <td style="padding: 6px 8px; text-align: right; border: 1px solid #ddd;"></td>
                            </tr>
                            ${calc.subsidioAlimentacao > 0 ? `
                            <tr>
                                <td style="padding: 6px 8px; border: 1px solid #ddd;">Sub. Alimentação</td>
                                <td style="padding: 6px 8px; text-align: center; border: 1px solid #ddd;">${periodoFormatado}</td>
                                <td style="padding: 6px 8px; text-align: right; border: 1px solid #ddd;">${utils._formatarValor(calc.subsidioAlimentacao)}</td>
                                <td style="padding: 6px 8px; text-align: center; border: 1px solid #ddd;"></td>
                                <td style="padding: 6px 8px; text-align: right; border: 1px solid #ddd;"></td>
                                <td style="padding: 6px 8px; text-align: right; border: 1px solid #ddd;"></td>
                            </tr>
                            ` : ''}
                            ${calc.subsidioTransporte > 0 ? `
                            <tr>
                                <td style="padding: 6px 8px; border: 1px solid #ddd;">Sub. De Transporte</td>
                                <td style="padding: 6px 8px; text-align: center; border: 1px solid #ddd;">${periodoFormatado}</td>
                                <td style="padding: 6px 8px; text-align: right; border: 1px solid #ddd;">${utils._formatarValor(calc.subsidioTransporte)}</td>
                                <td style="padding: 6px 8px; text-align: center; border: 1px solid #ddd;"></td>
                                <td style="padding: 6px 8px; text-align: right; border: 1px solid #ddd;"></td>
                                <td style="padding: 6px 8px; text-align: right; border: 1px solid #ddd;"></td>
                            </tr>
                            ` : ''}
                            
                            <!-- DESCONTOS -->
                            <tr style="background: #f8f9fa;">
                                <td colspan="6" style="padding: 6px 8px; font-weight: bold; border: 1px solid #ddd;">Descontos</td>
                            </tr>
                            <tr>
                                <td style="padding: 6px 8px; border: 1px solid #ddd;">Vencimento Bruto</td>
                                <td style="padding: 6px 8px; text-align: center; border: 1px solid #ddd;"></td>
                                <td style="padding: 6px 8px; text-align: right; border: 1px solid #ddd;">${utils._formatarValor(calc.bruto)}</td>
                                <td style="padding: 6px 8px; text-align: center; border: 1px solid #ddd;"></td>
                                <td style="padding: 6px 8px; text-align: right; border: 1px solid #ddd;"></td>
                                <td style="padding: 6px 8px; text-align: right; border: 1px solid #ddd;"></td>
                            </tr>
                            <tr>
                                <td style="padding: 6px 8px; border: 1px solid #ddd;">INSS</td>
                                <td style="padding: 6px 8px; text-align: center; border: 1px solid #ddd;"></td>
                                <td style="padding: 6px 8px; text-align: right; border: 1px solid #ddd;">${utils._formatarValor(calc.inss)}</td>
                                <td style="padding: 6px 8px; text-align: center; border: 1px solid #ddd;">${calc.taxaINSS}%</td>
                                <td style="padding: 6px 8px; text-align: right; border: 1px solid #ddd;"></td>
                                <td style="padding: 6px 8px; text-align: right; border: 1px solid #ddd; color: #c00;">${utils._formatarValor(calc.totalDescontos)}</td>
                            </tr>
                            <tr>
                                <td style="padding: 6px 8px; border: 1px solid #ddd;">IRT</td>
                                <td style="padding: 6px 8px; text-align: center; border: 1px solid #ddd;"></td>
                                <td style="padding: 6px 8px; text-align: right; border: 1px solid #ddd;">${utils._formatarValor(calc.irt)}</td>
                                <td style="padding: 6px 8px; text-align: center; border: 1px solid #ddd;">${calc.taxaIRT}%</td>
                                <td style="padding: 6px 8px; text-align: right; border: 1px solid #ddd;"></td>
                                <td style="padding: 6px 8px; text-align: right; border: 1px solid #ddd;"></td>
                            </tr>
                            ${calc.outrosDescontos > 0 ? `
                            <tr>
                                <td style="padding: 6px 8px; border: 1px solid #ddd;">Outros Descontos</td>
                                <td style="padding: 6px 8px; text-align: center; border: 1px solid #ddd;"></td>
                                <td style="padding: 6px 8px; text-align: right; border: 1px solid #ddd;">${utils._formatarValor(calc.outrosDescontos)}</td>
                                <td style="padding: 6px 8px; text-align: center; border: 1px solid #ddd;"></td>
                                <td style="padding: 6px 8px; text-align: right; border: 1px solid #ddd;"></td>
                                <td style="padding: 6px 8px; text-align: right; border: 1px solid #ddd;"></td>
                            </tr>
                            ` : ''}
                            
                            <!-- OBSERVAÇÕES E TOTAIS -->
                            <tr>
                                <td style="padding: 8px; border: 1px solid #ddd; vertical-align: top;" rowspan="3">
                                    <strong>Observações:</strong><br>
                                    <span style="font-size: 8pt; color: #666;">${config.observacoes || ''}</span>
                                </td>
                                <td colspan="4" style="padding: 8px; text-align: right; border: 1px solid #ddd; font-weight: bold;">Total</td>
                                <td style="padding: 8px; text-align: right; border: 1px solid #ddd;"></td>
                            </tr>
                            <tr>
                                <td colspan="4" style="padding: 8px; text-align: right; border: 1px solid #ddd;">Bruto: <strong>${utils._formatarValor(calc.bruto)}</strong></td>
                                <td style="padding: 8px; text-align: right; border: 1px solid #ddd;"></td>
                            </tr>
                        </tbody>
                    </table>
                    
                    <!-- RODAPÉ: DATA + DIRECÇÃO + CARIMBO -->
                    <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-top: 25px;">
                        <!-- LADO ESQUERDO: Data + Direcção + Carimbo -->
                        <div>
                            <p style="margin: 0 0 15px 0; font-size: 10pt;">${textoDataProcessamento}</p>
                            
                            <p style="margin: 0 0 10px 0; font-size: 10pt; font-weight: bold;">A Direcção</p>
                            
                            <!-- CARIMBO DA EMPRESA (com assinatura) -->
                            <div style="margin-top: 5px;">
                                ${empresa.carimbo ? `
                                    <img src="${empresa.carimbo}" 
                                         alt="Carimbo" 
                                         crossorigin="anonymous"
                                         style="max-width: ${cfg.carimboWidth}px; max-height: ${cfg.carimboHeight}px; object-fit: contain;">
                                ` : `
                                    <div style="width: 150px; height: 60px; border: 1px dashed #ccc; display: flex; align-items: center; justify-content: center;">
                                        <span style="font-size: 8pt; color: #999;">Carimbo</span>
                                    </div>
                                `}
                            </div>
                        </div>
                        
                        <!-- LADO DIREITO: Totais -->
                        <div style="text-align: right;">
                            <p style="margin: 5px 0; font-size: 11pt;"><strong>Total</strong></p>
                            <p style="margin: 5px 0; font-size: 13pt; color: ${corDestaque};"><strong>Líquido: ${utils._formatarValor(calc.liquido)}</strong></p>
                        </div>
                    </div>
                </div>
            `;
        }
    },
    
    // ==========================================
    // LAYOUT 2: FORMAL (Tradicional)
    // ==========================================
    
    formal: {
        nome: 'Formal',
        descricao: 'Layout tradicional com borda decorativa',
        
        renderizar(empresa, cliente, config = {}) {
            const utils = ModelosRecibo;
            const calc = utils._calcularRecibo(cliente, config);
            const corDestaque = utils._corProfissional(empresa, config);
            
            // Mês de referência (do config ou mês anterior)
            const mesRef = config.mesReferencia || new Date().toISOString().slice(0, 7);
            const mesRefDate = new Date(mesRef + '-01');
            const periodoFormatado = utils._formatarPeriodo(mesRefDate);
            
            // Data de pagamento (dia 1-15 do mês seguinte)
            const diaPagamento = config.diaPagamento || 8;
            const dataPagamento = utils._calcularDataPagamento(mesRef, diaPagamento);
            
            // Data de admissão
            const dataAdmissao = utils._formatarData(cliente.data_admissao || cliente.dataAdmissao);
            
            // Texto da data de processamento (editável)
            const textoDataProcessamento = utils._gerarTextoDataProcessamento(config, empresa);
            
            const cfg = {
                fontFamily: config.fontFamily || 'Arial, Helvetica, sans-serif',
                fontSize: config.fontSize || 10,
                corTexto: config.corTexto || '#1a1a1a',
                cabecalhoLogoSize: config.cabecalhoLogoSize || 70,
                carimboWidth: config.carimboWidth || 140,
                carimboHeight: config.carimboHeight || 110
            };
            
            return `
                <div style="
                    font-family: ${cfg.fontFamily};
                    font-size: ${cfg.fontSize}pt;
                    color: ${cfg.corTexto};
                    width: 210mm;
                    height: 297mm;
                    background: white;
                    position: relative;
                    box-sizing: border-box;
                    margin: 0 auto;
                    overflow: hidden;
                ">
                    <!-- BORDA SUPERIOR -->
                    <div style="height: 5px; background: linear-gradient(90deg, ${corDestaque} 0%, ${corDestaque}cc 100%);"></div>
                    
                    <div style="padding: 15mm 18mm;">
                        <!-- CABEÇALHO -->
                        <div style="display: flex; align-items: flex-start; margin-bottom: 20px; padding-bottom: 15px; border-bottom: 1px solid #e0e0e0;">
                            ${empresa.logo ? `
                                <img src="${empresa.logo}" 
                                     alt="Logo" 
                                     crossorigin="anonymous"
                                     style="max-width: ${cfg.cabecalhoLogoSize}px; max-height: ${cfg.cabecalhoLogoSize}px; object-fit: contain; margin-right: 20px;">
                            ` : ''}
                            <div style="flex: 1;">
                                <h1 style="font-size: 14pt; font-weight: 700; color: ${corDestaque}; margin: 0 0 6px 0;">${empresa.nome}</h1>
                                <p style="font-size: 9pt; margin: 2px 0; color: #444;">NIF: ${empresa.nif}</p>
                                <p style="font-size: 8pt; margin: 2px 0; color: #666;">${empresa.endereco?.completo || 'Luanda – Angola'}</p>
                            </div>
                        </div>
                        
                        <!-- TÍTULO -->
                        <div style="text-align: center; margin: 25px 0;">
                            <h2 style="font-size: 16pt; font-weight: bold; color: ${corDestaque}; margin: 0; text-transform: uppercase; letter-spacing: 2px;">Recibo de Vencimento</h2>
                            <p style="font-size: 10pt; color: #666; margin-top: 5px;">Período: ${utils._nomeMes(mesRefDate)}</p>
                        </div>
                        
                        <!-- DADOS DO COLABORADOR -->
                        <div style="background: #f8f9fa; padding: 15px; border-radius: 6px; margin-bottom: 20px;">
                            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
                                <p style="margin: 4px 0;"><strong>Nome:</strong> ${cliente.nome}</p>
                                <p style="margin: 4px 0;"><strong>B.I nº:</strong> ${cliente.documento || cliente.bi || cliente.nif || 'N/D'}</p>
                                <p style="margin: 4px 0;"><strong>Função:</strong> ${cliente.funcao || cliente.cargo || 'N/D'}</p>
                                <p style="margin: 4px 0;"><strong>Data de Admissão:</strong> ${dataAdmissao}</p>
                                <p style="margin: 4px 0;"><strong>Data de Pagamento:</strong> ${dataPagamento.formatado}</p>
                                <p style="margin: 4px 0;"><strong>Local de Trabalho:</strong> ${cliente.local_trabalho || 'Sede'}</p>
                            </div>
                        </div>
                        
                        <!-- TABELA SIMPLIFICADA -->
                        <table style="width: 100%; border-collapse: collapse; margin-bottom: 25px; font-size: 9pt;">
                            <thead>
                                <tr style="background: ${corDestaque}; color: white;">
                                    <th style="padding: 10px; text-align: left;">Descrição</th>
                                    <th style="padding: 10px; text-align: right;">Valor (Kz)</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr style="background: #f0f0f0;">
                                    <td colspan="2" style="padding: 8px; font-weight: bold;">RENDIMENTOS</td>
                                </tr>
                                <tr>
                                    <td style="padding: 8px; border-bottom: 1px solid #eee;">Vencimento Base</td>
                                    <td style="padding: 8px; text-align: right; border-bottom: 1px solid #eee;">${utils._formatarValor(calc.salarioBase)}</td>
                                </tr>
                                ${calc.subsidioAlimentacao > 0 ? `
                                <tr>
                                    <td style="padding: 8px; border-bottom: 1px solid #eee;">Subsídio de Alimentação</td>
                                    <td style="padding: 8px; text-align: right; border-bottom: 1px solid #eee;">${utils._formatarValor(calc.subsidioAlimentacao)}</td>
                                </tr>
                                ` : ''}
                                ${calc.subsidioTransporte > 0 ? `
                                <tr>
                                    <td style="padding: 8px; border-bottom: 1px solid #eee;">Subsídio de Transporte</td>
                                    <td style="padding: 8px; text-align: right; border-bottom: 1px solid #eee;">${utils._formatarValor(calc.subsidioTransporte)}</td>
                                </tr>
                                ` : ''}
                                <tr style="background: #e8f4e8;">
                                    <td style="padding: 10px; font-weight: bold;">TOTAL BRUTO</td>
                                    <td style="padding: 10px; text-align: right; font-weight: bold;">${utils._formatarValor(calc.bruto)}</td>
                                </tr>
                                
                                <tr style="background: #f0f0f0;">
                                    <td colspan="2" style="padding: 8px; font-weight: bold;">DESCONTOS</td>
                                </tr>
                                <tr>
                                    <td style="padding: 8px; border-bottom: 1px solid #eee;">INSS (${calc.taxaINSS}%)</td>
                                    <td style="padding: 8px; text-align: right; border-bottom: 1px solid #eee; color: #c00;">- ${utils._formatarValor(calc.inss)}</td>
                                </tr>
                                <tr>
                                    <td style="padding: 8px; border-bottom: 1px solid #eee;">IRT (${calc.taxaIRT}%)</td>
                                    <td style="padding: 8px; text-align: right; border-bottom: 1px solid #eee; color: #c00;">- ${utils._formatarValor(calc.irt)}</td>
                                </tr>
                                ${calc.outrosDescontos > 0 ? `
                                <tr>
                                    <td style="padding: 8px; border-bottom: 1px solid #eee;">Outros Descontos</td>
                                    <td style="padding: 8px; text-align: right; border-bottom: 1px solid #eee; color: #c00;">- ${utils._formatarValor(calc.outrosDescontos)}</td>
                                </tr>
                                ` : ''}
                                <tr style="background: #fee;">
                                    <td style="padding: 10px; font-weight: bold;">TOTAL DESCONTOS</td>
                                    <td style="padding: 10px; text-align: right; font-weight: bold; color: #c00;">- ${utils._formatarValor(calc.totalDescontos)}</td>
                                </tr>
                                
                                <tr style="background: ${corDestaque}; color: white;">
                                    <td style="padding: 12px; font-weight: bold; font-size: 11pt;">VALOR LÍQUIDO</td>
                                    <td style="padding: 12px; text-align: right; font-weight: bold; font-size: 12pt;">${utils._formatarValor(calc.liquido)}</td>
                                </tr>
                            </tbody>
                        </table>
                        
                        <!-- RODAPÉ: DATA + DIRECÇÃO + CARIMBO -->
                        <div style="margin-top: 30px;">
                            <p style="margin: 0 0 15px 0; font-size: 10pt;">${textoDataProcessamento}</p>
                            
                            <p style="margin: 0 0 10px 0; font-size: 10pt; font-weight: bold;">A Direcção</p>
                            
                            <!-- CARIMBO DA EMPRESA -->
                            <div style="margin-top: 5px;">
                                ${empresa.carimbo ? `
                                    <img src="${empresa.carimbo}" 
                                         alt="Carimbo" 
                                         crossorigin="anonymous"
                                         style="max-width: ${cfg.carimboWidth}px; max-height: ${cfg.carimboHeight}px; object-fit: contain;">
                                ` : `
                                    <div style="width: 150px; height: 60px; border: 1px dashed #ccc; display: flex; align-items: center; justify-content: center;">
                                        <span style="font-size: 8pt; color: #999;">Carimbo</span>
                                    </div>
                                `}
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }
    },
    
    // ==========================================
    // LAYOUT 3: MODERNO (Faixa lateral)
    // ==========================================
    
    moderno: {
        nome: 'Moderno',
        descricao: 'Design contemporâneo com faixa lateral',
        
        renderizar(empresa, cliente, config = {}) {
            const utils = ModelosRecibo;
            const calc = utils._calcularRecibo(cliente, config);
            const corDestaque = utils._corProfissional(empresa, config);
            
            // Mês de referência (do config ou mês anterior)
            const mesRef = config.mesReferencia || new Date().toISOString().slice(0, 7);
            const mesRefDate = new Date(mesRef + '-01');
            const periodoFormatado = utils._formatarPeriodo(mesRefDate);
            
            // Data de pagamento (dia 1-15 do mês seguinte)
            const diaPagamento = config.diaPagamento || 8;
            const dataPagamento = utils._calcularDataPagamento(mesRef, diaPagamento);
            
            // Data de admissão
            const dataAdmissao = utils._formatarData(cliente.data_admissao || cliente.dataAdmissao);
            
            // Texto da data de processamento (editável)
            const textoDataProcessamento = utils._gerarTextoDataProcessamento(config, empresa);
            
            const cfg = {
                fontFamily: config.fontFamily || 'Arial, Helvetica, sans-serif',
                fontSize: config.fontSize || 10,
                corTexto: config.corTexto || '#1a1a1a',
                cabecalhoLogoSize: config.cabecalhoLogoSize || 60,
                carimboWidth: config.carimboWidth || 130,
                carimboHeight: config.carimboHeight || 100
            };
            
            return `
                <div style="
                    font-family: ${cfg.fontFamily};
                    font-size: ${cfg.fontSize}pt;
                    color: ${cfg.corTexto};
                    width: 210mm;
                    height: 297mm;
                    background: white;
                    position: relative;
                    box-sizing: border-box;
                    margin: 0 auto;
                    overflow: hidden;
                    display: flex;
                ">
                    <!-- FAIXA LATERAL -->
                    <div style="
                        width: 10mm;
                        background: linear-gradient(180deg, ${corDestaque} 0%, ${corDestaque}dd 100%);
                        flex-shrink: 0;
                    "></div>
                    
                    <!-- CONTEÚDO -->
                    <div style="flex: 1; padding: 15mm 18mm 15mm 12mm;">
                        
                        <!-- CABEÇALHO -->
                        <div style="display: flex; align-items: flex-start; margin-bottom: 20px;">
                            ${empresa.logo ? `
                                <img src="${empresa.logo}" 
                                     alt="Logo" 
                                     crossorigin="anonymous"
                                     style="max-width: ${cfg.cabecalhoLogoSize}px; max-height: ${cfg.cabecalhoLogoSize}px; object-fit: contain; margin-right: 15px;">
                            ` : ''}
                            <div>
                                <h1 style="font-size: 14pt; font-weight: 700; color: ${corDestaque}; margin: 0 0 4px 0;">${empresa.nome}</h1>
                                <p style="font-size: 8pt; margin: 2px 0; color: #555;">NIF: ${empresa.nif}</p>
                                <p style="font-size: 8pt; margin: 2px 0; color: #666;">${empresa.endereco?.municipio || 'Luanda'}, Angola</p>
                            </div>
                        </div>
                        
                        <!-- TÍTULO -->
                        <div style="margin: 25px 0 20px 0;">
                            <h2 style="font-size: 22pt; font-weight: 300; color: ${corDestaque}; margin: 0; letter-spacing: 2px; text-transform: uppercase;">Recibo de Vencimento</h2>
                            <div style="width: 50px; height: 3px; background: ${corDestaque}; margin-top: 8px;"></div>
                        </div>
                        
                        <!-- DADOS EM CARDS -->
                        <div style="display: flex; gap: 15px; margin-bottom: 20px;">
                            <div style="flex: 1; background: #f8f9fa; border-left: 3px solid ${corDestaque}; padding: 12px;">
                                <p style="font-size: 8pt; color: #888; margin: 0 0 3px 0; text-transform: uppercase;">Colaborador</p>
                                <p style="font-size: 11pt; font-weight: 600; color: ${corDestaque}; margin: 0;">${cliente.nome}</p>
                            </div>
                            <div style="background: #f8f9fa; border-left: 3px solid ${corDestaque}; padding: 12px;">
                                <p style="font-size: 8pt; color: #888; margin: 0 0 3px 0; text-transform: uppercase;">Período</p>
                                <p style="font-size: 11pt; font-weight: 600; margin: 0;">${utils._nomeMes(mesRefDate)}</p>
                            </div>
                        </div>
                        
                        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin-bottom: 20px; font-size: 9pt;">
                            <div><strong>B.I nº:</strong> ${cliente.documento || cliente.bi || cliente.nif || 'N/D'}</div>
                            <div><strong>Função:</strong> ${cliente.funcao || cliente.cargo || 'N/D'}</div>
                            <div><strong>Data de Admissão:</strong> ${dataAdmissao}</div>
                            <div><strong>Data de Pagamento:</strong> ${dataPagamento.formatado}</div>
                            <div><strong>Local de Trabalho:</strong> ${cliente.local_trabalho || 'Sede'}</div>
                        </div>
                        
                        <!-- TABELA COMPACTA -->
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 25px;">
                            <!-- RENDIMENTOS -->
                            <div>
                                <h4 style="font-size: 10pt; color: ${corDestaque}; margin: 0 0 10px 0; padding-bottom: 5px; border-bottom: 2px solid ${corDestaque};">Rendimentos</h4>
                                <div style="space-y: 5px;">
                                    <div style="display: flex; justify-content: space-between; padding: 6px 0; border-bottom: 1px solid #eee;">
                                        <span>Vencimento Base</span>
                                        <strong>${utils._formatarValor(calc.salarioBase)}</strong>
                                    </div>
                                    ${calc.subsidioAlimentacao > 0 ? `
                                    <div style="display: flex; justify-content: space-between; padding: 6px 0; border-bottom: 1px solid #eee;">
                                        <span>Sub. Alimentação</span>
                                        <strong>${utils._formatarValor(calc.subsidioAlimentacao)}</strong>
                                    </div>
                                    ` : ''}
                                    ${calc.subsidioTransporte > 0 ? `
                                    <div style="display: flex; justify-content: space-between; padding: 6px 0; border-bottom: 1px solid #eee;">
                                        <span>Sub. Transporte</span>
                                        <strong>${utils._formatarValor(calc.subsidioTransporte)}</strong>
                                    </div>
                                    ` : ''}
                                    <div style="display: flex; justify-content: space-between; padding: 8px 0; background: #e8f4e8; margin-top: 5px;">
                                        <strong>Total Bruto</strong>
                                        <strong style="color: #080;">${utils._formatarValor(calc.bruto)}</strong>
                                    </div>
                                </div>
                            </div>
                            
                            <!-- DESCONTOS -->
                            <div>
                                <h4 style="font-size: 10pt; color: #c00; margin: 0 0 10px 0; padding-bottom: 5px; border-bottom: 2px solid #c00;">Descontos</h4>
                                <div style="space-y: 5px;">
                                    <div style="display: flex; justify-content: space-between; padding: 6px 0; border-bottom: 1px solid #eee;">
                                        <span>INSS (${calc.taxaINSS}%)</span>
                                        <strong style="color: #c00;">- ${utils._formatarValor(calc.inss)}</strong>
                                    </div>
                                    <div style="display: flex; justify-content: space-between; padding: 6px 0; border-bottom: 1px solid #eee;">
                                        <span>IRT (${calc.taxaIRT}%)</span>
                                        <strong style="color: #c00;">- ${utils._formatarValor(calc.irt)}</strong>
                                    </div>
                                    ${calc.outrosDescontos > 0 ? `
                                    <div style="display: flex; justify-content: space-between; padding: 6px 0; border-bottom: 1px solid #eee;">
                                        <span>Outros</span>
                                        <strong style="color: #c00;">- ${utils._formatarValor(calc.outrosDescontos)}</strong>
                                    </div>
                                    ` : ''}
                                    <div style="display: flex; justify-content: space-between; padding: 8px 0; background: #fee; margin-top: 5px;">
                                        <strong>Total Descontos</strong>
                                        <strong style="color: #c00;">- ${utils._formatarValor(calc.totalDescontos)}</strong>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <!-- LÍQUIDO DESTACADO -->
                        <div style="background: ${corDestaque}; color: white; padding: 15px 20px; border-radius: 6px; display: flex; justify-content: space-between; align-items: center; margin-bottom: 25px;">
                            <span style="font-size: 12pt; font-weight: 300; text-transform: uppercase; letter-spacing: 1px;">Valor Líquido a Receber</span>
                            <span style="font-size: 18pt; font-weight: bold;">${utils._formatarValor(calc.liquido)} Kz</span>
                        </div>
                        
                        <!-- RODAPÉ: DATA + DIRECÇÃO + CARIMBO -->
                        <div style="margin-top: 20px;">
                            <p style="font-size: 9pt; color: #666; margin: 0 0 15px 0;">${textoDataProcessamento}</p>
                            
                            <p style="margin: 0 0 10px 0; font-size: 10pt; font-weight: bold;">A Direcção</p>
                            
                            ${empresa.carimbo ? `
                                <img src="${empresa.carimbo}" 
                                     alt="Carimbo" 
                                     crossorigin="anonymous"
                                     style="max-width: ${cfg.carimboWidth}px; max-height: ${cfg.carimboHeight}px; object-fit: contain;">
                            ` : `
                                <div style="width: 150px; height: 60px; border: 1px dashed #ccc; display: flex; align-items: center; justify-content: center;">
                                    <span style="font-size: 8pt; color: #999;">Carimbo</span>
                                </div>
                            `}
                        </div>
                    </div>
                </div>
            `;
        }
    },
    
    // ==========================================
    // LAYOUT 4: MINIMALISTA (Clean)
    // ==========================================
    
    minimalista: {
        nome: 'Minimalista',
        descricao: 'Design clean e elegante',
        
        renderizar(empresa, cliente, config = {}) {
            const utils = ModelosRecibo;
            const calc = utils._calcularRecibo(cliente, config);
            const corDestaque = utils._corProfissional(empresa, config);
            
            // Mês de referência (do config ou mês anterior)
            const mesRef = config.mesReferencia || new Date().toISOString().slice(0, 7);
            const mesRefDate = new Date(mesRef + '-01');
            
            // Data de pagamento (dia 1-15 do mês seguinte)
            const diaPagamento = config.diaPagamento || 8;
            const dataPagamento = utils._calcularDataPagamento(mesRef, diaPagamento);
            
            // Data de admissão
            const dataAdmissao = utils._formatarData(cliente.data_admissao || cliente.dataAdmissao);
            
            // Texto da data de processamento (editável)
            const textoDataProcessamento = utils._gerarTextoDataProcessamento(config, empresa);
            
            const cfg = {
                fontFamily: config.fontFamily || 'Arial, Helvetica, sans-serif',
                fontSize: config.fontSize || 10,
                corTexto: config.corTexto || '#2d2d2d',
                cabecalhoLogoSize: config.cabecalhoLogoSize || 55,
                carimboWidth: config.carimboWidth || 120,
                carimboHeight: config.carimboHeight || 90
            };
            
            return `
                <div style="
                    font-family: ${cfg.fontFamily};
                    font-size: ${cfg.fontSize}pt;
                    color: ${cfg.corTexto};
                    width: 210mm;
                    height: 297mm;
                    background: white;
                    position: relative;
                    box-sizing: border-box;
                    margin: 0 auto;
                    overflow: hidden;
                ">
                    <!-- HEADER CINZA -->
                    <div style="background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%); padding: 15mm 18mm 12mm 18mm;">
                        <div style="display: flex; justify-content: space-between; align-items: center;">
                            <div style="display: flex; align-items: center;">
                                ${empresa.logo ? `
                                    <img src="${empresa.logo}" 
                                         alt="Logo" 
                                         crossorigin="anonymous"
                                         style="max-width: ${cfg.cabecalhoLogoSize}px; max-height: ${cfg.cabecalhoLogoSize}px; object-fit: contain; margin-right: 15px;">
                                ` : ''}
                                <div>
                                    <h1 style="font-size: 13pt; font-weight: 700; color: ${corDestaque}; margin: 0;">${empresa.nome}</h1>
                                    <p style="font-size: 8pt; margin: 3px 0 0 0; color: #666;">NIF: ${empresa.nif}</p>
                                </div>
                            </div>
                            <div style="text-align: right;">
                                <p style="font-size: 8pt; color: #888; margin: 0;">${empresa.endereco?.municipio || 'Luanda'}, Angola</p>
                            </div>
                        </div>
                    </div>
                    
                    <!-- CONTEÚDO -->
                    <div style="padding: 18mm 18mm 15mm 18mm;">
                        
                        <!-- TÍTULO -->
                        <div style="margin-bottom: 25px;">
                            <h2 style="font-size: 18pt; font-weight: 300; color: ${corDestaque}; margin: 0 0 5px 0; letter-spacing: 1px;">Recibo de Vencimento</h2>
                            <div style="width: 35px; height: 2px; background: ${corDestaque};"></div>
                            <p style="font-size: 9pt; color: #888; margin-top: 8px;">${utils._nomeMes(mesRefDate)}</p>
                        </div>
                        
                        <!-- DADOS EM GRID -->
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 25px; padding: 15px; background: #fafafa; border-radius: 4px;">
                            <div>
                                <p style="font-size: 7pt; color: #888; margin: 0 0 2px 0; text-transform: uppercase;">Nome</p>
                                <p style="font-size: 10pt; font-weight: 600; color: ${corDestaque}; margin: 0;">${cliente.nome}</p>
                            </div>
                            <div>
                                <p style="font-size: 7pt; color: #888; margin: 0 0 2px 0; text-transform: uppercase;">B.I nº</p>
                                <p style="font-size: 10pt; margin: 0;">${cliente.documento || cliente.bi || cliente.nif || 'N/D'}</p>
                            </div>
                            <div>
                                <p style="font-size: 7pt; color: #888; margin: 0 0 2px 0; text-transform: uppercase;">Função</p>
                                <p style="font-size: 10pt; margin: 0;">${cliente.funcao || cliente.cargo || 'N/D'}</p>
                            </div>
                            <div>
                                <p style="font-size: 7pt; color: #888; margin: 0 0 2px 0; text-transform: uppercase;">Data de Admissão</p>
                                <p style="font-size: 10pt; margin: 0;">${dataAdmissao}</p>
                            </div>
                            <div>
                                <p style="font-size: 7pt; color: #888; margin: 0 0 2px 0; text-transform: uppercase;">Data de Pagamento</p>
                                <p style="font-size: 10pt; margin: 0;">${dataPagamento.formatado}</p>
                            </div>
                            <div>
                                <p style="font-size: 7pt; color: #888; margin: 0 0 2px 0; text-transform: uppercase;">Local de Trabalho</p>
                                <p style="font-size: 10pt; margin: 0;">${cliente.local_trabalho || 'Sede'}</p>
                            </div>
                        </div>
                        
                        <!-- VALORES EM LINHA -->
                        <div style="margin-bottom: 20px;">
                            <div style="display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #eee;">
                                <span style="color: #666;">Vencimento Base</span>
                                <strong>${utils._formatarValor(calc.salarioBase)}</strong>
                            </div>
                            ${calc.subsidioAlimentacao > 0 ? `
                            <div style="display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #eee;">
                                <span style="color: #666;">Subsídio Alimentação</span>
                                <strong>${utils._formatarValor(calc.subsidioAlimentacao)}</strong>
                            </div>
                            ` : ''}
                            ${calc.subsidioTransporte > 0 ? `
                            <div style="display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #eee;">
                                <span style="color: #666;">Subsídio Transporte</span>
                                <strong>${utils._formatarValor(calc.subsidioTransporte)}</strong>
                            </div>
                            ` : ''}
                            <div style="display: flex; justify-content: space-between; padding: 12px 0; background: #f0f8f0; margin: 5px 0;">
                                <strong>Total Bruto</strong>
                                <strong style="color: #080;">${utils._formatarValor(calc.bruto)}</strong>
                            </div>
                            
                            <div style="display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #eee; margin-top: 10px;">
                                <span style="color: #666;">INSS (${calc.taxaINSS}%)</span>
                                <span style="color: #c00;">- ${utils._formatarValor(calc.inss)}</span>
                            </div>
                            <div style="display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #eee;">
                                <span style="color: #666;">IRT (${calc.taxaIRT}%)</span>
                                <span style="color: #c00;">- ${utils._formatarValor(calc.irt)}</span>
                            </div>
                            ${calc.outrosDescontos > 0 ? `
                            <div style="display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #eee;">
                                <span style="color: #666;">Outros Descontos</span>
                                <span style="color: #c00;">- ${utils._formatarValor(calc.outrosDescontos)}</span>
                            </div>
                            ` : ''}
                        </div>
                        
                        <!-- LÍQUIDO -->
                        <div style="display: flex; justify-content: space-between; padding: 15px; background: ${corDestaque}; color: white; border-radius: 4px; margin-bottom: 30px;">
                            <span style="font-size: 11pt;">Valor Líquido</span>
                            <strong style="font-size: 14pt;">${utils._formatarValor(calc.liquido)} Kz</strong>
                        </div>
                        
                        <!-- RODAPÉ -->
                        <div style="text-align: center; margin-top: 30px;">
                            <p style="font-size: 9pt; color: #888; margin: 0 0 25px 0;">${textoDataProcessamento}</p>
                            <p style="font-size: 10pt; color: #555; margin: 0 0 15px 0; font-weight: 500;">A Direcção</p>
                            <div style="display: flex; justify-content: center;">
                                ${empresa.carimbo ? `
                                    <img src="${empresa.carimbo}" 
                                         alt="Carimbo" 
                                         crossorigin="anonymous"
                                         style="max-width: ${cfg.carimboWidth}px; max-height: ${cfg.carimboHeight}px; object-fit: contain;">
                                ` : `
                                    <div style="width: 150px; height: 50px; border: 1px dashed #ccc; border-radius: 4px;"></div>
                                `}
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }
    }
};

// Exportar para uso global
if (typeof window !== 'undefined') {
    window.ModelosRecibo = ModelosRecibo;
}
