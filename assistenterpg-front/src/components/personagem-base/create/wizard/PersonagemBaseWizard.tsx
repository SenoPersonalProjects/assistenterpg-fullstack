'use client';

import { useEffect, useMemo, useRef, useState } from 'react';

import { useAuth } from '@/context/AuthContext';

import {
  apiPreviewPersonagemBase,
  type CreatePersonagemBasePayload,
  type UpdatePersonagemBasePayload,
  type PersonagemBasePreview,
  type ClasseCatalogo,
  type ClaCatalogo,
  type OrigemCatalogo,
  type ProficienciaCatalogo,
  type TipoGrauCatalogo,
  type TrilhaCatalogo,
  type CaminhoCatalogo,
  type TecnicaInataCatalogo,
  type AlinhamentoCatalogo,
  type PericiaCatalogo,
  type GrauTreinamento,
  type PassivasAtributoConfigFront,
  type AtributoBaseCodigo,
  type PoderGenericoInstanciaPayload,
  type EquipamentoCatalogo,
  type ModificacaoCatalogo,
  type ItemInventarioPayload,
} from '@/lib/api';

import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { SectionTitle } from '@/components/ui/SectionTitle';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { LoadingOverlay } from '@/components/ui/LoadingOverlay';
import { Icon } from '@/components/ui/Icon';

import { usePersonagemBaseFormState } from '../usePersonagemBaseFormState';

// steps
import { PersonagemBaseStepDadosBasicos } from './PersonagemBaseStepDadosBasicos';
import { PersonagemBaseStepClasseOrigem } from './PersonagemBaseStepClasseOrigem';
import { PersonagemBaseStepClaTecnica } from './PersonagemBaseStepClaTecnica';
import { PersonagemBaseStepTrilhaCaminho } from './PersonagemBaseStepTrilhaCaminho';
import { PersonagemBaseStepAtributosEnergia } from './PersonagemBaseStepAtributosEnergia';
import { PersonagemBaseStepPericias } from './PersonagemBaseStepPericias';
import { PersonagemBaseStepPoderes } from './PersonagemBaseStepPoderes';
import { PersonagemBaseStepGrausAprimoramento } from './PersonagemBaseStepGrausAprimoramento';
import { PersonagemBaseStepGrausTreinamento } from './PersonagemBaseStepGrausTreinamento';
import { PersonagemBaseStepInventario } from './PersonagemBaseStepInventario';
import { PersonagemBaseStepRevisao } from './PersonagemBaseStepRevisao';

import type { InitialValues as FormInitialValues } from '@/components/personagem-base/create/PersonagemBaseForm';

type BaseProps = {
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
  carregarTrilhasDaClasse: (classeId: number) => Promise<TrilhaCatalogo[]>;
  carregarCaminhosDaTrilha: (trilhaId: number) => Promise<CaminhoCatalogo[]>;
};

type CreateProps = BaseProps & {
  mode?: 'create';
  onSubmitCreate: (data: CreatePersonagemBasePayload) => Promise<void>;
};

type EditProps = BaseProps & {
  mode: 'edit';
  initialValues: FormInitialValues;
  onSubmitEdit: (data: UpdatePersonagemBasePayload) => Promise<void>;
  onCancel?: () => void;
};

type Props = CreateProps | EditProps;

const STEP_LABELS = [
  'Dados básicos',
  'Classe e origem',
  'Clã e técnica',
  'Trilha e caminho',
  'Atributos e EA',
  'Perícias',
  'Graus aprimoramento',
  'Graus treinamento',
  'Inventário',
  'Poderes genéricos',
  'Revisão final',
];

const MAX_STEP = 11;

function calcularTotalAtributosEsperado(nivel: number): number {
  const base = 9;
  const marcos = [4, 7, 10, 13, 16, 19];
  const bonus = marcos.filter((m) => nivel >= m).length;
  return base + bonus;
}

function tetoPorNivel(nivel: number): number {
  return nivel <= 3 ? 3 : 7;
}

type PoderGenericoConfig = Record<string, unknown> & {
  periciasCodigos?: string[];
  proficiencias?: string[];
  tipoGrauCodigo?: string;
};

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === 'object' ? (value as Record<string, unknown>) : null;
}

function toStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter((item): item is string => typeof item === 'string')
    .map((item) => item.trim())
    .filter((item) => item !== '');
}

function sanitizarPassivasConfig(
  config: PassivasAtributoConfigFront | undefined,
  ativos: AtributoBaseCodigo[],
): PassivasAtributoConfigFront | undefined {
  if (!config) return undefined;
  if (!ativos.includes('INT')) return config;

  const sanitizado: PassivasAtributoConfigFront = { ...config };

  if (sanitizado.INT_I && !sanitizado.INT_I.periciaCodigoTreino) {
    delete sanitizado.INT_I;
  }

  if (sanitizado.INT_II && !sanitizado.INT_II.periciaCodigoTreino) {
    delete sanitizado.INT_II;
  }

  const temConfig = Object.keys(sanitizado).some(
    (k) => k !== 'passivaIdToIndex' && sanitizado[k as keyof PassivasAtributoConfigFront]
  );

  return temConfig || sanitizado.passivaIdToIndex ? sanitizado : undefined;
}

function sanitizarGrausTreinamento(
  grausTreinamento: GrauTreinamento[],
): GrauTreinamento[] | undefined {
  if (!grausTreinamento || grausTreinamento.length === 0) return undefined;

  const sanitizados = grausTreinamento
    .map((gt) => ({
      ...gt,
      melhorias: gt.melhorias.filter((m) => m.periciaCodigo && m.periciaCodigo.trim() !== ''),
    }))
    .filter((gt) => gt.melhorias.length > 0);

  return sanitizados.length > 0 ? sanitizados : undefined;
}

function sanitizarPoderesGenericos(
  poderes: PoderGenericoInstanciaPayload[],
): PoderGenericoInstanciaPayload[] | undefined {
  if (!poderes || poderes.length === 0) return undefined;

  const validos = poderes
    .map((inst) => {
      const cfgBase = asRecord(inst.config) ?? {};

      if (Object.keys(cfgBase).length === 0) {
        return { ...inst, config: {} };
      }

      const cfgValidado: PoderGenericoConfig = { ...cfgBase };

      if ('periciasCodigos' in cfgValidado) {
        const pericias = toStringArray(cfgValidado.periciasCodigos);

        if (pericias.length === 0) return null;

        cfgValidado.periciasCodigos = pericias;
      }

      if ('proficiencias' in cfgValidado) {
        const profs = toStringArray(cfgValidado.proficiencias);

        if (profs.length === 0) return null;

        cfgValidado.proficiencias = profs;
      }

      if ('tipoGrauCodigo' in cfgValidado) {
        const tg = cfgValidado.tipoGrauCodigo;
        if (!tg || String(tg).trim() === '') return null;
      }

      return { ...inst, config: cfgValidado };
    })
    .filter((inst) => inst !== null) as PoderGenericoInstanciaPayload[];

  return validos.length > 0 ? validos : undefined;
}

// Sanitiza itens de inventário para envio ao backend.
function sanitizarItensInventario(
  itens: ItemInventarioPayload[],
): ItemInventarioPayload[] | undefined {
  if (!itens || itens.length === 0) return undefined;

  const itensSanitizados = itens.map((item) => ({
    equipamentoId: item.equipamentoId,
    quantidade: item.quantidade,
    equipado: item.equipado,
    modificacoesIds: item.modificacoesIds || [],
    nomeCustomizado: item.nomeCustomizado || null,
    notas: item.notas || null,
  }));

  return itensSanitizados.length > 0 ? itensSanitizados : undefined;
}

export function PersonagemBaseWizard(props: Props) {
  const mode = props.mode === 'edit' ? 'edit' : 'create';

  const {
    classes,
    clas,
    origens,
    proficiencias,
    tiposGrau,
    tecnicasInatas,
    alinhamentos,
    pericias,
    equipamentos,
    modificacoes,
    carregarTrilhasDaClasse,
    carregarCaminhosDaTrilha,
  } = props;

  const { token } = useAuth();

  const editInitialValues = mode === 'edit' ? (props as EditProps).initialValues : undefined;

  const [step, setStep] = useState(1);
  const [grausTreinamento, setGrausTreinamento] = useState<GrauTreinamento[]>([]);
  const [periciasLivresExtras, setPericiasLivresExtras] = useState<number>(0);
  const [passivasAtributosConfig, setPassivasAtributosConfig] =
    useState<PassivasAtributoConfigFront>({});
  const [itensInventario, setItensInventario] = useState<ItemInventarioPayload[]>([]);
  const [previewGlobal, setPreviewGlobal] = useState<PersonagemBasePreview | null>(null);
  const [loadingPreviewGlobal, setLoadingPreviewGlobal] = useState(false);
  const [loadingStep, setLoadingStep] = useState(false);

  const requestIdRef = useRef(0);
  const previewDebounceRef = useRef<number | null>(null);

  const hydratedWizardRef = useRef(false);
  useEffect(() => {
    if (mode !== 'edit') return;
    if (!editInitialValues) return;
    if (hydratedWizardRef.current) return;

    setGrausTreinamento(editInitialValues.grausTreinamento ?? []);
    setPassivasAtributosConfig(editInitialValues.passivasAtributosConfig ?? {});
    setItensInventario(editInitialValues.itensInventario ?? []);
    hydratedWizardRef.current = true;
  }, [mode, editInitialValues]);

  const hookInitialValues = useMemo(() => {
    if (mode !== 'edit' || !editInitialValues) return undefined;

    const iv = editInitialValues;

    return {
      nome: iv.nome,
      nivel: iv.nivel,
      claId: iv.claId,
      origemId: iv.origemId,
      classeId: iv.classeId,
      trilhaId: iv.trilhaId,
      caminhoId: iv.caminhoId,

      agilidade: iv.agilidade,
      forca: iv.forca,
      intelecto: iv.intelecto,
      presenca: iv.presenca,
      vigor: iv.vigor,

      estudouEscolaTecnica: iv.estudouEscolaTecnica,
      tecnicaInataId: iv.tecnicaInataId,

      proficienciasCodigos: iv.proficienciasCodigos ?? [],
      grausAprimoramento: iv.grausAprimoramento ?? [],

      idade: iv.idade ?? null,
      prestigioBase: iv.prestigioBase ?? 0,
      prestigioClaBase: iv.prestigioClaBase ?? null,
      alinhamentoId: iv.alinhamentoId ?? null,
      background: iv.background ?? null,
      atributoChaveEa: iv.atributoChaveEa,

      periciasClasseEscolhidasCodigos: iv.periciasClasseEscolhidasCodigos ?? [],
      periciasOrigemEscolhidasCodigos: iv.periciasOrigemEscolhidasCodigos ?? [],
      periciasLivresCodigos: iv.periciasLivresCodigos ?? [],

      poderesGenericos: iv.poderesGenericos ?? [],
      poderesGenericosSelecionadosIds: iv.poderesGenericosSelecionadosIds ?? [],
      passivasAtributosAtivos: iv.passivasAtributosAtivos ?? [],
    };
  }, [mode, editInitialValues]);

  const {
    erro,
    setErro,
    submitting,
    setSubmitting,

    nome,
    setNome,
    nivel,
    setNivel,
    estudouEscolaTecnica,
    setEstudouEscolaTecnica,
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
    atributoChaveEa,
    setAtributoChaveEa,

    tecnicaInataId,
    setTecnicaInataId,
    graus,
    handleGrauChange,

    periciasClasseEscolhidasCodigos,
    setPericiasClasseEscolhidasCodigos,
    periciasOrigemEscolhidasCodigos,
    setPericiasOrigemEscolhidasCodigos,
    periciasLivresCodigos,
    setPericiasLivresCodigos,

    poderesGenericos,
    togglePoderGenerico,
    addPoderGenericoInstancia,
    removePoderGenericoInstancia,
    updatePoderGenericoInstancia,

    passivasAtributosAtivos,
    togglePassivaAtributo,

    trilhas,
    caminhos,

    buildCreatePayload,
    buildUpdatePayload,
    resetCreateState,
  } = usePersonagemBaseFormState({
    mode,
    initialValues: hookInitialValues,
    carregarTrilhasDaClasse,
    carregarCaminhosDaTrilha,
  });

  const trilhaSelecionada = trilhas.find((t) => String(t.id) === String(trilhaId));

  const previewPayload = useMemo(() => {
    if (!nome.trim() || !classeId || !origemId || !claId) return null;

    const soma = agilidade + forca + intelecto + presenca + vigor;
    const esperado = calcularTotalAtributosEsperado(nivel);
    const teto = tetoPorNivel(nivel);

    const temAcimaDoTeto =
      agilidade > teto || forca > teto || intelecto > teto || presenca > teto || vigor > teto;

    if (temAcimaDoTeto) return null;
    if (soma !== esperado) return null;

    try {
      const base = mode === 'edit' ? buildUpdatePayload() : buildCreatePayload();
      const basePayload = base as Partial<CreatePersonagemBasePayload>;

      const configSanitizado = sanitizarPassivasConfig(
        passivasAtributosConfig,
        passivasAtributosAtivos,
      );

      const grausTreinamentoSanitizados = sanitizarGrausTreinamento(grausTreinamento);

      const poderesGenericosSanitizados = sanitizarPoderesGenericos(poderesGenericos);

      // Sanitizar itens de inventário
      const itensInventarioSanitizados = sanitizarItensInventario(itensInventario);

      return {
        ...basePayload,
        grausTreinamento: grausTreinamentoSanitizados,
        passivasAtributosConfig: configSanitizado,
        passivasAtributosAtivos:
          passivasAtributosAtivos && passivasAtributosAtivos.length > 0
            ? passivasAtributosAtivos
            : undefined,
        poderesGenericos: poderesGenericosSanitizados,
        periciasLivresExtras,
        itensInventario: itensInventarioSanitizados,
      } as CreatePersonagemBasePayload;
    } catch {
      return null;
    }
  }, [
    mode,
    nome,
    classeId,
    origemId,
    claId,
    nivel,
    agilidade,
    forca,
    intelecto,
    presenca,
    vigor,
    buildCreatePayload,
    buildUpdatePayload,
    grausTreinamento,
    passivasAtributosConfig,
    passivasAtributosAtivos,
    poderesGenericos,
    periciasLivresExtras,
    itensInventario,
  ]);

  useEffect(() => {
    if (!token || !previewPayload) {
      setPreviewGlobal(null);
      return;
    }

    if (previewDebounceRef.current) {
      window.clearTimeout(previewDebounceRef.current);
    }

    const requestId = ++requestIdRef.current;
    setLoadingPreviewGlobal(true);

    previewDebounceRef.current = window.setTimeout(() => {
      apiPreviewPersonagemBase(previewPayload)
        .then((res) => {
          if (requestId !== requestIdRef.current) return;
          setPreviewGlobal(res);
        })
        .catch(() => {
          if (requestId !== requestIdRef.current) return;
          setPreviewGlobal(null);
        })
        .finally(() => {
          if (requestId !== requestIdRef.current) return;
          setLoadingPreviewGlobal(false);
        });
    }, 250);

    return () => {
      if (previewDebounceRef.current) window.clearTimeout(previewDebounceRef.current);
    };
  }, [token, previewPayload]);

  const hydratedExtrasRef = useRef(false);
  useEffect(() => {
    if (mode !== 'edit') return;
    if (hydratedExtrasRef.current) return;

    const deIntelecto = previewGlobal?.periciasLivresInfo?.deIntelecto;
    if (typeof deIntelecto === 'number') {
      setPericiasLivresExtras(deIntelecto);
      hydratedExtrasRef.current = true;
    }
  }, [mode, previewGlobal]);

  const profsFinaisCodigos = useMemo(() => {
    if (!previewGlobal?.proficiencias) return [];
    return previewGlobal.proficiencias.map((p) => p.codigo);
  }, [previewGlobal]);

  async function handleFinalSubmit() {
    if (!nome.trim()) {
      setErro('Nome é obrigatório');
      setStep(1);
      return;
    }

    if (!claId || !origemId || !classeId) {
      setErro('Classe, Clã e Origem são obrigatórios');
      setStep(2);
      return;
    }

    if (!previewPayload) {
      setErro(
        mode === 'edit'
          ? 'Preencha os campos obrigatórios antes de salvar.'
          : 'Preencha os campos obrigatórios antes de criar.',
      );
      return;
    }

    setErro(null);
    setSubmitting(true);

    try {
      if (mode === 'edit') {
        await (props as EditProps).onSubmitEdit(
          previewPayload as unknown as UpdatePersonagemBasePayload,
        );
        (props as EditProps).onCancel?.();
      } else {
        await (props as CreateProps).onSubmitCreate(previewPayload);

        resetCreateState();
        setGrausTreinamento([]);
        setPassivasAtributosConfig({});
        setPericiasLivresExtras(0);
        setItensInventario([]);
        setPreviewGlobal(null);
        setStep(1);
      }
    } catch (e) {
      setErro(
        e instanceof Error
          ? e.message
          : mode === 'edit'
            ? 'Erro ao salvar personagem-base'
            : 'Erro ao criar personagem-base',
      );
    } finally {
      setSubmitting(false);
    }
  }

  async function handleNext() {
    setLoadingStep(true);
    await new Promise((resolve) => setTimeout(resolve, 100));
    setStep((s) => Math.min(MAX_STEP, s + 1));
    setLoadingStep(false);
  }

  function handlePrev() {
    if (step === 1) {
      if (mode === 'edit') (props as EditProps).onCancel?.();
      return;
    }
    setStep((s) => Math.max(1, s - 1));
  }

  const canNext = useMemo(() => {
    switch (step) {
      case 1:
        return nome?.trim();
      case 2:
        return classeId && origemId;
      case 3:
        return claId;
      case 4:
        return true;
      case 5:
        return previewPayload !== null;
      default:
        return true;
    }
  }, [step, nome, classeId, origemId, claId, previewPayload]);

  const visibleSteps = useMemo(() => {
    return STEP_LABELS.map((label, index) => ({
      index: index + 1,
      label,
    })).filter((s) => s.index === step || s.index === step - 1 || s.index === step + 1);
  }, [step]);

  return (
    <Card>
      <div className="space-y-6 overflow-hidden">
        <div className="space-y-3 mb-6">
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-app-fg">
                Etapa {step} de {MAX_STEP}
              </span>
              <span className="text-sm font-semibold text-app-primary">
                {Math.round((step / MAX_STEP) * 100)}%
              </span>
            </div>
            <ProgressBar current={step} total={MAX_STEP} showPercentage={false} className="h-2.5" />
          </div>

          <div className="flex items-center justify-center gap-2 px-2 pb-1 overflow-x-auto no-scrollbar">
            {step > 2 && <span className="opacity-50 px-1">…</span>}

            {visibleSteps.map(({ index, label }) => {
              const isActive = step === index;
              return (
                <div
                  key={index}
                  className={`flex items-center gap-1 px-3 py-2 rounded-lg transition-all whitespace-nowrap min-w-fit ${isActive
                      ? 'bg-app-primary/10 text-app-primary border border-app-primary/30 shadow-sm'
                      : 'text-app-muted hover:text-app-fg hover:bg-app-border/50'
                    }`}
                >
                  <span
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold ${isActive ? 'bg-app-primary text-white' : 'bg-app-border/50 text-app-muted'
                      }`}
                  >
                    {index}
                  </span>
                  <span className={`text-sm font-medium ${isActive ? '' : 'font-normal'}`}>
                    {label}
                  </span>
                </div>
              );
            })}

            {step < MAX_STEP - 1 && <span className="opacity-50 px-1">…</span>}
          </div>
        </div>

        <LoadingOverlay
          loading={loadingPreviewGlobal}
          message="Atualizando preview do personagem..."
          className="mb-4"
        />

        <div
          key={step}
          className={`transition-all duration-300 ease-in-out transform ${loadingStep ? 'opacity-75' : 'opacity-100'
            }`}
          style={{
            transform: `translateX(${0}%)`,
          }}
        >
          {step === 1 && (
            <>
              <SectionTitle className="mt-0">Dados básicos</SectionTitle>
              <PersonagemBaseStepDadosBasicos
                nome={nome}
                nivel={nivel}
                estudouEscolaTecnica={estudouEscolaTecnica}
                idade={idade}
                prestigioBase={prestigioBase}
                alinhamentoId={alinhamentoId}
                alinhamentos={alinhamentos}
                background={background}
                erroNome={erro === 'Nome é obrigatório' ? erro : undefined}
                onChangeNome={setNome}
                onChangeNivel={setNivel}
                onChangeEstudouEscolaTecnica={setEstudouEscolaTecnica}
                onChangeIdade={setIdade}
                onChangePrestigioBase={setPrestigioBase}
                onChangeAlinhamentoId={setAlinhamentoId}
                onChangeBackground={setBackground}
              />
            </>
          )}

          {step === 2 && (
            <>
              <SectionTitle>Classe e origem</SectionTitle>
              <PersonagemBaseStepClasseOrigem
                classes={classes}
                origens={origens}
                classeId={classeId}
                origemId={origemId}
                periciasClasseEscolhidasCodigos={periciasClasseEscolhidasCodigos}
                periciasOrigemEscolhidasCodigos={periciasOrigemEscolhidasCodigos}
                onChangeClasseId={setClasseId}
                onChangeOrigemId={setOrigemId}
                onChangePericiasClasse={setPericiasClasseEscolhidasCodigos}
                onChangePericiasOrigem={setPericiasOrigemEscolhidasCodigos}
              />
            </>
          )}

          {step === 3 && (
            <>
              <SectionTitle>Clã e técnica inata</SectionTitle>
              <PersonagemBaseStepClaTecnica
                clas={clas}
                tecnicasInatas={tecnicasInatas}
                claId={claId}
                tecnicaInataId={tecnicaInataId}
                prestigioClaBase={String(prestigioClaBase ?? '')}
                origemRequerTecnicaHeriditaria={
                  !!origens.find((o) => o.id === Number(origemId))?.requerTecnicaHeriditaria
                }
                origemBloqueiaTecnicaHeriditaria={
                  !!origens.find((o) => o.id === Number(origemId))?.bloqueiaTecnicaHeriditaria
                }
                onChangeClaId={setClaId}
                onChangeTecnicaInataId={setTecnicaInataId}
                onChangePrestigioClaBase={(v) => setPrestigioClaBase(v === '' ? null : Number(v))}
              />
            </>
          )}

          {step === 4 && (
            <>
              <SectionTitle>Trilha e caminho</SectionTitle>
              <PersonagemBaseStepTrilhaCaminho
                trilhas={trilhas}
                caminhos={caminhos}
                trilhaId={trilhaId}
                caminhoId={caminhoId}
                onChangeTrilhaId={setTrilhaId}
                onChangeCaminhoId={setCaminhoId}
              />
            </>
          )}

          {step === 5 && (
            <>
              <SectionTitle>Atributos e energia</SectionTitle>
              <PersonagemBaseStepAtributosEnergia
                nivel={nivel}
                agilidade={agilidade}
                forca={forca}
                intelecto={intelecto}
                presenca={presenca}
                vigor={vigor}
                atributoChaveEa={atributoChaveEa}
                passivasAtributosAtivos={passivasAtributosAtivos}
                passivasAtributosConfig={passivasAtributosConfig}
                onChangeAgilidade={setAgilidade}
                onChangeForca={setForca}
                onChangeIntelecto={setIntelecto}
                onChangePresenca={setPresenca}
                onChangeVigor={setVigor}
                onChangeAtributoChaveEa={setAtributoChaveEa}
                onTogglePassivaAtributo={togglePassivaAtributo}
                onChangePassivaConfig={setPassivasAtributosConfig}
                todasPericias={pericias}
                todasProficiencias={proficiencias}
                tiposGrau={tiposGrau}
                profsFinaisCodigos={profsFinaisCodigos}
                nome={nome}
                classeId={classeId}
                origemId={origemId}
                claId={claId}
                tecnicaInataId={tecnicaInataId}
                trilhaId={trilhaId}
                caminhoId={caminhoId}
                estudouEscolaTecnica={estudouEscolaTecnica}
                periciasClasseEscolhidasCodigos={periciasClasseEscolhidasCodigos}
                periciasOrigemEscolhidasCodigos={periciasOrigemEscolhidasCodigos}
                periciasLivresCodigos={periciasLivresCodigos}
                graus={graus}
                prestigioBase={prestigioBase}
                prestigioClaBase={prestigioClaBase}
                idade={idade}
                alinhamentoId={alinhamentoId}
                background={background}
              />
            </>
          )}

          {step === 6 && (
            <>
              <SectionTitle>Perícias</SectionTitle>
              <PersonagemBaseStepPericias
                classes={classes}
                origens={origens}
                todasPericias={pericias}
                classeId={classeId}
                origemId={origemId}
                claId={claId}
                tecnicaInataId={tecnicaInataId}
                trilhaId={trilhaId}
                caminhoId={caminhoId}
                nivel={nivel}
                estudouEscolaTecnica={estudouEscolaTecnica}
                periciasClasseEscolhidasCodigos={periciasClasseEscolhidasCodigos}
                periciasOrigemEscolhidasCodigos={periciasOrigemEscolhidasCodigos}
                periciasLivresCodigos={periciasLivresCodigos}
                periciasLivresExtras={periciasLivresExtras}
                agilidade={agilidade}
                forca={forca}
                intelecto={intelecto}
                presenca={presenca}
                vigor={vigor}
                atributoChaveEa={atributoChaveEa}
                graus={graus}
                nome={nome}
                prestigioBase={prestigioBase}
                prestigioClaBase={prestigioClaBase}
                idade={idade}
                alinhamentoId={alinhamentoId}
                background={background}
                poderesGenericos={poderesGenericos}
                passivasAtributosConfig={passivasAtributosConfig}
                passivasAtributosAtivos={passivasAtributosAtivos}
                onChangePericiasLivres={setPericiasLivresCodigos}
                onChangePericiasLivresExtras={setPericiasLivresExtras}
              />
            </>
          )}

          {step === 7 && (
            <>
              <SectionTitle>Graus de aprimoramento</SectionTitle>
              <PersonagemBaseStepGrausAprimoramento
                tiposGrau={tiposGrau}
                valores={graus}
                onChangeValor={handleGrauChange}
                nivel={nivel}
                estudouEscolaTecnica={estudouEscolaTecnica}
                trilhaNome={trilhaSelecionada?.nome ?? null}
                nome={nome}
                classeId={classeId}
                origemId={origemId}
                claId={claId}
                tecnicaInataId={tecnicaInataId}
                trilhaId={trilhaId}
                caminhoId={caminhoId}
                agilidade={agilidade}
                forca={forca}
                intelecto={intelecto}
                presenca={presenca}
                vigor={vigor}
                atributoChaveEa={atributoChaveEa}
                periciasClasseEscolhidasCodigos={periciasClasseEscolhidasCodigos}
                periciasOrigemEscolhidasCodigos={periciasOrigemEscolhidasCodigos}
                periciasLivresCodigos={periciasLivresCodigos}
                prestigioBase={prestigioBase}
                prestigioClaBase={prestigioClaBase}
                idade={idade}
                alinhamentoId={alinhamentoId}
                background={background}
                passivasAtributosConfig={passivasAtributosConfig}
              />
            </>
          )}

          {step === 8 && (
            <>
              <SectionTitle>Graus de treinamento</SectionTitle>
              <PersonagemBaseStepGrausTreinamento
                nome={nome}
                nivel={nivel}
                classeId={classeId}
                origemId={origemId}
                claId={claId}
                tecnicaInataId={tecnicaInataId}
                trilhaId={trilhaId}
                caminhoId={caminhoId}
                agilidade={agilidade}
                forca={forca}
                intelecto={intelecto}
                presenca={presenca}
                vigor={vigor}
                estudouEscolaTecnica={estudouEscolaTecnica}
                atributoChaveEa={atributoChaveEa}
                periciasClasseEscolhidasCodigos={periciasClasseEscolhidasCodigos}
                periciasOrigemEscolhidasCodigos={periciasOrigemEscolhidasCodigos}
                periciasLivresCodigos={periciasLivresCodigos}
                graus={graus}
                prestigioBase={prestigioBase}
                prestigioClaBase={prestigioClaBase}
                idade={idade}
                alinhamentoId={alinhamentoId}
                background={background}
                grausTreinamento={grausTreinamento}
                onChangeGrausTreinamento={setGrausTreinamento}
                todasPericias={pericias}
                poderesGenericos={poderesGenericos}
                passivasAtributosConfig={passivasAtributosConfig}
              />
            </>
          )}

          {step === 9 && (
            <>
              <SectionTitle>Inventário</SectionTitle>
              <PersonagemBaseStepInventario
                forca={forca}
                prestigioBase={prestigioBase}
                itensInventario={itensInventario}
                onChangeItensInventario={setItensInventario}
              />
            </>
          )}

          {step === 10 && (
            <>
              <SectionTitle>Poderes genéricos</SectionTitle>
              <PersonagemBaseStepPoderes
                nivel={nivel}
                poderesGenericos={poderesGenericos}
                onTogglePoderGenerico={togglePoderGenerico}
                addPoderGenericoInstancia={addPoderGenericoInstancia}
                removePoderGenericoInstancia={removePoderGenericoInstancia}
                updatePoderGenericoInstancia={updatePoderGenericoInstancia}
                nome={nome}
                classeId={classeId}
                origemId={origemId}
                claId={claId}
                tecnicaInataId={tecnicaInataId}
                trilhaId={trilhaId}
                caminhoId={caminhoId}
                estudouEscolaTecnica={estudouEscolaTecnica}
                agilidade={agilidade}
                forca={forca}
                intelecto={intelecto}
                presenca={presenca}
                vigor={vigor}
                atributoChaveEa={atributoChaveEa}
                graus={graus}
                prestigioBase={prestigioBase}
                prestigioClaBase={prestigioClaBase}
                idade={idade}
                alinhamentoId={alinhamentoId}
                background={background}
                periciasClasseEscolhidasCodigos={periciasClasseEscolhidasCodigos}
                periciasOrigemEscolhidasCodigos={periciasOrigemEscolhidasCodigos}
                periciasLivresCodigos={periciasLivresCodigos}
                grausTreinamento={grausTreinamento}
                todasPericias={pericias}
                tiposGrau={tiposGrau}
                passivasAtributosConfig={passivasAtributosConfig}
                passivasAtributosAtivos={passivasAtributosAtivos}
              />
            </>
          )}

          {step === 11 && (
            <>
              <SectionTitle>Revisão final</SectionTitle>
              <PersonagemBaseStepRevisao
                preview={
                  (previewPayload ?? ({} as unknown as CreatePersonagemBasePayload))
                }
                classes={classes}
                origens={origens}
                clas={clas}
                trilhas={trilhas}
                caminhos={caminhos}
                tecnicasInatas={tecnicasInatas}
                alinhamentos={alinhamentos}
                todasPericias={pericias}
                equipamentos={equipamentos}
                modificacoes={modificacoes}
              />
            </>
          )}
        </div>

        {erro && (
          <div className="p-4 rounded-lg border border-app-danger/30 bg-app-danger/5">
            <div className="flex items-start gap-2 text-sm text-app-danger">
              <Icon name="warning" className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span>{erro}</span>
            </div>
          </div>
        )}

        <div className="flex justify-between pt-4 border-t border-app-border">
          <Button
            type="button"
            variant="secondary"
            disabled={submitting || loadingStep}
            onClick={handlePrev}
          >
            {mode === 'edit' && step === 1 ? 'Cancelar' : 'Voltar'}
          </Button>

          {step < MAX_STEP ? (
            <Button
              type="button"
              disabled={submitting || loadingStep || !canNext}
              onClick={handleNext}
            >
              {loadingStep ? (
                <>
                  <Icon name="spinner" className="w-4 h-4 animate-spin mr-2" />
                  Avançando...
                </>
              ) : (
                <>
                  Avançar
                  {!canNext && (
                    <span className="ml-2 text-xs opacity-75">(Complete o step atual)</span>
                  )}
                </>
              )}
            </Button>
          ) : (
            <Button
              type="button"
              disabled={submitting || loadingStep || !previewPayload}
              onClick={handleFinalSubmit}
            >
              {submitting ? (
                <>
                  <Icon name="spinner" className="w-4 h-4 animate-spin mr-2" />
                  {mode === 'edit' ? 'Salvando...' : 'Criando...'}
                </>
              ) : (
                <>
                  <Icon name="check" className="w-4 h-4 mr-2" />
                  {mode === 'edit' ? 'Salvar alterações' : 'Criar personagem-base'}
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}
