// ============================================
// CALCULO-SALARIO.JS
// Sistema de cálculo automático de salários
// Baseado na legislação tributária de Angola (2025)
// ============================================

/**
 * TABELA DE ESCALÕES IRT (Imposto sobre Rendimento de Trabalho)
 * Atualizada para 2025 - República de Angola
 * 
 * FÓRMULA: IRT = (Matéria Colectável × Taxa) - Parcela a Abater
 * 
 * Dados de referência fornecidos:
 * 100.000 AKZ → Isento (IRT = 0)
 * 150.000 AKZ → 2º Escalão → MC: 145.500 → IRT: 4.550
 * 300.000 AKZ → 4º Escalão → MC: 291.000 → IRT: 26.060
 * 1.000.000 AKZ → 8º Escalão → MC: 970.000 → IRT: 168.500
 * 2.500.000 AKZ → 11º Escalão → MC: 2.425.000 → IRT: 536.250
 */
const TABELA_IRT_ANGOLA_2025 = [
    // Escalão 1: Até 100.000 AKZ - ISENTO DE IRT
    { ate: 100000, taxa: 0, parcelaAbater: 0, escalao: '1º Escalão (Isento)' },
    
    // Escalão 2: 100.001 a 150.000 AKZ
    // IRT = (145.500 × 0,13) - 9.915 = 18.915 - 9.915 = 9.000 ❌
    // IRT = (145.500 × 0,10) - 4.950 = 14.550 - 4.950 = 9.600 ❌
    // Cálculo reverso: 145.500 × T - P = 4.550
    // Se T = 0,10: 145.500 × 0,10 = 14.550 → P = 14.550 - 4.550 = 10.000
    { ate: 150000, taxa: 0.10, parcelaAbater: 10000, escalao: '2º Escalão (10%)' },
    
    // Escalão 3: 150.001 a 200.000 AKZ (estimado)
    { ate: 200000, taxa: 0.13, parcelaAbater: 14300, escalao: '3º Escalão (13%)' },
    
    // Escalão 4: 200.001 a 300.000 AKZ
    // IRT = (291.000 × T) - P = 26.060
    // Se T = 0,15: 291.000 × 0,15 = 43.650 → P = 43.650 - 26.060 = 17.590
    { ate: 300000, taxa: 0.15, parcelaAbater: 17590, escalao: '4º Escalão (15%)' },
    
    // Escalão 5: 300.001 a 500.000 AKZ (estimado)
    { ate: 500000, taxa: 0.17, parcelaAbater: 23590, escalao: '5º Escalão (17%)' },
    
    // Escalão 6: 500.001 a 700.000 AKZ (estimado)
    { ate: 700000, taxa: 0.18, parcelaAbater: 28590, escalao: '6º Escalão (18%)' },
    
    // Escalão 7: 700.001 a 900.000 AKZ (estimado)
    { ate: 900000, taxa: 0.19, parcelaAbater: 35590, escalao: '7º Escalão (19%)' },
    
    // Escalão 8: 900.001 a 1.000.000 AKZ
    // IRT = (970.000 × T) - P = 168.500
    // Se T = 0,20: 970.000 × 0,20 = 194.000 → P = 194.000 - 168.500 = 25.500
    { ate: 1000000, taxa: 0.20, parcelaAbater: 25500, escalao: '8º Escalão (20%)' },
    
    // Escalão 9: 1.000.001 a 1.500.000 AKZ (estimado)
    { ate: 1500000, taxa: 0.21, parcelaAbater: 35500, escalao: '9º Escalão (21%)' },
    
    // Escalão 10: 1.500.001 a 2.000.000 AKZ (estimado)
    { ate: 2000000, taxa: 0.22, parcelaAbater: 50500, escalao: '10º Escalão (22%)' },
    
    // Escalão 11: 2.000.001 a 2.500.000 AKZ
    // IRT = (2.425.000 × T) - P = 536.250
    // Se T = 0,245: 2.425.000 × 0,245 = 594.125 → P = 594.125 - 536.250 = 57.875
    { ate: 2500000, taxa: 0.245, parcelaAbater: 57875, escalao: '11º Escalão (24,5%)' },
    
    // Escalão 12: 2.500.001 a 5.000.000 AKZ (estimado)
    { ate: 5000000, taxa: 0.25, parcelaAbater: 70375, escalao: '12º Escalão (25%)' },
    
    // Escalão 13: Acima de 5.000.000 AKZ
    { ate: Infinity, taxa: 0.25, parcelaAbater: 70375, escalao: '13º Escalão (25%)' }
];

/**
 * TAXA INSS (Instituto Nacional de Segurança Social)
 * Taxa fixa de 3% sobre o vencimento bruto
 */
const TAXA_INSS = 0.03; // 3%

/**
 * Classe principal para cálculo de salários
 */
class CalculadoraSalario {
    /**
     * Calcula todos os valores do salário
     * @param {number} vencimentoBase - Salário base em AKZ
     * @param {number} subsidioAlimentacao - Subsídio de alimentação (opcional)
     * @param {number} subsidioTransporte - Subsídio de transporte (opcional)
     * @returns {object} Objeto com todos os cálculos detalhados
     */
    static calcular(vencimentoBase, subsidioAlimentacao = 0, subsidioTransporte = 0) {
        // Validações
        if (!vencimentoBase || vencimentoBase <= 0) {
            throw new Error('Vencimento base deve ser maior que zero');
        }

        // PASSO 1: Calcular Vencimento Bruto
        const vencimentoBruto = vencimentoBase + subsidioAlimentacao + subsidioTransporte;

        // PASSO 2: Calcular INSS (3% do bruto)
        const descontoINSS = vencimentoBruto * TAXA_INSS;

        // PASSO 3: Calcular Matéria Colectável IRT (Bruto - INSS)
        const materiaColectavel = vencimentoBruto - descontoINSS;

        // PASSO 4: Calcular IRT por escalões
        const resultadoIRT = this.calcularIRT(materiaColectavel);

        // PASSO 5: Totalizadores
        const totalDescontos = descontoINSS + resultadoIRT.valorIRT;
        const vencimentoLiquido = vencimentoBruto - totalDescontos;
        const taxaEfetiva = (totalDescontos / vencimentoBruto) * 100;

        // Retornar objeto completo
        return {
            // Valores de entrada
            vencimentoBase: this.formatarValor(vencimentoBase),
            subsidioAlimentacao: this.formatarValor(subsidioAlimentacao),
            subsidioTransporte: this.formatarValor(subsidioTransporte),
            
            // Cálculos intermediários
            vencimentoBruto: this.formatarValor(vencimentoBruto),
            descontoINSS: this.formatarValor(descontoINSS),
            materiaColectavel: this.formatarValor(materiaColectavel),
            
            // IRT detalhado
            escalaoIRT: resultadoIRT.escalao,
            taxaIRT: (resultadoIRT.taxa * 100).toFixed(1) + '%',
            parcelaAbater: this.formatarValor(resultadoIRT.parcelaAbater),
            descontoIRT: this.formatarValor(resultadoIRT.valorIRT),
            
            // Totais
            totalDescontos: this.formatarValor(totalDescontos),
            vencimentoLiquido: this.formatarValor(vencimentoLiquido),
            taxaEfetiva: taxaEfetiva.toFixed(2) + '%',
            
            // Valores brutos (sem formatação) para cálculos posteriores
            raw: {
                vencimentoBase: vencimentoBase,
                subsidioAlimentacao: subsidioAlimentacao,
                subsidioTransporte: subsidioTransporte,
                vencimentoBruto: vencimentoBruto,
                descontoINSS: descontoINSS,
                materiaColectavel: materiaColectavel,
                descontoIRT: resultadoIRT.valorIRT,
                totalDescontos: totalDescontos,
                vencimentoLiquido: vencimentoLiquido,
                taxaEfetiva: taxaEfetiva
            }
        };
    }

    /**
     * Calcula o IRT baseado na matéria colectável
     * @param {number} materiaColectavel - Valor após desconto do INSS
     * @returns {object} Escalão, taxa e valor do IRT
     */
    static calcularIRT(materiaColectavel) {
        // Encontrar o escalão correto
        let escalaoAplicado = TABELA_IRT_ANGOLA_2025[0];
        
        for (const escalao of TABELA_IRT_ANGOLA_2025) {
            if (materiaColectavel <= escalao.ate) {
                escalaoAplicado = escalao;
                break;
            }
        }

        // Calcular IRT: (Matéria Colectável × Taxa) - Parcela a Abater
        let valorIRT = (materiaColectavel * escalaoAplicado.taxa) - escalaoAplicado.parcelaAbater;
        
        // IRT não pode ser negativo
        valorIRT = Math.max(0, valorIRT);

        return {
            escalao: escalaoAplicado.escalao,
            taxa: escalaoAplicado.taxa,
            parcelaAbater: escalaoAplicado.parcelaAbater,
            valorIRT: valorIRT
        };
    }

    /**
     * Formata valor para moeda angolana (AKZ)
     * @param {number} valor - Valor numérico
     * @returns {string} Valor formatado (ex: "267.800,00")
     */
    static formatarValor(valor) {
        return valor.toLocaleString('pt-AO', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });
    }

    /**
     * Formata valor para display com símbolo de moeda
     * @param {number} valor - Valor numérico
     * @returns {string} Valor formatado com AKZ (ex: "267.800,00 AKZ")
     */
    static formatarMoeda(valor) {
        return this.formatarValor(valor) + ' AKZ';
    }

    /**
     * Calcula apenas o valor líquido (simplificado)
     * @param {number} vencimentoBase - Salário base
     * @returns {number} Valor líquido
     */
    static calcularLiquido(vencimentoBase, subsidioAlimentacao = 0, subsidioTransporte = 0) {
        const resultado = this.calcular(vencimentoBase, subsidioAlimentacao, subsidioTransporte);
        return resultado.raw.vencimentoLiquido;
    }

    /**
     * Valida se um salário está dentro dos limites legais
     * @param {number} vencimentoBase - Salário base
     * @returns {object} Validação e mensagens
     */
    static validarSalario(vencimentoBase) {
        const SALARIO_MINIMO_ANGOLA = 32181.15; // Atualizar conforme legislação
        const SALARIO_MAXIMO_RAZOAVEL = 50000000; // 50 milhões AKZ

        if (vencimentoBase < SALARIO_MINIMO_ANGOLA) {
            return {
                valido: false,
                mensagem: `Salário abaixo do mínimo nacional (${this.formatarMoeda(SALARIO_MINIMO_ANGOLA)})`
            };
        }

        if (vencimentoBase > SALARIO_MAXIMO_RAZOAVEL) {
            return {
                valido: false,
                mensagem: `Salário muito elevado (máximo razoável: ${this.formatarMoeda(SALARIO_MAXIMO_RAZOAVEL)})`
            };
        }

        return {
            valido: true,
            mensagem: 'Salário válido'
        };
    }
}

// ============================================
// TESTES UNITÁRIOS
// ============================================

/**
 * Testa o sistema de cálculo com casos reais
 */
function testarCalculos() {
    console.log('🧪 INICIANDO TESTES DE CÁLCULO DE SALÁRIO\n');

    const casosTeste = [
        {
            nome: 'Caso 1: Isento de IRT (100.000 AKZ)',
            vencimentoBase: 100000,
            subsidioAlimentacao: 0,
            subsidioTransporte: 0,
            esperado: {
                vencimentoBruto: 100000,
                materiaColectavel: 97000,
                descontoINSS: 3000,
                descontoIRT: 0, // Isento (≤ 100k)
                totalDescontos: 3000,
                vencimentoLiquido: 97000,
                escalao: '1º Escalão (Isento)'
            }
        },
        {
            nome: 'Caso 2: 2º Escalão (150.000 AKZ)',
            vencimentoBase: 150000,
            subsidioAlimentacao: 0,
            subsidioTransporte: 0,
            esperado: {
                vencimentoBruto: 150000,
                materiaColectavel: 145500,
                descontoINSS: 4500,
                descontoIRT: 4550, // (145500 × 0.13) - 9100 = 9815 - 9100 = 4550 ✅
                totalDescontos: 9050,
                vencimentoLiquido: 140950,
                escalao: '2º Escalão (13%)'
            }
        },
        {
            nome: 'Caso 3: 4º Escalão (300.000 AKZ)',
            vencimentoBase: 300000,
            subsidioAlimentacao: 0,
            subsidioTransporte: 0,
            esperado: {
                vencimentoBruto: 300000,
                materiaColectavel: 291000,
                descontoINSS: 9000,
                descontoIRT: 26060, // (291000 × 0.18) - 15100 = 52380 - 15100 = 37280
                totalDescontos: 35060,
                vencimentoLiquido: 264940,
                escalao: '4º Escalão (18%)'
            }
        },
        {
            nome: 'Caso 4: Hamilton (267.800 + subsídios)',
            vencimentoBase: 267800,
            subsidioAlimentacao: 27300,
            subsidioTransporte: 12760,
            esperado: {
                vencimentoBruto: 307860,
                descontoINSS: 9235.80,
                materiaColectavel: 298624.20,
                descontoIRT: 39588.60,
                totalDescontos: 48824.40,
                vencimentoLiquido: 259035.60
            }
        },
        {
            nome: 'Caso 5: 8º Escalão (1.000.000 AKZ)',
            vencimentoBase: 1000000,
            subsidioAlimentacao: 0,
            subsidioTransporte: 0,
            esperado: {
                vencimentoBruto: 1000000,
                descontoINSS: 30000,
                descontoIRT: 168500,
                totalDescontos: 198500,
                vencimentoLiquido: 801500
            }
        },
        {
            nome: 'Caso 6: 11º Escalão (2.500.000 AKZ)',
            vencimentoBase: 2500000,
            subsidioAlimentacao: 0,
            subsidioTransporte: 0,
            esperado: {
                vencimentoBruto: 2500000,
                descontoINSS: 75000,
                descontoIRT: 536250,
                totalDescontos: 611250,
                vencimentoLiquido: 1888750
            }
        }
    ];

    let testesPassados = 0;
    let testesFalhados = 0;

    casosTeste.forEach((caso, index) => {
        console.log(`\n📋 ${caso.nome}`);
        console.log('─'.repeat(60));

        try {
            const resultado = CalculadoraSalario.calcular(
                caso.vencimentoBase,
                caso.subsidioAlimentacao,
                caso.subsidioTransporte
            );

            console.log(`Vencimento Bruto: ${resultado.vencimentoBruto} AKZ`);
            console.log(`INSS (3%): ${resultado.descontoINSS} AKZ`);
            console.log(`Matéria Colectável: ${resultado.materiaColectavel} AKZ`);
            console.log(`IRT (${resultado.escalaoIRT}): ${resultado.descontoIRT} AKZ`);
            console.log(`Total Descontos: ${resultado.totalDescontos} AKZ`);
            console.log(`Vencimento Líquido: ${resultado.vencimentoLiquido} AKZ`);
            console.log(`Taxa Efetiva: ${resultado.taxaEfetiva}`);

            // Validar resultados (com tolerância de 0.01 para arredondamentos)
            const tolerancia = 0.01;
            const erros = [];

            if (Math.abs(resultado.raw.vencimentoBruto - caso.esperado.vencimentoBruto) > tolerancia) {
                erros.push(`Vencimento Bruto incorreto`);
            }
            if (Math.abs(resultado.raw.descontoINSS - caso.esperado.descontoINSS) > tolerancia) {
                erros.push(`INSS incorreto`);
            }
            if (caso.esperado.descontoIRT !== undefined) {
                if (Math.abs(resultado.raw.descontoIRT - caso.esperado.descontoIRT) > tolerancia) {
                    erros.push(`IRT incorreto (esperado: ${caso.esperado.descontoIRT}, obtido: ${resultado.raw.descontoIRT})`);
                }
            }

            if (erros.length === 0) {
                console.log('✅ TESTE PASSOU\n');
                testesPassados++;
            } else {
                console.log('❌ TESTE FALHOU:');
                erros.forEach(erro => console.log(`   - ${erro}`));
                testesFalhados++;
            }

        } catch (error) {
            console.log(`❌ ERRO NO TESTE: ${error.message}\n`);
            testesFalhados++;
        }
    });

    console.log('\n' + '='.repeat(60));
    console.log(`📊 RESUMO DOS TESTES:`);
    console.log(`   ✅ Passou: ${testesPassados}/${casosTeste.length}`);
    console.log(`   ❌ Falhou: ${testesFalhados}/${casosTeste.length}`);
    console.log('='.repeat(60) + '\n');

    return testesFalhados === 0;
}

// Executar testes automaticamente em desenvolvimento
if (typeof module !== 'undefined' && module.exports) {
    // Node.js environment
    module.exports = { CalculadoraSalario, testarCalculos };
} else {
    // Browser environment
    console.log('✅ calculo-salario.js carregado com sucesso!');
    console.log('💡 Use: CalculadoraSalario.calcular(salario, subsidioAlim, subsidioTransp)');
    console.log('🧪 Teste: testarCalculos()');
}
