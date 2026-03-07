// src/personagem-base/personagem-base.mapper.ts
import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { GrauTreinamentoDto } from './dto/create-personagem-base.dto';

@Injectable()
export class PersonagemBaseMapper {
  private jsonToStringArray(
    value: Prisma.JsonValue | null | undefined,
  ): string[] {
    if (!Array.isArray(value)) return [];
    return value.filter((v) => typeof v === 'string');
  }

  mapResumo(personagem: any) {
    return {
      id: personagem.id,
      nome: personagem.nome,
      nivel: personagem.nivel,
      cla: personagem.cla.nome,
      classe: personagem.classe.nome,
    };
  }

  async mapDetalhado(personagem: any, prisma: any) {
    const bonusDeHabilidades = await this.calcularBonusGrausDeHabilidades(
      personagem,
      prisma,
    );

    const grausAprimoramentoAjustados = (personagem.grausAprimoramento ?? [])
      .map((g: any) => {
        const valorDB = g.valor;
        const codigo = g.tipoGrau?.codigo;

        if (!codigo) {
          console.warn('⚠️ [MAPPER] Grau sem tipoGrau.codigo:', g);
          return null;
        }

        const bonus = bonusDeHabilidades.get(codigo) ?? 0;
        const valorLivre = Math.max(0, valorDB - bonus);

        return {
          tipoGrauCodigo: codigo,
          tipoGrauNome: g.tipoGrau?.nome,
          valorTotal: valorDB,
          valorLivre: valorLivre,
          bonus: bonus,
        };
      })
      .filter((g) => g !== null);

    const espacosInventario = {
      base: personagem.espacosInventarioBase ?? personagem.forca * 5,
      extra: personagem.espacosInventarioExtra ?? 0,
      total:
        (personagem.espacosInventarioBase ?? personagem.forca * 5) +
        (personagem.espacosInventarioExtra ?? 0),
    };

    // ✅ Mapear inventário completo
    const itensInventario = await this.mapItensInventario(
      personagem.id,
      prisma,
    );
    const espacosOcupados = itensInventario.reduce((total, item) => {
      return total + item.espacosCalculados * item.quantidade;
    }, 0);
    const sobrecarregado = espacosOcupados > espacosInventario.total;

    // ✅ NOVO: Mapear resistências
    const resistencias = (personagem.resistencias ?? []).map((r: any) => ({
      codigo: r.resistenciaTipo.codigo,
      nome: r.resistenciaTipo.nome,
      descricao: r.resistenciaTipo.descricao,
      valor: r.valor,
    }));

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

      proficienciasExtrasCodigos: this.jsonToStringArray(
        personagem.proficienciasExtrasCodigos,
      ),

      periciasClasseEscolhidasCodigos: this.jsonToStringArray(
        personagem.periciasClasseEscolhidasCodigos,
      ),
      periciasOrigemEscolhidasCodigos: this.jsonToStringArray(
        personagem.periciasOrigemEscolhidasCodigos,
      ),
      periciasLivresCodigos: this.jsonToStringArray(
        personagem.periciasLivresCodigos,
      ),

      cla: personagem.cla,
      origem: personagem.origem,
      classe: personagem.classe,
      trilha: personagem.trilha,
      caminho: personagem.caminho,

      tecnicaInata: personagem.tecnicaInata
        ? {
            id: personagem.tecnicaInata.id,
            codigo: personagem.tecnicaInata.codigo,
            nome: personagem.tecnicaInata.nome,
            descricao: personagem.tecnicaInata.descricao,
            tipo: personagem.tecnicaInata.tipo,
            hereditaria: personagem.tecnicaInata.hereditaria,
            linkExterno: personagem.tecnicaInata.linkExterno,
          }
        : null,

      proficiencias: (personagem.proficiencias ?? []).map((pp: any) => ({
        id: pp.proficiencia.id,
        codigo: pp.proficiencia.codigo,
        nome: pp.proficiencia.nome,
        tipo: pp.proficiencia.tipo,
        categoria: pp.proficiencia.categoria,
        subtipo: pp.proficiencia.subtipo,
      })),

      grausAprimoramento: grausAprimoramentoAjustados,

      pericias: (personagem.pericias ?? []).map((p: any) => ({
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

      grausTreinamento: (personagem.grausTreinamento ?? []).reduce(
        (acc: GrauTreinamentoDto[], gt: any) => {
          const nivelExistente = acc.find((g) => g.nivel === gt.nivel);
          const melhoria = {
            periciaCodigo: gt.periciaCodigo,
            grauAnterior: gt.grauAnterior,
            grauNovo: gt.grauNovo,
          };

          if (nivelExistente) {
            nivelExistente.melhorias.push(melhoria);
          } else {
            acc.push({ nivel: gt.nivel, melhorias: [melhoria] });
          }
          return acc;
        },
        [] as GrauTreinamentoDto[],
      ),

      habilidades: (personagem.habilidadesBase ?? []).map((hab: any) => ({
        id: hab.habilidade.id,
        nome: hab.habilidade.nome,
        tipo: hab.habilidade.tipo,
        descricao: hab.habilidade.descricao,
      })),

      poderesGenericos: (personagem.poderesGenericos ?? []).map((p: any) => ({
        id: p.id,
        habilidadeId: p.habilidadeId,
        nome: p.habilidade.nome,
        config: p.config ?? {},
      })),

      poderesGenericosSelecionadosIds: (personagem.poderesGenericos ?? []).map(
        (p: any) => p.habilidadeId,
      ),

      passivasAtributosAtivos: this.jsonToStringArray(
        personagem.passivasAtributosAtivos,
      ),

      passivasAtributosConfig: personagem.passivasAtributosConfig ?? null,

      passivasAtributoIds: (personagem.passivas ?? []).map(
        (p: any) => p.passiva.id,
      ),

      passivas: (personagem.passivas ?? []).map((p: any) => ({
        id: p.passiva.id,
        codigo: p.passiva.codigo,
        nome: p.passiva.nome,
        atributo: p.passiva.atributo,
        nivel: p.passiva.nivel,
        descricao: p.passiva.descricao,
        efeitos: p.passiva.efeitos,
      })),

      // ✅ ATUALIZADO: Separar defesa (base + equipamento + total)
      atributosDerivados: {
        pvMaximo: personagem.pvMaximo,
        peMaximo: personagem.peMaximo,
        eaMaximo: personagem.eaMaximo,
        sanMaximo: personagem.sanMaximo,
        defesaBase: personagem.defesaBase ?? personagem.defesa ?? 10, // Retrocompatibilidade
        defesaEquipamento: personagem.defesaEquipamento ?? 0,
        defesaTotal:
          (personagem.defesaBase ?? personagem.defesa ?? 10) +
          (personagem.defesaEquipamento ?? 0),
        deslocamento: personagem.deslocamento,
        limitePeEaPorTurno: personagem.limitePeEaPorTurno,
        reacoesBasePorTurno: personagem.reacoesBasePorTurno,
        turnosMorrendo: personagem.turnosMorrendo,
        turnosEnlouquecendo: personagem.turnosEnlouquecendo,
        bloqueio: personagem.bloqueio ?? 0,
        esquiva: personagem.esquiva ?? 0,
      },

      // ✅ NOVO: Resistências
      resistencias,

      // Inventário
      espacosInventarioBase: espacosInventario.base,
      espacosInventarioExtra: espacosInventario.extra,
      espacosOcupados,
      sobrecarregado,
      itensInventario,
    };
  }

  /**
   * ✅ CORRIGIDO: Mapeia itens do inventário com equipamento e modificações
   * Usa include correto para buscar relações aninhadas
   */
  private async mapItensInventario(personagemBaseId: number, prisma: any) {
    try {
      const itens = await prisma.inventarioItemBase.findMany({
        where: { personagemBaseId },
        include: {
          equipamento: true, // ✅ Busca equipamento completo
          modificacoes: {
            include: {
              modificacao: true, // ✅ Busca modificação completa (tabela junction)
            },
          },
        },
        orderBy: { id: 'asc' },
      });

      return itens.map((item: any) => {
        let espacosPorUnidade = item.equipamento.espacos;

        // ✅ CORRIGIDO: modificacoes é um array de relações junction
        const modsAplicadas = (item.modificacoes || []).map((junction: any) => {
          const mod = junction.modificacao; // ✅ Acessar objeto modificacao dentro do junction
          espacosPorUnidade += mod.incrementoEspacos;

          return {
            id: mod.id,
            codigo: mod.codigo, // ✅ Agora funciona (objeto completo foi buscado)
            nome: mod.nome,
            descricao: mod.descricao,
            tipo: mod.tipo,
            incrementoEspacos: mod.incrementoEspacos,
            apenasAmaldicoadas: mod.apenasAmaldicoadas,
            requerComplexidade: mod.requerComplexidade,
            efeitosMecanicos: mod.efeitosMecanicos,
          };
        });

        const categoriaCalculada = item.equipamento.categoria.toString();

        return {
          id: item.id,
          equipamentoId: item.equipamentoId,
          quantidade: item.quantidade,
          equipado: item.equipado,
          espacosCalculados: espacosPorUnidade,
          categoriaCalculada,
          nomeCustomizado: item.nomeCustomizado,
          notas: item.notas,
          equipamento: {
            id: item.equipamento.id,
            codigo: item.equipamento.codigo,
            nome: item.equipamento.nome,
            descricao: item.equipamento.descricao,
            tipo: item.equipamento.tipo,
            categoria: item.equipamento.categoria,
            espacos: item.equipamento.espacos,
            complexidadeMaldicao:
              item.equipamento.complexidadeMaldicao || 'NENHUMA',
          },
          modificacoes: modsAplicadas,
        };
      });
    } catch (error) {
      console.error('[MAPPER] Erro ao mapear itens de inventário:', error);
      return [];
    }
  }

  /**
   * ✅ Calcula bônus de graus vindos de habilidades E poderes genéricos
   */
  private async calcularBonusGrausDeHabilidades(
    personagem: any,
    prisma: any,
  ): Promise<Map<string, number>> {
    const bonusMap = new Map<string, number>();

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

      const poderesGenericos =
        await prisma.poderGenericoPersonagemBase.findMany({
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
        if (!hab.efeitosGrau || hab.efeitosGrau.length === 0) continue;

        for (const efeito of hab.efeitosGrau) {
          const codigo = efeito.tipoGrauCodigo;
          const atual = bonusMap.get(codigo) ?? 0;
          bonusMap.set(codigo, atual + (efeito.valor ?? 0));
        }
      }

      for (const poder of poderesGenericos) {
        const mec = poder.habilidade.mecanicasEspeciais;

        if (mec?.escolha?.tipo === 'TIPO_GRAU') {
          const codigo = poder.config?.tipoGrauCodigo;

          if (typeof codigo === 'string' && codigo.trim()) {
            const atual = bonusMap.get(codigo) ?? 0;
            bonusMap.set(codigo, atual + 1);
          }
        }
      }

      if (bonusMap.size > 0) {
        console.log(
          '[MAPPER] Bônus de graus calculados:',
          Object.fromEntries(bonusMap),
        );
      }
    } catch (err) {
      console.error('[MAPPER] Erro ao calcular bônus de graus:', err);
    }

    return bonusMap;
  }
}
