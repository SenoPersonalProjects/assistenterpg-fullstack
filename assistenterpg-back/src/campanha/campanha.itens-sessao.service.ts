import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  CategoriaEquipamento,
  Prisma,
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
} satisfies Prisma.ItemSessaoCampanhaInclude;

const templateItemSessaoInclude = {
  criadoPor: { select: { id: true, apelido: true } },
} satisfies Prisma.TemplateItemSessaoCampanhaInclude;

@Injectable()
export class CampanhaItensSessaoService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly accessService: CampanhaAccessService,
  ) {}

  async listarItens(campanhaId: number, usuarioId: number) {
    const acesso = await this.accessService.garantirAcesso(campanhaId, usuarioId);
    const itens = await this.prisma.itemSessaoCampanha.findMany({
      where: { campanhaId },
      include: itemSessaoInclude,
      orderBy: [{ atualizadoEm: 'desc' }, { id: 'desc' }],
    });

    return {
      permissoes: {
        ehMestre: acesso.ehMestre,
        podeGerenciarTemplates: acesso.ehMestre,
        podeCriarItem: true,
      },
      itens: itens.map((item) => this.mapearItem(item, acesso, usuarioId)),
    };
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
    await this.validarPermissoesCamposMestre(acesso, dto);
    await this.validarReferenciasEscopoCampanha(campanhaId, dto);

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
        personagemCampanhaId: acesso.ehMestre
          ? (dto.personagemCampanhaId ?? null)
          : null,
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
        personagemCampanhaId: acesso.ehMestre
          ? this.valorNullable(
              dto,
              'personagemCampanhaId',
              atual.personagemCampanhaId,
            )
          : atual.personagemCampanhaId,
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
    await this.obterItem(campanhaId, itemId);
    await this.validarReferenciasEscopoCampanha(campanhaId, dto);

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

  private mapearItem(
    item: Prisma.ItemSessaoCampanhaGetPayload<{ include: typeof itemSessaoInclude }>,
    acesso: AcessoCampanha,
    usuarioId: number,
  ) {
    const podeVerDescricao = acesso.ehMestre || item.descricaoRevelada;
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
      portador: item.personagemCampanha
        ? {
            id: item.personagemCampanha.id,
            nome:
              item.personagemCampanha.nome ||
              item.personagemCampanha.personagemBase?.nome ||
              'Personagem',
            donoId: item.personagemCampanha.donoId,
            ehMeu: item.personagemCampanha.donoId === usuarioId,
          }
        : null,
      permissoes: {
        podeEditar: acesso.ehMestre || item.criadoPorId === usuarioId,
        podeAtribuir: acesso.ehMestre,
        podeRevelar: acesso.ehMestre,
      },
    };
  }
}
