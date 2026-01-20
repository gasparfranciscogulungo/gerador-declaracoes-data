/**
 * ============================================
 * LAYOUTS DE BI (BILHETE DE IDENTIDADE) - MÚLTIPLOS ESTILOS
 * 6 layouts profissionais para geração de documentos com fotos
 * ============================================
 * 
 * LAYOUTS DISPONÍVEIS:
 * 1. Executivo     - Corporativo robusto, completo com dados empresa
 * 2. Formal        - Tradicional com bordas decorativas
 * 3. Moderno       - Design contemporâneo com faixa lateral
 * 4. Minimalista   - Clean, elegante, pouco texto
 * 5. Simples       - Apenas fotos centralizadas (sem dados)
 * 6. Personalizável - 3 modos: auto+empresa, auto só nome, manual
 * 
 * FORMATO DE SAÍDA: HTML otimizado para jsPDF/html2pdf
 * TAMANHO: A4 (210mm x 297mm)
 */

const ModelosBI = {
    
    // ==========================================
    // UTILITÁRIOS COMUNS
    // ==========================================
    
    /**
     * Formata data para português de Angola/Portugal (extenso)
     */
    _formatarData(data) {
        if (!data) {
            return new Date().toLocaleDateString('pt-AO', {
                day: 'numeric',
                month: 'long',
                year: 'numeric'
            });
        }
        return new Date(data).toLocaleDateString('pt-AO', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
    },
    
    /**
     * Formata data curta DD/MM/AAAA
     */
    _formatarDataCurta(data) {
        if (!data) {
            return new Date().toLocaleDateString('pt-AO');
        }
        return new Date(data).toLocaleDateString('pt-AO');
    },
    
    /**
     * Retorna a cor profissional
     */
    _corProfissional(empresa, config) {
        if (config && config.corDestaque) {
            return config.corDestaque;
        }
        if (empresa && empresa.corPrimaria) {
            return empresa.corPrimaria;
        }
        return '#1a365d'; // Azul escuro profissional padrão
    },
    
    /**
     * Cor secundária (mais clara)
     */
    _corSecundaria(empresa, config) {
        if (config && config.corSecundaria) {
            return config.corSecundaria;
        }
        if (empresa && empresa.corSecundaria) {
            return empresa.corSecundaria;
        }
        return '#4a5568'; // Cinza profissional padrão
    },
    
    /**
     * Extrai dados do titular baseado no modo
     * @param {string} modo - 'auto_empresa', 'auto_so_nome', 'manual'
     * @param {object} empresa - Dados da empresa
     * @param {object} cliente - Dados do cliente/trabalhador
     * @param {object} dadosManuais - Dados preenchidos manualmente
     */
    _extrairDadosTitular(modo, empresa, cliente, dadosManuais = {}) {
        switch (modo) {
            case 'auto_empresa':
                // Dados automáticos + empresa
                return {
                    nome: cliente?.nome || 'Nome não informado',
                    bi: cliente?.documento || cliente?.bi || cliente?.nif || '',
                    empresa: empresa?.nome || '',
                    nifEmpresa: empresa?.nif || '',
                    mostrarEmpresa: true,
                    data: this._formatarDataCurta()
                };
            
            case 'auto_so_nome':
                // Apenas nome automático, sem empresa
                return {
                    nome: cliente?.nome || 'Nome não informado',
                    bi: cliente?.documento || cliente?.bi || cliente?.nif || '',
                    empresa: '',
                    nifEmpresa: '',
                    mostrarEmpresa: false,
                    data: this._formatarDataCurta()
                };
            
            case 'manual':
                // Todos os dados manuais
                return {
                    nome: dadosManuais.nome || 'Nome não informado',
                    bi: dadosManuais.biNif || '',
                    empresa: dadosManuais.empresa || '',
                    nifEmpresa: '',
                    mostrarEmpresa: !!dadosManuais.empresa,
                    data: dadosManuais.data || this._formatarDataCurta()
                };
            
            default:
                // Fallback: auto_empresa
                return this._extrairDadosTitular('auto_empresa', empresa, cliente, dadosManuais);
        }
    },
    
    /**
     * Container A4 padrão para PDF
     */
    _containerA4(conteudo, config = {}) {
        const fontFamily = config.fontFamily || 'Arial, Helvetica, sans-serif';
        
        return `
            <div style="
                font-family: ${fontFamily};
                width: 210mm;
                height: 297mm;
                background: white;
                position: relative;
                box-sizing: border-box;
                margin: 0;
                padding: 0;
                overflow: hidden;
            ">
                ${conteudo}
            </div>
        `;
    },
    
    // ==========================================
    // LAYOUT 1: EXECUTIVO (Corporativo Completo)
    // ==========================================
    
    executivo: {
        nome: 'Executivo',
        descricao: 'Layout corporativo profissional com dados completos',
        icone: 'bi-briefcase-fill',
        cor: '#1a365d',
        
        /**
         * Renderiza o layout executivo
         * @param {object} empresa - Dados da empresa
         * @param {object} cliente - Dados do cliente/trabalhador
         * @param {string} foto1 - Base64 da foto 1
         * @param {string} foto2 - Base64 da foto 2
         * @param {object} config - Configurações adicionais
         */
        renderizar(empresa, cliente, foto1, foto2, config = {}) {
            const utils = ModelosBI;
            const corPrimaria = utils._corProfissional(empresa, config);
            const modo = config.biModoPersonalizacao || 'auto_empresa';
            const dados = utils._extrairDadosTitular(modo, empresa, cliente, config.dadosManuais);
            
            const conteudo = `
                <!-- CABEÇALHO EXECUTIVO -->
                <div style="
                    background: linear-gradient(135deg, ${corPrimaria} 0%, ${corPrimaria}dd 100%);
                    padding: 12mm 15mm 10mm 15mm;
                    color: white;
                ">
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <div>
                            <h1 style="font-size: 22pt; font-weight: bold; margin: 0 0 4px 0; letter-spacing: 1px;">
                                BILHETE DE IDENTIDADE
                            </h1>
                            <p style="font-size: 10pt; opacity: 0.9; margin: 0;">
                                Documento de Identificação Pessoal
                            </p>
                        </div>
                        ${empresa?.logo ? `
                            <img src="${empresa.logo}" 
                                 alt="Logo" 
                                 crossorigin="anonymous"
                                 style="max-width: 70px; max-height: 70px; object-fit: contain; border-radius: 8px; background: white; padding: 4px;">
                        ` : ''}
                    </div>
                    
                    ${dados.mostrarEmpresa ? `
                        <div style="margin-top: 10px; padding-top: 10px; border-top: 1px solid rgba(255,255,255,0.3);">
                            <p style="font-size: 11pt; font-weight: bold; margin: 0;">${dados.empresa}</p>
                            ${dados.nifEmpresa ? `<p style="font-size: 9pt; opacity: 0.8; margin: 2px 0 0 0;">NIF: ${dados.nifEmpresa}</p>` : ''}
                        </div>
                    ` : ''}
                </div>
                
                <!-- DADOS DO TITULAR -->
                <div style="padding: 8mm 15mm;">
                    <div style="
                        background: #f8fafc;
                        border: 1px solid #e2e8f0;
                        border-left: 4px solid ${corPrimaria};
                        padding: 12px 16px;
                        border-radius: 0 8px 8px 0;
                        margin-bottom: 8mm;
                    ">
                        <table style="width: 100%; font-size: 10pt;">
                            <tr>
                                <td style="padding: 4px 0; color: #64748b; width: 120px;">Nome Completo:</td>
                                <td style="padding: 4px 0; font-weight: bold; color: #1e293b;">${dados.nome}</td>
                            </tr>
                            ${dados.bi ? `
                            <tr>
                                <td style="padding: 4px 0; color: #64748b;">BI / NIF:</td>
                                <td style="padding: 4px 0; font-weight: bold; color: #1e293b;">${dados.bi}</td>
                            </tr>
                            ` : ''}
                            <tr>
                                <td style="padding: 4px 0; color: #64748b;">Data:</td>
                                <td style="padding: 4px 0; color: #1e293b;">${dados.data}</td>
                            </tr>
                        </table>
                    </div>
                    
                    <!-- FOTOS -->
                    <div style="display: flex; flex-direction: column; gap: 6mm;">
                        <!-- Foto 1 -->
                        <div>
                            <p style="font-size: 9pt; color: ${corPrimaria}; font-weight: bold; margin: 0 0 4px 0;">
                                <span style="display: inline-block; width: 18px; height: 18px; background: ${corPrimaria}; color: white; border-radius: 50%; text-align: center; line-height: 18px; font-size: 10px; margin-right: 6px;">1</span>
                                Fotografia Frontal
                            </p>
                            <div style="
                                border: 2px solid #e2e8f0;
                                border-radius: 8px;
                                overflow: hidden;
                                background: #f8fafc;
                            ">
                                <img src="${foto1}" 
                                     alt="Foto 1" 
                                     style="width: 100%; height: 85mm; object-fit: contain; display: block;">
                            </div>
                        </div>
                        
                        <!-- Foto 2 -->
                        <div>
                            <p style="font-size: 9pt; color: ${corPrimaria}; font-weight: bold; margin: 0 0 4px 0;">
                                <span style="display: inline-block; width: 18px; height: 18px; background: ${corPrimaria}; color: white; border-radius: 50%; text-align: center; line-height: 18px; font-size: 10px; margin-right: 6px;">2</span>
                                Fotografia de Identificação
                            </p>
                            <div style="
                                border: 2px solid #e2e8f0;
                                border-radius: 8px;
                                overflow: hidden;
                                background: #f8fafc;
                            ">
                                <img src="${foto2}" 
                                     alt="Foto 2" 
                                     style="width: 100%; height: 85mm; object-fit: contain; display: block;">
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- RODAPÉ -->
                <div style="
                    position: absolute;
                    bottom: 0;
                    left: 0;
                    right: 0;
                    padding: 6mm 15mm;
                    background: #f8fafc;
                    border-top: 1px solid #e2e8f0;
                    text-align: center;
                ">
                    <p style="font-size: 7pt; color: #94a3b8; margin: 0;">
                        Documento gerado automaticamente • Verificar autenticidade junto à entidade emissora
                    </p>
                </div>
            `;
            
            return utils._containerA4(conteudo, config);
        }
    },
    
    // ==========================================
    // LAYOUT 2: FORMAL (Tradicional com Bordas)
    // ==========================================
    
    formal: {
        nome: 'Formal',
        descricao: 'Layout tradicional com bordas decorativas',
        icone: 'bi-file-earmark-text-fill',
        cor: '#2c5282',
        
        renderizar(empresa, cliente, foto1, foto2, config = {}) {
            const utils = ModelosBI;
            const corPrimaria = utils._corProfissional(empresa, config);
            const modo = config.biModoPersonalizacao || 'auto_empresa';
            const dados = utils._extrairDadosTitular(modo, empresa, cliente, config.dadosManuais);
            
            const conteudo = `
                <!-- BORDA DECORATIVA EXTERNA -->
                <div style="
                    position: absolute;
                    inset: 8mm;
                    border: 3px double ${corPrimaria};
                    border-radius: 2px;
                    pointer-events: none;
                "></div>
                
                <!-- CONTEÚDO -->
                <div style="padding: 15mm 18mm;">
                    
                    <!-- CABEÇALHO -->
                    <div style="text-align: center; margin-bottom: 8mm; padding-bottom: 6mm; border-bottom: 2px solid ${corPrimaria};">
                        ${empresa?.logo ? `
                            <img src="${empresa.logo}" 
                                 alt="Logo" 
                                 crossorigin="anonymous"
                                 style="max-width: 60px; max-height: 60px; object-fit: contain; margin-bottom: 6px;">
                        ` : ''}
                        
                        <h1 style="
                            font-size: 20pt;
                            font-weight: bold;
                            color: ${corPrimaria};
                            margin: 0 0 4px 0;
                            text-transform: uppercase;
                            letter-spacing: 3px;
                        ">Bilhete de Identidade</h1>
                        
                        ${dados.mostrarEmpresa ? `
                            <p style="font-size: 11pt; color: #4a5568; margin: 4px 0 0 0;">${dados.empresa}</p>
                        ` : ''}
                    </div>
                    
                    <!-- DADOS DO TITULAR -->
                    <div style="
                        background: linear-gradient(to right, ${corPrimaria}10, transparent);
                        padding: 10px 14px;
                        border-left: 3px solid ${corPrimaria};
                        margin-bottom: 6mm;
                    ">
                        <p style="font-size: 10pt; margin: 3px 0;">
                            <strong style="color: ${corPrimaria};">Nome:</strong> 
                            <span style="color: #1a202c;">${dados.nome}</span>
                        </p>
                        ${dados.bi ? `
                        <p style="font-size: 10pt; margin: 3px 0;">
                            <strong style="color: ${corPrimaria};">BI / NIF:</strong> 
                            <span style="color: #1a202c;">${dados.bi}</span>
                        </p>
                        ` : ''}
                        <p style="font-size: 9pt; margin: 3px 0;">
                            <strong style="color: ${corPrimaria};">Data:</strong> 
                            <span style="color: #4a5568;">${dados.data}</span>
                        </p>
                    </div>
                    
                    <!-- FOTOS -->
                    <div style="display: flex; flex-direction: column; gap: 5mm;">
                        <div style="text-align: center;">
                            <p style="font-size: 9pt; color: ${corPrimaria}; font-weight: bold; margin: 0 0 3px 0;">— Fotografia Frontal —</p>
                            <div style="
                                border: 2px solid ${corPrimaria};
                                padding: 3px;
                                display: inline-block;
                                background: white;
                            ">
                                <img src="${foto1}" 
                                     alt="Foto 1" 
                                     style="width: 170mm; height: 78mm; object-fit: contain; display: block;">
                            </div>
                        </div>
                        
                        <div style="text-align: center;">
                            <p style="font-size: 9pt; color: ${corPrimaria}; font-weight: bold; margin: 0 0 3px 0;">— Fotografia de Identificação —</p>
                            <div style="
                                border: 2px solid ${corPrimaria};
                                padding: 3px;
                                display: inline-block;
                                background: white;
                            ">
                                <img src="${foto2}" 
                                     alt="Foto 2" 
                                     style="width: 170mm; height: 78mm; object-fit: contain; display: block;">
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- RODAPÉ -->
                <div style="
                    position: absolute;
                    bottom: 12mm;
                    left: 18mm;
                    right: 18mm;
                    text-align: center;
                ">
                    <p style="font-size: 7pt; color: #718096; margin: 0; font-style: italic;">
                        Documento gerado para fins de identificação
                    </p>
                </div>
            `;
            
            return utils._containerA4(conteudo, config);
        }
    },
    
    // ==========================================
    // LAYOUT 3: MODERNO (Design Contemporâneo)
    // ==========================================
    
    moderno: {
        nome: 'Moderno',
        descricao: 'Design contemporâneo com faixa lateral colorida',
        icone: 'bi-lightning-fill',
        cor: '#6366f1',
        
        renderizar(empresa, cliente, foto1, foto2, config = {}) {
            const utils = ModelosBI;
            const corPrimaria = utils._corProfissional(empresa, config);
            const modo = config.biModoPersonalizacao || 'auto_empresa';
            const dados = utils._extrairDadosTitular(modo, empresa, cliente, config.dadosManuais);
            
            const conteudo = `
                <!-- FAIXA LATERAL -->
                <div style="
                    position: absolute;
                    left: 0;
                    top: 0;
                    bottom: 0;
                    width: 12mm;
                    background: linear-gradient(180deg, ${corPrimaria} 0%, ${corPrimaria}aa 50%, ${corPrimaria} 100%);
                "></div>
                
                <!-- CONTEÚDO PRINCIPAL -->
                <div style="margin-left: 12mm; padding: 12mm 15mm 12mm 10mm;">
                    
                    <!-- HEADER -->
                    <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8mm;">
                        <div>
                            <h1 style="
                                font-size: 24pt;
                                font-weight: 800;
                                color: ${corPrimaria};
                                margin: 0;
                                line-height: 1.1;
                            ">BI</h1>
                            <p style="
                                font-size: 10pt;
                                color: #64748b;
                                margin: 2px 0 0 0;
                                text-transform: uppercase;
                                letter-spacing: 2px;
                            ">Bilhete de Identidade</p>
                        </div>
                        
                        ${empresa?.logo ? `
                            <img src="${empresa.logo}" 
                                 alt="Logo" 
                                 crossorigin="anonymous"
                                 style="max-width: 55px; max-height: 55px; object-fit: contain;">
                        ` : ''}
                    </div>
                    
                    <!-- CARD DE DADOS -->
                    <div style="
                        background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
                        border-radius: 12px;
                        padding: 14px 18px;
                        margin-bottom: 6mm;
                        box-shadow: 0 2px 8px rgba(0,0,0,0.06);
                    ">
                        <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 8px;">
                            <div style="
                                width: 36px;
                                height: 36px;
                                background: ${corPrimaria};
                                border-radius: 50%;
                                display: flex;
                                align-items: center;
                                justify-content: center;
                                color: white;
                                font-weight: bold;
                                font-size: 14pt;
                            ">
                                ${dados.nome.charAt(0).toUpperCase()}
                            </div>
                            <div>
                                <p style="font-size: 12pt; font-weight: bold; color: #1e293b; margin: 0;">${dados.nome}</p>
                                ${dados.bi ? `<p style="font-size: 9pt; color: #64748b; margin: 2px 0 0 0;">${dados.bi}</p>` : ''}
                            </div>
                        </div>
                        
                        ${dados.mostrarEmpresa ? `
                            <div style="border-top: 1px solid #e2e8f0; padding-top: 8px; margin-top: 4px;">
                                <p style="font-size: 9pt; color: #64748b; margin: 0;">
                                    <span style="color: ${corPrimaria};">●</span> ${dados.empresa}
                                </p>
                            </div>
                        ` : ''}
                    </div>
                    
                    <!-- FOTOS EM GRID MODERNO -->
                    <div style="display: flex; flex-direction: column; gap: 5mm;">
                        <div style="
                            background: white;
                            border-radius: 12px;
                            overflow: hidden;
                            box-shadow: 0 4px 12px rgba(0,0,0,0.08);
                        ">
                            <div style="background: ${corPrimaria}; padding: 6px 12px;">
                                <p style="font-size: 8pt; color: white; margin: 0; font-weight: 600;">FOTO 1 • FRONTAL</p>
                            </div>
                            <img src="${foto1}" 
                                 alt="Foto 1" 
                                 style="width: 100%; height: 82mm; object-fit: contain; display: block; background: #f8fafc;">
                        </div>
                        
                        <div style="
                            background: white;
                            border-radius: 12px;
                            overflow: hidden;
                            box-shadow: 0 4px 12px rgba(0,0,0,0.08);
                        ">
                            <div style="background: ${corPrimaria}; padding: 6px 12px;">
                                <p style="font-size: 8pt; color: white; margin: 0; font-weight: 600;">FOTO 2 • IDENTIFICAÇÃO</p>
                            </div>
                            <img src="${foto2}" 
                                 alt="Foto 2" 
                                 style="width: 100%; height: 82mm; object-fit: contain; display: block; background: #f8fafc;">
                        </div>
                    </div>
                </div>
                
                <!-- DATA NO RODAPÉ -->
                <div style="
                    position: absolute;
                    bottom: 8mm;
                    right: 15mm;
                ">
                    <p style="font-size: 8pt; color: #94a3b8; margin: 0;">${dados.data}</p>
                </div>
            `;
            
            return utils._containerA4(conteudo, config);
        }
    },
    
    // ==========================================
    // LAYOUT 4: MINIMALISTA (Clean e Elegante)
    // ==========================================
    
    minimalista: {
        nome: 'Minimalista',
        descricao: 'Design clean e elegante com foco nas fotos',
        icone: 'bi-subtract',
        cor: '#374151',
        
        renderizar(empresa, cliente, foto1, foto2, config = {}) {
            const utils = ModelosBI;
            const corPrimaria = utils._corProfissional(empresa, config);
            const modo = config.biModoPersonalizacao || 'auto_empresa';
            const dados = utils._extrairDadosTitular(modo, empresa, cliente, config.dadosManuais);
            
            const conteudo = `
                <div style="padding: 20mm 20mm 15mm 20mm; height: 100%; box-sizing: border-box;">
                    
                    <!-- HEADER MINIMALISTA -->
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10mm;">
                        <div>
                            <p style="
                                font-size: 8pt;
                                color: #9ca3af;
                                text-transform: uppercase;
                                letter-spacing: 3px;
                                margin: 0 0 4px 0;
                            ">Documento de Identificação</p>
                            <h1 style="
                                font-size: 18pt;
                                font-weight: 300;
                                color: #1f2937;
                                margin: 0;
                            ">${dados.nome}</h1>
                            ${dados.bi ? `
                                <p style="font-size: 10pt; color: #6b7280; margin: 4px 0 0 0;">${dados.bi}</p>
                            ` : ''}
                        </div>
                        
                        ${empresa?.logo ? `
                            <img src="${empresa.logo}" 
                                 alt="Logo" 
                                 crossorigin="anonymous"
                                 style="max-width: 45px; max-height: 45px; object-fit: contain; opacity: 0.8;">
                        ` : ''}
                    </div>
                    
                    <!-- LINHA SEPARADORA -->
                    <div style="height: 1px; background: linear-gradient(to right, ${corPrimaria}, transparent); margin-bottom: 10mm;"></div>
                    
                    <!-- FOTOS -->
                    <div style="display: flex; flex-direction: column; gap: 8mm;">
                        <div>
                            <img src="${foto1}" 
                                 alt="Foto 1" 
                                 style="
                                    width: 100%;
                                    height: 95mm;
                                    object-fit: contain;
                                    display: block;
                                    border: 1px solid #e5e7eb;
                                 ">
                        </div>
                        
                        <div>
                            <img src="${foto2}" 
                                 alt="Foto 2" 
                                 style="
                                    width: 100%;
                                    height: 95mm;
                                    object-fit: contain;
                                    display: block;
                                    border: 1px solid #e5e7eb;
                                 ">
                        </div>
                    </div>
                    
                    <!-- FOOTER -->
                    <div style="
                        position: absolute;
                        bottom: 15mm;
                        left: 20mm;
                        right: 20mm;
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                    ">
                        ${dados.mostrarEmpresa ? `
                            <p style="font-size: 8pt; color: #9ca3af; margin: 0;">${dados.empresa}</p>
                        ` : '<span></span>'}
                        <p style="font-size: 8pt; color: #9ca3af; margin: 0;">${dados.data}</p>
                    </div>
                </div>
            `;
            
            return utils._containerA4(conteudo, config);
        }
    },
    
    // ==========================================
    // LAYOUT 5: SIMPLES (Apenas Fotos Centralizadas)
    // ==========================================
    
    simples: {
        nome: 'Simples',
        descricao: 'Apenas as fotos centralizadas, sem dados adicionais',
        icone: 'bi-image-fill',
        cor: '#059669',
        
        renderizar(empresa, cliente, foto1, foto2, config = {}) {
            const utils = ModelosBI;
            
            const conteudo = `
                <div style="
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                    align-items: center;
                    height: 100%;
                    padding: 15mm;
                    box-sizing: border-box;
                    gap: 8mm;
                ">
                    <!-- FOTO 1 -->
                    <div style="
                        flex: 1;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        width: 100%;
                    ">
                        <img src="${foto1}" 
                             alt="Foto 1" 
                             style="
                                max-width: 100%;
                                max-height: 125mm;
                                object-fit: contain;
                                border: 1px solid #e5e7eb;
                             ">
                    </div>
                    
                    <!-- SEPARADOR SUTIL -->
                    <div style="
                        width: 60%;
                        height: 1px;
                        background: #e5e7eb;
                    "></div>
                    
                    <!-- FOTO 2 -->
                    <div style="
                        flex: 1;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        width: 100%;
                    ">
                        <img src="${foto2}" 
                             alt="Foto 2" 
                             style="
                                max-width: 100%;
                                max-height: 125mm;
                                object-fit: contain;
                                border: 1px solid #e5e7eb;
                             ">
                    </div>
                </div>
            `;
            
            return utils._containerA4(conteudo, config);
        }
    },
    
    // ==========================================
    // LAYOUT 6: PERSONALIZÁVEL (3 Modos de Dados)
    // ==========================================
    
    personalizavel: {
        nome: 'Personalizável',
        descricao: 'Escolha entre: automático com empresa, só nome, ou manual',
        icone: 'bi-sliders',
        cor: '#7c3aed',
        
        renderizar(empresa, cliente, foto1, foto2, config = {}) {
            const utils = ModelosBI;
            const corPrimaria = utils._corProfissional(empresa, config);
            const modo = config.biModoPersonalizacao || 'auto_empresa';
            const dados = utils._extrairDadosTitular(modo, empresa, cliente, config.dadosManuais);
            
            // Determinar estilo baseado no modo
            let modoLabel = '';
            switch (modo) {
                case 'auto_empresa':
                    modoLabel = 'Automático + Empresa';
                    break;
                case 'auto_so_nome':
                    modoLabel = 'Apenas Nome';
                    break;
                case 'manual':
                    modoLabel = 'Manual';
                    break;
            }
            
            const conteudo = `
                <!-- HEADER PERSONALIZADO -->
                <div style="
                    background: ${corPrimaria};
                    padding: 10mm 15mm;
                    color: white;
                ">
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <div>
                            <p style="
                                font-size: 7pt;
                                text-transform: uppercase;
                                letter-spacing: 2px;
                                opacity: 0.8;
                                margin: 0 0 2px 0;
                            ">${modoLabel}</p>
                            <h1 style="
                                font-size: 18pt;
                                font-weight: bold;
                                margin: 0;
                            ">Bilhete de Identidade</h1>
                        </div>
                        
                        ${(empresa?.logo && modo !== 'manual') ? `
                            <img src="${empresa.logo}" 
                                 alt="Logo" 
                                 crossorigin="anonymous"
                                 style="max-width: 55px; max-height: 55px; object-fit: contain; background: white; border-radius: 6px; padding: 3px;">
                        ` : ''}
                    </div>
                </div>
                
                <!-- CORPO -->
                <div style="padding: 8mm 15mm;">
                    
                    <!-- DADOS (se houver) -->
                    ${(dados.nome && dados.nome !== 'Nome não informado') ? `
                        <div style="
                            background: #f9fafb;
                            border: 1px solid #e5e7eb;
                            border-radius: 8px;
                            padding: 12px 16px;
                            margin-bottom: 8mm;
                        ">
                            <p style="font-size: 11pt; margin: 0 0 4px 0;">
                                <strong style="color: ${corPrimaria};">Nome:</strong> 
                                <span style="color: #1f2937;">${dados.nome}</span>
                            </p>
                            ${dados.bi ? `
                                <p style="font-size: 10pt; margin: 0; color: #6b7280;">
                                    <strong style="color: ${corPrimaria};">BI/NIF:</strong> ${dados.bi}
                                </p>
                            ` : ''}
                            ${dados.mostrarEmpresa ? `
                                <p style="font-size: 9pt; margin: 4px 0 0 0; color: #9ca3af;">
                                    ${dados.empresa}
                                </p>
                            ` : ''}
                        </div>
                    ` : ''}
                    
                    <!-- FOTOS -->
                    <div style="display: flex; flex-direction: column; gap: 6mm;">
                        <div style="
                            border: 2px solid #e5e7eb;
                            border-radius: 8px;
                            overflow: hidden;
                        ">
                            <div style="background: #f3f4f6; padding: 4px 10px; border-bottom: 1px solid #e5e7eb;">
                                <p style="font-size: 8pt; color: #6b7280; margin: 0; font-weight: 500;">Foto Superior</p>
                            </div>
                            <img src="${foto1}" 
                                 alt="Foto 1" 
                                 style="width: 100%; height: 88mm; object-fit: contain; display: block; background: white;">
                        </div>
                        
                        <div style="
                            border: 2px solid #e5e7eb;
                            border-radius: 8px;
                            overflow: hidden;
                        ">
                            <div style="background: #f3f4f6; padding: 4px 10px; border-bottom: 1px solid #e5e7eb;">
                                <p style="font-size: 8pt; color: #6b7280; margin: 0; font-weight: 500;">Foto Inferior</p>
                            </div>
                            <img src="${foto2}" 
                                 alt="Foto 2" 
                                 style="width: 100%; height: 88mm; object-fit: contain; display: block; background: white;">
                        </div>
                    </div>
                </div>
                
                <!-- RODAPÉ -->
                <div style="
                    position: absolute;
                    bottom: 0;
                    left: 0;
                    right: 0;
                    padding: 5mm 15mm;
                    background: #f9fafb;
                    border-top: 1px solid #e5e7eb;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                ">
                    <p style="font-size: 7pt; color: #9ca3af; margin: 0;">
                        Documento gerado automaticamente
                    </p>
                    <p style="font-size: 7pt; color: #9ca3af; margin: 0;">${dados.data}</p>
                </div>
            `;
            
            return utils._containerA4(conteudo, config);
        }
    },
    
    // ==========================================
    // MÉTODO PRINCIPAL: RENDERIZAR LAYOUT
    // ==========================================
    
    /**
     * Renderiza o layout selecionado
     * @param {string} layout - Nome do layout ('executivo', 'formal', etc.)
     * @param {object} empresa - Dados da empresa
     * @param {object} cliente - Dados do cliente/trabalhador
     * @param {string} foto1 - Base64 da foto 1
     * @param {string} foto2 - Base64 da foto 2
     * @param {object} config - Configurações adicionais
     * @returns {string} HTML do documento
     */
    renderizar(layout, empresa, cliente, foto1, foto2, config = {}) {
        const layoutObj = this[layout];
        
        if (!layoutObj || typeof layoutObj.renderizar !== 'function') {
            console.warn(`Layout "${layout}" não encontrado. Usando "executivo".`);
            return this.executivo.renderizar(empresa, cliente, foto1, foto2, config);
        }
        
        return layoutObj.renderizar(empresa, cliente, foto1, foto2, config);
    },
    
    /**
     * Retorna lista de layouts disponíveis
     * @returns {Array} Lista de layouts com nome, descrição, ícone e cor
     */
    listarLayouts() {
        return [
            { id: 'executivo', ...this.executivo },
            { id: 'formal', ...this.formal },
            { id: 'moderno', ...this.moderno },
            { id: 'minimalista', ...this.minimalista },
            { id: 'simples', ...this.simples },
            { id: 'personalizavel', ...this.personalizavel }
        ].map(l => ({
            id: l.id,
            nome: l.nome,
            descricao: l.descricao,
            icone: l.icone,
            cor: l.cor
        }));
    }
};

// Exportar para uso global
if (typeof window !== 'undefined') {
    window.ModelosBI = ModelosBI;
}
