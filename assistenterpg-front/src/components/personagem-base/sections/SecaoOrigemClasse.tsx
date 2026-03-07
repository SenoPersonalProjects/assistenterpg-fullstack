'use client';

import { Icon } from '@/components/ui/Icon';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { HabilidadesIniciaisSection } from '@/components/personagem-base/sections/HabilidadesIniciaisSection';
import type { PersonagemBaseDetalhe, HabilidadeCatalogo } from '@/lib/api';

type SecaoOrigemClasseProps = {
  personagem: PersonagemBaseDetalhe;
  habilidadesIniciaisOrigem: HabilidadeCatalogo[];
  habilidadesIniciaisClasse: HabilidadeCatalogo[];
};

export function SecaoOrigemClasse({
  personagem,
  habilidadesIniciaisOrigem,
  habilidadesIniciaisClasse,
}: SecaoOrigemClasseProps) {
  return (
    <div className="space-y-6">
      {/* Habilidades Iniciais */}
      <HabilidadesIniciaisSection origem={habilidadesIniciaisOrigem} classe={habilidadesIniciaisClasse} />

      {/* Grid: Graus Aprimoramento + Proficiências */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Graus de Aprimoramento */}
        <div className="p-6 rounded-lg border border-app-border bg-app-surface">
          <div className="flex items-center gap-2 mb-4">
            <Icon name="chart-up" className="w-5 h-5 text-app-success" />
            <span className="font-semibold text-app-fg text-lg">Graus de Aprimoramento</span>
          </div>

          {!personagem.grausAprimoramento || personagem.grausAprimoramento.length === 0 ? (
            <EmptyState
              variant="card"
              icon="chart"
              title="Sem graus distribuídos"
              description="Nenhum grau de aprimoramento foi distribuído."
            />
          ) : (
            <div className="space-y-3">
              <div className="text-xs text-app-muted mb-3 p-2 rounded bg-app-bg/50">
                Valores totais incluindo bônus de habilidades
              </div>
              {personagem.grausAprimoramento
                .filter((g) => g.valorTotal > 0)
                .map((g) => {
                  const showBonus = g.bonus > 0;
                  return (
                    <div
                      key={g.tipoGrauCodigo}
                      className="flex items-center justify-between p-4 rounded-lg bg-app-bg border border-app-border hover:border-app-primary/30 transition-colors"
                    >
                      <div className="flex-1">
                        <div className="text-sm font-semibold text-app-fg">
                          {g.tipoGrauNome ?? g.tipoGrauCodigo}
                        </div>
                        {showBonus && (
                          <div className="text-xs text-app-muted mt-1 flex items-center gap-1">
                            <span>{g.valorLivre} distribuídos</span>
                            <span className="text-app-warning font-medium">+ {g.bonus} bônus</span>
                          </div>
                        )}
                      </div>
                      <Badge color="green" size="sm">
                        {g.valorTotal}
                      </Badge>
                    </div>
                  );
                })}
            </div>
          )}
        </div>

        {/* Proficiências */}
        <div className="p-6 rounded-lg border border-app-border bg-app-surface">
          <div className="flex items-center gap-2 mb-4">
            <Icon name="tag" className="w-5 h-5 text-app-purple" />
            <span className="font-semibold text-app-fg text-lg">Proficiências</span>
          </div>

          {personagem.proficiencias.length === 0 ? (
            <EmptyState
              variant="card"
              icon="tag"
              title="Sem proficiências"
              description="Nenhuma proficiência foi atribuída."
            />
          ) : (
            <div className="flex flex-wrap gap-2">
              {personagem.proficiencias.map((p) => (
                <div
                  key={p.codigo}
                  className="px-3 py-1.5 rounded-full border border-app-border bg-app-bg text-xs text-app-fg hover:border-app-primary/50 transition-colors"
                  title={[p.tipo, p.categoria, p.subtipo].filter(Boolean).join(' / ')}
                >
                  {p.nome}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
