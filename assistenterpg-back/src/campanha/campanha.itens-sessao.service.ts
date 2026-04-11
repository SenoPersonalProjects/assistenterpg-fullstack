import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  CategoriaEquipamento,
  DestinoTransferenciaItemSessao,
  Prisma,
  StatusTransferenciaItemSessao,
  TipoItemSessaoCampanha,
} from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CampanhaAccessService } from './campanha.access.service';
import {
  AtribuirItemSessaoCampanhaDto,
  AtualizarItemSessaoCampanhaDto,
  AtualizarTemplateItemSessaoCampanhaDto,
  CriarItemSessaoCampanhaDto,
  CriarTemplateItemSessaoCampanhaDto,
  RevelarItemSessaoCampanhaDto,
  SolicitarTransferenciaItemSessaoCampanhaDto,
} from './dto/itens-sessao-campanha.dto';

type DadosItemSessaoNormalizados = {
  nome: string;
  descricao: string | null;
  tipo: TipoItemSessaoCampanha;
  categoria: CategoriaEquipamento;
  peso: number;
  descricaoRevelada?: boolean;
};

type AcessoCampanha = Awaited<ReturnType<CampanhaAccessService['garantirAcesso']>>;

const transferenciaItemSessaoInclude = {
  item: { select: { id: true, nome: true, peso: true, personagemCampanhaId: true } },
  solicitante: { select: { id: true, apelido: true } },
  portadorAnterior: {
    select: {
      id: true,
      nome: true,
      donoId: true,
      personagemBase: { select: { nome: true } },
    },
  },
  destinoPersonagemCampanha: {
    select: {
      id: true,
      nome: true,
      donoId: true,
      personagemBase: { select: { nome: true } },
    },
  },
  destinoNpcSessao: { select: { id: true, nomeExibicao: true } },
} satisfies Prisma.TransferenciaItemSessaoCampanhaInclude;

const itemSessaoInclude = {
  criadoPor: { select: { id: true, apelido: true } },
  personagemCampanha: {
    select: {
      id: true,
      nome: true,
      donoId: true,
      personagemBase: { select: { nome: true } },
    },
  },
  transferencias: {
    where: { status: StatusTransferenciaItemSessao.PENDENTE },
    orderBy: { criadaEm: 'desc' },
    take: 1,
    include: transferenciaItemSessaoInclude,
  },
} satisfies Prisma.ItemSessaoCampanhaInclude;

const templateItemSessaoInclude = {
  criadoPor: { select: { id: true, apelido: true } },
} satisfies Prisma.TemplateItemSessaoCampanhaInclude;

type TransferenciaMapeavel = Prisma.TransferenciaItemSessaoCampanhaGetPayload<{
  include: typeof transferenciaItemSessaoInclude;
}>;
type ItemSessaoMapeavel = Prisma.ItemSessaoCampanhaGetPayload<{
  include: typeof itemSessaoInclude;
}>;

@Injectable()
export class CampanhaItensSessaoService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly accessService: CampanhaAccessService,
  ) {}

  async listarItens(campanhaId: number, usuarioId: number) {
    const acesso = await this.accessService.garantirAcesso(campanhaId, usuarioId);
    const [itens, transferenciasPendentes] = await Promise.all([
      this.prisma.itemSessaoCampanha.findMany({
        where: { campanhaId },
        include: itemSessaoInclude,
        orderBy: [{ atualizadoEm: 'desc' }, { id: 'desc' }],
      }),
      this.listarTransferenciasPendentesInterno(campanhaId, acesso, usuarioId),
    ]);

    return {
      permissoes: {
        ehMestre: acesso.ehMestre,
        podeGerenciarTemplates: acesso.ehMestre,
        podeCriarItem: true,
      },
      itens: itens.map((item) => this.mapearItem(item, acesso, usuarioId)),
      transferenciasPendentes,
    };
  }

  async listarTransferenciasPendentes(campanhaId: number, usuarioId: number) {
    const acesso = await this.accessService.garantirAcesso(campanhaId, usuarioId);
    return this.listarTransferenciasPendentesInterno(campanhaId, acesso, usuarioId);
  }

  async listarTemplates(campanhaId: number, usuarioId: number) {
    const acesso = await this.accessService.garantirAcesso(campanhaId, usuarioId);
    this.assertMestre(acesso, 'listar templates de itens de sessao');

    return this.prisma.templateItemSessaoCampanha.findMany({
      where: { campanhaId },
      include: templateItemSessaoInclude,
      orderBy: [{ atualizadoEm: 'desc' }, { id: 'desc' }],
    });
  }

  async criarTemplate(
    campanhaId: number,
    usuarioId: number,
    dto: CriarTemplateItemSessaoCampanhaDto,
  ) {
    const acesso = await this.accessService.garantirAcesso(campanhaId, usuarioId);
    this.assertMestre(acesso, 'criar templates de itens de sessao');
    const dados = this.normalizarDadosItem(dto);

    return this.prisma.templateItemSessaoCampanha.create({
      data: {
        campanhaId,
        criadoPorId: usuarioId,
        ...dados,
        descricaoRevelada: dados.descricaoRevelada ?? false,
      },
      include: templateItemSessaoInclude,
    });
  }

  async atualizarTemplate(
    campanhaId: number,
    usuarioId: number,
    templateId: number,
    dto: AtualizarTemplateItemSessaoCampanhaDto,
  ) {
    const acesso = await this.accessService.garantirAcesso(campanhaId, usuarioId);
    this.assertMestre(acesso, 'editar templates de itens de sessao');
    const atual = await this.obterTemplate(campanhaId, templateId);
    const dados = this.normalizarDadosItem({ ...atual, ...dto });

    return this.prisma.templateItemSessaoCampanha.update({
      where: { id: templateId },
      data: {
        ...dados,
        descricaoRevelada:
          dto.descricaoRevelada ?? atual.descricaoRevelada ?? false,
      },
      include: templateItemSessaoInclude,
    });
  }

  async instanciarTemplate(
    campanhaId: number,
    usuarioId: number,
    templateId: number,
    dto: Partial<CriarItemSessaoCampanhaDto> = {},
  ) {
    const acesso = await this.accessService.garantirAcesso(campanhaId, usuarioId);
    this.assertMestre(acesso, 'instanciar templates de itens de sessao');
    const template = await this.obterTemplate(campanhaId, templateId);

    await this.validarReferenciasEscopoCampanha(campanhaId, dto);
    if (dto.personagemCampanhaId) {
      await this.validarCapacidadePortadorSessao(
        campanhaId,
        dto.personagemCampanhaId,
        template.peso,
      );
    }

    return this.prisma.itemSessaoCampanha.create({
      data: {
        campanhaId,
        criadoPorId: usuarioId,
        nome: template.nome,
        descricao: template.descricao,
        tipo: template.tipo,
        categoria: template.categoria,
        peso: template.peso,
        descricaoRevelada: template.descricaoRevelada,
        sessaoId: dto.sessaoId ?? null,
        cenaId: dto.cenaId ?? null,
        personagemCampanhaId: dto.personagemCampanhaId ?? null,
      },
      include: itemSessaoInclude,
    });
  }

  async criarItem(
    campanhaId: number,
    usuarioId: number,
    dto: CriarItemSessaoCampanhaDto,
  ) {
    const acesso = await this.accessService.garantirAcesso(campanhaId, usuarioId);
    const dados = this.normalizarDadosItem(dto);
    await this.validarPermissoesCamposMestreEmCriacao(acesso, dto);
    await this.validarReferenciasEscopoCampanha(campanhaId, dto);

    const personagemCampanhaId = acesso.ehMestre
      ? (dto.personagemCampanhaId ?? null)
      : await this.obterPersonagemProprioObrigatorio(
          campanhaId,
          usuarioId,
          dto.personagemCampanhaId,
        );

    if (personagemCampanhaId) {
      await this.validarCapacidadePortadorSessao(
        campanhaId,
        personagemCampanhaId,
        dados.peso,
      );
    }

    return this.prisma.itemSessaoCampanha.create({
      data: {
        campanhaId,
        criadoPorId: usuarioId,
        ...dados,
        descricaoRevelada: acesso.ehMestre
          ? (dados.descricaoRevelada ?? false)
          : true,
        sessaoId: acesso.ehMestre ? (dto.sessaoId ?? null) : null,
        cenaId: acesso.ehMestre ? (dto.cenaId ?? null) : null,
        personagemCampanhaId,
      },
      include: itemSessaoInclude,
    });
  }

  async atualizarItem(
    campanhaId: number,
    usuarioId: number,
    itemId: number,
    dto: AtualizarItemSessaoCampanhaDto,
  ) {
    const acesso = await this.accessService.garantirAcesso(campanhaId, usuarioId);
    const atual = await this.obterItem(campanhaId, itemId);

    if (!acesso.ehMestre && atual.criadoPorId !== usuarioId) {
      throw new ForbiddenException('Apenas o mestre ou criador pode editar este item.');
    }

    await this.validarPermissoesCamposMestre(acesso, dto);
    await this.validarReferenciasEscopoCampanha(campanhaId, dto);

    const dados = this.normalizarDadosItem({ ...atual, ...dto });
    const proximoPortador = acesso.ehMestre
      ? this.valorNullable(dto, 'personagemCampanhaId', atual.personagemCampanhaId)
      : atual.personagemCampanhaId;

    if (proximoPortador) {
      await this.validarCapacidadePortadorSessao(
        campanhaId,
        proximoPortador,
        dados.peso,
        itemId,
      );
    }

    return this.prisma.itemSessaoCampanha.update({
      where: { id: itemId },
      data: {
        ...dados,
        descricaoRevelada: acesso.ehMestre
          ? (dto.descricaoRevelada ?? atual.descricaoRevelada)
          : atual.descricaoRevelada,
        sessaoId: acesso.ehMestre
          ? this.valorNullable(dto, 'sessaoId', atual.sessaoId)
          : atual.sessaoId,
        cenaId: acesso.ehMestre
          ? this.valorNullable(dto, 'cenaId', atual.cenaId)
          : atual.cenaId,
        personagemCampanhaId: proximoPortador,
      },
      include: itemSessaoInclude,
    });
  }

  async atribuirItem(
    campanhaId: number,
    usuarioId: number,
    itemId: number,
    dto: AtribuirItemSessaoCampanhaDto,
  ) {
    const acesso = await this.accessService.garantirAcesso(campanhaId, usuarioId);
    this.assertMestre(acesso, 'atribuir itens de sessao');
    const item = await this.obterItem(campanhaId, itemId);
    await this.validarReferenciasEscopoCampanha(campanhaId, dto);

    if (dto.personagemCampanhaId) {
      await this.validarCapacidadePortadorSessao(
        campanhaId,
        dto.personagemCampanhaId,
        item.peso,
        itemId,
      );
    }

    await this.cancelarTransferenciasPendentesItem(campanhaId, itemId, usuarioId);

    return this.prisma.itemSessaoCampanha.update({
      where: { id: itemId },
      data: { personagemCampanhaId: dto.personagemCampanhaId ?? null },
      include: itemSessaoInclude,
    });
  }

  async revelarItem(
    campanhaId: number,
    usuarioId: number,
    itemId: number,
    dto: RevelarItemSessaoCampanhaDto,
  ) {
    const acesso = await this.accessService.garantirAcesso(campanhaId, usuarioId);
    this.assertMestre(acesso, 'revelar ou ocultar itens de sessao');
    await this.obterItem(campanhaId, itemId);

    return this.prisma.itemSessaoCampanha.update({
      where: { id: itemId },
      data: { descricaoRevelada: dto.descricaoRevelada },
      include: itemSessaoInclude,
    });
  }

  async solicitarTransferencia(
    campanhaId: number,
    usuarioId: number,
    itemId: number,
    dto: SolicitarTransferenciaItemSessaoCampanhaDto,
  ) {
    const acesso = await this.accessService.garantirAcesso(campanhaId, usuarioId);
    const item = await this.obterItemComPortador(campanhaId, itemId);

    if (!item.personagemCampanhaId || !item.personagemCampanha) {
      throw new BadRequestException('Apenas itens com portador podem ser transferidos.');
    }

    if (!acesso.ehMestre && item.personagemCampanha.donoId !== usuarioId) {
      throw new ForbiddenException('Voce so pode transferir itens dos seus personagens.');
    }

    await this.assertSemTransferenciaPendente(itemId);

    if (dto.destinoTipo === DestinoTransferenciaItemSessao.PERSONAGEM) {
      if (!dto.destinoPersonagemCampanhaId) {
        throw new BadRequestException('Informe o personagem de destino.');
      }
      if (dto.destinoPersonagemCampanhaId === item.personagemCampanhaId) {
        throw new BadRequestException('O item ja esta com este personagem.');
      }
      await this.validarReferenciasEscopoCampanha(campanhaId, {
        personagemCampanhaId: dto.destinoPersonagemCampanhaId,
      });
      await this.validarCapacidadePortadorSessao(
        campanhaId,
        dto.destinoPersonagemCampanhaId,
        item.peso,
        itemId,
      );

      return this.prisma.transferenciaItemSessaoCampanha.create({
        data: {
          campanhaId,
          itemId,
          solicitanteId: usuarioId,
          portadorAnteriorId: item.personagemCampanhaId,
          destinoTipo: dto.destinoTipo,
          destinoPersonagemCampanhaId: dto.destinoPersonagemCampanhaId,
        },
        include: transferenciaItemSessaoInclude,
      });
    }

    if (!dto.destinoNpcSessaoId) {
      throw new BadRequestException('Informe o NPC de destino.');
    }
    await this.validarNpcSessaoEscopoCampanha(campanhaId, dto.destinoNpcSessaoId);

    return this.prisma.$transaction(async (tx) => {
      const transferencia = await tx.transferenciaItemSessaoCampanha.create({
        data: {
          campanhaId,
          itemId,
          solicitanteId: usuarioId,
          portadorAnteriorId: item.personagemCampanhaId,
          destinoTipo: dto.destinoTipo,
          destinoNpcSessaoId: dto.destinoNpcSessaoId,
        },
        include: transferenciaItemSessaoInclude,
      });
      await tx.itemSessaoCampanha.update({
        where: { id: itemId },
        data: { personagemCampanhaId: null },
      });
      return transferencia;
    });
  }

  async aceitarTransferencia(
    campanhaId: number,
    usuarioId: number,
    transferenciaId: number,
  ) {
    return this.responderTransferencia(campanhaId, usuarioId, transferenciaId, true);
  }

  async recusarTransferencia(
    campanhaId: number,
    usuarioId: number,
    transferenciaId: number,
  ) {
    return this.responderTransferencia(campanhaId, usuarioId, transferenciaId, false);
  }

  private async responderTransferencia(
    campanhaId: number,
    usuarioId: number,
    transferenciaId: number,
    aceitar: boolean,
  ) {
    const acesso = await this.accessService.garantirAcesso(campanhaId, usuarioId);
    const transferencia = await this.obterTransferenciaPendente(
      campanhaId,
      transferenciaId,
    );

    this.validarPermissaoResponderTransferencia(transferencia, acesso, usuarioId);

    if (aceitar && transferencia.destinoTipo === DestinoTransferenciaItemSessao.PERSONAGEM) {
      if (!transferencia.destinoPersonagemCampanhaId) {
        throw new BadRequestException('Transferencia sem personagem de destino.');
      }
      if (transferencia.item.personagemCampanhaId !== transferencia.portadorAnteriorId) {
        throw new BadRequestException('O item mudou de portador durante a transferencia.');
      }
      await this.validarCapacidadePortadorSessao(
        campanhaId,
        transferencia.destinoPersonagemCampanhaId,
        transferencia.item.peso,
        transferencia.itemId,
      );
    }

    return this.prisma.$transaction(async (tx) => {
      if (aceitar && transferencia.destinoTipo === DestinoTransferenciaItemSessao.PERSONAGEM) {
        await tx.itemSessaoCampanha.update({
          where: { id: transferencia.itemId },
          data: {
            personagemCampanhaId: transferencia.destinoPersonagemCampanhaId,
          },
        });
      }

      if (!aceitar && transferencia.destinoTipo === DestinoTransferenciaItemSessao.NPC) {
        await tx.itemSessaoCampanha.update({
          where: { id: transferencia.itemId },
          data: { personagemCampanhaId: transferencia.portadorAnteriorId },
        });
      }

      return tx.transferenciaItemSessaoCampanha.update({
        where: { id: transferencia.id },
        data: {
          status: aceitar
            ? StatusTransferenciaItemSessao.ACEITA
            : StatusTransferenciaItemSessao.RECUSADA,
          respondidaPorId: usuarioId,
          respondidaEm: new Date(),
        },
        include: transferenciaItemSessaoInclude,
      });
    });
  }

  private normalizarDadosItem(
    entrada:
      | CriarTemplateItemSessaoCampanhaDto
      | AtualizarTemplateItemSessaoCampanhaDto
      | CriarItemSessaoCampanhaDto
      | AtualizarItemSessaoCampanhaDto
      | {
          nome: string;
          descricao: string | null;
          tipo: TipoItemSessaoCampanha;
          categoria: CategoriaEquipamento;
          peso: number;
          descricaoRevelada?: boolean;
        },
  ): DadosItemSessaoNormalizados {
    const nome = entrada.nome?.trim();
    if (!nome) {
      throw new BadRequestException('Nome do item de sessao e obrigatorio.');
    }

    const tipo = entrada.tipo;
    if (!tipo) {
      throw new BadRequestException('Tipo do item de sessao e obrigatorio.');
    }

    const categoria =
      tipo === 'GERAL'
        ? entrada.categoria
        : CategoriaEquipamento.CATEGORIA_0;

    if (tipo === 'GERAL' && !categoria) {
      throw new BadRequestException('Itens gerais exigem categoria valida.');
    }

    return {
      nome,
      descricao:
        typeof entrada.descricao === 'string'
          ? entrada.descricao.trim() || null
          : null,
      tipo,
      categoria: categoria ?? CategoriaEquipamento.CATEGORIA_0,
      peso: tipo === 'DOCUMENTO' ? 0 : Math.max(0, Number(entrada.peso ?? 0)),
      descricaoRevelada: entrada.descricaoRevelada,
    };
  }

  private async validarPermissoesCamposMestreEmCriacao(
    acesso: AcessoCampanha,
    dto: Partial<CriarItemSessaoCampanhaDto>,
  ) {
    if (acesso.ehMestre) return;
    if (
      dto.sessaoId !== undefined ||
      dto.cenaId !== undefined ||
      dto.descricaoRevelada !== undefined
    ) {
      throw new ForbiddenException(
        'Apenas o mestre pode editar sessao, cena ou revelacao.',
      );
    }
  }

  private async validarPermissoesCamposMestre(
    acesso: AcessoCampanha,
    dto: Partial<CriarItemSessaoCampanhaDto>,
  ) {
    if (acesso.ehMestre) return;
    if (
      dto.sessaoId !== undefined ||
      dto.cenaId !== undefined ||
      dto.personagemCampanhaId !== undefined ||
      dto.descricaoRevelada !== undefined
    ) {
      throw new ForbiddenException(
        'Apenas o mestre pode editar sessao, cena, portador ou revelacao.',
      );
    }
  }

  private async validarReferenciasEscopoCampanha(
    campanhaId: number,
    dto: Partial<CriarItemSessaoCampanhaDto>,
  ) {
    if (dto.sessaoId) {
      const sessao = await this.prisma.sessao.findFirst({
        where: { id: dto.sessaoId, campanhaId },
        select: { id: true },
      });
      if (!sessao) throw new BadRequestException('Sessao informada nao pertence a campanha.');
    }

    if (dto.cenaId) {
      const cena = await this.prisma.cena.findFirst({
        where: { id: dto.cenaId, sessao: { campanhaId } },
        select: { id: true },
      });
      if (!cena) throw new BadRequestException('Cena informada nao pertence a campanha.');
    }

    if (dto.personagemCampanhaId) {
      const personagem = await this.prisma.personagemCampanha.findFirst({
        where: { id: dto.personagemCampanhaId, campanhaId },
        select: { id: true },
      });
      if (!personagem) {
        throw new BadRequestException('Portador informado nao pertence a campanha.');
      }
    }
  }

  private async validarNpcSessaoEscopoCampanha(
    campanhaId: number,
    npcSessaoId: number,
  ) {
    const npc = await this.prisma.npcAmeacaSessao.findFirst({
      where: { id: npcSessaoId, sessao: { campanhaId } },
      select: { id: true },
    });
    if (!npc) {
      throw new BadRequestException('NPC de destino nao pertence a campanha.');
    }
  }

  private async obterPersonagemProprioObrigatorio(
    campanhaId: number,
    usuarioId: number,
    personagemCampanhaId?: number | null,
  ) {
    if (!personagemCampanhaId) {
      throw new BadRequestException('Jogadores precisam escolher um personagem proprio para receber o item.');
    }
    const personagem = await this.prisma.personagemCampanha.findFirst({
      where: { id: personagemCampanhaId, campanhaId, donoId: usuarioId },
      select: { id: true },
    });
    if (!personagem) {
      throw new ForbiddenException('Voce so pode criar itens para seus proprios personagens.');
    }
    return personagem.id;
  }

  private async validarCapacidadePortadorSessao(
    campanhaId: number,
    personagemCampanhaId: number,
    pesoItem: number,
    itemIdIgnorado?: number,
  ) {
    const personagem = await this.prisma.personagemCampanha.findFirst({
      where: { id: personagemCampanhaId, campanhaId },
      select: {
        id: true,
        espacosInventarioBase: true,
        espacosInventarioExtra: true,
        espacosOcupados: true,
      },
    });
    if (!personagem) {
      throw new BadRequestException('Portador informado nao pertence a campanha.');
    }

    const somaItensSessao = await this.prisma.itemSessaoCampanha.aggregate({
      where: {
        personagemCampanhaId,
        ...(itemIdIgnorado ? { id: { not: itemIdIgnorado } } : {}),
      },
      _sum: { peso: true },
    });

    const capacidade =
      Number(personagem.espacosInventarioBase ?? 0) +
      Number(personagem.espacosInventarioExtra ?? 0);
    const limite = capacidade * 2;
    const ocupado =
      Number(personagem.espacosOcupados ?? 0) +
      Number(somaItensSessao._sum.peso ?? 0);
    const pesoFinal = ocupado + Number(pesoItem ?? 0);

    if (pesoFinal > limite) {
      throw new BadRequestException(
        'O personagem ultrapassaria o limite de 2x a capacidade de carga.',
      );
    }
  }

  private async listarTransferenciasPendentesInterno(
    campanhaId: number,
    acesso: AcessoCampanha,
    usuarioId: number,
  ) {
    const transferencias = await this.prisma.transferenciaItemSessaoCampanha.findMany({
      where: { campanhaId, status: StatusTransferenciaItemSessao.PENDENTE },
      include: transferenciaItemSessaoInclude,
      orderBy: [{ criadaEm: 'desc' }, { id: 'desc' }],
    });

    return transferencias
      .filter(
        (transferencia) =>
          acesso.ehMestre ||
          transferencia.solicitanteId === usuarioId ||
          transferencia.portadorAnterior?.donoId === usuarioId ||
          transferencia.destinoPersonagemCampanha?.donoId === usuarioId,
      )
      .map((transferencia) =>
        this.mapearTransferencia(transferencia, acesso, usuarioId),
      );
  }

  private async obterTemplate(campanhaId: number, templateId: number) {
    const template = await this.prisma.templateItemSessaoCampanha.findFirst({
      where: { id: templateId, campanhaId },
    });
    if (!template) {
      throw new NotFoundException('Template de item de sessao nao encontrado.');
    }
    return template;
  }

  private async obterItem(campanhaId: number, itemId: number) {
    const item = await this.prisma.itemSessaoCampanha.findFirst({
      where: { id: itemId, campanhaId },
    });
    if (!item) {
      throw new NotFoundException('Item de sessao nao encontrado.');
    }
    return item;
  }

  private async obterItemComPortador(campanhaId: number, itemId: number) {
    const item = await this.prisma.itemSessaoCampanha.findFirst({
      where: { id: itemId, campanhaId },
      include: {
        personagemCampanha: {
          select: { id: true, donoId: true, nome: true },
        },
      },
    });
    if (!item) {
      throw new NotFoundException('Item de sessao nao encontrado.');
    }
    return item;
  }

  private async obterTransferenciaPendente(
    campanhaId: number,
    transferenciaId: number,
  ) {
    const transferencia = await this.prisma.transferenciaItemSessaoCampanha.findFirst({
      where: {
        id: transferenciaId,
        campanhaId,
        status: StatusTransferenciaItemSessao.PENDENTE,
      },
      include: transferenciaItemSessaoInclude,
    });
    if (!transferencia) {
      throw new NotFoundException('Transferencia pendente nao encontrada.');
    }
    return transferencia;
  }

  private validarPermissaoResponderTransferencia(
    transferencia: TransferenciaMapeavel,
    acesso: AcessoCampanha,
    usuarioId: number,
  ) {
    if (acesso.ehMestre) return;

    const destinoEhMeu =
      transferencia.destinoTipo === DestinoTransferenciaItemSessao.PERSONAGEM &&
      transferencia.destinoPersonagemCampanha?.donoId === usuarioId;

    if (!destinoEhMeu) {
      throw new ForbiddenException('Voce nao pode responder esta transferencia.');
    }
  }

  private async assertSemTransferenciaPendente(itemId: number) {
    const pendente = await this.prisma.transferenciaItemSessaoCampanha.findFirst({
      where: { itemId, status: StatusTransferenciaItemSessao.PENDENTE },
      select: { id: true },
    });
    if (pendente) {
      throw new BadRequestException('Este item ja possui uma transferencia pendente.');
    }
  }

  private async cancelarTransferenciasPendentesItem(
    campanhaId: number,
    itemId: number,
    usuarioId: number,
  ) {
    await this.prisma.transferenciaItemSessaoCampanha.updateMany({
      where: { campanhaId, itemId, status: StatusTransferenciaItemSessao.PENDENTE },
      data: {
        status: StatusTransferenciaItemSessao.CANCELADA,
        respondidaPorId: usuarioId,
        respondidaEm: new Date(),
      },
    });
  }

  private assertMestre(acesso: AcessoCampanha, acao: string) {
    if (!acesso.ehMestre) {
      throw new ForbiddenException(`Apenas o mestre pode ${acao}.`);
    }
  }

  private valorNullable<T extends object, K extends keyof T>(
    objeto: T,
    campo: K,
    fallback: T[K],
  ): T[K] {
    return Object.prototype.hasOwnProperty.call(objeto, campo)
      ? objeto[campo]
      : fallback;
  }

  private nomePersonagem(
    personagem:
      | { nome: string | null; personagemBase?: { nome: string } | null }
      | null,
  ) {
    return personagem?.nome || personagem?.personagemBase?.nome || 'Personagem';
  }

  private mapearTransferencia(
    transferencia: TransferenciaMapeavel,
    acesso: AcessoCampanha,
    usuarioId: number,
  ) {
    const destinoEhMeu =
      transferencia.destinoTipo === DestinoTransferenciaItemSessao.PERSONAGEM &&
      transferencia.destinoPersonagemCampanha?.donoId === usuarioId;

    return {
      id: transferencia.id,
      campanhaId: transferencia.campanhaId,
      itemId: transferencia.itemId,
      solicitanteId: transferencia.solicitanteId,
      portadorAnteriorId: transferencia.portadorAnteriorId,
      destinoTipo: transferencia.destinoTipo,
      destinoPersonagemCampanhaId: transferencia.destinoPersonagemCampanhaId,
      destinoNpcSessaoId: transferencia.destinoNpcSessaoId,
      status: transferencia.status,
      criadaEm: transferencia.criadaEm,
      respondidaEm: transferencia.respondidaEm,
      item: transferencia.item,
      solicitante: transferencia.solicitante,
      portadorAnterior: transferencia.portadorAnterior
        ? {
            id: transferencia.portadorAnterior.id,
            nome: this.nomePersonagem(transferencia.portadorAnterior),
            donoId: transferencia.portadorAnterior.donoId,
          }
        : null,
      destinoPersonagem: transferencia.destinoPersonagemCampanha
        ? {
            id: transferencia.destinoPersonagemCampanha.id,
            nome: this.nomePersonagem(transferencia.destinoPersonagemCampanha),
            donoId: transferencia.destinoPersonagemCampanha.donoId,
            ehMeu: destinoEhMeu,
          }
        : null,
      destinoNpc: transferencia.destinoNpcSessao
        ? {
            id: transferencia.destinoNpcSessao.id,
            nome: transferencia.destinoNpcSessao.nomeExibicao,
          }
        : null,
      permissoes: {
        podeResponder: acesso.ehMestre || destinoEhMeu,
        podeResponderComoMestre:
          acesso.ehMestre &&
          transferencia.destinoTipo === DestinoTransferenciaItemSessao.NPC,
      },
    };
  }

  private mapearItem(
    item: ItemSessaoMapeavel,
    acesso: AcessoCampanha,
    usuarioId: number,
  ) {
    const podeVerDescricao = acesso.ehMestre || item.descricaoRevelada;
    const transferenciaPendente = item.transferencias?.[0];
    return {
      id: item.id,
      campanhaId: item.campanhaId,
      sessaoId: acesso.ehMestre ? item.sessaoId : null,
      cenaId: acesso.ehMestre ? item.cenaId : null,
      personagemCampanhaId: item.personagemCampanhaId,
      nome: item.nome,
      descricao: podeVerDescricao ? item.descricao : null,
      descricaoOculta: !podeVerDescricao,
      tipo: item.tipo,
      categoria: item.categoria,
      peso: item.peso,
      descricaoRevelada: item.descricaoRevelada,
      criadoEm: item.criadoEm,
      atualizadoEm: item.atualizadoEm,
      criadoPor: item.criadoPor,
      transferenciaPendente: transferenciaPendente
        ? this.mapearTransferencia(transferenciaPendente, acesso, usuarioId)
        : null,
      portador: item.personagemCampanha
        ? {
            id: item.personagemCampanha.id,
            nome: this.nomePersonagem(item.personagemCampanha),
            donoId: item.personagemCampanha.donoId,
            ehMeu: item.personagemCampanha.donoId === usuarioId,
          }
        : null,
      permissoes: {
        podeEditar: acesso.ehMestre || item.criadoPorId === usuarioId,
        podeAtribuir: acesso.ehMestre,
        podeRevelar: acesso.ehMestre,
        podeTransferir:
          !transferenciaPendente &&
          !!item.personagemCampanha &&
          (acesso.ehMestre || item.personagemCampanha.donoId === usuarioId),
      },
    };
  }
}
