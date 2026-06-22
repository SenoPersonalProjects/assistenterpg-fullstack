'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorAlert } from '@/components/ui/ErrorAlert';
import { Modal } from '@/components/ui/Modal';
import { Icon } from '@/components/ui/Icon';
import { Select } from '@/components/ui/Select';
import { InventarioModalEquipamento } from '@/components/personagem-base/create/modal/InventarioModalEquipamento';
import { InventarioModalEditar } from '@/components/personagem-base/create/modal/InventarioModalEditar';
import {
  apiAdicionarItemInventarioCampanha,
  apiAplicarModificacaoInventarioCampanha,
  apiAtualizarItemInventarioCampanha,
  apiGetCatalogosBasicos,
  apiGetInventarioCampanhaCompleto,
  apiGetModificacoesCompativeis,
  apiGetTodosEquipamentos,
  apiRemoverItemInventarioCampanha,
  apiRemoverModificacaoInventarioCampanha,
  criarErroUsuario,
} from '@/lib/api';
import type {
  EfeitoConsumoEquipamento,
  EfeitoConsumoRecurso,
  EquipamentoCatalogo,
  InventarioCampanhaCompletoDto,
  ItemInventarioDto,
  ModificacaoCatalogo,
  PericiaCatalogo,
 UserErrorState } from '@/lib/types';
import {
  calcularCategoriaFinal,
  CODIGO_MOD_FUNCAO_ADICIONAL,
  contarModificacoesEfetivasItem,
  filtrarModificacoesCompativeis,
  extrairFuncoesAdicionaisPericias,
  getIconeTipo,
  equipamentoUsaPericiaPersonalizada,
  listarPericiasElegiveisItemPersonalizado,
} from '@/lib/utils/inventario';

type SessionCharacterInventoryTabProps = {
  campanhaId: number;
  personagemCampanhaId: number;
  personagemSessaoId?: number;
  podeEditar: boolean;
  ativo?: boolean;
  limitesCategoriaAtivo?: boolean;
  sessaoEncerrada?: boolean;
  consumirComCalmaAtivo?: boolean;
  alvosPersonagens?: Array<{
    personagemSessaoId: number;
    personagemCampanhaId: number;
    nomePersonagem: string;
  }>;
  alvosNpcs?: Array<{
    npcSessaoId: number;
    nome: string;
  }>;
  onConsumirItem?: (payload: {
    itemInventarioCampanhaId: number;
    modo: 'NORMAL' | 'COM_CALMA' | 'MANUAL';
    alvoTipo?: 'PERSONAGEM' | 'NPC';
    alvoId?: number;
    observacao?: string;
  }) => Promise<void>;
};

type EtapaAdicionar = 'SELECIONAR' | 'DETALHES';
type ModoConsumo = 'NORMAL' | 'COM_CALMA';

type ModalConsumoState = {
  item: ItemInventarioDto;
  modo: ModoConsumo;
  alvoTipo: 'PERSONAGEM' | 'NPC';
  alvoId: string;
};

const RECURSO_LABEL: Record<EfeitoConsumoRecurso['recurso'], string> = {
  PV: 'PV',
  EA: 'EA',
  PE: 'PE',
  SAN: 'Sanidade',
};

function calcularMaximoDados(dados?: string, bonus = 0, fixo?: number) {
  if (typeof fixo === 'number') return fixo + bonus;
  if (!dados) return bonus;
  const match = /^(\d+)d(\d+)$/i.exec(dados.trim());
  if (!match) return null;
  return Number(match[1]) * Number(match[2]) + bonus;
}

function descreverEfeitoConsumo(efeito?: EfeitoConsumoEquipamento | null) {
  if (!efeito) return 'Este consumível ainda não tem automação.';
  if (!efeito.automatizado) {
    return efeito.motivo || 'Este consumível ainda não tem automação.';
  }
  const descricoes =
    efeito.efeitos?.map((item) => {
      if (item.tipo !== 'RECURSO') return 'Efeito não automatizado';
      const expressao = item.fixo
        ? String(item.fixo)
        : `${item.dados ?? '0'}${item.bonus ? `+${item.bonus}` : ''}`;
      const maximo = calcularMaximoDados(item.dados, item.bonus ?? 0, item.fixo);
      return `${RECURSO_LABEL[item.recurso]}: ${expressao}${
        maximo !== null ? ` (máximo ${maximo})` : ''
      }`;
    }) ?? [];
  return descricoes.length > 0 ? descricoes.join('; ') : 'Efeito automatizado.';
}

function listarPreviasConsumo(efeito?: EfeitoConsumoEquipamento | null) {
  if (!efeito?.automatizado) return [];
  return (
    efeito.efeitos
      ?.filter((item): item is EfeitoConsumoRecurso => item.tipo === 'RECURSO')
      .map((item) => {
        const expressao = item.fixo
          ? String(item.fixo)
          : `${item.dados ?? '0'}${item.bonus ? `+${item.bonus}` : ''}`;
        const maximo = calcularMaximoDados(item.dados, item.bonus ?? 0, item.fixo);
        return {
          recurso: RECURSO_LABEL[item.recurso],
          expressao,
          maximo,
        };
      }) ?? []
  );
}

function efeitoPermiteConsumirComCalma(efeito?: EfeitoConsumoEquipamento | null) {
  if (!efeito?.automatizado || !efeito.efeitos?.length) return false;
  return efeito.efeitos.every((item) => {
    if (item.tipo !== 'RECURSO') return false;
    if (item.permiteConsumirComCalma === false) return false;
    return calcularMaximoDados(item.dados, item.bonus ?? 0, item.fixo) !== null;
  });
}

export function SessionCharacterInventoryTab({
  campanhaId,
  personagemCampanhaId,
  personagemSessaoId,
  podeEditar,
  ativo = false,
  limitesCategoriaAtivo = false,
  sessaoEncerrada = false,
  consumirComCalmaAtivo = false,
  alvosPersonagens = [],
  alvosNpcs = [],
  onConsumirItem,
}: SessionCharacterInventoryTabProps) {
  const [inventario, setInventario] = useState<InventarioCampanhaCompletoDto | null>(
    null,
  );
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState<UserErrorState | null>(null);

  const [modalAdicionarAberto, setModalAdicionarAberto] = useState(false);
  const [etapaAdicionar, setEtapaAdicionar] = useState<EtapaAdicionar>('SELECIONAR');
  const [buscaEquipamento, setBuscaEquipamento] = useState('');
  const [equipamentoSelecionado, setEquipamentoSelecionado] =
    useState<EquipamentoCatalogo | null>(null);
  const [quantidadeAdicionar, setQuantidadeAdicionar] = useState(1);
  const [equipadoAdicionar, setEquipadoAdicionar] = useState(false);
  const [nomeCustomizadoAdicionar, setNomeCustomizadoAdicionar] = useState('');
  const [periciaPersonalizadaAdicionar, setPericiaPersonalizadaAdicionar] = useState('');
  const [funcoesAdicionaisPericiasAdicionar, setFuncoesAdicionaisPericiasAdicionar] = useState<string[]>([]);
  const [modificacoesAdicionar, setModificacoesAdicionar] = useState<number[]>([]);
  const [modificacoesCompatAdicionar, setModificacoesCompatAdicionar] =
    useState<ModificacaoCatalogo[]>([]);

  const [modalEditarItem, setModalEditarItem] = useState<ItemInventarioDto | null>(
    null,
  );
  const [quantidadeEditando, setQuantidadeEditando] = useState(1);
  const [equipadoEditando, setEquipadoEditando] = useState(false);
  const [nomeCustomizadoEditando, setNomeCustomizadoEditando] = useState('');
  const [periciaPersonalizadaEditando, setPericiaPersonalizadaEditando] = useState('');
  const [funcoesAdicionaisPericiasEditando, setFuncoesAdicionaisPericiasEditando] = useState<string[]>([]);
  const [modificacoesEditando, setModificacoesEditando] = useState<number[]>([]);
  const [modificacoesCompatEditando, setModificacoesCompatEditando] =
    useState<ModificacaoCatalogo[]>([]);

  const [equipamentos, setEquipamentos] = useState<EquipamentoCatalogo[]>([]);
  const [pericias, setPericias] = useState<PericiaCatalogo[]>([]);
  const [carregandoCatalogos, setCarregandoCatalogos] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [modalConsumo, setModalConsumo] = useState<ModalConsumoState | null>(null);
  const [consumindoItemId, setConsumindoItemId] = useState<number | null>(null);

  const carregarInventario = useCallback(async () => {
    setCarregando(true);
    setErro(null);
    try {
      const data = await apiGetInventarioCampanhaCompleto(
        campanhaId,
        personagemCampanhaId,
      );
      setInventario(data);
    } catch (error) {
      setErro(criarErroUsuario(error));
    } finally {
      setCarregando(false);
    }
  }, [campanhaId, personagemCampanhaId]);

  useEffect(() => {
    if (!ativo) return;
    if (inventario) return;
    void carregarInventario();
  }, [ativo, inventario, carregarInventario]);

  const carregarCatalogos = useCallback(async () => {
    if (equipamentos.length > 0 && pericias.length > 0) return;
    setCarregandoCatalogos(true);
    try {
      const [lista, catalogosBasicos] = await Promise.all([
        apiGetTodosEquipamentos(),
        apiGetCatalogosBasicos(),
      ]);
      setEquipamentos(lista);
      setPericias(catalogosBasicos.pericias);
    } catch (error) {
      setErro(criarErroUsuario(error));
    } finally {
      setCarregandoCatalogos(false);
    }
  }, [equipamentos.length, pericias.length]);

  const equipamentosFiltrados = useMemo(() => {
    if (!buscaEquipamento.trim()) return equipamentos;
    const termo = buscaEquipamento.trim().toLowerCase();
    return equipamentos.filter(
      (equip) =>
        equip.nome.toLowerCase().includes(termo) ||
        equip.codigo.toLowerCase().includes(termo),
    );
  }, [buscaEquipamento, equipamentos]);

  const resumoEspacos = inventario?.espacos;
  const itensSessao = inventario?.itensSessao ?? [];
  const periciasElegiveisAdicionar = useMemo(
    () =>
      equipamentoSelecionado
        ? listarPericiasElegiveisItemPersonalizado(pericias)
        : pericias,
    [equipamentoSelecionado, pericias],
  );
  const periciasElegiveisEdicao = useMemo(() => {
    if (!modalEditarItem) return pericias;
    return listarPericiasElegiveisItemPersonalizado(pericias);
  }, [modalEditarItem, pericias]);
  const excedentesCategoria =
    limitesCategoriaAtivo && inventario?.limitesCategoria?.excedentes?.length
      ? inventario.limitesCategoria.excedentes
      : [];

  const abrirModalAdicionar = () => {
    setEtapaAdicionar('SELECIONAR');
    setEquipamentoSelecionado(null);
    setBuscaEquipamento('');
    setQuantidadeAdicionar(1);
    setEquipadoAdicionar(false);
    setNomeCustomizadoAdicionar('');
    setPericiaPersonalizadaAdicionar('');
    setFuncoesAdicionaisPericiasAdicionar([]);
    setModificacoesAdicionar([]);
    setModificacoesCompatAdicionar([]);
    setModalAdicionarAberto(true);
    void carregarCatalogos();
  };

  const abrirModalConsumo = (item: ItemInventarioDto) => {
    // Busca o dono do item na cena (pode ser pelo personagemCampanhaId ou personagemSessaoId)
    const personagemDono = alvosPersonagens.find(
      (alvo) =>
        alvo.personagemCampanhaId === personagemCampanhaId ||
        (typeof personagemSessaoId === 'number' &&
          alvo.personagemSessaoId === personagemSessaoId),
    );

    const alvoInicial = personagemDono || alvosPersonagens[0] || null;
    const npcInicial = alvosNpcs[0] || null;

    setModalConsumo({
      item,
      modo: 'NORMAL',
      alvoTipo: alvoInicial ? 'PERSONAGEM' : 'NPC',
      alvoId: alvoInicial
        ? String(alvoInicial.personagemSessaoId)
        : npcInicial
          ? String(npcInicial.npcSessaoId)
          : '',
    });
  };

  const consumirItem = async (payload: {
    item: ItemInventarioDto;
    modo: 'NORMAL' | 'COM_CALMA' | 'MANUAL';
    alvoTipo?: 'PERSONAGEM' | 'NPC';
    alvoId?: number;
    observacao?: string;
  }) => {
    if (!onConsumirItem) return;
    setConsumindoItemId(payload.item.id);
    setErro(null);
    try {
      await onConsumirItem({
        itemInventarioCampanhaId: payload.item.id,
        modo: payload.modo,
        alvoTipo: payload.alvoTipo,
        alvoId: payload.alvoId,
        observacao: payload.observacao,
      });
      await carregarInventario();
      setModalConsumo(null);
    } catch (error) {
      setErro(criarErroUsuario(error));
    } finally {
      setConsumindoItemId(null);
    }
  };

  const confirmarConsumo = async () => {
    if (!modalConsumo) return;
    const alvoId = Number(modalConsumo.alvoId);
    if (!Number.isInteger(alvoId) || alvoId <= 0) {
      setErro('Escolha um alvo para consumir este item.');
      return;
    }
    await consumirItem({
      item: modalConsumo.item,
      modo: modalConsumo.modo,
      alvoTipo: modalConsumo.alvoTipo,
      alvoId,
    });
  };

  const fecharModalAdicionar = () => {
    setModalAdicionarAberto(false);
  };

  const avancarEtapaAdicionar = async () => {
    if (!equipamentoSelecionado) return;
    setEtapaAdicionar('DETALHES');
    try {
      const mods = await apiGetModificacoesCompativeis(
        equipamentoSelecionado.id,
      );
      setModificacoesCompatAdicionar(mods);
    } catch (error) {
      setErro(criarErroUsuario(error));
    }
  };

  const salvarItemAdicionado = async () => {
    if (!equipamentoSelecionado) return;
    setSalvando(true);
    setErro(null);
    try {
      await apiAdicionarItemInventarioCampanha(campanhaId, personagemCampanhaId, {
        equipamentoId: equipamentoSelecionado.id,
        quantidade: quantidadeAdicionar,
        equipado: equipadoAdicionar,
        nomeCustomizado: nomeCustomizadoAdicionar.trim() || undefined,
        modificacoes: modificacoesAdicionar,
        estado:
          equipamentoUsaPericiaPersonalizada(equipamentoSelecionado) ||
          funcoesAdicionaisPericiasAdicionar.length > 0
          ? {
              ...(equipamentoUsaPericiaPersonalizada(equipamentoSelecionado) &&
              periciaPersonalizadaAdicionar
                ? { periciaCodigo: periciaPersonalizadaAdicionar }
                : {}),
              ...(funcoesAdicionaisPericiasAdicionar.length > 0
                ? { funcoesAdicionaisPericias: funcoesAdicionaisPericiasAdicionar }
                : {}),
            }
          : undefined,
      });
      await carregarInventario();
      setModalAdicionarAberto(false);
    } catch (error) {
      setErro(criarErroUsuario(error));
    } finally {
      setSalvando(false);
    }
  };

  const abrirEdicaoItem = async (item: ItemInventarioDto) => {
    setModalEditarItem(item);
    setQuantidadeEditando(item.quantidade);
    setEquipadoEditando(item.equipado);
    setNomeCustomizadoEditando(item.nomeCustomizado ?? '');
    setPericiaPersonalizadaEditando(item.estado?.periciaCodigo ?? '');
    setFuncoesAdicionaisPericiasEditando(
      item.estado?.funcoesAdicionaisPericias ?? [],
    );
    setModificacoesEditando(item.modificacoes.map((mod) => mod.id));
    void carregarCatalogos();
    try {
      const mods = await apiGetModificacoesCompativeis(item.equipamentoId);
      setModificacoesCompatEditando(mods);
    } catch (error) {
      setErro(criarErroUsuario(error));
    }
  };

  const salvarEdicaoItem = async () => {
    if (!modalEditarItem) return;
    setSalvando(true);
    setErro(null);
    try {
      await apiAtualizarItemInventarioCampanha(
        campanhaId,
        personagemCampanhaId,
        modalEditarItem.id,
        {
          quantidade: quantidadeEditando,
          equipado: equipadoEditando,
          nomeCustomizado: nomeCustomizadoEditando.trim() || undefined,
          estado:
            equipamentoUsaPericiaPersonalizada(modalEditarItem.equipamento) ||
            funcoesAdicionaisPericiasEditando.length > 0
            ? {
                ...(equipamentoUsaPericiaPersonalizada(modalEditarItem.equipamento) &&
                periciaPersonalizadaEditando
                  ? { periciaCodigo: periciaPersonalizadaEditando }
                  : {}),
                ...(funcoesAdicionaisPericiasEditando.length > 0
                  ? { funcoesAdicionaisPericias: funcoesAdicionaisPericiasEditando }
                  : {}),
              }
            : undefined,
        },
      );

      const atuais = new Set(modalEditarItem.modificacoes.map((mod) => mod.id));
      const desejadas = new Set(modificacoesEditando);

      const paraAdicionar = [...desejadas].filter((id) => !atuais.has(id));
      const paraRemover = [...atuais].filter((id) => !desejadas.has(id));

      for (const modId of paraAdicionar) {
        await apiAplicarModificacaoInventarioCampanha(
          campanhaId,
          personagemCampanhaId,
          modalEditarItem.id,
          { modificacaoId: modId },
        );
      }

      for (const modId of paraRemover) {
        await apiRemoverModificacaoInventarioCampanha(
          campanhaId,
          personagemCampanhaId,
          modalEditarItem.id,
          modId,
        );
      }

      await carregarInventario();
      setModalEditarItem(null);
    } catch (error) {
      setErro(criarErroUsuario(error));
    } finally {
      setSalvando(false);
    }
  };

  const removerItem = async (item: ItemInventarioDto) => {
    if (!window.confirm(`Remover ${item.equipamento.nome} do inventário?`)) {
      return;
    }
    setSalvando(true);
    setErro(null);
    try {
      await apiRemoverItemInventarioCampanha(
        campanhaId,
        personagemCampanhaId,
        item.id,
      );
      await carregarInventario();
    } catch (error) {
      setErro(criarErroUsuario(error));
    } finally {
      setSalvando(false);
    }
  };

  const equipamentosPorId = useMemo(() => {
    return new Map(equipamentos.map((equip) => [equip.id, equip]));
  }, [equipamentos]);

  const modificacoesCompativeisAdicionar = useMemo(() => {
    if (!equipamentoSelecionado) return [];
    const selecionadas = modificacoesCompatAdicionar.filter((mod) =>
      modificacoesAdicionar.includes(mod.id),
    );
    return filtrarModificacoesCompativeis(
      modificacoesCompatAdicionar,
      equipamentoSelecionado,
      selecionadas,
    );
  }, [equipamentoSelecionado, modificacoesCompatAdicionar, modificacoesAdicionar]);

  const modificacoesCompativeisEdicao = useMemo(() => {
    if (!modalEditarItem) return [];
    const equip = equipamentosPorId.get(modalEditarItem.equipamentoId);
    if (!equip) return [];
    const selecionadas = modificacoesCompatEditando.filter((mod) =>
      modificacoesEditando.includes(mod.id),
    );
    return filtrarModificacoesCompativeis(
      modificacoesCompatEditando,
      equip,
      selecionadas,
    );
  }, [
    equipamentosPorId,
    modalEditarItem,
    modificacoesCompatEditando,
    modificacoesEditando,
  ]);

  const exigePericiaPersonalizadaAdicionar = useMemo(
    () =>
      equipamentoSelecionado
        ? equipamentoUsaPericiaPersonalizada(equipamentoSelecionado)
        : false,
    [equipamentoSelecionado],
  );

  const exigePericiaPersonalizadaEdicao = useMemo(() => {
    if (!modalEditarItem) return false;
    return equipamentoUsaPericiaPersonalizada(
      equipamentosPorId.get(modalEditarItem.equipamentoId),
    );
  }, [equipamentosPorId, modalEditarItem]);
  const exigeFuncaoAdicionalAdicionar = useMemo(
    () =>
      modificacoesCompatAdicionar.some(
        (mod) =>
          modificacoesAdicionar.includes(mod.id) &&
          mod.codigo === CODIGO_MOD_FUNCAO_ADICIONAL,
      ),
    [modificacoesAdicionar, modificacoesCompatAdicionar],
  );
  const exigeFuncaoAdicionalEdicao = useMemo(
    () =>
      modificacoesCompatEditando.some(
        (mod) =>
          modificacoesEditando.includes(mod.id) &&
          mod.codigo === CODIGO_MOD_FUNCAO_ADICIONAL,
      ),
    [modificacoesCompatEditando, modificacoesEditando],
  );

  const podeSalvarItemAdicionado =
    !salvando &&
    (!exigePericiaPersonalizadaAdicionar ||
      periciaPersonalizadaAdicionar.trim().length > 0) &&
    (!exigeFuncaoAdicionalAdicionar ||
      funcoesAdicionaisPericiasAdicionar.length > 0);

  const podeSalvarEdicaoItem =
    !salvando &&
    (!exigePericiaPersonalizadaEdicao ||
      periciaPersonalizadaEditando.trim().length > 0) &&
    (!exigeFuncaoAdicionalEdicao ||
      funcoesAdicionaisPericiasEditando.length > 0);

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="space-y-1">
          <p className="text-xs font-semibold text-app-fg">Inventário</p>
          <p className="session-text-xxs text-app-muted">
            Itens vinculados a ficha da campanha.
          </p>
        </div>
        {podeEditar ? (
          <Button size="xs" onClick={abrirModalAdicionar} disabled={salvando}>
            <Icon name="add" className="h-3 w-3" /> Adicionar item
          </Button>
        ) : null}
      </div>

      {erro ? <ErrorAlert message={erro} /> : null}

      {resumoEspacos ? (
        <div className="flex flex-wrap items-center gap-2">
          <Badge size="sm" color={resumoEspacos.sobrecarregado ? 'red' : 'gray'}>
            Espaços {resumoEspacos.espacosOcupados}/{resumoEspacos.espacosTotal}
          </Badge>
          {resumoEspacos.sobrecarregado ? (
            <Badge size="sm" color="red">
              Sobrecarregado
            </Badge>
          ) : null}
          {inventario?.statsEquipados ? (
            <Badge size="sm" color="blue">
              DEF +{inventario.statsEquipados.defesaTotal}
            </Badge>
          ) : null}
        </div>
      ) : null}

      {excedentesCategoria.length > 0 ? (
        <div className="rounded border border-app-warning/40 bg-app-warning/10 px-3 py-2 text-xs text-app-warning space-y-1">
          <p className="font-semibold">Limites de categoria excedidos</p>
          {excedentesCategoria.map((msg) => (
            <p key={msg}>{msg}</p>
          ))}
        </div>
      ) : null}

      {carregando ? (
        <p className="text-xs text-app-muted">Carregando inventário...</p>
      ) : inventario &&
        inventario.itens.length === 0 &&
        itensSessao.length === 0 ? (
        <EmptyState
          variant="session"
          size="sm"
          icon="inventory"
          title="Inventario vazio"
          description="Nenhum item cadastrado para esta ficha."
        />
      ) : (
        <div className="space-y-2">
          {(inventario?.itens ?? []).map((item) => (
            <div
              key={item.id}
              className="rounded border border-app-border bg-app-surface px-3 py-2"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Icon
                      name={getIconeTipo(item.equipamento.tipo)}
                      className="h-4 w-4 text-app-muted"
                    />
                    <p className="text-sm font-semibold text-app-fg">
                      {item.nomeCustomizado || item.equipamento.nome}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge size="sm" color="gray">
                      x{item.quantidade}
                    </Badge>
                    <Badge size="sm" color="gray">
                      {item.categoriaCalculada ??
                        calcularCategoriaFinal(
                          item.equipamento.categoria,
                          contarModificacoesEfetivasItem({
                            modificacoesIds: item.modificacoes.map((mod) => mod.id),
                            modificacoesCatalogo: item.modificacoes,
                            estado: item.estado,
                          }),
                        )}
                    </Badge>
                    {item.equipado ? (
                      <Badge size="sm" color="green">
                        Equipado
                      </Badge>
                    ) : null}
                    {item.modificacoes.length > 0 ? (
                      <Badge size="sm" color="blue">
                        {contarModificacoesEfetivasItem({
                          modificacoesIds: item.modificacoes.map((mod) => mod.id),
                          modificacoesCatalogo: item.modificacoes,
                          estado: item.estado,
                        })} mod.
                      </Badge>
                    ) : null}
                    {equipamentoUsaPericiaPersonalizada(item.equipamento) &&
                    item.estado?.periciaCodigo ? (
                      <Badge size="sm" color="yellow">
                        +2{' '}
                        {pericias.find(
                          (pericia) =>
                            pericia.codigo ===
                            item.estado?.periciaCodigo?.trim().toUpperCase(),
                        )?.nome ?? item.estado.periciaCodigo}
                      </Badge>
                    ) : null}
                    {extrairFuncoesAdicionaisPericias(item.estado).map((codigo) => (
                      <Badge key={codigo} size="sm" color="yellow">
                        +2 {pericias.find((pericia) => pericia.codigo === codigo)?.nome ?? codigo}
                      </Badge>
                    ))}
                  </div>
                </div>
                {podeEditar ? (
                  <div className="flex flex-wrap items-center justify-end gap-2">
                    {item.equipamento.tipoUso === 'CONSUMIVEL' &&
                    consumirComCalmaAtivo &&
                    onConsumirItem ? (
                      item.equipamento.efeitoConsumo?.automatizado ? (
                        <Button
                          size="xs"
                          variant="secondary"
                          onClick={() => abrirModalConsumo(item)}
                          disabled={sessaoEncerrada || consumindoItemId === item.id}
                        >
                          Consumir
                        </Button>
                      ) : (
                        <Button
                          size="xs"
                          variant="ghost"
                          onClick={() =>
                            void consumirItem({
                              item,
                              modo: 'MANUAL',
                              observacao:
                                item.equipamento.efeitoConsumo?.motivo ||
                                'Resolvido manualmente com o mestre.',
                            })
                          }
                          disabled={sessaoEncerrada || consumindoItemId === item.id}
                        >
                          Resolver manualmente
                        </Button>
                      )
                    ) : null}
                    <Button
                      size="xs"
                      variant="ghost"
                      onClick={() => void abrirEdicaoItem(item)}
                    >
                      Editar
                    </Button>
                    <Button
                      size="xs"
                      variant="ghost"
                      onClick={() => void removerItem(item)}
                      disabled={salvando}
                    >
                      Remover
                    </Button>
                  </div>
                ) : null}
              </div>
              {item.equipamento.tipoUso === 'CONSUMIVEL' && consumirComCalmaAtivo ? (
                <div className="mt-2 rounded-xl border border-app-border/40 bg-app-card/60 px-3 py-2 text-xs">
                  <p
                    className={
                      item.equipamento.efeitoConsumo?.automatizado
                        ? 'font-medium text-app-muted'
                        : 'font-bold text-app-warning'
                    }
                  >
                    {item.equipamento.efeitoConsumo?.automatizado
                      ? descreverEfeitoConsumo(item.equipamento.efeitoConsumo)
                      : 'Este consumível ainda não tem automação. Resolva manualmente com o mestre.'}
                  </p>
                  {!item.equipamento.efeitoConsumo?.automatizado &&
                  item.equipamento.efeitoConsumo?.motivo ? (
                    <p className="mt-1 text-app-muted">
                      {item.equipamento.efeitoConsumo.motivo}
                    </p>
                  ) : null}
                </div>
              ) : null}
            </div>
          ))}

          {itensSessao.length > 0 ? (
            <div className="space-y-2">
              <div className="pt-2">
                <p className="text-xs font-semibold text-app-fg">
                  Itens de sessao
                </p>
                <p className="session-text-xxs text-app-muted">
                  Itens encontrados na campanha e atualmente associados a esta
                  ficha.
                </p>
              </div>
              {itensSessao.map((item) => (
                <div
                  key={`sessao-${item.id}`}
                  className="rounded border border-dashed border-app-border bg-app-surface px-3 py-2"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Icon
                        name="inventory"
                        className="h-4 w-4 text-app-muted"
                      />
                      <p className="text-sm font-semibold text-app-fg">
                        {item.nome}
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge size="sm" color="gray">
                        {item.tipo}
                      </Badge>
                      <Badge size="sm" color="gray">
                        {item.categoria}
                      </Badge>
                      <Badge size="sm" color="blue">
                        Peso {item.peso}
                      </Badge>
                      <Badge
                        size="sm"
                        color={item.descricaoRevelada ? 'green' : 'yellow'}
                      >
                        {item.descricaoRevelada
                          ? 'Descrição revelada'
                          : 'Descrição oculta'}
                      </Badge>
                      {item.portadorAtual ? (
                        <Badge size="sm" color="gray">
                          Portador: {item.portadorAtual.nome}
                        </Badge>
                      ) : null}
                    </div>
                    {item.descricao ? (
                      <p className="text-xs text-app-muted">{item.descricao}</p>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          ) : null}
        </div>
      )}

      <Modal
        isOpen={modalAdicionarAberto}
        onClose={fecharModalAdicionar}
        title="Adicionar item ao inventário"
        size="xl"
      >
        <div className="space-y-4">
          {etapaAdicionar === 'SELECIONAR' ? (
            <>
              {carregandoCatalogos ? (
                <p className="text-xs text-app-muted">Carregando catalogo...</p>
              ) : (
                <InventarioModalEquipamento
                  busca={buscaEquipamento}
                  onBuscaChange={setBuscaEquipamento}
                  equipamentosFiltrados={equipamentosFiltrados}
                  equipamentoSelecionado={equipamentoSelecionado}
                  onSelectEquipamento={setEquipamentoSelecionado}
                />
              )}
              <div className="flex items-center justify-end gap-2">
                <Button variant="ghost" onClick={fecharModalAdicionar}>
                  Cancelar
                </Button>
                <Button
                  onClick={() => void avancarEtapaAdicionar()}
                  disabled={!equipamentoSelecionado}
                >
                  Continuar
                </Button>
              </div>
            </>
          ) : (
            <>
              {equipamentoSelecionado ? (
                <InventarioModalEditar
                  item={{
                    equipamentoId: equipamentoSelecionado.id,
                    quantidade: quantidadeAdicionar,
                    equipado: equipadoAdicionar,
                    modificacoesIds: modificacoesAdicionar,
                    nomeCustomizado: nomeCustomizadoAdicionar,
                  }}
                  quantidade={quantidadeAdicionar}
                  modificacoesIds={modificacoesAdicionar}
                  modificacoesCompativeis={modificacoesCompativeisAdicionar}
                  equipamentos={equipamentos}
                  periciasElegiveis={periciasElegiveisAdicionar}
                  nomeCustomizado={nomeCustomizadoAdicionar}
                  periciaPersonalizada={periciaPersonalizadaAdicionar}
                  funcoesAdicionaisPericias={funcoesAdicionaisPericiasAdicionar}
                  equipado={equipadoAdicionar}
                  onQuantidadeChange={setQuantidadeAdicionar}
                  onToggleModificacao={(modId, checked) =>
                    setModificacoesAdicionar((prev) =>
                      checked
                        ? [...prev, modId]
                        : prev.filter((id) => id !== modId),
                    )
                  }
                  onNomeCustomizadoChange={setNomeCustomizadoAdicionar}
                  onEquipadoChange={setEquipadoAdicionar}
                  onPericiaPersonalizadaChange={setPericiaPersonalizadaAdicionar}
                  onFuncoesAdicionaisPericiasChange={setFuncoesAdicionaisPericiasAdicionar}
                />
              ) : null}
              <div className="flex items-center justify-between gap-2">
                <Button
                  variant="ghost"
                  onClick={() => setEtapaAdicionar('SELECIONAR')}
                >
                  Voltar
                </Button>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" onClick={fecharModalAdicionar}>
                    Cancelar
                  </Button>
                  <Button
                    onClick={() => void salvarItemAdicionado()}
                    disabled={!podeSalvarItemAdicionado}
                  >
                    {salvando ? 'Adicionando...' : 'Adicionar item'}
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
      </Modal>

      <Modal
        isOpen={Boolean(modalEditarItem)}
        onClose={() => setModalEditarItem(null)}
        title="Editar item do inventário"
        size="lg"
      >
        {modalEditarItem ? (
          <div className="space-y-4">
            <InventarioModalEditar
              item={{
                equipamentoId: modalEditarItem.equipamentoId,
                quantidade: quantidadeEditando,
                equipado: equipadoEditando,
                modificacoesIds: modificacoesEditando,
                nomeCustomizado: nomeCustomizadoEditando,
              }}
              quantidade={quantidadeEditando}
              modificacoesIds={modificacoesEditando}
              modificacoesCompativeis={modificacoesCompativeisEdicao}
              equipamentos={equipamentos}
              periciasElegiveis={periciasElegiveisEdicao}
              nomeCustomizado={nomeCustomizadoEditando}
              periciaPersonalizada={periciaPersonalizadaEditando}
              funcoesAdicionaisPericias={funcoesAdicionaisPericiasEditando}
              equipado={equipadoEditando}
              onQuantidadeChange={setQuantidadeEditando}
              onToggleModificacao={(modId, checked) =>
                setModificacoesEditando((prev) =>
                  checked ? [...prev, modId] : prev.filter((id) => id !== modId),
                )
              }
              onNomeCustomizadoChange={setNomeCustomizadoEditando}
              onEquipadoChange={setEquipadoEditando}
              onPericiaPersonalizadaChange={setPericiaPersonalizadaEditando}
              onFuncoesAdicionaisPericiasChange={setFuncoesAdicionaisPericiasEditando}
            />
            <div className="flex items-center justify-end gap-2">
              <Button variant="ghost" onClick={() => setModalEditarItem(null)}>
                Cancelar
              </Button>
              <Button
                onClick={() => void salvarEdicaoItem()}
                disabled={!podeSalvarEdicaoItem}
              >
                {salvando ? 'Salvando...' : 'Salvar'}
              </Button>
            </div>
          </div>
        ) : null}
      </Modal>

      <Modal
        isOpen={Boolean(modalConsumo)}
        onClose={() => setModalConsumo(null)}
        title="Consumir item"
        size="md"
      >
        {modalConsumo ? (
          <div className="space-y-4">
            <div className="rounded-xl border border-app-border bg-app-surface p-3">
              <p className="text-sm font-black text-app-fg">
                {modalConsumo.item.nomeCustomizado || modalConsumo.item.equipamento.nome}
              </p>
              <p className="mt-1 text-xs font-medium text-app-muted">
                {descreverEfeitoConsumo(modalConsumo.item.equipamento.efeitoConsumo)}
              </p>
            </div>

            {listarPreviasConsumo(modalConsumo.item.equipamento.efeitoConsumo).length > 0 ? (
              <div className="session-consumo-preview">
                {listarPreviasConsumo(modalConsumo.item.equipamento.efeitoConsumo).map(
                  (previa) => (
                    <div
                      key={`${previa.recurso}-${previa.expressao}`}
                      className="session-consumo-preview__item"
                    >
                      <span>{previa.recurso}</span>
                      <strong>
                        {modalConsumo.modo === 'COM_CALMA' && previa.maximo !== null
                          ? `Valor máximo ${previa.maximo}`
                          : `Rolar ${previa.expressao}`}
                      </strong>
                    </div>
                  ),
                )}
              </div>
            ) : null}

            <div className="grid gap-3 sm:grid-cols-2">
              <Select
                label="Tipo de alvo"
                value={modalConsumo.alvoTipo}
                onChange={(event) =>
                  setModalConsumo((estado) =>
                    estado
                      ? {
                          ...estado,
                          alvoTipo: event.target.value as 'PERSONAGEM' | 'NPC',
                          alvoId: '',
                        }
                      : estado,
                  )
                }
                options={[
                  { value: 'PERSONAGEM', label: 'Personagem' },
                  { value: 'NPC', label: 'NPC' },
                ]}
              />
              <Select
                label="Alvo"
                value={modalConsumo.alvoId}
                onChange={(event) =>
                  setModalConsumo((estado) =>
                    estado ? { ...estado, alvoId: event.target.value } : estado,
                  )
                }
                options={[
                  { value: '', label: 'Escolher alvo' },
                  ...(modalConsumo.alvoTipo === 'PERSONAGEM'
                    ? alvosPersonagens.map((alvo) => ({
                        value: String(alvo.personagemSessaoId),
                        label: alvo.nomePersonagem,
                      }))
                    : alvosNpcs.map((alvo) => ({
                        value: String(alvo.npcSessaoId),
                        label: alvo.nome,
                      }))),
                ]}
              />
            </div>

            {efeitoPermiteConsumirComCalma(
              modalConsumo.item.equipamento.efeitoConsumo,
            ) ? (
              <div className="grid gap-2 sm:grid-cols-2">
                <label className="flex items-center gap-2 rounded-xl border border-app-border/40 bg-app-card/70 p-3 text-sm font-bold text-app-fg">
                  <input
                    type="radio"
                    checked={modalConsumo.modo === 'NORMAL'}
                    onChange={() =>
                      setModalConsumo((estado) =>
                        estado ? { ...estado, modo: 'NORMAL' } : estado,
                      )
                    }
                  />
                  Rolar efeito
                </label>
                <label className="flex items-center gap-2 rounded-xl border border-app-border/40 bg-app-card/70 p-3 text-sm font-bold text-app-fg">
                  <input
                    type="radio"
                    checked={modalConsumo.modo === 'COM_CALMA'}
                    onChange={() =>
                      setModalConsumo((estado) =>
                        estado ? { ...estado, modo: 'COM_CALMA' } : estado,
                      )
                    }
                  />
                  Consumir com calma
                </label>
              </div>
            ) : null}

            <div className="flex justify-end gap-2">
              <Button variant="ghost" onClick={() => setModalConsumo(null)}>
                Cancelar
              </Button>
              <Button
                onClick={() => void confirmarConsumo()}
                disabled={
                  !modalConsumo.alvoId ||
                  consumindoItemId === modalConsumo.item.id ||
                  sessaoEncerrada
                }
              >
                {consumindoItemId === modalConsumo.item.id
                  ? 'Consumindo...'
                  : 'Confirmar consumo'}
              </Button>
            </div>
          </div>
        ) : null}
      </Modal>
    </div>
  );
}
