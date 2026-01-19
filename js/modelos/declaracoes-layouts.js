/**
 * ============================================
 * LAYOUTS DE DECLARAÇÃO - MÚLTIPLOS ESTILOS
 * 4 layouts profissionais com contextos distintos
 * ============================================
 * 
 * LAYOUTS DISPONÍVEIS:
 * 1. Formal    - Tradicional, estrutura clássica
 * 2. Moderno   - Declaração de Serviço, design contemporâneo
 * 3. Minimalista - Clean, elegante
 * 4. Executivo - Corporativo robusto, completo
 * 
 * PORTUGUÊS DE PORTUGAL - Termos profissionais
 */

const ModelosDeclaracao = {
    
    // ==========================================
    // UTILITÁRIOS COMUNS
    // ==========================================
    
    /**
     * Retorna termos baseados no género (masculino/feminino)
     */
    _termos(genero) {
        const isMasc = genero !== 'feminino';
        return {
            // Artigos
            o: isMasc ? 'o' : 'a',
            O: isMasc ? 'O' : 'A',
            ao: isMasc ? 'ao' : 'à',
            do: isMasc ? 'do' : 'da',
            Do: isMasc ? 'Do' : 'Da',
            pelo: isMasc ? 'pelo' : 'pela',
            // Tratamento
            sr: isMasc ? 'Sr.' : 'Sr.ª',
            senhor: isMasc ? 'Senhor' : 'Senhora',
            // Substantivos
            colaborador: isMasc ? 'colaborador' : 'colaboradora',
            Colaborador: isMasc ? 'Colaborador' : 'Colaboradora',
            funcionario: isMasc ? 'funcionário' : 'funcionária',
            titular: isMasc ? 'titular' : 'titular',
            portador: isMasc ? 'portador' : 'portadora',
            interessado: isMasc ? 'próprio' : 'própria', // Mais profissional que "interessado"
            referido: isMasc ? 'referido' : 'referida',
            // Adjectivos
            efectivo: isMasc ? 'efectivo' : 'efectiva',
            identificado: isMasc ? 'identificado' : 'identificada',
            admitido: isMasc ? 'admitido' : 'admitida',
            registado: isMasc ? 'registado' : 'registada',
            mesmo: isMasc ? 'mesmo' : 'mesma',
            activo: isMasc ? 'activo' : 'activa'
        };
    },
    
    /**
     * Formata data para português de Portugal
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
     * Formata salário com separadores
     */
    _formatarSalario(valor) {
        const num = parseFloat(valor) || 0;
        return new Intl.NumberFormat('pt-PT', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(num);
    },
    
    /**
     * Retorna a cor profissional (azul escuro padrão)
     */
    _corProfissional(empresa, config) {
        // Prioridade: config > empresa > padrão azul escuro
        if (config.corDestaque && config.corDestaque !== '#7c3aed' && config.corDestaque !== '#059669') {
            return config.corDestaque;
        }
        if (empresa.corPrimaria) {
            return empresa.corPrimaria;
        }
        return '#1a365d'; // Azul escuro profissional padrão
    },
    
    /**
     * Container A4 padrão
     */
    _containerA4(conteudo, config = {}) {
        const fontFamily = config.fontFamily || 'Arial, sans-serif';
        const fontSize = config.fontSize || 12;
        const corTexto = config.corTexto || '#1a1a1a';
        const lineHeight = config.espacamentoLinhas || 1.6;
        
        return `
            <div style="
                font-family: ${fontFamily};
                font-size: ${fontSize}pt;
                color: ${corTexto};
                line-height: ${lineHeight};
                width: 210mm;
                height: 297mm;
                padding: 15mm 18mm;
                background: white;
                position: relative;
                box-sizing: border-box;
                margin: 0 auto;
                overflow: hidden;
            ">
                ${conteudo}
            </div>
        `;
    },
    
    // ==========================================
    // LAYOUT 1: FORMAL (Tradicional)
    // ==========================================
    
    formal: {
        nome: 'Formal',
        descricao: 'Layout profissional com borda decorativa',
        
        renderizar(empresa, cliente, config = {}) {
            const utils = ModelosDeclaracao;
            const t = utils._termos(config.genero);
            const dataAtual = utils._formatarData(new Date());
            const dataAdmissao = utils._formatarData(cliente.dataAdmissao);
            const salarioFormatado = utils._formatarSalario(cliente.salario);
            const corDestaque = utils._corProfissional(empresa, config);
            
            const cfg = {
                fontFamily: config.fontFamily || 'Arial, Helvetica, sans-serif',
                fontSize: config.fontSize || 11,
                tamanhoTitulo: config.tamanhoTitulo || 24,
                tamanhoEmpresa: config.tamanhoEmpresa || 9,
                corTexto: config.corTexto || '#1a1a1a',
                espacamentoLinhas: config.espacamentoLinhas || 1.6,
                alinhamentoTexto: config.alinhamentoTexto || 'justify',
                carimboWidth: config.carimboWidth || 180,
                carimboHeight: config.carimboHeight || 140,
                cabecalhoLogoSize: config.cabecalhoLogoSize || 70,
                textoDataLocal: config.textoDataLocal || ''
            };
            
            // Data/Local: usa manual se definido, senão automático
            const textoDataFinal = cfg.textoDataLocal || `${empresa.endereco?.municipio || 'Luanda'}, aos ${dataAtual}`;
            
            return `
            <div style="
                font-family: ${cfg.fontFamily};
                font-size: ${cfg.fontSize}pt;
                color: ${cfg.corTexto};
                line-height: ${cfg.espacamentoLinhas};
                width: 210mm;
                height: 297mm;
                background: white;
                position: relative;
                box-sizing: border-box;
                margin: 0 auto;
                overflow: hidden;
            ">
                <!-- BORDA SUPERIOR DECORATIVA -->
                <div style="height: 5px; background: linear-gradient(90deg, ${corDestaque} 0%, ${corDestaque}cc 100%);"></div>
                
                <div style="padding: 18mm 20mm 15mm 20mm;">
                    <!-- CABEÇALHO -->
                    <div style="display: flex; align-items: flex-start; margin-bottom: 25px; padding-bottom: 15px; border-bottom: 1px solid #e0e0e0;">
                        ${empresa.logo ? `
                            <img src="${empresa.logo}" 
                                 alt="Logo" 
                                 crossorigin="anonymous"
                                 style="max-width: ${cfg.cabecalhoLogoSize}px; max-height: ${cfg.cabecalhoLogoSize}px; object-fit: contain; margin-right: 20px;">
                        ` : ''}
                        <div style="flex: 1;">
                            <h1 style="
                                font-size: 14pt;
                                font-weight: 700;
                                color: ${corDestaque};
                                margin: 0 0 8px 0;
                            ">${empresa.nome}</h1>
                            <p style="font-size: ${cfg.tamanhoEmpresa}pt; margin: 3px 0; color: #444;">NIF: ${empresa.nif}</p>
                            <p style="font-size: ${cfg.tamanhoEmpresa}pt; margin: 3px 0; color: #666;">
                                ${empresa.endereco?.completo || `${empresa.endereco?.rua || ''}, ${empresa.endereco?.municipio || 'Luanda'} – Angola`}
                            </p>
                        </div>
                    </div>
                
                <!-- TÍTULO -->
                <div style="text-align: center; margin: 40px 0 35px 0;">
                    <h2 style="
                        font-size: ${cfg.tamanhoTitulo}pt;
                        font-weight: bold;
                        color: ${corDestaque};
                        margin: 0;
                        text-transform: uppercase;
                        letter-spacing: 2px;
                        text-decoration: underline;
                        text-underline-offset: 6px;
                    ">Declaração</h2>
                </div>
                
                    <!-- CORPO DO TEXTO -->
                    <div style="text-align: justify;">
                        <p style="margin-bottom: 18px;">
                            Para os devidos efeitos, a <strong>${empresa.nome}</strong>, sociedade comercial 
                            registada sob o NIF n.º <strong>${empresa.nif}</strong>, declara que:
                        </p>
                        
                        <p style="margin-bottom: 18px;">
                            ${t.O} ${t.sr} <strong style="color: ${corDestaque};">${cliente.nome}</strong>, 
                            ${t.portador} do Bilhete de Identidade n.º <strong>${cliente.bi}</strong>, 
                            é ${t.colaborador} ${t.efectivo} desta empresa desde <strong>${dataAdmissao}</strong>, 
                            desempenhando as funções de <strong style="color: ${corDestaque};">${cliente.cargo}</strong>.
                        </p>
                        
                        <p style="margin-bottom: 18px;">
                            ${t.O} ${t.referido} ${t.colaborador} aufere mensalmente o vencimento ilíquido de 
                            <strong style="color: ${corDestaque};">${salarioFormatado} Kz</strong>${cliente.salarioExtenso ? ` (${cliente.salarioExtenso})` : ''}, 
                            valor sujeito aos descontos legais em vigor.
                        </p>
                        
                        <p style="margin-bottom: 18px;">
                            A presente declaração é emitida a pedido ${t.do} ${t.interessado} e destina-se 
                            exclusivamente para efeitos de abertura de conta junto de instituição bancária.
                        </p>
                    </div>
                    
                    <!-- RODAPÉ -->
                    <div style="margin-top: 45px;">
                        <p style="margin-bottom: 35px;">${textoDataFinal}.</p>
                        
                        <!-- ASSINATURA CENTRALIZADA -->
                        <div style="text-align: center; margin-top: 30px;">
                            <p style="font-weight: 600; margin-bottom: 8px; font-size: 11pt;">A Direcção</p>
                            <p style="font-size: 10pt; color: #666; margin-bottom: 18px;">${empresa.nome}</p>
                            
                            <div style="display: flex; justify-content: center;">
                                ${empresa.carimbo ? `
                                    <img src="${empresa.carimbo}" 
                                         alt="Carimbo" 
                                         crossorigin="anonymous"
                                         style="max-width: ${cfg.carimboWidth}px; max-height: ${cfg.carimboHeight}px; object-fit: contain;">
                                ` : `
                                    <div style="width: 160px; height: 60px; border-bottom: 1px solid #666;"></div>
                                `}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            `;
        }
    },
    
    // ==========================================
    // LAYOUT 2: MODERNO (Faixa lateral)
    // ==========================================
    
    moderno: {
        nome: 'Moderno',
        descricao: 'Declaração de Serviço - design contemporâneo',
        
        renderizar(empresa, cliente, config = {}) {
            const utils = ModelosDeclaracao;
            const t = utils._termos(config.genero);
            const dataAtual = utils._formatarData(new Date());
            const dataAdmissao = utils._formatarData(cliente.dataAdmissao);
            const salarioFormatado = utils._formatarSalario(cliente.salario);
            const corDestaque = utils._corProfissional(empresa, config);
            
            const cfg = {
                fontFamily: config.fontFamily || 'Arial, Helvetica, sans-serif',
                fontSize: config.fontSize || 11,
                tamanhoTitulo: config.tamanhoTitulo || 28,
                tamanhoEmpresa: config.tamanhoEmpresa || 9,
                corTexto: config.corTexto || '#1a1a1a',
                espacamentoLinhas: config.espacamentoLinhas || 1.6,
                carimboWidth: config.carimboWidth || 160,
                carimboHeight: config.carimboHeight || 120,
                cabecalhoLogoSize: config.cabecalhoLogoSize || 70,
                textoDataLocal: config.textoDataLocal || ''
            };
            
            // Data/Local: usa manual se definido, senão automático
            const textoDataFinal = cfg.textoDataLocal || `${empresa.endereco?.municipio || 'Luanda'}, ${dataAtual}`;
            
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
                        width: 12mm;
                        background: linear-gradient(180deg, ${corDestaque} 0%, ${corDestaque}dd 100%);
                        flex-shrink: 0;
                    "></div>
                    
                    <!-- CONTEÚDO PRINCIPAL -->
                    <div style="flex: 1; padding: 18mm 20mm 15mm 15mm;">
                        
                        <!-- CABEÇALHO -->
                        <div style="display: flex; align-items: flex-start; margin-bottom: 30px;">
                            ${empresa.logo ? `
                                <img src="${empresa.logo}" 
                                     alt="Logo" 
                                     crossorigin="anonymous"
                                     style="max-width: ${cfg.cabecalhoLogoSize}px; max-height: ${cfg.cabecalhoLogoSize}px; object-fit: contain; margin-right: 20px;">
                            ` : ''}
                            <div>
                                <h1 style="
                                    font-size: 16pt;
                                    font-weight: 700;
                                    color: ${corDestaque};
                                    margin: 0 0 6px 0;
                                ">${empresa.nome}</h1>
                                <p style="font-size: ${cfg.tamanhoEmpresa}pt; margin: 2px 0; color: #555;">
                                    NIF: ${empresa.nif}
                                </p>
                                <p style="font-size: ${cfg.tamanhoEmpresa}pt; margin: 2px 0; color: #666;">
                                    ${empresa.endereco?.completo || empresa.endereco?.rua || 'Luanda, Angola'}
                                </p>
                            </div>
                        </div>
                        
                        <!-- TÍTULO GRANDE -->
                        <div style="margin: 35px 0 30px 0;">
                            <h2 style="
                                font-size: ${cfg.tamanhoTitulo}pt;
                                font-weight: 300;
                                color: ${corDestaque};
                                margin: 0;
                                letter-spacing: 3px;
                                text-transform: uppercase;
                            ">Declaração de Serviço</h2>
                            <div style="
                                width: 60px;
                                height: 3px;
                                background: ${corDestaque};
                                margin-top: 10px;
                            "></div>
                        </div>
                        
                        <!-- DADOS DO COLABORADOR EM DESTAQUE -->
                        <div style="
                            background: #f8f9fa;
                            border-left: 4px solid ${corDestaque};
                            padding: 15px 20px;
                            margin-bottom: 25px;
                        ">
                            <p style="margin: 0 0 8px 0; font-size: 10pt; color: #666; text-transform: uppercase; letter-spacing: 1px;">
                                Dados ${t.do} ${t.Colaborador}
                            </p>
                            <p style="margin: 5px 0; font-size: 12pt;">
                                <strong style="color: ${corDestaque};">${cliente.nome}</strong>
                            </p>
                            <p style="margin: 3px 0; font-size: 10pt; color: #444;">
                                BI: ${cliente.bi} &nbsp;|&nbsp; Função: ${cliente.cargo}
                            </p>
                        </div>
                        
                        <!-- CORPO DO TEXTO -->
                        <div style="line-height: ${cfg.espacamentoLinhas};">
                            <p style="margin-bottom: 14px; text-align: justify;">
                                Declaramos para os devidos efeitos que ${t.o} ${t.colaborador} acima 
                                ${t.identificado} faz parte do quadro de funcionários efectivos desta 
                                empresa desde <strong>${dataAdmissao}</strong>.
                            </p>
                            
                            <p style="margin-bottom: 12px;"><strong>Informações contratuais:</strong></p>
                            
                            <ul style="margin: 0 0 18px 20px; padding: 0;">
                                <li style="margin-bottom: 6px;">Cargo/Função: <strong>${cliente.cargo}</strong></li>
                                <li style="margin-bottom: 6px;">Data de admissão: <strong>${dataAdmissao}</strong></li>
                                <li style="margin-bottom: 6px;">Vencimento mensal ilíquido: <strong style="color: ${corDestaque};">${salarioFormatado} Kz</strong></li>
                                <li style="margin-bottom: 6px;">Situação: Contrato de trabalho ${t.activo}</li>
                            </ul>
                            
                            <p style="text-align: justify;">
                                A presente declaração é emitida a pedido ${t.do} ${t.interessado} e destina-se 
                                exclusivamente para efeitos de abertura de conta junto de instituição bancária.
                            </p>
                        </div>
                        
                        <!-- RODAPÉ -->
                        <div style="margin-top: 35px;">
                            <p style="color: #666; margin-bottom: 28px;">
                                ${textoDataFinal}
                            </p>
                            
                            <!-- ASSINATURA CENTRALIZADA -->
                            <div style="text-align: center;">
                                <p style="font-weight: 600; margin-bottom: 6px; font-size: 10pt;">${empresa.nome}</p>
                                <p style="font-size: 9pt; color: #666; margin-bottom: 15px;">A Direcção</p>
                                
                                <div style="display: flex; justify-content: center;">
                                    ${empresa.carimbo ? `
                                        <img src="${empresa.carimbo}" 
                                             alt="Carimbo" 
                                             crossorigin="anonymous"
                                             style="max-width: ${cfg.carimboWidth}px; max-height: ${cfg.carimboHeight}px; object-fit: contain;">
                                    ` : `
                                        <div style="width: 140px; height: 50px; border-bottom: 1px solid #999;"></div>
                                    `}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }
    },
    
    // ==========================================
    // LAYOUT 3: MINIMALISTA (Clean)
    // ==========================================
    
    minimalista: {
        nome: 'Minimalista',
        descricao: 'Design clean e elegante',
        
        renderizar(empresa, cliente, config = {}) {
            const utils = ModelosDeclaracao;
            const t = utils._termos(config.genero);
            const dataAtual = utils._formatarData(new Date());
            const dataAdmissao = utils._formatarData(cliente.dataAdmissao);
            const salarioFormatado = utils._formatarSalario(cliente.salario);
            const corDestaque = utils._corProfissional(empresa, config);
            
            const cfg = {
                fontFamily: config.fontFamily || 'Arial, Helvetica, sans-serif',
                fontSize: config.fontSize || 11,
                tamanhoTitulo: config.tamanhoTitulo || 20,
                tamanhoEmpresa: config.tamanhoEmpresa || 9,
                corTexto: config.corTexto || '#2d2d2d',
                espacamentoLinhas: config.espacamentoLinhas || 1.7,
                carimboWidth: config.carimboWidth || 180,
                carimboHeight: config.carimboHeight || 140,
                cabecalhoLogoSize: config.cabecalhoLogoSize || 65,
                textoDataLocal: config.textoDataLocal || ''
            };
            
            // Data/Local: usa manual se definido, senão automático
            const textoDataFinal = cfg.textoDataLocal || `${empresa.endereco?.municipio || 'Luanda'}, ${dataAtual}`;
            
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
                    <!-- HEADER COM FUNDO CINZA -->
                    <div style="background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%); padding: 18mm 20mm 14mm 20mm;">
                        <div style="display: flex; align-items: center; justify-content: space-between;">
                            <div style="display: flex; align-items: center;">
                                ${empresa.logo ? `
                                    <img src="${empresa.logo}" 
                                         alt="Logo" 
                                         crossorigin="anonymous"
                                         style="max-width: ${cfg.cabecalhoLogoSize}px; max-height: ${cfg.cabecalhoLogoSize}px; object-fit: contain; margin-right: 18px;">
                                ` : ''}
                                <div>
                                    <h1 style="font-size: 14pt; font-weight: 700; color: ${corDestaque}; margin: 0 0 4px 0;">${empresa.nome}</h1>
                                    <p style="font-size: ${cfg.tamanhoEmpresa}pt; margin: 0; color: #666;">NIF: ${empresa.nif}</p>
                                </div>
                            </div>
                            <div style="text-align: right;">
                                <p style="font-size: 8pt; color: #888; margin: 0;">${empresa.endereco?.municipio || 'Luanda'}, Angola</p>
                            </div>
                        </div>
                    </div>
                    
                    <!-- CONTEÚDO -->
                    <div style="padding: 22mm 20mm 15mm 20mm; line-height: ${cfg.espacamentoLinhas};">
                        
                        <!-- TÍTULO -->
                        <div style="margin-bottom: 28px;">
                            <h2 style="font-size: ${cfg.tamanhoTitulo}pt; font-weight: 300; color: ${corDestaque}; margin: 0 0 8px 0; letter-spacing: 1px;">Declaração de Rendimentos</h2>
                            <div style="width: 40px; height: 2px; background: ${corDestaque};"></div>
                        </div>
                        
                        <!-- GRID DE INFORMAÇÕES -->
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 25px; padding: 18px; background: #fafafa; border-radius: 4px;">
                            <div>
                                <p style="font-size: 8pt; color: #888; margin: 0 0 3px 0; text-transform: uppercase;">Nome</p>
                                <p style="font-size: 11pt; font-weight: 600; color: ${corDestaque}; margin: 0;">${cliente.nome}</p>
                            </div>
                            <div>
                                <p style="font-size: 8pt; color: #888; margin: 0 0 3px 0; text-transform: uppercase;">Documento</p>
                                <p style="font-size: 11pt; margin: 0;">${cliente.bi}</p>
                            </div>
                            <div>
                                <p style="font-size: 8pt; color: #888; margin: 0 0 3px 0; text-transform: uppercase;">Função</p>
                                <p style="font-size: 11pt; margin: 0;">${cliente.cargo}</p>
                            </div>
                            <div>
                                <p style="font-size: 8pt; color: #888; margin: 0 0 3px 0; text-transform: uppercase;">Vencimento</p>
                                <p style="font-size: 11pt; font-weight: 600; color: ${corDestaque}; margin: 0;">${salarioFormatado} Kz</p>
                            </div>
                        </div>
                        
                        <!-- TEXTO -->
                        <div style="margin-bottom: 25px;">
                            <p style="margin-bottom: 15px; text-align: justify;">
                                Declaramos que ${t.o} ${t.colaborador} ${t.identificado} acima é ${t.funcionario} 
                                desta empresa desde <strong>${dataAdmissao}</strong>, mantendo ${t.activo} o seu vínculo laboral.
                            </p>
                            <p style="text-align: justify;">
                                A presente declaração é emitida a pedido ${t.do} ${t.interessado} para efeitos de abertura de conta junto de instituição bancária.
                            </p>
                        </div>
                        
                        <!-- RODAPÉ -->
                        <div style="margin-top: 40px;">
                            <p style="color: #888; font-size: 10pt; margin-bottom: 28px;">${textoDataFinal}</p>
                            
                            <!-- ASSINATURA CENTRALIZADA -->
                            <div style="text-align: center;">
                                <p style="font-size: 10pt; color: #555; margin-bottom: 15px;">A Direcção</p>
                                <div style="display: flex; justify-content: center;">
                                    ${empresa.carimbo ? `
                                        <img src="${empresa.carimbo}" 
                                             alt="Carimbo" 
                                             crossorigin="anonymous"
                                             style="max-width: ${cfg.carimboWidth}px; max-height: ${cfg.carimboHeight}px; object-fit: contain;">
                                    ` : `
                                        <div style="width: 140px; height: 50px; border-bottom: 1px solid #ccc;"></div>
                                    `}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }
    },
    
    // ==========================================
    // LAYOUT 4: EXECUTIVO (Corporativo Completo)
    // ==========================================
    
    executivo: {
        nome: 'Executivo',
        descricao: 'Layout corporativo robusto e completo',
        
        renderizar(empresa, cliente, config = {}) {
            const utils = ModelosDeclaracao;
            const t = utils._termos(config.genero);
            const dataAtual = utils._formatarData(new Date());
            const dataAdmissao = utils._formatarData(cliente.dataAdmissao);
            const salarioFormatado = utils._formatarSalario(cliente.salario);
            const corDestaque = utils._corProfissional(empresa, config);
            
            const cfg = {
                fontFamily: config.fontFamily || 'Arial, sans-serif',
                fontSize: config.fontSize || 12,
                tamanhoTitulo: config.tamanhoTitulo || 22,
                tamanhoSubtitulo: config.tamanhoSubtitulo || 14,
                tamanhoEmpresa: config.tamanhoEmpresa || 10,
                corTexto: config.corTexto || '#000000',
                espacamentoLinhas: config.espacamentoLinhas || 1.7,
                alinhamentoTexto: config.alinhamentoTexto || 'justify',
                cabecalhoLogoSize: config.cabecalhoLogoSize || 100,
                cabecalhoMarginEntreLogoTexto: config.cabecalhoMarginEntreLogoTexto || 25,
                cabecalhoBordaLargura: config.cabecalhoBordaLargura || 2,
                carimboWidth: config.carimboWidth || 220,
                carimboHeight: config.carimboHeight || 170,
                margemTopDataLocal: config.margemTopDataLocal || 35,
                margemTopAssinatura: config.margemTopAssinatura || 25,
                textoDataLocal: config.textoDataLocal || ''
            };
            
            // Data/Local: usa manual se definido, senão automático
            const textoDataFinal = cfg.textoDataLocal || `${empresa.endereco?.municipio || 'Luanda'}, aos ${dataAtual}`;
            
            return `
                <div style="
                    font-family: ${cfg.fontFamily};
                    font-size: ${cfg.fontSize}pt;
                    color: ${cfg.corTexto};
                    line-height: ${cfg.espacamentoLinhas};
                    width: 210mm;
                    height: 297mm;
                    padding: 15mm 18mm;
                    background: white;
                    position: relative;
                    box-sizing: border-box;
                    margin: 0 auto;
                    overflow: hidden;
                ">
                    <!-- CABEÇALHO EXECUTIVO - Logo + Dados lado a lado -->
                    <div style="
                        display: flex;
                        justify-content: space-between;
                        align-items: flex-start;
                        padding-bottom: 15px;
                        margin-bottom: 20px;
                        border-bottom: ${cfg.cabecalhoBordaLargura}px solid ${corDestaque};
                    ">
                        <!-- Logo -->
                        <div style="flex-shrink: 0; margin-right: ${cfg.cabecalhoMarginEntreLogoTexto}px;">
                            ${empresa.logo ? `
                                <img src="${empresa.logo}" 
                                     alt="Logo" 
                                     crossorigin="anonymous"
                                     style="max-width: ${cfg.cabecalhoLogoSize}px; max-height: ${cfg.cabecalhoLogoSize}px; object-fit: contain;">
                            ` : `
                                <div style="
                                    width: ${cfg.cabecalhoLogoSize}px;
                                    height: ${cfg.cabecalhoLogoSize}px;
                                    background: #f0f0f0;
                                    border-radius: 8px;
                                    display: flex;
                                    align-items: center;
                                    justify-content: center;
                                    font-size: 40px;
                                    color: #999;
                                ">🏢</div>
                            `}
                        </div>
                        
                        <!-- Dados da Empresa -->
                        <div style="text-align: right; flex: 1;">
                            <h1 style="
                                font-size: ${cfg.tamanhoSubtitulo}pt;
                                font-weight: bold;
                                color: ${corDestaque};
                                margin: 0 0 8px 0;
                            ">${empresa.nome}</h1>
                            <p style="font-size: ${cfg.tamanhoEmpresa}pt; margin: 3px 0; color: #333;">
                                <strong>NIF:</strong> ${empresa.nif}
                            </p>
                            <p style="font-size: ${cfg.tamanhoEmpresa}pt; margin: 3px 0; color: #555;">
                                ${empresa.endereco?.completo || `${empresa.endereco?.rua || ''}, ${empresa.endereco?.municipio || 'Luanda'} – Angola`}
                            </p>
                            ${empresa.telefone ? `
                                <p style="font-size: ${cfg.tamanhoEmpresa}pt; margin: 3px 0; color: #666;">
                                    Tel: ${empresa.telefone}
                                </p>
                            ` : ''}
                        </div>
                    </div>
                    
                    <!-- TÍTULO CENTRAL -->
                    <div style="text-align: center; margin: 35px 0 30px 0;">
                        <h2 style="
                            font-size: ${cfg.tamanhoTitulo}pt;
                            font-weight: bold;
                            color: ${corDestaque};
                            margin: 0 0 8px 0;
                            letter-spacing: 1.5px;
                            text-transform: uppercase;
                        ">Declaração de Serviço</h2>
                        <div style="
                            width: 80px;
                            height: 3px;
                            background: ${corDestaque};
                            margin: 0 auto;
                            border-radius: 2px;
                        "></div>
                    </div>
                    
                    <!-- CORPO DO TEXTO -->
                    <div style="text-align: justify;">
                        <p style="margin-bottom: 16px;">
                            A <strong>${empresa.nome}</strong>, sociedade comercial com sede em 
                            ${empresa.endereco?.completo || empresa.endereco?.municipio || 'Luanda'}, 
                            registada sob o NIF n.º <strong>${empresa.nif}</strong>, vem pela presente declarar que:
                        </p>
                        
                        <p style="margin-bottom: 16px;">
                            ${t.O} ${t.sr} <strong style="color: ${corDestaque};">${cliente.nome}</strong>, 
                            ${t.portador} do Bilhete de Identidade n.º <strong>${cliente.bi}</strong>, 
                            é ${t.colaborador} ${t.efectivo} desta empresa, onde exerce as funções de 
                            <strong style="color: ${corDestaque};">${cliente.cargo}</strong>, 
                            desde <strong>${dataAdmissao}</strong>, mantendo ${t.activo} o seu vínculo laboral 
                            até à presente data.
                        </p>
                        
                        <p style="margin-bottom: 16px;">
                            No exercício das suas funções, ${t.o} ${t.colaborador} aufere a remuneração mensal 
                            ilíquida de <strong style="color: ${corDestaque};">${salarioFormatado} Kwanzas</strong>${cliente.salarioExtenso ? ` (${cliente.salarioExtenso})` : ''}, 
                            valor sujeito aos descontos legais, nomeadamente Imposto sobre o Rendimento 
                            do Trabalho (IRT) e contribuições para a Segurança Social.
                        </p>
                        
                        <p style="margin-bottom: 16px;">
                            A presente declaração é emitida a pedido ${t.do} ${t.interessado} e destina-se 
                            exclusivamente para efeitos de abertura de conta junto de instituição bancária.
                        </p>
                    </div>
                    
                    <!-- RODAPÉ -->
                    <div style="margin-top: 40px;">
                        <p style="margin-bottom: 25px;">${textoDataFinal}.</p>
                        
                        <!-- ASSINATURA E CARIMBO CENTRALIZADOS -->
                        <div style="text-align: center; margin-top: 25px;">
                            <p style="font-weight: 600; margin-bottom: 8px; font-size: 11pt;">Pela ${empresa.nome}</p>
                            <p style="font-size: 10pt; color: #555; margin-bottom: 18px;">A Direcção</p>
                            
                            <div style="display: flex; justify-content: center;">
                                ${empresa.carimbo ? `
                                    <img src="${empresa.carimbo}" 
                                         alt="Carimbo e Assinatura" 
                                         crossorigin="anonymous"
                                         style="max-width: ${cfg.carimboWidth}px; max-height: ${cfg.carimboHeight}px; object-fit: contain;">
                                ` : `
                                    <div style="
                                        width: 180px;
                                        height: 60px;
                                        border: 2px dashed #ccc;
                                        border-radius: 8px;
                                        display: flex;
                                        align-items: center;
                                        justify-content: center;
                                        color: #999;
                                        font-size: 10pt;
                                    ">Carimbo</div>
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
    window.ModelosDeclaracao = ModelosDeclaracao;
}
