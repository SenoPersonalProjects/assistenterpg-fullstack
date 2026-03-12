"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PersonagemBaseMapper = exports.personagemBaseDetalhadoInclude = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const regras_tecnicas_nao_inatas_1 = require("./regras-criacao/regras-tecnicas-nao-inatas");
exports.personagemBaseDetalhadoInclude = client_1.Prisma.validator()({
    cla: true,
    origem: true,
    classe: true,
    trilha: true,
    caminho: true,
    tecnicaInata: {
        include: {
            habilidades: {
                include: {
                    variacoes: {
                        orderBy: { ordem: 'asc' },
                    },
                },
                orderBy: { ordem: 'asc' },
            },
        },
    },
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
    tecnicasAprendidas: {
        include: {
            tecnica: {
                include: {
                    habilidades: {
                        include: {
                            variacoes: {
                                orderBy: { ordem: 'asc' },
                            },
                        },
                        orderBy: { ordem: 'asc' },
                    },
                },
            },
        },
    },
    resistencias: {
        include: {
            resistenciaTipo: true,
        },
    },
});
const inventarioItemDetalhadoInclude = client_1.Prisma.validator()({
    equipamento: true,
    modificacoes: {
        include: {
            modificacao: true,
        },
    },
});
let PersonagemBaseMapper = class PersonagemBaseMapper {
    isJsonObject(value) {
        return typeof value === 'object' && value !== null && !Array.isArray(value);
    }
    hasTipoGrauChoice(value) {
        if (!this.isJsonObject(value))
            return false;
        const escolha = value.escolha;
        if (!this.isJsonObject(escolha))
            return false;
        return escolha.tipo === 'TIPO_GRAU';
    }
    getTipoGrauCodigoConfig(value) {
        if (!this.isJsonObject(value))
            return null;
        const codigo = value.tipoGrauCodigo;
        if (typeof codigo !== 'string' || codigo.trim().length === 0)
            return null;
        return codigo;
    }
    jsonToStringArray(value) {
        if (!Array.isArray(value))
            return [];
        return value.filter((v) => typeof v === 'string');
    }
    mapResumo(personagem) {
        return {
            id: personagem.id,
            nome: personagem.nome,
            nivel: personagem.nivel,
            cla: personagem.cla.nome,
            classe: personagem.classe.nome,
        };
    }
    async mapDetalhado(personagem, prisma) {
        const bonusDeHabilidades = await this.calcularBonusGrausDeHabilidades(personagem, prisma);
        const grausAprimoramentoAjustados = (personagem.grausAprimoramento ?? [])
            .map((g) => {
            const valorDB = g.valor;
            const codigo = g.tipoGrau?.codigo;
            if (!codigo) {
                console.warn('[MAPPER] Grau sem tipoGrau.codigo:', g);
                return null;
            }
            const bonus = bonusDeHabilidades.get(codigo) ?? 0;
            const valorLivre = Math.max(0, valorDB - bonus);
            return {
                tipoGrauCodigo: codigo,
                tipoGrauNome: g.tipoGrau?.nome ?? '',
                valorTotal: valorDB,
                valorLivre,
                bonus,
            };
        })
            .filter((g) => g !== null);
        const espacosInventario = {
            base: personagem.espacosInventarioBase ?? personagem.forca * 5,
            extra: personagem.espacosInventarioExtra ?? 0,
            total: (personagem.espacosInventarioBase ?? personagem.forca * 5) +
                (personagem.espacosInventarioExtra ?? 0),
        };
        const itensInventario = await this.mapItensInventario(personagem.id, prisma);
        const espacosOcupados = itensInventario.reduce((total, item) => {
            return total + item.espacosCalculados * item.quantidade;
        }, 0);
        const sobrecarregado = espacosOcupados > espacosInventario.total;
        const resistencias = (personagem.resistencias ?? []).map((r) => ({
            codigo: r.resistenciaTipo.codigo,
            nome: r.resistenciaTipo.nome,
            descricao: r.resistenciaTipo.descricao,
            valor: r.valor,
        }));
        const grausMap = (0, regras_tecnicas_nao_inatas_1.montarMapaGraus)(grausAprimoramentoAjustados.map((g) => ({
            tipoGrauCodigo: g.tipoGrauCodigo,
            valor: g.valorTotal,
        })));
        const mapTecnicaDetalhada = (tecnica) => ({
            id: tecnica.id,
            codigo: tecnica.codigo,
            nome: tecnica.nome,
            descricao: tecnica.descricao,
            tipo: tecnica.tipo,
            hereditaria: tecnica.hereditaria,
            linkExterno: tecnica.linkExterno,
            requisitos: tecnica.requisitos,
            fonte: tecnica.fonte,
            suplementoId: tecnica.suplementoId,
            habilidades: (tecnica.habilidades ?? [])
                .filter((habilidade) => (0, regras_tecnicas_nao_inatas_1.atendeRequisitosGraus)(habilidade.requisitos, grausMap))
                .map((habilidade) => ({
                id: habilidade.id,
                tecnicaId: habilidade.tecnicaId,
                codigo: habilidade.codigo,
                nome: habilidade.nome,
                descricao: habilidade.descricao,
                requisitos: habilidade.requisitos,
                execucao: habilidade.execucao,
                area: habilidade.area,
                alcance: habilidade.alcance,
                alvo: habilidade.alvo,
                duracao: habilidade.duracao,
                custoPE: habilidade.custoPE,
                custoEA: habilidade.custoEA,
                danoFlat: habilidade.danoFlat,
                danoFlatTipo: habilidade.danoFlatTipo,
                efeito: habilidade.efeito,
                ordem: habilidade.ordem,
                variacoes: (habilidade.variacoes ?? [])
                    .filter((variacao) => (0, regras_tecnicas_nao_inatas_1.atendeRequisitosGraus)(variacao.requisitos, grausMap))
                    .map((variacao) => ({
                    id: variacao.id,
                    habilidadeTecnicaId: variacao.habilidadeTecnicaId,
                    nome: variacao.nome,
                    descricao: variacao.descricao,
                    substituiCustos: variacao.substituiCustos,
                    custoPE: variacao.custoPE,
                    custoEA: variacao.custoEA,
                    execucao: variacao.execucao,
                    area: variacao.area,
                    alcance: variacao.alcance,
                    alvo: variacao.alvo,
                    duracao: variacao.duracao,
                    resistencia: variacao.resistencia,
                    dtResistencia: variacao.dtResistencia,
                    criticoValor: variacao.criticoValor,
                    criticoMultiplicador: variacao.criticoMultiplicador,
                    danoFlat: variacao.danoFlat,
                    danoFlatTipo: variacao.danoFlatTipo,
                    dadosDano: variacao.dadosDano,
                    escalonaPorGrau: variacao.escalonaPorGrau,
                    escalonamentoCustoEA: variacao.escalonamentoCustoEA,
                    escalonamentoDano: variacao.escalonamentoDano,
                    efeitoAdicional: variacao.efeitoAdicional,
                    requisitos: variacao.requisitos,
                    ordem: variacao.ordem,
                })),
            })),
        });
        const tecnicasNaoInatas = (personagem.tecnicasAprendidas ?? [])
            .map((relacao) => relacao.tecnica)
            .filter((tecnica) => tecnica.tipo === 'NAO_INATA')
            .sort((a, b) => a.nome.localeCompare(b.nome))
            .map(mapTecnicaDetalhada);
        const tecnicaInataDetalhada = personagem.tecnicaInata ? mapTecnicaDetalhada(personagem.tecnicaInata) : null;
        return {
            id: personagem.id,
            nome: personagem.nome,
            nivel: personagem.nivel,
            claId: personagem.claId,
            origemId: personagem.origemId,
            classeId: personagem.classeId,
            trilhaId: personagem.trilhaId,
            caminhoId: personagem.caminhoId,
            agilidade: personagem.agilidade,
            forca: personagem.forca,
            intelecto: personagem.intelecto,
            presenca: personagem.presenca,
            vigor: personagem.vigor,
            estudouEscolaTecnica: personagem.estudouEscolaTecnica,
            tecnicaInataId: personagem.tecnicaInataId,
            idade: personagem.idade,
            prestigioBase: personagem.prestigioBase,
            prestigioClaBase: personagem.prestigioClaBase,
            alinhamentoId: personagem.alinhamentoId,
            background: personagem.background,
            atributoChaveEa: personagem.atributoChaveEa,
            proficienciasExtrasCodigos: this.jsonToStringArray(personagem.proficienciasExtrasCodigos),
            periciasClasseEscolhidasCodigos: this.jsonToStringArray(personagem.periciasClasseEscolhidasCodigos),
            periciasOrigemEscolhidasCodigos: this.jsonToStringArray(personagem.periciasOrigemEscolhidasCodigos),
            periciasLivresCodigos: this.jsonToStringArray(personagem.periciasLivresCodigos),
            cla: personagem.cla,
            origem: personagem.origem,
            classe: personagem.classe,
            trilha: personagem.trilha,
            caminho: personagem.caminho,
            alinhamento: personagem.alinhamento,
            tecnicaInata: tecnicaInataDetalhada,
            proficiencias: (personagem.proficiencias ?? []).map((pp) => ({
                id: pp.proficiencia.id,
                codigo: pp.proficiencia.codigo,
                nome: pp.proficiencia.nome,
                tipo: pp.proficiencia.tipo,
                categoria: pp.proficiencia.categoria,
                subtipo: pp.proficiencia.subtipo,
            })),
            grausAprimoramento: grausAprimoramentoAjustados,
            pericias: (personagem.pericias ?? []).map((p) => ({
                id: p.pericia.id,
                codigo: p.pericia.codigo,
                nome: p.pericia.nome,
                atributoBase: p.pericia.atributoBase,
                somenteTreinada: p.pericia.somenteTreinada,
                penalizaPorCarga: p.pericia.penalizaPorCarga,
                precisaKit: p.pericia.precisaKit,
                grauTreinamento: p.grauTreinamento,
                bonusExtra: p.bonusExtra,
                bonusTotal: p.grauTreinamento * 5 + p.bonusExtra,
            })),
            grausTreinamento: (personagem.grausTreinamento ?? []).reduce((acc, gt) => {
                const nivelExistente = acc.find((g) => g.nivel === gt.nivel);
                const melhoria = {
                    periciaCodigo: gt.periciaCodigo,
                    grauAnterior: gt.grauAnterior,
                    grauNovo: gt.grauNovo,
                };
                if (nivelExistente) {
                    nivelExistente.melhorias.push(melhoria);
                }
                else {
                    acc.push({ nivel: gt.nivel, melhorias: [melhoria] });
                }
                return acc;
            }, []),
            habilidades: (personagem.habilidadesBase ?? []).map((hab) => ({
                id: hab.habilidade.id,
                nome: hab.habilidade.nome,
                tipo: hab.habilidade.tipo,
                descricao: hab.habilidade.descricao,
            })),
            poderesGenericos: (personagem.poderesGenericos ?? []).map((p) => ({
                id: p.id,
                habilidadeId: p.habilidadeId,
                nome: p.habilidade.nome,
                config: p.config ?? {},
            })),
            poderesGenericosSelecionadosIds: (personagem.poderesGenericos ?? []).map((p) => p.habilidadeId),
            passivasAtributosAtivos: this.jsonToStringArray(personagem.passivasAtributosAtivos),
            passivasAtributosConfig: personagem.passivasAtributosConfig ?? null,
            passivasAtributoIds: (personagem.passivas ?? []).map((p) => p.passiva.id),
            passivas: (personagem.passivas ?? []).map((p) => ({
                id: p.passiva.id,
                codigo: p.passiva.codigo,
                nome: p.passiva.nome,
                atributo: p.passiva.atributo,
                nivel: p.passiva.nivel,
                descricao: p.passiva.descricao,
                efeitos: p.passiva.efeitos,
            })),
            atributosDerivados: {
                pvMaximo: personagem.pvMaximo,
                peMaximo: personagem.peMaximo,
                eaMaximo: personagem.eaMaximo,
                sanMaximo: personagem.sanMaximo,
                defesaBase: personagem.defesaBase ?? 10,
                defesaEquipamento: personagem.defesaEquipamento ?? 0,
                defesaTotal: (personagem.defesaBase ?? 10) + (personagem.defesaEquipamento ?? 0),
                deslocamento: personagem.deslocamento,
                limitePeEaPorTurno: personagem.limitePeEaPorTurno,
                reacoesBasePorTurno: personagem.reacoesBasePorTurno,
                turnosMorrendo: personagem.turnosMorrendo,
                turnosEnlouquecendo: personagem.turnosEnlouquecendo,
                bloqueio: personagem.bloqueio ?? 0,
                esquiva: personagem.esquiva ?? 0,
            },
            resistencias,
            tecnicasNaoInatas,
            espacosInventarioBase: espacosInventario.base,
            espacosInventarioExtra: espacosInventario.extra,
            espacosOcupados,
            sobrecarregado,
            itensInventario,
        };
    }
    async mapItensInventario(personagemBaseId, prisma) {
        try {
            const itens = await prisma.inventarioItemBase.findMany({
                where: { personagemBaseId },
                include: inventarioItemDetalhadoInclude,
                orderBy: { id: 'asc' },
            });
            const itensMapeados = [];
            for (const item of itens) {
                const equipamento = item.equipamento;
                if (!equipamento)
                    continue;
                let espacosPorUnidade = equipamento.espacos;
                const modsAplicadas = (item.modificacoes ?? []).flatMap((junction) => {
                    const mod = junction.modificacao;
                    if (!mod)
                        return [];
                    espacosPorUnidade += mod.incrementoEspacos;
                    const restricoes = this.isJsonObject(mod.restricoes)
                        ? mod.restricoes
                        : null;
                    const apenasAmaldicoadas = restricoes && typeof restricoes.apenasAmaldicoadas === 'boolean'
                        ? restricoes.apenasAmaldicoadas
                        : false;
                    const requerComplexidade = restricoes && typeof restricoes.requerComplexidade === 'string'
                        ? restricoes.requerComplexidade
                        : null;
                    return [
                        {
                            id: mod.id,
                            codigo: mod.codigo,
                            nome: mod.nome,
                            descricao: mod.descricao,
                            tipo: mod.tipo,
                            incrementoEspacos: mod.incrementoEspacos,
                            apenasAmaldicoadas,
                            requerComplexidade,
                            efeitosMecanicos: mod.efeitosMecanicos,
                        },
                    ];
                });
                itensMapeados.push({
                    id: item.id,
                    equipamentoId: item.equipamentoId,
                    quantidade: item.quantidade,
                    equipado: item.equipado,
                    espacosCalculados: espacosPorUnidade,
                    categoriaCalculada: equipamento.categoria.toString(),
                    nomeCustomizado: item.nomeCustomizado,
                    notas: item.notas,
                    equipamento: {
                        id: equipamento.id,
                        codigo: equipamento.codigo,
                        nome: equipamento.nome,
                        descricao: equipamento.descricao,
                        tipo: equipamento.tipo,
                        categoria: equipamento.categoria,
                        espacos: equipamento.espacos,
                        complexidadeMaldicao: equipamento.complexidadeMaldicao || 'NENHUMA',
                    },
                    modificacoes: modsAplicadas,
                });
            }
            return itensMapeados;
        }
        catch (error) {
            console.error('[MAPPER] Erro ao mapear itens de inventario:', error);
            return [];
        }
    }
    async calcularBonusGrausDeHabilidades(personagem, prisma) {
        const bonusMap = new Map();
        try {
            const habilidadesBase = await prisma.habilidadePersonagemBase.findMany({
                where: { personagemBaseId: personagem.id },
                include: {
                    habilidade: {
                        include: {
                            efeitosGrau: true,
                        },
                    },
                },
            });
            const poderesGenericos = await prisma.poderGenericoPersonagemBase.findMany({
                where: { personagemBaseId: personagem.id },
                include: {
                    habilidade: {
                        include: {
                            efeitosGrau: true,
                        },
                    },
                },
            });
            const todasHabilidades = [
                ...habilidadesBase.map((h) => h.habilidade),
                ...poderesGenericos.map((p) => p.habilidade),
            ];
            for (const hab of todasHabilidades) {
                if (!hab.efeitosGrau || hab.efeitosGrau.length === 0)
                    continue;
                for (const efeito of hab.efeitosGrau) {
                    const codigo = efeito.tipoGrauCodigo;
                    const atual = bonusMap.get(codigo) ?? 0;
                    bonusMap.set(codigo, atual + (efeito.valor ?? 0));
                }
            }
            for (const poder of poderesGenericos) {
                const mec = poder.habilidade.mecanicasEspeciais;
                if (!this.hasTipoGrauChoice(mec))
                    continue;
                const codigo = this.getTipoGrauCodigoConfig(poder.config);
                if (!codigo)
                    continue;
                const atual = bonusMap.get(codigo) ?? 0;
                bonusMap.set(codigo, atual + 1);
            }
            if (bonusMap.size > 0) {
                console.log('[MAPPER] Bonus de graus calculados:', Object.fromEntries(bonusMap));
            }
        }
        catch (err) {
            console.error('[MAPPER] Erro ao calcular bonus de graus:', err);
        }
        return bonusMap;
    }
};
exports.PersonagemBaseMapper = PersonagemBaseMapper;
exports.PersonagemBaseMapper = PersonagemBaseMapper = __decorate([
    (0, common_1.Injectable)()
], PersonagemBaseMapper);
//# sourceMappingURL=personagem-base.mapper.js.map