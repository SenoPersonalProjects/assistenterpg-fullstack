// components/personagem-base/wizard/PersonagemBaseStepRevisao.tsx
'use client';

import { useState, useEffect, useMemo, useRef } from 'react';

import {
  ApiError,
  apiPreviewPersonagemBase,
  apiGetPassivasDisponiveis,
  apiGetPoderesGenericos,
  extrairMensagemErro,
  traduzirErro,
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
  EquipamentoCatalogo,
  ModificacaoCatalogo,
} from '@/lib/api';

import {
  getGrauXamaPorPrestigio,
  getLimiteCreditoComBonus,
  getNivelPrestigioCla,
} from '@/lib/utils/prestigio';
import { getNomeGrau } from '@/lib/utils/pericias';
import { normalizarCategoria } from '@/lib/utils/inventario';
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
  equipamentos: EquipamentoCatalogo[];
  modificacoes: ModificacaoCatalogo[];
};

const ATRIBUTO_LABEL: Record<AtributoBaseCodigo, string> = {
  AGI: 'Agilidade',
  FOR: 'Força',
  INT: 'Intelecto',
  PRE: 'Presença',
  VIG: 'Vigor',
};

function getValorAtributo(preview: Props['preview'], atributo: AtributoBaseCodigo): number {
  let valor: number;
  switch (atributo) {
    case 'AGI':
      valor = preview.agilidade;
      break;
    case 'FOR':
      valor = preview.forca;
      break;
    case 'INT':
      valor = preview.intelecto;
      break;
    case 'PRE':
      valor = preview.presenca;
      break;
    case 'VIG':
      valor = preview.vigor;
      break;
    default:
      valor = 0;
  }

  return Number.isFinite(valor) ? valor : 0;
}

type PoderGenericoPreview = PoderGenericoInstanciaPayload & {
  nome: string;
  descricao?: string | null;
};

type InventarioErroExtraido = {
  mensagens: string[];
  errosItens: string[];
  espacos: {
    ocupados: number;
    total: number;
    sobrecarregado?: boolean;
    restantes?: number;
  } | null;
};

function collectStringMessages(value: unknown, acc: string[]) {
  if (typeof value === 'string') {
    if (value.trim()) acc.push(value.trim());
    return;
  }

  if (Array.isArray(value)) {
    for (const item of value) {
      collectStringMessages(item, acc);
    }
    return;
  }

  const record = asRecord(value);
  if (!record) return;
  for (const item of Object.values(record)) {
    collectStringMessages(item, acc);
  }
}

function extractDetailsFallbackMessages(details: unknown): string[] {
  const parsed = asRecord(details);
  if (!parsed) return extractStringArray(details);

  const messages: string[] = [];
  for (const [key, value] of Object.entries(parsed)) {
    if (key === 'errosItens') continue;
    collectStringMessages(value, messages);
  }
  return messages;
}

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  return value as Record<string, unknown>;
}

function toFiniteNumber(value: unknown): number | null {
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

function toSafeNumber(value: unknown, fallback = 0): number {
  const n = toFiniteNumber(value);
  return n === null ? fallback : n;
}

function extractStringArray(value: unknown): string[] {
  if (typeof value === 'string') return [value];
  if (!Array.isArray(value)) return [];

  return value
    .map((item) => {
      if (typeof item === 'string') return item;
      const record = asRecord(item);
      if (!record) return null;
      return (
        (typeof record.mensagem === 'string' && record.mensagem) ||
        (typeof record.message === 'string' && record.message) ||
        (typeof record.erro === 'string' && record.erro) ||
        null
      );
    })
    .filter((item): item is string => Boolean(item));
}

function extractErrosItens(value: unknown): string[] {
  if (!Array.isArray(value)) return [];

  return value
    .map((item) => {
      if (typeof item === 'string') return item;
      const record = asRecord(item);
      if (!record) return null;

      const index =
        toFiniteNumber(record.index) ??
        toFiniteNumber(record.indice) ??
        toFiniteNumber(record.itemIndex);
      const equipamentoId = toFiniteNumber(record.equipamentoId);
      const mensagem =
        (typeof record.mensagem === 'string' && record.mensagem) ||
        (typeof record.message === 'string' && record.message) ||
        (typeof record.erro === 'string' && record.erro) ||
        null;

      if (!mensagem) return null;

      const prefixos: string[] = [];
      if (index !== null) prefixos.push(`Item #${index + 1}`);
      if (equipamentoId !== null) prefixos.push(`Equipamento ${equipamentoId}`);

      if (prefixos.length === 0) return mensagem;
      return `${prefixos.join(' - ')}: ${mensagem}`;
    })
    .filter((item): item is string => Boolean(item));
}

function extractPrimaryMessage(value: unknown): string | null {
  if (typeof value === 'string' && value.trim()) return value.trim();
  if (!Array.isArray(value)) return null;

  for (const item of value) {
    if (typeof item === 'string' && item.trim()) return item.trim();

    const record = asRecord(item);
    if (!record) continue;

    const nested =
      (typeof record.mensagem === 'string' && record.mensagem) ||
      (typeof record.message === 'string' && record.message) ||
      (typeof record.erro === 'string' && record.erro) ||
      null;

    if (nested && nested.trim()) return nested.trim();
  }

  return null;
}

function extractInventarioErros(details: unknown): InventarioErroExtraido {
  const parsed = asRecord(details);
  if (!parsed) {
    return {
      mensagens: [],
      errosItens: [],
      espacos: null,
    };
  }

  const mensagens = [
    ...extractStringArray(parsed.errosInventario),
    ...extractStringArray(parsed.inventarioErros),
    ...extractStringArray(parsed.inventario),
  ];

  const errosItens = extractErrosItens(parsed.errosItens);

  const espacosRaw =
    asRecord(parsed.espacosInventario) ??
    asRecord(parsed.inventarioEspacos) ??
    asRecord(parsed.espacos);
  const ocupados = toFiniteNumber(espacosRaw?.ocupados ?? espacosRaw?.espacosOcupados);
  const total = toFiniteNumber(espacosRaw?.total ?? espacosRaw?.espacosTotal);
  const restantes = toFiniteNumber(espacosRaw?.restantes ?? espacosRaw?.espacosDisponiveis);
  const sobrecarregado =
    typeof espacosRaw?.sobrecarregado === 'boolean' ? espacosRaw.sobrecarregado : undefined;

  return {
    mensagens,
    errosItens,
    espacos:
      ocupados !== null && total !== null
        ? {
            ocupados,
            total,
            restantes: restantes ?? undefined,
            sobrecarregado,
          }
        : null,
  };
}

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
  const [errosInventarioPreview, setErrosInventarioPreview] = useState<string[]>([]);
  const [errosInventarioItensPreview, setErrosInventarioItensPreview] = useState<string[]>([]);
  const [espacosInventarioErro, setEspacosInventarioErro] = useState<{
    ocupados: number;
    total: number;
    sobrecarregado?: boolean;
    restantes?: number;
  } | null>(null);

  const [poderesGenericosCatalogo, setPoderesGenericosCatalogo] = useState<
    PoderGenericoCatalogo[]
  >([]);

  const [secaoAberta, setSecaoAberta] = useState<Record<string, boolean>>({});

  const reqPreviewRef = useRef(0);
  const reqPassivasRef = useRef(0);

  // Carrega o catálogo de poderes para resolução de nomes no resumo.
  useEffect(() => {
    if (!token) return;

    (async () => {
      try {
        const poderes = await apiGetPoderesGenericos();
        setPoderesGenericosCatalogo(poderes);
      } catch {
      }
    })();
  }, [token]);

  // Normaliza o payload para chamada de preview.
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

    // Normaliza itens de inventário antes de enviar ao preview.
    const itensInventarioSanitizados =
      preview.itensInventario && preview.itensInventario.length > 0
        ? preview.itensInventario.map((item) => ({
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

    return normalizado;
  }, [preview]);

  const previewJson = useMemo(() => JSON.stringify(previewNormalizado), [previewNormalizado]);

  // Atualiza o preview da revisão quando os dados mudam.
  useEffect(() => {
    if (!token) return;

    const reqId = ++reqPreviewRef.current;

    queueMicrotask(() => {
      setCarregando(true);
      setErro(null);
      setPassivasElegiveisConflito([]);
      setErrosInventarioPreview([]);
      setErrosInventarioItensPreview([]);
      setEspacosInventarioErro(null);
    });

    apiPreviewPersonagemBase(previewNormalizado)
      .then((resultado) => {
        if (reqId !== reqPreviewRef.current) return;

        setPreviewCalculado(resultado);
        setErrosInventarioPreview(resultado.errosInventario ?? []);
        setErrosInventarioItensPreview(extractErrosItens(resultado.errosItens));

        const ocupados = toFiniteNumber(resultado.espacosInventario?.ocupados);
        const total = toFiniteNumber(resultado.espacosInventario?.total);
        const restantes = toFiniteNumber(resultado.espacosInventario?.restantes);

        if (ocupados !== null && total !== null) {
          setEspacosInventarioErro({
            ocupados,
            total,
            restantes: restantes ?? undefined,
            sobrecarregado: resultado.espacosInventario?.sobrecarregado,
          });
        }

        if (resultado.passivasNeedsChoice) {
          setPassivasElegiveisConflito(resultado.passivasElegiveis ?? []);
        }
      })
      .catch((err) => {
        if (reqId !== reqPreviewRef.current) return;


        if (err instanceof ApiError) {
          const inventario = extractInventarioErros(err.body?.details);
          const detailsFallback = extractDetailsFallbackMessages(err.body?.details);
          const backendMessage = extractPrimaryMessage(err.body?.message);
          const codeMessage = traduzirErro(
            err.body?.code,
            backendMessage ?? extrairMensagemErro(err),
          );

          setErrosInventarioPreview(inventario.mensagens);
          setErrosInventarioItensPreview(inventario.errosItens);
          setEspacosInventarioErro(inventario.espacos);

          const elegiveis = Array.isArray(err.body?.details?.elegiveis)
            ? (err.body.details.elegiveis as AtributoBaseCodigo[])
            : [];
          setPassivasElegiveisConflito(elegiveis);

          const mensagemOrdenada =
            inventario.errosItens[0] ??
            inventario.mensagens[0] ??
            detailsFallback[0] ??
            codeMessage;

          setErro(mensagemOrdenada || 'Erro ao gerar preview');
        } else {
          setErro(extrairMensagemErro(err) || 'Erro ao gerar preview');
        }

        setPreviewCalculado(null);
      })
      .finally(() => {
        if (reqId !== reqPreviewRef.current) return;
        setCarregando(false);
      });
  }, [token, previewJson, previewNormalizado]);

  // Carrega passivas selecionadas para exibição no resumo.
  const passivasAtributoIds = useMemo(
    () => previewCalculado?.passivasAtributoIds ?? [],
    [previewCalculado?.passivasAtributoIds],
  );

  useEffect(() => {
    if (!token || passivasAtributoIds.length === 0) {
      queueMicrotask(() => setPassivasSelecionadas([]));
      return;
    }

    const reqId = ++reqPassivasRef.current;

    (async () => {
      try {
        const todasPassivas = await apiGetPassivasDisponiveis();
        if (reqId !== reqPassivasRef.current) return;

        const ids = new Set(passivasAtributoIds);
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
      } catch {
        if (reqId !== reqPassivasRef.current) return;
        setPassivasSelecionadas([]);
      }
    })();
  }, [token, passivasAtributoIds]);

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
  const tecnicaInataHabilidades = tecnicaInata?.habilidades ?? [];
  const resumoTecnicaInataHabilidades =
    tecnicaInataHabilidades.length > 0
      ? tecnicaInataHabilidades
          .slice(0, 3)
          .map((habilidade) => habilidade.nome)
          .join(', ')
      : 'Nenhuma habilidade cadastrada';

  const habilidadesOrigem =
    origem?.habilidadesIniciais ?? origem?.habilidadesOrigem?.map((r) => r.habilidade) ?? [];
  const habilidadesClasse = classe?.habilidadesIniciais ?? [];

  const grauXama = getGrauXamaPorPrestigio(preview.prestigioBase ?? 0);
  const creditoBonus = previewCalculado?.creditoCategoriaBonus ?? 0;
  const limiteCredito = getLimiteCreditoComBonus(grauXama.grau, creditoBonus);
  const nivelPrestigioCla =
    preview.prestigioClaBase != null ? getNivelPrestigioCla(preview.prestigioClaBase) : null;

  const atributoChaveNome =
    {
      INT: 'Intelecto',
      PRE: 'Presença',
    }[preview.atributoChaveEa] ?? preview.atributoChaveEa;

  const passivasAtivosParaMostrar =
    previewCalculado?.passivasAtributosAtivos ?? preview.passivasAtributosAtivos ?? [];

  // Usa dados calculados pelo backend para o resumo de inventário.
  const inventarioInfo = (() => {
    if (!previewCalculado?.espacosInventario || !previewCalculado?.itensInventario) {
      return null;
    }

    const itens = previewCalculado.itensInventario;
    const espacosTotal = toFiniteNumber(previewCalculado.espacosInventario.total);
    const espacosOcupados = toFiniteNumber(previewCalculado.espacosInventario.ocupados);
    if (espacosTotal === null || espacosOcupados === null) {
      return null;
    }

    const espacosRestantesCalculado = toFiniteNumber(
      previewCalculado.espacosInventario.restantes,
    );
    const espacosRestantes =
      espacosRestantesCalculado ?? espacosTotal - espacosOcupados;
    const totalItens = itens.reduce((sum, item) => sum + toSafeNumber(item.quantidade), 0);
    const sobrecarregado =
      typeof previewCalculado.espacosInventario.sobrecarregado === 'boolean'
        ? previewCalculado.espacosInventario.sobrecarregado
        : espacosOcupados > espacosTotal;

    const limitesRaw = previewCalculado.espacosInventario.limitesPorCategoria ?? null;
    const itensRaw = previewCalculado.espacosInventario.itensPorCategoria ?? null;

    const limitesPorCategoria = limitesRaw
      ? Object.entries(limitesRaw).reduce<Record<string, number>>((acc, [categoria, limite]) => {
          const key = normalizarCategoria(categoria);
          const valor = toSafeNumber(limite, 0);
          acc[key] = Math.max(acc[key] ?? 0, valor);
          return acc;
        }, {})
      : null;

    const itensPorCategoria = itensRaw
      ? Object.entries(itensRaw).reduce<Record<string, number>>((acc, [categoria, quantidade]) => {
          const key = normalizarCategoria(categoria);
          acc[key] = (acc[key] ?? 0) + toSafeNumber(quantidade, 0);
          return acc;
        }, {})
      : null;

    return {
      itens,
      espacosTotal,
      espacosOcupados,
      espacosRestantes,
      totalItens,
      sobrecarregado,
      limitesPorCategoria,
      itensPorCategoria,
    };
  })();

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

        {(errosInventarioPreview.length > 0 ||
          errosInventarioItensPreview.length > 0 ||
          espacosInventarioErro) && (
          <SectionCard
            title="Erros de inventário"
            right={<Icon name="briefcase" className="h-5 w-5 text-app-danger" />}
            contentClassName="space-y-2 text-xs"
          >
            {espacosInventarioErro && (
              <p className="text-app-muted">
                Espaços ocupados: {espacosInventarioErro.ocupados}/{espacosInventarioErro.total}
                {typeof espacosInventarioErro.restantes === 'number'
                  ? ` (restantes: ${espacosInventarioErro.restantes})`
                  : ''}
                {espacosInventarioErro.sobrecarregado ? ' - sobrecarregado' : ''}
              </p>
            )}
            {errosInventarioPreview.map((msg, index) => (
              <p key={`erro-inv-${index}`} className="text-app-danger">
                • {msg}
              </p>
            ))}
            {errosInventarioItensPreview.map((msg, index) => (
              <p key={`erro-item-${index}`} className="text-app-danger/90">
                • {msg}
              </p>
            ))}
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

  const formatarConfigPoder = (config: unknown) => {
    const configRecord = asRecord(config);
    if (!configRecord || Object.keys(configRecord).length === 0) return null;

    const items: string[] = [];

    if (configRecord.periciasCodigos && Array.isArray(configRecord.periciasCodigos)) {
      const nomes = configRecord.periciasCodigos
        .map((codigo) => {
          const codigoStr = String(codigo);
          const pericia = todasPericias.find((p) => p.codigo === codigoStr);
          return pericia ? `${pericia.nome} (${codigoStr})` : codigoStr;
        })
        .join(', ');
      items.push(`Perícias: ${nomes}`);
    }

    if (typeof configRecord.tipoGrauCodigo === 'string') {
      items.push(`Tipo de grau: ${configRecord.tipoGrauCodigo}`);
    }

    if (configRecord.proficiencias && Array.isArray(configRecord.proficiencias)) {
      items.push(`Proficiências: ${configRecord.proficiencias.join(', ')}`);
    }

    return items.length > 0 ? items : null;
  };

  const extrairPericiasConfig = (config: unknown) => {
    const configRecord = asRecord(config);
    if (!configRecord || !Array.isArray(configRecord.periciasCodigos)) return [];
    return configRecord.periciasCodigos
      .map((codigo) => {
        const codigoStr = String(codigo);
        const pericia = todasPericias.find((p) => p.codigo === codigoStr);
        return pericia ? { codigo: codigoStr, nome: pericia.nome } : { codigo: codigoStr, nome: codigoStr };
      })
      .filter((p) => p.codigo);
  };

  const extrairTipoGrauConfig = (config: unknown) => {
    const configRecord = asRecord(config);
    if (!configRecord || typeof configRecord.tipoGrauCodigo !== 'string') return null;
    const codigo = configRecord.tipoGrauCodigo;
    return codigo;
  };

  const temErrosInventario =
    errosInventarioPreview.length > 0 || errosInventarioItensPreview.length > 0;
  const temErros = precisaEscolherPassivas || temErrosInventario;
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

          {temErrosInventario && (
            <div className="flex items-start gap-2">
              <Icon name="briefcase" className="w-4 h-4 text-app-danger mt-0.5" />
              <div>
                <p className="font-medium text-app-danger">
                  O inventário possui inconsistências para este preview.
                </p>
                {espacosInventarioErro && (
                  <p className="text-app-muted mt-1">
                    Espaços: {espacosInventarioErro.ocupados}/{espacosInventarioErro.total}
                    {typeof espacosInventarioErro.restantes === 'number'
                      ? ` (restantes: ${espacosInventarioErro.restantes})`
                      : ''}
                    {espacosInventarioErro.sobrecarregado ? ' - sobrecarregado' : ''}
                  </p>
                )}
                {errosInventarioPreview.map((msg, idx) => (
                  <p key={`status-inv-${idx}`} className="text-app-muted mt-1">
                    • {msg}
                  </p>
                ))}
                {errosInventarioItensPreview.map((msg, idx) => (
                  <p key={`status-item-${idx}`} className="text-app-muted mt-1">
                    • {msg}
                  </p>
                ))}
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
        <InfoTile label="Limite de crédito" value={limiteCredito} />

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
        contentClassName="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3"
      >
        <InfoTile label="Técnica inata" value={tecnicaInata?.nome ?? 'Nenhuma'} />
        <InfoTile
          label="Pacote inato"
          value={`${tecnicaInataHabilidades.length} habilidade(s)`}
          valueClassName="font-medium"
          right={
            tecnicaInata ? (
              <Badge color="blue" size="sm">
                Ativo
              </Badge>
            ) : undefined
          }
        />
        <InfoTile
          label="Estudou na Escola Técnica"
          value={preview.estudouEscolaTecnica ? 'Sim' : 'Não'}
          right={
            <Badge color={preview.estudouEscolaTecnica ? 'green' : 'red'} size="sm">
              {preview.estudouEscolaTecnica ? '✓' : '✗'}
            </Badge>
          }
        />
        {tecnicaInata ? (
          <InfoTile
            label="Habilidades em destaque"
            value={
              tecnicaInataHabilidades.length > 3
                ? `${resumoTecnicaInataHabilidades} (+${tecnicaInataHabilidades.length - 3})`
                : resumoTecnicaInataHabilidades
            }
            valueClassName="font-normal"
          />
        ) : null}
      </SectionCard>

      {/* INVENTÁRIO - SEMPRE EXIBIR */}
      <SectionCard
        title="Inventário"
        right={<Icon name="briefcase" className="h-5 w-5 text-app-muted" />}
        contentClassName="space-y-3"
      >
        {!inventarioInfo ? (
          <ErrorAlert message="Prévia do inventário indisponível. Volte ao passo Inventário e tente novamente." />
        ) : (
          <>
            <div className="grid gap-2.5 sm:grid-cols-2">
          <InfoTile
            label="Capacidade de carga"
            value={`${inventarioInfo.espacosOcupados} / ${inventarioInfo.espacosTotal}`}
            right={
              <Badge
                color={
                  inventarioInfo.sobrecarregado ? 'red' : 'green'
                }
                size="sm"
              >
                {inventarioInfo.espacosTotal > 0
                  ? Math.round(
                    (inventarioInfo.espacosOcupados / inventarioInfo.espacosTotal) * 100,
                  )
                  : 0}
                %
              </Badge>
            }
          />
          <InfoTile
            label="Total de itens"
            value={inventarioInfo.totalItens}
          />
          <InfoTile
            label="Espaços restantes"
            value={inventarioInfo.espacosRestantes}
          />
          <InfoTile
            label="Estado"
            value={inventarioInfo.sobrecarregado ? 'Sobrecarregado' : 'Dentro do limite'}
            right={
              <Badge color={inventarioInfo.sobrecarregado ? 'red' : 'green'} size="sm">
                {inventarioInfo.sobrecarregado ? 'Alerta' : 'OK'}
              </Badge>
            }
          />
        </div>

        {inventarioInfo.limitesPorCategoria && inventarioInfo.itensPorCategoria && (
          <div className="pt-2 border-t border-app-border">
            <p className="text-xs font-medium text-app-fg mb-2">Limites por categoria</p>
            <div className="grid gap-2 sm:grid-cols-2">
              {Object.entries(inventarioInfo.limitesPorCategoria).map(([categoria, limite]) => {
                const usado = inventarioInfo.itensPorCategoria?.[categoria] ?? 0;
                const excedeu = usado > limite;
                return (
                  <div
                    key={categoria}
                    className="flex items-center justify-between rounded border border-app-border bg-app-elevated px-2 py-1"
                  >
                    <span className="text-xs text-app-muted">{categoria}</span>
                    <span className={`text-xs font-medium ${excedeu ? 'text-app-danger' : 'text-app-fg'}`}>
                      {usado}/{limite}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

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
          </>
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
              {passivasSelecionadas.map((passiva) => {
                const efeitosPassiva = asRecord(passiva.efeitos);
                const entradasEfeitos = efeitosPassiva ? Object.entries(efeitosPassiva) : [];

                return (
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
                    {entradasEfeitos.length > 0 && (
                      <div className="pt-1.5 border-t border-app-border/50">
                        <ul className="space-y-0.5 text-[10px] text-app-muted">
                          {entradasEfeitos.map(([key, value]) => (
                            <li key={key} className="flex items-center justify-between">
                              <span>{key}</span>
                              <span className="font-medium text-app-success">+{String(value)}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                );
              })}
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
            const configFormatada = formatarConfigPoder(instancia.config);
            const periciasConfig = extrairPericiasConfig(instancia.config);
            const tipoGrauConfig = extrairTipoGrauConfig(instancia.config);

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
                  {(periciasConfig.length > 0 || tipoGrauConfig) && (
                    <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                      {periciasConfig.map((pericia) => (
                        <Badge key={`pericia-${pericia.codigo}`} size="sm" color="blue">
                          {pericia.nome}
                        </Badge>
                      ))}
                      {tipoGrauConfig && (
                        <Badge size="sm" color="purple">
                          Grau: {tipoGrauConfig}
                        </Badge>
                      )}
                    </div>
                  )}
                  {(periciasConfig.length > 0 || tipoGrauConfig) && (
                    <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                      {periciasConfig.map((pericia) => (
                        <Badge key={`pericia-${pericia.codigo}`} size="sm" color="blue">
                          {pericia.nome}
                        </Badge>
                      ))}
                      {tipoGrauConfig && (
                        <Badge size="sm" color="purple">
                          Grau: {tipoGrauConfig}
                        </Badge>
                      )}
                    </div>
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
