/**
 * Gerenciador de Clientes
 * Sistema profissional de CRUD para clientes por usuário
 */

class ClienteManager {
    constructor(username) {
        this.username = username;
        this.clientesPath = `data/clientes/${username}/clientes.json`;
    }

    /**
     * Obtém todos os clientes do usuário
     */
    async obterClientes() {
        try {
            const data = await githubAPI.readJSON(this.clientesPath);
            return data.clientes || [];
        } catch (error) {
            // Se arquivo não existe, retorna array vazio
            if (error.message.includes('404')) {
                console.log('📁 Arquivo de clientes não existe ainda. Criando...');
                await this.inicializarArquivo();
                return [];
            }
            throw error;
        }
    }

    /**
     * Inicializa arquivo de clientes (primeira vez)
     */
    async inicializarArquivo() {
        const estruturaInicial = {
            username: this.username,
            clientes: [],
            metadata: {
                totalClientes: 0,
                lastId: 0,
                criadoEm: new Date().toISOString(),
                atualizadoEm: new Date().toISOString()
            }
        };

        await githubAPI.writeJSON(
            this.clientesPath,
            estruturaInicial,
            `Inicializar arquivo de clientes para ${this.username}`
        );

        console.log('✅ Arquivo de clientes inicializado');
    }

    /**
     * Adiciona novo cliente
     */
    async adicionarCliente(clienteData) {
        try {
            // Lê arquivo atual
            let data;
            try {
                data = await githubAPI.readJSON(this.clientesPath);
            } catch (error) {
                // Se não existe, inicializa
                await this.inicializarArquivo();
                data = await githubAPI.readJSON(this.clientesPath);
            }

            // Incrementa ID
            const novoId = (data.metadata.lastId || 0) + 1;

            // Cria cliente completo
            const novoCliente = {
                id: novoId,
                nome: clienteData.nome,
                nif: clienteData.nif || '',
                email: clienteData.email || '',
                telefone: clienteData.telefone || '',
                morada: clienteData.morada || '',
                empresa: clienteData.empresa || '',
                tipo: clienteData.tipo || 'particular', // particular | empresa
                camposAdicionais: clienteData.camposAdicionais || {},
                stats: {
                    totalDeclaracoes: 0,
                    ultimaDeclaracao: null
                },
                criadoEm: new Date().toISOString(),
                atualizadoEm: new Date().toISOString()
            };

            // Adiciona à lista
            data.clientes.push(novoCliente);

            // Atualiza metadata
            data.metadata.lastId = novoId;
            data.metadata.totalClientes = data.clientes.length;
            data.metadata.atualizadoEm = new Date().toISOString();

            // Salva
            await githubAPI.writeJSON(
                this.clientesPath,
                data,
                `Adicionar cliente: ${clienteData.nome}`
            );

            // Atualiza stats do usuário
            await this.atualizarStatsUsuario();

            console.log(`✅ Cliente adicionado: ${novoCliente.nome} (ID: ${novoId})`);
            return novoCliente;
        } catch (error) {
            console.error('❌ Erro ao adicionar cliente:', error);
            throw error;
        }
    }

    /**
     * Atualiza cliente existente
     */
    async atualizarCliente(clienteId, clienteData) {
        try {
            const data = await githubAPI.readJSON(this.clientesPath);

            // Encontra cliente
            const index = data.clientes.findIndex(c => c.id === clienteId);
            if (index === -1) {
                throw new Error('Cliente não encontrado');
            }

            // Atualiza campos (mantém ID, criadoEm, stats)
            data.clientes[index] = {
                ...data.clientes[index],
                nome: clienteData.nome,
                nif: clienteData.nif || '',
                email: clienteData.email || '',
                telefone: clienteData.telefone || '',
                morada: clienteData.morada || '',
                empresa: clienteData.empresa || '',
                tipo: clienteData.tipo || data.clientes[index].tipo,
                camposAdicionais: clienteData.camposAdicionais || data.clientes[index].camposAdicionais,
                atualizadoEm: new Date().toISOString()
            };

            // Atualiza metadata
            data.metadata.atualizadoEm = new Date().toISOString();

            // Salva
            await githubAPI.writeJSON(
                this.clientesPath,
                data,
                `Atualizar cliente: ${clienteData.nome}`
            );

            console.log(`✅ Cliente atualizado: ${clienteData.nome} (ID: ${clienteId})`);
            return data.clientes[index];
        } catch (error) {
            console.error('❌ Erro ao atualizar cliente:', error);
            throw error;
        }
    }

    /**
     * Remove cliente
     */
    async removerCliente(clienteId) {
        try {
            const data = await githubAPI.readJSON(this.clientesPath);

            // Encontra cliente
            const cliente = data.clientes.find(c => c.id === clienteId);
            if (!cliente) {
                throw new Error('Cliente não encontrado');
            }

            // Remove da lista
            data.clientes = data.clientes.filter(c => c.id !== clienteId);

            // Atualiza metadata
            data.metadata.totalClientes = data.clientes.length;
            data.metadata.atualizadoEm = new Date().toISOString();

            // Salva
            await githubAPI.writeJSON(
                this.clientesPath,
                data,
                `Remover cliente: ${cliente.nome}`
            );

            // Atualiza stats do usuário
            await this.atualizarStatsUsuario();

            console.log(`✅ Cliente removido: ${cliente.nome} (ID: ${clienteId})`);
            return true;
        } catch (error) {
            console.error('❌ Erro ao remover cliente:', error);
            throw error;
        }
    }

    /**
     * Busca cliente por ID
     */
    async obterClientePorId(clienteId) {
        try {
            const data = await githubAPI.readJSON(this.clientesPath);
            const cliente = data.clientes.find(c => c.id === clienteId);
            
            if (!cliente) {
                throw new Error('Cliente não encontrado');
            }
            
            return cliente;
        } catch (error) {
            console.error('❌ Erro ao buscar cliente:', error);
            throw error;
        }
    }

    /**
     * Incrementa contador de declarações do cliente
     */
    async registrarDeclaracao(clienteId) {
        try {
            const data = await githubAPI.readJSON(this.clientesPath);

            // Encontra cliente
            const index = data.clientes.findIndex(c => c.id === clienteId);
            if (index === -1) {
                throw new Error('Cliente não encontrado');
            }

            // Atualiza stats
            data.clientes[index].stats.totalDeclaracoes++;
            data.clientes[index].stats.ultimaDeclaracao = new Date().toISOString();
            data.clientes[index].atualizadoEm = new Date().toISOString();

            // Atualiza metadata
            data.metadata.atualizadoEm = new Date().toISOString();

            // Salva
            await githubAPI.writeJSON(
                this.clientesPath,
                data,
                `Registrar declaração para cliente ID ${clienteId}`
            );

            // Atualiza stats do usuário (incrementa declarações)
            await this.atualizarStatsUsuarioDeclaracao();

            console.log(`✅ Declaração registrada para cliente ID ${clienteId}`);
            return data.clientes[index];
        } catch (error) {
            console.error('❌ Erro ao registrar declaração:', error);
            throw error;
        }
    }

    /**
     * Atualiza stats do usuário em data/users.json
     */
    async atualizarStatsUsuario() {
        try {
            // Lê users.json
            const usersData = await githubAPI.readJSON('data/users.json');
            
            // Encontra usuário
            const userIndex = usersData.users.findIndex(u => u.username === this.username);
            if (userIndex === -1) return;

            // Lê quantidade de clientes
            const clientesData = await githubAPI.readJSON(this.clientesPath);
            const totalClientes = clientesData.clientes.length;

            // Atualiza stats
            usersData.users[userIndex].stats.clientes = totalClientes;

            // Salva
            await githubAPI.writeJSON(
                'data/users.json',
                usersData,
                `Atualizar stats de clientes para ${this.username}`
            );

            console.log(`✅ Stats do usuário atualizadas: ${totalClientes} clientes`);
        } catch (error) {
            console.error('⚠️ Erro ao atualizar stats do usuário:', error);
            // Não lança erro para não quebrar fluxo principal
        }
    }

    /**
     * Atualiza contador de declarações do usuário
     */
    async atualizarStatsUsuarioDeclaracao() {
        try {
            // Lê users.json
            const usersData = await githubAPI.readJSON('data/users.json');
            
            // Encontra usuário
            const userIndex = usersData.users.findIndex(u => u.username === this.username);
            if (userIndex === -1) return;

            // Incrementa declarações
            usersData.users[userIndex].stats.declaracoes++;

            // Salva
            await githubAPI.writeJSON(
                'data/users.json',
                usersData,
                `Incrementar declarações para ${this.username}`
            );

            console.log(`✅ Declaração contabilizada para ${this.username}`);
        } catch (error) {
            console.error('⚠️ Erro ao contabilizar declaração:', error);
        }
    }

    /**
     * Obtém stats resumidas
     */
    async obterStats() {
        try {
            const data = await githubAPI.readJSON(this.clientesPath);
            const clientes = data.clientes || [];

            const totalDeclaracoes = clientes.reduce((sum, c) => sum + (c.stats?.totalDeclaracoes || 0), 0);

            return {
                totalClientes: clientes.length,
                totalDeclaracoes: totalDeclaracoes,
                clientesAtivos: clientes.filter(c => c.stats?.totalDeclaracoes > 0).length,
                ultimaAtualizacao: data.metadata?.atualizadoEm
            };
        } catch (error) {
            if (error.message.includes('404')) {
                return {
                    totalClientes: 0,
                    totalDeclaracoes: 0,
                    clientesAtivos: 0,
                    ultimaAtualizacao: null
                };
            }
            throw error;
        }
    }
}
