'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  apiAplicarModificadorPersonagemCampanha,
  apiAtualizarRecursosPersonagemCampanha,
  apiDesfazerModificadorPersonagemCampanha,
  apiGetPericias,
  apiGetTiposGrau,
  apiListarHistoricoPersonagemCampanha,
  apiListarModificadoresPersonagemCampanha,
  criarErroUsuario,
} from '@/lib/api';
import type {
  CampoModificadorPersonagemCampanha,
  HistoricoPersonagemCampanha,
  ModificadorPersonagemCampanha,
  PersonagemCampanhaResumo,
  UserErrorState,
} from '@/lib/types';
import type { PericiaCatalogo, TipoGrauCatalogo } from '@/lib/types/catalogo.types';
import {
  calcularPreviewGrauNarrativo,
  calcularPreviewTreinamentoNarrativo,
  formatarValorModificadorNarrativo,
  obterAlvoModificadorNarrativo,
} from '@/lib/campanha/modificadores-narrativos';
import { formatarDataHora } from '@/lib/utils/formatters';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import { Button } from '@/components/ui/Button';
import { ErrorAlert } from '@/components/ui/ErrorAlert';
import { Icon } from '@/components/ui/Icon';
import { SessionCharacterInventoryTab } from '@/components/campanha/sessao/SessionCharacterInventoryTab';
import { CharacterLinkedEntitiesPanel } from './CharacterLinkedEntitiesPanel';
import { CampaignCharacterConcessionsSection } from './CampaignCharacterConcessionsSection';

type Props = {
  isOpen: boolean;
  campanhaId: number;
  personagem:
    | (Pick<PersonagemCampanhaResumo, 'id' | 'nome' | 'recursos'> &
        Partial<Pick<PersonagemCampanhaResumo, 'pericias' | 'grausAprimoramento'>>)
    | null;
  onClose: () => void;
  onPersonagemAtualizado: (personagem: PersonagemCampanhaResumo) => void;
  contextoSessao?: {
    sessaoId: number;
    cenaId?: number | null;
  };
};

type FiltroHistoricoContexto = 'TODOS' | 'SESSAO_ATUAL' | 'CENA_ATUAL';
type TipoFormularioModificador = 'ATRIBUTOS' | 'PERICIAS' | 'GRAUS';
const FILTRO_HISTORICO_TIPO_TODOS = '__TODOS__';

const CAMPOS_MODIFICADOR_NUMERICO_OPTIONS: Array<{
  value: Exclude<
    CampoModificadorPersonagemCampanha,
    'PERICIA_TREINAMENTO' | 'GRAU_APRIMORAMENTO'
  >;
  label: string;
}> = [
  { value: 'PV_MAX', label: 'PV Máximo' },
  { value: 'PE_MAX', label: 'PE Máximo' },
  { value: 'EA_MAX', label: 'EA Máximo' },
  { value: 'SAN_MAX', label: 'Sanidade Máxima' },
  { value: 'DEFESA_BASE', label: 'Defesa Base' },
  { value: 'DEFESA_EQUIPAMENTO', label: 'Defesa Equipamento' },
  { value: 'DEFESA_OUTROS', label: 'Defesa Outros' },
  { value: 'ESQUIVA', label: 'Esquiva' },
  { value: 'BLOQUEIO', label: 'Bloqueio' },
  { value: 'DESLOCAMENTO', label: 'Deslocamento' },
  { value: 'LIMITE_PE_EA_POR_TURNO', label: 'Limite PE/EA por turno' },
  { value: 'PRESTIGIO_GERAL', label: 'Prestígio Geral' },
  { value: 'PRESTIGIO_CLA', label: 'Prestígio Clã' },
];

const LABEL_CAMPO_MODIFICADOR: Record<CampoModificadorPersonagemCampanha, string> =
  Object.fromEntries(
    [
      ...CAMPOS_MODIFICADOR_NUMERICO_OPTIONS,
      { value: 'PERICIA_TREINAMENTO', label: 'Treinamento de perícia' },
      { value: 'GRAU_APRIMORAMENTO', label: 'Grau de aprimoramento' },
    ].map((item) => [item.value, item.label]),
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

  const [tipoFormularioModificador, setTipoFormularioModificador] =
    useState<TipoFormularioModificador>('ATRIBUTOS');
  const [campoModificador, setCampoModificador] =
    useState<CampoModificadorPersonagemCampanha>('EA_MAX');
  const [periciaModificadorCodigo, setPericiaModificadorCodigo] = useState('');
  const [tipoGrauModificadorCodigo, setTipoGrauModificadorCodigo] =
    useState('');
  const [valorModificador, setValorModificador] = useState('');
  const [nomeModificador, setNomeModificador] = useState('');
  const [descricaoModificador, setDescricaoModificador] = useState('');

  const [modificadores, setModificadores] = useState<
    ModificadorPersonagemCampanha[]
  >([]);
  const [historico, setHistorico] = useState<HistoricoPersonagemCampanha[]>([]);
  const [periciasCatalogo, setPericiasCatalogo] = useState<PericiaCatalogo[]>(
    [],
  );
  const [tiposGrauCatalogo, setTiposGrauCatalogo] = useState<TipoGrauCatalogo[]>(
    [],
  );
  const [filtroHistorico, setFiltroHistorico] =
    useState<FiltroHistoricoContexto>('TODOS');
  const [filtroTipoHistorico, setFiltroTipoHistorico] = useState<string>(
    FILTRO_HISTORICO_TIPO_TODOS,
  );
  const [loadingDados, setLoadingDados] = useState(false);
  const [savingRecursos, setSavingRecursos] = useState(false);
  const [savingModificador, setSavingModificador] = useState(false);
  const [erro, setErro] = useState<UserErrorState | null>(null);
  const [sucesso, setSucesso] = useState<string | null>(null);

  const personagemId = personagem?.id ?? null;

  const titulo = useMemo(() => {
    if (!personagem) return 'Editar ficha da campanha';
    return `Editar ficha: ${personagem.nome}`;
  }, [personagem]);
  const periciasPersonagem = useMemo(
    () => personagem?.pericias ?? [],
    [personagem?.pericias],
  );
  const grausPersonagem = useMemo(
    () => personagem?.grausAprimoramento ?? [],
    [personagem?.grausAprimoramento],
  );
  const periciaSelecionada = useMemo(
    () =>
      periciasPersonagem.find(
        (pericia) => pericia.codigo === periciaModificadorCodigo,
      ) ?? null,
    [periciaModificadorCodigo, periciasPersonagem],
  );
  const tipoGrauSelecionado = useMemo(
    () =>
      grausPersonagem.find(
        (grau) => grau.tipoGrauCodigo === tipoGrauModificadorCodigo,
      ) ?? null,
    [grausPersonagem, tipoGrauModificadorCodigo],
  );
  const valorModificadorNumerico = Number(valorModificador);
  const valorPreviewValido =
    Number.isInteger(valorModificadorNumerico) && valorModificadorNumerico !== 0;
  const previewPericia = useMemo(() => {
    if (!periciaModificadorCodigo || !valorPreviewValido) return null;
    const atual = periciaSelecionada?.grauTreinamento ?? 0;
    return calcularPreviewTreinamentoNarrativo(
      atual,
      valorModificadorNumerico,
    );
  }, [
    periciaModificadorCodigo,
    periciaSelecionada?.grauTreinamento,
    valorModificadorNumerico,
    valorPreviewValido,
  ]);
  const previewGrau = useMemo(() => {
    if (!tipoGrauModificadorCodigo || !valorPreviewValido) return null;
    const atual = tipoGrauSelecionado?.valor ?? 0;
    return calcularPreviewGrauNarrativo(atual, valorModificadorNumerico);
  }, [
    tipoGrauModificadorCodigo,
    tipoGrauSelecionado?.valor,
    valorModificadorNumerico,
    valorPreviewValido,
  ]);
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

  const opcoesPericiasModificador = useMemo(
    () =>
      periciasCatalogo.map((pericia) => ({
        value: pericia.codigo,
        label: `${pericia.nome} (${pericia.atributoBase})`,
      })),
    [periciasCatalogo],
  );

  const opcoesTiposGrauModificador = useMemo(
    () =>
      tiposGrauCatalogo.map((tipoGrau) => ({
        value: tipoGrau.codigo,
        label: tipoGrau.nome,
      })),
    [tiposGrauCatalogo],
  );

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
      setErro(criarErroUsuario(error));
    } finally {
      setLoadingDados(false);
    }
  }, [campanhaId, filtrosModificador, personagemId]);

  useEffect(() => {
    if (!isOpen) return;

    let ativo = true;
    void (async () => {
      try {
        const [pericias, tiposGrau] = await Promise.all([
          apiGetPericias(),
          apiGetTiposGrau(),
        ]);
        if (!ativo) return;
        setPericiasCatalogo(pericias);
        setTiposGrauCatalogo(tiposGrau);
        setPericiaModificadorCodigo((atual) => atual || pericias[0]?.codigo || '');
        setTipoGrauModificadorCodigo(
          (atual) => atual || tiposGrau[0]?.codigo || '',
        );
      } catch (error) {
        if (!ativo) return;
        setErro(criarErroUsuario(error));
      }
    })();

    return () => {
      ativo = false;
    };
  }, [isOpen]);

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
      setErro(criarErroUsuario(error));
    } finally {
      setSavingRecursos(false);
    }
  }

  async function handleAplicarModificador() {
    if (!personagemId) return;
    const valor = Number(valorModificador);

    if (!Number.isInteger(valor) || valor === 0) {
      setErro('Informe um valor inteiro diferente de zero para o modificador.');
      return;
    }

    if (!nomeModificador.trim()) {
      setErro('Informe um nome para identificar a origem do modificador.');
      return;
    }

    let campoEnvio: CampoModificadorPersonagemCampanha = campoModificador;
    let periciaCodigo: string | undefined;
    let tipoGrauCodigo: string | undefined;

    if (tipoFormularioModificador === 'PERICIAS') {
      if (!periciaModificadorCodigo) {
        setErro('Selecione a perícia que receberá o ajuste narrativo.');
        return;
      }
      campoEnvio = 'PERICIA_TREINAMENTO';
      periciaCodigo = periciaModificadorCodigo;
    }

    if (tipoFormularioModificador === 'GRAUS') {
      if (!tipoGrauModificadorCodigo) {
        setErro('Selecione o grau de aprimoramento que receberá o ajuste.');
        return;
      }
      campoEnvio = 'GRAU_APRIMORAMENTO';
      tipoGrauCodigo = tipoGrauModificadorCodigo;
    }

    setErro(null);
    setSucesso(null);
    setSavingModificador(true);
    try {
      const resposta = await apiAplicarModificadorPersonagemCampanha(
        campanhaId,
        personagemId,
        {
          campo: campoEnvio,
          periciaCodigo,
          tipoGrauCodigo,
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
      setErro(criarErroUsuario(error));
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
      setErro(criarErroUsuario(error));
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
                Selecione um personagem para visualizar o inventário.
              </p>
            )}
          </section>

          <CharacterLinkedEntitiesPanel
            campanhaId={campanhaId}
            personagemCampanhaId={personagemId}
            onAtualizado={() => {
              void carregarDadosRelacionados();
            }}
          />

          {personagemId ? (
            <CampaignCharacterConcessionsSection
              campanhaId={campanhaId}
              personagemId={personagemId}
              ativo={isOpen}
            />
          ) : null}

          <section className="rounded-lg border border-app-border bg-app-surface p-4 space-y-3">
            <h3 className="text-sm font-semibold text-app-fg">
              Aplicar modificador narrativo
            </h3>
            <div className="flex flex-wrap gap-2">
              {[
                { id: 'ATRIBUTOS' as const, label: 'Atributos' },
                { id: 'PERICIAS' as const, label: 'Perícias' },
                { id: 'GRAUS' as const, label: 'Graus' },
              ].map((opcao) => (
                <Button
                  key={opcao.id}
                  type="button"
                  size="sm"
                  variant={
                    tipoFormularioModificador === opcao.id
                      ? 'primary'
                      : 'secondary'
                  }
                  onClick={() => setTipoFormularioModificador(opcao.id)}
                >
                  {opcao.label}
                </Button>
              ))}
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              {tipoFormularioModificador === 'ATRIBUTOS' ? (
                <Select
                  label="Campo"
                  value={campoModificador}
                  onChange={(e) =>
                    setCampoModificador(
                      e.target.value as CampoModificadorPersonagemCampanha,
                    )
                  }
                  options={CAMPOS_MODIFICADOR_NUMERICO_OPTIONS}
                />
              ) : null}
              {tipoFormularioModificador === 'PERICIAS' ? (
                <Select
                  label="Perícia"
                  value={periciaModificadorCodigo}
                  onChange={(e) => setPericiaModificadorCodigo(e.target.value)}
                  options={opcoesPericiasModificador}
                  disabled={opcoesPericiasModificador.length === 0}
                  helperText={
                    previewPericia
                      ? `Treinamento atual ${previewPericia.atual} -> ${previewPericia.proximo}`
                      : 'O valor altera níveis de treinamento; cada nível vale +5.'
                  }
                />
              ) : null}
              {tipoFormularioModificador === 'GRAUS' ? (
                <Select
                  label="Grau de aprimoramento"
                  value={tipoGrauModificadorCodigo}
                  onChange={(e) => setTipoGrauModificadorCodigo(e.target.value)}
                  options={opcoesTiposGrauModificador}
                  disabled={opcoesTiposGrauModificador.length === 0}
                  helperText={
                    previewGrau
                      ? `Grau atual ${previewGrau.atual} -> ${previewGrau.proximo}`
                      : 'O valor altera graus efetivos da ficha de campanha.'
                  }
                />
              ) : null}
              <Input
                label="Valor (+/-)"
                type="number"
                value={valorModificador}
                onChange={(e) => setValorModificador(e.target.value)}
                helperText={
                  tipoFormularioModificador === 'PERICIAS'
                    ? '+1 concede um nível de treino; -1 remove um nível.'
                    : tipoFormularioModificador === 'GRAUS'
                      ? '+1 concede um grau; -1 remove um grau.'
                      : undefined
                }
              />
              <Input
                label="Nome da fonte"
                value={nomeModificador}
                onChange={(e) => setNomeModificador(e.target.value)}
                placeholder="Ex.: Maldição ancestral"
              />
              <div className="md:col-span-2">
                <Textarea
                  label="Descrição (opcional)"
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

          {erro ? <ErrorAlert message={erro} /> : null}
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
                {modificadores.map((modificador) => {
                  const alvo = obterAlvoModificadorNarrativo(modificador);
                  return (
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
                        {alvo ? (
                          <p className="text-sm text-app-muted">
                            Alvo: {alvo}
                          </p>
                        ) : null}
                        <p className="text-sm text-app-muted">
                          Valor: {formatarValorModificadorNarrativo(
                            modificador.campo,
                            modificador.valor,
                          )}
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
                              : 'Sessão não informada'}
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
                  );
                })}
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
                            : 'Sessão não informada'}
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
