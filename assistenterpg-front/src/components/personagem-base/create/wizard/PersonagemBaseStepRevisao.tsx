// components/personagem-base/wizard/PersonagemBaseStepRevisao.tsx
'use client';

import { useState, useEffect, useMemo, useRef } from 'react';

import {
  ApiError,
  apiPreviewPersonagemBase,
  apiGetPassivasDisponiveis,
  apiGetPoderesGenericos,
} from '@/lib/api';
import type {
  CreatePersonagemBasePayload,
  PersonagemBasePreview,
  ClasseCatalogo,
  OrigemCatalogo,
  ClaCatalogo,
  TrilhaCatalogo,
  CaminhoCatalogo,
  TecnicaInataCatalogo,
  AlinhamentoCatalogo,
  GrauTreinamento,
  PassivaAtributoCatalogo,
  AtributoBaseCodigo,
  PoderGenericoCatalogo,
  PoderGenericoInstanciaPayload,
  PericiaCatalogo,
} from '@/lib/api';

import { getGrauXamaPorPrestigio, getNivelPrestigioCla } from '@/lib/utils/prestigio';
import { getNomeGrau } from '@/lib/utils/pericias';
import { useAuth } from '@/context/AuthContext';

import { AtributosDerivadosCard } from '../../sections/AtributosDerivadosCard';
import { Loading } from '@/components/ui/Loading';
import { ErrorAlert } from '@/components/ui/ErrorAlert';
import { SectionCard } from '@/components/ui/SectionCard';
import { InfoTile } from '@/components/ui/InfoTile';
import { Badge } from '@/components/ui/Badge';
import { Icon } from '@/components/ui/Icon';

type Props = {
  preview: CreatePersonagemBasePayload & {
    grausTreinamento?: GrauTreinamento[];
  };
  classes: ClasseCatalogo[];
  origens: OrigemCatalogo[];
  clas: ClaCatalogo[];
  trilhas: TrilhaCatalogo[];
  caminhos: CaminhoCatalogo[];
  tecnicasInatas: TecnicaInataCatalogo[];
  alinhamentos: AlinhamentoCatalogo[];
  todasPericias: PericiaCatalogo[];
  equipamentos: any[];
  modificacoes: any[];
};

const ATRIBUTO_LABEL: Record<AtributoBaseCodigo, string> = {
  AGI: 'Agilidade',
  FOR: 'Força',
  INT: 'Intelecto',
  PRE: 'Presença',
  VIG: 'Vigor',
};

function getValorAtributo(preview: Props['preview'], atributo: AtributoBaseCodigo): number {
  switch (atributo) {
    case 'AGI':
      return preview.agilidade;
    case 'FOR':
      return preview.forca;
    case 'INT':
      return preview.intelecto;
    case 'PRE':
      return preview.presenca;
    case 'VIG':
      return preview.vigor;
    default:
      return 0;
  }
}

type PoderGenericoPreview = PoderGenericoInstanciaPayload & {
  nome: string;
  descricao?: string | null;
};

export function PersonagemBaseStepRevisao({
  preview,
  classes,
  origens,
  clas,
  trilhas,
  caminhos,
  tecnicasInatas,
  alinhamentos,
  todasPericias,
}: Props) {
  const { token } = useAuth();

  const [previewCalculado, setPreviewCalculado] = useState<PersonagemBasePreview | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  const [passivasSelecionadas, setPassivasSelecionadas] = useState<PassivaAtributoCatalogo[]>([]);
  const [passivasElegiveisConflito, setPassivasElegiveisConflito] = useState<AtributoBaseCodigo[]>(
    [],
  );

  const [poderesGenericosCatalogo, setPoderesGenericosCatalogo] = useState<
    PoderGenericoCatalogo[]
  >([]);

  const [secaoAberta, setSecaoAberta] = useState<Record<string, boolean>>({});

  const reqPreviewRef = useRef(0);
  const reqPassivasRef = useRef(0);

  // ✅ CORRIGIDO: Remover parâmetro token
  useEffect(() => {
    if (!token) return;

    (async () => {
      try {
        const poderes = await apiGetPoderesGenericos();
        setPoderesGenericosCatalogo(poderes);
      } catch (e) {
        console.error('Erro ao carregar catálogo de poderes genéricos:', e);
      }
    })();
  }, [token]);

  // ✅ SANITIZAR previewNormalizado
  const previewNormalizado = useMemo<
    CreatePersonagemBasePayload & { grausTreinamento?: GrauTreinamento[] }
  >(() => {
    const poderesNormalizados: PoderGenericoInstanciaPayload[] | undefined =
      preview.poderesGenericos && preview.poderesGenericos.length > 0
        ? preview.poderesGenericos.map((inst) => ({
          ...inst,
          config: inst.config ?? {},
        }))
        : undefined;

    // ✅ SANITIZAR itensInventario
    const itensInventarioSanitizados =
      preview.itensInventario && preview.itensInventario.length > 0
        ? preview.itensInventario.map((item: any) => ({
          equipamentoId: item.equipamentoId,
          quantidade: item.quantidade,
          equipado: item.equipado,
          modificacoesIds: item.modificacoesIds || [],
          nomeCustomizado: item.nomeCustomizado || null,
          notas: item.notas || null,
        }))
        : undefined;

    const normalizado: CreatePersonagemBasePayload & {
      grausTreinamento?: GrauTreinamento[];
    } = {
      ...preview,
      poderesGenericos: poderesNormalizados,
      periciasLivresExtras: preview.periciasLivresExtras ?? 0,
      itensInventario: itensInventarioSanitizados,
    };

    console.log('[StepRevisao] Payload sanitizado:', normalizado);

    return normalizado;
  }, [preview]);

  const previewJson = useMemo(() => JSON.stringify(previewNormalizado), [previewNormalizado]);

  // ✅ CORRIGIDO: Remover parâmetro token
  useEffect(() => {
    if (!token) return;

    const reqId = ++reqPreviewRef.current;

    setCarregando(true);
    setErro(null);
    setPassivasElegiveisConflito([]);

    apiPreviewPersonagemBase(previewNormalizado)
      .then((resultado) => {
        if (reqId !== reqPreviewRef.current) return;

        setPreviewCalculado(resultado);

        if (resultado.passivasNeedsChoice) {
          setPassivasElegiveisConflito(resultado.passivasElegiveis ?? []);
        }
      })
      .catch((err) => {
        if (reqId !== reqPreviewRef.current) return;

        console.error('❌ ERRO NO PREVIEW:', err);

        if (err instanceof ApiError && err.status === 422) {
          // ✅ DEPOIS - Opção 1 (usando details)
          const elegiveis = Array.isArray(err.body?.details?.elegiveis)
            ? (err.body.details.elegiveis as AtributoBaseCodigo[])
            : [];
          setPassivasElegiveisConflito(elegiveis);

          const msg =
            elegiveis.length > 0
              ? `Escolha 2 atributos para ativar passivas: ${elegiveis
                .map((a) => ATRIBUTO_LABEL[a] ?? a)
                .join(', ')}.`
              : err.message;

          setErro(msg);
        } else {
          setErro(err?.message ?? 'Erro ao gerar preview');
        }

        setPreviewCalculado(null);
      })
      .finally(() => {
        if (reqId !== reqPreviewRef.current) return;
        setCarregando(false);
      });
  }, [token, previewJson, previewNormalizado]);

  // ✅ CORRIGIDO: Remover parâmetro token
  useEffect(() => {
    if (
      !token ||
      !previewCalculado?.passivasAtributoIds ||
      previewCalculado.passivasAtributoIds.length === 0
    ) {
      setPassivasSelecionadas([]);
      return;
    }

    const reqId = ++reqPassivasRef.current;

    (async () => {
      try {
        const todasPassivas = await apiGetPassivasDisponiveis();
        if (reqId !== reqPassivasRef.current) return;

        const ids = new Set(previewCalculado.passivasAtributoIds ?? []);
        const selecionadas: PassivaAtributoCatalogo[] = [];

        for (const lista of Object.values(todasPassivas)) {
          for (const passiva of lista) {
            if (ids.has(passiva.id)) selecionadas.push(passiva);
          }
        }

        selecionadas.sort((a, b) => {
          if (a.atributo === b.atributo) return a.nivel - b.nivel;
          return a.atributo.localeCompare(b.atributo);
        });

        setPassivasSelecionadas(selecionadas);
      } catch (err) {
        console.error('Erro ao carregar passivas:', err);
        if (reqId !== reqPassivasRef.current) return;
        setPassivasSelecionadas([]);
      }
    })();
  }, [token, previewCalculado?.passivasAtributoIds?.join(',')]);

  const cla = clas.find((c) => c.id === preview.claId);
  const origem = origens.find((o) => o.id === preview.origemId);
  const classe = classes.find((c) => c.id === preview.classeId);
  const trilha = preview.trilhaId ? trilhas.find((t) => t.id === preview.trilhaId) : null;
  const caminho = preview.caminhoId ? caminhos.find((c) => c.id === preview.caminhoId) : null;
  const alinhamento = preview.alinhamentoId
    ? alinhamentos.find((a) => a.id === preview.alinhamentoId)
    : null;
  const tecnicaInata = preview.tecnicaInataId
    ? tecnicasInatas.find((t) => t.id === preview.tecnicaInataId)
    : null;

  const habilidadesOrigem =
    origem?.habilidadesIniciais ?? origem?.habilidadesOrigem?.map((r) => r.habilidade) ?? [];
  const habilidadesClasse = classe?.habilidadesIniciais ?? [];

  const grauXama = getGrauXamaPorPrestigio(preview.prestigioBase ?? 0);
  const nivelPrestigioCla =
    preview.prestigioClaBase != null ? getNivelPrestigioCla(preview.prestigioClaBase) : null;

  const atributoChaveNome =
    {
      INT: 'Intelecto',
      PRE: 'Presença',
    }[preview.atributoChaveEa] ?? preview.atributoChaveEa;

  const passivasAtivosParaMostrar =
    previewCalculado?.passivasAtributosAtivos ?? preview.passivasAtributosAtivos ?? [];

  // ✅ CORRIGIDO: Usar APENAS dados do backend (previewCalculado.itensInventario)
  const inventarioInfo = useMemo(() => {
    if (!previewCalculado?.itensInventario || previewCalculado.itensInventario.length === 0) {
      return {
        itens: [],
        espacosOcupados: 0,
        espacosDisponiveis: previewCalculado?.espacosInventario?.total ?? preview.forca * 5,
      };
    }

    // ✅ CORRIGIDO: usar espacosTotal (não espacosCalculados)
    const espacosOcupados = previewCalculado.itensInventario.reduce(
      (sum, item) => sum + item.espacosTotal,
      0,
    );

    return {
      itens: previewCalculado.itensInventario,
      espacosOcupados,
      // ✅ CORRIGIDO: usar espacosInventario.total (não espacosTotal direto)
      espacosDisponiveis: previewCalculado.espacosInventario?.total ?? preview.forca * 5,
    };
  }, [previewCalculado?.itensInventario, previewCalculado?.espacosInventario, preview.forca]);

  const getIconeTipo = (
    tipo: string,
  ): 'bolt' | 'shield' | 'sparkles' | 'beaker' | 'tools' | 'briefcase' => {
    switch (tipo) {
      case 'ARMA':
        return 'bolt';
      case 'ARMADURA':
      case 'PROTECAO':
        return 'shield';
      case 'ACESSORIO':
        return 'sparkles';
      case 'CONSUMIVEL':
        return 'beaker';
      case 'FERRAMENTA':
      case 'FERRAMENTA_AMALDICOADA':
        return 'tools';
      case 'ITEM_OPERACIONAL':
        return 'briefcase';
      default:
        return 'briefcase';
    }
  };

  if (carregando) {
    return <Loading message="Calculando valores do personagem..." />;
  }

  if (erro) {
    return (
      <div className="space-y-3">
        <ErrorAlert message={erro} />
        {passivasElegiveisConflito.length > 0 && (
          <SectionCard
            title="Conflito de passivas"
            right={<Icon name="warning" className="h-5 w-5 text-app-danger" />}
            contentClassName="space-y-3"
          >
            <div className="text-xs text-app-muted">
              <p className="mb-2 font-medium text-app-fg">Atributos elegíveis para passivas:</p>
              <ul className="list-inside list-disc space-y-1">
                {passivasElegiveisConflito.map((a) => (
                  <li key={a}>
                    {ATRIBUTO_LABEL[a]} ({getValorAtributo(preview, a)})
                  </li>
                ))}
              </ul>
              <p className="mt-2 text-[11px]">
                Volte no passo &quot;Atributos &amp; EA&quot; e selecione exatamente 2 atributos.
              </p>
            </div>
          </SectionCard>
        )}
      </div>
    );
  }

  if (!previewCalculado) {
    return <ErrorAlert message="Aguardando dados calculados..." />;
  }

  const precisaEscolherPassivas = !!previewCalculado.passivasNeedsChoice;

  const poderesPreview: PoderGenericoPreview[] =
    previewCalculado.poderesGenericos?.map(
      (instancia: PoderGenericoInstanciaPayload): PoderGenericoPreview => {
        const catalogo = poderesGenericosCatalogo.find((p) => p.id === instancia.habilidadeId);
        return {
          ...instancia,
          nome: catalogo?.nome ?? `Poder ID ${instancia.habilidadeId}`,
          descricao: catalogo?.descricao ?? null,
        };
      },
    ) ?? [];

  const formatarConfigPoder = (config: any, catalogoPoder?: PoderGenericoCatalogo) => {
    if (!config || Object.keys(config).length === 0) return null;

    const items: string[] = [];

    if (config.periciasCodigos && Array.isArray(config.periciasCodigos)) {
      const nomes = config.periciasCodigos
        .map((codigo: string) => {
          const pericia = todasPericias.find((p) => p.codigo === codigo);
          return pericia ? `${pericia.nome} (${codigo})` : codigo;
        })
        .join(', ');
      items.push(`Perícias: ${nomes}`);
    }

    if (config.tipoGrauCodigo) {
      items.push(`Tipo de grau: ${config.tipoGrauCodigo}`);
    }

    if (config.proficiencias && Array.isArray(config.proficiencias)) {
      items.push(`Proficiências: ${config.proficiencias.join(', ')}`);
    }

    return items.length > 0 ? items : null;
  };

  const temErros = precisaEscolherPassivas;
  const temAvisos = !preview.background || !preview.idade || !preview.alinhamentoId;

  return (
    <div className="space-y-4 text-sm">
      {/* Status */}
      {(temErros || temAvisos) && (
        <SectionCard
          title={temErros ? 'Atenção: pendências obrigatórias' : 'Aviso: campos opcionais'}
          right={
            <Icon
              name="warning"
              className={`h-5 w-5 ${temErros ? 'text-app-danger' : 'text-app-warning'}`}
            />
          }
          className={temErros ? 'border-app-danger/60' : 'border-app-warning/60'}
          contentClassName="space-y-2 text-xs"
        >
          {precisaEscolherPassivas && (
            <div className="flex items-start gap-2">
              <Icon name="error" className="w-4 h-4 text-app-danger mt-0.5" />
              <div>
                <p className="font-medium text-app-danger">
                  É necessário escolher 2 atributos para ativar passivas antes de finalizar.
                </p>
                {previewCalculado.passivasElegiveis && previewCalculado.passivasElegiveis.length > 0 && (
                  <p className="text-app-muted mt-1">
                    Elegíveis:{' '}
                    {previewCalculado.passivasElegiveis.map((a) => ATRIBUTO_LABEL[a]).join(', ')}.
                  </p>
                )}
                <p className="text-app-muted mt-1">
                  Volte no passo &quot;Atributos &amp; EA&quot; e selecione 2 atributos.
                </p>
              </div>
            </div>
          )}

          {temAvisos && !temErros && (
            <div className="flex items-start gap-2">
              <Icon name="info" className="w-4 h-4 text-app-warning mt-0.5" />
              <div>
                <p className="font-medium text-app-warning">Campos opcionais não preenchidos:</p>
                <ul className="list-disc list-inside text-app-muted mt-1 space-y-0.5">
                  {!preview.idade && <li>Idade</li>}
                  {!preview.alinhamentoId && <li>Alinhamento</li>}
                  {!preview.background && <li>Background</li>}
                </ul>
              </div>
            </div>
          )}
        </SectionCard>
      )}

      {!temErros && !temAvisos && (
        <SectionCard
          title="Tudo pronto!"
          right={<Icon name="check" className="h-5 w-5 text-app-success" />}
          className="border-app-success/60"
          contentClassName="text-xs"
        >
          <div className="flex items-center gap-2 text-app-success">
            <Icon name="check" className="w-4 h-4" />
            <p>Todos os dados foram preenchidos corretamente. Você pode finalizar a criação.</p>
          </div>
        </SectionCard>
      )}

      <p className="text-app-muted text-xs">
        Revise todos os dados antes de confirmar. Valores calculados automaticamente pelo sistema.
      </p>

      {/* Informações gerais */}
      <SectionCard
        title="Informações gerais"
        right={<Icon name="info" className="h-5 w-5 text-app-muted" />}
        contentClassName="grid gap-2.5 sm:grid-cols-2"
      >
        <InfoTile label="Nome" value={preview.nome} />
        <InfoTile label="Nível" value={preview.nivel} />
        <InfoTile label="Idade" value={preview.idade ?? 'Não informada'} />
        <InfoTile label="Alinhamento" value={alinhamento?.nome ?? 'Nenhum'} />
        {preview.background && (
          <InfoTile
            className="sm:col-span-2"
            label="Background"
            value={<span className="italic">{preview.background}</span>}
          />
        )}
      </SectionCard>

      {/* Clã, Origem e Classe */}
      <SectionCard
        title="Clã, Origem e Classe"
        right={<Icon name="id" className="h-5 w-5 text-app-muted" />}
        contentClassName="space-y-2.5"
      >
        <div className="grid gap-2.5 sm:grid-cols-2">
          <InfoTile
            label="Clã"
            value={cla?.nome ?? '(não encontrado)'}
            right={
              cla?.grandeCla ? (
                <Badge color="yellow" size="sm">
                  Grande Clã
                </Badge>
              ) : undefined
            }
          />
          <InfoTile label="Origem" value={origem?.nome ?? '(não encontrada)'} />
          <InfoTile label="Classe" value={classe?.nome ?? '(não encontrada)'} />
          <InfoTile label="Trilha" value={trilha?.nome ?? '—'} />
          <InfoTile label="Caminho" value={caminho?.nome ?? '—'} />
        </div>

        {(habilidadesOrigem.length > 0 || habilidadesClasse.length > 0) && (
          <div className="pt-2 border-t border-app-border">
            <button
              type="button"
              onClick={() =>
                setSecaoAberta({ ...secaoAberta, habilidades: !secaoAberta.habilidades })
              }
              className="w-full flex items-center justify-between text-left hover:opacity-70 transition-opacity"
            >
              <span className="text-xs font-medium text-app-fg">
                Habilidades iniciais ({habilidadesOrigem.length + habilidadesClasse.length})
              </span>
              <Icon
                name="chevron-down"
                className={`w-3 h-3 text-app-muted transition-transform ${secaoAberta.habilidades ? 'rotate-180' : ''
                  }`}
              />
            </button>

            {secaoAberta.habilidades && (
              <div className="mt-2 space-y-1.5">
                {habilidadesOrigem.map((h) => (
                  <div
                    key={h.id}
                    className="text-xs p-2 rounded bg-app-elevated border border-app-border"
                  >
                    <span className="font-medium text-app-fg">{h.nome}</span>
                    {h.tipo && <span className="text-app-muted ml-1">({h.tipo})</span>}
                    {h.descricao && (
                      <div className="text-[10px] text-app-muted mt-1">{h.descricao}</div>
                    )}
                  </div>
                ))}
                {habilidadesClasse.map((h) => (
                  <div
                    key={h.id}
                    className="text-xs p-2 rounded bg-app-elevated border border-app-border"
                  >
                    <span className="font-medium text-app-fg">{h.nome}</span>
                    {h.tipo && <span className="text-app-muted ml-1">({h.tipo})</span>}
                    {h.descricao && (
                      <div className="text-[10px] text-app-muted mt-1">{h.descricao}</div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </SectionCard>

      {/* Atributos */}
      <SectionCard
        title="Atributos"
        right={<Icon name="training" className="h-5 w-5 text-app-muted" />}
        contentClassName="space-y-2.5"
      >
        <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
          {(['AGI', 'FOR', 'INT', 'PRE', 'VIG'] as const).map((a) => {
            const valor = getValorAtributo(preview, a);
            return (
              <InfoTile
                key={a}
                label={ATRIBUTO_LABEL[a]}
                value={
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold">{valor}</span>
                  </div>
                }
                valueClassName="font-normal"
              />
            );
          })}
        </div>

        <div className="pt-2 border-t border-app-border">
          <InfoTile label="Atributo-chave de EA" value={atributoChaveNome} />
        </div>
      </SectionCard>

      {/* Derivados */}
      {previewCalculado.atributosDerivados && (
        <AtributosDerivadosCard derivados={previewCalculado.atributosDerivados} />
      )}

      {/* Prestígio */}
      <SectionCard
        title="Prestígio"
        right={<Icon name="star" className="h-5 w-5 text-app-muted" />}
        contentClassName="grid gap-2.5 sm:grid-cols-2"
      >
        <InfoTile
          label="Prestígio geral base"
          value={preview.prestigioBase}
          right={
            <Badge color="yellow" size="sm">
              {grauXama.nome}
            </Badge>
          }
        />
        <InfoTile label="Limite de crédito" value={grauXama.limiteCredito} />

        {preview.prestigioClaBase != null ? (
          <InfoTile
            label="Prestígio de clã base"
            value={preview.prestigioClaBase}
            right={
              nivelPrestigioCla ? (
                <Badge color="blue" size="sm">
                  {nivelPrestigioCla.nome}
                </Badge>
              ) : undefined
            }
          />
        ) : (
          <InfoTile label="Prestígio de clã base" value="—" />
        )}
      </SectionCard>

      {/* Técnica inata */}
      <SectionCard
        title="Técnica inata e escola"
        right={<Icon name="skills" className="h-5 w-5 text-app-muted" />}
        contentClassName="grid gap-2.5 sm:grid-cols-2"
      >
        <InfoTile label="Técnica inata" value={tecnicaInata?.nome ?? 'Nenhuma'} />
        <InfoTile
          label="Estudou na Escola Técnica"
          value={preview.estudouEscolaTecnica ? 'Sim' : 'Não'}
          right={
            <Badge color={preview.estudouEscolaTecnica ? 'green' : 'red'} size="sm">
              {preview.estudouEscolaTecnica ? '✓' : '✗'}
            </Badge>
          }
        />
      </SectionCard>

      {/* ✅ INVENTÁRIO - SEMPRE EXIBIR */}
      <SectionCard
        title="Inventário"
        right={<Icon name="briefcase" className="h-5 w-5 text-app-muted" />}
        contentClassName="space-y-3"
      >
        <div className="grid gap-2.5 sm:grid-cols-2">
          <InfoTile
            label="Capacidade de carga"
            value={`${inventarioInfo.espacosOcupados} / ${inventarioInfo.espacosDisponiveis}`}
            right={
              <Badge
                color={
                  inventarioInfo.espacosOcupados > inventarioInfo.espacosDisponiveis
                    ? 'red'
                    : 'green'
                }
                size="sm"
              >
                {inventarioInfo.espacosDisponiveis > 0
                  ? Math.round(
                    (inventarioInfo.espacosOcupados / inventarioInfo.espacosDisponiveis) * 100,
                  )
                  : 0}
                %
              </Badge>
            }
          />
          <InfoTile
            label="Total de itens"
            value={inventarioInfo.itens.reduce((sum, item) => sum + item.quantidade, 0)}
          />
        </div>

        {inventarioInfo.itens.length === 0 ? (
          <div className="pt-2 border-t border-app-border">
            <p className="text-xs text-app-muted italic">Nenhum item no inventário</p>
          </div>
        ) : (
          <div className="pt-2 border-t border-app-border">
            <button
              type="button"
              onClick={() =>
                setSecaoAberta({ ...secaoAberta, inventario: !secaoAberta.inventario })
              }
              className="w-full flex items-center justify-between text-left hover:opacity-70 transition-opacity"
            >
              <span className="text-xs font-medium text-app-fg">
                Equipamentos ({inventarioInfo.itens.length})
              </span>
              <Icon
                name="chevron-down"
                className={`w-3 h-3 text-app-muted transition-transform ${secaoAberta.inventario ? 'rotate-180' : ''
                  }`}
              />
            </button>

            {secaoAberta.inventario && (
              <div className="mt-2 space-y-2">
                {inventarioInfo.itens.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 rounded border border-app-border bg-app-elevated"
                  >
                    <div className="flex items-start gap-2">
                      <Icon
                        name={getIconeTipo(item.equipamento.tipo)}
                        className="w-4 h-4 text-app-muted mt-0.5 flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-medium text-app-fg">
                            {item.nomeCustomizado || item.equipamento.nome}
                          </span>
                          <Badge color="blue" size="sm">
                            {item.equipamento.tipo}
                          </Badge>
                          {item.equipado && <Badge color="green" size="sm">Equipado</Badge>}
                        </div>

                        <div className="text-[10px] text-app-muted mt-1 flex items-center gap-3">
                          <span>Qtd: {item.quantidade}</span>
                          <span>•</span>
                          <span>{item.espacosPorUnidade} espaço(s)/un</span>
                          <span>•</span>
                          <span className="font-medium">Total: {item.espacosTotal} espaços</span>
                        </div>

                        {item.modificacoes && item.modificacoes.length > 0 && (
                          <div className="mt-1.5 flex flex-wrap gap-1">
                            {item.modificacoes.map((mod) => (
                              <Badge key={mod.id} color="purple" size="sm">
                                {mod.nome}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </SectionCard>

      {/* Passivas de atributos */}
      {(passivasAtivosParaMostrar.length > 0 || passivasSelecionadas.length > 0) && (
        <SectionCard
          title="Passivas de atributos"
          right={<Icon name="sparkles" className="h-5 w-5 text-app-muted" />}
          contentClassName="space-y-2.5"
        >
          {passivasAtivosParaMostrar.length > 0 && (
            <InfoTile
              label="Atributos ativos"
              value={passivasAtivosParaMostrar.map((a) => ATRIBUTO_LABEL[a]).join(', ')}
              right={
                <Badge color="green" size="sm">
                  Ativo
                </Badge>
              }
            />
          )}

          {passivasSelecionadas.length === 0 ? (
            <InfoTile
              label="Passivas aplicadas"
              value={
                <span className="italic">Nenhuma passiva aplicada (ou ainda falta escolher).</span>
              }
              valueClassName="font-normal"
            />
          ) : (
            <div className="grid gap-2.5 sm:grid-cols-2">
              {passivasSelecionadas.map((passiva) => (
                <div
                  key={passiva.id}
                  className="p-2.5 rounded border border-app-border bg-app-elevated space-y-1.5"
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-xs font-medium text-app-fg">{passiva.nome}</span>
                    <Badge color="blue" size="sm">
                      {passiva.atributo} {passiva.nivel === 2 ? 'II' : 'I'}
                    </Badge>
                  </div>
                  <p className="text-[10px] text-app-muted">{passiva.descricao}</p>
                  {passiva.efeitos && Object.keys(passiva.efeitos).length > 0 && (
                    <div className="pt-1.5 border-t border-app-border/50">
                      <ul className="space-y-0.5 text-[10px] text-app-muted">
                        {Object.entries(passiva.efeitos).map(([key, value]) => (
                          <li key={key} className="flex items-center justify-between">
                            <span>{key}</span>
                            <span className="font-medium text-app-success">+{String(value)}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </SectionCard>
      )}

      {/* Graus de aprimoramento */}
      <SectionCard
        title="Graus de aprimoramento"
        right={<Icon name="chart" className="h-5 w-5 text-app-muted" />}
        contentClassName="space-y-2.5"
      >
        {previewCalculado.grausAprimoramento.length === 0 ? (
          <InfoTile
            label="Status"
            value={<span className="italic">Nenhum grau de aprimoramento.</span>}
            valueClassName="font-normal"
          />
        ) : (
          <>
            <div className="grid gap-2.5 sm:grid-cols-2">
              {previewCalculado.grausAprimoramento.map((g) => (
                <InfoTile
                  key={g.tipoGrauCodigo}
                  label={g.tipoGrauNome}
                  value={g.valor}
                  right={
                    <Badge color="green" size="sm">
                      {g.valor}
                    </Badge>
                  }
                />
              ))}
            </div>

            {previewCalculado.bonusHabilidades.length > 0 && (
              <div className="pt-2 border-t border-app-border">
                <button
                  type="button"
                  onClick={() => setSecaoAberta({ ...secaoAberta, bonus: !secaoAberta.bonus })}
                  className="w-full flex items-center justify-between text-left hover:opacity-70 transition-opacity"
                >
                  <span className="text-xs font-medium text-app-fg">
                    Bônus de habilidades ({previewCalculado.bonusHabilidades.length})
                  </span>
                  <Icon
                    name="chevron-down"
                    className={`w-3 h-3 text-app-muted transition-transform ${secaoAberta.bonus ? 'rotate-180' : ''
                      }`}
                  />
                </button>

                {secaoAberta.bonus && (
                  <div className="mt-2 grid gap-2 sm:grid-cols-2">
                    {previewCalculado.bonusHabilidades.map((bonus, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-2 rounded bg-app-elevated border border-app-border"
                      >
                        <div>
                          <div className="text-xs font-medium text-app-fg">
                            {bonus.habilidadeNome}
                          </div>
                          <div className="text-[10px] text-app-muted">{bonus.tipoGrauCodigo}</div>
                        </div>
                        <Badge color="yellow" size="sm">
                          +{bonus.valor}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </SectionCard>

      {/* Graus de treinamento */}
      {preview.grausTreinamento && preview.grausTreinamento.length > 0 && (
        <SectionCard
          title="Graus de treinamento"
          right={<Icon name="training" className="h-5 w-5 text-app-muted" />}
          contentClassName="space-y-2"
        >
          {preview.grausTreinamento.map((gt) => (
            <div key={gt.nivel} className="p-2.5 rounded border border-app-border bg-app-elevated">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-app-fg">Nível {gt.nivel}</span>
                <Badge color="blue" size="sm">
                  {gt.melhorias.length} melhorias
                </Badge>
              </div>

              {gt.melhorias.length > 0 ? (
                <ul className="space-y-1">
                  {gt.melhorias.map((m, idx) => {
                    const pericia = todasPericias.find((p) => p.codigo === m.periciaCodigo);
                    return (
                      <li
                        key={idx}
                        className="text-[10px] text-app-muted flex items-center justify-between"
                      >
                        <span>
                          {pericia?.nome ?? m.periciaCodigo} ({m.periciaCodigo})
                        </span>
                        <span className="text-app-fg">
                          {getNomeGrau(m.grauAnterior)} → {getNomeGrau(m.grauNovo)}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <p className="text-[10px] text-app-muted italic">Nenhuma melhoria</p>
              )}
            </div>
          ))}
        </SectionCard>
      )}

      {/* Perícias treinadas */}
      <SectionCard
        title="Perícias treinadas"
        right={<Icon name="list" className="h-5 w-5 text-app-muted" />}
        contentClassName="space-y-2"
      >
        {previewCalculado.pericias.length === 0 ? (
          <InfoTile
            label="Status"
            value={<span className="italic">Nenhuma perícia treinada.</span>}
            valueClassName="font-normal"
          />
        ) : (
          <div className="grid gap-2 sm:grid-cols-2">
            {previewCalculado.pericias.map((p) => (
              <div
                key={p.codigo}
                className="p-2 rounded border border-app-border bg-app-elevated space-y-1"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-app-fg">{p.nome}</span>
                  <Badge color="green" size="sm">
                    +{p.bonusTotal}
                  </Badge>
                </div>
                <div className="text-[10px] text-app-muted flex items-center justify-between">
                  <span>
                    {p.codigo} • {p.atributoBase}
                  </span>
                  <span>Grau {p.grauTreinamento}</span>
                </div>
                {p.bonusExtra > 0 && (
                  <div className="text-[10px] text-app-warning">Bônus adicional: +{p.bonusExtra}</div>
                )}
              </div>
            ))}
          </div>
        )}
      </SectionCard>

      {/* Poderes genéricos */}
      {poderesPreview.length > 0 && (
        <SectionCard
          title="Poderes genéricos"
          right={<Icon name="sparkles" className="h-5 w-5 text-app-primary" />}
          contentClassName="space-y-2"
        >
          {poderesPreview.map((instancia: PoderGenericoPreview, idx: number) => {
            const catalogoPoder = poderesGenericosCatalogo.find(
              (p) => p.id === instancia.habilidadeId,
            );
            const configFormatada = formatarConfigPoder(instancia.config, catalogoPoder);

            return (
              <div
                key={idx}
                className="flex items-start gap-2.5 p-2.5 border border-app-border/50 rounded bg-app-elevated"
              >
                <div className="w-8 h-8 bg-app-primary/10 rounded flex items-center justify-center flex-shrink-0">
                  <Icon name="sparkles" className="h-4 w-4 text-app-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-app-fg text-xs">{instancia.nome}</p>
                  {instancia.descricao && (
                    <p className="text-[10px] text-app-muted mt-1 line-clamp-2">
                      {instancia.descricao}
                    </p>
                  )}
                  {configFormatada && (
                    <ul className="mt-1.5 space-y-0.5 text-[10px] text-app-muted">
                      {configFormatada.map((item, i) => (
                        <li key={i}>• {item}</li>
                      ))}
                    </ul>
                  )}
                </div>
                <Badge color="green" size="sm" className="flex-shrink-0">
                  {idx + 1}
                </Badge>
              </div>
            );
          })}
        </SectionCard>
      )}

      {/* Proficiências */}
      <SectionCard
        title="Proficiências"
        right={<Icon name="tools" className="h-5 w-5 text-app-muted" />}
        contentClassName="space-y-2"
      >
        {previewCalculado.proficiencias.length === 0 ? (
          <InfoTile
            label="Status"
            value={<span className="italic">Nenhuma proficiência.</span>}
            valueClassName="font-normal"
          />
        ) : (
          <div className="grid gap-2 sm:grid-cols-2">
            {previewCalculado.proficiencias.map((p) => (
              <div
                key={p.codigo}
                className="p-2 rounded border border-app-border bg-app-elevated"
              >
                <div className="text-xs font-medium text-app-fg">{p.nome}</div>
                <div className="text-[10px] text-app-muted">
                  {p.tipo} / {p.categoria}
                  {p.subtipo && ` - ${p.subtipo}`}
                </div>
              </div>
            ))}
          </div>
        )}
      </SectionCard>

      {/* Debug */}
      <SectionCard
        title="Debug"
        right={<Icon name="code" className="h-5 w-5 text-app-muted" />}
        contentClassName="space-y-2"
      >
        <details className="rounded border border-app-border bg-app-base p-2">
          <summary className="cursor-pointer text-xs font-medium text-app-fg">
            Ver dados calculados (JSON)
          </summary>
          <pre className="mt-2 max-h-64 overflow-auto text-[10px] text-app-muted">
            {JSON.stringify(previewCalculado, null, 2)}
          </pre>
        </details>
      </SectionCard>
    </div>
  );
}
