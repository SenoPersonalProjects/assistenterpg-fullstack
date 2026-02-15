// prisma/seeds/catalogos/modificacoes.ts

import { Prisma, type PrismaClient } from '@prisma/client';
import { TipoModificacao, TipoFonte, TipoEquipamento, TipoProtecao } from '@prisma/client';

// ============================================================
// TIPOS
// ============================================================

type RestricoesModificacao = {
  // Base (genéricas)
  tiposEquipamento?: TipoEquipamento[];

  // Amaldiçoados
  apenasAmaldicoados?: boolean;
  complexidadeMinima?: string; // 'SIMPLES' | 'COMPLEXA'

  // ✅ CORRIGIDO: Usar TipoProtecao ao invés de ProficienciaProtecao
  // Porque ESCUDO é proficiência, mas não tipo de proteção
  tiposProtecao?: TipoProtecao[]; // 'VESTIVEL' | 'EMPUNHAVEL'
  
  // ✅ NOVO: Restrição explícita para excluir escudos
  excluiEscudos?: boolean;

  // Conflitos
  codigosIncompativeis?: string[];
  
  // Outros
  outros?: Record<string, any>;
};

interface ModificacaoData {
  codigo: string;
  nome: string;
  descricao: string;
  tipo: TipoModificacao;
  incrementoEspacos: number;

  // ✅ NOVO: restrições flexíveis (substitui apenasAmaldicoadas + requerComplexidade)
  restricoes?: RestricoesModificacao;

  efeitosMecanicos?: any;
}

// ============================================================
// MODIFICAÇÕES CORPO A CORPO E DISPARO (GERAIS)
// ============================================================

const modificacoesCorpoACorpoEDisparo: ModificacaoData[] = [
  {
    codigo: 'MOD_CERTEIRA',
    nome: 'Certeira',
    descricao: 'A arma é construída ou ajustada para ser mais precisa e bem balanceada.',
    tipo: TipoModificacao.CORPO_A_CORPO_E_DISPARO,
    incrementoEspacos: 0,
    efeitosMecanicos: {
      bonusAtaque: 2,
      descricao: 'Concede +2 em testes de ataque com a arma',
    },
  },
  {
    codigo: 'MOD_CRUEL',
    nome: 'Cruel',
    descricao: 'A lâmina ou massa da arma é reforçada, afiada ou feita de material mais denso.',
    tipo: TipoModificacao.CORPO_A_CORPO_E_DISPARO,
    incrementoEspacos: 0,
    efeitosMecanicos: {
      bonusDano: 2,
      descricao: 'Concede +2 nas rolagens de dano',
    },
  },
  {
    codigo: 'MOD_DISCRETA',
    nome: 'Discreta',
    descricao:
      'A arma é alterada para chamar menos atenção e ocupar menos espaço; se for arma de fogo, pode ser desmontável, se for bastão pode ser retrátil, e assim por diante.',
    tipo: TipoModificacao.CORPO_A_CORPO_E_DISPARO,
    incrementoEspacos: -1,
    efeitosMecanicos: {
      bonusCrime: 5,
      reducaoEspacos: 1,
      descricao: 'Concede +5 em testes de Crime para ocultar a arma e reduz espaços em 1',
    },
  },
  {
    codigo: 'MOD_PERIGOSA',
    nome: 'Perigosa',
    descricao:
      'A arma recebe acabamento ou geometria que potencializa ferimentos críticos (como lâmina extremamente afiada ou cabeça maciça).',
    tipo: TipoModificacao.CORPO_A_CORPO_E_DISPARO,
    incrementoEspacos: 0,
    efeitosMecanicos: {
      margemAmeacaAdicional: 2,
      descricao: 'Aumenta a margem de ameaça em +2',
    },
  },
  {
    codigo: 'MOD_TATICA',
    nome: 'Tática',
    descricao:
      'A arma ganha melhorias ergonômicas e de manejo (como cabo texturizado, bandoleira, empunhadura melhor).',
    tipo: TipoModificacao.CORPO_A_CORPO_E_DISPARO,
    incrementoEspacos: 0,
    efeitosMecanicos: {
      saqueAcaoLivre: true,
      descricao: 'Permite sacar a arma como ação livre',
    },
  },
];

// ============================================================
// MODIFICAÇÕES PARA ARMAS DE FOGO (ESPECÍFICAS)
// ============================================================

const modificacoesArmaFogo: ModificacaoData[] = [
  {
    codigo: 'MOD_ALONGADA',
    nome: 'Alongada',
    descricao: 'A arma recebe cano mais longo ou estrutura similar que aumenta a precisão dos disparos.',
    tipo: TipoModificacao.ARMA_FOGO,
    incrementoEspacos: 0,
    efeitosMecanicos: {
      bonusAtaque: 2,
      descricao: 'Concede +2 em testes de ataque',
    },
  },
  {
    codigo: 'MOD_CALIBRE_GROSSO',
    nome: 'Calibre Grosso',
    descricao:
      'A arma é adaptada para usar munição de calibre maior, aumentando seu dano em +1 dado do mesmo tipo. Usa munição específica de calibre grosso.',
    tipo: TipoModificacao.ARMA_FOGO,
    incrementoEspacos: 0,
    efeitosMecanicos: {
      aumentaDado: 1,
      descricao: 'Aumenta o dano em +1 dado do mesmo tipo (ex: 2d6 vira 3d6)',
      restricao: 'Armas com essa modificação usam munição especial de calibre grosso',
    },
  },
  {
    codigo: 'MOD_COMPENSADOR',
    nome: 'Compensador',
    descricao: 'Sistema de amortecimento que reduz o recuo em armas automáticas.',
    tipo: TipoModificacao.ARMA_FOGO,
    incrementoEspacos: 0,
    efeitosMecanicos: {
      anulaRajada: true,
      descricao: 'Anula a penalidade por disparar rajadas em armas automáticas',
      restricao: 'Exclusiva para armas automáticas',
    },
  },
  {
    codigo: 'MOD_FERROLHO_AUTOMATICO',
    nome: 'Ferrolho Automático',
    descricao: 'O mecanismo de ação é modificado para disparar vários tiros em sequência, tornando a arma automática.',
    tipo: TipoModificacao.ARMA_FOGO,
    incrementoEspacos: 0,
    efeitosMecanicos: {
      transformaAutomatica: true,
      descricao: 'Transforma a arma em automática para fins de regras',
      restricao: 'Não pode ser aplicada em armas que já são automáticas por padrão',
    },
  },
  {
    codigo: 'MOD_MIRA_LASER',
    nome: 'Mira Laser',
    descricao: 'Um emissor laser projeta um ponto luminoso que auxilia na mira.',
    tipo: TipoModificacao.ARMA_FOGO,
    incrementoEspacos: 0,
    efeitosMecanicos: {
      margemAmeacaAdicional: 2,
      descricao: 'Aumenta a margem de ameaça em +2',
    },
  },
  {
    codigo: 'MOD_MIRA_TELESCOPICA',
    nome: 'Mira Telescópica',
    descricao:
      'Luneta com marcações de distância e compensação, aumentando o alcance da arma e permitindo usar Ataque Furtivo em qualquer alcance.',
    tipo: TipoModificacao.ARMA_FOGO,
    incrementoEspacos: 0,
    efeitosMecanicos: {
      aumentaAlcance: 1,
      ataqueFurtivoQualquerAlcance: true,
      descricao: 'Aumenta o alcance em uma categoria e permite Ataque Furtivo em qualquer alcance',
      restricao: 'Impossível usar em combate close-range sem remover a mira',
    },
  },
  {
    codigo: 'MOD_SILENCIADOR',
    nome: 'Silenciador',
    descricao: 'Dispositivo que reduz significativamente o som do disparo.',
    tipo: TipoModificacao.ARMA_FOGO,
    incrementoEspacos: 0,
    efeitosMecanicos: {
      reducaoPenalidadeFurtividade: '2d20',
      descricao: 'Reduz em 2d20 a penalidade em Furtividade para se esconder no mesmo turno após atirar',
    },
  },
  {
    codigo: 'MOD_VISAO_CALOR',
    nome: 'Visão de Calor',
    descricao:
      'Mira com sistema eletrônico que combina imagem normal e infravermelha, destacando zonas frias e quentes.',
    tipo: TipoModificacao.ARMA_FOGO,
    incrementoEspacos: 0,
    efeitosMecanicos: {
      ignoraCamuflagem: true,
      descricao: 'Ao disparar, o usuário ignora qualquer camuflagem do alvo',
    },
  },
];

// ============================================================
// MODIFICAÇÕES PARA MUNIÇÕES
// ============================================================

const modificacoesMunicao: ModificacaoData[] = [
  {
    codigo: 'MOD_DUM_DUM',
    nome: 'Dum Dum',
    descricao:
      'Munição projetada para se expandir ao atingir o alvo, causando ferimentos mais graves. Pode ser aplicada a balas curtas ou longas.',
    tipo: TipoModificacao.MUNICAO,
    incrementoEspacos: 0,
    efeitosMecanicos: {
      multiplicadorCriticoAdicional: 1,
      descricao: 'Aumenta o multiplicador de crítico em +1',
    },
  },
  {
    codigo: 'MOD_EXPLOSIVA',
    nome: 'Explosiva',
    descricao:
      'Munição com pequena quantidade de substância reativa (como mercúrio ou glicerina) que detona ao impacto. Pode ser aplicada a balas curtas ou longas.',
    tipo: TipoModificacao.MUNICAO,
    incrementoEspacos: 0,
    efeitosMecanicos: {
      danoExplosivo: '2d6',
      descricao: 'Concede +2d6 de dano ao acertar o alvo',
    },
  },
];

// ============================================================
// MODIFICAÇÕES PARA PROTEÇÕES
// ============================================================

const modificacoesProtecao: ModificacaoData[] = [
  {
    codigo: 'MOD_ANTIBOMBAS',
    nome: 'Antibombas',
    descricao:
      'Proteção quimicamente tratada para resistir ao calor e revestida com materiais que amortecem estilhaços. Acompanha capacete com viseira para proteger da luz e barulho de explosões.',
    tipo: TipoModificacao.PROTECAO,
    incrementoEspacos: 0,
    restricoes: {
      tiposEquipamento: [TipoEquipamento.PROTECAO],
      tiposProtecao: [TipoProtecao.VESTIVEL],
      excluiEscudos: true,
      outros: {
        proficienciaProtecao: 'PESADA', // Para referência
      },
    },
    efeitosMecanicos: {
      bonusResistenciaArea: 5,
      descricao: 'Concede +5 em testes de resistência contra efeitos de área',
      restricao: 'Apenas para proteções pesadas (não escudos)',
    },
  },
  {
    codigo: 'MOD_BLINDADA',
    nome: 'Blindada',
    descricao:
      'Proteção reforçada com placas de aço e cerâmica costuradas dentro das camadas de kevlar. Aumenta a Defesa oferecida e o espaço ocupado.',
    tipo: TipoModificacao.PROTECAO,
    incrementoEspacos: 1,
    restricoes: {
      tiposEquipamento: [TipoEquipamento.PROTECAO],
      tiposProtecao: [TipoProtecao.VESTIVEL],
      excluiEscudos: true,
      outros: {
        proficienciaProtecao: 'PESADA',
      },
    },
    efeitosMecanicos: {
      rdAdicional: 5,
      espacoAdicional: 1,
      descricao: 'Aumenta a RD em +5 e aumenta em +1 o espaço ocupado',
      restricao: 'Apenas para proteções pesadas (não escudos)',
    },
  },
  {
    codigo: 'MOD_DISCRETA_PROTECAO',
    nome: 'Discreta (Proteção)',
    descricao: 'Colete compacto feito com kevlar denso para reduzir o volume.',
    tipo: TipoModificacao.PROTECAO,
    incrementoEspacos: -1,
    restricoes: {
      tiposEquipamento: [TipoEquipamento.PROTECAO],
      tiposProtecao: [TipoProtecao.VESTIVEL],
      excluiEscudos: true,
      codigosIncompativeis: ['MOD_REFORCADA'],
      outros: {
        proficienciaProtecao: 'LEVE',
      },
    },
    efeitosMecanicos: {
      reducaoEspacos: 1,
      bonusCrime: 5,
      descricao: 'Reduz espaços em 1 e concede +5 em Crime para ocultar a proteção',
      restricao: 'Apenas para proteções leves (não escudos). Não pode ser combinada com Reforçada',
    },
  },
  {
    codigo: 'MOD_REFORCADA',
    nome: 'Reforçada',
    descricao: 'Estrutura interna reforçada, costuras extras e materiais adicionais.',
    tipo: TipoModificacao.PROTECAO,
    incrementoEspacos: 1,
    restricoes: {
      tiposEquipamento: [TipoEquipamento.PROTECAO],
      tiposProtecao: [TipoProtecao.VESTIVEL],
      excluiEscudos: true,
      codigosIncompativeis: ['MOD_DISCRETA_PROTECAO'],
    },
    efeitosMecanicos: {
      bonusDefesa: 2,
      espacoAdicional: 1,
      descricao: 'Aumenta a Defesa em +2 e aumenta em +1 o espaço ocupado',
      restricao: 'Apenas proteções vestíveis (não escudos). Não pode ser combinada com Discreta',
    },
  },
];

// ============================================================
// MODIFICAÇÕES DE ACESSÓRIOS
// ============================================================

const modificacoesAcessorio: ModificacaoData[] = [
  {
    codigo: 'MOD_APRIMORADO',
    nome: 'Aprimorado',
    descricao:
      'O bônus em perícia concedido pelo acessório aumenta para +5. Se o item tiver função adicional, pode ser escolhida uma segunda vez para essa função.',
    tipo: TipoModificacao.ACESSORIO,
    incrementoEspacos: 0,
    efeitosMecanicos: {
      bonusPericia: 5,
      descricao: 'Aumenta o bônus de perícia para +5',
    },
  },
  {
    codigo: 'MOD_DISCRETO_ACESSORIO',
    nome: 'Discreto (Acessório)',
    descricao: 'O item é miniaturizado ou disfarçado como outro item inócuo (como um relógio).',
    tipo: TipoModificacao.ACESSORIO,
    incrementoEspacos: -1,
    efeitosMecanicos: {
      reducaoEspacos: 1,
      bonusCrime: 5,
      descricao: 'Reduz espaços em 1 e concede +5 em Crime para ocultar',
    },
  },
  {
    codigo: 'MOD_FUNCAO_ADICIONAL',
    nome: 'Função Adicional',
    descricao: 'O acessório fornece +2 em uma perícia adicional à sua escolha, sujeita à aprovação do mestre.',
    tipo: TipoModificacao.ACESSORIO,
    incrementoEspacos: 0,
    efeitosMecanicos: {
      bonusPericia: 2,
      descricao: 'Concede +2 em uma perícia adicional escolhida',
    },
  },
  {
    codigo: 'MOD_INSTRUMENTAL',
    nome: 'Instrumental',
    descricao: 'O acessório pode ser usado como um kit de perícia específica (escolhido ao aplicar esta modificação).',
    tipo: TipoModificacao.ACESSORIO,
    incrementoEspacos: 0,
    efeitosMecanicos: {
      funcionaComoKit: true,
      descricao: 'Funciona como um kit de perícia específico',
    },
  },
];

// ============================================================
// SEED FUNCTION
// ============================================================

export async function seedModificacoes(prisma: PrismaClient) {
  console.log('Cadastrando modificações de equipamentos...');

  const todasModificacoes = [
    ...modificacoesCorpoACorpoEDisparo,
    ...modificacoesArmaFogo,
    ...modificacoesMunicao,
    ...modificacoesProtecao,
    ...modificacoesAcessorio,
  ];

  for (const mod of todasModificacoes) {
    await prisma.modificacaoEquipamento.upsert({
      where: { codigo: mod.codigo },
      update: {
        nome: mod.nome,
        descricao: mod.descricao,
        tipo: mod.tipo,
        incrementoEspacos: mod.incrementoEspacos,
        
        // ✅ FIX: Usar undefined ao invés de null para campos JSON opcionais
        efeitosMecanicos: mod.efeitosMecanicos ?? undefined,
        restricoes: mod.restricoes ?? undefined,

        fonte: TipoFonte.SISTEMA_BASE,
        suplementoId: null,
      },
      create: {
        codigo: mod.codigo,
        nome: mod.nome,
        descricao: mod.descricao,
        tipo: mod.tipo,
        incrementoEspacos: mod.incrementoEspacos,
        
        // ✅ FIX: Usar undefined ao invés de null para campos JSON opcionais
        efeitosMecanicos: mod.efeitosMecanicos ?? undefined,
        restricoes: mod.restricoes ?? undefined,

        fonte: TipoFonte.SISTEMA_BASE,
        suplementoId: null,
      },
    });
  }

  console.log('✅ Modificações cadastradas com sucesso!');
  console.log(`   Total de modificações: ${todasModificacoes.length}`);
  console.log('   Categorias:');
  console.log(`   - Corpo a Corpo e Disparo: ${modificacoesCorpoACorpoEDisparo.length}`);
  console.log(`   - Armas de Fogo: ${modificacoesArmaFogo.length}`);
  console.log(`   - Munições: ${modificacoesMunicao.length}`);
  console.log(`   - Proteções: ${modificacoesProtecao.length}`);
  console.log(`   - Acessórios: ${modificacoesAcessorio.length}`);
}

// ============================================================
// EXPORTS
// ============================================================

export {
  modificacoesCorpoACorpoEDisparo,
  modificacoesArmaFogo,
  modificacoesMunicao,
  modificacoesProtecao,
  modificacoesAcessorio,
};

export type { ModificacaoData, RestricoesModificacao };
