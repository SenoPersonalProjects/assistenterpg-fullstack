'use client';

import { Icon } from '@/components/ui/Icon';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { PoderesGenericosSection } from '@/components/personagem-base/sections/PoderesGenericosSection';
import { TrainingGradesSection } from '@/components/personagem-base/sections/TrainingGradesSection';
import type { PersonagemBaseDetalhe, PericiaCatalogo } from '@/lib/api';

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

const HABILITY_TYPES = {
  RECURSO_CLASSE: 'Recurso de Classe',
  PODER_GENERICO: 'Poderes Genéricos',
  ORIGEM: 'Habilidades de Origem',
  TRILHA: 'Habilidades de Trilha',
  CAMINHO: 'Habilidades de Caminho',
  INATA: 'Técnica Inata',
  OUTRO: 'Outras Habilidades',
} as const;

export function SecaoPoderes({ personagem, periciasMap, tiposGrauMap }: SecaoPoderesProps) {
  const habilidades = personagem.habilidades ?? [];

  // Converter perícias do personagem para o formato PericiaCatalogo
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

  // Agrupar habilidades por tipo
  const groupedHabilities = habilidades.reduce((acc, hab) => {
    const tipo = hab.tipo || 'OUTRO';
    if (!acc[tipo]) acc[tipo] = [];
    acc[tipo].push(hab);
    return acc;
  }, {} as Record<string, Habilidade[]>);

  return (
    <div className="space-y-6">
      {/* Habilidades e Técnicas */}
      <div className="p-6 rounded-lg border border-app-border bg-app-surface">
        <div className="flex items-center gap-2 mb-4">
          <Icon name="sparkles" className="w-5 h-5 text-app-primary" />
          <span className="font-semibold text-app-fg text-lg">Habilidades & Técnicas</span>
        </div>

        {habilidades.length === 0 ? (
          <EmptyState
            variant="card"
            icon="sparkles"
            title="Sem habilidades"
            description="Nenhuma habilidade ou técnica foi atribuída."
          />
        ) : (
          <div className="space-y-6">
            {Object.entries(groupedHabilities).map(([tipo, habs]) => {
              // Se houver apenas 1 habilidade, usar layout de coluna única
              const useSingleColumn = habs.length === 1;

              return (
                <div key={tipo}>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="h-px flex-1 bg-app-border"></div>
                    <h4 className="text-sm font-semibold text-app-primary uppercase tracking-wide">
                      {HABILITY_TYPES[tipo as keyof typeof HABILITY_TYPES] || tipo}
                    </h4>
                    <div className="h-px flex-1 bg-app-border"></div>
                  </div>

                  <div
                    className={
                      useSingleColumn
                        ? 'grid grid-cols-1 gap-3'
                        : 'grid grid-cols-1 md:grid-cols-2 gap-3'
                    }
                  >
                    {habs.map((hab) => (
                      <div
                        key={hab.id}
                        className="p-4 rounded-lg border border-app-border bg-app-bg hover:border-app-primary/30 transition-colors"
                      >
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <h5 className="font-semibold text-app-fg text-sm">{hab.nome}</h5>
                          {hab.tipo === 'PODER_GENERICO' && (
                            <Badge color="purple" size="sm">
                              Poder
                            </Badge>
                          )}
                        </div>
                        {hab.descricao && (
                          <p className="text-xs text-app-muted leading-relaxed">{hab.descricao}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Poderes Genéricos (detalhado) */}
      {personagem.poderesGenericos && personagem.poderesGenericos.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Icon name="fire" className="w-5 h-5 text-app-warning" />
            <span className="font-semibold text-app-fg text-lg">Poderes Genéricos (Detalhes)</span>
          </div>
          <PoderesGenericosSection
            poderes={personagem.poderesGenericos}
            periciasMap={periciasMap}
            tiposGrauMap={tiposGrauMap}
          />
        </div>
      )}

      {/* Graus de Treinamento */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Icon name="training" className="w-5 h-5 text-app-success" />
          <span className="font-semibold text-app-fg text-lg">Graus de Treinamento</span>
        </div>
        <TrainingGradesSection grades={personagem.grausTreinamento ?? []} skillsMap={periciasMapCompleto} />
      </div>
    </div>
  );
}
