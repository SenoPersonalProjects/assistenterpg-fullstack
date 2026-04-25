'use client';

import type { SessaoCampanhaRelatorio } from '@/lib/types';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorAlert } from '@/components/ui/ErrorAlert';
import { Loading } from '@/components/ui/Loading';

type SessionReportPanelProps = {
  relatorio: SessaoCampanhaRelatorio | null;
  loading?: boolean;
  erro?: string | null;
};

function LinhaMetrica({
  label,
  valorSessao,
  valorCombate,
}: {
  label: string;
  valorSessao: number;
  valorCombate: number;
}) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-md border border-app-border bg-app-surface px-3 py-2 text-sm">
      <span className="text-app-muted">{label}</span>
      <span className="text-right font-medium text-app-fg">
        {valorSessao}
        <span className="ml-2 text-xs font-normal text-app-muted">
          Combate: {valorCombate}
        </span>
      </span>
    </div>
  );
}

export function SessionReportPanel({
  relatorio,
  loading = false,
  erro,
}: SessionReportPanelProps) {
  if (loading) {
    return <Loading message="Carregando relatorio..." className="py-8 text-app-fg" />;
  }

  if (erro) {
    return <ErrorAlert message={erro} />;
  }

  if (!relatorio || relatorio.personagens.length === 0) {
    return (
      <EmptyState
        variant="card"
        icon="scroll"
        title="Relatorio indisponivel"
        description="Nenhum dado de relatorio foi encontrado para esta sessao."
      />
    );
  }

  return (
    <div className="space-y-4">
      <Card className="space-y-1">
        <h3 className="text-sm font-semibold text-app-fg">{relatorio.tituloSessao}</h3>
        <p className="text-xs text-app-muted">
          Gerado em {new Date(relatorio.geradoEm).toLocaleString('pt-BR')}
        </p>
      </Card>

      <div className="space-y-4">
        {relatorio.personagens.map((personagem) => (
          <Card key={personagem.personagemSessaoId} className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h4 className="text-base font-semibold text-app-fg">
                  {personagem.nomePersonagem}
                </h4>
                <p className="text-xs text-app-muted">
                  Jogador: {personagem.nomeJogador}
                </p>
              </div>
              <div
                className={`rounded-md px-3 py-1 text-xs font-semibold ${
                  personagem.statusFinal.terminouVivo
                    ? 'bg-app-success/10 text-app-success'
                    : 'bg-app-danger/10 text-app-danger'
                }`}
              >
                {personagem.statusFinal.terminouVivo ? 'Terminou vivo' : 'Nao terminou vivo'}
              </div>
            </div>

            <div className="grid gap-2">
              <LinhaMetrica
                label="Dano recebido"
                valorSessao={personagem.totaisSessao.danoRecebido}
                valorCombate={personagem.totaisCombate.danoRecebido}
              />
              <LinhaMetrica
                label="Rolagens feitas"
                valorSessao={personagem.totaisSessao.rolagensFeitas}
                valorCombate={personagem.totaisCombate.rolagensFeitas}
              />
              <LinhaMetrica
                label="Habilidades usadas"
                valorSessao={personagem.totaisSessao.habilidadesUsadas}
                valorCombate={personagem.totaisCombate.habilidadesUsadas}
              />
              <LinhaMetrica
                label="Entradas em Machucado"
                valorSessao={personagem.totaisSessao.entradasMachucado}
                valorCombate={personagem.totaisCombate.entradasMachucado}
              />
              <LinhaMetrica
                label="Entradas em Perturbado"
                valorSessao={personagem.totaisSessao.entradasPerturbado}
                valorCombate={personagem.totaisCombate.entradasPerturbado}
              />
              <LinhaMetrica
                label="Entradas em Morrendo"
                valorSessao={personagem.totaisSessao.entradasMorrendo}
                valorCombate={personagem.totaisCombate.entradasMorrendo}
              />
              <LinhaMetrica
                label="Entradas em Enlouquecendo"
                valorSessao={personagem.totaisSessao.entradasEnlouquecendo}
                valorCombate={personagem.totaisCombate.entradasEnlouquecendo}
              />
            </div>

            <div className="grid gap-2 sm:grid-cols-2">
              <div className="rounded-md border border-app-border bg-app-surface px-3 py-2 text-sm">
                <span className="text-app-muted">PV final</span>
                <p className="font-medium text-app-fg">
                  {personagem.statusFinal.pvAtual} / {personagem.statusFinal.pvMax}
                </p>
              </div>
              <div className="rounded-md border border-app-border bg-app-surface px-3 py-2 text-sm">
                <span className="text-app-muted">SAN final</span>
                <p className="font-medium text-app-fg">
                  {personagem.statusFinal.sanAtual} / {personagem.statusFinal.sanMax}
                </p>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
