// ============================================
// USER-PANEL-CONTROLLER.JS
// Lógica do painel do usuário (operador)
// Usuário VÊ empresas (criadas pelo admin)
// Usuário CRIA seus próprios trabalhadores
// Usuário GERA PDFs usando empresas + seus trabalhadores
// ============================================

function userPanelApp() {
    return {
        // ========== ESTADO ==========
        usuario: null,
        usuarioData: null, // Dados completos do users.json (role, status, etc)
        empresasDisponiveis: [], // Empresas criadas pelo admin (READ-ONLY)
        meusTrabalhadores: [], // Só os trabalhadores criados por este user
        meuHistorico: [], // Só os PDFs gerados por este user
        darkMode: localStorage.getItem('darkMode') === 'true',
        mobileMenuOpen: false,
        
        // Modal de aguardando
        modalAguardando: false,
        mensagemAguardando: '',
        statusAguardando: '', // pending, blocked, not_found
        
        activeTab: 'dashboard',
        loading: false,
        loadingMessage: 'Carregando...',
        uploadProgress: null,
        
        alert: {
            show: false,
            type: 'success',
            message: ''
        },
        
        // STATS PESSOAIS
        stats: {
            totalTrabalhadores: 0,
            pdfsMesAtual: 0,
            limiteRestante: 0,
            empresasDisponiveis: 0
        },
        
        config: {
            owner: CONFIG.github.owner,
            repo: CONFIG.github.repo
        },
        
        // Modals
        modalNovoTrabalhador: false,
        modalEditarTrabalhador: false,
        modalPreviewModelo: false,
        modalFluxoGeracao: false,
        modalCropperBI: false,
        
        // Fluxo de Geração
        fluxoEtapa: 1,
        fluxoEmpresaSelecionada: null,
        fluxoTrabalhadorSelecionado: null,
        fluxoTipoDocumento: null,
        fluxoBuscaEmpresa: '',
        fluxoBuscaTrabalhador: '',
        
        // Preview
        tipoPreview: 'declaracao',
        mostrarPersonalizacao: false,
        menuPreviewOpen: false,
        
        // Trabalhador em edição
        trabalhadorEmEdicao: null,
        formTrabalhador: {
            nome: '',
            documento: '',
            tipo_documento: 'BI',
            nif: '',
            data_nascimento: '',
            nacionalidade: 'Angolana',
            morada: '',
            cidade: '',
            telefone: '',
            email: '',
            funcao: '',
            departamento: '',
            data_admissao: '',
            tipo_contrato: 'Contrato sem termo',
            salario_bruto: '',
            salario_liquido: '',
            moeda: 'AKZ',
            iban: '',
            empresa_id: '', // Empresa onde trabalha
            ativo: true,
            observacoes: ''
        },
        
        // Personalização
        previewConfig: {
            fontFamily: 'Arial',
            fontSize: 12,
            tamanhoTitulo: 24,
            tamanhoSubtitulo: 16,
            tamanhoEmpresa: 9,
            corTexto: '#000000',
            corDestaque: '#091f67',
            espacamentoLinhas: 1.8,
            zoom: 55,
            tituloDocumento: 'Declaração de Serviço',
            textoIntro: 'Declara-se, para os devidos efeitos, que',
            alinhamentoTexto: 'justify',
            alinhamentoCabecalho: 'left'
        },
        
        // ========== LIFECYCLE ==========
        
        async init() {
            console.log('🚀 Iniciando User Panel...');
            
            this.loading = true;
            this.loadingMessage = 'Verificando autenticação...';
            
            try {
                // Verificar token
                const token = authManager.carregarToken();
                if (!token) {
                    console.log('❌ Token não encontrado');
                    window.location.href = 'index.html';
                    return;
                }
                
                // Configurar GitHub API
                githubAPI.setToken(token);
                githubAPI.configurar(CONFIG.github);
                
                // Obter usuário do GitHub
                this.loadingMessage = 'Carregando perfil...';
                this.usuario = await githubAPI.getAuthenticatedUser();
                console.log('✅ Usuário GitHub:', this.usuario.login);
                
                // ========== VERIFICAÇÃO DE AUTORIZAÇÃO ==========
                this.loadingMessage = 'Verificando autorização...';
                const userManager = new UserManager();
                
                const autorizacao = await userManager.verificarAutorizacao(
                    this.usuario.login,
                    token
                );
                
                console.log('🔐 Autorização:', autorizacao);
                
                // Se não encontrado, redirecionar
                if (autorizacao.status === 'not_found') {
                    console.error('❌ Usuário não cadastrado');
                    this.mostrarTelaAguardando('not_found');
                    return;
                }
                
                // Se é admin, redirecionar para admin.html
                if (autorizacao.user.role === 'admin') {
                    console.log('⚠️ Admin detectado, redirecionando...');
                    this.showAlert('success', 'Redirecionando para painel administrativo...');
                    setTimeout(() => {
                        window.location.href = 'admin.html';
                    }, 1500);
                    return;
                }
                
                // Se não está ativo, mostrar tela de aguardando
                if (autorizacao.status !== 'active') {
                    console.warn(`⏳ Conta com status: ${autorizacao.status}`);
                    this.mostrarTelaAguardando(autorizacao.status);
                    return;
                }
                
                // Usuário autorizado!
                this.usuarioData = autorizacao.user;
                console.log('✅ Acesso autorizado:', {
                    username: this.usuario.login,
                    role: autorizacao.user.role,
                    status: autorizacao.status
                });
                
                // Carregar dados
                await this.carregarDados();
                
                this.loading = false;
                console.log('✅ User Panel carregado com sucesso!');
                
            } catch (error) {
                console.error('❌ Erro ao inicializar:', error);
                this.showAlert('error', 'Erro ao carregar painel: ' + error.message);
                this.loading = false;
            }
        },
        
        // ========== TELA DE AGUARDANDO ==========
        
        mostrarTelaAguardando(status) {
            this.statusAguardando = status;
            this.loading = false;
            
            const mensagens = {
                pending: '⏳ Sua conta está aguardando aprovação do administrador.\n\nVocê receberá acesso em breve.',
                blocked: '🚫 Sua conta foi bloqueada.\n\nEntre em contato com o administrador para mais informações.',
                not_found: '❓ Conta não encontrada no sistema.\n\nFaça login novamente ou entre em contato com o administrador.'
            };
            
            this.mensagemAguardando = mensagens[status] || 'Status desconhecido.';
            this.modalAguardando = true;
            
            console.log('🔒 Acesso bloqueado - Status:', status);
        },
        
        async carregarDados() {
            this.loading = true;
            this.loadingMessage = 'Carregando dados...';
            
            try {
                // Carregar empresas (todas - criadas pelo admin)
                await this.carregarEmpresas();
                
                // Carregar trabalhadores (só os meus)
                await this.carregarMeusTrabalhadores();
                
                // Carregar histórico (só o meu)
                await this.carregarMeuHistorico();
                
                // Calcular estatísticas
                this.calcularStats();
                
            } catch (error) {
                console.error('❌ Erro ao carregar dados:', error);
                throw error;
            } finally {
                this.loading = false;
            }
        },
        
        // ========== EMPRESAS (READ-ONLY) ==========
        
        async carregarEmpresas() {
            try {
                console.log('📂 Carregando empresas...');
                
                const arquivo = await githubAPI.lerJSON('data/empresas.json');
                
                if (arquivo && arquivo.data) {
                    // Carregar TODAS as empresas (criadas pelo admin)
                    this.empresasDisponiveis = arquivo.data.empresas || [];
                    console.log(`✅ ${this.empresasDisponiveis.length} empresas disponíveis`);
                } else {
                    this.empresasDisponiveis = [];
                }
                
            } catch (error) {
                console.error('❌ Erro ao carregar empresas:', error);
                this.empresasDisponiveis = [];
            }
        },
        
        getEmpresaPorId(id) {
            return this.empresasDisponiveis.find(e => e.id === id);
        },
        
        // ========== TRABALHADORES (MEUS) ==========
        
        async carregarMeusTrabalhadores() {
            try {
                console.log('📂 Carregando meus trabalhadores...');
                
                const arquivo = await githubAPI.lerJSON('data/trabalhadores.json');
                
                if (arquivo && arquivo.data) {
                    const todos = arquivo.data.trabalhadores || [];
                    
                    // Filtrar: Só os trabalhadores criados por MIM
                    this.meusTrabalhadores = todos.filter(t => 
                        t.usuario_id === this.usuario.username || 
                        t.criado_por === this.usuario.username
                    );
                    
                    console.log(`✅ ${this.meusTrabalhadores.length} trabalhadores meus`);
                } else {
                    this.meusTrabalhadores = [];
                }
                
            } catch (error) {
                console.error('❌ Erro ao carregar trabalhadores:', error);
                this.meusTrabalhadores = [];
            }
        },
        
        async salvarTrabalhador() {
            try {
                if (!this.validarFormTrabalhador()) {
                    return;
                }
                
                this.loading = true;
                this.loadingMessage = 'Salvando trabalhador...';
                
                // Carregar todos os trabalhadores
                const arquivo = await githubAPI.lerJSON('data/trabalhadores.json');
                let trabalhadores = arquivo?.data?.trabalhadores || [];
                
                if (this.trabalhadorEmEdicao) {
                    // Editar existente
                    const index = trabalhadores.findIndex(t => t.id === this.trabalhadorEmEdicao.id);
                    if (index !== -1) {
                        trabalhadores[index] = {
                            ...this.formTrabalhador,
                            id: this.trabalhadorEmEdicao.id,
                            usuario_id: this.usuario.username,
                            criado_por: this.usuario.username,
                            data_atualizacao: new Date().toISOString()
                        };
                    }
                } else {
                    // Criar novo
                    const novoTrabalhador = {
                        ...this.formTrabalhador,
                        id: `TRAB-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
                        usuario_id: this.usuario.username,
                        criado_por: this.usuario.username,
                        data_criacao: new Date().toISOString()
                    };
                    trabalhadores.push(novoTrabalhador);
                }
                
                // Salvar no GitHub
                await githubAPI.salvarArquivo(
                    'data/trabalhadores.json',
                    JSON.stringify({ trabalhadores }, null, 2),
                    `${this.trabalhadorEmEdicao ? 'Update' : 'Add'} trabalhador: ${this.formTrabalhador.nome}`
                );
                
                // Recarregar
                await this.carregarMeusTrabalhadores();
                this.calcularStats();
                
                // Fechar modal
                this.modalNovoTrabalhador = false;
                this.modalEditarTrabalhador = false;
                this.limparFormTrabalhador();
                
                this.showAlert('success', 'Trabalhador salvo com sucesso!');
                
            } catch (error) {
                console.error('❌ Erro ao salvar trabalhador:', error);
                this.showAlert('error', 'Erro ao salvar trabalhador');
            } finally {
                this.loading = false;
            }
        },
        
        abrirModalNovoTrabalhador() {
            this.limparFormTrabalhador();
            this.trabalhadorEmEdicao = null;
            this.modalNovoTrabalhador = true;
        },
        
        abrirModalEditarTrabalhador(trabalhador) {
            this.trabalhadorEmEdicao = trabalhador;
            this.formTrabalhador = { ...trabalhador };
            this.modalEditarTrabalhador = true;
        },
        
        async excluirTrabalhador(id) {
            if (!confirm('Tem certeza que deseja excluir este trabalhador?')) {
                return;
            }
            
            try {
                this.loading = true;
                this.loadingMessage = 'Excluindo trabalhador...';
                
                const arquivo = await githubAPI.lerJSON('data/trabalhadores.json');
                let trabalhadores = arquivo?.data?.trabalhadores || [];
                
                trabalhadores = trabalhadores.filter(t => t.id !== id);
                
                await githubAPI.salvarArquivo(
                    'data/trabalhadores.json',
                    JSON.stringify({ trabalhadores }, null, 2),
                    'Delete trabalhador'
                );
                
                await this.carregarMeusTrabalhadores();
                this.calcularStats();
                
                this.showAlert('success', 'Trabalhador excluído!');
                
            } catch (error) {
                console.error('❌ Erro ao excluir:', error);
                this.showAlert('error', 'Erro ao excluir trabalhador');
            } finally {
                this.loading = false;
            }
        },
        
        validarFormTrabalhador() {
            if (!this.formTrabalhador.nome.trim()) {
                this.showAlert('error', 'Nome é obrigatório');
                return false;
            }
            
            if (!this.formTrabalhador.documento.trim()) {
                this.showAlert('error', 'Documento é obrigatório');
                return false;
            }
            
            if (!this.formTrabalhador.empresa_id) {
                this.showAlert('error', 'Selecione uma empresa');
                return false;
            }
            
            return true;
        },
        
        limparFormTrabalhador() {
            this.formTrabalhador = {
                nome: '',
                documento: '',
                tipo_documento: 'BI',
                nif: '',
                data_nascimento: '',
                nacionalidade: 'Angolana',
                morada: '',
                cidade: '',
                telefone: '',
                email: '',
                funcao: '',
                departamento: '',
                data_admissao: '',
                tipo_contrato: 'Contrato sem termo',
                salario_bruto: '',
                salario_liquido: '',
                moeda: 'AKZ',
                iban: '',
                empresa_id: '',
                ativo: true,
                observacoes: ''
            };
        },
        
        // ========== FLUXO DE GERAÇÃO ==========
        
        abrirFluxoGeracao() {
            this.fluxoEtapa = 1;
            this.fluxoEmpresaSelecionada = null;
            this.fluxoTrabalhadorSelecionado = null;
            this.fluxoTipoDocumento = null;
            this.modalFluxoGeracao = true;
        },
        
        selecionarEmpresaFluxo(empresa) {
            this.fluxoEmpresaSelecionada = empresa;
            this.fluxoEtapa = 2;
        },
        
        selecionarTrabalhadorFluxo(trabalhador) {
            this.fluxoTrabalhadorSelecionado = trabalhador;
            this.fluxoEtapa = 3;
        },
        
        selecionarTipoDocumento(tipo) {
            this.fluxoTipoDocumento = tipo;
            this.tipoPreview = tipo;
            
            // Abrir preview
            this.modalFluxoGeracao = false;
            this.modalPreviewModelo = true;
        },
        
        voltarEtapa() {
            if (this.fluxoEtapa > 1) {
                this.fluxoEtapa--;
                
                if (this.fluxoEtapa === 1) {
                    this.fluxoEmpresaSelecionada = null;
                } else if (this.fluxoEtapa === 2) {
                    this.fluxoTrabalhadorSelecionado = null;
                }
            }
        },
        
        // ========== HISTÓRICO ==========
        
        async carregarMeuHistorico() {
            // TODO: Implementar quando houver sistema de histórico
            this.meuHistorico = [];
        },
        
        // ========== ESTATÍSTICAS ==========
        
        calcularStats() {
            this.stats.totalTrabalhadores = this.meusTrabalhadores.length;
            this.stats.empresasDisponiveis = this.empresasDisponiveis.length;
            this.stats.pdfsMesAtual = this.meuHistorico.length; // Por enquanto
            this.stats.limiteRestante = 50 - this.stats.pdfsMesAtual; // Exemplo: limite de 50
        },
        
        // ========== FILTROS ==========
        
        get empresasFiltradas() {
            if (!this.fluxoBuscaEmpresa) {
                return this.empresasDisponiveis;
            }
            
            const busca = this.fluxoBuscaEmpresa.toLowerCase();
            return this.empresasDisponiveis.filter(e => 
                e.nome.toLowerCase().includes(busca) ||
                e.nif.includes(busca)
            );
        },
        
        get trabalhadoresFiltrados() {
            if (!this.fluxoBuscaTrabalhador) {
                return this.meusTrabalhadores;
            }
            
            const busca = this.fluxoBuscaTrabalhador.toLowerCase();
            return this.meusTrabalhadores.filter(t => 
                t.nome.toLowerCase().includes(busca) ||
                t.documento.includes(busca) ||
                t.nif?.includes(busca)
            );
        },
        
        // ========== DARK MODE ==========
        
        toggleDarkMode() {
            this.darkMode = !this.darkMode;
            localStorage.setItem('darkMode', this.darkMode.toString());
        },
        
        // ========== NOTIFICAÇÕES ==========
        
        showAlert(type, message) {
            this.alert = {
                show: true,
                type: type,
                message: message
            };
            
            setTimeout(() => {
                this.alert.show = false;
            }, 5000);
        },
        
        // ========== LOGOUT ==========
        
        logout() {
            if (confirm('Tem certeza que deseja sair?')) {
                localStorage.removeItem('userSession');
                window.location.href = 'index.html';
            }
        },
        
        // ========== UTILS ==========
        
        formatarData(data) {
            if (!data) return '-';
            return new Date(data).toLocaleDateString('pt-AO');
        },
        
        formatarSalario(valor) {
            if (!valor) return '0,00';
            return parseFloat(valor).toLocaleString('pt-AO', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            });
        }
    };
}
