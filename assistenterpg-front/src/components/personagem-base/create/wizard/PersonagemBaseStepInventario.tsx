// components/personagem-base/wizard/PersonagemBaseStepInventario.tsx

'use client';

import { useMemo, useEffect, useState, useCallback, useDeferredValue } from 'react';
import type {
  ItemInventarioPayload,
  EquipamentoCatalogo,
  ModificacaoCatalogo,
  PreviewAdicionarItemResponse,
  PericiaCatalogo,
} from '@/lib/api';
import {
  apiCreateEquipamentoHomebrewInline,
  apiPreviewItensInventario,
  extrairMensagemErro,
} from '@/lib/api';
import { useToast } from '@/context/ToastContext';
import { getGrauXamaPorPrestigio } from '@/lib/utils/prestigio';
import {
  // calcularEspacosExtraDeItens
  calcularCategoriaFinal,
  CODIGO_MOD_FUNCAO_ADICIONAL,
  contarModificacoesEfetivasItem,
  equipamentoUsaPericiaPersonalizada,
  filtrarModificacoesCompativeis,
  listarPericiasElegiveisItemPersonalizado,
  type CategoriaEquipamento,
  type ItemInventarioParaVestir,
  validarPodeVestir,
} from '@/lib/utils/inventario';
import { useInventarioPreview } from '@/hooks/useInventarioPreview';
import { SectionCard } from '@/components/ui/SectionCard';
import { EmptyState } from '@/components/ui/EmptyState';
import { Icon } from '@/components/ui/Icon';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { Modal } from '@/components/ui/Modal';
import { InventarioGrauXama } from '../InventarioGrauXama';
import { InventarioCapacidadeCarga } from '../InventarioCapacidadeCarga';
import { InventarioItemCard } from '../InventarioItemCard';
import { InventarioModalCategoria } from '../modal/InventarioModalCategoria';
import { InventarioModalEquipamento } from '../modal/InventarioModalEquipamento';
import { InventarioModalModificacoes } from '../modal/InventarioModalModificacoes';
import { InventarioModalReview } from '../modal/InventarioModalReview';
import { InventarioModalEditar } from '../modal/InventarioModalEditar';
import { InventarioAlertaVestir } from '../InventarioAlertaVestir';
import { HomebrewForm } from '@/components/suplemento/HomebrewForm';
import { TipoHomebrewConteudo } from '@/lib/types/homebrew-enums';
import type { CreateHomebrewDto } from '@/lib/api/homebrews';

type Props = {
  forca: number;
  intelecto?: number;
  somarIntelecto?: boolean;
  reduzirItensLeves?: boolean;
  reduzirCategoriaEm?: number;
  reduzirCategoriaExcetoTipos?: string[];
  creditoCategoriaBonus?: number;
  prestigioBase: number;
  equipamentos: EquipamentoCatalogo[];
  modificacoes: ModificacaoCatalogo[];
  pericias: PericiaCatalogo[];
  itensInventario: ItemInventarioPayload[];
  onChangeItensInventario: (itens: ItemInventarioPayload[]) => void;
};

type ModalStep = 'categoria' | 'equipamento' | 'modificacoes' | 'review' | 'editar-item';
const LIMITE_RENDER_ITENS_INICIAL = 80;

export function PersonagemBaseStepInventario(props: Props) {
  const { showToast } = useToast();
  const { sincronizarInventario, carregando: carregandoSincronizacao } = useInventarioPreview({
    forca: props.forca,
    intelecto: props.intelecto,
    somarIntelecto: props.somarIntelecto,
    reduzirItensLeves: props.reduzirItensLeves,
    reduzirCategoriaEm: props.reduzirCategoriaEm,
    reduzirCategoriaExcetoTipos: props.reduzirCategoriaExcetoTipos,
    prestigioBase: props.prestigioBase,
  });

  // Estados básicos
  const [modalCriarEquipamentoAberto, setModalCriarEquipamentoAberto] = useState(false);
  const [erroCriarEquipamento, setErroCriarEquipamento] = useState<string | null>(null);
  const equipamentos = useMemo(() => props.equipamentos, [props.equipamentos]);
  const modificacoes = props.modificacoes;

  // Estado para armazenar preview do backend (espaços calculados)
  const [previewInventario, setPreviewInventario] = useState<{
    espacosBase: number;
    espacosExtra: number;
    espacosTotal: number;
    espacosOcupados: number;
    sobrecarregado: boolean;
  } | null>(null);

  // Filtros da lista de itens
  const [filtroCategoria, setFiltroCategoria] = useState<string>('TODOS');
  const [buscaItem, setBuscaItem] = useState('');
  const [limiteRenderItens, setLimiteRenderItens] = useState(LIMITE_RENDER_ITENS_INICIAL);

  // Modal
  const [modalAberto, setModalAberto] = useState(false);
  const [stepAtual, setStepAtual] = useState<ModalStep>('categoria');
  const [buscaEquipamento, setBuscaEquipamento] = useState('');
  const [categoriaAtiva, setCategoriaAtiva] = useState<CategoriaEquipamento>('ARMAS');
  const [equipamentoSelecionado, setEquipamentoSelecionado] =
    useState<EquipamentoCatalogo | null>(null);
  const [quantidade, setQuantidade] = useState(1);
  const [equipado, setEquipado] = useState(false);
  const [nomeCustomizado, setNomeCustomizado] = useState('');
  const [periciaPersonalizada, setPericiaPersonalizada] = useState<string>('');
  const [funcoesAdicionaisPericias, setFuncoesAdicionaisPericias] = useState<string[]>([]);
  const [modificacoesSelecionadas, setModificacoesSelecionadas] = useState<ModificacaoCatalogo[]>(
    [],
  );
  const [ignorarLimites, setIgnorarLimites] = useState(false);
  const [erroValidacao, setErroValidacao] = useState<string | null>(null);
  const [preview, setPreview] = useState<PreviewAdicionarItemResponse | null>(null);
  const [carregandoPreview, setCarregandoPreview] = useState(false);

  // Edição
  const [itemEditando, setItemEditando] = useState<ItemInventarioPayload | null>(null);
  const [indiceItemEditando, setIndiceItemEditando] = useState<number | null>(null);
  const [quantidadeEditando, setQuantidadeEditando] = useState(1);
  const [modificacoesEditando, setModificacoesEditando] = useState<number[]>([]);
  const [nomeCustomizadoEditando, setNomeCustomizadoEditando] = useState('');
  const [equipadoEditando, setEquipadoEditando] = useState(false);
  const [periciaPersonalizadaEditando, setPericiaPersonalizadaEditando] = useState('');
  const [funcoesAdicionaisPericiasEditando, setFuncoesAdicionaisPericiasEditando] = useState<string[]>([]);

  // ConfirmDialog
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [itemToRemove, setItemToRemove] = useState<number | null>(null);
  const termoBuscaItemDeferred = useDeferredValue(buscaItem);
  const termoBuscaEquipamentoDeferred = useDeferredValue(buscaEquipamento);

  const grauXama = useMemo(
    () => getGrauXamaPorPrestigio(props.prestigioBase),
    [props.prestigioBase],
  );


  const equipamentoPorId = useMemo(() => {
    const mapa = new Map<number, EquipamentoCatalogo>();
    for (const equip of equipamentos) {
      mapa.set(equip.id, equip);
    }
    return mapa;
  }, [equipamentos]);

  const periciasElegiveisPersonalizacao = useMemo(
    () => listarPericiasElegiveisItemPersonalizado(props.pericias),
    [props.pericias],
  );

  const exigePericiaPersonalizadaAdicionar = useMemo(
    () =>
      equipamentoSelecionado
        ? equipamentoUsaPericiaPersonalizada(equipamentoSelecionado)
        : false,
    [equipamentoSelecionado],
  );

  const podeSalvarAdicaoItem = useMemo(() => {
    if (carregandoPreview || erroValidacao !== null || carregandoSincronizacao) {
      return false;
    }
    if (!exigePericiaPersonalizadaAdicionar) return true;
    return periciaPersonalizada.trim().length > 0;
  }, [
    carregandoPreview,
    erroValidacao,
    carregandoSincronizacao,
    exigePericiaPersonalizadaAdicionar,
    periciaPersonalizada,
  ]);

  const exigePericiaPersonalizadaEdicao = useMemo(() => {
    if (!itemEditando) return false;
    return equipamentoUsaPericiaPersonalizada(
      equipamentoPorId.get(itemEditando.equipamentoId),
    );
  }, [equipamentoPorId, itemEditando]);

  const podeSalvarEdicaoItem = useMemo(() => {
    if (carregandoSincronizacao) return false;
    if (!exigePericiaPersonalizadaEdicao) return true;
    return periciaPersonalizadaEditando.trim().length > 0;
  }, [
    carregandoSincronizacao,
    exigePericiaPersonalizadaEdicao,
    periciaPersonalizadaEditando,
  ]);


  // Sincronizar com backend sempre que itens mudarem
  useEffect(() => {
    if (props.itensInventario.length === 0) {
      // Caso vazio: calcular espaços base manualmente
      const base =
        props.somarIntelecto && typeof props.intelecto === 'number'
          ? (props.forca + props.intelecto) * 5
          : props.forca * 5;
      setPreviewInventario({
        espacosBase: base,
        espacosExtra: 0,
        espacosTotal: base,
        espacosOcupados: 0,
        sobrecarregado: false,
      });
      return;
    }

    let isCancelled = false;

    const buscarPreview = async () => {
      try {
        const payload = {
          forca: props.forca,
          intelecto: props.intelecto,
          somarIntelecto: props.somarIntelecto,
          reduzirItensLeves: props.reduzirItensLeves,
          prestigioBase: props.prestigioBase,
          itens: props.itensInventario.map((item) => ({
            equipamentoId: item.equipamentoId,
            quantidade: item.quantidade,
            equipado: item.equipado,
            modificacoes: item.modificacoesIds ?? [],
            nomeCustomizado: item.nomeCustomizado || undefined,
            estado: item.estado ?? undefined,
          })),
        };

        const data = await apiPreviewItensInventario(payload);

        if (!isCancelled) {
          setPreviewInventario({
            espacosBase: data.espacosBase,
            espacosExtra: data.espacosExtra,
            espacosTotal: data.espacosTotal,
            espacosOcupados: data.espacosOcupados,
            sobrecarregado: data.sobrecarregado,
          });
        }
      } catch {
        if (!isCancelled) {
          // Fallback
          const base =
            props.somarIntelecto && typeof props.intelecto === 'number'
              ? (props.forca + props.intelecto) * 5
              : props.forca * 5;
          setPreviewInventario({
            espacosBase: base,
            espacosExtra: 0,
            espacosTotal: base,
            espacosOcupados: 0,
            sobrecarregado: false,
          });
        }
      }
    };

    buscarPreview();

    return () => {
      isCancelled = true;
    };
  }, [
    props.itensInventario,
    props.forca,
    props.intelecto,
    props.somarIntelecto,
    props.reduzirItensLeves,
    props.prestigioBase,
  ]);

  // Usar preview do backend
  const espacosBase = previewInventario?.espacosBase ?? props.forca * 5;
  const espacosExtra = previewInventario?.espacosExtra ?? 0;
  const espacosTotal = previewInventario?.espacosTotal ?? espacosBase;
  const espacosOcupados = previewInventario?.espacosOcupados ?? 0;
  const espacosRestantes = espacosTotal - espacosOcupados;

  // Contagem de itens por categoria
  const itensPorCategoria = useMemo(() => {
    const contagem: Record<string, number> = {
      '0': 0,
      '4': 0,
      '3': 0,
      '2': 0,
      '1': 0,
      ESPECIAL: 0,
    };

    if (!Array.isArray(props.itensInventario)) return contagem;

    props.itensInventario.forEach((item) => {
      const equip = equipamentoPorId.get(item.equipamentoId);
      if (equip) {
        const cat = calcularCategoriaFinal(
          equip.categoria,
          contarModificacoesEfetivasItem({
            modificacoesIds: item.modificacoesIds,
            modificacoesCatalogo: modificacoes,
            estado: item.estado,
          }),
        );
        contagem[cat] = (contagem[cat] || 0) + item.quantidade;
      }
    });

    return contagem;
  }, [props.itensInventario, equipamentoPorId, modificacoes]);

  // Itens filtrados (categoria + busca)
  const itensFiltrados = useMemo(() => {
    let itens = props.itensInventario.map((item, indexOriginal) => ({ item, indexOriginal }));

    // Filtro por categoria
    if (filtroCategoria !== 'TODOS') {
      itens = itens.filter(({ item }) => {
        const equip = equipamentoPorId.get(item.equipamentoId);
        if (!equip) return false;
        const cat = calcularCategoriaFinal(
          equip.categoria,
          contarModificacoesEfetivasItem({
            modificacoesIds: item.modificacoesIds,
            modificacoesCatalogo: modificacoes,
            estado: item.estado,
          }),
        );
        return cat === filtroCategoria;
      });
    }

    // Busca por nome
    if (termoBuscaItemDeferred.trim()) {
      const termo = termoBuscaItemDeferred.toLowerCase();
      itens = itens.filter(({ item }) => {
        const equip = equipamentoPorId.get(item.equipamentoId);
        if (!equip) return false;
        const nomeExibido = item.nomeCustomizado || equip.nome;
        return (
          nomeExibido.toLowerCase().includes(termo) ||
          equip.codigo.toLowerCase().includes(termo)
        );
      });
    }

    return itens;
  }, [props.itensInventario, filtroCategoria, termoBuscaItemDeferred, equipamentoPorId, modificacoes]);

  useEffect(() => {
    setLimiteRenderItens(LIMITE_RENDER_ITENS_INICIAL);
  }, [filtroCategoria, termoBuscaItemDeferred]);

  const itensRenderizados = useMemo(
    () => itensFiltrados.slice(0, limiteRenderItens),
    [itensFiltrados, limiteRenderItens],
  );

  // Categorização
  const equipamentosPorCategoria = useMemo(() => {
    const categorizado: Record<CategoriaEquipamento, EquipamentoCatalogo[]> = {
      HOMEBREW: [],
      ARMAS: [],
      MUNICOES: [],
      PROTECOES: [],
      UTILITARIOS: [],
      ARMAS_AMALDICOADAS_SIMPLES: [],
      ARMAS_AMALDICOADAS_COMPLEXAS: [],
      PROTECOES_AMALDICOADAS_SIMPLES: [],
      PROTECOES_AMALDICOADAS_COMPLEXAS: [],
      ITENS_AMALDICOADOS: [],
      ARTEFATOS_AMALDICOADOS: [],
    };

    if (!Array.isArray(equipamentos)) return categorizado;

    equipamentos.forEach((equip) => {
      if (equip.fonte === 'HOMEBREW') {
        if (equip.homebrewOrigemStatus === 'PUBLICADO') {
          categorizado.HOMEBREW.push(equip);
        }
        return;
      }

      const tipo = equip.tipo;
      const equipDetalhes = equip as EquipamentoCatalogo;
      const complexidade = equipDetalhes.complexidadeMaldicao;
      const armaAmaldicoada = equipDetalhes.armaAmaldicoada;
      const protecaoAmaldicoada = equipDetalhes.protecaoAmaldicoada;
      const artefatoAmaldicoado = equipDetalhes.artefatoAmaldicoado;

      if (tipo === 'ARMA') {
        categorizado.ARMAS.push(equip);
      } else if (tipo === 'MUNICAO') {
        categorizado.MUNICOES.push(equip);
      } else if (tipo === 'PROTECAO') {
        categorizado.PROTECOES.push(equip);
      } else if (
        tipo === 'ACESSORIO' ||
        tipo === 'ITEM_OPERACIONAL' ||
        tipo === 'EXPLOSIVO' ||
        tipo === 'GENERICO'
      ) {
        categorizado.UTILITARIOS.push(equip);
      } else if (tipo === 'FERRAMENTA_AMALDICOADA') {
        if (artefatoAmaldicoado) {
          categorizado.ARTEFATOS_AMALDICOADOS.push(equip);
        } else if (armaAmaldicoada) {
          if (complexidade === 'SIMPLES') {
            categorizado.ARMAS_AMALDICOADAS_SIMPLES.push(equip);
          } else if (complexidade === 'COMPLEXA') {
            categorizado.ARMAS_AMALDICOADAS_COMPLEXAS.push(equip);
          } else {
            categorizado.ITENS_AMALDICOADOS.push(equip);
          }
        } else if (protecaoAmaldicoada) {
          if (complexidade === 'SIMPLES') {
            categorizado.PROTECOES_AMALDICOADAS_SIMPLES.push(equip);
          } else if (complexidade === 'COMPLEXA') {
            categorizado.PROTECOES_AMALDICOADAS_COMPLEXAS.push(equip);
          } else {
            categorizado.ITENS_AMALDICOADOS.push(equip);
          }
        } else {
          categorizado.ITENS_AMALDICOADOS.push(equip);
        }
      } else if (tipo === 'ITEM_AMALDICOADO') {
        if (complexidade === 'SIMPLES') {
          categorizado.PROTECOES_AMALDICOADAS_SIMPLES.push(equip);
        } else if (complexidade === 'COMPLEXA') {
          categorizado.PROTECOES_AMALDICOADAS_COMPLEXAS.push(equip);
        } else {
          categorizado.ITENS_AMALDICOADOS.push(equip);
        }
      } else if (complexidade && complexidade !== 'NENHUMA') {
        categorizado.ITENS_AMALDICOADOS.push(equip);
      } else {
        categorizado.UTILITARIOS.push(equip);
      }
    });

    (Object.keys(categorizado) as CategoriaEquipamento[]).forEach((key) => {
      categorizado[key].sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'));
    });

    return categorizado;
  }, [equipamentos]);

  const equipamentosFiltrados = useMemo(() => {
    let equips = equipamentosPorCategoria[categoriaAtiva] || [];

    if (termoBuscaEquipamentoDeferred.trim()) {
      const termo = termoBuscaEquipamentoDeferred.toLowerCase();
      equips = equips.filter(
        (equip) =>
          equip.nome.toLowerCase().includes(termo) || equip.codigo.toLowerCase().includes(termo),
      );
    }

    return equips;
  }, [equipamentosPorCategoria, categoriaAtiva, termoBuscaEquipamentoDeferred]);

  const modificacoesCompativeis = useMemo(() => {
    if (!equipamentoSelecionado) return [];
    return filtrarModificacoesCompativeis(
      modificacoes,
      equipamentoSelecionado,
      modificacoesSelecionadas,
    );
  }, [modificacoes, equipamentoSelecionado, modificacoesSelecionadas]);

  const modificacoesCompativeisEdicao = useMemo(() => {
    if (!itemEditando) return [];
    const equip = equipamentoPorId.get(itemEditando.equipamentoId);
    if (!equip) return [];
    const selecionadas = modificacoes.filter((mod) =>
      modificacoesEditando.includes(mod.id),
    );
    return filtrarModificacoesCompativeis(modificacoes, equip, selecionadas);
  }, [modificacoes, itemEditando, equipamentoPorId, modificacoesEditando]);

  // Handler para validar ao marcar "equipado"
  const handleEquipadoChange = useCallback(
    (checked: boolean) => {
      setErroValidacao(null);

      if (!checked) {
        setEquipado(false);
        return;
      }

      if (!equipamentoSelecionado) return;

      // Converter itens do wizard para formato esperado
      const itensConvertidos = props.itensInventario.reduce<ItemInventarioParaVestir[]>(
        (acc, item) => {
          const equip = equipamentoPorId.get(item.equipamentoId);
          if (!equip) return acc;

          acc.push({
            equipamentoId: item.equipamentoId,
            quantidade: item.quantidade,
            equipado: item.equipado,
            equipamento: equip,
          });
          return acc;
        },
        [],
      );

      const validacao = validarPodeVestir(
        equipamentoSelecionado,
        quantidade,
        itensConvertidos,
        equipamentos,
      );

      if (!validacao.podeVestir) {
        setErroValidacao('Este tipo de equipamento não pode ser vestido.');
        return;
      }

      if (!validacao.valido) {
        setErroValidacao(validacao.erros.join('\n\n'));
        return;
      }

      setEquipado(true);
    },
    [equipamentoSelecionado, quantidade, props.itensInventario, equipamentos, equipamentoPorId],
  );

  // Handler para validar ao marcar "equipado" na edição
  const handleEquipadoEditandoChange = useCallback(
    (checked: boolean) => {
      setErroValidacao(null);

      if (!checked) {
        setEquipadoEditando(false);
        return;
      }

      if (!itemEditando) return;

      const equip = equipamentoPorId.get(itemEditando.equipamentoId);
      if (!equip) return;

      const itensExcetoAtual = props.itensInventario
        .filter((_, idx) => idx !== indiceItemEditando)
        .reduce<ItemInventarioParaVestir[]>((acc, item) => {
          const e = equipamentoPorId.get(item.equipamentoId);
          if (!e) return acc;

          acc.push({
            equipamentoId: item.equipamentoId,
            quantidade: item.quantidade,
            equipado: item.equipado,
            equipamento: e,
          });
          return acc;
        }, []);

      const validacao = validarPodeVestir(equip, quantidadeEditando, itensExcetoAtual, equipamentos);

      if (!validacao.podeVestir) {
        setErroValidacao('Este tipo de equipamento não pode ser vestido.');
        return;
      }

      if (!validacao.valido) {
        setErroValidacao(validacao.erros.join('\n\n'));
        return;
      }

      setEquipadoEditando(true);
    },
    [
      itemEditando,
      quantidadeEditando,
      props.itensInventario,
      equipamentos,
      indiceItemEditando,
      equipamentoPorId,
    ],
  );

  // Handlers de Modal
  const abrirModal = useCallback(() => {
    setModalAberto(true);
    setStepAtual('categoria');
    setEquipamentoSelecionado(null);
    setBuscaEquipamento('');
    setCategoriaAtiva('ARMAS');
    setQuantidade(1);
    setEquipado(false);
    setNomeCustomizado('');
    setPericiaPersonalizada('');
    setFuncoesAdicionaisPericias([]);
    setModificacoesSelecionadas([]);
    setErroValidacao(null);
    setIgnorarLimites(false);
    setItemEditando(null);
    setIndiceItemEditando(null);
    setPreview(null);
  }, []);

  const fecharModal = useCallback(() => {
    setModalAberto(false);
    setStepAtual('categoria');
    setItemEditando(null);
    setIndiceItemEditando(null);
    setPreview(null);
    setNomeCustomizado('');
    setNomeCustomizadoEditando('');
    setEquipadoEditando(false);
    setPericiaPersonalizada('');
    setPericiaPersonalizadaEditando('');
    setFuncoesAdicionaisPericias([]);
    setFuncoesAdicionaisPericiasEditando([]);
  }, []);

  const handleCriarEquipamentoHomebrew = useCallback(
    async (payload: CreateHomebrewDto) => {
      setErroCriarEquipamento(null);
      try {
        await apiCreateEquipamentoHomebrewInline({
          ...payload,
          tipo: TipoHomebrewConteudo.EQUIPAMENTO,
        });
        setModalCriarEquipamentoAberto(false);
        showToast(
          'Equipamento homebrew criado. Agora habilite essa homebrew nas Fontes da ficha para ela aparecer na categoria Homebrew do inventario.',
          'success',
        );
      } catch (error) {
        setErroCriarEquipamento(extrairMensagemErro(error));
        throw error;
      }
    },
    [showToast],
  );

  // Preview simplificado (backend calculará tudo ao adicionar)
  const buscarPreviewBackend = useCallback(async () => {
    if (!equipamentoSelecionado) return;

    setCarregandoPreview(true);
    setErroValidacao(null);

    try {
      const categoria = calcularCategoriaFinal(
        equipamentoSelecionado.categoria,
        modificacoesSelecionadas.length,
      );
      const limiteCategoria = grauXama.limitesPorCategoria[categoria] ?? Infinity;
      const itensAtuaisNaCategoria = itensPorCategoria[categoria] || 0;

      if (
        categoria !== '0' &&
        !ignorarLimites &&
        itensAtuaisNaCategoria + quantidade > limiteCategoria
      ) {
        setErroValidacao(
          `Limite de categoria ${categoria}: ${itensAtuaisNaCategoria + quantidade}/${limiteCategoria}`,
        );
        setCarregandoPreview(false);
        return;
      }

      // Preview simplificado (backend calculará ao sincronizar)
      let espacosPorUnidade = equipamentoSelecionado.espacos;
      if (props.reduzirItensLeves && espacosPorUnidade > 0 && espacosPorUnidade <= 0.5) {
        espacosPorUnidade = espacosPorUnidade / 2;
      }
      modificacoesSelecionadas.forEach((mod) => {
        espacosPorUnidade += mod.incrementoEspacos;
      });

      const espacosNecessarios = espacosPorUnidade * quantidade;
      const espacosDisponiveisAposAdicao = espacosTotal - (espacosOcupados + espacosNecessarios);

      const previewSimulado: PreviewAdicionarItemResponse = {
        espacos: {
          espacosTotal: espacosTotal,
          espacosOcupados: espacosOcupados + espacosNecessarios,
          espacosDisponiveis: espacosDisponiveisAposAdicao,
          sobrecarregado: espacosOcupados + espacosNecessarios > espacosTotal,
        },
        grauXama: {
          valido:
            categoria === '0' ||
            ignorarLimites ||
            itensAtuaisNaCategoria + quantidade <= limiteCategoria,
          erros: [],
          grauAtual: grauXama.grau,
          limitesAtuais: grauXama.limitesPorCategoria,
          itensPorCategoriaAtual: {
            ...itensPorCategoria,
            [categoria]: (itensPorCategoria[categoria] || 0) + quantidade,
          },
        },
        stats: {},
      };

      setPreview(previewSimulado);
      setStepAtual('review');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao gerar preview';
      setErroValidacao(message);
    } finally {
      setCarregandoPreview(false);
    }
  }, [
    equipamentoSelecionado,
    quantidade,
    modificacoesSelecionadas,
    grauXama,
    itensPorCategoria,
    ignorarLimites,
    espacosOcupados,
    espacosTotal,
    props.reduzirItensLeves,
  ]);

  const avancarStep = useCallback(() => {
    setErroValidacao(null);

    if (stepAtual === 'categoria') {
      setStepAtual('equipamento');
    } else if (stepAtual === 'equipamento') {
      if (!equipamentoSelecionado) {
        setErroValidacao('Selecione um equipamento');
        return;
      }
      setStepAtual('modificacoes');
    } else if (stepAtual === 'modificacoes') {
      buscarPreviewBackend();
    }
  }, [stepAtual, equipamentoSelecionado, buscarPreviewBackend]);

  const retrocederStep = useCallback(() => {
    if (stepAtual === 'categoria') {
      fecharModal();
    } else if (stepAtual === 'equipamento') {
      setStepAtual('categoria');
    } else if (stepAtual === 'modificacoes') {
      setStepAtual('equipamento');
    } else if (stepAtual === 'review') {
      setStepAtual('modificacoes');
      setPreview(null);
    } else if (stepAtual === 'editar-item') {
      fecharModal();
    }

    setErroValidacao(null);
  }, [stepAtual, fecharModal]);

  const confirmarAdicao = useCallback(async () => {
    if (!equipamentoSelecionado) return;
    if (
      equipamentoUsaPericiaPersonalizada(equipamentoSelecionado) &&
      !periciaPersonalizada.trim()
    ) {
      setErroValidacao('Selecione a perícia beneficiada por este item personalizado.');
      return;
    }
    if (
      modificacoesSelecionadas.some(
        (mod) => mod.codigo === CODIGO_MOD_FUNCAO_ADICIONAL,
      ) &&
      funcoesAdicionaisPericias.length === 0
    ) {
      setErroValidacao('Selecione ao menos uma pericia extra para Funcao Adicional.');
      return;
    }

    const novoItem: ItemInventarioPayload = {
      equipamentoId: equipamentoSelecionado.id,
      quantidade,
      equipado,
      modificacoesIds: modificacoesSelecionadas.map((mod) => mod.id),
      nomeCustomizado: nomeCustomizado.trim() || null,
      notas: null,
      estado:
        equipamentoUsaPericiaPersonalizada(equipamentoSelecionado) ||
        funcoesAdicionaisPericias.length > 0
          ? {
              ...(equipamentoUsaPericiaPersonalizada(equipamentoSelecionado) &&
              periciaPersonalizada
                ? { periciaCodigo: periciaPersonalizada }
                : {}),
              ...(funcoesAdicionaisPericias.length > 0
                ? { funcoesAdicionaisPericias }
                : {}),
            }
          : undefined,
    };

    const itensAtualizados = await sincronizarInventario([...props.itensInventario, novoItem]);
    props.onChangeItensInventario(itensAtualizados);
    fecharModal();
  }, [
    equipamentoSelecionado,
    quantidade,
    equipado,
    nomeCustomizado,
    modificacoesSelecionadas,
    periciaPersonalizada,
    funcoesAdicionaisPericias,
    props,
    fecharModal,
    sincronizarInventario,
  ]);

  const abrirEdicaoItem = useCallback(
    (item: ItemInventarioPayload, indice: number) => {
      setItemEditando(item);
      setIndiceItemEditando(indice);
      setQuantidadeEditando(item.quantidade);
      setModificacoesEditando(item.modificacoesIds || []);
      setNomeCustomizadoEditando(item.nomeCustomizado || '');
      setEquipadoEditando(item.equipado);
      setPericiaPersonalizadaEditando(item.estado?.periciaCodigo ?? '');
      setFuncoesAdicionaisPericiasEditando(
        item.estado?.funcoesAdicionaisPericias ?? [],
      );
      setStepAtual('editar-item');
      setModalAberto(true);
    },
    [],
  );

  const confirmarEdicaoItem = useCallback(async () => {
    if (!itemEditando || indiceItemEditando === null) return;
    if (
      modificacoesEditando.some((modId) => {
        const mod = modificacoes.find((itemMod) => itemMod.id === modId);
        return mod?.codigo === CODIGO_MOD_FUNCAO_ADICIONAL;
      }) &&
      funcoesAdicionaisPericiasEditando.length === 0
    ) {
      setErroValidacao('Selecione ao menos uma pericia extra para Funcao Adicional.');
      return;
    }

    const itemAtualizado: ItemInventarioPayload = {
      equipamentoId: itemEditando.equipamentoId,
      quantidade: quantidadeEditando,
      equipado: equipadoEditando,
      modificacoesIds: modificacoesEditando,
      nomeCustomizado: nomeCustomizadoEditando.trim() || null,
      notas: itemEditando.notas || null,
      estado:
        equipamentoUsaPericiaPersonalizada(
          equipamentoPorId.get(itemEditando.equipamentoId),
        ) || funcoesAdicionaisPericiasEditando.length > 0
          ? {
              ...(equipamentoUsaPericiaPersonalizada(
                equipamentoPorId.get(itemEditando.equipamentoId),
              ) && periciaPersonalizadaEditando
                ? { periciaCodigo: periciaPersonalizadaEditando }
                : {}),
              ...(funcoesAdicionaisPericiasEditando.length > 0
                ? { funcoesAdicionaisPericias: funcoesAdicionaisPericiasEditando }
                : {}),
            }
          : undefined,
    };

    const novosItens = [...props.itensInventario];
    novosItens[indiceItemEditando] = itemAtualizado;

    const itensAtualizados = await sincronizarInventario(novosItens);
    props.onChangeItensInventario(itensAtualizados);
    fecharModal();
  }, [
    itemEditando,
    indiceItemEditando,
    quantidadeEditando,
    modificacoesEditando,
    nomeCustomizadoEditando,
    equipadoEditando,
    periciaPersonalizadaEditando,
    funcoesAdicionaisPericiasEditando,
    equipamentoPorId,
    modificacoes,
    props,
    fecharModal,
    sincronizarInventario,
  ]);

  const removerItem = useCallback((index: number) => {
    setItemToRemove(index);
    setConfirmDialogOpen(true);
  }, []);

  const confirmarRemocao = useCallback(async () => {
    if (itemToRemove !== null) {
      const novosItens = props.itensInventario.filter((_, i) => i !== itemToRemove);
      const itensAtualizados = await sincronizarInventario(novosItens);
      props.onChangeItensInventario(itensAtualizados);
      setItemToRemove(null);
    }
  }, [itemToRemove, props, sincronizarInventario]);

  const duplicarItem = useCallback(
    async (item: ItemInventarioPayload) => {
      const novoItem = { ...item };
      const itensAtualizados = await sincronizarInventario([...props.itensInventario, novoItem]);
      props.onChangeItensInventario(itensAtualizados);
    },
    [props, sincronizarInventario],
  );

  const handleToggleModificacao = useCallback((mod: ModificacaoCatalogo, checked: boolean) => {
    setModificacoesSelecionadas((atual) => {
      if (checked) {
        if (atual.some((item) => item.id === mod.id)) return atual;
        return [...atual, mod];
      }

      if (mod.codigo === CODIGO_MOD_FUNCAO_ADICIONAL) {
        setFuncoesAdicionaisPericias([]);
      }
      return atual.filter((item) => item.id !== mod.id);
    });
  }, []);

  const handleToggleModificacaoEdicao = useCallback((modId: number, checked: boolean) => {
    setModificacoesEditando((atual) => {
      if (checked) {
        if (atual.includes(modId)) return atual;
        return [...atual, modId];
      }

      const mod = modificacoes.find((itemMod) => itemMod.id === modId);
      if (mod?.codigo === CODIGO_MOD_FUNCAO_ADICIONAL) {
        setFuncoesAdicionaisPericiasEditando([]);
      }
      return atual.filter((id) => id !== modId);
    });
  }, [modificacoes]);

  return (
    <>
      <SectionCard title="Inventário">
        <div className="space-y-6">
            {/* Grau Xamã */}
            <InventarioGrauXama
              grauXama={grauXama}
              itensInventario={props.itensInventario}
              equipamentos={equipamentos}
              creditoCategoriaBonus={props.creditoCategoriaBonus}
            />

            {/* Capacidade de Carga */}
            <InventarioCapacidadeCarga
              espacosBase={espacosBase}
              espacosExtra={espacosExtra}
              espacosTotal={espacosTotal}
              espacosOcupados={espacosOcupados}
              espacosRestantes={espacosRestantes}
            />

            {/* Alerta de Sistema de Vestir */}
            {props.itensInventario.length > 0 && (
              <InventarioAlertaVestir
                itens={props.itensInventario}
                equipamentos={equipamentos}
                className="mt-4"
              />
            )}

            {/* Lista de Itens */}
            <div>
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-sm font-semibold text-app-fg flex items-center gap-2">
                  <Icon name="briefcase" className="w-4 h-4 text-app-primary" />
                  Itens ({itensFiltrados.length}
                  {props.itensInventario.length !== itensFiltrados.length &&
                    ` de ${props.itensInventario.length}`}
                  )
                </h3>
                <div className="flex items-center gap-2">
                  <Button
                    onClick={() => {
                      setErroCriarEquipamento(null);
                      setModalCriarEquipamentoAberto(true);
                    }}
                    variant="secondary"
                    size="sm"
                  >
                    <Icon name="sparkles" className="w-4 h-4 mr-1" />
                    Criar equipamento próprio
                  </Button>
                  <Button
                    onClick={abrirModal}
                    variant="primary"
                    size="sm"
                    disabled={carregandoSincronizacao}
                  >
                    <Icon name="add" className="w-4 h-4 mr-1" />
                    Adicionar
                  </Button>
                </div>
              </div>

              {/* Filtros */}
              {props.itensInventario.length > 0 && (
                <div className="flex gap-2 mb-3 flex-wrap">
                  <select
                    value={filtroCategoria}
                    onChange={(e) => setFiltroCategoria(e.target.value)}
                    className="px-3 py-2 rounded-lg border border-app-border bg-app-surface text-app-fg text-sm focus:outline-none focus:ring-2 focus:ring-app-primary"
                  >
                    <option value="TODOS">Todas as categorias</option>
                    <option value="0">Cat. 0 (Comum)</option>
                    <option value="4">Cat. 4</option>
                    <option value="3">Cat. 3</option>
                    <option value="2">Cat. 2</option>
                    <option value="1">Cat. 1</option>
                    <option value="ESPECIAL">Cat. Especial</option>
                  </select>

                  <div className="flex-1 min-w-[200px]">
                    <Input
                      placeholder="Buscar por nome ou código..."
                      value={buscaItem}
                      onChange={(e) => setBuscaItem(e.target.value)}
                      icon="search"
                    />
                  </div>

                  {(filtroCategoria !== 'TODOS' || buscaItem.trim()) && (
                    <Button
                      onClick={() => {
                        setFiltroCategoria('TODOS');
                        setBuscaItem('');
                      }}
                      variant="secondary"
                      size="sm"
                    >
                      <Icon name="close" className="w-4 h-4 mr-1" />
                      Limpar
                    </Button>
                  )}
                </div>
              )}

              {itensFiltrados.length === 0 ? (
                <EmptyState
                  description={
                    props.itensInventario.length === 0
                      ? 'Nenhum item adicionado'
                      : 'Nenhum item encontrado com esses filtros'
                  }
                />
              ) : (
                <div className="space-y-2">
                  {itensRenderizados.map(({ item, indexOriginal }) => {
                    const equip = equipamentoPorId.get(item.equipamentoId);
                    if (!equip) return null;

                    return (
                      <InventarioItemCard
                        key={`${item.equipamentoId}-${indexOriginal}`}
                        item={item}
                        equipamento={equip}
                        modificacoes={modificacoes}
                        pericias={props.pericias}
                        onEdit={() => abrirEdicaoItem(item, indexOriginal)}
                        onDuplicate={() => duplicarItem(item)}
                        onRemove={() => removerItem(indexOriginal)}
                      />
                    );
                  })}

                  {itensFiltrados.length > limiteRenderItens && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full"
                      onClick={() =>
                        setLimiteRenderItens((atual) =>
                          Math.min(itensFiltrados.length, atual + LIMITE_RENDER_ITENS_INICIAL),
                        )
                      }
                    >
                      Mostrar mais ({itensFiltrados.length - limiteRenderItens} restantes)
                    </Button>
                  )}
                </div>
              )}
            </div>
        </div>
      </SectionCard>

      {/* MODAL */}
      {modalAberto && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="w-full max-w-2xl rounded-lg border border-app-border bg-app-surface shadow-lg overflow-hidden max-h-[90vh] flex flex-col">
            {/* Header */}
            <div className="p-6 overflow-y-auto flex-1">
              <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-app-fg flex items-center gap-2">
                    <span className="bg-app-primary text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">
                      {stepAtual === 'categoria' && '1'}
                      {stepAtual === 'equipamento' && '2'}
                      {stepAtual === 'modificacoes' && '3'}
                      {stepAtual === 'review' && '4'}
                      {stepAtual === 'editar-item' && '✎'}
                    </span>
                    {stepAtual === 'categoria' && 'Escolher Categoria'}
                    {stepAtual === 'equipamento' && 'Selecionar Equipamento'}
                    {stepAtual === 'modificacoes' && 'Modificações (Opcional)'}
                    {stepAtual === 'review' && 'Revisar Adição'}
                    {stepAtual === 'editar-item' && 'Editar Item'}
                  </h3>
                  <button
                    onClick={fecharModal}
                    className="text-app-muted hover:text-app-fg transition-colors"
                    title="Fechar"
                  >
                    <Icon name="close" className="w-5 h-5" />
                  </button>
                </div>

                {stepAtual !== 'editar-item' && (
                  <>
                    <div className="flex gap-2">
                      {(['categoria', 'equipamento', 'modificacoes', 'review'] as const).map(
                        (step, idx) => (
                          <div
                            key={step}
                            className={`flex-1 h-1 rounded-full transition-all ${
                              ['categoria', 'equipamento', 'modificacoes', 'review'].indexOf(
                                stepAtual,
                              ) >= idx
                                ? 'bg-app-primary'
                                : 'bg-app-border'
                            }`}
                          />
                        ),
                      )}
                    </div>
                    <p className="text-xs text-app-muted mt-2">
                      Passo{' '}
                      {['categoria', 'equipamento', 'modificacoes', 'review'].indexOf(
                        stepAtual,
                      ) + 1}{' '}
                      de 4
                    </p>
                  </>
                )}
              </div>

              {/* Content */}
              {stepAtual === 'categoria' && (
                <InventarioModalCategoria
                  categoriaAtiva={categoriaAtiva}
                  equipamentosPorCategoria={equipamentosPorCategoria}
                  onSelectCategoria={(cat) => {
                    setCategoriaAtiva(cat);
                    setBuscaEquipamento('');
                    avancarStep();
                  }}
                />
              )}

              {stepAtual === 'equipamento' && (
                <InventarioModalEquipamento
                  key={`equipamento-${categoriaAtiva}`}
                  busca={buscaEquipamento}
                  onBuscaChange={setBuscaEquipamento}
                  equipamentosFiltrados={equipamentosFiltrados}
                  equipamentoSelecionado={equipamentoSelecionado}
                  onSelectEquipamento={setEquipamentoSelecionado}
                />
              )}

              {stepAtual === 'modificacoes' && equipamentoSelecionado && (
                <InventarioModalModificacoes
                  key={`modificacoes-${equipamentoSelecionado.id}`}
                  equipamento={equipamentoSelecionado}
                  modificacoesCompativeis={modificacoesCompativeis}
                  modificacoesSelecionadas={modificacoesSelecionadas}
                  onToggleModificacao={handleToggleModificacao}
                />
              )}

              {stepAtual === 'review' && equipamentoSelecionado && (
                <InventarioModalReview
                  equipamento={equipamentoSelecionado}
                  periciasElegiveis={periciasElegiveisPersonalizacao}
                  modificacoesSelecionadas={modificacoesSelecionadas}
                  quantidade={quantidade}
                  equipado={equipado}
                  ignorarLimites={ignorarLimites}
                  nomeCustomizado={nomeCustomizado}
                  periciaPersonalizada={periciaPersonalizada}
                  funcoesAdicionaisPericias={funcoesAdicionaisPericias}
                  preview={preview}
                  carregandoPreview={carregandoPreview}
                  erroValidacao={erroValidacao}
                  espacosOcupados={espacosOcupados}
                  espacosTotal={espacosTotal}
                  equipamentos={equipamentos}
                  itensInventario={props.itensInventario}
                  onQuantidadeChange={setQuantidade}
                  onEquipadoChange={handleEquipadoChange}
                  onIgnorarLimitesChange={setIgnorarLimites}
                  onNomeCustomizadoChange={setNomeCustomizado}
                  onPericiaPersonalizadaChange={setPericiaPersonalizada}
                  onFuncoesAdicionaisPericiasChange={setFuncoesAdicionaisPericias}
                />
              )}

              {stepAtual === 'editar-item' && itemEditando && (
                <InventarioModalEditar
                  item={itemEditando}
                  periciasElegiveis={periciasElegiveisPersonalizacao}
                  quantidade={quantidadeEditando}
                  modificacoesIds={modificacoesEditando}
                  modificacoesCompativeis={modificacoesCompativeisEdicao}
                  equipamentos={equipamentos}
                  nomeCustomizado={nomeCustomizadoEditando}
                  equipado={equipadoEditando}
                  periciaPersonalizada={periciaPersonalizadaEditando}
                  funcoesAdicionaisPericias={funcoesAdicionaisPericiasEditando}
                  onQuantidadeChange={setQuantidadeEditando}
                  onToggleModificacao={handleToggleModificacaoEdicao}
                  onNomeCustomizadoChange={setNomeCustomizadoEditando}
                  onEquipadoChange={handleEquipadoEditandoChange}
                  onPericiaPersonalizadaChange={setPericiaPersonalizadaEditando}
                  onFuncoesAdicionaisPericiasChange={setFuncoesAdicionaisPericiasEditando}
                />
              )}
            </div>

            {/* Footer */}
            <div className="flex gap-2 p-6 pt-0 border-t border-app-border bg-app-surface">
              <Button onClick={retrocederStep} variant="secondary" className="flex-1">
                {stepAtual === 'categoria' || stepAtual === 'editar-item' ? (
                  <>
                    <Icon name="close" className="w-4 h-4 mr-1" />
                    Cancelar
                  </>
                ) : (
                  <>
                    <Icon name="back" className="w-4 h-4 mr-1" />
                    Voltar
                  </>
                )}
              </Button>

              {stepAtual !== 'review' && stepAtual !== 'editar-item' && (
                <>
                  {stepAtual === 'equipamento' && (
                    <Button
                      onClick={() => {
                        setErroCriarEquipamento(null);
                        setModalCriarEquipamentoAberto(true);
                      }}
                      variant="secondary"
                      className="flex-1"
                    >
                      <Icon name="sparkles" className="w-4 h-4 mr-1" />
                      Criar equipamento próprio
                    </Button>
                  )}
                  <Button
                    onClick={avancarStep}
                    variant="primary"
                    className="flex-1"
                    disabled={stepAtual === 'equipamento' && !equipamentoSelecionado}
                  >
                    Continuar
                    <Icon name="forward" className="w-4 h-4 ml-1" />
                  </Button>
                </>
              )}

              {stepAtual === 'review' && (
                <Button
                  onClick={confirmarAdicao}
                  variant="primary"
                  className="flex-1"
                  disabled={!podeSalvarAdicaoItem}
                >
                  <Icon name="check" className="w-4 h-4 mr-1" />
                  {carregandoSincronizacao ? 'Calculando...' : 'Adicionar Item'}
                </Button>
              )}

              {stepAtual === 'editar-item' && (
                <Button
                  onClick={confirmarEdicaoItem}
                  variant="primary"
                  className="flex-1"
                  disabled={!podeSalvarEdicaoItem}
                >
                  <Icon name="check" className="w-4 h-4 mr-1" />
                  {carregandoSincronizacao ? 'Calculando...' : 'Salvar Edição'}
                </Button>
              )}
            </div>
          </div>
        </div>
      )}

      <Modal
        isOpen={modalCriarEquipamentoAberto}
        onClose={() => setModalCriarEquipamentoAberto(false)}
        title="Criar equipamento próprio"
        size="xl"
      >
        <div className="space-y-4">
          <p className="text-sm text-app-muted">
            Crie um equipamento homebrew reutilizável e já o deixe pronto para entrar neste inventário.
          </p>
          {erroCriarEquipamento && (
            <div className="rounded-lg border border-app-danger/30 bg-app-danger/10 px-3 py-2 text-sm text-app-danger">
              {erroCriarEquipamento}
            </div>
          )}
          <HomebrewForm
            initialValues={{ tipo: TipoHomebrewConteudo.EQUIPAMENTO }}
            onCancel={() => setModalCriarEquipamentoAberto(false)}
            onSubmit={handleCriarEquipamentoHomebrew}
          />
        </div>
      </Modal>

      {/* ConfirmDialog */}
      <ConfirmDialog
        isOpen={confirmDialogOpen}
        onClose={() => {
          setConfirmDialogOpen(false);
          setItemToRemove(null);
        }}
        onConfirm={confirmarRemocao}
        title="Remover item do inventário"
        description={
          itemToRemove !== null && props.itensInventario[itemToRemove] ? (
            <>
              Deseja remover{' '}
              {(() => {
                const item = props.itensInventario[itemToRemove];
                const equip = equipamentoPorId.get(item.equipamentoId);
                return item.nomeCustomizado || equip?.nome;
              })()}{' '}
              deste item do inventário?
            </>
          ) : (
            'Tem certeza que deseja remover este item do inventário?'
          )
        }
        confirmLabel="Remover"
        cancelLabel="Cancelar"
        variant="danger"
      >
        {itemToRemove !== null && props.itensInventario[itemToRemove] && (
          <div className="rounded-lg border border-app-border bg-app-bg p-3 text-sm">
            <div className="flex items-center gap-2 text-app-muted">
              <Icon name="info" className="h-4 w-4" />
              <span>Esta ação não pode ser desfeita.</span>
            </div>
          </div>
        )}
      </ConfirmDialog>
    </>
  );
}
