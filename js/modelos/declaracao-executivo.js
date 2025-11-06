/**
 * ============================================
 * MODELO: DECLARAÇÃO EXECUTIVA
 * Estilo: Corporativo profissional
 * Características: Marca d'água diagonal, header robusto, layout formal
 * ============================================
 */

const ModeloDeclaracaoExecutivo = {
    id: 'declaracao-executivo',
    nome: 'Declaração Executiva',
    categoria: 'declaracao',
    
    /**
     * Renderiza o modelo com os dados fornecidos
     * @param {Object} empresa - Dados da empresa
     * @param {Object} cliente - Dados do cliente/trabalhador
     * @param {Object} config - Configurações de personalização
     * @returns {String} HTML do documento
     */
    renderizar(empresa, cliente, config = {}) {
        
        // Configurações padrão
        const cfg = {
            fontFamily: config.fontFamily || 'Times New Roman, serif',
            fontSize: config.fontSize || 10,
            tamanhoTitulo: config.tamanhoTitulo || 22,
            tamanhoSubtitulo: config.tamanhoSubtitulo || 14,
            tamanhoEmpresa: config.tamanhoEmpresa || 8,
            corTexto: config.corTexto || '#000000',
            corDestaque: config.corDestaque || empresa.corPrimaria || '#1e40af',
            marcaDaguaOpacidade: config.marcaDaguaOpacidade || 10,
            marcaDaguaRotacao: config.marcaDaguaRotacao !== undefined ? config.marcaDaguaRotacao : -45,
            marcaDaguaWidth: config.marcaDaguaWidth || 400,
            marcaDaguaHeight: config.marcaDaguaHeight || 400,
            espacamentoLinhas: config.espacamentoLinhas || 1.5,
            // Edição de Conteúdo
            tituloDocumento: config.tituloDocumento || 'DECLARAÇÃO DE TRABALHO',
            textoIntro: config.textoIntro || 'Declara-se, para os devidos efeitos, que',
            alinhamentoTexto: config.alinhamentoTexto || 'justify',
            alinhamentoCabecalho: config.alinhamentoCabecalho || 'left',
            // Controles Avançados do Cabeçalho
            cabecalhoMaxWidth: config.cabecalhoMaxWidth || 450,
            cabecalhoMarginEntreLogoTexto: config.cabecalhoMarginEntreLogoTexto || 20,
            cabecalhoJustify: config.cabecalhoJustify || 'space-between',
            cabecalhoPaddingBottom: config.cabecalhoPaddingBottom || 15,
            cabecalhoBordaLargura: config.cabecalhoBordaLargura || 4,
            cabecalhoLogoSize: config.cabecalhoLogoSize || 80,
            cabecalhoPaddingHorizontal: config.cabecalhoPaddingHorizontal || 0,
            cabecalhoLineHeight: config.cabecalhoLineHeight || 1.4,
            // Controles do Carimbo
            carimboWidth: config.carimboWidth || 110,
            carimboHeight: config.carimboHeight || 110
        };

        // Data atual formatada
        const dataAtual = new Date().toLocaleDateString('pt-AO', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });

        // Data de admissão formatada
        const dataAdmissao = new Date(cliente.dataAdmissao).toLocaleDateString('pt-AO', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });

        // Formatar salário
        const salarioFormatado = cliente.salario.toLocaleString('pt-AO', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });

        return `
        <div class="modelo-declaracao-executivo" style="
            font-family: ${cfg.fontFamily};
            font-size: ${cfg.fontSize}pt;
            color: ${cfg.corTexto};
            line-height: ${cfg.espacamentoLinhas};
            width: 210mm;
            min-height: 297mm;
            max-height: 297mm;
            padding: 15mm 20mm;
            background: white;
            position: relative;
            box-sizing: border-box;
            margin: 0;
            overflow: hidden;
        ")
            
            <!-- MARCA D'ÁGUA DIAGONAL -->
            <div style="
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%) rotate(${cfg.marcaDaguaRotacao}deg);
                opacity: ${cfg.marcaDaguaOpacidade / 100};
                pointer-events: none;
                z-index: 0;
                text-align: center;
                width: ${cfg.marcaDaguaWidth}px;
                height: ${cfg.marcaDaguaHeight}px;
            ">
                ${empresa.logo ? `
                    <img src="${empresa.logo}" 
                         alt="Marca d'água" 
                         style="width: 100%; height: 100%; object-fit: contain;">
                ` : `
                    <div style="
                        width: 100%; 
                        height: 100%; 
                        display: flex; 
                        align-items: center; 
                        justify-content: center;
                        font-size: 80px; 
                        font-weight: bold; 
                        color: #ccc;
                    ">
                        ${empresa.nome}
                    </div>
                `}
            </div>

            <!-- CONTEÚDO -->
            <div style="position: relative; z-index: 1;">
                
                <!-- HEADER CORPORATIVO -->
                <div style="
                    display: flex;
                    justify-content: ${cfg.cabecalhoJustify};
                    align-items: flex-start;
                    padding-left: ${cfg.cabecalhoPaddingHorizontal}px;
                    padding-right: ${cfg.cabecalhoPaddingHorizontal}px;
                    padding-bottom: ${cfg.cabecalhoPaddingBottom}px;
                    margin-bottom: 12px;
                    border-bottom: ${cfg.cabecalhoBordaLargura}px solid ${cfg.corDestaque};
                ">
                    <!-- Logo -->
                    <div style="flex-shrink: 0; margin-right: ${cfg.cabecalhoMarginEntreLogoTexto}px;">
                        ${empresa.logo ? `
                            <img src="${empresa.logo}" 
                                 alt="Logo" 
                                 style="width: 65px; height: 65px; object-fit: contain;">
                        ` : `
                            <div style="
                                width: 65px; 
                                height: 65px; 
                                background: #f3f4f6; 
                                border-radius: 8px;
                                display: flex;
                                align-items: center;
                                justify-content: center;
                                font-size: ${cfg.cabecalhoLogoSize * 0.5}px;
                                color: #9ca3af;
                            ">🏢</div>
                        `}
                    </div>

                    <!-- Dados da Empresa -->
                    <div style="
                        text-align: ${cfg.alinhamentoCabecalho}; 
                        flex: 1;
                        line-height: ${cfg.cabecalhoLineHeight};
                    ">
                        <h1 style="
                            font-size: ${cfg.tamanhoSubtitulo}pt;
                            font-weight: bold;
                            color: ${cfg.corDestaque};
                            margin: 0 0 6px 0;
                        ">${empresa.nome}</h1>
                        
                        <div style="
                            font-size: ${cfg.tamanhoEmpresa}pt; 
                            line-height: 1.3;
                        ">
                            <p style="margin: 2px 0;"><strong>NIF/CC:</strong> ${empresa.nif}</p>
                            <p style="margin: 2px 0;"><strong>Sede:</strong> ${empresa.endereco.rua}${empresa.endereco.edificio ? ', ' + empresa.endereco.edificio : ''}${empresa.endereco.andar ? ', ' + empresa.endereco.andar : ''}${empresa.endereco.sala ? ', ' + empresa.endereco.sala : ''}</p>
                            <p style="margin: 2px 0;">Bairro ${empresa.endereco.bairro} — Município de ${empresa.endereco.municipio}</p>
                            <p style="margin: 2px 0;">${empresa.endereco.provincia} — ${empresa.endereco.pais}</p>
                        </div>
                    </div>
                </div>

                <!-- TÍTULO -->
                <div style="text-align: center; margin: 12px 0 10px 0;">
                    <h2 style="
                        font-size: ${cfg.tamanhoTitulo}pt;
                        font-weight: bold;
                        color: ${cfg.corDestaque};
                        letter-spacing: 1.5px;
                        margin: 0 0 6px 0;
                    ">${cfg.tituloDocumento}</h2>
                    <div style="
                        width: 80px;
                        height: 2.5px;
                        background: ${cfg.corDestaque};
                        margin: 0 auto;
                        border-radius: 2px;
                    "></div>
                </div>

                <!-- CORPO DO TEXTO -->
                <div style="text-align: ${cfg.alinhamentoTexto}; margin-bottom: 12px;">
                    <p style="margin-bottom: 8px;">
                        ${cfg.textoIntro} <strong style="color: ${cfg.corDestaque};">${cliente.nome}</strong>, 
                        portador(a) do Bilhete de Identidade n.º <strong>${cliente.bi}</strong>, 
                        exerce as funções de <strong style="color: ${cfg.corDestaque};">${cliente.cargo}</strong> 
                        na <strong>${empresa.nome}</strong>, NIF <strong>${empresa.nif}</strong>, 
                        sediada em ${empresa.endereco.rua}, ${empresa.endereco.municipio}, ${empresa.endereco.pais}.
                    </p>
                    
                    <p style="margin-bottom: 8px;">
                        O(A) colaborador(a) foi admitido(a) em <strong>${dataAdmissao}</strong>, 
                        desempenhando as suas funções com competência e profissionalismo.
                    </p>
                    
                    <p style="margin-bottom: 8px;">
                        Aufere mensalmente o vencimento bruto de 
                        <strong style="color: ${cfg.corDestaque};">${salarioFormatado} AKZ</strong>, 
                        acrescido dos subsídios legalmente estabelecidos.
                    </p>
                    
                    <p style="margin-bottom: 8px;">
                        A presente declaração é emitida a pedido do(a) interessado(a), para os devidos efeitos, 
                        nomeadamente comprovação de vínculo laboral e auferimento de rendimentos.
                    </p>
                </div>

                <!-- RODAPÉ -->
                <div style="margin-top: 15px;">
                    <p style="font-size: 9pt; margin-bottom: 20px;">
                        ${empresa.endereco.municipio}, aos ${dataAtual}.
                    </p>
                    
                    <!-- Assinatura e Carimbo Centralizados -->
                    <div style="
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                        justify-content: center;
                    ">
                        <p style="font-size: 9pt; font-weight: 600; margin-bottom: 12px;">
                            A Direcção da Empresa
                        </p>
                        
                        ${empresa.carimbo ? `
                            <img src="${empresa.carimbo}" 
                                 alt="Carimbo e Assinatura" 
                                 style="
                                    width: 90px; 
                                    height: 90px; 
                                    object-fit: contain; 
                                    opacity: 0.9;
                                    display: block;
                                 ">
                        ` : `
                            <div style="
                                width: 90px;
                                height: 90px;
                                border: 3px solid #999;
                                border-radius: 50%;
                                display: flex;
                                align-items: center;
                                justify-content: center;
                                font-size: 36px;
                                color: #999;
                            ">📌</div>
                        `}
                    </div>
                </div>

            </div>
        </div>
        `;
    }
};

// Exportar para uso global
if (typeof window !== 'undefined') {
    window.ModeloDeclaracaoExecutivo = ModeloDeclaracaoExecutivo;
}
