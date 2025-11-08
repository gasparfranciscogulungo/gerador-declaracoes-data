// ============================================
// ANÁLISE DA TABELA IRT - REVERSE ENGINEERING
// ============================================

/**
 * Dados fornecidos pelo usuário:
 * 
 * Vencimento Bruto | Matéria Colectável | INSS (3%) | IRT      | Total Desc. | Taxa Efetiva
 * 100.000 (Isento) | 97.000            | 3.000     | 0        | 3.000       | 3,0%
 * 150.000 (2º)     | 145.500           | 4.500     | 4.550    | 9.050       | 6,0%
 * 300.000 (4º)     | 291.000           | 9.000     | 26.060   | 35.060      | 11,69%
 * 1.000.000 (8º)   | 970.000           | 30.000    | 168.500  | 198.500     | 19,85%
 * 2.500.000 (11º)  | 2.425.000         | 75.000    | 536.250  | 611.250     | 24,45%
 */

console.log('🔍 ANÁLISE DA TABELA IRT DE ANGOLA\n');

const dados = [
    { bruto: 100000, mc: 97000, inss: 3000, irt: 0, total: 3000, escalao: '1º (Isento)' },
    { bruto: 150000, mc: 145500, inss: 4500, irt: 4550, total: 9050, escalao: '2º' },
    { bruto: 300000, mc: 291000, inss: 9000, irt: 26060, total: 35060, escalao: '4º' },
    { bruto: 1000000, mc: 970000, inss: 30000, irt: 168500, total: 198500, escalao: '8º' },
    { bruto: 2500000, mc: 2425000, inss: 75000, irt: 536250, total: 611250, escalao: '11º' }
];

dados.forEach((d, i) => {
    console.log(`\n📊 Caso ${i + 1}: ${d.escalao} Escalão`);
    console.log(`─`.repeat(60));
    console.log(`Vencimento Bruto: ${d.bruto.toLocaleString('pt-AO')} AKZ`);
    console.log(`INSS (3%): ${d.inss.toLocaleString('pt-AO')} AKZ`);
    console.log(`Matéria Colectável: ${d.mc.toLocaleString('pt-AO')} AKZ`);
    
    // Calcular taxa e parcela a abater
    if (d.irt === 0) {
        console.log(`IRT: 0 AKZ (ISENTO)`);
        console.log(`Taxa: 0%`);
        console.log(`Parcela a Abater: 0 AKZ`);
    } else {
        // IRT = (MC × Taxa) - Parcela
        // Parcela = (MC × Taxa) - IRT
        
        // Tentativa com diferentes taxas
        const taxasPossiveis = [0.13, 0.16, 0.18, 0.19, 0.20, 0.21, 0.22, 0.23, 0.24, 0.245, 0.25];
        
        console.log(`IRT: ${d.irt.toLocaleString('pt-AO')} AKZ`);
        console.log(`\nTentando encontrar taxa e parcela:`);
        
        for (const taxa of taxasPossiveis) {
            const parcela = (d.mc * taxa) - d.irt;
            const irtCalculado = (d.mc * taxa) - parcela;
            const diferenca = Math.abs(irtCalculado - d.irt);
            
            if (diferenca < 0.5) {
                console.log(`  ✅ Taxa: ${(taxa * 100).toFixed(1)}%`);
                console.log(`     Parcela a Abater: ${parcela.toFixed(2)} AKZ`);
                console.log(`     IRT Calculado: ${irtCalculado.toFixed(2)} AKZ`);
                console.log(`     Diferença: ${diferenca.toFixed(2)} AKZ`);
                break;
            }
        }
    }
    
    console.log(`Total Descontos: ${d.total.toLocaleString('pt-AO')} AKZ`);
    console.log(`Vencimento Líquido: ${(d.bruto - d.total).toLocaleString('pt-AO')} AKZ`);
});

console.log('\n' + '='.repeat(60));
console.log('✅ Análise concluída!');
console.log('='.repeat(60));
