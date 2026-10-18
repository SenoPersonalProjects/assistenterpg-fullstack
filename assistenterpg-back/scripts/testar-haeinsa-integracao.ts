import 'dotenv/config';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { Prisma, PrismaClient } from '@prisma/client';
import { seedPericias } from '../prisma/seeds/catalogos/pericias';
import { seedTiposGrau } from '../prisma/seeds/catalogos/tipos-graus';
import { seedProficiencias } from '../prisma/seeds/catalogos/proficiencias';
import { seedPassivasAtributos } from '../prisma/seeds/personagem/passivas-atributos';
import { seedModificacoes } from '../prisma/seeds/catalogos/modificacoes';
import { seedCondicoes } from '../prisma/seeds/catalogos/condicoes';
import { processarCondicoesSombrasTx } from '../src/sessao/dez-sombras.condicoes';
import { hash } from 'bcrypt';
import {
  DezSombrasService,
  dormirSombrasTx,
  processarTurnoSombrasTx,
} from '../src/sessao/dez-sombras.service';
import {
  NpcAcoesService,
  iniciarTurnoNpcTx,
  sustentarAcoesNpcTx,
} from '../src/sessao/npc-acoes.service';
import { SessaoService } from '../src/sessao/sessao.service';
import { SessaoCondicoesAutomaticasService } from '../src/sessao-condicoes-automaticas/sessao-condicoes-automaticas.service';
import { PrismaService } from '../src/prisma/prisma.service';
import { CampanhaAccessService } from '../src/campanha/campanha.access.service';
import { AcaoDezSombrasDto } from '../src/sessao/dto/dez-sombras.dto';
const json = (v: unknown) =>
  JSON.parse(JSON.stringify(v)) as Prisma.InputJsonValue;
async function main() {
  const original = new URL(process.env.DATABASE_URL!);
  if (!['localhost', '127.0.0.1'].includes(original.hostname))
    throw new Error('Teste permitido apenas em banco local isolado.');
  const nomeBanco = `assistenterpg_haeinsa_teste_${Date.now()}`;
  const controle = new PrismaClient();
  await controle.$executeRawUnsafe(
    `CREATE DATABASE \`${nomeBanco}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`,
  );
  await controle.$disconnect();
  original.pathname = `/${nomeBanco}`;
  const env = { ...process.env, DATABASE_URL: original.toString() };
  function executar(args: string[]) {
    const result = spawnSync(process.execPath, args, {
      env,
      stdio: 'inherit',
      timeout: 120_000,
    });
    if (result.status !== 0)
      throw new Error(`Comando de integração falhou (${result.status}).`);
  }
  executar([
    'node_modules/prisma/build/index.js',
    'db',
    'push',
    '--skip-generate',
  ]);
  const db = new PrismaClient({
    datasources: { db: { url: original.toString() } },
  });
  try {
    const admin = await db.usuario.create({
      data: {
        apelido: 'Admin Teste Haeinsa',
        email: 'admin@haeinsa.invalid',
        senhaHash: 'conta-de-teste-sem-login',
        role: 'ADMIN',
      },
    });
    const jogador = await db.usuario.create({
      data: {
        apelido: 'Controlador',
        email: 'jogador@haeinsa.invalid',
        senhaHash: 'conta-de-teste-sem-login',
      },
    });
    const outro = await db.usuario.create({
      data: {
        apelido: 'Outro',
        email: 'outro@haeinsa.invalid',
        senhaHash: 'conta-de-teste-sem-login',
      },
    });
    const cla = await db.cla.create({ data: { nome: 'Zenin' } });
    const origem = await db.origem.create({
      data: { nome: 'Prodígio do Clã' },
    });
    const classe = await db.classe.create({ data: { nome: 'Sentinela' } });
    await db.trilha.create({
      data: { nome: 'Especialista em Shikigami', classeId: classe.id },
    });
    for (const seed of [
      seedPericias,
      seedTiposGrau,
      seedProficiencias,
      seedPassivasAtributos,
      seedModificacoes,
      seedCondicoes,
    ])
      await seed(db);
    for (const codigo of [
      'NAOINATA_TECNICA_AMALDICOADA',
      'NAOINATA_TECNICA_BARREIRA',
      'NAOINATA_TECNICA_SHIKIGAMI',
    ])
      await db.tecnicaAmaldicoada.create({
        data: {
          codigo,
          nome: codigo,
          tipo: 'NAO_INATA',
          descricao: 'Catálogo de teste isolado.',
        },
      });
    for (const codigo of [
      'UNIFORME_ESCOLA_TECNICA_DEFESA',
      'ALGEMAS',
      'CORDA',
      'LANTERNA_TATICA',
      'KIT_MEDICINA',
    ])
      await db.equipamentoCatalogo.create({
        data: { codigo, nome: codigo, tipo: 'ACESSORIO', espacos: 1 },
      });
    executar([
      '-r',
      'ts-node/register',
      '-r',
      'tsconfig-paths/register',
      'scripts/importar-haeinsa.ts',
      '--apply',
    ]);
    executar([
      '-r',
      'ts-node/register',
      '-r',
      'tsconfig-paths/register',
      'scripts/importar-haeinsa.ts',
      '--apply',
    ]);
    assert.equal(await db.personagemBase.count(), 1);
    assert.equal(await db.npcAmeaca.count(), 4);
    const base = await db.personagemBase.findFirstOrThrow({
      include: {
        inventarioItens: { include: { equipamento: true, modificacoes: true } },
        pericias: true,
      },
    });
    assert.equal(base.pericias.length, 27);
    assert.equal(
      base.inventarioItens.find((i) => i.equipamento.codigo === 'KIT_MEDICINA')
        ?.espacosCalculados,
      0,
    );
    assert.equal(
      (
        await db.equipamentoCatalogo.findUniqueOrThrow({
          where: { codigo: 'KIT_MEDICINA' },
        })
      ).espacos,
      1,
    );
    const campanha = await db.campanha.create({
      data: {
        donoId: admin.id,
        nome: 'Integração Haeinsa',
        status: 'ATIVA',
        membros: {
          create: [
            { usuarioId: jogador.id, papel: 'JOGADOR' },
            { usuarioId: outro.id, papel: 'JOGADOR' },
          ],
        },
      },
    });
    const pc = await db.personagemCampanha.create({
      data: {
        campanhaId: campanha.id,
        personagemBaseId: base.id,
        donoId: admin.id,
        nome: base.nome,
        nivel: 18,
        claId: cla.id,
        origemId: origem.id,
        classeId: classe.id,
        pvMax: 104,
        pvAtual: 104,
        peMax: 108,
        peAtual: 108,
        eaMax: 162,
        eaAtual: 162,
        sanMax: 80,
        sanAtual: 80,
        limitePeEaPorTurno: 18,
        tecnicaInataId: base.tecnicaInataId,
        configuracaoDezSombras: json(base.configuracaoDezSombras),
      },
    });
    const sessao = await db.sessao.create({
      data: {
        campanhaId: campanha.id,
        titulo: 'Teste',
        status: 'EM_ANDAMENTO',
        cenaAtualTipo: 'COMBATE',
      },
    });
    const cena = await db.cena.create({ data: { sessaoId: sessao.id } });
    const ps = await db.personagemSessao.create({
      data: {
        sessaoId: sessao.id,
        cenaId: cena.id,
        personagemCampanhaId: pc.id,
        controladorUsuarioId: jogador.id,
      },
    });
    const prisma = db as unknown as PrismaService;
    const sombras = new DezSombrasService(prisma),
      npcs = new NpcAcoesService(prisma),
      acesso = new CampanhaAccessService(prisma);
    const sessaoService = new SessaoService(
      prisma,
      new SessaoCondicoesAutomaticasService(),
      sombras,
    );
    const armaBase = base.inventarioItens.find(
      (i) => i.equipamento.codigo === 'DADAO_NEGRO',
    )!;
    const armaCampanha = await db.inventarioItemCampanha.create({
      data: {
        personagemCampanhaId: pc.id,
        equipamentoId: armaBase.equipamentoId,
        equipado: true,
        modificacoes: {
          create: armaBase.modificacoes.map((m) => ({
            modificacaoId: m.modificacaoId,
          })),
        },
      },
    });
    const macros = await sessaoService.listarMacrosPersonagemSessao(
      campanha.id,
      sessao.id,
      ps.id,
      jogador.id,
    );
    assert.equal(macros.armas[0].preview.quantidadeDados, 3);
    assert.equal(macros.armas[0].preview.bonus, 20);
    assert.equal(macros.armas[0].danos[0].valorFlat, 4);
    assert.equal(macros.armas[0].critico.valor, 17);
    const macroAutoritativa = (await db.$transaction((tx) =>
      (sessaoService as any).resolverMacroArmaAutoritativoTx(
        tx,
        campanha.id,
        sessao.id,
        ps.id,
        armaCampanha.id,
      ),
    )) as {
      quantidadeDados: number;
      item: { criticoValor: number; danos: Array<{ valorFlat: number }> };
    };
    assert.equal(macroAutoritativa.quantidadeDados, 3);
    assert.equal(macroAutoritativa.item.criticoValor, 17);
    assert.equal(macroAutoritativa.item.danos[0].valorFlat, 4);
    async function usar(
      acao: AcaoDezSombrasDto['acao'],
      sombra: string,
      extra: Partial<AcaoDezSombrasDto> = {},
      usuario = jogador.id,
    ) {
      return sombras.executar(campanha.id, sessao.id, ps.id, usuario, {
        clientRequestId: randomUUID(),
        acao,
        sombra,
        ...extra,
      });
    }
    await assert.rejects(usar('INVOCAR', 'NUE', {}, outro.id), /controla/);
    const request = randomUUID();
    await usar('INVOCAR', 'NUE', { clientRequestId: request });
    await usar('INVOCAR', 'NUE', { clientRequestId: request });
    assert.equal(
      (await db.personagemCampanha.findUniqueOrThrow({ where: { id: pc.id } }))
        .eaAtual,
      161,
    );
    await usar('COMANDAR', 'NUE');
    await usar('USAR', 'NUE', { habilidade: 'RASGAR' });
    let painel = await sombras.obter(campanha.id, sessao.id, ps.id, jogador.id);
    const nueId = painel.estado.sombras.NUE.npcSessaoId!;
    const alvoTeste = await db.npcAmeacaSessao.create({
      data: {
        sessaoId: sessao.id,
        cenaId: cena.id,
        nomeExibicao: 'Alvo de integração',
        pontosVidaMax: 200,
        pontosVidaAtual: 200,
        defesa: 15,
        fichaTipo: 'NPC',
        tipo: 'OUTRO',
      },
    });
    const atordoado = await db.condicao.findFirstOrThrow({
      where: { nome: 'Atordoado' },
    });
    const condicaoTeste = await db.condicaoPersonagemSessao.create({
      data: {
        sessaoId: sessao.id,
        cenaId: cena.id,
        npcSessaoId: alvoTeste.id,
        condicaoId: atordoado.id,
        turnoAplicacao: 1,
        duracaoModo: 'FIM_PROXIMO_TURNO',
        fonteCodigo: 'DEZ_SOMBRAS',
        observacao: JSON.stringify({ tipo: 'TEMPORARIA', origemId: ps.id }),
      },
    });
    await db.$transaction((tx) =>
      processarCondicoesSombrasTx(
        tx,
        sessao.id,
        { npcSessaoId: alvoTeste.id },
        'FIM',
      ),
    );
    assert.equal(
      (
        await db.condicaoPersonagemSessao.findUniqueOrThrow({
          where: { id: condicaoTeste.id },
        })
      ).ativo,
      true,
    );
    await db.$transaction((tx) =>
      processarCondicoesSombrasTx(
        tx,
        sessao.id,
        { npcSessaoId: alvoTeste.id },
        'INICIO',
      ),
    );
    assert.equal(
      (
        await db.condicaoPersonagemSessao.findUniqueOrThrow({
          where: { id: condicaoTeste.id },
        })
      ).ativo,
      true,
    );
    await db.$transaction((tx) =>
      processarCondicoesSombrasTx(
        tx,
        sessao.id,
        { npcSessaoId: alvoTeste.id },
        'FIM',
      ),
    );
    assert.equal(
      (
        await db.condicaoPersonagemSessao.findUniqueOrThrow({
          where: { id: condicaoTeste.id },
        })
      ).ativo,
      false,
    );
    const dadoAtaque = await db.$transaction((tx) =>
      (sessaoService as any).resolverRolagemNpcAutoritativaTx(
        tx,
        campanha.id,
        sessao.id,
        jogador.id,
        false,
        {
          tipo: 'ATAQUE_NPC',
          npcSessaoId: nueId,
          origemAtaque: 'ACAO',
          acaoIndice: 0,
        },
      ),
    );
    assert.equal(
      (dadoAtaque as { expressao: { keepMode: string } }).expressao.keepMode,
      'HIGHEST',
    );
    const danoMisto = await db.$transaction((tx) =>
      (sessaoService as any).resolverRolagemNpcAutoritativaTx(
        tx,
        campanha.id,
        sessao.id,
        jogador.id,
        false,
        { tipo: 'DANO_NPC', npcSessaoId: nueId, acaoIndice: 0 },
      ),
    );
    assert.equal(
      (danoMisto as { expressao: { termos: unknown[] } }).expressao.termos
        .length,
      2,
    );
    await db.npcAmeacaSessao.update({
      where: { id: nueId },
      data: { pontosVidaAtual: 37 },
    });
    await usar('LIBERAR', 'NUE');
    await db.sessao.update({
      where: { id: sessao.id },
      data: { rodadaAtual: 2 },
    });
    await db.$transaction((tx) =>
      processarTurnoSombrasTx(tx, sessao.id, ps.id, 2),
    );
    painel = await usar('INVOCAR', 'NUE');
    assert.equal(painel.estado.sombras.NUE.pv, 37);
    await usar('INVOCAR', 'SERPENTE_OROCHI');
    await usar('COMANDAR', 'SERPENTE_OROCHI');
    await usar('USAR', 'SERPENTE_OROCHI', { habilidade: 'MORDIDA' });
    await usar('USAR', 'SERPENTE_OROCHI', { habilidade: 'VENENO' });
    await usar('APLICAR_CONDICAO', 'SERPENTE_OROCHI', {
      habilidade: 'VENENO',
      alvoNpcSessaoId: alvoTeste.id,
    });
    await db.$transaction((tx) =>
      processarCondicoesSombrasTx(
        tx,
        sessao.id,
        { npcSessaoId: alvoTeste.id },
        'INICIO',
      ),
    );
    assert.equal(
      await db.eventoSessao.count({
        where: { sessaoId: sessao.id, tipoEvento: 'DEZ_SOMBRAS_VENENO_DANO' },
      }),
      1,
    );
    await db.$transaction((tx) =>
      processarCondicoesSombrasTx(
        tx,
        sessao.id,
        { npcSessaoId: alvoTeste.id },
        'FIM',
      ),
    );
    await usar('ENCERRAR_VENENO', 'SERPENTE_OROCHI', {
      alvoNpcSessaoId: alvoTeste.id,
    });
    assert.equal(
      await db.condicaoPersonagemSessao.count({
        where: {
          sessaoId: sessao.id,
          npcSessaoId: alvoTeste.id,
          ativo: true,
          fonteCodigo: 'DEZ_SOMBRAS',
        },
      }),
      0,
    );
    const antes = await db.personagemCampanha.findUniqueOrThrow({
      where: { id: pc.id },
    });
    await assert.rejects(usar('INVOCAR', 'MADOKA'), /Carga/);
    assert.equal(
      (await db.personagemCampanha.findUniqueOrThrow({ where: { id: pc.id } }))
        .eaAtual,
      antes.eaAtual,
    );
    await usar('LIBERAR', 'NUE');
    await usar('LIBERAR', 'SERPENTE_OROCHI');
    await db.sessao.update({
      where: { id: sessao.id },
      data: { rodadaAtual: 3 },
    });
    await db.$transaction((tx) =>
      processarTurnoSombrasTx(tx, sessao.id, ps.id, 3),
    );
    painel = await usar('INVOCAR', 'COELHO_COLOSSAL');
    const coelhoId = painel.estado.sombras.COELHO_COLOSSAL.npcSessaoId!;
    await sessaoService.atualizarNpcSessao(
      campanha.id,
      sessao.id,
      coelhoId,
      jogador.id,
      { pontosVidaAtual: 170, pontosVidaAtualEsperado: 375 },
    );
    assert.equal(
      (await db.npcAmeacaSessao.findUniqueOrThrow({ where: { id: coelhoId } }))
        .pontosVidaMax,
      175,
    );
    const eventoDanoCoelho = await db.eventoSessao.findFirstOrThrow({
      where: { sessaoId: sessao.id, tipoEvento: 'NPC_ATUALIZADO' },
      orderBy: { id: 'desc' },
    });
    await sessaoService.desfazerEventoSessao(
      campanha.id,
      sessao.id,
      eventoDanoCoelho.id,
      admin.id,
      'Conferência do desfazer de dano.',
    );
    assert.equal(
      (await db.npcAmeacaSessao.findUniqueOrThrow({ where: { id: coelhoId } }))
        .pontosVidaMax,
      375,
    );
    await sessaoService.atualizarNpcSessao(
      campanha.id,
      sessao.id,
      coelhoId,
      jogador.id,
      { pontosVidaAtual: 170, pontosVidaAtualEsperado: 375 },
    );
    painel = await usar('COMANDAR', 'COELHO_COLOSSAL');
    assert.equal(painel.estado.sombras.COELHO_GRANDE.pv, 170);
    painel = await usar('AMPLIAR', 'COELHO_GRANDE', {
      destino: 'COELHO_ENORME',
    });
    assert.equal(painel.estado.sombras.COELHO_ENORME.pv, 270);
    await usar('LIBERAR', 'COELHO_ENORME');
    await assert.rejects(
      usar('INVOCAR', 'COELHO_COLOSSAL'),
      /forma preservada/,
    );
    await db.sessao.update({
      where: { id: sessao.id },
      data: { rodadaAtual: 4 },
    });
    await db.$transaction((tx) =>
      processarTurnoSombrasTx(tx, sessao.id, ps.id, 4),
    );
    painel = await usar('INVOCAR', 'NUE');
    await sessaoService.atualizarNpcSessao(
      campanha.id,
      sessao.id,
      painel.estado.sombras.NUE.npcSessaoId!,
      jogador.id,
      { pontosVidaAtual: 0 },
    );
    assert.equal(
      (await sombras.obter(campanha.id, sessao.id, ps.id, jogador.id)).estado
        .sombras.NUE.destruido,
      true,
    );
    await db.$transaction((tx) => dormirSombrasTx(tx, pc.id));
    painel = await sombras.obter(campanha.id, sessao.id, ps.id, jogador.id);
    assert.equal(painel.estado.sombras.NUE.destruido, true);
    await assert.rejects(usar('INVOCAR', 'NUE'), /indisponível/);
    const seo = await db.npcAmeaca.findFirstOrThrow({
      where: { nome: 'Seo Min-jun' },
    });
    await sessaoService.adicionarNpcSessao(campanha.id, sessao.id, admin.id, {
      npcAmeacaId: seo.id,
    });
    const seoSessao = await db.npcAmeacaSessao.findFirstOrThrow({
      where: { sessaoId: sessao.id, npcAmeacaId: seo.id },
    });
    assert.equal(seoSessao.eaMax, 80);
    assert.equal(seoSessao.peMax, 0);
    await db.npcAmeacaSessao.update({
      where: { id: seoSessao.id },
      data: { controladorUsuarioId: jogador.id },
    });
    const pedidoSeo = {
      clientRequestId: randomUUID(),
      acaoIndice: 7,
      personagensNaZona: [ps.id],
    };
    await npcs.usar(
      campanha.id,
      sessao.id,
      seoSessao.id,
      jogador.id,
      pedidoSeo,
    );
    await npcs.usar(
      campanha.id,
      sessao.id,
      seoSessao.id,
      jogador.id,
      pedidoSeo,
    );
    assert.equal(
      (
        await db.npcAmeacaSessao.findUniqueOrThrow({
          where: { id: seoSessao.id },
        })
      ).eaAtual,
      78,
    );
    assert.equal(
      (
        await db.defesaAntiDominioSessao.findFirstOrThrow({
          where: { npcSessaoId: seoSessao.id },
        })
      ).integridadeAtual,
      4,
    );
    await db.$transaction((tx) => sustentarAcoesNpcTx(tx, sessao.id, 5));
    await db.$transaction((tx) => sustentarAcoesNpcTx(tx, sessao.id, 5));
    assert.equal(
      (
        await db.npcAmeacaSessao.findUniqueOrThrow({
          where: { id: seoSessao.id },
        })
      ).eaAtual,
      77,
    );
    await sessaoService.atualizarNpcSessao(
      campanha.id,
      sessao.id,
      seoSessao.id,
      jogador.id,
      { forca: 3 },
    );
    assert.equal(
      (await db.npcAmeaca.findUniqueOrThrow({ where: { id: seo.id } })).forca,
      1,
    );
    assert.equal(
      (await db.npcAmeacaCampanha.findFirstOrThrow()).ficha &&
        (
          (await db.npcAmeacaCampanha.findFirstOrThrow()).ficha as {
            forca: number;
          }
        ).forca,
      3,
    );
    await npcs.usar(campanha.id, sessao.id, seoSessao.id, jogador.id, {
      clientRequestId: randomUUID(),
      acaoIndice: 2,
      operacao: 'EDITAR',
      custoEA: 4,
    });
    assert.equal(
      (
        (await db.npcAmeaca.findUniqueOrThrow({ where: { id: seo.id } }))
          .acoes as unknown as Array<{ custoEA?: number }>
      )[2].custoEA,
      undefined,
    );
    assert.equal(
      (
        (await db.npcAmeacaCampanha.findFirstOrThrow()).ficha as {
          acoes: Array<{ custoEA: number }>;
        }
      ).acoes[2].custoEA,
      4,
    );
    await sessaoService.atualizarNpcSessao(
      campanha.id,
      sessao.id,
      seoSessao.id,
      jogador.id,
      { vigor: 3 },
    );
    assert.equal(
      (
        (await db.npcAmeacaCampanha.findFirstOrThrow()).ficha as {
          acoes: Array<{ custoEA: number }>;
        }
      ).acoes[2].custoEA,
      4,
    );
    await db.sessao.update({
      where: { id: sessao.id },
      data: { rodadaAtual: 5 },
    });
    await db.$transaction((tx) =>
      processarTurnoSombrasTx(tx, sessao.id, ps.id, 5),
    );
    const habilidadeJardim = await db.habilidadeTecnica.findUniqueOrThrow({
      where: { codigo: 'INATA_DEZ_SOMBRAS_JARDIM' },
    });
    await assert.rejects(
      sessaoService.usarHabilidadeSessao(
        campanha.id,
        sessao.id,
        ps.id,
        jogador.id,
        {
          clientRequestId: randomUUID(),
          habilidadeTecnicaId: habilidadeJardim.id,
        },
      ),
      /Defina/,
    );
    await usar('DEFINIR_ASPECTO', 'SERPENTE_OROCHI', { habilidade: 'MORDIDA' });
    const antesJardim = await db.personagemCampanha.findUniqueOrThrow({
      where: { id: pc.id },
    });
    await sessaoService.usarHabilidadeSessao(
      campanha.id,
      sessao.id,
      ps.id,
      jogador.id,
      {
        clientRequestId: randomUUID(),
        habilidadeTecnicaId: habilidadeJardim.id,
        alvosNpcSessaoIds: [alvoTeste.id],
      },
    );
    const depoisJardim = await db.personagemCampanha.findUniqueOrThrow({
      where: { id: pc.id },
    });
    assert.equal(antesJardim.eaAtual - depoisJardim.eaAtual, 14);
    assert.equal(antesJardim.peAtual - depoisJardim.peAtual, 4);
    const dominio = await db.dominioSessao.findFirstOrThrow({
      where: { sessaoId: sessao.id, habilidadeTecnicaId: habilidadeJardim.id },
    });
    assert.equal(dominio.integridadeMax, 4);
    await sessaoService.executarAcaoDominioSessao(
      campanha.id,
      sessao.id,
      dominio.id,
      admin.id,
      { acao: 'FORMAR', clientRequestId: randomUUID() },
    );
    await usar('ACERTO', 'SERPENTE_OROCHI', {
      habilidade: 'MORDIDA',
      alvoNpcSessaoId: alvoTeste.id,
    });
    await assert.rejects(
      usar('ACERTO', 'SERPENTE_OROCHI', {
        habilidade: 'MORDIDA',
        alvoNpcSessaoId: alvoTeste.id,
      }),
      /indisponível/,
    );
    await db.sessao.update({
      where: { id: sessao.id },
      data: { rodadaAtual: 6 },
    });
    await db.$transaction((tx) =>
      processarTurnoSombrasTx(tx, sessao.id, ps.id, 6),
    );
    const flor = await db.habilidadeTecnica.findUniqueOrThrow({
      where: { codigo: 'NAOINATA_EMOCAO_FLOR_CAIDA_ATIVAR' },
    });
    await sessaoService.usarHabilidadeSessao(
      campanha.id,
      sessao.id,
      ps.id,
      jogador.id,
      { clientRequestId: randomUUID(), habilidadeTecnicaId: flor.id },
    );
    const antesDefesaFlor = await db.personagemCampanha.findUniqueOrThrow({
      where: { id: pc.id },
    });
    await usar('FLOR_DEFESA', 'SAPO', { gastoEA: 3 });
    assert.equal(
      antesDefesaFlor.eaAtual -
        (
          await db.personagemCampanha.findUniqueOrThrow({
            where: { id: pc.id },
          })
        ).eaAtual,
      3,
    );
    assert.equal(
      (await sombras.obter(campanha.id, sessao.id, ps.id, jogador.id)).flor
        .ativa,
      true,
    );
    await usar('MOVIMENTO_USUARIO', 'SAPO');
    assert.equal(
      (await sombras.obter(campanha.id, sessao.id, ps.id, jogador.id)).flor
        .ativa,
      false,
    );
    await assert.rejects(usar('FLOR_DEFESA', 'SAPO', { gastoEA: 1 }), /Ative/);
    const daigo = await db.npcAmeaca.findFirstOrThrow({
      where: { nome: 'Daigo Shiranui' },
    });
    await sessaoService.adicionarNpcSessao(campanha.id, sessao.id, admin.id, {
      npcAmeacaId: daigo.id,
    });
    const daigoSessao = await db.npcAmeacaSessao.findFirstOrThrow({
      where: { sessaoId: sessao.id, npcAmeacaId: daigo.id },
    });
    await npcs.usar(campanha.id, sessao.id, daigoSessao.id, admin.id, {
      clientRequestId: randomUUID(),
      acaoIndice: 3,
    });
    assert.equal(
      (
        await db.npcAmeacaSessao.findUniqueOrThrow({
          where: { id: daigoSessao.id },
        })
      ).defesa,
      19,
    );
    await db.$transaction((tx) =>
      iniciarTurnoNpcTx(tx, sessao.id, daigoSessao.id),
    );
    assert.equal(
      (
        await db.npcAmeacaSessao.findUniqueOrThrow({
          where: { id: daigoSessao.id },
        })
      ).defesa,
      24,
    );
    await acesso.obterPersonagemCampanhaComPermissao(
      campanha.id,
      pc.id,
      jogador.id,
      true,
    );
    await db.personagemSessao.update({
      where: { id: ps.id },
      data: { controladorUsuarioId: outro.id },
    });
    await assert.rejects(
      acesso.obterPersonagemCampanhaComPermissao(
        campanha.id,
        pc.id,
        jogador.id,
        true,
      ),
    );
    await assert.rejects(
      sombras.obter(campanha.id, sessao.id, ps.id, jogador.id),
      /controla/,
    );
    await db.usuario.update({
      where: { id: jogador.id },
      data: {
        senhaHash: await hash('TesteLocalHaeinsa2026!', 10),
        emailVerificadoEm: new Date(),
      },
    });
    await db.usuario.update({
      where: { id: admin.id },
      data: {
        senhaHash: await hash('TesteLocalHaeinsa2026!', 10),
        emailVerificadoEm: new Date(),
      },
    });
    await db.personagemSessao.update({
      where: { id: ps.id },
      data: { controladorUsuarioId: jogador.id },
    });
    await db.npcAmeacaSessao.update({
      where: { id: daigoSessao.id },
      data: { ocultoJogadores: true, controladorUsuarioId: jogador.id },
    });
    const detalheControlador = await sessaoService.buscarDetalheSessao(
      campanha.id,
      sessao.id,
      jogador.id,
    );
    const detalheOutro = await sessaoService.buscarDetalheSessao(
      campanha.id,
      sessao.id,
      outro.id,
    );
    const detalheMestre = await sessaoService.buscarDetalheSessao(
      campanha.id,
      sessao.id,
      admin.id,
    );
    assert.equal(
      detalheControlador.npcs.find((n) => n.npcSessaoId === daigoSessao.id)
        ?.visibilidade,
      'completa',
    );
    assert.equal(
      detalheOutro.npcs.some((n) => n.npcSessaoId === daigoSessao.id),
      false,
    );
    assert.equal(
      detalheMestre.npcs.some((n) => n.npcSessaoId === daigoSessao.id),
      true,
    );
    await db.npcAmeacaSessao.update({
      where: { id: daigoSessao.id },
      data: { controladorUsuarioId: outro.id },
    });
    const detalheRevogado = await sessaoService.buscarDetalheSessao(
      campanha.id,
      sessao.id,
      jogador.id,
    );
    const detalheNovoControlador = await sessaoService.buscarDetalheSessao(
      campanha.id,
      sessao.id,
      outro.id,
    );
    assert.equal(
      detalheRevogado.npcs.some((n) => n.npcSessaoId === daigoSessao.id),
      false,
    );
    assert.equal(
      detalheNovoControlador.npcs.find((n) => n.npcSessaoId === daigoSessao.id)
        ?.visibilidade,
      'completa',
    );
    const cenaAtiva = await db.cena.create({ data: { sessaoId: sessao.id } });
    await db.personagemSessao.update({
      where: { id: ps.id },
      data: { cenaId: cenaAtiva.id },
    });
    await db.npcAmeacaSessao.update({
      where: { id: daigoSessao.id },
      data: { cenaId: cenaAtiva.id },
    });
    const ausentes: Array<{
      id: number;
      personagemCampanhaId: number;
      cenaId: number | null;
    }> = [];
    for (const cenaAusente of [null, cena.id]) {
      const baseAusente = await db.personagemBase.create({
        data: {
          donoId: admin.id,
          nome: `Ausente ${cenaAusente}`,
          nivel: 1,
          claId: cla.id,
          origemId: origem.id,
          classeId: classe.id,
          agilidade: 1,
          forca: 1,
          intelecto: 1,
          presenca: 1,
          vigor: 1,
        },
      });
      const pcAusente = await db.personagemCampanha.create({
        data: {
          campanhaId: campanha.id,
          personagemBaseId: baseAusente.id,
          donoId: admin.id,
          nome: baseAusente.nome,
          nivel: 1,
          claId: cla.id,
          origemId: origem.id,
          classeId: classe.id,
          pvMax: 10,
          pvAtual: 10,
          peMax: 10,
          peAtual: 10,
          eaMax: 10,
          eaAtual: 10,
          sanMax: 10,
          sanAtual: 10,
          limitePeEaPorTurno: 1,
        },
      });
      ausentes.push(
        await db.personagemSessao.create({
          data: {
            sessaoId: sessao.id,
            personagemCampanhaId: pcAusente.id,
            cenaId: cenaAusente,
          },
        }),
      );
    }
    const npcRemovido = await db.npcAmeacaSessao.create({
      data: {
        sessaoId: sessao.id,
        cenaId: null,
        nomeExibicao: 'NPC removido',
        fichaTipo: 'NPC',
        tipo: 'OUTRO',
        defesa: 10,
        pontosVidaMax: 10,
        pontosVidaAtual: 10,
      },
    });
    await sessaoService.atualizarCenaSessao(campanha.id, sessao.id, admin.id, {
      tipo: 'LIVRE',
      nome: 'Continuidade',
    });
    const cenaNova = await db.cena.findFirstOrThrow({
      where: { sessaoId: sessao.id },
      orderBy: { id: 'desc' },
    });
    assert.equal(
      (await db.personagemSessao.findUniqueOrThrow({ where: { id: ps.id } }))
        .cenaId,
      cenaNova.id,
    );
    assert.equal(
      (
        await db.npcAmeacaSessao.findUniqueOrThrow({
          where: { id: daigoSessao.id },
        })
      ).cenaId,
      cenaNova.id,
    );
    for (const ausente of ausentes)
      assert.equal(
        (
          await db.personagemSessao.findUniqueOrThrow({
            where: { id: ausente.id },
          })
        ).cenaId,
        ausente.cenaId,
      );
    assert.equal(
      (
        await db.npcAmeacaSessao.findUniqueOrThrow({
          where: { id: npcRemovido.id },
        })
      ).cenaId,
      null,
    );
    assert.equal(
      (
        await db.npcAmeacaSessao.findUniqueOrThrow({
          where: { id: alvoTeste.id },
        })
      ).cenaId,
      cena.id,
    );
    await sessaoService.adicionarPersonagemSessao(
      campanha.id,
      sessao.id,
      admin.id,
      { personagemCampanhaId: ausentes[0].personagemCampanhaId },
    );
    await sessaoService.atualizarCenaSessao(campanha.id, sessao.id, admin.id, {
      tipo: 'LIVRE',
    });
    const cenaSeguinte = await db.cena.findFirstOrThrow({
      where: { sessaoId: sessao.id },
      orderBy: { id: 'desc' },
    });
    assert.equal(
      (
        await db.personagemSessao.findUniqueOrThrow({
          where: { id: ausentes[0].id },
        })
      ).cenaId,
      cenaSeguinte.id,
    );
    assert.equal(
      (
        await db.personagemSessao.findUniqueOrThrow({
          where: { id: ausentes[1].id },
        })
      ).cenaId,
      cena.id,
    );
    await db.cena.create({ data: { sessaoId: sessao.id } });
    await sessaoService.atualizarCenaSessao(campanha.id, sessao.id, admin.id, {
      tipo: 'LIVRE',
    });
    const cenaVazia = await db.cena.findFirstOrThrow({
      where: { sessaoId: sessao.id },
      orderBy: { id: 'desc' },
    });
    assert.equal(
      await db.personagemSessao.count({
        where: { sessaoId: sessao.id, cenaId: cenaVazia.id },
      }),
      0,
    );
    assert.equal(
      await db.npcAmeacaSessao.count({
        where: { sessaoId: sessao.id, cenaId: cenaVazia.id },
      }),
      0,
    );
    console.log(
      JSON.stringify(
        {
          resultado: 'PASSOU',
          bancoLocalIsolado: nomeBanco,
          cenarios: [
            'troca de cena preserva apenas presentes, permite inclusao manual e mantem cena vazia sem reinserir ausentes',
            'NPC oculto visivel ao controlador e mestre, oculto dos demais; troca de controlador revoga a excecao',
            'importação idempotente das5 fichas',
            '27 perícias',
            'kit0 só na instância',
            'delegação e revogação',
            'invocação idempotente',
            'liberar/reinvocar conservaPV',
            'carga e rollback',
            'Coelho reduz/amplia e conserva estado',
            'Dormir não ressuscita destruído',
            'EA do NPC persiste no catálogo',
            'Domínio Simples4 e sustentação sem cobrança duplicada',
            'edição de atributos preserva original',
            'condição só expira no fim do próximo turno do alvo',
            'dano misto de Nue e ataque pelo maior d20',
            'habilidades editadas só na campanha',
            'Dadao: preview e servidor 3d20+20, 2d10+4, 17/x2',
            'Jardim exige Aspecto prévio e cobra 14EA/4PE',
            'Jardim integridade4 e Acerto único por rodada',
            'veneno: dano no início, resistência no fim e encerramento confirmado',
            'Flor Caída: custo por ocorrência e término por movimento voluntário',
            'Daigo: penalidade de Defesa expira no início do próximo turno',
            'edição de PV aplica limiares e destruição imediatamente, com snapshot para desfazer',
          ],
        },
        null,
        2,
      ),
    );
  } finally {
    await db.$disconnect();
  }
}
main().catch((e: unknown) => {
  console.error(e instanceof Error ? e.message : e);
  process.exitCode = 1;
});
