'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  apiAplicarModificadorPersonagemCampanha,
  apiAtualizarRecursosPersonagemCampanha,
  apiDesfazerModificadorPersonagemCampanha,
  apiListarHistoricoPersonagemCampanha,
  apiListarModificadoresPersonagemCampanha,
  extrairMensagemErro,
} from '@/lib/api';
import type {
  CampoModificadorPersonagemCampanha,
  HistoricoPersonagemCampanha,
  ModificadorPersonagemCampanha,
  PersonagemCampanhaResumo,
} from '@/lib/types';
import { formatarDataHora } from '@/lib/utils/formatters';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { SessionCharacterInventoryTab } from '@/components/campanha/sessao/SessionCharacterInventoryTab';

type Props = {
  isOpen: boolean;
  campanhaId: number;
  personagem: Pick<PersonagemCampanhaResumo, 'id' | 'nome' | 'recursos'> | null;
  onClose: () => void;
  onPersonagemAtualizado: (personagem: PersonagemCampanhaResumo) => void;
  contextoSessao?: {
    sessaoId: number;
    cenaId?: number | null;
  };
};

type FiltroHistoricoContexto = 'TODOS' | 'SESSAO_ATUAL' | 'CENA_ATUAL';
const FILTRO_HISTORICO_TIPO_TODOS = '__TODOS__';

const CAMPOS_MODIFICADOR_OPTIONS: Array<{
  value: CampoModificadorPersonagemCampanha;
  label: string;
}> = [
  { value: 'PV_MAX', label: 'PV Maximo' },
  { value: 'PE_MAX', label: 'PE Maximo' },
  { value: 'EA_MAX', label: 'EA Maximo' },
  { value: 'SAN_MAX', label: 'Sanidade Maxima' },
  { value: 'DEFESA_BASE', label: 'Defesa Base' },
  { value: 'DEFESA_EQUIPAMENTO', label: 'Defesa Equipamento' },
  { value: 'DEFESA_OUTROS', label: 'Defesa Outros' },
  { value: 'ESQUIVA', label: 'Esquiva' },
  { value: 'BLOQUEIO', label: 'Bloqueio' },
  { value: 'DESLOCAMENTO', label: 'Deslocamento' },
  { value: 'LIMITE_PE_EA_POR_TURNO', label: 'Limite PE/EA por turno' },
  { value: 'PRESTIGIO_GERAL', label: 'Prestigio Geral' },
  { value: 'PRESTIGIO_CLA', label: 'Prestigio Cla' },
];

const LABEL_CAMPO_MODIFICADOR: Record<CampoModificadorPersonagemCampanha, string> =
  Object.fromEntries(
    CAMPOS_MODIFICADOR_OPTIONS.map((item) => [item.value, item.label]),
  ) as Record<CampoModificadorPersonagemCampanha, string>;

function obterFiltroHistoricoPadrao(
  contextoSessao?: { sessaoId: number; cenaId?: number | null },
): FiltroHistoricoContexto {
  if (!contextoSessao) return 'TODOS';
  if (typeof contextoSessao.cenaId === 'number') return 'CENA_ATUAL';
  return 'SESSAO_ATUAL';
}

function normalizarIdContexto(valor: unknown): number | null {
  if (typeof valor === 'number' && Number.isInteger(valor) && valor > 0) {
    return valor;
  }
  if (typeof valor === 'string' && valor.trim() !== '') {
    const numero = Number(valor);
    if (Number.isInteger(numero) && numero > 0) return numero;
  }
  return null;
}

function extrairContextoHistorico(dados: unknown): {
  sessaoId: number | null;
  cenaId: number | null;
} {
  if (!dados || typeof dados !== 'object' || Array.isArray(dados)) {
    return { sessaoId: null, cenaId: null };
  }

  const registro = dados as Record<string, unknown>;
  return {
    sessaoId: normalizarIdContexto(registro.sessaoId),
    cenaId: normalizarIdContexto(registro.cenaId),
  };
}

export function CampaignCharacterEditorModal({
  isOpen,
  campanhaId,
  personagem,
  onClose,
  onPersonagemAtualizado,
  contextoSessao,
}: Props) {
  const [pvAtual, setPvAtual] = useState('');
  const [peAtual, setPeAtual] = useState('');
  const [eaAtual, setEaAtual] = useState('');
  const [sanAtual, setSanAtual] = useState('');

  const [campoModificador, setCampoModificador] =
    useState<CampoModificadorPersonagemCampanha>('EA_MAX');
  const [valorModificador, setValorModificador] = useState('');
  const [nomeModificador, setNomeModificador] = useState('');
  const [descricaoModificador, setDescricaoModificador] = useState('');

  const [modificadores, setModificadores] = useState<
    ModificadorPersonagemCampanha[]
  >([]);
  const [historico, setHistorico] = useState<HistoricoPersonagemCampanha[]>([]);
  const [filtroHistorico, setFiltroHistorico] =
    useState<FiltroHistoricoContexto>('TODOS');
  const [filtroTipoHistorico, setFiltroTipoHistorico] = useState<string>(
    FILTRO_HISTORICO_TIPO_TODOS,
  );
  const [loadingDados, setLoadingDados] = useState(false);
  const [savingRecursos, setSavingRecursos] = useState(false);
  const [savingModificador, setSavingModificador] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [sucesso, setSucesso] = useState<string | null>(null);

  const personagemId = personagem?.id ?? null;

  const titulo = useMemo(() => {
    if (!personagem) return 'Editar ficha da campanha';
    return `Editar ficha: ${personagem.nome}`;
  }, [personagem]);
  const filtrosModificador = useMemo(() => {
    if (!contextoSessao) return undefined;
    return {
      sessaoId: contextoSessao.sessaoId,
      ...(typeof contextoSessao.cenaId === 'number'
        ? { cenaId: contextoSessao.cenaId }
        : {}),
    };
  }, [contextoSessao]);

  const contextoLabel = useMemo(() => {
    if (!contextoSessao) return null;
    if (typeof contextoSessao.cenaId === 'number') {
      return `Sessao #${contextoSessao.sessaoId} - Cena #${contextoSessao.cenaId}`;
    }
    return `Sessao #${contextoSessao.sessaoId}`;
  }, [contextoSessao]);

  const filtroHistoricoPadrao = useMemo(
    () => obterFiltroHistoricoPadrao(contextoSessao),
    [contextoSessao],
  );

  const opcoesFiltroHistorico = useMemo(() => {
    const opcoes: Array<{ value: FiltroHistoricoContexto; label: string }> = [
      { value: 'TODOS', label: 'Todos os eventos' },
    ];

    if (contextoSessao) {
      opcoes.push({
        value: 'SESSAO_ATUAL',
        label: `Sessao atual (#${contextoSessao.sessaoId})`,
      });
    }

    if (contextoSessao && typeof contextoSessao.cenaId === 'number') {
      opcoes.push({
        value: 'CENA_ATUAL',
        label: `Cena atual (#${contextoSessao.cenaId})`,
      });
    }

    return opcoes;
  }, [contextoSessao]);

  const opcoesFiltroTipoHistorico = useMemo(() => {
    const tiposUnicos = Array.from(
      new Set(
        historico
          .map((evento) => evento.tipo)
          .filter((tipo) => typeof tipo === 'string' && tipo.trim() !== ''),
      ),
    ).sort((tipoA, tipoB) => tipoA.localeCompare(tipoB, 'pt-BR'));

    return [
      { value: FILTRO_HISTORICO_TIPO_TODOS, label: 'Todos os tipos' },
      ...tiposUnicos.map((tipo) => ({ value: tipo, label: tipo })),
    ];
  }, [historico]);

  const historicoFiltradoPorContexto = useMemo(() => {
    if (!contextoSessao || filtroHistorico === 'TODOS') {
      return historico;
    }

    if (filtroHistorico === 'SESSAO_ATUAL') {
      return historico.filter((evento) => {
        const contextoEvento = extrairContextoHistorico(evento.dados);
        return contextoEvento.sessaoId === contextoSessao.sessaoId;
      });
    }

    if (typeof contextoSessao.cenaId !== 'number') {
      return [];
    }

    return historico.filter((evento) => {
      const contextoEvento = extrairContextoHistorico(evento.dados);
      return (
        contextoEvento.sessaoId === contextoSessao.sessaoId &&
        contextoEvento.cenaId === contextoSessao.cenaId
      );
    });
  }, [contextoSessao, filtroHistorico, historico]);

  const historicoFiltrado = useMemo(() => {
    if (filtroTipoHistorico === FILTRO_HISTORICO_TIPO_TODOS) {
      return historicoFiltradoPorContexto;
    }
    return historicoFiltradoPorContexto.filter(
      (evento) => evento.tipo === filtroTipoHistorico,
    );
  }, [filtroTipoHistorico, historicoFiltradoPorContexto]);

  const carregarDadosRelacionados = useCallback(async () => {
    if (!personagemId) return;

    setLoadingDados(true);
    try {
      const [listaModificadores, listaHistorico] = await Promise.all([
        apiListarModificadoresPersonagemCampanha(
          campanhaId,
          personagemId,
          true,
          filtrosModificador,
        ),
        apiListarHistoricoPersonagemCampanha(campanhaId, personagemId),
      ]);

      setModificadores(listaModificadores);
      setHistorico(listaHistorico);
    } catch (error) {
      setErro(extrairMensagemErro(error));
    } finally {
      setLoadingDados(false);
    }
  }, [campanhaId, filtrosModificador, personagemId]);

  useEffect(() => {
    if (!isOpen || !personagem) return;

    setPvAtual(String(personagem.recursos.pvAtual));
    setPeAtual(String(personagem.recursos.peAtual));
    setEaAtual(String(personagem.recursos.eaAtual));
    setSanAtual(String(personagem.recursos.sanAtual));
    setErro(null);
    setSucesso(null);
    void carregarDadosRelacionados();
  }, [isOpen, personagemId, campanhaId, personagem, carregarDadosRelacionados]);

  useEffect(() => {
    if (!isOpen) return;
    setFiltroHistorico(filtroHistoricoPadrao);
    setFiltroTipoHistorico(FILTRO_HISTORICO_TIPO_TODOS);
  }, [filtroHistoricoPadrao, isOpen]);

  useEffect(() => {
    if (filtroTipoHistorico === FILTRO_HISTORICO_TIPO_TODOS) return;
    const tipoAindaExiste = historico.some(
      (evento) => evento.tipo === filtroTipoHistorico,
    );
    if (!tipoAindaExiste) {
      setFiltroTipoHistorico(FILTRO_HISTORICO_TIPO_TODOS);
    }
  }, [historico, filtroTipoHistorico]);

  async function handleSalvarRecursos() {
    if (!personagemId || !personagem) return;

    const payload = {
      pvAtual: Number.isNaN(Number(pvAtual))
        ? personagem.recursos.pvAtual
        : Number(pvAtual),
      peAtual: Number.isNaN(Number(peAtual))
        ? personagem.recursos.peAtual
        : Number(peAtual),
      eaAtual: Number.isNaN(Number(eaAtual))
        ? personagem.recursos.eaAtual
        : Number(eaAtual),
      sanAtual: Number.isNaN(Number(sanAtual))
        ? personagem.recursos.sanAtual
        : Number(sanAtual),
    };

    setErro(null);
    setSucesso(null);
    setSavingRecursos(true);
    try {
      const atualizado = await apiAtualizarRecursosPersonagemCampanha(
        campanhaId,
        personagemId,
        payload,
      );
      onPersonagemAtualizado(atualizado);
      setPvAtual(String(atualizado.recursos.pvAtual));
      setPeAtual(String(atualizado.recursos.peAtual));
      setEaAtual(String(atualizado.recursos.eaAtual));
      setSanAtual(String(atualizado.recursos.sanAtual));
      setSucesso('Recursos atualizados na ficha da campanha.');
      await carregarDadosRelacionados();
    } catch (error) {
      setErro(extrairMensagemErro(error));
    } finally {
      setSavingRecursos(false);
    }
  }

  async function handleAplicarModificador() {
    if (!personagemId) return;
    const valor = Number(valorModificador);

    if (Number.isNaN(valor) || valor === 0) {
      setErro('Informe um valor inteiro diferente de zero para o modificador.');
      return;
    }

    if (!nomeModificador.trim()) {
      setErro('Informe um nome para identificar a origem do modificador.');
      return;
    }

    setErro(null);
    setSucesso(null);
    setSavingModificador(true);
    try {
      const resposta = await apiAplicarModificadorPersonagemCampanha(
        campanhaId,
        personagemId,
        {
          campo: campoModificador,
          valor,
          nome: nomeModificador.trim(),
          descricao: descricaoModificador.trim() || undefined,
          sessaoId: contextoSessao?.sessaoId,
          cenaId:
            typeof contextoSessao?.cenaId === 'number'
              ? contextoSessao.cenaId
              : undefined,
        },
      );

      onPersonagemAtualizado(resposta.personagem);
      setValorModificador('');
      setNomeModificador('');
      setDescricaoModificador('');
      setSucesso('Modificador aplicado com sucesso.');
      await carregarDadosRelacionados();
    } catch (error) {
      setErro(extrairMensagemErro(error));
    } finally {
      setSavingModificador(false);
    }
  }

  async function handleDesfazerModificador(modificadorId: number) {
    if (!personagemId) return;

    setErro(null);
    setSucesso(null);
    setSavingModificador(true);
    try {
      const resposta = await apiDesfazerModificadorPersonagemCampanha(
        campanhaId,
        personagemId,
        modificadorId,
      );
      onPersonagemAtualizado(resposta.personagem);
      setSucesso('Modificador desfeito com sucesso.');
      await carregarDadosRelacionados();
    } catch (error) {
      setErro(extrairMensagemErro(error));
    } finally {
      setSavingModificador(false);
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={titulo} size="xl">
      {!personagem ? null : (
        <div className="space-y-5">
          {contextoLabel ? (
            <section className="rounded-lg border border-app-border bg-app-surface p-3">
              <p className="text-xs text-app-muted">
                Contexto dos modificadores: {contextoLabel}
              </p>
            </section>
          ) : null}

          <section className="rounded-lg border border-app-border bg-app-surface p-4 space-y-3">
            <h3 className="text-sm font-semibold text-app-fg">
              Recursos atuais da campanha
            </h3>
            {personagem.recursos.pvBarrasTotal &&
            personagem.recursos.pvBarrasTotal > 1 ? (
              <div className="flex flex-wrap items-center gap-2 text-xs text-app-muted">
                <span>
                  PV por nucleo: {personagem.recursos.pvBarraMaxAtual ?? personagem.recursos.pvMax}
                </span>
                <span>Total: {personagem.recursos.pvMax}</span>
                <span>
                  Nucleos: {personagem.recursos.pvBarrasRestantes ?? personagem.recursos.pvBarrasTotal}/
                  {personagem.recursos.pvBarrasTotal}
                </span>
              </div>
            ) : null}
            <div className="grid gap-3 md:grid-cols-4">
              <Input
                label={`PV Atual (max ${
                  personagem.recursos.pvBarrasTotal &&
                  personagem.recursos.pvBarrasTotal > 1
                    ? personagem.recursos.pvBarraMaxAtual ?? personagem.recursos.pvMax
                    : personagem.recursos.pvMax
                })`}
                type="number"
                value={pvAtual}
                onChange={(e) => setPvAtual(e.target.value)}
              />
              <Input
                label={`PE Atual (max ${personagem.recursos.peMax})`}
                type="number"
                value={peAtual}
                onChange={(e) => setPeAtual(e.target.value)}
              />
              <Input
                label={`EA Atual (max ${personagem.recursos.eaMax})`}
                type="number"
                value={eaAtual}
                onChange={(e) => setEaAtual(e.target.value)}
              />
              <Input
                label={`SAN Atual (max ${personagem.recursos.sanMax})`}
                type="number"
                value={sanAtual}
                onChange={(e) => setSanAtual(e.target.value)}
              />
            </div>
            <Button onClick={handleSalvarRecursos} disabled={savingRecursos}>
              {savingRecursos ? 'Salvando...' : 'Salvar recursos'}
            </Button>
          </section>

          <section className="rounded-lg border border-app-border bg-app-surface p-4 space-y-3">
            <h3 className="text-sm font-semibold text-app-fg">
              Inventario da campanha
            </h3>
            {personagemId ? (
              <SessionCharacterInventoryTab
                campanhaId={campanhaId}
                personagemCampanhaId={personagemId}
                podeEditar={true}
                ativo={isOpen}
              />
            ) : (
              <p className="text-xs text-app-muted">
                Selecione um personagem para visualizar o inventario.
              </p>
            )}
          </section>

          <section className="rounded-lg border border-app-border bg-app-surface p-4 space-y-3">
            <h3 className="text-sm font-semibold text-app-fg">
              Aplicar modificador narrativo
            </h3>
            <div className="grid gap-3 md:grid-cols-2">
              <Select
                label="Campo"
                value={campoModificador}
                onChange={(e) =>
                  setCampoModificador(
                    e.target.value as CampoModificadorPersonagemCampanha,
                  )
                }
                options={CAMPOS_MODIFICADOR_OPTIONS}
              />
              <Input
                label="Valor (+/-)"
                type="number"
                value={valorModificador}
                onChange={(e) => setValorModificador(e.target.value)}
              />
              <Input
                label="Nome da fonte"
                value={nomeModificador}
                onChange={(e) => setNomeModificador(e.target.value)}
                placeholder="Ex.: Maldicao ancestral"
              />
              <div className="md:col-span-2">
                <Textarea
                  label="Descricao (opcional)"
                  value={descricaoModificador}
                  onChange={(e) => setDescricaoModificador(e.target.value)}
                  rows={2}
                />
              </div>
            </div>
            <Button
              variant="primary"
              onClick={handleAplicarModificador}
              disabled={savingModificador}
            >
              {savingModificador ? 'Aplicando...' : 'Aplicar modificador'}
            </Button>
          </section>

          {erro && (
            <p className="rounded border border-app-danger/40 bg-app-danger/10 px-3 py-2 text-sm text-app-danger">
              {erro}
            </p>
          )}
          {sucesso && (
            <p className="rounded border border-app-success/40 bg-app-success/10 px-3 py-2 text-sm text-app-success">
              {sucesso}
            </p>
          )}

          <section className="rounded-lg border border-app-border bg-app-surface p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-app-fg">Modificadores</h3>
              {loadingDados && (
                <span className="text-xs text-app-muted flex items-center gap-1">
                  <Icon name="spinner" className="w-3 h-3" />
                  Atualizando...
                </span>
              )}
            </div>
            {modificadores.length === 0 ? (
              <p className="text-sm text-app-muted">
                Nenhum modificador aplicado nesta ficha.
              </p>
            ) : (
              <ul className="space-y-2">
                {modificadores.map((modificador) => (
                  <li
                    key={modificador.id}
                    className="rounded border border-app-border p-3"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-app-fg">
                          {modificador.nome}{' '}
                          <span className="text-app-muted font-normal">
                            ({LABEL_CAMPO_MODIFICADOR[modificador.campo]})
                          </span>
                        </p>
                        <p className="text-sm text-app-muted">
                          Valor: {modificador.valor > 0 ? '+' : ''}
                          {modificador.valor}
                        </p>
                        {modificador.descricao && (
                          <p className="text-sm text-app-muted">
                            {modificador.descricao}
                          </p>
                        )}
                        <p className="text-xs text-app-muted">
                          Criado em {formatarDataHora(modificador.criadoEm)}
                        </p>
                        {modificador.sessaoId !== null || modificador.cenaId !== null ? (
                          <p className="text-xs text-app-muted">
                            Contexto:{' '}
                            {modificador.sessaoId !== null
                              ? `Sessao #${modificador.sessaoId}`
                              : 'Sessao nao informada'}
                            {modificador.cenaId !== null
                              ? ` - Cena #${modificador.cenaId}`
                              : ''}
                          </p>
                        ) : null}
                        {!modificador.ativo && modificador.desfeitoEm && (
                          <p className="text-xs text-app-muted">
                            Desfeito em {formatarDataHora(modificador.desfeitoEm)}
                          </p>
                        )}
                      </div>
                      {modificador.ativo ? (
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() =>
                            void handleDesfazerModificador(modificador.id)
                          }
                          disabled={savingModificador}
                        >
                          Desfazer
                        </Button>
                      ) : (
                        <span className="text-xs rounded border border-app-border px-2 py-1 text-app-muted">
                          Desfeito
                        </span>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="rounded-lg border border-app-border bg-app-surface p-4 space-y-3">
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-sm font-semibold text-app-fg">Historico</h3>
              <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
                {contextoSessao ? (
                  <div className="sm:min-w-[220px]">
                    <Select
                      aria-label="Filtro de contexto do historico"
                      value={filtroHistorico}
                      onChange={(event) =>
                        setFiltroHistorico(
                          event.target.value as FiltroHistoricoContexto,
                        )
                      }
                      options={opcoesFiltroHistorico}
                    />
                  </div>
                ) : null}
                <div className="sm:min-w-[220px]">
                  <Select
                    aria-label="Filtro de tipo do historico"
                    value={filtroTipoHistorico}
                    onChange={(event) => setFiltroTipoHistorico(event.target.value)}
                    options={opcoesFiltroTipoHistorico}
                  />
                </div>
              </div>
            </div>
            {historico.length > 0 ? (
              <p className="text-xs text-app-muted">
                Mostrando {historicoFiltrado.length} de {historico.length} evento(s).
              </p>
            ) : null}
            {historicoFiltrado.length === 0 ? (
              <p className="text-sm text-app-muted">
                {historico.length === 0
                  ? 'Nenhum evento registrado para esta ficha ainda.'
                  : 'Nenhum evento encontrado para o filtro selecionado.'}
              </p>
            ) : (
              <ul className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {historicoFiltrado.map((evento) => {
                  const contextoEvento = extrairContextoHistorico(evento.dados);
                  return (
                    <li
                      key={evento.id}
                      className="rounded border border-app-border px-3 py-2"
                    >
                      <p className="text-sm text-app-fg">{evento.tipo}</p>
                      {evento.descricao && (
                        <p className="text-sm text-app-muted">{evento.descricao}</p>
                      )}
                      {(contextoEvento.sessaoId !== null ||
                        contextoEvento.cenaId !== null) && (
                        <p className="text-xs text-app-muted">
                          Contexto:{' '}
                          {contextoEvento.sessaoId !== null
                            ? `Sessao #${contextoEvento.sessaoId}`
                            : 'Sessao nao informada'}
                          {contextoEvento.cenaId !== null
                            ? ` - Cena #${contextoEvento.cenaId}`
                            : ''}
                        </p>
                      )}
                      <p className="text-xs text-app-muted">
                        {formatarDataHora(evento.criadoEm)}
                        {evento.criadoPor?.apelido
                          ? ` por ${evento.criadoPor.apelido}`
                          : ''}
                      </p>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>
        </div>
      )}
    </Modal>
  );
}
