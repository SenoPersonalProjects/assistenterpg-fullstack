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
const personagem_base_engine_1 = require("./engine/personagem-base.engine");
const personagem_base_mapper_1 = require("./personagem-base.mapper");
const personagem_base_persistence_1 = require("./personagem-base.persistence");
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
        return JSON.parse(JSON.stringify(value));
    }
    async buscarHabilidadesPersonagem(params, prisma = this.prisma) {
        const { nivel, origemId, classeId, trilhaId, caminhoId, tecnicaInataId, estudouEscolaTecnica, poderesGenericos, } = params;
        const habilidades = [];
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
            habilidade: ho.habilidade,
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
                habilidade: recursoClasse.habilidade,
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
            habilidade: hc.habilidade,
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
                habilidade: ht.habilidade,
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
                habilidade: ht.habilidade,
            })));
        }
        if (tecnicaInataId) {
            const tecnicaInata = await prisma.tecnicaAmaldicoada.findUnique({
                where: { id: tecnicaInataId },
                select: {
                    id: true,
                    nome: true,
                    tipo: true,
                },
            });
            if (tecnicaInata) {
                habilidades.push({
                    habilidadeId: tecnicaInata.id,
                    habilidade: {
                        nome: tecnicaInata.nome,
                        tipo: tecnicaInata.tipo,
                        mecanicasEspeciais: null,
                        efeitosGrau: [],
                    },
                });
            }
        }
        if (estudouEscolaTecnica) {
            const escolaTecnica = await prisma.habilidade.findUnique({
                where: { nome: 'Escola Técnica' },
                include: { efeitosGrau: true },
            });
            if (escolaTecnica) {
                habilidades.push({
                    habilidadeId: escolaTecnica.id,
                    habilidade: escolaTecnica,
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
                    habilidade: poder,
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
            const m = h.habilidade.mecanicasEspeciais;
            if (m?.pvPorNivel && typeof m.pvPorNivel === 'number') {
                mods.pvPorNivelExtra += m.pvPorNivel;
            }
            if (m?.recursos) {
                if (typeof m.recursos.peBase === 'number') {
                    mods.peBaseExtra += m.recursos.peBase;
                }
                if (typeof m.recursos.pePorNivelImpar === 'number') {
                    const niveisImpares = Math.ceil(nivel / 2);
                    mods.peBaseExtra += m.recursos.pePorNivelImpar * niveisImpares;
                }
                if (typeof m.recursos.limitePePorTurnoBonus === 'number') {
                    mods.limitePeEaExtra += m.recursos.limitePePorTurnoBonus;
                }
            }
            if (m?.defesa?.bonus && typeof m.defesa.bonus === 'number') {
                mods.defesaExtra += m.defesa.bonus;
            }
            if (m?.inventario?.espacosExtra && typeof m.inventario.espacosExtra === 'number') {
                mods.espacosInventarioExtra += m.inventario.espacosExtra;
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
            buscarHabilidadesPersonagem: this.buscarHabilidadesPersonagem.bind(this),
            calcularModsDerivadosPorHabilidades: this.calcularModificadoresDerivadosPorHabilidades.bind(this),
        });
    }
    montarDtoCompletoParaUpdate(existe, dto) {
        const patch = dto;
        const periciasClasseEscolhidasFinal = patch.periciasClasseEscolhidasCodigos ??
            this.jsonToStringArray(existe.periciasClasseEscolhidasCodigos);
        const periciasOrigemEscolhidasFinal = patch.periciasOrigemEscolhidasCodigos ??
            this.jsonToStringArray(existe.periciasOrigemEscolhidasCodigos);
        const periciasLivresFinal = patch.periciasLivresCodigos ?? this.jsonToStringArray(existe.periciasLivresCodigos);
        const passivasAtributosAtivosFinal = patch.passivasAtributosAtivos ??
            this.jsonToStringArray(existe.passivasAtributosAtivos);
        const passivasAtributosConfigRaw = patch.passivasAtributosConfig !== undefined
            ? patch.passivasAtributosConfig
            : (existe.passivasAtributosConfig ?? null);
        const passivasAtributosConfigFinal = this.limparUndefinedDeepJson(passivasAtributosConfigRaw ?? undefined);
        const poderesBancoNormalizados = this.getPoderesFromRelacao(existe.poderesGenericos).map((inst) => ({ ...inst, config: inst.config ?? {} }));
        const poderesFinal = patch.poderesGenericos !== undefined
            ? patch.poderesGenericos.map((inst) => ({
                ...inst,
                config: inst.config ?? {},
            }))
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
            prestigioClaBase: patch.prestigioClaBase !== undefined ? patch.prestigioClaBase : existe.prestigioClaBase,
            alinhamentoId: patch.alinhamentoId !== undefined ? patch.alinhamentoId : existe.alinhamentoId,
            background: patch.background !== undefined ? patch.background : existe.background,
            atributoChaveEa: (patch.atributoChaveEa ?? existe.atributoChaveEa),
            tecnicaInataId: patch.tecnicaInataId !== undefined ? patch.tecnicaInataId : existe.tecnicaInataId,
            proficienciasCodigos: profsExtrasFinal ?? [],
            grausAprimoramento: grausAprimoramentoFinal ?? [],
            grausTreinamento: grausTreinamentoFinal ?? [],
            poderesGenericos: poderesFinal ?? [],
            passivasAtributoIds: patch.passivasAtributoIds ?? this.getPassivasIdsFromRelacao(existe.passivas ?? []),
            passivasAtributosAtivos: passivasAtributosAtivosFinal ?? [],
            passivasAtributosConfig: (passivasAtributosConfigFinal ?? {}),
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
            const itens = await this.prisma.inventarioItemBase.findMany({
                where: { personagemBaseId },
                select: { id: true },
            });
            const espacosTotal = personagem.espacosInventarioBase + (personagem.espacosInventarioExtra || 0);
            const espacosDisponiveis = espacosTotal - (personagem.espacosOcupados || 0);
            return {
                espacosBase: personagem.espacosInventarioBase,
                espacosExtra: personagem.espacosInventarioExtra || 0,
                espacosTotal,
                espacosOcupados: personagem.espacosOcupados || 0,
                espacosDisponiveis,
                sobrecarregado: personagem.sobrecarregado || false,
                quantidadeItens: itens.length,
            };
        }
        catch (error) {
            console.error('[SERVICE] Erro ao calcular resumo de inventário:', error);
            return null;
        }
    }
    async preview(donoId, dto) {
        const patch = dto;
        const dtoPreview = { ...dto };
        if (patch.periciasLivresExtras !== undefined) {
            dtoPreview.periciasLivresExtras = patch.periciasLivresExtras;
        }
        const estado = await this.executarEngine(dtoPreview, {
            strictPassivas: false,
            prisma: this.prisma,
        });
        const todasPericias = await this.prisma.pericia.findMany();
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
        const proficienciasDetalhadas = await this.prisma.proficiencia.findMany({
            where: { codigo: { in: estado.profsFinais } },
        });
        const tiposGrau = await this.prisma.tipoGrau.findMany({
            where: { codigo: { in: estado.grausFinais.map((g) => g.tipoGrauCodigo) } },
        });
        const mapaTiposGrau = new Map(tiposGrau.map((t) => [t.codigo, t.nome]));
        const habilidadesNomes = estado.habilidades.map((h) => h.habilidade.nome);
        const resistenciasArray = Array.from(estado.resistenciasFinais.entries()).map(([codigo, valor]) => ({ codigo, valor }));
        const resistenciasComNomes = resistenciasArray.length > 0
            ? await Promise.all(resistenciasArray.map(async (r) => {
                const tipo = await this.prisma.resistenciaTipo.findUnique({
                    where: { codigo: r.codigo },
                    select: { nome: true, descricao: true },
                });
                return {
                    codigo: r.codigo,
                    nome: tipo?.nome ?? r.codigo,
                    descricao: tipo?.descricao ?? null,
                    valor: r.valor,
                };
            }))
            : [];
        let itensValidados = [];
        let errosItens = [];
        if (dto.itensInventario && dto.itensInventario.length > 0) {
            for (const item of dto.itensInventario) {
                try {
                    const previewItem = await this.inventarioService.previewItensInventario({
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
                    });
                    itensValidados.push(previewItem.itens[0]);
                }
                catch (error) {
                    errosItens.push({
                        equipamentoId: item.equipamentoId,
                        erro: error.message,
                    });
                }
            }
        }
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
            grausLivresInfo: estado.grausLivresInfo,
            periciasLivresInfo: estado.periciasLivresInfo,
            espacosInventario: estado.espacosInventario,
            resistencias: resistenciasComNomes,
            itensInventario: itensValidados,
            errosItens: errosItens.length > 0 ? errosItens : undefined,
        };
    }
    async criar(donoId, dto) {
        const estado = await this.executarEngine(dto, {
            strictPassivas: true,
            prisma: this.prisma,
        });
        const dataBase = this.limparUndefined({
            ...estado.dtoNormalizado,
            proficienciasExtrasCodigos: dto.proficienciasCodigos ?? [],
            ...estado.derivadosFinais,
            espacosInventarioBase: estado.espacosInventario.base,
            espacosInventarioExtra: estado.espacosInventario.extra,
            espacosOcupados: 0,
            sobrecarregado: false,
        });
        const personagem = await this.prisma.$transaction(async (tx) => {
            const personagemCriado = await this.persistence.criarComEstado({
                donoId,
                dataBase,
                estado: {
                    ...estado,
                    resistenciasFinais: estado.resistenciasFinais,
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
    async listarDoUsuario(donoId) {
        const lista = await this.prisma.personagemBase.findMany({
            where: { donoId },
            include: { cla: true, classe: true },
            orderBy: { nome: 'asc' },
        });
        return lista.map((p) => this.mapper.mapResumo(p));
    }
    async buscarPorId(donoId, id, incluirInventario = false) {
        const personagem = await this.prisma.personagemBase.findFirst({
            where: { id, donoId },
            include: {
                cla: true,
                origem: true,
                classe: true,
                trilha: true,
                caminho: true,
                tecnicaInata: true,
                alinhamento: true,
                proficiencias: { include: { proficiencia: true } },
                grausAprimoramento: {
                    include: {
                        tipoGrau: true,
                    },
                },
                pericias: { include: { pericia: true } },
                grausTreinamento: true,
                habilidadesBase: { include: { habilidade: true } },
                passivas: { include: { passiva: true } },
                poderesGenericos: { include: { habilidade: true } },
                resistencias: {
                    include: {
                        resistenciaTipo: true,
                    },
                },
            },
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
    async atualizar(donoId, id, dto) {
        const existe = await this.prisma.personagemBase.findFirst({
            where: { id, donoId },
            include: {
                proficiencias: { include: { proficiencia: true } },
                grausAprimoramento: { include: { tipoGrau: true } },
                pericias: { include: { pericia: true } },
                grausTreinamento: true,
                habilidadesBase: {
                    include: {
                        habilidade: {
                            include: { efeitosGrau: true },
                        },
                    },
                },
                passivas: { include: { passiva: true } },
                poderesGenericos: {
                    include: {
                        habilidade: {
                            include: { efeitosGrau: true },
                        },
                    },
                },
                cla: true,
                classe: true,
                origem: true,
                trilha: true,
                caminho: true,
            },
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
                },
            }, tx);
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
        await this.prisma.personagemCampanha.deleteMany({ where: { personagemBaseId: id } });
        await this.prisma.habilidadePersonagemBase.deleteMany({ where: { personagemBaseId: id } });
        await this.prisma.poderGenericoPersonagemBase.deleteMany({ where: { personagemBaseId: id } });
        await this.prisma.personagemBaseProficiencia.deleteMany({ where: { personagemBaseId: id } });
        await this.prisma.personagemBasePericia.deleteMany({ where: { personagemBaseId: id } });
        await this.prisma.grauPersonagemBase.deleteMany({ where: { personagemBaseId: id } });
        await this.prisma.grauTreinamentoPersonagemBase.deleteMany({
            where: { personagemBaseId: id },
        });
        await this.prisma.personagemBasePassiva.deleteMany({ where: { personagemBaseId: id } });
        await this.prisma.personagemBaseResistencia.deleteMany({ where: { personagemBaseId: id } });
        await this.prisma.personagemBase.delete({ where: { id } });
        return { sucesso: true };
    }
    async consultarInfoGrausTreinamento(nivel, intelecto) {
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
        let tecnicasDisponiveis = [...tecnicasHereditarias, ...tecnicasNaoHereditarias];
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