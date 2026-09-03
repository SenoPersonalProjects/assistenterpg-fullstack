'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  apiAtualizarEntidadeVinculadaPersonagem,
  apiAtualizarEstadoEntidadeVinculadaPersonagem,
  apiAssociarTemplateEntidadeVinculada,
  apiCriarEntidadeVinculadaPersonagem,
  apiDuplicarEntidadeVinculadaPersonagem,
  apiGetMeusNpcsAmeacas,
  apiListarCapacidadesEntidadesVinculadas,
  apiListarEntidadesVinculadasPersonagem,
  apiListarTemplatesEntidadesVinculadas,
  apiRecalcularEntidadeVinculadaPersonagem,
  apiRemoverEntidadeVinculadaPersonagem,
  criarErroUsuario,
} from '@/lib/api';
import type {
  EntidadeVinculadaPersonagem,
  EntidadeVinculadaPersonagemPayload,
  CapacidadesEntidadesVinculadas,
  EstadoEntidadeVinculadaPersonagem,
  NpcAmeacaResumo,
  PapelCalculoEntidadeVinculada,
  TemplateEntidadeVinculada,
  TipoEntidadeVinculadaPersonagem,
  TipoFichaNpcAmeaca,
  TipoNpcAmeaca,
  UserErrorState,
} from '@/lib/types';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { ErrorAlert } from '@/components/ui/ErrorAlert';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import {
  formatarUsoCapacidadeEntidadeVinculada,
  resolverFluxoCriacaoEntidadeVinculada,
  validarPontosVidaEntidadeVinculada,
} from '@/lib/campanha/entidades-vinculadas';

type Props = {
  campanhaId: number;
  personagemCampanhaId: number | null;
  onAtualizado?: () => void;
};

type FormState = {
  id: number | null;
  tipo: TipoEntidadeVinculadaPersonagem;
  nome: string;
  descricao: string;
  conceito: string;
  aparencia: string;
  npcAmeacaOrigemId: string;
  tecnicaOrigemId: string;
  papel: PapelCalculoEntidadeVinculada;
  pontaria: string;
  overrideMestre: boolean;
  fichaTipo: TipoFichaNpcAmeaca;
  tipoNpc: TipoNpcAmeaca;
  tamanho: string;
  defesa: string;
  pontosVidaMax: string;
  pontosVidaAtual: string;
  rd: string;
  deslocamentoMetros: string;
  vagasOcupadas: string;
  cargasMax: string;
  cargasAtual: string;
  agilidade: string;
  forca: string;
  intelecto: string;
  presenca: string;
  vigor: string;
  percepcao: string;
  iniciativa: string;
  fortitude: string;
  reflexos: string;
  vontade: string;
  luta: string;
  jujutsu: string;
};

const TIPOS: Array<{ value: TipoEntidadeVinculadaPersonagem; label: string }> = [
  { value: 'SHIKIGAMI', label: 'Shikigami' },
  { value: 'CORPO_AMALDICOADO', label: 'Corpo Amaldicoado' },
  { value: 'MALDICAO_CONTROLADA', label: 'Maldicao Controlada' },
];

const ESTADOS: Array<{ value: EstadoEntidadeVinculadaPersonagem; label: string }> =
  [
    { value: 'DISPONIVEL', label: 'Disponivel' },
    { value: 'ATIVO', label: 'Ativo' },
    { value: 'DESTRUIDO', label: 'Destruido' },
    { value: 'SELADO', label: 'Selado' },
    { value: 'DESCARREGADO', label: 'Descarregado' },
    { value: 'ARQUIVADO', label: 'Arquivado' },
  ];

const GRUPOS: Array<{ tipo: TipoEntidadeVinculadaPersonagem; titulo: string }> = [
  { tipo: 'SHIKIGAMI', titulo: 'Shikigamis' },
  { tipo: 'CORPO_AMALDICOADO', titulo: 'Corpos Amaldicoados' },
  { tipo: 'MALDICAO_CONTROLADA', titulo: 'Maldicoes Controladas' },
];

const FICHA_OPTIONS: Array<{ value: TipoFichaNpcAmeaca; label: string }> = [
  { value: 'NPC', label: 'NPC' },
  { value: 'AMEACA', label: 'Ameaca' },
];

const TIPO_NPC_OPTIONS: Array<{ value: TipoNpcAmeaca; label: string }> = [
  { value: 'OUTRO', label: 'Outro' },
  { value: 'HUMANO', label: 'Humano' },
  { value: 'FEITICEIRO', label: 'Feiticeiro' },
  { value: 'MALDICAO', label: 'Maldicao' },
  { value: 'ANIMAL', label: 'Animal' },
  { value: 'HIBRIDO', label: 'Hibrido' },
];

const TAMANHO_OPTIONS = [
  { value: 'MINUSCULO', label: 'Minusculo' },
  { value: 'PEQUENO', label: 'Pequeno' },
  { value: 'MEDIO', label: 'Medio' },
  { value: 'GRANDE', label: 'Grande' },
  { value: 'ENORME', label: 'Enorme' },
  { value: 'COLOSSAL', label: 'Colossal' },
];

const PAPEL_OPTIONS: Array<{
  value: PapelCalculoEntidadeVinculada;
  label: string;
}> = [
  { value: 'AGIL', label: 'Agil' },
  { value: 'FLEXIVEL', label: 'Flexivel' },
  { value: 'TANQUE', label: 'Tanque' },
];

const CAMPOS_NUMERICOS: Array<{ label: string; key: keyof FormState }> = [
  { label: 'PV Max', key: 'pontosVidaMax' },
  { label: 'PV Atual', key: 'pontosVidaAtual' },
  { label: 'Defesa', key: 'defesa' },
  { label: 'RD', key: 'rd' },
  { label: 'Desloc.', key: 'deslocamentoMetros' },
  { label: 'Cargas Max', key: 'cargasMax' },
  { label: 'Cargas Atual', key: 'cargasAtual' },
  { label: 'AGI', key: 'agilidade' },
  { label: 'FOR', key: 'forca' },
  { label: 'INT', key: 'intelecto' },
  { label: 'PRE', key: 'presenca' },
  { label: 'VIG', key: 'vigor' },
  { label: 'Percepcao', key: 'percepcao' },
  { label: 'Iniciativa', key: 'iniciativa' },
  { label: 'Fortitude', key: 'fortitude' },
  { label: 'Reflexos', key: 'reflexos' },
  { label: 'Vontade', key: 'vontade' },
  { label: 'Luta', key: 'luta' },
  { label: 'Jujutsu', key: 'jujutsu' },
  { label: 'Pontaria', key: 'pontaria' },
];

const CAMPOS_DERIVADOS = new Set<keyof FormState>([
  'pontosVidaMax',
  'pontosVidaAtual',
  'defesa',
  'rd',
]);

function criarFormInicial(): FormState {
  return {
    id: null,
    tipo: 'SHIKIGAMI',
    nome: '',
    descricao: '',
    conceito: '',
    aparencia: '',
    npcAmeacaOrigemId: '',
    tecnicaOrigemId: '',
    papel: 'FLEXIVEL',
    pontaria: '0',
    overrideMestre: false,
    fichaTipo: 'NPC',
    tipoNpc: 'OUTRO',
    tamanho: 'MEDIO',
    defesa: '10',
    pontosVidaMax: '1',
    pontosVidaAtual: '1',
    rd: '0',
    deslocamentoMetros: '6',
    vagasOcupadas: '1',
    cargasMax: '',
    cargasAtual: '',
    agilidade: '0',
    forca: '0',
    intelecto: '0',
    presenca: '0',
    vigor: '0',
    percepcao: '0',
    iniciativa: '0',
    fortitude: '0',
    reflexos: '0',
    vontade: '0',
    luta: '0',
    jujutsu: '0',
  };
}

function preencherForm(entidade: EntidadeVinculadaPersonagem): FormState {
  return {
    ...criarFormInicial(),
    id: entidade.id,
    tipo: entidade.tipo,
    nome: entidade.nome,
    descricao: entidade.descricao ?? '',
    conceito: entidade.conceito ?? '',
    aparencia: entidade.aparencia ?? '',
    npcAmeacaOrigemId: entidade.npcAmeacaOrigemId
      ? String(entidade.npcAmeacaOrigemId)
      : '',
    tecnicaOrigemId: entidade.tecnicaOrigemId
      ? String(entidade.tecnicaOrigemId)
      : '',
    papel: entidade.calculoAutomatico?.papel ?? 'FLEXIVEL',
    pontaria: String(entidade.pontaria ?? 0),
    overrideMestre: entidade.overrideMestre,
    fichaTipo: entidade.fichaTipo,
    tipoNpc: entidade.tipoNpc,
    tamanho: entidade.tamanho,
    defesa: String(entidade.defesa),
    pontosVidaMax: String(entidade.pontosVidaMax),
    pontosVidaAtual: String(entidade.pontosVidaAtual),
    rd: String(entidade.rd),
    deslocamentoMetros: String(entidade.deslocamentoMetros),
    vagasOcupadas: String(entidade.vagasOcupadas),
    cargasMax: entidade.cargasMax === null ? '' : String(entidade.cargasMax),
    cargasAtual:
      entidade.cargasAtual === null ? '' : String(entidade.cargasAtual),
    agilidade: String(entidade.agilidade),
    forca: String(entidade.forca),
    intelecto: String(entidade.intelecto),
    presenca: String(entidade.presenca),
    vigor: String(entidade.vigor),
    percepcao: String(entidade.percepcao),
    iniciativa: String(entidade.iniciativa),
    fortitude: String(entidade.fortitude),
    reflexos: String(entidade.reflexos),
    vontade: String(entidade.vontade),
    luta: String(entidade.luta),
    jujutsu: String(entidade.jujutsu),
  };
}

function inteiro(valor: string, fallback: number): number {
  const numero = Number(valor);
  return Number.isInteger(numero) ? numero : fallback;
}

function inteiroOpcional(valor: string): number | null {
  if (valor.trim() === '') return null;
  const numero = Number(valor);
  return Number.isInteger(numero) ? numero : null;
}

function montarPayload(form: FormState): EntidadeVinculadaPersonagemPayload {
  return {
    tipo: form.tipo,
    nome: form.nome.trim(),
    descricao: form.descricao.trim() || null,
    conceito: form.conceito.trim() || null,
    aparencia: form.aparencia.trim() || null,
    npcAmeacaOrigemId: inteiroOpcional(form.npcAmeacaOrigemId),
    tecnicaOrigemId: inteiroOpcional(form.tecnicaOrigemId),
    papel: form.papel,
    pontaria: Math.max(0, inteiro(form.pontaria, 0)),
    overrideMestre: form.overrideMestre,
    fichaTipo: form.fichaTipo,
    tipoNpc: form.tipoNpc,
    tamanho: form.tamanho,
    defesa: inteiro(form.defesa, 10),
    pontosVidaMax: Math.max(1, inteiro(form.pontosVidaMax, 1)),
    pontosVidaAtual: Math.max(0, inteiro(form.pontosVidaAtual, 1)),
    rd: Math.max(0, inteiro(form.rd, 0)),
    deslocamentoMetros: Math.max(0, inteiro(form.deslocamentoMetros, 6)),
    vagasOcupadas: Math.max(1, inteiro(form.vagasOcupadas, 1)),
    cargasMax: inteiroOpcional(form.cargasMax),
    cargasAtual: inteiroOpcional(form.cargasAtual),
    agilidade: inteiro(form.agilidade, 0),
    forca: inteiro(form.forca, 0),
    intelecto: inteiro(form.intelecto, 0),
    presenca: inteiro(form.presenca, 0),
    vigor: inteiro(form.vigor, 0),
    percepcao: inteiro(form.percepcao, 0),
    iniciativa: inteiro(form.iniciativa, 0),
    fortitude: inteiro(form.fortitude, 0),
    reflexos: inteiro(form.reflexos, 0),
    vontade: inteiro(form.vontade, 0),
    luta: inteiro(form.luta, 0),
    jujutsu: inteiro(form.jujutsu, 0),
  };
}

function rotuloTipo(tipo: TipoEntidadeVinculadaPersonagem): string {
  return TIPOS.find((item) => item.value === tipo)?.label ?? tipo;
}

function rotuloEstado(estado: EstadoEntidadeVinculadaPersonagem): string {
  return ESTADOS.find((item) => item.value === estado)?.label ?? estado;
}

function totalValores(registro: Record<string, number> | undefined): number {
  return Object.values(registro ?? {}).reduce((total, valor) => total + valor, 0);
}

export function CharacterLinkedEntitiesPanel({
  campanhaId,
  personagemCampanhaId,
  onAtualizado,
}: Props) {
  const [entidades, setEntidades] = useState<EntidadeVinculadaPersonagem[]>([]);
  const [capacidades, setCapacidades] =
    useState<CapacidadesEntidadesVinculadas | null>(null);
  const [templates, setTemplates] = useState<TemplateEntidadeVinculada[]>([]);
  const [maldicoes, setMaldicoes] = useState<NpcAmeacaResumo[]>([]);
  const [form, setForm] = useState<FormState>(() => criarFormInicial());
  const [formAberto, setFormAberto] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [erro, setErro] = useState<UserErrorState | null>(null);

  const carregar = useCallback(async () => {
    if (!personagemCampanhaId) return;
    setLoading(true);
    setErro(null);
    try {
      const [lista, novasCapacidades, novosTemplates, catalogoMaldicoes] =
        await Promise.all([
          apiListarEntidadesVinculadasPersonagem(
            campanhaId,
            personagemCampanhaId,
          ),
          apiListarCapacidadesEntidadesVinculadas(
            campanhaId,
            personagemCampanhaId,
          ),
          apiListarTemplatesEntidadesVinculadas(
            campanhaId,
            personagemCampanhaId,
          ),
          apiGetMeusNpcsAmeacas({ tipo: 'MALDICAO', limit: 100 }),
        ]);
      setEntidades(lista);
      setCapacidades(novasCapacidades);
      setTemplates(novosTemplates);
      setMaldicoes(catalogoMaldicoes.items);
    } catch (error) {
      setErro(criarErroUsuario(error));
    } finally {
      setLoading(false);
    }
  }, [campanhaId, personagemCampanhaId]);

  useEffect(() => {
    void carregar();
  }, [carregar]);

  const entidadesPorTipo = useMemo(
    () =>
      new Map(
        GRUPOS.map((grupo) => [
          grupo.tipo,
          entidades.filter((entidade) => entidade.tipo === grupo.tipo),
        ]),
      ),
    [entidades],
  );

  const capacidadesPorTipo = useMemo(
    () =>
      new Map(
        (capacidades?.tipos ?? []).map((capacidade) => [
          capacidade.tipo,
          capacidade,
        ]),
      ),
    [capacidades],
  );

  const capacidadeSelecionada = capacidadesPorTipo.get(form.tipo) ?? null;
  const fluxoCriacaoSelecionado = resolverFluxoCriacaoEntidadeVinculada(
    capacidadeSelecionada,
  );
  const configuracoesCriaveis =
    capacidadeSelecionada?.configuracoes.filter(
      (config) => config.permiteCriarNovos,
    ) ?? [];
  const configuracaoSelecionada =
    configuracoesCriaveis.find(
      (config) => String(config.tecnicaId) === form.tecnicaOrigemId,
    ) ?? configuracoesCriaveis[0] ?? null;
  const entidadeEmEdicao = form.id
    ? entidades.find((entidade) => entidade.id === form.id) ?? null
    : null;
  const fichaAutomatica =
    form.tipo !== 'MALDICAO_CONTROLADA' &&
    !form.overrideMestre &&
    (Boolean(configuracaoSelecionada) ||
      Boolean(entidadeEmEdicao?.calculoAutomatico));

  const atualizarCampo = <K extends keyof FormState>(
    campo: K,
    valor: FormState[K],
  ) => setForm((atual) => ({ ...atual, [campo]: valor }));

  const iniciarNovo = (tipo: TipoEntidadeVinculadaPersonagem = 'SHIKIGAMI') => {
    const capacidade = capacidadesPorTipo.get(tipo);
    const config = capacidade?.configuracoes.find(
      (item) => item.permiteCriarNovos,
    );
    setForm({
      ...criarFormInicial(),
      tipo,
      tecnicaOrigemId: config ? String(config.tecnicaId) : '',
    });
    setFormAberto(true);
  };

  const trocarTipo = (tipo: TipoEntidadeVinculadaPersonagem) => {
    const capacidade = capacidadesPorTipo.get(tipo);
    const config = capacidade?.configuracoes.find(
      (item) => item.permiteCriarNovos,
    );
    setForm((atual) => ({
      ...atual,
      tipo,
      tecnicaOrigemId: config ? String(config.tecnicaId) : '',
      npcAmeacaOrigemId:
        tipo === 'MALDICAO_CONTROLADA' ? atual.npcAmeacaOrigemId : '',
      vagasOcupadas:
        tipo === 'CORPO_AMALDICOADO' ? atual.vagasOcupadas : '1',
    }));
  };

  const salvar = async () => {
    if (!personagemCampanhaId || saving) return;
    const formResolvido = {
      ...form,
      tecnicaOrigemId:
        form.tecnicaOrigemId ||
        (configuracaoSelecionada
          ? String(configuracaoSelecionada.tecnicaId)
          : ''),
    };
    const payload = montarPayload(formResolvido);
    if (!payload.nome) {
      setErro({
        message: 'Informe o nome do vinculado.',
        code: 'ENTIDADE_NOME_OBRIGATORIO',
      });
      return;
    }
    if (!form.id && !payload.overrideMestre && !configuracaoSelecionada) {
      setErro({
        message:
          fluxoCriacaoSelecionado.permiteTemplates &&
          !fluxoCriacaoSelecionado.permiteCriacaoManual
            ? 'Esta tecnica usa vinculados predefinidos. Associe um template disponivel.'
            : 'O personagem nao possui tecnica compativel para esta criacao.',
        code: 'ENTIDADE_TECNICA_COMPATIVEL_OBRIGATORIA',
      });
      return;
    }
    const erroPv = validarPontosVidaEntidadeVinculada(
      payload.pontosVidaMax ?? 1,
      payload.pontosVidaAtual ?? payload.pontosVidaMax ?? 1,
    );
    if (erroPv) {
      setErro({
        message: erroPv,
        code: 'ENTIDADE_PV_INVALIDO',
      });
      return;
    }
    setSaving(true);
    setErro(null);
    try {
      if (form.id) {
        await apiAtualizarEntidadeVinculadaPersonagem(
          campanhaId,
          personagemCampanhaId,
          form.id,
          payload,
        );
      } else {
        await apiCriarEntidadeVinculadaPersonagem(
          campanhaId,
          personagemCampanhaId,
          payload,
        );
      }
      setForm(criarFormInicial());
      setFormAberto(false);
      await carregar();
      onAtualizado?.();
    } catch (error) {
      setErro(criarErroUsuario(error));
    } finally {
      setSaving(false);
    }
  };

  const executarAcao = async (
    acao: () => Promise<EntidadeVinculadaPersonagem>,
  ) => {
    if (!personagemCampanhaId || saving) return;
    setSaving(true);
    setErro(null);
    try {
      await acao();
      await carregar();
      onAtualizado?.();
    } catch (error) {
      setErro(criarErroUsuario(error));
    } finally {
      setSaving(false);
    }
  };

  if (!personagemCampanhaId) return null;

  return (
    <section className="rounded-lg border border-app-border bg-app-surface p-4 space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-app-fg">Vinculados</h3>
          <p className="text-xs text-app-muted">
            Shikigamis, corpos e maldicoes controladas deste personagem.
          </p>
        </div>
        <Button
          type="button"
          size="xs"
          variant="ghost"
          onClick={() => iniciarNovo()}
        >
          Novo
        </Button>
      </div>

      {erro ? <ErrorAlert message={erro} /> : null}

      {capacidades ? (
        <div className="grid gap-2 md:grid-cols-3">
          {GRUPOS.map((grupo) => {
            const capacidade = capacidadesPorTipo.get(grupo.tipo);
            if (!capacidade) return null;
            return (
              <div
                key={`capacidade-${grupo.tipo}`}
                className="rounded border border-app-border bg-app-bg/30 p-3"
              >
                <p className="text-xs font-semibold text-app-fg">
                  {grupo.titulo}
                </p>
                {capacidade.habilitado ? (
                  <div className="mt-1 space-y-1 text-xs text-app-muted">
                    <p>
                      Cadastrados:{' '}
                      {formatarUsoCapacidadeEntidadeVinculada(
                        capacidade,
                        'cadastro',
                      )}
                    </p>
                    <p>
                      Ativos:{' '}
                      {formatarUsoCapacidadeEntidadeVinculada(
                        capacidade,
                        'ativo',
                      )}
                    </p>
                    <p>
                      {capacidade.configuracoes
                        .map((config) => config.tecnicaNome)
                        .join(', ')}
                    </p>
                  </div>
                ) : (
                  <p className="mt-1 text-xs text-app-muted">
                    Bloqueado: tecnica compativel nao encontrada.
                  </p>
                )}
              </div>
            );
          })}
        </div>
      ) : null}

      {templates.length > 0 ? (
        <div className="rounded border border-app-border p-3">
          <h4 className="text-xs font-semibold uppercase tracking-wide text-app-muted">
            Vinculados predefinidos
          </h4>
          <ul className="mt-2 grid gap-2 md:grid-cols-2">
            {templates.map((template) => (
              <li
                key={template.id}
                className="flex items-center justify-between gap-3 rounded border border-app-border/70 px-3 py-2"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-app-fg">
                    {template.nome}
                  </p>
                  <p className="text-xs text-app-muted">
                    {template.tecnica.nome}
                    {template.conceito ? ` - ${template.conceito}` : ''}
                  </p>
                </div>
                <Button
                  type="button"
                  size="xs"
                  variant="ghost"
                  disabled={saving || template.associado}
                  onClick={() =>
                    executarAcao(() =>
                      apiAssociarTemplateEntidadeVinculada(
                        campanhaId,
                        personagemCampanhaId,
                        template.id,
                      ),
                    )
                  }
                >
                  {template.associado ? 'Associado' : 'Associar'}
                </Button>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <div className="grid gap-3 md:grid-cols-3">
        {GRUPOS.map((grupo) => {
          const lista = entidadesPorTipo.get(grupo.tipo) ?? [];
          return (
            <div key={grupo.tipo} className="rounded border border-app-border p-3">
              <h4 className="text-xs font-semibold uppercase tracking-wide text-app-muted">
                {grupo.titulo}
              </h4>
              {loading ? (
                <p className="mt-2 text-xs text-app-muted">Carregando...</p>
              ) : lista.length === 0 ? (
                <p className="mt-2 text-xs text-app-muted">
                  Nenhum vinculado cadastrado.
                </p>
              ) : (
                <ul className="mt-2 space-y-2">
                  {lista.map((entidade) => (
                    <li
                      key={entidade.id}
                      className="rounded border border-app-border/70 px-2 py-2"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="text-sm font-semibold text-app-fg">
                            {entidade.nome}
                          </p>
                          <p className="text-xs text-app-muted">
                            {rotuloEstado(entidade.estado)} - PV{' '}
                            {entidade.pontosVidaAtual}/{entidade.pontosVidaMax}
                            {' - '}Def {entidade.defesa}
                          </p>
                          {entidade.conceito ? (
                            <p className="mt-1 text-xs text-app-muted">
                              {entidade.conceito}
                            </p>
                          ) : null}
                          {entidade.tecnicaOrigem ? (
                            <p className="mt-1 text-xs text-app-muted">
                              Origem: {entidade.tecnicaOrigem.nome}
                              {entidade.template
                                ? ` - ${entidade.template.nome}`
                                : ''}
                            </p>
                          ) : null}
                          {entidade.precisaRecalculo ? (
                            <p className="mt-1 text-xs font-semibold text-app-warning">
                              Recalculo pendente
                            </p>
                          ) : null}
                          {entidade.calculoAutomatico ? (
                            <p className="mt-1 text-xs text-app-muted">
                              Pendencias{' '}
                              {totalValores(
                                entidade.calculoAutomatico.pendencias,
                              )}{' '}
                              - Excedentes{' '}
                              {totalValores(
                                entidade.calculoAutomatico.excedentes,
                              )}
                            </p>
                          ) : null}
                          {entidade.overrideMestre ? (
                            <p className="mt-1 text-xs text-app-warning">
                              Limites sobrescritos pelo mestre
                            </p>
                          ) : null}
                        </div>
                        <Button
                          type="button"
                          size="xs"
                          variant="ghost"
                          onClick={() => { setForm(preencherForm(entidade)); setFormAberto(true); }}
                        >
                          Editar
                        </Button>
                      </div>
                      <div className="mt-2 flex flex-wrap gap-1">
                        <Button
                          type="button"
                          size="xs"
                          variant="ghost"
                          disabled={saving}
                          onClick={() =>
                            executarAcao(() =>
                              apiDuplicarEntidadeVinculadaPersonagem(
                                campanhaId,
                                personagemCampanhaId,
                                entidade.id,
                              ),
                            )
                          }
                        >
                          Duplicar
                        </Button>
                        <Button
                          type="button"
                          size="xs"
                          variant="ghost"
                          disabled={saving}
                          onClick={() =>
                            executarAcao(() =>
                              apiRecalcularEntidadeVinculadaPersonagem(
                                campanhaId,
                                personagemCampanhaId,
                                entidade.id,
                              ),
                            )
                          }
                        >
                          Recalcular
                        </Button>
                        <Button
                          type="button"
                          size="xs"
                          variant="ghost"
                          disabled={saving}
                          onClick={() =>
                            executarAcao(() =>
                              apiAtualizarEstadoEntidadeVinculadaPersonagem(
                                campanhaId,
                                personagemCampanhaId,
                                entidade.id,
                                entidade.estado === 'DISPONIVEL'
                                  ? 'SELADO'
                                  : 'DISPONIVEL',
                              ),
                            )
                          }
                        >
                          {entidade.estado === 'DISPONIVEL'
                            ? 'Selar'
                            : 'Disponivel'}
                        </Button>
                        <Button
                          type="button"
                          size="xs"
                          variant="ghost"
                          disabled={saving}
                          onClick={() =>
                            executarAcao(() =>
                              apiRemoverEntidadeVinculadaPersonagem(
                                campanhaId,
                                personagemCampanhaId,
                                entidade.id,
                              ),
                            )
                          }
                        >
                          Arquivar
                        </Button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          );
        })}
      </div>

      <Modal isOpen={formAberto} onClose={() => { setFormAberto(false); setForm(criarFormInicial()); }} title={form.id ? 'Editar vinculado' : 'Cadastrar vinculado'} size="full">
        <h4 className="text-sm font-semibold text-app-fg">
          {form.id ? 'Editar vinculado' : 'Cadastrar vinculado'}
        </h4>
        <div className="grid gap-3 md:grid-cols-3">
          <Select
            label="Tipo"
            value={form.tipo}
            options={TIPOS}
            onChange={(event) =>
              trocarTipo(
                event.target.value as TipoEntidadeVinculadaPersonagem,
              )
            }
          />
          <Input
            label="Nome"
            value={form.nome}
            onChange={(event) => atualizarCampo('nome', event.target.value)}
          />
          {form.tipo === 'MALDICAO_CONTROLADA' ? (
            <Select
              label="Maldicao de origem"
              value={form.npcAmeacaOrigemId}
              onChange={(event) =>
                atualizarCampo('npcAmeacaOrigemId', event.target.value)
              }
            >
              <option value="">Selecione uma maldicao</option>
              {maldicoes.map((maldicao) => (
                <option key={maldicao.id} value={maldicao.id}>
                  {maldicao.nome}
                </option>
              ))}
            </Select>
          ) : (
            <Select
              label="Tecnica de origem"
              value={
                form.tecnicaOrigemId ||
                (configuracaoSelecionada
                  ? String(configuracaoSelecionada.tecnicaId)
                  : '')
              }
              onChange={(event) =>
                atualizarCampo('tecnicaOrigemId', event.target.value)
              }
            >
              <option value="">Sem tecnica compativel</option>
              {configuracoesCriaveis.map((config) => (
                <option key={config.id} value={config.tecnicaId}>
                  {config.tecnicaNome}
                </option>
              ))}
            </Select>
          )}
        </div>
        {!form.id &&
        fluxoCriacaoSelecionado.permiteTemplates &&
        !fluxoCriacaoSelecionado.permiteCriacaoManual ? (
          <p className="rounded border border-app-warning/40 bg-app-warning/10 px-3 py-2 text-xs text-app-warning">
            Esta tecnica usa vinculados predefinidos. Escolha uma opcao na
            lista acima para associar.
          </p>
        ) : null}
        {configuracaoSelecionada?.previewCalculo ? (
          <div className="grid gap-2 rounded border border-app-border bg-app-bg/30 p-3 text-xs text-app-muted sm:grid-cols-3">
            <p>
              Atributos:{' '}
              {configuracaoSelecionada.previewCalculo.pools.atributosMax}{' '}
              pontos, teto{' '}
              {configuracaoSelecionada.previewCalculo.pools.tetoAtributo}
            </p>
            {form.tipo === 'SHIKIGAMI' ? (
              <p>
                Ataques:{' '}
                {configuracaoSelecionada.previewCalculo.pools.ataquesMax}{' '}
                pontos, teto{' '}
                {configuracaoSelecionada.previewCalculo.pools.tetoAtaque}
              </p>
            ) : null}
            <p>
              Resistencias:{' '}
              {configuracaoSelecionada.previewCalculo.pools.resistenciasMax}{' '}
              pontos, teto{' '}
              {configuracaoSelecionada.previewCalculo.pools.tetoResistencia}
            </p>
          </div>
        ) : null}
        <div className="grid gap-3 md:grid-cols-2">
          <Textarea
            label="Descricao"
            value={form.descricao}
            onChange={(event) => atualizarCampo('descricao', event.target.value)}
          />
          <Textarea
            label="Conceito"
            value={form.conceito}
            onChange={(event) => atualizarCampo('conceito', event.target.value)}
          />
          <Textarea
            label="Aparencia"
            value={form.aparencia}
            onChange={(event) => atualizarCampo('aparencia', event.target.value)}
          />
        </div>
        <div className="grid gap-3 md:grid-cols-4">
          {form.tipo !== 'MALDICAO_CONTROLADA' ? (
            <Select
              label="Papel"
              value={form.papel}
              options={PAPEL_OPTIONS}
              onChange={(event) =>
                atualizarCampo(
                  'papel',
                  event.target.value as PapelCalculoEntidadeVinculada,
                )
              }
            />
          ) : null}
          <Select
            label="Ficha"
            value={form.fichaTipo}
            options={FICHA_OPTIONS}
            onChange={(event) =>
              atualizarCampo('fichaTipo', event.target.value as TipoFichaNpcAmeaca)
            }
          />
          <Select
            label="Tipo NPC"
            value={form.tipoNpc}
            options={TIPO_NPC_OPTIONS}
            onChange={(event) =>
              atualizarCampo('tipoNpc', event.target.value as TipoNpcAmeaca)
            }
          />
          <Select
            label="Tamanho"
            value={form.tamanho}
            options={TAMANHO_OPTIONS}
            onChange={(event) => atualizarCampo('tamanho', event.target.value)}
          />
          <Input
            label="Vagas"
            value={form.vagasOcupadas}
            onChange={(event) => atualizarCampo('vagasOcupadas', event.target.value)}
          />
        </div>
        <div className="grid gap-3 md:grid-cols-6">
          {CAMPOS_NUMERICOS.map(({ label, key }) => (
            <Input
              key={key}
              label={label}
              value={form[key] as string}
              disabled={fichaAutomatica && CAMPOS_DERIVADOS.has(key)}
              onChange={(event) => atualizarCampo(key, event.target.value)}
            />
          ))}
        </div>
        {capacidades?.permissoes.podeIgnorarLimites ? (
          <label className="flex items-center gap-2 text-xs text-app-muted">
            <input
              type="checkbox"
              checked={form.overrideMestre}
              onChange={(event) =>
                atualizarCampo('overrideMestre', event.target.checked)
              }
            />
            Ignorar tecnica, limites e calculo automatico como mestre
          </label>
        ) : null}
        <div className="flex flex-wrap justify-end gap-2">
          {form.id ? (
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={() => { setForm(criarFormInicial()); setFormAberto(false); }}
            >
              Cancelar edicao
            </Button>
          ) : null}
          <Button
            type="button"
            size="sm"
            disabled={
              saving ||
              (!form.id && !form.overrideMestre && !configuracaoSelecionada)
            }
            onClick={salvar}
          >
            {saving
              ? 'Salvando...'
              : form.id
                ? 'Salvar vinculado'
                : `Criar ${rotuloTipo(form.tipo)}`}
          </Button>
        </div>
      </Modal>
    </section>
  );
}
