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
            fontSize: config.fontSize || 12,
            corTexto: config.corTexto || '#000000',
            corDestaque: config.corDestaque || empresa.corPrimaria || '#1e40af',
            marcaDaguaOpacidade: config.marcaDaguaOpacidade || 10,
            espacamentoLinhas: config.espacamentoLinhas || 1.6
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
            padding: 20mm;
            background: white;
            position: relative;
            box-shadow: 0 0 20px rgba(0,0,0,0.1);
            margin: 0 auto;
        ">
            
            <!-- MARCA D'ÁGUA DIAGONAL -->
            <div style="
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%) rotate(-45deg);
                opacity: ${cfg.marcaDaguaOpacidade / 100};
                pointer-events: none;
                z-index: 0;
                text-align: center;
            ">
                ${empresa.logo ? `
                    <img src="${empresa.logo}" 
                         alt="Marca d'água" 
                         style="max-width: 400px; max-height: 400px; object-fit: contain;">
                ` : `
                    <div style="font-size: 80px; font-weight: bold; color: #ccc;">
                        ${empresa.nome}
                    </div>
                `}
            </div>

            <!-- CONTEÚDO -->
            <div style="position: relative; z-index: 1;">
                
                <!-- HEADER CORPORATIVO -->
                <div style="
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                    padding-bottom: 15px;
                    margin-bottom: 20px;
                    border-bottom: 4px solid ${cfg.corDestaque};
                ">
                    <!-- Logo -->
                    <div style="flex-shrink: 0; margin-right: 20px;">
                        ${empresa.logo ? `
                            <img src="${empresa.logo}" 
                                 alt="Logo" 
                                 style="width: 80px; height: 80px; object-fit: contain;">
                        ` : `
                            <div style="
                                width: 80px; 
                                height: 80px; 
                                background: #f3f4f6; 
                                border-radius: 8px;
                                display: flex;
                                align-items: center;
                                justify-content: center;
                                font-size: 40px;
                                color: #9ca3af;
                            ">🏢</div>
                        `}
                    </div>

                    <!-- Dados da Empresa -->
                    <div style="text-align: right; flex: 1;">
                        <h1 style="
                            font-size: 22pt;
                            font-weight: bold;
                            color: ${cfg.corDestaque};
                            margin: 0 0 8px 0;
                        ">${empresa.nome}</h1>
                        <p style="font-size: 9pt; margin: 2px 0;">
                            <strong>NIF/CC:</strong> ${empresa.nif}
                        </p>
                        <p style="font-size: 8.5pt; margin: 2px 0; line-height: 1.3;">
                            <strong>Sede:</strong> ${empresa.endereco.rua}${empresa.endereco.edificio ? ', ' + empresa.endereco.edificio : ''}${empresa.endereco.andar ? ', ' + empresa.endereco.andar : ''}${empresa.endereco.sala ? ', ' + empresa.endereco.sala : ''}<br>
                            Bairro ${empresa.endereco.bairro} — Município de ${empresa.endereco.municipio}<br>
                            ${empresa.endereco.municipio} — ${empresa.endereco.pais}
                        </p>
                    </div>
                </div>

                <!-- TÍTULO -->
                <div style="text-align: center; margin: 40px 0 30px 0;">
                    <h2 style="
                        font-size: 28pt;
                        font-weight: bold;
                        color: ${cfg.corDestaque};
                        letter-spacing: 2px;
                        margin: 0 0 10px 0;
                    ">DECLARAÇÃO DE TRABALHO</h2>
                    <div style="
                        width: 120px;
                        height: 4px;
                        background: ${cfg.corDestaque};
                        margin: 0 auto;
                        border-radius: 2px;
                    "></div>
                </div>

                <!-- CORPO DO TEXTO -->
                <div style="text-align: justify; margin-bottom: 30px;">
                    <p style="margin-bottom: 15px;">
                        Declara-se, para os devidos efeitos, que <strong style="color: ${cfg.corDestaque};">${cliente.nome}</strong>, 
                        portador(a) do Bilhete de Identidade n.º <strong>${cliente.bi}</strong>, 
                        exerce actualmente as funções de <strong style="color: ${cfg.corDestaque};">${cliente.cargo}</strong> 
                        na <strong>${empresa.nome}</strong>, pessoa colectiva com o Número de Identificação Fiscal 
                        <strong>${empresa.nif}</strong>, com sede em ${empresa.endereco.rua}, ${empresa.endereco.municipio}, ${empresa.endereco.pais}.
                    </p>
                    
                    <p style="margin-bottom: 15px;">
                        O(A) referido(a) colaborador(a) foi admitido(a) em <strong>${dataAdmissao}</strong>, 
                        desempenhando as suas funções com competência, profissionalismo e dedicação, 
                        cumprindo integralmente com as responsabilidades inerentes ao seu cargo.
                    </p>
                    
                    <p style="margin-bottom: 15px;">
                        No exercício das suas funções, o(a) colaborador(a) aufere mensalmente o vencimento bruto de 
                        <strong style="color: ${cfg.corDestaque}; font-size: 13pt;">${salarioFormatado} AKZ</strong>, 
                        acrescido dos subsídios legalmente estabelecidos, demonstrando um desempenho exemplar 
                        no cumprimento das suas obrigações contratuais.
                    </p>
                    
                    <p style="margin-bottom: 15px;">
                        A presente declaração é emitida a pedido do(a) interessado(a), para os devidos efeitos, 
                        nomeadamente para comprovação de vínculo laboral, auferimento de rendimentos e 
                        quaisquer outras finalidades que entenda convenientes, podendo a mesma ser apresentada 
                        perante as entidades competentes.
                    </p>
                </div>

                <!-- RODAPÉ -->
                <div style="margin-top: 60px;">
                    <p style="font-size: 10pt; margin-bottom: 50px;">
                        ${empresa.endereco.municipio}, aos ${dataAtual}.
                    </p>
                    
                    <div style="
                        display: flex;
                        justify-content: space-between;
                        align-items: flex-end;
                    ">
                        <!-- Assinatura -->
                        <div style="text-align: center;">
                            <div style="
                                border-top: 2px solid #000;
                                padding-top: 8px;
                                width: 220px;
                            ">
                                <p style="font-size: 10pt; font-weight: 600; margin: 0;">
                                    O Director de Recursos Humanos
                                </p>
                                <p style="font-size: 8pt; color: #666; margin: 4px 0 0 0;">
                                    ${empresa.nome}
                                </p>
                            </div>
                        </div>
                        
                        <!-- Carimbo -->
                        <div style="text-align: center;">
                            ${empresa.carimbo ? `
                                <img src="${empresa.carimbo}" 
                                     alt="Carimbo" 
                                     style="width: 110px; height: 110px; object-fit: contain; opacity: 0.8;">
                            ` : `
                                <div style="
                                    width: 110px;
                                    height: 110px;
                                    border: 4px solid #999;
                                    border-radius: 50%;
                                    display: flex;
                                    align-items: center;
                                    justify-content: center;
                                    font-size: 50px;
                                    color: #999;
                                ">📌</div>
                            `}
                            <p style="font-size: 7pt; color: #666; margin-top: 5px;">
                                Carimbo e Assinatura
                            </p>
                        </div>
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
