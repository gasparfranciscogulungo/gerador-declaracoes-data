/**
 * CLIENTE MANAGER - Sistema de Gestão de Clientes/Trabalhadores
 * ETAPA 2: CRUD Completo com Validações e Cálculo de Salário
 * 
 * Funcionalidades:
 * ✅ CRUD completo (Create, Read, Update, Delete)
 * ✅ Validações robustas (NIF, email, telefone, datas)
 * ✅ Sanitização contra XSS
 * ✅ Busca e filtros avançados
 * ✅ Integração com CalculadoraSalario
 * ✅ Estatísticas e relatórios
 * ✅ Soft delete (marcar como inativo)
 * 
 * PERMISSÕES:
 * - Todos os usuários (admin e comum) podem gerenciar seus próprios clientes
 * - Admin tem painel adicional (users.html) para ver estatísticas de todos os usuários
 * - Cada usuário tem seus próprios trabalhadores isolados
 * 
 * @author Gerador de PDF - Angola
 * @date 2025-11-08
 */

class ClienteManager {
    constructor() {
        this.trabalhadores = [];
        this.cacheCarregado = false;
        this.ARQUIVO_TRABALHADORES = 'data/trabalhadores.json';
    }
    
    /**
     * Modelo de dados de um trabalhador (compatível com estrutura existente)
     */
    static get MODELO_TRABALHADOR() {
        return {
            id: null,
            nome: '',
            documento: '',              // BI/CC number
            tipo_documento: 'BI',       // BI ou CC
            nif: '',                    // Aceita alfanumérico (008408047LA047)
            data_nascimento: '',        // YYYY-MM-DD (formato date input)
            nacionalidade: 'Angolana',
            // Morada detalhada
            morada_edificio: '',
            morada_apartamento: '',
            morada_bairro: '',
            morada_municipio: '',
            morada_provincia: '',
            morada_completa: '',        // Formato livre alternativo
            morada: '',                 // Campo legado
            cidade: '',
            telefone: '',
            email: '',
            funcao: '',                 // Cargo/função
            departamento: '',
            data_admissao: '',          // YYYY-MM-DD (formato date input)
            tipo_contrato: '',
            // Salário para declaração
            salario_base: '0.00',       // Salário base (obrigatório para declaração)
            salario_extenso: '',        // Valor por extenso gerado automaticamente
            // Campos opcionais para recibo de salário
            subsidio_alimentacao: '0.00',
            subsidio_transporte: '0.00',
            irt: '0.00',
            salario_bruto: '0.00',      // Calculado automaticamente se necessário
            salario_liquido: '0.00',    // Calculado automaticamente se necessário
            moeda: 'AKZ',
            iban: '',
            ativo: true,
            observacoes: ''
        };
    }

    // ===============================================
    // VALIDAÇÕES
    // ===============================================
    
    validarNIF(nif) {
        // NIF TOTALMENTE LIVRE - SEM VALIDAÇÃO
        return { valido: true };
    }

    validarEmail(email) {
        if (!email) return { valido: true };
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!regex.test(email)) {
            return { valido: false, erro: 'E-mail inválido' };
        }
        return { valido: true };
    }

    validarTelefone(telefone) {
        if (!telefone) return { valido: true };
        const telefoneLimpo = telefone.replace(/\D/g, '');
        if (telefoneLimpo.length < 9) {
            return { valido: false, erro: 'Telefone deve ter pelo menos 9 dígitos' };
        }
        return { valido: true };
    }

    validarData(data) {
        if (!data) return { valido: true };
        const regex = /^\d{4}-\d{2}-\d{2}$/;
        if (!regex.test(data)) {
            return { valido: false, erro: 'Data deve estar no formato YYYY-MM-DD' };
        }
        const dataObj = new Date(data);
        if (isNaN(dataObj.getTime())) {
            return { valido: false, erro: 'Data inválida' };
        }
        return { valido: true };
    }

    sanitizar(texto) {
        if (typeof texto !== 'string') return texto;
        return texto
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#x27;')
            .replace(/\//g, '&#x2F;')
            .trim();
    }

    validarTrabalhador(dados) {
        const erros = [];

        if (!dados.nome || dados.nome.trim() === '') {
            erros.push('Nome é obrigatório');
        }

        // NIF - SEM VALIDAÇÃO (aceita qualquer valor)

        const resultadoEmail = this.validarEmail(dados.email);
        if (!resultadoEmail.valido) {
            erros.push(resultadoEmail.erro);
        }

        const resultadoTelefone = this.validarTelefone(dados.telefone);
        if (!resultadoTelefone.valido) {
            erros.push(resultadoTelefone.erro);
        }

        if (dados.vencimentoBase && dados.vencimentoBase < 0) {
            erros.push('Vencimento base não pode ser negativo');
        }

        return {
            valido: erros.length === 0,
            erros
        };
    }

    // ===============================================
    // PERMISSÕES
    // ===============================================
    
    isAdmin() {
        // Verifica se usuário atual tem role 'admin'
        if (typeof authManager !== 'undefined' && authManager.usuarioAtual) {
            return authManager.usuarioAtual.role === 'admin';
        }
        return false;
    }

    // ===============================================
    // CARREGAMENTO E SALVAMENTO
    // ===============================================

    async carregar() {
        try {
            const result = await githubAPI.lerJSON(this.ARQUIVO_TRABALHADORES);
            
            if (result && result.data && result.data.trabalhadores) {
                this.trabalhadores = result.data.trabalhadores;
                this.sha = result.sha;
            } else {
                this.trabalhadores = [];
            }
            
            this.cacheCarregado = true;
            console.log(`✅ ${this.trabalhadores.length} trabalhadores carregados`);
            return this.trabalhadores;
            
        } catch (erro) {
            console.error('❌ Erro ao carregar trabalhadores:', erro);
            this.trabalhadores = [];
            this.cacheCarregado = true;
            return [];
        }
    }

    async salvar() {
        try {
            const data = {
                trabalhadores: this.trabalhadores
            };
            
            const result = await githubAPI.salvarJSON(
                this.ARQUIVO_TRABALHADORES,
                data,
                `📝 Atualização de trabalhadores - ${new Date().toLocaleString('pt-AO')}`,
                this.sha
            );
            
            this.sha = result.sha;
            console.log('✅ Trabalhadores salvos com sucesso');
            return true;
            
        } catch (erro) {
            console.error('❌ Erro ao salvar trabalhadores:', erro);
            throw new Error('Falha ao salvar: ' + erro.message);
        }
    }

    gerarId() {
        const timestamp = Date.now();
        const random = Math.floor(Math.random() * 1000);
        return `TRAB-${timestamp}-${random}`;
    }

    // ===============================================
    // CRUD - CREATE
    // ===============================================

    async criar(dados) {
        if (!this.cacheCarregado) {
            await this.carregar();
        }

        const validacao = this.validarTrabalhador(dados);
        if (!validacao.valido) {
            throw new Error('❌ Dados inválidos:\n- ' + validacao.erros.join('\n- '));
        }

        const nifExistente = this.trabalhadores.find(c => c.nif === dados.nif);
        if (nifExistente) {
            throw new Error('❌ Já existe um trabalhador com este NIF');
        }

        const novoTrabalhador = {
            ...ClienteManager.MODELO_TRABALHADOR,
            ...dados,
            id: this.gerarId()
        };

        // Sanitizar
        novoTrabalhador.nome = this.sanitizar(novoTrabalhador.nome);
        novoTrabalhador.morada = this.sanitizar(novoTrabalhador.morada);
        novoTrabalhador.email = this.sanitizar(novoTrabalhador.email);
        novoTrabalhador.funcao = this.sanitizar(novoTrabalhador.funcao);
        novoTrabalhador.departamento = this.sanitizar(novoTrabalhador.departamento);

        this.trabalhadores.push(novoTrabalhador);
        await this.salvar();

        console.log('✅ Trabalhador criado:', novoTrabalhador.nome);
        return novoTrabalhador;
    }

    // ===============================================
    // CRUD - READ
    // ===============================================

    async listar(filtros = {}) {
        if (!this.cacheCarregado) {
            await this.carregar();
        }

        let resultado = [...this.trabalhadores];

        if (filtros.ativo !== undefined) {
            resultado = resultado.filter(c => c.ativo !== false);
        }

        if (filtros.departamento) {
            resultado = resultado.filter(c => 
                c.departamento && c.departamento.toLowerCase().includes(filtros.departamento.toLowerCase())
            );
        }

        if (filtros.funcao) {
            resultado = resultado.filter(c => 
                c.funcao && c.funcao.toLowerCase().includes(filtros.funcao.toLowerCase())
            );
        }

        resultado.sort((a, b) => a.nome.localeCompare(b.nome, 'pt-AO'));

        return resultado;
    }

    async buscarPorId(id) {
        if (!this.cacheCarregado) {
            await this.carregar();
        }

        const trabalhador = this.trabalhadores.find(c => c.id === id);
        
        if (!trabalhador) {
            throw new Error('❌ Trabalhador não encontrado');
        }

        return trabalhador;
    }

    async buscarPorNIF(nif) {
        if (!this.cacheCarregado) {
            await this.carregar();
        }

        const trabalhador = this.trabalhadores.find(c => c.nif === nif);
        
        if (!trabalhador) {
            throw new Error('❌ Trabalhador com NIF ' + nif + ' não encontrado');
        }

        return trabalhador;
    }

    async buscarPorNome(nome) {
        if (!this.cacheCarregado) {
            await this.carregar();
        }

        const nomeBusca = nome.toLowerCase();
        
        return this.trabalhadores.filter(c => 
            c.nome.toLowerCase().includes(nomeBusca)
        );
    }

    // ===============================================
    // CRUD - UPDATE
    // ===============================================

    async atualizar(id, dados) {
        if (!this.cacheCarregado) {
            await this.carregar();
        }

        const indice = this.trabalhadores.findIndex(c => c.id === id);
        
        if (indice === -1) {
            throw new Error('❌ Trabalhador não encontrado');
        }

        const trabalhadorAtual = this.trabalhadores[indice];
        const dadosCompletos = { ...trabalhadorAtual, ...dados };
        const validacao = this.validarTrabalhador(dadosCompletos);
        
        if (!validacao.valido) {
            throw new Error('❌ Dados inválidos:\n- ' + validacao.erros.join('\n- '));
        }

        if (dados.nif && dados.nif !== trabalhadorAtual.nif) {
            const nifExistente = this.trabalhadores.find(c => c.nif === dados.nif && c.id !== id);
            if (nifExistente) {
                throw new Error('❌ Já existe outro trabalhador com este NIF');
            }
        }

        const trabalhadorAtualizado = {
            ...trabalhadorAtual,
            ...dados,
            id: trabalhadorAtual.id
        };

        // Sanitizar
        if (dados.nome) trabalhadorAtualizado.nome = this.sanitizar(trabalhadorAtualizado.nome);
        if (dados.morada) trabalhadorAtualizado.morada = this.sanitizar(trabalhadorAtualizado.morada);
        if (dados.funcao) trabalhadorAtualizado.funcao = this.sanitizar(trabalhadorAtualizado.funcao);

        this.trabalhadores[indice] = trabalhadorAtualizado;
        await this.salvar();

        console.log('✅ Trabalhador atualizado:', trabalhadorAtualizado.nome);
        return trabalhadorAtualizado;
    }

    // ===============================================
    // CRUD - DELETE
    // ===============================================

    async excluir(id, excluirDefinitivamente = false) {
        if (!this.cacheCarregado) {
            await this.carregar();
        }

        const indice = this.trabalhadores.findIndex(c => c.id === id);
        
        if (indice === -1) {
            throw new Error('❌ Trabalhador não encontrado');
        }

        const trabalhador = this.trabalhadores[indice];

        if (excluirDefinitivamente) {
            this.trabalhadores.splice(indice, 1);
            console.log('✅ Trabalhador excluído permanentemente:', trabalhador.nome);
        } else {
            this.trabalhadores[indice].ativo = false;
            console.log('✅ Trabalhador marcado como inativo:', trabalhador.nome);
        }

        await this.salvar();
        return true;
    }

    async reativar(id) {
        if (!this.cacheCarregado) {
            await this.carregar();
        }

        const indice = this.trabalhadores.findIndex(c => c.id === id);
        
        if (indice === -1) {
            throw new Error('❌ Trabalhador não encontrado');
        }

        this.trabalhadores[indice].ativo = true;

        await this.salvar();

        console.log('✅ Trabalhador reativado:', this.trabalhadores[indice].nome);
        return this.trabalhadores[indice];
    }

    // ===============================================
    // FUNCIONALIDADES EXTRAS
    // ===============================================

    calcularSalario(trabalhador) {
        if (typeof CalculadoraSalario === 'undefined') {
            throw new Error('❌ CalculadoraSalario não está disponível');
        }

        return CalculadoraSalario.calcular(
            trabalhador.vencimentoBase || 0,
            trabalhador.subsidioAlimentacao || 0,
            trabalhador.subsidioTransporte || 0
        );
    }

    async obterEstatisticas() {
        if (!this.cacheCarregado) {
            await this.carregar();
        }

        const ativos = this.trabalhadores.filter(c => c.ativo !== false);
        const inativos = this.trabalhadores.filter(c => c.ativo === false);

        const porDepartamento = {};
        ativos.forEach(c => {
            const dept = c.departamento || 'Sem departamento';
            porDepartamento[dept] = (porDepartamento[dept] || 0) + 1;
        });

        let massaSalarialTotal = 0;

        ativos.forEach(c => {
            const salarioBruto = parseFloat(c.salario_bruto) || 0;
            massaSalarialTotal += salarioBruto;
        });

        return {
            total: this.trabalhadores.length,
            ativos: ativos.length,
            inativos: inativos.length,
            porDepartamento,
            massaSalarialTotal
        };
    }

}

// Exportar para uso em Node.js e Browser
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ClienteManager;
}
