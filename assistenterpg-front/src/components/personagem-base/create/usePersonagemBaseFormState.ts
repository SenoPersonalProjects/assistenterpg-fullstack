// src/app/components/personagem-base/create/usePersonagemBaseFormState.ts
'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type {
  AtributoBaseCodigo,
  CreatePersonagemBasePayload,
  UpdatePersonagemBasePayload,
  TrilhaCatalogo,
  CaminhoCatalogo,
  PoderGenericoInstanciaPayload,
  ItemInventarioPayload,
} from '@/lib/api';

type InitialValues = {
  nome: string;
  nivel: number;
  claId: number;
  origemId: number;
  classeId: number;
  trilhaId: number | null;
  caminhoId: number | null;
  agilidade: number;
  forca: number;
  intelecto: number;
  presenca: number;
  vigor: number;
  estudouEscolaTecnica: boolean;
  tecnicaInataId: number | null;
  proficienciasCodigos: string[];
  grausAprimoramento: { tipoGrauCodigo: string; valor: number }[];

  idade: number | null;
  prestigioBase: number;
  prestigioClaBase: number | null;
  alinhamentoId: number | null;
  background: string | null;
  atributoChaveEa: 'INT' | 'PRE';

  periciasClasseEscolhidasCodigos: string[];
  periciasOrigemEscolhidasCodigos: string[];
  periciasLivresCodigos: string[];

  poderesGenericosSelecionadosIds?: number[];
  poderesGenericos?: PoderGenericoInstanciaPayload[];

  passivasAtributosAtivos?: AtributoBaseCodigo[];

  itensInventario?: ItemInventarioPayload[];
};

type Params = {
  mode: 'create' | 'edit';
  initialValues?: InitialValues;
  carregarTrilhasDaClasse: (classeId: number) => Promise<TrilhaCatalogo[]>;
  carregarCaminhosDaTrilha: (trilhaId: number) => Promise<CaminhoCatalogo[]>;
};

export function usePersonagemBaseFormState({
  mode,
  initialValues,
  carregarTrilhasDaClasse,
  carregarCaminhosDaTrilha,
}: Params) {
  const isEdit = mode === 'edit';

  // ==================== ESTADOS BÁSICOS ====================
  const [nome, setNome] = useState('');
  const [nivel, setNivel] = useState(1);
  const [estudouEscolaTecnica, setStudouEscolaTecnica] = useState(false);

  const [claId, setClaId] = useState('');
  const [origemId, setOrigemId] = useState('');
  const [classeId, setClasseId] = useState('');
  const [trilhaId, setTrilhaId] = useState('');
  const [caminhoId, setCaminhoId] = useState('');

  const [agilidade, setAgilidade] = useState(0);
  const [forca, setForca] = useState(0);
  const [intelecto, setIntelecto] = useState(0);
  const [presenca, setPresenca] = useState(0);
  const [vigor, setVigor] = useState(0);

  const [tecnicaInataId, setTecnicaInataId] = useState('');
  const [graus, setGraus] = useState<Record<string, number>>({});

  // ==================== META ====================
  const [idade, setIdade] = useState<number | null>(null);
  const [prestigioBase, setPrestigioBase] = useState(0);
  const [prestigioClaBase, setPrestigioClaBase] = useState<number | null>(null);
  const [alinhamentoId, setAlinhamentoId] = useState<string>('');
  const [background, setBackground] = useState<string | null>(null);
  const [atributoChaveEa, setAtributoChaveEa] = useState<'INT' | 'PRE'>('INT');

  // ==================== PERÍCIAS ====================
  const [periciasClasseEscolhidasCodigos, setPericiasClasseEscolhidasCodigos] =
    useState<string[]>([]);
  const [periciasOrigemEscolhidasCodigos, setPericiasOrigemEscolhidasCodigos] =
    useState<string[]>([]);
  const [periciasLivresCodigos, setPericiasLivresCodigos] = useState<string[]>(
    []
  );

  // ==================== PODERES GENÉRICOS (INSTÂNCIAS) ====================
  const [poderesGenericos, setPoderesGenericos] = useState<
    PoderGenericoInstanciaPayload[]
  >([]);

  // ==================== PASSIVAS (POR ATRIBUTO) ====================
  const [passivasAtributosAtivos, setPassivasAtributosAtivos] = useState<
    AtributoBaseCodigo[]
  >([]);

  // ==================== INVENTÁRIO ====================
  // Formato alinhado ao payload atual do backend.
  const [itensInventario, setItensInventario] = useState<ItemInventarioPayload[]>(
    []
  );

  // ==================== CATÁLOGOS DINÂMICOS ====================
  const [trilhas, setTrilhas] = useState<TrilhaCatalogo[]>([]);
  const [caminhos, setCaminhos] = useState<CaminhoCatalogo[]>([]);

  // ==================== CONTROLE ====================
  const [erro, setErro] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [initialized, setInitialized] = useState(false);

  // refs para detectar mudança "real" (usuário) vs hidratação
  const prevClasseIdRef = useRef<string>('');
  const prevTrilhaIdRef = useRef<string>('');

  // ==================== HIDRATAÇÃO (EDIÇÃO) ====================
  useEffect(() => {
    if (!isEdit || !initialValues || initialized) return;

    const iv = initialValues;

    (async () => {
      try {
        setNome(iv.nome);
        setNivel(iv.nivel);
        setStudouEscolaTecnica(iv.estudouEscolaTecnica);

        setClaId(String(iv.claId));
        setOrigemId(String(iv.origemId));
        setClasseId(String(iv.classeId));

        setAgilidade(iv.agilidade);
        setForca(iv.forca);
        setIntelecto(iv.intelecto);
        setPresenca(iv.presenca);
        setVigor(iv.vigor);

        setIdade(iv.idade);
        setPrestigioBase(iv.prestigioBase);
        setPrestigioClaBase(iv.prestigioClaBase);
        setAlinhamentoId(iv.alinhamentoId == null ? '' : String(iv.alinhamentoId));
        setBackground(iv.background ?? null);
        setAtributoChaveEa(iv.atributoChaveEa);

        setTecnicaInataId(iv.tecnicaInataId === null ? '' : String(iv.tecnicaInataId));

        const grausMap: Record<string, number> = {};
        iv.grausAprimoramento.forEach((g) => {
          grausMap[g.tipoGrauCodigo] = g.valor;
        });
        setGraus(grausMap);

        setPericiasClasseEscolhidasCodigos(iv.periciasClasseEscolhidasCodigos ?? []);
        setPericiasOrigemEscolhidasCodigos(iv.periciasOrigemEscolhidasCodigos ?? []);
        setPericiasLivresCodigos(iv.periciasLivresCodigos ?? []);

        if (iv.poderesGenericos && iv.poderesGenericos.length > 0) {
          setPoderesGenericos(iv.poderesGenericos);
        } else if (
          iv.poderesGenericosSelecionadosIds &&
          iv.poderesGenericosSelecionadosIds.length > 0
        ) {
          setPoderesGenericos(
            iv.poderesGenericosSelecionadosIds.map((id) => ({ habilidadeId: id }))
          );
        }

        setPassivasAtributosAtivos(iv.passivasAtributosAtivos ?? []);

        if (iv.itensInventario && iv.itensInventario.length > 0) {
          setItensInventario(iv.itensInventario);
        }

        if (iv.classeId) {
          const trilhasCarregadas = await carregarTrilhasDaClasse(iv.classeId);
          setTrilhas(trilhasCarregadas);

          if (iv.trilhaId) {
            setTrilhaId(String(iv.trilhaId));

            const caminhosCarregados = await carregarCaminhosDaTrilha(iv.trilhaId);
            setCaminhos(caminhosCarregados);

            if (iv.caminhoId) {
              setCaminhoId(String(iv.caminhoId));
            }
          }
        }

        setInitialized(true);
      } catch {
        setErro('Nao foi possivel carregar os dados iniciais do personagem para edicao.');
        setInitialized(true);
      }
    })();
  }, [
    isEdit,
    initialValues,
    initialized,
    carregarTrilhasDaClasse,
    carregarCaminhosDaTrilha,
  ]);

  // ==================== CLASSE → TRILHAS ====================
  useEffect(() => {
    const prev = prevClasseIdRef.current;
    prevClasseIdRef.current = classeId;

    if (!classeId) {
      queueMicrotask(() => {
        setTrilhas([]);
        setTrilhaId('');
        setCaminhos([]);
        setCaminhoId('');
      });
      return;
    }

    const mudouClasse = prev !== '' && prev !== classeId;

    (async () => {
      try {
        const lista = await carregarTrilhasDaClasse(Number(classeId));
        setTrilhas(lista);

        if (mudouClasse && initialized) {
          setTrilhaId('');
          setCaminhos([]);
          setCaminhoId('');
        }
      } catch {
        setErro('Nao foi possivel carregar as trilhas da classe selecionada.');
      }
    })();
  }, [classeId, carregarTrilhasDaClasse, initialized]);

  // ==================== TRILHA → CAMINHOS ====================
  useEffect(() => {
    const prev = prevTrilhaIdRef.current;
    prevTrilhaIdRef.current = trilhaId;

    if (!trilhaId) {
      queueMicrotask(() => {
        setCaminhos([]);
        setCaminhoId('');
      });
      return;
    }

    const mudouTrilha = prev !== '' && prev !== trilhaId;

    (async () => {
      try {
        const lista = await carregarCaminhosDaTrilha(Number(trilhaId));
        setCaminhos(lista);

        if (mudouTrilha && initialized) {
          setCaminhoId('');
        }
      } catch {
        setErro('Nao foi possivel carregar os caminhos da trilha selecionada.');
      }
    })();
  }, [trilhaId, carregarCaminhosDaTrilha, initialized]);

  // ==================== HELPERS ====================
  const handleGrauChange = useCallback((codigo: string, valor: number) => {
    setGraus((prev) => ({ ...prev, [codigo]: valor }));
  }, []);

  const togglePoderGenerico = useCallback((habilidadeId: number) => {
    setPoderesGenericos((prev) => {
      const hasAny = prev.some((p) => p.habilidadeId === habilidadeId);
      if (hasAny) {
        return prev.filter((p) => p.habilidadeId !== habilidadeId);
      }
      return [...prev, { habilidadeId }];
    });
  }, []);

  const addPoderGenericoInstancia = useCallback(
    (habilidadeId: number, config?: Record<string, unknown>) => {
      setPoderesGenericos((prev) => [...prev, { habilidadeId, config }]);
    },
    []
  );

  const removePoderGenericoInstancia = useCallback((index: number) => {
    setPoderesGenericos((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const updatePoderGenericoInstancia = useCallback(
    (index: number, partialConfig: Record<string, unknown>) => {
      setPoderesGenericos((prev) =>
        prev.map((inst, i) =>
          i === index
            ? {
                ...inst,
                config: { ...(inst.config ?? {}), ...(partialConfig ?? {}) },
              }
            : inst
        )
      );
    },
    []
  );

  const togglePassivaAtributo = useCallback((atributo: AtributoBaseCodigo) => {
    setPassivasAtributosAtivos((prev) => {
      const jaTem = prev.includes(atributo);

      if (jaTem) {
        return prev.filter((a) => a !== atributo);
      }

      if (prev.length >= 2) {
        setErro('Você pode escolher passivas em no máximo 2 atributos.');
        return prev;
      }

      return [...prev, atributo];
    });
  }, []);

  // ==================== INVENTÁRIO HELPERS ====================
  // ItemInventarioDto -> ItemInventarioPayload.
  const addItemInventario = useCallback((item: ItemInventarioPayload) => {
    setItensInventario((prev) => [...prev, item]);
  }, []);

  const removeItemInventario = useCallback((index: number) => {
    setItensInventario((prev) => prev.filter((_, i) => i !== index));
  }, []);

  // ItemInventarioDto -> ItemInventarioPayload.
  const updateItemInventario = useCallback(
    (index: number, updates: Partial<ItemInventarioPayload>) => {
      setItensInventario((prev) =>
        prev.map((item, i) => (i === index ? { ...item, ...updates } : item))
      );
    },
    []
  );

  // ==================== VALIDAÇÃO DE INVENTÁRIO ====================
  const validarInventario = useCallback((): { valido: boolean; erros: string[] } => {
    const erros: string[] = [];

    if (!itensInventario || itensInventario.length === 0) {
      return { valido: true, erros: [] };
    }

    itensInventario.forEach((item, index) => {
      if (!item.equipamentoId) {
        erros.push(`Item ${index + 1}: equipamentoId é obrigatório`);
      }

      if (!item.quantidade || item.quantidade <= 0) {
        erros.push(`Item ${index + 1}: quantidade deve ser maior que 0`);
      }

      // modificacoes -> modificacoesIds.
      if (item.modificacoesIds && !Array.isArray(item.modificacoesIds)) {
        erros.push(`Item ${index + 1}: modificacoesIds deve ser um array`);
      }
    });

    return {
      valido: erros.length === 0,
      erros,
    };
  }, [itensInventario]);

  // ==================== PAYLOADS ====================
  const buildCreatePayload = useCallback((): CreatePersonagemBasePayload => {
    const trilhaIdNumber = trilhaId ? Number(trilhaId) : null;
    const caminhoIdNumber = caminhoId ? Number(caminhoId) : null;

    if (!claId || !origemId || !classeId) {
      throw new Error('Campos obrigatórios ausentes');
    }

    const validacaoInventario = validarInventario();
    if (!validacaoInventario.valido) {
      throw new Error(
        `Inventário inválido:\n${validacaoInventario.erros.join('\n')}`
      );
    }
    return {
      nome: nome.trim(),
      nivel: Number(nivel),

      claId: Number(claId),
      origemId: Number(origemId),
      classeId: Number(classeId),

      trilhaId: trilhaIdNumber,
      caminhoId: caminhoIdNumber,

      agilidade,
      forca,
      intelecto,
      presenca,
      vigor,

      estudouEscolaTecnica,
      tecnicaInataId: tecnicaInataId === '' ? null : Number(tecnicaInataId),

      idade,
      prestigioBase,
      prestigioClaBase,
      alinhamentoId: alinhamentoId === '' ? null : Number(alinhamentoId),
      background: background || null,
      atributoChaveEa,

      proficienciasCodigos: [],

      grausAprimoramento: Object.entries(graus)
        .filter(([, valor]) => valor > 0)
        .map(([tipoGrauCodigo, valor]) => ({ tipoGrauCodigo, valor })),

      periciasClasseEscolhidasCodigos,
      periciasOrigemEscolhidasCodigos,
      periciasLivresCodigos,

      periciasLivresExtras: undefined,

      poderesGenericos: poderesGenericos.length > 0 ? poderesGenericos : undefined,
      poderesGenericosSelecionadosIds: undefined,

      passivasAtributosAtivos:
        passivasAtributosAtivos.length > 0 ? passivasAtributosAtivos : undefined,
      passivasAtributoIds: undefined,

      // O estado ja esta no formato esperado pelo endpoint.
      itensInventario: itensInventario.length > 0 ? itensInventario : undefined,
    };
  }, [
    nome,
    nivel,
    claId,
    origemId,
    classeId,
    trilhaId,
    caminhoId,
    agilidade,
    forca,
    intelecto,
    presenca,
    vigor,
    estudouEscolaTecnica,
    tecnicaInataId,
    idade,
    prestigioBase,
    prestigioClaBase,
    alinhamentoId,
    background,
    atributoChaveEa,
    graus,
    periciasClasseEscolhidasCodigos,
    periciasOrigemEscolhidasCodigos,
    periciasLivresCodigos,
    poderesGenericos,
    passivasAtributosAtivos,
    itensInventario,
    validarInventario,
  ]);

  const buildUpdatePayload = useCallback((): UpdatePersonagemBasePayload => {
    return buildCreatePayload();
  }, [buildCreatePayload]);

  const resetCreateState = useCallback(() => {
    setNome('');
    setNivel(1);
    setStudouEscolaTecnica(false);

    setIdade(null);
    setPrestigioBase(0);
    setPrestigioClaBase(null);
    setAlinhamentoId('');
    setBackground(null);

    setClaId('');
    setOrigemId('');
    setClasseId('');
    setTrilhaId('');
    setCaminhoId('');

    setAgilidade(0);
    setForca(0);
    setIntelecto(0);
    setPresenca(0);
    setVigor(0);

    setAtributoChaveEa('INT');
    setTecnicaInataId('');

    setGraus({});

    setPericiasClasseEscolhidasCodigos([]);
    setPericiasOrigemEscolhidasCodigos([]);
    setPericiasLivresCodigos([]);

    setPoderesGenericos([]);
    setPassivasAtributosAtivos([]);

    setItensInventario([]);

    setTrilhas([]);
    setCaminhos([]);
    setErro(null);
  }, []);

  return {
    // flags
    isEdit,
    erro,
    setErro,
    submitting,
    setSubmitting,

    // básicos
    nome,
    setNome,
    nivel,
    setNivel,
    estudouEscolaTecnica,
    setEstudouEscolaTecnica: setStudouEscolaTecnica,

    // seleções
    claId,
    setClaId,
    origemId,
    setOrigemId,
    classeId,
    setClasseId,
    trilhaId,
    setTrilhaId,
    caminhoId,
    setCaminhoId,

    // atributos
    agilidade,
    setAgilidade,
    forca,
    setForca,
    intelecto,
    setIntelecto,
    presenca,
    setPresenca,
    vigor,
    setVigor,

    // técnica / graus
    tecnicaInataId,
    setTecnicaInataId,
    graus,
    setGraus,

    // meta
    idade,
    setIdade,
    prestigioBase,
    setPrestigioBase,
    prestigioClaBase,
    setPrestigioClaBase,
    alinhamentoId,
    setAlinhamentoId,
    background,
    setBackground,
    atributoChaveEa,
    setAtributoChaveEa,

    // perícias
    periciasClasseEscolhidasCodigos,
    setPericiasClasseEscolhidasCodigos,
    periciasOrigemEscolhidasCodigos,
    setPericiasOrigemEscolhidasCodigos,
    periciasLivresCodigos,
    setPericiasLivresCodigos,

    // poderes (instâncias)
    poderesGenericos,
    setPoderesGenericos,
    togglePoderGenerico,
    addPoderGenericoInstancia,
    removePoderGenericoInstancia,
    updatePoderGenericoInstancia,

    // passivas
    passivasAtributosAtivos,
    setPassivasAtributosAtivos,
    togglePassivaAtributo,

    // inventário
    itensInventario,
    setItensInventario,
    addItemInventario,
    removeItemInventario,
    updateItemInventario,
    validarInventario,

    // catálogos
    trilhas,
    caminhos,

    // helpers
    handleGrauChange,
    buildCreatePayload,
    buildUpdatePayload,
    resetCreateState,
  };
}
