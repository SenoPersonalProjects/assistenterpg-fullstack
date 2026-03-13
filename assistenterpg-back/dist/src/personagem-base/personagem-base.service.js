"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PersonagemBaseService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const client_1 = require("@prisma/client");
const inventario_service_1 = require("../inventario/inventario.service");
const personagem_exception_1 = require("../common/exceptions/personagem.exception");
const regras_trilha_1 = require("./regras-criacao/regras-trilha");
const regras_origem_cla_1 = require("./regras-criacao/regras-origem-cla");
const regras_tecnicas_nao_inatas_1 = require("./regras-criacao/regras-tecnicas-nao-inatas");
const personagem_base_engine_1 = require("./engine/personagem-base.engine");
const personagem_base_mapper_1 = require("./personagem-base.mapper");
const personagem_base_persistence_1 = require("./personagem-base.persistence");
const tecnicaComHabilidadesInclude = client_1.Prisma.validator()({
    habilidades: {
        include: {
            variacoes: {
                orderBy: { ordem: 'asc' },
            },
        },
        orderBy: { ordem: 'asc' },
    },
});
let PersonagemBaseService = class PersonagemBaseService {
    prisma;
    mapper;
    persistence;
    inventarioService;
    constructor(prisma, mapper, persistence, inventarioService) {
        this.prisma = prisma;
        this.mapper = mapper;
        this.persistence = persistence;
        this.inventarioService = inventarioService;
    }
    limparUndefined(obj) {
        const out = { ...obj };
        for (const k of Object.keys(out)) {
            if (out[k] === undefined)
                delete out[k];
        }
        return out;
    }
    jsonToStringArray(value) {
        if (!Array.isArray(value))
            return [];
        return value.filter((v) => typeof v === 'string');
    }
    validarAtributoChaveEa(valor) {
        const valoresValidos = Object.values(client_1.AtributoBaseEA);
        if (typeof valor !== 'string' || !valoresValidos.includes(valor)) {
            throw new personagem_exception_1.AtributoChaveEaInvalidoException(valor, valoresValidos);
        }
    }
    getPassivasIdsFromRelacao(passivas) {
        return (passivas ?? []).map((p) => p.passivaId);
    }
    getPoderesFromRelacao(poderes) {
        return (poderes ?? []).map((p) => ({
            habilidadeId: p.habilidadeId,
            config: p.config ?? undefined,
        }));
    }
    limparUndefinedDeepJson(value) {
        if (value === undefined)
            return undefined;
        const normalized = JSON.parse(JSON.stringify(value));
        return normalized;
    }
    isRecord(value) {
        return typeof value === 'object' && value !== null && !Array.isArray(value);
    }
    getNestedRecord(value, key) {
        if (!value)
            return null;
        const nested = value[key];
        return this.isRecord(nested) ? nested : null;
    }
    getNumberField(value, key) {
        if (!value)
            return null;
        const current = value[key];
        return typeof current === 'number' ? current : null;
    }
    extrairItensPreviewInventario(value) {
        if (!this.isRecord(value))
            return [];
        const itens = value.itens;
        return Array.isArray(itens) ? itens : [];
    }
    removerItensInventarioDoDto(dto) {
        const clone = { ...dto };
        delete clone.itensInventario;
        return clone;
    }
    async sincronizarItensInventarioNoUpdate(donoId, personagemBaseId, itensInventario, tx) {
        if (itensInventario === undefined) {
            return;
        }
        await tx.inventarioItemBaseModificacao.deleteMany({
            where: {
                item: {
                    personagemBaseId,
                },
            },
        });
        await tx.inventarioItemBase.deleteMany({
            where: { personagemBaseId },
        });
        if (itensInventario.length === 0) {
            await tx.personagemBase.update({
                where: { id: personagemBaseId },
                data: {
                    espacosOcupados: 0,
                    sobrecarregado: false,
                },
            });
            return;
        }
        for (const item of itensInventario) {
            await this.inventarioService.adicionarItem(donoId, {
                personagemBaseId,
                equipamentoId: item.equipamentoId,
                quantidade: item.quantidade,
                equipado: item.equipado ?? false,
                modificacoes: item.modificacoesIds ?? [],
                nomeCustomizado: item.nomeCustomizado,
                notas: item.notas,
            }, {
                tx,
                skipOwnershipCheck: true,
            });
        }
    }
    async resolverIdComReferencia(params) {
        const idsCandidatos = Array.from(new Set([params.idAtual, params.referencia?.id].filter((id) => typeof id === 'number' && Number.isInteger(id))));
        const codigo = params.referencia?.codigo?.trim();
        const nome = params.referencia?.nome?.trim();
        const houveTentativaResolucao = idsCandidatos.length > 0 || !!codigo || !!nome;
        for (const id of idsCandidatos) {
            const encontrado = await params.buscarPorId(id);
            if (encontrado !== null)
                return encontrado;
        }
        if (codigo && params.buscarPorCodigo) {
            const encontrado = await params.buscarPorCodigo(codigo);
            if (encontrado !== null)
                return encontrado;
        }
        if (nome && params.buscarPorNome) {
            const encontrado = await params.buscarPorNome(nome);
            if (encontrado !== null)
                return encontrado;
        }
        if (params.obrigatorio || houveTentativaResolucao) {
            throw new common_1.BadRequestException({
                code: 'REFERENCIA_IMPORTACAO_INVALIDA',
                message: `Nao foi possivel resolver a referencia de ${params.label} na importacao.`,
                details: { label: params.label },
            });
        }
        return null;
    }
    async resolverPoderesGenericosImportacao(poderes, referencias) {
        if (!poderes?.length)
            return poderes;
        const refsPorIndex = new Map((referencias?.poderesGenericos ?? []).map((ref) => [ref.index, ref]));
        const resolvidos = [];
        for (let index = 0; index < poderes.length; index++) {
            const poder = poderes[index];
            const ref = refsPorIndex.get(index);
            const habilidadeId = await this.resolverIdComReferencia({
                label: `poderGenerico[${index}]`,
                idAtual: poder.habilidadeId,
                referencia: {
                    id: ref?.habilidadeId,
                    nome: ref?.habilidadeNome,
                },
                obrigatorio: true,
                buscarPorId: async (id) => {
                    const found = await this.prisma.habilidade.findFirst({
                        where: { id, tipo: 'PODER_GENERICO' },
                        select: { id: true },
                    });
                    return found?.id ?? null;
                },
                buscarPorNome: async (nome) => {
                    const found = await this.prisma.habilidade.findFirst({
                        where: { nome, tipo: 'PODER_GENERICO' },
                        select: { id: true },
                    });
                    return found?.id ?? null;
                },
            });
            resolvidos.push({
                ...poder,
                habilidadeId: habilidadeId,
            });
        }
        return resolvidos;
    }
    async resolverPassivasImportacao(passivasAtributoIds, referencias) {
        if (!passivasAtributoIds?.length)
            return passivasAtributoIds;
        const refsPorIndex = new Map((referencias?.passivas ?? []).map((ref) => [ref.index, ref]));
        const resolvidas = [];
        for (let index = 0; index < passivasAtributoIds.length; index++) {
            const idAtual = passivasAtributoIds[index];
            const ref = refsPorIndex.get(index);
            const passivaId = await this.resolverIdComReferencia({
                label: `passiva[${index}]`,
                idAtual,
                referencia: {
                    id: ref?.passivaId,
                    codigo: ref?.codigo,
                    nome: ref?.nome,
                },
                obrigatorio: true,
                buscarPorId: async (id) => {
                    const found = await this.prisma.passivaAtributo.findUnique({
                        where: { id },
                        select: { id: true },
                    });
                    return found?.id ?? null;
                },
                buscarPorCodigo: async (codigo) => {
                    const found = await this.prisma.passivaAtributo.findUnique({
                        where: { codigo },
                        select: { id: true },
                    });
                    return found?.id ?? null;
                },
                buscarPorNome: async (nome) => {
                    const found = await this.prisma.passivaAtributo.findFirst({
                        where: { nome },
                        select: { id: true },
                    });
                    return found?.id ?? null;
                },
            });
            resolvidas.push(passivaId);
        }
        return resolvidas;
    }
    async resolverItensInventarioImportacao(itensInventario, referencias) {
        if (!itensInventario?.length)
            return itensInventario;
        const refsItensPorIndex = new Map((referencias?.itensInventario ?? []).map((ref) => [ref.index, ref]));
        const itensResolvidos = [];
        for (let itemIndex = 0; itemIndex < itensInventario.length; itemIndex++) {
            const item = itensInventario[itemIndex];
            const refItem = refsItensPorIndex.get(itemIndex);
            const equipamentoId = await this.resolverIdComReferencia({
                label: `itensInventario[${itemIndex}].equipamento`,
                idAtual: item.equipamentoId,
                referencia: {
                    id: refItem?.equipamentoId,
                    codigo: refItem?.equipamentoCodigo,
                    nome: refItem?.equipamentoNome,
                },
                obrigatorio: true,
                buscarPorId: async (id) => {
                    const found = await this.prisma.equipamentoCatalogo.findUnique({
                        where: { id },
                        select: { id: true },
                    });
                    return found?.id ?? null;
                },
                buscarPorCodigo: async (codigo) => {
                    const found = await this.prisma.equipamentoCatalogo.findUnique({
                        where: { codigo },
                        select: { id: true },
                    });
                    return found?.id ?? null;
                },
                buscarPorNome: async (nome) => {
                    const found = await this.prisma.equipamentoCatalogo.findFirst({
                        where: { nome },
                        select: { id: true },
                    });
                    return found?.id ?? null;
                },
            });
            const refsModsPorIndex = new Map((refItem?.modificacoes ?? []).map((refMod) => [refMod.index, refMod]));
            const modificacoesResolvidas = [];
            if (item.modificacoesIds?.length) {
                for (let modIndex = 0; modIndex < item.modificacoesIds.length; modIndex++) {
                    const modIdAtual = item.modificacoesIds[modIndex];
                    const refMod = refsModsPorIndex.get(modIndex);
                    const modId = await this.resolverIdComReferencia({
                        label: `itensInventario[${itemIndex}].modificacoes[${modIndex}]`,
                        idAtual: modIdAtual,
                        referencia: {
                            id: refMod?.modificacaoId,
                            codigo: refMod?.codigo,
                            nome: refMod?.nome,
                        },
                        obrigatorio: true,
                        buscarPorId: async (id) => {
                            const found = await this.prisma.modificacaoEquipamento.findUnique({
                                where: { id },
                                select: { id: true },
                            });
                            return found?.id ?? null;
                        },
                        buscarPorCodigo: async (codigo) => {
                            const found = await this.prisma.modificacaoEquipamento.findUnique({
                                where: { codigo },
                                select: { id: true },
                            });
                            return found?.id ?? null;
                        },
                        buscarPorNome: async (nome) => {
                            const found = await this.prisma.modificacaoEquipamento.findFirst({
                                where: { nome },
                                select: { id: true },
                            });
                            return found?.id ?? null;
                        },
                    });
                    modificacoesResolvidas.push(modId);
                }
            }
            itensResolvidos.push({
                ...item,
                equipamentoId: equipamentoId,
                modificacoesIds: modificacoesResolvidas.length > 0
                    ? modificacoesResolvidas
                    : undefined,
            });
        }
        return itensResolvidos;
    }
    async montarDtoParaImportacao(dtoImportacao) {
        const payload = this.limparUndefinedDeepJson(dtoImportacao.personagem) ??
            dtoImportacao.personagem;
        const referencias = dtoImportacao.referencias;
        const nomeSobrescrito = dtoImportacao.nomeSobrescrito?.trim();
        const claId = await this.resolverIdComReferencia({
            label: 'cla',
            idAtual: payload.claId,
            referencia: referencias?.cla,
            obrigatorio: true,
            buscarPorId: async (id) => {
                const found = await this.prisma.cla.findUnique({
                    where: { id },
                    select: { id: true },
                });
                return found?.id ?? null;
            },
            buscarPorNome: async (nome) => {
                const found = await this.prisma.cla.findUnique({
                    where: { nome },
                    select: { id: true },
                });
                return found?.id ?? null;
            },
        });
        const origemId = await this.resolverIdComReferencia({
            label: 'origem',
            idAtual: payload.origemId,
            referencia: referencias?.origem,
            obrigatorio: true,
            buscarPorId: async (id) => {
                const found = await this.prisma.origem.findUnique({
                    where: { id },
                    select: { id: true },
                });
                return found?.id ?? null;
            },
            buscarPorNome: async (nome) => {
                const found = await this.prisma.origem.findUnique({
                    where: { nome },
                    select: { id: true },
                });
                return found?.id ?? null;
            },
        });
        const classeId = await this.resolverIdComReferencia({
            label: 'classe',
            idAtual: payload.classeId,
            referencia: referencias?.classe,
            obrigatorio: true,
            buscarPorId: async (id) => {
                const found = await this.prisma.classe.findUnique({
                    where: { id },
                    select: { id: true },
                });
                return found?.id ?? null;
            },
            buscarPorNome: async (nome) => {
                const found = await this.prisma.classe.findUnique({
                    where: { nome },
                    select: { id: true },
                });
                return found?.id ?? null;
            },
        });
        const trilhaId = await this.resolverIdComReferencia({
            label: 'trilha',
            idAtual: payload.trilhaId,
            referencia: referencias?.trilha,
            obrigatorio: false,
            buscarPorId: async (id) => {
                const found = await this.prisma.trilha.findUnique({
                    where: { id },
                    select: { id: true },
                });
                return found?.id ?? null;
            },
            buscarPorNome: async (nome) => {
                const found = await this.prisma.trilha.findUnique({
                    where: { nome },
                    select: { id: true },
                });
                return found?.id ?? null;
            },
        });
        const caminhoId = await this.resolverIdComReferencia({
            label: 'caminho',
            idAtual: payload.caminhoId,
            referencia: referencias?.caminho,
            obrigatorio: false,
            buscarPorId: async (id) => {
                const found = await this.prisma.caminho.findUnique({
                    where: { id },
                    select: { id: true },
                });
                return found?.id ?? null;
            },
            buscarPorNome: async (nome) => {
                const found = await this.prisma.caminho.findUnique({
                    where: { nome },
                    select: { id: true },
                });
                return found?.id ?? null;
            },
        });
        const alinhamentoId = await this.resolverIdComReferencia({
            label: 'alinhamento',
            idAtual: payload.alinhamentoId,
            referencia: referencias?.alinhamento,
            obrigatorio: false,
            buscarPorId: async (id) => {
                const found = await this.prisma.alinhamento.findUnique({
                    where: { id },
                    select: { id: true },
                });
                return found?.id ?? null;
            },
            buscarPorNome: async (nome) => {
                const found = await this.prisma.alinhamento.findUnique({
                    where: { nome },
                    select: { id: true },
                });
                return found?.id ?? null;
            },
        });
        const tecnicaInataId = await this.resolverIdComReferencia({
            label: 'tecnicaInata',
            idAtual: payload.tecnicaInataId,
            referencia: referencias?.tecnicaInata,
            obrigatorio: false,
            buscarPorId: async (id) => {
                const found = await this.prisma.tecnicaAmaldicoada.findUnique({
                    where: { id },
                    select: { id: true },
                });
                return found?.id ?? null;
            },
            buscarPorCodigo: async (codigo) => {
                const found = await this.prisma.tecnicaAmaldicoada.findUnique({
                    where: { codigo },
                    select: { id: true },
                });
                return found?.id ?? null;
            },
            buscarPorNome: async (nome) => {
                const found = await this.prisma.tecnicaAmaldicoada.findUnique({
                    where: { nome },
                    select: { id: true },
                });
                return found?.id ?? null;
            },
        });
        const poderesGenericos = await this.resolverPoderesGenericosImportacao(payload.poderesGenericos, referencias);
        const passivasAtributoIds = await this.resolverPassivasImportacao(payload.passivasAtributoIds, referencias);
        const itensInventario = await this.resolverItensInventarioImportacao(payload.itensInventario, referencias);
        return {
            ...payload,
            nome: nomeSobrescrito && nomeSobrescrito.length > 0
                ? nomeSobrescrito
                : payload.nome,
            claId: claId,
            origemId: origemId,
            classeId: classeId,
            trilhaId,
            caminhoId,
            alinhamentoId,
            tecnicaInataId,
            poderesGenericos,
            passivasAtributoIds,
            itensInventario,
        };
    }
    async validarItensInventarioNoPreview(dto) {
        if (!dto.itensInventario?.length) {
            return { itensValidados: [], errosItens: [] };
        }
        const itensPreview = dto.itensInventario.map((item) => ({
            equipamentoId: item.equipamentoId,
            quantidade: item.quantidade,
            equipado: item.equipado ?? false,
            modificacoes: item.modificacoesIds ?? [],
            nomeCustomizado: item.nomeCustomizado,
        }));
        try {
            const previewInventario = (await this.inventarioService.previewItensInventario({
                forca: dto.forca,
                prestigioBase: dto.prestigioBase ?? 0,
                itens: itensPreview,
            }));
            const itensValidados = this.extrairItensPreviewInventario(previewInventario);
            return {
                itensValidados,
                errosItens: [],
            };
        }
        catch {
            const itensValidados = [];
            const errosItens = [];
            for (const item of dto.itensInventario) {
                try {
                    const previewItem = (await this.inventarioService.previewItensInventario({
                        forca: dto.forca,
                        prestigioBase: dto.prestigioBase ?? 0,
                        itens: [
                            {
                                equipamentoId: item.equipamentoId,
                                quantidade: item.quantidade,
                                equipado: item.equipado ?? false,
                                modificacoes: item.modificacoesIds ?? [],
                                nomeCustomizado: item.nomeCustomizado,
                            },
                        ],
                    }));
                    const itensPreviewItem = this.extrairItensPreviewInventario(previewItem);
                    if (itensPreviewItem[0]) {
                        itensValidados.push(itensPreviewItem[0]);
                    }
                }
                catch (error) {
                    const erro = error instanceof Error
                        ? error.message
                        : 'Erro desconhecido ao validar item';
                    errosItens.push({
                        equipamentoId: item.equipamentoId,
                        erro,
                    });
                }
            }
            return { itensValidados, errosItens };
        }
    }
    filtrarTecnicaPorGraus(tecnica, grausMap) {
        return {
            ...tecnica,
            habilidades: (tecnica.habilidades ?? [])
                .filter((habilidade) => (0, regras_tecnicas_nao_inatas_1.atendeRequisitosGraus)(habilidade.requisitos, grausMap))
                .map((habilidade) => ({
                ...habilidade,
                variacoes: (habilidade.variacoes ?? []).filter((variacao) => (0, regras_tecnicas_nao_inatas_1.atendeRequisitosGraus)(variacao.requisitos, grausMap)),
            })),
        };
    }
    async listarTecnicasNaoInatasAtivasPorGraus(graus, prisma) {
        const grausMap = (0, regras_tecnicas_nao_inatas_1.montarMapaGraus)(graus);
        const tecnicas = await prisma.tecnicaAmaldicoada.findMany({
            where: { tipo: 'NAO_INATA' },
            include: tecnicaComHabilidadesInclude,
            orderBy: { nome: 'asc' },
        });
        return tecnicas
            .filter((tecnica) => (0, regras_tecnicas_nao_inatas_1.atendeRequisitoBaseTecnicaNaoInata)(tecnica.codigo, grausMap) &&
            (0, regras_tecnicas_nao_inatas_1.atendeRequisitosGraus)(tecnica.requisitos, grausMap))
            .map((tecnica) => this.filtrarTecnicaPorGraus(tecnica, grausMap));
    }
    async buscarTecnicaInataAtivaPorGraus(tecnicaInataId, graus, prisma) {
        if (!tecnicaInataId)
            return null;
        const grausMap = (0, regras_tecnicas_nao_inatas_1.montarMapaGraus)(graus);
        const tecnica = await prisma.tecnicaAmaldicoada.findFirst({
            where: { id: tecnicaInataId, tipo: 'INATA' },
            include: tecnicaComHabilidadesInclude,
        });
        if (!tecnica)
            return null;
        if (!(0, regras_tecnicas_nao_inatas_1.atendeRequisitosGraus)(tecnica.requisitos, grausMap))
            return null;
        return this.filtrarTecnicaPorGraus(tecnica, grausMap);
    }
    async buscarHabilidadesPersonagem(params, prisma = this.prisma) {
        const { nivel, origemId, classeId, trilhaId, caminhoId, tecnicaInataId, estudouEscolaTecnica, poderesGenericos, } = params;
        const habilidades = [];
        const mapHabilidade = (habilidade) => ({
            nome: habilidade.nome,
            tipo: habilidade.tipo,
            mecanicasEspeciais: habilidade.mecanicasEspeciais,
            efeitosGrau: habilidade.efeitosGrau.map((efeito) => ({
                tipoGrauCodigo: efeito.tipoGrauCodigo,
                valor: efeito.valor,
                escalonamentoPorNivel: efeito.escalonamentoPorNivel,
            })),
        });
        const habilidadesOrigem = await prisma.habilidadeOrigem.findMany({
            where: { origemId },
            include: {
                habilidade: {
                    include: { efeitosGrau: true },
                },
            },
        });
        habilidades.push(...habilidadesOrigem.map((ho) => ({
            habilidadeId: ho.habilidadeId,
            habilidade: mapHabilidade(ho.habilidade),
        })));
        const recursoClasse = await prisma.habilidadeClasse.findFirst({
            where: {
                classeId,
                nivelConcedido: 1,
                habilidade: { tipo: 'RECURSO_CLASSE' },
            },
            include: {
                habilidade: {
                    include: { efeitosGrau: true },
                },
            },
        });
        if (recursoClasse) {
            habilidades.push({
                habilidadeId: recursoClasse.habilidadeId,
                habilidade: mapHabilidade(recursoClasse.habilidade),
            });
        }
        const habilidadesClasse = await prisma.habilidadeClasse.findMany({
            where: {
                classeId,
                nivelConcedido: { lte: nivel },
                habilidade: { tipo: { not: 'RECURSO_CLASSE' } },
            },
            include: {
                habilidade: {
                    include: { efeitosGrau: true },
                },
            },
        });
        habilidades.push(...habilidadesClasse.map((hc) => ({
            habilidadeId: hc.habilidadeId,
            habilidade: mapHabilidade(hc.habilidade),
        })));
        if (trilhaId) {
            const habilidadesTrilha = await prisma.habilidadeTrilha.findMany({
                where: {
                    trilhaId,
                    caminhoId: null,
                    nivelConcedido: { lte: nivel },
                },
                include: {
                    habilidade: {
                        include: { efeitosGrau: true },
                    },
                },
            });
            habilidades.push(...habilidadesTrilha.map((ht) => ({
                habilidadeId: ht.habilidadeId,
                habilidade: mapHabilidade(ht.habilidade),
            })));
        }
        if (caminhoId) {
            const habilidadesCaminho = await prisma.habilidadeTrilha.findMany({
                where: {
                    caminhoId,
                    nivelConcedido: { lte: nivel },
                },
                include: {
                    habilidade: {
                        include: { efeitosGrau: true },
                    },
                },
            });
            habilidades.push(...habilidadesCaminho.map((ht) => ({
                habilidadeId: ht.habilidadeId,
                habilidade: mapHabilidade(ht.habilidade),
            })));
        }
        if (estudouEscolaTecnica) {
            const escolaTecnica = await prisma.habilidade.findUnique({
                where: { nome: 'Escola TÃ©cnica' },
                include: { efeitosGrau: true },
            });
            if (escolaTecnica) {
                habilidades.push({
                    habilidadeId: escolaTecnica.id,
                    habilidade: mapHabilidade(escolaTecnica),
                });
            }
        }
        if (poderesGenericos && poderesGenericos.length > 0) {
            const idsUnicos = Array.from(new Set(poderesGenericos.map((p) => p.habilidadeId)));
            const poderesDb = await prisma.habilidade.findMany({
                where: {
                    id: { in: idsUnicos },
                    tipo: 'PODER_GENERICO',
                },
                include: { efeitosGrau: true },
            });
            const mapPoder = new Map(poderesDb.map((p) => [p.id, p]));
            for (const inst of poderesGenericos) {
                const poder = mapPoder.get(inst.habilidadeId);
                if (!poder)
                    continue;
                habilidades.push({
                    habilidadeId: poder.id,
                    habilidade: mapHabilidade(poder),
                });
            }
        }
        return habilidades;
    }
    calcularModificadoresDerivadosPorHabilidades(habilidades, nivel) {
        const mods = {
            pvPorNivelExtra: 0,
            peBaseExtra: 0,
            limitePeEaExtra: 0,
            defesaExtra: 0,
            espacosInventarioExtra: 0,
        };
        for (const h of habilidades) {
            const mecanicas = this.isRecord(h.habilidade.mecanicasEspeciais)
                ? h.habilidade.mecanicasEspeciais
                : null;
            const recursos = this.getNestedRecord(mecanicas, 'recursos');
            const defesa = this.getNestedRecord(mecanicas, 'defesa');
            const inventario = this.getNestedRecord(mecanicas, 'inventario');
            const pvPorNivel = this.getNumberField(mecanicas, 'pvPorNivel');
            const peBase = this.getNumberField(recursos, 'peBase');
            const pePorNivelImpar = this.getNumberField(recursos, 'pePorNivelImpar');
            const limitePePorTurnoBonus = this.getNumberField(recursos, 'limitePePorTurnoBonus');
            const defesaBonus = this.getNumberField(defesa, 'bonus');
            const espacosExtra = this.getNumberField(inventario, 'espacosExtra');
            if (pvPorNivel !== null) {
                mods.pvPorNivelExtra += pvPorNivel;
            }
            if (peBase !== null) {
                mods.peBaseExtra += peBase;
            }
            if (pePorNivelImpar !== null) {
                const niveisImpares = Math.ceil(nivel / 2);
                mods.peBaseExtra += pePorNivelImpar * niveisImpares;
            }
            if (limitePePorTurnoBonus !== null) {
                mods.limitePeEaExtra += limitePePorTurnoBonus;
            }
            if (defesaBonus !== null) {
                mods.defesaExtra += defesaBonus;
            }
            if (espacosExtra !== null) {
                mods.espacosInventarioExtra += espacosExtra;
            }
        }
        return mods;
    }
    async executarEngine(dto, opts) {
        return (0, personagem_base_engine_1.calcularEstadoFinalPersonagemBase)({
            dto,
            strictPassivas: opts.strictPassivas,
            prisma: opts.prisma,
            personagemBaseId: opts.personagemBaseId,
            buscarHabilidadesPersonagem: (engineParams, prisma) => this.buscarHabilidadesPersonagem(engineParams, prisma),
            calcularModsDerivadosPorHabilidades: (habilidades, nivel) => this.calcularModificadoresDerivadosPorHabilidades(habilidades, nivel),
        });
    }
    montarDtoCompletoParaUpdate(existe, dto) {
        const patch = dto;
        const periciasClasseEscolhidasFinal = patch.periciasClasseEscolhidasCodigos ??
            this.jsonToStringArray(existe.periciasClasseEscolhidasCodigos);
        const periciasOrigemEscolhidasFinal = patch.periciasOrigemEscolhidasCodigos ??
            this.jsonToStringArray(existe.periciasOrigemEscolhidasCodigos);
        const periciasLivresFinal = patch.periciasLivresCodigos ??
            this.jsonToStringArray(existe.periciasLivresCodigos);
        const passivasAtributosAtivosFinal = (patch.passivasAtributosAtivos ??
            this.jsonToStringArray(existe.passivasAtributosAtivos));
        const passivasAtributosConfigRaw = patch.passivasAtributosConfig !== undefined
            ? patch.passivasAtributosConfig
            : (existe.passivasAtributosConfig ?? null);
        const passivasAtributosConfigFinal = this.limparUndefinedDeepJson(passivasAtributosConfigRaw ?? undefined);
        const poderesBancoNormalizados = this.getPoderesFromRelacao(existe.poderesGenericos).map((inst) => ({ ...inst, config: inst.config ?? {} }));
        const poderesPayloadNormalizados = this.getPoderesFromRelacao(patch.poderesGenericos).map((inst) => ({ ...inst, config: inst.config ?? {} }));
        const poderesFinal = patch.poderesGenericos !== undefined
            ? poderesPayloadNormalizados
            : poderesBancoNormalizados;
        const profsExtrasFinal = patch.proficienciasCodigos !== undefined
            ? patch.proficienciasCodigos
            : this.jsonToStringArray(existe.proficienciasExtrasCodigos);
        const grausAprimoramentoFinal = patch.grausAprimoramento !== undefined
            ? patch.grausAprimoramento
            : (existe.grausAprimoramento ?? []).map((g) => ({
                tipoGrauCodigo: g.tipoGrau.codigo,
                valor: g.valor,
            }));
        const grausTreinamentoFinal = patch.grausTreinamento !== undefined
            ? patch.grausTreinamento
            : (existe.grausTreinamento ?? []).reduce((acc, gt) => {
                const nivelExistente = acc.find((x) => x.nivel === gt.nivel);
                const melhoria = {
                    periciaCodigo: gt.periciaCodigo,
                    grauAnterior: gt.grauAnterior,
                    grauNovo: gt.grauNovo,
                };
                if (nivelExistente)
                    nivelExistente.melhorias.push(melhoria);
                else
                    acc.push({ nivel: gt.nivel, melhorias: [melhoria] });
                return acc;
            }, []);
        const dtoCompleto = {
            nome: patch.nome ?? existe.nome,
            nivel: patch.nivel ?? existe.nivel,
            claId: patch.claId ?? existe.claId,
            origemId: patch.origemId ?? existe.origemId,
            classeId: patch.classeId ?? existe.classeId,
            trilhaId: patch.trilhaId !== undefined ? patch.trilhaId : existe.trilhaId,
            caminhoId: patch.caminhoId !== undefined ? patch.caminhoId : existe.caminhoId,
            agilidade: patch.agilidade ?? existe.agilidade,
            forca: patch.forca ?? existe.forca,
            intelecto: patch.intelecto ?? existe.intelecto,
            presenca: patch.presenca ?? existe.presenca,
            vigor: patch.vigor ?? existe.vigor,
            estudouEscolaTecnica: patch.estudouEscolaTecnica ?? existe.estudouEscolaTecnica,
            idade: patch.idade !== undefined ? patch.idade : existe.idade,
            prestigioBase: patch.prestigioBase ?? existe.prestigioBase,
            prestigioClaBase: patch.prestigioClaBase !== undefined
                ? patch.prestigioClaBase
                : existe.prestigioClaBase,
            alinhamentoId: patch.alinhamentoId !== undefined
                ? patch.alinhamentoId
                : existe.alinhamentoId,
            background: patch.background !== undefined ? patch.background : existe.background,
            atributoChaveEa: patch.atributoChaveEa ?? existe.atributoChaveEa,
            tecnicaInataId: patch.tecnicaInataId !== undefined
                ? patch.tecnicaInataId
                : existe.tecnicaInataId,
            proficienciasCodigos: profsExtrasFinal ?? [],
            grausAprimoramento: grausAprimoramentoFinal ?? [],
            grausTreinamento: grausTreinamentoFinal ?? [],
            poderesGenericos: poderesFinal ?? [],
            passivasAtributoIds: patch.passivasAtributoIds ??
                this.getPassivasIdsFromRelacao(existe.passivas ?? []),
            passivasAtributosAtivos: passivasAtributosAtivosFinal ?? [],
            passivasAtributosConfig: passivasAtributosConfigFinal ?? undefined,
            periciasClasseEscolhidasCodigos: periciasClasseEscolhidasFinal ?? [],
            periciasOrigemEscolhidasCodigos: periciasOrigemEscolhidasFinal ?? [],
            periciasLivresCodigos: periciasLivresFinal ?? [],
            periciasLivresExtras: 0,
        };
        return dtoCompleto;
    }
    async calcularResumoInventario(personagemBaseId) {
        try {
            const personagem = await this.prisma.personagemBase.findUnique({
                where: { id: personagemBaseId },
                select: {
                    forca: true,
                    espacosInventarioBase: true,
                    espacosInventarioExtra: true,
                    espacosOcupados: true,
                    sobrecarregado: true,
                },
            });
            if (!personagem)
                return null;
            const quantidadeItens = await this.prisma.inventarioItemBase.count({
                where: { personagemBaseId },
            });
            const espacosTotal = personagem.espacosInventarioBase +
                (personagem.espacosInventarioExtra || 0);
            const espacosDisponiveis = espacosTotal - (personagem.espacosOcupados || 0);
            return {
                espacosBase: personagem.espacosInventarioBase,
                espacosExtra: personagem.espacosInventarioExtra || 0,
                espacosTotal,
                espacosOcupados: personagem.espacosOcupados || 0,
                espacosDisponiveis,
                sobrecarregado: personagem.sobrecarregado || false,
                quantidadeItens,
            };
        }
        catch (error) {
            console.error('[SERVICE] Erro ao calcular resumo de inventÃ¡rio:', error);
            return null;
        }
    }
    async preview(donoId, dto) {
        const dtoPreview = { ...dto };
        if (dto.periciasLivresExtras !== undefined) {
            dtoPreview.periciasLivresExtras = dto.periciasLivresExtras;
        }
        const estado = await this.executarEngine(dtoPreview, {
            strictPassivas: false,
            prisma: this.prisma,
        });
        const resistenciasArray = Array.from(estado.resistenciasFinais.entries()).map(([codigo, valor]) => ({ codigo, valor }));
        const codigosResistencia = resistenciasArray.map((r) => r.codigo);
        const [todasPericias, proficienciasDetalhadas, tiposGrau, tecnicasNaoInatas, tecnicaInata,] = await Promise.all([
            this.prisma.pericia.findMany(),
            this.prisma.proficiencia.findMany({
                where: { codigo: { in: estado.profsFinais } },
            }),
            this.prisma.tipoGrau.findMany({
                where: {
                    codigo: { in: estado.grausFinais.map((g) => g.tipoGrauCodigo) },
                },
            }),
            this.listarTecnicasNaoInatasAtivasPorGraus(estado.grausFinais, this.prisma),
            this.buscarTecnicaInataAtivaPorGraus(estado.dtoNormalizado.tecnicaInataId, estado.grausFinais, this.prisma),
        ]);
        const resistenciasTipos = codigosResistencia.length > 0
            ? await this.prisma.resistenciaTipo.findMany({
                where: { codigo: { in: codigosResistencia } },
                select: { codigo: true, nome: true, descricao: true },
            })
            : [];
        const mapaPericiasPorCodigo = new Map(todasPericias.map((p) => [p.codigo, p]));
        const periciasDetalhadas = Array.from(estado.periciasMapCodigo.entries()).map(([codigo, p]) => {
            const pericia = mapaPericiasPorCodigo.get(codigo);
            return {
                codigo,
                nome: pericia?.nome ?? '',
                atributoBase: pericia?.atributoBase ?? 'INT',
                grauTreinamento: p.grauTreinamento,
                bonusExtra: p.bonusExtra,
                bonusTotal: p.grauTreinamento * 5 + p.bonusExtra,
            };
        });
        const mapaTiposGrau = new Map(tiposGrau.map((t) => [t.codigo, t.nome]));
        const habilidadesNomes = estado.habilidades.map((h) => h.habilidade.nome);
        const mapaResistenciasTipo = new Map(resistenciasTipos.map((tipo) => [tipo.codigo, tipo]));
        const resistenciasComNomes = resistenciasArray.map((r) => {
            const tipo = mapaResistenciasTipo.get(r.codigo);
            return {
                codigo: r.codigo,
                nome: tipo?.nome ?? r.codigo,
                descricao: tipo?.descricao ?? null,
                valor: r.valor,
            };
        });
        const { itensValidados, errosItens } = await this.validarItensInventarioNoPreview(dto);
        return {
            ...estado.dtoNormalizado,
            proficienciasExtrasCodigos: estado.dtoNormalizado.proficienciasCodigos ?? [],
            passivasNeedsChoice: estado.passivasResolvidas.needsChoice,
            passivasElegiveis: estado.passivasResolvidas.elegiveis,
            passivasAtributosAtivos: estado.passivasResolvidas.ativos,
            passivasAtributoIds: estado.passivasResolvidas.passivaIds,
            passivasAtributosConfig: estado.dtoNormalizado.passivasAtributosConfig ?? {},
            poderesGenericos: estado.poderesGenericosNormalizados ?? [],
            pericias: periciasDetalhadas.filter((p) => p.grauTreinamento > 0),
            grausAprimoramento: estado.grausFinais.map((g) => ({
                tipoGrauCodigo: g.tipoGrauCodigo,
                tipoGrauNome: mapaTiposGrau.get(g.tipoGrauCodigo) ?? g.tipoGrauCodigo,
                valor: g.valor,
            })),
            proficiencias: proficienciasDetalhadas.map((p) => ({
                codigo: p.codigo,
                nome: p.nome,
                tipo: p.tipo,
                categoria: p.categoria,
                subtipo: p.subtipo,
            })),
            habilidadesAtivas: habilidadesNomes,
            bonusHabilidades: estado.bonusHabilidades,
            atributosDerivados: estado.derivadosFinais,
            tecnicasNaoInatas,
            tecnicaInata,
            grausLivresInfo: estado.grausLivresInfo,
            periciasLivresInfo: estado.periciasLivresInfo,
            espacosInventario: estado.espacosInventario,
            resistencias: resistenciasComNomes,
            itensInventario: itensValidados,
            errosItens: errosItens.length > 0 ? errosItens : undefined,
        };
    }
    async criar(donoId, dto) {
        const dtoSemItensInventario = this.removerItensInventarioDoDto(dto);
        const estado = await this.executarEngine(dtoSemItensInventario, {
            strictPassivas: true,
            prisma: this.prisma,
        });
        const dataBase = this.limparUndefined({
            ...estado.dtoNormalizado,
            proficienciasExtrasCodigos: dtoSemItensInventario.proficienciasCodigos ?? [],
            ...estado.derivadosFinais,
            espacosInventarioBase: estado.espacosInventario.base,
            espacosInventarioExtra: estado.espacosInventario.extra,
            espacosOcupados: 0,
            sobrecarregado: false,
        });
        const personagem = await this.prisma.$transaction(async (tx) => {
            const tecnicasNaoInatasAtivas = await this.listarTecnicasNaoInatasAtivasPorGraus(estado.grausFinais, tx);
            const personagemCriado = await this.persistence.criarComEstado({
                donoId,
                dataBase,
                estado: {
                    ...estado,
                    resistenciasFinais: estado.resistenciasFinais,
                    tecnicasNaoInatasIds: tecnicasNaoInatasAtivas.map((t) => t.id),
                },
            }, tx);
            if (dto.itensInventario && dto.itensInventario.length > 0) {
                for (const item of dto.itensInventario) {
                    await this.inventarioService.adicionarItem(donoId, {
                        personagemBaseId: personagemCriado.id,
                        equipamentoId: item.equipamentoId,
                        quantidade: item.quantidade,
                        equipado: item.equipado ?? false,
                        modificacoes: item.modificacoesIds ?? [],
                        nomeCustomizado: item.nomeCustomizado,
                        notas: item.notas,
                    }, {
                        tx,
                        skipOwnershipCheck: true,
                    });
                }
            }
            return personagemCriado;
        });
        return {
            id: personagem.id,
            nome: personagem.nome,
            nivel: personagem.nivel,
            cla: personagem.cla.nome,
            origem: personagem.origem.nome,
            classe: personagem.classe.nome,
            trilha: personagem.trilha?.nome ?? null,
            caminho: personagem.caminho?.nome ?? null,
        };
    }
    async listarDoUsuario(donoId, page, limit) {
        const where = { donoId };
        const include = { cla: true, classe: true };
        const orderBy = { nome: 'asc' };
        if (!page || !limit) {
            const lista = await this.prisma.personagemBase.findMany({
                where,
                include,
                orderBy,
            });
            return lista.map((p) => this.mapper.mapResumo(p));
        }
        const skip = (page - 1) * limit;
        const [items, total] = await Promise.all([
            this.prisma.personagemBase.findMany({
                where,
                include,
                orderBy,
                skip,
                take: limit,
            }),
            this.prisma.personagemBase.count({ where }),
        ]);
        return {
            items: items.map((p) => this.mapper.mapResumo(p)),
            total,
            page,
            limit,
            totalPages: Math.max(1, Math.ceil(total / limit)),
        };
    }
    async buscarPorId(donoId, id, incluirInventario = false) {
        const personagem = await this.prisma.personagemBase.findFirst({
            where: { id, donoId },
            include: personagem_base_mapper_1.personagemBaseDetalhadoInclude,
        });
        if (!personagem)
            throw new personagem_exception_1.PersonagemBaseNaoEncontradoException(id);
        const personagemDetalhado = await this.mapper.mapDetalhado(personagem, this.prisma);
        if (incluirInventario) {
            const resumoInventario = await this.calcularResumoInventario(id);
            if (resumoInventario) {
                personagemDetalhado.inventario = resumoInventario;
            }
        }
        return personagemDetalhado;
    }
    async exportar(donoId, id) {
        const personagem = await this.buscarPorId(donoId, id, true);
        const personagemParaExportar = {
            nome: personagem.nome,
            nivel: personagem.nivel,
            claId: personagem.claId,
            origemId: personagem.origemId,
            classeId: personagem.classeId,
            trilhaId: personagem.trilhaId ?? null,
            caminhoId: personagem.caminhoId ?? null,
            agilidade: personagem.agilidade,
            forca: personagem.forca,
            intelecto: personagem.intelecto,
            presenca: personagem.presenca,
            vigor: personagem.vigor,
            estudouEscolaTecnica: personagem.estudouEscolaTecnica,
            tecnicaInataId: personagem.tecnicaInataId ?? null,
            idade: personagem.idade ?? null,
            prestigioBase: personagem.prestigioBase ?? 0,
            prestigioClaBase: personagem.prestigioClaBase ?? null,
            alinhamentoId: personagem.alinhamentoId ?? null,
            background: personagem.background ?? null,
            atributoChaveEa: personagem.atributoChaveEa,
            proficienciasCodigos: personagem.proficienciasExtrasCodigos ?? [],
            grausAprimoramento: (personagem.grausAprimoramento ?? []).map((g) => {
                const valorLivre = typeof g.valorLivre === 'number'
                    ? g.valorLivre
                    : Math.max(0, (g.valorTotal ?? 0) - (g.bonus ?? 0));
                return {
                    tipoGrauCodigo: g.tipoGrauCodigo,
                    valor: valorLivre,
                };
            }),
            grausTreinamento: personagem.grausTreinamento ?? [],
            poderesGenericos: (personagem.poderesGenericos ?? []).map((p) => ({
                habilidadeId: p.habilidadeId,
                config: p.config ?? {},
            })),
            passivasAtributoIds: personagem.passivasAtributoIds ?? [],
            passivasAtributosAtivos: (personagem.passivasAtributosAtivos ??
                []),
            passivasAtributosConfig: (personagem.passivasAtributosConfig ??
                {}),
            periciasClasseEscolhidasCodigos: personagem.periciasClasseEscolhidasCodigos ?? [],
            periciasOrigemEscolhidasCodigos: personagem.periciasOrigemEscolhidasCodigos ?? [],
            periciasLivresCodigos: personagem.periciasLivresCodigos ?? [],
            periciasLivresExtras: 0,
            itensInventario: (personagem.itensInventario ?? []).map((item) => ({
                equipamentoId: item.equipamentoId,
                quantidade: item.quantidade,
                equipado: item.equipado ?? false,
                modificacoesIds: (item.modificacoes ?? []).map((mod) => mod.id),
                nomeCustomizado: item.nomeCustomizado ?? null,
                notas: item.notas ?? null,
            })),
        };
        return {
            schema: 'assistenterpg.personagem-base.v1',
            schemaVersion: 1,
            exportadoEm: new Date().toISOString(),
            personagem: personagemParaExportar,
            referencias: {
                personagemIdOriginal: personagem.id,
                cla: personagem.cla
                    ? { id: personagem.cla.id, nome: personagem.cla.nome }
                    : null,
                origem: personagem.origem
                    ? { id: personagem.origem.id, nome: personagem.origem.nome }
                    : null,
                classe: personagem.classe
                    ? { id: personagem.classe.id, nome: personagem.classe.nome }
                    : null,
                trilha: personagem.trilha
                    ? { id: personagem.trilha.id, nome: personagem.trilha.nome }
                    : null,
                caminho: personagem.caminho
                    ? { id: personagem.caminho.id, nome: personagem.caminho.nome }
                    : null,
                alinhamento: personagem.alinhamento
                    ? { id: personagem.alinhamento.id, nome: personagem.alinhamento.nome }
                    : null,
                tecnicaInata: personagem.tecnicaInata
                    ? {
                        id: personagem.tecnicaInata.id,
                        codigo: personagem.tecnicaInata.codigo,
                        nome: personagem.tecnicaInata.nome,
                    }
                    : null,
                poderesGenericos: (personagem.poderesGenericos ?? []).map((p, index) => ({
                    index,
                    habilidadeId: p.habilidadeId,
                    habilidadeNome: p.nome,
                })),
                passivas: (personagem.passivas ?? []).map((p, index) => ({
                    index,
                    passivaId: p.id,
                    codigo: p.codigo,
                    nome: p.nome,
                })),
                itensInventario: (personagem.itensInventario ?? []).map((item, index) => ({
                    index,
                    equipamentoId: item.equipamento?.id ?? item.equipamentoId,
                    equipamentoCodigo: item.equipamento?.codigo,
                    equipamentoNome: item.equipamento?.nome,
                    modificacoes: (item.modificacoes ?? []).map((mod, modIndex) => ({
                        index: modIndex,
                        modificacaoId: mod.id,
                        codigo: mod.codigo,
                        nome: mod.nome,
                    })),
                })),
            },
        };
    }
    async importar(donoId, dtoImportacao) {
        const dtoResolvido = await this.montarDtoParaImportacao(dtoImportacao);
        const criado = await this.criar(donoId, dtoResolvido);
        return {
            ...criado,
            importado: true,
            schema: dtoImportacao.schema ?? 'assistenterpg.personagem-base.v1',
            schemaVersion: dtoImportacao.schemaVersion ?? 1,
            importadoEm: new Date().toISOString(),
        };
    }
    async atualizar(donoId, id, dto) {
        const existe = await this.prisma.personagemBase.findFirst({
            where: { id, donoId },
            include: personagem_base_mapper_1.personagemBaseDetalhadoInclude,
        });
        if (!existe)
            throw new personagem_exception_1.PersonagemBaseNaoEncontradoException(id);
        const dtoCompleto = this.montarDtoCompletoParaUpdate(existe, dto);
        await (0, regras_trilha_1.validarTrilhaECaminho)(dtoCompleto.classeId, dtoCompleto.trilhaId, dtoCompleto.caminhoId, undefined, this.prisma);
        await (0, regras_origem_cla_1.validarOrigemClaTecnica)(dtoCompleto.claId, dtoCompleto.origemId, dtoCompleto.tecnicaInataId, this.prisma);
        const atualizado = await this.prisma.$transaction(async (tx) => {
            const estado = await this.executarEngine(dtoCompleto, {
                strictPassivas: true,
                prisma: tx,
                personagemBaseId: id,
            });
            const tecnicasNaoInatasAtivas = await this.listarTecnicasNaoInatasAtivasPorGraus(estado.grausFinais, tx);
            const dataUpdateBase = this.limparUndefined({
                nome: estado.dtoNormalizado.nome,
                nivel: estado.dtoNormalizado.nivel,
                claId: estado.dtoNormalizado.claId,
                origemId: estado.dtoNormalizado.origemId,
                classeId: estado.dtoNormalizado.classeId,
                trilhaId: estado.dtoNormalizado.trilhaId ?? null,
                caminhoId: estado.dtoNormalizado.caminhoId ?? null,
                agilidade: estado.dtoNormalizado.agilidade,
                forca: estado.dtoNormalizado.forca,
                intelecto: estado.dtoNormalizado.intelecto,
                presenca: estado.dtoNormalizado.presenca,
                vigor: estado.dtoNormalizado.vigor,
                estudouEscolaTecnica: estado.dtoNormalizado.estudouEscolaTecnica,
                tecnicaInataId: estado.dtoNormalizado.tecnicaInataId ?? null,
                idade: estado.dtoNormalizado.idade ?? null,
                prestigioBase: estado.dtoNormalizado.prestigioBase ?? null,
                prestigioClaBase: estado.dtoNormalizado.prestigioClaBase ?? null,
                alinhamentoId: estado.dtoNormalizado.alinhamentoId ?? null,
                background: estado.dtoNormalizado.background ?? null,
                atributoChaveEa: estado.dtoNormalizado.atributoChaveEa,
                pvMaximo: estado.derivadosFinais.pvMaximo,
                peMaximo: estado.derivadosFinais.peMaximo,
                eaMaximo: estado.derivadosFinais.eaMaximo,
                sanMaximo: estado.derivadosFinais.sanMaximo,
                defesaBase: estado.derivadosFinais.defesaBase,
                defesaEquipamento: estado.derivadosFinais.defesaEquipamento,
                defesa: estado.derivadosFinais.defesaTotal,
                deslocamento: estado.derivadosFinais.deslocamento,
                limitePeEaPorTurno: estado.derivadosFinais.limitePeEaPorTurno,
                reacoesBasePorTurno: estado.derivadosFinais.reacoesBasePorTurno,
                turnosMorrendo: estado.derivadosFinais.turnosMorrendo,
                turnosEnlouquecendo: estado.derivadosFinais.turnosEnlouquecendo,
                bloqueio: estado.derivadosFinais.bloqueio,
                esquiva: estado.derivadosFinais.esquiva,
                espacosInventarioBase: estado.espacosInventario.base,
                espacosInventarioExtra: estado.espacosInventario.extra,
                passivasAtributosAtivos: estado.passivasResolvidas.ativos,
                passivasAtributosConfig: estado.passivasAtributosConfigLimpo ?? undefined,
                proficienciasExtrasCodigos: dtoCompleto.proficienciasCodigos ?? [],
                periciasClasseEscolhidasCodigos: estado.dtoNormalizado.periciasClasseEscolhidasCodigos ?? [],
                periciasOrigemEscolhidasCodigos: estado.dtoNormalizado.periciasOrigemEscolhidasCodigos ?? [],
                periciasLivresCodigos: estado.dtoNormalizado.periciasLivresCodigos ?? [],
            });
            const resultado = await this.persistence.atualizarRebuildComEstado({
                id,
                dataUpdateBase,
                estado: {
                    ...estado,
                    resistenciasFinais: estado.resistenciasFinais,
                    tecnicasNaoInatasIds: tecnicasNaoInatasAtivas.map((t) => t.id),
                },
            }, tx);
            await this.sincronizarItensInventarioNoUpdate(donoId, id, dto.itensInventario, tx);
            return resultado;
        });
        if (!atualizado) {
            throw new personagem_exception_1.ErroAtualizacaoPersonagemException();
        }
        return this.mapper.mapResumo(atualizado);
    }
    async remover(donoId, id) {
        const existe = await this.prisma.personagemBase.findFirst({
            where: { id, donoId },
        });
        if (!existe)
            throw new personagem_exception_1.PersonagemBaseNaoEncontradoException(id);
        await this.prisma.inventarioItemBaseModificacao.deleteMany({
            where: {
                item: {
                    personagemBaseId: id,
                },
            },
        });
        await this.prisma.inventarioItemBase.deleteMany({
            where: { personagemBaseId: id },
        });
        await this.prisma.personagemCampanha.deleteMany({
            where: { personagemBaseId: id },
        });
        await this.prisma.habilidadePersonagemBase.deleteMany({
            where: { personagemBaseId: id },
        });
        await this.prisma.poderGenericoPersonagemBase.deleteMany({
            where: { personagemBaseId: id },
        });
        await this.prisma.personagemBaseProficiencia.deleteMany({
            where: { personagemBaseId: id },
        });
        await this.prisma.personagemBasePericia.deleteMany({
            where: { personagemBaseId: id },
        });
        await this.prisma.grauPersonagemBase.deleteMany({
            where: { personagemBaseId: id },
        });
        await this.prisma.grauTreinamentoPersonagemBase.deleteMany({
            where: { personagemBaseId: id },
        });
        await this.prisma.personagemBasePassiva.deleteMany({
            where: { personagemBaseId: id },
        });
        await this.prisma.personagemBaseResistencia.deleteMany({
            where: { personagemBaseId: id },
        });
        await this.prisma.personagemBase.delete({ where: { id } });
        return { sucesso: true };
    }
    consultarInfoGrausTreinamento(nivel, intelecto) {
        const niveisValidos = [3, 7, 11, 16];
        const niveisDisponiveis = niveisValidos
            .filter((n) => nivel >= n)
            .map((n) => ({ nivel: n, maxMelhorias: 2 + intelecto }));
        return {
            niveisDisponiveis,
            limitesGrau: { graduado: 3, veterano: 9, expert: 16 },
        };
    }
    async consultarPericiasElegiveis(periciasComGrauInicial) {
        if (!periciasComGrauInicial || periciasComGrauInicial.length === 0)
            return [];
        const pericias = await this.prisma.pericia.findMany({
            where: { codigo: { in: periciasComGrauInicial } },
        });
        return pericias.map((p) => ({
            codigo: p.codigo,
            nome: p.nome,
            atributoBase: p.atributoBase,
            grauAtual: 5,
        }));
    }
    async listarTecnicasDisponveis(claId, origemId) {
        const origem = origemId
            ? await this.prisma.origem.findUnique({
                where: { id: origemId },
                select: {
                    bloqueiaTecnicaHeriditaria: true,
                },
            })
            : null;
        const tecnicasHereditarias = await this.prisma.tecnicaAmaldicoada.findMany({
            where: {
                tipo: 'INATA',
                hereditaria: true,
                clas: {
                    some: { claId },
                },
            },
            select: {
                id: true,
                codigo: true,
                nome: true,
                descricao: true,
                hereditaria: true,
                linkExterno: true,
            },
            orderBy: { nome: 'asc' },
        });
        const tecnicasNaoHereditarias = await this.prisma.tecnicaAmaldicoada.findMany({
            where: {
                tipo: 'INATA',
                hereditaria: false,
            },
            select: {
                id: true,
                codigo: true,
                nome: true,
                descricao: true,
                hereditaria: true,
                linkExterno: true,
            },
            orderBy: { nome: 'asc' },
        });
        let tecnicasDisponiveis = [
            ...tecnicasHereditarias,
            ...tecnicasNaoHereditarias,
        ];
        if (origem?.bloqueiaTecnicaHeriditaria) {
            tecnicasDisponiveis = tecnicasDisponiveis.filter((t) => !t.hereditaria);
        }
        return {
            hereditarias: tecnicasDisponiveis.filter((t) => t.hereditaria),
            naoHereditarias: tecnicasDisponiveis.filter((t) => !t.hereditaria),
            todas: tecnicasDisponiveis,
        };
    }
    async listarPassivasDisponiveis() {
        const passivas = await this.prisma.passivaAtributo.findMany({
            orderBy: [{ atributo: 'asc' }, { nivel: 'asc' }],
        });
        const porAtributo = passivas.reduce((acc, p) => {
            if (!acc[p.atributo])
                acc[p.atributo] = [];
            acc[p.atributo].push({
                id: p.id,
                codigo: p.codigo,
                nome: p.nome,
                nivel: p.nivel,
                requisito: p.requisito,
                descricao: p.descricao,
                efeitos: p.efeitos,
            });
            return acc;
        }, {});
        return porAtributo;
    }
};
exports.PersonagemBaseService = PersonagemBaseService;
exports.PersonagemBaseService = PersonagemBaseService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        personagem_base_mapper_1.PersonagemBaseMapper,
        personagem_base_persistence_1.PersonagemBasePersistence,
        inventario_service_1.InventarioService])
], PersonagemBaseService);
//# sourceMappingURL=personagem-base.service.js.map