/**
 * ============================================
 * LAYOUTS DE DECLARAÇÃO - MÚLTIPLOS ESTILOS
 * 4 layouts profissionais com contextos distintos
 * ============================================
 * 
 * LAYOUTS DISPONÍVEIS:
 * 1. Formal    - Tradicional, estrutura clássica
 * 2. Moderno   - Faixa lateral, design contemporâneo
 * 3. Minimalista - Clean, muito espaço em branco
 * 4. Executivo - Corporativo robusto, completo
 */

const ModelosDeclaracao = {
    
    // ==========================================
    // UTILITÁRIOS COMUNS
    // ==========================================
    
    /**
     * Formata data para português de Angola
     */
    _formatarData(data) {
        if (!data) return 'N/D';
        return new Date(data).toLocaleDateString('pt-AO', {
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
        descricao: 'Layout tradicional para documentos oficiais',
        
        renderizar(empresa, cliente, config = {}) {
            const utils = ModelosDeclaracao;
            const dataAtual = utils._formatarData(new Date());
            const dataAdmissao = utils._formatarData(cliente.dataAdmissao);
            const salarioFormatado = utils._formatarSalario(cliente.salario);
            const corDestaque = utils._corProfissional(empresa, config);
            
            const cfg = {
                fontFamily: config.fontFamily || 'Times New Roman, serif',
                fontSize: config.fontSize || 12,
                tamanhoTitulo: config.tamanhoTitulo || 18,
                tamanhoEmpresa: config.tamanhoEmpresa || 10,
                corTexto: config.corTexto || '#000000',
                espacamentoLinhas: config.espacamentoLinhas || 1.8,
                alinhamentoTexto: config.alinhamentoTexto || 'justify',
                carimboWidth: config.carimboWidth || 180,
                carimboHeight: config.carimboHeight || 140,
                cabecalhoLogoSize: config.cabecalhoLogoSize || 80
            };
            
            const conteudo = `
                <!-- CABEÇALHO FORMAL - Logo centrado -->
                <div style="text-align: center; margin-bottom: 25px; padding-bottom: 20px; border-bottom: 2px solid ${corDestaque};">
                    ${empresa.logo ? `
                        <img src="${empresa.logo}" 
                             alt="Logo" 
                             crossorigin="anonymous"
                             style="max-width: ${cfg.cabecalhoLogoSize}px; max-height: ${cfg.cabecalhoLogoSize}px; object-fit: contain; margin-bottom: 12px;">
                    ` : ''}
                    <h1 style="
                        font-size: 14pt;
                        font-weight: bold;
                        color: ${corDestaque};
                        margin: 0 0 8px 0;
                        text-transform: uppercase;
                        letter-spacing: 1px;
                    ">${empresa.nome}</h1>
                    <p style="font-size: ${cfg.tamanhoEmpresa}pt; margin: 3px 0; color: #333;">
                        <strong>NIF:</strong> ${empresa.nif}
                    </p>
                    <p style="font-size: ${cfg.tamanhoEmpresa}pt; margin: 3px 0; color: #555;">
                        ${empresa.endereco?.completo || `${empresa.endereco?.rua || ''}, ${empresa.endereco?.municipio || 'Luanda'} – Angola`}
                    </p>
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
                
                <!-- CORPO DO TEXTO - Contexto Formal -->
                <div style="text-align: ${cfg.alinhamentoTexto}; line-height: ${cfg.espacamentoLinhas};">
                    <p style="text-indent: 40px; margin-bottom: 18px;">
                        A entidade acima identificada, <strong>${empresa.nome}</strong>, pessoa colectiva 
                        de direito privado, com o Número de Identificação Fiscal <strong>${empresa.nif}</strong>, 
                        declara para os devidos efeitos legais e a quem possa interessar que:
                    </p>
                    
                    <p style="text-indent: 40px; margin-bottom: 18px;">
                        O(A) cidadão(ã) <strong style="color: ${corDestaque};">${cliente.nome}</strong>, 
                        portador(a) do Bilhete de Identidade n.º <strong>${cliente.bi}</strong>, 
                        é funcionário(a) desta empresa desde <strong>${dataAdmissao}</strong>, 
                        exercendo actualmente as funções de <strong style="color: ${corDestaque};">${cliente.cargo}</strong>.
                    </p>
                    
                    <p style="text-indent: 40px; margin-bottom: 18px;">
                        O(A) referido(a) funcionário(a) aufere mensalmente a remuneração ilíquida de 
                        <strong style="color: ${corDestaque};">${salarioFormatado} Kz</strong> 
                        (${cliente.salarioExtenso || 'valor por extenso'}), sujeita aos descontos 
                        legais em vigor na República de Angola.
                    </p>
                    
                    <p style="text-indent: 40px; margin-bottom: 18px;">
                        Por ser verdade e me ter sido solicitado, mandei passar a presente declaração 
                        que vai por mim assinada e autenticada com o carimbo em uso nesta instituição.
                    </p>
                </div>
                
                <!-- RODAPÉ -->
                <div style="margin-top: 50px;">
                    <p style="margin-bottom: 40px;">
                        ${empresa.endereco?.municipio || 'Luanda'}, aos ${dataAtual}.
                    </p>
                    
                    <div style="text-align: center; margin-top: 30px;">
                        <p style="font-weight: 600; margin-bottom: 8px;">A Direcção</p>
                        <div style="margin-top: 15px;">
                            ${empresa.carimbo ? `
                                <img src="${empresa.carimbo}" 
                                     alt="Carimbo" 
                                     crossorigin="anonymous"
                                     style="max-width: ${cfg.carimboWidth}px; max-height: ${cfg.carimboHeight}px; object-fit: contain;">
                            ` : `
                                <div style="
                                    width: 150px;
                                    height: 60px;
                                    border-bottom: 1px solid #333;
                                    margin: 0 auto 10px auto;
                                "></div>
                                <p style="font-size: 9pt; color: #666;">Assinatura e Carimbo</p>
                            `}
                        </div>
                    </div>
                </div>
            `;
            
            return utils._containerA4(conteudo, cfg);
        }
    },
    
    // ==========================================
    // LAYOUT 2: MODERNO (Faixa lateral)
    // ==========================================
    
    moderno: {
        nome: 'Moderno',
        descricao: 'Design contemporâneo com faixa lateral',
        
        renderizar(empresa, cliente, config = {}) {
            const utils = ModelosDeclaracao;
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
                cabecalhoLogoSize: config.cabecalhoLogoSize || 70
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
                            ">Declaração</h2>
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
                                Dados do Colaborador
                            </p>
                            <p style="margin: 5px 0; font-size: 12pt;">
                                <strong style="color: ${corDestaque};">${cliente.nome}</strong>
                            </p>
                            <p style="margin: 3px 0; font-size: 10pt; color: #444;">
                                BI: ${cliente.bi} &nbsp;|&nbsp; Função: ${cliente.cargo}
                            </p>
                        </div>
                        
                        <!-- CORPO DO TEXTO - Contexto Moderno -->
                        <div style="line-height: ${cfg.espacamentoLinhas};">
                            <p style="margin-bottom: 15px;">
                                Certificamos que o colaborador identificado acima faz parte do quadro 
                                de funcionários desta empresa, onde desempenha suas funções desde 
                                <strong>${dataAdmissao}</strong>.
                            </p>
                            
                            <p style="margin-bottom: 15px;">
                                <strong>Informações contratuais:</strong>
                            </p>
                            
                            <ul style="margin: 0 0 20px 20px; padding: 0;">
                                <li style="margin-bottom: 8px;">Cargo: <strong>${cliente.cargo}</strong></li>
                                <li style="margin-bottom: 8px;">Data de admissão: <strong>${dataAdmissao}</strong></li>
                                <li style="margin-bottom: 8px;">Remuneração mensal: <strong style="color: ${corDestaque};">${salarioFormatado} Kz</strong></li>
                                <li style="margin-bottom: 8px;">Vínculo: Contrato de trabalho activo</li>
                            </ul>
                            
                            <p style="margin-bottom: 15px;">
                                Esta declaração é emitida para os fins que se fizerem necessários, 
                                tendo validade mediante apresentação do documento original.
                            </p>
                        </div>
                        
                        <!-- RODAPÉ -->
                        <div style="margin-top: 40px;">
                            <p style="color: #666; margin-bottom: 35px;">
                                ${empresa.endereco?.municipio || 'Luanda'}, ${dataAtual}
                            </p>
                            
                            <div style="display: flex; align-items: flex-end; justify-content: space-between;">
                                <div>
                                    <p style="font-weight: 600; margin-bottom: 5px; font-size: 10pt;">
                                        ${empresa.nome}
                                    </p>
                                    <p style="font-size: 9pt; color: #666;">Departamento de Recursos Humanos</p>
                                </div>
                                <div style="text-align: center;">
                                    ${empresa.carimbo ? `
                                        <img src="${empresa.carimbo}" 
                                             alt="Carimbo" 
                                             crossorigin="anonymous"
                                             style="max-width: ${cfg.carimboWidth}px; max-height: ${cfg.carimboHeight}px; object-fit: contain;">
                                    ` : `
                                        <div style="
                                            width: 120px;
                                            height: 50px;
                                            border-bottom: 1px solid #999;
                                            margin-bottom: 5px;
                                        "></div>
                                        <p style="font-size: 8pt; color: #999;">Assinatura autorizada</p>
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
        descricao: 'Design limpo com muito espaço em branco',
        
        renderizar(empresa, cliente, config = {}) {
            const utils = ModelosDeclaracao;
            const dataAtual = utils._formatarData(new Date());
            const dataAdmissao = utils._formatarData(cliente.dataAdmissao);
            const salarioFormatado = utils._formatarSalario(cliente.salario);
            const corDestaque = utils._corProfissional(empresa, config);
            
            const cfg = {
                fontFamily: config.fontFamily || 'Helvetica, Arial, sans-serif',
                fontSize: config.fontSize || 11,
                tamanhoTitulo: config.tamanhoTitulo || 14,
                tamanhoEmpresa: config.tamanhoEmpresa || 9,
                corTexto: config.corTexto || '#333333',
                espacamentoLinhas: config.espacamentoLinhas || 1.9,
                carimboWidth: config.carimboWidth || 120,
                carimboHeight: config.carimboHeight || 90,
                cabecalhoLogoSize: config.cabecalhoLogoSize || 50
            };
            
            return `
                <div style="
                    font-family: ${cfg.fontFamily};
                    font-size: ${cfg.fontSize}pt;
                    color: ${cfg.corTexto};
                    width: 210mm;
                    height: 297mm;
                    padding: 25mm 25mm;
                    background: white;
                    position: relative;
                    box-sizing: border-box;
                    margin: 0 auto;
                    overflow: hidden;
                ">
                    <!-- CABEÇALHO MINIMALISTA -->
                    <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 50px;">
                        <div>
                            ${empresa.logo ? `
                                <img src="${empresa.logo}" 
                                     alt="Logo" 
                                     crossorigin="anonymous"
                                     style="max-width: ${cfg.cabecalhoLogoSize}px; max-height: ${cfg.cabecalhoLogoSize}px; object-fit: contain; opacity: 0.9;">
                            ` : ''}
                        </div>
                        <div style="text-align: right;">
                            <p style="font-size: 10pt; font-weight: 600; color: #1a1a1a; margin: 0;">
                                ${empresa.nome}
                            </p>
                            <p style="font-size: 8pt; color: #888; margin: 4px 0 0 0;">
                                NIF ${empresa.nif}
                            </p>
                        </div>
                    </div>
                    
                    <!-- TÍTULO SIMPLES -->
                    <div style="margin-bottom: 50px;">
                        <p style="
                            font-size: ${cfg.tamanhoTitulo}pt;
                            font-weight: 600;
                            color: #1a1a1a;
                            margin: 0;
                            letter-spacing: 0.5px;
                        ">Declaração de Vínculo Laboral</p>
                    </div>
                    
                    <!-- CORPO DO TEXTO - Contexto Minimalista (directo) -->
                    <div style="line-height: ${cfg.espacamentoLinhas}; max-width: 85%;">
                        <p style="margin-bottom: 30px;">
                            Declaramos que <strong>${cliente.nome}</strong>, 
                            portador do BI nº ${cliente.bi}, é colaborador desta empresa.
                        </p>
                        
                        <div style="margin-bottom: 30px; padding-left: 0;">
                            <p style="margin: 12px 0; color: #555;">
                                <span style="display: inline-block; width: 100px; color: #888;">Função</span>
                                ${cliente.cargo}
                            </p>
                            <p style="margin: 12px 0; color: #555;">
                                <span style="display: inline-block; width: 100px; color: #888;">Desde</span>
                                ${dataAdmissao}
                            </p>
                            <p style="margin: 12px 0; color: #555;">
                                <span style="display: inline-block; width: 100px; color: #888;">Salário</span>
                                ${salarioFormatado} Kz
                            </p>
                        </div>
                        
                        <p style="margin-bottom: 20px; color: #666; font-size: 10pt;">
                            Emitida para os devidos efeitos.
                        </p>
                    </div>
                    
                    <!-- RODAPÉ MINIMALISTA -->
                    <div style="position: absolute; bottom: 25mm; left: 25mm; right: 25mm;">
                        <div style="display: flex; justify-content: space-between; align-items: flex-end;">
                            <div>
                                <p style="font-size: 9pt; color: #888; margin: 0;">
                                    ${empresa.endereco?.municipio || 'Luanda'}
                                </p>
                                <p style="font-size: 9pt; color: #888; margin: 4px 0 0 0;">
                                    ${dataAtual}
                                </p>
                            </div>
                            <div style="text-align: right;">
                                ${empresa.carimbo ? `
                                    <img src="${empresa.carimbo}" 
                                         alt="Carimbo" 
                                         crossorigin="anonymous"
                                         style="max-width: ${cfg.carimboWidth}px; max-height: ${cfg.carimboHeight}px; object-fit: contain; opacity: 0.85;">
                                ` : `
                                    <div style="
                                        width: 80px;
                                        border-bottom: 1px solid #ccc;
                                        margin-bottom: 5px;
                                    "></div>
                                `}
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
                margemTopAssinatura: config.margemTopAssinatura || 25
            };
            
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
                    
                    <!-- CORPO DO TEXTO - Contexto Executivo -->
                    <div style="text-align: ${cfg.alinhamentoTexto};">
                        <p style="margin-bottom: 16px;">
                            Pela presente, a <strong>${empresa.nome}</strong>, sociedade comercial 
                            com sede em ${empresa.endereco?.completo || empresa.endereco?.municipio || 'Luanda'}, 
                            registada sob o NIF n.º <strong>${empresa.nif}</strong>, vem por este meio 
                            declarar e confirmar que:
                        </p>
                        
                        <p style="margin-bottom: 16px;">
                            O(A) Sr(a). <strong style="color: ${corDestaque};">${cliente.nome}</strong>, 
                            cidadão(ã) angolano(a), titular do Bilhete de Identidade n.º <strong>${cliente.bi}</strong>, 
                            é funcionário(a) efectivo(a) desta empresa, onde exerce as funções de 
                            <strong style="color: ${corDestaque};">${cliente.cargo}</strong>, 
                            desde <strong>${dataAdmissao}</strong>, mantendo activo o seu vínculo laboral 
                            até à presente data.
                        </p>
                        
                        <p style="margin-bottom: 16px;">
                            No exercício das suas funções, o(a) colaborador(a) aufere a remuneração mensal 
                            bruta de <strong style="color: ${corDestaque};">${salarioFormatado} Kwanzas</strong>
                            ${cliente.salarioExtenso ? ` (${cliente.salarioExtenso})` : ''}, 
                            valor sujeito aos descontos legais, nomeadamente Imposto sobre o Rendimento 
                            do Trabalho (IRT) e contribuições para a Segurança Social.
                        </p>
                        
                        <p style="margin-bottom: 16px;">
                            A presente declaração é emitida a pedido do(a) interessado(a), para os fins 
                            que tiver por convenientes, nomeadamente para efeitos de prova de vínculo 
                            laboral junto de instituições financeiras e demais entidades.
                        </p>
                    </div>
                    
                    <!-- RODAPÉ -->
                    <div style="margin-top: ${cfg.margemTopDataLocal}px;">
                        <p style="margin-bottom: 20px;">
                            ${empresa.endereco?.municipio || 'Luanda'}, aos ${dataAtual}.
                        </p>
                        
                        <!-- Assinatura e Carimbo -->
                        <div style="text-align: center; margin-top: ${cfg.margemTopAssinatura}px;">
                            <p style="font-weight: 600; margin-bottom: 12px; font-size: 11pt;">
                                Pela ${empresa.nome}
                            </p>
                            <p style="font-size: 10pt; color: #555; margin-bottom: 15px;">
                                A Direcção
                            </p>
                            
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
                                    margin: 0 auto;
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
            `;
        }
    }
};

// Exportar para uso global
if (typeof window !== 'undefined') {
    window.ModelosDeclaracao = ModelosDeclaracao;
}
