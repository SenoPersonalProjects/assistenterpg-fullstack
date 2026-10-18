import 'dotenv/config';
import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { join } from 'node:path';
import { Prisma, PrismaClient } from '@prisma/client';
import { seedCatalogoHaeinsa } from '../prisma/seeds/haeinsa/catalogo';
import { revisarTextoDezSombras } from '../prisma/seeds/haeinsa/texto-revisado';
import {
  CONFIG_TAKARAMONO,
  NPCS_HAEINSA,
} from '../prisma/seeds/haeinsa/revisao';
const MARCADOR = '<!-- importacao:haeinsa:2026-10-18 -->';
const json = (value: unknown) =>
  JSON.parse(JSON.stringify(value)) as Prisma.InputJsonValue;
const normalizar = (value: string) =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\*/g, '')
    .trim()
    .toUpperCase();
async function main() {
  const aplicar = process.argv.includes('--apply');
  const db = new PrismaClient();
  try {
    const pasta = join(__dirname, '../prisma/seeds/haeinsa/fontes');
    const manifesto = JSON.parse(
      await readFile(join(pasta, 'manifesto.json'), 'utf8'),
    ) as Array<{ arquivo: string; sha256: string }>;
    const fontes = new Map<string, string>();
    for (const item of manifesto) {
      const bytes = await readFile(join(pasta, item.arquivo));
      if (createHash('sha256').update(bytes).digest('hex') !== item.sha256)
        throw new Error(`Fonte alterada: ${item.arquivo}`);
      fontes.set(item.arquivo, bytes.toString('utf8'));
    }
    revisarTextoDezSombras(fontes.get('Dez Sombras.md')!);
    const administradores = await db.usuario.findMany({
      where: { role: 'ADMIN' },
      select: { id: true, apelido: true },
    });
    if (administradores.length !== 1)
      throw new Error(
        `Esperado um administrador; encontrados ${administradores.length}.`,
      );
    const admin = administradores[0];
    const [condicoesObrigatorias, outrasFichasDezSombras] = await Promise.all([
      db.condicao.count({
        where: { nome: { in: ['Atordoado', 'Vulnerável', 'Envenenado'] } },
      }),
      db.personagemBase.count({
        where: {
          tecnicaInata: { codigo: 'DEZ_SOMBRAS' },
          NOT: { nome: 'Takaramono Zenin', donoId: admin.id },
        },
      }),
    ]);
    if (condicoesObrigatorias !== 3)
      throw new Error(
        'Condições necessárias às Dez Sombras ausentes no catálogo.',
      );
    const [
      cla,
      origem,
      classe,
      trilha,
      pericias,
      graus,
      modificacoes,
      itens,
      existentes,
      npcsExistentes,
      passivas,
      proficiencia,
    ] = await Promise.all([
      db.cla.findUnique({ where: { nome: 'Zenin' }, select: { id: true } }),
      db.origem.findUnique({
        where: { nome: 'Prodígio do Clã' },
        select: { id: true },
      }),
      db.classe.findUnique({
        where: { nome: 'Sentinela' },
        select: { id: true },
      }),
      db.trilha.findUnique({
        where: { nome: 'Especialista em Shikigami' },
        select: { id: true },
      }),
      db.pericia.findMany({ select: { id: true, codigo: true, nome: true } }),
      db.tipoGrau.findMany({
        where: {
          codigo: {
            in: [
              'TECNICA_AMALDICOADA',
              'TECNICA_SHIKIGAMI',
              'TECNICA_BARREIRA',
            ],
          },
        },
        select: { id: true, codigo: true },
      }),
      db.modificacaoEquipamento.findMany({
        where: { codigo: { in: ['MOD_CRUEL', 'MOD_PERIGOSA'] } },
        select: { id: true, codigo: true },
      }),
      db.equipamentoCatalogo.findMany({
        where: {
          codigo: {
            in: [
              'UNIFORME_ESCOLA_TECNICA_DEFESA',
              'ALGEMAS',
              'CORDA',
              'LANTERNA_TATICA',
              'KIT_MEDICINA',
            ],
          },
        },
        select: { id: true, codigo: true, espacos: true, categoria: true },
      }),
      db.personagemBase.findMany({
        where: { donoId: admin.id, nome: 'Takaramono Zenin' },
        select: { id: true, nome: true, background: true },
      }),
      db.npcAmeaca.findMany({
        where: {
          donoId: admin.id,
          nome: { in: NPCS_HAEINSA.map((n) => n.nome) },
        },
        select: { id: true, nome: true, descricao: true },
      }),
      db.passivaAtributo.findMany({
        where: { codigo: { in: ['INT_I', 'VIG_I'] } },
        select: { id: true, codigo: true },
      }),
      db.proficiencia.findUnique({
        where: { codigo: 'FERRAMENTAS_AMALDICOADAS' },
        select: { id: true },
      }),
    ]);
    if (
      !cla ||
      !origem ||
      !classe ||
      !trilha ||
      graus.length !== 3 ||
      modificacoes.length !== 2 ||
      itens.length !== 5 ||
      passivas.length !== 2 ||
      !proficiencia
    )
      throw new Error(
        'Catálogo necessário incompleto; nenhuma ficha será criada.',
      );
    if (
      existentes.some((p) => !p.background?.includes(MARCADOR)) ||
      npcsExistentes.some((p) => !p.descricao?.includes(MARCADOR))
    )
      throw new Error(
        'Há fichas homônimas não pertencentes a esta importação. Revisão necessária antes de sobrescrever.',
      );
    const texto = fontes.get('Ficha - Takaramono Zenin.md')!;
    const treinamentos = [
      ...texto.matchAll(
        /^\|\s*([^|]+)\|\s*(AGI|FOR|INT|PRE|VIG)\s*\|\s*([^|]+)\|\s*([^|]+)\|/gm,
      ),
    ].map((m) => {
      const pericia = pericias.find(
        (p) => normalizar(p.nome) === normalizar(m[1]),
      );
      const bonus = Number(m[4].replace(/[^\d-]/g, ''));
      if (!pericia || ![0, 5, 10, 15, 20].includes(bonus))
        throw new Error(`Perícia inválida: ${m[1]}`);
      return {
        periciaId: pericia.id,
        codigo: pericia.codigo,
        grauTreinamento: bonus / 5,
        bonusExtra: 0,
      };
    });
    if (
      !treinamentos.length ||
      new Set(treinamentos.map((p) => p.periciaId)).size !== treinamentos.length
    )
      throw new Error('Tabela de perícias vazia ou duplicada.');
    console.log(
      JSON.stringify(
        {
          aplicar,
          administrador: admin,
          fichas: ['Takaramono Zenin', ...NPCS_HAEINSA.map((n) => n.nome)],
          existentes: [...existentes, ...npcsExistentes].map((p) => ({
            id: p.id,
            nome: p.nome,
          })),
          fontesConferidas: manifesto.length,
          outrasFichasDezSombras,
          pericias: treinamentos.length,
          campanhaSessao:
            'Não vinculadas; distribuição pela interface da sessão.',
        },
        null,
        2,
      ),
    );
    if (!aplicar) return;
    await db.$transaction(
      async (tx) => {
        const catalogo = await seedCatalogoHaeinsa(
          tx,
          fontes.get('Dez Sombras.md')!,
        );
        const dadosFicha = {
          donoId: admin.id,
          nome: 'Takaramono Zenin',
          nivel: 18,
          idade: 26,
          claId: cla.id,
          origemId: origem.id,
          classeId: classe.id,
          trilhaId: trilha.id,
          agilidade: 1,
          forca: 2,
          intelecto: 5,
          presenca: 3,
          vigor: 3,
          pvMaximo: 104,
          peMaximo: 108,
          eaMaximo: 162,
          sanMaximo: 80,
          limitePeEaPorTurno: 18,
          defesaBase: 11,
          defesaEquipamento: 4,
          defesaOutros: 0,
          esquiva: 35,
          bloqueio: 20,
          deslocamento: 9,
          turnosMorrendo: 4,
          turnosEnlouquecendo: 3,
          espacosInventarioBase: 10,
          espacosOcupados: 10,
          reacoesBasePorTurno: 1,
          tecnicaInataId: catalogo.tecnica.id,
          configuracaoDezSombras: json(CONFIG_TAKARAMONO),
          background: `${MARCADOR}\n${texto}`,
          passivasAtributosAtivos: ['INT', 'VIG'],
          proficienciasExtrasCodigos: ['FERRAMENTAS_AMALDICOADAS'],
          passivasAtributosConfig: {
            INT_I: {
              proficienciasCodigos: ['FERRAMENTAS_AMALDICOADAS'],
              periciaCodigoTreino: 'INTIMIDACAO',
            },
          },
          fontesConteudo: {
            origem: 'HAEINSA_REVISADA',
            grauMecanico: 'GRAU_1',
            valoresFinaisRevisados: true,
          },
          habilidadesConfig: {
            grauEfetivoShikigami: 4,
            origemGraus: CONFIG_TAKARAMONO.origemGraus!,
            melhorAmigo: 'OROCHI',
            favorito: 'NUE',
          },
        };
        const base = existentes[0]
          ? await tx.personagemBase.update({
              where: { id: existentes[0].id },
              data: dadosFicha,
            })
          : await tx.personagemBase.create({ data: dadosFicha });
        for (const passiva of passivas)
          await tx.personagemBasePassiva.upsert({
            where: {
              personagemBaseId_passivaId: {
                personagemBaseId: base.id,
                passivaId: passiva.id,
              },
            },
            create: { personagemBaseId: base.id, passivaId: passiva.id },
            update: {},
          });
        await tx.personagemBaseProficiencia.upsert({
          where: {
            personagemBaseId_proficienciaId: {
              personagemBaseId: base.id,
              proficienciaId: proficiencia.id,
            },
          },
          create: {
            personagemBaseId: base.id,
            proficienciaId: proficiencia.id,
          },
          update: {},
        });
        for (const p of treinamentos)
          await tx.personagemBasePericia.upsert({
            where: {
              personagemBaseId_periciaId: {
                personagemBaseId: base.id,
                periciaId: p.periciaId,
              },
            },
            create: {
              personagemBaseId: base.id,
              periciaId: p.periciaId,
              grauTreinamento: p.grauTreinamento,
              bonusExtra: 0,
            },
            update: { grauTreinamento: p.grauTreinamento, bonusExtra: 0 },
          });
        for (const g of graus) {
          const valor = g.codigo === 'TECNICA_SHIKIGAMI' ? 4 : 2;
          await tx.grauPersonagemBase.upsert({
            where: {
              personagemBaseId_tipoGrauId: {
                personagemBaseId: base.id,
                tipoGrauId: g.id,
              },
            },
            create: { personagemBaseId: base.id, tipoGrauId: g.id, valor },
            update: { valor },
          });
        }
        for (const codigo of [
          'NAOINATA_TECNICA_AMALDICOADA',
          'NAOINATA_TECNICA_BARREIRA',
          'NAOINATA_TECNICA_SHIKIGAMI',
          'NAOINATA_EMOCAO_FLOR_CAIDA',
        ]) {
          const tecnica = await tx.tecnicaAmaldicoada.findUnique({
            where: { codigo },
          });
          if (!tecnica) throw new Error(`Técnica não encontrada: ${codigo}`);
          await tx.personagemBaseTecnica.upsert({
            where: {
              personagemBaseId_tecnicaId: {
                personagemBaseId: base.id,
                tecnicaId: tecnica.id,
              },
            },
            create: { personagemBaseId: base.id, tecnicaId: tecnica.id },
            update: {},
          });
        }
        for (const nome of [
          'Aprimorado',
          'Chamariz',
          'O Melhor Amigo do Homem',
          'Sinergia',
          'Saque Rápido',
          'Shikigami Favorito',
          'Combo de Shikigami',
        ]) {
          const descricao = texto
            .split(
              new RegExp(
                `^## ${nome.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}[^\\n]*\\n`,
                'm',
              ),
            )[1]
            ?.split(/^## /m)[0]
            ?.trim();
          if (!descricao) throw new Error(`Descrição ausente para ${nome}`);
          const habilidade = await tx.habilidade.upsert({
            where: { nome },
            create: {
              nome,
              descricao,
              tipo: [
                'Saque Rápido',
                'Shikigami Favorito',
                'Combo de Shikigami',
              ].includes(nome)
                ? 'PODER_GENERICO'
                : 'CLASSE',
              fonte: 'SISTEMA_BASE',
            },
            update: {},
          });
          await tx.habilidadePersonagemBase.upsert({
            where: {
              personagemBaseId_habilidadeId: {
                personagemBaseId: base.id,
                habilidadeId: habilidade.id,
              },
            },
            create: { personagemBaseId: base.id, habilidadeId: habilidade.id },
            update: {},
          });
        }
        const loadout = [
          { item: catalogo.arma, quantidade: 1, equipado: true },
          ...itens.map((item) => ({
            item,
            quantidade:
              item.codigo === 'ALGEMAS' ? 5 : item.codigo === 'CORDA' ? 2 : 1,
            equipado: item.codigo === 'UNIFORME_ESCOLA_TECNICA_DEFESA',
          })),
        ];
        for (const entrada of loadout) {
          const estado =
            entrada.item.codigo === 'KIT_MEDICINA'
              ? {
                  espacosOverride: 0,
                  motivoOverride:
                    'Decisão expressa do mestre para a ficha Haeinsa de Takaramono.',
                }
              : undefined;
          let item = await tx.inventarioItemBase.findFirst({
            where: {
              personagemBaseId: base.id,
              equipamentoId: entrada.item.id,
            },
          });
          const data = {
            quantidade: entrada.quantidade,
            equipado: entrada.equipado,
            categoriaCalculada: entrada.item.categoria,
            espacosCalculados: estado ? 0 : entrada.item.espacos,
            ...(estado ? { estado } : {}),
          };
          item = item
            ? await tx.inventarioItemBase.update({
                where: { id: item.id },
                data,
              })
            : await tx.inventarioItemBase.create({
                data: {
                  personagemBaseId: base.id,
                  equipamentoId: entrada.item.id,
                  ...data,
                },
              });
          if (entrada.item.codigo === 'DADAO_NEGRO')
            for (const mod of modificacoes)
              await tx.inventarioItemBaseModificacao.upsert({
                where: {
                  itemId_modificacaoId: {
                    itemId: item.id,
                    modificacaoId: mod.id,
                  },
                },
                create: { itemId: item.id, modificacaoId: mod.id },
                update: {},
              });
        }
        for (const n of NPCS_HAEINSA) {
          const fonte = fontes.get(`Ficha - ${n.nome}.md`)!;
          const [agilidade, forca, intelecto, presenca, vigor] = n.atributos;
          const periciasNpc = Object.fromEntries(
            Object.entries(n.pericias).flatMap(([campo, [dados, bonus]]) => [
              [campo, bonus],
              [`${campo}Dados`, dados],
            ]),
          );
          const acoes = n.acoes.map((a) => ({
            ...a,
            descricao:
              'efeito' in a
                ? a.efeito
                : (fonte.split(`## ${a.nome}\n`)[1]?.split(/^#/m)[0]?.trim() ??
                  a.nome),
            tipo: a.execucao,
            custo: `${'custoEA' in a ? a.custoEA : 0} EA`,
          }));
          const data = {
            donoId: admin.id,
            nome: n.nome,
            descricao: `${MARCADOR}\nFicha NPC simplificada, revisada pelo mestre.\n${fonte}`,
            fichaTipo: 'NPC' as const,
            tipo: 'FEITICEIRO' as const,
            tamanho: 'MEDIO' as const,
            agilidade,
            forca,
            intelecto,
            presenca,
            vigor,
            ...periciasNpc,
            defesa: n.defesa,
            pontosVida: n.pv,
            eaMax: n.ea,
            peMax: n.pe,
            deslocamentoMetros: 9,
            resistencias: { rd: n.rd },
            periciasEspeciais: {
              periciasInformadas: Object.keys(n.pericias).map((p) =>
                p.toUpperCase(),
              ),
              peSimplificado: n.pe === 0,
            },
            passivas: [
              { nome: 'Referência integral de operação', descricao: fonte },
            ],
            acoes: json(acoes),
            usoTatico:
              'Reação Especial1/rodada separada das reações comuns. Distribuir controlador na sessão.',
          };
          const existente = npcsExistentes.find((p) => p.nome === n.nome);
          if (existente)
            await tx.npcAmeaca.update({ where: { id: existente.id }, data });
          else await tx.npcAmeaca.create({ data });
        }
        console.log(
          JSON.stringify({
            personagemBaseId: base.id,
            npcNomes: NPCS_HAEINSA.map((n) => n.nome),
            tecnicoCatalogoId: catalogo.tecnica.id,
            dadaoId: catalogo.arma.id,
          }),
        );
      },
      { maxWait: 30_000, timeout: 120_000 },
    );
    console.log(
      'Cadastro Haeinsa concluído na conta do administrador, sem vincular campanha/sessão.',
    );
  } finally {
    await db.$disconnect();
  }
}
main().catch((e: unknown) => {
  console.error(e instanceof Error ? e.message : 'Falha na importação.');
  process.exitCode = 1;
});
