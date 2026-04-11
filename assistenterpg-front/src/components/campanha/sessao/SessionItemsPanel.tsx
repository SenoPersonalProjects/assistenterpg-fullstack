'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  apiAceitarTransferenciaItemSessaoCampanha,
  apiAtribuirItemSessaoCampanha,
  apiAtualizarItemSessaoCampanha,
  apiAtualizarTemplateItemSessaoCampanha,
  apiCriarItemSessaoCampanha,
  apiCriarTemplateItemSessaoCampanha,
  apiInstanciarTemplateItemSessaoCampanha,
  apiListarItensSessaoCampanha,
  apiListarTemplatesItensSessaoCampanha,
  apiRecusarTransferenciaItemSessaoCampanha,
  apiRevelarItemSessaoCampanha,
  apiSolicitarTransferenciaItemSessaoCampanha,
  extrairMensagemErro,
  type CategoriaEquipamentoCodigo,
  type DestinoTransferenciaItemSessao,
  type ItemSessaoCampanhaDto,
  type SessaoCampanhaDetalhe,
  type TemplateItemSessaoCampanhaDto,
  type TipoItemSessao,
  type TransferenciaItemSessaoCampanhaDto,
} from '@/lib/api';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorAlert } from '@/components/ui/ErrorAlert';
import { Icon } from '@/components/ui/Icon';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { Textarea } from '@/components/ui/Textarea';
import { useToast } from '@/context/ToastContext';

type FiltroItensSessao = 'TODOS' | 'SEM_PORTADOR' | 'MEUS' | 'PERSONAGEM';
type EdicaoAberta =
  | { tipo: 'ITEM'; item: ItemSessaoCampanhaDto }
  | { tipo: 'TEMPLATE'; template: TemplateItemSessaoCampanhaDto };
type ModoCriacao = 'ITEM' | 'TEMPLATE';

type SessionItemsPanelProps = {
  campanhaId: number;
  sessaoId: number;
  cenaId: number | null;
  personagens: SessaoCampanhaDetalhe['cards'];
  npcs: SessaoCampanhaDetalhe['npcs'];
  usuarioId?: number | null;
  onCountChange?: (total: number) => void;
};

const tiposItem: Array<{ value: TipoItemSessao; label: string }> = [
  { value: 'DOCUMENTO', label: 'Documento' },
  { value: 'PISTA', label: 'Pista' },
  { value: 'GERAL', label: 'Geral' },
];

const categorias: Array<{ value: CategoriaEquipamentoCodigo; label: string }> = [
  { value: 'CATEGORIA_0', label: 'Categoria 0' },
  { value: 'CATEGORIA_4', label: 'Categoria 4' },
  { value: 'CATEGORIA_3', label: 'Categoria 3' },
  { value: 'CATEGORIA_2', label: 'Categoria 2' },
  { value: 'CATEGORIA_1', label: 'Categoria 1' },
  { value: 'ESPECIAL', label: 'Especial' },
];

export function SessionItemsPanel({
  campanhaId,
  sessaoId,
  cenaId,
  personagens,
  npcs,
  usuarioId,
  onCountChange,
}: SessionItemsPanelProps) {
  const { showToast } = useToast();
  const [itens, setItens] = useState<ItemSessaoCampanhaDto[]>([]);
  const [templates, setTemplates] = useState<TemplateItemSessaoCampanhaDto[]>([]);
  const [transferenciasPendentes, setTransferenciasPendentes] = useState<
    TransferenciaItemSessaoCampanhaDto[]
  >([]);
  const [ehMestre, setEhMestre] = useState(false);
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [filtro, setFiltro] = useState<FiltroItensSessao>('TODOS');
  const [personagemFiltroId, setPersonagemFiltroId] = useState('');
  const [criacaoAberta, setCriacaoAberta] = useState(false);
  const [modoCriacao, setModoCriacao] = useState<ModoCriacao>('ITEM');
  const [nome, setNome] = useState('');
  const [descricao, setDescricao] = useState('');
  const [tipo, setTipo] = useState<TipoItemSessao>('DOCUMENTO');
  const [categoria, setCategoria] =
    useState<CategoriaEquipamentoCodigo>('CATEGORIA_0');
  const [peso, setPeso] = useState('0');
  const [vincularSessaoAtual, setVincularSessaoAtual] = useState(false);
  const [personagemCriacaoId, setPersonagemCriacaoId] = useState('');
  const [edicao, setEdicao] = useState<EdicaoAberta | null>(null);
  const [nomeEdicao, setNomeEdicao] = useState('');
  const [descricaoEdicao, setDescricaoEdicao] = useState('');
  const [tipoEdicao, setTipoEdicao] = useState<TipoItemSessao>('DOCUMENTO');
  const [categoriaEdicao, setCategoriaEdicao] =
    useState<CategoriaEquipamentoCodigo>('CATEGORIA_0');
  const [pesoEdicao, setPesoEdicao] = useState('0');
  const [descricaoReveladaEdicao, setDescricaoReveladaEdicao] = useState(false);
  const [salvandoEdicao, setSalvandoEdicao] = useState(false);
  const [transferenciaItem, setTransferenciaItem] =
    useState<ItemSessaoCampanhaDto | null>(null);
  const [destinoTransferenciaTipo, setDestinoTransferenciaTipo] =
    useState<DestinoTransferenciaItemSessao>('PERSONAGEM');
  const [destinoPersonagemId, setDestinoPersonagemId] = useState('');
  const [destinoNpcId, setDestinoNpcId] = useState('');
  const idsTransferenciaNotificados = useRef<Set<number>>(new Set());
  const carregarRef = useRef<() => Promise<void>>(async () => undefined);

  const personagensProprios = useMemo(
    () => personagens.filter((personagem) => personagem.donoId === usuarioId),
    [personagens, usuarioId],
  );

  const destinosPersonagemTransferencia = useMemo(() => {
    if (!transferenciaItem) return [];
    return personagens.filter(
      (personagem) =>
        personagem.personagemCampanhaId !== transferenciaItem.personagemCampanhaId &&
        personagem.donoId !== usuarioId,
    );
  }, [personagens, transferenciaItem, usuarioId]);

  const responderTransferencia = useCallback(
    async (transferenciaId: number, aceitar: boolean) => {
      try {
        setErro(null);
        if (aceitar) {
          await apiAceitarTransferenciaItemSessaoCampanha(
            campanhaId,
            transferenciaId,
          );
          showToast('Transferencia aceita.', 'success');
        } else {
          await apiRecusarTransferenciaItemSessaoCampanha(
            campanhaId,
            transferenciaId,
          );
          showToast('Transferencia recusada.', 'info');
        }
        await carregarRef.current();
      } catch (error) {
        const mensagem = extrairMensagemErro(error);
        setErro(mensagem);
        showToast(mensagem, 'error');
      }
    },
    [campanhaId, showToast],
  );

  const carregar = useCallback(async () => {
    try {
      setCarregando(true);
      setErro(null);
      const resposta = await apiListarItensSessaoCampanha(campanhaId);
      setItens(resposta.itens);
      setEhMestre(resposta.permissoes.ehMestre);
      setTransferenciasPendentes(resposta.transferenciasPendentes ?? []);
      onCountChange?.(resposta.itens.length);

      for (const transferencia of resposta.transferenciasPendentes ?? []) {
        const deveNotificar =
          transferencia.permissoes?.podeResponder &&
          (resposta.permissoes.ehMestre
            ? transferencia.destinoTipo === 'NPC'
            : transferencia.destinoPersonagem?.ehMeu === true);

        if (!deveNotificar || idsTransferenciaNotificados.current.has(transferencia.id)) {
          continue;
        }

        idsTransferenciaNotificados.current.add(transferencia.id);
        const destino =
          transferencia.destinoTipo === 'NPC'
            ? transferencia.destinoNpc?.nome ?? 'NPC'
            : transferencia.destinoPersonagem?.nome ?? 'personagem';
        showToast(
          `Pedido para receber ${transferencia.item.nome} em ${destino}.`,
          'info',
          {
            durationMs: null,
            actions: [
              {
                label: 'Aceitar',
                onClick: () => responderTransferencia(transferencia.id, true),
              },
              {
                label: 'Recusar',
                onClick: () => responderTransferencia(transferencia.id, false),
              },
            ],
          },
        );
      }

      if (resposta.permissoes.podeGerenciarTemplates) {
        const templatesResposta =
          await apiListarTemplatesItensSessaoCampanha(campanhaId);
        setTemplates(templatesResposta);
      } else {
        setTemplates([]);
      }
    } catch (error) {
      setErro(extrairMensagemErro(error));
    } finally {
      setCarregando(false);
    }
  }, [campanhaId, onCountChange, responderTransferencia, showToast]);

  useEffect(() => {
    carregarRef.current = carregar;
  }, [carregar]);

  useEffect(() => {
    void carregar();
  }, [carregar]);

  useEffect(() => {
    if (!ehMestre && personagensProprios.length === 1 && !personagemCriacaoId) {
      setPersonagemCriacaoId(String(personagensProprios[0].personagemCampanhaId));
    }
  }, [ehMestre, personagemCriacaoId, personagensProprios]);

  const itensFiltrados = useMemo(() => {
    return itens.filter((item) => {
      if (filtro === 'SEM_PORTADOR') return !item.portador;
      if (filtro === 'MEUS') return item.portador?.ehMeu === true;
      if (filtro === 'PERSONAGEM') {
        return String(item.personagemCampanhaId ?? '') === personagemFiltroId;
      }
      return true;
    });
  }, [filtro, itens, personagemFiltroId]);

  function limparFormulario() {
    setNome('');
    setDescricao('');
    setTipo('DOCUMENTO');
    setCategoria('CATEGORIA_0');
    setPeso('0');
    setModoCriacao('ITEM');
    setVincularSessaoAtual(false);
    setPersonagemCriacaoId(
      !ehMestre && personagensProprios.length === 1
        ? String(personagensProprios[0].personagemCampanhaId)
        : '',
    );
  }

  function normalizarCategoria(
    tipoItem: TipoItemSessao,
    categoriaItem: CategoriaEquipamentoCodigo,
  ): CategoriaEquipamentoCodigo {
    return tipoItem === 'GERAL' ? categoriaItem : 'CATEGORIA_0';
  }

  function normalizarPeso(tipoItem: TipoItemSessao, valor: string): number {
    if (tipoItem === 'DOCUMENTO') return 0;
    const pesoNumerico = Number(valor || 0);
    return Number.isFinite(pesoNumerico) && pesoNumerico >= 0 ? pesoNumerico : 0;
  }

  function preencherEdicao(
    alvo: ItemSessaoCampanhaDto | TemplateItemSessaoCampanhaDto,
  ) {
    setNomeEdicao(alvo.nome);
    setDescricaoEdicao(alvo.descricao ?? '');
    setTipoEdicao(alvo.tipo);
    setCategoriaEdicao(alvo.categoria);
    setPesoEdicao(String(alvo.peso ?? 0));
    setDescricaoReveladaEdicao(alvo.descricaoRevelada);
  }

  function abrirEdicaoItem(item: ItemSessaoCampanhaDto) {
    preencherEdicao(item);
    setEdicao({ tipo: 'ITEM', item });
  }

  function abrirEdicaoTemplate(template: TemplateItemSessaoCampanhaDto) {
    preencherEdicao(template);
    setEdicao({ tipo: 'TEMPLATE', template });
  }

  function abrirCriacao() {
    limparFormulario();
    setCriacaoAberta(true);
  }

  function fecharEdicao() {
    if (salvandoEdicao) return;
    setEdicao(null);
  }

  async function handleCriarItem() {
    const nomeFinal = nome.trim();
    if (!nomeFinal) {
      setErro('Informe o nome do item.');
      return;
    }

    const criandoTemplate = ehMestre && modoCriacao === 'TEMPLATE';
    if (!ehMestre && !personagemCriacaoId) {
      setErro('Escolha qual dos seus personagens recebera o item.');
      return;
    }

    setSalvando(true);
    setErro(null);
    try {
      const payload = {
        nome: nomeFinal,
        descricao: descricao.trim() || null,
        tipo,
        categoria: normalizarCategoria(tipo, categoria),
        peso: normalizarPeso(tipo, peso),
      };

      if (criandoTemplate) {
        await apiCriarTemplateItemSessaoCampanha(campanhaId, payload);
      } else {
        await apiCriarItemSessaoCampanha(campanhaId, {
          ...payload,
          sessaoId: ehMestre && vincularSessaoAtual ? sessaoId : undefined,
          cenaId: ehMestre && vincularSessaoAtual ? cenaId : undefined,
          personagemCampanhaId: personagemCriacaoId
            ? Number(personagemCriacaoId)
            : undefined,
        });
      }

      limparFormulario();
      setCriacaoAberta(false);
      await carregar();
    } catch (error) {
      setErro(extrairMensagemErro(error));
    } finally {
      setSalvando(false);
    }
  }

  async function handleSalvarEdicao() {
    if (!edicao) return;

    const nomeFinal = nomeEdicao.trim();
    if (!nomeFinal) {
      setErro('Informe o nome do item.');
      return;
    }

    setSalvandoEdicao(true);
    setErro(null);
    try {
      const payload = {
        nome: nomeFinal,
        descricao: descricaoEdicao.trim() || null,
        tipo: tipoEdicao,
        categoria: normalizarCategoria(tipoEdicao, categoriaEdicao),
        peso: normalizarPeso(tipoEdicao, pesoEdicao),
        ...(ehMestre ? { descricaoRevelada: descricaoReveladaEdicao } : {}),
      };

      if (edicao.tipo === 'ITEM') {
        await apiAtualizarItemSessaoCampanha(campanhaId, edicao.item.id, payload);
      } else {
        await apiAtualizarTemplateItemSessaoCampanha(
          campanhaId,
          edicao.template.id,
          payload,
        );
      }

      setEdicao(null);
      await carregar();
    } catch (error) {
      setErro(extrairMensagemErro(error));
    } finally {
      setSalvandoEdicao(false);
    }
  }

  async function handleAtribuir(itemId: number, personagemCampanhaId: string) {
    setErro(null);
    try {
      await apiAtribuirItemSessaoCampanha(campanhaId, itemId, {
        personagemCampanhaId: personagemCampanhaId
          ? Number(personagemCampanhaId)
          : null,
      });
      await carregar();
    } catch (error) {
      setErro(extrairMensagemErro(error));
    }
  }

  async function handleRevelar(item: ItemSessaoCampanhaDto) {
    setErro(null);
    try {
      await apiRevelarItemSessaoCampanha(campanhaId, item.id, {
        descricaoRevelada: !item.descricaoRevelada,
      });
      await carregar();
    } catch (error) {
      setErro(extrairMensagemErro(error));
    }
  }

  async function handleInstanciarTemplate(templateId: number) {
    setErro(null);
    try {
      await apiInstanciarTemplateItemSessaoCampanha(campanhaId, templateId, {
        sessaoId,
        cenaId,
      });
      await carregar();
    } catch (error) {
      setErro(extrairMensagemErro(error));
    }
  }

  function abrirTransferencia(item: ItemSessaoCampanhaDto) {
    setTransferenciaItem(item);
    setDestinoTransferenciaTipo('PERSONAGEM');
    setDestinoPersonagemId('');
    setDestinoNpcId('');
  }

  async function handleSolicitarTransferencia() {
    if (!transferenciaItem) return;
    setErro(null);
    try {
      if (destinoTransferenciaTipo === 'PERSONAGEM') {
        if (!destinoPersonagemId) {
          setErro('Escolha o personagem de destino.');
          return;
        }
        await apiSolicitarTransferenciaItemSessaoCampanha(
          campanhaId,
          transferenciaItem.id,
          {
            destinoTipo: 'PERSONAGEM',
            destinoPersonagemCampanhaId: Number(destinoPersonagemId),
          },
        );
      } else {
        if (!destinoNpcId) {
          setErro('Escolha o NPC de destino.');
          return;
        }
        await apiSolicitarTransferenciaItemSessaoCampanha(
          campanhaId,
          transferenciaItem.id,
          {
            destinoTipo: 'NPC',
            destinoNpcSessaoId: Number(destinoNpcId),
          },
        );
      }
      setTransferenciaItem(null);
      showToast('Solicitacao de transferencia enviada.', 'success');
      await carregar();
    } catch (error) {
      const mensagem = extrairMensagemErro(error);
      setErro(mensagem);
      showToast(mensagem, 'error');
    }
  }

  function nomeDestinoTransferencia(
    transferencia: TransferenciaItemSessaoCampanhaDto,
  ) {
    if (transferencia.destinoTipo === 'NPC') {
      return transferencia.destinoNpc?.nome ?? 'NPC';
    }
    return transferencia.destinoPersonagem?.nome ?? 'Personagem';
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Icon name="inventory" className="h-4 w-4 text-app-muted" />
          <p className="text-sm font-semibold text-app-fg">Itens da campanha</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge size="sm" color="gray">
            {itens.length}
          </Badge>
          <Button size="xs" onClick={abrirCriacao}>
            Criar item
          </Button>
        </div>
      </div>

      {erro ? <ErrorAlert message={erro} /> : null}

      <div className="rounded border border-app-border bg-app-surface px-3 py-2 text-xs text-app-muted">
        <p>
          <strong className="text-app-fg">Item</strong> e uma instancia real da
          campanha: pode ficar sem portador, ser entregue a alguem, mudar de maos
          e ter a descricao revelada.
        </p>
        {ehMestre ? (
          <p className="mt-1">
            <strong className="text-app-fg">Template</strong> e so um modelo do
            mestre para instanciar copias reais depois.
          </p>
        ) : null}
      </div>

      {transferenciasPendentes.length > 0 ? (
        <div className="rounded border border-app-border bg-app-bg p-3 space-y-2">
          <p className="text-xs font-semibold text-app-fg">
            Transferencias pendentes
          </p>
          {transferenciasPendentes.map((transferencia) => (
            <div
              key={transferencia.id}
              className="rounded border border-app-border bg-app-surface px-2 py-2 text-xs"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="space-y-1">
                  <p className="font-semibold text-app-fg">
                    {transferencia.item.nome}
                  </p>
                  <p className="text-app-muted">
                    {transferencia.portadorAnterior?.nome ?? 'Sem portador'} para{' '}
                    {nomeDestinoTransferencia(transferencia)}
                  </p>
                </div>
                {transferencia.permissoes?.podeResponder ? (
                  <div className="flex flex-wrap justify-end gap-1">
                    <Button
                      size="xs"
                      variant="ghost"
                      onClick={() =>
                        void responderTransferencia(transferencia.id, true)
                      }
                    >
                      Aceitar
                    </Button>
                    <Button
                      size="xs"
                      variant="ghost"
                      onClick={() =>
                        void responderTransferencia(transferencia.id, false)
                      }
                    >
                      Recusar
                    </Button>
                  </div>
                ) : (
                  <Badge size="sm" color="yellow">
                    Aguardando
                  </Badge>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : null}

      <div className="flex flex-wrap gap-2">
        <select
          value={filtro}
          onChange={(event) => setFiltro(event.target.value as FiltroItensSessao)}
          className="rounded border border-app-border bg-app-surface px-2 py-2 text-xs text-app-fg"
        >
          <option value="TODOS">Todos</option>
          <option value="SEM_PORTADOR">Sem portador</option>
          <option value="MEUS">Meus</option>
          <option value="PERSONAGEM">Por personagem</option>
        </select>
        {filtro === 'PERSONAGEM' ? (
          <select
            value={personagemFiltroId}
            onChange={(event) => setPersonagemFiltroId(event.target.value)}
            className="rounded border border-app-border bg-app-surface px-2 py-2 text-xs text-app-fg"
          >
            <option value="">Selecione</option>
            {personagens.map((personagem) => (
              <option
                key={personagem.personagemCampanhaId}
                value={personagem.personagemCampanhaId}
              >
                {personagem.nomePersonagem}
              </option>
            ))}
          </select>
        ) : null}
      </div>

      {carregando ? (
        <p className="text-xs text-app-muted">Carregando itens...</p>
      ) : itensFiltrados.length === 0 ? (
        <EmptyState
          variant="session"
          size="sm"
          icon="inventory"
          title="Nenhum item"
          description="O pool narrativo da campanha ainda esta vazio."
        />
      ) : (
        <div className="space-y-2">
          {itensFiltrados.map((item) => (
            <div
              key={item.id}
              className="rounded border border-app-border bg-app-surface px-3 py-2 text-sm"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="space-y-1">
                  <p className="font-semibold text-app-fg">{item.nome}</p>
                  <div className="flex flex-wrap gap-1">
                    <Badge size="sm" color="gray">
                      {item.tipo}
                    </Badge>
                    <Badge size="sm" color="gray">
                      {item.categoria}
                    </Badge>
                    <Badge size="sm" color="gray">
                      Peso {item.peso}
                    </Badge>
                    {item.portador ? (
                      <Badge size="sm" color="blue">
                        {item.portador.nome}
                      </Badge>
                    ) : (
                      <Badge size="sm" color="yellow">
                        Sem portador
                      </Badge>
                    )}
                    {item.transferenciaPendente ? (
                      <Badge size="sm" color="yellow">
                        Transferencia pendente
                      </Badge>
                    ) : null}
                    {ehMestre && item.sessaoId ? (
                      <Badge size="sm" color="gray">
                        Sessao {item.sessaoId}
                      </Badge>
                    ) : null}
                    {ehMestre && item.cenaId ? (
                      <Badge size="sm" color="gray">
                        Cena {item.cenaId}
                      </Badge>
                    ) : null}
                  </div>
                  <p className="text-xs text-app-muted">
                    {item.descricaoOculta
                      ? 'Descricao oculta pelo mestre.'
                    : item.descricao || 'Sem descricao.'}
                  </p>
                </div>
                {ehMestre || item.permissoes?.podeEditar || item.permissoes?.podeTransferir ? (
                  <div className="flex flex-wrap justify-end gap-1">
                    {(item.permissoes?.podeEditar ?? ehMestre) ? (
                      <Button
                        size="xs"
                        variant="ghost"
                        onClick={() => abrirEdicaoItem(item)}
                      >
                        Editar
                      </Button>
                    ) : null}
                    {!ehMestre && item.permissoes?.podeTransferir ? (
                      <Button
                        size="xs"
                        variant="ghost"
                        onClick={() => abrirTransferencia(item)}
                      >
                        Transferir
                      </Button>
                    ) : null}
                    {ehMestre ? (
                      <Button
                        size="xs"
                        variant="ghost"
                        onClick={() => void handleRevelar(item)}
                      >
                        {item.descricaoRevelada ? 'Ocultar' : 'Revelar'}
                      </Button>
                    ) : null}
                  </div>
                ) : null}
              </div>
              {ehMestre ? (
                <div className="mt-2">
                  <select
                    value={item.personagemCampanhaId ?? ''}
                    onChange={(event) => void handleAtribuir(item.id, event.target.value)}
                    className="w-full rounded border border-app-border bg-app-bg px-2 py-2 text-xs text-app-fg"
                  >
                    <option value="">Sem portador</option>
                    {personagens.map((personagem) => (
                      <option
                        key={personagem.personagemCampanhaId}
                        value={personagem.personagemCampanhaId}
                      >
                        {personagem.nomePersonagem}
                      </option>
                    ))}
                  </select>
                </div>
              ) : null}
            </div>
          ))}
        </div>
      )}

      {ehMestre && templates.length > 0 ? (
        <div className="rounded border border-app-border bg-app-bg p-3 space-y-2">
          <p className="text-xs font-semibold text-app-fg">Templates</p>
          {templates.map((template) => (
            <div
              key={template.id}
              className="rounded border border-app-border bg-app-surface px-2 py-2 text-xs"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="space-y-1">
                  <p className="font-semibold text-app-fg">{template.nome}</p>
                  <div className="flex flex-wrap gap-1">
                    <Badge size="sm" color="gray">
                      {template.tipo}
                    </Badge>
                    <Badge size="sm" color="gray">
                      {template.categoria}
                    </Badge>
                    <Badge size="sm" color="gray">
                      Peso {template.peso}
                    </Badge>
                  </div>
                  <p className="text-app-muted">
                    {template.descricao || 'Sem descricao.'}
                  </p>
                </div>
                <div className="flex flex-wrap justify-end gap-1">
                  <Button
                    size="xs"
                    variant="ghost"
                    onClick={() => abrirEdicaoTemplate(template)}
                  >
                    Editar
                  </Button>
                  <Button
                    size="xs"
                    variant="ghost"
                    onClick={() => void handleInstanciarTemplate(template.id)}
                  >
                    Instanciar
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : null}

      <Modal
        isOpen={criacaoAberta}
        onClose={() => {
          if (!salvando) setCriacaoAberta(false);
        }}
        title={ehMestre && modoCriacao === 'TEMPLATE' ? 'Criar template' : 'Criar item'}
        size="md"
        footer={
          <>
            <Button
              type="button"
              variant="secondary"
              onClick={() => setCriacaoAberta(false)}
              disabled={salvando}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              onClick={() => void handleCriarItem()}
              disabled={salvando}
            >
              {salvando
                ? 'Salvando...'
                : ehMestre && modoCriacao === 'TEMPLATE'
                  ? 'Criar template'
                  : 'Criar item'}
            </Button>
          </>
        }
      >
        <div className="space-y-3">
          {ehMestre ? (
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => setModoCriacao('ITEM')}
                className={`rounded border px-3 py-2 text-left ${
                  modoCriacao === 'ITEM'
                    ? 'border-app-primary bg-app-primary/10 text-app-fg'
                    : 'border-app-border bg-app-bg text-app-muted'
                }`}
              >
                <span className="block font-semibold">Item real</span>
                <span>Entra na campanha e pode ter portador.</span>
              </button>
              <button
                type="button"
                onClick={() => setModoCriacao('TEMPLATE')}
                className={`rounded border px-3 py-2 text-left ${
                  modoCriacao === 'TEMPLATE'
                    ? 'border-app-primary bg-app-primary/10 text-app-fg'
                    : 'border-app-border bg-app-bg text-app-muted'
                }`}
              >
                <span className="block font-semibold">Template</span>
                <span>Modelo salvo para instanciar depois.</span>
              </button>
            </div>
          ) : null}
          <Input
            label={
              ehMestre && modoCriacao === 'TEMPLATE'
                ? 'Nome do template'
                : 'Nome do item'
            }
            value={nome}
            onChange={(event) => setNome(event.target.value)}
          />
          <Textarea
            label="Descricao"
            value={descricao}
            onChange={(event) => setDescricao(event.target.value)}
            rows={3}
          />
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            <label className="text-xs text-app-muted">
              Tipo
              <select
                value={tipo}
                onChange={(event) => setTipo(event.target.value as TipoItemSessao)}
                className="mt-1 w-full rounded border border-app-border bg-app-bg px-2 py-2 text-sm text-app-fg"
              >
                {tiposItem.map((item) => (
                  <option key={item.value} value={item.value}>
                    {item.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="text-xs text-app-muted">
              Categoria
              <select
                value={tipo === 'GERAL' ? categoria : 'CATEGORIA_0'}
                onChange={(event) =>
                  setCategoria(event.target.value as CategoriaEquipamentoCodigo)
                }
                disabled={tipo !== 'GERAL'}
                className="mt-1 w-full rounded border border-app-border bg-app-bg px-2 py-2 text-sm text-app-fg disabled:opacity-60"
              >
                {categorias.map((item) => (
                  <option key={item.value} value={item.value}>
                    {item.label}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <Input
            label="Peso"
            type="number"
            min="0"
            value={tipo === 'DOCUMENTO' ? '0' : peso}
            disabled={tipo === 'DOCUMENTO'}
            onChange={(event) => setPeso(event.target.value)}
          />
          {modoCriacao === 'ITEM' ? (
            <label className="text-xs text-app-muted">
              Portador
              <select
                value={personagemCriacaoId}
                onChange={(event) => setPersonagemCriacaoId(event.target.value)}
                className="mt-1 w-full rounded border border-app-border bg-app-bg px-2 py-2 text-sm text-app-fg"
              >
                {ehMestre ? <option value="">Sem portador</option> : null}
                {(ehMestre ? personagens : personagensProprios).map((personagem) => (
                  <option
                    key={personagem.personagemCampanhaId}
                    value={personagem.personagemCampanhaId}
                  >
                    {personagem.nomePersonagem}
                  </option>
                ))}
              </select>
            </label>
          ) : null}
          {ehMestre && modoCriacao === 'ITEM' ? (
            <label className="flex items-center gap-2 text-xs text-app-muted">
              <input
                type="checkbox"
                checked={vincularSessaoAtual}
                onChange={(event) => setVincularSessaoAtual(event.target.checked)}
              />
              Vincular a sessao/cena atual
            </label>
          ) : null}
        </div>
      </Modal>

      <Modal
        isOpen={edicao !== null}
        onClose={fecharEdicao}
        title={edicao?.tipo === 'TEMPLATE' ? 'Editar template' : 'Editar item'}
        size="md"
        footer={
          <>
            <Button
              type="button"
              variant="secondary"
              onClick={fecharEdicao}
              disabled={salvandoEdicao}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              onClick={() => void handleSalvarEdicao()}
              disabled={salvandoEdicao}
            >
              {salvandoEdicao ? 'Salvando...' : 'Salvar edicao'}
            </Button>
          </>
        }
      >
        <div className="space-y-3">
          <Input
            label={edicao?.tipo === 'TEMPLATE' ? 'Nome do template' : 'Nome do item'}
            value={nomeEdicao}
            onChange={(event) => setNomeEdicao(event.target.value)}
          />
          <Textarea
            label="Descricao"
            value={descricaoEdicao}
            onChange={(event) => setDescricaoEdicao(event.target.value)}
            rows={4}
          />
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            <label className="text-xs text-app-muted">
              Tipo
              <select
                value={tipoEdicao}
                onChange={(event) =>
                  setTipoEdicao(event.target.value as TipoItemSessao)
                }
                className="mt-1 w-full rounded border border-app-border bg-app-bg px-2 py-2 text-sm text-app-fg"
              >
                {tiposItem.map((item) => (
                  <option key={item.value} value={item.value}>
                    {item.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="text-xs text-app-muted">
              Categoria
              <select
                value={tipoEdicao === 'GERAL' ? categoriaEdicao : 'CATEGORIA_0'}
                onChange={(event) =>
                  setCategoriaEdicao(
                    event.target.value as CategoriaEquipamentoCodigo,
                  )
                }
                disabled={tipoEdicao !== 'GERAL'}
                className="mt-1 w-full rounded border border-app-border bg-app-bg px-2 py-2 text-sm text-app-fg disabled:opacity-60"
              >
                {categorias.map((item) => (
                  <option key={item.value} value={item.value}>
                    {item.label}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <Input
            label="Peso"
            type="number"
            min="0"
            value={tipoEdicao === 'DOCUMENTO' ? '0' : pesoEdicao}
            disabled={tipoEdicao === 'DOCUMENTO'}
            onChange={(event) => setPesoEdicao(event.target.value)}
          />
          {ehMestre ? (
            <label className="flex items-center gap-2 text-xs text-app-muted">
              <input
                type="checkbox"
                checked={descricaoReveladaEdicao}
                onChange={(event) =>
                  setDescricaoReveladaEdicao(event.target.checked)
                }
              />
              Descricao revelada para jogadores
            </label>
          ) : null}
          {edicao?.tipo === 'ITEM' && ehMestre ? (
            <div className="rounded border border-app-border bg-app-bg px-3 py-2 text-xs text-app-muted">
              Vinculos atuais: sessao {edicao.item.sessaoId ?? 'nenhuma'}, cena{' '}
              {edicao.item.cenaId ?? 'nenhuma'}. Atribuicao e revelacao continuam
              nos controles do card.
            </div>
          ) : null}
        </div>
      </Modal>

      <Modal
        isOpen={transferenciaItem !== null}
        onClose={() => setTransferenciaItem(null)}
        title="Transferir item"
        size="md"
        footer={
          <>
            <Button
              type="button"
              variant="secondary"
              onClick={() => setTransferenciaItem(null)}
            >
              Cancelar
            </Button>
            <Button type="button" onClick={() => void handleSolicitarTransferencia()}>
              Enviar pedido
            </Button>
          </>
        }
      >
        <div className="space-y-3 text-sm">
          <p className="text-app-muted">
            {transferenciaItem
              ? `Voce esta transferindo ${transferenciaItem.nome}. O destino precisa aceitar antes do item mudar de inventario.`
              : null}
          </p>
          <label className="text-xs text-app-muted">
            Destino
            <select
              value={destinoTransferenciaTipo}
              onChange={(event) =>
                setDestinoTransferenciaTipo(
                  event.target.value as DestinoTransferenciaItemSessao,
                )
              }
              className="mt-1 w-full rounded border border-app-border bg-app-bg px-2 py-2 text-sm text-app-fg"
            >
              <option value="PERSONAGEM">Personagem jogador</option>
              <option value="NPC">NPC da sessao</option>
            </select>
          </label>
          {destinoTransferenciaTipo === 'PERSONAGEM' ? (
            <label className="text-xs text-app-muted">
              Personagem
              <select
                value={destinoPersonagemId}
                onChange={(event) => setDestinoPersonagemId(event.target.value)}
                className="mt-1 w-full rounded border border-app-border bg-app-bg px-2 py-2 text-sm text-app-fg"
              >
                <option value="">Selecione</option>
                {destinosPersonagemTransferencia.map((personagem) => (
                  <option
                    key={personagem.personagemCampanhaId}
                    value={personagem.personagemCampanhaId}
                  >
                    {personagem.nomePersonagem}
                  </option>
                ))}
              </select>
            </label>
          ) : (
            <label className="text-xs text-app-muted">
              NPC
              <select
                value={destinoNpcId}
                onChange={(event) => setDestinoNpcId(event.target.value)}
                className="mt-1 w-full rounded border border-app-border bg-app-bg px-2 py-2 text-sm text-app-fg"
              >
                <option value="">Selecione</option>
                {npcs.map((npc) => (
                  <option key={npc.npcSessaoId} value={npc.npcSessaoId}>
                    {npc.nome}
                  </option>
                ))}
              </select>
            </label>
          )}
          {destinoTransferenciaTipo === 'NPC' ? (
            <p className="rounded border border-app-border bg-app-bg px-3 py-2 text-xs text-app-muted">
              Para NPCs, o item volta para a lista sem portador e o mestre recebe
              uma solicitacao para aceitar ou recusar.
            </p>
          ) : null}
        </div>
      </Modal>
    </div>
  );
}
