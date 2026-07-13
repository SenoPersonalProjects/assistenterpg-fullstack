import {
  ModoVinculadoTecnica,
  Prisma,
  PrismaClient,
  TipoEntidadeVinculadaPersonagem,
} from '@prisma/client';

type ConfigSeed = {
  tecnicaCodigo: string;
  tipoVinculado: TipoEntidadeVinculadaPersonagem;
  modo: ModoVinculadoTecnica;
  limitesJson: Prisma.InputJsonValue;
  regrasJson: Prisma.InputJsonValue;
  calculoJson: Prisma.InputJsonValue;
};

const CONFIGURACOES: ConfigSeed[] = [
  {
    tecnicaCodigo: 'NAOINATA_TECNICA_SHIKIGAMI',
    tipoVinculado: TipoEntidadeVinculadaPersonagem.SHIKIGAMI,
    modo: ModoVinculadoTecnica.CRIAVEL,
    limitesJson: {
      cadastro: { tipo: 'QUANTIDADE', valor: 1 },
      ativo: { tipo: 'QUANTIDADE', valor: 1 },
    },
    regrasJson: {
      permiteCriarNovos: true,
      usaTemplates: false,
      tipoGrauCodigo: 'TECNICA_SHIKIGAMI',
    },
    calculoJson: { regra: 'SHIKIGAMI_V1', versao: '1.0.0' },
  },
  {
    tecnicaCodigo: 'DEZ_SOMBRAS',
    tipoVinculado: TipoEntidadeVinculadaPersonagem.SHIKIGAMI,
    modo: ModoVinculadoTecnica.PREDEFINIDOS,
    limitesJson: {
      cadastro: { tipo: 'QUANTIDADE', valor: 10 },
      ativo: { tipo: 'QUANTIDADE', valor: 1 },
    },
    regrasJson: {
      permiteCriarNovos: false,
      usaTemplates: true,
      exigeDesbloqueio: true,
      tipoGrauCodigo: 'TECNICA_SHIKIGAMI',
    },
    calculoJson: { regra: 'SHIKIGAMI_V1', versao: '1.0.0' },
  },
  {
    tecnicaCodigo: 'NAOINATA_TECNICA_CORPOS_AMALDICOADOS',
    tipoVinculado: TipoEntidadeVinculadaPersonagem.CORPO_AMALDICOADO,
    modo: ModoVinculadoTecnica.CRIAVEL,
    limitesJson: {
      cadastro: { tipo: 'VAGAS_POR_NIVEL' },
      ativo: { tipo: 'VAGAS_POR_NIVEL' },
    },
    regrasJson: {
      permiteCriarNovos: true,
      usaVagasCadastro: true,
      usaVagasAtivas: true,
      permitePesado: true,
      tipoGrauCodigo: 'TECNICA_CADAVERES',
    },
    calculoJson: { regra: 'CORPO_AMALDICOADO_V1', versao: '1.0.0' },
  },
  {
    tecnicaCodigo: 'MANIPULACAO_FANTOCHES',
    tipoVinculado: TipoEntidadeVinculadaPersonagem.CORPO_AMALDICOADO,
    modo: ModoVinculadoTecnica.CRIAVEL,
    limitesJson: {
      cadastro: { tipo: 'VAGAS_POR_NIVEL' },
      ativo: { tipo: 'VAGAS_POR_NIVEL' },
    },
    regrasJson: {
      permiteCriarNovos: true,
      usaVagasCadastro: true,
      usaVagasAtivas: true,
      permitePesado: true,
      tipoGrauCodigo: 'TECNICA_CADAVERES',
    },
    calculoJson: { regra: 'CORPO_AMALDICOADO_V1', versao: '1.0.0' },
  },
  {
    tecnicaCodigo: 'MANIPULACAO_MALDICAO',
    tipoVinculado: TipoEntidadeVinculadaPersonagem.MALDICAO_CONTROLADA,
    modo: ModoVinculadoTecnica.CRIAVEL,
    limitesJson: {
      cadastro: { tipo: 'ILIMITADO' },
      ativo: { tipo: 'ILIMITADO' },
    },
    regrasJson: {
      permiteCapturar: true,
      exigeOrigemNpcTipo: 'MALDICAO',
      aplicaNerfPv: true,
    },
    calculoJson: { regra: 'MALDICAO_CONTROLADA_V1', versao: '1.0.0' },
  },
];

const TEMPLATES_DEZ_SOMBRAS = [
  { codigo: 'CAES_DIVINOS', nome: 'Caes Divinos', ordem: 10, conceito: 'Dupla de caes shikigami.' },
  { codigo: 'NUE', nome: 'Nue', ordem: 20, conceito: 'Shikigami alado.' },
  { codigo: 'SAPO', nome: 'Sapo', ordem: 30, conceito: 'Shikigami sapo de suporte.' },
  { codigo: 'SERPENTE_OROCHI', nome: 'Serpente Orochi', ordem: 40, conceito: 'Shikigami serpente.' },
  { codigo: 'MAX_ELEFANTE', nome: 'Max Elefante', ordem: 50, conceito: 'Shikigami elefante de grande porte.' },
  { codigo: 'MAHORAGA', nome: 'Mahoraga', ordem: 60, conceito: 'Shikigami de adaptacao extrema.' },
] as const;

export async function seedConfiguracoesVinculadosTecnicas(
  prisma: PrismaClient,
) {
  for (const config of CONFIGURACOES) {
    const tecnica = await prisma.tecnicaAmaldicoada.findUnique({
      where: { codigo: config.tecnicaCodigo },
      select: { id: true },
    });
    if (!tecnica) {
      console.warn(
        `Configuracao de vinculados ignorada: tecnica ${config.tecnicaCodigo} nao encontrada.`,
      );
      continue;
    }

    await prisma.tecnicaVinculadoConfig.upsert({
      where: {
        tecnicaId_tipoVinculado: {
          tecnicaId: tecnica.id,
          tipoVinculado: config.tipoVinculado,
        },
      },
      update: {
        modo: config.modo,
        limitesJson: config.limitesJson,
        regrasJson: config.regrasJson,
        calculoJson: config.calculoJson,
        ativo: true,
      },
      create: {
        tecnicaId: tecnica.id,
        tipoVinculado: config.tipoVinculado,
        modo: config.modo,
        limitesJson: config.limitesJson,
        regrasJson: config.regrasJson,
        calculoJson: config.calculoJson,
      },
    });
    await prisma.personagemCampanhaEntidadeVinculada.updateMany({
      where: {
        tecnicaOrigemId: tecnica.id,
        calculoAutomatico: { not: Prisma.DbNull },
      },
      data: { precisaRecalculo: true },
    });
  }

  const dezSombras = await prisma.tecnicaAmaldicoada.findUnique({
    where: { codigo: 'DEZ_SOMBRAS' },
    select: { id: true },
  });
  if (!dezSombras) return;

  for (const template of TEMPLATES_DEZ_SOMBRAS) {
    const templatePersistido = await prisma.tecnicaVinculadoTemplate.upsert({
      where: {
        tecnicaId_codigo: {
          tecnicaId: dezSombras.id,
          codigo: template.codigo,
        },
      },
      update: {
        nome: template.nome,
        conceito: template.conceito,
        tipoVinculado: TipoEntidadeVinculadaPersonagem.SHIKIGAMI,
        snapshotJson: { incompleto: true },
        requisitosJson: { exigeDesbloqueio: true },
        bloqueadoPorPadrao: true,
        ordem: template.ordem,
        ativo: true,
      },
      create: {
        tecnicaId: dezSombras.id,
        codigo: template.codigo,
        nome: template.nome,
        conceito: template.conceito,
        tipoVinculado: TipoEntidadeVinculadaPersonagem.SHIKIGAMI,
        snapshotJson: { incompleto: true },
        requisitosJson: { exigeDesbloqueio: true },
        bloqueadoPorPadrao: true,
        ordem: template.ordem,
      },
    });
    await prisma.personagemCampanhaEntidadeVinculada.updateMany({
      where: {
        templateId: templatePersistido.id,
        calculoAutomatico: { not: Prisma.DbNull },
      },
      data: { precisaRecalculo: true },
    });
  }
}
