// prisma/seeds/catalogos/graus-xama.ts
import type { PrismaClient } from '@prisma/client';
import { GrauFeiticeiro } from '@prisma/client';

// ============================================================
// INTERFACES
// ============================================================
// ✅ DEPOIS (flexível para JSON)
interface LimitacoesPorCategoria {
    [key: string]: number;
}

interface XamaGrauSeedData {
    prestigioMin: number;
    grau: GrauFeiticeiro;
    limitesCategoria: LimitacoesPorCategoria;
    descricao: string;
}

// ============================================================
// DADOS DOS GRAUS (CONFORME TABELA OFICIAL)
// ============================================================

const xamasGrausSeed: XamaGrauSeedData[] = [
    // GRAU 4 - INICIANTE
    {
        prestigioMin: 0,
        grau: GrauFeiticeiro.GRAU_4,
        limitesCategoria: {
            '4': 2,
            '3': 0,
            '2': 0,
            '1': 0,
            'ESPECIAL': 0,
        },
        descricao:
            'Nível mais baixo; feiticeiros fracos ou sem experiência; missões simples e de risco controlado; sempre acompanhados.',
    },

    // GRAU 3 - INTERMEDIÁRIO
    {
        prestigioMin: 30,
        grau: GrauFeiticeiro.GRAU_3,
        limitesCategoria: {
            '4': 3,
            '3': 1,
            '2': 1,
            '1': 0,
            'ESPECIAL': 0,
        },
        descricao:
            'Intermediário; ainda considerados novatos em combate, mas com alguma experiência de campo; sempre acompanhados.',
    },

    // GRAU 2 - ACIMA DA MÉDIA
    {
        prestigioMin: 60,
        grau: GrauFeiticeiro.GRAU_2,
        limitesCategoria: {
            '4': 4,
            '3': 2,
            '2': 2,
            '1': 1,
            'ESPECIAL': 0,
        },
        descricao:
            'Acima da média; xamãs fortes e com potencial elevado começam a surgir a partir daqui; ainda sempre acompanhados.',
    },

    // GRAU SEMI-1 - RECOMENDADOS PARA GRAU 1
    {
        prestigioMin: 90,
        grau: GrauFeiticeiro.SEMI_1,
        limitesCategoria: {
            '4': 4,
            '3': 2,
            '2': 2,
            '1': 1,
            'ESPECIAL': 1,
        },
        descricao:
            'Xamãs recomendados para subir ao Grau 1, já testados em missões de alto risco; podem ir a missões sozinhos.',
    },

    // GRAU 1 - ÁPICE DA ELITE NORMAL
    {
        prestigioMin: 120,
        grau: GrauFeiticeiro.GRAU_1,
        limitesCategoria: {
            '4': 5,
            '3': 4,
            '2': 3,
            '1': 2,
            'ESPECIAL': 2,
        },
        descricao:
            'Ápice da elite "normal", responsáveis por missões extremamente perigosas e com grande responsabilidade; podem ir a missões sozinhos; são responsáveis por acompanhar os feiticeiros mais fracos.',
    },

    // GRAU ESPECIAL - ANOMALIAS FORA DOS PADRÕES
    {
        prestigioMin: 200,
        grau: GrauFeiticeiro.ESPECIAL,
        limitesCategoria: {
            '4': 5,
            '3': 4,
            '2': 4,
            '1': 3,
            'ESPECIAL': 3,
        },
        descricao:
            'Reservado para anomalias fora dos padrões Jujutsu; poder descomunal, classificação rara e não alcançada apenas por esforço; podem ir a missões sozinhos; o alto escalão considera os Xamãs nesse grau como pontos de atenção.',
    },
];

// ============================================================
// TABELA DE REFERÊNCIA (VISUAL)
// ============================================================

const tabelaLimitacoes = `
╔═══════════╦════════════╦═══╦═══╦═══╦═══╦══════════╗
║ Prestígio ║ Grau       ║ 4 ║ 3 ║ 2 ║ 1 ║ Especial ║
╠═══════════╬════════════╬═══╬═══╬═══╬═══╬══════════╣
║     0     ║ GRAU_4     ║ 2 ║ 0 ║ 0 ║ 0 ║    0     ║
║    30     ║ GRAU_3     ║ 3 ║ 1 ║ 1 ║ 0 ║    0     ║
║    60     ║ GRAU_2     ║ 4 ║ 2 ║ 2 ║ 1 ║    0     ║
║    90     ║ SEMI_1     ║ 4 ║ 2 ║ 2 ║ 1 ║    1     ║
║   120     ║ GRAU_1     ║ 5 ║ 4 ║ 3 ║ 2 ║    2     ║
║   200     ║ ESPECIAL   ║ 5 ║ 4 ║ 4 ║ 3 ║    3     ║
╚═══════════╩════════════╩═══╩═══╩═══╩═══╩══════════╝
`;

// ============================================================
// REGRAS DE PROGRESSÃO
// ============================================================

const regrasProgressao = {
    acompanhamentoObrigatorio:
        'Graus 4, 3 e 2 devem sempre ser acompanhados em missões. Apenas a partir do Grau Semi-1 os xamãs podem ir sozinhos.',
    limitesCredito:
        'Cada grau tem um limite específico de itens por categoria (0, 1, 2, 3, Especial). Esses limites determinam quantos equipamentos de cada categoria o xamã pode requisitar.',
    prestigioMinimo:
        'Para alcançar cada grau, o xamã deve acumular um valor mínimo de prestígio através de missões completadas e contribuições à organização.',
    grauEspecialNaoAlcancavel:
        'O Grau Especial é reservado para anomalias fora dos padrões Jujutsu, com poder descomunal. Não é uma classificação alcançada apenas por treinamento ou número de missões.',
    responsabilidadeSuperior:
        'Xamãs de Grau 1 e Especial são responsáveis por acompanhar e supervisionar feiticeiros mais fracos em missões perigosas.',
};

// ============================================================
// SEED FUNCTION
// ============================================================

export async function seedXamaGraus(prisma: PrismaClient) {
    console.log('📊 Cadastrando graus de Xama...');

    try {
        for (const grauData of xamasGrausSeed) {
            console.log(
                `  → Cadastrando ${grauData.grau} (Prestígio mínimo: ${grauData.prestigioMin})...`
            );

            await prisma.grauFeiticeiroLimite.upsert({
                where: {
                    grau: grauData.grau,
                },
                update: {
                    prestigioMin: grauData.prestigioMin,
                    limitesPorCategoria: grauData.limitesCategoria,
                    descricao: grauData.descricao,
                    atualizadoEm: new Date(),
                },
                create: {
                    prestigioMin: grauData.prestigioMin,
                    grau: grauData.grau,
                    limitesPorCategoria: grauData.limitesCategoria,
                    descricao: grauData.descricao,
                },
            });
        }

        console.log('✅ Graus de Xama cadastrados com sucesso!');
        console.log(`   Total de graus: ${xamasGrausSeed.length}`);
        console.log('');
        console.log('📋 Resumo de Graus:');
        xamasGrausSeed.forEach((grau) => {
            const podeIrSozinho = grau.prestigioMin >= 90;
            console.log(
                `   - ${grau.grau}: Prestígio ${grau.prestigioMin}+ | ${podeIrSozinho ? '✅ Pode ir sozinho' : '❌ Sempre acompanhado'}`
            );
        });
        console.log('');
        console.log('📊 Tabela de Limitações por Categoria:');
        console.log(tabelaLimitacoes);
        console.log('');
    } catch (error) {
        console.error('❌ Erro ao cadastrar graus de Xama:', error);
        throw error;
    }
}

// ============================================================
// EXPORTS
// ============================================================

export { xamasGrausSeed, tabelaLimitacoes, regrasProgressao };
export type { XamaGrauSeedData, LimitacoesPorCategoria };
