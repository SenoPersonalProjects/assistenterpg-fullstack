import {
  ModoVinculadoTecnica,
  Prisma,
  PrismaClient,
  TipoEntidadeVinculadaPersonagem,
} from '@prisma/client';
import { CATALOGO_DEZ_SOMBRAS } from '../../../src/sessao/dez-sombras.catalogo';
import { snapshotSombra } from '../../../src/sessao/dez-sombras.service';

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
    calculoJson: { regra: 'SHIKIGAMI_V2', versao: '1.4.0' },
  },
  {
    tecnicaCodigo: 'DEZ_SOMBRAS',
    tipoVinculado: TipoEntidadeVinculadaPersonagem.SHIKIGAMI,
    modo: ModoVinculadoTecnica.PREDEFINIDOS,
    limitesJson: {
      cadastro: { tipo: 'ILIMITADO' }, // Dez famílias fixas; variantes não são novos shikigamis.
      ativo: { tipo: 'ILIMITADO' }, // Capacidade validada por Carga, nunca por quantidade.
    },
    regrasJson: {
      permiteCriarNovos: false,
      usaTemplates: true,
      exigeDesbloqueio: true,
      tipoGrauCodigo: 'TECNICA_SHIKIGAMI',
    },
    calculoJson: { regra: 'DEZ_SOMBRAS_V1', versao: '2026.10.18' },
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

  for (const [indice, sombra] of CATALOGO_DEZ_SOMBRAS.entries()) {
    const template = {
      codigo: sombra.codigo,
      nome: sombra.nome,
      conceito: sombra.nome,
      ordem: (indice + 1) * 10,
    };
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
        snapshotJson: snapshotSombra(sombra),
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
        snapshotJson: snapshotSombra(sombra),
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
