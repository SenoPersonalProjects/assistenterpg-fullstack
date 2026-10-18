import { Prisma, PrismaClient, TipoExecucao } from '@prisma/client';
import {
  CATALOGO_DEZ_SOMBRAS,
  HERANCAS_DEZ_SOMBRAS,
} from '../../../src/sessao/dez-sombras.catalogo';
import { snapshotSombra } from '../../../src/sessao/dez-sombras.service';
import { revisarTextoDezSombras } from './texto-revisado';
type Db = PrismaClient | Prisma.TransactionClient;
export async function seedCatalogoHaeinsa(db: Db, documento: string) {
  const documentoRevisado = revisarTextoDezSombras(documento);
  const tecnica = await db.tecnicaAmaldicoada.upsert({
    where: { codigo: 'DEZ_SOMBRAS' },
    create: {
      codigo: 'DEZ_SOMBRAS',
      nome: 'Dez Sombras',
      descricao: documentoRevisado,
      tipo: 'INATA',
      fonte: 'SISTEMA_BASE',
      hereditaria: true,
    },
    update: { descricao: documentoRevisado },
  });
  const config = {
    modo: 'PREDEFINIDOS' as const,
    ativo: true,
    limitesJson: {
      cadastro: { tipo: 'ILIMITADO' },
      ativo: { tipo: 'ILIMITADO' },
    },
    regrasJson: {
      permiteCriarNovos: false,
      usaTemplates: true,
      exigeDesbloqueio: true,
      tipoGrauCodigo: 'TECNICA_SHIKIGAMI',
      familiasFixas: 10,
      herancas: HERANCAS_DEZ_SOMBRAS,
    },
    calculoJson: { regra: 'DEZ_SOMBRAS_V1', versao: '2026.10.18' },
  };
  await db.tecnicaVinculadoConfig.upsert({
    where: {
      tecnicaId_tipoVinculado: {
        tecnicaId: tecnica.id,
        tipoVinculado: 'SHIKIGAMI',
      },
    },
    create: { tecnicaId: tecnica.id, tipoVinculado: 'SHIKIGAMI', ...config },
    update: config,
  });
  for (const [ordem, sombra] of CATALOGO_DEZ_SOMBRAS.entries()) {
    const data = {
      nome: sombra.nome,
      conceito: sombra.nome,
      tipoVinculado: 'SHIKIGAMI' as const,
      snapshotJson: snapshotSombra(sombra),
      requisitosJson: {
        exigeDesbloqueio:
          !sombra.codigo.startsWith('CAO_') ||
          sombra.codigo === 'CAO_TOTALIDADE',
        componentes: sombra.componentes ?? [],
        herancaDe: sombra.herancaDe ?? null,
      },
      bloqueadoPorPadrao: !['CAO_BRANCO', 'CAO_PRETO'].includes(sombra.codigo),
      ordem,
      ativo: true,
    };
    await db.tecnicaVinculadoTemplate.upsert({
      where: {
        tecnicaId_codigo: { tecnicaId: tecnica.id, codigo: sombra.codigo },
      },
      create: { tecnicaId: tecnica.id, codigo: sombra.codigo, ...data },
      update: data,
    });
  }
  await db.tecnicaVinculadoTemplate.updateMany({
    where: { tecnicaId: tecnica.id, codigo: 'CAES_DIVINOS' },
    data: { ativo: false },
  });
  const jardim = {
    nome: 'Jardim das Sombras Justapostas',
    descricao:
      'Expansão fechada completa das Dez Sombras. Integridade4, DT estrutural21 com Barreira2.',
    execucao: TipoExecucao.ACAO_COMPLETA,
    alcance: 'Raio curto (9m)',
    alvo: 'Área',
    duracao: 'Sustentada',
    custoEA: 14,
    custoPE: 4,
    custoSustentacaoEA: 4,
    custoSustentacaoPE: 0,
    requisitos: {
      graus: [{ tipoGrauCodigo: 'TECNICA_BARREIRA', valorMinimo: 2 }],
      exigeTecnicaInata: true,
      exigeDominioInato: true,
      exigeMudra: true,
    },
    mecanicasSessao: {
      tipo: 'EXPANSAO_DOMINIO',
      dominio: { tipo: 'FECHADO', acertoGarantido: true, regra: 'DEZ_SOMBRAS' },
    },
    efeito:
      'No início do turno do usuário, 1/rodada: habilidade ofensiva vinculada fixa contra um alvo sem teste inicial; área original e resistências secundárias permanecem. Paga apenas custo próprio adicional da habilidade. Mar de Sombras: outros pagam1EA no início do turno ou terreno difícil/-5 equilíbrio; após queda/empurrão ReflexosDT30 ou Agarrado; sair: Movimento+1EA. Potencial120%: +1d20 Jujutsu da técnica e ataques dos shikigamis; +2DT. Até3 Ecos/turno; Carga≤5,1EA cada; clone2EA,máximo1/rodada. Esgotamento Inato2rodadas e de Domínio até Dormir.',
    ordem: 100,
  };
  await db.habilidadeTecnica.upsert({
    where: { codigo: 'INATA_DEZ_SOMBRAS_JARDIM' },
    create: {
      tecnicaId: tecnica.id,
      codigo: 'INATA_DEZ_SOMBRAS_JARDIM',
      ...jardim,
    },
    update: jardim,
  });
  const flor = await db.tecnicaAmaldicoada.upsert({
    where: { codigo: 'NAOINATA_EMOCAO_FLOR_CAIDA' },
    create: {
      codigo: 'NAOINATA_EMOCAO_FLOR_CAIDA',
      nome: 'Emoção da Flor Caída',
      tipo: 'NAO_INATA',
      descricao:
        'Técnica secreta das Três Grandes Famílias: defesa reativa contra dano direto de Acerto Garantido.',
    },
    update: {},
  });
  const habilidadeFlor = {
    nome: 'Emoção da Flor Caída',
    descricao:
      'Padrão; pode abrir como Reação Especial no primeiro Acerto Garantido sofrido. Encerra ao usar Movimento voluntário para deslocar.',
    execucao: TipoExecucao.ACAO_PADRAO,
    custoEA: 2,
    custoPE: 0,
    custoSustentacaoEA: 1,
    custoSustentacaoPE: 0,
    duracao: 'Sustentada',
    efeito:
      'Não neutraliza Acerto Garantido. Contra cada ocorrência de dano direto de Acerto Garantido, pode gastar até3EA para RD5 porEA (máximo15). Forma da Lâmina com Dadao: +5 no ataque de contra-ataques contra ataques imbuídos em EA.',
  };
  const habilidadeFlorCadastrada = await db.habilidadeTecnica.upsert({
    where: { codigo: 'NAOINATA_EMOCAO_FLOR_CAIDA_ATIVAR' },
    create: {
      tecnicaId: flor.id,
      codigo: 'NAOINATA_EMOCAO_FLOR_CAIDA_ATIVAR',
      ...habilidadeFlor,
    },
    update: habilidadeFlor,
  });
  const nomeReacaoFlor = 'Abertura reativa — primeiro Acerto Garantido';
  const variacaoFlor = await db.variacaoHabilidade.findFirst({
    where: {
      habilidadeTecnicaId: habilidadeFlorCadastrada.id,
      nome: nomeReacaoFlor,
    },
  });
  const dadosReacaoFlor = {
    nome: nomeReacaoFlor,
    descricao:
      'Reação Especial no primeiro Acerto Garantido sofrido; paga a abertura normal de 2 EA e mantém 1 EA/rodada.',
    execucao: TipoExecucao.REACAO_ESPECIAL,
  };
  if (variacaoFlor)
    await db.variacaoHabilidade.update({
      where: { id: variacaoFlor.id },
      data: dadosReacaoFlor,
    });
  else
    await db.variacaoHabilidade.create({
      data: {
        habilidadeTecnicaId: habilidadeFlorCadastrada.id,
        ...dadosReacaoFlor,
      },
    });
  const dadao = {
    nome: 'Dadao Negro — Sabre do Prodígio',
    descricao:
      'Ferramenta Amaldiçoada complexa; arma tática de uma mão. Modificações Cruel/Perigosa são aplicadas na instância.',
    tipo: 'FERRAMENTA_AMALDICOADA' as const,
    categoria: 'ESPECIAL' as const,
    espacos: 1,
    fonte: 'SISTEMA_BASE' as const,
    proficienciaArma: 'TATICA' as const,
    empunhaduras: ['UMA_MAO'],
    tipoArma: 'CORPO_A_CORPO' as const,
    criticoValor: 19,
    criticoMultiplicador: 2,
    tipoAmaldicoado: 'ARMA' as const,
    complexidadeMaldicao: 'COMPLEXA' as const,
    requerFerramentasAmaldicoadas: true,
    habilidadeEspecial: 'SABRE_DO_PRODIGIO',
    efeitoMaldicao:
      'Portador com origem Prodígio do Clã recebe +1d20 nos ataques com esta arma.',
    efeito:
      'Dano-base2d10 Corte. Com FOR2+Cruel:2d10+4. Crítico-base19/x2; com Perigosa17/x2.',
  };
  const arma = await db.equipamentoCatalogo.upsert({
    where: { codigo: 'DADAO_NEGRO' },
    create: { codigo: 'DADAO_NEGRO', ...dadao },
    update: dadao,
  });
  const dano = await db.equipamentoDano.findFirst({
    where: { equipamentoId: arma.id, tipoDano: 'CORTANTE' },
  });
  const danoData = {
    empunhadura: 'UMA_MAO' as const,
    rolagem: '2d10',
    valorFlat: 0,
    ordem: 0,
  };
  if (dano)
    await db.equipamentoDano.update({ where: { id: dano.id }, data: danoData });
  else
    await db.equipamentoDano.create({
      data: { equipamentoId: arma.id, tipoDano: 'CORTANTE', ...danoData },
    });
  for (const codigo of ['MOD_CRUEL', 'MOD_PERIGOSA']) {
    const modificacao = await db.modificacaoEquipamento.findUniqueOrThrow({
      where: { codigo },
    });
    await db.equipamentoModificacaoAplicavel.upsert({
      where: {
        equipamentoId_modificacaoId: {
          equipamentoId: arma.id,
          modificacaoId: modificacao.id,
        },
      },
      create: { equipamentoId: arma.id, modificacaoId: modificacao.id },
      update: {},
    });
  }
  return { tecnica, flor, arma };
}
