'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { Modal } from '@/components/ui/Modal';
import { Icon } from '@/components/ui/Icon';
import { InventarioModalEquipamento } from '@/components/personagem-base/create/modal/InventarioModalEquipamento';
import { InventarioModalEditar } from '@/components/personagem-base/create/modal/InventarioModalEditar';
import {
  apiAdicionarItemInventarioCampanha,
  apiAplicarModificacaoInventarioCampanha,
  apiAtualizarItemInventarioCampanha,
  apiGetInventarioCampanhaCompleto,
  apiGetModificacoesCompativeis,
  apiGetTodosEquipamentos,
  apiRemoverItemInventarioCampanha,
  apiRemoverModificacaoInventarioCampanha,
  extrairMensagemErro,
} from '@/lib/api';
import type {
  EquipamentoCatalogo,
  InventarioCampanhaCompletoDto,
  ItemInventarioDto,
  ModificacaoCatalogo,
} from '@/lib/types';
import {
  calcularCategoriaFinal,
  filtrarModificacoesCompativeis,
  getIconeTipo,
} from '@/lib/utils/inventario';

type SessionCharacterInventoryTabProps = {
  campanhaId: number;
  personagemCampanhaId: number;
  podeEditar: boolean;
  ativo?: boolean;
  limitesCategoriaAtivo?: boolean;
};

type EtapaAdicionar = 'SELECIONAR' | 'DETALHES';

export function SessionCharacterInventoryTab({
  campanhaId,
  personagemCampanhaId,
  podeEditar,
  ativo = false,
  limitesCategoriaAtivo = false,
}: SessionCharacterInventoryTabProps) {
  const [inventario, setInventario] = useState<InventarioCampanhaCompletoDto | null>(
    null,
  );
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const [modalAdicionarAberto, setModalAdicionarAberto] = useState(false);
  const [etapaAdicionar, setEtapaAdicionar] = useState<EtapaAdicionar>('SELECIONAR');
  const [buscaEquipamento, setBuscaEquipamento] = useState('');
  const [equipamentoSelecionado, setEquipamentoSelecionado] =
    useState<EquipamentoCatalogo | null>(null);
  const [quantidadeAdicionar, setQuantidadeAdicionar] = useState(1);
  const [equipadoAdicionar, setEquipadoAdicionar] = useState(false);
  const [nomeCustomizadoAdicionar, setNomeCustomizadoAdicionar] = useState('');
  const [modificacoesAdicionar, setModificacoesAdicionar] = useState<number[]>([]);
  const [modificacoesCompatAdicionar, setModificacoesCompatAdicionar] =
    useState<ModificacaoCatalogo[]>([]);

  const [modalEditarItem, setModalEditarItem] = useState<ItemInventarioDto | null>(
    null,
  );
  const [quantidadeEditando, setQuantidadeEditando] = useState(1);
  const [equipadoEditando, setEquipadoEditando] = useState(false);
  const [nomeCustomizadoEditando, setNomeCustomizadoEditando] = useState('');
  const [modificacoesEditando, setModificacoesEditando] = useState<number[]>([]);
  const [modificacoesCompatEditando, setModificacoesCompatEditando] =
    useState<ModificacaoCatalogo[]>([]);

  const [equipamentos, setEquipamentos] = useState<EquipamentoCatalogo[]>([]);
  const [carregandoCatalogos, setCarregandoCatalogos] = useState(false);
  const [salvando, setSalvando] = useState(false);

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
      setErro(extrairMensagemErro(error));
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
    if (equipamentos.length > 0) return;
    setCarregandoCatalogos(true);
    try {
      const lista = await apiGetTodosEquipamentos();
      setEquipamentos(lista);
    } catch (error) {
      setErro(extrairMensagemErro(error));
    } finally {
      setCarregandoCatalogos(false);
    }
  }, [equipamentos.length]);

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
    setModificacoesAdicionar([]);
    setModificacoesCompatAdicionar([]);
    setModalAdicionarAberto(true);
    void carregarCatalogos();
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
      setErro(extrairMensagemErro(error));
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
      });
      await carregarInventario();
      setModalAdicionarAberto(false);
    } catch (error) {
      setErro(extrairMensagemErro(error));
    } finally {
      setSalvando(false);
    }
  };

  const abrirEdicaoItem = async (item: ItemInventarioDto) => {
    setModalEditarItem(item);
    setQuantidadeEditando(item.quantidade);
    setEquipadoEditando(item.equipado);
    setNomeCustomizadoEditando(item.nomeCustomizado ?? '');
    setModificacoesEditando(item.modificacoes.map((mod) => mod.id));
    void carregarCatalogos();
    try {
      const mods = await apiGetModificacoesCompativeis(item.equipamentoId);
      setModificacoesCompatEditando(mods);
    } catch (error) {
      setErro(extrairMensagemErro(error));
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
      setErro(extrairMensagemErro(error));
    } finally {
      setSalvando(false);
    }
  };

  const removerItem = async (item: ItemInventarioDto) => {
    if (!window.confirm(`Remover ${item.equipamento.nome} do inventario?`)) {
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
      setErro(extrairMensagemErro(error));
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

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="space-y-1">
          <p className="text-xs font-semibold text-app-fg">Inventario</p>
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

      {erro ? (
        <div className="rounded border border-app-danger/40 bg-app-danger/10 px-3 py-2 text-xs text-app-danger">
          {erro}
        </div>
      ) : null}

      {resumoEspacos ? (
        <div className="flex flex-wrap items-center gap-2">
          <Badge size="sm" color={resumoEspacos.sobrecarregado ? 'red' : 'gray'}>
            Espacos {resumoEspacos.espacosOcupados}/{resumoEspacos.espacosTotal}
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
        <p className="text-xs text-app-muted">Carregando inventario...</p>
      ) : inventario && inventario.itens.length === 0 ? (
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
                          item.modificacoes?.length ?? 0,
                        )}
                    </Badge>
                    {item.equipado ? (
                      <Badge size="sm" color="green">
                        Equipado
                      </Badge>
                    ) : null}
                    {item.modificacoes.length > 0 ? (
                      <Badge size="sm" color="blue">
                        {item.modificacoes.length} mod.
                      </Badge>
                    ) : null}
                  </div>
                </div>
                {podeEditar ? (
                  <div className="flex items-center gap-2">
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
            </div>
          ))}
        </div>
      )}

      <Modal
        isOpen={modalAdicionarAberto}
        onClose={fecharModalAdicionar}
        title="Adicionar item ao inventario"
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
                  nomeCustomizado={nomeCustomizadoAdicionar}
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
                  <Button onClick={() => void salvarItemAdicionado()} disabled={salvando}>
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
        title="Editar item do inventario"
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
              nomeCustomizado={nomeCustomizadoEditando}
              equipado={equipadoEditando}
              onQuantidadeChange={setQuantidadeEditando}
              onToggleModificacao={(modId, checked) =>
                setModificacoesEditando((prev) =>
                  checked ? [...prev, modId] : prev.filter((id) => id !== modId),
                )
              }
              onNomeCustomizadoChange={setNomeCustomizadoEditando}
              onEquipadoChange={setEquipadoEditando}
            />
            <div className="flex items-center justify-end gap-2">
              <Button variant="ghost" onClick={() => setModalEditarItem(null)}>
                Cancelar
              </Button>
              <Button onClick={() => void salvarEdicaoItem()} disabled={salvando}>
                {salvando ? 'Salvando...' : 'Salvar'}
              </Button>
            </div>
          </div>
        ) : null}
      </Modal>
    </div>
  );
}
