'use client';

import { Icon } from '@/components/ui/Icon';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { SectionCard } from '@/components/ui/SectionCard';
import { PoderesGenericosSection } from '@/components/personagem-base/sections/PoderesGenericosSection';
import { TrainingGradesSection } from '@/components/personagem-base/sections/TrainingGradesSection';
import {
  AREA_EFEITO_LABELS,
  TIPO_EXECUCAO_LABELS,
  type AreaEfeito,
  type TipoExecucao,
} from '@/lib/types';
import type {
  PersonagemBaseDetalhe,
  PericiaCatalogo,
  TecnicaAmaldicoadaCatalogo,
} from '@/lib/api';

type Habilidade = {
  id: number;
  nome: string;
  tipo: string;
  descricao?: string | null;
};

type SecaoPoderesProps = {
  personagem: PersonagemBaseDetalhe;
  periciasMap: Map<string, { nome: string }>;
  tiposGrauMap: Map<string, string>;
};

type TecnicaHabilidade = NonNullable<TecnicaAmaldicoadaCatalogo['habilidades']>[number];

const HABILITY_TYPES = {
  RECURSO_CLASSE: 'Recurso de Classe',
  PODER_GENERICO: 'Poderes Genericos',
  ORIGEM: 'Habilidades de Origem',
  TRILHA: 'Habilidades de Trilha',
  CAMINHO: 'Habilidades de Caminho',
  INATA: 'Tecnica Inata',
  OUTRO: 'Outras Habilidades',
} as const;

function formatExecucao(value: string | null | undefined): string | null {
  if (!value) return null;
  const key = value as TipoExecucao;
  return TIPO_EXECUCAO_LABELS[key] ?? value;
}

function formatArea(value: string | null | undefined): string | null {
  if (!value) return null;
  const key = value as AreaEfeito;
  return AREA_EFEITO_LABELS[key] ?? value;
}

function formatRequisitos(value: unknown): string[] {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return [];

  const requisitos = value as Record<string, unknown>;
  const linhas: string[] = [];

  const graus = requisitos.graus;
  if (Array.isArray(graus)) {
    for (const grau of graus) {
      if (!grau || typeof grau !== 'object' || Array.isArray(grau)) continue;
      const g = grau as Record<string, unknown>;
      const tipo = String(g.tipoGrauCodigo ?? '').trim();
      const minimo = Number(g.valorMinimo);
      if (!tipo || Number.isNaN(minimo)) continue;
      linhas.push(`Grau minimo: ${tipo} ${minimo}`);
    }
  }

  for (const [key, raw] of Object.entries(requisitos)) {
    if (key === 'graus') continue;

    if (typeof raw === 'boolean') {
      linhas.push(`${key}: ${raw ? 'sim' : 'nao'}`);
      continue;
    }

    if (typeof raw === 'number' || typeof raw === 'string') {
      linhas.push(`${key}: ${String(raw)}`);
    }
  }

  return linhas;
}

function HabilidadesTecnicaList({
  habilidadesTecnica,
}: {
  habilidadesTecnica: TecnicaHabilidade[];
}) {
  if (habilidadesTecnica.length === 0) {
    return (
      <div className="px-4 py-3">
        <p className="text-xs text-app-muted">
          Nenhuma habilidade cadastrada para esta tecnica.
        </p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-app-border">
      {habilidadesTecnica
        .slice()
        .sort((a, b) => a.ordem - b.ordem)
        .map((habilidade) => {
          const requisitos = formatRequisitos(habilidade.requisitos);
          const variacoes = habilidade.variacoes ?? [];

          return (
            <details key={habilidade.id} className="group px-4 py-3">
              <summary className="list-none cursor-pointer">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-app-fg">
                      {habilidade.nome}
                    </p>
                    <p className="mt-1 text-xs text-app-muted">
                      {habilidade.descricao}
                    </p>
                  </div>
                  <Icon
                    name="chevron-down"
                    className="mt-0.5 h-4 w-4 text-app-muted transition-transform group-open:rotate-180"
                  />
                </div>
              </summary>

              <div className="mt-3 space-y-3">
                <div className="flex flex-wrap gap-2">
                  {formatExecucao(habilidade.execucao) && (
                    <Badge color="purple" size="sm">
                      {formatExecucao(habilidade.execucao)}
                    </Badge>
                  )}
                  {habilidade.alcance && (
                    <Badge color="gray" size="sm">
                      Alcance: {habilidade.alcance}
                    </Badge>
                  )}
                  {habilidade.alvo && (
                    <Badge color="gray" size="sm">
                      Alvo: {habilidade.alvo}
                    </Badge>
                  )}
                  {habilidade.duracao && (
                    <Badge color="gray" size="sm">
                      Duracao: {habilidade.duracao}
                    </Badge>
                  )}
                  {formatArea(habilidade.area) && (
                    <Badge color="gray" size="sm">
                      Area: {formatArea(habilidade.area)}
                    </Badge>
                  )}
                  {(habilidade.custoEA > 0 || habilidade.custoPE > 0) && (
                    <Badge color="orange" size="sm">
                      Custo: {habilidade.custoEA} EA / {habilidade.custoPE} PE
                    </Badge>
                  )}
                </div>

                <div className="rounded-md border border-app-border bg-app-surface px-3 py-2">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-app-muted">
                    Efeito
                  </p>
                  <p className="mt-1 text-xs leading-relaxed text-app-fg">
                    {habilidade.efeito}
                  </p>
                </div>

                {requisitos.length > 0 && (
                  <div className="rounded-md border border-app-border bg-app-surface px-3 py-2">
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-app-muted">
                      Requisitos
                    </p>
                    <ul className="mt-1 space-y-1 text-xs text-app-fg">
                      {requisitos.map((linha) => (
                        <li key={linha}>- {linha}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {variacoes.length > 0 && (
                  <div className="rounded-md border border-app-border bg-app-surface px-3 py-2">
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-app-muted">
                      Variacoes
                    </p>
                    <div className="mt-2 space-y-2">
                      {variacoes
                        .slice()
                        .sort((a, b) => a.ordem - b.ordem)
                        .map((variacao) => (
                          <div
                            key={variacao.id}
                            className="rounded border border-app-border bg-app-bg px-3 py-2"
                          >
                            <p className="text-xs font-semibold text-app-fg">
                              {variacao.nome}
                            </p>
                            <p className="mt-1 text-xs text-app-muted">
                              {variacao.descricao}
                            </p>
                            {variacao.efeitoAdicional && (
                              <p className="mt-1 text-xs text-app-fg">
                                {variacao.efeitoAdicional}
                              </p>
                            )}
                          </div>
                        ))}
                    </div>
                  </div>
                )}
              </div>
            </details>
          );
        })}
    </div>
  );
}

export function SecaoPoderes({
  personagem,
  periciasMap,
  tiposGrauMap,
}: SecaoPoderesProps) {
  const habilidades = personagem.habilidades ?? [];

  const periciasMapCompleto = new Map<string, PericiaCatalogo>();
  (personagem.pericias ?? []).forEach((pericia) => {
    periciasMapCompleto.set(pericia.codigo, {
      id: pericia.id,
      codigo: pericia.codigo,
      nome: pericia.nome,
      descricao: null,
      atributoBase: pericia.atributoBase,
      somenteTreinada: pericia.somenteTreinada,
      penalizaPorCarga: pericia.penalizaPorCarga,
      precisaKit: pericia.precisaKit,
    });
  });

  const groupedHabilities = habilidades.reduce((acc, hab) => {
    const tipo = hab.tipo || 'OUTRO';
    if (!acc[tipo]) acc[tipo] = [];
    acc[tipo].push(hab);
    return acc;
  }, {} as Record<string, Habilidade[]>);

  const tecnicasNaoInatasOrdenadas = [...(personagem.tecnicasNaoInatas ?? [])]
    .sort((a, b) => a.nome.localeCompare(b.nome));
  const tecnicaInata = personagem.tecnicaInata;

  return (
    <div className="space-y-6">
      <SectionCard
        title="Tecnica Inata"
        right={<Icon name="technique" className="h-5 w-5 text-app-muted" />}
      >
        {!tecnicaInata ? (
          <EmptyState
            variant="card"
            icon="technique"
            title="Sem tecnica inata"
            description="Este personagem nao possui tecnica inata selecionada."
          />
        ) : (
          <div className="rounded-lg border border-app-border bg-app-bg">
            <div className="border-b border-app-border px-4 py-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h4 className="text-sm font-semibold text-app-fg">
                    {tecnicaInata.nome}
                  </h4>
                  {tecnicaInata.descricao && (
                    <p className="mt-1 text-xs text-app-muted">
                      {tecnicaInata.descricao}
                    </p>
                  )}
                </div>
                <div className="flex flex-wrap items-center justify-end gap-2">
                  <Badge
                    color={tecnicaInata.hereditaria ? 'purple' : 'blue'}
                    size="sm"
                  >
                    {tecnicaInata.hereditaria ? 'Hereditaria' : 'Nao hereditaria'}
                  </Badge>
                  <Badge color="gray" size="sm">
                    {(tecnicaInata.habilidades ?? []).length}{' '}
                    {(tecnicaInata.habilidades ?? []).length === 1
                      ? 'habilidade'
                      : 'habilidades'}
                  </Badge>
                </div>
              </div>
            </div>
            <HabilidadesTecnicaList
              habilidadesTecnica={tecnicaInata.habilidades ?? []}
            />
          </div>
        )}
      </SectionCard>

      <SectionCard
        title="Tecnicas Nao-Inatas"
        right={<Icon name="book" className="h-5 w-5 text-app-muted" />}
      >
        {tecnicasNaoInatasOrdenadas.length === 0 ? (
          <EmptyState
            variant="card"
            icon="book"
            title="Sem tecnicas nao-inatas"
            description="Nenhuma tecnica nao-inata cadastrada no sistema."
          />
        ) : (
          <div className="space-y-4">
            {tecnicasNaoInatasOrdenadas.map((tecnica) => {
              const habilidadesTecnica = tecnica.habilidades ?? [];
              return (
                <div
                  key={tecnica.id}
                  className="rounded-lg border border-app-border bg-app-bg"
                >
                  <div className="border-b border-app-border px-4 py-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h4 className="text-sm font-semibold text-app-fg">
                          {tecnica.nome}
                        </h4>
                        {tecnica.descricao && (
                          <p className="mt-1 text-xs text-app-muted">
                            {tecnica.descricao}
                          </p>
                        )}
                      </div>
                      <Badge color="blue" size="sm">
                        {habilidadesTecnica.length}{' '}
                        {habilidadesTecnica.length === 1
                          ? 'habilidade'
                          : 'habilidades'}
                      </Badge>
                    </div>
                  </div>

                  <HabilidadesTecnicaList habilidadesTecnica={habilidadesTecnica} />
                </div>
              );
            })}
          </div>
        )}
      </SectionCard>

      <SectionCard
        title="Habilidades & Tecnicas do Personagem"
        right={<Icon name="sparkles" className="h-5 w-5 text-app-muted" />}
      >
        {habilidades.length === 0 ? (
          <EmptyState
            variant="card"
            icon="sparkles"
            title="Sem habilidades"
            description="Nenhuma habilidade ou tecnica foi atribuida ao personagem."
          />
        ) : (
          <div className="space-y-6">
            {Object.entries(groupedHabilities).map(([tipo, habs]) => {
              const useSingleColumn = habs.length === 1;

              return (
                <div key={tipo}>
                  <div className="mb-3 flex items-center gap-2">
                    <div className="h-px flex-1 bg-app-border"></div>
                    <h4 className="text-sm font-semibold uppercase tracking-wide text-app-primary">
                      {HABILITY_TYPES[tipo as keyof typeof HABILITY_TYPES] ||
                        tipo}
                    </h4>
                    <div className="h-px flex-1 bg-app-border"></div>
                  </div>

                  <div
                    className={
                      useSingleColumn
                        ? 'grid grid-cols-1 gap-3'
                        : 'grid grid-cols-1 gap-3 md:grid-cols-2'
                    }
                  >
                    {habs.map((hab) => (
                      <div
                        key={hab.id}
                        className="rounded-lg border border-app-border bg-app-bg p-4 transition-colors hover:border-app-primary/30"
                      >
                        <div className="mb-2 flex items-start justify-between gap-2">
                          <h5 className="text-sm font-semibold text-app-fg">
                            {hab.nome}
                          </h5>
                          {hab.tipo === 'PODER_GENERICO' && (
                            <Badge color="purple" size="sm">
                              Poder
                            </Badge>
                          )}
                        </div>
                        {hab.descricao && (
                          <p className="text-xs leading-relaxed text-app-muted">
                            {hab.descricao}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </SectionCard>

      {personagem.poderesGenericos && personagem.poderesGenericos.length > 0 && (
        <div>
          <div className="mb-4 flex items-center gap-2">
            <Icon name="fire" className="h-5 w-5 text-app-warning" />
            <span className="text-lg font-semibold text-app-fg">
              Poderes Genericos (Detalhes)
            </span>
          </div>
          <PoderesGenericosSection
            poderes={personagem.poderesGenericos}
            periciasMap={periciasMap}
            tiposGrauMap={tiposGrauMap}
          />
        </div>
      )}

      <div>
        <div className="mb-4 flex items-center gap-2">
          <Icon name="training" className="h-5 w-5 text-app-success" />
          <span className="text-lg font-semibold text-app-fg">
            Graus de Treinamento
          </span>
        </div>
        <TrainingGradesSection
          grades={personagem.grausTreinamento ?? []}
          skillsMap={periciasMapCompleto}
        />
      </div>
    </div>
  );
}
