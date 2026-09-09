import { readFile } from 'node:fs/promises';
import { Prisma, PrismaClient, TipoFonte } from '@prisma/client';

type Acao = Record<string, unknown>;

type PersonagemManifesto = {
  chave: string;
  nome: string;
  controladorApelido: string;
  classe: string;
  trilha?: string;
  cla: string;
  origem: string;
  nivel: number;
  atributos: { agilidade: number; forca: number; intelecto: number; presenca: number; vigor: number };
  recursos: { pv: number; pe: number; ea: number; san: number; limitePeEaPorTurno: number; defesa: number; deslocamento: number };
  tecnica: { codigo: string; nome: string; descricao: string; habilidades: Array<{ codigo: string; nome: string; descricao: string; execucao: 'ACAO_LIVRE' | 'ACAO_MOVIMENTO' | 'ACAO_PADRAO' | 'ACAO_COMPLETA' | 'REACAO' | 'SUSTENTADA'; custoPE?: number; custoEA?: number; duracao?: string; efeito: string; acoes?: Acao[] }> };
  itens?: Array<{ codigo: string; nome: string; descricao: string; dano: string; efeito: string }>;
  vinculados?: Array<{ chave: string; nome: string; descricao: string; pv: number; ea: number; defesa: number; rd: number; acoes: Acao[] }>;
};

type NpcManifesto = {
  chave: string;
  nome: string;
  descricao: string;
  atributos: { agilidade: number; forca: number; intelecto: number; presenca: number; vigor: number };
  recursos: { pv: number; pe: number; ea: number; defesa: number; rd: number; deslocamento: number };
  pericias: { percepcao: number; iniciativa: number; fortitude: number; reflexos: number; vontade: number; luta: number; jujutsu: number };
  passivas: Acao[];
  acoes: Acao[];
};

type Manifesto = {
  campanhaId: number;
  sessaoId: number;
  administradorApelido: string;
  personagens: PersonagemManifesto[];
  npcs: NpcManifesto[];
};

const MARCADOR_IMPORTACAO = 'importacao:pro-codex:2024';

function argumento(nome: string): string | undefined {
  const indice = process.argv.indexOf(nome);
  return indice >= 0 ? process.argv[indice + 1] : undefined;
}

function marcador(chave: string): string {
  return `<!-- ${MARCADOR_IMPORTACAO}:${chave} -->`;
}

async function resolverCatalogo(
  prisma: PrismaClient,
  personagem: PersonagemManifesto,
) {
  const [cla, origem, classe] = await Promise.all([
    prisma.cla.findUnique({ where: { nome: personagem.cla }, select: { id: true } }),
    prisma.origem.findUnique({ where: { nome: personagem.origem }, select: { id: true } }),
    prisma.classe.findUnique({ where: { nome: personagem.classe }, select: { id: true } }),
  ]);
  if (!cla || !origem || !classe) {
    throw new Error(`Catalogo ausente para ${personagem.nome}: cla, origem ou classe.`);
  }
  const trilha = personagem.trilha
    ? await prisma.trilha.findFirst({
        where: { nome: personagem.trilha, classeId: classe.id },
        select: { id: true },
      })
    : null;
  if (personagem.trilha && !trilha) {
    throw new Error(`Trilha '${personagem.trilha}' ausente para ${personagem.nome}.`);
  }
  return { claId: cla.id, origemId: origem.id, classeId: classe.id, trilhaId: trilha?.id ?? null };
}

async function main() {
  const caminhoManifesto = argumento('--manifest');
  const aplicar = process.argv.includes('--apply');
  if (!caminhoManifesto) throw new Error('Use --manifest <arquivo.json>.');
  const manifesto = JSON.parse(await readFile(caminhoManifesto, 'utf8')) as Manifesto;
  const prisma = new PrismaClient();
  try {
    const [campanha, sessao, administrador] = await Promise.all([
      prisma.campanha.findUnique({ where: { id: manifesto.campanhaId }, select: { id: true, donoId: true, nome: true, membros: { select: { usuarioId: true, papel: true } } } }),
      prisma.sessao.findUnique({ where: { id: manifesto.sessaoId }, select: { id: true, campanhaId: true } }),
      prisma.usuario.findFirst({ where: { apelido: manifesto.administradorApelido }, select: { id: true, apelido: true } }),
    ]);
    if (!campanha || !sessao || sessao.campanhaId !== manifesto.campanhaId || !administrador || campanha.donoId !== administrador.id) {
      throw new Error('Campanha, sessao ou administrador nao conferem com o manifesto.');
    }
    const controladores = await Promise.all(
      manifesto.personagens.map(async (personagem) => {
        const usuario = await prisma.usuario.findFirst({ where: { apelido: personagem.controladorApelido }, select: { id: true, apelido: true } });
        const membro = usuario ? campanha.membros.find((item) => item.usuarioId === usuario.id) : undefined;
        if (!usuario || membro?.papel !== 'JOGADOR') throw new Error(`Controlador invalido para ${personagem.nome}: ${personagem.controladorApelido}.`);
        return [personagem.chave, usuario] as const;
      }),
    );
    const catalogos = await Promise.all(manifesto.personagens.map((item) => resolverCatalogo(prisma, item)));
    const existentes = await Promise.all([
      ...manifesto.personagens.map((item) => prisma.personagemBase.findFirst({ where: { donoId: administrador.id, background: { contains: marcador(item.chave) } }, select: { id: true, nome: true } })),
      ...manifesto.npcs.map((item) => prisma.npcAmeaca.findFirst({ where: { donoId: administrador.id, descricao: { contains: marcador(item.chave) } }, select: { id: true, nome: true } })),
    ]);
    const previa = {
      campanha: campanha.nome,
      sessaoId: sessao.id,
      aplicar,
      personagens: manifesto.personagens.map((item, indice) => ({ nome: item.nome, controlador: controladores[indice][1].apelido, existente: existentes[indice] ?? null })),
      npcs: manifesto.npcs.map((item, indice) => ({ nome: item.nome, existente: existentes[manifesto.personagens.length + indice] ?? null })),
    };
    console.log(JSON.stringify(previa, null, 2));
    if (!aplicar) return;

    await prisma.$transaction(async (tx) => {
      const cena = await tx.cena.findFirst({ where: { sessaoId: manifesto.sessaoId }, orderBy: { id: 'desc' }, select: { id: true } });
      if (!cena) throw new Error('A sessao nao possui cena para receber o elenco.');
      await tx.sessao.update({ where: { id: manifesto.sessaoId }, data: { elencoControladoPeloMestre: true } });
      for (let indice = 0; indice < manifesto.personagens.length; indice += 1) {
        const item = manifesto.personagens[indice];
        const catalogo = catalogos[indice];
        const controlador = controladores[indice][1];
        let base = await tx.personagemBase.findFirst({ where: { donoId: administrador.id, background: { contains: marcador(item.chave) } } });
        if (!base) {
          base = await tx.personagemBase.create({ data: {
            donoId: administrador.id, nome: item.nome, nivel: item.nivel, ...catalogo,
            agilidade: item.atributos.agilidade, forca: item.atributos.forca, intelecto: item.atributos.intelecto, presenca: item.atributos.presenca, vigor: item.atributos.vigor,
            estudouEscolaTecnica: true, atributoChaveEa: item.atributos.intelecto >= item.atributos.presenca ? 'INT' : 'PRE',
            background: `${marcador(item.chave)}\nImportado para a sessao Fração da Hesitação.`,
            pvMaximo: item.recursos.pv, peMaximo: item.recursos.pe, eaMaximo: item.recursos.ea, sanMaximo: item.recursos.san,
            limitePeEaPorTurno: item.recursos.limitePeEaPorTurno, defesaBase: item.recursos.defesa, deslocamento: item.recursos.deslocamento,
            fontesConteudo: { origem: MARCADOR_IMPORTACAO },
          } });
        }
        const tecnica = await tx.tecnicaAmaldicoada.upsert({
          where: { codigo: item.tecnica.codigo },
          create: { codigo: item.tecnica.codigo, nome: item.tecnica.nome, descricao: item.tecnica.descricao, tipo: 'INATA', fonte: TipoFonte.HOMEBREW, usuarioId: administrador.id },
          update: { nome: item.tecnica.nome, descricao: item.tecnica.descricao },
        });
        for (const [ordem, habilidade] of item.tecnica.habilidades.entries()) {
          await tx.habilidadeTecnica.upsert({
            where: { codigo: habilidade.codigo },
            create: {
              tecnicaId: tecnica.id, codigo: habilidade.codigo, nome: habilidade.nome, descricao: habilidade.descricao,
              execucao: habilidade.execucao, custoPE: habilidade.custoPE ?? 0, custoEA: habilidade.custoEA ?? 0,
              duracao: habilidade.duracao ?? 'Instantanea', efeito: habilidade.efeito,
              mecanicasSessao: habilidade.acoes ? ({ acoes: habilidade.acoes } as Prisma.InputJsonValue) : undefined, ordem,
            },
            update: {
              tecnicaId: tecnica.id, nome: habilidade.nome, descricao: habilidade.descricao,
              execucao: habilidade.execucao, custoPE: habilidade.custoPE ?? 0, custoEA: habilidade.custoEA ?? 0,
              duracao: habilidade.duracao ?? 'Instantanea', efeito: habilidade.efeito,
              mecanicasSessao: habilidade.acoes ? ({ acoes: habilidade.acoes } as Prisma.InputJsonValue) : undefined, ordem,
            },
          });
        }
        if (base.tecnicaInataPropriaId !== tecnica.id) {
          base = await tx.personagemBase.update({ where: { id: base.id }, data: { tecnicaInataPropriaId: tecnica.id } });
        }
        let campanhaPersonagem = await tx.personagemCampanha.findUnique({ where: { campanhaId_personagemBaseId: { campanhaId: manifesto.campanhaId, personagemBaseId: base.id } } });
        if (!campanhaPersonagem) {
          campanhaPersonagem = await tx.personagemCampanha.create({ data: {
            campanhaId: manifesto.campanhaId, personagemBaseId: base.id, donoId: administrador.id, nome: item.nome, nivel: item.nivel,
            claId: catalogo.claId, origemId: catalogo.origemId, classeId: catalogo.classeId, trilhaId: catalogo.trilhaId,
            pvMax: item.recursos.pv, pvAtual: item.recursos.pv, peMax: item.recursos.pe, peAtual: item.recursos.pe, eaMax: item.recursos.ea, eaAtual: item.recursos.ea, sanMax: item.recursos.san, sanAtual: item.recursos.san,
            limitePeEaPorTurno: item.recursos.limitePeEaPorTurno, defesaBase: item.recursos.defesa, deslocamento: item.recursos.deslocamento,
            tecnicaInataPropriaId: base.tecnicaInataPropriaId,
          } });
        }
        for (const vinculado of item.vinculados ?? []) {
          const descricao = `${marcador(vinculado.chave)}\n${vinculado.descricao}`;
          const existente = await tx.personagemCampanhaEntidadeVinculada.findFirst({
            where: { personagemCampanhaId: campanhaPersonagem.id, descricao: { contains: marcador(vinculado.chave) } },
          });
          const dadosVinculado = {
            campanhaId: manifesto.campanhaId,
            personagemCampanhaId: campanhaPersonagem.id,
            tipo: 'SHIKIGAMI' as const,
            nome: vinculado.nome,
            descricao,
            fichaTipo: 'NPC' as const,
            tipoNpc: 'OUTRO' as const,
            defesa: vinculado.defesa,
            pontosVidaMax: vinculado.pv,
            pontosVidaAtual: vinculado.pv,
            rd: vinculado.rd,
            cargasMax: vinculado.ea,
            cargasAtual: vinculado.ea,
            acoes: vinculado.acoes as Prisma.InputJsonValue,
            criadoPorId: administrador.id,
          };
          if (existente) await tx.personagemCampanhaEntidadeVinculada.update({ where: { id: existente.id }, data: dadosVinculado });
          else await tx.personagemCampanhaEntidadeVinculada.create({ data: dadosVinculado });
        }
        for (const itemManifesto of item.itens ?? []) {
          let equipamento = await tx.equipamentoCatalogo.findUnique({ where: { codigo: itemManifesto.codigo } });
          if (!equipamento) {
            equipamento = await tx.equipamentoCatalogo.create({ data: {
              codigo: itemManifesto.codigo,
              nome: itemManifesto.nome,
              descricao: itemManifesto.descricao,
              tipo: 'FERRAMENTA_AMALDICOADA',
              categoria: 'ESPECIAL',
              espacos: 1,
              fonte: TipoFonte.HOMEBREW,
              usuarioId: administrador.id,
              tipoUso: 'GERAL',
              tipoAmaldicoado: 'ARMA',
              tipoArma: 'CORPO_A_CORPO',
              empunhaduras: ['LEVE'] as Prisma.InputJsonValue,
              agil: true,
              criticoValor: 19,
              criticoMultiplicador: 2,
              efeito: itemManifesto.efeito,
            } });
            await tx.equipamentoDano.create({ data: { equipamentoId: equipamento.id, tipoDano: 'CORTANTE', rolagem: itemManifesto.dano } });
          } else await tx.equipamentoCatalogo.update({ where: { id: equipamento.id }, data: { nome: itemManifesto.nome, descricao: itemManifesto.descricao, efeito: itemManifesto.efeito } });
          let itemBase = await tx.inventarioItemBase.findFirst({ where: { personagemBaseId: base.id, equipamentoId: equipamento.id } });
          if (!itemBase) itemBase = await tx.inventarioItemBase.create({ data: { personagemBaseId: base.id, equipamentoId: equipamento.id, quantidade: 1, equipado: true, espacosCalculados: equipamento.espacos, categoriaCalculada: equipamento.categoria } });
          await tx.inventarioItemCampanha.upsert({
            where: { personagemCampanhaId_itemBaseOrigemId: { personagemCampanhaId: campanhaPersonagem.id, itemBaseOrigemId: itemBase.id } },
            update: { equipamentoId: equipamento.id, quantidade: 1, equipado: true, categoriaCalculada: equipamento.categoria },
            create: { personagemCampanhaId: campanhaPersonagem.id, itemBaseOrigemId: itemBase.id, equipamentoId: equipamento.id, quantidade: 1, equipado: true, categoriaCalculada: equipamento.categoria },
          });
        }
        const existenteSessao = await tx.personagemSessao.findFirst({ where: { sessaoId: manifesto.sessaoId, personagemCampanhaId: campanhaPersonagem.id } });
        if (existenteSessao) await tx.personagemSessao.update({ where: { id: existenteSessao.id }, data: { cenaId: cena.id, controladorUsuarioId: controlador.id } });
        else await tx.personagemSessao.create({ data: { sessaoId: manifesto.sessaoId, cenaId: cena.id, personagemCampanhaId: campanhaPersonagem.id, controladorUsuarioId: controlador.id } });
      }
      for (const item of manifesto.npcs) {
        let npc = await tx.npcAmeaca.findFirst({ where: { donoId: administrador.id, descricao: { contains: marcador(item.chave) } } });
        if (!npc) npc = await tx.npcAmeaca.create({ data: {
          donoId: administrador.id, nome: item.nome, descricao: `${marcador(item.chave)}\n${item.descricao}`, fichaTipo: 'NPC', tipo: 'FEITICEIRO', tamanho: 'MEDIO',
          ...item.atributos, ...item.pericias, defesa: item.recursos.defesa, pontosVida: item.recursos.pv, peMax: item.recursos.pe, deslocamentoMetros: item.recursos.deslocamento,
          resistencias: { rd: item.recursos.rd }, passivas: item.passivas as Prisma.InputJsonValue, acoes: item.acoes as Prisma.InputJsonValue,
        } });
        else await tx.npcAmeaca.update({ where: { id: npc.id }, data: {
          nome: item.nome,
          descricao: `${marcador(item.chave)}\n${item.descricao}`,
          passivas: item.passivas as Prisma.InputJsonValue,
          acoes: item.acoes as Prisma.InputJsonValue,
        } });
        const npcSessao = await tx.npcAmeacaSessao.findFirst({ where: { sessaoId: manifesto.sessaoId, npcAmeacaId: npc.id } });
        const dados = { cenaId: cena.id, nomeExibicao: npc.nome, fichaTipo: npc.fichaTipo, tipo: npc.tipo, tamanho: npc.tamanho, defesa: item.recursos.defesa, pontosVidaAtual: item.recursos.pv, pontosVidaMax: item.recursos.pv, peAtual: item.recursos.pe, peMax: item.recursos.pe, eaAtual: item.recursos.ea, eaMax: item.recursos.ea, deslocamentoMetros: item.recursos.deslocamento, ...item.atributos, ...item.pericias, passivasGuia: item.passivas as Prisma.InputJsonValue, acoesGuia: item.acoes as Prisma.InputJsonValue };
        if (npcSessao) await tx.npcAmeacaSessao.update({ where: { id: npcSessao.id }, data: { cenaId: cena.id, nomeExibicao: npc.nome, fichaTipo: npc.fichaTipo, tipo: npc.tipo, tamanho: npc.tamanho, passivasGuia: item.passivas as Prisma.InputJsonValue, acoesGuia: item.acoes as Prisma.InputJsonValue } });
        else await tx.npcAmeacaSessao.create({ data: { sessaoId: manifesto.sessaoId, npcAmeacaId: npc.id, ...dados } });
      }
    // O importador reconcilia fichas, catálogo privado e participantes da sessão
    // em uma única transação. No TiDB remoto, a primeira execução pode levar mais
    // de 30 segundos apenas nas operações idempotentes já existentes.
    }, { maxWait: 30_000, timeout: 120_000 });
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((erro) => { console.error(erro instanceof Error ? erro.message : erro); process.exitCode = 1; });
