'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

import {
  apiGetAlinhamentos,
  apiGetClasses,
  apiGetClas,
  apiGetOrigens,
  apiGetPassivasDisponiveis,
  apiGetPericias,
  apiGetPersonagemBase,
  apiGetProficiencias,
  apiGetTecnicasInatas,
  apiGetTiposGrau,
  apiGetEquipamentos,
  apiGetModificacoes,
  extrairMensagemErro,
  traduzirErro,
  type AlinhamentoCatalogo,
  type CaminhoCatalogo,
  type ClasseCatalogo,
  type ClaCatalogo,
  type OrigemCatalogo,
  type PassivaAtributoCatalogo,
  type PericiaCatalogo,
  type PersonagemBaseDetalhe,
  type ProficienciaCatalogo,
  type TecnicaInataCatalogo,
  type TipoGrauCatalogo,
  type TrilhaCatalogo,
  type EquipamentoCatalogo,
  type ModificacaoCatalogo,
} from '@/lib/api';

type Catalogos = {
  classes: ClasseCatalogo[];
  clas: ClaCatalogo[];
  origens: OrigemCatalogo[];
  proficiencias: ProficienciaCatalogo[];
  tiposGrau: TipoGrauCatalogo[];
  tecnicasInatas: TecnicaInataCatalogo[];
  alinhamentos: AlinhamentoCatalogo[];
  pericias: PericiaCatalogo[];
  equipamentos: EquipamentoCatalogo[];
  modificacoes: ModificacaoCatalogo[];
};

function mensagemErroCarregarDetalhe(error: unknown): string {
  const status = Number(
    (error as { status?: number })?.status ??
      (error as { response?: { status?: number } })?.response?.status ??
      (error as { body?: { statusCode?: number } })?.body?.statusCode ??
      0,
  );
  const code = (error as { body?: { code?: string } })?.body?.code;
  const base = traduzirErro(code, extrairMensagemErro(error), status);

  if (status === 404) {
    return 'Personagem nao encontrado.';
  }

  if (status === 403) {
    return 'Voce nao tem permissao para acessar este personagem.';
  }

  if (status === 400 || status === 422) {
    return `Nao foi possivel carregar este personagem. ${base}`;
  }

  return base;
}

function sortPassivas(selecionadas: PassivaAtributoCatalogo[]) {
  return selecionadas.sort((a, b) => {
    if (a.atributo === b.atributo) return a.nivel - b.nivel;
    return a.atributo.localeCompare(b.atributo);
  });
}

// Busca passivas selecionadas sem token explícito no payload.
async function carregarPassivasSelecionadas(
  passivasAtributoIds: number[],
): Promise<PassivaAtributoCatalogo[]> {
  if (!passivasAtributoIds || passivasAtributoIds.length === 0) return [];
  const todasPassivas = await apiGetPassivasDisponiveis();
  const selecionadas: PassivaAtributoCatalogo[] = [];

  for (const lista of Object.values(todasPassivas)) {
    for (const passiva of lista) {
      if (passivasAtributoIds.includes(passiva.id)) {
        selecionadas.push(passiva);
      }
    }
  }

  return sortPassivas(selecionadas);
}

// Carrega equipamentos em páginas para mapear dados de inventário.
async function carregarTodosEquipamentos(): Promise<EquipamentoCatalogo[]> {
  try {
    let todosEquipamentos: EquipamentoCatalogo[] = [];
    let pagina = 1;
    let temMais = true;

    while (temMais) {
      const response = await apiGetEquipamentos({ pagina, limite: 100 });
      const equipsAtual = Array.isArray(response.items) ? response.items : [];
      todosEquipamentos = [...todosEquipamentos, ...equipsAtual];

      temMais = pagina < response.totalPages;
      pagina++;
    }

    return todosEquipamentos;
  } catch {
    return [];
  }
}

// Carrega modificações em páginas para mapear dados de inventário.
async function carregarTodasModificacoes(): Promise<ModificacaoCatalogo[]> {
  try {
    let todasModificacoes: ModificacaoCatalogo[] = [];
    let pagina = 1;
    let temMais = true;

    while (temMais) {
      const response = await apiGetModificacoes({ pagina, limite: 100 });
      const modsAtual = Array.isArray(response.items) ? response.items : [];
      todasModificacoes = [...todasModificacoes, ...modsAtual];

      temMais = pagina < response.totalPages;
      pagina++;
    }

    return todasModificacoes;
  } catch {
    return [];
  }
}

export type UsePersonagemBaseDetalheResult = {
  personagem: PersonagemBaseDetalhe | null;
  catalogos: Catalogos;
  passivasSelecionadas: PassivaAtributoCatalogo[];
  loading: boolean;
  erro: string | null;
  refresh: () => Promise<void>;
  carregarTrilhasDaClasse: (classeId: number) => Promise<TrilhaCatalogo[]>;
  carregarCaminhosDaTrilha: (trilhaId: number) => Promise<CaminhoCatalogo[]>;
  periciasMap: Map<string, { nome: string }>;
  tiposGrauMap: Map<string, string>;
};

export function usePersonagemBaseDetalhe(
  id?: string | number,
): UsePersonagemBaseDetalheResult {
  const router = useRouter();
  const { usuario, loading: authLoading } = useAuth();
  const [personagem, setPersonagem] = useState<PersonagemBaseDetalhe | null>(null);
  const [passivasSelecionadasState, setPassivasSelecionadasState] = useState<
    PassivaAtributoCatalogo[]
  >([]);

  const [catalogos, setCatalogos] = useState<Catalogos>({
    classes: [],
    clas: [],
    origens: [],
    proficiencias: [],
    tiposGrau: [],
    tecnicasInatas: [],
    alinhamentos: [],
    pericias: [],
    equipamentos: [],
    modificacoes: [],
  });

  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  const numericId = useMemo(() => {
    const n = typeof id === 'string' ? Number(id) : id ?? NaN;
    return Number.isFinite(n) ? n : null;
  }, [id]);

  const refresh = useCallback(async () => {
    if (!numericId) return;


    setLoading(true);
    setErro(null);
    setPassivasSelecionadasState([]);

    try {
      const [
        detalhe,
        classesRes,
        clasRes,
        origensRes,
        profsRes,
        tiposGrauRes,
        tecnicasInatasRes,
        alinhamentosRes,
        periciasRes,
        equipamentosCompletos,
        modificacoesCompletas,
      ] = await Promise.all([
        apiGetPersonagemBase( numericId, true),
        // Chamadas de catálogo sem token explícito no payload.
        apiGetClasses(),
        apiGetClas(),
        apiGetOrigens(),
        apiGetProficiencias(),
        apiGetTiposGrau(),
        apiGetTecnicasInatas(),
        apiGetAlinhamentos(),
        apiGetPericias(),
        carregarTodosEquipamentos(),
        carregarTodasModificacoes(),
      ]);

      setPersonagem(detalhe);

      setCatalogos({
        classes: classesRes,
        clas: clasRes,
        origens: origensRes,
        proficiencias: profsRes,
        tiposGrau: tiposGrauRes,
        tecnicasInatas: tecnicasInatasRes,
        alinhamentos: alinhamentosRes,
        pericias: periciasRes,
        equipamentos: equipamentosCompletos,
        modificacoes: modificacoesCompletas,
      });

      if (detalhe.passivasAtributoIds && detalhe.passivasAtributoIds.length > 0) {
        try {
          // Resolução de passivas selecionadas para apresentação.
          const selecionadas = await carregarPassivasSelecionadas(
            detalhe.passivasAtributoIds,
          );
          setPassivasSelecionadasState(selecionadas);
        } catch {
          setPassivasSelecionadasState([]);
        }
      }
    } catch (e) {
      setErro(mensagemErroCarregarDetalhe(e));
    } finally {
      setLoading(false);
    }
  }, [numericId]);

  useEffect(() => {
    if (!authLoading && !usuario) {
      router.push('/auth/login');
      return;
    }

    if (!authLoading && usuario && numericId) {
      refresh();
    }
  }, [authLoading, usuario, numericId, refresh, router]);

  // Carregadores auxiliares usados no modo de edição.
  const carregarTrilhasDaClasse = useCallback(
    async (classeId: number): Promise<TrilhaCatalogo[]> => {
      const { apiGetTrilhasDaClasse } = await import('@/lib/api');
      return apiGetTrilhasDaClasse(classeId);
    },
    [],
  );

  const carregarCaminhosDaTrilha = useCallback(
    async (trilhaId: number): Promise<CaminhoCatalogo[]> => {
      const { apiGetCaminhosDaTrilha } = await import('@/lib/api');
      return apiGetCaminhosDaTrilha(trilhaId);
    },
    [],
  );

  const periciasMap = useMemo(
    () => new Map(catalogos.pericias.map((p) => [p.codigo, { nome: p.nome }])),
    [catalogos.pericias],
  );

  const tiposGrauMap = useMemo(
    () => new Map(catalogos.tiposGrau.map((tg) => [tg.codigo, tg.nome])),
    [catalogos.tiposGrau],
  );

  const passivasSelecionadas = useMemo(() => {
    if (!passivasSelecionadasState.length) return [];

    const temNivel2PorAtributo = new Set(
      passivasSelecionadasState
        .filter((p) => p.nivel === 2)
        .map((p) => p.atributo),
    );

    return passivasSelecionadasState.filter((p) => {
      if (p.nivel === 2) return true;
      if (p.nivel === 1) return !temNivel2PorAtributo.has(p.atributo);
      return true;
    });
  }, [passivasSelecionadasState]);

  return {
    personagem,
    catalogos,
    passivasSelecionadas,
    loading: authLoading || loading,
    erro,
    refresh,
    carregarTrilhasDaClasse,
    carregarCaminhosDaTrilha,
    periciasMap,
    tiposGrauMap,
  };
}
